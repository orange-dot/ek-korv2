# EMC/EMI za EV Punjače

## 1. EMC Standardi

### 1.1 Primenjivi Standardi

```
EMC Standardi za EV Charging Equipment:

┌─────────────────────────────────────────────────────────────────┐
│ Standard        │ Scope                                         │
├─────────────────┼───────────────────────────────────────────────┤
│ IEC 61851-21-2  │ EMC requirements for EV charging              │
│ EN 55011        │ Industrial, scientific equipment (emissions) │
│ EN 55032        │ Multimedia equipment emissions               │
│ EN 61000-3-2   │ Harmonic current emissions                    │
│ EN 61000-3-3   │ Voltage fluctuations and flicker              │
│ EN 61000-3-12  │ Harmonic currents (>16A per phase)            │
│ EN 61000-4-x   │ Immunity tests (series)                       │
│ CISPR 11       │ Radiated/Conducted emissions                  │
│ FCC Part 15    │ US emissions requirements                     │
└─────────────────────────────────────────────────────────────────┘

Emissions Classes:

Class A (Industrial):
- Less strict limits
- Warning label required
- Typically for commercial EV chargers

Class B (Residential):
- Stricter limits
- For home/public locations
- Generally recommended for all EV chargers
```

### 1.2 Emisije Limits

```
Conducted Emissions (CISPR 11 Class B):

Frequency Range: 150 kHz - 30 MHz

│ Frequency (MHz)   │ Quasi-peak (dBμV) │ Average (dBμV) │
├───────────────────┼───────────────────┼────────────────┤
│ 0.15 - 0.5        │ 66 - 56           │ 56 - 46        │
│ 0.5 - 5           │ 56                │ 46             │
│ 5 - 30            │ 60                │ 50             │

Radiated Emissions (CISPR 11 Class B):

Frequency Range: 30 MHz - 1 GHz

│ Frequency (MHz)   │ Limit (dBμV/m @ 10m) │
├───────────────────┼──────────────────────┤
│ 30 - 230          │ 30                   │
│ 230 - 1000        │ 37                   │

Harmonic Currents (IEC 61000-3-12 za >16A):

│ Harmonic Order │ Current Limit (% fundamental) │
├────────────────┼───────────────────────────────┤
│ 3              │ 21.6                          │
│ 5              │ 10.7                          │
│ 7              │ 7.2                           │
│ 9              │ 3.8                           │
│ 11             │ 3.1                           │
│ 13             │ 2.0                           │
```

## 2. EMI Filtering

### 2.1 Filter Topologija

```
Tipična EMI Filter Struktura:

                   AC INPUT
    L1 ──┬─────────────────────────────────────────── To PFC
        ─┴─ Cx1
    L2 ──┼──⌇⌇⌇⌇──┬──⌇⌇⌇⌇──┬─────────────────────── To PFC
        ─┬─      ─┴─ Cx2  ─┴─ Cx3
    L3 ──┼───────┼─────────┼───────────────────────── To PFC
        ─┴─      │         │
    N  ──┼───────┼─────────┼───────────────────────── To PFC
         │       │         │
        ═╪═ Cy  ═╪═ Cy    ═╪═ Cy
         │       │         │
    PE ──┴───────┴─────────┴───────────────────────── PE

Components:
1. CM Choke (Common Mode):
   - Blocks CM noise
   - High impedance for CM
   - Low impedance for DM

2. Cx Capacitors (Line-to-Line):
   - X2 rated (safety)
   - 0.1 - 4.7 μF typical
   - Attenuates DM noise

3. Cy Capacitors (Line-to-Ground):
   - Y2 rated (safety)
   - Limited by leakage current (<3.5mA)
   - 2.2 - 47 nF typical
   - Attenuates CM noise

Multi-Stage Filter:

Stage 1:     Stage 2:      Stage 3:
High freq    Mid freq      Low freq
┌─────┐     ┌─────┐        ┌─────┐
│ CM1 │─────│ CM2 │────────│ DM  │──── Output
│ Cy  │     │ Cx  │        │ L+C │
└─────┘     └─────┘        └─────┘
```

### 2.2 Filter Component Selection

```
CM Choke Sizing:

Required impedance at noise frequency:
Z_CM = |V_noise| / |I_allowed|

For 150 kHz: L_CM = 5-10 mH typical
For 1 MHz: L_CM = 1-2 mH typical

Core Selection:
- Nanocrystalline: Best performance, highest cost
- Amorphous: Good performance, moderate cost
- Ferrite: Lower performance at LF, good HF

Products:
1. Vacuumschmelze VITROPERM (nanocrystalline)
   - 5 mH @ 250A
   - Price: €80-120

2. Schaffner RN series
   - Integrated CM+DM
   - Various ratings
   - Price: €50-100

3. TDK/EPCOS CM chokes
   - Standard sizes
   - Price: €30-80

X Capacitor Sizing:

Attenuation: A = 20 × log10(1 / (2πfRC + 1))

For 50 dB at 150 kHz with Z_source = 50Ω:
C = 1 / (2π × 150k × 50 × 10^(-50/20)) = 6.7 μF

Practical: 2.2 - 4.7 μF × 2-3 stages

Y Capacitor Sizing:

Limited by leakage current:
I_leak = V × 2πf × C_total

For I_leak < 3.5 mA @ 230V, 50Hz:
C_total < 3.5m / (230 × 2π × 50) = 48 nF

Per phase: C_y < 16 nF → typically 4.7-10 nF
```

### 2.3 PCB Filter Layout

```
EMI Filter PCB Layout Rules:

1. Input/Output Separation:
   ┌─────────────────────────────────────────────────────────────┐
   │                                                             │
   │    INPUT                                    OUTPUT          │
   │    ═══════                                  ═══════         │
   │       │                                        │            │
   │       │                                        │            │
   │   ┌───┴───┐   ┌───────┐   ┌───────┐   ┌───┴───┐          │
   │   │Stage 1│───│Stage 2│───│Stage 3│───│ To    │          │
   │   │       │   │       │   │       │   │ Power │          │
   │   └───────┘   └───────┘   └───────┘   └───────┘          │
   │       │                                    │              │
   │       │     Keep maximum separation        │              │
   │       └────────────────────────────────────┘              │
   │                 (avoid coupling)                           │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘

2. Ground Plane Strategy:

   - Continuous ground plane under filter
   - Single point connection to chassis
   - Avoid ground loops

3. Component Placement:

   - Cy caps close to CM choke
   - Cx caps between stages
   - DM inductor at output stage
```

## 3. Shielding

### 3.1 Cabinet Shielding

```
Enclosure Shielding Effectiveness:

SE (dB) = 20 × log10(E_incident / E_transmitted)

Zahtev za Class B: SE > 40 dB @ 30 MHz

Metode:

1. Metal Enclosure:
   - Steel: >60 dB typical
   - Aluminum: >50 dB typical
   - Requires proper bonding at seams

2. Conductive Gaskets:
   - EMI gaskets at door seams
   - Finger stock or mesh type
   - Price: €10-30 per meter

3. Feedthrough Filters:
   - For cables entering enclosure
   - Pi-filter type
   - Price: €5-20 per filter

4. Ventilation:
   - Honeycomb panels for airflow
   - Maintain shielding while allowing cooling
   - Price: €50-100 per panel

Cable Entry Points:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CABINET WALL                                              │
│   ═══════════════════════════════════════════════════      │
│                     │                                       │
│              ┌──────┴──────┐                               │
│              │  Feedthrough │                               │
│              │   Filter     │                               │
│              │    ┌───┐     │                               │
│   Outside ───┤    │ C │     ├─── Inside                    │
│              │    └─┬─┘     │                               │
│              │      │       │                               │
│              │   ══GND══    │                               │
│              └──────────────┘                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Level Shielding

```
Power Module Shielding:

Problem: High dV/dt switching creates EMI

Solutions:

1. Module placement:
   - Away from sensitive circuits
   - Close to filter components
   - Short connections to DC bus

2. DC Link layout:
   - Laminated bus bar (low inductance)
   - Decoupling caps at module
   - Minimize loop area

3. Gate driver isolation:
   - Shielded gate driver PCB
   - Short gate leads
   - Twisted pair for gate signals

Transformer Shielding:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     Primary          Shield         Secondary              │
│    ┌───────┐     ┌───────────┐     ┌───────┐              │
│    │ ∿∿∿∿  │     │  Copper   │     │ ∿∿∿∿  │              │
│    │       │     │   Foil    │     │       │              │
│    │       │     │   (1-2    │     │       │              │
│    │       │     │   turns)  │     │       │              │
│    │ ∿∿∿∿  │     │           │     │ ∿∿∿∿  │              │
│    └───┬───┘     └─────┬─────┘     └───────┘              │
│        │               │                                   │
│        │               └──── PE (single point)             │
│        │                                                   │
│    Primary              Shield blocks capacitive           │
│    Side                 coupling of CM noise               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 4. Immunity Testing

### 4.1 Test Requirements

```
Immunity Tests per IEC 61000-4:

│ Test                    │ Standard      │ Level    │ Criteria │
├─────────────────────────┼───────────────┼──────────┼──────────┤
│ ESD                     │ IEC 61000-4-2 │ 8kV air  │ B        │
│                         │               │ 4kV cont │          │
│ Radiated immunity       │ IEC 61000-4-3 │ 10 V/m   │ A        │
│ EFT/Burst               │ IEC 61000-4-4 │ 2kV      │ B        │
│ Surge (L-N)             │ IEC 61000-4-5 │ 2kV      │ B        │
│ Surge (L-PE)            │ IEC 61000-4-5 │ 4kV      │ B        │
│ Conducted immunity      │ IEC 61000-4-6 │ 10V      │ A        │
│ Power freq. magnetic    │ IEC 61000-4-8 │ 30 A/m   │ A        │
│ Voltage dips            │ IEC 61000-4-11│ various  │ B/C      │

Performance Criteria:
A = No degradation
B = Temporary degradation, self-recovery
C = Temporary degradation, operator intervention needed
```

### 4.2 Design for Immunity

```
ESD Protection:

1. External interfaces:
   - TVS diodes on all external signals
   - ESD suppressors at connectors

2. Touch surfaces:
   - Grounded metal parts
   - Discharge path to PE

EFT/Burst Protection:

1. AC input:
   - CMC provides attenuation
   - Additional ferrite beads

2. Signal cables:
   - Shielded cables
   - Ferrite cores at entry point

Surge Protection:

1. AC side:
   - Type 2 SPD (MOV based)
   - Coordinated with upstream protection

2. DC side:
   - MOV + GDT combination
   - Sized for energy absorption

DC Link Surge Suppressor:

    DC+ ──┬──────────────────────────── Load
          │
         ─┴─ MOV (1200V)
         ─┬─
          │
    DC- ──┴──────────────────────────── Load
```

## 5. Testing i Certification

### 5.1 Pre-Compliance Testing

```
In-House EMC Testing:

Equipment Needed:

1. Spectrum Analyzer:
   - Rigol DSA815 (budget)
   - Rohde & Schwarz FPC1000 (mid-range)
   - Frequency: 9 kHz - 1 GHz minimum

2. LISN (Line Impedance Stabilization Network):
   - For conducted emissions
   - 50Ω/50μH per CISPR 16

3. Near-field Probes:
   - H-field (magnetic)
   - E-field (electric)
   - For locating noise sources

4. Oscilloscope:
   - High bandwidth (≥200 MHz)
   - For transient analysis

Pre-scan Process:

1. Conducted emissions scan (150 kHz - 30 MHz)
2. Compare to limits
3. Identify problematic frequencies
4. Locate source with near-field probes
5. Implement fixes
6. Re-scan

Typical Issues and Fixes:

│ Problem                │ Likely Source      │ Fix                │
├────────────────────────┼────────────────────┼────────────────────┤
│ Spikes at f_sw harmonics│ Power stage       │ Add CM filter      │
│ Broadband noise 1-10MHz│ SMPS control      │ Snubbers, layout   │
│ >30 MHz emissions      │ Fast edges        │ Gate resistor, RC  │
│ Harmonic current       │ PFC operation     │ Improve control    │
```

### 5.2 Certification Labs

```
EMC Test Labs (EU):

1. TÜV SÜD
2. TÜV Rheinland
3. Intertek
4. SGS
5. Bureau Veritas

Certification Cost Estimate:

│ Test                    │ Duration  │ Cost (approx)  │
├─────────────────────────┼───────────┼────────────────┤
│ Conducted emissions     │ 1 day     │ €1,000-2,000   │
│ Radiated emissions      │ 1-2 days  │ €2,000-4,000   │
│ Harmonics               │ 0.5 day   │ €500-1,000     │
│ Immunity suite          │ 2-3 days  │ €3,000-6,000   │
│ Documentation/Report    │ -         │ €1,000-2,000   │
├─────────────────────────┼───────────┼────────────────┤
│ TOTAL                   │ 5-7 days  │ €7,500-15,000  │
```

## 6. Bill of Materials - EMC

```
┌─────────────────────────────────────────────────────────────────┐
│ EMC KOMPONENTE (150 kW DC Punjač)                               │
├──────────────────────────────┬─────┬────────────┬───────────────┤
│ Komponenta                   │ Qty │ Jed. cena  │    Ukupno     │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ 3-phase EMI Filter 250A      │  1  │   €400     │    €400       │
│ (Schaffner FN3280)           │     │            │               │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ DC Output EMI Filter         │  1  │   €150     │    €150       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Additional CM chokes         │  2  │    €50     │    €100       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ X2 Capacitors set            │ set │    €30     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Y2 Capacitors set            │ set │    €20     │     €20       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Ferrite cores/beads          │ set │    €30     │     €30       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ EMI gaskets/shielding        │ set │    €80     │     €80       │
├──────────────────────────────┼─────┼────────────┼───────────────┤
│ Feedthrough filters          │  6  │    €15     │     €90       │
├──────────────────────────────┴─────┴────────────┼───────────────┤
│ UKUPNO EMC                                      │    €900       │
└─────────────────────────────────────────────────┴───────────────┘
```
