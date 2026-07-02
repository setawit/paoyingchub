# Operation C11 — Challenger Camp (ก.ค. – ธ.ค. 2569)

ระบบเตรียมสอบ C11 ฉบับ "ประธานกรรมการคัดเลือก" — เริ่มอ่านที่ **[MASTER-C11.md](MASTER-C11.md)**

## โครงสร้าง

| ไฟล์ | คืออะไร |
|------|---------|
| [MASTER-C11.md](MASTER-C11.md) | เอกสารแม่บท: ธนาคารวัดอะไร → เครื่องมือ+rubric → สกิล 5 ตัว (วิธีจี้ของกรรมการ + วิธีฝึก) |
| [specs/01-sjt-generator.md](specs/01-sjt-generator.md) | prompt ผลิตโจทย์ SJT + เฉลย (ซ้อมอังคาร) |
| [specs/02-case-exam-generator.md](specs/02-case-exam-generator.md) | prompt ผลิต case ข้อเขียนยุทธศาสตร์ + rubric (สัปดาห์ละข้อ) |
| [specs/03-sparring-generator.md](specs/03-sparring-generator.md) | prompt กรรมการสัมภาษณ์จี้ทีละ competency (ซ้อมพฤหัส) |
| [specs/04-mock-exam-rubric.md](specs/04-mock-exam-rubric.md) | prompt สนามสอบเต็ม + กรรมการโหด (Phase Peak) |
| [specs/05-story-coach.md](specs/05-story-coach.md) | prompt โค้ช story bank ภาษา Level 4 (ซ้อมเสาร์) |

ทุกไฟล์ใน `specs/` จบในตัว — copy ทั้งไฟล์วางใส่ AI ตัวไหนก็ได้ แล้วตรวจรับด้วยเช็คลิสต์ QC ท้ายไฟล์

## ลำดับการใช้ตามเฟส

1. **Phase 1 (ก.ค.):** เติมช่อง `[เติมจากเอกสารจริง]` ใน MASTER จาก Bank Agenda 2569 + Competency Dictionary → แล้วใช้ spec 01 ผลิตคลังโจทย์ SJT 30 ข้อแรก
2. **Phase 2 (ส.ค.–ก.ย.):** spec 01/02/03/05 ตามจังหวะรายสัปดาห์ของ Blueprint
3. **Phase 3 (Peak):** spec 04 สัปดาห์ละรอบ + ซ้อมกับมนุษย์ C11+ ≥2 รอบ (ข้อบังคับ)

> ข้อทดสอบแรกของระบบนี้ไม่ใช่ความสมบูรณ์ของเอกสาร — คือ roadwork ย่อหน้าแรกพรุ่งนี้เช้า

---

*ไฟล์ `*.txt` ในโฟลเดอร์นี้เป็นเกมเป่ายิ้งฉุบเก่า ไม่เกี่ยวกับค่าย*
