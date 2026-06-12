# 02 — Data Model

> ใช้เป็นต้นแบบเขียน `prisma/schema.prisma` — ชื่อ enum/ฟิลด์ให้ใช้ตามนี้
> ทุกตารางมี `id (uuid)`, `createdAt`, `updatedAt` เว้นแต่ระบุอื่น

## 1. Users & Org

```
BusinessCenter      ศูนย์ธุรกิจ
- name, region (BANGKOK|CENTRAL|NORTH|NORTHEAST|SOUTH)

User
- email (unique), passwordHash, fullName, role (ADMIN|EXECUTIVE|CENTER_MANAGER|RM)
- centerId -> BusinessCenter (nullable สำหรับ EXECUTIVE/ADMIN)
- isActive

RefreshToken
- userId, tokenHash, expiresAt, revokedAt?
```

## 2. Customers (Customer 360)

```
Customer
- cifNumber (unique, รูปแบบ CUS-YYYY-NNNNN)
- companyName, businessType, status (ACTIVE|INACTIVE|WATCHLIST)
- riskGrade (A_PLUS|A|B|C|D), riskSegment (GREEN|YELLOW|ORANGE|RED)
- creditLimit (Decimal), outstandingBalance (Decimal)
- lastReviewDate?, latitude?, longitude?
- rmId -> User (RM ผู้ดูแล), centerId -> BusinessCenter

CustomerNote                 (Short Note)
- customerId, authorId, content, noteType (CALL_REPORT|SHORT_NOTE|VISIT)

CustomerLoan                 (แท็บสินเชื่อ)
- customerId, loanType (TERM_LOAN|OD|TRADE_FINANCE|PN), amount, outstanding, status

Collateral                   (แท็บหลักประกัน)
- customerId, type, description, appraisalValue, appraisalDate
```

## 3. Leads & Kanban

```
Lead
- customerName, requestedAmount (Decimal)
- source (NEW_LEAD|GOV_POLICY|CROSS_SELL|REFERRAL)
- status (UNASSIGNED|IN_PROGRESS|AWAITING_DOCS|COMPLETED)   ← คอลัมน์ Kanban
- subStatus? (free text เช่น "รอ Appraisal", "รองบการเงิน")
- assignedRmId? -> User, centerId, customerId? (ผูกเมื่อแปลงเป็นลูกค้า)
- slaDueAt?, position (ลำดับการ์ดในคอลัมน์)

LeadActivity
- leadId, actorId, action (CREATED|ASSIGNED|STATUS_CHANGED|COMMENT), detail
```

## 4. Credit Workflow

ขั้นตอนมาตรฐาน 6 ขั้น (seed ลง `CreditStageTemplate`):

| order | ชื่อขั้น | slaDays |
|---|---|---|
| 1 | รับ Lead | 3 |
| 2 | ตรวจเอกสาร | 5 |
| 3 | วิเคราะห์สินเชื่อ | 7 |
| 4 | ประเมินหลักประกัน | 5 |
| 5 | เสนออนุมัติ | 3 |
| 6 | อนุมัติ & สัญญา | 5 |

```
CreditApplication
- customerId, leadId?, requestedAmount, currentStageOrder (1-6)
- status (IN_PROGRESS|APPROVED|REJECTED|RETURNED)
- rmId, centerId

CreditStageTemplate
- order, nameTh, slaDays

CreditApplicationStage       (สร้าง 6 แถวเมื่อเปิดใบคำขอ)
- applicationId, stageOrder, startedAt?, completedAt?, dueAt?
- slaStatus (PENDING|ON_TRACK|DUE_TODAY|OVERDUE|DONE)
- actualDays?, note?
```

## 5. KPI & Policy

```
KpiDefinition
- nameTh (เช่น "สินเชื่อใหม่"), unit (เช่น "ล้านบาท"), periodType (QUARTER|MONTH)

KpiTarget                    (เป้า 4 scenario ต่อช่วงเวลา ต่อ scope)
- kpiDefinitionId, period (เช่น "2569-Q2")
- scopeType (BANK|CENTER|RM), scopeId? (centerId หรือ userId)
- best, base, conservative, worst (Decimal)

KpiActual
- kpiTargetId, value (Decimal), recordedAt
- score (Decimal 1-5, คำนวณ: เทียบ value กับ 4 ระดับเป้าแบบ linear interpolation,
  >= best → 5, = base → 3.5, = conservative → 2.5, <= worst → 1)
```

## 6. Tasks & To-do

```
Task
- title, taskType (LEAD_FOLLOWUP|CALL_REPORT|CREDIT_REVIEW|REPORT|MEETING|OTHER)
- dueDate, status (TODO|IN_PROGRESS|DONE|OVERDUE)
- ownerId -> User, customerId?, leadId?
- ownerId มาจากการมอบหมายหรือสร้างเอง
```

## 7. Requests & Approval (เบิกจ่าย)

```
ExpenseRequest
- requestNumber (REQ-YYYY-NNN, running ต่อปี)
- requesterId, requestType (TRAVEL|ACCOMMODATION|ENTERTAINMENT|CAR|OTHER)
- amount (Decimal), description, attachmentUrl?
- status (PENDING|APPROVED|REJECTED|RETURNED)
- currentApproverId -> User

ApprovalAction
- requestId, approverId, action (APPROVE|REJECT|RETURN), comment?, actedAt
```

กติกาสายอนุมัติ: ≤ ฿5,000 → ผจก.ศูนย์ | > ฿5,000 → ผจก.ศูนย์ แล้วต่อด้วยผู้บริหาร (2 ขั้น)

## 8. Intelligence, Notifications, Integration, Audit

```
Insight                      (rule-based Phase 1)
- customerId, type (RISK_ALERT|PRODUCT_RECOMMENDATION|CROSS_SELL)
- title, detail, severity (INFO|WARN|DANGER), isDismissed

Notification
- userId, title, body, type (SLA|APPROVAL|LEAD|SYSTEM), isRead, linkUrl?

IntegrationEndpoint
- code (CORE_BANKING|NCB|BOT|TCG|DEPOSIT|COLLATERAL|EMAIL_SMS|SSO)
- nameTh, status (CONNECTED|MAINTENANCE|DOWN), lastCheckedAt

AuditLog                     (append-only, ไม่มี updatedAt)
- actorId?, action, entity, entityId?, payload (jsonb, masked), ipAddress
```

## 9. Seed Data

สร้าง `prisma/seed.ts` ให้มีข้อมูลสาธิตสอดคล้องกับ mockup:
- ศูนย์ธุรกิจ 5 ภูมิภาค, ผู้ใช้ครบ 4 role (รหัสผ่านทดสอบ `Passw0rd!`)
- ลูกค้า ~20 ราย (รวม บจ.ไทยเจริญ CIF CUS-2569-00142, Risk A+), lead ~10 ใบกระจาย 4 คอลัมน์
- ใบคำขอสินเชื่อ 1 ใบอยู่ขั้นที่ 3, KPI Q2/2569 ครบ 5 ตัวชี้วัดพร้อมผลจริง
- งาน 5 รายการ (มี overdue), คำขอเบิกจ่าย 4 ใบ, insights 3 รายการ, integration endpoints 8 รายการ
