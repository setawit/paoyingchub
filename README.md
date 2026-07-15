# FarmPlan Operating System (FPOS)
### AI Blueprint Repository

> Version: 1.0
> Last Updated: 2026-07-04

**FarmPlan** คือระบบปัญญาประดิษฐ์สำหรับช่วยวางแผนการเกษตร เริ่มจาก "นา 1 ไร่"
และขยายสู่ฟาร์มทุกขนาด เปลี่ยนข้อจำกัดของเกษตรกร (พื้นที่ เงินทุน แรงงาน น้ำ เวลา)
ให้กลายเป็นแผนการผลิตที่เหมาะสมที่สุด **ภายใต้ความเสี่ยงที่ยอมรับได้** และรายได้ที่ยั่งยืน

Repository นี้คือ **blueprint** (เอกสารสถาปัตยกรรม) ของระบบ ไม่ใช่ตัวโค้ดสมบูรณ์
โดย [`00_MASTER.md`](00_MASTER.md) เป็นจุดเริ่มต้นสำหรับ AI Agent และเอกสารนี้เป็นจุดเริ่มต้นสำหรับคน

---

## 📖 Reading Order (สารบัญ)

อ่านตามลำดับนี้ (ตาม `00_MASTER.md` §13):

| # | Document | เนื้อหา |
| --- | --- | --- |
| 00 | [`00_MASTER.md`](00_MASTER.md) | Vision, North Star, Rules, AI Contract (Repository Root) |
| 01 | [`01_PRD.md`](01_PRD.md) | Product Requirements — personas, user stories, MVP |
| 02 | [`02_DOMAIN_MODEL.md`](02_DOMAIN_MODEL.md) | **Entities (Single Source of Truth)** + ER diagram |
| 03 | [`03_DATABASE.md`](03_DATABASE.md) | Physical schema (SQLite local / PostgreSQL) |
| 04 | [`04_OPTIMIZATION_ENGINE.md`](04_OPTIMIZATION_ENGINE.md) | Objective, constraints, solver, explainability |
| 05 | [`05_KNOWLEDGE_BASE.md`](05_KNOWLEDGE_BASE.md) | Crop/livestock/price data + provenance rules |
| 06 | [`06_API_SPECIFICATION.md`](06_API_SPECIFICATION.md) | REST API mapped to entities |
| 07 | [`07_UI_SPECIFICATION.md`](07_UI_SPECIFICATION.md) | Screens, flows, Explain Panel UX |
| 08 | [`08_AGENT_SYSTEM.md`](08_AGENT_SYSTEM.md) | AI agents, RAG, AI Contract Guard |
| 09 | [`09_ENGINEERING_STANDARD.md`](09_ENGINEERING_STANDARD.md) | Coding & doc standards, module boundaries |
| 10 | [`10_TEST_PLAN.md`](10_TEST_PLAN.md) | Test strategy tied to Success Criteria |
| 11 | [`11_DEPLOYMENT.md`](11_DEPLOYMENT.md) | Topology, offline/edge, CI/CD, rollout |

---

## 🗂️ Repository Map (ตาม `00_MASTER.md` §14)

| Folder | Purpose | Governed by |
| --- | --- | --- |
| [`/core`](core/) | Optimization Engine | `04` |
| [`/database`](database/) | Schema & migrations | `03` |
| [`/knowledge`](knowledge/) | Knowledge Base data | `05` |
| [`/prompts`](prompts/) | Agent prompts | `08` |
| [`/api`](api/) | REST API implementation | `06` |
| [`/ui`](ui/) | Frontend / dashboard | `07` |
| [`/agents`](agents/) | AI Agent Layer | `08` |
| [`/tests`](tests/) | Test suites | `10` |
| [`/examples`](examples/) | Example farms & scenarios | `01`, `02` |
| [`/assets`](assets/) | Diagrams & media | — |
| [`/archive`](archive/) | Legacy "paoyingchub" game (not part of FPOS) | — |

> โฟลเดอร์เหล่านี้เป็นโครงสำหรับโค้ดในอนาคต ปัจจุบันมี `README.md` อธิบายหน้าที่ในแต่ละโฟลเดอร์

---

## 🧭 Core Principles (จาก `00_MASTER.md`)

- **North Star** — รายได้มั่นคงภายใต้ความเสี่ยงที่รับได้ ไม่ใช่กำไรสูงสุดเสมอไป
- **Explainability** — ทุกตัวเลข/คำแนะนำต้องบอกเหตุผล สมมติฐาน ที่มา และความเชื่อมั่น
- **Human in Control** — AI เป็นผู้ช่วย ผู้ใช้เป็นผู้ตัดสินใจ
- **No fabrication** — AI ห้ามกุข้อมูลพืช/สัตว์/ราคา (ต้องมีแหล่งอ้างอิงจาก Knowledge Base)
- **Single Source of Truth** — Entity นิยามที่ [`02_DOMAIN_MODEL.md`](02_DOMAIN_MODEL.md) ที่เดียว
