<!--
RAW DATA TEMPLATE — ไฟล์ข้อมูลดิบสำหรับตรวจสอบย้อนหลัง / ส่งต่อให้คนอื่นวิเคราะห์
กรอกจาก JSON (schema.json) เท่านั้น ทุกตัวเลขห้ามเดา
แทน {{...}} ด้วยค่าจริง  |  ถ้าอ่านไม่ออกใส่ [ข้อมูลไม่ชัดเจน]
-->

# Raw Data — {{statement_id}}

| รายการ | ค่า |
|---|---|
| ธนาคาร / ประเภทบัญชี | {{bank}} / {{account_type}} |
| ช่วงเวลา | {{period_start}} → {{period_end}} |
| สกุลเงิน | {{currency}} |
| ยอดยกมา (Opening) | {{opening_balance}} |
| ยอดยกไป (Closing) | {{closing_balance}} |
| สกัดโดย / วันที่ | {{extracted_by}} / {{extraction_date}} |
| ผ่านการลบ PII (anonymized) | {{anonymized}} |
| หมายเหตุคุณภาพข้อมูล | {{data_quality_notes}} |

## Reconciliation Check
> opening + inflow − outflow = closing ?

| computed_closing | stated_closing | difference | matched |
|---|---|---|---|
| {{computed_closing}} | {{stated_closing}} | {{difference}} | {{matched}} |

⚠️ ถ้า `matched = false` แปลว่ามีรายการตกหล่น — อย่าเชื่อตัวเลขสรุปจนกว่าจะ reconcile ได้

---

## Transaction Ledger (รายรายการ)

| # | วันที่ | เวลา | รายละเอียด | ช่องทาง | เข้า/ออก | จำนวนเงิน | คงเหลือ | คู่กรณี | flags | conf. |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | {{date}} | {{time}} | {{description}} | {{channel}} | {{direction}} | {{amount}} | {{balance}} | {{counterparty}} | {{flags}} | {{confidence}} |
| ... | | | | | | | | | | |

<!-- ทำซ้ำ 1 แถวต่อ 1 รายการ ครบทุกรายการใน statement -->

---

## สรุปยอดรวม (ตรวจกับ ledger ได้)

| Metric | จำนวนเงิน | จำนวนครั้ง |
|---|---|---|
| Total Inflow | {{total_inflow.amount}} | {{total_inflow.count}} |
| Total Outflow | {{total_outflow.amount}} | {{total_outflow.count}} |

| Metric | ค่า | วันที่ |
|---|---|---|
| Absolute Lowest Balance | {{lowest_balance.amount}} | {{lowest_balance.date}} |
| Highest Balance | {{highest_balance.amount}} | {{highest_balance.date}} |
| Swing Value (Max−Min) | {{swing_value}} | — |
| Utilization Rate (%) | {{utilization_rate_pct}} | — |
| Average Daily Balance | {{avg_daily_balance}} | — |
| วันที่ยอด < {{threshold}} บาท | {{days_below_threshold.days}} วัน | — |

## Monthly Breakdown

| เดือน | Inflow (บาท / ครั้ง) | Outflow (บาท / ครั้ง) | Min Balance (วันที่) | ยอดสิ้นเดือน |
|---|---|---|---|---|
| {{month}} | {{inflow_amount}} / {{inflow_count}} | {{outflow_amount}} / {{outflow_count}} | {{min_balance}} ({{min_balance_date}}) | {{end_balance}} |
| ... | | | | |
