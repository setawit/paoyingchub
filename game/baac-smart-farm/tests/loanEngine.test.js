import { describe, it, expect } from 'vitest';
import { calcWCLoan, calcCapExInstallment, calcDSCR, getDSCRClass } from '../src/game/LoanEngine.js';

describe('LoanEngine', () => {
  it('calcWCLoan: ดอกเบี้ย = เงินต้น * 7% * เดือน/12', () => {
    const r = calcWCLoan(10000, 4);
    expect(r.interest).toBeCloseTo((10000 * 0.07 * 4) / 12, 6); // 233.33
    expect(r.total).toBeCloseTo(10233.333, 3);
  });

  it('calcWCLoan: เงินต้น 0 -> ไม่มีดอก', () => {
    const r = calcWCLoan(0);
    expect(r.total).toBe(0);
  });

  it('calcCapExInstallment: remaining 0 -> 0', () => {
    expect(calcCapExInstallment({ principal: 0, remaining: 0, total: 6, months: 4 })).toBe(0);
  });

  it('calcCapExInstallment: ลดต้นลดดอก', () => {
    const inst = calcCapExInstallment({ principal: 25000, remaining: 25000, total: 6, months: 4 });
    expect(inst).toBeCloseTo(25000 / 6 + (25000 * 0.07 * 4) / 12, 4); // 4166.67 + 583.33
  });

  it('calcDSCR: ทุนพอ (ไม่ต้องกู้) -> 999', () => {
    const state = { cash: 100000, sel: { chicken: 1 }, green: false };
    const sim = { investment: 9000, income: 2700 };
    expect(calcDSCR(state, sim)).toBe(999);
  });

  it('calcDSCR: ต้องกู้ WC -> income / total', () => {
    const state = { cash: 5000, sel: { veggie: 1, worm: 1 }, green: false };
    const sim = { investment: 7000, income: 3100 };
    const d = calcDSCR(state, sim);
    const need = 2000;
    const expected = 3100 / (need + (need * 0.07 * 4) / 12);
    expect(d).toBeCloseTo(expected, 6); // ~1.515
  });

  it('getDSCRClass: จัดระดับสีถูกต้อง', () => {
    expect(getDSCRClass(1.6)).toBe('safe');
    expect(getDSCRClass(1.5)).toBe('safe');
    expect(getDSCRClass(1.2)).toBe('warn');
    expect(getDSCRClass(1.0)).toBe('danger');
  });
});
