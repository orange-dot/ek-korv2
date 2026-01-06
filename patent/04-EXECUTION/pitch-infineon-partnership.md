# Infineon Partnership Proposal

## Elektrokombinacija × Infineon AURIX

**Document Type:** Partnership Pitch
**Date:** January 2026
**Contact:** [Your Name / Email]
**Location:** Serbia

---

## Executive Summary

**Elektrokombinacija** is developing a modular EV charging infrastructure for electric bus fleets, featuring a novel microkernel RTOS called **JEZGRO** built on **Infineon AURIX TC3xx** microcontrollers.

We are seeking a technology partnership with Infineon to:
1. Accelerate JEZGRO development with AURIX hardware support
2. Demonstrate ASIL-D certified charging infrastructure
3. Establish a reference design for European bus depot electrification

**Our ask:** Development kit support, technical collaboration, and potential co-marketing for EXPO 2027 Belgrade demonstration.

---

## 1. Company Overview

### 1.1 About Elektrokombinacija

| Aspect | Details |
|--------|---------|
| **Focus** | Modular EV charging for electric bus fleets |
| **Location** | Serbia (Western Balkans hub) |
| **Stage** | Pre-seed, patent-pending technology |
| **Target Market** | Bus depots, fleet operators, utilities |
| **Differentiator** | ROJ-coordinated modular architecture |

### 1.2 Core Innovation

We're building **EK3** - a 3.3kW power module that combines into any configuration from 3kW to 3MW:

```
┌─────────────────────────────────────────────────────────────┐
│                    EK3 Module (3.3 kW)                      │
├─────────────────────────────────────────────────────────────┤
│  • 200×320×44mm (1U half-width)                             │
│  • 900V SiC MOSFETs (Wolfspeed)                             │
│  • LLC resonant topology                                     │
│  • CAN-FD @ 5 Mbps ROJ communication                        │
│  • Hot-swappable, N+1 redundancy                            │
└─────────────────────────────────────────────────────────────┘
```

**Scaling examples:**

| Application | Modules | Power |
|-------------|---------|-------|
| Home charger | 7 | 23 kW |
| DC fast charger | 46 | 150 kW |
| Bus depot point | 152 | 500 kW |
| MCS truck charging | 909 | 3 MW |

---

## 2. Why Infineon AURIX?

### 2.1 Technical Rationale

We selected **AURIX TC375/TC397** as the foundation for our safety-critical "Hybrid Ultimate" configuration because no other MCU family offers this combination:

| Requirement | AURIX Capability | Alternative Gap |
|-------------|------------------|-----------------|
| **ASIL-D certification** | Native, pre-certified | STM32: None |
| **Hardware lockstep** | CPU0/CPU1 mirrored | Software-only alternatives |
| **HSM crypto** | Integrated, certified | External HSM adds cost/complexity |
| **Multi-core isolation** | 3 independent TriCore CPUs | Single-core limitations |
| **CAN-FD** | 4× instances native | Adequate elsewhere |
| **Real-time performance** | 300 MHz TriCore | Comparable |

### 2.2 JEZGRO: Our AURIX-Native RTOS

**JEZGRO** is a microkernel RTOS specifically designed for power electronics ROJ coordination:

```
┌─────────────────────────────────────────────────────────────┐
│                 JEZGRO on AURIX TC375                       │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    CPU0       │     CPU1      │     CPU2      │    HSM      │
│   (Master)    │  (Lockstep)   │   (Safety)    │  (Crypto)   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ JEZGRO Kernel │ JEZGRO Mirror │ Safety        │ Secure boot │
│ EDF Scheduler │ (redundant)   │ Monitor       │ Key storage │
│ IPC Manager   │               │ Watchdog      │ OTA verify  │
│ CAN Gateway   │               │ Fault Handler │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

**Key features:**
- Microkernel architecture (MINIX-inspired)
- EDF real-time scheduler with deadline guarantees
- Automatic service restart ("reincarnation server")
- Zero-copy IPC for minimal latency
- CAN-FD ROJ coordination across 100+ nodes

### 2.3 Hybrid Architecture

Our premium configuration combines AURIX with specialized co-processors:

| MCU | Role | Why This Choice |
|-----|------|-----------------|
| **AURIX TC375/TC397** | Safety master, ROJ coordination | ASIL-D, lockstep, HSM |
| **TI C2000** | Power control | 150 ps PWM resolution |
| **ESP32-S3** | Connectivity | WiFi/BT, OTA updates |

This architecture delivers **safety + precision + connectivity** - impossible with any single MCU.

---

## 3. Partnership Opportunity

### 3.1 What We Offer Infineon

| Value Proposition | Details |
|-------------------|---------|
| **Reference design** | AURIX-based EV charging module with open documentation |
| **RTOS showcase** | JEZGRO demonstrates AURIX safety features in action |
| **Emerging market entry** | Serbia/Western Balkans gateway, EXPO 2027 visibility |
| **Technical validation** | Real-world ASIL-D application in charging infrastructure |
| **Publication potential** | Joint technical papers, application notes |

### 3.2 What We're Asking

#### Tier 1: Hardware Support (~€500)

| Item | Qty | Purpose |
|------|-----|---------|
| AURIX TC375 Lite Kit | 5 | ROJ development, multi-node testing |
| AURIX TC397 TFT Kit | 1 | Safety validation, advanced features |
| TLE9251VSJ samples | 20 | CAN-FD network prototyping |

#### Tier 2: Technical Collaboration

| Support Type | Value |
|--------------|-------|
| FAE technical consultation | Architecture review, safety guidance |
| Early access to new silicon | TC4xx evaluation when available |
| Safety documentation support | ASIL-D compliance guidance |
| Training materials | AURIX development best practices |

#### Tier 3: Strategic Partnership

| Opportunity | Mutual Benefit |
|-------------|----------------|
| EXPO 2027 Belgrade demo | Joint presence at major regional event |
| Co-marketing | "Powered by Infineon AURIX" branding |
| Case study publication | Demonstrate AURIX in EV infrastructure |
| Western Balkans reference | Entry point for emerging EV market |

---

## 4. Market Opportunity

### 4.1 Electric Bus Charging Market

| Metric | Value | Source |
|--------|-------|--------|
| Global e-bus fleet (2025) | ~800,000 | BloombergNEF |
| Europe e-bus orders (2024) | 4,500+ | Sustainable Bus |
| Charging infrastructure gap | 70% underserved | McKinsey |
| Market CAGR (2024-2030) | 25%+ | Industry estimates |

### 4.2 Western Balkans Opportunity

| Factor | Details |
|--------|---------|
| **EXPO 2027 Belgrade** | Major catalyst for infrastructure investment |
| **EU accession path** | Green transition funding available |
| **Fleet renewal** | Legacy diesel buses aging out |
| **Grid modernization** | V2G potential for grid stabilization |

### 4.3 Competitive Landscape

| Competitor | Weakness | Our Advantage |
|------------|----------|---------------|
| ABB Terra | Monolithic, expensive | Modular, scalable |
| Siemens | Enterprise-focused | Fleet-optimized |
| Chinese OEMs | Quality concerns in EU | European design, local support |

---

## 5. Technical Roadmap

### 5.1 Development Phases

| Phase | Timeline | Milestone | Infineon Involvement |
|-------|----------|-----------|---------------------|
| **Phase 1** | Q1 2026 | JEZGRO kernel on TC375 | Dev kit support |
| **Phase 2** | Q2 2026 | Multi-node CAN-FD ROJ | FAE consultation |
| **Phase 3** | Q3 2026 | Safety validation (TC397) | Safety documentation |
| **Phase 4** | Q4 2026 | Prototype EK3 module | Reference design review |
| **Phase 5** | 2027 | EXPO 2027 demonstration | Co-marketing opportunity |

### 5.2 Deliverables

| Deliverable | Description | Availability |
|-------------|-------------|--------------|
| JEZGRO source code | Open-source microkernel | GitHub (MIT license) |
| Hardware design files | Schematics, PCB layout | Open hardware |
| Application notes | AURIX integration guide | Public documentation |
| Demo videos | ROJ coordination showcase | Marketing use permitted |

---

## 6. Team

| Role | Background |
|------|------------|
| **Founder/Lead Engineer** | [Your background - embedded systems, power electronics] |
| **Advisors** | [Any relevant advisors] |
| **Partners** | [Any existing partnerships] |

---

## 7. Appendix: Technical Specifications

### 7.1 JEZGRO RTOS Specifications

| Specification | Value |
|---------------|-------|
| Kernel size | <16 KB |
| Context switch | <1 µs |
| IPC latency | <500 ns |
| Max services | 32 |
| CAN-FD throughput | 5 Mbps |
| Supported MCUs | AURIX TC3xx, STM32G4 |

### 7.2 EK3 Module Specifications

| Specification | Value |
|---------------|-------|
| Power output | 3.3 kW |
| Input voltage | 400-900 VDC |
| Output voltage | 200-920 VDC |
| Efficiency | >97% |
| Dimensions | 200×320×44 mm |
| Communication | CAN-FD @ 5 Mbps |
| Safety | ASIL-D (with AURIX) |

---

## 8. Contact

**[Your Name]**
Elektrokombinacija
[Email]
[Phone]
[LinkedIn]

**Project Repository:** [GitHub link if public]
**Technical Documentation:** [Link to tehnika/ docs]

---

## 9. References

| Document | Description |
|----------|-------------|
| EK3-DETAILED-DESIGN.md | Complete module specification |
| 16-jezgro.md | JEZGRO RTOS full specification |
| 19-jezgro-dev-alternatives.md | Development platform comparison |
| 20-jezgro-hybrid-bom.md | Hybrid BOM with AURIX |

---

*This document is confidential and intended for Infineon Technologies partnership evaluation.*
