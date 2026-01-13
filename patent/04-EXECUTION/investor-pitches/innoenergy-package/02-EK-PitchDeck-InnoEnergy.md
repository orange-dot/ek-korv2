# ELEKTROKOMBINACIJA - Pitch Deck
## Open-Source Coordination for European EV Infrastructure

*10 Slides for EIT InnoEnergy*

---

# SLIDE 1: Cover

## ELEKTROKOMBINACIJA

**Open-Source Coordination for European EV Infrastructure**

Pre-Seed: EUR 487K

Bojan Janjatovic | bojan.janjatovic@gmail.com
Kikinda, Serbia → Amsterdam, Netherlands (Q1 2026)

---

# SLIDE 2: Problem

## European EV Infrastructure Has Two Problems

### 1. Reliability Crisis
- Current charger uptime: **70-85%**
- Monolithic architecture = single point of failure
- Repair requires technician dispatch (hours to days)

### 2. Digital Sovereignty Gap
- EU energy infrastructure depends on **proprietary US/Asian systems**
- No open European standard for coordination
- Vendor lock-in limits innovation

**EU Target:** 100% zero-emission city buses by 2035 (Clean Vehicles Directive)

---

# SLIDE 3: Solution Overview

## Two Innovations, One System

### EK-KOR2: Open-Source Coordination RTOS
- Potential field scheduling (no central coordinator)
- Self-organizing distributed consensus
- **MIT License** - European-developed

### EK3: Modular Power Hardware
- 3.3 kW building blocks
- Hot-swappable, robot-serviceable
- Scales from 3kW to 3MW

### Combined Result:
**Self-healing infrastructure** - module fails → detected → load redistributed → robot swap in 40 seconds

---

# SLIDE 4: EK-KOR2 Deep Dive

## "Kubernetes for Distributed Energy"

### Key Innovations:
1. **Potential Field Scheduling** - No central coordinator needed
2. **Distributed Consensus** - Modules vote on system decisions
3. **Self-Healing Topology** - Automatic mesh reformation

### Implementation:
- Dual C/Rust implementations (cross-validated)
- 22 test vectors passing
- Ready for MIT License release upon funding

### Why Open-Source?
- European digital sovereignty
- Community-driven innovation
- Standard creation moat
- No vendor lock-in

---

# SLIDE 5: EK3 Hardware

## Modular Power Building Blocks

| Specification | Value |
|---------------|-------|
| Power | 3.3 kW continuous |
| Dimensions | 200 x 320 x 44 mm |
| Efficiency | >96% |
| Switches | 900V SiC MOSFETs (Wolfspeed) |
| Topology | LLC Resonant DC-DC |
| Controller | STM32G474 (EU: STMicroelectronics) |
| Communication | CAN-FD @ 5 Mbps |

### Scaling:
- 1 module = 3.3 kW (e-bike)
- 46 modules = 150 kW (fast charger)
- 303 modules = 1 MW (depot)
- 909 modules = 3 MW (MCS truck)

---

# SLIDE 6: EU Strategic Alignment

## Built for European Policy

| EU Initiative | Our Alignment |
|---------------|---------------|
| EU Open Source Strategy | EK-KOR2 MIT License |
| GAIA-X | Open infrastructure standard |
| Horizon Europe Cluster 5 | Energy coordination OSS |
| Clean Vehicles Directive | Bus fleet electrification |
| AFIR Regulation | Charging infrastructure |

### "European Technology for European Infrastructure"

- Developed in Serbia (EU candidate)
- HQ in Netherlands (EU)
- Manufacturing potential in EU

---

# SLIDE 7: Why Open-Source Works

## Proven Model, New Domain

### Precedents:
| Domain | Open-Source | Outcome |
|--------|-------------|---------|
| Servers | Linux | Red Hat = EUR 34B acquisition |
| Cloud | Kubernetes | Industry standard |
| Mobile | Android | 70% market share |
| Energy | **EK-KOR2** | EU coordination standard? |

### Benefits:
- No vendor lock-in for customers
- Community-driven innovation
- Attracts European talent
- Creates standard = creates moat

---

# SLIDE 8: Market & Competition

## EUR 100B+ Opportunity

| Segment | Size |
|---------|------|
| TAM | EUR 100B+ (EU bus electrification by 2035) |
| SAM | EUR 10B (charging infrastructure) |
| SOM | EUR 500M (reliability/coordination layer) |

### Competitive Comparison:

| Factor | ABB/Siemens | Elektrokombinacija |
|--------|-------------|-------------------|
| Coordination | Proprietary | Open-source (MIT) |
| Architecture | Monolithic | Modular |
| Repair time | Hours-days | 40 seconds |
| Vendor lock-in | Yes | No |
| EU sovereignty | No | Yes |

---

# SLIDE 9: Traction & Team

## Technical Validation Complete

### Traction:
- EK-KOR2: Working C implementation, 22 tests passing
- EK3: Complete design specifications
- 5 patent concepts (WIPO PROOF January 2026)
- Ready for open-source launch upon funding

### Team:

**Bojan Janjatovic - Founder & CTO**
- 15 years enterprise software (Toshiba, NCR Voyix)
- RTOS development (EK-KOR2, JEZGRO)
- Power electronics + embedded systems

**Operations Manager (Confirmed)**
- Economics BA, financial planning & reporting

**Technical Advisors (In Negotiations):**
- Sensors & Automotive (Germany) - PhD, German university, automotive
- Power Electronics (USA) - EV industry engineer, US market

**Planned Hires:**
- CEO - Business, fundraising, partnerships
- Electrical Engineer - Power electronics, CE certification

---

# SLIDE 10: The Ask

## EUR 487K Pre-Seed

### Use of Funds:

| Category | Amount | Purpose |
|----------|--------|---------|
| Team (12 months) | EUR 276K | CTO, CEO, EE, Ops, Advisors |
| EK-KOR2 OSS Launch | EUR 35K | Docs, CI/CD, community |
| EK3 Prototype | EUR 58K | 46 modules (150kW) |
| Robot Station | EUR 42K | Swap mechanism |
| EU Pilot | EUR 32K | Transit operator deployment |
| CE Certification | EUR 18K | EMC, safety testing |
| Legal/NL Inc. | EUR 6K | B.V. setup |
| Contingency | EUR 20K | Buffer |
| **TOTAL** | **EUR 487K** | |

### Milestones:
- **M2:** Open-source launch
- **M8:** 150kW pilot operational
- **M12:** Seed round

### Contact:
bojan.janjatovic@gmail.com | Netherlands B.V. Q1 2026

---

*ELEKTROKOMBINACIJA - Open-Source Coordination for European EV Infrastructure*
