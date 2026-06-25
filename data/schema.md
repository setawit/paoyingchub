# Data Schema

ไฟล์ JSON ในโฟลเดอร์นี้เป็น **source of truth** ของเว็บ static และเป็น **เป้าหมายเอาต์พุต**
ของ scraper (`/scraper`). หากค่าใดยังไม่ได้ดึงจากแหล่งจริง จะถูกทำเครื่องหมายว่าเป็น
ข้อมูลตัวอย่าง (`verified: false` / `source_note`).

> ทุกค่าในสแน็ปช็อตปัจจุบันเป็น **ข้อมูลตัวอย่าง/ประมาณการ** เพื่อสาธิตระบบเท่านั้น
> ไม่ใช่อัตราหรือเงื่อนไขที่ประกาศจริง

---

## `deposits.json`

```jsonc
{
  "updated_at": "YYYY-MM-DD",            // วันที่อัปเดตล่าสุดของชุดข้อมูล
  "source_note": "string",               // หมายเหตุที่มา/ข้อจำกัด
  "rate_terms_months": [3,6,12,24,36,60,120], // คีย์ระยะเวลามาตรฐาน (เดือน)
  "banks": [
    {
      "id": "string",        // primary key, slug ใช้เชื่อมกับ product.bank_id
      "name": "string",      // ชื่ออังกฤษ
      "name_th": "string",   // ชื่อไทย (ใช้แสดงผลหลัก)
      "type": "commercial" | "state",
      "logo": "string|url",  // optional
      "website": "url"
    }
  ],
  "products": [
    {
      "id": "string",                 // primary key
      "bank_id": "string",            // FK -> banks.id
      "product_name": "string",
      "product_type": "fixed" | "savings",
      "minimum_amount": number|null,  // บาท
      "max_amount": number|null,      // บาท (null = ไม่จำกัด)
      "rates": {                      // % ต่อปี, คีย์ = ระยะเวลา (เดือน)
        "3": number, "6": number, "12": number,
        "24": number, "36": number, "60": number, "120": number
      },
      "conditions": "string",
      "updated_at": "YYYY-MM-DD",
      "verified": boolean             // true = ดึง/ยืนยันจากแหล่งจริงแล้ว
    }
  ]
}
```

**หน้า Compare** อ่านคีย์ `rates["12"|"36"|"60"|"120"]` เพื่อทำคอลัมน์ 1 / 3 / 5 / 10 ปี
ค่าที่หายไป (เช่นธนาคารไม่มีฝากประจำ 10 ปี) แสดงเป็น `—`.

---

## `salak.json`

```jsonc
{
  "updated_at": "YYYY-MM-DD",
  "source_note": "string",
  "products": [
    {
      "id": "string",
      "bank_id": "string",          // FK -> deposits.json banks.id (เพื่อใช้ชื่อ/ประเภท)
      "product_name": "string",
      "unit_price": number,         // ราคาต่อหน่วย (บาท)
      "term_months": number,        // อายุสลาก
      "draw_frequency": "monthly" | "quarterly" | "yearly",
      "redeem_interest_rate": number, // % ต่อปี ที่ได้เมื่อครบกำหนด (เงินต้นได้คืนเสมอ)
      "units_in_pool": number,      // จำนวนหน่วยทั้งหมดในกองที่ร่วมออกรางวัล
      "prize_tiers": [
        { "name": "string", "amount": number, "count_per_draw": number }
      ]
    }
  ]
}
```

### สูตรการคำนวณ (ใช้ทั้งใน `assets/js/salak.js` และ `scraper/test_salak_math.py`)

ให้ `U` = จำนวนหน่วยที่ถือ, `N` = `units_in_pool`, `f` = จำนวนงวดต่อปี
(monthly=12, quarterly=4, yearly=1), `t` = `term_months/12` ปี

- **มูลค่ารางวัลคาดหวังต่อหน่วยต่องวด**
  `ev_per_unit_draw = Σ(amount_i × count_i) / N`
- **ผลตอบแทนจากรางวัลต่อปี (%)**
  `prize_yield = (ev_per_unit_draw × f) / unit_price × 100`
- **ผลตอบแทนรวมต่อปี (%)** = `prize_yield + redeem_interest_rate`
- **จำนวนสลอตรางวัลต่องวด** `S = Σ count_i`
- **โอกาสถูกอย่างน้อย 1 รางวัลต่องวด** `p ≈ 1 − (1 − S/N)^U`
- **โอกาสถูกตลอดอายุการถือ** `1 − (1 − p)^(f × t)`

> EV เป็น **ค่าคาดหวังเชิงสถิติ** ผลจริงของแต่ละคนผันผวนสูง (ส่วนใหญ่ได้แค่เงินต้น
> + ดอกเบี้ยไถ่ถอน) — ไม่ใช่การการันตีผลตอบแทน
