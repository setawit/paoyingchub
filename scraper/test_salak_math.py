"""Locks the สลาก math (mirrors assets/js/salak.js). Run: python scraper/test_salak_math.py"""

DRAWS_PER_YEAR = {"monthly": 12, "quarterly": 4, "yearly": 1}


def ev_per_unit_per_draw(p):
    total = sum(t["amount"] * t["count_per_draw"] for t in p["prize_tiers"])
    return total / p["units_in_pool"]


def prize_yield_pct(p):
    f = DRAWS_PER_YEAR[p["draw_frequency"]]
    return ev_per_unit_per_draw(p) * f / p["unit_price"] * 100


def total_yield_pct(p):
    return prize_yield_pct(p) + p.get("redeem_interest_rate", 0)


def prize_slots_per_draw(p):
    return sum(t["count_per_draw"] for t in p["prize_tiers"])


def win_prob_per_draw(p, units):
    if units <= 0:
        return 0.0
    p_none = 1 - prize_slots_per_draw(p) / p["units_in_pool"]
    return 1 - p_none ** units


def approx(a, b, tol=1e-9):
    return abs(a - b) < tol


def main():
    # Simple product: pool of 1,000,000 units @ 100฿; one prize of 1,000,000฿/draw, monthly.
    p = {
        "unit_price": 100,
        "draw_frequency": "monthly",
        "units_in_pool": 1_000_000,
        "redeem_interest_rate": 1.0,
        "prize_tiers": [{"name": "x", "amount": 1_000_000, "count_per_draw": 1}],
    }

    # EV per unit per draw = 1,000,000 / 1,000,000 = 1.0 baht
    assert approx(ev_per_unit_per_draw(p), 1.0), ev_per_unit_per_draw(p)
    # prize yield = 1.0 * 12 / 100 * 100 = 12%
    assert approx(prize_yield_pct(p), 12.0), prize_yield_pct(p)
    # total = 12 + 1 = 13%
    assert approx(total_yield_pct(p), 13.0), total_yield_pct(p)
    # 1 slot in 1,000,000; holding 100 units -> p ≈ 1 - (1-1e-6)^100
    expected = 1 - (1 - 1 / 1_000_000) ** 100
    assert approx(win_prob_per_draw(p, 100), expected), win_prob_per_draw(p, 100)
    # zero units -> zero probability
    assert win_prob_per_draw(p, 0) == 0.0

    print("✅ salak math tests passed")


if __name__ == "__main__":
    main()
