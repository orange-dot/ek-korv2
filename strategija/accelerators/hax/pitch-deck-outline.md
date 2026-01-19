# EK3 Pitch Deck Outline for HAX

> **Document Purpose**: Structure and content guide for HAX accelerator pitch deck
> **Version**: 1.0
> **Last Updated**: 2026-01-19
> **Target Length**: 10-12 slides

---

## Deck Philosophy

### HAX Priorities (in order)
1. **Problem validation** - Did you discover this through customer conversations?
2. **Technical depth** - Is this hard tech that others can't easily replicate?
3. **Working prototype** - Can you show it working today?
4. **Team capability** - Can this team actually build this?
5. **Market opportunity** - Is this venture-scale?

### Our Narrative Arc
```
Customer Pain → Technical Innovation → Working Demo → Team → Market → Ask
```

---

## Slide-by-Slide Outline

### Slide 1: Title
**Content:**
```
ELEKTROKOMBINACIJA

EK3: Modular EV Charging Infrastructure
for Electric Bus Fleets

HAX Application 2026
```

**Visual:** Logo + abstract modular graphic

**Speaker Notes:**
- "Elektrokombinacija - means 'electric combination' in Serbian"
- "We're building modular EV charging infrastructure for electric buses"
- "Let me start with how we discovered this problem"

---

### Slide 2: The Problem (Customer Story)
**Header:** €1 Million in Hardware. Zero kWh Delivered.

**Content:**
```
A friend told me about a bus fleet operator in Serbia:

• Bought 10 ABB chargers (~€100k each)
• €1M total investment
• Tried to adapt firmware locally - FAILED
• Multiple programming teams tried - ALL FAILED
• Chargers sitting idle for MONTHS

The problem isn't technology.
It's architecture.
```

**Visual:** Photo of idle chargers or simple timeline graphic

**Speaker Notes:**
- "This isn't hypothetical - this is happening right now in Serbia"
- "They successfully cloned the hardware, but the firmware is a black box"
- "When these chargers break, they wait weeks for an ABB technician from Western Europe"
- "This is what €100k monolithic design gets you: vendor lock-in and stranded assets"

---

### Slide 3: What We Learned
**Header:** Why Current Chargers Fail

**Content (2-column comparison):**
```
MONOLITHIC DESIGN              WHAT OPERATORS NEED
─────────────────────          ─────────────────────
Single point of failure    →   Distributed resilience
€100k per unit             →   Affordable at scale
Proprietary firmware       →   Local adaptation
Service truck for repair   →   Zero truck rolls
Vendor lock-in            →   Open architecture
```

**Visual:** Simple comparison table or icons

**Speaker Notes:**
- "We didn't start with a solution - we started with these customer pain points"
- "Every design decision in EK3 traces back to solving one of these problems"
- Transition: "So how do we solve this?"

---

### Slide 4: Our Solution - EK3 Module
**Header:** 3.3 kW Building Block for Any Power Level

**Content:**
```
ONE MODULE. ANY APPLICATION.

┌─────────────┐
│    EK3      │  • 3.3 kW per module
│   Module    │  • 200 × 320 × 44 mm (1U half-width)
│             │  • Hot-swappable
│   3.3 kW    │  • Same code from e-bike to MCS truck
└─────────────┘

E-bike      Home        DC Fast     Bus Depot   Highway     MCS Truck
  1           7           46          152         303         909
 3 kW       23 kW       152 kW      502 kW      1 MW        3 MW

All using the SAME module.
```

**Visual:** Module render + scaling diagram

**Speaker Notes:**
- "One 3.3 kW module covers every use case from e-bike charging to 3 MW MCS truck charging"
- "Why 3.3 kW? It's the sweet spot for mass production and reliability"
- "If one module fails in a 1 MW system, you lose 0.3% capacity - not 20% like competitors"

---

### Slide 5: Key Innovation - ROJ Swarm Intelligence
**Header:** No Central Controller. No Single Point of Failure.

**Content:**
```
ROJ (Serbian: "swarm")

Traditional:                    EK3:
┌─────────┐                    ┌───┬───┬───┐
│ Central │                    │ M │ M │ M │
│Controller│                    ├───┼───┼───┤
└────┬────┘                    │ M │ M │ M │
     │                         ├───┼───┼───┤
  ┌──┴──┐                      │ M │ M │ M │
  │ │ │ │                      └───┴───┴───┘
  M M M M
                               Each module = autonomous
Controller dies = ALL DOWN     Module dies = 0.3% capacity loss
```

**Visual:** Side-by-side architecture diagrams

**Speaker Notes:**
- "ROJ means 'swarm' in Serbian - like bees, each module is autonomous"
- "Traditional chargers have one central controller - when it fails, everything stops"
- "In EK3, every module has intelligence. They coordinate through consensus algorithms"
- "Kill any module and the mesh reforms in under 100 milliseconds"

---

### Slide 6: Live Demo
**Header:** Working Prototype - Running Right Now

**Content:**
```
DEMONSTRATION (90 seconds)

1. DISCOVERY - 7 modules find each other
2. CONSENSUS - Distributed voting works
3. FAILURE   - Kill module 4
4. RECOVERY  - Mesh reforms automatically

Same code runs on:
• STM32G474 (Cortex-M4F)
• EFR32MG24 (Cortex-M33)
• Raspberry Pi 3 (Cortex-A53)

This is real firmware, not a simulation.
```

**Visual:** Terminal screenshot or embedded video

**Speaker Notes:**
- "Let me show you this working" [run demo or play video]
- "Watch the neighbor counts increase as modules discover each other"
- "Now I'll kill module 4... see how the mesh reforms?"
- "This exact code will run on the physical hardware"

---

### Slide 7: Second Innovation - Fleet Logistics
**Header:** Zero Dedicated Service Vehicles

**Content:**
```
BUSES ARE THE LOGISTICS NETWORK

Swap Station          Bus Route           Depot
    ┌───┐               🚌                ┌───┐
    │BAD│  ──────────────────────────────>│FIX│
    │   │ module      (free transport)    │   │
    └───┘                                 └───┘
                                            │
    ┌───┐               🚌                  │
    │   │<──────────────────────────────────┘
    │NEW│ module      (free transport)
    └───┘

RESULT:
• €0 transport cost (vs €200-500 per truck roll)
• <24 hour repair turnaround
• O(1) scaling - no dedicated fleet needed
```

**Visual:** Diagram of bus route with module flow

**Speaker Notes:**
- "Buses already pass through charging stations multiple times daily"
- "Our robot swaps defective modules during battery exchange"
- "The bus carries the module to the depot for free"
- "Depot technicians repair overnight, fresh module returns next morning"
- "This is a logistics innovation, not just hardware"

---

### Slide 8: Team
**Header:** Hardware + Software + Operations

**Content:**
```
FOUNDER & CTO                    CO-FOUNDER
Hardware & Firmware              Infrastructure
─────────────────────            ─────────────────────
• 22 years combined experience   • Microsoft - Software Engineer (5 yrs)
• 7 years electronics repair     • AT&T - Infrastructure (17 yrs)
• NCR - IoT systems (5 yrs)      • First responders network
• Component-level debugging      • Location: Towaco, NJ
                                   (30 min from HAX Newark)

CO-FOUNDER
Operations & Business
─────────────────────
• Economics background
• Operations, finance, BD
• Part-time → full-time with traction
```

**Visual:** Team photos + key credentials

**Speaker Notes:**
- "I bring 22 years of hardware and software experience"
- "My co-founder is at Microsoft, previously 17 years at AT&T building critical infrastructure"
- "He's already in New Jersey - 30 minutes from HAX"
- "Third co-founder handles operations and finance"

---

### Slide 9: IP Position
**Header:** Protected Innovation

**Content:**
```
PATENT FAMILY (3 applications planned)

A: Modular Architecture (Umbrella)
   • Extreme modularity
   • Distributed intelligence
   • Circular design

B: Robotic Swap System
   • Coordinated dual-robot
   • In-slot module exchange
   • Zero downtime servicing

C: Fleet Logistics
   • Bus-based transport
   • Distributed sparing
   • Predictive maintenance

Priority Date: January 2, 2026
5 Invention Disclosures documented
```

**Visual:** Simple patent family diagram

**Speaker Notes:**
- "We have 5 invention disclosures documented"
- "Priority date is January 2, 2026 - we moved fast"
- "The patent family covers hardware, robotics, and the logistics method"
- "This isn't just a product - it's a defensible system"

---

### Slide 10: Market Opportunity
**Header:** Electric Bus Fleets Need Charging

**Content:**
```
ELECTRIC BUS MARKET

Global electric bus market: $XX billion by 2030
Charging infrastructure: 15-20% of TCO

TARGET SEGMENTS:

1. Bus Depots (pilot market)
   • 50-500 kW per depot
   • Overnight charging
   • Predictable operations

2. Opportunity Charging
   • End-of-route fast charge
   • 150-300 kW
   • Requires high uptime

3. MCS Trucks (future)
   • Megawatt charging (up to 3 MW)
   • Same module architecture scales

BEACHHEAD: Serbia/Balkans + EXPO 2027 Belgrade
```

**Visual:** Market size graphic + map

**Speaker Notes:**
- "Electric bus adoption is accelerating globally"
- "Charging infrastructure is 15-20% of total cost of ownership"
- "We're starting in Serbia where we have connections and understanding"
- "EXPO 2027 in Belgrade creates a near-term deployment opportunity"

---

### Slide 11: Business Model
**Header:** Hardware + Services

**Content:**
```
REVENUE STREAMS

1. MODULE SALES
   • €150/module at scale (10K+ volume)
   • 35% lower than competitors
   • Gross margin: 40-50%

2. SERVICE CONTRACTS
   • Remote monitoring
   • Predictive maintenance
   • Module refurbishment

3. LICENSING (future)
   • ROJ coordination protocol
   • Fleet logistics method
   • Certified integrators

UNIT ECONOMICS AT SCALE:
100-module station (330 kW):
• Module revenue: €15,000
• Installation: €5,000
• Annual service: €2,000/year
```

**Visual:** Revenue waterfall or unit economics diagram

**Speaker Notes:**
- "Hardware is the beachhead, but services drive recurring revenue"
- "Module refurbishment creates a circular business model"
- "We're targeting 35% lower cost than ABB/Siemens at scale"

---

### Slide 12: The Ask
**Header:** HAX Partnership

**Content:**
```
WHY HAX

• Manufacturing expertise (Shenzhen)
• Hardware engineering support
• 6-18 month timeline fits our roadmap
• Follow-on capital ($4-5M through Series C)
• Newark location works for our team

WHAT WE'LL ACCOMPLISH

Month 1-4:  First physical prototype (M2, M3)
Month 4-8:  7-module cluster validation (M4, M5)
Month 8-12: Customer pilot in Serbia (M6)
Month 12+:  Production prep (M8, M9)

LET'S BUILD THIS TOGETHER
```

**Visual:** Timeline + HAX logo

**Speaker Notes:**
- "HAX is the ideal partner for hardware like this"
- "Your manufacturing connections and engineering support accelerate everything"
- "We have the software and architecture proven - we need help getting to production"
- "Our co-founder is already in New Jersey, ready to start"

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
```

### A2: Competitive Landscape
```
           Modularity    Open      Fleet      Price
                        Arch     Logistics
ABB          Medium      No        No        High
Siemens      Medium      No        No        High
ChargePoint  Low         No        No        Medium
EK3          Extreme    Yes       Yes        35% lower
```

### A3: Circularity
```
Module Lifecycle:
Factory → Station → Operate (5+ yrs) → Degrade → Bus to Depot →
Repair → Refurb → Re-deploy

• Repair cost: 40% of new
• Refurb cycles: 3-5 times
• Effective life: 15-25 years
• Zero e-waste
```

### A4: EXPO 2027 Opportunity
```
Belgrade EXPO 2027
• Public transport modernization
• Electric bus fleet expansion
• €XX million infrastructure investment
• International visibility
• Near-term deployment opportunity
```

---

## Design Guidelines

### Color Palette
- Primary: Electric blue (#0066CC)
- Secondary: Clean white (#FFFFFF)
- Accent: Energy green (#00CC66)
- Text: Dark gray (#333333)

### Typography
- Headlines: Bold sans-serif (e.g., Inter, Helvetica)
- Body: Clean sans-serif
- Code/technical: Monospace (e.g., JetBrains Mono)

### Visual Style
- Clean, minimal
- Engineering aesthetic (not corporate)
- Real photos where possible
- Terminal screenshots for demo
- Simple diagrams (no 3D renders unless real)

### Do's
- Show working things
- Use real numbers
- Quote customers
- Be specific about tech

### Don'ts
- Jargon without explanation
- Vaporware renders
- Overpromise timelines
- Generic market slides

---

## Presentation Tips for HAX

### They're Looking For
1. Technical founder who can build
2. Problem discovered through real customer pain
3. Hardware that's actually hard
4. Team with relevant experience
5. Clear path to manufacturing

### Common Objections (prepare answers)

**"Can't incumbents just copy this?"**
> "The architecture is the innovation, not any single component. Patents protect key methods. And we have 18-month head start on the integration."

**"Why not just improve existing chargers?"**
> "Monolithic architecture is the root cause. You can't retrofit distributed intelligence. This requires a clean-sheet design."

**"Solo founder concern?"**
> "Three co-founders. Co-founder is in NJ and can be at HAX day one. Third co-founder handles operations."

**"Market seems small?"**
> "Bus fleets are beachhead. Same module scales to MCS trucks (3 MW). Total addressable is much larger."

**"What about certifications?"**
> "IEC 61851, CE, UL are understood. We'll work with certification consultants during HAX. This is execution, not invention."

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-19 | Initial outline for HAX application |
