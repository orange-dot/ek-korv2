# JEZGRO: Microkernel Real-Time Operating System

## Document Information

| Field | Value |
|-------|-------|
| Document ID | EK-TECH-017 |
| Version | 1.0 |
| Date | 2026-01-04 |
| Status | Active |
| Author | Elektrokombinacija Engineering |

---

## 1. Overview

### 1.1 What is JEZGRO?

JEZGRO is a microkernel real-time operating system specifically designed for power electronics applications. It brings MINIX reliability principles (fault isolation, message passing, automatic service restart) to resource-constrained microcontrollers.

The name "JEZGRO" is Serbian for "kernel" or "core" - reflecting both its minimal design philosophy and its Serbian origin.

### 1.2 Design Goals

| Goal | Target |
|------|--------|
| Fault isolation | MPU-based, no MMU required |
| Automatic recovery | Service restart < 50ms |
| Real-time | Interrupt latency < 1us |
| Memory footprint | Kernel < 10KB |
| Target MCU | Cortex-M3/M4/M7 with MPU |

### 1.3 MINIX Inspiration

```
+-------------------------------------------------------------+
|              MINIX -> JEZGRO Mapping                        |
+-------------------------------------------------------------+
|                                                             |
|  MINIX Concept             JEZGRO Implementation            |
|  ----------------          ----------------------           |
|                                                             |
|  MMU isolation        ->   MPU regions (no MMU)             |
|  User-space servers   ->   Unprivileged service tasks       |
|  Message passing IPC  ->   Zero-copy shared memory IPC      |
|  Reincarnation server ->   Watchdog + auto-restart          |
|  Minimal kernel       ->   ~8KB kernel code                 |
|                                                             |
+-------------------------------------------------------------+
```

---

## 2. Architecture

### 2.1 System Layers

```
+-------------------------------------------------------------+
|                     JEZGRO ARCHITECTURE                     |
+-------------------------------------------------------------+
|                                                             |
|  LAYER 3: USER SERVICES (Unprivileged, MPU-isolated)        |
|  +---------+ +---------+ +---------+ +---------+            |
|  |Thermal  | |  Swarm  | |  Audit  | |  OCPP   |            |
|  | Manager | |  Coord. | |  Logger | | Gateway |            |
|  +----+----+ +----+----+ +----+----+ +----+----+            |
|       |           |           |           |                  |
|  -----+-----------+-----------+-----------+------------      |
|                 MESSAGE PASSING (IPC)                        |
|  ----------------------------------------------------------  |
|                                                             |
+-------------------------------------------------------------+
|  LAYER 2: KERNEL SERVICES                                   |
|  +------------------------------------------------------+   |
|  |           REINCARNATION SERVER                        |   |
|  |  * Per-service watchdog monitoring                    |   |
|  |  * Automatic fault detection                          |   |
|  |  * Service restart without system reset               |   |
|  |  * State preservation hooks                           |   |
|  +------------------------------------------------------+   |
|                                                             |
+-------------------------------------------------------------+
|  LAYER 1: MICROKERNEL (Privileged, ~8KB)                    |
|  +----------+ +----------+ +----------+ +----------+        |
|  |Scheduler | |   MPU    | |   IPC    | |Interrupt |        |
|  |  (EDF)   | | Manager  | |  Queues  | | Dispatch |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                             |
+-------------------------------------------------------------+
|  LAYER 0: PRIVILEGED DRIVERS                                |
|  +----------+ +----------+ +----------+ +----------+        |
|  |   LLC    | |  CAN-FD  | |   ADC    | |   PWM    |        |
|  | Control  | |  Driver  | |  Driver  | | (HRTIM)  |        |
|  +----------+ +----------+ +----------+ +----------+        |
|                                                             |
+-------------------------------------------------------------+
|  HARDWARE: STM32G474 (Cortex-M4 + MPU)                      |
+-------------------------------------------------------------+
```

### 2.2 Privilege Levels

| Level | Name | Access | Examples |
|-------|------|--------|----------|
| 0 | Kernel | Full hardware | Scheduler, MPU, ISRs |
| 1 | Driver | Specific peripherals | LLC control, CAN-FD |
| 2 | Service | Own memory only | Thermal, Swarm, Audit |

### 2.3 Memory Map (128KB RAM)

```
0x20020000 +----------------------------------+
           |  Kernel Space          8 KB     | <- Privileged
           +----------------------------------+
           |  LLC Control Task     16 KB     | <- MPU Region 0
           +----------------------------------+
           |  Safety Monitor        8 KB     | <- MPU Region 1
           +----------------------------------+
           |  CAN Handler           8 KB     | <- MPU Region 2
           +----------------------------------+
           |  Thermal Manager       8 KB     | <- MPU Region 3
           +----------------------------------+
           |  Swarm Coordinator    16 KB     | <- MPU Region 4
           +----------------------------------+
           |  Audit Logger         16 KB     | <- MPU Region 5
           +----------------------------------+
           |  IPC Message Pool     32 KB     | <- Shared
           +----------------------------------+
           |  Stack Guards         16 KB     | <- Protected
0x20000000 +----------------------------------+
```

---

## 3. Kernel Components

### 3.1 Scheduler

**Algorithm**: Earliest Deadline First (EDF) with priority fallback

```c
typedef struct {
    jezgro_task_id_t   id;
    jezgro_priority_t  priority;      // Static priority
    uint32_t           deadline;      // Absolute deadline (ticks)
    uint32_t           period;        // Task period
    jezgro_state_t     state;         // READY, RUNNING, BLOCKED, SUSPENDED
    void*              stack_ptr;     // Saved stack pointer
    mpu_region_t       mpu_config;    // MPU configuration
} jezgro_tcb_t;
```

### 3.2 MPU Manager

**Cortex-M4 MPU**: 8 configurable regions

```c
void mpu_switch_context(jezgro_task_id_t task) {
    // Disable MPU during reconfiguration
    MPU->CTRL = 0;

    // Configure regions for this task
    for (int r = 0; r < task->num_regions; r++) {
        MPU->RNR  = r;
        MPU->RBAR = (uint32_t)task->regions[r].base | MPU_RBAR_VALID;
        MPU->RASR = compute_rasr(&task->regions[r]);
    }

    // Re-enable MPU
    MPU->CTRL = MPU_CTRL_ENABLE | MPU_CTRL_PRIVDEFENA;
}
```

### 3.3 IPC System

**Design**: Zero-copy message passing inspired by MINIX

```c
// Message structure (64-byte aligned for cache efficiency)
typedef struct {
    uint16_t src;           // Source service ID
    uint16_t dst;           // Destination service ID
    uint16_t type;          // Message type
    uint16_t flags;         // Flags (SYNC, ASYNC, etc.)
    uint32_t seq;           // Sequence number
    uint32_t timestamp;     // Timestamp (ticks)
    uint8_t  payload[48];   // Data payload
} __attribute__((aligned(64))) jezgro_msg_t;

// Synchronous send (blocks until received)
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg);

// Synchronous receive (blocks until message available)
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t* msg);
```

### 3.4 Reincarnation Server

**Inspired by MINIX RS (Reincarnation Server)**

The Reincarnation Server is a kernel service that monitors all user-space services and automatically restarts them if they crash or become unresponsive. This is a key differentiator from traditional RTOS designs where a watchdog timeout causes a full system reset.

#### 3.4.1 Service Descriptor Table

```c
typedef struct {
    jezgro_svc_id_t    id;              // Unique service identifier
    const char*        name;            // Human-readable name
    void             (*entry_point)(void); // Service entry function
    void*              memory_base;     // Start of memory region
    size_t             memory_size;     // Size of memory region
    size_t             stack_size;      // Stack allocation
    jezgro_priority_t  priority;        // Scheduling priority
    uint32_t           watchdog_ms;     // Watchdog timeout
    uint32_t           restart_count;   // Number of restarts
    uint32_t           max_restarts;    // Max restarts before degradation
    jezgro_svc_state_t state;           // Current state
    uint32_t           last_feed_tick;  // Last watchdog feed time
    void*              saved_state;     // Optional state buffer
    size_t             saved_state_size;// State buffer size
    uint32_t           backoff_ms;      // Current restart backoff
} jezgro_service_t;
```

#### 3.4.2 Service Lifecycle State Machine

```
                   ┌──────────────────────────────────────────┐
                   │                                          │
                   ▼                                          │
            ┌──────────┐                                      │
    ───────►│  INIT    │                                      │
            └────┬─────┘                                      │
                 │ init_service()                             │
                 ▼                                            │
            ┌──────────┐    fault/watchdog    ┌──────────┐   │
            │ RUNNING  │─────────────────────►│ FAULTED  │   │
            └────┬─────┘                      └────┬─────┘   │
                 │                                  │         │
                 │ graceful_stop()                  │ notify_down()
                 ▼                                  ▼         │
            ┌──────────┐                      ┌──────────┐   │
            │ STOPPING │◄─────────────────────│ STOPPING │   │
            └────┬─────┘                      └────┬─────┘   │
                 │                                  │         │
                 │ save_state()                     │ save_state()
                 │ clear_memory()                   │ clear_memory()
                 ▼                                  ▼         │
            ┌──────────┐                      ┌──────────┐   │
            │ STOPPED  │                      │RESTARTING│───┘
            └──────────┘                      └──────────┘
```

#### 3.4.3 Fault Handler Implementation

```c
void handle_service_fault(jezgro_svc_id_t svc, fault_type_t fault) {
    jezgro_service_t* s = &services[svc];

    // 1. Log the fault with context
    audit_log(EVENT_SERVICE_FAULT, svc, fault);
    audit_log_context(s->name, __builtin_return_address(0));

    // 2. Check restart limits
    if (s->restart_count >= s->max_restarts) {
        handle_service_degradation(svc);
        return;
    }

    // 3. Notify other services (non-blocking broadcast)
    jezgro_msg_t msg = {
        .type = MSG_SERVICE_DOWN,
        .src = SVC_REINCARNATION,
        .payload.svc_id = svc
    };
    jezgro_broadcast(&msg);

    // 4. Save service state if possible
    if (s->saved_state != NULL && s->state != SVC_STATE_FAULTED) {
        save_service_state(svc);
    }

    // 5. Reset the service memory region (zero-fill)
    memset(s->memory_base, 0, s->memory_size);

    // 6. Apply exponential backoff for repeated failures
    if (s->restart_count > 0) {
        s->backoff_ms = MIN(s->backoff_ms * 2, MAX_BACKOFF_MS);
        jezgro_delay_ms(s->backoff_ms);
    }

    // 7. Restart the service
    s->restart_count++;
    s->state = SVC_STATE_RESTARTING;
    service_init(svc);

    // 8. Restore state if available
    if (s->saved_state != NULL) {
        restore_service_state(svc);
    }

    s->state = SVC_STATE_RUNNING;
    s->last_feed_tick = jezgro_get_ticks();

    // 9. Notify recovery complete
    msg.type = MSG_SERVICE_UP;
    jezgro_broadcast(&msg);
}
```

#### 3.4.4 State Preservation Hooks

Services can register state that should survive restarts:

```c
// Example: Audit Logger preserving write pointer
typedef struct {
    uint32_t flash_write_ptr;
    uint32_t pending_entries;
    uint8_t  pending_buffer[256];
} audit_saved_state_t;

static audit_saved_state_t saved_state;

JEZGRO_SERVICE_DEFINE(audit_logger,
    .priority = JEZGRO_PRIORITY_LOW,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 2000,
    .saved_state = &saved_state,
    .saved_state_size = sizeof(saved_state)
);

// Called by Reincarnation Server before restart
void audit_logger_save_state(void) {
    saved_state.flash_write_ptr = current_write_ptr;
    saved_state.pending_entries = pending_count;
    memcpy(saved_state.pending_buffer, pending_buf, pending_count);
}

// Called after restart to restore
void audit_logger_restore_state(void) {
    current_write_ptr = saved_state.flash_write_ptr;
    // Replay pending entries...
}
```

#### 3.4.5 Cascade Failure Prevention

```c
#define MAX_RESTARTS_PER_MINUTE  3
#define MAX_BACKOFF_MS           5000
#define DEGRADATION_THRESHOLD    10

void handle_service_degradation(jezgro_svc_id_t svc) {
    jezgro_service_t* s = &services[svc];

    // Mark service as degraded (won't auto-restart)
    s->state = SVC_STATE_DEGRADED;

    // Log critical event
    audit_log(EVENT_SERVICE_DEGRADED, svc, s->restart_count);

    // Notify operator via CAN
    jezgro_msg_t alert = {
        .type = MSG_CRITICAL_ALERT,
        .payload.alert_code = ALERT_SERVICE_DEGRADED,
        .payload.svc_id = svc
    };
    can_send_alert(&alert);

    // System continues operating without this service
    // Power delivery NOT affected (LLC control is in kernel)
}
```

---

### 3.5 MPU Service Isolation

The Memory Protection Unit (MPU) provides hardware-enforced isolation between services without requiring a full MMU. This is the key innovation enabling microkernel benefits on resource-constrained MCUs.

#### 3.5.1 Cortex-M4 MPU Capabilities

The STM32G474 Cortex-M4 MPU provides:

| Feature | Specification |
|---------|---------------|
| Number of regions | 8 programmable |
| Region size | 32 bytes to 4 GB (power of 2) |
| Sub-regions | 8 per region (can disable individually) |
| Access permissions | Read/Write/Execute per privilege level |
| Attributes | Cacheable, Bufferable, Shareable |

**Key Differences from MMU:**
- No virtual-to-physical address translation
- Fixed number of regions (8 vs unlimited pages)
- Power-of-2 size alignment required
- No demand paging or swapping
- Deterministic reconfiguration time (~200ns)

#### 3.5.2 MPU Region Allocation for EK3

```
Region   Base        Size    Access  Purpose
──────────────────────────────────────────────────────────────
  0    0x08000000   512 KB   PRO    Flash (all code, read-only)
  1    0x20000000    8 KB    PRW    Kernel data + ISR stacks
  2    0x20002000   16 KB    PRW    LLC Control (privileged driver)
  3    Dynamic       8 KB    URW    Active service memory
  4    Dynamic       4 KB    URW    Active service stack
  5    0x2001E000   32 KB    URO    IPC message pool (shared read)
  6    0x40000000  512 MB    PRW    Peripheral access (privileged)
  7    0xE0000000  512 MB    PRW    System control (privileged)

PRO = Privileged Read Only
PRW = Privileged Read/Write
URW = Unprivileged Read/Write
URO = Unprivileged Read Only
```

**Memory Layout Diagram:**

```
0x20020000 ┌─────────────────────────────────┐
           │  Kernel Space        8 KB       │ Region 1 (PRW)
           │  - Scheduler data               │
           │  - ISR stacks                   │
           │  - MPU config tables            │
0x2001E000 ├─────────────────────────────────┤
           │  IPC Message Pool   32 KB       │ Region 5 (URO)
           │  - 512 message slots            │
           │  - Allocation bitmap            │
0x20016000 ├─────────────────────────────────┤
           │  Stack Guard         2 KB       │ No access (trap)
0x20015800 ├─────────────────────────────────┤
           │  Audit Logger Stack  4 KB       │ Region 4 (dynamic)
0x20014800 ├─────────────────────────────────┤
           │  Audit Logger Mem   12 KB       │ Region 3 (dynamic)
0x20011800 ├─────────────────────────────────┤
           │  ... other services ...         │
           ├─────────────────────────────────┤
0x20002000 │  LLC Control        16 KB       │ Region 2 (PRW)
0x20000000 └─────────────────────────────────┘
```

#### 3.5.3 Context Switch with MPU Reconfiguration

```c
// Complete MPU context switch implementation
// Execution time: ~200ns @ 170 MHz

typedef struct {
    uint32_t RBAR;  // Region Base Address Register value
    uint32_t RASR;  // Region Attribute and Size Register value
} mpu_region_config_t;

typedef struct {
    uint8_t              num_regions;
    mpu_region_config_t  regions[4];  // Max 4 dynamic regions per task
} mpu_context_t;

__attribute__((always_inline))
static inline uint32_t compute_rasr(uint32_t size, uint32_t ap, uint32_t tex_scb) {
    // SIZE field: log2(size) - 1 (minimum 32 bytes = 0x04)
    uint32_t size_field = 31 - __builtin_clz(size) - 1;

    return MPU_RASR_ENABLE_Msk |
           (size_field << MPU_RASR_SIZE_Pos) |
           (ap << MPU_RASR_AP_Pos) |
           tex_scb;
}

void mpu_switch_context(const mpu_context_t* new_ctx) {
    // Disable MPU during reconfiguration (atomic operation)
    __DMB();  // Data Memory Barrier
    MPU->CTRL = 0;
    __DSB();  // Data Synchronization Barrier

    // Reconfigure dynamic regions (3, 4, and optionally more)
    // Regions 0-2, 5-7 are static and never change

    for (uint8_t i = 0; i < new_ctx->num_regions; i++) {
        // Use MPU_RNR alias registers for faster access
        MPU->RNR  = 3 + i;  // Dynamic regions start at 3
        MPU->RBAR = new_ctx->regions[i].RBAR;
        MPU->RASR = new_ctx->regions[i].RASR;
    }

    // Re-enable MPU with privileged default map
    __DSB();
    MPU->CTRL = MPU_CTRL_ENABLE_Msk | MPU_CTRL_PRIVDEFENA_Msk;
    __ISB();  // Instruction Synchronization Barrier
}

// Pre-computed MPU configs for each service (init time)
static mpu_context_t service_mpu_configs[MAX_SERVICES];

void init_service_mpu(jezgro_svc_id_t svc) {
    jezgro_service_t* s = &services[svc];
    mpu_context_t* ctx = &service_mpu_configs[svc];

    ctx->num_regions = 2;

    // Region 3: Service memory (data + heap)
    ctx->regions[0].RBAR = (uint32_t)s->memory_base | MPU_RBAR_VALID_Msk | 3;
    ctx->regions[0].RASR = compute_rasr(
        s->memory_size,
        MPU_AP_URW,  // Unprivileged Read/Write
        MPU_RASR_C_Msk | MPU_RASR_S_Msk  // Cacheable, Shareable
    );

    // Region 4: Service stack
    ctx->regions[1].RBAR = (uint32_t)s->stack_base | MPU_RBAR_VALID_Msk | 4;
    ctx->regions[1].RASR = compute_rasr(
        s->stack_size,
        MPU_AP_URW,
        MPU_RASR_C_Msk | MPU_RASR_S_Msk | MPU_RASR_XN_Msk  // No execute
    );
}
```

#### 3.5.4 Fault Handling for MPU Violations

```c
// MemManage fault handler - catches all MPU violations
void MemManage_Handler(void) {
    // Get fault status register
    uint32_t cfsr = SCB->CFSR;
    uint32_t mmfar = SCB->MMFAR;  // Faulting address (if valid)

    // Identify faulting service from current task
    jezgro_svc_id_t faulting_svc = current_task->service_id;

    // Determine fault type
    fault_type_t fault;
    if (cfsr & SCB_CFSR_DACCVIOL_Msk) {
        fault = FAULT_DATA_ACCESS;
    } else if (cfsr & SCB_CFSR_IACCVIOL_Msk) {
        fault = FAULT_INSTRUCTION_ACCESS;
    } else if (cfsr & SCB_CFSR_MSTKERR_Msk) {
        fault = FAULT_STACK_OVERFLOW;
    } else {
        fault = FAULT_MPU_UNKNOWN;
    }

    // Log fault details
    fault_log_t log = {
        .svc_id = faulting_svc,
        .fault_type = fault,
        .cfsr = cfsr,
        .mmfar = (cfsr & SCB_CFSR_MMARVALID_Msk) ? mmfar : 0,
        .pc = ((uint32_t*)__get_PSP())[6],  // Stacked PC
        .lr = ((uint32_t*)__get_PSP())[5],  // Stacked LR
    };
    kernel_log_fault(&log);

    // Clear fault status
    SCB->CFSR = cfsr;

    // Trigger Reincarnation Server (doesn't return to faulting code)
    trigger_service_restart(faulting_svc, fault);

    // Switch to next ready task (never returns here)
    scheduler_yield();
}

// Stack overflow detection via guard region
void check_stack_guard(jezgro_svc_id_t svc) {
    jezgro_service_t* s = &services[svc];
    uint32_t* guard = (uint32_t*)(s->stack_base - STACK_GUARD_SIZE);

    // Check guard pattern
    for (int i = 0; i < STACK_GUARD_SIZE / 4; i++) {
        if (guard[i] != STACK_GUARD_PATTERN) {
            trigger_service_restart(svc, FAULT_STACK_OVERFLOW);
            return;
        }
    }
}
```

#### 3.5.5 MPU Timing Analysis

| Operation | Cycles @ 170 MHz | Time |
|-----------|------------------|------|
| Disable MPU | 3 | 18 ns |
| Write RBAR | 2 | 12 ns |
| Write RASR | 2 | 12 ns |
| Per-region config | 4 | 24 ns |
| 2 regions total | 8 | 47 ns |
| Enable MPU | 3 | 18 ns |
| Barriers (DSB, ISB) | 6 | 35 ns |
| **Total (2 regions)** | **24** | **~140 ns** |

This is fast enough to include in every context switch without impacting real-time guarantees.

---

### 3.6 IPC and CAN-FD Protocol

Inter-Process Communication (IPC) is the backbone of microkernel architecture. JEZGRO implements zero-copy message passing inspired by MINIX, with an additional CAN-FD gateway for external communication.

#### 3.6.1 Message Pool Architecture

```
0x2001E000 ┌─────────────────────────────────────────────┐
           │  Pool Header (64 bytes)                      │
           │  ├─ pool_size: 32768                        │
           │  ├─ slot_count: 512                         │
           │  ├─ free_count: atomic<uint32_t>            │
           │  ├─ alloc_bitmap[16]: atomic<uint32_t>[16]  │
           │  └─ reserved[24]                            │
0x2001E040 ├─────────────────────────────────────────────┤
           │  Message Slot 0 (64 bytes, cache-aligned)   │
           │  ├─ src: uint16_t                           │
           │  ├─ dst: uint16_t                           │
           │  ├─ type: uint16_t                          │
           │  ├─ flags: uint16_t                         │
           │  ├─ seq: uint32_t                           │
           │  ├─ timestamp: uint32_t                     │
           │  └─ payload[48]                             │
0x2001E080 ├─────────────────────────────────────────────┤
           │  Message Slot 1                              │
           ├─────────────────────────────────────────────┤
           │  ...                                         │
           ├─────────────────────────────────────────────┤
           │  Message Slot 511                            │
0x20025FC0 └─────────────────────────────────────────────┘
```

#### 3.6.2 Lock-Free Message Allocation

```c
typedef struct {
    uint32_t pool_size;
    uint32_t slot_count;
    _Atomic uint32_t free_count;
    _Atomic uint32_t alloc_bitmap[16];  // 512 bits = 512 slots
    uint8_t reserved[24];
} __attribute__((aligned(64))) ipc_pool_header_t;

// Allocate a message slot (lock-free, O(1) average)
jezgro_msg_t* jezgro_msg_alloc(void) {
    ipc_pool_header_t* pool = (ipc_pool_header_t*)IPC_POOL_BASE;

    // Quick check for available slots
    if (atomic_load(&pool->free_count) == 0) {
        return NULL;
    }

    // Find free slot using bitmap
    for (int word = 0; word < 16; word++) {
        uint32_t bits = atomic_load(&pool->alloc_bitmap[word]);
        if (bits != 0xFFFFFFFF) {
            // Find first zero bit
            int bit = __builtin_ctz(~bits);
            uint32_t mask = 1U << bit;

            // Atomically set the bit
            uint32_t old = atomic_fetch_or(&pool->alloc_bitmap[word], mask);
            if (!(old & mask)) {
                // Successfully allocated
                atomic_fetch_sub(&pool->free_count, 1);
                int slot = word * 32 + bit;
                return (jezgro_msg_t*)(IPC_POOL_BASE + 64 + slot * 64);
            }
            // Race condition - another task got it, retry
        }
    }
    return NULL;  // Pool exhausted
}

// Free a message slot (lock-free)
void jezgro_msg_free(jezgro_msg_t* msg) {
    ipc_pool_header_t* pool = (ipc_pool_header_t*)IPC_POOL_BASE;

    // Calculate slot index
    uint32_t offset = (uint32_t)msg - (IPC_POOL_BASE + 64);
    int slot = offset / 64;
    int word = slot / 32;
    int bit = slot % 32;
    uint32_t mask = 1U << bit;

    // Atomically clear the bit
    atomic_fetch_and(&pool->alloc_bitmap[word], ~mask);
    atomic_fetch_add(&pool->free_count, 1);
}
```

#### 3.6.3 Synchronous Send/Receive (Rendezvous)

```c
// Service mailboxes for rendezvous
typedef struct {
    _Atomic jezgro_svc_id_t waiting_sender;   // Who is waiting to send
    _Atomic jezgro_svc_id_t waiting_receiver; // Who is waiting to receive
    _Atomic jezgro_msg_t*   pending_msg;      // Message being transferred
    jezgro_semaphore_t      send_sem;         // Sender blocks here
    jezgro_semaphore_t      recv_sem;         // Receiver blocks here
} service_mailbox_t;

static service_mailbox_t mailboxes[MAX_SERVICES];

// Blocking send - waits for receiver
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg) {
    service_mailbox_t* mb = &mailboxes[dst];
    jezgro_svc_id_t self = jezgro_get_current_svc();

    msg->src = self;
    msg->dst = dst;
    msg->timestamp = jezgro_get_ticks();

    // Check if receiver is already waiting
    jezgro_svc_id_t expected = SVC_NONE;
    if (atomic_compare_exchange_strong(&mb->waiting_receiver, &expected, self)) {
        // Receiver not waiting - we must wait
        atomic_store(&mb->pending_msg, msg);
        atomic_store(&mb->waiting_sender, self);

        // Block until receiver picks up
        jezgro_sem_wait(&mb->send_sem);
    } else {
        // Receiver already waiting - direct handoff
        atomic_store(&mb->pending_msg, msg);
        jezgro_sem_signal(&mb->recv_sem);
    }

    return JEZGRO_OK;
}

// Blocking receive - waits for sender
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t** msg_out) {
    service_mailbox_t* mb = &mailboxes[jezgro_get_current_svc()];

    // Check if sender is already waiting
    jezgro_svc_id_t sender = atomic_load(&mb->waiting_sender);
    if (sender != SVC_NONE && (src == SVC_ANY || src == sender)) {
        // Sender waiting - take message directly
        *msg_out = atomic_load(&mb->pending_msg);
        atomic_store(&mb->waiting_sender, SVC_NONE);
        jezgro_sem_signal(&mb->send_sem);
    } else {
        // No sender - we must wait
        atomic_store(&mb->waiting_receiver, jezgro_get_current_svc());
        jezgro_sem_wait(&mb->recv_sem);
        *msg_out = atomic_load(&mb->pending_msg);
    }

    return JEZGRO_OK;
}
```

#### 3.6.4 CAN-FD to JEZGRO IPC Mapping

External CAN-FD messages are translated to internal IPC messages by the CAN Handler service:

```
CAN-FD Extended ID (29 bits)          JEZGRO Message Fields
─────────────────────────────────     ───────────────────────────
┌────┬────┬────────────┬─────────┐    ┌─────────────────────────┐
│Pri │Type│   Source   │  Dest   │    │ flags.priority          │
│4bit│4bit│   12 bits  │ 9 bits  │    │ type                    │
└────┴────┴────────────┴─────────┘    │ src (translated)        │
  │    │        │           │         │ dst (translated)        │
  │    │        │           │         └─────────────────────────┘
  │    │        │           │
  │    │        │           └────────► Module ID → Service ID lookup
  │    │        └────────────────────► External module ID
  │    └─────────────────────────────► MSG_POWER_CMD, MSG_THERMAL, etc.
  └──────────────────────────────────► JEZGRO_PRIORITY_HIGH/MEDIUM/LOW

CAN-FD Data (64 bytes max)
┌────────┬────────┬──────────────────────────────────────────────┐
│ Seq    │  TS    │              Payload (max 56 bytes)          │
│ 4 bytes│4 bytes │                                              │
└────────┴────────┴──────────────────────────────────────────────┘
    │        │                    │
    │        │                    └──► msg->payload[0..55]
    │        └───────────────────────► msg->timestamp
    └────────────────────────────────► msg->seq
```

#### 3.6.5 CAN-FD Gateway Implementation

```c
// CAN RX to IPC translation
void can_rx_to_ipc(FDCAN_RxHeaderTypeDef* header, uint8_t* data) {
    // Decode CAN-FD extended ID
    uint32_t id = header->Identifier;
    uint8_t priority = (id >> 25) & 0x0F;
    uint8_t msg_type = (id >> 21) & 0x0F;
    uint16_t src_module = (id >> 9) & 0x0FFF;
    uint16_t dst_module = id & 0x01FF;

    // Allocate IPC message
    jezgro_msg_t* msg = jezgro_msg_alloc();
    if (!msg) {
        // Pool exhausted - log and drop
        audit_log(EVENT_IPC_POOL_FULL, 0, 0);
        return;
    }

    // Translate to internal service IDs
    msg->src = module_to_service_id(src_module);
    msg->dst = module_to_service_id(dst_module);
    msg->type = can_type_to_ipc_type(msg_type);
    msg->flags = priority_to_flags(priority);

    // Copy sequence and timestamp
    msg->seq = *(uint32_t*)&data[0];
    msg->timestamp = *(uint32_t*)&data[4];

    // Copy payload (up to 48 bytes)
    size_t payload_len = MIN(header->DataLength - 8, 48);
    memcpy(msg->payload, &data[8], payload_len);

    // Route to destination service
    if (msg->dst == SVC_BROADCAST) {
        jezgro_broadcast(msg);
    } else {
        jezgro_send(msg->dst, msg);
    }
}

// IPC to CAN TX translation
void ipc_to_can_tx(jezgro_msg_t* msg) {
    FDCAN_TxHeaderTypeDef header = {0};
    uint8_t data[64];

    // Build CAN-FD extended ID
    uint16_t dst_module = service_to_module_id(msg->dst);
    uint16_t src_module = service_to_module_id(msg->src);
    uint8_t msg_type = ipc_type_to_can_type(msg->type);
    uint8_t priority = flags_to_priority(msg->flags);

    header.Identifier = (priority << 25) |
                        (msg_type << 21) |
                        (src_module << 9) |
                        dst_module;
    header.IdType = FDCAN_EXTENDED_ID;
    header.FDFormat = FDCAN_FD_CAN;
    header.DataLength = FDCAN_DLC_BYTES_64;

    // Pack data
    *(uint32_t*)&data[0] = msg->seq;
    *(uint32_t*)&data[4] = msg->timestamp;
    memcpy(&data[8], msg->payload, 48);

    // Transmit (non-blocking, queued)
    HAL_FDCAN_AddMessageToTxFifoQ(&hfdcan1, &header, data);

    // Free the IPC message
    jezgro_msg_free(msg);
}
```

---

## 4. Service Development

### 4.1 Service Template

```c
// Service definition
JEZGRO_SERVICE_DEFINE(thermal_manager,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// Service main loop
void thermal_manager_main(void) {
    jezgro_msg_t msg;

    while (1) {
        // Feed watchdog
        jezgro_watchdog_feed();

        // Wait for message or timeout
        if (jezgro_receive_timeout(ANY, &msg, 100) == JEZGRO_OK) {
            handle_message(&msg);
        }

        // Periodic work
        check_thermal_limits();
    }
}
```

---

## 5. Real-Time Guarantees

### 5.1 Timing Analysis

| Operation | Worst Case | Typical |
|-----------|------------|---------|
| Interrupt latency | 500 ns | 200 ns |
| Context switch | 2 us | 500 ns |
| IPC send (sync) | 5 us | 1 us |
| IPC receive | 3 us | 500 ns |
| Service restart | 50 ms | 10 ms |

### 5.2 LLC Control Path

```c
// LLC control runs as highest-priority ISR
// Guaranteed < 1us response

__attribute__((section(".kernel.isr")))
void HRTIM_TIMA_IRQHandler(void) {
    // Read ADC (DMA pre-loaded)
    int32_t i_actual = adc_buffer[0];

    // PID calculation
    int32_t error = i_setpoint - i_actual;
    int32_t duty = Kp * error + Ki * integral + Kd * derivative;

    // Clamp and apply
    duty = CLAMP(duty, DUTY_MIN, DUTY_MAX);
    HRTIM1->sTimerxRegs[0].CMP1xR = duty;
}
```

---

## 6. Comparison with Alternatives

| Feature | JEZGRO | FreeRTOS | Zephyr | seL4 | MINIX 3 |
|---------|--------|----------|--------|------|---------|
| Kernel type | Microkernel | Monolithic | Hybrid | Microkernel | Microkernel |
| Fault isolation | MPU | Optional | MPU | MMU | MMU |
| Auto-restart | Yes | No | No | No | Yes |
| Hard real-time | Yes | Yes | Yes | No | No |
| Min RAM | 32 KB | 8 KB | 32 KB | 256 KB | 16 MB |
| MMU required | No | No | No | Yes | Yes |
| Power electronics | Designed for | Generic | Generic | No | No |

---

## 7. Implementation Status

### 7.1 Development Roadmap

| Phase | Component | Status | Target |
|-------|-----------|--------|--------|
| 1 | Kernel core | Planned | Q1 2026 |
| 1 | MPU manager | Planned | Q1 2026 |
| 2 | IPC system | Planned | Q2 2026 |
| 2 | Reincarnation server | Planned | Q2 2026 |
| 3 | LLC driver | Planned | Q2 2026 |
| 4 | Service framework | Planned | Q3 2026 |

---

## 8. EK3 Firmware Integration

This section describes how JEZGRO integrates with the EK3 modular charging system.

### 8.1 EK3 Service Configuration

| ID | Service Name | Priority | Stack | Memory | Watchdog | Purpose |
|----|--------------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 2 KB | 8 KB | - | Core (privileged) |
| 1 | LLC_CONTROL | CRITICAL | 2 KB | 16 KB | 10 ms | Power stage control |
| 2 | SAFETY_MONITOR | CRITICAL | 1 KB | 4 KB | 50 ms | Hardware protection |
| 3 | CAN_HANDLER | HIGH | 2 KB | 8 KB | 100 ms | CAN-FD protocol |
| 4 | THERMAL_MGR | MEDIUM | 2 KB | 8 KB | 500 ms | Thermal management |
| 5 | ROJ_COORD | MEDIUM | 4 KB | 16 KB | 1000 ms | Swarm intelligence |
| 6 | AUDIT_LOGGER | LOW | 4 KB | 16 KB | 2000 ms | Event logging |

**Total RAM Usage:** ~78 KB (of 128 KB available)

### 8.2 Service Initialization Sequence

```c
// Startup sequence - order matters!
void jezgro_ek3_init(void) {
    // 1. Kernel initialization (privileged, no MPU yet)
    kernel_init();
    mpu_init_static_regions();

    // 2. Critical services (power must be safe immediately)
    service_create(SVC_LLC_CONTROL, llc_control_main);
    service_create(SVC_SAFETY_MONITOR, safety_monitor_main);

    // 3. Communication
    service_create(SVC_CAN_HANDLER, can_handler_main);

    // 4. Non-critical services
    service_create(SVC_THERMAL_MGR, thermal_manager_main);
    service_create(SVC_ROJ_COORD, swarm_coordinator_main);
    service_create(SVC_AUDIT_LOGGER, audit_logger_main);

    // 5. Start scheduler
    scheduler_start();
}
```

### 8.3 Message Flow Examples

#### 8.3.1 Power Command Flow (External → LLC)

```
Station Controller                        EK3 Module
       │                                      │
       │   CAN-FD: POWER_CMD(target=3000W)   │
       │─────────────────────────────────────►│
       │         ID: 0x10300042               │
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
       │                            PWM duty cycle update
       │                                     │
       │   CAN-FD: POWER_ACK(actual=2980W)  │
       │◄────────────────────────────────────│
       │         ID: 0x18300042              │
```

#### 8.3.2 Thermal Warning Escalation

```
                     ┌──────────────────┐
                     │  THERMAL_MGR     │
                     │  temp=92°C       │
                     └────────┬─────────┘
                              │
              IPC: MSG_THERMAL_WARNING
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │  LLC_CONTROL  │  │  AUDIT_LOGGER │  │  CAN_HANDLER  │
   │  derate 20%   │  │  log event    │  │  alert CAN    │
   └───────────────┘  └───────────────┘  └───────────────┘
```

#### 8.3.3 Swarm Leader Election

```
Module 1              Module 2              Module 3
    │                     │                     │
    │   CAN: ELECTION_START(term=1, id=1)      │
    │────────────────────►│────────────────────►│
    │                     │                     │
    │   CAN: VOTE(term=1, for=1)               │
    │◄────────────────────│                     │
    │   CAN: VOTE(term=1, for=1)               │
    │◄────────────────────┼─────────────────────│
    │                     │                     │
    │   CAN: LEADER_ANNOUNCE(term=1, leader=1) │
    │────────────────────►│────────────────────►│
    │                     │                     │
  Leader               Follower             Follower
```

### 8.4 Migration Path from FreeRTOS

For teams currently using FreeRTOS, JEZGRO provides a migration path:

| FreeRTOS Concept | JEZGRO Equivalent | Migration Notes |
|------------------|-------------------|-----------------|
| `xTaskCreate()` | `JEZGRO_SERVICE_DEFINE()` | Add MPU region config |
| `vTaskDelay()` | `jezgro_sleep()` | 1:1 mapping |
| `xQueueSend()` | `jezgro_send()` | Change to IPC message |
| `xQueueReceive()` | `jezgro_receive()` | Change to IPC message |
| `xSemaphore*` | `jezgro_sem_*` | Similar API |
| `configASSERT()` | `jezgro_assert()` | Triggers Reincarnation |
| `vApplicationIdleHook()` | `jezgro_idle_hook()` | Same purpose |
| `vApplicationStackOverflowHook()` | MPU fault handler | Automatic recovery |

**Key Differences:**
1. **Isolation**: FreeRTOS tasks share memory; JEZGRO services are MPU-isolated
2. **Recovery**: FreeRTOS stack overflow = reset; JEZGRO = service restart
3. **Communication**: FreeRTOS queues copy data; JEZGRO IPC is zero-copy
4. **Privilege**: FreeRTOS all same level; JEZGRO has kernel/service split

### 8.5 Relationship to Other Documents

| Document | Relationship |
|----------|--------------|
| `tehnika/10-microkernel-architecture.md` | Parent architecture (JEZGRO implements this) |
| `tehnika/14-firmware-architecture.md` | FreeRTOS baseline (JEZGRO evolution) |
| `tehnika/05-swarm-intelligence.md` | Swarm algorithms (run as JEZGRO service) |
| `tehnika/11-security-model.md` | Trust boundaries (implemented via MPU) |
| `tehnika/12-audit-logging.md` | Audit service (JEZGRO service example) |
| `tehnika/inzenjersko/en/15-custom-rack-system.md` | Rack controller runs JEZGRO (Section 10), hardware microkernel |
| `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | Patent claims |

---

## 9. Complete API Reference

This section provides the complete header file specifications for JEZGRO.

### 9.1 jezgro.h - Main Kernel API

```c
/**
 * @file jezgro.h
 * @brief JEZGRO Microkernel - Main Public API
 * @version 1.0.0
 *
 * This is the primary header for JEZGRO services. Include this file
 * to access all kernel functionality.
 */

#ifndef JEZGRO_H
#define JEZGRO_H

#include "jezgro_types.h"
#include "jezgro_err.h"
#include "jezgro_config.h"

#ifdef __cplusplus
extern "C" {
#endif

/*============================================================================
 * KERNEL INITIALIZATION
 *============================================================================*/

/**
 * @brief Initialize the JEZGRO kernel
 *
 * Must be called before any other JEZGRO function.
 * Initializes scheduler, MPU, IPC pool, and reincarnation server.
 */
void jezgro_init(void);

/**
 * @brief Start the JEZGRO kernel scheduler
 *
 * This function does not return. It starts the first task and
 * begins the scheduling loop.
 */
__attribute__((noreturn))
void jezgro_start(void);

/**
 * @brief Get kernel version
 * @return Version as 32-bit value (major.minor.patch packed)
 */
uint32_t jezgro_version(void);

/*============================================================================
 * SERVICE MANAGEMENT
 *============================================================================*/

/**
 * @brief Register a service with the kernel
 * @param def Service definition structure
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_service_register(const jezgro_service_def_t* def);

/**
 * @brief Start a registered service
 * @param svc_id Service identifier
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_service_start(jezgro_svc_id_t svc_id);

/**
 * @brief Stop a running service gracefully
 * @param svc_id Service identifier
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_service_stop(jezgro_svc_id_t svc_id);

/**
 * @brief Get current service state
 * @param svc_id Service identifier
 * @return Current service state
 */
jezgro_svc_state_t jezgro_service_state(jezgro_svc_id_t svc_id);

/*============================================================================
 * IPC - SYNCHRONOUS MESSAGE PASSING
 *============================================================================*/

/**
 * @brief Send a message (blocking)
 *
 * Blocks until the destination service receives the message.
 * Zero-copy: message is passed by reference through shared pool.
 *
 * @param dst Destination service ID
 * @param msg Pointer to message (must be from jezgro_msg_alloc)
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg);

/**
 * @brief Receive a message (blocking)
 *
 * Blocks until a message is available from the specified source.
 *
 * @param src Source service ID (or JEZGRO_SVC_ANY)
 * @param msg Pointer to receive message pointer
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t** msg);

/**
 * @brief Send and receive in one operation (RPC pattern)
 * @param dst Destination service ID
 * @param msg_out Outgoing message
 * @param msg_in Pointer to receive reply
 * @return JEZGRO_OK on success, error code otherwise
 */
jezgro_err_t jezgro_send_receive(jezgro_svc_id_t dst,
                                  jezgro_msg_t* msg_out,
                                  jezgro_msg_t** msg_in);

/*============================================================================
 * IPC - ASYNCHRONOUS MESSAGE PASSING
 *============================================================================*/

/**
 * @brief Send a message (non-blocking)
 *
 * Queues message for delivery without waiting for receiver.
 *
 * @param dst Destination service ID
 * @param msg Pointer to message
 * @return JEZGRO_OK on success, JEZGRO_ERR_QUEUE_FULL if queue is full
 */
jezgro_err_t jezgro_send_async(jezgro_svc_id_t dst, jezgro_msg_t* msg);

/**
 * @brief Receive a message with timeout
 * @param src Source service ID (or JEZGRO_SVC_ANY)
 * @param msg Pointer to receive message pointer
 * @param timeout_ms Timeout in milliseconds (0 = non-blocking poll)
 * @return JEZGRO_OK, JEZGRO_ERR_TIMEOUT, or other error
 */
jezgro_err_t jezgro_receive_timeout(jezgro_svc_id_t src,
                                     jezgro_msg_t** msg,
                                     uint32_t timeout_ms);

/**
 * @brief Broadcast message to all services
 * @param msg Message to broadcast (will be copied)
 * @return JEZGRO_OK on success
 */
jezgro_err_t jezgro_broadcast(jezgro_msg_t* msg);

/*============================================================================
 * MESSAGE POOL MANAGEMENT
 *============================================================================*/

/**
 * @brief Allocate a message from the pool
 * @return Pointer to message, or NULL if pool exhausted
 */
jezgro_msg_t* jezgro_msg_alloc(void);

/**
 * @brief Free a message back to the pool
 * @param msg Message to free
 */
void jezgro_msg_free(jezgro_msg_t* msg);

/**
 * @brief Get number of free message slots
 * @return Number of available slots
 */
uint32_t jezgro_msg_pool_free(void);

/*============================================================================
 * WATCHDOG
 *============================================================================*/

/**
 * @brief Feed the service watchdog
 *
 * Services must call this periodically to prevent watchdog timeout.
 * Timeout is configured per-service in the service definition.
 */
void jezgro_watchdog_feed(void);

/**
 * @brief Get remaining watchdog time
 * @return Milliseconds until watchdog timeout
 */
uint32_t jezgro_watchdog_remaining(void);

/*============================================================================
 * TIME AND DELAY
 *============================================================================*/

/**
 * @brief Get kernel tick count
 * @return Current tick count (1 tick = 1 ms)
 */
uint32_t jezgro_get_ticks(void);

/**
 * @brief Get kernel uptime in milliseconds
 * @return Uptime in milliseconds
 */
uint64_t jezgro_get_uptime_ms(void);

/**
 * @brief Sleep for specified duration
 * @param ms Duration in milliseconds
 */
void jezgro_sleep(uint32_t ms);

/**
 * @brief Yield to other services
 *
 * Voluntarily give up remaining time slice.
 */
void jezgro_yield(void);

/*============================================================================
 * SYSTEM INFORMATION
 *============================================================================*/

/**
 * @brief Get current service ID
 * @return Service ID of calling service
 */
jezgro_svc_id_t jezgro_get_current_svc(void);

/**
 * @brief Get remaining stack space
 * @return Bytes of stack remaining (approximate)
 */
uint32_t jezgro_get_free_stack(void);

/**
 * @brief Get restart count for a service
 * @param svc_id Service identifier
 * @return Number of times service has been restarted
 */
uint32_t jezgro_get_restart_count(jezgro_svc_id_t svc_id);

/**
 * @brief Get CPU usage percentage
 * @return CPU usage (0-100)
 */
uint8_t jezgro_get_cpu_usage(void);

/*============================================================================
 * SYNCHRONIZATION PRIMITIVES
 *============================================================================*/

/**
 * @brief Initialize a semaphore
 * @param sem Pointer to semaphore
 * @param initial Initial count
 */
void jezgro_sem_init(jezgro_sem_t* sem, uint32_t initial);

/**
 * @brief Wait on semaphore (blocking)
 * @param sem Pointer to semaphore
 */
void jezgro_sem_wait(jezgro_sem_t* sem);

/**
 * @brief Wait on semaphore with timeout
 * @param sem Pointer to semaphore
 * @param timeout_ms Timeout in milliseconds
 * @return JEZGRO_OK or JEZGRO_ERR_TIMEOUT
 */
jezgro_err_t jezgro_sem_wait_timeout(jezgro_sem_t* sem, uint32_t timeout_ms);

/**
 * @brief Signal semaphore
 * @param sem Pointer to semaphore
 */
void jezgro_sem_signal(jezgro_sem_t* sem);

/*============================================================================
 * ASSERTIONS AND PANICS
 *============================================================================*/

/**
 * @brief Assert condition (triggers restart on failure)
 * @param condition Condition to check
 * @param msg Error message for logging
 */
#define jezgro_assert(condition, msg) \
    do { \
        if (!(condition)) { \
            jezgro_panic(__FILE__, __LINE__, msg); \
        } \
    } while(0)

/**
 * @brief Trigger service panic (triggers Reincarnation)
 * @param file Source file
 * @param line Line number
 * @param msg Panic message
 */
__attribute__((noreturn))
void jezgro_panic(const char* file, int line, const char* msg);

#ifdef __cplusplus
}
#endif

#endif /* JEZGRO_H */
```

### 9.2 jezgro_types.h - Type Definitions

```c
/**
 * @file jezgro_types.h
 * @brief JEZGRO type definitions
 */

#ifndef JEZGRO_TYPES_H
#define JEZGRO_TYPES_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

/*============================================================================
 * BASIC TYPES
 *============================================================================*/

typedef uint8_t  jezgro_svc_id_t;    /* Service identifier (0-255) */
typedef uint8_t  jezgro_task_id_t;   /* Task identifier */
typedef uint8_t  jezgro_priority_t;  /* Priority level (0=highest) */

/*============================================================================
 * SPECIAL SERVICE IDS
 *============================================================================*/

#define JEZGRO_SVC_KERNEL      0x00  /* Kernel (reserved) */
#define JEZGRO_SVC_REINCARN    0x01  /* Reincarnation server */
#define JEZGRO_SVC_LLC         0x02  /* LLC control driver */
#define JEZGRO_SVC_SAFETY      0x03  /* Safety monitor */
#define JEZGRO_SVC_CAN         0x04  /* CAN handler */
#define JEZGRO_SVC_THERMAL     0x05  /* Thermal manager */
#define JEZGRO_SVC_SWARM       0x06  /* Swarm coordinator */
#define JEZGRO_SVC_AUDIT       0x07  /* Audit logger */
#define JEZGRO_SVC_ANY         0xFE  /* Any service (for receive) */
#define JEZGRO_SVC_BROADCAST   0xFF  /* Broadcast destination */

#define JEZGRO_SVC_USER_BASE   0x10  /* First user-defined service ID */
#define JEZGRO_SVC_MAX         0xFD  /* Maximum service ID */

/*============================================================================
 * PRIORITY LEVELS
 *============================================================================*/

#define JEZGRO_PRIORITY_REALTIME   0   /* Kernel, LLC control */
#define JEZGRO_PRIORITY_CRITICAL   2   /* Safety-critical */
#define JEZGRO_PRIORITY_HIGH       4   /* High priority */
#define JEZGRO_PRIORITY_MEDIUM     8   /* Normal services */
#define JEZGRO_PRIORITY_LOW       12   /* Background tasks */
#define JEZGRO_PRIORITY_IDLE      15   /* Lowest priority */

/*============================================================================
 * SERVICE STATES
 *============================================================================*/

typedef enum {
    JEZGRO_SVC_STATE_UNLOADED   = 0,  /* Not loaded */
    JEZGRO_SVC_STATE_LOADED     = 1,  /* Loaded, not running */
    JEZGRO_SVC_STATE_RUNNING    = 2,  /* Active */
    JEZGRO_SVC_STATE_BLOCKED    = 3,  /* Waiting for IPC/semaphore */
    JEZGRO_SVC_STATE_SUSPENDED  = 4,  /* Manually suspended */
    JEZGRO_SVC_STATE_FAULTED    = 5,  /* Crashed, pending restart */
    JEZGRO_SVC_STATE_RESTARTING = 6,  /* Being restarted */
    JEZGRO_SVC_STATE_DEGRADED   = 7   /* Too many restarts, disabled */
} jezgro_svc_state_t;

/*============================================================================
 * MESSAGE STRUCTURE
 *============================================================================*/

/**
 * @brief IPC Message (64-byte aligned for cache efficiency)
 */
typedef struct __attribute__((packed, aligned(64))) {
    jezgro_svc_id_t  src;           /* Source service ID */
    jezgro_svc_id_t  dst;           /* Destination service ID */
    uint16_t         type;          /* Message type (application-defined) */
    uint16_t         flags;         /* Message flags */
    uint16_t         seq;           /* Sequence number */
    uint32_t         timestamp;     /* Timestamp (kernel ticks) */
    uint8_t          payload[48];   /* Data payload */
} jezgro_msg_t;

/* Compile-time check for message size */
_Static_assert(sizeof(jezgro_msg_t) == 64, "Message must be 64 bytes");

/*============================================================================
 * MESSAGE FLAGS
 *============================================================================*/

#define JEZGRO_MSG_FLAG_SYNC     (1 << 0)  /* Synchronous message */
#define JEZGRO_MSG_FLAG_ASYNC    (1 << 1)  /* Asynchronous message */
#define JEZGRO_MSG_FLAG_URGENT   (1 << 2)  /* High priority */
#define JEZGRO_MSG_FLAG_REPLY    (1 << 3)  /* This is a reply */
#define JEZGRO_MSG_FLAG_NOACK    (1 << 4)  /* No acknowledgment needed */

/*============================================================================
 * STANDARD MESSAGE TYPES
 *============================================================================*/

/* System messages (0x0000 - 0x00FF) */
#define JEZGRO_MSG_NOP             0x0000  /* No operation */
#define JEZGRO_MSG_SERVICE_UP      0x0001  /* Service started */
#define JEZGRO_MSG_SERVICE_DOWN    0x0002  /* Service stopped/crashed */
#define JEZGRO_MSG_WATCHDOG_WARN   0x0003  /* Watchdog warning */
#define JEZGRO_MSG_SHUTDOWN        0x0004  /* System shutdown */
#define JEZGRO_MSG_PING            0x0005  /* Ping request */
#define JEZGRO_MSG_PONG            0x0006  /* Ping response */

/* Power control messages (0x0100 - 0x01FF) */
#define JEZGRO_MSG_POWER_CMD       0x0100  /* Power command */
#define JEZGRO_MSG_POWER_ACK       0x0101  /* Power acknowledgment */
#define JEZGRO_MSG_POWER_STATUS    0x0102  /* Power status report */

/* Thermal messages (0x0200 - 0x02FF) */
#define JEZGRO_MSG_THERMAL_STATUS  0x0200  /* Temperature report */
#define JEZGRO_MSG_THERMAL_WARNING 0x0201  /* Over-temperature warning */
#define JEZGRO_MSG_THERMAL_DERATING 0x0202 /* Derate request */
#define JEZGRO_MSG_THERMAL_NORMAL  0x0203  /* Temperature normal */

/* Swarm messages (0x0300 - 0x03FF) */
#define JEZGRO_MSG_SWARM_HEARTBEAT 0x0300  /* Heartbeat */
#define JEZGRO_MSG_SWARM_ELECTION  0x0301  /* Leader election */
#define JEZGRO_MSG_SWARM_VOTE      0x0302  /* Vote */
#define JEZGRO_MSG_SWARM_LEADER    0x0303  /* Leader announcement */
#define JEZGRO_MSG_SWARM_BALANCE   0x0304  /* Load balance command */

/* User-defined messages (0x8000 - 0xFFFF) */
#define JEZGRO_MSG_USER_BASE       0x8000

/*============================================================================
 * SERVICE DEFINITION STRUCTURE
 *============================================================================*/

/**
 * @brief Service definition for registration
 */
typedef struct {
    const char*        name;            /* Service name (debug) */
    jezgro_svc_id_t    id;              /* Unique service ID */
    jezgro_priority_t  priority;        /* Scheduling priority */
    uint32_t           stack_size;      /* Stack size in bytes */
    uint32_t           memory_size;     /* Data region size in bytes */
    uint32_t           watchdog_ms;     /* Watchdog timeout (0=disabled) */
    void             (*entry)(void);    /* Entry point function */
    void             (*cleanup)(void);  /* Cleanup before restart (optional) */
    void*              saved_state;     /* State preservation buffer */
    size_t             saved_state_size;/* State buffer size */
} jezgro_service_def_t;

/*============================================================================
 * TASK CONTROL BLOCK
 *============================================================================*/

typedef struct {
    jezgro_task_id_t   id;              /* Task ID */
    jezgro_svc_id_t    svc_id;          /* Owning service */
    jezgro_priority_t  priority;        /* Static priority */
    jezgro_svc_state_t state;           /* Current state */
    uint32_t           deadline;        /* Absolute deadline (EDF) */
    uint32_t           period;          /* Period (for periodic tasks) */
    void*              stack_base;      /* Stack base address */
    void*              stack_ptr;       /* Current stack pointer */
    uint32_t           stack_size;      /* Stack size */
    uint32_t           mpu_regions[4][2]; /* MPU config (base, attr) */
    uint8_t            num_mpu_regions; /* Number of MPU regions */
    uint32_t           watchdog_reload; /* Watchdog reload value */
    uint32_t           watchdog_counter;/* Watchdog counter */
    uint32_t           restart_count;   /* Restart statistics */
    uint32_t           cpu_time;        /* CPU time used (ticks) */
} jezgro_tcb_t;

/*============================================================================
 * SYNCHRONIZATION PRIMITIVES
 *============================================================================*/

typedef struct {
    volatile int32_t count;
    void* waiting_list;  /* Internal use */
} jezgro_sem_t;

typedef struct {
    volatile uint32_t locked;
    jezgro_svc_id_t owner;
    void* waiting_list;  /* Internal use */
} jezgro_mutex_t;

/*============================================================================
 * FAULT TYPES
 *============================================================================*/

typedef enum {
    JEZGRO_FAULT_NONE = 0,
    JEZGRO_FAULT_MPU_VIOLATION,    /* Memory protection fault */
    JEZGRO_FAULT_BUS_ERROR,        /* Bus fault */
    JEZGRO_FAULT_USAGE,            /* Usage fault */
    JEZGRO_FAULT_WATCHDOG,         /* Watchdog timeout */
    JEZGRO_FAULT_STACK_OVERFLOW,   /* Stack overflow */
    JEZGRO_FAULT_ASSERT,           /* Assertion failed */
    JEZGRO_FAULT_PANIC,            /* Service panic */
    JEZGRO_FAULT_HARD             /* Hard fault */
} jezgro_fault_type_t;

#endif /* JEZGRO_TYPES_H */
```

### 9.3 jezgro_err.h - Error Codes

```c
/**
 * @file jezgro_err.h
 * @brief JEZGRO error codes
 */

#ifndef JEZGRO_ERR_H
#define JEZGRO_ERR_H

typedef int32_t jezgro_err_t;

/*============================================================================
 * ERROR CODES
 *============================================================================*/

/* Success */
#define JEZGRO_OK                   0

/* Generic errors (-1 to -99) */
#define JEZGRO_ERR_GENERIC         -1   /* Generic error */
#define JEZGRO_ERR_INVALID_PARAM   -2   /* Invalid parameter */
#define JEZGRO_ERR_NO_MEM          -3   /* Out of memory */
#define JEZGRO_ERR_TIMEOUT         -4   /* Operation timed out */
#define JEZGRO_ERR_BUSY            -5   /* Resource busy */
#define JEZGRO_ERR_NOT_FOUND       -6   /* Resource not found */
#define JEZGRO_ERR_NOT_READY       -7   /* Not ready */
#define JEZGRO_ERR_PERMISSION      -8   /* Permission denied */

/* Service errors (-100 to -199) */
#define JEZGRO_ERR_SVC_EXISTS      -100 /* Service already exists */
#define JEZGRO_ERR_SVC_NOT_FOUND   -101 /* Service not found */
#define JEZGRO_ERR_SVC_NOT_RUNNING -102 /* Service not running */
#define JEZGRO_ERR_SVC_FAULTED     -103 /* Service in faulted state */
#define JEZGRO_ERR_SVC_MAX         -104 /* Max services reached */

/* IPC errors (-200 to -299) */
#define JEZGRO_ERR_IPC_POOL_EMPTY  -200 /* Message pool exhausted */
#define JEZGRO_ERR_IPC_QUEUE_FULL  -201 /* Message queue full */
#define JEZGRO_ERR_IPC_INVALID_DST -202 /* Invalid destination */
#define JEZGRO_ERR_IPC_INVALID_SRC -203 /* Invalid source */
#define JEZGRO_ERR_IPC_DROPPED     -204 /* Message dropped */

/* MPU errors (-300 to -399) */
#define JEZGRO_ERR_MPU_INVALID_REGION -300 /* Invalid MPU region */
#define JEZGRO_ERR_MPU_ALIGNMENT   -301 /* Alignment error */
#define JEZGRO_ERR_MPU_SIZE        -302 /* Invalid region size */
#define JEZGRO_ERR_MPU_OVERLAP     -303 /* Region overlap */

/* Scheduler errors (-400 to -499) */
#define JEZGRO_ERR_SCHED_NO_TASK   -400 /* No runnable task */
#define JEZGRO_ERR_SCHED_DEADLINE  -401 /* Deadline missed */

/*============================================================================
 * ERROR CHECKING MACROS
 *============================================================================*/

#define JEZGRO_IS_OK(err)    ((err) == JEZGRO_OK)
#define JEZGRO_IS_ERR(err)   ((err) < JEZGRO_OK)

/* Return if error */
#define JEZGRO_CHECK(expr) \
    do { \
        jezgro_err_t _err = (expr); \
        if (JEZGRO_IS_ERR(_err)) return _err; \
    } while(0)

/* Return if NULL */
#define JEZGRO_CHECK_NULL(ptr) \
    do { \
        if ((ptr) == NULL) return JEZGRO_ERR_INVALID_PARAM; \
    } while(0)

#endif /* JEZGRO_ERR_H */
```

### 9.4 jezgro_mpu.h - MPU Manager API

```c
/**
 * @file jezgro_mpu.h
 * @brief MPU Manager API for fault isolation
 */

#ifndef JEZGRO_MPU_H
#define JEZGRO_MPU_H

#include "jezgro_types.h"
#include "jezgro_err.h"

/*============================================================================
 * MPU PERMISSIONS (Cortex-M4 encoding)
 *============================================================================*/

/* Access permissions (AP field) */
#define JEZGRO_MPU_AP_NO_ACCESS      0x00  /* No access */
#define JEZGRO_MPU_AP_PRIV_RW        0x01  /* Privileged R/W */
#define JEZGRO_MPU_AP_PRIV_RW_URO    0x02  /* Privileged R/W, Unprivileged RO */
#define JEZGRO_MPU_AP_FULL_ACCESS    0x03  /* Full access */
#define JEZGRO_MPU_AP_PRIV_RO        0x05  /* Privileged RO */
#define JEZGRO_MPU_AP_RO             0x06  /* Read-only all */

/* Execute never flag */
#define JEZGRO_MPU_XN                0x01  /* Execute never */

/* Cache/buffer attributes */
#define JEZGRO_MPU_STRONGLY_ORDERED  0x00  /* Strongly ordered */
#define JEZGRO_MPU_DEVICE            0x01  /* Device memory */
#define JEZGRO_MPU_NORMAL_WT         0x02  /* Normal, write-through */
#define JEZGRO_MPU_NORMAL_WB         0x03  /* Normal, write-back */

/*============================================================================
 * MPU SIZE ENCODING
 *============================================================================*/

/* Size field (power of 2, minimum 32 bytes) */
#define JEZGRO_MPU_SIZE_32B          0x04
#define JEZGRO_MPU_SIZE_64B          0x05
#define JEZGRO_MPU_SIZE_128B         0x06
#define JEZGRO_MPU_SIZE_256B         0x07
#define JEZGRO_MPU_SIZE_512B         0x08
#define JEZGRO_MPU_SIZE_1KB          0x09
#define JEZGRO_MPU_SIZE_2KB          0x0A
#define JEZGRO_MPU_SIZE_4KB          0x0B
#define JEZGRO_MPU_SIZE_8KB          0x0C
#define JEZGRO_MPU_SIZE_16KB         0x0D
#define JEZGRO_MPU_SIZE_32KB         0x0E
#define JEZGRO_MPU_SIZE_64KB         0x0F
#define JEZGRO_MPU_SIZE_128KB        0x10
#define JEZGRO_MPU_SIZE_256KB        0x11
#define JEZGRO_MPU_SIZE_512KB        0x12
#define JEZGRO_MPU_SIZE_1MB          0x13

/*============================================================================
 * MPU REGION INDICES
 *============================================================================*/

#define JEZGRO_MPU_REGION_FLASH      0  /* Flash (code) */
#define JEZGRO_MPU_REGION_KERNEL     1  /* Kernel RAM */
#define JEZGRO_MPU_REGION_PERIPH     2  /* Peripherals */
#define JEZGRO_MPU_REGION_SVC_MEM    3  /* Service memory (dynamic) */
#define JEZGRO_MPU_REGION_SVC_STACK  4  /* Service stack (dynamic) */
#define JEZGRO_MPU_REGION_IPC_POOL   5  /* IPC message pool */
#define JEZGRO_MPU_REGION_DRIVER     6  /* Driver-specific */
#define JEZGRO_MPU_REGION_GUARD      7  /* Stack guard */

#define JEZGRO_MPU_MAX_REGIONS       8

/*============================================================================
 * MPU REGION STRUCTURE
 *============================================================================*/

typedef struct {
    void*    base;          /* Base address (must be size-aligned) */
    uint32_t size;          /* Size in bytes (power of 2) */
    uint8_t  permissions;   /* Access permissions (AP field) */
    uint8_t  attributes;    /* Cache/buffer attributes */
    bool     executable;    /* Code execution allowed */
    uint8_t  subregion_disable; /* Subregion disable mask */
} jezgro_mpu_region_t;

/*============================================================================
 * MPU API FUNCTIONS
 *============================================================================*/

/**
 * @brief Initialize MPU with default kernel regions
 */
void jezgro_mpu_init(void);

/**
 * @brief Configure a specific MPU region
 * @param region_num Region number (0-7)
 * @param region Region configuration
 * @return JEZGRO_OK on success
 */
jezgro_err_t jezgro_mpu_configure_region(uint8_t region_num,
                                          const jezgro_mpu_region_t* region);

/**
 * @brief Switch MPU context for a task
 * @param tcb Task control block with MPU configuration
 */
void jezgro_mpu_switch_context(const jezgro_tcb_t* tcb);

/**
 * @brief Disable MPU (for privileged operations)
 */
void jezgro_mpu_disable(void);

/**
 * @brief Enable MPU
 */
void jezgro_mpu_enable(void);

/**
 * @brief Check if address is accessible by current task
 * @param addr Address to check
 * @param size Size of access
 * @param write True for write access, false for read
 * @return True if access is allowed
 */
bool jezgro_mpu_check_access(void* addr, uint32_t size, bool write);

/**
 * @brief Get MPU fault address (after MemManage fault)
 * @return Faulting address or 0 if not valid
 */
uint32_t jezgro_mpu_get_fault_addr(void);

/**
 * @brief Compute RASR value from region config
 * @param region Region configuration
 * @return RASR register value
 */
uint32_t jezgro_mpu_compute_rasr(const jezgro_mpu_region_t* region);

#endif /* JEZGRO_MPU_H */
```

### 9.5 jezgro_ipc.h - IPC System API

```c
/**
 * @file jezgro_ipc.h
 * @brief Zero-copy IPC message passing system
 */

#ifndef JEZGRO_IPC_H
#define JEZGRO_IPC_H

#include "jezgro_types.h"
#include "jezgro_err.h"

/*============================================================================
 * IPC CONFIGURATION
 *============================================================================*/

#define JEZGRO_IPC_POOL_BASE     0x2001E000  /* Pool base address */
#define JEZGRO_IPC_POOL_SIZE     32768       /* 32KB total */
#define JEZGRO_IPC_MSG_SIZE      64          /* Bytes per message */
#define JEZGRO_IPC_MSG_COUNT     511         /* Number of slots */
#define JEZGRO_IPC_QUEUE_DEPTH   32          /* Per-service queue */

/*============================================================================
 * IPC INTERNAL API (for kernel use)
 *============================================================================*/

/**
 * @brief Initialize IPC subsystem
 */
void jezgro_ipc_init(void);

/**
 * @brief Queue a message for delivery (internal)
 * @param msg Message to queue
 * @return JEZGRO_OK or error
 */
jezgro_err_t jezgro_ipc_queue(jezgro_msg_t* msg);

/**
 * @brief Dequeue a message (internal)
 * @param svc_id Receiving service ID
 * @param msg_out Pointer to receive message
 * @return JEZGRO_OK or error
 */
jezgro_err_t jezgro_ipc_dequeue(jezgro_svc_id_t svc_id,
                                 jezgro_msg_t** msg_out);

/**
 * @brief Flush all messages for a service (on restart)
 * @param svc_id Service ID
 */
void jezgro_ipc_flush(jezgro_svc_id_t svc_id);

/**
 * @brief Get queue depth for a service
 * @param svc_id Service ID
 * @return Number of pending messages
 */
uint32_t jezgro_ipc_queue_depth(jezgro_svc_id_t svc_id);

/**
 * @brief Get pool statistics
 * @param total_slots Output: total slot count
 * @param free_slots Output: available slots
 */
void jezgro_ipc_stats(uint32_t* total_slots, uint32_t* free_slots);

/*============================================================================
 * MESSAGE HELPER MACROS
 *============================================================================*/

/* Initialize a message */
#define JEZGRO_MSG_INIT(msg, msg_type, msg_dst) \
    do { \
        (msg)->src = jezgro_get_current_svc(); \
        (msg)->dst = (msg_dst); \
        (msg)->type = (msg_type); \
        (msg)->flags = JEZGRO_MSG_FLAG_SYNC; \
        (msg)->seq = 0; \
        (msg)->timestamp = jezgro_get_ticks(); \
    } while(0)

/* Set payload data */
#define JEZGRO_MSG_SET_PAYLOAD(msg, data, len) \
    memcpy((msg)->payload, (data), MIN((len), 48))

/* Get payload as typed pointer */
#define JEZGRO_MSG_PAYLOAD_AS(msg, type) \
    ((type*)((msg)->payload))

#endif /* JEZGRO_IPC_H */
```

### 9.6 service_macros.h - Service Framework

```c
/**
 * @file service_macros.h
 * @brief Service definition macros for easy service creation
 */

#ifndef SERVICE_MACROS_H
#define SERVICE_MACROS_H

#include "jezgro.h"

/*============================================================================
 * SERVICE DEFINITION MACROS
 *============================================================================*/

/**
 * @brief Define a JEZGRO service
 *
 * Creates service definition, stack, and memory regions.
 *
 * @param name Service name (identifier)
 * @param _id Unique service ID
 * @param _entry Entry point function
 * @param _stack Stack size in bytes (power of 2)
 * @param _memory Memory region size in bytes (power of 2)
 * @param _watchdog Watchdog timeout in ms (0 = disabled)
 */
#define JEZGRO_SERVICE_DEFINE(name, _id, _entry, _stack, _memory, _watchdog) \
    \
    /* Allocate stack in dedicated section */ \
    static uint8_t __attribute__((section(".service_stack." #name), \
                                  aligned(_stack))) \
        _##name##_stack[_stack]; \
    \
    /* Allocate memory region in dedicated section */ \
    static uint8_t __attribute__((section(".service_mem." #name), \
                                  aligned(32))) \
        _##name##_memory[_memory]; \
    \
    /* Service definition structure */ \
    const jezgro_service_def_t name##_def = { \
        .name = #name, \
        .id = (_id), \
        .priority = JEZGRO_PRIORITY_MEDIUM, \
        .stack_size = (_stack), \
        .memory_size = (_memory), \
        .watchdog_ms = (_watchdog), \
        .entry = (_entry), \
        .cleanup = NULL, \
        .saved_state = NULL, \
        .saved_state_size = 0 \
    }

/**
 * @brief Define a service with extended options
 */
#define JEZGRO_SERVICE_DEFINE_EX(name, _id, _entry, _stack, _memory, \
                                  _watchdog, _priority, _cleanup, \
                                  _state, _state_size) \
    \
    static uint8_t __attribute__((section(".service_stack." #name), \
                                  aligned(_stack))) \
        _##name##_stack[_stack]; \
    \
    static uint8_t __attribute__((section(".service_mem." #name), \
                                  aligned(32))) \
        _##name##_memory[_memory]; \
    \
    const jezgro_service_def_t name##_def = { \
        .name = #name, \
        .id = (_id), \
        .priority = (_priority), \
        .stack_size = (_stack), \
        .memory_size = (_memory), \
        .watchdog_ms = (_watchdog), \
        .entry = (_entry), \
        .cleanup = (_cleanup), \
        .saved_state = (_state), \
        .saved_state_size = (_state_size) \
    }

/**
 * @brief Register a service at startup
 */
#define JEZGRO_SERVICE_REGISTER(name) \
    jezgro_service_register(&name##_def)

/**
 * @brief External declaration for service
 */
#define JEZGRO_SERVICE_EXTERN(name) \
    extern const jezgro_service_def_t name##_def

/*============================================================================
 * SERVICE LOOP HELPERS
 *============================================================================*/

/**
 * @brief Standard service main loop
 *
 * Usage:
 *   void my_service_main(void) {
 *       // Init code here
 *       JEZGRO_SERVICE_LOOP(100) {  // 100ms timeout
 *           if (msg != NULL) {
 *               // Handle message
 *           }
 *           // Periodic work here
 *       }
 *   }
 */
#define JEZGRO_SERVICE_LOOP(timeout_ms) \
    jezgro_msg_t* msg = NULL; \
    for (;;) { \
        jezgro_watchdog_feed(); \
        jezgro_receive_timeout(JEZGRO_SVC_ANY, &msg, (timeout_ms)); \

#define JEZGRO_SERVICE_LOOP_END() \
        if (msg != NULL) { \
            jezgro_msg_free(msg); \
            msg = NULL; \
        } \
    }

/*============================================================================
 * SERVICE EXAMPLE
 *============================================================================*/

/*
 * Example service implementation:
 *
 * JEZGRO_SERVICE_DEFINE(my_service,
 *     JEZGRO_SVC_USER_BASE,    // Service ID
 *     my_service_main,          // Entry function
 *     2048,                     // Stack size
 *     8192,                     // Memory size
 *     500                       // Watchdog ms
 * );
 *
 * void my_service_main(void) {
 *     // Initialization
 *     my_init();
 *
 *     // Main loop
 *     JEZGRO_SERVICE_LOOP(100) {
 *         if (msg != NULL) {
 *             switch (msg->type) {
 *                 case MY_MSG_TYPE:
 *                     handle_my_message(msg);
 *                     break;
 *             }
 *         }
 *
 *         // Periodic work
 *         do_periodic_work();
 *     }
 *     JEZGRO_SERVICE_LOOP_END()
 * }
 *
 * // Register at startup
 * void app_init(void) {
 *     JEZGRO_SERVICE_REGISTER(my_service);
 * }
 */

#endif /* SERVICE_MACROS_H */
```

---

## 10. Build System

### 10.1 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.20)

# Prevent in-source builds
if(CMAKE_SOURCE_DIR STREQUAL CMAKE_BINARY_DIR)
    message(FATAL_ERROR "In-source builds not allowed. Use: cmake -B build")
endif()

#=============================================================================
# PROJECT CONFIGURATION
#=============================================================================

project(jezgro
    VERSION 1.0.0
    DESCRIPTION "JEZGRO Microkernel RTOS for Power Electronics"
    LANGUAGES C ASM
)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

#=============================================================================
# TOOLCHAIN SETUP
#=============================================================================

# ARM GCC Toolchain
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# Find ARM GCC
find_program(ARM_GCC arm-none-eabi-gcc)
if(NOT ARM_GCC)
    message(FATAL_ERROR "arm-none-eabi-gcc not found. Install ARM GCC toolchain.")
endif()

set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_ASM_COMPILER arm-none-eabi-gcc)
set(CMAKE_OBJCOPY arm-none-eabi-objcopy)
set(CMAKE_SIZE arm-none-eabi-size)

#=============================================================================
# MCU CONFIGURATION
#=============================================================================

set(MCU_FAMILY STM32G4)
set(MCU_MODEL STM32G474RETx)
set(MCU_CORE cortex-m4)
set(MCU_FPU fpv4-sp-d16)
set(MCU_FLOAT_ABI hard)

#=============================================================================
# COMPILER FLAGS
#=============================================================================

set(CPU_FLAGS "-mcpu=${MCU_CORE} -mthumb -mfpu=${MCU_FPU} -mfloat-abi=${MCU_FLOAT_ABI}")

set(CMAKE_C_FLAGS "${CPU_FLAGS} -ffunction-sections -fdata-sections -fno-common")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -Wextra -Werror")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -DSTM32G474xx -DUSE_HAL_DRIVER")

set(CMAKE_C_FLAGS_DEBUG "-O0 -g3 -DDEBUG")
set(CMAKE_C_FLAGS_RELEASE "-O2 -DNDEBUG")
set(CMAKE_C_FLAGS_MINSIZEREL "-Os -DNDEBUG")

set(CMAKE_ASM_FLAGS "${CPU_FLAGS} -x assembler-with-cpp")

#=============================================================================
# LINKER FLAGS
#=============================================================================

set(LINKER_SCRIPT ${CMAKE_SOURCE_DIR}/linker/STM32G474RETX_FLASH.ld)

set(CMAKE_EXE_LINKER_FLAGS "${CPU_FLAGS}")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -T${LINKER_SCRIPT}")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,--gc-sections")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,-Map=${PROJECT_NAME}.map")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} --specs=nano.specs --specs=nosys.specs")

#=============================================================================
# SOURCE FILES
#=============================================================================

# Kernel sources
set(KERNEL_SOURCES
    kernel/src/jezgro_kernel.c
    kernel/src/jezgro_scheduler.c
    kernel/src/jezgro_context.c
    kernel/src/jezgro_mpu.c
    kernel/src/jezgro_ipc.c
    kernel/src/jezgro_syscall.c
    kernel/src/jezgro_tick.c
    kernel/src/jezgro_fault.c
    kernel/port/cortex_m4/port_asm.s
    kernel/port/cortex_m4/port.c
    kernel/port/cortex_m4/port_mpu.c
)

# Reincarnation server
set(REINCARN_SOURCES
    reincarnation/src/reincarnation_server.c
    reincarnation/src/service_registry.c
)

# Drivers
set(DRIVER_SOURCES
    drivers/src/driver_llc.c
    drivers/src/driver_can.c
    drivers/src/driver_adc.c
    drivers/src/driver_hrtim.c
    drivers/src/driver_gpio.c
)

# Services
set(SERVICE_SOURCES
    services/framework/src/service_framework.c
    services/thermal_manager/thermal_manager.c
    services/swarm_coordinator/swarm_coordinator.c
    services/audit_logger/audit_logger.c
)

# HAL and startup
set(HAL_SOURCES
    hal/src/hal_wrapper.c
    startup/system_stm32g4xx.c
    startup/startup_stm32g474xx.s
)

#=============================================================================
# INCLUDE DIRECTORIES
#=============================================================================

include_directories(
    kernel/include
    reincarnation/include
    drivers/include
    services/framework/include
    services/thermal_manager
    services/swarm_coordinator
    services/audit_logger
    hal/include
    ${CMAKE_SOURCE_DIR}/Drivers/CMSIS/Include
    ${CMAKE_SOURCE_DIR}/Drivers/CMSIS/Device/ST/STM32G4xx/Include
    ${CMAKE_SOURCE_DIR}/Drivers/STM32G4xx_HAL_Driver/Inc
)

#=============================================================================
# BUILD TARGET
#=============================================================================

add_executable(${PROJECT_NAME}.elf
    ${KERNEL_SOURCES}
    ${REINCARN_SOURCES}
    ${DRIVER_SOURCES}
    ${SERVICE_SOURCES}
    ${HAL_SOURCES}
)

#=============================================================================
# POST-BUILD: Generate HEX and BIN
#=============================================================================

add_custom_command(TARGET ${PROJECT_NAME}.elf POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:${PROJECT_NAME}.elf>
            ${PROJECT_NAME}.hex
    COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${PROJECT_NAME}.elf>
            ${PROJECT_NAME}.bin
    COMMAND ${CMAKE_SIZE} --format=berkeley $<TARGET_FILE:${PROJECT_NAME}.elf>
    COMMENT "Generating HEX and BIN files, showing size"
)

#=============================================================================
# FLASH TARGET
#=============================================================================

add_custom_target(flash
    COMMAND openocd -f interface/stlink.cfg -f target/stm32g4x.cfg
            -c "program ${PROJECT_NAME}.elf verify reset exit"
    DEPENDS ${PROJECT_NAME}.elf
    COMMENT "Flashing ${PROJECT_NAME}.elf to target"
)

#=============================================================================
# DEBUG TARGET
#=============================================================================

add_custom_target(debug
    COMMAND openocd -f interface/stlink.cfg -f target/stm32g4x.cfg
    COMMENT "Starting OpenOCD debug server"
)

#=============================================================================
# TESTS
#=============================================================================

option(BUILD_TESTS "Build unit tests" OFF)

if(BUILD_TESTS)
    enable_testing()
    add_subdirectory(tests)
endif()
```

### 10.2 Linker Script Summary

```ld
/* STM32G474RETX_FLASH.ld - Key sections */

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K
    RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 128K
}

/* Critical memory regions for JEZGRO */
_kernel_ram_start = 0x20018000;   /* Kernel: 8KB at end */
_ipc_pool_start   = 0x20010000;   /* IPC: 32KB shared */
_service_ram_start = 0x20000000;  /* Services: 64KB */

SECTIONS
{
    .isr_vector : { KEEP(*(.isr_vector)) } > FLASH
    .kernel.text : { *(.kernel.text*) } > FLASH  /* Privileged code */
    .text : { *(.text*) } > FLASH
    .rodata : { *(.rodata*) } > FLASH

    /* Service code sections (MPU aligned) */
    .service.thermal : ALIGN(256) { *thermal_manager.o(.text*) } > FLASH
    .service.swarm   : ALIGN(256) { *swarm_coordinator.o(.text*) } > FLASH

    .data : { _sdata = .; *(.data*); _edata = .; } > RAM AT> FLASH
    .ipc_pool : ALIGN(64) { *(.ipc_pool) } > RAM
    .service_stacks : ALIGN(8) { *(.service_stack.*) } > RAM
    .service_mem : ALIGN(32) { *(.service_mem.*) } > RAM
    .bss : { _sbss = .; *(.bss*); _ebss = .; } > RAM
}
```

---

## 11. Directory Structure (Final)

```
jezgro/
├── CMakeLists.txt              # Build system
├── README.md                   # Project documentation
├── kernel/
│   ├── include/
│   │   ├── jezgro.h            # Main API
│   │   ├── jezgro_types.h      # Type definitions
│   │   ├── jezgro_err.h        # Error codes
│   │   ├── jezgro_mpu.h        # MPU manager
│   │   ├── jezgro_ipc.h        # IPC system
│   │   ├── jezgro_config.h     # Configuration
│   │   └── jezgro_port.h       # Port abstraction
│   ├── src/
│   │   ├── jezgro_kernel.c     # Kernel init
│   │   ├── jezgro_scheduler.c  # EDF scheduler
│   │   ├── jezgro_mpu.c        # MPU manager
│   │   ├── jezgro_ipc.c        # IPC implementation
│   │   ├── jezgro_syscall.c    # SVC handler
│   │   └── jezgro_fault.c      # Fault handlers
│   └── port/cortex_m4/
│       ├── port_asm.s          # PendSV handler
│       ├── port.c              # Port functions
│       └── port_mpu.c          # MPU hardware
├── reincarnation/
│   ├── include/
│   │   └── reincarnation.h     # RS API
│   └── src/
│       ├── reincarnation_server.c
│       └── service_registry.c
├── drivers/
│   ├── include/
│   │   ├── driver_llc.h
│   │   ├── driver_can.h
│   │   └── driver_adc.h
│   └── src/
│       ├── driver_llc.c
│       ├── driver_can.c
│       └── driver_adc.c
├── services/
│   ├── framework/
│   │   ├── include/
│   │   │   └── service_macros.h
│   │   └── src/
│   │       └── service_framework.c
│   ├── thermal_manager/
│   ├── swarm_coordinator/
│   └── audit_logger/
├── linker/
│   └── STM32G474RETX_FLASH.ld
├── startup/
│   ├── startup_stm32g474xx.s
│   └── system_stm32g4xx.c
└── hal/
    ├── include/
    │   └── hal_wrapper.h
    └── src/
        └── hal_wrapper.c
```

---

## 12. Fault Handling (Detailed)

### 12.1 Fault Taxonomy

```
+-------------------------------------------------------------+
|                  FAULT CLASSIFICATION                        |
+-------------------------------------------------------------+
|                                                              |
| Category   | Fault              | Severity | Detection       |
|------------|--------------------|---------:|-----------------|
| HW-POWER   | Over-current (OCP) | CRITICAL | Comparator ISR  |
| HW-POWER   | Over-voltage (OVP) | CRITICAL | Comparator ISR  |
| HW-POWER   | Under-voltage      | ERROR    | ADC monitoring  |
| HW-POWER   | Ground fault (GFI) | CRITICAL | GFI circuit     |
|------------|--------------------|---------:|-----------------|
| HW-THERMAL | Over-temperature   | CRITICAL | Comparator+ADC  |
| HW-THERMAL | Fan failure        | WARNING  | Tachometer      |
| HW-THERMAL | Thermal runaway    | CRITICAL | Rate of change  |
|------------|--------------------|---------:|-----------------|
| SW-MEMORY  | Stack overflow     | CRITICAL | MPU region 7    |
| SW-MEMORY  | MPU violation      | CRITICAL | MemManage ISR   |
| SW-MEMORY  | Pool exhausted     | ERROR    | Alloc failure   |
|------------|--------------------|---------:|-----------------|
| SW-EXEC    | Watchdog timeout   | CRITICAL | IWDG/WWDG       |
| SW-EXEC    | Invalid opcode     | CRITICAL | UsageFault      |
| SW-EXEC    | Divide by zero     | ERROR    | UsageFault      |
| SW-EXEC    | Hard fault         | CRITICAL | HardFault ISR   |
|------------|--------------------|---------:|-----------------|
| COMM       | CAN bus failure    | WARNING  | TX timeout      |
| COMM       | Swarm partition    | WARNING  | Heartbeat miss  |
| COMM       | Auth failure       | WARNING  | CMAC verify     |
+-------------------------------------------------------------+
```

### 12.2 Fault Handling Layers

```
Level 0: HARDWARE PROTECTION (Non-bypassable)
├── OCP: I > 4.0A  → Gate driver disable (<1µs)
├── OVP: V > 920V  → Gate driver disable (<1µs)
├── OTP: T > 105°C → Gate driver disable (<10ms)
└── Cannot be overridden by firmware

Level 1: KERNEL FAULT HANDLERS (ISR)
├── HardFault   → System halt
├── MemManage   → Service restart
├── BusFault    → Service restart
└── UsageFault  → Service restart

Level 2: REINCARNATION SERVER
├── Watchdog timeout → Service restart
├── Service crash    → Save state, restart
├── Max restarts exceeded → Disable, degraded mode
└── Power delivery continues (LLC in kernel)

Level 3: DEGRADED OPERATION
├── Disabled services don't auto-restart
├── Alert operator via CAN
└── Continue with reduced functionality
```

### 12.3 Fault Recovery Flow

```
Fault Detected ──► Is privileged task? ──YES──► SYSTEM HALT
                          │
                         NO
                          ▼
              restart_count < max?
                    │
            ┌───────┴───────┐
           YES              NO
            │               │
            ▼               ▼
      RESTART SERVICE   DISABLE SERVICE
      1. Save state     1. Mark disabled
      2. Clear memory   2. Log failure
      3. Restore state  3. CAN alert
      4. SERVICE_UP     4. Degraded mode
```

---

## 13. Driver Model

### 13.1 Driver Categories

| Type | Mode | Latency | Restartable | Examples |
|------|------|---------|-------------|----------|
| Privileged | Kernel | <10µs | No | LLC, ADC, CAN-FD, HRTIM |
| Unprivileged | User | >1ms | Yes | I2C Temp, EEPROM, LED |

### 13.2 Driver Interface

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

#define DRV_TYPE_POWER  0x01
#define DRV_TYPE_ADC    0x02
#define DRV_TYPE_CAN    0x04

#define DRV_FLAG_PRIVILEGED (1 << 0)
#define DRV_FLAG_RT         (1 << 1)
```

### 13.3 LLC Driver (400kHz Control Loop)

```c
__attribute__((section(".kernel.isr"), hot))
void HRTIM_TIMA_IRQHandler(void) {
    int32_t v_out = g_adc_buffer[ADC_CH_VOUT];
    int32_t i_out = g_adc_buffer[ADC_CH_IOUT];

    /* Voltage loop (100kHz) */
    static uint8_t div = 0;
    if (++div >= 4) {
        div = 0;
        int32_t v_err = g_llc.v_target - v_out;
        g_llc.v_integral += v_err;
        g_llc.i_setpoint = (KP_V * v_err + KI_V * g_llc.v_integral) >> 16;
    }

    /* Current loop (400kHz) */
    int32_t i_err = g_llc.i_setpoint - i_out;
    int32_t duty = (KP_I * i_err + KI_I * g_llc.i_integral) >> 16;
    HRTIM1->sTimerxRegs[HRTIM_TIMERINDEX_TIMER_A].CMP1xR = CLAMP(duty, DUTY_MIN, DUTY_MAX);
}
```

---

## 14. Boot and Initialization

### 14.1 Boot Sequence

```
PHASE 1: ROM BOOTLOADER
└── Jump to custom bootloader @ 0x08000000

PHASE 2: CUSTOM BOOTLOADER (16KB)
├── Verify kernel signature (Ed25519)
├── Check version counter (anti-rollback)
└── Jump to JEZGRO kernel

PHASE 3: KERNEL INIT
├── Set vector table (VTOR)
├── Initialize BSS, copy .data
├── Configure MPU static regions
├── Initialize IPC message pool
└── Start SysTick (1ms)

PHASE 4: DRIVER INIT
├── Safety Monitor (OCP/OVP/OTP)
├── ADC driver (DMA)
├── HRTIM driver (PWM)
├── LLC driver
└── CAN-FD driver

PHASE 5: SERVICE STARTUP
├── Safety Monitor   (1st - critical)
├── LLC Control      (2nd - power)
├── CAN Handler      (3rd - comm)
├── Thermal Manager  ─┐
├── Swarm Coordinator─┼─ (parallel)
└── Audit Logger     ─┘

PHASE 6: OPERATIONAL
├── Send HEARTBEAT on CAN
├── Join swarm (Raft election)
└── Normal operation
```

### 14.2 Service Dependency Graph

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

## 15. References

### 15.1 JEZGRO Product Family

This document describes JEZGRO-EK3, the charging module variant. JEZGRO runs across multiple device types in the Elektrokombinacija ecosystem:

| Document | Variant | Description |
|----------|---------|-------------|
| EK-TECH-021 | Overview | [JEZGRO Product Family](21-jezgro-product-family.md) - Unified kernel philosophy |
| EK-TECH-022 | JEZGRO-BAT | [Battery BMS Firmware](22-jezgro-bat.md) - Cell monitoring, balancing, SOC/SOH |
| EK-TECH-023 | JEZGRO-ROB | [Robot Controller Firmware](23-jezgro-rob.md) - Motion control, safety |
| EK-TECH-024 | JEZGRO-GW | [Gateway Firmware](24-jezgro-gw.md) - V2G, ISO 15118, OCPP |
| EK-TECH-025 | Adapters | [Adapter Devices](25-adapter-devices.md) - EK-ADAPT product line |
| EK-TECH-026 | Hardware | [Hardware Platforms](26-jezgro-hw-platforms.md) - PCB, MCU, connectors |

### 15.2 Related Technical Documents

| Document | Description |
|----------|-------------|
| EK-TECH-010 | Microkernel Architecture Concepts |
| EK-TECH-014 | Firmware Architecture (FreeRTOS reference) |
| EK-TECH-011 | Security Model |
| EK-TECH-005 | Swarm Intelligence |

### 15.3 External References

| Document | Description |
|----------|-------------|
| ARM DDI0403E | Cortex-M4 Technical Reference Manual |
| ARM DDI0439D | Cortex-M4 MPU Programming Guide |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Elektrokombinacija Engineering | Initial document |
| 1.1 | 2026-01-04 | Elektrokombinacija Engineering | Added MPU isolation, IPC protocol, EK3 integration |
| 1.2 | 2026-01-04 | Elektrokombinacija Engineering | Complete API reference, build system, linker script |
| 2.0 | 2026-01-04 | Elektrokombinacija Engineering | Added Fault Handling, Driver Model, Boot sections |
| 2.1 | 2026-01-04 | Elektrokombinacija Engineering | Added JEZGRO Product Family cross-references |
