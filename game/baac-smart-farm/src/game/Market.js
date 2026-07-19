// ตลาด — ราคาผลผลิตผันผวนในแต่ละรอบ
// ราคาฐานคือค่า income ของแต่ละกิจกรรมใน Activities.js
// state.marketPrices[id] = ตัวคูณราคา (multiplier); ค่าเริ่มต้น 1 = ราคาปกติ

import { ACTIVITIES } from './Activities.js';
import { randomFloat, clamp } from '../utils/helpers.js';

export const PRICE_MIN = 0.8; // ราคาต่ำสุด -20%
export const PRICE_MAX = 1.3; // ราคาสูงสุด +30%

/** คืน multiplier ราคาปัจจุบันของกิจกรรม (default 1 ถ้ายังไม่มีข้อมูล) */
export function getPriceMultiplier(state, id) {
  return (state.marketPrices && state.marketPrices[id]) || 1;
}

/** ราคาตั้งต้น: ทุกกิจกรรม = 1 (ราคาปกติ) ใช้ตอนเริ่มเกม */
export function defaultPrices() {
  const prices = {};
  for (const a of ACTIVITIES) prices[a.id] = 1;
  return prices;
}

/** สุ่มราคาใหม่ทุกกิจกรรมสำหรับรอบถัดไป แล้วบันทึกลง state */
export function updatePrices(state, rng = Math.random) {
  const prices = {};
  for (const a of ACTIVITIES) {
    const raw = PRICE_MIN + rng() * (PRICE_MAX - PRICE_MIN);
    prices[a.id] = +clamp(raw, PRICE_MIN, PRICE_MAX).toFixed(2);
  }
  state.marketPrices = prices;
  return prices;
}

// เผื่อใช้ในที่อื่น (เช่น debug/preview)
export const randomMultiplier = () =>
  +clamp(randomFloat(PRICE_MIN, PRICE_MAX), PRICE_MIN, PRICE_MAX).toFixed(2);
