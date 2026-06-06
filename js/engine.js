/* =============================================================================
 * ENGINE LAYER — "Knowledge → Output Engine"
 * -----------------------------------------------------------------------------
 * หัวใจของ Loan Brain OS : รับ input ลูกค้า → ประมวลผลผ่าน framework + knowledge
 * → ผลิต analysis แบบ deterministic (Design Principle #1 : Output > Process)
 *
 * Engine ไม่เก็บ logic การให้สินเชื่อเอง — ดึงทุกเกณฑ์จาก KNOWLEDGE (control)
 * =========================================================================== */

const ENGINE = (() => {

  const fmt = (n) => Number(n || 0).toLocaleString("th-TH");
  const round2 = (n) => Math.round(n * 100) / 100;

  /* ---- 1) คำนวณภาระหนี้รายปี (Annual Debt Service) -------------------- *
   * สูตร PMT มาตรฐาน : ผ่อนเท่ากันทุกงวด (amortizing)
   * ------------------------------------------------------------------- */
  function annualDebtService(loanAmount, annualRatePct, termMonths) {
    const r = (annualRatePct / 100) / 12;
    const n = termMonths;
    if (r === 0) return (loanAmount / n) * 12;
    const pmt = loanAmount * r / (1 - Math.pow(1 + r, -n));
    return pmt * 12;
  }

  /* ---- 2) Financial Analysis : คำนวณ ratio ทั้งหมด ------------------- */
  function calculateFinancials(c) {
    const product = KNOWLEDGE.products[c.product] || KNOWLEDGE.products.farm_expansion;

    const noi = c.annualRevenue - c.annualOpEx;            // Net Operating Income
    const netProfit = noi - c.existingDebtService;          // กำไรสุทธิหลังหนี้เดิม
    const newDebtService = annualDebtService(
      c.loanAmount, product.interestRate, c.termMonths
    );
    const totalDebtService = newDebtService + c.existingDebtService;
    const totalDebt = c.loanAmount + c.existingDebt;

    return {
      noi,
      netProfit,
      newDebtService: Math.round(newDebtService),
      totalDebtService: Math.round(totalDebtService),
      // --- Key Ratios ---
      dscr:        round2(noi / totalDebtService),
      ltv:         round2((c.loanAmount / c.collateralValue) * 100),
      de:          round2(totalDebt / c.equity),
      currentRatio:round2(c.currentAssets / c.currentLiabilities),
      netMargin:   round2((netProfit / c.annualRevenue) * 100),
      feedCostRatio: c.feedCostRatio,
      interestRate: product.interestRate,
      termMonths: c.termMonths,
    };
  }

  /* ---- 3) ประเมินแต่ละ ratio เทียบ threshold (pass / warn / fail) ----- */
  function gradeRatio(value, t, higherIsBetter = true) {
    if (higherIsBetter) {
      if (value >= (t.strong ?? t.safe)) return "pass";
      if (value >= t.min) return "warn";
      return "fail";
    } else { // lower is better (LTV, D/E)
      if (value <= t.safe) return "pass";
      if (value <= t.max) return "warn";
      return "fail";
    }
  }

  function buildRatioReport(r) {
    const T = KNOWLEDGE.thresholds;
    return [
      { key: "DSCR",          value: r.dscr,         unit: "x", grade: gradeRatio(r.dscr, T.dscr, true),
        target: `≥ ${T.dscr.min}`, desc: "ความสามารถชำระหนี้ (Debt Service Coverage)" },
      { key: "LTV",           value: r.ltv,          unit: "%", grade: gradeRatio(r.ltv, T.ltv, false),
        target: `≤ ${T.ltv.max}%`, desc: "วงเงินต่อมูลค่าหลักประกัน (Loan-to-Value)" },
      { key: "D/E",           value: r.de,           unit: "x", grade: gradeRatio(r.de, T.de, false),
        target: `≤ ${T.de.max}`, desc: "หนี้สินต่อส่วนของเจ้าของ (Debt-to-Equity)" },
      { key: "Current Ratio", value: r.currentRatio, unit: "x", grade: gradeRatio(r.currentRatio, T.currentRatio, true),
        target: `≥ ${T.currentRatio.min}`, desc: "สภาพคล่องระยะสั้น (Liquidity)" },
      { key: "Net Margin",    value: r.netMargin,    unit: "%", grade: gradeRatio(r.netMargin, T.netMargin, true),
        target: `≥ ${T.netMargin.min}%`, desc: "อัตรากำไรสุทธิ (Net Profit Margin)" },
    ];
  }

  /* ---- 4) Risk Assessment : รัน risk pattern ทั้งหมดอัตโนมัติ --------- *
   * Risk Control (6.3) : "risk pattern ถูกตรวจอัตโนมัติ" — ไม่พึ่งคนจำ
   * ------------------------------------------------------------------- */
  function assessRisk(c, ratios) {
    const triggered = KNOWLEDGE.riskPatterns.filter((p) => {
      try { return p.detect(c, ratios); } catch { return false; }
    });

    const weight = { high: 25, medium: 12, low: 5 };
    const rawScore = triggered.reduce((s, p) => s + weight[p.severity], 0);
    const riskScore = Math.min(100, rawScore);          // 0 = ปลอดภัย, 100 = เสี่ยงสุด

    let level = "ต่ำ (Low)";
    if (riskScore >= 50) level = "สูง (High)";
    else if (riskScore >= 25) level = "ปานกลาง (Medium)";

    return { triggered, riskScore, level };
  }

  /* ---- 5) Recommendation : สรุปคำแนะนำ + เงื่อนไข ---------------------- *
   * รวมผล ratio (กี่ตัวผ่าน) + risk → ตัดสิน decision
   * Design Principle #4 : AI = draft, RM = approve (นี่คือ "draft")
   * ------------------------------------------------------------------- */
  function generateRecommendation(ratioReport, risk) {
    const fails = ratioReport.filter((x) => x.grade === "fail");
    const warns = ratioReport.filter((x) => x.grade === "warn");

    let decision, color, summary;
    const hasHighRisk = risk.triggered.some(
      (p) => p.severity === "high" && p.id !== "ASF_DISEASE"
    );

    if (fails.length === 0 && warns.length <= 1 && risk.riskScore < 50) {
      decision = "อนุมัติ (Approve)";
      color = "approve";
      summary = "เคสผ่านเกณฑ์ทางการเงินครบถ้วน ความเสี่ยงอยู่ในระดับที่บริหารจัดการได้";
    } else if (fails.length === 0 && !hasHighRisk) {
      decision = "อนุมัติแบบมีเงื่อนไข (Approve with Conditions)";
      color = "conditional";
      summary = "เคสมีศักยภาพชำระหนี้ แต่มีจุดที่ต้องควบคุมด้วยเงื่อนไขก่อนเบิกจ่าย";
    } else {
      decision = "ทบทวน / ปรับโครงสร้าง (Reconsider)";
      color = "reject";
      summary = "มีตัวชี้วัดสำคัญไม่ผ่านเกณฑ์ ควรปรับโครงสร้างวงเงินหรือหลักประกันก่อน";
    }

    // รวมเงื่อนไข : มาจาก mitigation ของ risk ที่ trigger + ratio ที่ warn/fail
    const conditions = [];
    risk.triggered.forEach((p) => conditions.push(p.mitigation));
    [...fails, ...warns].forEach((x) =>
      conditions.push(`เฝ้าระวัง ${x.key} (ปัจจุบัน ${x.value}${x.unit}, เป้า ${x.target})`)
    );

    return {
      decision, color, summary,
      conditions: [...new Set(conditions)],   // dedupe
      passCount: ratioReport.length - fails.length - warns.length,
      totalCount: ratioReport.length,
    };
  }

  /* ---- 6) MAIN : วิ่งทั้ง pipeline ในครั้งเดียว ----------------------- *
   * Input → [Financials → Risk → Recommendation] → Analysis object
   * ------------------------------------------------------------------- */
  function run(c) {
    const ratios = calculateFinancials(c);
    const ratioReport = buildRatioReport(ratios);
    const risk = assessRisk(c, ratios);
    const recommendation = generateRecommendation(ratioReport, risk);

    return {
      case: c,
      ratios,
      ratioReport,
      risk,
      recommendation,
      generatedAt: new Date().toISOString(),
      frameworkVersion: KNOWLEDGE.governance.frameworkVersion,
    };
  }

  return { run, annualDebtService, fmt };
})();

window.ENGINE = ENGINE;
