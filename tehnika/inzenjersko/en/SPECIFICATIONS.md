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
| Topology | **Vienna Rectifier** | 3-phase, bidirectional-ready |
| Input voltage | 380-480V AC 3-phase | ±10% tolerance |
| Input frequency | 50/60 Hz | Auto-detect |
| Output voltage | **650V DC** | ±5% regulation |
| Output power | **100 kW** | Per PFC unit |
| Efficiency | >97% | @ full load |
| Power factor | >0.99 | @ >25% load |
| THD | <5% | EN 61000-3-12 |
| Controller | TMS320F28379D | Dual-core DSP |
| Form factor | 3U × 19" | Rack-mount |
| Redundancy | Modular design | N+1 available |

### Rack Controller

| Parameter | Value | Notes |
|-----------|-------|-------|
| MCU | **STM32G474VET6** | Same as EK3 modules |
| Firmware | **JEZGRO microkernel** | Unified with EK3 firmware |
| CAN interface | 2× CAN-FD | 5 Mbps, dual bus |
| Fan control | 15× PWM outputs | 5 zones × 3 fans |
| Ethernet | Optional W5500 SPI | Direct network access |

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

## EK-BAT Battery Module Family

The EK-BAT family extends Elektrokombinacija's modularity philosophy from charger modules to vehicle batteries. Three standardized sizes cover all heavy commercial vehicle classes.

### EK-BAT-25 (Van Module)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Capacity | **25 kWh** | Net usable |
| Nominal voltage | 400V | 350-450V range |
| Mass | **150 kg** | Including BMS, enclosure |
| Dimensions | 600 × 400 × 300 mm | Robot-compatible |
| Chemistry | LFP (LiFePO4) | Safest chemistry |
| Energy density | 167 Wh/kg | Pack level |
| C-rate (charge) | 2C | 50 kW max |
| C-rate (discharge) | 3C | 75 kW max |
| Cycle life | >4,000 | @ 80% DoD |
| Calendar life | 10 years | |
| Cooling | Liquid | Shared loop |
| Operating temp | -20°C to +55°C | Full power 0-45°C |
| IP rating | IP67 | Submersible |
| BMS | Distributed, ROJ-ready | STM32G474 |

**Target vehicles:** Delivery vans (2× = 50 kWh), small trucks (class 3.5t)

### EK-BAT-50 (Bus Module)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Capacity | **50 kWh** | Net usable |
| Nominal voltage | 400V | 350-450V range |
| Mass | **300 kg** | Including BMS, enclosure |
| Dimensions | 900 × 600 × 300 mm | Robot-compatible |
| Chemistry | LFP (LiFePO4) | Safest chemistry |
| Energy density | 167 Wh/kg | Pack level |
| C-rate (charge) | 2C | 100 kW max |
| C-rate (discharge) | 3C | 150 kW max |
| Cycle life | >4,000 | @ 80% DoD |
| Calendar life | 10 years | |
| Cooling | Liquid | Shared loop |
| Operating temp | -20°C to +55°C | Full power 0-45°C |
| IP rating | IP67 | Submersible |
| BMS | Distributed, ROJ-ready | STM32G474 |

**Target vehicles:** City buses (2× = 100 kWh), regional buses (3× = 150 kWh), medium trucks

### EK-BAT-100 (Truck Module)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Capacity | **100 kWh** | Net usable |
| Nominal voltage | 800V | 700-900V range |
| Mass | **600 kg** | Including BMS, enclosure |
| Dimensions | 1200 × 800 × 400 mm | Robot-compatible |
| Chemistry | LFP (LiFePO4) | Safest chemistry |
| Energy density | 167 Wh/kg | Pack level |
| C-rate (charge) | 2C | 200 kW max |
| C-rate (discharge) | 3C | 300 kW max |
| Cycle life | >4,000 | @ 80% DoD |
| Calendar life | 10 years | |
| Cooling | Liquid | Shared loop |
| Operating temp | -20°C to +55°C | Full power 0-45°C |
| IP rating | IP67 | Submersible |
| BMS | Distributed, ROJ-ready | STM32G474 |

**Target vehicles:** Long-haul trucks (4× = 400 kWh), heavy buses, articulated buses

### EK-BAT Connector Specifications

| Parameter | EK-BAT-25/50 | EK-BAT-100 |
|-----------|--------------|------------|
| Power connector | Anderson SBS350 | REMA DIN 320A |
| Data connector | Harting Han-Modular 10A | Harting Han-Modular 10A |
| Coolant connector | Stäubli DN12 | Stäubli DN20 |
| Mating cycles (power) | >10,000 | >10,000 |
| Mating cycles (data) | >5,000 | >5,000 |
| Mating cycles (coolant) | >50,000 | >50,000 |
| Contact resistance | <0.1 mΩ | <0.1 mΩ |
| Blind mating tolerance | ±3 mm | ±3 mm |

### EK-BAT Robot Grip Points

| Module | Grip spacing | Interface |
|--------|--------------|-----------|
| EK-BAT-25 | 400 × 200 mm | M10 inserts × 4 |
| EK-BAT-50 | 700 × 400 mm | M10 inserts × 4 |
| EK-BAT-100 | 1000 × 600 mm | M10 inserts × 4 |

### Vehicle Configuration Matrix

| Vehicle Type | Module | Count | Total Energy |
|--------------|--------|-------|--------------|
| Delivery van | EK-BAT-25 | 2 | 50 kWh |
| City bus (12m) | EK-BAT-50 | 2 | 100 kWh |
| Regional bus (15m) | EK-BAT-50 | 3 | 150 kWh |
| Urban truck | EK-BAT-50 | 2 | 100 kWh |
| Long-haul truck | EK-BAT-100 | 4 | 400 kWh |
| Articulated bus | EK-BAT-100 | 2 | 200 kWh |

---

## JEZGRO Microkernel Product Family

JEZGRO is a MINIX-inspired microkernel RTOS designed for power electronics, providing fault isolation, automatic service restart, and real-time guarantees across all Elektrokombinacija embedded controllers.

### JEZGRO Variants

| Variant | Target Device | MCU | Key Services |
|---------|---------------|-----|--------------|
| **JEZGRO-EK3** | Charging module | STM32G474 | LLC_CONTROL, THERMAL, ROJ |
| **JEZGRO-RACK** | Rack controller | STM32G474 | FAN_CONTROL, SLOT_INVENTORY |
| **JEZGRO-BAT** | Battery BMS | STM32G474 | CELL_MONITOR, BALANCING, SOC |
| **JEZGRO-ROB** | Robot controllers | STM32H743 | MOTION_CTRL, TRAJECTORY, SAFETY |
| **JEZGRO-GW** | Protocol gateways | STM32H743 | PLL_SYNC, ISO15118, DROOP_CTRL |

### Common Kernel Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Kernel size | <10 KB | Minimal footprint |
| Fault isolation | MPU-based | No MMU required |
| Service restart | <50 ms | Automatic recovery |
| Interrupt latency | <1 µs | Real-time |
| IPC mechanism | Zero-copy message passing | 64-byte messages |
| Scheduler | EDF with priority fallback | Deadline-aware |

### Hardware Platforms

| Platform | MCU | RAM | Flash | Price |
|----------|-----|-----|-------|-------|
| **EK-PLAT-G4** | STM32G474VET6 | 128 KB | 512 KB | ~$8 |
| **EK-PLAT-H7** | STM32H743VIT6 | 1 MB | 2 MB | ~$15 |

### PCB Form Factors

| Form Factor | Size | Layers | Applications |
|-------------|------|--------|--------------|
| **EK-PCB-S** | 50×80 mm | 4 | EK3 module, Battery BMS |
| **EK-PCB-M** | 80×100 mm | 4 | Rack controller, OCPP adapter |
| **EK-PCB-L** | 100×160 mm | 6 | Robot controller, V2G gateway |

---

## EK-ADAPT Adapter Device Family

The EK-ADAPT family extends the Elektrokombinacija ecosystem to work with third-party vehicles, legacy buses, and existing charging standards. All adapters run JEZGRO-GW firmware.

### Adapter Types

| Device | Purpose | MCU | Power Range |
|--------|---------|-----|-------------|
| **EK-ADAPT-V2G** | Third-party EVs → V2G network | STM32H743 | 10-50 kW bidir |
| **EK-ADAPT-BUS** | Legacy bus retrofit | STM32G474 | N/A (protocol) |
| **EK-ADAPT-CCS** | CCS Combo to EK bridge | STM32H743 | 50-150 kW |
| **EK-ADAPT-MCS** | Megawatt Charging adapter | STM32H743 | 350 kW - 3 MW |
| **EK-ADAPT-OCPP** | Third-party charger gateway | STM32G474 | N/A (protocol) |

### EK-ADAPT-V2G Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Vehicle interface | CCS Combo 2 / CHAdeMO | Via inlet |
| EK interface | CAN-FD @ 5 Mbps | System integration |
| Power range | 10-50 kW bidirectional | Per vehicle capability |
| Protocol support | ISO 15118-2, -20, CHAdeMO 3.0 | Full V2G stack |
| Dimensions | 300 × 200 × 100 mm | Wall-mount |
| IP rating | IP54 | Indoor/sheltered |

### EK-ADAPT-MCS Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Connector | MCS (CharIN) | 3 MW rated |
| Power range | 350 kW - 3 MW | Scalable |
| Voltage | 800-1500V DC | MCS standard |
| Current | Up to 3000A | Liquid-cooled cable |
| Protocol | ISO 15118-20 + CharIN MCS | Full BPT |
| Cooling | Liquid + forced air | High power |

### EK-ADAPT Scaling (MCS)

| Configuration | Racks | EK3 Modules | Total Power |
|---------------|-------|-------------|-------------|
| MCS-350 | 2 | 106 | 350 kW |
| MCS-750 | 3 | 227 | 750 kW |
| MCS-1000 | 4 | 303 | 1 MW |
| MCS-1500 | 6 | 454 | 1.5 MW |
| MCS-3000 | 12 | 909 | 3 MW |

---

## Reference Documents

| Document | Location |
|----------|----------|
| Architecture overview | `tehnika/konceptualno/en/00-arhitektura.md` |
| Power electronics | `tehnika/inzenjersko/en/01-power-electronics.md` |
| Thermal management | `tehnika/inzenjersko/en/03-thermal-management.md` |
| Swap station | `tehnika/inzenjersko/en/05-swap-station.md` |
| Battery module standard | `tehnika/inzenjersko/en/19-battery-module-standard.md` |
| Small battery philosophy | `tehnika/konceptualno/en/04-small-battery-philosophy.md` |
| ROJ intelligence | `tehnika/konceptualno/en/02-roj-intelligence.md` |
| Control system | `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` |
| EK3 detailed design | `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` |
| Communication | `tehnika/inzenjersko/en/komponente/komunikacija.md` |
| **JEZGRO product family** | `tehnika/inzenjersko/en/21-jezgro-product-family.md` |
| **JEZGRO microkernel** | `tehnika/inzenjersko/en/16-jezgro.md` |
| **JEZGRO-BAT (BMS)** | `tehnika/inzenjersko/en/22-jezgro-bat.md` |
| **JEZGRO-ROB (Robot)** | `tehnika/inzenjersko/en/23-jezgro-rob.md` |
| **JEZGRO-GW (Gateway)** | `tehnika/inzenjersko/en/24-jezgro-gw.md` |
| **EK-ADAPT devices** | `tehnika/inzenjersko/en/25-adapter-devices.md` |
| **Hardware platforms** | `tehnika/inzenjersko/en/26-jezgro-hw-platforms.md` |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.4 | Added JEZGRO product family (5 variants), EK-ADAPT adapter devices (5 types), hardware platforms |
| 2026-01-04 | 1.3 | Added Central PFC module specs (Vienna rectifier), Rack controller specs (STM32G474 + JEZGRO) |
| 2026-01-04 | 1.2 | Added EK-BAT battery module family specifications |
| 2026-01-04 | 1.1 | Added thermal management specs: heatsink, Rth, derating curves |
| 2026-01-03 | 1.0 | Initial standardization: 3.3kW, 900V SiC, CAN-FD, custom rack |
