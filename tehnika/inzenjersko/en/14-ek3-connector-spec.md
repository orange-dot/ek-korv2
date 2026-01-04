# EK3 Connector Specification

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-015 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Connector Overview

### 1.1 Design Philosophy: Blind-Mate

The EK3 connector system is designed for blind-mate operation, enabling:

1. **Robotic insertion**: No visual alignment required
2. **Hot-swap capability**: Module replacement without rack shutdown
3. **High reliability**: Self-aligning with positive engagement feedback
4. **Safety**: Sequenced mating (ground first, power last)

### 1.2 Requirements Summary

| Requirement | Specification |
|-------------|---------------|
| Power rating | 3.3 kW per module |
| DC voltage | 200-920 VDC |
| DC current | Up to 4A continuous |
| Signal count | 12 signals (CAN, SPI, I2C, ID) |
| Mating cycles | >10,000 |
| Hot-swap | Yes, with pre-charge |
| Robotic compatible | Yes |

---

## 2. Mechanical Design

### 2.1 Connector Selection

**Primary recommendation: TE Connectivity MULTIGIG RT**

| Parameter | Value |
|-----------|-------|
| Series | MULTIGIG RT 2-R |
| Contact count | 20 positions |
| Power contacts | 8 (4 × DC+, 4 × DC-) |
| Signal contacts | 12 |
| Pitch | 2.0 mm |
| Current rating | 30A per power contact |
| Voltage rating | 1000 VDC |
| Mating cycles | 10,000+ |

**Alternative: Amphenol Millipacs**

| Parameter | Value |
|-----------|-------|
| Series | Millipacs 070 |
| Configuration | Custom 20-pin |
| Power rating | 25A per contact |
| Mating cycles | 5,000 |
| Use case | Lower cost option |

### 2.2 Connector Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    20-Pin Connector Layout                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Module Side (Male)                Backplane Side (Female)     │
│                                                                  │
│    ┌───────────────────────┐        ┌───────────────────────┐   │
│    │                       │        │                       │   │
│    │  1   2   3   4   5    │        │  1   2   3   4   5    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    │  6   7   8   9  10    │        │  6   7   8   9  10    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │       ▼               │        │       ▼               │   │
│    │     (key)             │        │    (keyway)           │   │
│    │ 11  12  13  14  15    │        │ 11  12  13  14  15    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    │ 16  17  18  19  20    │        │ 16  17  18  19  20    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    └───────────────────────┘        └───────────────────────┘   │
│                                                                  │
│    ● = Male pin (module)                                        │
│    ○ = Female socket (backplane)                                │
│    ▼ = Polarization key                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Keying System

**Polarization Key:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Keying Configurations                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Key Position A: EK3 Standard (3.3 kW, 920V max)              │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │      ▼              │  Key at position 7-8                 │
│    │  ● ●   ● ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Key Position B: EK3-HV (High Voltage, 1200V)                 │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │        ▼            │  Key at position 8-9                 │
│    │  ● ● ●   ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Key Position C: Reserved (Future)                            │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │    ▼                │  Key at position 6-7                 │
│    │  ●   ● ● ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Incompatible keys prevent wrong module insertion              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Insertion and Extraction

**Force Requirements:**

| Operation | Force | Tolerance |
|-----------|-------|-----------|
| Insertion (max) | 50 N | ±10 N |
| Extraction (min) | 20 N | ±5 N |
| Latch engagement | 10 N | ±3 N |
| Latch release | 15 N | ±5 N |

**Locking Mechanism:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Locking Lever Mechanism                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Unlocked Position:                 Locked Position:           │
│                                                                  │
│    ┌──────────────────┐              ┌──────────────────┐       │
│    │                  │              │                  │       │
│    │  ┌─────────────┐ │              │  ┌─────────────┐ │       │
│    │  │   Module    │ │              │  │   Module    │ │       │
│    │  │             │ │              │  │             │ │       │
│    │  │    ╔═╗      │ │              │  │    ╔═╗      │ │       │
│    │  │    ║ ║◄─────┼─┘              │  │    ║▄║◄─────┼─┘       │
│    │  │    ╚═╝ Lever│                │  │    ╚═╝ Lever│         │
│    │  │             │                │  │     │       │         │
│    │  └─────────────┘                │  └─────┼───────┘         │
│    │                                 │        │                  │
│    │  Lever: UP (open)               │  Lever: DOWN (locked)    │
│    │                                 │        ▼                  │
│    └──────────────────┘              │  Engages backplane slot  │
│                                      └──────────────────┘       │
│                                                                  │
│    Locking sequence:                                             │
│    1. Insert module until lever contacts backplane              │
│    2. Rotate lever 90° downward                                 │
│    3. Cam action pulls module into final position               │
│    4. Positive click indicates full engagement                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Mating Cycle Rating

| Parameter | Specification |
|-----------|---------------|
| Rated cycles | 10,000 minimum |
| Test standard | EIA-364-09 |
| Contact wear | <20 mΩ increase @ 10K cycles |
| Housing wear | No visible damage @ 10K cycles |

**Design for 10,000 cycles:**
- Gold-plated contacts (1.27 µm min)
- Self-wiping contact design
- Polymer housing with embedded lubricant
- Guide rails prevent angular insertion

---

## 3. Electrical Design

### 3.1 Pin Assignment

```
┌─────────────────────────────────────────────────────────────────┐
│                     Pin Assignment Table                         │
├──────┬─────────────┬───────────────────────────────────────────┤
│ Pin  │ Signal      │ Description                               │
├──────┼─────────────┼───────────────────────────────────────────┤
│  1   │ GND         │ Chassis ground (first mate)               │
│  2   │ GND         │ Chassis ground (first mate)               │
│  3   │ CAN-A_H     │ CAN Bus A, High                           │
│  4   │ CAN-A_L     │ CAN Bus A, Low                            │
│  5   │ CAN-B_H     │ CAN Bus B (backup), High                  │
├──────┼─────────────┼───────────────────────────────────────────┤
│  6   │ CAN-B_L     │ CAN Bus B (backup), Low                   │
│  7   │ KEY         │ Keying position (no contact)              │
│  8   │ KEY         │ Keying position (no contact)              │
│  9   │ SPI_CLK     │ Diagnostics SPI clock                     │
│ 10   │ SPI_MOSI    │ Diagnostics SPI data out                  │
├──────┼─────────────┼───────────────────────────────────────────┤
│ 11   │ SPI_MISO    │ Diagnostics SPI data in                   │
│ 12   │ SPI_CS      │ Diagnostics SPI chip select               │
│ 13   │ I2C_SDA     │ EEPROM I2C data                           │
│ 14   │ I2C_SCL     │ EEPROM I2C clock                          │
│ 15   │ MOD_ID_0    │ Module ID bit 0 (resistor coded)          │
├──────┼─────────────┼───────────────────────────────────────────┤
│ 16   │ MOD_ID_1    │ Module ID bit 1 (resistor coded)          │
│ 17   │ DC+         │ DC Bus positive (last mate)               │
│ 18   │ DC+         │ DC Bus positive (last mate)               │
│ 19   │ DC-         │ DC Bus negative (last mate)               │
│ 20   │ DC-         │ DC Bus negative (last mate)               │
└──────┴─────────────┴───────────────────────────────────────────┘
```

### 3.2 Power Pin Design

**DC Bus Connections:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Power Pin Configuration                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ Rail (Pins 17, 18):                                      │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Pin 17 ────┬──── DC+ to Module                      │  │
│    │               │                                         │  │
│    │    Pin 18 ────┘     Combined: 60A capacity             │  │
│    │                     (30A × 2 pins, derated to 4A use)  │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    DC- Rail (Pins 19, 20):                                      │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Pin 19 ────┬──── DC- to Module                      │  │
│    │               │                                         │  │
│    │    Pin 20 ────┘     Combined: 60A capacity             │  │
│    │                     (redundancy for reliability)       │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Electrical Specifications:                                    │
│    • Voltage rating: 1000 VDC                                   │
│    • Current per pin: 30A max                                   │
│    • Total current: 4A continuous (design limit)                │
│    • Contact resistance: <1 mΩ per pin                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Signal Pin Design

**CAN Differential Pairs:**

| Parameter | Specification |
|-----------|---------------|
| Impedance | 120Ω differential |
| Data rate | 5 Mbps (CAN-FD) |
| Voltage levels | CAN 2.0 (dominant: 1.5-3.0V differential) |
| Common mode | 0-12V |
| Protection | TVS diodes on module side |

**Diagnostics Interface (SPI):**

| Parameter | Specification |
|-----------|---------------|
| Clock frequency | Up to 10 MHz |
| Voltage levels | 3.3V CMOS |
| Purpose | Factory test, field diagnostics |
| Usage | Not used during normal operation |

**Module ID Resistor Coding:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   Module ID Encoding                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ID pins use resistor voltage dividers:                        │
│                                                                  │
│    3.3V ────┬───────────────────────► MOD_ID_x                  │
│             │                                                    │
│            ┌┴┐                                                   │
│            │ │ R_top                                             │
│            └┬┘                                                   │
│             │                                                    │
│            ─┴─ R_bot                                             │
│             │                                                    │
│            ─┴─ GND                                               │
│                                                                  │
│    ID Encoding Table:                                            │
│    ┌─────────┬─────────┬─────────┬──────────────────────┐       │
│    │ ID[1:0] │ R_top   │ R_bot   │ Voltage (approx)     │       │
│    ├─────────┼─────────┼─────────┼──────────────────────┤       │
│    │   00    │ 10kΩ    │ GND     │ 0V                   │       │
│    │   01    │ 10kΩ    │ 10kΩ    │ 1.65V                │       │
│    │   10    │ 10kΩ    │ 3.3kΩ   │ 0.82V                │       │
│    │   11    │ 10kΩ    │ 22kΩ    │ 2.27V                │       │
│    └─────────┴─────────┴─────────┴──────────────────────┘       │
│                                                                  │
│    Purpose: Slot identification for inventory tracking          │
│             (Module has resistors, backplane has ADC)           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Pre-Charge Sequencing

Hot-swap requires controlled power application to prevent arc damage:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Mating Sequence (First to Last)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Insertion Depth (mm)    Signal Contact                        │
│    ────────────────────    ──────────────                        │
│                                                                  │
│          0 ──────────────► Module not inserted                  │
│          │                                                       │
│          │                                                       │
│         10 ──────────────► GND (pins 1, 2) FIRST                │
│          │                 • Chassis ground established         │
│          │                 • Static discharge path              │
│          │                                                       │
│         15 ──────────────► Signals (pins 3-16)                  │
│          │                 • CAN buses connect                   │
│          │                 • Module announces presence           │
│          │                 • Pre-charge circuit enabled          │
│          │                                                       │
│         20 ──────────────► Power (pins 17-20) LAST              │
│          │                 • DC bus connects                     │
│          │                 • Pre-charge limits inrush            │
│          │                 • Module soft-starts                  │
│          │                                                       │
│         25 ──────────────► Full engagement (latched)            │
│                                                                  │
│    Pin Length Difference:                                        │
│    • GND pins: +3mm longer                                      │
│    • Signal pins: nominal length                                │
│    • Power pins: -3mm shorter                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pre-Charge Circuit (Module Side):**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Pre-Charge Circuit                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ (from connector)                                          │
│         │                                                        │
│         ├────────────────────────────────┐                      │
│         │                                │                      │
│        ─┴─ K1 (main contactor)          ─┴─                     │
│        ─┬─                               │  R_precharge         │
│         │                                │  (100Ω, 50W)         │
│         │                               ─┬─                     │
│         │                                │                      │
│         │    K2 (precharge relay)       ─┴─                     │
│         │         ─┬─                                           │
│         │          │                                            │
│         ├──────────┴─────────────────────┤                      │
│         │                                │                      │
│         ▼                                │                      │
│    DC Link Capacitors                    │                      │
│    (100µF total)                         │                      │
│         │                                │                      │
│         └────────────────────────────────┴──────► To converter  │
│                                                                  │
│    Sequence:                                                     │
│    1. Module inserted, GND makes first                          │
│    2. CAN connected, module detected                            │
│    3. Station enables pre-charge (K2 closes)                    │
│    4. DC link charges through R_precharge                       │
│    5. When Vlink > 90% Vbus, K1 closes                          │
│    6. K2 opens (precharge complete)                             │
│    7. Module ready for operation                                │
│                                                                  │
│    Pre-charge time: ~500ms (τ = R×C = 100Ω × 100µF × 5)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ESD Protection

### 4.1 Protection Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ESD Protection Scheme                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Location: Module side (all signal and power pins)            │
│                                                                  │
│    Signal Pins (CAN, SPI, I2C):                                 │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │    Connector Pin ──┬──────────────────► To MCU/Xcvr   │    │
│    │                    │                                  │    │
│    │                   ─┴─                                 │    │
│    │                   ╲╱  TVS (bidirectional)             │    │
│    │                   ─┬─  PESD5V0S2BT                    │    │
│    │                    │   • Working voltage: 5V          │    │
│    │                   ─┴─  • Clamp voltage: 15V           │    │
│    │                    │   • ESD rating: ±30 kV          │    │
│    │                   GND                                 │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
│    Power Pins (DC+, DC-):                                       │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │    DC+ Pin ────────┬──────────────────► To DC link    │    │
│    │                    │                                  │    │
│    │                   ─┴─                                 │    │
│    │                    │  Varistor                        │    │
│    │                   ─┬─  V1000LA40BP                    │    │
│    │                    │   • Clamping: 1650V              │    │
│    │                   ─┴─  • Energy: 300J                 │    │
│    │                    │                                  │    │
│    │    DC- Pin ────────┴──────────────────► To DC link    │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
│    Ground Pins:                                                  │
│    • Direct connection to chassis (no TVS needed)               │
│    • Provides ESD discharge path for all other pins             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 ESD Ratings

| Parameter | Specification | Test Standard |
|-----------|---------------|---------------|
| HBM (Human Body Model) | ±15 kV | ANSI/ESDA/JEDEC JS-001 |
| CDM (Charged Device Model) | ±2 kV | ANSI/ESDA/JEDEC JS-002 |
| Contact discharge | ±8 kV | IEC 61000-4-2 |
| Air discharge | ±15 kV | IEC 61000-4-2 |

---

## 5. Thermal Considerations

### 5.1 Contact Temperature Rise

| Current | Temperature Rise | Limit |
|---------|------------------|-------|
| 4A continuous | <15°C | 30°C max |
| 10A (transient, 10s) | <25°C | 40°C max |
| 30A (peak, 100ms) | <10°C | 40°C max |

### 5.2 Derating

```
┌─────────────────────────────────────────────────────────────────┐
│                Contact Current Derating                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Current                                                       │
│    (A)                                                           │
│     30 ┼───────┐                                                │
│        │       │                                                 │
│     25 ┼       └────┐                                           │
│        │            │                                            │
│     20 ┼            └────┐                                      │
│        │                 │                                       │
│     15 ┼                 └────┐                                 │
│        │                      │                                  │
│     10 ┼                      └────┐                            │
│        │                           │                             │
│      5 ┼                           └────┐                       │
│        │                                └────                   │
│      0 ┼────┬────┬────┬────┬────┬────┬────┬────► Temp (°C)     │
│           25   40   55   70   85  100  115                      │
│                                                                  │
│    Design point: 4A @ 85°C ambient (60% derate from 30A rating) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Mechanical Specifications Summary

### 6.1 Module Connector (Male)

| Parameter | Value |
|-----------|-------|
| Part number | TE 2-2170718-x (custom) |
| Mounting | PCB through-hole |
| PCB thickness | 1.6 mm |
| Standoff height | 5.0 mm |
| Mating interface height | 15.0 mm |
| Contact material | Copper alloy, gold plated |
| Housing material | LCP (Liquid Crystal Polymer) |
| Operating temp | -40°C to +105°C |

### 6.2 Backplane Connector (Female)

| Parameter | Value |
|-----------|-------|
| Part number | TE 2-2170719-x (custom) |
| Mounting | Press-fit to backplane |
| Backplane thickness | 2.4 mm |
| Contact material | Copper alloy, gold plated |
| Housing material | LCP |
| Guide posts | 2× (for blind-mate alignment) |

### 6.3 Connector Dimensions

```
┌─────────────────────────────────────────────────────────────────┐
│                  Module Connector Dimensions                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Front View:                      Side View:                   │
│                                                                  │
│    ┌───────────────────┐           ┌─────────┐                  │
│    │ ● ● ● ● ●         │           │         │                  │
│    │ ● ● ● ● ●         │           │ Housing │ 15.0 mm          │
│    │     ▼             │  40 mm    │         │                  │
│    │ ● ● ● ● ●         │           ├─────────┤                  │
│    │ ● ● ● ● ●         │           │  Pins   │ 5.0 mm           │
│    └───────────────────┘           └─────────┘                  │
│           25 mm                         │                        │
│                                         ▼                        │
│                                       PCB                        │
│                                                                  │
│    Overall dimensions: 25 × 40 × 20 mm (W × H × D)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. References

| Document | Description |
|----------|-------------|
| `tehnika/16-custom-rack-system.md` | Rack system and backplane |
| `tehnika/13-hardware-security.md` | ESD and EMC details |
| `tehnika/10-microkernel-architecture.md` | Hot-swap requirements |
| TE Connectivity MULTIGIG RT | Product specification |
| IEC 61000-4-2 | ESD immunity test standard |

---

## Appendix A: Connector Ordering Information

| Item | Part Number | Quantity |
|------|-------------|----------|
| Module connector (male) | EK-CONN-M20-A | 1 per module |
| Backplane connector (female) | EK-CONN-F20-A | 1 per slot |
| Keying plug (Position A) | EK-KEY-A | 1 per connector |
| Keying plug (Position B) | EK-KEY-B | As needed |
| Extraction tool | EK-TOOL-EXT | 1 per station |

---

## Appendix B: Contact Resistance Measurement

| Measurement Point | New | After 1K cycles | After 10K cycles | Limit |
|-------------------|-----|-----------------|------------------|-------|
| Power contacts (each) | <0.5 mΩ | <0.7 mΩ | <1.0 mΩ | 2.0 mΩ |
| Signal contacts (each) | <10 mΩ | <15 mΩ | <20 mΩ | 50 mΩ |
| Ground contacts (each) | <0.5 mΩ | <0.7 mΩ | <1.0 mΩ | 2.0 mΩ |
