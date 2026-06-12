/**
 * Catalog Store — CRUD รายการพืช/สัตว์ + persist ลง localStorage
 * Spec: DESIGN.md §3.1, §7 แท็บ 2
 */
import { DEFAULT_CATALOG } from '../data/defaultCatalog.js';

const LS_KEY = 'farmplan.catalog.v3';

/**
 * โหลด catalog: รวม DEFAULT_CATALOG กับรายการ user จาก localStorage
 * รายการ user ที่ id ชนกับ default ให้ทับ default (ผู้ใช้ clone แล้วแก้)
 * @returns {import('../types.js').Activity[]}
 */
export function loadCatalog() {
  // TODO: อ่าน localStorage[LS_KEY] (JSON array ของ user activities)
  // TODO: merge: default ก่อน แล้ว user override ตาม id
  // TODO: รายการที่ validateActivity ไม่ผ่าน ให้ข้ามและ console.warn
  throw new Error('not implemented');
}

/**
 * เพิ่มหรือแก้ไขกิจกรรม (upsert ตาม id) — เซฟเฉพาะรายการ source==='user'
 * @param {import('../types.js').Activity} activity
 * @returns {{ok: true} | {ok: false, errors: string[]}}
 */
export function saveActivity(activity) {
  // TODO: validateActivity ก่อน ถ้าไม่ผ่าน return errors
  // TODO: ตั้ง source='user', สร้าง id จากชื่อถ้ายังไม่มี (slugify + กันชน)
  // TODO: เขียนกลับ localStorage
  throw new Error('not implemented');
}

/**
 * ลบกิจกรรมของ user (default ลบไม่ได้ — UI ต้องซ่อนปุ่มลบอยู่แล้ว แต่กันซ้ำที่นี่ด้วย)
 * @param {string} id
 */
export function deleteActivity(id) {
  // TODO
  throw new Error('not implemented');
}

/**
 * clone รายการ default มาเป็นของ user เพื่อแก้ตัวเลขเอง
 * @param {string} id
 * @returns {import('../types.js').Activity} สำเนาใหม่ id เดิม + suffix '-custom'
 */
export function cloneActivity(id) {
  // TODO
  throw new Error('not implemented');
}

/**
 * ตรวจความถูกต้องของ Activity ก่อนบันทึก/import
 * @param {unknown} a
 * @returns {string[]} รายการ error ภาษาไทย (ว่าง = ผ่าน)
 */
export function validateActivity(a) {
  // TODO: เช็คครบทุก field ตาม types.js:
  //  - name ไม่ว่าง, category อยู่ใน 5 ค่า, ตัวเลขทุกตัว > 0
  //  - soilPreference มีครบ loam/clay/sandy ค่า 0–1.2
  //  - revenue.model ∈ {recurring, lump}, firstIncomeWeek ≤ 52
  //  - lump: firstIncomeWeek ควร = cycleWeeks (เตือนถ้าไม่ตรง ไม่ถึงกับ reject)
  throw new Error('not implemented');
}

/**
 * Export catalog ของ user เป็น JSON string (ให้ผู้ใช้ดาวน์โหลด/แชร์)
 * @returns {string}
 */
export function exportUserCatalog() {
  // TODO
  throw new Error('not implemented');
}

/**
 * Import JSON: validate ทุกตัว ตัวที่ผ่านค่อย save, คืนสรุปผล
 * @param {string} json
 * @returns {{imported: number, rejected: {name: string, errors: string[]}[]}}
 */
export function importCatalog(json) {
  // TODO
  throw new Error('not implemented');
}
