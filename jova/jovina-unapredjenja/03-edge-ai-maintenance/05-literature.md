# Edge AI Predictive Maintenance: Literature Review

> **Topic:** TinyML and Predictive Maintenance Literature
> **Version:** 1.0
> **Date:** January 2026
> **Status:** Paper-ready

---

## 1. Introduction

This document surveys the relevant literature for edge AI predictive maintenance, covering TinyML foundations, predictive maintenance methods, federated learning, and power electronics health monitoring.

---

## 2. TinyML Foundations

### 2.1 Surveys and Frameworks

```
KEY TINYML REFERENCES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Banbury2021] Banbury, C., et al. (2021).
              "Benchmarking TinyML Systems: Challenges and Direction."
              MLSys Workshop.

              * MLPerf Tiny benchmark suite
              * Standardized evaluation methodology
              * Reference implementations

[Warden2019] Warden, P., & Situnayake, D. (2019).
             "TinyML: Machine Learning with TensorFlow Lite on
             Arduino and Ultra-Low-Power Microcontrollers."
             O'Reilly Media.

             * Practical TinyML tutorial
             * TensorFlow Lite Micro introduction
             * Hardware considerations

[David2021] David, R., et al. (2021).
            "TensorFlow Lite Micro: Embedded Machine Learning
            on TinyML Systems."
            MLSys.

            * TFLM architecture
            * Memory management
            * Operator implementations

[Lin2020] Lin, J., et al. (2020).
          "MCUNet: Tiny Deep Learning on IoT Devices."
          NeurIPS.

          * Neural architecture search for MCUs
          * TinyNAS + TinyEngine
          * State-of-the-art accuracy/efficiency
```

### 2.2 Model Compression

```
MODEL COMPRESSION TECHNIQUES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Jacob2018] Jacob, B., et al. (2018).
            "Quantization and Training of Neural Networks for
            Efficient Integer-Arithmetic-Only Inference."
            CVPR.

            * INT8 quantization theory
            * Quantization-aware training
            * TensorFlow implementation

[Han2016] Han, S., Mao, H., & Dally, W.J. (2016).
          "Deep Compression: Compressing Deep Neural Networks
          with Pruning, Trained Quantization and Huffman Coding."
          ICLR.

          * Pruning + quantization + encoding
          * 35-49× compression ratios
          * Foundational compression work

[Hinton2015] Hinton, G., Vinyals, O., & Dean, J. (2015).
             "Distilling the Knowledge in a Neural Network."
             NIPS Workshop.

             * Knowledge distillation framework
             * Temperature scaling
             * Dark knowledge transfer

[Choudhary2020] Choudhary, T., et al. (2020).
                "A Comprehensive Survey on Model Compression
                and Acceleration."
                Artificial Intelligence Review.

                * Comprehensive survey
                * Comparison of techniques
                * Hardware considerations
```

### 2.3 Neural Architecture Search for Edge

```
NAS FOR EDGE DEVICES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Tan2019] Tan, M., & Le, Q.V. (2019).
          "EfficientNet: Rethinking Model Scaling for
          Convolutional Neural Networks."
          ICML.

          * Compound scaling
          * EfficientNet architecture
          * Efficient building blocks

[Howard2019] Howard, A., et al. (2019).
             "Searching for MobileNetV3."
             ICCV.

             * Hardware-aware NAS
             * MobileNetV3 architecture
             * Platform-specific tuning

[Liberis2021] Liberis, E., Dudziak, L., & Lane, N.D. (2021).
              "μNAS: Constrained Neural Architecture Search for
              Microcontrollers."
              EuroMLSys.

              * MCU-specific NAS
              * Memory constraints
              * Latency optimization
```

---

## 3. Predictive Maintenance

### 3.1 Surveys and Foundations

```
PREDICTIVE MAINTENANCE SURVEYS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Carvalho2019] Carvalho, T.P., et al. (2019).
               "A Systematic Literature Review of Machine Learning
               Methods Applied to Predictive Maintenance."
               Computers & Industrial Engineering.

               * 150+ papers reviewed
               * ML method comparison
               * Application domains

[Zonta2020] Zonta, T., et al. (2020).
            "Predictive Maintenance in the Industry 4.0:
            A Systematic Literature Review."
            Computers & Industrial Engineering.

            * Industry 4.0 context
            * Data-driven approaches
            * Implementation challenges

[Lei2018] Lei, Y., et al. (2018).
          "Machinery Health Prognostics: A Systematic Review
          from Data Acquisition to RUL Prediction."
          Mechanical Systems and Signal Processing.

          * Complete pipeline overview
          * Feature engineering review
          * Deep learning methods
```

### 3.2 RUL Prediction Methods

```
RUL PREDICTION LITERATURE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Li2018] Li, X., Ding, Q., & Sun, J.Q. (2018).
         "Remaining Useful Life Estimation in Prognostics Using
         Deep Convolution Neural Networks."
         Reliability Engineering & System Safety.

         * CNN for RUL
         * C-MAPSS dataset results
         * Temporal feature learning

[Zheng2017] Zheng, S., et al. (2017).
            "Long Short-Term Memory Network for Remaining Useful
            Life Estimation."
            IEEE International Conference on Prognostics and Health
            Management.

            * LSTM for RUL
            * Sequence modeling
            * State-of-the-art results

[Zhang2018] Zhang, C., et al. (2018).
            "Multiobjective Deep Belief Networks Ensemble for
            Remaining Useful Life Estimation in Prognostics."
            IEEE Transactions on Neural Networks.

            * Ensemble methods
            * Uncertainty estimation
            * Multi-objective optimization

[Heimes2008] Heimes, F.O. (2008).
             "Recurrent Neural Networks for Remaining Useful Life
             Estimation."
             IEEE International Conference on Prognostics and Health
             Management.

             * Early RNN application
             * Foundation for deep learning approaches
```

### 3.3 Anomaly Detection

```
ANOMALY DETECTION FOR MAINTENANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Chalapathy2019] Chalapathy, R., & Chawla, S. (2019).
                 "Deep Learning for Anomaly Detection: A Survey."
                 arXiv preprint.

                 * Comprehensive survey
                 * Autoencoder methods
                 * Time series anomaly detection

[Liu2008] Liu, F.T., Ting, K.M., & Zhou, Z.H. (2008).
          "Isolation Forest."
          IEEE International Conference on Data Mining.

          * Isolation Forest algorithm
          * Anomaly score computation
          * Linear time complexity

[Park2018] Park, D., et al. (2018).
           "A Multimodal Anomaly Detector for Robot-Assisted
           Feeding Using an LSTM-based Variational Autoencoder."
           IEEE Robotics and Automation Letters.

           * VAE for anomaly detection
           * Multimodal data
           * Real-world deployment
```

---

## 4. Power Electronics Health Monitoring

### 4.1 Capacitor Degradation

```
CAPACITOR HEALTH MONITORING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Wang2014] Wang, H., & Blaabjerg, F. (2014).
           "Reliability of Capacitors for DC-Link Applications in
           Power Electronic Converters—An Overview."
           IEEE Transactions on Industry Applications.

           * Capacitor failure mechanisms
           * ESR monitoring
           * Lifetime models

[Soliman2016] Soliman, H., Wang, H., & Blaabjerg, F. (2016).
              "A Review of the Condition Monitoring of Capacitors in
              Power Electronic Converters."
              IEEE Transactions on Industry Applications.

              * Online ESR estimation
              * Capacitance monitoring
              * Ripple-based methods

[Pu2019] Pu, S., et al. (2019).
         "ESR Estimation and Remaining Useful Life Prediction for
         Aluminum Electrolytic Capacitors."
         IEEE Transactions on Industrial Electronics.

         * RUL prediction for capacitors
         * Feature extraction methods
         * Validation on real data
```

### 4.2 MOSFET/IGBT Degradation

```
SEMICONDUCTOR HEALTH MONITORING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Smet2011] Smet, V., et al. (2011).
           "Ageing and Failure Modes of IGBT Modules in High-
           Temperature Power Cycling."
           IEEE Transactions on Industrial Electronics.

           * Bond wire degradation
           * Solder fatigue
           * Thermal cycling effects

[Held1997] Held, M., et al. (1997).
           "Fast Power Cycling Test of IGBT Modules in Traction
           Application."
           IEEE International Conference on Power Electronics.

           * Coffin-Manson model
           * Accelerated testing
           * Lifetime prediction

[Choi2018] Choi, U.M., Blaabjerg, F., & Jorgensen, S. (2018).
           "Power Cycling Test Methods for Reliability Assessment
           of Power Device Modules in Respect to Temperature Stress."
           IEEE Transactions on Power Electronics.

           * Test methodologies
           * Temperature measurement
           * Failure criteria
```

### 4.3 SiC-Specific Reliability

```
SiC MOSFET RELIABILITY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Lelis2018] Lelis, A.J., et al. (2018).
            "High-Temperature Reliability of SiC Power MOSFETs."
            Materials Science Forum.

            * Gate oxide reliability
            * Body diode degradation
            * High-temperature operation

[Gonzalez2018] Gonzalez, J.O., & Alatise, O. (2018).
               "A Review of Condition Monitoring of SiC Power Modules."
               IEEE Transactions on Power Electronics.

               * SiC-specific failure modes
               * On-state resistance drift
               * Threshold voltage shift

[Wolfspeed] Wolfspeed Application Notes:
            AN-0028: "Reliability of SiC Power MOSFETs"
            AN-0032: "Thermal Management for SiC Devices"

            * Manufacturer guidance
            * Derating recommendations
            * Thermal design
```

---

## 5. Federated Learning

### 5.1 Foundations

```
FEDERATED LEARNING FOUNDATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[McMahan2017] McMahan, B., et al. (2017).
              "Communication-Efficient Learning of Deep Networks
              from Decentralized Data."
              AISTATS.

              * FedAvg algorithm
              * Communication efficiency
              * Non-IID data handling

[Li2020fed] Li, T., et al. (2020).
            "Federated Optimization in Heterogeneous Networks."
            MLSys.

            * FedProx algorithm
            * Systems heterogeneity
            * Statistical heterogeneity

[Kairouz2021] Kairouz, P., et al. (2021).
              "Advances and Open Problems in Federated Learning."
              Foundations and Trends in Machine Learning.

              * Comprehensive survey
              * Open challenges
              * Future directions
```

### 5.2 Federated Learning for IoT/Edge

```
FEDERATED LEARNING ON EDGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kopparapu2021] Kopparapu, K., et al. (2021).
                "TinyFed: Federated Learning on Extremely Small
                Edge Devices."
                MLSys Workshop.

                * FL on microcontrollers
                * Memory-efficient updates
                * Communication compression

[Mills2019] Mills, J., Hu, J., & Min, G. (2019).
            "Communication-Efficient Federated Learning for
            Wireless Edge Intelligence in IoT."
            IEEE Internet of Things Journal.

            * Wireless FL
            * Gradient compression
            * Edge deployment

[Wang2019fed] Wang, S., et al. (2019).
              "Adaptive Federated Learning in Resource Constrained
              Edge Computing Systems."
              IEEE Journal on Selected Areas in Communications.

              * Resource-aware FL
              * Adaptive aggregation
              * Heterogeneous devices
```

### 5.3 Federated Learning for Predictive Maintenance

```
FL FOR INDUSTRIAL APPLICATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Zhang2021] Zhang, W., et al. (2021).
            "Federated Learning for Machinery Fault Diagnosis
            with Dynamic Validation and Self-Supervision."
            Knowledge-Based Systems.

            * FL for fault diagnosis
            * Self-supervised pretraining
            * Non-IID industrial data

[Liu2020] Liu, Y., et al. (2020).
          "Privacy-Preserving Traffic Flow Prediction: A Federated
          Learning Approach."
          IEEE Intelligent Transportation Systems.

          * Privacy preservation
          * Traffic prediction
          * Applicable methodology

[Pokhrel2020] Pokhrel, S.R., & Choi, J. (2020).
              "Federated Learning with Blockchain for Autonomous
              Vehicles: Analysis and Design Challenges."
              IEEE Transactions on Communications.

              * Blockchain + FL
              * Automotive application
              * Trust management
```

---

## 6. Continual and Online Learning

### 6.1 Continual Learning

```
CONTINUAL LEARNING REFERENCES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Kirkpatrick2017] Kirkpatrick, J., et al. (2017).
                  "Overcoming Catastrophic Forgetting in Neural
                  Networks."
                  PNAS.

                  * Elastic Weight Consolidation
                  * Fisher information
                  * Catastrophic forgetting

[Parisi2019] Parisi, G.I., et al. (2019).
             "Continual Lifelong Learning with Neural Networks:
             A Review."
             Neural Networks.

             * Comprehensive survey
             * Taxonomy of approaches
             * Open challenges

[Chaudhry2019] Chaudhry, A., et al. (2019).
               "Continual Learning with Tiny Episodic Memories."
               ICML Workshop.

               * Memory-efficient CL
               * Experience replay
               * Tiny memory buffers
```

### 6.2 Concept Drift

```
CONCEPT DRIFT HANDLING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Gama2014] Gama, J., et al. (2014).
           "A Survey on Concept Drift Adaptation."
           ACM Computing Surveys.

           * Drift detection methods
           * Adaptation strategies
           * Evaluation methodology

[Lu2018] Lu, J., et al. (2018).
         "Learning under Concept Drift: A Review."
         IEEE Transactions on Knowledge and Data Engineering.

         * Drift types
         * Detection algorithms
         * Online learning approaches
```

---

## 7. Benchmark Datasets

### 7.1 Predictive Maintenance Datasets

```
PUBLIC DATASETS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C-MAPSS (NASA):
────────────────────────────────────────────
• Turbofan engine degradation simulation
• 4 sub-datasets (different conditions)
• 26 sensor channels
• Run-to-failure trajectories
• Most cited RUL benchmark

URL: https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/

PHM 2008 Challenge:
────────────────────────────────────────────
• Gearbox fault detection
• Multiple fault types
• Vibration data
• IEEE PHM Society

FEMTO Bearing Dataset:
────────────────────────────────────────────
• Bearing degradation
• Run-to-failure
• High sampling rate
• FEMTO-ST Institute

IEEE PHM 2012 Data Challenge:
────────────────────────────────────────────
• Bearing prognostics
• Multiple operating conditions
• Accelerated life testing
```

### 7.2 Power Electronics Datasets

```
POWER ELECTRONICS DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CALCE Battery Dataset:
────────────────────────────────────────────
• Li-ion battery degradation
• Multiple chemistries
• Cycling data
• University of Maryland

URL: https://calce.umd.edu/battery-data

NASA Battery Dataset:
────────────────────────────────────────────
• Li-ion degradation
• Different usage profiles
• Impedance measurements
• NASA Ames

Power Electronics Reliability (Limited):
────────────────────────────────────────────
• Most data proprietary
• Accelerated test data in papers
• Simulation data available
• Need: Open EK3-style dataset
```

---

## 8. Comparison to Our Approach

### 8.1 Novelty of Our Work

```
COMPARISON TO PRIOR WORK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aspect              | Prior Work          | Our Approach
────────────────────┼─────────────────────┼──────────────────
Platform            | Server/cloud        | MCU (STM32G474)
Model size          | MB-GB               | < 100 KB
Inference time      | Seconds             | < 10 ms
Training            | Centralized         | Federated fleet
Data source         | General machinery   | Power electronics
Health indicator    | Generic             | ESR, Rds_on specific
Online adaptation   | Rare                | Continual learning
Privacy             | Not considered      | Federated + local

KEY CONTRIBUTIONS:
────────────────────────────────────────────
1. First TinyML RUL system for power electronics
2. Physics-informed feature engineering for EK3
3. Federated learning across module fleet
4. On-device continual adaptation
5. Complete edge-to-cloud pipeline
```

### 8.2 Research Gaps Addressed

```
GAPS ADDRESSED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EDGE DEPLOYMENT FOR PM
   Prior: PM research assumes cloud compute
   Ours: Full on-device inference with TinyML

2. POWER ELECTRONICS SPECIFICITY
   Prior: Generic machinery features
   Ours: ESR, Rds_on, thermal cycling specific

3. FLEET LEARNING
   Prior: Individual device models
   Ours: Federated learning across module fleet

4. WEAK SUPERVISION
   Prior: Requires run-to-failure labels
   Ours: Physics-based weak supervision

5. RESOURCE CONSTRAINTS
   Prior: Ignore MCU limitations
   Ours: Explicit constraint-aware design
```

---

## 9. Publication Venues

### 9.1 Target Venues

| Venue | Type | Focus | Relevance |
|-------|------|-------|-----------|
| IEEE TII | Journal | Industrial Informatics | High |
| IEEE PHM | Conference | Prognostics | High |
| NeurIPS | Conference | Machine Learning | Medium |
| AAAI | Conference | AI | Medium |
| IEEE TPEL | Journal | Power Electronics | Medium |
| MLSys | Conference | ML Systems | High |
| SenSys | Conference | Embedded Systems | High |

### 9.2 Submission Strategy

```
RECOMMENDED SUBMISSION PATH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Option A: Industrial Focus
1. IEEE Transactions on Industrial Informatics
2. If rejected: IEEE Access (open access)
3. Conference: IEEE PHM

Option B: ML/Systems Focus
1. MLSys (TinyML workshop → main track)
2. If rejected: NeurIPS workshop
3. Extended: JMLR

Option C: Power Electronics Focus
1. IEEE Transactions on Power Electronics
2. ECCE or APEC conference
3. Cross-disciplinary novelty angle

PAPER STRUCTURE RECOMMENDATIONS:
────────────────────────────────────────────
• Lead with application domain (power electronics PM)
• Emphasize resource constraints as key challenge
• Include comprehensive ablation study
• Provide reproducibility package
```

---

## 10. Key References Summary

### Essential Papers (Top 10)

1. **[Lin2020]** MCUNet - TinyML architecture
2. **[McMahan2017]** FedAvg - Federated learning
3. **[Jacob2018]** INT8 quantization
4. **[Li2018]** CNN for RUL prediction
5. **[Wang2014]** Capacitor reliability
6. **[Kirkpatrick2017]** Elastic Weight Consolidation
7. **[Chalapathy2019]** Deep anomaly detection
8. **[Zheng2017]** LSTM for RUL
9. **[Banbury2021]** MLPerf Tiny benchmark
10. **[Carvalho2019]** PM ML survey

---

## Related Documents

- `01-problem-formulation.md` - Problem definition
- `02-tinyml-constraints.md` - Hardware constraints
- `03-algorithms.md` - Algorithm implementations
- `04-data-pipeline.md` - Data collection and preprocessing
