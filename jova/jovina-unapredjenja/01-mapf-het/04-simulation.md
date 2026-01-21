# MAPF-HET: Simulation and Benchmarks

> **Topic:** Multi-Agent Path Finding with Heterogeneous Agents
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document defines simulation scenarios, benchmark instances, and validation methodology for MAPF-HET algorithms in the EV charging station context.

---

## 2. Station Layout Models

### 2.1 Small Station (2 Bays)

```
LAYOUT: STATION-S2 (Small, 2 Bus Bays)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dimensions: 20m × 15m

    ┌──────────────────────────────────────────┐
    │                RAIL TRACK                │ ← Type B robot rail
    │  ═══════════════════════════════════════ │
    │                                          │
    │  ┌─────────┐          ┌─────────┐       │
    │  │  BAY 1  │          │  BAY 2  │       │
    │  │  BUS 1  │          │  BUS 2  │       │
    │  │ ○ ○ ○ ○ │          │ ○ ○ ○ ○ │       │ ○ = Battery slot
    │  │ ○ ○ ○ ○ │          │ ○ ○ ○ ○ │       │
    │  └─────────┘          └─────────┘       │
    │       ↑                    ↑            │
    │   Type A robot         Type A robot     │
    │   workspace            workspace        │
    │                                          │
    │  ┌─────────────────────────────────┐    │
    │  │       MODULE STORAGE AREA       │    │
    │  │   [S] [S] [S] [S] [S] [S] [S]   │    │ [S] = Storage slot
    │  └─────────────────────────────────┘    │
    └──────────────────────────────────────────┘

Grid: 40 × 30 cells (0.5m per cell)
Vertices: 1200
Edges: ~4500 (4-connected grid + rail)
```

**Graph Parameters:**
```
V = 1200 vertices
E ≈ 4500 edges
WA = 2 × 200 vertices (per bay workspace)
WB = full graph (rail accessible everywhere)
```

### 2.2 Medium Station (4 Bays)

```
LAYOUT: STATION-M4 (Medium, 4 Bus Bays)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dimensions: 40m × 20m

    ┌──────────────────────────────────────────────────────────┐
    │                    RAIL TRACK (DUAL)                     │
    │  ═══════════════════════════════════════════════════════ │
    │  ═══════════════════════════════════════════════════════ │
    │                                                          │
    │  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐            │
    │  │ BAY 1 │  │ BAY 2 │  │ BAY 3 │  │ BAY 4 │            │
    │  │ ○○○○  │  │ ○○○○  │  │ ○○○○  │  │ ○○○○  │            │
    │  │ ○○○○  │  │ ○○○○  │  │ ○○○○  │  │ ○○○○  │            │
    │  └───────┘  └───────┘  └───────┘  └───────┘            │
    │     ↑          ↑          ↑          ↑                  │
    │   WA_1       WA_2       WA_3       WA_4                 │
    │                                                          │
    │  ┌─────────────────────────────────────────────────┐    │
    │  │              MODULE STORAGE AREA                 │    │
    │  │   [S][S][S][S][S][S][S][S][S][S][S][S][S][S]    │    │
    │  └─────────────────────────────────────────────────┘    │
    └──────────────────────────────────────────────────────────┘

Grid: 80 × 40 cells
Vertices: 3200
Edges: ~12000
```

### 2.3 Large Station (8 Bays)

```
LAYOUT: STATION-L8 (Large, 8 Bus Bays)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dimensions: 60m × 30m

    ┌───────────────────────────────────────────────────────────────┐
    │                      RAIL TRACK (TRIPLE)                      │
    │  ════════════════════════════════════════════════════════════ │
    │  ════════════════════════════════════════════════════════════ │
    │  ════════════════════════════════════════════════════════════ │
    │                                                               │
    │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
    │  │ B1 │ │ B2 │ │ B3 │ │ B4 │ │ B5 │ │ B6 │ │ B7 │ │ B8 │   │
    │  │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│   │
    │  │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│ │○○○○│   │
    │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘ └────┘   │
    │                                                               │
    │  ┌───────────────────────────────────────────────────────┐   │
    │  │                   MODULE STORAGE                       │   │
    │  │  [S][S][S][S][S][S][S][S][S][S][S][S][S][S][S][S][S]  │   │
    │  │  [S][S][S][S][S][S][S][S][S][S][S][S][S][S][S][S][S]  │   │
    │  └───────────────────────────────────────────────────────┘   │
    └───────────────────────────────────────────────────────────────┘

Grid: 120 × 60 cells
Vertices: 7200
Edges: ~28000
```

---

## 3. Robot Configurations

### 3.1 Robot Type Specifications

```
ROBOT SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TYPE A (Mobile)          TYPE B (Rail-Mounted)
─────────────────────    ─────────────────────
Speed: 0.5 m/s           Speed: 2.0 m/s (rail)
Accel: 0.5 m/s²          Accel: 1.0 m/s²
Footprint: 1m × 1m       Footprint: 2m × 1m
Payload: 50 kg           Payload: 500 kg
Reach: 1.5m              Reach: 3.0m
DOF: 6-axis              DOF: 6-axis + rail
Workspace: Bay only      Workspace: Full station
```

### 3.2 Configuration Profiles

| Config | Type A | Type B | Total | Description |
|--------|--------|--------|-------|-------------|
| C-2 | 2 | 0 | 2 | Minimal (mobile only) |
| C-3 | 2 | 1 | 3 | Standard small |
| C-4 | 2 | 2 | 4 | Standard medium |
| C-6 | 4 | 2 | 6 | Large station |
| C-8 | 4 | 4 | 8 | Maximum capacity |

---

## 4. Task Scenarios

### 4.1 Task Types

```
TASK TYPE SPECIFICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SWAP_BATTERY (Full pack swap)
─────────────────────────────
• Duration: μ = 120s, σ = 20s (LogNormal)
• Compatible: Type B only
• Precedence: None
• Location: Bus bay center

SWAP_MODULE (Single EK3 module)
─────────────────────────────
• Duration: μ = 30s, σ = 5s (LogNormal)
• Compatible: Type A, Type B
• Precedence: May depend on DIAGNOSE
• Location: Specific slot position

DIAGNOSE (Health check)
─────────────────────────────
• Duration: μ = 15s, σ = 3s (LogNormal)
• Compatible: Type A, Type B
• Precedence: None
• Location: Module slot

CLEAN (Connector cleaning)
─────────────────────────────
• Duration: μ = 10s, σ = 2s (LogNormal)
• Compatible: Type A, Type B
• Precedence: Before SWAP_MODULE
• Location: Module slot
```

### 4.2 Scenario Definitions

```
SCENARIO: SC-MINIMAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: S2
Robots: C-3 (2 Type A, 1 Type B)
Tasks: 5 (1 SWAP_BATTERY, 4 SWAP_MODULE)
Deadline: 180s
Purpose: Basic algorithm validation

SCENARIO: SC-STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: M4
Robots: C-4 (2 Type A, 2 Type B)
Tasks: 12 (2 SWAP_BATTERY, 8 SWAP_MODULE, 2 DIAGNOSE)
Deadline: 300s
Purpose: Typical operation scenario

SCENARIO: SC-STRESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: L8
Robots: C-8 (4 Type A, 4 Type B)
Tasks: 40 (4 SWAP_BATTERY, 30 SWAP_MODULE, 4 DIAGNOSE, 2 CLEAN)
Deadline: 600s
Purpose: Scalability testing

SCENARIO: SC-TIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: M4
Robots: C-4
Tasks: 20 (tight precedence chain)
Deadline: 250s (very tight)
Purpose: Deadline stress testing

SCENARIO: SC-STOCHASTIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Station: M4
Robots: C-4
Tasks: 15
Deadline: 350s
Purpose: Stochastic duration handling
Note: High variance durations (σ = 0.3 × μ)
```

---

## 5. Benchmark Instance Format

### 5.1 Instance File Format (YAML)

```yaml
# benchmark/instance_SC-STANDARD_001.yaml
instance:
  name: "SC-STANDARD-001"
  scenario: "SC-STANDARD"
  seed: 42

station:
  layout: "M4"
  grid_size: [80, 40]

robots:
  - id: "A1"
    type: "A"
    start: [10, 20]
  - id: "A2"
    type: "A"
    start: [30, 20]
  - id: "B1"
    type: "B"
    start: [0, 5]
  - id: "B2"
    type: "B"
    start: [40, 5]

tasks:
  - id: "T1"
    type: "SWAP_BATTERY"
    location: [15, 25]
    duration_mean: 120
    duration_std: 20
    compatible: ["B"]
    precedence: []

  - id: "T2"
    type: "SWAP_MODULE"
    location: [12, 27]
    duration_mean: 30
    duration_std: 5
    compatible: ["A", "B"]
    precedence: ["T1"]

  # ... more tasks

deadline: 300

metrics:
  optimal_makespan: null  # To be computed
  lower_bound: 180        # Sum of critical path
```

### 5.2 Solution File Format

```yaml
# results/solution_SC-STANDARD_001_CBS.yaml
solution:
  instance: "SC-STANDARD-001"
  algorithm: "CBS-HET"
  timestamp: "2026-01-15T10:30:00"

assignment:
  T1: "B1"
  T2: "A1"
  T3: "A2"
  # ...

paths:
  A1:
    - {t: 0, x: 10, y: 20}
    - {t: 1, x: 11, y: 20}
    - {t: 2, x: 12, y: 20}
    # ...
  B1:
    - {t: 0, x: 0, y: 5}
    - {t: 1, x: 2, y: 5}  # Faster on rail
    # ...

schedule:
  T1: {start: 5, end: 125, robot: "B1"}
  T2: {start: 130, end: 160, robot: "A1"}
  # ...

metrics:
  makespan: 245
  sum_of_costs: 520
  computation_time_ms: 3420
  nodes_expanded: 15234
  conflicts_resolved: 42
  success: true
```

---

## 6. Performance Metrics

### 6.1 Primary Metrics

```
METRIC DEFINITIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. MAKESPAN (C_max)
   Definition: Maximum completion time across all tasks
   Formula: C_max = max{cᵢ : i ∈ Θ}
   Goal: Minimize

2. SUM OF COSTS (SOC)
   Definition: Total path length across all robots
   Formula: SOC = Σⱼ |πⱼ|
   Goal: Minimize

3. SUCCESS RATE (SR)
   Definition: Fraction of instances solved within time limit
   Formula: SR = solved_instances / total_instances
   Goal: Maximize

4. COMPUTATION TIME (CT)
   Definition: Wall-clock time to find solution
   Unit: Milliseconds
   Goal: Minimize

5. DEADLINE SATISFACTION (DS)
   Definition: Fraction of runs meeting deadline
   Formula: DS = P(C_max ≤ D)
   Goal: Maximize (target: 99%)
```

### 6.2 Secondary Metrics

```
SECONDARY METRICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. OPTIMALITY GAP
   Definition: Gap from optimal (or lower bound)
   Formula: Gap = (C_max - LB) / LB × 100%

7. CONFLICT COUNT
   Definition: Number of conflicts resolved during search
   Indicates: Problem difficulty

8. ROBUSTNESS SCORE
   Definition: Makespan variance under stochastic durations
   Formula: RS = 1 / (1 + σ(C_max))

9. UTILIZATION
   Definition: Robot busy time / total time
   Formula: U = Σⱼ(busy_time(rⱼ)) / (|R| × C_max)

10. ENERGY ESTIMATE
    Definition: Estimated energy consumption
    Formula: E = Σⱼ energy(πⱼ)
```

---

## 7. Benchmark Suite

### 7.1 Instance Generation

```python
# Pseudocode for benchmark generation

def generate_benchmark_suite():
    instances = []

    for scenario in [SC_MINIMAL, SC_STANDARD, SC_STRESS, SC_TIGHT]:
        for seed in range(1, 51):  # 50 instances per scenario
            instance = generate_instance(scenario, seed)
            instances.append(instance)

    return instances

def generate_instance(scenario, seed):
    rng = Random(seed)

    # Generate task locations within workspace
    tasks = []
    for i in range(scenario.num_tasks):
        task_type = rng.choice(scenario.task_types)
        location = rng.choice(valid_locations(task_type, scenario.station))
        duration = sample_duration(task_type)
        tasks.append(Task(task_type, location, duration))

    # Generate precedence constraints
    if scenario.precedence_density > 0:
        add_precedence_constraints(tasks, scenario.precedence_density, rng)

    return Instance(scenario.station, scenario.robots, tasks, scenario.deadline)
```

### 7.2 Complete Benchmark Suite

| Suite | Scenarios | Instances/Scenario | Total | Purpose |
|-------|-----------|-------------------|-------|---------|
| DEV | MINIMAL | 10 | 10 | Development |
| SMALL | MINIMAL, STANDARD | 50 each | 100 | Algorithm comparison |
| FULL | All 4 | 50 each | 200 | Full evaluation |
| STRESS | STRESS only | 100 | 100 | Scalability |

---

## 8. Experimental Protocol

### 8.1 Algorithm Evaluation Protocol

```
EVALUATION PROTOCOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SETUP
   • Hardware: Specify CPU, RAM, OS
   • Time limit: 60s per instance (configurable)
   • Memory limit: 16 GB
   • Repetitions: 5 per stochastic algorithm

2. EXECUTION
   For each algorithm A in {CBS, ECBS, PP, MCTS, ...}:
       For each instance I in benchmark_suite:
           For rep in 1..repetitions:
               result = run(A, I, time_limit)
               record(result)

3. ANALYSIS
   • Compute mean, std, median for each metric
   • Statistical tests: Wilcoxon signed-rank
   • Generate performance profiles
   • Create algorithm selection recommendations
```

### 8.2 Stochastic Evaluation

```
STOCHASTIC PROTOCOL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For stochastic duration scenarios:

1. PLANNING PHASE
   • Algorithm computes solution assuming mean durations

2. SIMULATION PHASE (Monte Carlo)
   For sim in 1..1000:
       • Sample actual durations from distributions
       • Execute planned solution with sampled durations
       • Record actual makespan

3. METRICS
   • Expected makespan: E[C_max]
   • Makespan variance: Var[C_max]
   • Deadline satisfaction: P(C_max ≤ D)
   • 95th percentile makespan: C_max^95
```

---

## 9. Visualization

### 9.1 Solution Visualization

```
VISUALIZATION COMPONENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SPATIAL VIEW
   • Station layout with grid
   • Robot positions (animated over time)
   • Task locations with status colors
   • Collision zones highlighted

2. GANTT CHART
   • Time on X-axis
   • Robots on Y-axis
   • Task execution blocks
   • Deadline marker

3. PATH OVERLAY
   • All robot paths superimposed
   • Color-coded by robot
   • Conflict points marked

4. METRIC DASHBOARD
   • Real-time makespan
   • Utilization bars
   • Deadline countdown
```

### 9.2 Example Gantt Chart

```
GANTT: SC-STANDARD-001 Solution
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Time:  0    30    60    90   120   150   180   210   240   270   300
       |     |     |     |     |     |     |     |     |     |     |

A1:    ──[T5]──────[T8]────────────[T11]───────
A2:    ────[T6]────────[T9]──────────[T12]─────
B1:    [===T1 (SWAP_BATTERY)===]───[T3]────[T7]───
B2:    ────[===T2 (SWAP_BATTERY)===]───[T4]───[T10]

Legend: [Tx] = Task execution, ─ = Travel/Wait
Deadline: 300s | Makespan: 245s | Slack: 55s
```

---

## 10. Expected Results

### 10.1 Baseline Performance Targets

| Scenario | Algorithm | Target Makespan | Target CT |
|----------|-----------|-----------------|-----------|
| SC-MINIMAL | CBS | Optimal | < 1s |
| SC-MINIMAL | PP | < 1.2 × Optimal | < 0.1s |
| SC-STANDARD | CBS | Optimal | < 30s |
| SC-STANDARD | ECBS(1.1) | < 1.1 × Optimal | < 5s |
| SC-STRESS | PP | Feasible | < 10s |
| SC-STRESS | LNS | < 1.3 × LB | < 60s |

### 10.2 Algorithm Comparison Hypotheses

```
HYPOTHESES TO TEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

H1: CBS-HET achieves optimal makespan on SC-MINIMAL and SC-STANDARD

H2: ECBS-HET(w=1.1) is at least 5x faster than CBS-HET
    with solution quality within 10% of optimal

H3: Prioritized Planning with Type-B-first priority
    outperforms random priority by at least 15%

H4: MCTS achieves higher deadline satisfaction rate
    than deterministic algorithms on SC-STOCHASTIC

H5: LNS improves Prioritized Planning solutions
    by at least 10% on SC-STRESS instances
```

---

## 11. Validation Criteria

### 11.1 Solution Validity Checks

```
VALIDITY CHECKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ASSIGNMENT VALIDITY
   □ Each task assigned exactly once
   □ Assigned robot has required capability
   □ Assigned robot can reach task location

2. PATH VALIDITY
   □ Path starts at robot's initial position
   □ Each step is to adjacent vertex or stay
   □ Path respects workspace restrictions

3. COLLISION-FREE
   □ No vertex collisions (same vertex, same time)
   □ No edge collisions (swap positions)

4. SCHEDULE VALIDITY
   □ Precedence constraints satisfied
   □ Robot at task location during execution
   □ No overlapping task execution per robot

5. DEADLINE SATISFACTION
   □ All tasks complete by deadline D
```

### 11.2 Automated Validation

```python
def validate_solution(instance, solution):
    errors = []

    # Check assignment
    for task in instance.tasks:
        if task not in solution.assignment:
            errors.append(f"Task {task} not assigned")
        robot = solution.assignment[task]
        if task.type not in robot.capabilities:
            errors.append(f"Robot {robot} cannot do {task}")

    # Check paths
    for robot, path in solution.paths.items():
        for t in range(len(path) - 1):
            if not adjacent(path[t], path[t+1], instance.graph):
                errors.append(f"Invalid move for {robot} at t={t}")

    # Check collisions
    for t in range(solution.makespan):
        positions = {r: solution.paths[r][t] for r in instance.robots}
        if len(set(positions.values())) < len(positions):
            errors.append(f"Vertex collision at t={t}")

    # Check deadline
    if solution.makespan > instance.deadline:
        errors.append(f"Deadline violated: {solution.makespan} > {instance.deadline}")

    return len(errors) == 0, errors
```

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-complexity-analysis.md` - Theoretical analysis
- `03-algorithms.md` - Algorithm implementations
- `05-literature.md` - Related work and benchmarks
