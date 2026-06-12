/**
 * กิจกรรมตั้งต้น 10 รายการ — seed data ของแคตตาล็อก
 * ตัวเลขเป็นค่าประมาณการระดับแนวคิด ผู้ใช้ควรปรับตามพื้นที่จริง
 * โครงสร้างแต่ละ field ดู js/types.js → Activity
 * @type {import('../types.js').Activity[]}
 */
export const DEFAULT_CATALOG = [
  {
    id: 'chicken-layer', name: 'ไก่ไข่', icon: '🐔', category: 'livestock',
    unitDesc: 'ชุด 20 ตัว', areaPerUnit: 25, investmentPerUnit: 9000,
    laborPerUnitPerDay: 1.0, waterNeed: 'low',
    soilPreference: { loam: 1.0, clay: 1.0, sandy: 1.0 },   // เล้ายกพื้น ไม่สนดิน
    weeklyCostPerUnit: 420,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 630, cycleWeeks: 1, firstIncomeWeek: 6 },
    maxUnits: 5, perishable: true, source: 'default',
  },
  {
    id: 'veggie-mixed', name: 'ผักสวนครัวรวม', icon: '🥬', category: 'vegetable',
    unitDesc: 'แปลง 100 ตร.ม.', areaPerUnit: 100, investmentPerUnit: 4000,
    laborPerUnitPerDay: 1.8, waterNeed: 'high',
    soilPreference: { loam: 1.0, clay: 0.7, sandy: 0.5 },
    weeklyCostPerUnit: 110,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 550, cycleWeeks: 1, firstIncomeWeek: 7 },
    maxUnits: 8, perishable: true, source: 'default',
  },
  {
    id: 'catfish-pond', name: 'ปลาดุกบ่อพลาสติก', icon: '🐟', category: 'aquaculture',
    unitDesc: 'บ่อ 12 ตร.ม.', areaPerUnit: 16, investmentPerUnit: 5000,
    laborPerUnitPerDay: 0.5, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 1.0, sandy: 0.9 },
    weeklyCostPerUnit: 200,
    revenue: { model: 'lump', grossPerUnitPerCycle: 7000, cycleWeeks: 20, firstIncomeWeek: 20 },
    maxUnits: 4, perishable: true, source: 'default',
  },
  {
    id: 'sweet-corn', name: 'ข้าวโพดหวาน', icon: '🌽', category: 'field-crop',
    unitDesc: 'แปลง 400 ตร.ม.', areaPerUnit: 400, investmentPerUnit: 2200,
    laborPerUnitPerDay: 1.2, waterNeed: 'high',
    soilPreference: { loam: 1.0, clay: 0.8, sandy: 0.6 },
    weeklyCostPerUnit: 70,
    revenue: { model: 'lump', grossPerUnitPerCycle: 4500, cycleWeeks: 10, firstIncomeWeek: 10 },
    maxUnits: 3, perishable: false, source: 'default',
  },
  {
    id: 'mushroom-house', name: 'เห็ดนางฟ้าโรงเรือน', icon: '🍄', category: 'vegetable',
    unitDesc: 'โรงเรือน 24 ตร.ม. (500 ก้อน)', areaPerUnit: 30, investmentPerUnit: 12000,
    laborPerUnitPerDay: 1.5, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 1.0, sandy: 1.0 },   // โรงเรือน ไม่สนดิน
    weeklyCostPerUnit: 150,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 1100, cycleWeeks: 1, firstIncomeWeek: 4 },
    maxUnits: 3, perishable: true, source: 'default',
  },
  {
    id: 'frog-pond', name: 'กบบ่อซีเมนต์', icon: '🐸', category: 'aquaculture',
    unitDesc: 'บ่อ 6 ตร.ม.', areaPerUnit: 9, investmentPerUnit: 4000,
    laborPerUnitPerDay: 0.4, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 1.0, sandy: 1.0 },
    weeklyCostPerUnit: 160,
    revenue: { model: 'lump', grossPerUnitPerCycle: 5200, cycleWeeks: 14, firstIncomeWeek: 14 },
    maxUnits: 4, perishable: true, source: 'default',
  },
  {
    id: 'lemongrass', name: 'ตะไคร้', icon: '🌿', category: 'field-crop',
    unitDesc: 'แปลง 200 ตร.ม.', areaPerUnit: 200, investmentPerUnit: 1500,
    laborPerUnitPerDay: 0.5, waterNeed: 'low',
    soilPreference: { loam: 1.0, clay: 0.9, sandy: 0.8 },   // ทนแล้ง ปลูกง่าย
    weeklyCostPerUnit: 30,
    revenue: { model: 'lump', grossPerUnitPerCycle: 3000, cycleWeeks: 18, firstIncomeWeek: 18 },
    maxUnits: 4, perishable: false, source: 'default',
  },
  {
    id: 'banana-namwa', name: 'กล้วยน้ำว้า', icon: '🍌', category: 'fruit-tree',
    unitDesc: 'แปลง 400 ตร.ม. (25 กอ)', areaPerUnit: 400, investmentPerUnit: 3000,
    laborPerUnitPerDay: 0.4, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 0.9, sandy: 0.6 },
    weeklyCostPerUnit: 40,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 800, cycleWeeks: 2, firstIncomeWeek: 40 },
    maxUnits: 2, perishable: false, source: 'default',     // ปีแรกรายได้ช้า — ตัวทดสอบ cash gap ชั้นดี
  },
  {
    id: 'duck-egg', name: 'เป็ดไข่', icon: '🦆', category: 'livestock',
    unitDesc: 'ชุด 15 ตัว', areaPerUnit: 40, investmentPerUnit: 7500,
    laborPerUnitPerDay: 0.9, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 1.0, sandy: 0.9 },
    weeklyCostPerUnit: 380,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 540, cycleWeeks: 1, firstIncomeWeek: 8 },
    maxUnits: 4, perishable: true, source: 'default',
  },
  {
    id: 'chili', name: 'พริกขี้หนู', icon: '🌶️', category: 'vegetable',
    unitDesc: 'แปลง 100 ตร.ม.', areaPerUnit: 100, investmentPerUnit: 2500,
    laborPerUnitPerDay: 1.0, waterNeed: 'medium',
    soilPreference: { loam: 1.0, clay: 0.75, sandy: 0.65 },
    weeklyCostPerUnit: 80,
    revenue: { model: 'recurring', grossPerUnitPerCycle: 700, cycleWeeks: 1, firstIncomeWeek: 11 },
    maxUnits: 6, perishable: false, source: 'default',     // พริกแห้งเก็บได้ → ไม่ perishable
  },
];
