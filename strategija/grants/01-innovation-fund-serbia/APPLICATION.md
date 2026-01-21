# Innovation Fund Serbia - Proof of Concept Application

**Program:** Matching Grants - Proof of Concept
**Applicant:** Elektrokombinacija (Netherlands BV, Serbian founders)
**Amount Requested:** €100,000
**Duration:** 12 months

---

## 1. Project Summary

### Title
**EK-KOR2: Open-Source Coordination System for Modular EV Charging Infrastructure**

### Abstract (max 300 words)

Elektrokombinacija is developing EK-KOR2, an open-source Real-Time Operating System (RTOS) for coordinating distributed power electronics in electric vehicle charging infrastructure. Unlike existing proprietary solutions that rely on central coordinators (single points of failure), EK-KOR2 uses a novel **potential field scheduling** algorithm where modules self-organize through gradient flow.

This Proof of Concept project will validate the technology on real hardware (STM32G474 microcontrollers) and demonstrate coordinated operation of multiple EK3 power modules (3.3kW each).

**Key Innovation:**
- Potential field scheduling: Work distribution without central coordinator
- k=7 topological consensus: Distributed decision-making based on starling flock research
- Lock-free IPC: <100ns communication latency

**Expected Outcomes:**
- EK-KOR2 v1.0 public release (MIT License)
- Hardware demonstration: 5-10 coordinated modules
- Technical documentation and developer guides
- Foundation for EU pilot deployments

**Market Opportunity:**
EU has mandated €100B+ investment in EV charging infrastructure. Current solutions are proprietary and fragmented. An open standard could become the "Linux of distributed energy."

**Serbian Connection:**
Founders are Serbian nationals with strong ties to local technical community. Project leverages Serbian engineering talent and maintains R&D presence in Serbia.

---

## 2. Problem Statement

### Current Situation

[Reference: _shared/03-market-impact.md - "The Problem" section]

```
FRAGMENTATION IN EV CHARGING:
═══════════════════════════════════════════════════════════════

• Every manufacturer: proprietary system
• No interoperability between vendors
• High switching costs for operators
• Slow industry innovation
• No economies of scale in software
```

### Why This Matters

Electric bus fleets need coordinated charging infrastructure:
- Mixed fleets (multiple bus brands)
- Limited grid capacity (must share intelligently)
- V2G potential (no standard coordination)
- Maintenance complexity (multiple vendors)

### Gap in Current Solutions

| Existing Approach | Limitation |
|-------------------|------------|
| Central coordinator | Single point of failure |
| Proprietary protocols | Vendor lock-in |
| Static scheduling | Cannot adapt to failures |
| Closed source | No community innovation |

---

## 3. Proposed Solution

### Technical Approach

[Reference: _shared/01-technology-overview.md]

**EK-KOR2 RTOS** provides:

1. **Potential Field Scheduling**
   - Each module publishes state as "field" (load, thermal, power)
   - Work flows along gradients (high → low load)
   - No central coordinator required

2. **Distributed Consensus**
   - k=7 topological neighbors
   - Threshold voting for decisions
   - Byzantine fault tolerance

3. **Lock-Free Communication**
   - <100ns publish latency
   - Deterministic timing
   - No priority inversion

### Hardware Platform

**EK3 Module** (3.3kW):
- LLC resonant converter
- 900V SiC MOSFETs (Wolfspeed)
- STM32G474 controller
- CAN-FD @ 5 Mbps

### Why Open Source?

[Reference: _shared/03-market-impact.md - "Go-to-Market Strategy"]

- Standard creation opportunity (Linux, Kubernetes, Android model)
- Community contributions accelerate development
- Ecosystem moat stronger than patent moat
- EU policy alignment (digital sovereignty)

---

## 4. Work Plan

### Work Package 1: RTOS Validation (Months 1-4)

| Task | Description | Deliverable |
|------|-------------|-------------|
| WP1.1 | Port EK-KOR2 to STM32G474 hardware | Working firmware |
| WP1.2 | Hardware-in-loop testing | Test reports |
| WP1.3 | Performance benchmarking | Benchmark results |
| WP1.4 | Documentation | Developer guides |

**Milestone M1 (Month 4):** EK-KOR2 running on hardware, benchmarks published

### Work Package 2: Multi-Module Demonstration (Months 5-8)

| Task | Description | Deliverable |
|------|-------------|-------------|
| WP2.1 | Build 5-10 test modules | Hardware units |
| WP2.2 | CAN-FD network integration | Network operational |
| WP2.3 | Consensus validation | Test scenarios |
| WP2.4 | Failure injection testing | Fault tolerance proof |

**Milestone M2 (Month 8):** Multi-module coordination demonstrated

### Work Package 3: Public Release (Months 9-12)

| Task | Description | Deliverable |
|------|-------------|-------------|
| WP3.1 | Code cleanup and review | Release candidate |
| WP3.2 | Open-source preparation | GitHub repository |
| WP3.3 | Community documentation | Tutorials, examples |
| WP3.4 | Launch and promotion | Public release |

**Milestone M3 (Month 12):** EK-KOR2 v1.0 publicly released

---

## 5. Budget

### Summary

| Category | Amount (€) | % |
|----------|------------|---|
| Personnel | 55,000 | 55% |
| Hardware & equipment | 25,000 | 25% |
| Subcontracting | 10,000 | 10% |
| Travel & other | 10,000 | 10% |
| **Total** | **100,000** | 100% |

### Personnel Breakdown

| Role | FTE | Duration | Cost (€) |
|------|-----|----------|----------|
| CTO (Bojan Janjatovic) | 0.5 | 12 months | 40,000 |
| CEO (Marija Janjatovic) | 0.2 | 12 months | 15,000 |
| **Subtotal** | | | **55,000** |

### Hardware Breakdown

| Item | Quantity | Unit Cost (€) | Total (€) |
|------|----------|---------------|-----------|
| STM32G474 development boards | 15 | 100 | 1,500 |
| EK3 prototype PCBs | 10 | 500 | 5,000 |
| Power components (SiC, magnetics) | lot | - | 10,000 |
| Test equipment | lot | - | 5,000 |
| Misc components | lot | - | 3,500 |
| **Subtotal** | | | **25,000** |

### Subcontracting

| Service | Cost (€) |
|---------|----------|
| PCB manufacturing | 5,000 |
| Legal (open source licensing) | 5,000 |
| **Subtotal** | **10,000** |

### Travel & Other

| Item | Cost (€) |
|------|----------|
| Conference attendance | 3,000 |
| Partner meetings | 3,000 |
| Cloud infrastructure | 2,000 |
| Misc | 2,000 |
| **Subtotal** | **10,000** |

---

## 6. Team

### Founders

[Reference: _shared/02-team-expertise.md]

**Bojan Janjatovic - CTO**
- 2 years EE (FTN Novi Sad), Stanford AI Course (2011)
- 7 years electronics repair, 10+ years enterprise software
- NCR Voyix (current), Toshiba postal+customs (solo delivery)
- Designed EK-KOR2, engaged Infineon partnership

**Marija Janjatovic - CEO**
- Business operations and partnerships
- Grant applications and funding
- Market development

### Advisory

- PhD advisor (distributed systems) - official, under NDA
- Automotive sensors advisor - in discussion

---

## 7. Expected Outcomes

### Deliverables

| # | Deliverable | Type | Month |
|---|-------------|------|-------|
| D1 | EK-KOR2 firmware for STM32G474 | Software | 4 |
| D2 | Benchmark report | Document | 4 |
| D3 | Multi-module demonstration | Prototype | 8 |
| D4 | Fault tolerance test report | Document | 8 |
| D5 | EK-KOR2 v1.0 public release | Software | 12 |
| D6 | Developer documentation | Document | 12 |

### Success Metrics

| Metric | Target |
|--------|--------|
| Modules coordinating | ≥5 |
| Consensus latency | <100ms |
| Self-healing time | <1 second |
| Test coverage | >80% |
| GitHub stars (6mo post-release) | >100 |

### Impact

**Technical:**
- First open-source RTOS for distributed power electronics
- Novel scheduling algorithm validated on hardware
- Foundation for safety certification

**Economic:**
- Enable Serbian companies to participate in EU charging market
- Create export opportunity for hardware/services
- Foundation for follow-on EU funding

**Scientific:**
- Peer-reviewed publication potential
- Open benchmark for academic research
- Reference implementation for distributed systems courses

---

## 8. Market Potential

### Target Market

[Reference: _shared/03-market-impact.md]

- EU bus depot charging: €3-5B
- Broader EV charging: €100B+
- Serbian/Balkans entry point: €200-500M

### Competitive Advantage

| Factor | Our Advantage |
|--------|---------------|
| Open source | Community moat, no vendor lock-in |
| Novel algorithm | Potential field scheduling (unique) |
| EU alignment | Digital sovereignty, open standards |
| Cost | 30-50% lower than proprietary |

### Path to Revenue

1. **Year 1:** Open-source release, community building
2. **Year 2:** Certified hardware sales, pilot deployments
3. **Year 3:** Fleet management platform, services

---

## 9. Risk Assessment

[Reference: _shared/08-risk-assessment.md]

### Key Risks

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Hardware bring-up delays | Medium | Conservative schedule, parallel development |
| Performance doesn't meet spec | Low | Simulation validation before hardware |
| Limited community adoption | Medium | Active promotion, reference deployments |

### Contingency

If community adoption is slow:
- Pivot to B2B licensing
- Focus on pilot projects
- Seek strategic partner

---

## 10. Serbian Relevance

### Why Innovation Fund Serbia?

1. **Founders are Serbian nationals**
   - Born and educated in Serbia
   - Strong ties to technical community

2. **R&D presence maintained**
   - Development work in Serbia
   - Collaboration with Serbian universities

3. **Export potential**
   - Technology developed in Serbia
   - Exported to EU market

4. **Skills development**
   - Train Serbian engineers
   - Build local embedded systems expertise

### Connection to Serbian Economy

- Automotive suppliers (Fiat Serbia, Yura, etc.)
- Growing EV market in Serbia
- EXPO 2027 infrastructure opportunity
- Western Balkans regional hub potential

---

## 11. Attachments

- [ ] Company registration documents
- [ ] Founder CVs
- [ ] Technical documentation (EK-KOR2)
- [ ] IP proof (Bernstein certificates)
- [ ] Infineon engagement evidence
- [ ] Budget detail spreadsheet

---

*Application prepared: January 2026*
*Contact: bojan.janjatovic@gmail.com*
