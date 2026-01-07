/**
 * @file ek3_control.h
 * @brief EK3 Module Control Application API
 *
 * Portable API for EK3 control that works on both:
 *   - STM32G474 (single module)
 *   - TC397XP (fleet coordinator)
 */

#ifndef EK3_CONTROL_H
#define EK3_CONTROL_H

#include "jezgro_common.h"

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Module State (read-only access)
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

/* ==========================================================================
 * API
 * ========================================================================== */

/**
 * @brief Initialize EK3 application
 *
 * Creates all application tasks. Call after jz_init().
 *
 * @param module_id Module ID (0-255)
 */
void ek3_app_init(uint8_t module_id);

/**
 * @brief Get module state
 *
 * @return Pointer to read-only state structure
 */
const ek3_state_t* ek3_get_state(void);

/**
 * @brief Set power setpoint
 *
 * @param watts Target power in watts
 */
void ek3_set_power(uint32_t watts);

/**
 * @brief Enable/disable module
 *
 * @param enable true to enable, false to disable
 */
void ek3_enable(bool enable);

#ifdef __cplusplus
}
#endif

#endif /* EK3_CONTROL_H */
