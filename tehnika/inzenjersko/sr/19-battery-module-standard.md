# EK-BAT Standard modula baterije

## Pregled

EK-BAT familija standardizovanih modula baterija omogućava paradigmu mala-baterija-česta-zamena za teška komercijalna vozila. Tri veličine modula pokrivaju sve tipove vozila od dostavnih kombija do tegljača.

```
EK-BAT FAMILIJA: JEDAN STANDARD ZA SVA TEŠKA VOZILA
═══════════════════════════════════════════════════════════════════════════

EK-BAT-25          EK-BAT-50          EK-BAT-100
───────────        ───────────        ───────────
25 kWh             50 kWh             100 kWh
150 kg             300 kg             600 kg

Kombiji            Autobusi           Teški kamioni
Mali kamioni       Srednji kamioni    Tegljači
```

---

## Specifikacije modula

### EK-BAT-25 (Modul za kombije)

| Parametar | Specifikacija |
|-----------|---------------|
| **Kapacitet** | 25 kWh |
| **Napon** | 400V nominalno (350-450V opseg) |
| **Težina** | 150 kg |
| **Dimenzije** | 600 × 400 × 300 mm |
| **Gustina energije** | 167 Wh/kg |
| **Hemija** | LFP (LiFePO4) |
| **C-rate (punjenje)** | 2C (50 kW max) |
| **C-rate (pražnjenje)** | 3C (75 kW max) |
| **Životni vek ciklusa** | >4.000 ciklusa @ 80% DoD |
| **Kalendarski vek** | 10 godina |
| **Hlađenje** | Tečno (zajednička petlja) |
| **Radna temp** | -20°C do +55°C |
| **IP oznaka** | IP67 |
| **BMS** | Distribuirani, spreman za roj |

**Primarne primene:**
- Dostavni kombiji (2 modula = 50 kWh)
- Mali kamioni (klasa 3,5t)
- Mikro-tranzitna vozila

### EK-BAT-50 (Modul za autobuse)

| Parametar | Specifikacija |
|-----------|---------------|
| **Kapacitet** | 50 kWh |
| **Napon** | 400V nominalno (350-450V opseg) |
| **Težina** | 300 kg |
| **Dimenzije** | 900 × 600 × 300 mm |
| **Gustina energije** | 167 Wh/kg |
| **Hemija** | LFP (LiFePO4) |
| **C-rate (punjenje)** | 2C (100 kW max) |
| **C-rate (pražnjenje)** | 3C (150 kW max) |
| **Životni vek ciklusa** | >4.000 ciklusa @ 80% DoD |
| **Kalendarski vek** | 10 godina |
| **Hlađenje** | Tečno (zajednička petlja) |
| **Radna temp** | -20°C do +55°C |
| **IP oznaka** | IP67 |
| **BMS** | Distribuirani, spreman za roj |

**Primarne primene:**
- Gradski autobusi (2 modula = 100 kWh)
- Regionalni autobusi (3 modula = 150 kWh)
- Srednji kamioni (klasa 7,5-16t)

### EK-BAT-100 (Teški modul)

| Parametar | Specifikacija |
|-----------|---------------|
| **Kapacitet** | 100 kWh |
| **Napon** | 800V nominalno (700-900V opseg) |
| **Težina** | 600 kg |
| **Dimenzije** | 1200 × 800 × 400 mm |
| **Gustina energije** | 167 Wh/kg |
| **Hemija** | LFP (LiFePO4) |
| **C-rate (punjenje)** | 2C (200 kW max) |
| **C-rate (pražnjenje)** | 3C (300 kW max) |
| **Životni vek ciklusa** | >4.000 ciklusa @ 80% DoD |
| **Kalendarski vek** | 10 godina |
| **Hlađenje** | Tečno (zajednička petlja) |
| **Radna temp** | -20°C do +55°C |
| **IP oznaka** | IP67 |
| **BMS** | Distribuirani, spreman za roj |

**Primarne primene:**
- Tegljači (4 modula = 400 kWh)
- Teški autobusi (zglobni, na sprat)
- Rudarska/građevinska vozila

---

## Mehanički interfejs

### Tačke za hvatanje robota

```
EK-BAT-50 POGLED ODOZGO (Interfejs za robota)
═══════════════════════════════════════════════════════════════════════════

    ┌─────────────────────────────────────────────────────────────┐
    │  ◉                                                      ◉  │
    │  HVAT-1                                            HVAT-2  │
    │  M10 umetak                                    M10 umetak  │
    │                                                             │
    │                    ┌───────────────┐                        │
    │                    │  KONUSI ZA    │                        │
    │                    │  PORAVNANJE   │                        │
    │                    │   ◇     ◇    │                        │
    │                    └───────────────┘                        │
    │                                                             │
    │  ◉                                                      ◉  │
    │  HVAT-3                                            HVAT-4  │
    │  M10 umetak                                    M10 umetak  │
    └─────────────────────────────────────────────────────────────┘

RAZMAK HVATALJKE:
EK-BAT-25: 400 × 200 mm (4 tačke)
EK-BAT-50: 700 × 400 mm (4 tačke)
EK-BAT-100: 1000 × 600 mm (4 tačke)
```

### Električni konektor

| Parametar | Specifikacija |
|-----------|---------------|
| **Tip konektora** | Anderson SBS350 (EK-BAT-25/50), REMA DIN 320A (EK-BAT-100) |
| **Ciklusi spajanja** | >10.000 |
| **Kontaktna otpornost** | <0,1 mΩ |

### Konektor za podatke/BMS

| Parametar | Specifikacija |
|-----------|---------------|
| **Tip konektora** | Harting Han-Modular 10A |
| **Konfiguracija** | 10 pinova |
| **Signali** | CAN-H, CAN-L, GND, 12V, TEMP×2, INTERLOCK, AUX×3 |
| **Ciklusi spajanja** | >5.000 |
| **IP oznaka** | IP67 (spojeno) |
| **Tolerancija slepog spajanja** | ±3 mm |

### Brza spojnica za rashladnu tečnost

| Parametar | Specifikacija |
|-----------|---------------|
| **Tip spojnice** | Stäubli suva spojnica |
| **Veličina** | DN12 (EK-BAT-25/50), DN20 (EK-BAT-100) |
| **Protok** | 10-30 L/min |
| **Pritisak** | 2 bar max |
| **Tečnost** | 50/50 voda-glikol |
| **Bez curenja** | Da |
| **Ciklusi spajanja** | >50.000 |

---

## Arhitektura BMS

### Distribuirani BMS roja

Svaki EK-BAT modul sadrži potpuno autonomni BMS koji učestvuje u mreži roja.

```
ARHITEKTURA BMS
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                         BMS EK-BAT MODULA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐     │
│   │ MONITOR ĆELIJA  │   │ MONITOR ĆELIJA  │   │ MONITOR ĆELIJA  │     │
│   │   (8 ćelija)    │   │   (8 ćelija)    │   │   (8 ćelija)    │     │
│   │  AFE: BQ76952   │   │  AFE: BQ76952   │   │  AFE: BQ76952   │     │
│   └────────┬────────┘   └────────┬────────┘   └────────┬────────┘     │
│            │                     │                     │               │
│            └──────────────┬──────┴──────────────┬──────┘               │
│                           │                     │                       │
│                    ┌──────▼─────────────────────▼──────┐               │
│                    │      MASTER KONTROLER             │               │
│                    │      STM32G474RET6                │               │
│                    │      ─────────────                │               │
│                    │  • SOC/SOH estimacija             │               │
│                    │  • Balansiranje ćelija            │               │
│                    │  • Termalno upravljanje           │               │
│                    │  • CAN-FD komunikacija            │               │
│                    │  • Koordinacija roja              │               │
│                    │  • Predikcija zdravlja (AI)       │               │
│                    └──────────────┬─────────────────────┘               │
│                                   │                                     │
│                            ┌──────▼──────┐                             │
│                            │   CAN-FD    │                             │
│                            │  5 Mbps     │                             │
│                            └─────────────┘                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Bezbednosni zahtevi

### Električna izolacija

| Parametar | Zahtev |
|-----------|--------|
| **Napon izolacije** | 2500V DC (1 min) |
| **Struja curenja** | <1 mA @ 500V DC |
| **Otpornost izolacije** | >100 MΩ |
| **Interlock** | 24V aktivan-visok, fail-safe |

### Prevencija termalnog bekstva

| Sloj | Zaštita |
|------|---------|
| Nivo ćelije | LFP hemija (najstabilnija), termalno bekstvo >250°C |
| Nivo modula | Termalni osigurač, barijere između ćelija, aktivno hlađenje |
| Nivo paketa | Čelično kućište, ventil za rasterećenje pritiska, detektor gasa |
| Nivo sistema | Automatska izolacija, CAN upozorenje, gašenje požara |

---

## Matrica kompatibilnosti vozila

| Modul | Dostavni kombi | Gradski autobus | Regionalni autobus | Gradski kamion | Tegljač |
|-------|----------------|-----------------|---------------------|----------------|---------|
| **EK-BAT-25** | 2 modula (50 kWh) | - | - | - | - |
| **EK-BAT-50** | - | 2 modula (100 kWh) | 3 modula (150 kWh) | 2 modula (100 kWh) | - |
| **EK-BAT-100** | - | - | 2 modula (200 kWh) | - | 4 modula (400 kWh) |

---

## Životni ciklus

```
ŽIVOTNI CIKLUS EK-BAT
═══════════════════════════════════════════════════════════════════════════

PRVI ŽIVOT (Vozilo)
├── 4.000+ ciklusa
├── 8-10 godina
└── Zdravlje pada na 70-80%

        │
        ▼

DRUGI ŽIVOT (Stacionarno skladištenje)
├── Mrežno skladištenje
├── Solarni + baterijski sistemi
├── Rezervno napajanje
├── 3.000+ dodatnih ciklusa
└── 5-7 dodatnih godina

        │
        ▼

RECIKLAŽA
├── Vraćanje Li-Fe-P (>95%)
├── Vraćanje bakra (>99%)
├── Vraćanje aluminijuma (>99%)
└── Zatvorena petlja do novih ćelija
```

---

## Informacije o dokumentu

| Polje | Vrednost |
|-------|----------|
| Verzija | 1.0 |
| Datum | 04.01.2026. |
| Autor | Tehnički tim Elektrokombinacije |
| Status | Nacrt |
