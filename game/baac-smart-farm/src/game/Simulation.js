// Simulation — จำลองผลรวมของแผนการผลิตปัจจุบัน (preview ก่อนจบรอบ)
// รายได้คูณด้วยราคาตลาด (Market) — ถ้าราคาปกติ (multiplier=1) ผลจะเท่ากับเกมต้นฉบับ

import { getActivityById } from './Activities.js';
import { TOTAL_AREA, MAX_LABOR, CREDIT_BONUS } from './constants.js';
import { creditLimit } from './GameState.js';
import { getPriceMultiplier } from './Market.js';

/**
 * รวมค่าจากทุกกิจกรรมที่เลือกไว้ + ตรวจข้อจำกัด
 * @returns {{investment,labor,area,income,cost,errors:string[]}}
 */
export function simulateTurn(state) {
  const r = { investment: 0, labor: 0, area: 0, income: 0, cost: 0, errors: [] };

  for (const [id, n] of Object.entries(state.sel)) {
    const a = getActivityById(id);
    if (!a) continue;
    const mult = getPriceMultiplier(state, id);
    r.investment += a.investment * n;
    r.labor += a.labor * n;
    r.area += a.area * n;
    r.income += a.income * n * mult; // รายได้ผันตามราคาตลาด
    r.cost += a.cost * n;
  }

  if (r.area > TOTAL_AREA) r.errors.push('พื้นที่เกิน');
  if (r.labor > MAX_LABOR) r.errors.push('แรงงานเกิน');
  if (r.investment > state.cash + creditLimit(state) + (state.green ? CREDIT_BONUS : 0))
    r.errors.push('ทุนไม่พอ');

  return r;
}
