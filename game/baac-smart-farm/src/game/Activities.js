// แคตตาล็อกกิจกรรมการผลิต — ยกมาจากเกมต้นฉบับให้ตรงทุกค่า
// รูปแบบแถวดิบ: [id, name, icon, area, investment, labor, income, cost, cashInMonth, maxUnits]
//   area        = พื้นที่ที่ใช้ (ตร.ม.) ต่อหน่วย
//   investment  = เงินลงทุนตั้งต้น (บาท) ต่อหน่วย
//   labor       = แรงงาน (ชม.) ต่อหน่วย
//   income      = รายได้ต่อเดือน (บาท) ต่อหน่วย  ← ใช้เป็น "ราคาฐาน" ของตลาด
//   cost        = ต้นทุนต่อเดือน (บาท) ต่อหน่วย
//   cashInMonth = เริ่มมีรายได้เข้าเดือนที่เท่าไร (delay กระแสเงินสด)
//   maxUnits    = จำนวนหน่วยสูงสุดที่วางได้

const RAW = [
  ['chicken', 'คอกไก่', '🐔', 25, 9000, 1, 2700, 1800, 2, 3],
  ['veggie', 'แปลงผัก', '🥬', 100, 4000, 1.8, 2200, 450, 2, 5],
  ['catfish', 'บ่อปลา', '🐟', 16, 5000, 0.5, 1400, 850, 5, 4],
  ['mushroom', 'โรงเห็ด', '🍄', 30, 12000, 1.5, 4500, 1500, 1, 2],
  ['cricket', 'บ่อจิ้งหรีด', '🦗', 20, 6000, 0.8, 2600, 1000, 2, 3],
  ['frog', 'บ่อกบ', '🐸', 15, 4500, 0.6, 1800, 900, 4, 4],
  ['duck', 'คอกเป็ด', '🦆', 50, 11000, 1.2, 3200, 2100, 2, 2],
  ['quail', 'คอกนกกระทา', '🐦', 12, 5500, 0.7, 2300, 1600, 1, 4],
  ['worm', 'บ่อไส้เดือน', '🪱', 10, 3000, 0.4, 900, 250, 2, 5],
  ['salad', 'แปลงสลัด', '🥗', 50, 7000, 1.5, 3000, 800, 2, 3],
  ['lime', 'สวนมะนาว', '🍋', 60, 8000, 0.6, 1800, 400, 8, 3],
  ['banana', 'สวนกล้วย', '🍌', 200, 2500, 0.4, 1400, 200, 9, 2],
  ['bee', 'ชันโรงผึ้ง', '🐝', 6, 8000, 0.2, 1200, 100, 6, 5],
  ['melon', 'โรงเรือนเมล่อน', '🍈', 80, 25000, 2, 6000, 1800, 3, 1],
];

export const ACTIVITIES = RAW.map((x) => ({
  id: x[0],
  name: x[1],
  icon: x[2],
  area: x[3],
  investment: x[4],
  labor: x[5],
  income: x[6],
  cost: x[7],
  cashInMonth: x[8],
  maxUnits: x[9],
  requiresCapex: x[0] === 'melon', // เมล่อนต้องใช้สินเชื่อลงทุน (CapEx)
}));

export const getActivityById = (id) => ACTIVITIES.find((a) => a.id === id);

export const getMaxUnits = (id) => {
  const a = getActivityById(id);
  return a ? a.maxUnits : 0;
};

export const isCapExRequired = (id) => {
  const a = getActivityById(id);
  return !!(a && a.requiresCapex);
};
