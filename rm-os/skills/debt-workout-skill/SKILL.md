---
name: debt-workout-skill
description: >
  จัดทำแผนปรับโครงสร้างหนี้และ action plan สำหรับลูกหนี้ Watch List, SM, และ NPL
  ใช้เมื่อ RM ต้องการ draft แผนปรับโครงสร้าง, memo, หรือ talking points สำหรับเจรจากับลูกค้า
---

# Debt Workout Skill

ใช้ skill นี้สำหรับงาน debt restructuring — ตั้งแต่ draft แผนปรับโครงสร้างไปจนถึง talking points สำหรับเจรจา

## Inputs ที่ต้องดึงก่อน

- `debtor_status`: `watch-list` / `SM` / `NPL`
- `outstanding_balance`: ยอดหนี้คงเหลือ (บาท)
- `overdue_months`: จำนวนเดือนที่ค้างชำระ
- `reason_for_default`: สาเหตุที่ผิดนัด (ภัยพิบัติ / ธุรกิจขาดทุน / รายได้ลด / เจ็บป่วย / อื่นๆ)
- `customer_assets`: ทรัพย์สินที่มี (หลักประกัน, กิจการ, รายได้ปัจจุบัน)
- `customer_cooperation`: ระดับความร่วมมือ (ดี / กลาง / ไม่ร่วมมือ)
- `task_type`: `restructure-plan` / `memo` / `negotiation-script`

## Workout Options ที่พิจารณา

โหลดเกณฑ์จาก `references/workout-options.md`

ประเมิน options ตาม:
1. ความสามารถในการชำระหนี้จริง
2. ระดับความร่วมมือของลูกค้า
3. มูลค่าหลักประกัน
4. สาเหตุของการผิดนัด (ชั่วคราว vs เรื้อรัง)

## Output formats

### Restructure Plan
```markdown
## แผนปรับโครงสร้างหนี้ — [รหัสอ้างอิง]

**สถานะปัจจุบัน:** [Watch/SM/NPL] | ค้าง [X] เดือน | ยอด [X] บาท
**สาเหตุ:** [ระบุ]

**แผนที่เสนอ**
- รูปแบบ: [ลดงวด / ยืดระยะ / พักชำระต้น / รวมหนี้ / อื่นๆ]
- ระยะเวลาใหม่: [X] ปี
- ยอดผ่อนใหม่: [X] บาท/เดือน
- เงื่อนไขพิเศษ: [ระบุ ถ้ามี]

**เหตุผลประกอบการพิจารณา**
[2-3 bullet]

**ความเสี่ยงและการติดตาม**
[bullet points]

---
⚠️ draft — RM ต้องส่ง approve ตามระเบียบก่อนแจ้งลูกค้า
```

### Negotiation Script
```markdown
## Script เจรจา — [รหัสอ้างอิง]

**เปิดการสนทนา**
[ประโยคเปิด — สร้างความไว้วางใจ, ไม่กดดัน]

**ประเด็นหลักที่ต้องสื่อ**
1. [ประเด็น 1]
2. [ประเด็น 2]

**ข้อเสนอที่จะเสนอ**
[อธิบายแผนด้วยภาษาลูกค้าเข้าใจ]

**handling ถ้าลูกค้าปฏิเสธ**
[alternative approach]

**ปิดการสนทนา**
[นัดหมาย / ขอเอกสาร / follow-up]
```

## อ่าน references เพิ่มเติม
- `references/workout-options.md` — ตัวเลือกการปรับโครงสร้างและเกณฑ์การพิจารณา
