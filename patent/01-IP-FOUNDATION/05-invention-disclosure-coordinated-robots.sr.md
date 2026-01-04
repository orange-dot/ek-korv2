# Prijava Izuma: Sistem Koordinisanih Dvo-Robotskih za Održavanje

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Prijave | EK-2026-005 |
| Datum Prijave | 2026-01-02 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Nastanka Ideje | 2026-01-02 |
| Svedoci | Marija Janjatović |

### Poreklo Izuma
Proširenje swap station koncepta: umesto kupovine industrijskih robota (UR10e, KUKA), razvijamo SOPSTVENOG robota. Ključna inovacija: robot na autobusu + robot na stanici rade u koordinaciji. Self-healing infrastruktura.

---

## 1. Naziv Izuma

**Sistem Koordinisanih Robota za Autonomno Održavanje Infrastrukture za Punjenje Električnih Vozila**

Alternativni nazivi:
- Kooperativni Sistem Robotskog Održavanja Montiran na Vozilu i Baziran na Stanici
- Samoizlečiva Infrastruktura za Punjenje sa Distribuiranom Robotikom

---

## 2. Opis Problema

```
TRENUTNI PRISTUP:
═══════════════════════════════════════════════════════════════
• Industrijski roboti (UR, KUKA) su SKUPI: €30,000-100,000
• Robot je SAMO na stanici
• Ako autobus dođe i punjenje ne radi:
  → Čeka se tehničar
  → Ili čeka se da neko dođe da popravi
  → Downtime!

PROBLEM:
• Jedan robot na stanici = single point of failure
• Nema redundancije
• Autobus je "glup" - ne može ništa da uradi sam
```

---

## 3. Sažetak Izuma

```
DVA ROBOTA U KOORDINACIJI:
═══════════════════════════════════════════════════════════════

    AUTOBUS                         STANICA
    ┌─────────────────┐            ┌─────────────────┐
    │                 │            │                 │
    │  ┌───────────┐  │            │  ┌───────────┐  │
    │  │  ROBOT A  │  │◄──────────►│  │  ROBOT B  │  │
    │  │ (onboard) │  │  koordin.  │  │ (station) │  │
    │  └───────────┘  │            │  └───────────┘  │
    │                 │            │                 │
    │  ▪ Manji       │            │  ▪ Veći        │
    │  ▪ Battery     │            │  ▪ Module swap │
    │    konekcija   │            │  ▪ Teži poslovi│
    │  ▪ Laki       │            │                 │
    │    servisi     │            │                 │
    └─────────────────┘            └─────────────────┘

SCENARIJI:
─────────────────────────────────────────────────────────────

SCENARIO 1: Normalna zamena baterije
• Robot B (stanica) menja bateriju
• Robot A (autobus) asistira sa konektorima

SCENARIO 2: Reaktivna detekcija (punjenje ne radi)
• Autobus dođe, punjenje FAIL ili anomalija detektovana
• Robot A skenira problem
• Robot A + Robot B koordinirano popravljaju
• Distributed sparing održava punjenje ostalih slotova
• Ako roboti ne mogu → zakazuje se ljudski tehničar

SCENARIO 3: Proaktivno održavanje (rana detekcija)
• AI detektuje degradaciju kroz trend analizu (dani/nedelje)
• ILI: anomalija detektovana tokom punjenja prethodnog autobusa
• Sledeći autobus koji dođe ima Robot A koji donosi deo
• Robot B instalira - zero downtime

SCENARIO 4: Samo Robot A (bez stanice)
• Autobus parkiran u depou bez robota
• Robot A radi osnovne radove održavanja sam
```

---

## 4. Detaljan Opis

### 4.1 Robot A - Montiran na Vozilu (Robot na Autobusu)

```
SPECIFIKACIJE ROBOTA A:
═══════════════════════════════════════════════════════════════

LOKACIJA: Montiran na autobusu (donji deo, blizu baterije)

KARAKTERISTIKE:
• Mala masa: <15 kg
• Kompaktan: Staje u prostor ispod poda
• Nosivost: 5-10 kg
• Domet: 0.5-1m
• Napajanje: 48V iz sistema autobusa

MOGUĆNOSTI:
• Manipulacija konektorom (utikač za punjenje)
• Asistencija pri lakim zamena
• Vizuelna inspekcija (kamera)
• Senzorsko ispitivanje (dijagnostika)
• Nošenje malih delova (osigurači, konektori)

SKLADIŠTE NA AUTOBUSU:
• Mali inventar kutija sa rezervnim delovima:
  - Osigurači
  - Konektori
  - Mali moduli
  - Sredstva za čišćenje

KADA RADI SAM:
• Osnovna dijagnostika
• Čišćenje konektora
• Zamena osigurača
• Prijavljivanje problema
```

### 4.2 Robot B - Baziran na Stanici

```
SPECIFIKACIJE ROBOTA B:
═══════════════════════════════════════════════════════════════

LOKACIJA: Swap stanica, na linearnoj šini

KARAKTERISTIKE:
• Veća masa: 30-50 kg robot
• Nosivost: 50-100 kg (za baterije)
• Domet: 1.5-2m
• Napajanje: 400V AC

MOGUĆNOSTI:
• Zamena baterije (glavni posao)
• Zamena EK3 modula
• Održavanje teških radova
• Koordinacija sa Robotom A

SKLADIŠTE NA STANICI:
• Sveže baterije
• Sveži EK3 moduli
• Kontejneri za neispravne delove
• Skladište alata
```

### 4.3 Protokol Koordinacije

```
KOMUNIKACIJA:
═══════════════════════════════════════════════════════════════

BEŽIČNA VEZA:
• Autobus se približava → Stanica je svesna
• Robot A ←→ Robot B sinhronizacija u realnom vremenu
• Deljeni podaci senzora
• Koordinirano planiranje kretanja

SEKVENCA RUKOVANJA:
─────────────────────────────────────────────────────────────

1. AUTOBUS SE PRIBLIŽAVA (500m)
   Autobus → Stanica: "Stižem za 2 min, baterija 15%, potrebna zamena"
   Stanica → Autobus: "ACK, Robot B spreman, mesto 2 dostupno"

2. PRISTAJANJE AUTOBUSA
   Robot A: "Raspoređen, konektori dostupni"
   Robot B: "Krećem ka poziciji"

3. KOORDINISANA ZAMENA
   Robot B: "Hvatam bateriju"
   Robot A: "Otpuštam reze" (ako treba)
   Robot B: "Izvlačim..."
   Robot A: "Nadgledam slobodan prostor"

4. ZAVRŠETAK
   Robot A: "Nova baterija zaključana"
   Robot B: "Vraćam se na početnu poziciju"
   Autobus: "Odlazim"

SCENARIO GREŠKE:
─────────────────────────────────────────────────────────────

1. PUNJENJE NEUSPEŠNO
   Stanica: "Sesija punjenja neuspešna, greška 0x42"
   Robot A: "Raspoređujem se za inspekciju"
   Robot A: "Vizuelno: Detektovani ostaci na konektoru"
   Robot A: "Pokušavam čišćenje..."
   Robot A: "Ponovo pokrećem punjenje"
   Stanica: "Punjenje OK"

   // Problem rešen BEZ ljudske intervencije!
```

### 4.4 Scenariji Samoizlečenja

```
SCENARIO: Punjač ima neispravan modul
═══════════════════════════════════════════════════════════════

TRADICIONALNO:
1. Punjenje FAIL
2. Alarm na centrali
3. Dispečer šalje tehničara
4. Tehničar vozi 1h
5. Dijagnostika 30min
6. Popravka 1h
7. UKUPNO: 3-4 sata zastoja

SA KOORDINISANIM ROBOTIMA:
1. Punjenje FAIL
2. Robot A: Dijagnostika (30 sek)
3. Robot A → AI: "Modul 47 degradiran"
4. AI → Robot B: "Zameni modul 47"
5. Robot B: Zamena (60 sek)
6. Punjenje OK
7. UKUPNO: 2 minuta zastoja

═══════════════════════════════════════════════════════════════

SCENARIO: Autobus dolazi, Robot B je pokvaren
═══════════════════════════════════════════════════════════════

TRADICIONALNO:
• Nema zamene, autobus čeka ili ide dalje prazan

SA KOORDINISANIM ROBOTIMA:
• Robot A može uraditi OSNOVNE operacije sam:
  - Ručno punjenje (plug-in)
  - Dijagnostika Robota B
  - Čak i jednostavne popravke na Robotu B!

═══════════════════════════════════════════════════════════════

SCENARIO: Hitna popravka na terenu
═══════════════════════════════════════════════════════════════

• Autobus 1 ima problem sa punjačem na stanici X
• Autobus 2 prolazi kroz stanicu X (redovna ruta)
• Robot A na Autobusu 2 nosi rezervni deo
• Robot A (Autobus 2) + Robot B (stanica) popravljaju
• Autobus 1 nije ni znao da je bio problem!
```

---

## 5. Ključna Inovacija: Dizajn Sopstvenog Robota

```
ZAŠTO PRAVIMO SVOG ROBOTA?
═══════════════════════════════════════════════════════════════

INDUSTRIJSKI ROBOTI (UR, KUKA):
• Cena: €30,000-100,000
• Opšte namene = preterano za našu primenu
• Teški, veliki
• Ne mogu na vozilo

NAŠ PRISTUP:
• Namenski dizajniran za punjenje/zamenu EV
• Robot A: €2,000-5,000 (procena)
• Robot B: €10,000-20,000 (procena)
• Optimizovani za specifične zadatke
• Koordinacija ugrađena od početka

PATENTABILNOST:
─────────────────────────────────────────────────────────────
✓ Specifičan dizajn robota za punjenje
✓ Protokol koordinacije dva robota
✓ Koncept samoizlečive infrastrukture
✓ Robot montiran na vozilu za održavanje
```

---

## 6. Prednosti u Odnosu na Postojeća Rešenja

```
PREDNOST 1: Redundantnost
─────────────────────────────────────────────────────────────
Postojeća rešenja: Jedan robot na stanici = SPOF
Ovaj izum: Dva robota = redundantnost
Ako Robot B otkaže, Robot A može obavljati osnovne operacije

PREDNOST 2: Distribuirana Inteligencija
─────────────────────────────────────────────────────────────
Postojeća rešenja: Robot čeka na stanici
Ovaj izum: Robot DOLAZI sa vozilom
Svaki autobus = mobilna jedinica za održavanje

PREDNOST 3: Samoizlečenje
─────────────────────────────────────────────────────────────
Postojeća rešenja: Problem → zovi tehničara
Ovaj izum: Problem → roboti ga popravljaju
Većina problema rešena za <5 minuta

PREDNOST 4: Cena
─────────────────────────────────────────────────────────────
Postojeća rešenja: €50,000+ industrijski robot
Ovaj izum: €15,000-25,000 za OBA sopstvena robota
Namenski dizajniran = jeftinije i bolje

PREDNOST 5: Multiplikator Flote
─────────────────────────────────────────────────────────────
Postojeća rešenja: N stanica treba N robota
Ovaj izum: N autobusa ima N Robota A
Flota od 100 autobusa = 100 mobilnih robota za održavanje!
```

---

## 7. Patentni Zahtevi (Nacrt)

```
NEZAVISNI ZAHTEV 1 (Sistem):
Distribuirani robotski sistem za održavanje infrastrukture za
punjenje električnih vozila koji sadrži:
• Prvi robot montiran na električnom vozilu;
• Drugi robot pozicioniran na stanici za punjenje;
• Komunikacionu vezu koja omogućava koordinaciju između
  navedenih robota;
• Pri čemu navedeni roboti kooperativno obavljaju zadatke
  održavanja koje nijedan ne bi mogao samostalno da završi.

NEZAVISNI ZAHTEV 2 (Metoda):
Metoda za autonomno održavanje infrastrukture koja sadrži:
• Detekciju stanja greške na stanici za punjenje;
• Slanje dijagnostičkih podataka od robota montiranog na vozilu;
• Koordinaciju akcija popravke između robota montiranog na
  vozilu i robota baziranog na stanici;
• Završetak popravke bez ljudske intervencije.

NEZAVISNI ZAHTEV 3 (Vozilo):
Električno vozilo koje sadrži:
• Ugrađeni robotski manipulator;
• Odeljak za skladištenje rezervnih komponenti;
• Komunikacioni sistem za koordinaciju sa spoljnim
  infrastrukturnim robotima;
• Pri čemu navedeno vozilo funkcioniše kao mobilna jedinica
  za održavanje.

ZAVISNI ZAHTEVI:
• ...pri čemu robot montiran na vozilu teži manje od 20 kg
• ...pri čemu koordinacija koristi bežični protokol sa <10ms latencijom
• ...pri čemu vozilo nosi standardizovane rezervne komponente
• ...pri čemu se neispravne komponente transportuju do servisnih
  centara putem uobičajene rute vozila
```

---

## 8. Plan Razvoja

```
FAZA 1: Robot B (Stanica)
─────────────────────────────────────────────────────────────
• Sopstveni dizajn za EK3 zamenu
• Jeftiniji od industrijskog
• Dokazivanje koncepta

FAZA 2: Robot A (Vozilo) - Prototip
─────────────────────────────────────────────────────────────
• Kompaktan dizajn
• Osnovna manipulacija
• Komunikacioni protokol

FAZA 3: Koordinacija
─────────────────────────────────────────────────────────────
• A + B rade zajedno
• Scenariji samoizlečenja
• Granični slučajevi

FAZA 4: Raspoređivanje na Flotu
─────────────────────────────────────────────────────────────
• Robot A na svakom autobusu
• Mreža Robota B na stanicama
• Infrastruktura koja se sama održava
```

---

## 9. Potpisi

```
PRONALAZAČ(I):

Ime: Bojan Janjatović
Potpis: ____________________
Datum: 2026-01-02


SVEDOK:

Ime: Marija Janjatović
Potpis: ____________________
Datum: 2026-01-02
```
