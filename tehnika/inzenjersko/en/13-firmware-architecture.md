# EK3 Firmware Architecture

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-014 |
| Version | 1.0 |
| Date | 2026-01-03 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Overview

### 1.1 Firmware Architecture Principles

The EK3 module firmware follows microkernel-inspired principles adapted for embedded systems:

1. **Minimal privileged code**: Safety-critical functions isolated in kernel layer
2. **Service isolation**: Non-critical functions run as independent RTOS tasks
3. **Message-based communication**: Tasks communicate via queues, not shared memory
4. **Deterministic timing**: Real-time guarantees for power control loops
5. **Fault tolerance**: Crashed services can restart without affecting power delivery

### 1.2 Target Hardware

| Component | Specification |
|-----------|---------------|
| MCU | STM32G474RET6 |
| Architecture | ARM Cortex-M4F |
| Clock | 170 MHz |
| Flash | 512 KB |
| RAM | 128 KB |
| FPU | Single-precision hardware |
| Crypto | AES-256, CMAC, TRNG |

---

## 2. RTOS Selection and Configuration

### 2.1 RTOS Choice: FreeRTOS

**Primary recommendation: FreeRTOS**

| Criterion | FreeRTOS | Zephyr | Bare-metal |
|-----------|----------|--------|------------|
| Maturity | Excellent | Good | N/A |
| STM32 support | Native | Good | N/A |
| Footprint | ~10 KB | ~50 KB | 0 |
| Certification | SAFERTOS available | Limited | Manual |
| Community | Large | Growing | N/A |
| Real-time | Preemptive | Preemptive | Manual |

**FreeRTOS version**: v10.5.1 or later (LTS)

### 2.2 Kernel Configuration

```c
/* FreeRTOSConfig.h - Key settings */

#define configUSE_PREEMPTION                    1
#define configUSE_TIME_SLICING                  0       /* No time slicing - priority only */
#define configUSE_PORT_OPTIMISED_TASK_SELECTION 1       /* CM4 optimized */
#define configCPU_CLOCK_HZ                      170000000
#define configTICK_RATE_HZ                      1000    /* 1ms tick */
#define configMAX_PRIORITIES                    16
#define configMINIMAL_STACK_SIZE                256     /* Words (1KB minimum) */
#define configTOTAL_HEAP_SIZE                   32768   /* 32KB heap */
#define configMAX_TASK_NAME_LEN                 16
#define configUSE_MUTEXES                       1
#define configUSE_RECURSIVE_MUTEXES             1
#define configUSE_COUNTING_SEMAPHORES           1
#define configUSE_QUEUE_SETS                    1
#define configQUEUE_REGISTRY_SIZE               8

/* Stack overflow detection */
#define configCHECK_FOR_STACK_OVERFLOW          2       /* Method 2: pattern check */

/* Memory protection (MPU) */
#define configENABLE_MPU                        1
#define configENABLE_FPU                        1
#define configENABLE_TRUSTZONE                  0       /* Not using TrustZone */

/* Software timers */
#define configUSE_TIMERS                        1
#define configTIMER_TASK_PRIORITY               (configMAX_PRIORITIES - 2)
#define configTIMER_QUEUE_LENGTH                10
#define configTIMER_TASK_STACK_DEPTH            512

/* Idle hook for power saving */
#define configUSE_IDLE_HOOK                     1
#define configUSE_TICK_HOOK                     0

/* Stats for debugging */
#define configGENERATE_RUN_TIME_STATS           1
#define configUSE_TRACE_FACILITY                1
#define configUSE_STATS_FORMATTING_FUNCTIONS    1
```

### 2.3 Task Model

The firmware uses a producer-consumer model with message queues:

```
┌─────────────────────────────────────────────────────────────────┐
│                      RTOS Task Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ISR Layer (Hardware Interrupts)                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ ADC_IRQ  │ │ TIM_IRQ  │ │ CAN_IRQ  │ │ FAULT_IRQ│           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       │            │            │            │                   │
│       ▼            ▼            ▼            ▼                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ISR-to-Task Notification Layer              │    │
│  │         (Direct-to-task notifications, queues)           │    │
│  └───────────────────────┬─────────────────────────────────┘    │
│                          │                                       │
│                          ▼                                       │
│  RTOS Task Layer                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Power    │ │ Thermal  │ │ Swarm    │ │ Logger   │           │
│  │ Control  │ │ Manager  │ │ Coord    │ │          │           │
│  │ (P4)     │ │ (P5)     │ │ (P6)     │ │ (P8)     │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Task Scheduling and Priorities

### 3.1 Priority Levels

The STM32G474 NVIC supports 16 priority levels. We allocate them as follows:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Priority Assignment (0 = Highest)                     │
├──────┬─────────────────────────────────────────────────────────────────┤
│  P0  │ Safety ISR: OCP, OVP, OTP hardware comparator interrupts        │
│      │ • Response: <1 µs                                               │
│      │ • Action: Immediate gate driver disable                         │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P1  │ PWM Control ISR: HRTIM update (400 kHz LLC switching)           │
│      │ • Period: 2.5 µs                                                │
│      │ • Action: Update duty cycle, dead time                          │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P2  │ ADC Sampling ISR: DMA complete (10 kHz sampling rate)           │
│      │ • Period: 100 µs                                                │
│      │ • Action: Move samples to processing buffer                     │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P3  │ CAN RX ISR: Incoming message received                           │
│      │ • Event-driven                                                  │
│      │ • Action: Copy to queue, notify task                            │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P4  │ Power Control Task: Voltage/current regulation loop (1 kHz)     │
│      │ • Highest RTOS task priority                                    │
│      │ • Stack: 2 KB                                                   │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P5  │ Thermal Management Task: Temperature monitoring (100 Hz)        │
│      │ • Fan PWM control, derating calculation                         │
│      │ • Stack: 2 KB                                                   │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P6  │ Swarm Coordination Task: Leader election, load balance (10 Hz)  │
│      │ • Raft consensus, heartbeat processing                          │
│      │ • Stack: 4 KB (Raft state machine)                              │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P7  │ Heartbeat TX Task: Status broadcast (1 Hz)                      │
│      │ • Compose and send heartbeat message                            │
│      │ • Stack: 1 KB                                                   │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P8  │ Audit Logger Task: Event logging to flash (background)          │
│      │ • Circular buffer management, flash wear leveling               │
│      │ • Stack: 2 KB                                                   │
├──────┼─────────────────────────────────────────────────────────────────┤
│  P9  │ Diagnostics Task: Self-test, statistics (idle time)             │
│      │ • Runs only when no other tasks need CPU                        │
│      │ • Stack: 2 KB                                                   │
├──────┼─────────────────────────────────────────────────────────────────┤
│ IDLE │ Idle Task: Power saving (WFI instruction)                       │
│      │ • Enters sleep mode between tasks                               │
│      │ • Stack: 512 bytes (minimal)                                    │
└──────┴─────────────────────────────────────────────────────────────────┘
```

### 3.2 Timing Guarantees

| Function | Deadline | WCET | Margin |
|----------|----------|------|--------|
| OCP response | 1 µs | 0.3 µs | 70% |
| PWM update | 2.5 µs | 1.2 µs | 52% |
| ADC processing | 100 µs | 45 µs | 55% |
| CAN RX handling | 1 ms | 0.2 ms | 80% |
| Power control loop | 1 ms | 0.4 ms | 60% |
| Thermal update | 10 ms | 3 ms | 70% |

### 3.3 Watchdog Strategy

**Independent Watchdog (IWDG):**
- Timeout: 100 ms
- Refresh: In power control task (highest priority RTOS task)
- Purpose: Detect complete firmware hang

**Window Watchdog (WWDG):**
- Window: 50-80 ms
- Refresh: At specific point in power control loop
- Purpose: Detect timing violations (too fast or too slow)

```c
/* Watchdog refresh pattern */
void PowerControlTask(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();

    for (;;) {
        /* Run control loop */
        RunPowerControlLoop();

        /* Refresh IWDG */
        HAL_IWDG_Refresh(&hiwdg);

        /* Refresh WWDG only in valid window */
        if (WWDG->CR & WWDG_CR_T_Msk > WWDG_WINDOW_VALUE) {
            HAL_WWDG_Refresh(&hwwdg);
        }

        /* Wait for next period */
        vTaskDelayUntil(&xLastWakeTime, pdMS_TO_TICKS(1));
    }
}
```

---

## 4. Memory Partitioning

### 4.1 Flash Layout (512 KB)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Flash Memory Map (512 KB)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  0x0800_0000 ┌──────────────────────────────────────────────┐   │
│              │           Bootloader (16 KB)                  │   │
│              │   • Secure boot verification                  │   │
│              │   • A/B slot selection                        │   │
│              │   • Recovery mode                             │   │
│  0x0800_4000 ├──────────────────────────────────────────────┤   │
│              │         Application Slot A (192 KB)           │   │
│              │   • Primary firmware image                    │   │
│              │   • Vector table at 0x0800_4000              │   │
│              │                                               │   │
│  0x0803_4000 ├──────────────────────────────────────────────┤   │
│              │         Application Slot B (192 KB)           │   │
│              │   • Backup/update firmware image              │   │
│              │   • Used during OTA update                    │   │
│              │                                               │   │
│  0x0806_4000 ├──────────────────────────────────────────────┤   │
│              │         Configuration (16 KB)                 │   │
│              │   • Module ID, calibration data               │   │
│              │   • Network settings                          │   │
│              │   • Wear-leveled (4 copies)                   │   │
│  0x0806_8000 ├──────────────────────────────────────────────┤   │
│              │         Audit Log (64 KB)                     │   │
│              │   • Circular event buffer                     │   │
│              │   • ~10,000 events capacity                   │   │
│              │   • Wear leveling across 8 sectors            │   │
│  0x0807_8000 ├──────────────────────────────────────────────┤   │
│              │         OTP Keys (8 KB)                       │   │
│              │   • Firmware signing public key               │   │
│              │   • CMAC session keys                         │   │
│              │   • Version counter (anti-rollback)           │   │
│  0x0807_A000 ├──────────────────────────────────────────────┤   │
│              │         Reserved (24 KB)                      │   │
│              │   • Future expansion                          │   │
│              │   • Factory test data                         │   │
│  0x0808_0000 └──────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 RAM Layout (128 KB)

```
┌─────────────────────────────────────────────────────────────────┐
│                     RAM Memory Map (128 KB)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  0x2000_0000 ┌──────────────────────────────────────────────┐   │
│              │         DMA Buffers (16 KB)                   │   │
│              │   • ADC sample buffers (aligned)              │   │
│              │   • CAN TX/RX buffers                         │   │
│              │   • Must be in first 64KB for DMA             │   │
│  0x2000_4000 ├──────────────────────────────────────────────┤   │
│              │         CAN Message Queues (4 KB)             │   │
│              │   • RX queue: 64 messages × 64 bytes          │   │
│              │   • TX queue: 32 messages × 64 bytes          │   │
│  0x2000_5000 ├──────────────────────────────────────────────┤   │
│              │         FreeRTOS Heap (32 KB)                 │   │
│              │   • Task control blocks                       │   │
│              │   • Queue storage                             │   │
│              │   • Timer structures                          │   │
│  0x2000_D000 ├──────────────────────────────────────────────┤   │
│              │         Task Stacks (48 KB)                   │   │
│              │   ┌────────────────────────────────────┐     │   │
│              │   │ Power Control    │ 2 KB            │     │   │
│              │   │ Thermal Manager  │ 2 KB            │     │   │
│              │   │ Swarm Coord      │ 4 KB            │     │   │
│              │   │ Heartbeat TX     │ 1 KB            │     │   │
│              │   │ Audit Logger     │ 2 KB            │     │   │
│              │   │ Diagnostics      │ 2 KB            │     │   │
│              │   │ Timer Service    │ 2 KB            │     │   │
│              │   │ Idle Task        │ 512 bytes       │     │   │
│              │   │ ISR Stack        │ 2 KB            │     │   │
│              │   │ Guard regions    │ 512 bytes each  │     │   │
│              │   └────────────────────────────────────┘     │   │
│  0x0x2001_9000├──────────────────────────────────────────────┤   │
│              │         Static Variables (16 KB)              │   │
│              │   • Global state                              │   │
│              │   • Configuration cache                       │   │
│              │   • Statistics counters                       │   │
│  0x2001_D000 ├──────────────────────────────────────────────┤   │
│              │         Stack Guard (4 KB)                    │   │
│              │   • MPU protected (no access)                 │   │
│              │   • Triggers HardFault on overflow            │   │
│  0x2001_E000 ├──────────────────────────────────────────────┤   │
│              │         Reserved (8 KB)                       │   │
│              │   • CCM RAM (tightly coupled)                 │   │
│              │   • Critical variables only                   │   │
│  0x2002_0000 └──────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 MPU Configuration

The Memory Protection Unit enforces memory isolation:

```c
/* MPU Region Configuration */
typedef struct {
    uint32_t BaseAddress;
    uint32_t Size;
    uint32_t Attributes;
} MPU_Region_t;

const MPU_Region_t mpu_regions[] = {
    /* Region 0: Flash - Read-only, executable */
    {
        .BaseAddress = 0x08000000,
        .Size = MPU_REGION_SIZE_512KB,
        .Attributes = MPU_REGION_PRIV_RO_URO | MPU_INSTRUCTION_ACCESS_ENABLE
    },

    /* Region 1: RAM - Read-write, no execute */
    {
        .BaseAddress = 0x20000000,
        .Size = MPU_REGION_SIZE_128KB,
        .Attributes = MPU_REGION_FULL_ACCESS | MPU_INSTRUCTION_ACCESS_DISABLE
    },

    /* Region 2: Peripherals - Read-write, no execute */
    {
        .BaseAddress = 0x40000000,
        .Size = MPU_REGION_SIZE_512MB,
        .Attributes = MPU_REGION_FULL_ACCESS |
                      MPU_INSTRUCTION_ACCESS_DISABLE |
                      MPU_ACCESS_NOT_CACHEABLE
    },

    /* Region 3: Stack guard - No access (trap on overflow) */
    {
        .BaseAddress = 0x2001D000,
        .Size = MPU_REGION_SIZE_4KB,
        .Attributes = MPU_REGION_NO_ACCESS
    },

    /* Region 4: OTP Keys - Privileged read-only */
    {
        .BaseAddress = 0x08078000,
        .Size = MPU_REGION_SIZE_8KB,
        .Attributes = MPU_REGION_PRIV_RO | MPU_INSTRUCTION_ACCESS_DISABLE
    }
};
```

---

## 5. Secure Boot Chain

### 5.1 Boot Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                       Secure Boot Flow                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Power On                                                     │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. ROM Bootloader (ST Internal)                          │   │
│  │    • Check Option Bytes                                   │   │
│  │    • Verify RDP (Read Protection) level                   │   │
│  │    • Initialize clocks to safe values                     │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. Custom Bootloader (16 KB @ 0x08000000)                │   │
│  │    • Initialize cryptographic hardware                    │   │
│  │    • Read active slot flag from config                    │   │
│  │    • Verify signature of selected application             │   │
│  │    • Check version counter (anti-rollback)                │   │
│  │    • If valid: Jump to application                        │   │
│  │    • If invalid: Try other slot, then recovery mode       │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3. Application (192 KB @ 0x08004000 or 0x08034000)       │   │
│  │    • Relocate vector table                                │   │
│  │    • Initialize hardware peripherals                      │   │
│  │    • Start FreeRTOS scheduler                             │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. RTOS Kernel Init                                       │   │
│  │    • Create kernel objects (queues, semaphores)           │   │
│  │    • Create tasks                                         │   │
│  │    • Start scheduler                                      │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│         Normal Operation (Tasks Running)                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Firmware Signing

**Algorithm**: Ed25519 or ECDSA-P256

**Application Image Header:**

```c
typedef struct __attribute__((packed)) {
    uint32_t magic;           /* 0x454B3033 = "EK03" */
    uint32_t version;         /* Semantic version packed */
    uint32_t image_size;      /* Size of firmware binary */
    uint32_t crc32;           /* CRC32 of binary (fast check) */
    uint8_t  signature[64];   /* Ed25519 signature */
    uint32_t build_timestamp; /* Unix timestamp */
    uint8_t  reserved[24];    /* Pad to 128 bytes */
} FirmwareHeader_t;

/* Located at start of each application slot */
#define APP_HEADER_A  ((FirmwareHeader_t*)0x08004000)
#define APP_HEADER_B  ((FirmwareHeader_t*)0x08034000)
```

**Verification Process:**

```c
bool VerifyFirmwareSignature(const FirmwareHeader_t *header) {
    /* 1. Check magic number */
    if (header->magic != FIRMWARE_MAGIC) {
        return false;
    }

    /* 2. Check version against rollback counter */
    uint32_t min_version = ReadOTPVersionCounter();
    if (header->version < min_version) {
        return false;  /* Rollback attempt detected */
    }

    /* 3. Quick CRC check (catches flash corruption) */
    uint32_t calculated_crc = CalculateCRC32(
        (uint8_t*)(header + 1),  /* Data after header */
        header->image_size
    );
    if (calculated_crc != header->crc32) {
        return false;
    }

    /* 4. Cryptographic signature verification */
    uint8_t public_key[32];
    ReadOTPPublicKey(public_key);

    return Ed25519_Verify(
        header->signature,
        (uint8_t*)header,
        sizeof(FirmwareHeader_t) - sizeof(header->signature) + header->image_size,
        public_key
    );
}
```

### 5.3 Rollback Protection

**Version Counter in OTP:**

The STM32G474 OTP area allows one-time programming of fuses:

```c
/* OTP Version Counter Structure */
typedef struct {
    uint32_t counter[256];  /* 256 × 32-bit = 8192 versions possible */
} OTPVersionCounter_t;

/* Each firmware update increments by writing next zero bit to 1 */
uint32_t ReadOTPVersionCounter(void) {
    uint32_t version = 0;
    for (int i = 0; i < 256; i++) {
        if (OTP_VERSION->counter[i] == 0xFFFFFFFF) {
            break;  /* Found first unprogrammed word */
        }
        version += __builtin_popcount(OTP_VERSION->counter[i]);
    }
    return version;
}

/* Increment version (called after successful boot of new firmware) */
void IncrementOTPVersionCounter(void) {
    /* Find first word with a zero bit */
    for (int i = 0; i < 256; i++) {
        if (OTP_VERSION->counter[i] != 0xFFFFFFFF) {
            continue;
        }
        /* Write lowest zero bit */
        uint32_t current = OTP_VERSION->counter[i];
        uint32_t new_bit = ~current & (current + 1);
        HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD,
                          (uint32_t)&OTP_VERSION->counter[i],
                          current | new_bit);
        return;
    }
}
```

---

## 6. Inter-Task Communication

### 6.1 Message Queues

Tasks communicate via FreeRTOS queues, not shared memory:

```c
/* Queue definitions */
#define CAN_RX_QUEUE_LENGTH     64
#define CAN_TX_QUEUE_LENGTH     32
#define POWER_CMD_QUEUE_LENGTH  8
#define THERMAL_QUEUE_LENGTH    4
#define LOG_QUEUE_LENGTH        32

/* Queue handles (global) */
QueueHandle_t xCANRxQueue;
QueueHandle_t xCANTxQueue;
QueueHandle_t xPowerCmdQueue;
QueueHandle_t xThermalQueue;
QueueHandle_t xLogQueue;

/* Message structures */
typedef struct {
    uint32_t id;
    uint8_t  data[64];
    uint8_t  length;
    uint32_t timestamp;
} CANMessage_t;

typedef struct {
    uint16_t target_power_w;
    uint16_t voltage_mv;
    uint8_t  source;
    uint8_t  priority;
} PowerCommand_t;

typedef struct {
    int16_t  temperature_c10;  /* Temperature × 10 */
    uint8_t  sensor_id;
    uint8_t  flags;
} ThermalReading_t;
```

### 6.2 Shared State (Atomic Variables)

For status that multiple tasks read but only one writes:

```c
/* Atomic state structure */
typedef struct {
    _Atomic uint32_t output_power_w;
    _Atomic uint32_t output_voltage_mv;
    _Atomic uint32_t output_current_ma;
    _Atomic int16_t  pcb_temperature;
    _Atomic int16_t  mosfet_temperature;
    _Atomic uint8_t  module_state;
    _Atomic uint8_t  fault_code;
} ModuleStatus_t;

/* Single global instance */
volatile ModuleStatus_t g_status;

/* Write (only from Power Control task) */
void UpdatePowerStatus(uint32_t power, uint32_t voltage, uint32_t current) {
    atomic_store(&g_status.output_power_w, power);
    atomic_store(&g_status.output_voltage_mv, voltage);
    atomic_store(&g_status.output_current_ma, current);
}

/* Read (from any task) */
uint32_t GetOutputPower(void) {
    return atomic_load(&g_status.output_power_w);
}
```

### 6.3 Event Groups

For coordinating multiple tasks on state changes:

```c
/* Event bit definitions */
#define EVENT_FAULT_DETECTED    (1 << 0)
#define EVENT_THERMAL_WARNING   (1 << 1)
#define EVENT_CAN_CONNECTED     (1 << 2)
#define EVENT_SWARM_LEADER      (1 << 3)
#define EVENT_FIRMWARE_UPDATE   (1 << 4)
#define EVENT_SHUTDOWN_REQUEST  (1 << 5)

/* Event group handle */
EventGroupHandle_t xSystemEvents;

/* Setting events (from any task) */
void SignalFault(void) {
    xEventGroupSetBits(xSystemEvents, EVENT_FAULT_DETECTED);
}

/* Waiting for events (blocking) */
void WaitForShutdown(void) {
    xEventGroupWaitBits(
        xSystemEvents,
        EVENT_SHUTDOWN_REQUEST,
        pdTRUE,   /* Clear bit on exit */
        pdFALSE,  /* Wait for any bit */
        portMAX_DELAY
    );
}
```

---

## 7. Fault Handling

### 7.1 HardFault Handler

When a fatal error occurs, save state and trigger safe shutdown:

```c
void HardFault_Handler(void) {
    /* Disable interrupts */
    __disable_irq();

    /* Capture fault state */
    volatile uint32_t cfsr = SCB->CFSR;
    volatile uint32_t hfsr = SCB->HFSR;
    volatile uint32_t mmfar = SCB->MMFAR;
    volatile uint32_t bfar = SCB->BFAR;

    /* Save to fault log in flash */
    FaultLog_t fault = {
        .timestamp = GetSystemTime(),
        .cfsr = cfsr,
        .hfsr = hfsr,
        .mmfar = mmfar,
        .bfar = bfar,
        .pc = __get_PC(),
        .lr = __get_LR(),
        .psp = __get_PSP(),
        .msp = __get_MSP()
    };
    WriteFaultToFlash(&fault);

    /* Trigger safe shutdown */
    DisableGateDrivers();

    /* Reset after delay */
    HAL_Delay(100);
    NVIC_SystemReset();
}
```

### 7.2 Stack Overflow Detection

FreeRTOS hook function for stack overflow:

```c
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName) {
    /* Log the failure */
    LogEvent(EVENT_STACK_OVERFLOW, (uint32_t)pcTaskName);

    /* Try to restart the task if non-critical */
    TaskInfo_t *info = GetTaskInfo(xTask);
    if (info && !info->is_critical) {
        /* Delete and recreate task */
        vTaskDelete(xTask);
        xTaskCreate(
            info->function,
            info->name,
            info->stack_size,
            info->parameters,
            info->priority,
            &info->handle
        );
        return;
    }

    /* Critical task failure - full reset */
    NVIC_SystemReset();
}
```

### 7.3 Watchdog Timeout

If watchdog is not refreshed, hardware triggers reset:

```c
/* Called before reset (if configured) */
void IWDG_IRQHandler(void) {
    /* Last-ditch logging */
    LogEvent(EVENT_WATCHDOG_TIMEOUT, 0);

    /* Hardware will reset MCU */
}
```

---

## 8. OTA Update Mechanism

### 8.1 A/B Partitioning Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                   A/B Update Process                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  State 1: Normal Operation (Slot A active)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Bootloader │ Slot A (v1.2.0) │ Slot B (v1.1.0) │ Config   │ │
│  │            │    [ACTIVE]     │   [BACKUP]      │  A=true  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  State 2: Download new firmware to Slot B                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Bootloader │ Slot A (v1.2.0) │ Slot B (v1.3.0) │ Config   │ │
│  │            │    [ACTIVE]     │  [DOWNLOADING]  │  A=true  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  State 3: Verify and switch active slot                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Bootloader │ Slot A (v1.2.0) │ Slot B (v1.3.0) │ Config   │ │
│  │            │    [BACKUP]     │    [PENDING]    │  B=true  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  State 4: After reboot - new firmware active                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Bootloader │ Slot A (v1.2.0) │ Slot B (v1.3.0) │ Config   │ │
│  │            │    [BACKUP]     │    [ACTIVE]     │  B=true  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  If boot fails: Automatic rollback to Slot A                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Download Protocol

Firmware is downloaded via CAN-FD from the Station Controller:

```c
/* Firmware chunk structure */
typedef struct {
    uint32_t offset;      /* Offset in image */
    uint16_t length;      /* Chunk length (max 256 bytes) */
    uint16_t chunk_crc;   /* CRC16 of this chunk */
    uint8_t  data[256];   /* Chunk data */
} FirmwareChunk_t;

/* Download state machine */
typedef enum {
    FW_STATE_IDLE,
    FW_STATE_ERASE,
    FW_STATE_DOWNLOAD,
    FW_STATE_VERIFY,
    FW_STATE_COMMIT,
    FW_STATE_ERROR
} FirmwareState_t;

/* Process incoming chunk */
FirmwareResult_t ProcessFirmwareChunk(const FirmwareChunk_t *chunk) {
    /* Verify chunk CRC */
    if (CRC16(chunk->data, chunk->length) != chunk->chunk_crc) {
        return FW_RESULT_CRC_ERROR;
    }

    /* Write to inactive slot */
    uint32_t target_addr = GetInactiveSlotAddress() + chunk->offset;

    if (HAL_FLASH_Program(FLASH_TYPEPROGRAM_FAST,
                          target_addr,
                          (uint32_t)chunk->data) != HAL_OK) {
        return FW_RESULT_FLASH_ERROR;
    }

    return FW_RESULT_OK;
}
```

### 8.3 Rollback Mechanism

```c
/* Boot success confirmation */
void ConfirmBootSuccess(void) {
    static bool confirmed = false;

    if (confirmed) return;

    /* Wait for system to stabilize (30 seconds) */
    if (GetUptime() < 30000) return;

    /* Check all subsystems healthy */
    if (!IsSystemHealthy()) return;

    /* Mark current slot as confirmed */
    BootConfig_t config;
    ReadBootConfig(&config);
    config.boot_confirmed = true;
    config.boot_attempts = 0;
    WriteBootConfig(&config);

    /* Increment OTP version counter (prevents rollback) */
    FirmwareHeader_t *header = GetActiveSlotHeader();
    IncrementOTPVersionCounter();

    confirmed = true;
    LogEvent(EVENT_BOOT_CONFIRMED, header->version);
}

/* Bootloader rollback logic */
void BootloaderSelectSlot(void) {
    BootConfig_t config;
    ReadBootConfig(&config);

    /* Increment boot attempt counter */
    config.boot_attempts++;
    WriteBootConfig(&config);

    /* Too many failed attempts? */
    if (config.boot_attempts > MAX_BOOT_ATTEMPTS) {
        /* Switch to other slot */
        config.active_slot = !config.active_slot;
        config.boot_attempts = 0;
        WriteBootConfig(&config);
        LogEvent(EVENT_BOOT_ROLLBACK, 0);
    }

    /* Jump to selected slot */
    JumpToApplication(GetSlotAddress(config.active_slot));
}
```

---

## 9. References

| Document | Description |
|----------|-------------|
| `tehnika/10-microkernel-architecture.md` | System architecture overview |
| `tehnika/13-hardware-security.md` | Hardware security features |
| `tehnika/11-security-model.md` | Security model and RBAC |
| `tehnika/05-swarm-intelligence.md` | Swarm coordination protocols |
| STM32G474 Reference Manual | RM0440 |
| FreeRTOS Documentation | freertos.org |

---

## Appendix A: Task Summary Table

| Task | Priority | Stack | Period | WCET | Function |
|------|----------|-------|--------|------|----------|
| Power Control | P4 | 2 KB | 1 ms | 400 µs | Voltage/current loops |
| Thermal Mgmt | P5 | 2 KB | 10 ms | 3 ms | Fan, derating |
| Swarm Coord | P6 | 4 KB | 100 ms | 20 ms | Raft, load balance |
| Heartbeat TX | P7 | 1 KB | 1000 ms | 500 µs | Status broadcast |
| Audit Logger | P8 | 2 KB | Background | N/A | Flash logging |
| Diagnostics | P9 | 2 KB | Idle | N/A | Self-test |
| Timer Service | P14 | 2 KB | N/A | N/A | Software timers |
| Idle | P15 | 512 B | Always | N/A | WFI sleep |

---

## Appendix B: Interrupt Priority Table

| IRQ | Priority | Source | Handler |
|-----|----------|--------|---------|
| COMP1_IRQ | 0 | OCP comparator | Disable gates |
| COMP2_IRQ | 0 | OVP comparator | Disable gates |
| COMP3_IRQ | 0 | OTP comparator | Disable gates |
| HRTIM1_IRQ | 1 | PWM period | Update duty |
| ADC1_IRQ | 2 | DMA complete | Copy samples |
| FDCAN1_IRQ | 3 | Message RX | Queue message |
| TIM6_IRQ | 5 | System tick | Scheduler |
