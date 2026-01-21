# Distributed V2G Optimization: Literature Review

> **Topic:** Distributed Optimization and V2G Literature
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document surveys the relevant literature for distributed V2G optimization, covering distributed optimization theory, V2G systems, and smart grid applications.

---

## 2. Distributed Optimization Foundations

### 2.1 ADMM and Decomposition Methods

```
ADMM FOUNDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Boyd2011] Boyd, S., Parikh, N., Chu, E., Peleato, B., & Eckstein, J. (2011).
           "Distributed Optimization and Statistical Learning via the
           Alternating Direction Method of Multipliers."
           Foundations and Trends in Machine Learning.

           * Comprehensive ADMM tutorial
           * Convergence analysis
           * Applications to ML and signal processing

[Bertsekas1989] Bertsekas, D.P., & Tsitsiklis, J.N. (1989).
                "Parallel and Distributed Computation: Numerical Methods."
                Prentice Hall.

                * Classic reference on distributed algorithms
                * Convergence theory
                * Asynchronous methods

[Shi2014] Shi, W., Ling, Q., Wu, G., & Yin, W. (2014).
          "EXTRA: An Exact First-Order Algorithm for Decentralized
          Consensus Optimization."
          SIAM Journal on Optimization.

          * Linear convergence for decentralized optimization
          * Improved over standard gradient methods
```

### 2.2 Consensus Algorithms

```
CONSENSUS LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Olfati-Saber2007] Olfati-Saber, R., Fax, J.A., & Murray, R.M. (2007).
                   "Consensus and Cooperation in Networked Multi-Agent
                   Systems."
                   Proceedings of the IEEE.

                   * Foundational consensus survey
                   * Graph-theoretic analysis
                   * Convergence rates

[Xiao2004] Xiao, L., & Boyd, S. (2004).
           "Fast Linear Iterations for Distributed Averaging."
           Systems & Control Letters.

           * Optimal weight design
           * Fastest mixing Markov chain
           * Spectral analysis

[Kempe2003] Kempe, D., Dobra, A., & Gehrke, J. (2003).
            "Gossip-Based Computation of Aggregate Information."
            FOCS.

            * Push-sum protocol
            * Works on directed graphs
            * Probabilistic analysis
```

### 2.3 Primal-Dual Methods

```
PRIMAL-DUAL METHODS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Arrow1958] Arrow, K.J., Hurwicz, L., & Uzawa, H. (1958).
            "Studies in Linear and Non-Linear Programming."
            Stanford University Press.

            * Original primal-dual framework
            * Saddle point formulation
            * Economic interpretation

[Nedic2009] Nedic, A., & Ozdaglar, A. (2009).
            "Distributed Subgradient Methods for Multi-Agent
            Optimization."
            IEEE Transactions on Automatic Control.

            * Subgradient descent for consensus
            * Convergence rates
            * Step size selection

[Qu2018] Qu, G., & Li, N. (2018).
         "Harnessing Smoothness to Accelerate Distributed Optimization."
         IEEE Transactions on Control of Network Systems.

         * Accelerated methods
         * Linear convergence
         * Gradient tracking
```

---

## 3. V2G Systems and Control

### 3.1 V2G Fundamentals

```
V2G SYSTEM LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kempton2005] Kempton, W., & Tomic, J. (2005).
              "Vehicle-to-Grid Power Fundamentals: Calculating
              Capacity and Net Revenue."
              Journal of Power Sources.

              * Original V2G concept
              * Economic analysis
              * Capacity calculations

[Lopes2011] Lopes, J.A.P., Soares, F.J., & Almeida, P.M.R. (2011).
            "Integration of Electric Vehicles in the Electric
            Power System."
            Proceedings of the IEEE.

            * System integration challenges
            * Charging strategies
            * Grid impact analysis

[Guille2009] Guille, C., & Gross, G. (2009).
             "A Conceptual Framework for the Vehicle-to-Grid (V2G)
             Implementation."
             Energy Policy.

             * Implementation framework
             * Business models
             * Regulatory considerations
```

### 3.2 V2G Optimization

```
V2G OPTIMIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sortomme2011] Sortomme, E., & El-Sharkawi, M.A. (2011).
               "Optimal Charging Strategies for Unidirectional
               Vehicle-to-Grid."
               IEEE Transactions on Smart Grid.

               * Optimal charging formulation
               * Valley filling
               * Cost minimization

[He2012] He, Y., Venkatesh, B., & Guan, L. (2012).
         "Optimal Scheduling for Charging and Discharging of
         Electric Vehicles."
         IEEE Transactions on Smart Grid.

         * Mixed-integer formulation
         * Time-of-use pricing
         * Grid constraints

[Wu2012] Wu, D., Aliprantis, D.C., & Ying, L. (2012).
         "Load Scheduling and Dispatch for Aggregators of
         Plug-In Electric Vehicles."
         IEEE Transactions on Smart Grid.

         * Aggregator optimization
         * Frequency regulation
         * Market participation
```

### 3.3 Distributed V2G Control

```
DISTRIBUTED V2G:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Ma2013] Ma, Z., Callaway, D.S., & Hiskens, I.A. (2013).
         "Decentralized Charging Control of Large Populations of
         Plug-In Electric Vehicles."
         IEEE Transactions on Control Systems Technology.

         * Decentralized charging control
         * Price-based coordination
         * Convergence guarantees

[Gan2013] Gan, L., Topcu, U., & Low, S.H. (2013).
          "Optimal Decentralized Protocol for Electric Vehicle
          Charging."
          IEEE Transactions on Power Systems.

          * Optimal decentralized protocol
          * Valley filling
          * Distributed implementation

[Rivera2017] Rivera, J., Wolfrum, P., Hirche, S., Goebel, C., & Jacobsen, H.A.
             (2017).
             "Alternating Direction Method of Multipliers for
             Decentralized Electric Vehicle Charging Control."
             IEEE CDC.

             * ADMM for EV charging
             * Decentralized implementation
             * Real-time performance
```

---

## 4. Frequency Regulation

### 4.1 Frequency Regulation Markets

```
FREQUENCY REGULATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kirby2004] Kirby, B.J. (2004).
            "Frequency Regulation Basics and Trends."
            Oak Ridge National Laboratory.

            * Regulation market overview
            * Performance metrics
            * Trends and challenges

[Han2010] Han, S., Han, S., & Sezaki, K. (2010).
          "Development of an Optimal Vehicle-to-Grid Aggregator
          for Frequency Regulation."
          IEEE Transactions on Smart Grid.

          * Aggregator design
          * Frequency regulation participation
          * Revenue optimization

[Ota2012] Ota, Y., Taniguchi, H., Nakajima, T., Liyanage, K.M.,
          Baba, J., & Yokoyama, A. (2012).
          "Autonomous Distributed V2G (Vehicle-to-Grid) Satisfying
          Scheduled Charging."
          IEEE Transactions on Smart Grid.

          * Autonomous V2G control
          * Distributed coordination
          * Schedule satisfaction
```

### 4.2 Droop Control

```
DROOP CONTROL LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Schiffer2016] Schiffer, J., Ortega, R., Astolfi, A., Raisch, J.,
               & Sezi, T. (2016).
               "Conditions for Stability of Droop-Controlled
               Inverter-Based Microgrids."
               Automatica.

               * Stability analysis
               * Droop control design
               * Microgrid application

[Simpson-Porco2013] Simpson-Porco, J.W., Dörfler, F., & Bullo, F. (2013).
                    "Synchronization and Power Sharing for Droop-
                    Controlled Inverters in Islanded Microgrids."
                    Automatica.

                    * Synchronization analysis
                    * Power sharing
                    * Stability conditions
```

---

## 5. Game Theory for Energy Systems

### 5.1 Game-Theoretic Approaches

```
GAME THEORY FOR ENERGY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Mohsenian-Rad2010] Mohsenian-Rad, A.H., Wong, V.W.S., Jatskevich, J.,
                    Schober, R., & Leon-Garcia, A. (2010).
                    "Autonomous Demand-Side Management Based on
                    Game-Theoretic Energy Consumption Scheduling."
                    IEEE Transactions on Smart Grid.

                    * Game-theoretic demand response
                    * Nash equilibrium
                    * Efficiency analysis

[Tushar2012] Tushar, W., Saad, W., Poor, H.V., & Smith, D.B. (2012).
             "Economics of Electric Vehicle Charging: A Game
             Theoretic Approach."
             IEEE Transactions on Smart Grid.

             * EV charging game
             * Non-cooperative formulation
             * Price of anarchy

[Atzeni2013] Atzeni, I., Ordóñez, L.G., Scutari, G., Palomar, D.P.,
             & Fonollosa, J.R. (2013).
             "Demand-Side Management via Distributed Energy
             Generation and Storage Optimization."
             IEEE Transactions on Smart Grid.

             * Distributed energy management
             * Game-theoretic approach
             * Convergence analysis
```

### 5.2 Mechanism Design

```
MECHANISM DESIGN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Samadi2012] Samadi, P., Mohsenian-Rad, H., Schober, R., & Wong, V.W.S.
             (2012).
             "Advanced Demand Side Management for the Future Smart
             Grid Using Mechanism Design."
             IEEE Transactions on Smart Grid.

             * VCG mechanism for demand response
             * Incentive compatibility
             * Social welfare optimization

[Li2011] Li, N., Chen, L., & Low, S.H. (2011).
         "Optimal Demand Response Based on Utility Maximization
         in Power Networks."
         IEEE PES General Meeting.

         * Utility maximization
         * Dual decomposition
         * Market-based approach
```

---

## 6. Communication and Robustness

### 6.1 Communication Constraints

```
COMMUNICATION-CONSTRAINED OPTIMIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Rabbat2004] Rabbat, M., & Nowak, R. (2004).
             "Distributed Optimization in Sensor Networks."
             IPSN.

             * Quantized communication
             * Consensus with constraints
             * Sensor network application

[Aysal2008] Aysal, T.C., Yildiz, M.E., Sarwate, A.D., & Scaglione, A.
            (2008).
            "Broadcast Gossip Algorithms for Consensus."
            IEEE Transactions on Signal Processing.

            * Gossip algorithms
            * Broadcast communication
            * Convergence analysis

[Alistarh2017] Alistarh, D., Grubic, D., Li, J., Tomioka, R., & Vojnovic, M.
               (2017).
               "QSGD: Communication-Efficient SGD via Gradient
               Quantization and Encoding."
               NeurIPS.

               * Gradient compression
               * Communication efficiency
               * Convergence preservation
```

### 6.2 Fault Tolerance

```
FAULT-TOLERANT DISTRIBUTED OPTIMIZATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Sundaram2019] Sundaram, S., & Gharesifard, B. (2019).
               "Distributed Optimization Under Adversarial Nodes."
               IEEE Transactions on Automatic Control.

               * Byzantine-resilient optimization
               * Robust aggregation
               * Convergence guarantees

[Chen2018] Chen, Y., Su, L., & Xu, J. (2018).
           "Distributed Statistical Machine Learning in Adversarial
           Settings."
           NIPS.

           * Byzantine fault tolerance
           * Trimmed mean
           * Statistical guarantees

[Su2016] Su, L., & Vaidya, N.H. (2016).
         "Fault-Tolerant Multi-Agent Optimization: Optimal Iterative
         Distributed Algorithms."
         PODC.

         * Optimal Byzantine tolerance
         * Lower bounds
         * Practical algorithms
```

---

## 7. Comparison to Our Approach

### 7.1 Novelty

```
COMPARISON TO PRIOR WORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aspect              | Prior Work          | Our Approach
────────────────────┼─────────────────────┼──────────────────
System              | EV aggregator       | EK3 module fleet
Scale               | 10s-100s EVs        | 10s-1000s modules
Communication       | Centralized/Cloud   | CAN-FD peer-to-peer
Constraints         | Linear              | Nonlinear (thermal)
Dynamics            | Static optimization | Real-time + droop
Response time       | Minutes             | Milliseconds
Failure mode        | Single point        | Graceful degradation

KEY CONTRIBUTIONS:
────────────────────────────────────────────
1. Distributed ADMM for power electronics fleet
2. Integration with droop control for fast response
3. CAN-FD-specific communication protocol
4. Thermal constraint handling
5. Dynamic topology adaptation
```

### 7.2 Research Gaps Addressed

```
GAPS ADDRESSED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. REAL-TIME DISTRIBUTED V2G
   Prior: Optimization on minute timescales
   Ours: Millisecond response with droop integration

2. POWER ELECTRONICS CONSTRAINTS
   Prior: Simple capacity constraints
   Ours: Thermal, efficiency, degradation models

3. INDUSTRIAL COMMUNICATION
   Prior: Assumed reliable communication
   Ours: CAN-FD protocol with fault tolerance

4. MODULAR ARCHITECTURE
   Prior: Fixed fleet size
   Ours: Dynamic join/leave handling

5. PRACTICAL IMPLEMENTATION
   Prior: Simulation only
   Ours: Embedded implementation on STM32
```

---

## 8. Publication Venues

### 8.1 Target Venues

| Venue | Type | Focus | Relevance |
|-------|------|-------|-----------|
| IEEE TSG | Journal | Smart Grid | High |
| IEEE TCST | Journal | Control Systems | High |
| IEEE TPWRS | Journal | Power Systems | High |
| CDC | Conference | Control | High |
| ACC | Conference | Control | Medium |
| PSCC | Conference | Power Systems | Medium |

### 8.2 Submission Strategy

```
RECOMMENDED SUBMISSION PATH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option A: Smart Grid Focus
1. IEEE Transactions on Smart Grid
2. Extended version: Applied Energy

Option B: Control Theory Focus
1. IEEE CDC (conference)
2. Extended: IEEE TCST or Automatica

Option C: Power Systems Focus
1. IEEE Transactions on Power Systems
2. Conference: PSCC or PESGM
```

---

## 9. Key References Summary

### Essential Papers (Top 10)

1. **[Boyd2011]** ADMM tutorial - foundational
2. **[Olfati-Saber2007]** Consensus algorithms
3. **[Gan2013]** Optimal decentralized EV charging
4. **[Ma2013]** Decentralized charging control
5. **[Mohsenian-Rad2010]** Game-theoretic energy management
6. **[Shi2014]** EXTRA - linear convergence
7. **[Lopes2011]** V2G integration overview
8. **[Nedic2009]** Distributed subgradient methods
9. **[Sundaram2019]** Byzantine-resilient optimization
10. **[Kempton2005]** V2G fundamentals

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-convergence-analysis.md` - Convergence proofs
- `03-algorithms.md` - Algorithm implementations
- `04-simulation.md` - Simulation scenarios
