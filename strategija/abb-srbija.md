# ABB tehnologije za punjenje e-autobusa: detaljna analiza za Srbiju

## Sažetak

ABB je globalni lider u infrastrukturi za punjenje električnih vozila s **preko 460.000 prodanih punjača** u više od 88 zemalja. Kompanija je prisutna u Srbiji preko lokalne podružnice **ABB d.o.o. Beograd** i certificiranog partnera **MT-KOMEX** koji je već instalirao ABB punjače na srpskim autoputevima i lokacijama. Za EXPO 2027 i GSP Beograd, ABB nudi kompletno rješenje od depot punjača do opportunity charging sustava.

---

## ABB prisutnost u Srbiji

### ABB d.o.o. Srbija

| Podatak | Vrijednost |
|---------|------------|
| **Adresa** | Bulevar Peka Dapčevića 13, 11000 Beograd |
| **Prisutnost** | 20+ godina u Srbiji |
| **Status** | Puna podružnica ABB Grupe |
| **Djelatnost** | Elektroenergetika, automatizacija, e-mobilnost |

### Certificirani partner: MT-KOMEX

| Podatak | Vrijednost |
|---------|------------|
| **Status** | Certificirani ABB sistem integrator |
| **Iskustvo** | 200+ instaliranih punjača u Srbiji |
| **Partneri** | BMW, Hyundai, NIS Gazprom, Putevi Srbije |
| **Mreža** | charge&GO platforma (regionalna) |
| **Lokacije** | Autoputevi, benzinske, hoteli, tržni centri |

**Već instalirani ABB punjači u Srbiji:**
- **Porsche Beograd Sever** - Terra 53 CT (prvi ABB brzi punjač u Srbiji)
- **Vrčin naplatna rampa** - ABB HP 175 (autoput Niš-Beograd)
- **NAVAK poligon** - Terra 54 CJG

---

## ABB produktni portfolio za e-autobuse

### Pregled proizvoda

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ABB E-MOBILITY PORTFOLIO                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  DEPOT CHARGING                    OPPORTUNITY CHARGING             │
│  ┌─────────────────────┐          ┌─────────────────────┐          │
│  │                     │          │                     │          │
│  │  HVC150             │          │  HVC-PD             │          │
│  │  50-150 kW          │          │  150-450 kW         │          │
│  │  CCS2, Pantograph   │          │  Pantograph-down    │          │
│  │                     │          │                     │          │
│  │  HVC360             │          │  HVC-PU             │          │
│  │  360 kW (4 izlaza)  │          │  150-600 kW         │          │
│  │  Dinamička snaga    │          │  Pantograph-up      │          │
│  │                     │          │                     │          │
│  │  ChargeDock         │          │                     │          │
│  │  Overhead dispenser │          │                     │          │
│  │                     │          │                     │          │
│  └─────────────────────┘          └─────────────────────┘          │
│                                                                     │
│  MEGAWATT CHARGING                 PUBLIC CHARGING                  │
│  ┌─────────────────────┐          ┌─────────────────────┐          │
│  │                     │          │                     │          │
│  │  MCS1200            │          │  Terra 360          │          │
│  │  1,200 kW           │          │  360 kW             │          │
│  │  MCS konektor       │          │  4 vozila           │          │
│  │  3× 400 kW kabinet  │          │                     │          │
│  │                     │          │  Terra 184/124/94   │          │
│  │                     │          │  90-180 kW          │          │
│  │                     │          │                     │          │
│  └─────────────────────┘          └─────────────────────┘          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. HVC360 - Centralni depot sustav

### Opis proizvoda

HVC360 je ABB-ov vodeći proizvod za depot punjenje, dizajniran za flote autobusa i kamiona. Centralni power kabinet opskrbljuje do 4 dispensera s dinamičkom raspodjelom snage.

### Tehničke specifikacije

| Parametar | Vrijednost |
|-----------|------------|
| **Ukupna snaga** | 360 kW (konfigurabilan: 200, 300, 360 kW) |
| **Broj izlaza** | 2 ili 4 |
| **Granularnost snage** | 90 kW |
| **Izlazni napon** | 150 - 940 VDC |
| **Izlazna struja (peak)** | 500 A @ 720 VDC, 450 A @ 800 VDC |
| **Efikasnost** | 94 - 96% |
| **Power factor** | ≥ 0.98 |
| **THD** | < 5% |
| **Ulazni napon (CE)** | 400 VAC, 50 Hz |
| **Ulazna struja (CE)** | 315 A RMS |
| **AC snaga** | 218 kVA |
| **Uzemljenje** | TN-C, TN-C-S, TN-S, TT |
| **Kabel do dispensera** | Do 100 m (150 m za ChargeDock) |
| **Radna temperatura** | -35°C do +50°C |
| **Gustoća snage** | 400 kW/m² |

### Podržana sučelja

| Sučelje | Status |
|---------|--------|
| CCS1/CCS2 | ✓ 250 A / 500 A |
| Pantograph-up | ✓ 500 A |
| Pantograph-down | ✓ 500 A |
| CHAdeMO | Opcija |

### Komunikacijski protokoli

| Standard | Podrška |
|----------|---------|
| IEC 61851-23 ed 2 | ✓ |
| DIN 70121 | ✓ |
| ISO 15118-2 | ✓ |
| ISO 15118-3 | ✓ |
| OCPP 1.6 / 2.0.1 | ✓ |
| OppCharge | ✓ |
| SAE J3105-1/-2 | ✓ |

### Dinamička raspodjela snage

```
PRIMJER: HVC360 s 4 izlaza

Scenarij A: 1 bus priključen
└── Bus 1: 360 kW (puna snaga)

Scenarij B: 2 busa priključena
├── Bus 1: 180 kW
└── Bus 2: 180 kW

Scenarij C: 4 busa priključena
├── Bus 1: 90 kW
├── Bus 2: 90 kW
├── Bus 3: 90 kW
└── Bus 4: 90 kW

Scenarij D: Prioritetno punjenje
├── Bus 1 (prioritet): 180 kW
├── Bus 2: 90 kW
└── Bus 3: 90 kW
```

### Prednosti HVC360

| Prednost | Kvantifikacija |
|----------|----------------|
| Smanjenje hardware troškova | >50% vs prethodna generacija |
| Smanjenje prostora | >50% vs zasebni punjači |
| Fleksibilnost instalacije | Back-to-back, side-by-side, uz zid |
| Mix sučelja | CCS + pantograph na istom kabinetu |
| Remote management | ABB Ability cloud platforma |

---

## 2. HVC150 - Osnovni depot punjač

### Tehničke specifikacije

| Parametar | Vrijednost |
|-----------|------------|
| **Snaga** | 50 / 100 / 150 kW (nadogradivo) |
| **Izlazni napon** | 150 - 850 VDC |
| **Izlazna struja** | Do 400 A |
| **Sučelje** | CCS2, Pantograph-up opcija |
| **Efikasnost** | >95% |
| **Radna temperatura** | -35°C do +55°C |

### Sekvencijalno punjenje

HVC150 podržava sekvencijalno punjenje do 3 autobusa preko jednog power kabineta:

```
        ┌────────────┐
        │  HVC150    │
        │ Power Unit │
        │  150 kW    │
        └─────┬──────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│Charge │ │Charge │ │Charge │
│Box 1  │ │Box 2  │ │Box 3  │
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    ▼         ▼         ▼
  [BUS]     [BUS]     [BUS]
   22:00     01:00     04:00

SEKVENCIJA: Bus 1 → Bus 2 → Bus 3 (automatski)
```

**Prednosti sekvencijalnog punjenja:**
- 1 power unit punjuje 3 busa noću
- Smanjenje CAPEX-a za 60%
- Automatska tranzicija između vozila
- Optimalno za noćno punjenje (6-8 sati)

---

## 3. ChargeDock Dispenser - Overhead rješenje

### Opis

ChargeDock je overhead dispenser dizajniran za depoe s ograničenim prostorom oko vozila. Montira se na nadstrešnice, gantry strukture ili truss konstrukcije.

### Tehničke specifikacije

| Parametar | Vrijednost |
|-----------|------------|
| **Kompatibilnost** | HVC360 power cabinet |
| **Snaga** | Do 360 kW (dinamički) |
| **Struja** | Do 500 A |
| **Footprint** | 0.2 m² |
| **Udaljenost od kabineta** | Do 150 m |
| **Montaža** | Overhead (gantry, canopy, truss) |
| **Sučelja** | CCS, Pantograph |

### Primjena

```
      ═══════════════════════════════════════
           GANTRY STRUKTURA (NADSTREŠNICA)
      ═══════════════════════════════════════
           │         │         │         │
      ┌────┴────┐┌────┴────┐┌────┴────┐┌────┴────┐
      │ChargeDock│ChargeDock│ChargeDock│ChargeDock│
      └────┬────┘└────┬────┘└────┬────┘└────┬────┘
           │         │         │         │
           ▼         ▼         ▼         ▼
       ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
       │  BUS  │ │  BUS  │ │  BUS  │ │  BUS  │
       └───────┘ └───────┘ └───────┘ └───────┘

       ◄─────────── do 150 m ──────────────►
                       │
                       │
                 ┌─────┴─────┐
                 │  HVC360   │
                 │ 360 kW    │
                 └───────────┘
```

---

## 4. Pantograph sustavi - Opportunity charging

### Pantograph-down (HVC-PD)

Infrastruktura-montiran pantograph koji se spušta na kontaktne šine na krovu busa.

| Parametar | Vrijednost |
|-----------|------------|
| **Snaga** | 150 / 300 / 450 kW |
| **Izlazni napon** | 150 - 850 VDC |
| **Izlazna struja** | 250 A (150kW), 500 A (300kW), 600 A (450kW) |
| **Standard** | SAE J3105-1, OppCharge |
| **Vrijeme punjenja** | 3-6 minuta (tipično) |
| **Dimenzije stupa** | 5520 × 1060 × 4850 mm |
| **Težina** | 1650 kg |

### Pantograph-up (HVC-PU)

Vozilo-montiran pantograph koji se diže prema fiksnoj overhead šini.

| Parametar | Vrijednost |
|-----------|------------|
| **Snaga depot** | 50 - 150 kW (sekvencijalno) |
| **Snaga opportunity** | 150 - 600 kW |
| **Standard** | SAE J3105-2, OppCharge |
| **Dimenzije stupa** | 5300 × 1300 × 4600 mm |
| **Težina stupa** | 500 kg |

### Usporedba pantograph opcija

| Aspekt | Panto-down | Panto-up |
|--------|------------|----------|
| Masa na vozilu | ~20 kg (šine) | 100-150 kg |
| Trošak infrastrukture | Viši | Niži |
| Trošak po vozilu | Niži | Viši |
| Kompatibilnost | Šira | OEM specifična |
| Zaštita od vremena | Bolja | Lošija |
| Održavanje | Na infrastrukturi | Na vozilu |
| Dominacija | Sjeverna Amerika | Europa |

### OppCharge standard

ABB je suosnivač OppCharge standarda za automated DC punjenje autobusa:

| Parametar | Specifikacija |
|-----------|---------------|
| Komunikacija | WiFi (802.11a/n) + RFID |
| Protokol | ISO 15118-2 adaptirano |
| Pozicioniranje | ±200 mm longitudinalno, ±150 mm lateralno |
| Tipično vrijeme punjenja | 3-6 minuta |
| Domet po punjenju | 50-100 km (ovisno o snazi) |

---

## 5. MCS1200 - Megawatt charging sustav

### Opis

MCS1200 je ABB-ov sustav za megavatno punjenje, primarno namijenjen kamionima, ali primjenjiv i za coach autobuse na dugim relacijama.

### Tehničke specifikacije

| Parametar | Vrijednost |
|-----------|------------|
| **Izlazna snaga** | 1,200 kW kontinuirano |
| **Izlazna struja** | Do 1,500 A |
| **Arhitektura** | 3× 400 kW power kabineta |
| **Konektor** | MCS (SAE J3271) |
| **Hlađenje** | Tekuće (obavezno) |
| **Opcija** | Dual CCS + MCS |

### Testiranje s MAN Truck & Bus

ABB i MAN su proveli opsežna testiranja MCS1200:

| Test | Rezultat |
|------|----------|
| Stabilnost na 1,000 A | ✓ Uspješno |
| Punjenje 480 kWh baterije 2-90% | 36 minuta |
| Peak snaga | 740 kW @ 1,000 A |

### Dostupnost

| Regija | Status |
|--------|--------|
| Sjeverna Amerika | 2025-2026 |
| Europa | Čeka MCS regulativu |

---

## 6. Terra serija - Javno punjenje i flote

### Terra 360

| Parametar | Vrijednost |
|-----------|------------|
| **Snaga** | 360 kW |
| **Izlazi** | Do 4 (dinamička raspodjela) |
| **Napon** | Do 920 VDC |
| **Punjenje** | 100 km dometa u 3 minute |
| **Certifikacija** | CE, UL |

### Terra 184 / 124 / 94

| Model | Snaga | Dual outlet | Nadogradivo |
|-------|-------|-------------|-------------|
| Terra 94 | 90 kW | 45+45 kW | Do 180 kW |
| Terra 124 | 120 kW | 60+60 kW | Do 180 kW |
| Terra 184 | 180 kW | 90+90 kW | - |

**Zajedničke specifikacije:**
- Izlazni napon: 150-920 VDC
- Izlazna struja: Do 400 A (CCS)
- Efikasnost: 96%
- Power factor: >0.96
- THD: <5%
- Radna temperatura: -35°C do +55°C
- Display: 7" touchscreen u boji
- RFID: ISO/IEC 14443A/B, NFC

---

## 7. ABB Ability - Softverska platforma

### Mogućnosti

| Funkcija | Opis |
|----------|------|
| **Remote monitoring** | Real-time status svih punjača |
| **Dijagnostika** | Predictive maintenance, alarmi |
| **OTA updates** | Daljinsko ažuriranje firmwarea |
| **Fleet management** | Integracija s voznim parkovima |
| **Energy management** | Peak shaving, load balancing |
| **Reporting** | Analitika, izvještaji, billing |

### Integracija

| Sustav | Podrška |
|--------|---------|
| OCPP 1.6 / 2.0.1 | ✓ |
| ISO 15118-2 | ✓ Plug & Charge |
| Third-party backends | API integracija |
| Fleet management sustavi | Otvoreni API |

---

## 8. Referentne instalacije

### Hamburg Hochbahn (Njemačka)

| Podatak | Vrijednost |
|---------|------------|
| **Veličina** | 44 HVC150 punjača (150 kW svaki) |
| **Kapacitet** | 44 busa istovremeno, do 132 sekvencijalno |
| **Infrastruktura** | Trafo, switchgear, grid connection |
| **Tip** | Turnkey rješenje |
| **Cilj** | 1,000 e-buseva do 2030 |
| **Status** | Operativan od 2019 |

### Bern (Švicarska)

| Podatak | Vrijednost |
|---------|------------|
| **Opportunity charging** | 450 kW pantograph |
| **Depot charging** | 50 kW overnight |
| **Vrijeme punjenja** | ~5 minuta (opportunity) |

### Göttingen (Njemačka)

| Podatak | Vrijednost |
|---------|------------|
| **Sustav** | HVC 300P |
| **Snaga** | 300 kW DC |
| **Vrijeme punjenja** | 3-6 minuta |

### Qbuzz Nizozemska

| Podatak | Vrijednost |
|---------|------------|
| **Veličina** | 100+ high-power punjača |
| **Flota** | 99 autobusa |

---

## 9. Procjena troškova

### Napomena o cijenama

ABB ne objavljuje javno cijene za HVC (Heavy Vehicle Charger) seriju. Cijene ovise o:
- Konfiguraciji sustava
- Broju dispensera
- Instalacijskim zahtjevima
- Volumenu narudžbe
- Regiji

### Okvirne procjene (industrija)

| Proizvod | Procjena cijene | Napomena |
|----------|-----------------|----------|
| HVC150 (150 kW) | €40,000 - 60,000 | Pojedinačni punjač |
| HVC360 kabinet | €80,000 - 120,000 | Bez dispensera |
| ChargeDock dispenser | €15,000 - 25,000 | Po komadu |
| Pantograph-down stup | €150,000 - 250,000 | Uključuje punjač |
| Pantograph-up stup | €80,000 - 120,000 | Bez vozilo komponenti |
| Terra 184 | €50,000 - 70,000 | All-in-one |
| Terra 360 | €120,000 - 150,000 | All-in-one |

### Ukupni troškovi projekta (primjer)

**Depot 50 autobusa (sekvencijalno punjenje):**

| Stavka | Količina | Cijena | Ukupno |
|--------|----------|--------|--------|
| HVC360 kabinet | 6 | €100,000 | €600,000 |
| ChargeDock dispenser | 18 | €20,000 | €360,000 |
| Instalacija | - | - | €200,000 |
| Grid connection | - | - | €150,000 |
| Softver/integracija | - | - | €50,000 |
| **UKUPNO** | | | **€1,360,000** |
| **Po autobusu** | | | **€27,200** |

---

## 10. Kako nabaviti ABB opremu u Srbiji

### Opcija A: Direktno od ABB Srbija

**Kontakt:**
- ABB d.o.o.
- Bulevar Peka Dapčevića 13, 11000 Beograd
- Web: [new.abb.com/rs](https://new.abb.com/rs)
- E-mobility kontakt: [e-mobility.abb.com/en/contact-us](https://e-mobility.abb.com/en/contact-us)

**Proces:**
1. Kontaktirati ABB E-mobility tim
2. Definirati zahtjeve (snage, broj vozila, lokacije)
3. Site survey i feasibility study
4. Ponuda (tipično 2-4 tjedna)
5. Ugovor i narudžba
6. Isporuka (8-16 tjedana)
7. Instalacija i puštanje u rad

### Opcija B: Preko MT-KOMEX (certificirani partner)

**Kontakt:**
- MT-KOMEX d.o.o., Beograd
- Web: [mt-komex.rs](https://mt-komex.rs)
- Platforma: charge&GO

**Prednosti:**
- Lokalna podrška i servis
- Iskustvo s ABB instalacijama u Srbiji
- Integracija s charge&GO mrežom
- Poznavanje lokalnih propisa

**Dosadašnje reference:**
- Porsche Beograd (Terra 53)
- Vrčin naplatna rampa (HP 175)
- NAVAK poligon (Terra 54)
- NIS Gazprom stanice

### Opcija C: Tender / javna nabava

Za projekte poput EXPO 2027 ili GSP nabave:

1. **Specifikacija** - definirati tehničke zahtjeve prema ABB standardima
2. **Kvalifikacija** - uključiti ABB ili certificirane partnere
3. **Evaluacija** - TCO pristup, ne samo CAPEX
4. **Ugovor** - uključiti SLA, održavanje, garancije

---

## 11. Preporuke za EXPO 2027 / GSP Beograd

### Preporučena konfiguracija

**Za 100 Higer e-buseva (50 baterijskih + 50 ultracap):**

#### Depot punjenje (GSP depot)

| Komponenta | Količina | Specifikacija |
|------------|----------|---------------|
| HVC360 power cabinet | 8 | 360 kW, 4 izlaza |
| ChargeDock dispenser | 24 | CCS2, overhead |
| HVC150 sekvencijalni | 6 | 150 kW, 3 charge box-a |
| **Ukupno depot** | | 18 punjača za ~70 buseva |

#### Opportunity charging (terminusi)

| Lokacija | Komponenta | Snaga |
|----------|------------|-------|
| EXPO Surčin | HVC-PD pantograph | 2× 450 kW |
| Centar terminus 1 | HVC-PD pantograph | 1× 300 kW |
| Centar terminus 2 | HVC-PD pantograph | 1× 300 kW |
| Backup lokacija | HVC-PU pantograph | 1× 300 kW |

### Procjena budžeta

| Stavka | Procjena |
|--------|----------|
| Depot infrastruktura | €1,200,000 - 1,600,000 |
| Opportunity charging | €800,000 - 1,200,000 |
| Grid priključci | €300,000 - 500,000 |
| Instalacija i integracija | €200,000 - 300,000 |
| **UKUPNO** | **€2,500,000 - 3,600,000** |

### Vremenska linija

| Faza | Aktivnost | Trajanje |
|------|-----------|----------|
| Q1 2025 | Feasibility, specifikacija | 2 mjeseca |
| Q2 2025 | Tender, ugovaranje | 3 mjeseca |
| Q3-Q4 2025 | Proizvodnja, isporuka | 4-6 mjeseci |
| Q1 2026 | Instalacija depot | 3 mjeseca |
| Q2 2026 | Instalacija opportunity | 2 mjeseca |
| Q3 2026 | Testiranje, puštanje | 2 mjeseca |
| Q4 2026 | Puna operacija | - |
| Q2 2027 | EXPO 2027 | ✓ Spremno |

---

## 12. Prednosti i nedostaci ABB rješenja

### Prednosti

| Prednost | Opis |
|----------|------|
| **Globalni lider** | #1 u DC fast charging, 460k+ instalacija |
| **Dokazana tehnologija** | Hamburg, Bern, Qbuzz reference |
| **Prisutnost u Srbiji** | Lokalna podružnica + MT-KOMEX partner |
| **Skalabilnost** | Od 50 kW do 1.2 MW |
| **Interoperabilnost** | OppCharge, CCS, CHAdeMO, MCS |
| **Softver** | ABB Ability cloud platforma |
| **Garancija** | Standardno 2 godine, proširivo |
| **Servis** | Globalna mreža, lokalna podrška |

### Nedostaci

| Nedostatak | Opis |
|------------|------|
| **Cijena** | Premium segment, viša od kineskih alternativa |
| **Lead time** | 8-16 tjedana za HVC seriju |
| **Kompleksnost** | Zahtijeva stručnu instalaciju |
| **Ovisnost** | Specifični rezervni dijelovi |

---

## 13. Usporedba s konkurencijom

| Aspekt | ABB | Siemens/Heliox | Kempower | Kineski ODM |
|--------|-----|----------------|----------|-------------|
| Depot snage | 50-360 kW | 50-540 kW | 50-600 kW | 50-300 kW |
| Opportunity | Do 600 kW | Do 600 kW | Do 600 kW | Do 450 kW |
| MCS | 1.2 MW | U razvoju | 1.2 MW | - |
| Prisutnost u Srbiji | ✓ (MT-KOMEX) | Ograničeno | - | Više opcija |
| Cijena | $$$ | $$$ | $$ | $ |
| Reference (busevi) | Hamburg, Bern | Hamburg, London | Perth, Malaga | Kina dominira |
| V2G podrška | U razvoju | ✓ | U razvoju | Ograničeno |

---

## Izvori

- [ABB E-mobility službena stranica](https://e-mobility.abb.com/en)
- [HVC360 produktna stranica](https://e-mobility.abb.com/en/products/heavy-duty/hvc360)
- [ABB opportunity charging](https://e-mobility.abb.com/en/opportunity-charging-bus-fleets)
- [MCS1200 produktna stranica](https://e-mobility.abb.com/en/products/heavy-duty/mcs1200)
- [ABB Srbija vijesti](https://new.abb.com/news/detail/113789/20-years-of-abb-in-serbia)
- [eKapija - prvi ABB punjač u Srbiji](https://www.ekapija.com/news/2140570)
- [MT-KOMEX case study](https://www.virta.global/customers/case-mt-komex-bringing-smart-and-easy-ev-charging-to-the-western-balkans)
- [Hamburg Hochbahn case study](https://new.abb.com/news/detail/18710/fleet-of-abb-bus-chargers-will-power-hamburgs-drive-into-the-e-mobility-future)
- [ABB + MAN MCS testiranje](https://www.electrive.com/2025/09/24/man-and-abb-refine-reliability-of-mcs-charging-sessions/)
- [ABB novi proizvodi 2025](https://www.electrive.com/2025/04/25/abb-e-mobility-expands-dc-charging-portfolio/)
