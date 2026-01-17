# ROJ Research Synthesis

Applied research from swarm intelligence, neurosymbolic AI, and distributed systems for the ROJ coordination layer.

**Target platform:** EK3 modules on CAN-FD (5 Mbps), STM32G474 (128KB SRAM)

---

## 1. Distributed Coordination Algorithms

### 1.1 CRDTs: Conflict-Free Replicated Data Types

CRDTs provide eventual consistency without coordination - ideal for swarm state.

**Key CRDT Types for ROJ:**

```
G-COUNTER (Grow-only Counter)
─────────────────────────────

State: vector of per-node counts
Merge: element-wise maximum

Node A: [5, 0, 0]    Node B: [3, 2, 0]
         ↓ merge ↓
Result:  [5, 2, 0]   Total = 7

Use case: Cumulative energy delivered by all modules
```

```c
// G-Counter implementation
typedef struct {
    uint32_t counts[JEZGRO_MAX_NODES];
    uint8_t node_count;
} gcounter_t;

void gcounter_increment(gcounter_t *gc, uint8_t node_id) {
    gc->counts[node_id]++;
}

void gcounter_merge(gcounter_t *dst, const gcounter_t *src) {
    for (int i = 0; i < dst->node_count; i++) {
        if (src->counts[i] > dst->counts[i]) {
            dst->counts[i] = src->counts[i];
        }
    }
}

uint32_t gcounter_value(const gcounter_t *gc) {
    uint32_t sum = 0;
    for (int i = 0; i < gc->node_count; i++) {
        sum += gc->counts[i];
    }
    return sum;
}
```

```
PN-COUNTER (Positive-Negative Counter)
──────────────────────────────────────

State: two G-Counters (P for increments, N for decrements)
Value: P.value() - N.value()

Use case: Active module count (joins and leaves)
```

```
OR-SET (Observed-Remove Set)
────────────────────────────

State: map of (element → set of unique tags)
Add: generate unique tag, add (element, tag) pair
Remove: remove all tags for element
Merge: union of all (element, tag) pairs

Use case: Set of fault codes across fleet
```

```c
// OR-Set for fault tracking
typedef struct {
    uint16_t fault_code;
    uint8_t  source_node;
    uint32_t unique_tag;  // Monotonic counter per node
} fault_entry_t;

typedef struct {
    fault_entry_t entries[MAX_FAULTS];
    uint8_t count;
} fault_orset_t;

// Add fault (generates unique tag)
void orset_add_fault(fault_orset_t *set, uint8_t node, uint16_t fault) {
    fault_entry_t *e = &set->entries[set->count++];
    e->fault_code = fault;
    e->source_node = node;
    e->unique_tag = generate_unique_tag(node);
}

// Remove fault (removes all matching entries)
void orset_remove_fault(fault_orset_t *set, uint16_t fault) {
    for (int i = 0; i < set->count; i++) {
        if (set->entries[i].fault_code == fault) {
            set->entries[i] = set->entries[--set->count];
            i--;  // Re-check this position
        }
    }
}
```

### 1.2 Gossip Protocols

**SWIM Protocol (Scalable Weakly-consistent Infection-style Membership):**

```
SWIM MEMBERSHIP PROTOCOL:
─────────────────────────

Period T (e.g., 500ms):
1. Select random node j
2. Send PING to j
3. If ACK within timeout:
   - j is alive
4. Else:
   - Select k random nodes
   - Ask them to PING-REQ j
   - If any ACK: j is alive
   - Else: mark j as SUSPECT

Message complexity: O(1) per node per period
Detection time: O(log n) protocol periods

         ┌─────┐
         │Node1│
         └──┬──┘
      PING  │  ACK
            ▼
         ┌─────┐
         │Node2│ ←── Selected randomly
         └─────┘
```

```c
// SWIM-like failure detection for ROJ
typedef enum {
    NODE_ALIVE,
    NODE_SUSPECT,
    NODE_DEAD
} node_status_t;

typedef struct {
    uint8_t node_id;
    node_status_t status;
    tick_t last_heartbeat;
    uint8_t suspect_count;
} node_info_t;

void swim_check_node(uint8_t target_node) {
    if (send_ping(target_node)) {
        nodes[target_node].status = NODE_ALIVE;
        nodes[target_node].last_heartbeat = jezgro_get_ticks();
        return;
    }

    // Direct ping failed - try indirect
    uint8_t helpers[3];
    select_random_nodes(helpers, 3, target_node);

    for (int i = 0; i < 3; i++) {
        if (send_ping_req(helpers[i], target_node)) {
            nodes[target_node].status = NODE_ALIVE;
            return;
        }
    }

    // Mark as suspect
    if (nodes[target_node].status == NODE_ALIVE) {
        nodes[target_node].status = NODE_SUSPECT;
        nodes[target_node].suspect_count = 0;
    } else if (++nodes[target_node].suspect_count > SUSPECT_THRESHOLD) {
        nodes[target_node].status = NODE_DEAD;
        roj_handle_node_failure(target_node);
    }
}
```

### 1.3 Stigmergy Enhancements

ROJ already uses stigmergy (SWARM CORE). Research suggests:

**Exponential Decay with Reinforcement:**

```
STIGMERGY TAG DYNAMICS:
───────────────────────

Basic decay:
  value(t) = value(0) × exp(-t/τ)

With reinforcement:
  value(t) = value(t-1) × exp(-dt/τ) + reinforcement

τ (tau): decay time constant
- Short τ (~1s): fast adaptation, noisy
- Long τ (~10s): stable, slow response

RECOMMENDATIONS:
- Thermal tags: τ = 5s (moderate response)
- Fault tags: τ = 30s (persistent until cleared)
- Load tags: τ = 2s (fast tracking)
```

```c
// Enhanced stigmergy with adaptive decay
typedef struct {
    uint16_t tag_type;
    float value;
    tick_t last_update;
    float tau;  // Decay constant (ms)
} stig_tag_t;

float stig_get_value(stig_tag_t *tag) {
    tick_t now = jezgro_get_ticks();
    tick_t dt = now - tag->last_update;

    // Exponential decay
    float decay = expf(-(float)dt / tag->tau);
    return tag->value * decay;
}

void stig_reinforce(stig_tag_t *tag, float amount) {
    // First decay to current value
    tag->value = stig_get_value(tag);
    tag->last_update = jezgro_get_ticks();

    // Then add reinforcement
    tag->value += amount;
}
```

---

## 2. Task Allocation Algorithms

### 2.1 Threshold-Based Model (Zero Communication!)

From social insect division of labor (Bonabeau, Theraulaz, Deneubourg):

```
RESPONSE THRESHOLD MODEL:
─────────────────────────

Task stimulus: s (e.g., temperature deviation)
Agent threshold: θ (individual, can vary)
Response probability:

         s^n
P(s) = ─────────
       s^n + θ^n

Where n controls steepness (typically n=2)

      P(s)
       ↑
     1 │            ╭────────
       │           ╱
       │          ╱
     0.5│─ ─ ─ ─ ╱
       │        ╱
       │       ╱
     0 └──────┴──────────────→ s
               θ     stimulus
```

**Implementation for ROJ power balancing:**

```c
// Threshold-based task allocation
typedef struct {
    float threshold;      // Individual threshold
    float threshold_adapt; // Adaptation rate
} agent_params_t;

// Probability of responding to stimulus
float response_probability(float stimulus, float threshold) {
    const float n = 2.0f;  // Steepness
    float s_n = powf(stimulus, n);
    float t_n = powf(threshold, n);
    return s_n / (s_n + t_n);
}

// Decide whether to take on extra load
bool should_increase_power(agent_params_t *agent, float thermal_margin) {
    // Stimulus: how much thermal headroom we have
    float stimulus = thermal_margin / THERMAL_MAX_MARGIN;

    float prob = response_probability(stimulus, agent->threshold);

    // Probabilistic decision
    return (random_float() < prob);
}

// Threshold adaptation (learning from success/failure)
void adapt_threshold(agent_params_t *agent, bool task_succeeded) {
    if (task_succeeded) {
        // Lower threshold = more willing to take tasks
        agent->threshold *= (1.0f - agent->threshold_adapt);
    } else {
        // Raise threshold = less willing
        agent->threshold *= (1.0f + agent->threshold_adapt);
    }
    agent->threshold = clamp(agent->threshold, 0.1f, 0.9f);
}
```

**Advantages over Market-Based:**
| Aspect | Market-Based | Threshold-Based |
|--------|--------------|-----------------|
| Communication | O(n) per task | Zero |
| Latency | Negotiation time | Immediate |
| Failure handling | Re-auction | Natural redistribution |
| Complexity | High | Low |

### 2.2 Market-Based (Contract Net)

For comparison, and use when explicit coordination needed:

```
CONTRACT NET PROTOCOL:
──────────────────────

1. ANNOUNCE: Manager broadcasts task
2. BID: Contractors submit capabilities
3. AWARD: Manager selects winner
4. EXECUTE: Winner performs task
5. REPORT: Winner reports completion

Use when:
- Task requires specific capabilities
- Explicit commitment needed
- Audit trail required
```

---

## 3. Neurosymbolic Edge AI

### 3.1 DeepProbLog Concepts

Neural predicates connect neural networks to logical reasoning:

```prolog
% Traditional Prolog
is_overheated(Module) :- temperature(Module, T), T > 150.

% DeepProbLog: neural predicate for fault classification
nn(fault_classifier, [SensorData], FaultType, [normal, thermal, electrical]).

% Combined reasoning
needs_shutdown(Module) :-
    fault_classifier(Module, SensorData, thermal),
    temperature(Module, T),
    T > 140.
```

**For ROJ (simplified):**
```c
// Neural + symbolic hybrid
typedef struct {
    float nn_confidence;      // From neural network
    bool  symbolic_rule_match; // From rule engine
    float combined_score;
} fault_assessment_t;

fault_assessment_t assess_fault(sensor_data_t *data) {
    fault_assessment_t result;

    // Neural: pattern recognition
    result.nn_confidence = tinyml_classify_fault(data);

    // Symbolic: rule-based checks
    result.symbolic_rule_match =
        (data->temperature > TEMP_LIMIT) ||
        (data->current > CURRENT_LIMIT) ||
        (data->voltage < VOLTAGE_MIN);

    // Combine: AND for high confidence
    if (result.nn_confidence > 0.8f && result.symbolic_rule_match) {
        result.combined_score = result.nn_confidence;
    } else if (result.symbolic_rule_match) {
        result.combined_score = 0.6f;  // Rule match but NN uncertain
    } else if (result.nn_confidence > 0.9f) {
        result.combined_score = 0.5f;  // NN confident but no rule
    } else {
        result.combined_score = 0.0f;  // Neither confident
    }

    return result;
}
```

### 3.2 Lightweight Symbolic Reasoners

**Gap Analysis:** No production-ready reasoner for <64KB RAM

**Options:**
1. **Micro-Prolog** - Custom, ~10KB, limited unification
2. **Rule tables** - Compiled rules, no dynamic reasoning
3. **Decision trees** - Distilled from expert system

**Practical approach for ROJ:**

```c
// Compiled rule table (no runtime reasoning engine)
typedef struct {
    uint16_t condition_mask;  // Which conditions to check
    uint16_t condition_values; // Expected values
    uint8_t  action;          // Action to take
    uint8_t  priority;        // Rule priority
} rule_t;

// Conditions (bit positions)
#define COND_TEMP_HIGH     (1 << 0)
#define COND_TEMP_LOW      (1 << 1)
#define COND_CURRENT_HIGH  (1 << 2)
#define COND_VOLTAGE_LOW   (1 << 3)
#define COND_FAULT_PEER    (1 << 4)

// Pre-compiled rules
static const rule_t rules[] = {
    // If temp high AND current high -> reduce power
    { COND_TEMP_HIGH | COND_CURRENT_HIGH,
      COND_TEMP_HIGH | COND_CURRENT_HIGH,
      ACTION_REDUCE_POWER, 10 },

    // If voltage low -> increase power (support grid)
    { COND_VOLTAGE_LOW, COND_VOLTAGE_LOW,
      ACTION_INCREASE_POWER, 5 },

    // If peer fault -> redistribute load
    { COND_FAULT_PEER, COND_FAULT_PEER,
      ACTION_REDISTRIBUTE, 8 },
};

uint8_t evaluate_rules(uint16_t conditions) {
    uint8_t best_action = ACTION_NONE;
    uint8_t best_priority = 0;

    for (int i = 0; i < ARRAY_SIZE(rules); i++) {
        uint16_t masked = conditions & rules[i].condition_mask;
        if (masked == rules[i].condition_values) {
            if (rules[i].priority > best_priority) {
                best_priority = rules[i].priority;
                best_action = rules[i].action;
            }
        }
    }
    return best_action;
}
```

### 3.3 TinyML for ROJ

**Use cases:**
1. **Anomaly detection** - Detect unusual sensor patterns
2. **Thermal prediction** - Predict temperature trajectory
3. **SOH estimation** - Battery health from impedance

**Model architecture for anomaly detection:**

```
AUTOENCODER FOR ANOMALY DETECTION:
──────────────────────────────────

Input (10 features):
- Temperature
- Current
- Voltage
- Power
- PWM duty
- Gate drive voltage
- Fan speed
- Ambient temp
- DC bus voltage
- Grid frequency

Architecture:
Input(10) → Dense(8) → Dense(4) → Dense(8) → Output(10)
            ReLU       ReLU       ReLU

Anomaly score: MSE(input, reconstructed)
If MSE > threshold → anomaly

Model size: ~2KB (INT8 quantized)
Inference: ~0.5ms on Cortex-M4
```

```c
// TinyML anomaly detection
#define ANOMALY_THRESHOLD 0.05f

float detect_anomaly(float *sensor_vector) {
    // Run autoencoder
    float reconstructed[10];
    autoencoder_inference(sensor_vector, reconstructed);

    // Compute MSE
    float mse = 0.0f;
    for (int i = 0; i < 10; i++) {
        float diff = sensor_vector[i] - reconstructed[i];
        mse += diff * diff;
    }
    mse /= 10.0f;

    return mse;  // Higher = more anomalous
}

// Periodic check
void roj_anomaly_task(void *arg) {
    float sensors[10];
    collect_sensor_data(sensors);

    float score = detect_anomaly(sensors);

    if (score > ANOMALY_THRESHOLD) {
        // Create stigmergy tag
        stig_tag_t tag = {
            .tag_type = TAG_ANOMALY,
            .value = score,
            .tau = 10000  // 10s decay
        };
        broadcast_stigmergy_tag(&tag);
    }
}
```

---

## 4. Multi-Agent Reinforcement Learning (MARL)

### 4.1 CTDE: Centralized Training, Decentralized Execution

```
CTDE PARADIGM:
──────────────

TRAINING (offline, cloud):
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │         CENTRALIZED VALUE FUNCTION                   │   │
│  │         (sees all agent observations)                │   │
│  └───────────────────────┬─────────────────────────────┘   │
│                          │                                  │
│     ┌────────────────────┼────────────────────┐            │
│     ▼                    ▼                    ▼            │
│  ┌─────┐             ┌─────┐             ┌─────┐          │
│  │ π_1 │             │ π_2 │             │ π_n │          │
│  └─────┘             └─────┘             └─────┘          │
│  Agent 1             Agent 2             Agent n          │
└─────────────────────────────────────────────────────────────┘

EXECUTION (online, edge):
┌─────────────────────────────────────────────────────────────┐
│  ┌─────┐             ┌─────┐             ┌─────┐          │
│  │ π_1 │             │ π_2 │             │ π_n │          │
│  └──┬──┘             └──┬──┘             └──┬──┘          │
│     │                   │                   │              │
│     ▼                   ▼                   ▼              │
│  ┌─────┐             ┌─────┐             ┌─────┐          │
│  │Obs_1│             │Obs_2│             │Obs_n│          │
│  └─────┘             └─────┘             └─────┘          │
│                                                            │
│  (Each agent uses only its local observation)             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 QMIX Value Decomposition

For credit assignment in cooperative settings:

```
QMIX DECOMPOSITION:
───────────────────

Q_tot = f(Q_1, Q_2, ..., Q_n; state)

Constraint: ∂Q_tot/∂Q_i ≥ 0 (monotonicity)

This ensures:
argmax(Q_tot) = (argmax(Q_1), ..., argmax(Q_n))

→ Decentralized action selection is globally optimal!
```

**For ROJ power allocation:**

```python
# Training script (Python, runs offline)
class ROJQMixer(nn.Module):
    def __init__(self, n_agents, state_dim):
        self.hyper_w = nn.Linear(state_dim, n_agents * embed_dim)
        self.hyper_b = nn.Linear(state_dim, embed_dim)

    def forward(self, agent_qs, state):
        # agent_qs: [batch, n_agents]
        # state: [batch, state_dim]

        # Generate mixing weights (non-negative via abs)
        w = torch.abs(self.hyper_w(state))  # [batch, n_agents * embed]
        b = self.hyper_b(state)             # [batch, embed]

        # Mix agent Q-values
        q_tot = torch.sum(w * agent_qs, dim=-1) + b
        return q_tot
```

**Deployed agent (C, on MCU):**

```c
// Pre-trained Q-network weights (from QMIX training)
extern const float q_weights_layer1[OBS_DIM][HIDDEN_DIM];
extern const float q_weights_layer2[HIDDEN_DIM][ACTION_DIM];

// Local Q-function
float compute_q_values(float *observation, float *q_out) {
    float hidden[HIDDEN_DIM];

    // Layer 1: ReLU
    for (int h = 0; h < HIDDEN_DIM; h++) {
        float sum = 0.0f;
        for (int i = 0; i < OBS_DIM; i++) {
            sum += observation[i] * q_weights_layer1[i][h];
        }
        hidden[h] = fmaxf(0.0f, sum);  // ReLU
    }

    // Layer 2: Linear
    for (int a = 0; a < ACTION_DIM; a++) {
        float sum = 0.0f;
        for (int h = 0; h < HIDDEN_DIM; h++) {
            sum += hidden[h] * q_weights_layer2[h][a];
        }
        q_out[a] = sum;
    }
}

// Select action (greedy)
int select_action(float *observation) {
    float q_values[ACTION_DIM];
    compute_q_values(observation, q_values);

    int best_action = 0;
    float best_q = q_values[0];
    for (int a = 1; a < ACTION_DIM; a++) {
        if (q_values[a] > best_q) {
            best_q = q_values[a];
            best_action = a;
        }
    }
    return best_action;
}
```

### 4.3 Communication Learning (TarMAC, IC3Net)

**TarMAC:** Targeted communication via attention

```
TarMAC COMMUNICATION:
─────────────────────

1. Each agent generates:
   - Message value: v_i (what to say)
   - Signature query: k_i (who to talk to)

2. Receivers compute attention:
   a_ij = softmax(q_j · k_i)

3. Message aggregation:
   m_j = Σ_i a_ij × v_i

4. Policy uses observation + received messages
```

**IC3Net:** Learn *when* to communicate

```c
// IC3Net-inspired gating
typedef struct {
    bool gate_open;        // Should communicate?
    float message[MSG_DIM]; // Message content if gating open
} comm_decision_t;

comm_decision_t decide_communication(float *observation) {
    comm_decision_t result;

    // Gate network (small MLP)
    float gate_score = gate_network_inference(observation);

    // Probabilistic gating (during training)
    // Deterministic (threshold) during deployment
    result.gate_open = (gate_score > GATE_THRESHOLD);

    if (result.gate_open) {
        // Generate message only if needed
        message_encoder_inference(observation, result.message);
    }

    return result;
}
```

---

## 5. Sensor Fusion

### 5.1 Dempster-Shafer Belief Fusion

For combining uncertain evidence from multiple sources:

```
DEMPSTER-SHAFER THEORY:
───────────────────────

Frame of discernment: Θ = {normal, fault_thermal, fault_electrical}

Basic Probability Assignment (BPA):
m(A) ∈ [0, 1], Σ m(A) = 1

Combination rule (Dempster):
m_12(A) = (1/K) × Σ_{B∩C=A} m_1(B) × m_2(C)

Where K = 1 - Σ_{B∩C=∅} m_1(B) × m_2(C) (normalization)

```

```c
// Dempster-Shafer for fault fusion
typedef struct {
    float m_normal;
    float m_thermal;
    float m_electrical;
    float m_any;  // Uncertainty (Θ)
} bpa_t;

// Combine two BPAs
bpa_t ds_combine(bpa_t *m1, bpa_t *m2) {
    bpa_t result = {0};

    // All combinations where B ∩ C = A
    // (Simplified for 3 hypotheses)

    float conflict = 0.0f;

    // normal ∩ normal = normal
    result.m_normal += m1->m_normal * m2->m_normal;
    result.m_normal += m1->m_normal * m2->m_any;
    result.m_normal += m1->m_any * m2->m_normal;

    // thermal ∩ thermal = thermal
    result.m_thermal += m1->m_thermal * m2->m_thermal;
    result.m_thermal += m1->m_thermal * m2->m_any;
    result.m_thermal += m1->m_any * m2->m_thermal;

    // electrical ∩ electrical = electrical
    result.m_electrical += m1->m_electrical * m2->m_electrical;
    result.m_electrical += m1->m_electrical * m2->m_any;
    result.m_electrical += m1->m_any * m2->m_electrical;

    // any ∩ any = any
    result.m_any = m1->m_any * m2->m_any;

    // Conflict: normal ∩ thermal, etc.
    conflict += m1->m_normal * m2->m_thermal;
    conflict += m1->m_thermal * m2->m_normal;
    // ... other conflicts

    // Normalize
    float K = 1.0f - conflict;
    if (K > 0.001f) {
        result.m_normal /= K;
        result.m_thermal /= K;
        result.m_electrical /= K;
        result.m_any /= K;
    }

    return result;
}
```

### 5.2 Distributed Kalman Filtering

For continuous state estimation across swarm:

```
DISTRIBUTED KALMAN FILTER:
──────────────────────────

Each agent maintains:
- Local estimate: x̂_i
- Local covariance: P_i

Consensus step (after local update):
x̂_i(k+1) = x̂_i(k) + ε × Σ_j∈neighbors (x̂_j(k) - x̂_i(k))

Where ε is consensus gain (0 < ε < 1/max_degree)

Converges to global estimate with O(log n) iterations.
```

```c
// Distributed Kalman for thermal estimation
typedef struct {
    float estimate;     // Estimated temperature
    float variance;     // Uncertainty
    float kalman_gain;
} dkf_state_t;

// Local measurement update
void dkf_local_update(dkf_state_t *state, float measurement, float meas_var) {
    // Standard Kalman update
    float innovation = measurement - state->estimate;
    state->kalman_gain = state->variance / (state->variance + meas_var);
    state->estimate += state->kalman_gain * innovation;
    state->variance *= (1.0f - state->kalman_gain);
}

// Consensus step (after exchanging estimates with neighbors)
void dkf_consensus_step(dkf_state_t *state, float *neighbor_estimates, int n_neighbors) {
    const float epsilon = 0.1f;  // Consensus gain

    float sum_diff = 0.0f;
    for (int i = 0; i < n_neighbors; i++) {
        sum_diff += neighbor_estimates[i] - state->estimate;
    }

    state->estimate += epsilon * sum_diff;
}
```

### 5.3 Graph Attention Networks for Agent Communication

**Concept:** Treat agents as nodes, learn attention weights for message aggregation.

```
GAT MESSAGE PASSING:
────────────────────

For each agent i:
1. Compute attention coefficients:
   α_ij = softmax_j(LeakyReLU(a^T [W×h_i || W×h_j]))

2. Aggregate neighbor features:
   h'_i = σ(Σ_j α_ij × W × h_j)

Where:
- h_i: agent i's hidden state
- W: learnable weight matrix
- a: attention mechanism
- ||: concatenation
```

**Simplified for MCU deployment:**

```c
// Pre-computed attention weights (from training)
// Assumes fixed neighborhood structure
extern const float attention_weights[MAX_NEIGHBORS];

// Simplified GAT aggregation
void aggregate_neighbor_info(float *my_hidden, float neighbor_hidden[][HIDDEN_DIM],
                             int n_neighbors, float *output) {
    // Initialize output
    memset(output, 0, HIDDEN_DIM * sizeof(float));

    // Weighted sum of neighbor features
    for (int n = 0; n < n_neighbors; n++) {
        float weight = attention_weights[n];  // Pre-computed
        for (int h = 0; h < HIDDEN_DIM; h++) {
            output[h] += weight * neighbor_hidden[n][h];
        }
    }

    // Non-linearity
    for (int h = 0; h < HIDDEN_DIM; h++) {
        output[h] = fmaxf(0.0f, output[h]);  // ReLU
    }
}
```

---

## 6. Research Roadmap

### Priority 1: CRDT Implementation for ROJ State (Near-term)

**Goal:** Replace custom state sync with CRDTs for fault tolerance

**Implementation:**
1. G-Counter for cumulative metrics (energy, runtime)
2. PN-Counter for active module count
3. OR-Set for fault codes

**Effort:** 2 weeks
**Impact:** High (eliminates state inconsistency bugs)

### Priority 2: Threshold-Based Task Allocation (Near-term)

**Goal:** Zero-communication power balancing

**Implementation:**
1. Define stimulus functions (thermal margin, efficiency)
2. Implement response threshold model
3. Add threshold adaptation

**Effort:** 1-2 weeks
**Impact:** High (reduces CAN traffic by ~50%)

### Priority 3: TinyML Anomaly Detection (Medium-term)

**Goal:** Edge-based fault prediction

**Implementation:**
1. Collect training data from simulation
2. Train autoencoder (Python)
3. Quantize to INT8
4. Integrate with JEZGRO

**Effort:** 1 month
**Impact:** Medium (early fault detection)

### Priority 4: Lightweight Symbolic Reasoner (Medium-term)

**Goal:** Rule-based decision support

**Implementation:**
1. Define rule schema (conditions → actions)
2. Compile rules to lookup tables
3. Integrate with ROJ coordinator

**Effort:** 2 weeks
**Impact:** Medium (explainable decisions)

### Priority 5: MARL for Power Allocation (Long-term)

**Goal:** Learned coordination policy

**Implementation:**
1. Build simulation environment
2. Train QMIX offline
3. Deploy trained Q-networks to MCUs
4. Evaluate vs hand-tuned droop

**Effort:** 3 months
**Impact:** Potentially high (adaptive optimization)

### Priority 6: Dempster-Shafer Fault Fusion (Long-term)

**Goal:** Multi-sensor fault diagnosis

**Implementation:**
1. Define frame of discernment
2. Implement BPA combination
3. Integrate with multiple sensors

**Effort:** 3 weeks
**Impact:** Medium (improved fault classification)

---

## 7. Key References

### Swarm Intelligence
1. Bonabeau et al. "Swarm Intelligence: From Natural to Artificial Systems" (1999)
2. Dorigo & Stützle. "Ant Colony Optimization" (2004)
3. Nagpal et al. "Programmable Self-Assembly in a Thousand-Robot Swarm" (Science 2014)

### CRDTs & Distributed Systems
4. Shapiro et al. "Conflict-free Replicated Data Types" (2011)
5. Das et al. "SWIM: Scalable Weakly-consistent Infection-style Membership Protocol" (2002)

### Multi-Agent RL
6. Rashid et al. "QMIX: Monotonic Value Function Factorisation" (ICML 2018)
7. Foerster et al. "Learning to Communicate with Deep Multi-Agent Reinforcement Learning" (NeurIPS 2016)

### Neurosymbolic AI
8. Manhaeve et al. "DeepProbLog: Neural Probabilistic Logic Programming" (NeurIPS 2018)
9. Garcez et al. "Neurosymbolic AI: The 3rd Wave" (2023)

### Sensor Fusion
10. Shafer, G. "A Mathematical Theory of Evidence" (1976)
11. Olfati-Saber. "Distributed Kalman Filtering for Sensor Networks" (CDC 2007)

### Tools & Frameworks
- TensorFlow Lite Micro: https://www.tensorflow.org/lite/microcontrollers
- PySyft (Federated Learning): https://github.com/OpenMined/PySyft
- RLlib (MARL): https://docs.ray.io/en/latest/rllib/

---

*Document: EK-REF-ROJ-001*
*Version: 1.0*
*Date: 2026-01-06*
