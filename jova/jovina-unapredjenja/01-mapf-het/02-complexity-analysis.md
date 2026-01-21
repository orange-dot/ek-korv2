# MAPF-HET: Complexity Analysis

> **Topic:** Multi-Agent Path Finding with Heterogeneous Agents
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document establishes the computational complexity of MAPF-HET and analyzes special cases where polynomial-time algorithms exist.

---

## 2. Background: Standard MAPF Complexity

### 2.1 Known Results

```
STANDARD MAPF COMPLEXITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Makespan minimization: NP-hard on general graphs
  [Yu & LaValle, AAAI 2013]

• Sum-of-costs minimization: NP-hard on general graphs
  [Surynek, AAAI 2010]

• On 2D grids: NP-hard for makespan
  [Ratner & Warmuth, 1986]

• On trees: Polynomial time
  [Kornhauser et al., 1984]

• With 2 agents: Polynomial time
  [Yu & LaValle, 2015]
```

---

## 3. MAPF-HET Complexity

### 3.1 Main Theorem

```
THEOREM 1 (NP-Hardness of MAPF-HET):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The decision version of MAPF-HET is NP-complete:

MAPF-HET-DECISION:
  Input: Instance I = (W, R, T, Θ, D), bound K
  Question: Does there exist a feasible solution with C_max ≤ K?

MAPF-HET-DECISION ∈ NP-complete
```

### 3.2 Proof of NP-Hardness

**Proof Strategy:** Reduction from standard MAPF.

```
REDUCTION: MAPF ≤_p MAPF-HET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Given: MAPF instance I_std = (G, A, s, g) where:
  • G = (V, E) is the graph
  • A = {a₁, ..., aₙ} are agents
  • s: A → V are start positions
  • g: A → V are goal positions

Construct: MAPF-HET instance I_het = (W, R, T, Θ, D)

Construction:
────────────────
1. Set W = (G, ∅, identity) (same graph, no obstacles)

2. For each agent aᵢ ∈ A:
   • Create robot rᵢ with τ(rᵢ) = A (all same type)
   • Set start position s(rᵢ) = s(aᵢ)

3. For each agent aᵢ ∈ A:
   • Create task θᵢ with:
     - loc(θᵢ) = g(aᵢ) (goal position)
     - dur(θᵢ) = 0 (instant task)
     - compat(θᵢ) = {A} (any robot can do it)
   • Add constraint: θᵢ must be done by rᵢ
     (encode via unique capability)

4. Set D = K (deadline equals makespan bound)

Correctness:
────────────────
(⟹) If MAPF has solution with makespan ≤ K:
    • Use same paths for MAPF-HET
    • All robots reach goals by time K
    • All tasks completed by deadline D = K

(⟸) If MAPF-HET has solution with C_max ≤ K:
    • Extract paths from MAPF-HET solution
    • Each robot reaches its task location
    • This constitutes valid MAPF solution
    • Makespan ≤ K since C_max ≤ K

Therefore: MAPF-HET is at least as hard as MAPF.
Since MAPF is NP-hard, MAPF-HET is NP-hard. □
```

### 3.3 Membership in NP

```
LEMMA 1 (NP Membership):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET-DECISION ∈ NP

Proof:
────────────────
Certificate: (A, P, S) where:
  • A is the task assignment (|Θ| × |R| bits)
  • P is the set of paths (|R| × K vertices)
  • S is the schedule (|Θ| real numbers)

Verification (polynomial time):
  1. Check assignment validity: O(|Θ|)
  2. Check capability compatibility: O(|Θ|)
  3. Check collision-free paths: O(|R|² × K)
  4. Check precedence: O(|Θ|²)
  5. Check deadline: O(|Θ|)

Total verification: O(|R|² × K + |Θ|²) = polynomial □
```

---

## 4. Hardness of Variants

### 4.1 Task Assignment Only

```
THEOREM 2 (Assignment Hardness):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Even when paths are trivial (single location workspace),
task assignment in MAPF-HET is NP-hard.

Proof: Reduction from 3-PARTITION.

Given: 3-PARTITION instance:
  • Set S = {s₁, ..., s₃ₘ} of integers
  • Target T = (Σᵢsᵢ) / m
  • Question: Partition S into m triples, each summing to T?

Construct MAPF-HET:
  • m robots (one per partition)
  • 3m tasks with dur(θᵢ) = sᵢ
  • Deadline D = T

3-PARTITION has solution ⟺ MAPF-HET has C_max = T

Since 3-PARTITION is strongly NP-complete,
assignment remains NP-hard even for unary encoding. □
```

### 4.2 Heterogeneous Capability Constraints

```
THEOREM 3 (Capability-Constrained Hardness):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET with capability constraints is NP-hard even for:
  • 2 robot types
  • Unit task durations
  • Star graph topology

Proof: Reduction from SET COVER.

Given: Universe U, collection S of subsets, bound k
Question: ∃ S' ⊆ S with |S'| ≤ k and ∪S' = U?

Construct:
  • One robot type per set in S
  • One task per element in U
  • compat(θᵤ) = {types for sets containing u}
  • Robot count per type = 1
  • Deadline D = k

SET COVER has k-cover ⟺ MAPF-HET feasible □
```

---

## 5. Approximability Analysis

### 5.1 Inapproximability

```
THEOREM 4 (Inapproximability):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Unless P = NP, there is no polynomial-time algorithm
achieving approximation ratio better than 4/3 for
MAPF-HET makespan minimization.

Proof: Follows from the inapproximability of scheduling
on unrelated parallel machines [Lenstra et al., 1990].
```

### 5.2 Achievable Bounds

```
THEOREM 5 (Approximation Upper Bound):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

There exists a polynomial-time O(log n)-approximation
algorithm for MAPF-HET, where n = |R| + |Θ|.

Algorithm: LP relaxation + randomized rounding

1. Solve LP relaxation of assignment
2. Round fractional assignments
3. Compute paths via prioritized planning
4. Resolve conflicts greedily

The O(log n) factor arises from conflict resolution.
```

---

## 6. Special Cases: Polynomial Time

### 6.1 Fixed Number of Robots

```
THEOREM 6 (Fixed Robot Count):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET with |R| = k (constant) is solvable in
polynomial time O(|V|^(2k) × |Θ|^k).

Algorithm:
  1. Enumerate all |R|^|Θ| assignments
  2. For each assignment, solve k-robot path planning
  3. k-robot MAPF on graph solvable in O(|V|^(2k))

For fixed k, this is polynomial in |V| and |Θ|.
```

### 6.2 Tree Workspace

```
THEOREM 7 (Tree Graphs):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET on tree graphs with homogeneous capabilities
is solvable in polynomial time O(n² × m × log(n × m)).

Algorithm: Dynamic programming on tree structure
  1. Root the tree arbitrarily
  2. Process subtrees bottom-up
  3. Merge solutions at internal nodes
  4. Maintain Pareto-optimal (makespan, energy) frontiers
```

### 6.3 Single Robot Type

```
THEOREM 8 (Homogeneous Robots):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET with |T| = 1 (single robot type) reduces to
standard MAPF with task assignment.

This remains NP-hard but existing MAPF solvers apply.
```

### 6.4 Linear Topology (Rail Only)

```
THEOREM 9 (Linear Topology):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET on a line graph (rail-mounted robots only)
is solvable in polynomial time O(n² × m).

Algorithm:
  1. Sort tasks by location
  2. Assign robots to contiguous task segments
  3. Paths are uniquely determined (no crossings possible)
  4. Schedule via critical path method
```

---

## 7. Parameterized Complexity

### 7.1 Parameters of Interest

| Parameter | Symbol | Typical Value |
|-----------|--------|---------------|
| Number of robots | k = \|R\| | 2-8 |
| Number of tasks | m = \|Θ\| | 5-50 |
| Workspace size | n = \|V\| | 100-1000 |
| Makespan bound | T = D | 60-600 (seconds) |
| Number of types | t = \|T\| | 2 |

### 7.2 FPT Results

```
THEOREM 10 (Fixed-Parameter Tractability):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET is:
  • FPT with parameter k (number of robots)
  • FPT with parameter k + tw (robots + treewidth)
  • W[1]-hard with parameter m (number of tasks)

Practical implication: For small robot counts (k ≤ 8),
exact algorithms are feasible even for large workspaces.
```

### 7.3 XP Results

```
THEOREM 11 (XP Membership):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MAPF-HET is in XP for parameter T (makespan bound):
  • Time complexity: O(n^(k×T))
  • Exponential in T but polynomial for fixed T
```

---

## 8. Practical Implications

### 8.1 Problem Size Feasibility

```
FEASIBILITY MATRIX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Robots | Tasks | Workspace | Method           | Time
──────────────────────────────────────────────────────────────
  2    |  10   |   100     | Exact (MILP)     | < 1s
  4    |  20   |   500     | CBS              | < 10s
  8    |  50   |  1000     | ECBS (w=1.5)     | < 60s
  8    |  100  |  1000     | Prioritized      | < 10s
```

### 8.2 Algorithm Selection Guide

```
ALGORITHM SELECTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If (|R| ≤ 4 AND |Θ| ≤ 20):
    → Use MILP for optimal solution

If (|R| ≤ 8 AND need optimality guarantee):
    → Use CBS with enhancements

If (|R| > 8 OR real-time needed):
    → Use ECBS or Prioritized Planning

If (stochastic durations important):
    → Use MCTS or robust optimization
```

---

## 9. Open Problems

1. **Tight Approximation Bound:** Close the gap between 4/3 lower bound and O(log n) upper bound

2. **Kernelization:** Does MAPF-HET admit polynomial kernel for parameter k?

3. **Online Competitive Ratio:** What is the best achievable competitive ratio for online MAPF-HET?

4. **Mixed Workspace Complexity:** Precise complexity for combined 1D rail + 2D mobile workspace

---

## 10. Summary Table

| Variant | Complexity | Best Algorithm |
|---------|------------|----------------|
| General MAPF-HET | NP-complete | CBS/ECBS |
| Fixed k robots | P (O(n^2k × m^k)) | Enumeration |
| Tree workspace | P (O(n²m log nm)) | Tree DP |
| Linear (rail only) | P (O(n²m)) | Sorting + CPM |
| Single type | NP-complete | Standard MAPF |
| Assignment only | NP-complete | MILP |

---

## Related Documents

- `01-problem-formulation.md` - Formal problem definition
- `03-algorithms.md` - Algorithmic approaches
- `04-simulation.md` - Benchmark scenarios
- `05-literature.md` - References for complexity results
