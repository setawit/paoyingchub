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

### Modes ที่ Agent รองรับ (ตาม skill call-report-writer)

| Mode | Trigger | Output |
|------|---------|--------|
| **DRAFT** | ข้อมูลดิบ / bullet / free-text | Call Report ฉบับร่าง ครบ 9 หัวข้อ |
| **EXPORT** | Draft ที่ review แล้ว | ไฟล์ .docx format 301.02.05 |
| **ANALYZE** | แนบ Call Report เดิม (PDF/text) | สรุปสถานะ + ประเด็นเสี่ยง + sentiment |
| **ACTION** | Call Report ใดก็ได้ | ตาราง Action Items + Deadline |

> Phase 1 ให้ build ครบทั้ง 4 modes — ANALYZE/ACTION ใช้ logic เบากว่า DRAFT มาก
> (เป็น prompt เดี่ยว ไม่ต้องมี data collection flow)

---

## 2. Scenarios ที่รองรับ

| Code | สถานการณ์ | ต้นทางข้อมูล |
|------|-----------|-------------|
| **A1** | ลูกค้าเดิม → เสนออนุมัติ | CIF จาก RM-02 |
| **A2** | ลูกค้าเดิม → ปฏิเสธ | CIF จาก RM-02 |
| **B1** | ลูกค้าใหม่ → เสนออนุมัติ | เลขบัตร ปชช./นิติบุคคล |
| **B2** | ลูกค้าใหม่ → ปฏิเสธ | เลขบัตร ปชช./นิติบุคคล |

**ผลของ Scenario ต่อเนื้อหารายงาน** (Copilot ต้อง branch ตามนี้):

| Scenario | Header "เพื่อ" | Section 8 โทนการเขียน |
|----------|---------------|----------------------|
| A1/B1 (เสนออนุมัติ) | พิจารณา | สรุปจุดแข็ง + เหตุผลสนับสนุน 3 ข้อ + เสนออนุมัติ |
| A2/B2 (ปฏิเสธ) | พิจารณา / ทราบ | ระบุข้อเท็จจริงที่ไม่ผ่านเกณฑ์อย่างเป็นกลาง ไม่ใช้ภาษาตำหนิ + เสนอทางเลือก (ถ้ามี เช่น ลดวงเงิน/เงื่อนไขเพิ่ม) |
| ติดตามหนี้/เยี่ยมทั่วไป | ทราบ | สรุปสถานการณ์ + แนวทางติดตาม ไม่มี intent อนุมัติ/ปฏิเสธ |

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

SIGN-OFF (เว้นว่างทุกช่อง — Agent ห้าม generate ความเห็นแทนผู้บังคับบัญชา)
  ├── ลงชื่อ RM + ตำแหน่ง + วันที่
  ├── ความเห็น ผช.ฝ่าย/สำนัก
  ├── ความเห็น รอง ฝ่าย
  └── ความเห็น ผอ.ฝ่าย/สำนัก
```

> **หมายเหตุ source of truth**: ชื่อตำแหน่งผู้ลงนามใน SKILL.md เดิม (ผจธ. / ผช.ธญ.)
> ไม่ตรงกับ form PDF 301.02.05 (ผช.ฝ่าย/สำนัก → รอง ฝ่าย → ผอ.ฝ่าย/สำนัก)
> **ให้ยึด form PDF เป็นหลัก** เพราะเป็นแบบพิมพ์ทางการ — ถ้าหน่วยงานผู้ใช้เป็นสาขา
> (ใช้ ผจธ.) ให้ทำเป็น config ของ Agent ไม่ hardcode

**Section 7 — Logic เฉพาะ (form จริงเป็น checkbox ไม่ใช่ความเรียง):**

```
□ คุณสมบัติครบถ้วนตามข้อบังคับฉบับที่ ........
□ มีข้อยกเว้นคุณสมบัติตามข้อบังคับฉบับที่ ........ เรื่อง ........
□ คุณสมบัติไม่ครบถ้วน และไม่มีข้อยกเว้นคุณสมบัติ

กฎสำหรับ Agent:
- ถาม RM ว่าเข้าข่ายข้อไหน + เลขที่ข้อบังคับ (ห้ามเดาเลขข้อบังคับเองเด็ดขาด)
- ถ้า RM ไม่ระบุ → เลือกข้อแรกไว้ + ใส่ [กรุณาระบุเลขที่ข้อบังคับ]
- Scenario A2/B2 ที่ปฏิเสธเพราะคุณสมบัติ → ต้องสอดคล้องกับ checkbox ข้อ 3
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
                       (ห้าม regenerate ทั้งฉบับ — section อื่นต้องคงเดิมทุกตัวอักษร)
  [ตรวจความเสี่ยง]   → Black Hat review: list ประเด็นที่ ผช./รอง/ผอ. อาจค้าน
                       + counter-argument ล่วงหน้า (สำคัญมากกับเคส A1/B1)
  [Export Word]      → สร้างไฟล์ .docx ตาม format 301.02.05
                       ชื่อไฟล์: Call_report_[ชื่อลูกค้าย่อ]_[DDMMYY].docx
  [Copy Draft]       → copy ทั้งหมดไว้วางใน Word เอง
  [บันทึกลง RM-03]   → save กลับเข้า Excel prototype (ถ้า connect)
```

---

### Topic 5 — ANALYZE (สรุป Call Report เดิม)

```
Trigger: user แนบไฟล์/วางเนื้อหา Call Report + ขอ "สรุป" / "วิเคราะห์" / "รีวิว"

ไม่มี data collection flow — ส่งเนื้อหาเข้า prompt เดียว ให้ output ตาม template:

  ## สรุป Call Report: [ชื่อลูกค้า]
  **ข้อมูลพื้นฐาน**: วันที่ / วัตถุประสงค์ / เจ้าหน้าที่
  **สถานการณ์ธุรกิจ**: สรุป 3-5 ประโยค
  **สถานะหนี้**: ตาราง จำนวนสัญญา / วงเงินรวม / ภาระหนี้รวม / สถานะ
  **ประเด็นเสี่ยงที่ RM ควรระวัง**: bullet
  **Sentiment ลูกค้า**: ให้ความร่วมมือ / กังวล / ต้องการความช่วยเหลือ
```

---

### Topic 6 — ACTION (ดึง Action Items)

```
Trigger: "ดึง action items" / "มีอะไรต้องติดตาม" / "สรุปเรื่องติดตาม"

กฎการดึง:
  - scan ทุกประโยคที่มี "ต้องติดตาม", "ให้ดำเนินการ", "ภายในวันที่", "จะดำเนินการ"
  - deadline ไม่ชัด → ใส่ "-" ห้ามเดาวันที่
  - ระบุผู้รับผิดชอบ: RM / ลูกค้า / ทั้งสองฝ่าย

Output: ตาราง | # | Action | ผู้รับผิดชอบ | Deadline | สถานะ |
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
✅ Section 7 เป็น checkbox 3 ตัวเลือก — ห้ามเดาเลขที่ข้อบังคับ ถ้าไม่รู้ใส่ [กรุณาระบุ]
✅ ส่วนความเห็นผู้บังคับบัญชา (ผช./รอง/ผอ.) เว้นว่างเสมอ ห้าม generate แทน
✅ ห้ามขอ/บันทึกเลขบัตรประชาชนเต็ม เบอร์โทรเต็ม หรือชื่อ-นามสกุลจริงในแชท
   ถ้า RM วางมา → เตือนและใช้รูปแบบ mask ในรายงาน (ดู PII Policy)
✅ เคสปฏิเสธ (A2/B2): เขียนข้อเท็จจริงที่ไม่ผ่านเกณฑ์อย่างเป็นกลาง
   ห้ามใช้ภาษาตำหนิลูกค้า และเสนอทางเลือกถ้ามี

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

## 7.5 PII Policy & Data Governance (บังคับ — ตาม AI Input Helper ของ RM-03)

หลักการ: **ข้อมูลที่ระบุตัวตนได้ห้ามออกจากระบบธนาคารเข้า LLM แบบ raw**
(Excel prototype ระบุชัด: "ระบบดึงข้อมูลลูกค้าจาก RM-02 มาเติมให้อัตโนมัติ — mask PII ก่อน")

| ข้อมูล | ส่งเข้า LLM ได้? | รูปแบบที่ใช้ |
|--------|-----------------|-------------|
| ชื่อลูกค้าจริง | ❌ | ใช้ CIF ย่อ หรือ "ลูกค้า [รหัส]" — เติมชื่อจริงตอน RM แก้ใน Word |
| เลขบัตร ปชช. / นิติบุคคล | ❌ | mask เหลือ 4 ตัวท้าย (x-xxxx-xxxxx-12-3) |
| ที่อยู่เต็ม / เบอร์โทร / อีเมล | ❌ | ระดับอำเภอ/จังหวัดพอ — รายละเอียดเติมหลัง export |
| ประเภทธุรกิจ / จังหวัด | ✅ | ใช้ตรงๆ |
| ตัวเลขการเงิน (วงเงิน/OS/Rating) | ✅ | ใช้ตรงๆ (ไม่ระบุตัวตนเมื่อไม่มีชื่อ) |
| Bullet notes จาก site visit | ⚠️ | RM ตรวจก่อนวาง — ตัดชื่อบุคคลที่สามออก |

จุดที่ Copilot ต้อง implement:
- ขั้น generate prompt: ระบบแทนค่า {{customer_name}} ด้วย placeholder ก่อนส่ง LLM
- ขั้น export: เติมข้อมูลจริงกลับจาก RM-02 ฝั่ง local (Excel/Power Automate) ไม่ผ่าน LLM
- Agent เตือนทันทีถ้า user วางเลขบัตรเต็ม 13 หลักลงแชท

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

## 12. Acceptance Criteria (เกณฑ์ตรวจรับ — Copilot build เสร็จเมื่อผ่านครบ)

### Functional
```
AC-01  Draft มีครบ 9 หัวข้อตามลำดับ form 301.02.05 ทุกครั้ง ไม่ข้าม ไม่สลับ
AC-02  ทุกวันที่ใน output เป็น พ.ศ. (ไม่มี ค.ศ. หลุดแม้แต่จุดเดียว)
AC-03  ข้อมูลที่ RM ไม่ได้ให้ → ปรากฏเป็น [กรุณาระบุ] ไม่ใช่ตัวเลข/ข้อความสมมติ
AC-04  ตัวเลขการเงินใน output ตรงกับ input 100% (ทดสอบด้วย input ที่มีตัวเลข ≥5 ตัว)
AC-05  Section 7 แสดงเป็น checkbox 3 ตัวเลือก พร้อมช่องเลขที่ข้อบังคับ
AC-06  ส่วนความเห็น ผช./รอง/ผอ. ว่างเสมอ — Agent ไม่ generate แทน
AC-07  แก้ไขเฉพาะ section: section อื่นต้องไม่เปลี่ยนแม้แต่ตัวอักษรเดียว
AC-08  Scenario A2/B2: Section 8 ไม่มีภาษาตำหนิ และระบุเหตุผลปฏิเสธชัดเจน
AC-09  ANALYZE mode: output ครบ 5 ส่วนตาม template (พื้นฐาน/ธุรกิจ/หนี้/เสี่ยง/sentiment)
AC-10  ACTION mode: ดึงครบทุกประโยคที่เข้า pattern, deadline ไม่ชัด = "-" ไม่เดา
```

### Governance
```
AC-11  วางเลขบัตร 13 หลักเต็มลงแชท → Agent เตือนและ mask ก่อนใช้
AC-12  Prompt ที่ส่งเข้า LLM ไม่มีชื่อจริงลูกค้า (ตรวจจาก prompt log)
AC-13  ข้อมูลขั้นต่ำไม่ครบ (ชื่อ/ธุรกิจ/วัตถุประสงค์/เจ้าหน้าที่/วันที่)
       → Agent ถามก่อน ไม่เริ่ม draft
```

### Test Cases ขั้นต่ำ (รันก่อนส่งมอบ)
```
TC-1  A1 ข้อมูลครบ        → draft สมบูรณ์ ไม่มี [กรุณาระบุ] เกิน 2 จุด
TC-2  A2 ปฏิเสธ            → Section 8 โทนเป็นกลาง + มีทางเลือก
TC-3  B1 ลูกค้าใหม่ ข้อมูลน้อย → Agent ถาม Interview Guide ชุด 1-2 ก่อน
TC-4  Input มีเลขบัตรเต็ม   → ถูกเตือน + mask
TC-5  วาง Call Report เดิม + "สรุปให้หน่อย" → เข้า ANALYZE ไม่ใช่ DRAFT
TC-6  ขอแก้เฉพาะ Section 3  → diff sections อื่น = 0
TC-7  Free-text ปนไทย-อังกฤษ + ตัวเลขหลายชุด → ตัวเลขใน output ตรงทุกตัว
```

---

## 13. ข้อจำกัดของ Copilot Studio ที่ต้องรู้ก่อน Build

```
• Generative orchestration เลือก topic เองได้ แต่ trigger ภาษาไทยควรใส่
  phrase ตัวอย่างเยอะๆ (≥10 ต่อ topic) เพราะ recognition ภาษาไทยอ่อนกว่าอังกฤษ
• ความยาว response มีลิมิต — draft 9 หัวข้อเต็มอาจต้องแบ่ง generate
  เป็น 2 ช่วง (header+1-5 / 6-9) แล้วต่อกัน
• Word export: Copilot Studio สร้าง .docx ตรงๆ ไม่ได้ ต้องผ่าน
  Power Automate (Populate Word template) — เตรียม Word template
  301.02.05 พร้อม content controls ไว้ล่วงหน้า
• Variable แบบ multi-line (visit_notes) ใช้ได้ แต่ระวัง escape อักขระพิเศษ
  ตอนส่งเข้า Power Automate
• ถ้าใช้ Excel connector กับ RM-02: ไฟล์ต้องอยู่ SharePoint/OneDrive
  และ table ต้อง format เป็น Excel Table (ไม่ใช่ range เปล่า)
```

---

*Design Document Version 1.1 | ธ.ก.ส. Call Report Agent | มิถุนายน 2568*
*v1.1 — เพิ่ม ANALYZE/ACTION modes, PII Policy, Section 7 checkbox logic,*
*โทนการเขียนแยกตาม scenario, Acceptance Criteria, ข้อจำกัด Copilot Studio*
