# CBS Prototype — Hollow Core Ledger & Smart Contracts

ต้นแบบ Core Banking System ตามเอกสาร **Master AI Instruction Blueprint**
(5-Agent Architecture) เขียนด้วย Python 3.11+ ไม่มี dependency นอกจาก `pytest`

```bash
pip install pytest
python -m pytest cbs -q      # 24 tests
```

## โมดูล (ตาม Agent 1–5)

| Agent | ไฟล์ | หน้าที่ |
| --- | --- | --- |
| 1 Core Ledger | [`core_ledger.py`](core_ledger.py) | สมุดบัญชีคู่แบบ append-only, `round_currency` / `to_rate`, idempotency, trial balance, `get_balance(as_of_date)` |
| 2 CIF & Limits | [`cif_and_limits.py`](cif_and_limits.py) | `CustomerCIF`, `CreditFacility`, `LimitControlService` (อ่านยอดจาก ledger แบบ real-time) |
| 3 Smart Contract | [`smart_contracts.py`](smart_contracts.py) | `LoanSmartContract`: disburse / accrue interest / accrue penalty / repay (Waterfall) |
| 4 Risk & TFRS9 | [`risk_and_aging.py`](risk_and_aging.py) | `ClockProvider`, `AgingEngine`, `OverduePenaltyHook`, `TFRS9Staging`, `EventBus`, `RiskMonitor.run_end_of_day` |
| 5 QA Auditor | [`test_cbs_suite.py`](test_cbs_suite.py) | Checklist 4 ข้อ + Time-Travel Scenario Day 0 → 45 |

## กฎเหล็ก 6 ข้อ — ทำอย่างไรในโค้ด

1. **No float** — `Decimal` ทุกจุด; `PostingInstruction` ปฏิเสธ float และยอดที่ละเอียดเกิน 2 ตำแหน่ง; เทสต์สแกน AST หา float literal / `float()`
2. **Immutable ledger** — ไม่มีฟิลด์ balance; ยอดคำนวณจากการรวม journal เสมอ; ทุก posting เป็นคู่ Dr/Cr
3. **Idempotency** — ทั้งระดับ ledger (`commit_batch`) และระดับ contract (ทุกเมธอดคืนผลเดิมเมื่อยิงคีย์ซ้ำ); ใช้คีย์ซ้ำกับ payload ต่างกัน → `IdempotencyConflictError`; EOD ใช้คีย์ `EOD-INT:<contract>:<date>` จึงรันซ้ำได้ปลอดภัย
4. **Deterministic clock** — ไม่มี `date.today()` ใน business logic (เทสต์ตรวจด้วย AST); ใช้ `ClockProvider.advance()`
5. **Separation of concerns** — Contract คำนวณแล้วส่ง `JournalBatch` ให้ Ledger; Ledger ไม่รู้กติกาผลิตภัณฑ์
6. **Type safety & audit** — frozen dataclass, type hints, docstring ระบุสูตรและคู่บัญชี; Ledger ส่ง event `LEDGER_POSTED` ทุก batch

## ผังบัญชี (ต่อสัญญา)

| บัญชี | ประเภท | ใช้ตอน |
| --- | --- | --- |
| `<contract>:LOAN_PRINCIPAL` | ASSET | Dr ตอนเบิก, Cr ตอนชำระเงินต้น |
| `<contract>:ACCRUED_INTEREST` | ASSET | Dr ตอนตั้งดอกเบี้ยค้างรับ |
| `<contract>:PENALTY_FEE` | ASSET | Dr ตอนตั้งเบี้ยปรับ |
| `<contract>:LOAN_CLEARING` | ASSET | บัญชีพัก ยอดสุทธิ = 0 |
| `<cif>:CUSTOMER_CASH` | LIABILITY | เงินฝากลูกค้า (รับเงินกู้ / ตัดชำระ) |
| `BANK:BANK_REVENUE:INTEREST` / `:PENALTY` | REVENUE | Cr ตอนตั้งค้างรับ |

## การตัดสินใจเชิงออกแบบที่ต่างจาก/ขยายจาก Blueprint

> ⚠️ **ต้องให้ฝ่ายธุรกิจยืนยัน** — จุดเหล่านี้ blueprint ขัดกันเองหรือไม่ได้ระบุ

1. **Day 45 = Stage 2 ?** — Scenario เขียนว่า Stage 2 แต่ตารางในเฟส 4 ระบุ 0–30 วัน = Stage 1
   (ค้าง 15 วันจึงเป็น Stage 1) ต้นแบบยึด **ตาราง** และเพิ่มเทสต์ 30/31/90/91 DPD แทน
2. **คู่บัญชีตอนเบิก** — Blueprint ให้ `Dr LOAN_PRINCIPAL / Cr BANK_TREASURY` + `Dr CUSTOMER_CASH / Cr LOAN_CLEARING`
   ซึ่งทำให้ LOAN_CLEARING ค้างยอดและเงินฝากลูกค้าลดลงแทนที่จะเพิ่ม ต้นแบบใช้
   `Dr LOAN_PRINCIPAL / Cr LOAN_CLEARING` → `Dr LOAN_CLEARING / Cr CUSTOMER_CASH` (clearing สุทธิ 0)
3. **ปัดเศษดอกเบี้ยรายวัน** — ถ้าปัดทุกวัน: 102.74 × 30 = 3,082.20 ≠ 3,082.19 ตามที่ blueprint คาดไว้
   ต้นแบบสะสมยอดละเอียด 8 ตำแหน่งแล้วลงบัญชีเฉพาะส่วนต่างหลังปัด จึงได้ 3,082.19 / 4,623.29 / 616.44 ตรงทุกตัว
4. **รีเซ็ตวันค้างชำระ** — ตามข้อกำหนด "รีเซ็ตเมื่อชำระดอกเบี้ยและเบี้ยปรับครบ" แม้เงินต้นจะเลยวันครบกำหนดแล้ว
   หลัง cure จะนับวันค้างใหม่จากวันที่ cure เหมาะกับวงเงิน Revolving แต่ **ไม่เหมาะกับเงินกู้ Term**
   ที่เงินต้นค้างชำระควรนับ DPD ต่อ
5. **ฐานเบี้ยปรับ** — คิดบนเงินต้นคงค้างทั้งหมดตาม blueprint; เกณฑ์ ธปท. จริงให้คิดเฉพาะ **เงินต้นงวดที่ผิดนัด**
   (ในเคส bullet เงินต้นทั้งก้อนผิดนัด ผลจึงเท่ากัน) — ต้องปรับเมื่อมีตารางผ่อนรายงวด
6. **ชำระเกิน** — ส่วนเกินคืนเป็น `unapplied` ไม่ลงบัญชี

## ขั้นต่อไปที่แนะนำ

- เก็บ journal ลงฐานข้อมูลจริง (PostgreSQL, ตาราง append-only + trigger ห้าม UPDATE/DELETE)
- ตารางผ่อนชำระรายงวด (amortization) และเบี้ยปรับบนงวดที่ค้าง
- ผลิตภัณฑ์เงินฝาก (Deposit Smart Contract) และ ECL calculation ตาม stage
- Cross-model review ตามขั้นที่ 3 ของ blueprint
