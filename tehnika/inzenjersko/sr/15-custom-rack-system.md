# EK3 Custom Rack Sistem

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-016 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled Rack Sistema

### 1.1 Mikrokernel Filozofija Primenjena na Rack

EK3 rack sistem proširuje mikrokernel principe sa firmware-a na hardver:

```
┌─────────────────────────────────────────────────────────────────┐
│             Mapiranje Mikrokernela: OS na Rack                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    OS Mikrokernel                  EK3 Rack                      │
│    ──────────────                  ────────                      │
│                                                                  │
│    Minimalni kernel          →     Pasivni backplane             │
│    (samo raspoređivanje,           (samo snaga + CAN rutiranje,  │
│     IPC, hw pristup)               bez aktivne logike)           │
│                                                                  │
│    Korisnički procesi        →     EK3 moduli                    │
│    (izolovani,                     (autonomni, izolovani,        │
│     restartabilni)                  hot-swap zamenjivi)          │
│                                                                  │
│    Prosleđivanje poruka      →     CAN-FD bus                    │
│    (IPC)                           (komunikacija modula)         │
│                                                                  │
│    Bez centralnog kontrolera →     Rack kontroler nije obavezan  │
│    (distribuirano)                 (moduli se samo-koordiniraju) │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Ciljevi Dizajna

| Cilj | Specifikacija |
|------|---------------|
| Kapacitet | 84 EK3 modula po rack-u |
| Ukupna snaga | 277 kW (84 × 3.3 kW) |
| Redundancija | N-1 (83/84 = 98.8% sa jednim kvarom) |
| Hot-swap | Bilo koji modul bez gašenja rack-a |
| Robot pristup | Slotovi dostupni spreda |
| Jedinstvena tačka kvara | Nema |

### 1.3 Inspiracija 3PAR Arhitekturom

EK3 rack pozajmljuje koncepte od 3PAR storage nizova:

| 3PAR Koncept | EK3 Implementacija |
|--------------|-------------------|
| Wide striping | Svi moduli dele opterećenje ravnomerno |
| Bez dedicirane rezerve | Distribuirana rezerva (N+M) |
| Autonomni čvorovi | Moduli se samo-koordiniraju preko Raft-a |
| Pasivni backplane | Samo rutiranje, bez aktivne logike |
| Hot-swap | Zamena modula bez gašenja |

---

## 2. Mehanički Dizajn

### 2.1 Form Faktor

**Standardni 19" Rack:**

| Parametar | Vrednost |
|-----------|----------|
| Širina | 600 mm (23.6") |
| Dubina | 1000 mm (39.4") |
| Visina | 42U (1867 mm / 73.5") |
| Težina (prazan) | 120 kg |
| Težina (pun) | 450 kg max |

**Konfiguracija Slotova Modula:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rack Prednji Pogled (84 Slota)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  RED 14   │ 01 │ 02 │ 03 │ 04 │ 05 │ 06 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  RED 13   │ 07 │ 08 │ 09 │ 10 │ 11 │ 12 │    Modul     │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  RED 12   │ 13 │ 14 │ 15 │ 16 │ 17 │ 18 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  RED 11   │ 19 │ 20 │ 21 │ 22 │ 23 │ 24 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  RED 10   │ 25 │ 26 │ 27 │ 28 │ 29 │ 30 │    Modul     │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  RED 9    │ 31 │ 32 │ 33 │ 34 │ 35 │ 36 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  RED 8    │ 37 │ 38 │ 39 │ 40 │ 41 │ 42 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  RED 7    │ 43 │ 44 │ 45 │ 46 │ 47 │ 48 │    Modul     │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  RED 6    │ 49 │ 50 │ 51 │ 52 │ 53 │ 54 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  RED 5    │ 55 │ 56 │ 57 │ 58 │ 59 │ 60 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤    Fan       │  │
│    │  RED 4    │ 61 │ 62 │ 63 │ 64 │ 65 │ 66 │    Modul     │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤              │  │
│    │  RED 3    │ 67 │ 68 │ 69 │ 70 │ 71 │ 72 │              │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┼──────────────┤  │
│    │  RED 2    │ 73 │ 74 │ 75 │ 76 │ 77 │ 78 │    Fan       │  │
│    ├───────────┼────┼────┼────┼────┼────┼────┤    Modul     │  │
│    │  RED 1    │ 79 │ 80 │ 81 │ 82 │ 83 │ 84 │              │  │
│    └───────────┴────┴────┴────┴────┴────┴────┴──────────────┘  │
│                                                                  │
│    Svaki slot: 200 × 320 × 44 mm (Š × D × V)                    │
│    14 redova × 6 kolona = 84 slota za module                    │
│    5 fan modula (integrisani na granicama redova)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Dimenzije Slota

| Parametar | Vrednost |
|-----------|----------|
| Širina slota | 200 mm |
| Dubina slota | 320 mm |
| Visina slota | 44 mm (1U) |
| Dužina vodeće šine | 300 mm |
| Pozicija konektora | Zadnja (blind-mate) |

### 2.3 Dizajn Protoka Vazduha

**Hlađenje Spreda-Nazad:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Putanja Protoka Vazduha (Bočni Pogled)        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│           PREDNJA STRANA                      ZADNJA STRANA     │
│             │                                  │                 │
│             ▼                                  ▼                 │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │    ══════════════════════════════════════════►     │       │
│    │    Ulaz         Zona Modula        Fan Modul       │       │
│    │    Rešetka      (84 modula)        (izduvni)       │       │
│    │                                                    │       │
│    │    Hladan       Generisana         Topao vazduh    │       │
│    │    vazduh       toplota            izlazi          │       │
│    │    (25°C)       (+30°C porast)     (55°C)          │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Protok vazduha: 2000 CFM ukupno (po rack-u)                  │
│    Pritisak: 0.3" H2O statički                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Robot Pristup

**Dizajn Prednjih Vrata:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Dizajn Robot Pristupa                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Operacija Vrata:                                              │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │    ╔═══════════════════════════════════════════╗   │       │
│    │    ║                                           ║   │       │
│    │    ║   Vrata za brzo otpuštanje                ║   │       │
│    │    ║   • Magnetna brava (bez ručice)           ║   │       │
│    │    ║   • Otvara se do 180° (ravno uz stranu)   ║   │       │
│    │    ║   • Interlock: snaga ka slotovima         ║   │       │
│    │    ║     onemogućena kada su vrata otvorena    ║   │       │
│    │    ║                                           ║   │       │
│    │    ╚═══════════════════════════════════════════╝   │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Pristup Slotu:                                                │
│    ┌────────────────────────────────────────────────────┐       │
│    │                                                    │       │
│    │         ┌─────────┐                               │       │
│    │         │ Modul   │◄─── Vodeće šine              │       │
│    │         │         │     (samo-poravnanje)        │       │
│    │         └────┬────┘                               │       │
│    │              │                                    │       │
│    │              ▼                                    │       │
│    │         Mehanizam poluge                          │       │
│    │         (kompatibilan sa robotskom hvataljicom)   │       │
│    │                                                    │       │
│    └────────────────────────────────────────────────────┘       │
│                                                                  │
│    Zahtevi za Robot:                                             │
│    • Sila hvataljke: 50-100 N                                   │
│    • Tačnost pozicioniranja: ±5 mm                              │
│    • Mogućnost rotacije: operacija poluge                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Arhitektura Backplane-a (Hardverski Mikrokernel)

### 3.1 Princip Minimalnog Backplane-a

Backplane implementira koncept "hardverskog mikrokernela":

```
┌─────────────────────────────────────────────────────────────────┐
│           BACKPLANE = "Hardverski Mikrokernel"                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    SAMO pruža:                                                   │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ • DC sabirnice (distribucija snage)                     │  │
│    │ • CAN-A bus rutiranje (primarna komunikacija)           │  │
│    │ • CAN-B bus rutiranje (rezervna komunikacija)           │  │
│    │ • Ground plane (bezbednost i referenca signala)         │  │
│    │ • Slot konektori (blind-mate, sekvencirano)             │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    NE sadrži:                                                    │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ ✗ Nikakvu aktivnu logiku ili mikrokontrolere            │  │
│    │ ✗ Nikakvu konverziju snage (AC/DC, DC/DC)               │  │
│    │ ✗ Nikakvu jedinstvenu tačku kvara                       │  │
│    │ ✗ Nikakav softver ili firmware                          │  │
│    │ ✗ Nikakvu centralizovanu kontrolu                       │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Rezultat:                                                     │
│    • Backplane nema modova kvara (samo pasivne komponente)      │
│    • Moduli rade autonomno (swarm ponašanje)                    │
│    • Sistem nastavlja sa bilo kojim podskupom modula            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Šema Backplane-a

```
┌─────────────────────────────────────────────────────────────────┐
│                    Arhitektura Backplane-a                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    AC Ulaz (sa stanice)                                          │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  3-fazno 400V ──────────────────────────────────────────┼─┼──►
│    │                                                          │ │ Ka
│    │  PE (Masa) ─────────────────────────────────────────────┼─┼──► DC
│    │                                                          │ │ Izlazu
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    Distribucija DC Sabirnice:                                    │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  DC+ ════╦════╦════╦════╦════╦════╦════╦════╦════╦═══   │ │
│    │         ║    ║    ║    ║    ║    ║    ║    ║    ║       │ │
│    │        [1]  [2]  [3]  [4]  [5]  [6] ... ... [84]        │ │
│    │         ║    ║    ║    ║    ║    ║    ║    ║    ║       │ │
│    │  DC- ════╩════╩════╩════╩════╩════╩════╩════╩════╩═══   │ │
│    │                                                          │ │
│    │  Sabirnice: Bakar, 10mm² poprečni presek                │ │
│    │  Osiguranje po slotu: PTC resetabilni (5A trip)         │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    CAN-A Bus (Primarni):                                         │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  CAN-A_H ══╦════╦════╦════╦════╦════════════╦══ 120Ω    │ │
│    │           ║    ║    ║    ║    ║            ║            │ │
│    │          [1]  [2]  [3]  [4]  [5]  ...     [84]          │ │
│    │           ║    ║    ║    ║    ║            ║            │ │
│    │  CAN-A_L ══╩════╩════╩════╩════╩════════════╩══ 120Ω    │ │
│    │                                                          │ │
│    │  Topologija: Linearni bus sa terminacijom na oba kraja  │ │
│    │  Dužina stub-a: <30 cm po modulu                        │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│    CAN-B Bus (Rezervni):                                         │
│    ┌──────────────────────────────────────────────────────────┐ │
│    │                                                          │ │
│    │  (Ista topologija kao CAN-A, fizički odvojena putanja)  │ │
│    │                                                          │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Distribucija Snage

**Dizajn DC Sabirnice:**

| Parametar | Specifikacija |
|-----------|---------------|
| Napon sabirnice | 650-900 VDC (nominalno 800V) |
| Kapacitet struje sabirnice | 350A kontinualno |
| Materijal sabirnice | Bakar, elektrolitičke čistoće |
| Poprečni presek sabirnice | 10 mm² po šini |
| Struja po slotu | 4A max (sa 25% marginom) |

**Zaštita Po Slotu:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Zaštitno Kolo Po Slotu                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ Sabirnica                                                 │
│         │                                                        │
│         ├─────────────────────────────────────────┐             │
│         │                                         │             │
│        ─┴─ PTC Osigurač                          ─┴─            │
│        ─┬─ (Littelfuse 2920L500)                  │             │
│         │  • Radna struja: 5A                     │             │
│         │  • Trip struja: 10A                    ─┴─            │
│         │  • Max napon: 1000V                     │  Hall       │
│         │  • Resetabilni                         ─┬─ Efekat    │
│         │                                         │  Senzor    │
│         └─────────────────────────────────────────┤             │
│                                                   │             │
│                                                   ▼             │
│                                              Slot Konektor      │
│                                                                  │
│    Merenje struje (Hall efekat):                                 │
│    • Allegro ACS712 ili slično                                  │
│    • Izlaz: 0-5V proporcionalno struji                          │
│    • Čita opcioni rack kontroler                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Rutiranje Komunikacije

**Dual CAN-FD Bus:**

| Parametar | CAN-A | CAN-B |
|-----------|-------|-------|
| Svrha | Primarne operacije | Backup / samo heartbeat |
| Brzina podataka | 5 Mbps | 5 Mbps |
| Terminacija | 120Ω split na oba kraja | 120Ω split na oba kraja |
| Tip kabla | Upredeni par, oklopljen | Upredeni par, oklopljen |
| Fizička putanja | Leva strana backplane-a | Desna strana backplane-a |

**Detalji Terminacije:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAN Bus Terminacija                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Kraj A (strana Slota 1)          Kraj B (strana Slota 84)    │
│                                                                  │
│    CAN_H ─────────────────────────────────────────────── CAN_H  │
│            │                                       │            │
│           ┌┴┐ 60Ω                                ┌┴┐ 60Ω       │
│           └┬┘                                    └┬┘            │
│            │                                       │            │
│            ├──┤├── 4.7nF ──► GND                  ├──┤├────     │
│            │                                       │            │
│           ┌┴┐ 60Ω                                ┌┴┐ 60Ω       │
│           └┬┘                                    └┬┘            │
│            │                                       │            │
│    CAN_L ─────────────────────────────────────────────── CAN_L  │
│                                                                  │
│  Split terminacija pruža:                                        │
│  • Bolju common-mode rejection                                  │
│  • Nižu EMI emisiju                                             │
│  • AC terminaciju preko kondenzatora                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Rack Kontroler (Opcioni)

### 4.1 Uloga Kontrolera

Rack kontroler je **OPCIONI**. Moduli rade autonomno bez njega:

```
┌─────────────────────────────────────────────────────────────────┐
│               Rack Kontroler: Opcioni "Init Proces"              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Šta kontroler radi (kada je prisutan):                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ • Detekcija prisustva slota (inventar)                   │  │
│    │ • Praćenje temperature (ambijentalni senzori)            │  │
│    │ • Kontrola brzine ventilatora (bazirano na opterećenju)  │  │
│    │ • Senzor otvaranja/zatvaranja vrata (bezbednosni interlock)│
│    │ • Agregirana telemetrija ka Station Kontroleru            │  │
│    │ • LED prikaz statusa                                      │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Šta kontroler NE radi:                                        │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ ✗ Kontrola izlaza snage (moduli rade autonomno)          │  │
│    │ ✗ Upravljanje koordinacijom modula (swarm to obrađuje)   │  │
│    │ ✗ Rutiranje CAN poruka (pasivni backplane)               │  │
│    │ ✗ Bilo koju funkciju potrebnu za rad punjenja            │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Ako kontroler otkaže:                                         │
│    • Moduli nastavljaju punjenje normalno                       │
│    • Ventilatori rade na fiksnoj brzini (bezbedni default)     │
│    • Nema agregacije telemetrije (moduli javljaju direktno)    │
│    • Status LED-ovi možda neće ažurirati                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Hardver Kontrolera

| Komponenta | Specifikacija |
|------------|---------------|
| MCU | STM32F407VGT6 |
| CAN interfejs | 2× CAN-FD (za bus A i B) |
| I2C interfejs | Za slot senzore, temp senzore |
| GPIO | Za fan PWM, prekidač vrata, LED-ove |
| Ethernet | Opciono, za direktnu mrežnu konekciju |
| Napajanje | 12V od rack PSU |

### 4.3 Funkcije Kontrolera

**Detekcija Prisustva Slota:**

```c
/* Prisustvo slota preko I2C GPIO ekspandera */
typedef struct {
    uint8_t slot_id;
    bool present;
    bool power_enabled;
    float current_amps;
    float temperature_c;
} SlotStatus_t;

/* Čitanje statusa svih slotova */
void ReadSlotInventory(SlotStatus_t slots[84]) {
    for (int i = 0; i < 84; i++) {
        /* Čitanje prekidača prisustva preko I2C ekspandera */
        slots[i].present = ReadPresenceSwitch(i);

        /* Čitanje struje preko Hall senzor ADC */
        slots[i].current_amps = ReadSlotCurrent(i);

        /* Čitanje temperature sa senzora po slotu */
        slots[i].temperature_c = ReadSlotTemperature(i);
    }
}
```

**Kontrola Ventilatora:**

```c
/* Kontrola ventilatora bazirana na termalnim zonama */
#define NUM_ZONES 5
#define FANS_PER_ZONE 3

void UpdateFanSpeed(void) {
    for (int zone = 0; zone < NUM_ZONES; zone++) {
        /* Uzmi max temperaturu u zoni */
        float max_temp = GetZoneMaxTemperature(zone);

        /* Izračunaj potrebnu brzinu ventilatora (linearna interpolacija) */
        uint8_t speed_percent;
        if (max_temp < 40.0f) {
            speed_percent = 30;  /* Minimalna brzina */
        } else if (max_temp > 70.0f) {
            speed_percent = 100; /* Maksimalna brzina */
        } else {
            speed_percent = 30 + (max_temp - 40.0f) * 70.0f / 30.0f;
        }

        /* Primeni na sve ventilatore u zoni */
        for (int fan = 0; fan < FANS_PER_ZONE; fan++) {
            SetFanPWM(zone, fan, speed_percent);
        }
    }
}
```

---

## 5. Arhitektura Snage

### 5.1 AC Ulazni Stepen

**Konfiguracija:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      Konfiguracija AC Ulaza                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Opcija A: Centralizovani PFC (Preporučeno za nove instalacije)│
│                                                                  │
│    3-fazno 400V AC ──► [Centralni PFC] ──► 800V DC Sabirnica    │
│                         (100kW jedinica)    (ka svim modulima)   │
│                                                                  │
│    Prednosti:                                                    │
│    • Veća efikasnost (jedna konverzija)                         │
│    • Bolja korekcija faktora snage                              │
│    • Manji broj komponenti u modulima                           │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    Opcija B: Distribuirani PFC (Za retrofit ili fleksibilnost)  │
│                                                                  │
│    3-fazno 400V AC ──► [Svaki modul ima svoj PFC]               │
│                                                                  │
│    Prednosti:                                                    │
│    • Nema centralne tačke kvara                                 │
│    • Fleksibilno deployment                                     │
│    • Moduli su samoodrživi                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Dizajn DC Sabirnice

| Parametar | Specifikacija |
|-----------|---------------|
| Nominalni napon | 800 VDC |
| Opseg napona | 650-900 VDC |
| Ukupni kapacitet | 350A kontinualno |
| Alokacija po modulu | 4.2A (sa marginom) |
| Kapacitivnost sabirnice | 10 mF (ride-through) |

**Banka Kondenzatora Sabirnice:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Banka Kondenzatora DC Sabirnice               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    DC+ ─────┬─────┬─────┬─────┬─────┬─────┬───────             │
│             │     │     │     │     │     │                     │
│            ─┴─   ─┴─   ─┴─   ─┴─   ─┴─   ─┴─                   │
│            1mF   1mF   1mF   1mF   1mF   1mF  (Film kondenzatori)│
│            ─┬─   ─┬─   ─┬─   ─┬─   ─┬─   ─┬─  1000V ocena      │
│             │     │     │     │     │     │                     │
│    DC- ─────┴─────┴─────┴─────┴─────┴─────┴───────             │
│                                                                  │
│    Ukupno: 10 mF @ 900V                                         │
│    Svrha: Ride-through tokom hot-swap-a                         │
│    Lokacija: Distribuirano duž backplane-a                      │
│                                                                  │
│    Proračun ride-through-a:                                      │
│    • Max opterećenje: 280 kW                                    │
│    • Dozvoljen pad napona: 50V (800V → 750V)                    │
│    • Vreme: C × ΔV / I = 10mF × 50V / 350A = 1.4 ms            │
│    • Dovoljno za hot-swap tranzijent modula                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Implementacija Wide Striping

Svi moduli dele opterećenje ravnomerno preko droop kontrole:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Wide Striping / Droop Kontrola                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Tradicionalni Punjač (Master-Slave):                          │
│                                                                  │
│    ┌─────────┐                                                  │
│    │ Master  │ ──► Kontroliše svu snagu                         │
│    └────┬────┘                                                  │
│         │                                                       │
│    ┌────┴────┐  ┌─────────┐  ┌─────────┐                       │
│    │ Slave 1 │  │ Slave 2 │  │ Slave 3 │                       │
│    └─────────┘  └─────────┘  └─────────┘                       │
│    Problem: Kvar master-a = totalni kvar                        │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    EK3 Rack (Wide Striping):                                     │
│                                                                  │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐       ┌─────────┐     │
│    │ Mod 1   │  │ Mod 2   │  │ Mod 3   │  ...  │ Mod 84  │     │
│    │ 3.3kW   │  │ 3.3kW   │  │ 3.3kW   │       │ 3.3kW   │     │
│    └────┬────┘  └────┬────┘  └────┬────┘       └────┬────┘     │
│         │            │            │                  │          │
│         └────────────┴────────────┴──────────────────┘          │
│                              │                                   │
│                              ▼                                   │
│                     Zajednička DC Sabirnica (800V)              │
│                                                                  │
│    Svaki modul: Postavlja izlaz baziran na naponu sabirnice     │
│    V_bus visok → smanji snagu                                   │
│    V_bus nizak → povećaj snagu                                  │
│    Rezultat: Automatsko deljenje opterećenja, master nije potreban│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Jednačina Droop Kontrole:**

```
V_out = V_nominal - (R_droop × I_out)

Gde:
  V_nominal = 800V (ciljni napon sabirnice)
  R_droop = 5Ω (virtualna otpornost)
  I_out = izlazna struja modula

Primer:
  Modul isporučuje 3.3kW na 800V = 4.125A
  V_out = 800V - (5Ω × 4.125A) = 779.4V

  Ako je izmereni napon sabirnice 810V (malo opterećenje):
  Modul smanjuje izlaz dok se ne postigne ravnoteža

  Ako je izmereni napon sabirnice 780V (veliko opterećenje):
  Modul povećava izlaz dok se ne postigne ravnoteža
```

---

## 6. Termalno Upravljanje

### 6.1 Zone Hlađenja

```
┌─────────────────────────────────────────────────────────────────┐
│                    Raspored Termalnih Zona                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │  ZONA E (Vrh)    │ Redovi 13-14 │ 12 modula │           │  │
│    │  Najtoplija zona │              │           │ Fan E     │  │
│    ├──────────────────┼──────────────┼───────────┼───────────┤  │
│    │  ZONA D          │ Redovi 10-12 │ 18 modula │ Fan D     │  │
│    ├──────────────────┼──────────────┼───────────┼───────────┤  │
│    │  ZONA C (Sredina)│ Redovi 7-9   │ 18 modula │ Fan C     │  │
│    ├──────────────────┼──────────────┼───────────┼───────────┤  │
│    │  ZONA B          │ Redovi 4-6   │ 18 modula │ Fan B     │  │
│    ├──────────────────┼──────────────┼───────────┼───────────┤  │
│    │  ZONA A (Dno)    │ Redovi 1-3   │ 18 modula │ Fan A     │  │
│    │  Najhladnija zona│              │           │           │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│    Temperatura ulaznog vazduha raste dok prolazi kroz rack      │
│    Gornje zone zahtevaju agresivnije hlađenje                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Dizajn Fan Modula

| Parametar | Specifikacija |
|-----------|---------------|
| Ventilatora po zoni | 3 (N+1 redundancija) |
| Tip ventilatora | 120mm × 38mm, aksijalni |
| Protok po ventilatoru | 200 CFM @ 50% duty |
| Kontrola brzine | PWM, 25-100% |
| Buka | <45 dB(A) @ 50% duty |

**Redundancija Ventilatora:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  Fan Modul (N+1 Redundancija)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Normalan rad (svi ventilatori rade):                          │
│    ┌─────┐  ┌─────┐  ┌─────┐                                   │
│    │ FAN │  │ FAN │  │ FAN │  Svaki na 50% brzine              │
│    │  1  │  │  2  │  │  3  │  Ukupno: 600 CFM (3 × 200)        │
│    └──┬──┘  └──┬──┘  └──┬──┘                                   │
│       │        │        │                                       │
│       ▼        ▼        ▼                                       │
│    ══════════════════════════                                   │
│           Protok vazduha                                        │
│                                                                  │
│    Jedan ventilator otkazao:                                     │
│    ┌─────┐  ┌─────┐  ┌─────┐                                   │
│    │ FAN │  │  X  │  │ FAN │  Preostali na 75% brzine          │
│    │  1  │  │KVAR │  │  3  │  Ukupno: 600 CFM (2 × 300)        │
│    └──┬──┘  └─────┘  └──┬──┘                                   │
│       │                  │                                       │
│       ▼                  ▼                                       │
│    ══════════════════════════                                   │
│           Protok (održan)                                        │
│                                                                  │
│    Dva ventilatora otkazala: Graceful derating                   │
│    • Preostali ventilator na 100%: 400 CFM (67% kapaciteta)     │
│    • Moduli u zoni smanjuju snagu za 33%                        │
│    • Upozorenje ka station kontroleru                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Termalna Migracija

Moduli autonomno redistribuiraju opterećenje bazirano na temperaturi:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Termalna Migracija                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Scenario: Modul 42 radi vruće (85°C)                          │
│                                                                  │
│    Pre migracije:                                                │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│    │ Mod 41 │ │ Mod 42 │ │ Mod 43 │ │ Mod 44 │                 │
│    │ 65°C   │ │ 85°C ! │ │ 62°C   │ │ 60°C   │                 │
│    │ 3.3kW  │ │ 3.3kW  │ │ 3.3kW  │ │ 3.3kW  │                 │
│    └────────┘ └────────┘ └────────┘ └────────┘                 │
│                                                                  │
│    Modul 42 emituje THERMAL_SHARE poruku:                        │
│    "Vruće mi je, tražim smanjenje snage"                        │
│                                                                  │
│    Posle migracije (swarm odgovor):                              │
│    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│    │ Mod 41 │ │ Mod 42 │ │ Mod 43 │ │ Mod 44 │                 │
│    │ 68°C   │ │ 75°C ✓ │ │ 66°C   │ │ 64°C   │                 │
│    │ 3.5kW  │ │ 2.5kW  │ │ 3.5kW  │ │ 3.5kW  │                 │
│    └────────┘ └────────┘ └────────┘ └────────┘                 │
│                                                                  │
│    Ukupna snaga nepromenjena: 13.0 kW                            │
│    Temperatura vrućeg modula smanjena                            │
│    Centralni kontroler nije uključen                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Obrada Kvarova

### 7.1 Kvar Modula

```
┌─────────────────────────────────────────────────────────────────┐
│                  Obrada Kvara Modula                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Kvar detektovan (modul prestaje da odgovara):                 │
│                                                                  │
│    1. PTC osigurač puca (ako je kratak spoj)                     │
│       └─► Modul izolovan od DC sabirnice                        │
│                                                                  │
│    2. Swarm detektuje nedostajući heartbeat (1 sekunda timeout)  │
│       └─► Ostali moduli redistribuiraju opterećenje             │
│                                                                  │
│    3. Station kontroler obavestio                                │
│       └─► Loguje događaj, zakazuje zamenu                       │
│                                                                  │
│    4. LED na slotu postaje crven (ako je rack kontroler prisutan)│
│       └─► Vizualna indikacija za tehničara/robota               │
│                                                                  │
│    Analiza Uticaja:                                              │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ 84 modula ukupno, 1 otkazao:                            │  │
│    │ • Gubitak kapaciteta: 1/84 = 1.2%                      │  │
│    │ • Povećanje opterećenja po modulu: 1/83 = 1.2%         │  │
│    │ • Sistem nastavlja na 98.8% kapaciteta                 │  │
│    └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Kvar Backplane-a

**Izuzetno retko** (samo pasivne komponente), ali moguće:

| Mod Kvara | Verovatnoća | Uticaj | Mitigacija |
|-----------|-------------|--------|------------|
| Oštećenje sabirnice | Vrlo niska | Segment offline | Sekciona sabirnica sa premosnicama |
| Prekid CAN trake | Vrlo niska | Gubitak komunikacije | Dual CAN busevi |
| Kvar konektora | Niska | Jedan slot offline | Konektori sa soketa |
| Kvar kondenzatora | Niska | Smanjen ride-through | Distribuirani kondenzatori |

### 7.3 Kvar Ventilatora

```
┌─────────────────────────────────────────────────────────────────┐
│                   Odgovor na Kvar Ventilatora                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Nivo Kvara        │ Odgovor                                   │
│    ──────────────────┼───────────────────────────────────────── │
│    1 fan/zona        │ Povećaj ostale ventilatore za kompenzaciju│
│                      │ Normalan rad nastavlja                    │
│    ──────────────────┼───────────────────────────────────────── │
│    2 fan-a/zona      │ Preostali ventilator na 100%             │
│                      │ Moduli zone deratiraju za 30%             │
│                      │ Upozorenje ka station kontroleru          │
│    ──────────────────┼───────────────────────────────────────── │
│    3 fan-a/zona      │ Moduli zone gase se (termalna zaštita)   │
│    (svi ventilatori) │ Ostale zone nastavljaju sa smanjenom snagom│
│                      │ Kritično upozorenje                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Robot Interfejs

### 8.1 Identifikacija Slota

```
┌─────────────────────────────────────────────────────────────────┐
│                  Sistem Identifikacije Slota                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Vizualna Identifikacija:                                      │
│    ┌────────────────────────────────────────────────────────┐   │
│    │                                                        │   │
│    │    ┌─────────────────────────────────────────────┐    │   │
│    │    │                                             │    │   │
│    │    │  ┌───┐                                      │    │   │
│    │    │  │LED│ ◄─── Status LED                      │    │   │
│    │    │  └───┘      • Zelena: OK                    │    │   │
│    │    │             • Žuta: Upozorenje              │    │   │
│    │    │             • Crvena: Kvar                  │    │   │
│    │    │             • Plava: Robot cilj             │    │   │
│    │    │                                             │    │   │
│    │    │  ┌─────────┐                                │    │   │
│    │    │  │ QR Kod  │ ◄─── Mašinski čitljiv ID       │    │   │
│    │    │  │  ▓▓▓▓▓  │      Sadrži:                   │    │   │
│    │    │  │  ▓   ▓  │      • Rack ID                 │    │   │
│    │    │  │  ▓▓▓▓▓  │      • Broj slota              │    │   │
│    │    │  └─────────┘      • Kalibracioni podaci     │    │   │
│    │    │                                             │    │   │
│    │    │  [ 42 ] ◄─── Ljudski čitljiv broj slota    │    │   │
│    │    │                                             │    │   │
│    │    └─────────────────────────────────────────────┘    │   │
│    │                                                        │   │
│    └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Vođenje Umetanja

```
┌─────────────────────────────────────────────────────────────────┐
│                  Mehaničko Vođenje Umetanja                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Vodeće Šine:                                                  │
│    ┌────────────────────────────────────────────────────────┐   │
│    │                                                        │   │
│    │    Bočni Pogled:                                       │   │
│    │                                                        │   │
│    │    ══════════════════════════════════════              │   │
│    │    ║              Vodeća Šina (Gornja)  ║               │   │
│    │    ║                                   ║               │   │
│    │    ║     ┌─────────────────────┐      ║               │   │
│    │    ║     │                     │      ║               │   │
│    │    ║     │      MODUL          │◄─────╬── Pravac      │   │
│    │    ║     │                     │      ║   umetanja    │   │
│    │    ║     └─────────────────────┘      ║               │   │
│    │    ║              Vodeća Šina (Donja) ║               │   │
│    │    ══════════════════════════════════════              │   │
│    │                                                        │   │
│    │    Karakteristike vodeće šine:                         │   │
│    │    • Koničan ulaz (±10mm samo-poravnanje)             │   │
│    │    • Nisko trenje (PTFE premaz)                       │   │
│    │    • Detenti pozicije pri punom umetanju              │   │
│    │                                                        │   │
│    └────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 Bezbednosni Interloci

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sekvenca Bezbednosnog Interlocka              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    Sekvenca Umetanja:                                            │
│                                                                  │
│    1. Robot se pozicionira kod slota                             │
│       └─► Rack kontroler prima "zahtev za zamenu"               │
│                                                                  │
│    2. LED slota postaje plava (potvrda cilja)                   │
│       └─► Snaga slota unapred onemogućena                       │
│                                                                  │
│    3. Robot umeće modul                                          │
│       └─► Kontakt mase uspostavljen prvi (ESD zaštita)          │
│                                                                  │
│    4. Poluga angažovana (zaključana pozicija)                    │
│       └─► Senzor pozicije potvrđuje puno umetanje               │
│                                                                  │
│    5. Sekvenca pre-charge pokrenuta                              │
│       └─► Modul soft-start (500ms)                              │
│                                                                  │
│    6. Modul se pridružuje swarm-u                                │
│       └─► CAN heartbeat potvrđuje rad                           │
│       └─► LED postaje zelena                                    │
│                                                                  │
│    ────────────────────────────────────────────────────────────  │
│                                                                  │
│    Sekvenca Vađenja:                                             │
│                                                                  │
│    1. Robot zahteva vađenje                                      │
│       └─► Modul prima komandu za gašenje                        │
│                                                                  │
│    2. Modul smanjuje snagu na nulu (graceful)                    │
│       └─► Potvrđuje završetak gašenja                           │
│                                                                  │
│    3. Snaga slota onemogućena (kontaktor otvoren)                │
│       └─► DC sabirnica izolovana od slota                       │
│                                                                  │
│    4. LED postaje plava (bezbedno za uklanjanje)                 │
│       └─► Robot nastavlja sa vađenjem                           │
│                                                                  │
│    5. Poluga otpuštena, modul uklonjen                           │
│       └─► Slot označen kao prazan                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Principi mikrokernela |
| `tehnika/15-ek3-connector-spec.md` | Specifikacije konektora |
| `tehnika/05-swarm-intelligence.md` | Swarm koordinacija |
| `tehnika/09-ek3-rack-sistem.md` | Originalni koncept rack-a |
| `tehnika/13-hardware-security.md` | CAN EMC dizajn |

---

## Dodatak A: Lista Materijala (Nivo Rack-a)

| Stavka | Količina | Opis |
|--------|----------|------|
| Rack okvir | 1 | 42U, 600×1000mm |
| Backplane PCB | 1 | Custom, 6-slojni |
| Slot konektori | 84 | Ženski, 20-pin |
| Kondenzatori sabirnice | 10 | 1mF, 1000V film |
| CAN terminacija | 4 | 120Ω split + 4.7nF |
| PTC osigurači | 84 | 5A hold, 1000V |
| Fan moduli | 5 | 3× 120mm ventilatora svaki |
| Senzori temperature | 20 | NTC, I2C |
| Rack kontroler | 1 | Baziran na STM32F407 |
| Ulaz snage | 1 | 3-fazno 400V, 400A |

---

## Dodatak B: Rezime Specifikacija Rack-a

| Parametar | Vrednost |
|-----------|----------|
| Kapacitet modula | 84 slota |
| Ukupna snaga | 277 kW max |
| Redundancija | N-1 (83/84) |
| Ulazni napon | 3-fazno 400V AC |
| Napon DC sabirnice | 650-900 VDC |
| Hlađenje | Spreda-nazad, 2000 CFM |
| Vreme hot-swap-a | <60 sekundi |
| Kompatibilnost sa robotom | Da |
| MTBF backplane-a | >1,000,000 sati |
