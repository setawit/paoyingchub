# 01 — Core System Architecture

## 1. High-Level Architecture (Target State ที่ Phase 4)

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1 — Presentation                                          │
│   RM-OS Web App · Executive Dashboard · Mobile (responsive)     │
├─────────────────────────────────────────────────────────────────┤
│ Layer 2 — Application                                           │
│   RM Core (workflow engine) · AI Engine (skill orchestrator)    │
│   Warning Brain (event processor)                               │
├─────────────────────────────────────────────────────────────────┤
│ Layer 3 — Integration                                           │
│   API Gateway · Event Bus · Data Masking Service · Audit Service│
├─────────────────────────────────────────────────────────────────┤
│ Layer 4 — Data                                                  │
│   PostgreSQL (operational) · Redis (cache)                      │
│   Object Storage (documents) · Audit Log (append-only)          │
├─────────────────────────────────────────────────────────────────┤
│ Layer 5 — External                                              │
│   Anthropic API · CBS · K2 · DBD · SAP · Teams/SMTP             │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Component Responsibility

| Component | หน้าที่ | Phase ที่เริ่ม |
|---|---|---|
| **AI Engine** | Skill orchestration, prompt management, LLM API calls | P0–P1 |
| **RM Core** | Customer pool, work plan, call report management, document export | P2 |
| **Data Masking Service** | Mask PII ฝั่ง server ก่อนส่ง LLM, unmask ตอน return | P2 |
| **Audit Service** | Immutable log: who/what/when/output hash — compliance evidence | P2 |
| **Warning Brain** | Event ingestion, rule evaluation, alert generation, notification routing | P3 |
| **Integration Layer** | API gateway, ETL, sync orchestration กับ CBS/K2/DBD/SAP | P4a |
| **Executive Dashboard** | Aggregated reporting, KPI tracking, drill-down analytics | P4b |

## 3. Reference Data Flow — "RM ขอ AI ร่าง Call Report" (Phase 2)

1. RM login Web App → SSO authentication → session token
2. RM input bullet notes + customer reference (CIF)
3. RM Core ดึงข้อมูลลูกค้าจาก local cache (synced จาก CBS)
4. Data Masking Service masks PII (ชื่อ → `Customer_A`, CIF → `CIF_001`)
5. AI Engine สร้าง prompt (ผ่าน skill `call-report-writer`) → ส่ง Anthropic API
6. Anthropic returns AI-generated draft
7. Data Masking Service unmasks (`Customer_A` → ชื่อจริง)
8. Audit Service logs: user, timestamp, prompt hash, output hash
9. RM Core returns formatted draft to Web App
10. RM reviews, edits, exports เป็น `.docx`

> ใน Phase 0–1 flow เดียวกันนี้ทำแบบ manual: RM mask เอง → copy prompt จาก **AI Input Helper** (sheet ใน RM-03/RM-05) → วางใน Copilot/Claude → paste draft กลับ

## 4. หลักการออกแบบ (Non-Negotiable Rules)

1. **Data Masking บังคับ** — PII ไม่ออกจากระบบ ธ.ก.ส. ไม่ว่ากรณีใด
2. **AI Output = Draft เท่านั้น** — RM ต้องตรวจและรับผิดชอบก่อน sign-off
3. **Audit Trail ครบทุก transaction** — who/what/when/output
4. **ข้อมูลจริงอยู่ใน CBS** — RM-OS เป็น working layer ไม่ใช่ source of truth
5. **ห้ามใช้ข้อมูลลูกค้าจริงใน test/development**

## 5. Tech Stack (Proposed — P2)

- **Frontend:** React/Next.js + TypeScript
- **Backend:** Node.js หรือ Python FastAPI
- **Database:** PostgreSQL (audit log) + Redis (session)
- **Auth:** SSO กับ AD ของ ธ.ก.ส.
- **Hosting:** Cloud (Azure/AWS) หรือ on-prem ตามนโยบาย IT
- **AI:** Anthropic Claude API (managed keys)

## 6. UI/UX Standards (P2+)

- **Primary Green:** `#059669` (Emerald 600), dark variant `#10b981` — buttons, headers
- **Background:** `#f0fdf8` (light) / `#091812` (dark mode)
- **Secondary:** Blue `#2563eb` · Warning Red `#dc2626` · Amber `#d97706`
- **Typography:** IBM Plex Sans Thai (primary) · IBM Plex Mono (monospace)
- **Breakpoints:** Mobile < 640px (1 col) · Tablet 640–1024px (2 cols) · Desktop > 1024px (full)
