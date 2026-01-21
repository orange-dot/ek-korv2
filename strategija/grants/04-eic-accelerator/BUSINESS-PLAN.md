# EIC Accelerator - Business Plan

**Program:** European Innovation Council Accelerator
**Company:** Elektrokombinacija B.V.
**Date:** January 2026

---

## Executive Summary

Elektrokombinacija is building the open-source coordination standard for distributed energy infrastructure. Our EK-KOR2 Real-Time Operating System enables modular power electronics to self-organize without central control, creating fault-tolerant, scalable charging infrastructure for electric vehicle fleets.

**The Opportunity:** EU mandates are driving €100B+ investment in EV charging infrastructure, but the market is fragmented with proprietary solutions. An open standard could become the "Linux of distributed energy."

**Our Innovation:** Potential field scheduling - a novel algorithm where modules coordinate through gradient flow, eliminating single points of failure and enabling linear scalability.

**Business Model:** Open-source the RTOS (community moat), monetize certified hardware and fleet services (revenue).

**Ask:** €2.5M grant to launch EK-KOR2 publicly and deploy first certified hardware pilots.

---

## 1. Problem & Opportunity

### The Problem

[Reference: _shared/03-market-impact.md]

Every EV charging manufacturer builds proprietary systems:
- No interoperability between vendors
- High switching costs for operators
- No community innovation
- Slow industry progress

For electric bus fleet operators, this means:
- Managing multiple incompatible systems
- Vendor lock-in limiting flexibility
- No path to V2G grid services
- Expensive, inflexible infrastructure

### The Opportunity

EU policy is creating massive demand:

| Policy | Requirement |
|--------|-------------|
| AFIR | Charging point every 60km by 2025 |
| Clean Vehicles Directive | Public fleet electrification |
| REPowerEU | €5.4B for charging infrastructure |

**Missing:** An open standard to coordinate it all.

### Why Now?

1. **Infrastructure buildout starting:** EU mandates create immediate demand
2. **No incumbent standard:** Opportunity to define the coordination layer
3. **Open source accepted:** Linux/Kubernetes/Android proved the model
4. **Technology ready:** SiC MOSFETs, CAN-FD, ARM Cortex-M enable performance

---

## 2. Solution

### EK-KOR2 RTOS

[Reference: _shared/01-technology-overview.md]

A Real-Time Operating System for coordinating distributed power electronics:

**Core Innovation: Potential Field Scheduling**
- Each module publishes state as "field" (load, thermal, power)
- Work flows along gradients (high → low load)
- No central coordinator required
- Self-healing when modules fail

**Key Features:**
- k=7 topological consensus (distributed decisions)
- Lock-free IPC (<100ns latency)
- Dual C/Rust implementation
- Open source (MIT License)

### EK3 Power Module

Hardware reference implementation:
- 3.3kW bidirectional power
- 900V SiC MOSFETs (Wolfspeed)
- LLC resonant topology (>97% efficiency)
- STM32G474 controller
- CAN-FD @ 5 Mbps

**Scalability:** 1 module (3.3kW) to 909 modules (3MW MCS)

---

## 3. Technology Readiness

### Current Status

| Component | TRL | Evidence |
|-----------|-----|----------|
| EK-KOR2 scheduler | 4 | 22 tests passing, simulation validated |
| Consensus protocol | 4 | Property-based testing |
| Lock-free IPC | 4 | Benchmarks <100ns |
| EK3 design | 3 | Complete specifications, BOM |
| Fleet simulator | 5 | 100+ node scenarios |

### External Validation

**Infineon Technologies:**
- Engaged for emulator development partnership
- Source code shared for review
- NDA in progress for timing specifications
- Validates: Major semiconductor company sees production path

**Academic Collaboration:**
- PhD advisor (distributed systems)
- Publication roadmap: ICRA, IEEE TSG, IJRR

### What This Grant Achieves

| Current | After Grant |
|---------|-------------|
| TRL 4 (lab) | TRL 6-7 (prototype in relevant environment) |
| Simulation | Hardware validated |
| Design | Certified product |
| 0 pilots | 2-3 operational pilots |

---

## 4. Business Model

### Revenue Streams

**Stream 1: Certified Hardware (Primary)**
- EK3 modules pre-certified for safety standards
- Target margin: 30-40%
- Volume: 1000+ units/year by Year 3

**Stream 2: Fleet Management Platform (SaaS)**
- Cloud platform for fleet coordination
- €500/month per depot
- Target: 50+ depots by Year 3

**Stream 3: Services**
- Integration and deployment: €150/hour
- Training: €2,000/session
- Extended support: €10,000/year/depot

### Open Source Strategy

```
WHAT'S FREE              WHAT'S PAID
═══════════════════════════════════════════════════════════════
EK-KOR2 RTOS core        Pre-certified EK3 modules
Reference designs        Safety certification support
Documentation            Fleet management SaaS
Community tools          Premium support
```

**Precedents:**
- Red Hat: $34B acquisition (Linux services)
- GitLab: $11B valuation (open core)
- Elastic: $3B+ revenue (open source + cloud)

---

## 5. Market Analysis

### Market Size

| Segment | Size | Our Target |
|---------|------|------------|
| TAM: Global EV charging | €100B+ | - |
| SAM: EU fleet/depot | €10B+ | - |
| SOM: Bus depot (5 year) | €500M | €50-100M |

### Target Customers

**Primary: EU Transit Operators**
- Profile: 100+ bus fleets, depot charging needs
- Pain: Vendor lock-in, integration complexity
- Value: Open platform, flexibility, V2G potential

**Secondary: Charging Network Operators**
- Profile: Multi-site charging networks
- Pain: Scaling costs, interoperability
- Value: Modular, standard-based infrastructure

### Go-to-Market

1. **Year 1:** Open source launch, developer community, reference deployments
2. **Year 2:** First certified hardware sales, 2-3 pilots
3. **Year 3:** Scale hardware production, SaaS platform, services

---

## 6. Competitive Analysis

### Landscape

| Competitor | Approach | Weakness |
|------------|----------|----------|
| ABB | Proprietary Terra series | Vendor lock-in, high cost |
| Siemens | Sicharge ecosystem | Limited flexibility |
| ChargePoint | Network-centric | US-focused, subscription model |
| Heliox | Bus specialist | Acquired by ABB, proprietary |

### Our Differentiation

| Factor | Them | Us |
|--------|------|---|
| Architecture | Central coordinator | Distributed (no SPOF) |
| License | Proprietary | Open source |
| Scalability | Limited by coordinator | Linear to 1000+ |
| Innovation | Internal R&D only | Community contributions |
| EU alignment | US/Chinese companies | European |

### Why They Can't Copy

**Innovator's Dilemma:**
- Incumbents profit from proprietary lock-in
- Open source cannibalizes their revenue
- They structurally cannot adopt our model

**Community Moat:**
- Open source community can't be acquired
- 1000 contributors = defensible position
- Standard adoption = switching costs

---

## 7. Team

[Reference: _shared/02-team-expertise.md]

### Founders

**Marija Janjatovic - CEO**
- Business operations, partnerships, fundraising
- Focus: Go-to-market, customer relationships

**Bojan Janjatovic - CTO**
- 2 years EE (FTN Novi Sad) + Stanford AI Course (2011)
- 7 years electronics repair + 10+ years enterprise software
- Track record: Toshiba postal+customs (solo delivery), NCR Voyix
- Built: EK-KOR2, EK3 design, Infineon partnership

### Advisors

- PhD (distributed systems, Western Europe) - official
- Infrastructure specialist (US) - informal
- Automotive sensors (Germany) - in discussion

### Hiring Plan

| Role | When | Cost/Year |
|------|------|-----------|
| Power Electronics Engineer | Month 1 | €108K |
| Embedded Rust Developer | Month 2 | €96K |
| Community Manager | Month 3 | €72K |
| Safety Engineer | Month 12 | €96K |
| Additional engineers (2) | Month 12 | €192K |

---

## 8. Financial Plan

### Funding Request

**€2.5M Grant (24 months)**

| Category | Amount | % |
|----------|--------|---|
| Personnel | €1,200,000 | 48% |
| Hardware & equipment | €400,000 | 16% |
| Subcontracting | €350,000 | 14% |
| Pilot deployments | €300,000 | 12% |
| Travel & dissemination | €100,000 | 4% |
| Other (cloud, office, etc.) | €150,000 | 6% |
| **Total** | **€2,500,000** | 100% |

### Burn Rate

| Phase | Monthly Burn | Team Size |
|-------|--------------|-----------|
| Months 1-6 | €80,000 | 4 |
| Months 7-12 | €120,000 | 6 |
| Months 13-24 | €140,000 | 8 |

### Revenue Projections

| Year | Hardware | SaaS | Services | Total |
|------|----------|------|----------|-------|
| 2026 | €0 | €0 | €50K | €50K |
| 2027 | €500K | €100K | €200K | €800K |
| 2028 | €2M | €500K | €500K | €3M |
| 2029 | €5M | €1.5M | €1M | €7.5M |

### Path to Series A

By Month 24:
- €500K+ ARR from hardware + services
- 2-3 operational pilots with data
- Community of 500+ developers
- Clear path to €3M+ revenue

---

## 9. Risk Assessment

[Reference: _shared/08-risk-assessment.md]

### Key Risks & Mitigations

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Technical: Scale performance | Medium | Simulation first, incremental testing |
| Market: Slow adoption | Medium | Active community building, reference deployments |
| Execution: Key hire unavailable | Medium | Multiple recruitment channels, advisor network |
| Competition: Incumbent response | Medium | Speed to standard, ecosystem moat |

### Contingency Plans

**If community adoption slow:**
- Pivot to B2B licensing model
- Focus on vertical (bus depot only)
- Seek strategic partner

**If hardware certification delayed:**
- Extend timeline
- Start with CE marking (faster)
- Partner with certified manufacturer

---

## 10. Milestones

### 24-Month Plan

| Milestone | Month | Deliverable | Success Criteria |
|-----------|-------|-------------|------------------|
| M1 | 6 | EK-KOR2 v1.0 | Public release, 100+ stars |
| M2 | 12 | EK3 prototype | CE certified, 10 units |
| M3 | 18 | First pilot | Operational at transit operator |
| M4 | 24 | Series A ready | €500K ARR, 2+ pilots |

### Detailed Milestone Criteria

**M1: EK-KOR2 Public Release (Month 6)**
- GitHub repository public
- Documentation complete
- 5+ community contributors
- Academic paper submitted

**M2: EK3 Certified Prototype (Month 12)**
- Hardware working on bench
- CE marking obtained
- 10 units manufactured
- Customer demo ready

**M3: First Pilot Operational (Month 18)**
- Installed at transit operator depot
- 5+ modules coordinating
- 3 months operational data
- Customer testimonial

**M4: Series A Ready (Month 24)**
- €500K+ ARR
- 2+ operational pilots
- Team of 8+
- Clear scaling plan

---

## 11. EU Value

### Strategic Alignment

| EU Priority | Our Contribution |
|-------------|------------------|
| Digital sovereignty | European open-source alternative |
| Green Deal | Enable faster EV adoption |
| Industrial competitiveness | Platform for EU manufacturers |
| Strategic autonomy | Reduce dependency on US/China |

### Impact Metrics

| Metric | 5-Year Target |
|--------|---------------|
| CO2 reduction enabled | 100,000 tons/year |
| EU jobs created | 50+ direct, 500+ ecosystem |
| Export potential | Global standard |

---

## 12. Contact

**Elektrokombinacija B.V.**

Marija Janjatovic (CEO) | Bojan Janjatovic (CTO)

📧 bojan.janjatovic@gmail.com
📍 Netherlands (Haarlem / Zandvoort)
🔗 github.com/elektrokombinacija (private)

---

*Business Plan prepared: January 2026*
*For: EIC Accelerator Application*
