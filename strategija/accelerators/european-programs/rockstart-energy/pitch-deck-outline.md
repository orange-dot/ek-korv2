# EK3 Pitch Deck Outline for Rockstart Energy

> **Document Purpose**: Structure and content guide for Rockstart Energy accelerator pitch deck
> **Focus**: European market, energy transition, transport electrification
> **Version**: 1.0
> **Last Updated**: 2026-01-19
> **Target Length**: 12-15 slides

---

## Deck Philosophy

### Rockstart Energy Priorities
1. **Energy transition impact** - How do you advance decarbonization?
2. **The 4 D's alignment** - Decentralization, Decarbonization, Digitalization, Transport
3. **European scalability** - Can you grow across EU markets?
4. **Team capability** - Can you execute in the energy sector?
5. **Digital component** - Is there software/connectivity?

### Our Narrative Arc (EU-Focused)
```
EU Energy Challenge → Customer Pain → Technical Innovation → Demo → Team → EU Market → Ask
```

---

## Slide-by-Slide Outline

### Slide 1: Title
**Content:**
```
ELEKTROKOMBINACIJA

EK3: Modular EV Charging for
European Bus Fleet Electrification

Rockstart Energy 2026
```

**Visual:** Logo + EU map with transport icons

**Speaker Notes:**
- "Elektrokombinacija - Serbian for 'electric combination'"
- "We're building modular charging infrastructure for Europe's electrifying bus fleets"
- "Serbia-based team, European vision"

---

### Slide 2: The EU Challenge
**Header:** Europe's Transport Electrification Gap

**Content:**
```
2030 EU MANDATES:
• All new urban buses must be zero-emission
• 3.5M+ public chargers needed (vs 500K today)
• €280 billion infrastructure investment required

THE PROBLEM:
• Current chargers: monolithic, expensive, vendor-locked
• Grid constraints limit deployment speed
• Maintenance requires specialized technicians

Europe needs charging infrastructure that scales.
```

**Visual:** EU map with electrification targets by country

**Speaker Notes:**
- "The EU has committed to zero-emission urban buses by 2030"
- "But current infrastructure can't scale fast enough"
- "We discovered this problem firsthand..."

---

### Slide 3: Customer Story
**Header:** €1 Million in Hardware. Zero kWh Delivered.

**Content:**
```
Serbian bus fleet operator:

• Invested €1M in 10 ABB chargers
• Hardware works - electronics cloned successfully
• Firmware is proprietary black box
• Multiple teams tried to adapt - ALL FAILED
• Chargers sitting idle for MONTHS

Western Balkans shows what emerging EU markets face:
• High cost barrier
• No local service capability
• Vendor lock-in

This will happen across Europe as fleets scale.
```

**Visual:** Simple illustration of idle chargers

**Speaker Notes:**
- "This is a real situation happening now in Serbia"
- "The operator has the technical capability - they cloned the hardware"
- "But proprietary firmware means they're stuck"
- "As Europe scales electrification, this problem multiplies"

---

### Slide 4: What We Learned
**Header:** The Architecture is the Problem

**Content (2-column comparison):**
```
CURRENT APPROACH              WHAT EUROPE NEEDS
─────────────────────         ─────────────────────
Monolithic 50-150kW units  →  Modular, scalable
Single point of failure    →  Distributed resilience
€100k+ per charger         →  Affordable at scale
Proprietary firmware       →  Open, adaptable
Service truck per repair   →  Zero truck rolls
Grid stress at deployment  →  Flexible, V2G capable
```

**Visual:** Comparison diagram

**Speaker Notes:**
- "The problem isn't components - it's architecture"
- "Monolithic design creates these problems"
- "We designed from scratch to solve each one"

---

### Slide 5: Our Solution - EK3 Module
**Header:** 3.3 kW Building Block for Any Power Level

**Content:**
```
ONE MODULE. ANY APPLICATION.

┌─────────────┐
│    EK3      │  • 3.3 kW per module
│   Module    │  • 200 × 320 × 44 mm
│             │  • Hot-swappable
│   3.3 kW    │  • V2G capable
└─────────────┘

City Bus    Articulated    Depot        MCS Truck
 Depot        Bus         Night         (Future)
   46         152          303           909
  152 kW     502 kW       1 MW          3 MW

Same module. Same firmware. Any power level.
```

**Visual:** Module render + scaling diagram with EU use cases

**Speaker Notes:**
- "One 3.3 kW module - the fundamental building block"
- "152 modules for a bus depot, 909 for MCS truck charging"
- "Why 3.3 kW? Perfect balance of granularity and practicality"
- "If one module fails, you lose 0.3% capacity - not 20%"

---

### Slide 6: Key Innovation - ROJ Swarm Intelligence
**Header:** Decentralized by Design

**Content:**
```
ROJ (Serbian: "swarm")

TRADITIONAL:                    EK3:
┌─────────┐                    ┌───┬───┬───┐
│ Central │                    │ M │ M │ M │  Each module
│Controller│                    ├───┼───┼───┤  is autonomous
└────┬────┘                    │ M │ M │ M │
     │                         ├───┼───┼───┤  Peer-to-peer
  ┌──┴──┐                      │ M │ M │ M │  coordination
  M M M M                      └───┴───┴───┘

• CAN-FD mesh (5 Mbps)
• Raft consensus (<100ms failover)
• No single point of failure
• Self-healing network
```

**Visual:** Architecture comparison

**Speaker Notes:**
- "ROJ - Serbian for 'swarm', like bees"
- "Every module has intelligence, they coordinate through consensus"
- "This is TRUE decentralization - aligned with Rockstart's 4 D's"
- "Kill any module, mesh reforms in under 100 milliseconds"

---

### Slide 7: Live Demo
**Header:** Working Prototype - Distributed System Running

**Content:**
```
DEMONSTRATION (90 seconds)

1. DISCOVERY - Modules find each other
2. CONSENSUS - Distributed voting
3. FAILURE   - Kill a module
4. RECOVERY  - Automatic mesh reformation

Running on:
• STM32G474 (Cortex-M4F)
• Raspberry Pi 3 cluster
• Docker/Renode emulation

Same firmware → same behavior → production ready
```

**Visual:** Terminal screenshot or video

**Speaker Notes:**
- [Run demo or play video]
- "Watch the neighbor counts as modules discover each other"
- "Now I'll kill a module... see the automatic recovery?"
- "This is real distributed systems engineering"

---

### Slide 8: Digitalization - V2G & Smart Charging
**Header:** Every Module is Grid-Interactive

**Content:**
```
VEHICLE-TO-GRID CAPABILITY

Bus Battery ←→ EK3 Modules ←→ Grid

USE CASES:
• Peak shaving for depot operators
• Frequency regulation services
• Emergency backup power
• Renewable integration

REVENUE POTENTIAL:
• Grid services: €50-200/bus/month
• Peak avoidance: 20-30% energy cost reduction
• New revenue stream for transit agencies

Modules coordinate autonomously for grid response.
```

**Visual:** V2G flow diagram with revenue numbers

**Speaker Notes:**
- "Every EK3 module is bidirectional - V2G ready"
- "Bus fleets become grid assets, not just loads"
- "This creates new revenue for transit agencies"
- "Autonomous coordination - no central management needed"

---

### Slide 9: Fleet Logistics Innovation
**Header:** Zero Dedicated Service Vehicles

**Content:**
```
BUSES ARE THE LOGISTICS NETWORK

Charging Station         Bus Route           Depot
    ┌───┐                  🚌                ┌───┐
    │BAD│  ─────────────────────────────────>│FIX│
    │   │ module        (free transport)     │   │
    └───┘                                    └───┘
                                               │
    ┌───┐                  🚌                  │
    │   │<─────────────────────────────────────┘
    │NEW│ module        (free transport)
    └───┘

RESULT:
• €0 transport cost (vs €200-500/truck roll)
• <24 hour turnaround
• Scales O(1) - no logistics fleet needed
```

**Visual:** Bus route diagram with module flow

**Speaker Notes:**
- "Buses already pass through charging stations multiple times daily"
- "Defective modules ride to the depot for free"
- "This is operations innovation, not just hardware"
- "Critical for scaling across European networks"

---

### Slide 10: Circular Design
**Header:** 15-25 Year Module Lifecycle

**Content:**
```
SUSTAINABILITY BY DESIGN

Factory → Deploy → Operate (5+ yrs) → Degrade detected
                                            ↓
Re-deploy ← Refurbish ← Repair ← Bus to Depot

ECONOMICS:
• New module: €150 (at scale)
• Refurbishment: €60 (40% of new)
• Refurb cycles: 3-5 times
• Effective life: 15-25 years

IMPACT:
• Zero e-waste design
• Reduced rare earth demand
• Local repair capability
• Circular economy model
```

**Visual:** Circular lifecycle diagram

**Speaker Notes:**
- "Designed for repair from day one"
- "Through-hole capacitors, accessible components"
- "This aligns with EU circular economy goals"
- "Each module has 3-5 lives before end of service"

---

### Slide 11: Team
**Header:** Hardware + Business, Serbia-Based

**Content:**
```
CEO                              CTO
Operations & Business            Hardware & Technology
─────────────────────            ─────────────────────
• Economics background           • 22 years combined experience
• Insurance industry             • 7 years electronics repair
  (compliance, contracts)        • NCR - IoT systems (5 yrs)
• 100% full-time                 • Component-level debugging
                                 • 100% full-time

SERBIA BASE ADVANTAGES:
• Cost-effective R&D
• EU candidate country
• Technical talent pool
• Gateway to Western Balkans

ADVISORY:
• US-based infrastructure advisor (Microsoft/AT&T)
```

**Visual:** Team photos + Serbia map showing EU proximity

**Speaker Notes:**
- "CEO handles business, CTO handles technology - classic split"
- "Serbia is an EU candidate country with strong engineering talent"
- "Cost-effective base with EU market access"
- "Both founders 100% committed"

---

### Slide 12: European Market Strategy
**Header:** Balkans Beachhead → EU Expansion

**Content:**
```
PHASE 1: Western Balkans (2026-2027)
• Serbia: EXPO 2027 Belgrade pilot
• Belgrade GSP (public transit)
• Regional operators

PHASE 2: EU Entry (2027-2028)
• Netherlands (Rockstart base)
• Germany (largest market)
• CE certification complete

PHASE 3: EU Scale (2028-2030)
• France, Italy, Spain
• Nordic markets (Copenhagen office)
• MCS truck charging corridor

MARKET SIZE (Bus Charging):
• EU total: €XX billion by 2030
• Target: 1% = €XX million
```

**Visual:** EU map with expansion arrows

**Speaker Notes:**
- "Start where we have connections - Serbia, EXPO 2027"
- "Use Rockstart to enter EU via Netherlands"
- "2030 mandates create urgency across Europe"
- "Same module architecture scales to MCS trucks"

---

### Slide 13: Competitive Position
**Header:** Only Solution With All Four Innovations

**Content:**
```
                 Extreme   Distributed   Fleet      Circular
                 Modular   Intelligence  Logistics  Design
─────────────────────────────────────────────────────────────
ABB              ⚪         ❌            ❌         ⚪
Siemens          ⚪         ❌            ❌         ⚪
Heliox           ⚪         ❌            ❌         ⚪
Kempower         ✅         ⚪            ❌         ⚪
Ekoenergetyka    ⚪         ❌            ❌         ⚪
─────────────────────────────────────────────────────────────
EK3              ✅         ✅            ✅         ✅

IP PROTECTION:
• 5 invention disclosures
• Patent family planned (3 applications)
• Priority date: January 2, 2026
```

**Visual:** Competitive matrix

**Speaker Notes:**
- "No competitor has all four innovations"
- "Kempower is modular but not distributed"
- "Our architecture is fundamentally different"
- "Patent-pending with priority date secured"

---

### Slide 14: The Ask
**Header:** Rockstart Partnership

**Content:**
```
WHY ROCKSTART ENERGY

• Transport Electrification focus - perfect alignment
• EU network access - transit agencies, utilities
• 150-180 day timeline - matches our roadmap
• Co-investment model - path to Series A
• Amsterdam base - EU market entry

WHAT WE'LL ACCOMPLISH

Month 1-2:  EU customer discovery
Month 3-4:  First prototype iteration
Month 4-5:  Certification roadmap
Month 6:    Demo Day + pilot planning

FUNDING USE:
• 60% Product development
• 25% EU market development
• 15% CE certification preparation
```

**Visual:** Timeline + Rockstart logo

**Speaker Notes:**
- "Rockstart's 4 D's map directly to our innovations"
- "We need EU market access and investor network"
- "150-180 days gets us to pilot-ready"
- "Amsterdam is the ideal EU base"

---

### Slide 15: Contact
**Content:**
```
ELEKTROKOMBINACIJA

EK3: Modular EV Charging Infrastructure

[Contact details]
[LinkedIn profiles]
[Website/demo link]

Ready to electrify Europe's bus fleets.
```

**Visual:** Logo + contact info

---

## Appendix Slides (backup)

### A1: Technical Specifications
```
EK3 Module Specs
• 3.3 kW rated power
• 200-920 VDC output
• LLC resonant topology
• 900V SiC MOSFETs (Wolfspeed)
• STM32G474 MCU
• CAN-FD @ 5 Mbps
• >95% efficiency
• <3.5 kg weight
• IEC 61851 compatible
```

### A2: EU Regulatory Alignment
```
STANDARDS:
• IEC 61851 - EV charging
• ISO 15118 - V2G communication
• EN 50549 - Grid connection
• CE marking pathway

FUNDING ALIGNMENT:
• AFIR requirements
• CEF Transport eligibility
• Horizon Europe compatibility
```

### A3: Financial Projections
```
UNIT ECONOMICS AT SCALE:

100-module station (330 kW):
• Module cost: €150 × 100 = €15,000
• Installation: €5,000
• Total: €20,000
• Competitor equivalent: €30,000+
• Savings: 35%

Annual service revenue: €2,000/station
Refurbishment margin: 60%
```

### A4: EXPO 2027 Belgrade
```
SERBIA EXPO 2027
• First EXPO in Western Balkans
• Theme: Play for Humanity
• Expected: 4+ million visitors
• Transport modernization included
• Electric bus fleet expansion
• International visibility

EK3 OPPORTUNITY:
• Pilot with GSP Belgrade
• Showcase to EU visitors
• Proof of concept before EU expansion
```

---

## Design Guidelines

### Color Palette (EU-focused)
- Primary: Energy blue (#0066CC)
- Secondary: Clean white (#FFFFFF)
- Accent: EU green (#00AA55)
- Text: Professional gray (#333333)

### Visual Style
- Clean, professional
- European aesthetic
- Real data, real photos
- Simple diagrams
- No corporate jargon

### Key Differences from HAX Deck
1. **Lead with EU challenge** (not customer story first)
2. **Emphasize 4 D's alignment** (Rockstart framework)
3. **V2G as core feature** (grid services revenue)
4. **European expansion map** (not US focus)
5. **Circular economy emphasis** (EU sustainability)

---

## Presentation Tips for Rockstart

### They're Looking For
1. Energy transition impact
2. Digital/software component
3. European scalability
4. Strong founding team
5. Clear go-to-market

### Common Questions (prepare answers)

**"How does this align with the 4 D's?"**
> "Decentralization: ROJ swarm intelligence - no central controller. Decarbonization: Enables bus fleet electrification. Digitalization: V2G, smart charging, predictive maintenance. Transport: This IS transport electrification."

**"What's your European go-to-market?"**
> "Start in Serbia where we have connections. EXPO 2027 provides visibility. Use Rockstart for EU entry via Netherlands. Scale to Germany, France by 2028."

**"How do you compete with established players?"**
> "We don't compete head-to-head - we're architecturally different. Extreme modularity + distributed intelligence creates a category. No incumbent can retrofit this into existing products."

**"V2G regulatory challenges?"**
> "EU is leading on V2G regulation. EN 50549 provides framework. Netherlands, Germany, UK have active V2G markets. Our modular approach makes compliance easier."

**"Why Serbia as a base?"**
> "EU candidate country with strong engineering talent. Cost-effective R&D. Direct experience with emerging market challenges. Gateway to Western Balkans - 20 million people electrifying transport."

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-19 | Initial outline for Rockstart Energy application |
