# Arhitektura Hardverske Bezbednosti

> **Napomena:** Ovo je verzija za patentnu prijavu. Za živu dokumentaciju, pogledajte [`tehnika/13-hardware-security.sr.md`](../../tehnika/13-hardware-security.sr.md).

**Verzija dokumenta:** 1.0
**Datum:** 2026-01-04
**Autor:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilića 8, Kikinda, Severni Banat, Srbija

---

## 1. Pregled

```
VIŠESLOJNA ODBRANA - HARDVERSKI SLOJ
═══════════════════════════════════════════════════════════════

Ovaj dokument opisuje mere bezbednosti na nivou hardvera
implementirane u EK3 modulu za zaštitu od:

• Fizičkog neovlašćenog pristupa
• Napada bočnim kanalima
• Elektromagnetne interferencije
• Neovlašćenog pristupa kriptografskim ključevima
• Pokušaja reverznog inženjeringa

Hardverska bezbednost čini NIVO 0 (ne može se zaobići)
u našoj arhitekturi granica poverenja.
```

---

## 2. Bezbednosni Dizajn PCB-a

### 2.1 Bezbednost Slojeva

```
6-SLOJNI PCB SA BEZBEDNOSNIM KARAKTERISTIKAMA
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│ Sloj 1: GORNJI    - Energetske komponente, opšti signali   │
│          (2 oz Cu)  BEZ osetljivih signala na ovom sloju   │
├─────────────────────────────────────────────────────────────┤
│ Sloj 2: GND       - Čvrsta masa                            │
│          (1 oz Cu)  Štiti unutrašnje slojeve od EMI        │
├─────────────────────────────────────────────────────────────┤
│ Sloj 3: SIGNAL    - Kripto signali, rutiranje ključeva     │
│          (1 oz Cu)  ZAŠTIĆENO GND slojevima iznad/ispod    │
├─────────────────────────────────────────────────────────────┤
│ Sloj 4: NAPAJANJE - DC šine, interno napajanje             │
│          (2 oz Cu)  Takođe deluje kao štit                 │
├─────────────────────────────────────────────────────────────┤
│ Sloj 5: GND       - Drugi sloj mase                        │
│          (1 oz Cu)  Dodatno EMI oklopljavanje              │
├─────────────────────────────────────────────────────────────┤
│ Sloj 6: DONJI     - MCU, komponente male snage             │
│          (1 oz Cu)  Debug portovi, test tačke              │
└─────────────────────────────────────────────────────────────┘

Bezbednosni principi:
• Osetljivi signali (kripto, ključevi) SAMO na Sloju 3 (unutrašnji)
• Ne mogu se ispitivati bez destruktivnog uklanjanja slojeva
• Slojevi mase štite od EM emanacija
```

### 2.2 Zaštitni Prsteni

```
IMPLEMENTACIJA ZAŠTITNIH PRSTENA
═══════════════════════════════════════════════════════════════

                    ┌─────────────────────────┐
                    │    KRIPTO SEKCIJA       │
                    │  ┌───────────────────┐  │
      ZAŠTITNI      │  │                   │  │
      PRSTEN        │  │   STM32G474       │  │
      (GND)         │  │   AES Engine      │  │
       ║            │  │   Skladište ključ.│  │
       ║            │  │                   │  │
═══════╬════════════│  └───────────────────┘  │═══════════════
       ║            │                         │
       ║            └─────────────────────────┘
       ║
       ╚═══════════════════════════════════════════════════════

Implementacija:
• 0.5mm široka bakrena traka na svim slojevima
• Povezana sa digitalnom masom u jednoj tački
• Okružuje:
  - MCU kripto sekciju
  - JTAG/SWD debug port
  - Oblast za skladištenje ključeva
```

---

## 3. Kriptografski Hardver

### 3.1 Ugrađena Bezbednost STM32G474

```
BEZBEDNOSNE KARAKTERISTIKE STM32G474
═══════════════════════════════════════════════════════════════

AES HARDVERSKI AKCELERATOR:
• AES-128, AES-192, AES-256
• ECB, CBC, CTR, GCM režimi
• CMAC podrška (za autentifikaciju poruka)
• DPA protivmere (nasumično tajmiranje)
• Propusnost: ~40 Mbps @ 170 MHz

GENERATOR PRAVIH SLUČAJNIH BROJEVA (TRNG):
• Usaglašen sa NIST SP 800-90B
• Hardverski izvor entropije (ring oscilatori)
• 32-bitni izlaz
• Prolazi NIST statističke testove

BEZBEDNO SKLADIŠTENJE KLJUČEVA:
• Option Bytes (OB): Zaštita konfiguracije
• OTP (One-Time Programmable): 1KB, jednokratno pisanje
• SRAM2: Sa baterijskom podrškom, briše se na neovlašćen pristup
• RDP Level 2: Trajna zaštita od čitanja

ZAŠTITA OD ČITANJA (RDP):
┌─────────────────────────────────────────────────────────────┐
│ NIVO │ ZAŠTITA                                              │
├──────┼──────────────────────────────────────────────────────┤
│ 0    │ Bez zaštite (samo za razvoj)                         │
│ 1    │ Flash zaštićen od čitanja preko debugera             │
│      │ Može se vratiti na Nivo 0 (briše flash)              │
│ 2    │ TRAJNA zaštita od čitanja                            │
│      │ Debug interfejs zauvek onemogućen                    │
│      │ JTAG/SWD nefunkcionalan                              │
│      │ NE MOŽE SE VRATITI - uređaj zaključan                │
└─────────────────────────────────────────────────────────────┘

Proizvodni moduli koriste RDP Nivo 2.
```

### 3.2 Arhitektura Skladištenja Ključeva

```
LOKACIJE SKLADIŠTENJA KLJUČEVA
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                    HIJERARHIJA KLJUČEVA                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  OTP OBLAST (1KB) - Trajno upisano pri proizvodnji          │
│  ═══════════════════════════════════════════════════════    │
│  • Jedinstveni ID modula (128 bita)                         │
│  • Ključ uređaja (128 bita) - za izvođenje sesijskih ključ. │
│  • Javni ključ za potpisivanje firmware-a (256 bita Ed25519)│
│  • Brojač protiv vraćanja verzija (32 bita)                 │
│                                                              │
│  SRAM2 (Sa baterijom) - Sesijski podaci                     │
│  ═══════════════════════════════════════════════════════    │
│  • Trenutni sesijski ključ                                  │
│  • Brojači sekvenci                                         │
│  • Zastavice neovlašćenog pristupa                          │
│  • BRIŠE SE na bilo koji događaj neovlašćenog pristupa      │
│                                                              │
│  FLASH (Zaštićena oblast) - Konfiguracija                   │
│  ═══════════════════════════════════════════════════════    │
│  • Šifrovani konfiguracioni podaci                          │
│  • Sertifikati modula                                       │
│  • Revizorski logovi (zaštićen integritet)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Detekcija Neovlašćenog Pristupa

### 4.1 Pasivna Detekcija

```
PASIVNI MEHANIZMI DETEKCIJE
═══════════════════════════════════════════════════════════════

1. DETEKCIJA OTVARANJA KUĆIŠTA
   ───────────────────────────
   • Mehanički prekidač na poklopcu kućišta
   • Normalno-zatvoreni (NC) kontakt
   • Povezan sa GPIO sa internim pull-up
   • Otvaranje prekida kolo → prekid

2. SENZOR SVETLOSTI (OPCIONO)
   ──────────────────────────
   • Fotodioda unutar kućišta
   • Detektuje otvaranje kućišta u osvetljenom okruženju
   • Rezerva za mehanički prekidač

3. MREŽASTI SLOJ (VISOKA BEZBEDNOST)
   ─────────────────────────────────
   • Fini obrazac bakrene trase preko kripto sekcije
   • Svaki presek detektovan praćenjem otpornosti
   • Koristi se samo u visoko vrednim implementacijama
```

### 4.2 Aktivna Detekcija

```
AKTIVNA DETEKCIJA NEOVLAŠĆENOG PRISTUPA
═══════════════════════════════════════════════════════════════

1. DETEKCIJA NAPONSKIH SMETNJI
   ───────────────────────────
   • Prati VCC za nagle padove/skokove
   • Prag: ±10% od nominalne vrednosti
   • Vreme odziva: <100ns
   • STM32G4 ugrađeni BOR (Brownout Reset)

2. DETEKCIJA SMETNJI TAKTA
   ────────────────────────
   • CSS (Clock Security System) prati HSE
   • Detektuje kvarove ili manipulaciju takta
   • Automatski prelazak na HSI ako HSE otkaže
   • Generiše NMI prekid

3. TEMPERATURNA ANOMALIJA
   ───────────────────────
   • ADC prati više temperaturnih tačaka
   • Očekivani opseg: -20°C do +85°C
   • Anomalija: Promena temperature >10°C/sek
   • Može ukazivati na napad grejanjem
```

### 4.3 Odgovor na Neovlašćeni Pristup

```
AKCIJE ODGOVORA NA NEOVLAŠĆENI PRISTUP
═══════════════════════════════════════════════════════════════

Pri detekciji neovlašćenog pristupa:

ODMAH (Hardverski okidač):
┌─────────────────────────────────────────────────────────────┐
│ 1. Brisanje sesijskih ključeva (SRAM2 → sve nule)          │
│    • Dešava se za <1µs putem hardvera                      │
│    • Nije potrebno učešće firmware-a                        │
│                                                              │
│ 2. Postavljanje zastavice neovlašćenog pristupa            │
│    • Preživljava ciklus napajanja                          │
│    • Mora se obrisati autorizovanom komandom               │
└─────────────────────────────────────────────────────────────┘

NAKNADNO (Firmware okidač):
┌─────────────────────────────────────────────────────────────┐
│ 3. Beleženje događaja u revizorski log                     │
│ 4. Onemogućavanje normalnog rada                           │
│ 5. Upozorenje Station Kontrolera                           │
│ 6. Čekanje na autorizovani oporavak                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Fizička Zaštita

### 5.1 Dizajn Kućišta

```
BEZBEDNOST KUĆIŠTA MODULA
═══════════════════════════════════════════════════════════════

MATERIJAL: Aluminijumska legura (6061-T6)
• Odlično EMI oklopljavanje
• Dobra termalna provodljivost
• Otpornost na koroziju

EMI OKLOPLJAVANJE:
• Kućište pruža >40dB oklopljavanje (100MHz-1GHz)
• Kontaktne trake ili provodna zaptivka na spojevima
• Bez direktnih otvora ka unutrašnjoj šupljini

IP STEPEN: IP20 (kada je u rack-u)
• Zaštita od ubacivanja prstiju
• Bez zaštite od vode (samo za unutrašnju upotrebu)
```

### 5.2 Konformni Premaz

```
SPECIFIKACIJA KONFORMNOG PREMAZA
═══════════════════════════════════════════════════════════════

TIP: Premaz na bazi akrila ili silikona

POKRIVENOST:
• Cela gornja i donja strana PCB-a
• Min debljina: 25µm, Max: 75µm

IZUZECI (Bez premaza):
• Kontakti konektora
• Test tačke
• Komponente osetljive na toplotu

PREDNOSTI:
• Zaštita od vlage (85% RH, rad na 85°C)
• Zaštita od prašine
• Otežava površinski reverzni inženjering
• Dodaje ~$0.50 po modulu
```

---

## 6. Bezbednost Napajanja

### 6.1 Detekcija Pada Napona

```
LANAC ZAŠTITE OD PADA NAPONA
═══════════════════════════════════════════════════════════════

VCC ────┬──── BOR (STM32 interni)
        │      │
        │      └──→ Reset ako VCC < 2.8V
        │
        ├──── Supervizor IC (MAX809 ili slično)
        │      │
        │      └──→ Eksterni reset, watchdog
        │
        └──── ADC za praćenje napona
               │
               └──→ Meka upozorenja, beleženje

ODGOVOR NA PAD NAPONA:
1. BOR okida → MCU reset (hardverski)
2. Supervizor drži reset dok VCC nije stabilan
3. Pri oporavku, provera zastavica neovlašćenog pristupa
4. Beleženje događaja pada napona
5. Nastavak normalnog rada
```

---

## 7. EMC za Dvostruki CAN Bus

### 7.1 Terminacija CAN Bus-a

```
OPCIJE TERMINACIJE CAN-FD
═══════════════════════════════════════════════════════════════

OPCIJA A: Standardna Terminacija (Preporučeno)
─────────────────────────────────────────────

    CAN_H ═══════════════════════════════════════ CAN_H
              │                              │
              R                              R
              │  120Ω                        │  120Ω
              R                              R
              │                              │
    CAN_L ═══════════════════════════════════════ CAN_L

          ČVOR 1                          ČVOR N
          (prvi)                          (poslednji)


OPCIJA B: Podeljena Terminacija (Bolja EMC)
───────────────────────────────────────────

    CAN_H ═══════════════════════════════════════ CAN_H
              │                              │
              R  60Ω                         R  60Ω
              ├──┬──                         ├──┬──
             ═╪═ C  4.7nF                   ═╪═ C
              ├──┴──                         ├──┴──
              R  60Ω                         R  60Ω
              │                              │
    CAN_L ═══════════════════════════════════════ CAN_L

Podeljena terminacija:
• Dva 60Ω otpornika + kondenzator ka masi
• AC putanja ka masi za common-mode šum
• Bolje EMI performanse
• Preporučeno za CAN-FD na 5 Mbps
```

### 7.2 Common Mode Prigušnica

```
IMPLEMENTACIJA COMMON MODE PRIGUŠNICE
═══════════════════════════════════════════════════════════════

Na ulazu CAN konektora modula:

                 COMMON MODE PRIGUŠNICA
    CAN_H ────────╥═══════════════╥──────── CAN_H (interni)
                  ║      ●●●      ║
                  ║      ●●●      ║  (spregnuti namotaji)
                  ║      ●●●      ║
    CAN_L ────────╨═══════════════╨──────── CAN_L (interni)

SPECIFIKACIJE:
• Impedansa: >200Ω @ 100MHz (common mode)
• Diferencijalna impedansa: <2Ω
• Strujno opterećenje: >500mA

SVRHA:
• Odbacuje common-mode šum sa backplane-a
• Smanjuje zračene emisije sa CAN bus-a
• Poboljšava ESD imunitet
• NE utiče na diferencijalni signal
```

---

## 8. Bezbednost Debug Porta

### 8.1 JTAG/SWD Zaštita

```
BEZBEDNOST DEBUG PORTA
═══════════════════════════════════════════════════════════════

RAZVOJNI REŽIM (RDP Nivo 0):
• Pun JTAG/SWD pristup
• Sva memorija čitljiva
• Koristi se samo tokom razvoja
• NIKAD se ne isporučuje kupcima

PROIZVODNI REŽIM (RDP Nivo 2):
• JTAG/SWD trajno onemogućen
• Ne može se čitati flash ili RAM
• Ne može se zaustaviti procesor
• Pinovi debug porta mogu se koristiti kao GPIO

FIZIČKA ZAŠTITA:
• Debug header NIJE popunjen na proizvodnim jedinicama
• Padovi prisutni samo za fabričku upotrebu
• Pokriveni kućištem (nisu eksterno dostupni)
```

---

## 9. Razmatranja za Sertifikaciju

```
PRIMENJIVI STANDARDI
═══════════════════════════════════════════════════════════════

ZA UGRAĐENU BEZBEDNOST:
• IEC 62443 - Bezbednost industrijskih komunikacionih mreža
• EN 303 645 - Sajber bezbednost za potrošački IoT
• ETSI EN 319 411 - Elektronski potpisi

ZA KRIPTOGRAFSKE MODULE (ako je potrebno):
• FIPS 140-2 Nivo 1 - Osnovni kripto modul
• FIPS 140-2 Nivo 2 - Dokaz o neovlašćenom pristupu
• FIPS 140-2 Nivo 3 - Otpornost na neovlašćeni pristup

ZA BEZBEDNOST ENERGETSKE ELEKTRONIKE:
• IEC 62477-1 - Sistemi pretvarača energetske elektronike
• IEC 61508 - Funkcionalna bezbednost (SIL ocena)
```

---

## 10. Istorija Revizija

| Verzija | Datum      | Izmene                     |
|---------|------------|----------------------------|
| 1.0     | 2026-01-04 | Inicijalni dokument        |

---

## Reference

- STM32G4 Security Reference Manual (RM0440)
- NIST SP 800-57: Preporuke za upravljanje ključevima
- NIST SP 800-90B: Validacija generatora slučajnih bitova
- IEC 62443-4-2: Tehnički bezbednosni zahtevi
- NXP TJA1443 Datasheet
