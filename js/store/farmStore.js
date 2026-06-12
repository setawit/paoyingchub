/**
 * Farm Store — FarmConfig + โซนแปลง + ตลาด (persist localStorage)
 * Spec: DESIGN.md §3.2–3.4, §7 แท็บ 1/3/4
 */
import { DEFAULT_ZONES, DEFAULT_MARKETS } from '../data/defaultZones.js';

const LS_KEY = 'farmplan.farm.v3';

/**
 * โหลด config ฟาร์ม (ถ้าไม่เคยเซฟ ใช้ default 1 ไร่)
 * @returns {import('../types.js').FarmConfig}
 */
export function loadFarm() {
  // TODO: default = { capital: 30000, cashReserve: 10000, laborHoursPerDay: 6,
  //                   zones: DEFAULT_ZONES, markets: DEFAULT_MARKETS }
  throw new Error('not implemented');
}

/** @param {import('../types.js').FarmConfig} cfg */
export function saveFarm(cfg) {
  // TODO: validate แล้วเขียน localStorage
  throw new Error('not implemented');
}

/** upsert โซนแปลงตาม id @param {import('../types.js').PlotZone} zone */
export function saveZone(zone) { throw new Error('not implemented'); }

/** @param {string} zoneId */
export function deleteZone(zoneId) { throw new Error('not implemented'); }

/** upsert ตลาดตาม id @param {import('../types.js').Market} market */
export function saveMarket(market) { throw new Error('not implemented'); }

/** @param {string} marketId */
export function deleteMarket(marketId) { throw new Error('not implemented'); }

/**
 * ตรวจ FarmConfig: ตัวเลข > 0, มีอย่างน้อย 1 โซน 1 ตลาด,
 * waterAccess 0–1, soilType/floodRisk อยู่ใน enum
 * @param {unknown} cfg
 * @returns {string[]} errors ภาษาไทย
 */
export function validateFarm(cfg) { throw new Error('not implemented'); }
