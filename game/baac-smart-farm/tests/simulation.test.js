import { describe, it, expect } from 'vitest';
import { simulateTurn } from '../src/game/Simulation.js';
import { createInitialState } from '../src/game/GameState.js';

describe('Simulation.simulateTurn', () => {
  it('รวมค่าจากกิจกรรมที่เลือก (ราคาปกติ = ตรงกับค่าฐาน)', () => {
    const state = createInitialState();
    state.sel = { chicken: 1, worm: 2 };
    const r = simulateTurn(state);
    // chicken: inv9000 labor1 area25 income2700 cost1800 | worm x2: inv6000 labor0.8 area20 income1800 cost500
    expect(r.investment).toBe(9000 + 3000 * 2);
    expect(r.area).toBe(25 + 10 * 2);
    expect(r.income).toBeCloseTo(2700 + 900 * 2, 6);
    expect(r.cost).toBe(1800 + 250 * 2);
    expect(r.labor).toBeCloseTo(1 + 0.4 * 2, 6);
    expect(r.errors).toHaveLength(0);
  });

  it('ราคาตลาดคูณเข้ากับรายได้', () => {
    const state = createInitialState();
    state.sel = { chicken: 1 };
    state.marketPrices = { chicken: 1.5 };
    const r = simulateTurn(state);
    expect(r.income).toBeCloseTo(2700 * 1.5, 6);
  });

  it('พื้นที่เกิน -> error', () => {
    const state = createInitialState();
    state.sel = { veggie: 100 }; // area 10000 > 1600
    const r = simulateTurn(state);
    expect(r.errors).toContain('พื้นที่เกิน');
  });

  it('ทุนไม่พอ -> error', () => {
    const state = createInitialState();
    state.score = 0; // creditLimit = 20000 -> เพดาน 5000 + 20000 = 25000
    state.sel = { melon: 2 }; // investment 50000 > 25000
    const r = simulateTurn(state);
    expect(r.errors).toContain('ทุนไม่พอ');
  });
});
