# Khosla Ventures Seed Fund Application

**Company:** Elektrokombinacija (Netherlands BV)
**Founders:** Marija Janjatovic (CEO) & Bojan Janjatovic (CTO)
**Date:** January 21, 2026
**Ask:** $2.5M Seed

---

> "More risk is something most people are afraid of, and it's where the larger opportunity lies." - Vinod Khosla

---

## 1. Problem Overview

### The Missing Standard for Distributed Energy

Distributed energy infrastructure is undergoing a $100B+ buildout, but **there is no open coordination standard**.

Every modular energy system - EV charging depots, grid storage farms, microgrids, V2G installations - needs a coordination layer to orchestrate hundreds or thousands of power modules. Today, every vendor builds their own:

```
CURRENT STATE: FRAGMENTED, PROPRIETARY, BRITTLE
═══════════════════════════════════════════════════════════════

ABB → Proprietary coordination → Works only with ABB modules
Siemens → Proprietary coordination → Works only with Siemens
ChargePoint → Proprietary coordination → Works only with ChargePoint

RESULTS:
• No interoperability between systems
• Central schedulers = single point of failure
• Doesn't scale beyond ~50 modules
• Vendor lock-in, expensive service contracts
• Every deployment reinvents the same problems
```

### The Characteristics of a Very Large Opportunity

**This is not an incremental market. It's infrastructure creation.**

| Market Segment | Size | Driver |
|----------------|------|--------|
| EU Electric Bus Infrastructure | $50B by 2035 | 100% electric mandate |
| Global EV Charging | $100B by 2030 | ICE phase-out |
| Grid Storage | $45B by 2030 | Renewable integration |
| V2G Infrastructure | $25B by 2030 | Grid flexibility |

**The coordination layer touches ALL of these.** Whoever creates the standard captures the platform position.

### Why This Is a Black Swan Bet

- **Technical Risk:** HIGH - Novel scheduling paradigm, distributed consensus, real-time embedded systems
- **Market Risk:** LOW - EU mandates guarantee infrastructure buildout regardless of technology choices
- **Standard Risk:** LOW - No incumbent owns this layer; first mover creates the standard

> "It is from the depths of the unknown and the unexpected that revolutionary innovation emerges." - Vinod Khosla

---

## 2. Unfair Advantage

### Scientific Breakthrough: Potential Field Scheduling

**We've invented a new paradigm for distributed coordination.**

Traditional systems use central schedulers - a single controller that assigns work to modules. This doesn't scale, creates single points of failure, and requires expensive redundancy.

EK-KOR2 uses **potential field scheduling** - each module publishes its state (load, thermal, power) as a "field." Work flows along gradients automatically, like water flowing downhill. No central coordinator. Emergent coordination.

```
POTENTIAL FIELD COORDINATION
═══════════════════════════════════════════════════════════════

┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
│Mod 1 │   │Mod 2 │   │Mod 3 │   │Mod N │
│φ=0.5 │◄─►│φ=0.3 │◄─►│φ=0.7 │◄─►│φ=0.4 │
└──────┘   └──────┘   └──────┘   └──────┘

Work flows from HIGH field to LOW field automatically
Network self-balances without coordination
Scales from 10 to 1000+ modules

KEY INSIGHT:
Not centralized scheduling. Not even distributed scheduling.
EMERGENT scheduling from local interactions.
```

**Mathematical Foundation:** Adapted from Khatib's 1986 artificial potential field formulation for robot navigation. Maps spatial concepts to temporal scheduling domains.

### IP Position

**5 Core Patent Concepts + 5 Additional Inventions (10 Total)**

| # | Invention | Status |
|---|-----------|--------|
| 01 | Unified Modular Power Architecture | Timestamped |
| 02 | Dual-Purpose Robotic Swap Station | Timestamped |
| 03 | Distributed Power Sparing System | Timestamped |
| 04 | Fleet-Integrated Maintenance Logistics | Timestamped |
| 05 | Coordinated Dual-Robot System | Timestamped |
| 06 | JEZGRO Microkernel (EK-RTOS) | Timestamped |
| 07 | Decentralized V2G Control System | Timestamped |
| 08 | V2G AI/ML Fleet Optimization | Timestamped |
| 09 | Multi-Vehicle Swap Coordination | Timestamped |
| 10 | JEZGRO Distributed Consensus Ecosystem | Timestamped |

**Priority Protection:**
- Bernstein blockchain timestamps (January 2, 2026)
- GPG-signed Git commits with verified dates
- Bitcoin blockchain anchoring for ownership verification
- CN + EU certificates on file

### Business Model Innovation: The Android Model

**Open-source the OS layer. Monetize the stack above it.**

```
LAYERED ARCHITECTURE - STRATEGIC IP SEPARATION
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  PROPRIETARY LAYER (Closed Source)                          │
│  ─────────────────────────────────────────────────────────  │
│  • EK3 Certified Hardware (margins, certification moat)     │
│  • Fleet Management System (AI scheduling, logistics)       │
│  • Cloud Telemetry Platform (SaaS revenue)                  │
│  • Robotic Swap System (mechanical design, control)         │
│                                                             │
│  → Revenue generation, competitive differentiation          │
├─────────────────────────────────────────────────────────────┤
│  OPEN SOURCE LAYER (MIT License)                            │
│  ─────────────────────────────────────────────────────────  │
│  • EK-KOR2 RTOS (coordination, consensus, topology)         │
│  • JEZGRO Kernel (real-time scheduling, HAL)                │
│  • Communication Protocols (CAN-FD messaging)               │
│                                                             │
│  → Industry adoption, network effects, talent magnet        │
└─────────────────────────────────────────────────────────────┘

PRECEDENTS:
Linux (OSS) → Red Hat tools (proprietary) = $34B IBM acquisition
Android (OSS) → Google apps (proprietary) = Mobile ecosystem dominance
Kubernetes (OSS) → Cloud services (proprietary) = $B revenue streams

OUR PLAY:
EK-KOR2 (OSS) → EK3 Hardware + Fleet Platform (proprietary)
```

**Vinod Khosla's Sun heritage:** He co-founded Sun Microsystems, which pioneered this exact layered strategy. He understands strategic IP separation.

### Why Now

1. **EU 2035 Mandate:** 100% electric buses required. Infrastructure buildout is MANDATORY.
2. **No Incumbent Standard:** ABB, Siemens, ChargePoint all have proprietary solutions. No one has opened the coordination layer.
3. **Technology Maturity:** Rust/Ferrocene now ASIL-D certified for safety-critical embedded. Embassy framework mature for async embedded.
4. **Community Ready:** Embedded Rust community is large, active, and hungry for real hardware projects.

### Technology Principles: How It Works

**1. Potential Field Publishing**
```
Each module continuously publishes:
• Load potential (current execution load)
• Thermal gradient (heat diffusion state)
• Power trajectory (consumption prediction)

Published via lock-free shared memory (<100ns latency)
Uses sequence counter pattern - no locks, no blocking
```

**2. Topological k=7 Neighbors**
```
Each module tracks exactly 7 logical neighbors
Based on Cavagna & Giardina's 2010 starling flock research
Scale-free correlations - information propagates without attenuation
Network stays connected even with multiple failures
```

**3. Threshold Consensus**
```
Distributed decision-making without central coordinator
Safety-critical: 67% supermajority required
Operational: 50% simple majority
Local: autonomous (thermal throttling)

Mutual inhibition prevents conflicting decisions
Density-dependent activation scales with network size
```

### What Has Been Proven

| Component | Status | Evidence |
|-----------|--------|----------|
| EK-KOR2 RTOS core | Working | C implementation, 22 test vectors passing |
| Potential field scheduler | Working | Cross-validated against reference implementation |
| k=7 topological coordination | Working | Simulated at 100+ node scale |
| Threshold consensus | Working | Property-based testing validated |
| Lock-free IPC | Working | <100ns latency measured |
| EK3 hardware design | Complete | Full specifications, BOM, thermal analysis |
| Fleet simulator | Working | Go implementation with failure injection |
| MAPF-HET algorithms | Working | Go implementation, CBS-HET + 5 proposed extensions |
| MAPF-HET research | Complete | State-of-the-art survey + 5 algorithmic contributions |

### Distance from Commercial Scalability

**12-18 months to certified hardware deployment.**

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| OSS Launch | Month 6 | EK-KOR2 public, community building |
| Hardware Prototype | Month 9 | Working EK3 module, lab tested |
| Certification | Month 12 | CE/UL certification complete |
| Pilot Deployment | Month 15 | Live system with EU transit operator |
| Production | Month 18 | Manufacturing partner, volume capability |

### Risks That Remain to Be Proven

**1. Real-Time Consensus at Scale (High)**
- Threshold consensus validated at 100 nodes
- 1000-node scale requires hierarchical segments
- Gateway architecture designed but not implemented
- **Mitigation:** Segment isolation limits blast radius

**2. Hardware Certification Path (Medium)**
- EK3 design uses proven components (Wolfspeed SiC, STM32G474)
- LLC topology well-understood
- CE/UL certification process is time + money, not technical risk
- **Mitigation:** Engage certification body early

**3. Community Adoption (Medium)**
- OSS success requires momentum
- Embedded Rust community is active but niche
- **Mitigation:** Strong documentation, reference hardware, corporate backing

### Three Major Things That Could Go Wrong

**1. Scale Failure at 500+ Nodes**
- Potential field gradients may not propagate correctly in large networks
- Network partitions could cause split-brain scenarios
- **Contingency:** Implement hierarchical architecture earlier; segment gateways limit coordination scope

**2. OSS Community Doesn't Materialize**
- Project releases but fails to attract contributors
- Competitors fork without contributing back
- **Contingency:** Pivot to consulting/licensing model; reference design still valuable

**3. Incumbent Responds Aggressively**
- ABB/Siemens open-source their coordination layer in response
- They have more resources, existing customer relationships
- **Contingency:** First-mover advantage + community ownership; they can't buy the community

### Theoretical Models Validated

| Model | Validation Method | Result |
|-------|-------------------|--------|
| Potential field decay | Property-based testing | τ=100ms optimal |
| k=7 topology | Cavagna/Giardina biological research | Scale-free confirmed |
| Threshold consensus | TLA+ model checking (partial) | Safety properties hold |
| Lock-free IPC | Miri undefined behavior detection | No violations |

### External Third-Party Validation

**Infineon Partnership (In Progress)**

- **Who:** Infineon Technologies - €50B semiconductor giant
- **Relationship:** Engaged for emulator development collaboration
- **Status:** Source code shared; NDA signing in progress for timing specifications
- **Significance:** Major semiconductor vendor validates technical approach

**What This Means:**
- Industry leader reviewed our architecture and engaged
- Not a research curiosity - production-path validation
- Access to advanced hardware support and documentation
- Potential co-development of safety-certified components

**Academic Research Collaboration**

- **Who:** Distributed Systems & Optimization Advisor (PhD, Western Europe)
- **Background:** Distributed algorithms, optimization theory, mesh networks, wireless sensor networks
- **Relationship:** Official advisor (personal connection - high school classmate)
- **Focus Areas:** Multi-Agent Path Finding (MAPF-HET), Distributed V2G Optimization
- **Significance:** Publication-quality formal problem statements
- **Status:** Official collaboration; identity confidential due to defense sector employment (disclosed under NDA)

**Research Topics Under Development:**

| Topic | Formalization | Publication Venue |
|-------|--------------|-------------------|
| MAPF-HET (Multi-Robot Path Planning) | NP-hard complexity analysis | ICRA, IROS, RA-L |
| Distributed V2G Optimization | ADMM with dynamic topology | IEEE TSG, CDC |
| Edge AI Predictive Maintenance | TinyML for RUL prediction | IEEE PHM, NeurIPS |
| Stochastic Fleet Logistics | VRPTW-PD extension | Transportation Science |

**MAPF-HET Algorithmic Contributions (5 Proposed):**

The battery swap station presents unique challenges not addressed by existing MAPF research. We propose 5 new algorithms:

| Algorithm | Key Innovation | Target Venue |
|-----------|----------------|--------------|
| HYBRID-CBS | CBS planning + EK-KOR2 potential field execution | ICRA / RA-L |
| MIXED-CBS | 1D rail + 2D mobile workspace handling | IJCAI |
| DEADLINE-CBS | Hard deadline integration via SAT pruning | SoCS |
| STOCHASTIC-ECBS | LogNormal duration-aware focal search | AAMAS |
| FIELD-GUIDED MCTS | Potential fields as MCTS rollout policy | IROS |

**What This Means:**
- Research-grade algorithmic foundations (not just "good enough")
- 5 potential peer-reviewed publications establishing credibility
- First integration of CBS optimality with embedded potential field execution
- Academic talent pipeline for future hiring
- Working MAPF-HET implementation in Go (coordinated robot scheduling)

### How Long to Validate Viability

| Milestone | Timeline | Validates |
|-----------|----------|-----------|
| OSS Launch + Initial Stars | Month 6 | Community interest |
| First External Contribution | Month 8 | Technical soundness |
| Hardware Prototype Working | Month 9 | Design validity |
| Pilot Deployment Live | Month 15 | Commercial viability |

**Full validation: 15 months from funding**

---

## 3. Founders and Team

### Founding Team

| Marija Janjatovic - CEO | Bojan Janjatovic - CTO |
|-------------------------|------------------------|
| Operations & Business Development | Technology & Product |
| Economics bachelor (ECC) | 15 years enterprise software |
| Insurance sector (compliance, ops) | NCR Voyix - distributed systems |
| EU market entry, partnerships | RTOS, power electronics, embedded |
| 100% full-time | 100% full-time |

**Company:** Netherlands BV (Haarlem / Zandvoort)

---

### Bojan Janjatovic - Co-Founder & CTO

**Background:**
- 15 years enterprise software experience
- Large-scale distributed systems specialist
- Real-time logistics optimization (postal sorting)

**Current:** NCR Voyix - Development team, enterprise software

**Previous:** Toshiba projects (via Serbian engineering subcontractor)
- International postal sorting and logistics systems
- Real-time package routing optimization
- High-throughput data processing
- Multi-country deployment experience

**Why This Background Matters:**

| Enterprise Skill | Startup Application |
|------------------|---------------------|
| Large-scale distributed systems | EK-KOR2 distributed coordination |
| Real-time logistics | Power module scheduling |
| Mission-critical reliability | Charging infrastructure uptime |
| International projects | EU market understanding |

**Technical Skills:**
- Languages: C, Rust, Python, JavaScript
- Embedded: STM32, ARM Cortex-M, RTOS development
- Communication: CAN-FD, SPI, I2C, UART
- Power Electronics: LLC, Vienna PFC, digital control (self-taught + projects)

### Long-Term Roles

**Marija (CEO):** Business operations, fundraising, customer relationships. Natural CEO role.

**Bojan (CTO):** Technology leadership, architecture, team building. Long-term technical role.

### Skills and Approach

**First-Principles Engineering:**
- Built EK-KOR2 from scratch, not adapted existing RTOS
- Designed EK3 power stage from component selection to thermal analysis
- Full-stack capability: firmware → protocol → application

**Production-Quality Standards:**
- Enterprise background means reliability mindset
- Comprehensive testing (22 vectors, property-based, cross-validation)
- Documentation-first development

### What Technical Skills to Add

**Immediate Hires (With This Funding):**

| Role | Skills | Purpose |
|------|--------|---------|
| Power Electronics Engineer | SiC, magnetics, thermal | EK3 prototype to production |
| Embedded Rust Lead | Embassy, embedded-hal | EK-KOR2 Rust implementation |
| Community Manager | OSS, developer relations | Ecosystem building |

**Next Phase (Series A):**

| Role | Skills | Purpose |
|------|--------|---------|
| Safety Engineer | IEC 61508, ISO 26262 | ASIL-D certification |
| Hardware Team (2-3) | PCB, manufacturing | Production scaling |
| DevRel / Marketing | Technical marketing | Adoption acceleration |

### Team Members Working on Primary Risks

| Risk | Who's Working On It |
|------|---------------------|
| Scale consensus | Bojan (architecture) + future Rust Lead |
| Hardware certification | Future Power Electronics Engineer |
| Community adoption | Future Community Manager |

### Who Is Missing That Could Address Key Risks

**1. Power Electronics Senior Engineer**
- Need: Take EK3 from design to certified production
- Profile: 10+ years, SiC experience, automotive or industrial power
- Where to find: Infineon/TI/Wolfspeed network, European power electronics community

**2. Safety Certification Specialist**
- Need: Navigate IEC 61508 / ISO 26262 certification
- Profile: Certified functional safety engineer, automotive or industrial background
- Where to find: TÜV network, automotive tier-1 suppliers

### Marija Janjatovic - Co-Founder & CEO

**Background:**
- Economics bachelor (ECC)
- Insurance sector experience (compliance, operations)
- Business development and operations focus

**Role:**
- CEO - business operations, partnerships, fundraising
- EU market entry strategy
- Pilot customer relationships

**Why Two Founders:**
- Technical (CTO) + Business (CEO) balance
- Marija handles operations while Bojan focuses on technology
- Both 100% committed full-time

---

### Advisory Network

| Distributed Systems & Optimization Advisor |
|--------------------------------------------|
| PhD in Computer Science (Western Europe) |
| Specialized: distributed algorithms, mesh networks, optimization |
| 15+ years research (Germany, France) |
| Published: topology control, wireless sensor networks |
| Focus: MAPF-HET, V2G optimization, fleet logistics |
| Publication targets: ICRA, IROS, IEEE TSG |
| Currently: EU defense/telecom sector |
| *Official advisor - identity disclosed under NDA* |

**NOTE:** Distributed Systems advisor officially involved. Identity confidential due to defense sector employment - full credentials disclosed under NDA.

**Sensors & Automotive Advisor (In Discussion)**
- PhD Engineering (France), MSc (Serbia)
- German university researcher
- Expertise: Sensors, signal processing, automotive systems
- Role: ISO 26262 guidance, EU academic network

---

## 4. Risk Reduction Milestones / Financials

### $2.5M Seed - 18-Month Runway

**Allocation:**

| Category | Amount | Purpose |
|----------|--------|---------|
| EK-KOR2 OSS Launch | $300K | Documentation, CI/CD, community infrastructure |
| EK3 Hardware Development | $700K | Prototypes, certification, manufacturing prep |
| Pilot Deployments | $600K | 2-3 EU transit operators |
| Team Expansion | $600K | 5 engineers (see hiring plan) |
| IP Protection | $150K | Hardware patents, international filings |
| Operations + Contingency | $150K | 18-month runway buffer |
| **TOTAL** | **$2.5M** | |

### Burn Rate

| Phase | Monthly Burn | Cumulative | Team Size |
|-------|--------------|------------|-----------|
| Months 1-6 | $100K | $600K | 3 (founder + 2 hires) |
| Months 7-12 | $150K | $1.5M | 5 (add 2 more) |
| Months 13-18 | $165K | $2.5M | 6 (add 1 more) |

### Risk Reduction Milestones

**Milestone 1: OSS Launch (Month 6) - $600K spent**

| Deliverable | Risk Reduced |
|-------------|--------------|
| EK-KOR2 public repository | Community adoption risk |
| 500+ GitHub stars | Market validation |
| Complete documentation | Contributor onboarding |
| Reference hardware spec | Hardware partner interest |

**Status at Milestone 1:** Team of 3, OSS project live, community forming
**If it fails:** Pivot to consulting/licensing with existing codebase

**Milestone 2: Hardware Prototype (Month 12) - $1.5M spent**

| Deliverable | Risk Reduced |
|-------------|--------------|
| Working EK3 module | Technical feasibility |
| Lab-tested at 3.3kW | Design validation |
| CE pre-certification | Regulatory path |
| First pilot partner signed | Commercial validation |

**Status at Milestone 2:** Team of 5, hardware working, pilot committed
**If it fails:** License technology to established hardware manufacturer

**Milestone 3: Pilot Deployment (Month 18) - $2.5M spent**

| Deliverable | Risk Reduced |
|-------------|--------------|
| Live deployment (1-2 sites) | Production readiness |
| 6+ months operational data | Reliability validation |
| Multiple pilots in pipeline | Market traction |
| Series A materials ready | Fundability |

**Status at Milestone 3:** Team of 6, revenue pipeline, Series A ready
**If it fails:** Bootstrap from pilot revenue, slower growth path

### Future Capital Requirements

| Round | Amount | Milestone | Purpose |
|-------|--------|-----------|---------|
| Series A | $8-12M | 2027 | Production scaling, EU expansion |
| Series B | $25-40M | 2028 | Manufacturing, US market entry |

### Contingency Plans

**If OSS adoption is slower than expected:**
- Pivot to enterprise licensing model
- Direct sales to transit operators
- Consulting services for custom deployments

**If hardware certification takes longer:**
- Partner with established manufacturer (MikroElektronika, etc.)
- License design, collect royalties
- Focus on software/platform value

**If fundraising environment deteriorates:**
- Extend runway through consulting revenue
- EU grant applications (InnoEnergy, EIT)
- Strategic partnership with automotive OEM

---

## 5. Market / Competition

### Market Size

**TAM: $100B+ Distributed Energy Infrastructure**

| Segment | Size by 2030 | Growth Rate |
|---------|--------------|-------------|
| EV Charging Infrastructure | $100B | 25% CAGR |
| Grid Storage Systems | $45B | 20% CAGR |
| V2G Systems | $25B | 35% CAGR |
| Microgrid Controllers | $15B | 18% CAGR |

**SAM: $10B Modular EV Charging (EU + Emerging Markets)**

Focus on markets where modular architecture provides clear advantage:
- EU transit electrification (mandatory)
- Emerging markets (infrastructure gaps)
- High-reliability industrial (uptime critical)

**SOM: $500M (Year 5)**

Capture 5% of modular EV charging segment through:
- OSS standard adoption (coordination layer)
- Hardware sales (EK3 certified modules)
- Platform services (fleet management SaaS)

### Competitive Landscape

**Incumbents:**

| Competitor | Approach | Weakness |
|------------|----------|----------|
| ABB | Proprietary, central scheduler | Doesn't scale, vendor lock-in |
| Siemens | Proprietary, enterprise-focused | Expensive, rigid deployment |
| ChargePoint | Cloud-dependent | Single point of failure, latency |
| Tritium | Hardware-focused | No coordination layer strategy |

**Why They Can't Replicate Tomorrow:**

1. **Innovator's Dilemma:** Their business model is proprietary lock-in. Open-sourcing would cannibalize service revenue.

2. **Technical Debt:** Central scheduler architectures can't be easily refactored to distributed coordination.

3. **Organizational Inertia:** Large companies can't move fast enough. Community building requires startup DNA.

4. **Community Ownership:** Once EK-KOR2 has contributors and adopters, it's not ours to close - even if we wanted to.

### Competitor Future Products

**What ABB/Siemens Will Do:**
- Announce "open APIs" that aren't really open
- Form industry consortiums that move slowly
- Acquire smaller players for technology

**Why That Won't Win:**
- APIs aren't standards - real openness is code
- Consortiums are political, not technical
- Acquisitions kill community energy

**What Would Actually Threaten Us:**
- Major cloud provider (Google/AWS) releasing OSS coordination layer
- Chinese manufacturer open-sourcing at scale
- Automotive OEM (Tesla, VW) releasing fleet software

**Our Defense:**
- First-mover on community building
- European-first positioning (regulatory trust)
- Hardware integration creates switching costs

### Why Others Missed This Innovation

1. **Coordination seen as commodity:** Everyone assumes the hard part is power electronics. The coordination layer was an afterthought.

2. **OSS not in DNA:** Incumbent power electronics companies don't think in platform/ecosystem terms.

3. **Wrong abstraction layer:** Most focus on cloud orchestration, not real-time embedded coordination.

4. **Risk tolerance:** Novel scheduling paradigm requires accepting technical risk. Incumbents optimize for known solutions.

### Why We Win

```
STANDARD CREATION MOAT > PATENT MOAT
═══════════════════════════════════════════════════════════════

PATENT MOAT:
- Expires in 20 years
- Can be worked around
- Requires expensive litigation
- Doesn't compound

STANDARD MOAT:
- Gets stronger over time
- Network effects compound
- Community creates switching costs
- First-mover advantage is permanent

Linux became the standard. Nobody cares about alternative kernels.
Kubernetes became the standard. Nobody uses Docker Swarm.
EK-KOR2 will become the standard. Proprietary coordination will die.
```

---

## Summary

**What We're Building:**
The Linux of distributed energy - open-source coordination that becomes the industry standard.

**Why It's a Black Swan Bet:**
High technical risk, low market risk, enormous platform potential.

**Why Khosla:**
- Vinod's Sun heritage (OSS strategy DNA)
- Sven's autonomous systems background (Stanley → Google)
- Portfolio fit (GitLab OSS strategy, Rocket Lab modular architecture)
- Patient capital for standard creation

**The Ask:**
$2.5M seed to launch the open-source foundation and build first certified hardware.

**The Opportunity:**
Own the coordination layer for $100B+ of distributed energy infrastructure.

---

## Contact

**Marija Janjatovic** (CEO) & **Bojan Janjatovic** (CTO)
Co-Founders, Elektrokombinacija

- Email: bojan.janjatovic@gmail.com
- Company: Netherlands BV (Haarlem / Zandvoort)
- R&D: Serbia (EU-adjacent, cost-effective development)
- GitHub: github.com/elektrokombinacija (private - access on request)

**Priority Proof:**
- Bernstein Project: 0c4684af-4751-483f-9335-7592a67230b2
- Priority Date: January 2, 2026
- Git Commit: dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc

---

*Application prepared: January 21, 2026*
*For: Khosla Ventures Seed Fund*
