# EK-RTOS: Microkernel Real-Time Operating System

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

### 1.1 What is EK-RTOS?

EK-RTOS is a microkernel real-time operating system specifically designed for power electronics applications. It brings the reliability principles of MINIX (fault isolation, message passing, automatic service restart) to resource-constrained microcontrollers.

### 1.2 Design Goals

| Goal | Target |
|------|--------|
| Fault isolation | MPU-based, no MMU required |
| Automatic recovery | Service restart < 50ms |
| Real-time | Interrupt latency < 1μs |
| Memory footprint | Kernel < 10KB |
| Target MCU | Cortex-M3/M4/M7 with MPU |

### 1.3 MINIX Inspiration

```
┌─────────────────────────────────────────────────────────────┐
│              MINIX → EK-RTOS Mapping                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MINIX Concept              EK-RTOS Implementation          │
│  ────────────────           ─────────────────────           │
│                                                             │
│  MMU isolation         →    MPU regions (no MMU needed)     │
│  User-space servers    →    Unprivileged service tasks      │
│  Message passing IPC   →    Zero-copy shared memory IPC     │
│  Reincarnation server  →    Watchdog + auto-restart         │
│  Minimal kernel        →    ~8KB kernel code                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture

### 2.1 System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     EK-RTOS ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYER 3: USER SERVICES (Unprivileged, MPU-isolated)        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Thermal │ │  Swarm  │ │  Audit  │ │  OCPP   │           │
│  │ Manager │ │  Coord  │ │  Logger │ │ Gateway │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       │           │           │           │                 │
│  ─────┴───────────┴───────────┴───────────┴────────────     │
│                    MESSAGE PASSING (IPC)                    │
│  ──────────────────────────────────────────────────────     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 2: KERNEL SERVICES                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              REINCARNATION SERVER                     │  │
│  │  • Per-service watchdog monitoring                    │  │
│  │  • Automatic fault detection                          │  │
│  │  • Service restart without system reset               │  │
│  │  • State preservation hooks                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 1: MICROKERNEL (Privileged, ~8KB)                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Scheduler │ │   MPU    │ │   IPC    │ │Interrupt │       │
│  │  (EDF)   │ │ Manager  │ │  Queues  │ │ Dispatch │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  LAYER 0: PRIVILEGED DRIVERS                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   LLC    │ │  CAN-FD  │ │   ADC    │ │   PWM    │       │
│  │ Control  │ │  Driver  │ │  Driver  │ │ (HRTIM)  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  HARDWARE: STM32G474 (Cortex-M4 + MPU)                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Privilege Levels

| Level | Name | Access | Examples |
|-------|------|--------|----------|
| 0 | Kernel | Full hardware | Scheduler, MPU, ISRs |
| 1 | Driver | Specific peripherals | LLC control, CAN-FD |
| 2 | Service | Own memory only | Thermal, Swarm, Audit |

### 2.3 Memory Map (128KB RAM)

```
0x20020000 ┌──────────────────────────────────┐
           │  Kernel Space            8 KB   │ ← Privileged
           ├──────────────────────────────────┤
           │  LLC Control Task       16 KB   │ ← MPU Region 0
           ├──────────────────────────────────┤
           │  Safety Monitor          8 KB   │ ← MPU Region 1
           ├──────────────────────────────────┤
           │  CAN Handler             8 KB   │ ← MPU Region 2
           ├──────────────────────────────────┤
           │  Thermal Manager         8 KB   │ ← MPU Region 3
           ├──────────────────────────────────┤
           │  Swarm Coordinator      16 KB   │ ← MPU Region 4
           ├──────────────────────────────────┤
           │  Audit Logger           16 KB   │ ← MPU Region 5
           ├──────────────────────────────────┤
           │  IPC Message Pool       32 KB   │ ← Shared
           ├──────────────────────────────────┤
           │  Stack Guards           16 KB   │ ← Protected
0x20000000 └──────────────────────────────────┘
```

---

## 3. Kernel Components

### 3.1 Scheduler

**Algorithm**: Earliest Deadline First (EDF) with priority fallback

```c
typedef struct {
    ek_task_id_t   id;
    ek_priority_t  priority;      // Static priority
    uint32_t       deadline;      // Absolute deadline (ticks)
    uint32_t       period;        // Task period
    ek_state_t     state;         // READY, RUNNING, BLOCKED, SUSPENDED
    void*          stack_ptr;     // Saved stack pointer
    mpu_region_t   mpu_config;    // MPU configuration
} ek_tcb_t;

// Scheduling decision
ek_task_id_t ek_schedule(void) {
    ek_task_id_t next = IDLE_TASK;
    uint32_t earliest = UINT32_MAX;

    for (int i = 0; i < NUM_TASKS; i++) {
        if (tcb[i].state == READY && tcb[i].deadline < earliest) {
            earliest = tcb[i].deadline;
            next = i;
        }
    }
    return next;
}
```

### 3.2 MPU Manager

**Cortex-M4 MPU**: 8 configurable regions

```c
typedef struct {
    void*    base;        // Region base address (aligned)
    size_t   size;        // Region size (power of 2)
    uint32_t attributes;  // AP, TEX, S, C, B, XN bits
} mpu_region_t;

void mpu_switch_context(ek_task_id_t task) {
    // Disable MPU during reconfiguration
    MPU->CTRL = 0;

    // Configure regions for this task
    for (int r = 0; r < task->num_regions; r++) {
        MPU->RNR  = r;
        MPU->RBAR = (uint32_t)task->regions[r].base | MPU_RBAR_VALID;
        MPU->RASR = compute_rasr(&task->regions[r]);
    }

    // Re-enable MPU with default background region disabled
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
    uint8_t  payload[48];   // Payload data
} __attribute__((aligned(64))) ek_msg_t;

// Synchronous send (blocks until received)
ek_err_t ek_send(ek_svc_id_t dst, ek_msg_t* msg) {
    msg->src = current_service;
    msg->dst = dst;
    msg->seq = next_seq++;
    msg->timestamp = ek_get_ticks();

    // Add to destination's receive queue
    queue_push(&recv_queue[dst], msg);

    // Wake destination if blocked
    if (svc_state[dst] == SVC_BLOCKED_RECV) {
        svc_state[dst] = SVC_READY;
    }

    // Block until acknowledged
    svc_state[current_service] = SVC_BLOCKED_SEND;
    ek_yield();

    return EK_OK;
}

// Synchronous receive (blocks until message available)
ek_err_t ek_receive(ek_svc_id_t src, ek_msg_t* msg) {
    while (queue_empty(&recv_queue[current_service])) {
        svc_state[current_service] = SVC_BLOCKED_RECV;
        ek_yield();
    }

    queue_pop(&recv_queue[current_service], msg);
    return EK_OK;
}
```

### 3.4 Reincarnation Server

**Inspired by MINIX's RS (Reincarnation Server)**

```c
typedef struct {
    ek_svc_id_t   id;
    ek_svc_state_t state;
    uint32_t      watchdog_deadline;
    uint32_t      restart_count;
    void*         init_func;
    void*         saved_state;
} ek_service_info_t;

void reincarnation_task(void) {
    while (1) {
        uint32_t now = ek_get_ticks();

        for (int i = 0; i < NUM_SERVICES; i++) {
            // Check watchdog timeout
            if (services[i].state == SVC_RUNNING &&
                now > services[i].watchdog_deadline) {

                handle_service_fault(i, FAULT_WATCHDOG);
            }

            // Check for MPU faults (set by fault handler)
            if (services[i].state == SVC_FAULTED) {
                handle_service_fault(i, FAULT_MPU);
            }
        }

        ek_sleep_ms(10);
    }
}

void handle_service_fault(ek_svc_id_t svc, fault_type_t fault) {
    // 1. Log the fault
    audit_log(EVENT_SERVICE_FAULT, svc, fault);

    // 2. Notify other services
    ek_msg_t msg = {
        .type = MSG_SERVICE_DOWN,
        .payload = { svc, fault }
    };
    ek_broadcast(&msg);

    // 3. Save service state if possible
    if (services[svc].saved_state != NULL) {
        save_service_state(svc);
    }

    // 4. Reset service memory region
    memset(services[svc].memory_base, 0, services[svc].memory_size);

    // 5. Restart service
    services[svc].restart_count++;
    service_init(svc);
    services[svc].state = SVC_RUNNING;
    services[svc].watchdog_deadline = ek_get_ticks() + WATCHDOG_TIMEOUT;

    // 6. Notify recovery complete
    msg.type = MSG_SERVICE_UP;
    ek_broadcast(&msg);

    // 7. Log recovery
    audit_log(EVENT_SERVICE_RECOVERED, svc, services[svc].restart_count);
}
```

---

## 4. Service Development

### 4.1 Service Template

```c
// Service definition
EK_SERVICE_DEFINE(thermal_manager,
    .priority = EK_PRIORITY_MEDIUM,
    .stack_size = 2048,
    .memory_size = 8192,
    .watchdog_ms = 500
);

// Service initialization
void thermal_manager_init(void) {
    // Initialize local state
    thermal_state.current_temp = 0;
    thermal_state.target_temp = 45;

    // Subscribe to messages
    ek_subscribe(MSG_TEMP_READING);
    ek_subscribe(MSG_THERMAL_QUERY);
}

// Service main loop
void thermal_manager_main(void) {
    ek_msg_t msg;

    while (1) {
        // Pet the watchdog
        ek_watchdog_feed();

        // Wait for message or timeout
        if (ek_receive_timeout(ANY, &msg, 100) == EK_OK) {
            switch (msg.type) {
                case MSG_TEMP_READING:
                    handle_temp_reading(&msg);
                    break;
                case MSG_THERMAL_QUERY:
                    handle_thermal_query(&msg);
                    break;
            }
        }

        // Periodic work
        check_thermal_limits();
    }
}
```

### 4.2 Message Types

| Type | Source | Destination | Description |
|------|--------|-------------|-------------|
| MSG_TEMP_READING | ADC Driver | Thermal | Temperature update |
| MSG_THERMAL_WARNING | Thermal | LLC, Swarm | Overtemp alert |
| MSG_POWER_LIMIT | Thermal | LLC | Request derating |
| MSG_MODULE_STATUS | Health | Swarm | Status report |
| MSG_SWAP_REQUEST | Swarm | Robot | Request module swap |
| MSG_SERVICE_DOWN | Reincarnation | All | Service failed |
| MSG_SERVICE_UP | Reincarnation | All | Service recovered |

### 4.3 Fault Handling

```c
// MPU fault handler (in kernel)
void MemManage_Handler(void) {
    ek_svc_id_t faulted = current_service;

    // Mark service as faulted (reincarnation server will handle)
    services[faulted].state = SVC_FAULTED;

    // Switch to safe context
    switch_to_kernel();

    // Trigger reincarnation check
    set_pending_irq(REINCARNATION_IRQ);
}

// Stack overflow detection
void check_stack_overflow(ek_svc_id_t svc) {
    uint32_t* stack_guard = services[svc].stack_base;
    if (*stack_guard != STACK_GUARD_PATTERN) {
        services[svc].state = SVC_FAULTED;
    }
}
```

---

## 5. Real-Time Guarantees

### 5.1 Timing Analysis

| Operation | Worst Case | Typical | Notes |
|-----------|------------|---------|-------|
| Interrupt latency | 500 ns | 200 ns | To first instruction |
| Context switch | 2 μs | 500 ns | Including MPU switch |
| IPC send (sync) | 5 μs | 1 μs | Zero-copy |
| IPC receive | 3 μs | 500 ns | If message waiting |
| Service restart | 50 ms | 10 ms | Full restart cycle |

### 5.2 Priority Levels

| Priority | Preemption | Example Tasks |
|----------|------------|---------------|
| 0 (Highest) | Non-preemptible | LLC control ISR |
| 1 | Preempts 2-7 | Safety monitor |
| 2 | Preempts 3-7 | CAN-FD handler |
| 3 | Preempts 4-7 | Thermal manager |
| 4 | Preempts 5-7 | Swarm coordinator |
| 5 | Preempts 6-7 | Audit logger |
| 6 | Preempts 7 | OCPP gateway |
| 7 (Lowest) | Never | Idle task |

### 5.3 LLC Control Path

```c
// LLC control runs as highest-priority ISR
// Guaranteed < 1μs response time

__attribute__((section(".kernel.isr")))
void HRTIM_TIMA_IRQHandler(void) {
    // Read ADC (DMA pre-loaded)
    int32_t i_actual = adc_buffer[0];
    int32_t v_actual = adc_buffer[1];

    // PID computation
    int32_t error = i_setpoint - i_actual;
    integral += error;
    int32_t derivative = error - last_error;
    int32_t duty = Kp * error + Ki * integral + Kd * derivative;

    // Clamp and apply
    duty = CLAMP(duty, DUTY_MIN, DUTY_MAX);
    HRTIM1->sTimerxRegs[0].CMP1xR = duty;

    last_error = error;
}
```

---

## 6. Comparison with Alternatives

| Feature | EK-RTOS | FreeRTOS | Zephyr | seL4 | MINIX 3 |
|---------|---------|----------|--------|------|---------|
| Kernel type | Microkernel | Monolithic | Hybrid | Microkernel | Microkernel |
| Fault isolation | MPU | Optional | MPU | MMU | MMU |
| Auto-restart | Yes | No | No | No | Yes |
| Hard real-time | Yes | Yes | Yes | No | No |
| Min RAM | 32 KB | 8 KB | 32 KB | 256 KB | 16 MB |
| MMU required | No | No | No | Yes | Yes |
| Power electronics | Designed for | Generic | Generic | No | No |

---

## 7. Implementation Status

### 7.1 Roadmap

| Phase | Component | Status | Target |
|-------|-----------|--------|--------|
| 1 | Kernel core | Planned | Q1 2026 |
| 1 | MPU manager | Planned | Q1 2026 |
| 1 | Basic scheduler | Planned | Q1 2026 |
| 2 | IPC system | Planned | Q2 2026 |
| 2 | Reincarnation server | Planned | Q2 2026 |
| 3 | LLC driver | Planned | Q2 2026 |
| 3 | CAN-FD driver | Planned | Q2 2026 |
| 4 | Service framework | Planned | Q3 2026 |
| 4 | Standard services | Planned | Q3 2026 |

### 7.2 Target Hardware

| MCU | Core | RAM | Flash | MPU | Status |
|-----|------|-----|-------|-----|--------|
| STM32G474 | Cortex-M4 | 128 KB | 512 KB | 8 regions | Primary |
| STM32H743 | Cortex-M7 | 1 MB | 2 MB | 16 regions | Future |
| NXP RT1062 | Cortex-M7 | 1 MB | - | 16 regions | Future |

---

## 8. References

- Tanenbaum, A.S. "Operating Systems: Design and Implementation" (MINIX)
- ARM. "Cortex-M4 Technical Reference Manual" (MPU)
- Heiser, G. "The seL4 Microkernel" (Formal verification concepts)
- Barry, R. "Mastering the FreeRTOS Real Time Kernel"

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Elektrokombinacija Engineering | Initial document |
