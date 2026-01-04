# EK-RTOS: Mikrokernel Operativni Sistem Realnog Vremena

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-017 |
| Verzija | 1.0 |
| Datum | 2026-01-04 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled

### 1.1 Šta je EK-RTOS?

EK-RTOS je mikrokernel operativni sistem realnog vremena specifično dizajniran za aplikacije energetske elektronike. Donosi principe pouzdanosti MINIX-a (izolacija grešaka, prosleđivanje poruka, automatski restart servisa) na mikrokontrolere sa ograničenim resursima.

### 1.2 Ciljevi Dizajna

| Cilj | Target |
|------|--------|
| Izolacija grešaka | MPU-bazirana, bez potrebe za MMU |
| Automatski oporavak | Restart servisa < 50ms |
| Realno vreme | Kašnjenje prekida < 1μs |
| Memorijski otisak | Kernel < 10KB |
| Ciljni MCU | Cortex-M3/M4/M7 sa MPU |

### 1.3 MINIX Inspiracija

```
┌─────────────────────────────────────────────────────────────┐
│              MINIX → EK-RTOS Mapiranje                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MINIX Koncept              EK-RTOS Implementacija          │
│  ────────────────           ─────────────────────           │
│                                                             │
│  MMU izolacija         →    MPU regioni (bez MMU)           │
│  User-space serveri    →    Neprivilegovani servisni taskovi│
│  Message passing IPC   →    Zero-copy deljena memorija IPC  │
│  Server za reinkarn.   →    Watchdog + auto-restart         │
│  Minimalni kernel      →    ~8KB kernel kod                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Arhitektura

### 2.1 Sistemski Slojevi

```
┌─────────────────────────────────────────────────────────────┐
│                     EK-RTOS ARHITEKTURA                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SLOJ 3: KORISNIČKI SERVISI (Neprivilegovani, MPU-izolovani)│
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Termalni │ │  Swarm  │ │  Audit  │ │  OCPP   │           │
│  │ Menadžer│ │  Koord. │ │  Logger │ │ Gateway │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│  ─────┴───────────┴───────────┴───────────┴────────────     │
│                 PROSLEĐIVANJE PORUKA (IPC)                  │
│  ──────────────────────────────────────────────────────     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SLOJ 2: KERNEL SERVISI                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           SERVER ZA REINKARNACIJU                     │  │
│  │  • Watchdog praćenje po servisu                       │  │
│  │  • Automatska detekcija grešaka                       │  │
│  │  • Restart servisa bez reseta sistema                 │  │
│  │  • Kukice za očuvanje stanja                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SLOJ 1: MIKROKERNEL (Privilegovan, ~8KB)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Scheduler │ │   MPU    │ │   IPC    │ │ Prekidi  │       │
│  │  (EDF)   │ │ Menadžer │ │  Redovi  │ │ Dispatch │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SLOJ 0: PRIVILEGOVANI DRAJVERI                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   LLC    │ │  CAN-FD  │ │   ADC    │ │   PWM    │       │
│  │ Kontrola │ │  Drajver │ │  Drajver │ │ (HRTIM)  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  HARDVER: STM32G474 (Cortex-M4 + MPU)                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Nivoi Privilegija

| Nivo | Naziv | Pristup | Primeri |
|------|-------|---------|---------|
| 0 | Kernel | Pun hardver | Scheduler, MPU, ISR-ovi |
| 1 | Drajver | Specifične periferije | LLC kontrola, CAN-FD |
| 2 | Servis | Samo sopstvena memorija | Termalni, Swarm, Audit |

### 2.3 Mapa Memorije (128KB RAM)

```
0x20020000 ┌──────────────────────────────────┐
           │  Kernel Prostor          8 KB   │ ← Privilegovan
           ├──────────────────────────────────┤
           │  LLC Control Task       16 KB   │ ← MPU Region 0
           ├──────────────────────────────────┤
           │  Safety Monitor          8 KB   │ ← MPU Region 1
           ├──────────────────────────────────┤
           │  CAN Handler             8 KB   │ ← MPU Region 2
           ├──────────────────────────────────┤
           │  Termalni Menadžer       8 KB   │ ← MPU Region 3
           ├──────────────────────────────────┤
           │  Swarm Koordinator      16 KB   │ ← MPU Region 4
           ├──────────────────────────────────┤
           │  Audit Logger           16 KB   │ ← MPU Region 5
           ├──────────────────────────────────┤
           │  IPC Bazen Poruka       32 KB   │ ← Deljeno
           ├──────────────────────────────────┤
           │  Stack Čuvari           16 KB   │ ← Zaštićeno
0x20000000 └──────────────────────────────────┘
```

---

## 3. Komponente Kernela

### 3.1 Scheduler

**Algoritam**: Earliest Deadline First (EDF) sa prioritetnim fallback-om

```c
typedef struct {
    ek_task_id_t   id;
    ek_priority_t  priority;      // Statički prioritet
    uint32_t       deadline;      // Apsolutni rok (tikovi)
    uint32_t       period;        // Period taska
    ek_state_t     state;         // READY, RUNNING, BLOCKED, SUSPENDED
    void*          stack_ptr;     // Sačuvan stack pointer
    mpu_region_t   mpu_config;    // MPU konfiguracija
} ek_tcb_t;
```

### 3.2 MPU Menadžer

**Cortex-M4 MPU**: 8 konfigurabilnih regiona

```c
void mpu_switch_context(ek_task_id_t task) {
    // Onemogući MPU tokom rekonfiguracije
    MPU->CTRL = 0;

    // Konfiguriši regione za ovaj task
    for (int r = 0; r < task->num_regions; r++) {
        MPU->RNR  = r;
        MPU->RBAR = (uint32_t)task->regions[r].base | MPU_RBAR_VALID;
        MPU->RASR = compute_rasr(&task->regions[r]);
    }

    // Ponovo omogući MPU
    MPU->CTRL = MPU_CTRL_ENABLE | MPU_CTRL_PRIVDEFENA;
}
```

### 3.3 IPC Sistem

**Dizajn**: Zero-copy prosleđivanje poruka inspirisano MINIX-om

```c
// Struktura poruke (64-byte poravnata za keš efikasnost)
typedef struct {
    uint16_t src;           // ID izvornog servisa
    uint16_t dst;           // ID odredišnog servisa
    uint16_t type;          // Tip poruke
    uint16_t flags;         // Zastavice (SYNC, ASYNC, itd.)
    uint32_t seq;           // Redni broj
    uint32_t timestamp;     // Vremenska oznaka (tikovi)
    uint8_t  payload[48];   // Podaci
} __attribute__((aligned(64))) ek_msg_t;

// Sinhrono slanje (blokira dok se ne primi)
ek_err_t ek_send(ek_svc_id_t dst, ek_msg_t* msg);

// Sinhrono primanje (blokira dok poruka nije dostupna)
ek_err_t ek_receive(ek_svc_id_t src, ek_msg_t* msg);
```

### 3.4 Server za Reinkarnaciju

**Inspirisan MINIX RS (Reincarnation Server)**

```c
void handle_service_fault(ek_svc_id_t svc, fault_type_t fault) {
    // 1. Zabeleži grešku
    audit_log(EVENT_SERVICE_FAULT, svc, fault);

    // 2. Obavesti druge servise
    ek_msg_t msg = { .type = MSG_SERVICE_DOWN };
    ek_broadcast(&msg);

    // 3. Sačuvaj stanje servisa ako je moguće
    if (services[svc].saved_state != NULL) {
        save_service_state(svc);
    }

    // 4. Resetuj memorijski region servisa
    memset(services[svc].memory_base, 0, services[svc].memory_size);

    // 5. Restartuj servis
    services[svc].restart_count++;
    service_init(svc);
    services[svc].state = SVC_RUNNING;

    // 6. Obavesti da je oporavak završen
    msg.type = MSG_SERVICE_UP;
    ek_broadcast(&msg);
}
```

---

## 4. Razvoj Servisa

### 4.1 Šablon Servisa

```c
// Definicija servisa
EK_SERVICE_DEFINE(thermal_manager,
    .priority = EK_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// Glavna petlja servisa
void thermal_manager_main(void) {
    ek_msg_t msg;

    while (1) {
        // Nahrani watchdog
        ek_watchdog_feed();

        // Čekaj poruku ili timeout
        if (ek_receive_timeout(ANY, &msg, 100) == EK_OK) {
            handle_message(&msg);
        }

        // Periodični rad
        check_thermal_limits();
    }
}
```

---

## 5. Garancije Realnog Vremena

### 5.1 Analiza Vremena

| Operacija | Najgori Slučaj | Tipično |
|-----------|----------------|---------|
| Kašnjenje prekida | 500 ns | 200 ns |
| Promena konteksta | 2 μs | 500 ns |
| IPC slanje (sinhr.) | 5 μs | 1 μs |
| IPC primanje | 3 μs | 500 ns |
| Restart servisa | 50 ms | 10 ms |

### 5.2 LLC Kontrolna Putanja

```c
// LLC kontrola radi kao ISR najvišeg prioriteta
// Garantovan < 1μs odziv

__attribute__((section(".kernel.isr")))
void HRTIM_TIMA_IRQHandler(void) {
    // Čitaj ADC (DMA pre-učitan)
    int32_t i_actual = adc_buffer[0];

    // PID izračunavanje
    int32_t error = i_setpoint - i_actual;
    int32_t duty = Kp * error + Ki * integral + Kd * derivative;

    // Ograniči i primeni
    duty = CLAMP(duty, DUTY_MIN, DUTY_MAX);
    HRTIM1->sTimerxRegs[0].CMP1xR = duty;
}
```

---

## 6. Poređenje sa Alternativama

| Osobina | EK-RTOS | FreeRTOS | Zephyr | seL4 | MINIX 3 |
|---------|---------|----------|--------|------|---------|
| Tip kernela | Mikrokernel | Monolitni | Hibridni | Mikrokernel | Mikrokernel |
| Izolacija grešaka | MPU | Opciono | MPU | MMU | MMU |
| Auto-restart | Da | Ne | Ne | Ne | Da |
| Tvrdo realno vreme | Da | Da | Da | Ne | Ne |
| Min RAM | 32 KB | 8 KB | 32 KB | 256 KB | 16 MB |
| MMU potreban | Ne | Ne | Ne | Da | Da |
| Energetska elektr. | Dizajniran za | Generički | Generički | Ne | Ne |

---

## 7. Status Implementacije

### 7.1 Plan Razvoja

| Faza | Komponenta | Status | Cilj |
|------|-----------|--------|------|
| 1 | Jezgro kernela | Planirano | Q1 2026 |
| 1 | MPU menadžer | Planirano | Q1 2026 |
| 2 | IPC sistem | Planirano | Q2 2026 |
| 2 | Server za reinkarnaciju | Planirano | Q2 2026 |
| 3 | LLC drajver | Planirano | Q2 2026 |
| 4 | Framework servisa | Planirano | Q3 2026 |

---

## Kontrola Dokumenta

| Verzija | Datum | Autor | Izmene |
|---------|-------|-------|--------|
| 1.0 | 2026-01-04 | Elektrokombinacija Inženjering | Inicijalni dokument |
