# Invention Disclosure: Fleet-Integrated Maintenance Logistics

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-004 |
| Date of Disclosure | 2026-01-02 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-02 |
| Witnesses | Marija Janjatović |

### Origin of Invention
Inspiracija: Problem sa maintenance EV punjača u Srbiji - tehničari moraju dolaziti za svaku popravku. Ideja: zašto ne koristiti autobuse koji ionako prolaze kroz stanice kao transportnu mrežu za module?

---

## 1. Title of Invention

**Fleet Vehicle Integrated Logistics System for Distributed Infrastructure Maintenance**

Alternative: Using Public Transit Vehicles as Spare Parts Transport Network

---

## 2. Problem Statement

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

## 3. Summary of Invention

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

REZULTAT: ZERO DEDICATED LOGISTICS VEHICLES
```

---

## 4. Detailed Description

### 4.1 Transport Container Design

```
MODULE TRANSPORT BOX:
═══════════════════════════════════════════════════════════════

DIMENZIJE:
• Spoljne: 600 × 400 × 300 mm
• Unutrašnje: 560 × 360 × 260 mm
• Masa (prazan): 3 kg
• Masa (pun, 10 modula): 21 kg

KARAKTERISTIKE:
• Materijal: HDPE ili aluminijum
• ESD zaštita: Conductive foam umetak
• Shock protection: 50G rated
• Weatherproof: IP65
• Stackable: Da (do 3 visoko)
• Handle: Ergonomski, za jednu ruku

IDENTIFIKACIJA:
• RFID tag (pasivni, UHF)
• QR kod (backup)
• LED indikator (status)
  - Zeleno: Fresh moduli
  - Crveno: Defektni moduli
  - Plavo: Mixed/in transit

KAPACITET:
• 10 × EK3 modula
• Ili 5 × EK3 + alat/delovi
• Ili mešavina po potrebi

MOUNTING U AUTOBUSU:
• Standardni cargo bay
• Quick-release brackets
• Može i u prostor za invalidska kolica (ako nije zauzet)
```

### 4.2 Logistics Flow

```
DNEVNI CIKLUS:
═══════════════════════════════════════════════════════════════

06:00 - JUTARNJI POLAZAK IZ DEPOTA
────────────────────────────────────────────────────────────────
• Tehničar u depotu stavlja box sa popravljenim modulima u bus
• Bus kreće na redovnu liniju
• Box putuje "besplatno" sa autobusom

08:30 - PROLAZAK KROZ SWAP STANICU
────────────────────────────────────────────────────────────────
• Bus dolazi na swap (redovno punjenje)
• Robot uzima popravljene module iz boxa
• Robot stavlja defektne module u box
• Bus nastavlja rutu
• ZERO dodatnog vremena za bus

12:00 - DRUGI PROLAZAK (opciono)
────────────────────────────────────────────────────────────────
• Ako je isti bus, ista procedural
• Ili drugi bus preuzima box

18:00 - POVRATAK U DEPOT
────────────────────────────────────────────────────────────────
• Bus završava smenu
• Tehničar uzima box sa defektnim modulima
• Modul ide na dijagnostiku i popravku

20:00-06:00 - NOĆNA SMENA U SERVISU
────────────────────────────────────────────────────────────────
• Tehničari popravljaju module
• Nema žurbe - cela noć za rad
• Sutra ujutru: ciklus se ponavlja
```

### 4.3 Scheduling Algorithm

```
ALGORITHM: Optimal Box Routing
═══════════════════════════════════════════════════════════════

INPUTS:
• Bus_routes[]: Lista svih ruta sa vremenima
• Station_needs[]: Koji moduli trebaju kojoj stanici
• Depot_ready[]: Koji moduli su popravljeni i spremni
• Box_locations[]: Gde su box-ovi trenutno

DAILY PLANNING (večer pre):
1. Identify stations needing fresh modules
2. Identify buses passing those stations tomorrow
3. Assign boxes to buses (optimize for minimal transfers)
4. Generate loading instructions for depot technicians

REAL-TIME ADJUSTMENTS:
• If bus breaks down: Reassign box to next bus on route
• If urgent need: Taxi/courier for critical modules only
• If module fails mid-day: Schedule pickup for next bus pass

EXAMPLE:
Station A needs 3 modules
Station B needs 2 modules
Bus 101 passes A at 09:00, returns to depot at 18:00
Bus 205 passes B at 10:00, passes A at 14:00

OPTIMAL PLAN:
• Bus 101: Carry 3 modules for A, deliver at 09:00
• Bus 205: Carry 2 modules for B, deliver at 10:00
  Then pick up defectives from A at 14:00

RESULT: 5 modules delivered, 0 dedicated vehicles
```

### 4.4 Exception Handling

```
SCENARIO: Kritičan kvar, nema bus u naredna 2 sata
═══════════════════════════════════════════════════════════════

OPCIJA 1: Graceful Degradation
• Punjač radi na 99.7% kapaciteta (1 od 300 modula)
• Čeka se redovan bus
• Prihvatljivo za većinu situacija

OPCIJA 2: Taxi/Courier
• Za stvarno kritične situacije
• Courier donosi modul iz najbližeg depota
• Trošak: €30-50 (vs €200-500 za tehničara)
• Frekvencija: <1% slučajeva

OPCIJA 3: Nearby Station
• Robot sa druge stanice "pozajmljuje" modul
• Transport sledećim busom koji povezuje stanice
• Decentralizovani inventory

SCENARIO: Box oštećen/izgubljen
═══════════════════════════════════════════════════════════════

• Svaki box ima GPS tracker (opciono)
• RFID skeniranje na svakoj tački
• Backup box-ovi u svakom depotu
• Insurance za sadržaj (moduli ~€1,500)
```

---

## 5. Advantages Over Prior Art

```
ADVANTAGE 1: Zero Logistics Fleet
─────────────────────────────────────────────────────────────
Prior art: Dedicated service vehicles
This invention: Use existing bus fleet
Savings: €30,000-50,000 per vehicle × fleet size

ADVANTAGE 2: Zero Driver Cost
─────────────────────────────────────────────────────────────
Prior art: Driver/technician for each trip
This invention: Bus driver already on payroll
Savings: €25-40/hour × travel time

ADVANTAGE 3: Higher Frequency
─────────────────────────────────────────────────────────────
Prior art: 1-2 service visits per week per station
This invention: Multiple bus passes per day
Response time: Hours instead of days

ADVANTAGE 4: Predictable Schedule
─────────────────────────────────────────────────────────────
Prior art: Reactive dispatch when failure occurs
This invention: Known bus schedule enables planning
Result: Proactive maintenance possible

ADVANTAGE 5: Scalability
─────────────────────────────────────────────────────────────
Prior art: More stations = more service vehicles
This invention: More stations = same bus fleet
Scaling: O(1) instead of O(n)
```

---

## 6. Novel Aspects

```
WHAT IS NEW:
═══════════════════════════════════════════════════════════════

1. FLEET VEHICLES AS LOGISTICS NETWORK
   • Concept of using passenger vehicles for parts transport
   • Never applied to EV charging infrastructure
   • Unique synergy with bus battery swap stations

2. INTEGRATION WITH SWAP STATION
   • Robot handles both battery AND parts logistics
   • No human intervention at station
   • Seamless integration with existing workflow

3. DETECTION + LOGISTICS COMBO
   • AI detects degradation through continuous monitoring:
     - Early detection (trend analysis): days/weeks ahead
     - Typical (anomaly during charging): hours ahead
     - Reactive (sudden failure): minutes - but no downtime!
   • Scheduling algorithm matches to bus routes
   • Parts arrive via next scheduled bus on that route
   • Even reactive scenarios avoid truck rolls

4. CIRCULAR ECONOMY ENABLER
   • Modules return to depot for repair
   • Not disposed, but refurbished
   • Fleet enables cost-effective returns
```

---

## 7. Claims (Draft)

```
INDEPENDENT CLAIM 1:
A logistics system for infrastructure maintenance comprising:
• A plurality of service modules distributed across remote
  stations;
• A fleet of vehicles operating on scheduled routes passing
  said stations;
• Transport containers configured to carry replacement modules;
• An automated system at each station for loading and
  unloading said containers from said vehicles;
• Wherein replacement module transport utilizes scheduled
  fleet vehicle routes without dedicated logistics vehicles.

INDEPENDENT CLAIM 2:
A method for maintaining distributed infrastructure comprising:
• Predicting module replacement needs at remote stations;
• Identifying fleet vehicles scheduled to pass said stations;
• Loading replacement modules onto identified vehicles;
• Automatically exchanging modules at stations during
  scheduled vehicle stops;
• Returning replaced modules via fleet vehicles for repair.

DEPENDENT CLAIMS:
• ...wherein the fleet vehicles are electric buses
• ...wherein the automated exchange system is integrated with
  a vehicle battery swap station
• ...wherein module exchange occurs simultaneously with
  battery exchange
• ...wherein scheduling optimization minimizes transfers
```

---

## 8. Signatures

```
INVENTOR(S):

Name: _________________________
Signature: ____________________
Date: ________________________

WITNESS:

Name: _________________________
Signature: ____________________
Date: ________________________
```
