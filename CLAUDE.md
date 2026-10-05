# CLAUDE.md — Guide for Claude Code

> Version: 1.0
> Last Updated: 2026-10-05

ไฟล์นี้บอก Claude Code ว่า repository นี้คืออะไร และต้องทำงานอย่างไร
อ่านคู่กับ [`00_MASTER.md`](00_MASTER.md) (AI entry point) และ [`README.md`](README.md) (human entry point)

---

## 1. What this repo is

- **FarmPlan Operating System (FPOS)** — *blueprint repository* (เอกสารสถาปัตยกรรม) ของระบบ AI วางแผนฟาร์ม
  เริ่มจาก "นา 1 ไร่" ยังไม่ใช่ codebase สมบูรณ์
- ชื่อ repo `paoyingchub` มาจากเกมเป่ายิ้งฉุบเดิม ซึ่งตอนนี้อยู่ใน [`archive/`](archive/) และ **ไม่ใช่ส่วนหนึ่งของ FPOS** — อย่าแก้ไขหรืออ้างอิงเป็นส่วนของระบบ
- ไม่มี build system, package manager, linter หรือ test runner ในตอนนี้

## 2. Layout

| Path | Content |
| --- | --- |
| `00_MASTER.md` … `11_DEPLOYMENT.md` | Blueprint docs — อ่านตามลำดับเลข (`00_MASTER.md` §13) |
| `02_DOMAIN_MODEL.md` | **Single Source of Truth** ของชื่อ/นิยาม Entity |
| `core/ database/ knowledge/ prompts/ api/ agents/ tests/ examples/ assets/` | โครงโฟลเดอร์สำหรับโค้ดในอนาคต — ปัจจุบันมีแค่ `README.md` |
| `ui/farmplan-v3.html` | Prototype FarmPlan แบบไฟล์เดียว (HTML+CSS+JS inline, เก็บข้อมูลใน LocalStorage) |
| `ui/pvd-dashboard.html` | เครื่องมือเดี่ยว: วางแผนภาษี + กองทุนสำรองเลี้ยงชีพ (PVD) — เพดาน 15% ของค่าจ้าง, เพดานลดหย่อน 500,000 บาท/ปี |
| `archive/` | เกมเป่ายิ้งฉุบเดิม (`.txt`) — เก็บไว้เป็นประวัติเท่านั้น |

## 3. Running / testing

- เปิดไฟล์ใน `ui/*.html` ในเบราว์เซอร์ได้ทันที ไม่มี dependency ภายนอก
- ตรวจผลแบบ headless ได้ด้วย Playwright + Chromium ที่ติดตั้งไว้ (`executablePath: '/opt/pw-browsers/chromium'`) — อย่ารัน `playwright install`
- ยังไม่มี automated test suite; กลยุทธ์การทดสอบอยู่ที่ [`10_TEST_PLAN.md`](10_TEST_PLAN.md)

## 4. Rules (สรุปจาก `00_MASTER.md` §9–§10 และ `09_ENGINEERING_STANDARD.md`)

**AI Contract**
- ห้ามกุข้อมูลพืช/สัตว์/ราคา/สถิติ — ต้องมีแหล่งอ้างอิง (Knowledge Base, `05`)
- แยก fact กับ estimate, ระบุสมมติฐาน, บอกระดับความเชื่อมั่น
- ห้าม hardcode ข้อมูลพืช/สัตว์/ราคาในโค้ด core

**Documentation** — ทุกไฟล์ `.md` ต้องมี
- heading เป็นระบบ, `Version`, `Last Updated`, section **Cross Reference**, Mermaid diagram เมื่อเหมาะสม
- ห้ามข้อมูล/Entity/Logic ซ้ำหลายไฟล์ — ให้ลิงก์ไปยังต้นทางแทน
- เมื่อแก้เอกสาร ให้อัปเดต `Last Updated` (และ `Version` หากเปลี่ยนเนื้อหาสำคัญ)

**Code / architecture**
- ใช้ชื่อ Entity จาก `02_DOMAIN_MODEL.md` เท่านั้น; แก้ Entity ที่ `02` ก่อน แล้วจึงตามด้วย DB/โค้ด
- Dependency ไหลลงอย่างเดียว: `ui → api → core/agents → knowledge/database` (no upward calls)
- Explainable > clever; ตัวเลขที่คำนวณต้องมาพร้อมที่มาและสมมติฐาน (`is_estimate`)
- เพิ่มไฟล์ใหม่ใน `ui/` (หรือโฟลเดอร์อื่น) ให้เพิ่มแถวในตาราง Files ของ `README.md` ในโฟลเดอร์นั้นด้วย

## 5. Conventions

- ภาษาเอกสาร: ไทยเป็นหลัก ศัพท์เทคนิคเป็นอังกฤษ
- UI: `lang="th"`, mobile-first, offline friendly, มี Explain Panel ("ทำไม?") ตาม [`07_UI_SPECIFICATION.md`](07_UI_SPECIFICATION.md)
- Git: ทำงานบน feature branch แล้ว merge ผ่าน PR; commit message อธิบาย "ทำไม"

## 6. Cross Reference

- Master blueprint & AI Contract: [`00_MASTER.md`](00_MASTER.md)
- Human overview: [`README.md`](README.md)
- Canonical entities: [`02_DOMAIN_MODEL.md`](02_DOMAIN_MODEL.md)
- Engineering standard: [`09_ENGINEERING_STANDARD.md`](09_ENGINEERING_STANDARD.md)
- Test plan: [`10_TEST_PLAN.md`](10_TEST_PLAN.md)
- UI files: [`ui/README.md`](ui/README.md)
