"""Source registry.

Add a new automated bank by appending its source class instance to ``REGISTRY``.
Tier-4 (manual) banks are listed so the orchestrator knows they are intentionally
maintained by hand, not missing.
"""

from .example_html import CIMBSource, KKPSource
from .manual import manual

# Automated (Tier 1-3) sources that get fetched on each run.
AUTOMATED = [
    KKPSource(),
    CIMBSource(),
]

# Manual (Tier 4) banks — preserved from the snapshot, never fetched.
MANUAL = [
    manual("scb", "JavaScript-rendered rate page (Tier 3)"),
    manual("kbank", "JavaScript-rendered rate page (Tier 3)"),
    manual("krungsri", "PDF announcement (Tier 2)"),
    manual("bbl", "PDF announcement (Tier 2)"),
    manual("ttb", "JavaScript-rendered rate page (Tier 3)"),
    manual("uob", "PDF announcement (Tier 2)"),
    manual("lhbank", "PDF announcement (Tier 2)"),
    manual("gsb", "PDF announcement (Tier 2)"),
    manual("baac", "PDF announcement (Tier 2)"),
    manual("ghb", "PDF announcement (Tier 2)"),
    manual("exim", "PDF announcement (Tier 2)"),
    manual("ibank", "PDF announcement (Tier 2)"),
]

REGISTRY = AUTOMATED + MANUAL
