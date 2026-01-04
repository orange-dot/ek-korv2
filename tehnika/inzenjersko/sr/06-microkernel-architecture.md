# EK3 Arhitektura Inspirisana Mikrokernelom

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-010 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Uvod

### 1.1 Inspiracija: MINIX Mikrokernel

Arhitektura EK3 modularnog energetskog sistema crpi inspiraciju iz dizajna mikrokernel operativnih sistema, posebno iz principa uspostavljenih od strane MINIX-a. U tradicionalnim monolitnim OS kernelima, svi servisi rade u kernel prostoru sa punim privilegijama. Kvar u bilo kojoj komponenti može srušiti ceo sistem.

MINIX mikrokernel koristi drugačiji pristup:
- **Minimalni kernel**: Samo esencijalni servisi (IPC, raspoređivanje, niskonivoski hardverski pristup) rade u kernel modu
- **Servisi u korisničkom prostoru**: Fajl sistemi, drajveri i mreža rade kao izolovani procesi
- **Prosleđivanje poruka**: Komponente komuniciraju putem dobro definisanih protokola poruka
- **Izolacija grešaka**: Srušeni servis može se restartovati bez uticaja na kernel

### 1.2 Mapiranje na Energetsku Elektroniku

Primenjujemo ove principe na infrastrukturu punjenja EV:

| OS Koncept | Ekvivalent u Energetskoj Elektronici |
|------------|-------------------------------------|
| Kernel | Hardverska zaštitna kola (OCP, OVP, OTP) + osnovna LLC kontrola |
| Korisnički procesi | Praćenje zdravlja, termalno upravljanje, swarm koordinacija |
| IPC (Inter-Process Communication) | CAN-FD prosleđivanje poruka između modula |
| Izolacija procesa | Galvanska izolacija + odvojeni MCU po modulu |
| Graceful degradation | N-1 redundancija, široko raspoređivanje snage |
| Hot reload | Hot-swap zamena modula |

### 1.3 Zašto Mikrokernel za EV Punjače?

Tradicionalne arhitekture EV punjača pate od:

1. **Monolitni režimi kvara**: Jedinstvena tačka kvara ruši ceo punjač
2. **Gruba granularnost**: Moduli od 10-50 kW znače 10-33% gubitka kapaciteta po kvaru
3. **Čvrsta sprega**: Komponente se ne mogu nezavisno ažurirati ili zameniti
4. **Ograničena skalabilnost**: Različiti dizajni potrebni za različite nivoe snage

Mikrokernel pristup pruža:

1. **Izolacija grešaka**: Kvar modula utiče samo na 0.4% kapaciteta (3.3 kW / 800 kW)
2. **Nezavisna ažuriranja**: Firmware se može ažurirati po modulu bez gašenja sistema
3. **Horizontalno skaliranje**: Ista arhitektura modula od 3 kW do 3 MW
4. **Autonomni rad**: Moduli se samo-koordiniraju bez centralnog kontrolera

---

## 2. Slojevita Arhitektura

EK3 sistem implementira četvoroslojnu arhitekturu analognu OS dizajnu:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SLOJ 3: APLIKACIJA                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   OCPP      │  │  Fleet AI   │  │   Cloud     │  │  Operator   │    │
│  │  Gateway    │  │  Optimizer  │  │  Telemetry  │  │    UI       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                        SLOJ 2: SERVISI                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Health    │  │   Thermal   │  │   Swarm     │  │   Audit     │    │
│  │  Monitor    │  │  Manager    │  │  Coord.     │  │   Logger    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                        SLOJ 1: KERNEL                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │   │
│  │  │   OCP     │  │   OVP     │  │   OTP     │  │   GFI     │    │   │
│  │  │ Hardver   │  │ Hardver   │  │ Hardver   │  │ Hardver   │    │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │   │
│  │  ┌───────────────────────────────────────────────────────────┐ │   │
│  │  │              LLC Rezonantni Kontroler                     │ │   │
│  │  │         (PWM generisanje, strujne/naponske petlje)        │ │   │
│  │  └───────────────────────────────────────────────────────────┘ │   │
│  │  ┌───────────────────────────────────────────────────────────┐ │   │
│  │  │              CAN-FD Drajver (5 Mbps)                      │ │   │
│  │  │         (TX/RX poruka, filtriranje, arbitraža)            │ │   │
│  │  └───────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                        SLOJ 0: HAL                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  GPIO │ ADC │ DAC │ Timer │ DMA │ SPI │ I2C │ UART │ FLASH     │   │
│  │                   STM32G474 Periferije                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │     SiC MOSFET-i │ Gate Drajveri │ Magnetika │ Kondenzatori    │   │
│  │                   Hardver Energetskog Stepena                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Sloj 0: Sloj Apstrakcije Hardvera (HAL)

HAL pruža hardverski nezavisne interfejse ka:

**MCU Periferije (STM32G474):**
- Tajmeri visoke rezolucije (HRTIM) za PWM generisanje na 400 kHz
- ADC sa DMA za kontinualno uzorkovanje struje/napona na 10 kHz
- CAN-FD periferija sa hardverskim filtriranjem
- Flash memorijski interfejs za konfiguraciju i logovanje
- Kriptografski akcelerator (AES, CMAC, TRNG)

**Hardver Energetskog Stepena:**
- Wolfspeed C3M0016120K SiC MOSFET-i (1200V, 16 mΩ)
- Silicon Labs Si8271 izolovani gate drajveri
- LLC transformator i rezonantni tank
- DC link kondenzatori i izlazni filter

**HAL Odgovornosti:**
```
┌─────────────────────────────────────────────────────┐
│ HAL Funkcije                                        │
├─────────────────────────────────────────────────────┤
│ • Inicijalizacija periferija u poznato stanje      │
│ • Apstrakcija registara (čitanje/pisanje)          │
│ • Obrada vektora prekida                           │
│ • Upravljanje DMA transferima                      │
│ • Apstrakcija hardverskih razlika između revizija  │
└─────────────────────────────────────────────────────┘
```

### 2.2 Sloj 1: Kernel Sloj

Kernel sloj sadrži **bezbednosno-kritične, real-time** funkcije koje ne mogu tolerisati kašnjenja ili kvarove. Ovo je analogno minimalnom MINIX kernelu.

**Šta pripada kernelu:**

| Komponenta | Zahtev Latencije | Kritičnost |
|------------|------------------|------------|
| Zaštita od Prekostruje (OCP) | <1 µs | Bezbednosno-kritična |
| Zaštita od Prenapona (OVP) | <1 µs | Bezbednosno-kritična |
| Zaštita od Pregrevanja (OTP) | <10 ms | Bezbednosno-kritična |
| Prekid Kvara Uzemljenja (GFI) | <10 ms | Bezbednosno-kritična |
| LLC PWM Kontrola | <2.5 µs (400 kHz) | Isporuka snage |
| Regulacija Struje/Napona | <100 µs | Kvalitet snage |
| CAN-FD Drajver | <1 ms | Komunikacija |

**Principi Dizajna Kernela:**

1. **Minimalna veličina koda**: <32 KB Flash footprint
2. **Deterministički tajming**: Sve putanje imaju ograničeno maksimalno vreme izvršavanja (WCET)
3. **Bez dinamičke alokacije**: Sva memorija statički alocirana u vreme kompilacije
4. **Hardverski podržana zaštita**: OCP/OVP/OTP koriste komparator + hardverski trip, ne softver
5. **Fail-safe podrazumevane vrednosti**: Svako neočekivano stanje pokreće bezbedno gašenje

**Hardversko Zaštitno Kolo:**

```
                    ┌─────────────────────────────────┐
                    │     Hardverski Zaštitni Blok    │
                    │       (Ne može se zaobići)      │
                    │                                  │
   Vout ───────────►│ Komparator ──► OVP Trip ────────┼──► Gate Driver
                    │     ^                           │     Disable
   Iout ───────────►│ Komparator ──► OCP Trip ────────┤
                    │     ^                           │
   Temp ───────────►│ Komparator ──► OTP Trip ────────┤
                    │     ^                           │
                    │  Pragovi podešeni razdelnikom   │
                    │  napona (ne firmware-om!)       │
                    └─────────────────────────────────┘
```

### 2.3 Sloj 2: Sloj Servisa

Servisi rade kao nezavisni taskovi sa nižim prioritetom od kernel funkcija. Oni su analogni procesima u korisničkom prostoru u MINIX-u.

**Servisni Taskovi:**

| Servis | Stopa Ažuriranja | Prioritet | Opis |
|--------|------------------|-----------|------|
| Health Monitor | 10 Hz | Srednji | Dijagnostika komponenti, praćenje MTBF |
| Thermal Manager | 100 Hz | Srednje-Visok | Kontrola ventilatora, derating snage |
| Swarm Coordinator | 10 Hz | Srednji | Izbor lidera, balansiranje opterećenja |
| Audit Logger | Pozadinski | Nizak | Logovanje događaja u flash |
| Diagnostics | Na zahtev | Najniži | Rutine samo-testiranja |

**Izolacija Servisa:**

Svaki servis:
- Radi u svom RTOS tasku sa dedikovanim stekom
- Komunicira sa kernelom samo preko redova poruka
- Ne može direktno pristupati hardveru (mora ići kroz HAL)
- Može se nezavisno restartovati ako se sruši
- Ima watchdog timeout za detekciju deadlock-a

```
┌─────────────────────────────────────────────────────────────────┐
│                     Model Izolacije Servisa                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Health     │    │   Thermal    │    │    Swarm     │       │
│  │   Monitor    │    │   Manager    │    │    Coord.    │       │
│  │  ┌────────┐  │    │  ┌────────┐  │    │  ┌────────┐  │       │
│  │  │ Stack  │  │    │  │ Stack  │  │    │  │ Stack  │  │       │
│  │  │ 2KB    │  │    │  │ 4KB    │  │    │  │ 4KB    │  │       │
│  │  └────────┘  │    │  └────────┘  │    │  └────────┘  │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Red Poruka (FreeRTOS Queue)                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Kernel Sloj                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Sloj 3: Aplikacioni Sloj

Aplikacioni sloj pruža eksterne interfejse i orkestraciju visokog nivoa:

**Komponente:**
- **OCPP Gateway**: Obrađuje protokol stanice za punjenje (OCPP 1.6J/2.0.1)
- **Fleet AI Optimizer**: Mašinsko učenje za prediktivno održavanje
- **Cloud Telemetry**: Šalje operativne podatke na centralni monitoring
- **Operator UI**: Lokalni touchscreen interfejs (ako postoji)

**Karakteristike Aplikacionog Sloja:**
- Radi na Station Controller-u (odvojeno od EK3 modula)
- Komunicira sa modulima preko Ethernet → CAN-FD gateway-a
- Nije real-time, može tolerisati latencije od 100ms+
- Bez stanja gde je moguće (moduli održavaju svoje stanje)

---

## 3. Granice Poverenja

Granice poverenja definišu šta komponente mogu raditi i čemu moraju verovati.

### 3.1 Definicije Nivoa Poverenja

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NIVOI POVERENJA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  NIVO 3 ─────────────────────────────────────────────────────────────   │
│  │ Eksterne Komande (Cloud, Fleet Management, OCPP)                     │
│  │ • Autentifikovane putem API ključeva, OAuth2, sertifikata           │
│  │ • Ograničena stopa, logovane, podležu reviziji                      │
│  │ • Ne mogu direktno komandovati energetskim stepenom                 │
│  │                                                                       │
│  NIVO 2 ─────────────────────────────────────────────────────────────   │
│  │ Station Controller                                                    │
│  │ • Autentifikovan putem mTLS sertifikata                             │
│  │ • Može postavljati ciljeve snage, startovati/stopirati punjenje     │
│  │ • Ne može zaobići bezbednosne limite                                │
│  │                                                                       │
│  NIVO 1 ─────────────────────────────────────────────────────────────   │
│  │ Firmware Modula (potpisan, verifikovan)                              │
│  │ • Secure boot obavezan                                               │
│  │ • Može kontrolisati energetski stepen unutar hardverskih limita     │
│  │ • Pun pristup periferijama                                          │
│  │                                                                       │
│  NIVO 0 ─────────────────────────────────────────────────────────────   │
│  │ Hardverska Zaštita (ne može se zaobići)                              │
│  │ • Analogni komparatori sa fiksnim pragovima                         │
│  │ • Ne može se prepisati nikakvim softverom                           │
│  │ • Predstavlja apsolutnu bezbednosnu granicu                         │
│  │                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Mogućnosti Nivoa Poverenja

| Nivo | Može Komandovati | Ne Može | Autentifikator |
|------|------------------|---------|----------------|
| 0 | Trenutno gašenje | Ništa drugo | Hardver (otpornici) |
| 1 | Energetski stepen, sve periferije | Zaobići HW zaštitu | Secure boot potpis |
| 2 | Ciljeve snage, raspoređivanje | Postaviti nebezbedne ciljeve | mTLS sertifikat |
| 3 | Orkestraciju visokog nivoa | Direktne komande snage | API ključ + RBAC |

### 3.3 Prelasci Granica Poverenja

Kada zahtev prelazi granicu poverenja, vrši se validacija:

```
┌─────────────────────────────────────────────────────────────────┐
│            Prelazak Granice Poverenja: Cloud → Modul            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cloud (Nivo 3)                                                  │
│       │                                                          │
│       │ "Postavi modul 42 na 3.0 kW"                            │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────┐                                    │
│  │  Station Controller     │                                    │
│  │  Validira:              │                                    │
│  │  • API ključ validan?   │ ◄─── Nivo 3→2 granica              │
│  │  • Limit stope OK?      │                                    │
│  │  • Modul postoji?       │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│              │ CAN-FD: POWER_COMMAND(module=42, target=3000W)   │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │  Firmware Modula        │                                    │
│  │  Validira:              │                                    │
│  │  • CMAC potpis?         │ ◄─── Nivo 2→1 granica              │
│  │  • Sekventni broj?      │                                    │
│  │  • Cilj u spec?         │                                    │
│  └───────────┬─────────────┘                                    │
│              │                                                   │
│              │ Postavi PWM duty cycle                           │
│              │                                                   │
│              ▼                                                   │
│  ┌─────────────────────────┐                                    │
│  │  Hardverska Zaštita     │                                    │
│  │  Nameće:                │ ◄─── Nivo 1→0 granica              │
│  │  • I < 4.0A (trip)      │      (ne može se pregovarati)      │
│  │  • V < 920V (trip)      │                                    │
│  │  • T < 105°C (trip)     │                                    │
│  └─────────────────────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Semantika Prosleđivanja Poruka

Međumodulska komunikacija koristi CAN-FD kao okosnicu prosleđivanja poruka, analogno IPC-u u mikrokernel operativnim sistemima.

### 4.1 CAN-FD kao IPC Mehanizam

| OS IPC Koncept | CAN-FD Implementacija |
|----------------|----------------------|
| Slanje poruke | CAN TX sa proširenim ID |
| Prijem poruke | CAN RX sa hardverskim filtriranjem |
| Sinhroni poziv | Zahtev + čekanje odgovora |
| Asinhroni događaj | Publish bez ACK |
| Broadcast | CAN ID bez specifičnog cilja |
| Multicast | CAN ID sa članstvom u grupi |

### 4.2 Tipovi Poruka

**Tip 1: Zahtev-Odgovor**

Koristi se za komande koje zahtevaju potvrdu.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Šablon Zahtev-Odgovor                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Station Controller                              Modul #42       │
│         │                                            │           │
│         │ ─────── POWER_REQ(target=3000W) ─────────► │           │
│         │         ID: 0x10200042                     │           │
│         │         [timeout: 100ms]                   │           │
│         │                                            │           │
│         │ ◄─────── POWER_ACK(actual=2980W) ──────── │           │
│         │          ID: 0x18200042                    │           │
│         │          [u okviru timeout-a]              │           │
│         │                                            │           │
│  Ako nema ACK u okviru timeout-a:                    │           │
│         │ ─────── Retry (max 3) ─────────────────►  │           │
│         │                                            │           │
└─────────────────────────────────────────────────────────────────┘
```

**Tip 2: Publish (Fire-and-Forget)**

Koristi se za periodične broadcast-ove statusa.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Publish Šablon                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Modul #42 broadcast-uje svake 1 sekunde:                        │
│                                                                  │
│  HEARTBEAT(                                                      │
│    id: 42,                                                       │
│    state: ACTIVE,                                                │
│    power: 2980W,                                                 │
│    temp: 62°C,                                                   │
│    health: 0x00                                                  │
│  )                                                               │
│  ID: 0x10100042                                                  │
│                                                                  │
│  Svi slušaoci (Station, drugi moduli) primaju                    │
│  ACK se ne očekuje niti zahteva                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Tip 3: Događaj (Hitna Notifikacija)**

Koristi se za kvarove i promene stanja koje zahtevaju hitnu pažnju.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Šablon Događaja                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Modul #42 detektuje pregrevanje:                                │
│                                                                  │
│  FAULT_ALERT(                                                    │
│    id: 42,                                                       │
│    fault_code: OTP_WARNING,                                      │
│    severity: 2,                                                  │
│    value: 98°C,                                                  │
│    timestamp: 0x12345678                                         │
│  )                                                               │
│  ID: 0x107FF042  (visok prioritet, blizu max ID)                │
│                                                                  │
│  Station Controller:                                             │
│    → Loguje događaj                                              │
│    → Prilagođava distribuciju opterećenja                        │
│    → Upozorava operatora ako severity ≥ 3                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Struktura Proširenog CAN-FD ID-a

29-bitni prošireni CAN ID kodira tip poruke, izvor i odredište:

```
┌─────────────────────────────────────────────────────────────────┐
│                   29-bitni Prošireni CAN ID                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Bit:  28  27  26  25  24  23  22  21  20  19  18  17  16  15   │
│       ├───┴───┴───┴───┼───┴───┴───┴───┼───┴───┴───┴───┴───┴───┤ │
│       │   Prioritet   │   Tip Poruke  │    ID Izvornog Modula  │ │
│       │   (4 bita)    │   (4 bita)    │      (12 bita)         │ │
│                                                                  │
│  Bit:  14  13  12  11  10   9   8   7   6   5   4   3   2   1  0│
│       ├───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┤ │
│       │                  ID Ciljnog Modula                      │ │
│       │                    (12 bita)                            │ │
│       │           0xFFF = broadcast svima                       │ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Nivoi Prioriteta:**

| Prioritet | Vrednost | Slučaj Upotrebe |
|-----------|----------|-----------------|
| KRITIČAN | 0x0 | Upozorenja o kvaru, hitno zaustavljanje |
| VISOK | 0x1 | Komande snage, sinhronizacija |
| SREDNJI | 0x2 | Upiti statusa, termalno |
| NIZAK | 0x3 | Dijagnostika, logovanje |
| POZADINSKI | 0xF | Chunk-ovi ažuriranja firmware-a |

**Tipovi Poruka:**

| Tip | Vrednost | Opis |
|-----|----------|------|
| SYNC | 0x0 | Vremenska sinhronizacija |
| ELECTION | 0x1 | Izbor lidera (Raft) |
| HEARTBEAT | 0x2 | Periodični status |
| POWER_CMD | 0x3 | Komande ciljne snage |
| THERMAL | 0x4 | Deljenje temperature |
| FAULT | 0x7 | Notifikacije o kvaru |
| DIAG | 0x8 | Dijagnostika |
| FW_UPDATE | 0xF | Ažuriranje firmware-a |

---

## 5. Dizajn Minimalnog Kernela

### 5.1 Mapiranje Kernel vs Korisnički Prostor

Prateći principe mikrokernela, minimizujemo šta radi u "kernelu" (bezbednosno-kritično, real-time) naspram "korisničkog prostora" (servisi koji mogu tolerisati kašnjenja).

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kernel (Bezbednosno-Kritično)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MORA biti u kernelu:                                            │
│  ├── Okidači hardverske zaštite (OCP, OVP, OTP, GFI)            │
│  ├── LLC rezonantna kontrolna petlja (400 kHz)                  │
│  ├── Kontrola povratne sprege struje/napona (10 kHz)            │
│  ├── CAN-FD drajver za TX/RX poruka                             │
│  ├── Osvežavanje watchdog-a                                      │
│  └── Sekvenca bezbednog gašenja                                  │
│                                                                  │
│  Veličina koda: ~20 KB                                           │
│  Upotreba RAM: ~8 KB                                             │
│  WCET: <100 µs za sve putanje                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Korisnički Prostor (Servisi)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  MOŽE biti u korisničkom prostoru:                               │
│  ├── Praćenje zdravlja i praćenje MTBF                          │
│  ├── Termalno upravljanje i kontrola ventilatora                │
│  ├── Swarm koordinacija (izbor lidera, balansiranje opterećenja)│
│  ├── Revizijsko logovanje u flash                               │
│  ├── Dijagnostika i samo-testiranje                             │
│  ├── Upravljanje konfiguracijom                                  │
│  ├── Prijemnik ažuriranja firmware-a                            │
│  └── Statistika i telemetrija                                    │
│                                                                  │
│  Veličina koda: ~80 KB                                           │
│  Upotreba RAM: ~32 KB                                            │
│  Tolerancija latencije: 10-1000 ms                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Invarijante Kernela

Kernel održava ove invarijante koje se NE MOGU prekršiti:

1. **Limiti snage**: Izlaz nikada ne prelazi 3.3 kW (hardverski nametnuto)
2. **Opseg napona**: 200-920 VDC izlaz (trip hardverskog komparatora)
3. **Limit struje**: <4.0A kontinualno (trip hardverskog komparatora)
4. **Temperatura**: <105°C spoja (hardversko termalno gašenje)
5. **Vreme odziva**: Odziv na kvar <10 µs (hardverski trip)
6. **Watchdog**: MCU se resetuje ako kernel petlja zastane >100ms

### 5.3 Mogućnost Restarta Servisa

Ako se servis u korisničkom prostoru sruši (stack overflow, deadlock, itd.), sistem nastavlja da radi:

```
┌─────────────────────────────────────────────────────────────────┐
│                Oporavak od Pada Servisa                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Normalan rad:                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │  ← Svi servisi rade        │
│  │   OK    │ │   OK    │ │   OK    │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
│                                                                  │
│  Thermal servis se srušio (stack overflow):                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │                            │
│  │   OK    │ │ SRUŠEN  │ │   OK    │                            │
│  └─────────┘ └────┬────┘ └─────────┘                            │
│                   │                                              │
│                   ▼                                              │
│         Supervisor detektuje watchdog timeout                    │
│                   │                                              │
│                   ▼                                              │
│         Task obrisan, stack oslobođen                            │
│                   │                                              │
│                   ▼                                              │
│         Task ponovo kreiran sa svežim stekom                     │
│                   │                                              │
│                   ▼                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                            │
│  │ Health  │ │ Thermal │ │ Swarm   │  ← Servis obnovljen        │
│  │   OK    │ │   OK    │ │   OK    │                            │
│  └─────────┘ └─────────┘ └─────────┘                            │
│                                                                  │
│  Tokom oporavka (~100ms):                                        │
│  • Isporuka snage nastavlja (kernel obrađuje)                   │
│  • Termalna zaštita preko hardvera (kernel)                     │
│  • Samo termalno logovanje/optimizacija privremeno izgubljeni   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Mapiranje 3PAR Storage Arhitekture

EK3 rack sistem pozajmljuje koncepte od 3PAR storage nizova, koji takođe koriste distribuiranu, tolerantnu na kvarove arhitekturu.

### 6.1 Mapiranje Koncepata

| 3PAR Koncept | EK3 Implementacija |
|--------------|-------------------|
| Wide striping | Snaga distribuirana preko SVIH modula |
| Thin provisioning | Moduli aktivirani na zahtev |
| Persistent cache | Kondenzatorska banka za ride-through |
| RAID-slična redundancija | N-1 redundancija modula |
| Online sparing | Hot-swap bez gašenja |
| Automatsko balansiranje opterećenja | Droop kontrola izjednačava struju |

### 6.2 Wide Striping za Snagu

U tradicionalnim punjačima, moduli su grupisani u "stringove" koji svi moraju funkcionisati:

```
Tradicionalno (String Arhitektura):
┌─────────────────────────────────────────────────────────────────┐
│  String 1: [M1]-[M2]-[M3]-[M4]  → 40 kW izlaz                   │
│  String 2: [M5]-[M6]-[M7]-[M8]  → 40 kW izlaz                   │
│                                                                  │
│  Ako M3 otkaže: String 1 = 0 kW (ceo string pao)               │
│  Uticaj: 50% gubitak kapaciteta                                 │
└─────────────────────────────────────────────────────────────────┘

EK3 (Wide Striping):
┌─────────────────────────────────────────────────────────────────┐
│  Svi moduli paralelno na DC bus:                                │
│  [M1][M2][M3][M4][M5][M6][M7][M8][M9]...[M84] → 252 kW          │
│                                                                  │
│  Ako M3 otkaže: 251 kW (M3 izolovan, ostali kompenzuju)         │
│  Uticaj: 0.4% gubitak kapaciteta                                │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Distribuirana Rezerva

Nema dedikovanog "spare" modula. Umesto toga, svi moduli rade malo ispod kapaciteta i apsorbuju opterećenje kada vršnjaci otkažu:

```
┌─────────────────────────────────────────────────────────────────┐
│              Model Distribuirane Rezerve                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Normalan rad (84 modula, 200 kW potražnja):                     │
│  Svaki modul: 200 kW / 84 = 2.38 kW (72% kapaciteta od 3.3 kW)  │
│                                                                  │
│  Nakon 1 kvara (83 modula):                                      │
│  Svaki modul: 200 kW / 83 = 2.41 kW (73% kapaciteta)            │
│  → Zanemarljiva promena po modulu                                │
│                                                                  │
│  Nakon 10 kvarova (74 modula):                                   │
│  Svaki modul: 200 kW / 74 = 2.70 kW (82% kapaciteta)            │
│  → Još uvek udobna margina                                       │
│                                                                  │
│  Kritični prag (61 modul):                                       │
│  Svaki modul: 200 kW / 61 = 3.28 kW (99% kapaciteta)            │
│  → Upozorenje: Zakazati održavanje                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/05-swarm-intelligence.md` | Protokoli swarm koordinacije |
| `tehnika/11-security-model.md` | Model bezbednosti i poverenja |
| `tehnika/12-audit-logging.md` | Audit evidentiranje i forenzika |
| `tehnika/13-hardware-security.md` | Hardverska bezbednost i HSM |
| `tehnika/14-firmware-architecture.md` | RTOS i dizajn firmware-a |
| `tehnika/16-custom-rack-system.md` | Custom rack sa mikrokernel backplane-om |
| `tehnika/17-jezgro.md` | JEZGRO mikrokernel OS implementacija |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | Patent za JEZGRO |

---

## 8. JEZGRO OS Integracija

Ova sekcija opisuje kako se apstraktna mikrokernel arhitektura implementira kroz JEZGRO operativni sistem realnog vremena.

### 8.1 JEZGRO kao EK3 Mikrokernel Implementacija

JEZGRO je prilagodjeni mikrokernel RTOS koji implementira principe opisane u ovom dokumentu. Donosi pouzdanost u stilu MINIX-a (izolacija gresaka, prosledjivanje poruka, automatski restart servisa) na mikrokontrolere sa ogranicenim resursima koristeci MPU umesto MMU.

> **Vidi:** `tehnika/17-jezgro.md` (EK-TECH-017) za kompletne detalje implementacije.

### 8.2 Mapiranje Slojeva

| Ovaj Dokument (Apstraktno) | JEZGRO Sloj | Implementacija |
|----------------------------|-------------|----------------|
| Sloj 0: HAL | Hardverski drajveri | STM32 HAL + custom drajveri |
| Sloj 1: Kernel (OCP/OVP/OTP) | Sloj 0: Privilegovani Drajveri | LLC_CONTROL, SAFETY_MONITOR |
| Sloj 1: Kernel (LLC kontrola) | Sloj 1: Mikrokernel | Scheduler, MPU Manager, IPC |
| Sloj 2: Servisi | Sloj 2-3: Kernel + Korisnicki Servisi | Server za Reinkarnaciju + izolovani servisi |
| Sloj 3: Aplikacija | Eksterno (Stanicni Kontroler) | OCPP Gateway, Fleet AI |

### 8.3 Implementacija Trust Granica putem MPU

Nivoi poverenja definisani u Sekciji 3 mapiraju se na JEZGRO MPU regione:

```
Nivo Poverenja 0 (Hardverska Zastita)
    ↓
    Neobilazivi analogni komparatori
    (OCP, OVP, OTP - nisu softverski kontrolisani)

Nivo Poverenja 1 (Firmware Modula)
    ↓
    MPU Regioni 0-2: Privilegovan pristup
    - Region 0: Flash (kod, samo citanje)
    - Region 1: Kernel podaci (scheduler, ISR stekovi)
    - Region 2: LLC Kontrola (privilegovani drajver)

Nivo Poverenja 2 (Komande Stanicnog Kontrolera)
    ↓
    CAN-FD poruke sa CMAC autentifikacijom
    Validirane od strane CAN_HANDLER servisa pre IPC rutiranja

Nivo Poverenja 3 (Eksterne/Cloud Komande)
    ↓
    Stanicni Kontroler filtrira i validira
    Rate-limited, evidentirano, revizibilno
```

### 8.4 Prosledjivanje Poruka: CAN-FD ↔ JEZGRO IPC

CAN-FD format poruka (Sekcija 4.3) mapira se na JEZGRO IPC poruke:

```
CAN-FD Prosireni ID (29 bita)
┌───────────┬───────────┬─────────────────┬──────────────┐
│ Prioritet │ Tip Poruke│   ID Izvora     │   ID Dest    │
│  (4 bita) │  (4 bita) │   (12 bita)     │   (9 bita)   │
└───────────┴───────────┴─────────────────┴──────────────┘
      ↓           ↓             ↓                ↓
┌───────────┬───────────┬─────────────────┬──────────────┐
│msg.flags  │ msg.type  │    msg.src      │   msg.dst    │
│ prioritet │           │ (ID servisa)    │ (ID servisa) │
└───────────┴───────────┴─────────────────┴──────────────┘
            JEZGRO IPC Polja Poruke
```

### 8.5 Server za Reinkarnaciju i Garancije iz Sekcije 5

Sekcija 5 (Dizajn Minimalnog Kernela) definise invarijante kernela koje JEZGRO sprovodi putem Servera za Reinkarnaciju:

| Invarijanta | JEZGRO Implementacija |
|-------------|----------------------|
| Limiti snage (max 3.3 kW) | LLC_CONTROL sprovodi u kernel prostoru; hardverski komparator backup |
| Opseg napona (200-920 VDC) | Hardverski OVP trip + LLC_CONTROL softverski limit |
| Limit struje (<4.0 A) | Hardverski OCP trip + LLC_CONTROL softverski limit |
| Temperatura (<105°C) | Hardverski OTP trip + THERMAL_MGR pracenje |
| Odziv na gresku (<10 µs) | Hardverski trip; JEZGRO upravlja restartom |
| Watchdog (100 ms) | Watchdog po servisu putem Servera za Reinkarnaciju |

---

## Dodatak A: Poređenje sa Tradicionalnim Arhitekturama

| Aspekt | Monolitni Punjač | Modularni (Grubi) | EK3 (Mikrokernel) |
|--------|------------------|-------------------|-------------------|
| Veličina modula | N/A (jedna jedinica) | 10-50 kW | 3.3 kW |
| Uticaj kvara | 100% pao | 10-50% pao | 0.4% pao |
| Vreme popravke | 2-14 dana | 1-4 sata | 60 sekundi |
| Skaliranje | Kupi novu jedinicu | Ograničeno | Linearno |
| Ažuriranje firmware-a | Potpuno gašenje | Po modulu | Po modulu, rolling |
| Centralni kontroler | Obavezan | Obavezan | Opcioni |

---

## Dodatak B: Pojmovnik

| Termin | Definicija |
|--------|------------|
| HAL | Hardware Abstraction Layer - izoluje firmware od specifičnosti hardvera |
| IPC | Inter-Process Communication - kako komponente razmenjuju poruke |
| WCET | Worst-Case Execution Time - maksimalno vreme koje putanja koda može trajati |
| Kernel | Minimalni, bezbednosno-kritični kod koji ne sme otkazati |
| Servis | Funkcionalnost višeg nivoa koja može tolerisati kašnjenja/restarte |
| Granica poverenja | Interfejs gde se menja nivo privilegija |
| Wide striping | Distribucija opterećenja preko svih dostupnih resursa |
| Droop kontrola | Autonomno deljenje opterećenja preko karakteristike napon-struja |
| JEZGRO | Srpski za "kernel"; MINIX-inspirisani RTOS za EK3 |
| Server za Reinkarnaciju | MINIX koncept za automatski restart servisa |

---

## Kontrola Dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-03 | Elektrokombinacija Inzenjering | Inicijalni dokument |
| 1.1 | 2026-01-04 | Elektrokombinacija Inzenjering | Dodata JEZGRO integracija, azurirane reference |
