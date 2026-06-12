# 01 — Architecture & Tech Stack

## 1. สถาปัตยกรรมรวม

Mockup ฝั่ง Enterprise Architecture เสนอ Microservices เต็มรูปแบบ
แต่สำหรับการพัฒนาจริงให้เริ่มจาก **Modular Monolith** ก่อน (แยกโมดูลชัดเจนในโค้ด
แต่ deploy เป็นบริการเดียว) เพื่อให้ Copilot พัฒนาได้เร็วและทดสอบง่าย
แล้วค่อยแตกเป็น Microservices เมื่อจำเป็น

```
[ Web App (React SPA) ]
        │ HTTPS / JSON
        ▼
[ API Server (NestJS) ]──── JWT Auth + RBAC Guard
        │
        ├── modules/auth          (login, refresh, roles)
        ├── modules/users         (RM, ผจก., ผู้บริหาร)
        ├── modules/kpi           (เป้าหมาย, ผลจริง, คะแนน)
        ├── modules/leads         (lead + assignment + kanban)
        ├── modules/customers     (customer 360)
        ├── modules/credit        (credit workflow + SLA)
        ├── modules/tasks         (task & todo)
        ├── modules/requests      (เบิกจ่าย + approval chain)
        ├── modules/reports       (aggregate + export)
        ├── modules/intelligence  (rule-based insights)
        └── modules/integrations  (mock adapters + health status)
        │
        ▼
[ PostgreSQL ]   [ Redis (cache/session) ]   [ Object Storage / local disk (ไฟล์แนบ) ]
```

## 2. Tech Stack (ตัดสินใจแล้ว — ให้ Copilot ใช้ตามนี้)

| Layer | เทคโนโลยี | หมายเหตุ |
|---|---|---|
| Frontend | **React 18 + TypeScript + Vite** | SPA |
| UI | **TailwindCSS** | ทำ design tokens จากตัวแปรสีใน mockup |
| State/Data | **TanStack Query** + Zustand | server state / client state |
| Routing | React Router v6 | |
| Charts | **Recharts** | bar / progress ตาม mockup |
| Drag & Drop | **@dnd-kit** | Kanban board |
| Backend | **NestJS (Node 20, TypeScript)** | Modular monolith |
| ORM | **Prisma** | migration + typed client |
| Database | **PostgreSQL 16** | |
| Cache | Redis (optional Phase 2+) | |
| Auth | JWT (access 15 นาที + refresh 7 วัน), bcrypt | ออกแบบ interface เผื่อสลับเป็น SSO/iAuthen ภายหลัง |
| Validation | zod (FE) / class-validator (BE) | |
| Testing | Vitest (FE), Jest + Supertest (BE) | |
| Dev env | Docker Compose (postgres + redis + api + web) | |
| CI | GitHub Actions: lint + test + build | |

## 3. โครงสร้าง Repository (Monorepo)

```
pmp/
├── docker-compose.yml
├── package.json                 # npm workspaces
├── apps/
│   ├── web/                     # React SPA
│   │   ├── src/
│   │   │   ├── app/             # router, providers, layout
│   │   │   ├── components/      # shared UI (Card, Badge, DataTable, Stepper, ...)
│   │   │   ├── features/        # 1 โฟลเดอร์ต่อโมดูล (dashboard, kpi, leads, ...)
│   │   │   ├── lib/             # api client, auth, utils
│   │   │   └── styles/
│   │   └── ...
│   └── api/                     # NestJS
│       ├── prisma/schema.prisma
│       ├── src/
│       │   ├── modules/<module>/   # controller, service, dto, spec
│       │   └── common/             # guards, interceptors (audit), filters
│       └── ...
└── packages/
    └── shared/                  # shared types/enums (สถานะ lead, role, ฯลฯ)
```

## 4. Cross-cutting Concerns

### 4.1 RBAC
- Roles: `ADMIN`, `EXECUTIVE`, `CENTER_MANAGER`, `RM`
- ใช้ decorator `@Roles(...)` + Guard ที่ระดับ endpoint
- Data scoping: RM เห็นเฉพาะลูกค้า/lead/งานของตัวเอง, ผจก.ศูนย์เห็นทั้งศูนย์, ผู้บริหาร/Admin เห็นทั้งหมด — บังคับใน service layer ทุกตัว

### 4.2 Audit Trail
- Interceptor กลางบันทึกทุก mutation (`POST/PUT/PATCH/DELETE`) ลงตาราง `audit_logs`: actor, action, entity, entityId, payload (mask ฟิลด์อ่อนไหว), ip, timestamp

### 4.3 SLA Engine
- งาน/ขั้นตอนสินเชื่อมี `dueAt` คำนวณจาก `slaDays` ของขั้นตอน
- Scheduled job (Nest `@Cron` ทุกชั่วโมง) อัปเดตสถานะ `ON_TRACK / DUE_TODAY / OVERDUE` และสร้าง Notification

### 4.4 Notification
- Phase แรก: in-app เท่านั้น (ตาราง `notifications` + badge กระดิ่งบน header, poll ทุก 60s)
- เผื่อ interface สำหรับ Email/SMS adapter ภายหลัง

### 4.5 External Integration
- ทุกระบบภายนอก (Core Banking, NCB, ธปท., บสย., เงินฝาก, หลักประกัน) เขียนเป็น **Adapter interface + Mock implementation** ก่อน
- ตาราง `integration_endpoints` เก็บสถานะ health (`CONNECTED / MAINTENANCE / DOWN`) แสดงในโมดูล 9

### 4.6 PDPA / Data Masking
- ฟิลด์อ่อนไหว (เลขบัตร, เบอร์โทร) เก็บเต็มใน DB แต่ API ส่งออกแบบ mask ตาม role; เฉพาะ role ที่มีสิทธิ์ขอ unmask ได้ (และถูก audit)

## 5. Design Tokens (จาก mockup)

```css
--green-dark:#1B5E20; --green-mid:#2E7D32; --green-light:#4CAF50;
--gold:#DAA520; --gold-bright:#FFD700; --gold-dark:#B8860B;
--bg:#f4f6f0; --red:#e53935; --orange:#FB8C00; --blue:#1976D2; --teal:#00897B;
font-family:'Prompt',sans-serif;
```
- Layout: Header 70px (fixed) + Tab bar + Sidebar 250px (ซ่อนเมื่อ < 768px)
- Dark mode: toggle class ที่ `<html>`, ใช้ Tailwind `dark:` variants
