# EK3 Rack System: One Module for Everything

## Philosophy: Radical Modularity

```
TRADITIONAL APPROACH:                ELEKTROKOMBINACIJA:
════════════════════════════════════════════════════════════════
Small charger = small module         Small charger = 1 × EK3
Medium charger = medium module       Medium charger = 10 × EK3
Large charger = large module         Large charger = 100 × EK3
MCS charger = huge module            MCS charger = 1000 × EK3

Result: 4+ different designs         Result: ONE design for all
```

### Why Is This Revolutionary?

```
1. MASS PRODUCTION
   • One module, million-unit production runs
   • Price drops exponentially
   • Quality increases (more iterations)

2. UNIVERSAL INVENTORY
   • One SKU for all applications
   • Swap station: 20 modules cover EVERYTHING
   • Logistics: one type of box

3. GRANULAR RELIABILITY
   • 1000 modules, 1 fails = 0.1% loss
   • vs traditional: 1 of 10 fails = 10% loss
   • "Graceful degradation" instead of "total failure"

4. DEMOCRATIZATION OF POWER
   • Same module in scooter and MCS station
   • Scooter owner and fleet operator use the SAME technology
```

---

## EK3 Module: Physical Design for Rack Mounting

### Dimensions and Form Factor

```
EK3 MODULE - 1U HALF-WIDTH (telecom style)
════════════════════════════════════════════════════════════════

TOP VIEW:
┌─────────────────────────────────────────────────────┐
│  ○ GRIP    ┌─────────────┐              GRIP ○     │
│            │    FAN      │                         │  Width: 200mm (1U half-width)
│  ┌──────┐  └─────────────┘  ┌────────┐            │  Depth: 320mm
│  │ SiC  │                   │  CTRL  │            │  Height: 44mm (1U)
│  │POWER │  ┌─────────────┐  │STM32G4 │            │
│  │STAGE │  │  HEATSINK   │  │        │            │  Mass: 3.5 kg
│  │ LLC  │  │  + VAPOR    │  │ CAN-FD │            │
│  │ 900V │  │   CHAMBER   │  └────────┘            │  Power: 3.3 kW (3.6 kW peak)
│  └──────┘  └─────────────┘  ┌────────┐            │
│                             │  DC    │            │  Efficiency: >96% peak
│  ┌────────────────────────┐ │  FUSE  │            │               >94% @ 50%
│  │   PLANAR TRANSFORMER   │ └────────┘            │
│  └────────────────────────┘                       │
│  [============= RAIL GUIDES ===============]      │
└─────────────────────────────────────────────────────┘

SIDE VIEW:
┌────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ 44mm (1U)
└────────────────────────────────────────────┘
          320mm depth
```

### Connector Panel (Rear Side)

```
BACKPLANE CONNECTOR - BLIND-MATE DESIGN
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────┐
│                                     │
│   ┌─────┐  ┌─────┐  ┌─────┐       │
│   │DC IN│  │DC OUT│ │ GND │       │  POWER CONTACTS:
│   │ +   │  │  +   │ │     │       │  • Sequenced mating
│   │650V │  │ 50-  │ │     │       │  • First: GND
│   │ 10A │  │500V  │ │     │       │  • Last: DC IN/OUT
│   └─────┘  └─────┘  └─────┘       │
│      POWER (Anderson SBS50)        │
│                                     │
│   ┌───────────────────────┐        │
│   │    DATA CONNECTOR     │        │
│   │     (20-pin)          │        │  SIGNALS (20-pin):
│   │    • CAN-FD H/L       │        │  • 2× CAN-FD
│   │    • I2C (sensors)    │        │  • 2× I2C
│   │    • PWM sync         │        │  • 4× PWM/Sync
│   │    • Module ID        │        │  • 4× GPIO/Status
│   └───────────────────────┘        │  • 8× Reserved
│                                     │
│        ◉ STATUS LED                 │
│        (RGB: G=OK, Y=Warn, R=Fail) │
│                                     │
│   [■■■■■■■ ALIGNMENT RAIL ■■■■■■]  │
└─────────────────────────────────────┘

INSERTION FORCE: <20N (robot-friendly)
MATING CYCLES: >50,000
HOT-SWAP TIME: <1 second electrical disconnect
```

---

## Rack Layout

> **NOTE:** We are considering a custom rack design instead of standard 19" format
> due to thermal challenges at high power density. See "Custom Rack Concept" section below.

### Reference Configuration: 84 Modules = 277 kW

```
CUSTOM RACK - FRONT VIEW (84 × EK3 = 277 kW)
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  ┌──────┬──────┬──────┬──────┐  │ Row 21: 13.2 kW         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 20: 13.2 kW         │
│  ├──────┼──────┼──────┼──────┤  │ Row 19: 13.2 kW         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ ...                     │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ POWER SECTION           │
│  ├──────┼──────┼──────┼──────┤  │ 21 rows × 4 modules     │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ = 84 modules            │
│  ├──────┼──────┼──────┼──────┤  │ = 277.2 kW              │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │      ...  (21 rows)  ...  │  │                         │
│  ├──────┼──────┼──────┼──────┤  │                         │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 2: 13.2 kW          │
│  │ EK3  │ EK3  │ EK3  │ EK3  │  │ Row 1: 13.2 kW          │
│  └──────┴──────┴──────┴──────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     BACKPLANE CONTROLLER   │  │ CONTROL SECTION        │
│  │     • Power distribution   │  │ Custom height          │
│  │     • CAN-FD hub @ 5 Mbps  │  │                         │
│  │     • AI Edge processor    │  │                         │
│  │     • Ethernet switch      │  │                         │
│  └────────────────────────────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     CENTRAL PFC            │  │ POWER INPUT            │
│  │     • Input: 400V AC 3-ph  │  │ Custom height          │
│  │     • DC Bus: 650V         │  │                         │
│  │     • Protection/Fusing    │  │                         │
│  └────────────────────────────┘  │                         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────┐  │                         │
│  │     THERMAL MANAGEMENT     │  │ COOLING                │
│  │     • Front-to-back airflow│  │ Integrated plenum      │
│  │     • Shared plenum        │  │                         │
│  │     • Filter + fans        │  │                         │
│  └────────────────────────────┘  │                         │
└─────────────────────────────────────────────────────────────┘

TOTAL: Custom rack (not 19" standard)
• Module section: 84 × EK3 @ 3.3kW = 277 kW
• Controller + CAN-FD hub
• Central PFC (AC/DC)
• Integrated cooling (plenum)

RACK DIMENSIONS (TBD after thermal modeling):
• Width: ~900mm (for 4× 200mm modules + spacing)
• Depth: ~500mm (module 320mm + airflow)
• Height: ~1200mm
• Mass (full): ~350 kg
```

---

## Scaling: From 3.3 kW to 3 MW

```
CONFIGURATIONS (EK3 @ 3.3 kW):
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│  USE CASE          │ MODULES │ RACKS    │  POWER  │ FOOTPRINT│
├────────────────────┼─────────┼──────────┼─────────┼──────────┤
│  E-bike charger    │    1    │    -     │  3.3 kW │  0.01 m² │
│  Home charger      │   3-7   │    -     │ 10-23kW │  0.05 m² │
│  Destination 22kW  │    7    │  Mini    │  23 kW  │  0.2 m²  │
│  DC Fast 50kW      │   16    │  Half    │  53 kW  │  0.3 m²  │
│  DC Fast 150kW     │   46    │    1     │ 152 kW  │  0.6 m²  │
│  Highway 350kW     │  106    │    2     │ 350 kW  │  1.2 m²  │
│  Bus Depot 500kW   │  152    │    2     │ 502 kW  │  1.2 m²  │
│  Bus Opp. 750kW    │  228    │    3     │ 752 kW  │  1.8 m²  │
│  Truck Depot 1MW   │  303    │    4     │   1 MW  │  2.4 m²  │
│  MCS Station 2MW   │  606    │    8     │   2 MW  │  4.8 m²  │
│  MCS Station 3MW   │  909    │   12     │   3 MW  │  7.2 m²  │
└─────────────────────────────────────────────────────────────┘
```

### Visualization: 1 MW Station (4 Racks)

```
1 MW CHARGING STATION - TOP VIEW
════════════════════════════════════════════════════════════════

            2.4m
    ┌─────────────────────┐
    │                     │
    │  ┌─────┐  ┌─────┐  │
    │  │RACK │  │RACK │  │      RACK 1-2: 152 modules = 502 kW
    │  │  1  │  │  2  │  │      (76 modules per rack)
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │      1m
    │  ┌─────┐  ┌─────┐  │
    │  │RACK │  │RACK │  │      RACK 3-4: 152 modules = 502 kW
    │  │  3  │  │  4  │  │
    │  │     │  │     │  │
    │  └─────┘  └─────┘  │
    │                     │
    │  ┌───────────────┐  │
    │  │   ROBOT ARM   │  │      Custom robot on rail
    │  │   ═══════════ │  │
    │  └───────────────┘  │
    │                     │
    └─────────────────────┘

    TOTAL: 304 modules × 3.3 kW = 1,003 kW
    FOOTPRINT: 2.4 × 2.5m = 6 m²
```

---

## Robot Swap System

### Robot Specifications

```
ROBOT FOR EK3 SWAP
════════════════════════════════════════════════════════════════

TYPE: Purpose-built robot (Robot B) on linear rail
(NOT off-the-shelf UR/KUKA - see patent EK-2026-002)

SPECIFICATIONS:
• Payload: 10-15 kg (EK3 = 3.5 kg, plus gripper)
• Reach: 1.5-2m
• Repeatability: ±0.1mm
• Speed: Up to 0.5 m/s (safe)
• Robot mass: 30-50 kg
• Power supply: 400V AC

LINEAR RAIL:
• Length: As needed (2-10m for large installations)
• Type: Igus DryLin or Bosch Rexroth
• Positioning: ±0.1mm

GRIPPER:
• Type: Custom electric (not pneumatic)
• Grabs EK3 by robot grip points
• Sensors: Force feedback + proximity
• Alignment pins for precise positioning

ESTIMATED PRICE:
• Robot B: €10,000-20,000
• (vs industrial cobot: €30,000-100,000)
```

### Swap Sequence

```
ROBOT SWAP WORKFLOW (1 module)
════════════════════════════════════════════════════════════════

TIME     ACTION
─────────────────────────────────────────────────────────────
T+0s     AI identifies module for replacement: Rack 2, Row 15, Slot 3
T+2s     Robot receives command, plans path
T+5s     Robot positions in front of rack
T+8s     Robot grabs module (grip engagement)
T+10s    Robot extracts module (300mm extraction)
T+15s    Robot turns toward "OUT" position
T+18s    Robot places module in "defective" bin
T+22s    Robot positions at "fresh module" storage
T+25s    Robot grabs new module
T+28s    Robot returns to Rack 2, Row 15, Slot 3
T+32s    Robot inserts module (alignment + push)
T+35s    Module locks in (cam lock engagement)
T+38s    Backplane handshake - module ONLINE
T+40s    Robot returns to home position
─────────────────────────────────────────────────────────────
TOTAL: 40 seconds for complete swap

FOR 10 MODULES (batch replacement): ~5 minutes
FOR 50 MODULES (major service): ~25 minutes
```

### Multi-Robot for Large Installations

```
3 MW STATION (1000 modules, 12 racks)
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   R1   R2   R3   R4   R5   R6   R7   R8   R9   R10  R11 R12│
│   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐   ┌┐  ┌┐│
│   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││  │││
│   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││   ││  │││
│   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘   └┘  └┘│
│   ═══════════════════════════════════════════════════════  │
│              LINEAR RAIL (10m)                              │
│                    │                                        │
│              ┌─────┴─────┐                                  │
│              │  ROBOT 1  │                                  │
│              └───────────┘                                  │
│                                                             │
│   ═══════════════════════════════════════════════════════  │
│              LINEAR RAIL (10m) - other side                │
│                    │                                        │
│              ┌─────┴─────┐                                  │
│              │  ROBOT 2  │                                  │
│              └───────────┘                                  │
│                                                             │
│   MODULE STORAGE:                                           │
│   ┌──────────────────────────────────────────────────────┐ │
│   │  FRESH: 50 modules    │    DEFECTIVE: 20 slots       │ │
│   └──────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

2 ROBOTS WORK IN PARALLEL:
• Robot 1: Rack 1-6 (upper rail)
• Robot 2: Rack 7-12 (lower rail)
• Capacity: 100+ swaps per hour
```

---

## Reliability: The Mathematics of Modularity

### Comparison: 10 Large vs 303 Small Modules

```
SCENARIO: 1 MW charger, 10 years of operation
════════════════════════════════════════════════════════════════

TRADITIONAL (10 × 100kW modules):
─────────────────────────────────────────────────
• MTBF per module: 100,000 h
• Probability of one module failure/year: ~8%
• When 1 fails: 10% CAPACITY LOSS
• Repair: Technician, 2-5 days

ELEKTROKOMBINACIJA (303 × 3.3kW modules):
─────────────────────────────────────────────────
• MTBF per module: 100,000 h
• Probability of one module failure/year: ~8%
• But: Expected ~24 failures/year (statistically)
• When 1 fails: 0.33% CAPACITY LOSS
• Repair: Robot, 40 seconds

AVAILABILITY MATHEMATICS:
─────────────────────────────────────────────────
Traditional:
• 1 failure = 10% degradation until technician arrives
• Expected 1-2 failures per year
• Each failure = 2-5 days at 90% capacity
• Annual availability: ~98%

ELEKTROKOMBINACIJA:
• 24 failures per year, but each = 0.33% loss
• Robot replaces in 40 sec
• System NEVER below 99% capacity
• Annual availability: >99.9%
```

### Graceful Degradation Visualization

```
CAPACITY OVER TIME:
════════════════════════════════════════════════════════════════

TRADITIONAL (10 modules):
100%|████████████████████████████████████████
 90%|                    ████████████████████ ← 1 module fails
 80%|                                     ████ ← 2 modules
    └────────────────────────────────────────→ time
           ↑ failure          ↑ failure

ELEKTROKOMBINACIJA (303 modules @ 3.3 kW):
100% |████████████████████████████████████████
99.67|█████████████████████████████████████▓▓▓ ← 1 fails
99.34|█████████████████████████████████████▓▓▓ ← 2 fail
99%  |█████████████████████████████████████▓▓▓ ← 3 fail
     └────────────────────────────────────────→ time
     Practically NO VISIBLE DROP because robot continuously replaces!
```

---

## Inspiration: 3PAR Storage Architecture

### What is 3PAR?

```
3PAR (now HPE Primera/Alletra) revolutionized the storage industry
with a similar approach - radical modularity at the smallest unit level.

Instead of using whole disks as building blocks, 3PAR divides
disks into 1GB "chunklets" and distributes data across ALL disks.

We apply the same principle to power electronics!
```

### Concept Mapping: Storage → Chargers

```
3PAR CONCEPT           STORAGE                 EK3 APPLICATION
═══════════════════════════════════════════════════════════════════

CHUNKLETS              1GB blocks instead      EK3 = 3kW power
                       of whole disks          "chunklet"

WIDE STRIPING          Data across ALL         Load across ALL
                       disks, not just 2-3     modules, not just needed ones

THIN PROVISIONING      Capacity allocated      Modules "sleep" until
                       only when needed        needed

AUTONOMIC              Add/remove disk →       Add/remove module →
REBALANCING            auto redistribution     auto redistribution

DISTRIBUTED            Spare capacity          No "hot spare" modules
SPARING                distributed, not        - spare is distributed
                       dedicated hot-spare     in each module

MESH-ACTIVE            All controllers         Swarm - all modules
                       active, no master       equal, no master

RAPID REBUILD          Rebuild from ALL        Recovery load from ALL
                       disks in parallel       modules in parallel
```

### Distributed Sparing: Key Innovation

```
TRADITIONAL "HOT SPARE":
═══════════════════════════════════════════════════════════════════

┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │  0% │  ← Spare sits idle, does nothing
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5   SPARE

• Spare module: Cold, untested, takes up space
• M3 fails → SPARE takes over 100% immediately
• But: Spare was inactive - maybe it has a problem too?
• After one failure: No more spare!


3PAR / EK3 DISTRIBUTED SPARING:
═══════════════════════════════════════════════════════════════════

┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 83% │ 83% │ 83% │ 83% │ 83% │ 83% │  ← All work, all have reserve
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

• No "spare" module - SPARE CAPACITY is distributed
• All modules active = all tested in production
• M3 fails → Remaining 5 go from 83% to 100%
• After one failure: STILL has reserve for the next one!
```

### Practical Example: 100kW System

```
100kW SYSTEM WITH 10% RESERVE:
═══════════════════════════════════════════════════════════════════

TRADITIONAL (Hot Spare):
────────────────────────────────────────
34 modules × 3kW = 102kW active
 + 4 spare modules × 3kW = 12kW inactive (waiting)
═══════════════════════════════════════
38 modules total, but 4 DON'T WORK

• Spare uses space, standby power, but doesn't contribute
• After 4 failures: NO MORE RESERVE


EK3/3PAR (Distributed Sparing):
────────────────────────────────────────
38 modules × 3kW = 114kW potential
Operating at 88% = 100kW delivered
═══════════════════════════════════════
38 modules total, ALL WORK

1 module fails → 37 × 3kW × 92% = 102kW ✓
2 modules fail → 36 × 3kW × 95% = 102kW ✓
3 modules fail → 35 × 3kW × 97% = 102kW ✓
4 modules fail → 34 × 3kW × 100% = 102kW ✓

GRACEFUL DEGRADATION down to 34 modules before dropping below 100kW!
```

### Wide Striping: Uniform Aging

```
TRADITIONAL - Concentrated Load:
═══════════════════════════════════════════════════════════════════

Need 100kW from 300kW system:

┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │ 0%  │ 0%  │  ← 4 work at max, 2 sleep
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

Problem: M1-M4 age faster, M5-M6 don't work at all
After 5 years: M1-M4 near end of life, M5-M6 like new


EK3/3PAR - Wide Striping:
═══════════════════════════════════════════════════════════════════

Need 100kW from 300kW system:

┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 33% │ 33% │ 33% │ 33% │ 33% │ 33% │  ← All work equally
└─────┴─────┴─────┴─────┴─────┴─────┘
  M1    M2    M3    M4    M5    M6

Benefits:
• Uniform aging of all modules
• Lower temperature (less load per module)
• Longer system lifespan
• More predictable maintenance
```

### Thin Provisioning: Dynamic Allocation

```
THIN PROVISIONING FOR POWER:
═══════════════════════════════════════════════════════════════════

USE CASE: Charger that supports 350kW but rarely needs that much

TRADITIONAL:
• All components sized for 350kW
• 90% of time uses 50kW
• Efficiency drops at low load

EK3/3PAR:
• 117 modules installed (351kW potential)
• At 50kW: Only 17 modules active, rest in sleep
• At 200kW: 67 modules active
• At 350kW: All 117 active

Benefits:
• Each active module operates at optimal load
• Inactive modules: Minimal consumption
• Efficiency >97% regardless of load
```

### Conclusion: Proven Concept

```
3PAR PROVED THIS WORKS:
═══════════════════════════════════════════════════════════════════

• 2002: 3PAR introduces chunklet architecture
• Storage industry: "Impossible, too complex"
• 2010: HP buys 3PAR for $2.35 billion
• 2024: HPE Primera/Alletra - industry standard

SAME LOGIC FOR EV CHARGERS:
• Instead of chunklets: EK3 module (3kW)
• Instead of wide striping: Load distribution across all modules
• Instead of thin provisioning: Sleep mode for inactive modules
• Instead of distributed sparing: Reserve in each module, not hot-spare

IF IT WORKS FOR STORAGE, IT WORKS FOR POWER ELECTRONICS!
```

---

## Economics: Why It's Cheaper

### Cost Breakdown

```
COST ANALYSIS: 1 MW SYSTEM
════════════════════════════════════════════════════════════════

TRADITIONAL (10 × 100kW specialized modules):
─────────────────────────────────────────────────
100kW module (custom design):     €8,000 × 10 = €80,000
Rack/enclosure (custom):                       €15,000
Control system:                                €10,000
Installation:                                  €10,000
─────────────────────────────────────────────────
TOTAL:                                        €115,000

ELEKTROKOMBINACIJA (303 × EK3 @ 3.3kW, mass-produced):
─────────────────────────────────────────────────
EK3 module (@10k volume):           €150 × 303 = €45,450
Custom racks (4×):                  €3,000 × 4 = €12,000
Backplanes + PFC (4×):              €2,000 × 4 = €8,000
Control system (CAN-FD):                       = €5,000
Robot B (amortized):                €15,000/10 = €1,500
Installation:                                  = €5,000
─────────────────────────────────────────────────
TOTAL:                                         €76,950

SAVINGS: 33%!

PLUS:
• Maintenance cost: -70% (robot vs technician)
• Spare parts inventory: -80% (one module type)
• Downtime cost: -90% (40 sec vs 2-5 days)
```

### Economies of Scale

```
EK3 PRICE vs QUANTITY:
════════════════════════════════════════════════════════════════

ANNUAL PRODUCTION         PRICE PER MODULE     NOTE
─────────────────────────────────────────────────────────────
1,000 modules             €300               Prototype/pilot
10,000 modules            €150               Small series
100,000 modules           €80                Medium series
1,000,000 modules         €50                Mass production

WITH 1M MODULES PER YEAR:
• 1 MW station = 303 × €50 = €15,150 for modules!
• Plus rack/control = ~€35,000 TOTAL for 1 MW system
• That's €35/kW (industry: €100-150/kW)
```

---

## Integration with Swap Station

```
SWAP STATION + RACK SYSTEM
════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    SWAP STATION                             │
│                                                             │
│   BUS LANE                                                  │
│   ════════════════════════════════════════                  │
│          │                                                  │
│   ┌──────┴──────┐                                          │
│   │    BUS      │      BATTERY SWAP AREA                   │
│   └─────────────┘                                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              CHARGING RACK AREA                      │  │
│   │   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │  │
│   │   │RACK1│ │RACK2│ │RACK3│ │RACK4│   1 MW           │  │
│   │   │ 84  │ │ 84  │ │ 84  │ │ 84  │   336 EK3        │  │
│   │   └─────┘ └─────┘ └─────┘ └─────┘                  │  │
│   │         ══════════════════════                      │  │
│   │              ROBOT RAIL                              │  │
│   │              ┌──────┐                               │  │
│   │              │ROBOT │                               │  │
│   │              └──────┘                               │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   WORKFLOW:                                                 │
│   1. Bus arrives → Battery swap robot changes battery      │
│   2. SIMULTANEOUSLY: EK3 robot swaps modules as needed     │
│   3. Bus departs, charging system at 100%                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Custom Rack Concept

### Why Not Standard 19" Rack?

```
CHALLENGES WITH 19" TELECOM RACK:
════════════════════════════════════════════════════════════════

1. THERMAL MANAGEMENT
   • 84 modules × 3.3kW = 277 kW in one rack
   • ~11 kW heat dissipation (at 96% efficiency)
   • Standard 19" rack NOT designed for such density
   • Need optimized airflow path

2. FORM FACTOR MISMATCH
   • EK3 module: 200×320×44mm (1U half-width)
   • 19" rack: 482mm width
   • Only 2 modules per row (not 4)
   • Lose density

3. ROBOT ACCESS
   • 19" rack is designed for human access
   • Robot needs different clearance and alignment

4. BACKPLANE DESIGN
   • Custom blind-mate connectors
   • Sequenced power mating
   • Doesn't fit standard 19" format
```

### Proposed Custom Rack

```
ELEKTROKOMBINACIJA CUSTOM RACK:
════════════════════════════════════════════════════════════════

DIMENSIONS (TBD after thermal modeling):
• Width: ~900mm (for 4× 200mm modules + spacing)
• Depth: ~500mm (module 320mm + airflow plenum)
• Height: ~1200mm (more compact than 42U)

THERMAL DESIGN:
• Front-to-back airflow
• Integrated fans in plenum
• Filter with easy access
• Optional: Liquid cooling for DC bus

ROBOT OPTIMIZATION:
• Wider horizontal spacing for gripper
• Vertical alignment rails
• Standardized positions for all modules
• LED markers for visual navigation

MODULAR BACKPLANE:
• Custom PCB backplane
• 20-pin blind-mate data connectors
• Sequenced power mating (GND first)
• CAN-FD hub integrated

CENTRAL PFC:
• Modular PFC (for redundancy)
• AC input: 400V 3-phase
• DC bus: 650V
• Can be in same or separate rack
```

### Custom Rack Development Phases

```
PHASE 1: Thermal Modeling
─────────────────────────────────────────────────
• CFD simulation of airflow
• Define max thermal density
• Optimize fan placement

PHASE 2: Mechanical Design
─────────────────────────────────────────────────
• CAD modeling
• Robot gripper clearance analysis
• Prototype frame structure

PHASE 3: Electrical Design
─────────────────────────────────────────────────
• Backplane PCB
• DC bus distribution
• CAN-FD wiring

PHASE 4: Integration
─────────────────────────────────────────────────
• Pilot rack with 12-24 modules
• Robot swap testing
• Thermal testing under load
```

---

## Conclusion: Why EK3-Only Architecture Wins

```
SUMMARY:
════════════════════════════════════════════════════════════════

✓ ONE DESIGN for all - from 3.3 kW to 3 MW
✓ MASS PRODUCTION - price drops, quality increases
✓ GRANULAR RELIABILITY - 0.33% loss per failure, not 10%
✓ ROBOT REPLACEMENT - 40 seconds, not 2-5 days
✓ UNIVERSAL INVENTORY - one type of spare part
✓ GRACEFUL DEGRADATION - system never "down"
✓ LOWER COST - 33%+ hardware savings
✓ CIRCULAR ECONOMY - modules repaired and returned
✓ CUSTOM RACK - optimized for thermal and robotic swap

THIS IS A NEW PARADIGM:
Not "how many kW per module" but "how many modules per kW"

EK3 SPECIFICATIONS:
• Power: 3.3 kW continuous, 3.6 kW peak
• Dimensions: 200×320×44mm (1U half-width)
• Mass: 3.5 kg
• SiC: 900V Wolfspeed
• Communication: CAN-FD @ 5 Mbps
• MCU: STM32G474 (Cortex-M4)
• Efficiency: >96% peak, >94% @ 50% load
```

---

## Next Steps

1. **Custom rack thermal modeling** - CFD simulation
2. **Backplane PCB design** - 20-pin connectors + CAN-FD
3. **Robot B prototype** - custom gripper for EK3
4. **Central PFC design** - modular for redundancy
5. **Pilot rack** - 1 rack = 24 modules = 79 kW demo

---

## Date

Created: January 2026
Status: Concept
