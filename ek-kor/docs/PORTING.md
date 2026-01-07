# Porting ek-kor to New Platforms

This guide explains how to port ek-kor to a new hardware platform.

## Required HAL Functions

Your platform must implement these functions from `ek-kor/hal.h`:

### Core Identification

```c
uint32_t ekk_hal_get_core_id(void);     // Return 0 for single-core
uint32_t ekk_hal_get_core_count(void);  // Return 1 for single-core
bool ekk_hal_is_boot_core(void);        // Return true for single-core
```

### Interrupt Control

```c
uint32_t ekk_hal_disable_interrupts(void);
void ekk_hal_enable_interrupts(void);
void ekk_hal_restore_interrupts(uint32_t state);
```

### Critical Sections

```c
uint32_t ekk_hal_enter_critical(void);
uint32_t ekk_hal_exit_critical(void);
```

### Timing

```c
uint32_t ekk_hal_get_time_us(void);
uint32_t ekk_hal_get_time_ms(void);
int ekk_hal_systick_init(ekk_hal_systick_cb_t callback);
```

### Context Switching

```c
void ekk_hal_trigger_context_switch(void);
void ekk_hal_start_first_task(void *stack_ptr, void (*entry)(void));
void ekk_hal_context_switch(void **current_sp, void *next_sp);
```

### Debug (optional but recommended)

```c
void ekk_hal_debug_putc(char c);
void ekk_hal_debug_puts(const char *s);
```

## Example: ARM Cortex-M4

```c
// hal_cortexm4.c

#include <ek-kor/hal.h>

static volatile uint32_t g_critical_nesting = 0;
static volatile uint32_t g_tick_count = 0;
static ekk_hal_systick_cb_t g_tick_callback = NULL;

int ekk_hal_init(void) {
    // Initialize clocks, peripherals
    return 0;
}

uint32_t ekk_hal_get_core_id(void) {
    return 0;  // Single core
}

uint32_t ekk_hal_disable_interrupts(void) {
    uint32_t primask;
    __asm volatile ("mrs %0, primask" : "=r" (primask));
    __asm volatile ("cpsid i" ::: "memory");
    return primask;
}

void ekk_hal_restore_interrupts(uint32_t state) {
    __asm volatile ("msr primask, %0" :: "r" (state) : "memory");
}

uint32_t ekk_hal_enter_critical(void) {
    ekk_hal_disable_interrupts();
    return ++g_critical_nesting;
}

uint32_t ekk_hal_exit_critical(void) {
    if (--g_critical_nesting == 0) {
        ekk_hal_enable_interrupts();
    }
    return g_critical_nesting;
}

void ekk_hal_trigger_context_switch(void) {
    // Trigger PendSV
    SCB->ICSR |= SCB_ICSR_PENDSVSET_Msk;
}

// SysTick handler
void SysTick_Handler(void) {
    g_tick_count++;
    if (g_tick_callback) {
        g_tick_callback();
    }
}

int ekk_hal_systick_init(ekk_hal_systick_cb_t callback) {
    g_tick_callback = callback;
    SysTick_Config(SystemCoreClock / EKK_TICK_FREQ_HZ);
    return 0;
}
```

## CMake Integration

In your platform project:

```cmake
# Set core count before adding ek-kor
set(EKK_MAX_CORES 1)

# Add ek-kor as subdirectory
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../ek-kor ek-kor)

# Link ek-kor to your firmware
target_link_libraries(my_firmware PRIVATE ek-kor)

# Add your HAL implementation
target_sources(my_firmware PRIVATE
    src/hal/hal_myplatform.c
)
```

## Testing Your Port

1. Implement basic HAL functions
2. Run simple single-task test
3. Add multi-task test with delays
4. Test synchronization primitives
5. Verify timing accuracy
6. Test interrupt handling

## Reference Implementations

- `pre-hw-dev/src/hal/hal_stm32.c` - STM32G474 HAL
- `pre-hw-dev/src/hal/hal_sim.c` - Simulation HAL
- `pre-hw-dev-tricore/src/hal/hal_tc397xp.c` - TC397XP HAL
