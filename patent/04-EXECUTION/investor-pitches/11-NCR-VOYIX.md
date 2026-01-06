# NCR Voyix - Internal Technical Proposal

## Context

```
NCR VOYIX
═══════════════════════════════════════════════════════════════
Type:       Enterprise technology (payments, retail, banking)
Relevance:  Hardware manufacturing, IoT, payment systems
Employment: 5 years, current employer
Approach:   Internal discussion, neutral, technical
═══════════════════════════════════════════════════════════════
```

This is a personal proposal from an employee exploring potential
corporate venture interest or strategic partnership.

---

## What I'm Building

A modular EV charging system for electric bus fleets.

### Core Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  EK3 MODULE - 3.3kW Power Conversion Unit                   │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Dimensions: 200 × 320 × 44mm (1U half-width)               │
│  Weight: 3.5 kg                                             │
│  Input: 3-phase 400VAC                                      │
│  Output: 200-920VDC                                         │
│  Efficiency: 97%+                                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PFC Stage │ LLC DC-DC │ Control │ CAN-FD Interface │   │
│  │ (Vienna)  │ (SiC)     │ (STM32) │ (5 Mbps)         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Model

| Configuration | Modules | Power   | Use Case       |
|---------------|---------|---------|----------------|
| 1 module      | 1       | 3.3 kW  | E-bike, test   |
| Rack (7U)     | 7       | 23 kW   | Light vehicle  |
| Cabinet       | 46      | 152 kW  | DC fast charge |
| Depot station | 152     | 502 kW  | Bus depot      |
| Full rack     | 303     | 1 MW    | High power     |
| MCS           | 909     | 3 MW    | Megawatt       |

Same module, different quantity. Manufacturing simplification.

---

## Technical Specifications

### Power Electronics

```
SEMICONDUCTORS
─────────────────────────────────────────────
Main switches:     Wolfspeed C3M0021120K (SiC MOSFET, 1200V/60A)
PFC stage:         Vienna rectifier topology
DC-DC stage:       LLC resonant converter
Gate drivers:      Silicon Labs Si8271 (isolated)
Current sensing:   LEM HLSR 50-P (Hall effect)

CONTROL SYSTEM
─────────────────────────────────────────────
MCU:               STM32G474 (Cortex-M4F, 170MHz)
Communication:     CAN-FD @ 5 Mbps
Protocol:          Custom ROJ coordination + OCPP 2.0.1
Safety:            IEC 61851, ISO 15118 compliance target

THERMAL
─────────────────────────────────────────────
Cooling:           Forced air, 2× 60mm fans
Max ambient:       50°C
Derating:          Linear above 45°C
```

### Mechanical Design

```
MODULE FORM FACTOR
─────────────────────────────────────────────
Standard:          1U height × half-width (19" rack compatible)
Mounting:          Front-loading, blind-mate connectors
Hot-swap:          Yes, during operation
MTTR target:       < 60 seconds (robotic), < 5 min (manual)

CONNECTOR INTERFACE
─────────────────────────────────────────────
Power input:       Anderson SBS75 (75A rating)
Power output:      Anderson SB175 (175A rating)
Data:              M12 circular (CAN-FD + aux)
Cooling:           Integrated air path, no external ducting
```

---

## The Problem Being Solved

Electric bus operators report 15-30% charger downtime.

### Current State (Industry-Wide)

```
FAILURE SCENARIO - TRADITIONAL CHARGER
──────────────────────────────────────────────────────────────

Day 0:  Charger fails (power supply, contactor, control board)
Day 1:  Operator notices buses didn't charge overnight
Day 2:  Service call scheduled
Day 3:  Technician arrives, diagnoses fault
Day 5:  Parts ordered
Day 8:  Parts arrive, technician returns
Day 9:  Charger operational

→ 9 days downtime
→ Affected buses run diesel backup or skip routes
→ Operator loses confidence in electric fleet
```

### Proposed State

```
FAILURE SCENARIO - MODULAR ARCHITECTURE
──────────────────────────────────────────────────────────────

00:00:00  Module fails (any single module)
00:00:00  System detects via heartbeat timeout
00:00:00  Remaining modules continue at reduced power
00:00:40  Robot swaps failed module for spare
00:00:40  Full power restored

→ 40 seconds intervention time
→ Zero service disruption
→ Failed module queued for batch maintenance
```

---

## Why Modular

### Engineering Rationale

1. **Fault Isolation**
   - Single module failure = 3.3kW loss, not 150kW loss
   - Graceful degradation, not catastrophic failure

2. **Manufacturing Scale**
   - One SKU for all power levels
   - Higher volume = lower unit cost
   - Standard components, simpler supply chain

3. **Field Serviceability**
   - No specialized tools required
   - Module is the LRU (Line Replaceable Unit)
   - Diagnosis at module level, not component level

4. **Technology Refresh**
   - Replace individual modules as technology improves
   - No forklift upgrades of entire systems

### Comparison to NCR Hardware Strategy

Similar to how NCR approaches POS terminals and ATMs:
- Modular components for field service
- Standard interfaces between subsystems
- Diagnosis and swap, not in-field repair

---

## Robotic Maintenance System

### Concept

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    CHARGER RACK              ROBOT             SPARE RACK   │
│    ┌───────────┐              │               ┌───────────┐ │
│    │ │ │ │X│ │ │←────────────┼──────────────→│ │ │ │ │ │ │ │
│    │ │ │ │ │ │ │              │               │ │ │ │ │ │ │ │
│    │ │ │ │ │ │ │              │               │ │ │ │ │ │ │ │
│    └───────────┘              │               └───────────┘ │
│                          ┌────┴────┐                        │
│                          │ ROBOT   │                        │
│                          │ 6-axis  │                        │
│                          └─────────┘                        │
│                                                             │
│    SEQUENCE:                                                │
│    1. Detect failed module (X)                              │
│    2. Robot extracts failed module                          │
│    3. Robot inserts spare module                            │
│    4. Failed module to repair queue                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Robot Specification (Target)

```
Type:           Industrial 6-axis (e.g., UR10e class)
Payload:        10 kg (module = 3.5 kg)
Reach:          1.3m
Precision:      ±0.1mm repeatability
Environment:    IP54 minimum, outdoor depot
```

---

## Patent Position

5 invention disclosures prepared. WIPO PROOF timestamp pending.
Priority date: 2026-01-02 (Git commit history as backup).

### Disclosure Summary

| # | Title | Core Claim |
|---|-------|------------|
| A | Modular Architecture | Hot-swap power modules, any kW to MW |
| B | Robotic Swap Station | Automated module replacement |
| C | Fleet Logistics | Buses transport spare modules |
| D | Distributed Sparing | Depot-wide spare optimization |
| E | Dual Robot Coordination | Two robots, no collision |

### IP Strategy

- Self-file provisional patents (cost control)
- PCT application within 12 months
- EU/US national phase based on traction

---

## Market Context

### EU Electric Bus Mandate

- 100% zero-emission city buses by 2035 (Clean Vehicles Directive)
- Belgrade: 100 electric buses ordered (EBRD funded)
- Across EU: ~100,000 buses to be replaced

### Charging Infrastructure Gap

- Bus depots need 1-10 MW of charging capacity
- Current charger reliability insufficient for fleet operations
- Operators cite infrastructure as #1 barrier to electrification

### EXPO 2027 Belgrade

- Serbia hosting World Expo
- Major transit infrastructure investment
- Electric bus showcase planned

---

## Potential NCR Voyix Relevance

Presenting these as observations, not assumptions.

### 1. Payment Integration

```
EV charging requires payment processing.
- Fleet: Back-office integration, subscription models
- Public: Retail payments, per-kWh billing
- V2G: Complex bidirectional settlement

NCR has payment infrastructure and expertise.
Charging stations need payment terminals.
```

### 2. Hardware Manufacturing

```
NCR manufactures industrial hardware at scale:
- ATMs (harsh environment, high reliability)
- POS terminals (modular, field-serviceable)
- Self-checkout systems (robotic elements)

EK3 module is industrial electronics:
- Power electronics in ruggedized enclosure
- Similar manufacturing processes
- Similar supply chain (power supplies, enclosures, PCBs)
```

### 3. IoT and Connectivity

```
NCR manages distributed device networks:
- ATM networks (remote monitoring, diagnostics)
- POS fleet management
- Secure device communication

Charging infrastructure needs:
- Remote monitoring
- Predictive maintenance
- Secure communications
```

### 4. Enterprise Sales

```
NCR sells to enterprises:
- Banks, retailers, restaurants

Charging infrastructure customers:
- Transit authorities
- Fleet operators
- Utilities

Similar B2B enterprise sales motion.
```

### 5. IoT Device Management (Direct Parallel)

```
MY CURRENT WORK AT NCR VOYIX
─────────────────────────────────────────────────────────────
• Walmart IoT systems
• Edge agents on POS terminals
• Device fleet management at scale
• Remote monitoring and diagnostics
• Software deployment to distributed devices

EV CHARGING SOFTWARE NEEDS (SAME PATTERNS)
─────────────────────────────────────────────────────────────
• Edge agents on charger controllers
• Charger fleet management at scale
• Remote monitoring and diagnostics
• OTA firmware updates
• Health telemetry and alerting
```

The software architecture is nearly identical:

```
NCR POS IoT                         EV Charging
─────────────────────────────────────────────────────────────
┌─────────────┐                     ┌─────────────┐
│ POS Terminal│                     │ EK3 Module  │
│ (edge agent)│                     │ (edge agent)│
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       ▼                                   ▼
┌─────────────┐                     ┌─────────────┐
│ Store       │                     │ Charger     │
│ Controller  │                     │ Controller  │
└──────┬──────┘                     └──────┬──────┘
       │                                   │
       ▼                                   ▼
┌─────────────┐                     ┌─────────────┐
│ Cloud       │                     │ OCPP        │
│ Backend     │                     │ Backend     │
└─────────────┘                     └─────────────┘

SAME DISCIPLINES:
• Device provisioning
• Secure communication (TLS, certificates)
• Heartbeat / health monitoring
• Remote configuration
• Logging and diagnostics
• Fleet-wide analytics
• Multi-tenant architecture
```

### Software-Only Opportunity

```
WHAT NCR VOYIX COULD OWN (no hardware required)
─────────────────────────────────────────────────────────────

1. CHARGE POINT MANAGEMENT SYSTEM (CPMS)
   • OCPP 2.0.1 backend
   • Device fleet management
   • Remote diagnostics
   • OTA updates
   → Same as POS device management, different protocol

2. FLEET CHARGING OPTIMIZATION
   • Depot scheduling algorithms
   • Energy cost optimization
   • Grid demand response
   • Route-to-charge integration
   → SaaS product, recurring revenue

3. PAYMENT ORCHESTRATION
   • Per-kWh billing
   • Fleet accounts
   • Roaming settlement (eRoaming)
   • V2G bidirectional billing
   → Core NCR competency applied to new vertical

4. RETAIL CHARGING INTEGRATION
   • Loyalty program integration
   • "Charge while you shop" experience
   • Combined receipt (purchase + charging)
   → Directly extends existing retail platform
```

### Why This Matters Strategically

```
EVERY NCR VOYIX RETAIL CUSTOMER WILL NEED EV CHARGING
─────────────────────────────────────────────────────────────
• Walmart: 4,700 US stores, adding chargers
• Grocery chains: parking lot charging
• Restaurants: dine-and-charge
• Convenience stores: fast charging stops

They will ask NCR: "Can you integrate charging into our POS?"

OPTIONS FOR NCR:
A) "No, use a separate system" → lost revenue, fragmented UX
B) "Yes, we have a solution"   → new revenue stream, stickier platform
```

---

## Personal Context & Transparency

I want to be direct about a few things:

### I Know This Isn't Core Business

```
NCR Voyix is a software-led commerce platform.
EV charging hardware is not in the roadmap.
I'm fully aware of this.
```

This pitch isn't "NCR should pivot to EV charging."
It's "here's what I'm working on, in case there's unexpected alignment."

### I'm Doing This Regardless

```
I like this project. The technical problem is interesting.
If I don't find partners, I'll continue solo.
Slower, but still moving forward.
```

### Transparency: Multiple Outreach

```
For full transparency: I'm exploring interest with multiple parties.
VCs, corporate ventures, strategic partners.

However, NCR Voyix has priority.

If NCR expresses genuine interest, I would prefer to explore
that path first - given 5 years of working relationship and
mutual understanding of how I work.
```

### What I'm Not Asking For

To be clear about scope:

- **Not asking NCR to pivot** into EV charging
- **Not asking for funding** commitment today
- **Not asking for job change** or leave of absence

This is an exploratory conversation about whether there's mutual interest.

---

## Options to Discuss

### Option A: No Interest

Completely fine. This is outside NCR's core business.
I continue developing this independently on personal time.

### Option B: Corporate Venture Interest

NCR Voyix Ventures (or equivalent) takes an investment position
in an external entity. Standard venture terms.

### Option C: Strategic Partnership

NCR provides manufacturing partnership, payment integration,
or go-to-market support in exchange for commercial terms.

### Option D: Internal Development

NCR decides EV charging infrastructure fits strategic roadmap.
Project becomes internal initiative with appropriate resourcing.

---

## Netherlands Pilot Proposal

If NCR expresses interest (Options B, C, or D), I propose a pilot in the Netherlands.

### Why Netherlands

```
MARKET FACTORS
─────────────────────────────────────────────────────────────
• 5,000+ electric buses already operating (EU leader)
• Aggressive zero-emission targets (2025 for new purchases)
• Multiple large transit operators (GVB, RET, HTM, Connexxion)
• High charger utilization = reliability matters more
• Pragmatic procurement culture (results over paperwork)

OPERATIONAL FACTORS
─────────────────────────────────────────────────────────────
• Flat terrain = predictable energy consumption
• Dense network = high depot utilization
• Climate = moderate (no extreme thermal challenges initially)
• Grid infrastructure = robust and available

NCR PRESENCE
─────────────────────────────────────────────────────────────
• NCR has European operations accessible from NL
• Strong logistics infrastructure (Rotterdam hub)
• English widely spoken = simpler coordination
```

### Pilot Configuration

```
PROPOSED SETUP
─────────────────────────────────────────────────────────────

Location:       Single bus depot, one transit operator
Scale:          2 charging points (304 kW total)
Modules:        92 × EK3 (46 per charger)
Robot:          1 × swap station (serving both chargers)
Spares:         10 modules (5 per charger, ~11% spare ratio)

PHYSICAL LAYOUT

    ┌─────────────────────────────────────────────────────┐
    │                    BUS DEPOT                        │
    │                                                     │
    │    ┌──────────┐                    ┌──────────┐    │
    │    │ CHARGER  │                    │ CHARGER  │    │
    │    │   #1     │                    │   #2     │    │
    │    │ 152 kW   │                    │ 152 kW   │    │
    │    │ 46 mods  │                    │ 46 mods  │    │
    │    └────┬─────┘                    └────┬─────┘    │
    │         │                               │          │
    │         └───────────┬───────────────────┘          │
    │                     │                              │
    │              ┌──────┴──────┐                       │
    │              │   ROBOT     │                       │
    │              │   STATION   │                       │
    │              │  + SPARES   │                       │
    │              └─────────────┘                       │
    │                                                     │
    └─────────────────────────────────────────────────────┘

CHARGING CAPABILITY
─────────────────────────────────────────────────────────────
• 2 buses simultaneously @ 150 kW each
• Or 4 buses @ 75 kW (split power mode)
• Overnight depot charging: 8-12 buses per night
• Sufficient for small depot or pilot segment
```

### Pilot Objectives

```
TECHNICAL VALIDATION
─────────────────────────────────────────────────────────────
□ Module MTBF measurement (target: >50,000 hours)
□ Hot-swap during operation (graceful degradation)
□ Robot swap time (target: <60 seconds)
□ System uptime (target: >99.5%)
□ Thermal performance in NL climate (-10°C to +35°C)

OPERATIONAL VALIDATION
─────────────────────────────────────────────────────────────
□ Integration with depot management systems
□ Operator training requirements
□ Spare module logistics
□ Remote monitoring and diagnostics
□ Maintenance workflow (batch repair of failed modules)

BUSINESS VALIDATION
─────────────────────────────────────────────────────────────
□ Total cost of ownership vs traditional chargers
□ Operator satisfaction / willingness to expand
□ Service model viability (NCR service network?)
□ Payment integration requirements (if public access)
```

### Pilot Budget Estimate

```
HARDWARE
─────────────────────────────────────────────────────────────
92 × EK3 modules @ €800 prototype cost      €73,600
10 × spare modules @ €800                    €8,000
2 × cabinet/enclosure @ €5,000              €10,000
1 × robot station (UR10e + fixtures)        €45,000
Cabling, connectors, installation           €15,000
─────────────────────────────────────────────────────────────
Hardware subtotal                          €151,600

ENGINEERING
─────────────────────────────────────────────────────────────
System integration and commissioning        €30,000
Software (monitoring, control, OCPP)        €20,000
Certification / compliance testing          €25,000
─────────────────────────────────────────────────────────────
Engineering subtotal                        €75,000

OPERATIONS (12 months)
─────────────────────────────────────────────────────────────
On-site support during pilot                €40,000
Data collection and analysis                €15,000
Operator training                            €5,000
─────────────────────────────────────────────────────────────
Operations subtotal                         €60,000

─────────────────────────────────────────────────────────────
TOTAL PILOT COST                          ~€290,000
─────────────────────────────────────────────────────────────

Note: Prototype costs. Production modules target €400-500 each.
```

### Pilot Timeline

```
PHASE 1: PREPARATION
─────────────────────────────────────────────────────────────
• Operator selection and agreement
• Site survey and grid assessment
• Final design and component procurement
• Module manufacturing (batch of 102)

PHASE 2: DEPLOYMENT
─────────────────────────────────────────────────────────────
• Site installation (civil, electrical)
• System commissioning and testing
• Robot station setup and calibration
• Operator training

PHASE 3: OPERATION
─────────────────────────────────────────────────────────────
• 12-month monitored operation
• Data collection (uptime, failures, swaps)
• Iterative improvements
• Operator feedback integration

PHASE 4: EVALUATION
─────────────────────────────────────────────────────────────
• Performance report
• TCO analysis vs baseline
• Go/no-go decision for expansion
• Lessons learned documentation
```

### Potential Pilot Partners (NL)

```
TRANSIT OPERATORS
─────────────────────────────────────────────────────────────
GVB (Amsterdam)      - 200+ electric buses, large depots
RET (Rotterdam)      - Growing electric fleet
HTM (The Hague)      - Electric trams + buses
Connexxion           - Regional operator, multiple depots
Qbuzz                - Northern Netherlands

APPROACH
─────────────────────────────────────────────────────────────
• Start with operator introduction (NCR network or cold outreach)
• Propose pilot at no cost to operator (we provide hardware)
• Operator provides: depot space, grid connection, buses
• Win-win: operator gets free capacity, we get validation
```

### Success Criteria

```
PILOT SUCCESS = ALL OF:
─────────────────────────────────────────────────────────────
✓ System uptime > 99% over 12 months
✓ Robot successfully executes > 10 module swaps
✓ No safety incidents
✓ Operator willing to continue / expand
✓ TCO competitive with traditional chargers

PILOT FAILURE = ANY OF:
─────────────────────────────────────────────────────────────
✗ System uptime < 95%
✗ Robot reliability issues requiring manual intervention
✗ Safety incident
✗ Operator terminates early
✗ Fundamental technical flaw discovered
```

---

## Current Status

| Item | Status |
|------|--------|
| Technical architecture | Defined |
| Module specifications | Complete |
| Patent disclosures | 5 drafted |
| Priority date | 2026-01-02 |
| Prototype hardware | Not started |
| Funding | Self-funded (research only) |
| Team | Solo (me) |

---

## Technical Questions Welcome

Happy to discuss:

- Power electronics topology choices
- Why SiC vs GaN vs Si IGBTs
- Thermal management approach
- Control system architecture
- Robot integration challenges
- Standards compliance path
- Manufacturing considerations

This is a technical conversation. No sales pitch.

---

## Contact

Bojan Janjatovic
NCR Voyix - [Current Role]
[Internal contact info]

Personal project: Elektrokombinacija
bojan@elektrokombinacija.com

---

*Document prepared: 2026-01-03*
*Classification: Internal proposal, exploratory*
