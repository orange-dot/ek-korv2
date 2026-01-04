# Otkrivanje Izuma: JEZGRO Mikrokernel Operativni Sistem

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Otkrivanja | EK-2026-006 |
| Datum Otkrivanja | 2026-01-04 |
| Pronalazac(i) | Bojan Janjatovic |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilica 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 2026-01-04 |
| Svedoci | - |

### Poreklo Izuma
Inspiracija: MINIX mikrokernel operativni sistem od Andrew Tanenbauma. Spoznaja da principi mikrokernela (izolacija gresaka, prosledjivanje poruka, automatski restart servisa) mogu revolucionisati pouzdanost u energetskoj elektronici - primena OS koncepata na ugradene sisteme u realnom vremenu.

---

## 1. Naslov Izuma

**JEZGRO: Mikrokernel Realnog Vremena Otporan na Greske za Energetsku Elektroniku sa MPU Izolacijom Servisa**

Alternativni naslovi:
- MINIX-Inspirisan Mikrokernel za Ugradene Energetske Sisteme
- Samoizlecujuci Kernel za EV Module Punjenja
- Arhitektura Servera za Reinkarnaciju u Firmveru Energetske Elektronike

---

## 2. Tehnicko Polje

```
- Ugradeni Operativni Sistemi
- Sistemi Realnog Vremena
- Kontrola Energetske Elektronike
- Racunarstvo Otporno na Greske
- Mikrokernel Arhitektura
```

---

## 3. Opis Problema

### 3.1 Trenutno Stanje Tehnike

```
Trenutne opcije ugradenih RTOS-a za energetsku elektroniku:

OPCIJA A: Monolitni RTOS (FreeRTOS, uC/OS)
- Svi taskovi dele isti memorijski prostor
- Jedan bag moze srusiti ceo sistem
- Nema izolacije gresaka izmedju komponenti
- Rucni oporavak od kvarova

OPCIJA B: Puni Mikrokernel (seL4, MINIX)
- Zahteva MMU (Memory Management Unit)
- Nije dostupan na isplativim MCU-ovima
- Visoka potrosnja memorije (200KB+)
- Nije dizajniran za tvrdo realno vreme

OPCIJA C: Bare Metal
- Nikakva izolacija
- Ceo sistem ranjiv na pojedinacnu gresku
- Kompleksno rucno upravljanje stanjem
- Nema standardizovanog IPC-a
```

### 3.2 Problemi sa Trenutnim Pristupima

```
1. NEMA IZOLACIJE GRESAKA NA MCU-ima
   - STM32, NXP, TI MCU-ovi imaju MPU, ne MMU
   - Postojeci RTOS-ovi ne koriste MPU pravilno
   - Pad jednog servisa = reset celog sistema

2. NEMA AUTOMATSKOG OPORAVKA
   - Watchdog resetuje ceo sistem
   - Ne moze restartovati pojedinacne servise
   - Gubitak stanja tokom oporavka
   - Produzen zastoj

3. MONOLITNA ARHITEKTURA
   - Sav kod radi na istom nivou privilegija
   - Buffer overflow u logovanju = pad power stage-a
   - Azuriranja zahtevaju zamenu celog firmvera
   - Testiranje zahteva ceo sistem

4. PROSLEDJIVANJE PORUKA ODSUTNO
   - Direktni pozivi funkcija stvaraju cvrstu spregu
   - Tesko izolovanje i testiranje komponenti
   - Race uslovi izmedju taskova
   - Nema cistih granica interfejsa
```

---

## 4. Predlozeno Resenje

### 4.1 Sustina Inovacije

**JEZGRO**: Mikrokernel specificno dizajniran za energetsku elektroniku koji donosi MINIX principe pouzdanosti na mikrokontrolere sa ogranicenim resursima koristeci MPU umesto MMU.

Ime "JEZGRO" odrazava i minimalnu filozofiju dizajna i srpsko poreklo sistema.

### 4.2 Kljucne Komponente

```
+-------------------------------------------------------------+
|                     JEZGRO ARHITEKTURA                      |
+-------------------------------------------------------------+
|   KORISNICKI SERVISI (Neprivilegovani, MPU-izolovani)       |
|   +---------+ +---------+ +---------+ +---------+           |
|   |Termalni | |  Swarm  | |  Audit  | |  OCPP   |           |
|   | Menadzer| |  Koord. | |  Logger | | Gateway |           |
|   +----+----+ +----+----+ +----+----+ +----+----+           |
|        +----------+-----------+-----------+                  |
|                         | IPC                                |
+--------------------------+----------------------------------+
|   JEZGRO KERNEL (Privilegovan, Minimalan)       ~8 KB       |
|   +----------+ +----------+ +----------+ +----------------+ |
|   |Scheduler | |   MPU    | |   IPC    | | Server za      | |
|   |  (EDF)   | | Menadzer | |   Red    | | Reinkarnaciju  | |
|   +----------+ +----------+ +----------+ +----------------+ |
+-------------------------------------------------------------+
|   PRIVILEGOVANI DRAJVERI (Kernel ekstenzije)                |
|   +----------+ +----------+ +----------+                    |
|   |   LLC    | |  CAN-FD  | |   ADC    |                    |
|   | Kontrola | |  Drajver | |  Drajver |                    |
|   +----------+ +----------+ +----------+                    |
+-------------------------------------------------------------+
|   HARDVER: STM32G474 / Slican Cortex-M sa MPU               |
+-------------------------------------------------------------+
```

### 4.3 Nove Tehnicke Karakteristike

#### 4.3.1 MPU Izolacija Gresaka (Bez MMU)

```c
// Svaki servis ogranicen na svoj MPU region
typedef struct {
    uint8_t  region_id;      // MPU region 0-7
    void*    base_addr;      // Bazna adresa memorije
    size_t   size;           // Velicina regiona (stepen dvojke)
    uint32_t permissions;    // R/W/X zastavice
} jezgro_region_t;

// Servis ne moze pristupiti memoriji drugog servisa
// Hardverski izuzetak ako se granica prekrsi
```

#### 4.3.2 Server za Reinkarnaciju (Auto-Restart)

```c
// Inspirisano MINIX serverom za reinkarnaciju
// Pali servisi automatski se restartuju

void reincarnation_task(void) {
    while (1) {
        for (int i = 0; i < NUM_SERVICES; i++) {
            if (service_watchdog_expired(i) ||
                service_state[i] == SVC_STATE_FAULTED) {

                // Zabelezi gresku
                audit_log(FAULT_SERVICE_CRASH, i, get_fault_info(i));

                // Obavesti druge servise
                jezgro_broadcast(MSG_SERVICE_DOWN, i);

                // Restartuj servis
                service_restart(i);  // Restart BEZ reseta sistema!

                // Obavesti da je oporavak zavrsen
                jezgro_broadcast(MSG_SERVICE_UP, i);
            }
        }
        jezgro_sleep(10); // Provera svakih 10ms
    }
}
```

#### 4.3.3 Zero-Copy Prosledjivanje Poruka IPC

```c
// MINIX-stil sinhrono prosledjivanje poruka
// Zero-copy koriscenjem deljenog memorijskog bazena

typedef struct {
    uint16_t src;           // ID izvornog servisa
    uint16_t dst;           // ID odredisnog servisa
    uint16_t type;          // Tip poruke
    uint16_t seq;           // Redni broj
    uint32_t timestamp;     // Za redosled
    uint8_t  payload[48];   // Staje u cache liniju
} __attribute__((aligned(64))) jezgro_msg_t;

// Blokirajuci send (kao MINIX)
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg);

// Blokirajuci receive
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t* msg);
```

#### 4.3.4 Hibridni Model Privilegija za Realno Vreme

```c
// LLC kontrola treba tvrdo realno vreme - radi u kernel prostoru
// Ostali servisi rade izolovano u korisnickom prostoru

__attribute__((section(".kernel")))
void llc_control_isr(void) {
    // Direktan pristup hardveru - bez IPC kasnjenja
    // < 1us garantovan odziv
    uint32_t current = ADC1->DR;
    uint32_t duty = pid_compute(current, target);
    HRTIM1->TIMA.CMP1 = duty;
}

// Termalni menadzer radi u korisnickom prostoru - izolovan
__attribute__((section(".service_thermal")))
void thermal_task(void) {
    jezgro_msg_t msg;
    while (1) {
        // Moze pristupiti hardveru samo preko kernel poziva
        jezgro_syscall(SYS_READ_TEMP, &temperature);

        if (temperature > THRESHOLD) {
            msg.type = MSG_THERMAL_WARNING;
            jezgro_send(LLC_SERVICE, &msg);  // Zatrazi smanjenje snage
        }
        jezgro_sleep(100);
    }
}
```

---

## 5. Tehnicke Specifikacije

### 5.1 Zahtevi za Resurse

| Resurs | JEZGRO | FreeRTOS | Zephyr | seL4 |
|--------|--------|----------|--------|------|
| Flash | 32 KB | 10 KB | 50 KB | 200+ KB |
| RAM (kernel) | 8 KB | 2 KB | 8 KB | 64+ KB |
| RAM (po servisu) | 4-16 KB | N/A | 4 KB | 16+ KB |
| MPU regioni | 6-8 | 0-4 | 4-8 | N/A (MMU) |
| Minimalni MCU | Cortex-M3 | Cortex-M0 | Cortex-M3 | Cortex-A |

### 5.2 Vremenske Garancije

| Operacija | Najgori Slucaj | Tipicno |
|-----------|----------------|---------|
| Promena konteksta | 2 us | 0.5 us |
| IPC slanje poruke | 5 us | 1 us |
| Restart servisa | 50 ms | 10 ms |
| MPU rekonfiguracija | 0.2 us | 0.1 us |
| Kasnjenje prekida | 0.5 us | 0.2 us |

---

## 6. Prednosti nad Postojecom Tehnologijom

### 6.1 vs. Monolitni RTOS (FreeRTOS)

| Aspekt | FreeRTOS | JEZGRO |
|--------|----------|--------|
| Izolacija gresaka | Nema | Puna MPU izolacija |
| Bag u logovanju | Pad sistema | Logger se restartuje, sistem nastavlja |
| Azuriranje servisa | Pun reflash | Azuriranje pojedinacnog servisa |
| Testiranje | Ceo sistem | Izolovani unit testovi |

### 6.2 vs. Puni Mikrokernel (seL4/MINIX)

| Aspekt | seL4/MINIX | JEZGRO |
|--------|------------|--------|
| Hardver | Treba MMU | Radi sa MPU |
| Cena MCU-a | $20+ | $5 |
| Potrebna RAM | 512KB+ | 64KB |
| Realno vreme | Meko RT | Tvrdo RT (< 1us) |

---

## 7. Patentni Zahtevi (Nacrt)

### Nezavisni Zahtevi

1. Operativni sistem realnog vremena za ugradenu energetsku elektroniku koji sadrzi:
   - Minimalni mikrokernel koji se izvrsava u privilegovanom modu
   - Vise servisnih taskova koji se izvrsavaju u neprivilegovanom modu
   - MPU izolaciju izmedju servisa
   - Server za reinkarnaciju za automatski restart servisa pri detekciji greske

2. Metod za rad energetske elektronike otporan na greske koji sadrzi:
   - Izolovanje softverskih servisa koriscenjem MPU memorijskih regiona
   - Detekciju gresaka servisa putem watchdog tajmera po servisu
   - Automatski restart neispravnih servisa bez reseta sistema
   - Odrzavanje isporuke energije tokom restarta servisa

3. Hibridna arhitektura privilegija za kontrolu energetske elektronike koja sadrzi:
   - Kontrolne petlje tvrdnog realnog vremena u kernel prostoru sa direktnim pristupom hardveru
   - Nekriticne servise u izolovanom korisnickom prostoru
   - IPC prosledjivanje poruka izmedju servisa
   - Nula zastoja sistema pri padu nekriticnog servisa

---

## 8. Potpisi

**Pronalazac:**

Potpis: _________________________
Ime: Bojan Janjatovic
Datum: 2026-01-04

**Svedok:**

Potpis: _________________________
Ime: _________________________
Datum: _________________________

---

## Kontrola Dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-04 | Bojan Janjatovic | Inicijalno otkrivanje |
