'use strict';

/* ════════════════════════════════════════════════════════════════════
   ข้อมูลกิจกรรมการผลิต (ต่อ 1 หน่วย)
   area ตร.ม. | investment บาท | laborPerDay ชม. | waterPerDay ลิตร
   cashStart = เดือนแรกที่มีรายได้ | cashCycle 0 = รายเดือน, n = ทุก n เดือน
   ════════════════════════════════════════════════════════════════════ */
const ACTIVITIES = {
  chicken: {
    name: 'เลี้ยงไก่ไข่', icon: '🐔', unitDesc: 'ชุด (20 ตัว)',
    area: 25, investment: 9000, laborPerDay: 1.0, waterPerDay: 40,
    monthlyRevenue: 2700, monthlyCost: 1800,
    cashStart: 2, cashCycle: 0, waterNeed: 'low',
    maxUnits: 5,
  },
  veggie: {
    name: 'ปลูกผักสวนครัว', icon: '🥬', unitDesc: 'แปลง (100 ตร.ม.)',
    area: 100, investment: 4000, laborPerDay: 1.8, waterPerDay: 250,
    monthlyRevenue: 2200, monthlyCost: 450,
    cashStart: 2, cashCycle: 0, waterNeed: 'high',
    maxUnits: 8,
  },
  fish: {
    name: 'เลี้ยงปลาดุกบ่อพลาสติก', icon: '🐟', unitDesc: 'บ่อ (12 ตร.ม.)',
    area: 16, investment: 5000, laborPerDay: 0.5, waterPerDay: 100,
    monthlyRevenue: 1400, monthlyCost: 850,
    cashStart: 5, cashCycle: 5, waterNeed: 'medium',
    maxUnits: 4,
  },
  crop: {
    name: 'พืชไร่ (ข้าวโพดหวาน)', icon: '🌽', unitDesc: 'แปลง (400 ตร.ม.)',
    area: 400, investment: 2200, laborPerDay: 1.2, waterPerDay: 500,
    monthlyRevenue: 1500, monthlyCost: 300,
    cashStart: 3, cashCycle: 3, waterNeed: 'high',
    maxUnits: 3,
  },
};

/* ตลาด: ตัวคูณราคาขาย */
const MARKET = {
  near: { mult: 1.15, label: 'ใกล้' },
  mid:  { mult: 1.00, label: 'ปานกลาง' },
  far:  { mult: 0.82, label: 'ไกล' },
};

/* น้ำ: เพดานจำนวนหน่วยของกิจกรรมตามความต้องการน้ำ
   poor = น้ำจำกัด → กิจกรรมใช้น้ำมากถูกจำกัดแรง */
const WATER = {
  good:   { label: 'ดี',       capFactor: { low: 1.0, medium: 1.0, high: 1.0 } },
  medium: { label: 'ปานกลาง', capFactor: { low: 1.0, medium: 0.8, high: 0.6 } },
  poor:   { label: 'จำกัด',    capFactor: { low: 1.0, medium: 0.5, high: 0.25 } },
};

/* แผน 3 ระดับ: สัดส่วนทรัพยากรที่ยอมใช้ + ลำดับความสำคัญของกิจกรรม */
const PLAN_TEMPLATES = [
  {
    id: 'safe', label: 'แผนปลอดภัย', emoji: '🛡️',
    desc: 'ลงทุนต่ำ เสี่ยงน้อย รักษาสภาพคล่อง',
    capitalFrac: 0.50, areaFrac: 0.45, laborFrac: 0.55,
    priority: ['chicken', 'veggie', 'fish', 'crop'],
  },
  {
    id: 'balanced', label: 'แผนสมดุล', emoji: '⚖️',
    desc: 'กระจายความเสี่ยง รายได้สม่ำเสมอ',
    capitalFrac: 0.75, areaFrac: 0.70, laborFrac: 0.75,
    priority: ['veggie', 'chicken', 'fish', 'crop'],
  },
  {
    id: 'high', label: 'แผนผลตอบแทนสูง', emoji: '🚀',
    desc: 'ใช้ทรัพยากรเกือบเต็ม เน้นกำไรสูงสุด',
    capitalFrac: 0.95, areaFrac: 0.90, laborFrac: 0.95,
    priority: ['veggie', 'crop', 'chicken', 'fish'],
  },
];

const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

let CURRENT_RESULTS = [];

/* ── helpers ─────────────────────────────────────────────────────── */
const fmt = n => Math.round(n).toLocaleString('th-TH');
const fmtSign = n => (n >= 0 ? '+' : '−') + fmt(Math.abs(n));

/* ════════════════════════════════════════════════════════════════════
   เครื่องจัดสรรทรัพยากร: greedy เติมทีละหน่วยตามลำดับ priority
   ทุกกิจกรรมแย่งใช้ pool เดียวกัน (ทุน/พื้นที่/แรงงาน) จนกว่าจะเต็ม
   ════════════════════════════════════════════════════════════════════ */
function allocate(template, cfg) {
  const market = MARKET[cfg.marketDistance];
  const water  = WATER[cfg.waterSource];

  let capLeft   = cfg.capital    * template.capitalFrac;
  let areaLeft  = cfg.area       * template.areaFrac;
  let laborLeft = cfg.laborHours * template.laborFrac;

  const chosen = {};
  Object.keys(ACTIVITIES).forEach(k => chosen[k] = 0);

  // เพดานหน่วยต่อกิจกรรมหลังหักข้อจำกัดน้ำ
  const unitCap = {};
  for (const k of Object.keys(ACTIVITIES)) {
    unitCap[k] = Math.floor(ACTIVITIES[k].maxUnits * water.capFactor[ACTIVITIES[k].waterNeed]);
  }

  // วนเติมทีละหน่วยตามลำดับ priority จนไม่มีอะไรเพิ่มได้
  let added = true;
  while (added) {
    added = false;
    for (const key of template.priority) {
      const a = ACTIVITIES[key];
      if (chosen[key] >= unitCap[key]) continue;
      if (a.investment > capLeft || a.area > areaLeft || a.laborPerDay > laborLeft) continue;
      chosen[key]++;
      capLeft   -= a.investment;
      areaLeft  -= a.area;
      laborLeft -= a.laborPerDay;
      added = true;
    }
  }

  /* ── จำลองกระแสเงินสด 12 เดือน ── */
  const flows = [];
  for (let mo = 1; mo <= 12; mo++) {
    let income = 0, cost = 0;
    for (const key of Object.keys(ACTIVITIES)) {
      const units = chosen[key];
      if (!units) continue;
      const a = ACTIVITIES[key];
      const rev = a.monthlyRevenue * market.mult * units;
      cost += a.monthlyCost * units;

      if (mo < a.cashStart) continue;
      if (a.cashCycle === 0) {
        income += rev;
      } else if ((mo - a.cashStart) % a.cashCycle === 0) {
        income += rev * a.cashCycle;
      }
    }
    flows.push({ income, cost, net: income - cost });
  }

  const capUsed = Object.keys(chosen).reduce((s, k) => s + chosen[k] * ACTIVITIES[k].investment, 0);

  let balance = cfg.cashReserve;   // เงินลงทุนหักไปแล้ว เหลือเงินสำรองเป็นเงินหมุน
  let minBalance = balance;
  const cashFlow = flows.map(f => {
    balance += f.net;
    if (balance < minBalance) minBalance = balance;
    return { ...f, balance };
  });

  const totalRevenue = flows.reduce((s, f) => s + f.income, 0);
  const operatingCost = flows.reduce((s, f) => s + f.cost, 0);
  const totalCost = operatingCost + capUsed;
  const profit = totalRevenue - totalCost;
  const roi = capUsed > 0 ? (profit / capUsed) * 100 : 0;

  const laborUsed = Object.keys(chosen).reduce((s, k) => s + chosen[k] * ACTIVITIES[k].laborPerDay, 0);
  const areaUsed  = Object.keys(chosen).reduce((s, k) => s + chosen[k] * ACTIVITIES[k].area, 0);

  return {
    template, chosen, capUsed, areaUsed, laborUsed,
    cashFlow, totalRevenue, operatingCost, totalCost, profit, roi, minBalance,
    market, water, cfg,
  };
}

/* ════════════════ navigation ════════════════ */
function getFarmConfig() {
  const area        = parseFloat(document.getElementById('area').value);
  const capital     = parseFloat(document.getElementById('capital').value);
  const cashReserve = parseFloat(document.getElementById('cashReserve').value) || 0;
  const laborHours  = parseFloat(document.getElementById('laborHours').value);

  if (!(area > 0) || !(capital > 0) || !(laborHours > 0)) {
    alert('กรุณากรอกพื้นที่ เงินลงทุน และแรงงานให้ถูกต้อง');
    return null;
  }
  return {
    area, capital, cashReserve, laborHours,
    waterSource: document.getElementById('waterSource').value,
    marketDistance: document.getElementById('marketDistance').value,
  };
}

function showStep(n) {
  document.getElementById('step-1').classList.toggle('active', n === 1);
  document.getElementById('step-2').classList.toggle('active', n === 2);
  window.scrollTo({ top: 0 });
}

function analyze() {
  const cfg = getFarmConfig();
  if (!cfg) return;

  CURRENT_RESULTS = PLAN_TEMPLATES.map(t => allocate(t, cfg));

  renderSummaryBar(cfg);
  renderPlans();
  renderCompareTable();

  document.getElementById('detail-section').hidden = true;
  document.getElementById('cashflow-section').hidden = true;
  showStep(2);
}

/* ════════════════ rendering ════════════════ */
function renderSummaryBar(cfg) {
  document.getElementById('farm-summary-bar').innerHTML =
    `<span>📐 <strong>${fmt(cfg.area)}</strong> ตร.ม.</span>` +
    `<span>💰 ทุน <strong>${fmt(cfg.capital)}</strong> บาท</span>` +
    `<span>🏦 สำรอง <strong>${fmt(cfg.cashReserve)}</strong> บาท</span>` +
    `<span>👨‍🌾 <strong>${cfg.laborHours}</strong> ชม./วัน</span>` +
    `<span>💧 น้ำ: <strong>${WATER[cfg.waterSource].label}</strong></span>` +
    `<span>🏪 ตลาด: <strong>${MARKET[cfg.marketDistance].label}</strong></span>`;
}

function renderPlans() {
  // แผนแนะนำ = กำไรสูงสุดในบรรดาแผนที่เงินสดไม่ติดลบ (ถ้าติดลบหมด เลือกกำไรสูงสุด)
  const safeOnes = CURRENT_RESULTS.filter(r => r.minBalance >= 0 && r.profit > 0);
  const pool = safeOnes.length ? safeOnes : CURRENT_RESULTS;
  const best = pool.reduce((a, b) => (b.profit > a.profit ? b : a));

  const grid = document.getElementById('plans-grid');
  grid.innerHTML = '';
  CURRENT_RESULTS.forEach((r, idx) => grid.appendChild(buildPlanCard(r, idx, r === best)));
}

function buildPlanCard(r, idx, isBest) {
  const t = r.template;
  const hasActivity = Object.values(r.chosen).some(u => u > 0);

  let actRows = '';
  for (const [k, u] of Object.entries(r.chosen)) {
    if (!u) continue;
    const a = ACTIVITIES[k];
    actRows += `<div class="activity-row"><span>${a.icon} ${a.name}</span><span class="qty">${u} ${a.unitDesc}</span></div>`;
  }

  const ribbon  = isBest && hasActivity ? '<div class="best-ribbon">⭐ แนะนำ</div>' : '';
  const noAct   = hasActivity ? '' : '<div class="constraint-alert">⚠️ ทรัพยากรไม่พอสำหรับแผนนี้ — ลองเพิ่มทุนหรือแรงงาน</div>';
  const cashTag = r.minBalance < 0
    ? '<span class="tag-danger">🚨 เงินสดติดลบระหว่างปี</span>'
    : (r.minBalance < r.cfg.cashReserve * 0.3
        ? '<span class="tag-warning">⚠️ เงินสดตึงตัวบางเดือน</span>' : '');

  const roiPct = Math.min(Math.max(r.roi, 0), 120) / 1.2;

  const div = document.createElement('div');
  div.className = `plan-card ${t.id}`;
  div.innerHTML = `
    ${ribbon}
    <div class="plan-head"><span class="plan-emoji">${t.emoji}</span><span class="plan-label">${t.label}</span></div>
    <div class="plan-desc">${t.desc}</div>
    <div class="activity-list">${actRows}</div>
    ${noAct}
    <div class="plan-metrics">
      <div class="metric"><span class="lbl">เงินลงทุน</span><span class="val">${fmt(r.capUsed)} บาท</span></div>
      <div class="metric"><span class="lbl">กำไรสุทธิ/ปี</span><span class="val ${r.profit >= 0 ? 'pos' : 'neg'}">${fmtSign(r.profit)} บาท</span></div>
      <div class="metric"><span class="lbl">เงินสดต่ำสุด</span><span class="val ${r.minBalance >= 0 ? 'pos' : 'neg'}">${fmt(r.minBalance)} บาท</span></div>
      <div class="metric"><span class="lbl">ROI</span><span class="val">${r.roi.toFixed(0)}%</span></div>
      <div class="roi-bar-bg"><div class="roi-bar-fill" style="width:${roiPct}%"></div></div>
      ${cashTag}
    </div>
    <button class="btn-detail" data-idx="${idx}">ดูรายละเอียด & กระแสเงินสด</button>`;

  div.querySelector('.btn-detail').addEventListener('click', e => {
    showDetail(parseInt(e.currentTarget.dataset.idx, 10));
  });
  return div;
}

function renderCompareTable() {
  const heads = CURRENT_RESULTS.map(r => `<th>${r.template.emoji} ${r.template.label}</th>`).join('');
  const row = (label, fn, cls) =>
    `<tr><td>${label}</td>${CURRENT_RESULTS.map(r => `<td class="${cls ? cls(r) : ''}">${fn(r)}</td>`).join('')}</tr>`;

  document.getElementById('compare-table').innerHTML =
    `<thead><tr><th>ตัวชี้วัด</th>${heads}</tr></thead><tbody>` +
    row('เงินลงทุน (บาท)', r => fmt(r.capUsed)) +
    row('พื้นที่ที่ใช้ (ตร.ม.)', r => fmt(r.areaUsed)) +
    row('แรงงานที่ใช้ (ชม./วัน)', r => r.laborUsed.toFixed(1)) +
    row('รายได้รวม/ปี (บาท)', r => fmt(r.totalRevenue)) +
    row('ต้นทุนรวม/ปี (บาท)', r => fmt(r.totalCost)) +
    row('กำไรสุทธิ/ปี (บาท)', r => fmtSign(r.profit), r => r.profit >= 0 ? 'pos' : 'neg') +
    row('ROI (%)', r => r.roi.toFixed(0) + '%', r => r.roi >= 0 ? 'pos' : 'neg') +
    row('เงินสดต่ำสุด (บาท)', r => fmt(r.minBalance), r => r.minBalance >= 0 ? 'pos' : 'neg') +
    `</tbody>`;
}

function showDetail(idx) {
  const r = CURRENT_RESULTS[idx];
  renderDetail(r);
  renderCashflow(r);
  document.getElementById('detail-section').hidden = false;
  document.getElementById('cashflow-section').hidden = false;
  document.getElementById('detail-section').scrollIntoView({ behavior: 'smooth' });
}

function renderDetail(r) {
  const t = r.template;
  document.getElementById('detail-title').textContent = `${t.emoji} รายละเอียด — ${t.label}`;

  let rows = '';
  for (const [k, units] of Object.entries(r.chosen)) {
    if (!units) continue;
    const a = ACTIVITIES[k];
    rows += `<tr>
      <td>${a.icon} ${a.name}</td>
      <td>${units} ${a.unitDesc}</td>
      <td>${fmt(a.investment * units)}</td>
      <td>${fmt(a.monthlyRevenue * r.market.mult * units)}</td>
      <td>${fmt(a.monthlyCost * units)}</td>
      <td>เดือนที่ ${a.cashStart}${a.cashCycle ? ` (ทุก ${a.cashCycle} เดือน)` : ' (รายเดือน)'}</td>
    </tr>`;
  }
  if (!rows) rows = '<tr><td colspan="6" style="text-align:center;color:#9ca3af">ไม่มีกิจกรรม</td></tr>';

  const mPct = ((r.market.mult - 1) * 100).toFixed(0);
  const mLabel = r.market.mult === 1 ? 'ราคาตลาดปกติ' : (r.market.mult > 1 ? `ราคาดีกว่าปกติ +${mPct}%` : `ราคาถูกกด ${mPct}%`);

  const alert = r.minBalance < 0
    ? `<div class="constraint-alert">🚨 เงินสดติดลบสูงสุด <strong>${fmt(Math.abs(r.minBalance))} บาท</strong> —
       แผนนี้ต้องมีเงินสำรองเพิ่ม หรือเริ่มกิจกรรมที่ให้รายได้เร็ว (เช่น ผัก/ไก่ไข่) ก่อนกิจกรรมรอบยาว</div>`
    : '';

  document.getElementById('detail-body').innerHTML = `
    <div class="detail-table-wrap">
      <table class="activity-table">
        <thead><tr>
          <th>กิจกรรม</th><th>จำนวน</th><th>ลงทุน (บาท)</th>
          <th>รายได้/เดือน</th><th>ต้นทุน/เดือน</th><th>รอบรายได้</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="summary-strip">
      <span>💰 ลงทุน <strong>${fmt(r.capUsed)}</strong> บาท</span>
      <span>📥 รายได้/ปี <strong>${fmt(r.totalRevenue)}</strong> บาท</span>
      <span>📤 ต้นทุนดำเนินงาน/ปี <strong>${fmt(r.operatingCost)}</strong> บาท</span>
      <span>📈 กำไรสุทธิ <strong style="color:${r.profit >= 0 ? '#15803d' : '#dc2626'}">${fmtSign(r.profit)}</strong> บาท</span>
      <span>📊 ROI <strong>${r.roi.toFixed(0)}%</strong></span>
      <span>🏪 ${mLabel}</span>
    </div>
    ${alert}`;
}

function renderCashflow(r) {
  document.getElementById('cashflow-title').textContent =
    `📅 กระแสเงินสดรายเดือน — ${r.template.label}`;

  const balances = r.cashFlow.map(m => m.balance);
  const maxBal = Math.max(...balances, r.cfg.cashReserve, 1);

  document.getElementById('cashflow-chart').innerHTML = r.cashFlow.map((m, i) => {
    const h = Math.max(3, Math.round((Math.max(m.balance, 0) / maxBal) * 110));
    const cls = m.balance < 0 ? 'bad' : (m.balance < r.cfg.cashReserve * 0.3 ? 'warn' : 'ok');
    return `<div class="cf-col">
      <span class="cf-amount">${fmt(m.balance / 1000)}k</span>
      <div class="cf-bar ${cls}" style="height:${h}px" title="${MONTHS_TH[i]}: คงเหลือ ${fmt(m.balance)} บาท (รับ ${fmt(m.income)} / จ่าย ${fmt(m.cost)})"></div>
      <span class="cf-month">${MONTHS_TH[i]}</span>
    </div>`;
  }).join('');
}

/* ════════════════ wire up ════════════════ */
document.getElementById('analyzeBtn').addEventListener('click', analyze);
document.getElementById('backBtn').addEventListener('click', () => showStep(1));
