# EK3 Financial Projections - Rockstart Energy

> **Document Purpose**: EU-focused financial projections for Rockstart Energy application
> **Last Updated**: 2026-01-20
> **Version**: 1.0

---

## Executive Summary

EK3 targets the €4.2B European bus charging infrastructure market with a modular architecture that achieves **35% cost reduction** at scale. With €100K initial funding, we can reach pilot-ready status within 6 months.

---

## 1. EU Market Sizing

### Total Addressable Market (TAM)

**European Bus Fleet Electrification Infrastructure**

| Market Segment | Size (2030) | Source |
|----------------|-------------|--------|
| EU urban bus charging infrastructure | €4.2B | ACEA, McKinsey |
| Adjacent markets (coach, regional) | €1.8B | Industry estimates |
| V2G grid services (bus fleets) | €0.8B | DNV projections |
| **Total TAM** | **€6.8B** | |

### Serviceable Addressable Market (SAM)

**Focus: Western Europe depot charging (Germany, Netherlands, France, Spain, Italy)**

| Geography | Bus Fleet Size | Infrastructure Need | SAM |
|-----------|---------------|---------------------|-----|
| Germany | 35,000+ | ~€800M | €640M |
| Netherlands | 5,000+ | ~€120M | €96M |
| France | 15,000+ | ~€350M | €280M |
| Spain | 8,000+ | ~€180M | €144M |
| Italy | 10,000+ | ~€230M | €184M |
| **5-Country SAM** | **73,000+** | **€1.68B** | **€1.34B** |

*SAM assumes 80% depot charging (vs opportunity charging)*

### Serviceable Obtainable Market (SOM)

**Realistic 5-year target: 1% of SAM**

| Year | Market Share | Revenue Target |
|------|--------------|----------------|
| 2026 | - | Pilot phase |
| 2027 | 0.05% | €670K |
| 2028 | 0.2% | €2.7M |
| 2029 | 0.5% | €6.7M |
| 2030 | 1.0% | €13.4M |

---

## 2. Unit Economics

### EK3 Module Cost Structure

| Volume | BOM Cost | Assembly | Total/Module | Per kW |
|--------|----------|----------|--------------|--------|
| Prototype (1) | €293 | €100 | €393 | €119/kW |
| Pilot (100) | €220 | €50 | €270 | €82/kW |
| Scale (1,000) | €185 | €35 | €220 | €67/kW |
| Mass (10,000) | €150 | €25 | €175 | €53/kW |
| Volume (100,000) | €112 | €18 | €130 | €39/kW |

### Component Cost Breakdown (at 1,000 units)

| Component | Cost | % of BOM |
|-----------|------|----------|
| SiC MOSFETs (4×) | €50 | 27% |
| Transformer | €25 | 14% |
| Capacitors | €20 | 11% |
| STM32G474 MCU | €5 | 3% |
| PCB + Assembly | €35 | 19% |
| Enclosure | €20 | 11% |
| Magnetics | €15 | 8% |
| Connectors + misc | €15 | 8% |
| **Total BOM** | **€185** | **100%** |

### System-Level Pricing

**Example: 100-Module Station (330 kW)**

| Component | EK3 | Competitor (ABB/Siemens) |
|-----------|-----|--------------------------|
| Hardware | €22,000 | €35,000 |
| Installation | €5,000 | €8,000 |
| **Total** | **€27,000** | **€43,000** |
| **Savings** | **37%** | - |

---

## 3. Revenue Model

### Revenue Streams

| Stream | Type | Margin | Year 1 % | Year 5 % |
|--------|------|--------|----------|----------|
| Hardware sales | One-time | 40-50% | 80% | 50% |
| Installation services | One-time | 25-30% | 15% | 15% |
| Maintenance contracts | Recurring | 60-70% | 5% | 20% |
| V2G revenue share | Recurring | 90%+ | 0% | 15% |

### Pricing Strategy

| Product | Price Point | Target Customer |
|---------|-------------|-----------------|
| EK3 Module (individual) | €350 | Pilot/testing |
| 46-Module Station (152 kW) | €18,000 | City bus depot |
| 100-Module Station (330 kW) | €35,000 | Large depot |
| 303-Module Station (1 MW) | €100,000 | Major transit authority |

### V2G Revenue Potential

| Service | Revenue/Module/Month | Notes |
|---------|---------------------|-------|
| Frequency regulation | €2-5 | Netherlands, Germany markets |
| Peak shaving | €3-8 | Avoid demand charges |
| Capacity market | €1-3 | UK, Germany |
| **Combined** | **€6-16** | Per module per month |

**Example**: 100-module station = €600-1,600/month V2G revenue

---

## 4. Three-Year Financial Projection

### Revenue Projection

| Metric | 2026 | 2027 | 2028 |
|--------|------|------|------|
| Pilot stations | 2 | 5 | 15 |
| Modules deployed | 200 | 800 | 3,000 |
| Hardware revenue | €70K | €280K | €1.05M |
| Installation revenue | €15K | €60K | €225K |
| Maintenance revenue | €0 | €24K | €120K |
| V2G revenue share | €0 | €10K | €100K |
| **Total Revenue** | **€85K** | **€374K** | **€1.5M** |

### Cost Projection

| Cost Category | 2026 | 2027 | 2028 |
|---------------|------|------|------|
| Hardware COGS | €54K | €168K | €525K |
| Installation COGS | €12K | €42K | €158K |
| R&D (salaries, materials) | €80K | €150K | €250K |
| Sales & Marketing | €20K | €60K | €120K |
| G&A | €30K | €50K | €100K |
| Certification | €50K | €80K | €50K |
| **Total Costs** | **€246K** | **€550K** | **€1.2M** |

### Profitability Path

| Metric | 2026 | 2027 | 2028 |
|--------|------|------|------|
| Gross Margin | 22% | 40% | 50% |
| Operating Loss | (€161K) | (€176K) | €300K |
| Cumulative Funding Need | €161K | €337K | €37K |
| Cash Position (with €100K seed) | (€61K) | (€237K) | - |

**Break-even**: Q2 2028 at ~2,500 modules deployed

---

## 5. Use of Funds (€100K Rockstart Investment)

### Allocation

| Category | Amount | % | Purpose |
|----------|--------|---|---------|
| **Product Development** | €60,000 | 60% | Prototype iteration, testing |
| **EU Market Development** | €25,000 | 25% | Customer discovery, pilots |
| **CE Certification Prep** | €15,000 | 15% | Standards compliance, testing |
| **Total** | **€100,000** | **100%** | |

### Product Development (€60K)

| Item | Cost | Notes |
|------|------|-------|
| PCB manufacturing (5 revisions) | €15K | Small batch iterations |
| Component procurement | €20K | SiC, magnetics, MCUs |
| Test equipment | €10K | Oscilloscopes, power analyzers |
| Lab space/materials | €10K | 6 months |
| Contract engineering support | €5K | Specific expertise |

### EU Market Development (€25K)

| Item | Cost | Notes |
|------|------|-------|
| Customer discovery travel | €10K | Netherlands, Germany visits |
| Trade shows | €8K | eMove360, Transport Logistic |
| Sales materials | €5K | Brochures, demo units |
| Legal (contracts) | €2K | Pilot agreements |

### CE Certification Prep (€15K)

| Item | Cost | Notes |
|------|------|-------|
| Pre-compliance testing | €8K | EMC, safety pre-tests |
| Documentation | €4K | Technical files |
| Consultant | €3K | Certification pathway advice |

---

## 6. Key Milestones vs Funding

### Month-by-Month Roadmap

| Month | Milestone | Funding Used |
|-------|-----------|--------------|
| 1-2 | EU customer discovery (10+ interviews) | €8K |
| 2-3 | Prototype v2 design complete | €20K |
| 3-4 | First prototype units built (10) | €35K |
| 4-5 | Pre-compliance testing | €15K |
| 5-6 | Pilot agreement signed | €12K |
| **Demo Day** | Pilot-ready, customer committed | **€90K** |

### KPIs for Rockstart Demo Day

| KPI | Target | Status |
|-----|--------|--------|
| Customer interviews | 15+ | - |
| LOIs/pilot agreements | 2+ | - |
| Prototype modules built | 10+ | - |
| Pre-compliance test pass | Yes | - |
| Series A pipeline | 3+ investors | - |

---

## 7. Follow-On Funding Plan

### Funding Stages

| Stage | Amount | Timing | Use |
|-------|--------|--------|-----|
| Pre-seed (Rockstart) | €100K | Q1 2026 | Prototype, validation |
| Seed | €500K-1M | Q4 2026 | CE certification, first pilot |
| Series A | €3-5M | 2027 | Manufacturing, EU expansion |
| Series B | €10-20M | 2029 | Scale across EU |

### Rockstart Value-Add for Follow-On

| Benefit | Value |
|---------|-------|
| Co-investment rights | Up to €2M additional |
| Investor network | 200+ investors |
| Series A introductions | ETF Partners, Systemiq, etc. |
| Corporate partners | Utility/transit introductions |

---

## 8. Risk Factors & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Certification delays | Medium | High | Start early, use consultants |
| Customer acquisition slow | Medium | High | Strong pilot pipeline |
| Component supply issues | Low | Medium | Multiple suppliers qualified |
| Cost targets missed | Low | Medium | Conservative projections |

---

## 9. Comparison to Competitors

### Cost per kW (at scale)

| Vendor | €/kW | Notes |
|--------|------|-------|
| ABB | €120-150 | Monolithic, proprietary |
| Siemens | €110-140 | Traditional architecture |
| Heliox | €100-130 | Bus depot focus |
| Kempower | €90-120 | Modular (20 kW units) |
| **EK3** | **€50-70** | Extreme modular (3.3 kW) |

### TCO Advantage

| Factor | EK3 Advantage | Annual Savings (100 modules) |
|--------|---------------|------------------------------|
| Hardware cost | -35% | €12,000 |
| Maintenance (no truck rolls) | -60% | €5,000 |
| Downtime (self-healing) | -80% | €3,000 |
| V2G revenue | +100% | €12,000 |
| **Total TCO Advantage** | | **€32,000/year** |

---

## 10. Summary for Investors

| Metric | Value |
|--------|-------|
| **Market opportunity** | €6.8B TAM, €1.3B SAM |
| **Target market share** | 1% by 2030 = €13.4M revenue |
| **Unit economics** | 50% gross margin at scale |
| **Break-even** | Q2 2028 (~2,500 modules) |
| **Funding need** | €100K now, €500K-1M in 12 months |
| **Exit potential** | Strategic acquisition or IPO at €50-100M+ |

---

## Appendix: Assumptions

| Assumption | Value | Source |
|------------|-------|--------|
| EU bus electrification rate | 100% new urban by 2030 | EU mandate |
| Average depot size | 50-100 buses | Industry data |
| Charging power per bus | 150 kW average | Technical standard |
| V2G market growth | 20% CAGR | DNV, Bloomberg |
| SiC price decline | -10%/year | Industry trend |
| Manufacturing learning curve | -15% per 10× volume | Standard |

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-20 | Initial financial projections for Rockstart application |
