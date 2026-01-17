# RTOS Comparison Matrix (2026-01-07)

## Scope

This note compares the current ek-kor + TriCore port against common RTOS patterns and summarizes where novelty might or might not exist.

## Evidence used (repo)

- `ek-kor/docs/README.md`
- `ek-kor/include/ek-kor/hal.h`
- `ek-kor/src/kernel/scheduler.c`
- `ek-kor/src/kernel/ipc.c`
- `pre-hw-dev-tricore/src/hal/hal_tc397xp.c`
- `tehnika/inzenjersko/sr/SPECIFICATIONS.md`

## Feature Matrix (coarse)

| Feature | ek-kor (code or doc) | TriCore port status | Other RTOS families (general) |
|---|---|---|---|
| Preemptive scheduling | Implemented (`ek-kor/src/kernel/scheduler.c`) | Uses HAL to start tasks and tick | Common in most RTOS |
| EDF scheduling | Implemented via `EKK_USE_EDF` (`ek-kor/src/kernel/scheduler.c`) | Supported (same kernel) | Available in some RTOS, not universal |
| Per-core ready queues / no migration | Documented in README; per-core arrays in scheduler | Supported by per-core HAL state | Multicore RTOS often support SMP/AMP; no-migration is a design choice |
| Priority inheritance | Documented in README; implemented in scheduler | Supported | Common in RTOS with mutexes |
| IPC message queues | Implemented (`ek-kor/src/kernel/ipc.c`) | Supported | Common in RTOS |
| Cross-core mailbox + IPI | Implemented in IPC + HAL IPI (`ek-kor/src/kernel/ipc.c`, `ek-kor/include/ek-kor/hal.h`) | Implemented in TriCore HAL (`pre-hw-dev-tricore/src/hal/hal_tc397xp.c`) | Available in multicore RTOS; details vary |
| Zero-copy buffer pool | Implemented in IPC (`ek-kor/src/kernel/ipc.c`) | Supported | Available in some RTOS; varies |
| Cross-core RPC | Implemented (`ek-kor/src/kernel/ipc.c`) | Supported (requires IPI) | Less common; sometimes provided via middleware |
| HAL portability layer | Implemented (`ek-kor/include/ek-kor/hal.h`) | TriCore HAL exists | Common in RTOS |
| MPU/user isolation | Not implemented in kernel or HAL | Not implemented | Often present in safety RTOS or microkernels, but varies |
| Fault isolation + service restart | Documented goal in spec (`tehnika/inzenjersko/sr/SPECIFICATIONS.md`), not seen in code | Not implemented | Common in microkernels; varies in RTOS |
| Safety certification | Not present in repo | Not present | Some commercial RTOS have it |

## Comparable RTOS families (not exhaustive)

- General RTOS: FreeRTOS, Zephyr, ThreadX, RTEMS
- Automotive safety RTOS: AUTOSAR OS, ERIKA Enterprise
- Microkernel RTOS: QNX, VxWorks, seL4 (research/secure focus)

## Novelty Assessment (high level)

- The core mechanisms (EDF, mutex PI, queues, HAL, multicore) are standard RTOS building blocks.
- Any novelty would likely come from the exact combination, domain-specific constraints, or the way cross-core IPC/RPC and zero-copy buffers are structured.
- The spec claims microkernel-style isolation and service restart, but those are not implemented in current kernel code, so they cannot be counted as actual differentiators yet.

## What to do next if you want a stronger novelty claim

- Implement MPU/user separation and fault containment in `ek-kor`, then document how it differs from known RTOS designs.
- Benchmark or formally define EDF + no-migration properties and cross-core IPC semantics.
- Add a short prior-art comparison for your top 3 competitors, focusing on features you actually implement.
