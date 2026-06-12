/**
 * FarmPlan DSS v3 — Type definitions (JSDoc)
 * ไฟล์นี้คือสัญญากลางของทั้งระบบ ทุก module ต้อง import/อ้างอิง type จากที่นี่
 * อ่านคู่กับ DESIGN.md §3
 */

/**
 * กิจกรรมการผลิต (พืช/สัตว์) — ผู้ใช้เพิ่มเองได้ผ่านแท็บแคตตาล็อก
 * @typedef {Object} Activity
 * @property {string} id                  unique slug เช่น 'veggie-kale'
 * @property {string} name                ชื่อภาษาไทย
 * @property {string} icon                emoji 1 ตัว
 * @property {'vegetable'|'field-crop'|'fruit-tree'|'livestock'|'aquaculture'} category
 * @property {string} unitDesc            คำอธิบายหน่วย เช่น 'แปลง 100 ตร.ม.'
 * @property {number} areaPerUnit         ตร.ม./หน่วย
 * @property {number} investmentPerUnit   บาท จ่ายครั้งเดียวที่สัปดาห์เริ่ม
 * @property {number} laborPerUnitPerDay  ชม./วัน/หน่วย
 * @property {'low'|'medium'|'high'} waterNeed
 * @property {{loam:number, clay:number, sandy:number}} soilPreference ตัวคูณผลผลิต 0–1.2
 * @property {number} weeklyCostPerUnit   บาท/สัปดาห์/หน่วย (อาหาร/ปุ๋ย/เชื้อเพลิง)
 * @property {RevenueModel} revenue
 * @property {number} maxUnits            เพดานหน่วยต่อฟาร์ม
 * @property {boolean} perishable         เน่าเสียง่าย → โดน penalty ตลาดไกล
 * @property {'default'|'user'} source    default แก้ไม่ได้ (clone ได้), user ลบ/แก้ได้
 */

/**
 * โมเดลรายได้ของกิจกรรม
 * @typedef {Object} RevenueModel
 * @property {'recurring'|'lump'} model   recurring=รายได้ต่อเนื่องทุกสัปดาห์หลังเริ่มขาย,
 *                                        lump=เก็บเกี่ยวเป็นก้อนทุกปลายรอบ
 * @property {number} grossPerUnitPerCycle บาท/หน่วย/รอบ (ก่อนคูณ priceMult, yieldMult)
 * @property {number} cycleWeeks          ความยาวรอบผลิต (สัปดาห์)
 * @property {number} firstIncomeWeek     สัปดาห์แรกที่มีเงินเข้า นับจากสัปดาห์เริ่มกิจกรรม
 */

/**
 * โซนแปลงดิน — ฟาร์มหนึ่งมีหลายโซน คุณภาพไม่เท่ากัน
 * @typedef {Object} PlotZone
 * @property {string} id
 * @property {string} name
 * @property {number} areaSqm
 * @property {'loam'|'clay'|'sandy'} soilType
 * @property {number} waterAccess         0–1 (1 = ติดแหล่งน้ำ)
 * @property {'low'|'medium'|'high'} floodRisk
 * @property {string} note
 */

/**
 * ตลาด — มีได้หลายแห่ง ระยะทาง/ราคา/ค่าขนส่งต่างกัน
 * @typedef {Object} Market
 * @property {string} id
 * @property {string} name
 * @property {number} distanceKm
 * @property {number} priceFactor         ตัวคูณราคาฐาน เช่น ตลาดใกล้ขายปลีกได้ 1.15
 * @property {number} transportCostPerTrip บาท/เที่ยว (ไป-กลับ รวมน้ำมัน)
 * @property {number} tripsPerWeek
 * @property {string[]} acceptsCategories  category ของ Activity ที่ตลาดนี้รับซื้อ
 */

/**
 * ทรัพยากรรวมของฟาร์ม
 * @typedef {Object} FarmConfig
 * @property {number} capital        เงินลงทุน (บาท)
 * @property {number} cashReserve    เงินสดสำรองหมุนเวียน (บาท)
 * @property {number} laborHoursPerDay
 * @property {PlotZone[]} zones
 * @property {Market[]} markets
 */

/**
 * โปรไฟล์แผน 3 ระดับความเสี่ยง (safe/balanced/high) — ดู DESIGN.md §5
 * @typedef {Object} PlanTemplate
 * @property {'safe'|'balanced'|'high'} id
 * @property {string} label
 * @property {string} emoji
 * @property {string} desc
 * @property {number} capitalFrac    สัดส่วนทุนที่ยอมใช้ 0–1
 * @property {number} areaFrac
 * @property {number} laborFrac
 * @property {'quick-cash'|'diversify'|'max-profit'} riskBias วิธีถ่วง score ตอนเรียง candidate
 */

/**
 * หนึ่งรายการจัดสรร: กิจกรรม X ลงโซน Y ขายตลาด Z จำนวน N หน่วย
 * @typedef {Object} Placement
 * @property {string} activityId
 * @property {string} zoneId
 * @property {string} marketId
 * @property {number} units
 * @property {number} startWeek      สัปดาห์เริ่ม (default 1, engine แนะนำเลื่อนได้)
 * @property {number} yieldMult      จาก suitability
 * @property {number} priceMult      จาก market + perishable penalty
 */

/**
 * ผลจำลองกระแสเงินสดรายสัปดาห์ — ดู DESIGN.md §6
 * @typedef {Object} CashflowResult
 * @property {WeekFlow[]} weekly           ยาว 52
 * @property {number} minBalance
 * @property {number} minBalanceWeek       1–52
 * @property {CashGap[]} cashGaps          ช่วงที่ balance < 0
 * @property {number[]} rolling13          [w] = ยอดต่ำสุดใน 13 สัปดาห์ข้างหน้านับจาก w
 * @property {number|null} firstWarningWeek สัปดาห์แรกที่ rolling13[w] < 0 (null = ไม่มี)
 * @property {number} loanNeeded           |minBalance| × 1.2 ปัดขึ้นเป็นพัน (0 ถ้าไม่ติดลบ)
 * @property {number|null} breakEvenWeek   สัปดาห์แรกที่กำไรสะสมคืนทุน
 * @property {string[]} suggestions        ข้อความแนะนำ rule-based ภาษาไทย
 */

/**
 * @typedef {Object} WeekFlow
 * @property {number} week     1–52
 * @property {number} income
 * @property {number} cost     ต้นทุนดำเนินงาน + ค่าขนส่ง
 * @property {number} invest   เงินลงทุนที่จ่ายสัปดาห์นี้ (สัปดาห์เริ่มกิจกรรม)
 * @property {number} net
 * @property {number} balance
 */

/**
 * @typedef {Object} CashGap
 * @property {number} fromWeek
 * @property {number} toWeek
 * @property {number} maxDeficit   ค่าติดลบลึกสุดในช่วง (บาทบวก)
 */

/**
 * ผลลัพธ์รวมของหนึ่งแผน
 * @typedef {Object} PlanResult
 * @property {PlanTemplate} template
 * @property {Placement[]} placements
 * @property {number} capUsed
 * @property {number} laborUsed
 * @property {Object<string, number>} areaUsedByZone  zoneId → ตร.ม.
 * @property {number} totalRevenue
 * @property {number} totalCost
 * @property {number} profit
 * @property {number} roi          % ต่อปี
 * @property {CashflowResult} cashflow
 */

export {}; // ไฟล์นี้มีแต่ typedef — ให้ tooling มองเป็น ES module
