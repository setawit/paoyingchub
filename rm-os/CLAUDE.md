# CLAUDE.md — RM-OS Skills (Phase 0)

## Overview

โฟลเดอร์นี้คือ **Phase 0 Skill Library** ของโปรเจกต์ RM-OS — AI skills สำหรับ Relationship Manager ของ ธ.ก.ส.

ดูข้อมูลโปรเจกต์เต็มรูปแบบที่: `../RM-OS-CLAUDE.md`

## โครงสร้าง

```
rm-os/
└── skills/
    ├── call-report-writer/          # RM-03, RM-03b — 4 modes: DRAFT/EXPORT/ANALYZE/ACTION
    ├── statement-analyzer/          # วิเคราะห์ Statement, 10-section output
    ├── collateral-assessor/         # 3 modules: อสังหาฯ / โรงเรือนฟาร์ม / stock ข้าว
    ├── debt-workout-skill/          # CH-03, WS-07 — restructure + script เจรจา
    ├── credit-master/               # CH-05 — orchestrator (SKILL.md + 01-04 sub-skills)
    ├── product-designer-skill/      # 3 modules: วิเคราะห์ / เสนอธนาคาร / เสนอลูกค้า
    ├── economic-review-skill/       # sector analysis เกษตร + references/ 3 ไฟล์
    ├── customer-profiler/           # RM-02 — structure ข้อมูลดิบก่อน handoff skill อื่น
    └── persuasion-scenario-writer/  # เขียน persuasive communication 5 scenarios
```

## โครงสร้างของแต่ละ Skill

แต่ละ skill อาจมีโครงสร้างต่างกันตามที่ออกแบบไว้ โดยทั่วไปมีดังนี้:

```
skill-name/
├── SKILL.md              # main skill definition + workflow (บังคับ)
├── references/           # domain knowledge (ถ้ามี)
│   └── *.md
└── agents/
    └── *.yaml            # display name + short description (ถ้ามี)
```

`credit-master` ใช้โครงสร้างพิเศษ — sub-skills เป็นไฟล์ลำดับ:
```
credit-master/
├── SKILL.md          # controller/orchestrator
├── 01_diagnose.md    # diagnose-fin
├── 02_risk.md        # assess-risk
├── 03_structure.md   # structure-loan
└── 04_memo.md        # craft-memo
```

## ลำดับการใช้ (Recommended Workflow)

1. **`customer-profiler`** — เริ่มทุก workflow ด้วยการ structure ข้อมูลลูกค้า
2. **`statement-analyzer`** — วิเคราะห์การเงินก่อนตัดสินใจ
3. **`collateral-assessor`** — ประเมินหลักประกัน
4. **`economic-review-skill`** — ใส่ context ด้าน sector (ถ้าเกษตร/SME)
5. **`product-designer-skill`** — ออกแบบโครงสร้างสินเชื่อ
6. **`credit-master`** — orchestrate ทั้งหมดเป็น Credit Memo
7. **`call-report-writer`** — ร่าง Call Report หลังเยี่ยมลูกค้า
8. **`debt-workout-skill`** — ใช้เฉพาะกรณี Watch/SM/NPL
9. **`persuasion-scenario-writer`** — เขียนสื่อสารโน้มน้าว (proposal, memo, post)

## Security Rules (บังคับทุก skill)

- Output ทุกชิ้นต้องมี disclaimer `⚠️ draft — RM กรุณาตรวจสอบก่อน`
- ห้ามใส่ข้อมูลที่ RM ไม่ได้ให้ — ใช้ `[RM กรุณาระบุ]` แทน
- ไม่มี PII ใน output — ใช้รหัสอ้างอิงที่ RM กำหนด
- AI output = draft เท่านั้น — RM ต้อง sign-off ก่อนใช้ทางการเสมอ

## การเพิ่ม Skill ใหม่

1. สร้างโฟลเดอร์ใน `skills/`
2. เขียน `SKILL.md` — frontmatter (`name`, `description` + trigger words) + workflow sections
3. เพิ่ม references ใน `references/` ถ้ามี domain knowledge แยก
4. อัปเดต `rm-os/CLAUDE.md` และ `../RM-OS-CLAUDE.md`
