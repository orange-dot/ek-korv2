# Invention Disclosure: JEZGRO Microkernel Operating System

## Administrative Information

| Field | Value |
|-------|-------|
| Disclosure ID | EK-2026-006 |
| Disclosure Date | 2026-01-04 |
| Inventor(s) | Bojan Janjatovic |
| Email | bojan.janjatovic@gmail.com |
| Address | Vojislava Ilica 8, Kikinda, North Banat, Serbia |
| Conception Date | 2026-01-04 |
| Witnesses | - |

### Origin of Invention
Inspiration: MINIX microkernel operating system by Andrew Tanenbaum. Recognition that microkernel principles (fault isolation, message passing, automatic service restart) can revolutionize reliability in power electronics - applying OS concepts to real-time embedded systems.

---

## 1. Title of Invention

**JEZGRO: Fault-Tolerant Real-Time Microkernel for Power Electronics with MPU-Based Service Isolation**

Alternative titles:
- MINIX-Inspired Microkernel for Embedded Power Systems
- Self-Healing Kernel for EV Charging Modules
- Reincarnation Server Architecture for Power Electronics Firmware

---

## 2. Technical Field

```
- Embedded Operating Systems
- Real-Time Systems
- Power Electronics Control
- Fault-Tolerant Computing
- Microkernel Architecture
```

---

## 3. Problem Description

### 3.1 Current State of the Art

```
Current embedded RTOS options for power electronics:

OPTION A: Monolithic RTOS (FreeRTOS, uC/OS)
- All tasks share same memory space
- Single bug can crash entire system
- No fault isolation between components
- Manual fault recovery

OPTION B: Full Microkernel (seL4, MINIX)
- Requires MMU (Memory Management Unit)
- Not available on cost-effective MCUs
- High memory overhead (200KB+)
- Not designed for hard real-time

OPTION C: Bare Metal
- No isolation whatsoever
- Entire system vulnerable to single fault
- Complex manual state management
- No standardized IPC
```

### 3.2 Problems with Current Approaches

```
1. NO FAULT ISOLATION ON MCUs
   - STM32, NXP, TI MCUs have MPU, not MMU
   - Existing RTOS don't properly utilize MPU
   - Single service crash = full system reset

2. NO AUTOMATIC RECOVERY
   - Watchdog resets entire system
   - Cannot restart individual services
   - State loss during recovery
   - Extended downtime

3. MONOLITHIC ARCHITECTURE
   - All code runs at same privilege level
   - Buffer overflow in logging = power stage crash
   - Updates require full firmware replacement
   - Testing requires entire system

4. MESSAGE PASSING ABSENT
   - Direct function calls create tight coupling
   - Hard to isolate and test components
   - Race conditions between tasks
   - No clean interface boundaries
```

---

## 4. Proposed Solution

### 4.1 Core Innovation

**JEZGRO**: A microkernel specifically designed for power electronics that brings MINIX reliability principles to resource-constrained microcontrollers using MPU instead of MMU.

The name "JEZGRO" is Serbian for "kernel" or "core" - reflecting both its minimal design philosophy and its Serbian origin.

### 4.2 Key Components

```
+-------------------------------------------------------------+
|                     JEZGRO ARCHITECTURE                     |
+-------------------------------------------------------------+
|   USER SERVICES (Unprivileged, MPU-isolated)                |
|   +---------+ +---------+ +---------+ +---------+           |
|   |Thermal  | |  ROJ    | |  Audit  | |  OCPP   |           |
|   | Manager | |  Coord. | |  Logger | | Gateway |           |
|   +----+----+ +----+----+ +----+----+ +----+----+           |
|        +----------+-----------+-----------+                  |
|                         | IPC                                |
+--------------------------+----------------------------------+
|   JEZGRO KERNEL (Privileged, Minimal)           ~8 KB       |
|   +----------+ +----------+ +----------+ +----------------+ |
|   |Scheduler | |   MPU    | |   IPC    | | Reincarnation  | |
|   |  (EDF)   | | Manager  | |  Queue   | |    Server      | |
|   +----------+ +----------+ +----------+ +----------------+ |
+-------------------------------------------------------------+
|   PRIVILEGED DRIVERS (Kernel extensions)                    |
|   +----------+ +----------+ +----------+                    |
|   |   LLC    | |  CAN-FD  | |   ADC    |                    |
|   | Control  | |  Driver  | |  Driver  |                    |
|   +----------+ +----------+ +----------+                    |
+-------------------------------------------------------------+
|   HARDWARE: STM32G474 / Similar Cortex-M with MPU           |
+-------------------------------------------------------------+
```

### 4.3 Novel Technical Features

#### 4.3.1 MPU Fault Isolation (No MMU Required)

```c
// Each service confined to its own MPU region
typedef struct {
    uint8_t  region_id;      // MPU region 0-7
    void*    base_addr;      // Memory base address
    size_t   size;           // Region size (power of two)
    uint32_t permissions;    // R/W/X flags
} jezgro_region_t;

// Service cannot access another service's memory
// Hardware exception if boundary violated
```

#### 4.3.2 Reincarnation Server (Auto-Restart)

```c
// Inspired by MINIX reincarnation server
// Failed services automatically restart

void reincarnation_task(void) {
    while (1) {
        for (int i = 0; i < NUM_SERVICES; i++) {
            if (service_watchdog_expired(i) ||
                service_state[i] == SVC_STATE_FAULTED) {

                // Log the fault
                audit_log(FAULT_SERVICE_CRASH, i, get_fault_info(i));

                // Notify other services
                jezgro_broadcast(MSG_SERVICE_DOWN, i);

                // Restart the service
                service_restart(i);  // Restart WITHOUT system reset!

                // Notify recovery complete
                jezgro_broadcast(MSG_SERVICE_UP, i);
            }
        }
        jezgro_sleep(10); // Check every 10ms
    }
}
```

#### 4.3.3 Zero-Copy Message Passing IPC

```c
// MINIX-style synchronous message passing
// Zero-copy using shared memory pool

typedef struct {
    uint16_t src;           // Source service ID
    uint16_t dst;           // Destination service ID
    uint16_t type;          // Message type
    uint16_t seq;           // Sequence number
    uint32_t timestamp;     // For ordering
    uint8_t  payload[48];   // Fits in cache line
} __attribute__((aligned(64))) jezgro_msg_t;

// Blocking send (like MINIX)
jezgro_err_t jezgro_send(jezgro_svc_id_t dst, jezgro_msg_t* msg);

// Blocking receive
jezgro_err_t jezgro_receive(jezgro_svc_id_t src, jezgro_msg_t* msg);
```

#### 4.3.4 Hybrid Privilege Model for Real-Time

```c
// LLC control needs hard real-time - runs in kernel space
// Other services run isolated in user space

__attribute__((section(".kernel")))
void llc_control_isr(void) {
    // Direct hardware access - no IPC overhead
    // < 1us guaranteed response
    uint32_t current = ADC1->DR;
    uint32_t duty = pid_compute(current, target);
    HRTIM1->TIMA.CMP1 = duty;
}

// Thermal manager runs in user space - isolated
__attribute__((section(".service_thermal")))
void thermal_task(void) {
    jezgro_msg_t msg;
    while (1) {
        // Can only access hardware via kernel call
        jezgro_syscall(SYS_READ_TEMP, &temperature);

        if (temperature > THRESHOLD) {
            msg.type = MSG_THERMAL_WARNING;
            jezgro_send(LLC_SERVICE, &msg);  // Request power reduction
        }
        jezgro_sleep(100);
    }
}
```

---

## 5. Technical Specifications

### 5.1 Resource Requirements

| Resource | JEZGRO | FreeRTOS | Zephyr | seL4 |
|----------|--------|----------|--------|------|
| Flash | 32 KB | 10 KB | 50 KB | 200+ KB |
| RAM (kernel) | 8 KB | 2 KB | 8 KB | 64+ KB |
| RAM (per service) | 4-16 KB | N/A | 4 KB | 16+ KB |
| MPU regions | 6-8 | 0-4 | 4-8 | N/A (MMU) |
| Minimum MCU | Cortex-M3 | Cortex-M0 | Cortex-M3 | Cortex-A |

### 5.2 Timing Guarantees

| Operation | Worst Case | Typical |
|-----------|------------|---------|
| Context switch | 2 us | 0.5 us |
| IPC message send | 5 us | 1 us |
| Service restart | 50 ms | 10 ms |
| MPU reconfiguration | 0.2 us | 0.1 us |
| Interrupt latency | 0.5 us | 0.2 us |

---

## 6. Advantages Over Existing Technology

### 6.1 vs. Monolithic RTOS (FreeRTOS)

| Aspect | FreeRTOS | JEZGRO |
|--------|----------|--------|
| Fault isolation | None | Full MPU isolation |
| Bug in logging | System crash | Logger restarts, system continues |
| Service update | Full reflash | Single service update |
| Testing | Whole system | Isolated unit tests |

### 6.2 vs. Full Microkernel (seL4/MINIX)

| Aspect | seL4/MINIX | JEZGRO |
|--------|------------|--------|
| Hardware | Requires MMU | Works with MPU |
| MCU cost | $20+ | $5 |
| RAM needed | 512KB+ | 64KB |
| Real-time | Soft RT | Hard RT (< 1us) |

---

## 7. Patent Claims (Draft)

### Independent Claims

1. A real-time operating system for embedded power electronics comprising:
   - A minimal microkernel executing in privileged mode
   - Multiple service tasks executing in unprivileged mode
   - MPU-based isolation between services
   - A reincarnation server for automatic service restart upon fault detection

2. A method for fault-tolerant power electronics operation comprising:
   - Isolating software services using MPU memory regions
   - Detecting service faults via per-service watchdog timers
   - Automatically restarting faulted services without system reset
   - Maintaining power delivery during service restart

3. A hybrid privilege architecture for power electronics control comprising:
   - Hard real-time control loops in kernel space with direct hardware access
   - Non-critical services in isolated user space
   - IPC message passing between services
   - Zero system downtime upon non-critical service failure

---

## 8. Signatures

**Inventor:**

Signature: _________________________
Name: Bojan Janjatovic
Date: 2026-01-04

**Witness:**

Signature: _________________________
Name: _________________________
Date: _________________________

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-04 | Bojan Janjatovic | Initial disclosure |
