"""Tier-4 manual sources.

Banks whose rates are published as PDF (Tier 2) or rendered by JavaScript (Tier 3)
are represented as manual sources until an automated parser is implemented. The
orchestrator keeps their existing entry from the committed snapshot untouched.
"""

from __future__ import annotations

from .base import BaseSource


class ManualSource(BaseSource):
    tier = 4
    manual = True

    def parse(self, raw: str) -> dict:  # pragma: no cover - never fetched
        raise NotImplementedError("manual source: data maintained in data/deposits.json")


def manual(bank_id: str, note: str = "") -> ManualSource:
    src = ManualSource()
    src.bank_id = bank_id
    src.note = note
    return src
