# JEZGRO-ROB: Robot Controller Firmware

**Version:** 1.0
**Date:** 2026-01-04
**Status:** SPECIFICATION

---

## Document Purpose

This document specifies **JEZGRO-ROB**, the JEZGRO microkernel variant for swap station robot controllers. JEZGRO-ROB provides fault-tolerant motion control, sensor fusion, and coordinated dual-robot operations for battery and charger module swap.

---

## 1. Overview

### 1.1 Robot System Requirements

The swap station employs two specialized robots working in parallel:

| Robot | Designation | Primary Task | Payload | Precision |
|-------|-------------|--------------|---------|-----------|
| **Robot A** | Battery Robot | EK-BAT module swap | 800 kg | ±5 mm |
| **Robot B** | Module Robot | EK3 charger module swap | 50 kg | ±1 mm |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SWAP STATION ROBOT SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────────┐              ┌──────────────────────┐           │
│    │      ROBOT A         │              │      ROBOT B         │           │
│    │   (Battery Swap)     │              │   (Module Swap)      │           │
│    │                      │              │                      │           │
│    │   ┌────────────┐     │              │   ┌────────────┐     │           │
│    │   │ Gantry/    │     │              │   │ 6-Axis     │     │           │
│    │   │ Cartesian  │     │              │   │ Articulated│     │           │
│    │   │            │     │              │   │            │     │           │
│    │   │ Payload:   │     │              │   │ Payload:   │     │           │
│    │   │ 800 kg     │     │              │   │ 50 kg      │     │           │
│    │   └────────────┘     │              │   └────────────┘     │           │
│    │                      │              │                      │           │
│    │   STM32H743 + JEZGRO │              │   STM32H743 + JEZGRO │           │
│    └──────────┬───────────┘              └──────────┬───────────┘           │
│               │                                     │                        │
│               └─────────────┬───────────────────────┘                        │
│                             │                                                │
│                     ┌───────▼───────┐                                        │
│                     │  STATION      │                                        │
│                     │  CONTROLLER   │                                        │
│                     │  (Linux)      │                                        │
│                     └───────────────┘                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why JEZGRO for Robots?

Traditional robot firmware is monolithic with complex state machines. JEZGRO-ROB provides:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-ROB ADVANTAGES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   TRADITIONAL ROBOT FIRMWARE         JEZGRO-ROB                             │
│   ──────────────────────────         ──────────                              │
│   ┌─────────────────────┐           ┌─────────────────────┐                 │
│   │ Monolithic          │           │ Isolated Services   │                 │
│   │ Control Loop        │           │ ┌──────┐ ┌──────┐  │                 │
│   │                     │           │ │MOTION│ │SAFETY│  │                 │
│   │ Sensor bug =        │           │ │CTRL  │ │MON   │  │                 │
│   │ Robot stops         │           │ └──┬───┘ └──┬───┘  │                 │
│   │                     │           │    │        │      │                 │
│   │ No graceful         │           │ ┌──┴────────┴──┐   │                 │
│   │ degradation         │           │ │   KERNEL     │   │                 │
│   │                     │           │ │ (restarts    │   │                 │
│   └─────────────────────┘           │ │  services)   │   │                 │
│                                     │ └──────────────┘   │                 │
│                                     │                    │                 │
│                                     │ Vision crash =     │                 │
│                                     │ Switch to encoders │                 │
│                                     │ Robot continues    │                 │
│                                     └────────────────────┘                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Benefit | Description |
|---------|-------------|
| **Fault Isolation** | Vision failure doesn't stop motion control |
| **Graceful Degradation** | Fall back to encoder-only positioning |
| **Automatic Recovery** | Service restart in <50ms |
| **Dual Robot Sync** | Coordination service handles A↔B protocol |
| **Consistent API** | Same JEZGRO model as EK3, BMS, rack controller |

### 1.3 Hardware Selection

JEZGRO-ROB uses STM32H743 for enhanced computational requirements:

| Parameter | STM32G474 (EK3/BMS) | STM32H743 (Robots) |
|-----------|---------------------|-------------------|
| Core | Cortex-M4 @ 170 MHz | Cortex-M7 @ 480 MHz |
| Flash | 512 KB | 2 MB |
| RAM | 128 KB | 1 MB |
| FPU | Single-precision | Double-precision |
| Cache | None | 16 KB I + 16 KB D |
| DMA | Yes | MDMA + BDMA |
| CAN-FD | 3 interfaces | 2 interfaces |
| Ethernet | No | Yes (MAC) |
| Price | ~$8 | ~$15 |

**Why H743 for robots:**
- Double-precision FPU for kinematics calculations
- More RAM for trajectory buffers and vision processing
- 480 MHz for tight servo loops (1 kHz+)
- Ethernet for camera interface
- Hardware math acceleration

---

## 2. Architecture

### 2.1 Service Configuration (Robot A - Battery)

| ID | Service | Priority | Stack | Memory | Watchdog | Purpose |
|----|---------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Core (privileged) |
| 1 | MOTION_CTRL | CRITICAL | 8 KB | 64 KB | 10 ms | Servo loops, kinematics |
| 2 | TRAJECTORY | HIGH | 8 KB | 128 KB | 50 ms | Path planning, spline |
| 3 | SENSOR_FUSION | HIGH | 8 KB | 64 KB | 20 ms | IMU, encoders, limits |
| 4 | SAFETY_MONITOR | CRITICAL | 4 KB | 16 KB | 20 ms | E-stop, collision |
| 5 | COORDINATION | MEDIUM | 4 KB | 32 KB | 100 ms | Robot A↔B sync |
| 6 | GRIPPER_CTRL | HIGH | 4 KB | 16 KB | 50 ms | End effector control |
| 7 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Station communication |
| 8 | VISION_PROC | MEDIUM | 8 KB | 128 KB | 200 ms | Camera alignment |
| 9 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Event logging |

**Total RAM:** ~512 KB of 1 MB available

### 2.2 Service Configuration (Robot B - Module)

| ID | Service | Priority | Stack | Memory | Watchdog | Purpose |
|----|---------|----------|-------|--------|----------|---------|
| 0 | KERNEL | - | 4 KB | 16 KB | - | Core (privileged) |
| 1 | MOTION_CTRL | CRITICAL | 8 KB | 64 KB | 5 ms | High-precision servo |
| 2 | TRAJECTORY | HIGH | 8 KB | 64 KB | 50 ms | Path planning |
| 3 | SENSOR_FUSION | HIGH | 8 KB | 32 KB | 10 ms | Encoders, force/torque |
| 4 | SAFETY_MONITOR | CRITICAL | 4 KB | 16 KB | 10 ms | Collaborative safety |
| 5 | COORDINATION | MEDIUM | 4 KB | 32 KB | 100 ms | Robot A↔B sync |
| 6 | GRIPPER_CTRL | HIGH | 4 KB | 16 KB | 50 ms | Module gripper |
| 7 | CAN_HANDLER | HIGH | 4 KB | 16 KB | 100 ms | Station communication |
| 8 | AUDIT_LOGGER | LOW | 4 KB | 32 KB | 2000 ms | Event logging |

**Total RAM:** ~288 KB of 1 MB available

### 2.3 Memory Map

```
┌─────────────────────────────────────────────────┐  0x240FFFFF (1 MB)
│                                                 │
│        VISION_PROC Memory (128 KB)              │  (Robot A only)
│        (image buffers, feature cache)           │
├─────────────────────────────────────────────────┤  0x240E0000
│        TRAJECTORY Memory (128 KB)               │
│        (waypoint buffer, spline coefficients)   │
├─────────────────────────────────────────────────┤  0x240C0000
│        MOTION_CTRL Memory (64 KB)               │
│        (joint states, PID history)              │
├─────────────────────────────────────────────────┤  0x240B0000
│        SENSOR_FUSION Memory (64 KB)             │
│        (Kalman state, sensor history)           │
├─────────────────────────────────────────────────┤  0x240A0000
│        COORDINATION Memory (32 KB)              │
│        (peer state, sync buffers)               │
├─────────────────────────────────────────────────┤  0x24098000
│        Other Services (64 KB)                   │
│        (SAFETY, GRIPPER, CAN, AUDIT)            │
├─────────────────────────────────────────────────┤  0x24088000
│        IPC Message Pool (32 KB)                 │
│        512 messages × 64 bytes                  │
├─────────────────────────────────────────────────┤  0x24080000
│        Service Stacks (64 KB)                   │
│        (8 KB × 8 services)                      │
├─────────────────────────────────────────────────┤  0x24070000
│        DMA Buffers (64 KB)                      │
│        (ADC, encoder, SPI)                      │
├─────────────────────────────────────────────────┤  0x24060000
│        Reserved (384 KB)                        │
│        (future expansion)                       │
├─────────────────────────────────────────────────┤  0x24000000
│        D1 Domain RAM (128 KB)                   │
│        Kernel + TCM access                      │
└─────────────────────────────────────────────────┘  0x20000000
```

### 2.4 Hardware Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JEZGRO-ROB HARDWARE (Robot A)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        STM32H743 MCU                                 │   │
│   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │   │
│   │  │ TIM1-8 │ │  ADC   │ │ CAN-FD │ │  SPI   │ │  I2C   │ │  ETH   │ │   │
│   │  │(PWM/QEI)│ │(Current)│ │(Comms) │ │(Encod)│ │ (IMU)  │ │(Vision)│ │   │
│   │  └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ │   │
│   └──────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────┘   │
│          │          │          │          │          │          │           │
│          ▼          ▼          ▼          ▼          ▼          ▼           │
│   ┌──────────┐ ┌─────────┐ ┌───────┐ ┌─────────┐ ┌───────┐ ┌──────────┐    │
│   │ Servo    │ │ Current │ │Station│ │ Absolute│ │ IMU   │ │ 3D       │    │
│   │ Drives   │ │ Sensors │ │ Ctrl  │ │ Encoders│ │ 9-DOF │ │ Camera   │    │
│   │ (6 axes) │ │ (6 ch)  │ │       │ │ (6 ch)  │ │       │ │          │    │
│   └──────────┘ └─────────┘ └───────┘ └─────────┘ └───────┘ └──────────┘    │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                       EXTERNAL SYSTEMS                               │   │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│   │  │  E-Stop    │  │  Light     │  │  Gripper   │  │  Limit     │    │   │
│   │  │  Circuit   │  │  Curtains  │  │  Actuator  │  │  Switches  │    │   │
│   │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Motion Control Service

### 3.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(motion_ctrl,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 8192,
    .memory_size = 65536,
    .watchdog_ms = 10  // Robot A: 10ms, Robot B: 5ms
);

void motion_ctrl_main(void) {
    joint_state_t joints[MAX_JOINTS];
    pid_controller_t pid[MAX_JOINTS];

    // Initialize servo interfaces
    servo_init_all();
    pid_init_all(pid);

    // Configure control loop timer (1 kHz)
    jezgro_timer_start(TIMER_SERVO_LOOP, 1000);

    while (1) {
        jezgro_watchdog_feed();

        // Wait for control loop tick
        jezgro_timer_wait(TIMER_SERVO_LOOP);

        // Read current joint positions
        encoder_read_all(joints);

        // Get trajectory setpoint
        trajectory_point_t setpoint;
        if (get_current_setpoint(&setpoint) != JEZGRO_OK) {
            // No trajectory, hold position
            setpoint = get_hold_position();
        }

        // Run inverse kinematics
        joint_setpoint_t joint_sp;
        inverse_kinematics(&setpoint.pose, &joint_sp);

        // PID control for each joint
        for (int i = 0; i < joint_count; i++) {
            float error = joint_sp.position[i] - joints[i].position;
            float output = pid_update(&pid[i], error);

            // Current limiting
            output = apply_current_limit(i, output);

            // Send to servo drive
            servo_set_torque(i, output);
        }

        // Publish joint states
        publish_joint_states(joints);
    }
}
```

### 3.2 Kinematics (Robot A - Gantry)

Robot A uses Cartesian/Gantry configuration for heavy payload handling:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROBOT A KINEMATICS (GANTRY)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Coordinate Frame:                                                          │
│                                                                              │
│                    Z (vertical)                                              │
│                    │                                                         │
│                    │    Y (forward)                                          │
│                    │   /                                                     │
│                    │  /                                                      │
│                    │ /                                                       │
│                    │/_________ X (lateral)                                   │
│                                                                              │
│   Joint Configuration:                                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Joint 1: X-axis linear rail (lateral)     Range: 0-3000 mm    │       │
│   │  Joint 2: Y-axis linear rail (forward)     Range: 0-2000 mm    │       │
│   │  Joint 3: Z-axis linear rail (vertical)    Range: 0-1500 mm    │       │
│   │  Joint 4: Rotation around Z                Range: ±180°        │       │
│   │  Joint 5: Tilt (pitch)                     Range: ±30°         │       │
│   │  Joint 6: Gripper rotation                 Range: ±90°         │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Forward Kinematics:                                                        │
│     x = J1                                                                   │
│     y = J2                                                                   │
│     z = J3                                                                   │
│     Rz = J4, Ry = J5, Rz' = J6                                              │
│                                                                              │
│   Inverse Kinematics (trivial for Cartesian):                               │
│     J1 = x, J2 = y, J3 = z                                                  │
│     J4, J5, J6 from rotation matrix                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Kinematics (Robot B - Articulated)

Robot B uses 6-axis articulated arm for precise module handling:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROBOT B KINEMATICS (6-AXIS)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   DH Parameters (Universal Robots UR20 style):                              │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Joint  │  θ (var) │    d    │    a    │   α   │  Range        │       │
│   ├─────────┼──────────┼─────────┼─────────┼───────┼───────────────┤       │
│   │    1    │    θ₁    │   181   │    0    │  90°  │  ±360°        │       │
│   │    2    │    θ₂    │    0    │  -612   │   0°  │  ±360°        │       │
│   │    3    │    θ₃    │    0    │  -572   │   0°  │  ±360°        │       │
│   │    4    │    θ₄    │   174   │    0    │  90°  │  ±360°        │       │
│   │    5    │    θ₅    │   120   │    0    │ -90°  │  ±360°        │       │
│   │    6    │    θ₆    │   117   │    0    │   0°  │  ±360°        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   Inverse Kinematics: Closed-form solution (6R spherical wrist)             │
│   - 8 possible solutions, choose by minimum joint movement                  │
│   - Singularity avoidance near wrist alignment                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 PID Controller Implementation

```c
typedef struct {
    float kp, ki, kd;           // Gains
    float integral;              // Accumulated integral
    float prev_error;            // For derivative
    float integral_limit;        // Anti-windup
    float output_limit;          // Max torque
} pid_controller_t;

float pid_update(pid_controller_t* pid, float error) {
    // Proportional
    float p_term = pid->kp * error;

    // Integral with anti-windup
    pid->integral += error;
    if (pid->integral > pid->integral_limit) {
        pid->integral = pid->integral_limit;
    } else if (pid->integral < -pid->integral_limit) {
        pid->integral = -pid->integral_limit;
    }
    float i_term = pid->ki * pid->integral;

    // Derivative (filtered)
    float d_term = pid->kd * (error - pid->prev_error);
    pid->prev_error = error;

    // Sum and limit
    float output = p_term + i_term + d_term;
    if (output > pid->output_limit) {
        output = pid->output_limit;
    } else if (output < -pid->output_limit) {
        output = -pid->output_limit;
    }

    return output;
}
```

### 3.5 Servo Drive Interface

| Parameter | Robot A | Robot B |
|-----------|---------|---------|
| Drive type | Servo (CAN) | Servo (EtherCAT/CAN) |
| Control mode | Torque | Torque/Position |
| Feedback | Absolute encoder | Absolute encoder |
| Resolution | 19-bit | 23-bit |
| Loop rate | 1 kHz | 2 kHz |
| Current limit | Per joint | Per joint |

---

## 4. Trajectory Service

### 4.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(trajectory,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 8192,
    .memory_size = 131072,  // 128 KB for waypoint buffer
    .watchdog_ms = 50
);

void trajectory_main(void) {
    trajectory_buffer_t buffer;
    spline_state_t spline;

    trajectory_buffer_init(&buffer);

    while (1) {
        jezgro_watchdog_feed();

        // Check for new trajectory commands
        jezgro_msg_t msg;
        if (jezgro_receive(SVC_CAN_HANDLER, &msg, 10) == JEZGRO_OK) {
            if (msg.type == MSG_TRAJECTORY_NEW) {
                // Load new trajectory
                load_trajectory(&buffer, msg.payload.trajectory);
                spline_init(&spline, &buffer);
            } else if (msg.type == MSG_TRAJECTORY_APPEND) {
                // Append waypoints (blending)
                append_waypoints(&buffer, msg.payload.waypoints);
            }
        }

        // Generate setpoints at 1 kHz for motion control
        if (buffer.state == TRAJ_EXECUTING) {
            trajectory_point_t point;

            // Interpolate current position on spline
            float t = get_trajectory_time();
            spline_evaluate(&spline, t, &point);

            // Velocity/acceleration limits
            apply_dynamic_limits(&point);

            // Publish to motion control
            publish_setpoint(&point);

            // Check completion
            if (t >= spline.duration) {
                buffer.state = TRAJ_COMPLETE;
                notify_completion();
            }
        }

        jezgro_sleep(1);  // 1 kHz trajectory generation
    }
}
```

### 4.2 Trajectory Types

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRAJECTORY TYPES                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. POINT-TO-POINT (PTP)                                                   │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Joint-space interpolation                                     │       │
│   │  • Fastest for large movements                                   │       │
│   │  • Trapezoidal velocity profile                                  │       │
│   │                                                                  │       │
│   │      velocity                                                    │       │
│   │         │    ┌────────┐                                         │       │
│   │         │   /          \                                         │       │
│   │         │  /            \                                        │       │
│   │         │ /              \                                       │       │
│   │         └/────────────────\────────▶ time                       │       │
│   │           accel   cruise   decel                                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   2. LINEAR (LIN)                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Cartesian-space interpolation                                 │       │
│   │  • Straight-line tool path                                       │       │
│   │  • Used for battery/module insertion/extraction                  │       │
│   │                                                                  │       │
│   │      Start ──────────────────────────────────▶ End              │       │
│   │        P1                                       P2               │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   3. CIRCULAR (CIRC)                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Arc interpolation through 3 points                            │       │
│   │  • Used for obstacle avoidance                                   │       │
│   │                                                                  │       │
│   │            ╭──────────╮                                          │       │
│   │      Start╯    arc    ╰End                                       │       │
│   │        P1      P2      P3                                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   4. SPLINE                                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  • Smooth path through multiple waypoints                        │       │
│   │  • Cubic or quintic Bezier                                       │       │
│   │  • Continuous velocity and acceleration                          │       │
│   │                                                                  │       │
│   │                  ╭──╮                                            │       │
│   │      Start ─────╯    ╰─────────╮                                │       │
│   │                                 ╰──── End                        │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Velocity Profile

```c
typedef struct {
    float max_velocity;      // mm/s or deg/s
    float max_acceleration;  // mm/s² or deg/s²
    float max_jerk;          // mm/s³ or deg/s³ (for S-curve)
} velocity_profile_t;

// Default profiles per robot
const velocity_profile_t robot_a_profile = {
    .max_velocity = 500.0f,      // 500 mm/s
    .max_acceleration = 2000.0f, // 2000 mm/s²
    .max_jerk = 10000.0f         // 10000 mm/s³
};

const velocity_profile_t robot_b_profile = {
    .max_velocity = 1000.0f,     // 1000 mm/s
    .max_acceleration = 5000.0f, // 5000 mm/s²
    .max_jerk = 25000.0f         // 25000 mm/s³
};
```

### 4.4 Path Blending

For continuous motion without stopping at waypoints:

```c
// Blend radius determines how much to "cut corners"
typedef struct {
    pose_t position;
    float blend_radius;  // mm, 0 = full stop at waypoint
} waypoint_t;

// During swap sequence:
waypoint_t swap_path[] = {
    { .position = HOME_POSITION,     .blend_radius = 50 },
    { .position = APPROACH_POSITION, .blend_radius = 30 },
    { .position = GRIP_POSITION,     .blend_radius = 0  },  // Stop for grip
    { .position = EXTRACT_POSITION,  .blend_radius = 20 },
    { .position = TRANSIT_POSITION,  .blend_radius = 50 },
    // ...
};
```

---

## 5. Sensor Fusion Service

### 5.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(sensor_fusion,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 8192,
    .memory_size = 65536,
    .watchdog_ms = 20
);

void sensor_fusion_main(void) {
    fusion_state_t state;
    kalman_filter_t kf;

    fusion_init(&state);
    kalman_init(&kf);

    while (1) {
        jezgro_watchdog_feed();

        // Read all sensors
        encoder_data_t encoders;
        imu_data_t imu;
        limit_switch_t limits;

        encoder_read_all(&encoders);
        imu_read(&imu);
        limit_read_all(&limits);

        // Fuse encoder + IMU for better position estimate
        fused_state_t fused;
        kalman_update(&kf, &encoders, &imu, &fused);

        // Check for limit switch triggers
        if (check_limits(&limits)) {
            // Send immediate safety message
            jezgro_msg_t msg = {
                .type = MSG_LIMIT_TRIGGERED,
                .payload.limits = limits
            };
            jezgro_send_priority(SVC_SAFETY_MONITOR, &msg);
        }

        // Publish fused state
        publish_fused_state(&fused);

        // Vision integration (Robot A only)
        #if ROBOT_CONFIG == ROBOT_A
        if (vision_data_available()) {
            vision_correction_t correction;
            if (get_vision_correction(&correction)) {
                apply_position_correction(&state, &correction);
            }
        }
        #endif

        jezgro_sleep(5);  // 200 Hz sensor fusion
    }
}
```

### 5.2 Sensor Configuration

| Sensor | Robot A | Robot B | Interface | Rate |
|--------|---------|---------|-----------|------|
| Joint encoders | Absolute, 19-bit | Absolute, 23-bit | SPI/SSI | 1 kHz |
| IMU (9-DOF) | BMI088 | Optional | SPI | 400 Hz |
| Force/Torque | Optional | ATI Mini45 | Ethernet | 1 kHz |
| Limit switches | 12 (6 + 6) | 12 (6 + 6) | GPIO | 1 kHz |
| Light curtains | 2 zones | 2 zones | Safety PLC | - |
| 3D Camera | Intel RealSense | Optional | Ethernet | 30 Hz |

### 5.3 Encoder Interface

```c
typedef struct {
    uint32_t position_raw;    // Raw encoder count
    float position_rad;       // Position in radians
    float velocity_rad_s;     // Velocity in rad/s
    uint8_t status;           // Error flags
    uint32_t timestamp;       // Microseconds
} encoder_channel_t;

void encoder_read_all(encoder_data_t* data) {
    for (int i = 0; i < joint_count; i++) {
        // Read absolute position (SSI protocol)
        uint32_t raw = ssi_read(encoder_config[i].ssi_port);

        // Convert to radians
        data->channels[i].position_raw = raw;
        data->channels[i].position_rad =
            (raw / (float)encoder_config[i].resolution) * 2.0f * M_PI;

        // Calculate velocity from position derivative
        float dt = (now_us() - data->channels[i].timestamp) / 1e6f;
        data->channels[i].velocity_rad_s =
            (data->channels[i].position_rad - prev_position[i]) / dt;
        prev_position[i] = data->channels[i].position_rad;

        data->channels[i].timestamp = now_us();
    }
}
```

### 5.4 Vision Processing (Robot A)

```c
// Vision is used for fine alignment during battery grip
typedef struct {
    float x_offset;      // mm, lateral correction
    float y_offset;      // mm, forward correction
    float z_offset;      // mm, vertical correction
    float rotation;      // degrees, yaw correction
    float confidence;    // 0-1, detection confidence
    bool valid;
} vision_correction_t;

// Called by VISION_PROC service
void process_camera_frame(frame_t* frame, vision_correction_t* result) {
    // Detect alignment markers on battery module
    marker_t markers[4];
    int num_markers = detect_alignment_markers(frame, markers);

    if (num_markers >= 3) {
        // Calculate pose correction from markers
        calculate_pose_correction(markers, num_markers, result);
        result->valid = result->confidence > 0.8f;
    } else {
        result->valid = false;
    }
}
```

---

## 6. Safety Monitor Service

### 6.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(safety_monitor,
    .priority = JEZGRO_PRIORITY_CRITICAL,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 20
);

void safety_monitor_main(void) {
    safety_state_t state = SAFETY_OK;
    uint32_t last_heartbeat[2];  // Robot A/B heartbeat

    while (1) {
        jezgro_watchdog_feed();

        // Check E-stop status (hardware input)
        if (gpio_read(ESTOP_PIN) == ESTOP_ACTIVE) {
            trigger_emergency_stop(ESTOP_BUTTON);
            state = SAFETY_ESTOP;
        }

        // Check light curtain status (from Safety PLC)
        if (get_light_curtain_status() == CURTAIN_BROKEN) {
            if (state != SAFETY_ESTOP) {
                trigger_protective_stop(CURTAIN_VIOLATION);
                state = SAFETY_PROTECTIVE_STOP;
            }
        }

        // Check peer robot heartbeat (coordination)
        if (now_ms() - last_heartbeat[PEER_ROBOT] > HEARTBEAT_TIMEOUT_MS) {
            trigger_protective_stop(PEER_TIMEOUT);
            state = SAFETY_PROTECTIVE_STOP;
        }

        // Process safety messages from other services
        jezgro_msg_t msg;
        while (jezgro_receive_nonblock(JEZGRO_ANY, &msg) == JEZGRO_OK) {
            switch (msg.type) {
                case MSG_LIMIT_TRIGGERED:
                    handle_limit_trigger(&msg.payload.limits);
                    break;
                case MSG_COLLISION_DETECTED:
                    trigger_emergency_stop(COLLISION);
                    state = SAFETY_ESTOP;
                    break;
                case MSG_PEER_HEARTBEAT:
                    last_heartbeat[PEER_ROBOT] = now_ms();
                    break;
            }
        }

        // Publish safety state
        publish_safety_state(state);

        // Send our heartbeat to peer
        send_heartbeat_to_peer();

        jezgro_sleep(10);  // 100 Hz safety monitoring
    }
}
```

### 6.2 Safety Categories

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAFETY CATEGORIES                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   CATEGORY 0: EMERGENCY STOP (E-STOP)                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Trigger:                                                        │       │
│   │  • Red mushroom button pressed                                   │       │
│   │  • Collision detected                                            │       │
│   │  • Critical fault                                                │       │
│   │                                                                  │       │
│   │  Response:                                                       │       │
│   │  • Immediate power cut to all motors                             │       │
│   │  • Brakes engage                                                 │       │
│   │  • Requires manual reset                                         │       │
│   │                                                                  │       │
│   │  Recovery:                                                       │       │
│   │  • Release E-stop button                                         │       │
│   │  • Press reset button                                            │       │
│   │  • Re-home robot                                                 │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   CATEGORY 1: PROTECTIVE STOP                                               │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Trigger:                                                        │       │
│   │  • Light curtain broken                                          │       │
│   │  • Peer robot timeout                                            │       │
│   │  • Soft limit exceeded                                           │       │
│   │                                                                  │       │
│   │  Response:                                                       │       │
│   │  • Controlled deceleration                                       │       │
│   │  • Power remains on                                              │       │
│   │  • Auto-resume possible                                          │       │
│   │                                                                  │       │
│   │  Recovery:                                                       │       │
│   │  • Clear safety condition                                        │       │
│   │  • Automatic resume or manual trigger                            │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   CATEGORY 2: REDUCED MODE                                                  │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │  Trigger:                                                        │       │
│   │  • Collaborative zone entry (Robot B)                            │       │
│   │  • Speed monitoring violation                                    │       │
│   │                                                                  │       │
│   │  Response:                                                       │       │
│   │  • Reduced speed (250 mm/s max)                                  │       │
│   │  • Reduced force (150 N max)                                     │       │
│   │  • Increased monitoring                                          │       │
│   │                                                                  │       │
│   │  Recovery:                                                       │       │
│   │  • Automatic when zone cleared                                   │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Collision Detection

Robot B (module robot) supports collaborative operation with force monitoring:

```c
// Force/torque limits for collaborative mode
const force_limits_t collab_limits = {
    .force_x = 150.0f,   // N
    .force_y = 150.0f,   // N
    .force_z = 150.0f,   // N
    .torque_x = 10.0f,   // Nm
    .torque_y = 10.0f,   // Nm
    .torque_z = 10.0f    // Nm
};

void check_collision(force_torque_t* ft, safety_state_t* state) {
    if (fabsf(ft->force_x) > collab_limits.force_x ||
        fabsf(ft->force_y) > collab_limits.force_y ||
        fabsf(ft->force_z) > collab_limits.force_z) {

        // Collision detected
        *state = SAFETY_COLLISION;
        trigger_protective_stop(COLLISION_FORCE);

        // Log event
        audit_log_event(EVENT_COLLISION, ft);
    }
}
```

### 6.4 Hardware Safety Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SAFETY HARDWARE ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    SAFETY PLC (Pilz PNOZ / Siemens F-CPU)            │   │
│   │                                                                      │   │
│   │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │   │
│   │   │  E-Stop   │  │  Light    │  │  Door     │  │  Enable   │       │   │
│   │   │  Circuit  │  │  Curtains │  │  Interlock│  │  Switch   │       │   │
│   │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘       │   │
│   │         │              │              │              │              │   │
│   │         └──────────────┴──────────────┴──────────────┘              │   │
│   │                              │                                       │   │
│   │                     ┌────────▼────────┐                              │   │
│   │                     │  Safety Logic   │                              │   │
│   │                     │  (SIL 2/PL d)   │                              │   │
│   │                     └────────┬────────┘                              │   │
│   │                              │                                       │   │
│   └──────────────────────────────┼───────────────────────────────────────┘   │
│                                  │                                           │
│              ┌───────────────────┼───────────────────┐                       │
│              │                   │                   │                       │
│       ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐               │
│       │   STO       │     │   STO       │     │   STO       │               │
│       │ Robot A     │     │ Robot B     │     │ Gripper     │               │
│       │ Drives      │     │ Drives      │     │ Actuators   │               │
│       └─────────────┘     └─────────────┘     └─────────────┘               │
│                                                                              │
│   STO = Safe Torque Off (per IEC 62061)                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Robot Coordination Service

### 7.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(coordination,
    .priority = JEZGRO_PRIORITY_MEDIUM,
    .stack_size = 4096,
    .memory_size = 32768,
    .watchdog_ms = 100
);

void coordination_main(void) {
    coord_state_t state;
    peer_status_t peer;
    sync_point_t sync;

    coord_init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // Exchange status with peer robot
        broadcast_my_status(&state);
        receive_peer_status(&peer);

        // Check for synchronization points
        if (state.current_phase != peer.current_phase) {
            // Phase mismatch - wait for sync
            if (is_sync_point(state.current_phase)) {
                wait_for_peer_sync(&peer, &sync);
            }
        }

        // Collision avoidance check
        if (check_workspace_conflict(&state, &peer)) {
            // Resolve conflict based on priority
            resolve_workspace_conflict(&state, &peer);
        }

        // Process phase transitions
        if (state.phase_complete && peer.phase_complete) {
            advance_to_next_phase(&state);
            notify_station_controller(state.current_phase);
        }

        jezgro_sleep(50);  // 20 Hz coordination
    }
}
```

### 7.2 Parallel Swap Sequence

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PARALLEL SWAP SEQUENCE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   PHASE  │  ROBOT A (Battery)           │  ROBOT B (Module)                 │
│   ───────┼──────────────────────────────┼────────────────────────────────── │
│          │                              │                                    │
│     1    │  ● Move to vehicle           │  ● Move to rack                   │
│   (PREP) │    approach position         │    approach position              │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     2    │  ● Align with battery        │  ● Identify target module         │
│  (ALIGN) │  ● Vision correction         │  ● Position at slot               │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     3    │  ● Engage gripper            │  ● Engage gripper                 │
│   (GRIP) │  ● Verify grip force         │  ● Verify grip force              │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     4    │  ● Unlock battery latches    │  ● Disconnect module              │
│ (UNLOCK) │  ● Wait for confirmation     │  ● (power already off)            │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     5    │  ● Extract battery           │  ● Extract module                 │
│(EXTRACT) │  ● Move to storage position  │  ● Move to storage position       │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     6    │  ● Release to storage        │  ● Release to storage             │
│(DEPOSIT) │  ● Move to fresh battery     │  ● Move to fresh module           │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     7    │  ● Pick fresh battery        │  ● Pick fresh module              │
│  (PICK)  │  ● Move to vehicle           │  ● Move to rack                   │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     8    │  ● Insert battery            │  ● Insert module                  │
│ (INSERT) │  ● Lock latches              │  ● Connect (auto)                 │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│     9    │  ● Release gripper           │  ● Release gripper                │
│(RELEASE) │  ● Verify battery seated     │  ● Verify module online           │
│          │                              │                                    │
│     ──── │ ──────────── SYNC ─────────── │ ─────────────────────────────────│
│          │                              │                                    │
│    10    │  ● Return to home            │  ● Return to home                 │
│  (HOME)  │  ● Report complete           │  ● Report complete                │
│          │                              │                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Synchronization Protocol

```c
typedef enum {
    PHASE_IDLE = 0,
    PHASE_PREP,
    PHASE_ALIGN,
    PHASE_GRIP,
    PHASE_UNLOCK,
    PHASE_EXTRACT,
    PHASE_DEPOSIT,
    PHASE_PICK,
    PHASE_INSERT,
    PHASE_RELEASE,
    PHASE_HOME,
    PHASE_COMPLETE
} swap_phase_t;

// Sync message on CAN-FD
typedef struct {
    uint8_t robot_id;          // 0 = A, 1 = B
    uint8_t current_phase;     // swap_phase_t
    uint8_t phase_complete;    // 1 = ready for next
    uint8_t fault_code;        // 0 = OK
    float position[6];         // Current TCP position
    uint32_t timestamp;
} sync_message_t;

// Wait for peer to reach same phase
void wait_for_peer_sync(peer_status_t* peer, sync_point_t* sync) {
    uint32_t timeout = now_ms() + SYNC_TIMEOUT_MS;

    while (peer->current_phase < my_phase &&
           peer->fault_code == 0 &&
           now_ms() < timeout) {

        // Keep exchanging status
        broadcast_my_status(&my_state);
        receive_peer_status(peer);

        jezgro_sleep(10);
    }

    if (peer->fault_code != 0) {
        handle_peer_fault(peer->fault_code);
    } else if (now_ms() >= timeout) {
        handle_sync_timeout();
    }

    sync->synced = true;
    sync->timestamp = now_ms();
}
```

### 7.4 Workspace Conflict Resolution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKSPACE ZONES                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │   ┌───────────────────┐  SHARED   ┌───────────────────┐             │   │
│   │   │                   │   ZONE    │                   │             │   │
│   │   │   ROBOT A         │           │   ROBOT B         │             │   │
│   │   │   EXCLUSIVE       │ ╔═══════╗ │   EXCLUSIVE       │             │   │
│   │   │   ZONE            │ ║       ║ │   ZONE            │             │   │
│   │   │                   │ ║ MUTEX ║ │                   │             │   │
│   │   │   (Battery        │ ║       ║ │   (Module         │             │   │
│   │   │    storage)       │ ╚═══════╝ │    rack)          │             │   │
│   │   │                   │           │                   │             │   │
│   │   └───────────────────┘           └───────────────────┘             │   │
│   │                                                                      │   │
│   │   ════════════════════ BUS LANE ════════════════════════            │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   Conflict Resolution:                                                       │
│   1. Robot with current phase priority gets access                          │
│   2. If same phase, Robot A has priority (heavier payload)                  │
│   3. If conflict, slower robot pauses at zone boundary                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

```c
bool check_workspace_conflict(coord_state_t* my_state, peer_status_t* peer) {
    // Check if both robots are entering shared zone
    if (is_in_shared_zone(my_state->position) &&
        is_in_shared_zone(peer->position)) {
        return true;
    }

    // Check trajectory intersection
    if (trajectories_intersect(my_state->trajectory, peer->trajectory)) {
        return true;
    }

    return false;
}

void resolve_workspace_conflict(coord_state_t* my_state, peer_status_t* peer) {
    // Determine priority
    int my_priority = get_phase_priority(my_state->current_phase);
    int peer_priority = get_phase_priority(peer->current_phase);

    if (my_priority > peer_priority) {
        // I have priority, continue
        return;
    } else if (my_priority < peer_priority) {
        // Peer has priority, pause
        pause_at_zone_boundary();
    } else {
        // Same priority, Robot A wins
        if (MY_ROBOT_ID == ROBOT_A) {
            return;
        } else {
            pause_at_zone_boundary();
        }
    }
}
```

### 7.5 CAN Protocol for Robot Coordination

| Message ID | Name | Frequency | Content |
|------------|------|-----------|---------|
| 0x500 | ROBOT_STATUS | 20 Hz | Phase, position, velocity, faults |
| 0x510 | ROBOT_SYNC | On-demand | Sync request/acknowledge |
| 0x520 | ROBOT_HEARTBEAT | 10 Hz | Alive signal + timestamp |
| 0x530 | ROBOT_COMMAND | On-demand | Phase advance, abort, reset |
| 0x540 | GRIPPER_STATUS | 10 Hz | Grip force, position, engaged |

---

## 8. Gripper Control Service

### 8.1 Service Definition

```c
JEZGRO_SERVICE_DEFINE(gripper_ctrl,
    .priority = JEZGRO_PRIORITY_HIGH,
    .stack_size = 4096,
    .memory_size = 16384,
    .watchdog_ms = 50
);

void gripper_ctrl_main(void) {
    gripper_state_t state;

    gripper_init(&state);

    while (1) {
        jezgro_watchdog_feed();

        // Process commands
        jezgro_msg_t msg;
        if (jezgro_receive(JEZGRO_ANY, &msg, 20) == JEZGRO_OK) {
            switch (msg.type) {
                case MSG_GRIPPER_OPEN:
                    gripper_open(&state);
                    break;
                case MSG_GRIPPER_CLOSE:
                    gripper_close(&state, msg.payload.target_force);
                    break;
                case MSG_GRIPPER_POSITION:
                    gripper_move_to(&state, msg.payload.position);
                    break;
            }
        }

        // Monitor grip force
        float current_force = read_grip_force();
        if (state.engaged && current_force < MIN_GRIP_FORCE) {
            // Grip slipping!
            jezgro_msg_t alert = {
                .type = MSG_GRIP_SLIP_ALERT,
                .payload.force = current_force
            };
            jezgro_send_priority(SVC_SAFETY_MONITOR, &alert);
        }

        // Publish gripper state
        publish_gripper_state(&state, current_force);
    }
}
```

### 8.2 Gripper Specifications

| Parameter | Robot A (Battery) | Robot B (Module) |
|-----------|-------------------|------------------|
| Type | Fork lift + clamp | Parallel jaw |
| Grip range | Fixed + adjust | 50-250 mm |
| Grip force | 5000 N max | 500 N max |
| Position sensor | Linear encoder | Linear encoder |
| Force sensor | Load cell | Strain gauge |
| Actuator | Hydraulic | Electric servo |

### 8.3 Battery Gripper (Robot A)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BATTERY GRIPPER (Robot A)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Top View:                                                                  │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                                                          │               │
│   │   ┌──────────┐                    ┌──────────┐          │               │
│   │   │  CLAMP   │                    │  CLAMP   │          │               │
│   │   │   LEFT   │    ┌──────────┐   │  RIGHT   │          │               │
│   │   │          │    │ BATTERY  │   │          │          │               │
│   │   │    ◄─────┼────┤          ├───┼─────►    │          │               │
│   │   │          │    │  MODULE  │   │          │          │               │
│   │   └──────────┘    └──────────┘   └──────────┘          │               │
│   │                                                          │               │
│   │   ════════════ FORK TINES ════════════                  │               │
│   │                                                          │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Side View:                                                                 │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │         │                │                               │               │
│   │    ARM  │   ┌────────────┤                               │               │
│   │    ↓    │   │  CLAMP     │                               │               │
│   │    ║    │   │            ▼                               │               │
│   │    ║    │   │     ┌──────────────┐                      │               │
│   │    ║════╪═══│     │   BATTERY    │                      │               │
│   │         │   │     │    MODULE    │                      │               │
│   │    FORK │   │     └──────────────┘                      │               │
│   │   TINES │   │                                            │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Grip Sequence:                                                            │
│   1. Position forks under battery                                           │
│   2. Raise forks to contact bottom                                          │
│   3. Close clamps from sides                                                │
│   4. Verify grip force (load cells on clamps)                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.4 Module Gripper (Robot B)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MODULE GRIPPER (Robot B)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                                                          │               │
│   │        ┌─────────────┐       ┌─────────────┐            │               │
│   │        │   FINGER    │       │   FINGER    │            │               │
│   │        │    LEFT     │       │   RIGHT     │            │               │
│   │        │             │       │             │            │               │
│   │        │    ├───►    │       │   ◄───┤    │            │               │
│   │        │    │        │       │        │    │            │               │
│   │        │    │   ┌────┴───────┴────┐   │    │            │               │
│   │        │    │   │                  │   │    │            │               │
│   │        │    │   │   EK3 MODULE    │   │    │            │               │
│   │        │    │   │                  │   │    │            │               │
│   │        │    │   │   ●          ●  │   │    │            │               │
│   │        │    │   │  grip points   │   │    │            │               │
│   │        │    │   └──────────────────┘   │    │            │               │
│   │        │    │                          │    │            │               │
│   │        └────┴──────────────────────────┴────┘            │               │
│   │                                                          │               │
│   └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│   Grip Points: M8 threaded inserts, 200 mm apart (EK3 spec)                 │
│   Grip Force: 100-500 N adjustable                                          │
│   Precision: ±0.5 mm positioning                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Station Integration

### 9.1 Communication Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STATION INTEGRATION                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    STATION CONTROLLER (Linux)                        │   │
│   │                                                                      │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │   SWAP      │  │   VEHICLE   │  │   MODULE    │                │   │
│   │   │ ORCHESTRATOR│  │ INTERFACE   │  │  INVENTORY  │                │   │
│   │   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                │   │
│   │          │                │                │                        │   │
│   └──────────┼────────────────┼────────────────┼────────────────────────┘   │
│              │                │                │                             │
│              │ CAN-FD         │ CAN-FD         │ CAN-FD                      │
│              │                │                │                             │
│   ┌──────────▼──────────┬─────▼────────┬───────▼─────────┐                  │
│   │                     │              │                  │                  │
│   │   ROBOT A           │   ROBOT B    │   EK3 RACK      │                  │
│   │   (JEZGRO-ROB)      │  (JEZGRO-ROB)│   (JEZGRO)      │                  │
│   │                     │              │                  │                  │
│   └─────────────────────┴──────────────┴──────────────────┘                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Swap Orchestration Messages

| Message | Direction | Content |
|---------|-----------|---------|
| `SWAP_START` | Controller → Robots | Battery slot, module slot, vehicle ID |
| `SWAP_PHASE` | Robots → Controller | Current phase, progress, ETA |
| `SWAP_COMPLETE` | Robots → Controller | Success/failure, duration |
| `SWAP_ABORT` | Controller → Robots | Abort reason, safe stop command |
| `ROBOT_READY` | Robots → Controller | Robot available for swap |
| `ROBOT_FAULT` | Robots → Controller | Fault code, description |

### 9.3 Swap Sequence Timing

| Phase | Robot A Time | Robot B Time | Total |
|-------|--------------|--------------|-------|
| PREP | 5 s | 3 s | 5 s (parallel) |
| ALIGN | 8 s | 3 s | 8 s (parallel) |
| GRIP | 3 s | 2 s | 3 s (parallel) |
| UNLOCK | 2 s | 1 s | 2 s (parallel) |
| EXTRACT | 10 s | 5 s | 10 s (parallel) |
| DEPOSIT | 5 s | 3 s | 5 s (parallel) |
| PICK | 8 s | 4 s | 8 s (parallel) |
| INSERT | 15 s | 6 s | 15 s (parallel) |
| RELEASE | 3 s | 2 s | 3 s (parallel) |
| HOME | 5 s | 4 s | 5 s (parallel) |
| **Total** | **64 s** | **33 s** | **~65 s** |

Note: Robot B completes faster but waits for sync points with Robot A.

---

## 10. Testing and Validation

### 10.1 Service-Level Tests

| Test | Purpose | Method |
|------|---------|--------|
| MOTION_CTRL loop timing | Verify 1 kHz loop | Logic analyzer on GPIO toggle |
| Kinematics accuracy | Verify TCP positioning | Laser tracker measurement |
| SAFETY_MONITOR latency | Verify <20 ms response | E-stop trigger to motor off |
| COORDINATION sync | Verify sync timing | Log analysis |
| Service restart | Verify <50 ms recovery | Fault injection |

### 10.2 Integration Tests

| Test | Purpose | Pass Criteria |
|------|---------|---------------|
| Dual robot swap | Full swap sequence | Complete in <90 s |
| Fault recovery | Handle robot fault | Safe stop, resume |
| Workspace conflict | Collision avoidance | No contact |
| Communication loss | Handle CAN timeout | Protective stop |

### 10.3 Safety Certification Tests

| Test | Standard | Criteria |
|------|----------|----------|
| E-stop response | ISO 13849 | <500 ms |
| Light curtain | IEC 61496 | <100 ms |
| Force limiting | ISO 10218-1 | <150 N (Robot B) |
| Speed monitoring | ISO 10218-1 | <250 mm/s in reduced mode |

---

## 11. Cross-References

| Document | Relationship |
|----------|--------------|
| `tehnika/inzenjersko/en/21-jezgro-product-family.md` | JEZGRO product family |
| `tehnika/inzenjersko/en/16-jezgro.md` | Base JEZGRO specification |
| `tehnika/inzenjersko/en/05-swap-station.md` | Swap station concept |
| `patent/03-TECHNICAL-SUPPORT/CONTROL-SYSTEM-ARCHITECTURE.md` | Control hierarchy |
| `tehnika/inzenjersko/en/22-jezgro-bat.md` | Battery BMS for swap |

---

## Change History

| Date | Version | Description |
|------|---------|-------------|
| 2026-01-04 | 1.0 | Initial JEZGRO-ROB specification |
