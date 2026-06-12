/**
 * Suitability Engine — ความเหมาะสมของคู่ (กิจกรรม × โซน × ตลาด)
 * Pure functions ทั้งไฟล์ — ห้ามแตะ DOM/localStorage
 * Spec + สูตรเต็ม: DESIGN.md §4
 */

/**
 * ตัวคูณผลผลิตจากสภาพแปลง
 * yieldMult = soilFactor × waterFactor × floodFactor
 *   soilFactor  = activity.soilPreference[zone.soilType]
 *   waterFactor = lerp(0.5,1.0,waterAccess) เมื่อ waterNeed='high'
 *                 lerp(0.7,1.0,waterAccess) เมื่อ 'medium' | 1.0 เมื่อ 'low'
 *   floodFactor = 0 ถ้า floodRisk='high' และ category ∈ {field-crop, vegetable}
 *                 ไม่งั้น 1.0
 * @param {import('../types.js').Activity} activity
 * @param {import('../types.js').PlotZone} zone
 * @returns {number} 0–1.2
 */
export function yieldMultiplier(activity, zone) {
  // TODO
  throw new Error('not implemented');
}

/**
 * ตัวคูณราคาจากตลาด
 * priceMult = market.priceFactor × perishablePenalty
 *   perishablePenalty = 0.9 ถ้า activity.perishable && market.distanceKm > 20 ไม่งั้น 1.0
 * ถ้า market ไม่รับ category นี้ → return null (ขายไม่ได้)
 * @param {import('../types.js').Activity} activity
 * @param {import('../types.js').Market} market
 * @returns {number|null}
 */
export function priceMultiplier(activity, market) {
  // TODO
  throw new Error('not implemented');
}

/**
 * เลือกตลาดที่ดีที่สุดของกิจกรรมนี้ (priceMult สูงสุดหลังหักค่าขนส่งเฉลี่ย/สัปดาห์)
 * netWeekly(market) = expectedWeeklyRevenue × priceMult − transportShare
 *   transportShare = transportCostPerTrip × tripsPerWeek หารแบ่งตามจำนวนกิจกรรม
 *   (ขั้นแรกให้คิดง่าย: เหมาว่ากิจกรรมนี้แบกค่าขนส่งเองทั้งเที่ยว — ปรับทีหลังได้)
 * @param {import('../types.js').Activity} activity
 * @param {import('../types.js').Market[]} markets
 * @returns {{market: import('../types.js').Market, priceMult: number}|null}
 */
export function pickBestMarket(activity, markets) {
  // TODO
  throw new Error('not implemented');
}

/**
 * คะแนนต่อหน่วยสำหรับจัดอันดับใน allocation
 * score = (รายได้คาดหวังต่อปี × yieldMult × priceMult − ต้นทุนต่อปี) / areaPerUnit
 * รายได้คาดหวังต่อปี:
 *   recurring: grossPerUnitPerCycle × (52 − firstIncomeWeek + 1) / cycleWeeks
 *   lump:      grossPerUnitPerCycle × floor((52 − firstIncomeWeek) / cycleWeeks + 1)
 * @returns {number} บาท/ตร.ม./ปี (อาจติดลบ)
 */
export function scorePerSqm(activity, zone, market) {
  // TODO
  throw new Error('not implemented');
}
