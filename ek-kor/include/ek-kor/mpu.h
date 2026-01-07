/**
 * @file mpu.h
 * @brief ek-kor Memory Protection Unit Interface
 *
 * Platform-independent MPU types and definitions.
 * Enables memory isolation between tasks and kernel.
 */

#ifndef EKK_MPU_H
#define EKK_MPU_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Configuration
 * ========================================================================== */

/** Maximum MPU regions per task (platform may support fewer) */
#ifndef EKK_MPU_REGIONS_PER_TASK
#define EKK_MPU_REGIONS_PER_TASK    4
#endif

/** Enable MPU support at compile time */
#ifndef EKK_USE_MPU
#define EKK_USE_MPU                 0
#endif

/* ==========================================================================
 * MPU Region Permissions
 * ========================================================================== */

/**
 * @brief MPU region access permissions
 */
typedef enum {
    EKK_MPU_NONE        = 0x00,     /**< No access */
    EKK_MPU_READ        = 0x01,     /**< Read access */
    EKK_MPU_WRITE       = 0x02,     /**< Write access */
    EKK_MPU_EXEC        = 0x04,     /**< Execute access */

    /* Common combinations */
    EKK_MPU_RO          = EKK_MPU_READ,                         /**< Read-only */
    EKK_MPU_RW          = EKK_MPU_READ | EKK_MPU_WRITE,         /**< Read-write */
    EKK_MPU_RX          = EKK_MPU_READ | EKK_MPU_EXEC,          /**< Read-execute */
    EKK_MPU_RWX         = EKK_MPU_READ | EKK_MPU_WRITE | EKK_MPU_EXEC,
} ekk_mpu_access_t;

/**
 * @brief MPU region attributes
 */
typedef enum {
    EKK_MPU_ATTR_NORMAL     = 0x00,     /**< Normal memory (cacheable) */
    EKK_MPU_ATTR_DEVICE     = 0x01,     /**< Device memory (non-cacheable) */
    EKK_MPU_ATTR_SHARED     = 0x02,     /**< Shared between cores */
    EKK_MPU_ATTR_PRIVILEGED = 0x04,     /**< Kernel-only access */
} ekk_mpu_attr_t;

/* ==========================================================================
 * MPU Region Structure
 * ========================================================================== */

/**
 * @brief MPU region definition
 */
typedef struct {
    void        *base;          /**< Region base address (aligned) */
    uint32_t    size;           /**< Region size in bytes */
    uint8_t     access;         /**< Access permissions (ekk_mpu_access_t) */
    uint8_t     attr;           /**< Attributes (ekk_mpu_attr_t) */
    uint8_t     region_num;     /**< Hardware region number (0..max) */
    bool        enabled;        /**< Region enabled flag */
} ekk_mpu_region_t;

/* ==========================================================================
 * Fault Types
 * ========================================================================== */

/**
 * @brief Memory fault types
 */
typedef enum {
    EKK_FAULT_NONE          = 0,        /**< No fault */
    EKK_FAULT_DATA_ACCESS   = 1,        /**< Data access violation */
    EKK_FAULT_INST_ACCESS   = 2,        /**< Instruction access violation */
    EKK_FAULT_BUS_ERROR     = 3,        /**< Bus error */
    EKK_FAULT_STACK_OVERFLOW = 4,       /**< Stack overflow */
    EKK_FAULT_DIVIDE_ZERO   = 5,        /**< Division by zero */
    EKK_FAULT_ILLEGAL_INST  = 6,        /**< Illegal instruction */
    EKK_FAULT_UNALIGNED     = 7,        /**< Unaligned access */
    EKK_FAULT_PRIVILEGE     = 8,        /**< Privilege violation */
    EKK_FAULT_DEADLINE      = 9,        /**< Deadline missed */
    EKK_FAULT_UNKNOWN       = 255,      /**< Unknown fault */
} ekk_fault_type_t;

/**
 * @brief Fault information structure
 */
typedef struct {
    ekk_fault_type_t type;          /**< Fault type */
    void            *fault_addr;    /**< Faulting address (if applicable) */
    void            *pc;            /**< Program counter at fault */
    uint32_t        status;         /**< Platform-specific status */
    uint32_t        task_id;        /**< Task that caused fault */
} ekk_fault_info_t;

/**
 * @brief Fault action (what to do after fault)
 */
typedef enum {
    EKK_FAULT_ACTION_TERMINATE  = 0,    /**< Terminate faulting task */
    EKK_FAULT_ACTION_RESTART    = 1,    /**< Restart faulting task */
    EKK_FAULT_ACTION_IGNORE     = 2,    /**< Continue (dangerous!) */
    EKK_FAULT_ACTION_PANIC      = 3,    /**< System panic/reset */
} ekk_fault_action_t;

/* ==========================================================================
 * Privilege Levels
 * ========================================================================== */

/**
 * @brief Privilege levels
 */
typedef enum {
    EKK_PRIV_USER       = 0,        /**< User mode (restricted) */
    EKK_PRIV_SUPERVISOR = 1,        /**< Supervisor mode (kernel) */
} ekk_privilege_t;

/* ==========================================================================
 * Predefined Regions
 * ========================================================================== */

/**
 * @brief Standard region identifiers
 */
typedef enum {
    EKK_REGION_KERNEL_CODE  = 0,    /**< Kernel code (RX, privileged) */
    EKK_REGION_KERNEL_DATA  = 1,    /**< Kernel data (RW, privileged) */
    EKK_REGION_TASK_STACK   = 2,    /**< Task stack (RW, user) */
    EKK_REGION_TASK_DATA    = 3,    /**< Task private data (RW, user) */
    EKK_REGION_SHARED       = 4,    /**< Shared memory (configurable) */
    EKK_REGION_PERIPHERAL   = 5,    /**< Peripheral memory (device) */
} ekk_region_id_t;

/* ==========================================================================
 * Function Prototypes (implemented by kernel)
 * ========================================================================== */

#if EKK_USE_MPU

/**
 * @brief Initialize MPU subsystem
 * @return EKK_OK on success
 */
int ekk_mpu_init(void);

/**
 * @brief Configure MPU for a task
 * @param task_id Task identifier
 * @param regions Array of regions
 * @param count Number of regions
 * @return EKK_OK on success
 */
int ekk_mpu_configure_task(uint32_t task_id,
                           const ekk_mpu_region_t *regions,
                           uint8_t count);

/**
 * @brief Add a region to a task
 * @param task_id Task identifier
 * @param region Region to add
 * @return EKK_OK on success
 */
int ekk_mpu_add_region(uint32_t task_id, const ekk_mpu_region_t *region);

/**
 * @brief Remove a region from a task
 * @param task_id Task identifier
 * @param region_num Region number to remove
 * @return EKK_OK on success
 */
int ekk_mpu_remove_region(uint32_t task_id, uint8_t region_num);

/**
 * @brief Get MPU fault handler
 * @param info Fault information (filled on return)
 * @return Recommended fault action
 */
ekk_fault_action_t ekk_mpu_handle_fault(ekk_fault_info_t *info);

/**
 * @brief User fault hook (weak, override in application)
 * @param info Fault information
 * @return Fault action to take
 */
ekk_fault_action_t ekk_fault_hook(const ekk_fault_info_t *info);

#endif /* EKK_USE_MPU */

#ifdef __cplusplus
}
#endif

#endif /* EKK_MPU_H */
