---
name: product-designer-skill
description: >
  ออกแบบโครงสร้างสินเชื่อที่เหมาะสม รวมถึง true cost calculation, proposal,
  และ term sheet สำหรับลูกค้าแต่ละราย
  ใช้เมื่อ RM ต้องการหาโครงสร้างสินเชื่อที่ match กับความสามารถชำระของลูกค้า
---

# Product Designer Skill

ใช้ skill นี้เพื่อออกแบบโครงสร้างสินเชื่อ คำนวณ true cost และสร้าง proposal สำหรับเสนอลูกค้า

## Inputs ที่ต้องดึงก่อน

- `loan_purpose`: วัตถุประสงค์สินเชื่อ
- `amount_requested`: วงเงินที่ขอ (บาท)
- `monthly_cashflow`: กระแสเงินสดรายเดือน (บาท)
- `existing_debt_payment`: ภาระหนี้ที่มีอยู่/เดือน (บาท)
- `collateral_value`: มูลค่าหลักประกัน (บาท)
- `preferred_term`: ระยะเวลาที่ต้องการ (เดือน/ปี)
- `business_type`: ประเภทกิจการ

## การออกแบบโครงสร้างสินเชื่อ

### Step 1: คำนวณ Maximum Capacity
```
Available for debt = Monthly cashflow × (1 - DSR threshold 40%)
                   - Existing debt payments
Maximum monthly payment = Available for debt
```

### Step 2: คำนวณ True Cost
คำนวณและแสดง:
- อัตราดอกเบี้ยที่แท้จริง (EIR)
- ดอกเบี้ยรวมตลอดสัญญา
- ต้นทุนรวมทั้งหมด (เงินต้น + ดอกเบี้ย + ค่าธรรมเนียม)
- ยอดผ่อน/งวด

### Step 3: เสนอ Options
เสนอ 2-3 options เสมอ เพื่อให้ลูกค้าเลือก:
- Option A: วงเงินสูงสุด / งวดสูง / ระยะสั้น
- Option B: สมดุล (แนะนำ)
- Option C: งวดต่ำสุด / ระยะยาว

## Output format

```markdown
## Loan Structure Proposal — [รหัสอ้างอิง]

**ข้อมูลพื้นฐาน**
- วัตถุประสงค์: [ระบุ]
- ความสามารถชำระ/เดือน: ~[X] บาท

---

### Option A — [ชื่อ]
| รายการ | ค่า |
|--------|-----|
| วงเงิน | X บาท |
| ระยะเวลา | X ปี / X เดือน |
| งวดผ่อน/เดือน | X บาท |
| อัตราดอกเบี้ย | X% ต่อปี |
| ดอกเบี้ยรวม | X บาท |
| DSR | X% |

### Option B — [ชื่อ] ⭐ แนะนำ
[table]

### Option C — [ชื่อ]
[table]

**เหตุผลที่แนะนำ Option B**
[2-3 bullet]

---
⚠️ draft — อัตราดอกเบี้ยและเงื่อนไขต้องยืนยันกับ CBS ก่อนแจ้งลูกค้า
```

## อ่าน references เพิ่มเติม
- `references/rate-table.md` — ตารางอัตราดอกเบี้ยและค่าธรรมเนียม ธ.ก.ส.
