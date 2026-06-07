# 🏛️ Loan Brain OS — Architecture Blueprint

> **สถานะ:** เอกสารออกแบบ (design blueprint) — ยังไม่ลงมือ implement
> **ปรับปรุงล่าสุด:** 2026-06-07
> **ขอบเขต:** รวมผลการออกแบบจากการหารือทั้งหมด เพื่อใช้เป็นแผนแม่บทในการพัฒนา Phase 2–3
>
> เอกสารนี้ขยายจาก Phase 1 Prototype (`index.html` / `js/*`) ไปสู่ระบบเต็ม
> ที่ผลิต **Credit Approval (คำขออนุมัติสินเชื่อ)** ได้จริง และไหลเข้ากระบวนการอนุมัติขององค์กร

---

## 0. หลักการคุมทิศ (ยึดตลอดทั้งระบบ)

1. **Output > Process** — optimize "การผลิต output" ไม่ใช่ workflow
2. **Control the Brain** — logic/นโยบายอยู่กลางที่เดียว, UI แค่ apply
3. **Speed first, Perfection later** — เร็วขึ้นทันที ไม่ต้องสมบูรณ์ 100%
4. **Human stays in control** — ระบบ = draft, คน = approve เสมอ
5. **Defensible by design** — ทุกตัวเลข/ข้อสรุปมีที่มา (ป้องกัน "นั่งเทียน")

---

## 1. โจทย์จริง — คอขวดอยู่ที่ "การผลิตเอกสาร" ไม่ใช่ "การคิด"

ผลิต Credit Approval 25 หน้า (เคสฟาร์มสุกร 25 ลบ.) ใช้เวลาจริง:

| ผู้ทำ | เวลา | หมายเหตุ |
|---|---|---|
| RM มือใหม่ | **7–10 วันทำการ** (calendar 2–3 สัปดาห์) | "นึกว่าเขียนวิทยานิพนธ์" |
| RM มีประสบการณ์ | 2–4 วันทำการ | |
| **ระบบ (ถ้าข้อมูลพร้อม)** | **ระดับนาที** | ตัดเฟสวิเคราะห์+เรียบเรียง+จัดฟอร์มออก |

งานจริงไม่ใช่การพิมพ์ แต่คือ 4 เฟส: (1) ตามล่าข้อมูลจาก 5–6 แหล่ง →
(2) วิเคราะห์ + ประมาณการ 3 กรณี → (3) คิดถ้อยคำเชิงโน้มน้าว → (4) วนแก้กับผู้สอบทาน

ระบบฆ่า **"ภาษีการผลิต (production tax)"** = เฟส 2+3+4 (~60–70% ของความเจ็บปวด)
เหลือให้คน: เก็บข้อมูลภาคสนาม + วิจารณญาณ + อนุมัติ

---

## 2. เป้าหมาย Output — โครงสร้าง Credit Approval จริง (อ้างฟอร์ม 25 หน้า)

ระบบต้องผลิตเอกสารที่ map ลงฟอร์มจริง 3 ส่วน:

**ส่วน A — คำขออนุมัติสินเชื่อ (หน้าตัดสินใจ)**
- ข้อมูลลูกค้า (CIF, **CRR/ชั้นลูกค้า, NCB Score**, ISIC, ประเภทธุรกิจ)
- วงเงิน + **CEQA (Credit Equivalent Amount) + Total Group Exposure**
- ☑️ **ผู้มีอำนาจอนุมัติ** (ฝสข./ธนาคาร/อนุกรรมการกลั่นกรอง/คณะกรรมการ ธ.ก.ส.)
- ตรวจมาตรฐาน: ล้มละลาย, NCB, **AML/CFT, กฎกระทรวง 80/20, SLL ≤15% เงินกองทุน, Related Company**
- ตารางวงเงิน + **COVENANTS** (Condition Precedent / Financial / Others)
- หลักประกัน + **%LTV** + สัญญาค้ำประกัน + ประกันภัย

**ส่วน B — รายงานข้อมูลพื้นฐาน/แผนธุรกิจ (BIR)**
- ประเภทลูกค้า **4 schema**: นิติบุคคล / เกษตรกร-บุคคล / สหกรณ์-กลุ่มเกษตรกร / วิสาหกิจชุมชน
- ประวัติกิจการ, ผู้ค้ำ, ประวัติติดต่อธนาคาร + ประวัติชำระหนี้
- Marketing 4P + Supplier/ลูกค้าหลัก, คู่แข่ง, การผลิต (กำลังผลิตสูงสุด/เฉลี่ย)
- **งบการเงินย้อนหลัง 3 ปี** (งบดุล + Size/Profitability/Liquidity/Leverage/Debt-Serviceability)
- Use of Fund / Source of Fund
- **ประมาณการ 3 กรณี: Customer / Bank / Conservative** (P&L + Cash Flow + งบดุล + Ratio)

**ส่วน C — รายงานวิเคราะห์สินเชื่อ (Credit Underwriting Report)**
- วิเคราะห์: วัตถุประสงค์ → อุตสาหกรรม → การบริหาร → คู่แข่ง → ตลาด → การผลิต → การเงิน → ความสามารถชำระหนี้
- **SWOT**
- หลักประกัน + LTV
- **ความเสี่ยง→แนวทางลด** 5 ด้าน: Commercial(Industry+Business)/Financial/Collateral/**Legal**/Other(Credit)
- **11.6 ข้อเบี่ยงเบน/Override: CPG / ประกาศ ธปท. / UWS**
- ความเห็นผู้วิเคราะห์ → ผู้เสนอ → ผู้ให้ความเห็น + ลายเซ็น
- แนบ 1: **Single Lending Limit** (ภาระหนี้รวม ÷ เงินกองทุน)

> ทุกหน้ามี footer **"ผู้จัดทำ / ผู้สอบทาน"** = maker-checker (กลั่นกรอง)
> **ความลึกของเอกสารแปรตามระดับวงเงิน** (สาขา = ย่อ, ธนาคาร = เต็ม)

---

## 3. สถาปัตยกรรมรวม (Layered)

```
╔═══════════════════════════════════════════════════════════════════════╗
║  GOVERNANCE / CONTROL LAYER                                            ║
║   • CREDIT POLICY  (versioned รายปี: v2026 · v2027 …)                  ║
║       threshold · exposure limit · pricing · stress params · CPG/UWS  ║
║   • DoA MATRIX     (versioned: อำนาจอนุมัติ × tier × ประเภท × risk)    ║
║   → ทุก output ประทับ policyVersion + doaVersion (audit/trace)         ║
╚═══════════════════════════════════════════╤═══════════════════════════╝
                                            │ ป้อนกฎ/เกณฑ์ลงสมอง
╔═══════════════════════════════════════════▼═══════════════════════════╗
║  KNOWLEDGE LAYER (The Brain)  — 10 โดเมน (ดูข้อ 4)                     ║
║  Industry · Product · Area · Risk · Collateral · Benchmark · Scoring  ║
║  · Regulatory · Scenario-rules · Challenge-patterns                    ║
╚════════════════╤══════════════════════════════════════╤═══════════════╝
        case-level│                            portfolio-level│
╔════════════════▼═══════════════╗      ╔═══════════════════▼═══════════╗
║  CASE ENGINE                   ║      ║  PORTFOLIO ENGINE              ║
║  ┌──────────────────────────┐  ║      ║  • exposure matrix พื้นที่×สาขา ║
║  │ Scenario Engine (3 cases) │  ║      ║  • HHI / concentration index   ║
║  │ Risk Disclosure Engine    │  ║      ║  • correlated risk (เคสลพบุรี) ║
║  │ Compliance Engine         │  ║      ║  • early-warning alert         ║
║  │ Scoring (CRR)             │  ║      ╚═══════════════════╤═══════════╝
║  └──────────────────────────┘  ║                          │
╚════════════════╤═══════════════╝      ╔═══════════════════▼═══════════╗
                 ▼                       ║  Portfolio Dashboard          ║
╔════════════════════════════════╗      ║  • heatmap รายพื้นที่          ║
║  WORKFLOW / ROUTING LAYER      ║      ╚════════════════════════════════╝
║  • DoA routing "เข้าท่อไหน"     ║
║  • state machine:              ║      ╔════════════════════════════════╗
║    ร่าง→กลั่นกรอง→อนุมัติ tier  ║◄────►║  DATA: Portfolio Book          ║
║  • PDF + e-sign + audit trail  ║ feed ║  (เคสอนุมัติสะสม + existing)   ║
╚════════════════╤═══════════════╝      ╚════════════════════════════════╝
                 ▼
        Credit Approval (PDF, ลึกตาม tier) → สายอนุมัติ
```

---

## 4. Knowledge Layer — 10 โดเมน

| # | โดเมน | สาระสำคัญ |
|---|---|---|
| 1 | **Industry Profiles** ⭐ | ต่อสาขา: revenue model, cost driver, margin benchmark, cash cycle/ฤดูกาล, working-capital cycle, capex, KPI เฉพาะ (FCR, yield/ไร่, occupancy) — กลุ่ม: พืชไร่/พืชสวน/ปศุสัตว์/ประมง/แปรรูป/SME/บริการ/สถาบัน |
| 2 | **Industry-Adjusted Thresholds** | DSCR/LTV/D-E/margin ต่างกันตามสาขา (override default) |
| 3 | **Risk Pattern Library** | tag ตามสาขา + 5 หมวด (Production/Market/Cost/Financial/Climate-ESG/Behavioral/Concentration) |
| 4 | **Collateral Knowledge** | haircut ตามประเภท (ที่ดิน 70-80% / เครื่องจักร 40-50% / ปศุสัตว์ 30-50% / เงินฝาก 90-100%) + วิธีประเมิน |
| 5 | **Product Catalog** | type (term/WC/OD/leasing/project), **repaymentStructure** (amortizing/seasonal-balloon/bullet), pricing, tenor, eligiblePurposes/Industries |
| 6 | **Regulatory & Policy** | ธปท. (จัดชั้นหนี้/NPL/สำรอง), ธ.ก.ส. (เพดาน/DoA), โครงการรัฐ, KYC/AML, กฎกระทรวง 80/20, SLL |
| 7 | **Stress / Scenario Rules** | ตัวแปรอ่อนไหวต่อสาขา + scenario มาตรฐาน (ราคา−15%, ผลผลิต−20%, ต้นทุน+10%, ดบ.+100bps) + break-even |
| 8 | **Market & Macro** | ราคาสินค้าเกษตรอ้างอิง, MRR/MLR/MOR, โซนภัยพิบัติ |
| 9 | **Credit Scoring Model** | scorecard 5C + rubric → เกรด A/B/C/D → ผูก pricing/DoA + behavioral (NCB) |
| 10 | **Output / Covenant Library** | template Credit Approval แยกตาม type + tier, covenant library, challenge-patterns |

**โดเมนข้ามระบบ (cross-cutting):**
- **Credit Policy** (versioned รายปี) — snapshot immutable; เคสประทับ version
- **Area Profiles** (รายจังหวัด/อำเภอ) — climate risk, disaster history, dominant industries

---

## 5. Engines

### 5.1 Scenario Engine — "เขียนครั้งเดียว → แตก 3 กรณี"
RM ใส่ **base drivers ชุดเดียว** → engine แตกเป็น Customer / Bank / Conservative
ด้วยกฎ transformation ที่ freeze ใน Policy (ไม่ใช่ RM กำหนดเอง)

**⭐ Assumption Ledger + provenance** — ทุกสมมติฐานมี "ที่มา" พิมพ์เป็น footnote
→ กลั่นกรองเถียงไม่ได้ว่ามั่ว (กฎ stress มาจาก policy ไม่ใช่จากใจ RM)

*tier scaling:* สาขา = Bank case อย่างเดียว · ธนาคาร = ครบ 3 + ledger

ตัวอย่าง (ฟาร์มสุกร 25 ลบ.):

| รายการ (ลบ./ปี) | Customer | Bank | Conservative |
|---|:--:|:--:|:--:|
| รายได้ | 50.7 | 43.6 | 36.9 |
| NOI | 12.3 | 8.3 | 5.9 |
| **DSCR** | 2.25 ✅ | 1.51 ✅ | 1.06 ⚠️ |

Assumption: ราคาสุกร 78/72/61 (เฉลี่ย 3 ปี สศก. · Cons −15%), ต้นทุนอาหาร 62/65/65%
(ค่าเฉลี่ยกลุ่ม), ดอกเบี้ย 6.5/6.5/7.5% (สัญญา + stress +100bps จาก Policy v2026)

### 5.2 Risk Disclosure Engine — "เปิดความเสี่ยงให้ก่อน + เตรียมคำตอบ"
ระบบเล่นเป็น **กลั่นกรองจำลอง (adversarial)** อ่านเคสที่ generate → ยิงประเด็นที่จะโดนถาม
+ คำตอบ + covenant ที่อุดประเด็นนั้น → feed ลง section 11 / 11.6 → **ลดรอบวนแก้**

ตัวอย่าง: Conservative DSCR 1.06 < 1.25 → covenant รักษา DSCR≥1.25 + กันเงินสำรอง 1 งวด
+ ยืดเทอม 7→8 ปี / ASF → ประกันปศุสัตว์ + biosecurity GFM

### 5.3 Compliance Engine
auto-check: ล้มละลาย / NCB / AML-CFT / กฎกระทรวง 80-20 / SLL ≤15% / Related Company
→ ติ๊กผลลงฟอร์มส่วน A อัตโนมัติ + flag override (CPG/ธปท./UWS) ผูก policy version

### 5.4 Portfolio Engine
รวม book (เคสอนุมัติ + existing) → exposure matrix พื้นที่×สาขา → HHI →
**correlated-risk alert** เมื่อ (สัดส่วนสาขาสูงสุด > 60%) **และ** (สาขานั้น systemic risk = HIGH)

ตัวอย่างลพบุรี: 82% = ฟาร์มสุกร, ASF severity HIGH (LGE ~40%) →
เหตุการณ์เดียวทำ ~33% ของพอร์ตเสี่ยง NPL → จำกัดวงเงินใหม่กลุ่มสุกร/เร่งกระจาย

---

## 6. Governance & Control (versioned)

### Credit Policy (ปรับทุกปี)
```
policies = {
  "v2026": { effectiveDate, thresholds, exposureLimits, approvalMatrix,
             stressParams, pricingRules, cpgRules, uwsRules },
  "v2027": { ... },
  active: "v2026"
}
```
snapshot immutable → แก้ปีใหม่ไม่กระทบเคสเก่า + re-run เคสเก่าใต้กฎใหม่เพื่อดู impact

### DoA Matrix (อำนาจอนุมัติ + routing)
```
DoA v2026 (ตัวอย่าง — เลขจริงเติมภายหลัง)
┌──────────────────────┬──────────────┬──────────────────────────────┐
│ เงื่อนไข              │ ใครทำเอกสาร   │ สายอนุมัติ                    │
├──────────────────────┼──────────────┼──────────────────────────────┤
│ เกษตรกร ≤ 3 ลบ.      │ สาขา         │ ผจก.สาขา (จบที่สาขา)         │
│ เกษตรกร 3–10 ลบ.    │ สาขา         │ สาขา → ระดับกลาง/เขต         │
│ > 10 ลบ.             │ RM           │ RM → กลั่นกรอง → ฝสข./ธนาคาร │
│ > 50 ลบ.             │ RM           │ … → อนุกรรมการกลั่นกรอง       │
│ > [เพดาน] ลบ.       │ RM           │ … → คณะกรรมการ ธ.ก.ส.        │
└──────────────────────┴──────────────┴──────────────────────────────┘
```
DoA คุมทั้ง **(ก) routing** (ใครทำ/เข้าท่อไหน) และ **(ข) ความลึก template** (tier scaling)

---

## 7. Workflow / Routing Layer (state machine)
```
ร่าง (RM/สาขา) → กลั่นกรอง [verify → validate] → อนุมัติ stage 1..n → อนุมัติ/ตีกลับ/ปฏิเสธ
                    ▲ maker-checker            ▲ แต่ละ stage: เจ้าของ + ลายเซ็น + เวลา
```

## 8. Output Layer
- **PDF พร้อมพิมพ์** ตามฟอร์ม (ลึกตาม tier)
- **e-signature** ไล่ตามสายอนุมัติ + routing slip บอก stage
- **audit trail immutable** (ใคร/เมื่อไหร่/ตัดสินอะไร ใต้ policy+DoA version ใด)

---

## 9. Requirements (รวมจากการหารือทั้งหมด)

1. Industry Profiles + per-industry thresholds
2. Product Catalog (+ repaymentStructure: seasonal-balloon สำหรับเกษตร)
3. Risk patterns แบบ tag อุตสาหกรรม + 5 หมวด
4. Collateral haircut / Scoring model (CRR) / Stress-test
5. **Credit Policy — versioned รายปี**
6. **Area Profiles + Portfolio concentration engine** (เคสลพบุรี)
7. **DoA / Approval Routing engine + workflow state machine**
8. **Output = PDF + ลายเซ็น + audit trail**
9. **Credit Memo upgrade → Credit Approval bank-grade** (section 2,4,7,10,11)
10. **Output = Credit Approval 3 ส่วน (A/B/C)** ตามฟอร์มจริง
11. **Template แปรผันตาม DoA tier** (ธนาคาร = เต็ม, สาขา = ย่อ)
12. **Regulatory Compliance Engine** (ล้มละลาย/NCB/AML/80-20/SLL/Related)
13. **3-Case Projection** (Customer/Bank/Conservative)
14. **Input schema ตามประเภทลูกค้า 4 แบบ**
15. **Override/Deviation tracking** (CPG/ธปท./UWS) ผูก policy version
16. **CEQA / Group Exposure / SLL** → ป้อน portfolio engine
17. **Scenario Engine** — base เดียว → 3 cases, rules ใน policy
18. **Assumption Ledger + provenance** — ทุกสมมติฐานมีที่มา (กันนั่งเทียน) ⭐
19. **Risk Disclosure / pre-emptive defense engine** (mock กลั่นกรอง)
20. **Projection count แปรตาม tier** (ย่อ 1 / เต็ม 3)

---

## 10. Roadmap

- ✅ **Phase 1 — Brain Prototype** (ปัจจุบัน): template+logic engine, demo เคสจริง, single-file artifact
- ⏭ **Phase 2 — Controlled Engine**:
  - รื้อ Knowledge ให้รองรับ Industry Profiles + per-industry thresholds (req 1–4)
  - Credit Policy + DoA เป็น control file versioned (req 5, 7)
  - Scenario Engine + Assumption Ledger + Risk Disclosure (req 17–19)
  - Compliance Engine (req 12)
- ⏭ **Phase 3 — Loan Brain App**:
  - ต่อ data source จริง (core banking/NCB/ประเมิน) + LLM ร่างถ้อยคำเชิงโน้มน้าว
  - Output Credit Approval PDF + e-sign + workflow (req 8–11)
  - Portfolio Engine + dashboard (req 6, 16)

---

## 11. Hooks ที่ควรฝังตั้งแต่ Phase 1 → 2 (กัน rework)

| Hook | เหตุผล |
|---|---|
| เพิ่มฟิลด์ `province` / `district` ใน case input | portfolio concentration ย้อนหลังไม่ได้ถ้าไม่เก็บแต่แรก |
| generalize `governance` → `policy { version }` | เคสจะผูกเวอร์ชันถูกตั้งแต่ต้น |
| stub ว่าง `products` / `areas` / `policies` ใน knowledge.js | กันโครงไว้ ไม่ต้องรื้อใหญ่ |
| แยก `assumptions` ออกจาก `case` input | เตรียมรองรับ Scenario Engine + ledger |

---

## 12. คำถามค้าง (รอข้อมูลจริงจากองค์กร)
- ตัวเลขจริง: เพดาน DoA แต่ละ tier, อัตราดอกเบี้ย/เงื่อนไขผลิตภัณฑ์, stress params ตาม CPG/UWS
- ฟอร์มระดับย่อ (สาขา) ตัด section ไหนบ้าง → ออกแบบ template scaling ให้แม่น
- ระบบต้นทางที่จะ integrate (core banking / NCB / ระบบประเมินหลักประกัน)
