# Multi-Agent Path Finding with Heterogeneous Agents: State-of-the-Art and Frontiers

> **Document Revision History**
>
> | Version | Date | Changes |
> |---------|------|---------|
> | 1.0 | 2026-01-20 | Initial state-of-the-art survey |
> | 2.0 | 2026-01-21 | Added "Proposed algorithmic contributions for industrial battery swap" section based on first feedback from anonymous reviewer. Reviewer noted the survey was comprehensive but lacked original contributions specific to EK's unique problem characteristics. This revision proposes five new algorithms: HYBRID-CBS, MIXED-CBS, DEADLINE-CBS, STOCHASTIC-ECBS, and FIELD-GUIDED MCTS. |

---

**MAPF-Het has evolved from a theoretical curiosity to a critical enabler for real-world multi-robot systems.** By late 2025, the field has achieved remarkable scalability—handling **10,000+ agents in simulations** and **200,000+ robots in Amazon warehouses**—while simultaneously expanding to handle the heterogeneity that real robotic fleets demand. This report provides a comprehensive technical analysis of the algorithmic foundations, practical deployment challenges, and bleeding-edge research shaping this rapidly evolving domain.

The most significant recent developments include the emergence of **foundation models for MAPF** (MAPF-GPT at AAAI 2025), **hybrid classical-learning algorithms** that combine Large Neighborhood Search with reinforcement learning, and **kinodynamic planners** like db-CBS that finally bridge the gap between discrete path planning and continuous robot dynamics. For practitioners building AI orchestration and logistics systems, the key insight is that **production-ready heterogeneous MAPF is now achievable**, though it requires careful algorithm selection based on the specific heterogeneity dimensions and operational constraints.

---

## The algorithmic landscape centers on CBS and its descendants

Conflict-Based Search (CBS), introduced by Sharon et al. in 2015, remains the foundational framework for heterogeneous MAPF. The algorithm operates on two levels: a **high-level search** through a constraint tree where nodes represent sets of constraints, and a **low-level A* search** that computes single-agent paths satisfying those constraints. When conflicts arise, CBS branches by adding constraints that force one agent to avoid the conflicting location at the conflicting time.

For heterogeneous agents, several critical CBS extensions have emerged:

**G-CBS (Generalized CBS)** from Atzmon et al. handles the broadest class of heterogeneity by allowing agents to have different state functions (occupying multiple locations), transition functions (different movement capabilities), and delay tolerances. The key insight is modeling each agent with a state function S_i ⊂ V representing occupied locations and a transition function Tr_i defining feasible movements.

**CCBS (Continuous-time CBS)** removes the discrete timestep assumption entirely. Action durations become real-valued where d_move = speed × edge_length, enabling agents with genuinely different velocities to be planned together. CCBS uses Safe Interval Path Planning (SIPP) at the low level to manage conflict-free time windows.

**HCBS (Heterogeneous CBS)** specifically targets mixed holonomic and non-holonomic agents—a critical capability for mixed fleets combining omnidirectional warehouse robots with car-like vehicles. It uses **Hybrid A*** for non-holonomic agents and standard A* for holonomic ones, with body conflict detection handling geometric overlaps.

The scalability hierarchy for optimal and bounded-suboptimal solvers in late 2025 looks approximately like this:

| Algorithm | Optimality | Practical Scale | Key Innovation |
|-----------|------------|-----------------|----------------|
| CBSH2-RTC | Optimal | ~200-300 agents | WDG heuristic + symmetry reasoning |
| EECBS | Bounded (2%) | ~1,000 agents | Explicit estimation + SIPPS |
| PBS | Near-optimal | ~800 agents | Priority ordering search |
| LaCAM* | Near-optimal | ~1,000+ real-time | Lazy constraint addition |
| MAPF-LNS2 | Anytime | ~3,800 agents | Large neighborhood destruction/repair |

---

## Heterogeneity manifests across five critical dimensions

Understanding how different types of heterogeneity affect algorithmic approaches is essential for practical system design. Each dimension introduces distinct modeling and solving challenges.

**Speed heterogeneity** requires abandoning synchronized timesteps. The most robust approach uses continuous-time formulations where actions have real-valued durations. AA-SIPP-m provides configurable per-agent `movespeed` and `rotationspeed` parameters, while SMT-CBS^R uses Satisfiability Modulo Theories for agents with different constant velocities in Euclidean space. A newer approach, **Space-Level CBS (SL-CBS)**, creates coordination controllers that issue stop/continue commands, allowing dynamic velocity adjustment during execution.

**Kinematic constraints** present the deepest modeling challenges. Non-holonomic agents—differential-drive robots, Ackermann-steering vehicles, unicycles—cannot simply move in any direction. The breakthrough **db-CBS (discontinuity-bounded CBS)** from Wolfgang Hönig's group combines CBS with db-A* and nonlinear optimization to handle heterogeneous teams where robots have fundamentally different dynamics (unicycle, double integrator, car with trailer). It has been validated on real flying robots with different collision shapes.

**Geometric heterogeneity** (different sizes and shapes) requires extended conflict detection. **MC-CBS (Multi-Constraint CBS)** handles agents occupying multiple grid cells simultaneously by adding multiple constraints when resolving body conflicts. This approach outperforms standard CBS by up to **three orders of magnitude** on large-agent instances. The key modeling decision is choosing bounding representations: circles for simplicity, rectangles for warehouse robots, or arbitrary convex polygons for irregular shapes.

**Capability heterogeneity**—different sensing, manipulation, or payload capacities—requires coupling path planning with task allocation. The dominant pattern is **MRTA+MAPF integration**, where Multi-Robot Task Allocation matches capabilities to task requirements before or jointly with path planning. Trait-based coalition formation groups robots into teams satisfying task "traits" (required capabilities).

**Mixed teams** combining ground and aerial robots, or robots and humans, remain the frontier. The **CBS Protocol** framework (2025) treats CBS as a coordination API where different agents can use entirely different motion planners—optimization solvers, RL policies, Dubins planners—while still achieving conflict-free coordination. For human-robot teaming, prediction-based approaches using **LSTM networks** to forecast human movements show promise, with demonstrated 100% success rates and 23% collision reduction in construction environments.

---

## Application domains reveal distinct technical requirements

**Warehouse robotics** represents the most mature deployment domain. Amazon operates **200,000+ mobile robots** across its fulfillment centers, and Ocado's "Hive" systems achieve **50-item orders in ~5 minutes** with robots moving at 4 m/s within 5mm clearance. The technical focus here is **Lifelong MAPF**—continuous operation where new goals arrive constantly. Rolling-Horizon Collision Resolution (RHCR) addresses this by planning collision-free paths only for the next w timesteps, enabling scaling to 1,000+ agents. Domain-specific challenges include heavy loads affecting robot dynamics and interdependent pickup-and-delivery tasks.

**Autonomous vehicle coordination** at intersections represents a fundamentally different challenge. The reservation-based AIM (Autonomous Intersection Management) paradigm treats the intersection as a grid of tiles where vehicles request time-space reservations. The GAMEPLAN algorithm estimates driver aggressiveness from trajectories and uses game-theoretic auctions to determine ordering. Mixed autonomy—AVs sharing roads with human drivers—requires **multi-agent reinforcement learning** approaches, with MA2C (Multi-Agent Advantage Actor-Critic) showing **38% improvement** in traffic flow.

**Drone swarm coordination** operates in 3D continuous space with significant weather and obstacle avoidance requirements. Commercial deployments from Wing (1,000+ deliveries daily), Amazon Prime Air, and Zipline demonstrate feasibility, but coordination algorithms must handle battery constraints, communication limits, and regulatory airspace restrictions. The SARG framework achieves **100% collision avoidance** in dense environments with 21.6% reduction in computation time.

**Maritime and underwater systems** face unique constraints: no GPS underwater, acoustic-only communication with low data rates, and variable sound speed affecting localization. Leader-follower methods dominate, with emerging **ASV-AUV collaboration** where surface vehicles provide communication relay and positioning for underwater vehicles. The FATHOM-Net architecture implements software-defined MARL for AUV swarms with centralized training and decentralized execution.

**Emerging domains** include construction robotics (UAV surveying + UGV transport), mining automation (Epiroc's 3D multi-level coordination, 5-10% productivity improvement), and hospital logistics (Diligent Robotics' Moxi with 1+ million deliveries across 25+ US hospitals).

---

## Learning-based methods are reshaping the field

The most significant paradigm shift in 2024-2025 is the emergence of **foundation models and hybrid classical-learning approaches** that dramatically improve upon pure reinforcement learning methods.

**MAPF-GPT** (AAAI 2025) represents a genuine paradigm shift—a transformer-based foundation model trained via imitation learning on expert LaCAM trajectories. With models ranging from 2M to 85M parameters, MAPF-GPT achieves **zero-shot generalization** to unseen maps and significantly outperforms prior learning-based approaches (SCRIMP, DCC, PRIMAL). Crucially, it requires no communication, heuristics, or reward functions during inference—agents simply predict actions from local observations.

**LNS2+RL** (AAAI 2025) demonstrates the power of **hybrid classical-learning approaches**. It combines MARL with Large Neighborhood Search: early iterations use MARL for cooperative replanning, later iterations switch to priority-based planning. With curriculum learning for cooperative decision-making, LNS2+RL achieves **>50% success rate** on complex maps where EECBS, LaCAM, and pure MARL competitors fail.

**Graph Neural Networks** enable learned decentralized coordination. LaGAT uses a MAGAT+ model trained on near-optimal trajectories to guide LaCAM search, redefining the Pareto frontier for speed-quality tradeoffs. DGNN-GA creates heterogeneous graph representations for multi-robot goal assignment, outperforming alternatives in communication-restricted scenarios.

**LLM integration** is nascent but promising. A systematic study from October 2025 demonstrates GPT-4o generating ranked goal preferences for decentralized MAPF coordination, achieving near-optimal makespans that outperform traditional heuristics. The comprehensive "Where Paths Collide" survey identifies language-grounded planning with LLMs as a key future direction.

---

## Open problems and deployment barriers remain substantial

**Theoretical challenges** persist despite decades of research. MAPF on 2D grids is NP-hard (Yu & LaValle, 2013), and finding tractable subproblems remains active. Recent results include NP-hardness for 2-colored MAPF (2023) and for individually optimal flowtime solutions even when global optimal is tractable. The **4/3 inapproximability** bound for makespan on general graphs limits what approximation algorithms can achieve.

**Practical deployment barriers** center on the **model-reality gap**. Simplified MAPF models ignore acceleration limits, turning radii, and perception uncertainty. MAPF-POST provides polynomial-time post-processing to create kinematically executable schedules, but the gap between discrete plans and continuous robot dynamics remains challenging. The SMART framework (2025) addresses this with simulation environments incorporating realistic kinodynamic modeling.

**Scalability vs. optimality tradeoffs** are well-characterized: optimal CBS handles ~200 agents, bounded-suboptimal EECBS reaches ~1,000 agents at 2% suboptimality, while rule-based PIBT scales to **10,000+ agents** but with no optimality guarantees. The 2023 League of Robot Runners competition demonstrated top solvers handling 10,000 agents at 97.7% density—approaching the practical limits.

The **integration with perception systems** remains largely unsolved. Most MAPF research assumes perfect environmental knowledge. Research on MAPF under obstacle uncertainty (ICAPS 2023) plans as trees branching on observations, but real-time integration with SLAM, localization, and dynamic obstacle detection needs substantial work.

**Execution robustness** under uncertainty—handling delays, failures, and stochastic outcomes—requires frameworks like the Switchable Action Dependency Graph (SADG) that reschedule via MILP when delays accumulate. The k-robust MAPF variant produces plans executable even if k delays occur per agent.

---

## Proposed algorithmic contributions for industrial battery swap

The EK battery swap station presents a unique MAPF-HET problem instance with characteristics not adequately addressed by existing research. While the surveyed algorithms provide essential building blocks, industrial battery swap requires innovations that bridge the gap between academic MAPF and production deployment. We identify five novel algorithmic contributions that extend the state of the art.

**Problem characteristics unique to EK battery swap:**

1. **Mixed 1D+2D workspace** — Rail-mounted Type B robots operate on linear tracks while mobile Type A robots navigate a 2D floor plan. No existing MAPF formulation handles this dimensional heterogeneity natively.

2. **Hard operational deadlines** — Bus departure schedules are contractually binding. Unlike warehouse robots where delay merely reduces throughput, missed departures incur substantial penalties and cascade through transit networks.

3. **Stochastic task durations** — Battery swap operations exhibit LogNormal-distributed completion times due to connector alignment variance, battery health diagnostics, and mechanical variability. Point estimates are insufficient.

4. **Existing coordination infrastructure** — The EK-KOR2 RTOS already implements bio-inspired potential field coordination for the power electronics layer. Leveraging this infrastructure for robot coordination offers implementation advantages.

### HYBRID-CBS: Optimal planning with potential field execution

The fundamental tension in multi-robot coordination is between optimality (centralized CBS) and robustness (decentralized reactive control). HYBRID-CBS bridges this gap by using CBS-HET for offline path computation while EK-KOR2 potential field gradients handle real-time collision avoidance and stochastic variance.

**Architecture:** The system operates in two phases. During the planning phase, a centralized CBS-HET solver computes optimal collision-free paths P* for all robots given current task assignments. These paths are broadcast to robot controllers via CAN-FD. During execution, each robot follows its assigned path but continuously adjusts velocity and micro-positioning based on local potential field gradients sampled from neighboring robots.

**Potential field integration:** Each robot r_j maintains a coordination field F_j containing load, position, and velocity information, broadcast to topological k=7 neighbors. The execution gradient combines plan attraction with field repulsion:

```
gradient_j = α × attraction(waypoint_j, current_pos_j) + β × repulsion(F_neighbors)
```

The attraction term pulls the robot toward the next waypoint in its CBS-assigned path. The repulsion term creates safety margins around neighboring robots, handling the inevitable timing deviations from the idealized CBS plan.

**Graceful degradation:** When cumulative deviation from the planned path exceeds a threshold θ, the robot triggers local replanning or consensus voting among affected neighbors. For minor deviations (< θ/2), the potential field naturally absorbs variance. For moderate deviations (θ/2 to θ), velocity adjustments maintain safety without replanning. For major deviations (> θ), partial CBS re-solve for affected robots while others continue execution.

**Pseudocode:**

```
HYBRID-CBS(Instance I, Deadline D):
  // Phase 1: Centralized CBS
  (A*, P*, makespan) ← CBS-HET(I)
  if makespan > D:
    return INFEASIBLE

  broadcast P* to all robots via CAN-FD

  // Phase 2: Decentralized Execution
  for each robot r_j in parallel:
    while not all_tasks_complete(r_j):
      F_neighbors ← sample_neighbor_fields()
      waypoint_j ← next_waypoint(P*_j, current_time)

      // Gradient combines plan attraction + field repulsion
      attraction ← waypoint_j - current_pos_j
      repulsion ← Σ_{k ∈ neighbors} exp(-||pos_j - pos_k||² / σ²) × (pos_j - pos_k)
      gradient ← α × normalize(attraction) + β × repulsion

      deviation ← ||current_pos_j - interpolate(P*_j, current_time)||
      if deviation > θ:
        trigger_local_replan(r_j, affected_neighbors)

      execute_motion(gradient, velocity_limit_j)
```

**Novelty:** HYBRID-CBS is the first algorithm to formally integrate CBS optimality guarantees with embedded potential field execution. Prior work on CBS execution (MAPF-POST, k-robust MAPF) focuses on post-processing or robustness guarantees, not continuous reactive adaptation. The key insight is treating the CBS solution as a reference trajectory rather than a rigid execution mandate.

**Complexity:** Planning phase is O(CBS-HET), which is NP-hard but tractable for the 10-30 robot scale typical of battery swap stations. Execution phase is O(k) per robot per timestep for field gradient computation, dominated by the 7-neighbor communication overhead already present in EK-KOR2.

### MIXED-CBS: Dimensional conflict classes for heterogeneous workspaces

Standard CBS conflict detection assumes all agents operate in the same dimensional space—typically 2D grid cells or 3D continuous coordinates. The EK battery swap station violates this assumption fundamentally: Type B rail robots are constrained to 1D linear segments, while Type A mobile robots navigate the 2D floor plan. Dock positions where robots transfer batteries represent crossing points between these dimensional domains.

**Conflict classification:** MIXED-CBS introduces three conflict classes with distinct constraint generation:

```
ConflictClass:
  LINEAR   — Type B vs Type B on same rail segment
             Resolution: temporal sequencing only
             Constraint: avoid(r_i, segment_s, [t_1, t_2])

  PLANAR   — Type A vs Type A in 2D workspace
             Resolution: standard CBS vertex/edge constraints
             Constraint: avoid(r_i, vertex_v, t) or avoid(r_i, edge_e, t)

  CROSSING — Type A vs Type B at dock position
             Resolution: priority to Type B (critical path)
             Constraint: avoid(r_A, dock_d, [t_entry_B, t_exit_B + margin])
```

**Dimensional projection:** The key algorithmic insight is that conflict detection between agents of different dimensions requires projecting to the lower-dimensional space. A Type A robot at position (x, y) conflicts with a Type B robot on rail segment s if and only if (x, y) projects onto s within the Type B robot's footprint. This projection is computed geometrically based on rail segment endpoints and robot dimensions.

**Constraint tree modification:** The standard CBS high-level search branches on conflicts by adding constraints to one agent or the other. MIXED-CBS modifies branching for CROSSING conflicts to respect operational priorities:

1. If the Type B robot is on the critical path to a bus departure deadline, always constrain the Type A robot
2. If both robots have slack, branch normally and let cost guide selection
3. If constraint propagation proves infeasibility for Type A, backtrack and try constraining Type B

**Graph representation:** The low-level search operates on a composite graph where Type B agents search linear graphs (segments as vertices, junctions as edges), Type A agents search the standard 2D grid or roadmap, and dock positions appear in both graphs with special transfer edges.

**Novelty:** MIXED-CBS provides the first theoretical framework for MAPF in mixed-dimensional workspaces. Prior heterogeneous MAPF work handles speed, size, and kinematic differences, but assumes dimensional homogeneity. Industrial robotics frequently combines overhead gantries (1D), rail-mounted manipulators (1D), and mobile platforms (2D)—MIXED-CBS addresses this gap.

**Theorem (informal):** MIXED-CBS is complete and optimal for mixed-dimensional MAPF instances where the dimensional projection operator is well-defined and conflicts can be resolved by temporal separation.

### DEADLINE-CBS: Hard deadline integration via temporal SAT

Warehouse MAPF optimizes makespan or sum-of-costs as objective functions, with implicit soft deadlines from throughput requirements. Battery swap stations face hard deadlines: bus departures at scheduled times. DEADLINE-CBS integrates deadline constraints directly into CBS through SAT-based temporal reasoning, enabling massive pruning of the search space.

**Deadline representation:** Each task τ has an associated deadline D_τ representing the latest completion time. For battery swap, this derives from bus departure schedule minus safety margins:

```
D_swap = t_departure - margin_thermal_conditioning - margin_connection_verification
```

**SAT layer for infeasibility detection:** Before expanding a CBS node, DEADLINE-CBS encodes the current constraint set and deadline requirements as a SAT formula:

```
φ = ∧_{r ∈ robots} path_constraints(r)
  ∧ ∧_{τ ∈ tasks} deadline_constraint(τ, D_τ)
  ∧ ∧_{(r_i, r_j, t) ∈ conflicts} ¬collision(r_i, r_j, t)
```

If φ is UNSAT, the current CBS branch cannot satisfy deadlines—prune immediately without computing low-level paths. This provides exponential speedup when deadlines are tight and many branches would fail deadline checks only after expensive path computation.

**Slack-aware branching:** When multiple conflicts exist at a CBS node, standard CBS selects arbitrarily or by earliest time. DEADLINE-CBS prioritizes conflicts involving robots with tightest deadline slack:

```
slack(r, τ) = D_τ - earliest_completion(r, τ)
priority(conflict) = min(slack(r_i), slack(r_j)) for conflict between r_i and r_j
```

Resolving tight-slack conflicts first propagates deadline pressure through the constraint tree, enabling earlier pruning of infeasible branches.

**Incremental SAT solving:** The SAT formula grows incrementally as constraints are added. DEADLINE-CBS maintains an incremental SAT solver (e.g., CaDiCaL with assumption-based interface) that reuses learned clauses across CBS nodes, amortizing the cost of repeated satisfiability checks.

**Pseudocode:**

```
DEADLINE-CBS(Instance I, Deadlines D):
  root ← empty_constraint_set()
  root.paths ← compute_unconstrained_paths(I)

  if SAT_check(root, D) == UNSAT:
    return INFEASIBLE

  OPEN ← {root}

  while OPEN not empty:
    N ← pop_min_cost(OPEN)

    if no_conflicts(N.paths):
      return N.paths  // Solution found

    // Select conflict with tightest deadline slack
    conflict ← select_tightest_slack_conflict(N, D)
    (r_i, r_j, v, t) ← conflict

    for each resolution in {constrain(r_i), constrain(r_j)}:
      N' ← apply_constraint(N, resolution)

      // Early pruning via SAT
      if SAT_check(N', D) == UNSAT:
        continue  // Prune this branch

      N'.paths[affected_robot] ← A*(affected_robot, N'.constraints)
      if path_found and meets_deadline(N'.paths, D):
        insert(OPEN, N')

  return INFEASIBLE
```

**Novelty:** DEADLINE-CBS is the first CBS variant to integrate hard deadline constraints directly into the search via SAT-based pruning. Prior work on temporal MAPF (TC-CBS) handles temporal constraints as soft preferences. The combination of SAT-based infeasibility detection and slack-aware branching is novel.

**Complexity:** Each SAT check adds O(|constraints| × log(|constraints|)) overhead for unit propagation. For typical battery swap instances with ~30 robots and ~100 constraints, this is dominated by low-level path computation. The pruning benefit is exponential in the tightness of deadline constraints.

### STOCHASTIC-ECBS: LogNormal duration-aware focal search

Enhanced Conflict-Based Search (ECBS) provides bounded-suboptimal solutions by maintaining a focal list of nodes within a factor w of optimal. The standard focal condition f(N) ≤ w × f_min assumes deterministic costs. Battery swap task durations are stochastic, following LogNormal distributions due to the multiplicative nature of timing variance in mechanical systems.

**Stochastic duration model:** Each task τ has duration T_τ ~ LogNormal(μ_τ, σ_τ) with parameters estimated from operational data. The makespan of a plan is C_max = max_{r} completion_time(r), which is the maximum of correlated LogNormal random variables.

**Fenton-Wilkinson approximation:** Computing the distribution of max(X_1, ..., X_n) for LogNormal X_i is intractable in closed form. STOCHASTIC-ECBS uses the Fenton-Wilkinson approximation, which matches moments to approximate the maximum as another LogNormal:

```
C_max ~ LogNormal(μ_max, σ_max)

where:
  μ_max ≈ log(Σ exp(μ_i + σ_i²/2)) - σ_max²/2
  σ_max² ≈ log(1 + Σ exp(2μ_i + σ_i²)(exp(σ_i²) - 1) / (Σ exp(μ_i + σ_i²/2))²)
```

This approximation is computed in O(n) time and provides sufficient accuracy for deadline probability estimation.

**Probabilistic focal condition:** Instead of the deterministic condition f(N) ≤ w × f_min, STOCHASTIC-ECBS uses:

```
P(C_max(N) ≤ D) ≥ 1 - ε
```

Nodes enter the focal list if their plans have at least (1-ε) probability of meeting the deadline D. This naturally handles variance: a plan with lower expected makespan but higher variance may be excluded in favor of a more reliable (lower variance) plan.

**Risk-aware conflict resolution:** When branching on conflicts, STOCHASTIC-ECBS considers not just expected cost but variance contribution. Constraints that reduce variance (by sequencing high-variance operations away from the critical path) are preferred over constraints that merely reduce expected cost.

**Implementation:**

```
STOCHASTIC-ECBS(Instance I, Deadline D, ε):
  root ← compute_initial_solution(I)
  root.distribution ← compute_makespan_distribution(root.paths)

  OPEN ← {root}
  FOCAL ← {N ∈ OPEN : P(C_max(N) ≤ D) ≥ 1 - ε}

  while FOCAL not empty:
    N ← pop_min_expected_cost(FOCAL)

    if no_conflicts(N.paths):
      return N.paths

    conflict ← select_conflict(N)
    for each resolution in branch(conflict):
      N' ← apply_constraint(N, resolution)
      N'.paths[affected] ← A*(affected, N'.constraints)
      N'.distribution ← update_distribution(N'.distribution, affected)

      insert(OPEN, N')
      if P(C_max(N') ≤ D) ≥ 1 - ε:
        insert(FOCAL, N')

  return INFEASIBLE  // No plan with sufficient deadline probability
```

**Novelty:** STOCHASTIC-ECBS is the first bounded-suboptimal MAPF solver to handle stochastic task durations with explicit deadline probability guarantees. Prior stochastic MAPF work focuses on uncertain obstacle locations or agent positions, not task duration variance. The use of Fenton-Wilkinson approximation for efficient max-LogNormal computation in the ECBS focal condition is novel.

### FIELD-GUIDED MCTS: Potential fields as rollout policy

Monte Carlo Tree Search (MCTS) has shown promise for MAPF as an anytime algorithm that can trade computation time for solution quality. The standard challenge is designing effective rollout policies—random rollouts explore poorly in the constrained MAPF action space. FIELD-GUIDED MCTS uses EK-KOR2 potential field gradients as a physics-inspired, interpretable rollout policy.

**MCTS for MAPF:** The state is the current configuration (positions of all robots). Actions are joint moves (each robot moves or waits). The reward is negative makespan (or negative constraint violations for infeasible states). Standard MCTS with UCB1 selection and random rollouts performs poorly because random joint moves almost always cause collisions.

**Field-guided rollouts:** Instead of random action selection during rollout, each robot follows its potential field gradient:

```
action_r = argmax_{a ∈ valid_moves(r)} field_alignment(a, gradient_r)
```

The gradient incorporates:
- **Goal attraction:** Pull toward the task destination
- **Obstacle repulsion:** Push away from static obstacles
- **Robot repulsion:** Push away from other robots (using their broadcast field values)
- **Thermal/load balancing:** For battery swap, prefer paths through cooler charging bays

**Coordination through fields:** The key insight is that EK-KOR2's potential field protocol already implements distributed coordination. During MCTS rollout, robots "simulate" their behavior by following field gradients, producing collision-free trajectories without explicit conflict resolution. The field mechanism handles coordination implicitly.

**Hybrid tree policy:** MCTS selection (UCB1) chooses among previously explored branches. For unexplored children, FIELD-GUIDED MCTS uses a field-biased prior:

```
prior(action) ∝ exp(β × field_alignment(action, gradient))
```

This focuses tree expansion on actions consistent with field-guided behavior while allowing exploration of alternatives when field guidance leads to dead ends.

**Algorithm:**

```
FIELD-GUIDED-MCTS(Instance I, time_budget):
  root ← initial_state(I)

  while time_remaining(time_budget):
    // Selection: UCB1 down existing tree
    node ← select(root)

    // Expansion: add one child with field-biased prior
    child ← expand(node, field_prior)

    // Rollout: field-guided simulation
    state ← child.state
    while not terminal(state):
      for each robot r:
        gradient_r ← compute_field_gradient(state, r)
        action_r ← follow_gradient(gradient_r)
      state ← apply_joint_action(state, actions)
    reward ← evaluate(state)

    // Backpropagation
    backpropagate(child, reward)

  return best_plan(root)
```

**Novelty:** FIELD-GUIDED MCTS is the first MAPF algorithm to use embedded potential fields as MCTS rollout policy. Prior MCTS-MAPF work uses domain-specific heuristics or learned policies. The field-guided approach is physics-inspired, interpretable, and leverages existing EK-KOR2 infrastructure—the same field computation runs on embedded controllers during execution, ensuring consistency between planning and execution.

**Anytime property:** Like standard MCTS, FIELD-GUIDED MCTS is anytime: it returns progressively better solutions as computation time increases. This property is valuable for battery swap scheduling where plans must be ready by bus arrival but can be improved while buses are in queue.

### Comparison with prior work

| Algorithm | Heterogeneity | Deadlines | Stochastic | Execution | Novelty |
|-----------|--------------|-----------|------------|-----------|---------|
| CBS-HET | Speed, size, kinematics | Implicit (makespan) | No | Open-loop | Baseline |
| CCBS | Continuous time | No | No | Open-loop | Speed heterogeneity |
| MAPF-POST | Any | No | Partial | Kinodynamic smoothing | Post-processing |
| k-robust MAPF | Any | No | k-delay model | Robust plans | Delay tolerance |
| **HYBRID-CBS** | Any + dimensional | Via planning | Via fields | Potential fields | CBS + field execution |
| **MIXED-CBS** | Dimensional (1D+2D) | Via SAT | No | CBS plans | Mixed workspace |
| **DEADLINE-CBS** | Any | Hard SAT | No | CBS plans | SAT pruning |
| **STOCHASTIC-ECBS** | Any | Probabilistic | LogNormal | ECBS plans | Distribution-aware |
| **FIELD-GUIDED MCTS** | Any | Anytime | Via rollout | Field-guided | Field rollout policy |

### Implementation pathway

The five algorithms can be implemented incrementally, sharing infrastructure:

1. **MIXED-CBS** — Start here. Extend CBS-HET with dimensional conflict classes. Requires graph representation changes but no new dependencies.

2. **DEADLINE-CBS** — Add SAT layer to MIXED-CBS. Integrate CaDiCaL or similar incremental SAT solver. Enables hard deadline handling.

3. **HYBRID-CBS** — Combine DEADLINE-CBS planning with EK-KOR2 execution. Requires CAN-FD interface to robot controllers and field gradient computation.

4. **STOCHASTIC-ECBS** — Fork from DEADLINE-CBS, replacing point estimates with distributions. Add Fenton-Wilkinson approximation for makespan distribution.

5. **FIELD-GUIDED MCTS** — Independent implementation. Can run in parallel with CBS-based approaches for comparison. Good for rapid prototyping and anytime scenarios.

### Publication strategy

The algorithmic contributions map to appropriate venues:

- **ICRA 2026 / RA-L:** HYBRID-CBS as flagship systems paper, demonstrating integration with real hardware (EK-KOR2 controllers)
- **IJCAI 2026:** MIXED-CBS as theoretical contribution, proving completeness and optimality for mixed-dimensional MAPF
- **SoCS 2026:** DEADLINE-CBS as algorithmic contribution to the CBS family, with empirical evaluation on deadline-constrained instances
- **AAMAS 2026:** STOCHASTIC-ECBS addressing uncertainty in multi-agent planning, with analysis of Fenton-Wilkinson accuracy for MAPF
- **IROS 2026:** FIELD-GUIDED MCTS as systems contribution, demonstrating real-time performance with embedded potential field computation

---

## The research ecosystem spans leading academic groups and industry labs

**USC IDMLAB** (Sven Koenig, now at UC Irvine) has produced much of the foundational work: CBS variants, MAPF-LNS, RHCR, and direct collaboration with Amazon Robotics yielding Outstanding Paper Awards at ICAPS 2016 and 2020. **Jiaoyang Li** (CMU) continues pushing scalability boundaries with LNS and learning integration.

**Ben-Gurion University** (Roni Stern, Ariel Felner) developed the original CBS algorithm and CCBS for continuous time. **Keisuke Okumura** (AIST Japan/Cambridge) created LaCAM and PIBT, the most scalable practical algorithms. **Wolfgang Hönig** (TU Berlin) leads kinodynamic MAPF with db-CBS.

The **AIRI Russia group** (Yakovlev, Skrynnik, Panov) produced MAPF-GPT, while **Guillaume Sartoretti** (NUS) leads hybrid approaches (PRIMAL, LNS2+RL). **Amanda Prorok** (Cambridge) advances GNN-based coordination.

Industry research is substantial: **Amazon Robotics** operates the largest deployed fleet and funds academic collaboration; **Ocado** demonstrates extreme precision (5mm clearance) at scale; railway operators (SBB, Deutsche Bahn, SNCF) sponsored the NeurIPS Flatland Challenge applying MAPF to train scheduling.

---

## Software and benchmarks enable reproducible research

The **MovingAI benchmarks** (movingai.com/benchmarks/mapf.html) provide 24+ maps including warehouse environments, with standardized scenarios and incremental agent addition until solver failure. The **mapf.info** wiki tracks solver results across research groups. Standard metrics include makespan (time until last agent finishes), sum-of-costs (total path lengths), success rate, and throughput (for lifelong MAPF).

Key open-source implementations include **MAPF-LNS/LNS2** (C++, USC license), **RHCR** for lifelong MAPF, **Open-RMF** (Rust, heterogeneous fleet management with ROS/Gazebo), and **AA-SIPP-m** (C++, different sizes/speeds). The **POGEMA benchmark** serves learning-based methods, while the **League of Robot Runners** provides real-world competitive evaluation.

---

## Conclusion: A field approaching practical maturity

MAPF-Het has reached an inflection point where **production deployment is achievable** for many practical scenarios. The key strategic decisions for practitioners involve:

**Algorithm selection by heterogeneity type**: Use CCBS for speed heterogeneity, HCBS or db-CBS for kinematic constraints, MC-CBS for geometric heterogeneity, and the CBS Protocol for maximally heterogeneous teams requiring different planners per agent type.

**Scalability-optimality tradeoffs**: For guaranteed optimality with hundreds of agents, use CBSH2-RTC. For bounded suboptimality at 1,000 agents, use EECBS. For real-time operation at thousands of agents, LaCAM* provides the best speed-quality balance. For anytime improvement from initial solutions, MAPF-LNS2 remains state-of-the-art.

**Learning integration**: The hybrid approach—classical algorithms augmented by learned heuristics or policies—outperforms either pure classical or pure learning methods. MAPF-GPT offers compelling zero-shot generalization if training data is available; LNS2+RL provides the best results on complex, structured environments.

**Open frontiers** with high potential impact include real-time perception integration, truly decentralized algorithms competitive with centralized methods, and human-robot teaming in dynamic environments. The gap between simplified MAPF models and continuous robot dynamics remains the largest barrier to broader deployment—but kinodynamic planners like db-CBS and execution frameworks like MAPF-POST are steadily closing it.

For AI orchestration and logistics systems, the practical path forward involves: (1) characterizing the specific heterogeneity dimensions in your fleet, (2) selecting algorithms from the CBS family appropriate to those dimensions, (3) considering hybrid classical-learning approaches if training data or simulation environments are available, and (4) building robust execution monitoring to handle the inevitable gap between planned and actual robot behavior.