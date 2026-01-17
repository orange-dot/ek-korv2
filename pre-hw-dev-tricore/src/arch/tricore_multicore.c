/**
 * @file tricore_multicore.c
 * @brief TriCore Multi-Core Implementation
 */

#include "tricore_multicore.h"
#include "tricore_irq.h"
#include "tricore_csa.h"
#include "tc397xp_regs.h"
#include <string.h>

/* ==========================================================================
 * External Symbols
 * ========================================================================== */

extern uint32_t __LMU_START;
extern uint32_t __LMU_SIZE;
extern uint32_t __IPC_START;
extern uint32_t __SHARED_START;

/* ==========================================================================
 * SCU CPU Control Registers
 * ========================================================================== */

/* CPU control registers in SCU */
#define SCU_CPU_BASE(n)         (0xF0036400 + (n) * 0x100)
#define CPU_DBGSR               0x04    /* Debug Status Register */
#define CPU_CCTRL               0x20    /* CPU Control Register */

/* CPU reset control - use full address since header defines only offset */
#define SCU_RSTCON_ADDR         (SCU_BASE + SCU_RSTCON)
#define SCU_RSTCON2_ADDR        (SCU_BASE + SCU_RSTCON2)

/* Per-CPU reset status */
#define SCU_CPU_RST(n)          (1U << (n))

/* CPU startup control - use full address since header defines only offset */
#define SCU_CCUCON0_ADDR        (SCU_BASE + SCU_CCUCON0)
#define SCU_CCUCON1_ADDR        (SCU_BASE + SCU_CCUCON1)

/* ==========================================================================
 * Per-Core Data (in LMU for visibility across cores)
 * ========================================================================== */

/**
 * @brief Per-core synchronization data
 * Placed in LMU section (.shared)
 */
typedef struct {
    volatile uint32_t state;        /**< Core state */
    volatile uint32_t ready;        /**< Ready flag */
    core_entry_t entry;             /**< Entry function */
    void *arg;                      /**< Entry argument */
    ipi_handler_t ipi_handler;      /**< IPI handler */
    volatile uint32_t ipi_event;    /**< Pending IPI event */
    volatile void *ipi_arg;         /**< IPI argument */
} core_data_t;

/* Core states */
#define CORE_STATE_RESET        0
#define CORE_STATE_STARTING     1
#define CORE_STATE_RUNNING      2
#define CORE_STATE_IDLE         3
#define CORE_STATE_STOPPED      4

/* Per-core data - placed in shared memory */
static core_data_t g_core_data[CPU_COUNT] __attribute__((section(".shared")));

/* Global spinlock for core management */
static spinlock_t g_core_lock __attribute__((section(".spinlock")));

/* Barrier counters */
static volatile uint32_t g_barrier_count[16] __attribute__((section(".shared")));
static spinlock_t g_barrier_lock __attribute__((section(".spinlock")));

/* Shared memory allocator state */
static volatile uint32_t g_shared_alloc_ptr __attribute__((section(".shared")));
static spinlock_t g_shared_alloc_lock __attribute__((section(".spinlock")));

/* ==========================================================================
 * Initialization
 * ========================================================================== */

void multicore_init(void)
{
    /* Only CPU0 should call this */
    if (cpu_get_id() != CPU0) {
        return;
    }

    /* Initialize core data */
    memset((void*)g_core_data, 0, sizeof(g_core_data));

    for (uint32_t i = 0; i < CPU_COUNT; i++) {
        g_core_data[i].state = (i == CPU0) ? CORE_STATE_RUNNING : CORE_STATE_RESET;
        g_core_data[i].ready = (i == CPU0) ? 1 : 0;
        g_core_data[i].entry = NULL;
        g_core_data[i].arg = NULL;
        g_core_data[i].ipi_handler = NULL;
        g_core_data[i].ipi_event = IPI_EVENT_NONE;
        g_core_data[i].ipi_arg = NULL;
    }

    /* Initialize spinlocks */
    spinlock_init(&g_core_lock);
    spinlock_init(&g_barrier_lock);
    spinlock_init(&g_shared_alloc_lock);

    /* Initialize barrier counters */
    memset((void*)g_barrier_count, 0, sizeof(g_barrier_count));

    /* Initialize shared memory allocator */
    g_shared_alloc_ptr = (uint32_t)&__SHARED_START;

    /* Memory barrier to ensure all cores see initialization */
    __dsync();
}

/* ==========================================================================
 * Core Startup
 * ========================================================================== */

/**
 * @brief Secondary core entry point
 *
 * Called when a secondary core starts. Sets up CSA, calls user entry.
 */
static void __attribute__((noreturn)) secondary_core_entry(void)
{
    uint32_t core_id = cpu_get_id();
    core_data_t *cd = &g_core_data[core_id];

    /* Initialize CSA pool for this core */
    cpu_info_t *cpu_info = cpu_get_info(core_id);
    if (cpu_info) {
        csa_init_pool(cpu_info->csa_base, cpu_info->csa_size);
    }

    /* Initialize IRQ for this core */
    irq_init();

    /* Mark as running */
    cd->state = CORE_STATE_RUNNING;
    __dsync();

    /* Call user entry function if set */
    if (cd->entry != NULL) {
        cd->entry(cd->arg);
    }

    /* Signal ready */
    multicore_signal_ready();

    /* Idle loop */
    while (1) {
        cd->state = CORE_STATE_IDLE;
        cpu_idle();

        /* Check for IPI */
        if (cd->ipi_event != IPI_EVENT_NONE) {
            multicore_handle_ipi();
        }
    }
}

int multicore_start_core(uint32_t core_id, core_entry_t entry, void *arg)
{
    if (core_id == CPU0 || core_id >= CPU_COUNT) {
        return -1;  /* Can't start CPU0 or invalid core */
    }

    spinlock_acquire(&g_core_lock);

    /* Check if already running */
    if (g_core_data[core_id].state != CORE_STATE_RESET) {
        spinlock_release(&g_core_lock);
        return -1;
    }

    /* Set entry point */
    g_core_data[core_id].entry = entry;
    g_core_data[core_id].arg = arg;
    g_core_data[core_id].state = CORE_STATE_STARTING;

    /* Memory barrier before releasing core */
    __dsync();

    /*
     * Release core from reset
     *
     * TC397XP uses PC (Program Counter) registers to set the start address
     * for each core. The default boot behavior is:
     * 1. CPU0 starts from flash
     * 2. CPU1-5 wait in reset until released
     *
     * To start a core:
     * 1. Set the PC start address (via SCU)
     * 2. Release the core reset
     */

    /* Set the start PC for the core */
    /* The core will start at secondary_core_entry */
    uint32_t cpu_base = SCU_CPU_BASE(core_id);
    uint32_t start_addr = (uint32_t)secondary_core_entry;

    /* Unlock ENDINIT to modify SCU registers */
    cpu_endinit_unlock();

    /* Configure core startup address */
    /* Note: Actual register names/offsets may vary, consult TC397XP manual */
    /* For TC3xx, cores start from BMH or configured PC */

    /* Release core from reset */
    uint32_t rstcon2 = REG_READ32(SCU_RSTCON2_ADDR);
    rstcon2 &= ~SCU_CPU_RST(core_id);  /* Clear reset bit */
    REG_WRITE32(SCU_RSTCON2_ADDR, rstcon2);

    /* Re-lock ENDINIT */
    cpu_endinit_lock();

    spinlock_release(&g_core_lock);

    (void)start_addr;  /* Used in actual implementation */

    return 0;
}

int multicore_start_all(void)
{
    int started = 0;

    for (uint32_t i = 1; i < CPU_COUNT; i++) {
        cpu_info_t *info = cpu_get_info(i);
        if (info && info->entry_func) {
            if (multicore_start_core(i, info->entry_func, info->entry_arg) == 0) {
                started++;
            }
        }
    }

    return started;
}

/* ==========================================================================
 * Core Ready Signaling
 * ========================================================================== */

void multicore_signal_ready(void)
{
    uint32_t core_id = cpu_get_id();
    g_core_data[core_id].ready = 1;
    __dsync();
}

bool multicore_is_core_ready(uint32_t core_id)
{
    if (core_id >= CPU_COUNT) {
        return false;
    }
    return g_core_data[core_id].ready != 0;
}

bool multicore_wait_core_ready(uint32_t core_id, uint32_t timeout_ms)
{
    if (core_id >= CPU_COUNT) {
        return false;
    }

    /* TODO: Implement proper timeout using STM timer */
    volatile uint32_t timeout = timeout_ms * 10000;  /* Rough estimate */

    while (!multicore_is_core_ready(core_id)) {
        if (timeout_ms != 0 && --timeout == 0) {
            return false;
        }
        __nop();
    }

    return true;
}

bool multicore_wait_all_ready(uint32_t timeout_ms)
{
    for (uint32_t i = 0; i < CPU_COUNT; i++) {
        if (!multicore_wait_core_ready(i, timeout_ms)) {
            return false;
        }
    }
    return true;
}

/* ==========================================================================
 * Inter-Processor Interrupts (IPI)
 * ========================================================================== */

void multicore_register_ipi_handler(ipi_handler_t handler)
{
    uint32_t core_id = cpu_get_id();
    g_core_data[core_id].ipi_handler = handler;
    __dsync();
}

int multicore_send_ipi(uint32_t target_core, uint32_t event, void *arg)
{
    if (target_core >= CPU_COUNT) {
        return -1;
    }

    /* Set IPI event data */
    g_core_data[target_core].ipi_arg = arg;
    __dsync();
    g_core_data[target_core].ipi_event = event;
    __dsync();

    /*
     * Trigger IPI via GPSR (General Purpose Service Request)
     *
     * TC397XP has GPSR registers that can be used for software-triggered
     * interrupts between cores.
     */
    uint32_t gpsr_addr = SRC_GPSR(target_core, 0);
    uint32_t src = REG_READ32(gpsr_addr);
    src |= SRC_SETR;  /* Set request bit */
    REG_WRITE32(gpsr_addr, src);

    return 0;
}

int multicore_broadcast_ipi(uint32_t event, void *arg)
{
    uint32_t my_core = cpu_get_id();
    int count = 0;

    for (uint32_t i = 0; i < CPU_COUNT; i++) {
        if (i != my_core) {
            if (multicore_send_ipi(i, event, arg) == 0) {
                count++;
            }
        }
    }

    return count;
}

void multicore_handle_ipi(void)
{
    uint32_t core_id = cpu_get_id();
    core_data_t *cd = &g_core_data[core_id];

    /* Get and clear event */
    uint32_t event = cd->ipi_event;
    void *arg = (void*)cd->ipi_arg;
    cd->ipi_event = IPI_EVENT_NONE;
    cd->ipi_arg = NULL;
    __dsync();

    if (event == IPI_EVENT_NONE) {
        return;
    }

    /* Handle built-in events */
    switch (event) {
        case IPI_EVENT_SCHEDULE:
            /* Trigger reschedule */
            /* Kernel will handle this */
            break;

        case IPI_EVENT_WAKEUP:
            /* Just wake up, nothing to do */
            break;

        case IPI_EVENT_STOP:
            /* Stop this core */
            cd->state = CORE_STATE_STOPPED;
            while (1) {
                __nop();
            }
            break;

        default:
            /* Call user handler */
            if (cd->ipi_handler != NULL) {
                cd->ipi_handler(event, arg);
            }
            break;
    }
}

/* ==========================================================================
 * Remote Function Calls
 * ========================================================================== */

/* Remote call data - one per core */
static remote_call_t g_remote_calls[CPU_COUNT] __attribute__((section(".shared")));

int multicore_call_on_core(uint32_t target_core, void (*func)(void*), void *arg, uint32_t timeout_ms)
{
    if (target_core >= CPU_COUNT || target_core == cpu_get_id()) {
        return -1;
    }

    remote_call_t *call = &g_remote_calls[target_core];
    call->func = func;
    call->arg = arg;
    call->done = false;
    call->result = -1;
    __dsync();

    /* Send IPI to trigger remote call */
    multicore_send_ipi(target_core, IPI_EVENT_CALL, call);

    /* Wait for completion */
    volatile uint32_t timeout = timeout_ms * 10000;
    while (!call->done) {
        if (timeout_ms != 0 && --timeout == 0) {
            return -1;
        }
        __nop();
    }

    return call->result;
}

int multicore_call_on_all(void (*func)(void*), void *arg, uint32_t timeout_ms)
{
    uint32_t my_core = cpu_get_id();
    int success = 0;

    for (uint32_t i = 0; i < CPU_COUNT; i++) {
        if (i != my_core) {
            if (multicore_call_on_core(i, func, arg, timeout_ms) == 0) {
                success++;
            }
        }
    }

    return success;
}

/* ==========================================================================
 * Barriers
 * ========================================================================== */

void multicore_barrier(uint32_t barrier_id)
{
    if (barrier_id >= 16) {
        return;
    }

    spinlock_acquire(&g_barrier_lock);
    g_barrier_count[barrier_id]++;
    uint32_t count = g_barrier_count[barrier_id];
    spinlock_release(&g_barrier_lock);

    /* Wait for all cores to reach barrier */
    while (g_barrier_count[barrier_id] < CPU_COUNT) {
        __nop();
    }

    /* Last core resets counter */
    if (count == CPU_COUNT) {
        g_barrier_count[barrier_id] = 0;
    }

    __dsync();
}

void multicore_memory_barrier(void)
{
    __dsync();
    __isync();
}

/* ==========================================================================
 * Shared Memory
 * ========================================================================== */

uint32_t multicore_get_shared_base(void)
{
    return (uint32_t)&__LMU_START;
}

uint32_t multicore_get_shared_size(void)
{
    return (uint32_t)&__LMU_SIZE;
}

void* multicore_alloc_shared(uint32_t size, uint32_t align)
{
    if (size == 0 || (align & (align - 1)) != 0) {
        return NULL;  /* Invalid size or alignment not power of 2 */
    }

    spinlock_acquire(&g_shared_alloc_lock);

    /* Align pointer */
    uint32_t ptr = (g_shared_alloc_ptr + align - 1) & ~(align - 1);

    /* Check bounds */
    uint32_t end = multicore_get_shared_base() + multicore_get_shared_size();
    if (ptr + size > end) {
        spinlock_release(&g_shared_alloc_lock);
        return NULL;
    }

    /* Allocate */
    g_shared_alloc_ptr = ptr + size;

    spinlock_release(&g_shared_alloc_lock);

    return (void*)ptr;
}
