// EventManager — สุ่มเหตุการณ์ไม่คาดฝันระหว่างเดือนในหนึ่งรอบ
// เหตุการณ์คืน effect ที่ TurnManager นำไปปรับ income/cash/score ของเดือนนั้น

import { pick } from '../utils/helpers.js';

// คลังเหตุการณ์:
//   incomeFactor = ตัวคูณรายได้เฉพาะเดือนที่เกิด (เช่น 0.7 = รายได้ลด 30%)
//   cashDelta    = เงินสดเปลี่ยนทันที (+/-)
//   scoreDelta   = คะแนนเครดิตเปลี่ยนทันที (+/-)
export const EVENTS = [
  { key: 'drought', title: '🌵 ฝนแล้ง', desc: 'น้ำน้อย ผลผลิตเดือนนี้ลดลง', incomeFactor: 0.7 },
  { key: 'flood', title: '🌧️ น้ำหลาก', desc: 'น้ำท่วมแปลง ผลผลิตเสียหายบางส่วน', incomeFactor: 0.6 },
  { key: 'disease', title: '🦠 โรคระบาด', desc: 'สัตว์/พืชป่วย ต้องจ่ายค่ารักษา', incomeFactor: 0.65, cashDelta: -500 },
  { key: 'price_spike', title: '📈 ราคาพุ่ง', desc: 'ตลาดต้องการสูง ราคาผลผลิตดีขึ้น', incomeFactor: 1.4 },
  { key: 'gov_aid', title: '🏛️ เงินช่วยเหลือรัฐ', desc: 'ได้รับเงินอุดหนุนจากภาครัฐ', cashDelta: 2000, scoreDelta: 2 },
  { key: 'good_weather', title: '☀️ อากาศดี', desc: 'สภาพอากาศเอื้ออำนวย ผลผลิตงาม', incomeFactor: 1.2 },
];

/**
 * สุ่มว่าจะเกิดเหตุการณ์ในเดือนนี้หรือไม่
 * @param month  เดือนที่ 1..4 ในรอบ
 * @param chance โอกาสเกิด (0..1)
 * @param rng    ฟังก์ชันสุ่ม (inject ได้เพื่อทดสอบแบบ deterministic)
 * @returns เหตุการณ์ { key,title,desc,...effect, month } หรือ null ถ้าไม่เกิด
 */
export function triggerRandomEvent(state, month, { chance = 0.15, rng = Math.random } = {}) {
  if (rng() > chance) return null;
  const ev = pick(EVENTS);
  return { ...ev, month };
}
