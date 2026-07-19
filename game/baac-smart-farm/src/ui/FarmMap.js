// FarmMap — แผนที่แปลงฟาร์ม isometric + panel ภารกิจ
// เก็บ layout ฉากฟาร์มเดิมไว้ และเพิ่ม class การเติบโตตามจำนวนรอบ

// ผังแปลงฐาน (24 ช่อง, กริด 6 คอลัมน์) — ยกจากเกมต้นฉบับ
const PLOTS = ['', '', '', '🥬', '🥬', '🐟', '', '', '', '🍄', '🍄', '', '', '🐟', '', '', '🐔', '🦆', '', '', '', '', '🐟', ''];
const WATER = [5, 13, 22];
const DIRT = [3, 4, 9, 10, 16, 17];

function buildQuestPanel(state) {
  const items = (state.quests || [])
    .map((q) => {
      const cls = q.claimed ? 'q-claimed' : q.done ? 'q-done' : '';
      const icon = q.claimed ? '🎁' : q.done ? '✅' : '⏳';
      const right = q.claimed
        ? '✔️'
        : q.done
          ? `<button class="claim" data-action="claim-quest" data-key="${q.key}">รับ</button>`
          : `${q.progressValue || 0}/${q.goal}`;
      return `<div class="q"><span class="${cls}">${icon} ${q.label}</span><span>${right}</span></div>`;
    })
    .join('');
  return `<div class="quest"><h3>📋 ภารกิจรอบนี้</h3>${items}
    <button class="btn primary" style="width:100%;margin-top:6px" data-action="activities">เลือกกิจกรรม</button></div>`;
}

export function buildFarmMap(state) {
  const growth = 'growth-' + Math.min(3, state.turn % 4);
  const cells = PLOTS.map((p, i) => {
    const type = WATER.includes(i) ? 'water' : DIRT.includes(i) ? 'dirt' : 'grass';
    const g = p ? ' ' + growth : '';
    return `<div class="cell ${type}${g}" data-action="activities">${p}</div>`;
  }).join('');

  return `<section class="viewport">
    <div class="bank" data-action="npc" data-npc="kasem"><b>🏦<br>ธ.ก.ส.</b></div>
    <div class="atm" data-action="loan">🏧</div>
    <div class="npc" style="left:22%;top:35%" data-action="npc" data-npc="kasem"><span class="avatar">👨‍💼</span><b>พี่เกษม</b></div>
    <div class="npc" style="left:14%;top:57%;animation-delay:.6s" data-action="npc" data-npc="min"><span class="avatar">👩‍🌾</span><b>มิน</b></div>
    <div class="grid">${cells}</div>
    ${buildQuestPanel(state)}
  </section>`;
}
