# AI/ML Sistem Arhitektura

## Filozofija: AI Upravlja Kompleksnošću

```
TRADICIONALNI PUNJAČ              ELEKTROKOMBINACIJA
────────────────────────────────────────────────────────────
Fixed thresholds            →    Adaptive AI thresholds
Reactive alarms             →    Predictive diagnostics
Manual tuning               →    Self-optimizing control
Scheduled maintenance       →    Condition-based maintenance
Isolated modules            →    Swarm intelligence
Post-failure analysis       →    Real-time digital twin
```

---

## 1. Edge AI Hardver

### EK3 (3 kW) - Cortex-M7

```
PROCESOR: STM32H7 Series
──────────────────────────
• Core: ARM Cortex-M7 @ 480 MHz
• DSP: Dual-issue, SIMD
• FPU: Single + Double precision
• RAM: 1 MB SRAM (TCM)
• Flash: 2 MB internal

AI Capability:
• TensorFlow Lite Micro
• X-CUBE-AI optimizacija
• ~50 MOPS za inference
• Dovoljno za: anomaly detection, PID tuning, basic prediction
```

### EK30 (30 kW) - Cortex-M55 + NPU

```
PROCESOR: STM32N6 Series (2024/2025)
─────────────────────────────────────
• Core: ARM Cortex-M55 @ 800 MHz
• NPU: Neural-ART Accelerator
• Performance: 600 GOPS
• RAM: 4.2 MB internal
• Helium: Vector processing extension

AI Capability:
• 600× više ML performansi vs standard MCU
• Computer vision capable
• Complex LSTM/GRU models
• Real-time digital twin computation
• Multi-model inference

Alternative: NXP i.MX RT1170 + eIQ ML
─────────────────────────────────────
• Dual core: M7 @ 1GHz + M4
• 2 MB SRAM
• NPU za ML acceleration
```

### Cloud AI Layer

```
                    ┌──────────────────────────┐
                    │      CLOUD AI            │
                    │                          │
                    │  • Fleet-wide analytics  │
                    │  • Model training        │
                    │  • Heavy computation     │
                    │  • Historical analysis   │
                    │                          │
                    └───────────┬──────────────┘
                                │
                         4G/5G/Fiber
                                │
                    ┌───────────┴──────────────┐
                    │      EDGE AI (EK30)      │
                    │                          │
                    │  • Real-time inference   │
                    │  • Local decision making │
                    │  • Digital twin sync     │
                    │  • Anomaly detection     │
                    │                          │
                    └───────────┬──────────────┘
                                │
                          CAN-FD Bus
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
        ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
        │   EK30    │     │   EK30    │     │   EK30    │
        │ Module AI │     │ Module AI │     │ Module AI │
        └───────────┘     └───────────┘     └───────────┘
```

---

## 2. Digital Twin Arhitektura

### Koncept

```
FIZIČKI MODUL                    DIGITALNI TWIN
──────────────────────────────────────────────────────
┌─────────────┐                  ┌─────────────┐
│             │  ──── sync ───→  │             │
│   EK30      │   200+ params    │   EK30-DT   │
│  Physical   │   <50ms latency  │   Virtual   │
│             │  ←── commands ── │             │
└─────────────┘                  └─────────────┘
     │                                 │
     │ Real operation                  │ Simulation
     ▼                                 ▼
  Actual load                    "What-if" scenarios
  Real faults                    Predictive analysis
  Measured data                  Synthetic testing
```

### Sinhronizovani Parametri (200+)

```
POWER STAGE
───────────
• Vdc_bus, Idc, Pac, Pdc
• MOSFET temperatures (per device)
• Gate drive voltages
• Switching frequencies
• PWM duty cycles
• Resonant tank currents

THERMAL
───────
• Coolant inlet/outlet temp
• Junction temperatures (estimated)
• Ambient temperature
• Heatsink temperatures
• Flow rate

CONTROL
───────
• PID outputs
• Error integrals
• Setpoints vs actuals
• Control loop frequencies
• Fault counters

GRID
────
• Vrms per phase
• Irms per phase
• Power factor
• THD
• Frequency

VEHICLE
───────
• Battery voltage
• Requested current
• SOC (if available)
• CCS/CHAdeMO state
• ISO 15118 session data
```

### Real-Time Implementation

```python
# Pseudo-code za Digital Twin sync

class DigitalTwin:
    def __init__(self, module_id):
        self.id = module_id
        self.state = {}
        self.model = load_physics_model()
        self.ml_model = load_ml_model()

    def sync(self, telemetry):
        """Sinhronizacija sa fizičkim modulom - <50ms"""
        self.state.update(telemetry)

        # Physics-based estimation
        self.state['Tj_estimated'] = self.model.estimate_junction_temp(
            self.state['power'],
            self.state['coolant_temp'],
            self.state['flow_rate']
        )

        # ML-based health assessment
        self.state['health_score'] = self.ml_model.predict_health(
            self.state
        )

    def simulate_scenario(self, scenario):
        """What-if simulacija"""
        virtual_state = copy(self.state)

        for step in scenario.steps:
            virtual_state = self.model.step(virtual_state, step)

        return virtual_state

    def predict_failure(self, horizon_hours=1000):
        """RUL predikcija"""
        return self.ml_model.predict_rul(
            self.state,
            horizon=horizon_hours
        )
```

---

## 3. Predictive Maintenance

### Degradation Indicators

```
MOSFET DEGRADATION
──────────────────
Primary indicator: Rds(on) increase

Healthy: Rds(on) = nominal (e.g., 11 mΩ)
Warning: Rds(on) > nominal × 1.2 (20% increase)
Critical: Rds(on) > nominal × 1.5 (50% increase)
Failure imminent: Rds(on) > nominal × 2.0

Measurement method:
• On-state voltage sensing during operation
• Temperature compensation (Rds(on) rises with temp)
• Statistical averaging over multiple cycles
```

```
CAPACITOR DEGRADATION
─────────────────────
Primary indicator: ESR increase + Capacitance decrease

Healthy: ESR = nominal, C = nominal
Warning: ESR > 1.5× nominal OR C < 0.9× nominal
Critical: ESR > 2× nominal OR C < 0.8× nominal

Measurement method:
• Ripple current/voltage analysis
• Impedance spectroscopy (during idle)
• Temperature monitoring
```

```
THERMAL SYSTEM DEGRADATION
──────────────────────────
Indicators:
• Thermal resistance increase (Rth)
• Coolant flow reduction
• Pump efficiency drop

Measurement:
• ΔT between junction and coolant
• Power dissipation vs temperature rise
• Flow sensor data vs pump power
```

### ML Models za Prediction

```
MODEL 1: LSTM za Rds(on) Trend
──────────────────────────────
Input: Last 1000 Rds(on) measurements
       + Temperature history
       + Load profile

Output: Predicted Rds(on) for next 1000h

Architecture:
• LSTM layers: 2 × 64 units
• Dense output: 1 unit
• Training: NASA MOSFET degradation dataset + own data

Accuracy target: RMSPE < 2%
```

```
MODEL 2: Random Forest za Health Classification
───────────────────────────────────────────────
Input features:
• Rds(on) current value
• Rds(on) trend (slope)
• Temperature statistics (mean, std, max)
• Operating hours
• Cycle count
• Load factor statistics

Output classes:
• Healthy (0-80% life consumed)
• Degraded (80-95% life consumed)
• Critical (>95% life consumed)

Target accuracy: >90%
```

```
MODEL 3: GRU za Anomaly Detection
─────────────────────────────────
Input: Rolling window of 100 samples
       Multiple parameters

Output: Anomaly score (0-1)

Training: Autoencoder approach
• Train on healthy operation data
• High reconstruction error = anomaly

Latency: <10ms on STM32N6 NPU
```

### Maintenance Scheduling

```
CONDITION-BASED vs SCHEDULED
────────────────────────────

Scheduled (traditional):
• Replace MOSFET every 50,000 hours
• Check coolant every 5,000 hours
• Full inspection every year

Condition-based (ELEKTROKOMBINACIJA):
• Replace when RUL < 1000 hours predicted
• Alert when anomaly score > 0.7
• Inspect when health drops to "Degraded"

Cost savings: 30-50% reduction in unnecessary maintenance
Uptime improvement: 20% fewer unexpected failures
```

---

## 4. Self-Tuning Control

### Adaptive PID

```
TRADITIONAL PID
───────────────
Fixed Kp, Ki, Kd gains
Tuned at factory
Works well at one operating point

AI-ADAPTIVE PID
───────────────
Dynamic gain adjustment based on:
• Operating temperature
• Load level
• Input voltage
• Component aging

Implementation:
┌────────────────────────────────────────────┐
│                                            │
│  Setpoint ──→ [PID] ──→ PWM ──→ [Plant] ──┼──→ Output
│                 ↑                          │
│                 │                          │
│          ┌──────┴──────┐                   │
│          │ AI Tuner    │←── Feedback ──────┘
│          │             │
│          │ Observes:   │
│          │ • Overshoot │
│          │ • Settling  │
│          │ • Oscillation│
│          │             │
│          │ Adjusts:    │
│          │ • Kp, Ki, Kd│
│          └─────────────┘
│                                            │
└────────────────────────────────────────────┘
```

### Reinforcement Learning za Control

```
STATE (s):
• Current/voltage errors
• Temperature margins
• Efficiency metric
• THD measurement

ACTION (a):
• PID gain adjustments
• Switching frequency
• Dead-time adjustment

REWARD (r):
• + Efficiency improvement
• + Stability (low oscillation)
• - THD increase
• - Temperature overshoot

Algorithm: PPO (Proximal Policy Optimization)
• Safe exploration
• Smooth policy updates
• Suitable for continuous control
```

### LLC Resonant Frequency Optimization

```
Challenge: LLC resonant frequency drifts with temperature and aging

Traditional: Fixed design point, accept efficiency loss

AI Solution:
1. Monitor resonant tank behavior
2. Estimate actual Lr, Cr values
3. Adjust switching frequency to track resonance
4. Maintain ZVS across operating range

Result: +0.5-1% efficiency maintained over lifetime
```

---

## 5. Anomaly Detection

### Types of Anomalies

```
POINT ANOMALIES
───────────────
• Sudden spike in temperature
• Voltage overshoot
• Current surge
Detection: Threshold + rate-of-change

CONTEXTUAL ANOMALIES
────────────────────
• High temperature at low load (abnormal)
• Low temperature at high load (sensor fault?)
Detection: ML model knows normal context

COLLECTIVE ANOMALIES
────────────────────
• Pattern of small deviations
• Trending behavior
Detection: LSTM autoencoder
```

### Real-Time Implementation

```
┌─────────────────────────────────────────────────────────┐
│                  ANOMALY DETECTION PIPELINE              │
│                                                          │
│  Sensors ──→ [Preprocessing] ──→ [Feature Extraction]   │
│                                           │              │
│                                           ▼              │
│                    ┌──────────────────────────────────┐  │
│                    │     PARALLEL DETECTION          │  │
│                    │                                  │  │
│                    │  ┌─────────┐    ┌─────────┐    │  │
│                    │  │Threshold│    │   ML    │    │  │
│                    │  │ Based   │    │ Model   │    │  │
│                    │  └────┬────┘    └────┬────┘    │  │
│                    │       │              │          │  │
│                    └───────┴──────┬───────┴──────────┘  │
│                                   │                      │
│                                   ▼                      │
│                            [Fusion Logic]                │
│                                   │                      │
│                                   ▼                      │
│                         ┌─────────────────┐              │
│                         │  Alert / Action │              │
│                         └─────────────────┘              │
│                                                          │
└─────────────────────────────────────────────────────────┘

Latency budget:
• Preprocessing: 1 ms
• Feature extraction: 2 ms
• ML inference: 5 ms (on NPU)
• Fusion + decision: 1 ms
• TOTAL: <10 ms
```

### Response Actions

```
ANOMALY SEVERITY      ACTION
─────────────────────────────────────────────
Low (score 0.3-0.5)   Log event, continue monitoring
Medium (0.5-0.7)      Alert operator, increase monitoring rate
High (0.7-0.9)        Reduce power, notify maintenance
Critical (>0.9)       Safe shutdown, require manual inspection
```

---

## 6. Fleet Learning

### Federated Learning Approach

```
                    ┌─────────────────────────┐
                    │      CLOUD SERVER       │
                    │                         │
                    │  Aggregated Model       │
                    │  (privacy preserving)   │
                    │                         │
                    └───────────┬─────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
    ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
    │   Site A      │   │   Site B      │   │   Site C      │
    │   10 modules  │   │   5 modules   │   │   20 modules  │
    │               │   │               │   │               │
    │ Local training│   │ Local training│   │ Local training│
    │ Local data    │   │ Local data    │   │ Local data    │
    └───────┬───────┘   └───────┬───────┘   └───────┬───────┘
            │                   │                   │
            └───────── Model gradients ─────────────┘
                    (not raw data)

Benefits:
• Data privacy - raw data stays local
• Distributed computation
• Diverse training data
• Continuous improvement
```

### Transfer Learning

```
Scenario: Nova instalacija bez historijskih podataka

Rešenje:
1. Preuzmi pre-trained model iz cloud-a
2. Model već zna "generalno" ponašanje EK30
3. Fine-tune na lokalnim podacima (nekoliko dana)
4. Postani ekspert za lokalne uslove

Rezultat: Instant baseline + rapid specialization
```

---

## 7. AI Software Stack

### Edge (STM32N6)

```
┌─────────────────────────────────────────────┐
│              APPLICATION LAYER              │
│  • Control loops                            │
│  • State machines                           │
│  • Communication                            │
├─────────────────────────────────────────────┤
│              AI RUNTIME LAYER               │
│  • TensorFlow Lite Micro                    │
│  • ST Neural-ART runtime                    │
│  • Model inference engine                   │
├─────────────────────────────────────────────┤
│              MIDDLEWARE                     │
│  • RTOS (FreeRTOS or bare-metal)           │
│  • HAL drivers                              │
│  • DSP library (CMSIS-DSP)                 │
├─────────────────────────────────────────────┤
│              HARDWARE                       │
│  • Cortex-M55                              │
│  • Neural-ART NPU                          │
│  • Peripherals                             │
└─────────────────────────────────────────────┘
```

### Cloud

```
┌─────────────────────────────────────────────┐
│              ANALYTICS LAYER                │
│  • Fleet dashboards                         │
│  • Maintenance scheduling                   │
│  • Business intelligence                    │
├─────────────────────────────────────────────┤
│              ML PLATFORM                    │
│  • Model training (PyTorch/TensorFlow)     │
│  • Experiment tracking (MLflow)            │
│  • Model registry                          │
│  • AutoML for hyperparameter tuning        │
├─────────────────────────────────────────────┤
│              DATA LAYER                     │
│  • Time-series DB (InfluxDB/TimescaleDB)   │
│  • Model storage (S3)                      │
│  • Event streaming (Kafka)                 │
├─────────────────────────────────────────────┤
│              INFRASTRUCTURE                 │
│  • Kubernetes                              │
│  • GPU instances for training              │
│  • Edge device management (balena/AWS IoT) │
└─────────────────────────────────────────────┘
```

### Model Deployment Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Train   │───→│  Validate│───→│ Quantize │───→│  Deploy  │
│  (Cloud) │    │  (Cloud) │    │  (INT8)  │    │  (OTA)   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
  PyTorch        Test set        TFLite          Edge devices
  Training       Metrics         Converter       via OTA update

Quantization impact:
• Model size: 4× reduction (FP32 → INT8)
• Inference speed: 2-4× faster
• Accuracy loss: <1% typically
```

---

## 8. Safety & Certification

### AI in Safety-Critical Systems

```
Challenge: AI u safety-critical power electronics

Pristup: AI as ADVISOR, not ACTUATOR

┌─────────────────────────────────────────────────┐
│                                                 │
│   AI LAYER (advisory)                          │
│   • Suggests optimal settings                  │
│   • Predicts issues                            │
│   • Recommends actions                         │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   DETERMINISTIC SAFETY LAYER                   │
│   • Hard-coded limits (certified)              │
│   • Hardware interlocks                        │
│   • Watchdog timers                            │
│   • Fail-safe defaults                         │
│                                                 │
└─────────────────────────────────────────────────┘

AI CANNOT:
• Override safety limits
• Disable protection circuits
• Operate outside certified envelope

AI CAN:
• Optimize within safe bounds
• Predict and prevent (advisory)
• Improve efficiency
• Schedule maintenance
```

### Explainable AI

```
Za certifikaciju potrebno:
• Objašnjenje ZAŠTO je AI donio odluku
• Audit trail svih AI akcija
• Mogućnost replay-a scenarija

Implementacija:
• Log sve AI inputs + outputs
• SHAP values za feature importance
• Simplified rule extraction za kritične odluke
```

---

## Reference i Izvori

- [STM32N6 NPU Microcontroller](https://newsroom.st.com/media-center/press-item.html/p4665.html)
- [Digital Twin in Power Electronics - OPAL-RT](https://www.opal-rt.com/blog/digital-twin-simulation-in-power-electronics-design/)
- [EV Charging Digital Twins](https://eepower.com/tech-insights/electric-avenue-how-digital-twins-will-charge-up-ev-infrastructure/)
- [ML Pipeline for Power Electronics Health](https://pure.hw.ac.uk/ws/portalfiles/portal/141898137/Machine_Learning_Pipeline_for_Power_Electronics_State_of_Health_Assessment_and_Remaining_Useful_Life_Prediction.pdf)
- [LSTM for MOSFET Lifetime Prediction](https://www.mdpi.com/2227-7390/11/15/3283)
- [Edge AI Hardware - STMicroelectronics](https://stm32ai.st.com/edge-ai-hardware/)
