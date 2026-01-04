# Prijava Izuma: Dvonamenska Robotska Swap Stanica

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-002 |
| Datum Prijave | 2026-01-02 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 2026-01-02 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Inspiracija: Razgovor o depot sistemu za autobuse u Srbiji. Ideja o kombinovanju battery swap-a i module swap-a na istoj lokaciji, koristeći postojeću bus flotu kao logističku mrežu.

---

## 1. Naziv Izuma

**Integrisana Robotska Stanica za Istovremenu Zamenu Baterija Električnih Vozila i Zamenu Modula Infrastrukture za Punjenje**

Alternativni nazivi:
- Dvonamenska Swap Stanica za Flotu Vozila i Održavanje Punjača
- Kombinovani Sistem za Zamenu Baterija i Power Modula

---

## 2. Opis Problema

### Trenutno Stanje

```
BATTERY SWAP STANICE (NIO, Aulton, itd.):
• Robot menja bateriju vozila
• Infrastruktura za punjenje baterija je ODVOJENA
• Kada punjač ima problem = čeka se tehničar

ODRŽAVANJE PUNJAČA:
• Tehničar dolazi kamionetom ("truck roll")
• Prosečan trošak: €200-500 po pozivu
• Downtime: 2-14 dana
• Punjač ne radi dok se ne popravi

DVA ODVOJENA SISTEMA = DVA PUTA TROŠKOVI
```

### Problem

```
1. Swap stanice imaju robote koji 95% vremena stoje
2. Punjači u swap stanicama i dalje zahtevaju tehničare
3. Nema integracije između battery swap i charger maintenance
4. Transport rezervnih delova zahteva posebna vozila
```

---

## 3. Sažetak Izuma

```
JEDNA STANICA, DVA SWAPA:

┌─────────────────────────────────────────────────────────────┐
│                    SWAP STANICA                             │
│                                                             │
│   AUTOBUS DOLAZI                                            │
│        │                                                    │
│        ▼                                                    │
│   ┌─────────┐      ┌─────────────────┐                     │
│   │BATTERY  │      │  CHARGER RACK   │                     │
│   │  SWAP   │      │                 │                     │
│   │         │      │  ┌───┐ ┌───┐    │                     │
│   │  Robot  │─────►│  │EK3│ │EK3│... │◄── Isti robot!     │
│   │    1    │      │  └───┘ └───┘    │                     │
│   └─────────┘      └─────────────────┘                     │
│                                                             │
│   ISTOVREMENO:                                              │
│   • Robot menja bateriju autobusa (3 min)                  │
│   • Isti ili drugi robot menja EK3 module (40 sec)         │
│   • AI je predvideo koje module treba zameniti             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Ključni Elementi Inovacije

```
ELEMENT 1: Deljena Robotska Infrastruktura
─────────────────────────────────────────────────────────────
• Isti robot (ili isti tip robota) za oba swapa
• Različiti gripperi: battery gripper + module gripper
• Tool changer za brzu zamenu grippera
• Amortizacija robota preko oba use case-a

ELEMENT 2: Sinhronizovano Zakazivanje
─────────────────────────────────────────────────────────────
• AI detektuje degradaciju kroz kontinuirani monitoring:
  - Rana detekcija (trend analiza): dani/nedelje unapred
  - Tipična detekcija (anomalija tokom punjenja): sati unapred
  - Reaktivna (iznenadni kvar): minuti - ali distributed sparing
    održava punjenje dok robot ne zameni modul
• AI zna raspored dolazaka autobusa
• Swap modula se zakazuje za sledeći bus na toj ruti
• Zero dedicated maintenance visits - bilo koji bus može doneti deo

ELEMENT 3: Flota kao Logistička Mreža
─────────────────────────────────────────────────────────────
• Pokvareni modul ide u centralni servis SA AUTOBUSOM
• Popravljen modul se vraća SA AUTOBUSOM
• Nema potrebe za servisnim vozilima
• Postojeća ruta autobusa = besplatan transport

ELEMENT 4: Jedinstveni Kontrolni Sistem
─────────────────────────────────────────────────────────────
• Jedan sistem upravlja:
  - Battery swap operacijama
  - Charger module swap operacijama
  - Inventory management (baterije + moduli)
  - Predictive maintenance za sve
```

---

## 4. Detaljan Opis

### 4.1 Raspored Stanice

```
PLAN OSNOVE:
═══════════════════════════════════════════════════════════════

         ULAZ AUTOBUSA
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │              ZONA ZA POZICIONIRANJE BUSA       │     │
│    │                                                 │     │
│    │    ┌─────────────────────────────┐             │     │
│    │    │          AUTOBUS           │             │     │
│    │    │    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓      │             │     │
│    │    │    (baterija ispod)        │             │     │
│    │    └─────────────────────────────┘             │     │
│    │                  │                             │     │
│    └──────────────────┼─────────────────────────────┘     │
│                       │                                    │
│    ═══════════════════╪════════════════════  ŠINA ROBOTA  │
│                       │                                    │
│    ┌──────────────────┼──────────────────┐                │
│    │    ROBOT 1       │      ROBOT 2     │                │
│    │   (Baterija)     │     (Moduli)     │                │
│    └──────────────────┼──────────────────┘                │
│                       │                                    │
│    ┌──────────────────┴──────────────────┐                │
│    │                                      │                │
│    │   SKLADIŠTE      │    REGALI        │                │
│    │   BATERIJA       │    MODULA        │                │
│    │                  │                  │                │
│    │   ┌────┐ ┌────┐ │  ┌────┐ ┌────┐  │                │
│    │   │Puna│ │Puna│ │  │Regal│ │Regal│  │                │
│    │   │Bat │ │Bat │ │  │ 1  │ │ 2  │  │                │
│    │   └────┘ └────┘ │  └────┘ └────┘  │                │
│    │   ┌────┐ ┌────┐ │  ┌────┐ ┌────┐  │                │
│    │   │Praz│ │Praz│ │  │Regal│ │Regal│  │                │
│    │   │Bat │ │Bat │ │  │ 3  │ │ 4  │  │                │
│    │   └────┘ └────┘ │  └────┘ └────┘  │                │
│    │                  │                  │                │
│    └──────────────────┴──────────────────┘                │
│                                                             │
│    ┌─────────────────────────────────────────────────┐     │
│    │              ZONA SERVISA MODULA               │     │
│    │   ┌────────┐    ┌────────┐    ┌────────┐       │     │
│    │   │Neisprav│    │Novi    │    │Tranzit │       │     │
│    │   │Moduli  │    │Moduli  │    │(ka/iz  │       │     │
│    │   │(izlaz) │    │(ulaz)  │    │ depoa) │       │     │
│    │   └────────┘    └────────┘    └────────┘       │     │
│    └─────────────────────────────────────────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
         IZLAZ AUTOBUSA
```

### 4.2 Operativni Tok Rada

```
SCENARIO: Autobus GSP-347 dolazi u 14:30
═══════════════════════════════════════════════════════════════

PRE DOLASKA (AI zakazivanje):
─────────────────────────────────────────────────────────────
• AI zna da GSP-347 dolazi u 14:30 (iz fleet sistema)
• AI zna da Regal 2, Slot 15 ima modul za zamenu
• AI zna da nema hitnih battery swapova u 14:30
• AI odlučuje: "Uraditi module swap dok je bus na poziciji"

14:30 - AUTOBUS DOLAZI:
─────────────────────────────────────────────────────────────
T+0:00  Bus ulazi u stanicu
T+0:30  Pozicioniranje (automatsko, senzori)
T+1:00  Robot 1 započinje battery swap
        Robot 2 započinje module swap (paralelno!)

14:31-14:34 - PARALELNI SWAP:
─────────────────────────────────────────────────────────────
ROBOT 1 (Baterija):         ROBOT 2 (Moduli):
• Otkači praznu bateriju    • Pozicionira se kod Regala 2
• Izvuče bateriju           • Izvlači neispravan modul
• Stavi u skladište         • Stavlja u "neispravan" bin
• Uzme punu bateriju        • Uzima novi modul
• Insertuje u bus           • Insertuje u regal
• Zaključa                   • Verifikuje online status

T+3:30  Oba swapa završena

14:34 - AUTOBUS ODLAZI:
─────────────────────────────────────────────────────────────
T+4:00  Bus izlazi sa punom baterijom
        Charger rack je 100% operativan
        Neispravan modul čeka transport

KASNIJE - TRANSPORT:
─────────────────────────────────────────────────────────────
18:00   Bus GSP-112 ide u depot (redovna ruta)
        Robot stavlja neispravan modul u "tranzit" kutiju
        Kutija se montira u prtljažnik busa

19:30   GSP-112 stiže u depot
        Tehničar uzima kutiju sa neispravnim modulima
        Stavlja kutiju sa popravljenim modulima

SUTRA:
─────────────────────────────────────────────────────────────
06:00   GSP-112 kreće na prvu turu
        Prolazi kroz swap stanicu
        Robot uzima popravljene module iz kutije
        Stavlja nove neispravne module u kutiju
```

### 4.3 Robotski Sistem

```
OPCIJA A: Dva Specijalizovana Robota
═══════════════════════════════════════════════════════════════

ROBOT 1 - Battery Handler:
• Tip: Heavy payload (500+ kg)
• Primer: KUKA KR 500, Fanuc M-900
• Gripper: Custom battery gripper
• Posvećen zameni baterija

ROBOT 2 - Module Handler:
• Tip: Collaborative (10 kg payload)
• Primer: UR10e, KUKA LBR iiwa
• Gripper: Precision module gripper
• Posvećen EK3 modulima

PREDNOST: Paralelni rad, optimizovani gripperi
MANA: Viša cena (2 robota)


OPCIJA B: Jedan Robot sa Tool Changer-om
═══════════════════════════════════════════════════════════════

ROBOT: Medium payload (100 kg)
• Primer: KUKA KR 100, ABB IRB 4600

TOOL CHANGER:
• Schunk SWS ili slično
• Vreme zamene: 5 sekundi

GRIPPERI:
• Battery gripper (u tool dock-u)
• Module gripper (u tool dock-u)

TOK RADA:
1. Uzmi battery gripper
2. Zameni bateriju
3. Vrati battery gripper
4. Uzmi module gripper
5. Zameni module
6. Vrati module gripper

PREDNOST: Niža cena (1 robot)
MANA: Sekvencijalni rad, sporije
```

### 4.4 Integracija Logistike Flote

```
TRANSPORT MODULA PUTEM FLOTE AUTOBUSA:
═══════════════════════════════════════════════════════════════

TRANSPORTNA KUTIJA:
• Dimenzije: 600 × 400 × 300 mm
• Kapacitet: 10 EK3 modula
• ESD zaštita
• Shock absorbing foam
• RFID tag za praćenje
• Staje u standardni bus cargo bay

TOK RADA:

    SWAP STANICA               CENTRALNI DEPOT
    ────────────────          ────────────────
         │                          │
    ┌────┴────┐                ┌────┴────┐
    │Neispravni│    ═══BUS═══►  │Servisni │
    │ Moduli  │                │ Centar  │
    └─────────┘                └────┬────┘
                                    │
                               ┌────┴────┐
    ┌─────────┐    ◄═══BUS═══  │Popravljeni│
    │  Novi   │                │ Moduli   │
    │ Moduli  │                └─────────┘
    └────┬────┘
         │
    ┌────┴────┐
    │  Regal  │
    └─────────┘

PRORAČUN KAPACITETA:
• 1 bus može nositi 2 transportne kutije = 20 modula
• Prosečan depot: 50 autobusa
• Ako 10% prolazi kroz swap stanicu dnevno = 5 buseva
• Kapacitet transporta: 100 modula/dan
• Više nego dovoljno za potrebe održavanja
```

---

## 5. Prednosti u Odnosu na Prethodno Stanje Tehnike

```
PREDNOST 1: Deljena Infrastruktura
─────────────────────────────────────────────────────────────
Prethodno stanje tehnike: Odvojeni roboti za baterije i održavanje punjača
Ovaj izum: Ista robotska infrastruktura za oboje
Ušteda: 30-50% na robotskoj opremi

PREDNOST 2: Bez Servisnih Vozila
─────────────────────────────────────────────────────────────
Prethodno stanje tehnike: Servisno vozilo se šalje za svaki problem sa punjačem
Ovaj izum: Nisu potrebna posebna servisna vozila
Ušteda: €200-500 po intervenciji održavanja

PREDNOST 3: Proaktivno Održavanje
─────────────────────────────────────────────────────────────
Prethodno stanje tehnike: Reaktivno - popravka nakon kvara
Ovaj izum: Prediktivno - zamena pre kvara
Rezultat: Skoro nula vremena nerada punjača

PREDNOST 4: Flota kao Logistička Mreža
─────────────────────────────────────────────────────────────
Prethodno stanje tehnike: Posebna logistika za rezervne delove
Ovaj izum: Korišćenje postojećih ruta autobusa
Ušteda: 100% troškova logistike

PREDNOST 5: Sinergijsko Zakazivanje
─────────────────────────────────────────────────────────────
Prethodno stanje tehnike: Održavanje punjača se zakazuje nezavisno
Ovaj izum: Sinhronizovano sa posetama autobusa
Rezultat: Održavanje se dešava "besplatno" tokom normalnih operacija
```

---

## 6. Patentni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1 (Sistem):
Sistem za održavanje infrastrukture za punjenje električnih vozila
koji sadrži:
• Robotsku swap stanicu konfigurisanu za zamenu baterija
  električnih vozila;
• Mnoštvo modularnih power jedinica koje obezbeđuju snagu za punjenje;
• Robotski sistem konfigurisan da zameni pomenute modularne power
  jedinice bez prekidanja servisa vozila;
• Pri čemu robotski sistem za zamenu power jedinica deli
  infrastrukturu sa sistemom za zamenu baterija.

NEZAVISNI ZAHTEV 2 (Metod):
Metod za održavanje infrastrukture za punjenje koji sadrži:
• Predviđanje kvara power modula korišćenjem dijagnostičkih podataka;
• Zakazivanje zamene podudarno sa posetom vozila;
• Zamenu power modula dok vozilo prolazi kroz zamenu
  baterije;
• Transport zamenjenog modula do servisnog centra korišćenjem
  vozila flote.

ZAVISNI ZAHTEVI:
• ...pri čemu jedan robot vrši i zamenu baterija i zamenu modula
  korišćenjem zamenjivih end effectors
• ...pri čemu transport modula koristi zakazane rute vozila flote
  bez posebne logistike
• ...pri čemu je zakazivanje zamene sinhronizovano sa sistemom
  za upravljanje flotom
```

---

## 7. Status Razvoja

```
☑ Samo koncept (trenutno)
□ Izgrađen proof of concept
□ Prototip testiran
□ Pilot proizvodnja
□ Komercijalna proizvodnja
```

---

## 8. Potpisi

```
PRONALAZAČ(I):

Ime: _________________________
Potpis: ______________________
Datum: _______________________


SVEDOK:

Ime: _________________________
Potpis: ______________________
Datum: _______________________
```
