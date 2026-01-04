# Rack System Architecture

> **Note:** This is the patent filing version. For living documentation, see [`tehnika/16-custom-rack-system.md`](../../tehnika/16-custom-rack-system.md).

**Document Version:** 1.0
**Date:** 2026-01-04
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. System Overview

### 1.1 Design Philosophy

```
PASSIVE BACKPLANE - "HARDWARE MICROKERNEL"
═══════════════════════════════════════════════════════════════

Inspired by microkernel operating system architecture:

┌─────────────────────────────────────────────────────────────┐
│                    DESIGN PRINCIPLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  In a microkernel OS:                                       │
│  • Kernel does MINIMUM (IPC, scheduling, memory)            │
│  • Services run in user space                               │
│  • Failure in service doesn't crash kernel                  │
│                                                              │
│  In our rack system:                                        │
│  • Backplane does MINIMUM (power routing, CAN routing)      │
│  • Intelligence lives in modules                            │
│  • Module failure doesn't affect backplane                  │
│  • No single point of failure                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

BACKPLANE PROVIDES ONLY:
• DC power bus distribution
• Dual CAN-FD bus routing (redundant)
• Ground plane
• Physical slot structure

BACKPLANE DOES NOT CONTAIN:
• Active logic (no MCU, no FPGA)
• Any intelligence
• Any configuration
• Any single point of failure
```

### 1.2 Key Specifications

```
RACK SYSTEM SPECIFICATIONS
═══════════════════════════════════════════════════════════════

FORM FACTOR:
• Standard 19" rack width
• Height: 42U available, 36U for modules
• Depth: 800mm (standard server rack)

CAPACITY:
• Slots: 84 modules (14 rows × 6 columns per row)
• Power per module: 3.3 kW
• Total rack power: 277 kW (84 × 3.3 kW)

PHYSICAL:
• Weight empty: ~150 kg
• Weight full: ~450 kg (84 × 3.5 kg + structure)
• Cooling: Front-to-back forced air

ELECTRICAL:
• DC bus voltage: 650-900V DC (800V nominal)
• DC bus current: up to 400A per bus bar
• CAN-FD: Dual bus, 5 Mbps data rate
```

### 1.3 3PAR-Inspired Concepts

```
STORAGE CONCEPTS APPLIED TO POWER ELECTRONICS
═══════════════════════════════════════════════════════════════

3PAR CONCEPT          │ EK3 IMPLEMENTATION
══════════════════════╪══════════════════════════════════════════
Wide Striping         │ All 84 modules share load equally
                      │ No "primary" or "secondary" modules
                      │ Load balanced via droop control
──────────────────────┼──────────────────────────────────────────
Distributed Sparing   │ No dedicated spare modules
                      │ Each module runs at ~95% capacity
                      │ 5% headroom = distributed spare
                      │ Any failure: remaining modules absorb
──────────────────────┼──────────────────────────────────────────
Thin Provisioning     │ Modules not needed for current load
                      │ enter low-power standby
                      │ Wake on demand (<100ms)
──────────────────────┼──────────────────────────────────────────
Chunklet Architecture │ 3kW "chunklets" of power
                      │ Granular scaling and replacement
                      │ Single failure = 1.2% capacity loss
──────────────────────┼──────────────────────────────────────────
No Single Point       │ Passive backplane (no active components)
of Failure            │ Dual CAN bus
                      │ Any module can be master (Raft election)
```

---

## 2. Mechanical Design

### 2.1 Rack Structure

```
RACK LAYOUT (FRONT VIEW)
═══════════════════════════════════════════════════════════════

                    ◀──────── 482.6mm (19") ────────▶

     ┌──────────────────────────────────────────────────┐  ▲
U42  │  ░░░░░░░░░░ CABLE MANAGEMENT ░░░░░░░░░░░░░░░░░  │  │
U41  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U40  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  │
U39  │  │ 79 │ │ 80 │ │ 81 │ │ 82 │ │ 83 │ │ 84 │    │  │
     │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    │  │
     ├──────────────────────────────────────────────────┤  │
     │              ...  (12 more rows)  ...           │  │
     ├──────────────────────────────────────────────────┤  │
U7   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  │
U6   │  │  1 │ │  2 │ │  3 │ │  4 │ │  5 │ │  6 │    │ 42U
     │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    │  │
     ├──────────────────────────────────────────────────┤  │
U5   │  ░░░░░░░░░░░ FAN MODULE 1 ░░░░░░░░░░░░░░░░░░░  │  │
U4   │  ░░░░░░░░░░░ FAN MODULE 2 (N+1) ░░░░░░░░░░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U3   │  ░░░░░░░░░ BACKPLANE CONTROLLER ░░░░░░░░░░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U2   │  ░░░░░░░░░ DC BUS DISTRIBUTION ░░░░░░░░░░░░░░  │  │
U1   │  ░░░░░░░░░ INPUT PROTECTION ░░░░░░░░░░░░░░░░░  │  │
     └──────────────────────────────────────────────────┘  ▼


SLOT DIMENSIONS:
• Width: 76mm (6 per 19" row with spacing)
• Height: 88mm (2U per module row)
• Depth: 320mm (module) + 50mm (connector clearance)

ROWS:
• 14 rows of modules (U6-U40)
• 6 modules per row
• Total: 84 module slots
```

### 2.2 Module Slot Design

```
INDIVIDUAL SLOT (CROSS-SECTION)
═══════════════════════════════════════════════════════════════

          ┌───────────────────────────────────────┐
          │           SLOT RAILS                   │
          │  ┌─────────────────────────────────┐  │
          │  │                                 │  │
   AIR ──▶│  │         EK3 MODULE              │  │──▶ AIR
   IN     │  │                                 │  │    OUT
          │  │    (slides in on rails)         │  │
          │  │                                 │  │
          │  └─────────────────────────────────┘  │
          │           ▼                           │
          │    ═══════════════════════════        │
          │         BACKPLANE CONNECTOR           │
          └───────────────────────────────────────┘

RAIL FEATURES:
• Self-aligning guides (±2mm tolerance)
• Conductive surface (grounding before connector mate)
• Low friction (UHMW or similar)
• Captive hardware (no loose screws)

CONNECTOR:
• Blind-mate (module pushed straight back)
• Keyed (prevents wrong module type)
• Staggered pins (ground first, then signal, then power)
```

### 2.3 Airflow Design

```
THERMAL MANAGEMENT - AIRFLOW
═══════════════════════════════════════════════════════════════

SIDE VIEW:
                                            EXHAUST
                                               ▲
    ┌──────────────────────────────────────────┤
    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
    │  │ MOD │ │ MOD │ │ MOD │ │ MOD │  ...  │
    │  │  1  │ │  2  │ │  3  │ │  4  │       │
    │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘       │
    │     │      │      │      │             │
    │     ▲      ▲      ▲      ▲             │
    │     │      │      │      │             │
    │  ═══╧══════╧══════╧══════╧═════════════│
    │              SHARED PLENUM              │
    │  ═══════════════════════════════════════│
    │     ▲      ▲      ▲      ▲             │
    │  ┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐         │
    │  │ FAN ││ FAN ││ FAN ││ FAN │  (N+1)  │
    │  └─────┘└─────┘└─────┘└─────┘         │
    │                 ▲                       │
    │                 │                       │
    └─────────────────┤───────────────────────┘
                   INTAKE
                 (filtered)

COOLING SPECIFICATIONS:
• Total airflow: 2000 CFM (84 modules × ~25 CFM each)
• Fan modules: 2× (N+1 redundancy)
• Each fan module: 4× 120mm fans
• Static pressure: 0.5" H2O
• Filter: G4 grade, replaceable

THERMAL ZONES:
• Zone A (Bottom): U6-U15 (28 modules)
• Zone B (Middle): U16-U27 (36 modules)
• Zone C (Top): U28-U40 (20 modules)
• Each zone: Independent temperature monitoring
```

---

## 3. Backplane Architecture

### 3.1 Minimal Backplane Design

```
BACKPLANE - "HARDWARE MICROKERNEL"
═══════════════════════════════════════════════════════════════

The backplane contains NO active components.
It is purely passive routing:

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   WHAT THE BACKPLANE DOES:                                  │
│   ════════════════════════                                  │
│   • Routes DC bus to each slot (copper bus bars)            │
│   • Routes CAN-A bus to each slot (twisted pair)            │
│   • Routes CAN-B bus to each slot (twisted pair)            │
│   • Provides ground reference                               │
│   • Provides mechanical slot structure                      │
│                                                              │
│   WHAT THE BACKPLANE DOES NOT DO:                           │
│   ════════════════════════════════                          │
│   • No microcontroller                                      │
│   • No logic of any kind                                    │
│   • No power conversion                                     │
│   • No control functions                                    │
│   • No configuration storage                                │
│                                                              │
│   WHY:                                                       │
│   ════                                                       │
│   • Passive = no failure modes                              │
│   • Passive = no firmware to update                         │
│   • Passive = no security vulnerabilities                   │
│   • Passive = 20+ year lifetime                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Power Distribution

```
DC BUS DISTRIBUTION
═══════════════════════════════════════════════════════════════

INPUT (from external AC/DC):
• Voltage: 800V DC nominal (range: 650-900V)
• Current: up to 400A continuous

BUS BAR CONSTRUCTION:
• Material: Copper, 10mm × 50mm cross-section
• Current density: <3 A/mm² (conservative)
• Voltage drop: <1V at full load
• Insulation: Kapton tape + air gap

DISTRIBUTION TOPOLOGY:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   DC+  ═══╤═══╤═══╤═══╤═══╤═══╤═══════════════════════     │
│           │   │   │   │   │   │                             │
│         ┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐                     │
│         │ 1 ││ 2 ││ 3 ││ 4 ││ 5 ││ 6 │  ROW 1              │
│         └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘                     │
│           │   │   │   │   │   │                             │
│   DC-  ═══╧═══╧═══╧═══╧═══╧═══╧═══════════════════════     │
│                                                              │
│   (Repeated for all 14 rows)                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PER-SLOT PROTECTION:
• PTC fuse (resettable): 15A per slot
• Allows module to draw up to 12A continuous
• Trips on overcurrent, auto-resets when cool
• Alternative: eFuse (electronic fuse) for faster response
```

### 3.3 Communication Routing

```
DUAL CAN-FD BUS ROUTING
═══════════════════════════════════════════════════════════════

TOPOLOGY: Star-like (short stubs to each slot)

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   CAN-A_H ═══╤═══╤═══╤═══╤═══╤═══╤═══════ TERM (120Ω)      │
│   CAN-A_L ═══╤═══╤═══╤═══╤═══╤═══╤═══════                  │
│              ├───┼───┼───┼───┼───┤                          │
│            ┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐                  │
│            │ 1 ││ 2 ││ 3 ││ 4 ││ 5 ││ 6 │                  │
│            └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘                  │
│              ├───┼───┼───┼───┼───┤                          │
│   CAN-B_H ═══╧═══╧═══╧═══╧═══╧═══╧═══════ TERM (120Ω)      │
│   CAN-B_L ═══╧═══╧═══╧═══╧═══╧═══╧═══════                  │
│                                                              │
│   (Repeated for all rows, buses continue)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

ROUTING SPECIFICATIONS:
• Stub length: <30cm (max distance from bus to slot)
• Twisted pair: 100Ω differential impedance
• Shielding: Not required (metal rack provides EMI shield)
• Termination: 120Ω at each end of bus (first and last row)

WHY DUAL CAN:
• CAN-A: Normal operations (all traffic)
• CAN-B: Backup (heartbeat only until failover)
• Failover: <10ms if CAN-A fails
• Split-brain prevention: Epoch counter in messages
```

### 3.4 Slot Addressing

```
MODULE ADDRESSING SCHEME
═══════════════════════════════════════════════════════════════

ADDRESS DETECTION (Hardware):
• Each slot has unique resistor divider to GND
• Module ADC reads voltage to determine slot number
• No software configuration needed

RESISTOR CODING:
┌─────────────────────────────────────────────────────────────┐
│ SLOT │ RESISTOR │ VOLTAGE (3.3V ref) │ ADC VALUE (12-bit)  │
├──────┼──────────┼────────────────────┼─────────────────────┤
│   1  │   1.0kΩ  │      0.165V        │       205           │
│   2  │   2.0kΩ  │      0.330V        │       410           │
│   3  │   3.0kΩ  │      0.495V        │       615           │
│  ... │   ...    │       ...          │       ...           │
│  84  │  84.0kΩ  │      2.772V        │      3440           │
└─────────────────────────────────────────────────────────────┘

On module side:
• Fixed 18kΩ pull-up to 3.3V
• ADC reads voltage
• Lookup table maps to slot number
• Module announces slot in HEARTBEAT messages
```

---

## 4. Optional Rack Controller

### 4.1 Controller Role

```
RACK CONTROLLER - OPTIONAL "INIT PROCESS"
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      IMPORTANT                               │
│                                                              │
│   The Rack Controller is OPTIONAL.                          │
│   Modules operate AUTONOMOUSLY without it.                  │
│   It provides convenience features, not core function.      │
│                                                              │
└─────────────────────────────────────────────────────────────┘

WHAT IT PROVIDES:
• Slot inventory (which slots populated)
• Aggregate temperature monitoring
• Fan speed control
• Door open/close sensing
• Uplink to Station Controller (Ethernet)

WHAT IT DOES NOT DO:
• Does not control module power output
• Does not participate in load balancing
• Does not store module configuration
• Not required for charging operations
```

### 4.2 Hardware Specification

```
RACK CONTROLLER HARDWARE
═══════════════════════════════════════════════════════════════

OPTION A: Simple MCU-based (Recommended)
─────────────────────────────────────────
• MCU: STM32F407 or similar (Cortex-M4)
• Memory: 1MB Flash, 192KB RAM
• Interfaces:
  - 1× CAN-FD (listen only on module bus)
  - 1× Ethernet (uplink to Station Controller)
  - 1× I2C (slot presence sensors, temp sensors)
  - GPIO (fan PWM, door switch, LEDs)
• Power: 5V, <5W
• Form factor: 3U module

OPTION B: Industrial PC
───────────────────────
• Advantech UNO-2271G or similar
• Linux-based
• More features but more failure modes
• Consider only for complex deployments


RACK CONTROLLER SCHEMATIC:
┌─────────────────────────────────────────────────────────────┐
│                    RACK CONTROLLER                           │
│                                                              │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐           │
│  │    MCU    │    │  CAN-FD   │    │  Ethernet │           │
│  │ STM32F407 │────│ Transceiver────│    PHY    │───→ RJ45  │
│  │           │    │           │    │           │           │
│  └─────┬─────┘    └───────────┘    └───────────┘           │
│        │                                                     │
│        ├─────────────────────────────────────────┐          │
│        │                                          │          │
│  ┌─────┴─────┐  ┌─────────────┐  ┌─────────────┐│          │
│  │   I2C     │  │  Fan PWM    │  │  GPIO       ││          │
│  │  Sensors  │  │  Outputs    │  │ (switches)  ││          │
│  └───────────┘  └─────────────┘  └─────────────┘│          │
│                                                   │          │
└───────────────────────────────────────────────────┘          │
                                                               │
   To: Slot sensors, temp sensors, fan modules, door switch   │
───────────────────────────────────────────────────────────────┘
```

### 4.3 Controller Functions

```
RACK CONTROLLER SOFTWARE FUNCTIONS
═══════════════════════════════════════════════════════════════

1. SLOT INVENTORY
   ─────────────────────────
   • I2C sensors detect module presence per slot
   • Reports populated slots to Station Controller
   • Detects module insertion/removal events
   • Updates inventory in real-time

2. THERMAL MONITORING
   ─────────────────────────
   • Temperature sensors per row (14 sensors)
   • Inlet temperature sensor
   • Outlet temperature sensor
   • Calculates ΔT across rack

3. FAN CONTROL
   ─────────────────────────
   • PWM control of fan modules
   • PID loop based on:
     - Maximum module temperature
     - Outlet temperature
     - Predicted load (if known)
   • Minimum speed: 20% (audible threshold)
   • Maximum speed: 100% (thermal emergency)
   • N+1 failure: If one fan module fails, other ramps up

4. STATUS REPORTING
   ─────────────────────────
   • Aggregates module status (via CAN listen)
   • Reports to Station Controller via MQTT
   • Topics:
     - rack/{id}/slots - slot inventory
     - rack/{id}/thermal - temperatures
     - rack/{id}/fans - fan status
     - rack/{id}/events - insertions, faults

5. DOOR MONITORING
   ─────────────────────────
   • Front and rear door switches
   • Events: DOOR_OPEN, DOOR_CLOSED
   • Safety interlock: If robot active, door must be closed
```

---

## 5. Power Architecture

### 5.1 Input Stage

```
RACK POWER INPUT
═══════════════════════════════════════════════════════════════

INPUT OPTIONS:

OPTION A: Central AC/DC (External to Rack)
──────────────────────────────────────────
• External PFC + rectifier provides 800V DC to rack
• Rack receives DC only
• Simplest rack design
• Central PFC is single point of failure (unless redundant)

OPTION B: Distributed PFC (Modular AC/DC in Rack)
─────────────────────────────────────────────────
• Dedicated PFC modules in rack (same form factor as EK3)
• Each PFC module: 30kW
• 3× PFC modules for 84 EK3 (N+1 redundancy)
• More complex but more resilient

RECOMMENDATION: Option A with redundant external PFC

INPUT PROTECTION (U1-U2):
• Input fusing: 500A semiconductor fuse
• Surge protection: MOV array
• Pre-charge circuit: Soft-start relay + resistor
• Contactor: For emergency disconnect
• Ground fault detection: Insulation monitor
```

### 5.2 Wide Striping Implementation

```
LOAD DISTRIBUTION - WIDE STRIPING
═══════════════════════════════════════════════════════════════

ALL MODULES SHARE LOAD EQUALLY:
• No "master" module
• No "primary" path
• Each module outputs I_total / N_active

IMPLEMENTATION VIA DROOP CONTROL:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   V_out = V_ref - (R_droop × I_out)                         │
│                                                              │
│   Where:                                                     │
│   • V_ref = 400V (example output setpoint)                  │
│   • R_droop = 0.01Ω (virtual droop resistance)              │
│   • I_out = module output current                           │
│                                                              │
│   Effect: Higher current → slightly lower voltage           │
│           Self-balancing across parallel modules            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

EXAMPLE (84 modules, 280kW load):
• Total current: 280kW / 400V = 700A
• Per module: 700A / 84 = 8.33A
• Droop: 8.33A × 0.01Ω = 0.083V
• V_out actual: 400V - 0.083V = 399.917V
• All modules at essentially same voltage, same current

BENEFITS:
• No central coordinator needed for load balance
• Automatic rebalancing when module fails
• Proven technique from parallel UPS systems
```

### 5.3 Distributed Sparing

```
DISTRIBUTED SPARING - NO DEDICATED SPARES
═══════════════════════════════════════════════════════════════

TRADITIONAL APPROACH (N+1):
• 84 modules + 1 spare (idle)
• Spare sits unused 99% of time
• Spare may fail undetected

OUR APPROACH (DISTRIBUTED):
• All 84 modules active
• Each runs at ~95% capacity
• 5% headroom distributed across all

MATH:
• Normal operation: 84 × 3.15kW = 265kW available
• Module failure: 83 × 3.3kW = 274kW available
• Actually MORE capacity with one failure!

WHY IT WORKS:
1. Modules normally operate slightly derated
2. Single failure: Remaining modules increase output
3. Two failures: Still within capacity
4. Thermal: All modules share heat, no hot-cold cycling

CAPACITY vs FAILURES:
┌─────────────────────────────────────────────────────────────┐
│ FAILURES │ ACTIVE │ CAPACITY @ 95% │ CAPACITY @ 100%       │
├──────────┼────────┼────────────────┼───────────────────────┤
│     0    │   84   │    263 kW      │     277 kW            │
│     1    │   83   │    260 kW      │     274 kW            │
│     2    │   82   │    257 kW      │     271 kW            │
│     3    │   81   │    254 kW      │     267 kW            │
│     5    │   79   │    248 kW      │     261 kW            │
│    10    │   74   │    232 kW      │     244 kW            │
└─────────────────────────────────────────────────────────────┘

Even with 10 failures, rack still delivers 232kW (89% of original).
```

---

## 6. Thermal Management

### 6.1 Cooling Zones

```
THERMAL ZONE ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   ZONE C (TOP)                                              │
│   ══════════════                                            │
│   Slots 65-84 (20 modules)                                  │
│   Hottest zone (heat rises)                                 │
│   Target: <45°C inlet                                       │
│                                                              │
│   ─────────────────────────────────────────────────────     │
│                                                              │
│   ZONE B (MIDDLE)                                           │
│   ════════════════                                          │
│   Slots 29-64 (36 modules)                                  │
│   Moderate temperature                                      │
│   Target: <40°C inlet                                       │
│                                                              │
│   ─────────────────────────────────────────────────────     │
│                                                              │
│   ZONE A (BOTTOM)                                           │
│   ═══════════════                                           │
│   Slots 1-28 (28 modules)                                   │
│   Coolest zone (closest to intake)                          │
│   Target: <35°C inlet                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PER-ZONE SENSING:
• 2× temperature sensors per zone (inlet side)
• Sensors on backplane (I2C to Rack Controller)
• Alert thresholds: Warning @ 50°C, Critical @ 60°C
```

### 6.2 Fan Control

```
FAN CONTROL STRATEGY
═══════════════════════════════════════════════════════════════

FAN MODULES:
• 2× fan modules (N+1 redundant)
• Each module: 4× 120mm fans
• Total airflow capacity: 2000 CFM
• Power consumption: 50-200W (varies with speed)

CONTROL ALGORITHM (PID):
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Target_speed = Kp × (T_max - T_setpoint)                  │
│                + Ki × ∫(T_max - T_setpoint)dt               │
│                + Kd × d(T_max)/dt                           │
│                                                              │
│   Where:                                                     │
│   • T_max = Maximum temperature in any zone                 │
│   • T_setpoint = 40°C (default)                             │
│   • Kp, Ki, Kd = Tuned PID constants                        │
│                                                              │
│   Constraints:                                               │
│   • Minimum speed: 20% (for bearing longevity)              │
│   • Maximum speed: 100%                                      │
│   • Rate limit: 10%/second (avoid acoustic shock)           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PREDICTIVE CONTROL (Optional):
• If load increase expected, pre-increase fan speed
• Uses charging schedule from Station Controller
• Avoids reactive temperature spikes
```

### 6.3 Thermal Migration

```
THERMAL MIGRATION - SWARM BEHAVIOR
═══════════════════════════════════════════════════════════════

When some modules run hotter than others, the swarm
automatically redistributes load:

MECHANISM:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Each module periodically broadcasts:                       │
│   • Current temperature                                     │
│   • Thermal headroom (T_max - T_current)                    │
│   • Requested derating (if approaching limit)               │
│                                                              │
│   Other modules respond by:                                  │
│   • Slightly increasing their output                        │
│   • Compensating for derated peer                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

EXAMPLE:
• Module 72 (Zone C, top) reaches 55°C
• Module 72 requests 20% derating
• 83 other modules each increase by 0.24%
• Total output maintained, thermal balanced

This happens automatically via CAN broadcast.
No central coordinator required.
```

---

## 7. Fault Handling

### 7.1 Module Failure

```
MODULE FAILURE SCENARIOS
═══════════════════════════════════════════════════════════════

SCENARIO 1: Module Goes Offline (No Response)
─────────────────────────────────────────────
Detection:
• Missing HEARTBEAT for 3 consecutive intervals (3 sec)
• Peers mark module as OFFLINE
• Station Controller alerted

Response:
• Remaining modules automatically absorb load
• No central action required
• Module slot electrically isolated (PTC fuse may trip if shorted)

Recovery:
• Robot swap scheduled
• New module auto-discovers, joins swarm
• Load rebalanced within seconds

SCENARIO 2: Module Enters FAULT State
─────────────────────────────────────
Detection:
• Module broadcasts FAULT_ALERT on CAN
• Includes fault type (OCP, OVP, OTP, etc.)

Response:
• Module stops power output
• Module enters safe state
• Peers absorb load
• Alert forwarded to Station Controller

Recovery:
• May self-recover if transient (e.g., OTP cleared after cooldown)
• If persistent, scheduled for robot swap

SCENARIO 3: Module Electrical Short
───────────────────────────────────
Protection:
• Slot PTC fuse trips (15A limit)
• DC bus unaffected
• Shorted module isolated

Recovery:
• PTC resets after cooldown (if short cleared)
• If persistent short, module must be replaced
• Robot swap initiated
```

### 7.2 Backplane Failure

```
BACKPLANE FAILURE (Very Rare)
═══════════════════════════════════════════════════════════════

Because backplane is purely passive, failure modes are limited:

POSSIBLE FAILURES:
┌─────────────────────────────────────────────────────────────┐
│ FAILURE               │ DETECTION             │ IMPACT      │
├───────────────────────┼───────────────────────┼─────────────┤
│ Bus bar connection    │ Voltage drop,         │ Affects 1   │
│ loosening             │ thermal hotspot       │ row only    │
├───────────────────────┼───────────────────────┼─────────────┤
│ CAN trace break       │ Modules in segment    │ Segment     │
│                       │ lose communication    │ isolated    │
├───────────────────────┼───────────────────────┼─────────────┤
│ Slot connector wear   │ Intermittent module   │ 1 slot      │
│                       │ connection            │ only        │
├───────────────────────┼───────────────────────┼─────────────┤
│ Ground fault          │ Insulation monitor    │ Rack        │
│ (insulation damage)   │ alarm                 │ shutdown    │
└─────────────────────────────────────────────────────────────┘

MITIGATION:
• Bus bars torqued to spec during installation
• Annual visual inspection recommended
• CAN bus is redundant (A and B)
• Slot connectors rated for >10,000 cycles
• Insulation monitor for ground fault detection

LIFETIME: 20+ years expected (no wear-out components)
```

### 7.3 Fan Failure

```
FAN FAILURE HANDLING
═══════════════════════════════════════════════════════════════

DETECTION:
• Tachometer feedback per fan
• RPM < 200 = fan failed
• Rack Controller logs event

N+1 REDUNDANCY:
• 2× fan modules, each sufficient alone
• Normal operation: Both at 50%
• Single failure: Remaining at 100%

RESPONSE TO FAILURE:
┌─────────────────────────────────────────────────────────────┐
│ FANS FAILED │ ACTION                                        │
├─────────────┼───────────────────────────────────────────────┤
│     0       │ Normal operation                              │
│     1       │ Remaining fans increase to compensate         │
│             │ Alert: Schedule fan replacement               │
├─────────────┼───────────────────────────────────────────────┤
│     2       │ (from different modules) - still OK           │
│             │ Alert: Urgent fan replacement                 │
├─────────────┼───────────────────────────────────────────────┤
│  1 module   │ Half cooling capacity                         │
│  (4 fans)   │ Modules derate to 50% power                   │
│             │ Alert: Critical - immediate service           │
├─────────────┼───────────────────────────────────────────────┤
│  2 modules  │ No cooling                                    │
│  (8 fans)   │ Emergency shutdown all modules                │
│             │ Alert: Critical - rack offline                │
└─────────────────────────────────────────────────────────────┘

FAN REPLACEMENT:
• Hot-swappable fan modules
• No tools required (captive fasteners)
• <60 second replacement time
```

---

## 8. Robot Interface

### 8.1 Slot Access

```
ROBOT ACCESS REQUIREMENTS
═══════════════════════════════════════════════════════════════

FRONT ACCESS:
• Robot approaches from front of rack
• Door opens automatically (or manually for safety)
• Clear line of sight to all slots

SLOT IDENTIFICATION:
• Each slot has unique LED indicator
  - OFF: Empty
  - GREEN: Healthy, operating
  - YELLOW: Degraded, scheduled for swap
  - RED: Faulted, needs immediate swap
  - BLUE (blinking): Target for current swap operation

MACHINE-READABLE ID:
• QR code on slot frame (backup)
• RFID tag on slot (optional)
• Primary: Vision system reads slot number from LED pattern

POSITIONING AIDS:
• V-groove alignment guides on slot rails
• ±2mm tolerance for robot gripper
• Force feedback during insertion
• Electrical confirmation: MOD_PRESENT signal
```

### 8.2 Insertion Guidance

```
MODULE INSERTION SEQUENCE
═══════════════════════════════════════════════════════════════

ROBOT PROCEDURE:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  1. POSITION                                                │
│     • Robot moves to target slot X                          │
│     • Camera verifies slot number                           │
│     • Confirm slot LED is BLUE (target)                     │
│                                                              │
│  2. PRE-INSERTION                                           │
│     • Slot power disabled (confirmed via CAN)               │
│     • Robot aligns module with slot guides                  │
│     • Module held at slot entrance                          │
│                                                              │
│  3. INSERTION                                               │
│     • Robot pushes module into slot                         │
│     • Force sensor monitors insertion force                 │
│     • Expected: <50N throughout                             │
│     • If >50N: Stop, retry alignment                        │
│                                                              │
│  4. LATCHING                                                │
│     • Module reaches end of travel                          │
│     • Spring latch engages (audible click)                  │
│     • Backplane connector fully mated                       │
│     • MOD_PRESENT signal active                             │
│                                                              │
│  5. VERIFICATION                                            │
│     • Station Controller enables slot power                 │
│     • Module sends HEARTBEAT within 5 seconds               │
│     • Slot LED turns GREEN                                  │
│     • Robot releases, returns to home                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8.3 Safety Interlocks

```
ROBOT SAFETY SYSTEM
═══════════════════════════════════════════════════════════════

INTERLOCK CONDITIONS:
┌─────────────────────────────────────────────────────────────┐
│ CONDITION                │ ROBOT ACTION                     │
├──────────────────────────┼──────────────────────────────────┤
│ Door open                │ Cannot start swap operation      │
│                          │ Robot pauses if door opens       │
├──────────────────────────┼──────────────────────────────────┤
│ E-stop pressed           │ Robot stops immediately          │
│                          │ Must be manually reset           │
├──────────────────────────┼──────────────────────────────────┤
│ Slot power enabled       │ Cannot extract module            │
│                          │ Must request disable first       │
├──────────────────────────┼──────────────────────────────────┤
│ Module not in STANDBY    │ Cannot extract                   │
│                          │ Wait for safe shutdown           │
├──────────────────────────┼──────────────────────────────────┤
│ Light curtain triggered  │ Robot pauses                     │
│ (if installed)           │ Resumes when cleared             │
└─────────────────────────────────────────────────────────────┘

SAFETY RATINGS:
• Category 3 / PLd per ISO 13849 (minimum)
• Consider Category 4 / PLe for unattended operation
• Annual safety system verification required
```

---

## 9. Installation and Commissioning

### 9.1 Site Requirements

```
INSTALLATION REQUIREMENTS
═══════════════════════════════════════════════════════════════

ELECTRICAL:
• 3-phase 400V AC, 400A service (per rack)
• Grounding per local electrical code
• Emergency stop circuit provision

MECHANICAL:
• Floor loading: 500 kg/m² minimum
• Rack footprint: 600 × 800 mm
• Service clearance: 1.2m front, 0.6m rear

ENVIRONMENTAL:
• Temperature: 15-35°C (operating)
• Humidity: 20-80% RH, non-condensing
• Altitude: <2000m (derate above)

COOLING:
• Inlet air: <35°C
• Heat rejection: 10-15 kW per rack (at full load)
• Ensure adequate room air handling
```

### 9.2 Commissioning Procedure

```
COMMISSIONING STEPS
═══════════════════════════════════════════════════════════════

1. PRE-POWER CHECKS
   □ Verify all connections (DC bus, CAN, sensors)
   □ Torque check on bus bar connections
   □ Verify ground continuity
   □ Insulation resistance test (>1MΩ)

2. BACKPLANE POWER-UP
   □ Enable DC bus (no modules installed)
   □ Verify 800V on bus bars
   □ Check for abnormal noise/smell
   □ Verify CAN buses active (termination OK)

3. CONTROLLER ACTIVATION
   □ Power up Rack Controller
   □ Verify Ethernet uplink
   □ Check fan spin-up
   □ Verify temperature sensors reading

4. MODULE INSTALLATION (One at a time for first 6)
   □ Install module in slot 1
   □ Verify HEARTBEAT received
   □ Check power output capability
   □ Repeat for slots 2-6 (first row)

5. FULL POPULATION
   □ Install remaining modules
   □ Run load test (progressively increase)
   □ Monitor thermals, verify balance

6. FINAL VERIFICATION
   □ Full load test (277kW) for 1 hour
   □ Record baseline performance data
   □ Document all serial numbers
   □ Handover to operations
```

---

## 10. Revision History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2026-01-04 | Initial document           |

---

## References

- 3PAR InServ Architecture Technical White Paper
- HPE 3PAR StoreServ Storage concepts and design
- Data Center Design Guide (APC/Schneider)
- ISO 13849-1: Safety of machinery - Safety-related parts of control systems
- ASHRAE TC 9.9: Data Center Cooling Guidelines
- CAN in Automation: CAN-FD Specification
