# Otkrivanje Izuma: Ekosistem Zamene Baterija za Više Tipova Vozila

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Otkrivanja | EK-2026-009 |
| Datum Otkrivanja | 04.01.2026. |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilića 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 04.01.2026. |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Nastavak filozofije modularnosti sa EK3 modula punjača na baterije vozila. Ključni uvid: ista robotska swap infrastruktura može rukovati standardizovanim baterijama za više tipova vozila (autobusi, kamioni, kombiji), stvarajući ekonomiju deljenog pool-a baterija sa V2G prihodima.

---

## 1. Naslov Izuma

**Standardizovani Modularni Baterijski Sistem za Više Klasa Vozila sa ROJ-Koordiniranim Upravljanjem Baterijama i Deljenjem Pool-a**

Alternativni naslovi:
- Univerzalni Standard Baterijskih Modula za Flote Teških Komercijalnih Vozila
- Cross-Operator Sistem Pool-a Baterija sa AI-Optimizovanim Dispečingom
- ROJ BMS Arhitektura za Zamenljive Baterije Vozila

---

## 2. Opis Problema

### Trenutno Stanje

```
BATERIJE ELEKTRIČNIH VOZILA DANAS:
──────────────────────────────────
• Svaki model vozila = jedinstveni baterijski paket
• Svaki proizvođač = proprietary BMS
• Baterija zaključana u vozilu ceo životni vek
• Zamena = procedura specifična za vozilo
• Nema interoperabilnosti između operatora

TEŠKA KOMERCIJALNA VOZILA:
──────────────────────────────────
• Autobusi: 300-500 kWh fiksne baterije
• Kamioni: 400-800 kWh fiksne baterije
• Penalizacija težine: Dodatnih 2-4 tone
• Vreme punjenja: 2-4 sata
• Downtime vozila: Značajan dnevni prozor
```

### Problem

```
1. PARADOKS TEŽINE
   Velika baterija → Teško vozilo → Potrebna još veća baterija
   Rezultat: 30-50% korisnog tereta izgubljeno na težinu baterije

2. PARADOKS ISKORIŠĆENJA
   Velika baterija dimenzionisana za najgori slučaj (duge rute)
   Većina ruta koristi samo 30-50% kapaciteta
   Rezultat: Skup kapacitet koji stoji neiskorišćen

3. ZAKLJUČAN KAPITAL
   Cena baterije = 40% cene vozila
   Baterija zaključana u vozilu 8-10 godina
   Nema načina da se monetizuje neiskorišćen kapacitet

4. DUPLIRANJE INFRASTRUKTURE
   Autobuski operatori, kamionske kompanije, dostavne flote
   Svako gradi svoju infrastrukturu za punjenje
   Nema deljenja, nema pool-a, nema ekonomije obima

5. PROPRIETARY FRAGMENTACIJA
   Tesla baterije ≠ BYD baterije ≠ CATL baterije
   Nema standardizacije → Nema ekosistema
```

---

## 3. Sažetak Izuma

```
PARADIGMA MALA BATERIJA + ČESTA ZAMENA:
═══════════════════════════════════════════════════════════════════

UMESTO:                            RADIMO:
Velika 400 kWh baterija     →      Mala 100 kWh baterija
2 sata punjenja             →      5 minuta zamene
Baterija zaključana u vozilu→      Pool baterija se deli
BMS po vozilu               →      ROJ-koordinirani BMS
Jedan operator              →      Multi-operator pool


STANDARDIZOVANA EK-BAT FAMILIJA:
═══════════════════════════════════════════════════════════════════

    EK-BAT-25              EK-BAT-50              EK-BAT-100
    ─────────              ─────────              ──────────
    25 kWh                 50 kWh                 100 kWh
    150 kg                 300 kg                 600 kg
    400V                   400V                   800V

    KOMBIJI                AUTOBUSI               KAMIONI
    ▓▓▓                    ▓▓▓▓▓                  ▓▓▓▓▓▓▓▓▓
    2 modula               2-3 modula             4 modula
    50 kWh ukupno          100-150 kWh            400 kWh


MULTI-VEHICLE SWAP STANICA:
═══════════════════════════════════════════════════════════════════

         ┌──────────────────────────────────────────────────────┐
         │                  SWAP STANICA                        │
         │                                                      │
         │   KOMBI BAY      AUTOBUS BAY      KAMION BAY        │
         │    ┌─────┐        ┌───────┐        ┌─────────┐      │
         │    │     │        │       │        │         │      │
         │    │KOMBI│        │AUTOBUS│        │ KAMION  │      │
         │    │     │        │       │        │         │      │
         │    └──┬──┘        └───┬───┘        └────┬────┘      │
         │       │               │                 │            │
         │       ▼               ▼                 ▼            │
         │    ═══════════════════════════════════════           │
         │                 ROBOT ŠINA                           │
         │    ═══════════════════════════════════════           │
         │                      │                               │
         │    ┌─────────────────┴─────────────────┐            │
         │    │         DELJENI POOL BATERIJA     │            │
         │    │                                   │            │
         │    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │            │
         │    │  │BAT25│ │BAT50│ │BAT50│ │BAT100││            │
         │    │  └─────┘ └─────┘ └─────┘ └─────┘ │            │
         │    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │            │
         │    │  │BAT25│ │BAT50│ │BAT100│ │BAT100││            │
         │    │  └─────┘ └─────┘ └─────┘ └─────┘ │            │
         │    │                                   │            │
         │    └─────────────────┬─────────────────┘            │
         │                      │                               │
         │    ┌─────────────────┴─────────────────┐            │
         │    │       EK3 MODULI PUNJAČA          │            │
         │    │    (punjenje pool-a + V2G)        │            │
         │    └───────────────────────────────────┘            │
         │                                                      │
         └──────────────────────────────────────────────────────┘
```

### Ključni Elementi Inovacije

```
ELEMENT 1: Standardizovana Familija Baterijskih Modula
─────────────────────────────────────────────────────────────
• TRI veličine pokrivaju SVE klase teških vozila
• Zajednički mehanički interfejs (tačke hvatanja za robota)
• Zajednički električni interfejs (konektor, opseg napona)
• Zajednički BMS protokol (CAN-FD, ROJ-ready)
• Bilo koja baterija → Bilo koje vozilo (iste klase)

ELEMENT 2: ROJ-Koordinirani BMS
─────────────────────────────────────────────────────────────
• Svaki modul baterije = autonomni BMS agent
• Ista MCU arhitektura kao EK3 moduli punjača
• Učestvuje u roju stanice kada je u pool-u
• Učestvuje u roju vozila kada je instaliran
• Besprekorna primopredaja između rojeva

ELEMENT 3: Ekonomija Deljenog Pool-a
─────────────────────────────────────────────────────────────
• Više operatora deli isti pool baterija
• Baterije u vlasništvu pool-a, iznajmljuju se operatorima
• Naplata po potrošnji (kWh)
• Podela rizika kroz flotu
• V2G prihod se deli proporcionalno

ELEMENT 4: AI-Optimizovani Dispečing Baterija
─────────────────────────────────────────────────────────────
• AI bira optimalne baterije za svako vozilo
• Faktori: SOC, SOH, temperatura, zahtevi rute
• Balansiranje habanja kroz celu flotu
• Dodela ruta zasnovana na zdravlju
• Integracija prediktivnog održavanja

ELEMENT 5: Integrisane V2G Operacije
─────────────────────────────────────────────────────────────
• Pool baterija = Virtuelna Elektrana
• Neiskorišćene baterije pružaju mrežne usluge
• Prihod dok čekaju dispatch
• 30-50% pool-a dostupno za V2G u bilo kom trenutku
• Dodatnih €100-200k/godišnje po stanici
```

---

## 4. Detaljan Opis

### 4.1 Specifikacije Baterijskih Modula

```
EK-BAT-25 (Modul za Kombije):
═══════════════════════════════════════════════════════════════════
• Kapacitet: 25 kWh
• Napon: 400V nominalno (350-450V opseg)
• Težina: 150 kg
• Dimenzije: 600 × 400 × 300 mm
• Hemija: LFP (LiFePO4)
• C-rate: 2C punjenje (50 kW), 3C pražnjenje (75 kW)
• Životni vek ciklusa: >4.000 @ 80% DoD
• Hlađenje: Tečno (deljena petlja)

Ciljna vozila:
• Dostavni kombiji (2 modula = 50 kWh)
• Mali kamioni (klasa 3,5t)
• Mikro-tranzitna vozila


EK-BAT-50 (Modul za Autobuse):
═══════════════════════════════════════════════════════════════════
• Kapacitet: 50 kWh
• Napon: 400V nominalno (350-450V opseg)
• Težina: 300 kg
• Dimenzije: 900 × 600 × 300 mm
• Hemija: LFP (LiFePO4)
• C-rate: 2C punjenje (100 kW), 3C pražnjenje (150 kW)
• Životni vek ciklusa: >4.000 @ 80% DoD
• Hlađenje: Tečno (deljena petlja)

Ciljna vozila:
• Gradski autobusi (2 modula = 100 kWh)
• Regionalni autobusi (3 modula = 150 kWh)
• Srednji kamioni (klasa 7,5-16t)


EK-BAT-100 (Modul za Teške Kamione):
═══════════════════════════════════════════════════════════════════
• Kapacitet: 100 kWh
• Napon: 800V nominalno (700-900V opseg)
• Težina: 600 kg
• Dimenzije: 1200 × 800 × 400 mm
• Hemija: LFP (LiFePO4)
• C-rate: 2C punjenje (200 kW), 3C pražnjenje (300 kW)
• Životni vek ciklusa: >4.000 @ 80% DoD
• Hlađenje: Tečno (deljena petlja)

Ciljna vozila:
• Tegljači (4 modula = 400 kWh)
• Teški autobusi (zglobni, na sprat)
• Rudarska/građevinska vozila
```

### 4.2 ROJ BMS Arhitektura

```
TRADICIONALNI BMS                    EK-BAT SWARM BMS
═══════════════════════════════════════════════════════════════════

FIKSNA VEZA:                        FLUIDNA VEZA:
┌─────────────┐                     ┌─────────────┐
│   VOZILO    │                     │   VOZILO    │
│   ┌─────┐   │                     │   ┌─────┐   │
│   │ BMS │   │                     │   │Swap │   │◄── Vozilo samo
│   │─────│   │                     │   │Slot │   │    obezbeđuje
│   │BATT │   │                     │   └──┬──┘   │    power bus
│   │     │   │                     │      │      │
│   │(za- │   │                     │      ▼      │
│   │uvek)│   │                     └──────┼──────┘
│   └─────┘   │                            │
└─────────────┘                     ┌──────┴──────┐
                                    │  EK-BAT     │◄── Baterija ima
                                    │  MODUL      │    kompletni BMS
                                    │   ┌─────┐   │
                                    │   │ BMS │   │    Radi bilo gde:
                                    │   │─────│   │    • U vozilu
                                    │   │Ćelije│  │    • U pool-u
                                    │   └─────┘   │    • U V2G modu
                                    └─────────────┘


BMS SWARM KOMUNIKACIJA:
═══════════════════════════════════════════════════════════════════

Kada je U VOZILU:                   Kada je U POOL-U:
├── Izveštava vozilu preko CAN     ├── Izveštava roju stanice
├── Prima komande snage            ├── Prima komande punjenja
├── Lokalno balansiranje ćelija    ├── Učestvuje u V2G
├── Termalno upravljanje           ├── Izveštavanje o zdravlju
└── Praćenje energije rute         └── Dostupnost za dispatch

SEKVENCA PRIMOPREDAJE (Pool → Vozilo):
─────────────────────────────────────────────────────────────────
T-0:    Baterija u pool roju (punjenje/V2G)
T+10s:  Robot počinje uklanjanje iz pool-a
        Baterija emituje LEAVING_POOL
        Roj stanice potvrđuje
T+30s:  Baterija u tranzitu (standalone mod)
T+45s:  Baterija umetnuta u vozilo
        Baterija emituje JOINING_VEHICLE
        Roj vozila potvrđuje
T+60s:  Baterija potpuno integrisana
        Prima komande snage od vozila
```

### 4.3 Ekonomija Multi-Operator Pool-a

```
TRADICIONALNI MODEL                 MODEL DELJENOG POOL-A
═══════════════════════════════════════════════════════════════════

OPERATOR A:                         OPERATOR POOL-A:
• Kupuje 50 autobusa                • Poseduje pool baterija
• Kupuje 50 baterija (€3M)          • Poseduje swap stanice
• Kupuje 50 punjača                 • Pruža BaaS (Battery-as-Service)
• Snosi sav rizik
                                    OPERATOR A:
OPERATOR B:                         • Kupuje 50 autobusa (bez baterija!)
• Kupuje 30 kamiona                 • Plaća €0,15/kWh potrošnje
• Kupuje 30 baterija (€2,4M)        • Nema capex za baterije
• Kupuje 30 punjača
• Snosi sav rizik                   OPERATOR B:
                                    • Kupuje 30 kamiona (bez baterija!)
                                    • Plaća €0,15/kWh potrošnje
UKUPNO:                             • Nema capex za baterije
• €5,4M u baterijama
• €2M u punjačima                   EKONOMIJA POOL-A:
• 2 odvojene operacije              • 100 baterija (deljene) = €4M
• Deljenje nemoguće                 • Opslužuje 80+ vozila
                                    • 20% manje baterija potrebno
                                    • V2G prihod pokriva troškove


MODEL NAPLATE:
═══════════════════════════════════════════════════════════════════

TIER 1: Samo Energija (€0,15/kWh)
• Plaćanje po potrošenoj energiji
• Pogodno za flote niske iskorišćenosti
• Bez obaveza

TIER 2: Pretplata (€500/vozilo/mesec)
• Neograničene zamene
• Prioritetni dispatch
• Pogodno za flote visoke iskorišćenosti

TIER 3: Udeo u Pool-u (€50k ulaganje)
• Vlasnički udeo u pool-u
• Deo V2G prihoda
• Pogodno za velike operatore
```

### 4.4 AI Optimizacija Dispečinga

```
ALGORITAM DISPEČINGA:
═══════════════════════════════════════════════════════════════════

ULAZ:
• Vozilo koje dolazi (ID, sledeća ruta, potrebna energija)
• Stanje pool-a (ID baterija, SOC, SOH, temperatura)
• Stanje mreže (cena, potrebe regulacije frekvencije)

IZLAZ:
• Selekcija baterija za vozilo
• Plan V2G učešća za neiskorišćene baterije


CILJEVI OPTIMIZACIJE:
─────────────────────────────────────────────────────────────────

minimize: f(dispatch) =
    w₁ × Σ(SOC_target - SOC_i)²      # Održavanje uniformnog SOC
  + w₂ × Σ(1/SOH_i) × E_dispatch_i   # Zaštita degradiranih baterija
  + w₃ × Σ(T_i - T_optimal)²         # Termalna optimizacija
  + w₄ × Σ(cycles_i × E_i)           # Balansiranje habanja kroz flotu
  + w₅ × V2G_opportunity_cost        # Ne propustiti mrežni prihod

ograničenja:
    E_selected ≥ route_energy × 1,2  # Sigurnosna margina
    SOC_selected > SOC_min           # Minimalna napunjenost
    T_selected < T_max               # Termalni limiti


PRIMER DISPATCH ODLUKE:
─────────────────────────────────────────────────────────────────

Autobus #47 dolazi, treba 80 kWh za sledeću rutu.

Stanje pool-a:
┌─────────┬─────────┬─────────┬──────────┬────────────────────┐
│ Baterija│ SOC (%) │ SOH (%) │ Temp (°C)│ Dispatch Bodovi    │
├─────────┼─────────┼─────────┼──────────┼────────────────────┤
│ BAT-12  │ 82      │ 98      │ 28       │ 0.15 (IZABRANA)    │
│ BAT-07  │ 85      │ 96      │ 25       │ 0.18 (IZABRANA)    │
│ BAT-23  │ 90      │ 95      │ 30       │ 0.22               │
│ BAT-41  │ 95      │ 92      │ 32       │ 0.28 (prepuna)     │
│ BAT-03  │ 65      │ 88      │ 35       │ 0.45 (degradirana) │
│ BAT-19  │ 40      │ 75      │ 22       │ 0.82 (nizak SOH)   │
└─────────┴─────────┴─────────┴──────────┴────────────────────┘

Odluka:
• Dispatch BAT-12 + BAT-07 za Autobus #47
• BAT-23, BAT-41 → V2G učešće
• BAT-03, BAT-19 → Sporo punjenje, samo lake rute
```

### 4.5 V2G Integracija

```
POOL BATERIJA KAO VIRTUELNA ELEKTRANA:
═══════════════════════════════════════════════════════════════════

                    ┌──────────────────┐
                    │  MREŽNI OPERATOR │
                    │     (DSO/TSO)    │
                    └────────┬─────────┘
                             │ Cenovni signali
                             │ Regulacija frekvencije
                             │ Zahtevi za kapacitetom
                             ▼
         ┌───────────────────────────────────────┐
         │          KONTROLER POOL-A             │
         │   • Agregira sve baterije             │
         │   • Licitira na energetskim tržištima │
         │   • Upravlja balansom V2G/dispatch    │
         └───────────────────┬───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │STANICA 1│        │STANICA 2│        │STANICA 3│
    │         │        │         │        │         │
    │50 bat.  │        │30 bat.  │        │40 bat.  │
    │25 V2G   │        │15 V2G   │        │20 V2G   │
    └─────────┘        └─────────┘        └─────────┘


KALKULACIJA V2G PRIHODA:
═══════════════════════════════════════════════════════════════════

Stanica sa 50 × EK-BAT-50 baterija:
• Ukupan kapacitet: 2.500 kWh
• Prosečna dostupnost za V2G: 50% = 1.250 kWh
• Efektivna V2G snaga: 6 MW (na 2C)

Tokovi prihoda:
1. Smanjenje vršnog opterećenja (4h/dan × €0,15/kWh razlika)
   1.250 kWh × 4h × €0,15 × 365 = €273.750/godišnje

2. Regulacija frekvencije (€10/MW/sat × 8h/dan)
   6 MW × €10 × 8h × 365 = €175.200/godišnje

3. Plaćanje kapaciteta (€30/kW/godišnje)
   6.000 kW × €30 = €180.000/godišnje

UKUPAN V2G PRIHOD: €628.950/godišnje po stanici!
(Značajno pokriva operativne troškove pool-a)
```

---

## 5. Prednosti u Odnosu na Postojeća Rešenja

```
PREDNOST 1: Univerzalni Standard
─────────────────────────────────────────────────────────────
Postojeća rešenja: Svaki OEM koristi proprietary format baterija
Ovaj izum: Tri standardne veličine za sva teška vozila
Rezultat: Benefiti ekosistema, konkurencija dobavljača, niži troškovi

PREDNOST 2: ROJ BMS
─────────────────────────────────────────────────────────────
Postojeća rešenja: Fiksna veza BMS-baterija-vozilo
Ovaj izum: BMS baterije radi nezavisno
Rezultat: Bilo koja baterija može služiti bilo kom vozilu, fleksibilnost pool-a

PREDNOST 3: Ekonomija Deljenog Pool-a
─────────────────────────────────────────────────────────────
Postojeća rešenja: Svaki operator poseduje svoje baterije
Ovaj izum: Vlasništvo pool-a sa naplatom po potrošnji
Rezultat: 20-30% manje baterija potrebno, podela rizika

PREDNOST 4: AI-Optimizovani Dispečing
─────────────────────────────────────────────────────────────
Postojeća rešenja: Nasumična ili FIFO selekcija baterija
Ovaj izum: Dispatch svestan zdravlja i rute
Rezultat: Produžen životni vek baterija, optimalna iskorišćenost

PREDNOST 5: Integracija V2G Prihoda
─────────────────────────────────────────────────────────────
Postojeća rešenja: Baterije stoje neiskorišćene kada nisu u vozilu
Ovaj izum: Neiskorišćene baterije zarađuju V2G prihod
Rezultat: Dodatnih €100-200k/stanici/godišnje prihoda

PREDNOST 6: Smanjenje Težine
─────────────────────────────────────────────────────────────
Postojeća rešenja: Vozilo nosi pun dnevni energetski kapacitet
Ovaj izum: Vozilo nosi samo kapacitet za segment
Rezultat: 1.500-2.500 kg uštede = više korisnog tereta
```

---

## 6. Zahtevi za Zaštitu (Nacrt)

```
NEZAVISNI ZAHTEV 1 (Sistem):
Baterijski sistem za električna vozila koji obuhvata:
• Familiju standardizovanih baterijskih modula više kapaciteta;
• Gde svaki baterijski modul sadrži kompletan sistem upravljanja
  baterijom sposoban za autonoman rad;
• Deljeni pool baterija dostupan više operatora vozila;
• Robotske swap stanice konfigurisane za razmenu baterijskih modula
  između pool-a i vozila;
• Gde sistemi upravljanja baterijama formiraju koordiniranu ROJ
  mrežu za optimizovani dispatch i mrežne usluge.

NEZAVISNI ZAHTEV 2 (Metoda):
Metoda za operacije flota električnih vozila koja obuhvata:
• Održavanje deljenog pool-a standardizovanih baterijskih modula;
• Zamenu baterijskih modula između pool-a i vozila putem robotskih
  stanica;
• Selekciju baterija za dispatch na osnovu stanja napunjenosti,
  stanja zdravlja, termalnog stanja i zahteva rute;
• Pružanje mrežnih usluga koristeći pool baterije koje nisu odmah
  potrebne za dispatch vozila.

NEZAVISNI ZAHTEV 3 (Baterijski Modul):
Baterijski modul za upotrebu u više vozila koji obuhvata:
• Standardizovani form factor sa mehaničkim tačkama hvatanja za robota;
• Standardizovani električni interfejs za priključenje napajanja;
• Integrisani sistem upravljanja baterijom sa CAN-FD interfejsom;
• Sposobnost ROJ koordinacije za učešće u mreži baterija stanice ili
  vozila;
• Bidirekcionalnu sposobnost napajanja za V2G operacije.

ZAVISNI ZAHTEVI:
• ...gde familija baterija obuhvata varijante kapaciteta 25 kWh, 50 kWh
  i 100 kWh
• ...gde se dispatch baterija optimizuje korišćenjem AI razmatrajući
  SOC, SOH, temperaturu i energetske zahteve rute
• ...gde više operatora vozila deli resurse pool-a
  sa naplatom zasnovanom na potrošnji
• ...gde neiskorišćene baterije učestvuju u regulaciji frekvencije mreže
  i smanjenju vršnog opterećenja
• ...gde se baterijski moduli besprekorno prebacuju između roja stanice
  i roja vozila tokom operacija zamene
```

---

## 7. Status Razvoja

```
☑ Koncept definisan (trenutno)
☑ Povezana postojeća rešenja: EK3 modularni punjač, patent swap stanice
□ Proof of concept izgrađen
□ Prototip testiran
□ Pilot proizvodnja
□ Komercijalna proizvodnja

ZAVISNOSTI:
• EK3 modularni punjač (EK-2026-001) - Temeljna tehnologija
• Swap stanica (EK-2026-002) - Robotska infrastruktura
• Distribuirano spariranje (EK-2026-003) - ROJ koncepti
• Logistika flote (EK-2026-004) - Multi-operator integracija
```

---

## 8. Tržišni Potencijal

```
ADRESABILNO TRŽIŠTE:
═══════════════════════════════════════════════════════════════════

Evropa Teška Komercijalna Vozila:
• Električni autobusi: 50.000 jedinica do 2030.
• Električni kamioni: 100.000 jedinica do 2030.
• Prosečna baterija: 200 kWh ekvivalent

TAM Baterija: 150.000 × 200 kWh × €150/kWh = €4,5 milijarde

TAM Swap Infrastrukture: €500M (stanice, roboti)

KONKURENTSKI JOB:
• Mrežni efekti (više vozila → više stanica → više vozila)
• Lock-in standardizacije (EK-BAT postaje industrijski standard)
• Prednost V2G prihoda (konkurenti ne integrišu)
```

---

## 9. Potpisi

```
PRONALAZAČ(I):

Ime: _________________________
Potpis: ______________________
Datum: _______________________


SVEDOK:

Ime: _________________________
Potpis: ______________________
Datum: _______________________
```
