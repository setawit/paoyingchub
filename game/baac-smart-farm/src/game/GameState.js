// GameState — state กลาง (single source of truth) + observer
// ทุกโมดูลอ่าน/เขียนผ่าน state ก้อนเดียวนี้ และ UI สมัครรับการเปลี่ยนแปลงผ่าน subscribe()

import { LIMIT_BASE, LIMIT_PER_SCORE, START_STATE } from './constants.js';
import { defaultPrices } from './Market.js';

/** วงเงินสินเชื่อหมุนเวียน (WC) ตามคะแนนเครดิต — สูตรเดียวกับเกมต้นฉบับ */
export function creditLimit(state) {
  return LIMIT_BASE + state.score * LIMIT_PER_SCORE;
}

/** สร้าง state เริ่มต้นของเกมใหม่ */
export function createInitialState() {
  return {
    turn: 1,
    month: START_STATE.month,
    year: 1,
    cash: START_STATE.cash,
    score: START_STATE.score,
    sel: {}, // { activityId: จำนวนหน่วย }
    wc: 0, // ยอดค้างสินเชื่อหมุนเวียน
    cap: { principal: 0, remaining: 0, paid: 0, total: 0, months: 0 }, // สินเชื่อลงทุน CapEx
    green: false, // ปลดล็อก CapEx แล้วหรือยัง (score >= 70)
    history: [], // ประวัติผลแต่ละรอบ
    // ---- ระบบเสริม ----
    marketPrices: defaultPrices(),
    quests: [],
    tutorialStep: 0,
    tutorialDone: false,
    muted: false,
  };
}

/**
 * Observer store แบบเบา ๆ — เก็บ state และแจ้งผู้ติดตามเมื่อมีการเปลี่ยนแปลง
 * ใช้แทนการเรียก render() ด้วยมือทุกจุดแบบเกมต้นฉบับ
 */
export class GameState {
  constructor(initial) {
    this.data = initial || createInitialState();
    this._subs = new Set();
  }

  /** เข้าถึง state ดิบ (อ่าน/แก้ไขตรงได้ แล้วเรียก emit ภายหลัง) */
  get() {
    return this.data;
  }

  /** แทนที่ state ทั้งก้อน (เช่น หลังโหลดเซฟ) แล้วแจ้งผู้ติดตาม */
  replace(newData) {
    this.data = newData;
    this.emit();
  }

  /** แก้ไข state ผ่าน mutator แล้วแจ้งผู้ติดตาม */
  update(mutator) {
    if (typeof mutator === 'function') mutator(this.data);
    this.emit();
  }

  /** สมัครรับการเปลี่ยนแปลง — คืนฟังก์ชันยกเลิกการติดตาม */
  subscribe(fn) {
    this._subs.add(fn);
    return () => this._subs.delete(fn);
  }

  /** แจ้งผู้ติดตามทั้งหมดว่า state เปลี่ยน */
  emit() {
    for (const fn of this._subs) fn(this.data);
  }
}
