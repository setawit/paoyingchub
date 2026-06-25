// Shared data-loading + formatting helpers for the static site.
// No build step / no dependencies — plain ES modules loaded via <script type="module">.

const _cache = new Map();

/** Fetch and cache a JSON file under /data. Works over http(s) (use a local server). */
export async function loadJSON(path) {
  if (_cache.has(path)) return _cache.get(path);
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`โหลดข้อมูลไม่สำเร็จ: ${path} (${res.status})`);
  const data = await res.json();
  _cache.set(path, data);
  return data;
}

export const loadDeposits = () => loadJSON('data/deposits.json');
export const loadSalak = () => loadJSON('data/salak.json');

/** Format a number with thousands separators and optional decimals. */
export function fmt(n, decimals = 0) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return n.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a percentage value (already in %, e.g. 1.55 -> "1.55%"). */
export function pct(n, decimals = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${n.toFixed(decimals)}%`;
}

/** Render a small commercial/state badge for a bank type. */
export function bankTypeBadge(type) {
  if (type === 'state') return '<span class="badge state">รัฐ</span>';
  return '<span class="badge commercial">พาณิชย์</span>';
}

/** Show a non-fatal error message inside an element. */
export function showError(el, err) {
  console.error(err);
  el.innerHTML = `<div class="disclaimer">เกิดข้อผิดพลาด: ${err.message || err}<br>
    หากเปิดไฟล์โดยตรง (file://) กรุณารันผ่านเซิร์ฟเวอร์ เช่น <code>python3 -m http.server</code></div>`;
}
