# Infineon Partnership Proposal

**From:** Elektrokombinacija d.o.o.
**To:** Infineon Technologies, Belgrade Office
**Date:** January 2026
**Subject:** Development Partnership - Modular EV Charging Infrastructure

---

## Executive Summary

Elektrokombinacija is developing a **novel distributed architecture** for EV charging infrastructure, combining:

1. **JEZGRO** - Purpose-built microkernel RTOS for power electronics
2. **ROJ** - Swarm intelligence protocol for distributed module coordination
3. **EK3** - 3.3kW hot-swappable power module (building block for 3kW to 3MW systems)

**The Innovation:** We treat charging infrastructure like a distributed computing cluster rather than monolithic power electronics. Each module runs JEZGRO, communicates via CAN-FD, and the swarm self-organizes for load balancing, fault tolerance, and predictive maintenance.

**Global Market:** Charging network operators, fleet operators, OEMs - anyone deploying 100kW+ charging infrastructure. The architecture is designed for **licensing and white-label manufacturing**.

We are seeking Infineon as a technology partner for:
1. **AURIX TC3xx** microcontrollers for safety-critical nodes (rack controllers, V2G gateways)
2. **Gate drivers** for SiC power electronics (900V, 150-250kHz switching)
3. **CAN-FD transceivers** for high-speed inter-module communication
4. Development boards and technical support for JEZGRO port

**Scaling Vision:**
- 2027: 1,000+ modules (pilot deployments)
- 2028: 10,000+ modules (fleet operator partnerships)
- 2029: 50,000+ modules (OEM licensing, global rollout)

---

## Company Overview

### Elektrokombinacija d.o.o.

| Item | Details |
|------|---------|
| **Founded** | 2026 |
| **Location** | Kikinda, Serbia |
| **Focus** | Modular EV charging infrastructure |
| **Target Market** | Electric bus/truck fleets |
| **Key Innovation** | Hot-swappable 3.3kW power modules |

### Founder

| Item | Details |
|------|---------|
| **Name** | Bojan Janjatović |
| **Background** | 7 years electronics/hardware, 15 years software development |
| **Software** | Embedded systems, enterprise backend (NCR Voyix), agent edge (NCR) |
| **Email** | bojan@elektrokombinacija.com |
| **Phone** | [YOUR PHONE] |

*Note: Power electronics component selection (SiC MOSFETs, gate drivers) is proposed based on research - seeking FAE guidance for optimization.*

---

## Project Overview

### The Problem

Current EV charging infrastructure suffers from:
- **Single points of failure** - one fault = entire charger offline
- **Expensive maintenance** - requires specialized technicians
- **Inflexible scaling** - fixed power levels (50kW, 150kW, 350kW)
- **No graceful degradation** - 100% or 0% availability

### Our Solution: EK3 Modular Architecture

A **building-block approach** where standardized 3.3kW modules combine for any power level:

```
┌─────────────────────────────────────────────────────────────┐
│                    EK3 MODULE (3.3 kW)                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ SiC     │  │ LLC     │  │ Planar  │  │ MCU     │       │
│  │ Bridge  │──│ Tank    │──│ Trafo   │──│ Control │       │
│  │ 900V    │  │ 200kHz  │  │ PCB     │  │ CAN-FD  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                             │
│  Input: 650V DC    Output: 50-500V DC    Efficiency: >96%  │
└─────────────────────────────────────────────────────────────┘
```

### Scaling Examples

| Application | Modules | Power | Fault Impact |
|-------------|---------|-------|--------------|
| Home charger | 7 | 23 kW | 14% per module |
| DC Fast 50kW | 16 | 53 kW | 6% per module |
| DC Fast 150kW | 46 | 152 kW | 2% per module |
| Bus Depot 500kW | 152 | 502 kW | 0.66% per module |
| MCS 1MW | 303 | 1 MW | 0.33% per module |
| MCS 3MW | 909 | 3 MW | 0.11% per module |

**Key benefit:** At 500kW, losing one module = only 0.66% capacity loss. System continues operating.

---

## Technical Specifications

### EK3 Power Module

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Power (continuous)** | 3.3 kW | LLC resonant DC/DC |
| **Power (peak)** | 3.6 kW | Short-term |
| **Input voltage** | 650V DC | From central PFC |
| **Output voltage** | 50-500V DC | Full battery range |
| **Efficiency (peak)** | >96% | @ 50% load |
| **Efficiency (full load)** | >94% | @ 3.3 kW |
| **Standby consumption** | <3W | Deep sleep mode |

### Power Electronics

| Parameter | Value | Notes |
|-----------|-------|-------|
| **SiC MOSFET** | 900V, 65mΩ | Wolfspeed C3M0065090D (proposed, seeking FAE input) |
| **Topology** | LLC Resonant | ZVS, ZCS |
| **Switching frequency** | 150-250 kHz | Resonant |
| **Transformer** | Planar, PCB | Manufacturing repeatability |
| **Capacitors** | Film only | No electrolytics, >50,000h life |

### Physical

| Parameter | Value |
|-----------|-------|
| **Dimensions** | 200 × 320 × 44 mm (1U half-width) |
| **Mass** | ~3.5 kg |
| **Hot-swap time** | <1 second |
| **Mating cycles** | >50,000 (robot-grade) |

### Control & Communication

| Parameter | Value |
|-----------|-------|
| **MCU (current)** | STM32G474 (Cortex-M4 @ 170MHz) |
| **MCU (safety-critical)** | **AURIX TC375/TC397** |
| **Communication** | CAN-FD @ 5 Mbps |
| **Latency** | <1ms per message |

---

## ROJ - Distributed Swarm Intelligence

The key innovation is **ROJ** - a distributed coordination protocol that enables hundreds of independent modules to behave as a unified system.

### Concept

```
Traditional Charger:              ROJ Architecture:
┌─────────────────────┐          ┌─────────────────────────────────┐
│                     │          │  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│   CENTRAL           │          │  │ M │ │ M │ │ M │ │ M │ ...   │
│   CONTROLLER        │          │  └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘       │
│   (single point     │          │    │     │     │     │         │
│    of failure)      │          │    └──┬──┴──┬──┴──┬──┘         │
│         │           │          │       │     │     │            │
│    ┌────┴────┐      │          │    CAN-FD BUS (5 Mbps)         │
│    │ POWER   │      │          │       │     │     │            │
│    │ STAGE   │      │          │  Each module: JEZGRO + ROJ     │
│    │ (fixed) │      │          │  Self-organizing, fault-tolerant│
│    └─────────┘      │          │                                 │
└─────────────────────┘          └─────────────────────────────────┘
```

### ROJ Capabilities

| Feature | Description |
|---------|-------------|
| **Consensus** | Modules agree on power distribution without central coordinator |
| **Fault Detection** | Peer-to-peer monitoring, degraded modules automatically excluded |
| **Load Balancing** | Dynamic power redistribution based on thermal/efficiency state |
| **Hot Plug** | New modules join swarm automatically, leaving modules handoff gracefully |
| **Predictive Maintenance** | Swarm identifies degrading modules before failure |

### Why This Matters

| Metric | Traditional 500kW | ROJ 500kW (152 modules) |
|--------|-------------------|-------------------------|
| Single fault impact | **100% offline** | **0.66% capacity loss** |
| MTBF | ~50,000h | **>500,000h** (system level) |
| Repair | Technician required | Robot or simple swap |
| Scaling | Fixed configurations | Any power level |
| Efficiency optimization | One operating point | Per-module optimization |

---

## JEZGRO RTOS

We have developed a custom **microkernel RTOS** specifically for power electronics control:

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      JEZGRO KERNEL                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ EDF         │ │ MPU         │ │ IPC         │          │
│  │ Scheduler   │ │ Protection  │ │ Messages    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Mutex       │ │ Semaphore   │ │ Fault       │          │
│  │ Sync        │ │ Counting    │ │ Recovery    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Features

| Feature | Status | Description |
|---------|--------|-------------|
| **EDF Scheduler** | ✅ Done | Earliest Deadline First with preemption |
| **Context Switching** | ✅ Done | ARM Cortex-M4 PendSV |
| **MPU Protection** | ✅ Done | 5 memory regions, fault isolation |
| **IPC Messages** | ✅ Done | Zero-copy, 64-byte messages |
| **Mutex/Semaphore** | ✅ Done | Recursive locking, EDF wait queues |
| **Fault Recovery** | 🔄 In Progress | Automatic service restart |
| **AURIX Port** | 📋 Planned | TC375/TC397 HAL |

### Kernel Specifications

| Parameter | Value |
|-----------|-------|
| Kernel size | <10 KB |
| Interrupt latency | <1 µs |
| Context switch | <5 µs |
| Max tasks | 32 |
| IPC message pool | 64 messages |

### Platform Support

| Platform | Status | Use Case |
|----------|--------|----------|
| **STM32G474** | ✅ Production | EK3 modules, BMS |
| **AURIX TC375** | 📋 Planned | Safety controller |
| **AURIX TC397** | 📋 Planned | Robot control, V2G gateway |
| Simulation (PC) | ✅ Done | Development, testing |

### Current Status

JEZGRO running on STM32G474 (Renode emulation):
- 22/22 unit tests passing
- Ready for AURIX port

---

## Why Infineon AURIX?

### Current Architecture (STM32G474)

Good for individual module control, but lacks:
- Hardware lockstep for safety
- Multi-core for complex algorithms
- Automotive-grade qualification

### Target Architecture (AURIX TC3xx)

| Requirement | AURIX Capability |
|-------------|------------------|
| **Functional Safety** | Lockstep cores, ASIL-D capable |
| **Multi-core** | Up to 6 cores @ 300MHz |
| **CAN-FD** | Multiple integrated controllers |
| **PWM** | GTM (Generic Timer Module) - high resolution |
| **ADC** | Multiple EVADC modules |
| **Qualification** | AEC-Q100 Grade 1 |

### Application Mapping

| Application | MCU | ASIL Level | Key Features |
|-------------|-----|------------|--------------|
| **Rack Controller** | TC375 | ASIL-B | CAN gateway, fan control, slot management |
| **V2G Gateway** | TC397 | ASIL-D | Grid sync PLL, ISO 15118, droop control |
| **Robot Controller** | TC397 | ASIL-D | Motion control, trajectory planning |
| **Central PFC** | TC375 | ASIL-B | Vienna rectifier, grid monitoring |

---

## Product Request

### Development Kits

| Product | Part Number | Qty | Purpose |
|---------|-------------|-----|---------|
| **AURIX TC375 Lite Kit** | KIT_A2G_TC375_LITE | 2 | Rack controller development |
| **AURIX TC397 TFT Kit** | KIT_A2G_TC397_TFT | 2 | V2G gateway, robot controller |
| **TC375 Application Kit** | KIT_A2G_TC375_5V_TRB | 1 | Production validation |
| **Shield Buddy TC375** | KIT_AURIX_TC375_SB | 2 | Rapid prototyping |

### Gate Drivers (for SiC MOSFETs)

| Product | Part Number | Qty | Application |
|---------|-------------|-----|-------------|
| **EiceDRIVER 1ED3124** | 1ED3124MU12H | 20 | Half-bridge, 1200V |
| **EiceDRIVER 2ED2304** | 2ED2304S06F | 20 | Half-bridge, isolated |
| **EiceDRIVER Compact** | 1EDC60I12AH | 10 | Single channel, evaluation |

### CAN-FD Transceivers

| Product | Part Number | Qty | Notes |
|---------|-------------|-----|-------|
| **TLE9251V** | TLE9251VSJXUMA1 | 50 | 5V, standard |
| **TLE9255W** | TLE9255WSKXUMA1 | 50 | Wake-up capable |
| **TLE9252V** | TLE9252VSJXUMA1 | 20 | Partial networking |

### Power Management

| Product | Part Number | Qty | Application |
|---------|-------------|-----|-------------|
| **TLF35584** | TLF35584QVVS2 | 10 | Multi-output PMIC, ASIL-D |
| **TLE9471** | TLE9471ESXUMA1 | 10 | System basis chip |

### Current Sensing

| Product | Part Number | Qty | Application |
|---------|-------------|-----|-------------|
| **TLI4971** | TLI4971A025T5U | 20 | 25A, coreless |
| **TLI4971** | TLI4971A050T5U | 20 | 50A, coreless |
| **TLE4998** | TLE4998C4XUMA1 | 10 | Linear Hall, programmable |

### SiC MOSFETs (if available)

| Product | Part Number | Qty | Application |
|---------|-------------|-----|-------------|
| **CoolSiC 1200V** | IMZ120R030M1H | 10 | PFC stage evaluation |
| **CoolSiC 650V** | AIMZ65R027M1H | 10 | LLC stage evaluation |

---

## Software & Tools Request

### Development Tools

| Tool | Purpose |
|------|---------|
| **AURIX Development Studio** | IDE, compiler, debugger |
| **iLLD (Low Level Drivers)** | Hardware abstraction |
| **SafeTlib** | Safety library, ASIL-D |
| **Mcal** | AUTOSAR MCAL drivers |

### Documentation

| Document | Purpose |
|----------|---------|
| User manuals | TC375, TC397 |
| Application notes | CAN-FD, GTM PWM, ADC |
| Safety manual | ASIL certification guidance |
| Reference designs | Gate driver, power stage |

### Training

| Topic | Format |
|-------|--------|
| AURIX architecture | Webinar or on-site |
| GTM programming | Workshop |
| Functional safety | Certification guidance |

---

## Business Case

### Production Volumes (Projected)

| Year | Modules | Racks | MCUs Needed |
|------|---------|-------|-------------|
| 2026 | 500 | 6 | 600 |
| 2027 | 2,000 | 24 | 2,400 |
| 2028 | 5,000 | 60 | 6,000 |
| 2029 | 10,000 | 120 | 12,000 |

### Bill of Materials (Per Module)

| Component | Current | With Infineon |
|-----------|---------|---------------|
| MCU | STM32G474 ($8) | STM32G474 ($8) |
| CAN transceiver | NXP TJA1443 ($2) | **TLE9251V ($1.50)** |
| Gate driver | TI UCC21520 ($3) | **1ED3124 ($2.50)** |
| Current sense | Allegro ACS712 ($2) | **TLI4971 ($3)** |

### Rack Controller (New Design)

| Component | Selection | Price |
|-----------|-----------|-------|
| MCU | **AURIX TC375** | ~$25 |
| PMIC | **TLF35584** | ~$8 |
| CAN | **TLE9255W** × 2 | ~$3 |

### V2G Gateway (New Design)

| Component | Selection | Price |
|-----------|-----------|-------|
| MCU | **AURIX TC397** | ~$40 |
| PMIC | **TLF35584** | ~$8 |
| CAN | **TLE9252V** × 4 | ~$6 |

---

## Pilot Deployment: EXPO 2027 Belgrade

As proof-of-concept, we are targeting **EXPO 2027 Belgrade** for the first large-scale deployment.

### Why EXPO 2027

| Factor | Benefit |
|--------|---------|
| **High visibility** | 4+ million visitors, global media |
| **Real workload** | Electric shuttle buses, continuous operation |
| **Local advantage** | Serbian company, government support |
| **Timeline pressure** | Forces rapid development cycle |

### Planned Installation

| Location | Power | Modules | Purpose |
|----------|-------|---------|---------|
| Bus Depot | 2 MW | 606 | Overnight charging |
| Shuttle Terminal | 500 kW | 152 | Opportunity charging |
| V2G Demo | 100 kW | 30 | Grid integration showcase |

**This is a pilot** - the real market is global licensing to charging OEMs and fleet operators.

### Development Timeline

| Phase | Date | Milestone |
|-------|------|-----------|
| **Now** | Q1 2026 | JEZGRO kernel complete, STM32 running |
| Next | Q2 2026 | JEZGRO port to AURIX TC375 |
| Next | Q3 2026 | First 10-module rack prototype |
| Next | Q4 2026 | Pilot deployment (Serbia) |
| Target | Q2 2027 | EXPO 2027 deployment |
| Scale | 2028+ | OEM licensing, global rollout |

---

## Partnership Proposal

### What We're Seeking

1. **Development Kit Package**
   - AURIX development boards (TC375, TC397)
   - Gate driver evaluation boards
   - CAN-FD transceivers (samples)
   - Current sensors (samples)

2. **Technical Support**
   - Access to FAE (Field Application Engineer)
   - AURIX architecture training
   - GTM/PWM application support
   - Safety certification guidance

3. **Commercial Terms**
   - Volume pricing discussion (1,000+ units/year)
   - Local distribution in Serbia
   - Joint marketing opportunity (EXPO 2027)

### What We Offer

1. **Reference Design**
   - Publish EK3 as Infineon reference design
   - Open-source JEZGRO RTOS with AURIX port
   - Application notes for EV charging

2. **Visibility**
   - Infineon logo on deployed systems
   - Joint press release for EXPO 2027
   - Conference presentations (IEEE, SAE)

3. **Volume Commitment**
   - 1,000+ modules in 2027
   - 5,000+ modules in 2028
   - Exclusive Infineon components where competitive

---

## Intellectual Property

### Patent Portfolio (Filed January 2026)

| Patent | Title | Status |
|--------|-------|--------|
| **EK-A** | Modular Power Architecture | Priority filed |
| **EK-B** | Dual-Robot Swap System | Priority filed |
| **EK-C** | Fleet Logistics Integration | Priority filed |

### Trade Secrets

- JEZGRO RTOS kernel implementation
- LLC resonant control algorithms
- ROJ distributed intelligence protocol

### Open Source

- JEZGRO HAL (MIT license)
- CAN-FD protocol stack
- Diagnostic tools

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Component availability | Dual-source design (Infineon + fallback) |
| Safety certification | Early engagement with TÜV |
| Production scaling | Partner with Serbian EMS (Jura, Elrad) |
| Market adoption | GSP pilot validates technology |

---

## Next Steps

1. **Initial Meeting** - Technical discussion, requirements review
2. **Sample Order** - Development kits and components
3. **NDA** - If required for detailed specifications
4. **Pilot Project** - 10-module rack with AURIX controller
5. **Volume Agreement** - Production pricing, supply terms

---

## Contact Information

### Primary Contact

| Item | Details |
|------|---------|
| **Name** | Bojan Janjatović |
| **Title** | Founder & CTO |
| **Email** | bojan@elektrokombinacija.com |
| **Phone** | [YOUR PHONE NUMBER] |
| **LinkedIn** | [YOUR LINKEDIN] |

### Company

| Item | Details |
|------|---------|
| **Company** | Elektrokombinacija d.o.o. |
| **Address** | Kikinda, Serbia |
| **Website** | https://elektrokombinacija.com |

---

## Appendix A: JEZGRO Technical Details

### Source Code Statistics

```
Component          Files    Lines    Status
─────────────────────────────────────────────
jezgro.h           1        196      Done
scheduler.c        1        ~300     Done
task.c             1        ~225     Done
ipc.c              1        ~280     Done
sync.c             1        ~430     Done
hal_stm32.c        1        ~850     Done
hal_aurix.c        1        ~0       Planned
─────────────────────────────────────────────
Total              7        ~2,300
```

### Test Results (Simulation)

```
================================================
  JEZGRO Pre-Hardware Test Suite
  Platform: Simulation
  Version: 0.1.0-pre
================================================

--- HAL Tests ---        3/3 passed
--- Scheduler Tests ---  4/4 passed
--- IPC Tests ---        3/3 passed
--- Task Tests ---       3/3 passed
--- Sync Tests ---       9/9 passed

================================================
  Results: 22/22 tests passed
================================================
```

### Renode Emulation

Successfully running on STM32G474 emulation:
- Two tasks with EDF scheduling
- Preemptive context switching
- MPU memory protection
- SysTick @ 1kHz

---

## Appendix B: Product Comparison

### MCU Comparison

| Feature | STM32G474 | TC375 | TC397 |
|---------|-----------|-------|-------|
| Cores | 1 × M4 | 3 × TriCore | 6 × TriCore |
| Clock | 170 MHz | 300 MHz | 300 MHz |
| Flash | 512 KB | 4 MB | 16 MB |
| RAM | 128 KB | 1 MB | 4 MB |
| CAN-FD | 3 | 4 | 4 |
| Lockstep | No | Yes | Yes |
| ASIL | - | ASIL-D | ASIL-D |
| Price | ~$8 | ~$25 | ~$40 |

### Gate Driver Comparison

| Feature | UCC21520 (TI) | 1ED3124 (Infineon) |
|---------|---------------|---------------------|
| Voltage | 1200V | 1200V |
| Current | 4A/6A | 4A/6A |
| Isolation | 5.7kV | 5kV |
| CMTI | 100 V/ns | 150 V/ns |
| Price | ~$3 | ~$2.50 |

---

## Appendix C: Reference Links

- **Source Code:** Available upon request (NDA)
- **Technical Documentation:** Available under NDA
- **Live Demo:** Can be arranged during technical meeting

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Classification: Business Confidential*
