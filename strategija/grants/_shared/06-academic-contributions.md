# Academic Contributions (Shared Content)

*Use this content for research-focused grants (EIC, Horizon, NWO).*

---

## Research Agenda Overview

### Three Research Pillars

```
ACADEMIC RESEARCH DIRECTIONS:
═══════════════════════════════════════════════════════════════

PILLAR 1: DISTRIBUTED COORDINATION
├── Potential field scheduling theory
├── Topological consensus protocols
├── Self-healing mesh networks
└── Target: Distributed systems venues

PILLAR 2: MULTI-ROBOT PATH FINDING (MAPF-HET)
├── Heterogeneous agent coordination
├── Battery swap logistics
├── Fleet optimization
└── Target: Robotics/AI venues

PILLAR 3: VEHICLE-TO-GRID OPTIMIZATION
├── Distributed V2G control
├── Stochastic fleet scheduling
├── Grid services integration
└── Target: Smart grid/energy venues
```

---

## Pillar 1: Distributed Coordination

### Novel Contributions

**1. Temporal Potential Fields**
- Original: Khatib 1986 - spatial navigation for robots
- Our contribution: Adaptation to temporal task scheduling
- Innovation: Field values represent load/thermal/power state
- Result: Emergent work distribution without central coordinator

**2. Scale-Free Consensus**
- Based on: Cavagna & Giardina starling flock research
- Our contribution: k=7 topological neighbors for RTOS
- Innovation: Fixed neighbor count regardless of network size
- Result: O(1) consensus overhead per node

**3. Byzantine-Tolerant Threshold Voting**
- Standard: BFT requires 3f+1 nodes for f failures
- Our contribution: Local threshold voting with propagation
- Innovation: Distributed decision without global view
- Result: Graceful degradation, no single point of failure

### Publication Targets

| Venue | Type | Ranking | Focus |
|-------|------|---------|-------|
| ICDCS | Conference | A | Distributed systems |
| PODC | Conference | A* | Theory |
| IEEE TPDS | Journal | Q1 | Parallel/distributed |
| Distributed Computing | Journal | Q1 | Theory |

---

## Pillar 2: MAPF-HET (Multi-Agent Path Finding - Heterogeneous)

### Problem Formulation

```
MAPF-HET PROBLEM DEFINITION:
═══════════════════════════════════════════════════════════════

GIVEN:
• Graph G = (V, E) representing depot layout
• Set of agents A = {a₁, ..., aₙ} (robots, buses, chargers)
• Each agent aᵢ has:
  - Type τᵢ ∈ {robot, bus, charger}
  - Capabilities cᵢ (speed, payload, etc.)
  - Start location sᵢ ∈ V
  - Goal location gᵢ ∈ V (or goal task)

FIND:
• Collision-free paths for all agents
• Respecting heterogeneous capabilities
• Minimizing makespan or total cost

CONSTRAINTS:
• No vertex conflicts (same location, same time)
• No edge conflicts (swapping positions)
• Type-specific constraints (robot can't charge bus directly)
```

### Proposed Algorithms

| Algorithm | Approach | Contribution |
|-----------|----------|--------------|
| HYBRID-CBS | Conflict-based search + type handling | Novel type-aware conflict resolution |
| MIXED-CBS | Mixed integer programming relaxation | Optimal bounds for heterogeneous fleets |
| DEADLINE-CBS | Time-window constraints | Real-time scheduling integration |
| STOCHASTIC-ECBS | Probabilistic execution times | Robust plans under uncertainty |
| FIELD-GUIDED MCTS | Monte Carlo + potential fields | Scalable heuristic guidance |

### HYBRID-CBS Details

```
HYBRID-CBS ALGORITHM:
═══════════════════════════════════════════════════════════════

INPUT: MAPF-HET instance
OUTPUT: Collision-free paths

1. LOW-LEVEL SEARCH (per agent):
   - A* with type-specific costs
   - Capability-aware edge weights
   - Time-expanded graph

2. HIGH-LEVEL SEARCH (conflict resolution):
   - Constraint tree exploration
   - Type-aware conflict detection:
     * VERTEX: Standard (same loc, same time)
     * EDGE: Standard (swap positions)
     * CAPABILITY: New (incompatible interactions)
   - Branching on conflict constraints

3. NOVELTY:
   - Type hierarchies for conflict priority
   - Capability-based constraint propagation
   - Hybrid continuous/discrete planning
```

### Publication Targets

| Venue | Type | Ranking | Focus |
|-------|------|---------|-------|
| ICRA | Conference | A | Robotics |
| IROS | Conference | A | Intelligent systems |
| IJRR | Journal | Q1 | Robotics research |
| AAMAS | Conference | A | Multi-agent systems |
| AIJ | Journal | Q1 | AI theory |

---

## Pillar 3: V2G Optimization

### Research Questions

1. **Distributed V2G Control**
   - How to coordinate 1000+ vehicles for grid services?
   - Without central controller (latency, reliability)
   - With uncertain vehicle availability

2. **Stochastic Fleet Scheduling**
   - Uncertain arrival/departure times
   - Weather-dependent solar generation
   - Dynamic electricity prices

3. **Grid Services Integration**
   - Frequency regulation (fast response)
   - Peak shaving (scheduled)
   - Renewable integration (forecasting)

### Mathematical Framework

```
V2G OPTIMIZATION MODEL:
═══════════════════════════════════════════════════════════════

OBJECTIVE:
  min Σᵢ Σₜ [cₜ · pᵢₜ + λ · dᵢₜ]

WHERE:
  pᵢₜ = power flow for vehicle i at time t (+ = charging)
  cₜ  = electricity price at time t
  dᵢₜ = battery degradation cost
  λ   = degradation weight

SUBJECT TO:
  SOCᵢ,ₜ₊₁ = SOCᵢ,ₜ + η·pᵢₜ·Δt / Eᵢ     (State of charge)
  SOCᵢ,dep ≥ SOCᵢ,min                     (Departure requirement)
  pᵢ,min ≤ pᵢₜ ≤ pᵢ,max                   (Power limits)
  Σᵢ pᵢₜ ≤ Pgrid,max                      (Grid constraint)

DISTRIBUTED SOLUTION:
  ADMM (Alternating Direction Method of Multipliers)
  Each vehicle solves local problem
  Coordination via price signals
  Convergence guaranteed under convexity
```

### Publication Targets

| Venue | Type | Ranking | Focus |
|-------|------|---------|-------|
| IEEE TSG | Journal | Q1 | Smart grid |
| Applied Energy | Journal | Q1 | Energy systems |
| IEEE TPWRS | Journal | Q1 | Power systems |
| e-Energy | Conference | A | Energy computing |

---

## Collaboration with PhD Advisor

### Advisor Profile

| Attribute | Detail |
|-----------|--------|
| Education | PhD Computer Science (Western Europe) |
| Experience | 15+ years research |
| Focus | Distributed algorithms, mesh networks, optimization |
| Publications | Topology control, wireless sensor networks |
| Current | EU defense/telecom sector |

### Planned Collaborations

| Topic | Role Division | Timeline |
|-------|---------------|----------|
| MAPF-HET algorithms | Joint development | Q1-Q2 2026 |
| Distributed V2G | Advisor leads theory | Q2-Q3 2026 |
| Potential field paper | Bojan leads, advisor reviews | Q1 2026 |

### Publication Plan

```
2026 PUBLICATION ROADMAP:
═══════════════════════════════════════════════════════════════

Q1 2026:
├── Workshop paper: Potential field scheduling (ICDCS workshop)
└── ArXiv preprint: MAPF-HET problem formulation

Q2 2026:
├── Conference submission: HYBRID-CBS algorithm (ICRA 2027)
└── Journal draft: Distributed V2G control (IEEE TSG)

Q3-Q4 2026:
├── Conference submission: Scale-free consensus (ICDCS 2027)
└── Journal submission: Comprehensive MAPF-HET (IJRR)

2027:
├── System paper: EK-KOR2 architecture (RTAS or ECRTS)
└── Application paper: Fleet optimization results (Applied Energy)
```

---

## Reproducibility & Open Science

### Commitment to Open Research

| Artifact | Availability | License |
|----------|--------------|---------|
| EK-KOR2 source code | GitHub (public) | MIT |
| MAPF-HET algorithms | GitHub | MIT |
| Simulation framework | GitHub | MIT |
| Benchmark datasets | Zenodo | CC-BY |
| Experiment scripts | GitHub | MIT |

### Reproducibility Checklist

- [ ] All code publicly available
- [ ] Clear documentation
- [ ] Containerized experiments (Docker)
- [ ] Seed values documented
- [ ] Hardware specifications listed
- [ ] Benchmark comparisons included

---

## Impact Metrics (Planned)

### Academic Impact

| Metric | Target (3 years) |
|--------|------------------|
| Peer-reviewed publications | 5-8 |
| Citations | 50+ |
| GitHub stars (EK-KOR2) | 500+ |
| Conference presentations | 3-5 |
| PhD students using framework | 2-3 |

### Industry Impact

| Metric | Target (3 years) |
|--------|------------------|
| Companies using EK-KOR2 | 5-10 |
| Pilot deployments | 3-5 |
| Industry standard influence | 1 (participation) |

---

*Last updated: January 2026*
*Version: 1.0*
