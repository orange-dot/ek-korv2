# Project Overview: Elektrokombinacija

**For NCR Voyix Internal Disclosure**

---

## What Is Elektrokombinacija?

Elektrokombinacija develops modular EV charging infrastructure for electric bus fleets. The core innovation is a 3.3kW power module (called EK3) that can be combined in any quantity to create chargers from 3kW to 3MW.

**Industry context:** Cities worldwide are converting bus fleets from diesel to electric. Charging infrastructure is a bottleneck—existing solutions are expensive, inflexible, and have single points of failure.

**Our approach:** Instead of monolithic chargers, we use hundreds of small, identical modules. If one fails, the system continues operating. Power levels scale exactly to need.

---

## Technical Architecture (Summary)

### Hardware: EK3 Module
- **Power:** 3.3kW continuous
- **Dimensions:** 200 x 320 x 44mm
- **MCU:** STM32G474 (Cortex-M4F)
- **Communication:** CAN-FD @ 5Mbps

### Software: EK-KOR2 RTOS
- Distributed coordination without central scheduler
- Potential field scheduling (bio-inspired algorithms)
- Fault-tolerant consensus mechanisms
- Real-time operation (<1ms latency)

### Scaling

| Application | Modules | Power |
|-------------|---------|-------|
| E-bike | 1 | 3.3 kW |
| Home charger | 7 | 23 kW |
| DC fast charger | 46 | 152 kW |
| Bus depot | 152 | 502 kW |
| Truck MCS | 909 | 3 MW |

---

## Company Structure

**Elektrokombinacija BV** (Netherlands)

### Team

| Role | Person | Status |
|------|--------|--------|
| **CEO** | Marija Janjatovic | 100% dedicated, full-time |
| **CTO** | Bojan Janjatovic | Oversight role, dev work done |

### Role Division

**Marija (CEO)** handles all business activities:
- Investor relations
- Partnership development
- Grant applications
- Regulatory compliance
- Operations planning

**Bojan (CTO)** provides technical oversight:
- Architecture decisions (when needed)
- Technical due diligence support
- Code review (occasional)

---

## Development Status

### Completed (~95%)

| Component | Status |
|-----------|--------|
| EK-KOR2 kernel (C) | Working |
| EK-KOR2 kernel (Rust) | Working |
| Cross-validation test system | Comprehensive |
| Technical documentation | Complete |
| Hardware abstraction layers | Working |
| Communication protocols | Specified |

### Remaining (~5%)

| Component | Status | Owner |
|-----------|--------|-------|
| Hardware prototyping | Future | External fab |
| Certifications | Future | Consultants |
| Production setup | Future | Partners |

**Key point:** The software development work that required my direct involvement is essentially complete. What remains is business development (Marija's domain) and hardware manufacturing (external partners).

---

## Market and Industry

**Target market:** Public transit authorities, depot operators, fleet managers

**Industry:** Clean energy / EV infrastructure

**No overlap with NCR Voyix:** NCR Voyix operates in retail and banking technology. Elektrokombinacija operates in industrial EV charging infrastructure. These are completely separate industries with no customer overlap, no technology overlap, and no competitive concerns.

---

## IP Status

**Priority date:** January 2, 2026 (documented via blockchain timestamps)

**Patent family:** 3 provisional patents planned (modular architecture, swap station, fleet logistics)

**Protection:** Full IP belongs to Elektrokombinacija BV

---

## Time Commitment

My involvement:
- **Weekday evenings:** Occasional technical questions (minimal)
- **Weekends:** Research collaboration (see 02-ADVISOR-COLLABORATION.md)
- **NCR Voyix work hours:** Zero overlap

The intensive development phase is behind us. My ongoing involvement is advisory oversight, not active coding.

---

## Why This Doesn't Affect NCR Voyix

1. **Different industry** - EV infrastructure vs. retail/banking technology
2. **Different customers** - Transit authorities vs. retailers/banks
3. **Different technology** - Embedded real-time systems vs. enterprise software
4. **Minimal time** - Development complete, oversight only
5. **Marija handles business** - I'm not the operational driver

---

*Document prepared for NCR Voyix internal disclosure, January 2026*
