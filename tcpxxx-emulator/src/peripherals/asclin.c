/**
 * @file asclin.c
 * @brief TC397XP ASCLIN (UART) Emulation
 *
 * ASCLIN provides async/sync serial interface. This implementation
 * focuses on UART mode for debug console output.
 *
 * Key features:
 * - TX: Writes to host stdout
 * - RX: Non-blocking read from host stdin
 * - Basic flag register for TX ready/RX available
 *
 * Reference: TC39x User Manual, Section 19 (ASCLIN)
 */

#include "peripherals.h"
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#ifdef _WIN32
#include <conio.h>
#include <io.h>
#define isatty _isatty
#define fileno _fileno
#else
#include <unistd.h>
#include <termios.h>
#include <fcntl.h>
#include <sys/select.h>
#endif

/* ==========================================================================
 * ASCLIN Internal State
 * ========================================================================== */

struct asclin {
    uint32_t index;         /* ASCLIN0, ASCLIN1, etc. */
    uint32_t module_id;     /* 0x000000C1 for ASCLIN */

    /* Data registers */
    uint32_t txdata;
    uint32_t rxdata;

    /* Configuration */
    uint32_t clc;
    uint32_t pisel;
    uint32_t bitcon;
    uint32_t framecon;
    uint32_t datcon;
    uint32_t brg;
    uint32_t iocr;
    uint32_t csr;

    /* Status and interrupt */
    uint32_t flags;
    uint32_t flagsen;       /* Interrupt enable */

    /* FIFO configuration */
    uint32_t txfifocon;
    uint32_t rxfifocon;

    /* LIN mode */
    uint32_t lincon;
    uint32_t linbtimer;
    uint32_t linhtimer;

    /* Kernel reset */
    uint32_t ocs;
    uint32_t krst0;
    uint32_t krst1;

    /* Access protection */
    uint32_t accen0;
    uint32_t accen1;

    /* TX FIFO state */
    uint8_t tx_buffer[16];
    int tx_head;
    int tx_tail;
    int tx_count;

    /* RX FIFO state */
    uint8_t rx_buffer[16];
    int rx_head;
    int rx_tail;
    int rx_count;
};

/* ==========================================================================
 * Lifecycle
 * ========================================================================== */

asclin_t* asclin_create(uint32_t index)
{
    asclin_t *uart = calloc(1, sizeof(asclin_t));
    if (!uart) return NULL;

    uart->index = index;
    uart->module_id = 0x000000C1;  /* ASCLIN module ID */

    /* Default: TX ready, transmission complete */
    uart->flags = ASCLIN_FLAGS_TH | ASCLIN_FLAGS_TC;

    /* Default access enable: all masters allowed */
    uart->accen0 = 0xFFFFFFFF;
    uart->accen1 = 0xFFFFFFFF;

    /* Default FIFO configuration: INW=1 (single byte), INTLEVEL=0 */
    uart->txfifocon = 0x00000100;  /* INW=1 */
    uart->rxfifocon = 0x00000100;  /* OUTW=1 */

    return uart;
}

void asclin_destroy(asclin_t *uart)
{
    free(uart);
}

void asclin_reset(asclin_t *uart)
{
    if (!uart) return;

    uart->txdata = 0;
    uart->rxdata = 0;
    uart->clc = 0;
    uart->pisel = 0;
    uart->bitcon = 0;
    uart->framecon = 0;
    uart->datcon = 0;
    uart->brg = 0;
    uart->iocr = 0;
    uart->csr = 0;
    uart->flags = ASCLIN_FLAGS_TH | ASCLIN_FLAGS_TC;
    uart->flagsen = 0;
    uart->txfifocon = 0x00000100;
    uart->rxfifocon = 0x00000100;
    uart->lincon = 0;
    uart->linbtimer = 0;
    uart->linhtimer = 0;
    uart->ocs = 0;
    uart->krst0 = 0;
    uart->krst1 = 0;
    uart->accen0 = 0xFFFFFFFF;
    uart->accen1 = 0xFFFFFFFF;

    /* Reset TX FIFO */
    uart->tx_head = 0;
    uart->tx_tail = 0;
    uart->tx_count = 0;

    /* Reset RX FIFO */
    uart->rx_head = 0;
    uart->rx_tail = 0;
    uart->rx_count = 0;
}

/* ==========================================================================
 * RX Handling
 * ========================================================================== */

/**
 * @brief Check if input is available (non-blocking)
 */
static bool input_available(void)
{
#ifdef _WIN32
    return _kbhit() != 0;
#else
    struct timeval tv = {0, 0};
    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(STDIN_FILENO, &fds);
    return select(STDIN_FILENO + 1, &fds, NULL, NULL, &tv) > 0;
#endif
}

/**
 * @brief Read character from stdin (non-blocking)
 * @return Character read, or -1 if none available
 */
static int read_char_nonblock(void)
{
#ifdef _WIN32
    if (_kbhit()) {
        return _getch();
    }
    return -1;
#else
    if (!input_available()) {
        return -1;
    }
    unsigned char c;
    if (read(STDIN_FILENO, &c, 1) == 1) {
        return c;
    }
    return -1;
#endif
}

/**
 * @brief Poll for RX data from host stdin
 */
int asclin_poll_rx(asclin_t *uart)
{
    if (!uart) return -1;

    /* Check if there's room in the RX buffer */
    if (uart->rx_count >= 16) {
        return -1;  /* Buffer full */
    }

    /* Try to read a character */
    int c = read_char_nonblock();
    if (c >= 0) {
        /* Add to RX buffer */
        uart->rx_buffer[uart->rx_head] = (uint8_t)c;
        uart->rx_head = (uart->rx_head + 1) % 16;
        uart->rx_count++;

        /* Update flags */
        uart->flags |= ASCLIN_FLAGS_RH | ASCLIN_FLAGS_RR;
        return c;
    }

    return -1;
}

bool asclin_tx_ready(asclin_t *uart)
{
    if (!uart) return false;
    return (uart->flags & ASCLIN_FLAGS_TH) != 0;
}

bool asclin_rx_ready(asclin_t *uart)
{
    if (!uart) return false;
    return uart->rx_count > 0;
}

/* ==========================================================================
 * Register Access
 * ========================================================================== */

uint32_t asclin_read_reg(asclin_t *uart, uint32_t offset)
{
    if (!uart) return 0;

    switch (offset) {
    case ASCLIN_CLC:
        return uart->clc;

    case ASCLIN_PISEL:
        return uart->pisel;

    case ASCLIN_ID:
        return uart->module_id;

    case ASCLIN_TXDATA:
        return uart->txdata;

    case ASCLIN_RXDATA:
        /* Read from RX buffer */
        if (uart->rx_count > 0) {
            uart->rxdata = uart->rx_buffer[uart->rx_tail];
            uart->rx_tail = (uart->rx_tail + 1) % 16;
            uart->rx_count--;

            /* Update flags */
            if (uart->rx_count == 0) {
                uart->flags &= ~(ASCLIN_FLAGS_RH | ASCLIN_FLAGS_RR);
            }
        } else {
            /* RX underflow */
            uart->flags |= ASCLIN_FLAGS_RFU;
        }
        return uart->rxdata;

    case ASCLIN_BITCON:
        return uart->bitcon;

    case ASCLIN_FRAMECON:
        return uart->framecon;

    case ASCLIN_DATCON:
        return uart->datcon;

    case ASCLIN_BRG:
        return uart->brg;

    case ASCLIN_IOCR:
        return uart->iocr;

    case ASCLIN_CSR:
        return uart->csr;

    case ASCLIN_FLAGS:
        /* Poll for RX before returning flags */
        asclin_poll_rx(uart);
        /* Debug: show first few flag reads */
        {
            static int flag_reads = 0;
            if (flag_reads < 5) {
                fprintf(stderr, "[UART%d] FLAGS read: 0x%08X (TH=%d)\n",
                        uart->index, uart->flags, (uart->flags & ASCLIN_FLAGS_TH) ? 1 : 0);
                flag_reads++;
            }
        }
        return uart->flags;

    case ASCLIN_FLAGSEN:
        return uart->flagsen;

    case ASCLIN_TXFIFOCON:
        /* Return config with current fill level in FILL field */
        return (uart->txfifocon & 0xFFFF0FFF) | ((uint32_t)uart->tx_count << 12);

    case ASCLIN_RXFIFOCON:
        /* Return config with current fill level in FILL field */
        return (uart->rxfifocon & 0xFFFF0FFF) | ((uint32_t)uart->rx_count << 12);

    case ASCLIN_LINCON:
        return uart->lincon;

    case ASCLIN_LINBTIMER:
        return uart->linbtimer;

    case ASCLIN_LINHTIMER:
        return uart->linhtimer;

    case ASCLIN_OCS:
        return uart->ocs;

    case ASCLIN_KRSTCLR:
        return 0;  /* Write-only */

    case ASCLIN_KRST1:
        return uart->krst1;

    case ASCLIN_KRST0:
        return uart->krst0;

    case ASCLIN_ACCEN1:
        return uart->accen1;

    case ASCLIN_ACCEN0:
        return uart->accen0;

    default:
        return 0;
    }
}

void asclin_write_reg(asclin_t *uart, uint32_t offset, uint32_t value)
{
    if (!uart) return;

    switch (offset) {
    case ASCLIN_CLC:
        uart->clc = value;
        break;

    case ASCLIN_PISEL:
        uart->pisel = value;
        break;

    case ASCLIN_TXDATA:
        uart->txdata = value;
        /* Check if TX FIFO has room */
        if (uart->tx_count < 16) {
            uart->tx_buffer[uart->tx_head] = (uint8_t)(value & 0xFF);
            uart->tx_head = (uart->tx_head + 1) % 16;
            uart->tx_count++;

            /* Immediately output to console (simulating instant transmission) */
            fprintf(stderr, "[UART%d] TX: '%c' (0x%02X)\n", uart->index,
                    (value & 0xFF) >= 32 ? (char)(value & 0xFF) : '.', value & 0xFF);
            putchar(value & 0xFF);
            fflush(stdout);
            fflush(stderr);

            /* Simulate immediate TX completion */
            uart->tx_tail = uart->tx_head;
            uart->tx_count = 0;
            uart->flags |= ASCLIN_FLAGS_TH | ASCLIN_FLAGS_TC;
        } else {
            /* TX FIFO overflow */
            uart->flags |= ASCLIN_FLAGS_TFO;
        }
        break;

    case ASCLIN_BITCON:
        uart->bitcon = value;
        break;

    case ASCLIN_FRAMECON:
        uart->framecon = value;
        break;

    case ASCLIN_DATCON:
        uart->datcon = value;
        break;

    case ASCLIN_BRG:
        uart->brg = value;
        break;

    case ASCLIN_IOCR:
        uart->iocr = value;
        break;

    case ASCLIN_CSR:
        uart->csr = value;
        break;

    case ASCLIN_FLAGS:
        /* Direct write clears bits (write-1-to-clear for some bits) */
        uart->flags &= ~value;
        break;

    case ASCLIN_FLAGSSET:
        /* Set flags */
        uart->flags |= value;
        break;

    case ASCLIN_FLAGSCLEAR:
        /* Clear flags */
        uart->flags &= ~value;
        break;

    case ASCLIN_FLAGSEN:
        uart->flagsen = value;
        break;

    case ASCLIN_TXFIFOCON:
        uart->txfifocon = value & 0x0000FFFF;  /* Writable bits only */
        /* Check for FLUSH bit */
        if (value & 0x00000001) {
            uart->tx_head = 0;
            uart->tx_tail = 0;
            uart->tx_count = 0;
            uart->flags |= ASCLIN_FLAGS_TH | ASCLIN_FLAGS_TC;
        }
        break;

    case ASCLIN_RXFIFOCON:
        uart->rxfifocon = value & 0x0000FFFF;  /* Writable bits only */
        /* Check for FLUSH bit */
        if (value & 0x00000001) {
            uart->rx_head = 0;
            uart->rx_tail = 0;
            uart->rx_count = 0;
            uart->flags &= ~(ASCLIN_FLAGS_RH | ASCLIN_FLAGS_RR);
        }
        break;

    case ASCLIN_LINCON:
        uart->lincon = value;
        break;

    case ASCLIN_LINBTIMER:
        uart->linbtimer = value;
        break;

    case ASCLIN_LINHTIMER:
        uart->linhtimer = value;
        break;

    case ASCLIN_OCS:
        uart->ocs = value;
        break;

    case ASCLIN_KRSTCLR:
        /* Clear kernel reset status */
        if (value & 0x01) {
            uart->krst0 &= ~0x02;
        }
        break;

    case ASCLIN_KRST1:
        uart->krst1 = value & 0x01;
        break;

    case ASCLIN_KRST0:
        /* Trigger kernel reset if RST bit set in KRST1 */
        if ((value & 0x01) && (uart->krst1 & 0x01)) {
            asclin_reset(uart);
            uart->krst0 = 0x02;  /* Set RST status */
            uart->krst1 = 0;
        }
        break;

    case ASCLIN_ACCEN1:
        uart->accen1 = value;
        break;

    case ASCLIN_ACCEN0:
        uart->accen0 = value;
        break;

    default:
        break;
    }
}
