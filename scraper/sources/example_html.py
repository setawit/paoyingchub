"""Tier-1 HTML example sources.

These demonstrate the *pattern* for scraping a bank that publishes fixed-deposit
rates in a plain HTML table. Real bank pages change their markup often and several
are JavaScript-rendered (Tier 3) or PDF (Tier 2); when adding a real source, tune
the CSS selectors in ``parse()`` to that page and verify against the live site.

``GenericTableSource`` parses a table whose rows pair a tenor label (e.g. "12 เดือน",
"3 ปี", "24M") with a percentage rate. It maps each tenor to a term-in-months key.
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup

from .base import BaseSource

# Map free-text tenor labels -> term in months (matches data/schema.md rate keys)
_MONTH_WORDS = ("เดือน", "month", "months", "m", "mo")
_YEAR_WORDS = ("ปี", "year", "years", "y", "yr")


def tenor_to_months(label: str) -> int | None:
    """Parse a tenor label like '12 เดือน', '3 ปี', '24M', '5 years' -> months."""
    s = label.strip().lower()
    m = re.search(r"(\d+(?:\.\d+)?)", s)
    if not m:
        return None
    n = float(m.group(1))
    if any(w in s for w in _YEAR_WORDS):
        return int(round(n * 12))
    if any(w in s for w in _MONTH_WORDS):
        return int(round(n))
    return None


def parse_percent(text: str) -> float | None:
    m = re.search(r"(\d+(?:\.\d+)?)\s*%?", text.replace(",", ""))
    return float(m.group(1)) if m else None


class GenericTableSource(BaseSource):
    """Parse a two-column (tenor, rate) HTML table.

    Subclasses set ``bank_id``, ``url``, ``product_name`` and optionally
    ``table_selector`` (CSS) if the page has multiple tables.
    """

    tier = 1
    product_name = "ฝากประจำ"
    minimum_amount = 1000
    conditions = "บุคคลธรรมดา"
    table_selector = "table"
    #: only keep these term keys in the output (None = keep all parsed)
    keep_terms = ("3", "6", "12", "24", "36", "60", "120")

    def parse(self, raw: str) -> dict:
        soup = BeautifulSoup(raw, "html.parser")
        table = soup.select_one(self.table_selector)
        if table is None:
            raise ValueError(f"{self.bank_id}: ไม่พบตารางด้วย selector '{self.table_selector}'")

        rates: dict[str, float] = {}
        for tr in table.select("tr"):
            cells = [td.get_text(" ", strip=True) for td in tr.select("td, th")]
            if len(cells) < 2:
                continue
            months = tenor_to_months(cells[0])
            rate = parse_percent(cells[-1])
            if months is None or rate is None:
                continue
            key = str(months)
            if self.keep_terms and key not in self.keep_terms:
                continue
            rates[key] = rate

        if not rates:
            raise ValueError(f"{self.bank_id}: แยกอัตราดอกเบี้ยจากตารางไม่ได้")

        return {
            "id": f"{self.bank_id}-fixed",
            "bank_id": self.bank_id,
            "product_name": self.product_name,
            "product_type": "fixed",
            "minimum_amount": self.minimum_amount,
            "max_amount": None,
            "rates": rates,
            "conditions": self.conditions,
        }


# --- concrete example registrations ------------------------------------------------
# NOTE: URLs point at each bank's deposit-rate page. Markup/selectors must be verified
# against the live page before enabling in production; until then they remain examples.


class KKPSource(GenericTableSource):
    bank_id = "kkp"
    product_name = "ฝากประจำ KKP"
    url = "https://bank.kkpfg.com/th/personal-banking/deposit/fixed-deposit"


class CIMBSource(GenericTableSource):
    bank_id = "cimb"
    product_name = "ฝากประจำ CIMB"
    url = "https://www.cimbthai.com/th/personal/products/deposits/fixed-deposit.html"
