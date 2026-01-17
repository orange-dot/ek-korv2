# ELEKTROKOMBINACIJA - Technical Summary
## EK-KOR2 RTOS + EK3 Power Module

*Prepared for EIT InnoEnergy Application*
*January 2026*

---

## 1. System Overview

Elektrokombinacija develops two complementary technologies:

1. **EK-KOR2** - Open-source RTOS for distributed coordination
2. **EK3** - Modular 3.3kW power conversion hardware

Together, they create self-healing EV charging infrastructure.

---

## 2. EK-KOR2: Field-Centric Coordination RTOS

### 2.1 What It Is

A novel real-time operating system for distributed coordination of modular power electronics. Unlike traditional systems with central controllers, EK-KOR2 uses **potential field scheduling** where modules self-organize through field gradients.

### 2.2 Key Innovations

| Innovation | Description | Benefit |
|------------|-------------|---------|
| Potential Field Scheduling | No central scheduler - work flows along gradients | No single point of failure |
| k=7 Topological Neighbors | Each module tracks 7 nearest neighbors | Scale-free, O(1) complexity |
| Threshold Consensus | Distributed voting (67% supermajority) | Decentralized decisions |
| Adaptive Mesh Reformation | Self-healing topology | Automatic fault recovery |

### 2.3 How Potential Fields Work

```
Each module publishes a "field" with 5 components:
- Load (0.0 - 1.0) - computational/power load
- Thermal (normalized) - temperature state
- Power (normalized) - current output
- Custom0, Custom1 - application-defined

DECAY FORMULA:
sampled_value = stored_value × exp(-(now - timestamp) / τ)
Where τ = 100ms

GRADIENT COMPUTATION:
gradient = neighbor_aggregate - my_field

Result: Work naturally flows from high-load to low-load
modules without central coordination.
```

### 2.4 Implementation Status

| Component | Status | Tests |
|-----------|--------|-------|
| Field module | Complete | 6/6 passing |
| Topology module | Complete | 5/5 passing |
| Heartbeat module | Complete | 4/4 passing |
| Consensus module | Complete | 4/4 passing |
| Module integration | Complete | 3/3 passing |
| **TOTAL** | **Complete** | **22/22 passing** |

### 2.5 Dual Implementation

- **C Implementation**: For broad embedded compatibility (STM32, etc.)
- **Rust Implementation**: Memory-safe, for critical paths
- Cross-validation ensures correctness

### 2.6 Open-Source Strategy

- License: MIT (release upon funding)
- Repository: github.com/elektrokombinacija/ek-kor2 (currently private)
- Documentation: API spec, state machines, test vectors

---

## 3. EK3: Modular Power Hardware

### 3.1 Electrical Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Power (continuous) | 3.3 kW | LLC resonant DC-DC |
| Power (peak) | 3.6 kW | Short-term |
| Input voltage | 650V DC | From central Vienna PFC |
| Output voltage | 50-500V DC | Full battery range |
| Efficiency (peak) | >96% | @ 50% load |
| Efficiency (full) | >94% | @ 3.3 kW |
| Standby | <3W | Deep sleep mode |

### 3.2 Power Electronics

| Component | Specification |
|-----------|---------------|
| SiC MOSFETs | Wolfspeed C3M0065090D (900V/36A) |
| Topology | LLC Resonant DC-DC |
| Switching frequency | 150-250 kHz (resonant) |
| Transformer | Planar, PCB integrated |
| Capacitors | Film only (>50,000h life) |

### 3.3 Physical Specifications

| Parameter | Value |
|-----------|-------|
| Dimensions | 200 × 320 × 44 mm |
| Mass | ~3.5 kg |
| Form factor | 1U half-width blade |
| Cooling | Forced air (12 CFM) |
| Hot-swap time | <1 second |
| Mating cycles | >50,000 |

### 3.4 Control System

| Parameter | Value |
|-----------|-------|
| MCU | STM32G474VET6 (Cortex-M4 @ 170MHz) |
| Communication | CAN-FD @ 5 Mbps |
| CAN transceiver | NXP TJA1443 |
| Latency | <1ms per message |

### 3.5 Thermal Management

| Parameter | Value |
|-----------|-------|
| Heatsink | Al 6063-T5, 180×280×33mm |
| Thermal resistance | 1.20 K/W (junction to ambient) |
| TIM | Bergquist GP5000 (5.0 W/m·K) |
| Max junction temp | 125°C (target 120°C) |
| Operating ambient | -20°C to +55°C |

### 3.6 Derating Curve

| Ambient | Max Power | % Rated |
|---------|-----------|---------|
| ≤35°C | 3.3 kW | 100% |
| 40°C | 3.0 kW | 91% |
| 45°C | 2.7 kW | 82% |
| 50°C | 2.3 kW | 70% |
| 55°C | 1.8 kW | 55% |
| ≥60°C | SHUTDOWN | 0% |

---

## 4. System Architecture

### 4.1 Rack Configuration

```
CUSTOM RACK (Not 19" telecom)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│                                                        │
│  [EK3] [EK3] [EK3] [EK3]  ← 4 modules per row         │
│  [EK3] [EK3] [EK3] [EK3]                              │
│  [EK3] [EK3] [EK3] [EK3]                              │
│        ...21 rows...                                   │
│  [EK3] [EK3] [EK3] [EK3]                              │
│                                                        │
│  84 modules per rack = 277 kW                         │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │         VIENNA PFC (100kW, 3-phase input)       │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Rack dimensions: ~900 × 500 × 1200 mm
Rack weight: ~350 kg (full)
Airflow: Front-to-back (shared plenum)
```

### 4.2 Scaling

| Use Case | Modules | Racks | Power |
|----------|---------|-------|-------|
| E-bike | 1 | - | 3.3 kW |
| Home charger | 7 | - | 23 kW |
| DC Fast 50kW | 16 | 0.5 | 53 kW |
| DC Fast 150kW | 46 | 1 | 152 kW |
| Bus Depot | 152 | 2 | 502 kW |
| 1 MW | 303 | 4 | 1 MW |
| MCS 3 MW | 909 | 12 | 3 MW |

---

## 5. Communication Protocol

### 5.1 CAN-FD Configuration

| Parameter | Value |
|-----------|-------|
| Nominal bitrate | 500 kbps |
| Data bitrate | 5 Mbps |
| Payload | 64 bytes |
| Transceiver | NXP TJA1443 |

### 5.2 Message Types

| ID Range | Type | Size | Period |
|----------|------|------|--------|
| 0x100-0x1FF | Heartbeat | 7 bytes | 10ms |
| 0x200-0x2FF | Discovery | 10 bytes | 100ms |
| 0x300-0x3FF | Field Update | 24 bytes | 100ms |
| 0x400-0x4FF | Vote | 8 bytes | On-demand |
| 0x500-0x5FF | Proposal | 12 bytes | On-demand |
| 0x600-0x6FF | Power Command | 16 bytes | On-demand |

---

## 6. Robot Swap System

### 6.1 Concept

Failed modules are automatically swapped by a robotic mechanism:
1. EK-KOR2 detects module failure (missed heartbeats)
2. System redistributes load to remaining modules
3. Robot extracts failed module, inserts spare
4. New module joins mesh automatically

### 6.2 Specifications

| Parameter | Value |
|-----------|-------|
| Swap time | <40 seconds |
| Spare capacity | 10% of installed modules |
| Robot type | Cartesian (XYZ gantry) |
| Gripper | Pneumatic + mechanical latch |
| Positioning accuracy | ±1mm |

---

## 7. V2G Readiness

### 7.1 Bidirectional Capability

- Vienna PFC supports 4-quadrant operation
- EK3 LLC can operate in reverse
- ISO 15118-20 compatibility planned

### 7.2 Grid Services

| Service | Status |
|---------|--------|
| Frequency regulation | Architecture ready |
| Peak shaving | Architecture ready |
| Load balancing | Architecture ready |
| Vehicle-to-Grid | Planned (Phase 2) |

---

## 8. Standards & Certification

### 8.1 Target Certifications

| Standard | Scope | Status |
|----------|-------|--------|
| CE Marking | EU market access | Planned Q4 2026 |
| EN 61851 | EV charging | Design aligned |
| EN 61000-6-2/4 | EMC | Testing planned |
| ISO 15118 | V2G communication | Roadmap |

### 8.2 Safety Features

- Overcurrent protection (hardware comparators)
- Overvoltage protection
- Thermal shutdown
- Ground fault detection
- Arc fault detection (planned)

---

## 9. IP Position

### 9.1 Patents

5 patent concepts filed (WIPO PROOF January 2026):
1. Modular hot-swap architecture
2. Robot swap station mechanism
3. Distributed spare module strategy
4. Fleet-wide logistics coordination
5. Coordinated dual-robot system

### 9.2 Trade Secrets

- Specific control algorithms
- Thermal management optimization
- Manufacturing processes

### 9.3 Open Source

- EK-KOR2 RTOS: MIT License (release upon funding)
- Creates standard, builds community, no vendor lock-in

---

## 10. Development Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Phase 1** | Q1-Q2 2026 | EK-KOR2 OSS launch, EK3 prototype |
| **Phase 2** | Q3-Q4 2026 | 150kW pilot, CE certification |
| **Phase 3** | 2027 | Commercial production, first customers |
| **Phase 4** | 2028 | V2G capability, MCS support |

---

*Technical Summary prepared: January 2026*
*For: EIT InnoEnergy Pre-Seed Application*
*Contact: bojan.janjatovic@gmail.com*
