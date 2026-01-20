// Example: C data structures for distributed consensus
// Same logic must match Rust implementation exactly

#include <stdint.h>

// Heartbeat message - fits in single CAN-FD frame (12 bytes)
typedef struct {
    uint8_t  module_id;
    uint8_t  state;          // IDLE, CHARGING, FAULT, etc.
    uint16_t output_voltage; // 0.1V resolution
    uint16_t output_current; // 0.1A resolution
    uint8_t  temperature;    // °C
    uint8_t  soc_estimate;
    uint32_t uptime_seconds;
    uint8_t  neighbor_count;
} heartbeat_msg_t;

// Raft-inspired consensus state
typedef enum {
    ROLE_FOLLOWER,
    ROLE_CANDIDATE,
    ROLE_LEADER
} raft_role_t;

typedef struct {
    uint32_t current_term;
    uint8_t  voted_for;      // 0xFF = none
    uint8_t  current_leader; // 0xFF = none
    uint8_t  commit_index;
    uint8_t  last_applied;
} consensus_state_t;

// CAN-FD message IDs - structured allocation
#define MSG_HEARTBEAT      (0 << 8)  // 0x000-0x0FF
#define MSG_CONSENSUS      (1 << 8)  // 0x100-0x1FF
#define MSG_POWER_CMD      (2 << 8)  // 0x200-0x2FF
#define MSG_FAULT          (3 << 8)  // 0x300-0x3FF
#define MSG_VEHICLE        (5 << 8)  // 0x500-0x5FF (ISO 15118)

// State machine - explicit, deterministic transitions
typedef enum {
    STATE_OFFLINE,
    STATE_INITIALIZING,
    STATE_ONLINE,
    STATE_FAULT
} module_state_t;

// Both C and Rust implementations must:
// 1. Parse same input bytes identically
// 2. Produce same output bytes for same input state
// 3. Pass all shared JSON test vectors
