# CLAUDE.md — RM-OS Skills (Phase 0)

## Overview

โฟลเดอร์นี้คือ **Phase 0 Skill Library** ของโปรเจกต์ RM-OS — AI skills สำหรับ Relationship Manager ของ ธ.ก.ส.

ดูข้อมูลโปรเจกต์เต็มรูปแบบที่: `../RM-OS-CLAUDE.md`

## โครงสร้าง

```
rm-os/
└── skills/
    ├── call-report-writer/       # RM-03, RM-03b — สำคัญที่สุด
    ├── statement-analyzer/       # ใช้ร่วมกับทุก skill
    ├── collateral-assessor/      # RM-04, CH-01
    ├── debt-workout-skill/       # CH-03, WS-07
    ├── credit-master/            # CH-05 — orchestrator
    ├── product-designer-skill/   # ออกแบบโครงสร้างสินเชื่อ
    ├── agri-economic-navigator/  # RM-05 — sector analysis
    └── customer-profiler/        # RM-02 — เริ่มต้น workflow
```

## โครงสร้างของแต่ละ Skill

```
skill-name/
├── SKILL.md              # main skill definition + workflow
├── references/           # domain knowledge files
│   ├── *.md             # referenced by SKILL.md
└── agents/
    └── claude.yaml      # display name + short description
```

## ลำดับการใช้ (Recommended Workflow)

1. **`customer-profiler`** — เริ่มทุก workflow ด้วยการ structure ข้อมูลลูกค้า
2. **`statement-analyzer`** — วิเคราะห์การเงินก่อนตัดสินใจ
3. **`collateral-assessor`** — ประเมินหลักประกัน
4. **`agri-economic-navigator`** — ใส่ context ด้าน sector (ถ้าเกษตร/SME)
5. **`product-designer-skill`** — ออกแบบโครงสร้างสินเชื่อ
6. **`credit-master`** — orchestrate ทั้งหมดเป็น Credit Memo
7. **`call-report-writer`** — ร่าง Call Report หลังเยี่ยมลูกค้า
8. **`debt-workout-skill`** — ใช้เฉพาะกรณี Watch/SM/NPL

## Security Rules (บังคับทุก skill)

- Output ทุกชิ้นต้องมี disclaimer `⚠️ draft — RM กรุณาตรวจสอบก่อน`
- ห้ามใส่ข้อมูลที่ RM ไม่ได้ให้ — ใช้ `[RM กรุณาระบุ]` แทน
- ไม่มี PII ใน output — ใช้รหัสอ้างอิงที่ RM กำหนด
- AI output = draft เท่านั้น — RM ต้อง sign-off ก่อนใช้ทางการเสมอ

## การเพิ่ม Skill ใหม่

1. สร้างโฟลเดอร์ใน `skills/`
2. เขียน `SKILL.md` ตาม template เดิม (frontmatter + sections)
3. เพิ่ม references ใน `references/`
4. เพิ่ม `agents/claude.yaml` พร้อม display_name
5. อัปเดต README ที่ root และ `../RM-OS-CLAUDE.md`
