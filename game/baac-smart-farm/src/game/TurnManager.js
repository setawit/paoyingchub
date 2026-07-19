// TurnManager — ดำเนินการจบรอบ (4 เดือน): จ่ายหนี้ คิดดอกเบี้ย หักต้นทุน เพิ่มรายได้
// สุ่มเหตุการณ์ระหว่างเดือน อัปเดตเครดิตสกอร์ และเลื่อนเวลา — ตรรกะหลักตรงกับ run() เดิม

import { getActivityById } from './Activities.js';
import {
  INTEREST_RATE,
  MELON_CAPEX,
  GREEN_SCORE,
  GAME_OVER_CASH,
  TURN_MONTHS,
  CAPEX_INSTALLMENTS,
  CAPEX_MONTHS,
} from './constants.js';
import { simulateTurn } from './Simulation.js';
import { calcDSCR } from './LoanEngine.js';
import { getPriceMultiplier, updatePrices } from './Market.js';
import { triggerRandomEvent } from './EventManager.js';
import { clamp } from '../utils/helpers.js';

/**
 * ดำเนินการจบรอบ ปรับ state ในที่ (mutate) และคืนสรุปผล
 * @param state  state ปัจจุบัน
 * @param opts.eventChance โอกาสเกิดเหตุการณ์ต่อเดือน (0 = ปิด, ใช้ทดสอบ/regression)
 * @param opts.onEvent     callback เมื่อเกิดเหตุการณ์ (สำหรับแสดง popup)
 * @param opts.rng         ฟังก์ชันสุ่ม (inject เพื่อทดสอบ)
 * @returns {{ok:boolean, reason?:string, errors?:string[], dscr?:number,
 *            profit?:number, events?:object[], gameOver?:boolean}}
 */
export function executeTurn(state, opts = {}) {
  const { eventChance = 0.15, onEvent = null, rng = Math.random } = opts;

  const r = simulateTurn(state);
  if (r.errors.length) return { ok: false, reason: 'errors', errors: r.errors };

  const need = Math.max(0, r.investment - state.cash);
  const melon = (state.sel.melon || 0) * MELON_CAPEX;
  if (melon && !state.green) return { ok: false, reason: 'capex-locked' };

  const cap = melon;
  const wc = Math.max(0, need - cap);
  const d = calcDSCR(state, r);
  if (need && d < 1.1) return { ok: false, reason: 'dscr-low', dscr: d };

  // เบิกเงินลงทุนและตั้งภาระหนี้
  state.cash -= r.investment;
  state.wc = wc;
  if (cap) {
    state.cap = { principal: cap, remaining: cap, paid: 0, total: CAPEX_INSTALLMENTS, months: CAPEX_MONTHS };
  }

  const events = [];
  let profit = 0;

  for (let m = 1; m <= TURN_MONTHS; m++) {
    let income = r.income;
    let cost = r.cost;
    let principal = 0;

    // กิจกรรมที่ยังไม่มีรายได้เข้าในเดือนนี้ (delay กระแสเงินสด)
    for (const [id, n] of Object.entries(state.sel)) {
      const a = getActivityById(id);
      if (a && a.cashInMonth > m) income -= a.income * n * getPriceMultiplier(state, id);
    }

    // เหตุการณ์สุ่มประจำเดือน
    const ev = triggerRandomEvent(state, m, { chance: eventChance, rng });
    if (ev) {
      if (ev.incomeFactor != null) income *= ev.incomeFactor;
      if (ev.cashDelta) state.cash += ev.cashDelta;
      if (ev.scoreDelta) state.score = clamp(state.score + ev.scoreDelta, 0, 100);
      events.push(ev);
      if (onEvent) onEvent(ev);
    }

    // ดอกเบี้ย + ชำระต้นสินเชื่อหมุนเวียน (คืนต้นปลายรอบ เดือนที่ 4)
    if (state.wc) {
      cost += (state.wc * INTEREST_RATE) / 12;
      if (m === TURN_MONTHS) {
        principal += state.wc;
        state.wc = 0;
      }
    }

    // ดอกเบี้ย + ผ่อนต้นสินเชื่อลงทุน (ลดต้นลดดอก)
    if (state.cap.remaining) {
      cost += (state.cap.remaining * INTEREST_RATE) / 12;
      if (m === TURN_MONTHS) {
        const p = state.cap.principal / state.cap.total;
        principal += p;
        state.cap.remaining = Math.max(0, state.cap.remaining - p);
        state.cap.paid++;
      }
    }

    const net = income - cost - principal;
    state.cash += net;
    profit += net;
  }

  // อัปเดตเครดิตสกอร์: จ่ายครบ (เงินไม่ติดลบและไม่ค้าง WC) +5 ไม่งั้น -10
  const paid = state.cash >= 0 && !state.wc;
  state.score = clamp(state.score + (paid ? 5 : -10), 0, 100);
  if (state.score >= GREEN_SCORE) state.green = true;

  state.history.push({ turn: state.turn, profit, cash: state.cash, score: state.score });

  // เลื่อนเวลา
  state.turn++;
  state.month += TURN_MONTHS;
  if (state.month > 12) {
    state.month -= 12;
    state.year++;
  }
  state.sel = {};

  // ราคาตลาดผันผวนสำหรับรอบถัดไป
  updatePrices(state, rng);

  const gameOver = state.cash < GAME_OVER_CASH;
  return { ok: true, profit, events, gameOver };
}
