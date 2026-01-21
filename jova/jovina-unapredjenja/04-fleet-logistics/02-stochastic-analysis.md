# Stochastic Fleet Logistics: Uncertainty Analysis

> **Topic:** Stochastic Modeling and Robust Optimization
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document analyzes uncertainty sources in fleet logistics and develops stochastic models for demand, travel times, and system dynamics.

---

## 2. Uncertainty Sources

### 2.1 Demand Uncertainty

```
DEMAND UNCERTAINTY TAXONOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. RUL Prediction Error
────────────────────────────────────────────
Source: Predictive maintenance model inaccuracy
Model: RUL_actual = RUL_pred × exp(ε), ε ~ N(0, σ²)

Typical: σ ≈ 0.15 (15% relative error)

Probability of early failure:
P(fail before t | RUL_pred) = Φ((log(t/RUL_pred)) / σ)

2. Random Failures (Poisson)
────────────────────────────────────────────
Source: Unpredictable component failures
Model: N_fail(t, t+Δt) ~ Poisson(λ × n × Δt)

where:
• λ ≈ 0.001 failures/module/hour
• n = number of modules in fleet

Expected failures per day (1000 modules):
E[N_fail] = 0.001 × 1000 × 24 = 24 failures

3. Spatial Distribution
────────────────────────────────────────────
Failure location conditional on occurrence:
P(station = s | failure) = n_modules(s) / n_total

Can be non-uniform if some stations have older modules.

4. Demand Timing
────────────────────────────────────────────
Time window uncertainty:
• Bus schedule changes (±30 min typical)
• Charging session duration varies
• Priority changes based on route needs
```

### 2.2 Travel Time Uncertainty

```
TRAVEL TIME UNCERTAINTY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Model: t_ij ~ LogNormal(μ_ij, σ_ij²)

Parameters from historical data:
────────────────────────────────────────────
μ_ij = log(t̄_ij) - σ_ij²/2  (mean-corrected)
σ_ij = f(distance, time_of_day, route_type)

Time-of-day effects:
────────────────────────────────────────────
σ_ij(hour) = σ_base × (1 + α × congestion(hour))

congestion(hour):
• 7-9 AM: 1.5 (morning rush)
• 12-1 PM: 1.0 (lunch)
• 5-7 PM: 1.8 (evening rush)
• Night: 0.5 (low variability)

Correlation:
────────────────────────────────────────────
Travel times on nearby routes are correlated.
Correlation matrix: Σ_travel

For routes sharing a road segment:
Corr(t_ij, t_kl) ≈ |shared_length| / |total_length|
```

### 2.3 Service Time Uncertainty

```
SERVICE TIME UNCERTAINTY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Module replacement time:
────────────────────────────────────────────
t_service ~ LogNormal(μ_s, σ_s²)

Components:
• Access time: Positioning vehicle, opening bay
• Disconnect: Electrical, cooling connections
• Physical swap: Remove old, insert new
• Reconnect: Connections, verification
• Testing: Functional check

Typical:
• μ_s = log(20 min)
• σ_s = 0.3 (30% variability)
• 90th percentile ≈ 30 min

Factors affecting variance:
────────────────────────────────────────────
• Module location on bus (edge vs. center)
• Technician experience
• Environmental conditions
• Equipment availability
```

---

## 3. Stochastic Demand Models

### 3.1 Compound Poisson Model

```
COMPOUND POISSON DEMAND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total demand in [0, t]:
D(t) = Σᵢ₌₁^{N(t)} Xᵢ

where:
• N(t) ~ Poisson(λt): Number of failure events
• Xᵢ: Number of modules per event (typically 1)

For single-module failures (Xᵢ = 1):
D(t) ~ Poisson(λt)

Properties:
────────────────────────────────────────────
E[D(t)] = λt
Var[D(t)] = λt
P(D(t) = k) = (λt)^k × exp(-λt) / k!

Station-specific:
D_s(t) ~ Poisson(λ_s × t)
where λ_s = λ × (n_modules_s / n_total)
```

### 3.2 Scenario Generation

```
SCENARIO GENERATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Method 1: Monte Carlo Sampling
────────────────────────────────────────────
for s = 1 to N_scenarios:
    # Sample failure count
    n_failures = Poisson(λ × n_modules × T)

    # Sample failure times (uniform given count)
    times = sort(Uniform(0, T) for _ in range(n_failures))

    # Sample failure locations
    locations = [sample_station() for _ in range(n_failures)]

    scenario[s] = zip(times, locations)

Method 2: Scenario Tree
────────────────────────────────────────────
Build tree with branching at decision points:

          [t=0]
         /     \
    [low demand] [high demand]
       /   \        /    \
     ...   ...    ...    ...

Each node: Conditional distribution given history

Method 3: Moment Matching
────────────────────────────────────────────
Generate scenarios matching:
• Mean demand
• Variance
• Correlation structure
• Tail quantiles

Optimization:
min Σᵢ pᵢ × ||moment(scenario_i) - moment_target||²
```

### 3.3 Demand Forecasting

```
DEMAND FORECAST MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Planned demand (from RUL):
────────────────────────────────────────────
D_planned(t) = |{m : RUL(m) < t + H}|

where H is planning horizon

Confidence interval:
D_planned ∈ [D_low, D_high] with probability 1-α

D_low = Σₘ P(RUL(m) > t + H)
D_high = Σₘ P(RUL(m) < t)

Random demand forecast:
────────────────────────────────────────────
D_random(t, t+Δt) ~ Poisson(λ_random × n × Δt)

Combined forecast:
D_total = D_planned + D_random

Prediction interval:
[D_total - z_{α/2}√Var, D_total + z_{α/2}√Var]
```

---

## 4. Robust Optimization

### 4.1 Uncertainty Sets

```
UNCERTAINTY SET DEFINITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Box Uncertainty:
────────────────────────────────────────────
U_box = {d : d̄ - Δ ≤ d ≤ d̄ + Δ}

• Simple but conservative
• All extremes simultaneously possible

Ellipsoidal Uncertainty:
────────────────────────────────────────────
U_ellipsoid = {d : (d - d̄)ᵀ Σ⁻¹ (d - d̄) ≤ Ω²}

• Less conservative than box
• Accounts for correlation
• Ω controls size (Ω² ~ χ²(n) for probability)

Budget Uncertainty (Bertsimas-Sim):
────────────────────────────────────────────
U_budget = {d : dᵢ = d̄ᵢ + zᵢd̂ᵢ, |zᵢ| ≤ 1, ||z||₁ ≤ Γ}

• Only Γ parameters deviate maximally
• Γ = 0: nominal case
• Γ = n: worst case (box)
• Γ ≈ √n: good trade-off

Probability guarantee:
P(d ∈ U_budget) ≥ 1 - exp(-Γ²/2n)
```

### 4.2 Robust Counterpart

```
ROBUST COUNTERPART FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original constraint:
Ax ≥ d

Robust counterpart (budget uncertainty):
────────────────────────────────────────────
Ax ≥ d̄ + π × Γ + p

where:
πᵢ + pᵢ ≥ d̂ᵢ  for all i
π, p ≥ 0

This is a linear constraint (tractable).

For inventory constraint Iₛ ≥ D_s:
────────────────────────────────────────────
Iₛ ≥ D̄ₛ + Γₛ × max(D̂ₛ)

Practical: Iₛ ≥ D̄ₛ + Γₛ × σ_s

where σ_s is demand standard deviation at station s.
```

### 4.3 Distributionally Robust Optimization

```
DISTRIBUTIONALLY ROBUST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ambiguity set (moment-based):
────────────────────────────────────────────
P = {P : E_P[d] = μ, E_P[(d-μ)(d-μ)ᵀ] ⪯ Σ}

Distributionally robust constraint:
inf_{P ∈ P} P(Ax ≥ d) ≥ 1 - ε

Reformulation (Calafiore-El Ghaoui):
────────────────────────────────────────────
For single constraint aᵀx ≥ d:

aᵀx ≥ μ_d + κ × σ_d

where κ = √((1-ε)/ε) (exact for Chebyshev)

Better bound with known support [d_min, d_max]:
κ = √(ε(1-ε)) × (d_max - d_min) / σ_d (Scarf bound)
```

---

## 5. Value of Information

### 5.1 Value of Perfect Information (VPI)

```
VALUE OF PERFECT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Definition:
────────────────────────────────────────────
VPI = E_ξ[min_x f(x, ξ)] - min_x E_ξ[f(x, ξ)]

• First term: Expected cost with perfect foresight
• Second term: Cost with stochastic optimization

Interpretation:
• VPI = 0: Uncertainty doesn't matter (robust solution)
• VPI large: Information is valuable (invest in prediction)

Computation:
────────────────────────────────────────────
1. Generate scenarios {ξ₁, ..., ξₙ}
2. For each ξᵢ: solve deterministic problem, get f*(ξᵢ)
3. VPI_estimate = (1/N) Σᵢ f*(ξᵢ) - f*_stochastic

Typical for fleet logistics:
VPI ≈ 5-15% of total cost
```

### 5.2 Expected Value of Perfect Information (EVPI)

```
EVPI ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For VRPTW-PD with stochastic demand:

Sources of EVPI:
────────────────────────────────────────────
1. Route planning: Know exact demands before routing
2. Inventory: Know failures before positioning spares
3. Scheduling: Know travel times before departure

Decomposition:
────────────────────────────────────────────
EVPI_total = EVPI_demand + EVPI_travel + EVPI_service

Typical magnitudes:
• EVPI_demand: 8% of routing cost
• EVPI_travel: 3% of routing cost
• EVPI_service: 2% of routing cost
```

### 5.3 Value of Stochastic Solution (VSS)

```
VALUE OF STOCHASTIC SOLUTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Definition:
────────────────────────────────────────────
VSS = E_ξ[f(x_EV, ξ)] - E_ξ[f(x_SP, ξ)]

where:
• x_EV: Solution using expected value problem
• x_SP: Solution using stochastic program

Interpretation:
• VSS = benefit of using stochastic optimization
• VSS large: Stochastic approach worthwhile

Bounds:
────────────────────────────────────────────
0 ≤ VSS ≤ EVPI

If VSS ≈ EVPI: Stochastic program captures most value
If VSS << EVPI: Room for improvement (better modeling)
```

---

## 6. Risk Measures

### 6.1 Conditional Value at Risk (CVaR)

```
CVaR FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Definition:
────────────────────────────────────────────
CVaR_α(f) = E[f | f ≥ VaR_α(f)]

• Average cost in worst α% of scenarios
• α = 0.05: Average of worst 5%

Linear programming formulation:
────────────────────────────────────────────
minimize  η + (1/(1-α)) × E[max(0, f(x,ξ) - η)]

For scenarios {ξ₁, ..., ξₙ} with equal probability:
minimize  η + (1/(N(1-α))) × Σᵢ zᵢ
subject to: zᵢ ≥ f(x, ξᵢ) - η
            zᵢ ≥ 0

Mean-CVaR trade-off:
────────────────────────────────────────────
minimize  λ × E[f(x,ξ)] + (1-λ) × CVaR_α[f(x,ξ)]

• λ = 1: Risk-neutral (minimize expected cost)
• λ = 0: Risk-averse (minimize worst-case)
```

### 6.2 Downside Risk

```
DOWNSIDE RISK MEASURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Semivariance:
────────────────────────────────────────────
SV = E[max(0, f - μ)²]

• Only penalizes upside deviations (costs above mean)
• Symmetric variance penalizes good outcomes too

Target shortfall:
────────────────────────────────────────────
TS_τ = E[max(0, f - τ)]

• τ: Target cost level
• Expected excess over target

Integrated chance constraint:
────────────────────────────────────────────
P(f ≤ τ) ≥ 1 - ε

AND

E[f | f > τ] ≤ τ × (1 + δ)

• Probability of meeting target
• Conditional cost if target missed
```

---

## 7. Scenario Reduction

### 7.1 Reduction Methods

```
SCENARIO REDUCTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Goal: Reduce N scenarios to n << N while preserving distribution.

Method 1: Fast Forward Selection
────────────────────────────────────────────
1. Start with empty set S = {}
2. Add scenario minimizing distance to remaining:
   s* = argmin_{s ∉ S} Σ_{s' ∉ S∪{s}} p_{s'} × d(s, s')
3. Repeat until |S| = n
4. Redistribute probabilities

Method 2: Backward Reduction
────────────────────────────────────────────
1. Start with all scenarios S = {1, ..., N}
2. Remove scenario with smallest impact:
   s* = argmin_{s ∈ S} p_s × min_{s' ∈ S\{s}} d(s, s')
3. Add probability to nearest remaining
4. Repeat until |S| = n

Distance metric:
────────────────────────────────────────────
d(ξ, ξ') = ||ξ - ξ'||_p  (typically p = 2)

For demand vectors: Euclidean distance
For time series: DTW or Wasserstein distance
```

### 7.2 Scenario Quality Metrics

```
QUALITY METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Wasserstein Distance:
   W_p(P, P̂) = (inf_{γ} E_{(ξ,ξ')~γ}[d(ξ,ξ')^p])^{1/p}

   Measures distance between original and reduced distributions.

2. In-sample Stability:
   |f(x*, original) - f(x*, reduced)| / f(x*, original)

   Solution quality on original scenarios.

3. Out-of-sample Performance:
   E_new[f(x*_reduced, ξ)]

   Performance on new test scenarios.

Target: n scenarios achieving < 5% in-sample error.
```

---

## 8. Summary

```
UNCERTAINTY MODELING SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Source          | Model                  | Parameters
────────────────┼────────────────────────┼──────────────
RUL prediction  | LogNormal(μ, σ²)       | σ ≈ 0.15
Random failures | Poisson(λt)            | λ ≈ 0.001/hr
Travel time     | LogNormal(μ_ij, σ_ij²) | σ_ij ~ 0.2-0.4
Service time    | LogNormal(μ_s, σ_s²)   | σ_s ≈ 0.3

Approach        | When to Use            | Complexity
────────────────┼────────────────────────┼──────────────
Stochastic prog | High VSS, moderate N   | High
Robust opt      | Unknown distribution   | Medium
Chance const    | Service level targets  | Medium
CVaR            | Risk-averse decisions  | Medium
Rolling horizon | Online operation       | Medium
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `03-algorithms.md` - Solution algorithms
- `04-simulation.md` - Fleet scenarios
- `05-literature.md` - Stochastic optimization literature
