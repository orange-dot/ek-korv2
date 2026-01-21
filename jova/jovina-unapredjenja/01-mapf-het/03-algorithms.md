# MAPF-HET: Algorithm Catalog

> **Topic:** Multi-Agent Path Finding with Heterogeneous Agents
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document presents algorithmic approaches for solving MAPF-HET, ranging from exact methods to fast heuristics. Each algorithm includes pseudocode, complexity analysis, and implementation notes.

---

## 2. Algorithm Overview

```
ALGORITHM TAXONOMY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXACT METHODS                    APPROXIMATE/HEURISTIC
├── MILP Formulation             ├── ECBS (Bounded Suboptimal)
├── CBS (Conflict-Based Search)  ├── Prioritized Planning
├── A* on Joint State Space      ├── MCTS (Stochastic)
└── SAT/SMT Encoding             └── GNN + RL

         HYBRID APPROACHES
         ├── Large Neighborhood Search
         └── CBS + Machine Learning
```

---

## 3. Exact Algorithms

### 3.1 Conflict-Based Search (CBS) Extension

CBS is a two-level algorithm: high-level search over conflict tree, low-level single-agent path planning.

```
ALGORITHM: CBS-HET (CBS for Heterogeneous Agents)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I = (W, R, T, Θ, D)
Output: Optimal solution (A*, P*, S*) or FAILURE

1:  A ← COMPUTE_ASSIGNMENT(Θ, R)      // Initial assignment
2:  root.constraints ← ∅
3:  root.solution ← PLAN_PATHS(R, A, root.constraints)
4:  root.cost ← COMPUTE_MAKESPAN(root.solution)
5:  OPEN ← {root}
6:
7:  while OPEN ≠ ∅ do
8:      N ← EXTRACT_MIN(OPEN)         // Lowest cost node
9:      conflict ← FIND_FIRST_CONFLICT(N.solution)
10:
11:     if conflict = NULL then
12:         return N.solution          // Optimal found
13:     end if
14:
15:     for each agent aᵢ in conflict do
16:         child ← NEW_NODE()
17:         child.constraints ← N.constraints ∪ {(aᵢ, conflict)}
18:         child.solution ← REPLAN(N.solution, aᵢ, child.constraints)
19:
20:         if child.solution ≠ FAILURE then
21:             // HETEROGENEOUS EXTENSION: capability check
22:             if CAPABILITY_FEASIBLE(child.solution, A) then
23:                 child.cost ← COMPUTE_MAKESPAN(child.solution)
24:                 INSERT(OPEN, child)
25:             end if
26:         end if
27:     end for
28: end while
29:
30: return FAILURE

────────────────────────────────────────────────────────────────
SUBROUTINE: COMPUTE_ASSIGNMENT(Θ, R)
────────────────────────────────────────────────────────────────
// Hungarian algorithm with capability constraints
1:  G ← BUILD_BIPARTITE_GRAPH(Θ, R, compat)
2:  A ← HUNGARIAN(G, dur)              // Min-cost assignment
3:  return A

────────────────────────────────────────────────────────────────
SUBROUTINE: PLAN_PATHS(R, A, constraints)
────────────────────────────────────────────────────────────────
// Space-time A* for each robot
1:  for each rⱼ ∈ R do
2:      goals ← TASKS_FOR_ROBOT(A, rⱼ)
3:      πⱼ ← SPACE_TIME_ASTAR(rⱼ, goals, constraints)
4:  end for
5:  return {π₁, ..., πₙ}

────────────────────────────────────────────────────────────────
SUBROUTINE: CAPABILITY_FEASIBLE(solution, A)
────────────────────────────────────────────────────────────────
// Check heterogeneous constraints
1:  for each (θᵢ, rⱼ) ∈ A do
2:      if τ(rⱼ) ∉ compat(θᵢ) then
3:          return FALSE
4:      end if
5:      if loc(θᵢ) ∉ workspace(τ(rⱼ)) then
6:          return FALSE
7:      end if
8:  end for
9:  return TRUE
```

**Complexity:**
- Time: O(2^k × n² × T) worst case, where k = conflicts resolved
- Space: O(n × T) for constraint storage
- Optimal: Yes (complete and optimal for makespan)

**Implementation Notes:**
- Use lazy conflict detection for efficiency
- Implement constraint propagation to prune infeasible branches
- Consider disjoint splitting for symmetry breaking

---

### 3.2 Mixed Integer Linear Programming (MILP)

```
MILP FORMULATION: MAPF-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INDICES:
  i ∈ Θ          Tasks
  j ∈ R          Robots
  v ∈ V          Vertices
  t ∈ {0,...,T}  Time steps

DECISION VARIABLES:
  aᵢⱼ ∈ {0,1}    Task i assigned to robot j
  xⱼᵥₜ ∈ {0,1}   Robot j at vertex v at time t
  sᵢ ∈ ℝ⁺        Start time of task i
  C_max ∈ ℝ⁺     Makespan

OBJECTIVE:
  minimize C_max

CONSTRAINTS:

// (1) Each task assigned once
∀i ∈ Θ:  Σⱼ aᵢⱼ = 1

// (2) Capability compatibility
∀i ∈ Θ, j ∈ R:  aᵢⱼ ≤ compat(θᵢ, τ(rⱼ))

// (3) Robot at one location per time
∀j ∈ R, t:  Σᵥ xⱼᵥₜ = 1

// (4) Movement constraints (adjacency)
∀j, v, t:  xⱼᵥₜ₊₁ ≤ Σᵤ∈N(v)∪{v} xⱼᵤₜ

// (5) Collision avoidance (vertex)
∀v ∉ V_shared, t:  Σⱼ xⱼᵥₜ ≤ 1

// (6) Collision avoidance (edge)
∀(u,v) ∈ E, t:  xⱼ₁ᵤₜ + xⱼ₁ᵥₜ₊₁ + xⱼ₂ᵥₜ + xⱼ₂ᵤₜ₊₁ ≤ 3
                 ∀j₁ ≠ j₂

// (7) Task execution location
∀i, j:  aᵢⱼ = 1 ⟹ Σₜ∈[sᵢ,sᵢ+dur(θᵢ)] xⱼ,loc(θᵢ),ₜ ≥ dur(θᵢ)

// (8) Precedence
∀i, k ∈ pred(θᵢ):  sᵢ ≥ sₖ + dur(θₖ)

// (9) Deadline
∀i:  sᵢ + dur(θᵢ) ≤ D

// (10) Makespan
∀i:  C_max ≥ sᵢ + dur(θᵢ)

// (11) Workspace restriction (Type A)
∀j: τ(rⱼ)=A, v ∉ WA, t:  xⱼᵥₜ = 0
```

**Complexity:**
- Variables: O(|R| × |V| × T + |Θ| × |R|)
- Constraints: O(|R|² × |V| × T)
- Solvable for small instances (|R| ≤ 4, T ≤ 100)

**Implementation Notes:**
- Use Gurobi or CPLEX for best performance
- Add symmetry breaking constraints for identical robots
- Warm-start with heuristic solution

---

### 3.3 SAT/SMT Encoding

```
SAT ENCODING: MAPF-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BOOLEAN VARIABLES:
  at(j, v, t)       Robot j at vertex v at time t
  assign(i, j)      Task i assigned to robot j
  active(i, t)      Task i being executed at time t

CLAUSES:

// At-most-one location per robot per time
∀j, t:  AMO({at(j, v, t) : v ∈ V})

// At-least-one location per robot per time
∀j, t:  ALO({at(j, v, t) : v ∈ V})

// Movement (can only move to adjacent)
∀j, v, t:  at(j, v, t+1) ⟹ ⋁ᵤ∈N(v)∪{v} at(j, u, t)

// Vertex collision
∀v ∉ V_shared, t, j₁ ≠ j₂:  ¬at(j₁, v, t) ∨ ¬at(j₂, v, t)

// Task assignment
∀i:  EXO({assign(i, j) : j ∈ R})  // Exactly one

// Capability
∀i, j: τ(rⱼ) ∉ compat(θᵢ):  ¬assign(i, j)

// Task execution requires robot presence
∀i, j, t ∈ [sᵢ, sᵢ+dur(θᵢ)]:
    assign(i, j) ∧ active(i, t) ⟹ at(j, loc(θᵢ), t)

SOLVING:
  Binary search on makespan T
  For each T, check SAT
  Return minimum T with SAT assignment
```

**Complexity:**
- Variables: O(|R| × |V| × T + |Θ| × |R|)
- Useful for: Proving optimality, finding infeasibility

---

## 4. Bounded Suboptimal Algorithms

### 4.1 Enhanced CBS (ECBS)

```
ALGORITHM: ECBS-HET (Enhanced CBS with Suboptimality Bound)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I, suboptimality factor w ≥ 1
Output: Solution with cost ≤ w × OPT

Key Modification to CBS:
────────────────────────
1. High-level: Use focal search instead of best-first
   - OPEN ordered by: f(N) = g(N) + h(N)
   - FOCAL = {N ∈ OPEN : f(N) ≤ w × f_min}
   - Select from FOCAL by conflict count (fewer = better)

2. Low-level: Use focal A* for individual paths
   - Allow paths up to w × optimal length
   - Prefer paths with fewer potential conflicts

PSEUDOCODE MODIFICATION (lines 8-9 of CBS):
────────────────────────────────────────────
8:      f_min ← MIN({f(N) : N ∈ OPEN})
8a:     FOCAL ← {N ∈ OPEN : f(N) ≤ w × f_min}
9:      N ← EXTRACT_BY_CONFLICTS(FOCAL)

GUARANTEE:
  If CBS returns solution with cost C*,
  ECBS returns solution with cost ≤ w × C*
```

**Complexity:**
- Time: Much better than CBS in practice
- Typically 10-100x faster than CBS for w = 1.1-1.5
- Solution quality: Bounded suboptimal

**Parameter Selection:**
- w = 1.0: Equivalent to CBS (optimal)
- w = 1.1: Good balance of speed/quality
- w = 1.5: Fast, acceptable quality
- w = 2.0: Very fast, use for real-time

---

### 4.2 Prioritized Planning

```
ALGORITHM: PRIORITIZED-PLANNING-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I = (W, R, T, Θ, D)
Output: Feasible solution (may be suboptimal)

1:  A ← COMPUTE_ASSIGNMENT(Θ, R)
2:  priority ← COMPUTE_PRIORITY(R, A)    // See below
3:  paths ← {}
4:
5:  for each rⱼ in priority order do
6:      constraints ← EXTRACT_CONSTRAINTS(paths)
7:      πⱼ ← SPACE_TIME_ASTAR(rⱼ, A[rⱼ], constraints)
8:      if πⱼ = FAILURE then
9:          return FAILURE               // No solution found
10:     end if
11:     paths[rⱼ] ← πⱼ
12: end for
13:
14: S ← COMPUTE_SCHEDULE(A, paths)
15: return (A, paths, S)

────────────────────────────────────────────────────────────────
SUBROUTINE: COMPUTE_PRIORITY(R, A)
────────────────────────────────────────────────────────────────
// Priority based on heterogeneous capabilities

1:  for each rⱼ ∈ R do
2:      // Higher priority for:
3:      // - Type B (critical path, larger footprint)
4:      // - More tasks assigned
5:      // - Tasks closer to deadline
6:
7:      type_score ← (τ(rⱼ) = B) ? 100 : 0
8:      task_score ← |{θ : A[θ] = rⱼ}|
9:      deadline_score ← max{D - dur(θ) : A[θ] = rⱼ}
10:
11:     priority[rⱼ] ← type_score + task_score - deadline_score
12: end for
13:
14: return SORT_DESCENDING(R, priority)
```

**Complexity:**
- Time: O(|R| × |V|² × T)
- Space: O(|R| × T)
- Complete: No (may fail even when solution exists)
- Optimal: No

**Priority Heuristics for MAPF-HET:**
1. **Type-based:** Rail robots (Type B) first
2. **Deadline-based:** Tightest deadline first
3. **Workload-based:** Most tasks first
4. **Random:** Multiple runs with different orderings

---

## 5. Stochastic Algorithms

### 5.1 Monte Carlo Tree Search (MCTS)

```
ALGORITHM: MCTS-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I, time budget B, samples per rollout K
Output: Robust solution handling stochastic durations

STATE:
  s = (positions, task_status, current_time)

ACTION:
  a = (robot, direction) or (robot, start_task)

1:  root ← CREATE_NODE(initial_state)
2:
3:  while time_elapsed < B do
4:      // SELECTION: UCT policy
5:      node ← root
6:      while node is fully expanded and not terminal do
7:          node ← SELECT_CHILD_UCT(node)
8:      end while
9:
10:     // EXPANSION
11:     if node is expandable then
12:         action ← UNTRIED_ACTION(node)
13:         child ← APPLY_ACTION(node.state, action)
14:         node ← ADD_CHILD(node, child)
15:     end if
16:
17:     // SIMULATION (with stochastic durations)
18:     total_reward ← 0
19:     for k = 1 to K do
20:         s ← node.state
21:         while not terminal(s) do
22:             a ← ROLLOUT_POLICY(s)
23:             s ← SIMULATE_TRANSITION(s, a)  // Sample durations
24:         end while
25:         total_reward ← total_reward + REWARD(s)
26:     end for
27:     avg_reward ← total_reward / K
28:
29:     // BACKPROPAGATION
30:     while node ≠ NULL do
31:         UPDATE_STATS(node, avg_reward)
32:         node ← node.parent
33:     end while
34: end while
35:
36: return BEST_PATH(root)

────────────────────────────────────────────────────────────────
SUBROUTINE: REWARD(terminal_state)
────────────────────────────────────────────────────────────────
1:  if all tasks completed and C_max ≤ D then
2:      return -C_max    // Negative makespan (minimize)
3:  else if some tasks incomplete then
4:      return -∞        // Penalize incomplete
5:  else
6:      return -C_max - penalty × (C_max - D)  // Penalize late
7:  end if

────────────────────────────────────────────────────────────────
SUBROUTINE: SELECT_CHILD_UCT(node)
────────────────────────────────────────────────────────────────
// Upper Confidence Bound for Trees
1:  best_child ← NULL
2:  best_ucb ← -∞
3:  for each child of node do
4:      ucb ← child.avg_reward + c × √(ln(node.visits) / child.visits)
5:      if ucb > best_ucb then
6:          best_ucb ← ucb
7:          best_child ← child
8:      end if
9:  end for
10: return best_child
```

**Complexity:**
- Time: Anytime (improves with more iterations)
- Space: O(branching^depth) for tree storage
- Handles stochastic durations naturally
- No optimality guarantee, but good empirical performance

---

### 5.2 Robust Optimization via Scenario Sampling

```
ALGORITHM: SCENARIO-ROBUST-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I, number of scenarios N
Output: Solution robust to duration uncertainty

1:  // Generate N scenarios
2:  scenarios ← {}
3:  for n = 1 to N do
4:      scenario[n] ← {}
5:      for each θᵢ ∈ Θ do
6:          scenario[n][θᵢ] ← SAMPLE(dur_distribution(θᵢ))
7:      end for
8:      scenarios ← scenarios ∪ {scenario[n]}
9:  end for
10:
11: // Solve min-max problem
12: best_solution ← NULL
13: best_worst_case ← ∞
14:
15: // Enumerate or search solution space
16: for each candidate solution (A, P) do
17:     worst_makespan ← 0
18:     for each scenario in scenarios do
19:         makespan ← EVALUATE(A, P, scenario)
20:         worst_makespan ← max(worst_makespan, makespan)
21:     end for
22:     if worst_makespan < best_worst_case then
23:         best_worst_case ← worst_makespan
24:         best_solution ← (A, P)
25:     end if
26: end for
27:
28: return best_solution
```

---

## 6. Learning-Based Algorithms

### 6.1 Graph Neural Network for State Encoding

```
ARCHITECTURE: GNN-MAPF-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUT GRAPH CONSTRUCTION:
────────────────────────────
• Nodes: Robots ∪ Tasks ∪ Workspace vertices
• Edges:
  - Robot-Task: if capable
  - Robot-Robot: potential conflict
  - Workspace edges: adjacency

NODE FEATURES:
────────────────────────────
Robot node rⱼ:
  [type_one_hot, position_x, position_y, assigned_tasks,
   remaining_capacity, time_to_deadline]

Task node θᵢ:
  [type_one_hot, location_x, location_y, duration,
   precedence_count, assigned_robot, status]

EDGE FEATURES:
────────────────────────────
Robot-Task edge:
  [distance, capability_match, estimated_arrival]

Robot-Robot edge:
  [distance, potential_conflict_time, type_match]

MESSAGE PASSING (3 layers):
────────────────────────────
for l = 1 to 3 do
    for each node v do
        m_v ← AGGREGATE({h_u^(l-1) : u ∈ N(v)})
        h_v^(l) ← UPDATE(h_v^(l-1), m_v)
    end for
end for

OUTPUT HEAD:
────────────────────────────
• Assignment logits: MLP(h_robot, h_task)
• Action values: MLP(h_robot) for RL policy
• Conflict prediction: MLP(h_robot1, h_robot2)
```

### 6.2 Reinforcement Learning Policy

```
ALGORITHM: RL-MAPF-HET (PPO-based)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATE REPRESENTATION:
  s = GNN_ENCODE(robots, tasks, workspace, time)

ACTION SPACE:
  Discrete: For each robot, select next waypoint or task to start

REWARD DESIGN:
────────────────────────────
r(s, a, s') = r_progress + r_completion + r_collision + r_deadline

r_progress   = Σᵢ (tasks_completed(s') - tasks_completed(s))
r_completion = large_bonus if all tasks done
r_collision  = -penalty for each collision
r_deadline   = -penalty × max(0, completion_time - D)

TRAINING:
────────────────────────────
1. Collect trajectories using current policy
2. Compute advantages using GAE
3. Update policy via PPO clipped objective
4. Update value function
5. Repeat

DEPLOYMENT:
────────────────────────────
1. Encode current state with GNN
2. Sample action from policy (or take argmax)
3. Execute action, observe new state
4. Repeat until terminal
```

---

## 7. Hybrid Approaches

### 7.1 Large Neighborhood Search (LNS)

```
ALGORITHM: LNS-MAPF-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input: Instance I, iterations N, destroy fraction α
Output: Improved solution

1:  (A, P, S) ← INITIAL_SOLUTION(I)      // Prioritized planning
2:  best ← (A, P, S)
3:
4:  for iter = 1 to N do
5:      // DESTROY: Remove subset of robots
6:      k ← ⌈α × |R|⌉
7:      removed ← SELECT_ROBOTS_TO_REMOVE(R, k)
8:      partial ← REMOVE_PATHS(P, removed)
9:
10:     // REPAIR: Re-plan for removed robots
11:     for each rⱼ ∈ removed do
12:         constraints ← EXTRACT_CONSTRAINTS(partial)
13:         πⱼ ← SPACE_TIME_ASTAR(rⱼ, A[rⱼ], constraints)
14:         partial[rⱼ] ← πⱼ
15:     end for
16:
17:     // ACCEPT: Simulated annealing
18:     new_cost ← COMPUTE_MAKESPAN(partial)
19:     if ACCEPT(current_cost, new_cost, iter) then
20:         (A, P, S) ← UPDATE_SOLUTION(A, partial)
21:         if new_cost < best.cost then
22:             best ← (A, P, S)
23:         end if
24:     end if
25: end for
26:
27: return best

────────────────────────────────────────────────────────────────
SUBROUTINE: SELECT_ROBOTS_TO_REMOVE(R, k)
────────────────────────────────────────────────────────────────
Strategies:
1. RANDOM: Uniform random selection
2. CONFLICT: Select robots involved in most conflicts
3. SLACK: Select robots with most schedule slack
4. NEIGHBORHOOD: Select spatially close robots
```

---

## 8. Algorithm Comparison

### 8.1 Theoretical Comparison

| Algorithm | Optimal | Complete | Time Complexity | Space |
|-----------|---------|----------|-----------------|-------|
| CBS-HET | Yes | Yes | O(2^k × n² × T) | O(n × T) |
| MILP | Yes | Yes | Exponential | O(n × V × T) |
| SAT | Yes | Yes | Exponential | O(n × V × T) |
| ECBS-HET | w-optimal | Yes | Better than CBS | O(n × T) |
| Prioritized | No | No | O(n × V² × T) | O(n × T) |
| MCTS | No | No | Anytime | O(tree size) |
| RL | No | No | O(policy eval) | O(model size) |
| LNS | No | No | O(iterations × n) | O(n × T) |

### 8.2 Empirical Recommendations

```
ALGORITHM SELECTION GUIDE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem Size          Recommended Algorithm
─────────────────────────────────────────────────────────────
Small (≤4 robots)     MILP or CBS-HET (optimal)
Medium (5-10 robots)  ECBS-HET (w=1.1-1.2)
Large (>10 robots)    Prioritized + LNS refinement

Time Constraints      Recommended Algorithm
─────────────────────────────────────────────────────────────
Offline (minutes)     CBS-HET or ECBS-HET
Real-time (seconds)   Prioritized Planning
Anytime              MCTS or LNS

Stochastic Durations  Recommended Algorithm
─────────────────────────────────────────────────────────────
Yes                   MCTS or Scenario-Robust
No                    CBS-HET / ECBS-HET
```

---

## 9. Implementation Recommendations

### 9.1 Software Libraries

| Component | Recommended Library |
|-----------|---------------------|
| Graph operations | NetworkX, Boost Graph |
| MILP solver | Gurobi, CPLEX, OR-Tools |
| SAT solver | CaDiCaL, Glucose |
| A* search | Custom or OMPL |
| GNN | PyTorch Geometric, DGL |
| RL | Stable-Baselines3, RLlib |

### 9.2 Performance Optimizations

1. **Conflict detection:** Use spatial hashing for O(1) lookup
2. **Path caching:** Reuse paths between CBS iterations
3. **Parallel low-level:** Plan multiple robots in parallel
4. **Symmetry breaking:** Canonical form for identical robots
5. **Heuristic improvements:** Landmark heuristics for A*

---

## Related Documents

- `01-problem-formulation.md` - Formal problem definition
- `02-complexity-analysis.md` - Theoretical foundations
- `04-simulation.md` - Benchmark scenarios for testing
- `05-literature.md` - Algorithm references
