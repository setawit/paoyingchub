# Credit Analyst Toolkit (เทมเพลต + พรอมต์)

ชุดเครื่องมือสำหรับวิเคราะห์ Statement บัญชีธนาคารด้วย AI โดยเน้น **ตรวจสอบย้อนหลังได้** และ **ลบข้อมูลลูกค้าก่อนส่งต่อ/เทรนโมเดลได้**

ไม่ต้องรันโปรแกรม — เป็นเทมเพลตที่เอาไปวางให้ AI (เช่น Claude/ChatGPT) ทำงานทุกครั้ง

## ไฟล์ในชุดนี้

| ไฟล์ | หน้าที่ |
|---|---|
| `SYSTEM_PROMPT.md` | พรอมต์หลัก (วางเป็น system instruction) — กำหนดบทบาท กฎ และ output 4 อย่าง |
| `schema.json` | โครงสร้างข้อมูลกลาง ที่ AI ต้องสกัดออกมาเป็น JSON (single source of truth) |
| `ANONYMIZATION.md` | กฎลบ PII ก่อนเผยแพร่/เทรน/สอน |
| `templates/raw_data_template.md` | ไฟล์ข้อมูลดิบ (ledger รายรายการ) สำหรับตรวจสอบ |
| `templates/report_template.md` | รายงานนักวิเคราะห์ 5 ส่วน (สำหรับคนอ่าน) |
| `templates/dashboard_template.html` | dashboard กราฟ เปิดในเบราว์เซอร์ได้ทันที (ไม่ต้องต่อเน็ต) |

## วิธีใช้

1. วางเนื้อหา `SYSTEM_PROMPT.md` เป็น system prompt ของ AI
2. แนบไฟล์ Statement (รูป/PDF) แล้วสั่งวิเคราะห์
   - ถ้าจะเอาไปเทรน/สอน ให้พิมพ์ว่า **"anonymize"** ด้วย
3. AI จะส่งออกตามลำดับ:
   1. **JSON** ตาม `schema.json` (ข้อมูลกลาง)
   2. **raw_data.md** (ข้อมูลดิบ ตรวจสอบได้)
   3. **report.md** (รายงาน 5 ส่วน)
   4. **dashboard.html** (เอา JSON ไปแทนใน `const DATA={...}`)
4. เปิด `dashboard.html` ในเบราว์เซอร์เพื่อดูกราฟ

## จุดเด่นด้านความถูกต้อง
- **Reconciliation Check:** `opening + inflow − outflow = closing` — ด่านจับเลขตกหล่น/เดามั่ว
- **Confidence flag** รายรายการ (ภาพเบลอ = `low`)
- ทุก artifact สร้างจาก JSON ชุดเดียว → ตัวเลขใน report/dashboard/raw data ตรงกันเสมอ

> ⚠️ ข้อมูลเป็นเพียงตัวช่วยวิเคราะห์ ไม่ใช่คำตัดสินอนุมัติสินเชื่อ ต้องพิจารณาประกอบกับบัญชีอื่นและงบการเงิน
