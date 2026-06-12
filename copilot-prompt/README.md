# RM Credit Copilot – Verify & Validate Prompt Design

ชุดคำสั่งสำหรับส่งให้ Co-Pilot ทำหน้าที่ช่วย RM เตรียมเคสสินเชื่อก่อนส่งกลั่นกรอง

---

## วิธีใช้งาน

| ไฟล์ | วัตถุประสงค์ | ใช้เมื่อ |
|---|---|---|
| `system-prompt.md` | ชุดคำสั่งหลัก ตั้งบทบาท Co-Pilot | ส่งครั้งแรก หรือเปิด session ใหม่ |
| `input-template.md` | แม่แบบกรอกข้อมูลเคส | ทุกครั้งที่ต้องการวิเคราะห์เคส |
| `quick-prompts.md` | คำสั่งลัดสำหรับถามเฉพาะจุด | เมื่อต้องการถามแค่บางประเด็น |

### ขั้นตอนการใช้งาน
1. เปิด Co-Pilot ใหม่
2. Copy `system-prompt.md` ทั้งหมด → วางเป็นข้อความแรก → ส่ง
3. รอ Co-Pilot ตอบรับ
4. กรอกข้อมูลเคสใน `input-template.md` → ส่งเป็นข้อความที่สอง
5. รับผลการวิเคราะห์ครบ 7 ส่วน:
   1. Executive Summary
   2. Verify Checklist
   3. Validate Risk Assessment (5Cs + Red Flags)
   4. Questions From Credit Review
   5. Suggested Responses
   6. Credit Readiness Score
   7. Recommended Next Actions
