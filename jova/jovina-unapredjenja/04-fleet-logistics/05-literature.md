# Stochastic Fleet Logistics: Literature Review

> **Topic:** VRP, Stochastic Optimization, and Fleet Management Literature
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document surveys the relevant literature for stochastic fleet logistics, covering vehicle routing problems, stochastic optimization, and maintenance logistics.

---

## 2. Vehicle Routing Foundations

### 2.1 VRP Surveys

```
VRP SURVEY LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Toth2014] Toth, P., & Vigo, D. (Eds.). (2014).
           "Vehicle Routing: Problems, Methods, and Applications."
           SIAM.

           * Comprehensive VRP textbook
           * Exact and heuristic methods
           * Variants and applications

[Laporte2009] Laporte, G. (2009).
              "Fifty Years of Vehicle Routing."
              Transportation Science.

              * Historical perspective
              * Key developments
              * Future directions

[Braekers2016] Braekers, K., Ramaekers, K., & Van Nieuwenhuyse, I. (2016).
               "The Vehicle Routing Problem: State of the Art
               Classification and Review."
               Computers & Industrial Engineering.

               * VRP taxonomy
               * 300+ papers reviewed
               * Research gaps identified
```

### 2.2 VRPTW (Time Windows)

```
VRPTW LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Solomon1987] Solomon, M.M. (1987).
              "Algorithms for the Vehicle Routing and Scheduling
              Problems with Time Window Constraints."
              Operations Research.

              * Classic VRPTW paper
              * Solomon benchmark instances
              * Insertion heuristics

[Desaulniers2005] Desaulniers, G., Desrosiers, J., & Solomon, M.M. (Eds.).
                  (2005).
                  "Column Generation."
                  Springer.

                  * Branch-and-price for VRPTW
                  * Resource-constrained shortest paths
                  * State-of-the-art exact methods

[Cordeau2002] Cordeau, J.F., Laporte, G., & Mercier, A. (2002).
              "A Unified Tabu Search Heuristic for Vehicle Routing
              Problems with Time Windows."
              Journal of the Operational Research Society.

              * Unified heuristic framework
              * Competitive with specialized methods
```

### 2.3 Pickup and Delivery

```
PICKUP AND DELIVERY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Savelsbergh1995] Savelsbergh, M.W.P., & Sol, M. (1995).
                  "The General Pickup and Delivery Problem."
                  Transportation Science.

                  * GPDP formulation
                  * Precedence constraints
                  * Complexity analysis

[Parragh2008] Parragh, S.N., Doerner, K.F., & Hartl, R.F. (2008).
              "A Survey on Pickup and Delivery Problems."
              Journal für Betriebswirtschaft.

              * Comprehensive PDP survey
              * Classification scheme
              * Solution methods

[Ropke2006] Ropke, S., & Pisinger, D. (2006).
            "An Adaptive Large Neighborhood Search Heuristic for
            the Pickup and Delivery Problem with Time Windows."
            Transportation Science.

            * ALNS introduction
            * Destroy-repair framework
            * State-of-the-art heuristic
```

---

## 3. Stochastic VRP

### 3.1 Stochastic VRP Foundations

```
STOCHASTIC VRP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Gendreau1996] Gendreau, M., Laporte, G., & Séguin, R. (1996).
               "Stochastic Vehicle Routing."
               European Journal of Operational Research.

               * SVRP formulation
               * Chance constraints
               * Recourse models

[Bertsimas1992] Bertsimas, D.J. (1992).
                "A Vehicle Routing Problem with Stochastic Demand."
                Operations Research.

                * Stochastic demand VRP
                * A priori optimization
                * Re-optimization strategies

[Laporte2002] Laporte, G., Louveaux, F., & van Hamme, L. (2002).
              "An Integer L-Shaped Algorithm for the Capacitated
              Vehicle Routing Problem with Stochastic Demands."
              Operations Research.

              * Exact method for SVRP
              * L-shaped decomposition
              * Optimality cuts
```

### 3.2 Dynamic and Real-Time VRP

```
DYNAMIC VRP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Psaraftis1988] Psaraftis, H.N. (1988).
                "Dynamic Vehicle Routing Problems."
                Vehicle Routing: Methods and Studies.

                * Dynamic VRP introduction
                * Real-time decision making
                * Information evolution

[Pillac2013] Pillac, V., Gendreau, M., Guéret, C., & Medaglia, A.L. (2013).
             "A Review of Dynamic Vehicle Routing Problems."
             European Journal of Operational Research.

             * Comprehensive DVRP review
             * Taxonomy of approaches
             * Real-world applications

[Ichoua2006] Ichoua, S., Gendreau, M., & Potvin, J.Y. (2006).
             "Exploiting Knowledge About Future Demands for
             Real-Time Vehicle Dispatching."
             Transportation Science.

             * Anticipatory algorithms
             * Sampling-based methods
             * Rolling horizon
```

### 3.3 Robust VRP

```
ROBUST VEHICLE ROUTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sungur2008] Sungur, I., Ordóñez, F., & Dessouky, M. (2008).
             "A Robust Optimization Approach for the Capacitated
             Vehicle Routing Problem with Demand Uncertainty."
             IIE Transactions.

             * Robust CVRP
             * Budget uncertainty
             * Tractable reformulation

[Gounaris2013] Gounaris, C.E., Wiesemann, W., & Floudas, C.A. (2013).
               "The Robust Capacitated Vehicle Routing Problem Under
               Demand Uncertainty."
               Operations Research.

               * Adjustable robust optimization
               * Affine decision rules
               * Computational study

[Lee2012] Lee, C., Lee, K., & Park, S. (2012).
          "Robust Vehicle Routing Problem with Deadlines and
          Travel Time/Demand Uncertainty."
          Journal of the Operational Research Society.

          * Multiple uncertainty sources
          * Min-max regret
          * Branch-and-cut
```

---

## 4. Spare Parts Logistics

### 4.1 Spare Parts Inventory

```
SPARE PARTS MANAGEMENT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kennedy2002] Kennedy, W.J., Wayne Patterson, J., & Fredendall, L.D. (2002).
              "An Overview of Recent Literature on Spare Parts
              Inventories."
              International Journal of Production Economics.

              * Comprehensive review
              * Demand forecasting
              * Multi-echelon systems

[Sherbrooke2004] Sherbrooke, C.C. (2004).
                 "Optimal Inventory Modeling of Systems: Multi-Echelon
                 Techniques."
                 Springer.

                 * METRIC and extensions
                 * Multi-echelon optimization
                 * Service level constraints

[Hu2018] Hu, Q., Boylan, J.E., Chen, H., & Labib, A. (2018).
         "OR in Spare Parts Management: A Review."
         European Journal of Operational Research.

         * Modern review
         * Big data approaches
         * Integration with maintenance
```

### 4.2 Joint Routing and Inventory

```
INTEGRATED ROUTING-INVENTORY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Bertazzi2008] Bertazzi, L., & Speranza, M.G. (2008).
               "Inventory Routing Problems with Multiple Customers."
               EURO Journal on Transportation and Logistics.

               * IRP formulation
               * Vendor-managed inventory
               * Solution approaches

[Coelho2014] Coelho, L.C., Cordeau, J.F., & Laporte, G. (2014).
             "Thirty Years of Inventory Routing."
             Transportation Science.

             * Comprehensive survey
             * Classification
             * Future research

[Adulyasak2015] Adulyasak, Y., Cordeau, J.F., & Jans, R. (2015).
                "The Production Routing Problem: A Review of
                Formulations and Solution Algorithms."
                Computers & Operations Research.

                * Production + routing + inventory
                * MILP formulations
                * Decomposition methods
```

---

## 5. Predictive Maintenance Integration

### 5.1 Condition-Based Maintenance

```
CBM LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Jardine2006] Jardine, A.K.S., Lin, D., & Banjevic, D. (2006).
              "A Review on Machinery Diagnostics and Prognostics
              Implementing Condition-Based Maintenance."
              Mechanical Systems and Signal Processing.

              * CBM overview
              * Diagnostics vs prognostics
              * Decision support

[Si2011] Si, X.S., Wang, W., Hu, C.H., & Zhou, D.H. (2011).
         "Remaining Useful Life Estimation – A Review on the
         Statistical Data Driven Approaches."
         European Journal of Operational Research.

         * RUL estimation methods
         * Statistical approaches
         * Applications

[Elwany2011] Elwany, A.H., & Gebraeel, N.Z. (2011).
             "Sensor-Driven Prognostic Models for Equipment
             Replacement and Spare Parts Inventory."
             IIE Transactions.

             * Integration of prognostics
             * Inventory optimization
             * Decision models
```

### 5.2 Maintenance Routing

```
MAINTENANCE ROUTING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Camci2015] Camci, F. (2015).
            "Maintenance Scheduling of Geographically Distributed
            Assets with Prognostics Information."
            European Journal of Operational Research.

            * Prognostics-driven scheduling
            * Geographical considerations
            * Optimization framework

[Zhang2017] Zhang, C., Gao, W., Guo, S., Li, Y., & Yang, T. (2017).
            "Opportunistic Maintenance for Wind Turbines Considering
            Imperfect, Reliability-Based Maintenance."
            Renewable Energy.

            * Opportunistic maintenance
            * Routing considerations
            * Wind farm application
```

---

## 6. Metaheuristics

### 6.1 ALNS and LNS

```
ALNS LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Shaw1998] Shaw, P. (1998).
           "Using Constraint Programming and Local Search Methods
           to Solve Vehicle Routing Problems."
           CP.

           * LNS introduction
           * Destroy-repair paradigm
           * CP integration

[Pisinger2007] Pisinger, D., & Ropke, S. (2007).
               "A General Heuristic for Vehicle Routing Problems."
               Computers & Operations Research.

               * ALNS framework
               * Adaptive operator selection
               * Extensive benchmarks

[Ropke2006b] Ropke, S., & Pisinger, D. (2006).
             "A Unified Heuristic for a Large Class of Vehicle
             Routing Problems with Backhauls."
             European Journal of Operational Research.

             * Unified destroy operators
             * Repair heuristics
             * Multiple VRP variants
```

### 6.2 Genetic Algorithms

```
GA FOR VRP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Prins2004] Prins, C. (2004).
            "A Simple and Effective Evolutionary Algorithm for the
            Vehicle Routing Problem."
            Computers & Operations Research.

            * Hybrid GA
            * Split algorithm
            * Giant tour representation

[Vidal2012] Vidal, T., Crainic, T.G., Gendreau, M., Lahrichi, N.,
            & Rei, W. (2012).
            "A Hybrid Genetic Algorithm for Multidepot and Periodic
            Vehicle Routing Problems."
            Operations Research.

            * State-of-the-art hybrid GA
            * Education mechanism
            * Diversity management
```

---

## 7. Comparison to Our Approach

### 7.1 Novelty

```
COMPARISON TO PRIOR WORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aspect              | Prior Work          | Our Approach
────────────────────┼─────────────────────┼──────────────────
Demand source       | Customer orders     | RUL predictions
Demand uncertainty  | Stochastic arrival  | RUL + Poisson
Service urgency     | Uniform             | Priority-based
Inventory           | Static or VMI       | Distributed spares
Time windows        | Customer-driven     | Bus schedule-driven
Objective           | Cost or distance    | Service level + cost

KEY CONTRIBUTIONS:
────────────────────────────────────────────
1. Integration of predictive maintenance with routing
2. Multi-class demands (planned vs. emergency)
3. Distributed spare parts network
4. Bus schedule-driven time windows
5. Rolling horizon for real-time operations
```

### 7.2 Research Gaps

```
GAPS ADDRESSED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROGNOSTICS INTEGRATION
   Prior: Maintenance scheduling separate from logistics
   Ours: Unified RUL-driven demand generation

2. HYBRID UNCERTAINTY
   Prior: Single uncertainty source
   Ours: RUL error + random failures + travel time

3. DISTRIBUTED INVENTORY
   Prior: Centralized or simple two-echelon
   Ours: Multi-station distributed spares

4. REAL-TIME ADAPTATION
   Prior: Static planning
   Ours: Rolling horizon with event-driven re-planning

5. SERVICE LEVEL CONSTRAINTS
   Prior: Soft constraints
   Ours: Hard deadlines from bus schedules
```

---

## 8. Publication Venues

| Venue | Type | Focus | Relevance |
|-------|------|-------|-----------|
| Transportation Science | Journal | OR/Transportation | High |
| EJOR | Journal | Operations Research | High |
| C&OR | Journal | Computers & OR | High |
| IJPE | Journal | Production Eng. | Medium |
| TRPB | Journal | Transportation | Medium |

---

## 9. Key References Summary

### Essential Papers (Top 10)

1. **[Ropke2006]** ALNS for PDPTW
2. **[Pillac2013]** Dynamic VRP review
3. **[Gendreau1996]** Stochastic VRP
4. **[Toth2014]** VRP textbook
5. **[Gounaris2013]** Robust VRP
6. **[Coelho2014]** Inventory-routing survey
7. **[Elwany2011]** Prognostics + inventory
8. **[Vidal2012]** Hybrid GA for VRP
9. **[Bertsimas1992]** Stochastic demand VRP
10. **[Solomon1987]** VRPTW benchmarks

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-stochastic-analysis.md` - Uncertainty modeling
- `03-algorithms.md` - Solution algorithms
- `04-simulation.md` - Simulation scenarios
