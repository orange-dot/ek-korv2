# Sistem za upravljanje temperaturom

## Filozofija: Tečno hlađenje jer je bolje

```
VAZDUŠNO HLAĐENJE                TEČNO HLAĐENJE
────────────────────────────────────────────────────────────
"Jednostavnije"              →   "2× veća gustina snage"
h = 25-250 W/m²K             →   h = 100-20.000 W/m²K
Pasivno                      →   Aktivno + AI kontrola
Fiksni protok vazduha        →   Dinamički protok
ΔT = 40-60°C                 →   ΔT = 10-20°C
Bučno pri velikoj snazi      →   Tiho (pumpa < ventilator)
```

---

## 1. Zašto tečno hlađenje?

### Termalna fizika

```
POREĐENJE TOPLOTNOG KAPACITETA
────────────────────────────────
Vazduh:               Cp ≈ 1.005 J/(kg·K)
Voda:                 Cp ≈ 4.186 J/(kg·K)
Etilen glikol 50%:    Cp ≈ 3.400 J/(kg·K)

Voda ima ~3.500× veći volumetrijski toplotni kapacitet od vazduha

KOEFICIJENT PRENOSA TOPLOTE
─────────────────────────────
Prirodna konvekcija (vazduh):     5-25 W/m²K
Prisilna konvekcija (vazduh):     25-250 W/m²K
Tečnost (laminarni tok):          100-1.000 W/m²K
Tečnost (turbulentni tok):        1.000-20.000 W/m²K
Mikrokanalska tečnost:            10.000-100.000 W/m²K

Tečno hlađenje: 10-100× efikasniji prenos toplote
```

### Uticaj na gustinu snage

```
VAZDUŠNO HLAĐEN EK30 (hipotetički)
──────────────────────────────────
Snaga: 30 kW
Zapremina hladnjaka: ~15 L
Protok vazduha: 500+ CFM
Buka: 60+ dB
Ukupna zapremina: ~25 L
Gustina snage: 1,2 kW/L

TEČNO HLAĐEN EK30 (stvarni dizajn)
──────────────────────────────────
Snaga: 30 kW
Zapremina coldplate-a: ~0,5 L
Pumpa + radijator: ~3 L (deljeno)
Buka: <40 dB
Ukupna zapremina: ~12 L
Gustina snage: 2,5 kW/L

Rezultat: 2× veća gustina snage
```

---

## 2. Termalna arhitektura

### EK3 (3 kW) - Hibridno hlađenje

```
EK3 koristi kombinovani pristup:
• Primarno: Provođenje do aluminijumskog kućišta
• Sekundarno: Prirodna/prisilna konvekcija vazduha
• Opciono: Interfejs za tečno hlađenje za instalaciju u EK30 kabinet

┌─────────────────────────────────────────────┐
│                AMBIJENTALNI VAZDUH          │
│                      ↑                      │
│                  konvekcija                 │
│                      │                      │
│    ┌─────────────────┴─────────────────┐   │
│    │      ALUMINIJUMSKO KUĆIŠTE         │   │
│    │        (rebra spolja)              │   │
│    │                 ↑                  │   │
│    │            provođenje              │   │
│    │                 │                  │   │
│    │    ┌────────────┴────────────┐    │   │
│    │    │    UNUTRAŠNJI HLADNJAK  │    │   │
│    │    │         (TIM)           │    │   │
│    │    │           ↑             │    │   │
│    │    │      ┌────┴────┐        │    │   │
│    │    │      │ SiC MOSFET-i    │    │   │
│    │    │      │ (izvor toplote) │    │   │
│    │    │      └─────────────────┘    │   │
│    │    └─────────────────────────────┘   │
│    └───────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

Termalni budžet EK3 (3 kW, 96% efikasnost):
• Gubitak snage: 3 kW × 4% = 120 W
• Ciljna Tj_max: 150°C
• Ciljno Tcase: 100°C
• Maksimalni ambijent: 45°C
• Potreban Rth (spoj-ambijent): (150-45)/120 = 0,875 K/W
• Ostvarivo sa pravilnim dizajnom hladnjaka
```

### EK30 (30 kW) - Potpuno tečno hlađenje

```
┌──────────────────────────────────────────────────────────────────┐
│                       RASHLADNI KRUG                              │
│                                                                   │
│   ┌─────────┐      ┌─────────┐      ┌─────────┐                 │
│   │RADIJATOR│◄─────│  PUMPA  │◄─────│REZERVOAR│                 │
│   │ + VEN.  │      │         │      │         │                 │
│   └────┬────┘      └─────────┘      └────┬────┘                 │
│        │                                  │                      │
│        │         PROTOK RASHLADNE         │                      │
│        │            TEČNOSTI              │                      │
│        ▼                                  ▲                      │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    COLDPLATE                             │   │
│   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│   │  │  PFC    │  │  LLC    │  │  LLC    │  │  LLC    │    │   │
│   │  │ Stepen  │  │ Faza A  │  │ Faza B  │  │ Faza C  │    │   │
│   │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│   │                                                         │   │
│   │              Mikrokanalska struktura                    │   │
│   │              Termalni interfejs materijal               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

Termalni budžet EK30 (30 kW, 97% efikasnost):
• Gubitak snage: 30 kW × 3% = 900 W
• Ciljna Tj_max: 150°C (SiC podnosi 175°C)
• Ciljno Tcase: 80°C
• Ulaz rashladne tečnosti: 35°C (kontrolisano)
• Potreban Rth (spoj-tečnost): (150-35)/900 = 0,128 K/W
• Raspodeljeno na više uređaja - ostvarivo
```

---

## 3. Dizajn coldplate-a

### Mikrokanalska tehnologija

```
POPREČNI PRESEK COLDPLATE-A
───────────────────────────

    Površina za montažu uređaja (ravna, brušena)
    ▼
┌───────────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Bazna ploča (Al ili Cu)
├───────────────────────────────────────────────┤
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │ ← Mikrokanalska rebra
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │   (0,5-1mm korak)
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │
│ ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃ → ┃   │ ← Protok tečnosti
│ ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   ┃   │
├───────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ← Donji poklopac
└───────────────────────────────────────────────┘
        ↑                               ↓
      Ulaz                            Izlaz


SPECIFIKACIJE KANALA
──────────────────────
Širina kanala: 0,5 - 1,0 mm
Visina kanala: 3 - 5 mm
Debljina rebra: 0,5 - 1,0 mm
Broj kanala: 50-100 (zavisno od površine uređaja)

MATERIJALI
─────────
Aluminijum 6061-T6:
• Toplotna provodljivost: 167 W/m·K
• Lagan, isplativ
• Dobar za većinu primena

Bakar C110:
• Toplotna provodljivost: 390 W/m·K
• 2× bolji od aluminijuma
• Teži, skuplji
• Za najveću gustinu snage

ELEKTROKOMBINACIJA izbor: Aluminijum sa optimizovanim dizajnom kanala
• Balans performansi, težine, cene
• AI optimizuje protok za kompenzaciju
```

---

## 4. Komponente rashladnog kruga

### Izbor pumpe

```
ZAHTEVI ZA PUMPU
────────────────
Protok: 5-10 L/min
Pritisak: 0,5-1,0 bar
Buka: <30 dB @ 1m

Preporučeno: Laing DDC serija ili ekvivalent
• Protok: do 15 L/min
• Pritisak: do 1,5 bar
• Snaga: 10-20W
• Buka: <25 dB
• PWM kontrola brzine
```

### Radijator

```
DIMENZIONISANJE RADIJATORA
──────────────────────────
Toplota za disipaciju: 900 W (EK30 pri punom opterećenju)
Temperatura okoline: do 45°C
Ciljna ulazna temperatura tečnosti: 35°C

Potreban kapacitet radijatora:
• 900W / 10K = 90 W/K
• Sa marginom sigurnosti: 120 W/K nominalni kapacitet

SPECIFIKACIJA RADIJATORA
────────────────────────
Tip: Aluminijum rebra-cev, unakrsni protok
Dimenzije: ~300 × 300 × 50 mm
Ventilator: 120-140mm, PWM kontrolisan
Protok vazduha: 50-100 CFM (promenjljiv)
```

### Rashladna tečnost

```
ELEKTROKOMBINACIJA: Propilen glikol 30% rastvor
• Netoksičan
• Dobra zaštita od smrzavanja do -15°C
• Kompatibilan sa aluminijumom i bakrom
• Uključuje inhibitore korozije
```

---

## 5. Procena temperature spoja

### Električni parametri osetljivi na temperaturu (TSEP)

```
METODA 1: Napon praga (Vth)
───────────────────────────
Princip: Vth opada sa temperaturom
Tačnost: ±3°C
Latencija: <1ms

METODA 2: Napon u provodnom stanju (Vds,on)
──────────────────────────────────────────
Princip: Rds(on) raste sa temperaturom
Tačnost: ±5°C
Latencija: U realnom vremenu

METODA 3: Vreme kašnjenja isključenja (td,off)
──────────────────────────────────────────────
Princip: Trajanje Milerovog platoa se menja sa Tj
Tačnost: ±3°C
```

### AI-poboljšana procena Tj

```
FUZIJA VIŠE PARAMETARA
──────────────────────

Ulazi u AI model:
• Merenje Vds,on (u realnom vremenu)
• Id (struja opterećenja)
• Frekvencija prekidanja
• Temperatura rashladne tečnosti
• Temperatura okoline
• Temperatura hladnjaka (NTC)
• Procena gubitka snage

Ciljna tačnost: ±2°C (bolje od pojedinačnog TSEP-a)
```

---

## 6. AI termalna kontrola

### Prediktivno upravljanje temperaturom

```
AI PRISTUP (ELEKTROKOMBINACIJA)
───────────────────────────────
1. AI predviđa putanju temperature
2. Proaktivno podešava:
   • Hlađenje (brzina ventilatora/pumpe)
   • Nivo snage (postepeno, neprimetno)
   • Optimizacija profila punjenja
3. Temperatura ostaje u optimalnom opsegu
4. Nema naglog deratinga

Rezultat: Glatko punjenje, bez prekida
```

### Višemodulska termalna koordinacija

```
ROJNO TERMALNO BALANSIRANJE
───────────────────────────

5 × EK30 modula paralelno:

Modul 1: Tj = 120°C (visoko - bliže ulazu vazduha)
Modul 2: Tj = 125°C
Modul 3: Tj = 130°C (najvreliji)
Modul 4: Tj = 125°C
Modul 5: Tj = 115°C (najhladniji)

ELEKTROKOMBINACIJA roj:
• Modul 5 preuzima više opterećenja (hladniji)
• Modul 3 smanjuje opterećenje (vreliji)
• Ukupna snaga održana
• Nema potrebe za deratingom
```

### 6.4 TinyML implementacija

```
ARHITEKTURA NEURONSKE MREŽE ZA PROCENU TEMPERATURE SPOJA
═══════════════════════════════════════════════════════════════

Okvir: TensorFlow Lite Micro
Ciljni MCU: STM32G474 (Cortex-M4F @ 170MHz)

SPECIFIKACIJE MODELA
────────────────────
Ukupno parametara: 1.474
Veličina modela (INT8 kvantizovan): ~2 KB
Vreme inferencije: <100 µs @ 170MHz
Ciljna tačnost: MAE < 2°C
```

### 6.5 Procedura kalibracije TSEP

```
VDS,ON TEMPERATURNO OČITAVANJE (TSEP)
═══════════════════════════════════════════════════════════════

PRINCIP
───────
Napon drejn-sors u provodnom stanju (Vds,on) SiC MOSFET-a
raste sa temperaturom spoja zbog povećanog Rds,on.

Za Wolfspeed C3M0065090D:
• Rds,on @ 25°C: 65 mΩ
• Rds,on @ 150°C: ~130 mΩ (približno 2× povećanje)
• Temperaturni koeficijent: ~0,5 mΩ/°C

Kombinovana nesigurnost (RSS): ±3°C
Rekalibracija: Svakih 10.000 sati
```

### 6.6 Rukovanje graničnim slučajevima

```
SLUČAJ 1: HLADAN START
• 0-60s: Samo model (Tj = Ta + P × Rth)
• 60-300s: Mešani režim
• >300s: TSEP primarni

SLUČAJ 2: PROLAZNA OPTEREĆENJA
• Prediktivna Fosterova mreža
• Predvidi Tj 100 ms unapred

SLUČAJ 3: GUBITAK KOMUNIKACIJE
• CAN greška za >10s: Siguran režim (50% snage)

SLUČAJ 4: OTKAZ SENZORA
• Jedan senzor: Koristi preostale
• Svi senzori: Trenutno gašenje
```

### 6.7 Pragovi detekcije anomalija

```
NIVOI PRAGOVA
─────────────
• Normalno:   RE ≤ 2σ   → Nastavi normalni rad
• Upozorenje: 2σ < RE ≤ 3σ → Zabeleži događaj
• Uzbuna:     3σ < RE ≤ 4σ → Obavesti operatera
• Akcija:     4σ < RE ≤ 5σ → Smanji snagu 20%
• Kritično:   RE > 5σ   → Sigurno gašenje
```

---

## 7. Sigurnosne funkcije

### Hijerarhija termalne zaštite

```
NIVO 1: AI OPTIMIZACIJA (kontinualno)
─────────────────────────────────────
• Prediktivna kontrola temperature
• Postepeno podešavanje snage

NIVO 2: MEKI LIMITI (firmver)
─────────────────────────────
• Tj > 130°C: Povećaj hlađenje
• Tj > 140°C: Smanji snagu 20%
• Tj > 150°C: Smanji snagu 50%

NIVO 3: TVRDI LIMITI (hardver)
──────────────────────────────
• Tj > 160°C: Hardversko gašenje

NIVO 4: PASIVNA SIGURNOST
─────────────────────────
• Termalni osigurač
```

---

## 8. Lista materijala - Termalni sistem

| Komponenta | Specifikacija | Kol. | Jed. cena | Ukupno |
|------------|---------------|------|-----------|--------|
| Coldplate | Aluminijum, mikrokanal, 300×200mm | 1 | €120 | €120 |
| Pumpa | Brushless DC, 10L/min, PWM | 1 | €35 | €35 |
| Radijator | Al rebra-cev, 300×300×50mm | 1 | €60 | €60 |
| Ventilator radijatora | 140mm PWM, niska buka | 2 | €15 | €30 |
| Rezervoar | 300mL, linijski | 1 | €15 | €15 |
| **UKUPNO termalno** | | | | **€397** |

---

## 9. Ciljevi performansi

| Parametar | Cilj | Napomene |
|-----------|------|----------|
| Max Tj pri punom opterećenju | <150°C | 25°C margina do apsolutnog max |
| ΔT rashladne tečnosti | <10°C | Pri 30 kW |
| Rth spoj-tečnost | <0,13 K/W | Po modulu |
| Buka ventilatora | <45 dB | Pri maksimalnom hlađenju |

---

## 10. Dizajn vazdušnog hlađenja EK3

### 10.1 Geometrija hladnjaka

```
SPECIFIKACIJA EKSTRUDOVANOG ALUMINIJUMSKOG HLADNJAKA
═══════════════════════════════════════════════════════════════

Materijal: Aluminijum 6063-T5
Toplotna provodljivost: 200 W/m·K

Ukupne dimenzije:
• Dužina: 280 mm (duž protoka vazduha)
• Širina: 180 mm (normalno na protok vazduha)
• Ukupna visina: 33 mm (8mm baza + 25mm rebra)
• Masa: ~850 g

Parametri rebara:
• Broj rebara: 72 (180mm / 2,5mm korak)
• Visina rebra: 25 mm
• Debljina rebra: 1,5 mm
• Razmak rebara (kanal): 1,0 mm
• Efikasnost rebra: ~92% (pri 2,5 m/s protoku vazduha)
```

### 10.2 Analiza termalne otpornosti

```
BUDŽET TERMALNE OTPORNOSTI
─────────────────────────────────────────────────────────────
Komponenta               Rth (K/W)    Napomene
─────────────────────────────────────────────────────────────
SiC MOSFET (Rth,j-c)       0,50       Wolfspeed C3M0065090D
TIM - Termalna podloga     0,15       Bergquist GP5000, 0,25mm
Rasprostiranje u hladnjaku 0,10       Provođenje u baznoj ploči
Hladnjak do vazduha        0,45       Pri 2,5 m/s, h=50 W/m²K
─────────────────────────────────────────────────────────────
UKUPNO Rth,j-a              1,20 K/W
─────────────────────────────────────────────────────────────
```

### 10.3 Zahtevi za protok vazduha

```
Minimum: 12 CFM (0,34 m³/min, 5,7 L/s) po modulu
Ukupno za orman (84 modula): 2000 CFM
Ventilatori: 5× 200mm, N+1 redundancija
```

### 10.4 Termalni interfejs materijal (TIM)

```
PRIMARNA PREPORUKA: Bergquist Gap Pad GP5000
• Toplotna provodljivost: 5,0 W/m·K
• Debljina: 0,25 mm
• Cena: €2,00 po modulu

Preporuka: Gap Pad GP5000 za prototip, PTM7958 za proizvodnju
```

### 10.5 Krive deratinga

```
TEMPERATURNI DERATING
─────────────────────
≤35°C  →  100% (3,3 kW)
40°C   →  91% (3,0 kW)
45°C   →  82% (2,7 kW)
50°C   →  70% (2,3 kW)
≥60°C  →  Sigurno gašenje

VISINSKI DERATING
─────────────────
0-1000m   →  100%
1000-2000m →  95%
2000-3000m →  85%
```

---

## 11. Metodologija termalne simulacije

### 11.1 FEA termalna analiza

```
PREPORUČENI ALATI
─────────────────
• ANSYS Mechanical
• SimScale (besplatni nivo)
• OpenFOAM + Elmer

OČEKIVANI REZULTATI (3,3 kW, 45°C ambijent)
───────────────────────────────────────────
• Spoj MOSFET-a: 85-95°C (limit 150°C)
• Baza hladnjaka: 65-75°C
• Vruća tačka transformatora: 90-100°C
```

### 11.2 CFD analiza protoka vazduha

```
OČEKIVANI REZULTATI
───────────────────
• Pad pritiska: 15-25 Pa
• Brzina u kanalima: 3-4 m/s
• Porast temperature vazduha: 10-15°C
```

### 11.3 Protokol validacije

```
KRITERIJUMI PRIHVATANJA
───────────────────────
• Tj < 125°C pri 100% snage, 25°C ambijent
• Tj < 140°C pri 100% snage, 45°C ambijent
• Rth,j-a: 1,20 ±0,15 K/W
```

### 11.4 Analiza osetljivosti

```
KRITIČNI PARAMETRI (>10°C uticaj)
─────────────────────────────────
1. Temperatura ambijenta: ±20°C
2. Brzina protoka vazduha: ±15°C
3. Debljina TIM-a: ±12°C
4. Disipacija snage: ±12°C

MARGINA DIZAJNA
───────────────
Najgori slučaj: 95,6°C
Limit: 125°C
Margina: 29,4°C ✓
```

---

## Reference i izvori

- [Boyd Liquid Cold Plates](https://www.boydcorp.com/thermal/liquid-cooling-systems/liquid-cold-plates.html)
- [EV Charger Liquid Cooling Requirements](https://www.evengineeringonline.com/why-high-power-dc-ev-chargers-require-liquid-cooling-systems/)
- [SiC MOSFET Tj Estimation Research](https://www.sciencedirect.com/science/article/abs/pii/S2590116823000164)
- [TSEP Methods for Tj Monitoring](https://www.sciopen.com/article/10.17775/CSEEJPES.2021.04840)
