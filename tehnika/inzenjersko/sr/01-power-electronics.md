# Arhitektura energetske elektronike

## Filozofija: Bolje, ne lakše

```
TRADICIONALNO                    ELEKTROKOMBINACIJA
───────────────────────────────────────────────────────────
IGBT (jeftiniji)            →    SiC MOSFET (50% niži gubici)
Dvonivoska topologija       →    3-nivoska NPC (bolji THD, manji stres)
Si diode                    →    SiC Schottky (bez oporavka)
Vazdušno hlađenje          →    Tečno hlađenje (2× gustina)
Fiksna frekvencija PWM     →    AI-optimizovano prekidanje
Fiksni limiti zaštite      →    Adaptivni AI pragovi
Pojedinačni modul          →    Paralelni moduli sa droop kontrolom
```

---

## 1. Izbor SiC MOSFET-a

### Zašto SiC umesto IGBT?

| Parametar | Si IGBT | SiC MOSFET | Prednost |
|-----------|---------|------------|----------|
| Gubici prekidanja | 100% (referenca) | 30-50% | 50-70% niži |
| Gubici provođenja | Vce(sat) ~2V | Rds(on) × I² | 30-40% niži pri parcijalnom opterećenju |
| Maks. temp. spoja | 150°C | 175°C | Veća termalna margina |
| Frekvencija prekidanja | <20 kHz tipično | >100 kHz | 5× viša frekvencija |
| Body dioda | Spor oporavak | Brz/nulti oporavak | Bez gubitaka povratnog oporavka |
| Temperaturni koef. | Negativan | Pozitivan | Prirodno balansiranje struje |

### Izabrani SiC MOSFET-i

#### EK3 (3.3 kW) - Wolfspeed 900V SiC

```
Komponenta: C3M0065090D (preporučeno)
─────────────────────────────────────────
Napon: 900V
Struja: 36A kontinualno
Rds(on): 65 mΩ @ 25°C, ~110 mΩ @ 150°C
Kućište: TO-247-4 (Kelvin source)

Zašto 900V za 650V DC link?
• Optimalan balans cene i margine
• Dovoljna margina za naponske skokove (~40%)
• Bolji Rds(on) od 1200V varijanti
• Niža cena od 1200V klase

Termalno smanjenje snage:
─────────────────────────
Tj (°C)    Rds(on)     Maks struja
25         65 mΩ       36A (100%)
100        95 mΩ       28A (78%)
150        110 mΩ      22A (61%)
175        125 mΩ      18A (50%)

Alternative:
• Infineon IMZ120R045M1 (1200V) - veća margina
• ROHM SCT3030AR (650V) - ako je DC link niži
• Onsemi NTH4L022N065SC (650V) - optimizovano za cenu
```

#### EK30 (30 kW) - Wolfspeed Gen 4

```
Komponenta: CAB011M12FM3 (Six-Pack modul)
─────────────────────────────────────────
Napon: 1200V
Struja: 200A po fazi
Rds(on): 11 mΩ (full bridge 100A konfiguracija)
Kućište: 62mm industrijski standard

Gen 4 prednosti (u odnosu na Gen 3):
• 22% niži Rds(on) @ 125°C
• 60% niža energija uključenja
• 30% niži gubici prekidanja (meka body dioda)
• 50% niži VDS premašaj

Dostupnost: Uzorci sada, proizvodnja Q1 2026
```

---

## 2. Topologija: 3-nivoska NPC (AC/DC PFC stepen)

### 2.1 Arhitektura kontrolne petlje PFC

3-nivoska NPC PFC zahteva strukturu dvostruke petlje: spoljna naponska petlja za regulaciju DC magistrale i unutrašnja strujna petlja za korekciju faktora snage.

```
ARHITEKTURA DVOSTRUKE KONTROLNE PETLJE PFC
════════════════════════════════════════════════════════════════════

                    ┌─────────────────────────────────────┐
                    │       NAPONSKA PETLJA (Spoljna)     │
                    │                                     │
  Vdc_ref ─────────►│  ┌─────┐     ┌──────┐              │
  (800V)            │  │  -  │     │      │    Iref      │
                    │  │  Σ  ├────►│  PI  ├─────────────►│────┐
  Vdc_fb ──────────►│  │  +  │     │      │              │    │
                    │  └─────┘     └──────┘              │    │
                    │                                     │    │
                    │  Propusni opseg: 5-10 Hz           │    │
                    │  Kp = 0.5, Ki = 50                 │    │
                    └─────────────────────────────────────┘    │
                                                               │
    ┌──────────────────────────────────────────────────────────┘
    │
    │   ┌─────────────────────────────────────────────────────────┐
    │   │             STRUJNA PETLJA (Unutrašnja)                 │
    ▼   │                                                         │
  Iref ─┼─►│  PLL  ├──►│   ×   ├─────────────┐                   │
        │  └───────┘   └───────┘             │                    │
        │                                     ▼                    │
        │                               ┌─────────┐    ┌───────┐  │
        │                               │    Σ    ├───►│  PR   ├──┼──► PWM
        │                               └─────────┘    └───────┘  │
        │                                     ▲                    │
        │   ┌──────────────┐                  │                    │
  Iac ──┼──►│ Strujni      ├──────────────────┘                    │
        │   │ senzor       │                                       │
        │   └──────────────┘                                       │
        │                                                         │
        │   Propusni opseg: 1-3 kHz                               │
        │   PR kontroler: Kp=10, Kr=1000, ω0=2π×50Hz             │
        └─────────────────────────────────────────────────────────┘
```

### 2.2 PLL sinhronizacija sa mrežom

```
SOGI-PLL Specifikacije performansi:
────────────────────────────────────
• Vreme zaključavanja (od hladnog starta): <50 ms
• Opseg praćenja frekvencije: 47-53 Hz (±6%)
• Greška faze (stacionarno stanje): <1°
• Odziv na skok frekvencije: <100 ms do smirivanja
• THD odbijanje: >40 dB za 3., 5. harmonik

Implementacija (STM32G474):
──────────────────────────
• Brzina odabiranja: 20 kHz (period 50 µs)
• SOGI pojačanje k: 1.41 (√2 za optimalno prigušenje)
• PI pojačanja: Kp_pll = 100, Ki_pll = 5000
• Vreme izvršavanja: <5 µs po ciklusu
```

### 2.3 Meki start i kontrola inrush struje

```
SEKVENCA MEKOG STARTA
═══════════════════════════════════════════════════════════════

Faza 1: Pred-punjenje (0-500 ms)
─────────────────────────────────
• Relej zaobilazi glavni kontaktor
• Struja ograničena otpornikom za pred-punjenje (50Ω)
• DC magistrala se puni do ~90% vršnog AC napona
• Inrush struja ograničena na <10A vršno

Faza 2: Aktiviranje kontaktora (500-600 ms)
───────────────────────────────────────────
• Relej pred-punjenja se otvara
• Glavni kontaktor se zatvara u tački niske struje

Faza 3: Aktivna rampa (600-5000 ms)
───────────────────────────────────
• PWM postepeno omogućen
• Iref rampa: 0 → 100% tokom 4 sekunde
• Profil rampe: S-kriva (smanjuje stres)

Faza 4: Normalan rad (>5000 ms)
───────────────────────────────
• Puna snaga dostupna
• Zaštitni sistemi aktivirani
```

---

## 3. DC-DC stepen: LLC rezonantni

### 3.1 Metodologija dizajna LLC

```
TOK DIZAJNA LLC
═══════════════════════════════════════════════════════════════

Korak 1: Definisanje zahteva
────────────────────────────
• Opseg ulaznog napona: Vin_min do Vin_max
• Opseg izlaznog napona: Vout_min do Vout_max
• Izlazna snaga: Pout
• Ciljana efikasnost: η

Korak 2: Proračun odnosa transformatora
───────────────────────────────────────
n = Vin_nom / (2 × Vout_nom)

Za EK3: n = 650V / (2 × 400V) = 0.8125 ≈ 1:1.2
Prilagođeno za gubitke: n = 1:1 sa modulacijom frekvencije
```

### 3.2 Proračuni rezonantnog tanka za EK3

```
EK3 LLC PARAMETRI:
═══════════════════════════════════════
Rezonantna frekvencija (fr):    190 kHz
Opseg prekidanja:               150-250 kHz
Rezonantna induktivnost (Lr):   15 µH
Rezonantni kondenzator (Cr):    47 nF (filmski, 500V AC)
Magnetizaciona induktivnost (Lm): 150 µH
Odnos transformatora (n):       1:1
Mrtvo vreme:                    100-200 ns

ZVS verifikacija:
I_mag_vršno = Vin / (4 × Lm × fsw) = 5.7 A
Uskladištena energija: E = 2.4 mJ >> E_coss = 0.085 mJ ✓
```

### 3.3 Dizajn transformatora

```
PLANARNI TRANSFORMATOR ZA EK3
════════════════════════════════════════════════════════════════

Izbor jezgra: Ferit 3C97 (TDK/EPCOS)
• Optimizovan za 100-500 kHz
• Nizak gubitak jezgra: <200 mW/cm³ @ 200 kHz, 50 mT

Geometrija jezgra: E-jezgro (planarno)
• Ae = 178 mm² (efektivna površina)
• Ve = 14960 mm³ (zapremina)

Gustina fluksa: B_vršno = 60 mT (ispod saturacije od 400 mT)

Konfiguracija namotaja:
• Primar: 8 zavoja, 4 sloja, 2 oz Cu
• Sekundar: 8 zavoja, 4 sloja, 2 oz Cu
• Preplitanje P-S-S-P-P-S-S-P minimizuje rasipanje

Rasipna induktivnost = Lr = 15 µH (ugrađeno u transformator)

Izolacija:
• Rastojanje puzanja: 6 mm
• Hipot test: 4 kVAC tokom 1 minuta
```

### 3.4 Frekvencijski odziv i krive pojačanja

```
KARAKTERISTIKE POJAČANJA LLC
════════════════════════════════════════════════════════════════

Radne oblasti:
──────────────
Oblast 1 (fn < 1): Ispod rezonance → Pojačanje > 1 (boost)
Oblast 2 (fn = 1): Na rezonanci → Maksimalna efikasnost
Oblast 3 (fn > 1): Iznad rezonance → Pojačanje < 1 (buck)

Radni opseg EK3:
fn_min = 0.79 (150 kHz / 190 kHz) → M ≈ 0.95
fn_max = 1.32 (250 kHz / 190 kHz) → M ≈ 0.65

ZVS granica:
ZVS je garantovan kada: I_mag > I_load / (2 × n)
Pri 10% opterećenja: 5.7A >> 0.42A ✓ (ZVS održan)
```

### 3.5 Bidirekcioni LLC za V2G rad

```
BIDIREKCIONA LLC TOPOLOGIJA
════════════════════════════════════════════════════════════════

Normalni režim (Mreža → Baterija): AC/DC punjenje
• Primarna strana: Polumost pogoni LLC tank
• Sekundarna strana: Sinhrona rektifikacija

V2G režim (Baterija → Mreža): DC/AC pražnjenje
• SR1, SR2 postaju aktivni prekidači
• S1, S2 postaju sinhroni ispravljači
• Snaga teče od baterije ka DC magistrali

V2G efikasnost:
AC → DC (punjenje):  95.3%
DC → AC (V2G):       94.8%
Round-trip:          90.3%
```

---

## 4. Dizajn gate drajvera

```
SiC SPECIFIČNOSTI
─────────────────
1. Viši prag gate-a: ~4V (naspram 2V za Si)
2. Niža gate kapacitivnost: Brže prekidanje, ali više dv/dt
3. Miller plato: Kraći, zahteva brži drajver
4. Parazitno uključenje: Osetljivo na dv/dt indukovani šum

REŠENJE: +18V/-5V Gate pogon
• +18V: Obezbeđuje nizak Rds(on) na visokoj temperaturi
• -5V: Sprečava lažno uključenje od dv/dt šuma
• Kelvin source: Eliminiše zajedničku induktivnost source-a

Preporučeni IC: Silicon Labs Si823Hx
• Vršna izlazna struja: 8A source/sink
• Kašnjenje propagacije: <50 ns
• CMTI: >200 kV/µs
```

---

## 5. EMI/EMC dizajn

```
EMI FILTER TOPOLOGIJA
════════════════════════════════════════════════════════════════

Vrednosti komponenti za EK3:
────────────────────────────
CM prigušnica (CMC): 2 × 4.7 mH, nanokristalna
DM prigušnik (L_dm): 2 × 47 µH, praškasto gvožđe
X kondenzator (C_x): 2.2 µF, 275V AC, X2 klasa
Y kondenzator (C_y): 4.7 nF, 300V AC, Y2 klasa

Ciljevi prigušenja (CISPR 11 klasa A):
150 kHz - 500 kHz:  66 dBµV, margina >10 dB
500 kHz - 5 MHz:    56 dBµV, margina >10 dB
5 MHz - 30 MHz:     60 dBµV, margina >10 dB

3-nivoska NPC prirodno ima niži dv/dt:
• 2-nivoska: dv/dt = 16 kV/µs
• 3-nivoska: dv/dt = 8 kV/µs
```

---

## 6. Sistemi zaštite

```
HARDVERSKA ZAŠTITA
──────────────────
DESAT detekcija: Prag Vds > 8V, blanking 500 ns
Zaštita od prekostruje: 1-2 mΩ šant ili Hall senzor
Zaštita od prenapona: Aktivno klamp kolo na DC magistrali

AI-POBOLJŠANA ZAŠTITA
─────────────────────
• Hladan start: Dozvoliti viši inrush jer su komponente hladne
• Topao rad: Smanjiti limit struje jer je termalna margina manja
• Ostarele komponente: AI detektuje degradaciju, prilagođava limite
• Prediktivno: Anticipira probleme pre nego što se dogode
```

---

## 7. Koordinacija više modula

### 7.1 Droop kontrola za paralelni rad

```
OSNOVE DROOP KONTROLE
════════════════════════════════════════════════════════════════

Vout = Vref - Rd × Iout

Za EK3 @ 400V izlaz:
  Vref = 412V (bez opterećenja)
  Vout_puno = 400V (puno opterećenje @ 8.25A)
  ΔV = 12V (3% droop)
  Rd = 12V / 8.25A = 1.45Ω (virtualno)

Tačnost deljenja struje:
• Bez komunikacije: ±5%
• Sa CAN-FD podešavanjem: ±2%
```

### 7.2 CAN-FD protokol za deljenje opterećenja

```
CAN-FD PORUKE @ 5 Mbps
═════════════════════════════════════════

0x100-0x1FF: Status modula (svakih 10 ms)
0x200-0x2FF: Komande mastera
0x300-0x3FF: Alarmi (prioritet)
0x400-0x4FF: Termalni podaci (svakih 100 ms)

Poruka statusa modula (64 bajta):
• ID modula, Vout, Iout, Vin
• Temp hladnjaka, Temp MOSFET-a
• Stanje, Kod greške
• Kumulativna energija, Uptime
• CRC32
```

### 7.3 Prevencija cirkulišuće struje

```
STRATEGIJE UBLAŽAVANJA
──────────────────────
1. Sinhrono omogućavanje/onemogućavanje
2. Usklađivanje izlazne impedanse (10 µH prigušnik)
3. Aktivno prigušenje (virtualna impedansa)
4. Zahtev minimalnog opterećenja (>5%)

Praćenje: I_circ = |Iout - Iavg|
• Alarm: I_circ > 0.5A (trajanje >1s)
• Greška: I_circ > 2A (trenutno gašenje)
```

---

## 8. Dizajn V2G energetskog stepena

### 8.1 Režim invertera povezanog sa mrežom

```
V2G RAD
═══════════════════════════════════════════════════════════════

Kontrola: Strujno-kontrolisan naponski izvor
• Ubacuje struju u fazi sa naponom mreže (jedinični PF)
• Ili kontrolisan fazni pomak za reaktivnu snagu

Jednačine:
P = V_mreža × I_mreža × cos(φ)
Q = V_mreža × I_mreža × sin(φ)

Za 30 kW @ jediničnom PF:
I_mreža = 30000 / (√3 × 400) = 43.3 A po fazi
```

### 8.2 Anti-ostrvljenje zaštita

```
DETEKCIJA ANTI-OSTRVLJENJA
════════════════════════════════════════════════════════════════

Pasivne metode:
• Prenapon/Podnapon: ±10%, <160 ms
• Prefrekvencija/Podfrekvencija: ±0.5 Hz, <160 ms
• df/dt: >1 Hz/s, <50 ms
• Vektorski pomak: >10°, <50 ms

Aktivne metode:
• Pomak frekvencije (AFD): Δf = 0.5 Hz
• Merenje impedanse: 75 Hz harmonik

Odziv: Prestati sa napajanjem u roku od 2s (IEEE 1547)

Usklađenost:
• IEEE 1547-2018
• IEC 62116
• EN 50549-1
```

### 8.3 Podrška reaktivne snage (Volt-VAR)

```
VOLT-VAR KONTROLA
═══════════════════════════════════════════════════════════════

Parametri krive:
V1 = 0.92 pu (208 V) → Početak reaktivne apsorpcije
V2 = 0.98 pu (222 V) → Kraj zone maksimalne apsorpcije
V3 = 1.02 pu (231 V) → Početak zone maksimalnog ubacivanja
V4 = 1.08 pu (245 V) → Početak limita reaktivnog ubacivanja

Za EK30 @ 30 kW:
• S_rated = 33 kVA
• Pri P = 24 kW: Q_dostupno = ±19.8 kVAR
```

---

## 9. Karakterizacija efikasnosti

### 9.1 Analiza razlaganja gubitaka

```
RAZLAGANJE GUBITAKA EK3 @ 3.3 kW
═══════════════════════════════════════════════════════════════
Komponenta              Snaga (W)    % ukupno
───────────────────────────────────────────────────────────────
SiC MOSFET provođenje     6.1         4.0%
SiC MOSFET prekidanje    18.0        11.8%
Sinhroni ispravljač       4.2         2.8%
Jezgro transformatora     2.3         1.5%
Bakar transformatora      3.8         2.5%
Rezonantni kondenzator    0.3         0.2%
Gate drajveri            11.0         7.2%
Kontrola/aux              3.0         2.0%
Ostalo                    3.0         2.0%
───────────────────────────────────────────────────────────────
UKUPNI GUBICI            51.7W       100%
═══════════════════════════════════════════════════════════════

EFIKASNOST @ 3.3 kW: η = 98.5% [CILJ]
Trenutni dizajn: ~95.3%
```

### 9.2 Mape efikasnosti

```
2D MAPA EFIKASNOSTI: EK3
════════════════════════════════════════════════════════════════

        Vout (V)
        │
   500  │  92.1   93.5   94.8   95.2   95.0   94.5
   450  │  92.8   94.2   95.4   95.8   95.6   95.0
   400  │  93.4   94.8   96.0   96.2   96.0   95.3  ← Dizajn tačka
   350  │  93.0   94.5   95.6   95.8   95.5   94.8
   300  │  92.4   93.8   94.8   95.0   94.6   93.8
        └──────────────────────────────────────────► Opterećenje %
            10%    25%    50%    75%    90%   100%

Vršna efikasnost (96.2%) pri 75% opterećenja, 400V izlaz

[Napomena: CILJANE specifikacije. Stvarna merenja TBD.]
```

### 9.3 Termalno smanjenje snage

```
RASPORED SMANJENJA
───────────────────
T_amb (°C)    Pmax (kW)
-20 do 25     3.6 kW (vršna)
25 do 40      3.3 kW (nominalno)
40 do 50      2.8 kW (85%)
50 do 55      2.3 kW (70%)
55 do 60      1.8 kW (55%)
60 do 70      1.3 kW (minimum)
>70           Gašenje
```

---

## 10. Prelazni odziv

### 10.1 Odziv na skok opterećenja

```
SPECIFIKACIJE (10% → 90% skok)
═══════════════════════════════════════════════════════════════
Parametar               Cilj
──────────────────────────────────────────
Podnapon               <5%
Prenapon               <5%
Vreme oporavka (do 1%) <200 µs
Vreme smirivanja       <1 ms
Vršni strujni premašaj <20%
```

### 10.2 Analiza stabilnosti

```
MARGINE STABILNOSTI
═══════════════════════════════════════════════════════════════
Petlja              Presek       Fazna margina  Pojač. margina
────────────────────────────────────────────────────────────────
Naponska petlja     500 Hz       >60°           >10 dB
Strujna petlja      15 kHz       >75°           >12 dB
PLL petlja          20 Hz        >50°           >15 dB
```

---

## 11. Lista materijala - Energetski stepen

### EK3 (3.3 kW)

| Komponenta | Broj dela | Kol | Jedin. cena | Ukupno |
|------------|-----------|-----|-------------|--------|
| SiC MOSFET 900V | C3M0065090D | 4 | €18 | €72 |
| SiC Schottky 650V | C3D10065A | 4 | €8 | €32 |
| Gate drajver | Si823H | 2 | €12 | €24 |
| Rezonantni kondenzator | Filmski, 200kHz | 4 | €5 | €20 |
| Planarni transformator | PCB integrisani | 1 | €60 | €60 |
| DC link kondenzator | Filmski 800V, 100µF | 2 | €20 | €40 |
| CM prigušnica | Nanokristalna | 1 | €25 | €25 |
| Strujni senzor | TLI4971 | 1 | €8 | €8 |
| Hladnjak + Vapor Chamber | Aluminijum | 1 | €35 | €35 |
| PCB | 4-sloja, 2oz Cu | 1 | €50 | €50 |
| STM32G474 + pasivne | MCU + CAN-FD | 1 | €15 | €15 |
| Konektori | Blind-mate | 1 | €30 | €30 |
| **UKUPNO** | | | | **€411** |

### EK30 (30 kW)

| Komponenta | Broj dela | Kol | Jedin. cena | Ukupno |
|------------|-----------|-----|-------------|--------|
| SiC modul 1200V | CAB011M12FM3 | 2 | €350 | €700 |
| SiC MOSFET 650V | Razni | 12 | €20 | €240 |
| Gate drajver modul | Integrisani | 2 | €80 | €160 |
| LLC transformator | Prilagođeni, 10kW | 3 | €150 | €450 |
| DC bus kondenzator | 900V, filmski | 1 set | €200 | €200 |
| CM prigušnica | Visokostrujna | 1 | €80 | €80 |
| Strujni senzori | Industrijski | 6 | €25 | €150 |
| Coldplate | Aluminijum, kanali | 1 | €150 | €150 |
| PCB sklop | 6-sloja, teški Cu | 1 | €200 | €200 |
| Konektori, sabirnice | Visokostrujni | - | - | €150 |
| **UKUPNO** | | | | **€2,480** |

---

## 12. Ciljevi performansi

### EK3 ciljevi

```
Parametar               Cilj        Napomene
──────────────────────────────────────────
Vršna efikasnost        >96%        @ 50-75% opterećenja
Efikasnost pune snage   >95%        @ 3.3 kW
Efikasnost niskog opt.  >90%        @ 10% opterećenja
Snaga mirovanja         <3W         Režim dubokog spavanja
Vreme uključenja        <5s         Spremnost za vruću zamenu
Vreme vruće zamene      <1s         Električno isključenje
Komunikacija            CAN-FD      @ 5 Mbps
Odziv na skok opt.      <200 µs     <5% devijacija
V2G round-trip          >90%        AC→DC→AC
```

### EK30 ciljevi

```
Parametar               Cilj        Napomene
──────────────────────────────────────────
Vršna efikasnost        >98%        @ 50% opterećenja
Efikasnost pune snage   >97%        @ 30 kW
THD (struja)            <2%         Prednost 3-nivovske
Faktor snage            >0.995      T-type NPC
V2G round-trip          >94%        AC→DC→AC
Reaktivna snaga         ±50%        Od nazivne kVA
Anti-ostrvljenje        <2s         IEEE 1547 usklađeno
```

---

## 13. Testiranje i validacija

```
FAZE TESTIRANJA
═══════════════════════════════════════════════════════════════

Faza 1: Verifikacija komponenti
□ Karakterizacija prekidanja SiC MOSFET-a
□ Verifikacija induktivnosti transformatora
□ Merenje frekvencije rezonantnog tanka

Faza 2: Testiranje otvorene petlje
□ ZVS verifikacija
□ EMI pred-usklađenost sken
□ Efikasnost na fiksnoj radnoj tački

Faza 3: Testiranje zatvorene petlje
□ Tačnost regulacije napona
□ Odziv na skok opterećenja
□ Termalno stacionarno stanje

Faza 4: Sistemska integracija
□ CAN-FD komunikacija
□ Paralelni rad više modula
□ Droop kontrola
□ V2G prelazi

Faza 5: Testiranje usklađenosti
□ CISPR 11 sprovedene emisije
□ IEC 61000-4-x testovi imunosti
□ IEC 62477 procena bezbednosti
```

---

## 14. Reference i izvori

### Datašitovi komponenti
- [Wolfspeed C3M0065090D](https://www.wolfspeed.com/products/power/sic-mosfets/900v-silicon-carbide-mosfets/)
- [Wolfspeed 1200V SiC MOSFET-i](https://www.wolfspeed.com/products/power/sic-mosfets/1200v-silicon-carbide-mosfets/)
- [Silicon Labs Si823H Gate drajver](https://www.silabs.com/power/gate-drivers)
- [Infineon TLI4971 strujni senzor](https://www.infineon.com/cms/en/product/sensor/current-sensors/)

### Aplikacione note
- [Wolfspeed 30kW prepleteni LLC](https://forum.wolfspeed.com/uploads/22UYEDDEDTVL/a-sic-based-30kw-three-phases-interleaved-llc-converter-for-ev-fast-charger.pdf)
- [ON Semi - topologije brzog DC EV punjenja](https://www.onsemi.com/pub/collateral/tnd6366-d.pdf)

### Standardi
- IEC 62477-1: Bezbednosni zahtevi za sisteme energetskih elektronskih konvertora
- IEC 61851-23: Zahtevi za DC EV punionice
- IEEE 1547-2018: Međupovezivanje i interoperabilnost DER
- CISPR 11: Industrijski EMC limiti
- EN 50549-1: Zahtevi za povezivanje na mrežu

### Srodna dokumentacija
- `tehnika/SPECIFICATIONS.md` - Master specifikacija
- `patent/03-TECHNICAL-SUPPORT/EK3-DETAILED-DESIGN.md` - Kompletan dizajn EK3 modula
- `tehnika/komponente/power-electronics.md` - Vienna ispravljač PFC detalji
- `tehnika/04-v2g-grid.md` - Arhitektura V2G sistema
- `tehnika/03-thermal-management.md` - Dizajn sistema hlađenja
