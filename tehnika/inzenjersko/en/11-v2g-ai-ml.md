# V2G AI/ML Optimization

This document details the AI/ML algorithms for optimizing V2G operations in the ELEKTROKOMBINACIJA system.

---

## 1. Overview

### 1.1 AI/ML Applications in V2G

| Application | Algorithm | Platform | Latency |
|-------------|-----------|----------|---------|
| Grid Frequency Prediction | LSTM | Edge (STM32H7) | <100ms |
| Demand Response Optimization | MILP | Cloud | <1s |
| Price Arbitrage | RL/Heuristic | Cloud | <1s |
| Fleet Aggregation | Raft + Priority | Edge | <10ms |
| Anomaly Detection | Autoencoder | Edge | <50ms |
| Battery Degradation Model | Physics-Informed NN | Cloud | <1s |

### 1.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       AI/ML ARCHITECTURE FOR V2G                         │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                           CLOUD LAYER                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │   TRAINING   │  │ OPTIMIZATION │  │   DIGITAL    │              │ │
│  │  │   PIPELINE   │  │    ENGINE    │  │    TWINS     │              │ │
│  │  │              │  │              │  │              │              │ │
│  │  │ - LSTM train │  │ - MILP solver│  │ - Fleet sim  │              │ │
│  │  │ - RL train   │  │ - DR optimize│  │ - Scenario   │              │ │
│  │  │ - Batch ML   │  │ - Arbitrage  │  │   analysis   │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  └────────────────────────────────┬───────────────────────────────────┘ │
│                                   │ MQTT / gRPC                         │
│                                   │ Model updates, schedules            │
│  ┌────────────────────────────────▼───────────────────────────────────┐ │
│  │                           EDGE LAYER                                │ │
│  │                      (Depot Controller)                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │
│  │  │  FREQ PRED   │  │    FLEET     │  │   ANOMALY    │              │ │
│  │  │   (LSTM)     │  │ AGGREGATOR   │  │  DETECTION   │              │ │
│  │  │              │  │              │  │              │              │ │
│  │  │ TFLite Micro │  │ Raft + Prio  │  │ Autoencoder  │              │ │
│  │  │ INT8 quant   │  │ <10ms        │  │ Real-time    │              │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │
│  └────────────────────────────┬───────────────────────────────────────┘ │
│                               │ CAN-FD @ 5Mbps                         │
│  ┌────────────────────────────▼───────────────────────────────────────┐ │
│  │                          MODULE LAYER                               │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │ │
│  │  │  EK3    │  │  EK3    │  │  EK3    │  │  EK3    │  │  EK3    │  │ │
│  │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ STM32G4 │  │ │
│  │  │ PLL+Drp │  │ PLL+Drp │  │ PLL+Drp │  │ PLL+Drp │  │ PLL+Drp │  │ │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Grid Frequency Prediction

### 2.1 LSTM Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LSTM FOR FREQUENCY PREDICTION                         │
│                                                                          │
│  Input (sliding window = 60 seconds):                                   │
│  ├─ f[t-59] ... f[t]      Grid frequency (60 samples @ 1Hz)             │
│  ├─ P_load[t-59:t]        Total grid load                               │
│  ├─ P_renewable[t-59:t]   Renewable generation                          │
│  ├─ hour_of_day           Cyclical encoding (sin/cos)                   │
│  └─ day_of_week           Cyclical encoding (sin/cos)                   │
│                                                                          │
│  Architecture:                                                           │
│  ┌────────────────┐                                                     │
│  │ Input Layer    │ shape: (60, 5)                                      │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ LSTM Layer 1   │ 64 units, return_sequences=True                     │
│  │ Dropout(0.2)   │                                                     │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ LSTM Layer 2   │ 32 units, return_sequences=False                    │
│  │ Dropout(0.2)   │                                                     │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ Dense Layer    │ 16 units, ReLU                                      │
│  └───────┬────────┘                                                     │
│          ▼                                                               │
│  ┌────────────────┐                                                     │
│  │ Output Layer   │ 4 units (multi-horizon prediction)                  │
│  └────────────────┘                                                     │
│                                                                          │
│  Output:                                                                 │
│  ├─ f[t+1]     1 second ahead                                           │
│  ├─ f[t+10]    10 seconds ahead                                         │
│  ├─ f[t+60]    1 minute ahead                                           │
│  └─ f[t+300]   5 minutes ahead                                          │
│                                                                          │
│  Training:                                                               │
│  ├─ Data: ENTSO-E Transparency Platform (1 year)                        │
│  ├─ Loss: MSE                                                           │
│  ├─ Optimizer: Adam, lr=0.001                                           │
│  └─ Target MAE: <0.02 Hz for 1-min prediction                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Training Pipeline (Python)

```python
import tensorflow as tf
from tensorflow.keras import layers, models
import numpy as np

def create_frequency_prediction_model():
    """Create LSTM model for grid frequency prediction."""

    model = models.Sequential([
        # Input: (batch, timesteps=60, features=5)
        layers.Input(shape=(60, 5)),

        # LSTM layers
        layers.LSTM(64, return_sequences=True, dropout=0.2),
        layers.LSTM(32, return_sequences=False, dropout=0.2),

        # Dense layers
        layers.Dense(16, activation='relu'),
        layers.Dense(4)  # 4 prediction horizons
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    return model

def prepare_data(frequency_data, load_data, renewable_data, timestamps):
    """Prepare training data with sliding windows."""

    window_size = 60  # 60 seconds
    horizons = [1, 10, 60, 300]  # Prediction horizons

    X, y = [], []

    for i in range(window_size, len(frequency_data) - max(horizons)):
        # Features
        features = np.column_stack([
            frequency_data[i-window_size:i],
            load_data[i-window_size:i],
            renewable_data[i-window_size:i],
            np.sin(2 * np.pi * timestamps[i-window_size:i].hour / 24),
            np.cos(2 * np.pi * timestamps[i-window_size:i].hour / 24)
        ])
        X.append(features)

        # Targets (future frequency values)
        targets = [frequency_data[i + h] for h in horizons]
        y.append(targets)

    return np.array(X), np.array(y)

def quantize_model(model, representative_data):
    """Quantize model to INT8 for edge deployment."""

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]

    def representative_dataset():
        for data in representative_data[:100]:
            yield [data.astype(np.float32)]

    converter.representative_dataset = representative_dataset
    converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
    converter.inference_input_type = tf.int8
    converter.inference_output_type = tf.int8

    tflite_model = converter.convert()

    with open('frequency_model_int8.tflite', 'wb') as f:
        f.write(tflite_model)

    return tflite_model
```

### 2.3 Edge Deployment (STM32H7)

```c
#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/schema/schema_generated.h"

// Model loaded from FLASH
extern const unsigned char frequency_model_tflite[];
extern const unsigned int frequency_model_tflite_len;

// Tensor arena (adjust size based on model)
#define TENSOR_ARENA_SIZE 32768
static uint8_t tensor_arena[TENSOR_ARENA_SIZE] __attribute__((aligned(16)));

typedef struct {
    // TFLite Micro components
    tflite::MicroInterpreter* interpreter;
    TfLiteTensor* input_tensor;
    TfLiteTensor* output_tensor;

    // Ring buffer for input data
    float input_buffer[60][5];  // 60 timesteps × 5 features
    int write_idx;

    // Prediction outputs
    float predictions[4];       // 4 horizons: 1s, 10s, 60s, 300s
    bool model_ready;
} FrequencyPredictor;

// Global instance
static FrequencyPredictor freq_predictor;

bool FreqPredict_Init(void) {
    // Load model
    const tflite::Model* model = tflite::GetModel(frequency_model_tflite);
    if (model->version() != TFLITE_SCHEMA_VERSION) {
        return false;
    }

    // Create op resolver (add only needed ops to save memory)
    static tflite::MicroMutableOpResolver<6> resolver;
    resolver.AddFullyConnected();
    resolver.AddUnidirectionalSequenceLSTM();
    resolver.AddRelu();
    resolver.AddReshape();
    resolver.AddQuantize();
    resolver.AddDequantize();

    // Create interpreter
    static tflite::MicroInterpreter static_interpreter(
        model, resolver, tensor_arena, TENSOR_ARENA_SIZE);
    freq_predictor.interpreter = &static_interpreter;

    // Allocate tensors
    if (freq_predictor.interpreter->AllocateTensors() != kTfLiteOk) {
        return false;
    }

    // Get input/output tensors
    freq_predictor.input_tensor = freq_predictor.interpreter->input(0);
    freq_predictor.output_tensor = freq_predictor.interpreter->output(0);

    // Initialize buffer
    memset(freq_predictor.input_buffer, 0, sizeof(freq_predictor.input_buffer));
    freq_predictor.write_idx = 0;
    freq_predictor.model_ready = true;

    return true;
}

void FreqPredict_AddSample(float frequency, float p_load,
                           float p_renewable, float hour, float day) {
    // Normalize inputs (use training statistics)
    const float freq_mean = 50.0f, freq_std = 0.1f;
    const float load_mean = 50000.0f, load_std = 10000.0f;
    const float ren_mean = 20000.0f, ren_std = 8000.0f;

    freq_predictor.input_buffer[freq_predictor.write_idx][0] =
        (frequency - freq_mean) / freq_std;
    freq_predictor.input_buffer[freq_predictor.write_idx][1] =
        (p_load - load_mean) / load_std;
    freq_predictor.input_buffer[freq_predictor.write_idx][2] =
        (p_renewable - ren_mean) / ren_std;
    freq_predictor.input_buffer[freq_predictor.write_idx][3] =
        sinf(2.0f * PI * hour / 24.0f);
    freq_predictor.input_buffer[freq_predictor.write_idx][4] =
        cosf(2.0f * PI * hour / 24.0f);

    freq_predictor.write_idx = (freq_predictor.write_idx + 1) % 60;
}

bool FreqPredict_Infer(void) {
    if (!freq_predictor.model_ready) return false;

    // Copy ring buffer to input tensor (unroll from write_idx)
    int8_t* input_data = freq_predictor.input_tensor->data.int8;
    float input_scale = freq_predictor.input_tensor->params.scale;
    int input_zero_point = freq_predictor.input_tensor->params.zero_point;

    for (int t = 0; t < 60; t++) {
        int src_idx = (freq_predictor.write_idx + t) % 60;
        for (int f = 0; f < 5; f++) {
            float val = freq_predictor.input_buffer[src_idx][f];
            int8_t quantized = (int8_t)(val / input_scale + input_zero_point);
            input_data[t * 5 + f] = quantized;
        }
    }

    // Run inference
    if (freq_predictor.interpreter->Invoke() != kTfLiteOk) {
        return false;
    }

    // Dequantize outputs
    int8_t* output_data = freq_predictor.output_tensor->data.int8;
    float output_scale = freq_predictor.output_tensor->params.scale;
    int output_zero_point = freq_predictor.output_tensor->params.zero_point;

    for (int i = 0; i < 4; i++) {
        float val = (output_data[i] - output_zero_point) * output_scale;
        // Denormalize
        freq_predictor.predictions[i] = val * 0.1f + 50.0f;
    }

    return true;
}

// Get prediction for specific horizon
float FreqPredict_GetPrediction(int horizon_idx) {
    if (horizon_idx < 0 || horizon_idx >= 4) return 50.0f;
    return freq_predictor.predictions[horizon_idx];
}

// Use predictions for proactive V2G control
void V2G_ProactiveControl(void) {
    float freq_1min = FreqPredict_GetPrediction(2);  // 60s ahead

    if (freq_1min < 49.8f) {
        // Predicted under-frequency event
        // Proactively prepare for V2G discharge
        PrepareV2GDischarge();
        LogEvent("Proactive V2G: predicted f=%.2f Hz", freq_1min);
    } else if (freq_1min > 50.2f) {
        // Predicted over-frequency
        // Increase charging to absorb excess
        IncreaseChargingPower();
    }
}
```

---

## 3. Demand Response Optimization

### 3.1 Problem Formulation

```
OBJECTIVE: Minimize total cost while fulfilling DR commitment

MINIMIZE:
    C_total = Σ_t Σ_v [ C_battery(P_v,t) + C_opportunity(P_v,t) - R_grid(P_v,t) ]

WHERE:
    C_battery    = Battery degradation cost from V2G cycling
    C_opportunity = Missed revenue from not charging
    R_grid       = Revenue from grid services

SUBJECT TO:
    1. DR Commitment:
       Σ_v P_v,t ≥ P_DR,t  ∀t ∈ DR_event

    2. SoC Limits:
       SoC_min,v ≤ SoC_v,t ≤ SoC_max,v  ∀v,t

    3. Departure Constraint:
       SoC_v,t_depart ≥ SoC_required,v  ∀v with t_depart ≤ t_end

    4. Power Limits:
       P_min,v ≤ P_v,t ≤ P_max,v  ∀v,t

    5. Ramp Rate:
       |P_v,t - P_v,t-1| ≤ ΔP_max,v  ∀v,t
```

### 3.2 MILP Implementation (Python)

```python
from pulp import *
import numpy as np

def optimize_fleet_v2g(vehicles, dr_event, dt=0.25):
    """
    Optimize V2G power allocation for a fleet.

    Args:
        vehicles: List of vehicle dicts with:
            - id: Unique identifier
            - soc: Current SoC (0-1)
            - capacity: Battery capacity (kWh)
            - max_charge: Max charge power (kW)
            - max_discharge: Max discharge power (kW)
            - departure_time: Departure time (hours from now)
            - required_soc: Required SoC at departure (0-1)
            - degradation_cost: $/kWh cycled
        dr_event: Dict with:
            - power_request: Required power (kW, negative = discharge)
            - duration: Event duration (hours)
            - price: Revenue per kWh ($/kWh)
        dt: Time step (hours)

    Returns:
        Dict mapping vehicle_id -> power schedule [kW]
    """

    n_steps = int(dr_event['duration'] / dt)
    n_vehicles = len(vehicles)

    # Create problem
    prob = LpProblem("V2G_Fleet_Optimization", LpMinimize)

    # Decision variables: P[v, t] = power for vehicle v at time t
    # Positive = charging, Negative = discharging
    P = {}
    for v in vehicles:
        for t in range(n_steps):
            P[v['id'], t] = LpVariable(
                f"P_{v['id']}_{t}",
                lowBound=-v['max_discharge'],
                upBound=v['max_charge']
            )

    # Binary variables for discharge indicator (for degradation cost)
    D = {}
    for v in vehicles:
        for t in range(n_steps):
            D[v['id'], t] = LpVariable(f"D_{v['id']}_{t}", cat='Binary')

    # Objective: Minimize degradation cost
    degradation_cost = lpSum([
        v['degradation_cost'] * (-P[v['id'], t]) * dt * D[v['id'], t]
        for v in vehicles
        for t in range(n_steps)
    ])

    # Revenue from DR participation
    dr_revenue = lpSum([
        dr_event['price'] * (-P[v['id'], t]) * dt
        for v in vehicles
        for t in range(n_steps)
        if P[v['id'], t].lowBound < 0  # Only count discharge
    ])

    prob += degradation_cost - dr_revenue

    # Constraint 1: Meet DR commitment each timestep
    for t in range(n_steps):
        prob += lpSum([P[v['id'], t] for v in vehicles]) <= dr_event['power_request']

    # Constraint 2: SoC evolution and limits
    for v in vehicles:
        soc = v['soc'] * v['capacity']  # Current energy (kWh)

        for t in range(n_steps):
            # Energy change from power
            soc += P[v['id'], t] * dt

            # SoC limits
            prob += soc >= v.get('min_soc', 0.2) * v['capacity']
            prob += soc <= v.get('max_soc', 1.0) * v['capacity']

        # Constraint 3: Departure SoC
        steps_to_depart = int(v['departure_time'] / dt)
        if steps_to_depart <= n_steps:
            final_soc = v['soc'] * v['capacity']
            for t in range(min(steps_to_depart, n_steps)):
                final_soc += P[v['id'], t] * dt
            prob += final_soc >= v['required_soc'] * v['capacity']

    # Constraint 4: Link discharge indicator to power
    M = 10000  # Big M
    for v in vehicles:
        for t in range(n_steps):
            # D = 1 if P < 0 (discharging)
            prob += P[v['id'], t] >= -M * D[v['id'], t]
            prob += P[v['id'], t] <= M * (1 - D[v['id'], t])

    # Solve
    prob.solve(PULP_CBC_CMD(msg=0, timeLimit=10))

    if prob.status != LpStatusOptimal:
        return None

    # Extract solution
    result = {}
    for v in vehicles:
        result[v['id']] = [P[v['id'], t].varValue for t in range(n_steps)]

    return result


# Example usage
def example_dr_optimization():
    vehicles = [
        {
            'id': 'BUS001',
            'soc': 0.8,
            'capacity': 400,  # kWh
            'max_charge': 150,
            'max_discharge': 100,
            'departure_time': 6.0,  # hours
            'required_soc': 0.9,
            'degradation_cost': 0.05  # $/kWh
        },
        {
            'id': 'BUS002',
            'soc': 0.6,
            'capacity': 400,
            'max_charge': 150,
            'max_discharge': 100,
            'departure_time': 8.0,
            'required_soc': 0.9,
            'degradation_cost': 0.05
        },
        # ... more vehicles
    ]

    dr_event = {
        'power_request': -200,  # kW (negative = discharge)
        'duration': 2.0,  # hours
        'price': 0.15  # $/kWh revenue
    }

    schedule = optimize_fleet_v2g(vehicles, dr_event)

    for vid, powers in schedule.items():
        print(f"{vid}: {[f'{p:.1f}' for p in powers]} kW")
```

---

## 4. Price Arbitrage

### 4.1 Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRICE ARBITRAGE STRATEGY                          │
│                                                                          │
│  Price (EUR/MWh)                                                         │
│       ▲                                                                  │
│   150 │              ╱╲           Peak                                   │
│       │             ╱  ╲          │                                      │
│   100 │            ╱    ╲   ╱╲    ▼                                      │
│       │     ╱╲    ╱      ╲ ╱  ╲                                          │
│    50 │    ╱  ╲  ╱        ╳    ╲                                         │
│       │───╱────╲╱─────────╱╲────╲─── Breakeven threshold                 │
│     0 │  Off-peak    Day      Evening   Night                            │
│       └────────────────────────────────────────► Time                    │
│         02    06    10    14    18    22    02                           │
│                                                                          │
│  DECISION LOGIC:                                                         │
│  ──────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  Breakeven = (1/η_roundtrip - 1) × P_avg + C_degradation                 │
│                                                                          │
│  Example:                                                                │
│    η_roundtrip = 0.91 (91% round-trip efficiency)                        │
│    P_avg = 80 EUR/MWh                                                    │
│    C_degradation = 5 EUR/MWh (battery wear)                              │
│                                                                          │
│    Breakeven = (1/0.91 - 1) × 80 + 5                                     │
│              = 0.099 × 80 + 5                                            │
│              = 7.9 + 5                                                   │
│              = 12.9 EUR/MWh                                              │
│                                                                          │
│  ACTIONS:                                                                │
│  ├─ P_current < P_avg - Breakeven/2: CHARGE at max power                 │
│  │   (Price is 67 EUR/MWh or lower)                                      │
│  │                                                                       │
│  ├─ P_current > P_avg + Breakeven/2: DISCHARGE (V2G)                     │
│  │   (Price is 93 EUR/MWh or higher)                                     │
│  │                                                                       │
│  └─ Otherwise: Follow scheduled power or standby                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Implementation

```c
typedef struct {
    // Efficiency parameters
    float eta_charge;           // Charging efficiency (0.96)
    float eta_discharge;        // Discharging efficiency (0.96)
    float eta_roundtrip;        // Combined (0.92)

    // Cost parameters
    float degradation_cost;     // EUR/MWh for battery wear
    float avg_price;            // Rolling average price (EUR/MWh)
    float breakeven_spread;     // Calculated breakeven spread

    // Price data
    float current_price;        // Current market price (EUR/MWh)
    float price_history[24];    // Last 24 hours
    int price_idx;

    // Decision
    ArbitrageAction action;
    float recommended_power;
} PriceArbitrage;

typedef enum {
    ARBITRAGE_CHARGE,
    ARBITRAGE_DISCHARGE,
    ARBITRAGE_HOLD
} ArbitrageAction;

void Arbitrage_Init(PriceArbitrage* arb) {
    arb->eta_charge = 0.96f;
    arb->eta_discharge = 0.96f;
    arb->eta_roundtrip = arb->eta_charge * arb->eta_discharge;
    arb->degradation_cost = 5.0f;  // EUR/MWh
    arb->avg_price = 80.0f;
    arb->price_idx = 0;
}

void Arbitrage_UpdatePrice(PriceArbitrage* arb, float price) {
    arb->current_price = price;
    arb->price_history[arb->price_idx] = price;
    arb->price_idx = (arb->price_idx + 1) % 24;

    // Update rolling average
    float sum = 0.0f;
    for (int i = 0; i < 24; i++) {
        sum += arb->price_history[i];
    }
    arb->avg_price = sum / 24.0f;

    // Calculate breakeven spread
    arb->breakeven_spread = (1.0f / arb->eta_roundtrip - 1.0f) * arb->avg_price
                          + arb->degradation_cost;
}

ArbitrageAction Arbitrage_Decide(PriceArbitrage* arb,
                                 float current_soc,
                                 float min_soc,
                                 float max_soc,
                                 float max_charge_power,
                                 float max_discharge_power) {
    float price_threshold_charge = arb->avg_price - arb->breakeven_spread / 2.0f;
    float price_threshold_discharge = arb->avg_price + arb->breakeven_spread / 2.0f;

    // Check if profitable to charge
    if (arb->current_price < price_threshold_charge && current_soc < max_soc) {
        arb->action = ARBITRAGE_CHARGE;
        arb->recommended_power = max_charge_power;
        return ARBITRAGE_CHARGE;
    }

    // Check if profitable to discharge (V2G)
    if (arb->current_price > price_threshold_discharge && current_soc > min_soc) {
        arb->action = ARBITRAGE_DISCHARGE;
        arb->recommended_power = -max_discharge_power;
        return ARBITRAGE_DISCHARGE;
    }

    // Not profitable either way
    arb->action = ARBITRAGE_HOLD;
    arb->recommended_power = 0.0f;
    return ARBITRAGE_HOLD;
}

float Arbitrage_CalculateProfit(PriceArbitrage* arb,
                                float energy_discharged_kwh,
                                float avg_discharge_price,
                                float energy_charged_kwh,
                                float avg_charge_price) {
    // Revenue from selling to grid
    float revenue = energy_discharged_kwh * avg_discharge_price / 1000.0f;  // EUR

    // Cost of charging
    float charge_cost = energy_charged_kwh * avg_charge_price / 1000.0f;

    // Efficiency loss (energy lost in round-trip)
    float efficiency_loss = energy_charged_kwh * (1.0f - arb->eta_roundtrip)
                          * arb->avg_price / 1000.0f;

    // Battery degradation cost
    float degradation = energy_discharged_kwh * arb->degradation_cost / 1000.0f;

    return revenue - charge_cost - efficiency_loss - degradation;
}
```

---

## 5. Fleet Aggregation

### 5.1 Priority-Based Allocation

```c
typedef struct {
    char id[16];
    float soc;                  // Current SoC (0-1)
    float capacity;             // Battery capacity (kWh)
    float max_discharge;        // Max V2G power (kW)
    uint32_t departure_time;    // Unix timestamp
    float required_soc;         // Required SoC at departure
    float battery_health;       // SoH (0-1)
    float assigned_power;       // Assigned power (kW)
    float priority_score;       // Calculated priority
} FleetVehicle;

typedef struct {
    FleetVehicle vehicles[MAX_FLEET_SIZE];
    int vehicle_count;

    // Aggregated capacity
    float total_available_discharge;
    float total_available_charge;
    float committed_power;

    // Current DR event
    bool dr_active;
    float dr_power_request;
    uint32_t dr_end_time;
} FleetAggregator;

// Calculate priority score for V2G participation
float CalculateV2GPriority(FleetVehicle* v, uint32_t current_time) {
    // Higher score = better candidate for V2G

    // Factor 1: High SoC is good (more energy to give)
    float soc_score = v->soc;

    // Factor 2: Late departure is good (more time to recharge)
    float time_to_depart = (float)(v->departure_time - current_time) / 3600.0f;  // hours
    float depart_score = fminf(time_to_depart / 8.0f, 1.0f);  // Cap at 8 hours

    // Factor 3: Good battery health is preferred
    float health_score = v->battery_health;

    // Factor 4: Check if SoC allows V2G (above minimum + buffer for return)
    float soc_margin = v->soc - v->required_soc - 0.1f;  // 10% buffer
    if (soc_margin < 0) {
        return 0.0f;  // Cannot participate
    }
    float margin_score = fminf(soc_margin / 0.3f, 1.0f);  // Cap at 30% margin

    // Weighted combination
    v->priority_score = soc_score * 0.3f +
                        depart_score * 0.3f +
                        health_score * 0.2f +
                        margin_score * 0.2f;

    return v->priority_score;
}

// Compare function for sorting (descending by priority)
int CompareByPriority(const void* a, const void* b) {
    FleetVehicle* va = (FleetVehicle*)a;
    FleetVehicle* vb = (FleetVehicle*)b;
    if (vb->priority_score > va->priority_score) return 1;
    if (vb->priority_score < va->priority_score) return -1;
    return 0;
}

void Fleet_DistributeDRPower(FleetAggregator* fleet, float dr_power_request) {
    uint32_t now = GetCurrentTime();

    // Calculate priorities for all vehicles
    for (int i = 0; i < fleet->vehicle_count; i++) {
        CalculateV2GPriority(&fleet->vehicles[i], now);
        fleet->vehicles[i].assigned_power = 0.0f;  // Reset
    }

    // Sort by priority (highest first)
    qsort(fleet->vehicles, fleet->vehicle_count,
          sizeof(FleetVehicle), CompareByPriority);

    // Allocate power starting from highest priority
    float remaining = fabsf(dr_power_request);

    for (int i = 0; i < fleet->vehicle_count && remaining > 0; i++) {
        FleetVehicle* v = &fleet->vehicles[i];

        if (v->priority_score <= 0.0f) continue;  // Skip ineligible

        // Calculate max this vehicle can contribute
        float soc_margin = v->soc - v->required_soc - 0.1f;
        float energy_available = soc_margin * v->capacity;  // kWh

        // Assume DR event is 1 hour, calculate power limit from energy
        float power_from_energy = energy_available;  // kW for 1 hour

        float assignable = fminf(v->max_discharge, power_from_energy);
        assignable = fminf(assignable, remaining);

        // Assign power (negative for discharge)
        v->assigned_power = -assignable;
        remaining -= assignable;

        // Send command to vehicle
        SendPowerCommand(v->id, v->assigned_power);
    }

    fleet->committed_power = fabsf(dr_power_request) - remaining;
    fleet->dr_active = true;
    fleet->dr_power_request = dr_power_request;
}
```

---

## 6. Anomaly Detection

### 6.1 Autoencoder Architecture

```python
import tensorflow as tf
from tensorflow.keras import layers, models

def create_anomaly_detector():
    """Autoencoder for detecting anomalies in V2G operation."""

    # Input features (per timestep):
    # - Grid frequency, voltage, power
    # - Module temperatures
    # - Current, efficiency
    input_dim = 10

    # Encoder
    encoder_input = layers.Input(shape=(input_dim,))
    x = layers.Dense(32, activation='relu')(encoder_input)
    x = layers.Dense(16, activation='relu')(x)
    encoded = layers.Dense(8, activation='relu')(x)

    # Decoder
    x = layers.Dense(16, activation='relu')(encoded)
    x = layers.Dense(32, activation='relu')(x)
    decoded = layers.Dense(input_dim, activation='linear')(x)

    autoencoder = models.Model(encoder_input, decoded)
    autoencoder.compile(optimizer='adam', loss='mse')

    return autoencoder

def detect_anomaly(model, sample, threshold):
    """Detect if a sample is anomalous based on reconstruction error."""
    reconstruction = model.predict(sample.reshape(1, -1))
    mse = np.mean((sample - reconstruction) ** 2)
    return mse > threshold, mse
```

### 6.2 Edge Implementation

```c
// Simplified anomaly detection on STM32
typedef struct {
    float feature_means[10];
    float feature_stds[10];
    float threshold;

    // Simple statistical anomaly detection
    float recent_errors[100];
    int error_idx;
    float mean_error;
    float std_error;
} AnomalyDetector;

bool Anomaly_Detect(AnomalyDetector* det, float* features, int n_features) {
    // Normalize features
    float normalized[10];
    for (int i = 0; i < n_features; i++) {
        normalized[i] = (features[i] - det->feature_means[i]) / det->feature_stds[i];
    }

    // Simple reconstruction error (use distance from mean as proxy)
    float error = 0.0f;
    for (int i = 0; i < n_features; i++) {
        error += normalized[i] * normalized[i];
    }
    error = sqrtf(error / n_features);

    // Update running statistics
    det->recent_errors[det->error_idx] = error;
    det->error_idx = (det->error_idx + 1) % 100;

    // Calculate mean and std of errors
    float sum = 0.0f, sum_sq = 0.0f;
    for (int i = 0; i < 100; i++) {
        sum += det->recent_errors[i];
        sum_sq += det->recent_errors[i] * det->recent_errors[i];
    }
    det->mean_error = sum / 100.0f;
    det->std_error = sqrtf(sum_sq / 100.0f - det->mean_error * det->mean_error);

    // Anomaly if error > mean + 3*std
    float dynamic_threshold = det->mean_error + 3.0f * det->std_error;
    return error > fmaxf(dynamic_threshold, det->threshold);
}
```

---

## 7. References

- **TensorFlow Lite for Microcontrollers** - Edge ML deployment
- **ENTSO-E Transparency Platform** - European grid data
- **PuLP Documentation** - Linear programming in Python
- **RAFT Consensus Algorithm** - Distributed coordination
- **ISO 15118-20** - V2G communication protocol
