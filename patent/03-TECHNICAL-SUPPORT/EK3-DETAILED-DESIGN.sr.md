# EK3 Modul - Detaljan Dizajn

**Verzija dokumenta:** 1.0
**Datum:** 2026-01-03
**Autor:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilica 8, Kikinda, Severni Banat, Srbija

---

## 1. Izvršni Sažetak

```
EK3 - OSNOVNE SPECIFIKACIJE
═══════════════════════════════════════════════════════════════

Naziv:          EK3 (ElektroKombinacija 3kW Modul)
Snaga:          3.3 kW kontinualno (3.6 kW vršno)
Dimenzije:      200 × 320 × 44 mm (1U polu-širina, telecom stil)
Masa:           ~3.5 kg
Efikasnost:     >96% vršna, >94% @ 50% opterećenja
Hlađenje:       Prisilni vazduh (zajednički plenum)
Životni vek:    >50,000 sati @ nazivnom opterećenju
Vruća zamena:   Da, <1 sek električno iskljucenje

PRIMARNA FUNKCIJA:
AC/DC konverzija za punjenje EV
  Ulaz: 3-fazni 400V AC ili DC link
  Izlaz: Podesiv DC (za punjenje baterija)

SEKUNDARNE FUNKCIJE:
• Praćenje zdravlja (preko ugrađenih senzora + MCU)
• Komunikacija (CAN magistrala)
• Distribuirana rezerva (graceful degradation)
```

---

## 2. Električni Dizajn

### 2.1 Opcije Topologije

```
OPCIJA A: AC/DC MODUL (Puni Ispravljač)
═══════════════════════════════════════════════════════════════

Ulaz: 3-fazni 400V AC (direktno sa mreže)
Izlaz: DC (200-500V podesiv, ili fiksni 400V)

Blok Dijagram:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   AC      ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐   DC    │
│  ULAZ     │ EMI │    │ PFC │    │DC-DC│    │IZLAZ│  IZLAZ  │
│  3~400V──▶│FILTER──▶│STEPEN──▶│STEPEN──▶│FILTER│──▶400V DC│
│           └─────┘    └─────┘    └─────┘    └─────┘          │
│                         │                                    │
│                    DC Link                                   │
│                    ~650V                                     │
└─────────────────────────────────────────────────────────────┘

Prednosti:
• Samostalan - može raditi sam
• Jednostavnija instalacija (samo AC priključak)

Mane:
• Veća kompleksnost (PFC + DC-DC)
• Manja efikasnost (više stepeni konverzije)
• Potreban veći EMI filter


OPCIJA B: DC/DC MODUL (Samo izlazna konverzija)
═══════════════════════════════════════════════════════════════

Ulaz: Zajednička DC magistrala (650-800V DC)
Izlaz: DC (200-500V podesiv)

Blok Dijagram:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   DC      ┌─────┐    ┌─────────────┐    ┌─────┐   DC       │
│  ULAZ     │ULAZNI    │  IZOLOVANI  │    │IZLAZ│  IZLAZ    │
│  650V ───▶│FILTER──▶│   DC-DC     │──▶│FILTER│──▶400V DC  │
│           └─────┘    │  (LLC/DAB)  │    └─────┘            │
│                      └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘

Prednosti:
• Manji modul (nema PFC)
• Veća efikasnost
• Jeftiniji

Mane:
• Zahteva centralni PFC stepen (deli se)
• Centralni PFC = jedna tačka kvara


PREPORUKA: OPCIJA B (DC/DC Modul)
═══════════════════════════════════════════════════════════════

Razlog:
• Modularnost je prioritet
• Centralni PFC može biti N+1 redundantan
• Manji moduli = lakša zamena
• Viša gustina snage

Centralni PFC:
• Jedan veliki (30-50kW) sa redundancijom
• Ili modularni PFC (isto kao EK3, ali za AC/DC)
```

### 2.2 Topologija DC-DC Konvertera

```
PREPORUČENA TOPOLOGIJA: LLC Rezonantni Konverter
═══════════════════════════════════════════════════════════════

Zašto LLC:
• Meko prekidanje (ZVS) → niska EMI, visoka efikasnost
• Može raditi sa širokim opsegom izlaza
• Jednostavna kontrola (frekvencijska modulacija)
• Dokazana topologija za ovu snagu

Blok Dijagram (LLC):
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  DC ULAZ  ┌──────┐    ┌─────────┐    ┌──────┐   DC IZLAZ  │
│  650V ───▶│ Polu │───▶│   LLC   │───▶│Isprav│───▶ 400V    │
│           │ Most │    │Rezonant │    │ljač +│              │
│           │      │    │  Tank   │    │Filter│              │
│           └──────┘    └─────────┘    └──────┘              │
│              │                                              │
│              ▼                                              │
│         Gate Drive                                          │
│              │                                              │
│              ▼                                              │
│         ┌────────┐                                          │
│         │  MCU   │◀── Povratna sprega (V, I, T)            │
│         │Kontrola│                                          │
│         └────────┘                                          │
└─────────────────────────────────────────────────────────────┘

LLC Komponente:
• Lr (rezonantna induktivnost): ~50µH
• Cr (rezonantni kondenzator): ~100nF
• Lm (magnetizaciona induktivnost): ~200µH
• Odnos transformatora: ~1.6:1

Frekvencija Prekidanja:
• Nominalna: 100-150 kHz
• Opseg: 80-200 kHz (za regulaciju izlaza)


ALTERNATIVA: Dual Active Bridge (DAB)
═══════════════════════════════════════════════════════════════

Prednosti:
• Dvosmerni protok snage (spremno za V2G)
• Širok opseg ulaza/izlaza

Mane:
• Kompleksnija kontrola
• Više gubitaka prekidanja (moguće tvrdo prekidanje)
• Potrebno više gate drajvera

Za V2G budućnost: razmotriti DAB
```

### 2.3 Poluprovodnici Snage

```
GLAVNI PREKIDAČI: SiC MOSFETovi
═══════════════════════════════════════════════════════════════

Zašto SiC (umesto Si IGBT):
• Niži Rds_on na visokim temperaturama
• Brže prekidanje → manji gubici prekidanja
• Moguća viša frekvencija prekidanja → manji magneti
• Bolja termalna provodnost

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Proizvođač    │ Broj Dela      │ Vds  │ Rds_on │ Pakovanje │
├───────────────┼────────────────┼──────┼────────┼───────────┤
│ Wolfspeed     │ C3M0065090D    │ 900V │ 65mΩ   │ TO-247    │
│ Infineon      │ IMZ120R045M1   │ 1200V│ 45mΩ   │ TO-247    │
│ ROHM          │ SCT3030AR      │ 650V │ 30mΩ   │ TO-247    │
│ Onsemi        │ NTH4L022N065SC │ 650V │ 22mΩ   │ TO-247    │
└────────────────────────────────────────────────────────────┘

Za 3.3kW / 650V ulaz:
• Vršna struja ~10A
• 45-65mΩ Rds_on dovoljan
• 900V klasa za marginu

Preporuka: Wolfspeed C3M0065090D ili Infineon IMZ120R045M1


IZLAZNI ISPRAVLJAČ: Si Schottky ili SiC Schottky
═══════════════════════════════════════════════════════════════

Za 400V izlaz / 10A:
• SiC Schottky dioda (Vf ~1.5V @ 10A)
• Ili sinhrono ispravljanje sa SiC MOSFETovima

Prednosti sinhronog ispravljanja:
• Niži gubici (Rds_on vs Vf)
• Mogućnost dvosmernog rada

Mane sinhronog ispravljanja:
• Kompleksnije
• Potrebno više gate drajvera
```

### 2.4 Magnetne Komponente

```
TRANSFORMATOR
═══════════════════════════════════════════════════════════════

Tip: Planarni transformator (za efikasnu proizvodnju)

Specifikacije:
• Snaga: 3.5 kW
• Primarni namotaj: 650V DC / ~100kHz
• Odnos namotaja: 1.6:1
• Izolacija: 4kV
• Jezgro: Ferit (N97 ili slično)

Planarni vs Namotani:
• Planarni: ponovljivost, manja visina, bolje hlađenje
• Namotani: jeftiniji za male serije

Preporuka: Planarni za proizvodnju, namotani za prototip


REZONANTNA INDUKTIVNOST (Lr)
═══════════════════════════════════════════════════════════════

Može biti:
• Diskretna induktivnost (toroid ili E-jezgro)
• Integrisana u transformator (rasipna induktivnost)

Preporuka: Integrisana (manji BOM, manji footprint)


IZLAZNA INDUKTIVNOST (Lo)
═══════════════════════════════════════════════════════════════

Za glačanje struje:
• ~50µH
• Struja zasićenja >15A
• Jezgro od praha (Kool Mu, Sendust) ili ferit
```

### 2.5 Kondenzatori

```
ULAZNI KONDENZATORI (DC Link)
═══════════════════════════════════════════════════════════════

Tip: Filmski kondenzatori (polipropilen)

Zašto filmski (ne elektrolitski):
• Duži životni vek
• Bolji na visokim temperaturama
• Niži ESR
• Nema degradacije elektrolita

Specifikacije:
• Napon: 800V DC (za 650V DC link)
• Kapacitivnost: ~50-100µF
• Struja talasanja: >5A RMS

Kandidati:
• TDK B32776 serija
• EPCOS MKP
• Vishay MKP1848

Procena: 2x 47µF / 800V = ~$15-20


IZLAZNI KONDENZATORI
═══════════════════════════════════════════════════════════════

Tip: MLCC (visokonaponski) + filmski hibrid

Specifikacije:
• Napon: 500V DC
• Kapacitivnost: ~100µF efektivno
• Nizak ESR za filtriranje talasanja

MLCC:
• 4.7µF / 500V X7R (više paralelno)
• Derating: 50% @ nazivnom naponu

Filmski:
• 10-20µF / 500V za bulk kapacitivnost
```

### 2.6 Kontrola i Senzori

```
KONTROLNI MCU
═══════════════════════════════════════════════════════════════

Zahtevi:
• Generisanje PWM-a (100kHz+, visoka rezolucija)
• ADC (min 12-bit, više kanala)
• CAN magistrala
• Floating point (za kontrolne algoritme)

Opcije:
┌────────────────────────────────────────────────────────────┐
│ MCU              │ Jezgro      │ Karakteristike        │ $ │
├──────────────────┼─────────────┼───────────────────────┼───┤
│ STM32G474        │ M4 @ 170MHz │ HRTIM, mat. akcel.    │ 5 │
│ TI C2000 F28379D │ Dual C28x   │ Najbolji za pow. konv.│ 15│
│ Infineon XMC4400 │ M4 @ 144MHz │ Dobar analog          │ 8 │
│ Microchip dsPIC  │ DSP         │ Fokus na mot. kontrol │ 4 │
└────────────────────────────────────────────────────────────┘

Preporuka: STM32G474
• Odličan HRTIM za PWM visoke rezolucije
• Matematički akcelerator (CORDIC, FMAC)
• 5x 12-bit ADC
• CAN-FD
• Veliki ekosistem, jeftin


MERENJE STRUJE
═══════════════════════════════════════════════════════════════

Već pokriveno u SENSOR-ARCHITECTURE.md

Sažetak:
• Infineon TLI4971 za precizno merenje
• Ulazna + Izlazna struja
• Detekcija prekostruje (hardverski)


MERENJE NAPONA
═══════════════════════════════════════════════════════════════

• Otporni razdelnik → ADC
• Ulaz: 650V / 3.3V odnos → ~200:1 razdelnik
• Izlaz: 500V / 3.3V odnos → ~150:1 razdelnik
• 0.1% tolerancija otpornika za preciznost


MERENJE TEMPERATURE
═══════════════════════════════════════════════════════════════

Lokacije:
1. Hladnjak MOSFETa (NTC ili Vds metod)
2. Transformator (NTC)
3. Izlazni kondenzatori (NTC)
4. Ambijentni ulazni vazduh (NTC)

4x NTC 10K → ADC kanali
```

### 2.7 Gate Drajveri

```
ZAHTEVI GATE DRAJVERA
═══════════════════════════════════════════════════════════════

Za SiC MOSFETove:
• Vršna struja: >4A izvor, >8A ponor
• dV/dt imunitet: >100 V/ns
• Izolacija: >2.5kV (pojačana za bezbednost)
• Negativna prednapetost: -4V do -5V (za sigurno OFF)
• UVLO, desat zaštita

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Deo               │ Izolacija │ Vršna I │ Karakterist. │ $│
├───────────────────┼───────────┼─────────┼──────────────┼──┤
│ Silicon Labs      │ 5kV       │ 8A/8A   │ Miller clamp │ 4│
│ Si8271 + ext      │           │         │              │  │
├───────────────────┼───────────┼─────────┼──────────────┼──┤
│ Infineon 1EDC60   │ 5.7kV     │ 6A      │ Desat, aktiv.│ 6│
│                   │           │         │ miller clamp │  │
├───────────────────┼───────────┼─────────┼──────────────┼──┤
│ TI UCC21750       │ 5.7kV     │ 10A     │ SiC optimiz. │ 5│
└────────────────────────────────────────────────────────────┘

Preporuka: TI UCC21750 (optimizovan za SiC, dobra podrška)

Broj drajvera:
• Primarni polumost: 2x
• Sinhroni ispravljač (ako ima): 2x
• Ukupno: 2-4 gate drajvera po modulu
```

### 2.8 Zaštitna Kola

```
FUNKCIJE ZAŠTITE
═══════════════════════════════════════════════════════════════

1. PREKOSTRUJNA ZAŠTITA (OCP)
   • Hardverski komparator → brzo isključenje (<1µs)
   • Prag: 150% nazivne struje
   • Zaključavanje do MCU reseta

2. PRENAPONSKA ZAŠTITA (OVP)
   • Ulazni OVP: klemovanje ili isključenje @ 750V
   • Izlazni OVP: isključenje @ 110% nazivnog izlaza
   • TVS diode za klemovanje tranzijenata

3. PODNAPONSKA ZAŠTITA (UVP)
   • Ulazni UVP: zaustavi prekidanje @ <500V ulaz
   • Sprečava rad van bezbednog opsega

4. PREGREVANJE (OTP)
   • Upozorenje: 100°C spoja
   • Smanjenje snage: 100-125°C (smanjenje snage)
   • Isključenje: >150°C

5. KRATKI SPOJ
   • Detekcija desaturacije u gate drajveru
   • Vreme odziva: <1µs
   • Vreme blokade: ~500ns

6. MEKO STARTOVANJE
   • Porast tokom 100ms
   • Sprečava udarnu struju

7. MONITOR IZOLACIJE
   • Provera kontinuiteta pre rada
   • Detektuje kvar izolacije
```

---

## 3. Mehanički Dizajn

### 3.1 Forma

```
1U POLU-ŠIRINA FORMA (Telecom Stil)
═══════════════════════════════════════════════════════════════

Inspiracija: Eltek Flatpack2, Delta DPR 3000, Huawei R4850

Dimenzije: 200 × 320 × 44 mm (Š × D × V)

       ◀──────────── 320mm ────────────▶
      ┌────────────────────────────────────┐
      │                                    │ ▲
      │   ┌────────────────────────────┐   │ │
      │   │                            │   │ 44mm
      │   │       EK3 MODUL            │   │ │
      │   │                            │   │ ▼
      │   └────────────────────────────┘   │
      │              200mm                 │
      └────────────────────────────────────┘
                      ▲
                      │
                Strana konektora
                 (slepo spajanje)

Zašto ove dimenzije:
• 44mm = 1U visina (standardno za rack)
• 320mm dubina - dovoljna za LLC transformator + kondenzatore
• 200mm širina - 2 modula u 19" rack = 6.6kW po 1U
• Dokazano u industriji (Eltek, Delta, Huawei koriste slično za 3kW)

Gustina rack-a:
• 19" rack: 2 modula po 1U redu
• 6U = 12 modula = 40kW
• 12U = 24 modula = 80kW
• 42U pun rack = 84 modula = 277kW (teoretski max)
```

### 3.2 Kućište

```
KONSTRUKCIJA KUĆIŠTA
═══════════════════════════════════════════════════════════════

Materijal: Aluminijum (ekstrudirani profil + lim)

Zašto aluminijum:
• Laka obrada
• Odlično hlađenje (funkcija hladnjaka)
• EMI oklapanje
• Relativno jeftin

Konstrukcija:
┌─────────────────────────────────────────────────────────────┐
│                    POGLED ODOZGO (Presek)                    │
│                                                              │
│    ┌─────────────────────────────────────────────────┐      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │▓ Hladnjak (ekstrudirani Al) - MOSFETi ovde    ▓│      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │                                                 │      │
│    │   ┌─────────────────────────────────────────┐  │      │
│    │   │          GLAVNA PCB                     │  │      │
│    │   │  (Kontrola, magnetne komp., kondenz.)   │  │      │
│    │   └─────────────────────────────────────────┘  │      │
│    │                                                 │      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    │▓ Donja ploča (Al lim) - EMI oklop            ▓│      │
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
│    PROTOK VAZDUHA ════════════════════════════════▶         │
│              (napred-nazad)                                  │
└─────────────────────────────────────────────────────────────┘

Delovi:
1. Ekstruzija hladnjaka (gore) - za MOSFETe
2. Bočne šine (levo/desno) - vođice za umetanje
3. Prednja ploča - konektor + status LED
4. Zadnja ploča - izlaz vazduha
5. Donji poklopac - EMI + strukturalni
```

### 3.3 Sistem Konektora

```
KONEKTOR ZA SLEPO SPAJANJE (Kritičan za vruću zamenu)
═══════════════════════════════════════════════════════════════

Zahtevi:
• Slepo spajanje (ne vidi se tokom umetanja)
• Samoporavnanje (tolerantno na neporavnanje ±2mm)
• Kontakti za visoku struju (10A kontinualno)
• Signalni kontakti (CAN, pomoćni)
• Mehanička bravica
• >10,000 ciklusa umetanja

Kandidati:
┌────────────────────────────────────────────────────────────┐
│ Proizvođač    │ Serija          │ Struja │ Ciklusi │ $    │
├───────────────┼─────────────────┼────────┼─────────┼──────┤
│ TE Connectivity│ MULTIGIG RT2   │ 30A    │ 10K     │ 50   │
│ Amphenol      │ Millipacs       │ 25A    │ 15K     │ 60   │
│ Molex         │ EXTreme Power   │ 40A    │ 10K     │ 45   │
│ Smiths (Hypertac)│ Hyperboloid │ 50A    │ 100K+   │ 100  │
└────────────────────────────────────────────────────────────┘

Raspored Pinova (Primer - 20 pinova):
─────────────────────────────────────
  1-4:   DC Ulaz + (napajanje, 4 pina paralelno)
  5-8:   DC Ulaz - (napajanje, 4 pina paralelno)
  9-12:  DC Izlaz + (napajanje)
  13-16: DC Izlaz - (napajanje)
  17:    CAN_H
  18:    CAN_L
  19:    Modul Prisutan (signal ka backplane-u)
  20:    Rezervisan / GND

Sekvenciranje:
• Kontakti mase PRVI (duži pinovi)
• Zatim napajanje
• Zatim signal
• Modul Prisutan POSLEDNJI (potvrđuje potpuno umetanje)


MEHANIZAM BRAVE
═══════════════════════════════════════════════════════════════

Opcije:
1. Opružna bravica (kao server blade)
   • Automatski se aktivira pri umetanju
   • Poluga za otpuštanje

2. Zadržavanje vijkom
   • Sigurnije
   • Sporije za zamenu

Preporuka: Opružna bravica sa sekundarnom bravom
(za otpornost na vibracije)
```

### 3.4 Termalni Dizajn

```
TERMALNI BUDŽET
═══════════════════════════════════════════════════════════════

Disipacija snage @ 96% efikasnosti, 3.3kW izlaz:
  Pgub = 3300W × (1/0.96 - 1) = 3300 × 0.042 = ~140W

Raspodela izvora toplote:
  • MOSFETi (primarni):      40W (28%)
  • Transformator:           35W (25%)
  • Ispravljač:              25W (18%)
  • Izlazna induktivnost:    15W (11%)
  • Kontrola + pomoćno:      10W (7%)
  • Kondenzatori + ostalo:   15W (11%)

Strategija hlađenja: PRISILNI VAZDUH (zajednički plenum)


DIZAJN PROTOKA VAZDUHA
═══════════════════════════════════════════════════════════════

                         RACK/KABINET
        ┌──────────────────────────────────────────┐
        │                VENTILATORI                │
        │               (nivo kabineta)             │
        │    ▲    ▲    ▲    ▲    ▲    ▲    ▲      │
        │    │    │    │    │    │    │    │      │
        ├────┼────┼────┼────┼────┼────┼────┼──────┤
        │    │    │    │    │    │    │    │      │
   TOPLI│ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐        │
VAZDUH  │ │ EK3 │ │ EK3 │ │ EK3 │ │ EK3 │        │
   VAN  │ │  1  │ │  2  │ │  3  │ │  4  │  ...   │
        │ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘        │
        │    │    │    │    │    │    │    │      │
        ├────┼────┼────┼────┼────┼────┼────┼──────┤
        │    │    │    │    │    │    │    │      │
 HLADAN │    ▲    ▲    ▲    ▲    ▲    ▲    ▲      │
VAZDUH  │                ULAZ                      │
 UNUTRA │            (filtriran)                   │
        └──────────────────────────────────────────┘

Protok vazduha: Napred-nazad kroz svaki modul
Ventilator: Nivo kabineta (lakše održavanje, redundantan)

Potreban protok vazduha po modulu:
  Q = Pgub / (ρ × Cp × ΔT)
  Q = 140W / (1.2 kg/m³ × 1005 J/kgK × 20K)
  Q ≈ 0.006 m³/s = 12 CFM po modulu

Dimenzionisanje ventilatora kabineta:
  10 modula × 12 CFM = 120 CFM minimum
  Sa marginom: 200 CFM ventilatori kabineta


DIZAJN HLADNJAKA
═══════════════════════════════════════════════════════════════

Zahtev: Disipacija 40W od MOSFETa

Lanac termalnog otpora:
  Tj → Tc (spoj do kućišta):       0.5 K/W (iz datasheet-a)
  Tc → Ts (kućište do hladnjaka):  0.2 K/W (termalna podloga)
  Ts → Ta (hladnjak do ambijenta): ? K/W (dizajniraj ovo)

Cilj: Tj < 125°C @ Ta = 50°C
  ΔT dostupan = 125 - 50 = 75°C
  Rth_ukupno = 75°C / 40W = 1.9 K/W

  Rth_hladnjak = 1.9 - 0.5 - 0.2 = 1.2 K/W

Specifikacija hladnjaka:
  • Ekstruzija sa rebrima
  • Prisilni vazduh (2 m/s min)
  • ~1.0 K/W ostvarivo u ovoj formi
```

---

## 4. Dizajn PCB-a

### 4.1 Stek Slojeva

```
STEK SLOJEVA PCB-a (Preporučeno 6 slojeva)
═══════════════════════════════════════════════════════════════

Sloj 1: GORNJI     - Komponente snage, MOSFETi
        (2 oz Cu)

Sloj 2: GND        - Čvrsta masa
        (1 oz Cu)

Sloj 3: SIGNAL     - Kontrolni signali, gate drajv
        (1 oz Cu)

Sloj 4: NAPAJANJE  - DC šine, interne veze
        (2 oz Cu)

Sloj 5: GND        - Druga masa (EMI)
        (1 oz Cu)

Sloj 6: DONJI      - Niskonaponske komponente, konektori
        (1 oz Cu)

Ukupna debljina: ~1.6mm
Materijal: FR4 (standardni) ili high-Tg FR4

Zašto 6 slojeva:
• 2oz bakar za napajanje
• Čvrste GND ravni za EMI
• Integritet signala
• Proizvodljivost
```

### 4.2 Smernice za Layout

```
PRAVILA ZA LAYOUT
═══════════════════════════════════════════════════════════════

1. MINIMIZACIJA PETLJE SNAGE
   • Gate drajver ↔ MOSFET: <10mm
   • Blokirajući kondenzatori direktno na MOSFETu
   • Minimizuj površinu petlje za di/dt

2. PUZNE STAZE I RAZMACI
   • 650V DC: min 6.4mm razmak (IEC 60950)
   • Ili koristi proreze/barijere

3. TERMALNE PROVODNIKE
   • Ispod MOSFETa: niz provodnika do hladnjaka
   • Prečnik provodnika: 0.3mm
   • Razmak provodnika: 1.0mm

4. VOĐENJE STRUJE
   • Tragovi za 10A: min 3mm širine @ 2oz Cu
   • Ili koristi bakrene ravni

5. OSETLJIVI SIGNALI
   • ADC reference: zaštićeni tragovi
   • CAN: diferencijalni par, 120Ω impedansa
   • Gate drajv: daleko od petlji snage
```

---

## 5. Lista Materijala (Procena)

```
PROCENA BOM TROŠKOVA (Proizvodna količina: 1000+)
═══════════════════════════════════════════════════════════════

KATEGORIJA                        │ CENA (USD)  │ % UKUPNO
──────────────────────────────────┼─────────────┼─────────
Poluprovodnici Snage              │             │
  SiC MOSFETi (4x)               │    $40      │  22%
  Gate Drajveri (4x)             │    $20      │  11%
  Ispravljačke diode             │    $10      │   5%
──────────────────────────────────┼─────────────┼─────────
Magnetne Komponente               │             │
  Transformator                   │    $25      │  14%
  Induktivnosti                   │    $10      │   5%
──────────────────────────────────┼─────────────┼─────────
Kondenzatori                      │             │
  Filmski (DC link)              │    $20      │  11%
  Izlazni kondenz.               │    $10      │   5%
  Razni MLCC                     │    $5       │   3%
──────────────────────────────────┼─────────────┼─────────
Kontrola i Senzori                │             │
  MCU (STM32G474)                │    $5       │   3%
  Senzori struje (2x)            │    $7       │   4%
  Razni IC-ovi                   │    $8       │   4%
──────────────────────────────────┼─────────────┼─────────
Mehanika                          │             │
  Kućište (Al)                   │    $15      │   8%
  Konektor                       │    $10      │   5%
  Okovje                         │    $5       │   3%
──────────────────────────────────┼─────────────┼─────────
PCB                              │    $8       │   4%
──────────────────────────────────┼─────────────┼─────────
UKUPNO BOM                       │   ~$180     │  100%
──────────────────────────────────┼─────────────┼─────────

Dodatno:
  Montaža:                          $30
  Testiranje:                       $10
  Režija/marža:                     $30
──────────────────────────────────────────────
PROCENJENA CENA PO JEDINICI:       ~$250

Na skali (10,000+): može pasti na ~$200
```

---

## 6. Testiranje i Validacija

```
PLAN TESTIRANJA
═══════════════════════════════════════════════════════════════

1. ELEKTRIČNA TESTIRANJA (100% proizvodnje)
   □ Hipot test (izolacija): 4kV, 1 min
   □ Funkcionalni test: uključenje, osnovni rad
   □ Merenje efikasnosti @ 50%, 100% opterećenja
   □ Verifikacija OCP/OVP/OTP
   □ Provera CAN komunikacije

2. BURN-IN (uzorkovanje ili 100%)
   □ 72h @ nazivnom opterećenju, povišena temp (45°C)
   □ Merenje osnovnih performansi
   □ Snimanje kalibracijskih podataka po jedinici

3. EMC TESTOVI (tipska odobrenja)
   □ Kondukcionalna emisija (CISPR 11/32)
   □ Radijaciona emisija
   □ Imunitet (udar, EFT, ESD)

4. EKOLOŠKI (tipska odobrenja)
   □ Termičko cikliranje: -20°C do +60°C, 100 ciklusa
   □ Vlažnost: 85% RH, 85°C, 500h
   □ Vibracije: prema IEC 60068

5. BEZBEDNOST (tipska odobrenja)
   □ IEC 62477 (bezbednost power elektronike)
   □ Relevantni standardi za punjenje EV
```

---

## 7. Razmatranja za Proizvodnju

```
DIZAJN ZA PROIZVODNJU (DFM)
═══════════════════════════════════════════════════════════════

1. SMT MONTAŽA
   • Sve SMD komponente na jednoj strani (gornjoj) ako je moguće
   • Standardne veličine pakovanja (min 0805, 0603)
   • Bez BGA za lakšu inspekciju

2. THROUGH-HOLE
   • Minimizuj (konektori, veliki kondenzatori)
   • Layout kompatibilan sa talasnim lemljenjem

3. KONFOMALNI PREMAZ
   • Potreban za otpornost na vlagu
   • Maskiraj osetljive oblasti (konektori, test tačke)

4. MONTAŽA KUĆIŠTA
   • Snap-fit ili minimalni vijci
   • Jasna sekvenca montaže
   • Poka-yoke (sprečavanje grešaka)

5. PRISTUP ZA TESTIRANJE
   • Test tačke za ICT
   • Header za programiranje
   • Vidljive status LED diode


ODLUKE PRAVI/KUPI
═══════════════════════════════════════════════════════════════

PRAVI (interno ili CM):
• Montaža PCB-a
• Finalna montaža
• Testiranje
• Firmware

KUPI (od dobavljača):
• Transformator (custom namotaj) - specijalizovan dobavljač
• Ekstruzija kućišta - proizvođač Al profila
• Konektor - standardni kataloški deo

KANDIDATI ZA OUTSOURCING:
• SMT montaža → EMS provajder (Jabil, Flex, lokalni CM)
• Hladnjak → kompanija za Al ekstruziju
```

---

## 8. Istorija Revizija

| Verzija | Datum      | Izmene                     |
|---------|------------|----------------------------|
| 1.0     | 2026-01-03 | Inicijalni dokument        |

---

## 9. Otvorena Pitanja

1. **Tačan izbor MOSFETa** - potrebna termalna simulacija
2. **Dobavljač transformatora** - custom vs semi-custom
3. **Konačan izbor konektora** - potrebni mehanički prototipovi
4. **Opseg sertifikacije** - koja tržišta prva?
5. **Zahtev za V2G** - utiče na izbor topologije (LLC vs DAB)

---

## Reference

- Infineon Application Note: "Design Guide for LLC Converters"
- Texas Instruments: "SiC Gate Driver Design"
- Würth Elektronik: "Planar Transformer Design Guide"
- IEC 62477-1: Safety requirements for power electronic converter systems
