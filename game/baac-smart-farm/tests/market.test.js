import { describe, it, expect } from 'vitest';
import { updatePrices, defaultPrices, getPriceMultiplier, PRICE_MIN, PRICE_MAX } from '../src/game/Market.js';
import { ACTIVITIES } from '../src/game/Activities.js';

describe('Market', () => {
  it('defaultPrices: ทุกกิจกรรม = 1', () => {
    const p = defaultPrices();
    expect(Object.keys(p)).toHaveLength(ACTIVITIES.length);
    for (const a of ACTIVITIES) expect(p[a.id]).toBe(1);
  });

  it('updatePrices: ทุก multiplier อยู่ในช่วง [PRICE_MIN, PRICE_MAX]', () => {
    const state = {};
    updatePrices(state);
    for (const a of ACTIVITIES) {
      expect(state.marketPrices[a.id]).toBeGreaterThanOrEqual(PRICE_MIN);
      expect(state.marketPrices[a.id]).toBeLessThanOrEqual(PRICE_MAX);
    }
  });

  it('updatePrices: rng ควบคุมได้ (deterministic)', () => {
    const state = {};
    updatePrices(state, () => 0); // ค่าต่ำสุด
    expect(state.marketPrices[ACTIVITIES[0].id]).toBe(PRICE_MIN);
  });

  it('getPriceMultiplier: default 1 เมื่อไม่มีข้อมูล', () => {
    expect(getPriceMultiplier({}, 'chicken')).toBe(1);
  });
});
