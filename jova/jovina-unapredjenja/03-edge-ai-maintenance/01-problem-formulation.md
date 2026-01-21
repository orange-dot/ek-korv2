# Edge AI Predictive Maintenance: Problem Formulation

> **Topic:** TinyML for Remaining Useful Life Prediction on EK3 Modules
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document provides a complete mathematical formulation for on-device predictive maintenance using TinyML on EK3 power electronics modules. The goal is to predict Remaining Useful Life (RUL) of critical components while operating within severe computational constraints of embedded microcontrollers.

### 1.1 Motivation

Power electronics modules in EV charging infrastructure experience degradation due to:
- Thermal cycling stress on semiconductors (SiC MOSFETs)
- Capacitor aging (electrolytic DC-link capacitors)
- Connector wear from repeated mating cycles
- Solder joint fatigue from thermal expansion

Early detection of degradation enables:
- Proactive module replacement before failure
- Optimized spare parts inventory
- Reduced downtime and service costs
- Improved fleet-level reliability

### 1.2 Edge AI Requirements

Traditional predictive maintenance requires cloud connectivity for ML inference. Our approach performs inference directly on the EK3 module's STM32G474 MCU, enabling:
- Offline operation (no network dependency)
- Real-time predictions (sub-10ms latency)
- Privacy preservation (raw data stays local)
- Reduced communication bandwidth

---

## 2. Formal Problem Definition

### 2.1 Problem Instance

```
PROBLEM INSTANCE: I = (X, H, C, T)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Definition 2.1 (Sensor Data Stream).** X = {x₁, x₂, ..., xₜ} is the multivariate time series from module sensors where each xₜ ∈ ℝᵈ contains d sensor readings at time t.

**Definition 2.2 (Health Indicator).** H: ℝᵈ×ᵀ → [0, 1] is a health indicator function mapping sensor history to a normalized health score, where:
- H = 1.0: Fully healthy (new module)
- H = 0.0: End of life (failure imminent)

**Definition 2.3 (Computational Budget).** C = (M, T_inf, P) specifies:
- M: Maximum model size in bytes
- T_inf: Maximum inference time
- P: Maximum power consumption

**Definition 2.4 (Target Horizon).** T_pred is the prediction horizon for RUL estimation.

---

### 2.2 Sensor Measurements

```
SENSOR VECTOR: xₜ ∈ ℝ¹⁶
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Electrical Measurements (100 Hz sampling):
────────────────────────────────────────────
x[0]:  V_in      Input voltage (DC bus)         [V]
x[1]:  V_out     Output voltage                 [V]
x[2]:  I_in      Input current                  [A]
x[3]:  I_out     Output current                 [A]
x[4]:  P_in      Input power                    [W]
x[5]:  P_out     Output power                   [W]
x[6]:  η         Efficiency (P_out/P_in)        [%]
x[7]:  V_ripple  DC bus voltage ripple          [mV]

Thermal Measurements (10 Hz sampling):
────────────────────────────────────────────
x[8]:  T_mosfet  MOSFET junction temperature    [°C]
x[9]:  T_diode   Diode temperature              [°C]
x[10]: T_cap     Capacitor core temperature     [°C]
x[11]: T_ambient Ambient temperature            [°C]
x[12]: T_pcb     PCB temperature                [°C]

Derived/Calculated (1 Hz):
────────────────────────────────────────────
x[13]: ESR_cap   Capacitor ESR estimate         [mΩ]
x[14]: R_ds_on   MOSFET on-resistance           [mΩ]
x[15]: cycles    Thermal cycle count            [count]
```

### 2.3 Degradation Mechanisms

```
DEGRADATION MODELS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. CAPACITOR AGING (Primary failure mode)
   ─────────────────────────────────────────
   ESR evolution: ESR(t) = ESR₀ × exp(k × t × f(T))

   where:
   • ESR₀: Initial equivalent series resistance
   • k: Aging rate constant
   • t: Operating time
   • f(T) = exp((T - T_ref) / T_a): Arrhenius factor
   • T_a ≈ 10°C (activation temperature)

   End-of-life criterion: ESR > 2 × ESR₀

2. MOSFET DEGRADATION
   ─────────────────────────────────────────
   R_ds_on drift: R_ds(n) = R_ds₀ × (1 + α × n^β)

   where:
   • n: Number of thermal cycles
   • α, β: Device-specific parameters
   • Typical: α ≈ 10⁻⁶, β ≈ 0.3

   End-of-life criterion: R_ds > 1.5 × R_ds₀

3. SOLDER JOINT FATIGUE (Coffin-Manson)
   ─────────────────────────────────────────
   Cycles to failure: N_f = C × (ΔT)^(-γ)

   where:
   • ΔT: Temperature swing amplitude
   • C, γ: Material constants
   • Typical: γ ≈ 2 for lead-free solder

   Damage accumulation: D = Σᵢ (nᵢ / N_f(ΔTᵢ))
```

---

### 2.4 Decision Variables

```
DECISION VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model Parameters:
────────────────────────────────────────────
θ ∈ ℝᵖ         Model parameters (weights, biases)
               Constraint: |θ| ≤ M (model size budget)

Predictions:
────────────────────────────────────────────
ĤI(t)          Predicted Health Index at time t
               Range: [0, 1]

R̂UL(t)         Predicted Remaining Useful Life
               Unit: Hours or cycles
               Range: [0, RUL_max]

ŷ(t)           Anomaly score
               Range: [0, 1], threshold τ for alert
```

---

### 2.5 Objective Function

```
OBJECTIVE FUNCTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY: Minimize RUL Prediction Error
────────────────────────────────────────────

minimize  L(θ) = L_RUL + λ₁L_HI + λ₂L_reg

where:

L_RUL = (1/N) Σᵢ ℓ(R̂UL(tᵢ), RUL*(tᵢ))

    Asymmetric loss (penalize under-prediction more):
    ℓ(ŷ, y) = { α(y - ŷ)²  if ŷ < y  (under-predict: dangerous)
              { (ŷ - y)²    if ŷ ≥ y  (over-predict: safe)

    Typical: α = 2.0 (2x penalty for under-prediction)

L_HI = (1/N) Σᵢ (ĤI(tᵢ) - HI*(tᵢ))²

    Health Index regression loss

L_reg = ||θ||₁ + ||θ||₂²

    L1 + L2 regularization for sparsity and smoothness
```

### 2.6 Constraints

```
CONSTRAINT SET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C1: Model Size Constraint
────────────────────────────────────────────
|θ|_bytes ≤ M_max = 100 KB

    For quantized INT8 model:
    • Dense layer (n_in × n_out): n_in × n_out bytes
    • Bias: n_out bytes
    • Total parameters: Σₗ (n_in^l × n_out^l + n_out^l)

C2: Inference Time Constraint
────────────────────────────────────────────
T_inference ≤ T_max = 10 ms

    On STM32G474 @ 170 MHz:
    • MAC operation: ~6 cycles (with FPU)
    • INT8 MAC: ~2 cycles (SIMD)
    • Budget: ~1.7M cycles @ 10ms

C3: Memory Constraint
────────────────────────────────────────────
RAM_working ≤ RAM_max = 128 KB

    Working memory includes:
    • Input buffer: d × w × sizeof(dtype)
    • Activation buffers: max layer size × 2
    • Output buffer

C4: Input Window Constraint
────────────────────────────────────────────
Window size: w ≤ w_max = 256 samples

    At 100 Hz: 2.56 seconds of history
    Memory: 16 features × 256 × 1 byte = 4 KB

C5: Online Learning Constraint (optional)
────────────────────────────────────────────
Gradient computation: ∇θL feasible on-device
Update frequency: ≤ 1 Hz
```

---

## 3. Health Index Formulation

### 3.1 Physics-Informed Health Index

```
HEALTH INDEX COMPUTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component-wise Health Indices:
────────────────────────────────────────────

HI_cap(t) = max(0, 1 - (ESR(t) - ESR₀) / (ESR_EOL - ESR₀))

HI_mosfet(t) = max(0, 1 - (R_ds(t) - R_ds₀) / (R_ds_EOL - R_ds₀))

HI_thermal(t) = max(0, 1 - D_thermal(t))

    where D_thermal = Miner's rule damage accumulation

Aggregate Health Index:
────────────────────────────────────────────

HI(t) = min(HI_cap, HI_mosfet, HI_thermal)

    or weighted combination:

HI(t) = w_cap × HI_cap + w_mos × HI_mosfet + w_therm × HI_thermal

    where Σ wᵢ = 1
```

### 3.2 Data-Driven Health Index

```
LEARNED HEALTH INDEX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Autoencoder-based anomaly score:
────────────────────────────────────────────

HI_learned(t) = 1 - σ(reconstruction_error(t))

where:
• Autoencoder trained on healthy data
• reconstruction_error = ||x - decode(encode(x))||²
• σ: sigmoid normalization to [0, 1]

Degradation trend fitting:
────────────────────────────────────────────

Fit exponential: HI(t) = exp(-λ × t)

RUL estimate: R̂UL = (1/λ) × ln(HI(t) / HI_threshold)
```

---

## 4. RUL Prediction Formulation

### 4.1 Direct RUL Regression

```
DIRECT RUL PREDICTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: R̂UL(t) = f_θ(X_{t-w:t})

Input: Sliding window of sensor data
       X_{t-w:t} ∈ ℝ^(w × d)

Output: Scalar RUL prediction
        R̂UL ∈ [0, RUL_max]

Architecture options:
• MLP: flatten → dense layers → output
• CNN: conv1d → pooling → dense → output
• LSTM: recurrent → dense → output (expensive)
```

### 4.2 Probabilistic RUL

```
PROBABILISTIC FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: P(RUL | X_{t-w:t}) = N(μ_θ(X), σ_θ(X)²)

Outputs:
• μ_θ(X): Mean RUL prediction
• σ_θ(X): Uncertainty estimate

Loss function:
L = -log P(RUL* | X) = (RUL* - μ)² / (2σ²) + log(σ)

Benefits:
• Confidence intervals for maintenance planning
• Uncertainty-aware decision making
• Detects out-of-distribution inputs
```

### 4.3 Classification-Based RUL

```
CLASSIFICATION FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Discretize RUL into bins:
────────────────────────────────────────────

Class 0: RUL > 1000 hours    (Healthy)
Class 1: 500 < RUL ≤ 1000    (Watch)
Class 2: 100 < RUL ≤ 500     (Warning)
Class 3: RUL ≤ 100           (Critical)

Model: P(class | X) = softmax(f_θ(X))

Loss: Cross-entropy

Benefits:
• Simpler model (fewer parameters)
• Actionable output (maintenance priority)
• Robust to noisy RUL labels
```

---

## 5. Federated Learning Extension

### 5.1 Fleet-Level Learning

```
FEDERATED LEARNING FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Setting:
• K modules in fleet: {m₁, m₂, ..., mₖ}
• Each module has local dataset: Dₖ
• Central coordinator (station controller or cloud)

Objective:
────────────────────────────────────────────

minimize  L(θ) = Σₖ (|Dₖ| / |D|) × Lₖ(θ)

where Lₖ(θ) = (1/|Dₖ|) Σᵢ∈Dₖ ℓ(f_θ(xᵢ), yᵢ)

Algorithm: FedAvg
────────────────────────────────────────────

1. Server broadcasts global model θ^(t)
2. Each module k:
   a. Downloads θ^(t)
   b. Computes local update: θₖ^(t+1) = θ^(t) - η∇Lₖ(θ^(t))
   c. Uploads Δθₖ = θₖ^(t+1) - θ^(t)
3. Server aggregates: θ^(t+1) = θ^(t) + (1/K) Σₖ Δθₖ
4. Repeat

Communication efficiency:
• Quantize gradients to 8-bit
• Compress with top-k sparsification
• Update frequency: daily or weekly
```

### 5.2 Privacy-Preserving Constraints

```
PRIVACY CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Differential Privacy:
────────────────────────────────────────────
Add noise to gradients: Δθₖ + N(0, σ²_DP × C²)

where:
• C: Gradient clipping bound
• σ_DP: Noise scale for (ε, δ)-DP guarantee

Secure Aggregation:
────────────────────────────────────────────
• Modules encrypt local updates
• Server computes aggregate without seeing individual updates
• Protects against curious server
```

---

## 6. Online Learning Formulation

### 6.1 Continual Learning

```
CONTINUAL LEARNING PROBLEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Challenge: Concept drift as module ages
• Sensor distributions shift
• Degradation patterns evolve
• New failure modes emerge

Objective: Adapt to new data without forgetting

minimize  L_new(θ) + λ × L_memory(θ)

where:
• L_new: Loss on recent data
• L_memory: Regularization to prevent forgetting

Approaches:
────────────────────────────────────────────

1. Elastic Weight Consolidation (EWC):
   L_memory = Σᵢ Fᵢ × (θᵢ - θᵢ*)²

   where Fᵢ = Fisher information for parameter i

2. Experience Replay:
   Maintain small buffer of past examples
   Train on mixture of new + buffered data

3. Progressive Networks:
   Add new capacity for new tasks
   Keep old parameters frozen
```

### 6.2 On-Device Update Constraints

```
ON-DEVICE LEARNING CONSTRAINTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Memory for gradients:
────────────────────────────────────────────
• Full backprop: 2 × model_size (activations + gradients)
• Must fit in 128 KB RAM

Computation budget:
────────────────────────────────────────────
• Background task, low priority
• Budget: ~10% of CPU cycles
• Update during idle periods

Strategies:
────────────────────────────────────────────

1. Partial updates: Only update last layer
   θ_new = [θ_frozen ; θ_trainable]

2. Gradient checkpointing: Trade compute for memory

3. Micro-batch: Single sample updates
   θ ← θ - η × ∇ℓ(f_θ(x), y)
```

---

## 7. Notation Summary

| Symbol | Description |
|--------|-------------|
| xₜ ∈ ℝᵈ | Sensor vector at time t |
| X_{t-w:t} | Sliding window of w samples |
| θ | Model parameters |
| HI(t) | Health Index at time t |
| RUL(t) | Remaining Useful Life at time t |
| ESR | Equivalent Series Resistance |
| R_ds_on | MOSFET on-resistance |
| M | Model size budget (bytes) |
| T_inf | Inference time budget |
| w | Window size (samples) |
| d | Number of sensor channels |
| K | Number of modules in fleet |
| η | Learning rate |
| λ | Regularization coefficient |

---

## 8. Success Criteria

```
PERFORMANCE TARGETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prediction Accuracy:
────────────────────────────────────────────
• RUL RMSE: < 15% of actual RUL
• Health Index MAE: < 0.05
• Anomaly detection: F1 > 0.9

Computational:
────────────────────────────────────────────
• Model size: < 100 KB
• Inference time: < 10 ms
• RAM usage: < 20 KB working memory
• Power: < 5 mW average (inference)

Operational:
────────────────────────────────────────────
• False positive rate: < 1% per month
• Failure prediction: > 95% detected 24h before
• Adaptation: Stable performance over 5 years
```

---

## Related Documents

- `02-tinyml-constraints.md` - Detailed MCU constraints analysis
- `03-algorithms.md` - TinyML algorithm implementations
- `04-data-pipeline.md` - Feature engineering and data collection
- `05-literature.md` - Predictive maintenance literature
- `jova/02-research-topics.md` - Original problem statement
