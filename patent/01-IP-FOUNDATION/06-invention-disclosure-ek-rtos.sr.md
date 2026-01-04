# Otkrivanje Izuma: EK-RTOS Mikrokernel Operativni Sistem

## Administrativne Informacije

| Polje | Vrednost |
|-------|----------|
| ID Otkrivanja | EK-2026-006 |
| Datum Otkrivanja | 2026-01-04 |
| Pronalazač(i) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Adresa | Vojislava Ilića 8, Kikinda, Severni Banat, Srbija |
| Datum Koncepcije | 2026-01-04 |
| Svedoci | - |

### Poreklo Izuma
Inspiracija: MINIX mikrokernel operativni sistem od Andrew Tanenbauma. Spoznaja da principi mikrokernela (izolacija grešaka, prosleđivanje poruka, automatski restart servisa) mogu revolucionisati pouzdanost u energetskoj elektronici - primena OS koncepata na ugrađene sisteme u realnom vremenu.

---

## 1. Naslov Izuma

**Mikrokernel Operativni Sistem Realnog Vremena za Energetsku Elektroniku Otpornu na Greške sa MPU Izolacijom Servisa**

Alternativni naslovi:
- MINIX-Inspirisan RTOS za Ugrađene Energetske Sisteme
- Samoizlečivi Mikrokernel za EV Module Punjenja
- Arhitektura Servera za Reinkarnaciju u Firmveru Energetske Elektronike

---

## 2. Tehničko Polje

```
■ Ugrađeni Operativni Sistemi
■ Sistemi Realnog Vremena
■ Kontrola Energetske Elektronike
■ Računarstvo Otporno na Greške
■ Mikrokernel Arhitektura
```

---

## 3. Opis Problema

### 3.1 Trenutno Stanje Tehnike

```
Trenutne opcije ugrađenih RTOS-a za energetsku elektroniku:

OPCIJA A: Monolitni RTOS (FreeRTOS, uC/OS)
• Svi taskovi dele isti memorijski prostor
• Jedan bag može srušiti ceo sistem
• Nema izolacije grešaka između komponenti
• Ručni oporavak od kvarova

OPCIJA B: Puni Mikrokernel (seL4, MINIX)
• Zahteva MMU (Memory Management Unit)
• Nije dostupan na isplativim MCU-ovima
• Visoka potrošnja memorije (200KB+)
• Nije dizajniran za tvrdo realno vreme

OPCIJA C: Bare Metal
• Nikakva izolacija
• Ceo sistem ranjiv na pojedinačnu grešku
• Kompleksno ručno upravljanje stanjem
• Nema standardizovanog IPC-a
```

### 3.2 Problemi sa Trenutnim Pristupima

```
1. NEMA IZOLACIJE GREŠAKA NA MCU-ima
   • STM32, NXP, TI MCU-ovi imaju MPU, ne MMU
   • Postojeći RTOS-ovi ne koriste MPU pravilno
   • Pad jednog servisa = reset celog sistema

2. NEMA AUTOMATSKOG OPORAVKA
   • Watchdog resetuje ceo sistem
   • Ne može restartovati pojedinačne servise
   • Gubitak stanja tokom oporavka
   • Produžen zastoj

3. MONOLITNA ARHITEKTURA
   • Sav kod radi na istom nivou privilegija
   • Buffer overflow u logovanju = pad power stage-a
   • Ažuriranja zahtevaju zamenu celog firmvera
   • Testiranje zahteva ceo sistem

4. PROSLEĐIVANJE PORUKA ODSUTNO
   • Direktni pozivi funkcija stvaraju čvrstu spregu
   • Teško izolovanje i testiranje komponenti
   • Race uslovi između taskova
   • Nema čistih granica interfejsa
```

---

## 4. Predloženo Rešenje

### 4.1 Suština Inovacije

EK-RTOS: Mikrokernel RTOS specifično dizajniran za energetsku elektroniku koji donosi MINIX principe pouzdanosti na mikrokontrolere sa ograničenim resursima koristeći MPU umesto MMU.

### 4.2 Ključne Komponente

```
┌─────────────────────────────────────────────────────────────┐
│                     EK-RTOS ARHITEKTURA                     │
├─────────────────────────────────────────────────────────────┤
│   KORISNIČKI SERVISI (Neprivilegovani, MPU-izolovani)       │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │Termalni │ │  Swarm  │ │  Audit  │ │  OCPP   │          │
│   │ Menadžer│ │  Koord. │ │  Logger │ │ Gateway │          │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│        └───────────┴───────────┴───────────┘                │
│                         │ IPC                               │
├─────────────────────────┴───────────────────────────────────┤
│   EK-KERNEL (Privilegovan, Minimalan)          ~8 KB        │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐│
│   │Scheduler │ │   MPU    │ │   IPC    │ │ Server za      ││
│   │  (EDF)   │ │ Menadžer │ │   Red    │ │ Reinkarnaciju  ││
│   └──────────┘ └──────────┘ └──────────┘ └────────────────┘│
├─────────────────────────────────────────────────────────────┤
│   PRIVILEGOVANI DRAJVERI (Kernel ekstenzije)                │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│   │   LLC    │ │  CAN-FD  │ │   ADC    │                   │
│   │ Kontrola │ │  Drajver │ │  Drajver │                   │
│   └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────┤
│   HARDVER: STM32G474 / Sličan Cortex-M sa MPU               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Nove Tehničke Karakteristike

#### 4.3.1 MPU Izolacija Grešaka (bez MMU)

```c
// Svaki servis ograničen na svoj MPU region
typedef struct {
    uint8_t  region_id;      // MPU region 0-7
    void*    base_addr;      // Bazna adresa memorije
    size_t   size;           // Veličina regiona (stepen dvojke)
    uint32_t permissions;    // R/W/X zastavice
} ek_service_region_t;

// Servis ne može pristupiti memoriji drugog servisa
// Hardverski izuzetak ako se granica prekrši
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

                // Zabeleži grešku
                audit_log(FAULT_SERVICE_CRASH, i, get_fault_info(i));

                // Obavesti druge servise
                ek_broadcast(MSG_SERVICE_DOWN, i);

                // Restartuj servis
                service_restart(i);  // Restart BEZ reseta sistema!

                // Obavesti da je oporavak završen
                ek_broadcast(MSG_SERVICE_UP, i);
            }
        }
        ek_sleep(10); // Provera svakih 10ms
    }
}
```

#### 4.3.3 Zero-Copy Prosleđivanje Poruka IPC

```c
// MINIX-stil sinhrono prosleđivanje poruka
// Zero-copy korišćenjem deljenog memorijskog bazena

typedef struct {
    uint16_t src;           // ID izvornog servisa
    uint16_t dst;           // ID odredišnog servisa
    uint16_t type;          // Tip poruke
    uint16_t seq;           // Redni broj
    uint32_t timestamp;     // Za redosled
    uint8_t  payload[48];   // Staje u cache liniju
} __attribute__((aligned(64))) ek_message_t;

// Blokirajući send (kao MINIX)
ek_status_t ek_send(ek_service_id_t dst, ek_message_t* msg);

// Blokirajući receive
ek_status_t ek_receive(ek_service_id_t src, ek_message_t* msg);
```

#### 4.3.4 Hibridni Model Privilegija za Realno Vreme

```c
// LLC kontrola treba tvrdo realno vreme - radi u kernel prostoru
// Ostali servisi rade izolovano u korisničkom prostoru

__attribute__((section(".kernel")))
void llc_control_isr(void) {
    // Direktan pristup hardveru - bez IPC kašnjenja
    // < 1μs garantovan odziv
    uint32_t current = ADC1->DR;
    uint32_t duty = pid_compute(current, target);
    HRTIM1->TIMA.CMP1 = duty;
}

// Termalni menadžer radi u korisničkom prostoru - izolovan
__attribute__((section(".service_thermal")))
void thermal_task(void) {
    ek_message_t msg;
    while (1) {
        // Može pristupiti hardveru samo preko kernel poziva
        ek_syscall(SYS_READ_TEMP, &temperature);

        if (temperature > THRESHOLD) {
            msg.type = MSG_THERMAL_WARNING;
            ek_send(LLC_SERVICE, &msg);  // Zatraži smanjenje snage
        }
        ek_sleep(100);
    }
}
```

---

## 5. Tehničke Specifikacije

### 5.1 Zahtevi za Resurse

| Resurs | EK-RTOS | FreeRTOS | Zephyr | seL4 |
|--------|---------|----------|--------|------|
| Flash | 32 KB | 10 KB | 50 KB | 200+ KB |
| RAM (kernel) | 8 KB | 2 KB | 8 KB | 64+ KB |
| RAM (po servisu) | 4-16 KB | N/A | 4 KB | 16+ KB |
| MPU regioni | 6-8 | 0-4 | 4-8 | N/A (MMU) |
| Minimalni MCU | Cortex-M3 | Cortex-M0 | Cortex-M3 | Cortex-A |

### 5.2 Vremenske Garancije

| Operacija | Najgori Slučaj | Tipično |
|-----------|----------------|---------|
| Promena konteksta | 2 μs | 0.5 μs |
| IPC slanje poruke | 5 μs | 1 μs |
| Restart servisa | 50 ms | 10 ms |
| MPU rekonfiguracija | 0.2 μs | 0.1 μs |
| Kašnjenje prekida | 0.5 μs | 0.2 μs |

---

## 6. Prednosti nad Postojećom Tehnologijom

### 6.1 vs. Monolitni RTOS (FreeRTOS)

| Aspekt | FreeRTOS | EK-RTOS |
|--------|----------|---------|
| Izolacija grešaka | Nema | Puna MPU izolacija |
| Bag u logovanju | Pad sistema | Logger se restartuje, sistem nastavlja |
| Ažuriranje servisa | Pun reflash | Ažuriranje pojedinačnog servisa |
| Testiranje | Ceo sistem | Izolovani unit testovi |

### 6.2 vs. Puni Mikrokernel (seL4/MINIX)

| Aspekt | seL4/MINIX | EK-RTOS |
|--------|------------|---------|
| Hardver | Treba MMU | Radi sa MPU |
| Cena MCU-a | $20+ | $5 |
| Potrebna RAM | 512KB+ | 64KB |
| Realno vreme | Meko RT | Tvrdo RT (< 1μs) |

---

## 7. Patentni Zahtevi (Nacrt)

### Nezavisni Zahtevi

1. Operativni sistem realnog vremena za ugrađenu energetsku elektroniku koji sadrži:
   - Minimalni mikrokernel koji se izvršava u privilegovanom modu
   - Više servisnih taskova koji se izvršavaju u neprivilegovanom modu
   - MPU izolaciju između servisa
   - Server za reinkarnaciju za automatski restart servisa pri detekciji greške

2. Metod za rad energetske elektronike otporan na greške koji sadrži:
   - Izolovanje softverskih servisa korišćenjem MPU memorijskih regiona
   - Detekciju grešaka servisa putem watchdog tajmera po servisu
   - Automatski restart neispravnih servisa bez reseta sistema
   - Održavanje isporuke energije tokom restarta servisa

3. Hibridna arhitektura privilegija za kontrolu energetske elektronike koja sadrži:
   - Kontrolne petlje tvrdnog realnog vremena u kernel prostoru sa direktnim pristupom hardveru
   - Nekritične servise u izolovanom korisničkom prostoru
   - IPC prosleđivanje poruka između servisa
   - Nula zastoja sistema pri padu nekritičnog servisa

---

## 8. Potpisi

**Pronalazač:**

Potpis: _________________________
Ime: Bojan Janjatović
Datum: 2026-01-04

**Svedok:**

Potpis: _________________________
Ime: _________________________
Datum: _________________________

---

## Kontrola Dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-04 | Bojan Janjatović | Inicijalno otkrivanje |
