# Call Report Agent — Design Document
## ระบบช่วยเขียน Call Report ธ.ก.ส. 301.02.05 บน Microsoft Copilot

---

## 1. ภาพรวม

| รายการ | รายละเอียด |
|--------|-----------|
| **Platform** | Microsoft Copilot Studio (M365 Copilot) |
| **Form มาตรฐาน** | แบบ 301.02.05 Full Form |
| **ผู้ใช้หลัก** | RM (Relationship Manager), พนักงานสินเชื่อ |
| **Trigger** | มีเคสเยี่ยมลูกค้า / ติดตามหนี้ / เสนอสินเชื่อ |
| **Output** | Draft Call Report ครบ 9 หัวข้อ พร้อม Action Items |

---

## 2. Scenarios ที่รองรับ

| Code | สถานการณ์ | ต้นทางข้อมูล |
|------|-----------|-------------|
| **A1** | ลูกค้าเดิม → เสนออนุมัติ | CIF จาก RM-02 |
| **A2** | ลูกค้าเดิม → ปฏิเสธ | CIF จาก RM-02 |
| **B1** | ลูกค้าใหม่ → เสนออนุมัติ | เลขบัตร ปชช./นิติบุคคล |
| **B2** | ลูกค้าใหม่ → ปฏิเสธ | เลขบัตร ปชช./นิติบุคคล |

---

## 3. สถาปัตยกรรม Agent

```
┌─────────────────────────────────────────────────────────┐
│                   RM (ผู้ใช้งาน)                         │
│         พิมพ์ใน Teams / Word / Copilot Chat             │
└────────────────────┬────────────────────────────────────┘
                     │ trigger phrase
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Copilot Studio Agent                        │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │  Topic 1    │   │  Topic 2     │   │  Topic 3    │  │
│  │  ระบุเคส   │──▶│ เก็บข้อมูล  │──▶│  สร้าง     │  │
│  │  Scenario   │   │  ลูกค้า     │   │  Draft      │  │
│  └─────────────┘   └──────────────┘   └─────────────┘  │
│                          │                    │          │
│                          ▼                    ▼          │
│                  ┌──────────────┐   ┌─────────────────┐ │
│                  │  Action:     │   │  Topic 4        │ │
│                  │  Lookup RM-02│   │  Review & Export│ │
│                  └──────────────┘   └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
              Draft Call Report
              (ภาษาราชการ ครบ 9 หัวข้อ)
```

---

## 4. โครงสร้าง Call Report 9 หัวข้อ (ตาม Form 301.02.05)

```
HEADER
  ├── เรียน / เพื่อ (ทราบ / พิจารณา / สั่งการ)
  ├── วันที่เริ่มติดต่อ / วันที่เข้าพบ
  ├── ครั้งที่ / ลูกค้าเป้าหมาย (เดิม/ใหม่) / ผู้แนะนำ
  └── ข้อมูลลูกค้า (ชื่อ / ที่อยู่ / เบอร์ / อีเมล / ประเภทธุรกิจ)

BODY
  1. ข้อมูลทั่วไปและความเป็นมาของธุรกิจ
  2. ลักษณะของการดำเนินธุรกิจ
  3. วิเคราะห์ผลการดำเนินงานที่ผ่านมา
  4. วัตถุประสงค์และความจำเป็นครั้งนี้
  5. ประวัติการติดต่อกับธนาคารและสถาบันการเงินอื่น (ตาราง CSR)
  6. หลักประกันที่เสนอ
  7. คุณสมบัติผู้ขอสินเชื่อ
  8. สรุปความเห็น RM
  9. เรื่องที่ต้องติดตาม

SIGN-OFF
  └── ลายเซ็น RM / ผช.ฝ่าย / รองฝ่าย / ผอ.ฝ่าย (เว้นว่าง)
```

---

## 5. Conversation Flow (Topics ใน Copilot Studio)

### Topic 1 — ระบุเคส (Trigger & Scenario)

```
Trigger phrases:
  "เขียน call report"  |  "ร่างรายงานเข้าพบ"  |  "บันทึกเยี่ยมลูกค้า"
  "ติดตามหนี้"  |  "draft รายงาน RM"  |  "เสนอสินเชื่อ"

Bot ถาม:
  "ลูกค้ารายนี้เป็น รายเดิม หรือ รายใหม่ ครับ?"
  → [รายเดิม] → ถาม CIF / เลขที่ลูกค้า → ดึงข้อมูลจาก RM-02
  → [รายใหม่] → ถาม ชื่อ / เลขบัตร ปชช. หรือ เลขนิติบุคคล

  "จุดประสงค์การเข้าพบครั้งนี้คืออะไรครับ?"
  → [เสนอสินเชื่อ/เพิ่มวงเงิน] → Scenario A1 หรือ B1
  → [ติดตามหนี้/แจ้งผลปฏิเสธ] → Scenario A2 หรือ B2
```

---

### Topic 2 — เก็บข้อมูลลูกค้าและการเข้าพบ

```
ชุดคำถาม 1 — Header Info (ถามพร้อมกัน):
  • เข้าพบเมื่อวันที่? (วัน/เดือน/ปี พ.ศ.)
  • ครั้งที่เท่าไหร่?
  • เจ้าหน้าที่ธนาคารที่ไปด้วย? (ชื่อ/ตำแหน่ง)
  • มีผู้แนะนำลูกค้าไหม?

ชุดคำถาม 2 — Business Notes (ถามเป็น bullet):
  Bot: "เล่าสรุปสิ่งที่พบจากการเยี่ยมได้เลยครับ
        เช่น สถานการณ์ธุรกิจ / ปัญหาที่พบ / สิ่งที่ลูกค้าขอ
        พิมพ์เป็น bullet หรือพูดสรุปก็ได้"
  → รับ free-text หรือ bullet notes

ชุดคำถาม 3 — Financial Info (ถ้ายังไม่ได้จาก RM-02):
  • วงเงินที่ขอ / วงเงินเดิม?
  • ยอดหนี้คงเหลือ (OS)?
  • หลักประกันมีอะไร / มูลค่าเท่าไหร่?
  • ผลประกอบการล่าสุด (ถ้ามี)?

ชุดคำถาม 4 — Action Items:
  • มีเรื่องที่ต้องติดตามอะไรบ้าง?
  • Deadline แต่ละเรื่องคือวันไหน?
```

---

### Topic 3 — สร้าง Draft (Generate)

```
Bot รวบรวมข้อมูลทั้งหมด → เรียก Prompt Template → ส่งให้ LLM generate

Output ที่แสดง:
  ✅ Draft Call Report ครบ 9 หัวข้อ (ภาษาราชการ)
  ✅ ตาราง CSR หนี้ (ถ้ามีข้อมูลวงเงิน)
  ✅ Action Items table (# | Action | ผู้รับผิดชอบ | Deadline)
  ⚠️  ส่วนที่ขาดข้อมูล → แสดง [กรุณาระบุ]

Bot ถาม: "ต้องการแก้ไขส่วนไหน หรือ export เป็น Word ได้เลยครับ?"
```

---

### Topic 4 — Review & Export

```
Options:
  [แก้ไขส่วนที่ X]   → Bot รับ correction → regenerate เฉพาะ section
  [Export Word]      → สร้างไฟล์ .docx ตาม format 301.02.05
  [Copy Draft]       → copy ทั้งหมดไว้วางใน Word เอง
  [บันทึกลง RM-03]   → save กลับเข้า Excel prototype (ถ้า connect)
```

---

## 6. Prompt Templates

### 6A — Copilot M365 Version (สั้น, structured)
*ใช้ใน Word Copilot / Teams Copilot / BizChat*

```
ช่วยร่าง Call Report ตามแบบฟอร์ม ธ.ก.ส. 301.02.05 จากข้อมูลด้านล่าง

[METADATA]
Scenario: {{scenario}}          (A1/A2/B1/B2)
ครั้งที่: {{visit_number}}
วันที่เข้าพบ: {{visit_date}}    (พ.ศ.)
เจ้าหน้าที่: {{rm_name}} / {{rm_position}}
Intent: {{intent}}              (เสนออนุมัติ / ปฏิเสธ / ติดตาม)

[ข้อมูลลูกค้า]
ชื่อ: {{customer_name}} (PII Masked ถ้าจำเป็น)
ประเภท: {{customer_type}}     (บุคคล / SME / นิติบุคคล)
ธุรกิจ: {{business_type}}
จังหวัด: {{province}}
ลูกค้า: {{customer_category}}  (รายเดิม/รายใหม่)

[ข้อมูลสินเชื่อ — ถ้ามี]
วงเงินเดิม: {{existing_limit}} ล้านบาท
วงเงินที่ขอ: {{requested_limit}} ล้านบาท
OS (หนี้คงเหลือ): {{outstanding}} ล้านบาท
Utilization: {{utilization}}%
หลักประกัน: {{collateral}} มูลค่า {{collateral_value}} ล้านบาท
สถานะสินเชื่อ: {{credit_status}}  (Normal / Special Mention / NPL)

[Bullet Notes จากการเยี่ยม]
{{visit_notes}}

[ขอให้เขียน 9 หัวข้อ — ภาษาทางการ กระชับ ตรงประเด็น]
1. ข้อมูลทั่วไปและความเป็นมาของธุรกิจ (3-5 บรรทัด)
2. ลักษณะของการดำเนินธุรกิจ (3-5 บรรทัด)
3. วิเคราะห์ผลการดำเนินงานที่ผ่านมา (3-5 บรรทัด)
4. วัตถุประสงค์และความจำเป็นครั้งนี้ (2-3 บรรทัด)
5. ประวัติการติดต่อกับธนาคารและสถาบันการเงินอื่น (ตาราง)
6. หลักประกันที่เสนอ (2-3 บรรทัด)
7. คุณสมบัติผู้ขอสินเชื่อ (ระบุข้อบังคับที่เข้าข่าย)
8. สรุปความเห็น RM (3-5 บรรทัด — {{intent}})
9. เรื่องที่ต้องติดตาม (bullet list พร้อม deadline)

กฎ: ใช้ปีพุทธศักราช (พ.ศ.) เสมอ / ตัวเลขตามที่ได้รับเท่านั้น /
     ส่วนที่ไม่มีข้อมูลใส่ [กรุณาระบุ] / ไม่ใช้ภาษาพูด
```

---

### 6B — Copilot (Claude-style) Version (ละเอียดกว่า, เรียก skill ได้)
*ใช้เมื่อต้องการ draft คุณภาพสูงขึ้น*

```
ใช้ skill call-report-writer เขียน Call Report เต็มรูปแบบ ธ.ก.ส. 301.02.05

[Mode] {{scenario}} — {{intent}}

[ข้อมูลลูกค้า]
- ประเภท: {{customer_type}} / {{business_type}} / จ.{{province}}
- สถานะลูกค้า: {{customer_category}}
{{#if existing_customer}}
- เป็นลูกค้า ธ.ก.ส. ตั้งแต่ปี {{customer_since}}
- วงเงินเดิม: {{existing_limit}} ล้านบาท | OS: {{outstanding}} ล้านบาท
- Util: {{utilization}}% | Rating: {{credit_rating}} | สถานะ: {{credit_status}}
- หลักประกัน: {{collateral_value}} ล้านบาท (LTV {{ltv}}%)
{{/if}}

[ข้อมูลการเงิน — งบล่าสุด ถ้ามี]
- รายได้: {{revenue}} ล้านบาท ({{revenue_growth}}% YoY)
- กำไรสุทธิ: {{profit_margin}}% margin
- D/E: {{de_ratio}}

[Bullet Notes จากการเยี่ยม]
{{visit_notes}}

[ขอเขียน]
- 9 หัวข้อตาม form มาตรฐาน (ภาษาทางการ)
- Section 5: ตาราง CSR ถ้ามีข้อมูลวงเงิน
- Section 8: สรุปความเห็น {{intent}} พร้อมเหตุผล 3 ข้อ
- Section 9: bullet เรื่องต้องติดตาม + deadline

[หลังร่างเสร็จ]
- ตรวจความเสี่ยงที่อาจถูก ผช./รอง/ผอ. ค้าน
- เสนอ counter-argument ล่วงหน้าถ้ามีประเด็นเสี่ยง
```

---

### 6C — Quick Template (สำหรับเคสง่ายๆ ไม่มีข้อมูลมาก)
*RM พิมพ์สั้นๆ แล้ว expand เอง*

```
ร่าง Call Report จากข้อมูลนี้:
- ลูกค้า: {{customer_name}} / {{business_type}} / จ.{{province}}
- เข้าพบ: {{visit_date}} (ครั้งที่ {{visit_number}})
- จุดประสงค์: {{purpose}}
- สรุปสิ่งที่พบ:
  {{visit_notes}}

ร่างให้ครบ 9 หัวข้อตาม form ธ.ก.ส. 301.02.05
ส่วนไหนไม่มีข้อมูลใส่ [กรุณาระบุ]
```

---

## 7. Agent System Prompt (Instructions สำหรับ Copilot Studio)

```
คุณคือผู้ช่วยเขียน Call Report ของ ธ.ก.ส. (ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร)

บทบาทของคุณ:
- ช่วย RM เขียน Draft Call Report แบบ Full Form 301.02.05
- รับข้อมูลดิบ (bullet notes / free-text) แล้วแปลงเป็นรายงานราชการ
- ถามข้อมูลที่ขาดอย่างมีระบบ ไม่ถามซ้ำ
- เขียนภาษาทางการ สุภาพ กระชับ ตามสไตล์ ธ.ก.ส.

กฎเหล็ก:
✅ ใช้ปีพุทธศักราช (พ.ศ.) เสมอ
✅ ตัวเลข/ข้อมูลตามที่ RM ให้เท่านั้น ห้ามสมมติ
✅ ส่วนที่ไม่มีข้อมูล → [กรุณาระบุ]
✅ ไม่ใช้ภาษาพูด / คำสแลง
✅ ตรวจสอบ CSR table ให้ครบทุก column ก่อน output
✅ วงเงิน/ตัวเลขทางการเงินต้องมีหน่วย (ล้านบาท/บาท)

หัวข้อบังคับ 9 ข้อตาม form 301.02.05:
1. ข้อมูลทั่วไปและความเป็นมาของธุรกิจ
2. ลักษณะของการดำเนินธุรกิจ
3. วิเคราะห์ผลการดำเนินงานที่ผ่านมา
4. วัตถุประสงค์และความจำเป็นครั้งนี้
5. ประวัติการติดต่อกับธนาคารและสถาบันการเงินอื่น
6. หลักประกันที่เสนอ
7. คุณสมบัติผู้ขอสินเชื่อ
8. สรุปความเห็น RM
9. เรื่องที่ต้องติดตาม

ข้อมูลขั้นต่ำก่อนเริ่มเขียน:
□ ชื่อลูกค้า / ประเภทธุรกิจ
□ วัตถุประสงค์การเข้าพบ
□ ชื่อเจ้าหน้าที่ ธ.ก.ส.
□ วันที่เข้าพบ / ครั้งที่
```

---

## 8. ข้อมูล Input ที่ต้องการ (Data Schema)

### 8.1 Header Data
| Field | Type | Source | Required |
|-------|------|--------|----------|
| `visit_date` | Date (พ.ศ.) | RM input | ✅ |
| `visit_number` | Integer | RM input | ✅ |
| `contact_start_date` | Date (พ.ศ.) | RM input | ✅ |
| `rm_name` | String | RM profile / input | ✅ |
| `rm_position` | String | RM profile | ✅ |
| `report_to` | String | RM input | ✅ |
| `purpose_type` | Enum (ทราบ/พิจารณา/สั่งการ) | RM input | ✅ |
| `customer_category` | Enum (เดิม/ใหม่) | RM input | ✅ |
| `referrer` | String | RM input | - |

### 8.2 Customer Data (ดึงจาก RM-02 หรือ RM กรอกเอง)
| Field | Type | Source | Required |
|-------|------|--------|----------|
| `cif_id` | String | RM-02 | ถ้าลูกค้าเดิม |
| `customer_name` | String | RM-02 / RM input | ✅ |
| `business_type` | String | RM-02 / RM input | ✅ |
| `address` | String | RM-02 / RM input | - |
| `phone` | String | RM-02 / RM input | - |
| `email` | String | RM-02 / RM input | - |

### 8.3 Credit Data
| Field | Type | Source |
|-------|------|--------|
| `existing_limit` | Decimal (ล้านบาท) | RM-02 |
| `outstanding` | Decimal (ล้านบาท) | RM-02 |
| `utilization` | Decimal (%) | calculated |
| `credit_status` | Enum | RM-02 |
| `credit_rating` | String | RM-02 |
| `collateral_value` | Decimal (ล้านบาท) | RM-02 / RM input |
| `ltv` | Decimal (%) | calculated |

### 8.4 Visit Notes (RM กรอกเอง)
| Field | Type |
|-------|------|
| `visit_notes` | Free-text / Bullet list |
| `financial_update` | Free-text (งบล่าสุด ถ้ามี) |
| `action_items` | List of {action, responsible, deadline} |
| `issues_found` | Free-text |

---

## 9. ตัวอย่าง Input → Output

### Input (RM พิมพ์):
```
เยี่ยมลูกค้าโรงสีข้าว อ.เมือง จ.นครสวรรค์ เมื่อ 12 มิ.ย. 68
ครั้งที่ 3 รายเดิม CIF 0020001
เจ้าหน้าที่: นายสมชาย / RM
จุดประสงค์: ขอเพิ่มวงเงินหมุนเวียน 2 ล้าน รวมเป็น 10 ล้าน
- ยอดขาย Q1 โต 15% YoY
- ขยายรับซื้อข้าวเหนียว มี MOU โรงงานอยุธยา 200 ตัน/เดือน
- D/E = 0.97 ชำระตรงตลอด
- หลักประกันเดิมพอ
ติดตาม: ลูกค้าส่ง statement ภายใน 20 มิ.ย. 68
```

### Output ที่ Agent สร้าง:

**วัตถุประสงค์ครั้งนี้**
เพื่อติดตามสถานการณ์ธุรกิจและรับทราบความต้องการของลูกค้าในการขอเพิ่มวงเงินสินเชื่อหมุนเวียนจากเดิม 8 ล้านบาท เป็น 10 ล้านบาท เพื่อรองรับการขยายปริมาณรับซื้อข้าวเหนียวตามสัญญา MOU กับโรงงานในจังหวัดพระนครศรีอยุธยา

**1. ข้อมูลทั่วไปและความเป็นมาของธุรกิจ**
ลูกค้าประกอบกิจการโรงสีข้าวในพื้นที่อำเภอเมือง จังหวัดนครสวรรค์ เป็นลูกค้าของธนาคารมาตั้งแต่ปี พ.ศ. 2562 มีประวัติการชำระหนี้ดีตลอดมา ปัจจุบันใช้วงเงินสินเชื่อหมุนเวียน 8 ล้านบาท และสินเชื่อระยะยาว 3 ล้านบาท รวมวงเงินทั้งสิ้น 11 ล้านบาท [กรุณาระบุ: ปีที่ก่อตั้ง / ทุนจดทะเบียน]

**[หัวข้อ 2-7 ...]**

**8. สรุปความเห็น RM**
จากการเข้าพบลูกค้า พบว่ากิจการมีทิศทางการเติบโตที่ชัดเจน โดยยอดขายไตรมาสที่ 1 ปี พ.ศ. 2568 เพิ่มขึ้นร้อยละ 15 เมื่อเทียบกับช่วงเดียวกันของปีก่อน อัตราส่วน D/E อยู่ที่ 0.97 อยู่ในระดับที่บริหารจัดการได้ และลูกค้ามีสัญญา MOU กับโรงงานในจังหวัดพระนครศรีอยุธยา ปริมาณ 200 ตันต่อเดือน ซึ่งรับประกันรายได้ระยะสั้น เห็นควรพิจารณาเสนออนุมัติเพิ่มวงเงินตามที่ขอ

**9. เรื่องที่ต้องติดตาม**
- ลูกค้าจัดส่ง Bank Statement ย้อนหลัง 6 เดือน ภายในวันที่ 20 มิถุนายน 2568
- [กรุณาระบุ: เรื่องติดตามอื่นๆ]

---

**Action Items:**
| # | Action | ผู้รับผิดชอบ | Deadline | สถานะ |
|---|--------|-------------|----------|-------|
| 1 | ส่ง Bank Statement ย้อนหลัง 6 เดือน | ลูกค้า | 20/06/68 | Pending |

---

## 10. Integration Points (สำหรับ Phase ถัดไป)

```
RM-02 (Excel/SharePoint)
  └── VLOOKUP CIF → ดึง customer data อัตโนมัติ
  └── ดึงข้อมูลวงเงิน / OS / Rating / หลักประกัน

SharePoint / OneDrive
  └── บันทึก Draft .docx
  └── เก็บ Call Report Log

Teams Channel
  └── notify Supervisor เมื่อ draft พร้อม review

Power Automate
  └── trigger approval flow (RM → ผช.ฝ่าย → รองฝ่าย → ผอ.ฝ่าย)
  └── export ไปยัง RM-03 Excel prototype
```

---

## 11. สิ่งที่ต้องสร้างใน Copilot Studio (Checklist สำหรับ Developer)

```
□ Agent Profile
  - ชื่อ / avatar / description
  - System prompt (ดู Section 7)

□ Topics (4 topics)
  - Topic 1: Trigger & Scenario detection
  - Topic 2: Data collection flow (branching by scenario)
  - Topic 3: Draft generation (call LLM with prompt template)
  - Topic 4: Review & Export options

□ Variables
  - scenario, visit_date, visit_number, rm_name
  - customer_name, business_type, province
  - existing_limit, outstanding, collateral_value
  - visit_notes (string, multi-line)
  - action_items (table/list)

□ Actions (Power Platform Connectors)
  - Lookup RM-02 data (Excel connector / SharePoint)
  - Save draft to OneDrive
  - Notify via Teams (optional Phase 2)

□ Prompt Templates
  - Template A: Copilot M365 version (Section 6A)
  - Template B: Extended version (Section 6B)
  - Template C: Quick version (Section 6C)

□ Knowledge Base
  - Form 301.02.05 structure reference
  - ธ.ก.ส. terminology guide
  - Quality rules (Section 7 กฎเหล็ก)
```

---

*Design Document Version 1.0 | ธ.ก.ส. Call Report Agent | มิถุนายน 2568*
