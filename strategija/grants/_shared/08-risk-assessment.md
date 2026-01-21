# Risk Assessment (Shared Content)

*Use this content across all grant applications. Adapt emphasis per program.*

---

## Risk Categories

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **T1:** Real-time performance doesn't scale | Medium | High | Simulation before hardware, incremental testing |
| **T2:** Consensus latency exceeds requirements | Low | High | Fallback to simpler protocols, parameter tuning |
| **T3:** Hardware thermal issues | Medium | Medium | Conservative design margins, thermal chamber testing |
| **T4:** EMC compliance failure | Medium | Medium | Pre-compliance testing, EMC consultant |
| **T5:** SiC component reliability | Low | High | Qualification testing, redundancy in design |

### Market Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **M1:** Slow open-source adoption | Medium | High | Active community building, reference deployments |
| **M2:** Incumbent response (ABB/Siemens) | Medium | Medium | Speed to standard, ecosystem lock-in |
| **M3:** Regulatory changes unfavorable | Low | High | Monitor policy, diversify geographically |
| **M4:** Pilot partners withdraw | Medium | Medium | Multiple parallel pilots, flexible scope |
| **M5:** Alternative technology emerges | Low | High | Modular architecture allows adaptation |

### Execution Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **E1:** Key hire unavailable | Medium | High | Multiple recruitment channels, advisor network |
| **E2:** Founder availability | Low | Critical | Both founders 100% committed |
| **E3:** Cash flow gap | Medium | High | Multiple grant applications, staged spending |
| **E4:** IP challenge | Low | High | Blockchain timestamps, prior art defense |
| **E5:** Partner delays | High | Medium | Buffer time in schedule, parallel workstreams |

---

## Detailed Risk Analysis

### T1: Real-Time Performance at Scale

```
RISK: Real-time performance doesn't scale to 100+ nodes
═══════════════════════════════════════════════════════════════

PROBABILITY: Medium (30%)
IMPACT: High

ROOT CAUSES:
• Untested message throughput at scale
• Network congestion during consensus
• Memory constraints on embedded platform

DETECTION:
• Simulation benchmarks before hardware
• Incremental node addition (10 → 50 → 100)
• Continuous performance monitoring

MITIGATION:
• Validated in simulation (100+ nodes)
• Fallback: Hierarchical clustering (L1/L2)
• Protocol optimization based on profiling

CONTINGENCY:
• Reduce node count per cluster
• Add dedicated coordination nodes
• Simplify consensus (less Byzantine tolerance)
```

### M1: Slow Open-Source Adoption

```
RISK: Community doesn't adopt EK-KOR2
═══════════════════════════════════════════════════════════════

PROBABILITY: Medium (40%)
IMPACT: High

ROOT CAUSES:
• Unknown project, no reputation
• Competing established solutions
• Insufficient documentation
• No reference deployments

DETECTION:
• GitHub stars/forks tracking
• Download statistics
• Community forum activity
• Conference talk attendance

MITIGATION:
• Full-time community manager
• Excellent documentation
• Reference hardware designs
• Industry partnerships (Infineon)
• Academic publications

CONTINGENCY:
• Pivot to B2B licensing model
• Partner with established vendor
• Focus on vertical (bus depot only)
```

### E3: Cash Flow Gap

```
RISK: Funding gap between grant application and award
═══════════════════════════════════════════════════════════════

PROBABILITY: Medium (50%)
IMPACT: High

ROOT CAUSES:
• Grant decisions take 6-12 months
• Multiple applications may all fail
• Burn rate exceeds runway

DETECTION:
• Monthly cash flow monitoring
• Grant pipeline tracking
• 6-month forward projection

MITIGATION:
• Multiple parallel applications
• Staged spending (variable costs)
• Small grants first (faster decision)
• Consulting income as bridge

CONTINGENCY:
• Reduce burn (founders only)
• Delay hardware development
• Seek bridge financing (angel/friends)
• Pivot to services revenue
```

---

## Risk Matrix

```
                    IMPACT
           Low      Medium     High
         ┌─────────┬─────────┬─────────┐
    High │         │ E5      │         │
         ├─────────┼─────────┼─────────┤
Prob Med │         │ T3, T4  │ T1, M1, │
         │         │ M4      │ M2, E1, │
         │         │         │ E3      │
         ├─────────┼─────────┼─────────┤
     Low │         │         │ T2, T5, │
         │         │         │ M3, M5, │
         │         │         │ E2, E4  │
         └─────────┴─────────┴─────────┘

LEGEND:
• Top-right quadrant = Priority attention
• T = Technical, M = Market, E = Execution
```

---

## Risk Monitoring Plan

### Key Risk Indicators (KRIs)

| Risk | Indicator | Threshold | Frequency |
|------|-----------|-----------|-----------|
| T1 Performance | Message latency | >10ms avg | Weekly |
| T3 Thermal | Junction temperature | >125°C | Continuous |
| M1 Adoption | GitHub stars | <100 at 6mo | Monthly |
| E3 Cash flow | Runway months | <3 months | Monthly |
| E5 Partner delay | Milestone slip | >2 weeks | Bi-weekly |

### Review Schedule

| Review Type | Frequency | Participants |
|-------------|-----------|--------------|
| Technical risk review | Bi-weekly | CTO, engineers |
| Business risk review | Monthly | CEO, CTO |
| Full risk assessment | Quarterly | All team + advisors |
| Grant milestone review | Per milestone | Team + grant officer |

---

## Contingency Plans

### Scenario A: EIC Accelerator Rejected

```
IF: EIC Accelerator application fails
THEN:
1. Analyze feedback (available from EIC)
2. Apply to EIC Pathfinder (different criteria)
3. Accelerate Horizon Europe consortium
4. Increase focus on national grants (NL, Serbia)
5. Consider alternative funding (angels, strategic investor)
```

### Scenario B: Technical Showstopper

```
IF: Critical technical issue discovered
THEN:
1. Assess scope (single component vs. architecture)
2. Engage advisor network for solutions
3. If architecture issue: Pivot to simpler design
4. If component issue: Alternative supplier/design
5. Update timeline and communicate to stakeholders
```

### Scenario C: Market Pivot Required

```
IF: Bus depot market doesn't materialize
THEN:
1. Assess alternative verticals:
   - Logistics fleet depots
   - Residential solar + storage
   - Industrial microgrids
2. Adapt hardware form factor if needed
3. Maintain core RTOS (applicable across verticals)
4. Seek domain-specific partners
```

---

## Risk-Adjusted Timeline

### Base Timeline

| Milestone | Target Date |
|-----------|-------------|
| EK-KOR2 v1.0 | June 2026 |
| EK3 prototype | December 2026 |
| First pilot | June 2027 |

### Risk-Adjusted Timeline (P80)

| Milestone | Base Date | Risk Buffer | Adjusted Date |
|-----------|-----------|-------------|---------------|
| EK-KOR2 v1.0 | June 2026 | +2 months | August 2026 |
| EK3 prototype | December 2026 | +3 months | March 2027 |
| First pilot | June 2027 | +3 months | September 2027 |

*P80 = 80% confidence of completion by this date*

---

## Risk Ownership

| Risk Category | Owner | Escalation To |
|---------------|-------|---------------|
| Technical (T1-T5) | CTO (Bojan) | Advisory board |
| Market (M1-M5) | CEO (Marija) | Board/investors |
| Execution (E1-E5) | Joint CEO/CTO | Advisory board |

---

## What Could Go Wrong (Grant Application Version)

### Three Major Things That Could Go Wrong

**1. Technology doesn't perform at scale**
- We've validated in simulation but not on hardware at 100+ nodes
- Mitigation: Incremental deployment, fallback architectures
- Why we'll succeed: Conservative design, simulation-first approach

**2. Community doesn't adopt open-source platform**
- Open source success requires active community
- Mitigation: Full-time community manager, reference deployments, academic publications
- Why we'll succeed: Clear value proposition, industry partnerships (Infineon)

**3. Hardware certification takes longer than expected**
- IEC 61508 / ISO 26262 processes are unpredictable
- Mitigation: Early engagement with certification bodies, safety-first design
- Why we'll succeed: Two-tier safety architecture designed for certification

---

*Last updated: January 2026*
*Version: 1.0*
