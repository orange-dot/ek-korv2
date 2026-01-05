# Predlog partnerstva sa Infineon-om

## Elektrokombinacija × Infineon AURIX

**Tip dokumenta:** Predlog partnerstva
**Datum:** Januar 2026
**Kontakt:** [Vaše ime / Email]
**Lokacija:** Srbija

---

## Izvršni rezime

**Elektrokombinacija** razvija modularnu infrastrukturu za punjenje električnih autobusa, sa inovativnim mikrokernel RTOS-om pod nazivom **JEZGRO** izgrađenim na **Infineon AURIX TC3xx** mikrokontrolerima.

Tražimo tehnološko partnerstvo sa Infineon-om za:
1. Ubrzanje razvoja JEZGRO-a uz podršku AURIX hardvera
2. Demonstraciju ASIL-D sertifikovane infrastrukture za punjenje
3. Uspostavljanje referentnog dizajna za elektrifikaciju evropskih autobusnih depoa

**Naš zahtev:** Podrška razvojnim kitovima, tehnička saradnja i potencijalni zajednički marketing za demonstraciju na EXPO 2027 Beograd.

---

## 1. Pregled kompanije

### 1.1 O Elektrokombinaciji

| Aspekt | Detalji |
|--------|---------|
| **Fokus** | Modularno punjenje EV za flote električnih autobusa |
| **Lokacija** | Srbija (čvorište Zapadnog Balkana) |
| **Faza** | Pre-seed, tehnologija u postupku patentiranja |
| **Ciljno tržište** | Autobusni depoi, operateri flota, komunalna preduzeća |
| **Diferencijator** | Modularna arhitektura sa roj-koordinacijom |

### 1.2 Osnovna inovacija

Gradimo **EK3** - modul snage 3,3kW koji se kombinuje u bilo koju konfiguraciju od 3kW do 3MW:

```
┌─────────────────────────────────────────────────────────────┐
│                    EK3 Modul (3,3 kW)                       │
├─────────────────────────────────────────────────────────────┤
│  • 200×320×44mm (1U polu-širina)                            │
│  • 900V SiC MOSFET-ovi (Wolfspeed)                          │
│  • LLC rezonantna topologija                                │
│  • CAN-FD @ 5 Mbps komunikacija roja                        │
│  • Hot-swap, N+1 redundancija                               │
└─────────────────────────────────────────────────────────────┘
```

**Primeri skaliranja:**

| Primena | Moduli | Snaga |
|---------|--------|-------|
| Kućni punjač | 7 | 23 kW |
| DC brzi punjač | 46 | 150 kW |
| Tačka u depou | 152 | 500 kW |
| MCS punjenje kamiona | 909 | 3 MW |

---

## 2. Zašto Infineon AURIX?

### 2.1 Tehnički razlozi

Izabrali smo **AURIX TC375/TC397** kao osnovu za našu bezbednosno-kritičnu "Hybrid Ultimate" konfiguraciju jer nijedna druga MCU porodica ne nudi ovu kombinaciju:

| Zahtev | AURIX mogućnost | Nedostatak alternativa |
|--------|-----------------|------------------------|
| **ASIL-D sertifikacija** | Nativna, pre-sertifikovana | STM32: Nema |
| **Hardverski lockstep** | CPU0/CPU1 preslikani | Samo softverske alternative |
| **HSM kripto** | Integrisani, sertifikovani | Eksterni HSM dodaje cenu/složenost |
| **Multi-core izolacija** | 3 nezavisna TriCore CPU-a | Ograničenja jednojezgarnih |
| **CAN-FD** | 4× instance nativno | Adekvatno drugde |
| **Real-time performanse** | 300 MHz TriCore | Uporedivo |

### 2.2 JEZGRO: Naš AURIX-nativan RTOS

**JEZGRO** je mikrokernel RTOS specifično dizajniran za koordinaciju rojeva energetske elektronike:

```
┌─────────────────────────────────────────────────────────────┐
│                 JEZGRO na AURIX TC375                       │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    CPU0       │     CPU1      │     CPU2      │    HSM      │
│   (Master)    │  (Lockstep)   │ (Bezbednost)  │  (Kripto)   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ JEZGRO Kernel │ JEZGRO Mirror │ Bezbednosni   │ Secure boot │
│ EDF Scheduler │ (redundantni) │ Monitor       │ Čuv. ključ. │
│ IPC Manager   │               │ Watchdog      │ OTA verif.  │
│ CAN Gateway   │               │ Fault Handler │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

**Ključne karakteristike:**
- Mikrokernel arhitektura (MINIX-inspirisana)
- EDF real-time raspoređivač sa garantovanim rokovima
- Automatski restart servisa ("reinkarnacioni server")
- Zero-copy IPC za minimalnu latenciju
- CAN-FD koordinacija roja preko 100+ čvorova

### 2.3 Hibridna arhitektura

Naša premium konfiguracija kombinuje AURIX sa specijalizovanim ko-procesorima:

| MCU | Uloga | Zašto ovaj izbor |
|-----|-------|------------------|
| **AURIX TC375/TC397** | Bezbednosni master, koordinacija roja | ASIL-D, lockstep, HSM |
| **TI C2000** | Kontrola snage | 150 ps PWM rezolucija |
| **ESP32-S3** | Povezivost | WiFi/BT, OTA ažuriranja |

Ova arhitektura isporučuje **bezbednost + preciznost + povezivost** - nemoguće sa bilo kojim pojedinačnim MCU-om.

---

## 3. Prilika za partnerstvo

### 3.1 Šta nudimo Infineon-u

| Vrednosna ponuda | Detalji |
|------------------|---------|
| **Referentni dizajn** | AURIX-bazirani EV punjački modul sa otvorenom dokumentacijom |
| **RTOS demonstracija** | JEZGRO pokazuje AURIX bezbednosne funkcije u akciji |
| **Ulaz na novo tržište** | Srbija/Zapadni Balkan kao kapija, vidljivost na EXPO 2027 |
| **Tehnička validacija** | Real-world ASIL-D primena u infrastrukturi punjenja |
| **Potencijal publikacija** | Zajednički tehnički radovi, aplikativne beleške |

### 3.2 Šta tražimo

#### Nivo 1: Hardverska podrška (~€500)

| Stavka | Kol. | Namena |
|--------|------|--------|
| AURIX TC375 Lite Kit | 5 | Razvoj roja, testiranje više čvorova |
| AURIX TC397 TFT Kit | 1 | Validacija bezbednosti, napredne funkcije |
| TLE9251VSJ uzorci | 20 | Prototipiranje CAN-FD mreže |

#### Nivo 2: Tehnička saradnja

| Tip podrške | Vrednost |
|-------------|----------|
| FAE tehnička konsultacija | Pregled arhitekture, smernice za bezbednost |
| Rani pristup novom silicijumu | TC4xx evaluacija kada bude dostupna |
| Podrška bezbednosnoj dokumentaciji | Smernice za ASIL-D usklađenost |
| Materijali za obuku | AURIX razvojne najbolje prakse |

#### Nivo 3: Strateško partnerstvo

| Prilika | Obostrana korist |
|---------|------------------|
| EXPO 2027 Beograd demo | Zajedničko prisustvo na velikom regionalnom događaju |
| Ko-marketing | "Powered by Infineon AURIX" brendiranje |
| Publikacija studije slučaja | Demonstracija AURIX-a u EV infrastrukturi |
| Referenca za Zapadni Balkan | Ulazna tačka za novo EV tržište |

---

## 4. Tržišna prilika

### 4.1 Tržište punjenja električnih autobusa

| Metrika | Vrednost | Izvor |
|---------|----------|-------|
| Globalna flota e-buseva (2025) | ~800.000 | BloombergNEF |
| Narudžbe e-buseva u Evropi (2024) | 4.500+ | Sustainable Bus |
| Jaz u infrastrukturi punjenja | 70% nedovoljno pokriveno | McKinsey |
| CAGR tržišta (2024-2030) | 25%+ | Industrijske procene |

### 4.2 Prilika na Zapadnom Balkanu

| Faktor | Detalji |
|--------|---------|
| **EXPO 2027 Beograd** | Veliki katalizator za investicije u infrastrukturu |
| **Put ka EU** | Dostupno finansiranje zelene tranzicije |
| **Obnova flota** | Zastareli dizel autobusi izlaze iz upotrebe |
| **Modernizacija mreže** | V2G potencijal za stabilizaciju mreže |

### 4.3 Konkurentsko okruženje

| Konkurent | Slabost | Naša prednost |
|-----------|---------|---------------|
| ABB Terra | Monolitni, skupi | Modularni, skalabilni |
| Siemens | Fokus na enterprise | Optimizovani za flote |
| Kineski OEM-ovi | Problemi kvaliteta u EU | Evropski dizajn, lokalna podrška |

---

## 5. Tehnički plan

### 5.1 Faze razvoja

| Faza | Vremenski okvir | Prekretnica | Učešće Infineon-a |
|------|-----------------|-------------|-------------------|
| **Faza 1** | Q1 2026 | JEZGRO kernel na TC375 | Podrška dev kitovima |
| **Faza 2** | Q2 2026 | Višečvorni CAN-FD roj | FAE konsultacija |
| **Faza 3** | Q3 2026 | Validacija bezbednosti (TC397) | Bezbednosna dokumentacija |
| **Faza 4** | Q4 2026 | Prototip EK3 modula | Pregled referentnog dizajna |
| **Faza 5** | 2027 | EXPO 2027 demonstracija | Prilika za ko-marketing |

### 5.2 Isporučivi rezultati

| Rezultat | Opis | Dostupnost |
|----------|------|------------|
| JEZGRO izvorni kod | Mikrokernel otvorenog koda | GitHub (MIT licenca) |
| Fajlovi hardverskog dizajna | Šeme, PCB layout | Otvoreni hardver |
| Aplikativne beleške | Vodič za AURIX integraciju | Javna dokumentacija |
| Demo video snimci | Prikaz koordinacije roja | Dozvoljeno korišćenje u marketingu |

---

## 6. Tim

| Uloga | Pozadina |
|-------|----------|
| **Osnivač/Glavni inženjer** | [Vaša pozadina - ugrađeni sistemi, energetska elektronika] |
| **Savetnici** | [Relevantni savetnici ako postoje] |
| **Partneri** | [Postojeća partnerstva ako postoje] |

---

## 7. Dodatak: Tehničke specifikacije

### 7.1 JEZGRO RTOS specifikacije

| Specifikacija | Vrednost |
|---------------|----------|
| Veličina kernela | <16 KB |
| Promena konteksta | <1 µs |
| IPC latencija | <500 ns |
| Maks. servisa | 32 |
| CAN-FD protok | 5 Mbps |
| Podržani MCU-ovi | AURIX TC3xx, STM32G4 |

### 7.2 EK3 specifikacije modula

| Specifikacija | Vrednost |
|---------------|----------|
| Izlazna snaga | 3,3 kW |
| Ulazni napon | 400-900 VDC |
| Izlazni napon | 200-920 VDC |
| Efikasnost | >97% |
| Dimenzije | 200×320×44 mm |
| Komunikacija | CAN-FD @ 5 Mbps |
| Bezbednost | ASIL-D (sa AURIX-om) |

---

## 8. Kontakt

**[Vaše ime]**
Elektrokombinacija
[Email]
[Telefon]
[LinkedIn]

**Repozitorijum projekta:** [GitHub link ako je javan]
**Tehnička dokumentacija:** [Link ka tehnika/ dokumentima]

---

## 9. Reference

| Dokument | Opis |
|----------|------|
| EK3-DETAILED-DESIGN.md | Kompletna specifikacija modula |
| 16-jezgro.md | JEZGRO RTOS puna specifikacija |
| 19-jezgro-dev-alternatives.md | Poređenje razvojnih platformi |
| 20-jezgro-hybrid-bom.md | Hibridni BOM sa AURIX-om |

---

*Ovaj dokument je poverljiv i namenjen za evaluaciju partnerstva sa Infineon Technologies.*
