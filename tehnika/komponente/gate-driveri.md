# Gate Driver Design for EV Chargers

## 1. Introduction to Gate Driving

### 1.1 Role of Gate Drivers

```
System Block Diagram:

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MCU/DSP   │────▶│ Gate Driver │────▶│ Power Stage │
│  (3.3V PWM) │     │ (Isolated)  │     │ (IGBT/SiC)  │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │ Functions:│
                    │ - Isolation│
                    │ - Amplific.│
                    │ - Protect. │
                    │ - Timing   │
                    └───────────┘

Why Gate Drivers are Critical:

1. Voltage amplification: 3.3V → ±15V (IGBT) or +15V/-4V (SiC)
2. Current amplification: mA → Amperes (peak gate current)
3. Galvanic isolation: LV control ↔ HV power
4. Protection: Desaturation, UVLO, overcurrent
5. Timing control: Dead-time, soft turn-off
```

### 1.2 Gate Driver Requirements by Technology

| Parameter | Si IGBT | SiC MOSFET | GaN HEMT |
|-----------|---------|------------|----------|
| Vgs(on) | +15V | +15V to +18V | +5V to +6V |
| Vgs(off) | 0V to -8V | -4V to -5V | 0V to -3V |
| Peak Ig | 2-5 A | 5-15 A | 2-5 A |
| dv/dt immunity | 50 kV/μs | 100+ kV/μs | 100+ kV/μs |
| Propagation delay | <500 ns | <100 ns | <50 ns |
| Dead-time | 1-3 μs | 100-500 ns | 50-200 ns |
| Isolation | 1200V | 1500V+ | 650V |

## 2. Gate Driver Topologies

### 2.1 Single-Stage Gate Driver

```
Single-stage gate driver schematic:

            Vcc (+15V)
               │
               │
          ┌────┴────┐
          │   Rg    │
          │  ┌──┴──┐│
          │  │     ││
PWM ──────┼──┤ U1  ├┼────┬──── Gate
          │  │     ││    │
          │  └──┬──┘│   ═╪═ Cgs
          │     │   │    │
          └────┬────┘    │
               │         │
              GND ───────┴──── Source

Components:
- U1: Gate driver IC (e.g., UCC27531)
- Rg: Gate resistor (1-20Ω)
- Cgs: Gate-Source capacitance (internal)

Limitations:
- No isolation
- Only for low-side switching
- Not suitable for high-side
```

### 2.2 Isolated Gate Driver

```
Isolated gate driver with optocoupler:

     ┌─────────────────┬──────────────────────┐
     │   PRIMARY       │      SECONDARY       │
     │                 │                      │
     │    Vcc1         │         Vcc2         │
     │     │           │          │           │
     │ ┌───┴───┐   ┌───┴───┐  ┌───┴───┐      │
     │ │       │   │ ISO   │  │       │      │
PWM ─┼─┤ Input ├───┤ ▓▓▓▓▓ ├──┤Output ├──Rg──┼── Gate
     │ │ Stage │   │Barrier│  │ Stage │      │
     │ └───┬───┘   └───┬───┘  └───┬───┘      │
     │     │           │          │           │
     │    GND1         │         GND2         │
     │                 │                      │
     └─────────────────┴──────────────────────┘
                       │
                   Isolation
                   (2.5-5 kV)

Isolation types:
1. Optocoupler - traditional, slower
2. Capacitive - faster, good CMTI
3. Inductive (transformer) - fastest
4. GMR (Giant Magnetoresistive) - newer
```

### 2.3 Half-Bridge Gate Driver

```
Integrated half-bridge driver:

                     Vboot
                       │
                    ┌──┴──┐
              Dboot │  │  │
         Vcc ──────►┤  │  │ Cboot
                    │  │  │
                    └──┬──┘
                       │
     ┌─────────────────┼────────────────────┐
     │                 │                    │
     │            ┌────┴────┐               │
     │            │  HIGH   │               │
HIN ─┼───────────►│  SIDE   ├───────── HO ──┼── High Gate
     │            │ DRIVER  │               │
     │            └────┬────┘               │
     │                 │                    │
     │                 ├──────────────── VS │ (Switch Node)
     │                 │                    │
     │            ┌────┴────┐               │
     │            │  LOW    │               │
LIN ─┼───────────►│  SIDE   ├───────── LO ──┼── Low Gate
     │            │ DRIVER  │               │
     │            └────┬────┘               │
     │                 │                    │
     │                GND                   │
     └──────────────────────────────────────┘

Bootstrap power supply for High-Side driver:
- Cboot charges when Low-Side is ON
- Dboot prevents discharge back
- Cboot ≥ 10 × Qg (gate charge)
- Refresh needed (cannot run 100% duty cycle)
```

## 3. Commercial Gate Drivers

### 3.1 For IGBT Modules

#### Infineon EiceDRIVER

```
1ED020I12-F2 (Single Channel):
┌─────────────────────────────────────┐
│ Parameter            │ Value        │
├──────────────────────┼──────────────┤
│ Output current       │ ±2 A peak    │
│ Isolation            │ 1200 V       │
│ CMTI                 │ 50 kV/μs     │
│ Propagation delay    │ 100 ns typ   │
│ Pulse width dist.    │ 10 ns        │
│ Vcc range            │ 13-20 V      │
│ Desaturation         │ Yes          │
│ UVLO                 │ Yes          │
│ Soft turn-off        │ Yes          │
│ Package              │ DSO-16       │
│ Price                │ ~€8          │
└─────────────────────────────────────┘

2ED020I12-F2 (Dual Channel for Half-Bridge):
- Same characteristics
- Integrated dead-time control
- Interlock function
```

#### SKYPER Prime (Semikron)

```
SKYPER 32PRO R:
┌─────────────────────────────────────┐
│ Professional IGBT driver            │
├─────────────────────────────────────┤
│ Output current: ±15 A peak          │
│ Isolation: 2500 Vrms / 1 min        │
│ CMTI: 50 kV/μs                      │
│ Protections:                        │
│   - VCE desaturation monitoring     │
│   - Soft shutdown                   │
│   - Active clamping option          │
│   - UVLO with hysteresis            │
│ Power supply: ±15V, isolated DC/DC  │
│ Price: ~€80                         │
└─────────────────────────────────────┘

Application: Industrial IGBT modules
             FF-series, SEMITRANS, etc.
```

### 3.2 For SiC MOSFET

#### Wolfspeed CGD Series

```
CGD12HBXMP (for XM3 modules):
┌─────────────────────────────────────┐
│ Optimized for SiC MOSFET            │
├─────────────────────────────────────┤
│ Output current: ±10 A peak          │
│ Vgs output: +15V / -4V              │
│ Isolation: 2.5 kV                   │
│ CMTI: 100 kV/μs                     │
│ Propagation delay: 80 ns            │
│ Rise/Fall time: 8 ns                │
│                                     │
│ SiC-specific features:              │
│   - Two-stage turn-off              │
│   - Active Miller clamp             │
│   - Desaturation < 1 μs response    │
│   - Soft turn-off for short circuit │
│                                     │
│ Integrated DC/DC converter          │
│ Price: ~€120                        │
└─────────────────────────────────────┘
```

#### Silicon Labs Si828x

```
Si8285 (Dual Isolated):
┌─────────────────────────────────────┐
│ Parameter            │ Value        │
├──────────────────────┼──────────────┤
│ Output current       │ 4 A source/sink│
│ CMTI                 │ 200 kV/μs    │
│ Propagation delay    │ 24 ns typ    │
│ Jitter               │ 0.3 ns       │
│ Isolation            │ 5 kV         │
│ Undervoltage lockout │ Configurable │
│ Package              │ SOIC-16 WB   │
│ Price                │ ~€12         │
└─────────────────────────────────────┘

Advantages for SiC:
- Ultra-high CMTI (200 kV/μs)
- Very low propagation delay
- Low jitter for precise paralleling
```

#### Texas Instruments UCC2152x

```
UCC21520 (4A/6A versions):
┌─────────────────────────────────────┐
│ Dual-channel with isolation         │
├─────────────────────────────────────┤
│ Peak source current: 4A / 6A        │
│ Peak sink current: 6A / 6A          │
│ CMTI: 100 kV/μs                     │
│ Propagation delay: 19 ns typ        │
│ Delay matching: 2 ns                │
│ Input filter: 5 ns programmable     │
│ UVLO threshold: Selectable          │
│ Split outputs: Yes (for Rg(on)/off) │
│ Package: SOIC-16                    │
│ Price: ~€5-6                        │
└─────────────────────────────────────┘

UCC21750 (Single for SiC):
- Integrated isolated power
- Active Miller clamp
- Two-level turn-off
- DESAT < 0.5 μs response
```

#### Power Integrations SCALE-2

```
2SP0115T2Ax-FF450R12ME4:
┌─────────────────────────────────────┐
│ Plug-and-play for Infineon modules  │
├─────────────────────────────────────┤
│ Complete solution:                  │
│   - Gate driver × 2 channels        │
│   - Isolated power supply           │
│   - Fiber optic interface option    │
│   - Configurable Rg                 │
│                                     │
│ Features:                           │
│   - SCALE-2 chipset                 │
│   - Advanced Active Clamping (AAC)  │
│   - Short circuit type I and II     │
│   - Soft turn-off                   │
│   - Status feedback                 │
│                                     │
│ Price: ~€150                        │
└─────────────────────────────────────┘
```

### 3.3 For GaN

```
Texas Instruments LMG1210:
┌─────────────────────────────────────┐
│ Half-bridge GaN FET driver          │
├─────────────────────────────────────┤
│ Vout: 5.25V                         │
│ Source current: 1.5A                │
│ Sink current: 5A (asymmetric)       │
│ Propagation delay: 6.2 ns           │
│ Dead-time: 4 ns min                 │
│ Bootstrap: 100V max                 │
│ Package: QFN-16                     │
│ Price: ~€4                          │
└─────────────────────────────────────┘

Note: GaN requires different approach
- Lower gate voltage (5-6V)
- Faster switching (ns)
- Stricter layout requirements
```

## 4. Gate Drive Circuit Design

### 4.1 Gate Resistor Selection

```
Gate Resistor Function:

1. dv/dt and di/dt control
2. Oscillation damping (ringing)
3. EMI control
4. Balancing losses (turn-on vs turn-off)

Calculation:

dv/dt = Ig / (Cgd + Cds)
di/dt = (Vgs - Vth) × gm / Ciss

For desired dv/dt of 10 V/ns with Cgd = 50 pF:
Ig = dv/dt × Cgd = 10 × 50 = 500 mA

For Vgs = 15V, Vth = 3V:
Rg(on) = (Vdrv - Vgs_miller) / Ig
Rg(on) = (15 - 10) / 0.5 = 10Ω

Typical values:
┌───────────────┬─────────────┬─────────────┐
│ Technology    │ Rg(on)      │ Rg(off)     │
├───────────────┼─────────────┼─────────────┤
│ IGBT          │ 2-10 Ω      │ 2-5 Ω       │
│ SiC MOSFET    │ 1-5 Ω       │ 1-3 Ω       │
│ GaN           │ 0-2 Ω       │ 0-2 Ω       │
└───────────────┴─────────────┴─────────────┘

Separate Rg for ON/OFF (split output):

        ┌────────┐
        │  Gate  │
Drv+───►│ Driver ├─┬─►Rg(on)──┬── GATE
        │        │ │          │
        └────────┘ └─►Rg(off)─┤
                       │      │
                      ─┴─ D   │
                       ▲      │
                       └──────┘

Advantage: Independent control of turn-on and turn-off
```

### 4.2 Negative Bias for SiC

```
Why negative Vgs(off) for SiC:

Problem: Parasitic turn-on
         (Miller turn-on)

             Cgd
        ┌────┤├────┐
        │          │
       ─┴─        ─┴─
Gate ──┤  │Cgs   ┤  │ Cds
       ─┬─        ─┬─
        │          │
        └────┬─────┘
             │
           Source

When high-side turns on:
- dVds/dt on low-side induces current
- Current through Cgd raises Vgs
- If Vgs > Vth → parasitic turn-on!

Solution: Negative Vgs(off)

IGBT: Vgs(off) = 0V to -8V
      (Vth = 5-7V, sufficient margin)

SiC:  Vgs(off) = -4V to -5V
      (Vth = 2-4V, smaller margin!)

Negative bias implementation:

     +15V ──┬──────────────────┐
            │                  │
           ═╪═ C1              │
            │                  │
     ───────┼──────────────────┼─── Gate
            │                  │
            │    ┌────────┐    │
            └────┤ Driver ├────┘
                 │   IC   │
            ┌────┤        ├────┐
            │    └────────┘    │
           ═╪═ C2              │
            │                  │
     -4V ───┴──────────────────┘

Recommended voltages:
- Infineon SiC: +18V / -3V
- Wolfspeed: +15V / -4V
- ROHM: +18V / -5V

WARNING: Check max Vgs in datasheet!
         Typically Vgs(max) = +22V / -6V
```

### 4.3 Active Miller Clamp

```
Problem: Miller plateau oscillations

During Miller plateau (turn-off):
Vgs ≈ constant but Ig varies
→ Oscillations can cause re-triggering

Active Miller Clamp solution:

              Vdrv
               │
          ┌────┴────┐
          │  Q_on   │
          │   ▼     │
    ──────┤         ├───────┬── GATE
          │         │       │
          │  Q_off  │      ═╪═ Cgs
          │   ▼     │       │
          └────┬────┘       │
               │            │
    ───────────┼────────────┘
               │     │
              ═╪═    ┴ Q_clamp
               │     │
              Vee    │
                     │
                   SOURCE

When Q_clamp active:
- Low impedance path: Gate → Source
- Holds Vgs at Vee
- Prevents Miller turn-on

Timing:
- Q_clamp ON slightly before Q_off ON
- Remains ON during entire OFF state
```

### 4.4 Desaturation Protection

```
Desaturation detects short circuit/overcurrent:

Normal IGBT operation:
- IGBT saturated
- Vce(sat) = 1.5-2.5V @ Ic nominal

Short circuit:
- IGBT exits saturation
- Vce rises to Vdc (800V!)
- Ic rises uncontrollably

Desat detection:

         Vdc (800V)
           │
          ┌┴┐
     Load │ │
          └┬┘
           │
           ├──────────── Vce sense
           │            │
          ┌┴┐          ─┴─ D_desat
    IGBT  │ │           ▲ (High Voltage)
          └┬┘           │
           │            │
    ───────┼────────────┤
           │            │
         Source    ┌────┴────┐
           │       │ DESAT   │
           │       │ Comparator
           │       │         │
           │       │  Vref   │
           │       │  (7-9V) │
           │       └────┬────┘
           │            │
           │         FAULT
           └────────────┘

Typical threshold:
- Vdesat = 7-9V (above Vce(sat) + margin)
- Blanking time: 2-5 μs (for turn-on spike)

Fault response:
1. Soft turn-off (slow Rg)
2. 2-level turn-off (first limit di/dt)
3. Fault signal to MCU
```

### 4.5 Soft Turn-Off

```
Problem: Fast turn-off at high current

di/dt = L × dI/dt → Voltage spike

For L_stray = 50 nH, I = 500A, dt = 100ns:
V_spike = 50×10^-9 × 500 / 100×10^-9 = 250V!

Vce total = Vdc + V_spike = 800 + 250 = 1050V
→ Exceeding 1200V rating!

Soft Turn-Off sequence:

     Vgs
      │
  +15V├─────┐
      │     │
      │     │         Stage 2
      │     └───────┐ (Slow)
  0V  ├─────────────│───────────────
      │             │
      │             └──────────────
  -4V ├────────────────────────────
      │
      └────────────────────────────► t
           t1      t2

      Vce
      │
 800V ├───────────────┬────────────
      │              ╱│
      │            ╱  │
      │          ╱    │
  Vsat├────────╱      │
      │                │
      └────────────────┴───────────► t

Implementation:
- Stage 1: Normal Rg(off)
- Stage 2: Higher Rg or constant current
- Transition: Vce threshold or timer
```

## 5. Isolated Power Supply

### 5.1 Bootstrap Power Supply

```
Bootstrap for half-bridge:

     Vcc (+15V)
       │
       │ D_boot (Fast Recovery)
       │  │
       ├──┴──┐
       │     │ C_boot (≥10μF)
       │    ═╪═
       │     │
       │     └──────────┐
       │                │
       │         ┌──────┴──────┐
       │         │  HIGH SIDE  │
       │         │   DRIVER    │
       │         │             │
       │         └──────┬──────┘
       │                │
       │                ├────────── VS (Switch Node)
       │                │
       │         ┌──────┴──────┐
       │         │  LOW SIDE   │
       │         │   DRIVER    │
       │         └──────┬──────┘
       │                │
       └────────────────┴────────── GND

C_boot calculation:

C_boot ≥ Qg / ΔV

Where:
- Qg = total gate charge
- ΔV = allowed voltage drop (typically 1V)

For SiC with Qg = 500 nC, ΔV = 1V:
C_boot ≥ 500 nC / 1V = 500 nF

Plus margin (×10): C_boot ≥ 5 μF
Recommended: 10-22 μF / 25V

Bootstrap limitations:
- Cannot run 100% duty cycle (needs refresh)
- Max OFF time limited (leakage)
- Startup sequence required
```

### 5.2 Isolated DC/DC for Gate Driver

```
When to use isolated DC/DC:

1. When 100% duty cycle is needed
2. For high-side in three-phase inverter
3. For full-bridge (4 independent gates)
4. When negative bias is needed

Push-Pull isolated DC/DC:

     Vin          T1         Vout
      │     ┌────┬────┐       │
      │     │    │    │       │
      ├─────┤    │    ├───────┤
      │   ┌─┴─┐  │  ┌─┴─┐     │
      │   │Q1 │  │  │D1 │     │
   C1═╪═  └─┬─┘ ═╪═ └─┬─┘    ═╪═ C2
      │     │    │    │       │
      │     │    │    │       │
      │   ┌─┴─┐  │  ┌─┴─┐     │
      │   │Q2 │  │  │D2 │     │
      ├───┤   │  │  │   ├─────┤
      │   └─┬─┘  │  └─┬─┘     │
      │     │    │    │       │
     GND    └────┴────┘     GND2
          (Isolation)

Commercial modules:

RECOM R15P21503D:
- Vin: 15V (12-18V)
- Vout: +15V / -3V
- Power: 2W
- Isolation: 5.2 kV
- Price: ~€25

Murata MGJ2D121505SC:
- Vin: 12V
- Vout: +15V / -5V
- Power: 2W
- Isolation: 5.2 kV
- Price: ~€20

MORNSUN QA02 Series:
- Vin: 5V / 12V / 24V options
- Vout: +15V / -5V
- Power: 2W
- Isolation: 3.5 kV
- Price: ~€8 (more economical option)
```

### 5.3 Gate Driver Power Budget

```
Gate driver power calculation:

1. Gate charge losses:
   Pg = Qg × Vgs × f_sw

   For SiC (Qg = 150 nC, Vgs = 19V, f_sw = 50 kHz):
   Pg = 150×10^-9 × 19 × 50000 = 142 mW

2. Quiescent current:
   Pq = Vcc × Iq
   Typically Iq = 5-20 mA
   Pq = 15 × 0.01 = 150 mW

3. Isolation DC/DC efficiency:
   η = 80-85%

   Pdc = (Pg + Pq) / η
   Pdc = (142 + 150) / 0.82 = 356 mW per channel

For half-bridge (2 channels):
P_total = 2 × 356 = 712 mW

For 3-phase inverter (6 channels):
P_total = 6 × 356 = 2.14 W

NOTE: This is only for gate drive!
      Additional power for MCU, sensors, etc.
```

## 6. PCB Layout for Gate Drivers

### 6.1 Critical Paths

```
Gate Driver Layout Priorities:

                   HIGH dv/dt ZONE
    ┌─────────────────────────────────────────┐
    │                                         │
    │    ┌─────────────────────────────┐      │
    │    │      POWER MODULE           │      │
    │    │   ┌───┐         ┌───┐       │      │
    │    │   │ G │    ○    │ G │       │      │
    │    │   └─┬─┘   NTC   └─┬─┘       │      │
    │    │     │             │         │      │
    │    └─────┼─────────────┼─────────┘      │
    │          │             │                │
    │    ┌─────┴──┐    ┌─────┴──┐             │
    │    │ Rg     │    │ Rg     │ ← As close │
    │    └────┬───┘    └────┬───┘   as        │
    │         │             │       possible  │
    │    ┌────┴─────────────┴────┐            │
    │    │    GATE DRIVER IC     │            │
    │    │    ┌───┐    ┌───┐     │            │
    │    │    │OUT│    │OUT│     │            │
    │    │    └───┘    └───┘     │            │
    │    │                       │            │
    │    │    ┌───┐    ┌───┐     │            │
    │    │    │IN │    │IN │     │            │
    │    └────┴───┴────┴───┴─────┘            │
    │              │                          │
    │    ──────────┼──────────────────────    │
    │    ISOLATION BARRIER                    │
    │    ──────────┼──────────────────────    │
    │              │                          │
    │    ┌─────────┴───────────┐              │
    │    │   CONTROL SECTION   │              │
    │    │   (LOW VOLTAGE)     │              │
    │    └─────────────────────┘              │
    │                                         │
    └─────────────────────────────────────────┘

Rules:
1. Gate loop as short as possible (< 2 cm)
2. Rg as close to module as possible
3. Decoupling capacitors on VCC/VEE
4. Kelvin source connection
5. Physical separation of HV/LV zones
```

### 6.2 Kelvin Source Connection

```
Importance of Kelvin Source:

WITHOUT Kelvin source:
                    L_stray
    Driver ───Rg───┬──⌇⌇⌇───┬── GATE
                   │        │
                   │       ═╪═ Power
                   │        │  MOSFET
                   │        │
    Driver GND ────┴────────┼── SOURCE
                            │
                        L_source
                            │
                            ▼
                         Power GND

Problem:
- Power current flows through L_source
- V = L × di/dt creates voltage on source
- Gate-Source voltage varies!
- Vgs_actual = Vgs_driver - L_source × di/dt

WITH Kelvin source (4-pin package):

    Driver ───Rg───┬─────────┬── GATE
                   │         │
                   │        ═╪═ Power
                   │         │  MOSFET
                   │         │
    Driver GND ────┴─────────┼── SOURCE (Kelvin)
                             │
                         L_source
                             │
                             ┼── SOURCE (Power)
                             │
                             ▼
                          Power GND

TO-247-4 Pinout:
     ┌───────────────┐
     │   1   2   3   4│
     │   G   D   S   SK│
     └───────────────┘
     G = Gate
     D = Drain
     S = Source (Power)
     SK = Source Kelvin

Result:
- Kelvin source only for sensing
- No di/dt influence
- More precise Vgs control
- Faster, cleaner switching
```

### 6.3 Decoupling Strategy

```
Gate Driver Decoupling:

    Vcc (+15V) ──┬────────────────┬───────────
                 │                │
                ═╪═ C1           ═╪═ C2
                │(100nF)         │(10μF)
                 │                │
    GND ─────────┴────────────────┴───────────

    Vee (-4V) ───┬────────────────┬───────────
                 │                │
                ═╪═ C3           ═╪═ C4
                │(100nF)         │(10μF)
                 │                │
    GND ─────────┴────────────────┴───────────

Placement:
- C1, C3: ≤5mm from driver IC
- C2, C4: At power supply input

Capacitor type:
- C1, C3: MLCC X7R or C0G
- C2, C4: MLCC X5R/X7R or Tantalum

For bootstrap:
- 10-22 μF / 25V
- Low ESR MLCC
- Close to bootstrap diode
```

## 7. Protection Functions

### 7.1 Under-Voltage Lockout (UVLO)

```
UVLO function:

      Vcc
       │
    ┌──┴──┐
    │     │      ┌─────────────────────┐
    │ REG │      │                     │
    │     ├──────┤ UVLO Comparator     │
    └──┬──┘      │                     │
       │         │  Vth_on = 12.5V     │
       │         │  Vth_off = 11.5V    │
       │         │  (1V hysteresis)    │
       │         │                     │
       │         └─────────┬───────────┘
       │                   │
       │              ENABLE
       │                   │
       │         ┌─────────┴───────────┐
       │         │                     │
       │         │    OUTPUT STAGE     │
       │         │                     │
       │         └─────────────────────┘

Typical UVLO thresholds:

│ Application      │ UVLO ON │ UVLO OFF │ Hyst  │
├──────────────────┼─────────┼──────────┼───────┤
│ IGBT (+15V)      │ 13.0V   │ 11.5V    │ 1.5V  │
│ SiC (+15V/-4V)   │ 13.0V   │ 11.5V    │ 1.5V  │
│ SiC (+18V/-5V)   │ 15.5V   │ 14.0V    │ 1.5V  │
│ GaN (+5V)        │ 4.5V    │ 4.0V     │ 0.5V  │

Why UVLO is important:
- Insufficient Vgs = linear operation = thermal runaway
- Gate oxide stress in SiC if Vgs too high
- Defined behavior during power-up/down
```

### 7.2 Short Circuit Protection Types

```
Type I: Turn-on into short circuit

    Ic
     │
     │    ┌────────────────────
     │    │ I_SC (very high)
     │    │
     │────┘
     │
     └────────────────────────► t
          t_desat (<5μs)

- MOSFET turns on into existing short
- Current limited by saturation
- Desat detects high Vce/Vds immediately
- Reaction time: < 5 μs critical

Type II: Short circuit during ON state

    Ic
     │         ┌──────────────
     │         │ I_SC
     │────────┐│
     │ I_load ││
     │        └┘
     └────────────────────────► t
              t_SC

- Normal operation, then short
- Rapid current rise
- Harder to detect (starts from normal Vce)
- Faster reaction needed

SiC vs IGBT Short Circuit Capacity:

│ Parameter        │ IGBT     │ SiC MOSFET │
├──────────────────┼──────────┼────────────┤
│ SC capacity      │ 10 μs    │ 2-5 μs     │
│ Reaction needed  │ <5 μs    │ <1 μs      │
│ SC current       │ 5-10×In  │ 3-8×In     │
│ Energy limit     │ High     │ Lower      │

For SiC: CRITICAL fast desaturation!
```

### 7.3 Protection Implementation

```
Complete protection sequence:

    FAULT ──┬──────────────────────────────────
            │
            │  ┌──────────────────────────────┐
            │  │   DESAT DETECTED             │
            │  │   Vce > Vth (7V)             │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   BLANKING TIME              │
            │  │   (2-5 μs for IGBT)          │
            │  │   (0.5-1 μs for SiC)         │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   SOFT TURN-OFF              │
            │  │   Stage 1: Limit di/dt       │
            │  │   Stage 2: Full off          │
            │  └──────────────┬───────────────┘
            │                 │
            │                 ▼
            │  ┌──────────────────────────────┐
            │  │   FAULT LATCH                │
            │  │   Hold gate off              │
            │  │   Signal MCU                 │
            │  └──────────────────────────────┘
            │
            └──► MCU/DSP: Fault handling

Typical two-stage turn-off schematic:

           Vgs
            │
       +15V ├────┐
            │    │
            │    │   ┌─────────┐
        +5V ├────│───┤ Stage 1 │ (Limit di/dt)
            │    │   └─────────┘
            │    │            │
         0V ├────│────────────│───────────
            │    │            │
        -4V ├────│────────────└─────────── Stage 2
            │
            └────────────────────────────► t
                 │ Short    │
                 │detected  │
                 t0        t1 (1-2 μs)
```

## 8. Gate Driver Testing

### 8.1 Static Tests

```
1. Output Voltage Test:
   - Vout(high): +15V ±0.5V
   - Vout(low): -4V ±0.3V
   - Measure under load (Rload = 100Ω)

2. Propagation Delay:
   ┌────────────────────────────────────────┐
   │                                        │
   │   INPUT ────┬───────────────────       │
   │             │                          │
   │        ┌────┴────┐                     │
   │        │   50%   │                     │
   │        │         │ tpd(on)             │
   │   OUTPUT ───┬────┴──────────────       │
   │             │                          │
   │        ┌────┴────┐                     │
   │        │   50%   │                     │
   │                                        │
   └────────────────────────────────────────┘

   Measure: tpd(on), tpd(off)
   Specification: <100 ns typical

3. UVLO Test:
   - Ramp Vcc: 0V → 20V → 0V
   - Measure turn-on/turn-off points
   - Verify hysteresis

4. CMTI Test:
   - Apply dv/dt across isolation barrier
   - Measure output disturbance
   - Spec: >100 kV/μs for SiC
```

### 8.2 Dynamic Tests

```
Double Pulse Test with Gate Driver Evaluation:

Setup:
    Vdc ──┬──────────┬───────────
          │          │
         ═╪═ Cdc    ┌┴┐
          │         │ │ L_load
          │         │ │
          │         └┬┘
          │          │
          └────┬─────┤
              ┌┴┐    │
         DUT  │ │ ←──┼── GATE DRIVER
              └┬┘        UNDER TEST
               │     │
    GND ───────┴─────┴───────────

Measurements:
1. Rise time / Fall time of driver output
2. Gate voltage overshoot/undershoot
3. Miller plateau characteristics
4. Gate ringing
5. Switching energies (Eon, Eoff)

Test sequence:
│ Parameter        │ First pulse │ Second pulse│
├──────────────────┼─────────────┼─────────────┤
│ Duration         │ 5 μs        │ 2 μs        │
│ Dead time        │ -           │ 2 μs        │
│ Measured         │ Turn-on     │ Turn-off    │
│                  │ (Id = 0)    │ (Id = Il)   │
```

### 8.3 Test Equipment

```
Required equipment:

1. Oscilloscope:
   - Bandwidth: ≥200 MHz (≥500 MHz for SiC)
   - Sample rate: ≥1 GS/s
   - Isolated channels for HV

   Recommendation: Tektronix MDO3054, Keysight DSOX3054

2. Voltage Probes:
   - Differential for gate voltage
   - High voltage for Vce/Vds

   Recommendation:
   - Tektronix THDP0200 (1500V, 200 MHz)
   - PMK PHV 4002-3 (2 kV, 400 MHz)

3. Current Probes:
   - Rogowski coil for di/dt
   - Hall effect for DC + AC

   Recommendation:
   - PEM CWT Mini (di/dt)
   - LEM PR30 (DC + AC)

4. Power Supply:
   - Isolated, low noise
   - ±15V / -5V outputs

   Recommendation:
   - Recom bench supplies
   - Custom LISN filtered

5. Function Generator:
   - For PWM generation
   - <10 ns rise time

   Recommendation: Tektronix AFG31000
```

## 9. Bill of Materials - Gate Drivers

### 9.1 For 150 kW Charger (6 channels)

```
Option A: Integrated modular drivers

┌────────────────────────────────────────────────────────┐
│ Component               │ Qty │ Unit Price │   Total   │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Wolfspeed CGD12HBXMP    │  3  │   €120     │   €360    │
│ (Half-bridge SiC driver)│     │            │           │
├─────────────────────────┼─────┼────────────┼───────────┤
│ DC/DC RECOM R15P21503D  │  6  │   €25      │   €150    │
│ (Backup/aux)            │     │            │           │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Gate resistor kit       │ set │   €20      │   €20     │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Decoupling capacitors   │ set │   €30      │   €30     │
├─────────────────────────┼─────┼────────────┼───────────┤
│ TOTAL (Option A)        │     │            │   €560    │
└────────────────────────────────────────────────────────┘

Option B: Discrete drivers (more flexible)

┌────────────────────────────────────────────────────────┐
│ Component               │ Qty │ Unit Price │   Total   │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Silicon Labs Si8285     │  3  │   €12      │   €36     │
│ (Dual isolated driver)  │     │            │           │
├─────────────────────────┼─────┼────────────┼───────────┤
│ DC/DC Murata MGJ2       │  6  │   €20      │   €120    │
│ (+15V/-5V, 2W)          │     │            │           │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Desat protection IC     │  6  │   €8       │   €48     │
│ (ACPL-339J or similar)  │     │            │           │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Gate resistors (matched)│  12 │   €1       │   €12     │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Decoupling kit          │ set │   €40      │   €40     │
├─────────────────────────┼─────┼────────────┼───────────┤
│ Bootstrap diode + cap   │  6  │   €5       │   €30     │
├─────────────────────────┼─────┼────────────┼───────────┤
│ TOTAL (Option B)        │     │            │   €286    │
└────────────────────────────────────────────────────────┘

Recommendation:
- For rapid development: Option A (less risk)
- For cost optimization: Option B (lower cost, more work)
- For EXPO 2027: Option A recommended
```

## 10. Conclusion

### Key Recommendations for Gate Driver Design:

```
1. Driver selection by semiconductor:
   ├── IGBT: Standard isolated (1ED020I12)
   ├── SiC: Specialized with CMTI >100kV/μs
   └── GaN: Integrated half-bridge (LMG1210)

2. Protection functions (MANDATORY):
   ├── UVLO with hysteresis
   ├── Desaturation detection (<1μs for SiC)
   ├── Soft turn-off sequence
   └── Fault reporting

3. Layout priorities:
   ├── Minimize gate loop
   ├── Kelvin source connection
   ├── Proper decoupling
   └── HV/LV separation

4. Power supply:
   ├── Isolated DC/DC for each channel
   ├── +15V/-4V for SiC (check datasheet!)
   └── Sufficient power budget (>500mW/ch)

5. Testing:
   ├── Double pulse test mandatory
   ├── Desat protection verification
   └── CMTI test on finished design
```
