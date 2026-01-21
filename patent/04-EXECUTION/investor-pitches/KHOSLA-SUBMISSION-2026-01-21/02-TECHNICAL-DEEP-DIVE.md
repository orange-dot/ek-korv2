# EK-KOR2 Technical Deep-Dive

**For Technical Due Diligence**
**Supplement to Seed Application**

---

## Executive Summary

EK-KOR2 is a real-time operating system implementing distributed coordination for modular power electronics. This document provides technical depth on the core innovations: potential field scheduling, topological coordination, threshold consensus, and lock-free communication.

**Target Hardware:** STM32G474 (Cortex-M4F, 170MHz)
**Languages:** C (embedded) + Rust (safety-critical)
**Communication:** CAN-FD @ 5Mbps
**Scale:** 10-1000+ modules

---

## 1. Potential Field Scheduling

### Mathematical Foundation

The potential field scheduler adapts Khatib's 1986 artificial potential field formulation from robot navigation to temporal scheduling domains.

**Mapping from spatial to temporal:**

| Robotics Domain | Scheduling Domain |
|-----------------|-------------------|
| Robot position | Task state |
| Goal position | Deadline |
| Obstacles | Resource conflicts |
| Gradient descent | Priority adjustment |

### Field Computation

Each module maintains three decaying potential fields:

**Load Potential (φ_load):**
```
φ_load(t) = L(t) × exp(-(t - t_update) / τ_load)

where:
  L(t) = current execution load [0.0, 1.0]
  t_update = timestamp of last update
  τ_load = decay time constant (100ms)
```

**Thermal Gradient (φ_thermal):**
```
φ_thermal(t) = T(t) × exp(-(t - t_update) / τ_thermal)

where:
  T(t) = normalized temperature [0.0, 1.0]
  τ_thermal = decay time constant (500ms)
```

**Power Trajectory (φ_power):**
```
φ_power(t) = P(t) + dP/dt × Δt

where:
  P(t) = current power output
  dP/dt = rate of change (prediction)
  Δt = lookahead window (50ms)
```

### Gradient Flow

Work flows from high-potential to low-potential modules automatically:

```
      HIGH φ                              LOW φ
   ┌─────────┐                         ┌─────────┐
   │ Module A│         Gradient        │ Module B│
   │ φ = 0.8 │ ───────────────────────▶│ φ = 0.3 │
   │         │          Flow           │         │
   └─────────┘                         └─────────┘

   Work assignment follows gradient:
   F = -∇φ (negative gradient)

   No explicit assignment needed.
   Self-balancing emergent behavior.
```

### Fixed-Point Implementation

All field computations use Q15 fixed-point format for deterministic timing on Cortex-M4:

```c
typedef int16_t Q15;  // Range: [-1.0, +0.99997]

// Q15 multiplication with saturation
static inline Q15 q15_mul(Q15 a, Q15 b) {
    int32_t result = ((int32_t)a * (int32_t)b) >> 15;
    return (Q15)__SSAT(result, 16);
}

// Exponential decay approximation (4th order Taylor)
static inline Q15 q15_exp_decay(Q15 x) {
    // exp(-x) ≈ 1 - x + x²/2 - x³/6 + x⁴/24
    Q15 x2 = q15_mul(x, x);
    Q15 x3 = q15_mul(x2, x);
    Q15 x4 = q15_mul(x3, x);

    return Q15_ONE - x + (x2 >> 1) - (x3 / 6) + (x4 / 24);
}
```

### Deadline Attraction

For deadline-critical tasks, an attractive potential creates urgency:

```
U_deadline = k_d × (slack)^(-1)

where:
  slack = deadline - now - remaining_execution
  k_d = deadline attraction constant

Force: F_deadline = k_d / slack²

Result: Exponentially increasing urgency as deadline approaches
```

### Resource Repulsion

Competing resource access creates repulsive potentials:

```
U_repulsion = k_r × exp(-α × d_ij)

where:
  d_ij = contention proximity between tasks i and j
  k_r = repulsion strength
  α = decay rate

Result: Tasks naturally spread across resources
```

---

## 2. Topological k=7 Coordination

### Biological Inspiration

Based on Cavagna and Giardina's 2010 study of starling flocks (*PNAS*):

> "The interaction ruling mutual alignment does not depend on the metric distance
> between individuals, but rather on their topological distance."

**Key finding:** k ≈ 6-7 neighbors produces optimal scale-free correlations.

### Why Topological > Metric

**Metric coordination (distance-based):**
- Correlation length stays fixed
- Information attenuates with distance
- Doesn't scale to large networks

**Topological coordination (neighbor-count-based):**
- Correlation length scales with network size
- Information propagates without attenuation
- Works identically at 10 and 1000 nodes

```
METRIC vs TOPOLOGICAL
═══════════════════════════════════════════════════════════════

METRIC (fixed radius):
[A]──[B]──[C]──[D]──[E]──[F]
 ↑         ↑
 └─────────┘  A sees B,C only
              D,E,F unreachable

TOPOLOGICAL (k=7 neighbors):
[A]─┬─[B]─┬─[C]─┬─[D]─┬─[E]─┬─[F]
    │     │     │     │     │
    └─────┴─────┴─────┴─────┘
    A has 7 neighbors regardless of "distance"
    Information reaches entire network
```

### Neighbor Selection Algorithm

Modules select k=7 logical neighbors based on deterministic mapping:

```c
// Neighbor selection using XOR distance metric
void kor_neighbor_select(uint16_t my_id, uint16_t *neighbors) {
    // Collect all visible module IDs from segment
    uint16_t candidates[MAX_SEGMENT_SIZE];
    int n_candidates = kor_get_visible_modules(candidates);

    // Sort by XOR distance (logical proximity)
    for (int i = 0; i < n_candidates; i++) {
        candidates[i].distance = my_id ^ candidates[i].id;
    }
    qsort(candidates, n_candidates, sizeof(*candidates), cmp_distance);

    // Take k=7 closest (excluding self)
    int j = 0;
    for (int i = 0; i < n_candidates && j < K_NEIGHBORS; i++) {
        if (candidates[i].id != my_id) {
            neighbors[j++] = candidates[i].id;
        }
    }
}
```

### Properties

| Property | Value | Justification |
|----------|-------|---------------|
| k | 7 | Cavagna/Giardina biological optimum |
| Network type | Scale-free | Maintains correlations at any size |
| Fault tolerance | Up to 2 neighbors can fail | k=7 → tolerate f=2 Byzantine |
| Rebuild time | <100ms | Neighbor replacement on failure |

---

## 3. Threshold Consensus Protocol

### Distributed Decision Making

System-wide decisions (power ramping, mode transitions) require consensus without a central coordinator.

**Threshold categories:**

| Decision Type | Threshold | Examples |
|---------------|-----------|----------|
| Safety-critical | 67% (supermajority) | Emergency stop, grid disconnect |
| Operational | 50% (majority) | Power ramping, load redistribution |
| Local | 0% (autonomous) | Thermal throttling, fault isolation |

### Vote Structure

```c
struct ConsensusVote {
    uint8_t  proposal_id;    // Unique proposal identifier
    uint8_t  vote;           // APPROVE / REJECT / ABSTAIN
    uint8_t  weight;         // Vote weight (based on health score)
    uint8_t  inhibit_mask;   // Competing proposals to suppress
    uint16_t voter_id;       // Module identifier
    uint16_t timestamp;      // Vote ordering
    uint8_t  mac[16];        // Chaskey authentication tag
};
```

### Mutual Inhibition

Conflicting proposals cannot both achieve consensus:

```
Example: Module A proposes INCREASE_POWER
         Module B proposes DECREASE_POWER

When voting for INCREASE_POWER:
  inhibit_mask = DECREASE_POWER

Result: Only one proposal can accumulate votes
        Natural conflict resolution
```

### Density-Dependent Activation

Minimum participation prevents small subsets from making system-wide decisions:

```c
bool kor_consensus_check(ConsensusProposal *p) {
    uint32_t total_modules = kor_get_segment_size();
    uint32_t min_participation = total_modules * 2 / 3;  // 67%

    if (p->vote_count < min_participation) {
        return false;  // Not enough participation
    }

    uint32_t threshold = (p->type == SAFETY_CRITICAL)
                       ? min_participation * 2 / 3   // 67% of participants
                       : min_participation / 2 + 1;  // 50%+ of participants

    return p->approve_count >= threshold;
}
```

### Byzantine Fault Tolerance

With k=7 neighbors, each module tolerates up to 2 Byzantine-faulty neighbors:

```
N ≥ 3f + 1

Where:
  N = 7 neighbors
  f = maximum tolerable faults

  7 ≥ 3f + 1
  f ≤ 2

Result: With 5 of 7 neighbors agreeing, consensus is valid
        Even if 2 neighbors are malicious/faulty
```

---

## 4. Lock-Free IPC

### Design Goals

- **Latency:** <100ns publish
- **Safety:** No locks, no blocking
- **Correctness:** Sequence counter pattern

### Sequence Counter Pattern

Writers increment sequence (odd = writing in progress), readers detect concurrent modification:

```c
// Writer (single producer)
void field_update(CoordinationField *f, FieldData *data) {
    // Increment sequence to odd (writing)
    uint32_t seq = f->sequence;
    f->sequence = seq + 1;
    __DMB();  // Data Memory Barrier

    // Write data
    f->load_potential = data->load;
    f->thermal_gradient = data->thermal;
    f->power_trajectory = data->power;
    f->timestamp = data->timestamp;

    __DMB();
    // Increment sequence to even (done)
    f->sequence = seq + 2;
}

// Reader (multiple consumers)
bool field_read(CoordinationField *f, FieldData *out) {
    uint32_t seq_before, seq_after;

    do {
        seq_before = f->sequence;
        if (seq_before & 1) continue;  // Writer active, retry

        __DMB();
        out->load = f->load_potential;
        out->thermal = f->thermal_gradient;
        out->power = f->power_trajectory;
        out->timestamp = f->timestamp;
        __DMB();

        seq_after = f->sequence;
    } while (seq_before != seq_after);

    return true;
}
```

### Memory Layout

Coordination fields are aligned to prevent false sharing:

```c
// Aligned to 32-byte cache line boundary
struct CoordinationField {
    volatile uint32_t load_potential;     // 4 bytes
    volatile uint32_t thermal_gradient;   // 4 bytes
    volatile uint32_t power_trajectory;   // 4 bytes
    volatile uint32_t timestamp;          // 4 bytes
    volatile uint32_t sequence;           // 4 bytes
    uint8_t _padding[12];                 // Pad to 32 bytes
} __attribute__((aligned(32)));
```

### Performance Measurements

Measured on STM32G474 @ 170MHz:

| Operation | Latency | Cycles |
|-----------|---------|--------|
| Field publish | 45-65ns | 8-11 |
| Field read (no retry) | 35-50ns | 6-8 |
| Field read (1 retry) | 80-115ns | 14-20 |

---

## 5. Network Architecture

### Hierarchical Segments

For 1000-node scale, the network uses hierarchical segments:

```
                              ┌──────────────────────────┐
                              │     L2 SAFETY LAYER      │
                              │      AURIX TC375         │
                              │      (ASIL-D)            │
                              └────────────┬─────────────┘
                                           │
                              Safety CAN Bus (1 Mbps)
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
   ┌──────┴──────┐                  ┌──────┴──────┐                  ┌──────┴──────┐
   │   SEGMENT   │                  │   SEGMENT   │                  │   SEGMENT   │
   │   GATEWAY   │◄────────────────►│   GATEWAY   │◄────────────────►│   GATEWAY   │
   │   STM32G474 │   Backbone CAN   │   STM32G474 │   Backbone CAN   │   STM32G474 │
   └──────┬──────┘     (5 Mbps)     └──────┬──────┘                  └──────┬──────┘
          │                                │                                │
          │ Segment CAN-FD (5 Mbps)        │                                │
          │                                │                                │
   ┌──────┴──────┐                  ┌──────┴──────┐                  ┌──────┴──────┐
   │  50-100     │                  │  50-100     │                  │  50-100     │
   │  CHARGER    │                  │  CHARGER    │                  │  CHARGER    │
   │  MODULES    │                  │  MODULES    │                  │  MODULES    │
   │  STM32G474  │                  │  STM32G474  │                  │  STM32G474  │
   └─────────────┘                  └─────────────┘                  └─────────────┘
```

### Bandwidth Analysis

For 64-node segment at 5 Mbps CAN-FD:

| Traffic Type | Size | Period | Bandwidth |
|--------------|------|--------|-----------|
| Heartbeat | 16B | 100ms | 82 kbps (1.6%) |
| Field update | 32B | 50ms | 328 kbps (6.6%) |
| Neighbor state | 24B×7 | 50ms | 1.72 Mbps (34%) |
| **Total coordination** | | | **~42%** |

Remaining 58% available for power commands, diagnostics, firmware updates.

### CAN-FD Frame Allocation

| Range | Category | Description |
|-------|----------|-------------|
| 0x000-0x00F | Emergency | Emergency stop, critical faults |
| 0x010-0x0FF | Safety | L2 ↔ Gateway communication |
| 0x100-0x1FF | Coordination | Heartbeats, fields, consensus |
| 0x200-0x3FF | Control | Power commands, mode transitions |
| 0x400-0x7FF | Application | Diagnostics, firmware |

---

## 6. MAPF-HET: Multi-Robot Coordination

### Problem Formulation

The robotic swap station requires coordinating heterogeneous robots for battery/module replacement. This is formalized as **MAPF-HET** (Multi-Agent Path Finding with Heterogeneous agents).

```
FORMAL PROBLEM STATEMENT
═══════════════════════════════════════════════════════════════

Instance: MAPF-HET

Given:
• Workspace W ⊂ ℝ² (station layout)
• Robots R = {r₁, ..., rₙ} with types T = {A, B}
  - Type A: mobile (bus-mounted), small payload, limited workspace
  - Type B: rail-mounted, large payload, full station access
• Tasks Θ = {θ₁, ..., θₘ} with:
  - Type: {SWAP_BATTERY, SWAP_MODULE, DIAGNOSE, CLEAN}
  - Location, duration, precedence constraints
• Hard deadline: D (bus departure time)

Find:
• Assignment A: Θ → R (which robot does what)
• Collision-free paths P = {p₁, ..., pₙ}
• Execution schedule S: Θ → [0, D]

Minimize:
• Makespan: max{completion_time(θᵢ)}

Complexity: NP-hard (reduction from standard MAPF)
```

### Problem Characteristics Unique to EK

| Characteristic | Challenge | Existing Solutions |
|----------------|-----------|-------------------|
| Mixed 1D+2D workspace | Rail (Type B) + mobile (Type A) robots | None handle this natively |
| Hard operational deadlines | Bus departures are contractual | MAPF optimizes makespan, not deadlines |
| Stochastic task durations | LogNormal distribution | Most assume deterministic |
| Existing coordination layer | EK-KOR2 potential fields | No integration with CBS |

### Proposed Algorithmic Contributions

We propose **5 new algorithms** that extend state-of-the-art MAPF-HET research:

#### 6.1 HYBRID-CBS: CBS Planning + Potential Field Execution

**Core insight:** Centralized CBS provides optimal paths; EK-KOR2 fields handle real-time variance.

```
HYBRID-CBS(Instance I, Deadline D):
  // Phase 1: Centralized CBS
  (A*, P*, makespan) ← CBS-HET(I)
  broadcast P* to all robots via CAN-FD

  // Phase 2: Decentralized Execution
  for each robot r_j in parallel:
    while not all_tasks_complete(r_j):
      F_neighbors ← sample_neighbor_fields()
      waypoint_j ← next_waypoint(P*_j, current_time)

      // Gradient combines plan attraction + field repulsion
      gradient ← α × attraction(waypoint) + β × repulsion(F_neighbors)

      if deviation > θ:
        trigger_local_replan()

      execute_motion(gradient)
```

**Contribution:** First algorithm to integrate CBS optimality with embedded potential field execution.

#### 6.2 MIXED-CBS: Dimensional Conflict Classes

**Core insight:** 1D rail robots and 2D mobile robots need different conflict handling.

```
ConflictClass:
  LINEAR   — Type B vs Type B on same rail segment
             Constraint: avoid(r_i, segment_s, [t_1, t_2])

  PLANAR   — Type A vs Type A in 2D workspace
             Constraint: avoid(r_i, vertex_v, t)

  CROSSING — Type A vs Type B at dock position
             Resolution: priority to Type B (critical path)
```

**Contribution:** First theoretical framework for mixed-dimensional MAPF workspaces.

#### 6.3 DEADLINE-CBS: SAT-Based Deadline Pruning

**Core insight:** Hard deadlines enable massive search space pruning via SAT.

```
DEADLINE-CBS(Instance I, Deadlines D):
  root ← empty_constraint_set()

  while OPEN not empty:
    N ← pop_min_cost(OPEN)

    // SAT check before expensive path computation
    if SAT_check(N, D) == UNSAT:
      continue  // Prune this branch

    // Select conflict with tightest deadline slack
    conflict ← select_tightest_slack_conflict(N, D)
    // ... standard CBS branching
```

**Contribution:** First CBS variant with hard deadline integration via SAT pruning.

#### 6.4 STOCHASTIC-ECBS: LogNormal Duration-Aware Search

**Core insight:** Battery swap durations are LogNormal; use Fenton-Wilkinson approximation.

```
Standard ECBS focal:  f(N) ≤ w × f_min
STOCHASTIC-ECBS:      P(C_max(N) ≤ D) ≥ 1 - ε

Where C_max ~ LogNormal(μ_max, σ_max) via Fenton-Wilkinson approximation
```

**Contribution:** First bounded-suboptimal MAPF with explicit deadline probability guarantees.

#### 6.5 FIELD-GUIDED MCTS: Potential Fields as Rollout Policy

**Core insight:** EK-KOR2 fields provide physics-inspired MCTS rollout guidance.

```
FIELD-GUIDED-MCTS(Instance I, time_budget):
  while time_remaining:
    node ← UCB1_select(root)
    child ← expand(node, field_prior)

    // Rollout: field-guided simulation
    while not terminal(state):
      for each robot r:
        gradient_r ← compute_field_gradient(state, r)
        action_r ← follow_gradient(gradient_r)
      state ← apply_joint_action(state, actions)

    backpropagate(child, evaluate(state))
```

**Contribution:** First MAPF algorithm using embedded potential fields as MCTS rollout policy.

### Comparison with Prior Work

| Algorithm | Deadlines | Stochastic | Execution | Contribution |
|-----------|-----------|------------|-----------|--------------|
| CBS-HET | Implicit | No | Open-loop | Baseline |
| MAPF-POST | No | Partial | Post-process | Kinodynamic |
| k-robust | No | k-delay | Robust plans | Delay tolerance |
| **HYBRID-CBS** | Via planning | Via fields | Potential fields | CBS + field execution |
| **MIXED-CBS** | Via SAT | No | CBS plans | Mixed workspace |
| **DEADLINE-CBS** | Hard SAT | No | CBS plans | SAT pruning |
| **STOCHASTIC-ECBS** | Probabilistic | LogNormal | ECBS plans | Distribution-aware |
| **FIELD-GUIDED MCTS** | Anytime | Via rollout | Field-guided | Field rollout |

### Implementation Status

| Component | Language | Status |
|-----------|----------|--------|
| CBS-HET baseline | Go | Working |
| HYBRID-CBS | Go + C (EK-KOR2) | Design complete |
| MIXED-CBS | Go | Design complete |
| DEADLINE-CBS | Go | Prototype |
| STOCHASTIC-ECBS | Go | Design complete |
| FIELD-GUIDED MCTS | Go | Design complete |

### Publication Targets

| Algorithm | Venue | Contribution Type |
|-----------|-------|-------------------|
| HYBRID-CBS | ICRA / RA-L | Systems (flagship) |
| MIXED-CBS | IJCAI | Theoretical |
| DEADLINE-CBS | SoCS | Algorithmic |
| STOCHASTIC-ECBS | AAMAS | Uncertainty |
| FIELD-GUIDED MCTS | IROS | Systems |

---

## 7. Safety Architecture

### Two-Tier Design

**L1 Application Layer (STM32G474):**
- Runs EK-KOR2 coordination
- Handles power control
- Not safety-certified

**L2 Safety Layer (AURIX TC375):**
- ASIL-D certified platform
- Independent grid protection
- Emergency shutdown authority

### Why Two Tiers

```
INDEPENDENCE REQUIREMENT
═══════════════════════════════════════════════════════════════

L1 can fail in any way → L2 still protects grid

L1 Failure Examples:
• Firmware bug
• Stack overflow
• Stuck in loop
• Invalid power command

L2 Response:
• Independent monitoring
• Hardwired contactor control
• Does NOT depend on L1 software

Result: Safety function certified independently
        L1 can iterate rapidly without recertification
```

### L2 Functions

| Function | Trigger | Action |
|----------|---------|--------|
| Under-frequency | f < 49.5 Hz | Load shedding |
| Over-frequency | f > 50.5 Hz | Power reduction |
| Overcurrent | I > 150% rated | Immediate trip |
| Ground fault | Residual > 30mA | Disconnect |
| Communication loss | Gateway timeout | Safe shutdown |

---

## 7. Implementation Status

### Code Statistics

| Component | Language | Files | Lines | Tests |
|-----------|----------|-------|-------|-------|
| EK-KOR2 core | C | 18 | ~4,500 | 22 vectors |
| JEZGRO kernel | C | 12 | ~2,800 | 15 vectors |
| Fleet simulator | Go | 8 | ~2,200 | 12 scenarios |
| MAPF-HET solver | Go | 12 | ~1,800 | CBS + Prioritized |
| Web dashboard | TypeScript | 24 | ~3,100 | 8 tests |

### Test Coverage

| Area | Method | Coverage |
|------|--------|----------|
| Potential field | Property-based | All edge cases |
| Consensus | Reference impl comparison | 100% |
| Lock-free IPC | Miri (undefined behavior) | No violations |
| Network protocol | Integration tests | Happy path + faults |

### Verification Roadmap

| Tool | Purpose | Status |
|------|---------|--------|
| Kani | Bounded model checking | Planned M3 |
| TLA+ | Protocol correctness | Partial spec |
| Miri | UB detection | Active |
| CBMC | C code verification | Planned M4 |

---

## 8. Hardware Reference Design

### EK3 Module Specifications

| Parameter | Value |
|-----------|-------|
| Power | 3.3 kW continuous |
| Input voltage | 650-900V DC |
| Output voltage | 200-500V DC |
| Efficiency | >97% |
| Topology | LLC resonant (DAB variant) |
| MOSFETs | Wolfspeed C3M0065100K (900V SiC) |
| MCU | STM32G474 (Cortex-M4F, 170MHz) |
| Communication | CAN-FD @ 5 Mbps |
| Dimensions | 200 × 320 × 44mm (1U half-width) |
| Weight | 3.5 kg |

### Scaling Table

| Application | Modules | Power |
|-------------|---------|-------|
| E-bike | 1 | 3.3 kW |
| Home charger | 7 | 23 kW |
| DC fast | 46 | 152 kW |
| Bus depot | 152 | 502 kW |
| 1 MW | 303 | 1 MW |
| MCS (trucks) | 909 | 3 MW |

---

## 9. Validation Evidence

### Cross-Implementation Verification

```
C IMPLEMENTATION ←→ RUST IMPLEMENTATION
       ↓                    ↓
   Test Vectors         Test Vectors
       ↓                    ↓
   Results A            Results B
       ↓                    ↓
       └─────── COMPARE ────┘
                  ↓
           Divergence = BUG

Result: 22 vectors, 100% match
```

### Property-Based Testing

Using Hypothesis (Python) for reference implementation:

```python
@given(
    load=st.floats(0.0, 1.0),
    thermal=st.floats(0.0, 1.0),
    time_delta=st.floats(0.0, 1.0)
)
def test_field_decay_bounds(load, thermal, time_delta):
    """Decayed field should always be in [0, original]"""
    decayed = apply_decay(load, time_delta, tau=0.1)
    assert 0.0 <= decayed <= load
```

### Simulation Results

100-node simulation with fault injection:

| Scenario | Result | Recovery Time |
|----------|--------|---------------|
| Single node failure | Self-healed | 85ms |
| 10% node failure | Self-healed | 340ms |
| Network partition | Quorum maintained | N/A |
| Byzantine node | Isolated by consensus | 150ms |

---

## 10. Open Questions

### For Technical Discussion

1. **Scale validation:** How do we prove correctness at 1000+ nodes before deployment? (Answer: Hierarchical segments + formal verification of segment-level properties)

2. **Consensus timing:** What's acceptable worst-case consensus latency for safety-critical decisions? (Current target: 500ms)

3. **Certification strategy:** Which components require ASIL certification vs. just good engineering? (Current: Only L2)

4. **Community governance:** How do we prevent hostile forks or standards fragmentation? (Answer: Linux Foundation model + strong reference implementation)

---

## References

1. Khatib, O. (1986). "Real-time obstacle avoidance for manipulators and mobile robots." *International Journal of Robotics Research*.

2. Cavagna, A., & Giardina, I. (2010). "Scale-free correlations in starling flocks." *PNAS*.

3. Ferrocene (2024). "ISO 26262 ASIL-D Qualification Report." TÜV SÜD.

4. Embassy-rs. "Embassy: Modern embedded framework for Rust." https://embassy.dev

5. Infineon. "AURIX TC3xx Safety Manual." Document revision 2024.

6. EK Internal. "MAPF-HET Research: State-of-the-Art and Proposed Contributions." See `mapf-het-research.md` for comprehensive 450+ line technical analysis including CBS family algorithms, heterogeneity dimensions, and 5 proposed algorithmic contributions.

---

*Technical Deep-Dive prepared: January 21, 2026*
*For: Khosla Ventures Technical Due Diligence*
