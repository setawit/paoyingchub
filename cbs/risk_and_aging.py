"""Risk, Aging & TFRS9 (Agent 4).

Aging rule (prototype, per blueprint):
    overdue_days = 0                                   if date <= due_date
                 = 0                                   if no interest/penalty arrears
                 = date - max(due_date, arrears_cleared_on)   otherwise
i.e. the clock resets when interest and penalty are paid in full.

TFRS9 staging by days past due:
    STAGE_1  0-30   performing
    STAGE_2  31-90  under-performing (SICR)
    STAGE_3  > 90   non-performing (NPL)
"""

from __future__ import annotations

import json
from collections.abc import Callable, Iterable
from dataclasses import dataclass, field
from datetime import date, timedelta
from enum import Enum
from typing import Any

from .smart_contracts import LoanSmartContract


class ClockProvider:
    """Deterministic business clock. Business logic never calls ``date.today()``."""

    def __init__(self, start: date) -> None:
        self._today = start

    def today(self) -> date:
        return self._today

    def advance(self, days: int = 1) -> date:
        if days < 0:
            raise ValueError("Clock cannot move backwards")
        self._today += timedelta(days=days)
        return self._today


class Stage(str, Enum):
    STAGE_1 = "STAGE_1"
    STAGE_2 = "STAGE_2"
    STAGE_3 = "STAGE_3"


class EventBus:
    """In-process pub/sub; every event is serialised to JSON."""

    def __init__(self) -> None:
        self._handlers: list[Callable[[str], None]] = []
        self.log: list[str] = []

    def subscribe(self, handler: Callable[[str], None]) -> None:
        self._handlers.append(handler)

    def publish(self, event: dict[str, Any]) -> str:
        payload = json.dumps(event, default=str, ensure_ascii=False, sort_keys=True)
        self.log.append(payload)
        for handler in self._handlers:
            handler(payload)
        return payload

    def events(self, name: str | None = None) -> list[dict[str, Any]]:
        parsed = [json.loads(p) for p in self.log]
        return [e for e in parsed if name is None or e.get("event") == name]


class AgingEngine:
    def evaluate_contract_aging(self, contract: LoanSmartContract, current_date: date) -> int:
        due = contract.due_date
        if due is None or current_date <= due:
            return 0
        if contract.arrears(current_date) == 0:
            return 0
        start = max(due, contract.arrears_cleared_on or due)
        return max((current_date - start).days, 0)


class TFRS9Staging:
    @staticmethod
    def classify(overdue_days: int) -> Stage:
        if overdue_days > 90:
            return Stage.STAGE_3
        if overdue_days > 30:
            return Stage.STAGE_2
        return Stage.STAGE_1


@dataclass
class OverduePenaltyHook:
    """Accrues one day of penalty on outstanding principal while overdue."""

    aging: AgingEngine

    def apply(self, contract: LoanSmartContract, current_date: date) -> dict[str, Any] | None:
        if self.aging.evaluate_contract_aging(contract, current_date) <= 0:
            return None
        return contract.accrue_penalty(
            f"EOD-PEN:{contract.contract_id}:{current_date.isoformat()}", current_date, days=1
        )


@dataclass
class RiskMonitor:
    """End-of-day batch: penalty -> interest -> aging -> staging -> events.

    Idempotency keys are derived from (contract, date), so re-running EOD for the
    same day posts nothing new.
    """

    bus: EventBus
    aging: AgingEngine = field(default_factory=AgingEngine)
    _stages: dict[str, Stage] = field(default_factory=dict)

    def __post_init__(self) -> None:
        self.penalty_hook = OverduePenaltyHook(self.aging)

    def stage_of(self, contract_id: str) -> Stage:
        return self._stages.get(contract_id, Stage.STAGE_1)

    def run_end_of_day(self, contracts: Iterable[LoanSmartContract],
                       business_date: date) -> dict[str, dict[str, Any]]:
        report: dict[str, dict[str, Any]] = {}
        for c in contracts:
            # Penalty is judged on arrears standing at start of day, before today's interest.
            self.penalty_hook.apply(c, business_date)
            c.accrue_daily_interest(
                f"EOD-INT:{c.contract_id}:{business_date.isoformat()}", business_date
            )
            dpd = self.aging.evaluate_contract_aging(c, business_date)
            stage = TFRS9Staging.classify(dpd)
            previous = self.stage_of(c.contract_id)
            if stage is not previous:
                self.bus.publish({"event": "STAGE_CHANGED", "contract_id": c.contract_id,
                                  "date": business_date.isoformat(), "from": previous.value,
                                  "to": stage.value, "overdue_days": dpd})
            self._stages[c.contract_id] = stage
            report[c.contract_id] = {"overdue_days": dpd, "stage": stage}
        return report
