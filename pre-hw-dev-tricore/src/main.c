/**
 * @file main.c
 * @brief Minimal JEZGRO TC397XP Application (Build Test)
 */

#include <stddef.h>
#include <stdint.h>
#include <ek-kor/kernel.h>
#include <ek-kor/scheduler.h>
#include <ek-kor/task.h>
#include <ek-kor/hal.h>
#include "arch/tricore_cpu.h"
#include "arch/tricore_multicore.h"

/* Simple test task */
static void test_task(void *arg)
{
    (void)arg;
    uint32_t count = 0;
    
    while (1) {
        count++;
        ekk_hal_debug_puts("Tick ");
        ekk_hal_debug_hex(count);
        ekk_hal_debug_puts("\r\n");
        ekk_task_delay(ekk_ms_to_ticks(1000));
    }
}

/**
 * @brief CPU0 main entry point
 */
void cpu0_main(void)
{
    /* UART test - write directly to ASCLIN0 before any initialization */
    volatile uint32_t *asclin_flags = (volatile uint32_t *)0xF000062C;
    volatile uint32_t *asclin_tx = (volatile uint32_t *)0xF000060C;

    /* Direct character output - no string, no loop, just write */
    *asclin_tx = 'J';
    *asclin_tx = 'E';
    *asclin_tx = 'Z';
    *asclin_tx = 'G';
    *asclin_tx = 'R';
    *asclin_tx = 'O';
    *asclin_tx = '\r';
    *asclin_tx = '\n';

    /* Initialize HAL */
    ekk_hal_init();
    ekk_hal_init_core(0);

    ekk_hal_debug_puts("\r\n");
    ekk_hal_debug_puts("=================================\r\n");
    ekk_hal_debug_puts("JEZGRO RTOS for TC397XP\r\n");
    ekk_hal_debug_puts("=================================\r\n");
    
    /* Initialize kernel */
    ekk_init();
    ekk_task_init();
    ekk_sched_init();
    
    ekk_hal_debug_puts("Kernel initialized\r\n");
    
    /* Setup systick */
    ekk_hal_systick_init(ekk_sched_tick);
    
    /* Create idle task */
    ekk_task_create_idle();
    
    /* Create test task */
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "test";
    params.func = test_task;
    params.arg = NULL;
    params.priority = 100;
    params.stack_size = 2048;
    
    ekk_task_t task;
    ekk_task_create(&params, &task);
    
    ekk_hal_debug_puts("Starting scheduler...\r\n");
    
    /* Start scheduler (does not return) */
    ekk_start();
}

/* Secondary CPU entry points (idle) */
void cpu1_main(void) { while(1) __nop(); }
void cpu2_main(void) { while(1) __nop(); }
void cpu3_main(void) { while(1) __nop(); }
void cpu4_main(void) { while(1) __nop(); }
void cpu5_main(void) { while(1) __nop(); }
