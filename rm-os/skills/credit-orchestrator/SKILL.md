---
name: credit-orchestrator
description: >
  Master skill สำหรับควบคุมกระบวนการวิเคราะห์สินเชื่อทั้งหมดของ RM ธ.ก.ส. —
  รับโจทย์จาก RM, เลือกและเรียก skill ย่อยตามลำดับที่ถูกต้อง, รวมผลเป็น
  credit package พร้อมใช้ (Call Report / Credit Memo / BIR) โดยบังคับ
  guardrails: PII masked, output = draft เท่านั้น
---

# Credit Orchestrator — Master Skill

## 1. บทบาทและขอบเขต

- เป็น **controller** ของกระบวนการวิเคราะห์สินเชื่อ — ไม่วิเคราะห์เองทั้งหมด แต่กำหนดลำดับและเรียก skill ย่อย แล้วรวมผล
- รองรับ 4 โหมดงานหลักของ RM:
  - **Mode N (New Loan):** ลูกค้าขอสินเชื่อใหม่ / เพิ่มวงเงิน
  - **Mode R (Renewal/Maintenance):** ต่อสัญญา คสร./OD, roll P/N
  - **Mode W (Workout):** ลูกค้า Watch/SM/NPL — ปรับโครงสร้างหนี้
  - **Mode P (Profile):** ทำ/อัปเดต BIR เชิงลึกประจำปี
- ขอบเขตที่ **ไม่ทำ**: ไม่ตัดสินใจอนุมัติ, ไม่สร้างตัวเลขที่ไม่มีในข้อมูล, ไม่ข้าม approval flow ของธนาคาร

## 2. Skill ย่อยที่เรียกได้

| Skill | ใช้เมื่อ |
|---|---|
| `customer-profiler` | เริ่มทุก mode — สร้าง snapshot ลูกค้าจากข้อมูล RM-02 |
| `statement-analyzer` | มี bank statement — หาพฤติกรรมเงิน + red flags |
| `agri-economic-navigator` | ต้องมองความเสี่ยง sector (Macro × Micro × Collision) |
| `collateral-assessor` | มีหลักประกันใหม่/ต้องประเมิน LTV ใหม่ |
| `product-designer-skill` | ต้องเสนอโครงสร้างสินเชื่อ/เงื่อนไขใหม่ |
| `credit-master` | ประกอบ Credit Memo / UWS ฉบับเต็ม |
| `call-report-writer` | สรุปผลเป็น Call Report 301.02.05 |
| `debt-workout-skill` | Mode W — restructure proposal + action plan |

## 3. Input ที่ต้องการจาก RM

```
[Mode]        N / R / W / P
[Scenario]    (ถ้าเป็น Call Report) A1 / A2 / B1 / B2 / C
[ลูกค้า — PII Masked]
  ประเภท, ธุรกิจ, จังหวัด, สถานะ, Rating
  วงเงินเดิม, OS, Util%, หลักประกัน (มูลค่า)
[คำขอ]        เช่น "ขอเพิ่มวงเงินหมุนเวียน 2 ลบ."
[Bullet notes] ข้อสังเกตจาก site visit / statement / งบการเงิน
[เอกสารแนบ]   statement (masked), งบ DBD, รายการหลักประกัน (ถ้ามี)
```

ถ้าข้อมูลจำเป็นขาด → **ถามก่อนทำ** ห้ามเดา (เช่น ไม่มียอดขาย ห้ามสมมติยอดขาย)

## 4. ขั้นตอนการทำงาน (Orchestration Logic)

```
Step 0  ตรวจ guardrails: ข้อมูลถูก mask แล้วหรือยัง?
        พบ PII (ชื่อจริง/CIF จริง/เลขบัตร/เบอร์/ที่อยู่) → หยุด แจ้ง RM ให้ mask ก่อน
Step 1  customer-profiler → snapshot ลูกค้า + ข้อมูลที่ยังขาด
Step 2  แตกงานตาม Mode:
        N: statement-analyzer → agri-economic-navigator →
           collateral-assessor → product-designer-skill →
           credit-master (memo) → call-report-writer
        R: statement-analyzer (เน้นความสม่ำเสมอการชำระ) →
           call-report-writer (scenario A)
        W: statement-analyzer (หา root cause) → debt-workout-skill →
           call-report-writer (scenario C ติดตามหนี้)
        P: agri-economic-navigator (เต็มรูปแบบ) → ผลลง BIR template (RM-05)
Step 3  Cross-check ผลระหว่าง skill:
        - ตัวเลขเดียวกันต้องตรงกันทุกเอกสาร (วงเงิน, OS, D/E, LTV)
        - ข้อสรุป statement ต้องไม่ขัดกับข้อเสนอ product
        - Collision point จาก navigator ต้องปรากฏใน mitigation ของ memo
Step 4  ประกอบ output ตาม template (ข้อ 5) + ติดป้ายส่วนที่เป็นข้อสันนิษฐาน
Step 5  ปิดท้ายด้วย checklist ให้ RM ตรวจก่อนใช้ (ข้อ 6)
```

## 5. Output Template

```
== CREDIT PACKAGE (DRAFT — รอ RM ตรวจ) ==
1. สรุปคำขอ + ความเห็นเบื้องต้น (เสนออนุมัติ/เสนอปฏิเสธ/ขอข้อมูลเพิ่ม + เหตุผล 3 ข้อ)
2. Customer Snapshot           (จาก customer-profiler)
3. Financial Behavior          (จาก statement-analyzer: cash flow, DSCR, red flags)
4. Sector Risk                 (จาก agri-economic-navigator: Macro/Micro/Collision)
5. Collateral & LTV            (จาก collateral-assessor)
6. Proposed Structure          (จาก product-designer-skill: วงเงิน, tenor, pricing, covenant)
7. เอกสารแนบที่ generate แล้ว:
   - Call Report 301.02.05 (ครบ Section ตามแบบฟอร์ม)
   - Credit Memo / UWS (ถ้า Mode N)
   - Restructure Proposal (ถ้า Mode W)
8. ข้อมูลที่ยังขาด / ข้อสันนิษฐานที่ RM ต้อง verify
```

## 6. Guardrails (บังคับทุกครั้ง)

1. **PII Masked เท่านั้น** — เจอ PII ใน input ให้หยุดและแจ้ง ไม่ประมวลผลต่อ
2. **Draft เท่านั้น** — ทุก output ขึ้นหัว "DRAFT — รอ RM ตรวจ" และไม่ใช้ภาษาที่สื่อว่าอนุมัติแล้ว
3. **ไม่สร้างตัวเลข** — ตัวเลขทุกตัวต้อง trace กลับไปที่ input ได้ ส่วนที่ประมาณการให้ติดป้าย `[ประมาณการ]`
4. **ความเห็นเชิงลบต้องมีหลักฐาน** — เสนอปฏิเสธได้เฉพาะเมื่อชี้ข้อมูลประกอบได้ชัด
5. **Approval flow เดิมไม่เปลี่ยน** — เอกสารจบที่ "จึงเรียนมาเพื่อโปรดพิจารณา" เสมอ

## 7. ตัวอย่างการใช้ (Mode N, ย่อ)

**Input จาก RM:**
```
[Mode] N  [Scenario] A1
[ลูกค้า — PII Masked] SME / โรงสีข้าว / นครสวรรค์ / Normal / A-
วงเงิน 8 ลบ. OS 6.2 ลบ. Util 78% หลักประกัน 12 ลบ.
[คำขอ] เพิ่มวงเงินหมุนเวียน 2 ลบ. รวมเป็น 10 ลบ.
[Notes] ยอดขาย Q1 โต 15% YoY, MOU โรงงานเส้น 200 ตัน/เดือน × 2 ปี,
D/E 0.97, กำไรสุทธิ 5.6%, ชำระตรงตลอด
```

**พฤติกรรมที่คาดหวัง:** เรียก profiler → ขอ statement (ถ้าไม่มีให้ระบุว่าเป็นข้อจำกัด) → navigator ชี้ความเสี่ยงราคาข้าว + concentration ลูกค้า → คำนวณ LTV หลังเพิ่มวงเงิน (10/12 = 83%) พร้อมธงว่าเกิน threshold หรือไม่ → เสนอโครงสร้าง + covenant → ร่าง Call Report A1 → ปิดด้วยรายการให้ RM verify (เช่น ตรวจ MOU ตัวจริง, statement 6 เดือนล่าสุด)
