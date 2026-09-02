# /ui — Frontend / Dashboard

> Version: 1.0
> Last Updated: 2026-07-04

โค้ดส่วนหน้า (mobile-first, offline friendly) แสดงข้อมูลจาก Entity ผ่าน API
หัวใจคือ Explain Panel ("ทำไม?") ที่แนบเหตุผล/สมมติฐาน/ที่มากับทุกตัวเลข

## Files

| File | Description |
| --- | --- |
| `farmplan-v3.html` | Prototype ที่ทำงานได้จริงในไฟล์เดียว (ฟาร์ม/แคตตาล็อก/แปลงดิน/ตลาด/ผลวิเคราะห์ 3 แผน + cashflow 52 สัปดาห์, บันทึกด้วย LocalStorage) — เปิดในเบราว์เซอร์ได้ทันที
| `pvd-dashboard.html` | เครื่องมือเดี่ยว: วางแผนภาษีและกองทุนสำรองเลี้ยงชีพ (PVD) — หา % สะสมที่คุ้มภาษีที่สุดภายใต้เพดานข้อบังคับกองทุน สิทธิลดหย่อน 15% และเพดานรวมกลุ่มเกษียณ 500,000 บาท/ปี พร้อมคำนวณภาษีขั้นบันไดและเทียบว่าเงินก้อนควรลง PVD หรือ RMF — เปิดในเบราว์เซอร์ได้ทันที

## Cross Reference
- Spec: [`../07_UI_SPECIFICATION.md`](../07_UI_SPECIFICATION.md)
- Data via API: [`../06_API_SPECIFICATION.md`](../06_API_SPECIFICATION.md)
