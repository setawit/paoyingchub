// SaveLoad — บันทึก/โหลดเกมผ่าน localStorage (มี versioned key กัน schema เก่า)

const KEY = 'baac-smart-farm:v1';

/** บันทึก state ทั้งก้อนลง localStorage — คืน true ถ้าสำเร็จ */
export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // เช่น localStorage ปิด/เต็ม
  }
}

/** โหลด state จาก localStorage — คืน object หรือ null ถ้าไม่มี/พัง */
export function loadGame() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** ลบเซฟ */
export function deleteSave() {
  try {
    localStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}

/** มีเซฟอยู่หรือไม่ (ใช้ตัดสินว่าจะเล่น tutorial ไหม) */
export function hasSave() {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}
