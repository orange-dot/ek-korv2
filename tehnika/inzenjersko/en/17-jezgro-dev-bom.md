# JEZGRO Development BOM

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-018 |
| Version | 1.0 |
| Date | 2026-01-04 |
| Status | Draft |
| Related | 16-jezgro.md |

---

## 1. Overview

This document contains the Bill of Materials for JEZGRO microkernel RTOS prototype development. It includes:

1. **Development Tools** - boards, debuggers, analyzers
2. **Discrete Components** - for custom prototype PCB
3. **Software Tools** - free/open source toolchain

Target MCU: **STM32G474RET6** (Cortex-M4 @ 170MHz, 128KB RAM, MPU)

---

## 2. Development Tools

### 2.1 Development Boards

| ID | Component | Description | Qty | Unit € | Total € | Supplier |
|----|-----------|-------------|-----|--------|---------|----------|
| DEV01 | NUCLEO-G474RE | STM32G474RE dev board (128KB RAM, MPU) | 2 | 24.00 | 48.00 | Mouser/DigiKey |
| DEV02 | ST-LINK V3MINIE | Fast external debugger | 1 | 12.00 | 12.00 | ST |
| DEV03 | ST-LINK V3SET | Full debugger kit (optional) | 1 | 35.00 | 35.00 | ST |
| | **Subtotal** | | | | **€60.00** | |

### 2.2 CAN-FD Bus Testing

| ID | Component | Description | Qty | Unit € | Total € | Supplier |
|----|-----------|-------------|-----|--------|---------|----------|
| CAN01 | PEAK PCAN-USB FD | CAN-FD USB adapter (5 Mbps) | 1 | 320.00 | 320.00 | PEAK-System |
| CAN02 | Canable Pro | Budget CAN-FD adapter (alternative) | 1 | 80.00 | (80.00) | Canable |
| CAN03 | SN65HVD230 breakout | CAN transceiver for NUCLEO | 3 | 4.00 | 12.00 | Amazon |
| CAN04 | DB9 connectors | CAN standard connectors | 10 | 1.50 | 15.00 | - |
| CAN05 | CAN cables | Twisted pair, shielded, 2m | 5 | 4.00 | 20.00 | - |
| CAN06 | Termination resistors | 120Ω, 1% | 10 | 0.10 | 1.00 | - |
| | **Subtotal** | | | | **€368.00** | |

### 2.3 Debug & Analysis

| ID | Component | Description | Qty | Unit € | Total € | Supplier |
|----|-----------|-------------|-----|--------|---------|----------|
| DBG01 | Logic Analyzer 24MHz | Basic timing analysis | 1 | 15.00 | 15.00 | AliExpress |
| DBG02 | Saleae Logic 8 | Professional logic analyzer | 1 | 350.00 | (350.00) | Saleae |
| DBG03 | USB-UART CP2102 | Serial debug output | 2 | 3.00 | 6.00 | - |
| DBG04 | Segger J-Trace PRO | ETM trace (optional) | 1 | 1200.00 | (1200.00) | Segger |
| | **Subtotal** | | | | **€21.00** | |

### 2.4 Power & Lab Equipment

| ID | Component | Description | Qty | Unit € | Total € | Supplier |
|----|-----------|-------------|-----|--------|---------|----------|
| PWR01 | Bench PSU 0-30V/5A | Adjustable, dual channel | 1 | 85.00 | 85.00 | Korad/RND |
| PWR02 | USB-C PD trigger | Alternate power source | 2 | 8.00 | 16.00 | - |
| PWR03 | INA219 current monitor | Power profiling | 3 | 5.00 | 15.00 | - |
| | **Subtotal** | | | | **€116.00** | |

### 2.5 Cables & Accessories

| ID | Component | Description | Qty | Unit € | Total € |
|----|-----------|-------------|-----|--------|---------|
| ACC01 | Dupont jumper wires | M-M, M-F, F-F kit | 1 | 5.00 | 5.00 |
| ACC02 | Mini breadboard | 400 points | 2 | 3.00 | 6.00 |
| ACC03 | USB cables | Micro-B and USB-C | 5 | 3.00 | 15.00 |
| ACC04 | Logic probe clips | Micro-grabber kit | 2 | 8.00 | 16.00 |
| | **Subtotal** | | | | **€42.00** |

### 2.6 Development Tools Summary

| Category | Essential € | With Options € |
|----------|-------------|----------------|
| Development Boards | 60.00 | 95.00 |
| CAN-FD Testing | 368.00 | 368.00 |
| Debug & Analysis | 21.00 | 1,571.00 |
| Power & Lab | 116.00 | 116.00 |
| Cables & Accessories | 42.00 | 42.00 |
| **TOTAL** | **€607.00** | **€2,192.00** |

---

## 3. Prototype Board - Discrete Components

Custom PCB for JEZGRO development with full CAN-FD and debug capabilities.

### 3.1 MCU & Core

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| U1 | MCU Cortex-M4 170MHz | STM32G474RET6 | LQFP64 | 1 | 8.50 | 8.50 |
| Y1 | Crystal 25MHz | ABM8-25.000MHZ-B2 | 3.2×2.5mm | 1 | 0.80 | 0.80 |
| Y2 | Crystal 32.768kHz | ABS07-32.768KHZ | 3.2×1.5mm | 1 | 0.50 | 0.50 |
| | **Subtotal** | | | | | **€9.80** |

### 3.2 Power Supply

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| U2 | LDO 3.3V 500mA | AMS1117-3.3 | SOT-223 | 1 | 0.30 | 0.30 |
| U3 | LDO 5V 500mA | AMS1117-5.0 | SOT-223 | 1 | 0.30 | 0.30 |
| U4 | DC-DC buck module | MP1584EN | Module | 1 | 1.50 | 1.50 |
| | **Subtotal** | | | | | **€2.10** |

### 3.3 CAN-FD Interface

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| U5 | CAN-FD Transceiver | TJA1443AT | SOIC-8 | 1 | 2.80 | 2.80 |
| U6 | CAN-FD Transceiver | TJA1443AT | SOIC-8 | 1 | 2.80 | 2.80 |
| R1,R2 | Termination | 120Ω 1% | 0603 | 2 | 0.05 | 0.10 |
| | **Subtotal** | | | | | **€5.70** |

### 3.4 Debug & Programming

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| J1 | SWD Header | 2x5 1.27mm | THT | 1 | 0.40 | 0.40 |
| J2 | UART Header | 1x4 2.54mm | THT | 1 | 0.20 | 0.20 |
| U7 | USB-UART Bridge | CP2102N | QFN-28 | 1 | 1.50 | 1.50 |
| | **Subtotal** | | | | | **€2.10** |

### 3.5 Memory (Optional)

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| U8 | QSPI Flash 16MB | W25Q128JVSIQ | SOIC-8 | 1 | 2.00 | 2.00 |
| U9 | FRAM 256Kb | FM25V10-G | SOIC-8 | 1 | 3.50 | 3.50 |
| | **Subtotal** | | | | | **€5.50** |

### 3.6 Passive Components

| ID | Component | Value | Package | Qty | Unit € | Total € |
|----|-----------|-------|---------|-----|--------|---------|
| C1-C10 | Decoupling | 100nF X7R | 0603 | 10 | 0.03 | 0.30 |
| C11-C14 | Bulk | 10µF X5R | 0805 | 4 | 0.10 | 0.40 |
| C15-C18 | Crystal load | 20pF C0G | 0603 | 4 | 0.05 | 0.20 |
| R3-R12 | Pull-up/down | 10kΩ | 0603 | 10 | 0.02 | 0.20 |
| R13-R14 | USB series | 22Ω | 0603 | 2 | 0.05 | 0.10 |
| L1-L2 | Ferrite bead | 600Ω@100MHz | 0603 | 2 | 0.10 | 0.20 |
| | **Subtotal** | | | | | **€1.40** |

### 3.7 Connectors

| ID | Component | Type | Package | Qty | Unit € | Total € |
|----|-----------|------|---------|-----|--------|---------|
| J3 | Power input | DC barrel 5.5/2.1 | THT | 1 | 0.50 | 0.50 |
| J4-J5 | CAN bus | JST-XH 4-pin | THT | 2 | 0.20 | 0.40 |
| J6 | USB | USB-C 16-pin | SMD | 1 | 0.60 | 0.60 |
| J7 | GPIO header | 2x10 2.54mm | THT | 1 | 0.50 | 0.50 |
| | **Subtotal** | | | | | **€2.00** |

### 3.8 Indicators

| ID | Component | Color | Package | Qty | Unit € | Total € |
|----|-----------|-------|---------|-----|--------|---------|
| D1 | Power LED | Green | 0603 | 1 | 0.10 | 0.10 |
| D2 | Status LED | Blue | 0603 | 1 | 0.10 | 0.10 |
| D3 | CAN TX LED | Yellow | 0603 | 1 | 0.10 | 0.10 |
| D4 | CAN RX LED | Orange | 0603 | 1 | 0.10 | 0.10 |
| D5 | Fault LED | Red | 0603 | 1 | 0.10 | 0.10 |
| R15-R19 | LED resistors | 1kΩ | 0603 | 5 | 0.02 | 0.10 |
| | **Subtotal** | | | | | **€0.60** |

### 3.9 ESD Protection

| ID | Component | Part Number | Package | Qty | Unit € | Total € |
|----|-----------|-------------|---------|-----|--------|---------|
| D6 | USB ESD | USBLC6-2SC6 | SOT-23-6 | 1 | 0.40 | 0.40 |
| D7-D8 | CAN ESD | PESD1CAN | SOD-323 | 2 | 0.30 | 0.60 |
| | **Subtotal** | | | | | **€1.00** |

### 3.10 PCB Fabrication

| ID | Component | Specification | Qty | Unit € | Total € |
|----|-----------|---------------|-----|--------|---------|
| PCB01 | 4-layer PCB | 80×60mm, 1.6mm, ENIG | 5 | 3.00 | 15.00 |
| | **Subtotal** | | | | **€15.00** |

### 3.11 Discrete Components Summary

| Category | Total € |
|----------|---------|
| MCU & Core | 9.80 |
| Power Supply | 2.10 |
| CAN-FD Interface | 5.70 |
| Debug & Programming | 2.10 |
| Memory (Optional) | 5.50 |
| Passive Components | 1.40 |
| Connectors | 2.00 |
| Indicators | 0.60 |
| ESD Protection | 1.00 |
| PCB (5 pcs) | 15.00 |
| **TOTAL (per board)** | **~€45.20** |
| **TOTAL (5 boards)** | **~€165.00** |

---

## 4. Software Tools

All required software is free/open source:

| Tool | Purpose | License | Download |
|------|---------|---------|----------|
| ARM GCC Toolchain | Compiler (arm-none-eabi-gcc) | GPL | developer.arm.com |
| OpenOCD | Debugger/flasher | GPL | openocd.org |
| STM32CubeIDE | ST development IDE | Free | st.com |
| STM32CubeMX | Pin/clock configuration | Free | st.com |
| VS Code + Cortex-Debug | Alternative IDE | MIT | code.visualstudio.com |
| PulseView/sigrok | Logic analyzer software | GPL | sigrok.org |
| PCAN-View | CAN-FD bus monitor | Free* | peak-system.com |

*Free with PEAK hardware

---

## 5. Recommended Procurement Phases

### Phase 1: Minimal Start (~€75)

Get started with JEZGRO kernel development:

| Item | € |
|------|---|
| NUCLEO-G474RE × 2 | 48.00 |
| ST-LINK V3MINIE | 12.00 |
| USB-UART × 2 | 6.00 |
| Jumper wires + breadboard | 9.00 |
| **Total** | **€75.00** |

**Enables:** Kernel core, MPU isolation, scheduler, IPC development

### Phase 2: CAN-FD Testing (+€115)

Multi-node swarm testing:

| Item | € |
|------|---|
| Logic analyzer 24MHz | 15.00 |
| SN65HVD230 breakout × 3 | 12.00 |
| Canable Pro CAN-FD USB | 80.00 |
| Cables and connectors | 8.00 |
| **Total** | **€115.00** |

**Enables:** CAN-FD IPC gateway, swarm coordination testing

### Phase 3: Custom Prototype (~€165)

Build dedicated JEZGRO hardware:

| Item | € |
|------|---|
| Discrete components (5 boards) | 150.00 |
| PCB fabrication (5 pcs) | 15.00 |
| **Total** | **€165.00** |

**Enables:** Production-representative testing, thermal validation

### Phase 4: Professional Tools (+€670)

For advanced debugging:

| Item | € |
|------|---|
| PEAK PCAN-USB FD | 320.00 |
| Saleae Logic 8 | 350.00 |
| **Total** | **€670.00** |

**Enables:** Protocol analysis, timing certification, compliance testing

---

## 6. Total Investment Summary

| Configuration | Total € | Description |
|---------------|---------|-------------|
| **Minimal** | ~€75 | 2× NUCLEO + debugger |
| **Standard** | ~€355 | + CAN-FD + logic analyzer + prototype |
| **Professional** | ~€1,025 | + PEAK + Saleae |
| **Full Lab** | ~€2,400 | + bench PSU + J-Trace + spares |

---

## 7. Supplier Recommendations

| Component Type | Recommended Supplier | Notes |
|----------------|---------------------|-------|
| STM32 MCUs | Mouser, DigiKey, Farnell | Official distributors |
| NUCLEO boards | ST eStore, Mouser | Often discounted |
| CAN transceivers | Mouser, DigiKey | TJA1443 from NXP |
| Passive components | LCSC, Mouser | LCSC for bulk |
| PCB fabrication | JLCPCB, PCBWay | JLCPCB cheapest |
| Connectors | LCSC, AliExpress | Budget option |
| Test equipment | Amazon, AliExpress | Logic analyzers |
| Professional tools | Direct (PEAK, Saleae, Segger) | Warranty support |

---

## 8. Reference Documents

| Document | Description |
|----------|-------------|
| `16-jezgro.md` | JEZGRO RTOS specification |
| `04-bom-cost.md` | EK3 module production BOM |
| `SPECIFICATIONS.md` | EK3 master specifications |
| `14-firmware-architecture.md` | Firmware architecture (FreeRTOS baseline) |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial version |
