# JEZGRO Simulation Guide - All Target Architectures

## Overview

JEZGRO supports multiple hardware targets for the Hybrid development option. Each architecture has different simulation capabilities:

| Target | Architecture | Renode Support | Alternative Simulators |
|--------|--------------|----------------|------------------------|
| **STM32G474** | ARM Cortex-M4F | ✅ Full | QEMU, Keil MDK |
| **ESP32-S3** | Xtensa LX7 | ⚠️ Partial | Wokwi, QEMU, ESP-IDF |
| **AURIX TC3xx** | TriCore | ❌ None | QEMU-TriCore, DAS, Simulink |
| **TI C2000** | C28x DSP | ❌ None | CCS Simulator, PSIM |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        JEZGRO Hybrid Architecture                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │   AURIX     │     │  TI C2000   │     │  ESP32-S3   │                   │
│  │   TC375     │     │  F280049C   │     │             │                   │
│  │             │     │             │     │             │                   │
│  │ ┌─────────┐ │     │ ┌─────────┐ │     │ ┌─────────┐ │                   │
│  │ │ Safety  │ │     │ │  PWM    │ │     │ │  WiFi   │ │                   │
│  │ │ ASIL-D  │ │     │ │ 150ps   │ │     │ │  OTA    │ │                   │
│  │ │ Lockstep│ │     │ │ HRPWM   │ │     │ │  Cloud  │ │                   │
│  │ └─────────┘ │     │ └─────────┘ │     │ └─────────┘ │                   │
│  │             │     │             │     │             │                   │
│  │    CAN-FD   │◄───►│   CAN-FD    │     │    CAN     │                   │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                   │
│         │                   │                   │                          │
│         └───────────────────┴───────────────────┘                          │
│                             │                                               │
│                        CAN-FD Bus                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. STM32G474 Simulation (Full Support)

### 1.1 Renode Emulation

STM32G474 is the **primary development target** with excellent Renode support.

**Platform files:**
- `renode/stm32g474-full.repl` - Complete platform description
- `renode/jezgro-stm32.resc` - Test scenario

**What's emulated:**
- ✅ ARM Cortex-M4F CPU (full instruction set)
- ✅ FPU (single precision)
- ✅ NVIC (interrupt controller)
- ✅ SysTick timer
- ✅ General purpose timers (TIM1-TIM7, TIM15-16)
- ✅ UART (USART1-3, LPUART1)
- ✅ GPIO (GPIOA-G)
- ✅ SPI (SPI1-3)
- ✅ I2C (I2C1-3)
- ✅ DMA (DMA1-2)
- ⚠️ FDCAN (stub - basic register access)
- ⚠️ ADC (stub - configurable values)
- ⚠️ DAC (stub)
- ⚠️ HRTIM (stub)
- ⚠️ CORDIC (simplified math)

**Quick start:**
```bash
# Build for ARM
mkdir build-arm && cd build-arm
cmake -DCMAKE_TOOLCHAIN_FILE=../cmake/arm-none-eabi.cmake ..
make

# Run in Renode
renode ../renode/jezgro-stm32.resc
(monitor) start
```

**Debugging:**
```bash
# In Renode
(monitor) machine StartGdbServer 3333

# In another terminal
arm-none-eabi-gdb build-arm/jezgro_firmware.elf
(gdb) target remote :3333
(gdb) break main
(gdb) continue
```

### 1.2 QEMU Alternative

QEMU also supports STM32:

```bash
# Install
sudo apt install qemu-system-arm

# Run (generic Cortex-M4)
qemu-system-arm -M netduinoplus2 -kernel jezgro_firmware.elf -nographic
```

---

## 2. ESP32-S3 Simulation (Partial Support)

### 2.1 Renode Emulation (Limited)

**Platform files:**
- `renode/esp32s3.repl` - Platform description
- `renode/jezgro-esp32.resc` - Test scenario

**What works:**
- ✅ Xtensa LX7 CPU execution
- ✅ UART
- ✅ GPIO
- ✅ Timers
- ✅ TWAI (CAN)
- ❌ WiFi (NOT SUPPORTED)
- ❌ Bluetooth/BLE (NOT SUPPORTED)
- ❌ USB OTG

**Quick start:**
```bash
renode renode/jezgro-esp32.resc
(monitor) start
```

### 2.2 Wokwi Simulator (Recommended for WiFi)

[Wokwi](https://wokwi.com) is a web-based simulator with **full WiFi support**.

**Features:**
- ✅ WiFi simulation (connects to real internet!)
- ✅ BLE simulation
- ✅ All peripherals
- ✅ Visual interface
- ✅ Shareable projects

**Setup:**
1. Go to https://wokwi.com
2. Create new ESP32-S3 project
3. Upload your firmware (.bin)
4. Configure `diagram.json` for pins
5. Run simulation

**Example diagram.json:**
```json
{
  "version": 1,
  "author": "JEZGRO",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp" },
    { "type": "wokwi-led", "id": "led1", "attrs": { "color": "green" } }
  ],
  "connections": [
    [ "esp:5", "led1:A", "green" ],
    [ "led1:C", "esp:GND", "black" ]
  ]
}
```

### 2.3 ESP-IDF QEMU

Espressif provides QEMU fork with ESP32 support:

```bash
# Clone ESP-QEMU
git clone https://github.com/espressif/qemu.git esp-qemu
cd esp-qemu
./configure --target-list=xtensa-softmmu
make

# Run
./qemu-system-xtensa -M esp32s3 -kernel jezgro_esp32.elf -nographic
```

### 2.4 Unit Testing with Mock WiFi

For WiFi-dependent code, use mocking:

```c
// wifi_hal.h
#ifdef SIMULATION
    #define wifi_init()         mock_wifi_init()
    #define wifi_connect(ssid)  mock_wifi_connect(ssid)
    #define wifi_send(data)     mock_wifi_send(data)
#else
    #define wifi_init()         esp_wifi_init(&cfg)
    // ... real implementations
#endif
```

---

## 3. AURIX TC3xx Simulation (No Renode Support)

### 3.1 Why No Renode?

AURIX uses **TriCore architecture** which is proprietary to Infineon. Renode doesn't support it (see [GitHub issue #749](https://github.com/renode/renode/issues/749)).

### 3.2 QEMU-TriCore

QEMU has **experimental** TriCore support:

```bash
# Build QEMU with TriCore
git clone https://github.com/qemu/qemu.git
cd qemu
./configure --target-list=tricore-softmmu
make

# Run (limited peripheral support)
qemu-system-tricore -M tricore_testboard -kernel jezgro_aurix.elf
```

**Limitations:**
- Basic CPU emulation only
- No peripheral models
- No lockstep cores
- No safety features

### 3.3 Infineon DAS (Device Access Server)

For real AURIX development, use Infineon's tools:

```
┌─────────────────────────────────────────────────────────────────┐
│  Infineon Development Access Server (DAS)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   AURIX     │    │    DAS      │    │   Host PC   │         │
│  │ Development │◄──►│   Server    │◄──►│   + IDE     │         │
│  │   Studio    │    │   (Debug)   │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  - Register-level debugging                                     │
│  - Performance analysis                                         │
│  - Trace capture                                                │
│  - Multi-core debugging                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Download:** [AURIX Development Studio](https://www.infineon.com/aurix-development-studio)

### 3.4 Lauterbach TRACE32

Industry-standard debugger for AURIX:

- Full TriCore debugging
- Lockstep core support
- Real-time trace
- Expensive (~€5000+ for license)

### 3.5 MATLAB/Simulink with Embedded Coder

For safety-critical AURIX code:

```
┌─────────────────────────────────────────────────────────────────┐
│  Model-Based Design Flow                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌──────────┐ │
│  │ Simulink  │   │  Embedded │   │    C      │   │  AURIX   │ │
│  │  Model    │──►│   Coder   │──►│   Code    │──►│ Binary   │ │
│  │           │   │           │   │           │   │          │ │
│  └───────────┘   └───────────┘   └───────────┘   └──────────┘ │
│       │                                                         │
│       │ Simulation                                              │
│       ▼                                                         │
│  ┌───────────┐                                                  │
│  │   SIL     │  Software-in-Loop testing                       │
│  │   PIL     │  Processor-in-Loop testing                      │
│  │   HIL     │  Hardware-in-Loop testing                       │
│  └───────────┘                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Recommended AURIX Workflow

Since direct simulation is limited, use this approach:

```
1. Write core algorithms in portable C (no TriCore specifics)
2. Test on STM32G474 in Renode (same ARM concepts)
3. Use AURIX Development Studio for register setup
4. Use HAL abstraction:

   // jezgro_hal_aurix.h
   void hal_pwm_set_duty(uint8_t channel, uint16_t duty) {
       // AURIX GTM/ATOM implementation
       GTM_ATOM0_CH0_SR0 = duty;
   }

5. Final integration test on real hardware
```

---

## 4. TI C2000 Simulation (No Renode Support)

### 4.1 Why No Renode?

C2000 uses **C28x DSP architecture**, proprietary to Texas Instruments.

### 4.2 Code Composer Studio (CCS) Simulator

TI provides excellent simulation in CCS:

```
┌─────────────────────────────────────────────────────────────────┐
│  TI Code Composer Studio                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  CCS IDE                                                │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  C2000 Simulator                                │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │  CPU: C28x + FPU + VCU + TMU           │   │   │   │
│  │  │  │  Peripherals: ePWM, ADC, CAN, SPI, etc │   │   │   │
│  │  │  │  Memory: Flash, RAM, OTP               │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  │                                                 │   │   │
│  │  │  Features:                                      │   │   │
│  │  │  - Cycle-accurate simulation                    │   │   │
│  │  │  - Full peripheral models                       │   │   │
│  │  │  - PWM waveform analysis                        │   │   │
│  │  │  - CAN message simulation                       │   │   │
│  │  │  - ADC input injection                          │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Setup:**
1. Download [CCS](https://www.ti.com/tool/CCSTUDIO) (free)
2. Install C2000 device support
3. Create project for F280049C
4. Select "TMS320F280049C" simulator in debug config
5. Build and debug

**Key advantages:**
- ✅ Cycle-accurate CPU simulation
- ✅ Full ePWM peripheral model (including HRPWM!)
- ✅ ADC with input file injection
- ✅ CAN peripheral
- ✅ Real-time data logging
- ✅ Graph/plot capabilities

### 4.3 C2000Ware Digital Power SDK

For power electronics, use the DigitalPower SDK:

```bash
# Includes:
# - Control loop examples
# - Closed-loop simulation
# - SFRA (frequency response analyzer)
# - Compensation designer
```

### 4.4 PSIM + C2000 Co-Simulation

For power stage + control simulation:

```
┌─────────────────────────────────────────────────────────────────┐
│  PSIM + C2000 Co-Simulation                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────┐     ┌───────────────────────┐       │
│  │  PSIM Power Stage     │     │  C2000 Control Code   │       │
│  │  ┌─────────────────┐  │     │  ┌─────────────────┐  │       │
│  │  │  LLC Converter  │  │     │  │  PWM Generator  │  │       │
│  │  │  ┌───┐   ┌───┐  │  │     │  │  ┌───────────┐  │  │       │
│  │  │  │Lr │   │Cr │  │◄─┼─────┼──│  │ PI Control│  │  │       │
│  │  │  └───┘   └───┘  │  │ PWM │  │  └───────────┘  │  │       │
│  │  │       ║         │  │     │  │       ▲         │  │       │
│  │  │      Xfmr       │  │     │  │       │ ADC     │  │       │
│  │  │       ║         │──┼─────┼──►       │         │  │       │
│  │  │    Vout, Iout   │  │ FB  │  │    Feedback     │  │       │
│  │  └─────────────────┘  │     │  └─────────────────┘  │       │
│  └───────────────────────┘     └───────────────────────┘       │
│                                                                 │
│  Benefits:                                                      │
│  - Actual C28x code execution                                   │
│  - Real power stage dynamics                                    │
│  - Closed-loop stability testing                                │
│  - Fault injection                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 PLECS with C2000

Alternative to PSIM with similar capabilities:

```
Download: https://www.plexim.com/plecs
- Real-time simulation
- C code generation
- C2000 target support
```

### 4.6 Recommended C2000 Workflow

```
1. Develop control algorithms in MATLAB/Simulink or Python
2. Generate C code or port manually
3. Test in CCS Simulator with ADC input files
4. Use PSIM/PLECS for closed-loop verification
5. Final test on LaunchPad hardware
```

---

## 5. Multi-Target Simulation Strategy

### 5.1 HAL Abstraction for All Targets

```c
// hal.h - Portable interface
typedef struct {
    void (*init)(void);
    void (*pwm_set_duty)(uint8_t ch, uint16_t duty);
    uint16_t (*adc_read)(uint8_t ch);
    void (*can_send)(uint32_t id, uint8_t *data, uint8_t len);
    void (*can_recv)(uint32_t *id, uint8_t *data, uint8_t *len);
} hal_t;

// Select implementation at link time
#if defined(TARGET_STM32)
    extern const hal_t hal_stm32;
    #define HAL hal_stm32
#elif defined(TARGET_ESP32)
    extern const hal_t hal_esp32;
    #define HAL hal_esp32
#elif defined(TARGET_AURIX)
    extern const hal_t hal_aurix;
    #define HAL hal_aurix
#elif defined(TARGET_C2000)
    extern const hal_t hal_c2000;
    #define HAL hal_c2000
#elif defined(TARGET_SIM)
    extern const hal_t hal_sim;
    #define HAL hal_sim
#endif
```

### 5.2 Simulation Matrix

| Component | STM32 (Renode) | ESP32 (Wokwi) | AURIX (CCS) | C2000 (CCS) |
|-----------|----------------|---------------|-------------|-------------|
| JEZGRO Kernel | ✅ Full | ✅ Full | ⚠️ Port | ⚠️ Port |
| EDF Scheduler | ✅ | ✅ | ✅ | ✅ |
| IPC | ✅ | ✅ | ✅ | ✅ |
| CAN Protocol | ⚠️ Stub | ✅ TWAI | ❌ | ✅ |
| Safety Monitor | ❌ | ❌ | ✅ Lockstep | ❌ |
| HRPWM | ❌ | ❌ | ❌ | ✅ 150ps |
| WiFi/Cloud | ❌ | ✅ | ❌ | ❌ |

### 5.3 Recommended Development Order

```
┌─────────────────────────────────────────────────────────────────┐
│  Development Phases                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Core Kernel (STM32 + Renode)                         │
│  ═══════════════════════════════════════                        │
│  • EDF scheduler                                                │
│  • IPC message passing                                          │
│  • Task management                                              │
│  • 100% testable in simulation                                  │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  Phase 2: Communication (ESP32 + Wokwi)                        │
│  ═══════════════════════════════════════                        │
│  • WiFi driver                                                  │
│  • MQTT/cloud connectivity                                      │
│  • OTA updates                                                  │
│  • Full WiFi simulation available                               │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  Phase 3: Power Control (C2000 + CCS)                          │
│  ════════════════════════════════════                           │
│  • HRPWM generation                                             │
│  • ADC sampling                                                 │
│  • Control loops                                                │
│  • Use CCS simulator for timing                                 │
│                                                                 │
│                          ↓                                      │
│                                                                 │
│  Phase 4: Safety (AURIX + Real HW)                             │
│  ══════════════════════════════════                             │
│  • Lockstep verification                                        │
│  • Watchdog integration                                         │
│  • ASIL-D compliance                                            │
│  • Requires real hardware                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Tool Installation Summary

### Windows

```powershell
# Renode (STM32, ESP32)
choco install renode

# ARM GCC (STM32)
choco install gcc-arm-embedded

# ESP-IDF (ESP32)
# Download from: https://dl.espressif.com/dl/esp-idf/

# TI CCS (C2000)
# Download from: https://www.ti.com/tool/CCSTUDIO

# Infineon ADS (AURIX)
# Download from: https://www.infineon.com/aurix-development-studio
```

### Linux

```bash
# Renode
wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
sudo dpkg -i renode_1.14.0_amd64.deb

# ARM GCC
sudo apt install gcc-arm-none-eabi

# ESP-IDF
git clone --recursive https://github.com/espressif/esp-idf.git
cd esp-idf && ./install.sh esp32s3

# TI CCS
# Download .run installer from TI website

# Infineon ADS
# Download from Infineon website (Linux version available)
```

---

## 7. Quick Reference

### Start STM32 Simulation
```bash
renode renode/jezgro-stm32.resc
(monitor) start
```

### Start ESP32 Simulation (Limited)
```bash
renode renode/jezgro-esp32.resc
(monitor) start
```

### ESP32 WiFi Testing (Wokwi)
```
1. Go to https://wokwi.com
2. New Project → ESP32-S3
3. Upload firmware
4. Run
```

### C2000 Simulation (CCS)
```
1. Open Code Composer Studio
2. Import project
3. Debug Configuration → Simulator
4. Build & Debug
```

### AURIX Development
```
1. Open AURIX Development Studio
2. Create project for TC375
3. Use DAS for debugging
4. Must use real hardware for safety testing
```

---

## Sources

- [Renode Supported Boards](https://renode.readthedocs.io/en/latest/introduction/supported-boards.html)
- [Renode TriCore Request](https://github.com/renode/renode/issues/749)
- [Wokwi ESP32 Simulator](https://wokwi.com)
- [TI Code Composer Studio](https://www.ti.com/tool/CCSTUDIO)
- [Infineon AURIX Development Studio](https://www.infineon.com/aurix-development-studio)
