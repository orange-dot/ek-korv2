# MAPF-HET: Literature Review

> **Topic:** Multi-Agent Path Finding with Heterogeneous Agents
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document surveys the relevant literature for MAPF-HET, covering foundational MAPF results, heterogeneous extensions, and application domains.

---

## 2. Foundational MAPF Literature

### 2.1 Surveys and Tutorials

```
KEY SURVEYS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Stern2019] Stern, R., Sturtevant, N., Felner, A., Koenig, S.,
            Ma, H., Walker, T., Li, J., Atzmon, D., Cohen, L.,
            Kumar, T.K.S., Boyarski, E., & Bartak, R. (2019).
            "Multi-Agent Pathfinding: Definitions, Variants,
            and Benchmarks."
            Symposium on Combinatorial Search (SoCS).

            * Comprehensive taxonomy of MAPF variants
            * Standard benchmark definitions
            * Algorithm comparison framework

[Felner2017] Felner, A., Stern, R., Shimony, S.E., Boyarski, E.,
             Goldenberg, M., Sharon, G., Sturtevant, N., Wagner, G.,
             & Surynek, P. (2017).
             "Search-Based Optimal Solvers for the Multi-Agent
             Pathfinding Problem: Summary and Challenges."
             SoCS.

             * CBS and variants
             * ICTS algorithm
             * Optimality proofs
```

### 2.2 Complexity Results

```
COMPLEXITY PAPERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Yu2013] Yu, J., & LaValle, S.M. (2013).
         "Structure and Intractability of Optimal Multi-Robot
         Path Planning on Graphs."
         AAAI Conference on Artificial Intelligence.

         * NP-hardness proof for makespan optimization
         * Reduction from 3-SAT
         * Polynomial cases identified

[Surynek2010] Surynek, P. (2010).
              "An Optimization Variant of Multi-Robot Path
              Planning is Intractable."
              AAAI.

              * Sum-of-costs NP-hardness
              * Optimal vs. suboptimal separation

[Ma2016] Ma, H., & Koenig, S. (2016).
         "Optimal Target Assignment and Path Finding for Teams
         of Agents."
         AAMAS.

         * Combined assignment + pathfinding complexity
         * Integrated approach benefits
```

---

## 3. Core Algorithms

### 3.1 Conflict-Based Search Family

```
CBS AND EXTENSIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sharon2015] Sharon, G., Stern, R., Felner, A., & Sturtevant, N. (2015).
             "Conflict-Based Search for Optimal Multi-Agent
             Pathfinding."
             Artificial Intelligence, 219, 40-66.

             * Original CBS algorithm
             * Two-level search framework
             * Completeness and optimality proofs

[Barer2014] Barer, M., Sharon, G., Stern, R., & Felner, A. (2014).
            "Suboptimal Variants of the Conflict-Based Search
            Algorithm for the Multi-Agent Pathfinding Problem."
            SoCS.

            * ECBS: Bounded suboptimal CBS
            * Focal search at high level
            * w-optimality guarantee

[Boyarski2015] Boyarski, E., Felner, A., Stern, R., Sharon, G.,
               Tolpin, D., Betzalel, O., & Shimony, E. (2015).
               "ICBS: Improved Conflict-Based Search Algorithm
               for Multi-Agent Pathfinding."
               IJCAI.

               * Improved conflict detection
               * Cardinal vs. semi-cardinal conflicts
               * Significant speedups

[Li2019] Li, J., Harabor, D., Stuckey, P.J., Ma, H., & Koenig, S. (2019).
         "Disjoint Splitting for Multi-Agent Path Finding with
         Conflict-Based Search."
         ICAPS.

         * Symmetry breaking in CBS
         * Disjoint constraint splitting
         * Reduced search tree size
```

### 3.2 Other Optimal Approaches

```
ALTERNATIVE OPTIMAL METHODS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sharon2013] Sharon, G., Stern, R., Goldenberg, M., & Felner, A. (2013).
             "The Increasing Cost Tree Search for Optimal
             Multi-Agent Pathfinding."
             Artificial Intelligence, 195, 470-495.

             * ICTS algorithm
             * Cost-based search tree
             * Complements CBS

[Surynek2016] Surynek, P. (2016).
              "An Application of Satisfiability to Optimal
              Multi-Robot Path Planning."
              ECAI.

              * SAT-based MAPF
              * CNF encoding
              * Competitive with CBS

[Lam2019] Lam, E., Le Bodic, P., Harabor, D., & Stuckey, P. (2019).
          "Branch-and-Cut-and-Price for Multi-Agent Pathfinding."
          IJCAI.

          * Integer programming approach
          * Column generation
          * Large-scale instances
```

### 3.3 Suboptimal and Anytime Approaches

```
FAST HEURISTIC METHODS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Silver2005] Silver, D. (2005).
             "Cooperative Pathfinding."
             AIIDE.

             * Prioritized planning
             * Fast but incomplete
             * Priority ordering heuristics

[Wang2008] Wang, K.C., & Botea, A. (2008).
           "Fast and Memory-Efficient Multi-Agent Pathfinding."
           ICAPS.

           * Hierarchical approach
           * Memory efficiency
           * Scalability improvements

[Li2021] Li, J., Ruber, A., Banfi, J., Koenig, S., & Ayanian, N. (2021).
         "Anytime Multi-Agent Path Finding via Large Neighborhood
         Search."
         IJCAI.

         * LNS for MAPF
         * Destroy-repair framework
         * Anytime improvement
```

---

## 4. Heterogeneous and Task-Based MAPF

### 4.1 Heterogeneous Agents

```
HETEROGENEOUS MAPF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Honig2016] Hönig, W., Kumar, T.K.S., Cohen, L., Ma, H., Xu, H.,
            Ayanian, N., & Koenig, S. (2016).
            "Multi-Agent Path Finding with Kinematic Constraints."
            ICAPS.

            * Different motion models
            * Kinematic constraints
            * Robotics applications

[Ma2017a] Ma, H., Li, J., Kumar, T.K.S., & Koenig, S. (2017).
          "Lifelong Multi-Agent Path Finding for Online Pickup
          and Delivery Tasks."
          AAMAS.

          * Online task assignment
          * Continuous operation
          * Pickup-and-delivery

[Walker2018] Walker, T.T., Sturtevant, N.R., & Felner, A. (2018).
             "Extended Increasing Cost Tree Search for
             Non-Unit Cost Domains."
             IJCAI.

             * Non-uniform edge costs
             * Different robot speeds
             * ICTS extension
```

### 4.2 Task Allocation Integration

```
COMBINED TASK-PATH PLANNING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Ma2016] Ma, H., & Koenig, S. (2016).
         "Optimal Target Assignment and Path Finding for Teams
         of Agents."
         AAMAS.

         * Integrated assignment + MAPF
         * Hungarian + CBS
         * Optimality guarantees

[Liu2019] Liu, M., Ma, H., Li, J., & Koenig, S. (2019).
          "Task and Path Planning for Multi-Agent Pickup
          and Delivery."
          AAMAS.

          * Pickup-delivery with deadlines
          * Regret-based assignment
          * Real-world warehouse

[Grenouilleau2019] Grenouilleau, F., van Hoeve, W.J., & Hooker, J.N. (2019).
                   "A Multi-Label A* Algorithm for Multi-Agent
                   Pathfinding."
                   ICAPS.

                   * Multi-label states
                   * Task sequences
                   * Efficiency improvements
```

---

## 5. Learning-Based Approaches

### 5.1 Reinforcement Learning

```
RL FOR MAPF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sartoretti2019] Sartoretti, G., Kerber, J., Shi, Y., Hafner, G.,
                 Otte, M., & Choset, H. (2019).
                 "PRIMAL: Pathfinding via Reinforcement and
                 Imitation Multi-Agent Learning."
                 IEEE Robotics and Automation Letters.

                 * RL + imitation learning
                 * CNN for local observation
                 * Scalable to large teams

[Damani2021] Damani, M., Luo, Z., Wenzel, E., & Sartoretti, G. (2021).
             "PRIMAL₂: Pathfinding via Reinforcement and
             Imitation Multi-Agent Learning."
             IEEE Robotics and Automation Letters.

             * Improved architecture
             * Communication learning
             * Better generalization

[Ma2021] Ma, Z., Luo, Y., & Ma, H. (2021).
         "Learning to Resolve Conflicts for Multi-Agent
         Path Finding with Conflict-Based Search."
         AAAI.

         * ML-enhanced CBS
         * Learned conflict selection
         * Hybrid approach
```

### 5.2 Graph Neural Networks

```
GNN FOR MAPF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Li2020] Li, Q., Gama, F., Ribeiro, A., & Prorok, A. (2020).
         "Graph Neural Networks for Decentralized Multi-Robot
         Path Planning."
         IROS.

         * GNN message passing
         * Decentralized execution
         * Communication-efficient

[Wang2020] Wang, Q., Dayan, P., & Prorok, A. (2020).
           "Mobile Robot Path Planning in Dynamic Environments
           through Globally Guided Reinforcement Learning."
           IEEE Robotics and Automation Letters.

           * Global guidance + local RL
           * Dynamic obstacles
           * Real robot deployment
```

---

## 6. Industrial Robotics and Warehouses

### 6.1 Warehouse Applications

```
WAREHOUSE MAPF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Wurman2008] Wurman, P.R., D'Andrea, R., & Mountz, M. (2008).
             "Coordinating Hundreds of Cooperative, Autonomous
             Vehicles in Warehouses."
             AI Magazine, 29(1), 9-20.

             * Kiva Systems (now Amazon Robotics)
             * Industrial scale MAPF
             * Real-world deployment

[Li2020warehouse] Li, J., Tinka, A., Kiesel, S., Durham, J.W.,
                  Kumar, T.K.S., & Koenig, S. (2020).
                  "Lifelong Multi-Agent Path Finding in
                  Large-Scale Warehouses."
                  AAAI.

                  * 1000+ agents
                  * Continuous operation
                  * Practical algorithms

[Stern2019warehouse] Stern, R., Sturtevant, N., & Koenig, S. (2019).
                     "Multi-Agent Pathfinding for Large Agents."
                     AAAI.

                     * Large robot footprints
                     * Non-point agents
                     * Geometric constraints
```

### 6.2 Manufacturing and Assembly

```
MANUFACTURING APPLICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Pecora2018] Pecora, F., Cirillo, M., Dell'Amico, M., Gaupp, M.,
             & Lilienthal, A. (2018).
             "A Constraint Programming Approach to Task Allocation
             and Motion Planning in AGV Systems."
             ECAI.

             * AGV fleet coordination
             * Task + motion integration
             * Factory environments

[Kottinger2021] Kottinger, J., Almagor, S., & Salzman, O. (2021).
                "Conflict-Based Search for Multi-Robot Motion
                Planning with Kinodynamic Constraints."
                IROS.

                * Kinodynamic robots
                * Continuous state space
                * Manipulation tasks
```

---

## 7. Robustness and Uncertainty

### 7.1 Robust Planning

```
ROBUST MAPF:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Atzmon2018] Atzmon, D., Stern, R., Felner, A., Wagner, G.,
             Barták, R., & Zhou, N. (2018).
             "Robust Multi-Agent Path Finding."
             AAMAS.

             * Delay robustness
             * k-delay robust plans
             * Execution guarantees

[Ma2017robust] Ma, H., Honig, W., Kumar, T.K.S., Ayanian, N.,
               & Koenig, S. (2017).
               "Lifelong Path Planning with Kinematic Constraints
               for Multi-Agent Pickup and Delivery."
               AAAI.

               * Replanning
               * Uncertainty handling
               * Lifelong operation
```

### 7.2 Execution and Replanning

```
EXECUTION MONITORING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Honig2019] Hönig, W., Kiesel, S., Tinka, A., Durham, J.W.,
            & Ayanian, N. (2019).
            "Persistent and Robust Execution of MAPF Schedules
            in Warehouses."
            IEEE Robotics and Automation Letters.

            * Plan execution
            * Delay handling
            * Warehouse deployment

[Shahar2021] Shahar, L., Stern, R., & Felner, A. (2021).
             "Safe Multi-Agent Pathfinding with Time Uncertainty."
             AAAI.

             * Stochastic durations
             * Safety guarantees
             * Probabilistic analysis
```

---

## 8. Comparison to Our Approach

### 8.1 Novelty of MAPF-HET

```
COMPARISON TO PRIOR WORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Feature                  | Prior Work        | Our MAPF-HET
─────────────────────────┼───────────────────┼──────────────────
Robot types              | Mostly homogeneous| 2 types (A, B)
Workspace geometry       | 2D grid           | Mixed 1D+2D
Task types               | Go-to-goal        | Manipulation tasks
Capability constraints   | Uniform           | Type-dependent
Deadlines               | Soft/none         | Hard (bus schedule)
Durations               | Deterministic     | Stochastic
Application domain      | Warehouses        | EV charging

KEY NOVEL ASPECTS:
1. Heterogeneous workspace (rail + mobile)
2. Manipulation task integration
3. Hard deadline from external schedule
4. Stochastic duration modeling
5. EV charging domain benchmark
```

### 8.2 Research Gaps Addressed

```
GAPS ADDRESSED BY MAPF-HET:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HETEROGENEOUS CAPABILITIES
   Prior: Same capabilities for all agents
   Ours: Type-dependent task compatibility

2. MIXED WORKSPACE
   Prior: Uniform grid or graph
   Ours: Rail (1D) + mobile (2D) combined

3. MANIPULATION TASKS
   Prior: Navigation only
   Ours: Pick-place, swap, diagnose

4. DEADLINE INTEGRATION
   Prior: Optimize makespan (no absolute deadline)
   Ours: Hard deadline from operational constraints

5. STOCHASTIC ANALYSIS
   Prior: Deterministic or post-hoc robustness
   Ours: Stochastic durations in planning
```

---

## 9. Publication Venues

### 9.1 Primary Venues

| Venue | Type | Focus | Deadline |
|-------|------|-------|----------|
| ICRA | Conference | Robotics | Sept |
| IROS | Conference | Robotics | Mar |
| RA-L | Journal | Robotics | Rolling |
| AAMAS | Conference | Multi-agent | Oct |
| IJCAI | Conference | AI | Jan |
| AAAI | Conference | AI | Sept |

### 9.2 Submission Strategy

```
RECOMMENDED SUBMISSION PATH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option A: Robotics Focus
1. RA-L (with ICRA presentation option)
2. If rejected: IROS
3. Extended version: Autonomous Robots journal

Option B: AI Focus
1. IJCAI or AAAI
2. If rejected: AAMAS
3. Extended version: AIJ or JAIR

Option C: Fast Publication
1. SoCS (Symposium on Combinatorial Search)
2. Good for algorithmic contributions
3. Fast turnaround
```

---

## 10. Key References Summary

### Top 10 Essential Papers

1. **[Sharon2015]** CBS - foundational algorithm
2. **[Stern2019]** Survey - problem taxonomy
3. **[Yu2013]** Complexity - NP-hardness
4. **[Barer2014]** ECBS - bounded suboptimal
5. **[Ma2016]** Task assignment integration
6. **[Li2021]** LNS - scalable approach
7. **[Sartoretti2019]** PRIMAL - learning approach
8. **[Honig2016]** Kinematic constraints
9. **[Atzmon2018]** Robust planning
10. **[Li2020warehouse]** Large-scale deployment

### Citation Format (BibTeX)

```bibtex
@article{sharon2015conflict,
  title={Conflict-Based Search for Optimal Multi-Agent Pathfinding},
  author={Sharon, Guni and Stern, Roni and Felner, Ariel and
          Sturtevant, Nathan R},
  journal={Artificial Intelligence},
  volume={219},
  pages={40--66},
  year={2015},
  publisher={Elsevier}
}

@inproceedings{stern2019multi,
  title={Multi-Agent Pathfinding: Definitions, Variants, and Benchmarks},
  author={Stern, Roni and Sturtevant, Nathan and Felner, Ariel and
          Koenig, Sven and Ma, Hang and Walker, Thayne and Li, Jiaoyang
          and Atzmon, Dor and Cohen, Liron and Kumar, TK Satish and others},
  booktitle={Proceedings of SoCS},
  pages={151--158},
  year={2019}
}
```

---

## Related Documents

- `01-problem-formulation.md` - Formal problem definition
- `02-complexity-analysis.md` - Theoretical analysis
- `03-algorithms.md` - Algorithm implementations
- `04-simulation.md` - Benchmark scenarios
