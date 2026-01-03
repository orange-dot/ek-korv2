# Tehničke opcije i metode razvoja EV punjača: analiza za odabir

## Pregled opcija

Ovaj dokument predstavlja sve tehničke opcije za razvoj punjača električnih autobusa, organizirane po ključnim domenama odlučivanja. Svaka opcija uključuje prednosti, nedostatke, procjenu kompleksnosti i preporuke za različite scenarije.

---

## 1. Strateški pristup razvoju

### Opcija 1A: Potpuni in-house razvoj

**Opis**: Razvoj svih komponenti interno - energetska elektronika, softver, mehanika, termalni sustav.

| Aspekt | Ocjena |
|--------|--------|
| Kontrola IP-a | ★★★★★ |
| Inicijalni trošak | ★☆☆☆☆ (visok) |
| Vrijeme do tržišta | ★☆☆☆☆ (dugo) |
| Fleksibilnost | ★★★★★ |
| Potrebni resursi | 15-25 inženjera, 18-36 mjeseci |

**Prednosti**:
- Potpuna kontrola nad dizajnom i IP-om
- Mogućnost optimizacije za specifične zahtjeve
- Dugoročna neovisnost o dobavljačima
- Visoke marže na gotovom proizvodu

**Nedostaci**:
- Visoki inicijalni troškovi (€2-5M za razvoj)
- Dugo vrijeme do tržišta
- Potreba za širokim spektrom ekspertize
- Rizik tehničkih slijepih ulica

**Preporučeno za**: Tvrtke s dugoročnom vizijom, postojećom ekspertizom u energetskoj elektronici, i pristupom kapitalu.

---

### Opcija 1B: Integracija gotovih modula

**Opis**: Nabava certificiranih power modula (AC/DC, DC/DC) od specijaliziranih proizvođača, vlastiti razvoj softvera i integracije.

| Aspekt | Ocjena |
|--------|--------|
| Kontrola IP-a | ★★★☆☆ |
| Inicijalni trošak | ★★★☆☆ (srednji) |
| Vrijeme do tržišta | ★★★★☆ (brzo) |
| Fleksibilnost | ★★★☆☆ |
| Potrebni resursi | 5-10 inženjera, 8-14 mjeseci |

**Dobavljači power modula**:
- **Infineon** - PrimePACK, EasyPACK moduli
- **Wolfspeed** - SiC power moduli do 1200V/450A
- **Vincotech** - integrirani PFC + DC/DC moduli
- **Semikron Danfoss** - SEMITRANS, MiniSKiiP serije
- **Fuji Electric** - V-serija IGBT moduli

**Prednosti**:
- Značajno kraće vrijeme razvoja
- Dokazana pouzdanost modula
- Lakši put do certifikacije
- Manji razvojni tim

**Nedostaci**:
- Ovisnost o dobavljačima
- Ograničena optimizacija
- Niže marže
- Manja diferencijacija proizvoda

**Preporučeno za**: Brzi ulazak na tržište, tvrtke s fokusom na softver i integraciju.

---

### Opcija 1C: White-label / ODM partnerstvo

**Opis**: Partnerstvo s postojećim proizvođačem punjača koji proizvodi pod vašim brendom.

| Aspekt | Ocjena |
|--------|--------|
| Kontrola IP-a | ★☆☆☆☆ |
| Inicijalni trošak | ★★★★☆ (nizak) |
| Vrijeme do tržišta | ★★★★★ (najbrže) |
| Fleksibilnost | ★★☆☆☆ |
| Potrebni resursi | 2-5 ljudi, 3-6 mjeseci |

**Potencijalni ODM partneri**:
- **Shenzhen SETEC** (Kina) - 7-360 kW DC punjači
- **Shenzhen Infypower** (Kina) - modularni sustavi
- **Delta Electronics** (Tajvan) - 25-200 kW moduli
- **Tritium** (Australija) - white-label opcije
- **Phihong** (Tajvan) - OEM/ODM programi

**Prednosti**:
- Minimalan razvojni napor
- Najbrži time-to-market
- Nizak rizik
- Pristup certificiranim proizvodima

**Nedostaci**:
- Minimalna kontrola nad proizvodom
- Niska diferencijacija
- Ovisnost o partneru
- Niže marže (10-20% vs 40-50% za in-house)

**Preporučeno za**: Testiranje tržišta, tvrtke fokusirane na usluge, brzu validaciju poslovnog modela.

---

### Opcija 1D: Hibridni pristup

**Opis**: Kombinacija - kupovina power stage modula, vlastiti razvoj kontrole, softvera i termalnog sustava.

| Aspekt | Ocjena |
|--------|--------|
| Kontrola IP-a | ★★★★☆ |
| Inicijalni trošak | ★★★☆☆ |
| Vrijeme do tržišta | ★★★☆☆ |
| Fleksibilnost | ★★★★☆ |
| Potrebni resursi | 8-15 inženjera, 12-18 mjeseci |

**Struktura**:
```
Kupljeno:                    Vlastito:
├─ Power moduli (IGBT/SiC)   ├─ Kontrolna elektronika
├─ Gate driveri              ├─ Firmware/softver
├─ Konektori (CCS2)          ├─ Komunikacijski stack
└─ Rashladne pumpe           ├─ Termalni dizajn
                             ├─ Mehanički dizajn
                             └─ Sistemska integracija
```

**Prednosti**:
- Balans između brzine i kontrole
- IP u ključnim područjima (softver, kontrola)
- Razumno vrijeme razvoja
- Mogućnost diferencijacije

**Nedostaci**:
- Složenije upravljanje projektom
- Potreba za integracijom više izvora
- Srednji troškovi

**Preporučeno za**: Optimalan balans za većinu projekata. Omogućava brz start s putom prema većoj vertikalnoj integraciji.

---

## 2. Topologije energetske elektronike

### AC/DC stupanj (Power Factor Correction)

#### Opcija 2A: Vienna Rectifier

```
       L1 ──┬──[L]──┬──────┐
             │       │      │
       L2 ──┬──[L]──┼──┬───┼──┐
             │       │  │   │  │
       L3 ──┬──[L]──┼──┼───┼──┼──┐
             │       │  │   │  │  │
            ┌┴┐     ┌┴┐┌┴┐ ┌┴┐┌┴┐┌┴┐
            │D│     │S││S│ │S││S││S│    ──► DC+
            └┬┘     └┬┘└┬┘ └┬┘└┬┘└┬┘
             │       └──┴───┴──┴──┘
             │              │            ──► DC mid
             │       ┌──┬───┬──┬──┐
            ┌┴┐     ┌┴┐┌┴┐ ┌┴┐┌┴┐┌┴┐
            │D│     │S││S│ │S││S││S│    ──► DC-
            └┬┘     └┬┘└┬┘ └┬┘└┬┘└┬┘
             └───────┴──┴───┴──┴──┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 98-98.5% |
| THD | <3% (zadovoljava IEEE 519) |
| Power factor | >0.99 |
| Kompleksnost | Srednja |
| Bidirekcionalnost | Ne |
| Tipična primjena | Unidirekcijski punjači visokih performansi |

**Prednosti**:
- Izvrsna efikasnost
- Nizak THD bez dodatnog filtriranja
- Tri razine - manji naponski stres na komponentama
- Prirodna balansiranost DC linka

**Nedostaci**:
- Ne podržava V2G (nije bidirekcijski)
- Složenija kontrola od jednostavnog mosnog ispravljača
- Potrebne brze diode

**Preporučeno za**: Depot punjače bez V2G zahtjeva, primjene gdje je efikasnost prioritet.

---

#### Opcija 2B: Active Front End (AFE) / PWM Rectifier

```
       L1 ──[L]──┬────┬────┐
                 │    │    │
       L2 ──[L]──┼──┬─┼──┬─┼──┐
                 │  │ │  │ │  │
       L3 ──[L]──┼──┼─┼──┼─┼──┼──┐
                 │  │ │  │ │  │  │
                ┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐┌┴┐
                │T││T││T││T││T││T│      T = IGBT/SiC
                └┬┘└┬┘└┬┘└┬┘└┬┘└┬┘
                 │  │  │  │  │  │
                 └──┴──┴──┴──┴──┘
                        │
                       DC bus
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 96-98% |
| THD | <5% (s filtriranjem) |
| Power factor | >0.99 (podesiv) |
| Kompleksnost | Visoka |
| Bidirekcionalnost | Da (4-quadrant) |
| Tipična primjena | V2G punjači, grid services |

**Prednosti**:
- Potpuna bidirekcionalnost (V2G)
- Podesiv power factor (reactive power compensation)
- Može pružati grid services
- Jedna topologija za sve primjene

**Nedostaci**:
- Niža efikasnost od Vienna Rectifiera
- Složenija kontrola
- Više preklopnih gubitaka
- Potrebno više filtriranja za THD

**Preporučeno za**: Punjače s V2G zahtjevom, sustave koji pružaju grid usluge, opportunity charging s regenerativnim kočenjem.

---

#### Opcija 2C: Passive Rectifier + DC/DC Boost

```
       3-phase ──► [Diodni most] ──► [Boost DC/DC] ──► DC bus
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 92-95% (ukupno) |
| THD | 25-30% (loše) |
| Power factor | 0.85-0.92 |
| Kompleksnost | Niska |
| Bidirekcionalnost | Ne |
| Tipična primjena | Niskocjenovni punjači, <50 kW |

**Prednosti**:
- Najjednostavnija implementacija
- Najniži trošak komponenti
- Robusnost
- Jednostavna kontrola

**Nedostaci**:
- Loš THD - potrebni veliki pasivni filtri
- Nizak power factor - penali od distributera
- Niska efikasnost
- Ne zadovoljava moderne standarde bez dodatnog filtriranja

**Preporučeno za**: Niskobudžetne projekte, laboratorijske prototipe, tržišta bez strogih grid code zahtjeva.

---

### DC/DC stupanj (izolirani)

#### Opcija 2D: LLC Rezonantni pretvarač

```
    DC+ ──┬──[S1]──┬──[S3]──┐
          │        │        │
          │    [Lr]─[Cr]    │
          │        │        │
          │      ┌─┴─┐      │
          │      │ T │      ├──► Izlaz DC
          │      └─┬─┘      │
          │        │        │
    DC- ──┴──[S2]──┴──[S4]──┘

    Lr = rezonantna induktivnost
    Cr = rezonantni kondenzator
    T = HF transformator
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 97-98% |
| ZVS raspon | Širok (puni opseg opterećenja) |
| Kompleksnost kontrole | Srednja |
| EMI | Nizak (soft switching) |
| Bidirekcionalnost | Ne (jednostavna verzija) |
| Gustoća snage | Visoka |

**Prednosti**:
- Izvrsna efikasnost kroz soft switching
- Nizak EMI
- Visoka gustoća snage
- Jednostavna sekundarna strana (samo diode)

**Nedostaci**:
- Uska regulacija napona (tipično ±20%)
- Nije inherentno bidirekcijski
- Dizajn rezonantnog tanka kritičan
- Osjetljiv na varijacije komponenti

**Preporučeno za**: Unidirekcijske primjene s umjerenim naponskim rasponom, visoka efikasnost prioritet.

---

#### Opcija 2E: Dual Active Bridge (DAB)

```
    DC+ ──┬──[S1]──┬──[S3]──┐       ┌──[S5]──┬──[S7]──┬── DC+
          │        │        │       │        │        │
          │        │        │   ┌─┴─┐       │        │
          │        └────────┼───│ T │───────┼────────┘
          │                 │   └─┬─┘       │
          │        ┌────────┼─────┘         │
          │        │        │               │
    DC- ──┴──[S2]──┴──[S4]──┘       └──[S6]──┴──[S8]──┴── DC-

    Primarni H-bridge    │    Sekundarni H-bridge
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 96-97% |
| ZVS raspon | Ograničen (ovisi o opterećenju) |
| Kompleksnost kontrole | Visoka |
| EMI | Srednji |
| Bidirekcionalnost | Da (inherentno) |
| Naponski raspon | Širok (2:1 i više) |

**Prednosti**:
- Puna bidirekcionalnost za V2G
- Širok naponski raspon (prilagodba različitim baterijama)
- Galvanska izolacija
- Modularna skalabilnost

**Nedostaci**:
- Niža efikasnost pri laganom opterećenju
- Složena kontrola (phase-shift + frequency)
- Više aktivnih komponenti
- ZVS nije garantiran u cijelom radnom području

**Preporučeno za**: V2G punjače, širok raspon naponskih kompatibilnosti, MCS primjene.

---

#### Opcija 2F: Phase-Shifted Full Bridge (PSFB)

```
    DC+ ──┬──[S1]────[S3]──┐
          │                │
          │     ┌─[Lr]─┐   │
          │     │  ┌─┴─┐   │
          │     └──│ T │───┼──► Izlaz
          │        └─┬─┘   │
          │                │
    DC- ──┴──[S2]────[S4]──┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Efikasnost | 95-97% |
| ZVS raspon | Pri većem opterećenju |
| Kompleksnost kontrole | Srednja |
| EMI | Srednji |
| Bidirekcionalnost | Ne |
| Naponski raspon | Srednji |

**Prednosti**:
- Dobro razumljena topologija
- ZVS pri srednjem i punom opterećenju
- Jednostavnija kontrola od DAB-a
- Široka dostupnost referentnih dizajna

**Nedostaci**:
- Gubitak ZVS-a pri laganom opterećenju
- Potrebna dodatna induktivnost
- Problem s duty cycle gubitkom
- Nije bidirekcijski

**Preporučeno za**: Srednja snaga (50-150 kW), unidirekcijski punjači, brz razvoj s dobrom efikasnošću.

---

### Usporedba DC/DC topologija

| Topologija | Efikasnost | Bidirek. | Kompleksnost | V2G | Preporuka |
|------------|------------|----------|--------------|-----|-----------|
| LLC | 97-98% | Ne | Srednja | Ne | Depot bez V2G |
| DAB | 96-97% | Da | Visoka | Da | V2G, MCS |
| PSFB | 95-97% | Ne | Srednja | Ne | Brz razvoj |
| Interleaved Boost | 96-98% | Ne | Niska | Ne | Neizolirano |

---

## 3. Poluvodičke tehnologije

### Opcija 3A: Silicijski IGBT

| Parametar | Vrijednost |
|-----------|------------|
| Napon | Do 1700V |
| Frekvencija | 10-30 kHz tipično |
| Efikasnost | Bazna referenca |
| Trošak | €0.05-0.15/W |
| Zrelost | Vrlo visoka |

**Prednosti**:
- Najniži trošak po vatu
- Dokazana pouzdanost
- Široka dostupnost
- Jednostavni gate driveri

**Nedostaci**:
- Ograničena switching frekvencija
- Veći switching gubici
- Veći pasivni elementi (zbog niže frekvencije)
- Veći sustav hlađenja

**Preporučeno za**: Niskobudžetni projekti, aplikacije gdje veličina nije kritična.

---

### Opcija 3B: Silicij-karbid (SiC) MOSFET

| Parametar | Vrijednost |
|-----------|------------|
| Napon | Do 1700V (3300V u razvoju) |
| Frekvencija | 50-150 kHz |
| Efikasnost | +2-3% vs IGBT |
| Trošak | €0.20-0.50/W |
| Zrelost | Visoka (mainstream od 2020) |

**Dobavljači**:
- Wolfspeed (Cree) - lideri, najširi portfelj
- Infineon - CoolSiC serija
- ROHM - Treća generacija
- STMicroelectronics - STPOWER serija
- Onsemi - EliteSiC

**Prednosti**:
- Značajno viša efikasnost (smanjenje gubitaka ~38%)
- Veća frekvencija → manji pasivni elementi
- Bolje termalne karakteristike
- 50%+ smanjenje veličine sustava

**Nedostaci**:
- 3-4x viša cijena od IGBT-a
- Složeniji gate driving (strmiji dv/dt)
- EMI izazovi pri visokoj frekvenciji
- Manja dostupnost u odnosu na IGBT

**Preporučeno za**: Visokoefikasni punjači, kompaktni dizajn, primjene gdje je veličina/težina kritična.

---

### Opcija 3C: Galij-nitrid (GaN) HEMT

| Parametar | Vrijednost |
|-----------|------------|
| Napon | Do 650V (900V u razvoju) |
| Frekvencija | 100 kHz - 1 MHz |
| Efikasnost | +1-2% vs SiC |
| Trošak | €0.30-0.80/W |
| Zrelost | Srednja (za visoku snagu) |

**Dobavljači**:
- GaN Systems - do 650V/100A
- Navitas - NV6xxx serija
- EPC (Efficient Power Conversion)
- Infineon - CoolGaN
- Texas Instruments - LMG serija

**Prednosti**:
- Najviša moguća frekvencija
- Najmanji pasivni elementi
- Zero reverse recovery
- Odlično za LLC topologije

**Nedostaci**:
- Ograničen napon (650V mainstream)
- Visoka cijena
- Složen gate driving
- Termalni izazovi pri visokoj gustoći

**Preporučeno za**: On-board chargeri, niske do srednje snage (<50 kW), iznimno kompaktni dizajni.

---

### Usporedna tablica poluvodiča

| Parametar | Si IGBT | SiC MOSFET | GaN HEMT |
|-----------|---------|------------|----------|
| Tipična frekvencija | 20 kHz | 100 kHz | 500 kHz |
| Relativni gubici | 1.0x | 0.6x | 0.5x |
| Relativna cijena | 1.0x | 3-4x | 5-6x |
| Naponski rang | 1700V | 1700V | 650V |
| Gustoća snage | Niska | Visoka | Najviša |
| **Preporuka snage** | >200 kW, low-cost | 50-600 kW | <50 kW |

---

## 4. Sustavi hlađenja

### Opcija 4A: Prisilna konvekcija zrakom

```
                    ┌─────────────────┐
    Ulaz zraka ───► │ [Ventilator]    │
                    │      │          │
                    │  ┌───┴───┐      │
                    │  │Hladnjak│      │
                    │  │(finned)│      │
                    │  └───┬───┘      │
                    │      │          │
                    └──────┼──────────┘
                           ▼
                    Izlaz toplog zraka
```

| Parametar | Vrijednost |
|-----------|------------|
| Kapacitet | Do ~150 kW |
| Efikasnost hlađenja | 200-500 W/m²K |
| Trošak | Nizak (€500-2000) |
| Održavanje | Čišćenje filtera |
| Buka | 50-70 dB |

**Prednosti**:
- Najjednostavnija implementacija
- Nizak trošak
- Nema tekućine za curenje
- Jednostavno održavanje

**Nedostaci**:
- Ograničen kapacitet
- Osjetljivost na prašinu/prljavštinu
- Degradacija s ambijentalnom temperaturom
- Veći volumen sustava

**Preporučeno za**: Punjači do 100-150 kW, čista okruženja, niskobudžetni projekti.

---

### Opcija 4B: Tekuće hlađenje (voda-glikol)

```
    ┌──────────────────────────────────────────┐
    │                                          │
    │  ┌─────┐    ┌─────────┐    ┌─────────┐  │
    │  │Pumpa│───►│Cold plate│───►│Cold plate│──┤
    │  └──┬──┘    │(PFC)    │    │(DC/DC)  │  │
    │     │       └─────────┘    └─────────┘  │
    │     │                                    │
    │  ┌──┴──────────────────────────────┐    │
    │  │      Radiator + ventilatori     │◄───┘
    │  └─────────────────────────────────┘
    │         │
    │  ┌──────┴──────┐
    │  │Ekspanzijska │
    │  │   posuda    │
    │  └─────────────┘
    └──────────────────────────────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Kapacitet | Do ~1 MW+ |
| Efikasnost hlađenja | 1000-5000 W/m²K |
| Trošak | Srednji (€3000-10000) |
| Održavanje | Zamjena rashladne tekućine |
| Buka | 40-55 dB |

**Komponente**:
- Cold plates (aluminij ili bakar)
- Cirkulacijska pumpa (20-50 L/min)
- Radiator s ventilatorima
- Ekspanzijska posuda
- Rashladna tekućina (50/50 voda/glikol)
- Filtri i senzori protoka

**Prednosti**:
- Visok kapacitet hlađenja
- Kompaktniji power electronics
- Bolja kontrola temperature
- Niža buka (manji ventilatori)

**Nedostaci**:
- Složenija konstrukcija
- Mogućnost curenja
- Potrebno održavanje tekućine
- Viši trošak

**Preporučeno za**: Punjači 150 kW+, kompaktni dizajni, vanjska instalacija.

---

### Opcija 4C: Tekuće hlađeni kablovi

```
    Punjač ──[Rashladna tekućina]──► Konektor
              ▲                        │
              │    Kabel s cijevima    │
              │    za rashladnu        │
              │    tekućinu            │
              │                        ▼
              └────────────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Kapacitet | Do 500A kontinuirano |
| Smanjenje težine kabla | 40% vs air-cooled |
| Standard | IEC 62893-4-2 |
| Trošak | €2000-5000 po kablu |
| Proizvođači | HUBER+SUHNER, Leoni, Phoenix Contact |

**Prednosti**:
- Omogućava tanke, fleksibilne kablove
- Kontinuirana operacija na visokoj struji
- Manji termalni stres na konektoru
- Sigurnija operacija

**Nedostaci**:
- Složenija konstrukcija punjača
- Potrebne quick-disconnect spojnice
- Viši trošak kabla
- Održavanje spojnica

**Preporučeno za**: Punjači >200 kW, opportunity charging, korisničke primjene (laki kabel za rukovanje).

---

### Opcija 4D: Dvofazno hlađenje (immersion/vapor chamber)

| Parametar | Vrijednost |
|-----------|------------|
| Kapacitet | Vrlo visok |
| Efikasnost | 10,000+ W/m²K |
| Trošak | Visok (€10,000+) |
| Kompleksnost | Vrlo visoka |
| Zrelost | Niska za EV punjače |

**Prednosti**:
- Izuzetna termalna performansa
- Pasivno (vapor chamber) ili aktivno
- Izolacija elektronike od okoline

**Nedostaci**:
- Visok trošak
- Složena implementacija
- Ograničena iskustva u industriji
- Servisiranje problematično

**Preporučeno za**: MCS (MW-class), ekstremni uvjeti, specijalne primjene.

---

### Usporedba sustava hlađenja

| Sustav | Kapacitet | Trošak | Kompleksnost | Preporuka |
|--------|-----------|--------|--------------|-----------|
| Zračno | Do 150 kW | € | Niska | Depot, <150 kW |
| Tekuće (zatvoreno) | Do 1 MW | €€ | Srednja | 150-600 kW |
| Tekuće hlađeni kabel | +200A | €€ | Srednja | >200 kW, opportunity |
| Dvofazno | >1 MW | €€€€ | Visoka | MCS |

---

## 5. Komunikacijski protokoli

### Opcija 5A: ISO 15118-2 (DIN SPEC 70121 kompatibilan)

| Parametar | Vrijednost |
|-----------|------------|
| Fizički sloj | PLC (HomePlug GreenPHY) |
| Plug & Charge | Podržan (PKI) |
| Max snaga | Do 350 kW |
| Enkritpcija | TLS 1.2 |
| Zrelost | Visoka |

**Prednosti**:
- Industrija standard za CCS
- Plug & Charge smanjuje frikciju
- Dobra interoperabilnost
- Mnogo referentnih implementacija

**Nedostaci**:
- PLC osjetljiv na smetnje
- Složena PKI infrastruktura
- Ranjivosti (SLAC protocol)

**Preporučeno za**: CCS2 punjači, depot i opportunity charging.

---

### Opcija 5B: ISO 15118-20

| Parametar | Vrijednost |
|-----------|------------|
| Fizički sloj | PLC ili WiFi ili Automotive Ethernet |
| Plug & Charge | Poboljšan |
| Max snaga | Do 3.75 MW (MCS) |
| Enkripcija | TLS 1.3 |
| Bidirekcionalnost | Puna V2G podrška |

**Prednosti**:
- Budućnost standarda
- MCS podrška
- Poboljšana sigurnost
- Wireless opcija

**Nedostaci**:
- Još uvijek u ranoj adopciji
- Manje implementacija
- Potrebna nadogradnja infrastrukture

**Preporučeno za**: Novi razvoji, V2G sustavi, priprema za MCS.

---

### Opcija 5C: GB/T 27930 (Kinesko tržište)

| Parametar | Vrijednost |
|-----------|------------|
| Fizički sloj | CAN bus |
| Max snaga | Do 237.5 kW (GB/T), 900 kW (ChaoJi) |
| Enkripcija | Osnovna |
| Tržište | Kina, dijelovi Azije |

**Prednosti**:
- Obavezan za kinesko tržište
- Jednostavnija implementacija (CAN)
- ChaoJi budućnost s globalnom kompatibilnošću

**Nedostaci**:
- Nije kompatibilan s CCS
- Različite polaritete konektora
- Manja globalna relevantnost

**Preporučeno za**: Projekti za kinesko tržište, ChaoJi priprema.

---

### Opcija 5D: OppCharge (WiFi za pantograf)

| Parametar | Vrijednost |
|-----------|------------|
| Fizički sloj | WiFi (802.11a/n) |
| Enkripcija | WPA2 |
| Specifičnost | Pantograph charging |
| Pozicioniranje | RFID + WiFi |

**Prednosti**:
- Standard za pantograph opportunity charging
- Bez fizičke komunikacijske veze
- Podrška velikih OEM-ova (Volvo, ABB, Siemens)

**Nedostaci**:
- Samo za pantograph
- WiFi interferencija u depoima
- Dodatna složenost

**Preporučeno za**: Pantograph opportunity charging sustavi.

---

### Backend komunikacija: OCPP

| Verzija | Značajke | Preporuka |
|---------|----------|-----------|
| OCPP 1.6 | Bazična funkcionalnost, široka podrška | Legacy sustavi |
| OCPP 2.0.1 | ISO 15118 integracija, V2G, sigurnost | Novi projekti |
| OCPP 2.1 | Device Management, ISO 15118-20 | Budućnost |

---

## 6. Konektori i sučelja

### Opcija 6A: CCS2 (Combo 2)

```
    ┌─────────────────┐
    │  ○   ○   ○   ○  │  ← AC pinovi (L1, L2, L3, N)
    │       ○        │  ← PE (uzemljenje)
    │                 │
    │    ●       ●   │  ← DC+ i DC-
    │                 │
    │      ○  ○      │  ← CP, PP (signalni)
    └─────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Max snaga | 350 kW (500 kW u specifikaciji) |
| Max napon | 1000 VDC |
| Max struja | 500 A |
| Standard | IEC 62196-3 |
| Tržište | Europa, ostatak svijeta (osim NAM, Kina, Japan) |

**Preporučeno za**: Europsko tržište, depot charging, opportunity plug-in.

---

### Opcija 6B: CCS1 (Combo 1)

| Parametar | Vrijednost |
|-----------|------------|
| Max snaga | 350 kW |
| Max napon | 1000 VDC |
| Max struja | 500 A |
| Tržište | Sjeverna Amerika |

**Preporučeno za**: Sjevernoameričko tržište.

---

### Opcija 6C: MCS (Megawatt Charging System)

```
    ┌─────────────────────┐
    │         △          │  ← Trokutasti oblik
    │     ●       ●      │  ← DC+ i DC- (velike površine)
    │                     │
    │   ○   ○   ○   ○    │  ← Signalni pinovi
    │                     │
    │  [Liquid cooling]   │  ← Priključci za hlađenje
    └─────────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Max snaga | 3.75 MW |
| Max napon | 1250 VDC (konektor za 1500V) |
| Max struja | 3000 A |
| Standard | SAE J3271 |
| Zrelost | Rana komercijalizacija (2024-2025) |

**Prednosti**:
- Budućnost heavy-duty punjenja
- Omogućava 20-80% u ~30 min za velike baterije
- Automotive Ethernet komunikacija

**Nedostaci**:
- Novi standard, mala baza vozila
- Visok trošak infrastrukture
- Tekuće hlađenje obavezno

**Preporučeno za**: Budući razvoj, dugoročna strategija, heavy-duty fokus.

---

### Opcija 6D: Pantograph sustavi

#### 6D-1: Pantograph-up (vozilo montiran)

```
         ═══════════════  ← Fiksna gornja šina (infrastruktura)
              │
         ┌────┴────┐
         │Pantograph│      ← Na krovu vozila, diže se
         └────┬────┘
              │
    ┌─────────┴─────────┐
    │      BUS         │
    └───────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Tipična snaga | 150-450 kW |
| Masa na vozilu | 100-150 kg |
| Tolerancija pozicioniranja | ±200mm longitudinalno, ±150mm lateralno |
| Standard | SAE J3105-2 |
| Dominacija | Europa |

---

#### 6D-2: Pantograph-down (infrastruktura montiran)

```
         ┌────────────┐
         │ Pantograph │    ← Na stupu, spušta se
         └─────┬──────┘
               │
         ═════╤═════       ← Kontaktne šine na krovu vozila
    ┌─────────┴─────────┐
    │       BUS         │
    └───────────────────┘
```

| Parametar | Vrijednost |
|-----------|------------|
| Tipična snaga | 300-600 kW |
| Masa na vozilu | ~10-20 kg (samo kontaktne šine) |
| Tolerancija pozicioniranja | Stroža (±100mm) |
| Standard | SAE J3105-1 |
| Dominacija | Sjeverna Amerika |

**Usporedba pantograph opcija**:

| Aspekt | Pantograph-up | Pantograph-down |
|--------|---------------|-----------------|
| Masa na vozilu | Veća (100-150 kg) | Manja (~20 kg) |
| Trošak infrastrukture | Niži | Viši |
| Trošak po vozilu | Viši | Niži |
| Zaštita od vremena | Lošija | Bolja |
| Održavanje | Na vozilu | Na infrastrukturi |

**Preporučeno za**: Pantograph-down za flote s više vozila (niži trošak po vozilu), Pantograph-up za manje flote ili retrofit.

---

### Opcija 6E: Bežično (induktivno) punjenje

```
    ═══════════════════════
           │
    ┌──────┴──────┐
    │    VAU     │  ← Vehicle Assembly Unit (prijemnik)
    └──────┬──────┘
           │ zračni procjep (Z1/Z2/Z3)
    ┌──────┴──────┐
    │    GAU     │  ← Ground Assembly Unit (odašiljač)
    └─────────────┘
    ═══════════════════════
         TLOCRT
```

| Parametar | Vrijednost |
|-----------|------------|
| Frekvencija | 85 kHz (SAE J2954) |
| Snaga | 50-450 kW (do 1 MW u razvoju) |
| Efikasnost | 90-95% |
| Zračni procjep | Z1: 100-150mm, Z2: 140-210mm, Z3: 170-250mm |
| Lateralna tolerancija | ±100 mm |

**Dobavljači**:
- InductEV (ex Momentum Dynamics) - 50-450 kW
- WAVE/Ideanomics - 250-500 kW
- Electreon - dinamičko punjenje
- ENRX/IPT - 200 kW

**Prednosti**:
- Bez fizičkog kontakta
- Automatska operacija
- Otpornost na vremenske uvjete
- Nema trošenja konektora

**Nedostaci**:
- Niža efikasnost od konduktivnog
- Viši trošak
- Precizno pozicioniranje potrebno
- FOD/LOP sigurnosni sustavi

**Preporučeno za**: Automatizirana operacija, teški vremenski uvjeti, estetski osjetljive lokacije.

---

## 7. Kontrolni sustavi i softver

### Opcija 7A: Vlastiti embedded sustav

| Komponenta | Opcije |
|------------|--------|
| MCU/MPU | STM32H7, NXP i.MX RT, TI C2000 |
| RTOS | FreeRTOS, Zephyr, ThreadX |
| Komunikacija | Vlastiti stack (ISO 15118, OCPP) |

**Prednosti**:
- Potpuna kontrola
- Optimizacija za specifične potrebe
- Nema licencnih troškova (open source RTOS)

**Nedostaci**:
- Dugo vrijeme razvoja
- Potrebna duboka ekspertiza
- Certifikacija složenija

**Preporučeno za**: Tvrtke s embedded ekspertizom, dugoročni proizvodi.

---

### Opcija 7B: Gotove kontrolne platforme

| Dobavljač | Platforma | Značajke |
|-----------|-----------|----------|
| Vector | vAC Charger Platform | ISO 15118, OCPP, certificirano |
| dSPACE | MicroAutoBox | Rapid prototyping, HIL |
| Bender | CC613 | EV charging controller, certificiran |
| Phoenix Contact | CHARX control | Modularno, skalabilno |

**Prednosti**:
- Brz razvoj
- Pre-certificirane komponente
- Podrška proizvođača
- Dokazana pouzdanost

**Nedostaci**:
- Licencni troškovi
- Manja fleksibilnost
- Ovisnost o dobavljaču

**Preporučeno za**: Brzi time-to-market, manji timovi, fokus na integraciju.

---

### Opcija 7C: Hibridni pristup

```
┌─────────────────────────────────────────────────┐
│              Sistemska arhitektura              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────┐    ┌───────────────┐        │
│  │ Kupljeno:     │    │ Vlastito:     │        │
│  │               │    │               │        │
│  │ - ISO 15118   │◄──►│ - Charge      │        │
│  │   stack       │    │   control     │        │
│  │ - OCPP client │    │   algoritmi   │        │
│  │ - Safety      │    │ - Fleet       │        │
│  │   monitor     │    │   integracija │        │
│  │               │    │ - UI/UX       │        │
│  └───────────────┘    │ - Analytics   │        │
│                       └───────────────┘        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Preporučeno za**: Balans između brzine i kontrole, fokus na diferencijaciju u softveru.

---

## 8. Testiranje i validacija

### Opcija 8A: Interno testiranje

| Oprema | Svrha | Trošak |
|--------|-------|--------|
| Programabilno DC opterećenje | Simulacija baterije | €20,000-100,000 |
| AC izvor (grid simulator) | Testiranje PFC | €30,000-80,000 |
| Osciloskop (4+ kanala) | Analiza signala | €10,000-50,000 |
| Power analyzer | Efikasnost, PF, THD | €15,000-40,000 |
| Termalna kamera | Termalna analiza | €5,000-20,000 |
| EMC pre-compliance | EMI skeniranje | €20,000-50,000 |
| **Ukupno** | | **€100,000-340,000** |

**Prednosti**:
- Brze iteracije
- Nema čekanja na eksterne laboratorije
- Dugoročna ušteda

**Nedostaci**:
- Visok inicijalni trošak
- Potreban prostor i osoblje
- Ne zamjenjuje formalnu certifikaciju

---

### Opcija 8B: Eksterni testni laboratoriji

| Laboratorij | Lokacija | Specijalizacija |
|-------------|----------|-----------------|
| TÜV SÜD | Njemačka | Sigurnost, EMC |
| TÜV Rheinland | Njemačka | EV punjači |
| DEKRA | Njemačka | Automotive |
| UL | SAD | UL certifikacija |
| IDIADA | Španjolska | Interoperabilnost (ASSURED) |
| KEMA Labs | Nizozemska | Grid connection |

**Prednosti**:
- Akreditirani rezultati
- Stručnost
- Formalna certifikacija

**Nedostaci**:
- Vrijeme čekanja (tjedni do mjeseci)
- Visoki troškovi po testu
- Manja fleksibilnost

---

### Opcija 8C: HIL (Hardware-in-the-Loop) simulacija

```
┌─────────────────────────────────────────────────┐
│                 HIL Simulator                   │
│  ┌─────────────┐        ┌─────────────┐        │
│  │   Battery   │        │   Vehicle   │        │
│  │    Model    │        │    Model    │        │
│  └──────┬──────┘        └──────┬──────┘        │
│         │                      │               │
│         ▼                      ▼               │
│  ┌─────────────────────────────────────┐       │
│  │        Real-time I/O               │       │
│  └─────────────────┬───────────────────┘       │
│                    │                           │
└────────────────────┼───────────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Charger Under   │
            │     Test        │
            └─────────────────┘
```

| Dobavljač | Platforma |
|-----------|-----------|
| dSPACE | SCALEXIO |
| NI | PXI-based |
| OPAL-RT | OP5700 |
| Typhoon HIL | HIL604 |

**Prednosti**:
- Testiranje rubnih slučajeva bez rizika
- Ponovljivost
- Automatizacija testova
- Ranija validacija softvera

**Nedostaci**:
- Visok trošak platforme (€100,000+)
- Potrebna ekspertiza za modele
- Ne zamjenjuje real-world testiranje

---

### Opcija 8D: Testiranje na vozilima

| Pristup | Opis |
|---------|------|
| Vlastito vozilo | Kupovina testnog e-busa |
| Partnerstvo s OEM | Pristup testnim vozilima |
| Fleet operator | Testiranje na operativnoj floti |
| Testni centar | IDIADA, Millbrook, itd. |

**Preporuka**: Kombinacija HIL za rani razvoj + realna vozila za validaciju + eksterni lab za certifikaciju.

---

## 9. Certifikacija i usklađenost

### Europsko tržište

| Standard | Područje | Obaveznost |
|----------|----------|------------|
| IEC 61851-1 | Opći zahtjevi | Obavezno |
| IEC 61851-23 | DC punjenje | Obavezno |
| EN 50696 | Pantograph | Za pantograph |
| IEC 62196-3 | CCS konektor | Obavezno za CCS |
| EN 61000-6-2/4 | EMC | Obavezno |
| IEC 61439 | Sklopni ormari | Obavezno |
| Low Voltage Directive | CE oznaka | Obavezno |
| EMC Directive | CE oznaka | Obavezno |

**Certifikacijska tijela**: TÜV SÜD, TÜV Rheinland, DEKRA, Bureau Veritas

---

### Sjevernoameričko tržište

| Standard | Područje |
|----------|----------|
| UL 2202 | DC punjenje |
| UL 2594 | AC punjenje |
| UL 2231-1/2 | Personnel protection |
| UL 9741 | Bidirekcijski (V2G) |
| SAE J1772 | Konektori |
| SAE J3105 | Pantograph |
| NEC Article 625 | Instalacija |

**Certifikacijska tijela**: UL, CSA, Intertek (ETL)

---

### Procjena vremena i troškova certifikacije

| Tip certifikacije | Vrijeme | Trošak |
|-------------------|---------|--------|
| CE (Europa) | 3-6 mjeseci | €30,000-80,000 |
| UL (Sjeverna Amerika) | 4-8 mjeseci | €50,000-120,000 |
| Interoperabilnost | 2-4 mjeseca | €20,000-50,000 |
| **Ukupno (globalno)** | 6-12 mjeseci | €100,000-250,000 |

---

## 10. Proizvodne strategije

### Opcija 10A: Vlastita proizvodnja

| Aspekt | Razmatranje |
|--------|-------------|
| Investicija | €500,000 - 2,000,000 (oprema, prostor) |
| Vrijeme postavljanja | 6-12 mjeseci |
| Minimalni volumen | 50-100 jedinica/godišnje za isplativost |
| Kontrola kvalitete | Potpuna |

**Preporučeno za**: Dugoročna strategija, visoke marže, specifični zahtjevi kvalitete.

---

### Opcija 10B: Contract Manufacturing (CM/EMS)

| EMS Partner | Lokacija | Specijalizacija |
|-------------|----------|-----------------|
| Jabil | Globalno | Power electronics |
| Flex | Globalno | Industrial |
| Sanmina | SAD/Europa | High-reliability |
| Zollner | Njemačka | Automotive |
| Katek | Njemačka | EV charging |

**Prednosti**:
- Niska inicijalna investicija
- Skalabilnost
- Pristup supply chain-u
- Fokus na core competencies

**Nedostaci**:
- Niže marže
- Manja kontrola
- IP rizici
- MOQ (minimum order quantity)

**Preporučeno za**: Brzi ramp-up, varijabilna potražnja, fokus na R&D.

---

### Opcija 10C: Hibridna proizvodnja

```
Vlastita proizvodnja:          Contract manufacturing:
├─ Finalna montaža             ├─ PCB assembly (PCBA)
├─ Testiranje                  ├─ Kablaža
├─ Konfiguracija               ├─ Mehanički dijelovi
├─ Kvaliteta (QC)              └─ Podmontaže
└─ Personalizacija
```

**Preporučeno za**: Balans kontrole i fleksibilnosti, srednji volumeni.

---

## 11. Matrica odlučivanja

### Scoring model za odabir opcija

Za svaki set opcija, ocijenite prema vašim prioritetima (1-5):

| Kriterij | Težina | Opcija A | Opcija B | Opcija C |
|----------|--------|----------|----------|----------|
| Vrijeme do tržišta | ___ | | | |
| Inicijalni trošak | ___ | | | |
| Dugoročni trošak | ___ | | | |
| Kontrola IP-a | ___ | | | |
| Rizik | ___ | | | |
| Skalabilnost | ___ | | | |
| Diferencijacija | ___ | | | |
| **Ukupno** | | | | |

---

### Preporučene kombinacije po scenariju

#### Scenarij A: Brzi ulazak na tržište, ograničeni resursi

| Domena | Preporuka |
|--------|-----------|
| Pristup | White-label / ODM partnerstvo (1C) |
| Topologija | N/A (gotov proizvod) |
| Softver | Integracija postojećeg OCPP backenda |
| Vrijeme | 3-6 mjeseci |
| Investicija | €200,000-500,000 |

---

#### Scenarij B: Srednji put - balans brzine i kontrole

| Domena | Preporuka |
|--------|-----------|
| Pristup | Hibridni (1D) - gotovi moduli + vlastiti softver |
| AC/DC | Vienna Rectifier (2A) ili gotov PFC modul |
| DC/DC | LLC (2D) za unidirekcijski, DAB (2E) za V2G |
| Poluvodiči | SiC MOSFET (3B) |
| Hlađenje | Tekuće za >100 kW (4B) |
| Komunikacija | ISO 15118-2 stack (kupljen) + vlastiti OCPP |
| Konektori | CCS2 (6A) |
| Kontrola | Hibridni (7C) |
| Testiranje | Interno + eksterni lab za certifikaciju |
| Vrijeme | 12-18 mjeseci |
| Investicija | €1,000,000-2,500,000 |

---

#### Scenarij C: Potpuna vertikalna integracija, dugoročna strategija

| Domena | Preporuka |
|--------|-----------|
| Pristup | In-house razvoj (1A) |
| AC/DC | AFE za V2G podršku (2B) |
| DC/DC | DAB (2E) |
| Poluvodiči | SiC MOSFET (3B), GaN za manje snage |
| Hlađenje | Tekuće + tekuće hlađeni kablovi (4B + 4C) |
| Komunikacija | Vlastiti ISO 15118-20 stack |
| Konektori | CCS2 + priprema za MCS |
| Kontrola | Vlastiti embedded (7A) |
| Testiranje | Puni HIL + interno + certifikacija |
| Proizvodnja | Hibridna (10C) |
| Vrijeme | 24-36 mjeseci |
| Investicija | €3,000,000-7,000,000 |

---

## 12. Sljedeći koraci

Za odabir optimalnog puta, potrebno je definirati:

1. **Ciljno tržište** - Europa, Srbija/regija, globalno?
2. **Ciljne snage** - Depot (50-150 kW), Opportunity (300-600 kW), MCS?
3. **V2G zahtjev** - Da/Ne?
4. **Vremenski okvir** - Kada treba prvi proizvod?
5. **Budžet** - Dostupna investicija za razvoj?
6. **Postojeće kompetencije** - Energetska elektronika, embedded, softver?
7. **Dugoročna vizija** - Vlastiti proizvod ili integratorska uloga?

---

## Reference

- IEC 61851 serija - EV charging standards
- ISO 15118 serija - V2G communication
- SAE J3271 - MCS standard
- IEEE 519-2022 - Harmonic limits
- UL 2202/2594 - Safety standards
- EN 50696 - Pantograph charging
