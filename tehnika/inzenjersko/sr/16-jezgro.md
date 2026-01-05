# JEZGRO: Mikrokernel Operativni Sistem Realnog Vremena

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-017 |
| Verzija | 1.0 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inzenjering |

---

## 1. Pregled

### 1.1 Sta je JEZGRO?

JEZGRO je mikrokernel operativni sistem realnog vremena specificno dizajniran za aplikacije energetske elektronike. Donosi principe pouzdanosti MINIX-a (izolacija gresaka, prosledjivanje poruka, automatski restart servisa) na mikrokontrolere sa ogranicenim resursima.

Ime "JEZGRO" odrazava i minimalnu filozofiju dizajna i srpsko poreklo sistema.

### 1.2 Ciljevi Dizajna

| Cilj | Target |
|------|--------|
| Izolacija gresaka | MPU-bazirana, bez potrebe za MMU |
| Automatski oporavak | Restart servisa < 50ms |
| Realno vreme | Kasnjenje prekida < 1us |
| Memorijski otisak | Kernel < 10KB |
| Ciljni MCU | Cortex-M3/M4/M7 sa MPU |

### 1.3 MINIX Inspiracija

```
+-------------------------------------------------------------+
|              MINIX -> JEZGRO Mapiranje                      |
+-------------------------------------------------------------+
|                                                             |
|  MINIX Koncept             JEZGRO Implementacija            |
|  ----------------          ----------------------           |
|                                                             |
|  MMU izolacija        ->   MPU regioni (bez MMU)            |
|  User-space serveri   ->   Neprivilegovani servisni taskovi |
|  Message passing IPC  ->   Zero-copy deljena memorija IPC   |
|  Server za reinkarn.  ->   Watchdog + auto-restart          |
|  Minimalni kernel     ->   ~8KB kernel kod                  |
|                                                             |
+-------------------------------------------------------------+
```

---

## 2. Arhitektura

### 2.1 Sistemski Slojevi

```
+-------------------------------------------------------------+
|                     JEZGRO ARHITEKTURA                      |
+-------------------------------------------------------------+
|                                                             |
|  SLOJ 3: KORISNICKI SERVISI (Neprivilegovani, MPU-izolovani)|
|  +---------+ +---------+ +---------+ +---------+            |
|  |Termalni | |  Swarm  | |  Audit  | |  OCPP   |            |
|  | Menadzer| |  Koord. | |  Logger | | Gateway |            |
|  +----+----+ +----+----+ +----+----+ +----+----+            |
|       |           |           |           |                  |
|  -----+-----------+-----------+-----------+------------      |
|                 PROSLEDJIVANJE PORUKA (IPC)                  |
|  ----------------------------------------------------------  |
|                                                             |
+-------------------------------------------------------------+
|  SLOJ 2: KERNEL SERVISI                                     |
|  +------------------------------------------------------+   |
|  |           SERVER ZA REINKARNACIJU                     |   |
|  |  * Watchdog pracenje po servisu                       |   |
|  |  * Automatska detekcija gresaka                       |   |
|  |  * Restart servisa bez reseta sistema                 |   |
|  |  * Kukice za ocuvanje stanja                          |   |
|  +------------------------------------------------------+   |
|                                                             |
+-------------------------------------------------------------+
|  SLOJ 1: MIKROKERNEL (Privilegovan, ~8KB)                   |
|  +----------+ +----------+ +----------+ +----------+        |
|  |Scheduler | |   MPU    | |   IPC    | | Prekidi  |        |
|  |  (EDF)   | | Menadzer | |  Redovi  | | Dispatch |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                             |
+-------------------------------------------------------------+
|  SLOJ 0: PRIVILEGOVANI DRAJVERI                             |
|  +----------+ +----------+ +----------+ +----------+        |
|  |   LLC    | |  CAN-FD  | |   ADC    | |   PWM    |        |
|  | Kontrola | |  Drajver | |  Drajver | | (HRTIM)  |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                             |
+-------------------------------------------------------------+
|  HARDVER: STM32G474 (Cortex-M4 + MPU)                       |
+-------------------------------------------------------------+
```

### 2.2 Nivoi Privilegija

| Nivo | Naziv | Pristup | Primeri |
|------|-------|---------|---------|
| 0 | Kernel | Pun hardver | Scheduler, MPU, ISR-ovi |
| 1 | Drajver | Specificne periferije | LLC kontrola, CAN-FD |
| 2 | Servis | Samo sopstvena memorija | Termalni, Swarm, Audit |

### 2.3 Mapa Memorije (128KB RAM)

```
0x20020000 +----------------------------------+
           |  Kernel Prostor         8 KB    | <- Privilegovan
           +----------------------------------+
           |  LLC Control Task      16 KB    | <- MPU Region 0
           +----------------------------------+
           |  Safety Monitor         8 KB    | <- MPU Region 1
           +----------------------------------+
           |  CAN Handler            8 KB    | <- MPU Region 2
           +----------------------------------+
           |  Termalni Menadzer      8 KB    | <- MPU Region 3
           +----------------------------------+
           |  Swarm Koordinator     16 KB    | <- MPU Region 4
           +----------------------------------+
           |  Audit Logger          16 KB    | <- MPU Region 5
           +----------------------------------+
           |  IPC Bazen Poruka      32 KB    | <- Deljeno
           +----------------------------------+
           |  Stack Cuvari          16 KB    | <- Zasticeno
0x20000000 +----------------------------------+
```

---

## 3. Komponente Kernela

### 3.1 Scheduler

**Algoritam**: Earliest Deadline First (EDF) sa prioritetnim fallback-om

```c
typedef struct {
    jezgro_task_id_t   id;
    jezgro_priority_t  priority;      // Staticki prioritet
    uint32_t           deadline;      // Apsolutni rok (tikovi)
    uint32_t           period;        // Period taska
    jezgro_state_t     state;         // READY, RUNNING, BLOCKED, SUSPENDED
    void*              stack_ptr;     // Sacuvan stack pointer
    mpu_region_t       mpu_config;    // MPU konfiguracija
} jezgro_tcb_t;
```

### 3.2 MPU Menadzer

**Cortex-M4 MPU**: 8 konfigurabilnih regiona

```c
void mpu_switch_context(jezgro_task_id_t task) {
    // Onemogudi MPU tokom rekonfiguracije
    MPU->CTRL = 0;

    // Konfiguriši regione za ovaj task
    for (int r = 0; r < task->num_regions; r++) {
        MPU->RNR  = r;
        MPU->RBAR = (uint32_t)task->regions[r].base | MPU_RBAR_VALID;
        MPU->RASR = compute_rasr(&task->regions[r]);
    }

    // Ponovo omogudi MPU
    MPU->CTRL = MPU_CTRL_ENABLE | MPU_CTRL_PRIVDEFENA;
}
```

### 3.3 IPC Sistem

**Dizajn**: Zero-copy prosledjivanje poruka inspirisano MINIX-om

```c
// Struktura poruke (64-byte poravnata za kes efikasnost)
typedef struct {
    uint16_t src;           // ID izvornog servisa
    uint16_t dst;           // ID odredisnog servisa
    uint16_t type;          // Tip poruke
    uint16_t flags;         // Zastavice (SYNC, ASYNC, itd.)
    uint32_t seq;           // Redni broj
    uint32_t timestamp;     // Vremenska oznaka (tikovi)
    uint8_t  payload[48];   // Podaci
} __attribute__((aligned(64))) jezgro_msg_t;

// Sinhrono slanje (blokira dok se ne primi)
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg);

// Sinhrono primanje (blokira dok poruka nije dostupna)
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t* msg);
```

### 3.4 Server za Reinkarnaciju

**Inspirisan MINIX RS (Reincarnation Server)**

Server za Reinkarnaciju je kernel servis koji nadgleda sve korisnicke servise i automatski ih restartuje ako padnu ili prestanu da odgovaraju. Ovo je kljucna razlika od tradicionalnih RTOS dizajna gde watchdog timeout uzrokuje potpuni reset sistema.

#### 3.4.1 Tabela Deskriptora Servisa

```c
typedef struct {
    jezgro_svc_id_t    id;              // Jedinstveni identifikator servisa
    const char*        name;            // Citljivo ime
    void             (*entry_point)(void); // Ulazna funkcija servisa
    void*              memory_base;     // Pocetak memorijskog regiona
    size_t             memory_size;     // Velicina memorijskog regiona
    size_t             stack_size;      // Alokacija steka
    jezgro_priority_t  priority;        // Prioritet rasporedivanja
    uint32_t           watchdog_ms;     // Watchdog timeout
    uint32_t           restart_count;   // Broj restartova
    uint32_t           max_restarts;    // Maks restartova pre degradacije
    jezgro_svc_state_t state;           // Trenutno stanje
    uint32_t           last_feed_tick;  // Poslednje hranjenje watchdog-a
    void*              saved_state;     // Opcioni bafer stanja
    size_t             saved_state_size;// Velicina bafera stanja
    uint32_t           backoff_ms;      // Trenutni backoff restarta
} jezgro_service_t;
```

#### 3.4.2 Masina Stanja Zivotnog Ciklusa Servisa

```
                   ┌──────────────────────────────────────────┐
                   │                                          │
                   ▼                                          │
            ┌──────────┐                                      │
    ───────►│  INIT    │                                      │
            └────┬─────┘                                      │
                 │ init_service()                             │
                 ▼                                            │
            ┌──────────┐    greska/watchdog     ┌──────────┐  │
            │ RUNNING  │───────────────────────►│ FAULTED  │  │
            └────┬─────┘                        └────┬─────┘  │
                 │                                   │        │
                 │ graceful_stop()                   │ notify_down()
                 ▼                                   ▼        │
            ┌──────────┐                       ┌──────────┐   │
            │ STOPPING │◄──────────────────────│ STOPPING │   │
            └────┬─────┘                       └────┬─────┘   │
                 │                                   │        │
                 │ save_state()                      │        │
                 │ clear_memory()                    │        │
                 ▼                                   ▼        │
            ┌──────────┐                       ┌──────────┐   │
            │ STOPPED  │                       │RESTARTING│───┘
            └──────────┘                       └──────────┘
```

#### 3.4.3 Implementacija Obrade Gresaka

```c
void handle_service_fault(jezgro_svc_id_t svc, fault_type_t fault) {
    jezgro_service_t* s = &services[svc];

    // 1. Zabelezi gresku sa kontekstom
    audit_log(EVENT_SERVICE_FAULT, svc, fault);
    audit_log_context(s->name, __builtin_return_address(0));

    // 2. Proveri limite restartova
    if (s->restart_count >= s->max_restarts) {
        handle_service_degradation(svc);
        return;
    }

    // 3. Obavesti druge servise (neblokirajuci broadcast)
    jezgro_msg_t msg = {
        .type = MSG_SERVICE_DOWN,
        .src = SVC_REINCARNATION,
        .payload.svc_id = svc
    };
    jezgro_broadcast(&msg);

    // 4. Sacuvaj stanje servisa ako je moguce
    if (s->saved_state != NULL && s->state != SVC_STATE_FAULTED) {
        save_service_state(svc);
    }

    // 5. Resetuj memorijski region servisa (zero-fill)
    memset(s->memory_base, 0, s->memory_size);

    // 6. Primeni eksponencijalni backoff za ponovljene greske
    if (s->restart_count > 0) {
        s->backoff_ms = MIN(s->backoff_ms * 2, MAX_BACKOFF_MS);
        jezgro_delay_ms(s->backoff_ms);
    }

    // 7. Restartuj servis
    s->restart_count++;
    s->state = SVC_STATE_RESTARTING;
    service_init(svc);

    // 8. Vrati stanje ako je dostupno
    if (s->saved_state != NULL) {
        restore_service_state(svc);
    }

    s->state = SVC_STATE_RUNNING;
    s->last_feed_tick = jezgro_get_ticks();

    // 9. Obavesti da je oporavak zavrsen
    msg.type = MSG_SERVICE_UP;
    jezgro_broadcast(&msg);
}
```

#### 3.4.4 Prevencija Kaskadnih Gresaka

```c
#define MAX_RESTARTS_PER_MINUTE  3
#define MAX_BACKOFF_MS           5000
#define DEGRADATION_THRESHOLD    10

void handle_service_degradation(jezgro_svc_id_t svc) {
    jezgro_service_t* s = &services[svc];

    // Oznaci servis kao degradiran (nece se auto-restartovati)
    s->state = SVC_STATE_DEGRADED;

    // Zabelezi kritican dogadjaj
    audit_log(EVENT_SERVICE_DEGRADED, svc, s->restart_count);

    // Obavesti operatera putem CAN-a
    jezgro_msg_t alert = {
        .type = MSG_CRITICAL_ALERT,
        .payload.alert_code = ALERT_SERVICE_DEGRADED,
        .payload.svc_id = svc
    };
    can_send_alert(&alert);

    // Sistem nastavlja da radi bez ovog servisa
    // Isporuka snage NIJE pogodjena (LLC kontrola je u kernelu)
}
```

---

### 3.5 MPU Izolacija Servisa

Memory Protection Unit (MPU) pruza hardverski nametnutu izolaciju izmedju servisa bez potrebe za punim MMU. Ovo je kljucna inovacija koja omogucava mikrokernel prednosti na mikrokontrolerima sa ogranicenim resursima.

#### 3.5.1 Mogucnosti Cortex-M4 MPU

STM32G474 Cortex-M4 MPU pruza:

| Osobina | Specifikacija |
|---------|---------------|
| Broj regiona | 8 programabilnih |
| Velicina regiona | 32 bajta do 4 GB (stepen dvojke) |
| Pod-regioni | 8 po regionu (mogu se pojedinacno onemoguciti) |
| Dozvole pristupa | Read/Write/Execute po nivou privilegije |
| Atributi | Cacheable, Bufferable, Shareable |

**Kljucne Razlike od MMU:**
- Nema translacije virtualne u fizicku adresu
- Fiksni broj regiona (8 naspram neogranicenih stranica)
- Potrebno poravnanje velicine na stepen dvojke
- Nema demand paging ili swapping
- Deterministicko vreme rekonfiguracije (~200ns)

#### 3.5.2 Alokacija MPU Regiona za EK3

```
Region   Baza        Vel.    Pristup  Namena
──────────────────────────────────────────────────────────────
  0    0x08000000   512 KB   PRO    Flash (sav kod, samo citanje)
  1    0x20000000    8 KB    PRW    Kernel podaci + ISR stekovi
  2    0x20002000   16 KB    PRW    LLC Kontrola (privilegovan)
  3    Dinamicki     8 KB    URW    Memorija aktivnog servisa
  4    Dinamicki     4 KB    URW    Stek aktivnog servisa
  5    0x2001E000   32 KB    URO    IPC bazen poruka (deljeno citanje)
  6    0x40000000  512 MB    PRW    Pristup periferijama (privilegovan)
  7    0xE0000000  512 MB    PRW    Sistemska kontrola (privilegovan)

PRO = Privilegovano Samo Citanje
PRW = Privilegovano Citanje/Pisanje
URW = Neprivilegovano Citanje/Pisanje
URO = Neprivilegovano Samo Citanje
```

#### 3.5.3 Promena Konteksta sa MPU Rekonfiguracijom

```c
// Kompletna implementacija promene MPU konteksta
// Vreme izvrsenja: ~200ns @ 170 MHz

void mpu_switch_context(const mpu_context_t* new_ctx) {
    // Onemogudi MPU tokom rekonfiguracije
    __DMB();  // Data Memory Barrier
    MPU->CTRL = 0;
    __DSB();  // Data Synchronization Barrier

    // Rekonfiguriši dinamicke regione (3, 4, i opciono više)
    for (uint8_t i = 0; i < new_ctx->num_regions; i++) {
        MPU->RNR  = 3 + i;  // Dinamicki regioni pocinju od 3
        MPU->RBAR = new_ctx->regions[i].RBAR;
        MPU->RASR = new_ctx->regions[i].RASR;
    }

    // Ponovo omogudi MPU sa privilegovanom podrazumevanom mapom
    __DSB();
    MPU->CTRL = MPU_CTRL_ENABLE_Msk | MPU_CTRL_PRIVDEFENA_Msk;
    __ISB();  // Instruction Synchronization Barrier
}
```

#### 3.5.4 Analiza Vremena MPU

| Operacija | Ciklusi @ 170 MHz | Vreme |
|-----------|-------------------|-------|
| Onemogudi MPU | 3 | 18 ns |
| Upis RBAR | 2 | 12 ns |
| Upis RASR | 2 | 12 ns |
| Po regionu config | 4 | 24 ns |
| 2 regiona ukupno | 8 | 47 ns |
| Omogudi MPU | 3 | 18 ns |
| Barijere (DSB, ISB) | 6 | 35 ns |
| **Ukupno (2 regiona)** | **24** | **~140 ns** |

---

### 3.6 IPC i CAN-FD Protokol

Inter-Process Communication (IPC) je kicma mikrokernel arhitekture. JEZGRO implementira zero-copy prosledjivanje poruka inspirisano MINIX-om, sa dodatnim CAN-FD gateway-em za eksternu komunikaciju.

#### 3.6.1 Arhitektura Bazena Poruka

```
0x2001E000 ┌─────────────────────────────────────────────┐
           │  Zaglavlje Bazena (64 bajta)                 │
           │  ├─ pool_size: 32768                        │
           │  ├─ slot_count: 512                         │
           │  ├─ free_count: atomic<uint32_t>            │
           │  └─ alloc_bitmap[16]: atomic<uint32_t>[16]  │
0x2001E040 ├─────────────────────────────────────────────┤
           │  Slot Poruke 0 (64 bajta, kes-poravnat)     │
           │  ├─ src: uint16_t                           │
           │  ├─ dst: uint16_t                           │
           │  ├─ type: uint16_t                          │
           │  └─ payload[48]                             │
           ├─────────────────────────────────────────────┤
           │  Slot Poruke 1 ... 511                      │
0x20025FC0 └─────────────────────────────────────────────┘
```

#### 3.6.2 CAN-FD ka JEZGRO IPC Mapiranje

Eksterne CAN-FD poruke se prevode u interne IPC poruke od strane CAN Handler servisa:

```
CAN-FD Prosireni ID (29 bita)         JEZGRO Polja Poruke
─────────────────────────────────     ───────────────────────────
┌────┬────┬────────────┬─────────┐    ┌─────────────────────────┐
│Pri │Tip │   Izvor    │  Dest   │    │ flags.priority          │
│4bit│4bit│   12 bita  │ 9 bita  │    │ type                    │
└────┴────┴────────────┴─────────┘    │ src (prevedeno)         │
  │    │        │           │         │ dst (prevedeno)         │
  │    │        │           │         └─────────────────────────┘
  │    │        │           │
  │    │        │           └────────► ID Modula → ID Servisa lookup
  │    │        └────────────────────► Eksterni ID modula
  │    └─────────────────────────────► MSG_POWER_CMD, MSG_THERMAL, itd.
  └──────────────────────────────────► JEZGRO_PRIORITY_HIGH/MEDIUM/LOW
```

---

## 4. Razvoj Servisa

### 4.1 Sablon Servisa

```c
// Definicija servisa
JEZGRO_SERVICE_DEFINE(thermal_manager,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// Glavna petlja servisa
void thermal_manager_main(void) {
    jezgro_msg_t msg;

    while (1) {
        // Nahrani watchdog
        jezgro_watchdog_feed();

        // Cekaj poruku ili timeout
        if (jezgro_receive_timeout(ANY, &msg, 100) == JEZGRO_OK) {
            handle_message(&msg);
        }

        // Periodicni rad
        check_thermal_limits();
    }
}
```

---

## 5. Garancije Realnog Vremena

### 5.1 Analiza Vremena

| Operacija | Najgori Slucaj | Tipicno |
|-----------|----------------|---------|
| Kasnjenje prekida | 500 ns | 200 ns |
| Promena konteksta | 2 us | 500 ns |
| IPC slanje (sinhr.) | 5 us | 1 us |
| IPC primanje | 3 us | 500 ns |
| Restart servisa | 50 ms | 10 ms |

### 5.2 LLC Kontrolna Putanja

```c
// LLC kontrola radi kao ISR najviseg prioriteta
// Garantovan < 1us odziv

__attribute__((section(".kernel.isr")))
void HRTIM_TIMA_IRQHandler(void) {
    // Citaj ADC (DMA pre-ucitan)
    int32_t i_actual = adc_buffer[0];

    // PID izracunavanje
    int32_t error = i_setpoint - i_actual;
    int32_t duty = Kp * error + Ki * integral + Kd * derivative;

    // Ogranici i primeni
    duty = CLAMP(duty, DUTY_MIN, DUTY_MAX);
    HRTIM1->sTimerxRegs[0].CMP1xR = duty;
}
```

---

## 6. Poredjenje sa Alternativama

| Osobina | JEZGRO | FreeRTOS | Zephyr | seL4 | MINIX 3 |
|---------|--------|----------|--------|------|---------|
| Tip kernela | Mikrokernel | Monolitni | Hibridni | Mikrokernel | Mikrokernel |
| Izolacija gresaka | MPU | Opciono | MPU | MMU | MMU |
| Auto-restart | Da | Ne | Ne | Ne | Da |
| Tvrdo realno vreme | Da | Da | Da | Ne | Ne |
| Min RAM | 32 KB | 8 KB | 32 KB | 256 KB | 16 MB |
| MMU potreban | Ne | Ne | Ne | Da | Da |
| Energetska elektr. | Dizajniran za | Genericki | Genericki | Ne | Ne |

---

## 7. Status Implementacije

### 7.1 Plan Razvoja

| Faza | Komponenta | Status | Cilj |
|------|-----------|--------|------|
| 1 | Jezgro kernela | Planirano | Q1 2026 |
| 1 | MPU menadzer | Planirano | Q1 2026 |
| 2 | IPC sistem | Planirano | Q2 2026 |
| 2 | Server za reinkarnaciju | Planirano | Q2 2026 |
| 3 | LLC drajver | Planirano | Q2 2026 |
| 4 | Framework servisa | Planirano | Q3 2026 |

---

## 8. Integracija sa EK3 Firmware-om

Ova sekcija opisuje kako se JEZGRO integrise sa EK3 modularnim sistemom punjenja.

### 8.1 Konfiguracija EK3 Servisa

| ID | Ime Servisa | Prioritet | Stek | Memorija | Watchdog | Namena |
|----|-------------|-----------|------|----------|----------|--------|
| 0 | KERNEL | - | 2 KB | 8 KB | - | Jezgro (privilegovano) |
| 1 | LLC_CONTROL | KRITICAN | 2 KB | 16 KB | 10 ms | Kontrola snage |
| 2 | SAFETY_MONITOR | KRITICAN | 1 KB | 4 KB | 50 ms | Hardverska zastita |
| 3 | CAN_HANDLER | VISOK | 2 KB | 8 KB | 100 ms | CAN-FD protokol |
| 4 | THERMAL_MGR | SREDNJI | 2 KB | 8 KB | 500 ms | Termalno upravljanje |
| 5 | ROJ_COORD | SREDNJI | 4 KB | 16 KB | 1000 ms | Swarm inteligencija |
| 6 | AUDIT_LOGGER | NIZAK | 4 KB | 16 KB | 2000 ms | Evidentiranje |

**Ukupna Potrosnja RAM-a:** ~78 KB (od 128 KB dostupno)

### 8.2 Primeri Toka Poruka

#### 8.2.1 Tok Komande Snage (Eksterno → LLC)

```
Stanični Kontroler                        EK3 Modul
       │                                      │
       │   CAN-FD: POWER_CMD(target=3000W)   │
       │─────────────────────────────────────►│
       │                                      │
       │                            ┌─────────┴────────┐
       │                            │   CAN_HANDLER    │
       │                            │   can_rx_to_ipc()│
       │                            └────────┬─────────┘
       │                                     │
       │                         IPC: MSG_POWER_CMD
       │                                     │
       │                            ┌────────▼─────────┐
       │                            │   LLC_CONTROL    │
       │                            │   set_power()    │
       │                            └────────┬─────────┘
       │                                     │
       │                            PWM duty cycle azuriranje
       │                                     │
       │   CAN-FD: POWER_ACK(actual=2980W)  │
       │◄────────────────────────────────────│
```

### 8.3 Putanja Migracije sa FreeRTOS-a

| FreeRTOS Koncept | JEZGRO Ekvivalent | Napomene za Migraciju |
|------------------|-------------------|------------------------|
| `xTaskCreate()` | `JEZGRO_SERVICE_DEFINE()` | Dodaj MPU region config |
| `vTaskDelay()` | `jezgro_sleep()` | 1:1 mapiranje |
| `xQueueSend()` | `jezgro_send()` | Promeni na IPC poruku |
| `xQueueReceive()` | `jezgro_receive()` | Promeni na IPC poruku |
| `configASSERT()` | `jezgro_assert()` | Trigeruje Reinkarnaciju |

**Kljucne Razlike:**
1. **Izolacija**: FreeRTOS taskovi dele memoriju; JEZGRO servisi su MPU-izolovani
2. **Oporavak**: FreeRTOS stack overflow = reset; JEZGRO = restart servisa
3. **Komunikacija**: FreeRTOS redovi kopiraju podatke; JEZGRO IPC je zero-copy
4. **Privilegije**: FreeRTOS svi isti nivo; JEZGRO ima kernel/servis podelu

### 8.4 Veza sa Drugim Dokumentima

| Dokument | Veza |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Roditeljska arhitektura |
| `tehnika/14-firmware-architecture.md` | FreeRTOS osnova |
| `tehnika/05-swarm-intelligence.md` | Swarm algoritmi |
| `tehnika/11-security-model.md` | Trust granice |
| `tehnika/inzenjersko/sr/15-custom-rack-system.md` | Rack kontroler koristi JEZGRO (Sekcija 10), hardverski mikrokernel |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | Patent |

---

## 9. Kompletna API Referenca

Za detaljnu API referencu sa kompletnim header fajlovima, pogledajte engleski dokument `tehnika/17-jezgro.md`, sekcija 9.

**Dostupni API headeri:**
- `jezgro.h` - Glavni kernel API
- `jezgro_types.h` - Definicije tipova
- `jezgro_err.h` - Kodovi grešaka
- `jezgro_mpu.h` - MPU menadžer API
- `jezgro_ipc.h` - IPC sistem API
- `service_macros.h` - Makroi za definisanje servisa

---

## 10. Build Sistem

Za kompletan CMakeLists.txt i linker script, pogledajte engleski dokument `tehnika/17-jezgro.md`, sekcije 10-11.

**Ključne komande:**

```bash
# Kloniranje ARM GCC toolchain-a
# Potreban: arm-none-eabi-gcc

# Build
cd jezgro
cmake -B build
cmake --build build

# Flash na hardware
cmake --build build --target flash

# Debug
cmake --build build --target debug
```

---

## 11. Finalna Struktura Direktorijuma

```
jezgro/
├── CMakeLists.txt              # Build sistem
├── kernel/
│   ├── include/                # API headeri
│   ├── src/                    # Kernel implementacija
│   └── port/cortex_m4/         # Port za Cortex-M4
├── reincarnation/              # Server za reinkarnaciju
├── drivers/                    # Privilegovani drajveri
├── services/                   # Demo servisi
├── linker/                     # Linker skripte
├── startup/                    # Startup kod
└── hal/                        # HAL wrapper
```

---

## 12. Rukovanje greškama (detaljno)

### 12.1 Taksonomija grešaka

```
+-------------------------------------------------------------+
|                  KLASIFIKACIJA GREŠAKA                       |
+-------------------------------------------------------------+
|                                                              |
| Kategorija | Greška             | Ozbiljnost | Detekcija     |
|------------|--------------------|-----------:|---------------|
| HW-POWER   | Prekostrujno (OCP) | KRITIČNO   | Komparator    |
| HW-POWER   | Prenapon (OVP)     | KRITIČNO   | Komparator    |
| HW-POWER   | Podnapon           | GREŠKA     | ADC nadzor    |
| HW-POWER   | Kvar uzemljenja    | KRITIČNO   | GFI kolo      |
|------------|--------------------|-----------:|---------------|
| HW-THERMAL | Pregrevanje        | KRITIČNO   | Kompar.+ADC   |
| HW-THERMAL | Kvar ventilatora   | UPOZORENJE | Tahometar     |
| HW-THERMAL | Termalno bekstvo   | KRITIČNO   | Brzina promene|
|------------|--------------------|-----------:|---------------|
| SW-MEMORY  | Stack overflow     | KRITIČNO   | MPU region 7  |
| SW-MEMORY  | MPU povreda        | KRITIČNO   | MemManage ISR |
| SW-MEMORY  | Pool iscrpljen     | GREŠKA     | Neuspeh alok. |
|------------|--------------------|-----------:|---------------|
| SW-EXEC    | Watchdog timeout   | KRITIČNO   | IWDG/WWDG     |
| SW-EXEC    | Nevažeći opcode    | KRITIČNO   | UsageFault    |
| SW-EXEC    | Deljenje nulom     | GREŠKA     | UsageFault    |
|------------|--------------------|-----------:|---------------|
| COMM       | CAN bus kvar       | UPOZORENJE | TX timeout    |
| COMM       | Swarm particija    | UPOZORENJE | Heartbeat     |
| COMM       | Auth neuspeh       | UPOZORENJE | CMAC provera  |
+-------------------------------------------------------------+
```

### 12.2 Slojevi rukovanja greškama

```
Nivo 0: HARDVERSKA ZAŠTITA (Ne može se zaobići)
├── OCP: I > 4.0A  → Onemogući gate driver (<1µs)
├── OVP: V > 920V  → Onemogući gate driver (<1µs)
├── OTP: T > 105°C → Onemogući gate driver (<10ms)
└── Ne može se zaobići firmverom!

Nivo 1: KERNEL FAULT HANDLERI (ISR)
├── HardFault   → Zaustavljanje sistema
├── MemManage   → Restart servisa
├── BusFault    → Restart servisa
└── UsageFault  → Restart servisa

Nivo 2: REINKARNACIONI SERVER
├── Watchdog timeout  → Restart servisa
├── Pad servisa       → Sačuvaj stanje, restartuj
├── Previše restartova → Onemogući, degradiran režim
└── Isporuka energije nastavlja (LLC u kernelu)

Nivo 3: DEGRADIRAN RAD
├── Onemogućeni servisi se ne restartuju automatski
├── Upozori operatera preko CAN-a
└── Nastavi sa smanjenom funkcionalnošću
```

### 12.3 Tok oporavka od greške

```
Greška detektovana ──► Privilegovan task? ──DA──► ZAUSTAVI SISTEM
                              │
                             NE
                              ▼
                  restart_count < max?
                        │
                ┌───────┴───────┐
               DA               NE
                │               │
                ▼               ▼
          RESTARTUJ        ONEMOGUĆI
          SERVIS           SERVIS
          1. Sačuvaj stanje  1. Označi disabled
          2. Očisti memoriju 2. Logiraj kvar
          3. Vrati stanje    3. CAN upozorenje
          4. SERVICE_UP      4. Degradiran režim
```

---

## 13. Model drajvera

### 13.1 Kategorije drajvera

| Tip | Režim | Kašnjenje | Restartabilan | Primeri |
|-----|-------|-----------|---------------|---------|
| Privilegovan | Kernel | <10µs | Ne | LLC, ADC, CAN-FD, HRTIM |
| Neprivilegovan | Korisnički | >1ms | Da | I2C Temp, EEPROM, LED |

### 13.2 Interfejs drajvera

```c
typedef struct {
    jezgro_err_t (*init)(void* config);
    jezgro_err_t (*start)(void);
    jezgro_err_t (*stop)(void);
    jezgro_err_t (*ioctl)(uint32_t cmd, void* arg);
} jezgro_drv_ops_t;

typedef struct {
    const char*             name;
    uint8_t                 type;      /* DRV_TYPE_* */
    uint16_t                flags;     /* DRV_FLAG_PRIVILEGED, DRV_FLAG_RT */
    const jezgro_drv_ops_t* ops;
} jezgro_drv_t;
```

### 13.3 LLC drajver (400kHz kontrolna petlja)

```c
__attribute__((section(".kernel.isr"), hot))
void HRTIM_TIMA_IRQHandler(void) {
    int32_t v_out = g_adc_buffer[ADC_CH_VOUT];
    int32_t i_out = g_adc_buffer[ADC_CH_IOUT];

    /* Naponska petlja (100kHz) */
    static uint8_t div = 0;
    if (++div >= 4) {
        div = 0;
        int32_t v_err = g_llc.v_target - v_out;
        g_llc.v_integral += v_err;
        g_llc.i_setpoint = (KP_V * v_err + KI_V * g_llc.v_integral) >> 16;
    }

    /* Strujna petlja (400kHz) */
    int32_t i_err = g_llc.i_setpoint - i_out;
    int32_t duty = (KP_I * i_err + KI_I * g_llc.i_integral) >> 16;
    HRTIM1->sTimerxRegs[HRTIM_TIMERINDEX_TIMER_A].CMP1xR = CLAMP(duty, DUTY_MIN, DUTY_MAX);
}
```

---

## 14. Pokretanje i inicijalizacija

### 14.1 Sekvenca pokretanja

```
FAZA 1: ROM BOOTLOADER
└── Skoči na custom bootloader @ 0x08000000

FAZA 2: CUSTOM BOOTLOADER (16KB)
├── Verifikuj potpis kernela (Ed25519)
├── Proveri brojač verzije (anti-rollback)
└── Skoči na JEZGRO kernel

FAZA 3: KERNEL INIT
├── Postavi vektorsku tabelu (VTOR)
├── Inicijalizuj BSS, kopiraj .data
├── Konfiguriši statičke MPU regione
├── Inicijalizuj IPC message pool
└── Pokreni SysTick (1ms)

FAZA 4: DRAJVER INIT
├── Safety Monitor (OCP/OVP/OTP)
├── ADC drajver (DMA)
├── HRTIM drajver (PWM)
├── LLC drajver
└── CAN-FD drajver

FAZA 5: POKRETANJE SERVISA
├── Safety Monitor   (1. - kritičan)
├── LLC Control      (2. - napajanje)
├── CAN Handler      (3. - komunikacija)
├── Thermal Manager  ─┐
├── Swarm Coordinator─┼─ (paralelno)
└── Audit Logger     ─┘

FAZA 6: OPERATIVAN
├── Pošalji HEARTBEAT na CAN
├── Pridruži se swarm-u (Raft izbori)
└── Normalan rad
```

### 14.2 Graf zavisnosti servisa

```
              KERNEL
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
  Safety      LLC        CAN-FD
  Monitor   Control     Handler
    └───────────┼───────────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
 Thermal     Swarm       Audit
 Manager   Coordinator   Logger
```

---

## 15. Reference

### 15.1 JEZGRO Porodica Proizvoda

Ovaj dokument opisuje JEZGRO-EK3, varijantu za module za punjenje. JEZGRO radi na više tipova uređaja u Elektrokombinacija ekosistemu:

| Dokument | Varijanta | Opis |
|----------|-----------|------|
| EK-TECH-021 | Pregled | [JEZGRO Porodica Proizvoda](21-jezgro-product-family.md) - Filozofija unificiranog kernela |
| EK-TECH-022 | JEZGRO-BAT | [BMS Firmver za Baterije](22-jezgro-bat.md) - Nadzor ćelija, balansiranje, SOC/SOH |
| EK-TECH-023 | JEZGRO-ROB | [Firmver Kontrolera Robota](23-jezgro-rob.md) - Kontrola pokreta, bezbednost |
| EK-TECH-024 | JEZGRO-GW | [Firmver Gateway-a](24-jezgro-gw.md) - V2G, ISO 15118, OCPP |
| EK-TECH-025 | Adapteri | [Adapter Uređaji](25-adapter-devices.md) - EK-ADAPT linija proizvoda |
| EK-TECH-026 | Hardver | [Hardverske Platforme](26-jezgro-hw-platforms.md) - PCB, MCU, konektori |

### 15.2 Povezani Tehnički Dokumenti

| Dokument | Opis |
|----------|------|
| EK-TECH-010 | Koncepti mikrokernel arhitekture |
| EK-TECH-014 | Arhitektura firmvera (FreeRTOS referenca) |
| EK-TECH-011 | Bezbednosni model |
| EK-TECH-005 | Swarm inteligencija |

### 15.3 Eksterne Reference

| Dokument | Opis |
|----------|------|
| ARM DDI0403E | Cortex-M4 tehnička referenca |
| ARM DDI0439D | Cortex-M4 MPU vodič za programiranje |

---

## Kontrola Dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-04 | Elektrokombinacija Inženjering | Inicijalni dokument |
| 1.1 | 2026-01-04 | Elektrokombinacija Inženjering | Dodato MPU izolacija, IPC protokol, EK3 integracija |
| 1.2 | 2026-01-04 | Elektrokombinacija Inženjering | Referenca na API i build sistem (detalji u EN verziji) |
| 2.0 | 2026-01-04 | Elektrokombinacija Inženjering | Rukovanje greškama, model drajvera, boot sekcije |
| 2.1 | 2026-01-04 | Elektrokombinacija Inženjering | Dodate reference na JEZGRO porodicu proizvoda |
