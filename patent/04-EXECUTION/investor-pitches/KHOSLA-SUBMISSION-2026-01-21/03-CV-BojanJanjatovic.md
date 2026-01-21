# BOJAN JANJATOVIC
## Co-Founder & CTO, Elektrokombinacija

**Location:** Kikinda, Serbia → Amsterdam, Netherlands (Q1 2026)
**Email:** bojan.janjatovic@gmail.com

---

## Professional Summary

Engineer with **EE background, hardware roots, and software expertise** - 2 years electrical engineering studies (FTN Novi Sad, not completed), 7 years electronics repair with father, then 10+ years enterprise software in mission-critical systems. No degree, but this combination - EE fundamentals, deep hardware intuition, plus production software discipline - is exactly what's needed to build distributed power electronics.

Co-founding Elektrokombinacija with Marija Janjatovic (CEO) - building the open-source coordination standard for distributed energy infrastructure.

**Building:**
- EK-KOR2: Novel RTOS with potential field scheduling
- EK3: 3.3kW modular power electronics
- Fleet coordination platform for EU infrastructure

**Company:** Netherlands BV (Haarlem / Zandvoort), co-founded with Marija Janjatovic (CEO)

---

## Professional Journey

### The Foundation: EE Studies + Hands-On Experience

**Electrical Engineering | FTN Novi Sad, Serbia (2 Years, not completed)**

Started electrical engineering at Faculty of Technical Sciences (FTN) in Novi Sad. Left after 2 years to start working. This is where I met my current Distributed Systems advisor - we were classmates.

- 2 years of electrical engineering curriculum
- Circuit theory, electronics, power systems fundamentals
- Decided to pursue practical work instead of finishing degree

**Father's Electronics Repair Shop | Kikinda, Serbia (7 Years)**

Left university and started working with father in his electronics repair shop. Component-level diagnostics, repair, and deep practical understanding of hardware.

- 7 years hands-on electronics repair alongside father
- CRT TVs, VCRs, audio equipment, industrial electronics
- Component-level troubleshooting and repair
- Deep intuition for hardware behavior and failure modes

**Why This Path Worked:**
> "I have 2 years of EE theory plus 7 years of fixing broken things. No degree, but real understanding. When I design the EK3 power module, I know the theory AND I'm thinking about what will fail and how to make it repairable."

---

### The Transition: Software Development (Age 30)

At 30, decided to transition from hardware repair to software development. Started with self-paced learning, then enrolled in the **Stanford AI Course (2011)** - the first massive online course in history, taught by Sebastian Thrun and Peter Norvig. This was the course that launched the MOOC movement.

- Stanford AI Course (Thrun/Norvig, 2011) - first MOOC ever
- Self-paced learning: C#, .NET, SQL, web technologies
- 2 years intensive study before first professional role
- Transitioned from hardware mindset to software discipline

**Why This Matters:**
> "I learned programming from the people who built Stanley and Google's AI. The same autonomous systems thinking now drives EK-KOR2's distributed coordination."

---

## Professional Experience

### Elektrokombinacija | Co-Founder & CTO
**2025 - Present | Kikinda, Serbia → Netherlands**

Building the "Linux of distributed energy" - open-source coordination RTOS + modular power electronics for EV charging infrastructure.

**Technical Achievements:**
- Invented potential field scheduling for distributed coordination
- Designed EK-KOR2 RTOS with k=7 topological consensus
- Created EK3 3.3kW module design (900V SiC, LLC topology)
- Filed 10 invention disclosures (Bernstein blockchain timestamped)
- Built fleet simulator validating 100+ node scenarios
- Engaged Infineon for emulator development partnership

**Technologies:** C, Rust, STM32G474, CAN-FD, Power Electronics, RTOS Design

---

### NCR Voyix | Software Developer
**2020 - Present (5 years) | Serbia (Remote)**

Enterprise IT systems for retail and hospitality - both edge devices and backend infrastructure.

**Scope:**
- Edge device software (point-of-sale terminals, kiosks)
- Backend systems (transaction processing, data pipelines)
- Large-scale distributed architecture
- Mission-critical reliability (24/7 retail operations)

**Technologies:** C# (.NET), SQL Server, Azure, microservices

**Relevance to Elektrokombinacija:**
- Enterprise-grade code quality standards
- Edge + backend full-stack experience
- Production systems serving millions of transactions
- Reliability mindset for critical infrastructure

---

### Toshiba Postal & Customs Automation | Solo Software Engineer
**2016 - 2019 | Via Serbian Engineering Subcontractor**

**First integrated postal + customs automation on single sorting line** - pioneering project combining postal sorting with automated customs inspection. Others kept these systems separate; we integrated them.

**Solo delivery:** Architecture, design, implementation, testing - all done by me alone. Not ideal practice, but the only option available. Same pattern as EK-KOR2 today.

**The System Architecture:**
```
SINGLE SORTING LINE WITH 2 DIVERT POINTS
═══════════════════════════════════════════════════════════════

Package Entry → OCR/Scanning → DIVERT 1 → Rapiscan X-ray → DIVERT 2 → Output
                    │         (Postal)         │        (Customs)
                    │            │             │            │
                    ▼            ▼             ▼            ▼
               Parascript    Postal        X-ray      Customs
               Address       Control      Inspection   Control
               Recognition   Decision     Results      Decision
                    │            │             │            │
                    └────────────┴──────┬──────┴────────────┘
                                        │
                              ┌─────────▼─────────┐
                              │   MY SYSTEM       │
                              │ Control & Integration │
                              │   (Solo Engineer)     │
                              └───────────────────┘
```

**The Integration Consortium (I was the glue):**
| Partner | Role |
|---------|------|
| Toshiba | Prime contractor, sorting machines |
| Rapiscan | X-ray scanning, security inspection |
| Parascript | OCR, address recognition |
| Russian Conveyor Co. | Material handling, conveyors |
| **Me (Solo)** | **Control & Integration - all software** |

**What I Built Alone:**
- Gathered postal data from OCR/scanning systems
- Made real-time decisions for Divert Point 1 (postal control)
- Received X-ray inspection results from Rapiscan conveyor
- Passed inspection data to postal office IT systems
- Import function for electronic customs data (AliExpress, Chinese vendors)
- Modbus and PLC integration across all vendors
- Business logic for routing decisions
- Architecture, implementation, testing - everything

**Why This Matters:**
> "I delivered a complex multi-vendor integration system alone - architecture to deployment. Not because it's good practice, but because it was the only option. Same situation with EK-KOR2. I know how to ship when resources are constrained. Now I need a team to do it properly."

**Technologies:** C, PLC programming, Modbus, industrial automation, real-time systems

---

### Earlier Software Career
**2012 - 2017 | Various Positions**

Progressive software engineering roles after self-taught transition:
- C# / .NET application development
- Database development and optimization (SQL Server)
- Backend systems and APIs
- Enterprise application development
- Building foundation for larger system work

---

## Technical Skills

### Software Development

| Area | Technologies |
|------|--------------|
| Primary | C# (.NET), enterprise systems |
| Systems | C, Rust, Go |
| Applications | Python, JavaScript, TypeScript |
| Embedded | STM32, ARM Cortex-M, RTOS |
| Communication | CAN-FD, SPI, I2C, UART, Modbus |
| Industrial | PLC integration, machine control |
| Tools | Git, CMake, Cargo, CI/CD |

### RTOS Development

| Project | Innovation |
|---------|------------|
| EK-KOR2 | Potential field scheduling, distributed consensus |
| JEZGRO | MINIX-inspired microkernel for embedded |

### Power Electronics (Self-Taught + Projects)

| Area | Experience |
|------|------------|
| Topologies | LLC resonant, Vienna PFC, Buck/Boost |
| Components | SiC MOSFETs (Wolfspeed), Gate drivers |
| Control | Digital control loops, HRTIM PWM |
| Analysis | Thermal modeling, efficiency optimization |

---

## Projects

### EK-KOR2 RTOS (2025-Present)

**Novel coordination system without central scheduler**

- Potential field scheduling (gradient-based work distribution)
- k=7 topological neighbors (scale-free network theory)
- Threshold consensus (distributed decision making)
- Lock-free IPC (<100ns publish latency)
- Dual C/Rust implementation (cross-validated)
- 22 test vectors, all passing
- MIT License planned

### EK3 Power Module (2025-Present)

**3.3kW modular power conversion unit**

- LLC resonant converter with DAB variant
- 900V SiC MOSFETs (Wolfspeed C3M0065100K)
- STM32G474 control system
- CAN-FD communication @ 5 Mbps
- >97% efficiency target
- Complete specifications ready for prototype

### JEZGRO Microkernel (2024-2025)

**MINIX-inspired RTOS for embedded systems**

- Message-passing architecture
- Fault isolation with automatic restart
- Multiple hardware ports (STM32G4, STM32H7)
- Minimal footprint (~8KB Flash)

### Fleet Simulator (2025)

**Discrete event simulation for distributed power systems**

- Go implementation
- Fault injection testing
- Self-healing verification
- 100+ node scenarios validated

---

## Why This Background Matters for Khosla

### The Unique Combination

```
EE FUNDAMENTALS + HARDWARE ROOTS + SOFTWARE DISCIPLINE = DEEP TECH
═══════════════════════════════════════════════════════════════

2 years EE at FTN Novi Sad → EE fundamentals (no degree)
(not completed)            → Circuit theory, power systems
                          → Met current advisor (classmate)
                          → Left to start working

7 years electronics repair → Deep hardware intuition
(with father)             → Understanding failure modes
                          → Designing for repairability

Stanford AI Course (2011) → First MOOC ever (Thrun/Norvig)
                         → Foundation for software transition
                         → Same autonomous systems thinking

3 years multi-vendor integration → Coordinating complex systems
(Toshiba postal+customs, SOLO)  → Real-time machine control
                                → Industrial reliability standards

5 years enterprise software → Production code quality
(NCR Voyix)                → Scalable architecture
                           → Mission-critical mindset

NO DEGREE - but shipped complex systems alone twice (Toshiba, EK-KOR2)
Not ideal practice - but proves ability to deliver under constraints
```

### Experience → EK3/EK-KOR2 Translation

| Past Experience | Direct Application |
|-----------------|-------------------|
| Electronics repair (7 yrs) | EK3 module design - thinking about what fails |
| Multi-vendor integration (Toshiba) | EK-KOR2 coordination across heterogeneous modules |
| Real-time divert decisions (postal/customs) | Potential field scheduling - millisecond decisions |
| Modbus/PLC machine control | CAN-FD protocol design, timing constraints |
| First integrated postal+customs line | Novel system integration - "too complex" doesn't stop us |
| Enterprise edge + backend (NCR) | Distributed architecture, reliability at scale |

### Technical Range

| Capability | Evidence |
|------------|----------|
| System architecture | Designed two-tier L1/L2 safety architecture |
| Algorithm design | Invented potential field scheduling |
| Hardware understanding | 7 years repair + designed complete power module |
| Software implementation | Built working RTOS, simulator, web app |
| Industrial integration | Led control/integration for 5-vendor consortium |

### Execution History

**Pattern: Can deliver complex systems solo when needed**

- Built first integrated postal+customs sorting line **alone** (2016-2019)
- Coordinated 5 international vendors into single real-time system - solo engineer
- Shipped enterprise software serving millions of transactions (NCR Voyix)
- Self-taught software at 30, became integration lead by 35
- Built complete EK3/EK-KOR2 technical stack **alone** (2025)

> "I've proven I can ship alone. Now I need funding to build a proper team."

---

## Founding Team

| Role | Person | Focus |
|------|--------|-------|
| CEO | Marija Janjatovic | Business operations, partnerships, fundraising |
| CTO | Bojan Janjatovic | Technology, product, architecture |

**Why Two Founders:**
- CEO/CTO balance from day one
- Marija handles business while Bojan focuses on technology
- Both 100% full-time committed

**Long-Term:** Bojan remains CTO. Standard creation requires long-term technical leadership.

---

## Advisory Network

### Distributed Systems & Optimization Advisor (Official)

| Attribute | Detail |
|-----------|--------|
| Education | PhD in Computer Science (Western Europe) |
| Experience | 15+ years research (Germany, France) |
| Specialization | Distributed algorithms, mesh networks, optimization |
| Published | Topology control, wireless sensor networks |
| Focus | MAPF-HET, V2G optimization, fleet logistics |
| Current | EU defense/telecom sector |
| Connection | Personal (high school classmate) |
| Status | *Official advisor - identity confidential due to employer; disclosed under NDA* |

### Sensors & Automotive Advisor (In Discussion)

| Attribute | Detail |
|-----------|--------|
| Education | PhD Engineering (France), MSc (Serbia) |
| Current | Researcher at German university |
| Expertise | Sensors, signal processing, automotive systems |
| Role | ISO 26262 guidance, EU academic network |

---

## Education

### Formal Education

**Electrical Engineering | FTN Novi Sad, Serbia (2 years, not completed)**
- Left after 2 years to start working
- Circuit theory, electronics, power systems fundamentals
- Met current Distributed Systems advisor (classmate)

### Online Education

**Stanford AI Course | 2011 (Completed)**
- First MOOC in history (160,000+ students worldwide)
- Instructors: Sebastian Thrun (Stanford/Google), Peter Norvig (Google)
- Foundation for transition to software development

### Self-Directed Technical Learning

| Area | Method |
|------|--------|
| Software development | Stanford AI Course + self-paced (C#, .NET, SQL) |
| Power electronics | EE fundamentals + 7 yrs repair + online courses + projects |
| RTOS design | Academic papers, open-source study, implementation |
| Embedded systems | STM32 ecosystem, ARM architecture |
| Distributed systems | Years of production experience + research |

---

## Languages

| Language | Level |
|----------|-------|
| Serbian | Native |
| English | Professional (C1) |

---

## Team Building Plan

### Immediate Hires (With Seed Funding)

| Role | Skills Needed | Purpose |
|------|---------------|---------|
| Power Electronics Engineer | SiC, magnetics, thermal | EK3 prototype → production |
| Embedded Rust Lead | Embassy, embedded-hal | EK-KOR2 Rust implementation |
| Community Manager | OSS, developer relations | Ecosystem building |

### Series A Hires

| Role | Skills Needed | Purpose |
|------|---------------|---------|
| Safety Engineer | IEC 61508, ISO 26262 | ASIL-D certification |
| Hardware Team (2-3) | PCB, manufacturing | Production scaling |
| DevRel / Marketing | Technical marketing | Adoption acceleration |

---

## Contact

**Bojan Janjatovic**
bojan.janjatovic@gmail.com

**GitHub:** github.com/elektrokombinacija (private - access on request)
**Location:** Kikinda, Serbia → Amsterdam, Netherlands (Q1 2026)

---

*CV prepared: January 2026*
*For: Khosla Ventures Seed Fund Application*
