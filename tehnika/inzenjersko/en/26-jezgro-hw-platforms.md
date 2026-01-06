# JEZGRO Hardware Platforms

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document specifies the **hardware platforms** for the JEZGRO microkernel product family. By converging on common MCU families, PCB designs, and components, ELEKTROKOMBINACIJA achieves supply chain efficiency, simplified manufacturing, and consistent firmware interfaces across all variants.

---

## 1. Overview

### 1.1 Platform Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO HARDWARE PLATFORM STRATEGY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    TWO MCU FAMILIES                                  │   │
│   │                                                                      │   │
│   │   ┌─────────────────────┐    ┌─────────────────────┐               │   │
│   │   │    STM32G474        │    │    STM32H743        │               │   │
│   │   │    (Cortex-M4)      │    │    (Cortex-M7)      │               │   │
│   │   │                     │    │                     │               │   │
│   │   │  • 170 MHz          │    │  • 480 MHz          │               │   │
│   │   │  • 512 KB Flash     │    │  • 2 MB Flash       │               │   │
│   │   │  • 128 KB RAM       │    │  • 1 MB RAM         │               │   │
│   │   │  • ~$8              │    │  • ~$15             │               │   │
│   │   │                     │    │                     │               │   │
│   │   │  Used by:           │    │  Used by:           │               │   │
│   │   │  • JEZGRO-EK3       │    │  • JEZGRO-ROB       │               │   │
│   │   │  • JEZGRO-RACK      │    │  • JEZGRO-GW        │               │   │
│   │   │  • JEZGRO-BAT       │    │  • EK-ADAPT-*       │               │   │
│   │   │  • EK-ADAPT-BUS     │    │                     │               │   │
│   │   │  • EK-ADAPT-OCPP    │    │                     │               │   │
│   │   └─────────────────────┘    └─────────────────────┘               │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    THREE PCB FORM FACTORS                            │   │
│   │                                                                      │   │
│   │   ┌───────────┐   ┌───────────┐   ┌───────────┐                    │   │
│   │   │  EK-PCB-S │   │  EK-PCB-M │   │  EK-PCB-L │                    │   │
│   │   │  50×80mm  │   │  80×100mm │   │  100×160mm│                    │   │
│   │   │  4-layer  │   │  4-layer  │   │  6-layer  │                    │   │
│   │   │           │   │           │   │           │                    │   │
│   │   │ • EK3     │   │ • Rack    │   │ • Robot   │                    │   │
│   │   │ • Battery │   │ • Adapters│   │ • Gateway │                    │   │
│   │   └───────────┘   └───────────┘   └───────────┘                    │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 MCU Selection Matrix

| JEZGRO Variant | MCU | Reason | Key Requirements |
|----------------|-----|--------|------------------|
| **JEZGRO-EK3** | STM32G474 | HRTIM for LLC, CORDIC | 65 kHz switching, 128 KB RAM |
| **JEZGRO-RACK** | STM32G474 | CAN-FD × 3, PWM | Fan control, slot management |
| **JEZGRO-BAT** | STM32G474 | ADC for cell monitoring | 16-cell AFE interface |
| **JEZGRO-ROB** | STM32H743 | Double FPU, more RAM | Trajectory, kinematics |
| **JEZGRO-GW** | STM32H743 | Ethernet, 1 MB RAM | ISO 15118, TLS buffers |

### 1.3 NOT Using JEZGRO (Dedicated Hardware)

| Component | MCU/DSP | Reason |
|-----------|---------|--------|
| **Central PFC** | TMS320F28379D | DSP for PLL, high-res PWM (150 ps) |
| **Safety MCU** | AURIX TC3xx | ASIL-D lockstep, hardware safety |
| **Station Controller** | Linux SBC (RPi CM4) | Full OS for OCPP server, HMI |

---

## 2. STM32G474 Platform

### 2.1 MCU Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Core** | ARM Cortex-M4F | 170 MHz, single-precision FPU |
| **Flash** | 512 KB | Dual-bank, ECC |
| **RAM** | 128 KB | SRAM1 + SRAM2 |
| **HRTIM** | 217 ps resolution | For LLC resonant control |
| **ADC** | 5 × 12-bit, 4 MSPS | Simultaneous sample |
| **CAN-FD** | 3 × FDCAN | 5 Mbps data rate |
| **CORDIC** | Hardware trig | sin/cos in 6 cycles |
| **FMAC** | Filter accelerator | IIR/FIR filters |
| **DAC** | 4 × 12-bit | Comparator references |
| **Comparators** | 7 × analog | Hardware fault detection |
| **Temp range** | -40°C to +125°C | Industrial grade |
| **Package** | LQFP100 / LQFP64 | 100-pin preferred |
| **Price** | ~$8 (qty 1000) | Volume pricing |

### 2.2 Memory Map (JEZGRO on G474)

```
┌─────────────────────────────────────────────────┐  0x2001FFFF (128 KB)
│                                                 │
│        AUDIT_LOGGER (16 KB)                     │
│        Ring buffer, flash commit queue          │
├─────────────────────────────────────────────────┤  0x2001C000
│        ROJ_COORD (16 KB)                      │
│        Multi-module coordination                │
├─────────────────────────────────────────────────┤  0x20018000
│        SERVICE-SPECIFIC (8-16 KB)               │
│        Thermal, CAN, Safety, etc.               │
├─────────────────────────────────────────────────┤  0x20014000
│        LLC_CONTROL / APPLICATION (16 KB)        │
│        Control loop, state machine              │
├─────────────────────────────────────────────────┤  0x20010000
│        IPC MESSAGE POOL (32 KB)                 │
│        512 messages × 64 bytes                  │
├─────────────────────────────────────────────────┤  0x20008000
│        KERNEL SPACE (8 KB)                      │
│        Scheduler, MPU, ISR vectors              │
├─────────────────────────────────────────────────┤  0x20006000
│        STACK GUARDS (8 KB)                      │
│        MPU-protected regions                    │
├─────────────────────────────────────────────────┤  0x20004000
│        STACKS (16 KB)                           │
│        Per-service stacks (1-2 KB each)         │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.3 Peripheral Assignment (JEZGRO-EK3)

| Peripheral | Function | Notes |
|------------|----------|-------|
| **HRTIM** | LLC PWM | 65-500 kHz, synchronous rect |
| **TIM1** | Auxiliary PWM | Soft-start, fan |
| **ADC1** | Voltage sensing | Vin, Vout, Vbus |
| **ADC2** | Current sensing | Iin, Iout |
| **ADC3** | Temperature | NTC × 4 |
| **FDCAN1** | EK internal CAN | Module ↔ Rack |
| **FDCAN2** | External CAN | Station controller |
| **DAC1-2** | Fault thresholds | OCP, OVP references |
| **COMP1-4** | Hardware protection | <50 ns trip |
| **USART1** | Debug console | 115200 baud |
| **SPI1** | External flash | W25Q128 (16 MB) |

### 2.4 Clock Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STM32G474 CLOCK TREE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   HSE (8 MHz)                                                                │
│       │                                                                      │
│       ├──► PLL ──► SYSCLK (170 MHz) ──► AHB (170 MHz) ──► APB1/2 (170 MHz)  │
│       │                                                                      │
│       └──► HRTIM Clock (170 MHz × 32 = 5.44 GHz effective)                  │
│                     └──► 217 ps PWM resolution                              │
│                                                                              │
│   LSE (32.768 kHz) ──► RTC, IWDG (backup)                                   │
│                                                                              │
│   FDCAN: HSE / 1 = 8 MHz ──► Bit timing for 5 Mbps                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. STM32H743 Platform

### 3.1 MCU Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Core** | ARM Cortex-M7 | 480 MHz, double-precision FPU |
| **Flash** | 2 MB | Dual-bank, ECC |
| **RAM** | 1 MB | D1 (512K) + D2 (288K) + D3 (64K) + ITCM (64K) + DTCM (128K) |
| **Cache** | 16 KB I + 16 KB D | For performance |
| **Ethernet** | 10/100 MAC | With PHY for OCPP |
| **USB** | USB HS + OTG | For PLC modem |
| **CAN-FD** | 2 × FDCAN | 5 Mbps data rate |
| **ADC** | 3 × 16-bit | Simultaneous, 3.6 MSPS |
| **Crypto** | AES, SHA, RNG | Hardware acceleration |
| **Temp range** | -40°C to +85°C | Industrial grade |
| **Package** | LQFP144 / LQFP176 | 144-pin typical |
| **Price** | ~$15 (qty 1000) | Volume pricing |

### 3.2 Memory Map (JEZGRO on H743)

```
┌─────────────────────────────────────────────────┐  0x240FFFFF
│                                                 │
│        D3 DOMAIN (64 KB)                        │
│        DMA, BDMA accessible                     │
├─────────────────────────────────────────────────┤  0x38010000
│                                                 │
│        D2 DOMAIN (288 KB)                       │
│        Ethernet DMA, USB buffers                │
├─────────────────────────────────────────────────┤  0x30048000
│                                                 │
│        D1 DOMAIN (512 KB)                       │
│        Main application memory                  │
│        ┌─────────────────────────────────────┐  │
│        │ ISO15118 Service (128 KB)           │  │
│        ├─────────────────────────────────────┤  │
│        │ OCPP_CLIENT (64 KB)                 │  │
│        ├─────────────────────────────────────┤  │
│        │ Protocol Services (64 KB)           │  │
│        ├─────────────────────────────────────┤  │
│        │ Control Services (64 KB)            │  │
│        ├─────────────────────────────────────┤  │
│        │ IPC Message Pool (64 KB)            │  │
│        ├─────────────────────────────────────┤  │
│        │ TLS Buffers (64 KB)                 │  │
│        ├─────────────────────────────────────┤  │
│        │ Kernel + Stacks (64 KB)             │  │
│        └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤  0x24000000
│                                                 │
│        DTCM (128 KB) - Zero wait state          │
│        Critical control variables               │
├─────────────────────────────────────────────────┤  0x20000000
│                                                 │
│        ITCM (64 KB) - Zero wait state           │
│        Critical ISR code                        │
└─────────────────────────────────────────────────┘  0x00000000
```

### 3.3 Peripheral Assignment (JEZGRO-GW)

| Peripheral | Function | Notes |
|------------|----------|-------|
| **ETH** | OCPP, ISO 15118-20 | LAN8742A PHY |
| **USB HS** | PLC modem | HomePlug Green PHY |
| **FDCAN1** | EK internal CAN | Station bus |
| **FDCAN2** | Vehicle CAN | For adapters |
| **TIM1** | Control timing | 10 kHz loop |
| **ADC1-2** | Grid sensing | Va, Vb, Vc, Ia, Ib, Ic |
| **DAC1** | Analog output | Test signals |
| **CRYP** | TLS acceleration | AES-128/256 |
| **HASH** | SHA-256 | Certificate validation |
| **SPI1** | External flash | W25Q128 (16 MB) |
| **USART1** | Debug console | 115200 baud |

### 3.4 Peripheral Assignment (JEZGRO-ROB)

| Peripheral | Function | Notes |
|------------|----------|-------|
| **TIM1-2** | Servo PWM | 6 axes × 2 (Robot A+B) |
| **TIM3-4** | Encoder interface | Quadrature × 6 |
| **ADC1-2** | Motor current | Per-axis sensing |
| **ADC3** | Force/torque | Load cells |
| **SPI1** | IMU interface | ICM-42688-P |
| **SPI2** | Vision sensor | Low-res camera |
| **FDCAN1** | Robot A bus | Internal axes |
| **FDCAN2** | Robot B bus | Internal axes |
| **USART1** | Station CAN | Via isolator |
| **I2C1** | EEPROM, RTC | Configuration |

---

## 4. PCB Form Factors

### 4.1 EK-PCB-S (50×80mm)

**Applications:** JEZGRO-EK3, JEZGRO-BAT

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-S (50×80mm)                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────┐          │
│   │                                                              │          │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐     │ 50mm     │
│   │    │ MCU    │    │ Power  │    │ CAN    │    │ Debug  │     │          │
│   │    │G474    │    │ Reg    │    │ Trans  │    │ Header │     │          │
│   │    └────────┘    └────────┘    └────────┘    └────────┘     │          │
│   │                                                              │          │
│   │    ┌────────────────────────────────────────────────┐       │          │
│   │    │              Application-Specific              │       │          │
│   │    │        (Gate drivers, AFE, sensors)           │       │          │
│   │    └────────────────────────────────────────────────┘       │          │
│   │                                                              │          │
│   │    [===] [===] [===] [===]  ← Connectors (bottom edge)      │          │
│   │    Pwr   CAN   Ctrl  Aux                                     │          │
│   └──────────────────────────────────────────────────────────────┘          │
│                                                                              │
│                              80mm                                            │
│                                                                              │
│   Layer stackup (4-layer):                                                  │
│   L1: Signal (MCU, high-speed)                                              │
│   L2: GND plane                                                             │
│   L3: Power plane (3.3V, 5V)                                                │
│   L4: Signal (connectors, analog)                                           │
│                                                                              │
│   Thickness: 1.6 mm                                                         │
│   Copper: 1 oz (35 µm)                                                      │
│   Finish: ENIG                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 EK-PCB-M (80×100mm)

**Applications:** JEZGRO-RACK, EK-ADAPT-BUS, EK-ADAPT-OCPP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-M (80×100mm)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                                                                   │     │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────┐      │ 80mm│
│   │    │ MCU    │    │ Ethernet│   │ CAN ×2 │    │ Cellular   │      │     │
│   │    │G474/H743│   │ PHY    │    │ Trans  │    │ (optional) │      │     │
│   │    └────────┘    └────────┘    └────────┘    └────────────┘      │     │
│   │                                                                   │     │
│   │    ┌────────┐    ┌────────┐    ┌────────────────────────┐        │     │
│   │    │ Power  │    │ Flash  │    │    Application Area    │        │     │
│   │    │ Supply │    │ 16MB   │    │   (RS485, Modbus, etc) │        │     │
│   │    └────────┘    └────────┘    └────────────────────────┘        │     │
│   │                                                                   │     │
│   │    ┌────────────────────────────────────────────────────┐        │     │
│   │    │              Connector Row (M12, Phoenix)          │        │     │
│   │    └────────────────────────────────────────────────────┘        │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                              │
│                                 100mm                                        │
│                                                                              │
│   Layer stackup (4-layer):                                                  │
│   L1: Signal (MCU, Ethernet)                                                │
│   L2: GND plane                                                             │
│   L3: Power plane                                                           │
│   L4: Signal (connectors)                                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 EK-PCB-L (100×160mm)

**Applications:** JEZGRO-ROB, JEZGRO-GW, EK-ADAPT-V2G, EK-ADAPT-CCS, EK-ADAPT-MCS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EK-PCB-L (100×160mm)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                                                                    │    │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────────┐   │100mm
│   │    │ MCU    │    │ Ethernet│   │  USB   │    │ PLC Modem      │   │    │
│   │    │ H743   │    │ PHY    │    │  PHY   │    │ (HomePlug)     │   │    │
│   │    │ 144pin │    │        │    │        │    │                │   │    │
│   │    └────────┘    └────────┘    └────────┘    └────────────────┘   │    │
│   │                                                                    │    │
│   │    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────────────┐   │    │
│   │    │ Power  │    │ Flash  │    │ CAN ×2 │    │ Isolated       │   │    │
│   │    │ Supply │    │ 16MB   │    │ Trans  │    │ DC/DC          │   │    │
│   │    └────────┘    └────────┘    └────────┘    └────────────────┘   │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │              Application-Specific Area                  │     │    │
│   │    │    (Motor drivers, ADC interface, relay control)       │     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │        Isolation Barrier (3mm gap)                      │     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    ┌────────────────────────────────────────────────────────┐     │    │
│   │    │        High Voltage Interface (isolated)               │     │    │
│   │    └────────────────────────────────────────────────────────┘     │    │
│   │                                                                    │    │
│   │    [Connectors: M12, Deutsch, Phoenix, RJ45]                      │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│                                 160mm                                        │
│                                                                              │
│   Layer stackup (6-layer):                                                  │
│   L1: Signal (MCU, high-speed)                                              │
│   L2: GND plane                                                             │
│   L3: Signal (analog, low-speed)                                            │
│   L4: Power plane (3.3V, 5V, 15V)                                           │
│   L5: GND plane                                                             │
│   L6: Signal (connectors, power)                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Common Components

### 5.1 Bill of Materials (Common Core)

| Category | Component | Part Number | Qty | Price (1k) | Used By |
|----------|-----------|-------------|-----|------------|---------|
| **MCU** | STM32G474VET6 | STM32G474VET6 | 1 | $8.00 | EK3, RACK, BAT |
| **MCU** | STM32H743VIT6 | STM32H743VIT6 | 1 | $15.00 | ROB, GW, ADAPT |
| **Flash** | 16 MB SPI NOR | W25Q128JVSIQ | 1 | $1.50 | All |
| **CAN Trans** | CAN-FD | TJA1443ATK | 2 | $1.20 | All |
| **Ethernet PHY** | 10/100 | LAN8742A-CZ | 1 | $2.00 | H743 only |
| **LDO 3.3V** | 500 mA | AMS1117-3.3 | 1 | $0.15 | All |
| **LDO 5V** | 1 A | LM1117-5.0 | 1 | $0.20 | All |
| **Crystal** | 8 MHz | ABM8-8.000MHZ | 1 | $0.30 | All |
| **Crystal** | 32.768 kHz | ABS07-32.768KHZ | 1 | $0.25 | All |
| **ESD Prot** | TVS array | TPD4E05U06 | 2 | $0.40 | All |
| **Ferrite** | EMI filter | BLM18PG121SN1 | 10 | $0.05 | All |

### 5.2 Power Supply Section

| Component | Part Number | Spec | Price |
|-----------|-------------|------|-------|
| **DC/DC 24V→5V** | TPS54531 | 5A, 96% eff | $1.50 |
| **DC/DC 24V→3.3V** | TPS62175 | 500mA | $1.00 |
| **DC/DC 24V→15V (iso)** | SN6505B + transformer | 1W | $3.00 |
| **DC/DC 24V→-15V (iso)** | SN6505B + transformer | 1W | $3.00 |
| **Input protection** | TVS + Fuse | 36V clamp | $0.50 |

### 5.3 Communication Interfaces

| Interface | Components | Notes |
|-----------|------------|-------|
| **CAN-FD** | TJA1443 + TVS | 5 Mbps, ±58V fault |
| **Ethernet** | LAN8742A + magnetics | 10/100 Mbps |
| **USB HS** | USB3320C + ESD | 480 Mbps |
| **RS485** | MAX3485 | For OCPP bridge |
| **SPI Flash** | W25Q128JV | 133 MHz, 16 MB |

---

## 6. Connector Standards

### 6.1 Connector Selection

| Interface | Connector | IP Rating | Notes |
|-----------|-----------|-----------|-------|
| **Power input** | Phoenix MC 4-pin | IP20 | 9-36V DC, 5A |
| **CAN-FD (EK)** | Deutsch DT04-4P | IP67 | CANL, CANH, GND, VCC |
| **CAN (external)** | M12 5-pin A-coded | IP67 | Industry standard |
| **Ethernet** | M12 D-coded | IP67 | Industrial |
| **Ethernet (indoor)** | RJ45 shielded | IP20 | Standard |
| **USB** | USB-C | IP20 | Debug/maintenance |
| **Debug** | 2×5 0.05" header | - | SWD + UART |

### 6.2 Pinouts

**CAN-FD (Deutsch DT04-4P):**
| Pin | Signal | Color |
|-----|--------|-------|
| 1 | CAN_H | Yellow |
| 2 | CAN_L | Green |
| 3 | GND | Black |
| 4 | VCC (optional) | Red |

**Debug Header (2×5 0.05"):**
| Pin | Signal |
|-----|--------|
| 1 | VCC (3.3V) |
| 2 | SWDIO |
| 3 | GND |
| 4 | SWCLK |
| 5 | GND |
| 6 | SWO |
| 7 | NC |
| 8 | TX (UART) |
| 9 | GND |
| 10 | RX (UART) |

---

## 7. Debug and Programming

### 7.1 Debug Interfaces

| Method | Connector | Tool | Speed |
|--------|-----------|------|-------|
| **SWD** | 2×5 header | ST-Link V3 | 24 MHz |
| **JTAG** | 2×10 header | J-Link | 50 MHz |
| **UART** | On debug header | Any USB-UART | 115200 |
| **RTT** | Via SWD | J-Link RTT | Real-time |

### 7.2 Production Programming

| Stage | Method | Notes |
|-------|--------|-------|
| **Factory** | Gang programmer | Program 10 boards simultaneously |
| **Test** | SWD via test fixture | Functional test + calibration |
| **Field update** | CAN bootloader | JEZGRO OTA capability |
| **Recovery** | SWD via USB | Debug port always accessible |

### 7.3 Bootloader

```c
// JEZGRO bootloader memory map
// Located in first 32 KB of flash

#define BOOTLOADER_START    0x08000000
#define BOOTLOADER_SIZE     0x8000      // 32 KB
#define APPLICATION_START   0x08008000
#define APPLICATION_SIZE    0x78000     // 480 KB (G474)

typedef struct {
    uint32_t magic;         // 0x4A455A47 ("JEZG")
    uint32_t version;       // Semantic version
    uint32_t size;          // Application size
    uint32_t crc32;         // CRC32 of application
    uint32_t entry_point;   // Reset vector
} jezgro_app_header_t;
```

---

## 8. Variant-Specific Hardware

### 8.1 JEZGRO-EK3 (Charging Module)

| Component | Part Number | Function |
|-----------|-------------|----------|
| **Gate driver** | UCC21520 | Isolated, 4A |
| **Current sense** | ACS730KLCTR-20AB | Hall, 20A |
| **Voltage sense** | Resistor divider + AMC1311 | Isolated |
| **NTC interface** | 10k pull-up × 4 | Temperature |
| **LLC transformer** | Custom E32 | 650V:450V |

### 8.2 JEZGRO-BAT (Battery BMS)

| Component | Part Number | Function |
|-----------|-------------|----------|
| **AFE** | BQ76952 | 16-cell, balancing |
| **isoSPI** | LTC6820 | Daisy-chain |
| **Current sense** | Shunt + INA240 | ±200A |
| **Precharge** | Relay + resistor | Soft start |
| **Fuse monitor** | Voltage divider | Fuse status |

### 8.3 JEZGRO-ROB (Robot Controller)

| Component | Part Number | Function |
|-----------|-------------|----------|
| **Motor driver** | DRV8302 × 6 | BLDC, 60V/30A |
| **Encoder interface** | On-chip (TIM) | Quadrature × 6 |
| **IMU** | ICM-42688-P | 6-axis, 32 kHz |
| **Force sensor ADC** | ADS131M08 | 8-ch, 24-bit |
| **E-stop relay** | Safety relay | SIL3 capable |

### 8.4 JEZGRO-GW (Gateway)

| Component | Part Number | Function |
|-----------|-------------|----------|
| **PLC modem** | QCA7005 | HomePlug Green PHY |
| **Ethernet switch** | KSZ8795 | 5-port (optional) |
| **Contactor driver** | ULN2003A | 7-ch, 500mA |
| **Pilot circuit** | Comparator + PWM | IEC 61851 |
| **Isolation** | ISO7741 × 2 | Digital isolator |

---

## 9. Testing and Validation

### 9.1 Hardware Test Points

| Test Point | Signal | Purpose |
|------------|--------|---------|
| TP1 | VCC_3V3 | Power supply |
| TP2 | VCC_5V | Power supply |
| TP3 | CAN_H | CAN bus debug |
| TP4 | CAN_L | CAN bus debug |
| TP5 | GND | Ground reference |
| TP6 | MCU_CLK | Clock verification |
| TP7-10 | App-specific | Per variant |

### 9.2 Production Test Sequence

| Step | Test | Pass Criteria |
|------|------|---------------|
| 1 | Power on | 3.3V ±5%, 5V ±5% |
| 2 | Crystal check | 8 MHz ±50 ppm |
| 3 | Flash ID | W25Q128 detected |
| 4 | CAN loopback | Tx/Rx match |
| 5 | Program firmware | CRC32 valid |
| 6 | Self-test | All services start |
| 7 | Calibration | Per-unit ADC cal |

### 9.3 EMC Requirements

| Test | Standard | Requirement |
|------|----------|-------------|
| ESD | IEC 61000-4-2 | ±8 kV contact, ±15 kV air |
| Radiated immunity | IEC 61000-4-3 | 10 V/m, 80-2000 MHz |
| Conducted immunity | IEC 61000-4-6 | 10 V, 150 kHz-80 MHz |
| Surge | IEC 61000-4-5 | ±2 kV common, ±1 kV diff |
| Radiated emissions | CISPR 32 | Class B |

---

## 10. Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/21-jezgro-product-family.md` | Product family overview |
| `tehnika/inzenjersko/en/16-jezgro.md` | JEZGRO kernel specification |
| `tehnika/inzenjersko/en/komponente/kontrolna-elektronika.md` | Control electronics |
| `tehnika/inzenjersko/en/SPECIFICATIONS.md` | Master specifications |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial hardware platforms specification |
