// ModalManager — จัดการ modal ทั้งหมด (เลือกกิจกรรม, สินเชื่อ, NPC, เหตุการณ์, tutorial, ข้อความ)
// รับ onAction เพื่อ delegate การคลิกปุ่มในโมดัลกลับไปให้ Game

import { ACTIVITIES } from '../game/Activities.js';
import { simulateTurn } from '../game/Simulation.js';
import { getPriceMultiplier } from '../game/Market.js';
import { creditLimit } from '../game/GameState.js';
import { formatMoney } from '../utils/helpers.js';
import { TOTAL_AREA, MAX_LABOR } from '../game/constants.js';

export class ModalManager {
  constructor(overlay, modalEl, onAction) {
    this.overlay = overlay;
    this.modalEl = modalEl;
    // คลิกพื้นหลังนอกโมดัล = ปิด
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    // delegate คลิกปุ่มภายในโมดัล
    this.modalEl.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (el) onAction(el.dataset.action, el.dataset, e);
    });
  }

  show(html) {
    this.modalEl.innerHTML = html;
    this.overlay.classList.add('show');
  }
  close() {
    this.overlay.classList.remove('show');
  }
  isOpen() {
    return this.overlay.classList.contains('show');
  }

  showActivityModal(state) { this.show(buildActivityModal(state)); }
  showLoanModal(state) { this.show(buildLoanModal(state)); }
  showNPCDialog(key) { this.show(buildNPCDialog(key)); }
  showEventPopup(ev) { this.show(buildEventPopup(ev)); }
  showTutorialStep(step, idx, total, last) { this.show(buildTutorialStep(step, idx, total, last)); }
  showMessage(title, body) { this.show(buildMessage(title, body)); }
  showGameOver() { this.show(buildGameOver()); }
}

// ---- builders ----

function buildActivityModal(state) {
  const r = simulateTurn(state);
  const cards = ACTIVITIES.map((a) => {
    const n = state.sel[a.id] || 0;
    const locked = a.requiresCapex && !state.green;
    const ok = !locked && n < a.maxUnits && r.area + a.area <= TOTAL_AREA && r.labor + a.labor <= MAX_LABOR;
    const mult = getPriceMultiplier(state, a.id);
    const priceCls = mult > 1 ? 'price-up' : mult < 1 ? 'price-down' : '';
    const arrow = mult > 1 ? '▲' : mult < 1 ? '▼' : '';
    const counter = locked
      ? '<small class="gold">🔒 ต้องเครดิต 70+</small>'
      : `<div class="counter">
           <button data-action="count" data-id="${a.id}" data-delta="-1" ${n ? '' : 'disabled'}>−</button>
           <b>${n}</b>
           <button data-action="count" data-id="${a.id}" data-delta="1" ${ok ? '' : 'disabled'}>+</button>
         </div>`;
    return `<div class="card ${n ? 'selected' : ''}" style="${locked ? 'opacity:.45' : ''}">
      <div class="ico">${a.icon}</div><b>${a.name}</b>
      <small>📐 ${a.area} ตร.ม.　💰 ${formatMoney(a.investment)} ฿<br>
        📈 ${formatMoney(a.income * mult)}/ด. <span class="${priceCls}">${arrow}${Math.round(mult * 100)}%</span></small>
      ${counter}
    </div>`;
  }).join('');

  return `<h2>🌱 เลือกกิจกรรมการผลิต</h2>
    <p style="text-align:center">📐 ${r.area}/${TOTAL_AREA} ตร.ม.　👨‍🌾 ${r.labor.toFixed(1)}/${MAX_LABOR} ชม.　💰 ${formatMoney(r.investment)} ฿</p>
    <div class="cards">${cards}</div>
    <div class="actions">
      <button class="btn primary" data-action="close">✅ เสร็จสิ้น</button>
      <button class="btn" data-action="reset-sel">🔄 รีเซ็ต</button>
    </div>`;
}

function buildLoanModal(state) {
  return `<h2>🏦 ธ.ก.ส. สินเชื่อเกษตรกร</h2>
    <div class="cards">
      <div class="card"><div class="ico">💧</div><b>สินเชื่อหมุนเวียน</b>
        <small>วงเงิน ${formatMoney(creditLimit(state))} บาท<br>กู้ต้นรอบ คืนปลายรอบ</small></div>
      <div class="card"><div class="ico">🏗️</div><b>สินเชื่อลงทุน</b>
        <small>${state.green ? '✅ ปลดล็อก' : '🔒 ต้องเครดิต 70+'}<br>ผ่อน 6 งวด ลดต้นลดดอก</small></div>
    </div>
    <div class="actions"><button class="btn primary" data-action="close">ปิด</button></div>`;
}

function buildNPCDialog(key) {
  const p = key === 'kasem'
    ? ['👨‍💼', 'พี่เกษม', 'พนักงานสินเชื่อ ธ.ก.ส.', 'ก่อนกู้ พี่จะกางมิเตอร์ DSCR ให้ดูก่อนเซ็นทุกครั้ง รายได้ต้องรองรับหนี้ได้สบายครับ']
    : ['👩‍🌾', 'มิน', 'ที่ปรึกษาเกษตร', 'ถ้าดินแห้ง แนะนำจิ้งหรีดหรือชันโรง ใช้น้ำน้อยและมีตลาดค่ะ'];
  return `<div class="dialog"><div class="face">${p[0]}</div>
    <div><h2 style="text-align:left">${p[1]} <small>• ${p[2]}</small></h2><p>${p[3]}</p>
    <button class="btn primary" data-action="close">รับทราบ</button></div></div>`;
}

function buildEventPopup(ev) {
  const eff = [];
  if (ev.incomeFactor != null) eff.push(`รายได้เดือนนี้ ×${ev.incomeFactor}`);
  if (ev.cashDelta) eff.push(`เงินสด ${ev.cashDelta > 0 ? '+' : ''}${formatMoney(ev.cashDelta)}฿`);
  if (ev.scoreDelta) eff.push(`เครดิต ${ev.scoreDelta > 0 ? '+' : ''}${ev.scoreDelta}`);
  const emoji = ev.title.split(' ')[0];
  return `<div class="event-pop">
    <div class="big">${emoji}</div><h2>${ev.title}</h2><p>${ev.desc}</p>
    <div class="eff">${eff.join(' · ')}</div>
    <button class="btn primary" data-action="event-next">รับทราบ</button></div>`;
}

function buildTutorialStep(step, idx, total, last) {
  const dots = Array.from({ length: total }, (_, i) => (i < idx ? '●' : '○')).join('');
  return `<div class="tut-step"><h2>${step.title}</h2><p>${step.body}</p>
    <div class="tut-dots">${dots}</div>
    <button class="btn primary" data-action="tutorial-next">${last ? 'เริ่มเล่น 🌾' : 'ถัดไป ▶'}</button></div>`;
}

function buildMessage(title, body) {
  return `<div class="event-pop"><h2>${title}</h2><p>${body}</p>
    <button class="btn primary" data-action="close">ตกลง</button></div>`;
}

function buildGameOver() {
  return `<div class="event-pop"><div class="big">💔</div><h2>Game Over</h2>
    <p>เงินหมดและภาระหนี้สูงเกินไป ลองวางแผนใหม่ให้รายได้รองรับหนี้ได้</p>
    <button class="btn primary" data-action="restart">เริ่มใหม่</button></div>`;
}
