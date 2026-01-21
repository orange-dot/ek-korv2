# Risk Matrix - EK3/Elektrokombinacija

> **Verzija:** 1.0
> **Datum:** Januar 2026
> **Kontekst:** Odgovor na Jovino pitanje o timeline riziku i kalkulaciji

---

## 1. Executive Summary

Ovaj dokument formalizuje risk analizu projekta. Rizici su kategorisani u četiri oblasti: tehnički, komercijalni, regulatorni i operativni. Svaki rizik ima procenjenu verovatnoću, impact i definisanu mitigacionu strategiju.

**Ukupna Risk Ocena:** SREDNJE-VISOK (prihvatljivo za deep-tech startup)

---

## 2. Risk Assessment Framework

### Skaliranje

**Verovatnoća (P):**
| Ocena | Vrednost | Opis |
|-------|----------|------|
| 1 | <10% | Vrlo malo verovatno |
| 2 | 10-25% | Malo verovatno |
| 3 | 25-50% | Moguće |
| 4 | 50-75% | Verovatno |
| 5 | >75% | Vrlo verovatno |

**Impact (I):**
| Ocena | Finansijski | Schedule | Opis |
|-------|-------------|----------|------|
| 1 | <€10K | <1 mesec | Zanemarljiv |
| 2 | €10-50K | 1-3 meseca | Nizak |
| 3 | €50-200K | 3-6 meseci | Srednji |
| 4 | €200K-1M | 6-12 meseci | Visok |
| 5 | >€1M | >12 meseci | Kritičan |

**Risk Score:** R = P × I (1-25 skala)
- **1-4:** Nizak (zeleno)
- **5-9:** Srednji (žuto)
- **10-15:** Visok (narandžasto)
- **16-25:** Kritičan (crveno)

---

## 3. Tehnički Rizici

### T1: Parallel Module Synchronization

| Atribut | Vrednost |
|---------|----------|
| Opis | Phase drift između 100+ modula uzrokuje cirkulacione struje |
| Verovatnoća | 3 (moguće) |
| Impact | 4 (visok - redesign potreban) |
| **Risk Score** | **12 (Visok)** |

**Mitigacije:**
1. Droop control limitira cirkulacione struje (dokumentovano u `07-v2g-control.md`)
2. Tight PLL bandwidth (20 Hz, ±1° phase error)
3. Incrementalno testiranje: 2 → 7 → 46 → 100+ modula
4. Hardware-in-loop simulacija pre fizičkog testa

**Trigger za Eskalaciju:** Cirkulacione struje >2% nominalne struje

---

### T2: EMC Compliance at Scale

| Atribut | Vrednost |
|---------|----------|
| Opis | 100+ switching converters stvaraju EMI koji ne prolazi CE |
| Verovatnoća | 3 (moguće) |
| Impact | 3 (srednji - dodatni shielding) |
| **Risk Score** | **9 (Srednji)** |

**Mitigacije:**
1. Spread-spectrum PWM (jitter ±5%)
2. Shielded enclosures per module
3. Common-mode chokes na DC bus
4. Pre-compliance testiranje sa svakim prototypom

**Trigger za Eskalaciju:** Fail na conducted emissions >6 dB over limit

---

### T3: Thermal Management

| Atribut | Vrednost |
|---------|----------|
| Opis | 7 modula u 1U (23 kW) ima nedovoljno hlađenje |
| Verovatnoća | 2 (malo verovatno) |
| Impact | 3 (srednji - derating potreban) |
| **Risk Score** | **6 (Srednji)** |

**Mitigacije:**
1. Forced air plenum design (dokumentovano)
2. ROJ thermal coordination (hot modules reduce load)
3. Derating curves sa temperature monitoring
4. CFD simulacija pre proizvodnje

**Trigger za Eskalaciju:** Tj > 150°C pri 80% load, 35°C ambient

---

### T4: Long-term Reliability

| Atribut | Vrednost |
|---------|----------|
| Opis | 15-25 godina target bez dovoljno field data |
| Verovatnoća | 4 (verovatno da će biti izazova) |
| Impact | 3 (srednji - warranty costs) |
| **Risk Score** | **12 (Visok)** |

**Mitigacije:**
1. Accelerated life testing (ALT) na kritičnim komponentama
2. Conservative derating (capacitors at 60% voltage)
3. N+1 redundancy by design
4. Field-replaceable modules (MTTR < 5 min)

**Trigger za Eskalaciju:** MTBF procena < 100,000 sati

---

## 4. Komercijalni Rizici

### C1: Cost Target Miss

| Atribut | Vrednost |
|---------|----------|
| Opis | $50/kW target neostvariv pri startup volumenu |
| Verovatnoća | 5 (vrlo verovatno na startu) |
| Impact | 4 (visok - price not competitive) |
| **Risk Score** | **20 (Kritičan)** |

**Analiza:**
- BOM @ 1 unit: $89/kW
- BOM @ 1,000 units: $56/kW
- BOM @ 100K units: $34/kW
- **Target achievable only at 100K+ scale**

**Mitigacije:**
1. Initial positioning as premium/innovative (not price leader)
2. Focus on TCO (Total Cost of Ownership) not unit cost
3. Licensing model as alternative to product sales
4. Strategic partnership for volume manufacturing

**Trigger za Eskalaciju:** No path to 10K volume within 3 years

---

### C2: First Customer Acquisition

| Atribut | Vrednost |
|---------|----------|
| Opis | Risk aversion - fleet operators won't adopt unproven tech |
| Verovatnoća | 4 (verovatno) |
| Impact | 5 (kritičan - no revenue) |
| **Risk Score** | **20 (Kritičan)** |

**Mitigacije:**
1. Target innovative operators (JKP Beograd, early adopters)
2. Offer pilot at cost/free in exchange for testimonial
3. Partner with OEM for credibility (ABB Serbia discussion)
4. Apply to accelerators with fleet operator networks

**Trigger za Eskalaciju:** No LOI within 12 months of prototype

---

### C3: Competitor Response

| Atribut | Vrednost |
|---------|----------|
| Opis | Kempower/ABB copy modular approach before EK3 scales |
| Verovatnoća | 3 (moguće) |
| Impact | 4 (visok - differentiation lost) |
| **Risk Score** | **12 (Visok)** |

**Mitigacije:**
1. Patent protection (3-patent family in progress)
2. First-mover in distributed intelligence (ROJ unique)
3. Focus on niches incumbents ignore (bus fleets, V2G)
4. Build switching costs (fleet logistics integration)

**Trigger za Eskalaciju:** Incumbent announces similar product

---

## 5. Regulatorni Rizici

### R1: Certification Delays

| Atribut | Vrednost |
|---------|----------|
| Opis | CE/UL certification traje duže od očekivanog |
| Verovatnoća | 3 (moguće) |
| Impact | 3 (srednji - 6 month delay) |
| **Risk Score** | **9 (Srednji)** |

**Budžet za Certifikacije:**
| Certifikacija | Procena | Timeline |
|---------------|---------|----------|
| CE (LVD, EMC) | €30-50K | 6-12 meseci |
| ISO 15118 | €20-30K | 3-6 meseci |
| Grid code (VDE AR-N 4110) | €50-100K | 12-18 meseci |
| **Total** | **€100-180K** | **18-24 meseci** |

**Mitigacije:**
1. Engage notified body early (design review stage)
2. Pre-compliance testing with every hardware revision
3. Budget 30% contingency on cert costs
4. Modular cert approach (base module first)

**Trigger za Eskalaciju:** Second iteration fails compliance

---

### R2: V2G Regulatory Uncertainty

| Atribut | Vrednost |
|---------|----------|
| Opis | V2G regulations nejasne, market delayed |
| Verovatnoća | 3 (moguće) |
| Impact | 2 (nizak - feature not critical for MVP) |
| **Risk Score** | **6 (Srednji)** |

**Mitigacije:**
1. V2G as optional feature, not core value prop
2. Design V2G-ready, certify later
3. Monitor EU regulatory developments
4. Engage with grid operators early

**Trigger za Eskalaciju:** V2G regulation postponed beyond 2028

---

### R3: Grid Connection Complexity

| Atribut | Vrednost |
|---------|----------|
| Opis | Utility requirements for large connections slow deployment |
| Verovatnoća | 4 (verovatno u nekim jurisdikcijama) |
| Impact | 2 (nizak - known issue) |
| **Risk Score** | **8 (Srednji)** |

**Mitigacije:**
1. Start in favorable jurisdictions (NL, DE have clearer processes)
2. Partner with EPC companies who have utility relationships
3. Design for behind-the-meter installations (avoid grid export)
4. Offer grid-forming capability as differentiator

**Trigger za Eskalaciju:** Grid connection denied at pilot site

---

## 6. Operativni Rizici

### O1: Key Person Dependency

| Atribut | Vrednost |
|---------|----------|
| Opis | Project depends on single founder's knowledge |
| Verovatnoća | 4 (verovatno dok je solo) |
| Impact | 5 (kritičan - project stops) |
| **Risk Score** | **20 (Kritičan)** |

**Mitigacije:**
1. Comprehensive documentation (in progress)
2. Open-source non-core components
3. Recruit co-founder with complementary skills
4. Establish technical advisory board

**Trigger za Eskalaciju:** No co-founder/team within 6 months

---

### O2: Funding Gap

| Atribut | Vrednost |
|---------|----------|
| Opis | Insufficient funding to reach first revenue |
| Verovatnoća | 3 (moguće) |
| Impact | 5 (kritičan - project stops) |
| **Risk Score** | **15 (Visok)** |

**Funding Requirements:**
| Phase | Need | Purpose |
|-------|------|---------|
| Prototype | €50-100K | Hardware, components |
| Certification | €100-180K | CE, ISO 15118, grid code |
| Pilot | €50-100K | Installation, support |
| **Total to Revenue** | **€200-380K** | |

**Mitigacije:**
1. Apply to accelerators (Rockstart, Climate-KIC)
2. EU grants (Horizon Europe, EIC Accelerator)
3. Strategic corporate partner
4. License technology if product sales delayed

**Trigger za Eskalaciju:** Runway < 6 months without clear funding path

---

## 7. Risk Heat Map

```
PROBABILITY
    5 │                        C1,C2
      │              O1
    4 │         R3        C3,T4
      │
    3 │    R2   R1,T2    T1
      │
    2 │    T3   O2
      │
    1 │
      └─────────────────────────────
         1    2    3    4    5
                 IMPACT

LEGEND:
T = Technical    C = Commercial
R = Regulatory   O = Operational
```

---

## 8. Timeline Risk Analysis

### Ambiciozni vs. Konzervativni Timeline

| Milestone | Optimistic | Realistic | Pessimistic |
|-----------|------------|-----------|-------------|
| Working prototype | Q2 2026 | Q3 2026 | Q4 2026 |
| CE certification | Q4 2026 | Q2 2027 | Q4 2027 |
| First pilot deployed | Q1 2027 | Q3 2027 | Q1 2028 |
| First revenue | Q2 2027 | Q4 2027 | Q2 2028 |
| 100 unit sales | Q4 2027 | Q2 2028 | Q4 2028 |
| Profitability | 2028 | 2029 | 2030+ |

**Probability Distribution:**
- Optimistic: 15%
- Realistic: 55%
- Pessimistic: 30%

---

## 9. Top 5 Risks Summary

| Rank | Risk | Score | Mitigation Status |
|------|------|-------|-------------------|
| 1 | Cost target miss (C1) | 20 | Partial - volume needed |
| 2 | First customer (C2) | 20 | In progress - pilot discussions |
| 3 | Key person dependency (O1) | 20 | In progress - documentation |
| 4 | Funding gap (O2) | 15 | In progress - accelerator apps |
| 5 | Long-term reliability (T4) | 12 | Planned - ALT testing |

---

## 10. Risk Monitoring Plan

| Risk | Indicator | Frequency | Owner |
|------|-----------|-----------|-------|
| T1 (Sync) | Circulating current % | Per prototype test | Technical |
| T2 (EMC) | Pre-compliance dB margin | Per hardware rev | Technical |
| C1 (Cost) | BOM tracking vs target | Monthly | Business |
| C2 (Customer) | Pipeline status | Weekly | Business |
| O2 (Funding) | Runway months | Monthly | Founder |

---

## 11. Conclusion

**Odgovor na Jovino Pitanje:**

> "Da li imaš kalkulaciju rizika?"

Da. Ova matrica identifikuje 12 ključnih rizika. Tri su kritična (C1, C2, O1), sva tri se aktivno mitiraju. Timeline je ambiciozan - realističan scenario je Q3-Q4 2027 za first revenue, ne Q1-Q2 2027.

**Ključni Takeaway:**
- Tehnički rizici su **upravljivi** (solid engineering foundation)
- Komercijalni rizici su **najviši** (typical for deep-tech startups)
- Uspeh zavisi od: **(1) pilot customer, (2) co-founder, (3) funding**

---

## Povezani Dokumenti

- `strategija/feasibility-analysis.md` - Originalna feasibility analiza
- `00-analiza-feedback.md` - Kompletna analiza Jovinog feedbacka
- `02-research-topics.md` - Akademske teme (risk mitigation kroz collaboration)
