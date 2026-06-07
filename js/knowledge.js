/* =============================================================================
 * KNOWLEDGE LAYER v2 — "The Brain"
 * -----------------------------------------------------------------------------
 * ชั้นความรู้กลาง : Policy (versioned) · DoA · Industry Profiles · Risk · Challenge
 * Design: Control the Brain — logic/นโยบายอยู่ที่นี่ที่เดียว, UI แค่ apply
 * =========================================================================== */

const KNOWLEDGE = {

  /* ---- CREDIT POLICY (versioned รายปี — snapshot immutable) ------------- */
  policy: {
    version: "v2026",
    approvedBy: "Credit Policy Committee",
    effectiveDate: "2026-01-01",
    thresholds: {
      dscr:        { min: 1.25, strong: 1.50 },
      ltv:         { max: 80,   safe: 70 },
      de:          { max: 2.0,  safe: 1.5 },
      netMargin:   { min: 5,    safe: 12 },
    },
    // พารามิเตอร์ stress สำหรับ Conservative Case (มาจากนโยบาย ไม่ใช่ RM กำหนด)
    stress: { priceDrop: 0.15, feedAdd: 0, rateAddBps: 100 },
  },

  /* ---- DoA MATRIX (อำนาจอนุมัติ + routing + ความลึก template) ---------- *
   * ตอบ "เคสนี้เข้าท่อไหน + ใครทำเอกสาร + เอกสารลึกแค่ไหน"
   * (เลขเพดานเป็นตัวอย่าง — องค์กรเติมจริงภายหลัง)
   * --------------------------------------------------------------------- */
  doa: {
    version: "v2026",
    tiers: [
      { max: 3_000_000,   tier: "ระดับสาขา",            preparedBy: "เจ้าหน้าที่สาขา",
        chain: ["ผจก.สาขา"], depth: "ย่อ" },
      { max: 10_000_000,  tier: "ระดับเขต/ภาค",          preparedBy: "เจ้าหน้าที่สาขา",
        chain: ["ผจก.สาขา", "ฝ่ายกิจการสาขาภาค"], depth: "กลาง" },
      { max: 50_000_000,  tier: "ระดับธนาคาร (ฝสข.)",     preparedBy: "RM (ศูนย์ธุรกิจสินเชื่อ)",
        chain: ["RM", "หน่วยกลั่นกรอง", "คณะกรรมการระดับ ฝสข."], depth: "เต็ม" },
      { max: 200_000_000, tier: "อนุกรรมการกลั่นกรอง",   preparedBy: "RM (ศูนย์ธุรกิจสินเชื่อ)",
        chain: ["RM", "หน่วยกลั่นกรอง", "คณะอนุกรรมการกลั่นกรอง"], depth: "เต็ม" },
      { max: Infinity,    tier: "คณะกรรมการ ธ.ก.ส.",      preparedBy: "RM (ศูนย์ธุรกิจสินเชื่อ)",
        chain: ["RM", "หน่วยกลั่นกรอง", "คณะอนุกรรมการกลั่นกรอง", "คณะกรรมการ ธ.ก.ส."], depth: "เต็ม" },
    ],
  },

  /* ---- COLLATERAL haircut (LTV สูงสุดตามประเภท) ------------------------ */
  collateral: {
    land_building: { label: "ที่ดินพร้อมสิ่งปลูกสร้าง", maxLTV: 80 },
    land:          { label: "ที่ดินเปล่า",              maxLTV: 60 },
    machine:       { label: "เครื่องจักร/อุปกรณ์",       maxLTV: 50 },
    livestock:     { label: "ปศุสัตว์/ผลผลิต",           maxLTV: 40 },
    deposit:       { label: "เงินฝาก/พันธบัตร",          maxLTV: 95 },
  },

  /* ---- INDUSTRY PROFILES — หัวใจ multi-industry ------------------------ *
   * แต่ละสาขามี: drivers, benchmark, สูตร revenue/cost, กฎ haircut,
   * risk patterns, challenge patterns (สำหรับ Risk Disclosure)
   * --------------------------------------------------------------------- */
  industries: {

    swine_farm: {
      label: "ฟาร์มสุกรขุน (Swine Fattening)",
      sector: "เกษตรกรรม",
      drivers: [
        { key: "heads",    label: "จำนวนสุกรขุน",     unit: "ตัว/ปี",  sample: 5800 },
        { key: "weight",   label: "น้ำหนักขายเฉลี่ย", unit: "กก./ตัว", sample: 112 },
        { key: "price",    label: "ราคาขาย",          unit: "บ./กก.",  sample: 78 },
        { key: "feedPct",  label: "ต้นทุนอาหารสัตว์", unit: "% รายได้", sample: 62 },
        { key: "otherOpex",label: "ค่าใช้จ่ายอื่น/ปี", unit: "บาท",    sample: 7000000 },
      ],
      benchmark: { price: 72, utilization: 0.95, feedPct: 65, netMargin: 12,
                   priceSource: "ค่าเฉลี่ย 3 ปี (สศก./สมาคมผู้เลี้ยงสุกรฯ) + ราคาประกันรายได้" },
      revenue: (d) => d.heads * d.weight * d.price,
      cost:    (d, rev) => (d.feedPct / 100) * rev + d.otherOpex,
      risks: [
        { id: "ASF", sev: "high",   label: "โรคระบาดในสุกร (ASF/PRRS)",
          mit: "เงื่อนไขทำประกันปศุสัตว์ + มาตรฐาน biosecurity GFM + ตรวจสุขภาพฝูงราย Q" },
        { id: "FEED", sev: "medium", label: "ความผันผวนราคาวัตถุดิบอาหารสัตว์",
          mit: "ทำสัญญาซื้อล่วงหน้า / สำรองวัตถุดิบ 2–3 เดือน" },
        { id: "CYCLE", sev: "medium", label: "วัฏจักรราคาสุกรมีชีวิตผันผวนสูง",
          mit: "ทำสัญญารับซื้อ (contract farming) / สมัครประกันรายได้" },
      ],
      challenges: [
        { when: (s) => true, issue: "พึ่งรายได้สุกรอย่างเดียว (concentration)",
          why: "รายได้กระจุกสินค้าเดียว เสี่ยงเมื่อราคา/โรคกระทบ",
          ans: "เสนอแผนกระจาย: รับจ้างเลี้ยง / ขายมูล–ก๊าซชีวภาพ" },
      ],
    },

    rice_farm: {
      label: "นาข้าว (Rice Farming)",
      sector: "เกษตรกรรม",
      drivers: [
        { key: "rai",        label: "พื้นที่เพาะปลูก",   unit: "ไร่",     sample: 350 },
        { key: "yield",      label: "ผลผลิตต่อไร่",      unit: "กก./ไร่", sample: 720 },
        { key: "price",      label: "ราคาข้าวเปลือก",    unit: "บ./กก.",  sample: 11.5 },
        { key: "inputPerRai",label: "ต้นทุนปัจจัย/ไร่",  unit: "บ./ไร่",  sample: 4200 },
        { key: "otherOpex",  label: "ค่าใช้จ่ายอื่น/ปี", unit: "บาท",    sample: 250000 },
      ],
      benchmark: { price: 10.5, yieldCap: 680, feedPct: null, netMargin: 18,
                   priceSource: "ราคาประกันรายได้ + ค่าเฉลี่ยตลาดกลางข้าวเปลือก 3 ปี" },
      revenue: (d) => d.rai * d.yield * d.price,
      cost:    (d) => d.inputPerRai * d.rai + d.otherOpex,
      risks: [
        { id: "DROUGHT", sev: "high",   label: "ภัยแล้ง/น้ำท่วม กระทบผลผลิต",
          mit: "เงื่อนไขทำประกันภัยพืชผล + ตรวจแหล่งน้ำ/ระบบชลประทาน" },
        { id: "PRICE",   sev: "medium", label: "ราคาข้าวเปลือกผันผวนตามตลาดโลก",
          mit: "เข้าโครงการประกันรายได้ / ชะลอขายช่วงราคาต่ำ" },
      ],
      challenges: [
        { when: (s) => true, issue: "ผลผลิตขึ้นกับสภาพอากาศทั้งหมด",
          why: "committee จะถามแผนรับมือภัยธรรมชาติ",
          ans: "ทำประกันภัยพืชผล + ระบุแหล่งน้ำสำรอง + กระจายรอบปลูก" },
      ],
    },

    broiler_farm: {
      label: "ฟาร์มไก่เนื้อ (Broiler)",
      sector: "เกษตรกรรม",
      drivers: [
        { key: "birds",    label: "จำนวนไก่",         unit: "ตัว/ปี",  sample: 240000 },
        { key: "weight",   label: "น้ำหนักขายเฉลี่ย", unit: "กก./ตัว", sample: 2.4 },
        { key: "price",    label: "ราคาขาย",          unit: "บ./กก.",  sample: 42 },
        { key: "feedPct",  label: "ต้นทุนอาหารสัตว์", unit: "% รายได้", sample: 60 },
        { key: "otherOpex",label: "ค่าใช้จ่ายอื่น/ปี", unit: "บาท",    sample: 1800000 },
      ],
      benchmark: { price: 40, utilization: 0.95, feedPct: 63, netMargin: 10,
                   priceSource: "ค่าเฉลี่ยราคาไก่เนื้อหน้าฟาร์ม 3 ปี (สมาคมผู้เลี้ยงไก่)" },
      revenue: (d) => d.birds * d.weight * d.price,
      cost:    (d, rev) => (d.feedPct / 100) * rev + d.otherOpex,
      risks: [
        { id: "AI", sev: "high",   label: "ไข้หวัดนก (Avian Influenza)",
          mit: "biosecurity เข้ม + ประกันปศุสัตว์ + contract กับผู้ประกอบการรายใหญ่" },
        { id: "FEED", sev: "medium", label: "ราคาวัตถุดิบอาหารสัตว์ผันผวน",
          mit: "contract farming ตรึงราคา / forward วัตถุดิบ" },
      ],
      challenges: [
        { when: (s) => true, issue: "ระยะเลี้ยงสั้น รอบหมุนเร็ว แต่ไวต่อราคา",
          why: "committee จะถามความมั่นคงของผู้รับซื้อ",
          ans: "แนบสัญญา contract farming กับบริษัทผู้รับซื้อรายใหญ่" },
      ],
    },
  },
};

window.KNOWLEDGE = KNOWLEDGE;
