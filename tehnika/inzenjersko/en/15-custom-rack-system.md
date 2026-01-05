# EK3 Custom Rack System

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-016 |
| Version | 1.1 |
| Date | 2026-01-04 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Rack System Overview

### 1.1 Microkernel Philosophy Applied to Rack

The EK3 rack system extends microkernel principles from firmware to hardware:

```
┌─────────────────────────────────────────────────────────────────┐
│             Microkernel Mapping: OS to Rack                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    OS Microkernel                  EK3 Rack                      │
│    ──────────────                  ────────                      │
│                                                                  │
│    Minimal kernel          →       Passive backplane             │
│    (only scheduling,               (only power + CAN routing,    │
│     IPC, hw access)                 no active logic)             │
│                                                                  │
│    User processes          →       EK3 modules                   │
│    (isolated,                      (autonomous, isolated,        │
│     restartable)                    hot-swappable)               │
│                                                                  │
│    Message passing         →       CAN-FD bus                    │
│    (IPC)                           (module communication)        │
│                                                                  │
│    No central controller   →       No rack controller required   │
│    (distributed)                   (modules self-coordinate)     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Design Goals

| Goal | Specification |
|------|---------------|
| Capacity | 84 EK3 modules per rack |
| Total power | 277 kW (84 × 3.3 kW) |
| Redundancy | N-1 (83/84 = 98.8% with one failure) |
| Hot-swap | Any module without rack shutdown |
| Robot access | Front-accessible slots |
| Single point of failure | None |

### 1.3 3PAR Architecture Inspiration

The EK3 rack borrows concepts from 3PAR storage arrays:

| 3PAR Concept | EK3 Implementation |
|--------------|-------------------|
| Wide striping | All modules share load equally |
| No dedicated spare | Distributed sparing (N+M) |
| Autonomous nodes | Modules self-coordinate via Raft |
| Passive backplane | Only routing, no active logic |
| Hot-swap | Module replacement without shutdown |

---

## 2. Mechanical Design

### 2.1 Form Factor

**Standard 19" Rack:**

| Parameter | Value |
|-----------|-------|
| Width | 600 mm (23.6") |
| Depth | 1000 mm (39.4") |
| Height | 42U (1867 mm / 73.5") |
| Weight (empty) | 120 kg |
| Weight (loaded) | 450 kg max |

**Module Slot Configuration:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rack Front View (84 Slots)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  ROW 14  │ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  ROW 13  │ 07 │ 08 │ 09 │ 10 │ 11 │ 12 │    Module    │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  ROW 12  │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  ROW 11  │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  ROW 10  │ 25 │ 26 │ 27 │ 28 │ 29 │ 30 │    Module    │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  ROW 9   │ 31 │ 32 │ 33 │ 34 │ 35 │ 36 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  ROW 8   │ 37 │ 38 │ 39 │ 40 │ 41 │ 42 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  ROW 7   │ 43 │ 44 │ 45 │ 46 │ 47 │ 48 │    Module    │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  ROW 6   │ 49 │ 50 │ 51 │ 52 │ 53 │ 54 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  ROW 5   │ 55 │ 56 │ 57 │ 58 │ 59 │ 60 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  ROW 4   │ 61 │ 62 │ 63 │ 64 │ 65 │ 66 │    Module    │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  ROW 3   │ 67 │ 68 │ 69 │ 70 │ 71 │ 72 │              │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  ROW 2   │ 73 │ 74 │ 75 │ 76 │ 77 │ 78 │    Fan       │  │
│    ├──────────┼────┼────┼────┼────┼────┼────┤    Module    │  │
│    │  ROW 1   │ 79 │ 80 │ 81 │ 82 │ 83 │ 84 │              │  │
│    └──────────┴────┴────┴────┴────┴────┴────┴──────────────┘  │
│                                                                  │
│    Each slot: 200 × 320 × 44 mm (W × D × H)                     │
│    14 rows × 6 columns = 84 module slots                        │
│    5 fan modules (integrated at row boundaries)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Slot Dimensions

| Parameter | Value |
|-----------|-------|
| Slot width | 200 mm |
| Slot depth | 320 mm |
| Slot height | 44 mm (1U) |
| Guide rail length | 300 mm |
| Connector position | Rear (blind-mate) |

### 2.3 Airflow Design

**Front-to-Back Cooling:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Airflow Path (Side View)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│           FRONT                              REAR                │
│             │                                  │                 │
│             ▼                                  ▼                 │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │    ══════════════════════════════════════════►     │       │
│    │    Intake        Module Zone        Fan Module     │       │
│    │    Grille        (84 modules)       (exhaust)      │       │
│    │                                                    │       │
│    │    Cool air      Heat generated     Hot air out    │       │
│    │    (25°C)        (+30°C rise)       (55°C)         │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Airflow: 2000 CFM total (per rack)                           │
│    Pressure: 0.3" H2O static                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Robot Access

**Front Door Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Robot Access Design                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Door Operation:                                               │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │    ╔═══════════════════════════════════════════╗   │       │
│    │    ║                                           ║   │       │
│    │    ║   Quick-release door                      ║   │       │
│    │    ║   • Magnetic latch (no handle)            ║   │       │
│    │    ║   • Opens to 180° (flat against side)     ║   │       │
│    │    ║   • Interlock: power to slots disabled    ║   │       │
│    │    ║     when door open                        ║   │       │
│    │    ║                                           ║   │       │
│    │    ╚═══════════════════════════════════════════╝   │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Slot Access:                                                  │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │         ┌─────────┐                               │       │
│    │         │ Module  │◄─── Guide rails              │       │
│    │         │         │     (self-aligning)          │       │
│    │         └────┬────┘                               │       │
│    │              │                                    │       │
│    │              ▼                                    │       │
│    │         Lever mechanism                           │       │
│    │         (robot gripper compatible)                │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Robot Requirements:                                           │
│    • Gripper force: 50-100 N                                    │
│    • Positioning accuracy: ±5 mm                                │
│    • Rotation capability: lever operation                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Backplane Architecture (Hardware Microkernel)

### 3.1 Minimal Backplane Principle

The backplane implements the "hardware microkernel" concept:

```
┌─────────────────────────────────────────────────────────────────┐
│           BACKPLANE = "Hardware Microkernel"                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ONLY provides:                                                │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ • DC bus bars (power distribution)                      │  │
│    │ • CAN-A bus routing (primary communication)             │  │
│    │ • CAN-B bus routing (backup communication)              │  │
│    │ • Ground plane (safety and signal reference)            │  │
│    │ • Slot connectors (blind-mate, sequenced)               │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Does NOT contain:                                             │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ ✗ Any active logic or microcontrollers                  │  │
│    │ ✗ Any power conversion (AC/DC, DC/DC)                   │  │
│    │ ✗ Any single point of failure                           │  │
│    │ ✗ Any software or firmware                              │  │
│    │ ✗ Any centralized control                               │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Result:                                                       │
│    • Backplane has no failure modes (passive components only)   │
│    • Modules operate autonomously (swarm behavior)              │
│    • System continues with any subset of modules                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Backplane Schematic

```
┌─────────────────────────────────────────────────────────────────┐
│                    Backplane Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    AC Input (from station)                                       │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  3-Phase 400V ──────────────────────────────────────────┼─┼──►
│    │                                                          │ │ To
│    │  PE (Ground) ───────────────────────────────────────────┼─┼──► DC
│    │                                                          │ │ Out
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    DC Bus Distribution:                                          │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  DC+ ════╦════╦════╦════╦════╦════╦════╦════╦════╦═══   │ │
│    │         ║    ║    ║    ║    ║    ║    ║    ║    ║       │ │
│    │        [1]  [2]  [3]  [4]  [5]  [6] ... ... [84]        │ │
│    │         ║    ║    ║    ║    ║    ║    ║    ║    ║       │ │
│    │  DC- ════╩════╩════╩════╩════╩════╩════╩════╩════╩═══   │ │
│    │                                                          │ │
│    │  Bus bars: Copper, 10mm² cross-section                   │ │
│    │  Per-slot fusing: PTC resettable (5A trip)               │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    CAN-A Bus (Primary):                                          │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  CAN-A_H ══╦════╦════╦════╦════╦════════════╦══ 120Ω    │ │
│    │           ║    ║    ║    ║    ║            ║            │ │
│    │          [1]  [2]  [3]  [4]  [5]  ...     [84]          │ │
│    │           ║    ║    ║    ║    ║            ║            │ │
│    │  CAN-A_L ══╩════╩════╩════╩════╩════════════╩══ 120Ω    │ │
│    │                                                          │ │
│    │  Topology: Linear bus with termination at both ends      │ │
│    │  Stub length: <30 cm per module                          │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    CAN-B Bus (Backup):                                           │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  (Same topology as CAN-A, physically separate path)      │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Power Distribution

**DC Bus Design:**

| Parameter | Specification |
|-----------|---------------|
| Bus voltage | 650-900 VDC (nominal 800V) |
| Bus current capacity | 350A continuous |
| Bus bar material | Copper, electrolytic grade |
| Bus bar cross-section | 10 mm² per rail |
| Per-slot current | 4A max (with 25% margin) |

**Per-Slot Protection:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Per-Slot Protection Circuit                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ Bus Bar                                                   │
│         │                                                        │
│         ├─────────────────────────────────────────┐             │
│         │                                         │             │
│        ─┴─ PTC Fuse                              ─┴─            │
│        ─┬─ (Littelfuse 2920L500)                  │             │
│         │  • Hold current: 5A                     │             │
│         │  • Trip current: 10A                   ─┴─            │
│         │  • Max voltage: 1000V                   │  Hall       │
│         │  • Resettable                          ─┬─ Effect    │
│         │                                         │  Sensor    │
│         └─────────────────────────────────────────┤             │
│                                                   │             │
│                                                   ▼             │
│                                              Slot Connector     │
│                                                                  │
│    Current sensing (Hall effect):                                │
│    • Allegro ACS712 or similar                                  │
│    • Output: 0-5V proportional to current                       │
│    • Read by optional rack controller                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Communication Routing

**Dual CAN-FD Bus:**

| Parameter | CAN-A | CAN-B |
|-----------|-------|-------|
| Purpose | Primary operations | Backup / heartbeat only |
| Data rate | 5 Mbps | 5 Mbps |
| Termination | 120Ω split at both ends | 120Ω split at both ends |
| Cable type | Twisted pair, shielded | Twisted pair, shielded |
| Physical path | Left side of backplane | Right side of backplane |

**Termination Detail:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAN Bus Termination                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    End A (Slot 1 side)              End B (Slot 84 side)        │
│                                                                  │
│    CAN_H ───────────────────────────────────────────── CAN_H    │
│            │                                       │            │
│           ┌┴┐                                     ┌┴┐           │
│           │ │ 60Ω                                 │ │ 60Ω       │
│           └┬┘                                     └┬┘           │
│            ├────┤├──── 4.7nF ──► GND              ├────┤├────   │
│           ┌┴┐                                     ┌┴┐           │
│           │ │ 60Ω                                 │ │ 60Ω       │
│           └┬┘                                     └┬┘           │
│            │                                       │            │
│    CAN_L ───────────────────────────────────────────── CAN_L    │
│                                                                  │
│    Split termination provides:                                   │
│    • Better common-mode rejection                               │
│    • Lower EMI emissions                                        │
│    • AC termination via capacitor                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Rack Controller (Optional)

### 4.1 Controller Role

The rack controller is **OPTIONAL**. Modules operate autonomously without it:

```
┌─────────────────────────────────────────────────────────────────┐
│               Rack Controller: Optional "Init Process"           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    What the controller does (when present):                      │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ • Slot presence detection (inventory)                    │  │
│    │ • Temperature monitoring (ambient sensors)               │  │
│    │ • Fan speed control (based on load/temperature)         │  │
│    │ • Door open/close sensing (safety interlock)            │  │
│    │ • Aggregate telemetry to Station Controller              │  │
│    │ • LED status display                                     │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    What the controller does NOT do:                              │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ ✗ Control power output (modules do this autonomously)   │  │
│    │ ✗ Manage module coordination (swarm handles this)       │  │
│    │ ✗ Route CAN messages (passive backplane)                │  │
│    │ ✗ Any function required for charging operation          │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    If controller fails:                                          │
│    • Modules continue charging normally                         │
│    • Fans run at fixed speed (safe default)                     │
│    • No telemetry aggregation (modules report directly)         │
│    • Status LEDs may not update                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Controller Hardware

The rack controller uses the **same MCU and kernel** as EK3 modules, enabling unified firmware development and consistent fault handling across the entire system.

| Component | Specification | Notes |
|-----------|---------------|-------|
| MCU | **STM32G474VET6** | Same as EK3 modules |
| Firmware | **JEZGRO microkernel** | Unified kernel, different service config |
| CAN interface | 2× CAN-FD (bus A and B) | 5 Mbps, dual redundant |
| I2C interface | For slot sensors, GPIO expanders | 84 slots via expanders |
| GPIO | For fan PWM, door switch, LEDs | 15× PWM outputs |
| Ethernet | Optional W5500 SPI module | Direct network connection |
| Power supply | 12V from rack PSU | 5W typical |

**Key insight:** Running JEZGRO on both EK3 modules and rack controller provides:
- Shared codebase (reduced development effort)
- Consistent fault isolation (MPU-based protection)
- Automatic service restart (no single point of failure)
- Familiar development workflow for all firmware engineers

### 4.3 Controller Functions

**Slot Presence Detection:**

```c
/* Slot presence via I2C GPIO expander */
typedef struct {
    uint8_t slot_id;
    bool present;
    bool power_enabled;
    float current_amps;
    float temperature_c;
} SlotStatus_t;

/* Read all slot status */
void ReadSlotInventory(SlotStatus_t slots[84]) {
    for (int i = 0; i < 84; i++) {
        /* Read presence switch via I2C expander */
        slots[i].present = ReadPresenceSwitch(i);

        /* Read current via Hall sensor ADC */
        slots[i].current_amps = ReadSlotCurrent(i);

        /* Read temperature from per-slot sensor */
        slots[i].temperature_c = ReadSlotTemperature(i);
    }
}
```

**Fan Control:**

```c
/* Fan control based on thermal zones */
#define NUM_ZONES 5
#define FANS_PER_ZONE 3

void UpdateFanSpeed(void) {
    for (int zone = 0; zone < NUM_ZONES; zone++) {
        /* Get max temperature in zone */
        float max_temp = GetZoneMaxTemperature(zone);

        /* Calculate required fan speed (linear interpolation) */
        uint8_t speed_percent;
        if (max_temp < 40.0f) {
            speed_percent = 30;  /* Minimum speed */
        } else if (max_temp > 70.0f) {
            speed_percent = 100; /* Maximum speed */
        } else {
            speed_percent = 30 + (max_temp - 40.0f) * 70.0f / 30.0f;
        }

        /* Apply to all fans in zone */
        for (int fan = 0; fan < FANS_PER_ZONE; fan++) {
            SetFanPWM(zone, fan, speed_percent);
        }
    }
}
```

---

## 5. Power Architecture

### 5.1 AC Input Stage

**Configuration:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      AC Input Configuration                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Option A: Centralized PFC (Recommended for new installations) │
│                                                                  │
│    3-Phase 400V AC ──► [Central PFC] ──► 800V DC Bus            │
│                         (100kW unit)     (to all modules)        │
│                                                                  │
│    Advantages:                                                   │
│    • Higher efficiency (single conversion)                      │
│    • Better power factor correction                             │
│    • Lower component count in modules                           │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    Option B: Distributed PFC (For retrofit or flexibility)       │
│                                                                  │
│    3-Phase 400V AC ──► [Each module has own PFC]                │
│                                                                  │
│    Advantages:                                                   │
│    • No central point of failure                                │
│    • Flexible deployment                                        │
│    • Modules are self-contained                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 DC Bus Design

| Parameter | Specification |
|-----------|---------------|
| Nominal voltage | 800 VDC |
| Voltage range | 650-900 VDC |
| Total capacity | 350A continuous |
| Per-module allocation | 4.2A (with margin) |
| Bus capacitance | 10 mF (ride-through) |

**Bus Capacitor Bank:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DC Bus Capacitor Bank                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ ─────┬─────┬─────┬─────┬─────┬─────┬───────             │
│             │     │     │     │     │     │                     │
│            ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─                   │
│            1mF   1mF   1mF   1mF   1mF   1mF  (Film caps)       │
│            ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─  1000V rated      │
│             │     │     │     │     │     │                     │
│    DC- ─────┴─────┴─────┴─────┴─────┴─────┴───────             │
│                                                                  │
│    Total: 10 mF @ 900V                                          │
│    Purpose: Ride-through during hot-swap                        │
│    Location: Distributed along backplane                        │
│                                                                  │
│    Ride-through calculation:                                     │
│    • Max load: 280 kW                                           │
│    • Voltage droop allowed: 50V (800V → 750V)                   │
│    • Time: C × ΔV / I = 10mF × 50V / 350A = 1.4 ms             │
│    • Sufficient for module hot-swap transient                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Wide Striping Implementation

All modules share load equally via droop control:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Wide Striping / Droop Control                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Traditional Charger (Master-Slave):                           │
│                                                                  │
│    ┌─────────┐                                                  │
│    │ Master  │ ──► Controls all power                          │
│    └────┬────┘                                                  │
│         │                                                       │
│    ┌────┴────┐  ┌─────────┐  ┌─────────┐                       │
│    │ Slave 1 │  │ Slave 2 │  │ Slave 3 │                       │
│    └─────────┘  └─────────┘  └─────────┘                       │
│    Problem: Master failure = total failure                      │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    EK3 Rack (Wide Striping):                                     │
│                                                                  │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐       ┌─────────┐     │
│    │ Mod 1   │  │ Mod 2   │  │ Mod 3   │  ...  │ Mod 84  │     │
│    │ 3.3kW   │  │ 3.3kW   │  │ 3.3kW   │       │ 3.3kW   │     │
│    └────┬────┘  └────┬────┘  └────┬────┘       └────┬────┘     │
│         │            │            │                  │          │
│         └────────────┴────────────┴──────────────────┘          │
│                              │                                   │
│                              ▼                                   │
│                     Common DC Bus (800V)                        │
│                                                                  │
│    Each module: Sets output based on bus voltage (droop)        │
│    V_bus high → reduce power                                    │
│    V_bus low → increase power                                   │
│    Result: Automatic load sharing, no master needed             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Droop Control Equation:**

```
V_out = V_nominal - (R_droop × I_out)

Where:
  V_nominal = 800V (target bus voltage)
  R_droop = 5Ω (virtual resistance)
  I_out = module output current

Example:
  Module delivering 3.3kW at 800V = 4.125A
  V_out = 800V - (5Ω × 4.125A) = 779.4V

  If bus voltage measured is 810V (light load):
  Module reduces output until equilibrium

  If bus voltage measured is 780V (heavy load):
  Module increases output until equilibrium
```

---

## 6. Thermal Management

### 6.1 Cooling Zones

```
┌─────────────────────────────────────────────────────────────────┐
│                    Thermal Zone Layout                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  ZONE E (Top)     │ Rows 13-14 │ 12 modules │           │  │
│    │  Hottest zone     │            │            │ Fan E     │  │
│    ├───────────────────┼────────────┼────────────┼───────────┤  │
│    │  ZONE D           │ Rows 10-12 │ 18 modules │ Fan D     │  │
│    ├───────────────────┼────────────┼────────────┼───────────┤  │
│    │  ZONE C (Middle)  │ Rows 7-9   │ 18 modules │ Fan C     │  │
│    ├───────────────────┼────────────┼────────────┼───────────┤  │
│    │  ZONE B           │ Rows 4-6   │ 18 modules │ Fan B     │  │
│    ├───────────────────┼────────────┼────────────┼───────────┤  │
│    │  ZONE A (Bottom)  │ Rows 1-3   │ 18 modules │ Fan A     │  │
│    │  Coolest zone     │            │            │           │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Inlet air temperature rises as it moves up through rack      │
│    Upper zones need more aggressive cooling                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Fan Module Design

| Parameter | Specification |
|-----------|---------------|
| Fans per zone | 3 (N+1 redundancy) |
| Fan type | 120mm × 38mm, axial |
| Airflow per fan | 200 CFM @ 50% duty |
| Speed control | PWM, 25-100% |
| Noise | <45 dB(A) @ 50% duty |

**Fan Redundancy:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Fan Module (N+1 Redundancy)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Normal operation (all fans working):                          │
│    ┌─────┐  ┌─────┐  ┌─────┐                                   │
│    │ FAN │  │ FAN │  │ FAN │  Each at 50% speed                │
│    │  1  │  │  2  │  │  3  │  Total: 600 CFM (3 × 200)         │
│    └──┬──┘  └──┬──┘  └──┬──┘                                   │
│       │        │        │                                       │
│       ▼        ▼        ▼                                       │
│    ══════════════════════════                                   │
│           Airflow                                                │
│                                                                  │
│    One fan failed:                                               │
│    ┌─────┐  ┌─────┐  ┌─────┐                                   │
│    │ FAN │  │  X  │  │ FAN │  Remaining at 75% speed           │
│    │  1  │  │FAIL │  │  3  │  Total: 600 CFM (2 × 300)         │
│    └──┬──┘  └─────┘  └──┬──┘                                   │
│       │                  │                                       │
│       ▼                  ▼                                       │
│    ══════════════════════════                                   │
│           Airflow (maintained)                                   │
│                                                                  │
│    Two fans failed: Graceful derating                            │
│    • Remaining fan at 100%: 400 CFM (67% capacity)              │
│    • Modules in zone reduce power by 33%                        │
│    • Alert to station controller                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Thermal Migration

Modules autonomously redistribute load based on temperature:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Thermal Migration                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Scenario: Module 42 running hot (85°C)                        │
│                                                                  │
│    Before migration:                                             │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│    │ Mod 41 │ │ Mod 42 │ │ Mod 43 │ │ Mod 44 │                 │
│    │ 65°C   │ │ 85°C ! │ │ 62°C   │ │ 60°C   │                 │
│    │ 3.3kW  │ │ 3.3kW  │ │ 3.3kW  │ │ 3.3kW  │                 │
│    └────────┘ └────────┘ └────────┘ └────────┘                 │
│                                                                  │
│    Module 42 broadcasts THERMAL_SHARE message:                   │
│    "I'm hot, requesting power reduction"                         │
│                                                                  │
│    After migration (swarm response):                             │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│    │ Mod 41 │ │ Mod 42 │ │ Mod 43 │ │ Mod 44 │                 │
│    │ 68°C   │ │ 75°C ✓ │ │ 66°C   │ │ 64°C   │                 │
│    │ 3.5kW  │ │ 2.5kW  │ │ 3.5kW  │ │ 3.5kW  │                 │
│    └────────┘ └────────┘ └────────┘ └────────┘                 │
│                                                                  │
│    Total power unchanged: 13.0 kW                                │
│    Hot module temperature reduced                                │
│    No central controller involved                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Fault Handling

### 7.1 Module Failure

```
┌─────────────────────────────────────────────────────────────────┐
│                  Module Failure Handling                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Failure detected (module stops responding):                   │
│                                                                  │
│    1. PTC fuse trips (if short circuit)                         │
│       └─► Module isolated from DC bus                           │
│                                                                  │
│    2. Swarm detects missing heartbeat (1 second timeout)        │
│       └─► Other modules redistribute load                       │
│                                                                  │
│    3. Station controller alerted                                 │
│       └─► Logs event, schedules replacement                     │
│                                                                  │
│    4. LED on slot turns red (if rack controller present)        │
│       └─► Visual indication for technician/robot                │
│                                                                  │
│    Impact Analysis:                                              │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ 84 modules total, 1 failed:                              │  │
│    │ • Capacity loss: 1/84 = 1.2%                            │  │
│    │ • Per-module load increase: 1/83 = 1.2%                 │  │
│    │ • System continues at 98.8% capacity                    │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Backplane Failure

**Extremely rare** (passive components only), but possible:

| Failure Mode | Probability | Impact | Mitigation |
|--------------|-------------|--------|------------|
| Bus bar damage | Very low | Segment offline | Sectioned bus with jumpers |
| CAN trace break | Very low | Communication loss | Dual CAN buses |
| Connector failure | Low | Single slot offline | Socketed connectors |
| Capacitor failure | Low | Reduced ride-through | Distributed capacitors |

### 7.3 Fan Failure

```
┌─────────────────────────────────────────────────────────────────┐
│                   Fan Failure Response                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Failure Level    │ Response                                   │
│    ─────────────────┼───────────────────────────────────────────│
│    1 fan/zone       │ Increase other fans to compensate         │
│                     │ Normal operation continues                │
│    ─────────────────┼───────────────────────────────────────────│
│    2 fans/zone      │ Remaining fan at 100%                     │
│                     │ Zone modules derate by 30%                │
│                     │ Alert to station controller               │
│    ─────────────────┼───────────────────────────────────────────│
│    3 fans/zone      │ Zone modules shutdown (thermal protect)   │
│    (all fans)       │ Other zones continue at reduced power     │
│                     │ Critical alert                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Robot Interface

### 8.1 Slot Identification

```
┌─────────────────────────────────────────────────────────────────┐
│                  Slot Identification System                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Visual Identification:                                        │
│    ┌────────────────────────────────────────────────────────┐   │
│    │                                                        │   │
│    │    ┌─────────────────────────────────────────────┐    │   │
│    │    │                                             │    │   │
│    │    │  ┌───┐                                      │    │   │
│    │    │  │LED│ ◄─── Status LED                      │    │   │
│    │    │  └───┘      • Green: OK                     │    │   │
│    │    │             • Yellow: Warning               │    │   │
│    │    │             • Red: Fault                    │    │   │
│    │    │             • Blue: Robot target            │    │   │
│    │    │                                             │    │   │
│    │    │  ┌─────────┐                                │    │   │
│    │    │  │ QR Code │ ◄─── Machine-readable ID       │    │   │
│    │    │  │  ▓▓▓▓▓  │      Contains:                 │    │   │
│    │    │  │  ▓   ▓  │      • Rack ID                 │    │   │
│    │    │  │  ▓▓▓▓▓  │      • Slot number             │    │   │
│    │    │  └─────────┘      • Calibration data        │    │   │
│    │    │                                             │    │   │
│    │    │  [ 42 ] ◄─── Human-readable slot number    │    │   │
│    │    │                                             │    │   │
│    │    └─────────────────────────────────────────────┘    │   │
│    │                                                        │   │
│    └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Insertion Guidance

```
┌─────────────────────────────────────────────────────────────────┐
│                  Mechanical Insertion Guidance                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Guide Rails:                                                  │
│    ┌────────────────────────────────────────────────────────┐   │
│    │                                                        │   │
│    │    Side View:                                          │   │
│    │                                                        │   │
│    │    ══════════════════════════════════════              │   │
│    │    ║              Guide Rail (Top)     ║               │   │
│    │    ║                                   ║               │   │
│    │    ║     ┌─────────────────────┐      ║               │   │
│    │    ║     │                     │      ║               │   │
│    │    ║     │      MODULE         │◄─────╬── Insertion   │   │
│    │    ║     │                     │      ║   direction   │   │
│    │    ║     └─────────────────────┘      ║               │   │
│    │    ║              Guide Rail (Bottom) ║               │   │
│    │    ══════════════════════════════════════              │   │
│    │                                                        │   │
│    │    Guide rail features:                                │   │
│    │    • Tapered entry (±10mm self-alignment)             │   │
│    │    • Low friction coating (PTFE)                      │   │
│    │    • Position detents at full insertion               │   │
│    │                                                        │   │
│    └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Safety Interlocks

```
┌─────────────────────────────────────────────────────────────────┐
│                    Safety Interlock Sequence                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Insertion Sequence:                                           │
│                                                                  │
│    1. Robot positions at slot                                    │
│       └─► Rack controller receives "swap request"               │
│                                                                  │
│    2. Slot LED turns blue (target confirmation)                  │
│       └─► Slot power pre-disabled                               │
│                                                                  │
│    3. Robot inserts module                                       │
│       └─► Ground contact made first (ESD protection)            │
│                                                                  │
│    4. Lever engaged (locked position)                            │
│       └─► Position sensor confirms full insertion               │
│                                                                  │
│    5. Pre-charge sequence initiated                              │
│       └─► Module soft-starts (500ms)                            │
│                                                                  │
│    6. Module joins swarm                                         │
│       └─► CAN heartbeat confirms operation                      │
│       └─► LED turns green                                       │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    Extraction Sequence:                                          │
│                                                                  │
│    1. Robot requests extraction                                  │
│       └─► Module receives shutdown command                      │
│                                                                  │
│    2. Module reduces power to zero (graceful)                    │
│       └─► Confirms shutdown complete                            │
│                                                                  │
│    3. Slot power disabled (contactor opens)                      │
│       └─► DC bus isolated from slot                             │
│                                                                  │
│    4. LED turns blue (safe to remove)                            │
│       └─► Robot proceeds with extraction                        │
│                                                                  │
│    5. Lever disengaged, module removed                           │
│       └─► Slot marked as empty                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. References

| Document | Description |
|----------|-------------|
| `tehnika/10-microkernel-architecture.md` | Microkernel principles |
| `tehnika/15-ek3-connector-spec.md` | Connector specifications |
| `tehnika/05-swarm-intelligence.md` | Swarm coordination |
| `tehnika/09-ek3-rack-sistem.md` | Original rack concept |
| `tehnika/13-hardware-security.md` | CAN EMC design |
| `tehnika/16-jezgro.md` | JEZGRO microkernel specification |

---

## 10. JEZGRO Rack Controller

This section describes the rack controller firmware architecture using JEZGRO - the same microkernel running on EK3 modules.

### 10.1 Unified Kernel Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│              JEZGRO: Unified Kernel Across EK3 System           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   EK3 Module (84×)              Rack Controller (1×)            │
│   ┌─────────────────┐           ┌─────────────────┐             │
│   │   STM32G474     │           │   STM32G474     │             │
│   │   JEZGRO Kernel │           │   JEZGRO Kernel │  ← SAME!    │
│   │   ─────────────────         │   ─────────────────           │
│   │   LLC_CONTROL   │           │   FAN_CONTROL   │             │
│   │   SAFETY_MONITOR│           │   THERMAL_MON   │             │
│   │   CAN_HANDLER   │           │   SLOT_INVENTORY│             │
│   │   THERMAL_MGR   │           │   CAN_BRIDGE    │             │
│   │   ROJ_COORD   │           │   TELEMETRY     │             │
│   │   AUDIT_LOGGER  │           │   AUDIT_LOGGER  │             │
│   └────────┬────────┘           └────────┬────────┘             │
│            │                             │                       │
│            └─────────── CAN-FD ──────────┘                      │
│                     (5 Mbps, dual bus)                          │
│                                                                  │
│   Hardware Microkernel (Passive Backplane)                      │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  • Passive routing (no active logic) = kernel IPC        │  │
│   │  • DC bus distribution = resource access                 │  │
│   │  • Per-slot PTC fusing = fault isolation                 │  │
│   │  • CAN termination = communication infrastructure        │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits of unified kernel:**
- Single firmware codebase (easier maintenance)
- Consistent fault isolation (MPU-based protection)
- Automatic service restart (MINIX-inspired reincarnation server)
- Familiar development workflow for all engineers
- Same debugging tools across all devices

### 10.2 Rack Controller Service Configuration

The rack controller runs JEZGRO with a different set of services than EK3 modules:

| ID | Service Name | Priority | Stack | Memory | Watchdog | Purpose |
|----|--------------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 2 KB | 8 KB | - | Core (privileged) |
| 1 | FAN_CONTROL | HIGH | 2 KB | 8 KB | 100 ms | Fan PWM, tachometer |
| 2 | THERMAL_MONITOR | MEDIUM | 2 KB | 8 KB | 500 ms | Zone temperature |
| 3 | SLOT_INVENTORY | MEDIUM | 2 KB | 8 KB | 1000 ms | Presence detection |
| 4 | CAN_BRIDGE | HIGH | 2 KB | 8 KB | 100 ms | CAN-A/B bridging |
| 5 | TELEMETRY | LOW | 4 KB | 16 KB | 2000 ms | Aggregate to station |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms | Event logging |

**Total RAM usage:** ~66 KB (of 128 KB available)

### 10.3 Hardware Differences (vs EK3 Module)

| Feature | EK3 Module | Rack Controller |
|---------|------------|-----------------|
| MCU | STM32G474 | STM32G474 (same!) |
| Flash | 512 KB | 512 KB |
| RAM | 128 KB | 128 KB |
| Power stage | LLC converter | None |
| HRTIM (PWM) | Power stage | Fan control |
| ADC channels | Current/voltage sensors | Temperature sensors |
| I2C slaves | None | 84 slot sensors via expanders |
| Fan control | N/A | 15× PWM outputs (5 zones × 3 fans) |
| Ethernet | None | Optional (W5500 SPI) |
| Power supply | From DC bus via LDO | 12V from rack PSU |

### 10.4 Service Implementation Examples

**Fan Control Service (JEZGRO):**

```c
/* Fan control runs as isolated JEZGRO service */
JEZGRO_SERVICE_DEFINE(fan_control,
    SVC_FAN_CONTROL,           // Service ID
    JEZGRO_PRIORITY_HIGH,      // Priority
    2048,                      // Stack size
    8192,                      // Memory size
    100                        // Watchdog timeout (ms)
);

void fan_control_main(void) {
    jezgro_msg_t msg;

    while (1) {
        // Feed watchdog (reincarnation server monitors this)
        jezgro_watchdog_feed();

        // Receive thermal update from THERMAL_MONITOR
        if (jezgro_receive_timeout(SVC_THERMAL_MONITOR, &msg, 100) == JEZGRO_OK) {
            if (msg.type == MSG_THERMAL_UPDATE) {
                thermal_zone_t* zone = (thermal_zone_t*)msg.payload;
                uint8_t speed = calculate_fan_speed(zone->temperature);
                set_zone_fan_speed(zone->id, speed);
            }
        }

        // Send status to TELEMETRY
        msg.type = MSG_FAN_STATUS;
        msg.dst = SVC_TELEMETRY;
        get_all_fan_status((fan_status_t*)msg.payload);
        jezgro_send(&msg);
    }
}
```

**Slot Inventory Service (JEZGRO):**

```c
/* Slot inventory runs as isolated JEZGRO service */
JEZGRO_SERVICE_DEFINE(slot_inventory,
    SVC_SLOT_INVENTORY,
    JEZGRO_PRIORITY_MEDIUM,
    2048,
    8192,
    1000
);

void slot_inventory_main(void) {
    jezgro_msg_t msg;

    while (1) {
        jezgro_watchdog_feed();

        // Scan all 84 slots (via I2C GPIO expanders)
        for (int slot = 0; slot < 84; slot++) {
            slot_status_t status;
            status.slot_id = slot;
            status.present = read_slot_presence(slot);
            status.current_amps = read_slot_current(slot);
            status.temperature_c = read_slot_temperature(slot);

            // Notify CAN_BRIDGE of changes
            if (slot_status_changed(&status)) {
                msg.type = MSG_SLOT_STATUS;
                msg.dst = SVC_CAN_BRIDGE;
                memcpy(msg.payload, &status, sizeof(status));
                jezgro_send(&msg);
            }
        }

        jezgro_sleep(500);  // Scan every 500ms
    }
}
```

### 10.5 Development Path Alternatives (Hybrid Approach)

Three development paths are available for rack controller firmware:

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT PATH OPTIONS                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Option A: FreeRTOS → JEZGRO Migration (RECOMMENDED)           │
│   ─────────────────────────────────────────────────             │
│   ┌────────────────┐         ┌────────────────┐                 │
│   │ Phase 1        │────────►│ Phase 2        │                 │
│   │ FreeRTOS       │         │ JEZGRO         │                 │
│   │ ────────────── │         │ ────────────── │                 │
│   │ • Fast proto   │         │ • Production   │                 │
│   │ • No MPU       │         │ • MPU isolated │                 │
│   │ • Shared tasks │         │ • Auto-restart │                 │
│   │ • Standard API │         │ • Fault contain│                 │
│   └────────────────┘         └────────────────┘                 │
│                                                                  │
│   Advantages:                                                    │
│   • Faster time-to-prototype (FreeRTOS is familiar)             │
│   • Use existing FreeRTOS drivers initially                     │
│   • Migrate to JEZGRO for production (better reliability)       │
│   • Migration API shim available (see Section 8.4 of jezgro.md) │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Option B: Zephyr Hybrid                                       │
│   ───────────────────────                                       │
│   • Uses Zephyr RTOS with userspace enabled                     │
│   • Broader ecosystem (drivers, networking)                     │
│   • MPU isolation via Zephyr's userspace feature                │
│   • May not meet <1µs interrupt latency for power stage         │
│   • Suitable for rack controller (no power stage)               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Option C: Pure JEZGRO from Start                              │
│   ────────────────────────────────                              │
│   • Maximum control and optimization                            │
│   • Longest initial development time                            │
│   • Best for resource-constrained targets                       │
│   • Unified with EK3 module firmware from day one               │
│   • Recommended if team is already JEZGRO-experienced           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Recommended approach:** Option A (FreeRTOS → JEZGRO migration)
- Start with FreeRTOS for quick prototyping
- Use JEZGRO compatibility shim for smooth transition
- Migrate to full JEZGRO for production release

### 10.6 Migration Compatibility Layer

JEZGRO provides a FreeRTOS API shim for gradual migration:

| FreeRTOS API | JEZGRO Equivalent | Migration Notes |
|--------------|-------------------|-----------------|
| `xTaskCreate()` | `JEZGRO_SERVICE_DEFINE()` | Add MPU region config |
| `vTaskDelay()` | `jezgro_sleep()` | 1:1 mapping |
| `xQueueSend()` | `jezgro_send()` | Change to IPC message |
| `xQueueReceive()` | `jezgro_receive()` | Change to IPC message |
| `xSemaphore*()` | `jezgro_sem_*()` | Similar API |
| `configASSERT()` | `jezgro_assert()` | Triggers reincarnation |

**Migration sequence:**
1. Compile with JEZGRO compatibility headers
2. Replace task creation with service definitions
3. Convert queues to IPC messages (one at a time)
4. Add MPU regions for each service
5. Test fault isolation (inject faults, verify restart)
6. Remove FreeRTOS shim layer

See `tehnika/inzenjersko/en/16-jezgro.md` Section 8.4 for detailed migration guide.

### 10.7 Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/16-jezgro.md` | JEZGRO kernel specification |
| `tehnika/14-firmware-architecture.md` | FreeRTOS baseline (migration source) |
| `tehnika/10-microkernel-architecture.md` | Microkernel design principles |
| `tehnika/12-audit-logging.md` | Audit service (shared with EK3 modules) |

---

## 11. Backplane PCB Design

This section provides detailed PCB design specifications for the passive backplane.

### 11.1 Layer Stackup

The backplane uses a 6-layer design optimized for power distribution and signal integrity:

```
┌─────────────────────────────────────────────────────────────────┐
│                   BACKPLANE PCB LAYER STACKUP                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Layer   │ Function        │ Copper   │ Purpose                │
│   ─────────────────────────────────────────────────────────────│
│     1     │ Signal TOP      │ 2 oz     │ CAN-A, I2C, control    │
│   ─────────────────────────────────────────────────────────────│
│           │ Prepreg         │ 0.2 mm   │ Dielectric            │
│   ─────────────────────────────────────────────────────────────│
│     2     │ Ground plane    │ 3 oz     │ GND reference          │
│   ─────────────────────────────────────────────────────────────│
│           │ Core            │ 1.0 mm   │ FR4                    │
│   ─────────────────────────────────────────────────────────────│
│     3     │ Power plane DC+ │ 4 oz     │ 650V DC positive       │
│   ─────────────────────────────────────────────────────────────│
│           │ Prepreg         │ 0.2 mm   │ Dielectric            │
│   ─────────────────────────────────────────────────────────────│
│     4     │ Power plane DC- │ 4 oz     │ 650V DC negative       │
│   ─────────────────────────────────────────────────────────────│
│           │ Core            │ 1.0 mm   │ FR4                    │
│   ─────────────────────────────────────────────────────────────│
│     5     │ Ground plane    │ 3 oz     │ GND reference          │
│   ─────────────────────────────────────────────────────────────│
│           │ Prepreg         │ 0.2 mm   │ Dielectric            │
│   ─────────────────────────────────────────────────────────────│
│     6     │ Signal BOTTOM   │ 2 oz     │ CAN-B, sensors         │
│   ─────────────────────────────────────────────────────────────│
│                                                                  │
│   Total thickness: ~3.0 mm                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Material Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Base material | FR4 High-Tg | Tg > 170°C |
| Copper weight (internal power) | **4 oz (140 µm)** | For 350A capacity |
| Copper weight (internal GND) | 3 oz (105 µm) | Shielding |
| Copper weight (external signal) | 2 oz (70 µm) | CAN, control |
| Dielectric constant (εr) | 4.5 | @ 1 MHz |
| Total thickness | 3.0 mm ±10% | With copper |
| Board size | 800 × 600 mm | Maximum panel size |
| Minimum trace/space | 0.15 mm / 0.15 mm | For signal layers |

### 11.3 CAN-FD Trace Routing

**Differential pair specifications:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  CAN DIFFERENTIAL PAIR DESIGN                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         CAN_H                    CAN_L                          │
│          │                        │                             │
│    ┌─────┴─────┐            ┌─────┴─────┐                       │
│    │  W=0.2mm  │◄── S=0.15mm ──►│  W=0.2mm  │                   │
│    └───────────┘            └───────────┘                       │
│                                                                  │
│    Impedance: Zdiff = 100Ω ±10%                                 │
│    Reference: Layer 2 (GND)                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Parameters:
│ Parameter       │ CAN-A (Layer 1) │ CAN-B (Layer 6) │
│─────────────────│─────────────────│─────────────────│
│ Trace width     │ 0.2 mm          │ 0.2 mm          │
│ Trace spacing   │ 0.15 mm         │ 0.15 mm         │
│ Impedance       │ 100Ω diff       │ 100Ω diff       │
│ Reference layer │ Layer 2 (GND)   │ Layer 5 (GND)   │
│ Max length      │ 2000 mm         │ 2000 mm         │
│ Length matching │ ±5 mm           │ ±5 mm           │
```

**Routing rules:**
- Maintain 100Ω differential impedance
- Keep CAN-H and CAN-L length matched within 5 mm
- Avoid sharp corners (use 45° or curved traces)
- Maintain 3× trace width clearance from power planes
- Place termination resistors at bus endpoints

### 11.4 Power Distribution

**DC bus routing (350A @ 650V):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    DC BUS PLANE DESIGN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   DC+ Plane (Layer 3):                                          │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                          │  │
│   │   ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐            │  │
│   │   │SLOT│ │SLOT│ │SLOT│ │SLOT│ │SLOT│ │SLOT│  (Row 1)   │  │
│   │   │ 01 │ │ 02 │ │ 03 │ │ 04 │ │ 05 │ │ 06 │            │  │
│   │   └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘ └──┬─┘            │  │
│   │      └──────┴──────┴──────┴──────┴──────┘               │  │
│   │               ▲                                          │  │
│   │      ┌────────┴────────┐                                │  │
│   │      │  Solid copper   │                                │  │
│   │      │  pour (4 oz)    │                                │  │
│   │      └─────────────────┘                                │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│   Via specifications (power):                                   │
│   • Diameter: 1.0 mm                                            │
│   • Pitch: 2.5 mm grid                                          │
│   • Current per via: 3A (derated)                               │
│   • Vias per slot: 20 (DC+) + 20 (DC-)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Parameter | Value | Calculation |
|-----------|-------|-------------|
| Max current per slot | 5A | 3.3 kW / 650V |
| Total bus current | 420A | 84 slots × 5A |
| Copper thickness | 4 oz (140 µm) | Layer 3, 4 |
| Trace/plane width | Full pour | Solid plane |
| Current capacity | >500A | With 10°C rise |
| Voltage clearance | 2.5 mm | 650V creepage |

### 11.5 Connector Footprints

**Module slot connector (84×):**

| Parameter | Value | Notes |
|-----------|-------|-------|
| Connector type | TE MULTIGIG RT | High-density blind-mate |
| Pin count | 20 pins | Power + signal |
| Power pins | 8 (4× DC+, 4× DC-) | 5A per pin |
| Signal pins | 12 | CAN, I2C, control |
| Mating cycles | >50,000 | Robot-grade |
| Contact resistance | <2 mΩ | Per pin |
| Footprint size | 35 × 15 mm | SMT + through-hole |

**CAN termination points (4×):**

```
┌─────────────────────────────────────────────────────────────────┐
│                  CAN TERMINATION NETWORK                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│        CAN_H o────┬────[60Ω]────┬────o CAN_H                    │
│                   │              │                               │
│                   └───[4.7nF]───┘                               │
│                   │              │                               │
│        CAN_L o────┴────[60Ω]────┴────o CAN_L                    │
│                                                                  │
│   Split termination with common-mode filtering                  │
│   Location: Both ends of each CAN bus                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 11.6 EMC Considerations

**Ground stitching via pattern:**

| Zone | Via pitch | Purpose |
|------|-----------|---------|
| Near connectors | 5 mm | EMC containment |
| Board edge | 10 mm | Perimeter shield |
| Between CAN pairs | 3 mm | Crosstalk isolation |
| Power plane boundary | 5 mm | Return path |

**Shielding requirements:**
- Guard traces around CAN differential pairs
- Ground stitching vias every 5 mm along CAN routes
- 4.7 nF common-mode filter capacitors at each connector
- Ferrite beads on I2C lines (600Ω @ 100 MHz)

### 11.7 Manufacturing Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| PCB class | IPC Class 2 | Industrial |
| Solder mask | Green, LPI | >25 µm |
| Surface finish | **ENIG** | Au: 50-100 nm, Ni: 3-6 µm |
| Silkscreen | White, epoxy | Component ID |
| Minimum hole size | 0.3 mm | For signal vias |
| Minimum PTH drill | 0.8 mm | For power vias |
| Aspect ratio | <8:1 | Hole depth / diameter |
| Controlled impedance | ±10% | CAN traces |

**Inspection requirements:**
- 100% AOI (Automated Optical Inspection)
- Impedance testing (all CAN pairs)
- Hi-pot test: 2500V DC for 1 minute
- Cross-section analysis: 1 per lot

### 11.8 Thermal Relief

**Via distribution under PTC fuse pads:**

```
┌─────────────────────────────────────────────────────────────────┐
│                 THERMAL RELIEF VIA PATTERN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│        ┌───────────────────┐                                    │
│        │    PTC Fuse Pad   │                                    │
│        │                   │                                    │
│        │   o   o   o   o   │  ← Thermal vias (0.5 mm)          │
│        │                   │                                    │
│        │   o   o   o   o   │  ← Spacing: 1.0 mm                │
│        │                   │                                    │
│        │   o   o   o   o   │  ← Total: 12 vias                 │
│        │                   │                                    │
│        └───────────────────┘                                    │
│                                                                  │
│   Purpose: Conduct heat to internal planes                      │
│   Thermal resistance: <5 K/W per pad                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Copper pour for heat spreading:**
- Solid copper fill on all layers where possible
- Connect to ground planes via thermal relief spokes
- Avoid thermal islands (isolated copper areas)

---

## 12. Central PFC Module

This section describes the Power Factor Correction (PFC) module that converts 3-phase AC to 650V DC for the rack.

### 12.1 PFC Architecture

**Topology: Vienna Rectifier**

The Vienna rectifier provides high power factor (>0.99) with bidirectional capability for future V2G support:

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIENNA RECTIFIER TOPOLOGY                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     3-Phase AC Input              650V DC Output                │
│                                                                  │
│     L1 ──┬──[L]──┬──────────┐                                   │
│          │       │          │       ┌─────┐                     │
│          │    ┌──┴──┐   ┌───┴───┐   │     │   DC+              │
│          │    │  D  │   │   S   │   │  C  │────o               │
│          │    │  I  │   │   W   │   │     │                     │
│          │    │  O  │   │   I   │   │  B  │                     │
│          │    │  D  │   │   T   │   │  U  │                     │
│          │    │  E  │   │   C   │   │  S  │                     │
│     L2 ──┼──[L]──┼──────H───E   │   │     │                     │
│          │       │          S   │   │     │                     │
│          │    └──┬──┘   └───┬───┘   │     │   DC-              │
│          │       │          │       └─────┘────o               │
│     L3 ──┴──[L]──┴──────────┘                                   │
│                                                                  │
│     Each phase:                                                 │
│     • 2× diodes (high-side, low-side)                          │
│     • 2× SiC MOSFETs (bidirectional switch)                    │
│     • Boost inductor (L)                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why Vienna Rectifier:**
- Power factor >0.99 (exceeds EN 61000-3-12)
- THD <5% (grid-friendly)
- Bidirectional-ready (future V2G)
- High efficiency (>97%)
- Reduced EMI (3-level output)

### 12.2 Electrical Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Input voltage | **380-480V AC 3-phase** | ±10% tolerance |
| Input frequency | 50/60 Hz | Auto-detect |
| Output voltage | **650V DC** | ±5% regulation |
| Output power | **100 kW continuous** | Per PFC unit |
| Peak power | 110 kW | 30 seconds |
| Efficiency | **>97%** | @ full load |
| Power factor | **>0.99** | @ >25% load |
| THD (current) | **<5%** | EN 61000-3-12 |
| Inrush current | <50A | Soft-start |
| Standby power | <20W | Control active |

### 12.3 Control System

| Parameter | Value | Notes |
|-----------|-------|-------|
| Controller | **TMS320F28379D** | Dual-core DSP |
| Sampling rate | 50 kHz | Current sensing |
| PWM frequency | 50 kHz | Per phase, interleaved |
| Control bandwidth | 5 kHz | Current loop |
| Voltage regulation | ±1% | DC bus |

**Control architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    PFC CONTROL BLOCK DIAGRAM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Vdc_ref    ┌─────────┐     Iref    ┌─────────┐    PWM        │
│   (650V) ──►│ Voltage │───────────►│ Current │───────────►    │
│              │   PI    │             │   PR    │     Gate      │
│              └────┬────┘             └────┬────┘    Drive      │
│                   │                       │                     │
│              Vdc_fb                  Iabc_fb                    │
│                   │                       │                     │
│              ┌────┴────┐             ┌────┴────┐               │
│              │  ADC    │             │  ADC    │               │
│              │ (DC bus)│             │ (phase) │               │
│              └─────────┘             └─────────┘               │
│                                                                  │
│   Voltage loop: PI controller, 100 Hz bandwidth                │
│   Current loop: Proportional-Resonant (PR), 5 kHz bandwidth    │
│   Phase-Locked Loop (PLL): Grid synchronization                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 12.4 Protection Features

| Protection | Threshold | Response | Recovery |
|------------|-----------|----------|----------|
| Input OC | >200A | Gate disable | Manual reset |
| Output OV | >720V | Crowbar | Auto after 10s |
| Output UV | <550V | Derate | Auto |
| Ground fault | >30mA | Shutdown | Manual reset |
| Over-temperature | >85°C | Derate, then shutdown | Auto |
| Anti-islanding | IEEE 1547 | Disconnect | Auto 5 min |

### 12.5 Physical Design

| Parameter | Value | Notes |
|-----------|-------|-------|
| Form factor | **3U × 19"** | Rack-mount |
| Width | 482 mm | Standard 19" |
| Depth | 500 mm | With connectors |
| Height | 132 mm | 3U |
| Weight | **~25 kg** | With heatsink |
| Cooling | Integrated fans | Front-to-back, 200 CFM |
| AC input | Harting Han 16A | 5-pin (L1, L2, L3, N, PE) |
| DC output | Copper busbar | M10 studs |
| CAN interface | DB9 | For monitoring |

### 12.6 Redundancy Options

**Single PFC (standard):**
- 1× 100 kW PFC serves 277 kW rack
- Headroom for derating conditions
- Suitable for most installations

**N+1 configuration (high availability):**
```
┌─────────────────────────────────────────────────────────────────┐
│                  N+1 PFC REDUNDANCY                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   3-Phase AC ──┬──► [PFC #1: 100 kW] ──┬──► 650V DC Bus        │
│   Input        │                        │                        │
│                └──► [PFC #2: 100 kW] ──┘                        │
│                                                                  │
│   Normal operation:                                              │
│   • Both PFCs active, sharing load 50/50                        │
│   • Total capacity: 200 kW                                      │
│   • Rack draws: 277 kW max → each PFC: ~138 kW peak             │
│                                                                  │
│   Single PFC failure:                                            │
│   • Remaining PFC handles 100 kW (derated rack)                 │
│   • Rack operates at 36% capacity (~100 kW)                     │
│   • Modules derate automatically via swarm                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Large installations (500 kW+):**
- Multiple racks share a common PFC bank
- 3× 100 kW PFCs for N+1 on 2 racks
- Centralized AC distribution

---

## 13. Manufacturing & Test Procedures

This section describes manufacturing processes and quality control for rack production.

### 13.1 Backplane Assembly

**SMT Process:**

| Step | Process | Parameters |
|------|---------|------------|
| 1 | Solder paste print | Type 4 paste, 0.15 mm stencil |
| 2 | Component placement | Pick-and-place, ±0.05 mm |
| 3 | Reflow | Peak 250°C, 60s above liquidus |
| 4 | AOI inspection | 100% coverage |
| 5 | X-ray (if BGA) | 100% on first lot |

**Through-hole connectors:**
- Selective wave soldering
- Preheat: 150°C, 60 seconds
- Solder temperature: 260°C
- Contact time: 3 seconds

**Post-assembly cleaning:**
- DI water wash
- Residue test: <1.56 µg NaCl/cm²

### 13.2 Rack Assembly Sequence

| Step | Task | Verification |
|------|------|--------------|
| 1 | Frame preparation | Ground continuity <1Ω |
| 2 | Backplane mounting | Torque 2.5 Nm (M4) |
| 3 | Fan module installation | Tachometer signal OK |
| 4 | Wiring harness | Continuity test |
| 5 | Controller installation | Boot test |
| 6 | Power entry installation | Hi-pot test |
| 7 | Final inspection | Checklist sign-off |

### 13.3 Pre-Commissioning Tests

| Test | Equipment | Criteria | Pass/Fail |
|------|-----------|----------|-----------|
| **Insulation resistance** | Megger | >100 MΩ @ 1000V DC | □ |
| **Hi-pot (DC+ to chassis)** | Hi-pot tester | 2500V DC, 60s, <1 mA | □ |
| **Hi-pot (DC- to chassis)** | Hi-pot tester | 2500V DC, 60s, <1 mA | □ |
| **CAN-A continuity** | CAN analyzer | All 84 slots respond | □ |
| **CAN-B continuity** | CAN analyzer | All 84 slots respond | □ |
| **Fan operation** | Visual + tach | All 15 fans spin @ 100% | □ |
| **Slot power isolation** | DMM | <1 mA leakage per slot | □ |
| **Controller boot** | Serial console | JEZGRO banner appears | □ |
| **Temperature sensors** | Controller readout | All 20 sensors reading | □ |

### 13.4 Functional Verification

**Module insertion test:**
1. Insert single module into slot 1
2. Verify CAN communication (heartbeat)
3. Verify power draw (<3W standby)
4. Repeat for all 84 slots

**Hot-swap test:**
1. Operate rack with 10+ modules at 50% load
2. Remove module from slot 42
3. Verify remaining modules continue
4. Reinsert module
5. Verify automatic re-election
6. Repeat 10 cycles minimum

**Full load test:**
1. Connect programmable load (300 kW)
2. Populate all 84 slots
3. Ramp to 277 kW over 10 minutes
4. Hold for 1 hour
5. Verify DC bus regulation (±5%)
6. Verify no thermal alarms
7. Thermal imaging at 1 hour mark

**Communication stress test:**
1. Configure all modules to 100% message rate
2. Run for 24 hours
3. Verify zero dropped messages
4. Verify no CAN errors (error frame count)

---

## 14. Installation Guide

This section provides step-by-step instructions for rack installation at customer sites.

### 14.1 Site Preparation

**Floor requirements:**

| Parameter | Requirement | Notes |
|-----------|-------------|-------|
| Floor loading | ≥500 kg/m² | Loaded rack: 450 kg |
| Surface | Level, flat | ±5 mm over 1 m |
| Material | Concrete or raised floor | Grounded |

**Clearances:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  RACK INSTALLATION CLEARANCES                    │
├─────────────────────────────────────────────────────────────────┤
│                          (Top View)                              │
│                                                                  │
│                      ┌──────────────┐                           │
│                      │              │                           │
│          1000 mm     │     RACK     │     500 mm               │
│     ◄────────────────│   600×1000   │────────────►             │
│       (FRONT)        │              │    (REAR)                │
│                      └──────────────┘                           │
│                             ▲                                    │
│                             │ 300 mm                            │
│                             │ (SIDE)                            │
│                             ▼                                    │
│                                                                  │
│   • Front: 1000 mm for module access and robot operation        │
│   • Rear: 500 mm for cable access and airflow                   │
│   • Sides: 300 mm for ventilation (can be reduced to 0 if       │
│     adjacent racks form a row)                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Environmental:**

| Parameter | Requirement |
|-----------|-------------|
| Ambient temperature | 0°C to 40°C operating |
| Humidity | <95% non-condensing |
| Altitude | <2000 m (derate 1% per 100 m above 1000 m) |
| Contamination | ISO 14644-8 Class 8 (office environment) |

### 14.2 Electrical Requirements

| Parameter | Specification |
|-----------|---------------|
| AC supply | 400V 3-phase + N + PE (TN-S) |
| Circuit breaker | 400A, Type B, 4-pole |
| Cable size | 185 mm² Cu, minimum |
| Cable length | <50 m from transformer |
| Grounding | <1Ω to earth ground |
| Earthing system | TN-S or TN-C-S |

### 14.3 Installation Steps

**Step 1: Unpack and inspect**
- [ ] Remove shipping brackets
- [ ] Inspect for transit damage
- [ ] Verify all accessories present
- [ ] Check serial number matches documentation

**Step 2: Position rack**
- [ ] Move to final location (use pallet jack or forklift)
- [ ] Level using adjustable feet
- [ ] Secure to floor (M12 anchor bolts, 4×)
- [ ] Connect equipotential bonding

**Step 3: Connect AC power**
- [ ] Verify AC disconnect is OFF
- [ ] Connect L1, L2, L3, N, PE to PFC input
- [ ] Torque terminals to 25 Nm
- [ ] Verify phase rotation (L1-L2-L3)

**Step 4: Connect DC output**
- [ ] Connect DC+ and DC- busbars to distribution
- [ ] Torque busbar bolts to 30 Nm
- [ ] Verify DC isolator is OFF

**Step 5: Connect CAN (optional)**
- [ ] Connect CAN-A to station controller
- [ ] Verify termination at both ends
- [ ] Connect CAN-B if used

**Step 6: Pre-power verification**
- [ ] Verify all covers closed
- [ ] Verify front door closed
- [ ] Check for foreign objects in airflow path

### 14.4 First Power-On Checklist

| Step | Action | Expected Result | ✓ |
|------|--------|-----------------|---|
| 1 | Close AC disconnect | No arc, no trip | □ |
| 2 | Wait 30 seconds | PFC soft-start complete | □ |
| 3 | Verify AC voltage | 400V ±10% (L-L) | □ |
| 4 | Verify DC bus | 650V ±5% | □ |
| 5 | Verify fans running | All 15 fans at 30% | □ |
| 6 | Check controller | JEZGRO banner on console | □ |
| 7 | Check CAN (if connected) | Heartbeat from controller | □ |
| 8 | Insert first module (slot 1) | Module LED green | □ |
| 9 | Verify module CAN | Heartbeat appears | □ |
| 10 | Insert modules 2-10 | All LEDs green | □ |
| 11 | Wait 5 minutes | Leader election complete | □ |
| 12 | Continue populating | 10 modules at a time | □ |
| 13 | Full population | All 84 modules, all green | □ |
| 14 | Load test | Apply 50% load, verify | □ |

---

## 15. Maintenance Schedule

This section defines preventive maintenance tasks and intervals.

### 15.1 Preventive Maintenance

| Interval | Task | Procedure |
|----------|------|-----------|
| **Monthly** | Visual inspection | Check LEDs, listen for abnormal sounds |
| **Monthly** | Dust check | Inspect filter, fan inlets |
| **Quarterly** | Filter cleaning | Remove, vacuum or wash, dry, reinstall |
| **Quarterly** | Fan inspection | Check tachometer readings, replace if <70% RPM |
| **Annually** | Thermal imaging | Full load, identify hot spots |
| **Annually** | CAN bus test | Verify error counters, message timing |
| **Annually** | Busbar torque check | Re-torque to specification |
| **Annually** | Firmware update | Apply latest JEZGRO release |
| **5 years** | Capacitor check | ESR measurement on DC bus caps |
| **5 years** | PFC inspection | Full electrical test |

### 15.2 Replacement Procedures

**Fan module replacement (hot-swappable):**
1. Identify failed fan (controller alarm or LED)
2. Open front door
3. Press fan module release latch
4. Pull fan module straight out
5. Insert new fan module
6. Verify tachometer signal
7. Close front door

**PTC fuse replacement (requires slot power-down):**
1. Remove module from affected slot
2. Power down slot (controller command or remove jumper)
3. Wait 1 minute for discharge
4. Desolder failed PTC fuse
5. Solder replacement (same rating)
6. Power up slot
7. Reinsert module

**Module replacement (hot-swappable):**
1. Pull module straight out (no power-down required)
2. Wait 3 seconds (swarm re-election)
3. Insert replacement module
4. Verify LED green within 10 seconds

### 15.3 Spare Parts Inventory

| Item | Recommended Qty | Part Number |
|------|-----------------|-------------|
| Fan modules | 2 per rack | EK-FAN-120-3 |
| PTC fuses (5A/1000V) | 10 per rack | Littelfuse RXEF500 |
| CAN termination kit | 2 per rack | EK-CAN-TERM |
| Temperature sensors | 5 per rack | NXP PCT2075 |
| Controller PCB | 1 per 10 racks | EK-CTRL-G474 |
| Backplane (assembly) | 1 per 50 racks | EK-BP-84 |

---

## Appendix A: Bill of Materials (Rack-Level)

| Item | Quantity | Description |
|------|----------|-------------|
| Rack frame | 1 | 42U, 600×1000mm |
| Backplane PCB | 1 | Custom, 6-layer |
| Slot connectors | 84 | Female, 20-pin |
| Bus capacitors | 10 | 1mF, 1000V film |
| CAN termination | 4 | 120Ω split + 4.7nF |
| PTC fuses | 84 | 5A hold, 1000V |
| Fan modules | 5 | 3× 120mm fans each |
| Temperature sensors | 20 | NTC, I2C |
| Rack controller | 1 | STM32G474 + JEZGRO |
| Power entry | 1 | 3-phase 400V, 400A |

---

## Appendix B: Rack Specifications Summary

| Parameter | Value |
|-----------|-------|
| Module capacity | 84 slots |
| Total power | 277 kW max |
| Redundancy | N-1 (83/84) |
| Input voltage | 3-phase 400V AC |
| DC bus voltage | 650-900 VDC |
| Cooling | Front-to-back, 2000 CFM |
| Hot-swap time | <60 seconds |
| Robot compatible | Yes |
| Backplane MTBF | >1,000,000 hours |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.1 | Major expansion: JEZGRO integration (Section 10), Backplane PCB design (Section 11), Central PFC module (Section 12), Manufacturing & test (Section 13), Installation guide (Section 14), Maintenance schedule (Section 15). Updated Section 4.2 to STM32G474 + JEZGRO. |
| 2026-01-03 | 1.0 | Initial release: Microkernel philosophy, mechanical design, backplane architecture, power distribution, thermal management, fault handling, robot interface |
