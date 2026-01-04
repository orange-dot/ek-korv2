# Prijava Izuma: Logistika Održavanja Integrisana sa Flotom

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-004 |
| Datum Prijave | 2026-01-02 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Nastanka Ideje | 2026-01-02 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Inspiracija: Problem sa maintenance EV punjača u Srbiji - tehničari moraju dolaziti za svaku popravku. Ideja: zašto ne koristiti autobuse koji ionako prolaze kroz stanice kao transportnu mrežu za module?

---

## 1. Naziv Izuma

**Sistem Logistike Flote Vozila Integrisan za Održavanje Distribuirane Infrastrukture**

Alternativno: Korišćenje Vozila Javnog Prevoza kao Transportne Mreže za Rezervne Delove

---

## 2. Opis Problema

```
TRADICIONALNI MAINTENANCE LOGISTICS:
═══════════════════════════════════════════════════════════════

SCENARIO: Punjač na stanici X ima pokvareni modul

1. Dispatch servisnog vozila iz centrale
2. Vožnja do lokacije (30 min - 2 sata)
3. Zamena modula (ako ima deo)
4. Vožnja pokvarenog modula nazad
5. Vožnja do sledeće lokacije ili povratak

TROŠKOVI:
• Servisno vozilo: €30,000-50,000 kupovina
• Vozač/tehničar: €25-40/sat
• Gorivo: €20-50 po izlasku
• Prosečan "truck roll": €200-500

PROBLEM:
• Vozilo 80% vremena stoji
• Tehničar 60% vremena vozi, ne radi
• Svaka lokacija zahteva poseban izlazak
• Urgentne popravke = premium cena
```

---

## 3. Kratak Opis Izuma

```
KLJUČNI UVID:
═══════════════════════════════════════════════════════════════

Autobusi IONAKO prolaze kroz SWAP STANICE svakih X sati.
Autobusi IONAKO idu u DEPOT svake večeri.
Autobusi imaju CARGO PROSTOR koji nije iskorišćen.

REŠENJE:
Koristiti POSTOJEĆU RUTU autobusa za transport modula!

WORKFLOW:
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   SWAP      │      │    BUS      │      │   SERVICE   │
│  STATION    │─────►│  (redovna   │─────►│   DEPOT     │
│             │      │   ruta)     │      │             │
│ Defektan    │      │             │      │ Popravka    │
│ modul OUT   │      │ Transport   │      │ modula      │
└─────────────┘      └─────────────┘      └─────────────┘
       ▲                                         │
       │              ┌─────────────┐            │
       │              │    BUS      │            │
       └──────────────│  (redovna   │◄───────────┘
                      │   ruta)     │
                      │             │
                      │ Popravljeni │
                      │ modul BACK  │
                      └─────────────┘

REZULTAT: NULA NAMENSKIH LOGISTIČKIH VOZILA
```

---

## 4. Detaljan Opis

### 4.1 Dizajn Transportnog Kontejnera

```
KUTIJA ZA TRANSPORT MODULA:
═══════════════════════════════════════════════════════════════

DIMENZIJE:
• Spoljne: 600 × 400 × 300 mm
• Unutrašnje: 560 × 360 × 260 mm
• Masa (prazan): 3 kg
• Masa (pun, 10 modula): 21 kg

KARAKTERISTIKE:
• Materijal: HDPE ili aluminijum
• ESD zaštita: Conductive foam umetak
• Zaštita od udara: 50G rated
• Vodootporno: IP65
• Slaganje: Da (do 3 visoko)
• Ručka: Ergonomska, za jednu ruku

IDENTIFIKACIJA:
• RFID tag (pasivni, UHF)
• QR kod (rezervni)
• LED indikator (status)
  - Zeleno: Ispravni moduli
  - Crveno: Defektni moduli
  - Plavo: Mešovito/u transportu

KAPACITET:
• 10 × EK3 modula
• Ili 5 × EK3 + alat/delovi
• Ili mešavina po potrebi

MONTAŽA U AUTOBUSU:
• Standardni cargo bay
• Quick-release nosači
• Može i u prostor za invalidska kolica (ako nije zauzet)
```

### 4.2 Tok Logistike

```
DNEVNI CIKLUS:
═══════════════════════════════════════════════════════════════

06:00 - JUTARNJI POLAZAK IZ DEPOTA
────────────────────────────────────────────────────────────────
• Tehničar u depotu stavlja kutiju sa popravljenim modulima u autobus
• Autobus kreće na redovnu liniju
• Kutija putuje "besplatno" sa autobusom

08:30 - PROLAZAK KROZ SWAP STANICU
────────────────────────────────────────────────────────────────
• Autobus dolazi na swap (redovno punjenje)
• Robot uzima popravljene module iz kutije
• Robot stavlja defektne module u kutiju
• Autobus nastavlja rutu
• NULA dodatnog vremena za autobus

12:00 - DRUGI PROLAZAK (opciono)
────────────────────────────────────────────────────────────────
• Ako je isti autobus, ista procedura
• Ili drugi autobus preuzima kutiju

18:00 - POVRATAK U DEPOT
────────────────────────────────────────────────────────────────
• Autobus završava smenu
• Tehničar uzima kutiju sa defektnim modulima
• Modul ide na dijagnostiku i popravku

20:00-06:00 - NOĆNA SMENA U SERVISU
────────────────────────────────────────────────────────────────
• Tehničari popravljaju module
• Nema žurbe - cela noć za rad
• Sutra ujutru: ciklus se ponavlja
```

### 4.3 Algoritam Raspoređivanja

```
ALGORITAM: Optimalno Rutiranje Kutija
═══════════════════════════════════════════════════════════════

ULAZNI PODACI:
• Bus_routes[]: Lista svih ruta sa vremenima
• Station_needs[]: Koji moduli trebaju kojoj stanici
• Depot_ready[]: Koji moduli su popravljeni i spremni
• Box_locations[]: Gde su kutije trenutno

DNEVNO PLANIRANJE (veče pre):
1. Identifikovanje stanica kojima trebaju ispravni moduli
2. Identifikovanje autobusa koji sutra prolaze kroz te stanice
3. Dodeljivanje kutija autobusima (optimizacija za minimalne transfere)
4. Generisanje uputstava za utovar za tehničare u depou

PRILAGOĐAVANJE U REALNOM VREMENU:
• Ako autobus otkaže: Preusmeravanje kutije na sledeći autobus na ruti
• Ako je hitna potreba: Taksi/kurir samo za kritične module
• Ako modul otkaže tokom dana: Zakazivanje preuzimanja sledećim prolaskom autobusa

PRIMER:
Stanica A treba 3 modula
Stanica B treba 2 modula
Autobus 101 prolazi kroz A u 09:00, vraća se u depot u 18:00
Autobus 205 prolazi kroz B u 10:00, prolazi kroz A u 14:00

OPTIMALNI PLAN:
• Autobus 101: Nosi 3 modula za A, isporuka u 09:00
• Autobus 205: Nosi 2 modula za B, isporuka u 10:00
  Zatim preuzima defektne iz A u 14:00

REZULTAT: 5 modula isporučeno, 0 namenskih vozila
```

### 4.4 Upravljanje Izuzecima

```
SCENARIO: Kritičan kvar, nema autobus u naredna 2 sata
═══════════════════════════════════════════════════════════════

OPCIJA 1: Postepena Degradacija
• Punjač radi na 99.7% kapaciteta (1 od 300 modula)
• Čeka se redovan autobus
• Prihvatljivo za većinu situacija

OPCIJA 2: Taksi/Kurir
• Za stvarno kritične situacije
• Kurir donosi modul iz najbližeg depota
• Trošak: €30-50 (naspram €200-500 za tehničara)
• Frekvencija: <1% slučajeva

OPCIJA 3: Susedna Stanica
• Robot sa druge stanice "pozajmljuje" modul
• Transport sledećim autobusom koji povezuje stanice
• Decentralizovani inventar

SCENARIO: Kutija oštećena/izgubljena
═══════════════════════════════════════════════════════════════

• Svaka kutija ima GPS tracker (opciono)
• RFID skeniranje na svakoj tački
• Rezervne kutije u svakom depotu
• Osiguranje za sadržaj (moduli ~€1,500)
```

---

## 5. Prednosti u Odnosu na Postojeća Rešenja

```
PREDNOST 1: Nula Logističkih Vozila
─────────────────────────────────────────────────────────────
Postojeća rešenja: Namenska servisna vozila
Ovaj izum: Korišćenje postojeće flote autobusa
Ušteda: €30,000-50,000 po vozilu × veličina flote

PREDNOST 2: Nula Troškova Vozača
─────────────────────────────────────────────────────────────
Postojeća rešenja: Vozač/tehničar za svaki izlazak
Ovaj izum: Vozač autobusa već na platnom spisku
Ušteda: €25-40/sat × vreme putovanja

PREDNOST 3: Veća Frekvencija
─────────────────────────────────────────────────────────────
Postojeća rešenja: 1-2 servisne posete nedeljno po stanici
Ovaj izum: Više prolazaka autobusa dnevno
Vreme odziva: Sati umesto dana

PREDNOST 4: Predvidiv Raspored
─────────────────────────────────────────────────────────────
Postojeća rešenja: Reaktivno slanje kada dođe do kvara
Ovaj izum: Poznati raspored autobusa omogućava planiranje
Rezultat: Moguće proaktivno održavanje

PREDNOST 5: Skalabilnost
─────────────────────────────────────────────────────────────
Postojeća rešenja: Više stanica = više servisnih vozila
Ovaj izum: Više stanica = ista flota autobusa
Skaliranje: O(1) umesto O(n)
```

---

## 6. Novi Aspekti

```
ŠTA JE NOVO:
═══════════════════════════════════════════════════════════════

1. VOZILA FLOTE KAO LOGISTIČKA MREŽA
   • Koncept korišćenja putničkih vozila za transport delova
   • Nikada nije primenjeno na infrastrukturu za punjenje EV
   • Jedinstvena sinergija sa swap stanicama za autobuse

2. INTEGRACIJA SA SWAP STANICOM
   • Robot obrađuje i baterije I logistiku delova
   • Nema ljudske intervencije na stanici
   • Besprekorna integracija sa postojećim workflow-om

3. KOMBINACIJA DETEKCIJA + LOGISTIKA
   • AI detektuje degradaciju kroz kontinuirano praćenje:
     - Rana detekcija (analiza trendova): dana/nedelja unapred
     - Tipično (anomalija tokom punjenja): sati unapred
     - Reaktivno (iznenadni kvar): minuti - ali bez zastoja!
   • Algoritam raspoređivanja usklađuje sa rutama autobusa
   • Delovi stižu sledećim zakazanim autobusom na toj ruti
   • Čak i reaktivni scenariji izbegavaju izlaske servisnih vozila

4. OMOGUĆAVANJE CIRKULARNE EKONOMIJE
   • Moduli se vraćaju u depot na popravku
   • Ne bacaju se, već se renoviraju
   • Flota omogućava isplative povrate
```

---

## 7. Patentni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1:
Logistički sistem za održavanje infrastrukture koji obuhvata:
• Množinu servisnih modula raspoređenih po udaljenim
  stanicama;
• Flotu vozila koja saobraćaju po zakazanim rutama koje
  prolaze pomenutim stanicama;
• Transportne kontejnere konfigurisane za nošenje zamensih modula;
• Automatizovani sistem na svakoj stanici za utovar i
  istovar pomenutih kontejnera iz pomenutih vozila;
• Pri čemu transport zamenskih modula koristi zakazane
  rute vozila flote bez namenskih logističkih vozila.

NEZAVISNI ZAHTEV 2:
Metoda za održavanje distribuirane infrastrukture koja obuhvata:
• Predviđanje potreba za zamenom modula na udaljenim stanicama;
• Identifikovanje vozila flote zakazanih da prođu pomenutim stanicama;
• Utovar zamenskih modula u identifikovana vozila;
• Automatsku razmenu modula na stanicama tokom
  zakazanih zaustavljanja vozila;
• Vraćanje zamenjenih modula vozilima flote na popravku.

ZAVISNI ZAHTEVI:
• ...pri čemu su vozila flote električni autobusi
• ...pri čemu je automatizovani sistem razmene integrisan sa
  swap stanicom za baterije vozila
• ...pri čemu se razmena modula dešava istovremeno sa
  razmenom baterija
• ...pri čemu optimizacija rasporeda minimizuje transfere
```

---

## 8. Potpisi

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
