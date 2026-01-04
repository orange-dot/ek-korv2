# Semiconductor Components for EV Chargers

## Technology Overview

### Evolution of Semiconductor Technology

```
Power Semiconductor Generations:

   Si BJT -> Si MOSFET -> Si IGBT -> SiC MOSFET -> GaN HEMT
   1970s     1980s       1990s      2010s        2020s

Performance vs. Generation:
                                                    * GaN
   Efficiency                               * SiC
   (%)        * Si IGBT
        95 -----*-----------*-------------*----
                            ^             ^
        90 --------*--------|--------------|----|
                   |        |             |
                   Si       SiC           GaN
                   MOSFET   MOSFET        HEMT
```

## 1. Silicon IGBT (Insulated Gate Bipolar Transistor)

### 1.1 Operating Principle

```
IGBT Structure (NPT - Non-Punch Through):

         Emitter (E)    Gate (G)
            |             |
    +-------+-------------+-------+
    |  n+ |  p-body  |  n+        | <- Emitter implant
    |     +----+-----+            |
    |          | Channel          |
    |     n- drift region         | <- Determines Vce
    |                             |
    |     n+ buffer layer         | <- PT version
    |                             |
    |     p+ collector            |
    +-----------------------------+
                  |
            Collector (C)

Equivalent Circuit:

         G --|<--+
                 |
    E ----+------+------+---- E
          |    MOSFET   |
          |      |      |
          +------+------+
                 |
          +------+------+
          |    PNP      |
          |  Bipolar    |
          +------+------+
                 |
    C -----------+----------- C
```

### 1.2 IGBT Generations

| Generation | Year | Vce(sat) @ 100A | Eoff (mJ) | f_sw max | Note |
|------------|------|-----------------|-----------|----------|------|
| Gen 3 | 2000 | 2.5 V | 25 | 10 kHz | NPT |
| Gen 4 | 2005 | 2.0 V | 18 | 15 kHz | Field-Stop |
| Gen 5 | 2010 | 1.7 V | 12 | 20 kHz | Trench FS |
| Gen 6 | 2015 | 1.5 V | 8 | 25 kHz | Micro-pattern |
| Gen 7 | 2020 | 1.45 V | 6 | 30 kHz | RC-IGBT |

### 1.3 Key IGBT Module Manufacturers

#### Infineon PrimePACK/EconoPACK

```
EconoPACK+ 4 (FF450R12ME4):
+-------------------------------------+
|                                     |
|   +-----+   +-----+   +-----+      |
|   | T1  |   | T2  |   | T3  |      |  Half-bridge
|   |     |   |     |   |     |      |  configuration
|   +--+--+   +--+--+   +--+--+      |
|      |         |         |         |
|   +--+--+   +--+--+   +--+--+      |
|   | D1  |   | D2  |   | D3  |      |
|   +-----+   +-----+   +-----+      |
|                                     |
|   DC+  AC1  AC2  AC3  DC-          |
+---+----+----+----+----+------------+
    |    |    |    |    |

Specifications FF450R12ME4:
- Vces: 1200 V
- Ic nom: 450 A
- Vce(sat): 1.70 V @ 450A, 125C
- Eon: 32 mJ @ 450A, 600V, 125C
- Eoff: 23 mJ @ 450A, 600V, 125C
- Rth(j-c) IGBT: 0.034 K/W
- Rth(j-c) Diode: 0.062 K/W
- Tjmax: 175C
```

#### Mitsubishi CM-Series

```
CM600DX-24T (NX-Series):
- Vces: 1200 V
- Ic: 600 A
- Vce(sat): 1.65 V @ 600A, 125C
- Feature: Integrated NTC thermistor
- Package: Dual module 62mm

NX series advantages:
1. Lower Vce(sat) for reduced conduction losses
2. Softer switching for lower EMI
3. Better parallel operation of multiple modules
```

#### Semikron SEMiX / SEMITRANS

```
SEMiX453GB12E4s (Six-pack):

        DC+
         |
    +----+----+--------+--------+
    |         |        |        |
   +-+       +-+      +-+      |
   | |T1     | |T3    | |T5    |
   +-+       +-+      +-+      |
    +--U-----+-V------+-W------+ AC outputs
   +-+       +-+      +-+      |
   | |T2     | |T4    | |T6    |
   +-+       +-+      +-+      |
    |         |        |        |
    +----+----+--------+--------+
         |
        DC-

Specifications:
- 6-pack configuration for three-phase inverter
- Vces: 1200 V
- Ic: 450 A
- Built-in thermal protection
- Spring contacts for easy mounting
```

### 1.4 IGBT Loss Calculation

```
Conduction losses:
P_cond = Vce(sat) x Ic x D

Where:
- Vce(sat) = Vce0 + r x Ic (linearized)
- D = duty cycle

For sinusoidal output:
P_cond = Ic x (Vce0/pi + r x Ic/4) + Ic x m x cos(phi) x (Vce0/4 + r x Ic/(3pi))

Switching losses:
P_sw = f_sw x (Eon + Eoff) x (Vdc/Vref) x (Ic/Iref)

Where:
- f_sw = switching frequency
- Eon, Eoff = energies from datasheet
- Vref, Iref = reference conditions from datasheet

Total IGBT losses:
P_total = P_cond + P_sw

Example calculation (150 kW inverter):
- Vdc = 800 V, Ic = 200 A, f_sw = 16 kHz
- Vce(sat) = 1.7 V, Eon = 15 mJ, Eoff = 12 mJ
- D = 0.5, cos(phi) = 0.95

P_cond = 200 x 1.7 x 0.5 = 170 W
P_sw = 16000 x (15 + 12) x 10^-3 x (800/600) x (200/450)
P_sw = 16000 x 0.027 x 1.33 x 0.44 = 253 W
P_total = 170 + 253 = 423 W per IGBT
```

## 2. Silicon Carbide (SiC) MOSFET

### 2.1 Material Advantages of SiC

```
Si vs SiC Material Comparison:

Parameter           |   Si      |   SiC (4H)  | Factor
--------------------+-----------+-------------+--------
Bandgap (eV)        |   1.12    |   3.26      |  2.9x
Critical field      |   0.3     |   2.8       |  9.3x
(MV/cm)             |           |             |
Thermal conduct.    |   1.5     |   4.9       |  3.3x
(W/cm K)            |           |             |
Saturated e- vel.   |   1.0     |   2.0       |  2.0x
(x10^7 cm/s)        |           |             |
Intrinsic temp.     |   150     |   900       |  6.0x
(C)                 |           |             |

Baliga Figure of Merit (BFOM):
BFOM = epsilon x mu x Ec^3

SiC BFOM = 900 x Si BFOM

Practical result:
- 10x lower Rds(on) for same voltage class
- 3x higher operating temperature
- 5-10x higher switching frequency
```

### 2.2 SiC MOSFET Structure

```
Planar SiC MOSFET:

         Source (S)       Gate (G)
            |                |
    +-------+----------------+-------+
    |   n+  |    p-well    |  n+    |
    |       +------+-------+        |
    |              | Channel (JFET) |
    |         n- epitaxial          |
    |              layer            |
    |                               |
    |         n+ SiC substrate      |
    +-------------------------------+
                   |
             Drain (D)

Trench SiC MOSFET (Newer generation):

         S          G          S
         |          |          |
    +----+----+-----+-----+----+----+
    |   n+    |   Oxide   |   n+    |
    | +-------+           +-------+ |
    | | p-well|           |p-well | |
    | |       | Poly-Si   |       | |
    | |       |   Gate    |       | |
    | +-------+           +-------+ |
    |         +-----------+         |
    |      n- drift region          |
    |                               |
    |      n+ SiC substrate         |
    +-------------------------------+
                   |
                   D

Trench structure advantages:
- Eliminated JFET effect
- 30-40% lower Rds(on)
- Better current density
```

### 2.3 Key SiC Manufacturers

#### Wolfspeed (Cree)

```
C3M0016120K (Gen 3):
+-------------------------------------+
| Parameter          | Value          |
+--------------------+----------------+
| Vds                | 1200 V         |
| Rds(on) @ 25C      | 16 mohm        |
| Rds(on) @ 175C     | 28 mohm        |
| Id @ 25C           | 115 A          |
| Id @ 100C          | 95 A           |
| Qg (total)         | 123 nC         |
| Ciss               | 3300 pF        |
| Coss               | 160 pF         |
| Crss               | 13 pF          |
| Package            | TO-247-4       |
| Price (qty 100)    | ~$45           |
+-------------------------------------+

C3M0032120K (Lower current, lower price):
- Rds(on): 32 mohm
- Id: 63 A
- Price: ~$25

CAB425M12XM3 (Power Module):
- Half-bridge configuration
- Rds(on): 4.2 mohm (per switch)
- Id: 425 A continuous
- Integrated thermistor protection
- 62mm industrial footprint
```

#### Infineon CoolSiC

```
IMZ120R016M1H (1200V, TO-247-4):
- Rds(on): 16 mohm @ 25C
- Technology: Trench
- .XT bonding for better reliability
- Kelvin source pin for precise control

FF6MR12W2M1_B11 (CoolSiC Module):
+-------------------------------------+
| EasyPACK 2B Half-Bridge             |
+-------------------------------------+
| Vds: 1200 V                         |
| Rds(on): 6 mohm (per switch)        |
| Id: 400 A                           |
| Package: 34mm                       |
| Integrated driver: Optional         |
+-------------------------------------+

Infineon HybridPACK Drive:
- IGBT + SiC diode combination
- Optimized for EV traction
- Compact packaging
```

#### ROHM

```
SCT3022AL (3rd Gen):
- Vds: 650 V (for 400V systems)
- Rds(on): 22 mohm
- Trench structure
- TO-247N package

SCT4045DR (4th Gen, 1200V):
- Rds(on): 45 mohm
- Improved Crss (lower)
- More robust gate oxide

BSM300D12P3G002 (Full SiC Module):
- 1200V/300A half-bridge
- Rds(on): 5 mohm
- Optimized for 50+ kHz
```

#### STMicroelectronics

```
SCTW90N65G2V (Gen 2):
- Vds: 650 V
- Rds(on): 18 mohm
- Low Qg: 58 nC
- HiP247 package (isolated)

STPSC20H12 (SiC Schottky Diode):
- Vrrm: 1200 V
- If: 20 A
- Vf: 1.35 V @ 20A
- Zero reverse recovery
```

### 2.4 SiC MOSFET Loss Calculation

```
Conduction losses:
P_cond = Irms^2 x Rds(on)(Tj)

Temperature dependence of Rds(on):
Rds(on)(T) = Rds(on)(25C) x [1 + alpha x (T-25)]

Typically alpha = 0.004 to 0.006 /C for SiC
(Significantly better than Si IGBT where alpha ~ 0.02)

Switching losses:
P_sw = 0.5 x f_sw x Vds x Id x (tr + tf)

Where:
- tr = rise time ~ Qg / Ig(on)
- tf = fall time ~ Qg / Ig(off)

More practical via energies:
P_sw = f_sw x (Eon + Eoff)

SiC typical values (vs IGBT):
- Eon: 0.3 mJ vs 15 mJ (50x less)
- Eoff: 0.2 mJ vs 12 mJ (60x less)

Example (150 kW, 800V, 200A, 50 kHz):
Rds(on) @ 125C = 16 mohm x 1.5 = 24 mohm
P_cond = (200 x 0.707)^2 x 0.024 = 480 W
P_sw = 50000 x (0.3 + 0.2) x 10^-3 = 25 W
P_total = 505 W

Comparison with IGBT @ 16 kHz:
IGBT: 423 W @ 16 kHz
SiC:  505 W @ 50 kHz

At same frequency (16 kHz):
SiC P_sw = 16000 x 0.5 x 10^-3 = 8 W
SiC P_total = 480 + 8 = 488 W (similar to IGBT)

BUT: SiC can operate at 50+ kHz
-> Smaller magnetics, smaller filter
-> Overall smaller and lighter system
```

### 2.5 SiC Challenges and Solutions

```
Problem 1: Gate Oxide Reliability
-----------------------------------
Cause: Defects at SiC/SiO2 interface
Symptom: Vth drift, threshold instability

Solutions:
- Use Vgs = +15V/-4V (not +20V/-5V)
- Avoid Vgs > 18V
- Soft turn-on to reduce dV/dt

Problem 2: Parallel Operation
-----------------------------------
Cause: Negative temperature coefficient of Rds(on)
       at low currents

Solutions:
- Device matching (+/-5% Vth)
- Symmetric PCB layout
- Gate resistors for each device
- Derating (80% of nominal current)

Problem 3: Short Circuit Capability
-----------------------------------
SiC: 2-5 us vs IGBT: 10+ us

Solutions:
- Fast desaturation protection (<1 us)
- Active Miller Clamp
- Soft turn-off sequence

Problem 4: Cost
-----------------------------------
SiC: ~$0.30/A vs IGBT: ~$0.10/A

Trend: 15-20% annual reduction
Projection: Parity 2026-2028
```

## 3. Gallium Nitride (GaN)

### 3.1 GaN vs SiC Positioning

```
Application Space:

Power (kW)
    |
 500+-------------------------------
    |                    | SiC     |
 200+-------------------+---------+
    |         | SiC     | SiC/Si  |
 100+---------+---------+---------+
    |   GaN   | SiC/GaN |   Si    |
  50+---------+---------+---------+
    |   GaN   |   GaN   |   Si    |
  10+---------+---------+---------+
    |   GaN   |   GaN   |   Si    |
    +---------+---------+---------+--> Voltage (V)
         400     650     1200

For EV chargers (>50 kW):
- 400V systems: GaN or SiC
- 800V systems: SiC dominates
- >100 kW: SiC preferred
```

### 3.2 GaN HEMT Structure

```
Enhancement-mode GaN HEMT:

         S          G          D
         |          |          |
    +----+----+-----+-----+----+----+
    |   n+    |   p-GaN   |   n+    |
    |         |   (gate)  |         |
    |     ----+-----------+----     |
    |         AlGaN barrier         |
    |     =====================     | <- 2DEG
    |         GaN buffer            |
    |                               |
    |         Si substrate          |
    +-------------------------------+

2DEG (Two-Dimensional Electron Gas):
- High electron mobility
- Low Rds(on) without drift region
- Lateral structure (surface mount)
```

### 3.3 GaN Manufacturers for EV Chargers

#### GaN Systems

```
GS66516T (650V, Top-cooled):
- Vds: 650 V
- Rds(on): 25 mohm
- Id: 60 A
- Package: GaNPX (SMD)
- Reverse conduction: Yes (no body diode)

GS-EVB-HB-66508B-ON (Eval Board):
- Half-bridge 650V/30A
- Includes gate driver
- For 10-20 kW phase development
```

#### Efficient Power Conversion (EPC)

```
EPC2206 (80V class - for DC/DC):
- Vds: 80 V
- Rds(on): 1.8 mohm
- Id: 90 A
- Chip-scale package

EPC2218 (100V):
- For low-voltage DC/DC stages
- Ideal for LLC secondaries

Note: EPC focused on <200V
For AC/DC stage, 650V+ devices needed
```

#### Navitas

```
GaNFast NV6128 (650V):
- Integrated: GaN + driver
- Half-bridge in one package
- Simplified design
- For OBC (On-Board Charger) applications

Note: Currently up to ~10 kW
Not recommended for >50 kW DC chargers
```

### 3.4 GaN Application in EV Chargers

```
Where GaN makes sense:

1. On-Board Charger (OBC) - 7-22 kW
   OK Critical size/weight
   OK 400V systems dominant
   OK GaN @ 500 kHz enables compactness

2. DC/DC Converter in vehicle
   OK 400V -> 12V/48V
   OK High frequency for small size

3. Bidirectional V2G chargers <20 kW
   OK Residential application
   OK Premium segment

Where SiC dominates:

1. DC Fast Charging >50 kW
   OK 1200V class needed
   OK High currents (>200A)
   OK GaN 650V doesn't cover 800V architectures

2. Pantograph systems
   OK Extreme power (>300 kW)
   OK Robustness more important than efficiency
```

## 4. Diode Technologies

### 4.1 Si Fast Recovery Diode

```
Characteristics:
- Vrrm: up to 1200V
- Trr: 50-200 ns
- Qrr: high (causes losses)
- Cost: lowest

Application:
- Budget chargers
- Low switching frequency (<20 kHz)
- Snubber diodes
```

### 4.2 SiC Schottky Diode

```
Advantages vs Si FRD:
- Zero reverse recovery
- No Qrr losses
- Stable over temperature
- Positive temp coefficient of Vf

Key products:

Wolfspeed C4D20120D:
- Vrrm: 1200 V
- If: 20 A
- Vf: 1.5 V @ 20A
- Qc: 40 nC

ROHM SCS220AM:
- Vrrm: 650 V
- If: 20 A
- Vf: 1.35 V
- AEC-Q101 qualified

Infineon IDH16G65C6:
- Vrrm: 650 V
- If: 16 A
- Vf: 1.5 V
- Merged PiN Schottky (MPS)
```

### 4.3 SiC vs Si Diode in Vienna Rectifier

```
Impact on performance:

With Si FRD (Trr = 100ns, Qrr = 2uC):
                     +------+
  Current -----------|      |----------
                     |      |
                     |      |  Reverse
                     |      |  recovery
                     +--+---+
                        |
                        v Loss

With SiC Schottky (Trr ~ 0):
                     +------+
  Current -----------|      |----------
                     |      |
                     +------+
                     No reverse recovery

Practical result for 50 kW Vienna:
- Si FRD @ 50 kHz: 150 W diode losses
- SiC Schottky @ 50 kHz: 25 W diode losses
- Savings: 125 W x 6 diodes = 750 W!
```

## 5. Modular Power Blocks

### 5.1 Integrated Power Modules

```
Advantages of integrated modules:
1. Optimized layout (minimal parasitics)
2. Matched components
3. Integrated protection
4. Simpler cooling
5. Certified behavior

Disadvantages:
1. Less flexibility
2. Lead time issues
3. Higher cost per W
4. Harder replacement
```

### 5.2 Infineon FF-Series for Chargers

```
FF8MR12W2M1H_B11 (CoolSiC Easy 1B):

+--------------------------------------+
|  +---------------------------------+ |
|  |        High Side MOSFET         | |
|  |   Rds(on) = 8 mohm, Id = 480A   | |
|  +---------------------------------+ |
|  |         AC Terminal             | |
|  +---------------------------------+ |
|  |        Low Side MOSFET          | |
|  |   Rds(on) = 8 mohm, Id = 480A   | |
|  +---------------------------------+ |
|                                      |
|   DC+  DC-  AC  NTC                  |
+---+----+----+---+--------------------+
    |    |    |   |

Thermal characteristics:
- Rth(j-c): 0.12 K/W per switch
- Tjmax: 175C
- Footprint: 34mm x 62mm
```

### 5.3 Wolfspeed XM3 Platform

```
CAB450M12XM3:
+-------------------------------------+
|  Specification        | Value       |
+-----------------------+-------------+
|  Topology             | Half-bridge |
|  Vds                  | 1200 V      |
|  Rds(on) @ 25C        | 4.5 mohm    |
|  Id continuous        | 450 A       |
|  Id peak (1ms)        | 850 A       |
|  Rth(j-c)             | 0.09 K/W    |
|  Creepage             | 5 mm        |
|  Package              | 62mm        |
+-------------------------------------+

Available gate drivers:
- CGD12HBXMP (Wolfspeed)
- 2SP0215T2A0-12 (Power Integrations)
- SKYPER 42LJ (Semikron)
```

## 6. Semiconductor Selection for EV Charger

### 6.1 Decision Matrix

```
Selection criteria (weighted):

                    | Weight | IGBT | SiC | Hybrid
--------------------+--------+------+-----+--------
Efficiency          |   25%  |  3   |  5  |   4
Power density       |   20%  |  2   |  5  |   3
Component cost      |   20%  |  5   |  2  |   3
Reliability (proven)|   15%  |  5   |  3  |   4
Availability        |   10%  |  5   |  3  |   4
Design complexity   |   10%  |  4   |  2  |   3
--------------------+--------+------+-----+--------
TOTAL               |  100%  | 3.65 | 3.5 | 3.45

Result: Depends on priorities!

For EXPO 2027 (fast development, reliability):
-> IGBT or Hybrid recommended

For premium product (efficiency):
-> Full SiC recommended
```

### 6.2 Recommended Configuration by Power

```
50 kW DC Charger:
+-- PFC Stage: Vienna Rectifier
|   +-- Switches: IGBT 1200V/75A x 6
|   |   +-- Infineon IKW75N120CH3
|   +-- Diode: SiC Schottky 1200V/20A x 6
|       +-- Wolfspeed C4D20120D
|
+-- DC/DC Stage: LLC + Full Bridge
    +-- Primary: IGBT 1200V/150A x 4
    |   +-- Infineon IKW150N120H3
    +-- Secondary: SiC Schottky 650V/60A x 4
        +-- ROHM SCS260AM

150 kW DC Charger:
+-- PFC Stage: AFE (Active Front End)
|   +-- SiC Module 1200V/300A x 3
|       +-- Wolfspeed CAB450M12XM3
|
+-- DC/DC Stage: DAB
    +-- Primary: SiC Module 1200V/300A x 2
    +-- Secondary: SiC Module 1200V/300A x 2

300+ kW Pantograph:
+-- Modular approach: 3-4 x 100kW modules
+-- Each module: Full SiC
+-- Parallel DC output with load sharing
```

### 6.3 Bill of Materials - Semiconductors (150 kW)

```
+--------------------------------------------------------+
| Component               | Qty | Unit price |   Total   |
+-------------------------+-----+-----------+-----------+
| SiC Module 1200V/450A   |  6  |   EUR450  |  EUR2,700 |
| (Wolfspeed CAB450M12XM3)|     |           |           |
+-------------------------+-----+-----------+-----------+
| SiC Gate Driver         |  6  |   EUR120  |   EUR720  |
| (CGD12HBXMP)            |     |           |           |
+-------------------------+-----+-----------+-----------+
| SiC Schottky 1200V/40A  |  12 |   EUR25   |   EUR300  |
| (C4D40120D)             |     |           |           |
+-------------------------+-----+-----------+-----------+
| TVS/Protection          | set |   EUR150  |   EUR150  |
+-------------------------+-----+-----------+-----------+
| NTC/Temperature Sensors |  12 |   EUR5    |   EUR60   |
+-------------------------+-----+-----------+-----------+
| TOTAL SEMICONDUCTORS    |     |           |  EUR3,930 |
+--------------------------------------------------------+

IGBT alternative (lower efficiency):
- IGBT Modules (x6): EUR1,800
- Fast Recovery Diode: EUR200
- Gate Drivers: EUR480
- TOTAL: EUR2,600 (34% less)

Trade-off:
SiC: +EUR1,330 but -2% losses = 3 kW savings
@ EUR0.15/kWh, 8h/day, 300 days = EUR1,080/year savings
ROI: 1.2 years
```

## 7. Testing and Characterization

### 7.1 Static Testing

```
Parameters to measure:

1. Vce(sat) / Rds(on) vs Temperature
   +--------------------------------+
   | Test Setup:                    |
   | - Curve tracer (Keysight B1505)|
   | - Thermal chamber (-40 to 175C)|
   | - Pulsed measurement (<1ms)    |
   +--------------------------------+

2. Gate Characteristics
   - Vth (threshold voltage)
   - gm (transconductance)
   - Ciss, Coss, Crss vs Vds

3. Breakdown Voltage
   - Vces/Vds @ Ic/Id = 1mA
   - Leakage current @ rated voltage

4. Thermal Impedance
   - Zth(j-c) transient curve
   - Rth junction to case
```

### 7.2 Dynamic Testing

```
Double Pulse Test Setup:

    Vdc --+----------+------------
          |          |
         =|= Cdc    +-+
          |         | | Load
          |         |L| Inductor
          |         +-+
          |          |
          +----+-----+
              +-+    |
         DUT  | | <--+-- Gate Driver
              +-+    |
               |     |
    GND -------+-----+-------------

Measured parameters:
- tr, tf (rise/fall time)
- td(on), td(off) (delay time)
- Eon, Eoff (switching energy)
- di/dt, dv/dt
- Overshoot, ringing

Test conditions (typical):
- Vdc = 800V (for 1200V devices)
- Id = rated current
- Tj = 25C, 125C, 150C
- Rg = 0ohm, 10ohm, 20ohm (for Rg optimization)
```

### 7.3 Reliability and Lifetime

```
Accelerated Life Testing:

1. Power Cycling Test
   +----------------------------------+
   | Ton: 2s heating                  |
   | Toff: 2s cooling                 |
   | DTj: 100C                        |
   | Cycles: >100,000 for qualification|
   +----------------------------------+

2. Thermal Cycling
   - -40C to +125C
   - 1000 cycles minimum

3. High Temperature Reverse Bias (HTRB)
   - Vds = 80% rated, Tj = 150C
   - 1000 hours

4. High Temperature Gate Bias (HTGB)
   - Vgs = max rated
   - 1000 hours @ 150C

5. Humidity Testing (H3TRB)
   - 85C, 85% RH
   - Vds = 80% rated
   - 1000 hours

MTBF Calculation:
For SiC module in 150 kW charger:
- Operating hours: 6000 h/year
- Tj average: 100C
- Load cycles: 50,000/year
- Expected MTBF: 200,000+ hours
- Expected lifetime: 15+ years
```

## 8. Emerging Technologies

### 8.1 GaN on SiC Substrate

```
GaN-on-SiC Advantages:
- Better thermal conductivity (SiC substrate)
- Higher power density
- Potential for >1000V classes

Status: R&D phase
Availability: 2026+
```

### 8.2 Diamond Semiconductors

```
Ultra-Wide Bandgap:
- Bandgap: 5.5 eV (vs 3.3 SiC)
- Critical field: 10 MV/cm
- Thermal conductivity: 22 W/cm K

Status: Laboratory
Commercialization: 2030+
```

### 8.3 Vertical GaN

```
GaN-on-GaN:
- Eliminates Si substrate limitations
- Enables >1200V classes
- Vertical structure like SiC

Status: Early production
Availability: 2025-2026
```

## 9. Conclusion and Recommendations

### For EXPO 2027 Project:

```
Strategy 1: Conservative approach
- PFC: IGBT + SiC diodes (Hybrid)
- DC/DC: IGBT + SiC Schottky
- Advantage: Proven reliability
- Risk: Low

Strategy 2: Performance approach
- Full SiC design
- Higher efficiency, smaller size
- Advantage: Premium positioning
- Risk: Medium (supply chain)

Strategy 3: Platform approach
- Design for both options
- Common gate driver, layout
- Swap IGBT <-> SiC modules
- Advantage: Flexibility
- Risk: Higher initial development cost

RECOMMENDATION: Strategy 3
- Start with IGBT for fast validation
- Upgrade to SiC for volume production
- Keep both options for different segments
```
