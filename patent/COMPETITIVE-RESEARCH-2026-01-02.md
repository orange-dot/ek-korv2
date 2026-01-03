# ISTRAŽIVANJE: Šta već postoji vs ELEKTROKOMBINACIJA inovacije

**Datum istraživanja:** 2026-01-02
**Autor:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Address:** Vojislava Ilica 8, Kikinda, Severni Banat, Serbia
**Svrha:** Prior art analiza za patentnu prijavu

---

## ✅ ŠTA VEĆ POSTOJI

### 1. Modularni EV punjači (ABB, BTC Power, SCU)
- **ABB Terra HP**: 30kW moduli, N+1 redundancija, hot-swap
- **BTC Power Gen4**: Modularna arhitektura, zamena ploča u 15 min
- **SCU Power**: SiC moduli, parallel redundancy

**Razlika od EK**: Njihovi moduli su 30kW (ABB), ne 3kW. Ako jedan otkaže = 10% gubitak snage, ne 0.3%.

**Izvori:**
- https://library.e.abb.com/public/49ff023197ba4be0a66ef56d733884ff/ABB_Terra-HP_UL_G2_Data-SheetR5.pdf
- https://btcpower.com/blog/tech-talk-modular-ev-chargers-offer-more-for-less-than-traditional-chargers/

---

### 2. "Self-healing" softver (Driivz, Ampeco)
- **Driivz AMS**: Popravlja 80% problema automatski - ALI samo SOFTVERSKI reset
- **Ampeco**: Remote reboot, firmware update

**Razlika od EK**: Oni resetuju softver. Mi FIZIČKI menjamo module.

**Izvori:**
- https://driivz.com/platform/operations-management/
- https://www.ampeco.com/ev-charging-platform/remote-management-and-maintenance/

---

### 3. Prediktivna dijagnostika AI
- **ChargerHelp**: Failure prediction
- **Intelliarts**: ML modeli za predikciju (XGBoost, LSTM)
- Tvrdnje: 2 nedelje unapred, 25% manje downtime

**Razlika od EK**: Oni predviđaju - ali ko popravlja? Čovek u kamionu. Mi: robot na licu mesta.

**Izvori:**
- https://chargenos.com/en/blog/technological-developments/ai-powered-fault-prediction-in-ev-charging-stations/
- https://intelliarts.com/success-stories/predictive-maintenance-for-ev-chargers/

---

### 4. Robotsko punjenje (Rocsys, Hyundai, Flexiv)
- **Rocsys**: Robot koji ubacuje konektor u auto
- **Hyundai ACR**: AI-based, radi na aerodromu
- **NaaS**: Mobilni robot koji vozi punjač do auta

**Razlika od EK**: Njihovi roboti PUNE auto. Naš robot POPRAVLJA punjač.

**Izvori:**
- https://www.rocsys.com/technology/
- https://www.popularmechanics.com/cars/hybrid-electric/a64856122/hyundai-ev-charging-robot/

---

### 5. Battery Swap (NIO, Ample)
- **NIO**: 2,432 swap stanice, 67M zamena, 144 sekundi
- **Ample**: Modularni battery swap za flote
- Potpuno automatizovano, robot menja CELU bateriju

**Razlika od EK**: Oni menjaju bateriju VOZILA. Mi menjamo module PUNJAČA.

**Izvori:**
- https://www.nio.com/news/nio-pss-4.0
- https://ample.com/

---

### 6. Multi-robot koordinacija
- **Relay charging**: Više MCR robota dele jedan task
- **Battery swap**: Koordinacija za isti zadatak

**Razlika od EK**: Njihovi roboti rade ISTI posao. Naš Robot A (dijagnostika) + Robot B (zamena) rade RAZLIČITE poslove u koordinaciji.

**Izvori:**
- https://roboticsandautomationnews.com/2025/03/27/opinion-how-co-ordinated-multi-robot-systems-are-transforming-ev-battery-swapping/89455/

---

### 7. Automated Bus Depot (CapMetro, Unikie)
- **CapMetro YARD**: SAE Level 4 autonomni bus, sam se parkira pod pantograf
- **Unikie Marshalling**: Autonomno parkiranje + Rocsys punjenje

**Razlika od EK**: Autobus se VOZI do punjača. Kod nas robot na autobusu RADI na punjenju.

**Izvori:**
- https://www.wsp.com/en-us/news/2025/capmetro-yard-demonstration
- https://www.unikie.com/solution/automated-bus-depot-marshalling/

---

## ❌ ŠTA NE POSTOJI (ELEKTROKOMBINACIJA INOVACIJE)

### 1. Robot montiran NA vozilu (ne samo na stanici)
**Niko nema robota NA autobusu/kamionu.**
- Svi roboti su station-based
- Robot A na vozilu je POTPUNO NOVA ideja

### 2. Koordinacija Robot A (vozilo) + Robot B (stanica)
**Niko nema dual-robot sistem gde jedan robot putuje SA vozilom.**
- Postoji multi-robot koordinacija, ali za ISTI task
- A+B koordinacija za različite zadatke = NOVO

### 3. 3PAR arhitektura za EV punjenje
**Niko ne primenjuje storage koncepte na EV charging:**
- Wide striping preko SVIH modula
- Distributed sparing (nema hot-spare)
- Thin provisioning za power

### 4. Fleet logistics za transport modula
**Niko ne koristi vozila flote za transport delova.**
- Svi: "truck roll" za popravku
- EK: Bus nosi modul u servis = zero truck rolls

### 5. Fizička zamena modula robotom (ne baterije)
- NIO menja CELE baterije (500kg+)
- EK menja 1.8kg module - mnogo jednostavnije

### 6. Granularna redundancija (0.3% gubitak po kvaru)
- ABB: 30kW modul = 10% gubitak ako otkaže
- EK: 3kW modul = 0.3% gubitak
- **30× bolja granularnost**

### 7. Self-healing = FIZIČKA zamena, ne samo software reset
- Driivz "self-healing" = reboot
- EK self-healing = robot fizički zameni modul

### 8. Cirkularna ekonomija za charging infrastrukturu
- Niko nema sistematski pristup repair/refurbish modulima punjača
- Sve je throw-away

---

## ZAKLJUČAK ZA PATENTABILNOST

| Aspekt | Postoji? | ELEKTROKOMBINACIJA razlika |
|--------|----------|---------------------------|
| Modularni punjači | Da | 10× manja granularnost (3kW vs 30kW) |
| Self-healing software | Da | Fizička zamena, ne samo reboot |
| AI predikcija | Da | + robot zamena, ne čovek |
| Charging roboti | Da | Oni pune auto, mi popravljamo punjač |
| Battery swap | Da | Mi menjamo module punjača, ne baterije |
| Robot NA vozilu | **NE** | **POTPUNO NOVO** |
| Dual-robot A+B | **NE** | **POTPUNO NOVO** |
| 3PAR za charging | **NE** | **POTPUNO NOVO** |
| Fleet logistics | **NE** | **POTPUNO NOVO** |

---

## NAJJAČI PATENTNI KANDIDATI

### Tier 1 - Potpuno novi koncepti (nema prior art)

1. **EK-2026-005: Coordinated Dual-Robot System**
   - Robot A na vozilu + Robot B na stanici
   - Wireless koordinacija
   - Self-healing infrastruktura
   - **NEMA NIŠTA SLIČNO**

2. **EK-2026-004: Fleet-Integrated Maintenance Logistics**
   - Vozila flote transportuju module
   - Zero truck rolls
   - Circular economy integration
   - **NEMA NIŠTA SLIČNO**

### Tier 2 - Novi pristup postojećim konceptima

3. **EK-2026-001: Unified Modular Power Architecture (3PAR-inspired)**
   - Wide striping + distributed sparing za EV charging
   - 3kW granularnost (vs 30kW industrija)
   - Blade-server form factor
   - **Prior art postoji za storage, ali NE za EV charging**

4. **EK-2026-002: Dual-Purpose Robotic Swap Station**
   - Robot menja module punjača (ne baterije auta)
   - Kombinacija sa battery swap
   - **Prior art postoji za battery swap, ali NE za charger module swap**

5. **EK-2026-003: Distributed Power Sparing System**
   - Nema dedicated hot-spare
   - Svi moduli aktivni, kapacitet se redistribuira
   - **Prior art postoji za storage (3PAR), ali NE za power electronics**

---

## PREPORUKA

1. **Prioritet 1**: Prijavi EK-2026-005 (Dual-Robot) što pre - ovo je najoriginalniji koncept
2. **Prioritet 2**: Prijavi EK-2026-004 (Fleet Logistics) - takođe potpuno novo
3. **Prioritet 3**: Kombinuj EK-2026-001, 002, 003 u jedan patent za "3PAR-inspired EV charging architecture"

---

## DODATNE NAPOMENE

### Potencijalni konkurenti za praćenje:
- **Rocsys** (NL) - robotic charging, mogu proširiti na maintenance
- **NIO** (CN) - battery swap, mogu proširiti na charger maintenance
- **ABB** (CH) - već imaju modularne punjače, mogu dodati robotiku
- **Driivz** (IL) - software self-healing, mogu partneriti sa robotics kompanijom

### Tržišna validacija:
- J.D. Power 2025: 71% FTCSR (first-time charge success rate)
- ChargerHelp 2025: 15pt pad pouzdanosti posle 3 godine
- Franklin Electric: $500-700 po truck roll
- **Problem je REALAN i industrija nema rešenje**

---

*Dokument generisan: 2026-01-02*
*Za internu upotrebu - priprema patentne dokumentacije*
