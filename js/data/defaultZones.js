/**
 * โซนแปลงตั้งต้น — ตัวอย่างฟาร์ม 1 ไร่ (1,600 ตร.ม.) แบ่ง 3 โซนคุณภาพไม่เท่ากัน
 * ผู้ใช้แก้/เพิ่ม/ลบได้ในแท็บ "แปลงดิน"
 * @type {import('../types.js').PlotZone[]}
 */
export const DEFAULT_ZONES = [
  {
    id: 'zone-a', name: 'แปลงหน้าบ้าน', areaSqm: 500,
    soilType: 'loam', waterAccess: 0.9, floodRisk: 'low',
    note: 'ดินดี ใกล้บ่อน้ำ เหมาะผัก/เห็ด',
  },
  {
    id: 'zone-b', name: 'แปลงกลาง', areaSqm: 700,
    soilType: 'clay', waterAccess: 0.6, floodRisk: 'medium',
    note: 'ดินเหนียว หน้าฝนแฉะ เหมาะข้าวโพด/กล้วย',
  },
  {
    id: 'zone-c', name: 'แปลงหลัง (ดอน)', areaSqm: 400,
    soilType: 'sandy', waterAccess: 0.3, floodRisk: 'low',
    note: 'ดินทราย ไกลน้ำ เหมาะตะไคร้/เล้าไก่/บ่อปลา',
  },
];

/**
 * ตลาดตั้งต้น 2 แห่ง
 * @type {import('../types.js').Market[]}
 */
export const DEFAULT_MARKETS = [
  {
    id: 'market-village', name: 'ตลาดนัดหมู่บ้าน', distanceKm: 3,
    priceFactor: 1.10, transportCostPerTrip: 30, tripsPerWeek: 3,
    acceptsCategories: ['vegetable', 'livestock', 'aquaculture', 'fruit-tree'],
  },
  {
    id: 'market-district', name: 'ตลาดสด/พ่อค้าคนกลางอำเภอ', distanceKm: 18,
    priceFactor: 0.95, transportCostPerTrip: 120, tripsPerWeek: 1,
    acceptsCategories: ['vegetable', 'livestock', 'aquaculture', 'fruit-tree', 'field-crop'],
  },
];
