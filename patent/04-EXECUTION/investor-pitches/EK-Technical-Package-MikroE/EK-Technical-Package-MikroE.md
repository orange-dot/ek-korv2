# ELEKTROKOMBINACIJA - Full Technical Package

**Document:** Technical Specification for Partner Review
**Classification:** CONFIDENTIAL - Under NDA
**Prepared for:** MikroElektronika d.o.o., Beograd
**Date:** January 2026
**Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [EK3 Power Module Specifications](#2-ek3-power-module-specifications)
3. [Power Electronics Design](#3-power-electronics-design)
4. [Control System Architecture](#4-control-system-architecture)
5. [EK-KOR2 RTOS](#5-ek-kor2-rtos)
6. [Communication Protocol](#6-communication-protocol)
7. [Sensor Integration](#7-sensor-integration)
8. [Development Requirements](#8-development-requirements)
9. [Source Code Package](#9-source-code-package)

---

## 1. Executive Summary

Elektrokombinacija develops modular EV charging infrastructure for electric bus fleets. Our core innovation is the **EK3 module** - a 3.3kW hot-swappable power conversion unit that scales from 3kW to 3MW.

### Key Differentiators

| Feature | Our Approach | Traditional |
|---------|-------------|-------------|
| Architecture | Modular, hot-swappable | Monolithic |
| Failure mode | 0.33% capacity loss | 100% downtime |
| Repair | Robot swap in 60s | Technician, hours |
| Scaling | 1 to 909 modules | Fixed capacity |
| Coordination | Distributed RTOS (EK-KOR2) | Central controller |

### MikroElektronika Relevance

- **MCU:** STM32G474 (your Fusion boards are ideal)
- **Communication:** CAN-FD @ 5 Mbps
- **Prototyping:** Click ecosystem for sensor integration
- **Potential:** Custom Click board for power module control

---

## 2. EK3 Power Module Specifications

### 2.1 Electrical Characteristics

| Parameter | Value | Notes |
|-----------|-------|-------|
| Power (continuous) | **3.3 kW** | LLC resonant DC/DC |
| Power (peak) | **3.6 kW** | Short-term |
| Input voltage | 650V DC | From central PFC |
| Output voltage | 50-500V DC | Full battery range |
| Efficiency (peak) | >96% | @ 50% load |
| Efficiency (full load) | >94% | @ 3.3 kW |
| Standby consumption | <3W | Deep sleep mode |

### 2.2 Physical Characteristics

| Parameter | Value | Notes |
|-----------|-------|-------|
| Dimensions | **200 × 320 × 44 mm** | 1U half-width |
| Mass | **~3.5 kg** | With heatsink |
| Form factor | Custom rack blade | Not 19" telecom |
| Cooling | Forced air (shared plenum) | Front-to-back |

### 2.3 Control and Communication

| Parameter | Value | Notes |
|-----------|-------|-------|
| MCU | **STM32G474VET6** | Cortex-M4 @ 170MHz |
| Communication | **CAN-FD @ 5 Mbps** | 64-byte payload |
| CAN transceiver | NXP TJA1443 | CAN-FD capable |
| Latency | <1ms per message | Real-time |

### 2.4 Connectors

| Parameter | Value | Notes |
|-----------|-------|-------|
| Data connector | **20-pin blind-mate** | CAN-FD, I2C, PWM |
| Power connectors | Anderson SBS50 | Sequenced mating |
| Hot-swap time | <1 second | Electrical disconnect |
| Mating cycles | >50,000 | Robot-grade |
| Insertion force | <20N | Robot-friendly |

### 2.5 Thermal Management

| Parameter | Value | Notes |
|-----------|-------|-------|
| Heatsink material | **Al 6063-T5** | k = 200 W/m·K |
| Heatsink dimensions | 180 × 280 × 33 mm | 72 fins, 2.5mm pitch |
| Thermal resistance (Rth,j-a) | **1.20 K/W** | Junction to ambient |
| TIM | Bergquist GP5000 | 5.0 W/m·K, 0.25mm |
| Max junction temp (Tj) | **125°C** | Target: 120°C with margin |
| Operating ambient | -20°C to +55°C | Full power ≤35°C |
| Airflow per module | **12 CFM** | 2.5 m/s through fins |

### 2.6 Thermal Derating

| Ambient (°C) | Max Power | % Rated |
|--------------|-----------|---------|
| ≤35 | 3.3 kW | 100% |
| 40 | 3.0 kW | 91% |
| 45 | 2.7 kW | 82% |
| 50 | 2.3 kW | 70% |
| 55 | 1.8 kW | 55% |
| ≥60 | SHUTDOWN | 0% |

---

## 3. Power Electronics Design

### 3.1 Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    EK3 POWER MODULE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐      ┌─────────────────┐              │
│  │   LLC RESONANT  │      │    OUTPUT       │              │
│  │     DC-DC       │──────│    FILTER       │──── OUTPUT   │
│  │                 │      │                 │    50-500V   │
│  └─────────────────┘      └─────────────────┘              │
│          │                                                  │
│          │ 650V DC BUS                                     │
│          │                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              CENTRAL VIENNA PFC                      │   │
│  │         (Shared per rack - 100kW)                    │   │
│  │              3-phase 400VAC input                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 SiC MOSFETs

| Parameter | Value | Notes |
|-----------|-------|-------|
| Device | **Wolfspeed C3M0065090D** | 900V/36A SiC MOSFET |
| Voltage rating | 900V | Optimal for 650V bus |
| RDS(on) | 65 mΩ | @ 25°C |
| Package | TO-247 | Industry standard |
| Quantity per module | 4 | Full-bridge |

### 3.3 LLC Resonant Tank

| Parameter | Value |
|-----------|-------|
| Switching frequency | 150-250 kHz (resonant) |
| Resonant inductor (Lr) | 15 µH |
| Magnetizing inductor (Lm) | 75 µH |
| Resonant capacitor (Cr) | 47 nF |
| Transformer turns ratio | 1.3:1 |

### 3.4 Central PFC (Per Rack)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Topology | **Vienna Rectifier** | 3-phase, bidirectional-ready |
| Input voltage | 380-480V AC 3-phase | ±10% tolerance |
| Output voltage | **650V DC** | ±5% regulation |
| Output power | **100 kW** | Per PFC unit |
| Efficiency | >97% | @ full load |
| Power factor | >0.99 | @ >25% load |
| THD | <5% | EN 61000-3-12 |
| Controller | TMS320F28379D | Dual-core DSP |

---

## 4. Control System Architecture

### 4.1 STM32G474 Selection Rationale

```
┌─────────────────────────────────────────────────────────────┐
│                 STM32G474VET6 FEATURES                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CORE:                                                      │
│  • Cortex-M4F @ 170 MHz                                     │
│  • FPU for control loops                                    │
│  • 512 KB Flash, 128 KB RAM                                 │
│                                                             │
│  ANALOG (Critical for power electronics):                   │
│  • 5x ADC (12-bit, 4 Msps) - Current/voltage sensing        │
│  • 4x DAC (12-bit) - Reference generation                   │
│  • 7x Comparators - Overcurrent protection                  │
│  • 4x OpAmps - Signal conditioning                          │
│                                                             │
│  TIMING (Critical for LLC control):                         │
│  • HRTIM - 184 ps resolution PWM                            │
│  • 12x Timers                                               │
│  • CORDIC math accelerator - trig functions                 │
│  • FMAC - filter coprocessor                                │
│                                                             │
│  COMMUNICATION:                                             │
│  • 3x CAN-FD - Module coordination                          │
│  • 3x I2C - Sensor buses                                    │
│  • 4x SPI - Flash, external ADC                             │
│  • 6x UART - Debug, auxiliary                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Firmware Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRMWARE LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  APPLICATION                         │   │
│  │    Power Control  │  Thermal Mgmt  │  Diagnostics   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   EK-KOR2 RTOS                       │   │
│  │   Potential Field  │  Consensus  │  Heartbeat       │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                      HAL                             │   │
│  │    CAN-FD  │  ADC  │  HRTIM  │  GPIO  │  Timers     │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 STM32G474 HARDWARE                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Control Loop Timing

| Loop | Period | Priority |
|------|--------|----------|
| LLC Current control | 10 µs | Highest |
| Voltage control | 100 µs | High |
| MPPT / Efficiency | 1 ms | Medium |
| Thermal management | 100 ms | Low |
| CAN-FD messaging | 1-10 ms | Medium |
| Heartbeat | 10 ms | Medium |

---

## 5. EK-KOR2 RTOS

### 5.1 Overview

EK-KOR2 (Elektrokombinacija Koordinator v2) is a novel distributed RTOS for coordinating modular power systems WITHOUT a central controller.

### 5.2 Key Innovations

| Innovation | Description |
|------------|-------------|
| **Potential Field Scheduling** | No central scheduler - work flows along field gradients |
| **k=7 Topological Neighbors** | Each module tracks 7 nearest neighbors |
| **Threshold Consensus** | Distributed voting (supermajority = 67%) |
| **Adaptive Mesh Reformation** | Self-healing when modules fail |

### 5.3 Potential Field Concept

```
┌─────────────────────────────────────────────────────────────┐
│              POTENTIAL FIELD SCHEDULING                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Each module publishes a "field" with 5 components:         │
│  • Load (0.0 - 1.0)                                        │
│  • Thermal (normalized temperature)                         │
│  • Power (current output)                                   │
│  • Custom0, Custom1 (application-defined)                   │
│                                                             │
│  DECAY FORMULA:                                             │
│  ────────────────                                           │
│  sampled_value = stored_value × exp(-(now - timestamp)/τ)  │
│                                                             │
│  Where τ = 100ms (FIELD_DECAY_TAU_US)                      │
│                                                             │
│  GRADIENT COMPUTATION:                                      │
│  ─────────────────────                                      │
│  gradient = neighbor_aggregate - my_field                   │
│                                                             │
│  • Positive gradient → neighbors are "higher" → pull work   │
│  • Negative gradient → I am "higher" → push work            │
│  • Zero gradient → balanced state                           │
│                                                             │
│  RESULT: Work naturally flows from high-load to low-load    │
│          modules without central coordination               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Module State Machine

```
                    ┌──────────┐
                    │   INIT   │
                    └────┬─────┘
                         │ start()
                         ▼
                  ┌──────────────┐
            ┌─────│ DISCOVERING  │─────┐
            │     └──────┬───────┘     │
            │            │             │
            │     found neighbors      │ timeout
            │            │             │
            ▼            ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ ISOLATED │  │  ACTIVE  │  │ DEGRADED │
    └────┬─────┘  └────┬─────┘  └────┬─────┘
         │             │             │
         │     neighbor lost         │
         │◄────────────┼─────────────┘
         │             │
         │      consensus: reform
         │             │
         │             ▼
         │      ┌──────────┐
         └─────►│ REFORMING│─────────► ACTIVE
                └──────────┘
```

### 5.5 Configuration Constants

| Constant | Value | Description |
|----------|-------|-------------|
| K_NEIGHBORS | 7 | Topological neighbors per module |
| MAX_MODULES | 256 | Maximum modules in cluster |
| FIELD_COUNT | 5 | Field components |
| FIELD_DECAY_TAU_US | 100,000 | Decay time constant (100ms) |
| HEARTBEAT_PERIOD_US | 10,000 | Heartbeat interval (10ms) |
| HEARTBEAT_TIMEOUT_COUNT | 5 | Missed heartbeats = dead |
| VOTE_TIMEOUT_US | 50,000 | Vote collection window (50ms) |
| MAX_BALLOTS | 4 | Concurrent voting rounds |

### 5.6 Consensus Protocol

```
PROPOSAL → VOTE → TALLY → RESULT

Thresholds:
• SimpleMajority:  50% (power changes)
• Supermajority:   67% (mesh reformation)
• Unanimous:      100% (shutdown)

Vote Values:
• YES (1)     - Approve proposal
• NO (2)      - Reject proposal
• ABSTAIN (0) - No vote
• INHIBIT (3) - Block competing proposal
```

---

## 6. Communication Protocol

### 6.1 CAN-FD Configuration

| Parameter | Value |
|-----------|-------|
| Nominal bitrate | 500 kbps |
| Data bitrate | 5 Mbps |
| Payload | 64 bytes |
| Transceiver | NXP TJA1443 |

### 6.2 Message Types

| ID Range | Type | Size | Period |
|----------|------|------|--------|
| 0x100-0x1FF | Heartbeat | 7 bytes | 10ms |
| 0x200-0x2FF | Discovery | 10 bytes | 100ms |
| 0x300-0x3FF | Field Update | 24 bytes | 100ms |
| 0x400-0x4FF | Vote | 8 bytes | On-demand |
| 0x500-0x5FF | Proposal | 12 bytes | On-demand |
| 0x600-0x6FF | Power Command | 16 bytes | On-demand |
| 0x700-0x7FF | Diagnostic | 64 bytes | On-demand |

### 6.3 Heartbeat Message (7 bytes)

```
Offset  Size  Field
────────────────────────────
0       1     sender_id
1       1     sequence
2       1     state (ModuleState)
3       1     neighbor_count
4       1     load_percent (0-100)
5       1     thermal_percent (0-100)
6       1     flags
```

### 6.4 Field Update Message (24 bytes)

```
Offset  Size  Field
────────────────────────────
0       1     sender_id
1       1     sequence
2       4     timestamp (lower 32 bits)
6       4     component[0] (Fixed Q16.16)
10      4     component[1]
14      4     component[2]
18      4     component[3]
22      2     component[4] (truncated)
```

---

## 7. Sensor Integration

### 7.1 Current Sensing

| Parameter | Specification |
|-----------|---------------|
| Sensor type | Hall effect (isolated) |
| Recommended | LEM HLSR 50-P |
| Range | ±50A |
| Accuracy | ±1% |
| Bandwidth | DC - 100 kHz |
| Output | ±4V (@ ±50A) |
| Interface | Analog → ADC |

**MikroE Alternative:** Current 6 Click (ACS37800)

### 7.2 Voltage Sensing

| Parameter | Specification |
|-----------|---------------|
| Method | Resistor divider + buffer |
| Input range | 0-750V DC |
| Divider ratio | 1:150 |
| Output | 0-5V |
| Accuracy | ±0.5% |

**MikroE Alternative:** Volt 2 Click

### 7.3 Thermal Sensing

| Location | Sensor | Threshold |
|----------|--------|-----------|
| SiC MOSFETs (×4) | NTC 10kΩ | 125°C |
| Transformer | NTC 10kΩ | 100°C |
| Ambient | NTC 10kΩ | 55°C |
| Heatsink | NTC 10kΩ | 80°C |

**MikroE Alternative:** Thermostat 4 Click (MAX31875)

### 7.4 ADC Configuration (STM32G474)

| Channel | Signal | Range | Rate |
|---------|--------|-------|------|
| ADC1_IN1 | Input current | ±50A | 1 Msps |
| ADC1_IN2 | Output current | ±50A | 1 Msps |
| ADC2_IN1 | Bus voltage | 0-750V | 100 ksps |
| ADC2_IN2 | Output voltage | 0-500V | 100 ksps |
| ADC3_IN1-4 | NTC temps (×4) | -40..150°C | 1 ksps |

---

## 8. Development Requirements

### 8.1 Hardware Needed (MikroE Products)

| Product | Qty | Purpose | Est. Price |
|---------|-----|---------|------------|
| Fusion for STM32 v8 | 2 | Main development | $200 |
| Clicker 2 for STM32 | 2 | Compact testing | $60 |
| CAN FD Click | 2 | Inter-module comm | $50 |
| CAN FD 2 Click | 2 | Backup/second bus | $50 |
| Current 6 Click | 2 | Current sensing | $40 |
| Volt 2 Click | 2 | Voltage sensing | $40 |
| Thermostat 4 Click | 2 | Thermal monitoring | $40 |
| ADC 10 Click | 2 | High-res ADC | $30 |
| **TOTAL** | | | **~$510** |

### 8.2 Software Tools

| Tool | Purpose | License |
|------|---------|---------|
| NECTO Studio | MikroE unified IDE | Free |
| mikroSDK | HAL library | Free |
| STM32CubeIDE | ST development | Free |
| STM32CubeMX | Pin/clock config | Free |

### 8.3 Technical Consultation Areas

1. **STM32G474 Best Practices**
   - CAN-FD @ 5 Mbps configuration
   - ADC multi-channel synchronization
   - HRTIM for LLC control (184ps resolution)
   - Low-power modes for standby

2. **EMC/EMI Considerations**
   - PCB layout for mixed-signal
   - CAN bus termination (multi-node)
   - Filtering near power stage

3. **Click Board Integration**
   - Best Click selection for our use case
   - Custom Click board possibility?

---

## 9. Source Code Package

### 9.1 Included Files

```
ek-kor2/
├── README.md                 # Project overview
├── DEVELOPMENT.md            # Development guide
├── spec/
│   ├── api.md               # Full API specification
│   └── state-machines.md    # State diagrams
├── c/
│   ├── CMakeLists.txt
│   ├── include/ekk/         # Header files (public API)
│   │   ├── ekk.h           # Main header
│   │   ├── ekk_types.h     # Type definitions
│   │   ├── ekk_field.h     # Field module API
│   │   ├── ekk_topology.h  # Topology API
│   │   ├── ekk_heartbeat.h # Heartbeat API
│   │   ├── ekk_consensus.h # Consensus API
│   │   ├── ekk_module.h    # Integration API
│   │   ├── ekk_hal.h       # HAL interface
│   │   ├── ekk_auth.h      # Authentication API
│   │   └── ekk_spsc.h      # Lock-free queue
│   ├── src/
│   │   ├── ekk_field.c     # Field implementation
│   │   ├── ekk_topology.c  # Topology implementation
│   │   ├── ekk_heartbeat.c # Heartbeat implementation
│   │   ├── ekk_consensus.c # Consensus implementation
│   │   ├── ekk_module.c    # Integration
│   │   ├── ekk_types.c     # Fixed-point math
│   │   ├── ekk_auth.c      # Chaskey MAC
│   │   ├── ekk_spsc.c      # SPSC queue
│   │   ├── ekk_init.c      # Initialization
│   │   └── hal/
│   │       ├── ekk_hal_stm32g474.c  # STM32 HAL
│   │       └── ekk_hal_posix.c      # POSIX HAL (testing)
│   └── test/
│       └── test_main.c     # Unit tests
└── rust/
    ├── Cargo.toml
    └── src/
        ├── lib.rs          # Library entry
        ├── types.rs        # Type definitions
        ├── field.rs        # Field module
        ├── topology.rs     # Topology module
        ├── heartbeat.rs    # Heartbeat module
        ├── consensus.rs    # Consensus module
        ├── module.rs       # Integration
        └── hal.rs          # HAL trait
```

### 9.2 Building

**C Implementation:**
```bash
cd ek-kor2/c
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
make
```

**Rust Implementation:**
```bash
cd ek-kor2/rust
cargo build --release
```

### 9.3 License

MIT License - Copyright (c) 2026 Elektrokombinacija

---

## Contact

**Bojan Janjatovic**
Founder & CTO, Elektrokombinacija

Email: bojan.janjatovic@gmail.com
Location: Kikinda, Serbia

---

*Document prepared: January 2026*
*Classification: CONFIDENTIAL - Under NDA*
