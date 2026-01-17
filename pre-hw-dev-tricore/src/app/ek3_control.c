/**
 * @file ek3_control.c
 * @brief EK3 Module Control Application (Portable)
 *
 * This application demonstrates portable JEZGRO code that runs on:
 *   - STM32G474 (single EK3 module)
 *   - TC397XP (fleet coordinator)
 *
 * The same code compiles and runs on both platforms using the
 * compatibility layer (jezgro_compat.h).
 *
 * Architecture:
 *   - STM32: Controls single 3.3kW EK3 module
 *   - TC397: Coordinates multiple EK3 modules via CAN-FD
 */

#include "jezgro_compat.h"

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/** CAN-FD bitrate (arbitration) */
#define CAN_BITRATE             500000

/** CAN-FD data bitrate */
#define CAN_DATA_BITRATE        5000000

/** CAN message IDs */
#define CAN_ID_HEARTBEAT        0x100
#define CAN_ID_STATUS           0x101
#define CAN_ID_COMMAND          0x200
#define CAN_ID_POWER_SETPOINT   0x201

/** Task periods (ms) */
#define PERIOD_CONTROL_MS       1       /* 1 kHz control loop */
#define PERIOD_CAN_TX_MS        10      /* 100 Hz CAN transmit */
#define PERIOD_CAN_RX_MS        1       /* 1 kHz CAN receive */
#define PERIOD_MONITOR_MS       100     /* 10 Hz monitoring */

/** Task priorities */
#define PRIO_CONTROL            200     /* Highest - PWM control */
#define PRIO_CAN_RX             180     /* High - receive commands */
#define PRIO_CAN_TX             160     /* Medium - send status */
#define PRIO_MONITOR            120     /* Low - diagnostics */

/* ==========================================================================
 * Module State
 * ========================================================================== */

/**
 * @brief EK3 module state
 */
typedef struct {
    /* Identity */
    uint8_t module_id;              /**< Module ID (0-255) */
    bool    is_coordinator;         /**< True if TC397 coordinator */

    /* Power control */
    uint32_t power_setpoint_w;      /**< Target power (watts) */
    uint32_t power_actual_w;        /**< Measured power (watts) */
    uint32_t voltage_mv;            /**< DC link voltage (mV) */
    uint32_t current_ma;            /**< DC current (mA) */

    /* Temperature */
    int16_t temp_mosfet_c;          /**< MOSFET temperature (°C) */
    int16_t temp_inductor_c;        /**< Inductor temperature (°C) */
    int16_t temp_ambient_c;         /**< Ambient temperature (°C) */

    /* Status */
    bool    enabled;                /**< Module enabled */
    bool    fault;                  /**< Fault active */
    uint32_t fault_code;            /**< Fault code */
    uint32_t uptime_s;              /**< Uptime in seconds */

    /* Communication */
    uint32_t can_rx_count;          /**< CAN messages received */
    uint32_t can_tx_count;          /**< CAN messages transmitted */
    uint32_t heartbeat_count;       /**< Heartbeats sent */
} ek3_state_t;

static ek3_state_t g_state = {
    .module_id = 0,
    .is_coordinator = false,
    .power_setpoint_w = 0,
    .enabled = false,
    .fault = false,
};

/* ==========================================================================
 * Control Task
 * ========================================================================== */

/**
 * @brief Power control loop (1 kHz)
 *
 * On STM32: Directly controls PWM for LLC converter
 * On TC397: Aggregates power from all modules
 */
static void control_task(void *arg)
{
    (void)arg;
    jezgro_tick_t prev_wake = jz_get_ticks();

    jz_debug_puts("[CTRL] Control task started\r\n");

    while (1) {
        /* Periodic delay (accurate timing) */
        jz_task_delay_until(&prev_wake, jz_ms_to_ticks(PERIOD_CONTROL_MS));

        if (!g_state.enabled || g_state.fault) {
            continue;
        }

#if defined(JEZGRO_PLATFORM_STM32)
        /* STM32: Run LLC control algorithm */
        /* TODO: Implement PID control for LLC converter */
        /* For now, simulate power tracking */
        if (g_state.power_actual_w < g_state.power_setpoint_w) {
            g_state.power_actual_w += 10;  /* Ramp up */
        } else if (g_state.power_actual_w > g_state.power_setpoint_w) {
            g_state.power_actual_w -= 10;  /* Ramp down */
        }
#elif defined(JEZGRO_PLATFORM_TRICORE)
        /* TC397: Aggregate power from all modules via CAN */
        /* Control is distributed - just monitor here */
#endif
    }
}

/* ==========================================================================
 * CAN Receive Task
 * ========================================================================== */

/**
 * @brief CAN receive task
 *
 * Processes incoming CAN messages:
 *   - STM32: Commands from coordinator
 *   - TC397: Status from EK3 modules
 */
static void can_rx_task(void *arg)
{
    (void)arg;
    jz_can_msg_t msg;

    jz_debug_puts("[CAN-RX] CAN receive task started\r\n");

    while (1) {
        /* Poll for CAN messages */
        if (jz_can_receive(0, &msg) == JEZGRO_OK) {
            g_state.can_rx_count++;

            switch (msg.id) {
            case CAN_ID_COMMAND:
                /* Enable/disable command */
                if (msg.len >= 1) {
                    g_state.enabled = (msg.data[0] != 0);
                    jz_debug_puts(g_state.enabled ? "[CAN-RX] Enabled\r\n" : "[CAN-RX] Disabled\r\n");
                }
                break;

            case CAN_ID_POWER_SETPOINT:
                /* Power setpoint (32-bit, little-endian) */
                if (msg.len >= 4) {
                    g_state.power_setpoint_w = msg.data[0] |
                                               (msg.data[1] << 8) |
                                               (msg.data[2] << 16) |
                                               (msg.data[3] << 24);
                }
                break;

            case CAN_ID_HEARTBEAT:
                /* Heartbeat from coordinator or module */
                /* Update watchdog */
                break;

            case CAN_ID_STATUS:
#if defined(JEZGRO_PLATFORM_TRICORE)
                /* TC397: Status from EK3 module */
                /* Parse and aggregate */
#endif
                break;
            }
        }

        jz_task_delay(jz_ms_to_ticks(PERIOD_CAN_RX_MS));
    }
}

/* ==========================================================================
 * CAN Transmit Task
 * ========================================================================== */

/**
 * @brief CAN transmit task
 *
 * Sends periodic status messages:
 *   - STM32: Module status to coordinator
 *   - TC397: Heartbeat to all modules
 */
static void can_tx_task(void *arg)
{
    (void)arg;
    jz_can_msg_t msg;
    jezgro_tick_t prev_wake = jz_get_ticks();

    jz_debug_puts("[CAN-TX] CAN transmit task started\r\n");

    while (1) {
        jz_task_delay_until(&prev_wake, jz_ms_to_ticks(PERIOD_CAN_TX_MS));

        /* Send heartbeat */
        msg.id = CAN_ID_HEARTBEAT;
        msg.len = 4;
        msg.extended = false;
        msg.fd = true;
        msg.brs = true;
        msg.data[0] = g_state.module_id;
        msg.data[1] = g_state.enabled ? 1 : 0;
        msg.data[2] = g_state.fault ? 1 : 0;
        msg.data[3] = (uint8_t)(g_state.heartbeat_count & 0xFF);

        if (jz_can_send(0, &msg) == JEZGRO_OK) {
            g_state.can_tx_count++;
            g_state.heartbeat_count++;
        }

#if defined(JEZGRO_PLATFORM_STM32)
        /* STM32: Send detailed status */
        msg.id = CAN_ID_STATUS;
        msg.len = 16;
        msg.data[0] = g_state.module_id;
        msg.data[1] = g_state.enabled ? 1 : 0;
        msg.data[2] = g_state.fault ? 1 : 0;
        msg.data[3] = 0;  /* Reserved */
        /* Power (32-bit LE) */
        msg.data[4] = (g_state.power_actual_w >> 0) & 0xFF;
        msg.data[5] = (g_state.power_actual_w >> 8) & 0xFF;
        msg.data[6] = (g_state.power_actual_w >> 16) & 0xFF;
        msg.data[7] = (g_state.power_actual_w >> 24) & 0xFF;
        /* Voltage (16-bit LE) */
        msg.data[8] = (g_state.voltage_mv >> 0) & 0xFF;
        msg.data[9] = (g_state.voltage_mv >> 8) & 0xFF;
        /* Current (16-bit LE) */
        msg.data[10] = (g_state.current_ma >> 0) & 0xFF;
        msg.data[11] = (g_state.current_ma >> 8) & 0xFF;
        /* Temperature */
        msg.data[12] = (int8_t)g_state.temp_mosfet_c;
        msg.data[13] = (int8_t)g_state.temp_inductor_c;
        msg.data[14] = (int8_t)g_state.temp_ambient_c;
        msg.data[15] = 0;  /* Reserved */

        jz_can_send(0, &msg);
#endif
    }
}

/* ==========================================================================
 * Monitor Task
 * ========================================================================== */

/**
 * @brief System monitor task
 *
 * Periodic diagnostics and status output.
 */
static void monitor_task(void *arg)
{
    (void)arg;
    jezgro_tick_t prev_wake = jz_get_ticks();

    jz_debug_puts("[MON] Monitor task started\r\n");

    while (1) {
        jz_task_delay_until(&prev_wake, jz_ms_to_ticks(PERIOD_MONITOR_MS));

        g_state.uptime_s = jz_ticks_to_ms(jz_get_ticks()) / 1000;

        /* Periodic status output */
        if ((g_state.uptime_s % 5) == 0) {
            jz_debug_puts("[MON] Platform: ");
            jz_debug_puts(jz_get_platform());
            jz_debug_puts(", Cores: ");
            jz_debug_hex(jz_get_num_cores());
            jz_debug_puts(", Uptime: ");
            jz_debug_hex(g_state.uptime_s);
            jz_debug_puts("s\r\n");
        }
    }
}

/* ==========================================================================
 * Application Entry Point
 * ========================================================================== */

/**
 * @brief EK3 application initialization
 *
 * Called from platform-specific main() after kernel init.
 */
void ek3_app_init(uint8_t module_id)
{
    g_state.module_id = module_id;
    g_state.is_coordinator = jz_is_multicore();

    jz_debug_puts("\r\n");
    jz_debug_puts("==============================\r\n");
    jz_debug_puts("  EK3 Control Application\r\n");
    jz_debug_puts("  Platform: ");
    jz_debug_puts(jz_get_platform());
    jz_debug_puts("\r\n");
    jz_debug_puts("  Module ID: ");
    jz_debug_hex(module_id);
    jz_debug_puts("\r\n");
    if (g_state.is_coordinator) {
        jz_debug_puts("  Role: Fleet Coordinator\r\n");
    } else {
        jz_debug_puts("  Role: EK3 Module\r\n");
    }
    jz_debug_puts("==============================\r\n\r\n");

    /* Initialize CAN-FD */
    if (jz_can_init(0, CAN_BITRATE, CAN_DATA_BITRATE) != JEZGRO_OK) {
        jz_debug_puts("[ERR] CAN init failed!\r\n");
    }

    /* Create tasks */
    jezgro_task_config_t cfg = JEZGRO_TASK_CONFIG_DEFAULT;

    /* Control task - highest priority */
    cfg.name = "control";
    cfg.func = control_task;
    cfg.priority = PRIO_CONTROL;
    cfg.stack_size = 1024;
    cfg.flags = JEZGRO_TASK_FLAG_PERIODIC | JEZGRO_TASK_FLAG_REALTIME;
    cfg.period_us = PERIOD_CONTROL_MS * 1000;
#if defined(JEZGRO_MULTI_CORE)
    cfg.core_affinity = 1;  /* Safety core on TC397 */
#endif
    jz_task_create(&cfg, NULL);

    /* CAN receive task */
    cfg.name = "can_rx";
    cfg.func = can_rx_task;
    cfg.priority = PRIO_CAN_RX;
    cfg.flags = JEZGRO_TASK_FLAG_NONE;
    cfg.period_us = 0;
#if defined(JEZGRO_MULTI_CORE)
    cfg.core_affinity = 3;  /* CAN core on TC397 */
#endif
    jz_task_create(&cfg, NULL);

    /* CAN transmit task */
    cfg.name = "can_tx";
    cfg.func = can_tx_task;
    cfg.priority = PRIO_CAN_TX;
    cfg.flags = JEZGRO_TASK_FLAG_PERIODIC;
    cfg.period_us = PERIOD_CAN_TX_MS * 1000;
#if defined(JEZGRO_MULTI_CORE)
    cfg.core_affinity = 3;  /* CAN core on TC397 */
#endif
    jz_task_create(&cfg, NULL);

    /* Monitor task - lowest priority */
    cfg.name = "monitor";
    cfg.func = monitor_task;
    cfg.priority = PRIO_MONITOR;
    cfg.flags = JEZGRO_TASK_FLAG_NONE;
    cfg.period_us = 0;
#if defined(JEZGRO_MULTI_CORE)
    cfg.core_affinity = 4;  /* Performance core on TC397 */
#endif
    jz_task_create(&cfg, NULL);

    jz_debug_puts("[INIT] Tasks created\r\n");
}

/**
 * @brief Get module state (for external access)
 */
const ek3_state_t* ek3_get_state(void)
{
    return &g_state;
}

/**
 * @brief Set power setpoint
 */
void ek3_set_power(uint32_t watts)
{
    g_state.power_setpoint_w = watts;
}

/**
 * @brief Enable/disable module
 */
void ek3_enable(bool enable)
{
    g_state.enabled = enable;
}
