/**
 * @file hal_sim.c
 * @brief JEZGRO HAL - Simulation Implementation (PC)
 *
 * This HAL implementation runs on a host PC for testing
 * without actual hardware.
 */

#ifdef JEZGRO_SIM

#include "hal.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#ifdef _WIN32
#include <windows.h>
#else
#include <unistd.h>
#include <sys/time.h>
#endif

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

static uint64_t start_time_us = 0;

/* Simulated CAN message queue */
#define SIM_CAN_QUEUE_SIZE 32
static struct {
    hal_can_msg_t msgs[SIM_CAN_QUEUE_SIZE];
    int head;
    int tail;
    int count;
} sim_can_rx[4];

/*===========================================================================*/
/* Helper Functions                                                          */
/*===========================================================================*/

static uint64_t get_realtime_us(void)
{
#ifdef _WIN32
    LARGE_INTEGER freq, count;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&count);
    return (uint64_t)(count.QuadPart * 1000000 / freq.QuadPart);
#else
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (uint64_t)tv.tv_sec * 1000000 + tv.tv_usec;
#endif
}

/*===========================================================================*/
/* System Initialization                                                     */
/*===========================================================================*/

int hal_init(void)
{
    printf("[HAL-SIM] Initializing simulation HAL\n");

    start_time_us = get_realtime_us();

    /* Initialize CAN queues */
    memset(sim_can_rx, 0, sizeof(sim_can_rx));

    printf("[HAL-SIM] HAL initialized (platform: %s)\n", HAL_PLATFORM_NAME);
    return 0;
}

const char *hal_get_platform(void)
{
    return HAL_PLATFORM_NAME;
}

void hal_reset(void)
{
    printf("[HAL-SIM] System reset requested\n");
    exit(0);
}

/*===========================================================================*/
/* Timing                                                                    */
/*===========================================================================*/

uint64_t hal_get_time_us(void)
{
    return get_realtime_us() - start_time_us;
}

uint32_t hal_get_time_ms(void)
{
    return (uint32_t)(hal_get_time_us() / 1000);
}

void hal_delay_us(uint32_t us)
{
#ifdef _WIN32
    /* Windows doesn't have usleep, use Sleep for ms granularity */
    if (us >= 1000) {
        Sleep(us / 1000);
    }
#else
    usleep(us);
#endif
}

void hal_delay_ms(uint32_t ms)
{
#ifdef _WIN32
    Sleep(ms);
#else
    usleep(ms * 1000);
#endif
}

int hal_systick_init(uint32_t tick_hz)
{
    printf("[HAL-SIM] SysTick configured for %u Hz\n", tick_hz);
    return 0;
}

/*===========================================================================*/
/* Interrupts (simulated)                                                    */
/*===========================================================================*/

static uint32_t interrupt_state = 1; /* 1 = enabled */

uint32_t hal_disable_interrupts(void)
{
    uint32_t prev = interrupt_state;
    interrupt_state = 0;
    return prev;
}

void hal_enable_interrupts(void)
{
    interrupt_state = 1;
}

void hal_restore_interrupts(uint32_t state)
{
    interrupt_state = state;
}

/*===========================================================================*/
/* MPU (simulated)                                                           */
/*===========================================================================*/

static hal_mpu_region_t mpu_regions[16];
static bool mpu_enabled = false;

int hal_mpu_init(void)
{
    printf("[HAL-SIM] MPU initialized (simulated)\n");
    memset(mpu_regions, 0, sizeof(mpu_regions));
    return 0;
}

int hal_mpu_configure_region(const hal_mpu_region_t *region)
{
    if (region == NULL || region->region_num >= 16) {
        return -1;
    }

    mpu_regions[region->region_num] = *region;
    printf("[HAL-SIM] MPU region %d: base=0x%08X, size=%u\n",
           region->region_num, region->base_addr, region->size);

    return 0;
}

void hal_mpu_enable(void)
{
    mpu_enabled = true;
    printf("[HAL-SIM] MPU enabled\n");
}

void hal_mpu_disable(void)
{
    mpu_enabled = false;
    printf("[HAL-SIM] MPU disabled\n");
}

/*===========================================================================*/
/* CAN-FD (simulated with loopback)                                          */
/*===========================================================================*/

int hal_can_init(uint8_t instance, uint32_t bitrate, uint32_t data_bitrate)
{
    if (instance >= 4) return -1;

    printf("[HAL-SIM] CAN%d initialized: %u/%u bps\n",
           instance, bitrate, data_bitrate);

    memset(&sim_can_rx[instance], 0, sizeof(sim_can_rx[instance]));
    return 0;
}

int hal_can_send(uint8_t instance, const hal_can_msg_t *msg)
{
    if (instance >= 4 || msg == NULL) return -1;

    printf("[HAL-SIM] CAN%d TX: ID=0x%03X, len=%d, data=[",
           instance, msg->id, msg->len);
    for (int i = 0; i < msg->len && i < 8; i++) {
        printf("%02X ", msg->data[i]);
    }
    printf("]\n");

    /* Loopback: put in RX queue for testing */
    if (sim_can_rx[instance].count < SIM_CAN_QUEUE_SIZE) {
        sim_can_rx[instance].msgs[sim_can_rx[instance].tail] = *msg;
        sim_can_rx[instance].tail =
            (sim_can_rx[instance].tail + 1) % SIM_CAN_QUEUE_SIZE;
        sim_can_rx[instance].count++;
    }

    return 0;
}

int hal_can_receive(uint8_t instance, hal_can_msg_t *msg)
{
    if (instance >= 4 || msg == NULL) return -1;

    if (sim_can_rx[instance].count == 0) {
        return -1; /* No message */
    }

    *msg = sim_can_rx[instance].msgs[sim_can_rx[instance].head];
    sim_can_rx[instance].head =
        (sim_can_rx[instance].head + 1) % SIM_CAN_QUEUE_SIZE;
    sim_can_rx[instance].count--;

    return 0;
}

int hal_can_set_filter(uint8_t instance, uint32_t filter_id, uint32_t mask)
{
    printf("[HAL-SIM] CAN%d filter: ID=0x%03X, mask=0x%03X\n",
           instance, filter_id, mask);
    return 0;
}

/*===========================================================================*/
/* UART (to stdout)                                                          */
/*===========================================================================*/

int hal_uart_init(uint8_t instance, uint32_t baudrate)
{
    printf("[HAL-SIM] UART%d initialized: %u baud\n", instance, baudrate);
    return 0;
}

void hal_uart_putc(uint8_t instance, char byte)
{
    (void)instance;
    putchar(byte);
}

void hal_uart_puts(uint8_t instance, const char *str)
{
    (void)instance;
    printf("%s", str);
}

int hal_uart_getc(uint8_t instance)
{
    (void)instance;
    /* Non-blocking stdin read would go here */
    return -1;
}

/*===========================================================================*/
/* GPIO (simulated)                                                          */
/*===========================================================================*/

static uint8_t gpio_state[16][16]; /* [port][pin] */

int hal_gpio_config(uint8_t port, uint8_t pin, hal_gpio_mode_t mode)
{
    if (port >= 16 || pin >= 16) return -1;

    printf("[HAL-SIM] GPIO P%d.%d configured as %d\n", port, pin, mode);
    return 0;
}

void hal_gpio_write(uint8_t port, uint8_t pin, uint8_t value)
{
    if (port >= 16 || pin >= 16) return;
    gpio_state[port][pin] = value ? 1 : 0;
}

uint8_t hal_gpio_read(uint8_t port, uint8_t pin)
{
    if (port >= 16 || pin >= 16) return 0;
    return gpio_state[port][pin];
}

void hal_gpio_toggle(uint8_t port, uint8_t pin)
{
    if (port >= 16 || pin >= 16) return;
    gpio_state[port][pin] ^= 1;
}

/*===========================================================================*/
/* Context Switching (simulated - not real context switch)                   */
/*===========================================================================*/

uint32_t hal_context_init(void *stack_top, void (*entry)(void *), void *arg)
{
    (void)stack_top;
    (void)entry;
    (void)arg;

    /* In simulation, we don't do real context switches */
    printf("[HAL-SIM] Context initialized (simulated)\n");
    return 0;
}

void hal_context_switch(uint32_t *current_sp, uint32_t next_sp)
{
    (void)current_sp;
    (void)next_sp;
    /* In simulation, context switch is a no-op */
}

void hal_trigger_context_switch(void)
{
    /* In simulation, just call scheduler directly */
}

#endif /* JEZGRO_SIM */
