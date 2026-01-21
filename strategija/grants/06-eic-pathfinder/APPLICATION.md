# EIC Pathfinder - Application Skeleton

**Program:** European Innovation Council Pathfinder
**Type:** Pathfinder Open (or specific challenge)
**Amount:** Up to €3-4M (consortium)
**Duration:** 36-48 months
**TRL:** 1-4 (early-stage research)

---

## 1. Project Summary

### Title

**FIELDOS: Emergent Coordination Through Artificial Potential Fields for Distributed Cyber-Physical Systems**

### Abstract

FIELDOS explores a paradigm shift in distributed system coordination: replacing centralized schedulers with emergent self-organization based on artificial potential fields. Originally developed for robot navigation (Khatib, 1986), we adapt potential field theory to temporal task scheduling in cyber-physical systems.

**Research Hypothesis:** Distributed nodes can achieve globally optimal coordination through purely local gradient-following behavior, without any central authority or global state knowledge.

**Scientific Objectives:**
1. Formal mathematical framework for temporal potential fields
2. Proof of convergence and stability guarantees
3. Experimental validation in power electronics domain
4. Comparison with classical scheduling approaches

---

## 2. Scientific Excellence

### 2.1 State of the Art

**Distributed Scheduling:**
- Consensus-based (Raft, Paxos) - requires leader election
- Gossip protocols - eventual consistency only
- Market-based - computational overhead

**Potential Fields:**
- Khatib (1986) - robot navigation
- Ge & Cui (2002) - multi-robot coordination
- Not applied to temporal scheduling

### 2.2 Beyond State of the Art

FIELDOS advances:

1. **Temporal Potential Fields**
   - Novel: Fields encode time-varying state (load, thermal, availability)
   - Innovation: Gradient descent in temporal domain, not spatial

2. **Scale-Free Consensus Integration**
   - Novel: Combine field gradients with topological voting
   - Based on: Cavagna/Giardina starling flock research
   - Innovation: k=7 neighbors regardless of network size

3. **Formal Verification**
   - Novel: Lyapunov stability proofs for temporal fields
   - Innovation: Provable convergence guarantees

### 2.3 Research Questions

| # | Question | Method |
|---|----------|--------|
| RQ1 | Under what conditions do temporal fields converge? | Mathematical analysis |
| RQ2 | How do fields perform vs. classical scheduling? | Simulation comparison |
| RQ3 | What is the scaling limit? | Empirical testing |
| RQ4 | Can fields handle Byzantine faults? | Formal verification |

---

## 3. Methodology

### WP1: Mathematical Foundations (M1-M18)
- Formal specification of temporal potential fields
- Convergence analysis (Lyapunov methods)
- Stability proofs
- Complexity analysis

### WP2: Algorithm Development (M6-M30)
- Reference implementation (simulation)
- Property-based testing framework
- Comparison benchmarks
- Parameter optimization

### WP3: Experimental Validation (M18-M42)
- Embedded implementation (STM32)
- Power electronics testbed
- Scaling experiments (10-1000 nodes)
- Failure injection testing

### WP4: Theoretical Consolidation (M30-M48)
- Generalization beyond power electronics
- Publication of comprehensive framework
- Open-source release
- Follow-on research agenda

---

## 4. Impact

### 4.1 Scientific Impact

| Venue | Target | Timeline |
|-------|--------|----------|
| IEEE TPDS | Full paper on temporal fields | M24 |
| PODC | Theory paper on convergence | M18 |
| RTSS | Embedded systems application | M30 |
| ICDCS | Distributed consensus integration | M36 |

### 4.2 Technological Impact

**Pathways to Application:**
- EIC Transition grant (TRL 4→6)
- EIC Accelerator (commercialization)
- Spin-off company (if separate from Elektrokombinacija)

**Application Domains:**
- Power electronics coordination (primary)
- Swarm robotics
- IoT networks
- Edge computing orchestration

### 4.3 Portfolio Fit

FIELDOS complements the EIC portfolio:
- High-risk fundamental research
- Novel paradigm with broad applicability
- Clear path to commercial exploitation

---

## 5. Consortium

### Proposed Partners

| Partner | Type | Role | Budget |
|---------|------|------|--------|
| Elektrokombinacija | SME | Coordination, WP2, WP3 | €1.2M |
| [University 1] | Academic | WP1 (theory) | €1.0M |
| [University 2] | Academic | WP3 (validation) | €0.8M |
| [Research Institute] | RTO | WP2, WP4 | €1.0M |
| **Total** | | | **€4.0M** |

### Partner Requirements

**University 1 (Theory):**
- Expertise: Distributed systems theory, formal methods
- Contribution: Mathematical foundations, proofs

**University 2 (Experimental):**
- Expertise: Embedded systems, real-time computing
- Contribution: Hardware validation, scaling tests

**Research Institute:**
- Expertise: Algorithm design, benchmarking
- Contribution: Implementation, comparison studies

---

## 6. Budget

| Category | Amount (€) |
|----------|------------|
| Personnel | 2,800,000 |
| Equipment | 400,000 |
| Subcontracting | 200,000 |
| Travel | 200,000 |
| Other | 200,000 |
| Indirect (25%) | 200,000 |
| **Total** | **4,000,000** |

---

## 7. Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Convergence not provable | Medium | High | Numerical methods, bounded guarantees |
| Scaling limitations | Medium | Medium | Hierarchical fallback |
| Partner withdrawal | Low | High | Clear agreements, backup options |

---

## 8. Why EIC Pathfinder?

### High-Risk, High-Gain Profile

| Criterion | Our Project |
|-----------|-------------|
| Novelty | Paradigm shift (potential fields → scheduling) |
| Risk | Unknown if formal guarantees achievable |
| Gain | Broadly applicable to CPS coordination |
| Timing | 4-year research program needed |

### Not Ready for Accelerator

- Need fundamental research (proofs, bounds)
- TRL 4 target (not commercial deployment)
- Academic collaboration essential

### EIC Pathfinder Fit

- Supports foundational research
- Consortium model for complementary expertise
- Path to EIC Transition if successful

---

## 9. Ethical Considerations

| Aspect | Assessment |
|--------|------------|
| Dual use | Low risk (infrastructure, not weapons) |
| Data protection | No personal data processed |
| Environmental | Positive impact (energy efficiency) |
| Safety | Research on safety-critical systems (beneficial) |

---

*Application skeleton prepared: January 2026*
*For: EIC Pathfinder Open calls*
