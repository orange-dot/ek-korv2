# EK3 Specifikacija Konektora

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-015 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled Konektora

### 1.1 Filozofija Dizajna: Blind-Mate

EK3 konektor sistem je dizajniran za blind-mate operaciju, omogućavajući:

1. **Robotsko umetanje**: Nije potrebno vizualno poravnanje
2. **Hot-swap mogućnost**: Zamena modula bez gašenja rack-a
3. **Visoka pouzdanost**: Samo-poravnanje sa pozitivnom povratnom informacijom o angažovanju
4. **Bezbednost**: Sekvencirano spajanje (masa prva, snaga poslednja)

### 1.2 Rezime Zahteva

| Zahtev | Specifikacija |
|--------|---------------|
| Nominalna snaga | 3.3 kW po modulu |
| DC napon | 200-920 VDC |
| DC struja | Do 4A kontinualno |
| Broj signala | 12 signala (CAN, SPI, I2C, ID) |
| Ciklusi spajanja | >10,000 |
| Hot-swap | Da, sa pre-charge |
| Kompatibilnost sa robotom | Da |

---

## 2. Mehanički Dizajn

### 2.1 Izbor Konektora

**Primarna preporuka: TE Connectivity MULTIGIG RT**

| Parametar | Vrednost |
|-----------|----------|
| Serija | MULTIGIG RT 2-R |
| Broj kontakata | 20 pozicija |
| Power kontakti | 8 (4 × DC+, 4 × DC-) |
| Signal kontakti | 12 |
| Korak | 2.0 mm |
| Strujno opterećenje | 30A po power kontaktu |
| Naponsko opterećenje | 1000 VDC |
| Ciklusi spajanja | 10,000+ |

**Alternativa: Amphenol Millipacs**

| Parametar | Vrednost |
|-----------|----------|
| Serija | Millipacs 070 |
| Konfiguracija | Custom 20-pin |
| Strujno opterećenje | 25A po kontaktu |
| Ciklusi spajanja | 5,000 |
| Primena | Opcija niže cene |

### 2.2 Raspored Konektora

```
┌─────────────────────────────────────────────────────────────────┐
│                    Raspored 20-Pin Konektora                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Strana Modula (Muški)           Strana Backplane-a (Ženski)  │
│                                                                  │
│    ┌───────────────────────┐        ┌───────────────────────┐   │
│    │                       │        │                       │   │
│    │  1   2   3   4   5    │        │  1   2   3   4   5    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    │  6   7   8   9  10    │        │  6   7   8   9  10    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │       ▼               │        │       ▼               │   │
│    │     (ključ)           │        │    (utor za ključ)    │   │
│    │ 11  12  13  14  15    │        │ 11  12  13  14  15    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    │ 16  17  18  19  20    │        │ 16  17  18  19  20    │   │
│    │  ●   ●   ●   ●   ●    │   →    │  ○   ○   ○   ○   ○    │   │
│    │                       │        │                       │   │
│    └───────────────────────┘        └───────────────────────┘   │
│                                                                  │
│    ● = Muški pin (modul)                                        │
│    ○ = Ženski socket (backplane)                                │
│    ▼ = Polarizacioni ključ                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Sistem Ključeva

**Polarizacioni Ključ:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Konfiguracije Ključeva                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Pozicija Ključa A: EK3 Standard (3.3 kW, 920V max)           │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │      ▼              │  Ključ na poziciji 7-8               │
│    │  ● ●   ● ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Pozicija Ključa B: EK3-HV (Visoki Napon, 1200V)              │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │        ▼            │  Ključ na poziciji 8-9               │
│    │  ● ● ●   ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Pozicija Ključa C: Rezervisano (Buduće)                      │
│    ┌─────────────────────┐                                      │
│    │  ● ● ● ● ●          │                                      │
│    │  ● ● ● ● ●          │                                      │
│    │    ▼                │  Ključ na poziciji 6-7               │
│    │  ●   ● ● ● ●        │                                      │
│    │  ● ● ● ● ●          │                                      │
│    └─────────────────────┘                                      │
│                                                                  │
│    Nekompatibilni ključevi sprečavaju pogrešno umetanje         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Umetanje i Vađenje

**Zahtevi Sile:**

| Operacija | Sila | Tolerancija |
|-----------|------|-------------|
| Umetanje (max) | 50 N | ±10 N |
| Vađenje (min) | 20 N | ±5 N |
| Angažovanje brave | 10 N | ±3 N |
| Otpuštanje brave | 15 N | ±5 N |

**Mehanizam Zaključavanja:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Mehanizam Poluge za Zaključavanje             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Otključana Pozicija:              Zaključana Pozicija:       │
│                                                                  │
│    ┌──────────────────┐              ┌──────────────────┐       │
│    │                  │              │                  │       │
│    │  ┌─────────────┐ │              │  ┌─────────────┐ │       │
│    │  │   Modul     │ │              │  │   Modul     │ │       │
│    │  │             │ │              │  │             │ │       │
│    │  │    ╔═╗      │ │              │  │    ╔═╗      │ │       │
│    │  │    ║ ║◄─────┼─┘              │  │    ║▄║◄─────┼─┘       │
│    │  │    ╚═╝ Poluga│               │  │    ╚═╝ Poluga│        │
│    │  │             │                │  │     │       │         │
│    │  └─────────────┘                │  └─────┼───────┘         │
│    │                                 │        │                  │
│    │  Poluga: GORE (otvoreno)        │  Poluga: DOLE (zaključano)│
│    │                                 │        ▼                  │
│    └──────────────────┘              │  Angažuje slot backplane-a│
│                                      └──────────────────┘       │
│                                                                  │
│    Sekvenca zaključavanja:                                       │
│    1. Umetnuti modul dok poluga ne dodirne backplane            │
│    2. Rotirati polugu 90° nadole                                │
│    3. Cam akcija vuče modul u finalnu poziciju                  │
│    4. Pozitivan klik označava puno angažovanje                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Ocene Ciklusa Spajanja

| Parametar | Specifikacija |
|-----------|---------------|
| Ocenjeni ciklusi | 10,000 minimum |
| Test standard | EIA-364-09 |
| Habanje kontakta | <20 mΩ povećanje @ 10K ciklusa |
| Habanje kućišta | Bez vidljivog oštećenja @ 10K ciklusa |

**Dizajn za 10,000 ciklusa:**
- Pozlaćeni kontakti (1.27 µm min)
- Samo-čisteći dizajn kontakta
- Polimersko kućište sa ugrađenim lubrikantom
- Vodeće šine sprečavaju ugaono umetanje

---

## 3. Električni Dizajn

### 3.1 Raspored Pinova

```
┌─────────────────────────────────────────────────────────────────┐
│                     Tabela Rasporeda Pinova                      │
├──────┬─────────────┬───────────────────────────────────────────┤
│ Pin  │ Signal      │ Opis                                      │
├──────┼─────────────┼───────────────────────────────────────────┤
│  1   │ GND         │ Masa šasije (prvo spajanje)               │
│  2   │ GND         │ Masa šasije (prvo spajanje)               │
│  3   │ CAN-A_H     │ CAN Bus A, High                           │
│  4   │ CAN-A_L     │ CAN Bus A, Low                            │
│  5   │ CAN-B_H     │ CAN Bus B (backup), High                  │
├──────┼─────────────┼───────────────────────────────────────────┤
│  6   │ CAN-B_L     │ CAN Bus B (backup), Low                   │
│  7   │ KEY         │ Pozicija ključa (bez kontakta)            │
│  8   │ KEY         │ Pozicija ključa (bez kontakta)            │
│  9   │ SPI_CLK     │ Dijagnostika SPI clock                    │
│ 10   │ SPI_MOSI    │ Dijagnostika SPI data out                 │
├──────┼─────────────┼───────────────────────────────────────────┤
│ 11   │ SPI_MISO    │ Dijagnostika SPI data in                  │
│ 12   │ SPI_CS      │ Dijagnostika SPI chip select              │
│ 13   │ I2C_SDA     │ EEPROM I2C data                           │
│ 14   │ I2C_SCL     │ EEPROM I2C clock                          │
│ 15   │ MOD_ID_0    │ Module ID bit 0 (kodiran otpornikom)      │
├──────┼─────────────┼───────────────────────────────────────────┤
│ 16   │ MOD_ID_1    │ Module ID bit 1 (kodiran otpornikom)      │
│ 17   │ DC+         │ DC Bus pozitivan (poslednje spajanje)     │
│ 18   │ DC+         │ DC Bus pozitivan (poslednje spajanje)     │
│ 19   │ DC-         │ DC Bus negativan (poslednje spajanje)     │
│ 20   │ DC-         │ DC Bus negativan (poslednje spajanje)     │
└──────┴─────────────┴───────────────────────────────────────────┘
```

### 3.2 Dizajn Power Pinova

**DC Bus Konekcije:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Konfiguracija Power Pinova                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ Šina (Pinovi 17, 18):                                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Pin 17 ────┬──── DC+ ka Modulu                      │  │
│    │               │                                         │  │
│    │    Pin 18 ────┘     Kombinovano: 60A kapacitet         │  │
│    │                     (30A × 2 pina, deratirano na 4A)   │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    DC- Šina (Pinovi 19, 20):                                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │                                                         │  │
│    │    Pin 19 ────┬──── DC- ka Modulu                      │  │
│    │               │                                         │  │
│    │    Pin 20 ────┘     Kombinovano: 60A kapacitet         │  │
│    │                     (redundancija za pouzdanost)       │  │
│    │                                                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Električne Specifikacije:                                    │
│    • Naponska ocena: 1000 VDC                                  │
│    • Struja po pinu: 30A max                                   │
│    • Ukupna struja: 4A kontinualno (dizajn limit)              │
│    • Kontaktna otpornost: <1 mΩ po pinu                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Dizajn Signal Pinova

**CAN Diferencijalni Parovi:**

| Parametar | Specifikacija |
|-----------|---------------|
| Impedansa | 120Ω diferencijalno |
| Brzina podataka | 5 Mbps (CAN-FD) |
| Naponski nivoi | CAN 2.0 (dominant: 1.5-3.0V diferencijalno) |
| Common mode | 0-12V |
| Zaštita | TVS diode na strani modula |

**Dijagnostički Interfejs (SPI):**

| Parametar | Specifikacija |
|-----------|---------------|
| Frekvencija clock-a | Do 10 MHz |
| Naponski nivoi | 3.3V CMOS |
| Svrha | Fabrički test, terenska dijagnostika |
| Upotreba | Ne koristi se tokom normalnog rada |

**Kodiranje ID-a Modula Otpornikom:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   Enkodiranje ID-a Modula                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ID pinovi koriste razdelnik napona:                          │
│                                                                  │
│    3.3V ────┬───────────────────────► MOD_ID_x                  │
│             │                                                    │
│            ┌┴┐                                                   │
│            │ │ R_top                                             │
│            └┬┘                                                   │
│             │                                                    │
│            ─┴─ R_bot                                             │
│             │                                                    │
│            ─┴─ GND                                               │
│                                                                  │
│    Tabela ID Enkodiranja:                                        │
│    ┌─────────┬─────────┬─────────┬──────────────────────┐       │
│    │ ID[1:0] │ R_top   │ R_bot   │ Napon (približno)    │       │
│    ├─────────┼─────────┼─────────┼──────────────────────┤       │
│    │   00    │ 10kΩ    │ GND     │ 0V                   │       │
│    │   01    │ 10kΩ    │ 10kΩ    │ 1.65V                │       │
│    │   10    │ 10kΩ    │ 3.3kΩ   │ 0.82V                │       │
│    │   11    │ 10kΩ    │ 22kΩ    │ 2.27V                │       │
│    └─────────┴─────────┴─────────┴──────────────────────┘       │
│                                                                  │
│    Svrha: Identifikacija slota za praćenje inventara            │
│           (Modul ima otpornike, backplane ima ADC)              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Sekvenciranje Pre-Charge

Hot-swap zahteva kontrolisanu primenu snage da se spreči oštećenje od luka:

```
┌─────────────────────────────────────────────────────────────────┐
│                  Sekvenca Spajanja (Prvo do Poslednje)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Dubina Umetanja (mm)    Signal Kontakta                      │
│    ────────────────────    ──────────────                        │
│                                                                  │
│          0 ──────────────► Modul nije umetnut                   │
│          │                                                       │
│          │                                                       │
│         10 ──────────────► GND (pinovi 1, 2) PRVI               │
│          │                 • Masa šasije uspostavljena          │
│          │                 • Putanja za statičko pražnjenje     │
│          │                                                       │
│         15 ──────────────► Signali (pinovi 3-16)                │
│          │                 • CAN busevi povezani                │
│          │                 • Modul najavljuje prisustvo         │
│          │                 • Pre-charge kolo omogućeno          │
│          │                                                       │
│         20 ──────────────► Snaga (pinovi 17-20) POSLEDNJI       │
│          │                 • DC bus povezan                     │
│          │                 • Pre-charge ograničava inrush       │
│          │                 • Modul soft-start                   │
│          │                                                       │
│         25 ──────────────► Puno angažovanje (zaključano)        │
│                                                                  │
│    Razlika Dužine Pinova:                                        │
│    • GND pinovi: +3mm duži                                      │
│    • Signal pinovi: nominalna dužina                            │
│    • Power pinovi: -3mm kraći                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pre-Charge Kolo (Strana Modula):**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Pre-Charge Kolo                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ (sa konektora)                                           │
│         │                                                        │
│         ├────────────────────────────────┐                      │
│         │                                │                      │
│        ─┴─ K1 (glavni kontaktor)        ─┴─                     │
│        ─┬─                               │  R_precharge         │
│         │                                │  (100Ω, 50W)         │
│         │                               ─┬─                     │
│         │                                │                      │
│         │    K2 (precharge relej)       ─┴─                     │
│         │         ─┬─                                           │
│         │          │                                            │
│         ├──────────┴─────────────────────┤                      │
│         │                                │                      │
│         ▼                                │                      │
│    DC Link Kondenzatori                  │                      │
│    (100µF ukupno)                        │                      │
│         │                                │                      │
│         └────────────────────────────────┴──────► Ka konverteru │
│                                                                  │
│    Sekvenca:                                                     │
│    1. Modul umetnut, GND se spaja prvi                          │
│    2. CAN povezan, modul detektovan                             │
│    3. Stanica omogućava pre-charge (K2 zatvoren)                │
│    4. DC link se puni preko R_precharge                         │
│    5. Kada Vlink > 90% Vbus, K1 se zatvara                      │
│    6. K2 se otvara (precharge završen)                          │
│    7. Modul spreman za rad                                      │
│                                                                  │
│    Vreme pre-charge: ~500ms (τ = R×C = 100Ω × 100µF × 5)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. ESD Zaštita

### 4.1 Strategija Zaštite

```
┌─────────────────────────────────────────────────────────────────┐
│                    Šema ESD Zaštite                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Lokacija: Strana modula (svi signal i power pinovi)          │
│                                                                  │
│    Signal Pinovi (CAN, SPI, I2C):                               │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │    Pin Konektora ──┬──────────────────► Ka MCU/Xcvr   │    │
│    │                    │                                  │    │
│    │                   ─┴─                                 │    │
│    │                   ╲╱  TVS (bidirekciona)             │    │
│    │                   ─┬─  PESD5V0S2BT                   │    │
│    │                    │   • Radni napon: 5V              │    │
│    │                   ─┴─  • Clamp napon: 15V             │    │
│    │                    │   • ESD ocena: ±30 kV            │    │
│    │                   GND                                 │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
│    Power Pinovi (DC+, DC-):                                     │
│    ┌───────────────────────────────────────────────────────┐    │
│    │                                                       │    │
│    │    DC+ Pin ────────┬──────────────────► Ka DC linku   │    │
│    │                    │                                  │    │
│    │                   ─┴─                                 │    │
│    │                    │  Varistor                        │    │
│    │                   ─┬─  V1000LA40BP                    │    │
│    │                    │   • Clamping: 1650V              │    │
│    │                   ─┴─  • Energija: 300J               │    │
│    │                    │                                  │    │
│    │    DC- Pin ────────┴──────────────────► Ka DC linku   │    │
│    │                                                       │    │
│    └───────────────────────────────────────────────────────┘    │
│                                                                  │
│    Ground Pinovi:                                                │
│    • Direktna konekcija na šasiju (TVS nije potreban)           │
│    • Pruža putanju ESD pražnjenja za sve ostale pinove          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 ESD Ocene

| Parametar | Specifikacija | Test Standard |
|-----------|---------------|---------------|
| HBM (Human Body Model) | ±15 kV | ANSI/ESDA/JEDEC JS-001 |
| CDM (Charged Device Model) | ±2 kV | ANSI/ESDA/JEDEC JS-002 |
| Kontaktno pražnjenje | ±8 kV | IEC 61000-4-2 |
| Pražnjenje kroz vazduh | ±15 kV | IEC 61000-4-2 |

---

## 5. Termalne Razmatranja

### 5.1 Porast Temperature Kontakta

| Struja | Porast Temperature | Limit |
|--------|-------------------|-------|
| 4A kontinualno | <15°C | 30°C max |
| 10A (tranzijentno, 10s) | <25°C | 40°C max |
| 30A (vršno, 100ms) | <10°C | 40°C max |

### 5.2 Derating

```
┌─────────────────────────────────────────────────────────────────┐
│                Derating Struje Kontakta                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Struja                                                        │
│    (A)                                                           │
│     30 ┼───────┐                                                │
│        │       │                                                 │
│     25 ┼       └────┐                                           │
│        │            │                                            │
│     20 ┼            └────┐                                      │
│        │                 │                                       │
│     15 ┼                 └────┐                                 │
│        │                      │                                  │
│     10 ┼                      └────┐                            │
│        │                           │                             │
│      5 ┼                           └────┐                       │
│        │                                └────                   │
│      0 ┼────┬────┬────┬────┬────┬────┬────┬────► Temp (°C)     │
│           25   40   55   70   85  100  115                      │
│                                                                  │
│    Tačka dizajna: 4A @ 85°C ambient (60% derating od 30A ocene) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Rezime Mehaničkih Specifikacija

### 6.1 Konektor Modula (Muški)

| Parametar | Vrednost |
|-----------|----------|
| Broj dela | TE 2-2170718-x (custom) |
| Montaža | PCB through-hole |
| Debljina PCB-a | 1.6 mm |
| Visina distancera | 5.0 mm |
| Visina interfejsa spajanja | 15.0 mm |
| Materijal kontakta | Bakarnja legura, pozlaćen |
| Materijal kućišta | LCP (Liquid Crystal Polymer) |
| Radna temperatura | -40°C do +105°C |

### 6.2 Konektor Backplane-a (Ženski)

| Parametar | Vrednost |
|-----------|----------|
| Broj dela | TE 2-2170719-x (custom) |
| Montaža | Press-fit u backplane |
| Debljina backplane-a | 2.4 mm |
| Materijal kontakta | Bakarnja legura, pozlaćen |
| Materijal kućišta | LCP |
| Vodeći stubovi | 2× (za blind-mate poravnanje) |

### 6.3 Dimenzije Konektora

```
┌─────────────────────────────────────────────────────────────────┐
│                  Dimenzije Konektora Modula                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Prednji Pogled:                     Bočni Pogled:            │
│                                                                  │
│    ┌───────────────────┐           ┌─────────┐                  │
│    │ ● ● ● ● ●         │           │         │                  │
│    │ ● ● ● ● ●         │           │ Kućište │ 15.0 mm          │
│    │     ▼             │  40 mm    │         │                  │
│    │ ● ● ● ● ●         │           ├─────────┤                  │
│    │ ● ● ● ● ●         │           │  Pinovi │ 5.0 mm           │
│    └───────────────────┘           └─────────┘                  │
│           25 mm                         │                        │
│                                         ▼                        │
│                                       PCB                        │
│                                                                  │
│    Ukupne dimenzije: 25 × 40 × 20 mm (Š × V × D)                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/16-custom-rack-system.md` | Rack sistem i backplane |
| `tehnika/13-hardware-security.md` | ESD i EMC detalji |
| `tehnika/10-microkernel-architecture.md` | Zahtevi hot-swap-a |
| TE Connectivity MULTIGIG RT | Specifikacija proizvoda |
| IEC 61000-4-2 | ESD test standard imunosti |

---

## Dodatak A: Informacije za Naručivanje Konektora

| Stavka | Broj Dela | Količina |
|--------|-----------|----------|
| Konektor modula (muški) | EK-CONN-M20-A | 1 po modulu |
| Konektor backplane-a (ženski) | EK-CONN-F20-A | 1 po slotu |
| Utikač za ključ (Pozicija A) | EK-KEY-A | 1 po konektoru |
| Utikač za ključ (Pozicija B) | EK-KEY-B | Po potrebi |
| Alat za vađenje | EK-TOOL-EXT | 1 po stanici |

---

## Dodatak B: Merenje Kontaktne Otpornosti

| Tačka Merenja | Nov | Posle 1K ciklusa | Posle 10K ciklusa | Limit |
|---------------|-----|------------------|-------------------|-------|
| Power kontakti (svaki) | <0.5 mΩ | <0.7 mΩ | <1.0 mΩ | 2.0 mΩ |
| Signal kontakti (svaki) | <10 mΩ | <15 mΩ | <20 mΩ | 50 mΩ |
| Ground kontakti (svaki) | <0.5 mΩ | <0.7 mΩ | <1.0 mΩ | 2.0 mΩ |
