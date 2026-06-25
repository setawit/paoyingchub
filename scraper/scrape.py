#!/usr/bin/env python3
"""Deposit-rate scraper orchestrator.

Pipeline:  sources -> fetch/parse -> merge with snapshot -> validate -> write JSON

Behaviour:
  * Each automated source is fetched independently; a failure is logged and that
    bank's snapshot entry is preserved (graceful degradation).
  * Manual (Tier 4) banks are always kept from the snapshot.
  * Output is written only if validation passes.

Usage:
  python scraper/scrape.py               # fetch, merge, validate, write
  python scraper/scrape.py --dry-run     # fetch + validate, print, do NOT write
  python scraper/scrape.py --validate-only  # just validate committed JSON
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
DEPOSITS = DATA_DIR / "deposits.json"
SALAK = DATA_DIR / "salak.json"

# Allow `python scraper/scrape.py` from repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sources import AUTOMATED, MANUAL  # noqa: E402
from validate import validate_deposits, validate_salak  # noqa: E402


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def today() -> str:
    return dt.date.today().isoformat()


def scrape_deposits(snapshot: dict) -> tuple[dict, list[str]]:
    """Return (updated_data, log_lines). Snapshot is the source of fallback truth."""
    log: list[str] = []
    products = {p["id"]: p for p in snapshot.get("products", [])}

    for src in AUTOMATED:
        try:
            product = src.run()
            product["updated_at"] = today()
            products[product["id"]] = product
            log.append(f"✓ {src.bank_id}: ดึงสำเร็จ ({len(product['rates'])} ระยะเวลา)")
        except Exception as exc:  # network, robots, parse — keep snapshot entry
            kept = f"{src.bank_id}-fixed" in products
            log.append(
                f"✗ {src.bank_id}: {type(exc).__name__}: {exc} "
                f"({'ใช้ค่าจากสแน็ปช็อต' if kept else 'ไม่มีข้อมูลสำรอง'})"
            )

    for src in MANUAL:
        note = getattr(src, "note", "")
        log.append(f"· {src.bank_id}: manual (Tier 4) — {note}")

    result = dict(snapshot)
    result["updated_at"] = today()
    result["products"] = list(products.values())
    return result, log


def write_if_valid(path: Path, data: dict, errors: list[str], dry_run: bool) -> bool:
    if errors:
        print(f"\n❌ validation ล้มเหลวสำหรับ {path.name}:")
        for e in errors:
            print(f"   - {e}")
        return False
    print(f"\n✅ {path.name} ผ่าน validation ({len(data.get('products', []))} products)")
    if dry_run:
        print(f"   (--dry-run: ไม่เขียนไฟล์)")
        return True
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"   เขียน {path} แล้ว")
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true", help="fetch + validate, do not write")
    ap.add_argument("--validate-only", action="store_true", help="validate committed JSON only")
    args = ap.parse_args()

    deposits = load(DEPOSITS)
    salak = load(SALAK)

    if args.validate_only:
        d_err = validate_deposits(deposits)
        s_err = validate_salak(salak)
        ok = write_if_valid(DEPOSITS, deposits, d_err, dry_run=True) & \
            write_if_valid(SALAK, salak, s_err, dry_run=True)
        return 0 if ok else 1

    print("=== Deposit scraper ===")
    updated, log = scrape_deposits(deposits)
    for line in log:
        print(" ", line)

    d_ok = write_if_valid(DEPOSITS, updated, validate_deposits(updated), args.dry_run)
    # salak is currently maintained manually; just validate it stays consistent.
    s_ok = write_if_valid(SALAK, salak, validate_salak(salak), dry_run=True)

    return 0 if (d_ok and s_ok) else 1


if __name__ == "__main__":
    raise SystemExit(main())
