# Thermal Management Sistem

## Filozofija: Liquid Cooling jer je Bolje

```
AIR COOLING                      LIQUID COOLING
────────────────────────────────────────────────────────────
"Jednostavnije"              →   "2× veća gustina snage"
h = 25-250 W/m²K             →   h = 100-20,000 W/m²K
Pasivno                      →   Aktivno + AI kontrola
Fiksni airflow               →   Dinamički flow rate
ΔT = 40-60°C                 →   ΔT = 10-20°C
Bučno pri visokoj snazi      →   Tiho (pumpa < ventilator)
```

---

## 1. Zašto Liquid Cooling?

### Termalna Fizika

```
HEAT CAPACITY COMPARISON
────────────────────────
Vazduh (air):     Cp ≈ 1,005 J/(kg·K)
Voda (water):     Cp ≈ 4,186 J/(kg·K)
Etilen glikol 50%: Cp ≈ 3,400 J/(kg·K)

Voda ima ~3,500× veći volumetrijski toplotni kapacitet od vazduha

HEAT TRANSFER COEFFICIENT
─────────────────────────
Natural convection (air):     5-25 W/m²K
Forced convection (air):      25-250 W/m²K
Liquid (laminar flow):        100-1,000 W/m²K
Liquid (turbulent flow):      1,000-20,000 W/m²K
Microchannel liquid:          10,000-100,000 W/m²K

Liquid cooling: 10-100× efikasniji prenos toplote
```

### Power Density Impact

```
AIR COOLED EK30 (hypothetical)
──────────────────────────────
Power: 30 kW
Heatsink volume: ~15 L
Fan airflow: 500+ CFM
Noise: 60+ dB
Total volume: ~25 L
Power density: 1.2 kW/L

LIQUID COOLED EK30 (actual design)
──────────────────────────────────
Power: 30 kW
Coldplate volume: ~0.5 L
Pump + radiator: ~3 L (shared)
Noise: <40 dB
Total volume: ~12 L
Power density: 2.5 kW/L

Result: 2× veća gustina snage
```

---

## 2. Thermal Architecture

### EK3 (3 kW) - Hybrid Cooling

```
EK3 koristi kombinovani pristup:
• Primarno: Kondukcija na aluminum enclosure
• Sekundarno: Natural/forced air convection
• Opciono: Liquid cooling interface za ugradnju u EK30 kabinet

┌─────────────────────────────────────────────┐
│                  AMBIENT AIR                │
│                      ↑                      │
│                  convection                 │
│                      │                      │
│    ┌─────────────────┴─────────────────┐   │
│    │         ALUMINUM ENCLOSURE         │   │
│    │         (finned exterior)          │   │
│    │                 ↑                  │   │
│    │            conduction              │   │
│    │                 │                  │   │
│    │    ┌────────────┴────────────┐    │   │
│    │    │    INTERNAL HEATSINK    │    │   │
│    │    │         (TIM)           │    │   │
│    │    │           ↑             │    │   │
│    │    │      ┌────┴────┐        │    │   │
│    │    │      │ SiC MOSFETs     │    │   │
│    │    │      │ (heat source)   │    │   │
│    │    │      └─────────────────┘    │   │
│    │    └─────────────────────────────┘   │
│    └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

Thermal budget EK3 (3 kW, 96% efficiency):
• Power loss: 3 kW × 4% = 120 W
• Target Tj_max: 150°C
• Target Tcase: 100°C
• Ambient max: 45°C
• Required Rth (junction-ambient): (150-45)/120 = 0.875 K/W
• Achievable with proper heatsink design
```

### EK30 (30 kW) - Full Liquid Cooling

```
┌──────────────────────────────────────────────────────────────────┐
│                       COOLING LOOP                                │
│                                                                   │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐                 │
│   │ RADIATOR│◄─────│  PUMP   │◄─────│RESERVOIR│                 │
│   │  + FAN  │      │         │      │         │                 │
│   └────┬────┘      └─────────┘      └────┬────┘                 │
│        │                                  │                      │
│        │           COOLANT FLOW           │                      │
│        │                                  │                      │
│        ▼                                  ▲                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    COLDPLATE                             │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │  │  PFC    │  │  LLC    │  │  LLC    │  │  LLC    │    │   │
│   │  │ Stage   │  │ Phase A │  │ Phase B │  │ Phase C │    │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│   │                                                         │   │
│   │              Microchannel structure                     │   │
│   │              Thermal interface material                 │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Thermal budget EK30 (30 kW, 97% efficiency):
• Power loss: 30 kW × 3% = 900 W
• Target Tj_max: 150°C (SiC can handle 175°C)
• Target Tcase: 80°C
• Coolant inlet: 35°C (controlled)
• Required Rth (junction-coolant): (150-35)/900 = 0.128 K/W
• Distributed across multiple devices - achievable
```

---

## 3. Coldplate Dizajn

### Microchannel Technology

```
COLDPLATE CROSS-SECTION
───────────────────────

    Device mounting surface (flat, lapped)
    ▼
┌───────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Base plate (Al or Cu)
├───────────────────────────────────────────────┤
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │ ← Microchannel fins
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │   (0.5-1mm pitch)
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │
│ ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃   │ ← Coolant flow
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │
├───────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Bottom cover
└───────────────────────────────────────────────┘
        ↑                               ↓
      Inlet                           Outlet


CHANNEL SPECIFICATIONS
──────────────────────
Channel width: 0.5 - 1.0 mm
Channel height: 3 - 5 mm
Fin thickness: 0.5 - 1.0 mm
Number of channels: 50-100 (depending on device footprint)

MATERIALS
─────────
Aluminum 6061-T6:
• Thermal conductivity: 167 W/m·K
• Lightweight, cost-effective
• Good for most applications

Copper C110:
• Thermal conductivity: 390 W/m·K
• 2× better than aluminum
• Heavier, more expensive
• For highest power density

ELEKTROKOMBINACIJA choice: Aluminum with optimized channel design
• Balance of performance, weight, cost
• AI optimizes flow rate to compensate
```

### Flow Configuration

```
SINGLE-PASS vs MULTI-PASS
─────────────────────────

Single-pass (simpler):
┌─────────────────────────────────────────┐
│  IN →→→→→→→→→→→→→→→→→→→→→→→→→→→→→ OUT  │
└─────────────────────────────────────────┘
• Simple manufacturing
• Lower pressure drop
• Less uniform temperature

Multi-pass serpentine (EK30):
┌─────────────────────────────────────────┐
│  IN →→→→→→→→→→→→→→→→→→→→→→→→→→→│      │
│     ┌────────────────────────────┘      │
│     │←←←←←←←←←←←←←←←←←←←←←←←←←←←←      │
│     └────────────────────────────┐      │
│      →→→→→→→→→→→→→→→→→→→→→→→→→→→│ OUT  │
└─────────────────────────────────────────┘
• Better temperature uniformity
• Higher pressure drop
• Preferred for high-power

Counter-flow (za buduće verzije):
• Coldest coolant meets hottest devices
• Best temperature uniformity
• Complex manifold design
```

### Thermal Interface Material (TIM)

```
TIM SELECTION
─────────────

Phase Change Material (recommended):
• Thermal conductivity: 3-5 W/m·K
• Bond line thickness: 25-50 µm
• Reflows at operating temperature
• Self-healing on thermal cycles

Thermal grease:
• Thermal conductivity: 1-8 W/m·K
• Requires proper application
• May pump out over time

Graphite pad:
• Thermal conductivity: 5-15 W/m·K (in-plane)
• Consistent bond line
• Good for flat surfaces

ELEKTROKOMBINACIJA: Phase change TIM
• Thermal conductivity: 5 W/m·K
• Self-adjusting bond line
• Long-term reliability
```

---

## 4. Cooling Loop Components

### Pump Selection

```
PUMP REQUIREMENTS
─────────────────
Flow rate: 5-10 L/min
Head pressure: 0.5-1.0 bar
Noise: <30 dB @ 1m

PUMP OPTIONS
────────────

Centrifugal pump (AC motor):
• Higher flow rates
• Reliable, proven
• Needs inverter drive for variable speed

Brushless DC pump (recommended):
• Variable speed control (PWM)
• Compact, quiet
• Direct MCU control
• 12V or 24V operation

Recommended: Laing DDC series or equivalent
• Flow: up to 15 L/min
• Head: up to 1.5 bar
• Power: 10-20W
• Noise: <25 dB
• PWM speed control
```

### Radiator

```
RADIATOR SIZING
───────────────
Heat to dissipate: 900 W (EK30 at full load)
Ambient temperature: up to 45°C
Coolant inlet target: 35°C
ΔT (coolant to ambient): -10°C minimum

Required radiator capacity:
• 900W / 10K = 90 W/K
• With safety margin: 120 W/K rated capacity

RADIATOR SPECIFICATION
──────────────────────
Type: Aluminum fin-tube, cross-flow
Size: ~300 × 300 × 50 mm
Fan: 120-140mm, PWM controlled
Airflow: 50-100 CFM (variable)

Fan control strategy:
• Coolant temp < 30°C: Fan off (natural convection)
• Coolant temp 30-40°C: Fan low speed (30-50%)
• Coolant temp 40-50°C: Fan medium (50-80%)
• Coolant temp > 50°C: Fan full speed
```

### Coolant

```
COOLANT SELECTION
─────────────────

Option 1: Distilled water + biocide
• Best heat capacity
• Needs corrosion inhibitors
• Freezing protection needed for cold climates

Option 2: Propylene glycol/water 30:70 (recommended)
• Food-safe glycol
• Freeze protection to -15°C
• Slightly lower heat capacity (~3,800 J/kg·K)
• Built-in corrosion protection

Option 3: Ethylene glycol/water 50:50
• Freeze protection to -35°C
• Lower heat capacity (~3,400 J/kg·K)
• Toxic - not recommended for consumer products

ELEKTROKOMBINACIJA: Propylene glycol 30% solution
• Non-toxic
• Good freeze protection
• Compatible with aluminum and copper
• Includes corrosion inhibitors
```

### Reservoir

```
RESERVOIR FUNCTION
──────────────────
• Air bubble elimination
• Thermal expansion compensation
• Coolant level monitoring
• Fill/drain port

SIZE
────
Volume: 200-500 mL
Type: Inline or T-junction
Material: HDPE or aluminum

SENSORS
───────
• Level sensor (low level warning)
• Temperature sensor (inlet temp)
• Optional: Pressure sensor (leak detection)
```

---

## 5. Junction Temperature Estimation

### Zašto je Tj Kritičan?

```
FAILURE STATISTICS
──────────────────
• 31% of power electronics failures = semiconductor failure
• 60% of semiconductor failures = thermal-related
• Failure rate doubles for every 10°C Tj increase

Za SiC:
• Max Tj: 175°C (vs 150°C for Si IGBT)
• Operating target: <150°C (25°C margin)
• Reliability improves significantly at lower Tj
```

### Temperature Sensitive Electrical Parameters (TSEP)

```
METHOD 1: Threshold Voltage (Vth)
─────────────────────────────────
Principle: Vth decreases with temperature

Measurement:
• Apply small gate voltage during off-state
• Measure drain current at known Vgs
• Temperature coefficient: ~-5mV/°C

Accuracy: ±3°C
Latency: <1ms

METHOD 2: On-State Voltage (Vds,on)
───────────────────────────────────
Principle: Rds(on) increases with temperature

Measurement:
• Measure Vds during conduction
• At known current Id
• Temperature coefficient: +0.3%/°C to +0.5%/°C

Accuracy: ±5°C
Latency: Real-time (during switching)

METHOD 3: Turn-off Delay Time (td,off)
──────────────────────────────────────
Principle: Miller plateau duration changes with Tj

Measurement:
• Measure time from gate drive off to current fall
• Requires high-speed measurement

Accuracy: ±3°C
Latency: Per switching cycle
```

### AI-Enhanced Tj Estimation

```
MULTI-PARAMETER FUSION
──────────────────────

Inputs to AI model:
• Vds,on measurement (real-time)
• Id (load current)
• Switching frequency
• Coolant temperature
• Ambient temperature
• Heatsink temperature (NTC)
• Power loss estimate

AI Model: Neural network trained on thermal simulation + test data

Output:
• Estimated Tj (continuous)
• Confidence interval
• Thermal margin indicator

┌─────────────────────────────────────────────────────────┐
│                                                         │
│   [Vds,on]───┐                                         │
│   [Id]───────┼───→ [Feature     ]    [Neural    ]      │
│   [fsw]──────┤     [Engineering ]───→[Network   ]──→ Tj │
│   [T_coolant]┤                       [Regressor ]      │
│   [T_ambient]┘                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘

Training data:
• Thermal simulation (FEA) - millions of operating points
• Bench testing with direct Tj measurement
• Field data from fleet operation

Accuracy target: ±2°C (better than single TSEP)
```

### Thermal Impedance Model

```
FOSTER NETWORK (for transient estimation)
─────────────────────────────────────────

    Tj ──[Rth1]──┬──[Rth2]──┬──[Rth3]──┬──[Rth4]──── Tc
                 │          │          │          │
                [Cth1]     [Cth2]     [Cth3]     [Cth4]
                 │          │          │          │
                GND        GND        GND        GND

Typical values (SiC module):
• Rth1=0.02K/W, τ1=0.001s (die)
• Rth2=0.05K/W, τ2=0.01s (die attach)
• Rth3=0.03K/W, τ3=0.1s (baseplate)
• Rth4=0.02K/W, τ4=1.0s (coldplate)

Total Rth,j-c = 0.12 K/W

Implementation:
• Digital filter implementation
• Update every switching cycle
• Handles transient thermal events
```

---

## 6. AI Thermal Control

### Predictive Temperature Management

```
TRADITIONAL APPROACH
────────────────────
1. Temperature exceeds threshold
2. Reduce power (derating)
3. Wait for temperature to drop
4. Resume full power

Problem: Reactive, causes charging interruption

AI APPROACH (ELEKTROKOMBINACIJA)
────────────────────────────────
1. AI predicts temperature trajectory
2. Pro-actively adjusts:
   • Cooling (fan/pump speed)
   • Power level (gradual, imperceptible)
   • Charging profile optimization
3. Temperature stays in optimal range
4. No sudden derating needed

Result: Smooth charging, no interruptions
```

### Thermal-Aware Charging Profile

```
SCENARIO: Hot summer day, 45°C ambient

Traditional charger:
┌────────────────────────────────────────────────┐
│ Power                                          │
│  ▲                                             │
│  │   ████████████                              │
│  │   █          █                              │
│  │   █          █████                          │
│  │   █              █████                      │ ← Thermal derating
│  │   █                  █████████████████      │
│  └───┼──────────────────────────────────→ Time │
└────────────────────────────────────────────────┘

ELEKTROKOMBINACIJA:
┌────────────────────────────────────────────────┐
│ Power                                          │
│  ▲                                             │
│  │   ████████████████████████████████████      │ ← Optimized constant
│  │   █                                  █      │    power, slightly lower
│  │   █                                  █      │    but no interruptions
│  │   █                                  █████  │
│  │   █                                       █ │
│  └───┼──────────────────────────────────→ Time │
└────────────────────────────────────────────────┘

AI calculates:
• Maximum sustainable power for current conditions
• Optimal cooling setpoints
• Predicted completion time (often same or better!)
```

### Multi-Module Thermal Coordination

```
SWARM THERMAL BALANCING
───────────────────────

5 × EK30 modules in parallel:

Module 1: Tj = 120°C (high - closer to air inlet)
Module 2: Tj = 125°C
Module 3: Tj = 130°C (hottest)
Module 4: Tj = 125°C
Module 5: Tj = 115°C (coolest)

Traditional: All at equal power → Module 3 derates

ELEKTROKOMBINACIJA swarm:
• Module 5 takes more load (cooler)
• Module 3 reduces load (hotter)
• Total power maintained
• No derating needed

┌─────────────────────────────────────────────────┐
│                                                 │
│   M1: 28kW ──┐                                 │
│   M2: 26kW ──┼──→ 150 kW total                 │
│   M3: 24kW ──┤    (no change)                  │
│   M4: 27kW ──┤                                 │
│   M5: 35kW ──┘                                 │
│                                                 │
│   Instead of: 5×30=150 → 5×27=135 (derating)   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 7. Safety Features

### Thermal Protection Hierarchy

```
LEVEL 1: AI OPTIMIZATION (continuous)
─────────────────────────────────────
• Predictive temperature control
• Gradual power adjustment
• Preventive cooling adjustment

LEVEL 2: SOFT LIMITS (firmware)
───────────────────────────────
• Tj > 130°C: Increase cooling, log warning
• Tj > 140°C: Reduce power by 20%
• Tj > 150°C: Reduce power by 50%

LEVEL 3: HARD LIMITS (hardware)
───────────────────────────────
• Tj > 160°C: Hardware shutdown via NTC comparator
• Coolant flow < min: Shutdown
• Coolant level low: Shutdown

LEVEL 4: PASSIVE SAFETY
───────────────────────
• Phase change TIM: Absorbs transient heat
• Thermal fuse: Last resort protection
• Natural convection path: Prevents thermal runaway
```

### Leak Detection

```
METHODS
───────

1. Coolant level sensor (reservoir)
   • Primary leak indicator
   • Simple, reliable
   • Slow response for small leaks

2. Pressure sensor (loop)
   • Detects pressure drop
   • Fast response
   • Can detect small leaks

3. Humidity sensor (inside enclosure)
   • Detects leaked coolant vapor
   • Very sensitive
   • Catches internal leaks

4. Conductivity sensor (drip tray)
   • Detects pooled coolant
   • Simple and cheap
   • Last-line defense

Response to leak detection:
• Stop pump immediately
• Shutdown power electronics
• Alert operator
• Log event with timestamp
```

---

## 8. Bill of Materials - Thermal System

### EK30 Thermal BOM

| Komponenta | Specifikacija | Qty | Unit Price | Total |
|------------|---------------|-----|------------|-------|
| Coldplate | Aluminum, microchannel, 300×200mm | 1 | €120 | €120 |
| Pump | Brushless DC, 10L/min, PWM | 1 | €35 | €35 |
| Radiator | Al fin-tube, 300×300×50mm | 1 | €60 | €60 |
| Radiator Fan | 140mm PWM, low noise | 2 | €15 | €30 |
| Reservoir | 300mL, inline | 1 | €15 | €15 |
| Tubing | Silicone, 10mm ID, 5m | 1 set | €20 | €20 |
| Fittings | Push-to-connect, 10mm | 10 | €3 | €30 |
| Coolant | Propylene glycol premix, 2L | 1 | €15 | €15 |
| TIM | Phase change, 300×200mm sheet | 1 | €25 | €25 |
| NTC Sensors | 10k, M3 threaded | 6 | €2 | €12 |
| Level Sensor | Capacitive, reservoir mount | 1 | €10 | €10 |
| Flow Sensor | Hall effect, inline | 1 | €15 | €15 |
| Drip Tray | Plastic, conductive sensor | 1 | €10 | €10 |
| **TOTAL Thermal** | | | | **€397** |

---

## 9. Performance Targets

| Parametar | Target | Notes |
|-----------|--------|-------|
| Max Tj at full load | <150°C | 25°C margin to absolute max |
| Coolant ΔT (in-out) | <10°C | At 30 kW |
| Rth junction-coolant | <0.13 K/W | Per module |
| Pump power | <20W | <1% of system power |
| Fan noise | <45 dB | At max cooling |
| Leak rate | 0 (sealed system) | 5-year warranty |
| Coolant life | 5 years | No maintenance interval |

---

## Reference i Izvori

- [Boyd Liquid Cold Plates](https://www.boydcorp.com/thermal/liquid-cooling-systems/liquid-cold-plates.html)
- [EV Charger Liquid Cooling Requirements](https://www.evengineeringonline.com/why-high-power-dc-ev-chargers-require-liquid-cooling-systems/)
- [SiC MOSFET Tj Estimation Research](https://www.sciencedirect.com/science/article/abs/pii/S2590116823000164)
- [TSEP Methods for Tj Monitoring](https://www.sciopen.com/article/10.17775/CSEEJPES.2021.04840)
- [Thermal Impedance Modeling](https://www.researchgate.net/publication/388789019_Estimation_of_junction_temperature_of_SiC_MOSFET_based_on_thermal_impedance_modelling)
- [Neural Concept - Cold Plate Optimization](https://www.neuralconcept.com/post/what-is-a-cold-plate-applications-design-optimization)
