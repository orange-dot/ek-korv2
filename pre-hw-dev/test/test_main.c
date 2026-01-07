/**
 * @file test_main.c
 * @brief ek-kor RTOS Test Runner
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ek-kor/ek-kor.h>

/*===========================================================================*/
/* Test Framework                                                            */
/*===========================================================================*/

static int tests_run = 0;
static int tests_passed = 0;
static int tests_failed = 0;

#define TEST_ASSERT(cond, msg) \
    do { \
        if (!(cond)) { \
            printf("  FAIL: %s\n", msg); \
            return 0; \
        } \
    } while(0)

#define TEST_ASSERT_EQ(a, b, msg) \
    TEST_ASSERT((a) == (b), msg)

#define RUN_TEST(test_func) \
    do { \
        printf("Running %s...\n", #test_func); \
        fflush(stdout); \
        tests_run++; \
        if (test_func()) { \
            tests_passed++; \
            printf("  PASS\n"); \
        } else { \
            tests_failed++; \
        } \
        fflush(stdout); \
    } while(0)

/*===========================================================================*/
/* HAL Tests                                                                 */
/*===========================================================================*/

static int test_hal_init(void)
{
    int ret = ekk_hal_init();
    TEST_ASSERT_EQ(ret, 0, "HAL init should succeed");

    uint32_t core_id = ekk_hal_get_core_id();
    TEST_ASSERT_EQ(core_id, 0, "Core ID should be 0 for simulation");

    uint32_t core_count = ekk_hal_get_core_count();
    TEST_ASSERT_EQ(core_count, 1, "Core count should be 1 for simulation");

    TEST_ASSERT(ekk_hal_is_boot_core() == true, "Should be boot core");

    return 1;
}

static int test_hal_timing(void)
{
    uint32_t t1 = ekk_hal_get_time_ms();
    ekk_hal_delay_ms(10);
    uint32_t t2 = ekk_hal_get_time_ms();

    TEST_ASSERT(t2 >= t1, "Time should not go backwards");
    /* Allow some tolerance */
    TEST_ASSERT(t2 - t1 >= 5, "Should have elapsed at least 5ms");

    return 1;
}

static int test_hal_critical_section(void)
{
    TEST_ASSERT(ekk_hal_in_critical() == false, "Should not be in critical initially");

    uint32_t nesting = ekk_hal_enter_critical();
    TEST_ASSERT_EQ(nesting, 1, "Nesting should be 1 after first enter");
    TEST_ASSERT(ekk_hal_in_critical() == true, "Should be in critical");

    nesting = ekk_hal_enter_critical();
    TEST_ASSERT_EQ(nesting, 2, "Nesting should be 2 after second enter");

    nesting = ekk_hal_exit_critical();
    TEST_ASSERT_EQ(nesting, 1, "Nesting should be 1 after first exit");
    TEST_ASSERT(ekk_hal_in_critical() == true, "Should still be in critical");

    nesting = ekk_hal_exit_critical();
    TEST_ASSERT_EQ(nesting, 0, "Nesting should be 0 after second exit");
    TEST_ASSERT(ekk_hal_in_critical() == false, "Should not be in critical");

    return 1;
}

static int test_hal_interrupts(void)
{
    /* Enable interrupts first */
    ekk_hal_enable_interrupts();
    TEST_ASSERT(ekk_hal_interrupts_enabled() == true, "Interrupts should be enabled");

    uint32_t state = ekk_hal_disable_interrupts();
    TEST_ASSERT(ekk_hal_interrupts_enabled() == false, "Interrupts should be disabled");

    ekk_hal_restore_interrupts(state);
    TEST_ASSERT(ekk_hal_interrupts_enabled() == true, "Interrupts should be restored");

    return 1;
}

/*===========================================================================*/
/* Kernel Tests                                                              */
/*===========================================================================*/

static int test_kernel_version(void)
{
    const char *version = ekk_version();
    TEST_ASSERT(version != NULL, "Version should not be NULL");
    TEST_ASSERT(strlen(version) > 0, "Version should not be empty");
    printf("    ek-kor version: %s\n", version);

    return 1;
}

static int test_kernel_state(void)
{
    ekk_state_t state = ekk_get_state();
    /* After init, should be in INIT state */
    TEST_ASSERT(state == EKK_STATE_INIT || state == EKK_STATE_RUNNING,
                "State should be INIT or RUNNING");

    return 1;
}

static int test_kernel_time_conversion(void)
{
    /* Test tick to ms conversion */
    ekk_time_ms_t ms = ekk_ticks_to_ms(1000);
    TEST_ASSERT_EQ(ms, 1000, "1000 ticks @ 1kHz = 1000ms");

    /* Test ms to ticks conversion */
    ekk_tick_t ticks = ekk_ms_to_ticks(500);
    TEST_ASSERT_EQ(ticks, 500, "500ms @ 1kHz = 500 ticks");

    /* Test us to ticks conversion */
    ticks = ekk_us_to_ticks(2000);
    TEST_ASSERT_EQ(ticks, 2, "2000us @ 1kHz = 2 ticks");

    return 1;
}

/*===========================================================================*/
/* Scheduler Tests                                                           */
/*===========================================================================*/

static int test_scheduler_init(void)
{
    ekk_err_t err = ekk_sched_init();
    TEST_ASSERT_EQ(err, EKK_OK, "Scheduler init should succeed");

    TEST_ASSERT(ekk_sched_is_locked() == false, "Scheduler should not be locked");

    return 1;
}

static int test_scheduler_lock_unlock(void)
{
    ekk_sched_lock();
    TEST_ASSERT(ekk_sched_is_locked() == true, "Scheduler should be locked");

    ekk_sched_lock();  /* Nested lock */
    TEST_ASSERT(ekk_sched_is_locked() == true, "Scheduler should still be locked");

    ekk_sched_unlock();
    TEST_ASSERT(ekk_sched_is_locked() == true, "Scheduler should still be locked (nested)");

    ekk_sched_unlock();
    TEST_ASSERT(ekk_sched_is_locked() == false, "Scheduler should be unlocked");

    return 1;
}

/*===========================================================================*/
/* Task Tests                                                                */
/*===========================================================================*/

static void dummy_task(void *arg)
{
    (void)arg;
    /* Do nothing */
}

static int test_task_init(void)
{
    ekk_err_t err = ekk_task_init();
    TEST_ASSERT_EQ(err, EKK_OK, "Task init should succeed");

    return 1;
}

static int test_task_create_delete(void)
{
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "test_task";
    params.func = dummy_task;
    params.priority = 128;
    params.stack_size = 1024;

    ekk_task_t task = NULL;
    ekk_err_t err = ekk_task_create(&params, &task);
    TEST_ASSERT_EQ(err, EKK_OK, "Task creation should succeed");
    TEST_ASSERT(task != NULL, "Task handle should not be NULL");

    /* Check task properties */
    const char *name = ekk_task_get_name(task);
    TEST_ASSERT(name != NULL, "Task name should not be NULL");
    TEST_ASSERT(strcmp(name, "test_task") == 0, "Task name should match");

    uint8_t priority = ekk_task_get_priority(task);
    TEST_ASSERT_EQ(priority, 128, "Priority should be 128");

    ekk_task_state_t state = ekk_task_get_state(task);
    TEST_ASSERT_EQ(state, EKK_TASK_READY, "Initial state should be READY");

    /* Delete task */
    err = ekk_task_delete(task);
    TEST_ASSERT_EQ(err, EKK_OK, "Task deletion should succeed");

    return 1;
}

static int test_task_suspend_resume(void)
{
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "suspend_test";
    params.func = dummy_task;

    ekk_task_t task = NULL;
    ekk_err_t err = ekk_task_create(&params, &task);
    TEST_ASSERT_EQ(err, EKK_OK, "Task creation should succeed");

    /* Suspend */
    err = ekk_task_suspend(task);
    TEST_ASSERT_EQ(err, EKK_OK, "Suspend should succeed");
    TEST_ASSERT_EQ(ekk_task_get_state(task), EKK_TASK_SUSPENDED, "State should be SUSPENDED");

    /* Resume */
    err = ekk_task_resume(task);
    TEST_ASSERT_EQ(err, EKK_OK, "Resume should succeed");
    TEST_ASSERT_EQ(ekk_task_get_state(task), EKK_TASK_READY, "State should be READY");

    ekk_task_delete(task);
    return 1;
}

static int test_task_priority(void)
{
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "priority_test";
    params.func = dummy_task;
    params.priority = 100;

    ekk_task_t task = NULL;
    ekk_task_create(&params, &task);

    TEST_ASSERT_EQ(ekk_task_get_priority(task), 100, "Initial priority should be 100");

    ekk_err_t err = ekk_task_set_priority(task, 200);
    TEST_ASSERT_EQ(err, EKK_OK, "Set priority should succeed");
    TEST_ASSERT_EQ(ekk_task_get_priority(task), 200, "Priority should be 200");

    ekk_task_delete(task);
    return 1;
}

static int test_task_lookup(void)
{
    ekk_task_params_t params = EKK_TASK_PARAMS_DEFAULT;
    params.name = "lookup_test";
    params.func = dummy_task;

    ekk_task_t task = NULL;
    ekk_task_create(&params, &task);

    /* Get TCB to access ID */
    ekk_tcb_t *tcb = ekk_task_get_tcb(task);
    TEST_ASSERT(tcb != NULL, "TCB should not be NULL");

    /* Find by name */
    ekk_task_t found = ekk_task_get_by_name("lookup_test");
    TEST_ASSERT_EQ(found, task, "Should find task by name");

    /* Find by ID */
    found = ekk_task_get_by_id(tcb->id);
    TEST_ASSERT_EQ(found, task, "Should find task by ID");

    /* Not found */
    found = ekk_task_get_by_name("nonexistent");
    TEST_ASSERT(found == NULL, "Should not find nonexistent task");

    ekk_task_delete(task);
    return 1;
}

/*===========================================================================*/
/* Sync Tests - Spinlock                                                     */
/*===========================================================================*/

static int test_spinlock(void)
{
    ekk_spinlock_t spin;
    ekk_spinlock_init(&spin, "test_spin");

    TEST_ASSERT(ekk_spinlock_is_locked(&spin) == false, "Should be unlocked initially");

    ekk_spinlock_acquire(&spin);
    TEST_ASSERT(ekk_spinlock_is_locked(&spin) == true, "Should be locked");

    ekk_spinlock_release(&spin);
    TEST_ASSERT(ekk_spinlock_is_locked(&spin) == false, "Should be unlocked");

    /* Try lock */
    bool acquired = ekk_spinlock_try(&spin);
    TEST_ASSERT(acquired == true, "Try should succeed");
    TEST_ASSERT(ekk_spinlock_is_locked(&spin) == true, "Should be locked");

    ekk_spinlock_release(&spin);
    return 1;
}

/*===========================================================================*/
/* Sync Tests - Mutex                                                        */
/*===========================================================================*/

static int test_mutex_init(void)
{
    ekk_mutex_struct_t mtx;
    ekk_mutex_init(&mtx, "test_mutex");

    TEST_ASSERT(ekk_mutex_is_locked(&mtx) == false, "Should be unlocked initially");
    TEST_ASSERT(ekk_mutex_get_owner(&mtx) == NULL, "Owner should be NULL");

    return 1;
}

static int test_mutex_lock_unlock(void)
{
    ekk_mutex_struct_t mtx;
    ekk_mutex_init(&mtx, "test_mutex");

    ekk_err_t err = ekk_mutex_lock(&mtx, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Lock should succeed");
    TEST_ASSERT(ekk_mutex_is_locked(&mtx) == true, "Should be locked");

    err = ekk_mutex_unlock(&mtx);
    TEST_ASSERT_EQ(err, EKK_OK, "Unlock should succeed");
    TEST_ASSERT(ekk_mutex_is_locked(&mtx) == false, "Should be unlocked");

    return 1;
}

static int test_mutex_trylock(void)
{
    ekk_mutex_struct_t mtx;
    ekk_mutex_init(&mtx, "test_mutex");

    ekk_err_t err = ekk_mutex_trylock(&mtx);
    TEST_ASSERT_EQ(err, EKK_OK, "Trylock should succeed");
    TEST_ASSERT(ekk_mutex_is_locked(&mtx) == true, "Should be locked");

    ekk_mutex_unlock(&mtx);
    return 1;
}

/*===========================================================================*/
/* Sync Tests - Semaphore                                                    */
/*===========================================================================*/

static int test_semaphore_init(void)
{
    ekk_sem_struct_t sem;
    ekk_sem_init(&sem, "test_sem", 5, 10);

    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 5, "Initial count should be 5");

    return 1;
}

static int test_semaphore_wait_signal(void)
{
    ekk_sem_struct_t sem;
    ekk_sem_init(&sem, "test_sem", 3, 10);

    /* Wait decrements count */
    ekk_err_t err = ekk_sem_wait(&sem, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Wait should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 2, "Count should be 2");

    err = ekk_sem_wait(&sem, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Wait should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 1, "Count should be 1");

    /* Signal increments count */
    err = ekk_sem_signal(&sem);
    TEST_ASSERT_EQ(err, EKK_OK, "Signal should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 2, "Count should be 2");

    return 1;
}

static int test_semaphore_trywait(void)
{
    ekk_sem_struct_t sem;
    ekk_sem_init(&sem, "test_sem", 1, 1);

    ekk_err_t err = ekk_sem_trywait(&sem);
    TEST_ASSERT_EQ(err, EKK_OK, "Trywait should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 0, "Count should be 0");

    err = ekk_sem_trywait(&sem);
    TEST_ASSERT_EQ(err, EKK_ERR_BUSY, "Trywait should return BUSY when count=0");

    return 1;
}

/*===========================================================================*/
/* Sync Tests - Event Flags                                                  */
/*===========================================================================*/

static int test_event_flags(void)
{
    ekk_event_struct_t event;
    ekk_event_init(&event, "test_event");

    TEST_ASSERT_EQ(ekk_event_get(&event), 0, "Initial flags should be 0");

    /* Set flags */
    ekk_err_t err = ekk_event_set(&event, 0x0F);
    TEST_ASSERT_EQ(err, EKK_OK, "Set should succeed");
    TEST_ASSERT_EQ(ekk_event_get(&event), 0x0F, "Flags should be 0x0F");

    /* Set more flags */
    ekk_event_set(&event, 0xF0);
    TEST_ASSERT_EQ(ekk_event_get(&event), 0xFF, "Flags should be 0xFF");

    /* Clear flags */
    uint32_t old = ekk_event_clear(&event, 0x0F);
    TEST_ASSERT_EQ(old, 0xFF, "Old flags should be 0xFF");
    TEST_ASSERT_EQ(ekk_event_get(&event), 0xF0, "Flags should be 0xF0");

    return 1;
}

/*===========================================================================*/
/* IPC Tests - Queue                                                         */
/*===========================================================================*/

static int test_queue_create(void)
{
    ekk_queue_struct_t queue;
    static uint8_t buffer[64 * 8];  /* 8 messages of 64 bytes */

    ekk_err_t err = ekk_queue_create(&queue, "test_queue", 64, 8, buffer);
    TEST_ASSERT_EQ(err, EKK_OK, "Queue creation should succeed");
    TEST_ASSERT(ekk_queue_is_empty(&queue) == true, "Queue should be empty");
    TEST_ASSERT(ekk_queue_is_full(&queue) == false, "Queue should not be full");
    TEST_ASSERT_EQ(ekk_queue_count(&queue), 0, "Count should be 0");
    TEST_ASSERT_EQ(ekk_queue_space(&queue), 8, "Space should be 8");

    ekk_queue_delete(&queue);
    return 1;
}

static int test_queue_send_receive(void)
{
    ekk_queue_struct_t queue;
    static uint8_t buffer[sizeof(uint32_t) * 4];

    ekk_queue_create(&queue, "test_queue", sizeof(uint32_t), 4, buffer);

    /* Send messages */
    uint32_t msg1 = 0x12345678;
    uint32_t msg2 = 0xDEADBEEF;

    ekk_err_t err = ekk_queue_send(&queue, &msg1, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Send should succeed");
    TEST_ASSERT_EQ(ekk_queue_count(&queue), 1, "Count should be 1");

    err = ekk_queue_send(&queue, &msg2, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Send should succeed");
    TEST_ASSERT_EQ(ekk_queue_count(&queue), 2, "Count should be 2");

    /* Receive messages */
    uint32_t recv;
    err = ekk_queue_receive(&queue, &recv, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Receive should succeed");
    TEST_ASSERT_EQ(recv, 0x12345678, "First message should match");

    err = ekk_queue_receive(&queue, &recv, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Receive should succeed");
    TEST_ASSERT_EQ(recv, 0xDEADBEEF, "Second message should match");

    TEST_ASSERT(ekk_queue_is_empty(&queue) == true, "Queue should be empty");

    ekk_queue_delete(&queue);
    return 1;
}

static int test_queue_peek(void)
{
    ekk_queue_struct_t queue;
    static uint8_t buffer[sizeof(uint32_t) * 4];

    ekk_queue_create(&queue, "test_queue", sizeof(uint32_t), 4, buffer);

    uint32_t msg = 0xCAFEBABE;
    ekk_queue_send(&queue, &msg, EKK_NO_WAIT);

    /* Peek should not remove message */
    uint32_t peek;
    ekk_err_t err = ekk_queue_peek(&queue, &peek);
    TEST_ASSERT_EQ(err, EKK_OK, "Peek should succeed");
    TEST_ASSERT_EQ(peek, 0xCAFEBABE, "Peek value should match");
    TEST_ASSERT_EQ(ekk_queue_count(&queue), 1, "Count should still be 1");

    /* Receive should get same message */
    uint32_t recv;
    ekk_queue_receive(&queue, &recv, EKK_NO_WAIT);
    TEST_ASSERT_EQ(recv, 0xCAFEBABE, "Received value should match");

    ekk_queue_delete(&queue);
    return 1;
}

static int test_queue_flush(void)
{
    ekk_queue_struct_t queue;
    static uint8_t buffer[sizeof(uint32_t) * 4];

    ekk_queue_create(&queue, "test_queue", sizeof(uint32_t), 4, buffer);

    uint32_t msg = 1;
    ekk_queue_send(&queue, &msg, EKK_NO_WAIT);
    msg = 2;
    ekk_queue_send(&queue, &msg, EKK_NO_WAIT);
    msg = 3;
    ekk_queue_send(&queue, &msg, EKK_NO_WAIT);

    TEST_ASSERT_EQ(ekk_queue_count(&queue), 3, "Count should be 3");

    ekk_queue_flush(&queue);
    TEST_ASSERT_EQ(ekk_queue_count(&queue), 0, "Count should be 0 after flush");
    TEST_ASSERT(ekk_queue_is_empty(&queue) == true, "Queue should be empty");

    ekk_queue_delete(&queue);
    return 1;
}

/*===========================================================================*/
/* Scheduler Delay Queue Tests                                               */
/*===========================================================================*/

static int test_scheduler_ticks(void)
{
    ekk_tick_t t1 = ekk_sched_get_ticks();
    TEST_ASSERT(t1 >= 0, "Tick count should be valid");

    /* Ticks should not go backwards */
    ekk_tick_t t2 = ekk_sched_get_ticks();
    TEST_ASSERT(t2 >= t1, "Ticks should not go backwards");

    return 1;
}

static int test_scheduler_validation(void)
{
    /* Validate ready queue after init */
    bool valid = ekk_sched_validate();
    TEST_ASSERT(valid == true, "Ready queue should be valid after init");

    return 1;
}

static int test_scheduler_utilization(void)
{
    /* Get utilization - should be 0-100 */
    uint32_t util = ekk_sched_get_utilization();
    TEST_ASSERT(util <= 100, "Utilization should be <= 100");

    return 1;
}

static int test_scheduler_stats(void)
{
    uint32_t switches = 0;
    uint32_t idle_pct = 0;

    ekk_sched_get_stats(0, &switches, &idle_pct);

    /* Just verify it doesn't crash and returns reasonable values */
    TEST_ASSERT(idle_pct <= 100, "Idle percentage should be <= 100");

    return 1;
}

/*===========================================================================*/
/* Wait Queue Tests                                                          */
/*===========================================================================*/

static int test_mutex_wait_queue(void)
{
    ekk_mutex_struct_t mtx;
    ekk_mutex_init(&mtx, "wait_test");

    /* Lock mutex */
    ekk_err_t err = ekk_mutex_lock(&mtx, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "First lock should succeed");

    /* Try to lock again with no-wait (should fail) */
    err = ekk_mutex_trylock(&mtx);
    TEST_ASSERT_EQ(err, EKK_ERR_STATE, "Recursive lock should fail");

    /* Unlock */
    err = ekk_mutex_unlock(&mtx);
    TEST_ASSERT_EQ(err, EKK_OK, "Unlock should succeed");

    /* Should be able to lock again */
    err = ekk_mutex_lock(&mtx, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Second lock should succeed");

    ekk_mutex_unlock(&mtx);
    return 1;
}

static int test_semaphore_binary(void)
{
    ekk_sem_struct_t sem;
    ekk_sem_init(&sem, "binary_sem", 1, 1);

    /* Take the semaphore */
    ekk_err_t err = ekk_sem_wait(&sem, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "First wait should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 0, "Count should be 0");

    /* Try to take again (should fail) */
    err = ekk_sem_trywait(&sem);
    TEST_ASSERT_EQ(err, EKK_ERR_BUSY, "Second wait should fail");

    /* Signal should succeed */
    err = ekk_sem_signal(&sem);
    TEST_ASSERT_EQ(err, EKK_OK, "Signal should succeed");
    TEST_ASSERT_EQ(ekk_sem_get_count(&sem), 1, "Count should be 1");

    /* Signal again should fail (max=1) */
    err = ekk_sem_signal(&sem);
    TEST_ASSERT_EQ(err, EKK_ERR_FULL, "Signal should fail when full");

    return 1;
}

static int test_event_wait_any(void)
{
    ekk_event_struct_t event;
    ekk_event_init(&event, "wait_any");

    /* Set some flags */
    ekk_event_set(&event, 0x05);

    /* Wait for any of bits 0x03 */
    uint32_t actual = 0;
    ekk_err_t err = ekk_event_wait(&event, 0x03, EKK_EVENT_ANY, false,
                                    EKK_NO_WAIT, &actual);
    TEST_ASSERT_EQ(err, EKK_OK, "Wait should succeed (bit 0 is set)");
    TEST_ASSERT_EQ(actual & 0x03, 0x01, "Should have matched bit 0");

    return 1;
}

static int test_event_wait_all(void)
{
    ekk_event_struct_t event;
    ekk_event_init(&event, "wait_all");

    /* Set only bit 0 */
    ekk_event_set(&event, 0x01);

    /* Wait for ALL of bits 0x03 (should timeout/fail) */
    ekk_err_t err = ekk_event_wait(&event, 0x03, EKK_EVENT_ALL, false,
                                    EKK_NO_WAIT, NULL);
    TEST_ASSERT_EQ(err, EKK_ERR_TIMEOUT, "Wait should timeout (not all bits set)");

    /* Now set bit 1 too */
    ekk_event_set(&event, 0x02);

    /* Wait for ALL should now succeed */
    uint32_t actual = 0;
    err = ekk_event_wait(&event, 0x03, EKK_EVENT_ALL, false,
                          EKK_NO_WAIT, &actual);
    TEST_ASSERT_EQ(err, EKK_OK, "Wait should succeed (all bits set)");
    TEST_ASSERT_EQ(actual, 0x03, "Should have matched both bits");

    return 1;
}

/*===========================================================================*/
/* Buffer Pool Tests                                                         */
/*===========================================================================*/

static int test_buffer_pool_init(void)
{
    ekk_err_t err = ekk_buffer_pool_init();
    TEST_ASSERT_EQ(err, EKK_OK, "Buffer pool init should succeed");

    return 1;
}

static int test_buffer_alloc_release(void)
{
    /* Allocate a buffer */
    ekk_buffer_t *buf = ekk_buffer_alloc(128);
    TEST_ASSERT(buf != NULL, "Buffer allocation should succeed");
    TEST_ASSERT(buf->data != NULL, "Buffer data should not be NULL");
    TEST_ASSERT_EQ(buf->ref_count, 1, "Ref count should be 1");

    /* Write some data */
    memset(buf->data, 0xAA, 128);
    buf->size = 128;

    /* Add reference */
    ekk_buffer_ref(buf);
    TEST_ASSERT_EQ(buf->ref_count, 2, "Ref count should be 2");

    /* Release once */
    ekk_buffer_release(buf);
    TEST_ASSERT_EQ(buf->ref_count, 1, "Ref count should be 1");

    /* Release again - should free */
    ekk_buffer_release(buf);
    /* Can't check ref_count after free */

    return 1;
}

static int test_buffer_pool_exhaustion(void)
{
    /* Allocate all buffers */
    ekk_buffer_t *buffers[20];
    int allocated = 0;

    for (int i = 0; i < 20; i++) {
        buffers[i] = ekk_buffer_alloc(64);
        if (buffers[i] == NULL) {
            break;
        }
        allocated++;
    }

    TEST_ASSERT(allocated > 0, "Should allocate at least one buffer");
    TEST_ASSERT(allocated <= 16, "Should not exceed pool size");

    /* Try one more - should fail */
    ekk_buffer_t *extra = ekk_buffer_alloc(64);
    TEST_ASSERT(extra == NULL, "Pool should be exhausted");

    /* Release all */
    for (int i = 0; i < allocated; i++) {
        ekk_buffer_release(buffers[i]);
    }

    /* Should be able to allocate again */
    ekk_buffer_t *buf = ekk_buffer_alloc(64);
    TEST_ASSERT(buf != NULL, "Should be able to allocate after release");
    ekk_buffer_release(buf);

    return 1;
}

/*===========================================================================*/
/* Reader-Writer Lock Tests                                                  */
/*===========================================================================*/

static int test_rwlock_read(void)
{
    ekk_rwlock_t rwlock;
    ekk_rwlock_init(&rwlock, "test_rwlock");

    /* Multiple readers should be allowed */
    ekk_err_t err = ekk_rwlock_rdlock(&rwlock, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "First read lock should succeed");

    err = ekk_rwlock_rdlock(&rwlock, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Second read lock should succeed");

    ekk_rwlock_rdunlock(&rwlock);
    ekk_rwlock_rdunlock(&rwlock);

    return 1;
}

static int test_rwlock_write(void)
{
    ekk_rwlock_t rwlock;
    ekk_rwlock_init(&rwlock, "test_rwlock");

    /* Write lock should be exclusive */
    ekk_err_t err = ekk_rwlock_wrlock(&rwlock, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_OK, "Write lock should succeed");

    /* Read lock should fail while write locked */
    err = ekk_rwlock_rdlock(&rwlock, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_ERR_BUSY, "Read lock should fail");

    /* Another write lock should fail */
    err = ekk_rwlock_wrlock(&rwlock, EKK_NO_WAIT);
    TEST_ASSERT_EQ(err, EKK_ERR_BUSY, "Second write lock should fail");

    ekk_rwlock_wrunlock(&rwlock);

    return 1;
}

/*===========================================================================*/
/* Main                                                                      */
/*===========================================================================*/

int main(int argc, char *argv[])
{
    (void)argc;
    (void)argv;

    printf("\n");
    printf("================================================\n");
    printf("  ek-kor RTOS Test Suite\n");
    printf("  Platform: Simulation\n");
    printf("================================================\n\n");
    fflush(stdout);

    printf("Step 1: Calling ekk_init()...\n");
    fflush(stdout);

    /* Initialize kernel */
    ekk_err_t err = ekk_init();
    if (err != EKK_OK) {
        printf("ERROR: Failed to initialize kernel\n");
        return 1;
    }

    printf("Step 2: Kernel initialized successfully\n");
    fflush(stdout);

    /* HAL Tests */
    printf("--- HAL Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_hal_init);
    RUN_TEST(test_hal_timing);
    RUN_TEST(test_hal_critical_section);
    RUN_TEST(test_hal_interrupts);
    printf("\n");
    fflush(stdout);

    /* Kernel Tests */
    printf("--- Kernel Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_kernel_version);
    RUN_TEST(test_kernel_state);
    RUN_TEST(test_kernel_time_conversion);
    printf("\n");
    fflush(stdout);

    /* Scheduler Tests */
    printf("--- Scheduler Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_scheduler_init);
    RUN_TEST(test_scheduler_lock_unlock);
    RUN_TEST(test_scheduler_ticks);
    RUN_TEST(test_scheduler_validation);
    RUN_TEST(test_scheduler_utilization);
    RUN_TEST(test_scheduler_stats);
    printf("\n");
    fflush(stdout);

    /* Task Tests */
    printf("--- Task Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_task_init);
    RUN_TEST(test_task_create_delete);
    RUN_TEST(test_task_suspend_resume);
    RUN_TEST(test_task_priority);
    RUN_TEST(test_task_lookup);
    printf("\n");
    fflush(stdout);

    /* Sync Tests */
    printf("--- Spinlock Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_spinlock);
    printf("\n");
    fflush(stdout);

    printf("--- Mutex Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_mutex_init);
    RUN_TEST(test_mutex_lock_unlock);
    RUN_TEST(test_mutex_trylock);
    RUN_TEST(test_mutex_wait_queue);
    printf("\n");
    fflush(stdout);

    printf("--- Semaphore Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_semaphore_init);
    RUN_TEST(test_semaphore_wait_signal);
    RUN_TEST(test_semaphore_trywait);
    RUN_TEST(test_semaphore_binary);
    printf("\n");
    fflush(stdout);

    printf("--- Event Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_event_flags);
    RUN_TEST(test_event_wait_any);
    RUN_TEST(test_event_wait_all);
    printf("\n");
    fflush(stdout);

    /* IPC Tests */
    printf("--- Queue Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_queue_create);
    RUN_TEST(test_queue_send_receive);
    RUN_TEST(test_queue_peek);
    RUN_TEST(test_queue_flush);
    printf("\n");
    fflush(stdout);

    /* Buffer Pool Tests */
    printf("--- Buffer Pool Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_buffer_pool_init);
    RUN_TEST(test_buffer_alloc_release);
    RUN_TEST(test_buffer_pool_exhaustion);
    printf("\n");
    fflush(stdout);

    /* Reader-Writer Lock Tests */
    printf("--- RW Lock Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_rwlock_read);
    RUN_TEST(test_rwlock_write);
    printf("\n");
    fflush(stdout);

    /* Summary */
    printf("================================================\n");
    printf("  Results: %d/%d tests passed\n", tests_passed, tests_run);
    if (tests_failed > 0) {
        printf("  FAILED: %d tests\n", tests_failed);
    }
    printf("================================================\n\n");
    fflush(stdout);

    return (tests_failed > 0) ? 1 : 0;
}
