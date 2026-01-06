# EK-BAT Battery Module Standard

## Overview

The EK-BAT family of standardized battery modules enables the small-battery-frequent-swap paradigm for heavy commercial vehicles. Three module sizes cover all vehicle types from delivery vans to long-haul trucks.

```
EK-BAT FAMILY: ONE STANDARD FOR ALL HEAVY VEHICLES
═══════════════════════════════════════════════════════════════════════════

EK-BAT-25          EK-BAT-50          EK-BAT-100
───────────        ───────────        ───────────
25 kWh             50 kWh             100 kWh
150 kg             300 kg             600 kg

Vans               Buses              Heavy trucks
Small trucks       Medium trucks      Long-haul
```

---

## Module Specifications

### EK-BAT-25 (Van Module)

| Parameter | Specification |
|-----------|---------------|
| **Capacity** | 25 kWh |
| **Voltage** | 400V nominal (350-450V range) |
| **Weight** | 150 kg |
| **Dimensions** | 600 × 400 × 300 mm |
| **Energy density** | 167 Wh/kg |
| **Chemistry** | LFP (LiFePO4) |
| **C-rate (charge)** | 2C (50 kW max) |
| **C-rate (discharge)** | 3C (75 kW max) |
| **Cycle life** | >4,000 cycles @ 80% DoD |
| **Calendar life** | 10 years |
| **Cooling** | Liquid (shared loop) |
| **Operating temp** | -20°C to +55°C |
| **IP rating** | IP67 |
| **BMS** | Distributed swarm-ready |

**Primary applications:**
- Delivery vans (2 modules = 50 kWh)
- Small trucks (3.5t class)
- Micro-transit vehicles

### EK-BAT-50 (Bus Module)

| Parameter | Specification |
|-----------|---------------|
| **Capacity** | 50 kWh |
| **Voltage** | 400V nominal (350-450V range) |
| **Weight** | 300 kg |
| **Dimensions** | 900 × 600 × 300 mm |
| **Energy density** | 167 Wh/kg |
| **Chemistry** | LFP (LiFePO4) |
| **C-rate (charge)** | 2C (100 kW max) |
| **C-rate (discharge)** | 3C (150 kW max) |
| **Cycle life** | >4,000 cycles @ 80% DoD |
| **Calendar life** | 10 years |
| **Cooling** | Liquid (shared loop) |
| **Operating temp** | -20°C to +55°C |
| **IP rating** | IP67 |
| **BMS** | Distributed swarm-ready |

**Primary applications:**
- City buses (2 modules = 100 kWh)
- Regional buses (3 modules = 150 kWh)
- Medium trucks (7.5-16t class)

### EK-BAT-100 (Heavy Module)

| Parameter | Specification |
|-----------|---------------|
| **Capacity** | 100 kWh |
| **Voltage** | 800V nominal (700-900V range) |
| **Weight** | 600 kg |
| **Dimensions** | 1200 × 800 × 400 mm |
| **Energy density** | 167 Wh/kg |
| **Chemistry** | LFP (LiFePO4) |
| **C-rate (charge)** | 2C (200 kW max) |
| **C-rate (discharge)** | 3C (300 kW max) |
| **Cycle life** | >4,000 cycles @ 80% DoD |
| **Calendar life** | 10 years |
| **Cooling** | Liquid (shared loop) |
| **Operating temp** | -20°C to +55°C |
| **IP rating** | IP67 |
| **BMS** | Distributed swarm-ready |

**Primary applications:**
- Long-haul trucks (4 modules = 400 kWh)
- Heavy buses (articulated, double-decker)
- Mining/construction vehicles

---

## Mechanical Interface

### Robot Grip Points

```
EK-BAT-50 TOP VIEW (Robot Interface)
═══════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │  ◉                                                      ◉  │
    │  GRIP-1                                              GRIP-2 │
    │  M10 insert                                        M10 insert│
    │                                                             │
    │                    ┌───────────────┐                        │
    │                    │   ALIGNMENT   │                        │
    │                    │    CONES      │                        │
    │                    │   ◇     ◇    │                        │
    │                    └───────────────┘                        │
    │                                                             │
    │  ◉                                                      ◉  │
    │  GRIP-3                                              GRIP-4 │
    │  M10 insert                                        M10 insert│
    └─────────────────────────────────────────────────────────────┘

GRIPPER SPACING:
EK-BAT-25: 400 × 200 mm (4-point)
EK-BAT-50: 700 × 400 mm (4-point)
EK-BAT-100: 1000 × 600 mm (4-point)
```

### Electrical Connector

```
POWER CONNECTOR (Rear Panel)
═══════════════════════════════════════════════════════════════════════════

    ┌───────────────────────────────────────────────────────────┐
    │                                                           │
    │   ┌─────────────────────────────────────────────────┐    │
    │   │              POWER CONNECTOR                     │    │
    │   │                                                  │    │
    │   │    ████████████████████████████████████████     │    │
    │   │    ████████  POSITIVE  ████████████████████     │    │
    │   │    ████████████████████████████████████████     │    │
    │   │                                                  │    │
    │   │    ████████████████████████████████████████     │    │
    │   │    ████████  NEGATIVE  ████████████████████     │    │
    │   │    ████████████████████████████████████████     │    │
    │   │                                                  │    │
    │   └─────────────────────────────────────────────────┘    │
    │                                                           │
    │   Type: Anderson SBS350 (EK-BAT-25/50)                   │
    │         REMA DIN 320A (EK-BAT-100)                       │
    │   Mating cycles: >10,000                                  │
    │   Contact resistance: <0.1 mΩ                             │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
```

### Data/BMS Connector

| Parameter | Specification |
|-----------|---------------|
| **Connector type** | Harting Han-Modular 10A |
| **Configuration** | 10-pin |
| **Signals** | CAN-H, CAN-L, GND, 12V, TEMP×2, INTERLOCK, AUX×3 |
| **Mating cycles** | >5,000 |
| **IP rating** | IP67 (mated) |
| **Blind-mate tolerance** | ±3 mm |

### Coolant Quick-Disconnect

| Parameter | Specification |
|-----------|---------------|
| **Connector type** | Stäubli dry-break coupling |
| **Size** | DN12 (EK-BAT-25/50), DN20 (EK-BAT-100) |
| **Flow rate** | 10-30 L/min |
| **Pressure** | 2 bar max |
| **Fluid** | 50/50 water-glycol |
| **Zero-spill** | Yes |
| **Mating cycles** | >50,000 |

### Locking Mechanism

```
MOTORIZED CAM LOCK (all modules)
═══════════════════════════════════════════════════════════════════════════

    UNLOCKED                         LOCKED
    ────────                         ──────
    ┌──────────┐                    ┌──────────┐
    │    ○     │ ← Cam open         │    ●     │ ← Cam engaged
    │   ╱      │                    │    │     │
    │  ╱       │                    │    │     │
    │ ○        │                    │    ●     │
    └──────────┘                    └──────────┘

    ↓ MOTOR ROTATES CAM 90°         ↓ POSITION SENSOR CONFIRMS

SPECIFICATIONS:
├── Motor: 24V DC brushless
├── Lock force: 5 kN (EK-BAT-25), 10 kN (others)
├── Lock/unlock time: <2 seconds
├── Position sensors: Hall effect (redundant)
├── Emergency release: Manual lever (tool required)
└── Fail-safe: Remains locked on power loss
```

---

## BMS Architecture

### Distributed Swarm BMS

Each EK-BAT module contains a fully autonomous BMS that participates in a swarm network.

```
BMS ARCHITECTURE
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                         EK-BAT MODULE BMS                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │
│   │  CELL MONITOR   │   │  CELL MONITOR   │   │  CELL MONITOR   │     │
│   │   (8 cells)     │   │   (8 cells)     │   │   (8 cells)     │     │
│   │  AFE: BQ76952   │   │  AFE: BQ76952   │   │  AFE: BQ76952   │     │
│   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘     │
│            │                     │                     │               │
│            └──────────────┬──────┴──────────────┬──────┘               │
│                           │                     │                       │
│                    ┌──────▼──────┐       ┌──────▼──────┐               │
│                    │   isoSPI    │       │   isoSPI    │               │
│                    └──────┬──────┘       └──────┬──────┘               │
│                           │                     │                       │
│                    ┌──────▼─────────────────────▼──────┐               │
│                    │       MASTER CONTROLLER           │               │
│                    │       STM32G474RET6               │               │
│                    │       ─────────────               │               │
│                    │  • SOC/SOH estimation             │               │
│                    │  • Cell balancing                 │               │
│                    │  • Thermal management             │               │
│                    │  • CAN-FD communication           │               │
│                    │  • Swarm coordination             │               │
│                    │  • Health prediction (AI)         │               │
│                    └──────────────┬─────────────────────┘               │
│                                   │                                     │
│                            ┌──────▼──────┐                             │
│                            │   CAN-FD    │                             │
│                            │  5 Mbps     │                             │
│                            └──────┬──────┘                             │
│                                   │                                     │
└───────────────────────────────────┼─────────────────────────────────────┘
                                    │
                                    ▼
                           TO VEHICLE / SWAP STATION
```

### CAN-FD Protocol

| Message Type | ID Range | Period | Size | Description |
|--------------|----------|--------|------|-------------|
| HEARTBEAT | 0x100-0x1FF | 1 Hz | 8 bytes | Health, SOC, temp |
| CELL_DATA | 0x200-0x2FF | 10 Hz | 64 bytes | All cell voltages |
| THERMAL | 0x300-0x3FF | 10 Hz | 16 bytes | Temperature map |
| STATUS | 0x400-0x4FF | 1 Hz | 32 bytes | Faults, limits |
| COMMAND | 0x500-0x5FF | On demand | 8 bytes | Control commands |
| HEALTH | 0x600-0x6FF | 0.1 Hz | 64 bytes | SOH, predictions |

### Swarm Coordination

```
MULTI-MODULE SWARM (Example: 4 × EK-BAT-100 in truck)
═══════════════════════════════════════════════════════════════════════════

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  EK-BAT-1   │     │  EK-BAT-2   │     │  EK-BAT-3   │     │  EK-BAT-4   │
│  100 kWh    │     │  100 kWh    │     │  100 kWh    │     │  100 kWh    │
│             │     │             │     │             │     │             │
│  SOC: 75%   │     │  SOC: 72%   │     │  SOC: 78%   │     │  SOC: 71%   │
│  Temp: 32°C │     │  Temp: 35°C │     │  Temp: 30°C │     │  Temp: 33°C │
│  Health: 95 │     │  Health: 92 │     │  Health: 97 │     │  Health: 90 │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                                   │
                            CAN-FD BUS (5 Mbps)
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       SWARM ALGORITHMS        │
                    ├──────────────────────────────┤
                    │ • Load balancing (by SOC)    │
                    │ • Thermal balancing          │
                    │ • Health-aware dispatch      │
                    │ • SOC equalization           │
                    │ • Fault isolation            │
                    └──────────────────────────────┘

EXAMPLE: Vehicle requests 400 kW discharge
─────────────────────────────────────────
Module  SOC   Health  Allocation
BAT-1   75%   95      105 kW (26%)
BAT-2   72%   92       98 kW (25%)
BAT-3   78%   97      110 kW (28%)
BAT-4   71%   90       87 kW (22%)
                     ─────────────
                     400 kW total

Allocation optimizes for:
• SOC balancing (higher SOC → higher load)
• Health preservation (lower health → lower load)
• Thermal limits (hotter → lower load)
```

---

## Safety Requirements

### Electrical Isolation

| Parameter | Requirement |
|-----------|-------------|
| **Isolation voltage** | 2500V DC (1 min) |
| **Leakage current** | <1 mA @ 500V DC |
| **Isolation resistance** | >100 MΩ |
| **Interlock** | 24V active-high, fail-safe |

### Thermal Runaway Prevention

```
THERMAL PROTECTION LAYERS
═══════════════════════════════════════════════════════════════════════════

LAYER 1: CELL LEVEL
├── Chemistry: LFP (most stable)
├── Cell design: No cobalt, thermal runaway >250°C
└── Cell monitoring: 1 kHz sampling

LAYER 2: MODULE LEVEL
├── Thermal fuse on each cell string
├── Cell-to-cell thermal barriers
├── Active liquid cooling
└── BMS temperature monitoring (8 sensors minimum)

LAYER 3: PACK LEVEL
├── Steel enclosure (fire-resistant 30 min)
├── Pressure relief vent (directed away from passengers)
├── Gas detection sensor
└── Emergency disconnect (pyrotechnic fuse)

LAYER 4: SYSTEM LEVEL
├── Automatic isolation on fault detection
├── CAN broadcast to all modules/vehicle
├── Station-level fire suppression
└── Emergency services notification
```

### Crash Safety

| Parameter | Requirement | Standard |
|-----------|-------------|----------|
| **Mechanical protection** | 100g shock, 6 directions | ECE R100 |
| **Penetration** | No thermal event from nail penetration | IEC 62660-2 |
| **Crush** | 100 kN crush force, no fire | ECE R100 |
| **Water immersion** | IP67, 1m depth, 30 minutes | IEC 60529 |
| **Fire resistance** | No propagation in 5 minutes | UL 2580 |

---

## Vehicle Compatibility Matrix

| Module | Delivery Van | City Bus | Regional Bus | Urban Truck | Long-haul Truck |
|--------|--------------|----------|--------------|-------------|-----------------|
| **EK-BAT-25** | 2 modules (50 kWh) | - | - | - | - |
| **EK-BAT-50** | - | 2 modules (100 kWh) | 3 modules (150 kWh) | 2 modules (100 kWh) | - |
| **EK-BAT-100** | - | - | 2 modules (200 kWh) | - | 4 modules (400 kWh) |

### Mounting Configurations

```
MOUNTING POSITIONS BY VEHICLE TYPE
═══════════════════════════════════════════════════════════════════════════

DELIVERY VAN:                    CITY BUS:
┌─────────────────────┐         ┌─────────────────────────────────────┐
│       VAN           │         │              BUS (12m)               │
│                     │         │                                      │
│    ┌─────┐ ┌─────┐ │         │  ┌────────┐         ┌────────┐      │
│    │BAT-1│ │BAT-2│ │         │  │ BAT-1  │         │ BAT-2  │      │
│    │25kWh│ │25kWh│ │         │  │ 50kWh  │         │ 50kWh  │      │
│    └─────┘ └─────┘ │         │  └────────┘         └────────┘      │
│      REAR AXLE     │         │         CENTER FLOOR                │
└─────────────────────┘         └─────────────────────────────────────┘

LONG-HAUL TRUCK:
┌───────────────────────────────────────────────────────────────────────┐
│                           TRUCK (40t)                                  │
│                                                                        │
│  ┌────────┐ ┌────────┐                    ┌────────┐ ┌────────┐      │
│  │ BAT-1  │ │ BAT-2  │                    │ BAT-3  │ │ BAT-4  │      │
│  │ 100kWh │ │ 100kWh │      TRAILER       │ 100kWh │ │ 100kWh │      │
│  └────────┘ └────────┘                    └────────┘ └────────┘      │
│   LEFT SIDE                                    RIGHT SIDE             │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Quality & Testing

### Production Testing

| Test | Requirement | Method |
|------|-------------|--------|
| **Capacity** | ±3% of rated | CC-CV cycle, 25°C |
| **Internal resistance** | Per cell spec | 1 kHz AC impedance |
| **Insulation** | >100 MΩ @ 500V | Megger test |
| **CAN communication** | 100% message delivery | Automated test |
| **Cooling circuit** | No leaks @ 3 bar | Pressure test |
| **Locking mechanism** | 10 cycles, no fail | Functional test |

### Lifecycle Testing

| Test | Duration | Acceptance |
|------|----------|------------|
| **Cycle life** | 4,000 cycles @ 80% DoD | >80% capacity retention |
| **Calendar aging** | 1 year @ 45°C, 50% SOC | >95% capacity retention |
| **Thermal shock** | -40°C to +60°C, 100 cycles | No degradation |
| **Vibration** | 200 hours, truck profile | No mechanical failure |
| **Salt spray** | 1,000 hours | No corrosion |

---

## Maintenance & End-of-Life

### Health Monitoring

```
HEALTH SCORE ALGORITHM
═══════════════════════════════════════════════════════════════════════════

Health Score = 0.4 × Capacity + 0.3 × Resistance + 0.2 × Balance + 0.1 × Age

Where:
├── Capacity = (Current capacity / Original capacity) × 100
├── Resistance = (Original resistance / Current resistance) × 100
├── Balance = (1 - Cell voltage spread / Threshold) × 100
└── Age = (Remaining calendar life / Total calendar life) × 100

HEALTH SCORE INTERPRETATION:
├── 90-100: Excellent - deploy to demanding routes
├── 70-89:  Good - standard operation
├── 50-69:  Fair - light duty only, schedule inspection
├── 30-49:  Poor - second-life applications
└── 0-29:   End-of-life - recycle
```

### End-of-Life Pathway

```
EK-BAT LIFECYCLE
═══════════════════════════════════════════════════════════════════════════

FIRST LIFE (Vehicle)
├── 4,000+ cycles
├── 8-10 years
└── Health drops to 70-80%

        │
        ▼

SECOND LIFE (Stationary Storage)
├── Grid storage
├── Solar + battery systems
├── Backup power
├── 3,000+ additional cycles
└── 5-7 more years

        │
        ▼

RECYCLING
├── Li-Fe-P recovery (>95%)
├── Copper recovery (>99%)
├── Aluminum recovery (>99%)
└── Closed-loop to new cells
```

---

## Document Information

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | 2026-01-04 |
| Author | Elektrokombinacija Technical Team |
| Status | Draft |
