# 07 — Gap Analysis (วิเคราะห์ความสมบูรณ์ของ RM-OS)

วิเคราะห์จาก: SRD v3.0 + prototype Excel 10 ไฟล์ + vault/skill ที่มีอยู่ (ณ มิ.ย. 2569)

## 1. สรุปภาพรวม

| ส่วน | สถานะ | หมายเหตุ |
|---|---|---|
| SRD v3.0 (เอกสารแม่) | ✅ สมบูรณ์ | ครบทั้ง roadmap, gate criteria, budget, risk |
| Prototype Excel | 🟡 ครอบคลุม ~10/34 modules | กลุ่ม RM เกือบครบ, WS/CH/EX ยังบาง — ปกติตาม phase plan |
| Knowledge vault (`Rm_OS.md`) | ✅ แก้แล้ว | เดิมมีแต่ลิงก์เปล่า 00–06 — สร้างครบในชุดนี้ |
| Skill library | ✅ 9/9 ตัว (draft) | เขียนครบทุกตัวแล้วใน `skills/` — เหลือ testing/validation ตาม lifecycle |

## 2. ปัญหาที่พบ (Findings)

### F-1 🔴 Module ID ชนกัน: "RM-04"
- SRD กำหนด **RM-04 = ตรวจเยี่ยม + WCR Calculator**
- แต่ไฟล์ `RM04_Lead_Tracker.xlsx` ใช้ชื่อ RM-04 ทั้งที่เป็น **Lead Tracker** (คนละเรื่อง)
- **ข้อเสนอ:** กำหนด Lead Tracker = **RM-07**, Pipeline Tracker = **RM-08**, Maintenance Tracker = **RM-09** (สะท้อนใน [[02-Modules]] แล้ว) และ rename ไฟล์ใน SRD v3.1

### F-2 ✅ (ปิดแล้ว) Skill library เขียนครบ 9 ตัว
- เดิม: มีไฟล์เต็มแค่ `credit-orchestrator` — เสี่ยงไม่ผ่าน P0 exit criteria ("skill 8+ ตัวทดสอบใช้จริง")
- **แก้แล้ว:** เขียน SKILL.md ครบทั้ง 8 ตัวตามมาตรฐาน [[03-Skills]] §5 (บทบาท/input/ขั้นตอน/template/guardrails/ตัวอย่าง)
- **คงเหลือ:** เกณฑ์ P0 ต้องการ "ทดสอบใช้จริง" — ต้องทำ sandbox testing ≥ 20 test cases/skill + validation โดย RM lead ก่อนนับว่าผ่าน gate

### F-3 🟡 RM-04 (WCR Calculator) ยังไม่มี prototype
- เป็น module P2 ที่มี Open Item ผูกอยู่ (O-08: WCR formula standardization — due End of P0)
- **ข้อเสนอ:** ทำ Excel WCR Calculator ต้นแบบใน P0–P1 เพื่อ force การ standardize สูตรก่อนเขียนโค้ดจริง

### F-4 🟡 RM-03b (Call Report ติดตามหนี้) ยังไม่แยก scenario
- RM-03 prototype รองรับ A1/A2/B1/B2 (ขอสินเชื่อ) แต่ยังไม่มี scenario ติดตามหนี้/ปรับโครงสร้าง
- **ข้อเสนอ:** เพิ่ม scenario C (ติดตามหนี้ — เชื่อม `debt-workout-skill` + Watch List ใน RM-02)

### F-5 🟡 ข้อมูลซ้ำซ้อนข้ามไฟล์ — ยังไม่มี single source
- `_RM02_DATA` ถูก copy ฝังใน RM-03 และ RM-05 · ลูกค้าใน ex01dashboard แยกอีกชุด · Lead/Prospect Pool ซ้ำระหว่าง RM-04(Lead) กับ RM-03
- ยอมรับได้ใน Phase 1 (ตาม design — Excel link ข้ามไฟล์เปราะ) แต่ต้องระวัง data drift
- **ข้อเสนอ:** ประกาศให้ RM-02 Customer Master เป็น master เดียว + ทำ checklist sync รายสัปดาห์ จนกว่า P2 จะมี database จริง

### F-6 🟡 CH group ไม่มี prototype เลย (CH-01..05)
- โดยเฉพาะ CH-05 Credit Memo/UWS เป็นงานกินเวลา 3–4 ชม./ฉบับ ตาม problem statement — ROI สูง
- **ข้อเสนอ:** ใน P1 เพิ่ม AI Helper สำหรับ Credit Memo (ใช้ `credit-master` ผ่าน credit-orchestrator) — ไม่ต้องรอ P2

### F-7 🟢 WS/EX ยังบาง — สอดคล้อง phase plan (ไม่ใช่ gap จริง)
- WS-01..13 เป็นของ P3, EX-02..08 เป็นของ P4b — มี preview แล้ว (Alert Center, Maintenance Tracker, ex01dashboard) ถือว่ามาก่อนกำหนดด้วยซ้ำ

### F-8 🟢 เกณฑ์เบิกเบี้ยเลี้ยงไม่ตรงกันระหว่าง 2 ไฟล์ (ต้อง confirm)
- `RM_BiWeekly_ActionPlan`: เบิกได้เมื่อ visit ≥ 4 ราย/วัน
- `rm06worklogv2`: ใช้เงื่อนไข "ออกพบลูกค้า + ชม.นอกสำนักงาน + คะแนนถึงเกณฑ์"
- **ข้อเสนอ:** ยืนยันระเบียบจริงกับฝ่ายบุคคล แล้ว align สูตรทั้ง 2 ไฟล์ก่อน roll-out

## 3. Coverage Matrix (prototype vs 34 modules)

- **มีแล้ว (✅):** RM-01, RM-02, RM-03, RM-05, RM-06, EX-01 + 3 tracker ใหม่ (RM-07/08/09 ที่เสนอ)
- **บางส่วน (🟡):** RM-03b, WS-01/02/03/04/06/08/10, EX-04/07/08
- **ยังไม่มี (⬜):** RM-04(WCR), WS-05/07/09/11/12/13, CH-01..05, EX-02/03/05/06

## 4. Action Plan เรียงตามลำดับความสำคัญ

| # | งาน | Phase | ปิด Finding |
|---|---|---|---|
| 1 | ~~เขียน SKILL.md ครบ 8 ตัว~~ ✅ เสร็จแล้ว → ต่อด้วย sandbox testing ≥ 20 cases/skill | P0 | F-2 |
| 2 | แก้ Module ID: Lead→RM-07, Pipeline→RM-08, Maintenance→RM-09 ใน SRD v3.1 | P0 | F-1 |
| 3 | Confirm WCR formula (O-08) + สร้าง WCR Calculator prototype | P0–P1 | F-3 |
| 4 | เพิ่ม scenario C (ติดตามหนี้) ใน RM-03 | P1 | F-4 |
| 5 | ประกาศ RM-02 เป็น single master + sync checklist | P1 | F-5 |
| 6 | AI Helper สำหรับ Credit Memo (CH-05) | P1 | F-6 |
| 7 | Align เกณฑ์เบี้ยเลี้ยงกับระเบียบจริง | P1 | F-8 |

> สถานะ P0 exit criteria: skill 8+ ✅ (เขียนครบ — รอ testing) · documented prompts 5+ ✅ (อยู่ใน SKILL.md แต่ละตัว + AI Input Helper ใน prototype) · masking guideline ✅ ([[05-Data-Security]]) · training material 🟡 (ใช้ vault ชุดนี้เป็นฐาน workshop deck ได้)
