# 00 — Map of Content (MOC)

RM-OS = **Relationship Manager Operating System** ของ ธ.ก.ส. — AI-augmented workflow platform ที่ค่อยๆ build แบบ phase-gate 5 ระยะ (P0–P4b) ครอบคลุม 34 modules ใน 4 กลุ่มงาน RM

**Core principle:** "ค่อยเติม AI เข้าไปใน workflow ทีละ phase — ไม่สร้างทั้งระบบในครั้งเดียว"

## โครงสร้าง Vault

| โน้ต | เนื้อหา |
|---|---|
| [[01-Core-System]] | สถาปัตยกรรม 5 layer, component responsibility, data flow |
| [[02-Modules]] | ตาราง 34 modules (RM / WS / CH / EX) + สถานะ prototype |
| [[03-Skills]] | Skill library 8 ตัว + credit-orchestrator + skill lifecycle |
| [[04-Workflows]] | Workflow หลักของ RM ที่ร้อย prototype ทุกตัวเข้าด้วยกัน |
| [[05-Data-Security]] | Data masking, PDPA/ธปท. compliance, audit trail |
| [[06-Roadmap]] | 5-phase roadmap, phase-gate criteria, budget, risk register |
| [[07-Gap-Analysis]] | วิเคราะห์ช่องว่าง: สิ่งที่มีแล้ว vs สิ่งที่ขาด + ข้อเสนอแก้ไข |

## เอกสารและไฟล์ต้นทาง

| ไฟล์ | บทบาท | โมดูล |
|---|---|---|
| `RMOSSRDv3.docx` | System Requirement Document v3.0 — เอกสารแม่ | ทั้งหมด |
| `RM02_Customer_Pool_Prototype.xlsx` | ถังข้อมูลลูกค้า + Watch List + Alert Center | RM-02 |
| `RM03_Call_Report_Prototype.xlsx` | Call Report 301.02.05 (4 scenarios) + AI Input Helper | RM-03, RM-03b |
| `RM04_Lead_Tracker.xlsx` | Lead lifecycle 7 ขั้น + Activity Log + Source Analysis | ดู [[07-Gap-Analysis]] (ID ชนกับ RM-04 WCR) |
| `RM05_BIR_Prototype.xlsx` | Business Information Report — Macro × Micro × Collision | RM-05 |
| `rm06worklogv2.xlsx` | บันทึกรายวัน → เบี้ยเลี้ยง/รถ/น้ำมัน + ความคุ้มค่า | RM-06 |
| `rmworkplan.xlsx` | แผนปฏิบัติงาน + ปฏิทิน + วิเคราะห์ผลงาน | RM-01 |
| `RM_BiWeekly_ActionPlan_Template.xlsx` | แผนรายปักษ์ + เงื่อนไขเบิกเบี้ยเลี้ยง (พบ ≥ 4 ราย/วัน) | RM-01 (เสริม) |
| `rmpipelinetrackerv2.xlsx` | Pipeline สินเชื่อ 5 phase (ย่อจาก 19 ขั้นเดิม) | ยังไม่มี ID — เสนอ RM-07 |
| `rmmaintenancetracker.xlsx` | งาน maintenance สัญญา (roll P/N, ต่อ OD, ประกัน, บสย.) | Preview ของ WS-01/02/03/04/08 |
| `ex01dashboard.xlsx` | Executive Dashboard (เขต/ศูนย์/RM, ~1,070 records) | EX-01 |
| `skills/credit-orchestrator/SKILL.md` | Master skill ควบคุมกระบวนการวิเคราะห์สินเชื่อ | [[03-Skills]] |

## ผู้ใช้งานหลัก

RM · BC Manager · เขตธุรกิจ · ภาค · สำนักงานใหญ่

## Quick Facts

- **ปัญหา:** RM ใช้เวลา 40–50% กับงานเอกสาร (Call Report 2–3 ชม./ฉบับ, Statement 1–2 ชม./ราย, Memo ปรับโครงสร้างหนี้ 3–4 ชม./ฉบับ)
- **เป้าหมาย:** ลดเวลา Call Report 80–90%, Statement 90%, เพิ่มเวลาเยี่ยมลูกค้า 30–40%
- **Timeline:** ~18–24 เดือน | **Investment:** phase-gated มี kill criteria ทุก phase
