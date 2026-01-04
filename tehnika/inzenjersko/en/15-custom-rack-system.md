# EK3 Custom Rack System

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-016 |
| Version | 1.0 |
| Date | 2026-01-03 |
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

| Component | Specification |
|-----------|---------------|
| MCU | STM32F407VGT6 |
| CAN interface | 2× CAN-FD (for bus A and B) |
| I2C interface | For slot sensors, temperature sensors |
| GPIO | For fan PWM, door switch, LEDs |
| Ethernet | Optional, for direct network connection |
| Power supply | 12V from rack PSU |

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
| Rack controller | 1 | STM32F407 based |
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
