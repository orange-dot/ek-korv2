# ELEKTROKOMBINACIJA - Plan za Patent

## Executive Summary

Cilj: Zaštititi ključne inovacije pre javnog objavljivanja ili traženja investitora.

```
KRITIČNO: Datum prijave = Datum prioriteta
─────────────────────────────────────────────────────────────
Sve što objaviš POSLE prijave = OK
Sve što objaviš PRE prijave = Potencijalno uništava patent

PREPORUKA: Provisional filing u roku od 30-60 dana
```

---

## Faza 1: Priprema (Nedelje 1-2)

### 1.1 Invention Disclosure Document

```
ŠTA JE OVO:
Interni dokument koji opisuje izum pre formalnog patenta.
Služi kao osnova za razgovor sa patentnim zastupnikom.

SADRŽAJ:
□ Naslov izuma
□ Imena izumitelja (svi koji su doprineli)
□ Datum koncepcije (kada je ideja nastala)
□ Problem koji se rešava
□ Opis rešenja (tekst + skice)
□ Ključne prednosti nad postojećim rešenjima
□ Poznati prior art (šta već postoji)
□ Potencijalne varijacije/alternative
□ Status razvoja (koncept/prototip/proizvodnja)
```

**Odgovornost:** Founder + Technical Lead
**Deliverable:** `01-invention-disclosure.md` za svaki patentabilni koncept

### 1.2 Identifikacija Patentabilnih Koncepata

```
KONCEPT 1: Unified Modular Power Architecture
─────────────────────────────────────────────────────────────
Opis: Jedan standardni modul (EK3, 3kW) kao gradivni element
      za sve snage od 3kW do 3MW
Novost: Radikalna granularnost - 1000 modula umesto 10
Prednost: Graceful degradation, robot swap, mass production

KONCEPT 2: Dual-Purpose Swap Station
─────────────────────────────────────────────────────────────
Opis: Robotska stanica koja istovremeno menja baterije autobusa
      I module punjača, koristeći istu infrastrukturu
Novost: Kombinacija dva swap procesa na jednoj lokaciji
Prednost: Zero truck rolls, bus kao servisna mreža

KONCEPT 3: Distributed Power Sparing
─────────────────────────────────────────────────────────────
Opis: Primena 3PAR storage koncepata na power electronics
      - Wide striping (load preko svih modula)
      - Distributed sparing (nema hot-spare, rezerva u svakom)
      - Thin provisioning (sleep mode)
Novost: Prvi put primenjeno na EV charging
Prednost: Veća pouzdanost, ravnomerno starenje

KONCEPT 4: Fleet-Integrated Maintenance Network
─────────────────────────────────────────────────────────────
Opis: Autobusi kao transportna mreža za module
      - Pokvareni modul ide u servis sa autobusom
      - Popravljen modul se vraća sa autobusom
Novost: Korišćenje postojeće flote za logistics
Prednost: Eliminacija servisnih vozila

KONCEPT 5: Predictive Swap Scheduling
─────────────────────────────────────────────────────────────
Opis: AI detektuje degradaciju kroz kontinuirani monitoring
      - Rana detekcija: trend analiza → dani/nedelje unapred
      - Tipična: anomalija tokom punjenja → sati unapred
      - Reaktivna: iznenadni kvar → minuti (ali bez downtime-a!)
      Swap se zakazuje za sledeći bus na toj ruti
Novost: Automatski odgovor na SVAKI scenario detekcije
Prednost: Zero downtime - čak i kod iznenadnog kvara
```

**Odgovornost:** Founder + Patent Attorney (konsultacija)
**Deliverable:** Prioritizovana lista koncepata za patentiranje

---

## Faza 2: Prior Art Search (Nedelje 2-4)

### 2.1 Preliminarna Pretraga (DIY)

```
BESPLATNI RESURSI:
□ Google Patents (patents.google.com)
□ Espacenet (worldwide.espacenet.com)
□ USPTO (patft.uspto.gov)
□ WIPO PatentScope (patentscope.wipo.int)

KLJUČNE REČI ZA PRETRAGU:
─────────────────────────────────────────────────────────────
• "modular EV charger" + "hot swap"
• "electric vehicle charging" + "blade server"
• "distributed power module" + "rack mount"
• "battery swap station" + "charger maintenance"
• "predictive maintenance" + "EV charging"
• "power module" + "graceful degradation"
• "3PAR" + "power electronics" (verovatno nema, ali proveri)

KONKURENTI ZA PROVERU:
─────────────────────────────────────────────────────────────
• ABB (švajcarska)
• Siemens
• Tesla Supercharger
• ChargePoint
• Tritium
• Kempower
• BYD (battery swap patenti)
• NIO (battery swap patenti)
```

**Odgovornost:** Founder ili istraživač
**Deliverable:** `02-prior-art-preliminary.md`

### 2.2 Profesionalna Prior Art Pretraga

```
KO RADI:
• Patentni zastupnik sa pristupom komercijalnim bazama
• Ili specijalizovana firma za patent search

CENA: €500-2,000 po konceptu

OUTPUT:
• Lista relevantnih patenata
• Analiza sličnosti
• Preporuka za claims formulation
• "Freedom to operate" mišljenje
```

**Odgovornost:** Patent Attorney / Search Firm
**Deliverable:** Prior Art Search Report

---

## Faza 3: Tehnička Dokumentacija (Nedelje 3-6)

### 3.1 Mehanički Dizajn - EK3 Modul

```
POTREBNI CRTEŽI:
□ Eksplodirani prikaz modula (exploded view)
□ Dimenzionisani crtež (sve mere, tolerancije)
□ Presek sa unutrašnjim komponentama
□ Konektor detalj (backplane interface)
□ Gripper interface (gde robot hvata)
□ Montaža u rack (insertion sequence)

FORMAT:
• CAD fajlovi (SolidWorks, Fusion 360, FreeCAD)
• 2D crteži u PDF (za patent application)
• ISO standard za tehničke crteže

KRITIČNE DIMENZIJE ZA DEFINISATI:
─────────────────────────────────────────────────────────────
• Modul: 100 × 300 × 44.45mm (1U) - FINALIZOVATI
• Gripper points: Lokacija, prečnik, dubina
• Konektor: Tip, pin count, raspored
• Masa: Target i tolerancija
• Sila umetanja: Max N za robot compatibility
```

**Odgovornost:** Mechanical Engineer / CAD Designer
**Deliverable:** CAD fajlovi + 2D crteži

### 3.2 Električni Dizajn

```
POTREBNE ŠEME:
□ Blok dijagram EK3 modula
□ Power stage šema (SiC topology)
□ Control board šema
□ Backplane šema (power + data distribution)
□ Rack controller šema

FORMAT:
• Schematic (KiCad, Altium, Eagle)
• PDF za patent

KRITIČNI DETALJI:
─────────────────────────────────────────────────────────────
• Topologija: LLC resonant + PFC
• Naponi: Input 400V AC, Output 50-500V DC
• Komunikacija: CAN-FD, Ethernet
• Senzori: Temperatura, struja, napon (lokacije)
```

**Odgovornost:** Electronics Engineer
**Deliverable:** Šeme + blok dijagrami

### 3.3 Softver / AI Algoritmi

```
POTREBNA DOKUMENTACIJA:
□ Flowchart: Predictive maintenance algoritam
□ Flowchart: Load distribution (wide striping)
□ Flowchart: Swap scheduling optimization
□ State machine: Modul lifecycle
□ Sequence diagram: Robot swap process

FORMAT:
• Flowcharts (draw.io, Lucidchart, Visio)
• Pseudocode za ključne algoritme
• Ne full source code (trade secret)

NAPOMENA O SOFTVERSKIM PATENTIMA:
─────────────────────────────────────────────────────────────
• U Evropi: Čist softver NIJE patentabilan
• ALI: "Technical effect" JESTE patentabilan
• Primer: "Algoritam koji smanjuje vreme swapa za 50%"
        → Tehnički efekat = patentabilno
```

**Odgovornost:** Software/AI Engineer
**Deliverable:** Flowcharts + pseudocode

### 3.4 Swap Station Layout

```
POTREBNI CRTEŽI:
□ Floor plan swap station
□ Robot rail sistem (dimenzije, putanje)
□ Module storage layout
□ Bus positioning system
□ Safety zones

KRITIČNI DETALJI:
─────────────────────────────────────────────────────────────
• Robot tip i specifikacije
• Rail dužina i tip
• Broj rack-ova po stanici
• Workflow (timing diagram)
```

**Odgovornost:** Mechanical Engineer + Systems Architect
**Deliverable:** Layout crteži + workflow dijagrami

---

## Faza 4: Patent Drafting (Nedelje 5-8)

### 4.1 Izbor Patentnog Zastupnika

```
KRITERIJUMI:
□ Iskustvo sa electro-mechanical patentima
□ Iskustvo sa power electronics / automotive
□ Može raditi PCT/EPO prijave
□ Razume startup budget

PITANJA ZA INTERVJU:
─────────────────────────────────────────────────────────────
1. Koliko patenata ste radili u power electronics?
2. Imate li iskustva sa EV charging industry?
3. Kolika je vaša success rate kod EPO?
4. Kako strukturišete fees (fixed vs hourly)?
5. Možete li raditi provisional filing brzo?

BUDŽET ZA ZASTUPNIKA:
• Konsultacija: €200-500
• Prior art search: €500-2,000
• Patent drafting: €3,000-8,000 po patentu
• Filing fees: €1,000-3,000
• Prosecution (odgovori na office actions): €500-2,000 po akciji
```

**Odgovornost:** Founder
**Deliverable:** Signed engagement letter

### 4.2 Claims Strategy

```
STRATEGIJA: Layered Claims
─────────────────────────────────────────────────────────────

BROAD CLAIMS (teško dobiti, ali vredi probati):
• "Modular power system comprising plurality of identical
   power modules arranged in standard rack format..."

MEDIUM CLAIMS (realniji):
• "System for EV charging wherein modules are hot-swappable
   by robotic means during vehicle charging operation..."

NARROW CLAIMS (backup, lako dobiti):
• "Module having dimensions of approximately 100×300×44mm
   with specific connector arrangement for blind mating..."

DEPENDENT CLAIMS (dodaju specifičnosti):
• "...wherein the robot swap time is less than 60 seconds"
• "...wherein degradation detection enables proactive replacement"
• "...wherein spare capacity is distributed across all modules"
```

**Odgovornost:** Patent Attorney + Founder
**Deliverable:** Claims draft

### 4.3 Patent Application Writing

```
STRUKTURA PATENTNOG SPISA:
─────────────────────────────────────────────────────────────

1. TITLE
   Kratak, deskriptivan

2. ABSTRACT (max 150 reči)
   Suština izuma

3. BACKGROUND
   - Tehnički problem
   - Postojeća rešenja i njihovi nedostaci

4. SUMMARY OF INVENTION
   - Kako naš izum rešava problem
   - Ključne prednosti

5. BRIEF DESCRIPTION OF DRAWINGS
   - Lista svih figura

6. DETAILED DESCRIPTION
   - Detaljan opis svakog aspekta
   - Reference na figure
   - Preferred embodiments
   - Alternative embodiments

7. CLAIMS
   - Independent claims
   - Dependent claims

8. DRAWINGS
   - Tehnički crteži po standardu
```

**Odgovornost:** Patent Attorney (drafting) + Founder (review)
**Deliverable:** Complete patent application

---

## Faza 5: Filing Strategy (Nedelja 8-10)

### 5.1 Prioritetna Prijava

```
OPCIJA A: Srbija (Najjeftinije)
─────────────────────────────────────────────────────────────
Zavod za intelektualnu svojinu RS
Takse: ~€150
Zastupnik: ~€2,000-3,000
Rok za PCT: 12 meseci

OPCIJA B: PCT Direktno (Preporučeno za global)
─────────────────────────────────────────────────────────────
WIPO Geneva (preko zastupnika)
Takse: ~€3,000
Zastupnik: ~€4,000-6,000
Nacionalne faze: 30 meseci od prioriteta

OPCIJA C: EPO Direktno
─────────────────────────────────────────────────────────────
European Patent Office
Takse: ~€1,500
Zastupnik: ~€5,000-8,000
Pokriva 38 država

PREPORUKA:
─────────────────────────────────────────────────────────────
1. Provisional u Srbiji (najbrže, najjeftinije) → €2,500
2. PCT u roku od 12 meseci → €7,000
3. Nacionalne faze po potrebi → €3,000-5,000 po zemlji
```

### 5.2 Timeline sa Rokovima

```
KRITIČNI DATUMI:
═══════════════════════════════════════════════════════════════

Dan 0: Prioritetna prijava (Srbija ili PCT)
       ↓
       OD OVOG DATUMA MOŽEŠ PRIČATI JAVNO!
       ↓
Mesec 12: ROK za PCT ako si počeo nacionalno
       ↓
Mesec 18: PCT publikacija (postaje javno)
       ↓
Mesec 30: ROK za nacionalne faze iz PCT
       ↓
Mesec 36-48: Examination, office actions
       ↓
Mesec 48-60: Grant (ako sve prođe)
```

---

## Faza 6: Kontinuirana Zaštita

### 6.1 Continuation Patents

```
Kako proširiti zaštitu:
• CIP (Continuation-in-Part) - dodaj nove features
• Divisional - odvoji različite aspekte
• Design patents - zaštiti izgled modula
```

### 6.2 Trade Secrets (Alternativa/Dopuna)

```
ŠTA DRŽATI KAO TRADE SECRET (ne patentirati):
• Specifični AI training data
• Manufacturing know-how
• Supplier relationships
• Exact BOM with prices

ZAŠTO: Patent = javno otkrivanje
       Trade secret = tajna zauvek (dok ne procuri)
```

---

## Budžet Procena

```
MINIMALNI BUDŽET (1 patent, Srbija → PCT):
═══════════════════════════════════════════════════════════════
Prior art search (DIY + konsultacija)     €500
Tehnička dokumentacija (CAD, šeme)        €2,000 (ako outsource)
Patent zastupnik - drafting               €4,000
Filing fees (Srbija prioritet)            €200
PCT filing (posle 12 meseci)              €4,000
─────────────────────────────────────────────────────────────
TOTAL YEAR 1:                             €10,700

REALNIJI BUDŽET (3 patenta, profesionalno):
═══════════════════════════════════════════════════════════════
Prior art search (profesionalna)          €3,000
Tehnička dokumentacija (full)             €5,000
Patent zastupnik - 3 patents              €15,000
Filing fees                               €5,000
Prosecution reserve                       €5,000
─────────────────────────────────────────────────────────────
TOTAL YEAR 1:                             €33,000

NACIONALNE FAZE (Year 2-3):
═══════════════════════════════════════════════════════════════
EU validation (5 zemalja)                 €10,000
USA national phase                        €8,000
China national phase                      €6,000
─────────────────────────────────────────────────────────────
TOTAL ADDITIONAL:                         €24,000
```

---

## Tim / Skill Matrix

```
ULOGA                    INTERNO/EKSTERNO    PROCENA CENE
═══════════════════════════════════════════════════════════════

1. Patent Attorney       EKSTERNO            €5,000-15,000
   - Drafting claims
   - Filing
   - Prosecution

2. Prior Art Researcher  EKSTERNO/INTERNO    €500-2,000
   - Patent database search
   - Competitor analysis

3. Technical Writer      EKSTERNO/INTERNO    €1,000-3,000
   - Invention disclosure
   - Detailed description

4. CAD Designer          EKSTERNO            €1,500-3,000
   - Mechanical drawings
   - Exploded views
   - Patent figures

5. Electronics Engineer  INTERNO/EKSTERNO    €1,000-2,000
   - Circuit schematics
   - Block diagrams

6. AI/ML Specialist     INTERNO              €0 (dokumentacija)
   - Algorithm flowcharts
   - Pseudocode

7. Patent Illustrator   EKSTERNO             €500-1,500
   - Clean up drawings
   - Patent-compliant format

8. Project Manager      INTERNO              €0
   - Koordinacija
   - Deadline tracking
```

---

## Akcioni Plan - Sumirano

```
NEDELJA 1-2:
□ Napisi Invention Disclosure za svaki koncept
□ Preliminarna prior art pretraga (DIY)
□ Kontaktiraj 3 patentna zastupnika za ponude

NEDELJA 3-4:
□ Izaberi patentnog zastupnika
□ Profesionalna prior art pretraga
□ Započni tehničku dokumentaciju

NEDELJA 5-6:
□ Završi CAD crteže
□ Završi električne šeme
□ Završi flowcharts za AI

NEDELJA 7-8:
□ Patent attorney drafts application
□ Review i iteracije
□ Finalizacija claims

NEDELJA 9-10:
□ FILING prioritetne prijave
□ Celebration! 🎉
□ Sada možeš pričati javno

MESEC 6-12:
□ Priprema za PCT
□ Dodatni patenti ako treba
□ Continuation strategy
```

---

## Sledeći Korak: ODMAH

```
DANAS:
1. NE OBJAVLJUJ NIŠTA JAVNO (blog, LinkedIn, pitch deck)
2. Zapiši datum kada je svaka ideja nastala
3. Sakupi sve skice, beleške, emailove o razvoju

OVAJ TEDEN:
1. Počni pisati Invention Disclosure (sledeći fajl)
2. Napravi listu konkurenata za prior art
3. Pošalji upit 2-3 patentna zastupnika
```

---

## Dokumenti u ovom folderu

1. **00-patent-plan.md** - Ovaj dokument
2. **01-invention-disclosure-modular-architecture.md** - Za Koncept 1
3. **02-invention-disclosure-swap-station.md** - Za Koncept 2
4. **03-invention-disclosure-distributed-sparing.md** - Za Koncept 3
5. **04-prior-art-search.md** - Rezultati pretrage
6. **05-claims-draft.md** - Draft claims za review

---

Kreirano: Januar 2026
Status: Plan
