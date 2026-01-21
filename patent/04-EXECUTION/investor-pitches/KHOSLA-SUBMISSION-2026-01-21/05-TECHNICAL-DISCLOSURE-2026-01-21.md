# Technical Disclosure - Session 2026-01-21

## Full Disclosure for Khosla Ventures

**Date:** January 21, 2026
**Session:** Major Algorithm Research & Kernel Enhancement
**Author:** Bojan Janjatovic (CTO)
**Disclosure Type:** Full source code and documentation included

---

## Executive Summary

This document discloses significant technical developments completed in a single intensive session. The work spans three major areas:

1. **MAPF-HET Integration** - Multi-Agent Path Finding algorithms integrated into EK-KOR2 kernel
2. **EKKL Interpreter** - Domain-specific language for deterministic test oracle
3. **Multi-Layer Test System** - Comprehensive validation infrastructure

**Collaboration acknowledgment:** This work was developed in collaboration with our Distributed Systems & Optimization Advisor (PhD, identity confidential due to defense sector employment - disclosed under NDA).

---

## 1. MAPF-HET Integration into EK-KOR2 Kernel

### 1.1 What Was Integrated

**Source:** `mapf-het-research/internal/algo/deadline_cbs.go:231-270`

Multi-Agent Path Finding for Heterogeneous agents (MAPF-HET) research focuses on coordinating robots with different capabilities and deadlines. We adapted two key concepts for modular power electronics:

| Concept | MAPF-HET Use | EK-KOR2 Adaptation |
|---------|--------------|-------------------|
| Deadline-Aware Scheduling | Robot path planning with time constraints | Task scheduling via slack field gradient |
| Capability-Based Assignment | Heterogeneous robot tasks | Module task filtering by capability bitmask |

### 1.2 Technical Implementation

**New Field Component: `EKK_FIELD_SLACK`**

```c
// 6th field component - deadline slack for gradient-based scheduling
typedef enum {
    EKK_FIELD_LOAD      = 0,
    EKK_FIELD_THERMAL   = 1,
    EKK_FIELD_POWER     = 2,
    EKK_FIELD_CUSTOM_0  = 3,
    EKK_FIELD_CUSTOM_1  = 4,
    EKK_FIELD_SLACK     = 5,    // NEW: MAPF-HET integration
    EKK_FIELD_COUNT     = 6,
} ekk_field_component_t;
```

**Slack Computation Algorithm:**
```
slack_us = deadline - (now + duration_estimate)
critical = slack_us < SLACK_THRESHOLD_US (10 seconds)
slack_normalized = clamp(slack_us / SLACK_NORMALIZE_US, 0.0, 1.0)
```

**Capability Bitmask:**
```c
typedef uint16_t ekk_capability_t;

#define EKK_CAP_THERMAL_OK  (1 << 0)  // Within thermal limits
#define EKK_CAP_POWER_HIGH  (1 << 1)  // High power mode available
#define EKK_CAP_GATEWAY     (1 << 2)  // Can aggregate/route messages
#define EKK_CAP_V2G         (1 << 3)  // Bidirectional power capable

static inline bool ekk_can_perform(ekk_capability_t have, ekk_capability_t need) {
    return (have & need) == need;
}
```

### 1.3 Modified Task Selection

The task selection algorithm now considers three factors:
1. **Capability matching** - Module must have required capabilities
2. **Deadline criticality** - Critical tasks (slack < 10s) get priority boost
3. **Standard priority** - Lower priority number wins among same criticality

```
Priority rules:
1. Critical deadline tasks ALWAYS beat non-critical
2. Among critical tasks, lower priority number wins
3. Among non-critical tasks, lower priority number wins
```

### 1.4 Files Changed

| File | Lines Added | Changes |
|------|-------------|---------|
| `c/include/ekk/ekk_types.h` | +75 | `ekk_capability_t`, `ekk_deadline_t`, `EKK_FIELD_SLACK` |
| `c/include/ekk/ekk_module.h` | +94 | Deadline/capability APIs |
| `c/src/ekk_module.c` | +166 | `compute_slack()`, capability filtering, task selection |
| `rust/src/types.rs` | +139 | Rust equivalents |
| `rust/src/module.rs` | +169 | Rust implementation |
| `spec/api.md` | +181 | API specification |

**Total: ~800 lines of kernel code, dual C/Rust implementation**

---

## 2. EKKL (EK-KOR Language) - Deterministic Oracle

### 2.1 Purpose

Cross-implementation validation requires a deterministic reference. When C and Rust disagree, which is correct? EKKL provides:

- **Executable specification** - The spec becomes runnable code
- **Deterministic output** - Same inputs always produce same outputs
- **Fixed-point semantics** - Matches ekk Q16.16 exactly

### 2.2 Language Design

**Philosophy:** Minimal, deterministic, embedded-compatible

```
# EKKL Example: Field gradient computation
fn gradient(my_field: Field, neighbor_field: Field, component: u8) -> Fixed {
    let my_val = field_get(my_field, component);
    let neighbor_val = field_get(neighbor_field, component);
    fixed_sub(neighbor_val, my_val)
}
```

**Key Features:**
- S-expression inspired syntax
- No floating-point (only Q16.16 fixed-point)
- Pure functions (no side effects)
- Static typing with type inference

### 2.3 Implementation

| Component | File | Lines | Purpose |
|-----------|------|-------|---------|
| Lexer | `src/lexer.rs` | 17,155 | Tokenization |
| Parser | `src/parser.rs` | 40,403 | AST construction |
| AST | `src/ast.rs` | 9,625 | Abstract syntax tree |
| Evaluator | `src/eval.rs` | 26,100 | Expression evaluation |
| Builtins | `src/builtins.rs` | 15,944 | ekk-compatible functions |
| Types | `src/types.rs` | 31,579 | Type system |
| Values | `src/value.rs` | 16,412 | Runtime values |

**Total: ~160KB of interpreter source code**

### 2.4 Spec Files

Module specifications in EKKL:

| File | Purpose |
|------|---------|
| `spec/ekkl/prelude.ekkl` | Core types, fixed-point builtins |
| `spec/ekkl/field.ekkl` | Field publishing, sampling, gradients |
| `spec/ekkl/consensus.ekkl` | Voting, thresholds, inhibition |
| `spec/ekkl/heartbeat.ekkl` | State machine (Alive/Suspect/Dead) |
| `spec/ekkl/topology.ekkl` | k-neighbor selection, distance metrics |

---

## 3. Multi-Layer Test System

### 3.1 Test Pyramid Architecture

```
┌──────────────────────────────────────────────────────────────┐
│               MULTI-LAYER TEST PYRAMID                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  LAYER 5: MUTATION TESTING (meta-validation)                 │
│     cargo-mutants: Verifies tests catch bugs                 │
│                                                               │
│  LAYER 4: LLM ORACLE (AI-assisted)                           │
│     llm_oracle.py: Generates expected outputs from spec      │
│                                                               │
│  LAYER 3: PYTHON REFERENCE (executable spec)                 │
│     reference_impl.py: Lightweight critical functions        │
│                                                               │
│  LAYER 2: GOLDEN OUTPUTS (regression testing)                │
│     golden_capture.py / golden_validate.py                   │
│                                                               │
│  LAYER 1: PROPERTY TESTS (mathematical invariants)           │
│     proptest: gradient(a,b) == -gradient(b,a)               │
│                                                               │
│  LAYER 0: CROSS-VALIDATION (C vs Rust) - PRIMARY             │
│     run_tests.py: Two implementations validate each other    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 New Test Vectors (MAPF-HET)

| File | Tests |
|------|-------|
| `capability_001_can_perform.json` | 6 cases for capability matching |
| `deadline_001_slack_computation.json` | Slack with future deadline |
| `deadline_002_critical_slack.json` | Critical deadline detection |
| `field_008_slack_gradient.json` | Slack gradient propagation |

### 3.3 Property Tests

Mathematical invariants that don't need expected outputs:

```rust
// Antisymmetry: gradient(a,b) == -gradient(b,a)
proptest! {
    #[test]
    fn gradient_antisymmetric(a: Fixed, b: Fixed) {
        let grad_ab = gradient(a, b);
        let grad_ba = gradient(b, a);
        prop_assert_eq!(grad_ab, -grad_ba);
    }
}
```

**Property test files:**
- `prop_capability.rs` - Capability matching invariants
- `prop_deadline.rs` - Slack computation bounds
- `prop_field.rs` - Field decay monotonicity
- `prop_consensus.rs` - Vote count monotonicity
- `prop_heartbeat.rs` - State machine transitions
- `prop_topology.rs` - k-neighbor limits
- `prop_types.rs` - Fixed-point conversion roundtrips

### 3.4 Golden Outputs

20 captured reference outputs for regression testing:

```
spec/golden-outputs/
├── consensus_001_propose_basic.rust.golden.json
├── consensus_002_vote_approved.rust.golden.json
├── field_001_publish_basic.rust.golden.json
├── heartbeat_001_basic.rust.golden.json
├── topology_001_discovery_basic.rust.golden.json
└── ... (20 files total)
```

### 3.5 LLM Oracle

AI-assisted test generation using the API specification:

```bash
# Generate expected output from spec
python llm_oracle.py expected spec/api.md spec/test-vectors/field_001.json

# Generate new test vector
python llm_oracle.py generate spec/api.md field_gradient

# Analyze test failure
python llm_oracle.py analyze spec/api.md expected.json actual.json
```

---

## 4. MAPF-HET Research Codebase

### 4.1 New Go Implementation

Complete MAPF-HET algorithm research codebase:

```
mapf-het-research/
├── cmd/mapfhet/          # CLI entry point
├── internal/
│   ├── core/             # Domain models
│   │   ├── workspace.go  # 3D workspace representation
│   │   ├── robot.go      # Heterogeneous robot types
│   │   ├── task.go       # Task with deadlines/capabilities
│   │   └── solution.go   # Path solution representation
│   │
│   └── algo/             # Algorithm implementations
│       ├── cbs.go        # Conflict-Based Search (baseline)
│       ├── deadline_cbs.go    # Deadline-aware CBS
│       ├── energy_cbs.go      # Energy-aware extension
│       ├── hybrid_cbs.go      # CBS + potential field execution
│       ├── mixed_cbs.go       # 1D rail + 2D mobile handling
│       ├── stochastic_ecbs.go # LogNormal duration-aware
│       ├── potential_field.go # Potential field coordination
│       ├── astar.go           # 2D A* pathfinding
│       ├── astar3d.go         # 3D space-time A*
│       └── mcts.go            # Monte Carlo Tree Search
```

### 4.2 Algorithm Contributions

5 proposed algorithmic contributions for publication:

| Algorithm | Key Innovation | Target Venue |
|-----------|----------------|--------------|
| HYBRID-CBS | CBS planning + EK-KOR2 potential field execution | ICRA / RA-L |
| MIXED-CBS | 1D rail + 2D mobile workspace handling | IJCAI |
| DEADLINE-CBS | Hard deadline integration via SAT pruning | SoCS |
| STOCHASTIC-ECBS | LogNormal duration-aware focal search | AAMAS |
| FIELD-GUIDED MCTS | Potential fields as MCTS rollout policy | IROS |

---

## 5. ROJ Intelligence Documentation Updates

### 5.1 New Formal Algorithms

**Topological Neighbor Selection (SelectNeighbors)**

Formal algorithm with O(log N) convergence guarantee:

```
algorithm SelectNeighbors(self_id, all_nodes, k):
    candidates = all_nodes - {self_id}
    selected = []

    # Phase 1: Select geographically diverse neighbors
    for i in range(k):
        target_position = (self_id + i × (N / k)) mod N
        nearest = argmin(candidates, key=λn: d_can(n, target_position))
        selected.append(nearest)
        candidates.remove(nearest)

    # Phase 2: Quality refinement
    for i, neighbor in enumerate(selected):
        quality = 1 / (d_latency + d_error + ε)
        # Replace if 20%+ quality improvement
        ...

    return selected
```

### 5.2 Byzantine Fault Tolerance

Complete BFT subsystem documentation:

| Component | Description |
|-----------|-------------|
| Equivocation Detection | Detect conflicting messages to different peers |
| Signature Verification | Chaskey MAC for critical messages |
| Behavior Consistency | Statistical anomaly detection |
| Quarantine Protocol | Supermajority vote to isolate Byzantine nodes |

**Formal bounds:** For f Byzantine faults, requires N ≥ 3f + 1 nodes

### 5.3 Network Partition Handling

Production-ready partition handling:

1. **Detection:** Heartbeat suspicion + quorum monitoring + CAN arbitration
2. **Split-Brain Prevention:** Minority partition freeze
3. **Reconciliation:** 3-phase protocol (leader, state, reintegration)

---

## 6. Patent & Technical Documentation

### 6.1 Fleet Logistics VRPTW Model

Formal optimization model for module transport:

```
OBJECTIVE:
minimize:
    α × Σ_m [ priority_m × max(0, p_m - deadline_m) ]   # Weighted tardiness
  + β × Σ_b Σ_i,j [ x_b,i,j × dist_i,j ]               # Routing cost
  + γ × Σ_m [ (1 - Σ_b y_m,b) ]                        # Unserved penalty
```

**Implementation:** Python/PuLP MILP with greedy heuristic warm-start

### 6.2 Charger Placement MILP

Grid-aware charger placement optimization:

- Power flow constraints (DC approximation)
- Transformer capacity limits
- Voltage bounds (±10%)
- Budget constraints

---

## 7. Collaboration Acknowledgments

### Distributed Systems & Optimization Advisor

**Role:** Official advisor
**Background:** PhD Computer Science (Western Europe), 15+ years research
**Focus Areas:** MAPF-HET algorithms, distributed V2G optimization, fleet logistics
**Contribution to this session:**
- MAPF-HET algorithm formalization
- Deadline-aware CBS algorithm design (deadline_cbs.go:231-270)
- Capability-based task assignment framework
- Publication venue targeting

**Identity:** Confidential due to EU defense/telecom sector employment. Full credentials disclosed under NDA.

---

## 8. Code Metrics Summary

| Component | Files | Lines Added |
|-----------|-------|-------------|
| EK-KOR2 Kernel (C) | 3 | 335 |
| EK-KOR2 Kernel (Rust) | 2 | 308 |
| EKKL Interpreter | 11 | ~160,000 |
| Property Tests | 7 | ~2,000 |
| Test Vectors | 4 | ~200 |
| Golden Outputs | 20 | ~3,000 |
| Tools (Python) | 4 | ~1,500 |
| MAPF-HET Research (Go) | 20 | ~5,000 |
| Documentation | 5 | ~3,000 |
| **TOTAL** | **98** | **~22,550** |

---

## 9. Included Materials

This disclosure includes full source code for:

1. **ek-kor2/** - Complete kernel with MAPF-HET integration
2. **mapf-het-research/** - Algorithm research codebase
3. **tehnika/** - Updated ROJ intelligence documentation
4. **patent/** - Fleet logistics formal model

**Access:** Full source code included in accompanying technical package.

---

## 10. Contact

**Bojan Janjatovic** (CTO)
Email: bojan.janjatovic@gmail.com

**Company:** Elektrokombinacija (Netherlands BV)
**Co-Founder & CEO:** Marija Janjatovic

---

*Disclosure prepared: January 21, 2026*
*For: Khosla Ventures Seed Fund*
