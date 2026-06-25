# เงินอยู่ไหน? — Thailand Deposit Intelligence Platform

> “ทำให้คนไทยรู้ว่าเงินของตัวเองควรอยู่ที่ไหน”
> Skyscanner ของเงินฝาก — เปรียบเทียบดอกเบี้ยเงินฝาก + คำนวณสลากออมทรัพย์ (และในอนาคต AI ช่วยจัดเงินออม)

นี่คือ **MVP (Phase 1 + สลาก)** ของแพลตฟอร์มตาม blueprint เป็นเว็บ **static** (ไม่มี build step)
พร้อม **Python scraper** ที่ดึงอัตราดอกเบี้ยมาเก็บเป็น JSON

## ฟีเจอร์ในรอบนี้

- **เทียบดอกเบี้ยเงินฝากประจำ** (`index.html`) — ตารางเทียบ 1 / 3 / 5 / 10 ปี ของธนาคารพาณิชย์และรัฐ
  กรองตามประเภทธนาคาร, เรียงลำดับตามคอลัมน์, ไฮไลต์ดอกเบี้ยสูงสุด (★)
- **คำนวณสลากออมทรัพย์** (`salak.html`) — ใส่เงินลงทุน + ระยะเวลา → จำนวนหน่วย, ผลตอบแทนเฉลี่ยต่อปี,
  โอกาสถูกรางวัล, เทียบกับฝากประจำ
- **Scraper** (`scraper/`) — ดึงข้อมูล (Tier 1 HTML), validate, เขียน `data/deposits.json`
  พร้อม degrade อย่างปลอดภัย (ถ้าดึงไม่ได้ใช้ค่าจากสแน็ปช็อต)

## โครงสร้าง

```
index.html / salak.html        หน้าเว็บ
assets/css/style.css           สไตล์ (ฟอนต์ Kanit)
assets/js/                     data.js, compare.js, salak.js
data/                          deposits.json, salak.json, schema.md  (source of truth)
scraper/                       Python pipeline + tests (ดู scraper/README.md)
```

## รัน

```bash
# เว็บ (ต้องผ่านเซิร์ฟเวอร์ เพราะใช้ fetch + ES modules)
python3 -m http.server 8000
# เปิด http://localhost:8000/index.html

# scraper
pip install -r scraper/requirements.txt
python scraper/scrape.py --dry-run     # ดึง + validate ไม่เขียนไฟล์
python scraper/scrape.py               # อัปเดต data/deposits.json
python scraper/test_salak_math.py      # ทดสอบสูตรสลาก
```

## เปิดแบบดับเบิลคลิก (ไม่ต้องมี server)

ถ้าไม่อยากรัน server ใช้เวอร์ชัน **standalone** ในโฟลเดอร์ `standalone/` ที่รวม CSS + JS + ข้อมูล
ไว้ในไฟล์เดียว เปิดด้วยดับเบิลคลิกได้เลย (`standalone/index.html`)

สร้าง/อัปเดตไฟล์ standalone จาก source หลัก (หลังแก้ `data/*.json` หรือ JS):

```bash
python3 build_standalone.py
```

> เวอร์ชันใต้ `assets/` + `data/` ยังเป็น source of truth — `standalone/` เป็นไฟล์ที่ build ออกมา

## ⚠️ ข้อจำกัด

ข้อมูลในสแน็ปช็อตปัจจุบันเป็น **ค่าตัวอย่าง/ประมาณการ** (`verified: false`) เพื่อสาธิตระบบ
ไม่ใช่ประกาศจริงและ **ไม่ใช่คำแนะนำการลงทุน** โปรดตรวจสอบกับธนาคารก่อนตัดสินใจ
การ scrape ต้องเคารพ robots.txt / ToS ของแต่ละธนาคาร (ดู `scraper/README.md`)

## Roadmap (ตาม blueprint)

| Phase | สถานะ |
|---|---|
| 1. เทียบดอกเบี้ยเงินฝาก | ✅ รอบนี้ |
| 2. สลากออมทรัพย์ | ✅ รอบนี้ |
| 3. AI Advisor | ⬜ ถัดไป |
| 4. Allocation Engine / Mobile App / Supabase backend / n8n automation | ⬜ ภายหลัง |

โครงสร้างข้อมูล (`data/schema.md`) ออกแบบให้ย้ายไป Next.js + Supabase ในอนาคตได้โดยใช้ schema เดิม
