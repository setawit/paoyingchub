# DESIGN SPEC — BAAC Visual Standard

## 1. Design Tokens (use as CSS custom properties)

```css
:root {
  /* Brand — ปรับ hex ตาม CI จริงของ ธ.ก.ส. ได้ภายหลัง */
  --baac-green:       #008542;  /* primary: sidebar, buttons, links */
  --baac-green-dark:  #00582C;  /* hover, active states */
  --baac-green-light: #E6F4EC;  /* selected row, badge background */
  --baac-gold:        #C9A227;  /* accent: KPI highlight, active menu marker */
  --bg:               #F5F7F6;  /* page background */
  --surface:          #FFFFFF;  /* cards, table */
  --text:             #1F2937;
  --text-muted:       #6B7280;
  --danger:           #D32F2F;  /* NPL, errors */
  --warning:          #ED6C02;  /* overdue */
  --success:          #2E7D32;  /* normal status */
  --radius: 12px;
  --shadow: 0 2px 8px rgba(0,0,0,.08);
}
[data-theme="dark"] {
  --bg: #111827; --surface: #1F2937;
  --text: #F9FAFB; --text-muted: #9CA3AF;
  --baac-green-light: #0B2E1D;
}
```

## 2. Typography

- Font: **Kanit** (Google Fonts) with fallback `'Kanit', 'Sarabun', sans-serif`
- Base font size **16px minimum** (accessibility requirement — never smaller)
- Numbers in KPI cards: 28–36px bold; use Thai digit grouping `1,234,567.89`

## 3. Layout (desktop)

```
┌──────────────────────────────────────────────┐
│ HEADER: logo+ชื่อระบบ | search | dark-toggle │
│         | ชื่อผู้ใช้+บทบาท | ออกจากระบบ        │
├──────────┬───────────────────────────────────┤
│ SIDEBAR  │ BREADCRUMB (drill-down path)      │
│ เมนูตาม   │ FILTER BAR + ปุ่มล้างตัวกรอง        │
│ สิทธิ์ของ  │ KPI CARDS (4 ใบ, แถวเดียว)        │
│ role     │ CHARTS (grid 2 คอลัมน์)            │
│          │ DATA TABLE (sort/search/paginate)  │
├──────────┴───────────────────────────────────┤
│ FOOTER: ชื่อระบบ · เวอร์ชัน · เวลาอัปเดตล่าสุด   │
└──────────────────────────────────────────────┘
```

- **Mobile (≤ 768px):** sidebar collapses to hamburger menu; KPI cards stack
  1 per row; charts stack; table scrolls horizontally.
- Touch targets ≥ 44×44px.

## 4. Mandatory Components

| Component | Behavior |
|---|---|
| KPI Card | icon + label + value + เปรียบเทียบเดือนก่อน (▲▼ พร้อมสี) + tooltip คำนิยาม KPI |
| Filter Bar | dropdowns + date range; apply ทันทีเมื่อเปลี่ยน; ปุ่ม "ล้างตัวกรอง" |
| Charts | Chart.js; tooltip ภาษาไทย; คลิกเพื่อ drill down ตาม requirement |
| Breadcrumb | แสดงเส้นทาง drill down เช่น `ภาพรวม > สาขาเชียงใหม่`; คลิกย้อนกลับได้ |
| Data Table | คลิกหัวตาราง sort ASC/DESC (มีลูกศรบอกทิศ), ช่องค้นหา, แบ่งหน้า 10 แถว/หน้า |
| Import | ปุ่ม "นำเข้าข้อมูล" รับ .csv/.xlsx + progress bar + สรุปผล (สำเร็จ/ข้าม/ผิดพลาด กี่แถว) |
| Export | ปุ่ม "ส่งออก" เลือกได้: CSV, Excel, PDF (ใช้ `window.print()` + print CSS เพื่อรองรับฟอนต์ไทย) |
| Dark Mode | toggle ใน header; จำค่าใน `localStorage` |
| Loading | spinner/skeleton ระหว่างประมวลผล import หรือกรองข้อมูลชุดใหญ่ |
| Empty State | เมื่อไม่มีข้อมูล: ไอคอน + ข้อความแนะนำ เช่น "ยังไม่มีข้อมูล — กดปุ่ม นำเข้าข้อมูล เพื่อเริ่มต้น" ห้ามแสดงจอเปล่า |

## 5. Tone

Clean, official, trustworthy — เหมาะกับธนาคารของรัฐ ไม่ใช้สีฉูดฉาด
ไม่ใช้ animation เกินจำเป็น (transition ≤ 200ms)
