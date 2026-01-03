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
Dimenzije:      100 × 300 × 44 mm (blade server form factor)
Masa:           ~2.5 kg
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
BLADE SERVER FORM FACTOR
═══════════════════════════════════════════════════════════════

Inspiracija: HP ProLiant BL460c, Dell M1000e blades

Dimenzije: 100 × 300 × 44 mm (W × D × H)

       ◀────────── 300mm ──────────▶
      ┌──────────────────────────────┐
      │                              │ ▲
      │     ┌──────────────────┐     │ │
      │     │                  │     │ 44mm
      │     │   EK3 MODULE     │     │ │
      │     │                  │     │ ▼
      │     └──────────────────┘     │
      │          100mm               │
      └──────────────────────────────┘
              ▲
              │
        Connector side
         (blind mate)

Zašto ove dimenzije:
• 44mm = 1U height (standardno za rack)
• 300mm dubina - praktično za komponente
• 100mm širina - dozvoljava gustinu + airflow
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

## References

- Infineon Application Note: "Design Guide for LLC Converters"
- Texas Instruments: "SiC Gate Driver Design"
- Würth Elektronik: "Planar Transformer Design Guide"
- IEC 62477-1: Safety requirements for power electronic converter systems
