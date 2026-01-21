# Distributed V2G Optimization: Convergence Analysis

> **Topic:** Convergence Proofs and Rate Bounds
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document establishes convergence guarantees for distributed V2G optimization algorithms, including ADMM, primal-dual gradient descent, and consensus-based methods.

---

## 2. Assumptions

### 2.1 Function Assumptions

```
STANDING ASSUMPTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A1 (Convexity): Each f_i: ℝ → ℝ is convex.

A2 (Smoothness): Each f_i is L-smooth:
    ||∇f_i(x) - ∇f_i(y)|| ≤ L ||x - y||  ∀x, y

A3 (Strong Convexity): Each f_i is μ-strongly convex:
    f_i(y) ≥ f_i(x) + ∇f_i(x)ᵀ(y-x) + (μ/2)||y-x||²  ∀x, y

A4 (Bounded Gradients): ||∇f_i(x)|| ≤ G  ∀x ∈ C, ∀i

A5 (Constraint Qualification): Slater's condition holds:
    ∃p̃ such that Σᵢ p̃_i = P_grid and p̃_i ∈ int(C_i)
```

### 2.2 Graph Assumptions

```
GRAPH ASSUMPTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

G1 (Connectivity): Graph G = (M, E) is connected.

G2 (Weight Matrix): W is doubly stochastic:
    • W1 = 1 (rows sum to 1)
    • 1ᵀW = 1ᵀ (columns sum to 1)
    • W_ij ≥ 0
    • W_ij > 0 only if (i,j) ∈ E or i = j

G3 (Spectral Gap): Second largest eigenvalue σ₂(W) < 1.
    Define: ρ = σ₂(W) (mixing rate)

G4 (Self-loops): W_ii > 0 for all i (lazy random walk).
```

---

## 3. Consensus Convergence

### 3.1 Basic Consensus

```
THEOREM 1 (Consensus Convergence):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For the consensus update:
    x^(k+1) = W x^(k)

where x^(0) ∈ ℝⁿ and W satisfies G1-G4:

    ||x^(k) - x̄·1|| ≤ ρᵏ ||x^(0) - x̄·1||

where x̄ = (1/n) Σᵢ x_i^(0) is the average and ρ = σ₂(W).

Proof:
────────────────────────────────────────────
Let x̄ = (1ᵀx^(0))/n. Since W is doubly stochastic:
    1ᵀx^(k) = 1ᵀW^k x^(0) = 1ᵀx^(0) = n·x̄

Define error: e^(k) = x^(k) - x̄·1

Then: e^(k+1) = Wx^(k) - x̄·1 = W(x^(k) - x̄·1) = We^(k)

Since e^(k) ⊥ 1 (orthogonal to consensus subspace):
    ||e^(k+1)|| = ||We^(k)|| ≤ σ₂(W) ||e^(k)|| = ρ ||e^(k)||

By induction: ||e^(k)|| ≤ ρᵏ ||e^(0)||  □


COROLLARY 1 (Consensus Rate):
────────────────────────────────────────────
To achieve ||x^(k) - x̄·1|| ≤ ε:
    k ≥ log(||x^(0) - x̄·1||/ε) / log(1/ρ)

For typical graphs:
• Complete graph: ρ = 0, instant consensus
• Ring (n nodes): ρ = cos(2π/n) ≈ 1 - 2π²/n²
• Grid (√n × √n): ρ ≈ 1 - O(1/n)
```

### 3.2 Consensus with Dynamic Inputs

```
THEOREM 2 (Consensus Tracking):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For consensus with time-varying inputs:
    x_i^(k+1) = Σⱼ W_ij x_j^(k) + u_i^(k)

If inputs satisfy: ||u^(k)|| ≤ U for all k, then:

    ||x^(k) - x̄^(k)·1|| ≤ ρᵏ ||x^(0)|| + U/(1-ρ)

where x̄^(k) = (1/n) Σᵢ x_i^(k).

Implication: Bounded tracking error proportional to input magnitude.
```

---

## 4. ADMM Convergence

### 4.1 Standard ADMM

```
THEOREM 3 (ADMM Convergence):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For the distributed ADMM algorithm:

    p_i^(k+1) = argmin_{p_i} [f_i(p_i) + (ρ/2)||p_i - z_i^(k) + u_i^(k)||²]
    z^(k+1) = proj_{Σz_i=P_grid} [p^(k+1) + u^(k)]
    u^(k+1) = u^(k) + p^(k+1) - z^(k+1)

Under assumptions A1, A5, and any ρ > 0:

1. Residual convergence:
   ||p^(k) - z^(k)|| → 0  as k → ∞

2. Objective convergence:
   Σᵢ f_i(p_i^(k)) → Σᵢ f_i(p_i*)  as k → ∞

3. Dual convergence:
   u^(k) → u*  as k → ∞

Proof sketch:
────────────────────────────────────────────
Define Lyapunov function:
    V^(k) = (1/ρ)||u^(k) - u*||² + ρ||z^(k) - z*||²

Show V^(k+1) ≤ V^(k) - c||r^(k)||² where r^(k) = p^(k) - z^(k).
Summing: Σₖ ||r^(k)||² < ∞, hence r^(k) → 0.  □
```

### 4.2 ADMM Rate of Convergence

```
THEOREM 4 (ADMM Rate - Convex Case):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Under A1-A2, A5, ADMM achieves:

    |Σᵢ f_i(p_i^(k)) - Σᵢ f_i(p_i*)| ≤ O(1/k)

Specifically:
    Σᵢ f_i(p_i^(k)) - Σᵢ f_i(p_i*) ≤ (||u^(0) - u*||² + ρ||z^(0) - z*||²) / (2ρk)


THEOREM 5 (ADMM Rate - Strongly Convex Case):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Under A1-A3, A5, with optimal ρ = √(μL), ADMM achieves:

    ||p^(k) - p*|| ≤ (1 - √(μ/L))ᵏ ||p^(0) - p*||

Linear convergence rate: Q-linear with factor (1 - √(μ/L)).

Optimal penalty parameter:
    ρ* = √(μL)

where μ is strong convexity and L is smoothness constant.
```

### 4.3 Distributed ADMM with Consensus

```
THEOREM 6 (Distributed ADMM Convergence):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For ADMM with K_inner consensus iterations per outer iteration:

Error decomposition:
    ||p^(k) - p*|| ≤ E_opt^(k) + E_cons^(k)

where:
• E_opt^(k): Optimization error (ADMM convergence)
• E_cons^(k): Consensus error (inexact averaging)

Bounds:
────────────────────────────────────────────
E_opt^(k) ≤ C_1 / k                    (convex)
E_opt^(k) ≤ C_1 × (1-√(μ/L))ᵏ         (strongly convex)

E_cons^(k) ≤ C_2 × ρ^(K_inner)

Total error:
    ||p^(k) - p*|| ≤ C_1/k + C_2 × ρ^(K_inner)

To achieve ε accuracy:
• Outer iterations: k = O(1/ε)
• Inner iterations: K_inner = O(log(1/ε) / log(1/ρ))
```

---

## 5. Primal-Dual Gradient Convergence

### 5.1 Basic Primal-Dual

```
THEOREM 7 (Primal-Dual Convergence):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For the primal-dual gradient algorithm:
    p_i^(k+1) = proj_{C_i}[p_i^(k) - α(∇f_i(p_i^(k)) - λ^(k))]
    λ^(k+1) = λ^(k) + β(Σᵢ p_i^(k+1) - P_grid)

Under A1-A2, with step sizes:
    α < 1/L,  β < 1/(n × α × L²)

The algorithm converges:
    (p^(k), λ^(k)) → (p*, λ*)

Rate:
────────────────────────────────────────────
Ergodic convergence (averaged iterates):
    |L(p̄^(K), λ*) - L(p*, λ̄^(K))| ≤ O(1/K)

where p̄^(K) = (1/K) Σₖ p^(k).
```

### 5.2 Distributed Primal-Dual

```
THEOREM 8 (Distributed Primal-Dual):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For distributed primal-dual with consensus:
    p_i^(k+1) = proj_{C_i}[p_i^(k) - α(∇f_i(p_i^(k)) - λ_i^(k))]
    λ_i^(k+1) = Σⱼ W_ij λ_j^(k) + β × p_i^(k+1)

Convergence requires:
────────────────────────────────────────────
1. α < 1/(L + ρ_max(Lap(G)))
2. β < α/(1 + α×L)
3. Graph G connected

where Lap(G) is the graph Laplacian.

Rate:
────────────────────────────────────────────
    ||p^(k) - p*|| + ||λ^(k) - λ*·1|| ≤ O(1/√k)

For strongly convex case: O((1-c)ᵏ) for some c > 0.
```

---

## 6. Robustness Analysis

### 6.1 Communication Delays

```
THEOREM 9 (Robustness to Delays):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For ADMM with bounded communication delays τ_max:

If τ_max < τ_crit where:
    τ_crit = O(1 / (ρ × L))

Then convergence is preserved with degraded rate:
    ||p^(k) - p*|| ≤ C × (1 + τ_max/τ_crit)^k × ||p^(0) - p*||

Practical implication:
────────────────────────────────────────────
For EK3 with CAN-FD (< 1ms delay) and ρ = 0.1, L = 1:
    τ_crit ≈ 10 ms
    τ_max / τ_crit < 0.1 → minimal impact
```

### 6.2 Packet Loss

```
THEOREM 10 (Robustness to Packet Loss):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For consensus with i.i.d. packet loss probability p_loss:

Expected weight matrix:
    W̄ = (1 - p_loss) × W + p_loss × I

Spectral gap:
    1 - σ₂(W̄) = (1 - p_loss) × (1 - σ₂(W))

Convergence rate degradation:
    ρ_effective = 1 - (1 - p_loss)(1 - ρ)

For p_loss = 0.1 and ρ = 0.9:
    ρ_effective = 1 - 0.9 × 0.1 = 0.91

Implication: 10% packet loss causes ~10% slowdown.
```

### 6.3 Byzantine Faults

```
THEOREM 11 (Byzantine Resilience):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For consensus with f Byzantine nodes out of n total:

Standard consensus: Not Byzantine-resilient (any f > 0 can cause failure)

Byzantine-resilient consensus (trimmed mean):
    x_i^(k+1) = TrimmedMean_{f}({x_j^(k) : j ∈ N(i)})

Convergence requires:
    |N(i)| > 3f  ∀i  (each node has > 3f neighbors)

Under this condition:
    |x_i^(k) - x_j^(k)| → 0  for all honest i, j

Application to V2G:
────────────────────────────────────────────
For n = 100 modules, can tolerate f = 10 Byzantine
if graph has min degree > 30.
```

---

## 7. Convergence Rate Summary

### 7.1 Comparison Table

| Algorithm | Convex Rate | Strongly Convex Rate | Per-Iteration Cost |
|-----------|-------------|---------------------|-------------------|
| Centralized GD | O(1/k) | O((1-μ/L)ᵏ) | O(n) |
| ADMM | O(1/k) | O((1-√(μ/L))ᵏ) | O(n) local + O(n) comm |
| Dist. ADMM | O(1/k) | O((1-c)ᵏ) | O(1) local + O(d) comm |
| Primal-Dual | O(1/√k) | O((1-c)ᵏ) | O(1) local + O(d) comm |
| Consensus GD | O(1/√k) | O((1-c)ᵏ) | O(1) local + O(d) comm |

where d = max degree of graph.

### 7.2 Iteration Complexity

```
ITERATIONS TO ε-ACCURACY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target: ||p^(k) - p*|| ≤ ε

Algorithm        | Convex      | Strongly Convex
─────────────────┼─────────────┼─────────────────
ADMM             | O(1/ε)      | O(√(L/μ) log(1/ε))
Primal-Dual      | O(1/ε²)     | O((L/μ) log(1/ε))
Consensus GD     | O(1/ε²)     | O((L/μ) log(1/ε))

For V2G with typical parameters:
• L/μ ≈ 10 (condition number)
• ε = 0.01 (1% accuracy)

ADMM: ~30 iterations
Primal-Dual: ~100 iterations
```

---

## 8. Practical Convergence Criteria

### 8.1 Stopping Conditions

```
STOPPING CRITERIA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Primal Residual:
   r_primal = ||Σᵢ p_i - P_grid||
   Stop if: r_primal < ε_primal

2. Dual Residual (ADMM):
   r_dual = ρ × ||z^(k) - z^(k-1)||
   Stop if: r_dual < ε_dual

3. Consensus Residual:
   r_cons = max_i ||λ_i - λ̄||
   Stop if: r_cons < ε_cons

4. Objective Change:
   Δf = |f^(k) - f^(k-1)|
   Stop if: Δf < ε_obj × |f^(k)|

Recommended thresholds:
────────────────────────────────────────────
ε_primal = 0.01 × P_grid
ε_dual = 0.01 × max_i |p_i|
ε_cons = 0.01 × |λ̄|
ε_obj = 0.001
```

### 8.2 Adaptive Parameter Tuning

```
ADAPTIVE ρ FOR ADMM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Residual balancing:
────────────────────────────────────────────
If r_primal > μ × r_dual:
    ρ ← τ × ρ  (increase ρ)
If r_dual > μ × r_primal:
    ρ ← ρ / τ  (decrease ρ)

Typical: μ = 10, τ = 2

Intuition:
• Large primal residual → increase penalty on consensus
• Large dual residual → decrease penalty (allow more freedom)

Convergence preserved for bounded ρ changes.
```

---

## 9. Numerical Validation

### 9.1 Expected Convergence Behavior

```
EXPECTED CONVERGENCE PROFILE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Iteration  | Primal Res | Dual Res  | Objective Gap
───────────┼────────────┼───────────┼──────────────
1          | 1.0        | 1.0       | 10%
5          | 0.3        | 0.5       | 5%
10         | 0.1        | 0.2       | 2%
20         | 0.03       | 0.05      | 0.5%
50         | 0.001      | 0.002     | 0.01%

Typical convergence: 20-50 iterations for 1% accuracy.
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `03-algorithms.md` - Algorithm implementations
- `04-simulation.md` - Numerical experiments
- `05-literature.md` - Convergence analysis references
