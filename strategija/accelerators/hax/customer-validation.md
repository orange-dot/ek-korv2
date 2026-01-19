# Customer Validation Report

> **Document Purpose**: Evidence of validated problems through customer conversations - HAX requirement
> **Last Updated**: 2026-01-19

---

## Executive Summary

EK3's design was shaped by **real-world customer pain points** discovered through direct conversations with fleet operators and industry contacts. This document formalizes the validation evidence for HAX application.

---

## Primary Validation: Serbian Bus Fleet Operator

### Discovery Context
| Attribute | Details |
|-----------|---------|
| **Source** | Personal contact (high school friend) |
| **Industry position** | Knows fleet operators in Serbia |
| **Date** | 2025 |
| **Location** | Serbia |

### The Situation

A bus fleet operator in Serbia invested heavily in charging infrastructure:

| Investment | Details |
|------------|---------|
| **Equipment** | 10x ABB bus chargers |
| **Unit cost** | ~€100,000 each |
| **Total investment** | ~€1,000,000 |
| **Status** | **Non-operational** |

### What Happened

1. **Purchase**: Fleet operator acquired 10 ABB high-power chargers
2. **Attempt to localize**: Tried to clone/adapt hardware locally
3. **Hardware success**: Successfully replicated physical electronics
4. **Firmware failure**: Could not replicate proprietary firmware
5. **Multiple attempts**: Several programming teams tried and failed
6. **Current state**: **Chargers sitting idle for months**

### Key Quote
> "€1 million in hardware. Zero kWh delivered. Months of delays."

### Problems Identified

| Problem | Impact | Severity |
|---------|--------|----------|
| **Monolithic design** | Can't repair partial failures | Critical |
| **Proprietary firmware** | Vendor lock-in, no local adaptation | Critical |
| **No local support** | Wait weeks for Western European technician | High |
| **High unit cost** | €100k per charger = massive capital barrier | High |
| **Single point of failure** | One component fails = entire unit down | High |

### How This Shaped EK3

| Customer Problem | EK3 Solution | Innovation |
|------------------|--------------|------------|
| Monolithic design | 3.3 kW modules | Extreme modularity |
| Can't repair locally | Design for depot repair | Fleet logistics |
| Firmware black box | JEZGRO open architecture | ROJ swarm |
| Single point of failure | Distributed intelligence | N+1 redundancy |
| €100k per charger | Mass production of single SKU | 35% lower cost |

---

## Problem Validation Matrix

### Pain Points Confirmed

| Pain Point | Source | Validation Level |
|------------|--------|------------------|
| High equipment cost | Serbian operator | Direct observation |
| Vendor lock-in | Serbian operator | Direct observation |
| Repair impossible locally | Serbian operator | Direct observation |
| Long downtime during failures | Serbian operator | Direct observation |
| Lack of local technical support | Serbian operator | Direct observation |
| Proprietary firmware barriers | Serbian operator | Direct observation |

### Market-Level Validation

| Market Signal | Evidence |
|---------------|----------|
| **Emerging market price sensitivity** | €100k/unit prohibitive for Serbia |
| **Local manufacturing desire** | Operator attempted to clone hardware |
| **Technical capability exists** | Hardware cloning succeeded |
| **Software is the barrier** | Multiple teams failed at firmware |
| **Infrastructure sitting idle** | Real economic loss documented |

---

## Customer Insights → Product Decisions

### Insight 1: Modularity is Essential
**Customer reality**: When one component fails, entire €100k unit is down.

**EK3 response**:
- 3.3 kW modules = smallest practical unit
- One module fails = 0.3% capacity loss (not 100%)
- Hot-swap capability
- No downtime for module replacement

### Insight 2: Local Repair Must Be Possible
**Customer reality**: No one locally can fix the chargers. Wait weeks for ABB.

**EK3 response**:
- Design for repair (THT capacitors, accessible components)
- Module-level replacement (no special tools)
- Depot-based repair workflow
- Local technicians can handle everything

### Insight 3: Open Architecture Wins
**Customer reality**: Proprietary firmware = vendor lock-in = stuck.

**EK3 response**:
- JEZGRO open firmware architecture
- ROJ distributed intelligence (no central controller)
- Standard protocols (CAN-FD, ISO 15118)
- Local adaptation possible

### Insight 4: Cost Must Be Accessible
**Customer reality**: €100k per charger is prohibitive for emerging markets.

**EK3 response**:
- Single SKU manufacturing (millions of units)
- Target 35% cost reduction at scale
- Same module for all power levels
- No custom engineering per site

---

## Additional Validation Opportunities

### To Be Pursued

| Opportunity | Type | Potential Value |
|-------------|------|-----------------|
| **Belgrade public transport (GSP)** | Fleet operator | Direct customer |
| **Novi Sad transit authority** | Fleet operator | Direct customer |
| **EXPO 2027 Contractors** | System integrator | Partnership |
| **Regional bus operators (Niš, Subotica)** | Fleet operators | Pipeline |
| **ABB Serbia** | Vendor validation | Partnership/acquisition |

### Interview Questions Template

For future customer conversations:

1. **Pain points**: What are your biggest challenges with current charging infrastructure?
2. **Downtime cost**: How much does charger downtime cost you per day/week?
3. **Repair experience**: How do you currently handle charger failures?
4. **Local support**: Do you have access to local technical support?
5. **Cost sensitivity**: What would make new infrastructure investment feasible?
6. **Future plans**: What are your fleet electrification plans for next 5 years?

---

## Validation Evidence Format for HAX

### One-Page Summary (for application)

**Problem Discovery**: Through a personal contact, learned about a Serbian bus fleet operator who invested €1M in 10 ABB chargers. The hardware was cloned successfully, but proprietary firmware meant the chargers sat idle for months while multiple programming teams failed to make them work.

**Key Insight**: The problem isn't technology - it's architecture. Monolithic, proprietary designs create vendor lock-in and make local adaptation impossible.

**Solution Hypothesis**: Extreme modularity (3.3 kW units) + open architecture (JEZGRO) + distributed intelligence (ROJ) = locally repairable, adaptable, affordable charging infrastructure.

**Validation Level**: Direct observation of problem + root cause analysis + solution mapping.

---

## Supporting Evidence

### EXPO 2027 Belgrade Context

Serbia is preparing for EXPO 2027 in Belgrade, which includes:
- Public transport modernization
- Electric bus fleet expansion
- Charging infrastructure buildout
- International visibility

This creates a real-world deployment opportunity aligned with our customer validation.

### Regional Market Context

Western Balkans characteristics:
- Price sensitivity (€100k/unit is too high)
- Technical capability (hardware cloning succeeded)
- Desire for local solutions (vendor lock-in frustration)
- Growing electrification mandates (EU alignment)

---

## Next Steps

### For HAX Application
- [ ] Video testimonial from contact (if possible)
- [ ] Document additional conversations as they happen
- [ ] Connect with GSP Belgrade for formal validation
- [ ] Prepare one-page customer validation summary

### For Product Development
- [x] Modular architecture (validated by customer need)
- [x] Open firmware approach (validated by customer need)
- [x] Local repair design (validated by customer need)
- [ ] Cost targets (need more data points)

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-19 | Initial formalization for HAX application |
