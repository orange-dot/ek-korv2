# Stochastic Fleet Logistics: Algorithm Catalog

> **Topic:** Algorithms for Stochastic VRPTW-PD
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document presents algorithmic approaches for solving the stochastic VRPTW-PD problem, ranging from exact methods to fast heuristics suitable for real-time replanning.

---

## 2. Algorithm Overview

```
ALGORITHM TAXONOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXACT METHODS                   METAHEURISTICS
├── Branch-and-Cut              ├── Adaptive Large Neighborhood Search
├── Branch-and-Price            ├── Genetic Algorithm
└── Benders Decomposition       └── Simulated Annealing

STOCHASTIC METHODS              ONLINE/REAL-TIME
├── Sample Average Approx       ├── Rolling Horizon
├── L-Shaped Method             ├── Consensus Algorithm
└── Progressive Hedging         └── Reactive Insertion

ROBUST METHODS
├── Scenario-Based Robust
└── Affine Decision Rules
```

---

## 3. MILP Formulation

### 3.1 Deterministic MILP

```
MILP: VRPTW-PD (Deterministic Base)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SETS:
────────────────────────────────────────────
N = {0} ∪ P ∪ D ∪ {n+1}  // Nodes: depot, pickups, deliveries, depot
K = {1, ..., |V|}         // Vehicles
A = {(i,j) : i,j ∈ N}    // Arcs

PARAMETERS:
────────────────────────────────────────────
c_ij    : Travel cost/time from i to j
s_i     : Service time at node i
[e_i, l_i] : Time window at node i
q_i     : Demand at node i (+pickup, -delivery)
Q       : Vehicle capacity

VARIABLES:
────────────────────────────────────────────
x_ijk ∈ {0,1} : Vehicle k travels arc (i,j)
t_ik ∈ ℝ⁺    : Arrival time of vehicle k at node i
L_ik ∈ ℝ⁺    : Load of vehicle k at node i

FORMULATION:
────────────────────────────────────────────
minimize  Σ_{k∈K} Σ_{(i,j)∈A} c_ij × x_ijk

subject to:

// Each pickup/delivery visited exactly once
(1) Σ_{k∈K} Σ_{j∈N} x_ijk = 1           ∀i ∈ P ∪ D

// Flow conservation
(2) Σ_{j∈N} x_ijk = Σ_{j∈N} x_jik       ∀i ∈ N, k ∈ K

// Vehicle starts from depot
(3) Σ_{j∈N} x_0jk = 1                   ∀k ∈ K

// Vehicle returns to depot
(4) Σ_{i∈N} x_i,n+1,k = 1               ∀k ∈ K

// Time consistency
(5) t_ik + s_i + c_ij ≤ t_jk + M(1-x_ijk)   ∀(i,j)∈A, k∈K

// Time windows
(6) e_i ≤ t_ik ≤ l_i                    ∀i ∈ N, k ∈ K

// Capacity (load tracking)
(7) L_ik + q_j ≤ L_jk + Q(1-x_ijk)      ∀(i,j)∈A, k∈K
(8) 0 ≤ L_ik ≤ Q                        ∀i ∈ N, k ∈ K

// Pickup before delivery (precedence)
(9) t_ik + s_i + c_i,i+n ≤ t_{i+n,k}    ∀i ∈ P, k ∈ K

// Same vehicle for pickup-delivery pair
(10) Σ_{j∈N} x_ijk = Σ_{j∈N} x_{i+n,j,k}  ∀i ∈ P, k ∈ K
```

### 3.2 Stochastic Extension

```
STOCHASTIC MILP (Scenario-Based):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Additional sets:
S = {1, ..., |Ω|}  // Scenarios
p_s                // Probability of scenario s

Additional variables:
y_ijk^s ∈ {0,1}   // Recourse routing in scenario s
t_ik^s ∈ ℝ⁺      // Arrival time in scenario s
w_i^s ∈ ℝ⁺       // Tardiness in scenario s

Two-stage formulation:
────────────────────────────────────────────
minimize  Σ_{k,i,j} c_ij × x_ijk  +  Σ_s p_s × Q_s(x)

where Q_s(x) = min Σ_{i} π_i × w_i^s  (recourse cost)

subject to:
    First-stage constraints (1)-(10)
    Recourse constraints for each scenario s
```

---

## 4. Sample Average Approximation

```
ALGORITHM: SAA (Sample Average Approximation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Distribution P_ξ, sample size N, replications M
Output: Solution x̂ with confidence interval

PROCEDURE:
────────────────────────────────────────────
1:  for m = 1 to M do
2:      // Generate N scenarios
3:      ξ^m = {ξ_1^m, ..., ξ_N^m} ~ P_ξ
4:
5:      // Solve SAA problem
6:      x_m = argmin (1/N) Σ_{i=1}^N f(x, ξ_i^m)
7:      v_m = (1/N) Σ_{i=1}^N f(x_m, ξ_i^m)
8:  end for
9:
10: // Select best solution
11: x̂ = argmin_{x_m} v_m
12:
13: // Estimate true objective (independent sample)
14: ξ' = {ξ'_1, ..., ξ'_{N'}} ~ P_ξ  (N' large)
15: v̂ = (1/N') Σ_{i=1}^{N'} f(x̂, ξ'_i)
16:
17: // Confidence interval
18: σ̂² = (1/(N'-1)) Σ_{i=1}^{N'} (f(x̂, ξ'_i) - v̂)²
19: CI = [v̂ - z_{α/2} × σ̂/√N', v̂ + z_{α/2} × σ̂/√N']
20:
21: return x̂, v̂, CI

COMPLEXITY:
────────────────────────────────────────────
• Sample complexity: N = O(1/ε²) for ε-optimal
• Total: M × (time to solve N-scenario MILP)
• Typical: N = 50-200 scenarios, M = 5-20 replications
```

---

## 5. Adaptive Large Neighborhood Search

```
ALGORITHM: ALNS for Stochastic VRPTW-PD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Initial solution x₀, scenarios Ω, max_iter
Output: Best solution x*

DESTROY OPERATORS:
────────────────────────────────────────────
D1: Random removal (remove k random requests)
D2: Worst removal (remove requests with highest cost)
D3: Related removal (remove similar/nearby requests)
D4: Route removal (remove entire route)
D5: Scenario-based removal (remove requests causing recourse)

REPAIR OPERATORS:
────────────────────────────────────────────
R1: Greedy insertion (insert at best position)
R2: Regret insertion (insert with highest regret)
R3: Robust insertion (minimize worst-case increase)

ADAPTIVE WEIGHT UPDATE:
────────────────────────────────────────────
def update_weights(operator, improvement, weights):
    if improvement > 0:
        score = σ₁  # New best
    elif accept:
        score = σ₂  # Accepted
    else:
        score = σ₃  # Rejected

    weights[operator] = λ × weights[operator] + (1-λ) × score

MAIN ALGORITHM:
────────────────────────────────────────────
1:  x = x₀
2:  x* = x
3:  T = T₀  // Temperature for simulated annealing
4:
5:  for iter = 1 to max_iter do
6:      // Select operators (roulette wheel)
7:      d = select_destroy_operator(weights_d)
8:      r = select_repair_operator(weights_r)
9:
10:     // Apply destroy-repair
11:     x' = repair(destroy(x, d), r)
12:
13:     // Evaluate (expected cost over scenarios)
14:     Δ = E_Ω[f(x')] - E_Ω[f(x)]
15:
16:     // Accept/reject (simulated annealing)
17:     if Δ < 0 or random() < exp(-Δ/T) then
18:         x = x'
19:         if E_Ω[f(x)] < E_Ω[f(x*)] then
20:             x* = x
21:             update_weights(d, r, σ₁)
22:         else
23:             update_weights(d, r, σ₂)
24:     else
25:         update_weights(d, r, σ₃)
26:     end if
27:
28:     T = α × T  // Cooling
29: end for
30:
31: return x*

PARAMETERS:
────────────────────────────────────────────
• T₀ = 0.05 × f(x₀)  (initial temperature)
• α = 0.9998         (cooling rate)
• λ = 0.8            (weight smoothing)
• σ₁, σ₂, σ₃ = 33, 9, 3  (scores)
• k = 3-8            (destroy size)
```

---

## 6. Rolling Horizon Algorithm

```
ALGORITHM: Rolling Horizon for Online Operation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Planning horizon H, re-plan interval Δ, scenario budget N
Output: Sequence of implemented decisions

STATE:
────────────────────────────────────────────
• Current time: τ
• Vehicle positions: pos(v, τ)
• Current routes: routes(τ)
• Pending demands: D_pending(τ)
• Inventory levels: I(s, τ)

MAIN LOOP:
────────────────────────────────────────────
1:  τ = 0
2:  while τ < T_end do
3:      // Observe current state
4:      state = observe_state(τ)
5:
6:      // Generate demands for [τ, τ+H]
7:      D_known = get_known_demands(τ, τ+H)
8:      D_predicted = predict_demands(τ, τ+H)
9:      scenarios = generate_scenarios(D_known, D_predicted, N)
10:
11:     // Solve optimization over [τ, τ+H]
12:     plan = solve_stochastic_vrp(state, scenarios, H)
13:
14:     // Implement decisions for [τ, τ+Δ]
15:     implement(plan, τ, τ+Δ)
16:
17:     // Handle events (new demands, delays, etc.)
18:     events = wait_for_events(Δ)
19:     update_state(events)
20:
21:     τ = τ + Δ
22: end while

EVENT HANDLING:
────────────────────────────────────────────
def handle_new_demand(demand, current_plan):
    # Check if can insert into existing route
    best_insertion = find_best_insertion(demand, current_plan)

    if best_insertion.feasible and best_insertion.cost < threshold:
        return insert(current_plan, best_insertion)
    else:
        # Trigger full re-optimization
        return REPLAN

def handle_delay(vehicle, delay, current_plan):
    # Propagate delay through route
    affected = propagate_delay(vehicle, delay, current_plan)

    if all(feasible(a) for a in affected):
        return update_times(current_plan, affected)
    else:
        return REPLAN
```

---

## 7. Consensus-Based Algorithm

```
ALGORITHM: Consensus for Real-Time Decisions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For distributed fleet (multiple dispatch centers).

SETUP:
────────────────────────────────────────────
• K dispatch centers, each managing subset of vehicles
• Communication graph G (who talks to whom)
• Shared demands (can be served by any center)

LOCAL PROBLEM (center k):
────────────────────────────────────────────
minimize  f_k(x_k) + λᵀ(Σ_j A_kj x_j - b)

where:
• f_k: Local routing cost
• λ: Shared dual variables
• Coupling: Shared demands, vehicle transfers

DISTRIBUTED ALGORITHM:
────────────────────────────────────────────
1:  Initialize λ⁰ at each center
2:
3:  for iter = 1, 2, ... do
4:      // Local optimization (parallel)
5:      for each center k (parallel) do
6:          x_k = argmin_{x_k} [f_k(x_k) + (λ_k)ᵀ A_k x_k + (ρ/2)||A_k x_k||²]
7:      end for
8:
9:      // Consensus on coupling constraints
10:     for each center k (parallel) do
11:         z_k = A_k x_k  // Local contribution
12:         z̄ = consensus(z_k, neighbors(k))  // Distributed average
13:     end for
14:
15:     // Dual update
16:     for each center k (parallel) do
17:         λ_k = λ_k + ρ × (z̄ - b/K)
18:     end for
19:
20:     // Consensus on dual (λ alignment)
21:     λ_k = consensus(λ_k, neighbors(k))
22: end for

CONVERGENCE:
────────────────────────────────────────────
• Converges to global optimum for convex problems
• Suboptimal for MILP but good practical performance
• Communication: O(|E|) messages per iteration
```

---

## 8. Robust Insertion Heuristic

```
ALGORITHM: Robust Insertion for Real-Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fast heuristic for inserting new demands into existing routes.

ROBUST INSERTION COST:
────────────────────────────────────────────
def robust_insertion_cost(demand, route, position, scenarios):
    """
    Compute worst-case cost increase of inserting demand
    at position in route.
    """
    costs = []
    for scenario in scenarios:
        # Compute cost with scenario's travel times
        c = insertion_cost(demand, route, position, scenario)
        costs.append(c)

    # Return worst case (or CVaR)
    return max(costs)  # or np.percentile(costs, 95)

REGRET-BASED SELECTION:
────────────────────────────────────────────
def regret_k_insertion(demands, routes, k=2, scenarios):
    """
    Insert demand with highest k-regret first.
    """
    while demands:
        best_regret = -inf
        best_demand = None
        best_insertion = None

        for d in demands:
            # Find k best insertions
            insertions = []
            for route in routes:
                for pos in range(len(route)):
                    cost = robust_insertion_cost(d, route, pos, scenarios)
                    insertions.append((cost, route, pos))

            insertions.sort(key=lambda x: x[0])

            # k-regret = cost of k-th best - cost of best
            if len(insertions) >= k:
                regret = insertions[k-1][0] - insertions[0][0]
            else:
                regret = inf  # Must insert in only option

            if regret > best_regret:
                best_regret = regret
                best_demand = d
                best_insertion = insertions[0]

        # Insert best demand
        insert(best_demand, best_insertion.route, best_insertion.pos)
        demands.remove(best_demand)

COMPLEXITY:
────────────────────────────────────────────
• O(n² × |routes| × |scenarios|) per demand
• Fast enough for real-time (< 1 second for typical instances)
```

---

## 9. Algorithm Comparison

### 9.1 Performance Comparison

| Algorithm | Optimality | Time (100 demands) | Scalability |
|-----------|------------|-------------------|-------------|
| MILP | Optimal | Hours | Poor |
| SAA + MILP | ε-optimal | 10-60 min | Moderate |
| ALNS | Heuristic | 1-5 min | Good |
| Rolling Horizon | Real-time | Seconds | Excellent |
| Robust Insertion | Greedy | Milliseconds | Excellent |

### 9.2 Selection Guide

```
ALGORITHM SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Case                    | Recommended Algorithm
────────────────────────────┼─────────────────────────────────
Strategic planning          | MILP with SAA
Day-ahead planning          | ALNS with scenarios
Real-time operations        | Rolling Horizon + ALNS
Emergency response          | Robust Insertion
Distributed fleet           | Consensus-based
High uncertainty            | Robust optimization

Problem Size               | Algorithm
────────────────────────────┼─────────────────────────────────
< 50 demands               | MILP exact
50-200 demands             | ALNS or SAA
> 200 demands              | ALNS with decomposition
Real-time (any size)       | Rolling Horizon
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-stochastic-analysis.md` - Uncertainty modeling
- `04-simulation.md` - Fleet scenarios
- `05-literature.md` - Algorithm references
