/**
 * @file hal.h
 * @brief JEZGRO Hardware Abstraction Layer Interface
 *
 * This HAL provides a portable interface for JEZGRO across:
 * - Simulation (PC)
 * - STM32G474
 * - Infineon AURIX TC375/TC397
 */

#ifndef HAL_H
#define HAL_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

/*===========================================================================*/
/* Platform Detection                                                        */
/*===========================================================================*/

#if defined(JEZGRO_SIM)
    #define HAL_PLATFORM_SIM        1
    #define HAL_PLATFORM_NAME       "Simulation"
#elif defined(STM32G474xx)
    #define HAL_PLATFORM_STM32      1
    #define HAL_PLATFORM_NAME       "STM32G474"
#elif defined(TC375) || defined(TC397)
    #define HAL_PLATFORM_AURIX      1
    #define HAL_PLATFORM_NAME       "AURIX TC3xx"
#else
    #error "Unknown platform - define JEZGRO_SIM, STM32G474xx, or TC375/TC397"
#endif

/*===========================================================================*/
/* System Initialization                                                     */
/*===========================================================================*/

/**
 * @brief Initialize hardware
 * @return 0 on success
 */
int hal_init(void);

/**
 * @brief Get platform name
 * @return Platform name string
 */
const char *hal_get_platform(void);

/**
 * @brief System reset
 */
void hal_reset(void);

/*===========================================================================*/
/* Timing                                                                    */
/*===========================================================================*/

/**
 * @brief Get system time in microseconds
 * @return Microseconds since boot
 */
uint64_t hal_get_time_us(void);

/**
 * @brief Get system time in milliseconds
 * @return Milliseconds since boot
 */
uint32_t hal_get_time_ms(void);

/**
 * @brief Delay for specified microseconds
 * @param us Microseconds to delay
 */
void hal_delay_us(uint32_t us);

/**
 * @brief Delay for specified milliseconds
 * @param ms Milliseconds to delay
 */
void hal_delay_ms(uint32_t ms);

/**
 * @brief Configure system tick timer
 * @param tick_hz Tick frequency in Hz
 * @return 0 on success
 */
int hal_systick_init(uint32_t tick_hz);

/**
 * @brief Increment HAL system tick counter
 *
 * Call this from your SysTick_Handler to keep HAL timing functions working.
 */
void hal_systick_increment(void);

/*===========================================================================*/
/* Interrupts                                                                */
/*===========================================================================*/

/**
 * @brief Disable all interrupts
 * @return Previous interrupt state
 */
uint32_t hal_disable_interrupts(void);

/**
 * @brief Enable all interrupts
 */
void hal_enable_interrupts(void);

/**
 * @brief Restore interrupt state
 * @param state State from hal_disable_interrupts()
 */
void hal_restore_interrupts(uint32_t state);

/*===========================================================================*/
/* Memory Protection Unit (MPU)                                              */
/*===========================================================================*/

/** MPU region configuration */
typedef struct {
    uint32_t base_addr;     /**< Region base address */
    uint32_t size;          /**< Region size */
    uint8_t  region_num;    /**< Region number (0-7 for CM4, 0-15 for AURIX) */
    uint8_t  access;        /**< Access permissions */
    bool     executable;    /**< Execute permission */
    bool     cacheable;     /**< Cacheable */
} hal_mpu_region_t;

/** MPU access permissions */
#define HAL_MPU_NO_ACCESS       0
#define HAL_MPU_PRIV_RW         1
#define HAL_MPU_PRIV_RW_USER_RO 2
#define HAL_MPU_FULL_ACCESS     3
#define HAL_MPU_PRIV_RO         5
#define HAL_MPU_RO              6

/**
 * @brief Initialize MPU
 * @return 0 on success
 */
int hal_mpu_init(void);

/**
 * @brief Configure MPU region
 * @param region Region configuration
 * @return 0 on success
 */
int hal_mpu_configure_region(const hal_mpu_region_t *region);

/**
 * @brief Enable MPU
 */
void hal_mpu_enable(void);

/**
 * @brief Disable MPU
 */
void hal_mpu_disable(void);

/*===========================================================================*/
/* CAN-FD                                                                    */
/*===========================================================================*/

/** CAN message */
typedef struct {
    uint32_t id;            /**< Message ID (11 or 29 bit) */
    uint8_t  data[64];      /**< Data payload (up to 64 bytes for FD) */
    uint8_t  len;           /**< Data length */
    bool     extended;      /**< Extended ID (29-bit) */
    bool     fd;            /**< CAN-FD frame */
    bool     brs;           /**< Bit rate switch */
} hal_can_msg_t;

/**
 * @brief Initialize CAN-FD peripheral
 * @param instance CAN instance (0, 1, 2...)
 * @param bitrate Arbitration bitrate (e.g., 500000)
 * @param data_bitrate Data bitrate for FD (e.g., 5000000)
 * @return 0 on success
 */
int hal_can_init(uint8_t instance, uint32_t bitrate, uint32_t data_bitrate);

/**
 * @brief Send CAN message
 * @param instance CAN instance
 * @param msg Message to send
 * @return 0 on success
 */
int hal_can_send(uint8_t instance, const hal_can_msg_t *msg);

/**
 * @brief Receive CAN message (non-blocking)
 * @param instance CAN instance
 * @param msg Buffer for received message
 * @return 0 on success, -1 if no message
 */
int hal_can_receive(uint8_t instance, hal_can_msg_t *msg);

/**
 * @brief Set CAN message filter
 * @param instance CAN instance
 * @param filter_id Filter ID
 * @param mask Mask
 * @return 0 on success
 */
int hal_can_set_filter(uint8_t instance, uint32_t filter_id, uint32_t mask);

/*===========================================================================*/
/* UART (Debug Console)                                                      */
/*===========================================================================*/

/**
 * @brief Initialize UART
 * @param instance UART instance
 * @param baudrate Baud rate
 * @return 0 on success
 */
int hal_uart_init(uint8_t instance, uint32_t baudrate);

/**
 * @brief Send byte over UART
 * @param instance UART instance
 * @param byte Byte to send
 */
void hal_uart_putc(uint8_t instance, char byte);

/**
 * @brief Send string over UART
 * @param instance UART instance
 * @param str String to send
 */
void hal_uart_puts(uint8_t instance, const char *str);

/**
 * @brief Receive byte from UART (non-blocking)
 * @param instance UART instance
 * @return Received byte, or -1 if none
 */
int hal_uart_getc(uint8_t instance);

/*===========================================================================*/
/* GPIO                                                                      */
/*===========================================================================*/

/** GPIO mode */
typedef enum {
    HAL_GPIO_MODE_INPUT,
    HAL_GPIO_MODE_OUTPUT,
    HAL_GPIO_MODE_AF,       /* Alternate function */
    HAL_GPIO_MODE_ANALOG
} hal_gpio_mode_t;

/**
 * @brief Configure GPIO pin
 * @param port Port number
 * @param pin Pin number
 * @param mode Mode
 * @return 0 on success
 */
int hal_gpio_config(uint8_t port, uint8_t pin, hal_gpio_mode_t mode);

/**
 * @brief Write GPIO pin
 * @param port Port number
 * @param pin Pin number
 * @param value Value (0 or 1)
 */
void hal_gpio_write(uint8_t port, uint8_t pin, uint8_t value);

/**
 * @brief Read GPIO pin
 * @param port Port number
 * @param pin Pin number
 * @return Pin value (0 or 1)
 */
uint8_t hal_gpio_read(uint8_t port, uint8_t pin);

/**
 * @brief Toggle GPIO pin
 * @param port Port number
 * @param pin Pin number
 */
void hal_gpio_toggle(uint8_t port, uint8_t pin);

/*===========================================================================*/
/* Context Switching (Platform-specific)                                     */
/*===========================================================================*/

/**
 * @brief Initialize context for new task
 * @param stack_top Top of stack
 * @param entry Task entry function
 * @param arg Task argument
 * @return Initial stack pointer
 */
uint32_t hal_context_init(void *stack_top, void (*entry)(void *), void *arg);

/**
 * @brief Perform context switch
 * @param current_sp Pointer to current task's SP
 * @param next_sp Next task's SP
 */
void hal_context_switch(uint32_t *current_sp, uint32_t next_sp);

/**
 * @brief Trigger PendSV for context switch (ARM) or equivalent
 */
void hal_trigger_context_switch(void);

#endif /* HAL_H */
