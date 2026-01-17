# JEZGRO Research Synthesis

Applied research from bleeding-edge OS/RTOS paradigms for the JEZGRO microkernel.

**Target platform:** STM32G474 (128KB SRAM, 512KB Flash, Cortex-M4F @ 170MHz)

---

## 1. Verified RTOS Design Principles

### 1.1 seL4 Lessons Learned

The seL4 microkernel represents the gold standard for verified kernels:

| Metric | seL4 Value | JEZGRO Target |
|--------|-----------|---------------|
| Code size | 8,700 LOC (C) | <5,000 LOC |
| Verification effort | 20 person-years | Partial (critical paths) |
| TCB | ~10,000 LOC | <8,000 LOC |
| IPC latency | ~1000 cycles | <500 cycles |

**Key design principles applicable to JEZGRO:**

1. **Minimal Trusted Computing Base (TCB)**
   - Everything outside kernel = untrusted
   - Device drivers in user space when possible
   - Kernel provides only: scheduling, IPC, memory management

2. **Capability-Based Access Control**
   - No ambient authority - all access through capabilities
   - Unforgeable references to kernel objects
   - Simplified reasoning about security

3. **Formal Verification Approach**
   ```
   seL4 Stack:
   ┌─────────────────────────────────────────┐
   │  Abstract specification (Isabelle/HOL) │
   ├─────────────────────────────────────────┤
   │  Executable specification (Haskell)    │
   ├─────────────────────────────────────────┤
   │  C implementation                       │
   ├─────────────────────────────────────────┤
   │  Binary (ARM, RISC-V, x86)             │
   └─────────────────────────────────────────┘

   Each layer proven to refine the one above.
   ```

### 1.2 RT-CertiKOS Real-Time Verification

Yale's CertiKOS extends seL4 concepts with real-time guarantees:

- **Verified concurrent kernel** with fine-grained locking
- **Certified schedulability analysis** - prove deadline guarantees mathematically
- **Compositional verification** - verify components independently

**Applicable to JEZGRO:**
- Formal proof of EDF schedulability
- Verified WCET bounds for kernel operations
- Priority inheritance correctness proofs

### 1.3 Minimal TCB Design for Power Electronics

```
JEZGRO TCB (Target <8KB code):
┌────────────────────────────────────────────────────────────────┐
│  KERNEL (privileged mode)                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │  Scheduler   │ │  IPC         │ │  Memory      │           │
│  │  (EDF)       │ │  (sync/async)│ │  (MPU config)│           │
│  │  ~800 LOC    │ │  ~600 LOC    │ │  ~400 LOC    │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│  ┌──────────────┐ ┌──────────────┐                            │
│  │  Timer/Tick  │ │  Exception   │                            │
│  │  ~200 LOC    │ │  Handler     │                            │
│  └──────────────┘ │  ~300 LOC    │                            │
│                   └──────────────┘                            │
├────────────────────────────────────────────────────────────────┤
│  SERVICES (unprivileged mode)                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ CAN-FD Svc  │ │ PWM Svc     │ │ ADC Svc     │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ ROJ Coord   │ │ Thermal Svc │ │ Safety Mon  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Scheduling Excellence

### 2.1 EDF Enhancements

JEZGRO already implements EDF. Research suggests these enhancements:

**2.1.1 Earliest Deadline First with Slack Stealing**

```c
// Slack stealing for aperiodic tasks
typedef struct {
    tick_t accumulated_slack;  // Available slack time
    tick_t deadline;
    bool   is_periodic;
} edf_task_ext_t;

// Slack computation (constant time with lazy update)
tick_t compute_slack(task_t *task) {
    tick_t now = jezgro_get_ticks();
    tick_t laxity = task->deadline - now - task->remaining_wcet;
    return max(0, laxity);
}
```

**2.1.2 Deadline Miss Handling**

```
DEADLINE MISS POLICY OPTIONS:
────────────────────────────

1. SKIP: Drop current instance, wait for next period
   - Use for: Sensor sampling (stale data useless)

2. COMPLETE: Finish even if late
   - Use for: CAN message transmission

3. ESCALATE: Raise priority temporarily
   - Use for: Safety-critical computations

4. RESTART: Terminate and restart task
   - Use for: Stateless computations
```

### 2.2 Mixed-Criticality Scheduling

For systems with different safety levels (ISO 26262, DO-178C):

```
MIXED-CRITICALITY LEVELS:
─────────────────────────

┌────────────────────────────────────────────────────────────┐
│ Level │ WCET     │ Deadline │ Example Task               │
├────────────────────────────────────────────────────────────┤
│ HI    │ WCET_HI  │ Strict   │ Overcurrent protection    │
│ LO    │ WCET_LO  │ Soft     │ Temperature logging       │
└────────────────────────────────────────────────────────────┘

Mode switch triggered when:
- HI task exceeds WCET_LO estimate
- System enters degraded mode
- Safety monitor requests

In HI mode:
- LO tasks suspended or reduced rate
- HI tasks get full WCET_HI budget
- System guarantees HI task deadlines
```

**Vestal's Model (RTSS 2007):**
```c
// Per-task: two WCET values
typedef struct {
    tick_t wcet_lo;  // Normal case WCET
    tick_t wcet_hi;  // Worst-case WCET (certified)
    uint8_t criticality;  // HI or LO
} mc_task_t;

// Mode switch: when HI task uses > wcet_lo
void on_budget_overrun(task_t *task) {
    if (task->criticality == CRITICALITY_HI) {
        system_mode = MODE_HI;
        suspend_lo_tasks();
    }
}
```

### 2.3 WCET Analysis

**Static WCET Analysis Tools:**
- **aiT** (AbsInt) - commercial, ARM support
- **OTAWA** - open source, academic
- **Bound-T** - discontinued but concepts useful

**Measurement-Based WCET:**
```c
// Instrumentation for WCET measurement
#define WCET_START(task_id) \
    uint32_t __wcet_start = DWT->CYCCNT

#define WCET_END(task_id) \
    do { \
        uint32_t __wcet_end = DWT->CYCCNT; \
        uint32_t __cycles = __wcet_end - __wcet_start; \
        wcet_update(task_id, __cycles); \
    } while(0)

// Track observed maximum
void wcet_update(task_id_t id, uint32_t cycles) {
    if (cycles > tasks[id].observed_wcet) {
        tasks[id].observed_wcet = cycles;
    }
    // Add safety margin (typically 20-50%)
    tasks[id].wcet = tasks[id].observed_wcet * WCET_MARGIN;
}
```

---

## 3. IPC & Memory Design

### 3.1 Zero-Copy IPC Patterns

**seL4 Device Driver Framework (sDDF) approach:**

```
ZERO-COPY IPC with SPSC Queues:
──────────────────────────────

Producer                    Consumer
   │                           │
   │  ┌─────────────────────┐  │
   │  │ RING BUFFER (shared)│  │
   │  │ ┌───┬───┬───┬───┐   │  │
   └──│►│ 0 │ 1 │ 2 │ 3 │◄──│──┘
      │ └───┴───┴───┴───┘   │
      │   ▲           ▲     │
      │   │           │     │
      │  head        tail   │
      └─────────────────────┘

- No data copy, only index updates
- Cache-aligned for DMA
- Memory barriers for coherency
```

**Implementation for CAN-FD:**
```c
// Zero-copy CAN buffer
typedef struct {
    volatile uint16_t head;  // Producer writes
    volatile uint16_t tail;  // Consumer writes
    uint16_t mask;           // Size - 1 (power of 2)
    uint8_t _pad[2];
    can_frame_t frames[];    // Inline data
} __attribute__((aligned(32))) can_ring_t;

// Producer (ISR)
bool can_ring_push(can_ring_t *ring, const can_frame_t *frame) {
    uint16_t head = ring->head;
    uint16_t next = (head + 1) & ring->mask;

    if (next == ring->tail) return false;  // Full

    ring->frames[head] = *frame;  // Single copy
    __DMB();  // Memory barrier
    ring->head = next;
    return true;
}
```

### 3.2 Memory Safety Options

**3.2.1 MPU-Based Isolation (Current Approach)**

STM32G474 has 8 MPU regions:
```
MPU REGION ALLOCATION:
──────────────────────

Region 0: Kernel code (RO, XN=0)
Region 1: Kernel data (RW, XN=1)
Region 2: Task 1 stack (RW, XN=1)
Region 3: Task 2 stack (RW, XN=1)
Region 4: Shared memory (RW, XN=1)
Region 5: Peripherals (RW, XN=1, Device)
Region 6: Flash (RO, XN=0)
Region 7: Reserved/configurable
```

**3.2.2 Rust Integration Path (Future)**

Rust RTOS examples to study:
- **Tock OS** - 10M+ devices, Capsule isolation
- **Hubris** - Oxide Computer, root-of-trust
- **RTIC** - Hardware-accelerated concurrency

```rust
// RTIC example for STM32
#[rtic::app(device = stm32g4xx_hal::pac)]
mod app {
    #[shared]
    struct Shared {
        power_setpoint: f32,
    }

    #[local]
    struct Local {
        adc: Adc<ADC1>,
    }

    #[task(shared = [power_setpoint], priority = 2)]
    fn control_loop(cx: control_loop::Context) {
        let mut power = cx.shared.power_setpoint;
        power.lock(|p| {
            // Compiler-enforced mutual exclusion
            *p = compute_new_setpoint();
        });
    }
}
```

**3.2.3 CHERIoT for Embedded (Future Hardware)**

Microsoft's CHERIoT provides hardware memory safety:
- 64-bit capabilities (32-bit address + 32-bit metadata)
- Bounds checking on every memory access
- Temporal safety (use-after-free detection)
- Available: SCI Semiconductor ICENI (2025+)

### 3.3 TinyML Integration for JEZGRO

**TensorFlow Lite for Microcontrollers:**
```
TFLM FOOTPRINT:
───────────────

Core runtime:     16 KB (ARM Cortex-M3)
Typical model:    10-50 KB
Tensor arena:     20-100 KB (depends on model)

Total for anomaly detection: ~50-80 KB
Available on STM32G474:      128 KB SRAM ✓
```

**Use cases for JEZGRO:**
1. **Thermal prediction** - Predict junction temperature from load profile
2. **Fault detection** - Anomaly detection on sensor streams
3. **SOH estimation** - Battery health from impedance patterns

```c
// TinyML integration sketch
#include "tensorflow/lite/micro/micro_interpreter.h"

// Model in flash (quantized INT8)
extern const unsigned char anomaly_model[];
extern const unsigned int anomaly_model_len;

// Tensor arena in RAM
static uint8_t tensor_arena[8192];

// Inference
float detect_anomaly(float *sensor_data, int len) {
    // Setup interpreter (once at init)
    static tflite::MicroInterpreter *interpreter = ...;

    // Copy input
    float *input = interpreter->input(0)->data.f;
    memcpy(input, sensor_data, len * sizeof(float));

    // Run inference (~1-5ms on Cortex-M4)
    interpreter->Invoke();

    // Get result
    return interpreter->output(0)->data.f[0];
}
```

---

## 4. Driver Isolation Patterns

### 4.1 User-Space Drivers

seL4 sDDF model applied to JEZGRO:

```
DRIVER ISOLATION ARCHITECTURE:
──────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    USER SPACE                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ CAN Driver   │  │ ADC Driver   │  │ PWM Driver   │       │
│  │ (untrusted)  │  │ (untrusted)  │  │ (trusted)    │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │               │
│  ┌──────▼─────────────────▼─────────────────▼───────┐       │
│  │              SHARED MEMORY REGIONS                │       │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐           │       │
│  │  │ CAN Buf │  │ ADC Buf │  │ PWM Buf │           │       │
│  │  └─────────┘  └─────────┘  └─────────┘           │       │
│  └──────────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────────┤
│                    KERNEL                                    │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ IRQ Dispatch │  │ MPU Config   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Fault Containment

```c
// Reincarnation server pattern (from MINIX3)
typedef struct {
    task_id_t driver_id;
    uint32_t restart_count;
    uint32_t last_restart;
    void (*init_func)(void);
} driver_entry_t;

void driver_crash_handler(task_id_t id) {
    driver_entry_t *driver = find_driver(id);

    if (driver->restart_count > MAX_RESTARTS) {
        // Permanent failure - alert ROJ
        roj_report_fault(id, FAULT_DRIVER_DEAD);
        return;
    }

    // Restart driver
    driver->restart_count++;
    driver->last_restart = jezgro_get_ticks();
    task_restart(id, driver->init_func);
}
```

---

## 5. Research Roadmap

### Priority 1: Mixed-Criticality Scheduler (Near-term)

**Goal:** Support HI/LO criticality tasks with mode switching

**Implementation steps:**
1. Add `criticality` field to task_t
2. Implement WCET_LO/WCET_HI tracking
3. Add mode switch logic on budget overrun
4. Test with power control (HI) + logging (LO)

**Effort:** 2-3 weeks

### Priority 2: Zero-Copy IPC (Near-term)

**Goal:** SPSC ring buffers for CAN-FD service

**Implementation steps:**
1. Define ring buffer structures (cache-aligned)
2. Implement producer/consumer operations
3. Integrate with CAN-FD ISR
4. Benchmark: target <500 cycles per message

**Effort:** 1-2 weeks

### Priority 3: Rust Kernel Drivers (Medium-term)

**Goal:** Write new drivers in Rust, keep C kernel

**Implementation steps:**
1. Setup Rust toolchain for STM32G474
2. Create `jezgro-sys` FFI bindings
3. Port one driver (SPI?) as proof of concept
4. Evaluate memory/code size overhead

**Effort:** 1 month (learning curve)

### Priority 4: Formal Verification Subset (Long-term)

**Goal:** Verify critical kernel paths

**Target paths:**
- Scheduler correctness (EDF property)
- Priority inheritance (no unbounded inversion)
- IPC message delivery (no loss)

**Approach:**
1. Use CBMC (C Bounded Model Checker) for finite verification
2. Annotate code with `__CPROVER_assert()`
3. Verify properties up to reasonable bounds

**Effort:** 3-6 months (academic collaboration?)

---

## 6. Key References

### Papers
1. Klein et al. "seL4: Formal Verification of an OS Kernel" (SOSP 2009)
2. Gu et al. "CertiKOS: An Extensible Architecture for Building Certified Concurrent OS Kernels" (OSDI 2016)
3. Vestal, S. "Preemptive Scheduling of Multi-Criticality Systems with Varying Degrees of Execution Time Assurance" (RTSS 2007)
4. Baruah et al. "Mixed Criticality Systems in Practice" (2023)

### Projects
- seL4: https://sel4.systems/
- Tock OS: https://www.tockos.org/
- Hubris: https://hubris.oxide.computer/
- RTIC: https://rtic.rs/

### Tools
- CBMC: https://www.cprover.org/cbmc/
- TensorFlow Lite Micro: https://www.tensorflow.org/lite/microcontrollers
- AbsInt aiT: https://www.absint.com/ait/

---

*Document: EK-REF-JEZGRO-001*
*Version: 1.0*
*Date: 2026-01-06*
