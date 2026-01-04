# Thermal Management System

## Philosophy: Liquid Cooling Because It's Better

```
AIR COOLING                      LIQUID COOLING
────────────────────────────────────────────────────────────
"Simpler"                    →   "2x higher power density"
h = 25-250 W/m²K             →   h = 100-20,000 W/m²K
Passive                      →   Active + AI control
Fixed airflow                →   Dynamic flow rate
ΔT = 40-60°C                 →   ΔT = 10-20°C
Noisy at high power          →   Quiet (pump < fan)
```

---

## 1. Why Liquid Cooling?

### Thermal Physics

```
HEAT CAPACITY COMPARISON
────────────────────────
Air:                  Cp ≈ 1,005 J/(kg·K)
Water:                Cp ≈ 4,186 J/(kg·K)
Ethylene glycol 50%:  Cp ≈ 3,400 J/(kg·K)

Water has ~3,500x greater volumetric heat capacity than air

HEAT TRANSFER COEFFICIENT
─────────────────────────
Natural convection (air):     5-25 W/m²K
Forced convection (air):      25-250 W/m²K
Liquid (laminar flow):        100-1,000 W/m²K
Liquid (turbulent flow):      1,000-20,000 W/m²K
Microchannel liquid:          10,000-100,000 W/m²K

Liquid cooling: 10-100x more efficient heat transfer
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

Result: 2x higher power density
```

---

## 2. Thermal Architecture

### EK3 (3 kW) - Hybrid Cooling

```
EK3 uses a combined approach:
• Primary: Conduction to aluminum enclosure
• Secondary: Natural/forced air convection
• Optional: Liquid cooling interface for installation in EK30 cabinet

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

## 3. Coldplate Design

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

Counter-flow (for future versions):
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

### Why is Tj Critical?

```
FAILURE STATISTICS
──────────────────
• 31% of power electronics failures = semiconductor failure
• 60% of semiconductor failures = thermal-related
• Failure rate doubles for every 10°C Tj increase

For SiC:
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

### 6.4 TinyML Implementation

```
NEURAL NETWORK ARCHITECTURE FOR JUNCTION TEMPERATURE ESTIMATION
═══════════════════════════════════════════════════════════════

Framework: TensorFlow Lite Micro
Target MCU: STM32G474 (Cortex-M4F @ 170MHz)

Model Structure:
┌─────────────────────────────────────────────────────────────┐
│ INPUT LAYER (10 features)                                   │
│                                                             │
│ • Vds,on [mV]        - On-state voltage measurement        │
│ • Id [A]             - Drain current                        │
│ • fsw [kHz]          - Switching frequency                  │
│ • T_heatsink [°C]    - NTC reading                         │
│ • T_ambient [°C]     - Inlet air temperature               │
│ • P_out [W]          - Output power                        │
│ • duty_cycle [%]     - PWM duty cycle                      │
│ • time_since_start [s] - Operating time                    │
│ • power_integral [Wh] - Cumulative energy                  │
│ • dT/dt [°C/s]       - Temperature rate of change          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ HIDDEN LAYER 1: Dense(32, ReLU)                             │
│ Weights: 10×32 = 320 + 32 bias = 352 parameters             │
│ Batch Normalization (optional for stability)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ HIDDEN LAYER 2: Dense(32, ReLU)                             │
│ Weights: 32×32 = 1024 + 32 bias = 1,056 parameters          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ OUTPUT LAYER: Dense(2, Linear)                              │
│                                                             │
│ • Tj_estimate [°C]   - Predicted junction temperature      │
│ • Confidence [0-1]   - Model uncertainty estimate          │
│                                                             │
│ Weights: 32×2 = 64 + 2 bias = 66 parameters                │
└─────────────────────────────────────────────────────────────┘


MODEL SPECIFICATIONS
────────────────────
Total Parameters: 1,474
Model Size (FP32): ~6 KB
Model Size (INT8 quantized): ~2 KB
Inference Time: <100 µs @ 170MHz (M4F with FPU)
Update Rate: 1 kHz (matches control loop)


TRAINING DATA SOURCES
─────────────────────

Source 1: FEA Thermal Simulation
• 1,000,000+ operating points from ANSYS parametric study
• Covers: 0-100% power, 25-55°C ambient, 1-3.5 m/s airflow
• Junction temperature computed from detailed thermal model
• Augmented with noise for robustness

Source 2: Bench Testing
• 10,000+ points from prototype characterization
• Direct Tj measurement via fiber optic sensor on die
• Validation of simulation predictions
• Edge case coverage (transients, faults)

Source 3: Fleet Data (future deployment)
• Continuous learning from deployed modules
• Federated learning (privacy-preserving)
• Model updates via OTA firmware

Training Split:
• Training: 80%
• Validation: 10%
• Test: 10%


MODEL PERFORMANCE TARGETS
─────────────────────────
Mean Absolute Error (MAE): < 2°C
Max Error (99th percentile): < 5°C
Latency: < 100 µs
Memory footprint: < 10 KB (including buffers)


QUANTIZATION STRATEGY
─────────────────────
• Post-training quantization (INT8)
• Per-channel quantization for weights
• Per-tensor quantization for activations
• Calibration dataset: 1000 representative samples
• Accuracy loss after quantization: < 0.3°C MAE increase


DEPLOYMENT WORKFLOW
───────────────────
1. Train in TensorFlow/Keras on PC
2. Convert to TensorFlow Lite (.tflite)
3. Quantize to INT8
4. Generate C source using xxd or TFLite Micro tools
5. Integrate with FreeRTOS firmware
6. Validate on-target against test dataset
```

### 6.5 TSEP Calibration Procedure

```
VDS,ON TEMPERATURE SENSING (TSEP)
═══════════════════════════════════════════════════════════════

PRINCIPLE
─────────
The on-state drain-source voltage (Vds,on) of a SiC MOSFET
increases with junction temperature due to increased Rds,on.

Vds,on = Id × Rds,on(Tj)

For Wolfspeed C3M0065090D:
• Rds,on @ 25°C: 65 mΩ
• Rds,on @ 150°C: ~130 mΩ (approximately 2× increase)
• Temperature coefficient: ~0.5 mΩ/°C


CALIBRATION SETUP
─────────────────

Equipment Required:
• Thermal chamber (0°C to 150°C range)
• Precision current source (1-10A, ±0.1%)
• High-precision voltmeter (±0.1 mV)
• Reference thermocouple on MOSFET case
• Data acquisition system

Test Circuit:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌──────────────────────────────────────────────────┐    │
│    │         THERMAL CHAMBER                          │    │
│    │                                                  │    │
│    │     ┌────────────────┐                          │    │
│    │     │   EK3 MODULE   │                          │    │
│    │     │                │                          │    │
│    │     │   ┌────────┐   │                          │    │
│    │     │   │ MOSFET │◄──┼─── TC (reference Tj)    │    │
│    │     │   └───┬────┘   │                          │    │
│    │     │       │        │                          │    │
│    │     └───────┼────────┘                          │    │
│    │             │                                    │    │
│    └─────────────┼────────────────────────────────────┘    │
│                  │                                          │
│         ┌────────┴────────┐                                │
│         │  Current Source │ Id = 5A (fixed)                │
│         └────────┬────────┘                                │
│                  │                                          │
│         ┌────────┴────────┐                                │
│         │   Voltmeter     │ Measure Vds,on                 │
│         └─────────────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘


CALIBRATION PROCEDURE
─────────────────────

Step 1: Prepare Module
• Mount in thermal chamber
• Attach reference thermocouple to MOSFET case
• Connect current source and voltmeter
• Allow 30 min thermal stabilization at 25°C

Step 2: Collect Data Points
• Soak temperatures: 25°C, 50°C, 75°C, 100°C, 125°C
• At each temperature:
  - Wait 10 min for thermal equilibrium
  - Apply Id = 5A for 100 ms (pulse to avoid self-heating)
  - Record Vds,on immediately
  - Record reference temperature
  - Repeat 10 times for averaging

Step 3: Curve Fitting
• Plot Vds,on vs Tj data points
• Fit polynomial: Tj = a₀ + a₁×Vds,on + a₂×Vds,on²
• Calculate R² (should be > 0.999)
• Validate against holdout points

Step 4: Store Coefficients
• Write a₀, a₁, a₂ to module EEPROM
• Record calibration date and conditions
• Calculate calibration uncertainty


EXAMPLE CALIBRATION DATA
────────────────────────

Tj (°C)     Vds,on (mV)    Rds,on (mΩ)
────────────────────────────────────────
  25           325            65.0
  50           400            80.0
  75           475            95.0
  100          550           110.0
  125          625           125.0
────────────────────────────────────────

Fitted Polynomial:
Tj = -142.5 + 0.428 × Vds,on

Inverse (for Vds,on prediction):
Vds,on = 333 + 2.34 × Tj


CALIBRATION ACCURACY
────────────────────

Sources of Error:
• Thermocouple accuracy: ±1°C
• Current source accuracy: ±0.5%
• Voltmeter accuracy: ±0.1 mV → ±0.5°C
• Self-heating during pulse: ±1°C
• Thermal gradient (case to die): ±2°C

Combined Uncertainty (RSS): ±3°C

Calibration Validity:
• Re-calibrate: Every 10,000 hours
• Re-calibrate: After MOSFET replacement
• Verify periodically: Compare with NTC trend
```

### 6.6 Edge Case Handling

```
EDGE CASE THERMAL MANAGEMENT
═══════════════════════════════════════════════════════════════

CASE 1: COLD START (Startup from Low Temperature)
─────────────────────────────────────────────────

Problem:
• TSEP calibration invalid at low temperatures
• Thermal model not yet at equilibrium
• Risk of over-estimating or under-estimating Tj

Solution: Blended Estimation

Timeline:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   0-60s: MODEL ONLY                                         │
│   • Use thermal RC model: Tj = Ta + P × Rth                 │
│   • Conservative safety margin (+10°C)                      │
│   • TSEP readings logged but not used                       │
│                                                             │
│   60-300s: BLENDED MODE                                     │
│   • Weight: α = (t - 60) / 240                              │
│   • Tj_est = (1-α) × Tj_model + α × Tj_TSEP                │
│   • Gradual transition to TSEP                              │
│                                                             │
│   >300s: TSEP PRIMARY                                       │
│   • TSEP is primary estimator                               │
│   • Model used for sanity check (±10°C agreement)           │
│   • If mismatch > 10°C: Alert, use conservative             │
│                                                             │
└─────────────────────────────────────────────────────────────┘


CASE 2: TRANSIENT LOADS (Fast Power Changes)
────────────────────────────────────────────

Problem:
• Sudden power increase causes Tj to rise faster than TSEP can track
• Thermal inertia creates estimation lag
• Risk of thermal overshoot

Solution: Predictive Foster Network

Foster Thermal Model:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    Ploss ─┬──[R1]──┬──[R2]──┬──[R3]──┬──[R4]──── Tambient  │
│           │        │        │        │                      │
│          [C1]     [C2]     [C3]     [C4]                    │
│           │        │        │        │                      │
│          GND      GND      GND      GND                     │
│                                                             │
│    Layer 1: Die           R1=0.02 K/W, τ1=0.001s           │
│    Layer 2: Die attach    R2=0.05 K/W, τ2=0.01s            │
│    Layer 3: Baseplate     R3=0.03 K/W, τ3=0.1s             │
│    Layer 4: Heatsink      R4=0.40 K/W, τ4=5.0s             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Implementation:
• Sample power at 1 kHz
• Update each RC node digitally
• Predict Tj 100 ms ahead based on power trajectory
• Pre-emptively increase fan speed before Tj rises


CASE 3: COMMUNICATION LOSS (Swarm Unavailable)
──────────────────────────────────────────────

Problem:
• CAN bus failure isolates module from coordinator
• Cannot receive thermal balancing commands
• Cannot report own temperature to swarm

Solution: Local Fallback Mode

┌─────────────────────────────────────────────────────────────┐
│ STATE                  │ ACTION                             │
├────────────────────────┼────────────────────────────────────┤
│ CAN OK                 │ Normal swarm operation             │
│ CAN error for <1s      │ Use last known setpoint            │
│ CAN error for 1-10s    │ Reduce power to 80%                │
│ CAN error for >10s     │ Enter safe mode:                   │
│                        │  • Power limit: 50%                │
│                        │  • Tj target: 110°C (conservative) │
│                        │  • Fan: Maximum speed              │
│                        │  • Log event continuously          │
│ CAN restored           │ Gradual return to normal (10s)     │
└─────────────────────────────────────────────────────────────┘


CASE 4: SENSOR FAILURE
──────────────────────

Problem:
• NTC disconnected or shorted
• TSEP reading out of range
• Conflicting sensor data

Solution: Sensor Fusion with Plausibility Check

Sensor Plausibility Matrix:
┌─────────────────────────────────────────────────────────────┐
│ Sensor        │ Valid Range   │ Rate Limit   │ Cross-Check │
├───────────────┼───────────────┼──────────────┼─────────────┤
│ NTC heatsink  │ -40 to 150°C  │ ±5°C/s       │ vs Tambient │
│ NTC ambient   │ -40 to 85°C   │ ±1°C/s       │ vs NTC hs   │
│ TSEP (Vds,on) │ 200-800 mV    │ ±50 mV/s     │ vs NTC hs   │
│ NN estimate   │ -20 to 175°C  │ ±10°C/s      │ vs all      │
└─────────────────────────────────────────────────────────────┘

Failure Response:
• Single sensor fail: Use remaining sensors, log warning
• Two sensors fail: Enter safe mode, reduce to 50%
• All sensors fail: Immediate shutdown, critical alert


CASE 5: HIGH AMBIENT TEMPERATURE (>45°C)
────────────────────────────────────────

Problem:
• Reduced cooling capacity
• Faster approach to Tj limit
• Potential for thermal runaway

Solution: Proactive Derating

Algorithm:
1. Monitor ambient temperature trend
2. If Ta rising > 0.5°C/min, predict future Ta
3. Pre-calculate sustainable power for predicted Ta
4. Apply gradual power reduction BEFORE Tj limit
5. Notify operator of reduced capacity

Example:
• Current: Ta=42°C, P=3.3kW, Tj=105°C
• Trend: Ta rising 1°C every 2 min
• Prediction: Ta=45°C in 6 min
• Action: Reduce P to 2.7kW now (avoid sudden derate later)
```

### 6.7 Anomaly Detection Thresholds

```
AUTOENCODER-BASED ANOMALY DETECTION
═══════════════════════════════════════════════════════════════

ARCHITECTURE
────────────
Symmetric autoencoder for thermal anomaly detection:

Input (10 features) → Encoder → Latent (4) → Decoder → Output (10)

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  INPUT         ENCODER        LATENT       DECODER   OUTPUT │
│                                                             │
│   [10] ──────► [8] ──────► [4] ──────► [8] ──────► [10]    │
│                                                             │
│         Dense(8,ReLU)              Dense(8,ReLU)           │
│                     Dense(4,ReLU)                           │
│                                           Dense(10,Linear)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Total Parameters: ~300
Model Size (INT8): <1 KB
Inference Time: <50 µs


TRAINING
────────
• Training data: ONLY normal operation data
• No labeled anomalies needed (unsupervised)
• Train to minimize reconstruction error (MSE)
• 100,000+ samples from healthy modules


ANOMALY SCORE CALCULATION
─────────────────────────

Reconstruction Error (RE):
RE = Σ(x_i - x̂_i)² / n

where:
• x_i = input feature i (normalized)
• x̂_i = reconstructed feature i
• n = number of features (10)

Normalization:
• During training: Compute mean (μ) and std (σ) of RE
• During inference: Anomaly score = (RE - μ) / σ


THRESHOLD LEVELS
────────────────

┌─────────────────────────────────────────────────────────────┐
│ LEVEL      │ THRESHOLD │ ACTION                            │
├────────────┼───────────┼───────────────────────────────────┤
│ Normal     │ RE ≤ 2σ   │ Continue normal operation         │
│            │           │                                   │
│ Warning    │ 2σ < RE ≤ 3σ │ Log event with timestamp       │
│            │           │ Increase monitoring frequency     │
│            │           │ No power reduction                │
│            │           │                                   │
│ Alert      │ 3σ < RE ≤ 4σ │ Send notification to operator  │
│            │           │ Flag for next maintenance         │
│            │           │ Consider reducing power 10%       │
│            │           │                                   │
│ Action     │ 4σ < RE ≤ 5σ │ Reduce power by 20%            │
│            │           │ Schedule immediate inspection     │
│            │           │ Alert maintenance team            │
│            │           │                                   │
│ Critical   │ RE > 5σ   │ Safe shutdown                     │
│            │           │ Block restart until inspected     │
│            │           │ Emergency notification            │
└─────────────────────────────────────────────────────────────┘


TYPICAL ANOMALY PATTERNS
────────────────────────

Pattern 1: TIM Degradation
• Symptom: Gradually increasing Tj at same power
• RE contribution: High from Tj and NTC features
• Detection: 3-4σ alert typically 1000h before failure

Pattern 2: Fan Failure
• Symptom: Reduced airflow, higher Tj
• RE contribution: High from Tj, normal from electrical
• Detection: Within minutes of fan failure

Pattern 3: Sensor Drift
• Symptom: NTC reading diverges from expected
• RE contribution: High from affected sensor only
• Detection: Detectable before out-of-range

Pattern 4: Efficiency Degradation
• Symptom: Higher power loss at same output
• RE contribution: High from power and thermal
• Detection: Gradual, 4-6 months before critical


FALSE POSITIVE MANAGEMENT
─────────────────────────

Causes of False Positives:
• Unusual but valid operating conditions
• Environmental changes (first winter/summer)
• Load patterns not in training data

Mitigation:
• Hysteresis: Alert only if threshold exceeded for >10s
• Context awareness: Higher thresholds during transients
• Operator feedback: Mark false positives for retraining
• Periodic model updates: Incorporate new normal patterns


IMPLEMENTATION
──────────────

// Pseudocode for anomaly detection
void thermal_anomaly_check(float features[10]) {
    // Run autoencoder inference
    float reconstructed[10];
    autoencoder_forward(features, reconstructed);

    // Calculate reconstruction error
    float re = 0;
    for (int i = 0; i < 10; i++) {
        float diff = features[i] - reconstructed[i];
        re += diff * diff;
    }
    re = re / 10.0f;

    // Normalize to sigma units
    float anomaly_score = (re - RE_MEAN) / RE_STD;

    // Apply thresholds with hysteresis
    if (anomaly_score > 5.0f && anomaly_count++ > 10) {
        trigger_critical_shutdown();
    } else if (anomaly_score > 4.0f && anomaly_count++ > 10) {
        reduce_power(0.80f);
        send_alert(ALERT_ACTION);
    } else if (anomaly_score > 3.0f) {
        send_alert(ALERT_WARNING);
    }

    // Reset counter if back to normal
    if (anomaly_score < 2.0f) {
        anomaly_count = 0;
    }
}
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

| Component | Specification | Qty | Unit Price | Total |
|-----------|---------------|-----|------------|-------|
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

| Parameter | Target | Notes |
|-----------|--------|-------|
| Max Tj at full load | <150°C | 25°C margin to absolute max |
| Coolant ΔT (in-out) | <10°C | At 30 kW |
| Rth junction-coolant | <0.13 K/W | Per module |
| Pump power | <20W | <1% of system power |
| Fan noise | <45 dB | At max cooling |
| Leak rate | 0 (sealed system) | 5-year warranty |
| Coolant life | 5 years | No maintenance interval |

---

## 10. EK3 Forced Air Cooling Design

### 10.1 Heatsink Geometry

```
EXTRUDED ALUMINUM HEATSINK SPECIFICATION
═══════════════════════════════════════════════════════════════

Material: Aluminum 6063-T5
Thermal conductivity: 200 W/m·K
Density: 2.7 g/cm³
Surface finish: Anodized (black, emissivity ε = 0.85)

Overall Dimensions:
• Length: 280 mm (along airflow)
• Width: 180 mm (perpendicular to airflow)
• Total height: 33 mm (8mm base + 25mm fins)
• Mass: ~850 g

Fits within EK3 enclosure: 200 × 320 × 44 mm

Cross-Section (perpendicular to airflow):
┌──────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← Base plate
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   8 mm thick
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬─┤
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │ ← Fins
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │   25 mm height
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │   1.5 mm thick
│  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │ │   2.5 mm pitch
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴─┘

Fin Parameters:
• Number of fins: 72 (180mm / 2.5mm pitch)
• Fin height: 25 mm
• Fin thickness: 1.5 mm
• Fin spacing (channel): 1.0 mm
• Fin efficiency: ~92% (at 2.5 m/s airflow)
• Total fin area: 72 × 2 × 25mm × 280mm = 1.008 m²

Mounting:
• 4× M4 threaded inserts for MOSFET mounting
• 6× M3 holes for PCB standoffs
• Flatness tolerance: ≤0.05 mm (at MOSFET contact area)
• Surface roughness: Ra ≤ 1.6 μm

Manufacturing:
• Process: Aluminum extrusion
• Tolerance: ±0.3 mm general, ±0.1 mm at mounting surfaces
• Post-processing: CNC machining for mounting holes, anodizing
• Estimated cost: €8-12 per unit @ 1000+ quantity
```

### 10.2 Thermal Resistance Analysis

```
THERMAL STACK: JUNCTION TO AMBIENT
═══════════════════════════════════════════════════════════════

Heat Path:

   ┌─────────────────────────────────────────────────────────┐
   │                    AMBIENT AIR                           │
   │                         ▲                                │
   │                         │ Rth,hs-a = 0.45 K/W           │
   │                         │ (convection from fins)         │
   │    ┌────────────────────┴────────────────────────┐      │
   │    │              HEATSINK FINS                   │      │
   │    │                    ▲                         │      │
   │    │                    │ Rth,spread = 0.10 K/W  │      │
   │    │                    │ (spreading in base)    │      │
   │    │    ┌───────────────┴───────────────┐        │      │
   │    │    │         HEATSINK BASE          │        │      │
   │    │    │               ▲                │        │      │
   │    │    │               │ Rth,TIM = 0.15 K/W     │      │
   │    │    │               │ (thermal pad)  │        │      │
   │    │    │    ┌──────────┴──────────┐    │        │      │
   │    │    │    │    MOSFET PACKAGE    │    │        │      │
   │    │    │    │         ▲            │    │        │      │
   │    │    │    │         │ Rth,j-c = 0.50 K/W      │      │
   │    │    │    │         │ (datasheet) │    │        │      │
   │    │    │    │    ┌────┴────┐       │    │        │      │
   │    │    │    │    │ JUNCTION │       │    │        │      │
   │    │    │    │    │   (Tj)   │       │    │        │      │
   │    │    │    │    └─────────┘       │    │        │      │
   │    │    │    └──────────────────────┘    │        │      │
   │    │    └────────────────────────────────┘        │      │
   │    └──────────────────────────────────────────────┘      │
   └─────────────────────────────────────────────────────────┘


THERMAL RESISTANCE BUDGET
─────────────────────────────────────────────────────────────

Component                 Rth (K/W)    Notes
─────────────────────────────────────────────────────────────
SiC MOSFET (Rth,j-c)       0.50       Wolfspeed C3M0065090D
TIM - Thermal Pad          0.15       Bergquist GP5000, 0.25mm
Heatsink Spreading         0.10       Base plate conduction
Heatsink to Air            0.45       At 2.5 m/s, h=50 W/m²K
─────────────────────────────────────────────────────────────
TOTAL Rth,j-a              1.20 K/W
─────────────────────────────────────────────────────────────


TEMPERATURE CALCULATIONS
─────────────────────────────────────────────────────────────

Heat Sources (at 3.3kW, 96% efficiency):
• Total power loss: 3300W × (1/0.96 - 1) = 137.5W ≈ 140W
• MOSFETs (primary side): 40W (28%)
• Transformer core + windings: 35W (25%)
• Rectifier diodes: 25W (18%)
• Output inductor: 15W (11%)
• Control + misc: 25W (18%)

MOSFET Junction Temperature:
• P_MOSFET = 40W (distributed across 4 devices = 10W each)
• Rth,j-a per MOSFET = 1.20 K/W
• ΔT = 10W × 1.20 K/W = 12°C per MOSFET
• At Ta = 50°C ambient: Tj = 50 + 12 = 62°C ✓ (well below 150°C)

Parallel MOSFETs (thermal coupling):
• 4 MOSFETs share heatsink → effective Rth lower
• Combined: Tj = Ta + (40W × 0.75 K/W) = 50 + 30 = 80°C ✓

Worst Case (45°C ambient, 100% power):
• Tj = 45 + 30 + 10 (margin) = 85°C ✓
• Margin to Tj,max (150°C): 65°C ✓
```

### 10.3 Airflow Requirements

```
MODULE AIRFLOW SPECIFICATION
═══════════════════════════════════════════════════════════════

REQUIRED AIRFLOW
────────────────
Minimum: 12 CFM (0.34 m³/min, 5.7 L/s) per module
Design target: 15 CFM (0.42 m³/min) for margin

Velocity through fin channels:
• Channel area: 72 channels × 1.0mm × 25mm = 1800 mm² = 0.0018 m²
• At 12 CFM: v = 0.00566 m³/s / 0.0018 m² = 3.1 m/s
• Reynolds number: Re = 3100 (transitional flow)

Pressure Drop:
• Module only: 15 Pa (at 12 CFM)
• With inlet/outlet losses: 25 Pa
• Rack backplane + filter: 50 Pa additional


RACK-LEVEL AIRFLOW
──────────────────

┌─────────────────────────────────────────────────────────────┐
│                        FAN MODULE                            │
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 │
│    │ FAN │ │ FAN │ │ FAN │ │ FAN │ │ FAN │  5× 200mm fans  │
│    │  1  │ │  2  │ │  3  │ │  4  │ │  5  │  N+1 redundant  │
│    └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘                 │
│       └───────┴───────┴───────┴───────┘                     │
│                        ▲                                     │
│                    HOT AIR                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Row 8:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 7:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 6:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 5:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 4:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 3:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 2:  [EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3][EK3] │
│  Row 1:  [EK3][EK3][EK3][EK3][EK3][EK3]        [ PFC  ]     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                       COLD AIR INLET                         │
│                    (filtered plenum)                         │
│                         ▲                                    │
└─────────────────────────────────────────────────────────────┘

Rack Totals (84 modules):
• Minimum airflow: 84 × 12 CFM = 1008 CFM
• Design airflow: 84 × 15 CFM = 1260 CFM
• Installed capacity: 5 × 400 CFM = 2000 CFM
• Margin: 2000/1260 = 159% (allows N+1 redundancy)


FAN SPECIFICATION
─────────────────
Type: Axial, 200mm diameter
Quantity: 5 per rack (N+1)
Speed: PWM controlled, 500-2000 RPM
Airflow: 400 CFM each @ 50% speed
Static pressure: 150 Pa @ max speed
Noise: <45 dB(A) @ 50% speed
Power: 25W each @ max speed
Bearing: Ball bearing, 70,000 hour MTBF

Recommended models:
• ebm-papst W2G200-HH77-52 (industrial grade)
• Delta AFB2012HH (high static pressure)
• Sanyo Denki 9G2012H (low noise)


THERMAL ZONES
─────────────
Zone E (rows 7-8): Hottest, maximum fan speed
Zone D (rows 5-6): Medium-high
Zone C (rows 3-4): Medium
Zone B (row 2): Medium-low
Zone A (row 1): Coolest, minimum fan speed

Swarm thermal migration: modules in hot zones reduce power,
modules in cool zones increase power → balanced temperatures
```

### 10.4 Thermal Interface Material (TIM)

```
TIM SELECTION FOR EK3
═══════════════════════════════════════════════════════════════

PRIMARY RECOMMENDATION: Bergquist Gap Pad GP5000
─────────────────────────────────────────────────

Properties:
• Thermal conductivity: 5.0 W/m·K
• Thickness: 0.25 mm (compressed at 25 psi)
• Operating temperature: -40°C to +200°C
• Hardness: Shore 00 = 27
• Dielectric strength: >10 kV/mm
• Color: Gray

Performance:
• Rth at contact area (10×10mm): 0.05 K·cm²/W
• Rth for C3M0065090D footprint (TO-247): 0.15 K/W
• Compressibility: 15% at 25 psi

Application:
• Pre-cut pads for each MOSFET
• No grease mess, consistent bond line
• Reusable during module rework (2-3 times)

Cost: €0.50 per pad, €2.00 per module (4 MOSFETs)


ALTERNATIVE: Honeywell PTM7958 (Phase Change)
─────────────────────────────────────────────
• Thermal conductivity: 4.7 W/m·K
• Phase change temperature: 55°C
• Self-healing on thermal cycles
• Better for long-term reliability
• Cost: €0.80 per application


APPLICATION PROCEDURE
─────────────────────
1. Clean heatsink surface with IPA
2. Verify flatness (±0.05mm)
3. Apply TIM pad (pre-cut to size)
4. Mount MOSFET with 0.5 N·m torque
5. Verify contact (thermal imaging after 1 min power)

QUALITY CONTROL
───────────────
• Visual inspection: No air bubbles, full coverage
• Thermal test: Tj rise within ±5°C of specification
• Periodic check: Every 10,000 hours or during maintenance


TIM COMPARISON TABLE
────────────────────────────────────────────────────────────
Material          k (W/mK)  Rth (K/W)  Cost   Rework  MTBF
────────────────────────────────────────────────────────────
Gap Pad GP5000      5.0       0.15     €2.00   Yes    50kh
PTM7958 (PCM)       4.7       0.16     €3.20   No     100kh
Thermal grease      8.0       0.10     €0.50   No     20kh*
Graphite sheet     15.0       0.08     €1.50   Yes    100kh
────────────────────────────────────────────────────────────
* Grease pump-out degrades performance over time

Recommendation: Gap Pad GP5000 for prototype, PTM7958 for production
```

### 10.5 Derating Curves

```
POWER DERATING SPECIFICATION
═══════════════════════════════════════════════════════════════

AMBIENT TEMPERATURE DERATING
────────────────────────────

                     POWER vs AMBIENT TEMPERATURE

    100% ─┬─────────────────────┬
          │█████████████████████│
     90% ─┤                     ├─────┐
          │                           │
     80% ─┤                           ├────────┐
          │                                     │
     70% ─┤                                     ├───────┐
          │                                             │
     55% ─┤                                             ├──┐
          │                                                │
      0% ─┴────┬────┬────┬────┬────┬────┬────┬────┬────┬──┴─►
              25   30   35   40   45   50   55   60   65
                           Ambient Temperature (°C)

Derating Table:
┌─────────────┬───────────┬──────────┬────────────────────┐
│ Tambient    │ Max Power │ % Rated  │ Action             │
├─────────────┼───────────┼──────────┼────────────────────┤
│ ≤35°C       │ 3.3 kW    │ 100%     │ Normal operation   │
│ 40°C        │ 3.0 kW    │ 91%      │ Increase fan speed │
│ 45°C        │ 2.7 kW    │ 82%      │ Warning logged     │
│ 50°C        │ 2.3 kW    │ 70%      │ Alert operator     │
│ 55°C        │ 1.8 kW    │ 55%      │ Reduce charging    │
│ ≥60°C       │ 0 kW      │ 0%       │ Safe shutdown      │
└─────────────┴───────────┴──────────┴────────────────────┘


ALTITUDE DERATING
─────────────────
Air density decreases with altitude → reduced cooling capacity

┌─────────────┬───────────┬──────────┬────────────────────┐
│ Altitude    │ Max Power │ % Rated  │ Notes              │
├─────────────┼───────────┼──────────┼────────────────────┤
│ 0-1000m     │ 3.3 kW    │ 100%     │ Sea level normal   │
│ 1000-2000m  │ 3.1 kW    │ 95%      │ ~90% air density   │
│ 2000-3000m  │ 2.8 kW    │ 85%      │ ~80% air density   │
│ >3000m      │ Contact   │ TBD      │ Special config     │
└─────────────┴───────────┴──────────┴────────────────────┘


COMBINED DERATING
─────────────────
For installations with both high ambient and altitude:

Effective_Power = Rated_Power × Temp_Factor × Altitude_Factor

Example: 45°C ambient at 2000m altitude
• Temp factor: 0.82
• Altitude factor: 0.85
• Effective power: 3.3 kW × 0.82 × 0.85 = 2.3 kW


LOW TEMPERATURE OPERATION
─────────────────────────
┌─────────────┬────────────────────────────────────────────┐
│ Temperature │ Action                                     │
├─────────────┼────────────────────────────────────────────┤
│ ≥0°C        │ Normal operation                           │
│ -10°C to 0°C│ Pre-heat mode: 10% power for 60s          │
│ -20°C to-10°│ Extended pre-heat: 5% power for 120s      │
│ <-20°C      │ Do not start (component damage risk)      │
└─────────────┴────────────────────────────────────────────┘

Pre-heat sequence:
1. Enable fans at minimum speed
2. Apply 5-10% rated power (internal heating)
3. Monitor heatsink NTC temperature
4. When T > 0°C, ramp to full power over 30s
```

---

## 11. Thermal Simulation Methodology

### 11.1 FEA Thermal Analysis

```
FINITE ELEMENT ANALYSIS (FEA) WORKFLOW
═══════════════════════════════════════════════════════════════

PURPOSE
───────
• Predict temperature distribution in EK3 module
• Verify thermal resistance calculations
• Identify hot spots before prototyping
• Optimize heatsink geometry

RECOMMENDED TOOLS
─────────────────
Commercial:
• ANSYS Mechanical (industry standard)
• Siemens Simcenter (Flotherm Pack)
• COMSOL Multiphysics (coupled physics)

Cloud/Free:
• SimScale (browser-based, free tier available)
• OpenFOAM + Elmer (open source)
• FEMM (2D, free)


GEOMETRY PREPARATION
────────────────────

CAD Import:
• Format: STEP or IGES (preferred)
• Simplify features < 1mm (fillets, chamfers)
• Remove cosmetic details (logos, text)
• Keep thermal-critical geometry (fins, mounting)

Model Components:
┌─────────────────────────────────────────────────────────────┐
│ Component          │ Include │ Simplification              │
├────────────────────┼─────────┼─────────────────────────────┤
│ Heatsink           │ Yes     │ Full geometry with fins     │
│ TIM pads           │ Yes     │ As thin solids (0.25mm)     │
│ MOSFET packages    │ Yes     │ Simplified TO-247 block     │
│ PCB                │ Yes     │ Layered or homogeneous      │
│ Transformer        │ Yes     │ Block with internal heat    │
│ Enclosure          │ Optional│ For radiation if included   │
│ Connectors         │ No      │ Replace with boundary cond  │
└─────────────────────────────────────────────────────────────┘


MESH GENERATION
───────────────

Element Types:
• 3D Solid: SOLID187 (tetrahedral, 10-node)
• Or: SOLID186 (hexahedral, 20-node) for regular shapes

Mesh Sizing:
┌─────────────────────────────────────────────────────────────┐
│ Region              │ Element Size │ Notes                  │
├─────────────────────┼──────────────┼────────────────────────┤
│ MOSFET die area     │ 0.2 mm       │ Highest resolution     │
│ TIM interface       │ 0.3 mm       │ Capture gradient       │
│ Heatsink base       │ 0.5 mm       │ Near MOSFETs           │
│ Heatsink fins       │ 1.0 mm       │ Along fin height       │
│ PCB                 │ 1.0 mm       │ Uniform                │
│ Far field           │ 2.0 mm       │ Low gradient regions   │
└─────────────────────────────────────────────────────────────┘

Mesh Quality Targets:
• Jacobian ratio: > 0.3
• Aspect ratio: < 20:1
• Skewness: < 0.8
• Total elements: 500K - 1M (typical for EK3)

Mesh Refinement:
• Inflation layers at TIM interfaces (5 layers)
• Edge sizing along fin roots
• Adaptive refinement on temperature gradients


MATERIAL PROPERTIES
───────────────────

┌─────────────────────────────────────────────────────────────┐
│ Material           │ k (W/m·K) │ ρ (kg/m³) │ Cp (J/kg·K)  │
├────────────────────┼───────────┼───────────┼──────────────┤
│ Al 6063-T5         │ 200       │ 2700      │ 900          │
│ Copper (Cu)        │ 390       │ 8960      │ 385          │
│ Silicon (Si)       │ 130       │ 2330      │ 700          │
│ SiC (MOSFET die)   │ 370       │ 3210      │ 690          │
│ FR4 (PCB)          │ 0.3       │ 1850      │ 1100         │
│ TIM (Gap Pad)      │ 5.0       │ 3000      │ 1000         │
│ Solder (SAC305)    │ 60        │ 7400      │ 220          │
│ Air (25°C)         │ 0.026     │ 1.18      │ 1005         │
└─────────────────────────────────────────────────────────────┘


BOUNDARY CONDITIONS
───────────────────

Heat Sources:
• MOSFET junction: 10W each (40W total, volumetric heat)
• Transformer: 35W (distributed in core + windings)
• Rectifier: 25W (on secondary heatsink area)
• Inductor: 15W (core + winding)
• PCB losses: 10W (distributed)

Convection:
• Heatsink fins: h = 50 W/m²K @ 2.5 m/s (from empirical correlation)
• Enclosure exterior: h = 10 W/m²K (natural convection)
• PCB surface: h = 15 W/m²K (internal air)

Radiation (if included):
• Heatsink surface: ε = 0.85 (anodized black)
• PCB: ε = 0.90 (solder mask)
• Enclosure: ε = 0.20 (bare aluminum) or 0.85 (painted)

Fixed Temperature (alternative):
• Bottom enclosure: T = 45°C (from rack CFD)


SOLUTION SETTINGS
─────────────────

Analysis Type: Steady-State Thermal

Solver:
• Direct solver (SPARSE) for <500K nodes
• Iterative solver (PCG) for >500K nodes

Convergence Criteria:
• Temperature: 0.01°C change between iterations
• Heat balance: <0.1% error

Post-processing:
• Temperature contour plots
• Heat flux vectors
• Path plots (junction to ambient)
• Thermal resistance extraction


EXPECTED RESULTS
────────────────

For EK3 at rated power (3.3 kW, 45°C ambient):

┌─────────────────────────────────────────────────────────────┐
│ Location              │ Expected Temp │ Limit    │ Margin  │
├───────────────────────┼───────────────┼──────────┼─────────┤
│ MOSFET junction       │ 85-95°C       │ 150°C    │ 55°C    │
│ Heatsink base         │ 65-75°C       │ 125°C    │ 50°C    │
│ Heatsink fin tips     │ 55-60°C       │ N/A      │ N/A     │
│ Transformer hot spot  │ 90-100°C      │ 130°C    │ 30°C    │
│ PCB max               │ 80-90°C       │ 105°C    │ 15°C    │
│ Capacitor case        │ 60-70°C       │ 105°C    │ 35°C    │
└─────────────────────────────────────────────────────────────┘
```

### 11.2 CFD Airflow Analysis

```
COMPUTATIONAL FLUID DYNAMICS (CFD) WORKFLOW
═══════════════════════════════════════════════════════════════

PURPOSE
───────
• Predict airflow distribution through module
• Calculate pressure drop
• Identify flow recirculation zones
• Optimize inlet/outlet design

RECOMMENDED TOOLS
─────────────────
Commercial:
• ANSYS Fluent / CFX
• Siemens FloTHERM / FloVENT
• Mentor FloEFD (embedded in CAD)

Open Source:
• OpenFOAM (industry-proven, steep learning curve)
• SimScale (OpenFOAM-based, web interface)


DOMAIN SETUP
────────────

Module-Level Domain:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    INLET                    MODULE                   OUTLET │
│   ──────►  ┌─────────────────────────────────┐  ──────►    │
│            │                                 │              │
│            │     HEATSINK WITH FINS          │              │
│   2.5 m/s  │     ═══════════════════         │   Pressure  │
│   uniform  │     │ │ │ │ │ │ │ │ │         │   outlet    │
│            │                                 │   0 Pa      │
│            │         PCB + COMPONENTS        │              │
│            │                                 │              │
│   ──────►  └─────────────────────────────────┘  ──────►    │
│                                                             │
│    Extension: 50mm        280mm            Extension: 100mm│
└─────────────────────────────────────────────────────────────┘


MESH SPECIFICATIONS
───────────────────

Cell Types:
• Structured hex mesh in fin channels (preferred)
• Polyhedral or tet mesh in complex regions
• Prism layers on walls for boundary layer

Mesh Requirements:
┌─────────────────────────────────────────────────────────────┐
│ Region              │ Cell Size │ y+ Target │ Notes        │
├─────────────────────┼───────────┼───────────┼──────────────┤
│ Fin channels        │ 0.2 mm    │ < 1       │ Resolve BL   │
│ Inlet/outlet        │ 2.0 mm    │ N/A       │ Uniform flow │
│ Near walls          │ 0.1 mm    │ < 1       │ Inflation    │
│ Far field           │ 5.0 mm    │ N/A       │ Low gradient │
└─────────────────────────────────────────────────────────────┘

Inflation Layers:
• First layer height: 0.05 mm
• Growth rate: 1.2
• Number of layers: 15
• Total height: ~2.5 mm

Total Cell Count: 2-5 million (typical for EK3)


PHYSICS MODELS
──────────────

Turbulence Model: SST k-ω (recommended for internal flows)
• Captures boundary layer transition
• Good for separated flows
• Wall functions: y+ < 1 (low-Re formulation)

Alternative: Realizable k-ε (faster, less accurate near walls)

Heat Transfer:
• Conjugate heat transfer (CHT) - recommended
• Or: specified heat flux on walls (simpler)

Buoyancy:
• Include if ΔT > 30K (Boussinesq approximation)
• May affect flow pattern at low velocities

Radiation:
• Neglect for forced convection (< 5% of total heat transfer)


BOUNDARY CONDITIONS
───────────────────

Inlet:
• Type: Velocity inlet
• Velocity: 2.5 m/s (uniform)
• Temperature: 35°C (or 45°C for worst case)
• Turbulence intensity: 5%
• Turbulent viscosity ratio: 10

Outlet:
• Type: Pressure outlet
• Gauge pressure: 0 Pa
• Backflow temperature: 45°C

Walls:
• Heatsink fins: Coupled (CHT) or fixed heat flux
• Other walls: Adiabatic (no heat transfer)

Heat Sources (for CHT):
• MOSFET zones: 40W total (volumetric)
• Transformer zone: 35W
• Other components as needed


SOLVER SETTINGS
───────────────

Algorithm: SIMPLE or SIMPLEC (pressure-velocity coupling)

Discretization:
• Pressure: Standard or PRESTO
• Momentum: Second-order upwind
• Energy: Second-order upwind
• Turbulence: First-order upwind (initial), then second-order

Under-relaxation:
• Pressure: 0.3
• Momentum: 0.7
• Energy: 0.9

Convergence Criteria:
• Residuals: < 1e-4 (continuity), < 1e-6 (energy)
• Monitor: Outlet temperature, pressure drop
• Stability: 500-2000 iterations typical


EXPECTED RESULTS
────────────────

Flow Results:
• Pressure drop (inlet to outlet): 15-25 Pa
• Velocity in channels: 3-4 m/s
• Flow uniformity: >80% of channels within ±10%

Temperature Results:
• Air temperature rise: 10-15°C (inlet to outlet)
• Heat transfer coefficient: 40-60 W/m²K (fin surfaces)
• Hot spot identification: Typically center fins
```

### 11.3 Validation Protocol

```
THERMAL VALIDATION TEST PROCEDURE
═══════════════════════════════════════════════════════════════

PURPOSE
───────
• Verify simulation predictions
• Characterize thermal performance
• Establish production test limits
• Support warranty claims

EQUIPMENT
─────────

Thermal Chamber:
• Brand: Espec, Thermotron, or equivalent
• Range: -40°C to +85°C
• Stability: ±0.5°C
• Ramp rate: 5°C/min minimum

Temperature Measurement:
• Thermocouples: Type-K, 0.5mm diameter, ±0.5°C accuracy
• Data logger: Keysight 34970A or equivalent, 1 Hz sampling
• IR Camera: FLIR E8-XT or equivalent (optional, for thermal maps)
• TSEP: Vds,on measurement via oscilloscope

Power Supply:
• Programmable DC supply matching module input spec
• Current measurement: ±0.5% accuracy
• Voltage measurement: ±0.1% accuracy

Airflow:
• Calibrated fan or wind tunnel
• Anemometer: 0.1-10 m/s range, ±2% accuracy


THERMOCOUPLE PLACEMENT
──────────────────────

        HEATSINK TOP VIEW
        ┌───────────────────────────────────────┐
        │                                       │
        │   TC1 ●     TC2 ●     TC3 ●          │  TC1-3: Fin tips
        │                                       │
        │   ┌───┐     ┌───┐                    │
        │   │M1 │     │M2 │     TC4 ●          │  TC4: Base center
        │   └───┘     └───┘                    │
        │                                       │
        │   ┌───┐     ┌───┐                    │
        │   │M3 │     │M4 │                    │  M1-4: MOSFETs
        │   └───┘     └───┘                    │
        │                                       │
        │              TC5 ●                    │  TC5: Base edge
        │                                       │
        │   ─────────►  AIRFLOW  ─────────►    │
        └───────────────────────────────────────┘

Additional Points:
• TC6: Inlet air (10mm upstream)
• TC7: Outlet air (10mm downstream)
• TC8: Transformer case
• TC9: Capacitor case
• TC10: PCB hot spot (near MOSFETs)


TEST MATRIX
───────────

┌───────┬────────────┬────────────┬─────────────┬─────────────┐
│ Test  │ Power      │ Ambient    │ Airflow     │ Duration    │
├───────┼────────────┼────────────┼─────────────┼─────────────┤
│ T1    │ 25% (825W) │ 25°C       │ 2.5 m/s     │ 30 min      │
│ T2    │ 50% (1.65kW)│ 25°C      │ 2.5 m/s     │ 30 min      │
│ T3    │ 75% (2.5kW)│ 25°C       │ 2.5 m/s     │ 30 min      │
│ T4    │ 100% (3.3kW)│ 25°C      │ 2.5 m/s     │ 60 min      │
├───────┼────────────┼────────────┼─────────────┼─────────────┤
│ T5    │ 100%       │ 35°C       │ 2.5 m/s     │ 60 min      │
│ T6    │ 100%       │ 45°C       │ 2.5 m/s     │ 60 min      │
├───────┼────────────┼────────────┼─────────────┼─────────────┤
│ T7    │ 100%       │ 35°C       │ 1.5 m/s     │ 60 min      │
│ T8    │ 100%       │ 35°C       │ 2.0 m/s     │ 60 min      │
│ T9    │ 100%       │ 35°C       │ 3.0 m/s     │ 60 min      │
├───────┼────────────┼────────────┼─────────────┼─────────────┤
│ T10   │ Step (0-100%)│ 25°C     │ 2.5 m/s     │ Transient   │
└───────┴────────────┴────────────┴─────────────┴─────────────┘


ACCEPTANCE CRITERIA
───────────────────

Pass/Fail Limits:
┌───────────────────────────────────────────────────────────────┐
│ Parameter              │ Limit         │ Test Condition       │
├────────────────────────┼───────────────┼──────────────────────┤
│ Tj (junction)          │ < 125°C       │ T4 (100%, 25°C)      │
│ Tj (junction)          │ < 140°C       │ T6 (100%, 45°C)      │
│ Theatsink_base         │ < 100°C       │ T6 (100%, 45°C)      │
│ ΔT (outlet-inlet)      │ < 20°C        │ T4 (100%, 25°C)      │
│ Rth,j-a (measured)     │ 1.20 ±0.15 K/W│ T4 (calculated)      │
│ Thermal time constant  │ < 300s        │ T10 (transient)      │
└───────────────────────────────────────────────────────────────┘

Simulation Correlation:
• Temperature: Simulation vs. test within ±5°C
• Thermal resistance: Within ±10% of calculated
• Transient: Time constant within ±15%


DATA RECORDING
──────────────

Log Format (CSV):
Timestamp, TC1, TC2, TC3, TC4, TC5, TC6, TC7, TC8, TC9, TC10,
Voltage_in, Current_in, Power_in, Voltage_out, Current_out, Power_out

Sample Rate: 1 Hz continuous
Thermal equilibrium: dT/dt < 0.1°C/min for 5 minutes


REPORT CONTENTS
───────────────

1. Test conditions (ambient, airflow, power levels)
2. Time-temperature plots for all thermocouples
3. Steady-state temperature summary table
4. Thermal resistance calculations
5. Comparison with simulation (if available)
6. Pass/fail determination
7. Photos of thermocouple placement
8. Equipment calibration certificates
```

### 11.4 Sensitivity Analysis

```
THERMAL SENSITIVITY ANALYSIS
═══════════════════════════════════════════════════════════════

PURPOSE
───────
• Identify critical parameters affecting Tj
• Guide design optimization
• Establish manufacturing tolerances
• Prioritize quality control

METHODOLOGY
───────────

Design of Experiments (DOE):
• Full factorial or fractional factorial
• Parameters varied ±20% from baseline
• Response: Maximum junction temperature (Tj)


PARAMETER SENSITIVITY MATRIX
────────────────────────────

┌─────────────────────────────────────────────────────────────────────────┐
│ Parameter          │ Baseline │ Range      │ ΔTj Impact │ Sensitivity │
├────────────────────┼──────────┼────────────┼────────────┼─────────────┤
│ TIM conductivity   │ 5.0 W/mK │ 3.0-8.0    │ ±8°C       │ MEDIUM      │
│ TIM thickness      │ 0.25mm   │ 0.1-0.5    │ ±12°C      │ HIGH        │
│ Airflow velocity   │ 2.5 m/s  │ 1.5-3.5    │ ±15°C      │ HIGH        │
│ Fin pitch          │ 2.5mm    │ 2.0-3.5    │ ±6°C       │ LOW         │
│ Fin height         │ 25mm     │ 20-30      │ ±4°C       │ LOW         │
│ Base thickness     │ 8mm      │ 6-10       │ ±3°C       │ LOW         │
│ Ambient temp       │ 35°C     │ 25-55      │ ±20°C      │ VERY HIGH   │
│ Power dissipation  │ 140W     │ 100-180    │ ±12°C      │ HIGH        │
│ Contact pressure   │ 25 psi   │ 15-35      │ ±5°C       │ MEDIUM      │
│ Mounting flatness  │ 0.05mm   │ 0.02-0.10  │ ±8°C       │ MEDIUM      │
└─────────────────────────────────────────────────────────────────────────┘


SENSITIVITY RANKING (Pareto)
────────────────────────────

    Impact on Tj (°C change per 10% parameter change)

    Ambient temp       ████████████████████  +6.7°C
    Airflow velocity   ███████████████       +5.0°C
    TIM thickness      ████████████          +4.0°C
    Power dissipation  ████████████          +4.0°C
    TIM conductivity   ████████              +2.7°C
    Mounting flatness  ████████              +2.7°C
    Contact pressure   █████                 +1.7°C
    Fin pitch          █████                 +1.7°C
    Fin height         ████                  +1.3°C
    Base thickness     ███                   +1.0°C


CRITICAL PARAMETERS (>10°C impact)
──────────────────────────────────

1. AMBIENT TEMPERATURE
   • Impact: ±20°C across operating range
   • Control: Installation environment spec
   • Mitigation: Derating curve implementation

2. AIRFLOW VELOCITY
   • Impact: ±15°C for ±40% variation
   • Control: Fan reliability, filter maintenance
   • Mitigation: Redundant fans, airflow monitoring

3. TIM THICKNESS
   • Impact: ±12°C for 0.1-0.5mm range
   • Control: Pre-cut pads, assembly procedure
   • Mitigation: Consistent torque, QC inspection

4. POWER DISSIPATION
   • Impact: ±12°C for ±30% load variation
   • Control: Efficiency optimization
   • Mitigation: Thermal throttling algorithm


MANUFACTURING TOLERANCES
────────────────────────

Based on sensitivity analysis, recommended tolerances:

┌─────────────────────────────────────────────────────────────────────────┐
│ Parameter          │ Nominal  │ Tolerance  │ Impact     │ QC Method    │
├────────────────────┼──────────┼────────────┼────────────┼──────────────┤
│ TIM thickness      │ 0.25mm   │ ±0.05mm    │ ±2.4°C     │ Incoming QC  │
│ Heatsink flatness  │ 0.05mm   │ ±0.02mm    │ ±3.2°C     │ 100% inspect │
│ Mounting torque    │ 0.5 N·m  │ ±10%       │ ±2°C       │ Torque wrench│
│ Fan airflow        │ 12 CFM   │ ±10%       │ ±3°C       │ Sample test  │
└─────────────────────────────────────────────────────────────────────────┘


DESIGN MARGIN ANALYSIS
──────────────────────

Worst Case Stack-up:
• Baseline Tj (nominal): 85°C
• TIM tolerance: +2.4°C
• Flatness tolerance: +3.2°C
• Torque tolerance: +2°C
• Airflow tolerance: +3°C
• Total worst case: 85 + 10.6 = 95.6°C

Margin to Limit:
• Limit: 125°C
• Worst case: 95.6°C
• Margin: 29.4°C ✓

Conclusion: Design is robust against manufacturing variations
```

---

## 12. V2G Mode Thermal Considerations

### 12.1 Charging vs Discharging Thermal Profile

```
V2G THERMAL PROFILE COMPARISON
═══════════════════════════════════════════════════════════════

During normal charging, the power profile follows CC-CV with natural
pauses for battery balancing. V2G discharge is typically continuous,
creating different thermal stress patterns.

                     CHARGING PROFILE (CC-CV)
    Tj (°C)
       │
   115 │           ┌──────┐
       │          /        \       ← CV phase (declining current)
   105 │     ┌───┘          └──┐
       │    /                   \     ← Balancing pauses
    95 │───┘                     └───
       │
    85 │  CC phase (constant current)
       │
       └──────────────────────────────────────────────► t (min)
         0    15    30    45    60    75    90   105


                     V2G DISCHARGE PROFILE
    Tj (°C)
       │
   125 │                    ┌─────────────────────────
       │                   /
   115 │              ┌───┘   ← Continuous discharge (no pauses)
       │             /
   105 │        ┌───┘
       │       /
    95 │  ┌───┘
       │ /
    85 │┘
       └──────────────────────────────────────────────► t (min)
         0    15    30    45    60    75    90   105


KEY DIFFERENCES
───────────────

┌─────────────────────────────────────────────────────────────────────┐
│ Parameter              │ Charging          │ V2G Discharge          │
├────────────────────────┼───────────────────┼────────────────────────┤
│ Duration               │ 30-120 min        │ 5-60 min (events)      │
│ Power profile          │ CC→CV (declining) │ Constant or step       │
│ Natural pauses         │ Yes (balancing)   │ No                     │
│ Thermal cycling        │ Moderate          │ More frequent          │
│ Peak Tj                │ Mid-cycle         │ End of event           │
│ Cooldown opportunity   │ CV phase          │ None during event      │
│ Efficiency             │ ~96%              │ ~95% (reverse losses)  │
│ Primary heat source    │ Rectifier diodes  │ Active switches (PWM)  │
└─────────────────────────────────────────────────────────────────────┘

THERMAL BUDGET IMPACT
─────────────────────

V2G at 3.3 kW discharge:
• Power loss: 3.3 kW × (1/0.95 - 1) = 174W (vs 138W charging)
• Additional 36W from:
  - Higher switching losses (active PWM vs passive rectification)
  - Reverse current flow (different MOSFET operating point)
  - Continuous operation without natural pauses

Component-level heat distribution (V2G mode):
• Primary-side MOSFETs: 45W (vs 35W charging) ← Now PWM controlled
• Secondary-side MOSFETs: 50W (vs 40W charging) ← Active drive
• Transformer: 40W (same, bidirectional)
• Control + misc: 39W (same)
```

### 12.2 V2G Thermal Stress Analysis

```
THERMAL CYCLING STRESS
═══════════════════════════════════════════════════════════════

V2G events create additional thermal cycles compared to charge-only:

                    TEMPERATURE CYCLING PATTERN

    Tj (°C)
       │
   115 │      ┌─┐         ┌─┐         ┌─┐
       │     /   \       /   \       /   \    ← V2G events
   105 │    /     \     /     \     /     \
       │   /       \   /       \   /       \
    95 │  /         \ /         \ /         \
       │ /           X           X           \
    85 │/           / \         / \           \
       │───────────/───\───────/───\───────────\─────
    75 │          │     │     │     │          │
       └──────────┴─────┴─────┴─────┴──────────┴────► t (hr)
              Charge  V2G  Charge V2G  Charge  V2G

Thermal cycle impact on reliability:
• ΔTj = 30°C typical during V2G transition
• Additional cycles: 2-10 per day (grid event dependent)
• Solder joint fatigue: Accelerates with ΔT³

Coffin-Manson Fatigue Estimation:
    Nf = C × (ΔT)^(-n)

Where:
    Nf = cycles to failure
    C = material constant (~10^9 for SAC305)
    n = fatigue exponent (~2.5 for solder)
    ΔT = temperature swing

Example:
• ΔT = 30°C: Nf ≈ 10^9 / 30^2.5 ≈ 2×10^5 cycles
• At 5 cycles/day: 110 years lifetime ✓

Conclusion: V2G thermal cycling within acceptable limits


CONTINUOUS DISCHARGE THERMAL ANALYSIS
──────────────────────────────────────

Extended V2G event (60 minutes at full power):

Time-Temperature Response:
• Thermal time constant (τ) = 180 seconds
• Steady-state reached after 5τ = 15 minutes
• ΔTj_ss = Ptotal × Rth,j-a = 174W × 1.2 K/W = 209°C rise (!)

Wait - this needs thermal management intervention:

With active cooling (liquid or forced air):
• Effective Rth,j-a = 0.5 K/W (improved)
• ΔTj_ss = 174W × 0.5 = 87°C rise
• At Ta = 35°C: Tj_ss = 122°C ✓ (below 150°C limit)

Transient Response:
    Tj(t) = Ta + ΔTj_ss × (1 - e^(-t/τ))

At t = 5 min (300s): Tj = 35 + 87 × (1 - e^(-300/180)) = 35 + 71 = 106°C
At t = 15 min:       Tj = 35 + 87 × (1 - e^(-900/180)) = 35 + 87 = 122°C
```

### 12.3 V2G Derating Strategy

```
V2G POWER DERATING
═══════════════════════════════════════════════════════════════

V2G mode requires more aggressive derating due to:
1. Higher losses (continuous active switching)
2. No natural cooling pauses
3. Possibly preceded by charging (pre-heated state)


V2G DERATING CURVE (vs CHARGING)
────────────────────────────────

    P/Pn (%)
       │
   100 │────────────────┬
       │                 \
    90 │                  \  ← Charging (standard derating)
       │                   \
    80 │─────────────────\──\
       │                  \  \
    70 │                   \  \  ← V2G (stricter derating)
       │                    \  \
    60 │                     \  \
       │                      \  \
    50 │                       \──\
       │                          \
    40 │                           \
       │
       └──────┬────┬────┬────┬────┬────┬──► Tj (°C)
             100  105  110  115  120  125


V2G DERATING TABLE
──────────────────

┌─────────────┬────────────────────────┬────────────────────────┐
│ Tj (°C)     │ Charging Pmax          │ V2G Pmax               │
├─────────────┼────────────────────────┼────────────────────────┤
│ ≤100        │ 100% (3.3 kW)          │ 100% (3.3 kW)          │
│ 105         │ 100%                   │ 90% (3.0 kW)           │
│ 110         │ 95% (3.1 kW)           │ 80% (2.6 kW)           │
│ 115         │ 85% (2.8 kW)           │ 65% (2.1 kW)           │
│ 120         │ 70% (2.3 kW)           │ 50% (1.65 kW)          │
│ 125         │ 50% (1.65 kW)          │ 30% (1.0 kW)           │
│ ≥130        │ 25% (0.83 kW)          │ 0% (shutdown)          │
└─────────────┴────────────────────────┴────────────────────────┘


IMPLEMENTATION PSEUDOCODE
─────────────────────────

float V2G_ThermalDerating(float Tj, float Pn, bool is_v2g_mode) {
    float P_max;

    if (is_v2g_mode) {
        // Stricter V2G derating
        if (Tj <= 100.0f) {
            P_max = Pn;
        } else if (Tj <= 105.0f) {
            P_max = Pn * (1.0f - 0.02f * (Tj - 100.0f));  // -10% per 5°C
        } else if (Tj <= 120.0f) {
            P_max = 0.90f * Pn * (1.0f - 0.027f * (Tj - 105.0f));
        } else if (Tj <= 130.0f) {
            P_max = 0.50f * Pn * (1.0f - 0.05f * (Tj - 120.0f));
        } else {
            P_max = 0.0f;  // V2G shutdown above 130°C
        }
    } else {
        // Standard charging derating
        if (Tj <= 105.0f) {
            P_max = Pn;
        } else if (Tj <= 130.0f) {
            P_max = Pn * (1.0f - 0.02f * (Tj - 105.0f));
        } else {
            P_max = 0.25f * Pn;  // Minimum charging
        }
    }

    return P_max;
}


V2G PRE-CONDITIONING
────────────────────

Before accepting V2G request, check thermal headroom:

bool V2G_ThermalPreCheck(ThermalState* state, float P_v2g_request) {
    // Predict Tj after sustained V2G
    float Tj_predicted = state->Tj_current +
                         (P_v2g_request / P_NOMINAL) *
                         (TJ_V2G_RISE - (state->Tj_current - state->Ta));

    // Check headroom
    if (Tj_predicted > TJ_V2G_MAX) {
        // Can we offer reduced power?
        float P_available = V2G_ThermalDerating(state->Tj_current, P_NOMINAL, true);

        if (P_available >= P_v2g_request * 0.5f) {
            // Offer reduced capacity
            state->P_v2g_available = P_available;
            return true;
        } else {
            // Reject V2G request
            return false;
        }
    }

    state->P_v2g_available = P_v2g_request;
    return true;
}
```

### 12.4 V2G Cooling Enhancement

```
ENHANCED COOLING FOR V2G OPERATION
═══════════════════════════════════════════════════════════════

V2G mode may trigger enhanced cooling strategies:


FAN SPEED BOOST (FORCED AIR)
────────────────────────────

Normal operation: Fan speed based on Tj
V2G mode: Proactive fan speed increase

┌─────────────────────────────────────────────────────────────┐
│ Mode      │ Tj Threshold │ Fan Speed  │ Notes              │
├───────────┼──────────────┼────────────┼────────────────────┤
│ Charging  │ Tj < 90°C    │ 30-50%     │ Low noise priority │
│ Charging  │ Tj 90-110°C  │ 50-80%     │ Standard cooling   │
│ Charging  │ Tj > 110°C   │ 80-100%    │ Maximum cooling    │
├───────────┼──────────────┼────────────┼────────────────────┤
│ V2G start │ Any          │ +20%       │ Proactive boost    │
│ V2G       │ Tj < 90°C    │ 50-70%     │ Pre-emptive        │
│ V2G       │ Tj 90-100°C  │ 70-90%     │ Active cooling     │
│ V2G       │ Tj > 100°C   │ 100%       │ Maximum + derating │
└─────────────────────────────────────────────────────────────┘


PUMP SPEED BOOST (LIQUID COOLING)
─────────────────────────────────

For liquid-cooled systems:

V2G Detection:
• ISO 15118-20 BPT session initiated
• Or: Power flow direction reversed

Response:
• Increase pump speed by 30% (improves h by ~20%)
• Pre-cool: If Tj > 80°C before V2G, delay start 30s
• Maintain elevated cooling for 5 min after V2G ends


SWARM THERMAL REDISTRIBUTION
────────────────────────────

In multi-module systems, V2G load can be distributed based on thermal state:

Algorithm:
1. Receive V2G power request from grid
2. Query all modules for thermal headroom:
   - Headroom = TJ_MAX - Tj_current - ΔTj_predicted
3. Allocate V2G power proportional to headroom:
   - P_module_i = P_total × (Headroom_i / Σ Headroom)
4. Modules with Tj > 100°C excluded from V2G

Example (4 modules, 10 kW V2G request):
┌─────────┬───────────┬───────────┬───────────────┬────────────┐
│ Module  │ Tj_current│ Headroom  │ Allocation    │ P_V2G      │
├─────────┼───────────┼───────────┼───────────────┼────────────┤
│ EK3-1   │ 85°C      │ 40°C      │ 40/110 = 36%  │ 3.6 kW     │
│ EK3-2   │ 90°C      │ 35°C      │ 35/110 = 32%  │ 3.2 kW     │
│ EK3-3   │ 95°C      │ 30°C      │ 30/110 = 27%  │ 2.7 kW     │
│ EK3-4   │ 105°C     │ 20°C      │ 5/110 = 5%    │ 0.5 kW     │
├─────────┴───────────┴───────────┴───────────────┼────────────┤
│ TOTAL                                           │ 10.0 kW    │
└─────────────────────────────────────────────────┴────────────┘

Result: Cooler modules absorb more V2G load, balanced thermal stress
```

### 12.5 V2G Thermal Monitoring

```
V2G-SPECIFIC THERMAL MONITORING
═══════════════════════════════════════════════════════════════

Enhanced monitoring during V2G events:


MONITORING PARAMETERS
─────────────────────

┌──────────────────────────────────────────────────────────────────┐
│ Parameter              │ Normal Rate │ V2G Rate  │ Threshold    │
├────────────────────────┼─────────────┼───────────┼──────────────┤
│ Tj (TSEP)              │ 1 Hz        │ 10 Hz     │ 125°C        │
│ dTj/dt                 │ 1 Hz        │ 10 Hz     │ 5°C/s        │
│ Heatsink NTC           │ 1 Hz        │ 5 Hz      │ 100°C        │
│ Power dissipation      │ 1 Hz        │ 5 Hz      │ 200W         │
│ Coolant temp (liquid)  │ 0.1 Hz      │ 1 Hz      │ 55°C         │
│ Airflow (if sensor)    │ 0.1 Hz      │ 1 Hz      │ 80% nominal  │
└──────────────────────────────────────────────────────────────────┘


V2G THERMAL EVENT LOG
─────────────────────

Each V2G event recorded:
• Start time
• Duration
• Peak Tj during event
• ΔTj (start to end)
• Power delivered (kWh)
• Derating applied (if any)
• Post-event cooldown time

Example log entry:
{
    "event_id": 12847,
    "timestamp": "2026-01-15T14:35:22Z",
    "duration_s": 1823,
    "power_kW": 3.1,
    "energy_kWh": 1.57,
    "Tj_start": 82.3,
    "Tj_peak": 118.7,
    "Tj_end": 115.2,
    "derating_applied": false,
    "cooldown_to_90C_s": 245
}


PREDICTIVE THERMAL MANAGEMENT
─────────────────────────────

For scheduled V2G events (ISO 15118-20 SCHEDULED mode):

Timeline Prediction:
1. EVSE receives V2G schedule (e.g., 15:00-16:00, 5 kW)
2. At 14:45 (15 min before):
   - Reduce charging power to 50%
   - Pre-cool module (increase fan/pump)
   - Target: Tj < 80°C at V2G start
3. At 15:00:
   - Begin V2G with full thermal headroom
   - Maximum available power

Pre-Cooling Algorithm:
    Tj_target = Tj_V2G_optimal;  // 75-80°C
    time_to_event = event_start - now;

    if (Tj_current > Tj_target && time_to_event > 600s) {
        // 10+ minutes to cool
        P_charge = P_charge * 0.5;  // Reduce charging
        cooling_boost = true;

        // Estimate cooldown time
        tau = 180;  // Thermal time constant
        Tj_predicted = Tj_current * exp(-time_to_event / tau);

        if (Tj_predicted > Tj_target) {
            // Need more aggressive cooling
            P_charge = 0;  // Stop charging completely
        }
    }
```

---

## References and Sources

- [Boyd Liquid Cold Plates](https://www.boydcorp.com/thermal/liquid-cooling-systems/liquid-cold-plates.html)
- [EV Charger Liquid Cooling Requirements](https://www.evengineeringonline.com/why-high-power-dc-ev-chargers-require-liquid-cooling-systems/)
- [SiC MOSFET Tj Estimation Research](https://www.sciencedirect.com/science/article/abs/pii/S2590116823000164)
- [TSEP Methods for Tj Monitoring](https://www.sciopen.com/article/10.17775/CSEEJPES.2021.04840)
- [Thermal Impedance Modeling](https://www.researchgate.net/publication/388789019_Estimation_of_junction_temperature_of_SiC_MOSFET_based_on_thermal_impedance_modelling)
- [Neural Concept - Cold Plate Optimization](https://www.neuralconcept.com/post/what-is-a-cold-plate-applications-design-optimization)
