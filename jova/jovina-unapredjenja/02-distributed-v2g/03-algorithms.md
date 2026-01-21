# Distributed V2G Optimization: Algorithm Catalog

> **Topic:** Distributed Optimization Algorithms for V2G
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document presents algorithmic implementations for distributed V2G optimization, including ADMM, primal-dual methods, consensus algorithms, and game-theoretic approaches.

---

## 2. Algorithm Overview

```
ALGORITHM TAXONOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DECOMPOSITION METHODS           CONSENSUS METHODS
├── ADMM                        ├── Average Consensus
├── Dual Decomposition          ├── Push-Sum
└── Proximal Gradient           └── Gradient Tracking

GAME-THEORETIC                  REAL-TIME CONTROL
├── Best Response               ├── Droop Control
├── Fictitious Play             ├── MPC Distributed
└── Potential Games             └── Event-Triggered

LEARNING-BASED
├── Multi-Agent RL
└── Online Learning
```

---

## 3. ADMM Algorithm

### 3.1 Centralized ADMM

```
ALGORITHM: ADMM-V2G (Centralized Reference)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Modules M, costs f_i, target P_grid, penalty ρ
Output: Optimal power allocation p*

INITIALIZE:
────────────────────────────────────────────
1:  for each module i do
2:      p_i ← 0
3:      z_i ← 0
4:      u_i ← 0
5:  end for

ITERATE:
────────────────────────────────────────────
6:  for k = 1, 2, ... until convergence do
7:
8:      // Step 1: Local p-updates (parallelizable)
9:      for each module i (parallel) do
10:         p_i ← argmin_{p} [f_i(p) + (ρ/2)||p - z_i + u_i||²]
11:         // Closed form for quadratic f_i:
12:         // p_i ← (ρ(z_i - u_i) + π) / (2α_i + ρ)
13:     end for
14:
15:     // Step 2: Global z-update (requires aggregation)
16:     p̄ ← (1/n) Σᵢ (p_i + u_i)
17:     for each module i do
18:         z_i ← p_i + u_i - p̄ + P_grid/n
19:     end for
20:
21:     // Step 3: Dual update
22:     for each module i do
23:         u_i ← u_i + p_i - z_i
24:     end for
25:
26:     // Check convergence
27:     r_primal ← ||p - z||
28:     r_dual ← ρ × ||z - z_prev||
29:     if r_primal < ε_p and r_dual < ε_d then
30:         break
31:     end if
32:
33: end for
34:
35: return p

COMPLEXITY:
────────────────────────────────────────────
• Per iteration: O(n) for aggregation
• Communication: O(n) messages to coordinator
• Convergence: O(1/ε) iterations for ε-accuracy
```

### 3.2 Fully Distributed ADMM

```
ALGORITHM: D-ADMM (Distributed ADMM with Consensus)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Graph G, costs f_i, target P_grid, penalty ρ, consensus W
Output: Optimal power allocation p*

INITIALIZE:
────────────────────────────────────────────
1:  for each module i do
2:      p_i ← 0
3:      λ_i ← 0
4:      z_i ← P_grid / n  // Initial estimate of fair share
5:  end for

ITERATE:
────────────────────────────────────────────
6:  for k = 1, 2, ... until convergence do
7:
8:      // Step 1: Local optimization
9:      for each module i (parallel) do
10:         p_i ← argmin_{p ∈ C_i} [f_i(p) - λ_i × p + (ρ/2)(p - z_i)²]
11:     end for
12:
13:     // Step 2: Consensus on average (K_inner iterations)
14:     for each module i do
15:         s_i ← p_i + λ_i/ρ
16:     end for
17:
18:     for t = 1 to K_inner do
19:         for each module i (parallel) do
20:             s_i ← Σⱼ∈N(i)∪{i} W_ij × s_j
21:         end for
22:     end for
23:     // Now s_i ≈ s̄ = (1/n)Σⱼ(p_j + λ_j/ρ)
24:
25:     // Step 3: Update z (projection onto constraint)
26:     for each module i do
27:         z_i ← p_i + λ_i/ρ - s_i + P_grid/n
28:     end for
29:
30:     // Step 4: Dual update
31:     for each module i do
32:         λ_i ← λ_i + ρ × (p_i - z_i)
33:     end for
34:
35:     // Check local convergence
36:     if ||p_i - z_i|| < ε for all i then
37:         break
38:     end if
39:
40: end for
41:
42: return p

PSEUDOCODE FOR MODULE i:
────────────────────────────────────────────
def admm_iteration_local(i, p_i, lambda_i, z_i, neighbors, W, rho):
    # Local optimization
    p_i_new = solve_local_opt(f_i, lambda_i, z_i, rho)

    # Consensus preparation
    s_i = p_i_new + lambda_i / rho

    # Consensus rounds
    for t in range(K_inner):
        s_i_new = W[i,i] * s_i
        for j in neighbors:
            s_j = receive_from(j)
            s_i_new += W[i,j] * s_j
        send_to_neighbors(s_i)
        s_i = s_i_new

    # Update z and lambda
    z_i = p_i_new + lambda_i/rho - s_i + P_grid/n
    lambda_i = lambda_i + rho * (p_i_new - z_i)

    return p_i_new, lambda_i, z_i
```

---

## 4. Primal-Dual Gradient Method

### 4.1 Distributed Gradient Descent

```
ALGORITHM: DGD-V2G (Distributed Gradient Descent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Graph G, costs f_i, target P_grid, step sizes α, β
Output: Approximate optimal p*

INITIALIZE:
────────────────────────────────────────────
1:  for each module i do
2:      p_i ← P_grid / n
3:      λ_i ← 0
4:  end for

ITERATE:
────────────────────────────────────────────
5:  for k = 1, 2, ... until convergence do
6:
7:      // Primal update with consensus mixing
8:      for each module i (parallel) do
9:          // Gradient step
10:         g_i ← ∇f_i(p_i) - λ_i
11:
12:         // Consensus mixing
13:         p_i_mixed ← Σⱼ W_ij × p_j
14:
15:         // Combined update
16:         p_i ← proj_{C_i}[p_i_mixed - α × g_i]
17:     end for
18:
19:     // Dual update (penalty for constraint violation)
20:     for each module i (parallel) do
21:         // Local estimate of total power
22:         sum_estimate_i ← Σⱼ∈N(i)∪{i} p_j
23:         violation_i ← sum_estimate_i - P_grid × |N(i)|/n
24:
25:         λ_i ← λ_i + β × violation_i
26:     end for
27:
28:     // Dual consensus (optional, improves convergence)
29:     for each module i (parallel) do
30:         λ_i ← Σⱼ W_ij × λ_j
31:     end for
32:
33: end for
34:
35: return p

STEP SIZE SELECTION:
────────────────────────────────────────────
• α = 0.1 / L  where L is Lipschitz constant of ∇f
• β = 0.01 / (max_degree × α)
• Conservative but ensures convergence
```

### 4.2 Gradient Tracking

```
ALGORITHM: GT-V2G (Gradient Tracking)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Improved convergence by tracking gradient average.

INITIALIZE:
────────────────────────────────────────────
1:  for each module i do
2:      p_i ← P_grid / n
3:      y_i ← ∇f_i(p_i)  // Gradient tracker
4:  end for

ITERATE:
────────────────────────────────────────────
5:  for k = 1, 2, ... do
6:
7:      // Primal update
8:      for each module i (parallel) do
9:          p_i_new ← Σⱼ W_ij × p_j - α × y_i
10:         p_i_new ← proj_{C_i}[p_i_new]
11:     end for
12:
13:     // Gradient tracking update
14:     for each module i (parallel) do
15:         y_i_new ← Σⱼ W_ij × y_j + ∇f_i(p_i_new) - ∇f_i(p_i)
16:     end for
17:
18:     // Update state
19:     for each module i do
20:         p_i ← p_i_new
21:         y_i ← y_i_new
22:     end for
23:
24: end for

ADVANTAGE:
────────────────────────────────────────────
• Linear convergence rate (vs sublinear for DGD)
• y_i tracks (1/n)Σⱼ∇f_j(p_j) without central coordinator
• Same per-iteration cost as DGD
```

---

## 5. Consensus Algorithms

### 5.1 Average Consensus

```
ALGORITHM: Average Consensus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compute average of initial values distributedly.

INITIALIZE:
────────────────────────────────────────────
1:  Each module i has value x_i

ITERATE:
────────────────────────────────────────────
2:  for k = 1, 2, ... until convergence do
3:      for each module i (parallel) do
4:          // Receive from neighbors
5:          x_i_new ← W_ii × x_i
6:          for j in neighbors(i) do
7:              x_i_new ← x_i_new + W_ij × x_j
8:          end for
9:          x_i ← x_i_new
10:     end for
11: end for
12:
13: // At convergence: x_i ≈ (1/n)Σⱼ x_j^(0) for all i

WEIGHT MATRIX (Metropolis-Hastings):
────────────────────────────────────────────
def compute_weights(G):
    W = zeros(n, n)
    for (i, j) in G.edges:
        W[i,j] = 1 / (1 + max(degree(i), degree(j)))
        W[j,i] = W[i,j]
    for i in range(n):
        W[i,i] = 1 - sum(W[i,:])
    return W
```

### 5.2 Push-Sum Consensus

```
ALGORITHM: Push-Sum (for Directed Graphs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Works on directed graphs (asymmetric communication).

INITIALIZE:
────────────────────────────────────────────
1:  Each module i has:
2:      x_i ← initial value
3:      w_i ← 1  // Weight

ITERATE:
────────────────────────────────────────────
4:  for k = 1, 2, ... do
5:      for each module i (parallel) do
6:          // Send to all out-neighbors (including self)
7:          for j in out_neighbors(i) ∪ {i} do
8:              send (x_i / out_degree(i), w_i / out_degree(i)) to j
9:          end for
10:
11:         // Receive from all in-neighbors
12:         x_i ← 0
13:         w_i ← 0
14:         for each received (x_val, w_val) do
15:             x_i ← x_i + x_val
16:             w_i ← w_i + w_val
17:         end for
18:     end for
19: end for
20:
21: // Estimate: x_i / w_i → (1/n)Σⱼ x_j^(0)
```

---

## 6. Game-Theoretic Algorithms

### 6.1 Best Response Dynamics

```
ALGORITHM: Best-Response-V2G
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each module greedily optimizes given others' strategies.

INITIALIZE:
────────────────────────────────────────────
1:  for each module i do
2:      p_i ← P_grid / n
3:  end for

ITERATE:
────────────────────────────────────────────
4:  for k = 1, 2, ... until convergence do
5:
6:      // Select module to update (round-robin or random)
7:      i ← select_module(k)
8:
9:      // Observe others' power (via communication)
10:     P_others ← Σⱼ≠ᵢ p_j
11:
12:     // Best response: optimize given P_others
13:     p_i ← argmax_{p ∈ C_i} [u_i(p, P_others)]
14:
15:     // For quadratic utility:
16:     // u_i(p, P_others) = π×p - f_i(p) - c×(p + P_others - P_grid)²
17:     // Best response: p_i = (π - 2c(P_others - P_grid)) / (2a_i + 2c)
18:
19: end for

CONVERGENCE:
────────────────────────────────────────────
• Converges to Nash equilibrium for potential games
• May cycle for non-potential games
• Add damping: p_i^new ← (1-γ)p_i + γ×BR_i
```

### 6.2 Distributed Potential Game

```
ALGORITHM: Potential-Game-V2G
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design utilities so that selfish optimization achieves social optimum.

POTENTIAL FUNCTION:
────────────────────────────────────────────
Φ(p) = Σᵢ [π×p_i - f_i(p_i)] - (c/2)(Σᵢ p_i - P_grid)²

Utility for module i (aligned with potential):
u_i(p_i, p_{-i}) = π×p_i - f_i(p_i) - c×p_i×(Σⱼ p_j - P_grid)

Property: ∂u_i/∂p_i = ∂Φ/∂p_i

ALGORITHM:
────────────────────────────────────────────
1:  for k = 1, 2, ... do
2:      // Compute aggregate (via consensus)
3:      P_total ← consensus_sum(p)
4:
5:      // Local gradient ascent
6:      for each module i (parallel) do
7:          g_i ← π - ∇f_i(p_i) - c×(P_total - P_grid)
8:          p_i ← proj_{C_i}[p_i + α×g_i]
9:      end for
10: end for

GUARANTEE:
────────────────────────────────────────────
Nash equilibrium = argmax Φ(p) = Social optimum
(Selfish agents achieve collectively optimal outcome)
```

---

## 7. Real-Time Control Algorithms

### 7.1 Distributed Droop Control

```
ALGORITHM: Distributed-Droop-V2G
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fast response to frequency deviations (no iteration needed).

PARAMETERS:
────────────────────────────────────────────
• f_nominal: 50 Hz
• K_total: Total droop coefficient (e.g., 100 kW/Hz)
• k_i = K_total × (P_i^max / Σⱼ P_j^max): Module i's share

CONTROL LAW:
────────────────────────────────────────────
def droop_control(i, f_measured):
    """
    Instantaneous power response to frequency deviation.
    No communication required.
    """
    delta_f = f_measured - f_nominal

    # Droop response
    p_droop = -k_i * delta_f

    # Add to base setpoint (from optimization)
    p_i = p_i_base + p_droop

    # Apply limits
    p_i = clip(p_i, P_i_min, P_i_max)

    return p_i

TIMING:
────────────────────────────────────────────
• Frequency measurement: 10 ms
• Control computation: < 1 ms
• Power response: < 100 ms total
```

### 7.2 Event-Triggered Optimization

```
ALGORITHM: Event-Triggered-ADMM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reduce communication by only updating when necessary.

EVENT TRIGGER:
────────────────────────────────────────────
def should_communicate(i, p_i, p_i_last_sent, threshold):
    """
    Trigger communication only on significant change.
    """
    error = abs(p_i - p_i_last_sent)

    # Relative threshold
    if error > threshold * abs(p_i):
        return True

    # Absolute threshold (for small values)
    if error > threshold_abs:
        return True

    # Time-based fallback (ensure eventual communication)
    if time_since_last_send > T_max:
        return True

    return False

MODIFIED ADMM:
────────────────────────────────────────────
1:  for k = 1, 2, ... do
2:      // Local optimization (always)
3:      p_i ← local_optimization(...)
4:
5:      // Conditional communication
6:      if should_communicate(i, p_i, p_i_last_sent, threshold) then
7:          broadcast(p_i)
8:          p_i_last_sent ← p_i
9:      end if
10:
11:     // Use last received values from neighbors
12:     consensus_step_with_stale_data(...)
13:
14: end for

BENEFITS:
────────────────────────────────────────────
• 50-80% communication reduction typical
• Convergence preserved (with modified analysis)
• Adaptive to changing conditions
```

---

## 8. Implementation for EK3

### 8.1 CAN-FD Message Protocol

```
CAN-FD MESSAGE FORMATS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Message Type 1: Optimization State (periodic, 10 Hz)
────────────────────────────────────────────
Byte  | Field         | Type    | Description
──────┼───────────────┼─────────┼─────────────
0     | msg_type      | uint8   | 0x01
1     | module_id     | uint8   | Sender ID
2-5   | p_i           | float32 | Current power [W]
6-9   | lambda_i      | float32 | Dual variable
10-13 | s_i           | float32 | Consensus state
14    | iteration     | uint8   | ADMM iteration number
15    | flags         | uint8   | Status flags

Message Type 2: Grid Signal (broadcast, 1 Hz)
────────────────────────────────────────────
Byte  | Field         | Type    | Description
──────┼───────────────┼─────────┼─────────────
0     | msg_type      | uint8   | 0x02
1     | source        | uint8   | Grid interface ID
2-5   | P_grid        | float32 | Target power [W]
6-9   | price         | float32 | Current price [€/kWh]
10-13 | frequency     | float32 | Grid frequency [Hz]
14-15 | reserved      | uint16  | Future use

Message Type 3: Join/Leave (event-based)
────────────────────────────────────────────
Byte  | Field         | Type    | Description
──────┼───────────────┼─────────┼─────────────
0     | msg_type      | uint8   | 0x03
1     | module_id     | uint8   | Joining/leaving ID
2     | action        | uint8   | 0=leave, 1=join
3-6   | P_max         | float32 | Capacity (if joining)
```

### 8.2 Embedded Implementation

```c
EMBEDDED C IMPLEMENTATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// State structure for each module
typedef struct {
    float p;           // Power allocation
    float lambda;      // Dual variable
    float z;           // ADMM z variable
    float s;           // Consensus state
    float P_max;       // Capacity
    float SOC;         // State of charge
    float T;           // Temperature
} V2G_State;

// Algorithm parameters
typedef struct {
    float rho;         // ADMM penalty
    float alpha;       // Primal step size
    float beta;        // Dual step size
    int K_inner;       // Consensus iterations
    float eps_primal;  // Convergence threshold
    float eps_dual;
} V2G_Params;

// Main optimization function
void V2G_ADMM_Iteration(V2G_State* state, V2G_Params* params,
                        float P_grid, int n_modules) {

    // Step 1: Local optimization
    float grad = compute_gradient(state->p);
    float target = state->z - state->lambda / params->rho;
    state->p = solve_local_opt(grad, target, params->rho, state);

    // Step 2: Prepare for consensus
    state->s = state->p + state->lambda / params->rho;

    // Step 3: Consensus (in separate function, uses CAN)
    // Called K_inner times by scheduler

    // After consensus completes:
    // state->s ≈ average of all s_i

    // Step 4: Update z
    state->z = state->p + state->lambda/params->rho
               - state->s + P_grid/n_modules;

    // Step 5: Dual update
    state->lambda += params->rho * (state->p - state->z);
}

// Consensus step (called by CAN receive handler)
void V2G_Consensus_Step(V2G_State* state, float* neighbor_s,
                        float* weights, int n_neighbors) {
    float s_new = weights[0] * state->s;  // Self-weight
    for (int j = 0; j < n_neighbors; j++) {
        s_new += weights[j+1] * neighbor_s[j];
    }
    state->s = s_new;
}
```

---

## 9. Algorithm Comparison

### 9.1 Performance Comparison

| Algorithm | Iterations | Comm/Iter | Memory | Optimality |
|-----------|------------|-----------|--------|------------|
| ADMM | 20-50 | O(d) | O(1) | Optimal |
| D-ADMM | 30-100 | O(d×K) | O(1) | Optimal |
| Primal-Dual | 100-500 | O(d) | O(1) | Optimal |
| Gradient Track | 50-100 | O(d) | O(1) | Optimal |
| Best Response | 20-100 | O(n) | O(1) | Nash (≈Opt) |
| Droop | 1 | 0 | O(1) | Suboptimal |

### 9.2 Selection Guide

```
ALGORITHM SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Case                    | Recommended Algorithm
────────────────────────────┼─────────────────────────────────
Optimal allocation          | D-ADMM or Gradient Tracking
Fast response (< 100ms)     | Droop Control + D-ADMM refinement
Directed communication      | Push-Sum Consensus
Limited bandwidth           | Event-Triggered ADMM
Game-theoretic setting     | Potential Game
Changing topology          | Gradient Tracking (robust)
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-convergence-analysis.md` - Convergence proofs
- `04-simulation.md` - Numerical experiments
- `05-literature.md` - Algorithm references
