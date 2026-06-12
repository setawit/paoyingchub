/**
 * Allocation Engine — จัดกิจกรรมลงโซนแปลงแบบ greedy รายหน่วย
 * Pure functions — ห้ามแตะ DOM/localStorage
 * Spec: DESIGN.md §5
 */
import { yieldMultiplier, pickBestMarket, scorePerSqm } from './suitability.js';

/** @type {import('../types.js').PlanTemplate[]} */
export const PLAN_TEMPLATES = [
  {
    id: 'safe', label: 'แผนปลอดภัย', emoji: '🛡️',
    desc: 'ลงทุนต่ำ เสี่ยงน้อย เน้นรายได้เข้าเร็ว',
    capitalFrac: 0.50, areaFrac: 0.45, laborFrac: 0.55, riskBias: 'quick-cash',
  },
  {
    id: 'balanced', label: 'แผนสมดุล', emoji: '⚖️',
    desc: 'กระจายความเสี่ยงหลายกิจกรรม',
    capitalFrac: 0.75, areaFrac: 0.70, laborFrac: 0.75, riskBias: 'diversify',
  },
  {
    id: 'high', label: 'แผนผลตอบแทนสูง', emoji: '🚀',
    desc: 'ใช้ทรัพยากรเกือบเต็ม เน้นกำไรสูงสุด',
    capitalFrac: 0.95, areaFrac: 0.90, laborFrac: 0.95, riskBias: 'max-profit',
  },
];

/**
 * สร้างแผนหนึ่งระดับ
 *
 * ขั้นตอน (ดู DESIGN.md §5):
 * 1. สร้าง candidates ทุกคู่ (activity × zone):
 *      - ข้ามคู่ที่ yieldMultiplier = 0 หรือไม่มีตลาดรับ (pickBestMarket = null)
 *      - rawScore = scorePerSqm(activity, zone, bestMarket)
 * 2. ปรับ score ตาม riskBias:
 *      quick-cash : score × (8 / max(8, firstIncomeWeek))   → ของเงินช้าโดนลดแรง
 *      diversify  : score ปกติ แต่ตอน greedy ห้าม activity ใดเกิน 40% ของทุนแผน
 *      max-profit : score ดิบ
 * 3. เรียงมาก→น้อย แล้ว greedy หยิบทีละ 1 unit:
 *      เงื่อนไข: capLeft ≥ investment ∧ zoneAreaLeft ≥ areaPerUnit
 *               ∧ laborLeft ≥ laborPerUnitPerDay ∧ units < maxUnits (รวมทุกโซน)
 * 4. วนจนเติมไม่ได้ → คืน Placement[] (startWeek = 1 ทุกตัว, cashflow engine ค่อยแนะนำเลื่อน)
 *
 * @param {import('../types.js').PlanTemplate} template
 * @param {import('../types.js').FarmConfig} farm
 * @param {import('../types.js').Activity[]} catalog
 * @returns {import('../types.js').Placement[]}
 */
export function allocate(template, farm, catalog) {
  // TODO
  throw new Error('not implemented');
}

/**
 * สรุปการใช้ทรัพยากรของชุด placements (ไว้แสดงผล + เขียน test)
 * @returns {{capUsed:number, laborUsed:number, areaUsedByZone:Object<string,number>}}
 */
export function summarizeUsage(placements, catalog) {
  // TODO
  throw new Error('not implemented');
}
