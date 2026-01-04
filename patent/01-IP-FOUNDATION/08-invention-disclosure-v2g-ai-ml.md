# Invention Disclosure: AI/ML-Based V2G Fleet Optimization System

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-008 |
| Date of Disclosure | 2026-01-04 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-04 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Nadogradnja V2G kontrolnog sistema (EK-2026-007) sa inteligentnim donošenjem odluka korišćenjem ML algoritama. Ključna inovacija je edge-deployed prediktivno upravljanje koje omogućava proaktivni odziv na mrežne događaje, optimizaciju učešća u demand response programima, i zaštitu zdravlja baterije kroz physics-informed modele degradacije.

---

## 1. Title of Invention

**AI/ML-Based Predictive Optimization System for Vehicle-to-Grid Fleet Operations**

Alternative titles:
- Edge-Deployed Machine Learning for Autonomous V2G Decision Making
- Physics-Informed V2G Optimization with Fleet-Level Aggregation

---

## 2. Technical Field

```
□ Artificial Intelligence / Machine Learning
□ Predictive Grid Analytics
□ Electric Vehicle Fleet Management
□ Demand Response Optimization
□ Battery Health Optimization
```

---

## 3. Problem Statement

### 3.1 Current State of the Art

```
EXISTING V2G DECISION MAKING:

REACTIVE SYSTEMS:
• Wait for grid event (frequency drop)
• Then respond based on current conditions
• No prediction of upcoming events
• Slow ramp-up wastes opportunity

CENTRALIZED CLOUD DECISIONS:
• All optimization in remote servers
• Latency: 100ms - 1s round trip
• Internet dependency for grid services
• Privacy concerns with vehicle data

SIMPLE THRESHOLD RULES:
• "If SoC > 50%, allow V2G"
• No consideration of departure time
• No battery health awareness
• No price optimization
```

### 3.2 Problems with Current Approaches

```
1. MISSED REVENUE OPPORTUNITIES
   • Reactive response loses first 10-20 seconds
   • Peak prices last only minutes
   • Slow response = reduced earnings

2. BATTERY DEGRADATION BLINDNESS
   • V2G cycling accelerates battery wear
   • No consideration of long-term costs
   • Short-term revenue vs long-term damage

3. DEPARTURE TIME CONFLICTS
   • Aggressive V2G leaves SoC too low
   • Vehicle cannot complete next route
   • Fleet operator loses trust in V2G

4. SUBOPTIMAL FLEET ALLOCATION
   • Not all vehicles equally suited for V2G
   • Uniform participation wastes potential
   • Best candidates underutilized
```

---

## 4. Summary of Invention

### 4.1 Core Concept

```
PREDICTIVE V2G OPTIMIZATION:

Multi-layer ML system for intelligent V2G participation:

EDGE LAYER (Per-Module, <100ms):
• Grid frequency prediction
• Anomaly detection
• Local protection decisions

DEPOT LAYER (Per-Station, <1s):
• Fleet aggregation and allocation
• Priority-based V2G distribution
• Real-time coordination

CLOUD LAYER (Fleet-Wide, <10s):
• Demand response optimization
• Price arbitrage strategy
• Battery degradation modeling
• Schedule optimization
```

### 4.2 Key Innovation Elements

```
ELEMENT 1: Predictive Grid Response
─────────────────────────────────────────────────────────────
• ML model predicts grid frequency 1-5 minutes ahead
• Proactive preparation before event occurs
• Pre-position power electronics for rapid response
• Anticipate demand response dispatch

ELEMENT 2: Physics-Informed Battery Protection
─────────────────────────────────────────────────────────────
• Model predicts SoH impact of V2G decisions
• Trade-off: revenue vs degradation cost
• Reject unprofitable V2G requests
• Extend battery life through intelligent limits

ELEMENT 3: Priority-Based Fleet Allocation
─────────────────────────────────────────────────────────────
• Score each vehicle for V2G suitability
• Factors: SoC, departure time, battery health, margin
• Distribute DR request to best candidates
• Protect vehicles with early departures

ELEMENT 4: Edge ML Deployment
─────────────────────────────────────────────────────────────
• ML models run on charging module hardware
• No cloud dependency for real-time decisions
• Privacy-preserving: data stays local
• Works during internet outages
```

---

## 5. Detailed Description

### 5.1 System Architecture

```
ML SYSTEM ARCHITECTURE:
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      CLOUD LAYER                             │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │   TRAINING   │  │ OPTIMIZATION │  │   DIGITAL    │     │
│   │   PIPELINE   │  │    ENGINE    │  │    TWINS     │     │
│   │              │  │              │  │              │     │
│   │ Model updates│  │ DR planning  │  │ Fleet sim    │     │
│   │ Retraining   │  │ Arbitrage    │  │ What-if      │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Model updates (daily)
                           │ Schedules (hourly)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      EDGE LAYER                              │
│                   (Depot Controller)                         │
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  FREQUENCY   │  │    FLEET     │  │   ANOMALY    │     │
│   │  PREDICTION  │  │ AGGREGATOR   │  │  DETECTION   │     │
│   │              │  │              │  │              │     │
│   │ Quantized ML │  │ Priority     │  │ Health       │     │
│   │ <100ms       │  │ allocation   │  │ monitoring   │     │
│   └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Commands (real-time)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     MODULE LAYER                             │
│                                                              │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐           │
│   │  EK3   │  │  EK3   │  │  EK3   │  │  EK3   │  ...      │
│   │ Module │  │ Module │  │ Module │  │ Module │           │
│   │        │  │        │  │        │  │        │           │
│   │ PLL    │  │ PLL    │  │ PLL    │  │ PLL    │           │
│   │ Droop  │  │ Droop  │  │ Droop  │  │ Droop  │           │
│   └────────┘  └────────┘  └────────┘  └────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

DATA FLOW:
• Up: Measurements (frequency, power, temperature)
• Down: Commands (power setpoints, schedules)
• Model updates: Cloud → Edge (periodic)
• Real-time decisions: Edge (autonomous)
```

### 5.2 Grid Frequency Prediction

```
PREDICTIVE FREQUENCY RESPONSE:
═══════════════════════════════════════════════════════════════

CONCEPT:
Instead of reacting to frequency drops after they occur,
predict them and prepare in advance.

INPUT SIGNALS:
• Historical frequency (rolling window)
• Grid load patterns
• Renewable generation forecast
• Time-of-day patterns

PREDICTION HORIZONS:
• 1 second: Immediate stability
• 10 seconds: Ramp initiation
• 60 seconds: Power positioning
• 5 minutes: Capacity reservation

PROACTIVE ACTIONS:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Current     Predicted    Predicted      Action          │
│  Freq        Freq (1min)  Deviation                      │
│                                                          │
│  50.02 Hz    49.85 Hz     -0.17 Hz     PREPARE V2G      │
│                                         Pre-warm power    │
│                                         electronics       │
│                                                          │
│  50.01 Hz    50.05 Hz     +0.04 Hz     PREPARE CHARGE   │
│                                         Ready to absorb   │
│                                         excess            │
│                                                          │
│  49.95 Hz    49.75 Hz     -0.20 Hz     ALERT: Major     │
│                                         event coming      │
│                                         Reserve capacity  │
│                                                          │
└──────────────────────────────────────────────────────────┘

ADVANTAGE:
• 30-60 second head start on competition
• Full power available when event starts
• Higher earnings per event
• Better grid stability contribution
```

### 5.3 Demand Response Optimization

```
FLEET OPTIMIZATION FOR DR EVENTS:
═══════════════════════════════════════════════════════════════

OPTIMIZATION OBJECTIVE:
Maximize revenue while protecting:
• Vehicle availability for scheduled routes
• Battery health and longevity
• Driver/operator confidence

DECISION FRAMEWORK:

For each DR event request:

1. REVENUE CALCULATION
   Revenue = Power × Duration × Price
   Example: 100kW × 2h × €0.15/kWh = €30

2. COST CALCULATION
   a. Battery degradation cost
      - Each kWh cycled has wear cost
      - Depends on temperature, rate, SoC range

   b. Opportunity cost
      - Energy used for V2G must be replaced
      - Replacement may be at higher price

   c. Risk cost
      - Probability of SoC too low at departure
      - Cost of backup charging or route change

3. ALLOCATION STRATEGY

   ┌─────────────────────────────────────────────────────────┐
   │ Vehicle   SoC   Depart   Health   Margin   Priority    │
   │─────────────────────────────────────────────────────────│
   │ BUS-001   85%   8h       98%      +25%     HIGH        │
   │ BUS-002   70%   6h       95%      +15%     MEDIUM      │
   │ BUS-003   60%   4h       92%      +5%      LOW         │
   │ BUS-004   45%   2h       90%      -10%     EXCLUDED    │
   └─────────────────────────────────────────────────────────┘

   Margin = CurrentSoC - RequiredSoC - SafetyBuffer

   Allocation: Highest priority first, until DR fulfilled

4. CONTINUOUS MONITORING
   - Track actual vs predicted SoC
   - Adjust allocation if conditions change
   - Early termination if risk increases
```

### 5.4 Battery Degradation Protection

```
PHYSICS-INFORMED BATTERY MODEL:
═══════════════════════════════════════════════════════════════

DEGRADATION FACTORS:
• Cycle count and depth
• Temperature during operation
• Charge/discharge rate (C-rate)
• Time at high/low SoC

V2G IMPACT ASSESSMENT:

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   V2G Decision: Discharge 20kWh at 50kW over 24 minutes    │
│                                                             │
│   Degradation cost estimate:                                │
│   ├─ Cycle wear: 20kWh × €0.03/kWh = €0.60                 │
│   ├─ Temperature penalty: +€0.05 (hot day)                 │
│   ├─ Rate penalty: 1.5C rate × €0.02 = €0.03               │
│   └─ Total: €0.68                                           │
│                                                             │
│   Revenue from V2G: 20kWh × €0.15 = €3.00                  │
│                                                             │
│   Net benefit: €3.00 - €0.68 = €2.32 ✓ APPROVE             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

REJECTION CRITERIA:
• Net benefit negative: Revenue < Degradation
• Battery health below threshold (e.g., <80% SoH)
• Recent high-stress operation
• Temperature outside safe range

FLEET-LEVEL OPTIMIZATION:
• Route some cycles to healthy batteries
• Rest stressed batteries
• Even out fleet degradation
• Maximize fleet lifetime value
```

### 5.5 Priority-Based Fleet Allocation

```
VEHICLE PRIORITY SCORING:
═══════════════════════════════════════════════════════════════

For each vehicle, calculate priority score (0.0 - 1.0):

FACTOR 1: SoC Margin (30% weight)
├─ High SoC = more energy available
├─ Score = min((SoC - RequiredSoC - 10%) / 30%, 1.0)
└─ Example: SoC 85%, Required 60% → (85-60-10)/30 = 0.50

FACTOR 2: Time to Departure (30% weight)
├─ Late departure = more time to recharge
├─ Score = min(TimeToDepart / 8h, 1.0)
└─ Example: 6h to depart → 6/8 = 0.75

FACTOR 3: Battery Health (20% weight)
├─ Healthy batteries preferred for V2G
├─ Score = (SoH - 80%) / 20%
└─ Example: SoH 95% → (95-80)/20 = 0.75

FACTOR 4: Available Margin (20% weight)
├─ Combined check of constraints
├─ Score = Margin safety factor
└─ Example: Energy margin positive → 1.0

TOTAL PRIORITY:
Priority = 0.3×SoC + 0.3×Time + 0.2×Health + 0.2×Margin

ALLOCATION ALGORITHM:
1. Sort vehicles by priority (descending)
2. Allocate power to highest priority first
3. Respect individual max discharge limits
4. Stop when DR request fulfilled
5. Continuously re-evaluate as conditions change
```

### 5.6 Anomaly Detection

```
EQUIPMENT HEALTH MONITORING:
═══════════════════════════════════════════════════════════════

MONITORED SIGNALS:
• Module power output vs command
• Temperature profiles
• Efficiency metrics
• Communication latency
• Voltage/current waveforms

ANOMALY TYPES:
1. Efficiency drop (degrading components)
2. Temperature anomaly (cooling failure)
3. Power deviation (control issue)
4. Communication dropout (network issue)
5. Unexpected harmonics (semiconductor failure)

DETECTION APPROACH:
• Learn normal operating patterns
• Flag significant deviations
• Correlate across multiple signals
• Distinguish transient vs persistent

ACTIONS ON DETECTION:
┌─────────────────────────────────────────────────────────────┐
│ Severity    Example                   Action                │
│─────────────────────────────────────────────────────────────│
│ WARNING     Efficiency 2% below       Log, monitor          │
│             normal                                          │
│                                                             │
│ ALERT       Temperature 10°C above    Reduce power,         │
│             expected                  schedule service       │
│                                                             │
│ CRITICAL    Overcurrent detected      Isolate module,       │
│                                       trigger hot-swap      │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Edge Deployment Strategy

```
ON-DEVICE ML EXECUTION:
═══════════════════════════════════════════════════════════════

DEPLOYMENT TARGET:
• Edge controller with ML accelerator
• Model optimization for embedded execution
• Real-time inference requirements

MODEL OPTIMIZATION:
• Quantization: Reduced precision (8-bit)
• Pruning: Remove unnecessary weights
• Distillation: Smaller student models
• Compilation: Hardware-optimized execution

PERFORMANCE REQUIREMENTS:
┌─────────────────────────────────────────────────────────────┐
│ Model             Latency    Memory    Update Frequency    │
│─────────────────────────────────────────────────────────────│
│ Frequency Pred    <100ms     <1MB      Weekly              │
│ Anomaly Detect    <50ms      <500KB    Monthly             │
│ Priority Score    <10ms      <100KB    Real-time calc      │
└─────────────────────────────────────────────────────────────┘

FALLBACK BEHAVIOR:
• If ML fails, use rule-based defaults
• Conservative decisions without prediction
• Alert operators of ML unavailability
• Continue safe operation
```

---

## 6. Advantages Over Prior Art

```
ADVANTAGE 1: Predictive vs Reactive Response
─────────────────────────────────────────────────────────────
Prior art: Wait for grid event, then respond
This invention: Predict events, prepare in advance
Improvement: 30-60 second head start, 20%+ more revenue

ADVANTAGE 2: Physics-Informed Battery Protection
─────────────────────────────────────────────────────────────
Prior art: Ignore long-term battery impact
This invention: Model degradation cost, reject bad trades
Improvement: Extended battery life, lower TCO

ADVANTAGE 3: Intelligent Fleet Allocation
─────────────────────────────────────────────────────────────
Prior art: Uniform V2G participation
This invention: Priority-based selection
Improvement: Better fleet utilization, protected departures

ADVANTAGE 4: Edge-Deployed ML
─────────────────────────────────────────────────────────────
Prior art: Cloud-dependent decisions
This invention: On-device ML inference
Improvement: <100ms latency, internet-independent

ADVANTAGE 5: Continuous Optimization
─────────────────────────────────────────────────────────────
Prior art: Static rules or manual scheduling
This invention: Real-time adaptive optimization
Improvement: Responds to changing conditions
```

---

## 7. Known Prior Art

```
RELATED TECHNOLOGIES:
═══════════════════════════════════════════════════════════════

1. SMART GRID FREQUENCY PREDICTION
   - Grid operators use prediction models
   - BUT: Not deployed at charger level
   - BUT: Not for V2G decision making

2. FLEET MANAGEMENT SYSTEMS
   - Route optimization, charging scheduling
   - BUT: No real-time V2G optimization
   - BUT: No battery degradation awareness

3. BATTERY MANAGEMENT SYSTEMS
   - SoH monitoring, cell balancing
   - BUT: No V2G revenue optimization
   - BUT: No fleet-level coordination

4. DEMAND RESPONSE PLATFORMS
   - Aggregation of flexible loads
   - BUT: Simple threshold-based control
   - BUT: No predictive optimization

5. EDGE ML FOR IOT
   - TensorFlow Lite, etc.
   - BUT: Not applied to V2G
   - BUT: Generic, not domain-specific


DIFFERENTIATION:
─────────────────────────────────────────────────────────────
Our combination of:
• Predictive grid frequency response
• Physics-informed battery degradation
• Priority-based fleet allocation
• Edge-deployed ML inference
• Integrated with modular V2G architecture

...appears to be NOVEL
```

---

## 8. Potential Claims (Draft)

```
INDEPENDENT CLAIM 1 (System):
A fleet vehicle-to-grid optimization system comprising:
• A machine learning model for predicting grid frequency
  at multiple time horizons
• A battery degradation model estimating wear costs from
  V2G cycling operations
• A fleet aggregator calculating priority scores for
  each connected vehicle based on SoC, departure time,
  and battery health
• An edge processor executing said ML models with
  latency less than 100 milliseconds
• Wherein V2G participation decisions are made locally
  without requiring cloud connectivity

INDEPENDENT CLAIM 2 (Method):
A method for optimizing vehicle-to-grid fleet operations
comprising:
• Predicting grid frequency using a machine learning
  model trained on historical grid data
• Calculating battery degradation cost for proposed
  V2G discharge operations using a physics-informed model
• Comparing predicted revenue against degradation cost
  to determine profitability
• Ranking vehicles by priority score considering SoC
  margin, departure time, and battery health
• Allocating demand response requests to highest
  priority vehicles first
• Wherein unprofitable V2G requests are automatically
  rejected to protect battery health

DEPENDENT CLAIMS:
• ...wherein prediction horizons include 1s, 10s, 60s, 5min
• ...wherein degradation model accounts for temperature,
  C-rate, and depth of discharge
• ...wherein priority scores are recalculated continuously
  as conditions change
• ...wherein ML models are quantized for edge deployment
• ...wherein fallback rules activate if ML models fail
• ...wherein anomaly detection identifies failing equipment
```

---

## 9. Development Status

```
□ Concept only (current)
□ Proof of concept built
□ Prototype tested
□ Pilot production
□ Commercial production
```

---

## 10. Commercial Potential

```
MARKET SIZE:
• V2G fleet optimization software: $500M by 2030
• Grid services aggregation: $2B/year
• Fleet management systems: $10B by 2030

COMPETITIVE ADVANTAGE:
• Only edge-deployed V2G optimization
• Physics-informed battery protection unique
• Integrates with modular hardware (EK-2026-001)
• Cloud-independent operation

REVENUE MODELS:
• Software license per vehicle
• Revenue share on grid services earnings
• SaaS for fleet operators
• Embedded in hardware sales

POTENTIAL LICENSEES:
• Fleet management companies
• Grid aggregators
• Charger manufacturers
• Automotive OEMs (fleet vehicles)
```

---

## 11. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________


WITNESS (non-inventor who understands the disclosure):

Name: _________________________
Signature: ____________________
Date: ________________________
```

---

## Notes for Patent Attorney

```
KEY POINTS TO EMPHASIZE:
1. Edge deployment is key differentiator
2. Physics-informed battery model is novel for V2G
3. Priority-based fleet allocation protects operations
4. Prediction enables proactive response
5. Synergy with EK-2026-001 (hardware) and EK-2026-007 (control)

POTENTIAL CHALLENGES:
1. ML/AI is broad field (claim specific application)
2. Prediction methods exist (claim V2G-specific use)
3. Fleet management exists (claim V2G optimization)

RECOMMENDED APPROACH:
1. Claim as part of integrated system
2. Emphasize technical effect (battery protection, latency)
3. Reference hardware patents for context
4. Consider continuation for specific ML architectures

CROSS-REFERENCE:
• Patent A (Umbrella): EK-2026-001 Modular Architecture
• Patent B: EK-2026-007 V2G Control System
• This patent: AI/ML optimization layer
• Position as Patent C candidate (Fleet Logistics)
```
