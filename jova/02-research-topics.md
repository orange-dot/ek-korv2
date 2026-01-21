# Research Topics - Potencijal za Akademsku Saradnju

> **Verzija:** 1.0
> **Datum:** Januar 2026
> **Kontekst:** Jovin komentar o "naučnom aspektu" robot optimizacije
> **Napomena:** Neformalna saradnja, bez obaveza

---

## 1. Uvod

Dr. Jova je identifikovao da projekat ima potencijal za naučni doprinos, posebno u oblasti optimizacije. Ovaj dokument definiše konkretne research teme koje bi mogle biti interesantne za akademsku zajednicu, a istovremeno korisne za projekat.

**Model Saradnje:** Neformalni - diskusije, feedback na formulacije, eventualno mentorstvo za master/doktorske studente.

---

## 2. Research Tema 1: Multi-Robot Path Planning sa Heterogenim Agentima

### 2.1 Problem Statement

```
FORMALNI PROBLEM:
═══════════════════════════════════════════════════════════════

Instance: MAPF-HET (Multi-Agent Path Finding - Heterogeneous)

Given:
• Workspace W ⊂ ℝ² (station layout)
• Set of robots R = {r₁, ..., rₙ} with types T = {A, B}
  - Type A: mobile (bus-mounted), small payload, limited workspace
  - Type B: rail-mounted, large payload, full station access
• Set of tasks Θ = {θ₁, ..., θₘ}
• For each task θᵢ:
  - Type: {SWAP_BATTERY, SWAP_MODULE, DIAGNOSE, CLEAN}
  - Location: lᵢ ∈ W
  - Duration: dᵢ (stochastic, known distribution)
  - Precedence: predᵢ ⊆ Θ (must complete before θᵢ)
• Hard deadline: D (bus departure time)

Find:
• Assignment A: Θ → R
• Collision-free paths P = {p₁, ..., pₙ}
• Execution schedule S: Θ → [0, D]

Minimize:
• Makespan: max{completion_time(θᵢ)}
• Subject to: All precedence constraints satisfied
             No robot collisions
             Deadline D not exceeded

Complexity: NP-hard (reduction from MAPF)
```

### 2.2 Novel Aspects

| Aspect | Standard MAPF | Our Variant | Research Challenge |
|--------|---------------|-------------|-------------------|
| Robot types | Homogeneous | Heterogeneous (A, B) | Capability-aware assignment |
| Workspace | 2D grid | Mixed (1D rail + 2D mobile) | Geometric complexity |
| Tasks | Go-to-goal | Manipulate + coordinate | Task-motion planning |
| Deadlines | Soft or none | Hard (bus schedule) | Real-time guarantees |
| Durations | Deterministic | Stochastic | Robust scheduling |

### 2.3 Algorithmic Approaches

```
CANDIDATE ALGORITHMS:
═══════════════════════════════════════════════════════════════

1. CONFLICT-BASED SEARCH (CBS) Extension
   ────────────────────────────────────────
   • Two-level search: high-level conflict tree, low-level A*
   • Extension needed: heterogeneous agent capabilities
   • Complexity: O(b^d) where b = branching, d = depth

2. PRIORITIZED PLANNING with Capability Ordering
   ────────────────────────────────────────
   • Assign priority based on capability constraints
   • Type B robots get higher priority (critical path)
   • Fast but suboptimal

3. MIXED INTEGER LINEAR PROGRAMMING (MILP)
   ────────────────────────────────────────
   • Exact formulation possible
   • Scales poorly beyond ~20 tasks
   • Good for baseline comparison

4. MONTE CARLO TREE SEARCH (MCTS) with Domain Knowledge
   ────────────────────────────────────────
   • Handles stochastic durations naturally
   • Can incorporate learned heuristics
   • Anytime algorithm (returns best-so-far)

5. GRAPH NEURAL NETWORK (GNN) for State Encoding
   ────────────────────────────────────────
   • Learn spatial relationships
   • Generalize across station layouts
   • Combine with RL for policy learning
```

### 2.4 Research Contributions (Potential)

1. **Theoretical:** Complexity analysis of MAPF-HET with mixed workspaces
2. **Algorithmic:** CBS extension for heterogeneous capability constraints
3. **Empirical:** Benchmark suite based on real station layouts
4. **Applied:** Open-source implementation for EV charging domain

### 2.5 Publication Venues

| Venue | Type | Relevance | Deadline Cycle |
|-------|------|-----------|----------------|
| ICRA | Conference | High | Sept (for May conf) |
| IROS | Conference | High | March (for Oct conf) |
| RA-L | Journal | High | Rolling |
| AAMAS | Conference | Medium | Oct (for May conf) |
| JAIR | Journal | Medium | Rolling |

---

## 3. Research Tema 2: Distributed Optimization za Grid Services

### 3.1 Problem Statement

```
FORMALNI PROBLEM:
═══════════════════════════════════════════════════════════════

Instance: DISTRIBUTED-V2G-OPT

Given:
• Set of EK3 modules M = {m₁, ..., mₙ}
• Communication graph G = (M, E) (CAN-FD topology)
• For each module mᵢ:
  - Capacity: Pᵢ_max (power)
  - State: SOCᵢ (state of charge of connected battery)
  - Temperature: Tᵢ
  - Local cost: fᵢ(pᵢ) (efficiency, degradation)
• Grid signals:
  - Frequency: f(t) (requires P response)
  - Voltage: V(t) (requires Q response)
  - Price: π(t) (revenue signal)

Find (distributedly):
• Power allocation p* = {p₁*, ..., pₙ*}

Maximize:
• Σ πᵢ × pᵢ - Σ fᵢ(pᵢ) (profit minus cost)

Subject to:
• Σ pᵢ = P_grid_request (meet grid demand)
• pᵢ_min ≤ pᵢ ≤ pᵢ_max (capacity)
• Tᵢ ≤ T_limit (thermal)
• SOCᵢ_min ≤ SOCᵢ ≤ SOCᵢ_max (battery health)

Constraint: No central coordinator (only peer communication)
```

### 3.2 Novel Aspects

| Aspect | Standard Dist. Opt. | Our Variant | Research Challenge |
|--------|---------------------|-------------|-------------------|
| Network | Static | Dynamic (modules join/leave) | Online adaptation |
| Constraints | Linear | Nonlinear (thermal) | Convergence guarantees |
| Time scale | Slow (minutes) | Fast (seconds for freq. reg.) | Real-time performance |
| Failures | Assumed none | Byzantine faults possible | Robust consensus |

### 3.3 Algorithmic Approaches

```
CANDIDATE ALGORITHMS:
═══════════════════════════════════════════════════════════════

1. ADMM (Alternating Direction Method of Multipliers)
   ────────────────────────────────────────
   • Classic distributed optimization
   • Extension: dynamic topology handling
   • Convergence: O(1/k) for convex problems

2. PRIMAL-DUAL GRADIENT DESCENT
   ────────────────────────────────────────
   • Simpler implementation
   • Better for time-varying constraints
   • Convergence: sublinear

3. CONSENSUS + INNOVATIONS
   ────────────────────────────────────────
   • Consensus on gradients
   • Innovation term for local constraints
   • Robust to communication delays

4. GAME-THEORETIC APPROACH
   ────────────────────────────────────────
   • Each module as selfish agent
   • Nash equilibrium = social optimum (under conditions)
   • Natural incentive alignment

5. REINFORCEMENT LEARNING (Multi-Agent)
   ────────────────────────────────────────
   • MARL for coordination
   • Learn from grid price signals
   • Handles nonlinear dynamics
```

### 3.4 Research Contributions (Potential)

1. **Theoretical:** Convergence bounds for ADMM with dynamic topology
2. **Algorithmic:** Byzantine-tolerant distributed optimization
3. **Empirical:** Real-world grid signal datasets (frequency, price)
4. **Applied:** Integration with existing grid services markets

### 3.5 Publication Venues

| Venue | Type | Relevance | Deadline Cycle |
|-------|------|-----------|----------------|
| IEEE TSG | Journal | High | Rolling |
| CDC | Conference | High | March (for Dec conf) |
| ACC | Conference | High | Sept (for June conf) |
| NAPS | Conference | Medium | July |

---

## 4. Research Tema 3: Predictive Maintenance sa Edge AI

### 4.1 Problem Statement

```
FORMALNI PROBLEM:
═══════════════════════════════════════════════════════════════

Instance: EDGE-PREDICTIVE-MAINTENANCE

Given:
• Time series data from EK3 module:
  - Voltage, current, temperature (100 Hz)
  - Power, efficiency (10 Hz)
  - Events (fault codes, anomalies)
• Computational budget: STM32G474 (170 MHz, 512 KB RAM)
• Target: RUL prediction (Remaining Useful Life)

Find:
• Model M that predicts: RUL_t = M(history_{0:t})

Minimize:
• Prediction error: E[(RUL_pred - RUL_actual)²]

Subject to:
• Inference time < 10 ms
• Model size < 100 KB (fits in Flash)
• Online learning capability (adapt to deployment)

Constraint: No cloud connectivity required
```

### 4.2 Novel Aspects

| Aspect | Standard PM | Our Variant | Research Challenge |
|--------|-------------|-------------|-------------------|
| Compute | Cloud/server | MCU (170 MHz) | Model compression |
| Data | Offline batch | Streaming | Online learning |
| Labels | Full supervision | Weak supervision | Semi-supervised |
| Domain | Single device | Fleet (transfer) | Domain adaptation |

### 4.3 Algorithmic Approaches

```
CANDIDATE ALGORITHMS:
═══════════════════════════════════════════════════════════════

1. TINY ML CLASSIFIERS
   ────────────────────────────────────────
   • Quantized neural networks (INT8)
   • Random forests (efficient inference)
   • Decision trees with pruning

2. LSTM / GRU (Compressed)
   ────────────────────────────────────────
   • Knowledge distillation from large model
   • Quantization-aware training
   • Pruning + clustering

3. TRANSFORMER (Tiny)
   ────────────────────────────────────────
   • Attention for long sequences
   • Model compression essential
   • TinyBERT-style distillation

4. FEDERATED LEARNING
   ────────────────────────────────────────
   • Train across fleet
   • Privacy-preserving (data stays local)
   • Communication-efficient aggregation

5. CONTINUAL LEARNING
   ────────────────────────────────────────
   • Adapt to concept drift
   • Avoid catastrophic forgetting
   • Elastic weight consolidation
```

### 4.4 Research Contributions (Potential)

1. **Theoretical:** Sample complexity for RUL estimation under weak supervision
2. **Algorithmic:** Federated learning for power electronics fleet
3. **Empirical:** Public dataset from EK3 deployment
4. **Applied:** Open-source TinyML RUL library

### 4.5 Publication Venues

| Venue | Type | Relevance | Deadline Cycle |
|-------|------|-----------|----------------|
| IEEE PHM | Conference | High | Variable |
| AAAI | Conference | Medium | Aug (for Feb conf) |
| NeurIPS | Conference | High | May (for Dec conf) |
| IEEE TII | Journal | High | Rolling |

---

## 5. Research Tema 4: Fleet Logistics Optimization

### 5.1 Problem Statement

```
FORMALNI PROBLEM (proširenje VRPTW-PD iz patent dokumenta):
═══════════════════════════════════════════════════════════════

Instance: STOCHASTIC-VRPTW-PD-MAINTENANCE

Given:
• Bus routes B = {b₁, ..., bₘ} (fixed schedules)
• Stations S = {s₁, ..., sₖ}
• Module demands D = {d₁, ..., dₙ} (stochastic arrivals)
• Module failures F ~ Poisson(λ) (random process)

Find:
• Daily assignment: modules → buses → stations
• Inventory policy: spare modules at each station

Minimize:
• E[weighted tardiness] + E[unserved demand] + inventory cost

Subject to:
• Bus capacity constraints
• Time window constraints
• Inventory feasibility

Novel Element: Demand is stochastic (failure prediction uncertain)
```

### 5.2 Research Contributions (Potential)

1. **Theoretical:** Approximation bounds for stochastic VRPTW-PD
2. **Algorithmic:** Rolling horizon with robust optimization
3. **Empirical:** Comparison of reactive vs. predictive policies
4. **Applied:** Integration with bus fleet management systems

---

## 6. Collaboration Framework

### 6.1 Neformalni Model

```
PROPOSED COLLABORATION STRUCTURE:
═══════════════════════════════════════════════════════════════

Level 1: Discussion Partner
────────────────────────────
• Periodic calls (monthly?)
• Review problem formulations
• Suggest relevant literature
• No formal commitment

Level 2: Student Project Mentor
────────────────────────────
• Guide master's thesis on one topic
• Student works on EK3-related research
• Results published + usable by project
• Light commitment

Level 3: Research Collaboration
────────────────────────────
• Joint paper on specific topic
• Shared authorship
• More significant time investment
• Requires aligned interests

Preferred for now: Level 1 → potentially Level 2
```

### 6.2 Mutual Benefits

**Za Akademiju:**
- Real-world problem instances
- Access to deployment data (eventually)
- Industrial relevance for publications
- Potential industry partner for grants

**Za Projekat:**
- Expert review of algorithms
- Access to academic network
- Credibility boost
- Potential student talent pipeline

---

## 7. Priority Ranking

| Rank | Topic | Scientific Novelty | Project Value | Feasibility |
|------|-------|-------------------|---------------|-------------|
| 1 | Multi-Robot Path Planning | High | High | Medium |
| 2 | Distributed V2G Optimization | Medium-High | High | High |
| 3 | Edge AI Predictive Maintenance | Medium | High | Medium |
| 4 | Stochastic Fleet Logistics | Medium | Medium | High |

**Preporuka:** Započeti diskusiju sa temom #1 (Multi-Robot) jer je Jova eksplicitno pomenuo "robot optimizaciju" kao naučno interesantnu.

---

## 8. Sledeći Koraci

1. **Immediate:** Podeliti ovaj dokument sa Jov (ili sažetak)
2. **Short-term:** Zakazati neobavezujući call da se diskutuje interest
3. **Medium-term:** Ako postoji interest, definisati konkretnu temu
4. **Long-term:** Potencijalno: student project, joint paper

---

## Povezani Dokumenti

- `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` - Robot patent disclosure
- `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` - Fleet logistics patent
- `tehnika/konceptualno/en/02-roj-intelligence.md` - ROJ distributed system
- `tehnika/inzenjersko/en/07-v2g-control.md` - V2G control algorithms
