// ─── Activity definitions ─────────────────────────────────────────────────
// Each activity is defined per "unit" (see unitDesc).
// area: ตร.ม. | investment: บาท | laborPerDay: ชม. | waterPerDay: ล.
// monthlyRevenue / monthlyCost: บาท (before market multiplier)
// cashStart: เดือนที่ n เริ่มมีรายได้ | cashCycle: 0 = รายได้ทุกเดือน, n = รายได้ทุก n เดือน
const ACTIVITIES = {
  chicken: {
    name: 'เลี้ยงไก่ไข่',
    icon: '🐔',
    unitDesc: '20 ตัว',
    area: 25,
    investment: 9000,
    laborPerDay: 1.0,
    waterPerDay: 40,
    monthlyRevenue: 1890,
    monthlyCost: 1800,
    cashStart: 2,
    cashCycle: 0,
    waterSensitive: false,
  },
  veggie: {
    name: 'ปลูกผักสวนครัว',
    icon: '🥬',
    unitDesc: '100 ตร.ม.',
    area: 100,
    investment: 5000,
    laborPerDay: 2.0,
    waterPerDay: 200,
    monthlyRevenue: 2000,
    monthlyCost: 350,
    cashStart: 2,
    cashCycle: 0,
    waterSensitive: true,
  },
  fish: {
    name: 'เลี้ยงปลาในบ่อ',
    icon: '🐟',
    unitDesc: '1 บ่อ (8 ตร.ม.)',
    area: 12,
    investment: 4500,
    laborPerDay: 0.5,
    waterPerDay: 80,
    monthlyRevenue: 833,
    monthlyCost: 900,
    cashStart: 6,
    cashCycle: 6,
    waterSensitive: false,
  },
  crop: {
    name: 'พืชไร่ (ข้าวโพด)',
    icon: '🌽',
    unitDesc: '400 ตร.ม.',
    area: 400,
    investment: 2500,
    laborPerDay: 1.5,
    waterPerDay: 400,
    monthlyRevenue: 600,
    monthlyCost: 200,
    cashStart: 4,
    cashCycle: 4,
    waterSensitive: true,
  },
};

// Market distance → price multiplier on revenue
const MARKET_MULT = { near: 1.15, mid: 1.0, far: 0.82 };

// Water availability → allowed water-sensitive activities fraction
const WATER_FACTOR = { good: 1.0, medium: 0.75, poor: 0.45 };

// ─── Plan templates: fraction of each resource to use ──────────────────────
const PLAN_TEMPLATES = [
  {
    id: 'safe',
    label: 'แผนปลอดภัย',
    emoji: '🛡️',
    capitalFrac: 0.50,
    areaFrac:    0.50,
    laborFrac:   0.55,
    bias: { chicken: 3, fish: 2, veggie: 1, crop: 1 },
  },
  {
    id: 'balanced',
    label: 'แผนสมดุล',
    emoji: '⚖️',
    capitalFrac: 0.72,
    areaFrac:    0.72,
    laborFrac:   0.75,
    bias: { chicken: 2, fish: 2, veggie: 2, crop: 2 },
  },
  {
    id: 'high',
    label: 'แผนผลตอบแทนสูง',
    emoji: '🚀',
    capitalFrac: 0.90,
    areaFrac:    0.88,
    laborFrac:   0.92,
    bias: { veggie: 3, chicken: 3, crop: 2, fish: 1 },
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmt(n) {
  return Math.round(n).toLocaleString('th-TH');
}
function fmtSign(n) {
  return (n >= 0 ? '+' : '') + fmt(n);
}

// ─── Core allocation engine ───────────────────────────────────────────────
function allocate(template, farmConfig) {
  const { area, capital, laborHours, waterSource, marketDistance, cashReserve } = farmConfig;
  const mMult = MARKET_MULT[marketDistance];
  const wFactor = WATER_FACTOR[waterSource];

  const capBudget   = capital * template.capitalFrac;
  const areaAvail   = area   * template.areaFrac;
  const laborAvail  = laborHours * template.laborFrac;   // hours/day total

  // Distribute units by bias weight, respecting constraints
  const actKeys = Object.keys(ACTIVITIES);
  const totalBias = actKeys.reduce((s, k) => s + (template.bias[k] || 1), 0);

  const chosen = {}; // key → units
  let capUsed = 0, areaUsed = 0, laborUsed = 0;

  // First pass: ideal units from capital fraction weighted by bias
  for (const key of actKeys) {
    const act = ACTIVITIES[key];
    const biasFrac = (template.bias[key] || 1) / totalBias;

    // Cap allocation for this activity
    let maxByCapital = Math.floor((capBudget * biasFrac) / act.investment);
    let maxByArea    = Math.floor(areaAvail / act.area);
    let maxByLabor   = Math.floor(laborAvail / act.laborPerDay);

    // Water-sensitive crops get reduced when water is scarce
    if (act.waterSensitive) {
      maxByArea = Math.floor(maxByArea * wFactor);
    }

    const units = Math.max(0, Math.min(maxByCapital, maxByArea, maxByLabor));
    chosen[key] = units;
    capUsed   += units * act.investment;
    areaUsed  += units * act.area;
    laborUsed += units * act.laborPerDay;
  }

  // Build monthly cash-flow over 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    let income = 0, cost = 0;
    for (const key of actKeys) {
      const act = ACTIVITIES[key];
      const units = chosen[key];
      if (units === 0) continue;

      const actRevenue = act.monthlyRevenue * mMult * units;
      const actCost    = act.monthlyCost * units;

      const mo = i + 1; // 1-indexed month
      if (mo < act.cashStart) {
        // still in setup — only costs
        cost += actCost;
        continue;
      }
      if (act.cashCycle === 0) {
        // monthly income
        income += actRevenue;
        cost   += actCost;
      } else {
        // lump-sum every N months from cashStart
        const cyclesSoFar = Math.floor((mo - act.cashStart) / act.cashCycle);
        const prevCycles  = Math.floor((mo - act.cashStart - 1) / act.cashCycle);
        if (cyclesSoFar > prevCycles) {
          income += actRevenue * act.cashCycle;
        }
        cost += actCost;
      }
    }
    return { income, cost, net: income - cost };
  });

  // Running cash balance starting from cashReserve
  let balance = cashReserve;
  let minBalance = cashReserve;
  const cashFlow = months.map(m => {
    balance += m.net;
    if (balance < minBalance) minBalance = balance;
    return { ...m, balance };
  });

  const totalRevenue = cashFlow.reduce((s, m) => s + m.income, 0);
  const totalCost    = cashFlow.reduce((s, m) => s + m.cost, 0) + capUsed;
  const profit = totalRevenue - totalCost + cashReserve;
  const roi    = capUsed > 0 ? ((profit - cashReserve) / capUsed) * 100 : 0;

  return {
    template,
    chosen,
    capUsed,
    areaUsed,
    laborUsed,
    cashFlow,
    totalRevenue,
    totalCost,
    profit,
    roi,
    minBalance,
    mMult,
    farmConfig,
  };
}

// ─── Navigation ────────────────────────────────────────────────────────────
function goToStep1() {
  document.getElementById('step-1').classList.add('active');
  document.getElementById('step-2').classList.remove('active');
}

function goToStep2() {
  const farmConfig = getFarmConfig();
  if (!farmConfig) return;

  document.getElementById('step-1').classList.remove('active');
  document.getElementById('step-2').classList.add('active');

  renderSummaryBar(farmConfig);
  renderPlans(farmConfig);

  document.getElementById('detail-section').style.display  = 'none';
  document.getElementById('cashflow-section').style.display = 'none';
}

function getFarmConfig() {
  const area        = parseFloat(document.getElementById('area').value);
  const capital     = parseFloat(document.getElementById('capital').value);
  const cashReserve = parseFloat(document.getElementById('cashReserve').value);
  const laborHours  = parseFloat(document.getElementById('laborHours').value);
  const waterSource = document.getElementById('waterSource').value;
  const marketDistance = document.getElementById('marketDistance').value;

  if (!area || !capital || !laborHours) {
    alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    return null;
  }
  return { area, capital, cashReserve, laborHours, waterSource, marketDistance };
}

// ─── Render summary bar ────────────────────────────────────────────────────
function renderSummaryBar(cfg) {
  const wLabel = { good: 'ดี', medium: 'ปานกลาง', poor: 'จำกัด' };
  const mLabel = { near: 'ใกล้', mid: 'ปานกลาง', far: 'ไกล' };
  document.getElementById('farm-summary-bar').innerHTML = `
    <span>📐 พื้นที่: <strong>${fmt(cfg.area)} ตร.ม.</strong></span>
    <span>💰 ทุน: <strong>${fmt(cfg.capital)} บาท</strong></span>
    <span>🏦 สำรอง: <strong>${fmt(cfg.cashReserve)} บาท</strong></span>
    <span>👨‍🌾 แรงงาน: <strong>${cfg.laborHours} ชม./วัน</strong></span>
    <span>💧 น้ำ: <strong>${wLabel[cfg.waterSource]}</strong></span>
    <span>🏪 ตลาด: <strong>${mLabel[cfg.marketDistance]}</strong></span>
  `;
}

// ─── Render all 3 plan cards ────────────────────────────────────────────────
function renderPlans(farmConfig) {
  const grid = document.getElementById('plans-grid');
  grid.innerHTML = '';

  PLAN_TEMPLATES.forEach(template => {
    const result = allocate(template, farmConfig);
    const card = buildPlanCard(result);
    grid.appendChild(card);
  });
}

function buildPlanCard(result) {
  const { template, chosen, capUsed, profit, roi, minBalance, farmConfig } = result;
  const hasAnyActivity = Object.values(chosen).some(u => u > 0);

  const roiPct = Math.min(Math.max(roi, 0), 150); // clamp for bar width
  const profitClass = profit >= 0 ? 'positive' : 'negative';
  const minBalClass = minBalance >= 0 ? 'positive' : 'negative';
  const cashAlert = minBalance < 0
    ? `<div class="warning-tag">⚠️ เงินสดติดลบในบางเดือน</div>` : '';

  const activityLines = Object.entries(chosen)
    .filter(([, u]) => u > 0)
    .map(([k, u]) => {
      const act = ACTIVITIES[k];
      return `<div class="metric">
        <span class="metric-label">${act.icon} ${act.name}</span>
        <span class="metric-value">${u} ${act.unitDesc}</span>
      </div>`;
    }).join('');

  const noActivity = !hasAnyActivity
    ? `<div class="constraint-alert">⚠️ ทรัพยากรไม่เพียงพอสำหรับแผนนี้ กรุณาเพิ่มทุนหรือพื้นที่</div>` : '';

  const div = document.createElement('div');
  div.className = `plan-card ${template.id}`;
  div.innerHTML = `
    <div class="plan-badge">${template.emoji} ${template.label}</div>
    <div class="plan-name">${template.label}</div>

    ${activityLines}
    ${noActivity}

    <div style="margin-top:.8rem; padding-top:.8rem; border-top:1px solid #eee;">
      <div class="metric">
        <span class="metric-label">💰 ลงทุน</span>
        <span class="metric-value">${fmt(capUsed)} บาท</span>
      </div>
      <div class="metric">
        <span class="metric-label">📈 กำไร/ปี</span>
        <span class="metric-value ${profitClass}">${fmtSign(profit)} บาท</span>
      </div>
      <div class="metric">
        <span class="metric-label">💵 เงินสดต่ำสุด</span>
        <span class="metric-value ${minBalClass}">${fmt(minBalance)} บาท</span>
      </div>
    </div>

    <div class="roi-bar-wrap">
      <div class="metric">
        <span class="metric-label">📊 ROI</span>
        <span class="metric-value">${roi.toFixed(1)}%</span>
      </div>
      <div class="roi-bar-bg">
        <div class="roi-bar-fill" style="width:${roiPct}%"></div>
      </div>
    </div>
    ${cashAlert}
    <button class="btn-detail" onclick="showDetail(${JSON.stringify(template.id)}, ${JSON.stringify(result.farmConfig)})">
      ดูรายละเอียด & กระแสเงินสด
    </button>
  `;
  return div;
}

// ─── Show detail + cashflow for one plan ───────────────────────────────────
function showDetail(templateId, farmConfig) {
  const template = PLAN_TEMPLATES.find(t => t.id === templateId);
  const result   = allocate(template, farmConfig);

  renderDetail(result);
  renderCashflow(result);

  document.getElementById('detail-section').style.display  = 'block';
  document.getElementById('cashflow-section').style.display = 'block';
  document.getElementById('detail-section').scrollIntoView({ behavior: 'smooth' });
}

function renderDetail(result) {
  const { template, chosen, capUsed, totalRevenue, totalCost, profit, roi, minBalance, mMult } = result;
  const section = document.getElementById('detail-section');
  document.getElementById('detail-title').textContent =
    `${template.emoji} รายละเอียด — ${template.label}`;

  const mMultPct = ((mMult - 1) * 100).toFixed(0);
  const mMultLabel = mMult > 1 ? `+${mMultPct}%` : mMult < 1 ? `${mMultPct}%` : 'ปกติ';

  let tableRows = '';
  Object.entries(chosen).forEach(([key, units]) => {
    if (units === 0) return;
    const act = ACTIVITIES[key];
    const revM  = (act.monthlyRevenue * mMult * units).toFixed(0);
    const costM = (act.monthlyCost * units).toFixed(0);
    const invest= (act.investment * units).toFixed(0);
    tableRows += `
      <tr>
        <td>${act.icon} ${act.name}</td>
        <td>${units} (${act.unitDesc})</td>
        <td>${fmt(invest)}</td>
        <td>${fmt(revM)}</td>
        <td>${fmt(costM)}</td>
        <td>เดือนที่ ${act.cashStart}</td>
      </tr>`;
  });

  document.getElementById('detail-body').innerHTML = `
    <table class="activity-table">
      <thead>
        <tr>
          <th>กิจกรรม</th>
          <th>จำนวน</th>
          <th>ลงทุน (บาท)</th>
          <th>รายได้/เดือน</th>
          <th>ต้นทุน/เดือน</th>
          <th>เริ่มรายได้</th>
        </tr>
      </thead>
      <tbody>${tableRows || '<tr><td colspan="6" style="color:#999;text-align:center">ไม่มีกิจกรรม</td></tr>'}</tbody>
    </table>
    <div class="summary-row">
      <span>💰 เงินลงทุนรวม: <strong>${fmt(capUsed)} บาท</strong></span>
      <span>📥 รายได้รวมปี: <strong>${fmt(totalRevenue)} บาท</strong></span>
      <span>📤 ต้นทุนรวมปี: <strong>${fmt(totalCost)} บาท</strong></span>
      <span>📈 กำไร/ปี: <strong style="color:${profit>=0?'#2e7d32':'#c62828'}">${fmtSign(profit)} บาท</strong></span>
      <span>📊 ROI: <strong>${roi.toFixed(1)}%</strong></span>
      <span>🏪 ราคาตลาด: <strong>${mMultLabel}</strong></span>
    </div>
    ${minBalance < 0 ? `<div class="constraint-alert">⚠️ เงินสดติดลบสูงสุด ${fmt(Math.abs(minBalance))} บาท — ควรเพิ่มเงินสำรองหรือเลือกกิจกรรมที่ให้รายได้เร็วขึ้น</div>` : ''}
  `;
}

function renderCashflow(result) {
  const { cashFlow, farmConfig } = result;
  const reserve = farmConfig.cashReserve;
  const maxBal  = Math.max(...cashFlow.map(m => m.balance), reserve);
  const chart   = document.getElementById('cashflow-chart');
  const MONTHS_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];

  chart.innerHTML = cashFlow.map((m, i) => {
    const h = maxBal > 0 ? Math.max(4, Math.round((m.balance / maxBal) * 120)) : 4;
    const cls = m.balance < reserve ? 'low' : 'ok';
    return `<div class="cf-bar-wrap">
      <div class="cf-bar ${cls}" style="height:${h}px" title="เดือน ${i+1}: ${fmt(m.balance)} บาท"></div>
      <div class="cf-label">${MONTHS_TH[i]}</div>
    </div>`;
  }).join('');
}
