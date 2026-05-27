---
name: economic-review-skill
description: Generate structured economic review reports linking macroeconomic events to sector impacts and bank customer credit risks. Use this skill whenever the user asks about macro impact on agriculture, SME, or any sector — including oil shocks, feed price changes, fertilizer costs, freight disruptions, FX movements, or any global economic event that could affect business customers. Also trigger when asked to write an economic briefing, sector impact report, credit risk review, or portfolio stress analysis.
---

# Economic Review Skill

## Purpose
Generate structured economic review reports linking macroeconomic events to sector impacts and bank customer risks.

## Core Reasoning Logic

```
Macroeconomic Event
→ Transmission Mechanism
→ Sector Impact (cost structure + elasticity)
→ Supply Chain Impact
→ Customer Portfolio Exposure
→ Credit Risk Implication
→ Opportunities
```

## Output Structure

1. **Situation Overview** — What happened, key numbers
2. **Transmission Mechanism** — How the shock travels to the sector
3. **Sector-Level Impact** — Cost structure shift, margin pressure
4. **Supply Chain Impact** — Upstream/downstream effects
5. **Customer Portfolio Exposure** — Which customer segments are hit
6. **Credit Risk Implications** — Repayment capacity, collateral, watch list
7. **Opportunities** — Sectors or customers that benefit

## Writing Style
- Clear, structured, executive-level briefing
- Avoid academic jargon
- Use numbers and percentages where possible
- Thai or English depending on user preference

## Reference Files

Read these files as needed:

| File | When to Read |
|------|-------------|
| `references/Sector_Library_Agriculture_Advanced.md` | When analyzing agriculture sector cost structure or elasticity |
| `references/Agriculture_Sector_Risk_Framework.md` | When building risk heatmap or scenario impact table |
| `references/Macro_Shock_Map_Thailand_Agriculture.md` | When tracing transmission from global event to sector |

## How to Use References

1. Identify the shock type (oil / feed / fertilizer / freight / FX)
2. Read `Macro_Shock_Map` to trace transmission channel
3. Read `Sector_Library` to get cost structure and elasticity for affected sectors
4. Read `Risk_Framework` for scenario impact quantification
5. Compose report using Output Structure above
