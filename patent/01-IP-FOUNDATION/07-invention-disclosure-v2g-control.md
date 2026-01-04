# Invention Disclosure: Decentralized V2G Control System for Modular Charging Infrastructure

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-007 |
| Date of Disclosure | 2026-01-04 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-04 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Nadogradnja modularne arhitekture punjača (EK-2026-001) sa V2G sposobnostima. Ključna inovacija je decentralizovana kontrola gde svaki 3kW modul ima sopstvenu grid sinhronizaciju i droop kontrolu, omogućavajući hot-swap tokom aktivne V2G operacije bez prekida grid servisa.

---

## 1. Title of Invention

**Decentralized Vehicle-to-Grid Control System with Per-Module Grid Synchronization and Hot-Swap Capability**

Alternative titles:
- Distributed Droop Control Architecture for Modular Bidirectional EV Charging
- Self-Coordinating V2G Power Modules with Graceful Degradation

---

## 2. Technical Field

```
□ Power Electronics - Bidirectional DC/AC Conversion
□ Vehicle-to-Grid (V2G) Technology
□ Grid-Connected Inverter Control
□ Distributed Control Systems
□ EV Charging Infrastructure
```

---

## 3. Problem Statement

### 3.1 Current State of the Art

```
EXISTING V2G CHARGER ARCHITECTURES:

CENTRALIZED CONTROL:
• Single controller manages all power electronics
• Grid synchronization (PLL) at system level
• Droop control applied to aggregate output
• Single point of failure for entire V2G system

LIMITATIONS:
• Module failure = complete V2G service interruption
• Hot-swap requires V2G shutdown
• Scaling requires new control system design
• Limited fault tolerance
```

### 3.2 Problems with Current Approaches

```
1. SINGLE POINT OF FAILURE
   • Central PLL/droop controller failure = all V2G stops
   • Grid service commitment cannot be maintained
   • Revenue loss and grid stability risk

2. NO HOT-SWAP DURING V2G
   • Current systems require service interruption for maintenance
   • Module replacement = V2G service offline
   • Cannot maintain grid frequency regulation commitment

3. SCALING COMPLEXITY
   • Central controller must be redesigned for each power level
   • More modules = more complex central control
   • Testing burden grows exponentially

4. RESPONSE TIME LIMITATIONS
   • Central controller creates communication bottleneck
   • Grid events require sub-100ms response
   • Centralized decisions too slow at scale
```

---

## 4. Summary of Invention

### 4.1 Core Concept

```
DECENTRALIZED V2G CONTROL:

Each 3kW EK3 module contains complete V2G capability:
• Local Phase-Locked Loop (PLL) for grid synchronization
• Local P(f) droop control for frequency regulation
• Local Q(V) droop control for voltage support
• Local current controller for power delivery

SWARM COORDINATION:
• Modules coordinate via peer-to-peer messaging
• No single point of failure in control
• Any module can be swapped during V2G operation
• System continues providing grid service with N-1 modules
```

### 4.2 Key Innovation Elements

```
ELEMENT 1: Per-Module Grid Synchronization
─────────────────────────────────────────────────────────────
• Each module has independent PLL tracking grid phase/frequency
• Modules share grid state information for validation
• Disagreement detection prevents incorrect operation
• Module failure does not affect others' synchronization

ELEMENT 2: Distributed Droop Control
─────────────────────────────────────────────────────────────
• P(f) droop: Each module adjusts power based on local frequency
• Q(V) droop: Each module provides local voltage support
• Automatic load sharing without central coordination
• Grid-native behavior emerges from local decisions

ELEMENT 3: Hot-Swap During V2G Operation
─────────────────────────────────────────────────────────────
• Module extraction triggers graceful power redistribution
• Remaining modules increase output to maintain commitment
• New module insertion auto-synchronizes and joins
• Grid service uninterrupted during maintenance

ELEMENT 4: Multi-Layer Control Hierarchy
─────────────────────────────────────────────────────────────
• Layer 1: Local PLL (fastest, per-module)
• Layer 2: Droop control (fast, per-module)
• Layer 3: Current control (medium, per-module)
• Layer 4: Power scheduling (slow, system-level)
• Layer 5: Fleet coordination (slowest, cloud-level)
```

---

## 5. Detailed Description

### 5.1 Per-Module Control Architecture

```
EACH EK3 MODULE CONTAINS:
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      EK3 MODULE                              │
│                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   GRID      │───►│    PLL      │───►│   DROOP     │    │
│   │  SENSORS    │    │ (Per-Module)│    │  CONTROL    │    │
│   │  V, I, f    │    │  θ, ω, Vd   │    │  P(f), Q(V) │    │
│   └─────────────┘    └──────┬──────┘    └──────┬──────┘    │
│                             │                   │            │
│                             ▼                   ▼            │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│   │   CURRENT   │◄───│   POWER     │◄───│  PROTECTION │    │
│   │  CONTROLLER │    │  REFERENCE  │    │   SYSTEM    │    │
│   │   id, iq    │    │  P*, Q*     │    │             │    │
│   └──────┬──────┘    └─────────────┘    └─────────────┘    │
│          │                                                   │
│          ▼                                                   │
│   ┌─────────────┐                                           │
│   │    PWM      │───► Power Stage ───► Grid Connection      │
│   │  GENERATOR  │                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

KEY BENEFIT:
• Complete control loop within each module
• Module operates independently of others
• Failure isolated to single module
```

### 5.2 Grid Synchronization Strategy

```
PER-MODULE PHASE-LOCKED LOOP:
═══════════════════════════════════════════════════════════════

Each module independently tracks:
• Grid voltage phase angle (θ)
• Grid frequency (ω)
• Grid voltage magnitude (V)

CONSENSUS MECHANISM:
• Modules share PLL state via CAN-FD network
• Median voting for grid frequency consensus
• Outlier detection identifies faulty sensors
• Module with bad PLL data is isolated

SYNCHRONIZATION STATES:
1. ACQUIRING: PLL locking to grid
2. LOCKED: Normal operation
3. COASTING: Temporary loss, using predicted angle
4. FAULT: Cannot synchronize, module offline
```

### 5.3 Droop Control Operation

```
FREQUENCY DROOP (P-f CHARACTERISTIC):
═══════════════════════════════════════════════════════════════

Power Response:
                 Under-frequency         Over-frequency
                 (reduce load)           (absorb excess)
                      │                       │
                      ▼                       ▼
    P/Pn     ─────────────────────────────────────────────
      │                     ╱
    +1│                    ╱   ← Charging
      │                   ╱
      │                  ╱ ← Deadband (±50mHz)
      │─────────────────╱─────────────────────► f
      │                ╱            49.95  50.05
      │               ╱
    -1│              ╱   ← V2G Discharge
      │─────────────╱

PER-MODULE BEHAVIOR:
• Each module responds to local frequency measurement
• Automatic load sharing: modules see same frequency
• Natural coordination without explicit messaging
• Total system response = sum of module responses


VOLTAGE DROOP (Q-V CHARACTERISTIC):
═══════════════════════════════════════════════════════════════

Reactive Power Response:
• Low voltage → Inject reactive power (capacitive)
• High voltage → Absorb reactive power (inductive)
• No battery wear: reactive power is grid exchange only

PER-MODULE ADVANTAGE:
• Local voltage support improves nearby grid quality
• Modules in different phases can respond independently
• Reactive power capability utilized without central coordination
```

### 5.4 Hot-Swap Procedure During V2G

```
HOT-SWAP SEQUENCE (Module replacement during V2G):
═══════════════════════════════════════════════════════════════

INITIAL STATE: 100 modules providing 50kW V2G discharge

T+0ms:    Robot identifies failed module #47
          System providing: 50kW discharge
          Per-module contribution: 500W each

T+10ms:   Pre-swap notification broadcast
          Other modules receive "M47 pending removal"

T+50ms:   Module #47 receives shutdown command
          Begins power ramp-down (500W → 0W)

T+200ms:  Module #47 at zero power
          99 modules now sharing 50kW
          Per-module contribution: 505W each (within margin)
          Grid service: UNINTERRUPTED

T+500ms:  Module #47 disconnected from backplane
          Robot extraction begins

T+30s:    New module #47 inserted
          Module powers up, PLL acquiring

T+30.5s:  PLL locked, droop parameters configured
          Module joins at zero power

T+31s:    Module ramps to 505W contribution
          100 modules again sharing 50kW

T+32s:    System returns to nominal operation
          Grid service: NEVER INTERRUPTED

KEY INNOVATION:
• Graceful power redistribution during swap
• No central controller restart required
• Grid service commitment maintained throughout
• Swap can occur during peak grid event response
```

### 5.5 ISO 15118-20 BPT Integration

```
V2G PROTOCOL SUPPORT:
═══════════════════════════════════════════════════════════════

ISO 15118-20 defines bidirectional power transfer (BPT) protocol.
ELEKTROKOMBINACIJA implements both control modes:

SCHEDULED MODE:
• Charger provides power schedule to vehicle
• Schedule includes V2G discharge periods
• Vehicle follows schedule, charger enforces
• Example: Charge 18:00-22:00, V2G 00:00-02:00, Charge 02:00-06:00

DYNAMIC MODE:
• Charger can request power changes in real-time
• Used for frequency regulation, demand response
• Vehicle must respond within 2 seconds (per standard)
• Enables grid service participation

MODULAR ADVANTAGE:
• Each module can participate in different session
• Multiple vehicles can connect simultaneously
• Aggregate V2G capacity reported to grid operator
• Individual module failures don't affect protocol state


VEHICLE-CHARGER NEGOTIATION:
═══════════════════════════════════════════════════════════════

Power limits exchanged at session start:
• Vehicle provides: max charge/discharge power, SoC limits
• Charger provides: available power (from module count)
• Negotiated parameters = minimum of both limits

Hot-swap adaptation:
• Module removal → charger recalculates available power
• ISO 15118-20 allows dynamic limit updates
• Vehicle informed of new limits, adjusts accordingly
• No session restart required
```

---

## 6. Advantages Over Prior Art

```
ADVANTAGE 1: No Single Point of Failure
─────────────────────────────────────────────────────────────
Prior art: Central controller failure = complete V2G shutdown
This invention: Any module failure = 0.3% capacity reduction
                Control continues with remaining modules

ADVANTAGE 2: Hot-Swap During Grid Services
─────────────────────────────────────────────────────────────
Prior art: Maintenance requires V2G service interruption
This invention: Module swap during peak grid event response
                Grid commitment maintained throughout

ADVANTAGE 3: Automatic Load Sharing
─────────────────────────────────────────────────────────────
Prior art: Central controller calculates power distribution
This invention: Droop control provides natural load sharing
                No communication required for coordination

ADVANTAGE 4: Sub-100ms Response Time
─────────────────────────────────────────────────────────────
Prior art: Central controller latency limits response
This invention: Each module responds to local measurement
                Parallel response, no communication bottleneck

ADVANTAGE 5: Simplified Scaling
─────────────────────────────────────────────────────────────
Prior art: New control system design for each power level
This invention: Add modules, total capacity increases
                Control logic identical at any scale

ADVANTAGE 6: Grid Code Compliance by Design
─────────────────────────────────────────────────────────────
Prior art: Compliance verified at system level
This invention: Each module individually grid-compliant
                System inherits compliance from modules
```

---

## 7. Known Prior Art

```
RELATED TECHNOLOGIES:
═══════════════════════════════════════════════════════════════

1. GRID-FORMING INVERTERS (Utility scale)
   - Decentralized control at inverter level
   - BUT: Single large inverters, not modular
   - BUT: No hot-swap capability

2. MICROGRIDS WITH DROOP CONTROL
   - Distributed generators with P(f), Q(V) droop
   - BUT: Different power sources, not modular identical units
   - BUT: No robotic swap, manual maintenance

3. ABB TERRA HP MODULAR CHARGERS
   - Multiple modules per charger
   - BUT: Central controller for V2G
   - BUT: 50kW modules, not 3kW granularity

4. FREEWIRE BOOST CHARGER
   - Battery-integrated bidirectional charger
   - BUT: Monolithic design, not modular
   - BUT: Single point of failure

5. TRITIUM/DCBEL V2G CHARGERS
   - ISO 15118-20 BPT support
   - BUT: Central V2G control
   - BUT: No hot-swap during V2G


DIFFERENTIATION:
─────────────────────────────────────────────────────────────
Our combination of:
• Per-module PLL and droop control
• 3kW granularity for extreme redundancy
• Hot-swap during active V2G operation
• Swarm coordination without central controller
• ISO 15118-20 BPT with dynamic limit updates

...appears to be NOVEL
```

---

## 8. Potential Claims (Draft)

```
INDEPENDENT CLAIM 1 (System):
A vehicle-to-grid charging system comprising:
• A plurality of identical power modules, each module comprising:
  - A local phase-locked loop for grid synchronization
  - A local frequency droop controller for active power regulation
  - A local voltage droop controller for reactive power regulation
  - A local current controller for power delivery
• A peer-to-peer communication network connecting said modules
• Wherein each module independently responds to grid conditions
  without requiring coordination from a central controller
• Wherein the system maintains grid service during hot-swap
  of any individual module

INDEPENDENT CLAIM 2 (Method):
A method for providing vehicle-to-grid services comprising:
• Synchronizing each of a plurality of power modules to grid
  phase using independent phase-locked loops
• Measuring grid frequency at each module location
• Adjusting active power output of each module based on local
  frequency measurement and a droop characteristic
• Redistributing power among remaining modules when one module
  is removed during active V2G operation
• Wherein grid service commitment is maintained during
  module replacement

DEPENDENT CLAIMS:
• ...wherein modules share PLL state for consensus validation
• ...wherein failed modules are automatically isolated
• ...wherein droop parameters are configurable per grid code
• ...wherein the system supports ISO 15118-20 BPT protocol
• ...wherein dynamic power limits are communicated to vehicle
  during hot-swap events
• ...wherein response time to grid frequency deviation is
  less than 100 milliseconds
```

---

## 9. Development Status

```
□ Concept only (current)
□ Proof of concept built
□ Prototype tested
□ Pilot production
□ Commercial production
```

---

## 10. Commercial Potential

```
MARKET SIZE:
• V2G capable charger market: $2B by 2030
• Grid services market (frequency regulation): $5B/year
• Bus depot charging infrastructure: $3B by 2030

COMPETITIVE ADVANTAGE:
• Only V2G system with per-module control
• Hot-swap during grid service = 99.99% availability
• Grid code compliance at module level
• Simplified certification path

POTENTIAL LICENSEES:
• Grid operators (frequency regulation services)
• Fleet operators (bus depots, logistics)
• Aggregators (virtual power plants)
• Charger OEMs (ABB, Tritium, ChargePoint)
```

---

## 11. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________


WITNESS (non-inventor who understands the disclosure):

Name: _________________________
Signature: ____________________
Date: ________________________
```

---

## Notes for Patent Attorney

```
KEY POINTS TO EMPHASIZE:
1. Per-module control is novel for V2G charging
2. Hot-swap during grid service is novel
3. Combination of droop control + modular architecture
4. Synergy with modular architecture patent (EK-2026-001)
5. ISO 15118-20 BPT integration with dynamic limits

POTENTIAL CHALLENGES:
1. Droop control is known (but not at module level)
2. PLL is standard (but per-module with consensus is novel)
3. Software/control aspects (focus on technical effect)

RECOMMENDED APPROACH:
1. Position as improvement to EK-2026-001
2. Emphasize hot-swap during V2G as key differentiator
3. Claim system and method separately
4. Consider continuation for ISO 15118-20 specifics

CROSS-REFERENCE:
• Patent A (Umbrella): EK-2026-001 Modular Architecture
• This patent: V2G-specific control innovation
• Reference Patent A for module hardware claims
```
