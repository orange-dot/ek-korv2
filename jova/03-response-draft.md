# Draft Odgovora - Dr. Jova

> **Status:** Draft za review
> **Datum:** Januar 2026
> **Ton:** Profesionalan, koncizan, zahvalan

---

## Email/Poruka Draft

---

**Subject:** Re: Elektrokombinacija - hvala na feedbacku + par odgovora

---

Jovo,

Hvala na detaljnom feedbacku. Tvoje tačke su tačno pogodile oblasti gde projekat ima tehničke fundamente ali nedostaje formalizacija ili širi kontekst. Evo konkretnih odgovora:

### 1. Timeline i rizik

Imaš pravo - timeline je ambiciozan. Napravio sam formalnu risk matricu:

**Top 3 rizika:**
- Cost target ($50/kW) - ostvariv tek na 100K+ volumenu, na startu je ~$90/kW
- First customer acquisition - risk aversion fleet operatora
- Key person dependency - dokumentacija u toku, tražim co-foundera

**Realniji timeline:** First revenue Q3-Q4 2027 (ne Q1-Q2). Optimistični scenario ima ~15% verovatnoću, realistični ~55%, pesimistični ~30%.

Kompletan risk matrix sa mitigacijama imam dokumentovan ako te zanima detaljnije.

### 2. Grid integracija - geografija

Dobra tačka. Tehnika za grid sync (SRF-PLL, droop control) je dokumentovana, ali site selection metodologija nije.

Razlika industrijska vs. stambena zona:
- Industrijska: jači grid (10-20 kV), ali dalje od bus ruta
- Stambena: bliže rutama, ali slabiji priključci (0.4 kV) i komunalne restrikcije

Ovo treba formalizovati kao scoring model. Na listi je.

### 3. Micro-grid i mali proizvođači

ROJ arhitektura je dizajnirana za decentralizaciju (peer-to-peer, bez centralnog kontrolera). Ali EU regulatory kontekst (EnWG, prosumer direktive, agregatorski model) nije dokumentovan.

Dobar pointer - potrebno je istražiti:
- Nemački workflow za registraciju malih proizvođača
- EU Clean Energy Package implikacije
- Agregator partnership modeli

### 4. Optimizacija cene

Fleet logistics optimizacija (VRPTW-PD) postoji sa MILP formulation i Python implementacijom. Nedostaje revenue model za grid services (frequency regulation, peak shaving).

### 5. Robot rute - naučni aspekt

Ovo je najinteresantnija tačka. Problem je varijanta MAPF (Multi-Agent Path Finding) sa:
- Heterogenim agentima (Robot A na busu, Robot B na stanici)
- Mixed workspaces (1D šina + 2D mobile)
- Hard deadlines (bus departure)
- Stohastičkim trajanjima

Formalizovao sam problem statement. Ima potencijala za:
- Complexity analysis (NP-hard, reduction from standard MAPF)
- CBS extension za heterogeneous capabilities
- Eventual publication (ICRA, IROS)

**Pitanje:** Da li bi te zanimala neformalna diskusija o ovome? Bez obaveza - samo da čujem tvoje mišljenje o formulaciji i potencijalnim pristupima.

---

### Predlog za naredne korake

Ako imaš vremena i interesa:

1. **Kratkoročno:** 30-min call da prodiskutujemo robot optimization formulaciju
2. **Srednjeročno:** Feedback na risk assessment (ako te zanima business strana)
3. **Dugoročno:** Eventualno mentorstvo za master studenta ako nađemo pravu temu

Naravno, potpuno neobavezujuće. Cenim tvoje vreme i ekspertizu.

---

Hvala još jednom,
Bojan

---

## Attachment Options

| Dokument | Za Priložiti? | Razlog |
|----------|---------------|--------|
| 00-analiza-feedback.md | Ne | Interno - previše detalja |
| 01-risk-matrix.md | Opciono | Ako traži detalje |
| 02-research-topics.md | Da (sažetak) | Relevantno za diskusiju |
| 03-response-draft.md | Ne | Ovo je sam draft |

**Preporuka:** Poslati samo email iznad. Ako Jova izrazi interest za detalje, tada podeliti specifične dokumente.

---

## Alternative Verzije

### Kraća verzija (ako je formalnija komunikacija)

```
Jovo,

Hvala na feedbacku. Ukratko:

1. Timeline rizik: Formalizovana matrica postoji. Realniji target
   je Q3-Q4 2027 za first revenue.

2. Grid geografija: Tehnika dokumentovana, site selection nije -
   na todo listi.

3. Micro-grid: ROJ podržava, EU regulativa nedostaje u dokumentaciji.

4. Robot optimizacija: MAPF varijanta, formalizovano.
   Interesuje me tvoje mišljenje.

Da li imaš vremena za kratak call?

Bojan
```

### Duža verzija (ako je potrebno više konteksta)

Koristiti full email iznad + priložiti 02-research-topics.md (ili summary).

---

## Follow-up Topics (za eventualni call)

1. **MAPF formulation feedback:**
   - Da li je heterogeneous agent aspect dovoljno nov?
   - Koji algoritamski pristup preporučuješ?

2. **Publication strategy:**
   - ICRA vs IROS vs RA-L?
   - Da li je industrial application paper ili theoretical contribution?

3. **Collaboration model:**
   - Neformalno (discussion partner) vs student project?
   - Postoji li interest za joint work?

4. **Academic network:**
   - Ko još radi na MAPF sa industrial applications?
   - Relevant EU projects (Horizon Europe)?

---

## Notes for Myself

- Jova je jasno rekao "neformalno" - ne forsirati formalniju saradnju
- Focus na konkretne odgovore, ne na prodaju projekta
- Ostaviti otvorena vrata za dalju diskusiju
- Biti zahvalan ali ne pretrano
