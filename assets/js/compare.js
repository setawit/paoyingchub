import { loadDeposits, fmt, pct, bankTypeBadge, showError } from './data.js';

const TERMS = ['12', '36', '60', '120']; // months shown as 1/3/5/10y columns

const state = {
  banks: {},      // id -> bank
  rows: [],       // flattened product rows
  filterType: 'all',
  sortKey: '12',
  sortDir: 'desc', // best rate first by default
};

const tbody = document.getElementById('tbody');

init();

async function init() {
  try {
    const data = await loadDeposits();
    state.banks = Object.fromEntries(data.banks.map((b) => [b.id, b]));
    state.rows = data.products.map((p) => ({
      bank: state.banks[p.bank_id],
      product: p,
    }));
    document.getElementById('updated').textContent = `อัปเดต: ${data.updated_at}`;
    wireControls();
    render();
  } catch (err) {
    showError(document.getElementById('disclaimer'), err);
  }
}

function wireControls() {
  document.getElementById('typeFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    state.filterType = btn.dataset.type;
    document.querySelectorAll('#typeFilter button').forEach((b) => b.classList.toggle('active', b === btn));
    render();
  });

  document.querySelectorAll('th.sortable').forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === 'desc' ? 'asc' : 'desc';
      } else {
        state.sortKey = key;
        state.sortDir = key === 'bank' ? 'asc' : 'desc';
      }
      render();
    });
  });
}

function sortValue(row, key) {
  if (key === 'bank') return row.bank?.name_th || '';
  if (key === 'min') return row.product.minimum_amount ?? Infinity;
  const r = row.product.rates?.[key];
  return r === undefined || r === null ? -Infinity : r;
}

function render() {
  // filter
  let rows = state.rows.filter((r) =>
    state.filterType === 'all' ? true : r.bank?.type === state.filterType
  );

  // best rate per term column (within filtered set)
  const best = {};
  for (const t of TERMS) {
    best[t] = Math.max(...rows.map((r) => r.product.rates?.[t] ?? -Infinity));
  }

  // sort
  const dir = state.sortDir === 'asc' ? 1 : -1;
  rows = rows.slice().sort((a, b) => {
    const va = sortValue(a, state.sortKey);
    const vb = sortValue(b, state.sortKey);
    if (typeof va === 'string') return va.localeCompare(vb, 'th') * dir;
    return (va - vb) * dir;
  });

  // sort arrows
  document.querySelectorAll('th.sortable').forEach((th) => {
    const arrow = th.querySelector('.arrow');
    arrow.textContent = th.dataset.key === state.sortKey ? (state.sortDir === 'desc' ? '▼' : '▲') : '';
  });

  // render rows
  tbody.innerHTML = rows.map((r) => {
    const b = r.bank || {};
    const p = r.product;
    const cells = TERMS.map((t) => {
      const v = p.rates?.[t];
      const isBest = v !== undefined && v === best[t] && Number.isFinite(v);
      return `<td class="rate${isBest ? ' best' : ''}">${v === undefined ? '—' : pct(v)}</td>`;
    }).join('');
    return `<tr>
      <td class="left">${b.name_th || b.name || p.bank_id} ${bankTypeBadge(b.type)}</td>
      <td class="left muted">${p.product_name}</td>
      ${cells}
      <td>${p.minimum_amount ? fmt(p.minimum_amount) + ' ฿' : '—'}</td>
    </tr>`;
  }).join('');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted left">ไม่พบข้อมูลตามเงื่อนไข</td></tr>';
  }
}
