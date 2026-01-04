# EK3 Arhitektura Firmware-a

## Informacije o Dokumentu

| Polje | Vrednost |
|-------|----------|
| ID Dokumenta | EK-TECH-014 |
| Verzija | 1.0 |
| Datum | 2026-01-03 |
| Status | Aktivan |
| Autor | Elektrokombinacija Inženjering |

---

## 1. Pregled Arhitekture Firmware-a

### 1.1 Mikrokernel Principi u Embedded Kontekstu

EK3 firmware primenjuje mikrokernel principe na STM32G474:

| Koncept | Implementacija |
|---------|----------------|
| Minimalni kernel | ISR + kontrola energetskog stepena (~20 KB) |
| Korisnički procesi | RTOS taskovi (health, thermal, swarm, logging) |
| IPC | FreeRTOS queues i semafore |
| Izolacija memorije | MPU regioni |
| Fault recovery | Watchdog + restart task-a |

### 1.2 Dijagram Arhitekture Firmware-a

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEK FIRMWARE-a EK3                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    APLIKACIONI SLOJ                              │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │    │
│  │  │ Health  │ │ Thermal │ │ Swarm   │ │ Logger  │ │ Diag    │   │    │
│  │  │ Task    │ │ Task    │ │ Task    │ │ Task    │ │ Task    │   │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │    │
│  │       │           │           │           │           │        │    │
│  │       └───────────┴───────────┴───────────┴───────────┘        │    │
│  │                              │                                  │    │
│  └──────────────────────────────┼──────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │                    RTOS SLOJ (FreeRTOS)                         │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │    │
│  │  │ Scheduler│ │ Queues  │ │Semaphores│ │ Timers  │               │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │                    KERNEL SLOJ                                   │    │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │    │
│  │  │ ISR Zaštite │ │ PWM Kontrola│ │ CAN Drajver │               │    │
│  │  │ (OCP/OVP)   │ │ (LLC)       │ │ (TX/RX)     │               │    │
│  │  └─────────────┘ └─────────────┘ └─────────────┘               │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │                    HAL SLOJ (STM32 HAL)                         │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │    │
│  │  │GPIO │ │ ADC │ │Timer│ │ DMA │ │ SPI │ │ I2C │ │FLASH│     │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                 │                                        │
│  ┌──────────────────────────────▼──────────────────────────────────┐    │
│  │                    HARDVER                                       │    │
│  │              STM32G474 @ 170 MHz + Energetski Stepen             │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. RTOS Izbor i Konfiguracija

### 2.1 FreeRTOS vs Zephyr vs Bare-metal

| Kriterijum | FreeRTOS | Zephyr | Bare-metal |
|------------|----------|--------|------------|
| Zrelost | Odličan | Dobar | N/A |
| STM32 podrška | Nativna (ST) | Dobra | N/A |
| Footprint | ~10 KB | ~50 KB | 0 |
| Bezbednosne funkcije | Osnovne | Napredne | Ručno |
| Kompleksnost | Niska | Srednja | Visoka |
| Real-time | Da | Da | Da |
| **Preporuka** | **Da** | Alternativa | Ne |

### 2.2 FreeRTOS Konfiguracija

```c
/* FreeRTOSConfig.h - Ključne postavke */

#define configUSE_PREEMPTION                    1
#define configUSE_TIME_SLICING                  0   /* Eksplicitne yield */
#define configUSE_TICKLESS_IDLE                 0   /* Uvek u toku */
#define configCPU_CLOCK_HZ                      170000000
#define configTICK_RATE_HZ                      1000  /* 1ms tick */
#define configMAX_PRIORITIES                    10
#define configMINIMAL_STACK_SIZE                256   /* words */
#define configTOTAL_HEAP_SIZE                   32768 /* 32 KB heap */

/* Stack overflow detekcija */
#define configCHECK_FOR_STACK_OVERFLOW          2  /* Obrazac detekcije */
#define configUSE_MALLOC_FAILED_HOOK            1

/* Statistika za debugging */
#define configGENERATE_RUN_TIME_STATS           1
#define configUSE_TRACE_FACILITY                1

/* Koroutine - ne koristimo */
#define configUSE_CO_ROUTINES                   0

/* Timeri */
#define configUSE_TIMERS                        1
#define configTIMER_TASK_PRIORITY               (configMAX_PRIORITIES - 2)
#define configTIMER_QUEUE_LENGTH                10
#define configTIMER_TASK_STACK_DEPTH            256

/* MPU (Memory Protection Unit) */
#define configENABLE_MPU                        1
#define configENABLE_FPU                        1
```

### 2.3 Model Taskova

```c
/* Definicije taskova */
typedef struct {
    const char *name;
    TaskFunction_t function;
    uint16_t stack_size;    /* u words */
    UBaseType_t priority;
    uint32_t period_ms;     /* 0 = event-driven */
} TaskConfig_t;

static const TaskConfig_t task_configs[] = {
    /* Ime             Funkcija           Stek   Prio  Period */
    { "PowerCtrl",     PowerControlTask,  1024,  9,    0      },
    { "Thermal",       ThermalTask,       512,   7,    10     },
    { "SwarmCoord",    SwarmTask,         1024,  6,    100    },
    { "Health",        HealthTask,        512,   5,    1000   },
    { "CANProcess",    CANProcessTask,    1024,  8,    0      },
    { "Logger",        LoggerTask,        512,   2,    0      },
    { "Diagnostics",   DiagTask,          512,   1,    0      },
};

#define NUM_TASKS (sizeof(task_configs) / sizeof(TaskConfig_t))
```

---

## 3. Raspoređivanje Taskova i Prioriteti

### 3.1 Nivoi Prioriteta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PRIORITETI TASKOVA                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Nivo Prioriteta (0 = najniži, 9 = najviši)                             │
│                                                                          │
│  P9 ──────────────────────────────────────────────────────────────────  │
│  │ PowerControlTask                                                     │
│  │ • Kontrolna petlja snage (1 kHz)                                    │
│  │ • Odziv na promene opterećenja                                      │
│  │ • Primanje power komandi                                             │
│  │                                                                       │
│  P8 ──────────────────────────────────────────────────────────────────  │
│  │ CANProcessTask                                                       │
│  │ • Obrada primljenih CAN poruka                                      │
│  │ • Slanje heartbeat-a                                                │
│  │ • Izbor lidera (Raft)                                               │
│  │                                                                       │
│  P7 ──────────────────────────────────────────────────────────────────  │
│  │ ThermalTask                                                          │
│  │ • Čitanje senzora temperature (100 Hz)                              │
│  │ • Kontrola ventilatora                                               │
│  │ • Thermal throttling                                                 │
│  │                                                                       │
│  P6 ──────────────────────────────────────────────────────────────────  │
│  │ SwarmCoordTask                                                       │
│  │ • Balansiranje opterećenja                                          │
│  │ • Deljenje termalnih podataka                                       │
│  │ • Koordinacija sa vršnjacima                                        │
│  │                                                                       │
│  P5 ──────────────────────────────────────────────────────────────────  │
│  │ HealthTask                                                           │
│  │ • Praćenje MTBF                                                      │
│  │ • Self-test rutine                                                   │
│  │ • Detekcija degradacije                                              │
│  │                                                                       │
│  P2 ──────────────────────────────────────────────────────────────────  │
│  │ LoggerTask                                                           │
│  │ • Pisanje u flash                                                    │
│  │ • Batch upload                                                       │
│  │                                                                       │
│  P1 ──────────────────────────────────────────────────────────────────  │
│  │ DiagnosticsTask                                                      │
│  │ • Idle dijagnostika                                                  │
│  │ • Pozadinski testovi                                                 │
│  │                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 ISR Prioriteti (van RTOS-a)

```c
/* NVIC Prioriteti (niži broj = viši prioritet) */
/* STM32G4: 4 bita prioriteta (0-15) */

#define IRQ_PRIO_HIGHEST        0   /* Hardverska zaštita */
#define IRQ_PRIO_PWM            1   /* HRTIM PWM */
#define IRQ_PRIO_ADC            2   /* ADC DMA complete */
#define IRQ_PRIO_CAN            3   /* CAN RX/TX */
#define IRQ_PRIO_TIMER          4   /* Sistemski tajmer */
#define IRQ_PRIO_RTOS_SYSCALL   5   /* FreeRTOS SVC/PendSV */
#define IRQ_PRIO_UART           6   /* Debug UART */
#define IRQ_PRIO_I2C            7   /* Senzori */

/* FreeRTOS konfig za koegzistenciju sa ISR */
#define configLIBRARY_LOWEST_INTERRUPT_PRIORITY         15
#define configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY    5

/* Napomena: ISR sa prioritetom < 5 ne smeju zvati FreeRTOS funkcije */
```

### 3.3 Garancije Deadlines

| Task | Period | Deadline | WCET | Margina |
|------|--------|----------|------|---------|
| PowerCtrl | 1 ms | 1 ms | 200 µs | 80% |
| CANProcess | event | 1 ms | 150 µs | 85% |
| Thermal | 10 ms | 10 ms | 1 ms | 90% |
| Swarm | 100 ms | 100 ms | 10 ms | 90% |
| Health | 1000 ms | 1000 ms | 50 ms | 95% |
| Logger | event | 100 ms | 20 ms | 80% |

### 3.4 Strategija Watchdog-a

```c
/* Dual watchdog pristup */

/* 1. IWDG (Independent Watchdog) - zadnji resort */
#define IWDG_TIMEOUT_MS     100

void InitIWDG(void) {
    IWDG->KR = 0x5555;           /* Omogući pristup registrima */
    IWDG->PR = IWDG_PRESCALER_64;/* 40kHz/64 = 625 Hz */
    IWDG->RLR = 62;              /* 62/625 ≈ 100 ms */
    IWDG->KR = 0xCCCC;           /* Start IWDG */
}

void RefreshIWDG(void) {
    IWDG->KR = 0xAAAA;           /* Reload */
}

/* 2. WWDG (Window Watchdog) - za kritične sekcije */
#define WWDG_WINDOW_MS      50

void InitWWDG(void) {
    __HAL_RCC_WWDG_CLK_ENABLE();
    WWDG->CFR = 0x7F | WWDG_CFR_W_6 | WWDG_CFR_WDGTB_1;
    WWDG->CR = WWDG_CR_WDGA | 0x7F;
}

/* 3. Per-task watchdog (softverski) */
typedef struct {
    uint32_t last_checkin;
    uint32_t timeout_ms;
} TaskWatchdog_t;

static TaskWatchdog_t task_watchdogs[NUM_TASKS];

void TaskCheckin(uint8_t task_id) {
    task_watchdogs[task_id].last_checkin = xTaskGetTickCount();
}

void MonitorTaskWatchdogs(void) {
    uint32_t now = xTaskGetTickCount();
    for (int i = 0; i < NUM_TASKS; i++) {
        if ((now - task_watchdogs[i].last_checkin) >
            pdMS_TO_TICKS(task_watchdogs[i].timeout_ms)) {
            HandleTaskTimeout(i);
        }
    }
}
```

---

## 4. Particionisanje Memorije

### 4.1 Flash Layout (512 KB STM32G474)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLASH MEMORY LAYOUT                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Adresa       │ Veličina │ Sadržaj                                      │
│  ─────────────┼──────────┼─────────────────────────────────────────────  │
│               │          │                                               │
│  0x0800_0000  │ 16 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         BOOTLOADER                     │  │
│               │          │ │  • Secure boot verifikacija             │  │
│               │          │ │  • A/B slot selekcija                   │  │
│               │          │ │  • Fallback logika                      │  │
│  0x0800_4000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0800_4000  │ 192 KB   │ ┌─────────────────────────────────────────┐  │
│               │          │ │         APLIKACIJA SLOT A               │  │
│               │          │ │  • Aktivna slika firmware-a             │  │
│               │          │ │  • Sadrži: kernel + servisi + HAL       │  │
│               │          │ │                                         │  │
│  0x0803_4000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0803_4000  │ 192 KB   │ ┌─────────────────────────────────────────┐  │
│               │          │ │         APLIKACIJA SLOT B               │  │
│               │          │ │  • Rezervna/nova slika                  │  │
│               │          │ │  • Za OTA update                        │  │
│               │          │ │                                         │  │
│  0x0806_4000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0806_4000  │ 16 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         KONFIGURACIJA                   │  │
│               │          │ │  • Parametri modula                     │  │
│               │          │ │  • Kalibracioni podaci                  │  │
│               │          │ │  • CRC32 zaštićeno                      │  │
│  0x0806_8000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0806_8000  │ 64 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         AUDIT LOG                       │  │
│               │          │ │  • Kružni bafer                         │  │
│               │          │ │  • ~8000 unosa × 8 bytes                │  │
│               │          │ │                                         │  │
│  0x0807_8000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0807_8000  │ 8 KB     │ ┌─────────────────────────────────────────┐  │
│               │          │ │         OTP KLJUČEVI                    │  │
│               │          │ │  • Root key (256-bit)                   │  │
│               │          │ │  • Device ID                            │  │
│               │          │ │  • Version counter (anti-rollback)      │  │
│  0x0807_A000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x0807_A000  │ 24 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         REZERVISANO                     │  │
│               │          │ │  • Buduće proširenje                    │  │
│  0x0808_0000  │          │ └─────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 RAM Layout (128 KB)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RAM MEMORY LAYOUT                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Adresa       │ Veličina │ Sadržaj                                      │
│  ─────────────┼──────────┼─────────────────────────────────────────────  │
│               │          │                                               │
│  0x2000_0000  │ 16 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         DMA BAFERI                      │  │
│               │          │ │  • ADC bafer (poravnat)                 │  │
│               │          │ │  • CAN TX/RX baferi                     │  │
│               │          │ │  • SPI baferi                           │  │
│  0x2000_4000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x2000_4000  │ 32 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         FREERTOS HEAP                   │  │
│               │          │ │  • Dinamička alokacija taskova          │  │
│               │          │ │  • Queues, semaphores                   │  │
│               │          │ │  • heap_4 scheme                        │  │
│  0x2000_C000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x2000_C000  │ 48 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         TASK STEKOVI                    │  │
│               │          │ │  PowerCtrl: 4 KB                        │  │
│               │          │ │  CANProcess: 4 KB                       │  │
│               │          │ │  Thermal: 2 KB                          │  │
│               │          │ │  Swarm: 4 KB                            │  │
│               │          │ │  Health: 2 KB                           │  │
│               │          │ │  Logger: 2 KB                           │  │
│               │          │ │  Diag: 2 KB                             │  │
│               │          │ │  Idle: 1 KB                             │  │
│               │          │ │  Timer: 1 KB                            │  │
│               │          │ │  (Rezerva): 26 KB                       │  │
│  0x2001_8000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x2001_8000  │ 16 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         GLOBALNI PODACI                 │  │
│               │          │ │  • Stanje modula                        │  │
│               │          │ │  • Tabele konfiguracije                 │  │
│               │          │ │  • Runtime statistika                   │  │
│  0x2001_C000  │          │ └─────────────────────────────────────────┘  │
│               │          │                                               │
│  0x2001_C000  │ 16 KB    │ ┌─────────────────────────────────────────┐  │
│               │          │ │         ISR STEK + SCRATCH              │  │
│               │          │ │  • MSP stek (ISR)                       │  │
│               │          │ │  • Privremeni baferi                    │  │
│  0x2002_0000  │          │ └─────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 MPU Konfiguracija

```c
/* Memory Protection Unit konfiguracija */

void ConfigureMPU(void) {
    /* Onemogući MPU tokom konfiguracije */
    HAL_MPU_Disable();

    MPU_Region_InitTypeDef mpu_config = {0};

    /* Region 0: Flash - Execute, Read-Only */
    mpu_config.Enable = MPU_REGION_ENABLE;
    mpu_config.Number = MPU_REGION_NUMBER0;
    mpu_config.BaseAddress = 0x08000000;
    mpu_config.Size = MPU_REGION_SIZE_512KB;
    mpu_config.AccessPermission = MPU_REGION_PRIV_RO_URO;
    mpu_config.DisableExec = MPU_INSTRUCTION_ACCESS_ENABLE;
    mpu_config.IsShareable = MPU_ACCESS_NOT_SHAREABLE;
    mpu_config.IsCacheable = MPU_ACCESS_CACHEABLE;
    mpu_config.IsBufferable = MPU_ACCESS_NOT_BUFFERABLE;
    HAL_MPU_ConfigRegion(&mpu_config);

    /* Region 1: RAM - Read/Write, No Execute */
    mpu_config.Number = MPU_REGION_NUMBER1;
    mpu_config.BaseAddress = 0x20000000;
    mpu_config.Size = MPU_REGION_SIZE_128KB;
    mpu_config.AccessPermission = MPU_REGION_FULL_ACCESS;
    mpu_config.DisableExec = MPU_INSTRUCTION_ACCESS_DISABLE;  /* XN */
    mpu_config.IsCacheable = MPU_ACCESS_CACHEABLE;
    mpu_config.IsBufferable = MPU_ACCESS_BUFFERABLE;
    HAL_MPU_ConfigRegion(&mpu_config);

    /* Region 2: Periferije - Read/Write, No Execute */
    mpu_config.Number = MPU_REGION_NUMBER2;
    mpu_config.BaseAddress = 0x40000000;
    mpu_config.Size = MPU_REGION_SIZE_512MB;
    mpu_config.AccessPermission = MPU_REGION_FULL_ACCESS;
    mpu_config.DisableExec = MPU_INSTRUCTION_ACCESS_DISABLE;
    mpu_config.IsCacheable = MPU_ACCESS_NOT_CACHEABLE;
    mpu_config.IsBufferable = MPU_ACCESS_BUFFERABLE;
    HAL_MPU_ConfigRegion(&mpu_config);

    /* Region 3: Stack Guard - No Access (fault trap) */
    mpu_config.Number = MPU_REGION_NUMBER3;
    mpu_config.BaseAddress = 0x2001BF00;  /* Između stekova */
    mpu_config.Size = MPU_REGION_SIZE_256B;
    mpu_config.AccessPermission = MPU_REGION_NO_ACCESS;
    mpu_config.DisableExec = MPU_INSTRUCTION_ACCESS_DISABLE;
    HAL_MPU_ConfigRegion(&mpu_config);

    /* Omogući MPU sa default memory map za nemapirane regione */
    HAL_MPU_Enable(MPU_PRIVILEGED_DEFAULT);
}
```

---

## 5. Secure Boot Lanac

### 5.1 Boot Sekvenca

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SECURE BOOT SEKVENCA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  POWER ON                                                                │
│      │                                                                   │
│      ▼                                                                   │
│  ┌─────────────────────────────────┐                                    │
│  │  ST ROM Bootloader (internal)   │                                    │
│  │  • Provera option bytes         │                                    │
│  │  • RDP level enforcing          │                                    │
│  │  • Jump to 0x08000000           │                                    │
│  └───────────────┬─────────────────┘                                    │
│                  │                                                       │
│                  ▼                                                       │
│  ┌─────────────────────────────────┐                                    │
│  │  Custom Bootloader (16 KB)      │                                    │
│  │  • Inicijalizacija hardvera     │                                    │
│  │  • Čitanje active slot markera  │                                    │
│  │  • Provera potpisa aplikacije   │                                    │
│  └───────────────┬─────────────────┘                                    │
│                  │                                                       │
│          ┌───────┴───────┐                                              │
│          │               │                                              │
│          ▼               ▼                                              │
│  ┌──────────────┐ ┌──────────────┐                                      │
│  │   SLOT A     │ │   SLOT B     │                                      │
│  │  Validna?    │ │  Validna?    │                                      │
│  └──────┬───────┘ └──────┬───────┘                                      │
│         │                │                                               │
│    ┌────┴────────────────┴────┐                                         │
│    │ Selekcija po pravilu:    │                                         │
│    │ 1. Preferiran marker     │                                         │
│    │ 2. Veća verzija          │                                         │
│    │ 3. Slot A default        │                                         │
│    └────────────┬─────────────┘                                         │
│                 │                                                        │
│                 ▼                                                        │
│  ┌─────────────────────────────────┐                                    │
│  │  Verifikacija potpisa          │                                     │
│  │  Ed25519 ili ECDSA-P256        │                                     │
│  │  Javni ključ u OTP             │                                     │
│  └───────────────┬─────────────────┘                                    │
│                  │                                                       │
│          ┌───────┴───────┐                                              │
│          │               │                                              │
│       Potpis OK      Potpis FAIL                                        │
│          │               │                                              │
│          ▼               ▼                                              │
│  ┌──────────────┐ ┌──────────────────────┐                              │
│  │ Jump to App  │ │ Pokušaj drugi slot   │                              │
│  │              │ │ Ako oba fail → HALT  │                              │
│  └──────────────┘ └──────────────────────┘                              │
│         │                                                                │
│         ▼                                                                │
│  ┌─────────────────────────────────┐                                    │
│  │  RTOS Kernel Init               │                                    │
│  │  • SystemClock_Config()         │                                    │
│  │  • HAL_Init()                   │                                    │
│  │  • Kreiranje taskova            │                                    │
│  │  • vTaskStartScheduler()        │                                    │
│  └─────────────────────────────────┘                                    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Potpisivanje Firmware-a

```c
/* Zaglavlje slike firmware-a */
typedef struct __attribute__((packed)) {
    uint32_t magic;           /* 0x454B3346 = "EK3F" */
    uint32_t version;         /* Major.Minor.Patch encoded */
    uint32_t size;            /* Veličina payload-a u bytes */
    uint32_t crc32;           /* CRC32 payload-a */
    uint32_t build_time;      /* Unix timestamp build-a */
    uint8_t  signature[64];   /* Ed25519 potpis */
    uint8_t  reserved[52];    /* Padding na 128 bytes */
} FirmwareHeader_t;

_Static_assert(sizeof(FirmwareHeader_t) == 128, "Header mora biti 128 bytes");

/* Verifikacija potpisa u bootloader-u */
bool VerifyFirmwareSignature(uint32_t slot_addr) {
    FirmwareHeader_t *header = (FirmwareHeader_t *)slot_addr;

    /* Provera magic */
    if (header->magic != 0x454B3346) {
        return false;
    }

    /* Provera verzije protiv rollback counter-a */
    uint32_t min_version = ReadOTPVersionCounter();
    if (header->version < min_version) {
        return false;  /* Anti-rollback */
    }

    /* Provera CRC payload-a */
    uint32_t calc_crc = CalculateCRC32(
        (uint8_t *)(slot_addr + sizeof(FirmwareHeader_t)),
        header->size
    );
    if (calc_crc != header->crc32) {
        return false;
    }

    /* Verifikacija Ed25519 potpisa */
    uint8_t public_key[32];
    ReadOTPPublicKey(public_key);

    uint8_t message[12];
    memcpy(message, &header->version, 4);
    memcpy(message + 4, &header->size, 4);
    memcpy(message + 8, &header->crc32, 4);

    return ed25519_verify(header->signature, message, 12, public_key);
}
```

### 5.3 Anti-Rollback Zaštita

```c
/* OTP Version Counter */
#define OTP_VERSION_ADDR    0x1FFF7080
#define OTP_VERSION_BITS    32          /* 32 bita = 32 major verzije */

uint32_t ReadOTPVersionCounter(void) {
    volatile uint32_t *otp = (volatile uint32_t *)OTP_VERSION_ADDR;
    uint32_t counter = 0;

    /* Brojimo postavljene bite */
    uint32_t val = *otp;
    while (val) {
        counter++;
        val >>= 1;
    }
    return counter;
}

bool IncrementOTPVersionCounter(void) {
    uint32_t current = ReadOTPVersionCounter();
    if (current >= 32) {
        return false;  /* OTP pun */
    }

    /* Postavi sledeći bit */
    uint32_t new_val = (1 << current);

    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, OTP_VERSION_ADDR,
                      *(volatile uint32_t *)OTP_VERSION_ADDR | new_val);
    HAL_FLASH_Lock();

    return true;
}
```

---

## 6. Inter-Task Komunikacija

### 6.1 Redovi Poruka

```c
/* Definicije redova */
#define POWER_CMD_QUEUE_LEN     8
#define CAN_RX_QUEUE_LEN        32
#define LOG_EVENT_QUEUE_LEN     64

typedef struct {
    uint16_t target_power;
    uint16_t target_voltage;
    uint8_t command;
    uint8_t source;
} PowerCommand_t;

typedef struct {
    uint32_t id;
    uint8_t data[64];
    uint8_t dlc;
} CANMessage_t;

/* Kreiranje redova */
QueueHandle_t xPowerCmdQueue;
QueueHandle_t xCANRxQueue;
QueueHandle_t xLogEventQueue;

void CreateQueues(void) {
    xPowerCmdQueue = xQueueCreate(POWER_CMD_QUEUE_LEN, sizeof(PowerCommand_t));
    xCANRxQueue = xQueueCreate(CAN_RX_QUEUE_LEN, sizeof(CANMessage_t));
    xLogEventQueue = xQueueCreate(LOG_EVENT_QUEUE_LEN, sizeof(LogEntry_t));
}

/* Slanje u red (iz ISR-a) */
void CAN_RxCallback(CAN_HandleTypeDef *hcan) {
    CANMessage_t msg;
    /* ... popuni msg iz hcan ... */

    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xQueueSendFromISR(xCANRxQueue, &msg, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

/* Primanje iz reda (u task-u) */
void CANProcessTask(void *pvParameters) {
    CANMessage_t msg;
    for (;;) {
        if (xQueueReceive(xCANRxQueue, &msg, portMAX_DELAY) == pdTRUE) {
            ProcessCANMessage(&msg);
        }
    }
}
```

### 6.2 Deljeno Stanje

```c
/* Atomic promenljive za status */
#include <stdatomic.h>

typedef struct {
    _Atomic uint8_t state;
    _Atomic uint16_t output_power;
    _Atomic uint16_t temperature;
    _Atomic uint32_t error_flags;
} ModuleStatus_t;

static ModuleStatus_t g_module_status;

/* Thread-safe čitanje */
uint8_t GetModuleState(void) {
    return atomic_load(&g_module_status.state);
}

/* Thread-safe pisanje */
void SetModuleState(uint8_t new_state) {
    uint8_t old_state = atomic_exchange(&g_module_status.state, new_state);
    if (old_state != new_state) {
        LogStateChange(old_state, new_state);
    }
}

/* Mutex za kompleksne operacije */
static SemaphoreHandle_t xConfigMutex;

bool UpdateConfiguration(const Config_t *new_config) {
    if (xSemaphoreTake(xConfigMutex, pdMS_TO_TICKS(100)) == pdTRUE) {
        memcpy(&g_config, new_config, sizeof(Config_t));
        SaveConfigToFlash(&g_config);
        xSemaphoreGive(xConfigMutex);
        return true;
    }
    return false;  /* Timeout */
}
```

### 6.3 Event Grupe

```c
/* Event flags za koordinaciju */
#define EVT_POWER_READY     (1 << 0)
#define EVT_THERMAL_OK      (1 << 1)
#define EVT_CAN_CONNECTED   (1 << 2)
#define EVT_FAULT_DETECTED  (1 << 3)
#define EVT_SHUTDOWN_REQ    (1 << 4)

static EventGroupHandle_t xSystemEvents;

void CreateEventGroups(void) {
    xSystemEvents = xEventGroupCreate();
}

/* Čekanje na više uslova */
void WaitForSystemReady(void) {
    EventBits_t required = EVT_POWER_READY | EVT_THERMAL_OK | EVT_CAN_CONNECTED;
    EventBits_t bits = xEventGroupWaitBits(
        xSystemEvents,
        required,
        pdFALSE,        /* Ne briši bite */
        pdTRUE,         /* Čekaj SVE bite */
        pdMS_TO_TICKS(5000)
    );

    if ((bits & required) != required) {
        /* Timeout - sistem nije spreman */
        HandleStartupTimeout(bits);
    }
}

/* Signalizacija događaja */
void SignalFault(void) {
    xEventGroupSetBits(xSystemEvents, EVT_FAULT_DETECTED);
}
```

---

## 7. Obrada Grešaka

### 7.1 HardFault Handler

```c
/* Snimanje konteksta pri HardFault-u */
typedef struct {
    uint32_t r0, r1, r2, r3;
    uint32_t r12, lr, pc, psr;
    uint32_t cfsr, hfsr, dfsr;
    uint32_t afsr, bfar, mmar;
} FaultContext_t;

void HardFault_Handler(void) {
    __asm volatile (
        "TST lr, #4          \n"
        "ITE EQ              \n"
        "MRSEQ r0, MSP       \n"
        "MRSNE r0, PSP       \n"
        "B HardFault_Handler_C \n"
    );
}

void HardFault_Handler_C(uint32_t *stack) {
    FaultContext_t ctx;

    /* Snimi registre sa steka */
    ctx.r0 = stack[0];
    ctx.r1 = stack[1];
    ctx.r2 = stack[2];
    ctx.r3 = stack[3];
    ctx.r12 = stack[4];
    ctx.lr = stack[5];
    ctx.pc = stack[6];
    ctx.psr = stack[7];

    /* Snimi fault status registre */
    ctx.cfsr = SCB->CFSR;
    ctx.hfsr = SCB->HFSR;
    ctx.dfsr = SCB->DFSR;
    ctx.afsr = SCB->AFSR;
    ctx.bfar = SCB->BFAR;
    ctx.mmar = SCB->MMFAR;

    /* Snimi u flash za post-mortem */
    SaveFaultContext(&ctx);

    /* Pokreni bezbedno gašenje */
    EmergencyShutdown();

    /* Reset */
    NVIC_SystemReset();
}
```

### 7.2 Stack Overflow Detekcija

```c
/* FreeRTOS stack overflow hook */
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName) {
    /* Loguj pre reseta */
    LogEntry_t entry = {
        .timestamp = GetTimestamp(),
        .event_code = EVT_STACK_OVERFLOW,
        .severity = 4,  /* Critical */
        .data = GetTaskId(pcTaskName)
    };

    /* Piši direktno u flash (bez RTOS-a) */
    DirectFlashWrite(&entry, sizeof(entry));

    /* Bezbedno gašenje */
    EmergencyShutdown();

    /* Reset */
    NVIC_SystemReset();
}
```

### 7.3 Watchdog Timeout

```c
/* IWDG interrupt (early warning) */
void IWDG_IRQHandler(void) {
    /* Poslednja šansa pre reseta */

    /* Loguj */
    LogEntry_t entry = {
        .timestamp = GetTimestamp(),
        .event_code = EVT_WATCHDOG_RESET,
        .severity = 3,
        .data = GetCurrentTaskId()
    };
    DirectFlashWrite(&entry, sizeof(entry));

    /* Očisti sensitive podatke */
    ZeroizeSensitiveMemory();

    /* Nemoj resetovati IWDG - pusti da istekne i resetuje */
}
```

---

## 8. Mehanizam Ažuriranja (OTA)

### 8.1 A/B Particionisanje

```c
/* Marker za aktivni slot */
#define SLOT_A_ADDR     0x08004000
#define SLOT_B_ADDR     0x08034000
#define SLOT_MARKER     0x0806FF00

typedef struct {
    uint32_t active_slot;   /* 'A' ili 'B' */
    uint32_t boot_count;
    uint32_t last_boot_ok;
    uint32_t crc32;
} SlotMarker_t;

/* Izbor slota pri boot-u */
uint32_t SelectActiveSlot(void) {
    SlotMarker_t *marker = (SlotMarker_t *)SLOT_MARKER;

    /* Proveri validnost markera */
    if (CalculateCRC32(marker, 12) != marker->crc32) {
        return SLOT_A_ADDR;  /* Default na A */
    }

    /* Proveri boot count za detekciju boot loopa */
    if (marker->boot_count > 3 && !marker->last_boot_ok) {
        /* Previše neuspelih boot-ova, probaj drugi slot */
        return (marker->active_slot == 'A') ? SLOT_B_ADDR : SLOT_A_ADDR;
    }

    return (marker->active_slot == 'A') ? SLOT_A_ADDR : SLOT_B_ADDR;
}
```

### 8.2 Download Protokol

```c
/* Chunk-based download preko CAN */
#define FW_CHUNK_SIZE   256

typedef struct {
    uint32_t total_size;
    uint32_t total_chunks;
    uint32_t received_chunks;
    uint32_t target_slot;
    uint8_t chunk_bitmap[128];  /* 1024 chunk-ova max */
} FWUpdateState_t;

static FWUpdateState_t fw_state;

void HandleFWChunk(const uint8_t *data, uint16_t chunk_idx) {
    if (chunk_idx >= fw_state.total_chunks) {
        return;  /* Nevažeći indeks */
    }

    /* Proveri da li je već primljen */
    uint8_t byte_idx = chunk_idx / 8;
    uint8_t bit_idx = chunk_idx % 8;
    if (fw_state.chunk_bitmap[byte_idx] & (1 << bit_idx)) {
        return;  /* Duplikat */
    }

    /* Upiši u flash */
    uint32_t addr = fw_state.target_slot + (chunk_idx * FW_CHUNK_SIZE);
    HAL_FLASH_Unlock();
    for (int i = 0; i < FW_CHUNK_SIZE; i += 8) {
        HAL_FLASH_Program(FLASH_TYPEPROGRAM_DOUBLEWORD,
                          addr + i, *(uint64_t *)(data + i));
    }
    HAL_FLASH_Lock();

    /* Označi kao primljen */
    fw_state.chunk_bitmap[byte_idx] |= (1 << bit_idx);
    fw_state.received_chunks++;

    /* Proveri kompletnost */
    if (fw_state.received_chunks == fw_state.total_chunks) {
        FinalizeFWUpdate();
    }
}
```

### 8.3 Rollback

```c
/* Automatski rollback ako nova verzija ne boot-uje */
void MarkBootSuccess(void) {
    SlotMarker_t *marker = (SlotMarker_t *)SLOT_MARKER;
    SlotMarker_t new_marker = *marker;

    new_marker.last_boot_ok = 1;
    new_marker.boot_count = 0;
    new_marker.crc32 = CalculateCRC32(&new_marker, 12);

    HAL_FLASH_Unlock();
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, SLOT_MARKER, new_marker.active_slot);
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, SLOT_MARKER + 4, new_marker.boot_count);
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, SLOT_MARKER + 8, new_marker.last_boot_ok);
    HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, SLOT_MARKER + 12, new_marker.crc32);
    HAL_FLASH_Lock();
}

/* Pozovi nakon uspešne inicijalizacije svih taskova */
void SystemStartupComplete(void) {
    /* Označi boot kao uspešan */
    MarkBootSuccess();

    /* Inkrementiraj OTP version counter ako je nova verzija */
    FirmwareHeader_t *header = GetActiveFirmwareHeader();
    if (header->version > ReadOTPVersionCounter()) {
        IncrementOTPVersionCounter();
    }
}
```

---

## 9. Reference

| Dokument | Opis |
|----------|------|
| `tehnika/10-microkernel-architecture.md` | Principi arhitekture |
| `tehnika/13-hardware-security.md` | Hardverska bezbednost |
| `tehnika/12-audit-logging.md` | Flash layout za logove |
| FreeRTOS Reference Manual | RTOS API dokumentacija |
| STM32G4 Reference Manual | Periferije i registri |
| ARM Cortex-M4 TRM | MPU i exception handling |

---

## Dodatak A: Kontrolna Lista Build-a

### Release Build

- [ ] Optimizacija: -O2 ili -Os
- [ ] Debug simboli: uklonjeni za produkciju
- [ ] Assertions: onemogućeni (NDEBUG)
- [ ] Stack canaries: omogućeni (-fstack-protector)
- [ ] Position independent: ako je potrebno za bootloader
- [ ] Potpis: Ed25519 potpisan sa production ključem
- [ ] Version: ažurirano u zaglavlju

### Debug Build

- [ ] Optimizacija: -Og
- [ ] Debug simboli: -g3
- [ ] Assertions: omogućeni
- [ ] SWD: omogućen (samo development)
- [ ] Logging: verbose nivo
