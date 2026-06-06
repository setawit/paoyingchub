/* =============================================================================
 * KNOWLEDGE LAYER — "The Brain"
 * -----------------------------------------------------------------------------
 * ชั้นความรู้กลางของระบบ : framework การคิด, risk pattern, benchmark, threshold
 *
 * Design Principle #2 — Control the Brain
 *   logic ทั้งหมดอยู่ที่นี่ (central) / UI เป็นแค่ผู้ "apply" เท่านั้น
 *   การแก้ logic การให้สินเชื่อ = แก้ที่ไฟล์นี้ไฟล์เดียว (governance จุดเดียว)
 * =========================================================================== */

const KNOWLEDGE = {

  /* ---- Governance metadata : ใช้ track เวอร์ชันของ "สมอง" ---------------- */
  governance: {
    frameworkVersion: "1.0.0",
    approvedBy: "Credit Policy Committee",
    lastReviewed: "2026-06-06",
    // ทุก output ต้องผูกกับเวอร์ชันนี้ เพื่อ trace ได้ว่าใช้ logic ชุดไหน
  },

  /* ---- ผลิตภัณฑ์สินเชื่อ (Loan Products) -------------------------------- */
  products: {
    farm_expansion: {
      code: "FARM-EXP",
      name: "สินเชื่อเพื่อขยายกิจการเกษตร (Agri Business Expansion)",
      interestRate: 6.5,          // % ต่อปี (MRR-based)
      maxTermMonths: 84,          // 7 ปี
      maxLTV: 80,                 // Loan-to-Value สูงสุด %
    },
  },

  /* ---- Credit Framework : 5 C's of Credit ------------------------------ *
   * แต่ละ C มีน้ำหนัก (weight) รวมกัน = 100
   * ระบบ enforce ว่า "ทุกเคสต้องผ่านครบทั้ง 5 C" (Risk Control 6.3)
   * --------------------------------------------------------------------- */
  framework: {
    name: "5 C's of Credit",
    dimensions: [
      { key: "character",  label: "Character (ประวัติ/ความน่าเชื่อถือ)", weight: 20 },
      { key: "capacity",   label: "Capacity (ความสามารถชำระหนี้)",       weight: 30 },
      { key: "capital",    label: "Capital (เงินทุน/ส่วนของเจ้าของ)",     weight: 20 },
      { key: "collateral", label: "Collateral (หลักประกัน)",            weight: 20 },
      { key: "conditions", label: "Conditions (ภาวะตลาด/เงื่อนไข)",       weight: 10 },
    ],
  },

  /* ---- Thresholds : เกณฑ์ตัดสินทางการเงิน ------------------------------ *
   * Engine ใช้ค่าเหล่านี้ตัดสิน pass/fail แบบ deterministic
   * --------------------------------------------------------------------- */
  thresholds: {
    dscr:        { min: 1.25, strong: 1.50 },   // Debt Service Coverage Ratio
    ltv:         { max: 80,   safe: 70 },        // Loan-to-Value (%)
    de:          { max: 2.0,  safe: 1.5 },       // Debt-to-Equity
    currentRatio:{ min: 1.0,  safe: 1.5 },       // สภาพคล่อง
    netMargin:   { min: 5,    safe: 12 },        // Net Profit Margin (%)
  },

  /* ---- Industry Benchmark : ค่ามาตรฐานอุตสาหกรรม ----------------------- *
   * ใช้เปรียบเทียบเคสกับค่ากลางของกลุ่มธุรกิจ (knowledge reuse)
   * --------------------------------------------------------------------- */
  benchmarks: {
    swine_farm: {
      label: "ฟาร์มสุกรขุน (Swine Fattening)",
      feedCostRatio: 65,   // ต้นทุนอาหารสัตว์ต่อรายได้ %
      netMargin: 12,       // Net margin ปกติของอุตสาหกรรม %
      revenuePerHead: 8000,// รายได้ต่อสุกรขุน 1 ตัว (บาท)
      cyclesPerYear: 2.4,
    },
  },

  /* ---- Risk Pattern Library : คลังรูปแบบความเสี่ยง ---------------------- *
   * Hidden Risk (1.2) + Risk Control (6.3) : "risk pattern ถูกตรวจอัตโนมัติ"
   * แต่ละ pattern มีฟังก์ชัน detect(case, ratios) → คืน true ถ้าเข้าข่าย
   * severity : high | medium | low
   * --------------------------------------------------------------------- */
  riskPatterns: [
    {
      id: "ASF_DISEASE",
      category: "ความเสี่ยงด้านการผลิต (Production)",
      label: "ความเสี่ยงโรคระบาดในสุกร (ASF / PRRS)",
      severity: "high",
      // ความเสี่ยงเชิงโครงสร้างของธุรกิจสุกร — flag เสมอสำหรับฟาร์มสุกร
      detect: (c) => c.industry === "swine_farm",
      mitigation: "กำหนดเงื่อนไขทำประกันปศุสัตว์ + มาตรฐาน biosecurity GFM/GAP",
    },
    {
      id: "FEED_PRICE",
      category: "ความเสี่ยงด้านต้นทุน (Cost)",
      label: "ความผันผวนราคาวัตถุดิบอาหารสัตว์ (ข้าวโพด/กากถั่วเหลือง)",
      severity: "medium",
      detect: (c) => c.industry === "swine_farm" && c.feedCostRatio >= 60,
      mitigation: "แนะนำทำสัญญาซื้อล่วงหน้า (forward) / สำรองวัตถุดิบ 2-3 เดือน",
    },
    {
      id: "PRICE_CYCLE",
      category: "ความเสี่ยงด้านตลาด (Market)",
      label: "วัฏจักรราคาสุกรมีชีวิต (Hog Price Cycle) ผันผวนสูง",
      severity: "medium",
      detect: (c) => c.industry === "swine_farm",
      mitigation: "ทำ sensitivity ราคาขาย -15% / กำหนดเงื่อนไขสัญญารับซื้อ (contract farming)",
    },
    {
      id: "CONCENTRATION",
      category: "ความเสี่ยงเชิงโครงสร้าง (Structural)",
      label: "พึ่งพารายได้จากสินค้าเดียว (Single-commodity concentration)",
      severity: "low",
      detect: (c) => true, // เคสฟาร์มเดี่ยวมักกระจุกตัว
      mitigation: "ติดตามแผนกระจายความเสี่ยง / สัดส่วนรายได้",
    },
    {
      id: "LOW_DSCR",
      category: "ความเสี่ยงด้านการชำระหนี้ (Repayment)",
      label: "ความสามารถชำระหนี้ต่ำกว่าเกณฑ์ (DSCR ต่ำ)",
      severity: "high",
      detect: (c, r) => r.dscr < KNOWLEDGE.thresholds.dscr.min,
      mitigation: "ลดวงเงิน / ขยายระยะเวลา / เพิ่มผู้ค้ำประกัน",
    },
    {
      id: "HIGH_LTV",
      category: "ความเสี่ยงด้านหลักประกัน (Collateral)",
      label: "สัดส่วนวงเงินต่อหลักประกันสูง (LTV สูง)",
      severity: "medium",
      detect: (c, r) => r.ltv > KNOWLEDGE.thresholds.ltv.max,
      mitigation: "เพิ่มหลักประกัน / ลดวงเงินให้ LTV ≤ 80%",
    },
    {
      id: "HIGH_LEVERAGE",
      category: "ความเสี่ยงด้านโครงสร้างทุน (Leverage)",
      label: "ภาระหนี้ต่อทุนสูง (D/E สูง)",
      severity: "medium",
      detect: (c, r) => r.de > KNOWLEDGE.thresholds.de.max,
      mitigation: "ขอให้ผู้กู้เพิ่มทุน / ลดวงเงินกู้",
    },
  ],
};

// expose ให้ layer อื่นเรียกใช้ (ใน global scope ของ static site)
window.KNOWLEDGE = KNOWLEDGE;
