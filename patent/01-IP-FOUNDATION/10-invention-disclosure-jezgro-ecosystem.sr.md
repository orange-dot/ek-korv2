# Prijava izuma: JEZGRO Unificirani mikrokernelski ekosistem

## Administrativne informacije

| Polje | Vrednost |
|-------|----------|
| ID prijave | EK-2026-010 |
| Datum prijave | 2026-01-05 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilića 8, Kikinda, Severni Banat, Srbija |
| Datum koncepcije | 2026-01-04 |
| Svedoci | Marija Janjatović |

### Poreklo izuma
Proširenje JEZGRO mikrokernela (EK-2026-006) sa jednog tipa uređaja na ceo ekosistem. Ključni uvid: isti tolerantni na greške, MPU-izolovani mikrokernel može da radi na SVIM inteligentnim komponentama—punjačkim modulima, baterijskim BMS-ovima, robotima, protokol adapterima—samo sa promenama konfiguracije servisa. Ovo stvara neviđenu efikasnost lanca snabdevanja, konzistentno rukovanje greškama i koordinaciju između uređaja.

---

## 1. Naziv izuma

**Unificirani mikrokernelski operativni sistem za heterogeni ekosistem energetske elektronike sa konfiguracijm servisa baziranom na varijantama**

Alternativni nazivi:
- JEZGRO porodica proizvoda: Jedan kernel za punjače, baterije, robote i gateway uređaje
- Tolerantan na greške ugrađeni OS sa međuuređajnom ROJ koordinacijom
- MPU-izolovani mikrokernel sa hot-swap servisnim modulima za EV infrastrukturu

---

## 2. Tehničko polje

```
- Ugrađeni operativni sistemi
- Real-time sistemi za energetsku elektroniku
- Sistemi za upravljanje baterijama
- Robotski kontrolni sistemi
- Vehicle-to-Grid (V2G) protokol gateway-i
- Distribuirana koordinacija (ROJ inteligencija)
```

---

## 3. Opis problema

### 3.1 Trenutno stanje tehnike

```
TRENUTNI PRISTUPI UGRAĐENOM FIRMWARE-U:

PRISTUP A: Firmware specifičan za uređaj
─────────────────────────────────────────
• Firmware punjača: Prilagođeni RTOS + kontrola snage
• BMS firmware: Različiti RTOS + nadzor ćelija
• Robot firmware: Još jedan RTOS + kontrola kretanja
• Gateway firmware: Linux ili bare-metal + protokoli

Problemi:
• 4+ različite baze koda za održavanje
• 4+ različita razvojna tima
• Bez ponovnog korišćenja koda između uređaja
• Nekonzistentno rukovanje greškama
• Kompleksnost lanca snabdevanja (različiti MCU-ovi)

PRISTUP B: Jedan RTOS, aplikacije specifične za uređaj
──────────────────────────────────────────────────────
• FreeRTOS ili slično na svim uređajima
• Različit aplikativni kod po uređaju

Problemi:
• Bez izolacije grešaka (monolitno)
• Jedan bug ruši ceo uređaj
• Bez automatskog restartovanja servisa
• Ažuriranja zahtevaju puno reprogramiranje
• Bez protokola za koordinaciju između uređaja
```

### 3.2 Problemi sa trenutnim pristupima

```
1. BEZ UNIFICIRANOG RUKOVANJA GREŠKAMA
   • Greška punjača → različit oporavak od BMS greške
   • Greška robota → treći mehanizam oporavka
   • Operateri moraju naučiti višestruke sisteme
   • Bez predvidljivog ponašanja oporavka

2. FRAGMENTACIJA LANCA SNABDEVANJA
   • Punjač: STM32G474
   • BMS: Texas Instruments MSP430
   • Robot: NXP i.MX RT
   • Gateway: Linux na Raspberry Pi

   Rezultat: 4 dobavljača, 4 toolchain-a, 4 ugovora o podršci

3. BEZ KOORDINACIJE IZMEĐU UREĐAJA
   • Punjač ne "zna" direktno stanje BMS-a
   • Robot ne deli stanje sa punjačem
   • Gateway izolovan od power uređaja

   Rezultat: Potreban eksterni koordinator (jedna tačka otkaza)

4. NEKONZISTENTNI MEHANIZMI AŽURIRANJA
   • Punjač: JTAG flash
   • BMS: Proprietary bootloader
   • Robot: USB ažuriranje
   • Gateway: SD kartica image

   Rezultat: Kompleksne procedure ažuriranja na terenu

5. RAZVOJNA NEEFIKASNOST
   • Termalno upravljanje: Napisano 4 puta
   • CAN komunikacija: Napisana 4 puta
   • Logovanje grešaka: Napisano 4 puta
   • Sigurnosne blokade: Napisane 4 puta

   Rezultat: 4× troškovi razvoja, 4× površina za bugove
```

---

## 4. Predloženo rešenje

### 4.1 Osnovna inovacija: JEZGRO porodica proizvoda

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO: JEDAN KERNEL, MNOGO UREĐAJA                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         ┌─────────────────┐                                 │
│                         │  JEZGRO KERNEL  │                                 │
│                         │  (~8 KB koda)   │                                 │
│                         │                 │                                 │
│                         │ • Raspoređivač  │                                 │
│                         │ • MPU Manager   │                                 │
│                         │ • IPC (64-bajta)│                                 │
│                         │ • Reinkarnacija │                                 │
│                         └────────┬────────┘                                 │
│                                  │                                          │
│        ┌─────────────┬───────────┼───────────┬─────────────┐               │
│        ▼             ▼           ▼           ▼             ▼               │
│   ┌─────────┐   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│   │JEZGRO-  │   │JEZGRO-  │ │JEZGRO-  │ │JEZGRO-  │ │JEZGRO-  │           │
│   │  EK3    │   │  RACK   │ │  BAT    │ │  ROB    │ │  GW     │           │
│   │         │   │         │ │         │ │         │ │         │           │
│   │LLC_CTRL │   │FAN_CTRL │ │CELL_MON │ │MOTION   │ │PLL_SYNC │           │
│   │THERMAL  │   │SLOT_INV │ │BALANCE  │ │TRAJEC   │ │ISO15118 │           │
│   │ROJ_COORD│   │ROJ_COORD│ │SOC_SOH  │ │SAFETY   │ │OCPP     │           │
│   │CAN_HDLR │   │CAN_HDLR │ │ROJ_COORD│ │ROJ_COORD│ │DROOP    │           │
│   └─────────┘   └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                                              │
│   Isti kernel kod, različita konfiguracija servisa po tipu uređaja         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Ključni elementi inovacije

```
ELEMENT 1: Unificirani kernel za sve tipove uređaja
────────────────────────────────────────────────────
• Jedan ~8KB kernel binary
• Radi na STM32G474 (170MHz) i STM32H743 (480MHz)
• Isti raspoređivač, ista MPU izolacija, isti IPC
• Tip uređaja određen samo konfiguracijom servisa

ELEMENT 2: Selekcija servisa bazirana na varijantama
────────────────────────────────────────────────────
Compile-time konfiguracija selektuje servise:

  #define JEZGRO_VARIANT_EK3
  // Omogućava: LLC_CONTROL, THERMAL, ROJ_COORD, CAN_HANDLER
  // Onemogućava: CELL_MONITOR, MOTION_CTRL, ISO15118

  #define JEZGRO_VARIANT_BAT
  // Omogućava: CELL_MONITOR, BALANCING, SOC_SOH, ROJ_COORD
  // Onemogućava: LLC_CONTROL, MOTION_CTRL, ISO15118

ELEMENT 3: Zajednička biblioteka servisa
────────────────────────────────────────
Deljeno između svih varijanti:
• ROJ_COORD: Distribuirana koordinacija (bazirana na Raft-u)
• CAN_HANDLER: CAN-FD komunikacija
• THERMAL_MGR: Nadzor temperature
• AUDIT_LOGGER: Logovanje događaja
• WATCHDOG: Nadzor zdravlja servisa

ELEMENT 4: Međuuređajni ROJ protokol
────────────────────────────────────
Svi uređaji govore isti CAN-FD protokol:
• HEARTBEAT (0x1xx): Prisutnost, status
• THERMAL_SHARE (0x3xx): Termalno stanje
• ROJ_ELECTION (0x010): Izbor lidera
• FAULT_ALERT (0x7FF): Kritične greške

Baterija, punjač, robot mogu direktno da koordinišu.
Nije potreban eksterni koordinator.

ELEMENT 5: Konzistentan oporavak od grešaka
───────────────────────────────────────────
Isti mehanizam oporavka svuda:
• Greška servisa → MPU izuzetak
• Kernel hvata, loguje grešku
• Reinkarnacioni server restartuje servis
• Vreme oporavka: <50ms
• Bez ručne intervencije

Radi identično na punjaču, BMS-u, robotu, gateway-u.
```

### 4.3 Matrica varijanti

```
┌────────────┬─────────────────┬───────────┬─────────────────────────────────┐
│ Varijanta  │ Ciljni uređaj   │ MCU       │ Ključni servisi                 │
├────────────┼─────────────────┼───────────┼─────────────────────────────────┤
│ JEZGRO-EK3 │ 3.3kW punjač    │ STM32G474 │ LLC_CONTROL, THERMAL, ROJ_COORD │
│ JEZGRO-RACK│ Rack kontroler  │ STM32G474 │ FAN_CONTROL, SLOT_INVENTORY     │
│ JEZGRO-BAT │ Baterijski BMS  │ STM32G474 │ CELL_MONITOR, BALANCING, SOC    │
│ JEZGRO-ROB │ Robotska ruka   │ STM32H743 │ MOTION_CTRL, TRAJECTORY, SAFETY │
│ JEZGRO-GW  │ V2G gateway     │ STM32H743 │ PLL_SYNC, ISO15118, DROOP_CTRL  │
└────────────┴─────────────────┴───────────┴─────────────────────────────────┘

ADAPTER UREĐAJI (svi pokreću JEZGRO-GW varijantu):
┌──────────────┬───────────────────────────────────────────────────────────┐
│ EK-ADAPT-V2G │ Vozila koja nisu EK → učešće u V2G mreži                  │
│ EK-ADAPT-BUS │ Retrofit postojećih autobusa za swap sposobnost          │
│ EK-ADAPT-CCS │ CCS Combo 1/2 do EK protokol most                        │
│ EK-ADAPT-MCS │ Megawatt Charging System adapter                         │
│ EK-ADAPT-OCPP│ Third-party OCPP gateway za punjače                      │
└──────────────┴───────────────────────────────────────────────────────────┘
```

---

## 5. Detalji arhitekture

### 5.1 Mapa memorije (zajednička za sve varijante)

```
FLASH RASPORED (512KB - STM32G474)
──────────────────────────────────
0x0800_0000 ┌─────────────────────┐
            │ Bootloader (16KB)   │
0x0800_4000 ├─────────────────────┤
            │ Kernel (8KB)        │
0x0800_6000 ├─────────────────────┤
            │ Servis 1 (32KB)     │  ← Specifično za varijantu
0x0800_E000 ├─────────────────────┤
            │ Servis 2 (32KB)     │  ← Specifično za varijantu
            │ ...                 │
0x0807_0000 ├─────────────────────┤
            │ Config (8KB)        │
0x0807_2000 ├─────────────────────┤
            │ Audit Log (56KB)    │
0x0808_0000 └─────────────────────┘

RAM RASPORED (128KB - STM32G474)
────────────────────────────────
0x2000_0000 ┌─────────────────────┐
            │ Kernel (8KB)        │  ← Privilegovan
0x2000_2000 ├─────────────────────┤
            │ IPC Buferi (4KB)    │  ← Deljeni (samo čitanje za servise)
0x2000_3000 ├─────────────────────┤
            │ Servis 1 (16KB)     │  ← MPU-izolovan
0x2000_7000 ├─────────────────────┤
            │ Servis 2 (16KB)     │  ← MPU-izolovan
            │ ...                 │
0x2001_F000 ├─────────────────────┤
            │ Stack guards (4KB)  │
0x2002_0000 └─────────────────────┘
```

### 5.2 Primer konfiguracije servisa

```c
/* JEZGRO-EK3 Konfiguracija */
static const jezgro_service_t ek3_services[] = {
    { .id = 1, .name = "LLC_CONTROL",  .priority = CRITICAL, .stack = 2048, .watchdog_ms = 10   },
    { .id = 2, .name = "THERMAL_MGR",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 500  },
    { .id = 3, .name = "ROJ_COORD",    .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 1000 },
    { .id = 4, .name = "CAN_HANDLER",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 100  },
    { .id = 5, .name = "AUDIT_LOGGER", .priority = LOW,      .stack = 4096, .watchdog_ms = 2000 },
};

/* JEZGRO-BAT Konfiguracija */
static const jezgro_service_t bat_services[] = {
    { .id = 1, .name = "CELL_MONITOR", .priority = CRITICAL, .stack = 2048, .watchdog_ms = 50   },
    { .id = 2, .name = "BALANCING",    .priority = HIGH,     .stack = 2048, .watchdog_ms = 200  },
    { .id = 3, .name = "SOC_SOH",      .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 500  },
    { .id = 4, .name = "ROJ_COORD",    .priority = MEDIUM,   .stack = 4096, .watchdog_ms = 1000 },
    { .id = 5, .name = "CAN_HANDLER",  .priority = HIGH,     .stack = 2048, .watchdog_ms = 100  },
};

/* Isti kernel, različite tabele servisa */
```

### 5.3 Koordinacija između uređaja

```
ROJ PROTOKOL - UNIFICIRAN ZA SVE UREĐAJE
────────────────────────────────────────

Svi JEZGRO uređaji na istoj CAN-FD magistrali mogu:

1. OTKRITI jedni druge (HEARTBEAT broadcast)
2. IZABRATI lidera (Raft konsenzus)
3. DELITI termalno stanje (balansiranje opterećenja)
4. KOORDINISATI akcije (sekvenca zamene baterije)
5. PROPAGIRATI greške (trenutna notifikacija)

PRIMER: Sekvenca zamene baterije
────────────────────────────────

  ROBOT         PUNJAČ         BATERIJA       STANICA
    │              │              │              │
    │◄─────────────┼──────────────┼──────────────┤ SWAP_REQUEST
    │              │              │              │
    ├─────────────►│              │              │ REDUCE_POWER
    │              │◄─────────────┤              │ DISCONNECT_ACK
    │              │              │              │
    │ [Robot uklanja bateriju]    │              │
    │              │              │              │
    ├─────────────►│              │              │ BATTERY_REMOVED
    │              │              │              │
    │ [Robot ubacuje novu bateriju]              │
    │              │              │              │
    ├──────────────┼─────────────►│              │ BATTERY_INSERTED
    │              │              │──────────────►│ BMS_HANDSHAKE
    │              │◄─────────────┤              │ READY_TO_CHARGE
    │              │              │              │
    ├─────────────►│              │              │ SWAP_COMPLETE
    │              │              │              │

Sve poruke koriste isti CAN-FD protokol.
Svi uređaji pokreću JEZGRO sa ROJ_COORD servisom.
Nije potreban eksterni koordinator.
```

---

## 6. Prednosti i koristi

### 6.1 Razvojna efikasnost

```
TRADICIONALNO                        JEZGRO EKOSISTEM
───────────────────────────────────────────────────────────────
4 odvojena RTOS koda              →    1 kernel baza koda
4 razvojna tima                   →    1 unificiran tim
4 seta alata                      →    1 toolchain
4 okvira za testiranje            →    1 test suite
4 mehanizma ažuriranja            →    1 OTA sistem

PROCENJENE UŠTEDE:
• 60% smanjenje troškova razvoja firmware-a
• 75% smanjenje napora testiranja (deljeni test harness)
• Jedan developer može raditi na svim tipovima uređaja
```

### 6.2 Pojednostavljenje lanca snabdevanja

```
TRADICIONALNO                        JEZGRO EKOSISTEM
───────────────────────────────────────────────────────────────
Punjač: STM32G474                →    STM32G474 (primarni)
BMS: TI MSP430                   →    STM32G474 (isti!)
Robot: NXP i.MX RT               →    STM32H743 (za compute)
Gateway: Raspberry Pi            →    STM32H743 (isti!)

REZULTAT:
• 2 MCU familije umesto 4+
• Jedan odnos sa dobavljačem (STMicroelectronics)
• Kupovna moć za veće količine
• Pojednostavljen inventar
• Zajednički debug alati (ST-Link)
```

### 6.3 Operativna konzistentnost

```
OPORAVAK OD GREŠAKA - IDENTIČAN NA SVIM UREĐAJIMA:
──────────────────────────────────────────────────

  Greška punjača:    Restart servisa za <50ms
  Greška BMS-a:      Restart servisa za <50ms
  Greška robota:     Restart servisa za <50ms
  Greška gateway-a:  Restart servisa za <50ms

Operateri uče JEDNO ponašanje oporavka.
Terenski tehničari obučeni JEDNOM.
Dokumentacija napisana JEDNOM.
```

### 6.4 Međuuređajna inteligencija

```
PREDNOSTI ROJ-A:
────────────────
• Punjač zna stanje BMS-a → Optimizovana kriva punjenja
• Robot zna stanje punjača → Sigurno vreme zamene
• Gateway agregira sve → V2G učešće
• BMS zna raspored zamene → Prekondicioniranje za vozilo

BEZ EKSTERNOG KOORDINATORA:
• Bez jedne tačke otkaza
• Latencija: <1ms (direktan CAN-FD)
• Nastavlja rad ako jedan uređaj otkaže
```

---

## 7. Zahtevi (Nacrt)

### Nezavisni zahtevi

1. Unificirani mikrokernelski operativni sistem za heterogene uređaje energetske elektronike, koji sadrži:
   - Zajednički kernel binary (~8KB) koji radi na više tipova MCU-a
   - MPU-baziranu izolaciju servisa bez potrebe za MMU
   - Konfiguraciju servisa baziranu na varijantama koja selektuje servise specifične za uređaj
   - Automatski restart servisa (reinkarnacija) pri detekciji greške
   - Protokol za koordinaciju između uređaja (ROJ) preko deljene komunikacione magistrale

2. Metoda za rad više tipova uređaja u EV punjačkom ekosistemu korišćenjem jednog kernela, koja sadrži:
   - Kompajliranje istog kernela za punjačke module, baterijske BMS-ove, robote i gateway-e
   - Selekciju servisa u vreme kompajliranja bazirano na varijanti uređaja
   - Izolaciju svakog servisa u dedikovanoj MPU regiji
   - Detekciju grešaka servisa putem hardverskih izuzetaka
   - Restartovanje neuspelih servisa bez reseta kernela
   - Koordinaciju između uređaja korišćenjem distribuiranog konsenzus protokola

3. Sistem za koordinaciju između uređaja u infrastrukturi energetske elektronike, gde:
   - Punjački moduli, baterije, roboti i gateway-i pokreću isti operativni sistem
   - Svi uređaji komuniciraju putem zajedničkog CAN-FD protokola
   - Izbor lidera se dešava bez eksternog koordinatora
   - Deljenje termalnog stanja omogućava balansiranje opterećenja između tipova uređaja
   - Propagacija grešaka se dešava za <1ms na svim uređajima

### Zavisni zahtevi

4. Sistem iz zahteva 1, gde kernel podržava dve MCU familije:
   - STM32G474 (Cortex-M4, 170MHz, 128KB RAM) za uređaje fokusirane na snagu
   - STM32H743 (Cortex-M7, 480MHz, 1MB RAM) za uređaje fokusirane na računanje

5. Sistem iz zahteva 1, gde konfiguracije servisa uključuju:
   - JEZGRO-EK3: LLC kontrola snage, termalno upravljanje
   - JEZGRO-BAT: Nadzor ćelija, balansiranje, procena SOC
   - JEZGRO-ROB: Kontrola kretanja, planiranje trajektorije, nadzor bezbednosti
   - JEZGRO-GW: Sinhronizacija sa mrežom, V2G protokoli (ISO 15118, OCPP)

6. Metoda iz zahteva 2, gde ROJ koordinacioni protokol uključuje:
   - HEARTBEAT poruke za detekciju prisutnosti
   - ELECTION poruke korišćenjem Raft konsenzusa
   - THERMAL_SHARE za distribuirano balansiranje opterećenja
   - FAULT_ALERT za trenutnu propagaciju grešaka

7. Sistem iz zahteva 3, koji dodatno sadrži adapter uređaje koji pokreću JEZGRO-GW varijantu:
   - EK-ADAPT-V2G za integraciju vozila koja nisu nativna u V2G mrežu
   - EK-ADAPT-BUS za retrofit postojećih autobusa
   - EK-ADAPT-CCS za premošćivanje CCS Combo protokola
   - EK-ADAPT-MCS za podršku Megawatt Charging Sistema

---

## 8. Analiza prethodnog stanja tehnike

### 8.1 Rezultati pretrage

```
KATEGORIJA: Unificirani RTOS za energetsku elektroniku
──────────────────────────────────────────────────────

1. Automotive AUTOSAR
   • Standardizovana arhitektura za automobilske ECU-ove
   • ALI: Monolitna, bez MPU izolacije, bez auto-restarta
   • NIJE primenljivo na ekosistem energetske elektronike

2. Industrijski PLC-ovi (Siemens, Rockwell)
   • Zajednički runtime preko familija uređaja
   • ALI: Centralizovani koordinator, bez distribuiranog konsenzusa
   • NIJE mikrokernel arhitektura

3. Mikrokernel RTOS (seL4, MINIX)
   • Izolacija grešaka, prosleđivanje poruka
   • ALI: Zahteva MMU, nije za energetsku elektroniku
   • NIJE dizajniran za koordinaciju između uređaja

4. EV punjački stack-ovi (ChargePoint, EVBox)
   • Proprietary firmware po tipu uređaja
   • Odvojene baze koda za BMS, punjač, gateway
   • BEZ unificiranog kernel pristupa
```

### 8.2 Procena novosti

```
NAŠA KOMBINACIJA JE NOVA:
─────────────────────────

1. MINIX-inspirisana MPU izolacija (iz EK-2026-006)
   +
2. Jedan kernel za punjač, BMS, robot, gateway
   +
3. Konfiguracija servisa bazirana na varijantama
   +
4. Međuuređajna ROJ koordinacija bez eksternog kontrolera
   +
5. Unificiran oporavak od grešaka na heterogenim uređajima

Nijedno prethodno stanje tehnike ne kombinuje svih pet elemenata.
```

---

## 9. Veza sa drugim prijavama

| Prijava | Veza |
|---------|------|
| EK-2026-001 | Modularna arhitektura - JEZGRO radi na svakom modulu |
| EK-2026-002 | Swap stanica - JEZGRO-ROB kontroliše robote |
| EK-2026-003 | Distribuirano rezerviranje - ROJ omogućava koordinaciju |
| EK-2026-006 | JEZGRO kernel - Ova prijava proširuje na ekosistem |
| EK-2026-007 | V2G kontrola - JEZGRO-GW implementira kontrolne algoritme |
| EK-2026-009 | Multi-vozilo swap - JEZGRO-BAT u standardizovanim baterijama |

---

## 10. Komercijalizacioni potencijal

```
TRŽIŠNI SEGMENTI:
─────────────────
1. EV punjačka infrastruktura
   • Unificiran firmware za punjač + gateway + BMS
   • Brži razvoj, niže održavanje

2. Stanice za zamenu baterija
   • Jedna baza koda za celu stanicu
   • Punjači + roboti + baterije + kontroler

3. Upravljanje flotom
   • Konzistentna dijagnostika na svim uređajima
   • Jedan program obuke za tehničare

4. Integracija trećih strana
   • EK-ADAPT uređaji koriste JEZGRO-GW
   • Licenciranje kernela drugim proizvođačima

OPCIJE LICENCIRANJA:
────────────────────
• Naknada po uređaju za JEZGRO varijante
• Enterprise licenca za ceo ekosistem
• Open-core model (kernel otvoren, premium servisi plaćeni)
```

---

## 11. Reference tehničke dokumentacije

| Dokument | Lokacija |
|----------|----------|
| JEZGRO porodica proizvoda | `tehnika/inzenjersko/sr/21-jezgro-product-family.md` |
| JEZGRO-BAT (Baterija) | `tehnika/inzenjersko/sr/22-jezgro-bat.md` |
| JEZGRO-ROB (Robot) | `tehnika/inzenjersko/sr/23-jezgro-rob.md` |
| JEZGRO-GW (Gateway) | `tehnika/inzenjersko/sr/24-jezgro-gw.md` |
| Adapter uređaji | `tehnika/inzenjersko/sr/25-adapter-devices.md` |
| Hardverske platforme | `tehnika/inzenjersko/sr/26-jezgro-hw-platforms.md` |
| Bazni JEZGRO Kernel | `tehnika/inzenjersko/sr/16-jezgro.md` |
| ROJ inteligencija | `tehnika/konceptualno/sr/02-roj-intelligence.md` |

---

## 12. Potpisi

**Pronalazač:**

```
Ime: Bojan Janjatović
Datum: 2026-01-05
Potpis: _________________________
```

**Svedok:**

```
Ime: Marija Janjatović
Datum: 2026-01-05
Potpis: _________________________

Pročitao/la sam i razumeo/la gore navedenu prijavu.
Nisam pronalazač ove tehnologije.
```

---

## Kontrola dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-05 | Bojan Janjatović | Inicijalna prijava |
