# Jovina Unapredjenja - Research Topics Index

> **Version:** 1.0
> **Date:** January 2026
> **Context:** Elaborated research directions based on Dr. Jova's feedback
> **Language:** English (for academic publication potential)

---

## Overview

This folder contains paper-ready elaborations of research topics identified in `jova/02-research-topics.md`. Each topic includes complete mathematical formulations, complexity analysis, algorithm catalogs, simulation scenarios, and literature reviews.

---

## Research Topics

| # | Topic | Directory | Priority | Status |
|---|-------|-----------|----------|--------|
| 1 | Multi-Robot Path Planning (MAPF-HET) | `01-mapf-het/` | Highest | **Complete** |
| 2 | Distributed V2G Optimization | `02-distributed-v2g/` | High | **Complete** |
| 3 | Edge AI Predictive Maintenance | `03-edge-ai-maintenance/` | Medium | **Complete** |
| 4 | Stochastic Fleet Logistics (VRPTW-PD) | `04-fleet-logistics/` | Medium | **Complete** |

---

## Topic 1: MAPF-HET (Multi-Agent Path Finding - Heterogeneous)

**Status:** Complete
**Scientific Novelty:** High
**Project Value:** High

Coordination of heterogeneous robots (mobile Type A, rail-mounted Type B) for battery swap operations with hard deadlines.

### Documents

| File | Content | Status |
|------|---------|--------|
| `01-problem-formulation.md` | Formal problem definition, decision variables, constraints | Complete |
| `02-complexity-analysis.md` | NP-hardness proofs, special cases, approximability | Complete |
| `03-algorithms.md` | CBS, ECBS, PP, MILP, MCTS, GNN approaches | Complete |
| `04-simulation.md` | Test scenarios, benchmarks, validation criteria | Complete |
| `05-literature.md` | Key papers, comparison to our approach | Complete |

### Key Results

- Problem is NP-hard (reduction from standard MAPF)
- CBS extension with capability-aware branching provides completeness
- ECBS achieves bounded suboptimality with practical performance
- MILP useful for small instances and baseline comparison

---

## Topic 2: Distributed V2G Optimization

**Status:** Complete
**Scientific Novelty:** Medium-High
**Project Value:** High

Distributed optimization for V2G grid services using ADMM/consensus with dynamic topology and real-time constraints.

### Documents

| File | Content | Status |
|------|---------|--------|
| `01-problem-formulation.md` | ADMM, consensus-based formulation, Nash equilibrium | Complete |
| `02-convergence-analysis.md` | Convergence proofs, rate bounds, Lyapunov analysis | Complete |
| `03-algorithms.md` | ADMM, primal-dual, consensus, game-theoretic approaches | Complete |
| `04-simulation.md` | Grid scenarios, frequency regulation, voltage support | Complete |
| `05-literature.md` | Distributed optimization, V2G, multi-agent literature | Complete |

### Key Results

- Hierarchical V2G optimization with station and module levels
- ADMM convergence proof with O(1/k) rate bound
- Game-theoretic formulation proving Nash equilibrium existence
- Robust formulation for communication delay and packet loss
- Grid scenarios covering 1MW to 50MW aggregation

---

## Topic 3: Edge AI Predictive Maintenance

**Status:** Complete
**Scientific Novelty:** Medium
**Project Value:** High

TinyML for RUL (Remaining Useful Life) prediction on STM32G474 with federated learning across module fleet.

### Documents

| File | Content | Status |
|------|---------|--------|
| `01-problem-formulation.md` | RUL prediction model, health index, federated formulation | Complete |
| `02-tinyml-constraints.md` | STM32G474 specs, memory/cycle budgets, quantization | Complete |
| `03-algorithms.md` | TinyMLP, TinyCNN, TCN, LSTM, Autoencoder, FedAvg | Complete |
| `04-data-pipeline.md` | Sensor config, feature engineering, preprocessing | Complete |
| `05-literature.md` | TinyML, PM, federated learning references | Complete |

### Key Results

- Complete constraint analysis for STM32G474 (100KB model, 10ms inference)
- 6 TinyML architectures with complexity analysis
- Federated learning protocol for fleet-wide model improvement
- Physics-informed feature engineering for capacitor/MOSFET health
- Data pipeline from sensor to inference

---

## Topic 4: Stochastic Fleet Logistics

**Status:** Complete
**Scientific Novelty:** Medium
**Project Value:** Medium

Extension of VRPTW-PD with stochastic demand and failure prediction uncertainty.

### Documents

| File | Content | Status |
|------|---------|--------|
| `01-problem-formulation.md` | MILP formulation, two-stage stochastic programming | Complete |
| `02-stochastic-analysis.md` | Uncertainty modeling, chance constraints, SAA | Complete |
| `03-algorithms.md` | ALNS, rolling horizon, scenario-based, robust opt | Complete |
| `04-simulation.md` | Fleet scenarios from 50 to 500 buses | Complete |
| `05-literature.md` | VRP, stochastic optimization, spare parts literature | Complete |

### Key Results

- Complete VRPTW-PD with pickup/delivery and time windows
- Two-stage stochastic formulation with recourse
- Chance-constrained formulation for service level guarantees
- ALNS with 6 destroy and 6 repair operators
- Scenarios covering normal, emergency, and extreme cases

---

## Development Priority

```
Priority Order:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MAPF-HET          ████████████████████  [COMPLETE]
   └─ Dr. Jova explicitly interested, highest novelty

2. Distributed V2G   ████████████████████  [COMPLETE]
   └─ Direct project value, high feasibility

3. Edge AI           ████████████████████  [COMPLETE]
   └─ TinyML for predictive maintenance

4. Fleet Logistics   ████████████████████  [COMPLETE]
   └─ Existing MILP base to extend

ALL TOPICS COMPLETE ████████████████████████████████████████
```

---

## Publication Targets

| Topic | Primary Venue | Secondary Venue | Timeline |
|-------|---------------|-----------------|----------|
| MAPF-HET | ICRA, IROS | RA-L, AAMAS | 2026 |
| Distributed V2G | IEEE TSG | CDC, ACC | 2026-2027 |
| Edge AI | IEEE TII | PHM, NeurIPS | 2027 |
| Fleet Logistics | EJOR | Transportation Science | 2027 |

---

## Related Documents

- `jova/02-research-topics.md` - Original topic definitions
- `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` - Robot patent
- `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` - Fleet logistics patent
- `tehnika/konceptualno/en/02-roj-intelligence.md` - ROJ distributed system
- `tehnika/inzenjersko/en/07-v2g-control.md` - V2G control algorithms

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01 | Initial structure, MAPF-HET complete |
| 1.1 | 2026-01 | Edge AI Predictive Maintenance complete |
| 1.2 | 2026-01 | Distributed V2G Optimization complete |
| 1.3 | 2026-01 | Stochastic Fleet Logistics complete - ALL TOPICS DONE |
