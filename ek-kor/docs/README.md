# ek-kor

**Portable RTOS Kernel Library** - Extracted from JEZGRO project.

## Overview

ek-kor is a real-time operating system kernel supporting both single-core and multi-core embedded systems.

### Features

- **EDF Scheduling** - Earliest Deadline First for optimal CPU utilization
- **Per-core Ready Queues** - No task migration for predictable behavior
- **Priority Inheritance** - Prevent priority inversion with mutexes
- **Cross-core IPC** - Mailboxes and RPC for multi-core communication
- **Zero-copy Buffers** - Efficient large data transfer

### Supported Platforms

| Platform | Architecture | Cores | Status |
|----------|-------------|-------|--------|
| STM32G474 | ARM Cortex-M4 | 1 | ✅ |
| TC397XP | TriCore | 6 | ✅ |
| Simulation | Windows/Linux | 1 | ✅ |

## Quick Start

### Building

```bash
mkdir build && cd build
cmake -DEKK_MAX_CORES=1 ..   # Single-core
cmake --build .
```

### Usage

```c
#include <ek-kor/ek-kor.h>

void my_task(void *arg) {
    while (1) {
        // Task work
        ekk_task_delay_ms(100);
    }
}

int main(void) {
    ekk_init();

    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "my_task";
    params.func = my_task;
    params.priority = 128;

    ekk_task_t task;
    ekk_task_create(&params, &task);

    ekk_start();  // Never returns
}
```

## Configuration

Set via CMake options:

| Option | Default | Description |
|--------|---------|-------------|
| `EKK_MAX_CORES` | 1 | Number of CPU cores |
| `EKK_MAX_TASKS_PER_CORE` | 16 | Max tasks per core |
| `EKK_TICK_FREQ_HZ` | 1000 | System tick frequency |
| `EKK_USE_EDF` | ON | EDF scheduling |
| `EKK_DEBUG` | OFF | Debug assertions |

## API Prefix

All ek-kor functions use the `ekk_` prefix:

- `ekk_init()`, `ekk_start()` - Kernel control
- `ekk_task_*` - Task management
- `ekk_sched_*` - Scheduler control
- `ekk_mutex_*`, `ekk_sem_*` - Synchronization
- `ekk_queue_*`, `ekk_mailbox_*` - IPC
- `ekk_hal_*` - Hardware abstraction (platform implements)

## HAL Implementation

Each platform must implement the HAL interface defined in `hal.h`:

```c
// Required functions
int ekk_hal_init(void);
uint32_t ekk_hal_get_core_id(void);
uint32_t ekk_hal_disable_interrupts(void);
void ekk_hal_restore_interrupts(uint32_t state);
void ekk_hal_trigger_context_switch(void);
// ... see hal.h for full list
```

See `docs/PORTING.md` for porting guide.

## License

Part of Elektrokombinacija project.
