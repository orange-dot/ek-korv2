# EK3 Master Specifications

**Version:** 1.0
**Date:** 2026-01-03
**Status:** STANDARDIZED

---

## Document Purpose

This document is the **single source of truth** for all EK3 specifications. All other documents in the repository must be aligned with the values here.

---

## EK3 Module - Standard Specifications

### Electrical Characteristics

| Parameter | Value | Notes |
|-----------|-------|-------|
| Power (continuous) | **3.3 kW** | LLC resonant DC/DC |
| Power (peak) | **3.6 kW** | Short-term |
| Input voltage | 650V DC | From central PFC |
| Output voltage | 50-500V DC | Full battery range |
| Efficiency (peak) | >96% | @ 50% load |
| Efficiency (full load) | >94% | @ 3.3 kW |
| Standby consumption | <3W | Deep sleep mode |

### Power Electronics

| Parameter | Value | Notes |
|-----------|-------|-------|
| SiC MOSFET | **900V (Wolfspeed C3M0065090D)** | Optimal balance of cost and margin |
| Topology | LLC Resonant DC/DC | ZVS, ZCS |
| Switching frequency | 150-250 kHz | Resonant |
| Transformer | Planar, PCB integrated | Manufacturing repeatability |
| Capacitors | Film only | No electrolytics, >50,000h |

### Physical Characteristics

| Parameter | Value | Notes |
|-----------|-------|-------|
| Dimensions | **200 × 320 × 44 mm** | 1U half-width |
| Mass | **~3.5 kg** | With heatsink |
| Form factor | Custom rack blade | Not 19" telecom |
| Cooling | Forced air (shared plenum) | Front-to-back |

### Thermal Management

| Parameter | Value | Notes |
|-----------|-------|-------|
| Heatsink material | **Al 6063-T5** | k = 200 W/m·K |
| Heatsink dimensions | 180 × 280 × 33 mm | 72 fins, 2.5mm pitch |
| Thermal resistance (Rth,j-a) | **1.20 K/W** | Junction to ambient |
| TIM | Bergquist GP5000 | 5.0 W/m·K, 0.25mm |
| Max junction temp (Tj) | **125°C** | Target: 120°C with margin |
| Operating ambient | -20°C to +55°C | Full power ≤35°C |
| Airflow per module | **12 CFM** | 2.5 m/s through fins |
| Pressure drop | 15 Pa | Module only |

### Thermal Derating

| Ambient (°C) | Max Power | % Rated |
|--------------|-----------|---------|
| ≤35 | 3.3 kW | 100% |
| 40 | 3.0 kW | 91% |
| 45 | 2.7 kW | 82% |
| 50 | 2.3 kW | 70% |
| 55 | 1.8 kW | 55% |
| ≥60 | SHUTDOWN | 0% |

*See `tehnika/03-thermal-management.md` Section 10.5 for altitude derating.*

### Control and Communication

| Parameter | Value | Notes |
|-----------|-------|-------|
| MCU | **STM32G474** | Cortex-M4 @ 170MHz |
| Communication | **CAN-FD @ 5 Mbps** | 64-byte payload |
| CAN transceiver | NXP TJA1443 | CAN-FD capable |
| Latency | <1ms per message | Real-time |

### Connectors

| Parameter | Value | Notes |
|-----------|-------|-------|
| Data connector | **20-pin blind-mate** | CAN-FD, I2C, PWM |
| Power connectors | Anderson SBS50 | Sequenced mating |
| Hot-swap time | <1 second | Electrical disconnect |
| Mating cycles | >50,000 | Robot-grade |
| Insertion force | <20N | Robot-friendly |

### Reliability

| Parameter | Value | Notes |
|-----------|-------|-------|
| MTBF | >100,000 h | Calculated |
| Lifespan | >50,000 h | Film capacitors |
| Capacity loss per fault | 0.33% | 1/303 modules |

---

## Custom Rack Specifications

### Dimensions (Preliminary)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Width | ~900 mm | For 4× modules + spacing |
| Depth | ~500 mm | Module + airflow |
| Height | ~1200 mm | More compact than 42U |
| Mass (full) | ~350 kg | With 84 modules |
| Power per rack | **277 kW** | 84 × 3.3 kW |

### Thermal Design

| Parameter | Value | Notes |
|-----------|-------|-------|
| Airflow | Front-to-back | Shared plenum |
| Dissipation | ~11 kW | At 96% efficiency |
| Filter | Easily replaceable | Robot accessible |

### Central PFC

| Parameter | Value | Notes |
|-----------|-------|-------|
| Input | 400V AC 3-phase | Grid connection |
| Output | 650V DC | DC bus for EK3 modules |
| Redundancy | Modular design | N+1 |

---

## Scaling

| Use Case | Modules | Racks | Power |
|----------|---------|-------|-------|
| E-bike | 1 | - | 3.3 kW |
| Home charger | 3-7 | - | 10-23 kW |
| DC Fast 50kW | 16 | Half | 53 kW |
| DC Fast 150kW | 46 | 1 | 152 kW |
| Highway 350kW | 106 | 2 | 350 kW |
| Bus Depot 500kW | 152 | 2 | 502 kW |
| Truck 1MW | 303 | 4 | 1 MW |
| MCS 3MW | 909 | 12 | 3 MW |

---

## Reference Documents

| Document | Location |
|----------|----------|
| Architecture overview | `tehnika/00-arhitektura.md` |
| Power electronics | `tehnika/01-power-electronics.md` |
| Thermal management | `tehnika/03-thermal-management.md` |
| Rack system | `tehnika/09-ek3-rack-sistem.md` |
| Control system | `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` |
| EK3 detailed design | `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` |
| Communication | `tehnika/komponente/komunikacija.md` |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.1 | Added thermal management specs: heatsink, Rth, derating curves |
| 2026-01-03 | 1.0 | Initial standardization: 3.3kW, 900V SiC, CAN-FD, custom rack |
