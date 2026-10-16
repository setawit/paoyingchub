"""QA Auditor suite (Agent 5): precision, balance, idempotency, limits, time travel.

Run:  python -m pytest cbs -q
"""

from __future__ import annotations

import ast
from datetime import date, timedelta
from decimal import Decimal
from pathlib import Path

import pytest

from .cif_and_limits import (
    CreditFacility,
    CustomerCIF,
    FacilityExpiredError,
    FacilityType,
    KycNotActiveError,
    KycStatus,
    LimitControlService,
    LimitExceededError,
)
from .core_ledger import (
    AccountType,
    IdempotencyConflictError,
    ImmutableLedgerEngine,
    JournalBatch,
    PostingInstruction,
    SubAccountBucket,
    UnbalancedBatchError,
    round_currency,
    to_rate,
)
from .risk_and_aging import ClockProvider, EventBus, RiskMonitor, Stage
from .smart_contracts import LoanContractTerms, LoanSmartContract, WaterfallRule

D = Decimal
DAY0 = date(2026, 1, 1)
CBS_DIR = Path(__file__).parent
MODULES = ["core_ledger.py", "cif_and_limits.py", "smart_contracts.py", "risk_and_aging.py"]

P = SubAccountBucket.LOAN_PRINCIPAL
INT = SubAccountBucket.ACCRUED_INTEREST
PEN = SubAccountBucket.PENALTY_FEE


class Bank:
    """Wires the four modules together like a minimal core banking runtime."""

    def __init__(self, rule: WaterfallRule = WaterfallRule.STANDARD,
                 facility_type: FacilityType = FacilityType.REVOLVING,
                 kyc: KycStatus = KycStatus.ACTIVE) -> None:
        self.clock = ClockProvider(DAY0)
        self.bus = EventBus()
        self.ledger = ImmutableLedgerEngine()
        self.ledger.subscribe(self.bus.publish)
        self.limits = LimitControlService(self.ledger)
        self.limits.register_customer(CustomerCIF("CIF001", "นายสมชาย ใจดี", kyc, "B"))
        self.limits.register_facility(CreditFacility(
            "FAC001", "CIF001", facility_type, D("1000000"), DAY0 + timedelta(days=365)))
        self.loan = LoanSmartContract(
            LoanContractTerms("LN001", "FAC001", D("7.5"), D("3"), 365, rule),
            self.ledger, self.limits)
        self.risk = RiskMonitor(self.bus)

    def available(self) -> Decimal:
        return self.limits.get_available_limit("FAC001", self.clock.today())

    def travel_to(self, day: int) -> None:
        """Run EOD for every day up to and including DAY0 + day."""
        while (self.clock.today() - DAY0).days < day:
            self.risk.run_end_of_day([self.loan], self.clock.advance(1))

    def assert_balanced(self) -> None:
        tb = self.ledger.get_trial_balance()
        assert tb["balanced"], tb
        assert tb["total_debit"] == tb["total_credit"]


def scenario_to_day45(rule: WaterfallRule) -> Bank:
    bank = Bank(rule)
    bank.loan.disburse("DISB-1", DAY0, D("500000"), DAY0 + timedelta(days=30))
    bank.travel_to(45)
    return bank


# ---------------------------------------------------------------------------
# Checklist 1: Precision audit
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("module", MODULES)
def test_no_float_in_source(module: str) -> None:
    tree = ast.parse((CBS_DIR / module).read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        assert not (isinstance(node, ast.Constant) and isinstance(node.value, float)), \
            f"float literal in {module}:{node.lineno}"
        assert not (isinstance(node, ast.Name) and node.id == "float"), \
            f"float() used in {module}:{node.lineno}"


@pytest.mark.parametrize("module", MODULES)
def test_no_wall_clock_in_business_logic(module: str) -> None:
    tree = ast.parse((CBS_DIR / module).read_text(encoding="utf-8"))
    banned = {("datetime", "now"), ("datetime", "utcnow"), ("date", "today"), ("time", "time")}
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                and isinstance(node.func.value, ast.Name)):
            call = (node.func.value.id, node.func.attr)
            assert call not in banned, f"{'.'.join(call)}() in {module}:{node.lineno}"


def test_rounding_helpers() -> None:
    assert round_currency(D("1.005")) == D("1.01")
    assert round_currency(D("2.675")) == D("2.68")
    assert round_currency(D("-1.005")) == D("-1.01")
    assert to_rate(D("0.123456785")) == D("0.12345679")
    with pytest.raises(TypeError):
        round_currency(1.005)  # type: ignore[arg-type]


def test_posting_rejects_float_and_sub_satang() -> None:
    with pytest.raises(UnbalancedBatchError):
        PostingInstruction("A", "B", 10.0)  # type: ignore[arg-type]
    with pytest.raises(UnbalancedBatchError):
        PostingInstruction("A", "B", D("10.001"))
    with pytest.raises(UnbalancedBatchError):
        PostingInstruction("A", "B", D("0"))


# ---------------------------------------------------------------------------
# Checklist 2 & 3: Balance + idempotency audit
# ---------------------------------------------------------------------------
def test_ledger_idempotency_and_conflict() -> None:
    ledger = ImmutableLedgerEngine()
    ledger.open_account("A", AccountType.ASSET)
    ledger.open_account("L", AccountType.LIABILITY)
    batch = JournalBatch("T1", "K1", DAY0, [PostingInstruction("A", "L", D("100.00"))])
    assert ledger.commit_batch(batch)
    assert ledger.commit_batch(batch)  # replay is a no-op
    assert ledger.get_balance("A") == D("100.00")
    assert ledger.get_balance("L") == D("100.00")
    assert len(ledger.entries) == 2
    with pytest.raises(IdempotencyConflictError):
        ledger.commit_batch(JournalBatch("T2", "K1", DAY0,
                                         [PostingInstruction("A", "L", D("999.00"))]))


def test_balance_as_of_date() -> None:
    ledger = ImmutableLedgerEngine()
    ledger.open_account("A", AccountType.ASSET)
    ledger.open_account("L", AccountType.LIABILITY)
    ledger.commit_batch(JournalBatch("T1", "K1", DAY0, [PostingInstruction("A", "L", D("10"))]))
    ledger.commit_batch(JournalBatch("T2", "K2", DAY0 + timedelta(days=5),
                                     [PostingInstruction("A", "L", D("5"))]))
    assert ledger.get_balance("A", DAY0 + timedelta(days=4)) == D("10")
    assert ledger.get_balance("A") == D("15")


def test_every_operation_is_idempotent() -> None:
    bank = Bank()
    due = DAY0 + timedelta(days=30)
    r1 = bank.loan.disburse("DISB-1", DAY0, D("500000"), due)
    r2 = bank.loan.disburse("DISB-1", DAY0, D("500000"), due)
    assert r1 == r2
    assert bank.loan.balance(P) == D("500000")

    bank.travel_to(45)
    snapshot = len(bank.ledger.entries)
    bank.risk.run_end_of_day([bank.loan], bank.clock.today())  # re-run same EOD
    assert len(bank.ledger.entries) == snapshot

    a = bank.loan.repay("PAY-1", bank.clock.today(), D("20000"))
    b = bank.loan.repay("PAY-1", bank.clock.today(), D("20000"))
    assert a == b
    assert len(bank.ledger.entries) == snapshot + 6  # 3 postings x 2 sides, once
    with pytest.raises(IdempotencyConflictError):
        bank.loan.repay("PAY-1", bank.clock.today(), D("1"))
    bank.assert_balanced()


def test_clearing_account_nets_to_zero() -> None:
    bank = Bank()
    bank.loan.disburse("DISB-1", DAY0, D("500000"), DAY0 + timedelta(days=30))
    assert bank.ledger.get_balance("LN001:LOAN_CLEARING") == 0
    assert bank.ledger.get_balance("CIF001:CUSTOMER_CASH") == D("500000")
    bank.assert_balanced()


# ---------------------------------------------------------------------------
# Limit controls (Checklist 4: revolving restoration)
# ---------------------------------------------------------------------------
def test_drawdown_validations() -> None:
    due = DAY0 + timedelta(days=30)
    with pytest.raises(KycNotActiveError):
        Bank(kyc=KycStatus.FROZEN).loan.disburse("D", DAY0, D("1"), due)
    with pytest.raises(FacilityExpiredError):
        Bank().loan.disburse("D", DAY0 + timedelta(days=366), D("1"), due)
    bank = Bank()
    with pytest.raises(LimitExceededError):
        bank.loan.disburse("D", DAY0, D("1000000.01"), due)
    assert bank.ledger.entries == ()  # rejected drawdown posts nothing


def test_non_revolving_does_not_restore_limit() -> None:
    bank = Bank(facility_type=FacilityType.NON_REVOLVING)
    bank.loan.disburse("D1", DAY0, D("600000"), DAY0 + timedelta(days=30))
    bank.loan.repay("P1", DAY0, D("600000"))
    assert bank.loan.balance(P) == 0
    assert bank.available() == D("400000")
    with pytest.raises(LimitExceededError):
        bank.loan.disburse("D2", DAY0, D("400000.01"), DAY0 + timedelta(days=30))


# ---------------------------------------------------------------------------
# Time-travel scenario from the blueprint
# ---------------------------------------------------------------------------
def test_day0_disbursement() -> None:
    bank = Bank()
    bank.loan.disburse("DISB-1", DAY0, D("500000"), DAY0 + timedelta(days=30))
    assert bank.loan.balance(P) == D("500000.00")
    assert bank.available() == D("500000.00")
    bank.assert_balanced()


def test_day30_interest_and_stage1() -> None:
    bank = Bank()
    bank.loan.disburse("DISB-1", DAY0, D("500000"), DAY0 + timedelta(days=30))
    bank.travel_to(30)
    # 500,000 x 0.075 x 30 / 365 = 3,082.19 (daily accrual, no rounding drift)
    assert bank.loan.balance(INT) == D("3082.19")
    assert bank.loan.balance(PEN) == 0
    assert bank.risk.stage_of("LN001") is Stage.STAGE_1
    bank.assert_balanced()


def test_day45_interest_and_penalty() -> None:
    bank = scenario_to_day45(WaterfallRule.STANDARD)
    day30_int = bank.loan.balance(INT, DAY0 + timedelta(days=30))
    assert bank.loan.balance(INT) - day30_int == D("1541.10")
    assert bank.loan.balance(INT) == D("4623.29")
    assert bank.loan.balance(PEN) == D("616.44")  # 500,000 x 3% x 15 / 365
    assert bank.loan.arrears_cleared_on is None
    assert bank.risk.aging.evaluate_contract_aging(bank.loan, bank.clock.today()) == 15
    # NOTE: the blueprint text says "Stage 2" here, but its own staging table puts
    # 15 DPD in STAGE_1 (0-30). We follow the table; see cbs/README.md.
    assert bank.risk.stage_of("LN001") is Stage.STAGE_1
    bank.assert_balanced()


def test_day45_repayment_standard_waterfall() -> None:
    bank = scenario_to_day45(WaterfallRule.STANDARD)
    result = bank.loan.repay("PAY-A", bank.clock.today(), D("20000"))
    assert result["allocation"] == {"PENALTY_FEE": D("616.44"),
                                    "ACCRUED_INTEREST": D("4623.29"),
                                    "LOAN_PRINCIPAL": D("14760.27")}
    assert result["unapplied"] == 0
    assert bank.loan.balance(P) == D("485239.73")
    assert bank.loan.arrears(bank.clock.today()) == 0
    assert bank.available() == D("514760.27")
    assert bank.risk.aging.evaluate_contract_aging(bank.loan, bank.clock.today()) == 0
    bank.assert_balanced()


def test_day45_repayment_tdr_principal_first() -> None:
    bank = scenario_to_day45(WaterfallRule.TDR_PRINCIPAL_FIRST)
    result = bank.loan.repay("PAY-B", bank.clock.today(), D("20000"))
    assert result["allocation"] == {"LOAN_PRINCIPAL": D("20000.00"),
                                    "ACCRUED_INTEREST": D("0"),
                                    "PENALTY_FEE": D("0")}
    assert bank.loan.balance(P) == D("480000.00")
    assert bank.available() == D("520000.00")  # revolving limit restored at once
    assert bank.loan.balance(INT) == D("4623.29")
    assert bank.loan.balance(PEN) == D("616.44")
    bank.assert_balanced()


def test_overpayment_is_unapplied_not_posted() -> None:
    bank = Bank()
    bank.loan.disburse("D1", DAY0, D("1000"), DAY0 + timedelta(days=30))
    result = bank.loan.repay("P1", DAY0, D("1500"))
    assert result["allocation"]["LOAN_PRINCIPAL"] == D("1000")
    assert result["unapplied"] == D("500.00")
    assert bank.loan.balance(P) == 0
    bank.assert_balanced()


# ---------------------------------------------------------------------------
# TFRS9 transitions and event stream
# ---------------------------------------------------------------------------
def test_stage_transitions_and_events() -> None:
    bank = Bank()
    bank.loan.disburse("DISB-1", DAY0, D("500000"), DAY0 + timedelta(days=30))
    bank.travel_to(60)  # 30 DPD
    assert bank.risk.stage_of("LN001") is Stage.STAGE_1
    bank.travel_to(61)  # 31 DPD
    assert bank.risk.stage_of("LN001") is Stage.STAGE_2
    bank.travel_to(120)  # 90 DPD
    assert bank.risk.stage_of("LN001") is Stage.STAGE_2
    bank.travel_to(121)  # 91 DPD
    assert bank.risk.stage_of("LN001") is Stage.STAGE_3

    changes = bank.bus.events("STAGE_CHANGED")
    assert [(e["from"], e["to"], e["overdue_days"]) for e in changes] == [
        ("STAGE_1", "STAGE_2", 31), ("STAGE_2", "STAGE_3", 91)]
    assert bank.bus.events("LEDGER_POSTED")
    bank.assert_balanced()


def test_cure_resets_aging_clock() -> None:
    bank = scenario_to_day45(WaterfallRule.STANDARD)
    bank.loan.repay("PAY-A", bank.clock.today(), D("20000"))
    bank.travel_to(50)
    # Arrears re-accrue after cure; DPD counts from the cure date, not the due date.
    assert bank.risk.aging.evaluate_contract_aging(bank.loan, bank.clock.today()) == 5
    bank.assert_balanced()
