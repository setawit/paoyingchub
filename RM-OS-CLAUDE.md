# CLAUDE.md — RM-OS (Relationship Manager Operating System)
# ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)

## Project Overview

RM-OS คือ AI-augmented workflow platform สำหรับ Relationship Manager (RM) ของ ธ.ก.ส. เป้าหมายหลักคือลดเวลางานเอกสาร 80-90% เพื่อให้ RM มีเวลาเยี่ยมลูกค้าและป้องกัน NPL มากขึ้น

**สถานะ:** Proposal — ยังไม่เริ่มพัฒนา (รอ technical review + approval)
**เวอร์ชันเอกสาร:** SRD v3.0 (เมษายน 2569)
**ขอบเขต:** 34 modules | 4 กลุ่มงาน | 5 phases (P0–P4) | ~18-24 เดือน

---

## Core Principle

> **"ค่อยเติม AI เข้าไปใน workflow ทีละ phase — ไม่สร้างทั้งระบบในครั้งเดียว"**

ทุก phase มี independent value — หยุดที่ phase ใดก็ยังได้ประโยชน์จาก phase ก่อนหน้า

---

## Phase Roadmap

### P0 — Foundation Build (1-2 เดือน)
**เป้าหมาย:** สร้าง skill library + prompt templates ที่ทดสอบแล้ว
- ไม่ต้องมี dev team — RM lead ทำคนเดียว (Claude Pro ~600 บาท/เดือน)
- Output: skill 8-10 ตัว, prompt templates 5-7 ชุด, data masking guideline

### P1 — AI Engine MVP (2-3 เดือน)
**เป้าหมาย:** พิสูจน์ value กับ pilot RM 3-5 คน ก่อน commit งบ
- ใช้ Claude Desktop (ไม่มี web app ยัง)
- เก็บ metrics: time saved, error rate, NPS
- Exit gate: RM pilot ลด Call Report time ≥ 60%, NPS ≥ 7/10

### P2 — RM Core + Web UI (4-6 เดือน) ← Critical Inflection Point
**เป้าหมาย:** Web Application สำหรับ RM ทั่วองค์กร + server-side data masking
- **Tech Stack:**
  - Frontend: React/Next.js + TypeScript
  - Backend: Node.js หรือ Python FastAPI
  - Database: PostgreSQL (audit log) + Redis (session)
  - Auth: SSO กับ AD ของ ธ.ก.ส. (SAML/OAuth)
  - AI: Anthropic Claude API (managed keys)
  - Hosting: Cloud (Azure/AWS) หรือ on-prem ตามนโยบาย IT
- Dev team: 3-5 คน (FE 1-2, BE 1-2, DevOps/Security 1)

### P3 — Warning Brain (3-4 เดือน)
**เป้าหมาย:** เปลี่ยน reactive → proactive — AI เตือน RM แบบ event-driven
- Warning 13 ประเภท (WS-01 ถึง WS-13)
- Notification ผ่าน Email/Teams (SMS defer ไป P4)
- **Critical dependency:** CBS data feed ต้องพร้อมจาก P2

### P4a — Integration Layer (6-9 เดือน) ← ใหญ่สุด (50-60% ของงบรวม)
**เป้าหมาย:** เชื่อม CBS, K2, DBD, SAP — eliminate manual data entry

### P4b — Executive Dashboard (2-3 เดือน)
**เป้าหมาย:** Real-time portfolio insight สำหรับผู้บริหาร (Power BI / Tableau / custom)

---

## Architecture (Target State — P4)

```
Layer 1 — Presentation
  RM-OS Web App | Executive Dashboard | Mobile (responsive PWA)

Layer 2 — Application
  RM Core (workflow)  |  AI Engine (skill orchestrator)  |  Warning Brain (event processor)

Layer 3 — Integration
  API Gateway  |  Event Bus (Kafka/Event Hub)  |  Data Masking Service  |  Audit Service

Layer 4 — Data
  PostgreSQL (operational)  |  Redis (cache)  |  Object Storage (docs)  |  Audit Log (immutable)

Layer 5 — External
  Anthropic API  |  CBS  |  K2  |  DBD  |  SAP  |  Teams/SMTP
```

### Data Flow — "RM ขอ AI ร่าง Call Report" (P2)
1. RM login → SSO → session token
2. RM ใส่ bullet notes + customer reference (CIF)
3. RM Core ดึงข้อมูลลูกค้าจาก local cache (synced จาก CBS)
4. **Data Masking Service** masks PII (ชื่อ → Customer_A, CIF → CIF_001)
5. AI Engine สร้าง prompt ด้วย `call-report-writer` skill → ส่ง Anthropic API
6. Anthropic returns draft
7. Data Masking Service unmasks (mapping จาก session memory)
8. **Audit Service** logs: user, timestamp, prompt_hash, output_hash
9. RM Core returns formatted draft → Web App
10. RM review, edit, export `.docx`

---

## Skill Architecture

Skill = bundled prompt + domain knowledge + output template สำหรับงานเฉพาะ

| Skill | หน้าที่ | Module |
|-------|---------|--------|
| `call-report-writer` | 4 modes: DRAFT / EXPORT (.docx) / ANALYZE / ACTION — มาตรฐาน 301.02.05 | RM-03, RM-03b |
| `statement-analyzer` | วิเคราะห์ Bank Statement 10-section — พฤติกรรมเงิน, red flags, cross-check | ทุก module |
| `collateral-assessor` | 3 modules: อสังหาฯ / โรงเรือนฟาร์ม / stock ข้าวเปลือก — LTV calc | RM-04, CH-01 |
| `debt-workout-skill` | Watch/SM/NPL — restructure plan + negotiation script | CH-03, WS-07 |
| `credit-master` | Controller → diagnose-fin → assess-risk → structure-loan → craft-memo | CH-05 |
| `product-designer-skill` | 3 modules: วิเคราะห์/เสนอธนาคาร/เสนอลูกค้า — true cost, competitive analysis | ทุก module |
| `economic-review-skill` | Macro-Micro analysis สำหรับ sector เกษตรไทย | RM-05 |
| `customer-profiler` | Structure ข้อมูลดิบลูกค้าให้พร้อมใช้ใน skills อื่น | RM-02 |
| `persuasion-scenario-writer` | เขียน persuasive communication: post / speech / memo / pitch / negotiation | cross-cutting |

### Skill Development Lifecycle
1. **Design** — RM domain expert + Prompt engineer co-design
2. **Test** — sandbox + dummy data 20+ test cases
3. **Validate** — pilot RM review + accuracy assessment
4. **Deploy** — version-controlled, A/B testing capability
5. **Maintain** — quarterly review, update เมื่อ SOP เปลี่ยน

---

## Module Map (34 Modules)

### RM Group (P1-P2)
| ID | Module | Phase | Component |
|----|--------|-------|-----------|
| RM-01 | แผนปฏิบัติงาน (Work Plan) | P2 | RM Core |
| RM-02 | ถังเก็บข้อมูลลูกค้า (Customer Pool) | P2 | RM Core + Integration |
| RM-03 | Call Report — จ่ายสินเชื่อ | P1-P2 | AI Engine + RM Core |
| RM-03b | Call Report — ติดตามหนี้ | P1-P2 | AI Engine + RM Core |
| RM-04 | ตรวจเยี่ยม + WCR Calculator | P2 | AI Engine + RM Core |
| RM-05 | Business Information Report | P1-P2 | AI Engine |
| RM-06 | สรุปเบี้ยเลี้ยง / รถ / น้ำมัน | P4a | Integration (SAP) |

### Warning Group (P3)
| ID | Module | Phase |
|----|--------|-------|
| WS-01 | วงเงิน + OD ครบกำหนด | P3 |
| WS-02 | P/N ครบกำหนด | P3 |
| WS-03 | บสย. หมดอายุ | P3 |
| WS-04 | ประกันวินาศภัยหมดอายุ | P3 |
| WS-05 | Loan Covenant Breach | P3 |
| WS-06 | ตรวจเยี่ยมประจำปี | P3 |
| WS-07 | ดอกเบี้ยค้าง 15 เดือน | P3 |
| WS-08 | หนี้ถึงกำหนด Next Due | P3 |
| WS-09 | อนุมัติแล้วรอทำสัญญา | P3 |
| WS-10 | Watch List / Follow List | P3 |
| WS-11 | Email/Teams Notification | P3 |
| WS-12 | SMS แจ้งเตือนลูกค้า | P3-P4 (defer) |
| WS-13 | ยอดเงินไม่พอหักชำระ | P3 |

### Collection/Credit Group (P1-P4a)
| ID | Module | Phase |
|----|--------|-------|
| CH-01 | ปักหมุด GPS + รูปถ่าย | P2 |
| CH-02 | ดึงงบการเงิน DBD | P4a |
| CH-03 | ติดตามหนี้ Loan Collection | P1-P2 |
| CH-04 | Credit Rating Engine | P2 |
| CH-05 | Credit Memo / UWS Generator | P1-P2 |

### Executive Group (P4b)
| ID | Module | Phase |
|----|--------|-------|
| EX-01 | Dashboard Overview | P4b |
| EX-02 | Aging Report + SLA Tracking | P4b |
| EX-03 | KPI Tracking + Forecast | P4b |
| EX-04 | Ranking RM / BC / เขต | P4b |
| EX-05 | Yield Analysis | P4b |
| EX-06 | Customer Product Holding | P4a-P4b |
| EX-07 | Credit Utilization Drill-down | P4b |
| EX-08 | Tracking งาน ราย RM | P4b |

---

## Security & Compliance — Non-Negotiables

1. **Data Masking บังคับทุกกรณี** — PII ไม่ออกจาก ธ.ก.ส. infrastructure ไม่ว่ากรณีใด
2. **AI Output = Draft เท่านั้น** — RM ต้อง review และ sign-off ก่อนใช้งานเสมอ
3. **Audit Trail ครบทุก transaction** — user_id, session_id, timestamp, skill_name, input_hash, output_hash (immutable, append-only)
4. **ข้อมูลจริงอยู่ใน CBS** — RM-OS เป็น working layer ไม่ใช่ source of truth
5. **ห้ามใช้ข้อมูลลูกค้าจริงใน dev/test** — ใช้ dummy data เสมอ

### Data Masking Strategy
- **P0-P1:** Manual masking โดย RM (guideline + checklist)
- **P2+:** Server-side masking service — intercept ทุก request ก่อนส่ง LLM; mapping ไม่ persist เกิน session

### Compliance References
- PDPA (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
- ธปท. Guidelines on Outsourcing of IT Services
- ระเบียบ ธ.ก.ส. ว่าด้วย Call Report 301.02.05
- Anthropic Terms of Service + Data Processing Agreement

---

## Phase-Gate Criteria (Kill Criteria)

### P1 → P2 Kill (อย่าขยับถ้า...)
- Time saved < 40% (value proposition อ่อน)
- RM adoption < 50% ของกรณีที่ควรใช้
- มี security incident จาก data masking failure
- AI error rate > 20%

### P2 → P3 Kill
- User adoption < 30% หลัง 60 วัน
- Security audit fail (critical findings)
- Cost overrun > 50% จาก budget

### P3 → P4 Kill
- False positive rate > 40% (RM เริ่ม ignore warning)
- CBS data feed ไม่เสถียร

---

## Critical Decisions Required (Open Items)

| ID | ประเด็น | Required By | Priority |
|----|---------|-------------|----------|
| O-01 | Cloud vs On-prem deployment | End of P1 | High |
| O-02 | Anthropic commercial agreement | End of P1 | High |
| O-03 | API key management strategy | Start of P2 | High |
| O-04 | SSO integration approach (SAML/OAuth) | Start of P2 | High |
| O-05 | CBS data feed: real-time vs batch | Mid of P2 | High |
| O-06 | Data Masking algorithm | Start of P2 | Medium |
| O-07 | Audit log retention period | Mid of P2 | Medium |
| O-08 | WCR formula standardization | End of P0 | Medium |
| O-09 | Credit Rating model approach | Start of P2 | Medium |
| O-10 | SMS Gateway + consent model | Start of P3 | Low |
| O-11 | BI tool selection (Power BI/Tableau/custom) | Start of P4b | Low |
| O-12 | Mobile: native vs PWA | Mid of P2 | Low |

---

## UI/UX Standards (P2+)

| Element | Value |
|---------|-------|
| Primary color | `#059669` Emerald 600 / dark variant `#10b981` |
| Background | `#f0fdf8` (light) / `#091812` (dark mode) |
| Secondary | `#2563eb` blue / `#dc2626` red / `#d97706` amber |
| Font | IBM Plex Sans Thai (body), IBM Plex Mono (code) |
| Mobile breakpoint | < 640px — single column |
| Tablet breakpoint | 640-1024px — 2 columns |
| Desktop breakpoint | > 1024px — full layout |

---

## Conventions for AI Assistants

### When writing code for this project:
- **ภาษา:** comment และ variable names ภาษาอังกฤษ, UI copy ภาษาไทย
- **AI calls:** ใช้ Anthropic SDK เสมอ — ไม่ hard-code prompt ใน business logic, แยก skill definitions ออกเป็นไฟล์ต่างหาก
- **Security:** ทุกครั้งที่ส่งข้อมูลไป Anthropic API ต้องผ่าน Data Masking Service ก่อน — ห้าม bypass
- **AI output:** ต้อง label ชัดว่าเป็น "draft" เสมอ — ห้าม present เป็น final document
- **Audit:** ทุก AI call ต้อง log ผ่าน Audit Service — ห้าม call API โดยตรงจาก frontend
- **Error handling:** ถ้า Anthropic API down ระบบต้อง graceful degrade — RM กลับไปทำด้วยตัวเองได้ (ไม่ใช่ critical path)

### Phase-aware development:
- ระบุใน code comment ว่า feature นี้อยู่ใน Phase ใด (เช่น `// P2: RM Core`)
- Features ที่ยัง defer ไป phase อื่น ให้ TODO comment พร้อม phase และ dependency
- อย่า build integration กับ CBS/K2/DBD/SAP ก่อน P4a เป็น requirement ชัดเจน

### Skill development pattern:
```
skills/
  call-report-writer/
    system-prompt.txt     # domain knowledge + rules
    user-prompt.j2        # Jinja2 template รับ input จาก RM
    output-schema.json    # expected output structure
    test-cases/           # dummy data test cases 20+ ชุด
```

---

## Glossary

| คำ | ความหมาย |
|----|---------|
| RM | Relationship Manager — พนักงานสินเชื่อของ ธ.ก.ส. |
| CBS | Core Banking System — ระบบหลักของธนาคาร |
| NPL | Non-Performing Loan — หนี้ไม่ก่อให้เกิดรายได้ |
| WCR | Working Capital Requirement — สูตรคำนวณวงเงินหมุนเวียน |
| Skill | Bundled prompt + domain knowledge + output template |
| Phase Gate | Decision point ระหว่าง phase — มี entry/exit/kill criteria |
| LLM | Large Language Model เช่น Claude, GPT-4 |
| บสย. | บรรษัทประกันสินเชื่ออุตสาหกรรมขนาดย่อม |
| K2 | ระบบ workflow/approval ของ ธ.ก.ส. |
| DBD | กรมพัฒนาธุรกิจการค้า — แหล่งงบการเงินนิติบุคคล |
| SAP | ระบบ HR/Finance ของ ธ.ก.ส. |
