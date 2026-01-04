# Power Electronics Architecture

## Philosophy: Better, Not Easier

```
TRADITIONAL                      ELEKTROKOMBINACIJA
───────────────────────────────────────────────────────────
IGBT (cheaper)              →    SiC MOSFET (50% lower losses)
2-level topology            →    3-level NPC (better THD, lower stress)
Si diodes                   →    SiC Schottky (zero recovery)
Air cooling                 →    Liquid cooling (2× density)
Fixed frequency PWM         →    AI-optimized switching
Fixed protection limits     →    Adaptive AI thresholds
Single module              →    Parallel modules with droop control
```

---

## 1. SiC MOSFET Selection

### Why SiC instead of IGBT?

| Parameter | Si IGBT | SiC MOSFET | Advantage |
|-----------|---------|------------|----------|
| Switching losses | 100% (baseline) | 30-50% | 50-70% lower |
| Conduction losses | Vce(sat) ~2V | Rds(on) × I² | 30-40% lower at partial load |
| Max junction temp | 150°C | 175°C | Higher thermal margin |
| Switching frequency | <20 kHz typical | >100 kHz | 5× higher frequency |
| Body diode | Slow recovery | Fast/Zero recovery | No reverse recovery losses |
| Temperature coefficient | Negative | Positive | Natural current balancing |

### Selected SiC MOSFETs

#### EK3 (3.3 kW) - Wolfspeed 900V SiC

```
Component: C3M0065090D (recommended)
─────────────────────────────────────────
Voltage: 900V
Current: 36A continuous
Rds(on): 65 mΩ @ 25°C, ~110 mΩ @ 150°C
Package: TO-247-4 (Kelvin source)

Why 900V for 650V DC link?
• Optimal balance of cost and margin
• Sufficient margin for voltage spikes (~40%)
• Better Rds(on) than 1200V variants
• Lower cost than 1200V class

Thermal Derating:
─────────────────
Tj (°C)    Rds(on)     Max Current
25         65 mΩ       36A (100%)
100        95 mΩ       28A (78%)
150        110 mΩ      22A (61%)
175        125 mΩ      18A (50%)

Alternatives:
• Infineon IMZ120R045M1 (1200V) - higher margin
• ROHM SCT3030AR (650V) - if DC link is lower
• Onsemi NTH4L022N065SC (650V) - cost optimized
```

#### EK30 (30 kW) - Wolfspeed Gen 4

```
Component: CAB011M12FM3 (Six-Pack Module)
─────────────────────────────────────────
Voltage: 1200V
Current: 200A per phase
Rds(on): 11 mΩ (full bridge 100A config)
Package: 62mm industry standard

Gen 4 advantages (vs Gen 3):
• 22% lower Rds(on) @ 125°C
• 60% lower turn-on energy
• 30% lower switching losses (soft body diode)
• 50% lower VDS overshoot

Availability: Sampling now, production Q1 2026
```

### Alternative: Infineon CoolSiC G2

```
Component: AIMW120R015M2 (or module)
─────────────────────────────────────
Voltage: 1200V
Rds(on): 15 mΩ
Advantage: 25% lower switching losses vs G1
Package: Various (discrete and modules)

When to use Infineon:
• If Wolfspeed is unavailable
• For second-source strategy
• Automotive-qualified variants (AEC-Q101)
```

---

## 2. Topology: 3-Level NPC (AC/DC PFC Stage)

### Why 3-Level instead of 2-Level?

```
2-LEVEL                          3-LEVEL NPC
    │                                │
    ▼                                ▼
┌───────┐                      ┌───────────┐
│  S1   │─┐                    │    S1     │─┐
└───────┘ │                    └───────────┘ │
          ├── Vdc                   D1 ──┤  │
┌───────┐ │                    ┌───────────┐ │
│  S2   │─┘                    │    S2     │─┼── Vdc/2
└───────┘                      └───────────┘ │
                                    D2 ──┤  │    ← Neutral point
   Vout: 0 or Vdc              ┌───────────┐ │
                               │    S3     │─┼── Vdc/2
                               └───────────┘ │
                                    D3 ──┤  │
                               ┌───────────┐ │
                               │    S4     │─┘
                               └───────────┘

                               Vout: 0, Vdc/2, or Vdc
```

### 3-Level NPC Advantages

| Parameter | 2-Level | 3-Level NPC | Improvement |
|-----------|---------|-------------|-------------|
| Voltage stress per switch | Vdc | Vdc/2 | 50% lower |
| Output THD | ~5% | <2% | 60% better |
| dv/dt stress | High | Low | EMC friendly |
| Filter size | Baseline | 50% smaller | Lower weight |
| Switching losses | Baseline | 30% lower | Higher efficiency |

### T-Type vs I-NPC Variants

```
T-TYPE NPC (Selected for EK30)
─────────────────────────────
       S1 (1200V)
          │
    ┌─────┼─────┐
    │     │     │
   S2a   OUT   S2b    ← Bidirectional switch (2×650V)
    │     │     │
    └─────┼─────┘
          │
       S3 (1200V)

T-Type advantages:
• Fewer components than I-NPC
• Lower conduction losses
• Optimal for fsw < 50 kHz

I-NPC (Alternative for higher frequency)
───────────────────────────────────────
• All switches can be 650V
• Better for fsw > 50 kHz
• More complex control
```

### Implementation for EK30

```
DC Bus: 800V nominal (up to 1000V max)
───────────────────────────────────

High-side: 1200V SiC MOSFET (Wolfspeed Gen 4)
Mid-point: 2× 650V SiC MOSFET back-to-back
Low-side: 1200V SiC MOSFET (Wolfspeed Gen 4)

Switching frequency: 30-50 kHz
• Optimal for T-type topology
• Good balance of efficiency and size

Gate driver: Isolated, +18V/-5V
• Positive bias: 18V for full SiC turn-on
• Negative bias: -5V for immunity from parasitic turn-on
```

### 2.1 PFC Control Loop Architecture

The 3-level NPC PFC requires a dual-loop control structure: an outer voltage loop for DC bus regulation and an inner current loop for power factor correction.

```
DUAL-LOOP PFC CONTROL ARCHITECTURE
════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────┐
                    │         VOLTAGE LOOP (Outer)        │
                    │                                     │
  Vdc_ref ─────────►│  ┌─────┐     ┌──────┐              │
  (800V)            │  │  -  │     │      │    Iref      │
                    │  │  Σ  ├────►│  PI  ├─────────────►│────┐
  Vdc_fb ──────────►│  │  +  │     │      │              │    │
                    │  └─────┘     └──────┘              │    │
                    │                                     │    │
                    │  Bandwidth: 5-10 Hz                │    │
                    │  Kp = 0.5, Ki = 50                 │    │
                    └─────────────────────────────────────┘    │
                                                               │
    ┌──────────────────────────────────────────────────────────┘
    │
    │   ┌─────────────────────────────────────────────────────────┐
    │   │              CURRENT LOOP (Inner)                       │
    │   │                                                         │
    │   │              ┌───────┐                                  │
    │   │   |sin(θ)|   │       │                                  │
    ▼   │  ┌───────┐   │   ×   │   Iref_shaped                    │
  Iref ─┼─►│  PLL  ├──►│       ├─────────────┐                    │
        │  └───────┘   └───────┘             │                    │
        │                                     ▼                    │
        │                               ┌─────────┐               │
        │                               │    -    │    ┌───────┐  │
        │                               │    Σ    ├───►│  PR   ├──┼──► PWM
        │                               │    +    │    │       │  │
        │                               └─────────┘    └───────┘  │
        │                                     ▲                    │
        │   ┌──────────────┐                  │                    │
        │   │ Current      │                  │                    │
  Iac ──┼──►│ Sensor       ├──────────────────┘                    │
        │   │ (TLI4971)    │                                       │
        │   └──────────────┘                                       │
        │                                                         │
        │   Bandwidth: 1-3 kHz                                    │
        │   PR Controller: Kp=10, Kr=1000, ω0=2π×50Hz            │
        └─────────────────────────────────────────────────────────┘

Control Parameters for EK30 (30 kW):
────────────────────────────────────
Voltage Loop:
  • Crossover frequency: 10 Hz
  • Phase margin: >60°
  • Proportional gain Kp: 0.5
  • Integral gain Ki: 50 (Ti = 10ms)

Current Loop:
  • Crossover frequency: 2 kHz
  • Phase margin: >45°
  • PR resonant frequency: 50 Hz (grid)
  • Harmonic compensation: 3rd, 5th, 7th

Feedforward:
  • Vac_ff = Vac_measured / Vdc → reduces transient response time
  • Improves disturbance rejection by 20 dB
```

### 2.2 PLL Grid Synchronization

```
SOGI-PLL (Second-Order Generalized Integrator PLL)
══════════════════════════════════════════════════

Single-phase grid requires orthogonal signal generation:

          ┌─────────────────────────────────────────┐
          │              SOGI Block                 │
          │                                         │
  Vgrid ──┼──►┌───┐    ┌─────┐    ┌───┐           │
          │   │ - │    │     │    │   │   Vα      │
          │   │ Σ ├───►│ k×ω ├───►│ ∫ ├──────────►│───┐
          │   │ + │    │     │    │   │           │   │
          │   └───┘    └─────┘    └───┘           │   │
          │     ▲                   │              │   │
          │     │    ┌───┐         ▼              │   │
          │     │    │   │    ┌─────┐    Vβ      │   │
          │     └────┤ ∫ │◄───┤  ω  ├────────────►│───┤
          │          │   │    └─────┘             │   │
          │          └───┘                        │   │
          └─────────────────────────────────────────┘   │
                                                        │
          ┌─────────────────────────────────────────────┘
          │
          │    ┌─────────────────────────────────────┐
          │    │           Park Transform            │
          │    │                                     │
          ▼    │   ┌─────────────────┐              │
        Vα ───►│   │  Vd = Vα×cos(θ) + Vβ×sin(θ)   │──► Vd
               │   │  Vq = -Vα×sin(θ) + Vβ×cos(θ)  │──► Vq
        Vβ ───►│   └─────────────────┘              │
               │              ▲                      │
               │              │                      │
               │     ┌────────┴────────┐            │
               │     │   θ = ∫ω dt     │◄── ω_est  │
               │     └─────────────────┘            │
               └─────────────────────────────────────┘

          ┌─────────────────────────────────────────┐
          │        Frequency/Phase Estimator        │
          │                                         │
   Vq ───►│   ┌───┐    ┌─────┐    ┌───┐           │
          │   │ - │    │     │    │   │   ω_est   │
   0 ────►│   │ Σ ├───►│ PI  ├───►│ + ├──────────►│──► ω
          │   │ + │    │     │    │   │           │
          │   └───┘    └─────┘    └───┘           │
          │                         ▲              │
          │                         │              │
          │                    ω_nominal           │
          │                    (2π×50)             │
          └─────────────────────────────────────────┘

SOGI-PLL Performance Specifications:
────────────────────────────────────
• Lock time (from cold start): <50 ms
• Frequency tracking range: 47-53 Hz (±6%)
• Phase error (steady state): <1°
• Frequency step response: <100 ms to settle
• THD rejection: >40 dB for 3rd, 5th harmonics

Implementation (STM32G474):
──────────────────────────
• Sample rate: 20 kHz (50 µs period)
• SOGI gain k: 1.41 (√2 for optimal damping)
• PI gains: Kp_pll = 100, Ki_pll = 5000
• Execution time: <5 µs per cycle
```

### 2.3 Soft-Start and Inrush Control

```
SOFT-START SEQUENCE
═══════════════════════════════════════════════════════════════

Phase 1: Pre-Charge (0-500 ms)
─────────────────────────────
• Relay bypasses main contactor
• Current limited by pre-charge resistor (50Ω)
• DC bus charges to ~90% of peak AC voltage
• Inrush current limited to <10A peak

Phase 2: Contactor Engage (500-600 ms)
──────────────────────────────────────
• Pre-charge relay opens
• Main contactor closes at low current point
• Transition validated by current sensor

Phase 3: Active Ramp (600-5000 ms)
──────────────────────────────────
• PWM gradually enabled
• Iref ramped: 0 → 100% over 4 seconds
• Ramp profile: S-curve (reduces stress)

Phase 4: Normal Operation (>5000 ms)
────────────────────────────────────
• Full power available
• Protection systems armed

         │
    Iref │                         ┌──────────────────
    100% │                      .-'
         │                   .-'
         │                .-'
         │             .-'          Phase 3: S-curve ramp
         │          .-'
         │       .-'
         │     .'
         │   .'      Phase 2: Engage
         │  │ Phase 1: Pre-charge
     0%  └──┴───┬────┬────────────┬──────────────────► Time
              0.5   0.6          5.0 seconds

Inrush Current Calculations:
────────────────────────────
Pre-charge resistor: R_pc = 50Ω
Vac_peak = 325V (for 230V RMS)
I_inrush_max = Vac_peak / R_pc = 325V / 50Ω = 6.5A

DC bus capacitor: C_bus = 1000 µF
Charge time constant: τ = R_pc × C_bus = 50 ms
Time to 90%: t_90 = 2.3 × τ = 115 ms

Safety margin: Use 500 ms for reliable pre-charge
```

---

## 3. DC-DC Stage: LLC Resonant

### Why LLC?

```
LLC RESONANT ADVANTAGES
──────────────────────
1. Zero Voltage Switching (ZVS) from no-load to full-load
2. Zero Current Switching (ZCS) on secondary diodes
3. Soft switching = minimal EMI
4. Ability to integrate Lr into transformer leakage
5. Simple synchronization for bidirectional operation (V2G)
6. No output inductor required (transformer Lm provides energy storage)
```

### 3.1 LLC Design Methodology

```
LLC DESIGN FLOW
═══════════════════════════════════════════════════════════════

Step 1: Define Requirements
───────────────────────────
• Input voltage range: Vin_min to Vin_max
• Output voltage range: Vout_min to Vout_max
• Output power: Pout
• Efficiency target: η

Step 2: Calculate Transformer Ratio
───────────────────────────────────
n = Vin_nom / (2 × Vout_nom)

For EK3: n = 650V / (2 × 400V) = 0.8125 ≈ 1:1.2 (secondary higher)
Adjusted for losses: n = 1:1 with frequency modulation

Step 3: Determine Gain Range
────────────────────────────
M_max = Vout_max × n / Vin_min
M_min = Vout_min × n / Vin_max

For EK3:
M_max = 500V × 1 / 580V = 0.86
M_min = 50V × 1 / 720V = 0.07

→ Wide range requires careful Ln selection

Step 4: Select Quality Factor (Qe) and Inductance Ratio (Ln)
────────────────────────────────────────────────────────────
• Ln = Lm / Lr (magnetizing / resonant)
• Qe = √(Lr/Cr) / Rac (at full load)
• Rac = (8/π²) × n² × Vout² / Pout

Trade-off:
┌─────────────┬────────────────────────┬─────────────────────────┐
│ Parameter   │ Low Value              │ High Value              │
├─────────────┼────────────────────────┼─────────────────────────┤
│ Ln          │ Wider gain range       │ Better efficiency       │
│             │ More ZVS margin        │ Smaller magnetizing I   │
├─────────────┼────────────────────────┼─────────────────────────┤
│ Qe          │ Easier startup         │ Steeper gain curve      │
│             │ Light load OK          │ Narrower fsw range      │
└─────────────┴────────────────────────┴─────────────────────────┘

Recommended: Ln = 5-7, Qe = 0.3-0.5 for EV charger applications

Step 5: Calculate Resonant Components
─────────────────────────────────────
fr = 1 / (2π × √(Lr × Cr))

From Qe and Rac:
Lr = Qe × Rac / (2π × fr)
Cr = 1 / (Qe × Rac × 2π × fr)
Lm = Ln × Lr
```

### 3.2 Resonant Tank Calculations for EK3

```
EK3 LLC RESONANT TANK DESIGN
════════════════════════════════════════════════════════════════

Given Requirements:
──────────────────
Vin = 650V DC (from central PFC, ±10% → 585-715V)
Vout = 50-500V DC (battery voltage range)
Pout = 3.3 kW continuous, 3.6 kW peak
Target efficiency: >96%

Step-by-Step Calculation:
─────────────────────────

1. Transformer ratio:
   n = Vin_nom / (2 × Vout_nom)
   n = 650 / (2 × 400) = 0.8125
   → Use n = 1:1 with wider frequency range

2. Equivalent AC resistance at full load:
   Rac = (8/π²) × n² × Vout² / Pout
   Rac = (8/9.87) × 1² × 400² / 3300
   Rac = 0.81 × 160000 / 3300
   Rac = 39.2 Ω

3. Select design parameters:
   fr = 200 kHz (resonant frequency)
   Ln = 10 (Lm/Lr ratio)
   Qe = 0.4 (quality factor)

4. Calculate Lr (resonant inductance):
   Lr = Qe × Rac / (2π × fr)
   Lr = 0.4 × 39.2 / (2π × 200000)
   Lr = 15.68 / 1256637
   Lr = 12.5 µH → Use 15 µH (available value)

5. Calculate Cr (resonant capacitor):
   Cr = 1 / ((2π × fr)² × Lr)
   Cr = 1 / ((1256637)² × 15×10⁻⁶)
   Cr = 1 / (1.579×10¹² × 15×10⁻⁶)
   Cr = 42.2 nF → Use 47 nF (E24 series)

6. Recalculate actual resonant frequency:
   fr_actual = 1 / (2π × √(15µH × 47nF))
   fr_actual = 1 / (2π × √(7.05×10⁻¹³))
   fr_actual = 1 / (2π × 8.4×10⁻⁷)
   fr_actual = 190 kHz

7. Calculate Lm (magnetizing inductance):
   Lm = Ln × Lr = 10 × 15 µH = 150 µH

8. Verify ZVS condition:
   For ZVS: I_mag must charge output capacitance
   I_mag_peak = Vin / (4 × Lm × fsw)
   I_mag_peak = 650 / (4 × 150µH × 190kHz)
   I_mag_peak = 5.7 A

   Energy stored: E = ½ × Lm × I²
   E = ½ × 150µH × 5.7²
   E = 2.4 mJ

   Required to charge Coss (4 MOSFETs × 100pF = 400pF):
   E_coss = ½ × 400pF × 650²
   E_coss = 0.085 mJ

   ZVS margin: 2.4 mJ >> 0.085 mJ ✓

FINAL EK3 LLC PARAMETERS:
═══════════════════════════════════════
Resonant frequency (fr):     190 kHz
Switching range:             150-250 kHz
Resonant inductance (Lr):    15 µH
Resonant capacitor (Cr):     47 nF (film, 500V AC)
Magnetizing inductance (Lm): 150 µH
Transformer ratio (n):       1:1
Dead time:                   100-200 ns
```

### 3.3 Transformer Design

```
PLANAR TRANSFORMER FOR EK3
════════════════════════════════════════════════════════════════

Core Selection:
──────────────
Material: Ferrite 3C97 (TDK/EPCOS) or 3F46 (Ferroxcube)
  • Optimized for 100-500 kHz
  • Low core loss: <200 mW/cm³ @ 200 kHz, 50 mT
  • Curie temp: 230°C (safe margin)

Core geometry: E-core (planar)
  • ELP 43/10/28 or similar
  • Ae = 178 mm² (effective area)
  • Le = 84 mm (effective length)
  • Ve = 14960 mm³ (volume)

Flux Density Calculation:
─────────────────────────
B_peak = Vin / (4 × N × Ae × fsw)
B_peak = 650 / (4 × 8 × 178×10⁻⁶ × 190000)
B_peak = 650 / 1.08
B_peak = 60 mT (well below saturation of 400 mT)

Winding Configuration:
──────────────────────
                    Primary          Secondary
Turns (N):          8                8 (1:1 ratio)
Layers:             4                4
PCB copper:         2 oz (70 µm)     2 oz (70 µm)
Track width:        6 mm             6 mm
Paralleled:         2 in parallel    2 in parallel

Layer stackup in PCB:
─────────────────────
Layer 1:  P1, P2 (primary turns 1-2)
Layer 2:  S1, S2 (secondary turns 1-2)
Layer 3:  S3, S4 (secondary turns 3-4)
Layer 4:  P3, P4 (primary turns 3-4)
Layer 5:  P5, P6 (primary turns 5-6)
Layer 6:  S5, S6 (secondary turns 5-6)
Layer 7:  S7, S8 (secondary turns 7-8)
Layer 8:  P7, P8 (primary turns 7-8)

Interleaving P-S-S-P-P-S-S-P minimizes leakage and proximity effect

Leakage Inductance (= Lr):
──────────────────────────
Target: 15 µH (designed into transformer, no external inductor)
Achieved by: Controlled layer spacing + edge gap

Lr = µ₀ × N² × MLT × (h_gap / 3 + Σ(h_cu/3))
    ≈ 15 µH with 0.2mm layer spacing

Thermal Design:
───────────────
Core loss @ 190 kHz, 60 mT: ~3W
Copper loss (I²R): ~4W
Total transformer loss: ~7W
Temperature rise: <30°C with forced air

Isolation:
──────────
Creepage distance: 6 mm (reinforced insulation per IEC 62477)
Clearance: 6 mm
Hipot test: 4 kVAC for 1 minute
```

### 3.4 Frequency Response and Gain Curves

```
LLC GAIN CHARACTERISTICS
════════════════════════════════════════════════════════════════

The LLC converter gain M = Vout/(n×Vin) as function of normalized frequency fn:

      │
  1.4 │                    Qe=0.2
      │                 .-'   '-.
  1.2 │              .-'         '-.    Qe=0.4
      │           .-'               '-.
  1.0 │─────────.'─────────────────────'─────── ← Operating point
      │       .'                         '.
  0.8 │     .'                             '.    Qe=0.6
      │    /                                 \
  0.6 │   /                                   \
      │  /                                     \
  0.4 │ /                                       \
      │/                                         \
  0.2 │                                           \
      │                                            \
    0 └───────┬───────┬───────┬───────┬───────┬────► fn
            0.5     0.75    1.0     1.25    1.5

Where: fn = fsw / fr (normalized switching frequency)

Operating Regions:
──────────────────
Region 1 (fn < 1): Below resonance
  • Gain > 1 (boost mode)
  • ZVS on primary ✓
  • ZCS on secondary may be lost at very low fn

Region 2 (fn = 1): At resonance
  • Gain ≈ 1
  • Maximum efficiency
  • ZVS and ZCS both achieved ✓

Region 3 (fn > 1): Above resonance
  • Gain < 1 (buck mode)
  • ZVS on primary ✓
  • Hard switching on secondary (but current is low)

EK3 Operating Range:
────────────────────
fn_min = 0.79 (150 kHz / 190 kHz) → M ≈ 0.95
fn_max = 1.32 (250 kHz / 190 kHz) → M ≈ 0.65

Output voltage achieved:
  • Vout_max = 0.95 × 650V × 1 = 617V → clamp to 500V
  • Vout_min = 0.65 × 650V × 1 = 422V

For lower Vout (50-422V), use duty cycle modulation (burst mode)
or variable DC link voltage from central PFC.

ZVS Boundary Conditions:
────────────────────────
ZVS is guaranteed when:
  I_mag > I_load / (2 × n)

At light load (10% power):
  I_load = 0.83A
  I_mag_peak = 5.7A (from calculation above)
  5.7A >> 0.42A ✓ (ZVS maintained down to 10% load)

At no-load:
  I_mag still flows → ZVS always maintained ✓
```

### 3.5 Bidirectional LLC for V2G Operation

```
BIDIRECTIONAL LLC TOPOLOGY
════════════════════════════════════════════════════════════════

Normal Mode (Grid → Battery): AC/DC Charging
─────────────────────────────────────────────
Primary side: Half-bridge drives LLC tank
Secondary side: Synchronous rectification (SiC MOSFETs as rectifiers)

         Vin+                                        Vout+
          │                                           │
          │    ┌──────┐                              │
      ┌───┴────┤ S1   ├───┐                         │
      │        └──────┘   │                         │
      │                   │    Lr      Cr           │
    ─┴─ C1               ─┴─  [===]───||───┐       │
      │                   │               │        ─┴─ Cout
      │                   │    ┌─────┐    │         │
      │    ┌──────┐       ├────┤ TX  ├────┼────┬────┤
      └────┤ S2   ├───────┘    │ n:1 │    │    │    │
           └──────┘            └──────┘   │    │    │
                                   │       │    │    │
          │                        Lm     │    │    │
          │                        │       │  ┌─┴─┐  │
          │                        │       │  │SR1│  │
         ─┴─ C2                   ─┴─     │  └───┘  │
          │                               │    │    │
         Vin-                             │  ┌───┐  │
                                          │  │SR2│  │
                                          │  └─┬─┘  │
                                          │    │    │
                                          └────┴────┘
                                                │
                                              Vout-

V2G Mode (Battery → Grid): DC/AC Discharging
────────────────────────────────────────────
• SR1, SR2 become active switches (driven by gate drivers)
• S1, S2 become synchronous rectifiers
• Power flows from battery to DC bus
• Central NPC inverter converts to AC

V2G Control Strategy:
─────────────────────
1. Transition Sequence (Charge → Discharge):
   a. Reduce charging current to zero (50 ms)
   b. Disable primary gate drive
   c. Enable secondary as active switches
   d. Ramp up discharge current (100 ms)

2. Reverse Power Flow Control:
   • Secondary side drives LLC at variable frequency
   • Primary side synchronous rectification
   • DC bus voltage regulated by secondary controller

3. Safety Interlocks:
   • Anti-islanding detection (active frequency shift)
   • Grid impedance monitoring
   • Reverse power relay (hardware backup)

V2G Efficiency Analysis:
────────────────────────
Direction           Losses          Efficiency
─────────────────────────────────────────────
AC → DC (charge)    66W @ 3.3kW     95.3%
DC → AC (V2G)       72W @ 3.3kW     94.8%
─────────────────────────────────────────────
Round-trip (AC→DC→AC):              90.3%

Note: V2G losses slightly higher due to:
• Secondary-side switching losses (optimized for rectification)
• Two-stage conversion: DC/DC + DC/AC
```

### LLC Design for EK3 (3.3 kW) - Summary

```
                    Lr      Cr
          ┌────────[===]───||───┐
          │                     │
    S1 ───┤                     │
          │    ┌───────────┐    │
Vdc ──────┼────┤           ├────┼──── Vout
          │    │    Tx     │    │
    S2 ───┤    │   n:1     │    │
          │    └───────────┘    │
          │         │           │
          └─────────┴───────────┘
                    Lm

EK3 Parameters:
─────────────
Input: 650V DC (from central PFC)
Output: 50-500V DC (battery range)
Power: 3.3 kW continuous (3.6 kW peak)
Resonant frequency: 190 kHz
Switching range: 150-250 kHz
Transformer ratio: 1:1 (for wide output range)
Magnetizing inductance Lm: 150 µH
Resonant inductance Lr: 15 µH
Resonant capacitor Cr: 47 nF

Planar transformer:
• Integrated into PCB for manufacturing repeatability
• Leakage = Lr (no external inductor)
• Film capacitors (no electrolytics)

Expected efficiency: >96% peak, >94% @ 50% load
```

### Three-Phase Interleaved LLC for EK30 (30 kW)

```
         Phase A      Phase B      Phase C
            │            │            │
         ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
         │ LLC │      │ LLC │      │ LLC │
         │ 10kW│      │ 10kW│      │ 10kW│
         └──┬──┘      └──┬──┘      └──┬──┘
            │            │            │
            └──────┬─────┴─────┬─────┘
                   │           │
               Vout+       Vout-

Interleaving: 120° phase shift
─────────────────────────────
• Ripple cancellation on output
• 70% reduction in output filter capacitance
• Distribution of thermal dissipation

EK30 Parameters:
─────────────
Input: 800V DC (from NPC PFC)
Output: 200-1000V DC (supports 400V and 800V vehicles)
Power: 30 kW (3 × 10 kW phases)
Switching frequency: 135-250 kHz
Transformer ratio: 1:1.2

Peak efficiency: >98%
Reference: Wolfspeed 30kW interleaved LLC design
```

### 3.6 Dual Active Bridge (DAB) Control for V2G

```
DAB TOPOLOGY FOR BIDIRECTIONAL POWER FLOW
═══════════════════════════════════════════════════════════════

The Dual Active Bridge is the preferred topology for V2G because
both bridges are actively controlled, enabling seamless power reversal.

Topology Overview:
                         ┌───────────────────────────────────────────┐
                         │         DUAL ACTIVE BRIDGE (DAB)          │
                         │                                           │
     Primary (Grid)      │                         Secondary (Battery)
         650V DC         │                             400V DC       │
           │             │                               │           │
    ┌──────┴──────┐      │     HF Transformer    ┌──────┴──────┐     │
    │   H-Bridge  │      │                       │   H-Bridge  │     │
    │             │      │       ┌─────┐         │             │     │
    │  S1 ──┬── S2│      │  Lr  │     │         │ S5 ──┬── S6 │     │
    │       │     │◄────►│[===]─┤ n:1 ├─────────►│      │      │     │
    │  S3 ──┴── S4│      │      │     │         │ S7 ──┴── S8 │     │
    │             │      │       └─────┘         │             │     │
    └─────────────┘      │                       └─────────────┘     │
                         │                                           │
                         │   Lr = leakage + external inductance      │
                         │   n = transformer turns ratio             │
                         └───────────────────────────────────────────┘


Key Components:
───────────────
• S1-S4: Primary H-bridge (SiC MOSFETs, 900V)
• S5-S8: Secondary H-bridge (SiC MOSFETs, 650V)
• Transformer: High-frequency, n:1 ratio
• Lr: Series inductance (leakage + external)


POWER TRANSFER EQUATIONS
════════════════════════════════════════════════════════════════

Single Phase Shift (SPS) Control:

Power transferred:
                 V₁ × V₂ × φ × (π - |φ|)
    P = ────────────────────────────────────
                 2 × π² × fs × Lr × n

Where:
    V₁ = Primary DC voltage [V]
    V₂ = Secondary DC voltage [V]
    φ  = Phase shift between bridges [rad], -π < φ < π
    fs = Switching frequency [Hz]
    Lr = Series inductance [H]
    n  = Transformer turns ratio

Power flow direction:
    φ > 0: Primary → Secondary (Grid to Battery = Charging)
    φ < 0: Secondary → Primary (Battery to Grid = V2G Discharge)


NUMERICAL EXAMPLE (EK3 Module)
──────────────────────────────

Given:
    V₁ = 650V (DC bus from PFC)
    V₂ = 400V (typical battery voltage)
    fs = 200 kHz
    Lr = 15 µH (integrated in transformer)
    n  = 1:1

Maximum power (at φ = π/2):
    P_max = (650 × 400 × (π/2) × (π/2)) / (2 × π² × 200000 × 15×10⁻⁶ × 1)
    P_max = (650 × 400 × 2.47) / (59.2)
    P_max = 10.8 kW (theoretical maximum)

Practical operation at 3.3 kW:
    φ_required = solve for P = 3300W
    φ ≈ 0.45 rad ≈ 26° (well within linear region)


ZVS (ZERO VOLTAGE SWITCHING) CONDITIONS
═══════════════════════════════════════════════════════════════

For efficiency, DAB must operate in ZVS region for all switches.

ZVS Boundary Diagram:
─────────────────────

    d = V₂/(n×V₁)     (Voltage conversion ratio)
       │
   1.5 │              Hard           ZVS
       │            Switching       Region
   1.2 │               /\
       │              /  \         ▓▓▓▓▓▓▓▓▓
   1.0 │─────────────/────\────────▓▓▓▓▓▓▓▓▓─────── optimal
       │            /      \       ▓▓▓▓▓▓▓▓▓
   0.8 │           /        \      ▓▓▓▓▓▓▓▓▓
       │          /  Hard    \     ▓▓▓▓▓▓▓▓▓
   0.6 │         / Switching  \    ▓▓▓▓▓▓▓▓▓
       │
   0.4 │
       │
       └───────┬────────┬────────┬────────┬────────► |φ|/π
              0.1      0.2      0.3      0.4      0.5


ZVS Conditions:

For primary switches (S1-S4):
    ZVS achieved when: I_Lr(t_sw) > I_zvs_min

    I_zvs_min = √(2 × Coss × V₁²) / Lr
    For Coss = 100pF, V₁ = 650V, Lr = 15µH:
    I_zvs_min = √(2 × 100×10⁻¹² × 650²) / 15×10⁻⁶ = 6.1A

For secondary switches (S5-S8):
    Similar calculation with V₂ and secondary Coss

Design margin:
    Ensure I_Lr peak > 2 × I_zvs_min for robust ZVS at all loads


EK3 DAB OPERATING REGION
────────────────────────

Battery voltage range: 300-500V
DC bus: 650V ±10%
Turns ratio: n = 1.0

┌──────────────────────────────────────────────────────────────┐
│ V_battery │ d = V₂/(n×V₁) │ φ for 3.3kW │ ZVS Status       │
├───────────┼───────────────┼─────────────┼──────────────────┤
│ 300V      │ 0.46          │ 35°         │ Marginal (boost) │
│ 400V      │ 0.62          │ 26°         │ ✓ Optimal        │
│ 450V      │ 0.69          │ 23°         │ ✓ Good           │
│ 500V      │ 0.77          │ 21°         │ ✓ Good           │
└──────────────────────────────────────────────────────────────┘
```

### 3.7 Extended Phase Shift (EPS) Control

```
EXTENDED PHASE SHIFT MODULATION
═══════════════════════════════════════════════════════════════

SPS (Single Phase Shift) has limitations at light load and extreme d ratios.
EPS introduces an additional degree of freedom for wider ZVS range.

SPS vs EPS Waveforms:
─────────────────────

SPS (Single Phase Shift):
    Primary   ┌─────────┐         ┌─────────┐
    V_AB      │         │         │         │
           ───┘         └─────────┘         └───
                   ◄──── φ ────►
    Secondary      ┌─────────┐         ┌─────────┐
    V_CD           │         │         │         │
              ─────┘         └─────────┘         └─

    Both bridges: 50% duty cycle, only φ varies


EPS (Extended Phase Shift):
    Primary   ┌───────────────┐   ┌───────────────┐
    V_AB      │               │   │               │
           ───┘               └───┘               └───
              ◄─── D₁×T ────►
                       ◄── φ ──►
    Secondary      ┌───────┐           ┌───────┐
    V_CD           │       │           │       │
              ─────┘       └───────────┘       └───
                   ◄─ D₂×T ─►

    Two control variables: φ (phase shift) + D₁ or D₂ (duty ratio)


EPS Control Law:

For optimal efficiency at light load:

    if (P < 0.3 × P_nom) {
        // Use EPS mode
        D₁ = 0.5;  // Primary stays at 50%
        D₂ = calculated from P and d
        φ = calculated for ZVS

        // EPS power equation:
        // P = (V₁ × V₂ × D₂) / (fs × Lr × n) × f(φ, D₂)
    } else {
        // Use SPS mode
        D₁ = D₂ = 0.5;
        φ = calculated from P
    }


EPS IMPLEMENTATION PSEUDOCODE
─────────────────────────────

typedef struct {
    float phi;      // Phase shift [rad]
    float D1;       // Primary duty ratio (0-0.5)
    float D2;       // Secondary duty ratio (0-0.5)
    ModulationType mode;  // SPS, EPS, DPS, TPS
} DAB_Modulation;

DAB_Modulation DAB_CalculateModulation(float P_ref, float V1, float V2,
                                        float fs, float Lr, float n) {
    DAB_Modulation mod;
    float d = V2 / (n * V1);  // Voltage ratio
    float P_nom = (V1 * V2) / (4 * fs * Lr * n);  // Nominal power

    if (fabsf(P_ref) < 0.3f * P_nom) {
        // Light load: Use EPS for better ZVS
        mod.mode = EPS;
        mod.D1 = 0.5f;

        // Calculate D2 and phi for ZVS at light load
        // Simplified: reduce D2 to increase circulating current
        mod.D2 = 0.3f + 0.4f * (fabsf(P_ref) / (0.3f * P_nom));
        mod.phi = (P_ref > 0) ?
                  asinf(fabsf(P_ref) / (P_nom * mod.D2)) :
                 -asinf(fabsf(P_ref) / (P_nom * mod.D2));
    } else {
        // Normal load: Use SPS
        mod.mode = SPS;
        mod.D1 = 0.5f;
        mod.D2 = 0.5f;

        // SPS phase calculation
        float x = (2 * PI * PI * fs * Lr * n * P_ref) / (V1 * V2);
        mod.phi = (PI - sqrtf(PI * PI - 4 * x)) / 2;
        if (P_ref < 0) mod.phi = -mod.phi;  // V2G: negative phase
    }

    return mod;
}


V2G MODE TRANSITIONS
════════════════════════════════════════════════════════════════

Charging to V2G Transition Sequence:
────────────────────────────────────

Timeline (100ms total):

t=0ms:    ISO 15118-20 signals power reversal
          │
t=10ms:   Reduce P_ref to zero (soft ramp)
          │ Circulating current only
          │
t=50ms:   φ passes through zero
          │ Power direction reverses
          │
t=60ms:   Increase |φ| in negative direction
          │ V2G power ramps up
          │
t=100ms:  Target V2G power reached


Code Implementation:

typedef enum {
    DAB_CHARGING,
    DAB_TRANSITION,
    DAB_V2G,
    DAB_STANDBY
} DAB_Mode;

typedef struct {
    DAB_Mode mode;
    float P_ref;        // Power reference
    float P_actual;     // Measured power
    float phi_current;  // Current phase shift
    float phi_target;   // Target phase shift
    float ramp_rate;    // rad/ms
} DAB_Controller;

void DAB_TransitionToV2G(DAB_Controller* dab, float P_v2g_target) {
    dab->mode = DAB_TRANSITION;

    // Phase 1: Ramp to zero power
    dab->phi_target = 0;
    dab->ramp_rate = 0.02f;  // rad/ms (~50ms to reach zero)

    // Set callback for phase 2
    dab->P_ref = P_v2g_target;  // Will be negative for V2G
}

void DAB_Update(DAB_Controller* dab, float dt_ms) {
    // Ramp phase shift
    float phi_error = dab->phi_target - dab->phi_current;

    if (fabsf(phi_error) > dab->ramp_rate * dt_ms) {
        dab->phi_current += copysignf(dab->ramp_rate * dt_ms, phi_error);
    } else {
        dab->phi_current = dab->phi_target;

        // Transition complete, start V2G ramp
        if (dab->mode == DAB_TRANSITION && dab->phi_current == 0) {
            dab->mode = DAB_V2G;
            // Calculate target phi for V2G power
            DAB_Modulation mod = DAB_CalculateModulation(
                dab->P_ref, V1, V2, fs, Lr, n);
            dab->phi_target = mod.phi;
        }
    }

    // Apply phase shift to PWM
    PWM_SetPhaseShift(dab->phi_current);
}


CURRENT STRESS ANALYSIS
═══════════════════════════════════════════════════════════════

Peak and RMS currents in DAB inductor:

Peak Current:
    I_Lr_peak = (V₁ × (1 - |φ|/π)) / (4 × fs × Lr) + (|φ| × V₂) / (2 × π × fs × Lr × n)

RMS Current:
    I_Lr_rms = I_Lr_peak / √3  (for SPS, approximately)

For EK3 at 3.3kW, φ = 26°:
    I_Lr_peak ≈ 12A
    I_Lr_rms ≈ 7A

Transformer current capacity:
    • Primary: 7A RMS → PCB trace width ≥ 3mm (2oz Cu)
    • Secondary: 7A × n = 7A RMS → Same requirements
```

### 3.8 DAB Control Loop Architecture

```
DAB CONTROL ARCHITECTURE
═══════════════════════════════════════════════════════════════

Complete control loop for V2G-capable DAB:

                    ┌─────────────────────────────────────────────────────┐
                    │              OUTER LOOP (Voltage/Power)              │
                    │                                                      │
    Vout_ref ──────►│  ┌─────┐     ┌──────┐      P_ref                   │
    or P_ref        │  │  -  │     │      │    ──────►                    │
                    │  │  Σ  ├────►│ PI   ├──────────┤                    │
    Vout_fb ───────►│  │  +  │     │      │          │                    │
    or P_fb         │  └─────┘     └──────┘          │                    │
                    │                                 │                    │
                    │  Bandwidth: 100 Hz             │                    │
                    │  Kp = 0.01, Ki = 10            │                    │
                    └─────────────────────────────────┼────────────────────┘
                                                      │
                                                      ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              MIDDLE LOOP (Current)                   │
                    │                                                      │
         P_ref ────►│  ┌──────────────┐                                   │
                    │  │ P_ref → I_ref│    I_ref                          │
                    │  │              ├───────►┌─────┐    ┌──────┐  φ    │
                    │  │ I = P/(V×n)  │        │  -  │    │      │──────►│
                    │  └──────────────┘        │  Σ  ├───►│  PR  │       │
                    │                          │  +  │    │      │       │
         I_Lr_fb ─────────────────────────────►└─────┘    └──────┘       │
                    │                                                      │
                    │  Bandwidth: 2 kHz                                   │
                    │  PR at fs for harmonic rejection                    │
                    └─────────────────────────────────────────────────────┘
                                                      │
                                                      ▼
                    ┌─────────────────────────────────────────────────────┐
                    │              MODULATOR                               │
                    │                                                      │
            φ ─────►│  ┌──────────────────────────────────────────────┐  │
                    │  │                                              │  │
         Mode ─────►│  │   SPS: S1-S4 at 50%, S5-S8 at 50%, shift φ  │  │
        (SPS/EPS)   │  │   EPS: Adjust D2 for light load ZVS         │  │
                    │  │                                              │  │
                    │  └──────────────────────────────────────────────┘  │
                    │                    │                                │
                    │                    ▼                                │
                    │         ┌─────────────────────┐                    │
                    │         │   GATE SIGNALS      │                    │
                    │         │  S1,S2,S3,S4        │                    │
                    │         │  S5,S6,S7,S8        │                    │
                    │         └─────────────────────┘                    │
                    └─────────────────────────────────────────────────────┘


IMPLEMENTATION ON STM32G474
───────────────────────────

Timer Configuration:
• HRTIM (High Resolution Timer) for PWM
• 5.4 GHz resolution (185 ps)
• Dual H-bridge: 8 channels with precise phase control

typedef struct {
    // Outer loop
    float Kp_v, Ki_v;
    float v_integral;

    // Middle loop
    float Kp_i, Ki_i;
    float i_integral;

    // State
    float phi;
    float D1, D2;
    DAB_Mode mode;

    // Measurements
    float V1, V2;
    float I_Lr;
    float P_out;
} DAB_Control;

void DAB_ControlLoop(DAB_Control* ctrl, float Ts) {
    // Outer loop: Voltage/Power control
    float v_error = ctrl->V_ref - ctrl->V2;
    ctrl->v_integral += ctrl->Ki_v * v_error * Ts;
    float P_ref = ctrl->Kp_v * v_error + ctrl->v_integral;

    // Power limits
    P_ref = CLAMP(P_ref, -P_MAX, P_MAX);

    // Current reference from power
    float I_ref = P_ref / (ctrl->V1 * ctrl->n);

    // Middle loop: Current control
    float i_error = I_ref - ctrl->I_Lr;
    ctrl->i_integral += ctrl->Ki_i * i_error * Ts;
    float phi_delta = ctrl->Kp_i * i_error + ctrl->i_integral;

    // Update phase
    ctrl->phi += phi_delta;
    ctrl->phi = CLAMP(ctrl->phi, -PHI_MAX, PHI_MAX);

    // Calculate modulation
    DAB_Modulation mod = DAB_CalculateModulation(
        P_ref, ctrl->V1, ctrl->V2, FS, LR, ctrl->n);

    // Apply to PWM
    HRTIM_SetPhaseShift(mod.phi);
    HRTIM_SetDuty(BRIDGE_PRIMARY, mod.D1);
    HRTIM_SetDuty(BRIDGE_SECONDARY, mod.D2);
}


FEEDFORWARD FOR FAST V2G RESPONSE
─────────────────────────────────

Grid frequency events require fast response (<100ms).
Add feedforward path for immediate phase adjustment:

void DAB_FrequencyResponse(DAB_Control* ctrl, float delta_f) {
    // Droop control: P = Kp × Δf
    float P_droop = DROOP_KP * delta_f;

    // Feedforward: immediate phase adjustment
    float phi_ff = (P_droop / P_NOM) * PHI_MAX;

    // Apply feedforward (bypasses slow PI loops)
    ctrl->phi += phi_ff;

    // Saturate
    ctrl->phi = CLAMP(ctrl->phi, -PHI_MAX, PHI_MAX);

    // Update PWM immediately
    HRTIM_SetPhaseShift(ctrl->phi);

    // Feedback loop will fine-tune
}
```

---

## 4. Gate Driver Design

### Requirements for SiC MOSFET Gate Drive

```
SiC SPECIFICS
─────────────────
1. Higher gate threshold: ~4V (vs 2V for Si)
2. Lower gate capacitance: Faster switching, but more dv/dt
3. Miller plateau: Shorter, requires faster driver
4. Parasitic turn-on: Sensitive to dv/dt induced gate noise

SOLUTION: +18V/-5V Gate Drive
────────────────────────────
• +18V: Ensures low Rds(on) even at high temperature
• -5V: Prevents false turn-on from dv/dt noise
• Kelvin source: Eliminates common source inductance
```

### Recommended Gate Driver IC

```
Isolated Gate Driver: Silicon Labs Si823Hx
──────────────────────────────────────────
• Peak output current: 8A source/sink
• Propagation delay: <50 ns
• CMTI: >200 kV/µs
• Integrated DC-DC for ±supply

Alternatives:
• Infineon 1EDC series
• Texas Instruments UCC21732
• ROHM BM61S41RFV
```

### Gate Resistor Optimization

```
         Rg_on
    ┌────[===]────┐
    │             │
Driver OUT ──┼── MOSFET Gate
    │             │
    └────[===]────┘
         Rg_off
           │
         Doff (Schottky)

Strategy:
• Rg_on: Higher (10-20Ω) - controlled turn-on, lower overshoot
• Rg_off: Lower (2-5Ω) - fast turn-off for lower switching losses
• Doff: Bypass diode for asymmetric Rg values

Gate Drive Timing for EK3 LLC:
──────────────────────────────
Switching frequency: 190 kHz → Period = 5.26 µs
Dead time: 150 ns (2.9% of period)
Turn-on time: 25 ns (Rg=10Ω, Ciss=800pF)
Turn-off time: 15 ns (Rg=5Ω, Ciss=800pF)
```

---

## 5. EMI/EMC Design

### Common Mode Choke

```
          ┌─────┐
   L ─────┤     ├───── L'
          │ CMC │
   N ─────┤     ├───── N'
          └─────┘
           │ │
          PE (shield)

Specification:
• Impedance: >1 kΩ @ 100 kHz
• Saturation current: >50A (for EK30)
• Nanocrystalline core for wide frequency range
```

### dv/dt Limiting

```
3-level NPC naturally has lower dv/dt:
• 2-level: dv/dt = Vdc / t_rise ≈ 800V / 50ns = 16 kV/µs
• 3-level: dv/dt = (Vdc/2) / t_rise ≈ 400V / 50ns = 8 kV/µs

Additional measures:
• Snubber circuits on critical nodes
• Shielded gate drive transformers
• Proper PCB layout (star grounding)
```

### EMI Filter Design

```
EMI FILTER TOPOLOGY
════════════════════════════════════════════════════════════════

        ┌───[L_dm]───┬───[L_dm]───┐
        │            │            │
AC_L ───┤           ─┴─          ├─── DC+
        │           C_y           │
        │            │            │
       ─┴─ C_x      PE           ─┴─ C_x
        │                         │
AC_N ───┼─────────[CMC]───────────┤
        │                         │
        │           ─┴─           │
        │           C_y           │
        │            │            │
        └────────────┴────────────┘─── DC-

Component Values for EK3:
─────────────────────────
CM Choke (CMC): 2 × 4.7 mH, nanocrystalline
DM Inductor (L_dm): 2 × 47 µH, powder iron
X capacitor (C_x): 2.2 µF, 275V AC, X2 class
Y capacitor (C_y): 4.7 nF, 300V AC, Y2 class

Attenuation Targets (CISPR 11 Class A):
───────────────────────────────────────
Frequency Range    Limit      Design Margin
150 kHz - 500 kHz  66 dBµV    >10 dB
500 kHz - 5 MHz    56 dBµV    >10 dB
5 MHz - 30 MHz     60 dBµV    >10 dB

CM choke provides: ~40 dB @ 200 kHz
DM inductor provides: ~20 dB @ 200 kHz
Total: ~60 dB (with safety margin)
```

---

## 6. Protection Systems

### Hardware Protection

```
DESAT Detection (for SiC)
────────────────────────
• Monitor Vds during on-state
• Threshold: Vds > 8V = fault
• Blanking time: 500 ns (SiC has fast turn-on)
• Response: Soft turn-off (controlled di/dt)

Over-Current Protection
───────────────────────
• Current sense resistor: 1-2 mΩ shunt
• Hall effect sensor: For galvanic isolation
• Rogowski coil: For fast detection (AC component)

Over-Voltage Protection
───────────────────────
• Active clamp circuit on DC bus
• TVS diode on gate
• Varistor on AC input
```

### AI-Enhanced Protection

```
Traditional: Fixed thresholds
ELEKTROKOMBINACIJA: Adaptive AI thresholds

Examples:
1. Cold start: Allow higher inrush because components are cold
2. Hot operation: Reduce current limit because thermal margin is smaller
3. Aged components: AI detects degradation, adjusts limits
4. Predictive: Anticipates problems before they occur
```

---

## 7. Multi-Module Coordination

### 7.1 Droop Control for Parallel Operation

```
DROOP CONTROL FUNDAMENTALS
════════════════════════════════════════════════════════════════

Droop control enables parallel operation without high-speed communication:

Vout = Vref - Rd × Iout

Where:
• Vout = actual output voltage
• Vref = no-load voltage setpoint
• Rd = virtual droop resistance
• Iout = module output current

        │
   Vout │ Vref ●────────────────────────
        │        ╲
        │          ╲  slope = -Rd
        │            ╲
        │              ╲
        │                ╲
        │                  ╲
        │                    ●  Vout_min @ Imax
        │
        └────────────────────────────────────► Iout
                                     Imax

Droop Parameter Selection:
──────────────────────────
Target: 3% voltage droop from no-load to full-load

For EK3 @ 400V output:
  Vref = 412V (no-load)
  Vout_full = 400V (full load @ 8.25A)
  ΔV = 12V (3% droop)
  Rd = ΔV / Imax = 12V / 8.25A = 1.45Ω (virtual)

Current Sharing Accuracy:
─────────────────────────
Without communication: ±5% (droop mismatch + Vref tolerance)
With CAN-FD adjustment: ±2% (master sends Vref correction)

Parallel Operation Example (4 Modules = 13.2 kW):
─────────────────────────────────────────────────
Module  Iout_target   Rd      Vref_adj    Iout_actual
────────────────────────────────────────────────────
EK3-1   8.25A        1.45Ω   412.0V      8.15A (98.8%)
EK3-2   8.25A        1.45Ω   412.0V      8.28A (100.4%)
EK3-3   8.25A        1.45Ω   412.1V      8.30A (100.6%)
EK3-4   8.25A        1.45Ω   411.9V      8.27A (100.2%)
────────────────────────────────────────────────────
Total: 33.0A @ 400V = 13.2 kW (balanced within ±1%)
```

### 7.2 CAN-FD Load Sharing Protocol

```
CAN-FD MESSAGE STRUCTURE FOR LOAD SHARING
════════════════════════════════════════════════════════════════

Message Types:
──────────────
0x100-0x1FF: Module Status (broadcast every 10 ms)
0x200-0x2FF: Master Commands (from station controller)
0x300-0x3FF: Alarms (priority, immediate)
0x400-0x4FF: Thermal Data (every 100 ms)

Module Status Message (64 bytes @ 5 Mbps):
─────────────────────────────────────────
Byte    Field               Size    Description
─────────────────────────────────────────────────
0-1     Module ID           2B      Unique identifier
2-3     Vout                2B      Output voltage (0.1V/bit)
4-5     Iout                2B      Output current (0.01A/bit)
6-7     Vin                 2B      Input voltage (0.1V/bit)
8-9     Temp_heatsink       2B      Heatsink temp (0.1°C/bit)
10-11   Temp_mosfet         2B      MOSFET temp (0.1°C/bit)
12      State               1B      Operating state
13      Fault_code          1B      Active fault (if any)
14-17   Energy_Wh           4B      Cumulative energy
18-21   Uptime_s            4B      Operating time
22-25   CRC32               4B      Message integrity
26-63   Reserved            38B     Future use

Master Adjustment Command:
──────────────────────────
Byte    Field               Size    Description
─────────────────────────────────────────────────
0-1     Target Module ID    2B      0xFFFF = broadcast
2-3     Vref_adjustment     2B      Signed, 0.01V/bit
4-5     Imax_limit          2B      Max current limit
6       Command_type        1B      0=adjust, 1=enable, 2=disable
7-10    Sequence_number     4B      For acknowledgment
11-14   CMAC                4B      Authentication (AES-128)

Load Balancing Algorithm (Station Controller):
──────────────────────────────────────────────
Every 100 ms:
1. Collect Iout from all active modules
2. Calculate Iavg = ΣIout / N
3. For each module:
   a. Error = (Iout - Iavg) / Imax
   b. If |Error| > 2%:
      Vref_adj = -Kp × Error  (Kp = 0.5V/%)
   c. Send adjustment command via CAN-FD
4. Modules apply Vref_adj within 10 ms
```

### 7.3 Circulating Current Prevention

```
CIRCULATING CURRENT MITIGATION
════════════════════════════════════════════════════════════════

Cause of Circulating Current:
─────────────────────────────
• Vref mismatch between parallel modules
• Component tolerance (Rds_on, cable resistance)
• Temperature differences (affects Rds_on)

Without mitigation: ΔV / (2×Rout) = 5V / (2×0.1Ω) = 25A circulating!

Mitigation Strategies:
──────────────────────

1. Synchronous Enable/Disable
   • All modules turn on within 1 ms window
   • Master sends synchronized START command
   • Prevents large ΔV during transitions

2. Output Impedance Matching
   • Each module has soft-start inductor (10 µH)
   • Limits di/dt during parallel connection
   • Inductor acts as current buffer

3. Active Damping
   • Virtual impedance injected in control loop
   • Increases effective Rd at high frequencies
   • Damps oscillations from cable inductance

4. Minimum Load Requirement
   • Each module must carry >5% load when active
   • Prevents one module from sourcing while others sink
   • Controller sheds modules if load drops below threshold

Circulating Current Monitoring:
───────────────────────────────
• Measured as: I_circ = |Iout - Iavg|
• Alarm threshold: I_circ > 0.5A (sustained >1s)
• Fault threshold: I_circ > 2A (immediate shutdown)
• AI learns normal patterns, detects anomalies
```

---

## 8. V2G Power Stage Design

### 8.1 Grid-Tied Inverter Mode

```
V2G INVERTER OPERATION
════════════════════════════════════════════════════════════════

When operating in V2G mode, the 3-level NPC acts as a grid-tied inverter:

         DC Bus (from modules)
              │
              │ 800V
              ▼
        ┌─────────────┐
        │   3-Level   │
        │  NPC Stage  │
        │             │
        └──────┬──────┘
               │
          [LCL Filter]
               │
               ▼
          Grid (230V/400V)

Control Mode: Current-Controlled Voltage Source
───────────────────────────────────────────────
• NOT voltage source (would fight grid)
• Injects current in phase with grid voltage (unity PF)
• Or controlled phase shift for reactive power

Power Flow Equations:
─────────────────────
P = V_grid × I_grid × cos(φ)    [Active power]
Q = V_grid × I_grid × sin(φ)    [Reactive power]

For 30 kW @ unity PF:
  I_grid = P / (√3 × V_line × cos(φ))
  I_grid = 30000 / (√3 × 400 × 1.0)
  I_grid = 43.3 A per phase

Inverter Control Loop:
──────────────────────
            ┌─────────────────────────────────────┐
            │         POWER CONTROL               │
            │                                     │
  Pref ────►│  ┌─────┐     ┌──────┐    Id_ref   │
            │  │  -  │     │      │             │
            │  │  Σ  ├────►│  PI  ├────────────►│
  Pmeas ───►│  │  +  │     │      │             │
            │  └─────┘     └──────┘             │
            │                                     │
  Qref ────►│  ┌─────┐     ┌──────┐    Iq_ref   │
            │  │  -  │     │      │             │
            │  │  Σ  ├────►│  PI  ├────────────►│
  Qmeas ───►│  │  +  │     │      │             │
            │  └─────┘     └──────┘             │
            └─────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │      CURRENT CONTROL (dq-frame)     │
            │                                     │
            │  Id_ref ───►[PR]───► Vd_cmd        │
            │                                     │
            │  Iq_ref ───►[PR]───► Vq_cmd        │
            │                                     │
            │  Cross-coupling compensation        │
            │  Feedforward decoupling             │
            └─────────────────────────────────────┘
                              │
                              ▼
                         [Inverse Park]
                              │
                              ▼
                    [Space Vector PWM]
                              │
                              ▼
                    Gate signals to NPC
```

### 8.2 Anti-Islanding Protection

```
ANTI-ISLANDING DETECTION
════════════════════════════════════════════════════════════════

Islanding = inverter continues operating when grid is disconnected
Risk = electrocution of utility workers, equipment damage

Detection Methods (Combined for reliability):
─────────────────────────────────────────────

1. Passive Methods (Always Active):
   ┌──────────────────────────────────────────────────────────┐
   │ Method              │ Threshold      │ Detection Time   │
   ├──────────────────────────────────────────────────────────┤
   │ Over/Under Voltage  │ ±10% (207-253V)│ <160 ms          │
   │ Over/Under Frequency│ ±0.5 Hz        │ <160 ms          │
   │ Rate of Change (df/dt)│ >1 Hz/s      │ <50 ms           │
   │ Vector Shift        │ >10°           │ <50 ms           │
   └──────────────────────────────────────────────────────────┘

2. Active Methods (Continuous Perturbation):
   ┌──────────────────────────────────────────────────────────┐
   │ Frequency Shift (AFD)                                    │
   │ ─────────────────────────────────────────────────────── │
   │ • Inject small frequency perturbation: Δf = 0.5 Hz      │
   │ • Grid-connected: grid absorbs perturbation             │
   │ • Islanded: frequency drifts → detected                 │
   │ • Detection time: <500 ms                               │
   └──────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────────────────────────────┐
   │ Impedance Measurement                                    │
   │ ─────────────────────────────────────────────────────── │
   │ • Inject harmonic current at 75 Hz (non-grid harmonic)  │
   │ • Measure voltage response                               │
   │ • Z_grid < 1Ω: connected                                │
   │ • Z_grid > 10Ω: islanded                                │
   └──────────────────────────────────────────────────────────┘

Response Actions:
─────────────────
1. Island detected → Cease energizing within 2 seconds (IEEE 1547)
2. Ramp down current over 100 ms (avoid transient)
3. Open AC contactor (hardware backup)
4. Log event for analysis
5. Attempt reconnection after 5 minutes (configurable)

Compliance:
───────────
• IEEE 1547-2018: Interconnection requirements
• IEC 62116: Anti-islanding test procedures
• EN 50549-1: European grid codes
```

### 8.3 Reactive Power Support (Volt-VAR)

```
VOLT-VAR CONTROL
════════════════════════════════════════════════════════════════

Modern grid codes require inverters to provide voltage support:

         Q (kVAR)
         ▲
   +Qmax │         ┌─────────────
         │        /
         │       /
         │      /
      0  │─────┼─────────────────────► V (pu)
         │    /│     │        │
         │   / │     │        │
         │  /  │     │        │
   -Qmax │ /   │     │        │
         ────────────────────────
              V1    V2   V3   V4

Volt-VAR Curve Parameters:
──────────────────────────
V1 = 0.92 pu (208 V)   → Begin reactive absorption
V2 = 0.98 pu (222 V)   → Maximum absorption zone ends
V3 = 1.02 pu (231 V)   → Maximum injection zone starts
V4 = 1.08 pu (245 V)   → Begin reactive injection limit

Dead-band: V2 to V3 (no reactive power required)
Slope: Q changes linearly between V1-V2 and V3-V4

Reactive Power Capability:
──────────────────────────
Apparent power: S = √(P² + Q²)
At full active power (P = Prated): Q = 0 kVAR
At 80% active power: Q = ±0.6 × Srated (available)

For EK30 @ 30 kW:
• S_rated = 33 kVA (assumes 0.9 PF design margin)
• At P = 24 kW: Q_available = ±19.8 kVAR

Implementation:
───────────────
1. Measure Vgrid (RMS, every 100 ms)
2. Look up Q_ref from Volt-VAR curve
3. Add to manual Q_setpoint (if any)
4. Feed to power control loop
5. Current loop generates Iq component

Priority Logic:
───────────────
1. Active power (charging) - highest priority
2. Reactive power (grid support) - if capacity available
3. If P + Q would exceed S: reduce Q first, then P
```

---

## 9. Efficiency Characterization

### 9.1 Loss Breakdown Analysis

```
EK3 LOSS BREAKDOWN @ 3.3 kW OUTPUT
════════════════════════════════════════════════════════════════

Operating Conditions:
────────────────────
Vin = 650V DC
Vout = 400V DC
Iout = 8.25A
Tj = 100°C (junction temperature)
fsw = 190 kHz

Component-by-Component Loss Analysis:
─────────────────────────────────────

1. SiC MOSFET Conduction Losses (4× C3M0065090D):
   P_cond = Rds(on) × I²_rms
   Rds(on) @ 100°C = 95 mΩ
   I_rms per MOSFET ≈ 4A (LLC operation)
   P_cond_total = 4 × 95mΩ × 4² = 6.1W

2. SiC MOSFET Switching Losses:
   P_sw = (Eon + Eoff) × fsw
   Eon @ 400V, 8A ≈ 50 µJ
   Eoff @ 400V, 8A ≈ 30 µJ
   Note: ZVS achieved → Eon reduced by 80%
   P_sw_actual = 4 × (10 + 30) µJ × 190 kHz = 30.4W

   [TARGET: With optimized dead-time → 18W]

3. Synchronous Rectifier Losses (Secondary SiC):
   P_sr = 2 × (Rds(on) × I²_rms + Qrr × Vout × fsw)
   P_sr = 2 × (65mΩ × 4² + 0 × 400 × 190k) = 4.2W
   (ZCS eliminates reverse recovery)

4. Transformer Core Losses:
   Using Steinmetz equation: Pv = k × f^α × B^β
   For 3C97 @ 190 kHz, 60 mT:
   Pv ≈ 150 mW/cm³
   P_core = 150 × 15 cm³ = 2.3W

5. Transformer Copper Losses:
   P_cu = I²_rms × R_ac × (1 + proximity factor)
   R_dc = 15 mΩ (primary), 15 mΩ (secondary)
   Proximity factor @ 190 kHz ≈ 3×
   P_cu = 2 × (4² × 15mΩ × 4) = 3.8W

6. Resonant Capacitor ESR Losses:
   P_cr = I²_rms × ESR
   Cr current ≈ 10A peak, 7A RMS
   ESR (film cap) ≈ 5 mΩ
   P_cr = 7² × 5mΩ = 0.25W

7. DC Link Capacitor Losses:
   P_dc = I²_ripple × ESR
   I_ripple ≈ 2A RMS
   ESR (film) ≈ 10 mΩ
   P_dc = 2² × 10mΩ = 0.04W

8. Gate Driver Losses:
   P_gate = Qg × Vgs × fsw × 4
   Qg = 80 nC, Vgs = 18V
   P_gate = 80nC × 18V × 190kHz × 4 = 11W

9. Control/Aux Power:
   STM32G474 + CAN-FD + sensors ≈ 3W

LOSS SUMMARY TABLE:
═══════════════════════════════════════════════════════════════
Component               Power (W)    % of Total    % of Pout
───────────────────────────────────────────────────────────────
SiC MOSFET conduction      6.1         4.0%         0.18%
SiC MOSFET switching      18.0        11.8%         0.55%
Sync rectifier             4.2         2.8%         0.13%
Transformer core           2.3         1.5%         0.07%
Transformer copper         3.8         2.5%         0.12%
Resonant capacitor         0.3         0.2%         0.01%
DC link capacitor          0.0         0.0%         0.00%
Gate drivers              11.0         7.2%         0.33%
Control/aux                3.0         2.0%         0.09%
Other (PCB, connectors)    3.0         2.0%         0.09%
───────────────────────────────────────────────────────────────
TOTAL LOSSES              51.7W       100%          1.57%
═══════════════════════════════════════════════════════════════

EFFICIENCY @ 3.3 kW: η = 3300 / (3300 + 51.7) = 98.5% [TARGET]

Current design (before optimization): ~95.3%
Improvement path: Dead-time optimization, gate drive efficiency
```

### 9.2 Efficiency Maps

```
2D EFFICIENCY MAP: EK3 (3.3 kW)
════════════════════════════════════════════════════════════════

        Vout (V)
        │
   500  │  92.1   93.5   94.8   95.2   95.0   94.5
        │
   450  │  92.8   94.2   95.4   95.8   95.6   95.0
        │
   400  │  93.4   94.8   96.0   96.2   96.0   95.3  ← Design point
        │
   350  │  93.0   94.5   95.6   95.8   95.5   94.8
        │
   300  │  92.4   93.8   94.8   95.0   94.6   93.8
        │
   250  │  91.5   92.8   93.6   93.8   93.2   92.2
        │
   200  │  90.2   91.4   92.0   92.0   91.2   90.0
        │
        └──────────────────────────────────────────► Load %
            10%    25%    50%    75%    90%   100%

Peak efficiency zone: 40-70% load, 350-450V output

KEY OBSERVATIONS:
─────────────────
• Peak efficiency (96.2%) at 75% load, 400V output
• Low-load efficiency drops due to fixed losses (gate drive, control)
• High-Vout efficiency drops due to increased switching losses
• Low-Vout efficiency drops due to increased transformer current

[Note: Values are TARGET specifications. Actual measurements TBD.]
```

### 9.3 Thermal Derating Curves

```
THERMAL DERATING
════════════════════════════════════════════════════════════════

Maximum continuous power vs ambient temperature:

    Pout
   (kW)
    │
  3.6│●─────────────────────────●
    │                           ╲
  3.3│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─●─────● Nominal
    │                              ╲    ╲
  2.8│                               ●    ╲
    │                                 ╲    ╲
  2.3│                                  ●    ╲
    │                                    ╲    ╲
  1.8│                                     ●    ●
    │                                       ╲
  1.3│                                        ● Forced air
    │                                          ╲  (module fan)
    └──────────────────────────────────────────────► T_amb (°C)
       -20    0    20   25   40   50   55   60   70

Derating Schedule:
──────────────────
T_amb (°C)    Pmax (kW)    Notes
───────────────────────────────────────────────────
-20 to 25     3.6 kW       Peak power available
25 to 40      3.3 kW       Nominal rating
40 to 50      2.8 kW       Derate 85%
50 to 55      2.3 kW       Derate 70%
55 to 60      1.8 kW       Derate 55% (with warning)
60 to 70      1.3 kW       Minimum, forced air required
>70           Shutdown     Thermal protection

Thermal Management Integration:
───────────────────────────────
• Heatsink thermal resistance: Rth_hs = 0.5 °C/W
• Tj_max = 150°C (derated from 175°C for reliability)
• Power dissipation at full load: ~52W
• ΔT_hs = 52W × 0.5°C/W = 26°C
• T_hs_max = 150 - 26 = 124°C
• With Rth_case-hs = 0.3°C/W: additional 16°C margin
```

---

## 10. Transient Response

### 10.1 Load Step Response

```
LOAD TRANSIENT SPECIFICATIONS
════════════════════════════════════════════════════════════════

Test Condition: 10% → 90% load step (0.33 kW → 2.97 kW)

    Vout
     │
Vref │─ ─ ─ ─ ─ ─┬─────────────────────────────────────
     │           │     Overshoot < 5%
     │           │  ●──●
     │           │ /    ╲
     │           │/      ╲──────────────────── Settled
     │           /        Undershoot < 5%
     │          │
     │          │
     │          │
     └──────────┴───────────────────────────────────────► Time
               Step    +5µs   +50µs  +200µs  +1ms

Load Step Response Targets:
───────────────────────────
Parameter               Target      Measured [TBD]
──────────────────────────────────────────────────────
Voltage undershoot      <5%         [    ]%
Voltage overshoot       <5%         [    ]%
Recovery time (to 1%)   <200 µs     [    ] µs
Settling time (to 0.5%) <1 ms       [    ] ms
Peak current overshoot  <20%        [    ]%

Control Loop Tuning for Fast Response:
──────────────────────────────────────
• Current loop bandwidth: 15 kHz (1/10 of fsw)
• Voltage loop bandwidth: 500 Hz (1/30 of current loop)
• Phase margin: 60° (voltage), 75° (current)
• Feedforward: Iload estimated from Vout droop
```

### 10.2 Stability Analysis

```
STABILITY MARGINS
════════════════════════════════════════════════════════════════

Bode Plot - Voltage Loop (Target):

     Gain
     (dB)
      │
   60 │●
      │ ╲
   40 │  ╲
      │   ╲
   20 │    ╲
      │     ╲          0 dB crossover @ 500 Hz
    0 │──────●───────────────────────────────────
      │       ╲
  -20 │        ╲
      │         ╲
  -40 │          ╲
      └────────────────────────────────────────► f (Hz)
         10   100   500  1k   10k   100k

    Phase
    (deg)
      │
    0 │───────────────────────────────────────────
      │
  -45 │        ╲
      │         ╲
  -90 │──────────●─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      │           ╲     Phase margin = 60°
 -135 │            ╲
      │             ●────────────────────────────
 -180 │──────────────────────────────────────────
      └────────────────────────────────────────► f (Hz)
         10   100   500  1k   10k   100k

Stability Specifications:
─────────────────────────
Loop                Crossover    Phase Margin   Gain Margin
────────────────────────────────────────────────────────────
Voltage loop        500 Hz       >60°           >10 dB
Current loop        15 kHz       >75°           >12 dB
PLL loop            20 Hz        >50°           >15 dB

Nyquist Criterion:
──────────────────
• No encirclement of (-1, 0) point
• Verified stable for all operating conditions
• Robust to ±20% parameter variation

Impedance Stability (for Parallel Modules):
───────────────────────────────────────────
• Output impedance: Zout < 0.1Ω up to 10 kHz
• Ratio Zout/Zload > 6 dB for stability
• No negative resistance region (passive output)
```

---

## 11. Bill of Materials - Power Stage

### EK3 (3.3 kW) - Power Electronics BOM

| Component | Part Number | Qty | Unit Price | Total |
|------------|-------------|-----|------------|-------|
| SiC MOSFET 900V | C3M0065090D | 4 | €18 | €72 |
| SiC Schottky 650V | C3D10065A | 4 | €8 | €32 |
| Gate Driver | Si823H | 2 | €12 | €24 |
| Resonant Capacitor | Film, 200kHz rated | 4 | €5 | €20 |
| Planar Transformer | PCB integrated, 3.3kW | 1 | €60 | €60 |
| DC Link Capacitor | Film 800V, 100µF | 2 | €20 | €40 |
| CM Choke | Nanocrystalline | 1 | €25 | €25 |
| Current Sensor | TLI4971 | 1 | €8 | €8 |
| Heatsink + Vapor Chamber | Aluminum, finned | 1 | €35 | €35 |
| PCB | 4-layer, 2oz Cu, planar Tx | 1 | €50 | €50 |
| STM32G474 + passives | MCU + CAN-FD | 1 | €15 | €15 |
| Connectors (20-pin + power) | Blind-mate | 1 | €30 | €30 |
| **TOTAL Power Stage** | | | | **€411** |

### EK30 (30 kW) - Power Electronics BOM

| Component | Part Number | Qty | Unit Price | Total |
|------------|-------------|-----|------------|-------|
| SiC Module 1200V | CAB011M12FM3 | 2 | €350 | €700 |
| SiC MOSFET 650V (T-type) | Various | 12 | €20 | €240 |
| Gate Driver Module | Integrated | 2 | €80 | €160 |
| LLC Transformer | Custom, 10kW each | 3 | €150 | €450 |
| DC Bus Capacitor Bank | 900V, film | 1 set | €200 | €200 |
| CM Choke | High current | 1 | €80 | €80 |
| Current Sensors | Industrial | 6 | €25 | €150 |
| Coldplate (liquid) | Aluminum, channels | 1 | €150 | €150 |
| PCB Assembly | 6-layer, heavy Cu | 1 | €200 | €200 |
| Connectors, busbars | High current | - | - | €150 |
| **TOTAL Power Stage** | | | | **€2,480** |

---

## 12. Performance Targets

### EK3 Targets

```
Parameter               Target      Notes
──────────────────────────────────────────
Peak efficiency         >96%        @ 50-75% load, 400V output
Full load efficiency    >95%        @ 3.3 kW
Light load efficiency   >90%        @ 10% load
THD (current)          N/A         DC/DC only (central PFC)
Power factor           N/A         DC/DC only
Standby power          <3W         Deep sleep mode
Turn-on time           <5s         Hot-swap ready
Hot-swap time          <1s         Electrical disconnect
Communication          CAN-FD      @ 5 Mbps
Load step response     <200 µs     10%-90% step, <5% deviation
V2G round-trip         >90%        AC→DC→AC
```

### EK30 Targets

```
Parameter               Target      Notes
──────────────────────────────────────────
Peak efficiency         >98%        @ 50% load
Full load efficiency    >97%        @ 30 kW
THD (current)          <2%         3-level advantage
Power factor           >0.995      T-type NPC
Standby power          <10W        Per module
V2G round-trip eff     >94%        AC→DC→AC
Reactive power         ±50%        Of rated kVA
Anti-islanding         <2s         IEEE 1547 compliant
```

---

## 13. Testing and Validation

### 13.1 Prototype Testing Plan

```
TEST PHASES
════════════════════════════════════════════════════════════════

Phase 1: Component Verification
───────────────────────────────
□ SiC MOSFET switching characterization
□ Gate driver propagation delay matching
□ Transformer inductance verification
□ Resonant tank frequency measurement
□ PCB thermal imaging (static)

Phase 2: Open-Loop Testing
──────────────────────────
□ LLC switching waveforms (ZVS verification)
□ Resonant current shape
□ Transformer voltage stress
□ EMI pre-compliance scan
□ Efficiency at fixed operating point

Phase 3: Closed-Loop Testing
────────────────────────────
□ Voltage regulation accuracy
□ Load step response
□ Startup sequence
□ Protection trigger verification
□ Full power thermal steady-state

Phase 4: System Integration
───────────────────────────
□ CAN-FD communication validation
□ Multi-module parallel operation
□ Droop control current sharing
□ V2G mode transitions
□ Anti-islanding response

Phase 5: Compliance Testing
───────────────────────────
□ CISPR 11 conducted emissions
□ IEC 61000-4-x immunity tests
□ IEC 62477 safety evaluation
□ Efficiency per EN 50530
□ Endurance (1000 hour burn-in)
```

### 13.2 Key Test Setups

```
EFFICIENCY MEASUREMENT SETUP
════════════════════════════════════════════════════════════════

         ┌─────────┐      ┌─────────┐      ┌─────────┐
 Grid ──►│ AC/DC   │─────►│  EK3    │─────►│  E-Load │
         │ Source  │      │  DUT    │      │         │
         └────┬────┘      └────┬────┘      └────┬────┘
              │                │                │
              ▼                ▼                ▼
         ┌─────────┐      ┌─────────┐      ┌─────────┐
         │ Power   │      │ Power   │      │ Power   │
         │ Meter   │      │ Meter   │      │ Meter   │
         │ (Pin)   │      │ (Ploss) │      │ (Pout)  │
         └─────────┘      └─────────┘      └─────────┘

Efficiency = Pout / Pin (direct measurement)
Accuracy requirement: <0.1% for Class A efficiency rating
```

---

## 14. References and Sources

### Component Datasheets
- [Wolfspeed C3M0065090D (900V SiC MOSFET)](https://www.wolfspeed.com/products/power/sic-mosfets/900v-silicon-carbide-mosfets/)
- [Wolfspeed 1200V SiC MOSFETs](https://www.wolfspeed.com/products/power/sic-mosfets/1200v-silicon-carbide-mosfets/)
- [Wolfspeed Gen 4 Technology](https://www.eenewseurope.com/en/wolfspeed-launches-fourth-generation-sic-technology/)
- [Silicon Labs Si823H Gate Driver](https://www.silabs.com/power/gate-drivers)
- [Infineon TLI4971 Current Sensor](https://www.infineon.com/cms/en/product/sensor/current-sensors/)

### Application Notes
- [Wolfspeed 30kW Interleaved LLC](https://forum.wolfspeed.com/uploads/22UYEDDEDTVL/a-sic-based-30kw-three-phases-interleaved-llc-converter-for-ev-fast-charger.pdf)
- [ON Semi - Fast DC EV Charging Topologies](https://www.onsemi.com/pub/collateral/tnd6366-d.pdf)
- [EE Power - Bidirectional Topologies](https://eepower.com/technical-articles/bi-directional-topologies-for-fast-charging-of-evs-options-to-optimize-for-size-power-cost-or-simplicity/)
- [ROHM 800V Three-Phase LLC](https://fscdn.rohm.com/en/products/databook/applinote/discrete/sic/mosfet/800v_three-phase_output_llc_dcdc_resonant_converter_an-e.pdf)

### Standards
- IEC 62477-1: Safety requirements for power electronic converter systems
- IEC 61851-23: DC EV charging station requirements
- IEEE 1547-2018: Interconnection and interoperability of DER
- CISPR 11: Industrial EMC limits
- EN 50549-1: Requirements for grid connection of generating plants

### Related Documentation
- `tehnika/SPECIFICATIONS.md` - Master specification (source of truth)
- `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` - Complete EK3 module design
- `tehnika/komponente/power-electronics.md` - Vienna rectifier PFC details
- `tehnika/04-v2g-grid.md` - V2G system architecture
- `tehnika/03-thermal-management.md` - Cooling system design
