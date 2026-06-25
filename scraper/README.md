# Scraper

ดึงอัตราดอกเบี้ยเงินฝากจากเว็บธนาคาร แล้วเขียนลง `../data/deposits.json`
(สแน็ปช็อตที่เว็บ static ใช้งาน)

```
sources -> fetch/parse -> merge กับสแน็ปช็อต -> validate -> เขียน JSON
```

## ติดตั้ง & รัน

```bash
pip install -r requirements.txt

python scrape.py                 # ดึง + merge + validate + เขียนไฟล์
python scrape.py --dry-run       # ดึง + validate แต่ไม่เขียน
python scrape.py --validate-only # ตรวจ JSON ที่ commit ไว้เท่านั้น
python test_salak_math.py        # ทดสอบสูตรคำนวณสลาก
```

> รันจาก root ก็ได้: `python scraper/scrape.py`

## Tier strategy

| Tier | ชนิด | วิธี |
|---|---|---|
| 1 | HTML | BeautifulSoup parse ตาราง |
| 2 | PDF | ประกาศดอกเบี้ยเป็น PDF (ยังไม่ทำอัตโนมัติ) |
| 3 | JavaScript | ต้องใช้ Playwright |
| 4 | Manual | เจ้าหน้าที่ตรวจ/กรอกเอง — เก็บค่าจากสแน็ปช็อต |

ปัจจุบัน Tier 1 มีตัวอย่างใช้งานได้ใน `sources/example_html.py` (KKP, CIMB)
ธนาคารอื่นถูกขึ้นทะเบียนเป็น Tier 4 (manual) ใน `sources/__init__.py` เพื่อให้ค่าจาก
สแน็ปช็อตไม่ถูกลบ จนกว่าจะเขียน parser จริง

## การ degrade อย่างปลอดภัย

ถ้าแหล่งใดดึงไม่สำเร็จ (network / robots.txt / parse ล้มเหลว) orchestrator จะ **log แล้วเก็บ
ค่าเดิมจากสแน็ปช็อตไว้** — เว็บ static จึงทำงานได้เสมอ และไฟล์จะถูกเขียนก็ต่อเมื่อผ่าน
validation เท่านั้น

## เพิ่มแหล่งใหม่ (Tier 1)

1. สร้างคลาส subclass `GenericTableSource` ใน `sources/example_html.py`
   ตั้ง `bank_id`, `url`, `product_name` และปรับ `table_selector` ให้ตรงหน้าเว็บจริง
2. เพิ่ม instance ลงใน `AUTOMATED` ใน `sources/__init__.py`
   (ลบ id เดียวกันออกจาก `MANUAL`)
3. รัน `python scrape.py --dry-run` ตรวจผลก่อนเขียนจริง

## ⚖️ ข้อกำหนดการใช้งาน (สำคัญ)

- การดึงข้อมูลต้อง **เคารพ robots.txt และเงื่อนไขการใช้งาน (ToS)** ของแต่ละธนาคาร
  (`BaseSource.fetch()` ตรวจ robots.txt และตั้ง User-Agent ที่ระบุตัวตน + หน่วงเวลา)
- ใช้เพื่อการเปรียบเทียบข้อมูลสาธารณะแบบไม่แสวงหากำไรในเชิงสาธิต
  ถ้าธนาคารใดไม่อนุญาต ให้ถอดแหล่งนั้นออกหรือเปลี่ยนเป็น Tier 4 (กรอกมือ)
- ค่าในสแน็ปช็อตปัจจุบันเป็น **ข้อมูลตัวอย่าง** (`verified: false`) จนกว่าจะดึงจากแหล่งจริงสำเร็จ
