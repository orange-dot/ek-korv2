/**
 * @file test_main.c
 * @brief JEZGRO Test Runner
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "../src/kernel/jezgro.h"
#include "../src/hal/hal.h"

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
        tests_run++; \
        if (test_func()) { \
            tests_passed++; \
            printf("  PASS\n"); \
        } else { \
            tests_failed++; \
        } \
    } while(0)

/*===========================================================================*/
/* Scheduler Tests                                                           */
/*===========================================================================*/

static int test_scheduler_init(void)
{
    scheduler_init();

    int ready, blocked;
    scheduler_get_stats(&ready, &blocked);

    TEST_ASSERT_EQ(ready, 0, "Ready queue should be empty after init");
    TEST_ASSERT_EQ(blocked, 0, "Blocked queue should be empty after init");

    return 1;
}

static int test_scheduler_edf_priority(void)
{
    scheduler_init();
    task_init();

    /* Create tasks with different deadlines */
    task_t *task1 = task_create("task1", NULL, NULL, 100, 0);
    task_t *task2 = task_create("task2", NULL, NULL, 50, 0);  /* Earlier deadline */
    task_t *task3 = task_create("task3", NULL, NULL, 200, 0);

    TEST_ASSERT(task1 != NULL, "Task1 creation failed");
    TEST_ASSERT(task2 != NULL, "Task2 creation failed");
    TEST_ASSERT(task3 != NULL, "Task3 creation failed");

    /* EDF should select task2 (earliest deadline) */
    task_t *next = scheduler_get_next();
    TEST_ASSERT(next != NULL, "scheduler_get_next returned NULL");
    TEST_ASSERT_EQ(next->id, task2->id, "EDF should select task with earliest deadline");

    /* Clean up */
    task_destroy(task1);
    task_destroy(task2);
    task_destroy(task3);

    return 1;
}

static int test_scheduler_deadline_miss(void)
{
    scheduler_init();
    task_init();

    /* Create task with very short deadline */
    task_t *task = task_create("deadline_test", NULL, NULL, 10, 0);
    TEST_ASSERT(task != NULL, "Task creation failed");

    /* Advance time past deadline */
    scheduler_tick(50);

    TEST_ASSERT(task->deadline_missed == true, "Deadline miss not detected");

    int missed = scheduler_check_deadlines();
    TEST_ASSERT(missed >= 1, "Check deadlines should report at least 1 miss");

    task_destroy(task);
    return 1;
}

static int test_scheduler_yield(void)
{
    scheduler_init();
    task_init();

    task_t *task1 = task_create("yield1", NULL, NULL, 100, 0);
    task_t *task2 = task_create("yield2", NULL, NULL, 200, 0);

    TEST_ASSERT(task1 != NULL, "Task1 creation failed");
    TEST_ASSERT(task2 != NULL, "Task2 creation failed");

    /* Get first task */
    task_t *current = scheduler_get_next();
    TEST_ASSERT_EQ(current->id, task1->id, "Should start with earliest deadline");

    /* Yield should allow reschedule */
    scheduler_yield();
    current = scheduler_get_current();
    /* After yield with same deadlines, task1 should still be selected (no change) */
    TEST_ASSERT(current != NULL, "Current task should not be NULL after yield");

    task_destroy(task1);
    task_destroy(task2);
    return 1;
}

/*===========================================================================*/
/* IPC Tests                                                                 */
/*===========================================================================*/

static int test_ipc_init(void)
{
    ipc_init();

    uint32_t sent, recv, dropped;
    ipc_get_stats(&sent, &recv, &dropped);

    TEST_ASSERT_EQ(sent, 0, "Sent count should be 0 after init");
    TEST_ASSERT_EQ(recv, 0, "Received count should be 0 after init");
    TEST_ASSERT_EQ(dropped, 0, "Dropped count should be 0 after init");

    return 1;
}

static int test_ipc_send_receive(void)
{
    scheduler_init();
    task_init();
    ipc_init();

    /* Create a task to be the sender */
    task_t *task = task_create("ipc_test", NULL, NULL, 1000, 0);
    TEST_ASSERT(task != NULL, "Task creation failed");

    /* Make it current */
    scheduler_get_next();

    /* Send message to self (for testing) */
    uint8_t send_data[] = {0xDE, 0xAD, 0xBE, 0xEF};
    int ret = ipc_send(task->id, IPC_MSG_TYPE_DATA, send_data, sizeof(send_data));
    TEST_ASSERT_EQ(ret, 0, "ipc_send should return 0");

    /* Check pending */
    int pending = ipc_pending();
    TEST_ASSERT_EQ(pending, 1, "Should have 1 pending message");

    /* Receive message */
    uint8_t src, type;
    uint8_t recv_buf[64];
    int len = ipc_receive(&src, &type, recv_buf, sizeof(recv_buf));

    TEST_ASSERT_EQ(len, 4, "Received length should be 4");
    TEST_ASSERT_EQ(type, IPC_MSG_TYPE_DATA, "Message type should match");
    TEST_ASSERT(memcmp(recv_buf, send_data, 4) == 0, "Data should match");

    task_destroy(task);
    return 1;
}

static int test_ipc_async(void)
{
    scheduler_init();
    task_init();
    ipc_init();

    task_t *task = task_create("async_test", NULL, NULL, 1000, 0);
    scheduler_get_next();

    /* Send multiple async messages */
    for (int i = 0; i < 5; i++) {
        uint8_t data = i;
        int ret = ipc_send_async(task->id, IPC_MSG_TYPE_NOTIFY, &data, 1);
        TEST_ASSERT_EQ(ret, 0, "Async send should succeed");
    }

    TEST_ASSERT_EQ(ipc_pending(), 5, "Should have 5 pending messages");

    /* Receive all */
    for (int i = 0; i < 5; i++) {
        uint8_t src, type, data;
        int len = ipc_receive_noblock(&src, &type, &data, 1);
        TEST_ASSERT_EQ(len, 1, "Should receive 1 byte");
        TEST_ASSERT_EQ(data, i, "Data should match sequence");
    }

    task_destroy(task);
    return 1;
}

/*===========================================================================*/
/* Task Tests                                                                */
/*===========================================================================*/

static int test_task_create_destroy(void)
{
    scheduler_init();
    task_init();

    int initial_count = task_count();

    task_t *task = task_create("test_task", NULL, NULL, 100, 0);
    TEST_ASSERT(task != NULL, "Task should be created");
    TEST_ASSERT_EQ(task_count(), initial_count + 1, "Task count should increase");

    task_destroy(task);
    TEST_ASSERT_EQ(task_count(), initial_count, "Task count should decrease after destroy");

    return 1;
}

static int test_task_suspend_resume(void)
{
    scheduler_init();
    task_init();

    task_t *task = task_create("suspend_test", NULL, NULL, 100, 0);
    TEST_ASSERT(task != NULL, "Task should be created");
    TEST_ASSERT_EQ(task->state, TASK_STATE_READY, "Initial state should be READY");

    task_suspend(task);
    TEST_ASSERT_EQ(task->state, TASK_STATE_SUSPENDED, "State should be SUSPENDED");

    task_resume(task);
    TEST_ASSERT_EQ(task->state, TASK_STATE_READY, "State should be READY after resume");

    task_destroy(task);
    return 1;
}

static int test_task_lookup(void)
{
    scheduler_init();
    task_init();

    task_t *task = task_create("lookup_test", NULL, NULL, 100, 0);
    TEST_ASSERT(task != NULL, "Task should be created");

    task_t *found_by_id = task_get_by_id(task->id);
    TEST_ASSERT_EQ(found_by_id, task, "Should find task by ID");

    task_t *found_by_name = task_get_by_name("lookup_test");
    TEST_ASSERT_EQ(found_by_name, task, "Should find task by name");

    task_t *not_found = task_get_by_name("nonexistent");
    TEST_ASSERT(not_found == NULL, "Should not find nonexistent task");

    task_destroy(task);
    return 1;
}

/*===========================================================================*/
/* HAL Tests                                                                 */
/*===========================================================================*/

static int test_hal_init(void)
{
    int ret = hal_init();
    TEST_ASSERT_EQ(ret, 0, "HAL init should succeed");

    const char *platform = hal_get_platform();
    TEST_ASSERT(platform != NULL, "Platform name should not be NULL");
    TEST_ASSERT(strlen(platform) > 0, "Platform name should not be empty");

    return 1;
}

static int test_hal_timing(void)
{
    uint32_t t1 = hal_get_time_ms();
    hal_delay_ms(10);
    uint32_t t2 = hal_get_time_ms();

    TEST_ASSERT(t2 >= t1, "Time should not go backwards");
    /* Allow some tolerance */
    TEST_ASSERT(t2 - t1 >= 5, "Should have elapsed at least 5ms");

    return 1;
}

static int test_hal_can(void)
{
    int ret = hal_can_init(0, 500000, 5000000);
    TEST_ASSERT_EQ(ret, 0, "CAN init should succeed");

    hal_can_msg_t tx_msg = {
        .id = 0x123,
        .len = 4,
        .data = {0x11, 0x22, 0x33, 0x44},
        .fd = true,
        .brs = true
    };

    ret = hal_can_send(0, &tx_msg);
    TEST_ASSERT_EQ(ret, 0, "CAN send should succeed");

    /* In simulation, message is looped back */
    hal_can_msg_t rx_msg;
    ret = hal_can_receive(0, &rx_msg);
    TEST_ASSERT_EQ(ret, 0, "CAN receive should succeed (loopback)");
    TEST_ASSERT_EQ(rx_msg.id, 0x123, "Message ID should match");
    TEST_ASSERT(memcmp(rx_msg.data, tx_msg.data, 4) == 0, "Data should match");

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
    printf("  JEZGRO Pre-Hardware Test Suite\n");
    printf("  Platform: %s\n", HAL_PLATFORM_NAME);
    printf("  Version: %s\n", JEZGRO_VERSION_STRING);
    printf("================================================\n\n");

    /* HAL Tests */
    printf("--- HAL Tests ---\n");
    RUN_TEST(test_hal_init);
    RUN_TEST(test_hal_timing);
    RUN_TEST(test_hal_can);
    printf("\n");

    /* Scheduler Tests */
    printf("--- Scheduler Tests ---\n");
    RUN_TEST(test_scheduler_init);
    RUN_TEST(test_scheduler_edf_priority);
    RUN_TEST(test_scheduler_deadline_miss);
    RUN_TEST(test_scheduler_yield);
    printf("\n");

    /* IPC Tests */
    printf("--- IPC Tests ---\n");
    RUN_TEST(test_ipc_init);
    RUN_TEST(test_ipc_send_receive);
    RUN_TEST(test_ipc_async);
    printf("\n");

    /* Task Tests */
    printf("--- Task Tests ---\n");
    RUN_TEST(test_task_create_destroy);
    RUN_TEST(test_task_suspend_resume);
    RUN_TEST(test_task_lookup);
    printf("\n");

    /* Summary */
    printf("================================================\n");
    printf("  Results: %d/%d tests passed\n", tests_passed, tests_run);
    if (tests_failed > 0) {
        printf("  FAILED: %d tests\n", tests_failed);
    }
    printf("================================================\n\n");

    return (tests_failed > 0) ? 1 : 0;
}
