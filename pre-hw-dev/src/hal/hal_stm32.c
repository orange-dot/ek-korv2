/**
 * @file hal_stm32.c
 * @brief ek-kor HAL - STM32G474 Implementation
 *
 * This HAL implementation targets STM32G474 (Cortex-M4F)
 * for use with Renode emulation and real hardware.
 */

#if defined(STM32G474xx)

#include <ek-kor/hal.h>
#include <ek-kor/task.h>
#include <ek-kor/scheduler.h>
#include <stddef.h>

/*===========================================================================*/
/* STM32G474 Register Definitions                                            */
/*===========================================================================*/

/* Core peripherals */
#define SCB_BASE            0xE000ED00UL
#define NVIC_BASE           0xE000E100UL
#define SYSTICK_BASE        0xE000E010UL
#define MPU_BASE            0xE000ED90UL

/* System Control Block */
#define SCB_ICSR            (*(volatile uint32_t *)(SCB_BASE + 0x04))
#define SCB_VTOR            (*(volatile uint32_t *)(SCB_BASE + 0x08))
#define SCB_AIRCR           (*(volatile uint32_t *)(SCB_BASE + 0x0C))
#define SCB_SCR             (*(volatile uint32_t *)(SCB_BASE + 0x10))
#define SCB_CCR             (*(volatile uint32_t *)(SCB_BASE + 0x14))
#define SCB_SHPR1           (*(volatile uint32_t *)(SCB_BASE + 0x18))
#define SCB_SHPR2           (*(volatile uint32_t *)(SCB_BASE + 0x1C))
#define SCB_SHPR3           (*(volatile uint32_t *)(SCB_BASE + 0x20))
#define SCB_SHCSR           (*(volatile uint32_t *)(SCB_BASE + 0x24))
#define SCB_CFSR            (*(volatile uint32_t *)(SCB_BASE + 0x28))
#define SCB_HFSR            (*(volatile uint32_t *)(SCB_BASE + 0x2C))
#define SCB_MMFAR           (*(volatile uint32_t *)(SCB_BASE + 0x34))
#define SCB_BFAR            (*(volatile uint32_t *)(SCB_BASE + 0x38))

/* SCB_ICSR bits */
#define SCB_ICSR_PENDSVSET  (1UL << 28)
#define SCB_ICSR_PENDSVCLR  (1UL << 27)

/* SysTick */
#define SYSTICK_CTRL        (*(volatile uint32_t *)(SYSTICK_BASE + 0x00))
#define SYSTICK_LOAD        (*(volatile uint32_t *)(SYSTICK_BASE + 0x04))
#define SYSTICK_VAL         (*(volatile uint32_t *)(SYSTICK_BASE + 0x08))
#define SYSTICK_CALIB       (*(volatile uint32_t *)(SYSTICK_BASE + 0x0C))

#define SYSTICK_CTRL_ENABLE     (1UL << 0)
#define SYSTICK_CTRL_TICKINT    (1UL << 1)
#define SYSTICK_CTRL_CLKSOURCE  (1UL << 2)
#define SYSTICK_CTRL_COUNTFLAG  (1UL << 16)

/* MPU */
#define MPU_TYPE            (*(volatile uint32_t *)(MPU_BASE + 0x00))
#define MPU_CTRL            (*(volatile uint32_t *)(MPU_BASE + 0x04))
#define MPU_RNR             (*(volatile uint32_t *)(MPU_BASE + 0x08))
#define MPU_RBAR            (*(volatile uint32_t *)(MPU_BASE + 0x0C))
#define MPU_RASR            (*(volatile uint32_t *)(MPU_BASE + 0x10))

#define MPU_CTRL_ENABLE     (1UL << 0)
#define MPU_CTRL_HFNMIENA   (1UL << 1)
#define MPU_CTRL_PRIVDEFENA (1UL << 2)

/* USART1 */
#define USART1_BASE         0x40013800UL
#define USART1_CR1          (*(volatile uint32_t *)(USART1_BASE + 0x00))
#define USART1_CR2          (*(volatile uint32_t *)(USART1_BASE + 0x04))
#define USART1_CR3          (*(volatile uint32_t *)(USART1_BASE + 0x08))
#define USART1_BRR          (*(volatile uint32_t *)(USART1_BASE + 0x0C))
#define USART1_ISR          (*(volatile uint32_t *)(USART1_BASE + 0x1C))
#define USART1_ICR          (*(volatile uint32_t *)(USART1_BASE + 0x20))
#define USART1_RDR          (*(volatile uint32_t *)(USART1_BASE + 0x24))
#define USART1_TDR          (*(volatile uint32_t *)(USART1_BASE + 0x28))

#define USART_CR1_UE        (1UL << 0)
#define USART_CR1_TE        (1UL << 3)
#define USART_CR1_RE        (1UL << 2)
#define USART_ISR_TXE       (1UL << 7)
#define USART_ISR_RXNE      (1UL << 5)
#define USART_ISR_TC        (1UL << 6)

/* RCC */
#define RCC_BASE            0x40021000UL
#define RCC_AHB2ENR         (*(volatile uint32_t *)(RCC_BASE + 0x4C))
#define RCC_APB2ENR         (*(volatile uint32_t *)(RCC_BASE + 0x60))

/* GPIO */
#define GPIOA_BASE          0x48000000UL
#define GPIOB_BASE          0x48000400UL
#define GPIOC_BASE          0x48000800UL

#define GPIO_MODER(base)    (*(volatile uint32_t *)(base + 0x00))
#define GPIO_OTYPER(base)   (*(volatile uint32_t *)(base + 0x04))
#define GPIO_OSPEEDR(base)  (*(volatile uint32_t *)(base + 0x08))
#define GPIO_PUPDR(base)    (*(volatile uint32_t *)(base + 0x0C))
#define GPIO_IDR(base)      (*(volatile uint32_t *)(base + 0x10))
#define GPIO_ODR(base)      (*(volatile uint32_t *)(base + 0x14))
#define GPIO_BSRR(base)     (*(volatile uint32_t *)(base + 0x18))
#define GPIO_AFR(base, n)   (*(volatile uint32_t *)(base + 0x20 + (n)*4))

/* CONTROL register for privilege mode */
#define CONTROL_NPRIV       (1UL << 0)  /* Unprivileged when set */
#define CONTROL_SPSEL       (1UL << 1)  /* Use PSP when set */

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/* System clock frequency (assume 170 MHz after initialization) */
#define SYSTEM_CLOCK_HZ     170000000UL
#define SYSTICK_HZ          1000            /* 1 kHz tick rate */

/* System tick counter (incremented by SysTick_Handler) */
static volatile uint32_t g_tick_count = 0;

/* Critical section nesting counter */
static volatile uint32_t g_critical_nesting = 0;

/* SysTick callback */
static ekk_hal_systick_cb_t g_systick_callback = NULL;

/* Context switching variables */
static volatile uint32_t *g_current_sp_ptr = NULL;
static volatile uint32_t g_next_sp = 0;

/* Fault handler callback */
static ekk_hal_fault_handler_t g_fault_handler = NULL;

/* Fault status (saved by fault handlers) */
static volatile uint32_t g_fault_status = 0;
static volatile void *g_fault_address = NULL;

/*===========================================================================*/
/* ARM Intrinsics                                                            */
/*===========================================================================*/

static inline void __DSB(void) { __asm volatile ("dsb 0xF" ::: "memory"); }
static inline void __ISB(void) { __asm volatile ("isb 0xF" ::: "memory"); }
static inline void __DMB(void) { __asm volatile ("dmb 0xF" ::: "memory"); }
static inline void __WFI(void) { __asm volatile ("wfi"); }
static inline void __NOP(void) { __asm volatile ("nop"); }
static inline void __BKPT(void) { __asm volatile ("bkpt #0"); }

static inline uint32_t __get_PRIMASK(void) {
    uint32_t result;
    __asm volatile ("mrs %0, primask" : "=r" (result));
    return result;
}

static inline void __set_PRIMASK(uint32_t primask) {
    __asm volatile ("msr primask, %0" : : "r" (primask) : "memory");
}

static inline void __enable_irq(void) {
    __asm volatile ("cpsie i" ::: "memory");
}

static inline void __disable_irq(void) {
    __asm volatile ("cpsid i" ::: "memory");
}

static inline uint32_t __get_CONTROL(void) {
    uint32_t result;
    __asm volatile ("mrs %0, control" : "=r" (result));
    return result;
}

static inline void __set_CONTROL(uint32_t control) {
    __asm volatile ("msr control, %0" : : "r" (control) : "memory");
}

static inline void* __get_PSP(void) {
    void *result;
    __asm volatile ("mrs %0, psp" : "=r" (result));
    return result;
}

static inline void* __get_MSP(void) {
    void *result;
    __asm volatile ("mrs %0, msp" : "=r" (result));
    return result;
}

/*===========================================================================*/
/* System Initialization                                                     */
/*===========================================================================*/

int ekk_hal_init(void)
{
    /* Enable GPIO clocks (GPIOA, GPIOB, GPIOC) */
    RCC_AHB2ENR |= (1 << 0) | (1 << 1) | (1 << 2);

    /* Enable USART1 clock */
    RCC_APB2ENR |= (1 << 14);

    /* Small delay for clocks to stabilize */
    for (volatile int i = 0; i < 1000; i++) { __NOP(); }

    /* Initialize USART1 for debug output (115200 baud @ 170MHz) */
    uint32_t gpio_base = GPIOA_BASE;
    GPIO_MODER(gpio_base) &= ~((3 << (9*2)) | (3 << (10*2)));
    GPIO_MODER(gpio_base) |=  ((2 << (9*2)) | (2 << (10*2)));  /* AF mode */
    GPIO_AFR(gpio_base, 1) &= ~((0xF << ((9-8)*4)) | (0xF << ((10-8)*4)));
    GPIO_AFR(gpio_base, 1) |=  ((7 << ((9-8)*4)) | (7 << ((10-8)*4)));  /* AF7 = USART */

    /* Configure USART1: 115200 baud */
    USART1_CR1 = 0;  /* Disable USART */
    USART1_BRR = SYSTEM_CLOCK_HZ / 115200;
    USART1_CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;

    /* Configure NVIC priority grouping: 4 bits preempt, 0 bits sub */
    SCB_AIRCR = 0x05FA0300;

    /* Set PendSV to lowest priority (for context switching) */
    SCB_SHPR3 |= (0xFF << 16);  /* PendSV priority = 255 */

    /* Set SysTick to second-lowest priority */
    SCB_SHPR3 |= (0xFE << 24);  /* SysTick priority = 254 */

    /* Enable MemManage, BusFault, UsageFault exceptions */
    SCB_SHCSR |= (1 << 16) | (1 << 17) | (1 << 18);

    return 0;
}

int ekk_hal_init_core(uint32_t core_id)
{
    (void)core_id;
    /* Single-core - nothing to do */
    return 0;
}

/*===========================================================================*/
/* Core Identification                                                       */
/*===========================================================================*/

uint32_t ekk_hal_get_core_id(void)
{
    return 0;  /* Single-core MCU */
}

uint32_t ekk_hal_get_core_count(void)
{
    return 1;  /* Single-core MCU */
}

bool ekk_hal_is_boot_core(void)
{
    return true;  /* Always boot core on single-core */
}

/*===========================================================================*/
/* Interrupt Control                                                         */
/*===========================================================================*/

uint32_t ekk_hal_disable_interrupts(void)
{
    uint32_t primask = __get_PRIMASK();
    __disable_irq();
    return primask;
}

void ekk_hal_enable_interrupts(void)
{
    __enable_irq();
}

void ekk_hal_restore_interrupts(uint32_t state)
{
    __set_PRIMASK(state);
}

bool ekk_hal_interrupts_enabled(void)
{
    return (__get_PRIMASK() & 1) == 0;
}

/*===========================================================================*/
/* Critical Sections                                                         */
/*===========================================================================*/

uint32_t ekk_hal_enter_critical(void)
{
    __disable_irq();
    return ++g_critical_nesting;
}

uint32_t ekk_hal_exit_critical(void)
{
    uint32_t nesting = --g_critical_nesting;
    if (nesting == 0) {
        __enable_irq();
    }
    return nesting;
}

bool ekk_hal_in_critical(void)
{
    return g_critical_nesting > 0;
}

/*===========================================================================*/
/* Time Functions                                                            */
/*===========================================================================*/

uint32_t ekk_hal_get_time_us(void)
{
    return (uint32_t)ekk_hal_get_time_us64();
}

uint32_t ekk_hal_get_time_ms(void)
{
    return g_tick_count;
}

uint64_t ekk_hal_get_time_us64(void)
{
    uint32_t ms, val, reload;
    uint32_t primask;

    primask = __get_PRIMASK();
    __disable_irq();

    ms = g_tick_count;
    val = SYSTICK_VAL;
    reload = SYSTICK_LOAD;

    /* Check if SysTick wrapped but interrupt hasn't fired yet */
    if ((SYSTICK_CTRL & SYSTICK_CTRL_COUNTFLAG) && (val > reload/2)) {
        ms++;
    }

    __set_PRIMASK(primask);

    uint64_t us = (uint64_t)ms * 1000;
    us += ((reload - val) * 1000) / (reload + 1);

    return us;
}

void ekk_hal_delay_us(uint32_t us)
{
    uint64_t target = ekk_hal_get_time_us64() + us;
    while (ekk_hal_get_time_us64() < target) {
        __NOP();
    }
}

void ekk_hal_delay_ms(uint32_t ms)
{
    uint32_t target = g_tick_count + ms;
    while (g_tick_count < target) {
        __WFI();
    }
}

/*===========================================================================*/
/* System Tick                                                               */
/*===========================================================================*/

int ekk_hal_systick_init(ekk_hal_systick_cb_t callback)
{
    uint32_t reload = (SYSTEM_CLOCK_HZ / SYSTICK_HZ) - 1;

    if (reload > 0xFFFFFF) {
        return -1;  /* Reload value too large */
    }

    g_systick_callback = callback;

    SYSTICK_CTRL = 0;
    SYSTICK_VAL = 0;
    SYSTICK_LOAD = reload;
    SYSTICK_CTRL = SYSTICK_CTRL_CLKSOURCE | SYSTICK_CTRL_TICKINT | SYSTICK_CTRL_ENABLE;

    return 0;
}

uint32_t ekk_hal_get_tick_count(void)
{
    return g_tick_count;
}

uint32_t ekk_hal_get_tick_period_us(void)
{
    return 1000000 / SYSTICK_HZ;
}

/* SysTick interrupt handler */
void SysTick_Handler(void)
{
    g_tick_count++;

    if (g_systick_callback) {
        g_systick_callback();
    }
}

/*===========================================================================*/
/* Context Switching                                                         */
/*===========================================================================*/

/* Import kernel functions for context switching */
extern ekk_task_t ekk_sched_get_current(void);
extern ekk_tcb_t* ekk_task_get_tcb(ekk_task_t handle);
extern uint32_t ekk_sched_do_switch(uint32_t current_sp);

/**
 * @brief Initialize task stack frame for ARM Cortex-M
 *
 * Creates an exception return frame on the stack so that when
 * PendSV returns to this task, it will start executing at entry.
 *
 * @param stack_top Top of allocated stack
 * @param entry Task entry function
 * @param arg Task argument
 * @return Initialized stack pointer
 */
uint32_t ekk_hal_init_task_stack(void *stack_top, void (*entry)(void*), void *arg)
{
    uint32_t *sp = (uint32_t *)stack_top;

    /* Exception stack frame (pushed by hardware on exception entry) */
    *(--sp) = 0x01000000UL;           /* xPSR - Thumb mode */
    *(--sp) = (uint32_t)entry;        /* PC - task entry point */
    *(--sp) = 0xFFFFFFFDUL;           /* LR - EXC_RETURN (return to thread PSP) */
    *(--sp) = 0x12121212UL;           /* R12 */
    *(--sp) = 0x03030303UL;           /* R3 */
    *(--sp) = 0x02020202UL;           /* R2 */
    *(--sp) = 0x01010101UL;           /* R1 */
    *(--sp) = (uint32_t)arg;          /* R0 - task argument */

    /* Software-saved registers (pushed by PendSV) */
    *(--sp) = 0x11111111UL;           /* R11 */
    *(--sp) = 0x10101010UL;           /* R10 */
    *(--sp) = 0x09090909UL;           /* R9 */
    *(--sp) = 0x08080808UL;           /* R8 */
    *(--sp) = 0x07070707UL;           /* R7 */
    *(--sp) = 0x06060606UL;           /* R6 */
    *(--sp) = 0x05050505UL;           /* R5 */
    *(--sp) = 0x04040404UL;           /* R4 */

    return (uint32_t)sp;
}

void ekk_hal_trigger_context_switch(void)
{
    SCB_ICSR |= SCB_ICSR_PENDSVSET;
    __DSB();
    __ISB();
}

/* Flag to tell PendSV this is the first task switch (no context to save) */
static volatile bool g_first_task_start = false;

/* Dummy stack for initial PSP - PendSV will save garbage here, which we ignore */
static uint32_t g_dummy_stack[32];

void ekk_hal_start_first_task(void *stack_ptr, void (*entry)(void))
{
    /*
     * Start the first task using PendSV.
     * This is the proper way to start tasks on Cortex-M.
     */
    ekk_tcb_t *tcb = ekk_task_get_tcb(ekk_sched_get_current());

    /* Initialize the stack frame if not already done */
    if (tcb->context_data == 0) {
        tcb->context_data = ekk_hal_init_task_stack(stack_ptr, (void(*)(void*))entry, tcb->entry_arg);
    }

    /* Mark that this is the first task - PendSV won't try to save current context */
    g_first_task_start = true;

    /* Set PSP to dummy stack so PendSV's stmdb doesn't fault */
    uint32_t dummy_psp = (uint32_t)&g_dummy_stack[32];  /* Top of dummy stack */
    __asm volatile ("msr psp, %0" : : "r" (dummy_psp));

    /* Switch to PSP */
    __asm volatile (
        "    mov r0, #2                     \n"
        "    msr control, r0                \n"
        "    isb                            \n"
    );

    /* Trigger PendSV to do the actual switch */
    SCB_ICSR |= SCB_ICSR_PENDSVSET;
    __DSB();
    __ISB();

    /* Should never return - PendSV will switch to the task */
    for (;;) { __WFI(); }
}

void ekk_hal_context_switch(void **current_sp, void *next_sp)
{
    g_current_sp_ptr = (volatile uint32_t *)current_sp;
    g_next_sp = (uint32_t)next_sp;
    ekk_hal_trigger_context_switch();
}

/**
 * @brief Context switch helper - called from PendSV
 *
 * Wrapper that initializes new task stacks if needed before switching.
 *
 * @param current_sp Current task's saved stack pointer
 * @return Next task's stack pointer
 */
/* Debug counter for PendSV calls */
static volatile uint32_t g_pendsv_count = 0;

uint32_t pendsv_switch_context(uint32_t current_sp)
{
    uint32_t next_sp;

    g_pendsv_count++;

    /* First task startup - don't save garbage context */
    if (g_first_task_start) {
        g_first_task_start = false;
        /* Just get the current task's initialized context */
        ekk_tcb_t *tcb = ekk_task_get_tcb(ekk_sched_get_current());
        next_sp = tcb->context_data;
        ekk_hal_debug_puts("[CTX] First: ");
        ekk_hal_debug_puts(tcb->name);
        ekk_hal_debug_puts("\r\n");
    } else {
        ekk_tcb_t *prev_tcb = ekk_task_get_tcb(ekk_sched_get_current());
        const char *prev_name = prev_tcb ? prev_tcb->name : "?";

        /* Normal context switch - call kernel to do the switch */
        next_sp = ekk_sched_do_switch(current_sp);

        ekk_tcb_t *next_tcb = ekk_task_get_tcb(ekk_sched_get_current());

        /* If next task hasn't run before, initialize its stack */
        if (next_sp == 0) {
            if (next_tcb) {
                next_sp = ekk_hal_init_task_stack(
                    next_tcb->stack_top,
                    (void(*)(void*))next_tcb->entry_func,
                    next_tcb->entry_arg
                );
                next_tcb->context_data = next_sp;
                ekk_hal_debug_puts("[CTX] Init ");
            }
        }

        /* Print for first 5 switches */
        if (g_pendsv_count <= 5) {
            ekk_hal_debug_puts("[CTX#");
            ekk_hal_debug_hex(g_pendsv_count);
            ekk_hal_debug_puts("] ");
            ekk_hal_debug_puts(prev_name);
            ekk_hal_debug_puts("->");
            ekk_hal_debug_puts(next_tcb ? next_tcb->name : "?");
            ekk_hal_debug_puts(" sp=");
            ekk_hal_debug_hex(next_sp);
            ekk_hal_debug_puts("\r\n");
        }
    }

    return next_sp;
}

/**
 * PendSV handler - performs the actual context switch
 *
 * ARM Cortex-M context switch:
 * - Hardware saves xPSR, PC, LR, R12, R3-R0 to PSP on exception entry
 * - Software must save R4-R11
 * - On exception return, hardware restores from PSP
 */
__attribute__((naked)) void PendSV_Handler(void)
{
    __asm volatile (
        /* Disable interrupts during context switch */
        "    cpsid i                        \n"

        /* Get current PSP */
        "    mrs r0, psp                    \n"

        /* Save R4-R11 to current task's stack */
        "    stmdb r0!, {r4-r11}            \n"

        /* Save LR (EXC_RETURN) which we need to preserve across bl */
        "    mov r3, lr                     \n"

        /* Call pendsv_switch_context(current_sp) -> next_sp */
        "    bl pendsv_switch_context       \n"

        /* r0 now contains next task's SP */
        /* Restore R4-R11 from new task's stack */
        "    ldmia r0!, {r4-r11}            \n"

        /* Set new PSP */
        "    msr psp, r0                    \n"

        /* Memory barrier to ensure PSP is updated */
        "    isb                            \n"

        /* Re-enable interrupts */
        "    cpsie i                        \n"

        /* Return using the EXC_RETURN value for thread mode with PSP */
        "    ldr r0, =0xFFFFFFFD            \n"
        "    bx r0                          \n"
    );
}

/*===========================================================================*/
/* Memory Barriers                                                           */
/*===========================================================================*/

void ekk_hal_memory_barrier(void)
{
    __DMB();
}

void ekk_hal_instruction_barrier(void)
{
    __ISB();
}

void ekk_hal_data_sync_barrier(void)
{
    __DSB();
}

/*===========================================================================*/
/* Idle / Sleep                                                              */
/*===========================================================================*/

void ekk_hal_idle(void)
{
    __WFI();
}

void ekk_hal_sleep(uint32_t mode)
{
    (void)mode;
    /* Simple sleep - just WFI */
    __WFI();
}

/*===========================================================================*/
/* Debug Support                                                             */
/*===========================================================================*/

void ekk_hal_debug_break(void)
{
    __BKPT();
}

void ekk_hal_debug_putc(char c)
{
    while (!(USART1_ISR & USART_ISR_TXE)) { __NOP(); }
    USART1_TDR = (uint8_t)c;
}

void ekk_hal_debug_puts(const char *s)
{
    while (*s) {
        ekk_hal_debug_putc(*s++);
    }
}

void ekk_hal_debug_hex(uint32_t value)
{
    static const char hex[] = "0123456789ABCDEF";
    char buf[11];
    buf[0] = '0';
    buf[1] = 'x';
    for (int i = 7; i >= 0; i--) {
        buf[2 + (7 - i)] = hex[(value >> (i * 4)) & 0xF];
    }
    buf[10] = '\0';
    ekk_hal_debug_puts(buf);
}

/*===========================================================================*/
/* Watchdog                                                                  */
/*===========================================================================*/

int ekk_hal_watchdog_init(uint32_t timeout_ms)
{
    (void)timeout_ms;
    /* Not implemented - would configure IWDG */
    return -1;
}

void ekk_hal_watchdog_reset(void)
{
    /* Not implemented */
}

void ekk_hal_watchdog_disable(void)
{
    /* Not implemented */
}

/*===========================================================================*/
/* System Reset                                                              */
/*===========================================================================*/

void ekk_hal_system_reset(void)
{
    SCB_AIRCR = 0x05FA0004;
    __DSB();
    while (1) { __WFI(); }
}

uint32_t ekk_hal_get_reset_reason(void)
{
    /* Would read RCC_CSR flags */
    return 0;
}

/*===========================================================================*/
/* Stack Checking                                                            */
/*===========================================================================*/

void* ekk_hal_get_stack_ptr(void)
{
    if (__get_CONTROL() & CONTROL_SPSEL) {
        return __get_PSP();
    } else {
        return __get_MSP();
    }
}

bool ekk_hal_check_stack(void *stack_bottom, uint32_t stack_size)
{
    void *sp = ekk_hal_get_stack_ptr();
    uint32_t stack_top = (uint32_t)stack_bottom + stack_size;

    return ((uint32_t)sp >= (uint32_t)stack_bottom &&
            (uint32_t)sp < stack_top);
}

/*===========================================================================*/
/* Memory Protection Unit                                                    */
/*===========================================================================*/

int ekk_hal_mpu_init(void)
{
    MPU_CTRL = 0;
    __DSB();
    __ISB();
    return 0;
}

uint8_t ekk_hal_mpu_get_region_count(void)
{
    return (MPU_TYPE >> 8) & 0xFF;
}

static uint32_t mpu_size_to_bits(uint32_t size)
{
    uint32_t bits = 0;
    size >>= 1;
    while (size) {
        bits++;
        size >>= 1;
    }
    return (bits < 4) ? 4 : bits - 1;
}

int ekk_hal_mpu_configure_region(uint8_t region, void *base, uint32_t size,
                                  uint8_t access, uint8_t attr)
{
    if (region >= 8) {
        return -1;
    }

    uint32_t rasr = 0;

    /* Size field */
    rasr |= (mpu_size_to_bits(size) << 1);

    /* Access permissions (AP field in bits [26:24]) */
    rasr |= ((access & 0x7) << 24);

    /* Memory attributes (TEX, C, B, S in bits [21:16]) */
    rasr |= ((attr & 0x3F) << 16);

    /* Enable region */
    rasr |= (1 << 0);

    /* Select region and configure */
    MPU_RNR = region;
    MPU_RBAR = (uint32_t)base & 0xFFFFFFE0;
    MPU_RASR = rasr;

    __DSB();
    __ISB();

    return 0;
}

void ekk_hal_mpu_enable_region(uint8_t region)
{
    if (region >= 8) return;
    MPU_RNR = region;
    MPU_RASR |= (1 << 0);
    __DSB();
    __ISB();
}

void ekk_hal_mpu_disable_region(uint8_t region)
{
    if (region >= 8) return;
    MPU_RNR = region;
    MPU_RASR &= ~(1 << 0);
    __DSB();
    __ISB();
}

void ekk_hal_mpu_enable(void)
{
    MPU_CTRL = MPU_CTRL_ENABLE | MPU_CTRL_PRIVDEFENA;
    __DSB();
    __ISB();
}

void ekk_hal_mpu_disable(void)
{
    MPU_CTRL = 0;
    __DSB();
    __ISB();
}

void ekk_hal_mpu_load_task_regions(const struct ekk_tcb *tcb)
{
    (void)tcb;
    /* Would load MPU regions from TCB - not implemented yet */
}

/*===========================================================================*/
/* Privilege Control                                                         */
/*===========================================================================*/

void ekk_hal_enter_user_mode(void)
{
    uint32_t control = __get_CONTROL();
    control |= CONTROL_NPRIV;  /* Set unprivileged */
    __set_CONTROL(control);
    __ISB();
}

void ekk_hal_enter_privileged_mode(void)
{
    /* Cannot directly enter privileged mode from unprivileged.
     * Must use SVC or be in handler mode. */
    uint32_t control = __get_CONTROL();
    control &= ~CONTROL_NPRIV;
    __set_CONTROL(control);
    __ISB();
}

bool ekk_hal_is_privileged(void)
{
    return (__get_CONTROL() & CONTROL_NPRIV) == 0;
}

/*===========================================================================*/
/* Fault Handling                                                            */
/*===========================================================================*/

void ekk_hal_register_fault_handler(ekk_hal_fault_handler_t handler)
{
    g_fault_handler = handler;
}

void* ekk_hal_get_fault_address(void)
{
    return (void*)g_fault_address;
}

uint32_t ekk_hal_get_fault_status(void)
{
    return g_fault_status;
}

void ekk_hal_clear_fault_status(void)
{
    SCB_CFSR = SCB_CFSR;  /* Write to clear */
    g_fault_status = 0;
    g_fault_address = NULL;
}

/*===========================================================================*/
/* Fault Handlers                                                            */
/*===========================================================================*/

void HardFault_Handler(void)
{
    g_fault_status = SCB_CFSR;

    ekk_hal_debug_puts("\r\n*** HARD FAULT ***\r\n");
    ekk_hal_debug_puts("CFSR: ");
    ekk_hal_debug_hex(SCB_CFSR);
    ekk_hal_debug_puts("\r\nHFSR: ");
    ekk_hal_debug_hex(SCB_HFSR);
    ekk_hal_debug_puts("\r\n");

    if (g_fault_handler) {
        g_fault_handler(1, g_fault_address);
    }

    while (1) { __WFI(); }
}

void MemManage_Handler(void)
{
    g_fault_status = SCB_CFSR;
    g_fault_address = (void*)SCB_MMFAR;

    ekk_hal_debug_puts("\r\n*** MPU FAULT ***\r\n");
    ekk_hal_debug_puts("CFSR: ");
    ekk_hal_debug_hex(SCB_CFSR);
    ekk_hal_debug_puts("\r\nMMFAR: ");
    ekk_hal_debug_hex(SCB_MMFAR);
    ekk_hal_debug_puts("\r\n");

    if (g_fault_handler) {
        g_fault_handler(2, g_fault_address);
    }

    SCB_CFSR = SCB_CFSR;
    while (1) { __WFI(); }
}

void BusFault_Handler(void)
{
    g_fault_status = SCB_CFSR;
    g_fault_address = (void*)SCB_BFAR;

    ekk_hal_debug_puts("\r\n*** BUS FAULT ***\r\n");
    ekk_hal_debug_puts("CFSR: ");
    ekk_hal_debug_hex(SCB_CFSR);
    ekk_hal_debug_puts("\r\nBFAR: ");
    ekk_hal_debug_hex(SCB_BFAR);
    ekk_hal_debug_puts("\r\n");

    if (g_fault_handler) {
        g_fault_handler(3, g_fault_address);
    }

    while (1) { __WFI(); }
}

void UsageFault_Handler(void)
{
    g_fault_status = SCB_CFSR;

    ekk_hal_debug_puts("\r\n*** USAGE FAULT ***\r\n");
    ekk_hal_debug_puts("CFSR: ");
    ekk_hal_debug_hex(SCB_CFSR);
    ekk_hal_debug_puts("\r\n");

    if (g_fault_handler) {
        g_fault_handler(4, NULL);
    }

    while (1) { __WFI(); }
}

/*===========================================================================*/
/* Inter-Processor Interrupt (IPI) - Not applicable for single-core          */
/*===========================================================================*/

int ekk_hal_ipi_init(void)
{
    return -1;  /* Not supported on single-core */
}

void ekk_hal_ipi_register_handler(ekk_hal_ipi_handler_t handler)
{
    (void)handler;
}

int ekk_hal_ipi_send(uint32_t target_core, uint32_t msg)
{
    (void)target_core;
    (void)msg;
    return -1;  /* Not supported */
}

uint32_t ekk_hal_ipi_broadcast(uint32_t msg)
{
    (void)msg;
    return 0;  /* No cores notified */
}

void ekk_hal_ipi_ack(void)
{
    /* Nothing to do */
}

#endif /* STM32G474xx */
