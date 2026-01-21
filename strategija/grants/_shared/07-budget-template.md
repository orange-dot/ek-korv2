# Budget Template (Shared Content)

*Adapt this template for each grant application.*

---

## Standard Cost Categories

### Personnel Costs

| Role | Monthly Cost (€) | FTE | Annual Cost (€) |
|------|------------------|-----|-----------------|
| CTO (Bojan) | 8,000 | 1.0 | 96,000 |
| CEO (Marija) | 6,000 | 1.0 | 72,000 |
| Power Electronics Engineer | 9,000 | 1.0 | 108,000 |
| Embedded Rust Developer | 8,000 | 1.0 | 96,000 |
| Community Manager | 6,000 | 0.5 | 36,000 |
| **Subtotal (full team)** | | | **408,000** |

*Note: Adjust FTE and include only relevant roles per grant.*

### Hardware & Equipment

| Item | Unit Cost (€) | Quantity | Total (€) |
|------|---------------|----------|-----------|
| EK3 prototype boards | 2,500 | 10 | 25,000 |
| Test equipment (oscilloscope, etc.) | 15,000 | 1 | 15,000 |
| Development kits (STM32, etc.) | 500 | 10 | 5,000 |
| Power supplies & loads | 5,000 | 2 | 10,000 |
| Safety testing equipment | 8,000 | 1 | 8,000 |
| **Subtotal** | | | **63,000** |

### Subcontracting

| Service | Provider | Cost (€) |
|---------|----------|----------|
| PCB manufacturing | JLCPCB / Eurocircuits | 15,000 |
| Safety certification support | TÜV / external consultant | 30,000 |
| Legal (IP, contracts) | Dutch law firm | 15,000 |
| **Subtotal** | | **60,000** |

### Travel & Dissemination

| Activity | Cost (€) |
|----------|----------|
| Conference attendance (2-3/year) | 10,000 |
| Partner meetings (EU travel) | 8,000 |
| Pilot site visits | 5,000 |
| Community events / meetups | 3,000 |
| **Subtotal** | **26,000** |

### Other Direct Costs

| Item | Cost (€) |
|------|----------|
| Cloud infrastructure (Azure/AWS) | 6,000 |
| Software licenses | 3,000 |
| Office / co-working space | 12,000 |
| Components & consumables | 10,000 |
| **Subtotal** | **31,000** |

### Indirect Costs (Overhead)

Typically calculated as percentage of direct costs:
- EU programs: Usually 25% flat rate
- National programs: Varies (15-40%)

---

## Budget Scenarios

### Scenario A: Small Grant (€100K - Innovation Fund Serbia)

| Category | Amount (€) | % |
|----------|------------|---|
| Personnel (Bojan 50% + Marija 30%) | 55,000 | 55% |
| Hardware & prototyping | 25,000 | 25% |
| Subcontracting (PCB, legal) | 10,000 | 10% |
| Travel & other | 10,000 | 10% |
| **Total** | **100,000** | 100% |

### Scenario B: Medium Grant (€500K - MIT/NWO)

| Category | Amount (€) | % |
|----------|------------|---|
| Personnel (3 FTE, 18 months) | 300,000 | 60% |
| Hardware & equipment | 80,000 | 16% |
| Subcontracting | 50,000 | 10% |
| Travel & dissemination | 30,000 | 6% |
| Other direct costs | 40,000 | 8% |
| **Total** | **500,000** | 100% |

### Scenario C: Large Grant (€2.5M - EIC Accelerator)

| Category | Amount (€) | % |
|----------|------------|---|
| Personnel (5 FTE, 24 months) | 1,200,000 | 48% |
| Hardware & equipment | 400,000 | 16% |
| Subcontracting (certification, etc.) | 350,000 | 14% |
| Pilot deployments | 300,000 | 12% |
| Travel & dissemination | 100,000 | 4% |
| Other direct costs | 150,000 | 6% |
| **Total** | **2,500,000** | 100% |

---

## Milestone-Based Budgeting

### 18-Month Project Example

| Milestone | Month | Deliverable | Budget (€) |
|-----------|-------|-------------|------------|
| M1 | 6 | EK-KOR2 v1.0 public release | 400,000 |
| M2 | 12 | EK3 prototype certified | 600,000 |
| M3 | 18 | Pilot deployment complete | 500,000 |
| **Total** | | | **1,500,000** |

### Budget per Milestone

**M1: EK-KOR2 Release (€400K)**
| Category | Amount (€) |
|----------|------------|
| Personnel (3 FTE × 6 months) | 250,000 |
| Development equipment | 50,000 |
| Documentation & community | 50,000 |
| Travel & events | 25,000 |
| Overhead | 25,000 |

**M2: Hardware Prototype (€600K)**
| Category | Amount (€) |
|----------|------------|
| Personnel (4 FTE × 6 months) | 350,000 |
| Prototype manufacturing | 100,000 |
| Certification support | 80,000 |
| Testing & validation | 50,000 |
| Overhead | 20,000 |

**M3: Pilot Deployment (€500K)**
| Category | Amount (€) |
|----------|------------|
| Personnel (4 FTE × 6 months) | 300,000 |
| Pilot hardware (20 units) | 100,000 |
| Installation & integration | 50,000 |
| Travel & support | 30,000 |
| Overhead | 20,000 |

---

## Cost Justification Templates

### Personnel Justification

```
ROLE: Power Electronics Engineer
FTE: 1.0
DURATION: 18 months
MONTHLY COST: €9,000
TOTAL: €162,000

JUSTIFICATION:
This role is critical for transitioning EK3 from design to prototype.
Required expertise: SiC converter design, thermal management, magnetics.
Market rate for senior power electronics engineers in Netherlands: €90-110K/year.
The engineer will be responsible for:
- Prototype board bring-up and debugging
- Thermal validation and optimization
- EMC compliance preparation
- Manufacturing documentation
```

### Equipment Justification

```
ITEM: High-bandwidth oscilloscope (Keysight DSOX4024A)
COST: €12,000
QUANTITY: 1

JUSTIFICATION:
Essential for debugging high-frequency switching waveforms in LLC converter.
Required bandwidth: 200MHz minimum for 100kHz switching.
Features needed: 4 channels, deep memory, protocol decode.
This equipment will be used throughout the project for:
- Prototype validation
- EMC pre-compliance
- Production testing development
```

---

## Co-Funding Requirements

### Typical Requirements by Program

| Program | Co-funding Required | Type |
|---------|---------------------|------|
| Innovation Fund Serbia | 0-30% | Cash or in-kind |
| EIC Accelerator | 30% (for equity portion) | Cash |
| Horizon Europe | 0% (100% funded) | N/A |
| NWO | Varies | Often in-kind |
| MIT Haalbaarheid | 0% | N/A |

### In-Kind Contribution Calculation

| Contribution | Valuation Method | Annual Value (€) |
|--------------|------------------|------------------|
| Founder time (pre-grant) | 50% of market rate | 50,000 |
| Existing IP | Development cost | 100,000 |
| Equipment already owned | Depreciated value | 10,000 |
| Office space (home) | Market rate equivalent | 6,000 |

---

## Financial Sustainability

### Post-Grant Revenue Model

| Year | Grant Revenue (€) | Commercial Revenue (€) | Total (€) |
|------|-------------------|------------------------|-----------|
| 2026 | 500,000 | 0 | 500,000 |
| 2027 | 1,000,000 | 200,000 | 1,200,000 |
| 2028 | 500,000 | 800,000 | 1,300,000 |
| 2029 | 0 | 2,000,000 | 2,000,000 |

### Path to Self-Sustainability

```
REVENUE SOURCES (POST-GRANT):
═══════════════════════════════════════════════════════════════

1. CERTIFIED HARDWARE SALES
   • EK3 modules: €500/unit, 30% margin
   • Target: 1000 units/year by 2028

2. FLEET PLATFORM SUBSCRIPTIONS
   • SaaS model: €500/month/depot
   • Target: 50 depots by 2028

3. SUPPORT & SERVICES
   • Integration services: €150/hour
   • Training: €2,000/session
   • Extended support: €10,000/year/depot

4. LICENSING (CERTIFIED COMPONENTS)
   • Third-party hardware certification
   • Revenue share: 5% of certified product sales
```

---

*Last updated: January 2026*
*Version: 1.0*
