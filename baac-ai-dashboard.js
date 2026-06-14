/* ===================================================
   BAAC Customer Development AI Suite — Dashboard JS
   Mock data + rendering logic
   =================================================== */

'use strict';

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const DATA = {

  kpi: [
    { type: 'total',   icon: '👥', value: 248, unit: 'ราย', label: 'ลูกค้าทั้งหมดในระบบ' },
    { type: 'red',     icon: '🔴', value: 20,  unit: 'ราย', label: 'กลุ่ม RED — ต้องดำเนินการด่วน' },
    { type: 'npl',     icon: '✅', value: 18,  unit: 'ราย', label: 'ป้องกัน NPL ได้ (ประมาณการ)' },
    { type: 'product', icon: '🌾', value: 4,   unit: 'ผลิตภัณฑ์', label: 'ชุมชนที่ออกแบบผลิตภัณฑ์แล้ว' },
  ],

  recovery: {
    distribution: { green: 98, yellow: 76, orange: 54, red: 20 },
    customers: [
      {
        id: 'TH6701001', name: 'สมศักดิ์ วงศ์ทอง', age: 52,
        province: 'นครราชสีมา', crop: 'ข้าว', score: 82, category: 'GREEN',
        risk: 'ต้นทุนสูง 12%',
        action: 'ติดตามรายไตรมาส',
        next: 'ก.ย. 2569',
      },
      {
        id: 'TH6701002', name: 'สุภาพร แสนสุข', age: 45,
        province: 'เชียงใหม่', crop: 'ลำไย', score: 71, category: 'YELLOW',
        risk: 'ราคาลำไยผันผวน+ขาดตลาด',
        action: 'Business Matching+BAAC Outlet',
        next: 'ส.ค. 2569',
      },
      {
        id: 'TH6701003', name: 'ประยงค์ พึ่งดี', age: 61,
        province: 'อุบลราชธานี', crop: 'อ้อย', score: 54, category: 'ORANGE',
        risk: 'ผลผลิตต่ำกว่าเป้า 30%+ไม่มีเทคโนโลยี',
        action: 'Smart Farmer+HandySense',
        next: 'ก.ค. 2569',
      },
      {
        id: 'TH6701004', name: 'วิชัย คงมั่น', age: 38,
        province: 'สุรินทร์', crop: 'มันสำปะหลัง', score: 32, category: 'RED',
        risk: 'ค้างชำระ 4 งวด+รายได้ลด 40%+ครอบครัวไม่สนับสนุน',
        action: 'ลงพื้นที่ภายใน 7 วัน+ประชุม Case Recovery',
        next: 'ด่วน — ภายใน มิ.ย. 2569',
      },
      {
        id: 'TH6701005', name: 'ประนอม รักษ์ไทย', age: 57,
        province: 'ขอนแก่น', crop: 'ยางพารา', score: 76, category: 'YELLOW',
        risk: 'ราคายางตกต่ำ+ช่องทางขายจำกัด',
        action: 'BAAC Outlet+เชื่อมสหกรณ์ยาง',
        next: 'ส.ค. 2569',
      },
      {
        id: 'TH6701006', name: 'อนันต์ สุขสมบูรณ์', age: 44,
        province: 'ลำปาง', crop: 'ข้าวโพด', score: 47, category: 'ORANGE',
        risk: 'ต้นทุนปุ๋ยสูง+พึ่งน้ำฝน',
        action: 'HandySense+ระบบน้ำหยด',
        next: 'ก.ค. 2569',
      },
      {
        id: 'TH6701007', name: 'นิดา ใจกล้า', age: 33,
        province: 'เพชรบูรณ์', crop: 'ผัก (GAP)', score: 91, category: 'GREEN',
        risk: 'ความเสี่ยงต่ำ—มีสัญญาซื้อ',
        action: 'ส่งเสริมออม+ต้นแบบ Smart Farmer',
        next: 'ต.ค. 2569',
      },
      {
        id: 'TH6701008', name: 'สุรชัย เพชรงาม', age: 68,
        province: 'อยุธยา', crop: 'ข้าว', score: 25, category: 'RED',
        risk: 'อายุมาก+ไม่มีทายาท+รายได้ต่ำกว่าเส้นยากจน',
        action: 'ประชุม Case+Exit Strategy+ประสานสวัสดิการ',
        next: 'ด่วน — ภายใน มิ.ย. 2569',
      },
      {
        id: 'TH6701009', name: 'มาลี ทองดี', age: 50,
        province: 'พิษณุโลก', crop: 'ข้าวโพดหวาน', score: 63, category: 'YELLOW',
        risk: 'ยังไม่มีช่องทาง Modern Trade',
        action: 'E-Commerce+BAAC Market',
        next: 'ก.ย. 2569',
      },
      {
        id: 'TH6701010', name: 'บุญมา สวัสดี', age: 42,
        province: 'กาญจนบุรี', crop: 'อ้อย', score: 58, category: 'ORANGE',
        risk: 'ต้นทุนสูง+ราคาผันผวน',
        action: 'ลดต้นทุน+ปุ๋ยอินทรีย์',
        next: 'ส.ค. 2569',
      },
    ],
  },

  warning: [
    {
      level: 'CRITICAL',
      area: 'อ.เมือง จ.อุบลราชธานี',
      count: 23,
      factors: [
        'น้ำท่วมระดับวิกฤต (กรมอุตุฯ แจ้งเตือน)',
        'ราคาอ้อยลด 18%',
        'ต้นทุนปุ๋ยเพิ่ม 22%',
      ],
      scores: { financial: 78, agricultural: 85, environmental: 92, market: 70, behavioral: 45 },
      action: 'ลงพื้นที่ภายใน 48 ชม. — จัดประชุม Case Conference ทันที',
    },
    {
      level: 'HIGH',
      area: 'อ.ด่านขุนทด จ.นครราชสีมา',
      count: 47,
      factors: [
        'ภัยแล้ง—ปริมาณน้ำฝนต่ำกว่าค่าเฉลี่ย 35%',
        'ราคาข้าวเปลือกลด 15%',
        'ลูกค้า 12 รายเริ่มค้างชำระ',
      ],
      scores: { financial: 65, agricultural: 72, environmental: 80, market: 58, behavioral: 40 },
      action: 'นัดพบลูกค้ากลุ่มเสี่ยงภายใน 30 วัน + ประสานชลประทาน',
    },
    {
      level: 'MODERATE',
      area: 'อ.ฝาง จ.เชียงใหม่',
      count: 12,
      factors: [
        'พบโรคราสนิมลำไยระบาด',
        'ราคาลำไยผันผวนสูง',
      ],
      scores: { financial: 40, agricultural: 65, environmental: 30, market: 55, behavioral: 25 },
      action: 'แจ้งเตือนลูกค้า + ประสานกรมวิชาการเกษตร + Business Matching ล่วงหน้า',
    },
    {
      level: 'MODERATE',
      area: 'อ.เมือง จ.สุรินทร์',
      count: 31,
      factors: [
        'ราคาปุ๋ยเคมีเพิ่ม 20%',
        'ราคามันสำปะหลังลด 8%',
      ],
      scores: { financial: 50, agricultural: 45, environmental: 20, market: 60, behavioral: 30 },
      action: 'ส่งเสริมปุ๋ยอินทรีย์ + วางแผนต้นทุนล่วงหน้า',
    },
  ],

  products: [
    {
      name: 'ข้าวหอมมะลิดินภูเขาไฟ โนนสำราญ',
      community: 'ชุมชนบ้านโนนสำราญ อ.ประทาย จ.นครราชสีมา',
      swot: {
        s: 'ดินภูเขาไฟ Andosol หายากในไทย ให้กลิ่นหอมเอกลักษณ์',
        w: 'ผลผลิต 400-500 กก./ไร่ (ต่ำกว่าค่าเฉลี่ย)',
        o: 'ตลาด Organic Premium เติบโต 20%/ปี',
        t: 'สภาพอากาศเปลี่ยนแปลง กระทบผลผลิต',
      },
      positioning: 'Premium Organic — "ดินหายาก กลิ่นหอมที่หาไม่ได้จากที่ใดในโลก"',
      story: 'บรรพบุรุษชุมชนค้นพบดินสีดำใต้เชิงเขาพนมรุ้งทำให้ข้าวมีกลิ่นหอมพิเศษมากกว่า 100 ปี สืบทอดวิธีปลูกแบบธรรมชาติรุ่นต่อรุ่น',
      packaging: 'Premium Gift — ถุงผ้าลินิน + กล่องไม้ไผ่ + QR Code ต้นกำเนิด',
      channels: ['Modern Trade Premium', 'BAAC Outlet', 'Line Official', 'Grab Mart'],
      opportunity: {
        price: '120–180 บาท/กก.',
        volume: '15 ตัน/ปี',
        revenue: '2.2–2.7 ล้านบาท/ปี',
      },
    },
    {
      name: 'น้ำพริกดอยสมุนไพร สูตรไทยใหญ่ 3 ชั่วคน',
      community: 'กลุ่มแม่บ้านเกษตรกร อ.ฝาง จ.เชียงใหม่',
      swot: {
        s: 'สูตรดั้งเดิมชาวไทยใหญ่อายุกว่า 80 ปี ใช้สมุนไพรดอยปลูกเอง',
        w: 'Shelf life 45 วัน (จำกัดช่องทางจำหน่าย)',
        o: 'กระแสสุขภาพ+นักท่องเที่ยวสนามบินเชียงใหม่ 8 ล้านคน/ปี',
        t: 'สินค้า Me-Too เลียนแบบได้ง่าย',
      },
      positioning: 'Authentic Heritage — "รสชาติที่ยายเก็บไว้ให้หลาน"',
      story: 'คุณยายสิรินทร์ ชาวไทยใหญ่ อายุ 83 ปี ยังถ่ายทอดสูตรน้ำพริกให้ลูกหลาน ใช้พริกพื้นบ้าน กระเทียมดอย สมุนไพรปลูกเองไม่ใช้สารเคมี',
      packaging: 'Heritage Gift — ขวดแก้วทรงโบราณ + ป้ายผ้าฝ้ายมือเขียน + กล่องไม้สัก',
      channels: ['ของฝากสนามบินเชียงใหม่', 'Social Commerce', 'BAAC Outlet', 'โรงแรม Boutique'],
      opportunity: {
        price: '180–250 บาท/ขวด',
        volume: '3,600 ขวด/ปี',
        revenue: '648,000–900,000 บาท/ปี',
      },
    },
  ],
};

/* ─────────────────────────────────────────────
   HELPER FUNCTIONS
───────────────────────────────────────────── */

/**
 * Returns display metadata for a recovery category.
 * @param {string} cat - GREEN | YELLOW | ORANGE | RED
 */
function categoryMeta(cat) {
  const map = {
    GREEN:  { cls: 'badge-green',  label: 'GREEN',  color: '#16a34a' },
    YELLOW: { cls: 'badge-yellow', label: 'YELLOW', color: '#ca8a04' },
    ORANGE: { cls: 'badge-orange', label: 'ORANGE', color: '#ea580c' },
    RED:    { cls: 'badge-red',    label: 'RED',    color: '#dc2626' },
  };
  return map[cat] || { cls: '', label: cat, color: '#6b7280' };
}

/**
 * Returns display metadata for a warning level.
 * @param {string} level - CRITICAL | HIGH | MODERATE | LOW
 */
function levelMeta(level) {
  const map = {
    CRITICAL: { cls: 'alert-critical', badgeCls: 'badge-critical', label: 'CRITICAL' },
    HIGH:     { cls: 'alert-high',     badgeCls: 'badge-high',     label: 'HIGH' },
    MODERATE: { cls: 'alert-moderate', badgeCls: 'badge-moderate', label: 'MODERATE' },
    LOW:      { cls: '',               badgeCls: 'badge-low',      label: 'LOW' },
  };
  return map[level] || { cls: '', badgeCls: '', label: level };
}

/**
 * Returns HTML for a score display with colored number + progress bar.
 * @param {number} score - 0 to 100
 */
function scoreBar(score) {
  let color;
  if (score >= 80)      color = '#16a34a';
  else if (score >= 60) color = '#ca8a04';
  else if (score >= 40) color = '#ea580c';
  else                  color = '#dc2626';

  return `
    <div class="score-bar">
      <span class="score-num" style="color:${color}">${score}</span>
      <div class="score-track">
        <div class="score-fill" style="width:${score}%;background:${color};"></div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────
   RENDER FUNCTIONS
───────────────────────────────────────────── */

/** Renders the 4 KPI cards into #kpi-row */
function renderKPI() {
  const container = document.getElementById('kpi-row');
  if (!container) return;
  container.innerHTML = DATA.kpi.map(item => `
    <div class="kpi-card kpi-${item.type}">
      <div class="kpi-icon">${item.icon}</div>
      <div class="kpi-info">
        <div class="kpi-value">${item.value}<span class="kpi-unit">${item.unit}</span></div>
        <div class="kpi-label">${item.label}</div>
      </div>
    </div>
  `).join('');
}

/** Renders the doughnut chart in #recoveryChart and legend in #chart-legend */
function renderChart() {
  const canvas = document.getElementById('recoveryChart');
  if (!canvas) return;

  const dist = DATA.recovery.distribution;
  const legendContainer = document.getElementById('chart-legend');

  const chartData = [
    { label: 'GREEN',  count: dist.green,  color: '#16a34a' },
    { label: 'YELLOW', count: dist.yellow, color: '#ca8a04' },
    { label: 'ORANGE', count: dist.orange, color: '#ea580c' },
    { label: 'RED',    count: dist.red,    color: '#dc2626' },
  ];

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: chartData.map(d => d.label),
      datasets: [{
        data: chartData.map(d => d.count),
        backgroundColor: chartData.map(d => d.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      }],
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed} ราย`,
          },
        },
      },
    },
  });

  if (legendContainer) {
    legendContainer.innerHTML = chartData.map(d => `
      <div class="legend-row">
        <span class="legend-dot" style="background:${d.color}"></span>
        <span class="legend-text">${d.label}</span>
        <span class="legend-count">${d.count} ราย</span>
      </div>
    `).join('');
  }
}

/** Renders compact alert list into #alert-summary */
function renderAlertSummary() {
  const container = document.getElementById('alert-summary');
  if (!container) return;

  container.innerHTML = DATA.warning.map(w => {
    const meta = levelMeta(w.level);
    return `
      <div class="summary-alert level-${w.level.toLowerCase()}">
        <span class="summary-level-badge ${meta.badgeCls}">${w.level}</span>
        <span class="summary-area">${w.area}</span>
        <span class="summary-count">${w.count} ราย</span>
      </div>
    `;
  }).join('');
}

/** Renders RED-only customers into #red-tbody */
function renderRedTable() {
  const tbody = document.getElementById('red-tbody');
  if (!tbody) return;

  const redCustomers = DATA.recovery.customers.filter(c => c.category === 'RED');
  tbody.innerHTML = redCustomers.map(c => `
    <tr class="row-red">
      <td><code>${c.id}</code></td>
      <td>${c.name}</td>
      <td>${c.province}</td>
      <td>${c.crop}</td>
      <td>${scoreBar(c.score)}</td>
      <td>${c.risk}</td>
      <td>${c.action}</td>
      <td><span class="urgent-tag">ด่วน</span>${c.next}</td>
    </tr>
  `).join('');
}

/** Renders all 10 customers into #recovery-tbody */
function renderRecoveryTable() {
  const tbody = document.getElementById('recovery-tbody');
  if (!tbody) return;

  tbody.innerHTML = DATA.recovery.customers.map(c => {
    const meta = categoryMeta(c.category);
    const isRed = c.category === 'RED';
    return `
      <tr class="${isRed ? 'row-red' : ''}">
        <td><code>${c.id}</code></td>
        <td>${c.name}</td>
        <td>${c.age}</td>
        <td>${c.province}</td>
        <td>${c.crop}</td>
        <td>${scoreBar(c.score)}</td>
        <td><span class="${meta.cls}">${meta.label}</span></td>
        <td>${c.risk}</td>
        <td>${c.action}</td>
        <td>${isRed ? `<span class="urgent-tag">ด่วน</span>` : ''}${c.next}</td>
      </tr>
    `;
  }).join('');
}

/** Renders 4 detailed warning cards into #warning-cards */
function renderWarning() {
  const container = document.getElementById('warning-cards');
  if (!container) return;

  const dimLabels = {
    financial: 'Financial',
    agricultural: 'Agricultural',
    environmental: 'Environmental',
    market: 'Market',
    behavioral: 'Behavioral',
  };

  container.innerHTML = DATA.warning.map(w => {
    const meta = levelMeta(w.level);

    const factorsHTML = w.factors.map(f => `<li>${f}</li>`).join('');

    const scoresHTML = Object.entries(w.scores).map(([dim, val]) => {
      let fillColor;
      if (val >= 70)      fillColor = '#dc2626';
      else if (val >= 50) fillColor = '#ea580c';
      else if (val >= 30) fillColor = '#ca8a04';
      else                fillColor = '#16a34a';

      return `
        <div class="risk-score-row">
          <span class="risk-dim-label">${dimLabels[dim]}</span>
          <div class="risk-track">
            <div class="risk-fill" style="width:${val}%;background:${fillColor};"></div>
          </div>
          <span class="risk-val" style="color:${fillColor}">${val}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="alert-card ${meta.cls}">
        <div class="alert-top">
          <div class="alert-area-name">${w.area}</div>
          <span class="${meta.badgeCls}">${w.level}</span>
        </div>
        <div class="alert-count">ลูกค้าที่ได้รับผลกระทบ: <strong>${w.count} ราย</strong></div>
        <div class="product-section-label">ปัจจัยเสี่ยง</div>
        <ul class="alert-factors">${factorsHTML}</ul>
        <div class="product-section-label">คะแนนความเสี่ยง 5 มิติ</div>
        <div class="risk-scores">${scoresHTML}</div>
        <div class="alert-action">แผนรับมือ: ${w.action}</div>
      </div>
    `;
  }).join('');
}

/** Renders 2 community product cards into #product-cards */
function renderProducts() {
  const container = document.getElementById('product-cards');
  if (!container) return;

  container.innerHTML = DATA.products.map(p => {
    const channelTags = p.channels.map(ch => `<span class="ch-tag">${ch}</span>`).join('');

    return `
      <div class="product-card">
        <div class="product-card-header">
          <div class="product-card-name">${p.name}</div>
          <div class="product-card-community">${p.community}</div>
        </div>
        <div class="product-card-body">

          <div class="product-section-label">SWOT Analysis</div>
          <div class="swot-grid">
            <div class="swot-item swot-s">
              <div class="swot-letter">S — จุดแข็ง</div>
              ${p.swot.s}
            </div>
            <div class="swot-item swot-w">
              <div class="swot-letter">W — จุดอ่อน</div>
              ${p.swot.w}
            </div>
            <div class="swot-item swot-o">
              <div class="swot-letter">O — โอกาส</div>
              ${p.swot.o}
            </div>
            <div class="swot-item swot-t">
              <div class="swot-letter">T — ภัยคุกคาม</div>
              ${p.swot.t}
            </div>
          </div>

          <div class="product-section-label">Market Positioning</div>
          <div class="positioning-box">${p.positioning}</div>

          <div class="product-section-label">Brand Story</div>
          <div class="story-box">${p.story}</div>

          <div class="product-section-label">Packaging</div>
          <div class="packaging-box">${p.packaging}</div>

          <div class="product-section-label">ช่องทางจำหน่าย</div>
          <div class="ch-tags">${channelTags}</div>

          <div class="product-section-label">Financial Opportunity</div>
          <div class="opportunity-box">
            <div class="opp-grid">
              <div>
                <div class="opp-item-label">ราคาเป้าหมาย</div>
                <div class="opp-item-value">${p.opportunity.price}</div>
              </div>
              <div>
                <div class="opp-item-label">ปริมาณขาย (ประมาณการ)</div>
                <div class="opp-item-value">${p.opportunity.volume}</div>
              </div>
              <div>
                <div class="opp-item-label">รายได้ต่อปี (ประมาณการ)</div>
                <div class="opp-item-value">${p.opportunity.revenue}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }).join('');
}

/* ─────────────────────────────────────────────
   TAB SWITCHING
───────────────────────────────────────────── */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Deactivate all
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Activate selected
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderKPI();
  renderChart();
  renderAlertSummary();
  renderRedTable();
  renderRecoveryTable();
  renderWarning();
  renderProducts();
  initTabs();
});
