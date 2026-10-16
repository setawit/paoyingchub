"""Smart Product Contracts (Agent 3) — loan product rules that emit postings.

The contract never moves money itself: it computes amounts and hands balanced
``JournalBatch`` objects to the ``ImmutableLedgerEngine``.

Chart of accounts per contract (``<id>`` = contract_id, ``<cif>`` = customer):
    <id>:LOAN_PRINCIPAL      ASSET      loan receivable
    <id>:ACCRUED_INTEREST    ASSET      interest receivable
    <id>:PENALTY_FEE         ASSET      default-interest receivable
    <id>:LOAN_CLEARING       ASSET      transit, nets to zero
    <cif>:CUSTOMER_CASH      LIABILITY  customer deposit
    BANK:BANK_REVENUE:INTEREST / :PENALTY   REVENUE

Interest (Actual/365):
    daily_precise = to_rate(principal * rate_pct / 100 * days / 365)   # 8 dp
    to_post       = round_currency(SUM(daily_precise)) - already_posted
Carrying the unrounded residual makes day-by-day accrual equal a single bulk
accrual (no satang drift from rounding each day).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Any

from .cif_and_limits import LimitControlService
from .core_ledger import (
    AccountType,
    IdempotencyConflictError,
    ImmutableLedgerEngine,
    JournalBatch,
    PostingInstruction,
    SubAccountBucket,
    round_currency,
    to_rate,
)

DAYS_IN_YEAR = Decimal("365")
ZERO = Decimal("0")

BANK_INTEREST_REVENUE = "BANK:BANK_REVENUE:INTEREST"
BANK_PENALTY_REVENUE = "BANK:BANK_REVENUE:PENALTY"
BANK_TREASURY = "BANK:BANK_TREASURY"


class WaterfallRule(str, Enum):
    STANDARD = "STANDARD"  # Penalty -> Interest -> Principal
    TDR_PRINCIPAL_FIRST = "TDR_PRINCIPAL_FIRST"  # Principal -> Interest -> Penalty


_WATERFALL_ORDER: dict[WaterfallRule, tuple[SubAccountBucket, ...]] = {
    WaterfallRule.STANDARD: (
        SubAccountBucket.PENALTY_FEE,
        SubAccountBucket.ACCRUED_INTEREST,
        SubAccountBucket.LOAN_PRINCIPAL,
    ),
    WaterfallRule.TDR_PRINCIPAL_FIRST: (
        SubAccountBucket.LOAN_PRINCIPAL,
        SubAccountBucket.ACCRUED_INTEREST,
        SubAccountBucket.PENALTY_FEE,
    ),
}


@dataclass(frozen=True)
class LoanContractTerms:
    contract_id: str
    facility_id: str
    normal_rate_pct: Decimal
    penalty_rate_pct: Decimal
    day_count_basis: int = 365
    waterfall_rule: WaterfallRule = WaterfallRule.STANDARD

    def __post_init__(self) -> None:
        if self.day_count_basis != 365:
            raise ValueError("Prototype supports Actual/365 only")
        for name in ("normal_rate_pct", "penalty_rate_pct"):
            if not isinstance(getattr(self, name), Decimal):
                raise TypeError(f"{name} must be Decimal")


@dataclass
class _AccrualState:
    """Unrounded cumulative accrual (8 dp) vs. what has been posted (2 dp)."""

    precise: Decimal = ZERO
    posted: Decimal = ZERO


@dataclass
class LoanSmartContract:
    terms: LoanContractTerms
    ledger: ImmutableLedgerEngine
    limits: LimitControlService
    due_date: date | None = None
    arrears_cleared_on: date | None = None
    _interest: _AccrualState = field(default_factory=_AccrualState)
    _penalty: _AccrualState = field(default_factory=_AccrualState)
    _results: dict[str, tuple[tuple, dict[str, Any]]] = field(default_factory=dict)

    def __post_init__(self) -> None:
        cid = self.terms.contract_id
        facility = self.limits.get_facility(self.terms.facility_id)
        self.acct = {
            SubAccountBucket.LOAN_PRINCIPAL: f"{cid}:LOAN_PRINCIPAL",
            SubAccountBucket.ACCRUED_INTEREST: f"{cid}:ACCRUED_INTEREST",
            SubAccountBucket.PENALTY_FEE: f"{cid}:PENALTY_FEE",
            SubAccountBucket.LOAN_CLEARING: f"{cid}:LOAN_CLEARING",
            SubAccountBucket.CUSTOMER_CASH: f"{facility.cif_id}:CUSTOMER_CASH",
        }
        for bucket, account_id in self.acct.items():
            self.ledger.open_account(account_id, bucket.account_type)
        self.ledger.open_account(BANK_INTEREST_REVENUE, AccountType.REVENUE)
        self.ledger.open_account(BANK_PENALTY_REVENUE, AccountType.REVENUE)
        self.ledger.open_account(BANK_TREASURY, AccountType.ASSET)
        self.limits.link_principal_account(
            self.terms.facility_id, self.acct[SubAccountBucket.LOAN_PRINCIPAL]
        )

    # -- helpers ----------------------------------------------------------
    @property
    def contract_id(self) -> str:
        return self.terms.contract_id

    def balance(self, bucket: SubAccountBucket, as_of: date | None = None) -> Decimal:
        return self.ledger.get_balance(self.acct[bucket], as_of)

    def arrears(self, as_of: date | None = None) -> Decimal:
        """Interest + penalty receivable outstanding."""
        return (self.balance(SubAccountBucket.ACCRUED_INTEREST, as_of)
                + self.balance(SubAccountBucket.PENALTY_FEE, as_of))

    def _replay(self, key: str, fingerprint: tuple) -> dict[str, Any] | None:
        prior = self._results.get(key)
        if prior is None:
            return None
        if prior[0] != fingerprint:
            raise IdempotencyConflictError(f"Key {key!r} reused with different arguments")
        return prior[1]

    def _remember(self, key: str, fingerprint: tuple, result: dict[str, Any]) -> dict[str, Any]:
        self._results[key] = (fingerprint, result)
        return result

    # -- operations -------------------------------------------------------
    def disburse(self, idempotency_key: str, tx_date: date, amount: Decimal,
                 due_date: date) -> dict[str, Any]:
        """Draw down ``amount`` into the customer's deposit account.

        Dr LOAN_PRINCIPAL / Cr LOAN_CLEARING
        Dr LOAN_CLEARING  / Cr CUSTOMER_CASH
        """
        fp = ("disburse", tx_date, amount, due_date)
        if (cached := self._replay(idempotency_key, fp)) is not None:
            return cached
        amount = round_currency(amount)
        self.limits.validate_drawdown(self.terms.facility_id, amount, tx_date)
        a = self.acct
        self.ledger.commit_batch(JournalBatch(
            tx_id=f"DISB-{idempotency_key}",
            idempotency_key=idempotency_key,
            effective_date=tx_date,
            postings=[
                PostingInstruction(a[SubAccountBucket.LOAN_PRINCIPAL],
                                   a[SubAccountBucket.LOAN_CLEARING], amount, "Loan drawdown"),
                PostingInstruction(a[SubAccountBucket.LOAN_CLEARING],
                                   a[SubAccountBucket.CUSTOMER_CASH], amount,
                                   "Credit proceeds to customer"),
            ],
        ))
        self.due_date = due_date
        return self._remember(idempotency_key, fp,
                              {"contract_id": self.contract_id, "disbursed": amount,
                               "due_date": due_date})

    def _accrue(self, state: _AccrualState, rate_pct: Decimal, idempotency_key: str,
                accrual_date: date, days: int, debit_bucket: SubAccountBucket,
                revenue_account: str, memo: str) -> dict[str, Any]:
        principal = self.balance(SubAccountBucket.LOAN_PRINCIPAL, accrual_date)
        increment = to_rate(principal * rate_pct / Decimal("100") * Decimal(days) / DAYS_IN_YEAR)
        new_precise = state.precise + increment
        to_post = round_currency(new_precise) - state.posted
        if to_post > 0:
            self.ledger.commit_batch(JournalBatch(
                tx_id=f"ACCR-{idempotency_key}",
                idempotency_key=idempotency_key,
                effective_date=accrual_date,
                postings=[PostingInstruction(self.acct[debit_bucket], revenue_account,
                                             to_post, memo)],
            ))
            state.posted += to_post
        state.precise = new_precise  # only after a successful commit
        return {"contract_id": self.contract_id, "date": accrual_date, "days": days,
                "principal_base": principal, "precise_increment": increment,
                "posted": max(to_post, ZERO)}

    def accrue_daily_interest(self, idempotency_key: str, accrual_date: date,
                              days: int = 1) -> dict[str, Any]:
        """Accrue normal interest. Dr ACCRUED_INTEREST / Cr BANK_REVENUE."""
        fp = ("interest", accrual_date, days)
        if (cached := self._replay(idempotency_key, fp)) is not None:
            return cached
        result = self._accrue(self._interest, self.terms.normal_rate_pct, idempotency_key,
                              accrual_date, days, SubAccountBucket.ACCRUED_INTEREST,
                              BANK_INTEREST_REVENUE, "Daily interest accrual")
        return self._remember(idempotency_key, fp, result)

    def accrue_penalty(self, idempotency_key: str, accrual_date: date,
                       days: int = 1) -> dict[str, Any]:
        """Accrue default interest on outstanding principal. Dr PENALTY_FEE / Cr BANK_REVENUE."""
        fp = ("penalty", accrual_date, days)
        if (cached := self._replay(idempotency_key, fp)) is not None:
            return cached
        result = self._accrue(self._penalty, self.terms.penalty_rate_pct, idempotency_key,
                              accrual_date, days, SubAccountBucket.PENALTY_FEE,
                              BANK_PENALTY_REVENUE, "Overdue penalty accrual")
        return self._remember(idempotency_key, fp, result)

    def repay(self, idempotency_key: str, tx_date: date, payment_amount: Decimal,
              source_account: str | None = None) -> dict[str, Any]:
        """Allocate a payment across buckets per ``waterfall_rule``.

        For each bucket in order: Dr <source> / Cr <bucket>, capped at the bucket
        balance. Any remainder is returned as ``unapplied`` and not posted.
        """
        fp = ("repay", tx_date, payment_amount, source_account)
        if (cached := self._replay(idempotency_key, fp)) is not None:
            return cached
        if not isinstance(payment_amount, Decimal) or payment_amount <= 0:
            raise ValueError("payment_amount must be a positive Decimal")
        source = source_account or self.acct[SubAccountBucket.CUSTOMER_CASH]
        remaining = round_currency(payment_amount)
        allocation: dict[str, Decimal] = {}
        postings: list[PostingInstruction] = []
        for bucket in _WATERFALL_ORDER[self.terms.waterfall_rule]:
            take = min(remaining, self.balance(bucket, tx_date))
            allocation[bucket.value] = take
            if take > 0:
                postings.append(PostingInstruction(source, self.acct[bucket], take,
                                                   f"Repayment -> {bucket.value}"))
                remaining -= take
        if postings:
            self.ledger.commit_batch(JournalBatch(
                tx_id=f"REPAY-{idempotency_key}", idempotency_key=idempotency_key,
                effective_date=tx_date, postings=postings,
            ))
        if self.arrears(tx_date) == 0:
            self.arrears_cleared_on = tx_date
        result = {"contract_id": self.contract_id, "date": tx_date,
                  "paid": round_currency(payment_amount), "allocation": allocation,
                  "unapplied": remaining}
        return self._remember(idempotency_key, fp, result)
