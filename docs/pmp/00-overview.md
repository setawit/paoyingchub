# PMP — Performance Management Platform

> เอกสารออกแบบระบบสำหรับส่งต่อให้ทีมพัฒนา (GitHub Copilot) เขียนโค้ดต่อ
> อ้างอิง UX Mockup: [`mockup/pmp-mockup.html`](mockup/pmp-mockup.html) (เปิดในเบราว์เซอร์ได้เลย)

## 1. ภาพรวมระบบ

PMP คือแพลตฟอร์มบริหารผลงานสำหรับทีม RM (Relationship Manager) ของธนาคาร
ครอบคลุมตั้งแต่การตั้งเป้า KPI, การกระจาย Lead, ข้อมูลลูกค้า 360°,
Workflow อนุมัติสินเชื่อพร้อม SLA, การจัดการงานประจำวัน, การขออนุมัติเบิกจ่าย,
รายงาน/Monitoring และ AI Insights

## 2. ผู้ใช้งาน (Personas & Roles)

| Role | สิทธิ์หลัก |
|---|---|
| **Admin** | จัดการผู้ใช้, ตั้งค่าระบบ, ดู Audit Log |
| **ผู้บริหาร (Executive)** | ดู Dashboard ภาพรวมทุกภูมิภาค, กำหนดนโยบาย/KPI, ดูรายงานทั้งหมด |
| **ผจก.ศูนย์ธุรกิจ (Center Manager)** | มอบหมาย Lead ให้ RM, อนุมัติคำขอเบิกจ่าย, ดู Dashboard ระดับศูนย์ |
| **RM (Relationship Manager)** | รับ Lead, จัดการลูกค้า, ทำ Call Report, ส่งคำขอสินเชื่อ/เบิกจ่าย, ดู KPI ตนเอง |

## 3. โมดูลทั้งหมด (9 โมดูล + Dashboard)

| # | โมดูล | สรุปความสามารถ |
|---|---|---|
| 0 | **Dashboard** | การ์ดสรุป (สินเชื่อคงค้าง, Lead ใหม่, งานเกิน SLA, Call Report), กราฟ Pipeline รายภูมิภาค, KPI Progress, To-do, Recent Leads, SLA Alerts |
| 1 | **KPI & Policy** | ตั้งเป้า KPI 4 Scenario (Best/Base/Conservative/Worst), บันทึกผลจริง, คำนวณคะแนน, เปรียบเทียบ Actual vs Forecast |
| 2 | **Lead & Assignment** | Kanban Board 4 คอลัมน์ (รอรับงาน / กำลังดำเนินการ / รอเอกสาร / เสร็จสิ้น), ลากย้ายสถานะ, มอบหมาย RM |
| 3 | **Customer 360°** | โปรไฟล์ลูกค้า, แท็บ: Profile / สินเชื่อ / หลักประกัน / ความเสี่ยง / Short Note, Risk Grade, ปักหมุด Location |
| 4 | **Credit Workflow** | Stepper 6 ขั้นตอน (รับ Lead → ตรวจเอกสาร → วิเคราะห์ → ประเมินหลักประกัน → เสนออนุมัติ → อนุมัติ&สัญญา) พร้อม SLA Tracking ต่อขั้น |
| 5 | **Task & To-do** | รายการงาน, ประเภทงาน, กำหนดส่ง, สถานะ (เกินกำหนด/วันนี้/กำลังทำ/รอ), การ์ดสรุปจำนวนงาน |
| 6 | **Request & Approval** | ฟอร์มขอเบิกจ่าย (ค่าเดินทาง/ที่พัก/เลี้ยงรับรอง/รถยนต์), แนบไฟล์, สายอนุมัติตามวงเงิน, ติดตามสถานะ |
| 7 | **Reporting & Monitoring** | Portfolio Summary, NPL/SML Monitoring, RM Leaderboard, Export Excel/PDF |
| 8 | **RM Intelligence** | Risk Alert, Product Recommendation, Cross-sell Opportunity, Customer Risk Segmentation (เขียว/เหลือง/ส้ม/แดง), แจ้งเตือนสำคัญ |
| 9 | **Integration & Security** | สถานะเชื่อมต่อระบบภายนอก (Core Banking, NCB, ธปท., บสย. ฯลฯ), SSO/2FA, RBAC, Audit Trail, Data Masking (PDPA) |

## 4. ขอบเขตการพัฒนา (Phasing)

- **Phase 1 (MVP):** Auth/RBAC, Dashboard, Lead Kanban, Customer 360, Task & To-do
- **Phase 2:** Credit Workflow + SLA, KPI & Policy, Request & Approval
- **Phase 3:** Reporting/Export, RM Intelligence, External Integration (เริ่มจาก Mock Adapter)

## 5. เอกสารชุดนี้

| ไฟล์ | เนื้อหา |
|---|---|
| `01-architecture.md` | สถาปัตยกรรม, Tech Stack, โครงสร้างโปรเจกต์ |
| `02-data-model.md` | ER Model และตารางฐานข้อมูลทั้งหมด |
| `03-api-spec.md` | REST API ต่อโมดูล |
| `04-task-backlog.md` | **Task Backlog สำหรับ Copilot** — แตกงานเป็น Epic/Task พร้อม Acceptance Criteria |

## 6. หลักการ Non-functional

- ภาษา UI: ไทย (ฟอนต์ Prompt), รองรับ Dark Mode, Responsive (Desktop เป็นหลัก, มือถือซ่อน Sidebar)
- ธีมสี: เขียวเข้ม `#1B5E20` / เขียว `#2E7D32` / ทอง `#DAA520` (ดูตัวแปร CSS ใน mockup)
- ความปลอดภัย: JWT + Refresh Token (เตรียมต่อ SSO ภายหลัง), RBAC, Audit Log ทุก mutation, Mask ข้อมูลส่วนบุคคลตาม PDPA
- เป้าหมายประสิทธิภาพ: หน้า Dashboard โหลด < 2s ที่ข้อมูล 10,000 ลูกค้า
