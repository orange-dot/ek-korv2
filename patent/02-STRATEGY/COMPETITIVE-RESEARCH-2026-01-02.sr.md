# ISTRAZIVANJE: Sta vec postoji vs ELEKTROKOMBINACIJA inovacije

**Datum istrazivanja:** 2026-01-02
**Autor:** Bojan Janjatovic
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia
**Svrha:** Analiza prethodne tehnike za patentnu prijavu

---

## STA VEC POSTOJI

### 1. Modularni EV punjaci (ABB, BTC Power, SCU)
- **ABB Terra HP**: 30kW moduli, N+1 redundancija, brza zamena
- **BTC Power Gen4**: Modularna arhitektura, zamena ploca u 15 min
- **SCU Power**: SiC moduli, paralelna redundancija

**Razlika od EK**: Njihovi moduli su 30kW (ABB), ne 3kW. Ako jedan otkaze = 10% gubitak snage, ne 0.3%.

**Izvori:**
- https://library.e.abb.com/public/49ff023197ba4be0a66ef56d733884ff/ABB_Terra-HP_UL_G2_Data-SheetR5.pdf
- https://btcpower.com/blog/tech-talk-modular-ev-chargers-offer-more-for-less-than-traditional-chargers/

---

### 2. "Samoisceljujuci" softver (Driivz, Ampeco)
- **Driivz AMS**: Popravlja 80% problema automatski - ALI samo SOFTVERSKI reset
- **Ampeco**: Daljinsko pokretanje, azuriranje firmware-a

**Razlika od EK**: Oni resetuju softver. Mi FIZICKI menjamo module.

**Izvori:**
- https://driivz.com/platform/operations-management/
- https://www.ampeco.com/ev-charging-platform/remote-management-and-maintenance/

---

### 3. Prediktivna dijagnostika vestackom inteligencijom
- **ChargerHelp**: Predikcija otkaza
- **Intelliarts**: ML modeli za predikciju (XGBoost, LSTM)
- Tvrdnje: 2 nedelje unapred, 25% manje zastoja

**Razlika od EK**: Oni predvidjaju - ali ko popravlja? Covek u kamionu. Mi: robot na licu mesta.

**Izvori:**
- https://chargenos.com/en/blog/technological-developments/ai-powered-fault-prediction-in-ev-charging-stations/
- https://intelliarts.com/success-stories/predictive-maintenance-for-ev-chargers/

---

### 4. Robotsko punjenje (Rocsys, Hyundai, Flexiv)
- **Rocsys**: Robot koji ubacuje konektor u auto
- **Hyundai ACR**: Baziran na vestackoj inteligenciji, radi na aerodromu
- **NaaS**: Mobilni robot koji vozi punjac do auta

**Razlika od EK**: Njihovi roboti PUNE auto. Nas robot POPRAVLJA punjac.

**Izvori:**
- https://www.rocsys.com/technology/
- https://www.popularmechanics.com/cars/hybrid-electric/a64856122/hyundai-ev-charging-robot/

---

### 5. Zamena baterija (NIO, Ample)
- **NIO**: 2,432 stanice za zamenu, 67M zamena, 144 sekundi
- **Ample**: Modularna zamena baterija za flote
- Potpuno automatizovano, robot menja CELU bateriju

**Razlika od EK**: Oni menjaju bateriju VOZILA. Mi menjamo module PUNJACA.

**Izvori:**
- https://www.nio.com/news/nio-pss-4.0
- https://ample.com/

---

### 6. Koordinacija vise robota
- **Rele punjenje**: Vise MCR robota dele jedan zadatak
- **Zamena baterija**: Koordinacija za isti zadatak

**Razlika od EK**: Njihovi roboti rade ISTI posao. Nas Robot A (dijagnostika) + Robot B (zamena) rade RAZLICITE poslove u koordinaciji.

**Izvori:**
- https://roboticsandautomationnews.com/2025/03/27/opinion-how-co-ordinated-multi-robot-systems-are-transforming-ev-battery-swapping/89455/

---

### 7. Automatizovani autobuski depo (CapMetro, Unikie)
- **CapMetro YARD**: SAE Level 4 autonomni autobus, sam se parkira pod pantograf
- **Unikie Marshalling**: Autonomno parkiranje + Rocsys punjenje

**Razlika od EK**: Autobus se VOZI do punjaca. Kod nas robot na autobusu RADI na punjenju.

**Izvori:**
- https://www.wsp.com/en-us/news/2025/capmetro-yard-demonstration
- https://www.unikie.com/solution/automated-bus-depot-marshalling/

---

## STA NE POSTOJI (ELEKTROKOMBINACIJA INOVACIJE)

### 1. Robot montiran NA vozilu (ne samo na stanici)
**Niko nema robota NA autobusu/kamionu.**
- Svi roboti su bazirani na stanici
- Robot A na vozilu je POTPUNO NOVA ideja

### 2. Koordinacija Robot A (vozilo) + Robot B (stanica)
**Niko nema sistem sa dva robota gde jedan robot putuje SA vozilom.**
- Postoji koordinacija vise robota, ali za ISTI zadatak
- A+B koordinacija za razlicite zadatke = NOVO

### 3. 3PAR arhitektura za EV punjenje
**Niko ne primenjuje koncepte skladistenja podataka na EV punjenje:**
- Siroka distribucija preko SVIH modula
- Distribuirana rezerva (nema vrucu rezervu)
- Dinamicka alokacija snage

### 4. Logistika flote za transport modula
**Niko ne koristi vozila flote za transport delova.**
- Svi: "izlazak servisera kamionom" za popravku
- EK: Autobus nosi modul u servis = nula izlazaka servisera

### 5. Fizicka zamena modula robotom (ne baterije)
- NIO menja CELE baterije (500kg+)
- EK menja 1.8kg module - mnogo jednostavnije

### 6. Granularna redundancija (0.3% gubitak po kvaru)
- ABB: 30kW modul = 10% gubitak ako otkaze
- EK: 3kW modul = 0.3% gubitak
- **30x bolja granularnost**

### 7. Samoisceljenje = FIZICKA zamena, ne samo softverski reset
- Driivz "samoisceljenje" = restart
- EK samoisceljenje = robot fizicki zameni modul

### 8. Cirkularna ekonomija za infrastrukturu punjenja
- Niko nema sistematski pristup popravci/obnovi modula punjaca
- Sve je za jednokratnu upotrebu

---

## ZAKLJUCAK ZA PATENTABILNOST

| Aspekt | Postoji? | ELEKTROKOMBINACIJA razlika |
|--------|----------|---------------------------|
| Modularni punjaci | Da | 10x manja granularnost (3kW vs 30kW) |
| Samoisceljujuci softver | Da | Fizicka zamena, ne samo restart |
| Predikcija vestackom inteligencijom | Da | + robotska zamena, ne covek |
| Roboti za punjenje | Da | Oni pune auto, mi popravljamo punjac |
| Zamena baterija | Da | Mi menjamo module punjaca, ne baterije |
| Robot NA vozilu | **NE** | **POTPUNO NOVO** |
| Sistem sa dva robota A+B | **NE** | **POTPUNO NOVO** |
| 3PAR za punjenje | **NE** | **POTPUNO NOVO** |
| Logistika flote | **NE** | **POTPUNO NOVO** |

---

## NAJJACI PATENTNI KANDIDATI

### Nivo 1 - Potpuno novi koncepti (nema prethodne tehnike)

1. **EK-2026-005: Koordinisan sistem sa dva robota**
   - Robot A na vozilu + Robot B na stanici
   - Bezicna koordinacija
   - Samoisceljujuca infrastruktura
   - **NEMA NISTA SLICNO**

2. **EK-2026-004: Logistika odrzavanja integrisana sa flotom**
   - Vozila flote transportuju module
   - Nula izlazaka servisera
   - Integracija cirkularne ekonomije
   - **NEMA NISTA SLICNO**

### Nivo 2 - Novi pristup postojecim konceptima

3. **EK-2026-001: Unifikovana modularna arhitektura snage (inspirisana 3PAR-om)**
   - Siroka distribucija + distribuirana rezerva za EV punjenje
   - 3kW granularnost (naspram 30kW u industriji)
   - Format server nozeva
   - **Prethodna tehnika postoji za skladistenje, ali NE za EV punjenje**

4. **EK-2026-002: Stanica za zamenu dvojne namene**
   - Robot menja module punjaca (ne baterije auta)
   - Kombinacija sa zamenom baterija
   - **Prethodna tehnika postoji za zamenu baterija, ali NE za zamenu modula punjaca**

5. **EK-2026-003: Sistem distribuirane rezerve snage**
   - Nema namenske vruce rezerve
   - Svi moduli aktivni, kapacitet se redistribuira
   - **Prethodna tehnika postoji za skladistenje (3PAR), ali NE za energetsku elektroniku**

---

## PREPORUKA

1. **Prioritet 1**: Prijavi EK-2026-005 (Sistem sa dva robota) sto pre - ovo je najoriginalniji koncept
2. **Prioritet 2**: Prijavi EK-2026-004 (Logistika flote) - takodje potpuno novo
3. **Prioritet 3**: Kombinuj EK-2026-001, 002, 003 u jedan patent za "arhitekturu EV punjenja inspirisanu 3PAR-om"

---

## DODATNE NAPOMENE

### Potencijalni konkurenti za pracenje:
- **Rocsys** (NL) - robotsko punjenje, mogu prosiriti na odrzavanje
- **NIO** (CN) - zamena baterija, mogu prosiriti na odrzavanje punjaca
- **ABB** (CH) - vec imaju modularne punjace, mogu dodati robotiku
- **Driivz** (IL) - softversko samoisceljenje, mogu partneriti sa kompanijom za robotiku

### Trzisna validacija:
- J.D. Power 2025: 71% FTCSR (stopa uspesnosti prvog punjenja)
- ChargerHelp 2025: 15 procenata pad pouzdanosti posle 3 godine
- Franklin Electric: $500-700 po izlasku servisera
- **Problem je REALAN i industrija nema resenje**

---

*Dokument generisan: 2026-01-02*
*Za internu upotrebu - priprema patentne dokumentacije*
