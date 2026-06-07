/* =============================================================================
 * APP v2 — Orchestration & UI
 * เชื่อม UI ↔ ENGINE ↔ TEMPLATES ↔ STORE
 * Flow: เลือกอุตสาหกรรม → กรอก driver → ENGINE.run → output A/B/C (ลึกตาม tier)
 * =========================================================================== */

const APP = (() => {
  let current = null;
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => Number(n || 0).toLocaleString("th-TH");

  function showView(name) {
    ["dashboard", "newcase", "knowledge"].forEach((v) => {
      $("view-" + v).classList.toggle("hidden", v !== name);
      $("nav-" + v).classList.toggle("active", v === name);
    });
    if (name === "dashboard") renderDashboard();
    if (name === "knowledge") renderKnowledge();
  }

  /* ---- สร้างฟอร์ม driver ตามอุตสาหกรรมที่เลือก (adaptive schema) ------ */
  function renderDriverInputs(industryKey, values) {
    const ind = KNOWLEDGE.industries[industryKey];
    $("driver-box").innerHTML = ind.drivers.map((d) => `
      <label>${d.label} <small>(${d.unit})</small>
        <input type="number" step="any" data-driver="${d.key}"
               value="${values && values[d.key] != null ? values[d.key] : d.sample}">
      </label>`).join("");
  }

  function readForm() {
    const num = (id) => Number($(id).value) || 0;
    const drivers = {};
    document.querySelectorAll("[data-driver]").forEach((el) => drivers[el.dataset.driver] = Number(el.value) || 0);
    return {
      refNo: $("f_refNo").value, borrowerName: $("f_borrowerName").value,
      industry: $("f_industry").value, customerType: $("f_customerType").value,
      purpose: $("f_purpose").value,
      loanAmount: num("f_loanAmount"), termMonths: num("f_termMonths"),
      interestRate: Number($("f_interestRate").value) || 6.5,
      collateralValue: num("f_collateralValue"), collateralDesc: $("f_collateralDesc").value,
      existingDebtService: num("f_existingDebtService"),
      ncbScore: num("f_ncbScore"), bankCapital: 220000000000,
      flagBankrupt: false, flagAML: false, drivers,
    };
  }

  function fillForm(c) {
    const set = (id, v) => { if ($(id)) $(id).value = v; };
    set("f_refNo", c.refNo); set("f_borrowerName", c.borrowerName);
    set("f_industry", c.industry); set("f_customerType", c.customerType);
    set("f_purpose", c.purpose); set("f_loanAmount", c.loanAmount);
    set("f_termMonths", c.termMonths); set("f_interestRate", c.interestRate);
    set("f_collateralValue", c.collateralValue); set("f_collateralDesc", c.collateralDesc);
    set("f_existingDebtService", c.existingDebtService); set("f_ncbScore", c.ncbScore);
    renderDriverInputs(c.industry, c.drivers);
  }

  function generate() {
    const t0 = performance.now();
    const input = readForm();
    if (!input.borrowerName || !input.loanAmount) { alert("กรุณากรอกชื่อผู้กู้และวงเงิน"); return; }
    current = ENGINE.run(input);
    const ms = Math.max(1, Math.round(performance.now() - t0));
    $("output").innerHTML = `
      <div class="gen-banner">⚡ ผลิตเอกสาร Credit Approval ใน <b>${ms} มิลลิวินาที</b>
        <span>(เทียบ RM มือใหม่ 7–10 วัน/เคส)</span></div>
      ${TEMPLATES.render(current)}
      ${approvalBar()}`;
    $("output").classList.remove("hidden");
    $("output").scrollIntoView({ behavior: "smooth" });
    bindApproval();
  }

  function approvalBar() {
    return `<div class="approval-bar">
      <span class="approval-note">🧑‍⚖️ ฉบับร่างจากระบบ — RM/กลั่นกรองเป็นผู้ตัดสินใจขั้นสุดท้าย</span>
      <div class="approval-actions">
        <button class="btn btn-approve" data-status="อนุมัติแล้ว">✓ อนุมัติ &amp; บันทึกเข้าคลัง</button>
        <button class="btn btn-warn" data-status="ส่งกลับแก้ไข">↩ ส่งกลับแก้ไข</button>
        <button class="btn btn-ghost" data-status="รอพิจารณา">บันทึกเป็นร่าง</button>
      </div></div>`;
  }

  function bindApproval() {
    document.querySelectorAll(".approval-actions .btn").forEach((b) =>
      b.addEventListener("click", () => {
        const rec = STORE.saveCase(current, b.dataset.status);
        alert(`บันทึกเคส ${rec.refNo} สถานะ "${rec.status}" เข้าคลังแล้ว`);
        showView("knowledge");
      }));
  }

  function renderDashboard() {
    const s = STORE.stats();
    $("dash-stats").innerHTML = `
      <div class="stat"><div class="stat-num">${s.total}</div><div>เคสในคลัง</div></div>
      <div class="stat"><div class="stat-num">${s.approved}</div><div>อนุมัติแล้ว</div></div>
      <div class="stat"><div class="stat-num">${fmt(s.totalAmount)}</div><div>วงเงินรวม (฿)</div></div>
      <div class="stat"><div class="stat-num">${s.industries}</div><div>อุตสาหกรรม</div></div>`;
  }

  function renderKnowledge() {
    const list = STORE.list(), box = $("kb-list");
    if (!list.length) { box.innerHTML = `<p class="muted">ยังไม่มีเคสในคลัง</p>`; return; }
    box.innerHTML = list.map((x) => `
      <div class="kb-row">
        <div class="kb-main"><strong>${x.borrowerName}</strong> <span class="muted">(${x.refNo})</span>
          <div class="muted">${KNOWLEDGE.industries[x.industry].label} · ${fmt(x.loanAmount)} ฿ · ${x.tier} · ${x.decision}</div></div>
        <div class="kb-side"><span class="badge status">${x.status}</span>
          <button class="btn btn-ghost sm" data-load="${x.id}">เปิดดู</button>
          <button class="btn btn-ghost sm" data-del="${x.id}">ลบ</button></div>
      </div>`).join("");
    box.querySelectorAll("[data-load]").forEach((b) => b.addEventListener("click", () => {
      fillForm(STORE.list().find((x) => x.id === b.dataset.load).case); showView("newcase"); generate();
    }));
    box.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
      STORE.remove(b.dataset.del); renderKnowledge(); renderDashboard();
    }));
  }

  function init() {
    $("nav-dashboard").addEventListener("click", () => showView("dashboard"));
    $("nav-newcase").addEventListener("click", () => showView("newcase"));
    $("nav-knowledge").addEventListener("click", () => showView("knowledge"));
    $("btn-generate").addEventListener("click", generate);
    $("btn-clearstore").addEventListener("click", () => {
      if (confirm("ลบเคสทั้งหมด?")) { STORE.clear(); renderKnowledge(); renderDashboard(); }
    });

    // populate industry dropdown
    $("f_industry").innerHTML = Object.entries(KNOWLEDGE.industries)
      .map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");
    $("f_industry").addEventListener("change", () => renderDriverInputs($("f_industry").value));

    // sample case buttons
    document.querySelectorAll("[data-sample]").forEach((b) =>
      b.addEventListener("click", () => { fillForm(SAMPLE_CASES[b.dataset.sample]); showView("newcase"); }));

    $("fw-version").textContent = "Policy " + KNOWLEDGE.policy.version + " · DoA " + KNOWLEDGE.doa.version;
    fillForm(SAMPLE_CASES.swine_25m);
    showView("dashboard");
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", APP.init);
