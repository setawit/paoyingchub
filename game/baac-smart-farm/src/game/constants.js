// ค่าคงที่กติกาเกม — คัดจากเกมต้นฉบับ (index.html เดิม) ให้ตรงทุกตัว
// รวมไว้ที่เดียวเพื่อเป็น single source of truth ของตัวเลขสมดุลเกม

export const TOTAL_AREA = 1600;      // พื้นที่นา 1 ไร่ (ตร.ม.)
export const MAX_LABOR = 8;          // แรงงานสูงสุด (ชม./วัน)
export const INTEREST_RATE = 0.07;   // ดอกเบี้ยสินเชื่อ 7% ต่อปี

// วงเงินสินเชื่อหมุนเวียน (WC): limit = LIMIT_BASE + score * LIMIT_PER_SCORE
export const LIMIT_BASE = 20000;
export const LIMIT_PER_SCORE = 300;

export const CREDIT_BONUS = 50000;   // วงเงินเสริมเมื่อปลดล็อกเครดิต (green)
export const GREEN_SCORE = 70;       // คะแนนเครดิตที่ปลดล็อก CapEx
export const MELON_CAPEX = 25000;    // มูลค่า CapEx เมล่อน (= investment ต่อหน่วย)
export const CAPEX_INSTALLMENTS = 6; // จำนวนงวดผ่อน CapEx
export const CAPEX_MONTHS = 4;       // เดือนต่อรอบที่ใช้คิดดอก CapEx
export const TURN_MONTHS = 4;        // 1 รอบ = 4 เดือน
export const GAME_OVER_CASH = -5000; // เงินติดลบเกินระดับนี้ = Game Over

export const START_STATE = {
  cash: 5000,
  score: 50,
  month: 5,
  year: 1,
};
