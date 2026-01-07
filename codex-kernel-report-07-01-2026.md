# Codex Kernel Report 2026-01-07

## Scope

This report summarizes how `ek-kor`, `pre-hw-dev`, and `pre-hw-dev-tricore` relate, the current state of the RTOS implementation, and what is needed for isolation and core-count targeting.

## Repo Map (Kernel-Related)

- `ek-kor/`: Shared RTOS kernel library (scheduler, task, sync, IPC).
- `pre-hw-dev/`: Pre-hardware dev stack; single-core simulation HAL and tests.
- `pre-hw-dev-tricore/`: TriCore (TC397XP) port; uses `ek-kor` as a subdir and supplies TriCore HAL/arch code.
- `tcpxxx-emulator/`: TriCore emulator for firmware bring-up and kernel development.

## What Is Real vs Simulation

- **Real kernel logic (not a mock):** `ek-kor/src/kernel/` implements EDF scheduler, tasks, sync, IPC, and kernel control.
- **Simulation/dev environment:** `pre-hw-dev/README.md` explicitly states no hardware required and uses a simulated HAL (`pre-hw-dev/src/hal/hal_sim.c`) plus tests and scripts.
- **TriCore hardware port (WIP):** `pre-hw-dev-tricore/` has a concrete HAL (`pre-hw-dev-tricore/src/hal/hal_tc397xp.c`) with SFR access and STM-based tick support, but drivers are stubbed and some pieces are TODOs.
- **Emulator support:** `tcpxxx-emulator/STATUS.md` shows firmware reaching an idle loop, but `tcpxxx-emulator/README.md` still labels several subsystems as stubs. Documentation is a bit out of sync with the latest status.

## Single-Core vs Multi-Core

- There is **one RTOS**, `ek-kor`, used by both single-core and multi-core builds.
- Core count is configured via `EKK_MAX_CORES` (see `ek-kor/docs/README.md` and `pre-hw-dev-tricore/CMakeLists.txt`).
- `ek-kor/src/kernel/scheduler.c` keeps per-core scheduler data, tick counters, and delay queues keyed by `ekk_hal_get_core_id()`.
- `pre-hw-dev` is effectively single-core (sim HAL returns 0 core ID).
- `pre-hw-dev-tricore` sets `EKK_MAX_CORES` to TC397 core count and provides a TriCore HAL with per-core state arrays.

## Isolation (MPU, Privilege, Fault Containment)

- I do **not** see MPU/user-space isolation implemented in the `ek-kor` kernel code.
- The TriCore HAL (`pre-hw-dev-tricore/src/hal/hal_tc397xp.c`) uses low-level CPU/STM registers but does not expose MPU setup or user/kernel separation.
- Conclusion: isolation is **planned or documented elsewhere**, but not implemented in current kernel code or HAL.

## Where Isolation Must Be Added

### ek-kor (kernel changes, shared across platforms)

Add isolation at the kernel layer so it works on any port:

- Task metadata: per-task MPU regions, privilege flags, and fault-handling policy.
- Syscall boundary: user tasks should invoke kernel services via a controlled interface.
- Fault handling: kernel hooks for memory faults and deadline violations.
- Context switch: save/restore MPU/privilege state per task during scheduling.

### pre-hw-dev-tricore (platform-specific support)

Wire kernel expectations into TriCore hardware:

- MPU/PSW configuration (TriCore-specific protection and privilege modes).
- Context-switch assembly or arch layer updates to load per-task protection.
- Exception/interrupt vectors for memory faults and safe recovery.

## If You Want a 3-Core Variant

No separate RTOS is required. You can target 3 cores by:

- Setting `EKK_MAX_CORES=3` (build configuration).
- Updating TriCore HAL to report 3 as core count (if it uses `CPU_COUNT`, make sure that is 3 for your build).
- Validating per-core arrays, init loops, and startup coordination for cores 0..2.

## Hardware Arrival Plan (What Happens to the HAL)

When real hardware arrives, the HAL shifts from simulation to actual hardware bindings while the kernel stays the same.

- Stop using the simulation HAL (`pre-hw-dev/src/hal/hal_sim.c`) for target builds.
- Expand the hardware HAL (`pre-hw-dev-tricore/src/hal/hal_tc397xp.c`) with real init, interrupt wiring, timers, watchdog, and debug I/O.
- Add the peripheral drivers currently stubbed in `pre-hw-dev-tricore/CMakeLists.txt` (ASCLIN, STM, GPIO, CAN).
- Validate boot flow, tick accuracy, context switch timing, and ISR nesting on silicon.
- Keep the `ek-kor` API stable; select the HAL via toolchain/build configuration.

## Evidence Pointers

- Shared kernel: `ek-kor/src/kernel/scheduler.c`, `ek-kor/src/kernel/task.c`, `ek-kor/src/kernel/ipc.c`
- Kernel/HAL contract: `ek-kor/include/ek-kor/hal.h`
- Single-core sim: `pre-hw-dev/src/hal/hal_sim.c`, `pre-hw-dev/README.md`
- TriCore port: `pre-hw-dev-tricore/src/hal/hal_tc397xp.c`, `pre-hw-dev-tricore/CMakeLists.txt`
- Emulator status: `tcpxxx-emulator/STATUS.md`, `tcpxxx-emulator/README.md`

## Summary

- `ek-kor` is the single kernel base for both single-core simulation and TriCore multicore.
- The RTOS is real (not just simulation), but most validation is still in simulation/emulation.
- Isolation is not implemented in kernel code yet; it needs changes in `ek-kor` and TriCore-specific support in the HAL/arch layer.
