/**
 * @file fault.c
 * @brief ek-kor Fault Handler Implementation
 *
 * Handles memory protection faults, deadline misses, and other exceptions.
 */

#include <ek-kor/ek-kor.h>
#include <string.h>

#if EKK_USE_MPU

/* ==========================================================================
 * Fault Statistics
 * ========================================================================== */

static ekk_fault_info_t g_last_fault;
static uint32_t g_fault_count[EKK_MAX_CORES];

/* ==========================================================================
 * Default Fault Hook (weak, override in application)
 * ========================================================================== */

EKK_WEAK ekk_fault_action_t ekk_fault_hook(const ekk_fault_info_t *info)
{
    (void)info;

    /* Default: terminate the faulting task */
    return EKK_FAULT_ACTION_TERMINATE;
}

/* ==========================================================================
 * Fault Handler Registration
 * ========================================================================== */

static ekk_hal_fault_handler_t g_hal_fault_handler = NULL;

/**
 * @brief Kernel fault handler called by HAL
 */
static void kernel_fault_handler(uint32_t fault_type, void *fault_addr)
{
    uint32_t core = ekk_hal_get_core_id();
    g_fault_count[core]++;

    /* Populate fault info */
    g_last_fault.type = (ekk_fault_type_t)fault_type;
    g_last_fault.fault_addr = fault_addr;
    g_last_fault.status = ekk_hal_get_fault_status();

    /* Get current task info */
    ekk_task_t current = ekk_sched_get_current();
    if (current) {
        ekk_tcb_t *tcb = ekk_task_get_tcb(current);
        g_last_fault.task_id = tcb->id;
    } else {
        g_last_fault.task_id = 0xFFFFFFFF;
    }

    /* Get PC from stack if available */
    g_last_fault.pc = NULL;  /* Platform-specific, set by HAL if possible */

    /* Call user fault hook */
    ekk_fault_action_t action = ekk_fault_hook(&g_last_fault);

    /* Handle the fault based on action */
    switch (action) {
        case EKK_FAULT_ACTION_TERMINATE:
            if (current) {
                ekk_hal_debug_puts("[FAULT] Terminating task: ");
                ekk_hal_debug_puts(ekk_task_get_name(current));
                ekk_hal_debug_puts("\n");

                ekk_task_delete(current);
                ekk_sched_switch_request();
            }
            break;

        case EKK_FAULT_ACTION_RESTART:
            if (current) {
                ekk_hal_debug_puts("[FAULT] Restarting task: ");
                ekk_hal_debug_puts(ekk_task_get_name(current));
                ekk_hal_debug_puts("\n");

                /* Reset task state and re-schedule */
                ekk_tcb_t *tcb = ekk_task_get_tcb(current);
                tcb->state = EKK_TASK_READY;
                tcb->run_count = 0;
                /* Would need to reset stack here */
                ekk_sched_ready(current);
            }
            break;

        case EKK_FAULT_ACTION_IGNORE:
            /* Dangerous - just return and hope for the best */
            ekk_hal_debug_puts("[FAULT] Warning: Fault ignored!\n");
            break;

        case EKK_FAULT_ACTION_PANIC:
        default:
            ekk_hal_debug_puts("[FAULT] KERNEL PANIC!\n");
            ekk_hal_debug_puts("  Type: ");
            ekk_hal_debug_hex(fault_type);
            ekk_hal_debug_puts("\n  Addr: ");
            ekk_hal_debug_hex((uint32_t)(uintptr_t)fault_addr);
            ekk_hal_debug_puts("\n");

            /* Disable interrupts and halt */
            ekk_hal_disable_interrupts();
            for (;;) {
                ekk_hal_idle();
            }
            break;
    }

    /* Clear fault status for next fault */
    ekk_hal_clear_fault_status();
}

/* ==========================================================================
 * MPU Initialization
 * ========================================================================== */

int ekk_mpu_init(void)
{
    /* Initialize HAL MPU */
    int ret = ekk_hal_mpu_init();
    if (ret != 0) {
        return ret;
    }

    /* Register kernel fault handler */
    ekk_hal_register_fault_handler(kernel_fault_handler);

    /* Clear fault counters */
    memset(g_fault_count, 0, sizeof(g_fault_count));
    memset(&g_last_fault, 0, sizeof(g_last_fault));

    return EKK_OK;
}

/* ==========================================================================
 * Task MPU Configuration
 * ========================================================================== */

int ekk_mpu_configure_task(uint32_t task_id, const ekk_mpu_region_t *regions,
                           uint8_t count)
{
    ekk_task_t task = ekk_task_get_by_id(task_id);
    if (!task) {
        return EKK_ERR_NOTASK;
    }

    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    if (!tcb) {
        return EKK_ERR_PARAM;
    }

    if (count > EKK_MPU_REGIONS_PER_TASK) {
        count = EKK_MPU_REGIONS_PER_TASK;
    }

    ekk_hal_enter_critical();

    /* Copy regions to TCB */
    memcpy(tcb->mpu_regions, regions, count * sizeof(ekk_mpu_region_t));
    tcb->mpu_region_count = count;

    /* If this is the current task, reload MPU */
    if (task == ekk_sched_get_current()) {
        ekk_hal_mpu_load_task_regions(tcb);
    }

    ekk_hal_exit_critical();

    return EKK_OK;
}

int ekk_mpu_add_region(uint32_t task_id, const ekk_mpu_region_t *region)
{
    ekk_task_t task = ekk_task_get_by_id(task_id);
    if (!task) {
        return EKK_ERR_NOTASK;
    }

    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    if (tcb->mpu_region_count >= EKK_MPU_REGIONS_PER_TASK) {
        return EKK_ERR_FULL;
    }

    ekk_hal_enter_critical();

    tcb->mpu_regions[tcb->mpu_region_count] = *region;
    tcb->mpu_region_count++;

    if (task == ekk_sched_get_current()) {
        ekk_hal_mpu_load_task_regions(tcb);
    }

    ekk_hal_exit_critical();

    return EKK_OK;
}

int ekk_mpu_remove_region(uint32_t task_id, uint8_t region_num)
{
    ekk_task_t task = ekk_task_get_by_id(task_id);
    if (!task) {
        return EKK_ERR_NOTASK;
    }

    ekk_tcb_t *tcb = ekk_task_get_tcb(task);

    ekk_hal_enter_critical();

    /* Find and remove region */
    bool found = false;
    for (uint8_t i = 0; i < tcb->mpu_region_count; i++) {
        if (tcb->mpu_regions[i].region_num == region_num) {
            /* Shift remaining regions down */
            for (uint8_t j = i; j < tcb->mpu_region_count - 1; j++) {
                tcb->mpu_regions[j] = tcb->mpu_regions[j + 1];
            }
            tcb->mpu_region_count--;
            found = true;
            break;
        }
    }

    if (found && task == ekk_sched_get_current()) {
        ekk_hal_mpu_load_task_regions(tcb);
    }

    ekk_hal_exit_critical();

    return found ? EKK_OK : EKK_ERR_PARAM;
}

/* ==========================================================================
 * Fault Information
 * ========================================================================== */

ekk_fault_action_t ekk_mpu_handle_fault(ekk_fault_info_t *info)
{
    if (info) {
        *info = g_last_fault;
    }
    return ekk_fault_hook(&g_last_fault);
}

/* ==========================================================================
 * Deadline Miss Handler
 * ========================================================================== */

EKK_WEAK void ekk_deadline_miss_hook(ekk_task_t task, uint32_t overrun_us)
{
    (void)overrun_us;

    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    if (tcb) {
        ekk_hal_debug_puts("[DEADLINE] Missed by task: ");
        ekk_hal_debug_puts(tcb->name);
        ekk_hal_debug_puts(" overrun: ");
        ekk_hal_debug_hex(overrun_us);
        ekk_hal_debug_puts("us\n");
    }
}

#else /* !EKK_USE_MPU */

/* Stub implementations when MPU is disabled */

int ekk_mpu_init(void) { return EKK_OK; }

int ekk_mpu_configure_task(uint32_t task_id, const ekk_mpu_region_t *regions,
                           uint8_t count)
{
    (void)task_id; (void)regions; (void)count;
    return EKK_OK;
}

int ekk_mpu_add_region(uint32_t task_id, const ekk_mpu_region_t *region)
{
    (void)task_id; (void)region;
    return EKK_OK;
}

int ekk_mpu_remove_region(uint32_t task_id, uint8_t region_num)
{
    (void)task_id; (void)region_num;
    return EKK_OK;
}

EKK_WEAK void ekk_deadline_miss_hook(ekk_task_t task, uint32_t overrun_us)
{
    (void)task;
    (void)overrun_us;
}

#endif /* EKK_USE_MPU */
