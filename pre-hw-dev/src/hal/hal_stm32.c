/**
 * @file hal_stm32.c
 * @brief JEZGRO HAL - STM32G474 Implementation
 *
 * This HAL implementation targets STM32G474 (Cortex-M4F)
 * for use with Renode emulation and real hardware.
 */

#if defined(STM32G474xx)

#include "hal.h"
#include <stddef.h>

/*===========================================================================*/
/* STM32G474 Register Definitions                                            */
/*===========================================================================*/

/* Core peripherals */
#define SCB_BASE            0xE000ED00UL
#define NVIC_BASE           0xE000E100UL
#define SYSTICK_BASE        0xE000E010UL
#define MPU_BASE            0xE000ED90UL

/* System Control Block */
#define SCB_ICSR            (*(volatile uint32_t *)(SCB_BASE + 0x04))
#define SCB_VTOR            (*(volatile uint32_t *)(SCB_BASE + 0x08))
#define SCB_AIRCR           (*(volatile uint32_t *)(SCB_BASE + 0x0C))
#define SCB_SCR             (*(volatile uint32_t *)(SCB_BASE + 0x10))
#define SCB_CCR             (*(volatile uint32_t *)(SCB_BASE + 0x14))
#define SCB_SHPR1           (*(volatile uint32_t *)(SCB_BASE + 0x18))
#define SCB_SHPR2           (*(volatile uint32_t *)(SCB_BASE + 0x1C))
#define SCB_SHPR3           (*(volatile uint32_t *)(SCB_BASE + 0x20))
#define SCB_SHCSR           (*(volatile uint32_t *)(SCB_BASE + 0x24))
#define SCB_CFSR            (*(volatile uint32_t *)(SCB_BASE + 0x28))
#define SCB_HFSR            (*(volatile uint32_t *)(SCB_BASE + 0x2C))
#define SCB_MMFAR           (*(volatile uint32_t *)(SCB_BASE + 0x34))
#define SCB_BFAR            (*(volatile uint32_t *)(SCB_BASE + 0x38))

/* SCB_ICSR bits */
#define SCB_ICSR_PENDSVSET  (1UL << 28)
#define SCB_ICSR_PENDSVCLR  (1UL << 27)

/* SysTick */
#define SYSTICK_CTRL        (*(volatile uint32_t *)(SYSTICK_BASE + 0x00))
#define SYSTICK_LOAD        (*(volatile uint32_t *)(SYSTICK_BASE + 0x04))
#define SYSTICK_VAL         (*(volatile uint32_t *)(SYSTICK_BASE + 0x08))
#define SYSTICK_CALIB       (*(volatile uint32_t *)(SYSTICK_BASE + 0x0C))

#define SYSTICK_CTRL_ENABLE     (1UL << 0)
#define SYSTICK_CTRL_TICKINT    (1UL << 1)
#define SYSTICK_CTRL_CLKSOURCE  (1UL << 2)
#define SYSTICK_CTRL_COUNTFLAG  (1UL << 16)

/* MPU */
#define MPU_TYPE            (*(volatile uint32_t *)(MPU_BASE + 0x00))
#define MPU_CTRL            (*(volatile uint32_t *)(MPU_BASE + 0x04))
#define MPU_RNR             (*(volatile uint32_t *)(MPU_BASE + 0x08))
#define MPU_RBAR            (*(volatile uint32_t *)(MPU_BASE + 0x0C))
#define MPU_RASR            (*(volatile uint32_t *)(MPU_BASE + 0x10))

#define MPU_CTRL_ENABLE     (1UL << 0)
#define MPU_CTRL_HFNMIENA   (1UL << 1)
#define MPU_CTRL_PRIVDEFENA (1UL << 2)

/* USART1 */
#define USART1_BASE         0x40013800UL
#define USART1_CR1          (*(volatile uint32_t *)(USART1_BASE + 0x00))
#define USART1_CR2          (*(volatile uint32_t *)(USART1_BASE + 0x04))
#define USART1_CR3          (*(volatile uint32_t *)(USART1_BASE + 0x08))
#define USART1_BRR          (*(volatile uint32_t *)(USART1_BASE + 0x0C))
#define USART1_ISR          (*(volatile uint32_t *)(USART1_BASE + 0x1C))
#define USART1_ICR          (*(volatile uint32_t *)(USART1_BASE + 0x20))
#define USART1_RDR          (*(volatile uint32_t *)(USART1_BASE + 0x24))
#define USART1_TDR          (*(volatile uint32_t *)(USART1_BASE + 0x28))

#define USART_CR1_UE        (1UL << 0)
#define USART_CR1_TE        (1UL << 3)
#define USART_CR1_RE        (1UL << 2)
#define USART_ISR_TXE       (1UL << 7)
#define USART_ISR_RXNE      (1UL << 5)
#define USART_ISR_TC        (1UL << 6)

/* RCC */
#define RCC_BASE            0x40021000UL
#define RCC_AHB2ENR         (*(volatile uint32_t *)(RCC_BASE + 0x4C))
#define RCC_APB2ENR         (*(volatile uint32_t *)(RCC_BASE + 0x60))

/* GPIO */
#define GPIOA_BASE          0x48000000UL
#define GPIOB_BASE          0x48000400UL
#define GPIOC_BASE          0x48000800UL

#define GPIO_MODER(base)    (*(volatile uint32_t *)(base + 0x00))
#define GPIO_OTYPER(base)   (*(volatile uint32_t *)(base + 0x04))
#define GPIO_OSPEEDR(base)  (*(volatile uint32_t *)(base + 0x08))
#define GPIO_PUPDR(base)    (*(volatile uint32_t *)(base + 0x0C))
#define GPIO_IDR(base)      (*(volatile uint32_t *)(base + 0x10))
#define GPIO_ODR(base)      (*(volatile uint32_t *)(base + 0x14))
#define GPIO_BSRR(base)     (*(volatile uint32_t *)(base + 0x18))
#define GPIO_AFR(base, n)   (*(volatile uint32_t *)(base + 0x20 + (n)*4))

/*===========================================================================*/
/* Private Data                                                              */
/*===========================================================================*/

/* System clock frequency (assume 170 MHz after initialization) */
#define SYSTEM_CLOCK_HZ     170000000UL

/* System tick counter (incremented by SysTick_Handler) */
static volatile uint32_t systick_ms = 0;
static volatile uint64_t systick_us_offset = 0;

/* Context switching variables */
static volatile uint32_t *current_task_sp = NULL;
static volatile uint32_t next_task_sp = 0;

/*===========================================================================*/
/* ARM Intrinsics                                                            */
/*===========================================================================*/

/* CMSIS-like intrinsics */
static inline void __DSB(void) { __asm volatile ("dsb 0xF" ::: "memory"); }
static inline void __ISB(void) { __asm volatile ("isb 0xF" ::: "memory"); }
static inline void __DMB(void) { __asm volatile ("dmb 0xF" ::: "memory"); }
static inline void __WFI(void) { __asm volatile ("wfi"); }
static inline void __NOP(void) { __asm volatile ("nop"); }

static inline uint32_t __get_PRIMASK(void) {
    uint32_t result;
    __asm volatile ("mrs %0, primask" : "=r" (result));
    return result;
}

static inline void __set_PRIMASK(uint32_t primask) {
    __asm volatile ("msr primask, %0" : : "r" (primask) : "memory");
}

static inline void __enable_irq(void) {
    __asm volatile ("cpsie i" ::: "memory");
}

static inline void __disable_irq(void) {
    __asm volatile ("cpsid i" ::: "memory");
}

/*===========================================================================*/
/* Forward Declarations                                                      */
/*===========================================================================*/

static void mpu_configure_regions(void);

/*===========================================================================*/
/* System Initialization                                                     */
/*===========================================================================*/

int hal_init(void)
{
    /* Enable GPIO clocks (GPIOA, GPIOB, GPIOC) */
    RCC_AHB2ENR |= (1 << 0) | (1 << 1) | (1 << 2);

    /* Enable USART1 clock */
    RCC_APB2ENR |= (1 << 14);

    /* Small delay for clocks to stabilize */
    for (volatile int i = 0; i < 1000; i++) { __NOP(); }

    /* Initialize USART1 for debug output (115200 baud @ 170MHz) */
    /* Configure PA9 (TX) and PA10 (RX) as alternate function */
    uint32_t gpio_base = GPIOA_BASE;
    GPIO_MODER(gpio_base) &= ~((3 << (9*2)) | (3 << (10*2)));
    GPIO_MODER(gpio_base) |=  ((2 << (9*2)) | (2 << (10*2)));  /* AF mode */
    GPIO_AFR(gpio_base, 1) &= ~((0xF << ((9-8)*4)) | (0xF << ((10-8)*4)));
    GPIO_AFR(gpio_base, 1) |=  ((7 << ((9-8)*4)) | (7 << ((10-8)*4)));  /* AF7 = USART */

    /* Configure USART1: 115200 baud */
    USART1_CR1 = 0;  /* Disable USART */
    USART1_BRR = SYSTEM_CLOCK_HZ / 115200;  /* Baud rate */
    USART1_CR1 = USART_CR1_TE | USART_CR1_RE | USART_CR1_UE;  /* Enable TX, RX, USART */

    /* Configure NVIC priority grouping: 4 bits preempt, 0 bits sub */
    SCB_AIRCR = 0x05FA0300;

    /* Set PendSV to lowest priority (for context switching) */
    SCB_SHPR3 |= (0xFF << 16);  /* PendSV priority = 255 */

    /* Set SysTick to second-lowest priority */
    SCB_SHPR3 |= (0xFE << 24);  /* SysTick priority = 254 */

    /* Enable MemManage, BusFault, UsageFault exceptions */
    SCB_SHCSR |= (1 << 16) | (1 << 17) | (1 << 18);

    /* Initialize and configure MPU */
    hal_mpu_init();
    mpu_configure_regions();
    hal_mpu_enable();

    return 0;
}

const char *hal_get_platform(void)
{
    return HAL_PLATFORM_NAME;
}

void hal_reset(void)
{
    /* Request system reset */
    SCB_AIRCR = 0x05FA0004;
    __DSB();
    while (1) { __WFI(); }
}

/*===========================================================================*/
/* Timing                                                                    */
/*===========================================================================*/

uint64_t hal_get_time_us(void)
{
    uint32_t ms, val, reload;
    uint32_t primask;

    /* Disable interrupts to get atomic read */
    primask = __get_PRIMASK();
    __disable_irq();

    ms = systick_ms;
    val = SYSTICK_VAL;
    reload = SYSTICK_LOAD;

    /* Check if SysTick wrapped but interrupt hasn't fired yet */
    if ((SYSTICK_CTRL & SYSTICK_CTRL_COUNTFLAG) && (val > reload/2)) {
        ms++;
    }

    __set_PRIMASK(primask);

    /* Calculate microseconds: ms * 1000 + fraction */
    uint64_t us = (uint64_t)ms * 1000;
    us += ((reload - val) * 1000) / (reload + 1);

    return us;
}

uint32_t hal_get_time_ms(void)
{
    return systick_ms;
}

void hal_delay_us(uint32_t us)
{
    uint64_t target = hal_get_time_us() + us;
    while (hal_get_time_us() < target) {
        __NOP();
    }
}

void hal_delay_ms(uint32_t ms)
{
    uint32_t target = systick_ms + ms;
    while (systick_ms < target) {
        __WFI();
    }
}

int hal_systick_init(uint32_t tick_hz)
{
    uint32_t reload = (SYSTEM_CLOCK_HZ / tick_hz) - 1;

    if (reload > 0xFFFFFF) {
        return -1;  /* Reload value too large for 24-bit timer */
    }

    SYSTICK_CTRL = 0;  /* Disable SysTick */
    SYSTICK_VAL = 0;   /* Clear current value */
    SYSTICK_LOAD = reload;
    SYSTICK_CTRL = SYSTICK_CTRL_CLKSOURCE | SYSTICK_CTRL_TICKINT | SYSTICK_CTRL_ENABLE;

    return 0;
}

/*===========================================================================*/
/* SysTick Interrupt Handler                                                 */
/*===========================================================================*/

/**
 * @brief Default SysTick handler (weak - can be overridden by application)
 *
 * Applications should define their own SysTick_Handler to integrate
 * with the scheduler. This default just updates the HAL tick counter.
 */
__attribute__((weak)) void SysTick_Handler(void)
{
    systick_ms++;
}

/**
 * @brief Called by application's SysTick_Handler to update HAL timing
 */
void hal_systick_increment(void)
{
    systick_ms++;
}

/*===========================================================================*/
/* Interrupts                                                                */
/*===========================================================================*/

uint32_t hal_disable_interrupts(void)
{
    uint32_t primask = __get_PRIMASK();
    __disable_irq();
    return primask;
}

void hal_enable_interrupts(void)
{
    __enable_irq();
}

void hal_restore_interrupts(uint32_t state)
{
    __set_PRIMASK(state);
}

/*===========================================================================*/
/* Memory Protection Unit                                                    */
/*===========================================================================*/

/**
 * @brief Configure all MPU regions for memory protection
 *
 * Memory Map:
 *   Region 0: Flash Code        0x08000000  512KB   RO + Execute
 *   Region 1: SRAM Kernel       0x20000000  16KB    Priv RW + XN
 *   Region 2: SRAM Heap/Stacks  0x20004000  64KB    Full RW + XN
 *   Region 3: Peripherals       0x40000000  512MB   Priv RW + XN + Device
 *   Region 4: System (NVIC)     0xE0000000  1MB     Priv RW + XN + Device
 */
static void mpu_configure_regions(void)
{
    hal_mpu_region_t region;

    /* Region 0: Flash - Read-only, executable */
    region.base_addr = 0x08000000;
    region.size = 512 * 1024;           /* 512 KB */
    region.region_num = 0;
    region.access = HAL_MPU_RO;         /* Read-only for all */
    region.executable = true;
    region.cacheable = true;
    hal_mpu_configure_region(&region);

    /* Region 1: SRAM Kernel - Privileged RW only, no execute */
    region.base_addr = 0x20000000;
    region.size = 16 * 1024;            /* 16 KB */
    region.region_num = 1;
    region.access = HAL_MPU_PRIV_RW;    /* Privileged only */
    region.executable = false;
    region.cacheable = true;
    hal_mpu_configure_region(&region);

    /* Region 2: SRAM Heap/Stacks - Full RW, no execute */
    region.base_addr = 0x20004000;
    region.size = 64 * 1024;            /* 64 KB */
    region.region_num = 2;
    region.access = HAL_MPU_FULL_ACCESS; /* Full access */
    region.executable = false;
    region.cacheable = true;
    hal_mpu_configure_region(&region);

    /* Region 3: Peripherals - Privileged RW, no execute, device memory */
    region.base_addr = 0x40000000;
    region.size = 512 * 1024 * 1024;    /* 512 MB */
    region.region_num = 3;
    region.access = HAL_MPU_PRIV_RW;    /* Privileged only */
    region.executable = false;
    region.cacheable = false;           /* Device memory - no cache */
    hal_mpu_configure_region(&region);

    /* Region 4: System control (NVIC, SCB, etc) - Privileged RW, device */
    region.base_addr = 0xE0000000;
    region.size = 1 * 1024 * 1024;      /* 1 MB */
    region.region_num = 4;
    region.access = HAL_MPU_PRIV_RW;    /* Privileged only */
    region.executable = false;
    region.cacheable = false;           /* Device memory - no cache */
    hal_mpu_configure_region(&region);
}

int hal_mpu_init(void)
{
    /* Disable MPU */
    MPU_CTRL = 0;
    __DSB();
    __ISB();

    return 0;
}

static uint32_t mpu_size_to_bits(uint32_t size)
{
    /* MPU size field: 2^(SIZE+1) bytes, minimum SIZE=4 (32 bytes) */
    uint32_t bits = 0;
    size >>= 1;
    while (size) {
        bits++;
        size >>= 1;
    }
    return (bits < 4) ? 4 : bits - 1;
}

int hal_mpu_configure_region(const hal_mpu_region_t *region)
{
    if (region == NULL || region->region_num >= 8) {
        return -1;
    }

    uint32_t rasr = 0;

    /* Size field */
    rasr |= (mpu_size_to_bits(region->size) << 1);

    /* Access permissions */
    rasr |= ((region->access & 0x7) << 24);

    /* Execute never */
    if (!region->executable) {
        rasr |= (1 << 28);
    }

    /* Cacheable/bufferable/shareable */
    if (region->cacheable) {
        rasr |= (1 << 17);  /* C */
        rasr |= (1 << 16);  /* B */
    }

    /* Enable region */
    rasr |= (1 << 0);

    /* Select region and configure */
    MPU_RNR = region->region_num;
    MPU_RBAR = region->base_addr & 0xFFFFFFE0;
    MPU_RASR = rasr;

    __DSB();
    __ISB();

    return 0;
}

void hal_mpu_enable(void)
{
    MPU_CTRL = MPU_CTRL_ENABLE | MPU_CTRL_PRIVDEFENA;
    __DSB();
    __ISB();
}

void hal_mpu_disable(void)
{
    MPU_CTRL = 0;
    __DSB();
    __ISB();
}

/*===========================================================================*/
/* CAN-FD (FDCAN) Implementation for STM32G474                               */
/*===========================================================================*/

/* FDCAN peripheral base addresses */
#define FDCAN1_BASE         0x40006400UL
#define FDCAN2_BASE         0x40006800UL
#define FDCAN3_BASE         0x40006C00UL

/* CAN Message SRAM base (3KB shared between all instances) */
#define CAN_SRAM_BASE       0x4000A400UL
#define CAN_SRAM_SIZE       (3 * 1024)

/* FDCAN Register offsets (Bosch M_CAN based) */
#define FDCAN_CREL          0x00    /* Core Release */
#define FDCAN_ENDN          0x04    /* Endian */
#define FDCAN_DBTP          0x0C    /* Data Bit Timing & Prescaler */
#define FDCAN_TEST          0x10    /* Test Register */
#define FDCAN_RWD           0x14    /* RAM Watchdog */
#define FDCAN_CCCR          0x18    /* CC Control Register */
#define FDCAN_NBTP          0x1C    /* Nominal Bit Timing & Prescaler */
#define FDCAN_TSCC          0x20    /* Timestamp Counter Config */
#define FDCAN_TSCV          0x24    /* Timestamp Counter Value */
#define FDCAN_TOCC          0x28    /* Timeout Counter Config */
#define FDCAN_TOCV          0x2C    /* Timeout Counter Value */
#define FDCAN_ECR           0x40    /* Error Counter */
#define FDCAN_PSR           0x44    /* Protocol Status */
#define FDCAN_TDCR          0x48    /* Transmitter Delay Compensation */
#define FDCAN_IR            0x50    /* Interrupt Register */
#define FDCAN_IE            0x54    /* Interrupt Enable */
#define FDCAN_ILS           0x58    /* Interrupt Line Select */
#define FDCAN_ILE           0x5C    /* Interrupt Line Enable */
#define FDCAN_RXGFC         0x80    /* Global Filter Configuration */
#define FDCAN_XIDAM         0x84    /* Extended ID AND Mask */
#define FDCAN_HPMS          0x88    /* High Priority Message Status */
#define FDCAN_RXF0C         0x90    /* Rx FIFO 0 Configuration */
#define FDCAN_RXF0S         0x94    /* Rx FIFO 0 Status */
#define FDCAN_RXF0A         0x98    /* Rx FIFO 0 Acknowledge */
#define FDCAN_RXF1C         0xA0    /* Rx FIFO 1 Configuration */
#define FDCAN_RXF1S         0xA4    /* Rx FIFO 1 Status */
#define FDCAN_RXF1A         0xA8    /* Rx FIFO 1 Acknowledge */
#define FDCAN_TXBC          0xC0    /* Tx Buffer Configuration */
#define FDCAN_TXFQS         0xC4    /* Tx FIFO/Queue Status */
#define FDCAN_TXBRP         0xCC    /* Tx Buffer Request Pending */
#define FDCAN_TXBAR         0xD0    /* Tx Buffer Add Request */
#define FDCAN_TXBCR         0xD4    /* Tx Buffer Cancellation Request */
#define FDCAN_TXBTO         0xD8    /* Tx Buffer Transmission Occurred */
#define FDCAN_TXBCF         0xDC    /* Tx Buffer Cancellation Finished */
#define FDCAN_TXBTIE        0xE0    /* Tx Buffer Transmission IE */
#define FDCAN_TXBCIE        0xE4    /* Tx Buffer Cancellation Finished IE */
#define FDCAN_TXEFS         0xE8    /* Tx Event FIFO Status */
#define FDCAN_TXEFA         0xEC    /* Tx Event FIFO Acknowledge */

/* CCCR Register bits */
#define FDCAN_CCCR_INIT     (1UL << 0)   /* Initialization */
#define FDCAN_CCCR_CCE      (1UL << 1)   /* Configuration Change Enable */
#define FDCAN_CCCR_ASM      (1UL << 2)   /* Restricted Operation Mode */
#define FDCAN_CCCR_CSA      (1UL << 3)   /* Clock Stop Acknowledge */
#define FDCAN_CCCR_CSR      (1UL << 4)   /* Clock Stop Request */
#define FDCAN_CCCR_MON      (1UL << 5)   /* Bus Monitoring Mode */
#define FDCAN_CCCR_DAR      (1UL << 6)   /* Disable Auto Retransmission */
#define FDCAN_CCCR_TEST     (1UL << 7)   /* Test Mode Enable */
#define FDCAN_CCCR_FDOE     (1UL << 8)   /* FD Operation Enable */
#define FDCAN_CCCR_BRSE     (1UL << 9)   /* Bit Rate Switch Enable */
#define FDCAN_CCCR_PXHD     (1UL << 12)  /* Protocol Exception Handling Disable */
#define FDCAN_CCCR_EFBI     (1UL << 13)  /* Edge Filtering during Bus Integration */
#define FDCAN_CCCR_TXP      (1UL << 14)  /* Transmit Pause */
#define FDCAN_CCCR_NISO     (1UL << 15)  /* Non ISO Operation */

/* IR Register bits (Interrupts) */
#define FDCAN_IR_RF0N       (1UL << 0)   /* Rx FIFO 0 New Message */
#define FDCAN_IR_RF0F       (1UL << 2)   /* Rx FIFO 0 Full */
#define FDCAN_IR_RF1N       (1UL << 4)   /* Rx FIFO 1 New Message */
#define FDCAN_IR_TC         (1UL << 9)   /* Transmission Completed */

/* RXF0S bits */
#define FDCAN_RXF0S_F0FL_MASK   0x7F        /* Fill Level mask */
#define FDCAN_RXF0S_F0GI_SHIFT  8           /* Get Index shift */
#define FDCAN_RXF0S_F0GI_MASK   (0x3F << 8) /* Get Index mask */
#define FDCAN_RXF0S_F0F         (1UL << 24) /* FIFO Full */
#define FDCAN_RXF0S_RF0L        (1UL << 25) /* Message Lost */

/* TXFQS bits */
#define FDCAN_TXFQS_TFFL_MASK   0x3F        /* Free Level mask */
#define FDCAN_TXFQS_TFGI_SHIFT  8           /* Get Index shift */
#define FDCAN_TXFQS_TFGI_MASK   (0x1F << 8) /* Get Index mask */
#define FDCAN_TXFQS_TFQF        (1UL << 21) /* FIFO/Queue Full */

/* Message RAM element sizes */
#define FDCAN_RX_ELEMENT_SIZE   72          /* Header(8) + Data(64) */
#define FDCAN_TX_ELEMENT_SIZE   72          /* Header(8) + Data(64) */
#define FDCAN_FILTER_SIZE       4           /* Standard filter element */

/* Per-instance Message RAM layout:
 * Each instance gets 1KB of the 3KB shared SRAM
 * - Standard Filters: 28 elements (112 bytes)
 * - Rx FIFO 0: 3 elements (216 bytes)
 * - Rx FIFO 1: 3 elements (216 bytes)
 * - Tx Buffers: 3 elements (216 bytes)
 * Total: ~760 bytes per instance
 */
#define FDCAN_RAM_PER_INSTANCE  1024
#define FDCAN_STD_FILTER_COUNT  28
#define FDCAN_RX_FIFO0_SIZE     3
#define FDCAN_RX_FIFO1_SIZE     3
#define FDCAN_TX_BUFFER_COUNT   3

/* RAM offsets within each instance's allocation */
#define FDCAN_FLSSA_OFFSET      0           /* Standard Filter start */
#define FDCAN_F0SA_OFFSET       (FDCAN_STD_FILTER_COUNT * FDCAN_FILTER_SIZE)
#define FDCAN_F1SA_OFFSET       (FDCAN_F0SA_OFFSET + FDCAN_RX_FIFO0_SIZE * FDCAN_RX_ELEMENT_SIZE)
#define FDCAN_TBSA_OFFSET       (FDCAN_F1SA_OFFSET + FDCAN_RX_FIFO1_SIZE * FDCAN_RX_ELEMENT_SIZE)

/* Register access macros */
#define FDCAN_REG(base, offset) (*(volatile uint32_t *)((base) + (offset)))

/* RCC for FDCAN clock enable */
#define RCC_APB1ENR1        (*(volatile uint32_t *)(RCC_BASE + 0x58))
#define RCC_CCIPR           (*(volatile uint32_t *)(RCC_BASE + 0x88))

/* FDCAN state per instance */
typedef struct {
    uint32_t base;          /* Peripheral base address */
    uint32_t ram_base;      /* Message RAM base for this instance */
    bool initialized;       /* Initialization flag */
} fdcan_instance_t;

static fdcan_instance_t fdcan_instances[3] = {
    { FDCAN1_BASE, CAN_SRAM_BASE + 0 * FDCAN_RAM_PER_INSTANCE, false },
    { FDCAN2_BASE, CAN_SRAM_BASE + 1 * FDCAN_RAM_PER_INSTANCE, false },
    { FDCAN3_BASE, CAN_SRAM_BASE + 2 * FDCAN_RAM_PER_INSTANCE, false },
};

/* DLC to byte length lookup */
static const uint8_t dlc_to_len[] = {
    0, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16, 20, 24, 32, 48, 64
};

static uint8_t len_to_dlc(uint8_t len)
{
    if (len <= 8) return len;
    if (len <= 12) return 9;
    if (len <= 16) return 10;
    if (len <= 20) return 11;
    if (len <= 24) return 12;
    if (len <= 32) return 13;
    if (len <= 48) return 14;
    return 15;
}

int hal_can_init(uint8_t instance, uint32_t bitrate, uint32_t data_bitrate)
{
    if (instance >= 3) {
        return -1;
    }

    fdcan_instance_t *can = &fdcan_instances[instance];
    uint32_t base = can->base;

    /* Enable FDCAN clock (all 3 share same clock bit) */
    RCC_APB1ENR1 |= (1 << 25);  /* FDCAN clock enable */

    /* Wait for clock to stabilize */
    for (volatile int i = 0; i < 100; i++) { __NOP(); }

    /* Enter initialization mode */
    FDCAN_REG(base, FDCAN_CCCR) |= FDCAN_CCCR_INIT;
    while ((FDCAN_REG(base, FDCAN_CCCR) & FDCAN_CCCR_INIT) == 0) { __NOP(); }

    /* Enable configuration change */
    FDCAN_REG(base, FDCAN_CCCR) |= FDCAN_CCCR_CCE;

    /* Configure bit timing for nominal rate
     * Assume FDCAN kernel clock = 170 MHz (PCLK1)
     * For 500 kbps: BRP=17, TSEG1=13, TSEG2=2, SJW=2
     * Bit time = (1 + TSEG1 + TSEG2) / (BRP * fclk)
     * = (1 + 13 + 2) / (17 * 170MHz) = 16 / 2.89MHz = 5.53us = ~180kbps
     *
     * Recalculate: For 500kbps at 170MHz:
     * Need tq = 2us total, 16 tq per bit
     * BRP = 170MHz / (500kbps * 16) = 170 / 8 = 21.25 ~= 21
     * Using BRP=17, we get: 170MHz / 17 = 10MHz tq clock
     * With 20 tq/bit: 10MHz / 20 = 500kbps ✓
     */
    uint32_t brp, tseg1, tseg2, sjw;

    /* Calculate timing for requested bitrate */
    /* Target: 20 time quanta per bit */
    brp = SYSTEM_CLOCK_HZ / (bitrate * 20);
    if (brp < 1) brp = 1;
    if (brp > 512) brp = 512;

    tseg1 = 13;  /* Sample point at 70% */
    tseg2 = 4;
    sjw = 4;

    /* NBTP: Nominal Bit Timing and Prescaler
     * [31:25] NSJW, [24:16] NBRP, [15:8] NTSEG1, [7:0] NTSEG2
     */
    FDCAN_REG(base, FDCAN_NBTP) =
        ((sjw - 1) << 25) |
        ((brp - 1) << 16) |
        ((tseg1 - 1) << 8) |
        ((tseg2 - 1) << 0);

    /* Configure data phase bit timing for FD (if different rate) */
    if (data_bitrate > 0 && data_bitrate != bitrate) {
        uint32_t dbrp = SYSTEM_CLOCK_HZ / (data_bitrate * 10);
        if (dbrp < 1) dbrp = 1;
        if (dbrp > 32) dbrp = 32;

        uint32_t dtseg1 = 5;
        uint32_t dtseg2 = 2;
        uint32_t dsjw = 2;

        /* DBTP: Data Bit Timing and Prescaler */
        FDCAN_REG(base, FDCAN_DBTP) =
            (1 << 23) |             /* TDC enable */
            ((dsjw - 1) << 16) |
            ((dtseg1 - 1) << 8) |
            ((dtseg2 - 1) << 4) |
            ((dbrp - 1) << 0);

        /* Enable FD with bit rate switching */
        FDCAN_REG(base, FDCAN_CCCR) |= FDCAN_CCCR_FDOE | FDCAN_CCCR_BRSE;
    }

    /* Configure Message RAM
     * Each instance has its own section of the shared 3KB SRAM
     */
    uint32_t ram_offset = (can->ram_base - CAN_SRAM_BASE) / 4;  /* Word offset */

    /* Standard ID Filter Configuration */
    FDCAN_REG(base, FDCAN_RXGFC) = 0;  /* Accept all to FIFO0 by default */

    /* Rx FIFO 0 Configuration */
    FDCAN_REG(base, FDCAN_RXF0C) =
        ((ram_offset + FDCAN_F0SA_OFFSET/4) << 16) |  /* Start address */
        (FDCAN_RX_FIFO0_SIZE << 0);                    /* FIFO size */

    /* Rx FIFO 1 Configuration */
    FDCAN_REG(base, FDCAN_RXF1C) =
        ((ram_offset + FDCAN_F1SA_OFFSET/4) << 16) |
        (FDCAN_RX_FIFO1_SIZE << 0);

    /* Tx Buffer Configuration */
    FDCAN_REG(base, FDCAN_TXBC) =
        ((ram_offset + FDCAN_TBSA_OFFSET/4) << 16) |  /* Start address */
        (FDCAN_TX_BUFFER_COUNT << 0);                  /* Number of buffers */

    /* Clear all interrupt flags */
    FDCAN_REG(base, FDCAN_IR) = 0xFFFFFFFF;

    /* Leave initialization mode */
    FDCAN_REG(base, FDCAN_CCCR) &= ~(FDCAN_CCCR_CCE | FDCAN_CCCR_INIT);
    while (FDCAN_REG(base, FDCAN_CCCR) & FDCAN_CCCR_INIT) { __NOP(); }

    can->initialized = true;
    return 0;
}

/* Static TX buffer index for simple round-robin */
static uint8_t tx_buffer_index[3] = {0, 0, 0};

int hal_can_send(uint8_t instance, const hal_can_msg_t *msg)
{
    if (instance >= 3 || msg == NULL) {
        return -1;
    }

    fdcan_instance_t *can = &fdcan_instances[instance];
    if (!can->initialized) {
        return -1;
    }

    uint32_t base = can->base;

    /* Use simple round-robin TX buffer allocation (Renode compatibility)
     * Real hardware would use TXFQS.TFFL and TXFQS.TFQPI
     */
    uint32_t put_index = tx_buffer_index[instance];
    tx_buffer_index[instance] = (put_index + 1) % FDCAN_TX_BUFFER_COUNT;

    /* Calculate element address in Message RAM */
    uint32_t *element = (uint32_t *)(can->ram_base + FDCAN_TBSA_OFFSET +
                                      put_index * FDCAN_TX_ELEMENT_SIZE);

    /* Build Tx Buffer Element header */
    /* Word 0: T0 - ID, RTR, XTD, ESI */
    uint32_t t0 = 0;
    if (msg->extended) {
        t0 = (msg->id & 0x1FFFFFFF) | (1UL << 30);  /* XTD bit */
    } else {
        t0 = (msg->id & 0x7FF) << 18;  /* Standard ID in bits [28:18] */
    }

    /* Word 1: T1 - DLC, BRS, FDF, EFC, MM */
    uint32_t dlc = len_to_dlc(msg->len);
    uint32_t t1 = (dlc << 16);
    if (msg->fd) {
        t1 |= (1UL << 21);  /* FDF - FD Format */
        if (msg->brs) {
            t1 |= (1UL << 20);  /* BRS - Bit Rate Switch */
        }
    }

    /* Write header */
    element[0] = t0;
    element[1] = t1;

    /* Write data (up to 64 bytes for FD) */
    uint8_t *data_ptr = (uint8_t *)&element[2];
    uint8_t len = dlc_to_len[dlc];
    for (uint8_t i = 0; i < len && i < msg->len; i++) {
        data_ptr[i] = msg->data[i];
    }

    /* Request transmission */
    FDCAN_REG(base, FDCAN_TXBAR) = (1UL << put_index);

    return 0;
}

int hal_can_receive(uint8_t instance, hal_can_msg_t *msg)
{
    if (instance >= 3 || msg == NULL) {
        return -1;
    }

    fdcan_instance_t *can = &fdcan_instances[instance];
    if (!can->initialized) {
        return -1;
    }

    uint32_t base = can->base;

    /* Check Rx FIFO 0 fill level */
    uint32_t rxf0s = FDCAN_REG(base, FDCAN_RXF0S);
    uint32_t fill_level = rxf0s & FDCAN_RXF0S_F0FL_MASK;

    if (fill_level == 0) {
        return -1;  /* No message */
    }

    /* Get index */
    uint32_t get_index = (rxf0s >> 8) & 0x3F;

    /* Calculate element address */
    uint32_t *element = (uint32_t *)(can->ram_base + FDCAN_F0SA_OFFSET +
                                      get_index * FDCAN_RX_ELEMENT_SIZE);

    /* Read header */
    uint32_t r0 = element[0];
    uint32_t r1 = element[1];

    /* Parse ID */
    if (r0 & (1UL << 30)) {
        /* Extended ID */
        msg->id = r0 & 0x1FFFFFFF;
        msg->extended = true;
    } else {
        /* Standard ID */
        msg->id = (r0 >> 18) & 0x7FF;
        msg->extended = false;
    }

    /* Parse flags */
    msg->fd = (r1 & (1UL << 21)) != 0;
    msg->brs = (r1 & (1UL << 20)) != 0;

    /* Parse DLC and read data */
    uint8_t dlc = (r1 >> 16) & 0xF;
    msg->len = dlc_to_len[dlc];

    uint8_t *data_ptr = (uint8_t *)&element[2];
    for (uint8_t i = 0; i < msg->len && i < 64; i++) {
        msg->data[i] = data_ptr[i];
    }

    /* Acknowledge - release FIFO element */
    FDCAN_REG(base, FDCAN_RXF0A) = get_index;

    return 0;
}

int hal_can_set_filter(uint8_t instance, uint32_t filter_id, uint32_t mask)
{
    if (instance >= 3) {
        return -1;
    }

    fdcan_instance_t *can = &fdcan_instances[instance];
    if (!can->initialized) {
        return -1;
    }

    uint32_t base = can->base;

    /* Enter init mode to configure filters */
    FDCAN_REG(base, FDCAN_CCCR) |= FDCAN_CCCR_INIT;
    while ((FDCAN_REG(base, FDCAN_CCCR) & FDCAN_CCCR_INIT) == 0) { __NOP(); }
    FDCAN_REG(base, FDCAN_CCCR) |= FDCAN_CCCR_CCE;

    /* Configure Standard ID Filter Element 0
     * Format: [31:30]=SFT, [29:27]=SFEC, [26:16]=SFID1, [15:0]=SFID2/Mask
     * SFT=2 (Classic filter), SFEC=1 (Store in FIFO0), SFID1=ID, SFID2=Mask
     */
    uint32_t *filter = (uint32_t *)(can->ram_base + FDCAN_FLSSA_OFFSET);
    filter[0] = (2UL << 30) |                 /* SFT = Classic filter (ID+mask) */
                (1UL << 27) |                 /* SFEC = Store in Rx FIFO 0 */
                ((filter_id & 0x7FF) << 16) | /* SFID1 = Filter ID */
                (mask & 0x7FF);               /* SFID2 = Mask */

    /* Leave init mode */
    FDCAN_REG(base, FDCAN_CCCR) &= ~(FDCAN_CCCR_CCE | FDCAN_CCCR_INIT);
    while (FDCAN_REG(base, FDCAN_CCCR) & FDCAN_CCCR_INIT) { __NOP(); }

    return 0;
}

/*===========================================================================*/
/* UART                                                                      */
/*===========================================================================*/

int hal_uart_init(uint8_t instance, uint32_t baudrate)
{
    /* Only USART1 supported for now */
    if (instance != 0) return -1;

    USART1_CR1 &= ~USART_CR1_UE;  /* Disable */
    USART1_BRR = SYSTEM_CLOCK_HZ / baudrate;
    USART1_CR1 |= USART_CR1_UE;   /* Enable */

    return 0;
}

void hal_uart_putc(uint8_t instance, char byte)
{
    (void)instance;

    /* Wait for TX buffer empty */
    while (!(USART1_ISR & USART_ISR_TXE)) { __NOP(); }

    /* Send byte */
    USART1_TDR = (uint8_t)byte;
}

void hal_uart_puts(uint8_t instance, const char *str)
{
    while (*str) {
        hal_uart_putc(instance, *str++);
    }
}

int hal_uart_getc(uint8_t instance)
{
    (void)instance;

    if (USART1_ISR & USART_ISR_RXNE) {
        return (int)(USART1_RDR & 0xFF);
    }

    return -1;  /* No character available */
}

/*===========================================================================*/
/* GPIO                                                                      */
/*===========================================================================*/

static uint32_t get_gpio_base(uint8_t port)
{
    switch (port) {
        case 0: return GPIOA_BASE;
        case 1: return GPIOB_BASE;
        case 2: return GPIOC_BASE;
        default: return 0;
    }
}

int hal_gpio_config(uint8_t port, uint8_t pin, hal_gpio_mode_t mode)
{
    uint32_t base = get_gpio_base(port);
    if (base == 0 || pin >= 16) return -1;

    uint32_t moder = GPIO_MODER(base);
    moder &= ~(3 << (pin * 2));

    switch (mode) {
        case HAL_GPIO_MODE_INPUT:
            /* MODER = 00 (input) */
            break;
        case HAL_GPIO_MODE_OUTPUT:
            moder |= (1 << (pin * 2));  /* MODER = 01 (output) */
            break;
        case HAL_GPIO_MODE_AF:
            moder |= (2 << (pin * 2));  /* MODER = 10 (AF) */
            break;
        case HAL_GPIO_MODE_ANALOG:
            moder |= (3 << (pin * 2));  /* MODER = 11 (analog) */
            break;
    }

    GPIO_MODER(base) = moder;
    return 0;
}

void hal_gpio_write(uint8_t port, uint8_t pin, uint8_t value)
{
    uint32_t base = get_gpio_base(port);
    if (base == 0 || pin >= 16) return;

    if (value) {
        GPIO_BSRR(base) = (1 << pin);         /* Set */
    } else {
        GPIO_BSRR(base) = (1 << (pin + 16));  /* Reset */
    }
}

uint8_t hal_gpio_read(uint8_t port, uint8_t pin)
{
    uint32_t base = get_gpio_base(port);
    if (base == 0 || pin >= 16) return 0;

    return (GPIO_IDR(base) >> pin) & 1;
}

void hal_gpio_toggle(uint8_t port, uint8_t pin)
{
    uint32_t base = get_gpio_base(port);
    if (base == 0 || pin >= 16) return;

    GPIO_ODR(base) ^= (1 << pin);
}

/*===========================================================================*/
/* Context Switching                                                         */
/*===========================================================================*/

/**
 * @brief Initialize a task's stack for first-time execution
 *
 * Creates an exception stack frame that will cause the task to start
 * executing at 'entry' when context is switched to it.
 *
 * Stack frame (top to bottom):
 *   xPSR  (0x01000000 for Thumb mode)
 *   PC    (entry point)
 *   LR    (return address - task_exit or infinite loop)
 *   R12
 *   R3-R0 (R0 = arg)
 *   --- auto-saved by hardware ---
 *   R11-R4 (saved by software)
 *   --- saved by PendSV ---
 */
uint32_t hal_context_init(void *stack_top, void (*entry)(void *), void *arg)
{
    uint32_t *sp = (uint32_t *)stack_top;

    /* Exception frame (pushed by hardware on exception entry) */
    *(--sp) = 0x01000000UL;         /* xPSR - Thumb mode */
    *(--sp) = (uint32_t)entry;      /* PC - task entry point */
    *(--sp) = 0xFFFFFFFDUL;         /* LR - EXC_RETURN (return to thread PSP) */
    *(--sp) = 0x12121212UL;         /* R12 */
    *(--sp) = 0x03030303UL;         /* R3 */
    *(--sp) = 0x02020202UL;         /* R2 */
    *(--sp) = 0x01010101UL;         /* R1 */
    *(--sp) = (uint32_t)arg;        /* R0 - task argument */

    /* Software-saved registers */
    *(--sp) = 0x11111111UL;         /* R11 */
    *(--sp) = 0x10101010UL;         /* R10 */
    *(--sp) = 0x09090909UL;         /* R9 */
    *(--sp) = 0x08080808UL;         /* R8 */
    *(--sp) = 0x07070707UL;         /* R7 */
    *(--sp) = 0x06060606UL;         /* R6 */
    *(--sp) = 0x05050505UL;         /* R5 */
    *(--sp) = 0x04040404UL;         /* R4 */

    return (uint32_t)sp;
}

void hal_context_switch(uint32_t *current_sp, uint32_t next_sp)
{
    current_task_sp = current_sp;
    next_task_sp = next_sp;
    hal_trigger_context_switch();
}

void hal_trigger_context_switch(void)
{
    /* Trigger PendSV exception */
    SCB_ICSR |= SCB_ICSR_PENDSVSET;
    __DSB();
    __ISB();
}

/*===========================================================================*/
/* PendSV Handler - Context Switch Implementation                            */
/*===========================================================================*/

/**
 * PendSV handler performs the actual context switch.
 * This is written in assembly for precise register control.
 */
__attribute__((naked)) void PendSV_Handler(void)
{
    __asm volatile (
        /* Disable interrupts during context switch */
        "    cpsid i                        \n"

        /* Check if we need to save current context */
        "    ldr r1, =current_task_sp       \n"
        "    ldr r1, [r1]                   \n"
        "    cbz r1, PendSV_load            \n"

        /* Save current context: Get PSP and save R4-R11 */
        "    mrs r0, psp                    \n"
        "    stmdb r0!, {r4-r11}            \n"

        /* Store new SP to current task's sp field */
        "    str r0, [r1]                   \n"

        "PendSV_load:                       \n"
        /* Load next task's SP */
        "    ldr r0, =next_task_sp          \n"
        "    ldr r0, [r0]                   \n"

        /* Restore R4-R11 from new task's stack */
        "    ldmia r0!, {r4-r11}            \n"

        /* Set new PSP */
        "    msr psp, r0                    \n"

        /* Clear current_task_sp (mark switch complete) */
        "    ldr r1, =current_task_sp       \n"
        "    mov r2, #0                     \n"
        "    str r2, [r1]                   \n"

        /* Re-enable interrupts */
        "    cpsie i                        \n"

        /* Return to thread mode using PSP */
        "    ldr r0, =0xFFFFFFFD            \n"
        "    bx r0                          \n"
    );
}

/*===========================================================================*/
/* Fault Handler Helpers                                                     */
/*===========================================================================*/

static void fault_puthex(uint32_t val)
{
    static const char hex[] = "0123456789ABCDEF";
    char buf[9];
    for (int i = 7; i >= 0; i--) {
        buf[7 - i] = hex[(val >> (i * 4)) & 0xF];
    }
    buf[8] = '\0';
    hal_uart_puts(0, buf);
}

/*===========================================================================*/
/* Fault Handlers                                                            */
/*===========================================================================*/

void HardFault_Handler(void)
{
    uint32_t cfsr = SCB_CFSR;
    uint32_t hfsr = SCB_HFSR;

    hal_uart_puts(0, "\r\n*** HARD FAULT ***\r\n");
    hal_uart_puts(0, "CFSR: 0x");
    fault_puthex(cfsr);
    hal_uart_puts(0, "\r\nHFSR: 0x");
    fault_puthex(hfsr);

    if (hfsr & (1 << 30)) {
        hal_uart_puts(0, " FORCED");
    }
    if (hfsr & (1 << 1)) {
        hal_uart_puts(0, " VECTTBL");
    }
    hal_uart_puts(0, "\r\n");

    while (1) { __WFI(); }
}

void MemManage_Handler(void)
{
    uint32_t cfsr = SCB_CFSR;
    uint32_t mmfar = SCB_MMFAR;
    uint8_t mmfsr = cfsr & 0xFF;  /* Lower byte is MMFSR */

    hal_uart_puts(0, "\r\n*** MPU FAULT ***\r\n");
    hal_uart_puts(0, "CFSR: 0x");
    fault_puthex(cfsr);
    hal_uart_puts(0, "\r\nMMFAR: 0x");
    fault_puthex(mmfar);
    hal_uart_puts(0, "\r\nFlags:");

    if (mmfsr & (1 << 0)) {
        hal_uart_puts(0, " IACCVIOL");   /* Instruction access violation */
    }
    if (mmfsr & (1 << 1)) {
        hal_uart_puts(0, " DACCVIOL");   /* Data access violation */
    }
    if (mmfsr & (1 << 3)) {
        hal_uart_puts(0, " MUNSTKERR");  /* Unstacking error */
    }
    if (mmfsr & (1 << 4)) {
        hal_uart_puts(0, " MSTKERR");    /* Stacking error */
    }
    if (mmfsr & (1 << 5)) {
        hal_uart_puts(0, " MLSPERR");    /* FP lazy state preservation */
    }
    if (mmfsr & (1 << 7)) {
        hal_uart_puts(0, " MMARVALID");  /* MMFAR contains valid address */
    }
    hal_uart_puts(0, "\r\n");

    /* Clear fault status */
    SCB_CFSR = cfsr;

    while (1) { __WFI(); }
}

void BusFault_Handler(void)
{
    uint32_t cfsr = SCB_CFSR;
    uint32_t bfar = SCB_BFAR;
    uint8_t bfsr = (cfsr >> 8) & 0xFF;  /* Second byte is BFSR */

    hal_uart_puts(0, "\r\n*** BUS FAULT ***\r\n");
    hal_uart_puts(0, "CFSR: 0x");
    fault_puthex(cfsr);
    hal_uart_puts(0, "\r\nBFAR: 0x");
    fault_puthex(bfar);
    hal_uart_puts(0, "\r\nFlags:");

    if (bfsr & (1 << 0)) {
        hal_uart_puts(0, " IBUSERR");    /* Instruction bus error */
    }
    if (bfsr & (1 << 1)) {
        hal_uart_puts(0, " PRECISERR");  /* Precise data bus error */
    }
    if (bfsr & (1 << 2)) {
        hal_uart_puts(0, " IMPRECISERR"); /* Imprecise data bus error */
    }
    if (bfsr & (1 << 3)) {
        hal_uart_puts(0, " UNSTKERR");   /* Unstacking error */
    }
    if (bfsr & (1 << 4)) {
        hal_uart_puts(0, " STKERR");     /* Stacking error */
    }
    if (bfsr & (1 << 5)) {
        hal_uart_puts(0, " LSPERR");     /* FP lazy state preservation */
    }
    if (bfsr & (1 << 7)) {
        hal_uart_puts(0, " BFARVALID");  /* BFAR contains valid address */
    }
    hal_uart_puts(0, "\r\n");

    while (1) { __WFI(); }
}

void UsageFault_Handler(void)
{
    uint32_t cfsr = SCB_CFSR;
    uint16_t ufsr = (cfsr >> 16) & 0xFFFF;  /* Upper half-word is UFSR */

    hal_uart_puts(0, "\r\n*** USAGE FAULT ***\r\n");
    hal_uart_puts(0, "CFSR: 0x");
    fault_puthex(cfsr);
    hal_uart_puts(0, "\r\nFlags:");

    if (ufsr & (1 << 0)) {
        hal_uart_puts(0, " UNDEFINSTR"); /* Undefined instruction */
    }
    if (ufsr & (1 << 1)) {
        hal_uart_puts(0, " INVSTATE");   /* Invalid state (no Thumb) */
    }
    if (ufsr & (1 << 2)) {
        hal_uart_puts(0, " INVPC");      /* Invalid PC load */
    }
    if (ufsr & (1 << 3)) {
        hal_uart_puts(0, " NOCP");       /* No coprocessor */
    }
    if (ufsr & (1 << 8)) {
        hal_uart_puts(0, " UNALIGNED");  /* Unaligned access */
    }
    if (ufsr & (1 << 9)) {
        hal_uart_puts(0, " DIVBYZERO");  /* Divide by zero */
    }
    hal_uart_puts(0, "\r\n");

    while (1) { __WFI(); }
}

#endif /* STM32G474xx */
