# AI Marketing Textbook — ชุดเครื่องมือเขียนหนังสือด้วย AI

> Version: 1.0
> Last Updated: 2026-09-27

ชุดเอกสารสำหรับให้ทีมใช้ AI ช่วยเขียนหนังสือ/คู่มือ **AI Marketing** สำหรับผู้บริหาร นักการตลาด
และองค์กรไทย โดยให้ทุกบทออกมาเป็น "หนังสือเล่มเดียวกัน" ทั้งเสียง โครงสร้าง และแก่นความคิด

> **เป้าหมายของเล่ม:** ผู้อ่านเข้าใจว่า AI Marketing คือ "ระบบ" ไม่ใช่ "เครื่องมือ"
> และมองการตลาดเป็น "วงจรการเรียนรู้" — โดยไม่หลงทางในโลกที่ข้อมูลเยอะ แต่ความเข้าใจน้อย

---

## 📚 สถาปัตยกรรม 3 ชั้น

| # | ไฟล์ | ชั้น | ใช้ทำอะไร |
| --- | --- | --- | --- |
| 00 | [`00_BOOK_DNA.md`](00_BOOK_DNA.md) | 1 — DNA | System Instruction ของทั้งเล่ม (วางเป็น System Prompt) |
| 01 | [`01_CHAPTER_PROMPT_TEMPLATE.md`](01_CHAPTER_PROMPT_TEMPLATE.md) | 2 — Chapter Prompt | Chapter Brief + ชุด Prompt 5 จังหวะ + Micro-Prompts + Editor Gate |
| 02 | [`02_BOOK_LEDGER_TEMPLATE.md`](02_BOOK_LEDGER_TEMPLATE.md) | 3 — Ledger | ความจำข้ามบท: framework, punchline, ตัวละคร, ศัพท์, theme |
| 03 | [`03_EXAMPLE_CHAPTER_BRIEF.md`](03_EXAMPLE_CHAPTER_BRIEF.md) | ตัวอย่าง | Brief บทที่ 1 ที่กรอกแล้ว + ตัวอย่างประโยคเปิดที่ผ่าน/ไม่ผ่าน |

## 🔄 The Chapter Loop

```
[0] BRIEF → [A] ANGLE → [B] DRAFT → [C] MIRROR → [D] POLISH → [E] LEDGER ─┐
   (คน)      (AI+คน)      (AI)        (AI)         (AI+คน)      (AI+คน)    │
     ▲                                                                   │
     └─────────────────────── ป้อนความจำให้บทถัดไป ──────────────────────────┘
```

เริ่มต้นเร็วที่สุด: อ่าน [`01_CHAPTER_PROMPT_TEMPLATE.md`](01_CHAPTER_PROMPT_TEMPLATE.md) §6 Quick Start

## 🧭 กติกาที่ห้ามข้าม

- **Brief เขียนโดยคน** — AI ขยายคุณภาพความคิด ไม่ได้สร้างความคิดแทน
- **คนเลือกมุมเล่า** ในจังหวะ A และ **คนตัดสินสุดท้าย** ที่ Editor Gate
- **ห้ามคัดลอก** ข้อความ ชื่อบท หรือชื่อ framework จากหนังสือต้นทาง
- **ห้ามแต่งข้อเท็จจริง** — case จริงต้องมีแหล่งอ้างอิงที่คนเปิดตรวจแล้ว, case สมมติต้องติดป้าย
- **อัปเดต Ledger ทุกบท** — ไม่งั้นเล่มจะกลายเป็น "บทแยก" ไม่ใช่ "เรื่องเดียว"
