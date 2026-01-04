# Power Electronics - Detailed Analysis

## 1. Introduction

Power electronics is the heart of every EV charger. It converts grid AC voltage into regulated DC voltage required for charging vehicle batteries. This document provides detailed analysis of all aspects of power electronics system design.

---

## 2. System Architecture

### 2.1 Two-Stage Architecture (Standard)

```
+-------------------------------------------------------------------------------+
|                    TWO-STAGE ARCHITECTURE                                      |
+-------------------------------------------------------------------------------+
|                                                                               |
|   3-phase AC        EMI         AC/DC          DC Link        DC/DC          |
|   400V 50Hz        Filter       (PFC)          Bus           (Isolated)      |
|                                                                               |
|   +-----+      +-------+    +-------+      +-------+     +-------+           |
|   |     |      |       |    |       |      |       |     |       |           |
|   |  ~  |----->| EMI   |--->| PFC   |----->| 800V  |---->| LLC/  |---> DC    |
|   |     |      |       |    |       |      |  DC   |     | DAB   |    Out    |
|   |     |      |       |    |       |      |       |     |       |           |
|   +-----+      +-------+    +-------+      +-------+     +-------+           |
|                                                                               |
|   Functions:                                                                  |
|   - EMI Filter: Interference suppression, THD reduction                      |
|   - PFC: Power factor correction (>0.99), AC->DC conversion                  |
|   - DC Link: Energy buffer, decoupling between stages                        |
|   - DC/DC: Galvanic isolation, voltage regulation                            |
|                                                                               |
+-------------------------------------------------------------------------------+
```

### 2.2 Advantages of Two-Stage Architecture

| Advantage | Explanation |
|-----------|-------------|
| Decoupling | PFC and DC/DC can be optimized independently |
| Regulation | Wide output voltage range (150-920V) |
| Isolation | Galvanic isolation in DC/DC stage |
| Efficiency | Each stage optimized for its function |
| Modularity | Easier power scaling |

### 2.3 Single-Stage Architecture (Alternative)

```
+---------------------------------------------------------------+
|              SINGLE-STAGE ARCHITECTURE                         |
+---------------------------------------------------------------+
|                                                               |
|   3-phase AC      EMI        Isolated         DC              |
|   400V           Filter      AC/DC            Output          |
|                                                               |
|   +-----+    +-------+   +------------+   +-------+          |
|   |     |    |       |   |            |   |       |          |
|   |  ~  |--->| EMI   |-->|  Matrix /  |-->|Filter |--> DC    |
|   |     |    |       |   |  DAB-based |   |       |   Out    |
|   |     |    |       |   |            |   |       |          |
|   +-----+    +-------+   +------------+   +-------+          |
|                                                               |
|   Advantages:                                                 |
|   - Fewer components                                          |
|   - Potentially higher efficiency (one conversion stage)      |
|   - More compact design                                       |
|                                                               |
|   Disadvantages:                                               |
|   - More complex control                                       |
|   - Limited voltage range                                      |
|   - Less flexible design                                       |
|                                                               |
+---------------------------------------------------------------+
```

---

## 3. AC/DC Stage - Power Factor Correction

### 3.1 Why PFC?

**Without PFC:**
- Power factor: 0.6-0.7
- THD: 80-100%
- Harmonics load the grid
- Penalties from electricity distributors

**With PFC:**
- Power factor: >0.99
- THD: <5%
- Sinusoidal input current
- Compliance with standards (IEC 61000-3-2/12)

### 3.2 Vienna Rectifier - Detailed Analysis

#### Topology

```
                           DC+ (400V)
                              |
                              |
    +-------------------------+-------------------------+
    |                         |                         |
   ===                       ===                       ===
   === C1                    === C1                    === C1
    |                         |                         |
    |    D1a    S1    D1b     |    D2a    S2    D2b     |    D3a    S3    D3b
    +---->|----+----<|--------+---->|----+----<|--------+---->|----+----<|----+
    |           |              |          |              |          |          |
    |           |              |          |              |          |          |
    L1--[L]-----+--------------|          |              |          |          |
                               |          |              |          |          |
    L2--[L]--------------------+----------+--------------+          |          |
                                                         |          |          |
    L3--[L]----------------------------------------------+----------+----------+
    |                                                                           |
    |                         |                         |                       |
   ===                       ===                       ===                      |
   === C2                    === C2                    === C2                   |
    |                         |                         |                       |
    +-------------------------+-------------------------+                       |
                              |                                                 |
                           DC- (400V)                                           |
                              |                                                 |
                         Neutral Point <----------------------------------------+
```

#### Operating Principle

**Positive half-period (phase L1):**
1. Current flows through L1, D1a, S1 (when on), and returns through neutral point
2. S1 is PWM modulated to control current
3. When S1 is off, current flows through D1a into upper DC bus

**Negative half-period (phase L1):**
1. Current flows from neutral point, through S1 (when on), D1b, and returns to L1
2. When S1 is off, current flows from lower DC bus through D1b

#### Mathematical Model

**Input current (per phase):**
```
i_L(t) = I_m x sin(wt)

Where:
- I_m = sqrt(2) x I_rms
- w = 2pif = 2pi x 50 = 314.16 rad/s
```

**DC link voltage:**
```
V_dc = 2 x V_ac_peak / sqrt(3) x M

For 400V AC input and M=0.95:
V_dc = 2 x 565V / 1.732 x 0.95 = ~620V (minimum)

Typically V_dc = 700-800V is used for margin
```

**Duty cycle for PFC:**
```
d(t) = 1 - (V_dc/2) / |v_ac(t)|

For sinusoidal current, duty cycle varies sinusoidally
```

#### Component Specifications

| Component | Value | Type | Manufacturer |
|-----------|-------|------|--------------|
| S1-S3 | 1200V/50A | SiC MOSFET | Wolfspeed C3M0065100K |
| D1a-D3b | 1200V/30A | SiC Schottky | Wolfspeed C4D20120D |
| L1-L3 | 200-500 uH | Sendust/Powder | Magnetics |
| C1, C2 | 500-1000 uF | Film PP | TDK EPCOS |

#### Control Strategy

```
+---------------------------------------------------------------+
|              VIENNA RECTIFIER CONTROL                          |
+---------------------------------------------------------------+
|                                                               |
|   V_dc_ref --+-->[   ]--> V_dc_error                          |
|              |   |-|                                           |
|   V_dc_meas -+   [PI]--> I_ref (amplitude)                    |
|                    |                                           |
|                    v                                           |
|   V_ac_phase -->[x]--> i_ref(t) = I_ref x sin(theta)          |
|                    |                                           |
|                    v                                           |
|   i_L_meas ----->[- ]--> i_error                              |
|                    |                                           |
|                    v                                           |
|                  [PI/PR]--> duty cycle                        |
|                    |                                           |
|                    v                                           |
|                  [PWM]--> Gate signals S1, S2, S3             |
|                                                               |
|   Typical PI parameters:                                      |
|   - Voltage loop: Kp=0.5, Ki=50, bandwidth ~20 Hz            |
|   - Current loop: Kp=0.1, Ki=500, bandwidth ~2 kHz           |
|                                                               |
+---------------------------------------------------------------+
```

#### Performance

| Parameter | Value | Condition |
|-----------|-------|-----------|
| Efficiency | 98.5% | Full load |
| Power factor | 0.995 | Full load |
| Current THD | 2.5% | Full load |
| Current THD | 5% | 20% load |

---

### 3.3 Active Front End (AFE) - Bidirectional

#### Topology (Three-Phase Two-Level)

```
                                    DC+
                                     |
                                    ===
                                    === C_dc
                                     |
    +----------------+---------------+---------------+----------------+
    |                |               |               |                |
   +-+              +-+             +-+             +-+              +-+
   |S1|             |S3|            |S5|            |  |             |  |
   |  |             |  |            |  |            |  |             |  |
   +-+              +-+             +-+             +-+              +-+
    |                |               |               |                |
    +----[L1]--------+               |               |                |
    |                |               |               |                |
    |                +----[L2]-------+               |                |
    |                |               |               |                |
    |                |               +----[L3]-------+                |
    |                |               |               |                |
   +-+              +-+             +-+             |                |
   |S2|             |S4|            |S6|            |                |
   |  |             |  |            |  |            |                |
   +-+              +-+             +-+             |                |
    |                |               |               |                |
    +----------------+---------------+---------------+----------------+
                                     |
                                    ===
                                    === C_dc
                                     |
                                    DC-
```

#### Advantages of AFE over Vienna Rectifier

| Aspect | Vienna | AFE |
|--------|--------|-----|
| Bidirectionality | No | Yes |
| V2G capability | No | Yes |
| Reactive compensation | No | Yes |
| Number of active switches | 3 | 6 |
| Efficiency | 98.5% | 97-98% |
| Control complexity | Medium | High |

#### Space Vector Modulation (SVM) for AFE

```
+---------------------------------------------------------------+
|                    SPACE VECTOR DIAGRAM                        |
+---------------------------------------------------------------+
|                                                               |
|                         V3 (010)                               |
|                            /\                                  |
|                           /  \                                 |
|                          /    \                                |
|                         /      \                               |
|                        /   S3   \                              |
|                       /          \                             |
|              V2 (110)/     S2     \ V4 (011)                  |
|                     /              \                           |
|                    /    +------+    \                         |
|                   /     |V_ref |     \                        |
|                  /      |  t   |      \                       |
|                 /       +------+       \                      |
|                /     S1          S4     \                     |
|               /                          \                    |
|      V1 (100)---------------------------- V5 (001)           |
|               \           S6           S5 /                   |
|                \                        /                     |
|                 \                      /                      |
|                  \        V0         /                        |
|                   \     (000,111)   /                         |
|                    \              /                           |
|                     \            /                            |
|                      V6 (101)                                 |
|                                                               |
|   Switching states: V0-V7 (8 states, 2 zero vectors)         |
|   V_ref is synthesized from nearest vectors                  |
|                                                               |
+---------------------------------------------------------------+
```

#### SVM Algorithm

```c
// Space Vector Modulation Implementation
void SVM_Calculate(float V_alpha, float V_beta, float V_dc,
                   float* duty_a, float* duty_b, float* duty_c) {

    // Calculate sector
    float V_ref = sqrt(V_alpha*V_alpha + V_beta*V_beta);
    float theta = atan2(V_beta, V_alpha);
    if (theta < 0) theta += 2*PI;

    int sector = (int)(theta / (PI/3)) + 1;

    // Normalization
    float m = V_ref / (V_dc / sqrt(3));  // Modulation index
    float angle = theta - (sector-1) * PI/3;

    // Vector times
    float T1 = m * sin(PI/3 - angle);
    float T2 = m * sin(angle);
    float T0 = 1 - T1 - T2;

    // Duty cycle according to sector
    switch(sector) {
        case 1:
            *duty_a = T1 + T2 + T0/2;
            *duty_b = T2 + T0/2;
            *duty_c = T0/2;
            break;
        case 2:
            *duty_a = T1 + T0/2;
            *duty_b = T1 + T2 + T0/2;
            *duty_c = T0/2;
            break;
        // ... cases 3-6
    }
}
```

---

### 3.4 Three-Level NPC (Neutral Point Clamped)

#### Topology

```
                                         DC+
                                          |
                                         === C1
                                          |
    +-----------------+-------------------+------------------+
    |                 |                   |                 |
   +-+               +-+                 +-+               |
   |S1a|             |S2a|               |S3a|              |
   +-+               +-+                 +-+               |
    |                 |                   |                 |
   +-+               +-+                 +-+               |
   |S1b|             |S2b|               |S3b|              |
   +-+               +-+                 +-+               |
    |                 |                   |                 |
    +---->|D1+--------+---->|D2+----------+---->|D3+-------+ Neutral
    |                 |                   |                 |   Point
   +-+               +-+                 +-+               |
   |S1c|             |S2c|               |S3c|              |
   +-+               +-+                 +-+               |
    |                 |                   |                 |
   +-+               +-+                 +-+               |
   |S1d|             |S2d|               |S3d|              |
   +-+               +-+                 +-+               |
    |                 |                   |                 |
    +-----------------+-------------------+------------------+
                                          |
                                         === C2
                                          |
                                         DC-
```

#### Advantages of 3-Level NPC

| Advantage | Quantification |
|-----------|----------------|
| Lower voltage stress | V_dc/2 per switch (vs V_dc for 2-level) |
| Lower THD | 50% less than 2-level |
| Lower dv/dt | Half of 2-level |
| Lower EMI | Significant improvement |
| Higher efficiency | +0.5-1% |

#### Disadvantages

- More components (12 switches + 6 diodes vs 6 switches)
- Neutral point balancing
- More complex control

---

## 4. DC/DC Stage - Isolated Converters

### 4.1 LLC Resonant Converter - Detailed Analysis

#### Topology

```
+-------------------------------------------------------------------------------+
|                         LLC RESONANT CONVERTER                                 |
+-------------------------------------------------------------------------------+
|                                                                               |
|   V_dc+ --+------+                                                            |
|           |     +-+                                                           |
|           |     |S1| (High-side)                                              |
|           |     +-+                                                           |
|           |      |                                                            |
|           |      +------[Lr]------[Cr]------+                                 |
|           |      |                          |                                 |
|           |      |    +----------------+    |                                 |
|           |      |    |                |    |                                 |
|           |      |    |   +--------+   |    |        SECONDARY SIDE          |
|           |      |    |   |        |   |    |    +---------------------+     |
|           |      |    |   |   Lm   |   |    |    |                     |     |
|           |      +----+   |        |   +----+    |    D1  +---+       |     |
|           |           |   +--------+   |         |   -->|-+   +---+   |     |
|           |           |                |         |       +---+   |   |     |
|           |           |  TRANSFORMER   |    o----+              === |     |
|           |           |    n:1         |    o    |   -->|-+     === C_out|
|           |           |                |         |   D2  | |      |   |     |
|           |      +----+                +----+    |       +-+      |   |     |
|           |      |    |                |    |    |         +------+   |     |
|           |      |    |                |    |    |                |   |     |
|           |      |    +----------------+    |    +----------------+---+     |
|           |      |                          |                     |         |
|           |      +--------------------------+                     |         |
|           |      |                                                v         |
|           |     +-+                                           V_out         |
|           |     |S2| (Low-side)                                             |
|           |     +-+                                                          |
|           |      |                                                            |
|   V_dc- --+------+                                                            |
|                                                                               |
|   Components:                                                                 |
|   - Lr = Resonant inductance (series)                                        |
|   - Cr = Resonant capacitor                                                  |
|   - Lm = Transformer magnetizing inductance                                  |
|   - n = Transformer turns ratio                                              |
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### Resonant Frequencies

**Series resonant frequency (fr):**
```
fr = 1 / (2pi x sqrt(Lr x Cr))
```

**Parallel resonant frequency (fp):**
```
fp = 1 / (2pi x sqrt((Lr + Lm) x Cr))
```

**Relationship:**
```
fp < fr (always)

Ln = Lm / Lr  (typically 3-7)

fp = fr / sqrt(1 + Ln)
```

#### Gain Characteristic

```
+---------------------------------------------------------------+
|                   LLC GAIN CHARACTERISTIC                      |
+---------------------------------------------------------------+
|                                                               |
|   Gain |                                                       |
|   M    |     Light load                                       |
|        |        /\                                             |
|   1.4 -|       /  \                                            |
|        |      /    \  Medium load                              |
|   1.2 -|     /      \    /\                                    |
|        |    /        \  /  \  Heavy load                       |
|   1.0 -|---/----------\/----\-----------                       |
|        |  /                  \                                 |
|   0.8 -| /                    \                                |
|        |/                      \                               |
|   0.6 -|                        \                              |
|        |                                                       |
|        +------------------------------------------------------  |
|             fp        fr                    f_sw               |
|                                                               |
|   Operating regions:                                          |
|   - f_sw < fp: Capacitive mode (avoid - loses ZVS)           |
|   - fp < f_sw < fr: Below resonance (ZVS, boost operation)   |
|   - f_sw = fr: Resonance (max efficiency)                    |
|   - f_sw > fr: Above resonance (ZVS, buck operation)         |
|                                                               |
+---------------------------------------------------------------+
```

#### Design Procedure for 50 kW LLC

**Input parameters:**
```
P_out = 50 kW
V_in = 800 V (DC link)
V_out = 200-800 V (battery range)
f_r = 100 kHz (target resonant frequency)
```

**Step 1: Transformer ratio**
```
n = V_in / (2 x V_out_nom) = 800 / (2 x 400) = 1:1
```

**Step 2: Equivalent load resistance**
```
R_ac = (8 x n^2 x V_out^2) / (pi^2 x P_out)
R_ac = (8 x 1 x 400^2) / (pi^2 x 50000) = 2.6 ohm
```

**Step 3: Quality factor (Q)**
```
Q = sqrt(Lr/Cr) / R_ac

Typically Q = 0.3-0.5 for wide load range
We choose Q = 0.4
```

**Step 4: Ln = Lm/Lr**
```
Ln = 5 (compromise between gain range and efficiency)
```

**Step 5: Component calculation**
```
Cr = 1 / (2pi x fr x Q x R_ac)
Cr = 1 / (2pi x 100k x 0.4 x 2.6) = 153 nF

Lr = 1 / ((2pi x fr)^2 x Cr)
Lr = 1 / ((2pi x 100k)^2 x 153n) = 16.5 uH

Lm = Ln x Lr = 5 x 16.5 = 82.5 uH
```

**Step 6: Gain range verification**
```
M_min = V_out_min x n / (V_in/2) = 200 x 1 / 400 = 0.5
M_max = V_out_max x n / (V_in/2) = 800 x 1 / 400 = 2.0

Required M range: 0.5 - 2.0
LLC with Ln=5, Q=0.4 can achieve M = 0.7 - 1.4

Problem: Larger M range needed!
```

**Step 7: Redesign for wider range**
```
Option A: Reduce Ln to 3
- Larger M range but lower efficiency

Option B: Use variable DC link
- PFC regulates V_dc for optimal M

Option C: Additional buck/boost stage
- Increases complexity but enables full range
```

#### Soft Switching Analysis

**Zero Voltage Switching (ZVS) condition:**
```
For ZVS of primary switches:
I_Lm(t_dead) > 0

I_Lm_peak = (V_in x T_sw) / (4 x Lm)

Dead time for ZVS:
t_dead > (2 x C_oss x V_in) / I_Lm_peak

Typical: t_dead = 100-500 ns
```

**Zero Current Switching (ZCS) on secondary side:**
```
When f_sw > fr, diodes on secondary side
naturally commutate at zero current (ZCS)
```

---

### 4.2 Dual Active Bridge (DAB) - Detailed Analysis

#### Topology

```
+-------------------------------------------------------------------------------+
|                        DUAL ACTIVE BRIDGE (DAB)                                |
+-------------------------------------------------------------------------------+
|                                                                               |
|   PRIMARY H-BRIDGE              TRANSFORMER           SECONDARY H-BRIDGE      |
|                                                                               |
|   V1+ --+--------+                  +----+                +--------+-- V2+    |
|         |       +-+                 |    |               +-+       |          |
|         |       |S1|                |    |               |S5|       |          |
|         |       +-+                 |    |               +-+       |          |
|         |        |                  |    |                |        |          |
|         |        +------[L]---------+ n:1+----------------+        |          |
|         |        |                  |    |                |        |          |
|         |       +-+                 |    |               +-+       |          |
|         |       |S3|                |    |               |S7|       |          |
|         |       +-+                 |    |               +-+       |          |
|         |        |                  +----+                |        |          |
|         |        |                                        |        |          |
|         |        |                                        |        |          |
|         |       +-+                                      +-+       |          |
|         |       |S2|                                     |S6|       |          |
|         |       +-+                                      +-+       |          |
|         |        |                                        |        |          |
|         |        +----------------------------------------+        |          |
|         |        |                                        |        |          |
|         |       +-+                                      +-+       |          |
|         |       |S4|                                     |S8|       |          |
|         |       +-+                                      +-+       |          |
|         |        |                                        |        |          |
|   V1- --+--------+                                        +--------+-- V2-    |
|                                                                               |
|   L = Series inductance (can be transformer leakage)                         |
|   n = Transformer turns ratio                                                 |
|   S1-S4 = Primary switches                                                   |
|   S5-S8 = Secondary switches                                                 |
|                                                                               |
+-------------------------------------------------------------------------------+
```

#### Single Phase Shift (SPS) Control

```
+---------------------------------------------------------------+
|              SINGLE PHASE SHIFT MODULATION                     |
+---------------------------------------------------------------+
|                                                               |
|   V_p  |    +-----+         +-----+                           |
|        |    |     |         |     |                           |
|   +V1 -+----+     +---------+     +-----------                |
|        |                                                       |
|    0  -+                                                       |
|        |         +-----+         +-----+                      |
|   -V1 -+---------+     +---------+     +------                |
|        |                                                       |
|        +------------------------------------------------> t    |
|                                                               |
|   V_s  |       +-----+         +-----+                        |
|        |  phi    |     |         |     |                        |
|   +V2 -+--+----+     +---------+     +-------                 |
|        |  |                                                    |
|    0  -+  |                                                    |
|        |  |    +-----+         +-----+                        |
|   -V2 -+--+----+     +---------+     +-------                 |
|        |  |                                                    |
|        +--+---------------------------------------------> t    |
|           |                                                    |
|           phi = Phase shift angle                              |
|                                                               |
|   Power transfer:                                             |
|                                                               |
|   P = (V1 x V2 x phi x (pi - |phi|)) / (2pi^2 x f_sw x L x n)|
|                                                               |
|   Maximum power at phi = pi/2 (90 deg)                        |
|                                                               |
+---------------------------------------------------------------+
```

#### Extended Phase Shift (EPS) and Dual Phase Shift (DPS)

For improved efficiency at light load:

```
EPS: Adds phase shift within primary or secondary bridge
DPS: Phase shift in both primary and secondary bridge
TPS: Triple phase shift - all degrees of freedom
```

#### ZVS Analysis for DAB

```
ZVS condition for primary switches:
I_L(0) < 0  (current must flow through antiparallel diode)

I_L(0) = (n x V2 - V1) x phi / (2pi x f_sw x L) + (V1 x (pi - phi)) / (2pi x f_sw x L)

For wide ZVS range:
- Optimize L
- Use advanced modulation strategies (EPS, DPS)
- Add auxiliary ZVS networks
```

#### Design Example for 50 kW DAB

**Specifications:**
```
P = 50 kW
V1 = 800 V (DC link)
V2 = 200-800 V (battery)
f_sw = 50 kHz
```

**Transformer:**
```
n = V1 / V2_nom = 800 / 400 = 2:1
```

**Series inductance:**
```
For P_max at phi = pi/4 (45 deg, for margin):

L = (V1 x V2 x phi x (pi - phi)) / (2pi^2 x f_sw x P x n)
L = (800 x 400 x 0.785 x 2.356) / (2 x 9.87 x 50k x 50k x 2)
L = 12 uH
```

**Transformer leakage:**
```
If L_leakage = 5 uH, add:
L_ext = 12 - 5 = 7 uH external inductance
```

---

## 5. Topology Comparison

### 5.1 AC/DC Topologies

| Parameter | Vienna | 2L-AFE | 3L-NPC | T-Type |
|-----------|--------|--------|--------|--------|
| Efficiency | 98.5% | 97% | 98% | 98.2% |
| Power factor | 0.99 | 0.99 | 0.99 | 0.99 |
| THD | <3% | <5% | <3% | <3% |
| V2G | No | Yes | Yes | Yes |
| Number of switches | 3 | 6 | 12 | 9 |
| Voltage stress | V_dc | V_dc | V_dc/2 | Mix |
| Complexity | Medium | Medium | High | Medium |
| Cost | $ | $ | $$$ | $$ |
| **Recommendation** | Unidir. | V2G simple | High power | Best overall |

### 5.2 DC/DC Topologies

| Parameter | LLC | DAB | PSFB | CLLC |
|-----------|-----|-----|------|------|
| Efficiency | 98% | 97% | 96% | 97.5% |
| Bidirectionality | No | Yes | No | Yes |
| V2G | No | Yes | No | Yes |
| ZVS range | Wide | Limited | Medium | Wide |
| Voltage range | +/-20% | Wide | Wide | Wide |
| Complexity | Medium | High | Low | High |
| Cost | $$ | $$$ | $ | $$$ |
| **Recommendation** | Unidir. | V2G | Budget | V2G premium |

---

## 6. Layout and PCB Design

### 6.1 Power Loop Minimization

```
+---------------------------------------------------------------+
|                    POWER LOOP OPTIMIZATION                     |
+---------------------------------------------------------------+
|                                                               |
|   BAD (large loop):                                           |
|                                                               |
|   DC+ ----------------------------+                           |
|                                   |                           |
|                          +--------+--------+                  |
|                          |     MOSFET      |                  |
|                          +--------+--------+                  |
|                                   |                           |
|                                   |     <- Long loop         |
|                                   |        = High L          |
|                          +--------+--------+                  |
|                          |   Capacitor     |                  |
|                          +--------+--------+                  |
|                                   |                           |
|   DC- ----------------------------+                           |
|                                                               |
|                                                               |
|   GOOD (minimal loop):                                        |
|                                                               |
|   DC+ ---+                                                    |
|          |                                                     |
|   +------+------+---------------+                             |
|   |   MOSFET    |  Capacitor    |  <- Minimal loop           |
|   +------+------+---------------+     = Low L                 |
|          |                                                     |
|   DC- ---+                                                    |
|                                                               |
|   Recommendations:                                            |
|   - Use laminated bus bars                                    |
|   - DC link capacitor directly next to MOSFETs               |
|   - Multi-layer PCB with power and ground planes             |
|   - Target parasitic inductance: < 10 nH                     |
|                                                               |
+---------------------------------------------------------------+
```

### 6.2 Gate Driver Layout

```
+---------------------------------------------------------------+
|                  GATE DRIVER PCB LAYOUT                        |
+---------------------------------------------------------------+
|                                                               |
|   +-------------------------------------------------------+  |
|   |                                                       |  |
|   |   +---------+                        +---------+     |  |
|   |   |  Gate   |    <- Short paths      |  SiC    |     |  |
|   |   | Driver  |----------------------->| MOSFET  |     |  |
|   |   |   IC    |    < 20mm              |         |     |  |
|   |   +---------+                        +---------+     |  |
|   |        |                                   |          |  |
|   |        |                                   |          |  |
|   |   +----+----+                         +----+----+    |  |
|   |   | Decoup. |                         | Kelvin  |    |  |
|   |   |  Caps   |                         | Source  |    |  |
|   |   |100nFx3  |                         |  Conn.  |    |  |
|   |   +---------+                         +---------+    |  |
|   |                                                       |  |
|   |   Rules:                                             |  |
|   |   - Kelvin source for precise gate-source            |  |
|   |   - Decoupling caps < 5mm from gate driver          |  |
|   |   - Minimize gate loop inductance                   |  |
|   |   - Separate layers for power and signal            |  |
|   |                                                       |  |
|   +-------------------------------------------------------+  |
|                                                               |
+---------------------------------------------------------------+
```

---

## 7. Simulation and Verification

### 7.1 Recommended Tools

| Tool | Purpose | Cost |
|------|---------|------|
| LTspice | Circuit simulation | Free |
| PLECS | Power electronics | $$ |
| PSIM | Power electronics | $$ |
| Simulink/Simscape | System simulation | $$$ |
| SIMetrix | Circuit simulation | $ |
| Altium Designer | PCB design | $$$ |
| Ansys Icepak | Thermal simulation | $$$$ |
| CST Studio | EMC simulation | $$$$ |

### 7.2 Critical Simulations

1. **Steady-state analysis**
   - Efficiency vs load
   - THD vs load
   - Power factor vs load

2. **Transient analysis**
   - Load step response
   - Startup/shutdown
   - Fault conditions

3. **Thermal analysis**
   - Junction temperature
   - Thermal cycling stress
   - Cooling system adequacy

4. **EMC analysis**
   - Conducted emissions
   - Radiated emissions
   - Filter effectiveness

---

## 8. References

- [MDPI: Power Converter Topologies Review](https://www.mdpi.com/2079-9292/12/7/1581)
- [Wolfspeed: SiC in DC Fast Chargers](https://www.wolfspeed.com/knowledge-center/article/designing-with-silicon-carbide-sic-in-electric-vehicle-dc-fast-chargers/)
- [TI: Power Topology Considerations for EVs](https://www.ti.com/lit/pdf/slla497)
- [Infineon: LLC Design Guide](https://www.infineon.com/LLC)
- [IEEE: DAB Converter Modulation Strategies](https://ieeexplore.ieee.org)
