/* =============================================================================
 * ENGINE LAYER v2 — Knowledge → Output Engine
 * -----------------------------------------------------------------------------
 * • Scenario Engine    : base drivers ชุดเดียว → 3 กรณี + Assumption Ledger (มีที่มา)
 * • Risk Disclosure    : กลั่นกรองจำลอง → ประเด็น + คำตอบ + covenant
 * • DoA Routing        : วงเงิน → ใครทำ/เข้าท่อไหน/เอกสารลึกแค่ไหน
 * • Compliance Engine  : auto-check มาตรฐาน/ข้อกำกับ
 * =========================================================================== */

const ENGINE = (() => {
  const round2 = (n) => Math.round(n * 100) / 100;
  const r0 = (n) => Math.round(n);

  // PMT มาตรฐาน : ภาระหนี้รายปี (amortizing)
  function annualDebtService(P, annualRatePct, months) {
    const r = (annualRatePct / 100) / 12;
    if (r === 0) return (P / months) * 12;
    return P * r / (1 - Math.pow(1 + r, -months)) * 12;
  }

  /* ---- คำนวณ 1 กรณี (case) จากชุด driver ----------------------------- */
  function computeCase(ind, drivers, ratePct, c) {
    const rev = ind.revenue(drivers);
    const cost = ind.cost(drivers, rev);
    const noi = rev - cost;
    const newDS = annualDebtService(c.loanAmount, ratePct, c.termMonths);
    const totalDS = newDS + c.existingDebtService;
    return {
      revenue: r0(rev), cost: r0(cost), noi: r0(noi),
      newDebtService: r0(newDS), totalDebtService: r0(totalDS),
      dscr: round2(noi / totalDS),
      netMargin: round2(((noi - totalDS) / rev) * 100),
      ratePct,
    };
  }

  /* ---- SCENARIO ENGINE : base (Customer) → Bank → Conservative -------- *
   * Customer = ตามที่ RM กรอก (แผนลูกค้า)
   * Bank     = haircut ด้วย benchmark (KNOWLEDGE)
   * Conserv. = Bank + stress params (POLICY)  ← กฎมาจากนโยบาย ไม่ใช่ RM
   * --------------------------------------------------------------------- */
  function buildScenarios(c) {
    const ind = KNOWLEDGE.industries[c.industry];
    const bm = ind.benchmark;
    const P = KNOWLEDGE.policy;
    const baseRate = c.interestRate;

    // ----- Customer (as entered) -----
    const dCustomer = { ...c.drivers };

    // ----- Bank (benchmark haircut) -----
    const dBank = { ...dCustomer };
    if (dBank.price != null && bm.price != null) dBank.price = Math.min(dBank.price, bm.price);
    if (dBank.feedPct != null && bm.feedPct != null) dBank.feedPct = bm.feedPct;
    if (dBank.yield != null && bm.yieldCap != null) dBank.yield = Math.min(dBank.yield, bm.yieldCap);
    if (dBank.heads != null && bm.utilization != null) dBank.heads = r0(dBank.heads * bm.utilization);
    if (dBank.birds != null && bm.utilization != null) dBank.birds = r0(dBank.birds * bm.utilization);

    // ----- Conservative (Bank + policy stress) -----
    const dCons = { ...dBank };
    if (dCons.price != null) dCons.price = round2(dCons.price * (1 - P.stress.priceDrop));
    if (dCons.feedPct != null) dCons.feedPct = dCons.feedPct + P.stress.feedAdd;
    const consRate = baseRate + P.stress.rateAddBps / 100;

    return {
      customer:     { drivers: dCustomer, ...computeCase(ind, dCustomer, baseRate, c) },
      bank:         { drivers: dBank,     ...computeCase(ind, dBank, baseRate, c) },
      conservative: { drivers: dCons,     ...computeCase(ind, dCons, consRate, c) },
      ledger: buildLedger(ind, dCustomer, dBank, dCons, baseRate, consRate),
    };
  }

  /* ---- ASSUMPTION LEDGER : ทุกสมมติฐานมี "ที่มา" (กันนั่งเทียน) ⭐ ----- */
  function buildLedger(ind, dC, dB, dCons, baseRate, consRate) {
    const P = KNOWLEDGE.policy;
    const rows = ind.drivers.map((dr) => {
      let source = "ตามที่ลูกค้าเสนอ / benchmark กลุ่ม";
      if (dr.key === "price")   source = ind.benchmark.priceSource + " · Conservative = −" + (P.stress.priceDrop * 100) + "% (Policy " + P.version + ")";
      else if (dr.key === "feedPct") source = "Bank = ค่าเฉลี่ยกลุ่มอุตสาหกรรม (benchmark)";
      else if (dr.key === "heads" || dr.key === "birds") source = "Bank = haircut utilization " + (ind.benchmark.utilization * 100) + "%";
      else if (dr.key === "yield") source = "Bank = เพดานผลผลิต benchmark";
      else if (dr.key === "weight") source = "benchmark น้ำหนักขายกลุ่ม";
      return {
        label: dr.label, unit: dr.unit,
        customer: dC[dr.key], bank: dB[dr.key], conservative: dCons[dr.key],
        source,
      };
    });
    rows.push({
      label: "อัตราดอกเบี้ย", unit: "% ต่อปี",
      customer: baseRate, bank: baseRate, conservative: consRate,
      source: "สัญญา · Conservative = +" + P.stress.rateAddBps + "bps (Policy " + P.version + ")",
    });
    return rows;
  }

  /* ---- RISK DISCLOSURE : กลั่นกรองจำลอง -------------------------------- */
  function riskDisclosure(c, scen) {
    const ind = KNOWLEDGE.industries[c.industry];
    const T = KNOWLEDGE.policy.thresholds;
    const out = [];

    // 1) Conservative DSCR ต่ำกว่าเกณฑ์
    if (scen.conservative.dscr < T.dscr.min) {
      out.push({
        issue: `Conservative DSCR ${scen.conservative.dscr} < เกณฑ์ ${T.dscr.min}`,
        why: "เมื่อราคาตก + ดอกเบี้ยขึ้นพร้อมกัน ความสามารถชำระหนี้ตึง",
        ans: "covenant รักษา DSCR ≥ 1.25 + กันเงินสำรองชำระหนี้ 1 งวด + พิจารณายืดระยะเวลา",
      });
    }
    // 2) ราคาที่ลูกค้าเสนอ > benchmark
    if (c.drivers.price != null && ind.benchmark.price != null && c.drivers.price > ind.benchmark.price) {
      out.push({
        issue: `ราคาที่ลูกค้าเสนอ ${c.drivers.price} สูงกว่า benchmark ${ind.benchmark.price}`,
        why: "committee จะมองว่าสมมติฐานรายได้ optimistic",
        ans: "ใช้ราคา benchmark (เฉลี่ย 3 ปี) ในการอนุมัติ + อ้างราคาประกันรายได้เป็น floor",
      });
    }
    // 3) LTV
    const ltv = round2((c.loanAmount / c.collateralValue) * 100);
    if (ltv > T.ltv.safe) {
      out.push({
        issue: `LTV ${ltv}% สูงกว่าระดับปลอดภัย ${T.ltv.safe}%`,
        why: "หลักประกันเฉพาะทางอาจขายทอดตลาดยาก",
        ans: "เสริมหลักประกัน/ค้ำ บสย. + ประเมินราคาใหม่ทุก 2 ปี",
      });
    }
    // 4) ความเสี่ยงเฉพาะอุตสาหกรรม (high severity)
    ind.risks.filter((r) => r.sev === "high").forEach((r) => {
      out.push({ issue: r.label + " (ตัวแปรนอกประมาณการ)", why: "กระทบรายได้ทั้งกิจการ", ans: r.mit });
    });
    // 5) challenge เฉพาะสาขา
    ind.challenges.filter((ch) => ch.when(scen)).forEach((ch) =>
      out.push({ issue: ch.issue, why: ch.why, ans: ch.ans })
    );

    return out;
  }

  /* ---- DoA ROUTING : เคสนี้เข้าท่อไหน --------------------------------- */
  function route(loanAmount) {
    const tier = KNOWLEDGE.doa.tiers.find((t) => loanAmount <= t.max);
    return { ...tier, doaVersion: KNOWLEDGE.doa.version };
  }

  /* ---- COMPLIANCE ENGINE : auto-check มาตรฐาน ------------------------- */
  function compliance(c) {
    const ind = KNOWLEDGE.industries[c.industry];
    const checks = [];
    checks.push({ label: "ตรวจบุคคลล้มละลาย", pass: !c.flagBankrupt, note: c.flagBankrupt ? "พบรายชื่อ" : "ไม่พบรายชื่อ" });
    checks.push({ label: "รายงานข้อมูลเครดิต (NCB)", pass: (c.ncbScore ?? 700) >= 600, note: "NCB Score " + (c.ncbScore ?? "-") });
    checks.push({ label: "AML/CFT", pass: !c.flagAML, note: c.flagAML ? "เข้าข่าย" : "ไม่เข้าข่าย" });
    checks.push({ label: "กฎกระทรวง (ภาคเกษตร 80% / นอกภาคเกษตร 20%)",
      pass: ind.sector === "เกษตรกรรม", note: ind.sector === "เกษตรกรรม" ? "ภาคเกษตร ✓" : "นอกภาคเกษตร" });
    const sllPct = round2((c.loanAmount / (c.bankCapital || 200_000_000_000)) * 100);
    checks.push({ label: "Single Lending Limit (≤ 15% เงินกองทุน)", pass: sllPct <= 15, note: sllPct + "%" });
    return { checks, allPass: checks.every((x) => x.pass) };
  }

  /* ---- RECOMMENDATION (ใช้ Bank case เป็นฐานตัดสิน) ------------------- */
  function recommend(c, scen, risk) {
    const T = KNOWLEDGE.policy.thresholds;
    const ltv = round2((c.loanAmount / c.collateralValue) * 100);
    const bankOK = scen.bank.dscr >= T.dscr.min && ltv <= T.ltv.max;
    const consWeak = scen.conservative.dscr < T.dscr.min;

    let decision, color, summary;
    if (bankOK && !consWeak) {
      decision = "อนุมัติ (Approve)"; color = "approve";
      summary = "ผ่านเกณฑ์ทุกกรณี ความเสี่ยงบริหารจัดการได้";
    } else if (bankOK && consWeak) {
      decision = "อนุมัติแบบมีเงื่อนไข (Approve with Conditions)"; color = "conditional";
      summary = "กรณีฐานแข็งแรง แต่กรณี Conservative ตึง — ต้องคุมด้วยเงื่อนไขตาม Risk Disclosure";
    } else {
      decision = "ทบทวน/ปรับโครงสร้าง (Reconsider)"; color = "reject";
      summary = "ตัวชี้วัดหลักไม่ผ่านในกรณีฐาน ควรปรับวงเงิน/หลักประกัน";
    }
    return { decision, color, summary, ltv,
      covenants: risk.map((r) => r.ans).filter((v, i, a) => a.indexOf(v) === i) };
  }

  /* ---- MAIN PIPELINE -------------------------------------------------- */
  function run(c) {
    const scenarios = buildScenarios(c);
    const risk = riskDisclosure(c, scenarios);
    const routing = route(c.loanAmount);
    const comp = compliance(c);
    const recommendation = recommend(c, scenarios, risk);
    return {
      case: c, scenarios, risk, routing, compliance: comp, recommendation,
      generatedAt: new Date().toISOString(),
      policyVersion: KNOWLEDGE.policy.version,
      doaVersion: KNOWLEDGE.doa.version,
    };
  }

  return { run, route, annualDebtService };
})();

window.ENGINE = ENGINE;
