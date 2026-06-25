"""Schema + sanity validation for deposits.json / salak.json.

Used by the orchestrator before writing, and runnable standalone via
``python scraper/scrape.py --validate-only``.
"""

from __future__ import annotations

from jsonschema import Draft202012Validator

VALID_TERMS = {"1", "3", "6", "9", "12", "24", "36", "48", "60", "84", "120"}
RATE_MIN, RATE_MAX = 0.0, 12.0  # % per year sanity bounds for Thai deposits

DEPOSITS_SCHEMA = {
    "type": "object",
    "required": ["updated_at", "banks", "products"],
    "properties": {
        "updated_at": {"type": "string"},
        "banks": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "name_th", "type"],
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "name_th": {"type": "string", "minLength": 1},
                    "type": {"enum": ["commercial", "state"]},
                },
            },
        },
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["id", "bank_id", "product_name", "rates"],
                "properties": {
                    "id": {"type": "string", "minLength": 1},
                    "bank_id": {"type": "string", "minLength": 1},
                    "rates": {
                        "type": "object",
                        "minProperties": 1,
                        "additionalProperties": {"type": "number"},
                    },
                    "minimum_amount": {"type": ["number", "null"]},
                    "max_amount": {"type": ["number", "null"]},
                },
            },
        },
    },
}

SALAK_SCHEMA = {
    "type": "object",
    "required": ["updated_at", "products"],
    "properties": {
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "required": [
                    "id", "bank_id", "product_name", "unit_price",
                    "term_months", "draw_frequency", "units_in_pool", "prize_tiers",
                ],
                "properties": {
                    "unit_price": {"type": "number", "exclusiveMinimum": 0},
                    "term_months": {"type": "number", "exclusiveMinimum": 0},
                    "draw_frequency": {"enum": ["monthly", "quarterly", "yearly"]},
                    "units_in_pool": {"type": "number", "exclusiveMinimum": 0},
                    "redeem_interest_rate": {"type": "number", "minimum": 0},
                    "prize_tiers": {
                        "type": "array",
                        "minItems": 1,
                        "items": {
                            "type": "object",
                            "required": ["name", "amount", "count_per_draw"],
                            "properties": {
                                "amount": {"type": "number", "exclusiveMinimum": 0},
                                "count_per_draw": {"type": "number", "exclusiveMinimum": 0},
                            },
                        },
                    },
                },
            },
        },
    },
}


def validate_deposits(data: dict) -> list[str]:
    """Return a list of error strings (empty == valid)."""
    errors = [
        f"schema: {e.message} at {'/'.join(map(str, e.path))}"
        for e in Draft202012Validator(DEPOSITS_SCHEMA).iter_errors(data)
    ]

    bank_ids = {b["id"] for b in data.get("banks", [])}
    for p in data.get("products", []):
        pid = p.get("id", "?")
        if p.get("bank_id") not in bank_ids:
            errors.append(f"{pid}: bank_id '{p.get('bank_id')}' ไม่อยู่ใน banks")
        for term, rate in (p.get("rates") or {}).items():
            if term not in VALID_TERMS:
                errors.append(f"{pid}: term '{term}' ไม่ใช่ระยะเวลาที่รองรับ")
            if not (RATE_MIN <= rate <= RATE_MAX):
                errors.append(f"{pid}: rate {rate}% ที่ {term} เดือน อยู่นอกช่วง {RATE_MIN}-{RATE_MAX}%")
    return errors


def validate_salak(data: dict) -> list[str]:
    errors = [
        f"schema: {e.message} at {'/'.join(map(str, e.path))}"
        for e in Draft202012Validator(SALAK_SCHEMA).iter_errors(data)
    ]
    for p in data.get("products", []):
        pid = p.get("id", "?")
        pool = p.get("units_in_pool", 0)
        slots = sum(t.get("count_per_draw", 0) for t in p.get("prize_tiers", []))
        if pool and slots > pool:
            errors.append(f"{pid}: จำนวนสลอตรางวัล ({slots}) มากกว่าจำนวนหน่วยในกอง ({pool})")
    return errors
