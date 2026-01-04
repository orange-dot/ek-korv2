# Passive Components for EV Chargers

## 1. Passive Components Overview

### 1.1 Role in Power Electronics

```
Block Diagram of 150 kW Charger - Passive Components:

    AC INPUT                                          DC OUTPUT
       |                                                |
       |    +-----+    +-----+    +-----+    +-----+   |
       |    | EMI |    | PFC |    |     |    | DC/ |   |
    ---+---->|Filter|---->|Boost|---->|DC   |---->| DC  |---+--->
       |    | L,C |    |L_pfc|    |Link |    |L,Tr |   |
       |    +-----+    +-----+    | C   |    +-----+   |
       |       ^          ^      +-----+       ^       |
       |       |          |          ^         |       |
       |   Inductors   Inductors  Capaci-  Transformer
       |   Common mode  PFC       tors     + Lr (LLC)
       |   + Diff mode

Passive Components Cost Distribution:
+------------------------------------+
| Component         | % of total cost|
+-------------------+----------------+
| DC Link capac.    |     25%        |
| PFC inductor      |     20%        |
| Transformer       |     30%        |
| EMI filter        |     15%        |
| Output filter     |     10%        |
+------------------------------------+
Total passives: ~25-30% of charger cost
```

## 2. Magnetic Components

### 2.1 PFC Boost Inductor

```
PFC Inductor Function:

                     D
    +----------------+----------------+
    |                                 |
    |         L_pfc                   |
    +-------~~~~~~-------+------------+
    |                    |            |
  V_ac                  -+- Q        -+- C_dc
    |                   -+- (SiC)    -+-
    |                    |            |
    +--------------------+------------+

Functions:
1. Limits switching di/dt
2. Enables boost function
3. Stores energy for continuous transfer
4. Filters HF components

Key parameters:

| Charger Power | L value    | I_rms | DI (ripple) |
+---------------+------------+-------+-------------+
| 50 kW         | 150-300 uH | 80 A  | 20% I_peak  |
| 150 kW        | 80-150 uH  | 220 A | 20% I_peak  |
| 350 kW        | 50-100 uH  | 500 A | 20% I_peak  |
```

#### PFC Inductor Calculation

```
For CCM (Continuous Conduction Mode):

L_min = V_in(peak) x D_max x (1 - D_max) / (2 x f_sw x DI_L)

Where:
- V_in(peak) = sqrt(2) x V_in(rms) = sqrt(2) x 400V = 566V
- D_max = 1 - V_in(min) / V_dc = 1 - 320/800 = 0.6
- f_sw = 65 kHz (SiC switching frequency)
- DI_L = 20% x I_L(peak) = 0.2 x 300A = 60A

L_min = 566 x 0.6 x 0.4 / (2 x 65000 x 60)
L_min = 135.8 / 7,800,000 = 17.4 uH

For practical design, use 2-3x margin:
L_design = 50-100 uH

Peak Energy:
E = 0.5 x L x I_peak^2
E = 0.5 x 100uH x (350A)^2 = 6.125 J

RMS Current in inductor:
I_rms ~ I_dc / sqrt(1-D) = 190A / sqrt(0.4) = 300 A
```

#### Core Materials

```
Core Material Comparison:

| Material      | ur    | Bsat  | Core Loss | Temp  | Cost  |
+---------------+-------+-------+-----------+-------+-------+
| Ferrite (3C95)| 3000  | 0.53T | Low       | 200C  | $     |
| Amorphous     | ~150k | 1.56T | Very low  | 150C  | $$$   |
| Nanocrystal   | ~80k  | 1.2T  | Low       | 120C  | $$$$  |
| Powder (MPP)  | 14-350| 0.8T  | Medium    | 200C  | $$    |
| Iron Powder   | 10-100| 1.0T  | High      | 125C  | $     |
| Silicon Steel | ~4000 | 1.8T  | High(50Hz)| 200C  | $     |

For EV chargers (50-100 kHz):
Recommended: Amorphous or Powder core

Why amorphous metal for high current:
1. High B_sat -> smaller core
2. Distributed air gap in powder cores
3. Less fringing losses
4. Better thermal behavior
```

#### PFC Inductor Construction

```
Typical constructions:

1. Toroidal (Powder Core):

        +---------------+
       /                 \
      |  +===========+    |
      |  ||  Powder  ||    |
      |  ||   Core   ||    |
      |  +===========+    |
       \                 /
        +---------------+
              |||||
           Litz wire
           windings

   Advantages:
   - Distributed gap = less EMI
   - Soft saturation
   - Self-supporting construction

2. EE/EI with Air Gap:

     +-------------------------+
     |███████████████████████|
     |██    ||======||    ██|
     |██    || COIL ||    ██|
     |██    ||======||    ██|
     |██____||      ||____██|
     |████  gap     ████|
     |██^^^^||      ||^^^^██|
     |██    ||======||    ██|
     |██    || COIL ||    ██|
     |██    ||======||    ██|
     |███████████████████████|
     +-------------------------+

   Advantages:
   - Easy gap adjustment
   - Standard sizes
   - Better thermal management

Air Gap Calculation:
lg = u0 x N^2 x Ae / L

For L=100uH, N=20, Ae=800mm^2:
lg = 4pi x 10^-7 x 400 x 800 x 10^-6 / 100 x 10^-6
lg = 4.02 mm
```

#### Wire Selection

```
Skin Effect at high frequencies:

Skin depth: d = sqrt(rho / (pi x f x u))

For copper @ 100 kHz, 100C:
d = sqrt(2.1 x 10^-8 / (pi x 100000 x 4pi x 10^-7))
d = 0.23 mm

Rule: Wire radius <= 2 x d
-> Max wire diameter ~ 0.9 mm @ 100 kHz

Solutions for high current:

1. Litz Wire:
   - Many thin insulated wires braided together
   - Each wire < 2 x d
   - Typically 100-2000 strands

   Example for 300A RMS:
   - J = 5 A/mm^2 (with cooling)
   - A_cu = 300/5 = 60 mm^2
   - Litz: 1050 x AWG40 (0.08mm)

2. Foil Winding:
   - Copper foil thickness < d
   - Good for planar inductors
   - Easier cooling

3. Parallel Round Wire:
   - Multiple parallel wires
   - Simpler than Litz
   - Higher proximity effect
```

### 2.2 LLC Resonant Inductor (Lr)

```
LLC Tank Circuit:

    +-------+    +-------+    +-------+
    |       |    |       |    |       |
----| Lr    |----| Cr    |----| Lm    |----
    | ~~~~  |    | =|=   |    | ~~~~  |
    +-------+    +-------+    +-------+

Lr = Resonant inductor (series)
Cr = Resonant capacitor
Lm = Magnetizing inductance (parallel)

Resonant frequency:
fr = 1 / (2pi x sqrt(Lr x Cr))

Characteristic ratios:
Ln = Lm / Lr (typically 3-7)
Qe = sqrt(Lr/Cr) / Rac

Calculation for 50 kW LLC:

Specifications:
- P = 50 kW
- V_in = 800V DC
- V_out = 200-500V (wide range for batteries)
- f_r = 100 kHz

Lr = V_in^2 / (8 x f_r x P x k)
   = 800^2 / (8 x 100000 x 50000 x 1.1)
   = 640000 / 44 x 10^9
   = 14.5 uH

Cr = 1 / ((2pi x f_r)^2 x Lr)
   = 1 / (39.5 x 10^10 x 14.5 x 10^-6)
   = 175 nF

Lm = Ln x Lr = 5 x 14.5 = 72.5 uH
```

#### Lr Construction

```
Requirements for Lr:

1. Precise value (+/-3%)
2. Low DC resistance
3. Low AC resistance (skin/proximity)
4. Thermal stability
5. Linearity (no saturation)

Construction options:

1. Discrete Air-Core:
   +----------------------+
   |                      |
   |    +----------+      |
   |    | SOLENOID |      |
   |    | ~~~~~~   |      |
   |    +----------+      |
   |     (air core)       |
   +----------------------+

   L = u0 x N^2 x A / l

   Advantages: Linearity, no core loss
   Disadvantages: Large, EMI source

2. Gapped Ferrite:
   +----------------------+
   |  ████████████████    |
   |  ██    ||    ██     |
   |  ██  WINDING  ██     |
   |  ██    ||    ██     |
   |  ██___     ___██     |
   |    gap   gap         |
   |  ██^^^     ^^^██     |
   |  ████████████████    |
   +----------------------+

   Advantages: Compact
   Disadvantages: Gap loss, fringing

3. Integrated in Transformer:
   - Lr = Leakage inductance
   - Controlled via construction
   - Saves space and cost
```

### 2.3 High-Frequency Transformer

```
LLC Transformer Design:

          Primary          Secondary
            |                  |
     +------+------+    +------+------+
     |             |    |             |
     |   Np turns  |    |   Ns turns  |
     |   ~~~~~~~   |    |   ~~~~~~~   |
     |             |    |             |
     +-------------+    +-------------+
            |                  |
            +------ CORE ------+

Turns ratio:
n = Np / Ns = V_in / V_out

For 800V -> 400V:
n = 800 / 400 = 2:1

Actual ratio considering duty cycle and topology:
n = V_in / (2 x V_out) = 800 / 800 = 1:1 (full bridge LLC)

or for half-bridge:
n = V_in / (4 x V_out) = 800 / 1600 = 0.5:1
```

#### Area Product Method

```
Core size calculation:

Ap = Aw x Ae = (P x 10^4) / (Kf x Ku x Bmax x fs x J)

Where:
- Ap = Area product (cm^4)
- Aw = Window area (cm^2)
- Ae = Core cross-section (cm^2)
- P = Power (W) = 50,000W
- Kf = Form factor = 4.44 (sine), 4.0 (square)
- Ku = Window utilization = 0.4
- Bmax = Max flux density = 0.25 T (ferrite @ 100kHz)
- fs = Frequency = 100,000 Hz
- J = Current density = 5 A/mm^2

Ap = (50000 x 10^4) / (4 x 0.4 x 0.25 x 100000 x 500)
Ap = 5 x 10^8 / 2 x 10^7 = 25 cm^4

Core selection (ETD/EE series):

| Core      | Ae (mm^2) | Aw (mm^2) | Ap (cm^4) |
+-----------+-----------+-----------+-----------+
| ETD59     | 368       | 368       | 13.5      |
| E71/33/32 | 683       | 485       | 33.1      | OK
| E80/38/20 | 514       | 532       | 27.3      | OK
| U93/76/30 | 864       | 780       | 67.4      |

For 50 kW: E71 or larger
For 150 kW: Multiple transformers in parallel or custom
```

#### Winding Arrangement

```
Interleaved Winding for low leakage:

        +-----------------------------+
Layer 5 |         S2                  |
        +-----------------------------+
Layer 4 |         P                   |
        +-----------------------------+
Layer 3 |         S1                  | Interleaved
        +-----------------------------+
Layer 2 |         P                   |
        +-----------------------------+
Layer 1 |         S2                  |
        +-----------------------------+

P-S-P-S-P arrangement:
- Reduces proximity effect
- Low leakage inductance
- Better coupling

Sandwich Winding for controlled leakage:

        +-----------------------------+
Layer 5 |         P (all)             |
        +-----------------------------+
Layer 4 |         Isolation           |
        +-----------------------------+
Layer 3 |         S1                  | Controlled
        +-----------------------------+ Leakage
Layer 2 |         Isolation           |
        +-----------------------------+
Layer 1 |         S2                  |
        +-----------------------------+

- Leakage as Lr for LLC
- Simplifies design
- Requires careful control
```

#### Transformer Losses

```
1. Core Losses (Steinmetz):

Pv = k x f^alpha x B^beta   (mW/cm^3)

For 3C95 ferrite @ 100 kHz, 0.2T:
Pv = 1.6 x 100^1.8 x 0.2^2.5
Pv ~ 180 mW/cm^3

For Ve = 200 cm^3:
P_core = 180 x 200 / 1000 = 36 W

2. Copper Losses:

P_cu = I^2_rms x R_ac

R_ac = R_dc x Fr (Fr = AC/DC resistance ratio)

Doerr Formula for Fr:
Fr ~ 1 + (m^2 - 1/3) x (h/d)^4 / 45

Where:
- m = number of layers
- h = conductor thickness
- d = skin depth

For Litz wire, Fr ~ 1.5-2.0

3. Total losses:

P_total = P_core + P_cu_primary + P_cu_secondary

Transformer efficiency:
eta = P_out / (P_out + P_total)

For well-designed 50 kW transformer:
P_total ~ 250-400 W
eta ~ 99.2-99.5%
```

### 2.4 EMI Filter Inductors

```
Common Mode Choke:

         +------------------------+
   L ----|    ~~~~~~             |
         |       ||               |
   N ----|    ~~~~~~             |---- Load
         |       ||               |
  PE ----|    ~~~~~~             |
         +------------------------+
              Toroidal core

Operating principle:
- Differential mode: Magnetic flux cancels
- Common mode: Flux adds -> high impedance

Typical values for 150 kW:
- L_CM = 1-5 mH @ CM
- L_DM = 5-20 uH @ DM (leakage)
- I_rated = 250-400 A

Core materials for CM choke:
- Nanocrystalline: Best performance, expensive
- Amorphous: Excellent compromise
- Mn-Zn ferrite: Economical, lower u

Differential Mode Inductor:

   L --~~~~~~--+--~~~~~~-- Load
               |
              =|= C_x
               |
   N ----------+---------- Load

- Smaller inductance (50-200 uH)
- Powder core (doesn't saturate)
- High DC current capability
```

## 3. Capacitors

### 3.1 DC Link Capacitors

```
DC Link Function:

    Rectifier                    Inverter
        |                            |
        |     +--------------+       |
        +-----|              |-------+
        |     |   C_dc       |       |
        |     |   DC LINK    |       |
        |     |              |       |
        +-----|   =======    |-------+
        |     |              |       |
        |     +--------------+       |
        |                            |

Functions:
1. Energy buffer between stages
2. Reduces voltage ripple
3. Absorbs switching transients
4. Current source for fast load changes

Key parameters:
- Capacitance (uF)
- Voltage rating (V)
- ESR (mohm)
- Ripple current capability (A_rms)
- Lifetime (hours @ temp)
```

#### DC Link Capacitance Calculation

```
Method 1: Ripple Voltage

C = I_out / (f x DV)

For 150 kW, 800V, DV = 5%, f = 100 kHz:
I_out = 150000 / 800 = 187.5 A
DV = 0.05 x 800 = 40V

C = 187.5 / (100000 x 40) = 47 uF (minimum)

Method 2: Energy Storage (Hold-up time)

E = 0.5 x C x V^2
C = 2 x P x t_hold / (V_max^2 - V_min^2)

For t_hold = 10 ms, V_max = 850V, V_min = 700V:
C = 2 x 150000 x 0.01 / (722500 - 490000)
C = 3000 / 232500 = 12.9 mF = 12,900 uF

Method 3: Ripple Current

I_ripple = sqrt(I_out^2 x D x (1-D))

For D = 0.5:
I_ripple = 187.5 x sqrt(0.25) = 93.75 A_rms

Required capacity for ripple:
-> Determine number of capacitors according to I_rms rating

Practical design (150 kW):
- Capacitance: 2000-4000 uF
- Ripple handling: 100-150 A_rms
- Typically: 4-8 capacitors in parallel
```

#### DC Link Capacitor Types

```
1. Aluminum Electrolytic:

   +--------------------------------------+
   |  + High capacitance per volume       |
   |  + Low cost                          |
   |  - Limited lifetime                  |
   |  - High ESR                          |
   |  - Temperature sensitive             |
   |  - Polarized                         |
   +--------------------------------------+

   Lifetime:
   L = L0 x 2^((T0-T)/10)

   Typical products:
   - EPCOS B43456 (450V, 4700uF, 85C)
   - Nichicon LGU (450V, 3300uF, 105C)

2. Film Capacitors (Polypropylene):

   +--------------------------------------+
   |  + Low ESR                           |
   |  + High ripple current               |
   |  + Long lifetime (>100,000h)         |
   |  + Non-polarized                     |
   |  - Lower capacitance per volume      |
   |  - Higher cost                       |
   +--------------------------------------+

   Typical products:
   - EPCOS B32778 (900V DC, 200uF)
   - Vishay MKP1848 (900V DC, 150uF)
   - TDK B32776 (800V DC, 180uF)

3. Hybrid (Film + Electrolytic):

   +--------------------------------------------+
   |  Film capacitors for HF ripple filtering   |
   |  Electrolytic for bulk energy storage      |
   |  Best compromise for EV chargers           |
   +--------------------------------------------+
```

#### DC Link Configuration for 150 kW

```
Recommended configuration:

    DC+ ----+------------+------------+------ Inv DC+
            |            |            |
          +-+-+        +-+-+        +-+-+
          |C1 |        |C2 |        |C3 |
          |   |Film    |   |Film    |   |Film
          |450|        |450|        |450|
          |uF |        |uF |        |uF |
          +-+-+        +-+-+        +-+-+
            |            |            |
    MID ----+------------+------------+------
            |            |            |
          +-+-+        +-+-+        +-+-+
          |C4 |        |C5 |        |C6 |
          |   |Film    |   |Film    |   |Film
          |450|        |450|        |450|
          |uF |        |uF |        |uF |
          +-+-+        +-+-+        +-+-+
            |            |            |
    DC- ----+------------+------------+------ Inv DC-

Specifications:
- 6x Film capacitors 900V/450uF
- Total: 1350 uF (series = 450uF, parallel x3)
- ESR: < 5 mohm per capacitor
- I_ripple: 60A per cap = 180A total
- Lifetime: >100,000 hours

Cost estimate:
6 x EUR80 = EUR480 for DC link capacitors
```

### 3.2 Resonant Capacitors (Cr for LLC)

```
Requirements for LLC resonant capacitor:

1. Low ESR (to avoid loss)
2. Low ESL (for clean resonance)
3. Capacitance stability with temperature
4. High ripple current rating
5. Longevity

Cr calculation (from section 2.2):
Cr = 175 nF for 50 kW LLC

Capacitor type: Film (PP or PET)

| Parameter        | Requirement   |
+------------------+---------------+
| Capacitance      | 150-200 nF    |
| Tolerance        | +/-5%         |
| Voltage          | 800V DC min   |
| ESR              | < 10 mohm     |
| I_ripple         | > 50 A_rms    |
| Temp stability   | < 5% over range|

Manufacturer options:
- WIMA FKP1 (1000V DC, 150nF)
- Vishay MKP385 (1000V DC, 220nF)
- Cornell Dubilier 940C (600V AC / 1200V DC)

Series-parallel combination:
For 175 nF @ 800V, I_rms = 60A:
- 4x 47nF/600V in parallel (for capacitance)
- or 2x 330nF/500V in series (for voltage)
```

### 3.3 Snubber and Clamp Capacitors

```
RCD Snubber for IGBT:

                     R_snub
         +------------||------------+
         |                         |
         |    D_snub               |
         +----<|----+              |
         |          |              |
         |        +-+-+            |
  DC+ ---+        |C  |            +--- DC-
         |        |snub            |
         |        +-+-+            |
         |          |              |
         +----------+------+-------+
                    |
              IGBT/MOSFET

Calculation:

C_snub = I x t_fall / (2 x DV)

For I = 300A, t_fall = 100ns, DV = 100V:
C_snub = 300 x 100 x 10^-9 / 200 = 150 nF

R_snub = t_on / (3 x C_snub)

For t_on = 5us:
R_snub = 5 x 10^-6 / (3 x 150 x 10^-9) = 11 ohm

Capacitor type:
- Ceramic (X7R, C0G) for small values
- Film for larger values
- Important: Low ESL!

Products:
- TDK C3225X7S (1kV, 100nF, MLCC)
- KEMET C1812 (500V, 220nF, ceramic)
```

### 3.4 EMI Filter Capacitors

```
X and Y Capacitors in EMI Filter:

    L ---+--~~~~-+--------+--------- Load L
         |       |        |
        =|=Cx1  =|=Cx2   =|=Cx3
         |       |        |
    N ---+--~~~~-+--------+--------- Load N
         |       |        |
        =|=Cy   =|=Cy    =|=Cy
         |       |        |
    PE --+-------+--------+--------- PE

X capacitors (Line-to-Line):
- Class X1: <=4 kV impulse
- Class X2: <=2.5 kV impulse
- Typically: 0.1-4.7 uF
- Self-healing PP film

Y capacitors (Line-to-Ground):
- Class Y1: <=8 kV impulse
- Class Y2: <=5 kV impulse
- Limited by capacitance (leakage safety)
- Typically: 2.2-22 nF
- Ceramic or film

Safety requirements:
- Y capacitor max: 4.7 nF per phase (IEC 61851)
- Total leakage current < 3.5 mA

Manufacturers for safety capacitors:
- Vishay (MKP X2, ceramic Y)
- EPCOS/TDK (B32 series)
- Murata
```

## 4. Specification and Procurement

### 4.1 Bill of Materials - Passives (150 kW)

```
+-------------------------------------------------------------+
| MAGNETIC COMPONENTS                                          |
+--------------------------+-----+------------+---------------+
| Component                | Qty | Unit price |    Total      |
+--------------------------+-----+------------+---------------+
| PFC Inductor 100uH/300A  |  3  |    EUR150  |     EUR450    |
| (Amorphous core, Litz)   |     |            |               |
+--------------------------+-----+------------+---------------+
| LLC Transformer 50kW     |  3  |    EUR200  |     EUR600    |
| (Ferrite E71, Litz)      |     |            |               |
+--------------------------+-----+------------+---------------+
| LLC Inductor Lr 15uH     |  3  |    EUR50   |     EUR150    |
| (Gapped ferrite)         |     |            |               |
+--------------------------+-----+------------+---------------+
| CM Choke 3mH/250A        |  1  |    EUR120  |     EUR120    |
| (Nanocrystalline core)   |     |            |               |
+--------------------------+-----+------------+---------------+
| DM Inductor 100uH/250A   |  2  |    EUR60   |     EUR120    |
| (Powder core)            |     |            |               |
+--------------------------+-----+------------+---------------+
| SUBTOTAL MAGNETICS                         |    EUR1,440   |
+--------------------------------------------+---------------+

+-------------------------------------------------------------+
| CAPACITORS                                                   |
+--------------------------+-----+------------+---------------+
| Component                | Qty | Unit price |    Total      |
+--------------------------+-----+------------+---------------+
| DC Link Film 900V/450uF  |  6  |    EUR80   |     EUR480    |
| (EPCOS B32778)           |     |            |               |
+--------------------------+-----+------------+---------------+
| LLC Resonant 1kV/180nF   |  6  |    EUR15   |     EUR90     |
| (Film PP)                |     |            |               |
+--------------------------+-----+------------+---------------+
| Snubber Ceramic 500V/220nF| 12 |    EUR5    |     EUR60     |
| (X7R MLCC)               |     |            |               |
+--------------------------+-----+------------+---------------+
| X2 Cap 310VAC/2.2uF      |  6  |    EUR4    |     EUR24     |
+--------------------------+-----+------------+---------------+
| Y2 Cap 300VAC/4.7nF      |  6  |    EUR2    |     EUR12     |
+--------------------------+-----+------------+---------------+
| Decoupling MLCC set      | set |    EUR50   |     EUR50     |
+--------------------------+-----+------------+---------------+
| SUBTOTAL CAPACITORS                        |     EUR716    |
+--------------------------------------------+---------------+

+-------------------------------------------------------------+
| TOTAL PASSIVE COMPONENTS                   |    EUR2,156   |
+--------------------------------------------+---------------+
```

### 4.2 Manufacturers and Suppliers

```
Magnetic Components:

1. Custom Magnetics:
   - Himag (China) - good quality/price
   - Coilcraft (USA) - premium
   - Pulse Electronics - standard
   - Wurth Elektronik - EU availability

2. Cores (for DIY):
   - TDK/EPCOS - ferrites
   - Hitachi Metals - amorphous
   - Magnetics Inc - powder cores
   - VAC (Vacuumschmelze) - nanocrystalline

3. Litz Wire:
   - New England Wire
   - Elektrisola
   - MWS Wire Industries

Capacitors:

1. DC Link / Film:
   - TDK/EPCOS (B32 series)
   - Vishay (MKP series)
   - Cornell Dubilier
   - KEMET (Film)

2. Electrolytic:
   - Nichicon
   - Nippon Chemi-Con
   - Rubycon
   - EPCOS

3. Ceramic (MLCC):
   - Murata
   - TDK
   - Samsung Electro-Mechanics
   - Yageo

4. Safety (X/Y):
   - Vishay
   - EPCOS
   - KEMET
   - Murata
```

### 4.3 Lead Time and Availability

```
Typical lead times:

| Component             | Lead Time  | Note               |
+-----------------------+------------+--------------------+
| Standard ferrites     | 4-8 weeks  | Stock OK           |
| Custom magnetics      | 8-16 weeks | Tooling required   |
| Film capacitors       | 6-12 weeks | Supply chain issue |
| MLCC (common)         | 2-4 weeks  | Stock OK           |
| MLCC (automotive)     | 12-20 weeks| AEC-Q200 versions  |
| DC Link (large)       | 8-14 weeks | Made to order      |

For EXPO 2027 project:
- Component ordering: Q3 2026
- Prototype magnetics: Q2 2026
- Second source required for critical items
```

## 5. Thermal and Mechanical Aspects

### 5.1 Thermal Behavior of Magnetics

```
Inductor heating:

         +-------------------------+
         |      P_core             |
         |         +               |
         |      P_copper           |
         |         =               |
         |      P_total            |
         |         |               |
         |   Rth = DT / P_total    |
         |         |               |
         |   T_hot_spot            |
         +-------------------------+

Thermal model:

T_hs = T_amb + P_total x (Rth_core + Rth_winding + Rth_case)

Typical values:
- Rth_core-to-case: 2-5 K/W
- Rth_winding-to-core: 1-3 K/W
- Rth_case-to-ambient: 5-15 K/W (natural convection)
- Rth_case-to-ambient: 1-3 K/W (forced air)

Maximum temperatures:
| Material      | T_max_operating | Derating    |
+---------------+-----------------+-------------+
| Ferrite 3C95  | 200C            | 140C        |
| Litz wire     | 180C (class H)  | 150C        |
| Amorphous     | 150C            | 120C        |
| Nanocrystal   | 120C            | 100C        |
```

### 5.2 Mounting and Vibration

```
Mechanical requirements for EV charger:

1. Vibration (IEC 60068):
   - 5-150 Hz, 1g acceleration
   - Resonance search required

2. Shock:
   - 15g, 11ms half-sine

3. Mounting magnetics:

   Option A: Epoxy potting
   +-------------------------+
   |  #####################  |
   |  ##  +-----------+  ##  |
   |  ##  | INDUCTOR  |  ##  | Epoxy
   |  ##  |   CORE    |  ##  | fill
   |  ##  +-----------+  ##  |
   |  #####################  |
   +-------------------------+

   Advantages: Thermal, mechanically robust
   Disadvantages: Not repairable, more expensive

   Option B: Bracket mount
   +------------------------------+
   |    +===============+         |
   |   =|=              =|=       |
   |   |||    CORE      |||       |
   |   |||              ||| Spring|
   |   |||   WINDING    ||| clips |
   |   |||              |||       |
   |   =|=              =|=       |
   |    +===============+         |
   +------------------------------+

   Advantages: Replaceable, cheaper
   Disadvantages: Weaker thermal contact

4. Mounting capacitors:
   - PCB mount: MLCC, small film
   - Bracket mount: DC link
   - Potting for vibration
```

## 6. Conclusion and Recommendations

```
Key Recommendations for Passive Components:

1. Magnetics:
   +-- PFC inductor: Amorphous or powder core
   +-- LLC transformer: Ferrite + integrated Lr
   +-- EMI filter: Nanocrystalline CM choke
   +-- Wire: Litz for all HF applications

2. DC Link:
   +-- Film capacitors preferred
   +-- Hybrid (film+elko) for cost optimization
   +-- Min 100,000h lifetime

3. Resonant (LLC):
   +-- PP film capacitors
   +-- Precise tolerance (+/-5%)
   +-- Low ESR/ESL

4. EMI:
   +-- Safety rated (X2, Y2 class)
   +-- Observe leakage limits
   +-- Multi-stage filtering

5. Production:
   +-- Custom magnetics: 12-16 weeks lead
   +-- Dual source for critical items
   +-- AEC-Q200 for automotive grade

6. Testing:
   +-- Impedance analyzer for magnetics
   +-- LCR meter for capacitors
   +-- Thermal imaging in operation
   +-- Vibration test mandatory
```
