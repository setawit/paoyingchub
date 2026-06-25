"""Base class for deposit-rate sources.

Tier strategy (from the blueprint):
    Tier 1 — HTML        : rates live in a plain HTML table, parseable with BeautifulSoup.
    Tier 2 — PDF         : rates published as a PDF announcement.
    Tier 3 — JavaScript  : page renders rates client-side (needs Playwright).
    Tier 4 — Manual      : reviewed/entered by staff; data comes from the committed snapshot.

A concrete source subclasses ``BaseSource`` and implements ``parse()``. Sources that are
not yet automatable set ``tier = 4`` and ``manual = True`` so the orchestrator keeps their
snapshot entry untouched.
"""

from __future__ import annotations

import time
import urllib.robotparser
from urllib.parse import urlparse

import requests

USER_AGENT = (
    "DepositIntelBot/0.1 (+https://github.com/setawit/paoyingchub; "
    "non-commercial deposit-rate comparison; contact via repo issues)"
)


class BaseSource:
    #: stable bank id, must match an id in deposits.json `banks`
    bank_id: str = ""
    #: 1=HTML, 2=PDF, 3=JS, 4=manual
    tier: int = 4
    #: when True the orchestrator skips fetching and preserves the snapshot entry
    manual: bool = False
    #: page that publishes the rates
    url: str = ""
    #: polite delay between requests (seconds)
    rate_limit_s: float = 1.0

    def __init__(self, session: requests.Session | None = None):
        self.session = session or requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    # --- robots.txt courtesy check -------------------------------------------------
    def robots_allows(self) -> bool:
        if not self.url:
            return False
        parsed = urlparse(self.url)
        robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
        rp = urllib.robotparser.RobotFileParser()
        try:
            rp.set_url(robots_url)
            rp.read()
        except Exception:
            # If robots.txt is unreachable, be conservative and allow (log upstream).
            return True
        return rp.can_fetch(USER_AGENT, self.url)

    # --- fetch ---------------------------------------------------------------------
    def fetch(self) -> str:
        """Fetch raw HTML (Tier 1). Override for Tier 2/3."""
        if not self.robots_allows():
            raise PermissionError(f"robots.txt disallows fetching {self.url}")
        resp = self.session.get(self.url, timeout=20)
        resp.raise_for_status()
        time.sleep(self.rate_limit_s)
        return resp.text

    # --- parse (subclass responsibility) -------------------------------------------
    def parse(self, raw: str) -> dict:
        """Return ONE normalized product dict (see data/schema.md).

        Expected shape::

            {
              "id": "<bank>-fixed",
              "bank_id": self.bank_id,
              "product_name": str,
              "product_type": "fixed",
              "minimum_amount": int | None,
              "max_amount": int | None,
              "rates": {"3": float, "12": float, ...},   # % per year, term in months
              "conditions": str,
            }
        """
        raise NotImplementedError

    # --- run -----------------------------------------------------------------------
    def run(self) -> dict:
        """Fetch + parse, stamping verified=True and updated_at upstream."""
        raw = self.fetch()
        product = self.parse(raw)
        product["bank_id"] = self.bank_id
        product["verified"] = True
        return product
