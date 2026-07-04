# 06 — API Specification
## FarmPlan Operating System (FPOS)

> Version: 1.0
> Last Updated: 2026-07-04
> Status: Draft
> Owner: Backend Engineer

---

# 1. Purpose

เอกสารนี้กำหนด REST API ที่ **เปิดเผย (expose)** Entity จาก
[`02_DOMAIN_MODEL.md`](02_DOMAIN_MODEL.md) และเรียกใช้ Optimization Engine
([`04_OPTIMIZATION_ENGINE.md`](04_OPTIMIZATION_ENGINE.md))

API **ไม่นิยาม Entity ใหม่** — request/response ใช้ฟิลด์ตาม `02` เท่านั้น

---

# 2. Conventions

- Base path: `/api/v1`
- รูปแบบข้อมูล: JSON (UTF-8, รองรับภาษาไทย)
- Versioning: ใส่เวอร์ชันใน path (`/v1`) — breaking change ขึ้นเวอร์ชันใหม่
- Auth: Bearer token (รายละเอียด deployment ที่ [`11_DEPLOYMENT.md`](11_DEPLOYMENT.md))
- ทุก timestamp เป็น ISO-8601

---

# 3. Resource Endpoints

Resource map ตรงกับ Entity ใน `02` แบบ RESTful มาตรฐาน

| Entity (`02`) | Collection | Item |
| --- | --- | --- |
| Farm | `GET/POST /farms` | `GET/PATCH/DELETE /farms/{id}` |
| Plot | `GET/POST /farms/{id}/plots` | `GET/PATCH/DELETE /plots/{id}` |
| WaterSource | `GET/POST /farms/{id}/water-sources` | `.../water-sources/{id}` |
| Resource | `GET/POST /farms/{id}/resources` | `.../resources/{id}` |
| Scenario | `GET/POST /farms/{id}/scenarios` | `GET/PATCH/DELETE /scenarios/{id}` |
| Plan | `GET /scenarios/{id}/plan` | `GET /plans/{id}` |
| Crop | `GET /crops` (จาก KB) | `GET /crops/{id}` |
| Livestock | `GET /livestock` (จาก KB) | `GET /livestock/{id}` |
| Recommendation | `GET /plans/{id}/recommendations` | — |

> `Allocation`, `Activity`, `CostItem`, `RevenueItem`, `CashflowEntry`, `RiskFactor`
> ถูกส่งคืน **ฝังอยู่ใน Plan** (nested) เพราะเป็นองค์ประกอบของแผน ไม่ใช่ทรัพยากรอิสระ

---

# 4. Action Endpoints

การกระทำเชิงกระบวนการ (ไม่ใช่ CRUD ล้วน)

| Endpoint | Method | หน้าที่ |
| --- | --- | --- |
| `/scenarios/{id}/optimize` | POST | รัน Optimization Engine → สร้าง/อัปเดต `Plan` |
| `/plans/{id}/cashflow` | GET | คืน `CashflowEntry` รายเดือนของแผน |
| `/plans/{id}/risk` | GET | คืน `RiskFactor` ของแผน |
| `/scenarios/compare` | POST | เปรียบเทียบหลาย `Plan` (body: scenario ids) |
| `/assistant/ask` | POST | ถาม AI Agent (ดู `08`) — คืน `Recommendation` |

---

# 5. Example — Optimize

**Request**

```http
POST /api/v1/scenarios/scn_123/optimize
```

**Response 200**

```json
{
  "plan": {
    "id": "plan_456",
    "scenario_id": "scn_123",
    "status": "optimized",
    "objective_value": 18250.0,
    "expected_income": 21000.0,
    "risk_score": 0.34,
    "allocations": [
      { "id": "alc_1", "plot_id": "plt_1", "crop_id": "crop_rice_rd6",
        "area_rai": 1.0, "quantity": null }
    ],
    "cashflow": [
      { "month": 1, "inflow": 0, "outflow": 3200, "net": -3200, "cumulative": -3200 }
    ],
    "risk_factors": [
      { "type": "price", "likelihood": "medium", "impact": "high",
        "mitigation": "ทำสัญญาซื้อขายล่วงหน้า" }
    ]
  },
  "recommendations": [
    {
      "message": "แนะนำปลูกข้าว กข6 เต็มแปลง",
      "reasoning": "ข้อจำกัดน้ำถูกใช้เต็ม (binding); ตัวเลือกนี้ให้รายได้มั่นคงสุดภายใต้ risk_appetite=low",
      "assumptions": "ราคาข้าวใช้ค่ากลางจาก KB (is_estimate=true)",
      "confidence": "medium",
      "data_sources": ["kb:crop_rice_rd6", "kb:price_rice_2026"]
    }
  ]
}
```

> ทุกฟิลด์ข้างบนตรงกับ `02` — `objective_value`/`risk_score` มาจาก `04`,
> `reasoning`/`assumptions`/`confidence`/`data_sources` บังคับตาม `00_MASTER.md` §9

---

# 6. Error Model

```json
{
  "error": {
    "code": "INFEASIBLE_PLAN",
    "message": "ไม่พบแผนที่เป็นไปได้ภายใต้ข้อจำกัด",
    "details": { "binding_constraint": "capital" }
  }
}
```

| HTTP | code | ความหมาย |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | ข้อมูลเข้าไม่ถูกต้อง |
| 404 | `NOT_FOUND` | ไม่พบทรัพยากร |
| 409 | `SYNC_CONFLICT` | ขัดแย้งตอนซิงก์ offline→online (ดู `03` §2) |
| 422 | `INFEASIBLE_PLAN` | Optimize แล้วไม่มีคำตอบที่เป็นไปได้ |

---

# 7. Offline & Sync

ตาม **Offline Friendly** (`00_MASTER.md` §7) — client ทำ CRUD และ optimize บน SQLite ได้เอง
แล้วซิงก์ผ่าน endpoint เดียวกันเมื่อออนไลน์; conflict คืน `409 SYNC_CONFLICT`

---

# 8. Cross Reference

- Entities exposed here: [`02_DOMAIN_MODEL.md`](02_DOMAIN_MODEL.md)
- Optimize behavior: [`04_OPTIMIZATION_ENGINE.md`](04_OPTIMIZATION_ENGINE.md)
- `/assistant/ask` behavior: [`08_AGENT_SYSTEM.md`](08_AGENT_SYSTEM.md)
- Persistence: [`03_DATABASE.md`](03_DATABASE.md)
- API code location: [`/api`](api/)
