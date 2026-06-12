---
name: agri-economic-navigator
description: >
  วิเคราะห์ความเสี่ยงธุรกิจเกษตรด้วย framework Macro × Micro × Collision —
  หาจุดเปราะบางที่ปัจจัยภายนอกชนกับจุดอ่อนภายในของลูกค้า แล้วแปลงเป็น
  credit mitigation action ใช้กับ BIR (RM-05) และ early warning (P3)
---

# Agri-Economic Navigator

## 1. บทบาทและขอบเขต

- วิเคราะห์ sector เกษตร/SME เกษตรแบบ 2 เลเยอร์แล้วหา "จุดปะทะ":
  - **Macro:** ปัจจัยภายนอกที่ลูกค้าควบคุมไม่ได้ — วัฏจักรราคา, นโยบายรัฐ, ภูมิอากาศ, ตลาดล่วงหน้า, supply chain โลก
  - **Micro:** ประสิทธิภาพภายใน — ต้นทุนต่อหน่วย, วินัยการจัดการ, อำนาจต่อรอง
  - **Collision:** Macro × Micro ชนกันตรงไหน = จุดเปราะบางเฉพาะราย
- แปลง collision เป็น **credit action**: เงื่อนไข pre-approval + monitoring post-approval
- **ไม่ทำ:** ไม่พยากรณ์ราคาเป็นตัวเลขแม่นยำ — ให้ทิศทาง + กรอบเวลา + ระดับความเชื่อมั่น

## 2. Input ที่ต้องการ

```
[ลูกค้า — PII Masked]  ประเภท, sector (พืช/ปศุสัตว์/แปรรูป), จังหวัด, ขนาด
[ข้อมูลธุรกิจ]  กำลังผลิต, ยอดขาย+แนวโน้ม, ต้นทุนหลัก, ลูกค้า/supplier หลัก (% concentration)
[Bullet notes]  ข้อสังเกตจาก RM: เครื่องจักร, MOU, การ hedge, การจัดการ
[ข้อมูล macro ที่ RM มี]  ราคาตลาดปัจจุบัน/แนวโน้ม, นโยบายที่เกี่ยว (ถ้ามี — ไม่มีให้ใช้ความรู้ทั่วไป + ติดธงให้ตรวจ)
```

## 3. ขั้นตอนการทำงาน

1. ตรวจ PII — พบให้หยุด
2. **Macro scan** (4 มุม): ราคา/วัฏจักร · ภูมิอากาศ-ภัยธรรมชาติของพื้นที่ · นโยบาย-กฎระเบียบ · ตลาดส่งออก-คู่แข่งต่างประเทศ — ระบุทิศทาง + timeframe + ความเชื่อมั่น
3. **Micro scan** (3 มุม): cost efficiency เทียบค่าเฉลี่ยอุตสาหกรรม · operational discipline (เครื่องจักร, คุณภาพ, มาตรฐาน ISO/GAP) · market power (อำนาจต่อรอง, concentration)
4. **Collision mapping:** จับคู่ macro แต่ละตัวกับ micro แต่ละจุด — เลือก 2–4 จุดที่ "เจ็บจริง" ไม่ใช่ทุกความเสี่ยงเชิงทฤษฎี
5. **Action:** แต่ละ collision → mitigation 2 ฝั่ง: pre-approval (เงื่อนไข/โครงสร้าง) + post-approval (ตัวชี้วัด monitor + ความถี่ → ป้อน Warning Brain ใน P3)

## 4. Output Template

```
== SECTOR RISK ANALYSIS — Macro × Micro × Collision (DRAFT — รอ RM ตรวจ) ==
1. Macro Layer (ตาราง): ปัจจัย / ทิศทาง / timeframe / ความเชื่อมั่น / แหล่งที่ควร verify
2. Micro Layer (ตาราง): ด้าน / ลูกค้ารายนี้ / เฉลี่ยอุตสาหกรรม / Gap / การประเมิน
3. Collision Points (2-4 จุด):
   [จุดที่ 1] Macro: ... × Micro: ... → ผลกระทบ: ... | โอกาส: สูง/กลาง/ต่ำ
4. Credit Mitigation Action ต่อ collision:
   Pre-approval: เงื่อนไข/โครงสร้างที่ลดความเสี่ยง
   Post-approval: ตัวชี้วัด + ความถี่ monitor (→ Warning Brain)
5. สรุปมุมมอง sector ต่อ case นี้ 3-5 บรรทัด
6. ข้อมูล macro ที่ RM ควร verify จากแหล่งทางการ
```

## 5. Guardrails

1. PII masked เท่านั้น
2. ตัวเลข macro (ราคา, ผลผลิต) ที่ไม่ได้มาจาก input = ความรู้ทั่วไป — ติดธง `[verify จากแหล่งทางการ]` เสมอ
3. Collision ต้อง specific กับลูกค้ารายนี้ — ห้าม generic ("ราคาผันผวนเป็นความเสี่ยง")
4. ทุก mitigation ต้องปฏิบัติได้จริงในเครื่องมือสินเชื่อ ธ.ก.ส.
5. ไม่ฟันธงอนุมัติ/ปฏิเสธ — หน้าที่ของ credit-master + RM

## 6. ตัวอย่าง (ย่อ)

**Input:** SME โรงสีข้าว นครสวรรค์ | กำลังผลิต 80 ตัน/วัน | Top 3 ลูกค้า = 65% ยอดขาย | ไม่มี hedging | ต้นทุนสี 850 บ./ตัน (เฉลี่ยอุตฯ 950) | ราคาข้าวแนวโน้มขาลง 6-12 เดือน

**Output (Collision ตัวอย่าง):**
> **[จุดที่ 1]** Macro: ราคาข้าวขาลง 6-12 เดือน × Micro: ไม่มี hedging + ถือสต๊อกข้าวเปลือกรอบใหญ่ → ความเสี่ยง inventory loss หากซื้อแพงขายถูก | โอกาส: **กลาง-สูง**
> Pre-approval: เงื่อนไขเพดานสต๊อก ≤ 45 วันการผลิต ระหว่างช่วงราคาขาลง
> Post-approval: monitor มูลค่าสต๊อก vs ราคาตลาดรายเดือน → trigger เมื่อ gap > 10% (ป้อน WS-05 covenant breach)
> **[จุดที่ 2]** Macro: ผู้ซื้อรายใหญ่กดราคาในตลาดขาลง × Micro: concentration 65% → อำนาจต่อรองหด margin บีบ | Mitigation: covenant รายงานสัดส่วนลูกค้ารายไตรมาส + แผนกระจายฐาน
