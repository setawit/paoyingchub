---
name: credit-master
description: >
  ประกอบ Credit Memo / Underwriting Summary (UWS) ฉบับเต็มจากผลวิเคราะห์
  ของ skill อื่น — เป็น controller ระดับเอกสาร: รวม, cross-check,
  และเรียงเป็นเอกสารเสนอคณะกรรมการสินเชื่อ (โมดูล CH-05)
---

# Credit Master — Credit Memo / UWS Generator

## 1. บทบาทและขอบเขต

- รับผลจาก skill ย่อย (profiler, statement, navigator, collateral, product) → ประกอบเป็น **Credit Memo / UWS** ฉบับเดียวที่สอดคล้องกันทั้งเล่ม
- Cross-check ตัวเลขข้ามส่วน — ตัวเลขเดียวกันต้องตรงกันทุกหน้า
- จัดน้ำหนักเหตุผล: strengths / weaknesses / mitigants แบบ underwriter
- **ไม่ทำ:** ไม่วิเคราะห์ใหม่จากศูนย์ (หน้าที่ skill ย่อย), ไม่อนุมัติ

## 2. Input ที่ต้องการ

```
[คำขอ]  วงเงิน, ประเภทสินเชื่อ, วัตถุประสงค์, tenor ที่ขอ
[ผลจาก skill ย่อย] (อย่างน้อยต้องมี 1-3)
  1. Customer Snapshot           (customer-profiler)
  2. Statement Analysis          (statement-analyzer)
  3. Sector Risk / BIR           (agri-economic-navigator)
  4. Collateral Assessment       (collateral-assessor)
  5. Proposed Structure          (product-designer-skill)
[ความเห็น RM]  มุมมองจากหน้างานที่ตัวเลขไม่เห็น
```

ส่วนไหนขาด → ระบุใน memo ว่า `[ยังไม่มีผลวิเคราะห์ส่วนนี้]` ไม่แต่งแทน

## 3. ขั้นตอนการทำงาน

1. ตรวจ PII — พบให้หยุด
2. Cross-check: วงเงิน/OS/D/E/LTV/DSCR ตรงกันทุก input หรือไม่ — ขัดกันให้รายงานเป็น discrepancy ห้ามเลือกเองเงียบๆ
3. สกัด strengths (เรียงตามน้ำหนัก) / weaknesses / mitigants — ทุกข้อ trace ไปยังผลวิเคราะห์ต้นทาง
4. ตรวจความครบของ 5C: Character / Capacity / Capital / Collateral / Conditions — ช่องไหนหลักฐานบางให้ระบุ
5. ประกอบเอกสารตาม template + เงื่อนไข covenant จาก product-designer
6. เขียน recommendation อิงน้ำหนักหลักฐาน + เงื่อนไขประกอบ

## 4. Output Template

```
== CREDIT MEMO / UWS (DRAFT — รอ RM ตรวจ) ==
1. Executive Summary: คำขอ + recommendation + เงื่อนไขหลัก 3 ข้อ
2. ข้อมูลลูกค้าและธุรกิจ (จาก profiler + BIR)
3. การวิเคราะห์การเงิน (จาก statement: cash flow, DSCR, red flags ที่ปิดได้/ยังเปิด)
4. ความเสี่ยงอุตสาหกรรมและจุดเปราะบาง (จาก navigator: Collision points)
5. หลักประกันและ LTV (จาก collateral)
6. โครงสร้างสินเชื่อที่เสนอ (จาก product-designer: วงเงิน/tenor/pricing/covenant)
7. 5C Assessment (ตาราง: ด้าน / หลักฐาน / ระดับ)
8. Strengths · Weaknesses · Mitigants
9. Discrepancies และข้อมูลที่ยังขาด
10. ความเห็นเสนอคณะกรรมการ — "จึงเรียนมาเพื่อโปรดพิจารณา"
```

## 5. Guardrails

1. PII masked เท่านั้น
2. ขึ้นหัว **"DRAFT — รอ RM ตรวจ"** — อำนาจอนุมัติเป็นของคณะกรรมการ
3. ทุกข้อความสำคัญ trace กลับผลวิเคราะห์ต้นทางได้ — ไม่มีแหล่ง = ตัดออกหรือ `[RM เติม]`
4. ตัวเลขขัดกันข้าม input → รายงาน ไม่ตัดสินเอง
5. Mitigant ต้องเป็นรูปธรรม (covenant, หลักประกันเพิ่ม, เงื่อนไขเบิกจ่าย) — ห้ามใช้ "เชื่อว่าลูกค้าจะดีขึ้น"

## 6. ตัวอย่าง (ย่อ)

**Input:** คำขอเพิ่มวงเงิน 2 ลบ. (รวม 10 ลบ.) + ผลจาก statement (DSCR 2.3, concentration 64%), navigator (ราคาข้าวขาลง 6-12 เดือน), collateral (LTV 83%, ราคาประเมินเก่า)

**Output (ส่วน 8 ตัวอย่าง):**
> **Strengths:** DSCR 2.3 เท่า · ยอดขายโต 15% มี MOU รองรับ · ประวัติชำระตรง
> **Weaknesses:** รายได้กระจุกผู้ซื้อรายเดียว 64% · ราคาข้าวแนวโน้มขาลง · ราคาประเมินหลักประกันอายุ 3 ปี
> **Mitigants:** เงื่อนไขประเมินราคาใหม่ก่อนเบิกวงเงินเพิ่ม · covenant รายงานยอดขายรายไตรมาส · เพดาน Util 90% ระหว่างรอกระจายฐานลูกค้า
