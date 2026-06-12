# 05 — Data Security & Compliance

## 1. Core Principles (Non-Negotiable)

1. **Data Masking บังคับ** — PII ไม่ออกจากระบบ ธ.ก.ส. ไม่ว่ากรณีใด
2. **AI Output = Draft เท่านั้น** — RM ต้องตรวจและรับผิดชอบก่อน sign-off
3. **Audit Trail ครบทุก transaction** — who/what/when/output
4. **ข้อมูลจริงอยู่ใน CBS** — RM-OS เป็น working layer ไม่ใช่ source of truth
5. **ห้ามใช้ข้อมูลลูกค้าจริงใน test/development**

## 2. Data Masking Strategy

### Phase 0–1 — Manual Masking
- RM mask ข้อมูลเองก่อนใส่ Claude Desktop/Copilot ตาม guideline + checklist
- Risk: human error — แต่ pilot scope จำกัด, monitorable

### Phase 2+ — Server-Side Masking
- Data Masking Service intercept ทุก request ก่อนส่ง LLM
- Mask: ชื่อ, CIF, เลขที่บัญชี, เลข ID, เบอร์โทร, ที่อยู่
- Unmask ตอน response เพื่อให้ RM เห็นข้อมูลจริง (mapping อยู่ใน session)
- Mapping **ไม่ persist เกิน session** — ลบทันทีที่จบ session

## 3. PII Masking Checklist (ใช้ตั้งแต่ Phase 0)

| ข้อมูล | วิธี mask | ตัวอย่าง |
|---|---|---|
| ชื่อบุคคล/นิติบุคคล | นามแฝง/ตัวอักษร | นายสมชาย → `Customer_A`, บจก. X → `กิจการ A (โรงสี)` |
| CIF | รหัสสมมติ | `0020001` → `CIF-xxx01` |
| เลขบัตร ปชช./นิติบุคคล | ตัด/แทนที่ | `1100400123456` → `ID-xxx01` |
| เลขที่บัญชี/สัญญา | รหัสสมมติ | → `สญ-xxx01` |
| เบอร์โทร / ที่อยู่ | ตัดออก เหลือจังหวัด | `081-234-5678` → ❌, เหลือ "จ.อยุธยา" |
| ตัวเลขการเงิน | **คงไว้ได้** (จำเป็นต่อการวิเคราะห์) | วงเงิน 8 ลบ., D/E 0.97 |

> Prototype ทุกไฟล์ทำตามแล้ว — เช่น Maintenance Tracker ใช้ `CIF-xxx01`, `สญ-xxx01` และ AI Input Helper ติดป้าย "[PII Masked]" ทุก prompt

## 4. Compliance Considerations

- **PDPA** — legitimate interest + data minimization principle
- **ธปท.** — guidelines ด้าน outsourcing IT services และ AI usage
- **ธ.ก.ส. internal** — Information Security Policy compliance
- **Anthropic ToS** — commercial use, data residency, training opt-out (no-train clause)

## 5. Audit Trail Requirements (P2+)

- ทุก AI request log: `user_id, session_id, timestamp, skill_name, input_hash, output_hash`
- Immutable storage (append-only)
- Retention ตามนโยบาย ธ.ก.ส. — ขั้นต่ำ 7 ปี สำหรับธุรกรรมการเงิน
- Access control: เฉพาะ Compliance + Internal Audit

## 6. Security Decision ที่ค้างอยู่ (จาก Open Items)

| ID | ประเด็น | Owner | Required By |
|---|---|---|---|
| O-03 | API key management strategy (Vault, rotation) | IT Security | Start of P2 |
| O-04 | SSO integration approach (SAML/OAuth/ADFS) | IT Identity | Start of P2 |
| O-06 | Masking algorithm: rule-based vs ML | IT + Data Privacy | Start of P2 |
| O-07 | Audit log retention period | Compliance + Internal Audit | Mid of P2 |
