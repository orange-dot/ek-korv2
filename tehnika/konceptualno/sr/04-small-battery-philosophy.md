# Male baterije + česte zamene: Promena paradigme za teška vozila

## Sažetak

Tradicionalno razmišljanje o električnim vozilima pretpostavlja da su veće baterije bolje: veći domet, manje zaustavljanja, jednostavnije operacije. Ovaj dokument osporava tu pretpostavku za **teška komercijalna vozila** (autobuse, kamione, dostavna vozila) i predlaže radikalnu alternativu:

**Male baterije sa čestim robotskim zamenama umesto punjenja.**

Ovaj pristup proširuje osnovnu filozofiju modularnosti Elektrokombinacije sa infrastrukture punjača (EK3 moduli) na same baterije vozila (EK-BAT moduli), stvarajući jedinstven ekosistem gde i infrastruktura I vozila imaju koristi od ekstremne modularnosti.

---

## 1. Problem velikih baterija u teškim vozilima

### 1.1 Kazna težine

Svaki kilogram baterije je kilogram koji NIJE dostupan za putnike ili teret.

```
ANALIZA TEŽINE: GRADSKI AUTOBUS (12m, ograničenje 18 tona)
═══════════════════════════════════════════════════════════════════════════

Tradicionalna baterija 400 kWh:
├── Ćelije baterije: ~1.600 kg (@ 150 Wh/kg nivo ćelije)
├── BMS, kućište, hlađenje: ~800 kg
├── UKUPNA TEŽINA BATERIJE: ~2.400 kg
│
└── Uticaj:
    • 24 putnika manje (@ 100 kg svaki)
    • ILI smanjen kapacitet konstrukcije/klima
    • Veće habanje guma, kočnica, veća potrošnja energije

Mala baterija 100 kWh:
├── Ćelije baterije: ~400 kg
├── BMS, kućište, hlađenje: ~200 kg
├── UKUPNA TEŽINA BATERIJE: ~600 kg
│
└── Ušteda:
    • 1.800 kg oslobođeno za putnike/teret
    • 18 dodatnih putnika po vožnji
    • Manja potrošnja energije po km
```

**Za kamione je uticaj još dramatičniji:**

| Tip vozila | Tradicionalna | Težina | Mala baterija | Težina | Dobitak tereta |
|------------|---------------|--------|---------------|--------|----------------|
| Gradski autobus (12m) | 400 kWh | 2.400 kg | 100 kWh | 600 kg | +18 putnika |
| Regionalni autobus (15m) | 500 kWh | 3.000 kg | 150 kWh | 900 kg | +21 putnik |
| Dostavno vozilo (3,5t) | 150 kWh | 900 kg | 50 kWh | 300 kg | +600 kg tereta |
| Gradski kamion (16t) | 300 kWh | 1.800 kg | 100 kWh | 600 kg | +1.200 kg tereta |
| Tegljač (40t) | 600 kWh | 3.600 kg | 150 kWh | 900 kg | +2.700 kg tereta |

### 1.2 Paradoks troškova

Velike baterije su skupe, a većina tog kapaciteta stoji neiskorišćena većinu dana.

```
ANALIZA TROŠKOVA: FLOTA OD 50 AUTOBUSA
═══════════════════════════════════════════════════════════════════════════

Tradicionalni model (400 kWh po autobusu):
├── 50 autobusa × 400 kWh × 150 €/kWh = 3.000.000 € (samo baterije)
├── Iskorišćenost baterije: 1 pun ciklus dnevno
├── Vek baterije: ~3.000 ciklusa @ 80% DoD = 8 godina teoretski
├── Stvarna zamena: Godina 5-6 (degradacija + tehnološko osveženje)
└── Cena zamene: 2.100.000 € (70% originala, količinski popust)

Model male baterije + zamene (100 kWh po autobusu + zajednički bazen):
├── 50 autobusa × 100 kWh × 150 €/kWh = 750.000 € (baterije vozila)
├── Bazen: 100 baterija × 100 kWh × 150 €/kWh = 1.500.000 €
├── Iskorišćenost baterije: 3-4 plitka ciklusa dnevno
├── Vek baterije: ~6.000+ ciklusa @ 30% DoD = produžen vek
├── Zamena: Distribuirano tokom vremena (prediktivno, planirano)
└── Budžet za zamenu 5 godina: 600.000 € (rotacija bazena)
```

### 1.3 Problem vremena punjenja

Velike baterije zahtevaju ili:
- **Sporo noćno punjenje**: Vozilo nedostupno 8+ sati
- **Ultra-brzo punjenje (MW-skala)**: Skupa infrastruktura, opterećenje mreže, degradacija baterije

```
POREĐENJE VREMENA PUNJENJA I ZAMENE
═══════════════════════════════════════════════════════════════════════════

Gradski autobus - Potrebno obnoviti 300 kWh za sledeću smenu:

OPCIJA A: Punjenje u depou (punjač 200 kW)
├── Vreme punjenja: 300 kWh ÷ 200 kW = 1,5 sat
├── Ali: Vršna snaga ograničena, smanjenje pri visokom SoC
├── REALNO VREME: 2-2,5 sata
└── Dostupnost vozila: 14-16 sati/dan

OPCIJA B: Oportunističko punjenje (pantograf 450 kW)
├── Vreme punjenja: 100 kWh za 15-20 minuta na terminusu
├── Zahteva: Specijalnu infrastrukturu terminusa
├── Problem: Poremećaj rasporeda ako je punjač zauzet
└── Stres baterije: Konstantno brzo punjenje smanjuje vek

OPCIJA C: Zamena baterije (100 kWh, robotska)
├── Vreme zamene: 5 minuta ukupno (ulazak, zamena, izlazak)
├── 3 zamene dnevno × 5 min = 15 minuta ukupno zastoja
├── Bez problema vršnog opterećenja (baterije se pune van špica)
└── Dostupnost vozila: 20+ sati/dan
```

### 1.4 Problem skaliranja infrastrukture

Velike baterije zahtevaju masivne priključke na mrežu u depoima.

```
POREĐENJE PRIKLJUČKA NA MREŽU: DEPO SA 50 AUTOBUSA
═══════════════════════════════════════════════════════════════════════════

Tradicionalno punjenje u depou:
├── 50 autobusa × 400 kWh = 20 MWh za punjenje preko noći
├── 8-satni prozor = 2,5 MW prosečna potražnja
├── Ali: Svi autobusi stižu u prozoru od 2 sata
├── Vršna potražnja: 50 × 200 kW = potreban priključak 10 MW
├── Cena nadogradnje mreže: 500.000 € - 2.000.000 €
└── Mesečne naknade za vršnu snagu: 15.000 € - 50.000 €

Distribuirane stanice za zamenu:
├── 5 stanica × 50 kW punjenja svaka = 250 kW ukupno
├── Baterije se pune 24/7 optimalnom brzinom
├── Priključak na mrežu po stanici: 100 kW (skroman)
├── Bez vršnih opterećenja (baterije baferuju opterećenje)
├── V2G prihod od uskladištenih baterija
└── Mesečni trošak mreže: 5.000 € - 10.000 €
```

---

## 2. Rešenje: Mala baterija + česta zamena

### 2.1 Osnovni princip

> **Prilagodi veličinu baterije operativnom segmentu, ne ukupnom dnevnom dometu.**

Gradski autobus ne treba 400 kWh ako prolazi pored stanice za zamenu svakih 50-100 km. Dostavno vozilo ne treba 150 kWh ako se vraća u centar 2-3 puta dnevno.

```
OPERATIVNO USKLAĐIVANJE
═══════════════════════════════════════════════════════════════════════════

Ruta gradskog autobusa: 250 km dnevno
├── Tradicionalno: baterija 400 kWh, punjenje preko noći
└── Optimizovano: baterija 100 kWh, zamena svakih 80-100 km (3 zamene/dan)

Ruta regionalnog autobusa: 400 km dnevno
├── Tradicionalno: baterija 500 kWh, punjenje preko noći + oportunističko
└── Optimizovano: baterija 150 kWh, zamena na svakom terminusu (2-3 zamene/dan)

Dostavno vozilo: 150 km dnevno, više zaustavljanja
├── Tradicionalno: baterija 150 kWh, punjenje preko noći
└── Optimizovano: baterija 50 kWh, zamena u urbanom centru (2 zamene/dan)

Gradski kamion: 120 km dnevno
├── Tradicionalno: baterija 300 kWh, punjenje preko noći
└── Optimizovano: baterija 100 kWh, zamena u logističkom centru (1-2 zamene/dan)

Tegljač: 800 km dnevno
├── Tradicionalno: baterija 600 kWh, MCS punjenje svakih 300 km
└── Optimizovano: 150 kWh × 4, zamena na autoputu svakih 200 km (3-4 zamene/dan)
```

### 2.2 Dimenzioniranje baterije po tipu vozila

| Tip vozila | Tradicionalna | Mala baterija | Frekvencija zamene | Vreme zamene | Dnevni zastoj |
|------------|---------------|---------------|---------------------|--------------|---------------|
| Gradski autobus (12m) | 400 kWh | 100 kWh | Svakih 100 km | 5 min | 15-20 min |
| Regionalni autobus (15m) | 500 kWh | 150 kWh | Svakih 150 km | 5 min | 10-15 min |
| Dostavno vozilo | 150 kWh | 50 kWh | 2-3× dnevno | 3 min | 6-9 min |
| Gradski kamion (16t) | 300 kWh | 100 kWh | Svakih 80 km | 6 min | 12-18 min |
| Tegljač (40t) | 600 kWh | 150 kWh × 4 | Svakih 200 km | 10 min | 30-40 min |

### 2.3 Prednost operativnog vremena

```
POREĐENJE DOSTUPNOSTI VOZILA
═══════════════════════════════════════════════════════════════════════════

Gradski autobus - tradicionalno:
├── Sati u službi: 05:00 - 23:00 (18 sati)
├── Povratak u depo: 23:00
├── Punjenje: 23:30 - 02:00 (2,5 sata)
├── Dostupan: 05:00
└── ISKORIŠĆENOST: 18/24 = 75%

Gradski autobus - model zamene:
├── Sati u službi: 04:00 - 00:00 (20 sati)
├── Zaustavljanja za zamenu: 3 × 5 min = 15 min (tokom rute)
├── Bez vremena punjenja u depou
├── Dostupan: Odmah nakon smene
└── ISKORIŠĆENOST: 20/24 = 83% (+8% povećanje)

Dostavno vozilo - tradicionalno:
├── Rute: 07:00 - 19:00 (12 sati)
├── Povratak u depo: 19:00
├── Punjenje: 19:30 - 23:30 (4 sata)
└── ISKORIŠĆENOST: 12/24 = 50%

Dostavno vozilo - model zamene:
├── Rute: 06:00 - 22:00 (16 sati, moguće dve smene)
├── Zamene u centru: 2 × 3 min = 6 min
└── ISKORIŠĆENOST: 16/24 = 67% (+17% povećanje)
```

---

## 3. Analiza ukupnog troška vlasništva

### 3.1 Flota autobusa: 50 vozila, horizont 5 godina

```
TCO POREĐENJE: 50 GRADSKIH AUTOBUSA TOKOM 5 GODINA
═══════════════════════════════════════════════════════════════════════════

                          TRADICIONALNO       MALO + ZAMENA
                          ─────────────       ─────────────
BATERIJE
Baterije vozila           3.000.000 €         750.000 €
Bazen baterija            -                   1.500.000 €
Međuzbir                  3.000.000 €         2.250.000 €

INFRASTRUKTURA
Punjenje u depou (200kW×50) 500.000 €         -
Stanice za zamenu (5×)    -                   1.000.000 €
Nadogradnja mreže         300.000 €           50.000 €
Međuzbir                  800.000 €           1.050.000 €

OPERACIJE (5 godina)
Električna energija       1.500.000 €         1.200.000 €
Naknade za vršnu snagu    750.000 €           100.000 €
Održavanje                200.000 €           150.000 €
Međuzbir                  2.450.000 €         1.450.000 €

ZAMENA
Zamena baterija Y5        2.100.000 €         600.000 €
Zamena opreme             100.000 €           150.000 €
Međuzbir                  2.200.000 €         750.000 €

═══════════════════════════════════════════════════════════════════════════
UKUPNI TCO 5 GODINA       8.450.000 €         5.500.000 €
                          ─────────────       ─────────────
UŠTEDA                    -                   2.950.000 € (35%)
```

### 3.2 Dodatni izvori prihoda

Model zamene omogućava izvore prihoda nemoguće sa tradicionalnim punjenjem u depou:

```
V2G PRIHOD OD BAZENA BATERIJA
═══════════════════════════════════════════════════════════════════════════

Bazen baterija: 100 × 100 kWh = 10 MWh kapaciteta skladištenja
├── Dostupno za V2G: ~6 MWh (60% bazena nije u vozilima)
├── Regulacija frekvencije: 5-15 €/MWh/sat
├── Smanjenje vršnog opterećenja: 50-100 €/MWh
├── Odgovor na potražnju: 10-30 €/događaj
│
├── Konzervativni godišnji prihod: 30.000 €
├── Optimistični godišnji prihod: 80.000 €
└── Dodatni prihod za 5 godina: 150.000 € - 400.000 €
```

### 3.3 Skrivene koristi

| Korist | Tradicionalno | Model zamene | Vrednost |
|--------|---------------|--------------|----------|
| Dodatni putnici (autobus) | 0 | +18/autobus | 500 €/dan prihoda |
| Dodatni teret (kamion) | 0 | +2.700 kg | Veća iskorišćenost |
| Dostupnost vozila | 75% | 83% | +1 ruta/dan moguće |
| Vek baterije | 5-6 godina | 8+ godina | Smanjena zamena |
| Opterećenje mreže | Visok vrh | Ravnomerno | Niže naknade |
| V2G sposobnost | Ograničena | Pun bazen | Izvor prihoda |

---

## 4. Dizajn mreže infrastrukture

### 4.1 Strategija postavljanja stanica

```
MREŽA STANICA ZA ZAMENU: SISTEM GRADSKIH AUTOBUSA
═══════════════════════════════════════════════════════════════════════════

Model implementacije: Strateško postavljanje na prirodnim mestima zaustavljanja

                    ┌─────────────────┐
                    │   TERMINAL A    │ ← Stanica za zamenu
                    │   (kraj linije) │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │   LINIJA 1       LINIJA 2       LINIJA 3       │
    │   15 km          18 km          12 km          │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  CENTRALNI ČVR  │ ← Stanica za zamenu
                    │  (presedanje)   │
                    └────────┬────────┘
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │   LINIJA 4       LINIJA 5       LINIJA 6       │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │   TERMINAL B    │ ← Stanica za zamenu
                    └─────────────────┘

POKRIVENOST:
• 3 stanice za zamenu pokrivaju 6 linija
• Svaki autobus prolazi pored stanice svakih ~30-50 km
• Prirodna integracija sa postojećim rasporedom
• Nije potrebno dodatno zaustavljanje (zamena tokom pauze)
```

### 4.2 Mreža za kamione na autoputu

```
MREŽA ZAMENE NA AUTOPUTU: TERETNI KAMIONI
═══════════════════════════════════════════════════════════════════════════

                 GRAD A ←───200km───→ ZAMENA 1 ←───200km───→ ZAMENA 2
                    │                    │                    │
                    │                    │                    │
                    ▼                    ▼                    ▼
              [LOGISTIČKI]          [ODMORIŠTE]          [ODMORIŠTE]
              [  CENTAR  ]          [+ ZAMENA ]          [+ ZAMENA ]
                    │                    │                    │
                    │                    │                    │
                ZAMENA 3 ←───200km───→ ZAMENA 4 ←───200km───→ GRAD B
                    │                    │                    │
                    ▼                    ▼                    ▼
              [KAMIONSKO]          [KAMIONSKO]          [LOGISTIČKI]
              [STAJALIŠTE]         [STAJALIŠTE]         [  CENTAR  ]

RAZMAK: ~200 km između stanica (odgovara dometu 150 kWh × 4 paketa)
INTEGRACIJA: Kolokacija sa postojećim odmorištima/stajalištima
KAPACITET: Svaka stanica opslužuje ~50 kamiona/dan
```

---

## 5. Ekonomija bazena baterija

### 5.1 Dimenzioniranje bazena

```
IZRAČUN OPTIMALNE VELIČINE BAZENA
═══════════════════════════════════════════════════════════════════════════

Primer flote od 50 autobusa:
├── Baterije u vozilima: 50
├── Baterije koje se pune na stanicama: 20 (40% bafer)
├── Baterije u transportu (do/iz popravke): 5
├── Rezerva za vršnu potražnju: 15
├── Rezerva za održavanje: 10
│
└── UKUPNA VELIČINA BAZENA: 100 baterija (odnos 2:1)

ISKORIŠĆENOST:
├── Svaka baterija: 3-4 ciklusa dnevno (u različitim vozilima)
├── Bazen se okrene: 3× dnevno
├── Prosečni SoC: 50-70% (plitko cikliranje)
└── Stres baterije: Mnogo niži nego jedan dubok ciklus
```

### 5.2 Optimizacija punjenja

```
STRATEGIJA PUNJENJA BAZENA
═══════════════════════════════════════════════════════════════════════════

OPTIMIZACIJA PO TARIFU:

     POTRAŽNJA │                    ┌──────┐
               │      ┌──────┐      │ VRH  │      ┌──────┐
               │      │      │      │      │      │      │
               │ ┌────┤      ├──────┤      ├──────┤      ├────┐
               │ │    │      │      │      │      │      │    │
               │ │    │      │      │      │      │      │    │
               └─┴────┴──────┴──────┴──────┴──────┴──────┴────┴─→ VREME
                 00   06     09     12     15     18     21   24

PUNJENJE:   ████████                              ████████████
            (van špica)                           (van špica)

V2G:                   ░░░░░░░░░░░░░░░░░░░░░░░░░░░
                       (pražnjenje tokom špica)

REZULTAT:
• Punjenje po 0,08 €/kWh (noćna tarifa)
• Izbegavanje 0,25 €/kWh (vršna tarifa)
• V2G prihod tokom špica
• NETO EFEKTIVNA CENA: 0,05 €/kWh ili manje
```

### 5.3 Dispečovanje na osnovu zdravlja

```
AI-OPTIMIZOVANO DISPEČOVANJE BATERIJA
═══════════════════════════════════════════════════════════════════════════

OCENE ZDRAVLJA BATERIJA (0-100):

Status bazena baterija:
├── [BAT-001] Zdravlje: 98, SoC: 85%  ← Prioritet za zahtevne rute
├── [BAT-002] Zdravlje: 95, SoC: 72%  ← Standardne rute
├── [BAT-003] Zdravlje: 92, SoC: 80%  ← Standardne rute
├── [BAT-004] Zdravlje: 87, SoC: 65%  ← Lake rute
├── [BAT-005] Zdravlje: 75, SoC: 90%  ← Samo urbano, označi za pregled
├── [BAT-006] Zdravlje: 68, SoC: 45%  ← POVLAČENJE: Šalji na reciklažu
└── ...

ALGORITAM DISPEČOVANJA:
1. Sortiraj dostupne baterije po oceni zdravlja
2. Uskladi zahteve rute (rastojanje, visina, temperatura)
3. Zahtevne rute dobijaju baterije visokog zdravlja
4. Lake rute "vežbaju" baterije nižeg zdravlja
5. Kontinuirano učenje poboljšava predikcije
```

---

## 6. Uticaj na životnu sredinu

### 6.1 Poboljšanje životnog ciklusa baterije

```
POREĐENJE ŽIVOTNOG CIKLUSA
═══════════════════════════════════════════════════════════════════════════

TRADICIONALNO (400 kWh, duboko cikliranje):
├── Dubina ciklusa: 80% DoD dnevno
├── Životni vek: ~3.000 ciklusa do 80% kapaciteta
├── Kalendarski vek: ~8 godina
├── EFEKTIVAN VEK: 5-6 godina (šta god dođe prvo)
├── Protok energije: 400 × 0,8 × 3.000 = 960 MWh životno
└── Ukupno potrebna baterija: 50 autobusa × 400 kWh = 20 MWh

MALO + ZAMENA (100 kWh, plitko cikliranje):
├── Dubina ciklusa: 30% DoD po zameni
├── Životni vek: ~6.000+ ciklusa do 80% kapaciteta
├── Kalendarski vek: ~10 godina (manje stresa)
├── EFEKTIVAN VEK: 8+ godina
├── Protok energije: 100 × 0,3 × 6.000 = 180 MWh po bateriji
├── Protok bazena: 100 baterija × 180 = 18.000 MWh
└── Ukupno potrebna baterija: 100 × 100 kWh = 10 MWh

EFIKASNOST MATERIJALA:
Tradicionalno: 960 MWh životno / 20 MWh baterije = 48× protok
Model zamene: 18.000 MWh životno / 10 MWh baterije = 1.800× protok

→ MODEL ZAMENE: 37× više energije isporučeno po kg materijala baterije
```

### 6.2 Koristi integracije sa mrežom

```
POREĐENJE UTICAJA NA MREŽU
═══════════════════════════════════════════════════════════════════════════

TRADICIONALNO PUNJENJE U DEPOU:

  MREŽA   │ ████████████████████████████████████████████████
OPTEREĆ.  │ ████████████████████████████████████████████████
          │ ████████████████████████████████████████████████
          │                         │
          │ ────────────────────────┼────────────────────── BAZNO OPTEREĆ.
          │                    ▲    │    ▲
          │                    │    │    │ skok 10 MW
          │                    │    │    │ kad se autobusi vrate
          └────────────────────┴────┴────┴─────────────────→ VREME
                              22:00  23:00

MODEL ZAMENE SA V2G:

  MREŽA   │                    ▲
OPTEREĆ.  │                    │ V2G pražnjenje
          │ ───────────────────┼─────────────────────────── BAZNO OPTEREĆ.
          │                    │
          │ ████████████████████████████████████████████████
          │ ████████████████████████████████████████████████ Ravnomerno
          │ ████████████████████████████████████████████████ punjenje
          └────────────────────────────────────────────────→ VREME
            Baterije se pune polako 24/7, prazne tokom špica
```

---

## 7. Modularna arhitektura baterija: EK-BAT familija

### 7.1 Filozofija dizajna

Kao što EK3 moduli punjača omogućavaju bilo koju snagu od 3 kW do 3 MW, EK-BAT moduli baterija omogućavaju bilo koje vozilo od kombija do kamiona sa istim gradivnim blokovima.

```
FILOZOFIJA MODULARNE BATERIJE
═══════════════════════════════════════════════════════════════════════════

EK3 MODULI PUNJAČA                EK-BAT MODULI BATERIJA
─────────────────────             ──────────────────────
• Osnovna jedinica 3,3 kW         • Osnovna jedinica 25 kWh
• Slaganje do bilo koje snage     • Slaganje do bilo kog kapaciteta
• Zamena u radu                   • Robotska zamena
• Inteligencija roja              • BMS koordinacija roja
• Distribuirana rezerva           • Redundantnost bazena

JEDAN EKOSISTEM ZA PUNJENJE I SKLADIŠTENJE
```

### 7.2 EK-BAT familija modula

| Modul | Kapacitet | Težina | Dimenzije | Primarna upotreba |
|-------|-----------|--------|-----------|-------------------|
| EK-BAT-25 | 25 kWh | 150 kg | 600×400×300 mm | Kombiji, mali kamioni |
| EK-BAT-50 | 50 kWh | 300 kg | 900×600×300 mm | Autobusi, srednji kamioni |
| EK-BAT-100 | 100 kWh | 600 kg | 1200×800×400 mm | Teški autobusi, tegljači |

### 7.3 Konfiguracije vozila

```
KONFIGURACIJE BATERIJA VOZILA
═══════════════════════════════════════════════════════════════════════════

DOSTAVNI KOMBI (50 kWh):
┌─────────────────────────────────────────────────┐
│                    KOMBI                         │
│  ┌────────────┐                                 │
│  │ EK-BAT-50  │  Jedan modul, zadnji pod        │
│  │   50 kWh   │                                 │
│  └────────────┘                                 │
└─────────────────────────────────────────────────┘

GRADSKI AUTOBUS (100 kWh):
┌─────────────────────────────────────────────────┐
│                   AUTOBUS                        │
│  ┌────────────┐  ┌────────────┐                 │
│  │ EK-BAT-50  │  │ EK-BAT-50  │  2 modula      │
│  │   50 kWh   │  │   50 kWh   │  centralni pod  │
│  └────────────┘  └────────────┘                 │
└─────────────────────────────────────────────────┘

TEGLJAČ (600 kWh):
┌─────────────────────────────────────────────────┐
│                   KAMION                         │
│  ┌────────────┐  ┌────────────┐                 │
│  │EK-BAT-100  │  │EK-BAT-100  │  Leva strana   │
│  │   100 kWh  │  │   100 kWh  │                 │
│  └────────────┘  └────────────┘                 │
│  ┌────────────┐  ┌────────────┐                 │
│  │EK-BAT-100  │  │EK-BAT-100  │  Desna strana  │
│  │   100 kWh  │  │   100 kWh  │                 │
│  └────────────┘  └────────────┘                 │
│                                                  │
│  Ukupno: 4 × 100 kWh = 400 kWh korisno         │
│  Zamena: Sva 4 paralelno (10 minuta)            │
└─────────────────────────────────────────────────┘
```

---

## 8. Integracija sa Elektrokombinacija ekosistemom

### 8.1 Jedinstvena stanica za zamenu

Stanica za zamenu rukuje I baterijama vozila I EK3 modulima punjača:

```
STANICA DVOSTRUKE NAMENE
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                         STANICA ZA ZAMENU                                │
│                                                                         │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐│
│  │    PROSTOR ZA VOZILO    │    │      PROSTOR ZA INFRASTRUKTURU     ││
│  │                         │    │                                      ││
│  │  ┌─────────────────┐   │    │  ┌─────────────────────────────┐    ││
│  │  │  AUTOBUS/KAMION │   │    │  │     REK EK3 PUNJAČA         │    ││
│  │  │   ▓▓▓▓▓▓▓▓▓▓    │   │    │  │    ┌───┐┌───┐┌───┐...      │    ││
│  │  └─────────────────┘   │    │  │    │EK3││EK3││EK3│         │    ││
│  │         ↕               │    │  │    └───┘└───┘└───┘         │    ││
│  │  ┌─────────────────┐   │    │  └─────────────────────────────┘    ││
│  │  │  PORTAL ROBOT   │   │    │              ↕                       ││
│  │  │ (zamena bater.) │   │    │  ┌─────────────────────────────┐    ││
│  │  └─────────────────┘   │    │  │    6-OSNI ROBOT             │    ││
│  │                         │    │  │    (zamena modula)          │    ││
│  └─────────────────────────┘    │  └─────────────────────────────┘    ││
│                                  │                                      ││
│  ┌───────────────────────────────┴──────────────────────────────────┐ ││
│  │           SKLADIŠTE BATERIJA + MODULA                             │ ││
│  │  [EK-BAT][EK-BAT][EK-BAT][PUN][PUN]    [EK3][EK3][EK3][EK3]      │ ││
│  └────────────────────────────────────────────────────────────────────┘ ││
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

TOK RADA:
1. Vozilo stiže
2. Portal robot menja bateriju vozila (5 min)
3. ISTOVREMENO: 6-osni robot proverava zdravlje EK3 modula
4. Ako je potrebno: 6-osni robot menja degradirani EK3 modul (40 sek)
5. Vozilo odlazi sa svežom baterijom I zdravim punjačem
```

---

## 9. Plan implementacije

### Faza 1: Pilot (12 meseci)
- 5 autobusa sa baterijama 100 kWh
- 2 stanice za zamenu
- Bazen od 15 baterija
- Implementacija u jednom gradu
- Metrike: vreme zamene, pouzdanost, prihvatanje vozača

### Faza 2: Gradska flota (24 meseca)
- 50 autobusa konvertovano
- 5 stanica za zamenu (strateški terminali)
- Bazen od 100 baterija
- V2G integracija
- Metrike: validacija TCO, koristi za mrežu

### Faza 3: Više tipova vozila (36 meseci)
- Dodavanje dostavnih vozila (20 vozila)
- Dodavanje gradskih kamiona (10 vozila)
- Mreža urbanih centara (4 centra)
- Standardizacija baterija za sva vozila
- Metrike: iskorišćenost bazena, efikasnost više vozila

### Faza 4: Regionalno širenje (48 meseci)
- Dodavanje regionalnih autobusa
- Koridor za kamione na autoputu
- Mreža više gradova
- Deljenje baterija između operatera
- Metrike: efekti mreže, ekonomija obima

---

## 10. Zaključak

Model male baterije + česte zamene predstavlja fundamentalno preispitivanje operacija teških električnih vozila. Usklađivanjem veličine baterije sa operativnim potrebama umesto ukupnog dnevnog dometa, postižemo:

1. **Ušteda težine**: 1.800-2.700 kg oslobođeno za korisni teret
2. **Smanjenje troškova**: 31-35% niži TCO za 5 godina
3. **Veća iskorišćenost**: 8-17% veća dostupnost vozila
4. **Koristi za mrežu**: Ravnomeran profil opterećenja, V2G prihod
5. **Ekološki dobici**: 37× više energije po kg materijala baterije
6. **Jedinstven ekosistem**: Ista infrastruktura zamene za baterije I module punjača

Ovo nije samo inkrementalno poboljšanje—to je promena paradigme koja koristi osnovnu filozofiju modularnosti Elektrokombinacije da transformiše celokupan lanac vrednosti elektrifikacije teških vozila.

---

*Verzija dokumenta: 1.0*
*Poslednje ažuriranje: 04.01.2026.*
*Autor: Tehnički tim Elektrokombinacije*
