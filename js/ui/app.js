/**
 * App — router 5 แท็บ + wiring หลัก
 * Spec: DESIGN.md §7
 *
 * แท็บ: #tab-farm | #tab-catalog | #tab-zones | #tab-markets | #tab-results
 * แต่ละแท็บมี view module ของตัวเอง (catalogView.js, zonesView.js, ...)
 * ที่ export ฟังก์ชัน render(containerEl) เดียว
 *
 * flow หลักของปุ่ม "วิเคราะห์":
 *   1. farm = loadFarm(), catalog = loadCatalog()
 *   2. results = PLAN_TEMPLATES.map(t => {
 *        placements = allocate(t, farm, catalog)
 *        cashflow   = simulateCashflow(placements, catalog, farm.markets, farm.cashReserve)
 *        return { template: t, placements, cashflow, ...summarizeUsage(...) }
 *      })
 *   3. resultsView.render(results) แล้วสลับไปแท็บผลวิเคราะห์
 *
 * TODO (Copilot): implement ตามลำดับใน DESIGN.md §8 — ทำ view ทีละไฟล์
 * catalogView ก่อน (ฟอร์มเพิ่มพืช/สัตว์คือ requirement หลัก)
 */

// import { loadCatalog } from '../store/catalogStore.js';
// import { loadFarm } from '../store/farmStore.js';
// import { PLAN_TEMPLATES, allocate, summarizeUsage } from '../engine/allocation.js';
// import { simulateCashflow } from '../engine/cashflow.js';

export function initApp() {
  // TODO: tab switching + เรียก render ของแต่ละ view
  throw new Error('not implemented');
}
