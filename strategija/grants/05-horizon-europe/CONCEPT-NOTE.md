# Horizon Europe - Concept Note

**Cluster:** 5 (Climate, Energy and Mobility)
**Destination:** D5 - Clean and competitive solutions for all transport modes
**Potential Calls:**
- HORIZON-CL5-2025-D5-01: Next-generation EV charging
- HORIZON-CL5-2026-D5-01: Sustainable transport systems

**Project Acronym:** OPENCHARGE
**Duration:** 36-48 months
**Budget:** €3-5M (consortium)

---

## 1. Project Title

**OPENCHARGE: Open-Source Coordination Platform for Distributed Electric Vehicle Charging Infrastructure**

---

## 2. Abstract

OPENCHARGE will develop and validate an open-source coordination platform for distributed EV charging infrastructure, enabling interoperable, fault-tolerant, and scalable charging systems across Europe.

The project addresses the fragmentation in EV charging infrastructure by creating EK-KOR2, an open Real-Time Operating System that allows charging modules from different manufacturers to coordinate without proprietary lock-in.

Key innovations:
- **Potential field scheduling:** Emergent coordination without central control
- **Distributed consensus:** Fault-tolerant decision-making
- **Open-source ecosystem:** Community-driven standard development

The project will demonstrate the platform at three pilot sites across Europe with different transit operators, validating scalability from depot-level to city-wide coordination.

---

## 3. Objectives

### Main Objective

Develop and validate an open-source coordination standard for distributed EV charging infrastructure that enables interoperability, fault tolerance, and scalability across the European charging network.

### Specific Objectives

| # | Objective | Measurable Target |
|---|-----------|-------------------|
| SO1 | Develop open-source RTOS | EK-KOR2 v2.0, TRL 7 |
| SO2 | Validate hardware platform | 50+ certified EK3 modules |
| SO3 | Demonstrate at pilot sites | 3 EU transit operators |
| SO4 | Build ecosystem | 500+ developer community |
| SO5 | Prepare standardization | CEN/CENELEC contribution |

---

## 4. Work Packages

### WP1: Project Management (Lead: Elektrokombinacija)
- M1-M48
- Coordination, reporting, quality assurance

### WP2: RTOS Development (Lead: Elektrokombinacija)
- M1-M24
- EK-KOR2 core development
- Dual C/Rust implementation
- Safety certification preparation

### WP3: Hardware Platform (Lead: [Academic/Industry Partner])
- M6-M30
- EK3 module manufacturing
- Certification (CE, IEC 61508)
- Production scaling

### WP4: Pilot Deployments (Lead: [Transit Operator Partner])
- M18-M42
- Site 1: Netherlands (bus depot)
- Site 2: Germany (logistics fleet)
- Site 3: Nordics (mixed fleet)

### WP5: Standardization & Ecosystem (Lead: [Standards Body Partner])
- M12-M48
- CEN/CENELEC liaison
- Open-source community building
- Documentation and training

### WP6: Dissemination & Exploitation (Lead: [TBD])
- M1-M48
- Publications, conferences
- Business model development
- IPR management

---

## 5. Consortium Structure

### Required Partners

| Role | Type | Country | Contribution |
|------|------|---------|--------------|
| **Coordinator** | SME | Netherlands | RTOS development, coordination |
| **Academic 1** | University | Germany | Distributed systems research |
| **Academic 2** | University | Netherlands | Power electronics |
| **Industry 1** | Large enterprise | [TBD] | Hardware manufacturing |
| **Pilot 1** | Transit operator | Netherlands | Depot pilot site |
| **Pilot 2** | Transit operator | Germany | Logistics pilot |
| **Pilot 3** | Transit operator | Nordics | Mixed fleet pilot |
| **Standards** | Association | Belgium | CEN/CENELEC liaison |

### Potential Partners to Contact

**Academic:**
- TU Delft (Embedded Systems group)
- TU Eindhoven (Power Electronics)
- TU Munich (Distributed Systems)
- KTH Stockholm (Electric Power Systems)

**Industry:**
- Infineon (already engaged - semiconductors)
- Power electronics manufacturers
- Charging equipment integrators

**Pilots:**
- GVB Amsterdam
- BVG Berlin
- Ruter Oslo

**Standards:**
- CEN/CENELEC
- CharIN (Charging Interface Initiative)

---

## 6. Budget Estimate

### By Partner Type

| Partner Type | Budget (€) | % |
|--------------|------------|---|
| Coordinator (Elektrokombinacija) | 1,200,000 | 30% |
| Academic partners (2) | 1,000,000 | 25% |
| Industry partner | 800,000 | 20% |
| Pilot operators (3) | 600,000 | 15% |
| Standards/dissemination | 400,000 | 10% |
| **Total** | **4,000,000** | 100% |

### By Work Package

| WP | Budget (€) | % |
|----|------------|---|
| WP1: Management | 200,000 | 5% |
| WP2: RTOS | 1,200,000 | 30% |
| WP3: Hardware | 1,000,000 | 25% |
| WP4: Pilots | 1,000,000 | 25% |
| WP5: Standards | 300,000 | 7.5% |
| WP6: Dissemination | 300,000 | 7.5% |
| **Total** | **4,000,000** | 100% |

---

## 7. Impact

### Expected Impacts

| Impact Area | Contribution |
|-------------|--------------|
| CO2 reduction | 10-15% efficiency improvement in fleet charging |
| Cost reduction | 20-30% lower infrastructure costs via standardization |
| EU competitiveness | European-led open standard for global market |
| Jobs | 100+ direct, 1000+ ecosystem jobs |
| Innovation | Novel distributed coordination technology |

### KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Modules deployed | 50+ | Count at pilot sites |
| Energy efficiency | >97% | Measured at pilots |
| Fault recovery time | <1 second | Tested |
| Community size | 500+ developers | GitHub metrics |
| Publications | 5+ peer-reviewed | Count |

---

## 8. Excellence

### State of the Art

Current EV charging coordination relies on:
- Central coordinators (single point of failure)
- Proprietary protocols (vendor lock-in)
- Static scheduling (poor fault tolerance)

### Beyond State of the Art

OPENCHARGE advances:
1. **Potential field scheduling:** Novel application to temporal task coordination
2. **Scale-free consensus:** k=7 topological neighbors for optimal propagation
3. **Lock-free IPC:** <100ns deterministic communication
4. **Open-source ecosystem:** Community-driven innovation

### TRL Progression

| Component | Start TRL | End TRL |
|-----------|-----------|---------|
| EK-KOR2 RTOS | 4 | 7 |
| EK3 Hardware | 3 | 7 |
| Fleet coordination | 3 | 6 |

---

## 9. EU Added Value

### Why European Collaboration?

1. **Cross-border infrastructure:** Charging networks span EU
2. **Interoperability mandate:** AFIR requires standards
3. **Digital sovereignty:** European alternative to US/CN solutions
4. **Research excellence:** EU academic partners bring world-class expertise

### Alignment with EU Priorities

| Priority | Contribution |
|----------|--------------|
| Green Deal | Enable accelerated EV adoption |
| Digital Decade | Open-source digital infrastructure |
| Strategic Autonomy | Reduce vendor dependency |
| Industrial Strategy | Platform for EU manufacturers |

---

## 10. Next Steps

### Consortium Building

| Step | Timeline | Action |
|------|----------|--------|
| 1 | Jan 2026 | Identify potential partners |
| 2 | Feb 2026 | Initial contact, gauge interest |
| 3 | Mar 2026 | Partnership meetings |
| 4 | Apr 2026 | Consortium agreement draft |
| 5 | May 2026 | Confirm commitments |
| 6 | Jun 2026 | Begin proposal writing |

### Call Monitoring

- Monitor CORDIS for relevant calls
- Check Horizon Europe Work Programme updates
- Join relevant info days and brokerage events

---

*Concept note prepared: January 2026*
*For: Horizon Europe Cluster 5 applications*
