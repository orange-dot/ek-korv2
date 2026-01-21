# Distributed V2G Optimization: Problem Formulation

> **Topic:** Distributed Optimization for Vehicle-to-Grid Services
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document provides a complete mathematical formulation for distributed optimization of V2G (Vehicle-to-Grid) services across a fleet of EK3 modules. The key challenge is achieving optimal power allocation without a central coordinator, using only local computation and peer-to-peer communication.

### 1.1 Motivation

EK3 modules can provide grid services:
- **Frequency regulation:** Fast power response to grid frequency deviations
- **Voltage support:** Reactive power for local voltage stability
- **Peak shaving:** Reduce demand during high-price periods
- **Energy arbitrage:** Buy low, sell high

Centralized coordination has limitations:
- Single point of failure
- Communication bottleneck
- Privacy concerns (exposing battery state)
- Latency for real-time response

Distributed optimization enables:
- Resilient operation (no single point of failure)
- Scalable to large fleets
- Privacy-preserving (local data stays local)
- Low-latency response (local decisions)

### 1.2 System Architecture

```
SYSTEM TOPOLOGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Grid Connection Point
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                  Station Bus                          │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│  │ EK3 │──│ EK3 │──│ EK3 │──│ EK3 │──│ EK3 │  ...  │
│  │  1  │  │  2  │  │  3  │  │  4  │  │  5  │       │
│  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘  └──┬──┘       │
│     │       │       │       │       │             │
│     └───────┴───────┴───────┴───────┘             │
│              CAN-FD Communication                  │
└───────────────────────────────────────────────────────┘

Communication Graph G = (M, E):
• Nodes M: EK3 modules
• Edges E: CAN-FD connectivity (typically ring or bus)
• Bandwidth: 5 Mbps shared
• Latency: < 1 ms per hop
```

---

## 2. Formal Problem Definition

### 2.1 Problem Instance

```
PROBLEM INSTANCE: I = (M, G, C, S)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Definition 2.1 (Module Set).** M = {m₁, m₂, ..., mₙ} is the set of EK3 modules with:
- Power capacity: P_i^max (nominal 3.3 kW per module)
- Current state: SOC_i (state of charge of connected battery)
- Temperature: T_i (module temperature)
- Efficiency curve: η_i(p) (power-dependent efficiency)

**Definition 2.2 (Communication Graph).** G = (M, E) is the peer-to-peer communication topology where:
- E ⊆ M × M defines which modules can communicate directly
- Typically: ring, bus, or mesh topology
- Adjacency matrix: A where A_ij = 1 if (i,j) ∈ E

**Definition 2.3 (Grid Signal).** S(t) = (f(t), V(t), π(t)) contains:
- f(t): Grid frequency [Hz], nominal 50 Hz
- V(t): Local voltage [V], nominal 400 V
- π(t): Real-time price [€/kWh]

**Definition 2.4 (Constraints).** C defines operational limits:
- Power bounds: P_i^min ≤ p_i ≤ P_i^max
- SOC bounds: SOC_i^min ≤ SOC_i ≤ SOC_i^max
- Temperature: T_i ≤ T_i^max
- Ramp rate: |dp_i/dt| ≤ R_i^max

---

### 2.2 Decision Variables

```
DECISION VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Local Power Allocation:
────────────────────────────────────────────
p_i ∈ ℝ         Active power for module i
                p_i > 0: discharging (V2G)
                p_i < 0: charging (G2V)

q_i ∈ ℝ         Reactive power for module i
                (for voltage support)

Dual Variables (for distributed algorithm):
────────────────────────────────────────────
λ ∈ ℝ           Global price signal (Lagrange multiplier)
                Emerges from consensus

μ_i ∈ ℝ         Local constraint multipliers
```

---

### 2.3 Local Cost Functions

```
LOCAL COST FUNCTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

f_i(p_i) = f_i^eff(p_i) + f_i^deg(p_i) + f_i^thermal(p_i)

Components:
────────────────────────────────────────────

1. Efficiency Loss:
   f_i^eff(p_i) = (1 - η_i(p_i)) × |p_i|

   where η_i(p_i) is the power-dependent efficiency:
   η_i(p) = η_max - α × (p/P_max)² - β × (p/P_max)

   Typical: η_max = 0.97, α = 0.02, β = 0.01

2. Battery Degradation:
   f_i^deg(p_i) = γ × |p_i|^δ × g(SOC_i)

   where:
   • γ: Degradation cost coefficient [€/kWh^δ]
   • δ ≈ 1.5 (superlinear in power)
   • g(SOC): SOC-dependent degradation multiplier
     g(SOC) = 1 + κ × (SOC - 0.5)²
     (Higher degradation at extreme SOC)

3. Thermal Stress:
   f_i^thermal(p_i) = ψ × max(0, T_i + θ×p_i² - T_threshold)²

   where θ is thermal resistance and ψ is penalty weight
```

### 2.4 Global Objective

```
GLOBAL OPTIMIZATION PROBLEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

maximize  Σᵢ [π(t) × p_i - f_i(p_i)]
          ─────────────────────────
          Revenue minus local cost

subject to:
    Σᵢ p_i = P_grid(t)           (C1: Power balance)
    P_i^min ≤ p_i ≤ P_i^max      (C2: Capacity bounds)
    SOC_i^min ≤ SOC_i ≤ SOC_i^max (C3: SOC bounds)
    T_i ≤ T_i^max                 (C4: Thermal limits)
    |dp_i/dt| ≤ R_i^max          (C5: Ramp limits)

Lagrangian:
────────────────────────────────────────────
L(p, λ) = Σᵢ [π × p_i - f_i(p_i)] - λ × (Σᵢ p_i - P_grid)

Dual decomposition:
    maximize_λ  minimize_p  L(p, λ)

Each module solves:
    p_i* = argmin_{p_i} [f_i(p_i) - (π - λ) × p_i]
           subject to local constraints
```

---

## 3. Distributed Formulation

### 3.1 Consensus Constraint

```
CONSENSUS FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instead of central coordination, use consensus:

For connected graph G, at convergence:
    λ_i = λ_j  ∀(i,j) ∈ E

Consensus update:
    λ_i^(k+1) = Σⱼ W_ij × λ_j^(k)

where W is a doubly stochastic weight matrix:
• Σⱼ W_ij = 1 (rows sum to 1)
• Σᵢ W_ij = 1 (columns sum to 1)
• W_ij > 0 only if (i,j) ∈ E or i = j

Common choice (Metropolis-Hastings):
    W_ij = 1 / (1 + max(d_i, d_j))  for (i,j) ∈ E
    W_ii = 1 - Σⱼ≠ᵢ W_ij

where d_i is the degree of node i.
```

### 3.2 ADMM Formulation

```
ADMM (Alternating Direction Method of Multipliers):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reformulation with auxiliary variables:
────────────────────────────────────────────

minimize  Σᵢ f_i(p_i)
subject to:
    p_i = z_i           (local copy constraint)
    Σᵢ z_i = P_grid     (global constraint)

Augmented Lagrangian:
────────────────────────────────────────────
L_ρ = Σᵢ [f_i(p_i) + y_i(p_i - z_i) + (ρ/2)||p_i - z_i||²]
      + λ(Σᵢ z_i - P_grid)

ADMM iterations:
────────────────────────────────────────────
1. Local p-update (parallel):
   p_i^(k+1) = argmin_{p_i} [f_i(p_i) + y_i^(k) p_i + (ρ/2)(p_i - z_i^(k))²]

2. Global z-update (requires coordination):
   z^(k+1) = argmin_z [(ρ/2) Σᵢ ||p_i^(k+1) - z_i + y_i^(k)/ρ||²]
             subject to Σᵢ z_i = P_grid

   Closed form: z_i^(k+1) = p_i^(k+1) + y_i^(k)/ρ - (1/n)(Σⱼ p_j^(k+1) + y_j^(k)/ρ - P_grid)

3. Dual update:
   y_i^(k+1) = y_i^(k) + ρ(p_i^(k+1) - z_i^(k+1))

Distributed z-update via consensus:
────────────────────────────────────────────
Replace global average with consensus:
    z̄^(k) = (1/n) Σᵢ (p_i^(k) + y_i^(k)/ρ)

Compute via average consensus:
    z̄_i^(k+1) = Σⱼ W_ij × z̄_j^(k)

After K_consensus iterations, all z̄_i ≈ z̄
```

### 3.3 Primal-Dual Gradient Method

```
PRIMAL-DUAL GRADIENT DESCENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Simpler alternative to ADMM:

Gradient updates:
────────────────────────────────────────────
1. Primal update (local):
   p_i^(k+1) = proj_C [p_i^(k) - α × (∇f_i(p_i^(k)) - λ^(k))]

   where proj_C projects onto local constraints

2. Dual update (consensus):
   λ_i^(k+1) = λ_i^(k) + β × (Σⱼ∈N(i) W_ij × (p_j^(k+1) - p_i^(k+1)) + (p_i^(k+1) - P_grid/n))

Step sizes:
────────────────────────────────────────────
• α: Primal step size, α < 1/L where L is Lipschitz constant of ∇f
• β: Dual step size, β < 1/(2×d_max) where d_max is max degree

Convergence: O(1/k) for convex f_i
```

---

## 4. Real-Time Constraints

### 4.1 Frequency Regulation Requirements

```
FREQUENCY REGULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Grid frequency deviation triggers power response:

Droop control:
────────────────────────────────────────────
P_response = -K_droop × (f - f_nominal)

where:
• f_nominal = 50 Hz (Europe) or 60 Hz (US)
• K_droop: Droop coefficient [kW/Hz]
• Typical: K_droop = 100 kW/Hz for station

Distributed droop:
────────────────────────────────────────────
Each module contributes:
    p_i = p_i^base - k_i × Δf

where k_i = K_droop × (P_i^max / Σⱼ P_j^max)

This is inherently distributed (no coordination needed).

Timing requirements:
────────────────────────────────────────────
• Primary response: < 30 seconds
• Secondary response: < 5 minutes
• Tertiary response: < 15 minutes

Our target: < 100 ms for local decision
```

### 4.2 Dynamic Topology

```
DYNAMIC TOPOLOGY HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules may join/leave during operation:

Join protocol:
────────────────────────────────────────────
1. New module m_new broadcasts JOIN message
2. Neighbors respond with current λ estimates
3. m_new initializes: λ_new = average of neighbors
4. Update weight matrix W to include m_new

Leave protocol:
────────────────────────────────────────────
1. Leaving module m_leave broadcasts LEAVE message
2. Neighbors remove m_leave from neighbor list
3. Update weight matrix W
4. Re-normalize remaining weights

Robustness:
────────────────────────────────────────────
• Consensus converges as long as graph stays connected
• Temporary disconnection: use last known values
• Permanent partition: each partition optimizes independently
```

---

## 5. Game-Theoretic Formulation

### 5.1 Non-Cooperative Game

```
GAME-THEORETIC FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model each module as strategic agent:

Players: N = {1, ..., n} (modules)

Strategy: p_i ∈ [P_i^min, P_i^max]

Payoff: u_i(p_i, p_{-i}) = π × p_i - f_i(p_i) - c_i(p_i, Σⱼ p_j)

where c_i captures externality (e.g., grid congestion)

Nash Equilibrium:
────────────────────────────────────────────
p* is Nash equilibrium if:
    u_i(p_i*, p_{-i}*) ≥ u_i(p_i, p_{-i}*)  ∀i, ∀p_i

For potential game (∃ potential function Φ):
    NE = argmax Φ(p)

Condition: ∂u_i/∂p_j = ∂u_j/∂p_i (symmetry in cross-effects)
```

### 5.2 Price of Anarchy

```
EFFICIENCY OF EQUILIBRIUM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Price of Anarchy (PoA):
    PoA = max_{NE} [Social_Optimum / Welfare(NE)]

For our setting with convex costs:
    PoA ≤ 1 + ε

where ε depends on cost function curvature.

Mechanism design:
────────────────────────────────────────────
Design payments to align incentives:

VCG mechanism:
    payment_i = Σⱼ≠ᵢ u_j(p_{-i}*) - Σⱼ≠ᵢ u_j(p*)

Ensures truthful reporting and efficient allocation.
```

---

## 6. Notation Summary

| Symbol | Description |
|--------|-------------|
| M | Set of EK3 modules |
| G = (M, E) | Communication graph |
| p_i | Power allocation for module i |
| P_i^max | Maximum power capacity |
| SOC_i | State of charge |
| T_i | Module temperature |
| η_i(p) | Efficiency function |
| f_i(p) | Local cost function |
| π(t) | Grid price signal |
| λ | Dual variable / consensus price |
| W | Consensus weight matrix |
| ρ | ADMM penalty parameter |
| α, β | Step sizes |
| K_droop | Droop coefficient |

---

## 7. Success Criteria

```
PERFORMANCE TARGETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Optimality:
────────────────────────────────────────────
• Suboptimality gap: < 1% vs centralized optimum
• Constraint satisfaction: 100%
• Convergence: < 50 iterations

Timing:
────────────────────────────────────────────
• Per-iteration time: < 1 ms
• Convergence time: < 50 ms
• Response to grid signal: < 100 ms

Communication:
────────────────────────────────────────────
• Messages per iteration: O(|E|) = O(n) for sparse graphs
• Message size: < 64 bytes (single CAN-FD frame)
• Bandwidth: < 100 kbps per module

Robustness:
────────────────────────────────────────────
• Tolerates 20% message loss
• Handles module join/leave within 1 second
• Graceful degradation under partition
```

---

## Related Documents

- `02-convergence-analysis.md` - Convergence proofs and rate bounds
- `03-algorithms.md` - Algorithm implementations
- `04-simulation.md` - Grid simulation scenarios
- `05-literature.md` - Distributed optimization references
- `tehnika/inzenjersko/en/07-v2g-control.md` - V2G control system
