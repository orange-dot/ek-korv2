# Analiza Konkurencije

## Postojeći Modularni DC Punjači

| Proizvođač | Model | Snaga modula | SiC | V2G | AI/Digital Twin | Liquid Cool |
|------------|-------|--------------|-----|-----|-----------------|-------------|
| **Kempower** | Power Unit V2 | 25 kW | ✅ | ❌ | Delimično | ✅ |
| **Tritium** | TRI-FLEX | 25 kW | ? | ❌ | ❌ | ✅ |
| **ABB** | Terra HP | 175-350 kW | Delimično | ❌ | ❌ | ✅ |
| **Autel** | MaxiCharger DC | 20 kW | ❌ | ❌ | ✅ Predictive | ✅ |
| **Sigenergy** | EVDC V2X | 25 kW | ? | ✅ | ❌ | ? |
| **Delta** | DeltaGrid | Various | ? | Delimično | ✅ | ? |
| **Wallbox** | Quasar 2 | 11.5 kW | ? | ✅ | ❌ | ❌ |
| **StarCharge** | Halo V2G | 7-11 kW | ? | ✅ | ❌ | ❌ |

## Detaljna Analiza Ključnih Konkurenata

### Kempower (Finska)
```
PREDNOSTI:
• SiC tehnologija u Power Module V2
• Modularan (25 kW granularnost)
• Do 1,200 kW skalabilnost
• Dobar brand u Evropi

SLABOSTI:
• Nema V2G
• AI samo na fleet nivou
• Centralizovana kontrola
• Premium cena (~€500+/kW)
```

### Tritium (Australija)
```
PREDNOSTI:
• TRI-FLEX do 3.2 MW
• Liquid cooling, IP65
• 97% efikasnost
• Širok temperaturni opseg (-35 do +55°C)

SLABOSTI:
• Nema V2G
• Nema AI/predictive
• Kompleksna instalacija
• Finansijski problemi (Chapter 11 u 2024)
```

### Sigenergy (Kina)
```
PREDNOSTI:
• V2G bidirekcioni
• Integracija sa solar/storage
• Pristupačna cena
• 150-1000V opseg

SLABOSTI:
• Manji brand recognition u EU
• Bez AI/predictive maintenance
• Manja snaga (25 kW max)
• Upitna dugoročna podrška
```

### Delta (Tajvan)
```
PREDNOSTI:
• DeltaGrid AI platforma
• Predictive maintenance
• Jak brand, 40+ godina
• Široka distribucija

SLABOSTI:
• Konzervativan dizajn
• IGBT (ne SiC) u većini modela
• V2G ograničen
• Manje inovativan
```

---

## Šta JE Dostupno na Tržištu

| Funkcija | Status | Ko ima |
|----------|--------|--------|
| SiC MOSFET | ✅ Dostupno | Kempower, neki drugi |
| 25kW moduli | ✅ Standard | Svi veliki |
| 97%+ efikasnost | ✅ Dostupno | Tritium, Kempower |
| Liquid cooling | ✅ Dostupno | Tritium, ABB, Autel |
| V2G bidirekcioni | ⚠️ Ograničeno | Sigenergy, Wallbox (mali) |
| AI fleet management | ✅ Dostupno | Delta, CyberAutonomy |
| ISO 15118-20 | ⚠️ Počinje | StarCharge, neki |
| Digital twin | ⚠️ Fleet level | Delta, IBM partnership |

---

## Šta NIJE Dobro Rešeno

### 1. V2G za Visoke Snage
```
PROBLEM:
• V2G postoji samo za male snage (≤25 kW)
• Nema V2G za fleet/depot aplikacije (100+ kW)
• ISO 15118-20 tek u ranoj fazi

PRILIKA:
• Prvi V2G punjač za flote autobusa
• Aggregirana V2G usluga za grid
```

### 2. AI na Nivou Modula
```
PROBLEM:
• AI je uvek na cloud/fleet nivou
• Moduli su "glupi" - samo prate komande
• Single point of failure za AI

PRILIKA:
• Edge AI u svakom modulu
• Distribuirana inteligencija
• Radi i offline
```

### 3. Pravi Swarm (Peer-to-Peer)
```
PROBLEM:
• Svi koriste master-slave arhitekturu
• Ako master otkaže, sistem staje
• Skaliranje zahteva jači master

PRILIKA:
• Peer-to-peer bez centralnog mastera
• Self-healing bez intervencije
• Linearna skalabilnost
```

### 4. Interoperabilnost Modula
```
PROBLEM:
• Svaki vendor ima proprietary module
• Ne možeš mešati Kempower + Tritium
• Vendor lock-in

PRILIKA:
• Otvoreni standard za module?
• Ili: najbolji proprietary da postane de-facto standard
```

### 5. Reliability / Uptime
```
PROBLEM:
• Industrija ima ~95% uptime (loše!)
• Česti kvarovi, spora dijagnostika
• Korisnici frustrirani

PRILIKA:
• 99%+ uptime kroz predictive
• Self-healing bez tehničara
• Remote diagnostics
```

---

## ELEKTROKOMBINACIJA Pozicioniranje

### Trenutni Koncept vs Konkurencija

```
FEATURE                    KONKURENCIJA              ELEKTROKOMBINACIJA
───────────────────────────────────────────────────────────────────────
Gde je AI?                 Fleet/Cloud level         Svaki modul ima NPU
Kontrolna arhitektura      Centralizovana            Swarm peer-to-peer
Topologija                 2-level (većina)          3-level NPC
Digital twin               Fleet level               Per-module real-time
V2G + visoka snaga         Ne postoji                Core feature
Dokumentacija              Proprietary               Otvoreni tehnički koncept
```

### Potencijalne Konkurentske Prednosti

| # | Prednost | Konkurencija | Mi | Težina |
|---|----------|--------------|-----|--------|
| 1 | V2G >50kW | ❌ Nema | ✅ | Srednja |
| 2 | AI per-module | ❌ Nema | ✅ | Visoka |
| 3 | True swarm | ❌ Nema | ✅ | Visoka |
| 4 | 99%+ uptime | ~95% | Target | Srednja |
| 5 | Lokalna proizvodnja | Import | ✅ | Niska |
| 6 | Cena | €400-600/kW | €300/kW | Srednja |

---

## KLJUČNI PROBLEM: Reliability Kriza

### Statistika 2025/2026

```
METRIKA                    2024           2025           IZVOR
──────────────────────────────────────────────────────────────────
Neuspele sesije            19%            14%            J.D. Power
Success rate (opšti)       ~73%           84%            J.D. Power Q1 2025
First-time success (FTCSR) -              71%            ChargerHelp 2025
Reported uptime            98-99%         98.7-99%       Industrija (lažno!)
```

### Uptime vs Success Rate - KLJUČNI JAZ

```
TVRDE PROIZVOĐAČI          REALNOST (2025)
─────────────────────────────────────────────────
"98.7-99% uptime"      →   71% FTCSR (ChargerHelp)
"Reliable"             →   14% sesija i dalje propada (J.D. Power)
"Smart diagnostics"    →   "Naši podaci ne govore šta je problem"
```

**Kameale Terry, CEO ChargerHelp:**
> "Uptime tells us if a charger is available, but it doesn't tell us if a driver can actually plug in and get a charge on the first attempt."

### Regionalne Razlike (Q2 2025 - Paren Report)

```
NAJBOLJI                   NAJGORI
──────────────────────────────────────────
Idaho: 92.0%               Vermont: 68.0%
Wyoming: 90.7%             Maine: 75.5%
Hawaii: 90.7%              Arkansas: 77.2%
Nebraska: 90.5%            Oklahoma: 77.3%
D.C.: 90.4%                Texas: 79.9%
```

### Lideri po Pouzdanosti (2025)

```
MREŽA                      RELIABILITY SCORE / SUCCESS RATE
─────────────────────────────────────────────────────────────
Tesla Supercharger         91.2 (Vecharged), 709 satisfaction
EVgo                       95% success rate Q1 2025
Rivian Adventure Network   Na nivou Tesla
Mercedes/Ford/Rivian       709 satisfaction (kao Tesla)
Non-Tesla prosek           591 satisfaction (MNOGO LOŠIJE)
```

### Novi Regulatorni Zahtevi

```
🆕 KALIFORNIJA OD 1. JANUARA 2026:
─────────────────────────────────────────────────────────────
• Svi finansirani punjači MORAJU imati ≥90% success rate
• Meri se 6 godina od instalacije
• Ovo je PRVI pravi standard - ostali prate

FEDERALNI (BIL):
• >97% uptime za NEVI projekte
• ALI: uptime ≠ success rate (kako smo videli)
```

**Izvori:**
- [J.D. Power 2025 EVX Study](https://www.jdpower.com/business/press-releases/2025-us-electric-vehicle-experience-evx-public-charging-study): 14% failed attempts (vs 19% 2024)
- [ChargerHelp 2025 Annual Report](https://www.chargerhelp.com/2025-annual-reliability-report/): 71% FTCSR, 100k+ sesija
- [Paren Q2 2025](https://www.paren.app/reports/state-of-the-industry-report-us-ev-fast-charging-q2-2025): Regionalni podaci
- [California Energy Commission](https://www.energy.ca.gov/proceedings/active-proceedings/electric-vehicle-charging-infrastructure-reliability-reporting-and): 90% standard od 2026

### Degradacija sa Vremenom (KRITIČNO! - potvrđeno 2025)

```
STAROST PUNJAČA          FIRST-TIME CHARGE SUCCESS RATE (ChargerHelp 2025)
──────────────────────────────────────────────────────────────────────────
Nov (Year 0)             85%
Year 3                   69.9%  ← 15 POENA PAD!
Year 4+                  Još gore

"FTCSR at new stations averaged 85% but dropped below 70% by year three,
a 15-point decline that uptime monitoring fails to capture."
— ChargerHelp 2025 Annual Reliability Report
```

**Zašto uptime ne hvata ovo:**
- Punjač može biti "online" ali ne raditi iz prvog pokušaja
- Treba više retry-a, reset-a, ili javljanja grešaka
- Mnogi punjači sa "100% uptime" i dalje ne rade kako treba

### Uzroci Kvarova (po ChargerHelp analizi)

```
TOP UZROCI NEUSPEŠNOG PUNJENJA:
───────────────────────────────
1. Fizička oštećenja (kablovi, konektori, ekrani)   ~33%
2. Connectivity/Software problemi                   ~33%
3. Payment system failures                          ~15%
4. Ostalo (grid, temperature, etc.)                 ~19%

DVE TREĆINE problema su kablovi/konektori + software!
```

### Dijagnostika je UŽASNA

```
CITAT OD INDUSTRY INSIDER:

"Our data today does not tell you what the problem is.
The quality and granularity of data varies wildly.
Too often we do not have enough information to tell you
whether the payment system is out, if the pin in the
connector is damaged, if the screen is blank —
or if it's the vehicle's fault."

— Bill Ferro, EVSession CEO
```

**Problem:** Čak ni operateri ne znaju šta je pokvareno!
- Tehničar dolazi bez pravih delova
- Multiple truck rolls za jedan kvar
- Dugo vreme popravke

### Connector Degradation (Skriveni Ubica)

```
FIZIKA DEGRADACIJE KONEKTORA:
─────────────────────────────
1. Kontaktna otpornost malo poraste (početak)
2. Viša otpornost = više toplote
3. Više toplote = brža degradacija
4. Positive feedback loop do katastrofalnog kvara

"Connectors have one of the worst reliability ratings
in FMEA calculations, and connectors subjected to
outside conditions are worse."
```

---

## 🎯 KONKURENTSKA PREDNOST: Self-Healing Reliability

### Problem koji NIKO nije rešio

```
DANAŠNJI PRISTUP                    ELEKTROKOMBINACIJA
────────────────────────────────────────────────────────────
Punjač se pokvari                   AI predvidi kvar 2 nedelje ranije
Operater ne zna šta je              AI zna TAČNO šta i zašto
Tehničar dolazi, ne zna šta treba   Tehničar dolazi sa pravim delom
Prosečno 3 dana do popravke         Popravka pre nego što korisnik primeti
73% success rate                    99%+ success rate
Degradacija posle 3 godine          AI kompenzuje degradaciju
```

### Kako ELEKTROKOMBINACIJA Rešava

#### 1. AI ZKLJUČIVO ZNA ŠTA JE POKVARENO

```
TRADICIONALNA DIJAGNOSTIKA:
───────────────────────────
Error: "Charging Failed"
→ Šta je problem? Ko zna...
→ Tehničar mora doći i istražiti

ELEKTROKOMBINACIJA AI DIJAGNOSTIKA:
───────────────────────────────────
Error: "Charging Failed"
AI Analysis:
├── Root cause: Connector pin 3 resistance +47% vs baseline
├── Correlation: 847 successful charges, degradation trend
├── Prediction: Complete failure in ~14 days
├── Recommended action: Replace connector assembly
└── Part number: EK-CCS2-CONN-001

→ Tehničar zna šta da donese PRE nego što dođe
→ Popravka za 30 minuta umesto 3 dana
```

#### 2. PREDICTIVE CONNECTOR HEALTH

```
MONITORING PARAMETARA:
──────────────────────
• Kontaktna otpornost (mjerenje tokom svakog punjenja)
• Temperatura konektora vs struja (termalni model)
• Insertion count (mehanički износ)
• Environmental exposure (vlaga, prašina)
• Micro-arcing detection (EMI signature)

AI MODEL:
─────────
• Trenira se na podacima iz flote
• Uči "normalan" vs "degradirajući" konektor
• Predviđa RUL (Remaining Useful Life) konektora
• Alert 2-4 nedelje pre očekivanog kvara
```

#### 3. SELF-HEALING SOFTWARE

```
55% neuspešnih sesija = connectivity/software!

TRADICIONALNO:
• Software bug → punjač ne radi
• Čeka se tehničar da restartuje
• Ili čeka se OTA update (dani/nedelje)

ELEKTROKOMBINACIJA:
• AI detektuje anomaliju u ponašanju
• Automatski retry sa alternativnim pristupom
• Self-healing bez reboot ako moguće
• Ako treba reboot, uradi ga u 3 ujutru (ne tokom dana)
• Svaki modul ima redundantni firmware slot
```

#### 4. DEGRADATION COMPENSATION

```
ZAŠTO PUNJAČI DEGRADIRAJU POSLE 3 GODINE?
─────────────────────────────────────────
• Kapacitori gube kapacitet
• MOSFET-i imaju viši Rds(on)
• Termalni paste se suši
• Senzori driftuju

TRADICIONALNO: Performanse opadaju, zamena posle 5-7 godina

ELEKTROKOMBINACIJA:
• AI prati degradaciju SVAKE komponente
• Automatski kompenzuje:
  - Viši Rds(on)? Smanji switching frequency
  - Termalni drift? Rekalibracija u realnom vremenu
  - Kapacitor aging? Prilagodi control loop
• Performanse OSTAJU ISTE 10+ godina
• Zamena samo kad je ekonomski opravdano
```

#### 5. STANDARDIZED ERROR CODES (Ahead of Industry)

```
ChargeX Consortium TEK SADA preporučuje 26 standard error codes.
Mi možemo implementirati BOLJE od dana 1:

ELEKTROKOMBINACIJA ERROR TAXONOMY:
──────────────────────────────────
EK-HW-PWR-001: Power module SiC MOSFET degradation
EK-HW-THR-002: Coolant flow below threshold
EK-HW-CON-003: Connector resistance out of spec
EK-SW-COM-001: Vehicle communication timeout
EK-SW-PAY-002: Payment backend unreachable
EK-GRD-FRQ-001: Grid frequency out of range
EK-VEH-BAT-001: Vehicle battery rejected charge

Svaki error ima:
• Unique ID
• Root cause kategorija (HW/SW/GRD/VEH/USR)
• Severity level
• Recommended action
• Typical resolution time
• Required parts (if any)
```

---

## Trendovi 2025/2026

### Pozitivni Signali
```
✅ Poboljšanje pouzdanosti - prvi put u 4 godine (J.D. Power)
✅ 16,700 novih fast charging portova očekivano 2025 (2.4x vs 2022)
✅ Kalifornija uvodi 90% success rate standard od 2026
✅ Privatni sektor preuzima inicijativu (Tesla, EVgo, automaker mreže)
✅ 230,000+ javnih charging konektora u SAD-u
```

### Negativni Signali
```
❌ NEVI federalno finansiranje pauzirano (feb 2025)
❌ Siemens otpustio 450 ljudi iz EV charging divizije
❌ LG Electronics napustio tržište (proleće 2025)
❌ 1/3 punjača instaliranih 2023-2025 nikad nije dostigla breakeven
❌ Non-Tesla mreže i dalje značajno lošije (591 vs 709 satisfaction)
```

### Šta ovo znači za ELEKTROKOMBINACIJA

```
PRILIKA:
─────────────────────────────────────────────────────────────
1. Konsolidacija tržišta - slabiji igrači izlaze
2. Fokus na pouzdanost postaje OBAVEZAN (Kalifornija standard)
3. Operateri traže rešenja koja RADE, ne samo jeftina
4. First-mover advantage za 90%+ success rate
5. Prediktivna dijagnostika postaje differentiator
```

---

## Quantified Competitive Advantage

### Reliability ROI Calculator (ažurirano 2025)

```
SCENARIO: Fleet operator sa 20 punjača, 50 sesija/dan/punjač

                            PROSEK 2025     ELEKTROKOMBINACIJA
────────────────────────────────────────────────────────────────
Success rate                84% (J.D.Power) 99%
FTCSR (first-time)          71% (ChargerHelp) 98%
Failed sessions/day         3.2             0.2
Lost revenue/day (€5/fail)  €16             €1
Annual lost revenue         €5,840          €365

Truck rolls/year            30              5
Cost per truck roll         €150            €150
Annual maintenance cost     €4,500          €750

Charger replacement (Y5)    Yes (€180k)     No (AI compensates)
────────────────────────────────────────────────────────────────
5-YEAR TOTAL SAVINGS                        €200,000+
```

**Napomena:** Iako je industrija poboljšala success rate na 84%, FTCSR (first-time)
je i dalje samo 71%. To znači da korisnici moraju često da pokušaju više puta -
frustrirajuće iskustvo koje naša prediktivna dijagnostika eliminiše.

### Pozicioniranje

```
ELEKTROKOMBINACIJA - FOKUS NA POUZDANOST
════════════════════════════════════════

Pristup: Prediktivna dijagnostika kao temelj

KLJUČNE KARAKTERISTIKE:
• First-time charge success rate kao primarna metrika
• AI predviđa probleme pre nego što se dese
• Precizna dijagnostika - ne "error 47" već tačan uzrok
• Kompenzacija degradacije tokom vremena
• Tehničar dolazi sa pravim delom prvi put

CILJ: 98%+ FTCSR (vs industrija 71%)
```

---

## Ostali Nerešeni Problemi (Sekundarne Prilike)

1. **Grid connection** - 75% operatera ima probleme sa mrežom
2. **Payment fragmentation** - 100+ različitih aplikacija
3. **Cable management** - teški kablovi, fizički износ
4. **Queue management** - čekanje, frustracija
5. **Vandalism/theft** - sigurnost opreme
6. **Battery health** - brzo punjenje vs degradacija baterije

---

## Reference

### Konkurenti
- [Kempower Power Module](https://kempower.com/power-module/)
- [Tritium TRI-FLEX](https://www.electrive.com/2025/04/30/tritium-launches-scalable-ev-charging-solution-tri-flex/)
- [Sigenergy V2X](https://www.sigenergy.com/en/products/dc-charger)
- [Delta DeltaGrid](https://www.evengineeringonline.com/this-dc-fast-charger-provides-ai-driven-monitoring-and-predictive-maintenance/)
- [V2G Chargers Guide](https://zecar.com/resources/bidirectional-v2h-and-v2g-ev-chargers-guide)
- [CyberAutonomy Digital Twin](https://www.cyberautonomy.io/)

### Statistika i Izveštaji (2025/2026)
- [J.D. Power 2025 EVX Public Charging Study](https://www.jdpower.com/business/press-releases/2025-us-electric-vehicle-experience-evx-public-charging-study)
- [ChargerHelp 2025 Annual Reliability Report](https://www.chargerhelp.com/2025-annual-reliability-report/)
- [Paren Q2 2025 US EV Fast Charging Report](https://www.paren.app/reports/state-of-the-industry-report-us-ev-fast-charging-q2-2025)
- [Vecharged 2025 Reliability Report](https://vecharged.com/news/ev-charger-reliability-report-2025/)
- [California EV Charging Reliability Standards](https://www.energy.ca.gov/proceedings/active-proceedings/electric-vehicle-charging-infrastructure-reliability-reporting-and)
- [NPR: 2025 Was a Roller Coaster Year for EVs](https://www.npr.org/2025/12/29/nx-s1-5638592/electric-vehicles-2025)
- [Clean Trucking: Why Success Rate Beats Uptime](https://www.cleantrucking.com/infrastructure/charging-infastructure/article/15767696/ev-charging-report-why-success-rate-beats-uptime-in-2025)

### Datum ažuriranja
Poslednje ažuriranje: Januar 2026
