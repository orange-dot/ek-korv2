/**
 * @file gdb_server.c
 * @brief GDB Remote Serial Protocol Server Implementation
 *
 * Full GDB RSP implementation for TC397XP debugging.
 */

#include "gdb_server.h"
#include "tricore_exec.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

/* Platform-specific socket includes */
#ifdef _WIN32
    #define WIN32_LEAN_AND_MEAN
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #pragma comment(lib, "ws2_32.lib")
    typedef SOCKET socket_t;
    #define INVALID_SOCK INVALID_SOCKET
    #define SOCKET_ERROR_VAL SOCKET_ERROR
    #define close_socket closesocket
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <arpa/inet.h>
    #include <unistd.h>
    #include <fcntl.h>
    #include <errno.h>
    typedef int socket_t;
    #define INVALID_SOCK (-1)
    #define SOCKET_ERROR_VAL (-1)
    #define close_socket close
#endif

/* External memory functions */
extern uint32_t mem_read32(mem_system_t *mem, uint32_t addr);
extern uint8_t mem_read8(mem_system_t *mem, uint32_t addr);
extern void mem_write32(mem_system_t *mem, uint32_t addr, uint32_t value);
extern void mem_write8(mem_system_t *mem, uint32_t addr, uint8_t value);
extern void mem_set_core(mem_system_t *mem, uint32_t core_id);

/* TriCore DEBUG instruction opcode (16-bit) */
#define DEBUG_OPCODE    0x0100

/* Signal numbers */
#define SIGTRAP     5
#define SIGINT      2

/* ==========================================================================
 * Helper Functions
 * ========================================================================== */

static int hex_to_int(char c)
{
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

static char int_to_hex(int n)
{
    static const char hex[] = "0123456789abcdef";
    return hex[n & 0xF];
}

static void hex_to_bytes(const char *hex, uint8_t *bytes, size_t len)
{
    for (size_t i = 0; i < len; i++) {
        int hi = hex_to_int(hex[i * 2]);
        int lo = hex_to_int(hex[i * 2 + 1]);
        bytes[i] = (hi << 4) | lo;
    }
}

static void bytes_to_hex(const uint8_t *bytes, char *hex, size_t len)
{
    for (size_t i = 0; i < len; i++) {
        hex[i * 2] = int_to_hex(bytes[i] >> 4);
        hex[i * 2 + 1] = int_to_hex(bytes[i] & 0xF);
    }
    hex[len * 2] = '\0';
}

static uint8_t compute_checksum(const char *data, size_t len)
{
    uint8_t sum = 0;
    for (size_t i = 0; i < len; i++) {
        sum += (uint8_t)data[i];
    }
    return sum;
}

/* ==========================================================================
 * Socket Helpers
 * ========================================================================== */

static int socket_init(void)
{
#ifdef _WIN32
    WSADATA wsa;
    return WSAStartup(MAKEWORD(2, 2), &wsa);
#else
    return 0;
#endif
}

static void socket_cleanup(void)
{
#ifdef _WIN32
    WSACleanup();
#endif
}

static int socket_set_nonblocking(socket_t sock)
{
#ifdef _WIN32
    u_long mode = 1;
    return ioctlsocket(sock, FIONBIO, &mode);
#else
    int flags = fcntl(sock, F_GETFL, 0);
    return fcntl(sock, F_SETFL, flags | O_NONBLOCK);
#endif
}

/* ==========================================================================
 * GDB Server Lifecycle
 * ========================================================================== */

gdb_server_t* gdb_server_create(multicore_system_t *mc, mem_system_t *mem, uint16_t port)
{
    gdb_server_t *server = calloc(1, sizeof(gdb_server_t));
    if (!server) return NULL;

    server->mc = mc;
    server->mem = mem;
    server->port = port;
    server->listen_socket = INVALID_SOCK;
    server->client_socket = INVALID_SOCK;
    server->state = GDB_STATE_IDLE;
    server->current_thread = 1;  /* GDB uses 1-based thread IDs */
    server->continue_thread = 0; /* 0 = all threads */
    server->verbose = true;

    if (socket_init() != 0) {
        free(server);
        return NULL;
    }

    return server;
}

void gdb_server_destroy(gdb_server_t *server)
{
    if (!server) return;

    gdb_server_stop(server);
    socket_cleanup();
    free(server);
}

int gdb_server_start(gdb_server_t *server)
{
    if (!server) return -1;

    /* Create socket */
    server->listen_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server->listen_socket == INVALID_SOCK) {
        perror("socket");
        return -1;
    }

    /* Set SO_REUSEADDR */
    int opt = 1;
#ifdef _WIN32
    setsockopt(server->listen_socket, SOL_SOCKET, SO_REUSEADDR,
               (const char*)&opt, sizeof(opt));
#else
    setsockopt(server->listen_socket, SOL_SOCKET, SO_REUSEADDR,
               &opt, sizeof(opt));
#endif

    /* Bind */
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(server->port);

    if (bind(server->listen_socket, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close_socket(server->listen_socket);
        server->listen_socket = INVALID_SOCK;
        return -1;
    }

    /* Listen */
    if (listen(server->listen_socket, 1) < 0) {
        perror("listen");
        close_socket(server->listen_socket);
        server->listen_socket = INVALID_SOCK;
        return -1;
    }

    /* Set non-blocking */
    socket_set_nonblocking(server->listen_socket);

    server->state = GDB_STATE_WAITING;

    if (server->verbose) {
        printf("GDB server listening on port %u\n", server->port);
        printf("Connect with: target remote localhost:%u\n", server->port);
    }

    return 0;
}

void gdb_server_stop(gdb_server_t *server)
{
    if (!server) return;

    if (server->client_socket != INVALID_SOCK) {
        close_socket(server->client_socket);
        server->client_socket = INVALID_SOCK;
    }

    if (server->listen_socket != INVALID_SOCK) {
        close_socket(server->listen_socket);
        server->listen_socket = INVALID_SOCK;
    }

    server->connected = false;
    server->state = GDB_STATE_IDLE;
}

/* ==========================================================================
 * Packet I/O
 * ========================================================================== */

static int send_packet(gdb_server_t *server, const char *data)
{
    size_t len = strlen(data);
    uint8_t checksum = compute_checksum(data, len);

    /* Format: $data#XX */
    char *pkt = server->tx_buffer;
    int pkt_len = snprintf(pkt, GDB_MAX_PACKET_SIZE, "$%s#%02x", data, checksum);

    if (server->verbose) {
        printf("GDB TX: %s\n", pkt);
    }

    int sent = send(server->client_socket, pkt, pkt_len, 0);
    return (sent == pkt_len) ? 0 : -1;
}

static int send_ok(gdb_server_t *server)
{
    return send_packet(server, "OK");
}

static int send_error(gdb_server_t *server, int err)
{
    char buf[8];
    snprintf(buf, sizeof(buf), "E%02x", err);
    return send_packet(server, buf);
}

static int send_empty(gdb_server_t *server)
{
    return send_packet(server, "");
}

static int recv_packet(gdb_server_t *server, char *data, size_t max_len)
{
    /* Read until we get a complete packet: $...#XX */
    char *buf = server->rx_buffer;
    size_t buf_len = server->rx_len;

    while (1) {
        /* Try to read more data */
        int n = recv(server->client_socket, buf + buf_len,
                     GDB_MAX_PACKET_SIZE - buf_len - 1, 0);

        if (n > 0) {
            buf_len += n;
            buf[buf_len] = '\0';
        } else if (n == 0) {
            /* Connection closed */
            return -1;
        } else {
#ifdef _WIN32
            if (WSAGetLastError() == WSAEWOULDBLOCK) {
                server->rx_len = buf_len;
                return 0;  /* No data available */
            }
#else
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                server->rx_len = buf_len;
                return 0;
            }
#endif
            return -1;  /* Error */
        }

        /* Check for Ctrl+C (0x03) */
        for (size_t i = 0; i < buf_len; i++) {
            if (buf[i] == 0x03) {
                /* Remove the interrupt byte */
                memmove(buf + i, buf + i + 1, buf_len - i);
                buf_len--;
                server->rx_len = buf_len;

                /* Handle interrupt */
                multicore_halt_all(server->mc);
                server->state = GDB_STATE_STOPPED;
                gdb_server_notify_stop(server, SIGINT, 1);
                return 0;
            }
        }

        /* Look for packet start and end */
        char *start = strchr(buf, '$');
        if (!start) {
            buf_len = 0;
            continue;
        }

        char *end = strchr(start, '#');
        if (!end || (end - start + 3) > (int)buf_len) {
            /* Incomplete packet */
            server->rx_len = buf_len;
            return 0;
        }

        /* Extract data between $ and # */
        size_t data_len = end - start - 1;
        if (data_len >= max_len) {
            return -1;  /* Buffer too small */
        }

        memcpy(data, start + 1, data_len);
        data[data_len] = '\0';

        /* Verify checksum */
        uint8_t expected = compute_checksum(data, data_len);
        int hi = hex_to_int(end[1]);
        int lo = hex_to_int(end[2]);
        uint8_t received = (hi << 4) | lo;

        if (!server->no_ack_mode) {
            /* Send ACK/NAK */
            if (expected == received) {
                send(server->client_socket, "+", 1, 0);
            } else {
                send(server->client_socket, "-", 1, 0);
                buf_len = 0;
                server->rx_len = 0;
                return 0;  /* Request retransmit */
            }
        }

        /* Remove processed data from buffer */
        char *after_pkt = end + 3;
        size_t remaining = buf_len - (after_pkt - buf);
        memmove(buf, after_pkt, remaining);
        buf_len = remaining;
        server->rx_len = buf_len;

        if (server->verbose) {
            printf("GDB RX: $%s#%02x\n", data, received);
        }

        return (int)data_len;
    }
}

/* ==========================================================================
 * Register Access
 * ========================================================================== */

static cpu_state_t* get_selected_core(gdb_server_t *server)
{
    uint32_t core_id = server->current_thread - 1;  /* Convert to 0-based */
    if (core_id >= server->mc->num_cores) {
        core_id = 0;
    }
    return &server->mc->cores[core_id];
}

/* TriCore register order for GDB (tricore-elf-gdb):
 * D0-D15 (16 regs), A0-A15 (16 regs),
 * LCX, FCX, PCX(PCXI), PSW, PC, ICR, ISP, BTV, BIV, SYSCON, PCON0, DCON0
 * Total: 44 registers, each 32-bit
 */
#define NUM_REGS 44
#define REG_SIZE 4

static void read_all_registers(gdb_server_t *server, char *hex_out)
{
    cpu_state_t *cpu = get_selected_core(server);
    uint32_t regs[NUM_REGS];
    memset(regs, 0, sizeof(regs));

    /* D0-D15 */
    for (int i = 0; i < 16; i++) {
        regs[i] = cpu->d[i];
    }
    /* A0-A15 */
    for (int i = 0; i < 16; i++) {
        regs[16 + i] = cpu->a[i];
    }
    /* Special regs - order matches tricore-elf-gdb expectation */
    regs[32] = cpu->lcx;     /* LCX */
    regs[33] = cpu->fcx;     /* FCX */
    regs[34] = cpu->pcxi;    /* PCX (PCXI) */
    regs[35] = cpu->psw;     /* PSW */
    regs[36] = cpu->pc;      /* PC */
    regs[37] = cpu->icr;     /* ICR */
    regs[38] = cpu->isp;     /* ISP */
    regs[39] = cpu->btv;     /* BTV */
    regs[40] = cpu->biv;     /* BIV */
    regs[41] = cpu->syscon;  /* SYSCON */
    regs[42] = 0;            /* PCON0 */
    regs[43] = 0;            /* DCON0 */

    /* Convert to hex (little-endian) */
    char *p = hex_out;
    for (int i = 0; i < NUM_REGS; i++) {
        uint8_t bytes[4];
        bytes[0] = regs[i] & 0xFF;
        bytes[1] = (regs[i] >> 8) & 0xFF;
        bytes[2] = (regs[i] >> 16) & 0xFF;
        bytes[3] = (regs[i] >> 24) & 0xFF;
        bytes_to_hex(bytes, p, 4);
        p += 8;
    }
    *p = '\0';
}

static void write_all_registers(gdb_server_t *server, const char *hex_in)
{
    cpu_state_t *cpu = get_selected_core(server);
    uint32_t regs[NUM_REGS];

    /* Parse hex (little-endian) */
    const char *p = hex_in;
    for (int i = 0; i < NUM_REGS; i++) {
        uint8_t bytes[4];
        hex_to_bytes(p, bytes, 4);
        regs[i] = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
        p += 8;
    }

    /* D0-D15 */
    for (int i = 0; i < 16; i++) {
        cpu->d[i] = regs[i];
    }
    /* A0-A15 */
    for (int i = 0; i < 16; i++) {
        cpu->a[i] = regs[16 + i];
    }
    /* Special regs - order matches tricore-elf-gdb expectation */
    cpu->lcx = regs[32];
    cpu->fcx = regs[33];
    cpu->pcxi = regs[34];
    cpu->psw = regs[35];
    cpu->pc = regs[36];
    cpu->icr = regs[37];
    cpu->isp = regs[38];
    cpu->btv = regs[39];
    cpu->biv = regs[40];
    cpu->syscon = regs[41];
    /* regs[42], regs[43] = PCON0, DCON0 - ignored */
}

static void read_register(gdb_server_t *server, int reg, char *hex_out)
{
    cpu_state_t *cpu = get_selected_core(server);
    uint32_t value = 0;

    if (reg < 16) {
        value = cpu->d[reg];
    } else if (reg < 32) {
        value = cpu->a[reg - 16];
    } else {
        /* Special regs - order matches tricore-elf-gdb */
        switch (reg) {
            case 32: value = cpu->lcx; break;
            case 33: value = cpu->fcx; break;
            case 34: value = cpu->pcxi; break;
            case 35: value = cpu->psw; break;
            case 36: value = cpu->pc; break;
            case 37: value = cpu->icr; break;
            case 38: value = cpu->isp; break;
            case 39: value = cpu->btv; break;
            case 40: value = cpu->biv; break;
            case 41: value = cpu->syscon; break;
            default: value = 0; break;
        }
    }

    /* Little-endian hex */
    uint8_t bytes[4];
    bytes[0] = value & 0xFF;
    bytes[1] = (value >> 8) & 0xFF;
    bytes[2] = (value >> 16) & 0xFF;
    bytes[3] = (value >> 24) & 0xFF;
    bytes_to_hex(bytes, hex_out, 4);
}

/* ==========================================================================
 * Command Handlers
 * ========================================================================== */

static void handle_query(gdb_server_t *server, const char *cmd)
{
    if (strncmp(cmd, "Supported", 9) == 0) {
        /* Tell GDB what we support */
        send_packet(server, "PacketSize=1000;qXfer:features:read+;"
                           "multiprocess-;QStartNoAckMode+");
    }
    else if (strcmp(cmd, "Attached") == 0) {
        send_packet(server, "1");  /* Attached to existing process */
    }
    else if (strcmp(cmd, "C") == 0) {
        /* Current thread */
        char buf[16];
        snprintf(buf, sizeof(buf), "QC%x", server->current_thread);
        send_packet(server, buf);
    }
    else if (strcmp(cmd, "fThreadInfo") == 0) {
        /* First batch of thread IDs (cores as threads) */
        char buf[64];
        char *p = buf;
        p += sprintf(p, "m");
        for (uint32_t i = 0; i < server->mc->num_cores; i++) {
            if (i > 0) *p++ = ',';
            p += sprintf(p, "%x", i + 1);  /* 1-based */
        }
        send_packet(server, buf);
    }
    else if (strcmp(cmd, "sThreadInfo") == 0) {
        /* Subsequent thread info (end of list) */
        send_packet(server, "l");
    }
    else if (strncmp(cmd, "ThreadExtraInfo,", 16) == 0) {
        /* Thread description */
        uint32_t tid;
        sscanf(cmd + 16, "%x", &tid);
        char desc[64];
        snprintf(desc, sizeof(desc), "Core %u", tid - 1);

        /* Convert to hex */
        char hex[128];
        bytes_to_hex((uint8_t*)desc, hex, strlen(desc));
        send_packet(server, hex);
    }
    else if (strncmp(cmd, "Xfer:features:read:target.xml", 29) == 0) {
        /* Target description - TriCore registers */
        const char *desc =
            "<?xml version=\"1.0\"?>"
            "<!DOCTYPE target SYSTEM \"gdb-target.dtd\">"
            "<target version=\"1.0\">"
            "<architecture>tricore</architecture>"
            "</target>";

        char buf[512];
        snprintf(buf, sizeof(buf), "l%s", desc);
        send_packet(server, buf);
    }
    else {
        /* Unknown query */
        send_empty(server);
    }
}

static void handle_set(gdb_server_t *server, const char *cmd)
{
    if (strcmp(cmd, "StartNoAckMode") == 0) {
        server->no_ack_mode = true;
        send_ok(server);
    }
    else {
        send_empty(server);
    }
}

static void handle_command(gdb_server_t *server, const char *cmd)
{
    char response[GDB_MAX_PACKET_SIZE];

    switch (cmd[0]) {
    case '?':  /* Stop reason */
        snprintf(response, sizeof(response), "T%02xthread:%x;",
                 server->stop_signal, server->stop_thread);
        send_packet(server, response);
        break;

    case 'g':  /* Read all registers */
        read_all_registers(server, response);
        send_packet(server, response);
        break;

    case 'G':  /* Write all registers */
        write_all_registers(server, cmd + 1);
        send_ok(server);
        break;

    case 'p':  /* Read single register */
        {
            int reg;
            sscanf(cmd + 1, "%x", &reg);
            read_register(server, reg, response);
            send_packet(server, response);
        }
        break;

    case 'P':  /* Write single register */
        {
            int reg;
            char hex[16];
            if (sscanf(cmd + 1, "%x=%s", &reg, hex) == 2) {
                /* TODO: Implement single register write */
                send_ok(server);
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'm':  /* Read memory */
        {
            uint32_t addr, len;
            if (sscanf(cmd + 1, "%x,%x", &addr, &len) == 2) {
                if (len > (GDB_MAX_PACKET_SIZE - 1) / 2) {
                    len = (GDB_MAX_PACKET_SIZE - 1) / 2;
                }

                char *p = response;
                mem_set_core(server->mem, server->current_thread - 1);
                for (uint32_t i = 0; i < len; i++) {
                    uint8_t byte = mem_read8(server->mem, addr + i);
                    *p++ = int_to_hex(byte >> 4);
                    *p++ = int_to_hex(byte & 0xF);
                }
                *p = '\0';
                send_packet(server, response);
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'M':  /* Write memory */
        {
            uint32_t addr, len;
            char *colon = strchr(cmd, ':');
            if (colon && sscanf(cmd + 1, "%x,%x", &addr, &len) == 2) {
                const char *hex = colon + 1;
                mem_set_core(server->mem, server->current_thread - 1);
                for (uint32_t i = 0; i < len; i++) {
                    int hi = hex_to_int(hex[i * 2]);
                    int lo = hex_to_int(hex[i * 2 + 1]);
                    if (hi < 0 || lo < 0) break;
                    mem_write8(server->mem, addr + i, (hi << 4) | lo);
                }
                send_ok(server);
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'c':  /* Continue */
        {
            uint32_t addr = 0;
            if (cmd[1] != '\0') {
                sscanf(cmd + 1, "%x", &addr);
                get_selected_core(server)->pc = addr;
            }
            server->state = GDB_STATE_RUNNING;
            multicore_resume_all(server->mc);
        }
        break;

    case 's':  /* Single step */
        {
            uint32_t addr = 0;
            if (cmd[1] != '\0') {
                sscanf(cmd + 1, "%x", &addr);
                get_selected_core(server)->pc = addr;
            }

            /* Step one instruction */
            cpu_state_t *cpu = get_selected_core(server);
            uint32_t core_id = server->current_thread - 1;
            multicore_step_core(server->mc, core_id);

            /* Send stop reply */
            gdb_server_notify_stop(server, SIGTRAP, server->current_thread);
        }
        break;

    case 'H':  /* Set thread */
        {
            char op = cmd[1];
            int tid;
            sscanf(cmd + 2, "%x", &tid);

            if (tid == -1 || tid == 0) {
                tid = 1;  /* All threads or any thread -> use core 0 */
            }

            if (op == 'g') {
                server->current_thread = tid;
            } else if (op == 'c') {
                server->continue_thread = tid;
            }
            send_ok(server);
        }
        break;

    case 'T':  /* Thread alive? */
        {
            int tid;
            sscanf(cmd + 1, "%x", &tid);
            if (tid > 0 && tid <= (int)server->mc->num_cores) {
                send_ok(server);
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'Z':  /* Insert breakpoint */
        {
            int type;
            uint32_t addr, kind;
            if (sscanf(cmd + 1, "%d,%x,%x", &type, &addr, &kind) >= 2) {
                if (type == 0 || type == 1) {  /* Software or hardware BP */
                    if (gdb_server_add_breakpoint(server, addr,
                            type == 0 ? BP_SOFTWARE : BP_HARDWARE) == 0) {
                        send_ok(server);
                    } else {
                        send_error(server, 1);
                    }
                } else {
                    send_empty(server);  /* Unsupported BP type */
                }
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'z':  /* Remove breakpoint */
        {
            int type;
            uint32_t addr, kind;
            if (sscanf(cmd + 1, "%d,%x,%x", &type, &addr, &kind) >= 2) {
                if (type == 0 || type == 1) {
                    gdb_server_remove_breakpoint(server, addr);
                    send_ok(server);
                } else {
                    send_empty(server);
                }
            } else {
                send_error(server, 1);
            }
        }
        break;

    case 'k':  /* Kill */
        multicore_halt_all(server->mc);
        server->state = GDB_STATE_STOPPED;
        /* Don't send response - GDB expects disconnect */
        break;

    case 'D':  /* Detach */
        send_ok(server);
        server->connected = false;
        server->state = GDB_STATE_WAITING;
        close_socket(server->client_socket);
        server->client_socket = INVALID_SOCK;
        break;

    case 'q':  /* Query */
        handle_query(server, cmd + 1);
        break;

    case 'Q':  /* Set */
        handle_set(server, cmd + 1);
        break;

    case 'v':  /* Extended commands */
        if (strncmp(cmd, "vCont?", 6) == 0) {
            send_packet(server, "vCont;c;s;C;S");
        } else if (strncmp(cmd, "vCont;", 6) == 0) {
            /* Parse vCont command */
            if (strchr(cmd + 6, 'c') || strchr(cmd + 6, 'C')) {
                server->state = GDB_STATE_RUNNING;
                multicore_resume_all(server->mc);
            } else if (strchr(cmd + 6, 's') || strchr(cmd + 6, 'S')) {
                cpu_state_t *cpu = get_selected_core(server);
                uint32_t core_id = server->current_thread - 1;
                multicore_step_core(server->mc, core_id);
                gdb_server_notify_stop(server, SIGTRAP, server->current_thread);
            }
        } else {
            send_empty(server);
        }
        break;

    default:
        send_empty(server);
        break;
    }
}

/* ==========================================================================
 * GDB Server Operation
 * ========================================================================== */

bool gdb_server_poll(gdb_server_t *server)
{
    if (!server) return false;

    /* Check for new connections */
    if (server->state == GDB_STATE_WAITING && server->listen_socket != INVALID_SOCK) {
        struct sockaddr_in client_addr;
        socklen_t addr_len = sizeof(client_addr);

        socket_t client = accept(server->listen_socket,
                                 (struct sockaddr*)&client_addr, &addr_len);

        if (client != INVALID_SOCK) {
            server->client_socket = client;
            server->connected = true;
            server->state = GDB_STATE_STOPPED;
            server->stop_signal = SIGTRAP;
            server->stop_thread = 1;
            server->rx_len = 0;

            socket_set_nonblocking(client);

            if (server->verbose) {
                printf("GDB client connected\n");
            }
            return true;
        }
    }

    /* Process packets if connected */
    if (server->connected && server->client_socket != INVALID_SOCK) {
        char packet[GDB_MAX_PACKET_SIZE];
        int len = recv_packet(server, packet, sizeof(packet));

        if (len > 0) {
            handle_command(server, packet);
            return true;
        } else if (len < 0) {
            /* Connection error */
            server->connected = false;
            server->state = GDB_STATE_WAITING;
            close_socket(server->client_socket);
            server->client_socket = INVALID_SOCK;
            if (server->verbose) {
                printf("GDB client disconnected\n");
            }
        }
    }

    return false;
}

int gdb_server_run(gdb_server_t *server)
{
    if (!server) return -1;

    while (1) {
        /* Handle GDB commands */
        gdb_server_poll(server);

        /* If running, execute target */
        if (server->state == GDB_STATE_RUNNING) {
            /* Step all cores once */
            multicore_step_all(server->mc);

            /* Check for breakpoints */
            for (uint32_t i = 0; i < server->mc->num_cores; i++) {
                cpu_state_t *cpu = &server->mc->cores[i];

                /* Check breakpoints */
                int bp = gdb_server_check_breakpoint(server, cpu->pc);
                if (bp >= 0) {
                    server->state = GDB_STATE_STOPPED;
                    gdb_server_notify_stop(server, SIGTRAP, i + 1);
                    multicore_halt_all(server->mc);
                    break;
                }

                /* Check for DEBUG instruction or halt */
                if (cpu->state == CPU_STATE_DEBUG || cpu->state == CPU_STATE_HALTED) {
                    server->state = GDB_STATE_STOPPED;
                    gdb_server_notify_stop(server, SIGTRAP, i + 1);
                    multicore_halt_all(server->mc);
                    break;
                }
            }

            /* Check if all cores stopped */
            if (!multicore_any_running(server->mc)) {
                server->state = GDB_STATE_STOPPED;
                gdb_server_notify_stop(server, SIGTRAP, 1);
            }
        }

        /* Small delay to prevent busy-wait */
#ifdef _WIN32
        Sleep(1);
#else
        usleep(1000);
#endif
    }

    return 0;
}

/* ==========================================================================
 * Target Control
 * ========================================================================== */

void gdb_server_notify_stop(gdb_server_t *server, uint8_t signal, uint32_t thread)
{
    if (!server || !server->connected) return;

    server->stop_signal = signal;
    server->stop_thread = thread;

    char response[64];
    snprintf(response, sizeof(response), "T%02xthread:%x;", signal, thread);
    send_packet(server, response);
}

int gdb_server_check_breakpoint(gdb_server_t *server, uint32_t pc)
{
    if (!server) return -1;

    for (uint32_t i = 0; i < server->num_breakpoints; i++) {
        if (server->breakpoints[i].active && server->breakpoints[i].addr == pc) {
            return (int)i;
        }
    }
    return -1;
}

/* ==========================================================================
 * Breakpoint Management
 * ========================================================================== */

int gdb_server_add_breakpoint(gdb_server_t *server, uint32_t addr, breakpoint_type_t type)
{
    if (!server || server->num_breakpoints >= GDB_MAX_BREAKPOINTS) {
        return -1;
    }

    /* Check if already exists */
    for (uint32_t i = 0; i < server->num_breakpoints; i++) {
        if (server->breakpoints[i].active && server->breakpoints[i].addr == addr) {
            return 0;  /* Already set */
        }
    }

    /* Find free slot */
    for (uint32_t i = 0; i < GDB_MAX_BREAKPOINTS; i++) {
        if (!server->breakpoints[i].active) {
            server->breakpoints[i].active = true;
            server->breakpoints[i].type = type;
            server->breakpoints[i].addr = addr;

            if (type == BP_SOFTWARE) {
                /* Save original instruction and insert DEBUG */
                server->breakpoints[i].original_insn = mem_read32(server->mem, addr);
                mem_write32(server->mem, addr, DEBUG_OPCODE);
            }

            server->num_breakpoints++;
            return 0;
        }
    }

    return -1;
}

int gdb_server_remove_breakpoint(gdb_server_t *server, uint32_t addr)
{
    if (!server) return -1;

    for (uint32_t i = 0; i < GDB_MAX_BREAKPOINTS; i++) {
        if (server->breakpoints[i].active && server->breakpoints[i].addr == addr) {
            if (server->breakpoints[i].type == BP_SOFTWARE) {
                /* Restore original instruction */
                mem_write32(server->mem, addr, server->breakpoints[i].original_insn);
            }

            server->breakpoints[i].active = false;
            server->num_breakpoints--;
            return 0;
        }
    }

    return -1;
}

/* Legacy compatibility functions */
bool gdb_server_wait(gdb_server_t *server, uint32_t timeout_ms)
{
    (void)timeout_ms;
    return gdb_server_poll(server);
}

void gdb_server_handle_halt(gdb_server_t *server)
{
    gdb_server_notify_stop(server, SIGTRAP, 1);
}
