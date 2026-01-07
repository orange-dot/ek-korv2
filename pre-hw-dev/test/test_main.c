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
    printf("\n");
    fflush(stdout);

    printf("--- Semaphore Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_semaphore_init);
    RUN_TEST(test_semaphore_wait_signal);
    RUN_TEST(test_semaphore_trywait);
    printf("\n");
    fflush(stdout);

    printf("--- Event Tests ---\n");
    fflush(stdout);
    RUN_TEST(test_event_flags);
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
