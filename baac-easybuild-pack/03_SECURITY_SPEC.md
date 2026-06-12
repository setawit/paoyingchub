# SECURITY SPEC — Login / Roles / Audit (Prototype-grade, mocked in JS)

> This is a **front-end prototype**. Implement all of this client-side with
> mock data — no real backend. State lives in `localStorage`.

## 1. Authentication (mock)

- **Login page** shown first: username + password + ปุ่ม "เข้าสู่ระบบ"
  + ลิงก์ "ลืมรหัสผ่าน" (เปิด modal จำลองขั้นตอน reset — ไม่ต้องส่งอีเมลจริง)
- **Logout** button in header → clear session, กลับหน้า login
- **Session timeout**: 15 นาทีไม่มีการใช้งาน → แจ้งเตือนและ logout อัตโนมัติ
- Hardcode these 4 test accounts and show them as a hint on the login page:

| username | password | role |
|---|---|---|
| `admin`   | `admin123`   | System Administrator |
| `manager` | `manager123` | Manager |
| `officer` | `officer123` | Officer |
| `viewer`  | `viewer123`  | Viewer |

## 2. Role Permission Matrix (enforce in UI: hide/disable per role)

| Capability | Admin | Manager | Officer | Viewer |
|---|:-:|:-:|:-:|:-:|
| ดู Dashboard | ✅ | ✅ | ✅ | ✅ |
| Drill Down / Filter / Search | ✅ | ✅ | ✅ | ✅ |
| Export (CSV/Excel/PDF) | ✅ | ✅ | ✅ | ❌ |
| Import ข้อมูล | ✅ | ✅ | ❌ | ❌ |
| แก้ไข/ลบข้อมูลรายแถว | ✅ | ❌ | ❌ | ❌ |
| ดู Audit Log | ✅ | ✅ | ❌ | ❌ |
| Reset ข้อมูล (ทุกระดับ) | ✅ | ❌ | ❌ | ❌ |
| จัดการผู้ใช้ (หน้า mock) | ✅ | ❌ | ❌ | ❌ |

เมนูใน sidebar ต้องแสดงเฉพาะรายการที่ role นั้นมีสิทธิ์

## 3. Audit Log

Record to `localStorage` (and display in an "ประวัติการใช้งาน" page for
Admin/Manager): **login, logout, import, export, edit, delete, reset** —
each entry = timestamp (เวลาไทย), username, role, action, รายละเอียด

## 4. Reset Levels (Admin only, each with a Thai confirmation dialog)

1. **ล้างตัวกรอง** — reset filters to default (อันนี้ทุก role ใช้ได้)
2. **ลบข้อมูลที่นำเข้า** — remove imported dataset, revert to sample data
3. **Factory Reset** — clear everything in `localStorage` (ต้องพิมพ์ `RESET` ยืนยัน)

## 5. Performance Targets (keep interactions snappy)

Dashboard first render ≤ 5s · filter ≤ 3s · sort ≤ 2s · drill down ≤ 3s
— with sample data these should all feel instant; avoid O(n²) loops over rows.
