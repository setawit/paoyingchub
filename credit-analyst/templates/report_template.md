<!--
ANALYST REPORT TEMPLATE — รายงานเชิงบรรยายสำหรับผู้อ่าน/ผู้อนุมัติสินเชื่อ
กรอกจาก JSON เดียวกับ raw data — ตัวเลขต้องตรงกันเป๊ะ
-->

# รายงานวิเคราะห์สินเชื่อ — {{statement_id}}

> ธนาคาร {{bank}} · บัญชี {{account_type}} · ช่วง {{period_start}} → {{period_end}}
> สกัดโดย {{extracted_by}} ({{extraction_date}}) · Anonymized: {{anonymized}}

---

## ส่วนที่ 1 — Executive Summary

| Metric | ค่า |
|---|---|
| Total Inflow | **{{total_inflow.amount}}** บาท ({{total_inflow.count}} ครั้ง) |
| Total Outflow | **{{total_outflow.amount}}** บาท ({{total_outflow.count}} ครั้ง) |
| 🔻 Absolute Lowest Balance | **{{lowest_balance.amount}}** บาท ({{lowest_balance.date}}) |
| 🔺 Highest Balance | {{highest_balance.amount}} บาท ({{highest_balance.date}}) |
| Swing Value | {{swing_value}} บาท |
| Utilization Rate | {{utilization_rate_pct}}% |
| Average Daily Balance | {{avg_daily_balance}} บาท |
| วันที่ยอด < {{threshold}} บาท | {{days_below_threshold.days}} วัน |
| **Reconciliation** | {{matched}} (ส่วนต่าง {{difference}} บาท) |

---

## ส่วนที่ 2 — Monthly Breakdown

| เดือน | Inflow (บาท/ครั้ง) | Outflow (บาท/ครั้ง) | Min Balance (วันที่) |
|---|---|---|---|
| {{month}} | {{inflow_amount}} / {{inflow_count}} | {{outflow_amount}} / {{outflow_count}} | {{min_balance}} ({{min_balance_date}}) |

_(สรุปแนวโน้ม: ...)_

---

## ส่วนที่ 3 — Channel & Behavior Analysis

**ช่องทางรับเงิน**
- {{channel}} — {{amount}} บาท ({{pct}}%) → _{{interpretation}}_

**ช่องทางจ่ายเงิน**
- {{channel}} — {{amount}} บาท ({{pct}}%) → _{{interpretation}}_

**ความเร็วในการหมุนเงิน (Velocity):** {{velocity_note}}

---

## ส่วนที่ 4 — Red Flags & Risk

| ระดับ | ประเภท | วันที่ | ยอด | รายละเอียด |
|---|---|---|---|---|
| {{severity}} | {{type}} | {{date}} | {{amount}} | {{detail}} |

_(ถ้าไม่พบความเสี่ยง ให้ระบุ "ไม่พบ Red Flag ที่มีนัยสำคัญ")_

---

## ส่วนที่ 5 — Analyst's Verdict

- **ประเภทธุรกิจ (Business Guess):** {{business_guess}}
- **สภาพคล่อง (Liquidity):** {{liquidity}}
- **ความเห็นสินเชื่อ:** {{credit_guidance}}
- **เอกสารที่ควรขอเพิ่ม:**
  - {{documents_to_request}}

> ⚠️ **{{disclaimer}}**
