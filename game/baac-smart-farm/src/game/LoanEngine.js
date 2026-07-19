// LoanEngine — การคำนวณสินเชื่อ WC / CapEx และ DSCR
// ฟังก์ชันบริสุทธิ์ทั้งหมด (ไม่มี state ภายใน) — สูตรตรงกับเกมต้นฉบับ

import { INTEREST_RATE, MELON_CAPEX, CAPEX_MONTHS, CAPEX_INSTALLMENTS } from './constants.js';

/**
 * สินเชื่อหมุนเวียน (WC): ดอกเบี้ยคิดตามจำนวนเดือนที่ถือเงินกู้
 * เดิม: wcTerms(p, m=4) => interest = p*RATE*m/12
 */
export function calcWCLoan(principal, months = CAPEX_MONTHS) {
  const interest = (principal * INTEREST_RATE * months) / 12;
  return { principal, interest, total: principal + interest };
}

/**
 * ค่างวดสินเชื่อลงทุน (CapEx) ต่อรอบ: ลดต้นลดดอก
 * เดิม: capInstall() => principal/total + remaining*RATE*months/12
 */
export function calcCapExInstallment(cap) {
  if (!cap || !cap.remaining) return 0;
  return cap.principal / cap.total + (cap.remaining * INTEREST_RATE * cap.months) / 12;
}

/**
 * DSCR (Debt Service Coverage Ratio) = รายได้ / ภาระชำระหนี้
 * คืน 999 เมื่อไม่ต้องกู้ (ทุนพอ) — ตรงกับเกมต้นฉบับ
 * @param state  state ปัจจุบัน (ใช้ cash, sel.melon, green)
 * @param sim    ผลจาก simulateTurn(state) (ใช้ investment, income)
 */
export function calcDSCR(state, sim) {
  const need = Math.max(0, sim.investment - state.cash);
  if (!need) return 999;
  const melon = (state.sel.melon || 0) * MELON_CAPEX;
  const wc = Math.max(0, need - (state.green ? melon : 0));
  const cap =
    state.green && melon ? melon / CAPEX_INSTALLMENTS + (melon * INTEREST_RATE * CAPEX_MONTHS) / 12 : 0;
  return sim.income / (calcWCLoan(wc).total + cap);
}

/** จัดระดับสีของ DSCR: >=1.5 ปลอดภัย, >=1.1 ตึง, ต่ำกว่านั้นเสี่ยง */
export function getDSCRClass(d) {
  return d >= 1.5 ? 'safe' : d >= 1.1 ? 'warn' : 'danger';
}
