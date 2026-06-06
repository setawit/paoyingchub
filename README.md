# 🧠 Loan Brain OS — Phase 1 Brain Prototype

**Credit Productivity & Decision Engine** สำหรับงานสินเชื่อเกษตร (BAAC)

> "ไม่ใช่การเขียนทีละเคส แต่คือการสร้างเคสในระดับระบบ"

ระบบที่แปลง **ข้อมูลลูกค้า → เคสสินเชื่อพร้อมเสนอ** แบบอัตโนมัติ — ลดเวลาจาก
2–4 ชั่วโมง/เคส เหลือระดับวินาที พร้อมบังคับให้ทุกเคสผ่าน framework และตรวจ
risk pattern อัตโนมัติ

## วิธีใช้ (Demo)

เปิด `index.html` ในเบราว์เซอร์ (เป็น static web app ล้วน ไม่ต้องติดตั้งอะไร) →
กด **"เริ่ม Demo เคสฟาร์มสุกร 25 ล้านบาท"** → กด **Generate** → ระบบผลิต
Credit Analysis / Risk Assessment / Recommendation / Credit Memo (ฉบับร่าง)
→ RM กด **อนุมัติ** เพื่อบันทึกเข้าคลังความรู้

## สถาปัตยกรรม (ตามหลักการในเอกสารข้อเสนอ)

```
Input (ข้อมูลลูกค้า)
   │
   ▼
ENGINE  ──uses──►  KNOWLEDGE (framework 5C · risk patterns · thresholds · benchmarks)
   │                   ▲
   ▼                   │ Design Principle #2: Control the Brain
Output  ──format──► TEMPLATES (control layer — output มาตรฐาน)
   │
   ▼
RM Approve (Human-in-the-loop) ──► STORE (knowledge reuse)
```

| ไฟล์ | Layer | หน้าที่ |
|------|-------|---------|
| `js/knowledge.js` | **Knowledge** | "สมอง" กลาง — framework 5C, risk pattern library, threshold, benchmark, governance version |
| `js/engine.js` | **Engine** | คำนวณ ratio (DSCR/LTV/D-E/...), รัน risk detection, สร้าง recommendation แบบ deterministic |
| `js/templates.js` | **Control** | template output มาตรฐานชุดเดียว (กัน Governance Failure 7.1) |
| `js/cases.js` | Data | เคสตัวอย่าง (ฟาร์มสุกร 25 ลบ.) |
| `js/store.js` | Store | คลังความรู้ — บันทึก/ดึงเคส (localStorage) |
| `js/app.js` | UI | orchestration + RM approve flow |

## หลักการออกแบบที่ยึด

1. **Output > Process** — optimize การผลิต output ไม่ใช่ workflow
2. **Control the Brain** — logic อยู่กลางที่ `knowledge.js` ที่เดียว, UI แค่ apply
3. **Speed first** — deterministic, offline, ผลิตในระดับวินาที
4. **Human stays in control** — ระบบ = draft, RM = approve

## Roadmap

- ✅ **Phase 1 — Brain Prototype** (repo นี้): template + logic engine, demo เคสจริง
- ⏭ **Phase 2 — Controlled Engine**: แยก logic เป็น service + control/audit layer
- ⏭ **Phase 3 — Loan Brain App**: ต่อ data source จริง + เชื่อม LLM สำหรับ memo เชิงพรรณนา

> หมายเหตุ Phase 1: ตัวเลขในเคสตัวอย่างเป็นข้อมูลสมมติ และ engine ใช้ logic/template
> (ยังไม่ต่อ LLM) เพื่อให้ผลลัพธ์ตรวจสอบได้และทำงานได้ทันทีแบบ offline
