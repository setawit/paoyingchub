import { loadSalak, fmt, pct, showError } from './data.js';

// ===== Pure calculation functions (mirrored in scraper/test_salak_math.py) =====

export const DRAWS_PER_YEAR = { monthly: 12, quarterly: 4, yearly: 1 };

/** Expected prize value per unit per draw = Σ(amount × count) / units_in_pool. */
export function evPerUnitPerDraw(product) {
  const total = product.prize_tiers.reduce((s, t) => s + t.amount * t.count_per_draw, 0);
  return total / product.units_in_pool;
}

/** Annual prize yield (%) relative to unit price. */
export function prizeYieldPct(product) {
  const f = DRAWS_PER_YEAR[product.draw_frequency] ?? 12;
  return (evPerUnitPerDraw(product) * f) / product.unit_price * 100;
}

/** Total expected annual return (%) = prize yield + redemption interest. */
export function totalYieldPct(product) {
  return prizeYieldPct(product) + (product.redeem_interest_rate || 0);
}

/** Total prize slots awarded per draw. */
export function prizeSlotsPerDraw(product) {
  return product.prize_tiers.reduce((s, t) => s + t.count_per_draw, 0);
}

/** Probability of winning at least one prize in a single draw for `units` held. */
export function winProbPerDraw(product, units) {
  if (units <= 0) return 0;
  const pNone = 1 - prizeSlotsPerDraw(product) / product.units_in_pool;
  return 1 - Math.pow(pNone, units);
}

/** Cumulative probability of winning at least once over the holding period. */
export function winProbOverHold(product, units, holdMonths) {
  const f = DRAWS_PER_YEAR[product.draw_frequency] ?? 12;
  const draws = Math.max(0, Math.round((f * holdMonths) / 12));
  const p = winProbPerDraw(product, units);
  return { draws, prob: 1 - Math.pow(1 - p, draws) };
}

/** Full computation for the UI given user inputs. */
export function compute(product, amount, holdMonths) {
  const units = Math.floor(amount / product.unit_price);
  const totalY = totalYieldPct(product);
  const { draws, prob } = winProbOverHold(product, units, holdMonths);
  return {
    units,
    prizeYield: prizeYieldPct(product),
    redeemRate: product.redeem_interest_rate || 0,
    totalYield: totalY,
    expectedAnnualBaht: (totalY / 100) * amount,
    draws,
    winProbPeriod: prob,
    winProbDraw: winProbPerDraw(product, units),
  };
}

// ===== UI wiring =====

let products = [];

const $ = (id) => document.getElementById(id);

init();

async function init() {
  try {
    const data = await loadSalak();
    products = data.products;
    const sel = $('product');
    sel.innerHTML = products.map((p, i) => `<option value="${i}">${p.product_name}</option>`).join('');
    ['product', 'amount', 'months', 'refRate'].forEach((id) =>
      $(id).addEventListener('input', render)
    );
    render();
  } catch (err) {
    showError($('results'), err);
  }
}

function render() {
  const p = products[Number($('product').value)] || products[0];
  const amount = Math.max(0, Number($('amount').value) || 0);
  const months = Math.max(1, Number($('months').value) || 1);
  const refRate = Math.max(0, Number($('refRate').value) || 0);

  $('termHint').textContent = `อายุสลากตามผลิตภัณฑ์: ${p.term_months} เดือน • ออกรางวัล: ${freqTh(p.draw_frequency)} • ราคาต่อหน่วย ${fmt(p.unit_price)} ฿`;

  const r = compute(p, amount, months);

  $('results').innerHTML = `
    ${stat(fmt(r.units), 'จำนวนหน่วย')}
    ${stat(pct(r.totalYield), 'ผลตอบแทนเฉลี่ย/ปี', true)}
    ${stat(fmt(r.expectedAnnualBaht, 0) + ' ฿', 'ผลตอบแทนคาดหวัง/ปี')}
    ${stat(pct(r.winProbPeriod * 100, r.winProbPeriod < 0.01 ? 3 : 1), `โอกาสถูกรางวัลใน ${r.draws} งวด`)}
  `;

  const diff = r.totalYield - refRate;
  $('compareLine').innerHTML = `<div class="compare-line ${diff >= 0 ? 'win' : 'lose'}">
    ${diff >= 0
      ? `ผลตอบแทนคาดหวัง <b>สูงกว่า</b> ฝากประจำ ${pct(refRate)} อยู่ ${pct(Math.abs(diff))} (เชิงสถิติ)`
      : `ผลตอบแทนคาดหวัง <b>ต่ำกว่า</b> ฝากประจำ ${pct(refRate)} อยู่ ${pct(Math.abs(diff))} — แต่มีลุ้นรางวัลใหญ่`}
    <div class="hint" style="margin-top:0.35rem">ประกอบด้วย: ลุ้นรางวัลเฉลี่ย ${pct(r.prizeYield)} + ดอกเบี้ยไถ่ถอน ${pct(r.redeemRate)}</div>
  </div>`;

  $('prizeTable').innerHTML = `
    <thead><tr><th>รางวัล</th><th>เงินรางวัล (฿)</th><th>จำนวน/งวด</th><th>โอกาส/หน่วย/งวด</th></tr></thead>
    <tbody>${p.prize_tiers.map((t) => {
      const perUnit = t.count_per_draw / p.units_in_pool;
      return `<tr><td>${t.name}</td><td>${fmt(t.amount)}</td><td>${fmt(t.count_per_draw)}</td>
        <td>1 ใน ${fmt(Math.round(1 / perUnit))}</td></tr>`;
    }).join('')}</tbody>`;
}

function stat(num, label, accent = false) {
  return `<div class="stat"><div class="num ${accent ? 'accent' : ''}">${num}</div><div class="label">${label}</div></div>`;
}

function freqTh(f) {
  return { monthly: 'รายเดือน', quarterly: 'รายไตรมาส', yearly: 'รายปี' }[f] || f;
}
