# CODE CONTRACT — Technical Rules & Definition of Done

## 1. Output Contract

- **Exactly one file: `index.html`** — all CSS in `<style>`, all JS in
  `<script>`, sample data embedded as a JS array.
- Opens by **double-click** (file://) — no server, no build, no framework,
  no module imports. Vanilla HTML/CSS/JS only.
- `<html lang="th">`, `<meta charset="UTF-8">`, responsive viewport meta.

## 2. Allowed CDN Libraries (only these)

| Library | Purpose |
|---|---|
| Chart.js 4.x (jsdelivr) | charts |
| SheetJS `xlsx` 0.18+ (jsdelivr) | import/export Excel |
| Google Fonts — Kanit | Thai font |

- PDF export = `window.print()` + `@media print` stylesheet (พิมพ์เฉพาะ
  ส่วน dashboard, ซ่อน sidebar/ปุ่ม) — do **not** use jsPDF (Thai font issues).
- If a CDN fails to load, the page must not crash: guard with existence
  checks and show a Thai warning banner instead.

## 3. Code Structure (inside the single file)

```js
// ===== CONFIG (theme tokens, role matrix) =====
// ===== SAMPLE DATA (replace with real data) =====
// ===== STATE (current user, filters, drill path, theme) =====
// ===== AUTH (login/logout/session timeout/audit) =====
// ===== RENDER (kpi, charts, table, menu by role) =====
// ===== EVENTS (filters, sort, search, drill down, import/export, reset) =====
// ===== INIT =====
```

- Functions small and named in English; UI strings in Thai only.
- Re-render charts by updating data (destroy/recreate Chart instances to
  avoid memory leaks when filtering).

## 4. Sample Data Rules

- ≥ 120 rows, realistic Thai content: ชื่อ-นามสกุลไทย, สาขา/จังหวัดจริง
  (เช่น เชียงใหม่ ขอนแก่น อุบลราชธานี สงขลา), เงินเป็นบาทสมจริง,
  วันที่กระจาย 12 เดือนล่าสุด, สถานะกระจายแบบสมเหตุผล (NPL ~5–10%)
- All KPIs/charts/tables must be **computed from this one dataset** —
  no hardcoded chart numbers that disagree with the table.

## 5. DEFINITION OF DONE — self-check before responding

ตรวจทุกข้อ ถ้าข้อใดไม่ผ่าน ให้แก้โค้ดก่อนส่งคำตอบ:

- [ ] 1. เปิดไฟล์แล้วเจอหน้า Login พร้อม hint บัญชีทดสอบ 4 บัญชี
- [ ] 2. Login ทั้ง 4 role ได้ และเมนู/ปุ่มแสดงตามสิทธิ์ (เช่น Viewer ไม่เห็นปุ่ม Export)
- [ ] 3. KPI 4 ใบแสดงค่าที่คำนวณจาก dataset จริง + tooltip คำนิยาม
- [ ] 4. กราฟครบตาม requirements, tooltip ภาษาไทย
- [ ] 5. คลิกกราฟ → drill down → breadcrumb แสดงเส้นทางและย้อนกลับได้
- [ ] 6. Filter ทุกตัวทำงานและกระทบทั้ง KPI + กราฟ + ตาราง พร้อมปุ่มล้างตัวกรอง
- [ ] 7. ตาราง: sort ทุกคอลัมน์ (มีลูกศร ASC/DESC), ค้นหา, แบ่งหน้า
- [ ] 8. Import .csv/.xlsx ได้ มี progress bar และสรุปผลการนำเข้า
- [ ] 9. Export CSV / Excel / PDF (print) ได้ และถูกซ่อนจาก role ที่ไม่มีสิทธิ์
- [ ] 10. Dark mode toggle ทำงาน และจำค่าเมื่อ refresh
- [ ] 11. Empty state ภาษาไทยเมื่อกรองแล้วไม่พบข้อมูล (ไม่มีจอเปล่า)
- [ ] 12. Session timeout 15 นาที + ปุ่ม logout ทำงาน
- [ ] 13. Audit log บันทึก login/logout/import/export/edit/delete/reset และ Admin/Manager เปิดดูได้
- [ ] 14. Reset 3 ระดับทำงานตามสิทธิ์ พร้อม dialog ยืนยันภาษาไทย
- [ ] 15. Responsive: มือถือ sidebar เป็น hamburger, การ์ดเรียงแนวตั้ง, font ≥ 16px
- [ ] 16. ไม่มี error ใน console เมื่อใช้งานครบทุกฟีเจอร์
