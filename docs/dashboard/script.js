// --- ข้อมูลตัวอย่าง (แสดงตอนยังไม่เชื่อมต่อ Google Sheets) ---
const DEMO_DATA = [
  { symbol: "BKK:CPF", meaning: "ต้นทุนอาหารสัตว์ (ไก่/หมู)", price: 24.10, changePct: 1.8 },
  { symbol: "BKK:GFPT", meaning: "ต้นทุนอาหารสัตว์ (ไก่)", price: 11.30, changePct: -0.9 },
  { symbol: "CORN", meaning: "ราคาข้าวโพดโลก", price: 19.85, changePct: 2.4 },
  { symbol: "SOYB", meaning: "ราคาถั่วเหลืองโลก", price: 21.40, changePct: 0.6 },
  { symbol: "BKK:STA", meaning: "ยางพารา", price: 17.60, changePct: -1.5 },
  { symbol: "BKK:KSL", meaning: "อ้อย/น้ำตาล", price: 3.24, changePct: 3.1 },
  { symbol: "CANE", meaning: "ราคาน้ำตาลโลก", price: 12.90, changePct: -2.2 },
  { symbol: "BKK:TU", meaning: "ประมง/อาหารทะเลแปรรูป", price: 13.70, changePct: 0.4 },
  { symbol: "BKK:PTT", meaning: "ต้นทุนพลังงาน", price: 34.50, changePct: -0.3 },
  { symbol: "CURRENCY:USDTHB", meaning: "อัตราแลกเปลี่ยน USD/THB", price: 36.42, changePct: 0.5 },
];

const els = {
  csvUrl: document.getElementById("csvUrl"),
  loadBtn: document.getElementById("loadBtn"),
  demoBtn: document.getElementById("demoBtn"),
  statusLine: document.getElementById("statusLine"),
  barList: document.getElementById("barList"),
  tableBody: document.getElementById("tableBody"),
  chartTag: document.getElementById("chartTag"),
  tableTag: document.getElementById("tableTag"),
};

const STORAGE_KEY = "gfin-dashboard-csv-url";

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function toNumber(v) {
  if (v === undefined || v === null) return NaN;
  const cleaned = String(v).replace(/[,%\s]/g, "");
  return parseFloat(cleaned);
}

function rowsToData(rows) {
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idxSymbol = 0;
  const idxMeaning = 1;
  const idxPrice = 2;
  const idxChange = 3;
  return rows.slice(1)
    .filter((r) => r[idxSymbol] && r[idxSymbol].trim())
    .map((r) => ({
      symbol: r[idxSymbol].trim(),
      meaning: (r[idxMeaning] || "").trim(),
      price: toNumber(r[idxPrice]),
      changePct: toNumber(r[idxChange]),
    }))
    .filter((d) => !Number.isNaN(d.price));
}

function formatPrice(v) {
  if (Number.isNaN(v)) return "-";
  return v.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(v) {
  if (Number.isNaN(v)) return "-";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function render(data, isDemo) {
  const tag = isDemo ? "ตัวอย่าง" : "ข้อมูลจาก Google Sheets";
  els.chartTag.textContent = tag;
  els.tableTag.textContent = tag;

  if (!data.length) {
    els.barList.innerHTML = '<div class="empty">ไม่พบข้อมูล ตรวจสอบรูปแบบคอลัมน์ในลิงก์ CSV</div>';
    els.tableBody.innerHTML = "";
    return;
  }

  const maxAbs = Math.max(1, ...data.map((d) => Math.abs(d.changePct || 0)));

  els.barList.innerHTML = data.map((d) => {
    const pct = Number.isNaN(d.changePct) ? 0 : d.changePct;
    const dir = pct >= 0 ? "up" : "down";
    const widthPct = (Math.abs(pct) / maxAbs) * 50;
    const fillStyle = pct >= 0
      ? `left:50%; width:${widthPct}%;`
      : `right:50%; width:${widthPct}%;`;
    return `
      <div class="bar-row">
        <div class="bar-label" title="${d.symbol} - ${d.meaning}">${d.symbol}</div>
        <div class="bar-track">
          <div class="bar-mid"></div>
          <div class="bar-fill ${dir}" style="${fillStyle}" title="${d.symbol}: ${formatPct(pct)}"></div>
        </div>
        <div class="bar-val ${dir}">${formatPct(pct)}</div>
      </div>`;
  }).join("");

  els.tableBody.innerHTML = data.map((d) => {
    const pct = d.changePct;
    const dir = Number.isNaN(pct) ? "flat" : pct > 0 ? "up" : pct < 0 ? "down" : "flat";
    return `
      <tr>
        <td>${d.symbol}</td>
        <td>${d.meaning || "-"}</td>
        <td class="num">${formatPrice(d.price)}</td>
        <td class="num"><span class="badge ${dir}">${formatPct(pct)}</span></td>
      </tr>`;
  }).join("");
}

function showDemo(message) {
  render(DEMO_DATA, true);
  els.statusLine.textContent = message || "ยังไม่ได้โหลดข้อมูล — กำลังแสดงข้อมูลตัวอย่าง";
}

async function loadFromUrl(url) {
  if (!url) { showDemo(); return; }
  els.statusLine.textContent = "กำลังโหลดข้อมูล...";
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const rows = parseCSV(text);
    const data = rowsToData(rows);
    if (!data.length) throw new Error("ไม่พบแถวข้อมูลที่ใช้ได้ ตรวจสอบลำดับคอลัมน์");
    render(data, false);
    localStorage.setItem(STORAGE_KEY, url);
    const now = new Date();
    els.statusLine.textContent = `โหลดสำเร็จ - อัปเดตล่าสุด ${now.toLocaleTimeString("th-TH")} (ราคาจาก Google Finance ดีเลย์ประมาณ 20 นาที)`;
  } catch (err) {
    els.statusLine.textContent = `โหลดข้อมูลไม่สำเร็จ: ${err.message} — ตรวจสอบว่าลิงก์เป็น CSV ที่เผยแพร่แล้ว และลองอีกครั้ง`;
  }
}

els.loadBtn.addEventListener("click", () => {
  loadFromUrl(els.csvUrl.value.trim());
});

els.demoBtn.addEventListener("click", () => {
  els.csvUrl.value = "";
  localStorage.removeItem(STORAGE_KEY);
  showDemo();
});

els.csvUrl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loadFromUrl(els.csvUrl.value.trim());
});

// เริ่มต้น: โหลดลิงก์ที่เคยบันทึกไว้ ถ้ามี ไม่งั้นแสดงข้อมูลตัวอย่าง
const savedUrl = localStorage.getItem(STORAGE_KEY);
if (savedUrl) {
  els.csvUrl.value = savedUrl;
  loadFromUrl(savedUrl);
} else {
  showDemo();
}
