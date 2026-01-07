/**
 * @file gdb_server.h
 * @brief GDB Remote Serial Protocol Server for TC397XP Emulator
 *
 * Implements GDB RSP over TCP for debugging:
 * - Register read/write (g/G, p/P)
 * - Memory read/write (m/M)
 * - Breakpoints (Z0/z0, Z1/z1)
 * - Execution control (c, s, ?)
 * - Multi-core support via threads (Hg, Hc, qfThreadInfo)
 */

#ifndef GDB_SERVER_H
#define GDB_SERVER_H

#include "emu_types.h"
#include "multicore.h"
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ==========================================================================
 * Constants
 * ========================================================================== */

#define GDB_DEFAULT_PORT        3333
#define GDB_MAX_PACKET_SIZE     4096
#define GDB_MAX_BREAKPOINTS     32

/* ==========================================================================
 * GDB Server Types
 * ========================================================================== */

/**
 * @brief Breakpoint type
 */
typedef enum {
    BP_SOFTWARE,    /**< Software breakpoint (DEBUG instruction) */
    BP_HARDWARE,    /**< Hardware breakpoint (address match) */
} breakpoint_type_t;

/**
 * @brief Breakpoint entry
 */
typedef struct {
    bool                active;
    breakpoint_type_t   type;
    uint32_t            addr;
    uint32_t            original_insn;  /**< For software BP: original instruction */
} gdb_breakpoint_t;

/**
 * @brief GDB server state
 */
typedef enum {
    GDB_STATE_IDLE,         /**< Not connected */
    GDB_STATE_WAITING,      /**< Waiting for connection */
    GDB_STATE_CONNECTED,    /**< Client connected */
    GDB_STATE_RUNNING,      /**< Target running */
    GDB_STATE_STOPPED,      /**< Target stopped (at breakpoint) */
} gdb_state_t;

/**
 * @brief GDB server structure
 */
typedef struct {
    /* Network */
#ifdef _WIN32
    uintptr_t           listen_socket;  /**< SOCKET is uintptr_t on Windows */
    uintptr_t           client_socket;
#else
    int                 listen_socket;
    int                 client_socket;
#endif
    uint16_t            port;
    bool                connected;

    /* State */
    gdb_state_t         state;
    uint32_t            current_thread;     /**< Selected thread (core) for g/p */
    uint32_t            continue_thread;    /**< Selected thread (core) for c/s */

    /* Packet handling */
    char                rx_buffer[GDB_MAX_PACKET_SIZE];
    char                tx_buffer[GDB_MAX_PACKET_SIZE];
    size_t              rx_len;

    /* Breakpoints */
    gdb_breakpoint_t    breakpoints[GDB_MAX_BREAKPOINTS];
    uint32_t            num_breakpoints;

    /* Target system */
    multicore_system_t *mc;
    mem_system_t       *mem;

    /* Stop reason */
    uint8_t             stop_signal;        /**< Signal number (SIGTRAP=5) */
    uint32_t            stop_thread;        /**< Thread that caused stop */

    /* Options */
    bool                no_ack_mode;        /**< QStartNoAckMode enabled */
    bool                verbose;            /**< Print debug messages */

} gdb_server_t;

/* ==========================================================================
 * GDB Server Lifecycle
 * ========================================================================== */

/**
 * @brief Create GDB server
 *
 * @param mc    Multi-core system to debug
 * @param mem   Memory system
 * @param port  TCP port to listen on
 * @return      Pointer to server, or NULL on error
 */
gdb_server_t* gdb_server_create(multicore_system_t *mc, mem_system_t *mem, uint16_t port);

/**
 * @brief Destroy GDB server
 *
 * @param server    Server to destroy
 */
void gdb_server_destroy(gdb_server_t *server);

/**
 * @brief Start listening for connections
 *
 * @param server    GDB server
 * @return          0 on success, -1 on error
 */
int gdb_server_start(gdb_server_t *server);

/**
 * @brief Stop server and close connections
 *
 * @param server    GDB server
 */
void gdb_server_stop(gdb_server_t *server);

/* ==========================================================================
 * GDB Server Operation
 * ========================================================================== */

/**
 * @brief Poll for GDB activity (non-blocking)
 *
 * @param server    GDB server
 * @return          true if activity handled, false otherwise
 *
 * Checks for:
 * - New connections
 * - Incoming packets
 * - Ctrl+C break request
 */
bool gdb_server_poll(gdb_server_t *server);

/**
 * @brief Wait for GDB command (blocking)
 *
 * @param server    GDB server
 * @param timeout_ms    Timeout in milliseconds (0 = infinite)
 * @return          true if command received, false on timeout
 */
bool gdb_server_wait(gdb_server_t *server, uint32_t timeout_ms);

/**
 * @brief Run target and handle GDB commands
 *
 * @param server    GDB server
 * @return          0 on normal exit, -1 on error
 *
 * Main debug loop:
 * 1. Wait for 'c' or 's' command
 * 2. Execute target
 * 3. Stop on breakpoint/signal
 * 4. Send stop reply
 * 5. Repeat
 */
int gdb_server_run(gdb_server_t *server);

/* ==========================================================================
 * Target Control
 * ========================================================================== */

/**
 * @brief Notify GDB of target stop
 *
 * @param server    GDB server
 * @param signal    Stop signal (5=SIGTRAP)
 * @param thread    Thread (core) that stopped
 */
void gdb_server_notify_stop(gdb_server_t *server, uint8_t signal, uint32_t thread);

/**
 * @brief Check if any breakpoint is hit
 *
 * @param server    GDB server
 * @param pc        Current PC
 * @return          Breakpoint index if hit, -1 otherwise
 */
int gdb_server_check_breakpoint(gdb_server_t *server, uint32_t pc);

/* ==========================================================================
 * Breakpoint Management
 * ========================================================================== */

/**
 * @brief Add breakpoint
 *
 * @param server    GDB server
 * @param addr      Address
 * @param type      Breakpoint type
 * @return          0 on success, -1 on error
 */
int gdb_server_add_breakpoint(gdb_server_t *server, uint32_t addr, breakpoint_type_t type);

/**
 * @brief Remove breakpoint
 *
 * @param server    GDB server
 * @param addr      Address
 * @return          0 on success, -1 on error
 */
int gdb_server_remove_breakpoint(gdb_server_t *server, uint32_t addr);

#ifdef __cplusplus
}
#endif

#endif /* GDB_SERVER_H */
