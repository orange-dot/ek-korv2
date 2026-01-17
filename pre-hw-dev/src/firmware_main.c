/**
 * @file firmware_main.c
 * @brief JEZGRO Firmware Entry Point for STM32G474
 *
 * Comprehensive test firmware for:
 * - Context switching (cooperative + preemptive)
 * - Synchronization primitives (mutex, semaphore)
 * - MPU fault handling
 * - EDF scheduling
 */

#include <ek-kor/ek-kor.h>

/* Version string for banner */
#define JEZGRO_VERSION_STRING EKK_VERSION_STRING

/*===========================================================================*/
/* Debug Output                                                              */
/*===========================================================================*/

static void debug_puts(const char *s)
{
    ekk_hal_debug_puts(s);
}

static void debug_putchar(char c)
{
    char buf[2] = {c, '\0'};
    ekk_hal_debug_puts(buf);
}

static void debug_putint(uint32_t val)
{
    char buf[12];
    int i = 0;

    if (val == 0) {
        debug_putchar('0');
        return;
    }

    while (val > 0) {
        buf[i++] = '0' + (val % 10);
        val /= 10;
    }

    while (i > 0) {
        debug_putchar(buf[--i]);
    }
}

/*===========================================================================*/
/* Test Configuration                                                        */
/*===========================================================================*/

/* Test selection - set to 1 to enable */
#define TEST_CONTEXT_SWITCH     1   /* Basic T1/T2 context switch */
#define TEST_PREEMPTION         0   /* T3 with short deadline preempts (disable for debug) */
#define TEST_MUTEX              0   /* Mutex lock/unlock between tasks (disable for debug) */
#define TEST_SEMAPHORE          0   /* Semaphore producer/consumer (disable for debug) */
#define TEST_MPU_FAULT          0   /* Intentional MPU violation (crashes!) */

/*===========================================================================*/
/* Global Test State                                                         */
/*===========================================================================*/

static volatile uint32_t task1_counter = 0;
static volatile uint32_t task2_counter = 0;
static volatile uint32_t task3_counter = 0;
static volatile uint32_t tick_counter = 0;

/* Shared resource protected by mutex */
static volatile uint32_t shared_counter = 0;
static ekk_mutex_struct_t test_mutex;
static bool mutex_initialized = false;

/* Semaphore for producer/consumer */
static ekk_sem_struct_t data_ready_sem;
static bool sem_initialized = false;
static volatile uint32_t produced_items = 0;
static volatile uint32_t consumed_items = 0;

/*===========================================================================*/
/* Test Task 1 - Basic work with mutex                                       */
/*===========================================================================*/

static volatile uint32_t task1_entry_count = 0;

static void task1_func(void *arg)
{
    (void)arg;

    /* This should print ONCE for fresh start, NEVER for resumption */
    task1_entry_count++;
    debug_puts("[T1] Entry #");
    debug_putint(task1_entry_count);
    debug_puts("\r\n");

    debug_puts("[T1] Started\r\n");

    while (1) {
        task1_counter++;

        /* DEBUG: Print on every iteration to see if loop runs */
        debug_puts("[T1] loop ");
        debug_putint(task1_counter);
        debug_puts("\r\n");

        #if TEST_MUTEX
        /* Lock mutex, update shared counter, unlock */
        if (mutex_initialized) {
            ekk_mutex_lock(&test_mutex, EKK_WAIT_FOREVER);
            shared_counter++;
            ekk_mutex_unlock(&test_mutex);
        }
        #endif

        /* Yield to let other tasks run */
        debug_puts("[T1] yield\r\n");
        ekk_task_yield();
        debug_puts("[T1] resumed\r\n");
    }
}

/*===========================================================================*/
/* Test Task 2 - Basic work with mutex + semaphore consumer                  */
/*===========================================================================*/

static volatile uint32_t task2_entry_count = 0;

static void task2_func(void *arg)
{
    (void)arg;

    task2_entry_count++;
    debug_puts("[T2] Entry #");
    debug_putint(task2_entry_count);
    debug_puts("\r\n");

    debug_puts("[T2] Started\r\n");

    while (1) {
        task2_counter++;

        /* DEBUG: Print on every iteration */
        debug_puts("[T2] loop ");
        debug_putint(task2_counter);
        debug_puts("\r\n");

        #if TEST_MUTEX
        /* Also update shared counter */
        if (mutex_initialized) {
            ekk_mutex_lock(&test_mutex, EKK_WAIT_FOREVER);
            shared_counter++;
            ekk_mutex_unlock(&test_mutex);
        }
        #endif

        #if TEST_SEMAPHORE
        /* Consumer: wait for data (non-blocking) */
        if (sem_initialized) {
            if (ekk_sem_wait(&data_ready_sem, 0) == EKK_OK) {
                consumed_items++;
            }
        }
        #endif

        /* Yield to let other tasks run */
        debug_puts("[T2] yield\r\n");
        ekk_task_yield();
        debug_puts("[T2] resumed\r\n");
    }
}

/*===========================================================================*/
/* Test Task 3 - Preemption test (high priority) + semaphore producer        */
/*===========================================================================*/

#if TEST_PREEMPTION
static void task3_func(void *arg)
{
    (void)arg;

    debug_puts("[T3] Started (high priority)\r\n");

    while (1) {
        task3_counter++;

        #if TEST_SEMAPHORE
        /* Producer: signal data ready every 100 iterations */
        if (sem_initialized && (task3_counter % 100) == 0) {
            produced_items++;
            ekk_sem_signal(&data_ready_sem);
        }
        #endif

        /* Print status every 200 iterations - more frequent due to higher priority */
        if ((task3_counter % 200) == 0) {
            debug_puts("[T3] cnt=");
            debug_putint(task3_counter);
            debug_puts(" produced=");
            debug_putint(produced_items);
            debug_puts("\r\n");
        }

        ekk_task_yield();
    }
}
#endif

/*===========================================================================*/
/* Test Task 4 - MPU Fault Test (intentional crash)                          */
/*===========================================================================*/

#if TEST_MPU_FAULT
static void task4_mpu_test(void *arg)
{
    (void)arg;

    debug_puts("[T4] MPU Fault Test - will crash!\r\n");
    debug_puts("[T4] Attempting to write to Flash (read-only region)...\r\n");

    /* This should trigger MemManage fault - Flash is marked as RO */
    volatile uint32_t *flash_ptr = (volatile uint32_t *)0x08000100;

    /* Small delay to let UART flush */
    for (volatile int i = 0; i < 100000; i++) { __asm volatile ("nop"); }

    /* This write should cause MPU fault! */
    *flash_ptr = 0xDEADBEEF;

    /* Should never reach here */
    debug_puts("[T4] ERROR: MPU fault did not trigger!\r\n");

    while (1) {
        ekk_task_yield();
    }
}
#endif

/*===========================================================================*/
/* Tick Handler (called from SysTick ISR)                                    */
/*===========================================================================*/

void jezgro_tick_handler(void)
{
    tick_counter++;

    /* Notify scheduler */
    ekk_sched_tick();

    /* Print heartbeat every second */
    if ((tick_counter % 1000) == 0) {
        debug_puts("[SYS] t=");
        debug_putint(tick_counter);
        debug_puts(" T1=");
        debug_putint(task1_counter);
        debug_puts(" T2=");
        debug_putint(task2_counter);
        #if TEST_PREEMPTION
        debug_puts(" T3=");
        debug_putint(task3_counter);
        #endif
        debug_puts("\r\n");
    }
}

/*===========================================================================*/
/* Main Entry Point                                                          */
/*===========================================================================*/

int main(void)
{
    ekk_err_t err;
    ekk_task_t task_handle;

    /* Initialize ek-kor kernel (includes HAL init) */
    err = ekk_init();
    if (err != EKK_OK) {
        /* Can't print - HAL not initialized */
        while (1) { __asm volatile ("nop"); }
    }

    /* Banner */
    debug_puts("\r\n");
    debug_puts("================================================\r\n");
    debug_puts("  JEZGRO RTOS v");
    debug_puts(JEZGRO_VERSION_STRING);
    debug_puts("\r\n");
    debug_puts("  Platform: STM32G474\r\n");
    debug_puts("  Kernel: ek-kor\r\n");
    debug_puts("  Comprehensive Test Suite\r\n");
    debug_puts("================================================\r\n");
    debug_puts("\r\n");

    /* Print test configuration */
    debug_puts("[CFG] Tests enabled:\r\n");
    #if TEST_CONTEXT_SWITCH
    debug_puts("  - Context Switch (T1/T2)\r\n");
    #endif
    #if TEST_PREEMPTION
    debug_puts("  - High Priority Task (T3)\r\n");
    #endif
    #if TEST_MUTEX
    debug_puts("  - Mutex (shared counter)\r\n");
    #endif
    #if TEST_SEMAPHORE
    debug_puts("  - Semaphore (producer/consumer)\r\n");
    #endif
    #if TEST_MPU_FAULT
    debug_puts("  - MPU Fault (will crash!)\r\n");
    #endif
    debug_puts("\r\n");

    /* Create synchronization objects */
    #if TEST_MUTEX
    debug_puts("[BOOT] Creating test mutex...\r\n");
    ekk_mutex_init(&test_mutex, "test_mtx");
    mutex_initialized = true;
    #endif

    #if TEST_SEMAPHORE
    debug_puts("[BOOT] Creating test semaphore...\r\n");
    ekk_sem_init(&data_ready_sem, "data_sem", 0, 100);
    sem_initialized = true;
    #endif

    /* Create test tasks using params struct */
    #if TEST_CONTEXT_SWITCH
    {
        ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
        params.name = "task1";
        params.func = task1_func;
        params.arg = NULL;
        params.priority = 50;
        params.stack_size = 1024;
        params.deadline_us = 100000;  /* 100ms deadline for EDF */

        debug_puts("[BOOT] Creating task1 (deadline=100ms)...\r\n");
        err = ekk_task_create(&params, &task_handle);
        if (err != EKK_OK) {
            debug_puts("[ERROR] Failed to create task1!\r\n");
        }
    }

    {
        ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
        params.name = "task2";
        params.func = task2_func;
        params.arg = NULL;
        params.priority = 50;
        params.stack_size = 1024;
        params.deadline_us = 200000;  /* 200ms deadline for EDF */

        debug_puts("[BOOT] Creating task2 (deadline=200ms)...\r\n");
        err = ekk_task_create(&params, &task_handle);
        if (err != EKK_OK) {
            debug_puts("[ERROR] Failed to create task2!\r\n");
        }
    }
    #endif

    #if TEST_PREEMPTION
    {
        ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
        params.name = "task3";
        params.func = task3_func;
        params.arg = NULL;
        params.priority = 100;  /* Higher priority */
        params.stack_size = 1024;

        debug_puts("[BOOT] Creating task3 (priority=100 - HIGH)...\r\n");
        err = ekk_task_create(&params, &task_handle);
        if (err != EKK_OK) {
            debug_puts("[ERROR] Failed to create task3!\r\n");
        }
    }
    #endif

    #if TEST_MPU_FAULT
    {
        ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
        params.name = "mpu_test";
        params.func = task4_mpu_test;
        params.arg = NULL;
        params.priority = 10;
        params.stack_size = 1024;

        debug_puts("[BOOT] Creating task4 (MPU fault test)...\r\n");
        err = ekk_task_create(&params, &task_handle);
        if (err != EKK_OK) {
            debug_puts("[ERROR] Failed to create task4!\r\n");
        }
    }
    #endif

    (void)task_handle;  /* Suppress unused warning */

    debug_puts("[BOOT] Starting scheduler...\r\n");
    debug_puts("\r\n");

    /* Start the scheduler - this never returns! */
    ekk_start();

    /* Never reached */
    debug_puts("[ERROR] ekk_start() returned!\r\n");
    while (1) {
        __asm volatile ("wfi");
    }

    return 0;
}
