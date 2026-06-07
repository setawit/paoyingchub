/* =============================================================================
 * CONTROL LAYER v2 — Output Templates (map ตามฟอร์ม Credit Approval A/B/C)
 * -----------------------------------------------------------------------------
 * Governance: ทุก output ผ่าน template กลางชุดเดียว + ความลึกแปรตาม DoA tier
 * =========================================================================== */

const TEMPLATES = (() => {
  const fmt = (n) => Number(Math.round(n) || 0).toLocaleString("th-TH");
  const sevBadge = (s) => {
    const m = { high: ["สูง", "g-fail"], medium: ["กลาง", "g-warn"], low: ["ต่ำ", "g-pass"] };
    const [t, cls] = m[s] || ["-", ""]; return `<span class="badge ${cls}">${t}</span>`;
  };
  const dscrBadge = (v) => {
    const min = KNOWLEDGE.policy.thresholds.dscr.min;
    const cls = v >= KNOWLEDGE.policy.thresholds.dscr.strong ? "g-pass" : v >= min ? "g-warn" : "g-fail";
    return `<span class="badge ${cls}">${v}</span>`;
  };

  /* ===== PART A — คำขออนุมัติสินเชื่อ (หน้าตัดสินใจ) ===================== */
  function partA(a) {
    const c = a.case, ind = KNOWLEDGE.industries[c.industry], r = a.routing;
    const comp = a.compliance.checks.map((x) =>
      `<tr><td>${x.label}</td><td>${x.pass ? "✅" : "❌"} ${x.note}</td></tr>`).join("");
    const chain = r.chain.map((s, i) => `<span class="chip">${i + 1}. ${s}</span>`).join("");
    return `
      <div class="output-card">
        <div class="part-tag">ส่วน A · คำขออนุมัติสินเชื่อ</div>
        <h3>ข้อมูลคำขอ &amp; การจัดเส้นทางอนุมัติ</h3>
        <div class="kv-grid">
          <div><span>ผู้ขอกู้</span><b>${c.borrowerName}</b></div>
          <div><span>ประเภทธุรกิจ</span><b>${ind.label}</b></div>
          <div><span>วงเงินขอกู้</span><b>${fmt(c.loanAmount)} ฿</b></div>
          <div><span>หลักประกัน (LTV)</span><b>${fmt(c.collateralValue)} ฿ · ${a.recommendation.ltv}%</b></div>
        </div>

        <div class="route-box">
          <div class="route-head">🛣️ DoA Routing — "เคสนี้เข้าท่อไหน" <span class="muted">(DoA ${a.doaVersion})</span></div>
          <div class="route-grid">
            <div><span>ระดับอำนาจอนุมัติ</span><b>${r.tier}</b></div>
            <div><span>ผู้จัดทำเอกสาร</span><b>${r.preparedBy}</b></div>
            <div><span>ความลึกเอกสาร</span><b>${r.depth === "เต็ม" ? "เต็ม (3 scenarios)" : r.depth + " (1 scenario)"}</b></div>
          </div>
          <div class="route-chain"><span>สายอนุมัติ:</span> ${chain}</div>
        </div>

        <h4>ตรวจมาตรฐาน/ข้อกำกับ (Compliance) ${a.compliance.allPass ? "✅ ผ่านทั้งหมด" : "⚠️ มีข้อต้องดู"}</h4>
        <table class="mini-table"><tbody>${comp}</tbody></table>
      </div>`;
  }

  /* ===== PART B — ประมาณการ 3 กรณี + Assumption Ledger ================= */
  function partB(a) {
    const s = a.scenarios, full = a.routing.depth === "เต็ม";
    const cols = full ? ["customer", "bank", "conservative"] : ["bank"];
    const head = full
      ? `<th>Customer</th><th>Bank</th><th>Conservative</th>`
      : `<th>Bank Case</th>`;

    // Assumption Ledger
    const ledgerRows = s.ledger.map((row) => {
      const vals = cols.map((k) => `<td class="num">${typeof row[k] === "number" ? Number(row[k]).toLocaleString("th-TH") : row[k]}</td>`).join("");
      return `<tr><td>${row.label} <small>(${row.unit})</small></td>${vals}<td class="src">${row.source}</td></tr>`;
    }).join("");

    // ผลประมาณการ
    const line = (label, fn, isDscr) => {
      const vals = cols.map((k) => `<td class="num">${isDscr ? dscrBadge(s[k].dscr) : fmt(fn(s[k]))}</td>`).join("");
      return `<tr><td>${label}</td>${vals}</tr>`;
    };

    const note = full ? "" :
      `<p class="muted">ℹ️ ระดับ "${a.routing.depth}" แสดง Bank Case อย่างเดียว — ระดับธนาคารขึ้นไปจะแตกครบ 3 กรณี</p>`;

    return `
      <div class="output-card">
        <div class="part-tag">ส่วน B · การประมาณการทางการเงิน</div>
        <h3>Scenario Projection — เขียนครั้งเดียว แตก ${full ? 3 : 1} กรณี</h3>
        ${note}
        <h4>📒 Assumption Ledger — สมมติฐานพร้อมที่มา <span class="muted">(กันนั่งเทียน)</span></h4>
        <table class="ratio-table led">
          <thead><tr><th>สมมติฐาน</th>${head}<th>ที่มา / กฎ</th></tr></thead>
          <tbody>${ledgerRows}</tbody>
        </table>
        <h4>ผลประมาณการ (บาท/ปี)</h4>
        <table class="ratio-table">
          <thead><tr><th>รายการ</th>${head}</tr></thead>
          <tbody>
            ${line("รายได้รวม", (x) => x.revenue)}
            ${line("ต้นทุน+ค่าใช้จ่าย", (x) => x.cost)}
            ${line("NOI (EBITDA)", (x) => x.noi)}
            ${line("ภาระหนี้รวม/ปี", (x) => x.totalDebtService)}
            <tr class="hl"><td><b>DSCR</b></td>${cols.map((k) => `<td class="num">${dscrBadge(s[k].dscr)}</td>`).join("")}</tr>
          </tbody>
        </table>
      </div>`;
  }

  /* ===== PART C — วิเคราะห์ + Risk Disclosure + ความเห็น =============== */
  function partC(a) {
    const rec = a.recommendation;
    const risks = a.risk.map((r, i) => `
      <div class="risk-item sev-medium">
        <div class="risk-head">⚠️ ประเด็น ${i + 1}: <strong>${r.issue}</strong></div>
        <div class="risk-cat">เหตุที่จะถูกจี้: ${r.why}</div>
        <div class="risk-mit"><span>คำตอบ/วิธีคุมที่เตรียมไว้:</span> ${r.ans}</div>
      </div>`).join("");
    const cov = rec.covenants.map((x) => `<li>${x}</li>`).join("");

    return `
      <div class="output-card">
        <div class="part-tag">ส่วน C · รายงานวิเคราะห์สินเชื่อ</div>
        <h3>🛡️ Risk Disclosure — "เปิดความเสี่ยงก่อนกลั่นกรองจะถาม"</h3>
        <p class="muted">ระบบเล่นเป็นกลั่นกรองจำลอง คาดการณ์ประเด็นที่จะถูกจี้ พร้อมเตรียมคำตอบ → ลดรอบวนแก้</p>
        ${risks}
        <h4>เงื่อนไขประกอบการอนุมัติ (Covenants)</h4>
        <ul class="cond-list">${cov}</ul>
        <h3>ความเห็น &amp; ข้อเสนอ (ฉบับร่าง)</h3>
        <div class="decision decision-${rec.color}">
          <div class="decision-label">${rec.decision}</div>
        </div>
        <p>${rec.summary}</p>
        <p class="muted">สร้างโดย Loan Brain OS · Policy ${a.policyVersion} · DoA ${a.doaVersion}
           · ฉบับร่าง — เจ้าหน้าที่เป็นผู้ตัดสินใจขั้นสุดท้าย</p>
      </div>`;
  }

  function render(a) { return partA(a) + partB(a) + partC(a); }
  return { render };
})();

window.TEMPLATES = TEMPLATES;
