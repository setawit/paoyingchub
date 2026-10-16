"""Core Ledger Engine (Agent 1) — Hollow Core, immutable double-entry ledger.

Every satang that moves is recorded as a ``PostingInstruction`` (Dr/Cr) inside a
``JournalBatch``. Nothing is ever updated or deleted: balances are always derived
by summing the append-only journal.

Accounting identity enforced on every batch:
    SUM(Debits) == SUM(Credits)

Normal balance by account type:
    ASSET, EXPENSE                -> balance = Debits  - Credits
    LIABILITY, EQUITY, REVENUE    -> balance = Credits - Debits
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date
from decimal import ROUND_HALF_UP, Decimal
from enum import Enum
from typing import Any

CENT = Decimal("0.01")
RATE_QUANTUM = Decimal("0.00000001")  # 8 dp for rates / intermediate interest


class LedgerError(Exception):
    """Base error for ledger violations."""


class UnbalancedBatchError(LedgerError):
    """Raised when SUM(Debits) != SUM(Credits) or a posting is invalid."""


class IdempotencyConflictError(LedgerError):
    """Raised when an idempotency key is reused with a different payload."""


class UnknownAccountError(LedgerError):
    """Raised when a posting references an account that was never opened."""


def round_currency(val: Decimal) -> Decimal:
    """Round a money amount to 2 dp using ROUND_HALF_UP (satang precision)."""
    if not isinstance(val, Decimal):
        raise TypeError(f"Money must be Decimal, got {type(val).__name__}")
    return val.quantize(CENT, rounding=ROUND_HALF_UP)


def to_rate(val: Decimal) -> Decimal:
    """Normalise a rate / intermediate amount to 8 dp (ROUND_HALF_UP)."""
    if not isinstance(val, Decimal):
        raise TypeError(f"Rate must be Decimal, got {type(val).__name__}")
    return val.quantize(RATE_QUANTUM, rounding=ROUND_HALF_UP)


class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"


DEBIT_NORMAL = frozenset({AccountType.ASSET, AccountType.EXPENSE})


class SubAccountBucket(str, Enum):
    """Sub-ledger buckets and their natural account type."""

    CUSTOMER_CASH = "CUSTOMER_CASH"  # customer deposit (bank liability)
    LOAN_PRINCIPAL = "LOAN_PRINCIPAL"
    ACCRUED_INTEREST = "ACCRUED_INTEREST"
    PENALTY_FEE = "PENALTY_FEE"
    LOAN_CLEARING = "LOAN_CLEARING"  # transit account, nets to zero
    BANK_REVENUE = "BANK_REVENUE"
    BANK_TREASURY = "BANK_TREASURY"

    @property
    def account_type(self) -> AccountType:
        return _BUCKET_TYPES[self]


_BUCKET_TYPES: dict[SubAccountBucket, AccountType] = {
    SubAccountBucket.CUSTOMER_CASH: AccountType.LIABILITY,
    SubAccountBucket.LOAN_PRINCIPAL: AccountType.ASSET,
    SubAccountBucket.ACCRUED_INTEREST: AccountType.ASSET,
    SubAccountBucket.PENALTY_FEE: AccountType.ASSET,
    SubAccountBucket.LOAN_CLEARING: AccountType.ASSET,
    SubAccountBucket.BANK_REVENUE: AccountType.REVENUE,
    SubAccountBucket.BANK_TREASURY: AccountType.ASSET,
}


@dataclass(frozen=True)
class PostingInstruction:
    """One Dr/Cr leg pair. ``amount`` must be a positive Decimal at satang precision."""

    debit_account: str
    credit_account: str
    amount: Decimal
    memo: str = ""

    def __post_init__(self) -> None:
        if not isinstance(self.amount, Decimal):
            raise UnbalancedBatchError("Posting amount must be Decimal (no float)")
        if self.amount <= 0:
            raise UnbalancedBatchError(f"Posting amount must be > 0, got {self.amount}")
        if self.amount != round_currency(self.amount):
            raise UnbalancedBatchError(f"Posting amount must be 2 dp, got {self.amount}")
        if self.debit_account == self.credit_account:
            raise UnbalancedBatchError("Debit and credit account must differ")


@dataclass(frozen=True)
class JournalBatch:
    tx_id: str
    idempotency_key: str
    effective_date: date
    postings: tuple[PostingInstruction, ...]

    def __init__(
        self,
        tx_id: str,
        idempotency_key: str,
        effective_date: date,
        postings: list[PostingInstruction] | tuple[PostingInstruction, ...],
    ) -> None:
        object.__setattr__(self, "tx_id", tx_id)
        object.__setattr__(self, "idempotency_key", idempotency_key)
        object.__setattr__(self, "effective_date", effective_date)
        object.__setattr__(self, "postings", tuple(postings))

    @property
    def total_debits(self) -> Decimal:
        return sum((p.amount for p in self.postings), Decimal("0"))

    @property
    def total_credits(self) -> Decimal:
        return sum((p.amount for p in self.postings), Decimal("0"))

    def fingerprint(self) -> tuple:
        """Payload identity used to detect idempotency-key misuse."""
        return (self.effective_date, self.postings)


@dataclass(frozen=True)
class LedgerEntry:
    """A single side of a posting as stored in the append-only journal."""

    seq: int
    tx_id: str
    effective_date: date
    account_id: str
    debit: Decimal
    credit: Decimal
    memo: str


LedgerListener = Callable[[dict[str, Any]], None]


@dataclass
class ImmutableLedgerEngine:
    """Append-only double-entry ledger with strict idempotency."""

    _accounts: dict[str, AccountType] = field(default_factory=dict)
    _entries: list[LedgerEntry] = field(default_factory=list)
    _batches: dict[str, JournalBatch] = field(default_factory=dict)
    _listeners: list[LedgerListener] = field(default_factory=list)

    # -- accounts ---------------------------------------------------------
    def open_account(self, account_id: str, account_type: AccountType) -> str:
        existing = self._accounts.get(account_id)
        if existing is not None and existing != account_type:
            raise LedgerError(f"Account {account_id} already open as {existing.value}")
        self._accounts[account_id] = account_type
        return account_id

    def account_type(self, account_id: str) -> AccountType:
        try:
            return self._accounts[account_id]
        except KeyError:
            raise UnknownAccountError(account_id) from None

    def subscribe(self, listener: LedgerListener) -> None:
        self._listeners.append(listener)

    # -- posting ----------------------------------------------------------
    def commit_batch(self, batch: JournalBatch) -> bool:
        """Validate and append a batch.

        Returns True when the batch is (or already was) committed. A replay with the
        same idempotency key and identical payload is a no-op; a different payload
        raises ``IdempotencyConflictError``.
        """
        prior = self._batches.get(batch.idempotency_key)
        if prior is not None:
            if prior.fingerprint() != batch.fingerprint():
                raise IdempotencyConflictError(
                    f"Key {batch.idempotency_key!r} reused with different payload"
                )
            return True

        if not batch.postings:
            raise UnbalancedBatchError("Batch has no postings")
        for p in batch.postings:
            self.account_type(p.debit_account)
            self.account_type(p.credit_account)
        if batch.total_debits != batch.total_credits:  # structural guard
            raise UnbalancedBatchError("SUM(Debits) != SUM(Credits)")

        seq = len(self._entries)
        for p in batch.postings:
            self._entries.append(
                LedgerEntry(seq, batch.tx_id, batch.effective_date, p.debit_account,
                            p.amount, Decimal("0"), p.memo)
            )
            self._entries.append(
                LedgerEntry(seq + 1, batch.tx_id, batch.effective_date, p.credit_account,
                            Decimal("0"), p.amount, p.memo)
            )
            seq += 2
        self._batches[batch.idempotency_key] = batch

        event = {
            "event": "LEDGER_POSTED",
            "tx_id": batch.tx_id,
            "idempotency_key": batch.idempotency_key,
            "effective_date": batch.effective_date.isoformat(),
            "postings": [
                {"dr": p.debit_account, "cr": p.credit_account,
                 "amount": str(p.amount), "memo": p.memo}
                for p in batch.postings
            ],
        }
        for listener in self._listeners:
            listener(event)
        return True

    def has_batch(self, idempotency_key: str) -> bool:
        return idempotency_key in self._batches

    # -- queries ----------------------------------------------------------
    def _sides(self, account_id: str, as_of_date: date | None) -> tuple[Decimal, Decimal]:
        self.account_type(account_id)
        dr = cr = Decimal("0")
        for e in self._entries:
            if e.account_id != account_id:
                continue
            if as_of_date is not None and e.effective_date > as_of_date:
                continue
            dr += e.debit
            cr += e.credit
        return dr, cr

    def get_balance(self, account_id: str, as_of_date: date | None = None) -> Decimal:
        """Balance on the account's normal side, optionally as of a date (inclusive)."""
        dr, cr = self._sides(account_id, as_of_date)
        if self.account_type(account_id) in DEBIT_NORMAL:
            return dr - cr
        return cr - dr

    def get_total_debits(self, account_id: str, as_of_date: date | None = None) -> Decimal:
        return self._sides(account_id, as_of_date)[0]

    def get_trial_balance(self, as_of_date: date | None = None) -> dict[str, Any]:
        """Per-account Dr/Cr totals and the global balance check."""
        rows: dict[str, dict[str, Decimal]] = {}
        total_dr = total_cr = Decimal("0")
        for account_id in self._accounts:
            dr, cr = self._sides(account_id, as_of_date)
            rows[account_id] = {"debit": dr, "credit": cr,
                                "balance": self.get_balance(account_id, as_of_date)}
            total_dr += dr
            total_cr += cr
        return {
            "accounts": rows,
            "total_debit": total_dr,
            "total_credit": total_cr,
            "balanced": total_dr == total_cr,
        }

    @property
    def entries(self) -> tuple[LedgerEntry, ...]:
        return tuple(self._entries)
