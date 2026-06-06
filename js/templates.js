/* =============================================================================
 * CONTROL LAYER — Standardized Output Templates
 * -----------------------------------------------------------------------------
 * Critical Risk 7.1 (Governance Failure) : ถ้า output ไม่สม่ำเสมอ → trust พัง
 * แก้โดย : ทุก output ผ่าน template กลางชุดเดียวที่นี่ (ไม่ให้แต่ละคนเขียนเอง)
 *
 * รับ analysis object จาก ENGINE → คืน HTML string ที่ format มาตรฐาน
 * =========================================================================== */

const TEMPLATES = (() => {

  const fmt = (n) => Number(Math.round(n) || 0).toLocaleString("th-TH");
  const gradeBadge = (g) => {
    const map = { pass: ["ผ่าน", "g-pass"], warn: ["เฝ้าระวัง", "g-warn"], fail: ["ไม่ผ่าน", "g-fail"] };
    const [t, cls] = map[g] || ["-", ""];
    return `<span class="badge ${cls}">${t}</span>`;
  };
  const sevBadge = (s) => {
    const map = { high: ["สูง", "g-fail"], medium: ["กลาง", "g-warn"], low: ["ต่ำ", "g-pass"] };
    const [t, cls] = map[s] || ["-", ""];
    return `<span class="badge ${cls}">${t}</span>`;
  };

  /* ---- 1) CREDIT ANALYSIS --------------------------------------------- */
  function creditAnalysis(a) {
    const c = a.case, r = a.ratios;
    const rows = a.ratioReport.map((x) => `
      <tr>
        <td><strong>${x.key}</strong><br><small>${x.desc}</small></td>
        <td class="num">${x.value}${x.unit}</td>
        <td class="num">${x.target}</td>
        <td>${gradeBadge(x.grade)}</td>
      </tr>`).join("");

    return `
      <h3>1. Credit Analysis — การวิเคราะห์สินเชื่อ</h3>
      <div class="kv-grid">
        <div><span>รายได้รวม/ปี (Revenue)</span><b>${fmt(c.annualRevenue)} ฿</b></div>
        <div><span>กำไรจากการดำเนินงาน (NOI)</span><b>${fmt(r.noi)} ฿</b></div>
        <div><span>ภาระหนี้ใหม่/ปี (New Debt Service)</span><b>${fmt(r.newDebtService)} ฿</b></div>
        <div><span>ภาระหนี้รวม/ปี (Total Debt Service)</span><b>${fmt(r.totalDebtService)} ฿</b></div>
      </div>
      <table class="ratio-table">
        <thead><tr><th>Ratio</th><th>ค่าจริง</th><th>เกณฑ์</th><th>ผล</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  /* ---- 2) RISK ASSESSMENT --------------------------------------------- */
  function riskAssessment(a) {
    const risk = a.risk;
    if (!risk.triggered.length) {
      return `<h3>2. Risk Assessment — การประเมินความเสี่ยง</h3>
              <p class="muted">ไม่พบ risk pattern ที่เข้าข่าย</p>`;
    }
    const items = risk.triggered.map((p) => `
      <div class="risk-item sev-${p.severity}">
        <div class="risk-head">${sevBadge(p.severity)} <strong>${p.label}</strong></div>
        <div class="risk-cat">${p.category}</div>
        <div class="risk-mit"><span>แนวทางควบคุม:</span> ${p.mitigation}</div>
      </div>`).join("");

    return `
      <h3>2. Risk Assessment — การประเมินความเสี่ยง</h3>
      <div class="risk-score">
        Risk Score: <b>${risk.riskScore}/100</b> &nbsp;|&nbsp; ระดับ: <b>${risk.level}</b>
        <span class="muted">(ตรวจอัตโนมัติจาก ${KNOWLEDGE.riskPatterns.length} risk patterns)</span>
      </div>
      ${items}`;
  }

  /* ---- 3) RECOMMENDATION ---------------------------------------------- */
  function recommendation(a) {
    const rec = a.recommendation;
    const conds = rec.conditions.map((x) => `<li>${x}</li>`).join("");
    return `
      <h3>3. Recommendation — ข้อเสนอแนะ</h3>
      <div class="decision decision-${rec.color}">
        <div class="decision-label">${rec.decision}</div>
        <div class="decision-meta">ผ่านเกณฑ์การเงิน ${rec.passCount}/${rec.totalCount} ตัวชี้วัด</div>
      </div>
      <p>${rec.summary}</p>
      <h4>เงื่อนไขประกอบการพิจารณา (Covenants)</h4>
      <ul class="cond-list">${conds}</ul>`;
  }

  /* ---- 4) CREDIT MEMO (draft) ----------------------------------------- *
   * เอกสารฉบับร่างพร้อมเสนอ — รวมทุก section เป็นรูปแบบมาตรฐานของธนาคาร
   * ------------------------------------------------------------------- */
  function creditMemo(a) {
    const c = a.case, r = a.ratios, rec = a.recommendation;
    const d = new Date(a.generatedAt);
    const dateStr = d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const conds = rec.conditions.map((x, i) => `${i + 1}. ${x}`).join("\n      ");

    return `
      <h3>4. Credit Memo (ฉบับร่าง) — บันทึกเสนอขออนุมัติสินเชื่อ</h3>
      <div class="memo">
<pre>
บันทึกข้อความเสนอขออนุมัติสินเชื่อ (CREDIT MEMORANDUM)
ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)
เลขที่อ้างอิง : ${c.refNo || "DRAFT-AUTO"}        วันที่ : ${dateStr}
──────────────────────────────────────────────────────────────

1. ข้อมูลผู้ขอสินเชื่อ
   ชื่อผู้กู้        : ${c.borrowerName}
   ประเภทกิจการ     : ${c.businessType}
   วัตถุประสงค์      : ${c.purpose}

2. รายละเอียดวงเงินที่เสนอ
   วงเงินขอกู้       : ${fmt(c.loanAmount)} บาท
   ระยะเวลา         : ${c.termMonths} เดือน (${(c.termMonths / 12).toFixed(0)} ปี)
   อัตราดอกเบี้ย      : ${r.interestRate}% ต่อปี
   ผ่อนชำระ/ปี       : ${fmt(r.newDebtService)} บาท
   หลักประกัน        : ${c.collateralDesc} (มูลค่า ${fmt(c.collateralValue)} บาท)

3. บทวิเคราะห์ความสามารถชำระหนี้
   - กำไรจากการดำเนินงาน (NOI)  : ${fmt(r.noi)} บาท/ปี
   - DSCR                       : ${r.dscr}x  (เกณฑ์ ≥ ${KNOWLEDGE.thresholds.dscr.min})
   - LTV                        : ${r.ltv}%  (เกณฑ์ ≤ ${KNOWLEDGE.thresholds.ltv.max}%)
   - D/E                        : ${r.de}x
   - Net Profit Margin          : ${r.netMargin}%

4. ความเห็นด้านความเสี่ยง
   ระดับความเสี่ยงโดยรวม : ${a.risk.level} (Risk Score ${a.risk.riskScore}/100)
   ความเสี่ยงสำคัญที่ตรวจพบ :
   ${a.risk.triggered.map((p, i) => `${i + 1}. ${p.label}`).join("\n   ") || "- ไม่มี"}

5. ความเห็นและข้อเสนอ
   ผลการพิจารณา (ฉบับร่าง) : ${rec.decision}
   ${rec.summary}

   เงื่อนไขประกอบการอนุมัติ :
      ${conds}

6. การลงนาม
   ผู้จัดทำ (RM)        : ____________________   (ระบบร่างให้อัตโนมัติ)
   ผู้พิจารณา/อนุมัติ    : ____________________
──────────────────────────────────────────────────────────────
สร้างโดย Loan Brain OS | Framework v${a.frameworkVersion}
* เอกสารนี้เป็น "ฉบับร่าง" — ต้องผ่านการตรวจและอนุมัติโดยเจ้าหน้าที่ (Human-in-the-loop)
</pre>
      </div>`;
  }

  return { creditAnalysis, riskAssessment, recommendation, creditMemo };
})();

window.TEMPLATES = TEMPLATES;
