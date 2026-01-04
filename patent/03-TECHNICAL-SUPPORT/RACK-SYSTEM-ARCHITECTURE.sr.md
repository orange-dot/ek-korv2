# Arhitektura Rack Sistema

> **Napomena:** Ovo je verzija za patentnu prijavu. Za živu dokumentaciju, pogledajte [`tehnika/16-custom-rack-system.sr.md`](../../tehnika/16-custom-rack-system.sr.md).

**Verzija dokumenta:** 1.0
**Datum:** 2026-01-04
**Autor:** Bojan Janjatović
**Email:** bojan.janjatovic@gmail.com
**Adresa:** Vojislava Ilića 8, Kikinda, Severni Banat, Srbija

---

## 1. Pregled Sistema

### 1.1 Filozofija Dizajna

```
PASIVNI BACKPLANE - "HARDVERSKI MIKROKERNEL"
═══════════════════════════════════════════════════════════════

Inspirisano arhitekturom mikrokernel operativnih sistema:

┌─────────────────────────────────────────────────────────────┐
│                    PRINCIP DIZAJNA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  U mikrokernel OS-u:                                        │
│  • Kernel radi MINIMUM (IPC, raspoređivanje, memorija)      │
│  • Servisi rade u korisničkom prostoru                      │
│  • Kvar servisa ne ruši kernel                              │
│                                                              │
│  U našem rack sistemu:                                      │
│  • Backplane radi MINIMUM (rutiranje napajanja, CAN)        │
│  • Inteligencija je u modulima                              │
│  • Kvar modula ne utiče na backplane                        │
│  • Nema jedinstvene tačke kvara                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

BACKPLANE OBEZBEĐUJE SAMO:
• Distribuciju DC naponske sabirnice
• Rutiranje dvostrukog CAN-FD bus-a (redundantno)
• Ravan mase
• Fizičku strukturu slotova

BACKPLANE NE SADRŽI:
• Aktivnu logiku (bez MCU, bez FPGA)
• Nikakvu inteligenciju
• Nikakvu konfiguraciju
• Nijednu jedinstvenu tačku kvara
```

### 1.2 Ključne Specifikacije

```
SPECIFIKACIJE RACK SISTEMA
═══════════════════════════════════════════════════════════════

OBLIK:
• Standardna 19" širina rack-a
• Visina: 42U dostupno, 36U za module
• Dubina: 800mm (standardni serverski rack)

KAPACITET:
• Slotovi: 84 modula (14 redova × 6 kolona po redu)
• Snaga po modulu: 3.3 kW
• Ukupna snaga rack-a: 277 kW (84 × 3.3 kW)

FIZIČKI:
• Težina praznog: ~150 kg
• Težina punog: ~450 kg (84 × 3.5 kg + struktura)
• Hlađenje: Prisilni vazduh napred-nazad

ELEKTRIČNI:
• DC bus napon: 650-900V DC (800V nominalno)
• DC bus struja: do 400A po sabirnici
• CAN-FD: Dvostruki bus, 5 Mbps brzina podataka
```

### 1.3 Koncepti Inspirisani 3PAR-om

```
KONCEPTI SKLADIŠTENJA PRIMENJENI NA ENERGETSKU ELEKTRONIKU
═══════════════════════════════════════════════════════════════

3PAR KONCEPT          │ EK3 IMPLEMENTACIJA
══════════════════════╪══════════════════════════════════════════
Wide Striping         │ Svih 84 modula deli opterećenje jednako
                      │ Nema "primarnih" ili "sekundarnih" modula
                      │ Balansiranje droop kontrolom
──────────────────────┼──────────────────────────────────────────
Distributed Sparing   │ Nema namenskih rezervnih modula
                      │ Svaki modul radi na ~95% kapaciteta
                      │ 5% rezerve = distribuirana rezerva
                      │ Bilo koji kvar: preostali moduli apsorbuju
──────────────────────┼──────────────────────────────────────────
Thin Provisioning     │ Moduli koji nisu potrebni za trenutno opt.
                      │ ulaze u standby male snage
                      │ Buđenje na zahtev (<100ms)
──────────────────────┼──────────────────────────────────────────
Chunklet Architecture │ 3kW "chunk-ovi" snage
                      │ Granularno skaliranje i zamena
                      │ Jedan kvar = 1.2% gubitak kapaciteta
──────────────────────┼──────────────────────────────────────────
No Single Point       │ Pasivni backplane (bez aktivnih komp.)
of Failure            │ Dvostruki CAN bus
                      │ Bilo koji modul može biti master (Raft)
```

---

## 2. Mehanički Dizajn

### 2.1 Struktura Rack-a

```
RASPORED RACK-A (PREDNJI POGLED)
═══════════════════════════════════════════════════════════════

                    ◀──────── 482.6mm (19") ────────▶

     ┌──────────────────────────────────────────────────┐  ▲
U42  │  ░░░░░░░░░░ UPRAVLJANJE KABLOVIMA ░░░░░░░░░░░░  │  │
U41  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U40  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  │
U39  │  │ 79 │ │ 80 │ │ 81 │ │ 82 │ │ 83 │ │ 84 │    │  │
     │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    │  │
     ├──────────────────────────────────────────────────┤  │
     │              ...  (još 12 redova)  ...          │  │
     ├──────────────────────────────────────────────────┤  │
U7   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐    │  │
U6   │  │  1 │ │  2 │ │  3 │ │  4 │ │  5 │ │  6 │    │ 42U
     │  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘    │  │
     ├──────────────────────────────────────────────────┤  │
U5   │  ░░░░░░░░░░░ VENTILATORSKI MODUL 1 ░░░░░░░░░░  │  │
U4   │  ░░░░░░░░░░░ VENTILATORSKI MODUL 2 (N+1) ░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U3   │  ░░░░░░░░░ BACKPLANE KONTROLER ░░░░░░░░░░░░░░  │  │
     ├──────────────────────────────────────────────────┤  │
U2   │  ░░░░░░░░░ DISTRIBUCIJA DC BUS-A ░░░░░░░░░░░░  │  │
U1   │  ░░░░░░░░░ ULAZNA ZAŠTITA ░░░░░░░░░░░░░░░░░░░  │  │
     └──────────────────────────────────────────────────┘  ▼


DIMENZIJE SLOTA:
• Širina: 76mm (6 po 19" redu sa razmakom)
• Visina: 88mm (2U po redu modula)
• Dubina: 320mm (modul) + 50mm (zazor konektora)
```

### 2.2 Dizajn Protoka Vazduha

```
UPRAVLJANJE TOPLOTOM - PROTOK VAZDUHA
═══════════════════════════════════════════════════════════════

BOČNI POGLED:
                                            IZDUVAVANJE
                                               ▲
    ┌──────────────────────────────────────────┤
    │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
    │  │ MOD │ │ MOD │ │ MOD │ │ MOD │  ...  │
    │  │  1  │ │  2  │ │  3  │ │  4  │       │
    │  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘       │
    │     ▲      ▲      ▲      ▲             │
    │  ═══╧══════╧══════╧══════╧═════════════│
    │              ZAJEDNIČKI PLENUM          │
    │  ═══════════════════════════════════════│
    │     ▲      ▲      ▲      ▲             │
    │  ┌──┴──┐┌──┴──┐┌──┴──┐┌──┴──┐         │
    │  │VENT ││VENT ││VENT ││VENT │  (N+1)  │
    │  └─────┘└─────┘└─────┘└─────┘         │
    │                 ▲                       │
    └─────────────────┤───────────────────────┘
                   USISAVANJE
                 (filtrirano)

SPECIFIKACIJE HLAĐENJA:
• Ukupan protok vazduha: 2000 CFM
• Ventilatorski moduli: 2× (N+1 redundancija)
• Svaki ventilatorski modul: 4× 120mm ventilatora
• Statički pritisak: 0.5" H2O
• Filter: G4 klasa, zamenljiv
```

---

## 3. Arhitektura Backplane-a

### 3.1 Minimalni Dizajn Backplane-a

```
BACKPLANE - "HARDVERSKI MIKROKERNEL"
═══════════════════════════════════════════════════════════════

Backplane NE SADRŽI aktivne komponente.
Čisto pasivno rutiranje:

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   ŠTA BACKPLANE RADI:                                       │
│   ═══════════════════                                       │
│   • Rutira DC bus do svakog slota (bakrene sabirnice)       │
│   • Rutira CAN-A bus do svakog slota (upredeni par)         │
│   • Rutira CAN-B bus do svakog slota (upredeni par)         │
│   • Obezbeđuje referentnu masu                              │
│   • Obezbeđuje mehaničku strukturu slotova                  │
│                                                              │
│   ŠTA BACKPLANE NE RADI:                                    │
│   ════════════════════                                      │
│   • Bez mikrokontrolera                                     │
│   • Bez ikakve logike                                       │
│   • Bez konverzije snage                                    │
│   • Bez kontrolnih funkcija                                 │
│   • Bez skladištenja konfiguracije                          │
│                                                              │
│   ZAŠTO:                                                     │
│   ═════                                                      │
│   • Pasivno = nema režima kvara                             │
│   • Pasivno = nema firmware-a za ažuriranje                 │
│   • Pasivno = nema bezbednosnih ranjivosti                  │
│   • Pasivno = životni vek 20+ godina                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Distribucija Napajanja

```
DISTRIBUCIJA DC BUS-A
═══════════════════════════════════════════════════════════════

ULAZ (sa eksternog AC/DC):
• Napon: 800V DC nominalno (opseg: 650-900V)
• Struja: do 400A kontinualno

KONSTRUKCIJA SABIRNICA:
• Materijal: Bakar, presek 10mm × 50mm
• Gustina struje: <3 A/mm² (konzervativno)
• Pad napona: <1V pri punom opterećenju
• Izolacija: Kapton traka + vazdušni razmak

TOPOLOGIJA DISTRIBUCIJE:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   DC+  ═══╤═══╤═══╤═══╤═══╤═══╤═══════════════════════     │
│           │   │   │   │   │   │                             │
│         ┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐┌─┴─┐                     │
│         │ 1 ││ 2 ││ 3 ││ 4 ││ 5 ││ 6 │  RED 1              │
│         └─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘└─┬─┘                     │
│           │   │   │   │   │   │                             │
│   DC-  ═══╧═══╧═══╧═══╧═══╧═══╧═══════════════════════     │
│                                                              │
│   (Ponovljeno za svih 14 redova)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

ZAŠTITA PO SLOTU:
• PTC osigurač (resetabilni): 15A po slotu
• Dozvoljava modulu da vuče do 12A kontinualno
• Aktivira se pri prekostruji, automatski se resetuje
```

---

## 4. Opcioni Rack Kontroler

### 4.1 Uloga Kontrolera

```
RACK KONTROLER - OPCIONI "INIT PROCES"
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                      VAŽNO                                   │
│                                                              │
│   Rack Kontroler je OPCION.                                 │
│   Moduli rade AUTONOMNO bez njega.                          │
│   On pruža pogodnosti, ne osnovnu funkciju.                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

ŠTA OBEZBEĐUJE:
• Inventar slotova (koji slotovi su popunjeni)
• Agregiranu temperaturu
• Kontrolu brzine ventilatora
• Senzor otvaranja/zatvaranja vrata
• Vezu ka Station Kontroleru (Ethernet)

ŠTA NE RADI:
• Ne kontroliše izlaznu snagu modula
• Ne učestvuje u balansiranju opterećenja
• Ne skladišti konfiguraciju modula
• Nije potreban za operacije punjenja
```

---

## 5. Arhitektura Napajanja

### 5.1 Wide Striping Implementacija

```
DISTRIBUCIJA OPTEREĆENJA - WIDE STRIPING
═══════════════════════════════════════════════════════════════

SVI MODULI DELE OPTEREĆENJE JEDNAKO:
• Nema "master" modula
• Nema "primarne" putanje
• Svaki modul daje I_ukupno / N_aktivni

IMPLEMENTACIJA PUTEM DROOP KONTROLE:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   V_izlaz = V_ref - (R_droop × I_izlaz)                     │
│                                                              │
│   Gde je:                                                    │
│   • V_ref = 400V (primer izlazne tačke)                     │
│   • R_droop = 0.01Ω (virtuelna droop otpornost)             │
│   • I_izlaz = izlazna struja modula                         │
│                                                              │
│   Efekat: Veća struja → malo niži napon                     │
│           Samo-balansiranje između paralelnih modula        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PRIMER (84 modula, 280kW opterećenje):
• Ukupna struja: 280kW / 400V = 700A
• Po modulu: 700A / 84 = 8.33A
• Droop: 8.33A × 0.01Ω = 0.083V
• V_izlaz stvarni: 400V - 0.083V = 399.917V
• Svi moduli na suštinski istom naponu, istoj struji

PREDNOSTI:
• Nije potreban centralni koordinator za balansiranje
• Automatsko rebalansiranje kada modul otkaže
• Dokazana tehnika iz paralelnih UPS sistema
```

### 5.2 Distribuirana Rezerva

```
DISTRIBUIRANA REZERVA - BEZ NAMENSKIH REZERVI
═══════════════════════════════════════════════════════════════

TRADICIONALNI PRISTUP (N+1):
• 84 modula + 1 rezervni (neaktivan)
• Rezerva stoji neiskorišćena 99% vremena
• Rezerva može otkazati neotkriveno

NAŠ PRISTUP (DISTRIBUIRANO):
• Svih 84 modula aktivno
• Svaki radi na ~95% kapaciteta
• 5% rezerve distribuirano na sve

MATEMATIKA:
• Normalan rad: 84 × 3.15kW = 265kW dostupno
• Kvar modula: 83 × 3.3kW = 274kW dostupno
• Zapravo VIŠE kapaciteta sa jednim kvarom!

ZAŠTO FUNKCIONIŠE:
1. Moduli normalno rade malo derejtovano
2. Jedan kvar: Preostali moduli povećavaju izlaz
3. Dva kvara: Još uvek unutar kapaciteta
4. Termalno: Svi moduli dele toplotu ravnomerno

KAPACITET vs KVAROVI:
┌─────────────────────────────────────────────────────────────┐
│ KVAROVI │ AKTIVNI│ KAPACITET @ 95% │ KAPACITET @ 100%      │
├─────────┼────────┼─────────────────┼───────────────────────┤
│     0   │   84   │    263 kW       │     277 kW            │
│     1   │   83   │    260 kW       │     274 kW            │
│     2   │   82   │    257 kW       │     271 kW            │
│     5   │   79   │    248 kW       │     261 kW            │
│    10   │   74   │    232 kW       │     244 kW            │
└─────────────────────────────────────────────────────────────┘

Čak i sa 10 kvarova, rack i dalje isporučuje 232kW (89% originalnog).
```

---

## 6. Upravljanje Toplotom

### 6.1 Zone Hlađenja

```
ARHITEKTURA TERMALNIH ZONA
═══════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   ZONA C (VRH)                                              │
│   ════════════                                              │
│   Slotovi 65-84 (20 modula)                                 │
│   Najtoplija zona (toplota se diže)                         │
│   Cilj: <45°C ulaz                                          │
│                                                              │
│   ─────────────────────────────────────────────────────     │
│                                                              │
│   ZONA B (SREDINA)                                          │
│   ════════════════                                          │
│   Slotovi 29-64 (36 modula)                                 │
│   Umerena temperatura                                       │
│   Cilj: <40°C ulaz                                          │
│                                                              │
│   ─────────────────────────────────────────────────────     │
│                                                              │
│   ZONA A (DNO)                                              │
│   ═══════════════                                           │
│   Slotovi 1-28 (28 modula)                                  │
│   Najhladnija zona (najbliža usisavanju)                    │
│   Cilj: <35°C ulaz                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Termalna Migracija

```
TERMALNA MIGRACIJA - PONAŠANJE ROJA
═══════════════════════════════════════════════════════════════

Kada neki moduli rade toplije od drugih, roj
automatski redistribuira opterećenje:

MEHANIZAM:
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│   Svaki modul periodično emituje:                           │
│   • Trenutnu temperaturu                                    │
│   • Termalni prostor (T_max - T_trenutna)                   │
│   • Zahtevani derating (ako se približava limitu)           │
│                                                              │
│   Drugi moduli odgovaraju:                                   │
│   • Malo povećavaju svoj izlaz                              │
│   • Kompenzuju za deratiranog kolegu                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

PRIMER:
• Modul 72 (Zona C, vrh) dostiže 55°C
• Modul 72 traži 20% derating
• 83 druga modula svaki povećava za 0.24%
• Ukupan izlaz održan, termalno balansirano

Ovo se dešava automatski putem CAN broadcast-a.
Nije potreban centralni koordinator.
```

---

## 7. Rukovanje Kvarovima

### 7.1 Kvar Modula

```
SCENARIJI KVARA MODULA
═══════════════════════════════════════════════════════════════

SCENARIO 1: Modul Postaje Offline (Bez Odgovora)
────────────────────────────────────────────────
Detekcija:
• Nedostaje HEARTBEAT 3 uzastopna intervala (3 sek)
• Kolege označavaju modul kao OFFLINE
• Station Kontroler upozoren

Odgovor:
• Preostali moduli automatski apsorbuju opterećenje
• Nije potrebna centralna akcija
• Slot modula električno izolovan

Oporavak:
• Robot zamena zakazana
• Novi modul se automatski otkriva, pridružuje roju
• Opterećenje rebalansirano za sekunde

SCENARIO 2: Modul Ulazi u FAULT Stanje
─────────────────────────────────────
Detekcija:
• Modul emituje FAULT_ALERT na CAN
• Uključuje tip kvara (OCP, OVP, OTP, itd.)

Odgovor:
• Modul zaustavlja izlaz snage
• Modul ulazi u bezbedno stanje
• Kolege apsorbuju opterećenje
• Upozorenje prosleđeno Station Kontroleru
```

---

## 8. Interfejs Robota

### 8.1 Pristup Slotu

```
ZAHTEVI ZA PRISTUP ROBOTA
═══════════════════════════════════════════════════════════════

PREDNJI PRISTUP:
• Robot prilazi sa prednje strane rack-a
• Vrata se otvaraju automatski (ili ručno za bezbednost)
• Jasna linija pogleda do svih slotova

IDENTIFIKACIJA SLOTA:
• Svaki slot ima jedinstveni LED indikator
  - UGAŠEN: Prazan
  - ZELEN: Zdrav, radi
  - ŽUT: Degradiran, zakazan za zamenu
  - CRVEN: U kvaru, potrebna hitna zamena
  - PLAV (treperi): Cilj za trenutnu operaciju zamene

POMAGALA ZA POZICIONIRANJE:
• V-žljeb vođice za poravnanje na šinama slota
• ±2mm tolerancija za hvataljku robota
• Povratna informacija o sili tokom umetanja
• Električna potvrda: MOD_PRESENT signal
```

### 8.2 Bezbednosni Blokirajući Uslovi

```
SISTEM BEZBEDNOSTI ROBOTA
═══════════════════════════════════════════════════════════════

BLOKIRAJUĆI USLOVI:
┌─────────────────────────────────────────────────────────────┐
│ USLOV                    │ AKCIJA ROBOTA                    │
├──────────────────────────┼──────────────────────────────────┤
│ Vrata otvorena           │ Ne može započeti operaciju zamene│
│                          │ Robot pauzira ako se vrata otvore│
├──────────────────────────┼──────────────────────────────────┤
│ E-stop pritisnut         │ Robot se odmah zaustavlja        │
│                          │ Mora se ručno resetovati         │
├──────────────────────────┼──────────────────────────────────┤
│ Napajanje slota uključeno│ Ne može izvaditi modul           │
│                          │ Mora prvo zatražiti isključivanje│
├──────────────────────────┼──────────────────────────────────┤
│ Modul nije u STANDBY     │ Ne može izvaditi                 │
│                          │ Čeka bezbedno gašenje            │
└─────────────────────────────────────────────────────────────┘

BEZBEDNOSNE OCENE:
• Kategorija 3 / PLd prema ISO 13849 (minimum)
• Razmotriti Kategoriju 4 / PLe za rad bez nadzora
• Potrebna godišnja verifikacija bezbednosnog sistema
```

---

## 9. Instalacija i Puštanje u Rad

### 9.1 Zahtevi Lokacije

```
ZAHTEVI ZA INSTALACIJU
═══════════════════════════════════════════════════════════════

ELEKTRIČNI:
• 3-fazno 400V AC, 400A priključak (po rack-u)
• Uzemljenje prema lokalnom električnom propisu
• Obezbeđivanje kola za hitan stop

MEHANIČKI:
• Opterećenje poda: minimum 500 kg/m²
• Otisak rack-a: 600 × 800 mm
• Servisni prostor: 1.2m napred, 0.6m pozadi

USLOVI OKOLINE:
• Temperatura: 15-35°C (rad)
• Vlažnost: 20-80% RH, bez kondenzacije
• Nadmorska visina: <2000m (derating iznad)

HLAĐENJE:
• Ulazni vazduh: <35°C
• Odbacivanje toplote: 10-15 kW po rack-u (pri punom opt.)
```

---

## 10. Istorija Revizija

| Verzija | Datum      | Izmene                     |
|---------|------------|----------------------------|
| 1.0     | 2026-01-04 | Inicijalni dokument        |

---

## Reference

- 3PAR InServ Architecture Technical White Paper
- HPE 3PAR StoreServ Storage koncepti i dizajn
- Data Center Design Guide (APC/Schneider)
- ISO 13849-1: Bezbednost mašina - Delovi kontrolnih sistema vezani za bezbednost
- ASHRAE TC 9.9: Smernice za hlađenje data centara
- CAN in Automation: CAN-FD Specifikacija
