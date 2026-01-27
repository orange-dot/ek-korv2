/**
 * @file raft_canfd_sim.c
 * @brief EK-KOR2 Raft CAN-FD election simulator (host-side)
 *
 * Minimal discrete-time simulator to validate leader election latency
 * under a simplified CAN-FD broadcast model.
 *
 * NOTE: This is an initial harness for development. It is not a full
 * CAN-FD bus model and does not yet simulate arbitration collisions,
 * bus load, or retransmissions.
 */

#include "ekk/ekk_hal.h"
#include "ekk/ekk_partition.h"
#include "ekk/ekk_raft.h"

#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdarg.h>
#include <stdlib.h>
#include <string.h>

/* ========================================================================== */
/* SIM CONFIG                                                                 */
/* ========================================================================== */

#define SIM_MAX_NODES           32
#define SIM_MAX_FRAMES          4096

#define SIM_DEFAULT_NODES       9
#define SIM_DEFAULT_TICK_US     1000
#define SIM_DEFAULT_DURATION_US 2000000

/* CAN-FD timing approximation (very rough). */
#define SIM_ARB_RATE_BPS        1000000   /* 1 Mbps arbitration */
#define SIM_DATA_RATE_BPS       5000000   /* 5 Mbps data phase */
#define SIM_ARB_BITS            64
#define SIM_DATA_OVERHEAD_BITS  48

/* ========================================================================== */
/* SIM BUS                                                                    */
/* ========================================================================== */

typedef struct {
    bool valid;
    ekk_time_us_t deliver_at;
    ekk_module_id_t sender;
    ekk_module_id_t dest; /* 0xFF broadcast */
    ekk_msg_type_t type;
    uint8_t data[64];
    uint32_t len;
} sim_frame_t;

static sim_frame_t g_frames[SIM_MAX_FRAMES];
static size_t g_frame_count = 0;

static ekk_time_us_t g_now = 0;
static ekk_module_id_t g_sender_id = 1;

static ekk_time_us_t sim_frame_time_us(uint32_t len) {
    const uint64_t arb_us = (uint64_t)SIM_ARB_BITS * 1000000ULL / SIM_ARB_RATE_BPS;
    const uint64_t data_bits = SIM_DATA_OVERHEAD_BITS + (uint64_t)len * 8ULL;
    const uint64_t data_us = data_bits * 1000000ULL / SIM_DATA_RATE_BPS;
    return (ekk_time_us_t)(arb_us + data_us);
}

static void sim_enqueue_frame(ekk_module_id_t sender,
                              ekk_module_id_t dest,
                              ekk_msg_type_t type,
                              const void *data,
                              uint32_t len) {
    if (g_frame_count >= SIM_MAX_FRAMES) {
        return;
    }

    sim_frame_t *f = &g_frames[g_frame_count++];
    memset(f, 0, sizeof(*f));
    f->valid = true;
    f->sender = sender;
    f->dest = dest;
    f->type = type;
    f->len = len;
    if (len > 0 && data != NULL) {
        memcpy(f->data, data, len);
    }
    f->deliver_at = g_now + sim_frame_time_us(len);
}

/* ========================================================================== */
/* SIM NODES                                                                  */
/* ========================================================================== */

typedef struct {
    ekk_module_id_t id;
    ekk_partition_ctx_t partition;
    ekk_raft_ctx_t raft;
} sim_node_t;

static sim_node_t g_nodes[SIM_MAX_NODES];
static size_t g_node_count = 0;

typedef struct {
    ekk_module_id_t first_leader;
    ekk_time_us_t first_leader_time;
} sim_metrics_t;

static sim_metrics_t g_metrics = {0, 0};

static sim_node_t *sim_find_node(ekk_module_id_t id) {
    for (size_t i = 0; i < g_node_count; i++) {
        if (g_nodes[i].id == id) {
            return &g_nodes[i];
        }
    }
    return NULL;
}

static void sim_on_leader(void *user_data) {
    sim_node_t *node = (sim_node_t *)user_data;
    if (g_metrics.first_leader == 0) {
        g_metrics.first_leader = node->id;
        g_metrics.first_leader_time = g_now;
    }
}

static void sim_init_nodes(size_t count) {
    if (count > SIM_MAX_NODES) {
        count = SIM_MAX_NODES;
    }

    g_node_count = count;
    for (size_t i = 0; i < count; i++) {
        sim_node_t *node = &g_nodes[i];
        memset(node, 0, sizeof(*node));
        node->id = (ekk_module_id_t)(i + 1);

        ekk_partition_init(&node->partition, (uint32_t)count);
        ekk_raft_init(&node->raft, node->id, (uint8_t)count, &node->partition);
        ekk_raft_set_callbacks(&node->raft, sim_on_leader, NULL, NULL, node);
    }
}

static void sim_deliver_frame(sim_node_t *node, const sim_frame_t *frame) {
    ekk_hal_set_module_id(node->id);

    switch (frame->type) {
        case EKK_MSG_RAFT_HEARTBEAT: {
            const ekk_raft_heartbeat_msg_t *msg = (const ekk_raft_heartbeat_msg_t *)frame->data;
            ekk_raft_on_heartbeat(&node->raft, msg->leader_id, msg->term, g_now);
        } break;
        case EKK_MSG_RAFT_REQUEST_VOTE: {
            const ekk_raft_vote_request_msg_t *msg = (const ekk_raft_vote_request_msg_t *)frame->data;
            (void)ekk_raft_on_vote_request(&node->raft, msg->candidate_id, msg->term, g_now);
        } break;
        case EKK_MSG_RAFT_VOTE_RESPONSE: {
            const ekk_raft_vote_response_msg_t *msg = (const ekk_raft_vote_response_msg_t *)frame->data;
            ekk_raft_on_vote_response(&node->raft, msg->voter_id, msg->term, msg->vote_granted != 0, g_now);
        } break;
        default:
            break;
    }
}

static void sim_bus_flush(ekk_time_us_t now) {
    bool progress = true;
    while (progress) {
        progress = false;
        for (size_t i = 0; i < g_frame_count; i++) {
            sim_frame_t *f = &g_frames[i];
            if (!f->valid || f->deliver_at > now) {
                continue;
            }

            /* Deliver */
            if (f->dest == EKK_BROADCAST_ID) {
                for (size_t n = 0; n < g_node_count; n++) {
                    sim_deliver_frame(&g_nodes[n], f);
                }
            } else {
                sim_node_t *target = sim_find_node(f->dest);
                if (target != NULL) {
                    sim_deliver_frame(target, f);
                }
            }

            f->valid = false;
            progress = true;
        }
    }
}

static void sim_node_tick(sim_node_t *node, ekk_time_us_t now) {
    ekk_hal_set_module_id(node->id);
    ekk_raft_tick(&node->raft, now);
}

/* ========================================================================== */
/* SIM HAL (minimal)                                                          */
/* ========================================================================== */

ekk_time_us_t ekk_hal_time_us(void) {
    return g_now;
}

void ekk_hal_set_mock_time(ekk_time_us_t time_us) {
    g_now = time_us;
}

void ekk_hal_delay_us(uint32_t us) {
    g_now += us;
}

ekk_error_t ekk_hal_send(ekk_module_id_t dest_id,
                          ekk_msg_type_t msg_type,
                          const void *data,
                          uint32_t len) {
    sim_enqueue_frame(g_sender_id, dest_id, msg_type, data, len);
    return EKK_OK;
}

ekk_error_t ekk_hal_broadcast(ekk_msg_type_t msg_type,
                               const void *data,
                               uint32_t len) {
    sim_enqueue_frame(g_sender_id, EKK_BROADCAST_ID, msg_type, data, len);
    return EKK_OK;
}

ekk_error_t ekk_hal_recv(ekk_module_id_t *sender_id,
                          ekk_msg_type_t *msg_type,
                          void *data,
                          uint32_t *len) {
    EKK_UNUSED(sender_id);
    EKK_UNUSED(msg_type);
    EKK_UNUSED(data);
    EKK_UNUSED(len);
    return EKK_ERR_NOT_FOUND;
}

void ekk_hal_set_recv_callback(ekk_hal_recv_cb callback) {
    (void)callback;
}

uint32_t ekk_hal_critical_enter(void) {
    return 0;
}

void ekk_hal_critical_exit(uint32_t state) {
    (void)state;
}

void ekk_hal_memory_barrier(void) {
}

ekk_error_t ekk_hal_init(void) {
    return EKK_OK;
}

const char* ekk_hal_platform_name(void) {
    return "SIM";
}

ekk_module_id_t ekk_hal_get_module_id(void) {
    return g_sender_id;
}

void ekk_hal_set_module_id(ekk_module_id_t id) {
    g_sender_id = id;
}

void ekk_hal_printf(const char *fmt, ...) {
    va_list args;
    va_start(args, fmt);
    vprintf(fmt, args);
    va_end(args);
    fflush(stdout);
}

void ekk_hal_assert_fail(const char *file, int line, const char *expr) {
    fprintf(stderr, "ASSERTION FAILED: %s:%d: %s\n", file, line, expr);
    fflush(stderr);
    abort();
}

/* ========================================================================== */
/* MAIN                                                                       */
/* ========================================================================== */

int main(int argc, char **argv) {
    size_t nodes = SIM_DEFAULT_NODES;
    ekk_time_us_t duration = SIM_DEFAULT_DURATION_US;
    ekk_time_us_t tick_us = SIM_DEFAULT_TICK_US;

    if (argc > 1) {
        nodes = (size_t)atoi(argv[1]);
    }
    if (argc > 2) {
        duration = (ekk_time_us_t)strtoull(argv[2], NULL, 10);
    }
    if (argc > 3) {
        tick_us = (ekk_time_us_t)strtoull(argv[3], NULL, 10);
    }

    sim_init_nodes(nodes);

    for (g_now = 0; g_now <= duration; g_now += tick_us) {
        for (size_t i = 0; i < g_node_count; i++) {
            sim_node_tick(&g_nodes[i], g_now);
        }
        sim_bus_flush(g_now);

        if (g_metrics.first_leader != 0) {
            break;
        }
    }

    if (g_metrics.first_leader != 0) {
        printf("Leader elected: node %u at %llu us\n",
               (unsigned)g_metrics.first_leader,
               (unsigned long long)g_metrics.first_leader_time);
    } else {
        printf("No leader elected within %llu us\n",
               (unsigned long long)duration);
    }

    return 0;
}
