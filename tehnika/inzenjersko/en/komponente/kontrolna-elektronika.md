# Control Electronics for EV Chargers

## 1. Control System Architecture

### 1.1 Control Hierarchy

```
EV Charger Control System Structure:

┌─────────────────────────────────────────────────────────────────┐
│                    LEVEL 3: SYSTEM                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            MAIN CONTROLLER (SBC/IPC)                     │   │
│  │  - HMI interface                                         │   │
│  │  - OCPP communication                                    │   │
│  │  - User management                                       │   │
│  │  - Billing/metering                                      │   │
│  │  - Diagnostics                                           │   │
│  │  Linux/RTOS                                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │ CAN/Ethernet                     │
├──────────────────────────────┼──────────────────────────────────┤
│                    LEVEL 2: SUPERVISION                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            POWER MODULE CONTROLLER (DSP/MCU)             │   │
│  │  - Sequencing                                            │   │
│  │  - Fault handling                                        │   │
│  │  - ISO 15118 / CHAdeMO                                   │   │
│  │  - Thermal management                                    │   │
│  │  - Load sharing (multi-module)                           │   │
│  │  Real-time OS or Bare-metal                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │ SPI/CAN                          │
├──────────────────────────────┼──────────────────────────────────┤
│                    LEVEL 1: REAL-TIME                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │  PFC Control   │  │  DC/DC Control │  │  Safety MCU    │    │
│  │  (DSP/FPGA)    │  │  (DSP/FPGA)    │  │  (Dedicated)   │    │
│  │  - PWM gen     │  │  - LLC control │  │  - Watchdog    │    │
│  │  - Current loop│  │  - Sync rect   │  │  - Fault mon   │    │
│  │  - PLL/sync    │  │  - Soft start  │  │  - Shutdown    │    │
│  │  <10μs loop    │  │  <5μs loop     │  │  <1μs reaction │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Real-Time Control Requirements

```
Control Loops and Timing:

┌─────────────────────────────────────────────────────────────┐
│ Control Loop        │ Speed      │ Latency   │ Processor   │
├─────────────────────┼────────────┼───────────┼─────────────┤
│ Current Control     │ 50-200 kHz │ <5 μs     │ DSP/FPGA    │
│ Voltage Control     │ 10-50 kHz  │ <20 μs    │ DSP/MCU     │
│ PFC (PLL/Phase)     │ 10-20 kHz  │ <50 μs    │ DSP         │
│ LLC Frequency Ctrl  │ 100-500 kHz│ <2 μs     │ FPGA        │
│ Thermal Control     │ 1-10 Hz    │ <100 ms   │ MCU         │
│ Communication       │ 1-1000 Hz  │ <10 ms    │ MCU/SBC     │
│ Safety Monitoring   │ >100 kHz   │ <1 μs     │ FPGA/ASIC   │
└─────────────────────────────────────────────────────────────┘

Bandwidth Requirements:
- Current loop: BW > f_sw / 10 = 65kHz / 10 = 6.5 kHz
- Voltage loop: BW > 1/10 × Current BW = 650 Hz
- PLL bandwidth: 50-200 Hz (for grid sync)
```

## 2. Microcontrollers (MCU)

### 2.1 MCU Requirements for EV Charger

```
Minimum requirements:

┌────────────────────────────────────────────────────┐
│ Parameter           │ Minimum      │ Recommended  │
├─────────────────────┼──────────────┼──────────────┤
│ CPU frequency       │ 120 MHz      │ 200+ MHz     │
│ Flash memory        │ 512 KB       │ 1-2 MB       │
│ RAM                 │ 128 KB       │ 256+ KB      │
│ PWM channels        │ 6            │ 12+          │
│ PWM resolution      │ 12-bit       │ 16-bit       │
│ ADC channels        │ 8            │ 16+          │
│ ADC speed           │ 1 MSPS       │ 5+ MSPS      │
│ ADC resolution      │ 12-bit       │ 16-bit       │
│ CAN interface       │ 1            │ 2+           │
│ SPI/I2C             │ 2            │ 4+           │
│ Timer channels      │ 8            │ 16+          │
│ Math accelerator    │ Optional     │ FPU/CORDIC   │
│ Operating temp      │ -40 to 85°C  │ -40 to 105°C │
└────────────────────────────────────────────────────┘
```

### 2.2 Recommended MCUs

#### Texas Instruments C2000 Series

```
TMS320F28379D (Dual-Core):

┌─────────────────────────────────────────────────────────────┐
│                    TMS320F28379D                            │
├─────────────────────────────────────────────────────────────┤
│ CPU: 2× C28x cores @ 200 MHz                                │
│ CLA: 2× Control Law Accelerators                            │
│ Flash: 1 MB                                                 │
│ RAM: 204 KB                                                 │
│ PWM: 24 channels (12 ePWM modules)                          │
│ ADC: 4× 16-bit, 3.5 MSPS each                              │
│ DAC: 3× 12-bit                                              │
│ CAN: 2× CAN 2.0B                                            │
│ Comparators: 8× with DAC reference                          │
│ FPU: Yes (TMU - Trigonometric Math Unit)                    │
│                                                             │
│ Package: 176-pin HLQFP / 337-pin BGA                        │
│ Price: ~$25-30 (qty 100)                                    │
│                                                             │
│ Specifically for power electronics:                         │
│ - High-resolution PWM (150 ps)                              │
│ - Synchronized ADC trigger                                  │
│ - Hardware trip zones                                       │
│ - Dead-band generators                                      │
└─────────────────────────────────────────────────────────────┘

Application in EV charger:
- CPU1: PFC control + supervision
- CPU2: DC/DC control
- CLA1: Fast current loop PFC
- CLA2: Fast current loop DC/DC

TMS320F280049C (Single-Core, lower cost):
- 1× C28x @ 100 MHz
- 256 KB Flash, 100 KB RAM
- 16 PWM, 4 ADC (12-bit)
- Price: ~$8-10 (qty 100)
- For lower power or as auxiliary MCU
```

#### STMicroelectronics STM32 Series

```
STM32G474RE (Motor Control optimized):

┌─────────────────────────────────────────────────────────────┐
│                    STM32G474RE                              │
├─────────────────────────────────────────────────────────────┤
│ CPU: ARM Cortex-M4F @ 170 MHz                               │
│ Flash: 512 KB                                               │
│ RAM: 128 KB                                                 │
│ PWM: 22 channels (advanced timers)                          │
│ ADC: 5× 12-bit, 4 MSPS                                      │
│ DAC: 4× 12-bit                                              │
│ CAN-FD: 3×                                                  │
│ CORDIC: Hardware trig accelerator                           │
│ FMAC: Filter Math Accelerator                               │
│                                                             │
│ Package: LQFP64/100                                         │
│ Price: ~$8-12 (qty 100)                                     │
│                                                             │
│ Advantages:                                                 │
│ - Large ST ecosystem                                        │
│ - Motor control libraries                                   │
│ - STM32CubeMX for configuration                            │
│ - Automotive grade variants (STM32G4A)                      │
└─────────────────────────────────────────────────────────────┘

STM32H743 (High Performance):
- ARM Cortex-M7 @ 480 MHz
- 2 MB Flash, 1 MB RAM
- Dual ADC, 16-bit
- Ethernet, USB, crypto
- For system controller with HMI
- Price: ~$15-20 (qty 100)
```

#### Infineon XMC/AURIX

```
XMC4800 (Industrial):

┌─────────────────────────────────────────────────────────────┐
│                    XMC4800-F144                             │
├─────────────────────────────────────────────────────────────┤
│ CPU: ARM Cortex-M4F @ 144 MHz                               │
│ Flash: 2 MB                                                 │
│ RAM: 352 KB                                                 │
│ CCU8: 4× capture/compare units (32 PWM)                     │
│ VADC: 8× 12-bit, 1.5 MSPS                                   │
│ DAC: 2× 12-bit                                              │
│ CAN: 3× CAN nodes                                           │
│ Ethernet: 10/100 Mbps                                       │
│ EtherCAT: Slave interface                                   │
│                                                             │
│ Package: LQFP144                                            │
│ Price: ~$12-15 (qty 100)                                    │
│                                                             │
│ Special features:                                           │
│ - POSIF (Position Interface) for encoders                  │
│ - Delta-Sigma demodulator                                   │
│ - Industrial protocols built-in                             │
└─────────────────────────────────────────────────────────────┘

AURIX TC3xx (Automotive Safety):
- Multi-core (up to 6 cores)
- ASIL-D capable
- Hardware security module
- For safety-critical functions
- Price: ~$30-50 (qty 100)
```

### 2.3 Dual-Core Architecture

```
Recommended Dual-Core Configuration:

┌─────────────────────────────────────────────────────────────┐
│                    DUAL-CORE SETUP                          │
├──────────────────────────┬──────────────────────────────────┤
│        CORE 1            │           CORE 2                 │
│   (Real-time Control)    │   (Communication/Supervision)    │
├──────────────────────────┼──────────────────────────────────┤
│ - PWM generation         │ - CAN/Ethernet protocols         │
│ - Current/Voltage loops  │ - ISO 15118 state machine        │
│ - ADC sampling           │ - OCPP client                    │
│ - PLL/Grid sync          │ - Thermal management             │
│ - Fault detection        │ - Logging/Diagnostics            │
│ - Trip handling          │ - HMI communication              │
├──────────────────────────┼──────────────────────────────────┤
│ Bare-metal or            │ RTOS (FreeRTOS, Zephyr)          │
│ minimal RTOS             │                                  │
├──────────────────────────┼──────────────────────────────────┤
│ Cycle time: 10-50 μs     │ Cycle time: 1-10 ms              │
└──────────────────────────┴──────────────────────────────────┘

Inter-Core Communication:
- Shared RAM region
- Hardware mailbox
- IPC (Inter-Processor Communication)
- Message queues
```

## 3. Digital Signal Processors (DSP)

### 3.1 DSP Advantages for Power Control

```
DSP vs MCU for Power Electronics:

┌────────────────────────────────────────────────────────────┐
│ Operation              │ MCU (ARM)    │ DSP (C2000)        │
├────────────────────────┼──────────────┼────────────────────┤
│ MAC (Multiply-Accumul.)│ 1-2 cycles   │ 1 cycle            │
│ Division               │ 12-20 cycles │ Hardware (4 cycles)│
│ sin/cos                │ ~100 cycles  │ 1 cycle (TMU)      │
│ sqrt                   │ ~50 cycles   │ 4 cycles           │
│ Park/Clarke transform  │ ~30 cycles   │ 5-10 cycles        │
│ PI regulator           │ ~20 cycles   │ 5 cycles           │
│ PWM sync ADC           │ Software     │ Hardware           │
│ Trip zone              │ Software     │ Hardware (<50ns)   │
└────────────────────────────────────────────────────────────┘

Control Law Accelerator (CLA):
- Independent core for control algorithms
- Runs in parallel with main CPU
- Direct access to ADC and PWM
- Ideal for current loop

CLA performance example:
- Current loop @ 100 kHz: ~50 cycles = 500 ns
- Leaves 9.5 μs for CPU tasks
```

### 3.2 DSP Control Loop Implementation

```
PFC Current Control on C2000:

// ADC triggered by ePWM (hardware sync)
__interrupt void adca1_isr(void)
{
    // Read ADC results (pre-triggered)
    Vac = AdcaResultRegs.ADCRESULT0;  // 1 cycle
    Iac = AdcaResultRegs.ADCRESULT1;  // 1 cycle
    Vdc = AdcbResultRegs.ADCRESULT0;  // 1 cycle

    // Clarke transform (single phase = pass-through)
    Ialpha = Iac;

    // PLL angle from lookup or hardware
    theta = PLL_GetAngle();           // TMU: 1 cycle

    // Current reference from voltage loop
    Iref = Voltage_PI_Output * sin(theta);  // TMU

    // Current error
    Ierror = Iref - Iac;

    // PI Controller (optimized)
    Iout = PI_Run(&currentPI, Ierror);  // 5 cycles

    // Duty cycle calculation
    duty = Iout / Vdc;

    // Update PWM compare
    EPwm1Regs.CMPA.bit.CMPA = duty * PERIOD;

    // Clear interrupt
    AdcaRegs.ADCINTFLGCLR.bit.ADCINT1 = 1;
    PieCtrlRegs.PIEACK.all = PIEACK_GROUP1;
}

// Total execution: ~30 cycles @ 200 MHz = 150 ns
// Leaving >90% CPU for other tasks @ 50 kHz
```

## 4. FPGA for Ultra-Fast Control

### 4.1 When to Use FPGA

```
FPGA Applications in EV Chargers:

1. LLC Frequency Control (>200 kHz switching):
   - Frequency resolution: <100 Hz steps
   - Reaction: <1 μs
   - DSP/MCU cannot be fast enough

2. Synchronous Rectification:
   - Precise ZVS moment measurement
   - Dead-time <50 ns
   - Body diode conduction minimization

3. Multi-Module Interleaving:
   - Phase shift between modules
   - Master-slave synchronization
   - <10 ns jitter

4. High-Speed Fault Protection:
   - Reaction <100 ns
   - Parallel monitoring of all parameters
   - Hardware shutdown

5. Custom Protocols:
   - Proprietary BMS communication
   - Legacy interfaces
```

### 4.2 Recommended FPGAs

```
Intel (Altera) Cyclone Series:

Cyclone 10 LP (10CL025):
┌─────────────────────────────────────────────────────────────┐
│ Logic Elements: 25K                                         │
│ RAM: 66 KB                                                  │
│ PLLs: 4                                                     │
│ I/O: 150                                                    │
│ DSP Blocks: 0 (soft multipliers)                            │
│                                                             │
│ Package: FBGA 256                                           │
│ Price: ~$20-30 (qty 100)                                    │
│                                                             │
│ Application: PWM, fault detection, basic control            │
└─────────────────────────────────────────────────────────────┘

Cyclone V SE (5CSEBA6):
┌─────────────────────────────────────────────────────────────┐
│ Logic Elements: 110K                                        │
│ RAM: 5.5 Mb                                                 │
│ DSP Blocks: 112 (18x18)                                     │
│ HPS: Dual ARM Cortex-A9 @ 925 MHz                          │
│ PCIe, DDR3, Ethernet                                        │
│                                                             │
│ Package: FBGA 672                                           │
│ Price: ~$80-120 (qty 100)                                   │
│                                                             │
│ Application: Full system (FPGA + ARM processor)             │
│              Can replace MCU + FPGA combination             │
└─────────────────────────────────────────────────────────────┘

Xilinx Zynq Series:

Zynq-7020 (XC7Z020):
┌─────────────────────────────────────────────────────────────┐
│ FPGA: 85K logic cells                                       │
│ DSP: 220 slices                                             │
│ RAM: 4.9 Mb                                                 │
│ PS: Dual ARM Cortex-A9 @ 866 MHz                           │
│ Interfaces: GigE, USB, CAN, SPI, I2C...                    │
│                                                             │
│ Package: Various (CLG484 common)                            │
│ Price: ~$100-150 (qty 100)                                  │
│                                                             │
│ Advantages:                                                 │
│ - Large Xilinx ecosystem                                    │
│ - Vivado tools                                              │
│ - Power electronics IP cores available                      │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 FPGA IP for Power Electronics

```
Required IP Blocks:

1. PWM Generator:
   ┌────────────────────────────────────────┐
   │          PWM_GEN IP                    │
   ├────────────────────────────────────────┤
   │ Inputs:                                │
   │   - clk (100-200 MHz)                  │
   │   - duty[15:0]                         │
   │   - dead_time[7:0]                     │
   │   - enable                             │
   │                                        │
   │ Outputs:                               │
   │   - pwm_h                              │
   │   - pwm_l                              │
   │   - adc_trigger                        │
   │                                        │
   │ Features:                              │
   │   - Center-aligned                     │
   │   - Dead-time insertion                │
   │   - Synchronized ADC trigger           │
   │   - Hardware trip input                │
   └────────────────────────────────────────┘

2. Frequency Controller (for LLC):
   ┌────────────────────────────────────────┐
   │        FREQ_CTRL IP                    │
   ├────────────────────────────────────────┤
   │ NCO (Numerically Controlled Oscillator)│
   │                                        │
   │ freq_word[31:0] → phase_acc → output   │
   │                                        │
   │ Resolution: f_clk / 2^32               │
   │ @ 200 MHz: 0.047 Hz resolution!        │
   │                                        │
   │ Rapid frequency changes:               │
   │   New freq_word → immediate effect     │
   └────────────────────────────────────────┘

3. ADC Interface:
   ┌────────────────────────────────────────┐
   │         ADC_IF IP                      │
   ├────────────────────────────────────────┤
   │ Parallel or Serial ADC interface       │
   │ Simultaneous sampling                  │
   │ Data alignment and scaling             │
   │ Averaging/filtering option             │
   │ Trigger synchronization                │
   └────────────────────────────────────────┘

4. Fault Handler:
   ┌────────────────────────────────────────┐
   │         FAULT_HANDLER IP               │
   ├────────────────────────────────────────┤
   │ Inputs: OVP, OCP, OTP (comparator out) │
   │                                        │
   │ Logic:                                 │
   │   - OR all faults                      │
   │   - Disable all PWM (<100 ns)          │
   │   - Latch fault source                 │
   │   - Signal to MCU                      │
   │                                        │
   │ Reset: Software clear after MCU ack    │
   └────────────────────────────────────────┘
```

## 5. Sensors and Measurements

### 5.1 Current Sensors

```
Current Sensor Types:

1. Hall Effect (Open Loop):
   ┌────────────────────────────────────────────────────────┐
   │ Principle: Hall effect in magnetic field of conductor  │
   │                                                        │
   │ Products:                                              │
   │ - LEM HAS 200-S: ±200A, 50 kHz BW, ±1% accuracy       │
   │ - Allegro ACS758: ±50A, 120 kHz BW, ±1.5%             │
   │ - Melexis MLX91220: ±50A, integrated, ±1%             │
   │                                                        │
   │ Advantages: Isolation, simple, inexpensive            │
   │ Disadvantages: Offset drift, limited accuracy         │
   │                                                        │
   │ Price: €5-30 (depending on current)                   │
   └────────────────────────────────────────────────────────┘

2. Hall Effect (Closed Loop / Flux-Null):
   ┌────────────────────────────────────────────────────────┐
   │ Principle: Compensation winding maintains flux null    │
   │                                                        │
   │ Products:                                              │
   │ - LEM LA 200-P: ±200A, 200 kHz BW, ±0.5%              │
   │ - LEM HAH1DR 500-S: ±500A, 100 kHz, ±0.5%             │
   │                                                        │
   │ Advantages: High accuracy, fast                       │
   │ Disadvantages: More expensive, requires ±15V supply   │
   │                                                        │
   │ Price: €30-80                                          │
   └────────────────────────────────────────────────────────┘

3. Shunt + Isolation Amplifier:
   ┌────────────────────────────────────────────────────────┐
   │ Principle: Precision resistor + isolated amplification │
   │                                                        │
   │ Components:                                            │
   │ - Shunt: Isabellenhutte BVR (0.1-1 mΩ, 0.5%)         │
   │ - Amp: TI AMC1311 (isolated), Silicon Labs Si8920     │
   │                                                        │
   │ Advantages: Best accuracy, linearity                  │
   │ Disadvantages: Losses in shunt, thermal drift         │
   │                                                        │
   │ Price: €10-20 (shunt + amp)                           │
   │                                                        │
   │ Shunt calculation:                                     │
   │ R = V_max / I_max = 100mV / 300A = 0.33 mΩ            │
   │ P = I² × R = 300² × 0.00033 = 30 W (!!)               │
   │ → Needs cooling or lower R                            │
   └────────────────────────────────────────────────────────┘

4. Rogowski Coil (for di/dt):
   ┌────────────────────────────────────────────────────────┐
   │ Principle: Induced voltage proportional to di/dt      │
   │                                                        │
   │ Products:                                              │
   │ - PEM CWT Mini: 30A-6kA peak, 20 MHz BW               │
   │ - LEM PRiME: Integrated solution                      │
   │                                                        │
   │ Advantages: No saturation, very fast                  │
   │ Disadvantages: Requires integrator for I              │
   │                                                        │
   │ Application: Fault detection, switching analysis      │
   └────────────────────────────────────────────────────────┘

Recommendation for 150 kW DC charger:
- AC side (PFC): Closed-loop Hall (LEM LA 200-P)
- DC side: Shunt + isolated amp (for billing accuracy)
- Fault: Open-loop Hall (fast detection)
```

### 5.2 Voltage Sensors

```
1. Resistor Divider + Isolation:
   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │    Vhv ──┬──[R1 = 1MΩ]──┬──[R2 = 10kΩ]──┬── GND       │
   │          │              │               │               │
   │          │         Vmeas│               │               │
   │          │    (0-3.3V)  │               │               │
   │          │              │               │               │
   │          │         ┌────┴────┐          │               │
   │          │         │Isolation│          │               │
   │          │         │   Amp   │          │               │
   │          │         └────┬────┘          │               │
   │          │              │               │               │
   │          │         To ADC               │               │
   │                                                         │
   │ For Vhv = 1000V:                                        │
   │ Vmeas = 1000 × 10k / (1M + 10k) = 9.9V                 │
   │ → Need another divider or attenuator                   │
   │                                                         │
   │ Isolation: Si8920, AMC1311, ACPL-C87                   │
   └─────────────────────────────────────────────────────────┘

2. Hall Effect Voltage Sensor:
   ┌─────────────────────────────────────────────────────────┐
   │ LEM LV 25-P:                                            │
   │ - Nominal: 500V                                         │
   │ - Accuracy: ±0.9%                                       │
   │ - BW: 25 kHz                                            │
   │ - Output: Current (mA) → Shunt → Voltage                │
   │                                                         │
   │ Advantages: Complete isolation                          │
   │ Disadvantages: Larger, more expensive                   │
   │                                                         │
   │ Price: €25-40                                           │
   └─────────────────────────────────────────────────────────┘

Recommendation for charger:
- AC input: Resistor divider + AMC1311 (cheap, precise)
- DC Link: LEM LV 25-P (isolation critical)
- Output (billing): High precision isolated (0.5% accuracy)
```

### 5.3 Temperature Sensors

```
Temperature measurement locations:

┌─────────────────────────────────────────────────────────────┐
│                    POWER MODULE                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │    ★T1        ★T2        ★T3                       │   │ NTC in
│  │   (IGBT1)    (IGBT2)    (Diode)                    │   │ module
│  │                                                     │   │
│  │    Cold Plate: ★T4                                  │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Coolant: ★T5 (inlet)  ★T6 (outlet)                        │
│                                                             │
│  Ambient: ★T7                                               │
│                                                             │
│  Transformer: ★T8                                           │
│                                                             │
│  DC Link Caps: ★T9                                          │
└─────────────────────────────────────────────────────────────┘

Sensor types:

1. NTC Thermistor (most common):
   - Epcos B57861S (10kΩ @ 25°C)
   - Vishay NTCLE100 series
   - Price: €0.5-2

   R(T) = R25 × exp(B × (1/T - 1/298.15))

   For B = 3988K, R25 = 10kΩ:
   @ 100°C: R = 10k × exp(3988 × (1/373 - 1/298)) = 680Ω

2. PT100/PT1000 (more precise):
   - More linear than NTC
   - R = R0 × (1 + α×T)
   - α = 0.00385 /°C
   - Price: €5-15

3. Digital (I2C/SPI):
   - TI TMP117: ±0.1°C accuracy
   - Maxim MAX31865: PT100 interface
   - Price: €3-10
   - Advantage: No calibration, simple

Recommendation: NTC for speed, PT100 for precision
```

### 5.4 ADC Selection

```
ADC Requirements for Power Control:

┌─────────────────────────────────────────────────────────────┐
│ Parameter          │ Current Sense │ Voltage Sense │ Temp  │
├────────────────────┼───────────────┼───────────────┼───────┤
│ Resolution         │ 12-16 bit     │ 12 bit        │ 10 bit│
│ Speed              │ 1-5 MSPS      │ 500 kSPS      │ 10 SPS│
│ Latency            │ <1 μs         │ <5 μs         │ N/A   │
│ INL/DNL            │ <2 LSB        │ <2 LSB        │ <4 LSB│
│ SINAD              │ >70 dB        │ >65 dB        │ N/A   │
│ Simultaneous       │ Yes           │ Preferred     │ No    │
└─────────────────────────────────────────────────────────────┘

External ADC options (if MCU ADC not sufficient):

1. Texas Instruments ADS131M08:
   - 8 channels, simultaneous
   - 24-bit, 32 kSPS per channel
   - Delta-Sigma
   - SPI interface
   - Price: ~$15

2. Analog Devices AD7606:
   - 8 channels, simultaneous
   - 16-bit, 200 kSPS
   - SAR
   - Parallel/SPI interface
   - Price: ~$30

3. Texas Instruments ADS8688:
   - 8 channels, multiplexed
   - 16-bit, 500 kSPS
   - SAR
   - SPI interface
   - Price: ~$12

Internal MCU ADC (STM32G4, C2000):
- Usually sufficient for most measurements
- Simultaneous sample-and-hold
- Hardware triggering from PWM timer
- Free (included in MCU)
```

## 6. Protection Electronics

### 6.1 Hardware Comparators

```
Fast Protection without MCU Latency:

        ┌──────────────────────────────────────────────────┐
        │              COMPARATOR CIRCUIT                  │
        │                                                  │
        │    I_sense ──┬──────────────┐                   │
        │              │              │                    │
        │         ┌────┴────┐    ┌────┴────┐              │
        │         │   +     │    │   +     │              │
        │ Vref ───┤   CMP1  ├────┤   CMP2  ├──── FAULT    │
        │  OCP    │   -     │    │   -     │     OUT      │
        │         └─────────┘    └─────────┘              │
        │              │              │                    │
        │         ┌────┴────┐    ┌────┴────┐              │
        │ Vref ───┤   +     │    │   +     │              │
        │  OVP    │   CMP3  ├────┤   AND   │              │
        │         │   -     │    │         │              │
        │         └─────────┘    └─────────┘              │
        │                                                  │
        │    To Gate Driver FAULT input (<50 ns latency)  │
        └──────────────────────────────────────────────────┘

Components:

1. TI TLV3501 (Ultra-fast):
   - Propagation delay: 4.5 ns
   - Rail-to-rail input/output
   - Push-pull output
   - Price: ~$2

2. Analog Devices ADCMP601:
   - Propagation delay: 3.5 ns
   - LVDS output option
   - Price: ~$3

3. STM32 Internal Comparators:
   - Propagation delay: ~30 ns
   - Direct PWM fault input
   - Free (in MCU)

Threshold configuration (DAC or R-divider):
OCP: 120% × I_nominal
OVP: 110% × V_nominal
OTP: T_max - 10°C margin
```

### 6.2 Watchdog Timer

```
Multi-Level Watchdog Strategy:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             LEVEL 1: MCU Internal WDT                 │ │
│  │                                                       │ │
│  │  - Window watchdog (must be kicked within window)    │ │
│  │  - Timeout: 10-100 ms                                │ │
│  │  - Reset: MCU soft reset                             │ │
│  │  - Used for firmware crash detection                 │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             LEVEL 2: External WDT                     │ │
│  │                                                       │ │
│  │  Dedicated IC: TI TPS3823, Maxim MAX6369              │ │
│  │  - Independent of MCU                                 │ │
│  │  - Timeout: 100 ms - 2 s                             │ │
│  │  - Output: Reset MCU OR disable power stage          │ │
│  │  - Used for MCU fault (hard lock)                    │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │             LEVEL 3: PWM Activity Monitor             │ │
│  │                                                       │ │
│  │  Custom circuit or Safety MCU                         │ │
│  │  - Monitors PWM switching                            │ │
│  │  - Expects toggle every T_sw                         │ │
│  │  - If no toggle for 2× T_sw → shutdown               │ │
│  │  - Fastest protection against control failure        │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

External Watchdog ICs:

TI TPS3823-33:
- Supply: 3.3V
- Timeout: 200 ms nominal
- Push-pull reset output
- Price: ~$0.5

Maxim MAX6369:
- Programmable timeout (1ms - 60s)
- SPI timeout select
- Manual reset input
- Price: ~$2
```

### 6.3 Isolation

```
Isolation Requirements:

┌─────────────────────────────────────────────────────────────┐
│ Interface              │ Voltage    │ Isolation Type       │
├────────────────────────┼────────────┼──────────────────────┤
│ Gate driver            │ 1200V      │ Capacitive/Optical   │
│ Current sense (HV)     │ 1200V      │ Hall/Transformer     │
│ Voltage sense (DC Link)│ 1000V      │ Optical/Capacitive   │
│ CAN to power ground    │ 500V       │ Capacitive           │
│ USB/Ethernet           │ 1500V      │ Transformer          │
│ User interface         │ 2500V      │ Optical (safety)     │
└─────────────────────────────────────────────────────────────┘

Digital Isolators:

Silicon Labs Si86xx Series:
- 1 kV/μs CMTI
- Up to 150 Mbps data rate
- Multiple channels per package
- Price: $2-5 per channel

Texas Instruments ISO7741:
- 100 kV/μs CMTI
- 100 Mbps
- Reinforced isolation
- Price: ~$4 (quad channel)

Analog Devices ADuM1xx:
- iCoupler technology
- Various channel configs
- Price: $2-6
```

## 7. PCB Design for Control Board

### 7.1 Layer Stackup

```
Recommended 6-Layer Stackup:

    ┌─────────────────────────────────────────────────────┐
L1  │ Signal (MCU, high-speed traces)        │ 35μm Cu   │
    ├─────────────────────────────────────────────────────┤
    │ Prepreg 0.2mm                                       │
    ├─────────────────────────────────────────────────────┤
L2  │ GND Plane (solid)                      │ 35μm Cu   │
    ├─────────────────────────────────────────────────────┤
    │ Core 0.4mm                                          │
    ├─────────────────────────────────────────────────────┤
L3  │ Signal (ADC, analog, low-speed digital)│ 35μm Cu   │
    ├─────────────────────────────────────────────────────┤
    │ Prepreg 0.2mm                                       │
    ├─────────────────────────────────────────────────────┤
L4  │ Power (3.3V, 5V, 15V islands)          │ 35μm Cu   │
    ├─────────────────────────────────────────────────────┤
    │ Core 0.4mm                                          │
    ├─────────────────────────────────────────────────────┤
L5  │ GND Plane (solid)                      │ 35μm Cu   │
    ├─────────────────────────────────────────────────────┤
    │ Prepreg 0.2mm                                       │
    ├─────────────────────────────────────────────────────┤
L6  │ Signal (connectors, power)             │ 35μm Cu   │
    └─────────────────────────────────────────────────────┘

Total thickness: ~1.6 mm

Zone Separation:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐       ┌──────────────────┐          │
│  │                  │       │                  │           │
│  │   LOW VOLTAGE    │ ISO   │   HIGH VOLTAGE   │          │
│  │   CONTROL        │ GAP   │   INTERFACE      │          │
│  │   (MCU, comm)    │ 3mm   │   (Gate drv)     │          │
│  │                  │       │                  │           │
│  └──────────────────┘       └──────────────────┘          │
│                                                             │
│         │                            │                      │
│         └────── Isolation Barrier ───┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Critical Routes

```
Routing Priorities:

1. ADC Input Traces:
   - Differential routing where possible
   - Guard rings around analog
   - Keep away from switching signals
   - Via stitching for return current

2. PWM Output:
   - Short, low inductance
   - Controlled impedance if long
   - Series resistor at source for damping

3. Clock Distribution:
   - Star topology from oscillator
   - Matched lengths if needed
   - Series termination

4. Power Distribution:
   ┌─────────────────────────────────────────────────────┐
   │                                                     │
   │    VIN ──┬──[REG]──┬──────┬──────┬──────┐         │
   │          │    5V   │      │      │      │         │
   │         ═╪═       ═╪═    ═╪═    ═╪═    ═╪═        │
   │   Bulk   │   At   │      │      │               │
   │   10μF   │  Reg   │ MCU  │ ADC  │ Other         │
   │          │  22μF  │100nF │100nF │ 100nF         │
   │                                                   │
   │    Rule: One 100nF per power pin, <3mm distance  │
   └─────────────────────────────────────────────────────┘
```

## 8. Bill of Materials - Control Electronics

```
┌─────────────────────────────────────────────────────────────────┐
│ PROCESSORS AND LOGIC                                            │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Component                    │ Qty │ Unit Price │    Total      │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ TMS320F28379D (Main DSP)     │  1  │    €30     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ STM32H743 (System controller)│  1  │    €18     │     €18       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Cyclone 10 LP FPGA (optional)│  1  │    €25     │     €25       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Safety MCU (TMS320F28069)    │  1  │    €12     │     €12       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL PROCESSORS                             │     €85       │
└─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SENSORS                                                         │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ LEM LA 200-P (Current, AC)   │  3  │    €45     │    €135       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ LEM LV 25-P (Voltage, DC)    │  2  │    €30     │     €60       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Shunt 0.1mΩ + AMC1311 (DC out)│  2  │    €15     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ NTC 10k (Temperature)        │ 10  │    €1      │     €10       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Resistor dividers (HV sense) │ set │    €10     │     €10       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL SENSORS                                │    €245       │
└─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PROTECTION AND ISOLATION                                        │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ TLV3501 (Comparator)         │  8  │    €2      │     €16       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ ISO7741 (Digital Isolator)   │  4  │    €4      │     €16       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ TPS3823 (Watchdog)           │  2  │    €1      │     €2        │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ TVS/ESD protection           │ set │    €20     │     €20       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL PROTECTION                             │     €54       │
└─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ POWER SUPPLY                                                    │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ AC/DC 24V/50W (Aux supply)   │  1  │    €25     │     €25       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC/DC 24V→5V/3A              │  1  │    €8      │     €8        │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC/DC 24V→3.3V/2A            │  1  │    €6      │     €6        │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC/DC 24V→±15V (isolated)    │  4  │    €8      │     €32       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ LDO, references              │ set │    €15     │     €15       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL POWER SUPPLY                           │     €86       │
└─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ OTHER                                                           │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Crystal/Oscillators          │ set │    €10     │     €10       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Connectors (CAN, SPI, PWM)   │ set │    €30     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Decoupling capacitors        │ set │    €20     │     €20       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ PCB (6-layer, 200×150mm)     │  1  │    €50     │     €50       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ SUBTOTAL OTHER                                  │    €110       │
└─────────────────────────────────────────────────┴───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TOTAL CONTROL ELECTRONICS                       │    €580       │
└─────────────────────────────────────────────────┴───────────────┘
```

## 9. Conclusions and Recommendations

```
Control Electronics Recommendations:

1. Processor Selection:
   ├── Real-time control: TI C2000 (F28379D or F280049)
   ├── System/Communication: STM32H7 or equivalent STM32G4
   ├── Safety: Dedicated MCU with lockstep (AURIX, redundant)
   └── FPGA: Optional for LLC >200kHz or custom protocols

2. Sensors:
   ├── Current: Closed-loop Hall for accuracy, Open-loop for speed
   ├── Voltage: Isolated amplifiers, LEM for DC Link
   └── Temperature: NTC everywhere, PT100 for critical points

3. Protection:
   ├── Hardware comparators for OCP/OVP (<50ns reaction)
   ├── Multi-level watchdog
   └── Isolation on all HV interfaces

4. PCB:
   ├── Minimum 4 layers, recommended 6
   ├── Clear separation of LV/HV zones
   └── Solid ground planes

5. Redundancy:
   ├── Dual ADC for critical measurements
   ├── Cross-check between MCUs
   └── Fail-safe default states
```
