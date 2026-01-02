# Strategija razvoja EV punjača: skaliranje od malih do velikih snaga

## Sažetak

Razvoj infrastrukture za punjenje električnih autobusa može se učinkovito provesti kroz fazni pristup - počevši s manjim snagama (25-50 kW) za validaciju temeljnih sustava, zatim skaliranje na proizvodne razine (150-600 kW). Ovaj pristup smanjuje razvojne troškove, ubrzava iteracije i minimizira rizik, dok istovremeno osigurava da kritične komponente specifične za visoke snage budu pravilno validirane prije proizvodnje.

---

## Komponente koje se mogu potpuno validirati na malim snagama

### Komunikacijski protokoli

| Protokol | Funkcija | Ovisnost o snazi |
|----------|----------|------------------|
| ISO 15118 | Vehicle-to-Grid komunikacija, Plug & Charge | Neovisno |
| ISO 15118-20 | TLS 1.3 enkripcija, MCS podrška | Neovisno |
| OCPP 2.0.1 | Backend upravljanje, autentifikacija | Neovisno |
| GB/T 27930 | Kinesko tržište (CAN bus) | Neovisno |

ISO 15118 koristi PKI certifikate za Plug & Charge autentifikaciju - ova implementacija je identična na 25 kW i 600 kW punjaču. OCPP 2.0.1 protokol za backend komunikaciju također ne ovisi o snazi punjača.

### Sigurnosni sustavi

- **Izolacijski monitoring** - IM/I (Isolation Monitor/Interrupter) sustavi rade na istim principima neovisno o snazi
- **RCD zaštita** - Charge-Circuit Interrupting Devices (CCID) za AC, izolacijski prekidači za DC
- **Emergency stop** - fizički i softverski prekidi identični
- **Foreign Object Detection** - za bežično punjenje, senzorski sustav neovisan o snazi
- **Cybersecurity** - TLS enkripcija, certifikati, RFID autentifikacija

### BMS integracija

Komunikacija s Battery Management Systemom vozila odvija se preko:
- CAN bus (J1939 protokol)
- Automotive Ethernet (za MCS/ISO 15118-20)

Protokoli su identični neovisno o snazi punjača - razlika je samo u parametrima koje BMS zahtijeva (struja, napon, trajanje).

### Softverske komponente

| Komponenta | Opis | Skalabilnost |
|------------|------|--------------|
| Charge Management System | Raspoređivanje, optimizacija | ✓ Potpuno skalabilno |
| Fleet Management integracija | ViriCiti, ChargePilot | ✓ API-ji neovisni o snazi |
| Smart charging algoritmi | Peak shaving, ToU optimizacija | ✓ Ista logika |
| Telemetrija i dijagnostika | SoC monitoring, prediktivno održavanje | ✓ Isti protokoli |
| Korisničko sučelje | Display, mobilna app | ✓ Identično |

### Topologije pretvarača

Osnovne topologije energetske elektronike skaliraju linearno:

**AC/DC stupanj (PFC):**
- Vienna Rectifier - postiže 98.56% efikasnost, THD <3%
- Active Front-End (AFE) - omogućava V2G bidirekcionalnost

**DC/DC stupanj:**
- LLC rezonantni pretvarač - za galvansku izolaciju
- Dual Active Bridge (DAB) - za bidirekcionalnu operaciju

Isti dizajn pretvarača na 25 kW može se skalirati povećanjem broja paralelnih modula ili zamjenom komponenti većeg kapaciteta.

---

## Komponente koje zahtijevaju validaciju na punoj snazi

### Termalno upravljanje

| Raspon snage | Tip hlađenja | Kritične točke |
|--------------|--------------|----------------|
| < 150 kW | Zračno hlađenje | Prihvatljivo za kontinuiranu operaciju |
| 150-250 kW | Prijelazna zona | Zračno moguće, tekuće preporučeno |
| > 250 kW | Tekuće hlađenje obavezno | Voda-glikol sustav, IEC 62893-4-2 |
| > 350 kW | Aktivno hlađenje kablova | Liquid-cooled cables (HUBER+SUHNER) |

**Kritično**: DC brzo punjenje na 150+ kW može generirati temperature do **200°C unutar 10 minuta** bez adekvatnog upravljanja. Termalni dizajn mora se validirati na punoj snazi jer:
- Toplinski tokovi nisu linearni
- Hot-spot formacija ovisi o realnom opterećenju
- Derating karakteristike moraju se empirijski odrediti

### Konektorski sustavi

| Standard | Maksimalna snaga | Maksimalna struja | Napon |
|----------|------------------|-------------------|-------|
| CCS2 (Combo 2) | 350 kW | 500 A | 1000 VDC |
| ChaoJi | 900 kW | - | - |
| MCS (SAE J3271) | 3.75 MW | 3000 A | 1250 VDC |

Prelazak s CCS2 na MCS zahtijeva potpuno novi konektor (Stäubli MULTILAM tehnologija, trokutasti oblik). Validacija kontaktne otpornosti, termalnog ponašanja i mehaničke izdržljivosti mora se provesti na ciljnoj snazi.

### EMC (Elektromagnetska kompatibilnost)

Elektromagnetske smetnje rastu s:
- Frekvencijom preklapanja (tipično 20-100 kHz za LLC)
- Strujom (di/dt tijekom preklapanja)
- Naponom (dv/dt kapacitivne smetnje)

EMC testiranje na malim snagama indicira potencijalne probleme, ali **certifikacijska mjerenja moraju se provesti na punoj snazi**.

### Mrežni priključak

| Kapacitet depoa | Tipična vršna potražnja | Naponska razina |
|-----------------|-------------------------|-----------------|
| < 500 kW | Do 500 kW | Niskonaponski (400 V) |
| 500 kW - 2 MW | 1-2 MW | Srednjenaponski (11 kV) |
| 2-10 MW | 3-10 MW | Srednjenaponski (33 kV) |
| > 10 MW | 10-20+ MW | Visokonaponski (110 kV) |

Grid integracija (power factor correction, harmonic filtering, demand response) mora se testirati na reprezentativnom opterećenju.

---

## Preporučeni fazni razvojni plan

### Faza 1: Laboratorijski prototip (25-50 kW)

**Trajanje**: 4-6 mjeseci

**Ciljevi**:
- Validacija komunikacijskih protokola (ISO 15118, OCPP 2.0.1)
- Implementacija i testiranje sigurnosnih sustava
- Razvoj korisničkog softvera i sučelja
- Integracija s BMS simulatorom/testnim vozilom
- Verifikacija topologije pretvarača (Vienna Rectifier + LLC/DAB)
- Bazično termalno karakteriziranje

**Oprema**:
- 25-50 kW modularni pretvarač (SiC MOSFET baziran)
- CCS2 konektor za testiranje
- Programabilno DC opterećenje ili testno vozilo
- OCPP backend (lokalni ili cloud)
- Termalna kamera, data loggeri

**Deliverables**:
- Funkcionalni prototip s punom softverskom implementacijom
- Verificirani komunikacijski protokoli
- Dokumentirane sigurnosne funkcije
- Bazična termalna analiza

### Faza 2: Srednja snaga s termalnim sustavom (150 kW)

**Trajanje**: 3-4 mjeseca

**Ciljevi**:
- Implementacija tekućeg hlađenja
- Validacija termalnog upravljanja pod kontinuiranim opterećenjem
- EMC pre-compliance testiranje
- Testiranje s realnim vozilima (e-bus ili teški EV)
- Optimizacija efikasnosti (cilj: >95% ukupna efikasnost)

**Dodatna oprema**:
- Rashladni sustav (pumpa, izmjenjivač topline, ekspanzijska posuda)
- Tekuće hlađeni kabel (IEC 62893-4-2 kompatibilan)
- EMC pre-compliance oprema
- Pristup testnom e-busu

**Deliverables**:
- Validirani termalni dizajn
- EMC pre-compliance izvještaj
- Karakterizacija efikasnosti pri različitim opterećenjima
- Izvještaj o interoperabilnosti s testnim vozilima

### Faza 3: Puna snaga i certifikacija (300-600 kW)

**Trajanje**: 4-6 mjeseci

**Ciljevi**:
- Skaliranje na proizvodnu snagu
- Formalno EMC i sigurnosno testiranje (CE/UL)
- Testiranje izdržljivosti (accelerated life testing)
- Pilot instalacija na terenu
- Grid integracija i demand response validacija

**Certifikacije**:
- IEC 61851-23 (DC punjenje)
- IEC 61851-1 (opći zahtjevi)
- EN 50696 (pantograph sustavi, ako primjenjivo)
- UL 2202 (za US tržište)
- EMC: EN 61000-6-2, EN 61000-6-4

**Deliverables**:
- Certificiran proizvod
- Pilot instalacija s dokumentiranim performansama
- Proizvodna dokumentacija
- Servisni i održavački priručnici

---

## Modularni pristup: industrija kao primjer

Vodeći proizvođači koriste modularne arhitekture koje inherentno podržavaju ovaj razvojni pristup:

### Kempower

- Bazni modul: 50 kW
- Skaliranje: do 600 kW (Megawatt Charging Cabinet)
- Satelitski sustav: 1 power unit → 8-12 dispensera
- Dinamička raspodjela snage između priključaka

### Tritium TRI-FLEX

- Bazna rezolucija: 25 kW power sharing
- Jedan 1.6 MW ormar → do 64 priključka
- Hot-swappable moduli za održavanje

### ABB HVC (High Voltage Charger)

- HVC150: 150 kW bazni modul
- HVC360: 360 kW (2 × 180 kW modula)
- Centralizirani power cabinet + udaljeni dispenseri (do 100m)

**Implikacija za razvoj**: Razvoj jednog 50 kW modula s punom funkcionalnosti omogućava skaliranje do megavatnih sustava kombiniranjem modula - hardverska i softverska arhitektura ostaju konzistentne.

---

## Rizici i mitigacije

### Rizik 1: Termalno ponašanje nepredvidivo pri skaliranju

**Mitigacija**:
- CFD (Computational Fluid Dynamics) simulacije prije fizičkog skaliranja
- Konzervativni dizajn s marginom (20-30% dodatnog kapaciteta hlađenja)
- Inkrementalno testiranje (50 → 100 → 150 → 200 kW)

### Rizik 2: EMC problemi pojavljuju se tek na punoj snazi

**Mitigacija**:
- Pre-compliance testiranje u svakoj fazi
- Dizajn s EMC-first pristupom (shielding, filtering, layout)
- Angažman certificiranog EMC laboratorija rano u projektu

### Rizik 3: Interoperabilnost s vozilima

**Mitigacija**:
- Testiranje s više OEM-ova već u Fazi 1 (barem 3 različita vozila)
- Sudjelovanje u interoperabilnosti testiranjima (ASSURED tip)
- Strogo pridržavanje standarda bez proprietarnih ekstenzija

### Rizik 4: Grid integracija na velikim snagama

**Mitigacija**:
- Rano uključivanje distributera električne energije
- Power quality analiza na pilot lokaciji
- Predviđanje za buduće zahtjeve (V2G, demand response)

---

## Zaključak

Fazni razvoj od malih prema velikim snagama predstavlja optimalan pristup za razvoj infrastrukture punjenja e-autobusa:

1. **70-80% funkcionalnosti** može se potpuno validirati na 25-50 kW prototipu
2. **Termalni i EMC dizajn** zahtijevaju validaciju na svakoj razini snage
3. **Modularni pristup** omogućava korištenje istih gradivnih blokova kroz sve faze
4. **Troškovi i vrijeme** značajno se smanjuju iterativnim razvojem
5. **Rizik** se minimizira ranim otkrivanjem problema na manjim snagama

Ovaj pristup slijedi industrijsku praksu vodećih proizvođača (Kempower, ABB, Tritium) koji svi koriste modularne arhitekture s baznim jedinicama od 25-60 kW.

---

## Reference

- IEC 61851-23:2023 - DC EV charging
- ISO 15118-2/-20 - Vehicle-to-Grid communication
- SAE J3271 - Megawatt Charging System
- EN 50696 - Automated conductive charging
- IEC 62893-4-2 - Liquid-cooled cables
