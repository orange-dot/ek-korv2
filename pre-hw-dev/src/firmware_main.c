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

#include "jezgro.h"
#include "sync.h"
#include "hal.h"

/*===========================================================================*/
/* Debug Output                                                              */
/*===========================================================================*/

static void debug_puts(const char *s)
{
    hal_uart_puts(0, s);
}

static void debug_putchar(char c)
{
    hal_uart_putc(0, c);
}

static void debug_puthex(uint32_t val)
{
    static const char hex[] = "0123456789ABCDEF";
    for (int i = 7; i >= 0; i--) {
        debug_putchar(hex[(val >> (i * 4)) & 0xF]);
    }
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
#define TEST_PREEMPTION         1   /* T3 with short deadline preempts */
#define TEST_MUTEX              1   /* Mutex lock/unlock between tasks */
#define TEST_SEMAPHORE          1   /* Semaphore producer/consumer */
#define TEST_MPU_FAULT          0   /* Intentional MPU violation (crashes!) */
#define TEST_CAN_SWARM          1   /* CAN-FD swarm communication */

/*===========================================================================*/
/* Global Test State                                                         */
/*===========================================================================*/

static volatile uint32_t task1_counter = 0;
static volatile uint32_t task2_counter = 0;
static volatile uint32_t task3_counter = 0;
static volatile uint32_t tick_counter = 0;

/* Shared resource protected by mutex */
static volatile uint32_t shared_counter = 0;
static mutex_t *test_mutex = NULL;

/* Semaphore for producer/consumer */
static semaphore_t *data_ready_sem = NULL;
static volatile uint32_t produced_items = 0;
static volatile uint32_t consumed_items = 0;

/* CAN swarm state */
#if TEST_CAN_SWARM
static volatile uint32_t can_tx_count = 0;
static volatile uint32_t can_rx_count = 0;
static volatile uint8_t node_id = 1;  /* Default node ID */

/* ROJ message IDs */
#define ROJ_MSG_HEARTBEAT   0x100   /* Heartbeat broadcast */
#define ROJ_MSG_STATUS      0x200   /* Status report */
#define ROJ_MSG_COMMAND     0x300   /* Command from master */
#endif

/*===========================================================================*/
/* Test Task 1 - Basic work with mutex                                       */
/*===========================================================================*/

static void task1_func(void *arg)
{
    (void)arg;

    debug_puts("[T1] Started\r\n");

    while (1) {
        task1_counter++;

        #if TEST_MUTEX
        /* Lock mutex, update shared counter, unlock */
        if (test_mutex != NULL) {
            mutex_lock(test_mutex);
            shared_counter++;
            mutex_unlock(test_mutex);
        }
        #endif

        /* Print status every 500 iterations */
        if ((task1_counter % 500) == 0) {
            debug_puts("[T1] cnt=");
            debug_putint(task1_counter);
            debug_puts(" shared=");
            debug_putint(shared_counter);
            debug_puts("\r\n");
        }

        /* Yield to let other tasks run */
        scheduler_yield();
    }
}

/*===========================================================================*/
/* Test Task 2 - Basic work with mutex + semaphore consumer                  */
/*===========================================================================*/

static void task2_func(void *arg)
{
    (void)arg;

    debug_puts("[T2] Started\r\n");

    while (1) {
        task2_counter++;

        #if TEST_MUTEX
        /* Also update shared counter */
        if (test_mutex != NULL) {
            mutex_lock(test_mutex);
            shared_counter++;
            mutex_unlock(test_mutex);
        }
        #endif

        #if TEST_SEMAPHORE
        /* Consumer: wait for data */
        if (data_ready_sem != NULL) {
            if (sem_trywait(data_ready_sem) == SYNC_OK) {
                consumed_items++;
            }
        }
        #endif

        /* Print status every 1000 iterations */
        if ((task2_counter % 1000) == 0) {
            debug_puts("[T2] cnt=");
            debug_putint(task2_counter);
            debug_puts(" consumed=");
            debug_putint(consumed_items);
            debug_puts("\r\n");
        }

        scheduler_yield();
    }
}

/*===========================================================================*/
/* Test Task 3 - Preemption test (short deadline) + semaphore producer       */
/*===========================================================================*/

#if TEST_PREEMPTION
static void task3_func(void *arg)
{
    (void)arg;

    debug_puts("[T3] Started (preemptive, deadline=50ms)\r\n");

    while (1) {
        task3_counter++;

        #if TEST_SEMAPHORE
        /* Producer: signal data ready every 100 iterations */
        if (data_ready_sem != NULL && (task3_counter % 100) == 0) {
            produced_items++;
            sem_signal(data_ready_sem);
        }
        #endif

        /* Print status every 200 iterations - more frequent due to higher priority */
        if ((task3_counter % 200) == 0) {
            debug_puts("[T3] cnt=");
            debug_putint(task3_counter);
            debug_puts(" produced=");
            debug_putint(produced_items);
            debug_puts(" (PREEMPT)\r\n");
        }

        scheduler_yield();
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
        scheduler_yield();
    }
}
#endif

/*===========================================================================*/
/* Test Task 5 - CAN Swarm Communication (ROJ)                               */
/*===========================================================================*/

#if TEST_CAN_SWARM
static void task5_can_swarm(void *arg)
{
    (void)arg;
    hal_can_msg_t tx_msg, rx_msg;
    uint32_t loop_count = 0;

    debug_puts("[ROJ] Swarm task started, node=");
    debug_putint(node_id);
    debug_puts("\r\n");

    /* Initialize CAN-FD at 500kbps arbitration, 500kbps data (classic CAN for Renode) */
    if (hal_can_init(0, 500000, 0) != 0) {
        debug_puts("[ROJ] CAN init failed!\r\n");
        while (1) { scheduler_yield(); }
    }
    debug_puts("[ROJ] CAN initialized (500k classic)\r\n");

    /* Set filter to accept all messages */
    hal_can_set_filter(0, 0x000, 0x000);

    while (1) {
        loop_count++;

        /* Send heartbeat every 100 loops (~every 100ms) */
        if ((loop_count % 100) == 0) {
            tx_msg.id = ROJ_MSG_HEARTBEAT + node_id;
            tx_msg.extended = false;
            tx_msg.fd = false;     /* Classic CAN for Renode compatibility */
            tx_msg.brs = false;
            tx_msg.len = 8;

            /* Payload: [node_id, status, tick_hi, tick_lo, tx_hi, tx_lo, rx_hi, rx_lo] */
            tx_msg.data[0] = node_id;
            tx_msg.data[1] = 0x01;  /* Status: running */
            tx_msg.data[2] = (tick_counter >> 24) & 0xFF;
            tx_msg.data[3] = (tick_counter >> 16) & 0xFF;
            tx_msg.data[4] = (tick_counter >> 8) & 0xFF;
            tx_msg.data[5] = tick_counter & 0xFF;
            tx_msg.data[6] = (can_tx_count >> 8) & 0xFF;
            tx_msg.data[7] = can_tx_count & 0xFF;

            if (hal_can_send(0, &tx_msg) == 0) {
                can_tx_count++;
            }
        }

        /* Check for received messages */
        if (hal_can_receive(0, &rx_msg) == 0) {
            can_rx_count++;

            /* Process message based on type */
            uint32_t base_id = rx_msg.id & 0x7F0;

            if (base_id == ROJ_MSG_HEARTBEAT) {
                /* Received heartbeat from another node */
                uint8_t sender = rx_msg.id & 0x0F;
                if (sender != node_id) {
                    /* Print every 10th received heartbeat */
                    if ((can_rx_count % 10) == 1) {
                        debug_puts("[ROJ] HB from node ");
                        debug_putint(sender);
                        debug_puts(" tick=");
                        uint32_t remote_tick = ((uint32_t)rx_msg.data[2] << 24) |
                                               ((uint32_t)rx_msg.data[3] << 16) |
                                               ((uint32_t)rx_msg.data[4] << 8) |
                                               rx_msg.data[5];
                        debug_putint(remote_tick);
                        debug_puts("\r\n");
                    }
                }
            }
        }

        /* Print status every 500 loops */
        if ((loop_count % 500) == 0) {
            debug_puts("[ROJ] tx=");
            debug_putint(can_tx_count);
            debug_puts(" rx=");
            debug_putint(can_rx_count);
            debug_puts("\r\n");
        }

        scheduler_yield();
    }
}
#endif

/*===========================================================================*/
/* SysTick Handler                                                           */
/*===========================================================================*/

void SysTick_Handler(void)
{
    tick_counter++;

    /* Update HAL timing */
    hal_systick_increment();

    /* Notify scheduler every tick */
    scheduler_tick(1);

    /* Check and perform preemption if needed (EDF) */
    scheduler_preempt();

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
    /* Initialize HAL (clocks, GPIO, UART, MPU) */
    hal_init();

    /* Banner */
    debug_puts("\r\n");
    debug_puts("================================================\r\n");
    debug_puts("  JEZGRO RTOS v");
    debug_puts(JEZGRO_VERSION_STRING);
    debug_puts("\r\n");
    debug_puts("  Platform: ");
    debug_puts(hal_get_platform());
    debug_puts("\r\n");
    debug_puts("  Comprehensive Test Suite\r\n");
    debug_puts("================================================\r\n");
    debug_puts("\r\n");

    /* Print test configuration */
    debug_puts("[CFG] Tests enabled:\r\n");
    #if TEST_CONTEXT_SWITCH
    debug_puts("  - Context Switch (T1/T2)\r\n");
    #endif
    #if TEST_PREEMPTION
    debug_puts("  - Preemption (T3 short deadline)\r\n");
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
    #if TEST_CAN_SWARM
    debug_puts("  - CAN Swarm (ROJ communication)\r\n");
    #endif
    debug_puts("\r\n");

    /* Initialize kernel subsystems */
    debug_puts("[BOOT] Initializing scheduler...\r\n");
    scheduler_init();

    debug_puts("[BOOT] Initializing task manager...\r\n");
    task_init();

    debug_puts("[BOOT] Initializing IPC...\r\n");
    ipc_init();

    debug_puts("[BOOT] Initializing sync primitives...\r\n");
    sync_init();

    /* Create synchronization objects */
    #if TEST_MUTEX
    debug_puts("[BOOT] Creating test mutex...\r\n");
    test_mutex = mutex_create();
    if (test_mutex == NULL) {
        debug_puts("[ERROR] Failed to create mutex!\r\n");
    }
    #endif

    #if TEST_SEMAPHORE
    debug_puts("[BOOT] Creating test semaphore...\r\n");
    data_ready_sem = sem_create(0, 100);  /* Counting semaphore, max 100 */
    if (data_ready_sem == NULL) {
        debug_puts("[ERROR] Failed to create semaphore!\r\n");
    }
    #endif

    /* Create test tasks */
    #if TEST_CONTEXT_SWITCH
    debug_puts("[BOOT] Creating task1 (deadline=100ms, period=100ms)...\r\n");
    task_t *t1 = task_create("task1", task1_func, NULL, 100, 100);
    if (t1 == NULL) {
        debug_puts("[ERROR] Failed to create task1!\r\n");
    }

    debug_puts("[BOOT] Creating task2 (deadline=200ms, period=200ms)...\r\n");
    task_t *t2 = task_create("task2", task2_func, NULL, 200, 200);
    if (t2 == NULL) {
        debug_puts("[ERROR] Failed to create task2!\r\n");
    }
    #endif

    #if TEST_PREEMPTION
    debug_puts("[BOOT] Creating task3 (deadline=50ms, period=50ms) - PREEMPTIVE...\r\n");
    task_t *t3 = task_create("task3", task3_func, NULL, 50, 50);
    if (t3 == NULL) {
        debug_puts("[ERROR] Failed to create task3!\r\n");
    }
    #endif

    #if TEST_MPU_FAULT
    debug_puts("[BOOT] Creating task4 (MPU fault test)...\r\n");
    task_t *t4 = task_create("mpu_test", task4_mpu_test, NULL, 500, 0);
    if (t4 == NULL) {
        debug_puts("[ERROR] Failed to create task4!\r\n");
    }
    #endif

    #if TEST_CAN_SWARM
    debug_puts("[BOOT] Creating CAN swarm task (deadline=25ms)...\r\n");
    task_t *t5 = task_create("can_swarm", task5_can_swarm, NULL, 25, 25);
    if (t5 == NULL) {
        debug_puts("[ERROR] Failed to create CAN swarm task!\r\n");
    }
    #endif

    /* Suppress unused variable warnings */
    #if TEST_CONTEXT_SWITCH
    (void)t1; (void)t2;
    #endif
    #if TEST_PREEMPTION
    (void)t3;
    #endif
    #if TEST_MPU_FAULT
    (void)t4;
    #endif
    #if TEST_CAN_SWARM
    (void)t5;
    #endif

    /* Initialize SysTick for 1ms tick (1000 Hz) */
    debug_puts("[BOOT] Starting SysTick @ 1kHz...\r\n");
    if (hal_systick_init(1000) != 0) {
        debug_puts("[ERROR] Failed to init SysTick!\r\n");
    }

    /* Enable interrupts */
    debug_puts("[BOOT] Enabling interrupts...\r\n");
    hal_enable_interrupts();

    debug_puts("[BOOT] Starting scheduler...\r\n");
    debug_puts("\r\n");

    /* Start the scheduler - this never returns! */
    scheduler_start();

    /* Never reached */
    debug_puts("[ERROR] scheduler_start() returned!\r\n");
    while (1) {
        __asm volatile ("wfi");
    }

    return 0;
}
