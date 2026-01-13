/**
 * @file ekk_hal_stm32g474.c
 * @brief EK-KOR v2 - HAL Implementation for STM32G474 (Cortex-M4)
 *
 * @copyright Copyright (c) 2026 Elektrokombinacija
 * @license MIT
 *
 * Target hardware:
 * - STM32G474RE (170 MHz Cortex-M4 with FPU and DSP)
 * - 512KB Flash, 128KB SRAM (96KB SRAM1 + 32KB SRAM2 + 32KB CCM)
 * - FDCAN1 for CAN-FD segment bus
 * - TIM2 (32-bit) for microsecond timestamps
 *
 * Memory layout:
 * - CCM (0x10000000): Stack, critical variables
 * - SRAM1 (0x20000000): Heap, general data
 * - SRAM2 (0x20014000): Field region (shared, for multi-core future)
 */

#include "ekk/ekk_hal.h"
#include "ekk/ekk_spsc.h"
#include "ekk/ekk_field.h"

/* Only compile for STM32G4 target */
#if defined(STM32G474xx) || defined(EKK_PLATFORM_STM32G474)

#include <string.h>
#include <stdarg.h>
#include <stdio.h>

/* ============================================================================
 * STM32G4 REGISTER DEFINITIONS
 * ============================================================================ */

/* Base addresses */
#define PERIPH_BASE             0x40000000UL
#define APB1PERIPH_BASE         PERIPH_BASE
#define APB2PERIPH_BASE         (PERIPH_BASE + 0x00010000UL)
#define AHB1PERIPH_BASE         (PERIPH_BASE + 0x00020000UL)
#define AHB2PERIPH_BASE         (PERIPH_BASE + 0x08000000UL)

/* RCC (Reset and Clock Control) */
#define RCC_BASE                (AHB1PERIPH_BASE + 0x1000UL)
#define RCC_AHB1ENR             (*(volatile uint32_t *)(RCC_BASE + 0x48))
#define RCC_AHB2ENR             (*(volatile uint32_t *)(RCC_BASE + 0x4C))
#define RCC_APB1ENR1            (*(volatile uint32_t *)(RCC_BASE + 0x58))
#define RCC_APB1ENR2            (*(volatile uint32_t *)(RCC_BASE + 0x5C))
#define RCC_APB2ENR             (*(volatile uint32_t *)(RCC_BASE + 0x60))
#define RCC_CCIPR               (*(volatile uint32_t *)(RCC_BASE + 0x88))

/* TIM2 (32-bit general-purpose timer) */
#define TIM2_BASE               (APB1PERIPH_BASE + 0x0000UL)
#define TIM2_CR1                (*(volatile uint32_t *)(TIM2_BASE + 0x00))
#define TIM2_SR                 (*(volatile uint32_t *)(TIM2_BASE + 0x10))
#define TIM2_CNT                (*(volatile uint32_t *)(TIM2_BASE + 0x24))
#define TIM2_PSC                (*(volatile uint32_t *)(TIM2_BASE + 0x28))
#define TIM2_ARR                (*(volatile uint32_t *)(TIM2_BASE + 0x2C))

/* USART2 (debug serial) */
#define USART2_BASE             (APB1PERIPH_BASE + 0x4400UL)
#define USART2_CR1              (*(volatile uint32_t *)(USART2_BASE + 0x00))
#define USART2_CR2              (*(volatile uint32_t *)(USART2_BASE + 0x04))
#define USART2_CR3              (*(volatile uint32_t *)(USART2_BASE + 0x08))
#define USART2_BRR              (*(volatile uint32_t *)(USART2_BASE + 0x0C))
#define USART2_ISR              (*(volatile uint32_t *)(USART2_BASE + 0x1C))
#define USART2_TDR              (*(volatile uint32_t *)(USART2_BASE + 0x28))
#define USART2_RDR              (*(volatile uint32_t *)(USART2_BASE + 0x24))

/* FDCAN1 */
#define FDCAN1_BASE             (APB1PERIPH_BASE + 0x6400UL)
#define FDCAN1_CCCR             (*(volatile uint32_t *)(FDCAN1_BASE + 0x18))
#define FDCAN1_NBTP             (*(volatile uint32_t *)(FDCAN1_BASE + 0x1C))
#define FDCAN1_DBTP             (*(volatile uint32_t *)(FDCAN1_BASE + 0x0C))
#define FDCAN1_TEST             (*(volatile uint32_t *)(FDCAN1_BASE + 0x10))
#define FDCAN1_RXF0C            (*(volatile uint32_t *)(FDCAN1_BASE + 0xA0))
#define FDCAN1_RXF0S            (*(volatile uint32_t *)(FDCAN1_BASE + 0xA4))
#define FDCAN1_TXBC             (*(volatile uint32_t *)(FDCAN1_BASE + 0xC0))
#define FDCAN1_TXFQS            (*(volatile uint32_t *)(FDCAN1_BASE + 0xC4))
#define FDCAN1_IE               (*(volatile uint32_t *)(FDCAN1_BASE + 0x54))
#define FDCAN1_IR               (*(volatile uint32_t *)(FDCAN1_BASE + 0x50))

/* CAN Message RAM */
#define SRAMCAN_BASE            0x4000A400UL

/* GPIO */
#define GPIOA_BASE              (AHB2PERIPH_BASE + 0x0000UL)
#define GPIOA_MODER             (*(volatile uint32_t *)(GPIOA_BASE + 0x00))
#define GPIOA_AFRL              (*(volatile uint32_t *)(GPIOA_BASE + 0x20))
#define GPIOA_AFRH              (*(volatile uint32_t *)(GPIOA_BASE + 0x24))

/* Unique device ID (96 bits) */
#define UID_BASE                0x1FFF7590UL
#define UID0                    (*(volatile uint32_t *)(UID_BASE + 0x00))
#define UID1                    (*(volatile uint32_t *)(UID_BASE + 0x04))
#define UID2                    (*(volatile uint32_t *)(UID_BASE + 0x08))

/* System clock (assuming 170 MHz) */
#define SYSCLK_FREQ             170000000UL
#define APB1_FREQ               170000000UL
#define APB2_FREQ               170000000UL

/* ============================================================================
 * MEMORY SECTIONS
 * ============================================================================ */

/* Field region in SRAM2 (16KB available, use 12KB for fields) */
#define FIELD_REGION_ADDR       0x20014000UL
#define FIELD_REGION_SIZE       (12 * 1024)

/* Message queues in SRAM1 */
#define MSG_QUEUE_ADDR          0x20010000UL
#define MSG_QUEUE_SIZE          64
#define MSG_MAX_LEN             64

/* ============================================================================
 * INTERNAL STATE
 * ============================================================================ */

/* Field region pointer */
static ekk_field_region_t *g_field_region = (ekk_field_region_t *)FIELD_REGION_ADDR;

/* Message queue */
typedef struct {
    ekk_module_id_t sender;
    uint8_t msg_type;
    uint8_t data[MSG_MAX_LEN];
    uint32_t len;
    uint8_t valid;
} hal_message_t;

static hal_message_t g_msg_queue[MSG_QUEUE_SIZE] __attribute__((section(".sram1")));
static volatile uint32_t g_msg_head = 0;
static volatile uint32_t g_msg_tail = 0;

/* Receive callback */
static ekk_hal_recv_cb g_recv_callback = NULL;

/* Module ID (computed from UID) */
static ekk_module_id_t g_module_id = 0;

/* ============================================================================
 * CORTEX-M4 INTRINSICS
 * ============================================================================ */

static inline void __DMB(void) {
    __asm__ volatile("dmb 0xF" ::: "memory");
}

static inline void __DSB(void) {
    __asm__ volatile("dsb 0xF" ::: "memory");
}

static inline void __ISB(void) {
    __asm__ volatile("isb 0xF" ::: "memory");
}

static inline uint32_t __LDREXW(volatile uint32_t *addr) {
    uint32_t result;
    __asm__ volatile("ldrex %0, [%1]" : "=r"(result) : "r"(addr));
    return result;
}

static inline uint32_t __STREXW(uint32_t value, volatile uint32_t *addr) {
    uint32_t result;
    __asm__ volatile("strex %0, %2, [%1]" : "=&r"(result) : "r"(addr), "r"(value));
    return result;
}

/* ============================================================================
 * TIMER FUNCTIONS
 * ============================================================================ */

static void timer_init(void) {
    /* Enable TIM2 clock */
    RCC_APB1ENR1 |= (1 << 0);  /* TIM2EN */
    __DSB();

    /* Configure TIM2 as microsecond counter */
    TIM2_CR1 = 0;                       /* Disable timer */
    TIM2_PSC = (SYSCLK_FREQ / 1000000) - 1;  /* Prescaler for 1 MHz (1 us ticks) */
    TIM2_ARR = 0xFFFFFFFF;              /* Max count (32-bit) */
    TIM2_CNT = 0;                       /* Reset counter */
    TIM2_CR1 = 1;                       /* Enable timer */
}

ekk_time_us_t ekk_hal_time_us(void) {
    return (ekk_time_us_t)TIM2_CNT;
}

void ekk_hal_delay_us(uint32_t us) {
    uint32_t start = TIM2_CNT;
    while ((TIM2_CNT - start) < us) {
        /* Busy wait */
    }
}

/* ============================================================================
 * SERIAL (DEBUG OUTPUT)
 * ============================================================================ */

static void serial_init(void) {
    /* Enable GPIOA and USART2 clocks */
    RCC_AHB2ENR |= (1 << 0);   /* GPIOAEN */
    RCC_APB1ENR1 |= (1 << 17); /* USART2EN */
    __DSB();

    /* Configure PA2 (TX) and PA3 (RX) as alternate function 7 (USART2) */
    GPIOA_MODER &= ~((3 << 4) | (3 << 6));  /* Clear mode bits */
    GPIOA_MODER |= (2 << 4) | (2 << 6);     /* Alternate function */
    GPIOA_AFRL &= ~((0xF << 8) | (0xF << 12));
    GPIOA_AFRL |= (7 << 8) | (7 << 12);     /* AF7 = USART2 */

    /* Configure USART2: 115200 baud, 8N1 */
    USART2_CR1 = 0;  /* Disable USART */
    USART2_BRR = APB1_FREQ / 115200;  /* Baud rate */
    USART2_CR1 = (1 << 3) | (1 << 2); /* TE | RE */
    USART2_CR1 |= (1 << 0);           /* UE (enable) */
}

static void serial_putchar(char c) {
    while (!(USART2_ISR & (1 << 7)));  /* Wait for TXE */
    USART2_TDR = c;
}

void ekk_hal_printf(const char *fmt, ...) {
    char buf[256];
    va_list args;
    va_start(args, fmt);
    int len = vsnprintf(buf, sizeof(buf), fmt, args);
    va_end(args);

    for (int i = 0; i < len; i++) {
        if (buf[i] == '\n') {
            serial_putchar('\r');
        }
        serial_putchar(buf[i]);
    }
}

/* ============================================================================
 * FDCAN FUNCTIONS
 * ============================================================================ */

static void fdcan_init(void) {
    /* Enable FDCAN clock */
    RCC_APB1ENR1 |= (1 << 25);  /* FDCAN1EN */
    __DSB();

    /* Enter init mode */
    FDCAN1_CCCR |= (1 << 0);   /* INIT */
    while (!(FDCAN1_CCCR & (1 << 0)));

    /* Enable configuration change */
    FDCAN1_CCCR |= (1 << 1);   /* CCE */

    /* Configure nominal bit timing (1 Mbps) */
    /* Assuming 170 MHz clock, Tq = 1/170MHz = 5.88ns */
    /* For 1 Mbps: bit time = 1000ns, need ~170 Tq per bit */
    /* NBRP=0 (prescaler 1), NTSEG1=127, NTSEG2=42, NSJW=42 */
    FDCAN1_NBTP = (0 << 25) |      /* NBRP = 0 */
                  (127 << 8) |     /* NTSEG1 = 127 */
                  (42 << 0) |      /* NTSEG2 = 42 */
                  (42 << 16);      /* NSJW = 42 */

    /* Configure data bit timing (5 Mbps for CAN-FD) */
    /* DBRP=0, DTSEG1=25, DTSEG2=8, DSJW=8 */
    FDCAN1_DBTP = (0 << 16) |      /* DBRP = 0 */
                  (25 << 8) |      /* DTSEG1 = 25 */
                  (8 << 0) |       /* DTSEG2 = 8 */
                  (8 << 4);        /* DSJW = 8 */

    /* Configure RX FIFO 0 (8 elements) */
    FDCAN1_RXF0C = (8 << 16) |     /* F0S = 8 elements */
                   (0 << 0);       /* F0SA = 0 (start address) */

    /* Configure TX FIFO (8 elements) */
    FDCAN1_TXBC = (8 << 24) |      /* TFQS = 8 elements */
                  (0 << 16);       /* TBSA offset */

    /* Enable RX FIFO 0 new message interrupt */
    FDCAN1_IE = (1 << 0);          /* RF0NE */

    /* Leave init mode */
    FDCAN1_CCCR &= ~(1 << 0);      /* Clear INIT */
    while (FDCAN1_CCCR & (1 << 0));
}

/* ============================================================================
 * MESSAGE TRANSMISSION
 * ============================================================================ */

ekk_error_t ekk_hal_send(ekk_module_id_t dest_id,
                          ekk_msg_type_t msg_type,
                          const void *data,
                          uint32_t len) {
    if (len > MSG_MAX_LEN) {
        return EKK_ERR_INVALID_ARG;
    }

    /* For CAN-FD, we would encode into CAN frame here */
    /* For now, use internal message queue for simulation */

    uint32_t next_head = (g_msg_head + 1) % MSG_QUEUE_SIZE;
    if (next_head == g_msg_tail) {
        return EKK_ERR_NO_MEMORY;  /* Queue full */
    }

    hal_message_t *msg = &g_msg_queue[g_msg_head];
    msg->sender = g_module_id;
    msg->msg_type = msg_type;
    msg->len = len;
    if (data && len > 0) {
        memcpy(msg->data, data, len);
    }
    __DMB();
    msg->valid = 1;
    __DMB();
    g_msg_head = next_head;

    return EKK_OK;
}

ekk_error_t ekk_hal_broadcast(ekk_msg_type_t msg_type,
                               const void *data,
                               uint32_t len) {
    return ekk_hal_send(EKK_BROADCAST_ID, msg_type, data, len);
}

ekk_error_t ekk_hal_recv(ekk_module_id_t *sender_id,
                          ekk_msg_type_t *msg_type,
                          void *data,
                          uint32_t *len) {
    if (g_msg_tail == g_msg_head) {
        return EKK_ERR_NOT_FOUND;  /* Queue empty */
    }

    hal_message_t *msg = &g_msg_queue[g_msg_tail];
    __DMB();
    if (!msg->valid) {
        return EKK_ERR_NOT_FOUND;
    }

    *sender_id = msg->sender;
    *msg_type = (ekk_msg_type_t)msg->msg_type;
    if (data && msg->len > 0) {
        uint32_t copy_len = (*len < msg->len) ? *len : msg->len;
        memcpy(data, msg->data, copy_len);
    }
    *len = msg->len;

    msg->valid = 0;
    __DMB();
    g_msg_tail = (g_msg_tail + 1) % MSG_QUEUE_SIZE;

    return EKK_OK;
}

void ekk_hal_set_recv_callback(ekk_hal_recv_cb callback) {
    g_recv_callback = callback;
}

/* ============================================================================
 * CRITICAL SECTIONS
 * ============================================================================ */

uint32_t ekk_hal_critical_enter(void) {
    uint32_t primask;
    __asm__ volatile("mrs %0, primask" : "=r"(primask));
    __asm__ volatile("cpsid i" ::: "memory");
    return primask;
}

void ekk_hal_critical_exit(uint32_t state) {
    __asm__ volatile("msr primask, %0" :: "r"(state) : "memory");
}

void ekk_hal_memory_barrier(void) {
    __DMB();
}

/* ============================================================================
 * ATOMIC OPERATIONS
 * ============================================================================ */

bool ekk_hal_cas32(volatile uint32_t *ptr, uint32_t expected, uint32_t desired) {
    uint32_t result;
    uint32_t status;

    do {
        result = __LDREXW(ptr);
        if (result != expected) {
            /* Clear exclusive monitor */
            __asm__ volatile("clrex");
            return false;
        }
        status = __STREXW(desired, ptr);
    } while (status != 0);  /* Retry if store failed */

    return true;
}

uint32_t ekk_hal_atomic_inc(volatile uint32_t *ptr) {
    uint32_t result;
    uint32_t status;

    do {
        result = __LDREXW(ptr);
        status = __STREXW(result + 1, ptr);
    } while (status != 0);

    return result + 1;
}

uint32_t ekk_hal_atomic_dec(volatile uint32_t *ptr) {
    uint32_t result;
    uint32_t status;

    do {
        result = __LDREXW(ptr);
        status = __STREXW(result - 1, ptr);
    } while (status != 0);

    return result - 1;
}

/* ============================================================================
 * SHARED MEMORY
 * ============================================================================ */

void *ekk_hal_get_field_region(void) {
    return g_field_region;
}

void ekk_hal_sync_field_region(void) {
    __DMB();
    __DSB();
}

/* ============================================================================
 * PLATFORM INITIALIZATION
 * ============================================================================ */

/**
 * @brief Compute module ID from unique device ID
 *
 * XORs all bytes of 96-bit UID and maps to valid range [1, 254].
 */
static ekk_module_id_t compute_module_id(void) {
    uint32_t uid0 = UID0;
    uint32_t uid1 = UID1;
    uint32_t uid2 = UID2;

    /* XOR all bytes together */
    uint32_t hash = uid0 ^ uid1 ^ uid2;
    hash ^= (hash >> 16);
    hash ^= (hash >> 8);

    /* Map to valid module ID range [1, 254] */
    uint8_t id = (hash & 0xFF);
    if (id == 0) id = 1;
    if (id == 255) id = 254;

    return (ekk_module_id_t)id;
}

ekk_error_t ekk_hal_init(void) {
    /* Initialize timer first (needed for timestamps) */
    timer_init();

    /* Initialize serial for debug output */
    serial_init();

    /* Compute unique module ID */
    g_module_id = compute_module_id();

    /* Initialize field region */
    memset(g_field_region, 0, sizeof(ekk_field_region_t));

    /* Initialize message queue */
    memset(g_msg_queue, 0, sizeof(g_msg_queue));
    g_msg_head = 0;
    g_msg_tail = 0;

    /* Initialize FDCAN */
    fdcan_init();

    ekk_hal_printf("EK-KOR HAL: STM32G474 initialized\n");
    ekk_hal_printf("  Module ID: %u\n", g_module_id);
    ekk_hal_printf("  UID: %08lX-%08lX-%08lX\n", UID0, UID1, UID2);

    return EKK_OK;
}

const char *ekk_hal_platform_name(void) {
    return "STM32G474 (Cortex-M4 @ 170MHz)";
}

ekk_module_id_t ekk_hal_get_module_id(void) {
    return g_module_id;
}

/* ============================================================================
 * ASSERT HANDLER
 * ============================================================================ */

void ekk_hal_assert_fail(const char *file, int line, const char *expr) {
    ekk_hal_printf("\n!!! ASSERT FAILED !!!\n");
    ekk_hal_printf("File: %s\n", file);
    ekk_hal_printf("Line: %d\n", line);
    ekk_hal_printf("Expr: %s\n", expr);

    /* Disable interrupts and halt */
    __asm__ volatile("cpsid i");
    while (1) {
        __asm__ volatile("wfi");
    }
}

#endif /* STM32G474xx || EKK_PLATFORM_STM32G474 */
