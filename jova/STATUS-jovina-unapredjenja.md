# Status: Jovina Unapredjenja - Research Elaborations

> **Created:** 2026-01-21
> **Last Updated:** 2026-01-21
> **Purpose:** Tracking document for academic research collaboration with Dr. Jova

---

## Overview

Complete paper-ready elaborations of 4 research topics based on Dr. Jova's feedback.
All documents in English for academic publication potential.

---

## Completion Summary

| Metric | Value |
|--------|-------|
| Total Files | 21 |
| Total Lines | 11,733 |
| Topics Completed | 4/4 |
| Status | **COMPLETE** |

---

## Topic Status

| # | Topic | Files | Lines | Status | Review |
|---|-------|-------|-------|--------|--------|
| 1 | MAPF-HET (Multi-Robot) | 5 | 2,681 | Complete | Pending |
| 2 | Distributed V2G | 5 | 2,692 | Complete | Pending |
| 3 | Edge AI Maintenance | 5 | 3,587 | Complete | Pending |
| 4 | Fleet Logistics | 5 | 2,584 | Complete | Pending |
| - | Index | 1 | 189 | Complete | - |

---

## Document Inventory

### 01-mapf-het/ (Multi-Agent Path Finding - Heterogeneous)

| File | Lines | Content Summary |
|------|-------|-----------------|
| 01-problem-formulation.md | 346 | MAPF-HET instance, decision variables, constraints, objective |
| 02-complexity-analysis.md | 403 | NP-hardness proof, reduction from MAPF, approximability |
| 03-algorithms.md | 686 | CBS, ECBS, PP, MILP, MCTS, GNN - pseudocode included |
| 04-simulation.md | 658 | Scenarios S1-S4, benchmarks, validation criteria |
| 05-literature.md | 588 | 40+ references, ICRA/IROS/RA-L venues |

### 02-distributed-v2g/ (Distributed V2G Optimization)

| File | Lines | Content Summary |
|------|-------|-----------------|
| 01-problem-formulation.md | 470 | Hierarchical ADMM, consensus, Nash equilibrium |
| 02-convergence-analysis.md | 464 | Convergence proofs, O(1/k) rate, Lyapunov |
| 03-algorithms.md | 689 | ADMM, primal-dual, consensus, game theory |
| 04-simulation.md | 533 | Grid scenarios 1MW-50MW, frequency regulation |
| 05-literature.md | 536 | Boyd ADMM, V2G optimization references |

### 03-edge-ai-maintenance/ (TinyML Predictive Maintenance)

| File | Lines | Content Summary |
|------|-------|-----------------|
| 01-problem-formulation.md | 552 | RUL prediction, health index, federated learning |
| 02-tinyml-constraints.md | 684 | STM32G474 specs, memory budgets, quantization |
| 03-algorithms.md | 855 | TinyMLP, TinyCNN, TCN, Autoencoder, FedAvg |
| 04-data-pipeline.md | 784 | Sensor config, feature engineering, preprocessing |
| 05-literature.md | 712 | TinyML, PHM, federated learning refs |

### 04-fleet-logistics/ (Stochastic VRPTW-PD)

| File | Lines | Content Summary |
|------|-------|-----------------|
| 01-problem-formulation.md | 488 | MILP, two-stage stochastic, recourse |
| 02-stochastic-analysis.md | 556 | Uncertainty modeling, chance constraints, SAA |
| 03-algorithms.md | 485 | ALNS (6+6 operators), rolling horizon, robust |
| 04-simulation.md | 552 | Fleet scenarios 50-500 buses |
| 05-literature.md | 503 | VRP surveys, stochastic optimization |

---

## Next Steps

### Immediate (Dr. Jova Review)

- [ ] Send documents to Dr. Jova for review
- [ ] Schedule meeting to discuss priority topic
- [ ] Get feedback on mathematical formulations
- [ ] Identify which topic to pursue first for publication

### Per Topic (After Review)

- [ ] Incorporate Dr. Jova's corrections
- [ ] Add missing proofs if requested
- [ ] Refine simulation parameters based on feedback
- [ ] Update literature with any missing key papers

### Publication Path

| Topic | Target Venue | Deadline | Status |
|-------|--------------|----------|--------|
| MAPF-HET | ICRA 2027 | Sep 2026 | - |
| Distributed V2G | IEEE TSG | Rolling | - |
| Edge AI | IEEE TII | Rolling | - |
| Fleet Logistics | EJOR | Rolling | - |

---

## Quality Checklist

### Mathematical Content

| Item | MAPF | V2G | EdgeAI | Fleet |
|------|------|-----|--------|-------|
| Problem formulation (Given/Find/Min) | ✓ | ✓ | ✓ | ✓ |
| Decision variables defined | ✓ | ✓ | ✓ | ✓ |
| Constraints enumerated | ✓ | ✓ | ✓ | ✓ |
| Objective function | ✓ | ✓ | ✓ | ✓ |
| Complexity analysis | ✓ | ✓ | ✓ | ✓ |
| Algorithm pseudocode | ✓ | ✓ | ✓ | ✓ |
| Complexity bounds | ✓ | ✓ | ✓ | ✓ |

### Simulation

| Item | MAPF | V2G | EdgeAI | Fleet |
|------|------|-----|--------|-------|
| Test scenarios defined | ✓ | ✓ | ✓ | ✓ |
| Parameters specified | ✓ | ✓ | ✓ | ✓ |
| Metrics defined | ✓ | ✓ | ✓ | ✓ |
| Baseline comparisons | ✓ | ✓ | ✓ | ✓ |

### Literature

| Item | MAPF | V2G | EdgeAI | Fleet |
|------|------|-----|--------|-------|
| Key papers cited | ✓ | ✓ | ✓ | ✓ |
| Novelty comparison | ✓ | ✓ | ✓ | ✓ |
| Publication venues | ✓ | ✓ | ✓ | ✓ |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `jova/02-research-topics.md` | Original topic definitions |
| `jova/jovina-unapredjenja/00-index.md` | Full index with details |
| `patent/01-IP-FOUNDATION/05-*.md` | Related patent disclosures |

---

## Related Implementation: mapf-het-research/

**Location:** `d:\work\autobusi-punjaci\mapf-het-research\`

Go-based algorithm implementation accompanying the MAPF-HET research documentation.

### Structure

```
mapf-het-research/
├── cmd/mapfhet/           # CLI entry point
├── internal/
│   ├── core/              # Domain models (workspace, robots, tasks)
│   ├── algo/              # Algorithm implementations (CBS, Prioritized)
│   └── sim/               # Discrete-event simulation
├── testdata/              # Benchmark scenarios
├── docs/
│   └── INTEGRATION-MAP.md # Integration with EK-KOR2, simulator, Renode
├── go.mod
└── README.md
```

### Algorithm Status

| Algorithm | Status | File |
|-----------|--------|------|
| CBS-HET | Stub | `algo/cbs.go` |
| Prioritized | Stub | `algo/prioritized.go` |
| ECBS-HET | Planned | - |

### Integration Points (from INTEGRATION-MAP.md)

| Component | Integration |
|-----------|-------------|
| EK-KOR2/JEZGRO | Field gradient mapping, CAN-FD path messages |
| Go Simulator | Robot physics, workspace graph, pathfinding |
| Renode Emulator | Multi-MCU HIL testing via CAN bus |

### Development Phases

1. **Phase 1: Pure Algorithm** (Current) - Standalone Go
2. **Phase 2: Simulator** - Add robot physics to Go simulator
3. **Phase 3: EK-KOR2 Protocol** - CAN-FD message spec
4. **Phase 4: Renode HIL** - Multi-MCU validation

### Connection to jovina-unapredjenja

```
jova/jovina-unapredjenja/01-mapf-het/
    └── Mathematical formulation, proofs, literature
                      │
                      ▼
mapf-het-research/internal/algo/
    └── Go implementation of algorithms
```

---

## Change Log

| Date | Change | By |
|------|--------|----|
| 2026-01-21 | Initial creation, all 4 topics complete | Claude |
| 2026-01-21 | Added mapf-het-research integration section | Claude |
| | | |

---

## Notes

```
Napomena za Bojana:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Svi dokumenti su na engleskom za akademske publikacije
2. Matematicke formulacije su paper-ready
3. Algoritmi imaju pseudokod spreman za implementaciju
4. Literatura pokriva kljucne reference za svaku oblast

Sledeci korak: Poslati Dr. Jovi na pregled i dobiti povratne
informacije o prioritetu i eventualnim korekcijama.
```
