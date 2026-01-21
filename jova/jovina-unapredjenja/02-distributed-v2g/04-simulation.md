# Distributed V2G Optimization: Simulation Scenarios

> **Topic:** Grid Simulation and Benchmark Scenarios
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document defines simulation scenarios, grid models, and validation methodology for distributed V2G optimization algorithms.

---

## 2. Grid Signal Models

### 2.1 Frequency Regulation

```
FREQUENCY SIGNAL MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Normal Operation:
────────────────────────────────────────────
f(t) = f_nom + Δf(t)

where:
• f_nom = 50 Hz (Europe) or 60 Hz (US)
• Δf(t) ~ N(0, σ_f²) with σ_f ≈ 0.02 Hz

Stochastic model (Ornstein-Uhlenbeck):
────────────────────────────────────────────
dΔf = -θ × Δf × dt + σ × dW

where:
• θ ≈ 0.1 (mean reversion rate)
• σ ≈ 0.01 Hz/√s (volatility)
• dW: Wiener process

Event-based perturbations:
────────────────────────────────────────────
Δf_event(t) = A × exp(-t/τ) × sin(ωt + φ)

• Generator trip: A = -0.5 Hz, τ = 30s
• Load step: A = 0.2 Hz, τ = 10s
• Renewable ramp: A = 0.1 Hz, τ = 60s

FREQUENCY SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SC-FREQ-NORMAL: 24-hour normal operation
• Δf within ±0.1 Hz
• Random walk with mean reversion

SC-FREQ-STRESS: High variability day
• Δf up to ±0.5 Hz
• Multiple generator/load events

SC-FREQ-EXTREME: Grid emergency
• Δf exceeds ±0.5 Hz
• Tests emergency response
```

### 2.2 Price Signals

```
ELECTRICITY PRICE MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Day-ahead price (deterministic component):
────────────────────────────────────────────
π_DA(h) = π_base × (1 + α × sin(2π(h-14)/24))

• π_base ≈ 0.10 €/kWh
• α ≈ 0.5 (50% daily swing)
• Peak at h = 14 (2 PM), trough at h = 2 (2 AM)

Real-time deviation:
────────────────────────────────────────────
π_RT(t) = π_DA(h) + Δπ(t)

where Δπ(t) ~ N(0, σ_π²) with σ_π ≈ 0.02 €/kWh

Spike model:
────────────────────────────────────────────
With probability p_spike ≈ 0.01 per hour:
    π_RT(t) = π_DA(h) × U(2, 5)  // 2-5x spike

PRICE SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SC-PRICE-TYPICAL: Normal day
• Price range: 0.05 - 0.15 €/kWh
• Predictable daily pattern

SC-PRICE-VOLATILE: High renewable day
• Price range: -0.05 - 0.25 €/kWh
• Negative prices during solar peak

SC-PRICE-SPIKE: Scarcity event
• Price spikes to 1.00 €/kWh
• Tests arbitrage capability
```

### 2.3 Grid Request Signals

```
POWER REQUEST MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aggregated grid request (from TSO/DSO):

P_grid(t) = P_base(t) + P_reg(t) + P_reserve(t)

Components:
────────────────────────────────────────────
P_base(t): Baseline schedule (day-ahead commitment)
• Step function, changes hourly
• Range: 0 to P_station_max

P_reg(t): Frequency regulation signal
• P_reg = K_droop × Δf(t)
• Fast varying (seconds timescale)
• Range: ±10% of P_station_max

P_reserve(t): Reserve activation
• Step changes on TSO command
• Duration: 15 min to 4 hours
• Range: 0 to P_reserve_contracted
```

---

## 3. Station Configurations

### 3.1 Small Station (10 Modules)

```
CONFIGURATION: STATION-S10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules: n = 10
Total capacity: 33 kW (10 × 3.3 kW)

Communication graph: Ring
────────────────────────────────────────────
    [1]──[2]──[3]──[4]──[5]
     │                    │
    [10]─[9]──[8]──[7]──[6]

Adjacency: Each module connects to 2 neighbors
Spectral gap: 1 - σ₂ ≈ 0.19

Module heterogeneity:
────────────────────────────────────────────
• P_max: 3.0-3.3 kW (±10%)
• Efficiency: 95-97%
• SOC_init: 20-80% (uniform)
• Temperature: 25-40°C
```

### 3.2 Medium Station (50 Modules)

```
CONFIGURATION: STATION-M50
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules: n = 50
Total capacity: 165 kW

Communication graph: 2D Grid (7×7 + 1)
────────────────────────────────────────────
    [1]─[2]─[3]─[4]─[5]─[6]─[7]
     │   │   │   │   │   │   │
    [8]─[9]─...─...─...─...─[14]
     │   │   │   │   │   │   │
    ...
     │
   [50]

Adjacency: 4-connected grid (interior), 2-3 (boundary)
Spectral gap: 1 - σ₂ ≈ 0.04

Use case: Bus depot charging station
```

### 3.3 Large Station (200 Modules)

```
CONFIGURATION: STATION-L200
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules: n = 200
Total capacity: 660 kW

Communication graph: Hierarchical
────────────────────────────────────────────
Level 0: 10 cluster heads (ring)
Level 1: 20 modules per cluster (star within cluster)

    [CH1]═══[CH2]═══[CH3]═══...═══[CH10]
     │        │        │              │
  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐       ┌──┴──┐
  │ 1-20│  │21-40│  │41-60│  ...  │181-200│

Spectral gap: Faster within cluster, slower between
Total convergence: O(log n) × cluster time

Use case: Large fleet depot
```

---

## 4. Simulation Scenarios

### 4.1 Scenario Definitions

```
SCENARIO: SC-V2G-BASIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-S10
Duration: 1 hour
Grid signal: Constant P_grid = 20 kW
Price: Constant π = 0.10 €/kWh
Purpose: Basic convergence validation

SCENARIO: SC-V2G-TRACKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-S10
Duration: 4 hours
Grid signal: Step changes every 15 min
Price: Time-varying (day-ahead + noise)
Purpose: Dynamic tracking capability

SCENARIO: SC-V2G-FREQUENCY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-M50
Duration: 1 hour
Grid signal: Frequency regulation (SC-FREQ-STRESS)
Price: Fixed
Purpose: Fast response capability

SCENARIO: SC-V2G-ARBITRAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-M50
Duration: 24 hours
Grid signal: Flexible (station decides)
Price: SC-PRICE-VOLATILE
Purpose: Revenue maximization

SCENARIO: SC-V2G-SCALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-L200
Duration: 1 hour
Grid signal: Mixed (baseline + regulation)
Price: Time-varying
Purpose: Scalability testing

SCENARIO: SC-V2G-ROBUST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: STATION-M50
Duration: 2 hours
Grid signal: Step changes
Price: Fixed
Faults: 10% packet loss, 2 module failures
Purpose: Robustness testing
```

### 4.2 Module State Scenarios

```
MODULE STATE SCENARIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MS-UNIFORM: All modules identical
• SOC = 50%, T = 30°C, P_max = 3.3 kW

MS-HETEROGENEOUS: Realistic variation
• SOC ~ U(20%, 80%)
• T ~ U(25°C, 45°C)
• P_max ~ N(3.3, 0.1) kW

MS-CONSTRAINED: Some modules limited
• 30% at SOC < 30% (limited discharge)
• 20% at T > 50°C (derated)
• 10% offline (maintenance)

MS-DYNAMIC: Time-varying state
• SOC evolves based on power flow
• T evolves based on thermal model
• Modules may become constrained mid-simulation
```

---

## 5. Performance Metrics

### 5.1 Optimization Metrics

```
OPTIMIZATION METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SUBOPTIMALITY GAP
   Definition: Gap from centralized optimal
   Formula: Gap = (f_distributed - f_optimal) / |f_optimal|
   Target: < 1%

2. CONSTRAINT SATISFACTION
   Definition: Fraction meeting power balance
   Formula: CS = 1 - |Σp_i - P_grid| / P_grid
   Target: > 99%

3. CONVERGENCE ITERATIONS
   Definition: Iterations to reach ε-accuracy
   Measure at: ε = 0.01, 0.001
   Target: < 50 for ε = 0.01

4. CONVERGENCE TIME
   Definition: Wall-clock time to converge
   Includes: Computation + communication
   Target: < 100 ms
```

### 5.2 Grid Service Metrics

```
GRID SERVICE METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. TRACKING ERROR
   Definition: RMS deviation from grid request
   Formula: TE = √(mean((Σp_i - P_grid)²))
   Target: < 1% of P_grid

6. RESPONSE TIME
   Definition: Time to reach 90% of step change
   Measure: After P_grid step change
   Target: < 500 ms

7. REGULATION PERFORMANCE (PJM score)
   Definition: Composite of accuracy, delay, precision
   Formula: Score = (accuracy + delay + precision) / 3
   Target: > 0.9

8. REVENUE
   Definition: Total earnings minus costs
   Formula: R = Σₜ [π(t) × Σᵢp_i(t) - Σᵢf_i(p_i(t))]
   Benchmark: vs. centralized optimal
```

### 5.3 Communication Metrics

```
COMMUNICATION METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. MESSAGES PER ITERATION
   Definition: Total messages sent per ADMM iteration
   Formula: M = n × d × K_inner (for consensus)
   Target: O(n × d) where d = avg degree

10. BANDWIDTH USAGE
    Definition: Bytes per second
    Formula: BW = M × msg_size × iteration_rate
    Target: < 100 kbps per module

11. COMMUNICATION ROUNDS
    Definition: Sequential message exchanges
    Formula: R = K_outer × K_inner
    Target: < 100 per optimization

12. PACKET LOSS TOLERANCE
    Definition: Max loss rate maintaining convergence
    Measure: Convergence with p_loss = 5%, 10%, 20%
    Target: Converge with 10% loss
```

---

## 6. Simulation Implementation

### 6.1 Simulation Architecture

```
SIMULATION ARCHITECTURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────┐
│                    Simulation Controller                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Grid   │  │   Time   │  │  Logger  │  │ Visualizer│   │
│  │  Signal  │  │ Stepper  │  │          │  │           │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬──────┘   │
└───────┼─────────────┼──────────────┼────────────┼───────────┘
        │             │              │            │
        ▼             ▼              ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Communication Layer                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     Message Queue (simulates CAN-FD network)        │   │
│  └─────────────────────────────────────────────────────┘   │
└───────┬─────────┬─────────┬─────────┬─────────┬─────────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
    │Module │ │Module │ │Module │ │Module │ │Module │
    │   1   │ │   2   │ │   3   │ │  ...  │ │   n   │
    └───────┘ └───────┘ └───────┘ └───────┘ └───────┘
```

### 6.2 Module Model

```python
MODULE SIMULATION MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class EK3Module:
    def __init__(self, id, params):
        self.id = id
        self.P_max = params.P_max
        self.P_min = -params.P_max  # Bidirectional

        # State
        self.p = 0.0          # Current power
        self.SOC = params.SOC_init
        self.T = params.T_init

        # Optimization state
        self.lambda_ = 0.0    # Dual variable
        self.z = 0.0          # ADMM z
        self.s = 0.0          # Consensus state

        # Cost function parameters
        self.alpha = params.alpha  # Quadratic cost
        self.beta = params.beta    # Linear cost
        self.gamma = params.gamma  # Degradation

    def local_cost(self, p):
        """Compute local cost f_i(p)."""
        efficiency_loss = (1 - self.efficiency(p)) * abs(p)
        degradation = self.gamma * abs(p)**1.5
        return self.alpha * p**2 + self.beta * abs(p) + degradation

    def local_gradient(self, p):
        """Compute gradient of local cost."""
        return 2 * self.alpha * p + self.beta * sign(p) + \
               1.5 * self.gamma * abs(p)**0.5 * sign(p)

    def solve_local_opt(self, lambda_, z, rho):
        """Solve local ADMM subproblem."""
        # argmin f_i(p) - lambda*p + (rho/2)(p - z)^2
        # For quadratic f_i, closed form exists
        # Otherwise use Newton or bisection

        target = lambda_ / rho + z
        # Simplified for quadratic:
        p_opt = (rho * target + self.beta) / (2*self.alpha + rho)
        return clip(p_opt, self.P_min, self.P_max)

    def update_state(self, p, dt):
        """Update SOC and temperature."""
        # SOC evolution
        self.SOC -= p * dt / self.battery_capacity
        self.SOC = clip(self.SOC, 0.1, 0.9)

        # Temperature evolution (simplified thermal model)
        P_loss = (1 - self.efficiency(p)) * abs(p)
        dT = (P_loss * self.R_th - (self.T - self.T_ambient) / self.tau_th) * dt
        self.T += dT
```

---

## 7. Expected Results

### 7.1 Convergence Benchmarks

```
EXPECTED CONVERGENCE (SC-V2G-BASIC):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Algorithm      | Iterations | Time    | Gap
───────────────┼────────────┼─────────┼────────
ADMM           | 25         | 50 ms   | < 0.1%
D-ADMM (K=5)   | 35         | 70 ms   | < 0.5%
Primal-Dual    | 100        | 100 ms  | < 1%
Gradient Track | 50         | 60 ms   | < 0.5%
```

### 7.2 Scalability

```
SCALABILITY (SC-V2G-SCALE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Modules | Iterations | Time/Iter | Total Time
────────┼────────────┼───────────┼───────────
10      | 30         | 2 ms      | 60 ms
50      | 40         | 3 ms      | 120 ms
200     | 60         | 5 ms      | 300 ms
1000    | 100        | 10 ms     | 1000 ms

Scaling: Sublinear in n (logarithmic for hierarchical)
```

---

## 8. Validation Criteria

```
VALIDATION CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

□ Power balance: |Σp_i - P_grid| < 0.01 × P_grid
□ Local constraints: P_min ≤ p_i ≤ P_max for all i
□ Consensus: max|λ_i - λ_j| < 0.01 × |λ̄|
□ Convergence: Residuals below threshold
□ Optimality: Within 1% of centralized solution
□ Timing: Convergence within 100 ms
□ Robustness: Converges with 10% packet loss
□ Scalability: Time scales sublinearly with n
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-convergence-analysis.md` - Theoretical guarantees
- `03-algorithms.md` - Algorithm implementations
- `05-literature.md` - Simulation references
