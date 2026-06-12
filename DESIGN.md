# FarmPlan DSS v3 — เอกสารออกแบบสถาปัตยกรรม

> ระบบช่วยตัดสินใจ (Decision Support System) วางแผนฟาร์มขนาดเล็ก
> เอกสารนี้คือ "พิมพ์เขียว" สำหรับให้ AI coding assistant (เช่น GitHub Copilot)
> เขียนโค้ดตาม โดยทุก module มี skeleton file + JSDoc + TODO ไว้แล้วในโฟลเดอร์ `js/`

---

## 1. ภาพรวมและหลักการ DSS

ระบบนี้ map กับกรอบ DSS คลาสสิก (Simon's decision phases):

| Phase | ในระบบนี้ |
|---|---|
| **Intelligence** | ผู้ใช้กรอกทรัพยากรฟาร์ม + โซนแปลงดิน + ตลาดที่เข้าถึงได้ |
| **Design** | เครื่องจัดสรร (allocation engine) สร้างแผนทางเลือก 3 ระดับความเสี่ยง |
| **Choice** | ตารางเปรียบเทียบ + กราฟ cashflow + คำเตือนช่วงเงินขาดมือ ช่วยผู้ใช้เลือก |

องค์ประกอบ DSS ทั้ง 3 ส่วน:
- **Database subsystem** → `js/store/` (catalog พืช/สัตว์, โซนแปลง, ตลาด — เก็บใน localStorage)
- **Model subsystem** → `js/engine/` (suitability, allocation, weekly cashflow)
- **Dialog subsystem** → `js/ui/` (5 แท็บ: ฟาร์ม / แคตตาล็อก / แปลงดิน / ตลาด / ผลวิเคราะห์)

ข้อสมมติเดิมที่คงไว้: ฟาร์มเป็น price taker, ไม่มีดอกเบี้ยเงินกู้, แรงงานวัดเป็นชั่วโมง

---

## 2. โครงสร้างไฟล์

```
index.html              ← SPA โครง 5 แท็บ
style.css
js/
  types.js              ← JSDoc typedefs ทุกโครงสร้างข้อมูล (อ่านไฟล์นี้ก่อน)
  data/
    defaultCatalog.js   ← กิจกรรมตั้งต้น 10 รายการ (seed data)
    defaultZones.js     ← โซนแปลงตั้งต้น + ชนิดดิน
  store/
    catalogStore.js     ← CRUD กิจกรรม + persist localStorage + import/export JSON
    farmStore.js        ← config ฟาร์ม, โซนแปลง, ตลาด
  engine/
    suitability.js      ← คะแนนความเหมาะสมแปลง×กิจกรรม → ตัวคูณผลผลิต
    allocation.js       ← จัดสรรกิจกรรมลงโซนแปลง (greedy ราย unit)
    cashflow.js         ← จำลองรายสัปดาห์ 52 สัปดาห์ + 13-week rolling window
  ui/
    app.js              ← router แท็บ + wiring
    catalogView.js      ← ฟอร์มเพิ่ม/แก้/ลบพืช-สัตว์
    zonesView.js        ← ฟอร์มโซนแปลง
    marketView.js       ← ฟอร์มตลาด
    resultsView.js      ← การ์ดแผน, ตารางเทียบ, กราฟ cashflow
```

กติกา: **vanilla JS (ES modules), ไม่มี build step, ไม่มี dependency** → ลากวาง Netlify ได้เหมือนเดิม

---

## 3. Data Model (รายละเอียดเต็มใน `js/types.js`)

### 3.1 Activity — กิจกรรมการผลิต (ผู้ใช้เพิ่มเองได้)

```js
{
  id: 'veggie-kale',          // unique, สร้างจากชื่อ
  name: 'ผักคะน้า',
  icon: '🥬',                  // ผู้ใช้เลือกจาก emoji picker หรือพิมพ์เอง
  category: 'vegetable',      // vegetable | field-crop | fruit-tree | livestock | aquaculture
  unitDesc: 'แปลง 100 ตร.ม.',
  areaPerUnit: 100,           // ตร.ม.
  investmentPerUnit: 4000,    // บาท จ่ายครั้งเดียวตอนเริ่ม
  laborPerUnitPerDay: 1.8,    // ชม.
  waterNeed: 'high',          // low | medium | high
  soilPreference: { loam: 1.0, clay: 0.7, sandy: 0.5 },  // ตัวคูณผลผลิตตามดิน
  weeklyCostPerUnit: 110,     // บาท (อาหารสัตว์/ปุ๋ย/น้ำมันสูบน้ำ)
  revenue: {
    model: 'recurring',       // recurring = ขายต่อเนื่อง | lump = เก็บเกี่ยวเป็นรอบ
    grossPerUnitPerCycle: 5500, // บาทต่อรอบ (ก่อนตัวคูณตลาด/ดิน)
    cycleWeeks: 10,           // ความยาวรอบผลิต
    firstIncomeWeek: 7,       // สัปดาห์แรกที่มีรายได้ นับจากสัปดาห์เริ่ม
  },
  maxUnits: 8,                // เพดานต่อฟาร์ม (กันโมเดลเพี้ยน)
  perishable: true,           // เน่าเสียง่าย → โดน penalty ตลาดไกลแรงขึ้น
  source: 'default' | 'user', // รายการ default ลบไม่ได้ แต่ clone แล้วแก้ได้
}
```

### 3.2 PlotZone — โซนแปลงดิน (ฟาร์มแบ่งได้หลายโซน คุณภาพไม่เท่ากัน)

```js
{
  id: 'zone-a',
  name: 'แปลงหน้าบ้าน',
  areaSqm: 600,
  soilType: 'loam',           // loam | clay | sandy
  waterAccess: 0.9,           // 0–1 (ใกล้แหล่งน้ำ=1)
  floodRisk: 'low',           // low | medium | high → ตัดกิจกรรมบางประเภท
  note: '',
}
```

### 3.3 Market — ตลาด (มีได้หลายแห่ง แต่ละแห่งระยะทาง/ราคาต่างกัน)

```js
{
  id: 'market-talad-sod',
  name: 'ตลาดสดอำเภอ',
  distanceKm: 12,
  priceFactor: 1.0,           // ตัวคูณราคาฐาน
  transportCostPerTrip: 80,   // บาท/เที่ยว (ไป-กลับ)
  tripsPerWeek: 2,
  acceptsCategories: ['vegetable','livestock'],  // ตลาดนี้รับสินค้าอะไร
}
```

กฎ: สินค้า perishable ที่ขายตลาด `distanceKm > 20` โดนตัวคูณราคาเพิ่มอีก ×0.9
(ของช้ำ/ต้องขายเหมา) — ดูสูตรใน `suitability.js`

### 3.4 FarmConfig / PlanResult — ดู `js/types.js`

---

## 4. Engine 1: Suitability (`js/engine/suitability.js`)

คำนวณ **yieldMultiplier** ของคู่ (activity, zone, market):

```
yieldMult = soilFactor × waterFactor × floodFactor
priceMult = market.priceFactor × perishablePenalty(activity, market)

soilFactor  = activity.soilPreference[zone.soilType]
waterFactor = lerp(0.5, 1.0, zone.waterAccess) ถ้า waterNeed=high
            = lerp(0.7, 1.0, zone.waterAccess) ถ้า medium
            = 1.0 ถ้า low
floodFactor = 0 ถ้า floodRisk=high และ category ∈ {field-crop, vegetable}
              ไม่งั้น 1.0   (บ่อปลา/เล้าไก่ยกพื้นไม่สน flood ระดับ medium)
```

ผลลัพธ์: `score(activity, zone) = กำไรคาดหวังต่อตร.ม. × yieldMult` ใช้จัดอันดับใน allocation

## 5. Engine 2: Allocation (`js/engine/allocation.js`)

ต่างจาก v2 ตรงที่จัดสรร **ลงรายโซน** ไม่ใช่ pool รวม:

```
1. สร้างตาราง candidate ทุกคู่ (activity × zone) พร้อม score จาก suitability
2. เรียง candidate ตาม score มาก→น้อย (ถ่วงด้วย risk profile ของแผน)
3. greedy: หยิบทีละ 1 unit ถ้า ทุนเหลือ ∧ พื้นที่โซนเหลือ ∧ แรงงานเหลือ ∧ ยังไม่ชน maxUnits
4. ทำซ้ำจนเติมไม่ได้
```

แผน 3 ระดับใช้ fraction ทรัพยากร + ตัวถ่วง risk เหมือน v2:
- safe: ชอบ activity ที่ firstIncomeWeek สั้น (ถ่วง score ด้วย 1/firstIncomeWeek)
- high: ชอบ score กำไรดิบสูงสุด ไม่สนรอบยาว

## 6. Engine 3: Weekly Cashflow + 13-Week Window (`js/engine/cashflow.js`)

**หัวใจของ v3** — ตอบคำถาม "เดือนไหนเงินหมดหน้าตัก แม้ปลายปีกำไร"

จำลองรายสัปดาห์ W1–W52:

```
balance[0] = cashReserve            (เงินลงทุนหักตอน W ที่กิจกรรมเริ่ม)
balance[w] = balance[w-1] + income[w] − cost[w] − transport[w]
```

ผลลัพธ์ที่ engine ต้องคืน (โครงเต็มใน types.js → `CashflowResult`):

| ฟิลด์ | ความหมาย |
|---|---|
| `weekly[]` | 52 จุด: income, cost, net, balance |
| `minBalance`, `minBalanceWeek` | จุดต่ำสุด + สัปดาห์ที่เกิด (แปลงเป็นชื่อเดือนใน UI) |
| `cashGaps[]` | ช่วงต่อเนื่องที่ balance < 0: `{fromWeek, toWeek, maxDeficit}` |
| `rolling13[]` | ทุกสัปดาห์ w: ยอดต่ำสุดที่จะเกิดใน 13 สัปดาห์ข้างหน้า (rolling min) |
| `firstWarningWeek` | สัปดาห์แรกที่ rolling13 มองเห็นยอดติดลบล่วงหน้า → "อีก X สัปดาห์เงินจะขาด" |
| `loanNeeded` | \|minBalance\| × 1.2 — วงเงินกู้สั้นๆ ที่ทำให้แผนรอด |
| `breakEvenWeek` | สัปดาห์แรกที่ balance สะสม ≥ ทุนที่ลงไป |

**13-week rolling window** คือเครื่องมือมาตรฐานของ corporate treasury:
มองไปข้างหน้า 1 ไตรมาสเสมอ เพื่อเตือน *ก่อน* เงินขาดจริง ไม่ใช่รายงานหลังขาดแล้ว
ใน UI ให้แสดงเป็นแถบเตือน: "⚠️ สัปดาห์ที่ 9 (ต้น มี.ค.) ระบบมองเห็นว่าอีก 13 สัปดาห์
เงินสดจะติดลบสูงสุด 14,200 บาท → ควรเตรียมวงเงิน ~17,000 บาท หรือเลื่อนเริ่มข้าวโพดไป W14"

ข้อเสนอแนะอัตโนมัติ (rule-based, ไม่ต้อง optimize):
1. ถ้ามี cashGap → แนะนำ `loanNeeded`
2. ลองเลื่อน startWeek ของกิจกรรม lump-revenue ทีละ 4 สัปดาห์ (สูงสุด 12) — ถ้า gap หาย ให้เสนอ
3. ถ้าแผนไม่มี activity ที่ firstIncomeWeek ≤ 8 → แนะนำเพิ่ม "กิจกรรมเงินเร็ว" 1 หน่วย

## 7. UI (5 แท็บ)

1. **ฟาร์มของฉัน** — ทรัพยากรรวม (ทุน, สำรอง, แรงงาน) + ปุ่มวิเคราะห์
2. **แคตตาล็อก** — ตารางกิจกรรมทั้งหมด + ปุ่ม "➕ เพิ่มพืช/สัตว์" เปิดฟอร์มครบทุก field ใน §3.1
   พร้อม validate, ปุ่ม clone จาก default, ปุ่ม import/export JSON (แชร์ catalog ระหว่างเครื่อง)
3. **แปลงดิน** — เพิ่ม/แก้โซน (ชื่อ, พื้นที่, ดิน, น้ำ, น้ำท่วม) — ผลรวมพื้นที่โชว์เทียบพื้นที่ฟาร์ม
4. **ตลาด** — เพิ่ม/แก้ตลาด ตาม §3.3
5. **ผลวิเคราะห์** — การ์ด 3 แผน (บอกว่ากิจกรรมไหนลงโซนไหน), ตารางเทียบ,
   กราฟ cashflow รายสัปดาห์ (ย่อเป็นรายเดือนได้), แถบเตือน cash gap + ข้อเสนอแนะ

## 8. ลำดับงานสำหรับ Copilot (ทำตามลำดับ ทดสอบทีละขั้น)

- [ ] 1. `js/types.js` — มีให้แล้ว อ่านอย่างเดียว
- [ ] 2. `js/data/defaultCatalog.js` + `defaultZones.js` — มี seed แล้ว เพิ่มได้
- [ ] 3. `js/store/catalogStore.js` — implement CRUD + localStorage (key: `farmplan.catalog.v3`)
- [ ] 4. `js/store/farmStore.js` — config + zones + markets
- [ ] 5. `js/engine/suitability.js` — สูตรใน §4 (pure function, เขียน test ใน console ได้)
- [ ] 6. `js/engine/allocation.js` — greedy ใน §5
- [ ] 7. `js/engine/cashflow.js` — §6 (สำคัญสุด ทำ rolling13 ให้ถูก: O(n) ด้วย deque หรือ O(n×13) ก็รับได้)
- [ ] 8. `js/ui/*` — แท็บละไฟล์ เริ่มจาก catalogView (ฟอร์มเพิ่มกิจกรรม) ก่อน
- [ ] 9. เก็บ v2 (`script.js` เดิม) ไว้จนกว่า v3 จะวิ่งครบ แล้วค่อยลบ

### Test cases ขั้นต่ำ (รันใน node ได้ ทุก engine เป็น pure function)

1. ฟาร์ม 1 ไร่ default → 3 แผนต้องไม่ใช้ทรัพยากรเกิน fraction ที่กำหนด
2. โซน sandy + waterAccess 0.2 → ผักต้องได้ yieldMult < 0.5 และ allocation ควรเลี่ยงโซนนี้
3. แผนที่มีแต่ข้าวโพด (lump รายได้ W14) ทุนพอดี → ต้องเกิด cashGap ช่วง W1–W13 และ `firstWarningWeek = 1`
4. import catalog JSON ที่ field ขาด → ต้อง reject พร้อมบอก field ที่หาย
