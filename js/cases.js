/* =============================================================================
 * SAMPLE CASES v2 — เคสตัวอย่าง 3 อุตสาหกรรม (โชว์ multi-industry + DoA tier)
 * =========================================================================== */

const SAMPLE_CASES = {

  // วงเงินใหญ่ → ระดับธนาคาร → แตกครบ 3 scenarios
  swine_25m: {
    refNo: "BAAC-2026-0148", borrowerName: "นายสมชาย เกษตรมั่นคง",
    industry: "swine_farm", customerType: "เกษตรกร",
    purpose: "ขยายโรงเรือนสุกรขุนระบบปิด (EVAP)",
    loanAmount: 25000000, termMonths: 84, interestRate: 6.5,
    collateralValue: 35000000, collateralDesc: "ที่ดินพร้อมโรงเรือน 28 ไร่",
    existingDebtService: 1000000, ncbScore: 720, bankCapital: 220000000000,
    flagBankrupt: false, flagAML: false,
    drivers: { heads: 5800, weight: 112, price: 78, feedPct: 62, otherOpex: 7000000 },
  },

  // วงเงินกลาง → ระดับเขต → ย่อ (1 scenario)
  rice_2_5m: {
    refNo: "BAAC-2026-0211", borrowerName: "นางสาวมาลี ทุ่งทอง",
    industry: "rice_farm", customerType: "เกษตรกร",
    purpose: "เงินทุนหมุนเวียนเพาะปลูกข้าวนาปี + ซื้อรถไถ",
    loanAmount: 2500000, termMonths: 60, interestRate: 6.5,
    collateralValue: 4000000, collateralDesc: "ที่ดินนา 35 ไร่",
    existingDebtService: 120000, ncbScore: 690, bankCapital: 220000000000,
    flagBankrupt: false, flagAML: false,
    drivers: { rai: 350, yield: 720, price: 11.5, inputPerRai: 4200, otherOpex: 250000 },
  },

  // วงเงินกลาง-สูง → ระดับเขต/ธนาคาร
  broiler_8m: {
    refNo: "BAAC-2026-0305", borrowerName: "นายวิชัย ไก่ทองฟาร์ม",
    industry: "broiler_farm", customerType: "เกษตรกร",
    purpose: "สร้างโรงเรือนไก่เนื้อระบบปิดเพิ่ม 2 หลัง",
    loanAmount: 8000000, termMonths: 72, interestRate: 6.5,
    collateralValue: 12000000, collateralDesc: "ที่ดินพร้อมโรงเรือน 15 ไร่",
    existingDebtService: 300000, ncbScore: 705, bankCapital: 220000000000,
    flagBankrupt: false, flagAML: false,
    drivers: { birds: 240000, weight: 2.4, price: 42, feedPct: 60, otherOpex: 1800000 },
  },
};

window.SAMPLE_CASES = SAMPLE_CASES;
