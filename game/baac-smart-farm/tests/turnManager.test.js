import { describe, it, expect } from 'vitest';
import { executeTurn } from '../src/game/TurnManager.js';
import { createInitialState } from '../src/game/GameState.js';
import { ACTIVITIES } from '../src/game/Activities.js';

// ---- พอร์ตตรรกะ run() ต้นฉบับ (index.html เดิม) มาเป็นฟังก์ชันอ้างอิงสำหรับ regression ----
// รับ state, mutate, คืน {blocked} หรือ {profit}
function originalRun(S) {
  const A = ACTIVITIES;
  const RATE = 0.07, TOTAL = 1600, LABOR = 8;
  const limit = () => 20000 + S.score * 300;
  const sim = () => {
    const r = { investment: 0, labor: 0, area: 0, income: 0, cost: 0, errors: [] };
    for (const [id, n] of Object.entries(S.sel)) {
      const a = A.find((x) => x.id == id);
      if (!a) continue;
      r.investment += a.investment * n; r.labor += a.labor * n; r.area += a.area * n;
      r.income += a.income * n; r.cost += a.cost * n;
    }
    if (r.area > TOTAL) r.errors.push('พื้นที่เกิน');
    if (r.labor > LABOR) r.errors.push('แรงงานเกิน');
    if (r.investment > S.cash + limit() + (S.green ? 50000 : 0)) r.errors.push('ทุนไม่พอ');
    return r;
  };
  const wcTotal = (p, m = 4) => p + (p * RATE * m) / 12;
  const dscr = (r) => {
    const need = Math.max(0, r.investment - S.cash);
    if (!need) return 999;
    const melon = (S.sel.melon || 0) * 25000;
    const wc = Math.max(0, need - (S.green ? melon : 0));
    const cap = S.green && melon ? melon / 6 + (melon * RATE * 4) / 12 : 0;
    return r.income / (wcTotal(wc) + cap);
  };
  const r = sim();
  if (r.errors.length) return { blocked: 'errors' };
  const need = Math.max(0, r.investment - S.cash), melon = (S.sel.melon || 0) * 25000;
  if (melon && !S.green) return { blocked: 'capex' };
  const cap = melon, wc = Math.max(0, need - cap), d = dscr(r);
  if (need && d < 1.1) return { blocked: 'dscr' };
  S.cash -= r.investment; S.wc = wc;
  if (cap) S.cap = { principal: cap, remaining: cap, paid: 0, total: 6, months: 4 };
  let profit = 0;
  for (let m = 1; m <= 4; m++) {
    let income = r.income, cost = r.cost, principal = 0;
    for (const [id, n] of Object.entries(S.sel)) {
      const a = A.find((x) => x.id == id);
      if (a.cashInMonth > m) income -= a.income * n;
    }
    if (S.wc) { cost += (S.wc * RATE) / 12; if (m === 4) { principal += S.wc; S.wc = 0; } }
    if (S.cap.remaining) {
      cost += (S.cap.remaining * RATE) / 12;
      if (m === 4) { const p = S.cap.principal / S.cap.total; principal += p; S.cap.remaining = Math.max(0, S.cap.remaining - p); S.cap.paid++; }
    }
    const net = income - cost - principal; S.cash += net; profit += net;
  }
  const paid = S.cash >= 0 && !S.wc;
  S.score = Math.max(0, Math.min(100, S.score + (paid ? 5 : -10)));
  if (S.score >= 70) S.green = true;
  S.history.push({ turn: S.turn, profit, cash: S.cash, score: S.score });
  S.turn++; S.month += 4; if (S.month > 12) { S.month -= 12; S.year++; }
  S.sel = {};
  return { profit };
}

function freshState(overrides = {}) {
  const s = createInitialState();
  Object.assign(s, overrides);
  return s;
}

const REASON_MAP = { errors: 'errors', capex: 'capex-locked', dscr: 'dscr-low' };

describe('TurnManager.executeTurn — regression เทียบ run() ต้นฉบับ (หนึ่งรอบ, ปิด event)', () => {
  const scenarios = [
    { name: 'ผักอย่างเดียว (ทุนพอ)', sel: { veggie: 1 } },
    { name: 'ไส้เดือน (ทุนพอ)', sel: { worm: 1 } },
    { name: 'ผัก+ไส้เดือน (กู้ WC, DSCR ผ่าน)', sel: { veggie: 1, worm: 1 } },
    { name: 'ไก่เดี่ยว (กู้ WC, DSCR ต่ำ -> บล็อก)', sel: { chicken: 1 } },
    { name: 'พื้นที่เกิน -> บล็อก', sel: { veggie: 100 } },
    { name: 'เมล่อนแต่ยังไม่ green -> บล็อก capex', sel: { melon: 1 } },
    { name: 'เมล่อน + green (กู้ CapEx)', sel: { melon: 1 }, green: true, score: 75 },
  ];

  for (const sc of scenarios) {
    it(sc.name, () => {
      const base = { sel: { ...sc.sel } };
      if (sc.green) base.green = true;
      if (sc.score != null) base.score = sc.score;

      const sRef = freshState(base);
      const sNew = freshState(base);

      const refOut = originalRun(sRef);
      // ปิด event (chance 0) และให้ rng คงที่เพื่อ determinism
      const newOut = executeTurn(sNew, { eventChance: 0, rng: () => 0.5 });

      if (refOut.blocked) {
        expect(newOut.ok).toBe(false);
        expect(newOut.reason).toBe(REASON_MAP[refOut.blocked]);
        // state ต้องไม่เปลี่ยน (ยังเป็นค่าเริ่มต้น)
        expect(sNew.cash).toBe(createInitialState().cash);
      } else {
        expect(newOut.ok).toBe(true);
        expect(newOut.profit).toBeCloseTo(refOut.profit, 6);
        expect(sNew.cash).toBeCloseTo(sRef.cash, 6);
        expect(sNew.score).toBe(sRef.score);
        expect(sNew.turn).toBe(sRef.turn);
        expect(sNew.month).toBe(sRef.month);
        expect(sNew.year).toBe(sRef.year);
        expect(sNew.wc).toBeCloseTo(sRef.wc, 6);
        expect(sNew.green).toBe(sRef.green);
        expect(sNew.history.at(-1).profit).toBeCloseTo(sRef.history.at(-1).profit, 6);
      }
    });
  }
});

describe('TurnManager.executeTurn — พฤติกรรมเพิ่มเติม', () => {
  it('game over เมื่อ cash < -5000', () => {
    // เลือกกิจกรรมต้นทุนสูงจน 4 เดือนทำเงินติดลบหนัก
    const s = freshState({ cash: 5000, score: 100, green: true, sel: { melon: 1 } });
    const out = executeTurn(s, { eventChance: 0 });
    expect(out.ok).toBe(true);
    expect(out.gameOver).toBe(true); // เมล่อนลงทุน 25000 ทำให้เงินติดลบมาก
  });

  it('เหตุการณ์ถูก trigger เมื่อ chance = 1', () => {
    const s = freshState({ sel: { worm: 1 } });
    const out = executeTurn(s, { eventChance: 1, rng: () => 0 });
    expect(out.events.length).toBeGreaterThan(0);
  });

  it('ราคาตลาดถูกสุ่มใหม่หลังจบรอบ', () => {
    const s = freshState({ sel: { worm: 1 } });
    executeTurn(s, { eventChance: 0, rng: () => 0 });
    // rng()=0 -> ทุกราคา = PRICE_MIN (0.8)
    expect(s.marketPrices.worm).toBe(0.8);
  });
});
