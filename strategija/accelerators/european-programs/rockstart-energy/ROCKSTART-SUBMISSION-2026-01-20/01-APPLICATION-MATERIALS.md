# Rockstart Energy Application Draft

> **Document Purpose**: Pre-written responses for online application form
> **Last Updated**: 2026-01-20
> **Status**: Ready for submission
> **Note**: Copy/paste these responses into the online form

---

## Company Information

### Company Name
Elektrokombinacija

### Website/Demo URL
[To be added - GitHub demo link or web demo]

### Country of Incorporation
Netherlands (planned) / Delaware (alternative)

*Note: Company to be incorporated in Netherlands (BV) for EU market access, aligned with Rockstart base. Delaware C-Corp as alternative if US investor preference.*

### Stage
Pre-seed

### Industry/Sector
- Primary: Energy
- Secondary: Transport / Mobility
- Tertiary: Climate Tech

### One-Line Description (max 140 characters)
Modular EV charging infrastructure for European bus fleet electrification - 3.3 kW building blocks that scale from 150 kW to 3 MW.

---

## Problem Statement

### What problem are you solving? (EU-Focused)

**Short Version (250 words):**

Europe's 2030 zero-emission bus mandates require massive charging infrastructure deployment. By 2030, over 100,000 urban buses across the EU must be electric, requiring €280 billion in charging infrastructure investment.

Current solutions fail this challenge in four ways:

1. **Monolithic design** - Traditional chargers are single large units (50-150 kW). Any component failure means complete downtime. For public transport, this is unacceptable.

2. **Vendor lock-in** - Proprietary firmware and service contracts create dependency. We've seen this firsthand: a Serbian bus fleet operator invested €1 million in 10 ABB chargers that sit idle because proprietary firmware can't be adapted locally. Multiple programming teams have failed to activate them.

3. **Grid stress** - Deploying high-power chargers in dense urban areas strains already constrained grids. Transit agencies face delays waiting for grid upgrades.

4. **Service logistics** - Every repair requires a specialized technician and service truck. This doesn't scale when you're deploying thousands of chargers across Europe.

These problems will multiply as EU mandates drive mass adoption. The architecture is fundamentally wrong - not the components.

**Long Version (if needed):**

The Western Balkans experience we've witnessed is a preview of what will happen across Europe. As bus fleets scale electrification, operators will face the same challenges: high costs, vendor dependency, service bottlenecks, and reliability concerns. The current charging infrastructure paradigm cannot meet the 2030 deadline at acceptable cost and quality.

---

## Solution Description

### How does your solution address this problem?

**Core Innovation (300 words):**

EK3 is an extremely modular charging architecture: 3.3 kW building blocks that combine for any power level from 150 kW city bus depot to 3 MW MCS truck charging. Same module, same firmware, any application.

**Technical differentiation:**

1. **ROJ Distributed Intelligence** - Every module has its own microcontroller and participates in a peer-to-peer coordination network. No central controller. No single point of failure. If one module dies, the mesh reforms automatically in under 100 milliseconds. This is TRUE decentralization - aligned with Rockstart's 4 D's.

2. **Fleet Logistics Model** - Buses already pass through charging stations multiple times daily. Defective modules ride to the depot for repair in a driver's backpack. Zero truck rolls. Zero dedicated service fleet. This scales O(1) instead of O(n).

3. **V2G Native** - Every module is bidirectional from day one. Bus fleets become grid assets, not just loads. Frequency regulation, peak shaving, emergency backup - new revenue streams for transit agencies.

4. **Circular Design** - Through-hole components, accessible repair, 15-25 year lifecycle through 3-5 refurbishment cycles. Aligned with EU circular economy goals.

**The 4 D's alignment:**
- **Decentralization**: ROJ swarm - no central controller
- **Decarbonization**: Enables bus fleet electrification at scale
- **Digitalization**: Smart charging, V2G, predictive maintenance
- **Transport**: Core focus - this IS transport electrification

**Why this works:**

The innovation is architectural, not component-level. We use proven technology (SiC MOSFETs, STM32 MCUs, CAN-FD) in a fundamentally new arrangement. The same distributed coordination that powers Raft consensus in databases like etcd now powers charging infrastructure.

---

## Technology Overview

### Describe your technology and its key innovations

**EK3 Module Specifications:**
- 3.3 kW rated power
- 200-920 VDC output range
- LLC resonant topology
- 900V SiC MOSFETs (Wolfspeed)
- STM32G474 MCU (Cortex-M4F)
- CAN-FD @ 5 Mbps
- >95% efficiency
- 200 × 320 × 44 mm (1U half-width)
- <3.5 kg weight

**Key Innovations (5 patent disclosures filed):**

1. **Modular Architecture** - Single 3.3 kW module scales to any power level through parallel operation

2. **ROJ Swarm Intelligence** - Distributed consensus without central controller, Raft-inspired algorithm, <100ms failover

3. **Fleet Logistics** - Buses transport defective modules to depot for free repair

4. **Distributed Sparing** - Excess capacity in running modules covers failures without dedicated spares

5. **Coordinated Charging** - Autonomous V2G coordination for grid services

**IP Status:**
- 5 invention disclosures completed
- Patent family planned (3 applications)
- Priority date: January 2, 2026 (Git verified)

---

## Competitive Advantage

### What makes your solution unique compared to competitors?

**Competitive Matrix:**

| Capability | ABB | Siemens | Heliox | Kempower | EK3 |
|------------|-----|---------|--------|----------|-----|
| Extreme modularity (3.3 kW) | No | No | No | Partial (20 kW) | **Yes** |
| Distributed intelligence | No | No | No | No | **Yes** |
| Fleet-based logistics | No | No | No | No | **Yes** |
| Circular design (15+ yrs) | Partial | Partial | Partial | Partial | **Yes** |
| V2G native | Partial | Partial | Partial | Partial | **Yes** |

**Why competitors can't replicate:**

1. **Architecture lock-in** - Incumbents have invested billions in monolithic designs. Retrofitting distributed intelligence requires complete redesign.

2. **Service model dependency** - Their revenue depends on service contracts and truck rolls. Our fleet logistics model threatens this.

3. **Organizational inertia** - Large companies optimize for existing products. Extreme modularity disrupts their manufacturing, certification, and service processes.

**Sustainable moat:**
- Patent protection on core architecture
- First-mover in extreme modularity
- Network effects from fleet logistics data
- Circular economy alignment creates regulatory advantage

---

## Market Opportunity

### Target Market

**Primary:** European transit agencies electrifying bus fleets

**Secondary:** Private bus operators (coach, regional)

**Tertiary:** Commercial fleet operators (trucks, logistics)

### Market Size

| Metric | Value | Timeframe |
|--------|-------|-----------|
| **TAM** | €6.8 billion | EU bus charging by 2030 |
| **SAM** | €1.34 billion | 5 key markets (DE, NL, FR, ES, IT) |
| **SOM** | €13.4 million | 1% market share by 2030 |

### Market Drivers

1. **EU mandates** - 100% zero-emission urban buses by 2030
2. **AFIR regulations** - Infrastructure funding requirements
3. **Grid constraints** - Need for flexible, V2G-capable solutions
4. **Cost pressure** - Transit agencies seeking TCO reduction

---

## Current Traction

### What traction do you have?

**Technical Validation:**
- Working prototype (Renode/Docker emulation)
- 7-module distributed system demonstrated
- Consensus algorithm validated
- Firmware runs on STM32G474 hardware
- Multi-platform support (STM32, EFR32, POSIX)

**Customer Validation:**
- Serbian bus fleet operator pain point documented
- €1M stranded investment case study
- Understanding of emerging market challenges

**IP Status:**
- 5 invention disclosures filed
- Patent family planned
- Priority date secured: January 2, 2026

**Team:**
- 2 co-founders, both 100% full-time
- 22 years combined technical experience
- US-based advisor available

**Pipeline:**
- GSP Belgrade (Serbian transit) - to contact
- EXPO 2027 Belgrade - monitoring
- Regional operators - identified

---

## Go-to-Market Strategy

### How will you reach your customers?

**Phase 1: Western Balkans Beachhead (2026-2027)**
- Serbia: EXPO 2027 Belgrade pilot opportunity
- Belgrade GSP (public transit) initial contact
- Regional operators through network

**Phase 2: EU Entry via Rockstart (2027-2028)**
- Netherlands as entry point (Rockstart base)
- Germany (largest market)
- CE certification complete

**Phase 3: EU Scale (2028-2030)**
- France, Italy, Spain expansion
- Nordic markets (Copenhagen network)
- MCS truck charging corridor

**Sales Model:**
1. Direct sales to transit agencies (initial)
2. Partner distribution (scale)
3. OEM/licensing (long-term)

**Why this sequence:**
1. Start where we have connections (Serbia)
2. Use success story for EU credibility
3. Rockstart provides Netherlands market access
4. Scale to adjacent markets

---

## Team Information

### Founder 1: CEO

**Role:** Operations & Business Development

**Background:**
- Bachelor's in Economics
- Insurance industry experience (compliance, contracts)
- Institutional client management
- 100% full-time commitment

**Responsibilities:**
- Business operations and strategy
- Finance and investor relations
- Legal, IP, and patent filings
- Customer relationships and sales
- Marketing and market research

**Why relevant:**
- Economics training for financial modeling
- Compliance mindset from insurance industry
- Institutional sales experience for public sector

### Founder 2: CTO

**Role:** Hardware & Technology

**Background:**
- 22 years combined experience (7 hardware + 15 software)
- Electronics technician (component-level repair)
- NCR - Enterprise IoT systems (5 years current)
- International projects (postal logistics, Toshiba)
- 100% full-time commitment

**Responsibilities:**
- EK3 architecture design
- Firmware development
- Hardware prototyping
- Technical documentation

**Why relevant:**
- Hardware + software in one person
- Designs for repairability (repair background)
- Enterprise IoT scales to connected infrastructure
- International deployment experience

---

## Funding Information

### Amount Seeking
€100,000 (initial Rockstart investment)

### Use of Funds

| Category | Amount | % | Purpose |
|----------|--------|---|---------|
| Product Development | €60,000 | 60% | Prototype iteration, testing, components |
| EU Market Development | €25,000 | 25% | Customer discovery, travel, materials |
| CE Certification Prep | €15,000 | 15% | Pre-compliance, documentation |

### Previous Funding
None - bootstrapped to date

### Funding Plan

| Stage | Amount | Timing | Use |
|-------|--------|--------|-----|
| Pre-seed | €175K | Now | Validation, prototype |
| Seed | €500K-1M | Q4 2026 | CE certification, pilot |
| Series A | €3-5M | 2027 | Manufacturing, EU expansion |

---

## Why Rockstart Energy?

### Why are you applying to Rockstart?

1. **4 D's Perfect Alignment** - EK3 addresses all four: Decentralization (ROJ), Decarbonization (bus electrification), Digitalization (V2G, smart charging), Transport (core focus).

2. **EU Market Access** - We need introductions to Dutch and German transit agencies. Rockstart's network provides this.

3. **Energy Industry Connections** - V2G commercialization requires utility relationships. Rockstart has these.

4. **Portfolio Synergy** - We complement existing software investments (eDRV, Dexter Energy, Sympower) with hardware infrastructure.

5. **Co-Investment Model** - Path to Series A through Rockstart's investor network.

6. **Amsterdam Base** - Ideal for Netherlands BV incorporation, aligned with Rockstart HQ.

### What do you need from Rockstart?

1. **Customer introductions** - Dutch transit agencies (GVB, HTM)
2. **Certification guidance** - CE marking pathway for EV charging
3. **Portfolio introductions** - eDRV for OCPP integration, Dexter for V2G
4. **Investor network** - Series A preparation
5. **Mentorship** - Power electronics scaling, EU market entry

---

## Additional Questions

### How did you hear about Rockstart?
Research into European energy accelerators for EV charging hardware startups.

### Are you available for the program?
Yes, both founders are 100% full-time. Company will be incorporated as Netherlands BV, founders can travel to Amsterdam for program activities. R&D operations remain in Serbia for cost efficiency.

### Do you have a working prototype?
Yes - Renode/Docker demonstration showing 7 modules with distributed consensus, failure recovery, and mesh reformation. Same firmware compiles for real STM32G474 hardware.

### Demo Video Link
[To be added after recording]

### Pitch Deck Link
[To be added - Google Drive or similar]

---

## Application Checklist

Before submitting, verify:

- [ ] All fields completed
- [ ] Demo video uploaded/linked
- [ ] Pitch deck uploaded/linked
- [ ] Team CVs ready if requested
- [ ] Financial projections ready if requested
- [ ] Contact information accurate
- [ ] Review all responses for typos

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-20 | Initial application draft completed |
