# Stochastic Fleet Logistics: Problem Formulation

> **Topic:** Stochastic VRPTW-PD for Module Maintenance Logistics
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document provides a complete mathematical formulation for stochastic fleet logistics optimization, extending the Vehicle Routing Problem with Time Windows and Pickup-Delivery (VRPTW-PD) to handle uncertainty in module failures and maintenance demands.

### 1.1 Motivation

EK3 module maintenance logistics involves:
- **Predictive replacement:** Replace modules before failure based on RUL predictions
- **Reactive replacement:** Emergency response to unexpected failures
- **Spare inventory:** Maintain distributed spare modules across stations
- **Route optimization:** Efficient routing of maintenance vehicles

Key challenges with stochastic demand:
- RUL predictions have uncertainty (±15% typical)
- Unexpected failures occur (Poisson process)
- Demand varies by station and time
- Inventory decisions couple with routing

### 1.2 System Context

```
LOGISTICS SYSTEM:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    ┌─────────────────┐
                    │  Central Depot  │
                    │  (Spare Stock)  │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    ┌───────────┐    ┌───────────┐    ┌───────────┐
    │ Station 1 │    │ Station 2 │    │ Station 3 │
    │  n₁ buses │    │  n₂ buses │    │  n₃ buses │
    │  s₁ spare │    │  s₂ spare │    │  s₃ spare │
    └───────────┘    └───────────┘    └───────────┘

    • Each station: Charging depot with buses
    • Each bus: Multiple EK3 modules
    • Spares: Distributed at stations + central depot
    • Vehicles: Maintenance vans for transport
```

---

## 2. Formal Problem Definition

### 2.1 Problem Instance

```
PROBLEM INSTANCE: I = (S, B, M, V, D, H)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Definition 2.1 (Station Set).** S = {s₀, s₁, ..., sₖ} where:
- s₀: Central depot (unlimited spares, no buses)
- sᵢ (i ≥ 1): Charging stations
- Location: loc(sᵢ) ∈ ℝ²
- Spare capacity: cap(sᵢ) (max spares storable)
- Current spares: spare(sᵢ, t) at time t

**Definition 2.2 (Bus Fleet).** B = {b₁, b₂, ..., bₘ} where:
- Home station: home(bⱼ) ∈ S \ {s₀}
- Schedule: sched(bⱼ) = [(t_out, t_in), ...] (departure/arrival times)
- Modules: modules(bⱼ) = {m₁, ..., mₙ} (EK3 modules on bus)

**Definition 2.3 (Module Set).** M = {m₁, m₂, ..., mₙ} where:
- Host bus: bus(mᵢ)
- Health index: HI(mᵢ, t) ∈ [0, 1]
- Predicted RUL: RUL(mᵢ, t) with uncertainty σ_RUL

**Definition 2.4 (Vehicle Fleet).** V = {v₁, v₂, ..., vᵥ} where:
- Capacity: Q (modules per vehicle)
- Speed: speed(vₖ)
- Start location: start(vₖ) ∈ S

**Definition 2.5 (Demand).** D(t) is the set of maintenance demands:
- Planned demand: Dₚ(t) from RUL predictions
- Stochastic demand: Dₛ(t) ~ Poisson(λ) (random failures)
- Total: D(t) = Dₚ(t) ∪ Dₛ(t)

**Definition 2.6 (Planning Horizon).** H = [0, T] with:
- Planning period: T (e.g., 24 hours)
- Time discretization: Δt (e.g., 15 minutes)

---

### 2.2 Stochastic Demand Model

```
STOCHASTIC DEMAND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Planned Demand (from RUL predictions):
────────────────────────────────────────────
For each module mᵢ with RUL(mᵢ, t) ≤ threshold:
    demand dᵢ = (mᵢ, bus(mᵢ), t_available)

where t_available ∈ sched(bus(mᵢ)) is next available slot.

RUL Uncertainty:
────────────────────────────────────────────
RUL_actual ~ LogNormal(log(RUL_pred), σ²)

Probability of failure before time t:
P(failure ≤ t | RUL_pred) = Φ((log(t) - log(RUL_pred)) / σ)

where Φ is standard normal CDF.

Random Failures (Poisson process):
────────────────────────────────────────────
Number of failures in [t, t+Δt]:
N_fail ~ Poisson(λ × n_modules × Δt)

where:
• λ ≈ 0.001 failures/module/hour (typical)
• n_modules: total modules in fleet

Failure location:
• Uniform across all modules not already flagged
• Station of failure: home(bus(failed_module))
```

### 2.3 Decision Variables

```
DECISION VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Routing Variables:
────────────────────────────────────────────
xᵢⱼₖ ∈ {0, 1}    Vehicle k travels from i to j
                  i, j ∈ S ∪ D (stations or demand points)

tᵢₖ ∈ ℝ⁺         Arrival time of vehicle k at location i

Assignment Variables:
────────────────────────────────────────────
yᵈₖ ∈ {0, 1}     Demand d assigned to vehicle k

Inventory Variables:
────────────────────────────────────────────
Iₛ(t) ∈ ℤ⁺      Spare inventory at station s at time t
rₛ(t) ∈ ℤ⁺      Replenishment quantity to station s at time t

Load Variables:
────────────────────────────────────────────
Lₖ(i) ∈ ℤ⁺      Load of vehicle k after visiting location i
                 (number of modules carried)
```

---

### 2.4 Constraints

```
CONSTRAINT SET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C1: Demand Coverage
────────────────────────────────────────────
Each demand must be served:
∀d ∈ D:  Σₖ yᵈₖ = 1

C2: Time Windows
────────────────────────────────────────────
Service within bus availability:
∀d ∈ D:  tᵈₖ ∈ [t_earliest(d), t_latest(d)]

where:
• t_earliest: Bus arrival at station
• t_latest: Bus departure time - service_duration

C3: Vehicle Capacity
────────────────────────────────────────────
∀k, ∀i:  Lₖ(i) ≤ Q

Load evolution:
Lₖ(j) = Lₖ(i) + pickup(j) - delivery(j)

C4: Flow Conservation
────────────────────────────────────────────
∀k, ∀i ∈ S:  Σⱼ xᵢⱼₖ = Σⱼ xⱼᵢₖ

C5: Vehicle Start/End
────────────────────────────────────────────
Each vehicle starts and ends at depot:
∀k:  Σⱼ x_{s₀,j,k} = 1
∀k:  Σᵢ x_{i,s₀,k} = 1

C6: Subtour Elimination (MTZ)
────────────────────────────────────────────
∀i, j, k (i ≠ j, i ≠ s₀):
    uᵢₖ - uⱼₖ + |S| × xᵢⱼₖ ≤ |S| - 1

C7: Inventory Balance
────────────────────────────────────────────
∀s ∈ S, ∀t:
    Iₛ(t+1) = Iₛ(t) + rₛ(t) - consumption(s, t)

where consumption(s, t) = demands served at s in [t, t+1]

C8: Inventory Bounds
────────────────────────────────────────────
∀s ∈ S, ∀t:  0 ≤ Iₛ(t) ≤ cap(s)

C9: Time Consistency
────────────────────────────────────────────
∀i, j, k with xᵢⱼₖ = 1:
    tⱼₖ ≥ tᵢₖ + service(i) + travel(i, j)
```

---

### 2.5 Objective Function

```
OBJECTIVE FUNCTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-objective formulation:

minimize  f = f_travel + α×f_late + β×f_inventory + γ×f_unserved

Components:
────────────────────────────────────────────

1. Travel Cost:
   f_travel = Σₖ Σᵢⱼ c_ij × xᵢⱼₖ

   where c_ij = travel_time(i, j) or distance

2. Tardiness Cost:
   f_late = Σᵈ max(0, tᵈ - t_latest(d))

   Penalize late service (bus delayed)

3. Inventory Holding Cost:
   f_inventory = Σₛ Σₜ h_s × Iₛ(t)

   where h_s = holding cost per module per time unit

4. Unserved Demand Cost:
   f_unserved = Σᵈ M × (1 - Σₖ yᵈₖ)

   where M = large penalty for unserved demand

Weight selection:
────────────────────────────────────────────
• α = 100: Strong penalty for late service
• β = 0.1: Moderate inventory cost
• γ = 1000: Very high penalty for unserved
```

---

## 3. Stochastic Formulation

### 3.1 Two-Stage Stochastic Program

```
TWO-STAGE FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stage 1 (Here-and-Now): Decide before uncertainty revealed
────────────────────────────────────────────
• Inventory positioning: Iₛ(0) for all s
• Planned routes for known demands
• Reserve capacity allocation

Stage 2 (Wait-and-See): Recourse after observing ξ
────────────────────────────────────────────
• Handle realized random demands
• Re-routing of vehicles
• Emergency dispatch if needed

Formulation:
────────────────────────────────────────────
minimize  c₁ᵀx + E_ξ[Q(x, ξ)]

where:
• x: First-stage decisions (inventory, base routes)
• ξ: Random demand realization
• Q(x, ξ): Optimal second-stage cost given x and ξ

Second-stage problem:
Q(x, ξ) = min{c₂ᵀy : Wy ≥ h - Tx, y ≥ 0}

• y: Second-stage decisions (recourse routing)
• T: Technology matrix (how x affects second stage)
• W: Recourse matrix
• h: Realized demand vector
```

### 3.2 Chance Constraints

```
CHANCE-CONSTRAINED FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Service level constraint:
────────────────────────────────────────────
P(all demands served on time) ≥ 1 - ε

where ε = 0.05 (95% service level target)

Reformulation (for each demand d):
P(tᵈ ≤ t_latest(d)) ≥ 1 - ε_d

With uncertain travel times t_ij ~ N(μ_ij, σ_ij²):
    μ_arrival(d) + Φ⁻¹(1 - ε_d) × σ_arrival(d) ≤ t_latest(d)

Inventory service level:
────────────────────────────────────────────
P(Iₛ(t) ≥ demand(s, t)) ≥ 1 - ε_inv

For Poisson demand D ~ Poisson(λₛ):
    Iₛ(t) ≥ F⁻¹_Poisson(1 - ε_inv; λₛ)

Safety stock:
SS_s = Φ⁻¹(1 - ε_inv) × √(λₛ)
```

### 3.3 Robust Formulation

```
ROBUST OPTIMIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uncertainty set:
────────────────────────────────────────────
U = {d : d = d̄ + Σᵢ zᵢ × d̂ᵢ, ||z||₁ ≤ Γ}

where:
• d̄: Nominal demand
• d̂ᵢ: Deviation vectors
• Γ: Budget of uncertainty (controls conservatism)

Robust counterpart:
────────────────────────────────────────────
minimize  max_{d ∈ U} f(x, d)

For linear constraints Ax ≥ d:
    Ax ≥ d̄ + Γ × max_i |d̂ᵢ|

Adjustable robust:
────────────────────────────────────────────
Allow recourse decisions y(d) to adapt to realized demand:
minimize  max_{d ∈ U} [c₁ᵀx + c₂ᵀy(d)]
subject to: Ax + By(d) ≥ d  ∀d ∈ U

Affine decision rules: y(d) = y₀ + Yd
• Tractable approximation
• Good empirical performance
```

---

## 4. Multi-Period Extension

### 4.1 Rolling Horizon

```
ROLLING HORIZON FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

At each decision epoch τ:

1. Observe current state:
   • Current inventory: I(τ)
   • Vehicle positions: pos(τ)
   • Known demands: D_known(τ)
   • Predicted demands: D_pred(τ, τ+H)

2. Solve optimization over horizon [τ, τ+H]:
   minimize  f(x, τ, τ+H)
   subject to: constraints over [τ, τ+H]

3. Implement decisions for [τ, τ+Δτ]

4. Advance to τ ← τ + Δτ, repeat

Horizon parameters:
────────────────────────────────────────────
• H = 4 hours (planning horizon)
• Δτ = 15 minutes (re-planning frequency)
• Look-ahead includes predicted demands
```

### 4.2 Inventory Evolution

```
INVENTORY DYNAMICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

State equation:
────────────────────────────────────────────
Iₛ(t+1) = Iₛ(t) + arrivals(s, t) - departures(s, t)

arrivals(s, t) = Σₖ (modules delivered by vehicle k at s in [t, t+1])
departures(s, t) = demands served at s in [t, t+1]

Reorder policy (s, S):
────────────────────────────────────────────
If Iₛ(t) ≤ s_threshold:
    order S_target - Iₛ(t) modules for delivery

• s_threshold = safety stock + lead time demand
• S_target = optimal inventory level (newsvendor)

Newsvendor optimal:
────────────────────────────────────────────
S* = F⁻¹((p - c) / (p + h))

where:
• p: Penalty for stockout
• c: Ordering cost
• h: Holding cost
• F: Demand distribution CDF
```

---

## 5. Notation Summary

| Symbol | Description |
|--------|-------------|
| S | Set of stations |
| B | Set of buses |
| M | Set of modules |
| V | Set of vehicles |
| D | Set of demands |
| xᵢⱼₖ | Routing binary (vehicle k: i→j) |
| yᵈₖ | Assignment binary (demand d to vehicle k) |
| tᵢₖ | Arrival time of vehicle k at i |
| Iₛ(t) | Inventory at station s at time t |
| Lₖ(i) | Load of vehicle k at location i |
| Q | Vehicle capacity |
| λ | Failure rate (Poisson) |
| Γ | Uncertainty budget (robust) |
| H | Planning horizon |

---

## 6. Success Criteria

```
PERFORMANCE TARGETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Service Level:
────────────────────────────────────────────
• On-time service: > 95%
• Unserved demands: < 1%
• Emergency response: < 2 hours

Efficiency:
────────────────────────────────────────────
• Vehicle utilization: > 70%
• Route efficiency: < 10% excess vs. optimal
• Inventory turnover: > 12x per year

Cost:
────────────────────────────────────────────
• Total logistics cost: minimize
• Inventory holding: < 5% of module value/year
• Transportation: < 10% of service revenue
```

---

## Related Documents

- `02-stochastic-analysis.md` - Uncertainty modeling
- `03-algorithms.md` - Solution algorithms
- `04-simulation.md` - Fleet scenarios
- `05-literature.md` - VRP literature
- `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md`
