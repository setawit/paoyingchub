# 06 — Roadmap & Phase Gates

## 1. Phase Architecture

| Phase | ชื่อ | Duration | Investment | Resource | Owner |
|---|---|---|---|---|---|
| P0 | Foundation Build | 1–2 เดือน | Subscription only | 1 RM lead | RM (champion) |
| P1 | AI Engine MVP | 2–3 เดือน | Subscription only | 3–5 RM pilots | RM + ฝ่ายธุรกิจ |
| P2 | RM Core + Web UI | 4–6 เดือน | Dev + API budget | Dev team 3–5 คน | IT + Business |
| P3 | Warning Brain | 3–4 เดือน | + Data infra | + Data engineer | IT + Risk Mgmt |
| P4a | Integration Layer | 6–9 เดือน | Major project | Vendor + IT team | IT (lead) |
| P4b | Executive Dashboard | 2–3 เดือน | BI tool + UX | UX + BI team | Executive sponsor |

**Logic:** P0 สร้าง skill library → P1 พิสูจน์ value กับ pilot → P2 จาก Claude Desktop เป็น Web App → P3 จาก reactive เป็น proactive → P4a เชื่อม CBS/K2/DBD/SAP (ใหญ่สุด ~50–60% ของงบรวม) → P4b ผู้บริหารเห็น real-time insight

**Critical inflection point:** P1→P2 คือ commitment leap ใหญ่สุด (จาก "ไม่ต้องมี dev team" → "ต้องมี dev team") — ต้องมี P1 evidence หนักแน่นก่อน

**Blocking dependency:** P3 พึ่งการตัดสินใจ CBS data feed ใน P2 — batch sync = batch warning, real-time API = proactive warning เต็มรูปแบบ

## 2. Phase-Gate Criteria

### P0 → P1
- **Entry:** ไม่มี — เริ่มได้ทันที
- **Exit:** skill library 8+ ตัวทดสอบจริง · documented prompts 5+ use cases · data masking guideline · training material
- **Kill:** AI output คุณภาพไม่พอสำหรับ RM workflow

### P1 → P2
- **Entry:** P0 ผ่านครบ + RM อาสา 3–5 คน + หัวหน้า RM อนุมัติ pilot
- **Exit:** pilot ใช้ต่อเนื่อง 30+ วัน · ลดเวลา Call Report ≥ 60% · output ใช้ได้จริง ≥ 80% · NPS ≥ 7/10 · business case พร้อม · IT initial sign-off
- **Kill:** time saved < 40% · adoption < 50% · security incident จาก masking failure · AI error rate > 20%

### P2 → P3
- **Entry:** P1 ผ่านครบ + budget approval + dev team + IT/Security sign-off architecture
- **Exit:** Web App production · RM ใช้จริง ≥ 50 คน · security audit ผ่าน · SSO + audit trail สมบูรณ์ · uptime 99%+ ใน 60 วันแรก · มี CBS read access ใน sandbox/UAT
- **Kill:** adoption < 30% หลัง 60 วัน · security audit fail (critical) · cost overrun > 50%

### P3 → P4
- **Entry:** P2 ผ่านครบ + CBS ยืนยัน data feed + Risk Mgmt buy-in alert rules
- **Exit:** warning ครบ 13 ประเภท · false positive < 15% · RM ตอบสนอง ≥ 70% · measurable NPL prevention
- **Kill:** false positive > 40% (RM ignore) · CBS data feed ไม่เสถียร

## 3. Budget (Rough Order of Magnitude — บาท)

| Phase | CapEx (one-time) | OpEx (annual) | หมายเหตุ |
|---|---|---|---|
| P0 | ~10K | ~10K | Subscription — RM lead ออกเอง |
| P1 | ~50K | ~60K | Pilot subscription |
| P2 | 3–5M | 2–4M | Web App dev + API + hosting |
| P3 | 2–4M | 3–5M | Warning Brain + event infra |
| P4a | 10–20M | 3–5M | Integration — major IT initiative |
| P4b | 2–4M | 1–2M | Dashboard + BI license |

## 4. Personnel Ramp-Up

| Role | P0 | P1 | P2 | P3 | P4 |
|---|---|---|---|---|---|
| RM Lead | 1 | 1 | 1 | 1 | 1 |
| Pilot RMs | 0 | 3–5 | 20–50 | 50+ | 1000+ |
| Frontend Dev | 0 | 0 | 1–2 | 1–2 | 2–3 |
| Backend Dev | 0 | 0 | 1–2 | 2 | 3–4 |
| DevOps/Security | 0 | 0 | 1 | 1 | 1–2 |
| Data Engineer | 0 | 0 | 0 | 1 | 2 |
| Integration Spec. | 0 | 0 | 0 | 0 | 2–3 |
| UX/BI Designer | 0 | 0 | 0 | 0 | 1–2 |
| Product Owner | 0.2 | 0.5 | 1 | 1 | 1 |

## 5. Risk Register

| Risk | Prob. | Impact | Mitigation |
|---|---|---|---|
| PII leak ผ่าน LLM | Low | Critical | Server-side masking + audit + Anthropic no-train clause |
| AI hallucination → wrong credit decision | Medium | High | Draft only, mandatory RM review, sign-off เดิมไม่เปลี่ยน |
| Low RM adoption | Medium | High | P1 pilot ก่อน scale, change management, champion network |
| Anthropic API outage | Low | Medium | Graceful degradation — กลับทำเอกสารแบบเดิม |
| Cost overrun (API) | Medium | Medium | Per-user quota, monitoring, prompt optimization, smaller model fallback |
| CBS integration delay | High | High | Engage CBS team จาก P1, manual import fallback P2–P3 |
| Regulatory change (PDPA/ธปท.) | Low | High | Compliance review ทุก phase gate |

## 6. Critical Path Dependencies

| Dependency | Required For | Mitigation |
|---|---|---|
| CBS read access | P3 Warning Brain | หารือ CBS team ตั้งแต่ P2, ขอ sandbox/UAT ก่อน production |
| AD/SSO integration | P2 Web App | Engage IT Security ตั้งแต่ P1 |
| API key management | P2 production | Azure Key Vault / HashiCorp Vault |
| Anthropic commercial agreement | P2 onwards | เริ่มเจรจาตั้งแต่ P1 (data residency, no-train) |
| Cloud vs on-prem decision | P2 architecture | ตัดสินใจก่อนจบ P1 (Open Item O-01) |

## 7. Open Items — Decisions Required

| ID | ประเด็น | Owner | Required By | Priority |
|---|---|---|---|---|
| O-01 | Cloud vs On-prem | IT Infra + Security | End of P1 | High |
| O-02 | Anthropic commercial agreement scope | Legal + IT + Procurement | End of P1 | High |
| O-03 | API key management strategy | IT Security | Start of P2 | High |
| O-04 | SSO approach (SAML/OAuth) | IT Identity | Start of P2 | High |
| O-05 | CBS data feed: real-time vs batch | IT CBS + Risk Mgmt | Mid of P2 | High |
| O-06 | Masking algorithm (rule-based vs ML) | IT + Data Privacy | Start of P2 | Medium |
| O-07 | Audit log retention period | Compliance + Audit | Mid of P2 | Medium |
| O-08 | WCR formula standardization | ฝ่ายสินเชื่อ | End of P0 | Medium |
| O-09 | Credit Rating model approach | ฝ่ายนโยบาย | Start of P2 | Medium |
| O-10 | SMS Gateway + consent model | Legal + Marketing | Start of P3 | Low |
| O-11 | BI tool selection | IT + Executive | Start of P4b | Low |
| O-12 | Mobile: native vs PWA | IT + Product | Mid of P2 | Low |
