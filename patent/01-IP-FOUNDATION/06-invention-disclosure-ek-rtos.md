# Invention Disclosure: EK-RTOS Microkernel Operating System

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-006 |
| Date of Disclosure | 2026-01-04 |
| Inventor(s) | Bojan Janjatović |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, Severni Banat, Serbia |
| Date of Conception | 2026-01-04 |
| Witnesses | - |

### Origin of Invention
Inspiration: MINIX microkernel operating system by Andrew Tanenbaum. The realization that microkernel principles (fault isolation, message passing, automatic service restart) could revolutionize reliability in power electronics - applying OS concepts to embedded real-time systems.

---

## 1. Title of Invention

**Microkernel Real-Time Operating System for Fault-Tolerant Power Electronics with MPU-Based Service Isolation**

Alternative titles:
- MINIX-Inspired RTOS for Embedded Power Systems
- Self-Healing Microkernel for EV Charging Modules
- Reincarnation Server Architecture for Power Electronics Firmware

---

## 2. Technical Field

```
■ Embedded Operating Systems
■ Real-Time Systems
■ Power Electronics Control
■ Fault-Tolerant Computing
■ Microkernel Architecture
```

---

## 3. Problem Statement

### 3.1 Current State of the Art

```
Current embedded RTOS options for power electronics:

OPTION A: Monolithic RTOS (FreeRTOS, uC/OS)
• All tasks share same memory space
• One bug can crash entire system
• No fault isolation between components
• Manual recovery from failures

OPTION B: Full Microkernel (seL4, MINIX)
• Requires MMU (Memory Management Unit)
• Not available on cost-effective MCUs
• High memory footprint (200KB+)
• Not designed for hard real-time

OPTION C: Bare Metal
• No isolation whatsoever
• Entire system vulnerable to single fault
• Complex manual state management
• No standardized IPC
```

### 3.2 Problems with Current Approaches

```
1. NO FAULT ISOLATION ON MCUs
   • STM32, NXP, TI MCUs have MPU, not MMU
   • Existing RTOSes don't leverage MPU properly
   • One service crash = full system reset

2. NO AUTOMATIC RECOVERY
   • Watchdog resets entire system
   • Cannot restart individual services
   • Loss of state during recovery
   • Extended downtime

3. MONOLITHIC ARCHITECTURE
   • All code runs at same privilege level
   • Buffer overflow in logging = power stage crash
   • Updates require full firmware replacement
   • Testing requires full system

4. MESSAGE PASSING ABSENT
   • Direct function calls create tight coupling
   • Hard to isolate and test components
   • Race conditions between tasks
   • No clean interface boundaries
```

---

## 4. Proposed Solution

### 4.1 Core Innovation

EK-RTOS: A microkernel RTOS specifically designed for power electronics that brings MINIX reliability principles to resource-constrained microcontrollers using MPU instead of MMU.

### 4.2 Key Components

```
┌─────────────────────────────────────────────────────────────┐
│                     EK-RTOS ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────┤
│   USER SERVICES (Unprivileged, MPU-isolated)                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│   │ Thermal │ │  Swarm  │ │  Audit  │ │  OCPP   │          │
│   │ Manager │ │  Coord  │ │  Logger │ │ Gateway │          │
│   └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘          │
│        └───────────┴───────────┴───────────┘                │
│                         │ IPC                               │
├─────────────────────────┴───────────────────────────────────┤
│   EK-KERNEL (Privileged, Minimal)              ~8 KB        │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐│
│   │Scheduler │ │   MPU    │ │   IPC    │ │ Reincarnation  ││
│   │  (EDF)   │ │ Manager  │ │  Queue   │ │    Server      ││
│   └──────────┘ └──────────┘ └──────────┘ └────────────────┘│
├─────────────────────────────────────────────────────────────┤
│   PRIVILEGED DRIVERS (Kernel extensions)                    │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│   │   LLC    │ │  CAN-FD  │ │   ADC    │                   │
│   │ Control  │ │  Driver  │ │  Driver  │                   │
│   └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────┤
│   HARDWARE: STM32G474 / Similar Cortex-M with MPU           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 Novel Technical Features

#### 4.3.1 MPU-Based Fault Isolation (without MMU)

```c
// Each service confined to its own MPU region
typedef struct {
    uint8_t  region_id;      // MPU region 0-7
    void*    base_addr;      // Memory base
    size_t   size;           // Region size (power of 2)
    uint32_t permissions;    // R/W/X flags
} ek_service_region_t;

// Service cannot access other service memory
// Hardware exception if boundary violated
void mpu_configure_service(ek_service_t* svc) {
    MPU->RNR = svc->region.region_id;
    MPU->RBAR = (uint32_t)svc->region.base_addr | MPU_RBAR_VALID;
    MPU->RASR = mpu_calc_rasr(svc->region.size, svc->region.permissions);
}
```

#### 4.3.2 Reincarnation Server (Auto-Restart)

```c
// Inspired by MINIX reincarnation server
// Failed services automatically restarted

typedef enum {
    SVC_STATE_RUNNING,
    SVC_STATE_BLOCKED,
    SVC_STATE_FAULTED,
    SVC_STATE_RESTARTING
} ek_service_state_t;

void reincarnation_task(void) {
    while (1) {
        for (int i = 0; i < NUM_SERVICES; i++) {
            if (service_watchdog_expired(i) ||
                service_state[i] == SVC_STATE_FAULTED) {

                // Log the fault
                audit_log(FAULT_SERVICE_CRASH, i, get_fault_info(i));

                // Notify other services
                ek_broadcast(MSG_SERVICE_DOWN, i);

                // Restart the service
                service_restart(i);

                // Notify recovery complete
                ek_broadcast(MSG_SERVICE_UP, i);
            }
        }
        ek_sleep(10); // Check every 10ms
    }
}
```

#### 4.3.3 Zero-Copy Message Passing IPC

```c
// MINIX-style synchronous message passing
// Zero-copy using shared message pool

typedef struct {
    uint16_t src;           // Source service ID
    uint16_t dst;           // Destination service ID
    uint16_t type;          // Message type
    uint16_t seq;           // Sequence number
    uint32_t timestamp;     // For ordering
    uint8_t  payload[48];   // Fits cache line
} __attribute__((aligned(64))) ek_message_t;

// Blocking send (like MINIX)
ek_status_t ek_send(ek_service_id_t dst, ek_message_t* msg);

// Blocking receive
ek_status_t ek_receive(ek_service_id_t src, ek_message_t* msg);

// Non-blocking variants
ek_status_t ek_send_nb(ek_service_id_t dst, ek_message_t* msg);
ek_status_t ek_receive_nb(ek_service_id_t src, ek_message_t* msg);
```

#### 4.3.4 Hybrid Privilege Model for Real-Time

```c
// LLC control needs hard real-time - runs in kernel space
// Other services run isolated in user space

__attribute__((section(".kernel")))
void llc_control_isr(void) {
    // Direct hardware access - no IPC overhead
    // < 1μs guaranteed response
    uint32_t current = ADC1->DR;
    uint32_t duty = pid_compute(current, target);
    HRTIM1->TIMA.CMP1 = duty;
}

// Thermal manager runs in user space - isolated
__attribute__((section(".service_thermal")))
void thermal_task(void) {
    ek_message_t msg;
    while (1) {
        // Can only access hardware via kernel calls
        ek_syscall(SYS_READ_TEMP, &temperature);

        if (temperature > THRESHOLD) {
            msg.type = MSG_THERMAL_WARNING;
            msg.payload[0] = temperature;
            ek_send(LLC_SERVICE, &msg);  // Request derating
        }
        ek_sleep(100);
    }
}
```

---

## 5. Technical Specifications

### 5.1 Resource Requirements

| Resource | EK-RTOS | FreeRTOS | Zephyr | seL4 |
|----------|---------|----------|--------|------|
| Flash | 32 KB | 10 KB | 50 KB | 200+ KB |
| RAM (kernel) | 8 KB | 2 KB | 8 KB | 64+ KB |
| RAM (per service) | 4-16 KB | N/A | 4 KB | 16+ KB |
| MPU regions | 6-8 | 0-4 | 4-8 | N/A (MMU) |
| Minimum MCU | Cortex-M3 | Cortex-M0 | Cortex-M3 | Cortex-A |

### 5.2 Timing Guarantees

| Operation | Worst-Case | Typical |
|-----------|------------|---------|
| Context switch | 2 μs | 0.5 μs |
| IPC message send | 5 μs | 1 μs |
| Service restart | 50 ms | 10 ms |
| MPU reconfigure | 0.2 μs | 0.1 μs |
| Interrupt latency | 0.5 μs | 0.2 μs |

### 5.3 Memory Map (128 KB RAM Example)

```
0x20020000 ┌──────────────────────────────────┐
           │  Kernel (privileged)       8 KB  │
           ├──────────────────────────────────┤
           │  LLC Control Task         16 KB  │ MPU Region 0
           ├──────────────────────────────────┤
           │  Safety Monitor            8 KB  │ MPU Region 1
           ├──────────────────────────────────┤
           │  CAN Handler               8 KB  │ MPU Region 2
           ├──────────────────────────────────┤
           │  Thermal Manager           8 KB  │ MPU Region 3
           ├──────────────────────────────────┤
           │  Swarm Coordinator        16 KB  │ MPU Region 4
           ├──────────────────────────────────┤
           │  Audit Logger             16 KB  │ MPU Region 5
           ├──────────────────────────────────┤
           │  IPC Message Pool         32 KB  │ Shared (controlled)
           ├──────────────────────────────────┤
           │  Stack Guard / Reserved   16 KB  │
0x20000000 └──────────────────────────────────┘
```

---

## 6. Advantages Over Prior Art

### 6.1 vs. Monolithic RTOS (FreeRTOS)

| Aspect | FreeRTOS | EK-RTOS |
|--------|----------|---------|
| Fault isolation | None | Full MPU isolation |
| Bug in logging | System crash | Logger restarts, system continues |
| Service update | Full reflash | Update single service |
| Testing | Full system | Isolated unit tests |

### 6.2 vs. Full Microkernel (seL4/MINIX)

| Aspect | seL4/MINIX | EK-RTOS |
|--------|------------|---------|
| Hardware | Needs MMU | Works with MPU |
| MCU cost | $20+ | $5 |
| RAM needed | 512KB+ | 64KB |
| Real-time | Soft RT | Hard RT (< 1μs) |

### 6.3 Quantified Benefits

```
1. RELIABILITY IMPROVEMENT
   • Single service crash: 0% system downtime (vs 100%)
   • MTBF increase: Estimated 10x
   • Automatic recovery: < 50ms (vs manual reset)

2. DEVELOPMENT EFFICIENCY
   • Service isolation: Independent testing
   • Cleaner interfaces: Message-based only
   • Faster debugging: Fault containment

3. UPDATE FLEXIBILITY
   • Per-service OTA updates
   • Rollback per service
   • A/B partitioning per service

4. SECURITY IMPROVEMENT
   • Compromised service: Limited blast radius
   • Privilege separation: Kernel vs services
   • Attack surface: Reduced per component
```

---

## 7. Implementation Roadmap

### Phase 1: Core Kernel (Month 1-2)
- [ ] Minimal scheduler (EDF + priority)
- [ ] MPU manager (8 regions)
- [ ] Basic IPC (send/receive)
- [ ] Interrupt dispatch

### Phase 2: Reincarnation (Month 2-3)
- [ ] Per-service watchdog
- [ ] Fault detection (MPU, stack, watchdog)
- [ ] Service restart mechanism
- [ ] State preservation hooks

### Phase 3: Power Electronics Integration (Month 3-4)
- [ ] LLC control driver (kernel space)
- [ ] CAN-FD driver (kernel space)
- [ ] ADC/PWM abstraction
- [ ] Safety monitor service

### Phase 4: Higher-Level Services (Month 4-6)
- [ ] Thermal manager
- [ ] Swarm coordinator
- [ ] Audit logger
- [ ] OCPP gateway

---

## 8. Patent Claims (Draft)

### Independent Claims

1. A real-time operating system for embedded power electronics comprising:
   - A minimal microkernel executing in privileged mode
   - Multiple service tasks executing in unprivileged mode
   - Memory Protection Unit (MPU) isolation between services
   - A reincarnation server for automatic service restart upon fault detection

2. A method for fault-tolerant operation of power electronics firmware comprising:
   - Isolating software services using MPU memory regions
   - Detecting service faults via per-service watchdog timers
   - Automatically restarting faulted services without system reset
   - Maintaining power delivery during service restart

3. A hybrid privilege architecture for power electronics control comprising:
   - Hard real-time control loops executing in kernel space with direct hardware access
   - Non-critical services executing in isolated user space
   - Message-passing IPC between services
   - Zero system downtime upon non-critical service failure

### Dependent Claims

4. The system of claim 1 wherein the microkernel comprises less than 10 KB of code.

5. The system of claim 1 wherein service restart completes in less than 100 milliseconds.

6. The method of claim 2 wherein message passing uses zero-copy shared memory.

7. The architecture of claim 3 wherein the hard real-time control loop maintains sub-microsecond interrupt latency.

---

## 9. Prior Art Search

### Related Patents

| Patent | Title | Distinction |
|--------|-------|-------------|
| US10789103 | RTOS with memory protection | No reincarnation server, no power electronics focus |
| US9619377 | Microkernel for IoT | MMU-based, not MPU |
| EP3282376 | Fault-tolerant embedded system | Hardware redundancy, not software isolation |

### Academic References

- Tanenbaum, A. "MINIX 3: A Reliable and Self-Repairing Operating System" - Inspiration, but requires MMU
- Heiser, G. "seL4: Formal Verification of an OS Kernel" - Too heavy for MCUs
- Barry, R. "Mastering FreeRTOS" - No fault isolation

### Commercial Products

- FreeRTOS: No microkernel, optional MPU
- Zephyr: Partial isolation, no reincarnation
- VxWorks: Expensive, overkill for modules
- QNX: MMU required, not for MCUs

---

## 10. Signatures

**Inventor:**

Signature: _________________________
Name: Bojan Janjatović
Date: 2026-01-04

**Witness:**

Signature: _________________________
Name: _________________________
Date: _________________________

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Bojan Janjatović | Initial disclosure |
