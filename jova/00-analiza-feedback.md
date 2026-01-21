# Analiza Dr. Jove - Tehnički Saveti i Pitanja

> **Datum analize:** Januar 2026
> **Kontekst:** Feedback od Dr. Jove (akademski kontakt, ekspertiza u optimizaciji i grid sistemima)
> **Svrha:** Strukturirana analiza, mapiranje na postojeću dokumentaciju, identifikacija gapova

---

## 1. Pregled Jovinog Inputa

Dr. Jova je pružio vredan feedback koji pokriva pet ključnih tema:

| # | Tema | Tip | Prioritet |
|---|------|-----|-----------|
| 1 | Timeline i rizik | Pitanje | Visok |
| 2 | Grid integracija - geografija | Savet | Srednji |
| 3 | Micro-grid i mali proizvođači | Savet | Visok |
| 4 | Optimizacija pokrivanja/cene | Savet | Srednji |
| 5 | Robot ruta optimizacija | Savet (naučni) | Visok |

---

## 2. Detaljna Analiza Po Temama

### 2.1 PITANJE: Timeline i Rizik

> "Timeline koji si postavio mi se čini veoma ambiciozan... koliko je to realno i da li imaš neku kalkulaciju rizika"

**Jovin Uvid:** Legitimna zabrinutost. Akademska perspektiva prepoznaje potrebu za formalnom risk analizom.

**Status u Projektu:**

| Dokument | Sadržaj | Pokrivenost |
|----------|---------|-------------|
| `strategija/feasibility-analysis.md` | Scenarios (optimistic 15-20%, realistic 50-60%, pessimistic 25-30%) | Delimična |
| `patent/02-STRATEGY/FILING-STRATEGY-HYBRID.md` | Patent timeline | Delimična |

**Identifikovani Gapovi:**
1. Formalna risk matrica sa verovatnoćama
2. Mitigacione strategije za svaki rizik
3. Impact assessment (financial, technical, regulatory)
4. Contingency planning

**Akcija:** Kreiran `01-risk-matrix.md` sa kompletnom analizom.

---

### 2.2 SAVET: Grid Integracija - Geografija i Potrošači

> "Kako izvršiti povezivanje punjača na distributivne mreže - geografski i potrošački gledano, npr. industrijska zona vs. stambene četvrti, mali vs veliki potrošači"

**Jovin Uvid:** Site selection je kritičan za uspeh. Različiti tipovi lokacija imaju različite grid karakteristike, cene energije i regulatorne zahteve.

**Status u Projektu:**

| Dokument | Sadržaj | Relevantnost |
|----------|---------|--------------|
| `tehnika/inzenjersko/en/07-v2g-control.md` | Grid sync (SRF-PLL), P(f) droop, Q(V) droop | Visoka |
| `tehnika/konceptualno/en/01-v2g-grid.md` | V2G koncepti | Srednja |
| `reference/standardi-protokoli.md` | Grid codes (ENTSO-E, VDE) | Srednja |

**Dokumentovane Tehničke Mogućnosti:**
- SRF-PLL za grid sinhronizaciju (bandwidth ~20 Hz)
- P(f) droop control (2-12% per ENTSO-E)
- Q(V) droop za voltage regulation
- Frequency limits: 47.5-51.5 Hz operating range

**Identifikovani Gapovi:**

```
NEDOSTAJE: Site Selection Metodologija
═══════════════════════════════════════════════════════════════

1. INDUSTRIJSKA ZONA vs. STAMBENA ČETVRT
   ─────────────────────────────────────
   Industrijska:
   + Jači grid priključak (10-20 kV)
   + Veća tolerancija na buku/vizuelni impact
   + Često niže cene zemljišta
   - Dalje od bus ruta (povećava "deadhead" km)

   Stambena:
   + Bliže bus rutama
   + Potencijal za V2G revenue (peak shaving za kvart)
   - Slabiji grid (0.4 kV, transformatori limitirani)
   - Komunalne restrikcije (buka, estetika)

2. MALI vs. VELIKI POTROŠAČI
   ─────────────────────────────────────
   Mali (< 100 kW):
   + Jednostavnija priključenja
   + Manje paperwork-a
   - Manja pregovaračka moć za cene

   Veliki (> 1 MW):
   + Wholesale cene energije
   + Grid services revenue
   - Dugotrajni priključni procesi (6-24 meseca)
   - Potrebne studije grid impact-a

3. SCORING MODEL (PREDLOG)
   ─────────────────────────────────────
   Site_Score = w1 × Grid_Capacity
              + w2 × Route_Proximity
              + w3 × Land_Cost_Inverse
              + w4 × Regulatory_Ease
              + w5 × V2G_Potential
```

**Preporuka:** Razviti site selection framework kao dodatak tehničkoj dokumentaciji.

---

### 2.3 SAVET: Micro-grid i Mali Proizvođači

> "Razvoj distributivnih mreža... ide ka privatizaciji provajdera, uključivanje mikro-grid-ova, uključenje malih proizvođača"

**Jovin Uvid:** EU trend ka decentralizaciji energetskog sistema. Prosumer direktive, agregatorski modeli, lokalna energetska zajednica.

**Status u Projektu:**

| Dokument | Sadržaj | Relevantnost |
|----------|---------|--------------|
| `tehnika/konceptualno/en/02-roj-intelligence.md` | Distributed intelligence, peer-to-peer coordination | Visoka |
| `tehnika/inzenjersko/en/07-v2g-control.md` | Grid codes (ENTSO-E, VDE AR-N 4110) | Visoka |
| `patent/01-IP-FOUNDATION/07-invention-disclosure-v2g-control.md` | V2G patent disclosure | Srednja |

**Dokumentovane Mogućnosti:**

ROJ arhitektura je dizajnirana za decentralizaciju:
- Peer-to-peer komunikacija (CAN-FD mesh)
- Consensus-based decision making (Raft variant)
- Autonomous operation without central controller
- Grid-forming capable (island mode potential)

**Identifikovani Gapovi:**

```
NEDOSTAJE: EU Regulatorni Framework
═══════════════════════════════════════════════════════════════

1. NEMAČKA - EnWG (Energiewirtschaftsgesetz)
   ─────────────────────────────────────────
   • Prosumer prava od 2017
   • Eigenverbrauch (sopstvena potrošnja) - oslobođeno mreže
   • Direktvermarktung za male proizvođače
   • EK3 implikacija: Moguća prodaja direktno lokalnim potrošačima

2. EU - Clean Energy Package (2019)
   ─────────────────────────────────────────
   • Citizen Energy Communities
   • Renewable Energy Communities
   • Active customer rights
   • EK3 implikacija: Fleet kao "energy community"

3. AGREGATORSKI MODEL
   ─────────────────────────────────────────
   • Aggregator pools multiple small resources
   • Presents as single entity to grid operator
   • Revenue sharing with participants
   • EK3 implikacija: ROJ segments kao aggregation points

4. REGISTRACIONI WORKFLOW (NEDOSTAJE)
   ─────────────────────────────────────────
   Za malog proizvođača u DE:
   1. Registracija kod Bundesnetzagentur
   2. Marktstammdatenregister upis
   3. Smart meter installation
   4. Direktvermarktung ugovor ili FiT

   EK3 potreba: Automated compliance za svaki deployed modul
```

**Preporuka:** Dokumentovati EU regulatory landscape i aggregator integration pathway.

---

### 2.4 SAVET: Optimizacija - Pokrivanje, Povezivanje, Cena

> "Sigurno bi jedna od ideja bila optimizacija pokrivanja, povezivanja, cene. Ugovore sa lokalnim provajderima ili možda čak sa lokalnim malim proizvođačima."

**Jovin Uvid:** Business model optimization kroz pricing i partnerships.

**Status u Projektu:**

| Dokument | Sadržaj | Relevantnost |
|----------|---------|--------------|
| `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` | VRPTW-PD optimization, MILP solver | Visoka |
| `tehnika/konceptualno/en/02-roj-intelligence.md` | Battery pool optimization, dispatch algorithm | Visoka |

**Dokumentovane Optimizacije:**

1. **Fleet Logistics VRPTW-PD:**
   - Minimize weighted tardiness
   - Minimize routing cost
   - Minimize unserved penalty
   - Python/PuLP implementation provided

2. **Battery Dispatch Algorithm:**
   ```
   Score = α × |SOC - SOC_optimal|
         + β × (1 - SOH)
         + γ × (temp - 25°C)²
         + δ × cycles/4000
   ```

**Identifikovani Gapovi:**

```
NEDOSTAJE: Revenue Model i Pricing Optimization
═══════════════════════════════════════════════════════════════

1. GRID SERVICES REVENUE
   ─────────────────────────────────────────
   Frequency regulation:
   • aFRR (automatic) - €10-30/MW/h
   • mFRR (manual) - €5-15/MW/h

   Peak shaving:
   • Demand charge avoidance - €50-150/kW/year

   Voltage support:
   • Q provision - €0-5/MVAr/h (varies by grid)

2. PRICING OPTIMIZATION MODEL (PREDLOG)
   ─────────────────────────────────────────
   maximize: Revenue = Σ P_grid(t) × price(t)
                     + Σ Q_grid(t) × q_price(t)
                     + Σ freq_reg × freq_revenue
                     - Σ battery_degradation_cost

   subject to:
     Fleet SOC requirements
     Grid connection limits
     Battery health constraints

3. PARTNERSHIP STRUCTURES
   ─────────────────────────────────────────
   Local utility:
   • PPA (Power Purchase Agreement)
   • Grid services contract
   • Joint venture for V2G

   Local prosumers:
   • Peer-to-peer trading
   • Community charging rates
   • Shared infrastructure model
```

**Preporuka:** Develop grid services revenue model i partnership framework.

---

### 2.5 SAVET: Robot Ruta Optimizacija (Naučni Potencijal)

> "Priča sa robotima ostavlja puno mesta za optimizaciju pristupa i pronalaženje optimalne rute za dati set podataka. U svakom slučaju dosta otvoren problem koji bi mogao biti zanimljiv i sa čisto naučnog aspekta."

**Jovin Uvid:** Multi-robot path planning je aktivan research area. Potencijal za akademsku saradnju.

**Status u Projektu:**

| Dokument | Sadržaj | Relevantnost |
|----------|---------|--------------|
| `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` | Dual-robot architecture, coordination protocol | Visoka |
| `tehnika/inzenjersko/en/23-jezgro-rob.md` | JEZGRO-ROB microcontroller spec | Srednja |

**Dokumentovano:**

1. **Dual-Robot System:**
   - Robot A (bus-mounted): <15 kg, 5-10 kg payload
   - Robot B (station-based): 30-50 kg, 50-100 kg payload
   - Wireless coordination link
   - Handshake sequence defined

2. **Coordination Scenarios:**
   - Normal battery swap
   - Charging failure diagnosis
   - Proactive maintenance
   - Station robot failure backup

**Identifikovani Gapovi:**

```
NEDOSTAJE: Formalni Path Planning Algoritam
═══════════════════════════════════════════════════════════════

1. PROBLEM FORMULATION
   ─────────────────────────────────────────
   Multi-Agent Path Finding (MAPF) varijanta:

   Given:
   • n robots (mix of A and B types)
   • m tasks (battery swaps, module replacements, diagnostics)
   • Workspace geometry (station layout)
   • Time constraints (bus dwell time)

   Find:
   • Collision-free paths for all robots
   • Task assignment minimizing total time
   • Coordination sequences for dependent tasks

2. COMPLEXITY ANALYSIS
   ─────────────────────────────────────────
   • MAPF is NP-hard (Surynek, 2010)
   • With time windows: MAPF-T, still NP-hard
   • With dependent tasks: even harder

   Our specific constraints:
   • Robot A has limited workspace (under bus)
   • Robot B on linear rail (1D motion + arm)
   • Tasks have precedence (unlatch → extract → insert → latch)
   • Hard deadline: bus departure time

3. ALGORITHMIC APPROACHES (RESEARCH DIRECTIONS)
   ─────────────────────────────────────────
   CBS (Conflict-Based Search):
   • Good for optimal solutions
   • Exponential worst case

   ECBS (Enhanced CBS):
   • Bounded suboptimal
   • Better scalability

   PP (Prioritized Planning):
   • Fast heuristic
   • Not optimal but practical

   ICTS (Increasing Cost Tree Search):
   • Complete and optimal
   • Memory intensive

   Learning-based:
   • Reinforcement learning for coordination
   • GNN for state representation
   • Potential for adaptation to layout changes

4. SCIENTIFIC CONTRIBUTION POTENTIAL
   ─────────────────────────────────────────
   Novel aspects:
   • Heterogeneous robots (A vs B capabilities)
   • Asymmetric workspaces
   • Hard real-time constraints (bus schedule)
   • Stochastic task durations

   Publication venues:
   • ICRA (IEEE Int. Conf. Robotics and Automation)
   • IROS (Int. Conf. Intelligent Robots and Systems)
   • AAMAS (Autonomous Agents and Multi-Agent Systems)
   • Journal of AI Research
```

**Preporuka:** Formalizovati problem i razmotriti akademsku saradnju (videti `02-research-topics.md`).

---

## 3. Sumarni Pregled Gapova

| Gap | Prioritet | Effort | Preporučena Akcija |
|-----|-----------|--------|---------------------|
| Formalna risk matrica | Visok | Srednji | Kreirati `01-risk-matrix.md` ✓ |
| Site selection metodologija | Srednji | Nizak | Dodati u tehničku dokumentaciju |
| EU regulatory framework | Visok | Srednji | Istraživanje, novi dokument |
| Aggregator integration | Srednji | Srednji | Istraživanje |
| Grid services revenue model | Srednji | Srednji | Financial modeling |
| Multi-robot path planning | Visok (naučni) | Visok | Akademska saradnja |

---

## 4. Mapiranje na Postojeću Dokumentaciju

```
JOVINI SAVETI                     POSTOJEĆI DOKUMENTI
═══════════════════════════════════════════════════════════════

Grid geografija ──────────────────► 07-v2g-control.md (tehnika)
                                    • SRF-PLL implementation ✓
                                    • Droop control ✓
                                    • Grid codes ✓
                                    ✗ Site selection missing

Micro-grid/mali proizv. ─────────► 02-roj-intelligence.md
                                    • Peer-to-peer ✓
                                    • Consensus ✓
                                    • Autonomous operation ✓
                                    ✗ EU regulatory missing
                                    ✗ Aggregator model missing

Optimizacija cene ────────────────► 04-invention-disclosure-fleet.md
                                    • VRPTW-PD optimization ✓
                                    • MILP implementation ✓
                                    ✗ Revenue model missing
                                    ✗ Pricing optimization missing

Robot rute ───────────────────────► 05-invention-disclosure-robots.md
                                    • Dual-robot architecture ✓
                                    • Coordination protocol ✓
                                    ✗ Formal path planning missing
                                    ✗ Complexity analysis missing

Timeline rizik ───────────────────► feasibility-analysis.md
                                    • Scenarios ✓
                                    • Probabilities ✓
                                    ✗ Formal risk matrix missing
                                    ✗ Mitigations incomplete
```

---

## 5. Zaključak

Dr. Jovin feedback je vredan i dobro fokusiran. Njegove teme se podudaraju sa oblastima gde projekat ima jake tehničke fundamente ali nedostaje:

1. **Formalizacija** - postojeći koncepti treba formalizovati (risk matrix, path planning)
2. **Regulatorni kontekst** - EU-specific knowledge gap
3. **Business model** - tehnika dokumentovana, revenue model nije

**Prioritetne Akcije:**
1. ✓ Kreirati risk matrix (`01-risk-matrix.md`)
2. ✓ Definisati research teme (`02-research-topics.md`)
3. ✓ Pripremiti response draft (`03-response-draft.md`)

---

## Povezani Dokumenti

- `01-risk-matrix.md` - Formalna risk kalkulacija
- `02-research-topics.md` - Naučne teme za potencijalnu saradnju
- `03-response-draft.md` - Draft odgovora Dr. Jovi
