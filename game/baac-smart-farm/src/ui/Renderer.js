// Renderer — ประกอบ HTML หลักของเกม (sidebar ซ้าย/ขวา + center)
// รับ state ทั้งก้อน แล้วคืน HTML string เดียว (UIManager นำไป inject เข้า #app)

import { simulateTurn } from '../game/Simulation.js';
import { calcDSCR, getDSCRClass } from '../game/LoanEngine.js';
import { creditLimit } from '../game/GameState.js';
import { formatMoney } from '../utils/helpers.js';
import { TOTAL_AREA, MAX_LABOR } from '../game/constants.js';
import { buildHUD } from './HUD.js';
import { buildFarmMap } from './FarmMap.js';

const MENUS = [['🗺️', 'แผนที่'], ['📋', 'ออเดอร์'], ['🏪', 'ตลาด'], ['📊', 'รายงาน']];
const TOOLS = [
  ['🧺', 'เก็บเกี่ยว'], ['🌱', 'ปลูก'], ['🐔', 'สัตว์'], ['🔨', 'ก่อสร้าง'],
  ['📦', 'คลัง'], ['🏪', 'ร้านค้า'], ['👥', 'เพื่อนบ้าน'],
];

export function buildGame(state) {
  const r = simulateTurn(state);
  const d = calcDSCR(state, r);
  const cl = getDSCRClass(d);
  const stars = Math.floor(state.score / 20);

  return `<div class="game">
    <aside class="side left">
      ${MENUS.map((x, i) => `<button class="menu ${i ? '' : 'active'}">${x[0]} <span>${x[1]}</span></button>`).join('')}
      <div class="character"><div class="avatar">👨‍💼</div><b class="gold">พี่เกษม</b><small>พนักงาน ธ.ก.ส.</small><div>❤️❤️❤️</div></div>
      <div class="character"><div class="avatar">👩‍🌾</div><b class="gold">มิน</b><small>ที่ปรึกษาเกษตร</small><div>💛💛💛</div></div>
    </aside>
    <main class="center">
      ${buildHUD(state)}
      ${buildFarmMap(state)}
      <footer class="bottom">${TOOLS.map((x) => `<button class="tool" data-action="activities">${x[0]}<br>${x[1]}</button>`).join('')}</footer>
    </main>
    <aside class="side right">
      <div class="section-title">📊 มิเตอร์ DSCR</div>
      <div class="panel"><small>สถานะการกู้</small>
        <div class="dscr ${cl}">${d === 999 ? '—' : d.toFixed(2)}</div>
        <div class="bar ${cl}"><i style="width:${d === 999 ? 100 : Math.min(100, (d / 2) * 100)}%"></i></div>
        <div style="text-align:center">${d === 999 ? '⚪ ไม่มีหนี้' : d >= 1.5 ? '🟢 สบาย' : d >= 1.1 ? '🟡 ตึง' : '🔴 เสี่ยง'}</div>
      </div>
      <div class="section-title">⭐ เครดิตสกอร์</div>
      <div class="panel" style="text-align:center">${'⭐'.repeat(stars)}${'☆'.repeat(5 - stars)}<br>${state.score}/100</div>
      <div class="section-title">💰 สินเชื่อ</div>
      <div class="panel">
        <div class="row"><span>วงเงิน WC</span><b>${formatMoney(creditLimit(state))}</b></div>
        <div class="row"><span>ค้าง WC</span><b>${formatMoney(state.wc)}</b></div>
        <div class="row"><span>CapEx</span><b>${state.green ? 'ปลดล็อก' : '🔒 ล็อก'}</b></div>
        <div class="row"><span>ดอกเบี้ย</span><b>7%</b></div>
      </div>
      <div class="end">
        <div class="section-title">📈 สรุปรอบ</div>
        <div class="panel">
          <div class="row"><span>รอบ</span><b>${state.turn}</b></div>
          <div class="row"><span>รายได้/ด.</span><b class="safe">${formatMoney(r.income)}</b></div>
          <div class="row"><span>ต้นทุน/ด.</span><b class="danger">${formatMoney(r.cost)}</b></div>
          <div class="row"><span>พื้นที่</span><b>${r.area}/${TOTAL_AREA}</b></div>
          <div class="row"><span>แรงงาน</span><b>${r.labor.toFixed(1)}/${MAX_LABOR}</b></div>
        </div>
        <button class="btn primary" style="width:100%" data-action="run" ${r.errors.length ? 'disabled' : ''}>⚡ จบรอบ ${state.turn}</button>
        <div class="error">${r.errors.join(', ')}</div>
      </div>
    </aside>
  </div>`;
}
