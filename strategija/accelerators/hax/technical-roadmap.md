# EK3 Technical Roadmap

> **Document Purpose**: Technical development roadmap for HAX accelerator application
> **Version**: 1.0
> **Last Updated**: 2026-01-19

---

## Executive Summary

This roadmap outlines the technical path from current prototype (distributed coordination software) to production-ready EK3 3.3 kW charging modules. The roadmap is structured around HAX program milestones.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EK3 DEVELOPMENT TIMELINE                             │
├─────────────┬───────────────┬───────────────────┬──────────────────────────┤
│   NOW       │   PRE-HAX     │    HAX PROGRAM    │      POST-HAX            │
│             │               │    (6-18 months)   │                          │
├─────────────┼───────────────┼───────────────────┼──────────────────────────┤
│ Software    │ Demo Video    │ Hardware Proto    │ Manufacturing Scale      │
│ Prototype   │ Application   │ Real Power        │ Pilot Deployments        │
│ Emulation   │ Filing        │ Field Testing     │ Series A                 │
└─────────────┴───────────────┴───────────────────┴──────────────────────────┘
```

---

## Current Status (Q1 2026)

### Software Prototype - COMPLETE ✅

| Component | Status | Evidence |
|-----------|--------|----------|
| **ROJ Distributed Coordination** | ✅ | ekk_topology.c, ekk_consensus.c |
| **k-Neighbor Discovery** | ✅ | 7 modules in mesh, auto-discovery |
| **Consensus Voting** | ✅ | Supermajority, mode changes |
| **Fault Tolerance** | ✅ | Module failure → mesh reformation |
| **Multi-Platform HAL** | ✅ | STM32G474, EFR32MG24, POSIX |
| **Docker/Renode Demo** | ✅ | `docker-compose run hax-demo` |
| **CI/CD Pipeline** | ✅ | Test vectors, automated builds |

### IP Foundation - COMPLETE ✅

| Component | Status | Details |
|-----------|--------|---------|
| **Priority Date** | ✅ | 2026-01-02 (Git verified) |
| **Invention Disclosures** | ✅ | 5 core inventions documented |
| **Patent Strategy** | ✅ | 3-patent family (A, B, C) |

### Hardware Design - IN PROGRESS 🔄

| Component | Status | Details |
|-----------|--------|---------|
| **EK3 Specs** | ✅ | 3.3 kW, 900V SiC, LLC topology |
| **Component Selection** | ✅ | Wolfspeed MOSFETs, STM32G474 |
| **Schematic** | 🔄 | 60% complete |
| **PCB Layout** | ❌ | Pending schematic completion |
| **Physical Prototype** | ❌ | Pending PCB |

---

## Pre-HAX Milestones (Q1-Q2 2026)

### M0: Application Package ✅
**Target**: Ready for HAX application

| Deliverable | Status |
|-------------|--------|
| Customer Validation Document | ✅ customer-validation.md |
| Prototype Demo (video-ready) | ✅ hax_demo.c |
| Technical Roadmap | ✅ This document |
| Pitch Deck | 🔄 In progress |
| Team Documentation | ✅ hax-sosv.md |
| IP Summary | ✅ patent/ folder |

### M1: Demo Video
**Target**: 2-3 minute professional demo video

| Task | Status |
|------|--------|
| Record terminal demo (asciinema/OBS) | ❌ |
| Add voiceover narration | ❌ |
| Edit with intro/outro | ❌ |
| Upload to YouTube/Vimeo | ❌ |

---

## HAX Program Milestones (Month 1-18)

### Phase 1: Hardware Bringup (Months 1-4)

#### M2: First Hardware Prototype
**Target**: Single EK3 module running ROJ firmware

| Task | Owner | Dependencies |
|------|-------|--------------|
| Complete schematic review | HW Lead | Existing design |
| PCB layout (4-layer) | HW Lead | Schematic |
| Component sourcing | HAX Supply Chain | BOM |
| PCB fabrication | HAX Manufacturing | Layout |
| Assembly (pick & place) | HAX Labs | PCB + components |
| Power-on testing | Team | Assembly |
| Load ROJ firmware | FW Lead | STM32G474 HAL |

**Success Criteria:**
- [ ] Module boots and runs ROJ firmware
- [ ] UART debug output visible
- [ ] CAN-FD communication functional
- [ ] Basic power stage switching (no load)

#### M3: Power Electronics Validation
**Target**: Verified power conversion at 3.3 kW

| Task | Measurement | Target |
|------|-------------|--------|
| Efficiency at 1 kW | η_1kW | > 96% |
| Efficiency at 3.3 kW | η_full | > 95% |
| Output voltage regulation | ΔV | < ±1% |
| Ripple current | I_ripple | < 5% |
| Thermal rise | ΔT | < 40°C |

**Success Criteria:**
- [ ] 3.3 kW continuous operation for 1 hour
- [ ] Efficiency meets spec
- [ ] Thermal management validated

### Phase 2: Multi-Module Integration (Months 4-8)

#### M4: First 7-Module Cluster
**Target**: Physical k=7 mesh demonstrating ROJ

| Task | Details |
|------|---------|
| Build 7 identical modules | Same PCB, firmware |
| Physical rack assembly | 1U half-width format |
| CAN-FD bus wiring | 5 Mbps network |
| Run hax_demo.c on real hardware | Same code as emulation |

**Success Criteria:**
- [ ] 7 modules discover each other
- [ ] Consensus voting works
- [ ] Kill one module → mesh reforms
- [ ] Video recording of physical demo

#### M5: 23 kW Demonstration
**Target**: Home charger equivalent (7 × 3.3 kW)

| Task | Details |
|------|---------|
| Load bank testing | 23 kW resistive load |
| Power sharing validation | Droop control balance |
| Efficiency measurement | System-level η |
| Thermal steady-state | All modules cool |

**Success Criteria:**
- [ ] 23 kW continuous for 2 hours
- [ ] Load balanced across modules (±5%)
- [ ] No thermal runaway

### Phase 3: Field Testing (Months 8-12)

#### M6: First Customer Pilot
**Target**: Real-world deployment with early customer

| Task | Details |
|------|---------|
| Identify pilot customer | Bus fleet operator in Serbia |
| Site survey | Electrical infrastructure |
| Installation | 50-150 kW system |
| Remote monitoring | Cloud dashboard |
| 30-day operation | Collect field data |

**Success Criteria:**
- [ ] System installed and operational
- [ ] No critical failures in 30 days
- [ ] Customer feedback positive
- [ ] Data for reliability analysis

#### M7: Certification Preparation
**Target**: Begin safety certification process

| Standard | Scope | Status |
|----------|-------|--------|
| IEC 61851 | EV charging safety | Understand requirements |
| ISO 15118 | V2G communication | Protocol compliance |
| CE marking | EU market access | Self-certification path |
| UL 2202 | US market access | Lab testing plan |

### Phase 4: Production Readiness (Months 12-18)

#### M8: Design for Manufacturing
**Target**: Production-optimized design

| Task | Details |
|------|---------|
| DFM review with HAX | Shenzhen manufacturing input |
| Cost reduction | Target 35% below competitors |
| Testability features | In-circuit test points |
| Tooling design | Injection molding for enclosure |

**Success Criteria:**
- [ ] BOM cost < €150/module at 10K volume
- [ ] Assembly time < 10 minutes/module
- [ ] Test coverage > 95%

#### M9: Small Batch Production
**Target**: 100-unit production run

| Task | Details |
|------|---------|
| Production line setup | HAX Shenzhen |
| Quality control process | AQL sampling |
| Burn-in testing | 24-hour run-in |
| Packaging design | Shipping-ready |

**Success Criteria:**
- [ ] 100 units produced
- [ ] Yield > 95%
- [ ] Quality issues documented and resolved

---

## Post-HAX Milestones (Year 2+)

### M10: Series A Fundraising
**Target**: $2-5M for manufacturing scale

| Activity | Details |
|----------|---------|
| Investor deck update | With HAX results |
| SOSV follow-on | Up to $4-5M available |
| External investors | Climate tech VCs |
| Use of funds | Manufacturing, team, pilots |

### M11: Volume Manufacturing
**Target**: 10,000 modules/year capacity

| Task | Details |
|------|---------|
| Contract manufacturer selection | China or local |
| Supply chain agreements | Key components |
| Quality system | ISO 9001 |
| Inventory management | JIT where possible |

### M12: Market Expansion
**Target**: Multiple customer deployments

| Market | Priority | Notes |
|--------|----------|-------|
| Serbia/Balkans | High | EXPO 2027, home market |
| Central Europe | Medium | EU expansion |
| US Market | Medium | HAX/Newark network |
| MENA Region | Low | Future opportunity |

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Power stage efficiency below target | Medium | High | Multiple topology options designed |
| EMI compliance failure | Medium | Medium | Pre-compliance testing early |
| Thermal issues at scale | Low | High | Conservative design margins |
| Firmware bugs in production | Medium | Medium | Extensive emulation testing |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Component shortages | Medium | High | Multi-source BOM |
| Customer pilot delays | Medium | Medium | Multiple pilot candidates |
| Certification delays | Medium | High | Start early, use consultants |
| Competition accelerates | Low | Medium | Patent protection, speed |

---

## Resource Requirements

### HAX Program Support Needed

| Resource | Usage |
|----------|-------|
| **Mechanical Engineering** | Enclosure design, thermal |
| **Electrical Engineering** | PCB review, EMI |
| **Supply Chain** | Component sourcing, Shenzhen |
| **Lab Equipment** | Power analyzers, load banks |
| **Manufacturing** | PCB assembly, production |

### Team Expansion During HAX

| Role | Priority | Timing |
|------|----------|--------|
| Power Electronics Engineer | High | Month 1-3 |
| Manufacturing Engineer | Medium | Month 6-9 |
| Field Applications Engineer | Medium | Month 9-12 |
| Sales/BD | Low | Month 12+ |

---

## Success Metrics

### HAX Program Exit Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Working prototypes | ≥ 10 modules | Functional units |
| Power validated | 3.3 kW each | Lab testing |
| Customer pilots | ≥ 1 site | Deployed system |
| IP filed | 1+ patents | USPTO/EPO |
| Follow-on ready | Yes | Term sheet or commitment |

### Key Performance Indicators

| KPI | Current | Month 6 | Month 12 | Month 18 |
|-----|---------|---------|----------|----------|
| Modules built | 0 | 10 | 50 | 200 |
| Total power validated | 0 kW | 33 kW | 150 kW | 500 kW |
| Field sites | 0 | 0 | 1 | 3 |
| Team size | 3 | 4 | 5 | 7 |
| Revenue | $0 | $0 | $50K | $200K |

---

## Timeline Summary

```
2026
├── Q1: Application & Demo Video
├── Q2: HAX Interview & Acceptance
├── Q3: First Hardware Prototype (M2)
├── Q4: Power Validation (M3)

2027
├── Q1: 7-Module Cluster (M4)
├── Q2: 23 kW Demo (M5)
├── Q3: Customer Pilot (M6)
├── Q4: Certification Start (M7)

2028
├── Q1: DFM & Production Prep (M8)
├── Q2: Small Batch Production (M9)
├── Q3: Series A (M10)
├── Q4: Volume Manufacturing (M11)
```

---

## Appendix: Technical Specifications Reference

### EK3 Module Specifications

| Parameter | Value |
|-----------|-------|
| Rated Power | 3.3 kW |
| Input Voltage | 380-480 VAC (3-phase) |
| Output Voltage | 200-920 VDC |
| Efficiency | > 95% |
| Topology | LLC resonant (DAB option) |
| Dimensions | 200 × 320 × 44 mm (1U half-width) |
| Weight | < 3.5 kg |
| Cooling | Forced air (shared fan) |
| Communication | CAN-FD @ 5 Mbps |
| MCU | STM32G474 (Cortex-M4F) |

### Scaling Reference

| Application | Modules | Power |
|-------------|---------|-------|
| E-bike | 1 | 3.3 kW |
| Home (Level 2) | 7 | 23 kW |
| DC Fast (Tesla-class) | 46 | 152 kW |
| Bus Depot | 152 | 502 kW |
| Highway (MW-class) | 303 | 1 MW |
| MCS Truck | 909 | 3 MW |

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-19 | Initial version for HAX application |
