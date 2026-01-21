# ELEKTROKOMBINACIJA

## EK3: Modular EV Charging for European Bus Fleet Electrification

**Rockstart Energy 2026**

---

## 1. The EU Challenge

### Europe's Transport Electrification Gap

**2030 EU MANDATES:**
- All new urban buses must be zero-emission
- 3.5M+ public chargers needed (vs 500K today)
- €280 billion infrastructure investment required

**THE PROBLEM:**
- Current chargers: monolithic, expensive, vendor-locked
- Grid constraints limit deployment speed
- Maintenance requires specialized technicians

**Europe needs charging infrastructure that scales.**

---

## 2. Customer Story

### €1 Million in Hardware. Zero kWh Delivered.

Eastern European bus fleet operator:
- Invested €1M in 10 ABB chargers
- Hardware works - electronics cloned successfully
- Firmware is proprietary black box
- Multiple teams tried to adapt - ALL FAILED
- Chargers sitting idle for MONTHS

**This will happen across Europe as fleets scale.**

---

## 3. The Architecture Problem

| CURRENT APPROACH | WHAT EUROPE NEEDS |
|------------------|-------------------|
| Monolithic 50-150kW units | Modular, scalable |
| Single point of failure | Distributed resilience |
| €100k+ per charger | Affordable at scale |
| Proprietary firmware | Open, adaptable |
| Service truck per repair | Zero truck rolls |
| Grid stress at deployment | Flexible, V2G capable |

**The problem isn't components - it's architecture.**

---

## 4. Our Solution - EK3 Module

### 3.3 kW Building Block for Any Power Level

**EK3 MODULE:**
- 3.3 kW per module
- 200 × 320 × 44 mm
- Hot-swappable
- V2G capable

| Application | Modules | Power |
|-------------|---------|-------|
| City Bus Depot | 46 | 152 kW |
| Articulated Bus | 152 | 502 kW |
| Depot Night | 303 | 1 MW |
| MCS Truck | 909 | 3 MW |

**Same module. Same firmware. Any power level.**

---

## 5. Key Innovation - ROJ Swarm Intelligence

### Decentralized by Design

**TRADITIONAL:** Central controller → single point of failure

**EK3 (ROJ):** Peer-to-peer mesh → each module is autonomous

**KEY FEATURES:**
- CAN-FD mesh (5 Mbps)
- Raft consensus (<100ms failover)
- No single point of failure
- Self-healing network

**ROJ = Serbian for "swarm" - TRUE decentralization**

---

## 6. Working Prototype

### Distributed System Running

**DEMONSTRATION:**
1. DISCOVERY - Modules find each other
2. CONSENSUS - Distributed voting
3. FAILURE - Kill a module
4. RECOVERY - Automatic mesh reformation (<100ms)

**Running on:**
- STM32G474 (Cortex-M4F)
- Raspberry Pi 3 cluster
- Docker/Renode emulation

**Same firmware → same behavior → ready for further development**

---

## 7. V2G & Smart Charging

### Every Module is Grid-Interactive

**Bus Battery ↔ EK3 Modules ↔ Grid**

**USE CASES:**
- Peak shaving for depot operators
- Frequency regulation services
- Emergency backup power
- Renewable integration

**REVENUE POTENTIAL:**
- Grid services: €50-200/bus/month
- Peak avoidance: 20-30% energy cost reduction

**Modules coordinate autonomously for grid response.**

---

## 8. Fleet Logistics Innovation

### Zero Dedicated Service Vehicles

**THE MODEL:**
- Defective module removed at charging station
- Rides to depot on regular bus route (FREE)
- Repaired at central depot
- Replacement module rides back on bus

**RESULT:**
- €0 transport cost (vs €200-500/truck roll)
- <24 hour turnaround
- Scales O(1) - no logistics fleet needed

---

## 9. Circular Design

### 15-25 Year Module Lifecycle

**LIFECYCLE:**
Factory → Deploy → Operate (5+ yrs) → Degrade detected → Bus to Depot → Repair → Refurbish → Re-deploy

**ECONOMICS:**
- New module: €150 (at scale)
- Refurbishment: €60 (40% of new)
- Refurb cycles: 3-5 times
- Effective life: 15-25 years

**Zero e-waste design. EU circular economy aligned.**

---

## 10. Team

### Hardware + Business, EU Company

| Marija Janjatović - CEO | Bojan Janjatović - CTO |
|-------------------------|------------------------|
| Operations & Business Development | Hardware & Technology |
| Economics bachelor (ECC) | 22 years experience |
| Insurance sector (compliance) | 7 yrs electronics repair |
| 100% full-time | NCR - IoT systems (5 yrs) |
| | 100% full-time |

**ADVISORY NETWORK:**

| Distributed Systems Advisor |
|-----------------------------|
| PhD in Computer Science (Western Europe) |
| Specialized: distributed algorithms, mesh networks |
| 15+ years research (Germany, France) |
| Published: topology control, wireless sensor networks |
| Currently: EU defense/telecom sector |
| *Official - identity disclosed under NDA* |

**NOTE:** Distributed systems advisor officially involved, identity confidential due to defense sector employment. Full credentials disclosed under NDA.

**WHY THIS NETWORK MATTERS:**
- Distributed systems expertise directly applicable to ROJ consensus
- Academic rigor in algorithm design

**COMPANY STRUCTURE:**
- Netherlands BV (Haarlem based, registered Zandvoort)
- Advisory network: Germany, France

---

## 11. Industry Validation

### Semiconductor Giant Interest

**INFINEON TECHNOLOGIES (Germany)**
- Currently in NDA signing process
- Technical package shared: custom TriCore emulator + RTOS source code
- Infineon is #1 automotive semiconductor supplier globally

**WHAT WE BUILT:**
- Custom TriCore MCU emulator (fully our IP)
- Multi-module distributed simulation environment
- Same technical package as included here

**WHY NDA WITH INFINEON:**
- Access to detailed timing specifications for TriCore
- Improve emulator accuracy for hardware validation
- Potential component partnership

**STATUS:** Early technical review stage - no commitments yet

**IP PROTECTION:**
- All materials blockchain-timestamped before sharing
- Priority date: January 2, 2026 (Bernstein verified)

---

## 12. European Market Strategy

### Netherlands Launch → EU Expansion

**PHASE 1: Netherlands Base (2026-2027)**
- Haarlem HQ, registered Zandvoort
- Dutch transit agencies (GVB, HTM, Connexxion)
- CE certification complete

**PHASE 2: Core EU Markets (2027-2028)**
- Germany (largest market, 2030 mandate)
- France (Paris 100% ZE by 2025)
- Benelux corridor

**PHASE 3: EU Scale (2028-2030)**
- Southern Europe (Italy, Spain)
- Nordic markets (Copenhagen office)
- MCS truck charging corridor

**MARKET SIZE:**
- EU TAM: €6.8 billion by 2030
- SAM: €1.34 billion | SOM: €13.4 million

---

## 13. Competitive Position

### Only Solution With All Four Innovations

|  | Extreme Modular | Distributed Intel | Fleet Logistics | Circular |
|--|-----------------|-------------------|-----------------|----------|
| ABB | Partial | No | No | Partial |
| Siemens | Partial | No | No | Partial |
| Heliox | Partial | No | No | Partial |
| Kempower | Yes | Partial | No | Partial |
| **EK3** | **Yes** | **Yes** | **Yes** | **Yes** |

**IP PROTECTION:**
- 10 invention disclosures (Bernstein blockchain timestamped)
- Priority date: January 2, 2026
- Patent family planned (3 applications)

---

## 14. Rockstart Alignment - The 4 D's

| Rockstart Focus | EK3 Delivers |
|-----------------|--------------|
| **Decentralization** | ROJ swarm - no central controller |
| **Decarbonization** | Enables bus fleet electrification |
| **Digitalization** | V2G, smart charging, predictive maintenance |
| **Transport** | Core focus - this IS transport electrification |

**ALIGNMENT SCORE: 4/4**

---

## 15. The Ask

### Rockstart Partnership - €175K

**WHY ROCKSTART:**
- Transport Electrification focus - perfect alignment
- EU network access - transit agencies, utilities
- 150-180 day timeline - matches our roadmap
- Co-investment model - path to Series A

**FUNDING USE (€175K):**
- €70K - Hardware for 3 pilot prototypes (3 × 7-module systems)
- €45K - Firmware developer (post-MVP validation)
- €35K - CE pre-compliance testing & certification prep
- €25K - Components, travel, contingency

**Bizdev: CEO (Marija) + Rockstart network collaboration**

**MILESTONES:**
1. MVP validated with first pilot partner
2. Firmware dev onboarded → parallel development capacity
3. CE roadmap complete → ready for Series A

---

## 16. Contact

### ELEKTROKOMBINACIJA

**EK3: Modular EV Charging Infrastructure**

- Email: bojan@elektrokombinacija.com
- GitHub: github.com/orange-dot/autobusi-punjaci
- Company: Netherlands BV (Haarlem / Zandvoort)
- Global team: EU, USA

**Full source code included for technical due diligence.**

*Priority Date: January 2, 2026 (Bernstein blockchain verified)*

---

## Appendix: Technical Specifications

### EK3 Module Specs

| Parameter | Value |
|-----------|-------|
| Power | 3.3 kW |
| Output Voltage | 200-920 VDC |
| Topology | LLC resonant |
| MOSFETs | Wolfspeed 900V SiC |
| MCU | STM32G474 (Cortex-M4F, 170MHz) |
| Communication | CAN-FD @ 5 Mbps |
| Efficiency | >95% |
| Dimensions | 200 × 320 × 44 mm |
| Weight | <3.5 kg |

**Standards:** IEC 61851, ISO 15118, EN 50549 compatible
