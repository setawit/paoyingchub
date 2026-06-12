/**
 * Cashflow Engine — จำลองรายสัปดาห์ 52 สัปดาห์ + 13-week rolling window
 * หัวใจของระบบ: ตอบว่า "ช่วงไหนเงินหมดหน้าตัก แม้ปลายปีกำไร"
 * Pure functions — ห้ามแตะ DOM/localStorage
 * Spec: DESIGN.md §6
 */

export const WEEKS_PER_YEAR = 52;
export const ROLLING_WINDOW = 13;   // มาตรฐาน 13-week cashflow ของ treasury

/**
 * จำลองกระแสเงินสดของแผนหนึ่ง
 *
 * รายสัปดาห์ w = 1..52 ต่อ placement:
 *   invest[w] : investmentPerUnit × units จ่ายครั้งเดียวที่ w = startWeek
 *   cost[w]   : weeklyCostPerUnit × units ตั้งแต่ startWeek ถึง 52
 *               + ค่าขนส่งของตลาดที่เลือก (transportCostPerTrip × tripsPerWeek)
 *                 เฉพาะสัปดาห์ที่มี income > 0
 *   income[w] : ตาม revenue.model (gross × yieldMult × priceMult):
 *     recurring: ทุกสัปดาห์ที่ (w − startWeek + 1) ≥ firstIncomeWeek
 *                จ่าย gross/cycleWeeks ต่อสัปดาห์
 *     lump:      จ่ายเต็มก้อนทุกครั้งที่ (w − startWeek + 1 − firstIncomeWeek) % cycleWeeks === 0
 *                และ w ≥ startWeek + firstIncomeWeek − 1
 *
 * balance[w] = balance[w−1] + income − cost − invest   (balance[0] = cashReserve)
 *
 * หลังได้ weekly[] แล้วคำนวณ:
 *   minBalance / minBalanceWeek
 *   cashGaps[]        : ช่วงต่อเนื่องที่ balance < 0 (รวมช่วงติดกันเป็นก้อนเดียว)
 *   rolling13[w]      : min(balance[w .. min(w+12, 52)])  ← มองล่วงหน้า 13 สัปดาห์
 *   firstWarningWeek  : w แรกที่ rolling13[w] < 0 (null ถ้าไม่มี)
 *   loanNeeded        : ceil(|minBalance| × 1.2 / 1000) × 1000, 0 ถ้าไม่ติดลบ
 *   breakEvenWeek     : w แรกที่ Σ(income−cost) สะสม ≥ Σ invest ทั้งปี (null ถ้าไม่ถึง)
 *   suggestions       : จาก buildSuggestions()
 *
 * @param {import('../types.js').Placement[]} placements
 * @param {import('../types.js').Activity[]} catalog
 * @param {import('../types.js').Market[]} markets
 * @param {number} cashReserve
 * @returns {import('../types.js').CashflowResult}
 */
export function simulateCashflow(placements, catalog, markets, cashReserve) {
  // TODO
  throw new Error('not implemented');
}

/**
 * ข้อเสนอแนะ rule-based (ภาษาไทย) — DESIGN.md §6 ท้ายหัวข้อ
 * กติกา 3 ข้อ:
 * 1. มี cashGap → "ควรเตรียมวงเงินสำรอง/กู้สั้น ~{loanNeeded} บาท ช่วง {เดือน gap}"
 * 2. ลองเลื่อน startWeek ของ placement ที่ revenue.model==='lump' ทีละ +4 สัปดาห์ (สูงสุด +12)
 *    แล้ว simulate ใหม่ — ถ้า gap หายหรือ loanNeeded ลด >50% ให้เสนอ
 *    "เลื่อนเริ่ม {ชื่อกิจกรรม} ไปสัปดาห์ที่ {w} จะลดเงินขาดเหลือ {x} บาท"
 * 3. ถ้าไม่มี placement ใดที่ firstIncomeWeek ≤ 8
 *    → "แผนนี้ไม่มีรายได้เร็ว ควรเพิ่มกิจกรรมเงินไว เช่น เห็ด/ผัก อย่างน้อย 1 หน่วย"
 *
 * @param {import('../types.js').CashflowResult} result
 * @param {import('../types.js').Placement[]} placements
 * @param {import('../types.js').Activity[]} catalog
 * @param {import('../types.js').Market[]} markets
 * @param {number} cashReserve
 * @returns {string[]}
 */
export function buildSuggestions(result, placements, catalog, markets, cashReserve) {
  // TODO
  throw new Error('not implemented');
}

/**
 * แปลงเลขสัปดาห์ → ชื่อเดือนไทยโดยประมาณ (w1–4 = ม.ค., w5–8 = ก.พ., ...)
 * @param {number} week 1–52
 * @returns {string}
 */
export function weekToMonthTH(week) {
  // TODO: const MONTHS = ['ม.ค.',...]; return MONTHS[Math.min(11, Math.floor((week-1)/4.34))]
  throw new Error('not implemented');
}
