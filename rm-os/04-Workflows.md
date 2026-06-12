# 04 — Workflows

Workflow หลักที่ร้อย module/prototype ทุกตัวเข้าด้วยกัน — ทั้งหมดใช้ได้ตั้งแต่ Phase 1 (manual + Excel) และยกระดับเป็นอัตโนมัติใน Phase 2+

## WF-1: Lead → Loan (วงจรหาลูกค้าใหม่)

```
Lead เข้าไปป์ (RM-07 Lead Tracker)
  │  New → Contacted → Qualified
  ▼
Call Report Scenario B (RM-03, key = เลขบัตร 13 หลัก)
  │  In Approval → Approved / Rejected
  ▼
Approved → ออก CIF → เพิ่มเข้า Customer Pool (RM-02)
Rejected → เก็บประวัติ + เหตุผลใน Prospect Pool
```

- Pipeline Tracker (RM-08) มอง flow เดียวกันในมุม "สถานะงานสินเชื่อ 5 phase" (ย่อจาก 19 ขั้นเดิม)
- Source Analysis ใน Lead Tracker ตอบว่า lead ช่องทางไหน conversion ดีสุด
- **Bridge key:** เลขบัตร ปชช./นิติบุคคล 13 หลัก เชื่อม RM-07 ↔ RM-03 ↔ RM-02

## WF-2: ลูกค้าเดิม — เข้าพบ + Call Report (ใช้ AI)

```
วางแผนสัปดาห์ (RM-01 Work Plan / Bi-Weekly Plan)
  ▼
Site visit → จด bullet notes
  ▼
AI Input Helper (sheet ใน RM-03):
  เลือก scenario A1/A2 → ระบบ auto-fill ข้อมูลจาก RM-02 (mask PII)
  → generate prompt 2 แบบ (Copilot M365 / Claude + skill call-report-writer)
  ▼
RM copy prompt → วาง AI → ได้ draft → paste กลับ Section C
  ▼
RM ตรวจ/แก้ (AI output = draft เท่านั้น) → Approval Flow 3 ระดับ → print 6 หน้า
  ▼
อัปเดต Visit ล่าสุดใน RM-02 → Visit Tracker คำนวณ gap ใหม่
```

## WF-3: Underwriting เชิงลึก (BIR)

```
เลือกลูกค้าจาก RM-02 → AI Helper ใน RM-05
  → skill agri-economic-navigator วิเคราะห์ Macro × Micro × Collision
  ▼
RM กระจายผลลง sheet: Business Profile / Operations / Market / Macro / Micro / Collision
  ▼
Output ไหลต่อ → RM-03 (Section 2–3) · CH-04 Credit Rating · Warning Brain (P3)
```

- ความถี่: BIR = cumulative, update ปีละครั้ง · Call Report = event-based ทุกครั้งที่เข้าพบ

## WF-4: Portfolio Maintenance & Early Warning

```
ทุกวัน:     เช็ค Alert Center (RM-02) — event ภายใน 30 วันคือ priority
ทุกจันทร์:  เช็ค Watch List (RM-02) — Watch/SM/NPL
วางแผนสัปดาห์: Visit Tracker — ใคร gap เกิน, ถึงคิวใคร
  ▼
งานสัญญา → Maintenance Tracker (RM-09): roll P/N, ต่อ คสร./OD,
งวดชำระ, ต่อประกัน, ชำระเบี้ย บสย.
  ▼
กรณีเสี่ยง → skill debt-workout-skill → restructure proposal
  ▼
P3: Warning Brain ทำงานนี้แทนแบบ proactive (WS-01..13) — Excel เป็น preview/fallback
```

## WF-5: บันทึกงานรายวัน → เบี้ยเลี้ยง (RM-06)

```
กรอกบันทึกรายวัน (rm06worklogv2): ออกพบลูกค้า? ชม.นอกสำนักงาน, คะแนน, รถ, กม.
  ▼
สรุปอัตโนมัติ: เบี้ยเลี้ยงรายเดือน (ตามระดับ C + วันเบิกได้)
             · การใช้รถ · วิเคราะห์ความคุ้มค่า (ต้นทุน/ลูกค้า)
  ▼
เงื่อนไขเบิก: Client Visit ≥ 4 ราย/วัน (สูตรใน Bi-Weekly Plan)
  ▼
P4a: ส่ง SAP อัตโนมัติ — เลิกกรอกมือ
```

## WF-6: Executive Visibility (EX-01)

```
RM คีย์/อัปเดตข้อมูลที่แท็บ "ข้อมูลลูกค้า" (ex01dashboard)
  ▼
สรุปอัตโนมัติ 3 มุม: มุม RM (รายตัว) · มุมศูนย์-เขต · One Page ผู้บริหาร
  KPI: ลูกค้า, วงเงิน, ยอดคงค้าง, NPL%, Pipeline, Maintenance ค้าง/เลยกำหนด
  ▼
P4b: แทนที่ด้วย Executive Dashboard จริง (web + mobile, drill-down, forecast)
```

## กติกาที่ใช้ทุก workflow

1. ก่อนส่งข้อมูลเข้า AI — mask PII ตาม checklist ([[05-Data-Security]])
2. AI output ทุกชิ้น = draft — RM ตรวจและรับผิดชอบก่อนใช้
3. บันทึกการใช้ AI ทุกครั้ง (P0–P1: log manual · P2+: Audit Service)
