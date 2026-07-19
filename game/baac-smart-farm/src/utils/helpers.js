// ฟังก์ชันทั่วไปที่ใช้ซ้ำทั้งเกม — ไม่มี state ภายใน (pure)

/** จัดรูปแบบเงินบาทแบบไทย เช่น 12000 -> "12,000" */
export const formatMoney = (n) => Math.round(n).toLocaleString('th-TH');

/** สุ่มจำนวนเต็มในช่วง [min, max] (รวมปลายทั้งสอง) */
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/** สุ่มเลขทศนิยมในช่วง [min, max) */
export const randomFloat = (min, max) => Math.random() * (max - min) + min;

/** บีบค่าให้อยู่ในช่วง [min, max] */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** สุ่มหยิบสมาชิกหนึ่งตัวจาก array */
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
