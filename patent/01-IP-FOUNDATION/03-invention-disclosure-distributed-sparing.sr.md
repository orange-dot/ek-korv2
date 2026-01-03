# Prijava Izuma: Sistem Distribuirane Rezerve Snage

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-003 |
| Datum Prijave | 2026-01-02 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 2026-01-02 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Inspiracija iz 3PAR storage arhitekture - primena dokazanih koncepata (chunklets, wide striping, distributed sparing) na power electronics. Nova primena postojećih principa u drugom tehničkom domenu.

---

## 1. Naziv Izuma

**Upravljanje Distribuiranom Rezervom Kapaciteta za Modularne Sisteme Napajanja Korišćenjem Algoritama Distribucije Opterećenja Izvedenih iz Storage Arhitekture**

Alternativno: Primena Principa Pouzdanosti iz Skladištenja Podataka na Energetsku Elektroniku

---

## 2. Opis Problema

```
TRADICIONALNI PRISTUP - HOT SPARE:
═══════════════════════════════════════════════════════════════
• Dedicirani rezervni moduli koji čekaju kvar
• Spare sedi neaktivan 99% vremena
• Nije testiran u produkciji - možda i on ne radi
• Posle jednog kvara - nema više rezerve
• Neravnomerno starenje (aktivni moduli stare brže)

REZULTAT:
• Loša iskorišćenost opreme
• Nepredvidivi kvarovi spare modula
• Cliff-edge failure mode
```

---

## 3. Kratak Opis Izuma

```
INSPIRACIJA: 3PAR Storage Architecture (HP, 2002)
═══════════════════════════════════════════════════════════════

3PAR je revolucionisao storage industriju primenom:
• Chunklets (mali blokovi umesto celih diskova)
• Wide striping (podaci preko SVIH diskova)
• Distributed sparing (nema dedicated spare)
• Thin provisioning (alociraj tek kad treba)

MI PRIMENJUJEMO ISTU LOGIKU NA POWER ELECTRONICS:
• EK3 modul = "chunklet" snage (3 kW)
• Wide striping = load preko SVIH modula
• Distributed sparing = rezerva u svakom modulu
• Thin provisioning = sleep mode za neaktivne
```

### Osnovni Koncept

```
UMESTO:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │ 0%  │ ← Spare ne radi
└─────┴─────┴─────┴─────┴─────┴─────┘

NAŠE REŠENJE:
┌─────┬─────┬─────┬─────┬─────┬─────┐
│ 83% │ 83% │ 83% │ 83% │ 83% │ 83% │ ← Svi rade, svi imaju rezervu
└─────┴─────┴─────┴─────┴─────┴─────┘

KADA JEDAN OTKAŽE:
┌─────┬─────┬─────┬─────┬─────┐
│100% │100% │100% │100% │100% │ ← Preostali preuzimaju
└─────┴─────┴─────┴─────┴─────┘

JOŠ UVEK 100% KAPACITETA!
```

---

## 4. Detaljan Opis

### 4.1 Wide Striping za Snagu

```
PROBLEM SA KONCENTRISANIM LOADOM:
═══════════════════════════════════════════════════════════════

Sistem od 10 modula, potrebno 50% snage:

TRADICIONALNO:
Modul:  1    2    3    4    5    6    7    8    9   10
Load:  100% 100% 100% 100% 100%  0%   0%   0%   0%   0%

• Moduli 1-5 rade na 100%, stare brže
• Moduli 6-10 ne rade uopšte
• Za 5 godina: 1-5 pred kraj života, 6-10 kao novi
• Termalni stres koncentrisan

WIDE STRIPING:
Modul:  1    2    3    4    5    6    7    8    9   10
Load:  50%  50%  50%  50%  50%  50%  50%  50%  50%  50%

• Svi moduli rade podjednako
• Ravnomerno starenje
• Niža temperatura (manji load po modulu)
• Predvidljiviji maintenance
• Duži životni vek sistema
```

### 4.2 Algoritam Distribuirane Rezerve

```
ALGORITHM: Dynamic Capacity Allocation
═══════════════════════════════════════════════════════════════

ULAZI:
• N = broj aktivnih modula
• P_total = ukupna potrebna snaga
• P_module = nominalna snaga modula (3 kW)
• R = željena rezerva (npr. 10%)

PRORAČUN:
• P_available = N × P_module
• Load_factor = P_total / P_available
• If Load_factor > (1 - R):
    Activate sleeping modules
• Else:
    Distribute P_total evenly across all N modules

PRIMER:
N = 10, P_total = 27 kW, P_module = 3 kW, R = 10%
P_available = 30 kW
Load_factor = 27/30 = 90%
Target: 90% each module = 2.7 kW per module

ODGOVOR NA KVAR:
Kada modul otkaže:
• N_new = N - 1 = 9
• P_available_new = 27 kW
• Load_factor_new = 27/27 = 100%
• Svaki preostali modul: 3 kW

Sistem nastavlja na PUNOM KAPACITETU!
```

### 4.3 Thin Provisioning za Snagu

```
KONCEPT: Sleep Mode za Nekorišćene Module
═══════════════════════════════════════════════════════════════

SCENARIO: 350 kW punjač, trenutno treba 50 kW

TRADICIONALNO:
• Sve komponente dimenzionisane za 350 kW
• Svi power stage-ovi aktivni
• Efikasnost pada pri malom loadu (switching losses)

THIN PROVISIONING:
• 117 modula instalirana (351 kW potencijal)
• Pri 50 kW: 17 modula aktivno @ 100%
• Ostalih 100 modula u SLEEP MODE:
  - PWM isključen
  - Samo monitoring aktivan
  - Potrošnja: <1W po modulu

PREDNOSTI:
• Svaki aktivan modul radi na optimalnom loadu
• Minimalna standby potrošnja
• Instant wake-up kad treba više snage (<10ms)
• Ravnomerna rotacija aktivnih modula
```

### 4.4 Algoritam Rotacije Modula

```
ALGORITHM: Wear Leveling
═══════════════════════════════════════════════════════════════

CILJ: Ravnomerno starenje svih modula

PRAĆENJE (po modulu):
• Operating_hours: Ukupno vreme rada
• Thermal_cycles: Broj on/off ciklusa
• Peak_loads: Broj epizoda na >90% load
• Health_score: AI-estimated remaining life

LOGIKA ROTACIJE:
Every T minutes (e.g., T=60):
1. Sort modules by Operating_hours (ascending)
2. If load < 80% of active modules:
   • Sleep highest-hours module
   • Wake lowest-hours sleeping module
3. Result: Natural wear leveling

PRIMER:
Hour 0:  Active = [M1, M2, M3], Sleep = [M4, M5, M6]
Hour 1:  Active = [M4, M2, M3], Sleep = [M1, M5, M6]  # M1↔M4
Hour 2:  Active = [M4, M5, M3], Sleep = [M1, M2, M6]  # M2↔M5
...

Posle 1 godine: Svi moduli imaju ~jednak broj radnih sati
```

---

## 5. Prednosti u Odnosu na Postojeća Rešenja

```
PREDNOST 1: Nema Neaktivne Opreme
─────────────────────────────────────────────────────────────
Postojeća rešenja: 10-20% opreme stoji neaktivno kao hot spare
Ovaj izum: Sva oprema se aktivno koristi
Poboljšanje iskorišćenosti: 10-20%

PREDNOST 2: Kontinuirano Testiranje
─────────────────────────────────────────────────────────────
Postojeća rešenja: Rezervni moduli netestirani dok ne zatrebaju
Ovaj izum: Svi moduli kontinuirano testirani u produkciji
Detekcija kvara: Proaktivna vs reaktivna

PREDNOST 3: Postepena Degradacija
─────────────────────────────────────────────────────────────
Postojeća rešenja: Iscrpljena rezerva = nagli pad sistema
Ovaj izum: Postepeno smanjenje kapaciteta
Režim kvara: Postepen vs katastrofalan

PREDNOST 4: Ravnomerno Starenje
─────────────────────────────────────────────────────────────
Postojeća rešenja: Aktivni moduli stare brže od rezervnih
Ovaj izum: Svi moduli stare podjednako
Održavanje: Predvidljiva grupna zamena

PREDNOST 5: Optimalna Efikasnost
─────────────────────────────────────────────────────────────
Postojeća rešenja: Svi moduli aktivni čak i pri malom opterećenju
Ovaj izum: Samo potrebni moduli aktivni
Efikasnost pri malom opterećenju: +5-10%
```

---

## 6. Novi Aspekti

```
ŠTA JE NOVO:
═══════════════════════════════════════════════════════════════

1. PRIMENA STORAGE KONCEPATA NA NAPAJANJE
   • 3PAR koncepti (chunklets, wide striping, distributed
     sparing) NIKADA nisu primenjeni na power electronics
   • Ovo je novo tehničko polje za ove algoritme

2. WEAR LEVELING ZA POWER MODULE
   • Koncept postoji za flash storage (SSD)
   • Nikada primenjen na power converter module
   • Naša implementacija uzima u obzir termalni i električni stres

3. THIN PROVISIONING ZA REAL-TIME NAPAJANJE
   • Storage thin provisioning je za alokaciju kapaciteta
   • Power thin provisioning zahteva <10ms vreme odziva
   • Različiti tehnički izazovi (instant wake-up)

4. KOMBINOVANI PRISTUP
   • Nijedno postojeće rešenje ne kombinuje sva četiri koncepta:
     - Wide striping
     - Distributed sparing
     - Thin provisioning
     - Wear leveling
   • Sinergija između koncepata je nova
```

---

## 7. Patentni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1:
Sistem za distribuciju snage koji sadrži:
• Više modularnih jedinica za napajanje povezanih paralelno;
• Kontrolni sistem koji distribuira električno opterećenje
  preko suštinski svih navedenih jedinica za napajanje istovremeno;
• Pri čemu je rezervni kapacitet distribuiran preko svih jedinica
  umesto da ga obezbeđuju dedicirane rezervne jedinice;
• Pri čemu kontrolni sistem dinamički prilagođava opterećenje
  pojedinačnih jedinica radi održavanja ujednačenih radnih sati.

NEZAVISNI ZAHTEV 2:
Metoda za upravljanje rezervnim kapacitetom u modularnom
sistemu napajanja koja obuhvata:
• Rad svih modula ispod nominalnog kapaciteta tako da
  ukupni rezervni kapacitet odgovara unapred određenoj
  margini rezerve;
• Po otkazu jednog modula, povećanje opterećenja
  preostalih modula radi održavanja ukupne izlazne snage sistema;
• Rotaciju aktivacije modula radi izjednačavanja radnih sati.

ZAVISNI ZAHTEVI:
• ...pri čemu je rezervni kapacitet 10-20% ukupnog nominalnog kapaciteta
• ...pri čemu je algoritam distribucije opterećenja izveden iz
  tehnika wide-striping-a za skladištenje podataka
• ...pri čemu neaktivni moduli ulaze u režim male potrošnje (sleep mode)
• ...pri čemu se rotacija modula dešava u intervalima od 30-120 minuta
```

---

## 8. Reference

```
3PAR STORAGE ARHITEKTURA:
• US Patent 7,107,389 - "Sparse chunklet allocation"
• US Patent 7,146,521 - "Wide striping for data storage"
• HPE Primera Technical White Papers

WEAR LEVELING (Flash Storage):
• Razni patenti proizvođača SSD-ova
• Koncept dobro ustanovljen za NAND flash

DISTINKCIJA:
Naš izum primenjuje ove koncepte na ENERGETSKU ELEKTRONIKU,
što je različito tehničko polje sa različitim
izazovima (real-time odziv, termalno upravljanje,
električni stres vs bit errors).
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
