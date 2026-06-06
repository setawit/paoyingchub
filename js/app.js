/* =============================================================================
 * APP — Orchestration & UI
 * -----------------------------------------------------------------------------
 * เชื่อม UI ↔ ENGINE ↔ TEMPLATES ↔ STORE
 * Flow : กรอก/โหลด input → ENGINE.run() → render output → RM approve → STORE
 *
 * Design Principle #4 : AI = draft, RM = approve (ปุ่มอนุมัติ/ส่งกลับแก้)
 * =========================================================================== */

const APP = (() => {
  let currentAnalysis = null;

  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Number(n || 0).toLocaleString("th-TH");

  /* ---- Navigation ระหว่าง view ---------------------------------------- */
  function showView(name) {
    ["dashboard", "newcase", "knowledge"].forEach((v) => {
      $("view-" + v).classList.toggle("hidden", v !== name);
      $("nav-" + v).classList.toggle("active", v === name);
    });
    if (name === "dashboard") renderDashboard();
    if (name === "knowledge") renderKnowledge();
  }

  /* ---- อ่านค่าจากฟอร์ม input ------------------------------------------ */
  function readForm() {
    const num = (id) => Number($(id).value) || 0;
    return {
      refNo: $("f_refNo").value,
      borrowerName: $("f_borrowerName").value,
      businessType: $("f_businessType").value,
      industry: $("f_industry").value,
      purpose: $("f_purpose").value,
      product: "farm_expansion",
      loanAmount: num("f_loanAmount"),
      termMonths: num("f_termMonths"),
      collateralValue: num("f_collateralValue"),
      collateralDesc: $("f_collateralDesc").value,
      annualRevenue: num("f_annualRevenue"),
      annualOpEx: num("f_annualOpEx"),
      feedCostRatio: num("f_feedCostRatio"),
      existingDebt: num("f_existingDebt"),
      existingDebtService: num("f_existingDebtService"),
      equity: num("f_equity"),
      currentAssets: num("f_currentAssets"),
      currentLiabilities: num("f_currentLiabilities"),
    };
  }

  function fillForm(c) {
    const set = (id, v) => { $(id).value = v; };
    set("f_refNo", c.refNo); set("f_borrowerName", c.borrowerName);
    set("f_businessType", c.businessType); set("f_industry", c.industry);
    set("f_purpose", c.purpose); set("f_loanAmount", c.loanAmount);
    set("f_termMonths", c.termMonths); set("f_collateralValue", c.collateralValue);
    set("f_collateralDesc", c.collateralDesc); set("f_annualRevenue", c.annualRevenue);
    set("f_annualOpEx", c.annualOpEx); set("f_feedCostRatio", c.feedCostRatio);
    set("f_existingDebt", c.existingDebt); set("f_existingDebtService", c.existingDebtService);
    set("f_equity", c.equity); set("f_currentAssets", c.currentAssets);
    set("f_currentLiabilities", c.currentLiabilities);
  }

  /* ---- GENERATE : หัวใจของ demo --------------------------------------- *
   * จับเวลาเพื่อโชว์ value prop "3 ชม. → 20 นาที / วินาที"
   * ------------------------------------------------------------------- */
  function generate() {
    const t0 = performance.now();
    const input = readForm();
    if (!input.borrowerName || !input.loanAmount) {
      alert("กรุณากรอกชื่อผู้กู้และวงเงินขอกู้เป็นอย่างน้อย");
      return;
    }
    currentAnalysis = ENGINE.run(input);
    const ms = Math.max(1, Math.round(performance.now() - t0));

    const out = $("output");
    out.innerHTML = `
      <div class="gen-banner">
        ⚡ ระบบผลิตผลวิเคราะห์เสร็จใน <b>${ms} มิลลิวินาที</b>
        <span>(เทียบกระบวนการเดิม 2–4 ชั่วโมง/เคส)</span>
      </div>
      <div class="output-card">${TEMPLATES.creditAnalysis(currentAnalysis)}</div>
      <div class="output-card">${TEMPLATES.riskAssessment(currentAnalysis)}</div>
      <div class="output-card">${TEMPLATES.recommendation(currentAnalysis)}</div>
      <div class="output-card">${TEMPLATES.creditMemo(currentAnalysis)}</div>
      ${approvalBar()}
    `;
    out.classList.remove("hidden");
    out.scrollIntoView({ behavior: "smooth" });
    bindApproval();
  }

  /* ---- RM Approval Bar (Human-in-the-loop) --------------------------- */
  function approvalBar() {
    return `
      <div class="approval-bar">
        <span class="approval-note">
          🧑‍⚖️ เอกสารนี้เป็น <b>ฉบับร่างจากระบบ</b> — เจ้าหน้าที่ (RM) เป็นผู้ตัดสินใจขั้นสุดท้าย
        </span>
        <div class="approval-actions">
          <button class="btn btn-approve" data-status="อนุมัติแล้ว">✓ อนุมัติ &amp; บันทึกเข้าคลัง</button>
          <button class="btn btn-warn" data-status="ส่งกลับแก้ไข">↩ ส่งกลับแก้ไข</button>
          <button class="btn btn-ghost" data-status="รอพิจารณา">บันทึกเป็นร่าง</button>
        </div>
      </div>`;
  }

  function bindApproval() {
    document.querySelectorAll(".approval-actions .btn").forEach((b) => {
      b.addEventListener("click", () => {
        const rec = STORE.saveCase(currentAnalysis, b.dataset.status);
        alert(`บันทึกเคส ${rec.refNo} สถานะ "${rec.status}" เข้าคลังความรู้แล้ว`);
        showView("knowledge");
      });
    });
  }

  /* ---- DASHBOARD ------------------------------------------------------ */
  function renderDashboard() {
    const s = STORE.stats();
    $("dash-stats").innerHTML = `
      <div class="stat"><div class="stat-num">${s.total}</div><div>เคสในคลัง</div></div>
      <div class="stat"><div class="stat-num">${s.approved}</div><div>อนุมัติแล้ว</div></div>
      <div class="stat"><div class="stat-num">${fmt(s.totalAmount)}</div><div>วงเงินรวม (฿)</div></div>
      <div class="stat"><div class="stat-num">${s.avgRisk}</div><div>Risk Score เฉลี่ย</div></div>`;
  }

  /* ---- KNOWLEDGE BASE : รายการเคสที่สะสม ------------------------------ */
  function renderKnowledge() {
    const list = STORE.list();
    const box = $("kb-list");
    if (!list.length) {
      box.innerHTML = `<p class="muted">ยังไม่มีเคสในคลัง — สร้างเคสใหม่เพื่อเริ่มสะสม knowledge</p>`;
      return;
    }
    box.innerHTML = list.map((x) => `
      <div class="kb-row">
        <div class="kb-main">
          <strong>${x.borrowerName}</strong> <span class="muted">(${x.refNo})</span>
          <div class="muted">วงเงิน ${fmt(x.loanAmount)} ฿ · ${x.decision} · Risk ${x.riskScore}</div>
        </div>
        <div class="kb-side">
          <span class="badge status">${x.status}</span>
          <button class="btn btn-ghost sm" data-load="${x.id}">เปิดดู</button>
          <button class="btn btn-ghost sm" data-del="${x.id}">ลบ</button>
        </div>
      </div>`).join("");

    box.querySelectorAll("[data-load]").forEach((b) => b.addEventListener("click", () => {
      const rec = STORE.list().find((x) => x.id === b.dataset.load);
      fillForm(rec.case); showView("newcase"); generate();
    }));
    box.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      STORE.remove(b.dataset.del); renderKnowledge(); renderDashboard();
    }));
  }

  /* ---- INIT ----------------------------------------------------------- */
  function init() {
    $("nav-dashboard").addEventListener("click", () => showView("dashboard"));
    $("nav-newcase").addEventListener("click", () => showView("newcase"));
    $("nav-knowledge").addEventListener("click", () => showView("knowledge"));

    $("btn-generate").addEventListener("click", generate);
    $("btn-loadsample").addEventListener("click", () => {
      fillForm(SAMPLE_CASES.swine_25m);
    });
    $("btn-clearstore").addEventListener("click", () => {
      if (confirm("ลบเคสทั้งหมดในคลัง?")) { STORE.clear(); renderKnowledge(); renderDashboard(); }
    });

    // แสดงเวอร์ชัน framework (governance)
    $("fw-version").textContent =
      "Framework v" + KNOWLEDGE.governance.frameworkVersion +
      " · " + KNOWLEDGE.framework.name;

    fillForm(SAMPLE_CASES.swine_25m);   // โหลดเคสตัวอย่างไว้ให้พร้อม demo
    showView("dashboard");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", APP.init);
