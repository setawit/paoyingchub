# 03 — API Specification (REST)

> Base URL: `/api/v1` — ทุก endpoint (ยกเว้น auth) ต้องส่ง `Authorization: Bearer <accessToken>`
> Response ห่อรูปแบบเดียวกัน: `{ "data": ..., "meta": { page, pageSize, total }? }`
> Error: `{ "error": { "code": "STRING_CODE", "message": "ข้อความภาษาไทย" } }`
> รายการแบบ list รองรับ `?page=&pageSize=&sort=&q=` เป็นมาตรฐาน

## Auth — `/auth`
| Method | Path | Role | คำอธิบาย |
|---|---|---|---|
| POST | `/auth/login` | public | body `{email, password}` → `{accessToken, refreshToken, user}` |
| POST | `/auth/refresh` | public | `{refreshToken}` → token ชุดใหม่ (rotate) |
| POST | `/auth/logout` | ทุก role | revoke refresh token |
| GET | `/auth/me` | ทุก role | ข้อมูลผู้ใช้ + role + center |

## Users — `/users` (ADMIN; GET สำหรับ manager ขึ้นไป)
CRUD มาตรฐาน + `PATCH /users/:id/activate|deactivate`

## Dashboard — `/dashboard`
| GET | `/dashboard/summary` | การ์ด 4 ใบ: outstanding รวม, lead ใหม่วันนี้, งานเกิน SLA, call report วันนี้ — scope ตาม role |
| GET | `/dashboard/pipeline-by-region` | `[{region, amount}]` |
| GET | `/dashboard/kpi-progress` | `[{kpiName, percent}]` ของ user/scope ปัจจุบัน |
| GET | `/dashboard/sla-alerts` | งาน/ขั้นตอนที่ OVERDUE / DUE_TODAY / ใกล้ครบ |

## Leads — `/leads`
| GET | `/leads?status=&assignedRmId=` | list (RM เห็นของตัวเอง) |
| POST | `/leads` | สร้าง lead (manager ขึ้นไป) |
| GET | `/leads/:id` | รายละเอียด + activities |
| PATCH | `/leads/:id` | แก้ไขข้อมูล |
| PATCH | `/leads/:id/assign` | `{rmId}` มอบหมาย (manager) → สร้าง Notification ถึง RM |
| PATCH | `/leads/:id/status` | `{status, subStatus?, position}` ใช้ตอนลากการ์ด Kanban — บันทึก LeadActivity |

## Customers — `/customers`
| GET | `/customers?q=&riskSegment=&rmId=` | list + ค้นหา |
| POST / GET `/:id` / PATCH `/:id` | CRUD |
| GET | `/customers/:id/loans` `/collaterals` `/notes` `/insights` | ข้อมูลรายแท็บ |
| POST | `/customers/:id/notes` | เพิ่ม Short Note / Call Report |

## Credit — `/credit-applications`
| GET | `/credit-applications?status=` | list ตาม scope |
| POST | `/credit-applications` | เปิดใบคำขอ → สร้าง stage 6 แถว, ขั้น 1 เริ่มทันที (`dueAt = now + slaDays`) |
| GET | `/credit-applications/:id` | ใบคำขอ + stages ทั้งหมด (สำหรับ Stepper + ตาราง SLA) |
| PATCH | `/credit-applications/:id/stages/:order/complete` | ปิดขั้นปัจจุบัน คำนวณ `actualDays` แล้วเริ่มขั้นถัดไป; ขั้น 6 เสร็จ → status APPROVED |
| PATCH | `/credit-applications/:id/reject` `/return` | จบ/ตีกลับใบคำขอ พร้อม `note` |

## KPI — `/kpi`
| GET | `/kpi/definitions` | ตัวชี้วัดทั้งหมด |
| GET | `/kpi/targets?period=&scopeType=&scopeId=` | เป้า + actual + score (ตารางหน้า KPI) |
| POST | `/kpi/targets` | ตั้งเป้า 4 scenario (EXECUTIVE) |
| POST | `/kpi/targets/:id/actuals` | บันทึกผลจริง → server คำนวณ score |
| GET | `/kpi/comparison?period=` | `% of Base` ต่อ KPI (กราฟ Actual vs Forecast) |

## Tasks — `/tasks`
CRUD มาตรฐาน + | GET | `/tasks/summary` | `{total, inProgress, overdue, doneThisMonth}` |
`PATCH /tasks/:id/status` เปลี่ยนสถานะ; job รายชั่วโมง mark OVERDUE อัตโนมัติ

## Expense Requests — `/expense-requests`
| GET | `/expense-requests?mine=true` | ของตัวเอง / ที่รอเราอนุมัติ (`?pendingApproval=true`) |
| POST | `/expense-requests` | สร้าง (multipart รองรับไฟล์แนบ ≤ 10MB, pdf/jpg/png) → กำหนด approver ตามกติกาวงเงิน |
| POST | `/expense-requests/:id/approve` `/reject` `/return` | `{comment?}` — บันทึก ApprovalAction, แจ้งเตือนผู้ขอ |

## Reports — `/reports`
| GET | `/reports/portfolio-summary` | ยอดคงค้างแยก loanType |
| GET | `/reports/npl-monitoring` | `{nplRatio, smlRatio, coverageRatio}` |
| GET | `/reports/rm-leaderboard?period=` | คะแนนเฉลี่ย KPI ต่อ RM เรียงมากไปน้อย |
| GET | `/reports/export?type=portfolio|leaderboard&format=xlsx|pdf` | stream ไฟล์ (ใช้ exceljs / pdfkit) |

## Intelligence — `/insights`
| GET | `/insights?type=&customerId=` | รายการ insight |
| GET | `/insights/risk-segmentation` | `[{segment, count, percent}]` |
| PATCH | `/insights/:id/dismiss` | ปิดการแจ้งเตือน |
| POST | `/insights/recompute` | (ADMIN) รัน rule engine ใหม่ — กติกา Phase 1 ดู task E8 |

## Notifications — `/notifications`
GET list (`?unread=true`), `PATCH /:id/read`, `PATCH /read-all`

## Integrations — `/integrations`
| GET | `/integrations/status` | endpoint ทั้ง 8 + สถานะ (หน้าโมดูล 9) |
| PATCH | `/integrations/:code/status` | (ADMIN) ปรับสถานะ manual |

## Audit — `/audit-logs` (ADMIN)
GET list + filter `?actorId=&entity=&from=&to=`
