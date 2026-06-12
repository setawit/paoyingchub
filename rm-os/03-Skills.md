# 03 — Skill Architecture

**Skill** = bundled prompt + domain knowledge + output template สำหรับ task เฉพาะ — ทำให้ AI ทำงานเหมือน RM มืออาชีพ ไม่ใช่ AI ทั่วไป พัฒนาใน Phase 0 และทยอยขยายตลอด lifecycle

## 1. Skill Library (Phase 0 Deliverables — 8 ตัว)

| Skill | Function | Module Coverage |
|---|---|---|
| `call-report-writer` | ร่าง Call Report จาก bullet notes — รูปแบบ ธ.ก.ส. 301.02.05 | RM-03, RM-03b |
| `statement-analyzer` | วิเคราะห์ Bank Statement — พฤติกรรมเงิน, red flags | Support all |
| `collateral-assessor` | ตรวจหลักประกัน — โฉนด, แบบแปลน, site visit checklist | RM-04, CH-01 |
| `debt-workout-skill` | Watch/SM/NPL — restructure proposal, action plan | CH-03, WS-07 |
| `credit-master` | Controller — orchestrate skill อื่นใน workflow | CH-05 |
| `product-designer-skill` | ออกแบบสินเชื่อ, true cost, proposal | Support all |
| `agri-economic-navigator` | Macro–Micro analysis สำหรับ sector | RM-05 |
| `customer-profiler` | สร้าง customer profile จากข้อมูลดิบ | RM-02 |

> Master skill ระดับบนสุดคือ [[skills/credit-orchestrator/SKILL|credit-orchestrator]] — ควบคุมกระบวนการวิเคราะห์สินเชื่อทั้งสาย โดยเรียก skill ข้างบนเป็นขั้นตอน

## 2. ความสัมพันธ์ระหว่าง Skill

```
credit-orchestrator (master)
├── customer-profiler        → โปรไฟล์ลูกค้า (RM-02)
├── statement-analyzer       → พฤติกรรมการเงิน + red flags
├── agri-economic-navigator  → Macro × Micro × Collision (RM-05 BIR)
├── collateral-assessor      → หลักประกัน + LTV
├── product-designer-skill   → โครงสร้างสินเชื่อที่เหมาะสม
├── credit-master            → Credit Memo / UWS (CH-05)
├── call-report-writer       → Call Report 301.02.05 (RM-03)
└── debt-workout-skill       → กรณี Watch/SM/NPL → restructure
```

## 3. Skill Lifecycle

1. **Development** — RM domain expert + prompt engineer co-design
2. **Testing** — sandbox กับ dummy data ≥ 20 test cases
3. **Validation** — pilot RM review + accuracy assessment
4. **Deployment** — version-controlled, A/B testing capability
5. **Maintenance** — quarterly review, update เมื่อ SOP เปลี่ยน

## 4. การใช้งานตาม Phase

| Phase | รูปแบบการเรียก skill |
|---|---|
| P0–P1 | Manual — RM copy prompt จาก **AI Input Helper** (sheet ใน RM-03/RM-05) วางใน Claude/Copilot โดย mask PII เองตาม checklist |
| P2+ | AI Engine เรียก skill อัตโนมัติผ่าน Anthropic API — masking ฝั่ง server, audit ทุก call |
| P3 | Warning Brain เรียก skill ประกอบ triage (เช่น `debt-workout-skill` แนบ action plan ไปกับ alert) |

## 5. มาตรฐานไฟล์ Skill

ทุก skill เป็นไฟล์ `SKILL.md` ใน `skills/<skill-name>/` มี frontmatter:

```yaml
---
name: <skill-name>
description: >
  หน้าที่ของ skill โดยย่อ
---
```

เนื้อหาต้องมีครบ 6 ส่วน: (1) บทบาทและขอบเขต (2) Input ที่ต้องการ (3) ขั้นตอนการทำงาน (4) Output template (5) Guardrails (masking, draft-only) (6) ตัวอย่าง input/output อย่างน้อย 1 ชุด

**สถานะปัจจุบัน:** ✅ มีไฟล์เต็มครบ 9 ตัว (master 1 + skill ย่อย 8) ใน `skills/` — ขั้นถัดไปตาม lifecycle คือ **Testing** (sandbox กับ dummy data ≥ 20 test cases/skill) และ **Validation** โดย pilot RM

| Skill | ไฟล์ |
|---|---|
| credit-orchestrator (master) | `skills/credit-orchestrator/SKILL.md` |
| call-report-writer | `skills/call-report-writer/SKILL.md` |
| statement-analyzer | `skills/statement-analyzer/SKILL.md` |
| collateral-assessor | `skills/collateral-assessor/SKILL.md` |
| debt-workout-skill | `skills/debt-workout-skill/SKILL.md` |
| credit-master | `skills/credit-master/SKILL.md` |
| product-designer-skill | `skills/product-designer-skill/SKILL.md` |
| agri-economic-navigator | `skills/agri-economic-navigator/SKILL.md` |
| customer-profiler | `skills/customer-profiler/SKILL.md` |
