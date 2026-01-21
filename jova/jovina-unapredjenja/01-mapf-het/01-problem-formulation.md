# MAPF-HET: Problem Formulation

> **Topic:** Multi-Agent Path Finding with Heterogeneous Agents
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document provides a complete mathematical formulation of the Multi-Agent Path Finding with Heterogeneous Agents (MAPF-HET) problem as it applies to coordinated robot battery swap operations in EV charging stations.

### 1.1 Motivation

Modern EV charging depots require rapid battery swap operations to maintain fleet schedules. Multiple robots with different capabilities must coordinate to perform various tasks (battery removal, module replacement, diagnostics) within strict time windows defined by bus departure schedules.

### 1.2 Distinction from Standard MAPF

Standard MAPF assumes:
- Homogeneous agents
- Simple go-to-goal objectives
- Deterministic execution times
- Soft or no deadlines

Our variant introduces:
- Heterogeneous robot types with different capabilities
- Mixed workspace geometry (1D rail + 2D mobile)
- Task assignment coupled with path planning
- Hard deadlines from operational schedules
- Stochastic task durations

---

## 2. Formal Problem Definition

### 2.1 Problem Instance

```
PROBLEM INSTANCE: I = (W, R, T, Θ, D)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Definition 2.1 (Workspace).** The workspace is a tuple W = (G, O, L) where:
- G = (V, E) is a graph representing traversable space
- O ⊂ V is the set of obstacle vertices (forbidden)
- L: V → ℝ² maps vertices to physical locations

**Definition 2.2 (Robot Set).** R = {r₁, r₂, ..., rₙ} is the set of robots with:
- Type function τ: R → T where T = {A, B}
- Start position s: R → V
- Capability function κ: R → 2^Θ_types

**Definition 2.3 (Robot Types).**
```
Type A (Mobile Robot):
────────────────────────
• Workspace: WA ⊂ W (restricted to bus bay area)
• Motion model: Holonomic, v_max = 0.5 m/s
• Payload: 50 kg (single module)
• DOF: 6-axis manipulator

Type B (Rail-Mounted Robot):
────────────────────────
• Workspace: WB = W (full station access)
• Motion model: 1D rail, v_max = 2.0 m/s
• Payload: 500 kg (full battery pack)
• DOF: 6-axis manipulator + linear rail
```

**Definition 2.4 (Task Set).** Θ = {θ₁, θ₂, ..., θₘ} is the set of tasks with:
- Type: type(θᵢ) ∈ {SWAP_BATTERY, SWAP_MODULE, DIAGNOSE, CLEAN}
- Location: loc(θᵢ) ∈ V
- Duration: dur(θᵢ) ~ D(μᵢ, σᵢ) (stochastic)
- Precedence: pred(θᵢ) ⊆ Θ
- Compatible robots: compat(θᵢ) ⊆ T

**Definition 2.5 (Deadline).** D ∈ ℝ⁺ is the hard deadline (bus departure time).

---

### 2.2 Decision Variables

```
DECISION VARIABLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Assignment Variables:**
```
aᵢⱼ ∈ {0, 1}    ∀i ∈ Θ, j ∈ R
────────────────────────────
aᵢⱼ = 1 iff task θᵢ is assigned to robot rⱼ
```

**Path Variables:**
```
πⱼ = (v₀ʲ, v₁ʲ, ..., vₜʲ)    ∀j ∈ R
────────────────────────────
πⱼ is the path of robot rⱼ through workspace graph G
where vₖʲ ∈ V is the position at discrete time step k
```

**Schedule Variables:**
```
sᵢ ∈ [0, D]    ∀i ∈ Θ
────────────────────────────
sᵢ is the start time of task θᵢ
```

**Completion Variables:**
```
cᵢ = sᵢ + dur(θᵢ)    ∀i ∈ Θ
────────────────────────────
cᵢ is the completion time of task θᵢ
```

---

### 2.3 Constraints

```
CONSTRAINT SET: C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**C1: Task Assignment (each task assigned exactly once)**
```
∀i ∈ Θ:  Σⱼ∈R aᵢⱼ = 1
```

**C2: Capability Compatibility**
```
∀i ∈ Θ, ∀j ∈ R:  aᵢⱼ = 1 ⟹ τ(rⱼ) ∈ compat(θᵢ)
```

**C3: Precedence Constraints**
```
∀i ∈ Θ, ∀k ∈ pred(θᵢ):  cₖ ≤ sᵢ
```

**C4: Collision Avoidance (vertex)**
```
∀j₁, j₂ ∈ R, j₁ ≠ j₂, ∀t:  vₜʲ¹ ≠ vₜʲ² ∨ vₜʲ¹ ∈ V_shared
```
where V_shared are designated shared workspace vertices.

**C5: Collision Avoidance (edge)**
```
∀j₁, j₂ ∈ R, j₁ ≠ j₂, ∀t:  ¬((vₜʲ¹, vₜ₊₁ʲ¹) = (vₜ₊₁ʲ², vₜʲ²))
```

**C6: Task Location Constraint**
```
∀i ∈ Θ, ∀j ∈ R:  aᵢⱼ = 1 ⟹ ∃t: vₜʲ = loc(θᵢ) ∧ t ∈ [sᵢ, cᵢ]
```

**C7: Deadline Constraint**
```
∀i ∈ Θ:  cᵢ ≤ D
```

**C8: Workspace Restriction**
```
∀j ∈ R, τ(rⱼ) = A:  ∀t: vₜʲ ∈ WA
```

**C9: Single Task Execution**
```
∀j ∈ R, ∀t:  |{i ∈ Θ : aᵢⱼ = 1 ∧ t ∈ [sᵢ, cᵢ]}| ≤ 1
```

---

### 2.4 Objective Function

```
OBJECTIVE FUNCTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Primary Objective (Makespan Minimization):**
```
minimize  C_max = max{cᵢ : i ∈ Θ}
```

**Alternative Objectives:**

**Sum of Completion Times:**
```
minimize  Σᵢ∈Θ cᵢ
```

**Weighted Tardiness:**
```
minimize  Σᵢ∈Θ wᵢ × max(0, cᵢ - dᵢ)
```
where dᵢ is a soft deadline for task θᵢ and wᵢ is its weight.

**Energy Consumption:**
```
minimize  Σⱼ∈R Σₜ energy(vₜʲ, vₜ₊₁ʲ)
```

**Multi-Objective:**
```
minimize  α₁C_max + α₂Σⱼenergy(πⱼ) + α₃Σᵢwait(θᵢ)
```

---

## 3. Stochastic Extension

### 3.1 Stochastic Task Durations

In practice, task durations are not deterministic. We model:
```
dur(θᵢ) ~ LogNormal(μᵢ, σᵢ²)
```

The log-normal distribution is appropriate because:
- Durations are strictly positive
- Right-skewed (occasional long tasks due to complications)
- Multiplicative effects of component variabilities

### 3.2 Chance-Constrained Formulation

```
CHANCE-CONSTRAINED FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

minimize  E[C_max]

subject to:
    P(C_max ≤ D) ≥ 1 - ε

where ε is the acceptable probability of deadline violation.
```

### 3.3 Robust Formulation

```
ROBUST FORMULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

minimize  C_max^worst

where C_max^worst = max{cᵢ : i ∈ Θ} under worst-case durations:

dur(θᵢ) ∈ [μᵢ - Γσᵢ, μᵢ + Γσᵢ]

with budget of uncertainty Γ controlling conservatism.
```

---

## 4. Problem Variants

### 4.1 Online Variant

Tasks arrive dynamically:
```
At time t, revealed task set: Θ(t) ⊆ Θ

Online competitive ratio:
ρ = sup_I [C_max^online(I) / C_max^offline(I)]
```

### 4.2 Partial Observability

Robot positions observed with noise:
```
obs(rⱼ, t) = pos(rⱼ, t) + N(0, Σ)
```

Requires belief-space planning.

### 4.3 Multi-Station Generalization

Multiple stations S = {s₁, ..., sₖ}:
```
minimize  Σₛ∈S C_max(s)

with inter-station robot transfers possible.
```

---

## 5. Notation Summary

| Symbol | Description |
|--------|-------------|
| W | Workspace tuple (G, O, L) |
| G = (V, E) | Workspace graph |
| R | Set of robots |
| T = {A, B} | Robot types |
| Θ | Set of tasks |
| D | Hard deadline |
| aᵢⱼ | Assignment: task i to robot j |
| πⱼ | Path of robot j |
| sᵢ, cᵢ | Start/completion time of task i |
| C_max | Makespan (maximum completion time) |
| τ(r) | Type of robot r |
| κ(r) | Capabilities of robot r |
| loc(θ) | Location of task θ |
| dur(θ) | Duration of task θ |
| pred(θ) | Precedence set of task θ |
| compat(θ) | Compatible robot types for task θ |

---

## 6. Complexity Statement

```
THEOREM 1 (Complexity):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET is NP-hard.

Proof: By reduction from standard MAPF, which is known to be
NP-hard on general graphs [Yu & LaValle, 2013].

See 02-complexity-analysis.md for full proof.
```

---

## 7. Extension Points

The formulation supports several extensions:

1. **Battery State Constraints:** Add SOC evolution equations
2. **Thermal Constraints:** Temperature limits during operations
3. **Failure Recovery:** Re-planning upon robot/task failure
4. **Human Collaboration:** Safety zones for human workers
5. **Learning:** Historical data for duration estimation

---

## Related Documents

- `02-complexity-analysis.md` - NP-hardness proofs and approximability
- `03-algorithms.md` - Algorithmic approaches
- `04-simulation.md` - Test scenarios and benchmarks
- `05-literature.md` - Related work and references
- `jova/02-research-topics.md` - Original problem statement
