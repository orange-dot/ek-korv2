# Small Batteries + Frequent Swaps: A Paradigm Shift for Heavy Vehicles

## Executive Summary

Traditional electric vehicle thinking assumes larger batteries are better: more range, fewer stops, simpler operations. This document challenges that assumption for **heavy commercial vehicles** (buses, trucks, delivery vans) and proposes a radical alternative:

**Small batteries with frequent robotic swaps instead of charging.**

This approach extends Elektrokombinacija's core modularity philosophy from charger infrastructure (EK3 modules) to vehicle batteries themselves (EK-BAT modules), creating a unified ecosystem where both infrastructure AND vehicles benefit from extreme modularity.

---

## 1. The Problem with Large Batteries in Heavy Vehicles

### 1.1 The Weight Penalty

Every kilogram of battery is a kilogram NOT available for passengers or cargo.

```
WEIGHT ANALYSIS: CITY BUS (12m, 18-ton GVW limit)
═══════════════════════════════════════════════════════════════════════════

Traditional 400 kWh Battery:
├── Battery cells: ~1,600 kg (@ 150 Wh/kg cell level)
├── BMS, housing, cooling: ~800 kg
├── TOTAL BATTERY WEIGHT: ~2,400 kg
│
└── Impact:
    • 24 fewer standing passengers (@ 100 kg each)
    • OR reduced structural/HVAC capacity
    • Higher tire wear, brake wear, energy consumption

Small 100 kWh Battery:
├── Battery cells: ~400 kg
├── BMS, housing, cooling: ~200 kg
├── TOTAL BATTERY WEIGHT: ~600 kg
│
└── Savings:
    • 1,800 kg freed for passengers/cargo
    • 18 additional passengers per trip
    • Lower energy consumption per km
```

**For trucks, the impact is even more dramatic:**

| Vehicle Type | Traditional Battery | Weight | Small Battery | Weight | Cargo Gained |
|--------------|---------------------|--------|---------------|--------|--------------|
| City Bus (12m) | 400 kWh | 2,400 kg | 100 kWh | 600 kg | +18 passengers |
| Regional Bus (15m) | 500 kWh | 3,000 kg | 150 kWh | 900 kg | +21 passengers |
| Delivery Van (3.5t) | 150 kWh | 900 kg | 50 kWh | 300 kg | +600 kg cargo |
| Urban Truck (16t) | 300 kWh | 1,800 kg | 100 kWh | 600 kg | +1,200 kg cargo |
| Long-haul Truck (40t) | 600 kWh | 3,600 kg | 150 kWh | 900 kg | +2,700 kg cargo |

### 1.2 The Cost Paradox

Large batteries are expensive, and most of that capacity sits unused for most of the day.

```
COST ANALYSIS: 50-BUS FLEET
═══════════════════════════════════════════════════════════════════════════

Traditional Model (400 kWh per bus):
├── 50 buses × 400 kWh × €150/kWh = €3,000,000 (batteries alone)
├── Battery utilization: 1 full cycle per day
├── Battery life: ~3,000 cycles @ 80% DoD = 8 years theoretical
├── Actual replacement: Year 5-6 (degradation + technology refresh)
└── Replacement cost: €2,100,000 (70% of original, volume discount)

Small Battery + Swap Model (100 kWh per bus + shared pool):
├── 50 buses × 100 kWh × €150/kWh = €750,000 (vehicle batteries)
├── Pool: 100 batteries × 100 kWh × €150/kWh = €1,500,000
├── Battery utilization: 3-4 shallow cycles per day
├── Battery life: ~6,000+ cycles @ 30% DoD = extended life
├── Replacement: Distributed over time (predictive, scheduled)
└── 5-year replacement budget: €600,000 (pool rotation)
```

### 1.3 The Charging Time Problem

Large batteries require either:
- **Slow overnight charging**: Vehicle unavailable for 8+ hours
- **Ultra-fast charging (MW-scale)**: Expensive infrastructure, grid stress, battery degradation

```
CHARGING vs. SWAP TIME COMPARISON
═══════════════════════════════════════════════════════════════════════════

City Bus - Need to restore 300 kWh for next shift:

OPTION A: Depot Charging (200 kW charger)
├── Charging time: 300 kWh ÷ 200 kW = 1.5 hours
├── But: Peak power limited, derating at high SoC
├── REALISTIC TIME: 2-2.5 hours
└── Vehicle availability: 14-16 hours/day

OPTION B: Opportunity Charging (450 kW pantograph)
├── Charging time: 100 kWh in 15-20 minutes at terminus
├── Requires: Special terminus infrastructure
├── Problem: Schedule disruption if charger occupied
└── Battery stress: Constant fast charging reduces life

OPTION C: Battery Swap (100 kWh, robotic)
├── Swap time: 5 minutes total (drive in, swap, drive out)
├── 3 swaps per day × 5 min = 15 minutes total downtime
├── No grid peak issues (batteries charged off-peak)
└── Vehicle availability: 20+ hours/day
```

### 1.4 Infrastructure Scaling Problem

Large batteries require massive grid connections at depots.

```
GRID CONNECTION COMPARISON: 50-BUS DEPOT
═══════════════════════════════════════════════════════════════════════════

Traditional Depot Charging:
├── 50 buses × 400 kWh = 20 MWh to charge overnight
├── 8-hour window = 2.5 MW average demand
├── But: All buses arrive within 2-hour window
├── Peak demand: 50 × 200 kW = 10 MW connection required
├── Grid upgrade cost: €500,000 - €2,000,000
└── Monthly demand charges: €15,000 - €50,000

Distributed Swap Stations:
├── 5 swap stations × 50 kW charging each = 250 kW total
├── Batteries charged 24/7 at optimal rate
├── Grid connection per station: 100 kW (modest)
├── No demand spikes (batteries buffer load)
├── V2G revenue from stored batteries
└── Monthly grid cost: €5,000 - €10,000
```

---

## 2. The Small Battery + Frequent Swap Solution

### 2.1 Core Principle

> **Match battery size to operational segment, not total daily range.**

A city bus doesn't need 400 kWh if it passes a swap station every 50-100 km. A delivery van doesn't need 150 kWh if it returns to a hub 2-3 times per day.

```
OPERATIONAL MATCHING
═══════════════════════════════════════════════════════════════════════════

City Bus Route: 250 km daily
├── Traditional: 400 kWh battery, charge overnight
└── Optimized: 100 kWh battery, swap every 80-100 km (3 swaps/day)

Regional Bus Route: 400 km daily
├── Traditional: 500 kWh battery, charge overnight + opportunity
└── Optimized: 150 kWh battery, swap at each terminal (2-3 swaps/day)

Delivery Van: 150 km daily, multi-stop
├── Traditional: 150 kWh battery, charge overnight
└── Optimized: 50 kWh battery, swap at urban hub (2 swaps/day)

Urban Truck: 120 km daily
├── Traditional: 300 kWh battery, charge overnight
└── Optimized: 100 kWh battery, swap at logistics center (1-2 swaps/day)

Long-haul Truck: 800 km daily
├── Traditional: 600 kWh battery, MCS charging every 300 km
└── Optimized: 150 kWh × 4, highway swap every 200 km (3-4 swaps/day)
```

### 2.2 Vehicle-Specific Battery Sizing

| Vehicle Type | Traditional | Small Battery | Swap Frequency | Swap Time | Daily Downtime |
|--------------|-------------|---------------|----------------|-----------|----------------|
| City Bus (12m) | 400 kWh | 100 kWh | Every 100 km | 5 min | 15-20 min |
| Regional Bus (15m) | 500 kWh | 150 kWh | Every 150 km | 5 min | 10-15 min |
| Delivery Van | 150 kWh | 50 kWh | 2-3× daily | 3 min | 6-9 min |
| Urban Truck (16t) | 300 kWh | 100 kWh | Every 80 km | 6 min | 12-18 min |
| Long-haul Truck (40t) | 600 kWh | 150 kWh × 4 | Every 200 km | 10 min | 30-40 min |

### 2.3 Operational Time Advantage

```
VEHICLE AVAILABILITY COMPARISON
═══════════════════════════════════════════════════════════════════════════

City Bus - Traditional:
├── Service hours: 05:00 - 23:00 (18 hours)
├── Return to depot: 23:00
├── Charging: 23:30 - 02:00 (2.5 hours)
├── Available: 05:00
└── UTILIZATION: 18/24 = 75%

City Bus - Swap Model:
├── Service hours: 04:00 - 00:00 (20 hours)
├── Swap stops: 3 × 5 min = 15 min (during route)
├── No depot charging time
├── Available: Immediately after shift
└── UTILIZATION: 20/24 = 83% (+8% increase)

Delivery Van - Traditional:
├── Routes: 07:00 - 19:00 (12 hours)
├── Return to depot: 19:00
├── Charging: 19:30 - 23:30 (4 hours)
└── UTILIZATION: 12/24 = 50%

Delivery Van - Swap Model:
├── Routes: 06:00 - 22:00 (16 hours, two shifts possible)
├── Hub swaps: 2 × 3 min = 6 min
└── UTILIZATION: 16/24 = 67% (+17% increase)
```

---

## 3. Total Cost of Ownership Analysis

### 3.1 Bus Fleet: 50 Vehicles, 5-Year Horizon

```
TCO COMPARISON: 50 CITY BUSES OVER 5 YEARS
═══════════════════════════════════════════════════════════════════════════

                          TRADITIONAL          SMALL + SWAP
                          ───────────          ────────────
BATTERIES
Vehicle batteries         €3,000,000           €750,000
Battery pool              -                    €1,500,000
Subtotal                  €3,000,000           €2,250,000

INFRASTRUCTURE
Depot charging (200kW×50) €500,000             -
Swap stations (5×)        -                    €1,000,000
Grid upgrades             €300,000             €50,000
Subtotal                  €800,000             €1,050,000

OPERATIONS (5 years)
Electricity (depot rate)  €1,500,000           €1,200,000
Demand charges            €750,000             €100,000
Maintenance               €200,000             €150,000
Subtotal                  €2,450,000           €1,450,000

REPLACEMENT
Battery replacement Y5    €2,100,000           €600,000
Equipment replacement     €100,000             €150,000
Subtotal                  €2,200,000           €750,000

═══════════════════════════════════════════════════════════════════════════
TOTAL 5-YEAR TCO          €8,450,000           €5,500,000
                          ───────────          ────────────
SAVINGS                   -                    €2,950,000 (35%)
```

### 3.2 Additional Revenue Streams

The swap model enables revenue streams impossible with traditional depot charging:

```
V2G REVENUE FROM BATTERY POOL
═══════════════════════════════════════════════════════════════════════════

Battery Pool: 100 × 100 kWh = 10 MWh storage capacity
├── Available for V2G: ~6 MWh (60% of pool not in vehicles)
├── Frequency regulation: €5-15/MWh/hour
├── Peak shaving: €50-100/MWh
├── Demand response: €10-30/event
│
├── Conservative annual revenue: €30,000
├── Optimistic annual revenue: €80,000
└── 5-year additional revenue: €150,000 - €400,000
```

### 3.3 Hidden Benefits

| Benefit | Traditional | Swap Model | Value |
|---------|-------------|------------|-------|
| Extra passengers (bus) | 0 | +18/bus | €500/day revenue |
| Extra cargo (truck) | 0 | +2,700 kg | Higher utilization |
| Vehicle availability | 75% | 83% | +1 route/day possible |
| Battery life | 5-6 years | 8+ years | Reduced replacement |
| Grid stress | High peak | Smooth | Lower demand charges |
| V2G capability | Limited | Full pool | Revenue stream |

---

## 4. Infrastructure Network Design

### 4.1 Station Placement Strategy

```
SWAP STATION NETWORK: CITY BUS SYSTEM
═══════════════════════════════════════════════════════════════════════════

Deployment Model: Strategic placement at natural stopping points

                    ┌─────────────────┐
                    │   TERMINAL A    │ ← Swap station
                    │   (end of line) │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │   ROUTE 1        ROUTE 2        ROUTE 3        │
    │   15 km          18 km          12 km          │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  CENTRAL HUB    │ ← Swap station
                    │  (interchange)  │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │   ROUTE 4        ROUTE 5        ROUTE 6        │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   TERMINAL B    │ ← Swap station
                    └─────────────────┘

COVERAGE:
• 3 swap stations cover 6 routes
• Each bus passes swap station every ~30-50 km
• Natural integration with existing schedule
• No additional stops required (swap during layover)
```

### 4.2 Highway Truck Network

```
HIGHWAY SWAP NETWORK: LONG-HAUL TRUCKS
═══════════════════════════════════════════════════════════════════════════

                 CITY A ←───200km───→ SWAP 1 ←───200km───→ SWAP 2
                    │                    │                    │
                    │                    │                    │
                    ▼                    ▼                    ▼
               [LOGISTICS]          [REST AREA]          [REST AREA]
               [  CENTER ]          [+ SWAP   ]          [+ SWAP   ]
                    │                    │                    │
                    │                    │                    │
                 SWAP 3 ←───200km───→ SWAP 4 ←───200km───→ CITY B
                    │                    │                    │
                    ▼                    ▼                    ▼
               [TRUCK STOP]          [TRUCK STOP]         [LOGISTICS]
               [+ SWAP    ]          [+ SWAP    ]         [  CENTER ]

SPACING: ~200 km between stations (matches 150 kWh × 4 pack range)
INTEGRATION: Co-locate with existing rest areas/truck stops
CAPACITY: Each station serves ~50 trucks/day
```

### 4.3 Urban Delivery Network

```
URBAN DELIVERY HUB NETWORK
═══════════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────────┐
                    │              CITY CENTER                 │
                    │                                         │
                    │     ┌─────┐         ┌─────┐            │
                    │     │HUB 1│         │HUB 2│            │
                    │     │NORTH│         │EAST │            │
                    │     └──┬──┘         └──┬──┘            │
                    │        │               │               │
                    │   ┌────┴────┬─────────┴────┐          │
                    │   │         │              │          │
                    │   ▼         ▼              ▼          │
                    │  ZONE 1   ZONE 2        ZONE 3        │
                    │   │         │              │          │
                    │   └────┬────┴─────────┬────┘          │
                    │        │               │               │
                    │     ┌──┴──┐         ┌──┴──┐            │
                    │     │HUB 3│         │HUB 4│            │
                    │     │SOUTH│         │WEST │            │
                    │     └─────┘         └─────┘            │
                    │                                         │
                    └─────────────────────────────────────────┘

MODEL:
• 4 urban hubs, each covers 2-3 delivery zones
• Van visits hub between delivery rounds
• Swap time: 3 minutes (smaller battery)
• Hub also serves as package sorting point (dual purpose)
```

---

## 5. Battery Pool Economics

### 5.1 Pool Sizing

```
OPTIMAL POOL SIZE CALCULATION
═══════════════════════════════════════════════════════════════════════════

50-Bus Fleet Example:
├── Batteries in vehicles: 50
├── Batteries charging at stations: 20 (40% buffer)
├── Batteries in transit (to/from repair): 5
├── Reserve for peak demand: 15
├── Reserve for maintenance: 10
│
└── TOTAL POOL SIZE: 100 batteries (2:1 ratio)

UTILIZATION:
├── Each battery: 3-4 cycles per day (across different vehicles)
├── Pool turns over: 3× per day
├── Average SoC: 50-70% (shallow cycling)
└── Battery stress: Much lower than single deep cycle
```

### 5.2 Charging Optimization

```
POOL CHARGING STRATEGY
═══════════════════════════════════════════════════════════════════════════

TIME-OF-USE OPTIMIZATION:

         DEMAND │                    ┌──────┐
                │      ┌──────┐      │PEAK  │      ┌──────┐
                │      │      │      │      │      │      │
                │ ┌────┤      ├──────┤      ├──────┤      ├────┐
                │ │    │      │      │      │      │      │    │
                │ │    │      │      │      │      │      │    │
                └─┴────┴──────┴──────┴──────┴──────┴──────┴────┴─→ TIME
                  00   06     09     12     15     18     21   24

CHARGING:   ████████                              ████████████
            (off-peak)                            (off-peak)

V2G:                   ░░░░░░░░░░░░░░░░░░░░░░░░░░░
                       (discharge during peak)

RESULT:
• Charge at €0.08/kWh (night rate)
• Avoid €0.25/kWh (peak rate)
• Earn V2G revenue during peak
• NET EFFECTIVE RATE: €0.05/kWh or lower
```

### 5.3 Health-Based Dispatch

```
AI-OPTIMIZED BATTERY DISPATCH
═══════════════════════════════════════════════════════════════════════════

BATTERY HEALTH SCORES (0-100):

Battery Pool Status:
├── [BAT-001] Health: 98, SoC: 85%  ← Priority for demanding routes
├── [BAT-002] Health: 95, SoC: 72%  ← Standard routes
├── [BAT-003] Health: 92, SoC: 80%  ← Standard routes
├── [BAT-004] Health: 87, SoC: 65%  ← Light-duty routes
├── [BAT-005] Health: 75, SoC: 90%  ← Urban only, flag for inspection
├── [BAT-006] Health: 68, SoC: 45%  ← RETIRE: Send to recycling
└── ...

DISPATCH ALGORITHM:
1. Sort available batteries by health score
2. Match route demands (distance, elevation, temperature)
3. High-demand routes get high-health batteries
4. Low-demand routes "exercise" lower-health batteries
5. Continuous learning improves predictions
```

---

## 6. Environmental Impact

### 6.1 Battery Lifecycle Improvement

```
LIFECYCLE COMPARISON
═══════════════════════════════════════════════════════════════════════════

TRADITIONAL (400 kWh, deep cycling):
├── Cycle depth: 80% DoD daily
├── Cycle life: ~3,000 cycles to 80% capacity
├── Calendar life: ~8 years
├── EFFECTIVE LIFE: 5-6 years (whichever comes first)
├── Energy throughput: 400 × 0.8 × 3,000 = 960 MWh lifetime
└── Total battery needed: 50 buses × 400 kWh = 20 MWh

SMALL + SWAP (100 kWh, shallow cycling):
├── Cycle depth: 30% DoD per swap
├── Cycle life: ~6,000+ cycles to 80% capacity
├── Calendar life: ~10 years (less stress)
├── EFFECTIVE LIFE: 8+ years
├── Energy throughput: 100 × 0.3 × 6,000 = 180 MWh per battery
├── Pool throughput: 100 batteries × 180 = 18,000 MWh
└── Total battery needed: 100 × 100 kWh = 10 MWh

MATERIAL EFFICIENCY:
Traditional: 960 MWh lifetime / 20 MWh battery = 48× throughput
Swap model: 18,000 MWh lifetime / 10 MWh battery = 1,800× throughput

→ SWAP MODEL: 37× more energy delivered per kg of battery material
```

### 6.2 Grid Integration Benefits

```
GRID IMPACT COMPARISON
═══════════════════════════════════════════════════════════════════════════

TRADITIONAL DEPOT CHARGING:

  GRID    │ ████████████████████████████████████████████████
  LOAD    │ ████████████████████████████████████████████████
          │ ████████████████████████████████████████████████
          │                         │
          │ ────────────────────────┼────────────────────── BASE LOAD
          │                    ▲    │    ▲
          │                    │    │    │ 10 MW spike
          │                    │    │    │ when buses return
          └────────────────────┴────┴────┴─────────────────→ TIME
                              22:00  23:00

SWAP MODEL WITH V2G:

  GRID    │                    ▲
  LOAD    │                    │ V2G discharge
          │ ───────────────────┼─────────────────────────── BASE LOAD
          │                    │
          │ ████████████████████████████████████████████████
          │ ████████████████████████████████████████████████ Smooth
          │ ████████████████████████████████████████████████ charging
          └────────────────────────────────────────────────→ TIME
            Batteries charge slowly 24/7, discharge at peak
```

### 6.3 Reduced Manufacturing Impact

| Factor | Traditional | Swap Model | Improvement |
|--------|-------------|------------|-------------|
| Battery material per fleet | 20 MWh | 10 MWh | 50% less |
| Lifetime energy per kg | 48 MWh/MWh | 1,800 MWh/MWh | 37× better |
| Replacement frequency | Every 5-6 years | Distributed | Smoother supply |
| Second-life potential | Variable condition | Uniform health tracking | Easier repurposing |

---

## 7. Modular Battery Architecture: EK-BAT Family

### 7.1 Design Philosophy

Just as EK3 charger modules enable any power level from 3 kW to 3 MW, EK-BAT battery modules enable any vehicle from van to truck with the same building blocks.

```
MODULAR BATTERY PHILOSOPHY
═══════════════════════════════════════════════════════════════════════════

EK3 CHARGER MODULES               EK-BAT BATTERY MODULES
───────────────────────           ────────────────────────
• 3.3 kW base unit                • 25 kWh base unit
• Stack to any power              • Stack to any capacity
• Hot-swappable                   • Robot-swappable
• Swarm intelligence              • BMS swarm coordination
• Distributed sparing             • Pool-based redundancy

ONE ECOSYSTEM FOR CHARGING AND STORAGE
```

### 7.2 EK-BAT Module Family

| Module | Capacity | Weight | Dimensions | Primary Use |
|--------|----------|--------|------------|-------------|
| EK-BAT-25 | 25 kWh | 150 kg | 600×400×300 mm | Vans, small trucks |
| EK-BAT-50 | 50 kWh | 300 kg | 900×600×300 mm | Buses, medium trucks |
| EK-BAT-100 | 100 kWh | 600 kg | 1200×800×400 mm | Heavy buses, long-haul |

### 7.3 Vehicle Configurations

```
VEHICLE BATTERY CONFIGURATIONS
═══════════════════════════════════════════════════════════════════════════

DELIVERY VAN (50 kWh):
┌─────────────────────────────────────────────────┐
│                     VAN                          │
│  ┌────────────┐                                 │
│  │ EK-BAT-50  │  Single module, rear underbody  │
│  │   50 kWh   │                                 │
│  └────────────┘                                 │
└─────────────────────────────────────────────────┘

CITY BUS (100 kWh):
┌─────────────────────────────────────────────────┐
│                    BUS                           │
│  ┌────────────┐  ┌────────────┐                 │
│  │ EK-BAT-50  │  │ EK-BAT-50  │  2 modules     │
│  │   50 kWh   │  │   50 kWh   │  center floor   │
│  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────┘

LONG-HAUL TRUCK (600 kWh):
┌─────────────────────────────────────────────────┐
│                   TRUCK                          │
│  ┌────────────┐  ┌────────────┐                 │
│  │EK-BAT-100  │  │EK-BAT-100  │  Left side     │
│  │   100 kWh  │  │   100 kWh  │                 │
│  └────────────┘  └────────────┘                 │
│  ┌────────────┐  ┌────────────┐                 │
│  │EK-BAT-100  │  │EK-BAT-100  │  Right side    │
│  │   100 kWh  │  │   100 kWh  │                 │
│  └────────────┘  └────────────┘                 │
│                                                  │
│  Total: 4 × 100 kWh = 400 kWh usable           │
│  Swap: All 4 in parallel (10 minutes)           │
└─────────────────────────────────────────────────┘
```

---

## 8. Integration with Elektrokombinacija Ecosystem

### 8.1 Unified Swap Station

The swap station handles BOTH vehicle batteries AND EK3 charger modules:

```
DUAL-PURPOSE SWAP STATION
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                         SWAP STATION                                     │
│                                                                         │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐│
│  │    VEHICLE BAY          │    │      INFRASTRUCTURE BAY              ││
│  │                         │    │                                      ││
│  │  ┌─────────────────┐   │    │  ┌─────────────────────────────┐    ││
│  │  │   BUS/TRUCK     │   │    │  │    EK3 CHARGER RACK         │    ││
│  │  │   ▓▓▓▓▓▓▓▓▓▓    │   │    │  │    ┌───┐┌───┐┌───┐...      │    ││
│  │  └─────────────────┘   │    │  │    │EK3││EK3││EK3│         │    ││
│  │         ↕               │    │  │    └───┘└───┘└───┘         │    ││
│  │  ┌─────────────────┐   │    │  └─────────────────────────────┘    ││
│  │  │   GANTRY ROBOT  │   │    │              ↕                       ││
│  │  │  (battery swap) │   │    │  ┌─────────────────────────────┐    ││
│  │  └─────────────────┘   │    │  │    6-AXIS ROBOT             │    ││
│  │                         │    │  │    (module swap)            │    ││
│  └─────────────────────────┘    │  └─────────────────────────────┘    ││
│                                  │                                      ││
│  ┌───────────────────────────────┴──────────────────────────────────┐ ││
│  │              BATTERY + MODULE STORAGE                              │ ││
│  │  [EK-BAT][EK-BAT][EK-BAT][CHG][CHG]    [EK3][EK3][EK3][EK3]     │ ││
│  └────────────────────────────────────────────────────────────────────┘ ││
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

WORKFLOW:
1. Vehicle arrives
2. Gantry robot swaps vehicle battery (5 min)
3. SIMULTANEOUSLY: 6-axis robot checks EK3 module health
4. If needed: 6-axis robot swaps degraded EK3 module (40 sec)
5. Vehicle departs with fresh battery AND healthy charger
```

### 8.2 Fleet Logistics Integration

Defective EK3 modules AND retired EK-BAT batteries travel via the same fleet logistics network:

```
UNIFIED LOGISTICS NETWORK
═══════════════════════════════════════════════════════════════════════════

                    SWAP STATION
                         │
          ┌──────────────┴──────────────┐
          │                              │
    [Degraded EK3]              [Retired EK-BAT]
          │                              │
          └──────────────┬───────────────┘
                         │
                    BUS CARGO BAY
                    (return trip)
                         │
                         ▼
                    DEPOT / HUB
                         │
          ┌──────────────┴──────────────┐
          │                              │
    [EK3 Repair]                [EK-BAT Second Life]
    [Workshop ]                 [or Recycling      ]
          │                              │
          ▼                              ▼
    [Fresh EK3]                 [Refurbished/New EK-BAT]
          │                              │
          └──────────────┬───────────────┘
                         │
                    BUS CARGO BAY
                    (outbound trip)
                         │
                         ▼
                    SWAP STATION

RESULT: Zero dedicated logistics vehicles for maintenance
```

---

## 9. Implementation Roadmap

### Phase 1: Pilot (12 months)
- 5 buses with 100 kWh batteries
- 2 swap stations
- 15-battery pool
- Single city deployment
- Metrics: swap time, reliability, driver acceptance

### Phase 2: City Fleet (24 months)
- 50 buses converted
- 5 swap stations (strategic terminals)
- 100-battery pool
- V2G integration
- Metrics: TCO validation, grid benefits

### Phase 3: Multi-Modal (36 months)
- Add delivery vans (20 vehicles)
- Add urban trucks (10 vehicles)
- Urban hub network (4 hubs)
- Cross-vehicle battery standardization
- Metrics: Pool utilization, multi-vehicle efficiency

### Phase 4: Regional Expansion (48 months)
- Regional buses added
- Highway truck corridor
- Multi-city network
- Inter-operator battery sharing
- Metrics: Network effects, scale economics

---

## 10. Conclusion

The small battery + frequent swap model represents a fundamental rethinking of electric heavy vehicle operations. By matching battery size to operational needs rather than total daily range, we achieve:

1. **Weight savings**: 1,800-2,700 kg freed for payload
2. **Cost reduction**: 31-35% lower 5-year TCO
3. **Higher utilization**: 8-17% more vehicle availability
4. **Grid benefits**: Smooth load profile, V2G revenue
5. **Environmental gains**: 37× more energy per kg of battery material
6. **Unified ecosystem**: Same swap infrastructure for batteries AND charger modules

This is not just an incremental improvement—it's a paradigm shift that leverages Elektrokombinacija's core modularity philosophy to transform the entire heavy vehicle electrification value chain.

---

*Document version: 1.0*
*Last updated: 2026-01-04*
*Author: Elektrokombinacija Technical Team*
