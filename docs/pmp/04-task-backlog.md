# 04 — Task Backlog สำหรับ Copilot

> วิธีใช้: ทำตามลำดับ Epic (E0 → E10) แต่ละ Task ออกแบบให้จบใน PR เดียว
> ทุก Task ต้องอ้างอิง `01-architecture.md` (โครงสร้าง/stack), `02-data-model.md` (schema), `03-api-spec.md` (สัญญา API)
> **Definition of Done ทุก Task:** โค้ดผ่าน lint + type-check, มี test ตามที่ระบุ, รันได้จริงผ่าน `docker compose up`

---

## E0 — Project Scaffolding (Phase 1)

### E0.1 ตั้ง Monorepo + Tooling
สร้าง npm workspaces ตามโครงสร้างใน `01-architecture.md` §3: `apps/web` (Vite React TS), `apps/api` (NestJS), `packages/shared`
ตั้ง ESLint + Prettier ร่วมกัน, `tsconfig` base, GitHub Actions (lint/test/build ทั้ง 2 แอป)
- ✅ `npm run dev` รันทั้ง web (5173) และ api (3000) พร้อมกันได้
- ✅ CI ผ่านบน PR

### E0.2 Docker Compose + Prisma + Seed
`docker-compose.yml` (postgres16, redis7, api, web), เขียน `schema.prisma` ครบทุกตารางตาม `02-data-model.md`, migration แรก, `seed.ts` ตาม §9
- ✅ `docker compose up` แล้ว `npx prisma db seed` ได้ข้อมูลสาธิตครบ
- ✅ มี `.env.example`

### E0.3 Shared Types
ใน `packages/shared`: enum ทั้งหมด (Role, LeadStatus, SlaStatus, …), type ของ API envelope `{data, meta}`, error shape
- ✅ ทั้ง web และ api import จาก `@pmp/shared` ได้

---

## E1 — Auth & RBAC (Phase 1)

### E1.1 Backend Auth
`modules/auth`: login (bcrypt), JWT access 15m + refresh 7d พร้อม rotation, `/auth/me`, guard + `@Roles()` decorator
- ✅ Jest: login สำเร็จ/ผิดรหัส, refresh rotate, role guard บล็อก role ไม่ตรง

### E1.2 Audit Interceptor
Interceptor กลางบันทึก mutation ทุกตัวลง `audit_logs` (mask ฟิลด์ `password*`, `citizenId`, `phone`)
- ✅ ทดสอบว่า POST ใดๆ สร้าง audit log และ payload ถูก mask

### E1.3 Frontend Auth + Layout Shell
หน้า Login (ธีมเขียว/ทอง, ฟอนต์ Prompt), เก็บ token (memory + refresh ใน httpOnly cookie ถ้าทำได้ ไม่งั้น localStorage), axios interceptor auto-refresh, ProtectedRoute ตาม role
สร้าง Layout ตาม mockup: Header (โลโก้ RM, ชื่อผู้ใช้, กระดิ่ง, ปุ่ม Dark Mode), Sidebar 10 เมนู, responsive ซ่อน sidebar < 768px
- ✅ login → เข้า dashboard, refresh หน้าแล้วยัง login อยู่, dark mode toggle ได้และจำค่า

---

## E2 — Dashboard (Phase 1)

### E2.1 Dashboard APIs
4 endpoints ตาม `03-api-spec.md` §Dashboard พร้อม data scoping ตาม role
- ✅ Supertest: RM เห็นเฉพาะตัวเลขของตน, EXECUTIVE เห็นรวม

### E2.2 Dashboard UI
ทำตาม mockup หน้า Dashboard: การ์ด 4 ใบ, Recharts bar (Pipeline by Region), KPI Progress bars, To-do panel (ติ๊กแล้วยิง PATCH task), Recent Leads table, SLA Alerts panel (สี danger/warn/info)
- ✅ ข้อมูลมาจาก API จริง (ผ่าน TanStack Query), มี loading skeleton + error state

---

## E3 — Lead & Assignment Kanban (Phase 1)

### E3.1 Leads API
CRUD + assign + status change ตาม spec, LeadActivity log, Notification เมื่อ assign
- ✅ test: RM ขยับ lead คนอื่นไม่ได้ (403), assign แล้วเกิด notification

### E3.2 Kanban UI
4 คอลัมน์ตาม mockup, การ์ดแสดงชื่อ/วงเงิน/badge, drag & drop ด้วย @dnd-kit → optimistic update + PATCH status, ปุ่มสร้าง lead (modal), dropdown มอบหมาย RM (เฉพาะ manager)
- ✅ ลากการ์ดข้ามคอลัมน์แล้ว reload ยังอยู่คอลัมน์ใหม่, RM ไม่เห็นปุ่ม assign

---

## E4 — Customer 360 (Phase 1)

### E4.1 Customers API — CRUD, ค้นหา, sub-resources (loans/collaterals/notes/insights)
- ✅ ค้นหาด้วยชื่อ/CIF ได้, RM เห็นเฉพาะ portfolio ตัวเอง

### E4.2 Customer 360 UI
หน้า list (ตาราง + ค้นหา + filter riskSegment) → คลิกเข้าหน้า detail ตาม mockup: avatar, CIF, badge สถานะ, แท็บ 5 แท็บ (Profile / สินเชื่อ / หลักประกัน / ความเสี่ยง / Short Note), ฟอร์มเพิ่ม Short Note
- ✅ สลับแท็บโหลดข้อมูลจริง, เพิ่ม note แล้วขึ้นทันที

---

## E5 — Task & To-do (Phase 1)

### E5.1 Tasks API + Cron OVERDUE + `/tasks/summary`
- ✅ test การคำนวณ summary และ job mark overdue

### E5.2 Tasks UI — การ์ดสรุป 4 ใบ + ตารางงานตาม mockup, สร้าง/แก้/เปลี่ยนสถานะผ่าน modal, badge สีตามสถานะ
- ✅ สร้างงานใหม่แล้วเห็นใน Dashboard To-do ด้วย

---

## E6 — Credit Workflow + SLA (Phase 2)

### E6.1 Credit API — เปิดใบคำขอ (gen 6 stages), complete/reject/return, SLA cron (`ON_TRACK/DUE_TODAY/OVERDUE` + notification)
- ✅ test: complete ขั้น 3 แล้วขั้น 4 เริ่มและมี dueAt ถูกต้อง; ขั้น 6 เสร็จ → APPROVED

### E6.2 Credit UI — Stepper 6 ขั้นตาม mockup (เขียว=เสร็จ, ทอง=กำลังทำ, เทา=รอ), ตาราง SLA Tracking, ปุ่ม action ตาม role
- ✅ กด "เสร็จสิ้นขั้นตอน" แล้ว stepper ขยับ

---

## E7 — KPI & Policy (Phase 2)

### E7.1 KPI API — targets 4 scenario, actuals + สูตรคะแนน (interpolation ตาม `02-data-model.md` §5), comparison
- ✅ unit test สูตรคะแนน: value=base → 3.5, ≥best → 5, ≤worst → 1, ระหว่างกลาง interpolate

### E7.2 KPI UI — ตารางเป้า Q (7 คอลัมน์ตาม mockup, badge สีตามคะแนน: ≥3.5 เขียว, 3-3.5 น้ำเงิน, <3 ส้ม), กราฟ % of Base, ฟอร์มตั้งเป้า (EXECUTIVE เท่านั้น)

---

## E8 — Request & Approval (Phase 2)

### E8.1 Expense API — สร้างพร้อมไฟล์แนบ, running number `REQ-YYYY-NNN`, สายอนุมัติตามวงเงิน (≤5,000 → ผจก. | >5,000 → ผจก.+ผู้บริหาร), approve/reject/return + notification
- ✅ test: คำขอ 8,000 ต้องผ่าน 2 ขั้น; RETURN แล้วผู้ขอแก้และส่งใหม่ได้

### E8.2 Expense UI — ฟอร์มซ้าย + ตารางสถานะขวาตาม mockup, หน้า "รออนุมัติ" สำหรับ manager พร้อมปุ่ม อนุมัติ/ตีกลับ/ปฏิเสธ + comment

---

## E9 — Reporting & Intelligence (Phase 3)

### E9.1 Reports API + Export xlsx/pdf (exceljs, pdfkit)
- ✅ ไฟล์ export เปิดได้และตัวเลขตรงกับ API

### E9.2 Reporting UI — Portfolio bars, NPL/SML/Coverage progress, RM Leaderboard (🥇🥈🥉), ปุ่ม Export

### E9.3 Insight Rule Engine (rule-based Phase 1)
กติกาเริ่มต้น 3 ข้อ — implement เป็น strategy pattern เพิ่มกติกาภายหลังได้:
1. `RISK_ALERT`: ลูกค้า riskSegment RED/ORANGE หรือมี loan ค้างชำระ → severity DANGER
2. `CROSS_SELL`: ลูกค้ามี loan ≥ 2 ประเภท แต่ยังไม่มีประเภทที่เหลือ → INFO
3. `PRODUCT_RECOMMENDATION`: businessType ตรงกับ mapping ผลิตภัณฑ์ (เก็บเป็น config) → INFO
- ✅ `POST /insights/recompute` สร้าง insight ตามกติกา, unit test ครบ 3 กติกา

### E9.4 Intelligence UI — การ์ด insight 3 ประเภท, กราฟ Risk Segmentation, แจ้งเตือนสำคัญ, ปุ่ม dismiss

---

## E10 — Integration Status + Notifications + Admin (Phase 3)

### E10.1 Notifications API + กระดิ่งบน Header (poll 60s, badge unread, dropdown รายการ, mark read)
### E10.2 Integration Status — mock adapter interface + หน้าโมดูล 9 ตาม mockup (การ์ดสถานะ 8 ระบบ + ตาราง Security features)
### E10.3 Admin — จัดการผู้ใช้ (CRUD + reset password) และหน้าดู Audit Log พร้อม filter

---

## ลำดับการทำ & Dependencies

```
E0 → E1 → { E2, E3, E4, E5 ขนานกันได้ } → E6 → { E7, E8 } → { E9, E10 }
```

## หมายเหตุสำหรับ Copilot

1. **ห้ามเปลี่ยน schema/enum เอง** — ถ้าจำเป็นให้บันทึกเหตุผลใน PR description
2. ข้อความ UI ทั้งหมดเป็น **ภาษาไทย** ตาม mockup; โค้ด/ชื่อตัวแปรเป็นอังกฤษ
3. ตัวเลขเงินใช้ `Decimal` (Prisma) ห้ามใช้ float; แสดงผลรูปแบบ `฿15,230 ล้าน`
4. วันที่ในระบบเก็บ UTC, แสดงผลเป็นพุทธศักราช (พ.ศ.) ด้วย `Intl.DateTimeFormat('th-TH')`
5. ทุก endpoint ใหม่ต้องมี e2e test อย่างน้อย happy path + 1 กรณี forbidden
6. UI component ที่ซ้ำ (Card, Badge, DataTable, ProgressBar, Stepper, KanbanColumn) ให้สร้างใน `apps/web/src/components` ครั้งเดียวแล้ว reuse
