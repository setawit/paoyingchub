# 02 — Module Mapping (34 Modules)

แบ่ง 4 กลุ่ม: **RM** (งานหลัก RM) · **WS** (Warning System) · **CH** (Credit Helper) · **EX** (Executive)

สถานะ prototype: ✅ มีไฟล์ต้นแบบแล้ว · 🟡 มีบางส่วน/preview · ⬜ ยังไม่มี

## กลุ่ม RM — งานหลักของ RM

| ID | โมดูล | Phase | Component | Prototype |
|---|---|---|---|---|
| RM-01 | แผนปฏิบัติงาน (Work Plan) | P2 | RM Core | ✅ `rmworkplan.xlsx` + `RM_BiWeekly_ActionPlan_Template.xlsx` |
| RM-02 | ถังเก็บข้อมูลลูกค้า (Customer Pool) | P2 | RM Core + Integration | ✅ `RM02_Customer_Pool_Prototype.xlsx` (Customer Master 22 คอลัมน์, Dashboard, Watch List, Visit Tracker, Alert Center) |
| RM-03 | Call Report — จ่ายสินเชื่อ | P1–P2 | AI Engine + RM Core | ✅ `RM03_Call_Report_Prototype.xlsx` (form 301.02.05, 4 scenarios A1/A2/B1/B2) |
| RM-03b | Call Report — ติดตามหนี้ | P1–P2 | AI Engine + RM Core | 🟡 ใช้โครงเดียวกับ RM-03 — ยังไม่มี scenario ติดตามหนี้แยก |
| RM-04 | ตรวจเยี่ยม + WCR Calculator | P2 | AI Engine + RM Core | ⬜ ยังไม่มี (ไฟล์ชื่อ `RM04_Lead_Tracker.xlsx` เป็นคนละโมดูล — ดู [[07-Gap-Analysis]]) |
| RM-05 | Business Information Report (BIR) | P1–P2 | AI Engine | ✅ `RM05_BIR_Prototype.xlsx` (Macro × Micro × Collision) |
| RM-06 | สรุปเบี้ยเลี้ยง / รถ / น้ำมัน | P4a | Integration (SAP) | ✅ `rm06worklogv2.xlsx` (interim ก่อน SAP integration) |
| RM-07* | Lead Tracker (เสนอเพิ่ม) | P1–P2 | RM Core | ✅ `RM04_Lead_Tracker.xlsx` — lifecycle 7 ขั้น, bridge key = เลขบัตร 13 หลัก |
| RM-08* | Pipeline Tracker (เสนอเพิ่ม) | P1–P2 | RM Core | ✅ `rmpipelinetrackerv2.xlsx` — 5 phase ย่อจากสถานะเดิม 19 ขั้น |
| RM-09* | Maintenance Tracker (เสนอเพิ่ม) | P1 → P3 | RM Core → Warning Brain | ✅ `rmmaintenancetracker.xlsx` — manual ก่อน Warning Brain |

\* ID ที่เสนอเพิ่มจาก gap analysis — ยังไม่อยู่ใน SRD v3.0 (รอ confirm ใน SRD v3.1)

## กลุ่ม WS — Warning System (P3 ทั้งหมด, Component = Warning Brain)

| ID | Warning | หมายเหตุ | Prototype |
|---|---|---|---|
| WS-01 | วงเงิน + OD ครบกำหนด | | 🟡 `rmmaintenancetracker.xlsx` (manual) |
| WS-02 | P/N ครบกำหนด | | 🟡 `rmmaintenancetracker.xlsx` (manual) |
| WS-03 | บสย. หมดอายุ | | 🟡 Alert Center ใน RM-02 |
| WS-04 | ประกันวินาศภัยหมดอายุ | | 🟡 Alert Center ใน RM-02 |
| WS-05 | Loan Covenant Breach | + AI | ⬜ |
| WS-06 | ตรวจเยี่ยมประจำปี | | 🟡 Visit Tracker ใน RM-02 |
| WS-07 | ดอกเบี้ยค้าง 15 เดือน | | ⬜ |
| WS-08 | หนี้ถึงกำหนด Next Due | | 🟡 `rmmaintenancetracker.xlsx` (manual) |
| WS-09 | อนุมัติแล้วรอทำสัญญา | | ⬜ |
| WS-10 | Watch List / Follow List | + AI | 🟡 Watch List ใน RM-02 |
| WS-11 | Email/Teams Notification | | ⬜ |
| WS-12 | SMS แจ้งเตือนลูกค้า | defer P3–P4 | ⬜ |
| WS-13 | ยอดเงินไม่พอหักชำระ | | ⬜ |

## กลุ่ม CH — Credit Helper

| ID | โมดูล | Phase | Component | Prototype |
|---|---|---|---|---|
| CH-01 | ปักหมุด GPS + รูปถ่าย | P2 | RM Core (mobile) | ⬜ |
| CH-02 | ดึงงบการเงิน DBD | P4a | Integration (DBD) | ⬜ |
| CH-03 | ติดตามหนี้ Loan Collection | P1–P2 | AI Engine + RM Core | ⬜ (skill `debt-workout-skill` รองรับ) |
| CH-04 | Credit Rating Engine | P2 | AI Engine | ⬜ (มี Rating field ใน RM-02 แต่ยังไม่มี engine) |
| CH-05 | Credit Memo / UWS Generator | P1–P2 | AI Engine | ⬜ (skill `credit-master` รองรับ) |

## กลุ่ม EX — Executive (P4b, Component = Executive Dashboard)

| ID | โมดูล | หมายเหตุ | Prototype |
|---|---|---|---|
| EX-01 | Executive Dashboard Overview | | ✅ `ex01dashboard.xlsx` (เขต → ศูนย์ → RM → ลูกค้า ~1,070 รายการ) |
| EX-02 | Aging Report + SLA Tracking | | ⬜ |
| EX-03 | KPI Tracking + Forecast | + AI | ⬜ |
| EX-04 | Ranking RM / BC / เขต | | 🟡 มุม RM / มุมศูนย์-เขต ใน `ex01dashboard.xlsx` |
| EX-05 | Yield Analysis | + AI | ⬜ |
| EX-06 | Customer Product Holding | P4a–P4b | ⬜ |
| EX-07 | Credit Utilization Drill-down | | 🟡 Util% มีใน RM-02 ระดับ RM เดียว |
| EX-08 | Tracking งาน ราย RM | | 🟡 วิเคราะห์ผลงาน ใน `rmworkplan.xlsx` |

## Module Count by Phase

- **Phase 1–2 (AI + RM Core):** 9 modules — document productivity
- **Phase 3 (Warning Brain):** 13 modules — proactive risk management
- **Phase 4a (Integration):** 3–5 modules — workflow automation
- **Phase 4b (Executive Dashboard):** 8 modules — executive visibility
