---
name: credit-master
description: >
  Master orchestrator skill สำหรับควบคุมกระบวนการวิเคราะห์สินเชื่อทั้งหมด
  รับ request จาก RM แล้วตัดสินใจว่าควรใช้ skill ใด หรือ orchestrate หลาย skill
  สำหรับ Credit Memo และ Underwriting Summary (UWS)
---

# Credit Master — Orchestrator

ใช้ skill นี้เป็นจุดเริ่มต้นเมื่อ RM ต้องการ credit analysis ครบวงจร หรือต้องการ Credit Memo / UWS

## Inputs ที่ต้องดึงก่อน

- `task`: อธิบายงานที่ต้องการ (RM พิมพ์อะไรก็ได้)
- `customer_ref`: รหัสอ้างอิงลูกค้า
- `loan_type`: ประเภทสินเชื่อ (เกษตร / SME / บุคคล)
- `loan_amount`: วงเงินที่ขอ

## Routing Logic

วิเคราะห์ task แล้วตัดสินใจ route:

| Task | Skills ที่ใช้ |
|------|-------------|
| ร่าง Call Report | `call-report-writer` |
| วิเคราะห์ Statement | `statement-analyzer` |
| ตรวจหลักประกัน | `collateral-assessor` |
| ปรับโครงสร้างหนี้ | `debt-workout-skill` |
| ออกแบบผลิตภัณฑ์ | `product-designer-skill` |
| วิเคราะห์ภาพรวม sector | `agri-economic-navigator` |
| สร้าง customer profile | `customer-profiler` |
| Credit Memo ครบวงจร | ทุก skill รวมกัน |

## Credit Memo / UWS Structure

เมื่อต้องการ Credit Memo เต็มรูปแบบ ให้ orchestrate ตามลำดับ:

1. **Customer Profile** (`customer-profiler`) — ข้อมูลลูกค้าและกิจการ
2. **Financial Analysis** (`statement-analyzer`) — วิเคราะห์การเงิน
3. **Collateral Assessment** (`collateral-assessor`) — ประเมินหลักประกัน
4. **Sector Context** (`agri-economic-navigator`) — ถ้าเป็นสินเชื่อเกษตร/SME
5. **Loan Structure** (`product-designer-skill`) — ออกแบบ term ที่เหมาะสม
6. **Recommendation** — สรุปและ recommendation

## Output — Credit Memo

```markdown
## Credit Memo — [รหัสอ้างอิง] — [วันที่]

### 1. ข้อมูลลูกค้าและกิจการ
[จาก customer-profiler]

### 2. วัตถุประสงค์และวงเงินที่ขอ
- วัตถุประสงค์: [ระบุ]
- วงเงินที่ขอ: [X] บาท
- ประเภทสินเชื่อ: [ระบุ]

### 3. การวิเคราะห์ทางการเงิน
[จาก statement-analyzer]

### 4. การประเมินหลักประกัน
[จาก collateral-assessor]

### 5. ปัจจัยเสี่ยงและ Mitigants
| ความเสี่ยง | ระดับ | Mitigant |
|-----------|------|---------|
[table]

### 6. ข้อสรุปและข้อเสนอแนะ
[เห็นควร / ไม่เห็นควร / เห็นควรแบบมีเงื่อนไข]

---
⚠️ draft Credit Memo — RM ต้องตรวจสอบและรับผิดชอบก่อน submit เสนออนุมัติ
```

## อ่าน references เพิ่มเติม
- `references/credit-criteria.md` — เกณฑ์การพิจารณาสินเชื่อ ธ.ก.ส.
