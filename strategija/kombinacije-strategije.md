# Kombinacije strategija razvoja EV punjača: optimizirani scenariji

## Pregled

Ovaj dokument predstavlja **8 optimiziranih kombinacija** koje uzimaju najbolje elemente iz svih tehničkih opcija i adresiraju ključne tržišne izazove. Svaka kombinacija je dizajnirana za specifični kontekst i ciljeve.

---

## Ključni izazovi koje kombinacije moraju riješiti

| Izazov | Opis | Kritičnost |
|--------|------|------------|
| **EXPO 2027** | 100 e-buseva za Beograd, rok svibanj 2027 | ★★★★★ |
| **Grid kapacitet** | Depoi zahtijevaju 2-20 MW, upgrade 12-24 mjeseca | ★★★★★ |
| **Interoperabilnost** | 20-30% charging failure rate u nekim deploymentima | ★★★★☆ |
| **Certifikacija** | CE/UL proces 6-12 mjeseci, €100-250k | ★★★★☆ |
| **Lokalni sadržaj** | EBRD/EU fondovi preferiraju regionalnu proizvodnju | ★★★☆☆ |
| **V2G regulativa** | EU AFIR zahtjevi, grid services potencijal | ★★★☆☆ |
| **TCO konkurentnost** | BEB 15-25% niži TCO od dizela do 2030 | ★★★☆☆ |
| **Skilled workforce** | Nedostatak specijalista za power electronics | ★★★☆☆ |

---

## Kombinacija 1: "Fast Follower" - Brzi ulazak s minimalnim rizikom

### Koncept
Ulazak na tržište kroz partnerstvo s etabliranim ODM proizvođačem, fokus na lokalizaciju softvera, servisa i integracije. Minimalan tehnički rizik, maksimalna brzina.

### Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    FAST FOLLOWER MODEL                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ODM Partner (Kina/Tajvan)         Vlastito (Lokalno)     │
│   ┌─────────────────────┐          ┌─────────────────────┐ │
│   │ • Power electronics │          │ • Branding/UI       │ │
│   │ • Certifikacija     │    ◄──►  │ • OCPP backend      │ │
│   │ • Kućište           │          │ • Fleet integracija │ │
│   │ • Kablovi/konektori │          │ • Instalacija       │ │
│   └─────────────────────┘          │ • Servis/održavanje │ │
│                                    │ • Lokalna podrška   │ │
│                                    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | ODM White-label | Minimalan rizik, brz time-to-market |
| Snage | 60-180 kW (depot) | Pokriva 80% potreba, izbjegava kompleksnost |
| Poluvodiči | SiC (ODM odabir) | Prepušteno partneru |
| Hlađenje | Tekuće (ODM) | Prepušteno partneru |
| Komunikacija | ISO 15118-2 + OCPP 2.0.1 | Vlastiti OCPP backend |
| Konektor | CCS2 | Europski standard |
| Softver | Vlastiti fleet management | Diferencijacija |

### Preporučeni ODM partneri

| Partner | Prednosti | Nedostaci |
|---------|-----------|-----------|
| **Delta Electronics** (Tajvan) | Kvaliteta, EU prisutnost | Veće MOQ |
| **SETEC Power** (Kina) | Fleksibilnost, cijena | Potrebna CE certifikacija |
| **Infypower** (Kina) | Modularnost | Manje poznato ime |
| **Phihong** (Tajvan) | OEM iskustvo | Fokus na manje snage |

### Financijski profil

| Stavka | Iznos |
|--------|-------|
| Inicijalna investicija | €200,000 - 400,000 |
| Vrijeme do prvog proizvoda | 4-6 mjeseci |
| Marža po punjaču | 15-25% |
| Break-even volumen | ~30 punjača |
| Tim | 3-5 osoba |

### Rizici i mitigacije

| Rizik | Vjerojatnost | Mitigacija |
|-------|--------------|------------|
| Ovisnost o dobavljaču | Visoka | Ugovor s više ODM-ova |
| Kvaliteta proizvoda | Srednja | Factory audit, QC protokol |
| Dostupnost dijelova | Srednja | Buffer stock kritičnih komponenti |
| Diferencijacija | Visoka | Fokus na softver i servis |

### Kada odabrati

✅ **Idealno za:**
- Brz ulazak na tržište (EXPO 2027 rok)
- Ograničen kapital (<€500k)
- Fokus na servis, a ne proizvodnju
- Testiranje tržišta prije veće investicije

❌ **Nije za:**
- Izgradnju dugoročne IP pozicije
- Visoke marže
- Tehničku diferencijaciju

---

## Kombinacija 2: "Regional Champion" - Zapadni Balkan fokus

### Koncept
Pozicioniranje kao regionalni lider za Zapadni Balkan, optimizirano za EBRD/EIB financiranje, lokalni sadržaj i specifične potrebe regije (grid kvaliteta, klimatski uvjeti, servisna mreža).

### Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                  REGIONAL CHAMPION MODEL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Uvoz (certificirano)          Lokalna proizvodnja        │
│   ┌─────────────────────┐      ┌─────────────────────────┐ │
│   │ • SiC power moduli  │      │ • Sistemska integracija │ │
│   │ • CCS2 konektori    │      │ • Kućište/mehanika      │ │
│   │ • ISO 15118 stack   │  ──► │ • Kablaža               │ │
│   │ • Rashladne pumpe   │      │ • Kontrolna elektronika │ │
│   └─────────────────────┘      │ • Testiranje/QC         │ │
│                                │ • Finalna montaža       │ │
│                                └─────────────────────────┘ │
│                                             │               │
│                                             ▼               │
│                                ┌─────────────────────────┐ │
│                                │ Regionalna mreža        │ │
│                                │ • Beograd HQ            │ │
│                                │ • Sarajevo servis       │ │
│                                │ • Skopje servis         │ │
│                                │ • Tirana servis         │ │
│                                └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | Hibridni (1D) | Balans brzine i lokalizacije |
| Snage | 60-150 kW depot + 300 kW opportunity | Pokriva GSP, Skopje BRT potrebe |
| AC/DC | Vienna Rectifier (kupljen modul) | Efikasnost, bez V2G kompleksnosti |
| DC/DC | LLC rezonantni (kupljen modul) | Dokazana topologija |
| Poluvodiči | SiC MOSFET moduli | Infineon/Wolfspeed |
| Hlađenje | Tekuće, vlastiti dizajn | Lokalna proizvodnja, prilagodba klimi |
| Konektor | CCS2 + pantograph opcija | Fleksibilnost |
| Softver | Vlastiti OCPP + fleet management | Diferencijacija, lokalizacija |
| Proizvodnja | Lokalna montaža, PCBA import | EBRD lokalni sadržaj |

### Ciljana tržišta i projekti

| Tržište | Projekti | Procijenjeni volumen |
|---------|----------|---------------------|
| **Srbija** | EXPO 2027, GSP ekspanzija | 50-100 punjača |
| **S. Makedonija** | Skopje BRT (100-120 buseva) | 30-50 punjača |
| **BiH** | Sarajevo trolleybus modernizacija | 15-25 punjača |
| **Kosovo** | Pristina 6 e-buseva + rast | 10-20 punjača |
| **Albanija** | Tirana e-BRT (58 buseva) | 20-30 punjača |
| **Crna Gora** | Podgorica inicijativa | 5-10 punjača |
| **Ukupno 2025-2028** | | **130-235 punjača** |

### Regionalne prilagodbe

| Izazov | Rješenje |
|--------|----------|
| **Grid nestabilnost** | Integrirani surge protection, širi naponski raspon (±15%) |
| **Ekstremne temperature** | -25°C do +45°C operativni raspon, grijanje kabineta |
| **Servisna dostupnost** | Regionalni servisni centri, 24h response SLA |
| **Jezik/UI** | Lokalizirano sučelje (SR, MK, BS, SQ) |
| **Financiranje** | EBRD/EIB compliant dokumentacija |

### Financijski profil

| Stavka | Iznos |
|--------|-------|
| Inicijalna investicija | €800,000 - 1,500,000 |
| Vrijeme do prvog proizvoda | 10-14 mjeseci |
| Marža po punjaču | 25-35% |
| Break-even volumen | ~50 punjača |
| Tim | 12-20 osoba |

### EBRD/EIB prednosti

```
┌────────────────────────────────────────────────────────────┐
│               EBRD/EIB SCORING FAKTORI                     │
├────────────────────────────────────────────────────────────┤
│ ✓ Lokalna proizvodnja/montaža        +15% score           │
│ ✓ Regionalno zapošljavanje           +10% score           │
│ ✓ Transfer tehnologije               +10% score           │
│ ✓ GHG redukcija (dokumentirano)      Obavezno             │
│ ✓ Gender equality politika           +5% score            │
│ ✓ SME status                         Povoljniji uvjeti    │
└────────────────────────────────────────────────────────────┘
```

### Kada odabrati

✅ **Idealno za:**
- Fokus na regionalno tržište (200+ punjača ukupno)
- Pristup EBRD/EIB financiranju
- Izgradnja dugoročne pozicije
- Servisna diferencijacija

❌ **Nije za:**
- Globalne ambicije
- Najnižu cijenu (kineski ODM jeftiniji)
- Vrlo brz time-to-market (<6 mj)

---

## Kombinacija 3: "Technology Platform" - Modularna skalabilna arhitektura

### Koncept
Razvoj modularne platforme s 50 kW baznim modulom koji se skalira do 600 kW. Jedan razvoj, više proizvoda. Inspiracija: Kempower, Tritium pristup.

### Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│               MODULAR PLATFORM ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   BAZNI MODUL (50 kW)                                      │
│   ┌─────────────────────────────────────────┐              │
│   │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐   │              │
│   │  │ PFC │──│DC/DC│──│Ctrl │──│Comm │   │              │
│   │  │50kW │  │50kW │  │ MCU │  │ GW  │   │              │
│   │  └─────┘  └─────┘  └─────┘  └─────┘   │              │
│   │           │                            │              │
│   │     ┌─────┴─────┐                      │              │
│   │     │  Cooling  │                      │              │
│   │     │  Module   │                      │              │
│   │     └───────────┘                      │              │
│   └─────────────────────────────────────────┘              │
│                         │                                   │
│            ┌────────────┼────────────┐                     │
│            ▼            ▼            ▼                     │
│   ┌─────────────┐ ┌──────────┐ ┌──────────────┐           │
│   │ DEPOT 50    │ │ DEPOT    │ │ OPPORTUNITY  │           │
│   │ 1× modul    │ │ 150-300  │ │   450-600    │           │
│   │ Wall-mount  │ │ 3-6 mod  │ │  9-12 mod    │           │
│   │             │ │ Cabinet  │ │  + Pantograph│           │
│   └─────────────┘ └──────────┘ └──────────────┘           │
│                                                             │
│   DINAMIČKA RASPODJELA SNAGE                               │
│   ┌─────────────────────────────────────────┐              │
│   │ 300 kW cabinet ──► 6 × 50 kW outputs    │              │
│   │   ili                                    │              │
│   │ 300 kW cabinet ──► 2 × 150 kW outputs   │              │
│   │   ili                                    │              │
│   │ 300 kW cabinet ──► 1 × 300 kW output    │              │
│   └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | In-house platforma (1A) | Dugoročna IP vrijednost |
| Bazni modul | 50 kW | Optimalan za skaliranje (50-600 kW) |
| AC/DC | Vienna Rectifier, vlastiti dizajn | Kontrola efikasnosti |
| DC/DC | LLC + opcijski DAB za V2G | Fleksibilnost |
| Poluvodiči | SiC MOSFET (Wolfspeed C3M) | Vrhunska efikasnost |
| Hlađenje | Tekuće, zajednički loop | Efikasno skaliranje |
| Komunikacija | ISO 15118-2/-20 ready | Future-proof |
| Softver | Vlastiti stack | Puna kontrola |

### Produktna linija iz jedne platforme

| Proizvod | Konfiguracija | Primjena | Cijena (procjena) |
|----------|---------------|----------|-------------------|
| **DEPOT-50** | 1 modul, zidni | Mali depoi, noćno | €15,000 |
| **DEPOT-150** | 3 modula, kabinet | Srednji depoi | €40,000 |
| **DEPOT-300** | 6 modula, kabinet | Veliki depoi | €75,000 |
| **FLEXI-300** | 6 mod, 6 izlaza | Dinamička raspodjela | €85,000 |
| **OPP-450** | 9 mod + pantograph | Opportunity charging | €180,000 |
| **OPP-600** | 12 mod + pantograph | High-power opportunity | €230,000 |

### Razvojni plan po fazama

```
FAZA 1 (mjeseci 1-8): Bazni modul 50 kW
├── Mjesec 1-2: Specifikacija, dizajn pregled
├── Mjesec 3-5: Hardware razvoj, prvi prototip
├── Mjesec 6-7: Testiranje, iteracije
└── Mjesec 8: Funkcionalni prototip 50 kW

FAZA 2 (mjeseci 9-14): DEPOT-150 proizvod
├── Mjesec 9-10: Mehanički dizajn kabineta
├── Mjesec 11-12: 3-module integracija
├── Mjesec 13: Interno testiranje
└── Mjesec 14: Pre-certifikacija

FAZA 3 (mjeseci 15-20): Certifikacija + DEPOT-300
├── Mjesec 15-18: CE certifikacija (DEPOT-150)
├── Mjesec 16-18: DEPOT-300 razvoj
├── Mjesec 19-20: Pilot instalacija
└── Mjesec 20: Početak proizvodnje

FAZA 4 (mjeseci 21-28): Opportunity charging
├── Mjesec 21-24: Pantograph integracija
├── Mjesec 25-26: OPP-450/600 testiranje
├── Mjesec 27-28: Certifikacija, lansiranje
└── Kontinuirano: Proizvodnja depot linija
```

### Financijski profil

| Stavka | Iznos |
|--------|-------|
| Inicijalna investicija (Faza 1-2) | €1,200,000 - 1,800,000 |
| Ukupna investicija (sve faze) | €2,500,000 - 4,000,000 |
| Vrijeme do prvog proizvoda | 14-16 mjeseci |
| Marža po punjaču | 35-50% |
| Break-even | ~80 modula (ekvivalent) |
| Tim | 15-25 osoba |

### Prednosti modularnog pristupa

| Prednost | Kvantifikacija |
|----------|----------------|
| Smanjeni R&D trošak | -40% vs zasebni proizvodi |
| Inventory optimizacija | 80% zajedničkih dijelova |
| Vrijeme servisa | <15 min zamjena modula |
| Skalabilnost proizvodnje | Linearna s potražnjom |
| Customer flexibility | Nadogradnja na lokaciji |

### Kada odabrati

✅ **Idealno za:**
- Dugoročnu strategiju (3-5 godina)
- Širok raspon snaga (50-600 kW)
- Visoke marže prioritet
- Tehničku diferencijaciju
- Vlastiti IP portfelj

❌ **Nije za:**
- Brz time-to-market (<12 mj)
- Ograničen budžet (<€1M)
- Samo jedan proizvod

---

## Kombinacija 4: "Smart Grid Pioneer" - V2G i grid services fokus

### Koncept
Diferencijacija kroz V2G sposobnosti i grid services, pozicioniranje za buduće EU zahtjeve (AFIR) i prihode od mreže. Depot kao virtualna elektrana.

### Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                 SMART GRID PIONEER MODEL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    GRID OPERATOR                     │  │
│   │         (EMS Srbije, ELES, MEPSO...)                │  │
│   └────────────────────────┬────────────────────────────┘  │
│                            │ Agregacija                     │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              VIRTUAL POWER PLANT (VPP)              │  │
│   │   ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │  │
│   │   │ Frequency   │  │ Peak        │  │ Energy    │  │  │
│   │   │ Regulation  │  │ Shaving     │  │ Arbitrage │  │  │
│   │   └─────────────┘  └─────────────┘  └───────────┘  │  │
│   └────────────────────────┬────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │              BIDIRECTIONAL CHARGERS                 │  │
│   │                                                      │  │
│   │   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐      │  │
│   │   │V2G 75 │  │V2G 75 │  │V2G 75 │  │V2G 75 │      │  │
│   │   │  kW   │  │  kW   │  │  kW   │  │  kW   │      │  │
│   │   └───┬───┘  └───┬───┘  └───┬───┘  └───┬───┘      │  │
│   │       │          │          │          │           │  │
│   └───────┼──────────┼──────────┼──────────┼───────────┘  │
│           ▼          ▼          ▼          ▼              │
│        ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐            │
│        │ BUS │   │ BUS │   │ BUS │   │ BUS │            │
│        │300kWh   │300kWh   │300kWh   │300kWh            │
│        └─────┘   └─────┘   └─────┘   └─────┘            │
│                                                          │
│   DEPOT = 1.2 MWh storage + 300 kW bidirectional power  │
└─────────────────────────────────────────────────────────────┘
```

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | Hibridni (1D) s fokusom na softver | V2G diferencijacija |
| Snage | 75 kW bidirekcijski moduli | Optimum za V2G operaciju |
| AC/DC | **AFE (Active Front End)** | Obavezan za 4-quadrant V2G |
| DC/DC | **DAB (Dual Active Bridge)** | Bidirekcionalnost |
| Poluvodiči | SiC MOSFET | Efikasnost kritična za V2G ekonomiku |
| Komunikacija | **ISO 15118-20** | V2G mandatory |
| Backend | Vlastiti VPP softver | Ključna diferencijacija |
| Certifikacija | **UL 9741** (V2G specifično) | Potrebno za grid services |

### V2G poslovni model

```
PRIHODI OD GRID SERVICES (procjena za 50-bus depot):

┌─────────────────────────────────────────────────────────┐
│ Usluga              │ Kapacitet │ Cijena    │ Godišnje │
├─────────────────────┼───────────┼───────────┼──────────┤
│ Frequency regulation│ 300 kW    │ €15/MW/h  │ €39,420  │
│ Peak shaving        │ 15 MWh/mj │ €50/MWh   │ €9,000   │
│ Energy arbitrage    │ 20 MWh/mj │ €30/MWh   │ €7,200   │
│ Capacity market     │ 300 kW    │ €25/kW/yr │ €7,500   │
├─────────────────────┼───────────┼───────────┼──────────┤
│ UKUPNO godišnje     │           │           │ €63,120  │
└─────────────────────────────────────────────────────────┘

ROI na V2G upgrade: ~3-4 godine
```

### ISO 15118-20 implementacija

| Komponenta | Opcija | Trošak |
|------------|--------|--------|
| Stack | Vector vAC + vlastita integracija | €50,000-80,000 |
| Stack | ChargePoint open source + razvoj | €100,000-150,000 (interno) |
| Stack | Switch EV (licenca) | €30,000-50,000 |
| PKI infrastruktura | Hubject, Gireve | €5,000-15,000/god |

### Regulatorni landscape

| Regija | V2G status | Opportunity |
|--------|------------|-------------|
| **EU** | AFIR podržava, aktivni piloti | Visoka - €2/kWh ELRP |
| **Srbija** | Zakon 12/2024, u razvoju | Srednja - rano pozicioniranje |
| **Njemačka** | §14a EnWG, grid services | Visoka - razvijeno tržište |
| **UK** | DNO flexibility services | Visoka - £10-30/MWh |

### Financijski profil

| Stavka | Iznos |
|--------|-------|
| Inicijalna investicija | €1,500,000 - 2,500,000 |
| V2G premium po punjaču | +€5,000-10,000 vs unidirekcijski |
| Vrijeme do prvog proizvoda | 16-20 mjeseci |
| Marža (hardware) | 30-40% |
| Marža (grid services) | 50-70% |
| Tim | 15-20 osoba + grid ekspert |

### Kada odabrati

✅ **Idealno za:**
- Priprema za EU AFIR zahtjeve
- Dodatni revenue stream
- Tehnološko vodstvo
- Tržišta s razvijenim grid services (DE, UK, NL)

❌ **Nije za:**
- Brz time-to-market
- Tržišta bez V2G regulacije
- Ograničen budžet
- Fokus samo na hardware

---

## Kombinacija 5: "EXPO Express" - Optimizirano za Beograd 2027

### Koncept
Maksimalno pragmatičan pristup fokusiran isključivo na isporuku za EXPO 2027. Kombinacija brzog ODM partnerstva s lokalnim servisom i postepenom lokalizacijom.

### Vremenska linija

```
2025                    2026                    2027
  │                       │                       │
  Q1  Q2  Q3  Q4         Q1  Q2  Q3  Q4         Q1  Q2
  │   │   │   │          │   │   │   │          │   │
  ├───┴───┴───┴──────────┴───┴───┴───┴──────────┴───┤
  │                                                  │
  │  [ODM selekcija]                                │
  │       │                                         │
  │       ▼                                         │
  │  [Ugovor + specifikacija]                       │
  │            │                                    │
  │            ▼                                    │
  │       [Pilot 5 punjača]──►[Evaluacija]         │
  │                                  │              │
  │                                  ▼              │
  │                        [Narudžba 50 kom]       │
  │                                  │              │
  │                                  ▼              │
  │                           [Dostava + instalacija]
  │                                       │         │
  │                                       ▼         │
  │                              [EXPO operacija]──►│
  │                                                 │
  └─────────────────────────────────────────────────┘
```

### Faze projekta

#### Faza 0: Priprema (Q1 2025)
- ODM evaluacija i selekcija
- GSP/grad koordinacija
- Grid capacity assessment lokacija
- Tender specifikacija

#### Faza 1: Pilot (Q2-Q3 2025)
- 5 punjača (3× depot 150 kW, 2× opportunity 300 kW)
- Instalacija na GSP lokacijama
- 6-mjesečna evaluacija
- Interoperability testing s Higer busevima

#### Faza 2: Ramp-up (Q4 2025 - Q2 2026)
- Narudžba 50-70 punjača
- Lokalizacija servisa, trening GSP tehničara
- Backend integracija s GSP sustavima
- Grid upgrade koordinacija

#### Faza 3: EXPO (Q3 2026 - Q2 2027)
- Puna instalacija
- 24/7 support tim
- Redundancy plan (spare punjači)
- Real-time monitoring

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | ODM + lokalni servis | Brzina + lokalna podrška |
| Snage | 150 kW depot + 300-450 kW opportunity | Prema GSP potrebama |
| Hlađenje | Tekuće (ODM) | -25°C do +40°C Beograd |
| Konektor | CCS2 depot, pantograph opportunity | Higer kompatibilnost |
| Softver | ODM + vlastiti OCPP backend | Integracija s GSP |

### Specifični zahtjevi za Higer buseve

| Bus model | Baterija | Preporučena snaga | Vrijeme punjenja |
|-----------|----------|-------------------|------------------|
| Higer Azure (12m) | 350 kWh NMC | 150 kW | 2-2.5h (20-80%) |
| Higer ultracap (12m) | 40 kWh SC | 150-300 kW | 6-7 min |
| Higer (18m) | 108 kWh SC | 300 kW | 8-10 min |

### Risk management za EXPO

| Rizik | Mitigacija | Backup plan |
|-------|------------|-------------|
| ODM kasni s isporukom | Ugovorni penali, 6 mj buffer | Alternativni ODM |
| Grid upgrade kasni | Rana koordinacija EMS | Mobile substation |
| Interoperability issues | 6-mj pilot testiranje | On-site ODM support |
| Punjač kvar za vrijeme EXPO | 10% spare punjači, 24/7 servis | Mobile charging unit |

### Financijski profil

| Stavka | Iznos |
|--------|-------|
| Pilot faza (5 punjača) | €150,000 - 250,000 |
| Glavni deployment (50-70 punjača) | €2,000,000 - 3,500,000 |
| Ukupna investicija | €2,500,000 - 4,000,000 |
| Potencijalni prihod (EXPO + GSP) | €3,500,000 - 5,000,000 |

### Kada odabrati

✅ **Idealno za:**
- EXPO 2027 fokus
- Minimalan rizik isporuke
- Brz ulazak na srpsko tržište
- Partnership s GSP Beograd

❌ **Nije za:**
- Dugoročnu IP izgradnju
- Visoke marže
- Regionalnu ekspanziju (zasebna strategija)

---

## Kombinacija 6: "CaaS Disruptor" - Charging as a Service model

### Koncept
Umjesto prodaje punjača, ponuda punjenja kao usluge. Transit agencije plaćaju po kWh ili mjesečno, bez kapitalnih izdataka. Različiti poslovni model od konkurencije.

### Arhitektura poslovnog modela

```
┌─────────────────────────────────────────────────────────────┐
│                   CaaS BUSINESS MODEL                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   CAPEX                          OPEX (transit agency)      │
│   (mi financiramo)               (mjesečna naknada)         │
│                                                             │
│   ┌─────────────────┐           ┌─────────────────────┐    │
│   │ • Punjači       │           │ • €/kWh consumed    │    │
│   │ • Instalacija   │    ──►    │   ILI               │    │
│   │ • Grid upgrade  │           │ • €/bus/mjesec      │    │
│   │ • Održavanje    │           │   ILI               │    │
│   │ • Software      │           │ • €/km operated     │    │
│   └─────────────────┘           └─────────────────────┘    │
│                                                             │
│   ROI: 5-8 godina               Benefit: Zero CAPEX        │
│   IRR: 12-18%                   Predictable OPEX           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pricing modeli

| Model | Formula | Kada koristiti |
|-------|---------|----------------|
| **Per kWh** | €0.15-0.25/kWh | Varijabilna potrošnja |
| **Per bus/mjesec** | €800-1,500/bus | Predvidljiva operacija |
| **Per km** | €0.08-0.15/km | Performance-based |
| **Hybrid** | Base + per kWh | Balans sigurnosti i fleksibilnosti |

### Financijski model (primjer: 50 buseva)

```
INVESTICIJA (naša strana):
├── Punjači (15× 150kW)             €600,000
├── Instalacija                      €150,000
├── Grid connection                  €200,000
├── Software platform                €100,000
└── UKUPNO CAPEX                   €1,050,000

GODIŠNJI TROŠKOVI:
├── Održavanje (5% CAPEX)            €52,500
├── Energija (1.5 GWh × €0.10)      €150,000
├── Osiguranje                        €15,000
├── Backend/monitoring               €20,000
└── UKUPNO OPEX                     €237,500

PRIHOD (od transit agency):
├── 50 buseva × €1,200/mj           €720,000/god
└── Energy pass-through (margin)     €75,000/god
    UKUPNO                          €795,000/god

GODIŠNJA DOBIT                      €557,500
PAYBACK                             ~2 godine
IRR (7 godina)                      ~45%
```

### Ugovorni elementi

| Element | Preporuka |
|---------|-----------|
| Trajanje | 7-10 godina (amortizacija + profit) |
| SLA uptime | 97% minimum (NEVI standard) |
| Response time | 4h kritično, 24h standardno |
| Penali | -5% mjesečne naknade po % ispod SLA |
| Eskalacija cijena | CPI indeksacija godišnje |
| Early termination | 50% preostale vrijednosti |

### Potrebno financiranje

| Izvor | Prednosti | Nedostaci |
|-------|-----------|-----------|
| **EBRD/EIB** | Niže kamate, dugi rokovi | Duga procedura |
| **Green bonds** | ESG atraktivnost | Kompleksnost emisije |
| **Infrastructure funds** | Spremnost za CaaS | Očekuju scale |
| **OEM financing** | Jednostavno | Vezanost za jednog OEM-a |
| **Leasing** | Brzo | Skuplje |

### Tehnički odabiri

| Domena | Odabir | Obrazloženje |
|--------|--------|--------------|
| Pristup | ODM ili hibrid | Fokus na uslugu, ne proizvodnju |
| Punjači | Visoka pouzdanost prioritet | SLA obveze |
| Monitoring | Real-time, predictive | Minimizacija downtime-a |
| Održavanje | Vlastiti tim ili partner | Brzina reakcije ključna |
| Softver | Vlastiti billing + analytics | Core competency |

### Kada odabrati

✅ **Idealno za:**
- Transit agencije bez CAPEX budžeta
- Dugoročne recurring revenue
- Asset-light konkurenti
- Kombinacija s grid services

❌ **Nije za:**
- Brz cash flow (dugi payback)
- Bez pristupa financiranju
- Neiskusne operatore

---

## Kombinacija 7: "Dual Track" - Paralelni razvoj depot + opportunity

### Koncept
Istovremeni razvoj dvije produktne linije: jednostavniji depot punjači (brz time-to-market) i sofisticiraniji opportunity punjači (viša vrijednost). Depot financira opportunity R&D.

### Arhitektura

```
┌─────────────────────────────────────────────────────────────┐
│                    DUAL TRACK STRATEGY                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   TRACK A: DEPOT (Quick Win)     TRACK B: OPPORTUNITY      │
│   ┌─────────────────────┐       ┌─────────────────────────┐│
│   │ Mjesec 0-10:        │       │ Mjesec 0-6:             ││
│   │ • ODM partnerstvo   │       │ • Specifikacija         ││
│   │ • Lokalizacija      │       │ • Architecture design   ││
│   │ • Certifikacija     │       │                         ││
│   │                     │       │ Mjesec 6-14:            ││
│   │ Mjesec 10:          │       │ • Modul razvoj          ││
│   │ ★ DEPOT LAUNCH      │       │ • Pantograph integracija││
│   │                     │       │                         ││
│   │ Mjesec 10-24:       │       │ Mjesec 14-20:           ││
│   │ • Sales ramp        │  $$$  │ • Testiranje            ││
│   │ • Cash generation ──┼──────►│ • Certifikacija         ││
│   │ • Market presence   │       │                         ││
│   │                     │       │ Mjesec 20:              ││
│   │                     │       │ ★ OPPORTUNITY LAUNCH    ││
│   └─────────────────────┘       └─────────────────────────┘│
│                                                             │
│   Synergije:                                                │
│   • Zajednički OCPP backend                                 │
│   • Zajednička servisna mreža                               │
│   • Cross-selling postojećim klijentima                     │
│   • Brand awareness                                         │
└─────────────────────────────────────────────────────────────┘
```

### Track A: Depot punjači (Quick Win)

| Aspekt | Specifikacija |
|--------|---------------|
| Pristup | ODM white-label + lokalizacija |
| Snage | 60, 120, 180 kW |
| Time-to-market | 8-10 mjeseci |
| Investicija | €300,000-500,000 |
| Ciljna marža | 20-30% |
| Volumen Y1 | 30-50 punjača |

### Track B: Opportunity punjači (High Value)

| Aspekt | Specifikacija |
|--------|---------------|
| Pristup | Vlastiti razvoj (modularni) |
| Snage | 300, 450, 600 kW |
| Konfiguracija | Pantograph-down + CCS2 backup |
| Time-to-market | 18-22 mjeseca |
| Investicija | €1,200,000-1,800,000 |
| Ciljna marža | 40-50% |
| Volumen Y1 | 10-20 punjača |

### Zajedničke komponente

| Komponenta | Sharing ratio | Ušteda |
|------------|---------------|--------|
| OCPP backend | 100% | €100,000 |
| Fleet management UI | 90% | €80,000 |
| Servisna mreža | 100% | €150,000/god |
| Certifikacijski know-how | 80% | €50,000 |
| **Ukupna ušteda** | | **€380,000+** |

### Financijski model

```
GODINA 1 (Depot fokus):
├── Depot revenue (40× €40k)        €1,600,000
├── Depot COGS (70%)                €1,120,000
├── Depot gross profit               €480,000
├── Track B R&D investment          -€600,000
└── Net                             -€120,000

GODINA 2 (Oba tracka):
├── Depot revenue (60× €40k)        €2,400,000
├── Depot gross profit               €720,000
├── Opportunity revenue (15× €200k) €3,000,000
├── Opportunity gross profit        €1,350,000
├── Track B completion cost         -€600,000
└── Net                             €1,470,000

GODINA 3 (Full portfolio):
├── Depot revenue (80× €40k)        €3,200,000
├── Opportunity revenue (30× €200k) €6,000,000
├── Combined gross profit           €3,960,000
└── Net profit (after OPEX)         €2,400,000+
```

### Kada odabrati

✅ **Idealno za:**
- Balans kratkoročnog i dugoročnog
- Self-funding R&D model
- Tržišna validacija prije velikih ulaganja
- Puni portfolio za velike tendere

❌ **Nije za:**
- Fokusirane resurse (potrebna 2 tima)
- Vrlo ograničen budžet
- Single-product strategiju

---

## Kombinacija 8: "Alliance Builder" - Strateška partnerstva

### Koncept
Umjesto potpunog vlastitog razvoja, strateška partnerstva s komplementarnim igračima: bus OEM, grid operator, softverska tvrtka, financijer. Svaki donosi ekspertizu.

### Struktura saveza

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATEGIC ALLIANCE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    ┌─────────────┐                         │
│                    │   MI       │                         │
│                    │ (integrator)│                         │
│                    └──────┬──────┘                         │
│                           │                                 │
│       ┌───────────────────┼───────────────────┐            │
│       │                   │                   │            │
│       ▼                   ▼                   ▼            │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐        │
│  │ BUS OEM │        │ POWER   │        │ GRID    │        │
│  │         │        │ ELECTR. │        │ PARTNER │        │
│  │ Higer/  │        │         │        │         │        │
│  │ Solaris │        │ ABB/    │        │ EMS/    │        │
│  │         │        │ Siemens │        │ Lokalni │        │
│  └────┬────┘        └────┬────┘        └────┬────┘        │
│       │                  │                  │              │
│       ▼                  ▼                  ▼              │
│  Interoper.         Certificirani      Grid capacity      │
│  garantirana        power moduli       osiguran           │
│                                                             │
│       ┌───────────────────┼───────────────────┐            │
│       │                   │                   │            │
│       ▼                   ▼                   ▼            │
│  ┌─────────┐        ┌─────────┐        ┌─────────┐        │
│  │ SOFTWARE│        │ FINANCE │        │ SERVICE │        │
│  │ PARTNER │        │ PARTNER │        │ PARTNER │        │
│  │         │        │         │        │         │        │
│  │ ChargeP/│        │ EBRD/   │        │ Lokalni │        │
│  │ The Mob.│        │ Bank    │        │ održ.   │        │
│  │ House   │        │         │        │         │        │
│  └─────────┘        └─────────┘        └─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Potencijalni partneri po kategoriji

#### Bus OEM partneri

| Partner | Prednost | Pristup |
|---------|----------|---------|
| **Higer** | Već u Srbiji, EXPO busevi | Direct relationship |
| **Solaris** | EU lider, kvaliteta | Distributerski ugovor |
| **BYD** | Vertikalna integracija | Exclusive regional deal |
| **Yutong** | Cijena, volumen | ODM partnerstvo |

#### Power Electronics partneri

| Partner | Ponuda | Model suradnje |
|---------|--------|----------------|
| **ABB** | HVC moduli, certifikacija | Technology licensing |
| **Siemens/Heliox** | DepotFinity sustav | System integrator |
| **Kempower** | Modularni sustavi | Distribution agreement |
| **Delta** | Power moduli, OEM | Component supply |

#### Software partneri

| Partner | Ponuda | Vrijednost |
|---------|--------|------------|
| **The Mobility House** | ChargePilot, V2G | Grid services expertise |
| **ChargePoint** | Backend, fleet mgmt | Proven platform |
| **Ampcontrol** | AI optimization | Cost reduction |
| **ViriCiti** | Telematics | Data analytics |

#### Financijski partneri

| Partner | Instrument | Fokus |
|---------|------------|-------|
| **EBRD** | Loan, equity | Western Balkans |
| **EIB** | Long-term loan | Green transport |
| **IFC** | Equity, loan | Emerging markets |
| **Green Climate Fund** | Grant | Climate impact |

### Model partnerstva

| Tip | Naša uloga | Partner uloga | Revenue share |
|-----|------------|---------------|---------------|
| **JV** | Lokalni market, integracija | Tehnologija, kapital | 50/50 |
| **Licensing** | Proizvodnja, prodaja | IP, podrška | 85/15 |
| **Distribution** | Sales, service | Proizvod | 70/30 (marža) |
| **Consortium** | Lead, koordinacija | Specijalizacija | Po ugovoru |

### Primjer: EXPO 2027 Consortium

```
CONSORTIUM STRUKTURA:

┌────────────────────────────────────────────────────────┐
│                  EXPO 2027 CONSORTIUM                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Lead Partner: [Naša tvrtka]                          │
│  ├── Uloga: Project management, lokalna integracija   │
│  ├── Udio: 35%                                        │
│  └── Investicija: €500,000                            │
│                                                        │
│  Technology Partner: [ABB/Kempower]                   │
│  ├── Uloga: Punjači, certifikacija                    │
│  ├── Udio: 40%                                        │
│  └── Investicija: €1,200,000 (equipment)              │
│                                                        │
│  Finance Partner: [EBRD]                              │
│  ├── Uloga: Project finance                           │
│  ├── Instrument: €2,000,000 loan                      │
│  └── Uvjeti: 3% + EURIBOR, 10 godina                  │
│                                                        │
│  Service Partner: [Lokalna tvrtka]                    │
│  ├── Uloga: Instalacija, održavanje                   │
│  ├── Udio: 25%                                        │
│  └── Investicija: €300,000 (kapaciteti)               │
│                                                        │
│  Ukupna vrijednost projekta: €4,000,000               │
│  Naša equity investicija: €500,000                    │
│  Leverage: 8x                                          │
└────────────────────────────────────────────────────────┘
```

### Financijski profil

| Stavka | Solo pristup | Alliance pristup |
|--------|--------------|------------------|
| Potrebna investicija | €2,500,000 | €500,000 |
| Vrijeme do tržišta | 14-18 mj | 8-12 mj |
| Tehnički rizik | Visok | Nizak |
| Marža | 40-50% | 20-30% |
| Market access | Organski | Ubrzani |
| IP kontrola | 100% | Dijeljena |

### Kada odabrati

✅ **Idealno za:**
- Ograničen kapital, velike ambicije
- Brz market entry
- Pristup tehnologiji bez R&D
- Veći projekti (tenderi)

❌ **Nije za:**
- Potpunu kontrolu
- Najviše marže
- Dugoročnu IP izgradnju

---

## Usporedna matrica svih kombinacija

| Kombinacija | Investicija | TTM | Marža | Rizik | IP | Skalabilnost |
|-------------|-------------|-----|-------|-------|-----|--------------|
| 1. Fast Follower | €200-400k | 4-6 mj | 15-25% | Nizak | ★☆☆☆☆ | ★★★☆☆ |
| 2. Regional Champion | €0.8-1.5M | 10-14 mj | 25-35% | Srednji | ★★★☆☆ | ★★★★☆ |
| 3. Technology Platform | €2.5-4M | 14-16 mj | 35-50% | Visok | ★★★★★ | ★★★★★ |
| 4. Smart Grid Pioneer | €1.5-2.5M | 16-20 mj | 30-40%+ | Srednji | ★★★★☆ | ★★★★☆ |
| 5. EXPO Express | €2.5-4M | 8-10 mj | 20-30% | Nizak | ★★☆☆☆ | ★★☆☆☆ |
| 6. CaaS Disruptor | €1-2M | 10-14 mj | Recurring | Srednji | ★★★☆☆ | ★★★★★ |
| 7. Dual Track | €1.5-2.3M | 10+18 mj | 25-45% | Srednji | ★★★★☆ | ★★★★☆ |
| 8. Alliance Builder | €0.5-1M | 8-12 mj | 20-30% | Nizak | ★★☆☆☆ | ★★★★☆ |

---

## Preporučene kombinacije po prioritetu

### Prioritet: Brzina (EXPO 2027)
**Preporuka: Kombinacija 5 (EXPO Express) + elementi iz 8 (Alliance)**
- ODM partnerstvo za punjače
- Konzorcij pristup za veće šanse na tenderu
- Lokalni servis kao diferencijacija

### Prioritet: Dugoročna pozicija
**Preporuka: Kombinacija 7 (Dual Track)**
- Depot za brz cash flow
- Opportunity za premium poziciju
- Postepena izgradnja IP-a

### Prioritet: Minimalna investicija
**Preporuka: Kombinacija 1 (Fast Follower) → 2 (Regional Champion)**
- Start s ODM
- Reinvestiranje profita u lokalizaciju
- 2-3 godine do vlastite proizvodnje

### Prioritet: Tehnološko vodstvo
**Preporuka: Kombinacija 3 (Technology Platform) + 4 (V2G)**
- Modularna platforma kao osnova
- V2G kao diferencijacija
- Premium pozicioniranje

### Prioritet: Recurring revenue
**Preporuka: Kombinacija 6 (CaaS) + 8 (Alliance)**
- CaaS model s financijskim partnerom
- Hardware od partnera
- Fokus na operacije i grid services

---

## Sljedeći koraci za odluku

1. **Definirati prioritete** (brzina vs marža vs IP vs rizik)
2. **Utvrditi dostupni kapital** i izvore financiranja
3. **Mapirati postojeće kompetencije** tima
4. **Identificirati potencijalne partnere** po kombinaciji
5. **Izraditi detaljni business case** za 2-3 top kombinacije
6. **Odluka** i start implementacije

---

Koju kombinaciju ili kombinaciju kombinacija želite detaljnije razraditi?
