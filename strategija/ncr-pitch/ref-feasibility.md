# EK3 Feasibility Analysis

> **Purpose**: Honest assessment of technical and commercial feasibility
> **Date**: January 2026

---

## Executive Summary

The EK3 concept has **strong technical foundations** but faces **significant commercialization challenges**. The core innovation (distributed coordination) is proven in software - the question is whether it translates to power electronics at competitive cost.

**Verdict**: Technically feasible, commercially uncertain. High-risk, high-reward.

---

## 1. Technical Feasibility

### What's Proven

| Claim | Evidence | Confidence |
|-------|----------|------------|
| Distributed consensus works | Raft algorithm is battle-tested (etcd, Consul, CockroachDB) | ✅ High |
| CAN-FD handles 100+ nodes | Automotive industry deploys this daily | ✅ High |
| LLC topology at 3.3 kW | Standard design, many reference implementations | ✅ High |
| STM32G474 for power control | ST's reference designs exist | ✅ High |
| SiC MOSFETs at this power level | Commodity parts (Wolfspeed, Infineon) | ✅ High |

### What's Unproven

| Claim | Risk | Mitigation |
|-------|------|------------|
| Modules sync voltage within spec | Phase drift between 100+ modules? | Droop control + tight PLL - needs hardware validation |
| Thermal management at density | 7 modules in 1U = 23 kW in small space | Forced air plenum design - needs thermal testing |
| EMC compliance at scale | 100+ switching converters = noise nightmare? | Spread-spectrum, shielding - needs EMC lab |
| Reliability at 15-25 year target | Capacitor aging, solder fatigue | Derating, redundancy - long-term unknown |

### Technical Risk Assessment

**LOW RISK:**
- Basic power electronics (LLC, SiC, STM32)
- Communication protocol (CAN-FD)
- Consensus algorithm (Raft variant)

**MEDIUM RISK:**
- Parallel operation stability (droop control tuning)
- Thermal management at high density
- EMC compliance

**HIGH RISK:**
- Cost target ($50/kW) - see commercial section
- 15-25 year reliability claim - unverifiable without field data

---

## 2. Commercial Feasibility

### The Core Problem

**Established competitors have:**
- Existing manufacturing at scale
- Certified products (CE, UL, etc.)
- Customer relationships
- Service networks
- 10+ years of field data

**EK3 has:**
- Novel architecture (unproven in market)
- No certifications
- No manufacturing
- No customers
- No field data

### Cost Analysis

**Target:** $50/kW (aggressive)
**ABB/Siemens:** ~$100-150/kW at scale

| Component | Cost @ 1 unit | Cost @ 1000 units | Cost @ 100K units |
|-----------|---------------|-------------------|-------------------|
| SiC MOSFETs (4x) | $80 | $50 | $30 |
| Transformer | $40 | $25 | $15 |
| Capacitors | $30 | $20 | $12 |
| STM32G474 | $8 | $5 | $3 |
| PCB + assembly | $60 | $35 | $20 |
| Enclosure | $30 | $20 | $12 |
| Magnetics | $25 | $15 | $10 |
| Misc (connectors, etc.) | $20 | $15 | $10 |
| **Total BOM** | **$293** | **$185** | **$112** |
| **Per kW** | **$89/kW** | **$56/kW** | **$34/kW** |

**Reality check:** $50/kW is achievable at 100K+ unit volumes. At startup volumes, more like $90-150/kW - **not cheaper than incumbents**.

### Certification Costs

| Certification | Cost | Time |
|---------------|------|------|
| CE marking (EU) | €30-50K | 6-12 months |
| UL (North America) | $50-100K | 6-12 months |
| ISO 15118 (vehicle comms) | €20-30K | 3-6 months |
| Grid codes (V2G) | €50-100K | 12-18 months |
| **Total** | **€150-280K** | **18-36 months** |

This is per product variant - changes require re-certification.

### Market Entry Barriers

1. **Chicken-and-egg**: Need volume for low cost, need low cost for volume
2. **Risk aversion**: Fleet operators won't bet on unproven technology
3. **Service network**: Who repairs a module in Hamburg at 3 AM?
4. **Liability**: If charging fails and bus doesn't run, who pays?

---

## 3. Competitive Analysis

### Why Would Anyone Buy EK3?

| Advantage | Real? | Competitor Response |
|-----------|-------|---------------------|
| Lower cost | Only at massive scale | Incumbents can cut margins |
| Modularity | Yes, genuine | Kempower already modular (20 kW units) |
| No single point of failure | Yes, genuine | Add redundancy to existing designs |
| V2G ready | Yes, but so are others | ABB, Siemens have V2G products |
| Field serviceability | Yes, genuine | Training + spare parts solves this |

### Honest Competitive Position

**EK3 is genuinely novel in:**
- Extreme modularity (3.3 kW vs 20+ kW)
- Distributed intelligence (no central controller)
- Fleet logistics model (swap vs repair)

**But these advantages matter only if:**
- Cost is competitive (not at startup scale)
- Reliability is proven (takes years)
- Customers trust a new vendor (takes references)

---

## 4. Scenarios

### Optimistic Scenario
- Land pilot with progressive fleet operator (2026)
- Prove reliability over 12 months (2027)
- Accelerator funding enables scale (2027)
- EU mandate pressure creates demand (2028+)
- Reach 10K+ unit volumes, cost becomes competitive

**Probability: 15-20%**

### Realistic Scenario
- Struggle to get first pilot (risk aversion)
- Burn through funding on certifications
- Pivot to component/licensing model
- Sell technology to incumbent, not products

**Probability: 50-60%**

### Pessimistic Scenario
- Can't achieve cost targets at low volume
- Incumbents copy modular approach
- Run out of funding before traction
- Technology becomes open-source/abandoned

**Probability: 25-30%**

---

## 5. What Would Change the Analysis

### Positive Catalysts

1. **Strategic partner** - OEM or utility takes equity stake, provides volume guarantee
2. **Regulation change** - EU mandates V2G capability (EK3 native advantage)
3. **Incumbent failure** - Major charger reliability scandal creates opening
4. **Cost breakthrough** - SiC prices drop 50%+ (happening gradually)

### Negative Catalysts

1. **Kempower succeeds** - Modular approach proven by well-funded competitor
2. **Solid-state batteries** - Faster charging = less need for distributed architecture
3. **Grid hardening** - Utilities solve capacity issues, V2G less valuable
4. **Recession** - Fleet electrification delays, funding dries up

---

## 6. Honest Conclusion

### What's Real
- The technical architecture is sound
- Distributed coordination is a genuine innovation
- Long-term cost advantage is plausible at scale

### What's Uncertain
- Path from prototype to scale manufacturing
- Customer willingness to adopt unproven technology
- Whether cost advantage materializes before funding runs out

### What's Needed for Success
1. **Patient capital** - 5-7 year horizon minimum
2. **Pilot customer** - Someone willing to take risk for innovation
3. **Certification funding** - €200K+ before first commercial sale
4. **Manufacturing partner** - Can't build 100K units in garage

### Recommendation

**For side project:** Continue - technical learning is valuable regardless of commercial outcome.

**For startup with co-founder:** Viable, but eyes open. Need:
- €500K-1M minimum to reach first revenue
- 3-5 year runway expectation
- Clear pilot customer commitment before scaling
- Acceptance that pivot is likely (licensing, components, acqui-hire)

**The co-founder question:** Is your potential co-founder ready for:
- 3-5 years of grind before knowing if it works?
- High probability (~60%) of pivot or exit, not original vision?
- €200K+ spent on certifications before selling anything?

If yes - it's a legitimate deep-tech bet. Many successful companies started with worse odds.

If looking for faster path to revenue - this isn't it.

---

## Appendix: Key Assumptions

| Assumption | If Wrong |
|------------|----------|
| SiC prices continue falling | Cost targets impossible |
| EU mandates stay on track | Market smaller than projected |
| V2G becomes valuable | Major differentiator disappears |
| Bus fleets electrify as planned | Primary market shrinks |
| No breakthrough in battery tech | Fast charging less critical |

---

*This analysis is intentionally conservative. Optimism is easy; honest assessment is useful.*
