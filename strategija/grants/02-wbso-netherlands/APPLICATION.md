# WBSO Netherlands - R&D Tax Credit Application

**Program:** WBSO (Wet Bevordering Speur- en Ontwikkelingswerk)
**Agency:** RVO (Rijksdienst voor Ondernemend Nederland)
**Type:** R&D Tax Credit (wage tax reduction)
**Expected Benefit:** €50,000 - 100,000 per year

---

## What is WBSO?

WBSO is a Dutch tax incentive for R&D activities:
- **Benefit:** Reduction in wage tax and social security contributions
- **Rate:** Up to 32% of first €350K R&D wages, 16% above
- **Startups:** Additional bonus (40% for first €350K)
- **Application:** Per calendar year, multiple periods possible

---

## 1. Company Information

| Field | Value |
|-------|-------|
| Company name | Elektrokombinacija B.V. |
| KvK number | [To be registered] |
| Address | [Netherlands address] |
| Contact | Bojan Janjatovic |
| Email | bojan.janjatovic@gmail.com |
| Sector | Software development / Power electronics |

---

## 2. Project Description

### Project Title
**EK-KOR2: Real-Time Operating System for Distributed Power Electronics Coordination**

### Technical Objective

Development of a novel Real-Time Operating System (RTOS) for coordinating distributed power electronics modules in electric vehicle charging infrastructure.

### Scientific/Technical Challenges

The project addresses the following R&D challenges:

**Challenge 1: Potential Field Scheduling Algorithm**
- Problem: Traditional RTOS schedulers require central coordination
- Technical uncertainty: How to achieve emergent work distribution through field gradients
- Research activities: Algorithm design, mathematical modeling, simulation, validation

**Challenge 2: Distributed Consensus at Scale**
- Problem: Achieving agreement among 100+ nodes without central authority
- Technical uncertainty: Latency vs. consistency tradeoffs at scale
- Research activities: Protocol design, Byzantine fault tolerance, testing

**Challenge 3: Lock-Free Inter-Process Communication**
- Problem: Achieving deterministic timing without blocking
- Technical uncertainty: Consistency guarantees with concurrent access
- Research activities: Algorithm implementation, formal verification, benchmarking

**Challenge 4: Hardware Integration**
- Problem: Running RTOS on resource-constrained embedded platform
- Technical uncertainty: Memory and timing constraints on STM32G474
- Research activities: Optimization, profiling, hardware-specific tuning

### Why This is R&D (Not Routine Development)

| WBSO Criterion | Our Project |
|----------------|-------------|
| Technical novelty | Novel scheduling algorithm (potential fields for temporal scheduling) |
| Scientific uncertainty | Unknown whether algorithm scales to production requirements |
| Systematic investigation | Simulation → hardware → validation methodology |
| Advancement of knowledge | Results will be published (open source + academic papers) |

---

## 3. R&D Activities

### Activity 1: Algorithm Development (400 hours)

| Sub-activity | Hours | Description |
|--------------|-------|-------------|
| 1.1 Mathematical modeling | 80 | Formal specification of potential field theory |
| 1.2 Simulation implementation | 120 | Go-based simulator development |
| 1.3 Algorithm refinement | 100 | Iteration based on simulation results |
| 1.4 Property-based testing | 100 | Formal validation methodology |

### Activity 2: RTOS Implementation (600 hours)

| Sub-activity | Hours | Description |
|--------------|-------|-------------|
| 2.1 Core scheduler | 150 | Potential field scheduler in C |
| 2.2 Consensus protocol | 150 | Threshold voting implementation |
| 2.3 IPC mechanisms | 100 | Lock-free communication |
| 2.4 Hardware abstraction | 100 | STM32G474 port |
| 2.5 Testing framework | 100 | Unit and integration tests |

### Activity 3: Hardware Integration (300 hours)

| Sub-activity | Hours | Description |
|--------------|-------|-------------|
| 3.1 CAN-FD driver | 80 | High-speed communication |
| 3.2 Power stage interface | 80 | ADC, PWM, safety interlocks |
| 3.3 Multi-node testing | 80 | Network coordination |
| 3.4 Performance optimization | 60 | Timing and memory tuning |

### Activity 4: Validation & Documentation (200 hours)

| Sub-activity | Hours | Description |
|--------------|-------|-------------|
| 4.1 Benchmark development | 80 | Performance measurement suite |
| 4.2 Technical documentation | 60 | Architecture and API docs |
| 4.3 Academic paper | 60 | Publication preparation |

### Total R&D Hours: 1,500 hours/year

---

## 4. Personnel

### R&D Staff

| Name | Role | R&D Hours | Hourly Rate (€) | Total (€) |
|------|------|-----------|-----------------|-----------|
| Bojan Janjatovic | CTO / Lead Developer | 1,200 | 65 | 78,000 |
| [Future hire] | Embedded Developer | 300 | 55 | 16,500 |
| **Total** | | **1,500** | | **94,500** |

### Qualification for R&D

**Bojan Janjatovic:**
- 2 years EE (FTN Novi Sad) + Stanford AI Course
- 10+ years software development experience
- Specific expertise: Distributed systems, RTOS design
- Role: Technical lead, algorithm design, implementation

---

## 5. WBSO Benefit Calculation

### Startup Status

| Criterion | Status |
|-----------|--------|
| Company age | <5 years |
| Previous WBSO | None |
| Startup eligible | YES |

### Calculation (2026)

```
R&D WAGE COSTS:                €94,500

WBSO BENEFIT (Startup rates):
├── First €350,000 @ 40%:      €37,800
└── Above €350,000 @ 16%:      €0
                               ─────────
TOTAL BENEFIT:                 €37,800

EFFECTIVE R&D COST REDUCTION:  40%
```

*Note: Rates are indicative. Verify current rates on RVO website.*

---

## 6. Timeline

### Application Periods

WBSO can be applied for multiple times per year:

| Period | Application Deadline | Coverage |
|--------|---------------------|----------|
| Period 1 | End of September (prior year) | Jan-Dec |
| Period 2 | End of November | Start anytime |
| Period 3 | End of August | Sep-Dec |

**Recommended:** Apply in Period 1 for full year coverage.

### Project Timeline

| Phase | Months | R&D Focus |
|-------|--------|-----------|
| Q1 2026 | 1-3 | Algorithm development, simulation |
| Q2 2026 | 4-6 | RTOS implementation, core features |
| Q3 2026 | 7-9 | Hardware integration, testing |
| Q4 2026 | 10-12 | Validation, documentation, release |

---

## 7. Supporting Evidence

### Technical Documentation

- [ ] EK-KOR2 architecture document
- [ ] Algorithm specifications
- [ ] Test results and benchmarks
- [ ] Simulation code (Go)
- [ ] RTOS source code (C/Rust)

### External Validation

- [ ] Infineon partnership correspondence
- [ ] Academic advisor confirmation
- [ ] Peer-reviewed related publications

### R&D Administration

- [ ] Time tracking system
- [ ] Project documentation
- [ ] Meeting notes and decisions
- [ ] Version control history (Git)

---

## 8. Compliance Notes

### WBSO Requirements

| Requirement | How We Comply |
|-------------|---------------|
| R&D performed in Netherlands | Company registered in NL, work performed by NL residents |
| Systematic approach | Documented methodology, version control, testing |
| Technical uncertainty | Novel algorithms, unknown performance at scale |
| Record keeping | Git history, time tracking, documentation |

### What Qualifies as WBSO R&D

✓ Developing new algorithms
✓ Solving technical problems with uncertain solutions
✓ Creating prototypes to test technical feasibility
✓ Technical analysis and testing

### What Does NOT Qualify

✗ Routine software maintenance
✗ User interface design (unless technically novel)
✗ Market research
✗ Administrative activities

---

## 9. Application Process

### Steps

1. **Create eHerkenning account** (Dutch business authentication)
2. **Access RVO portal** (mijn.rvo.nl)
3. **Complete WBSO application form**
4. **Submit project description**
5. **Receive decision** (typically 3 months)
6. **Track hours** during approved period
7. **Submit realization report** (after period ends)

### Key Deadlines

| Deadline | Action |
|----------|--------|
| [Check RVO] | Application for 2026 |
| Monthly | Hour tracking |
| After period | Realization report |

---

## 10. Post-Approval Obligations

### Hour Tracking

- Track R&D hours per project
- Document activities performed
- Keep supporting evidence

### Realization Report

Submit after period ends:
- Actual hours worked
- Activities completed
- Technical results achieved

### Retention

Keep records for 7 years:
- Time registration
- Technical documentation
- Financial records

---

*Application prepared: January 2026*
*Verify current rates and deadlines on: www.rvo.nl/wbso*
