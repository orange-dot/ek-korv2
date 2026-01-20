# SCENARIO-POT-1: Infineon IP Acquisition Interest

**Datum:** 2026-01-20
**Status:** AKTIVAN - Čeka se odgovor
**Prioritet:** VISOK

---

## Situacija

Infineon je kontaktiran za NDA pristup TC3xx arhitekturi (za emulator razvoj). U zahtevu je poslat link na elektrokombinacija.com.

Infineon je pregledao javnu dokumentaciju i izrazio interes za akviziciju **svega što nije OSS**:
- ROJ (swarm intelligence)
- Self-healing fleet
- Visoka modularnost koncept
- EK-KOR distribuirani RTOS

**Ovo nije consulting ponuda - ovo je strateška IP akvizicija.**

---

## Šta je Infineon video na sajtu

```
Documentation (elektrokombinacija.com/docs)
├── Self-Healing Fleet
│   └── "Buses carry spare modules. Robots swap in 60 seconds."
├── System Architecture
│   └── "Philosophy of modular design + AI"
├── V2G Concepts
│   └── "How electric buses become virtual power plants"
├── ROJ Intelligence
│   └── "Swarm coordination for distributed power modules"
├── Competitive Analysis
│   └── "Market positioning vs ABB, Heliox, ChargePoint"
├── Small Battery Philosophy
│   └── "Economics of opportunity charging"
└── EK-KOR v2 Kernel
    └── "Distributed RTOS without central scheduler. Potential field coordination."
```

---

## IP Portfolio u pitanju

### Invention Disclosures (priority date: 2026-01-02/03/04)

| ID | Naziv | Relevantnost za Infineon |
|----|-------|-------------------------|
| EK-2026-001 | Unified Modular Power Architecture | ⭐⭐⭐ CORE |
| EK-2026-002 | Dual-Purpose Robotic Swap Station | ⭐⭐ |
| EK-2026-003 | Distributed Power Sparing System | ⭐⭐⭐ CORE |
| EK-2026-004 | Fleet-Integrated Maintenance Logistics | ⭐⭐ |
| EK-2026-005 | Coordinated Dual-Robot System | ⭐ |
| EK-2026-006 | JEZGRO/EK-KOR Microkernel | ⭐⭐⭐ CORE |
| EK-2026-007 | Decentralized V2G Control System | ⭐⭐⭐ CORE |
| EK-2026-008 | V2G AI/ML Fleet Optimization | ⭐⭐ |

**CORE za Infineon:** Modularnost + ROJ + V2G control = "smart charging ecosystem" na njihovim čipovima.

### Tehnička implementacija

| Komponenta | Status | Vrednost |
|------------|--------|----------|
| EK-KOR v2 RTOS (C) | Funkcionalan | Visoka |
| EK-KOR v2 RTOS (Rust) | Skeleton | Srednja |
| TC397XP Emulator | Funkcionalan (boots firmware) | Srednja |
| ROJ algoritmi | Dokumentovani + code | Visoka |
| V2G control algorithms | Dokumentovani | Visoka |

---

## Zašto Infineon želi ovo

1. **Diferencijacija** - TI, NXP, ST nemaju "charging ecosystem" story
2. **Upsell** - Prodaju čipove za €5-50, sa ROJ mogu prodavati rešenje za €500+
3. **Lock-in** - Ako ROJ radi samo na AURIX, kupci ostaju na Infineon platformi
4. **V2G tržište** - Eksplodira 2026-2030, Infineon želi poziciju

---

## Patent Status i Grace Period

### Trenutni status
```
✅ Priority dates uspostavljeni (Git commits)
✅ Invention disclosures napisani (10 komada)
✅ Filing strategy definisan (3 patenta)
❌ Provisional patents NISU fajlovani
⚠️  Javna objava na sajtu (~2026-01-02)
```

### Grace Period Timeline
```
2026-01-02  ──── Sajt objavljen (public disclosure)
     │
2026-01-20  ──── DANAS
     │
2026-07-02  ──── EU grace period ISTIČE (6 meseci)
     │
2027-01-02  ──── US grace period ISTIČE (12 meseci)
```

**ZAKLJUČAK:** Ima vremena, ali filing treba uraditi do kraja januara 2026.

---

## Opcije pregovora

### Opcija A: Non-Exclusive Licenca

```
Infineon dobija: Pravo korišćenja ROJ/EK-KOR na AURIX platformi
Mi zadržavamo: Pravo licenciranja drugima (TI, NXP, ST)
```

| Stavka | Iznos |
|--------|-------|
| Upfront fee | €50,000 - 150,000 |
| Royalty | 2-4% po uređaju |
| Godišnji minimum | €20,000 |

**Pro:** Zadržavaš IP, možeš licencirati drugima
**Con:** Infineon možda neće pristati (hoće ekskluzivnost)

### Opcija B: Exclusive Licenca (EV Charging)

```
Infineon dobija: Ekskluzivno pravo za EV charging industriju
Mi zadržavamo: Prava za druge industrije (industrial automation, grid storage)
```

| Stavka | Iznos |
|--------|-------|
| Upfront fee | €300,000 - 700,000 |
| Royalty | 1-2% po uređaju |
| Godišnji minimum | €50,000 |
| Trajanje | 5-10 godina |

**Pro:** Veći upfront, Infineon motivisan da gura tehnologiju
**Con:** Ne možeš licencirati ABB, Siemens, itd.

### Opcija C: Full IP Acquisition

```
Infineon dobija: Sve IP rights, patente, code
Mi dobijamo: Jednokratnu isplatu
```

| Stavka | Iznos |
|--------|-------|
| Acquisition price | €800,000 - 2,500,000 |
| Earnout (na milestone) | +€200,000 - 500,000 |

**Pro:** Cash odmah, bez daljih obaveza
**Con:** Gubiš sve, nema budućih prihoda

### Opcija D: Acquisition + Employment

```
Infineon dobija: IP + tebe kao tech lead
Ti dobijaš: Cash + salary + equity
```

| Stavka | Iznos |
|--------|-------|
| IP buyout | €500,000 - 1,000,000 |
| Godišnja plata | €100,000 - 150,000 |
| Sign-on bonus | €20,000 - 50,000 |
| RSU/Equity | €50,000 - 100,000 vesting |

**Pro:** Sigurnost + prihod + nastavak rada na tehnologiji
**Con:** Buduće izume poseduje Infineon (invention assignment)

---

## Preporučena strategija

### Faza 1: Zaštita (ova nedelja)

1. ☐ Ne obavezuj se ni na šta konkretno
2. ☐ Pošalji clarifying questions Infineon-u
3. ☐ Pripremi USPTO provisional dokumente

### Faza 2: Filing (do kraja januara)

4. ☐ Fajluj USPTO Provisional Patent A ($320)
5. ☐ Opciono: Provisional za B i C ($640 dodatno)

### Faza 3: Pregovori (februar+)

6. ☐ Zatraži formalni LOI (Letter of Intent) od Infineon-a
7. ☐ Angažuj IP advokata za review (€500-2000)
8. ☐ Pregovaraj sa "patent pending" statusom

---

## Email Template - Clarifying Questions

```
Subject: RE: Technology Portfolio Discussion

Thank you for your interest in the Elektrokombinacija technology portfolio.

I'm open to discussing potential collaboration or licensing arrangements
for the non-OSS components (ROJ coordination, self-healing fleet,
EK-KOR RTOS, modular architecture).

Before proceeding, I'd like to understand Infineon's specific interests:

1. SCOPE - Which specific technologies are of interest?
   - ROJ swarm coordination algorithms
   - Self-healing fleet logistics
   - EK-KOR distributed RTOS
   - Modular power architecture
   - V2G control systems
   - All of the above

2. STRUCTURE - What type of arrangement are you considering?
   - Technology licensing (non-exclusive)
   - Exclusive license for specific markets
   - Full IP acquisition
   - Joint development partnership

3. INTEGRATION - How do you envision this fitting with AURIX ecosystem?

4. TIMELINE - What is your target timeline for decision?

I have patent applications in preparation for the core innovations and am
happy to discuss terms once I understand Infineon's objectives.

Best regards,
Bojan Janjatović
```

---

## Risk Assessment

| Risk | Verovatnoća | Uticaj | Mitigacija |
|------|-------------|--------|------------|
| Infineon odustaje | Srednja | Nizak | Ima drugih kupaca (TI, NXP) |
| Infineon kopira bez licence | Niska | Visok | Fajluj patent ODMAH |
| Pregovori se oduže | Visoka | Srednji | Postavi deadline |
| Ponuda preniska | Visoka | Srednji | Imaj walk-away number |
| Grace period istekne | Niska | Kritičan | Fajluj do kraja januara |

---

## Walk-Away Numbers

Minimum prihvatljivo za svaku opciju:

| Opcija | Walk-Away Minimum |
|--------|-------------------|
| Non-exclusive licenca | €30,000 upfront + 1.5% royalty |
| Exclusive licenca | €200,000 upfront + 1% royalty |
| Full acquisition | €600,000 |
| Acquisition + employment | €350,000 + €80,000/god |

Ispod ovih cifara - odbij i traži druge kupce.

---

## Kontakt Log

| Datum | Smer | Sadržaj |
|-------|------|---------|
| 2026-01-XX | OUT | Email sa NDA zahtevom + link na sajt |
| 2026-01-XX | IN | Infineon zainteresovan za non-OSS IP |
| 2026-01-20 | - | Dokumentovano u ovom fajlu |
| | | |

---

## Sledeći koraci

1. **DANAS:** Odluči da li šalješ clarifying email
2. **Ova nedelja:** Pripremi provisional patent dokumente
3. **Do 2026-01-31:** Fajluj USPTO provisional
4. **Februar:** Pregovori sa patent pending statusom

---

*Poslednji update: 2026-01-20*
*Verzija: 1.0*
