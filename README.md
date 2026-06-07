# 🧠 Loan Brain OS — v2

**Credit Productivity & Decision Engine** สำหรับงานสินเชื่อเกษตร (BAAC)

> "ไม่ใช่การเขียนทีละเคส แต่คือการสร้างเคสในระดับระบบ"

แปลง **ข้อมูลลูกค้า → Credit Approval พร้อมเสนอ** อัตโนมัติในระดับวินาที
(RM มือใหม่ใช้ 7–10 วัน/เคส)

## ใหม่ใน v2

- **Multi-industry** — ฟาร์มสุกร / นาข้าว / ฟาร์มไก่เนื้อ (Industry Profiles แยก benchmark/risk/driver)
- **Scenario Engine** — เขียน driver ครั้งเดียว → แตก **3 กรณี Customer / Bank / Conservative**
- **Assumption Ledger + provenance** ⭐ — ทุกสมมติฐานมี "ที่มา" (กันข้อหา "นั่งเทียน")
- **Risk Disclosure** — กลั่นกรองจำลอง คาดประเด็นที่จะถูกจี้ + เตรียมคำตอบ/covenant
- **DoA Routing** — วงเงิน → "เคสนี้เข้าท่อไหน" (ใครทำ/สายอนุมัติ) + **ความลึกเอกสารแปรตาม tier**
- **Compliance Engine** — auto-check ล้มละลาย/NCB/AML/กฎกระทรวง/SLL
- **Output map ตามฟอร์ม Credit Approval จริง** (ส่วน A / B / C)

## วิธีใช้ (Demo)

เปิด `index.html` หรือ `loan-brain-os.html` (single-file) ในเบราว์เซอร์ → เลือกเคสตัวอย่าง:
- 🐖 **ฟาร์มสุกร 25 ลบ.** → ระดับธนาคาร · แตกครบ 3 scenarios
- 🐔 **ไก่เนื้อ 8 ลบ.** → ระดับเขต
- 🌾 **นาข้าว 2.5 ลบ.** → ระดับสาขา · ย่อ (1 scenario)

→ กด **Generate** → ได้ Credit Approval (A/B/C) → RM กด **อนุมัติ** เข้าคลังความรู้

## สถาปัตยกรรม

| ไฟล์ | Layer | หน้าที่ |
|------|-------|---------|
| `js/knowledge.js` | Knowledge | Policy (versioned) · DoA matrix · Industry Profiles · risk/challenge patterns |
| `js/engine.js` | Engine | Scenario Engine · Risk Disclosure · DoA routing · Compliance · Recommendation |
| `js/templates.js` | Control | render Credit Approval A/B/C (ลึกตาม tier) |
| `js/cases.js` | Data | เคสตัวอย่าง 3 อุตสาหกรรม |
| `js/store.js` | Store | คลังเคส (localStorage / in-memory fallback) |
| `js/app.js` | UI | orchestration + adaptive driver form + RM approve |

- `loan-brain-os.html` — รวมทุกอย่างไฟล์เดียว (เปิดตรง / ใช้เป็น Claude artifact)
- `ARCHITECTURE.md` — blueprint ระบบเต็ม (Phase 2–3)

> Phase 1–2 prototype: ใช้ template + logic (ยังไม่ต่อ LLM/core banking) ตัวเลขเคสเป็นข้อมูลสมมติ
> เพื่อให้ผลตรวจสอบได้และทำงาน offline · หลัก "Human stays in control": ระบบ = draft, คน = approve
