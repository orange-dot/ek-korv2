# EK3 Module Detailed Design

**Document Version:** 1.0
**Date:** 2026-01-03
**Author:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia

---

## 1. Executive Summary

```
EK3 - OSNOVNE SPECIFIKACIJE
═══════════════════════════════════════════════════════════════

Naziv:          EK3 (ElektroKombinacija 3kW Module)
Snaga:          3.3 kW continuous (3.6 kW peak)
Dimenzije:      200 × 320 × 44 mm (1U half-width, telecom style)
Masa:           ~3.5 kg
Efikasnost:     >96% peak, >94% @ 50% load
Hlađenje:       Forced air (shared plenum)
Životni vek:    >50,000 hours @ rated load
Hot-swap:       Da, <1 sec electrical disconnect

PRIMARNA FUNKCIJA:
AC/DC conversion za EV charging
  Input: 3-phase 400V AC ili DC link
  Output: Adjustable DC (za battery charging)

SEKUNDARNE FUNKCIJE:
• Health monitoring (via embedded sensors + MCU)
• Communication (CAN bus)
• Distributed sparing (graceful degradation)
```

---

## 2. Electrical Design

### 2.1 Topology Options

```
OPCIJA A: AC/DC MODULE (Full Rectifier)
═══════════════════════════════════════════════════════════════

Input: 3-phase 400V AC (direktno sa grid)
Output: DC (200-500V adjustable, ili fixed 400V)

Block Diagram:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   AC      ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐   DC    │
│  INPUT    │ EMI │    │ PFC │    │DC-DC│    │OUTPUT│  OUTPUT │
│  3~400V──▶│FILTER──▶│STAGE│──▶│STAGE│──▶│FILTER│──▶400V DC│
│           └─────┘    └─────┘    └─────┘    └─────┘          │
│                         │                                    │
│                    DC Link                                   │
│                    ~650V                                     │
└─────────────────────────────────────────────────────────────┘

Pros:
• Standalone - može raditi sam
• Jednostavnija instalacija (samo AC priključak)

Cons:
• Veća kompleksnost (PFC + DC-DC)
• Manja efikasnost (više conversion stages)
• Veći EMI filter potreban


OPCIJA B: DC/DC MODULE (Samo izlazna konverzija)
═══════════════════════════════════════════════════════════════

Input: Common DC bus (650-800V DC)
Output: DC (200-500V adjustable)

Block Diagram:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   DC      ┌─────┐    ┌─────────────┐    ┌─────┐   DC       │
│  INPUT    │INPUT│    │  ISOLATED   │    │OUTPUT│  OUTPUT   │
│  650V ───▶│FILTER──▶│   DC-DC     │──▶│FILTER│──▶400V DC  │
│           └─────┘    │  (LLC/DAB)  │    └─────┘            │
│                      └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘

Pros:
• Manji modul (nema PFC)
• Veća efikasnost
• Jeftiniji

Cons:
• Zahteva centralni PFC stage (deli se)
• Centralni PFC = single point of failure


PREPORUKA: OPCIJA B (DC/DC Module)
═══════════════════════════════════════════════════════════════

Razlog:
• Modularnost je prioritet
• Centralni PFC može biti N+1 redundantan
• Manji moduli = lakši swap
• Viša gustina snage

Centralni PFC:
• Jedan veliki (30-50kW) sa redundancijom
• Ili modularni PFC (isto kao EK3, ali za AC/DC)
```

### 2.2 DC-DC Converter Topology

```
PREPORUČENA TOPOLOGIJA: LLC Resonant Converter
═══════════════════════════════════════════════════════════════

Zašto LLC:
• Soft switching (ZVS) → niska EMI, visoka efikasnost
• Može raditi sa wide output range
• Jednostavna kontrola (frequency modulation)
• Proven topology za ovu snagu

Block Diagram (LLC):
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  DC IN    ┌──────┐    ┌─────────┐    ┌──────┐    DC OUT    │
│  650V ───▶│ Half │───▶│   LLC   │───▶│ Rect │───▶ 400V    │
│           │Bridge│    │Resonant │    │ +    │              │
│           │      │    │  Tank   │    │Filter│              │
│           └──────┘    └─────────┘    └──────┘              │
│              │                                              │
│              ▼                                              │
│         Gate Drive                                          │
│              │                                              │
│              ▼                                              │
│         ┌────────┐                                          │
│         │  MCU   │◀── Feedback (V, I, T)                   │
│         │Control │                                          │
│         └────────┘                                          │
└─────────────────────────────────────────────────────────────┘

LLC Components:
• Lr (resonant inductor): ~50µH
• Cr (resonant capacitor): ~100nF
• Lm (magnetizing inductance): ~200µH
• Transformer ratio: ~1.6:1

Switching Frequency:
• Nominal: 100-150 kHz
• Range: 80-200 kHz (za output regulation)


ALTERNATIVA: Dual Active Bridge (DAB)
═══════════════════════════════════════════════════════════════

Pros:
• Bidirectional power flow (V2G ready)
• Širok input/output range

Cons:
• Kompleksnija kontrola
• Više switching loss-a (hard switching moguć)
• Više gate drivera potrebno

Za V2G budućnost: razmotriti DAB
```

### 2.3 Power Semiconductors

```
MAIN SWITCHES: SiC MOSFETs
═══════════════════════════════════════════════════════════════

Zašto SiC (umesto Si IGBT):
• Niži Rds_on pri visokim temperaturama
• Brže switching → manja switching loss
• Viša switching frequency moguća → manji magnetics
• Bolja termalna provodnost

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Manufacturer │ Part Number   │ Vds  │ Rds_on │ Package   │
├──────────────┼───────────────┼──────┼────────┼───────────┤
│ Wolfspeed    │ C3M0065090D   │ 900V │ 65mΩ   │ TO-247    │
│ Infineon     │ IMZ120R045M1  │ 1200V│ 45mΩ   │ TO-247    │
│ ROHM         │ SCT3030AR     │ 650V │ 30mΩ   │ TO-247    │
│ Onsemi       │ NTH4L022N065SC│ 650V │ 22mΩ   │ TO-247    │
└────────────────────────────────────────────────────────────┘

Za 3.3kW / 650V input:
• Peak current ~10A
• 45-65mΩ Rds_on dovoljan
• 900V rating za margin

Preporuka: Wolfspeed C3M0065090D ili Infineon IMZ120R045M1


OUTPUT RECTIFIER: Si Schottky ili SiC Schottky
═══════════════════════════════════════════════════════════════

Za 400V output / 10A:
• SiC Schottky diode (Vf ~1.5V @ 10A)
• Ili synchronous rectification sa SiC MOSFETs

Sync rect pros:
• Niži gubitci (Rds_on vs Vf)
• Bidirectional capable

Sync rect cons:
• Kompleksnije
• Više gate drivera
```

### 2.4 Magnetics

```
TRANSFORMER
═══════════════════════════════════════════════════════════════

Type: Planar transformer (za efikasnu proizvodnju)

Specs:
• Power: 3.5 kW
• Primary: 650V DC / ~100kHz
• Turns ratio: 1.6:1
• Isolation: 4kV
• Core: Ferrite (N97 ili slično)

Planar vs Wound:
• Planar: ponovljivost, niža visina, bolje hlađenje
• Wound: jeftinije za male serije

Preporuka: Planar za proizvodnju, wound za prototip


RESONANT INDUCTOR (Lr)
═══════════════════════════════════════════════════════════════

Može biti:
• Discrete inductor (torroid ili E-core)
• Integrated u transformer (leakage inductance)

Preporuka: Integrated (manji BOM, manji footprint)


OUTPUT INDUCTOR (Lo)
═══════════════════════════════════════════════════════════════

Za current smoothing:
• ~50µH
• Saturation current >15A
• Powder core (Kool Mu, Sendust) ili ferrite
```

### 2.5 Capacitors

```
INPUT CAPACITORS (DC Link)
═══════════════════════════════════════════════════════════════

Type: Film capacitors (Polypropylene)

Zašto film (ne electrolytic):
• Duži životni vek
• Bolji pri visokim temperaturama
• Niži ESR
• Nema degradacije elektrolita

Specs:
• Voltage: 800V DC (za 650V DC link)
• Capacitance: ~50-100µF
• Ripple current: >5A RMS

Kandidati:
• TDK B32776 series
• EPCOS MKP
• Vishay MKP1848

Estimacija: 2x 47µF / 800V = ~$15-20


OUTPUT CAPACITORS
═══════════════════════════════════════════════════════════════

Type: MLCC (high voltage) + Film hybrid

Specs:
• Voltage: 500V DC
• Capacitance: ~100µF effective
• Low ESR za ripple filtering

MLCC:
• 4.7µF / 500V X7R (više u paraleli)
• Derating: 50% @ rated voltage

Film:
• 10-20µF / 500V za bulk capacitance
```

### 2.6 Control & Sensing

```
CONTROL MCU
═══════════════════════════════════════════════════════════════

Requirements:
• PWM generation (100kHz+, high resolution)
• ADC (12-bit min, multiple channels)
• CAN bus
• Floating point (za kontrolne algoritme)

Options:
┌────────────────────────────────────────────────────────────┐
│ MCU              │ Core        │ Features              │ $ │
├──────────────────┼─────────────┼───────────────────────┼───┤
│ STM32G474        │ M4 @ 170MHz │ HRTIM, math accel     │ 5 │
│ TI C2000 F28379D │ Dual C28x   │ Best for power conv.  │ 15│
│ Infineon XMC4400 │ M4 @ 144MHz │ Good analog           │ 8 │
│ Microchip dsPIC  │ DSP         │ Motor control focused │ 4 │
└────────────────────────────────────────────────────────────┘

Preporuka: STM32G474
• Odličan HRTIM za high-res PWM
• Matematički akcelerator (CORDIC, FMAC)
• 5x 12-bit ADC
• CAN-FD
• Veliki ecosystem, jeftin


CURRENT SENSING
═══════════════════════════════════════════════════════════════

Već pokriveno u SENSOR-ARCHITECTURE.md

Summary:
• Infineon TLI4971 za precizno merenje
• Input + Output struja
• Overcurrent detection (hardware)


VOLTAGE SENSING
═══════════════════════════════════════════════════════════════

• Resistor divider → ADC
• Input: 650V / 3.3V ratio → ~200:1 divider
• Output: 500V / 3.3V ratio → ~150:1 divider
• 0.1% tolerance resistors za preciznost


TEMPERATURE SENSING
═══════════════════════════════════════════════════════════════

Lokacije:
1. MOSFET heatsink (NTC ili Vds method)
2. Transformer (NTC)
3. Output capacitors (NTC)
4. Ambient inlet air (NTC)

4x NTC 10K → ADC channels
```

### 2.7 Gate Drivers

```
GATE DRIVER REQUIREMENTS
═══════════════════════════════════════════════════════════════

Za SiC MOSFETs:
• Peak current: >4A source, >8A sink
• dV/dt immunity: >100 V/ns
• Isolation: >2.5kV (reinforced za safety)
• Negative bias: -4V to -5V (za sigurno OFF)
• UVLO, desat protection

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Part              │ Isolation │ Peak I │ Features       │ $│
├───────────────────┼───────────┼────────┼────────────────┼──┤
│ Silicon Labs      │ 5kV       │ 8A/8A  │ Miller clamp   │ 4│
│ Si8271 + ext      │           │        │                │  │
├───────────────────┼───────────┼────────┼────────────────┼──┤
│ Infineon 1EDC60   │ 5.7kV     │ 6A     │ Desat, active  │ 6│
│                   │           │        │ miller clamp   │  │
├───────────────────┼───────────┼────────┼────────────────┼──┤
│ TI UCC21750       │ 5.7kV     │ 10A    │ SiC optimized  │ 5│
└────────────────────────────────────────────────────────────┘

Preporuka: TI UCC21750 (SiC optimized, dobar support)

Broj drivera:
• Half-bridge primary: 2x
• Sync rect (ako ima): 2x
• Total: 2-4 gate drivera po modulu
```

### 2.8 Protection Circuits

```
PROTECTION FEATURES
═══════════════════════════════════════════════════════════════

1. OVERCURRENT (OCP)
   • Hardware comparator → fast shutdown (<1µs)
   • Threshold: 150% of rated current
   • Latching until MCU reset

2. OVERVOLTAGE (OVP)
   • Input OVP: clamp ili shutdown @ 750V
   • Output OVP: shutdown @ 110% rated output
   • TVS diodes za transient clamping

3. UNDERVOLTAGE (UVP)
   • Input UVP: stop switching @ <500V input
   • Prevents operation outside safe range

4. OVERTEMPERATURE (OTP)
   • Warning: 100°C junction
   • Derating: 100-125°C (reduce power)
   • Shutdown: >150°C

5. SHORT CIRCUIT
   • Desaturation detection u gate driver
   • Response time: <1µs
   • Blanking time: ~500ns

6. SOFT START
   • Ramp-up over 100ms
   • Prevents inrush current

7. ISOLATION MONITOR
   • Continuity check pre-operation
   • Detects isolation failure
```

---

## 3. Mechanical Design

### 3.1 Form Factor

```
1U HALF-WIDTH FORM FACTOR (Telecom Style)
═══════════════════════════════════════════════════════════════

Inspiracija: Eltek Flatpack2, Delta DPR 3000, Huawei R4850

Dimenzije: 200 × 320 × 44 mm (W × D × H)

       ◀──────────── 320mm ────────────▶
      ┌────────────────────────────────────┐
      │                                    │ ▲
      │   ┌────────────────────────────┐   │ │
      │   │                            │   │ 44mm
      │   │       EK3 MODULE           │   │ │
      │   │                            │   │ ▼
      │   └────────────────────────────┘   │
      │              200mm                 │
      └────────────────────────────────────┘
                      ▲
                      │
                Connector side
                 (blind mate)

Zašto ove dimenzije:
• 44mm = 1U height (standardno za rack)
• 320mm dubina - dovoljna za LLC transformer + caps
• 200mm širina - 2 modula u 19" rack = 6.6kW po 1U
• Dokazano u industriji (Eltek, Delta, Huawei koriste slično za 3kW)

Rack density:
• 19" rack: 2 modula po 1U redu
• 6U = 12 modula = 40kW
• 12U = 24 modula = 80kW
• 42U full rack = 84 modula = 277kW (teoretski max)
```

### 3.2 Enclosure

```
ENCLOSURE CONSTRUCTION
═══════════════════════════════════════════════════════════════

Materijal: Aluminijum (ekstrudirani profil + sheet metal)

Zašto aluminijum:
• Laka obrada
• Odlično hlađenje (heatsink funkcija)
• EMI shielding
• Relativno jeftin

Konstrukcija:
┌─────────────────────────────────────────────────────────────┐
│                    TOP VIEW (Cross-section)                  │
│                                                              │
│    ┌─────────────────────────────────────────────────┐      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │▓ Heatsink (extruded Al) - MOSFETs mounted here ▓│      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │                                                 │      │
│    │   ┌─────────────────────────────────────────┐  │      │
│    │   │          MAIN PCB                       │  │      │
│    │   │  (Control, magnetics, capacitors)       │  │      │
│    │   └─────────────────────────────────────────┘  │      │
│    │                                                 │      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │▓ Bottom plate (sheet Al) - EMI shield        ▓│      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
│    AIR FLOW ════════════════════════════════════▶           │
│              (front to back)                                 │
└─────────────────────────────────────────────────────────────┘

Dijelovi:
1. Heatsink extrusion (gore) - za MOSFET-e
2. Side rails (lijevo/desno) - guide za insertion
3. Front panel - konektor + status LED
4. Back panel - air exhaust
5. Bottom cover - EMI + structural
```

### 3.3 Connector System

```
BLIND MATE CONNECTOR (Kritičan za hot-swap)
═══════════════════════════════════════════════════════════════

Requirements:
• Blind mate (ne vidiš tokom insertion)
• Self-aligning (tolerant na misalignment ±2mm)
• High current contacts (10A continuous)
• Signal contacts (CAN, aux)
• Mechanical latch
• >10,000 insertion cycles

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Manufacturer  │ Series          │ Current │ Cycles │ $    │
├───────────────┼─────────────────┼─────────┼────────┼──────┤
│ TE Connectivity│ MULTIGIG RT2   │ 30A     │ 10K    │ 50   │
│ Amphenol      │ Millipacs       │ 25A     │ 15K    │ 60   │
│ Molex         │ EXTreme Power   │ 40A     │ 10K    │ 45   │
│ Smiths (Hypertac)│ Hyperboloid │ 50A     │ 100K+  │ 100  │
└────────────────────────────────────────────────────────────┘

Pin Assignment (Example - 20 pins):
─────────────────────────────────────
  1-4:   DC Input + (power, 4 pins paralleled)
  5-8:   DC Input - (power, 4 pins paralleled)
  9-12:  DC Output + (power)
  13-16: DC Output - (power)
  17:    CAN_H
  18:    CAN_L
  19:    Module Present (signal to backplane)
  20:    Reserved / GND

Sequencing:
• Ground contacts FIRST (longer pins)
• Then power
• Then signal
• Module Present LAST (confirms full insertion)


LATCH MECHANISM
═══════════════════════════════════════════════════════════════

Opcije:
1. Spring latch (kao server blade)
   • Automatski engage pri insertion
   • Lever za release

2. Screw retention
   • Sigurnije
   • Sporije za swap

Preporuka: Spring latch sa sekundarnim lock
(za vibration resistance)
```

### 3.4 Thermal Design

```
THERMAL BUDGET
═══════════════════════════════════════════════════════════════

Power dissipation @ 96% efficiency, 3.3kW output:
  Ploss = 3300W × (1/0.96 - 1) = 3300 × 0.042 = ~140W

Heat sources breakdown:
  • MOSFETs (primary):     40W (28%)
  • Transformer:           35W (25%)
  • Rectifier:             25W (18%)
  • Output inductor:       15W (11%)
  • Control + aux:         10W (7%)
  • Capacitors + misc:     15W (11%)

Cooling strategy: FORCED AIR (shared plenum)


AIRFLOW DESIGN
═══════════════════════════════════════════════════════════════

                         RACK/CABINET
        ┌──────────────────────────────────────────┐
        │                 FANS                      │
        │               (cabinet level)             │
        │    ▲    ▲    ▲    ▲    ▲    ▲    ▲      │
        │    │    │    │    │    │    │    │      │
        ├────┼────┼────┼────┼────┼────┼────┼──────┤
        │    │    │    │    │    │    │    │      │
   HOT  │ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐        │
   AIR  │ │ EK3 │ │ EK3 │ │ EK3 │ │ EK3 │        │
   OUT  │ │  1  │ │  2  │ │  3  │ │  4  │  ...   │
        │ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘        │
        │    │    │    │    │    │    │    │      │
        ├────┼────┼────┼────┼────┼────┼────┼──────┤
        │    │    │    │    │    │    │    │      │
  COLD  │    ▲    ▲    ▲    ▲    ▲    ▲    ▲      │
  AIR   │                INLET                     │
  IN    │            (filtered)                    │
        └──────────────────────────────────────────┘

Airflow: Front-to-back through each module
Fan: Cabinet-level (easier maintenance, redundant)

Required airflow per module:
  Q = Ploss / (ρ × Cp × ΔT)
  Q = 140W / (1.2 kg/m³ × 1005 J/kgK × 20K)
  Q ≈ 0.006 m³/s = 12 CFM per module

Cabinet fan sizing:
  10 modules × 12 CFM = 120 CFM minimum
  With margin: 200 CFM cabinet fans


HEATSINK DESIGN
═══════════════════════════════════════════════════════════════

Requirement: Dissipate 40W from MOSFETs

Thermal resistance chain:
  Tj → Tc (junction to case):      0.5 K/W (from datasheet)
  Tc → Ts (case to heatsink):      0.2 K/W (thermal pad)
  Ts → Ta (heatsink to ambient):   ? K/W (design this)

Target: Tj < 125°C @ Ta = 50°C
  ΔT available = 125 - 50 = 75°C
  Rth_total = 75°C / 40W = 1.9 K/W

  Rth_heatsink = 1.9 - 0.5 - 0.2 = 1.2 K/W

Heatsink spec:
  • Extrusion sa finovima
  • Forced air (2 m/s min)
  • ~1.0 K/W achievable u ovom form factoru
```

---

## 4. PCB Design

### 4.1 Layer Stack

```
PCB LAYER STACK (6-Layer recommended)
═══════════════════════════════════════════════════════════════

Layer 1: TOP        - Power components, MOSFETs
         (2 oz Cu)

Layer 2: GND        - Solid ground plane
         (1 oz Cu)

Layer 3: SIGNAL     - Control signals, gate drives
         (1 oz Cu)

Layer 4: POWER      - DC rails, internal connections
         (2 oz Cu)

Layer 5: GND        - Second ground plane (EMI)
         (1 oz Cu)

Layer 6: BOTTOM     - Low-power components, connectors
         (1 oz Cu)

Total thickness: ~1.6mm
Material: FR4 (standard) ili high-Tg FR4

Zašto 6 layers:
• 2oz copper za power
• Solid GND planes za EMI
• Signal integrity
• Manufacturability
```

### 4.2 Layout Guidelines

```
LAYOUT RULES
═══════════════════════════════════════════════════════════════

1. POWER LOOP MINIMIZATION
   • Gate driver ↔ MOSFET: <10mm
   • Decoupling caps direktno na MOSFET-u
   • Minimize loop area za di/dt

2. CREEPAGE & CLEARANCE
   • 650V DC: min 6.4mm clearance (IEC 60950)
   • Ili use slots/barriers

3. THERMAL VIAS
   • Pod MOSFET-ima: via array do heatsink
   • Via diameter: 0.3mm
   • Via pitch: 1.0mm

4. CURRENT CARRYING
   • 10A traces: min 3mm width @ 2oz Cu
   • Or use copper pours

5. SENSITIVE SIGNALS
   • ADC references: guarded traces
   • CAN: differential pair, 120Ω impedance
   • Gate drives: away from power loops
```

---

## 5. Bill of Materials (Estimated)

```
BOM COST ESTIMATE (Production quantity: 1000+)
═══════════════════════════════════════════════════════════════

CATEGORY                      │ COST (USD) │ % TOTAL
──────────────────────────────┼────────────┼─────────
Power Semiconductors          │            │
  SiC MOSFETs (4x)           │    $40     │  22%
  Gate Drivers (4x)          │    $20     │  11%
  Rectifier diodes           │    $10     │   5%
──────────────────────────────┼────────────┼─────────
Magnetics                     │            │
  Transformer                 │    $25     │  14%
  Inductors                   │    $10     │   5%
──────────────────────────────┼────────────┼─────────
Capacitors                    │            │
  Film caps (DC link)        │    $20     │  11%
  Output caps                │    $10     │   5%
  Misc MLCC                  │    $5      │   3%
──────────────────────────────┼────────────┼─────────
Control & Sensing             │            │
  MCU (STM32G474)            │    $5      │   3%
  Current sensors (2x)       │    $7      │   4%
  Misc ICs                   │    $8      │   4%
──────────────────────────────┼────────────┼─────────
Mechanical                    │            │
  Enclosure (Al)             │    $15     │   8%
  Connector                  │    $10     │   5%
  Hardware                   │    $5      │   3%
──────────────────────────────┼────────────┼─────────
PCB                          │    $8      │   4%
──────────────────────────────┼────────────┼─────────
TOTAL BOM                    │   ~$180    │  100%
──────────────────────────────┼────────────┼─────────

Add:
  Assembly:                      $30
  Testing:                       $10
  Overhead/margin:               $30
──────────────────────────────────────────────
ESTIMATED UNIT COST:            ~$250

At scale (10,000+): could drop to ~$200
```

---

## 6. Testing & Validation

```
TEST PLAN
═══════════════════════════════════════════════════════════════

1. ELECTRICAL TESTS (100% production)
   □ Hipot test (isolation): 4kV, 1 min
   □ Functional test: power on, basic operation
   □ Efficiency measurement @ 50%, 100% load
   □ OCP/OVP/OTP verification
   □ CAN communication check

2. BURN-IN (sampling ili 100%)
   □ 72h @ rated load, elevated temp (45°C)
   □ Measure baseline performance
   □ Record per-unit calibration data

3. EMC TESTS (type approval)
   □ Conducted emissions (CISPR 11/32)
   □ Radiated emissions
   □ Immunity (surge, EFT, ESD)

4. ENVIRONMENTAL (type approval)
   □ Thermal cycling: -20°C to +60°C, 100 cycles
   □ Humidity: 85% RH, 85°C, 500h
   □ Vibration: per IEC 60068

5. SAFETY (type approval)
   □ IEC 62477 (power electronics safety)
   □ Relevant EV charging standards
```

---

## 7. Manufacturing Considerations

```
DESIGN FOR MANUFACTURING (DFM)
═══════════════════════════════════════════════════════════════

1. SMT ASSEMBLY
   • All SMD components on one side (top) if possible
   • Standard package sizes (0805, 0603 min)
   • No BGA za lakšu inspekciju

2. THROUGH-HOLE
   • Minimize (connectors, large caps)
   • Wave solder compatible layout

3. CONFORMAL COATING
   • Required za humidity resistance
   • Mask sensitive areas (connectors, test points)

4. ENCLOSURE ASSEMBLY
   • Snap-fit ili minimal screws
   • Clear assembly sequence
   • Poka-yoke (mistake-proofing)

5. TESTING ACCESS
   • Test points za ICT
   • Programming header
   • Status LEDs visible


MAKE VS BUY DECISIONS
═══════════════════════════════════════════════════════════════

MAKE (in-house ili CM):
• PCB assembly
• Final assembly
• Testing
• Firmware

BUY (from suppliers):
• Transformer (custom wound) - specijalizovan supplier
• Enclosure extrusion - Al profil manufacturer
• Connector - standard catalog part

OUTSOURCE CANDIDATES:
• SMT assembly → EMS provider (Jabil, Flex, lokalni CM)
• Heatsink → Al extrusion company
```

---

## 8. Revision History

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0     | 2026-01-03 | Initial document           |

---

## 9. Open Questions

1. **Exact MOSFET selection** - need thermal simulation
2. **Transformer vendor** - custom vs semi-custom
3. **Connector final selection** - need mechanical prototypes
4. **Certification scope** - which markets first?
5. **V2G requirement** - affects topology choice (LLC vs DAB)

---

## 10. Firmware Architecture

### 10.1 RTOS Selection and Configuration

```
OPERATING SYSTEM: FreeRTOS
═══════════════════════════════════════════════════════════════

Why FreeRTOS:
• Mature, proven in power electronics applications
• STM32 HAL integration
• Small footprint (~10KB Flash)
• Preemptive scheduling
• Active community, long-term support

Alternative considered: Zephyr RTOS
• Better security features (but more complex)
• May consider for future versions

KERNEL CONFIGURATION:
─────────────────────────────────────────────────────────────
• Scheduler: Preemptive with time-slicing
• Tick rate: 1 kHz (1ms resolution)
• Max priorities: 10 levels
• Stack overflow detection: Enabled
• Run-time stats: Enabled (debug builds)
• Heap: heap_4 (coalescing, thread-safe)
```

### 10.2 Task Scheduling and Priorities

```
TASK PRIORITY ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ PRIORITY    │ TASK                    │ PERIOD    │ WCET   │
├─────────────┼─────────────────────────┼───────────┼────────┤
│ P0 (ISR)    │ Safety ISR (OCP/OVP/OTP)│ Event     │ <1µs   │
│ P1 (ISR)    │ PWM Control ISR         │ 6.67µs    │ <2µs   │
│ P2 (ISR)    │ ADC Sampling ISR        │ 100µs     │ <5µs   │
│ P3 (ISR)    │ CAN RX ISR              │ Event     │ <10µs  │
├─────────────┼─────────────────────────┼───────────┼────────┤
│ P4 (Task)   │ Power Control Task      │ 1ms       │ <100µs │
│ P5 (Task)   │ Thermal Management      │ 10ms      │ <500µs │
│ P6 (Task)   │ Swarm Coordination      │ 100ms     │ <5ms   │
│ P7 (Task)   │ Heartbeat TX            │ 1000ms    │ <1ms   │
│ P8 (Task)   │ Logging Task            │ Background│ N/A    │
│ P9 (Task)   │ Diagnostics/Idle        │ Idle      │ N/A    │
└─────────────────────────────────────────────────────────────┘

WCET = Worst Case Execution Time

DEADLINE GUARANTEES:
─────────────────────────────────────────────────────────────
• Power control loop: <100µs response to load change
• CAN message processing: <1ms from RX to action
• Fault response (OCP/OVP): <1µs (hardware-assisted)
• Thermal derating: <100ms to reduce power


WATCHDOG STRATEGY
═══════════════════════════════════════════════════════════════

1. IWDG (Independent Watchdog)
   • Timeout: 100ms
   • Fed by main loop
   • Resets MCU if firmware hangs

2. WWDG (Window Watchdog)
   • Used for time-critical sections
   • Detects early or late execution
   • For power control task timing verification

3. Application Watchdog
   • Software watchdog for task health
   • Each task checks in periodically
   • Triggers safe shutdown before HW watchdog
```

### 10.3 Memory Partitioning

```
FLASH LAYOUT (512KB STM32G474)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ ADDRESS       │ SIZE   │ CONTENT                           │
├───────────────┼────────┼───────────────────────────────────┤
│ 0x0800_0000   │ 16 KB  │ Bootloader                        │
│ 0x0800_4000   │ 192 KB │ Application Slot A (active)       │
│ 0x0803_4000   │ 192 KB │ Application Slot B (update)       │
│ 0x0806_4000   │ 16 KB  │ Configuration Data                │
│ 0x0806_8000   │ 64 KB  │ Audit Log (circular buffer)       │
│ 0x0807_8000   │ 8 KB   │ OTP Keys (write-once)             │
│ 0x0807_A000   │ 24 KB  │ Reserved for future               │
└─────────────────────────────────────────────────────────────┘


RAM LAYOUT (128KB)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ REGION        │ SIZE   │ PURPOSE                           │
├───────────────┼────────┼───────────────────────────────────┤
│ Task Stacks   │ 32 KB  │ 8 tasks × 4KB each                │
│ FreeRTOS Heap │ 32 KB  │ Dynamic allocation                │
│ DMA Buffers   │ 16 KB  │ ADC, CAN, aligned to 32 bytes     │
│ CAN TX/RX     │ 4 KB   │ Message queues                    │
│ Static Data   │ 16 KB  │ Global variables, state           │
│ Stack Guard   │ 4 KB   │ Overflow detection zone           │
│ Reserved      │ 24 KB  │ Future expansion                  │
└─────────────────────────────────────────────────────────────┘


MPU CONFIGURATION (Memory Protection Unit)
═══════════════════════════════════════════════════════════════

The STM32G4 MPU is configured to enforce memory protection:

┌─────────────────────────────────────────────────────────────┐
│ REGION │ ADDRESS RANGE          │ PERMISSIONS              │
├────────┼────────────────────────┼──────────────────────────┤
│ 0      │ 0x0800_0000-0x0807_FFFF│ Flash: RO + Execute      │
│ 1      │ 0x2000_0000-0x2001_FFFF│ RAM: RW + No Execute     │
│ 2      │ 0x4000_0000-0x5FFF_FFFF│ Peripherals: RW + Device │
│ 3      │ Stack guard area       │ No Access (trap)         │
│ 4      │ OTP keys region        │ RO after provisioning    │
└─────────────────────────────────────────────────────────────┘

Benefits:
• Prevents code execution from RAM (security)
• Detects stack overflow before corruption
• Protects keys from accidental overwrite
```

### 10.4 Secure Boot Chain

```
BOOT SEQUENCE
═══════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────┐
    │                      POWER ON                            │
    └─────────────────────────┬───────────────────────────────┘
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │              ST ROM BOOTLOADER                           │
    │  • Checks RDP (Read-out Protection) level               │
    │  • Checks Option Bytes                                   │
    │  • Jumps to user bootloader                             │
    └─────────────────────────┬───────────────────────────────┘
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │            CUSTOM BOOTLOADER (16KB)                      │
    │  • Verify application signature (Ed25519 or ECDSA)      │
    │  • Check version counter (anti-rollback)                │
    │  • Select active slot (A or B)                          │
    │  • Handle firmware update if pending                    │
    └─────────────────────────┬───────────────────────────────┘
                              ▼
    ┌─────────────────────────────────────────────────────────┐
    │               APPLICATION (Slot A or B)                  │
    │  • FreeRTOS kernel initialization                       │
    │  • Hardware initialization                              │
    │  • Start all tasks                                      │
    └─────────────────────────────────────────────────────────┘


FIRMWARE SIGNING
═══════════════════════════════════════════════════════════════

Algorithm: Ed25519 (preferred) or ECDSA-P256

Signature Location:
┌─────────────────────────────────────────────────────────────┐
│ OFFSET  │ SIZE   │ CONTENT                                 │
├─────────┼────────┼─────────────────────────────────────────┤
│ 0x00    │ 4      │ Magic number (0x454B3033 = "EK03")      │
│ 0x04    │ 4      │ Firmware version (major.minor.patch)    │
│ 0x08    │ 4      │ Build timestamp                         │
│ 0x0C    │ 4      │ Firmware size (excluding header)        │
│ 0x10    │ 32     │ SHA-256 hash of firmware                │
│ 0x30    │ 64     │ Ed25519 signature                       │
│ 0x70    │ 16     │ Reserved                                │
│ 0x80    │ ...    │ Firmware binary starts here             │
└─────────────────────────────────────────────────────────────┘

Key Storage:
• Public key: Stored in OTP (one-time programmable) during manufacturing
• Private key: NEVER on device, only in secure build server


ANTI-ROLLBACK PROTECTION
═══════════════════════════════════════════════════════════════

Mechanism: Version counter in OTP fuses

┌─────────────────────────────────────────────────────────────┐
│ OTP FUSE │ BIT VALUE │ MINIMUM ALLOWED VERSION             │
├──────────┼───────────┼─────────────────────────────────────┤
│ Fuse 0   │ 0         │ Version ≥ 1                         │
│ Fuse 1   │ 0         │ Version ≥ 2                         │
│ Fuse 2   │ 0         │ Version ≥ 3                         │
│ ...      │ ...       │ ...                                 │
│ Fuse 31  │ 0         │ Version ≥ 32                        │
└─────────────────────────────────────────────────────────────┘

• Each major security update burns one fuse
• Fuses are one-way (cannot unburn)
• 32 major updates possible over product lifetime
```

### 10.5 Firmware Update (OTA)

```
A/B UPDATE MECHANISM
═══════════════════════════════════════════════════════════════

    CURRENT STATE                    AFTER UPDATE
    ─────────────                    ────────────
    ┌─────────────┐                 ┌─────────────┐
    │  Slot A     │◀── Active      │  Slot A     │   (old)
    │  v1.2.3     │                 │  v1.2.3     │
    └─────────────┘                 └─────────────┘
    ┌─────────────┐                 ┌─────────────┐
    │  Slot B     │    (old)       │  Slot B     │◀── Active
    │  v1.2.0     │                 │  v1.3.0     │
    └─────────────┘                 └─────────────┘

Benefits:
• Never bricked: if new firmware fails, revert to old
• Atomic update: complete or nothing
• Power-fail safe: can resume interrupted update


UPDATE PROTOCOL (via CAN)
═══════════════════════════════════════════════════════════════

1. INITIATE
   Station Controller → Module:
   {cmd: UPDATE_START, version: "1.3.0", size: 187654, chunks: 733}

2. TRANSFER
   Station Controller → Module (733 times):
   {cmd: UPDATE_CHUNK, seq: N, data: [256 bytes], crc16: 0xABCD}

   Module → Station Controller (after each):
   {ack: UPDATE_CHUNK, seq: N, status: OK|RETRY|ABORT}

3. VERIFY
   Module: Calculate SHA-256, verify signature
   Module → Station Controller:
   {status: VERIFY_OK|VERIFY_FAIL}

4. COMMIT
   Station Controller → Module:
   {cmd: UPDATE_COMMIT}
   Module: Mark new slot as active, reboot

5. CONFIRM
   After reboot, new firmware sends:
   {status: UPDATE_COMPLETE, version: "1.3.0"}


ROLLBACK PROCEDURE
═══════════════════════════════════════════════════════════════

Automatic rollback triggers:
• New firmware fails to boot 3 times
• New firmware fails self-test
• Watchdog timeout during boot

Manual rollback:
• Station Controller sends: {cmd: ROLLBACK}
• Module reboots to previous slot
```

---

## 11. CAN-FD Communication Protocol

### 11.1 Physical Layer

```
CAN-FD CONFIGURATION
═══════════════════════════════════════════════════════════════

Standard: ISO 11898-1:2015 (CAN-FD)

Bit Rates:
• Arbitration phase: 1 Mbps
• Data phase: 5 Mbps

Bus Topology:
• Single bus, multi-drop
• Max 64 nodes per bus (practical limit)
• Termination: 120Ω at each end

Transceiver: TJA1443 (NXP)
• CAN-FD capable up to 5 Mbps
• 5V tolerant, 3.3V logic compatible
• ESD protection integrated
• Standby mode for power saving


DUAL CAN BUS REDUNDANCY
═══════════════════════════════════════════════════════════════

Each module has TWO CAN-FD interfaces:

┌─────────────────────────────────────────────────────────────┐
│                         MODULE                              │
│  ┌─────────────┐              ┌─────────────┐              │
│  │   CAN-A     │              │   CAN-B     │              │
│  │  (Primary)  │              │  (Backup)   │              │
│  └──────┬──────┘              └──────┬──────┘              │
└─────────┼────────────────────────────┼─────────────────────┘
          │                            │
    ══════╧════════════          ══════╧════════════
       CAN-A BUS                    CAN-B BUS
    (Normal operations)          (Heartbeat + failover)

Failover Protocol:
• CAN-A: All normal traffic
• CAN-B: Heartbeat only (1 Hz) during normal operation
• If CAN-A error frames > 10 in 100ms → switch to CAN-B
• Switchover time: <10ms
• Recovery: Manual switchback after CAN-A verified OK
```

### 11.2 Message Format

```
CAN-FD EXTENDED ID STRUCTURE (29-bit)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ BITS      │ FIELD         │ DESCRIPTION                    │
├───────────┼───────────────┼────────────────────────────────┤
│ 28-26     │ Priority      │ 0=highest, 7=lowest            │
│ 25-24     │ Message Type  │ 0=cmd, 1=status, 2=event, 3=fw │
│ 23-16     │ Source ID     │ Module slot number (0-255)     │
│ 15-8      │ Dest ID       │ Target (0xFF=broadcast)        │
│ 7-0       │ Message Code  │ Specific message identifier    │
└─────────────────────────────────────────────────────────────┘


PAYLOAD STRUCTURE (64 bytes CAN-FD)
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ BYTE      │ FIELD         │ DESCRIPTION                    │
├───────────┼───────────────┼────────────────────────────────┤
│ 0         │ Version       │ Protocol version (currently 1) │
│ 1-4       │ Timestamp     │ Unix timestamp (32-bit)        │
│ 5-6       │ Sequence      │ Message sequence number        │
│ 7         │ Flags         │ Bit flags (auth, priority)     │
│ 8-55      │ Payload       │ Message-specific data          │
│ 56-63     │ CMAC          │ AES-128-CMAC (if authenticated)│
└─────────────────────────────────────────────────────────────┘
```

### 11.3 Message Types

```
MESSAGE CATALOG
═══════════════════════════════════════════════════════════════

HEARTBEAT (0x01xx) - Status reporting
─────────────────────────────────────
ID: 0x0100 + slot_number
Period: 1000ms
Payload:
  [0]:     State (BOOT, STANDBY, ACTIVE, DEGRADED, FAULT)
  [1-2]:   Output power (W, uint16)
  [3-4]:   Output voltage (mV, uint16)
  [5-6]:   Output current (mA, uint16)
  [7]:     Junction temperature (°C, int8)
  [8]:     Ambient temperature (°C, int8)
  [9]:     Efficiency (%, 0-100)
  [10-11]: ESR estimate (mΩ, uint16)
  [12]:    RUL (Remaining Useful Life, %)
  [13]:    Fan speed (%, 0-100)
  [14]:    Anomaly score (0-255)
  [15]:    Fault code (0=none)


POWER COMMAND (0x02xx) - Control commands
─────────────────────────────────────────
ID: 0x0200 + target_slot
Commands:
  0x01: POWER_ON
  0x02: POWER_OFF
  0x03: SET_POWER {power_limit: uint16}
  0x04: SET_VOLTAGE {voltage_mv: uint16}
  0x05: SET_CURRENT {current_ma: uint16}
  0x06: ENTER_STANDBY
  0x07: PREPARE_SWAP (safe shutdown)

Response:
  ACK with status, or NACK with error code


SYNC (0x050) - Time synchronization
───────────────────────────────────
ID: 0x050 (broadcast)
Period: 100ms from Station Controller
Payload:
  [0-3]: Unix timestamp (seconds)
  [4-5]: Milliseconds
  [6]:   Epoch counter (for split-brain prevention)


THERMAL SHARE (0x03xx) - Thermal coordination
─────────────────────────────────────────────
ID: 0x0300 + slot_number
Period: 100ms
Payload:
  [0]:   Current temperature (°C)
  [1]:   Requested derating (%, 0=none)
  [2]:   Thermal headroom (°C available)

Purpose: Modules share thermal state for swarm load balancing


FAULT ALERT (0x7FF) - Critical fault
────────────────────────────────────
ID: 0x7FF (highest priority)
Payload:
  [0]:   Source slot
  [1]:   Fault type (OCP, OVP, OTP, COMM, HW)
  [2]:   Severity (1-5, 5=critical)
  [3-6]: Timestamp
  [7-14]: Fault-specific data


ELECTION (0x010) - Leader election (Raft)
─────────────────────────────────────────
ID: 0x010 (high priority)
Messages:
  REQUEST_VOTE, VOTE_GRANTED, APPEND_ENTRIES, HEARTBEAT
See Swarm Intelligence documentation for Raft protocol details
```

### 11.4 Message Authentication (CMAC)

```
AES-128-CMAC AUTHENTICATION
═══════════════════════════════════════════════════════════════

Why CMAC:
• Hardware accelerated on STM32G4 (AES peripheral)
• 128-bit security level
• Small overhead (8 bytes truncated MAC)
• Proven standard (NIST SP 800-38B)

Which messages are authenticated:
• POWER_COMMAND (all commands)
• FIRMWARE_UPDATE
• FACTORY_RESET
• CONFIG_CHANGE

NOT authenticated (performance):
• HEARTBEAT
• SYNC
• THERMAL_SHARE


CMAC CALCULATION
═══════════════════════════════════════════════════════════════

Input to CMAC:
┌─────────────────────────────────────────────────────────────┐
│ CAN_ID (4 bytes) | Sequence (2 bytes) | Payload (48 bytes) │
└─────────────────────────────────────────────────────────────┘

Key: Per-module 128-bit key, derived from master key + module_id

Truncation: Full 128-bit CMAC truncated to 64 bits (8 bytes)
           Stored in bytes 56-63 of CAN-FD payload


REPLAY PROTECTION
═══════════════════════════════════════════════════════════════

Mechanism: Sequence numbers + timestamp window

┌─────────────────────────────────────────────────────────────┐
│ CHECK                │ ACTION IF FAILED                    │
├──────────────────────┼─────────────────────────────────────┤
│ Sequence > last_seq  │ Reject (replay attack)              │
│ Timestamp ± 5 sec    │ Reject (too old or clock skew)      │
│ CMAC valid           │ Reject (tampered message)           │
│ Source authorized    │ Reject (permission denied)          │
└─────────────────────────────────────────────────────────────┘

After 65535 messages: Sequence wraps, epoch increments
```

---

## 12. Connector Specification

### 12.1 Mechanical Design

```
20-PIN BLIND-MATE CONNECTOR
═══════════════════════════════════════════════════════════════

Type: High-density power + signal hybrid
Recommendation: TE Connectivity MULTIGIG RT or equivalent

Physical Properties:
• Total pins: 20
• Power pins: 16 (30A each)
• Signal pins: 4
• Mating cycles: >10,000 (for robotic swap)
• Insertion force: <50N
• Keying: Yes (prevents wrong orientation)


KEYING SYSTEM
═══════════════════════════════════════════════════════════════

Module Type Keying:
┌─────────────────────────────────────────────────────────────┐
│ KEY CODE │ MODULE TYPE                                      │
├──────────┼──────────────────────────────────────────────────┤
│ A        │ EK3 Standard (DC/DC 3.3kW)                       │
│ B        │ EK3-PFC (AC/DC with PFC)                         │
│ C        │ EK3-V2G (Bidirectional)                          │
│ D        │ Reserved for future                              │
└─────────────────────────────────────────────────────────────┘

Mechanical Implementation:
• Asymmetric key pin pattern
• Physical notch on housing
• Prevents inserting wrong module type into slot
```

### 12.2 Pin Assignment

```
20-PIN CONNECTOR PINOUT
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ PIN │ SIGNAL       │ DESCRIPTION              │ CURRENT    │
├─────┼──────────────┼──────────────────────────┼────────────┤
│  1  │ DC_IN+       │ DC bus positive          │ 30A        │
│  2  │ DC_IN+       │ DC bus positive          │ 30A        │
│  3  │ DC_IN+       │ DC bus positive          │ 30A        │
│  4  │ DC_IN+       │ DC bus positive          │ 30A        │
│  5  │ DC_IN-       │ DC bus negative          │ 30A        │
│  6  │ DC_IN-       │ DC bus negative          │ 30A        │
│  7  │ DC_IN-       │ DC bus negative          │ 30A        │
│  8  │ DC_IN-       │ DC bus negative          │ 30A        │
├─────┼──────────────┼──────────────────────────┼────────────┤
│  9  │ DC_OUT+      │ Output positive          │ 30A        │
│ 10  │ DC_OUT+      │ Output positive          │ 30A        │
│ 11  │ DC_OUT+      │ Output positive          │ 30A        │
│ 12  │ DC_OUT+      │ Output positive          │ 30A        │
│ 13  │ DC_OUT-      │ Output negative          │ 30A        │
│ 14  │ DC_OUT-      │ Output negative          │ 30A        │
│ 15  │ DC_OUT-      │ Output negative          │ 30A        │
│ 16  │ DC_OUT-      │ Output negative          │ 30A        │
├─────┼──────────────┼──────────────────────────┼────────────┤
│ 17  │ CAN_H        │ CAN-FD High              │ Signal     │
│ 18  │ CAN_L        │ CAN-FD Low               │ Signal     │
│ 19  │ MOD_PRESENT  │ Module present detect    │ Signal     │
│ 20  │ GND_SIG      │ Signal ground            │ Signal     │
└─────────────────────────────────────────────────────────────┘

Note: 4 pins paralleled for each power rail provides:
• 120A total capacity (4 × 30A)
• Redundancy if one contact degrades
• Lower contact resistance
```

### 12.3 Insertion Sequence

```
PRE-CHARGE SEQUENCING (Arc Prevention)
═══════════════════════════════════════════════════════════════

Pin lengths are staggered to control connection order:

    FIRST ────────────────────────────────────── LAST
    ←──────────────────────────────────────────────→

    │ GND (Pin 20)      - Longest pin, connects first
    │ Signal (17-19)    - Connect second
    │ DC_IN- (5-8)      - Connect third
    │ DC_IN+ (1-4)      - Connect fourth
    │ DC_OUT- (13-16)   - Connect fifth
    │ DC_OUT+ (9-12)    - Shortest pins, connect last
    ▼

Length Differences:
• Ground: +3mm (first contact)
• Signal: +2mm
• Input negative: +1mm
• Input positive: 0mm (reference)
• Output: -1mm (last contact)

This sequence ensures:
1. Ground established before any power
2. No arcing on high-current contacts
3. Communication established before power transfer
```

### 12.4 ESD Protection

```
CONNECTOR ESD PROTECTION
═══════════════════════════════════════════════════════════════

SIGNAL PINS (17-20):
• TVS diodes: SMBJ5.0CA (bidirectional, 5V clamping)
• ESD rating: ±15kV contact, ±25kV air discharge
• Response time: <1ns

POWER PINS (1-16):
• MOV varistors: S14K275 (275V clamping)
• Surge rating: 4500A (8/20µs)
• Also provides transient suppression

GROUND PIN:
• Star grounding to chassis
• Low impedance path to earth
• Bypass capacitor: 100nF ceramic
```

---

## 13. Security Model

### 13.1 Trust Boundaries

```
TRUST BOUNDARY ARCHITECTURE
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      TRUST LEVELS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LEVEL 0: HARDWARE (Non-bypassable)                         │
│  ════════════════════════════════                           │
│  • Hardware OCP/OVP/OTP circuits                            │
│  • Analog comparators, not firmware controlled              │
│  • Cannot be disabled by any software                       │
│  • Secure boot ROM (ST factory)                             │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 1: KERNEL FIRMWARE (Minimal, signed)                 │
│  ══════════════════════════════════════════                 │
│  • Bootloader (signature verification)                      │
│  • Fault handlers                                           │
│  • Power stage control (LLC switching)                      │
│  • CAN-FD driver                                            │
│  • Cryptographic operations                                 │
│  Size: ~20KB, rarely updated, extensively tested            │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 2: SERVICES (Isolated, sandboxed)                    │
│  ═══════════════════════════════════════                    │
│  • Health monitoring                                        │
│  • Thermal management                                       │
│  • Swarm coordination                                       │
│  • Logging                                                  │
│  • OTA update handler                                       │
│  Bugs here cannot compromise Level 0/1                      │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  LEVEL 3: EXTERNAL (Authenticated, rate-limited)            │
│  ═══════════════════════════════════════════════            │
│  • Commands from Station Controller                         │
│  • Firmware updates                                         │
│  • Configuration changes                                    │
│  All require CMAC authentication + RBAC check               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Role-Based Access Control (RBAC)

```
RBAC PERMISSION MATRIX
═══════════════════════════════════════════════════════════════

┌────────────────────────────────────────────────────────────────────────┐
│ PERMISSION          │ MODULE │ STATION │ MAINT │ CLOUD │ FACTORY      │
│                     │ PEER   │ CTRL    │       │       │              │
├─────────────────────┼────────┼─────────┼───────┼───────┼──────────────┤
│ READ_STATUS         │   ✓    │    ✓    │   ✓   │   ✓   │      ✓       │
│ READ_TELEMETRY      │   ✓    │    ✓    │   ✓   │   ✓   │      ✓       │
│ READ_LOGS           │   ✗    │    ✓    │   ✓   │   ✓   │      ✓       │
├─────────────────────┼────────┼─────────┼───────┼───────┼──────────────┤
│ SET_POWER           │   ✗    │    ✓    │   ✓   │   ✗   │      ✓       │
│ SET_VOLTAGE         │   ✗    │    ✓    │   ✓   │   ✗   │      ✓       │
│ SHUTDOWN            │   ✗    │    ✓    │   ✓   │   ✓   │      ✓       │
├─────────────────────┼────────┼─────────┼───────┼───────┼──────────────┤
│ CONFIG_CHANGE       │   ✗    │    ✗    │   ✓   │   ✗   │      ✓       │
│ FIRMWARE_UPDATE     │   ✗    │    ✗    │   ✗   │   ✓   │      ✓       │
│ FACTORY_RESET       │   ✗    │    ✗    │   ✗   │   ✗   │      ✓       │
│ KEY_ROTATION        │   ✗    │    ✗    │   ✗   │   ✗   │      ✓       │
├─────────────────────┼────────┼─────────┼───────┼───────┼──────────────┤
│ THERMAL_SHARE       │   ✓    │    ✗    │   ✗   │   ✗   │      ✗       │
│ ELECTION_VOTE       │   ✓    │    ✗    │   ✗   │   ✗   │      ✗       │
└────────────────────────────────────────────────────────────────────────┘

Role Assignment:
• MODULE_PEER: Other EK3 modules (same rack)
• STATION_CONTROLLER: Local station controller
• MAINTENANCE: On-site technician with auth token
• CLOUD_ADMIN: Remote cloud with certificate
• FACTORY: Manufacturing provisioning
```

### 13.3 Key Management

```
KEY HIERARCHY
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                     ROOT KEY (Factory)                       │
│            Stored in HSM, never exported                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ DEPOT KEY       │ │ SIGNING KEY     │ │ RECOVERY KEY    │
│ (per depot)     │ │ (firmware)      │ │ (emergency)     │
└────────┬────────┘ └─────────────────┘ └─────────────────┘
         │
         ▼
┌─────────────────┐
│ MODULE KEY      │
│ (per module)    │ ← Derived: HKDF(DEPOT_KEY, module_serial)
│ Stored in OTP   │
└─────────────────┘


KEY ROTATION
═══════════════════════════════════════════════════════════════

Module keys can be rotated:
1. New key generated: HKDF(DEPOT_KEY, module_serial, rotation_counter)
2. Encrypted with old key, sent to module
3. Module decrypts, stores in OTP (new slot)
4. ACK sent, old key slot invalidated

Rotation triggers:
• Scheduled: Every 12 months
• On-demand: After security incident
• Module transfer: New depot key


KEY STORAGE ON MODULE
═══════════════════════════════════════════════════════════════

STM32G4 Secure Storage:
• Option Bytes: RDP Level 2 (permanent read protection)
• OTP area: Module key, public keys for signature verification
• Backup SRAM: Session keys (cleared on tamper)

Key slots:
┌─────────────────────────────────────────────────────────────┐
│ SLOT │ KEY TYPE              │ SIZE   │ WRITEABLE          │
├──────┼───────────────────────┼────────┼────────────────────┤
│ 0    │ Module key (current)  │ 16B    │ Once (OTP)         │
│ 1    │ Module key (previous) │ 16B    │ Once (OTP)         │
│ 2    │ Firmware signing pub  │ 32B    │ Once (OTP)         │
│ 3    │ Depot public key      │ 32B    │ Factory only       │
│ 4-7  │ Reserved              │ 64B    │ -                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 14. Audit Logging

### 14.1 Log Storage

```
AUDIT LOG FLASH STORAGE
═══════════════════════════════════════════════════════════════

Location: 0x0806_8000 - 0x0807_7FFF (64KB)
Type: Circular buffer (oldest entries overwritten)

Log Entry Format:
┌─────────────────────────────────────────────────────────────┐
│ OFFSET │ SIZE  │ FIELD                                     │
├────────┼───────┼───────────────────────────────────────────┤
│ 0      │ 4     │ Timestamp (Unix seconds)                  │
│ 4      │ 2     │ Sequence number                           │
│ 6      │ 1     │ Event type                                │
│ 7      │ 1     │ Severity (1-5)                            │
│ 8      │ 24    │ Event-specific data                       │
├────────┼───────┼───────────────────────────────────────────┤
│ 32     │ -     │ Total entry size: 32 bytes                │
└─────────────────────────────────────────────────────────────┘

Capacity: 64KB / 32 bytes = 2048 entries
Retention: ~7 days at normal event rate
```

### 14.2 Event Types

```
LOGGED EVENT TYPES
═══════════════════════════════════════════════════════════════

POWER EVENTS (0x1x):
  0x10: POWER_ON
  0x11: POWER_OFF
  0x12: OUTPUT_ENABLED
  0x13: OUTPUT_DISABLED
  0x14: POWER_LIMIT_CHANGE {old_limit, new_limit}

STATE TRANSITIONS (0x2x):
  0x20: STATE_CHANGE {old_state, new_state, reason}
  0x21: DEGRADED_ENTER {reason_code}
  0x22: DEGRADED_EXIT

FAULT EVENTS (0x3x):
  0x30: FAULT_OCP {current_ma, threshold_ma}
  0x31: FAULT_OVP {voltage_mv, threshold_mv}
  0x32: FAULT_OTP {temp_c, threshold_c}
  0x33: FAULT_COMM {error_count, last_error}
  0x34: FAULT_CLEARED {fault_type}

SECURITY EVENTS (0x4x):
  0x40: AUTH_SUCCESS {role, source_id}
  0x41: AUTH_FAILURE {role, source_id, reason}
  0x42: CMAC_INVALID {message_id}
  0x43: REPLAY_DETECTED {sequence, expected}
  0x44: TAMPER_ALERT {type}

UPDATE EVENTS (0x5x):
  0x50: FW_UPDATE_START {version, size}
  0x51: FW_UPDATE_COMPLETE {version}
  0x52: FW_UPDATE_FAILED {error_code}
  0x53: FW_ROLLBACK {from_version, to_version}

SWAP EVENTS (0x6x):
  0x60: SWAP_REQUESTED {reason}
  0x61: SWAP_PREPARE
  0x62: SWAP_COMPLETE
  0x63: SWAP_CANCELLED {reason}
```

### 14.3 Log Synchronization

```
LOG UPLOAD PROTOCOL
═══════════════════════════════════════════════════════════════

Periodic sync (every 5 minutes):
1. Module → Station Controller: LOG_SYNC_REQUEST
2. Station sends last known sequence number
3. Module sends all entries since that sequence
4. Entries encoded as CBOR (compact binary)
5. Station ACKs, module marks as synced

Batch format:
{
  "module_id": "EK3-00001234",
  "batch_seq": 42,
  "entries": [
    {"ts": 1735900800, "seq": 1000, "type": 0x10, "sev": 2, "data": "..."},
    {"ts": 1735900801, "seq": 1001, "type": 0x20, "sev": 2, "data": "..."},
    ...
  ]
}


RETENTION POLICY
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ LOCATION           │ RETENTION     │ PURPOSE               │
├────────────────────┼───────────────┼───────────────────────┤
│ Module flash       │ ~7 days       │ Local buffer          │
│ Station Controller │ 90 days       │ Operational analysis  │
│ Depot Controller   │ 1 year        │ Maintenance records   │
│ Cloud              │ 2 years       │ Compliance, warranty  │
└─────────────────────────────────────────────────────────────┘

Security events (0x4x): Extended retention (5 years)
Fault events (0x3x): Extended retention (3 years)
```

---

## References

- Infineon Application Note: "Design Guide for LLC Converters"
- Texas Instruments: "SiC Gate Driver Design"
- Würth Elektronik: "Planar Transformer Design Guide"
- IEC 62477-1: Safety requirements for power electronic converter systems
- NIST SP 800-38B: Recommendation for Block Cipher Modes of Operation: CMAC
- ISO 11898-1:2015: Road vehicles - CAN-FD specification
- FreeRTOS Reference Manual
- STM32G4 Reference Manual (RM0440)
