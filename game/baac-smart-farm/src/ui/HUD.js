// HUD — แถบสถานะด้านบน (เงิน วงเงิน เครดิต เวลา ปุ่มเสียง)

import { formatMoney } from '../utils/helpers.js';
import { creditLimit } from '../game/GameState.js';

export function buildHUD(state) {
  return `<header class="hud">
    <div class="player"><span class="avatar">👨‍🌾</span><b>GM ปอง<br><small class="gold">Lv.${17 + state.turn}</small></b></div>
    <div class="resources">
      <span class="bubble">🪙 ${formatMoney(state.cash)}</span>
      <span class="bubble">💎 ${formatMoney(creditLimit(state))}</span>
      <span class="bubble">⭐ ${state.score}%</span>
    </div>
    <span class="bubble mute" data-action="toggle-mute" title="เปิด/ปิดเสียง">${state.muted ? '🔇' : '🔊'}</span>
    <span class="bubble">เดือน ${state.month} ปี ${state.year} ☀️</span>
  </header>`;
}
