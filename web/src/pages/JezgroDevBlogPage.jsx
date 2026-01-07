import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Home,
  Cpu,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Zap,
  Shield,
  RotateCcw,
  Clock,
  Bug,
  Terminal,
  Layers,
  AlertTriangle,
  Code,
  Play,
  Pause,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  FileCode,
  Monitor,
} from 'lucide-react';
import PasswordGate, { ACCESS_TIERS } from '../components/PasswordGate';

// Blog posts / Development milestones
const DEV_POSTS = [
  {
    id: 'tricore-uart-output',
    date: '2026-01-07',
    title: {
      en: 'UART Output Working on TriCore Emulator!',
      sr: 'UART Izlaz Radi na TriCore Emulatoru!',
    },
    summary: {
      en: 'JEZGRO RTOS now outputs "JEZGRO" via ASCLIN UART on our custom TC397XP emulator. 2M+ instructions executed. Hardware testing next!',
      sr: 'JEZGRO RTOS sada ispisuje "JEZGRO" preko ASCLIN UART na našem custom TC397XP emulatoru. 2M+ instrukcija izvršeno. Sledeće: hardver!',
    },
    icon: Terminal,
    color: 'green',
    status: 'completed',
    details: {
      en: [
        'ASCLIN UART peripheral emulation working',
        'Firmware outputs "JEZGRO\\r\\n" through UART',
        '2,000,000+ instructions executed successfully',
        'Fixed BO format decoder (address register field)',
        'Fixed BRC branch displacement overflow',
        'Added MUL.U, JNE.A, JEQ.A, ANDN instructions',
        'Full memory system with timing annotations',
        'Next: Real TC397XP hardware validation',
      ],
      sr: [
        'ASCLIN UART periferna emulacija funkcionalna',
        'Firmware ispisuje "JEZGRO\\r\\n" preko UART-a',
        '2.000.000+ instrukcija uspešno izvršeno',
        'Popravljen BO format dekoder (polje adresnog registra)',
        'Popravljen BRC branch displacement overflow',
        'Dodate MUL.U, JNE.A, JEQ.A, ANDN instrukcije',
        'Kompletan memorijski sistem sa timing anotacijama',
        'Sledeće: Validacija na pravom TC397XP hardveru',
      ],
    },
    code: `[UART0] TX: 'J' (0x4A)
[UART0] TX: 'E' (0x45)
[UART0] TX: 'Z' (0x5A)
[UART0] TX: 'G' (0x47)
[UART0] TX: 'R' (0x52)
[UART0] TX: 'O' (0x4F)

=== Execution Complete ===
  Instructions:  2,000,000
  Cycles:        24,607,294
  Final PC:      0x80005B68 (idle loop)
  Final State:   RUNNING`,
    files: [
      'tcpxxx-emulator/src/core/tricore_exec.c',
      'tcpxxx-emulator/src/core/tricore_decode.c',
      'tcpxxx-emulator/src/peripherals/asclin.c',
      'tcpxxx-emulator/src/memory/mem_system.c',
    ],
  },
  {
    id: 'custom-tricore-emulator-milestone',
    date: '2026-01-06',
    title: {
      en: 'JEZGRO RTOS Live on Custom TriCore Emulator',
      sr: 'JEZGRO RTOS Uživo na Custom TriCore Emulatoru',
    },
    summary: {
      en: 'First successful execution of JEZGRO RTOS on our custom-built TriCore TC397XP emulator. Kernel reaches idle loop!',
      sr: 'Prvo uspešno izvršavanje JEZGRO RTOS-a na našem custom TriCore TC397XP emulatoru. Kernel dostiže idle loop!',
    },
    icon: Monitor,
    color: 'cyan',
    status: 'completed',
    details: {
      en: [
        'Custom TriCore TC397XP emulator built from scratch',
        'TC1.6.2P instruction set implementation',
        'CSA (Context Save Area) mechanism fully working',
        'Full boot sequence: crt0 → C runtime → idle loop',
        '1,000,000+ instructions executed successfully',
      ],
      sr: [
        'Custom TriCore TC397XP emulator izgrađen od nule',
        'TC1.6.2P set instrukcija implementiran',
        'CSA (Context Save Area) mehanizam potpuno funkcionalan',
        'Kompletna boot sekvenca: crt0 → C runtime → idle loop',
        '1.000.000+ instrukcija uspešno izvršeno',
      ],
    },
    code: `=== Execution Complete ===
  Instructions:  1,000,000
  Cycles:        12,293,552
  Final PC:      0x8000560A (idle loop)
  Final State:   RUNNING

Boot sequence:
  ✓ CSA initialization (128 entries)
  ✓ .data/.bss sections initialized
  ✓ C startup executed
  ✓ Kernel idle loop reached`,
    files: [
      'tcpxxx-emulator/src/core/tricore_exec.c',
      'tcpxxx-emulator/src/core/tricore_decode.c',
      'pre-hw-dev-tricore/src/crt0_tc397xp.s',
    ],
  },
  {
    id: 'can-fd-roj-swarm',
    date: '2026-01-06',
    title: {
      en: 'CAN-FD Driver & ROJ Swarm Communication',
      sr: 'CAN-FD Driver & ROJ Swarm Komunikacija',
    },
    summary: {
      en: 'Full FDCAN driver with multi-node swarm simulation. 735 TX messages in Renode test. Ready for ROJ distributed intelligence.',
      sr: 'Kompletan FDCAN driver sa multi-node swarm simulacijom. 735 TX poruka u Renode testu. Spreman za ROJ distribuiranu inteligenciju.',
    },
    icon: Zap,
    color: 'green',
    status: 'completed',
    details: {
      en: [
        'Support for 3 FDCAN instances (FDCAN1/2/3)',
        '3KB shared Message SRAM allocation',
        'Classic CAN (500kbps) and CAN-FD support',
        'Round-robin TX buffer allocation (Renode compatible)',
        'Standard/Extended ID filtering',
        'Multi-node swarm simulation via canHub',
        'Test: 735 TX messages successfully transmitted',
      ],
      sr: [
        'Podrška za 3 FDCAN instance (FDCAN1/2/3)',
        '3KB deljeni Message SRAM',
        'Classic CAN (500kbps) i CAN-FD podrška',
        'Round-robin TX buffer alokacija (Renode kompatibilno)',
        'Standard/Extended ID filtriranje',
        'Multi-node swarm simulacija preko canHub',
        'Test: 735 TX poruka uspešno poslato',
      ],
    },
    code: `[ROJ] Swarm task started, node=1
[ROJ] CAN initialized (500k classic)
[ROJ] tx=735 rx=0
← 735 messages transmitted!`,
    files: [
      'pre-hw-dev/src/hal/hal_stm32.c',
      'pre-hw-dev/renode/swarm-simulation.resc',
      'pre-hw-dev/renode/stm32g474-minimal.repl',
    ],
  },
  {
    id: 'comprehensive-test-suite',
    date: '2026-01-06',
    title: {
      en: 'Comprehensive Test Suite',
      sr: 'Sveobuhvatni Test Suite',
    },
    summary: {
      en: 'All kernel primitives tested: context switch, EDF preemption, mutex, semaphore, and MPU fault handling. 100% pass rate.',
      sr: 'Svi kernel primitivi testirani: context switch, EDF preempcija, mutex, semafor i MPU fault handling. 100% prolaznost.',
    },
    icon: CheckCircle2,
    color: 'green',
    status: 'completed',
    details: {
      en: [
        'Context Switch: T1/T2/T3 switching via PendSV ✓',
        'EDF Preemption: T3 (50ms) preempts T1 (100ms) ✓',
        'Mutex: shared_counter matches task_counter ✓',
        'Semaphore: Producer/Consumer pattern works ✓',
        'MPU Fault: DACCVIOL on Flash write detected ✓',
        'All tests pass in Renode emulation',
      ],
      sr: [
        'Context Switch: T1/T2/T3 prebacivanje preko PendSV ✓',
        'EDF Preempcija: T3 (50ms) preuzima od T1 (100ms) ✓',
        'Mutex: shared_counter se poklapa sa task_counter ✓',
        'Semafor: Producer/Consumer pattern radi ✓',
        'MPU Fault: DACCVIOL na Flash upis detektovan ✓',
        'Svi testovi prolaze u Renode emulaciji',
      ],
    },
    code: `| Test           | Status  |
|----------------|---------|
| Context Switch | ✅ PASS |
| EDF Preemption | ✅ PASS |
| Mutex          | ✅ PASS |
| Semaphore      | ✅ PASS |
| MPU Fault      | ✅ PASS |`,
  },
  {
    id: 'tricore-implementation',
    date: '2026-01-06',
    title: {
      en: 'TC397XP TriCore Implementation',
      sr: 'TC397XP TriCore Implementacija',
    },
    summary: {
      en: 'Complete JEZGRO port to Infineon AURIX TC397XP - 6-core ASIL-D microcontroller with CSA-based context switching.',
      sr: 'Kompletni JEZGRO port na Infineon AURIX TC397XP - 6-jezgarni ASIL-D mikrokontroler sa CSA context switching-om.',
    },
    icon: Cpu,
    color: 'purple',
    status: 'completed',
    details: {
      en: [
        'Fresh implementation from scratch (no STM32 code reuse)',
        '6-core support: CPU0-3 lockstep (safety), CPU4-5 (performance)',
        'CSA (Context Save Area) - hardware-linked list context switch',
        'Per-core memory: DSPR/PSPR private, LMU shared',
        'Cross-core IPC via mailboxes and spinlocks',
        'EDF scheduler with per-core ready queues',
        'PLL configured for 300 MHz operation',
      ],
      sr: [
        'Nova implementacija od nule (bez reuse STM32 koda)',
        '6-jezgarni support: CPU0-3 lockstep (safety), CPU4-5 (performance)',
        'CSA (Context Save Area) - hardverski linked list context switch',
        'Per-core memorija: DSPR/PSPR privatna, LMU deljena',
        'Cross-core IPC preko mailbox-a i spinlock-a',
        'EDF scheduler sa per-core ready queue-ovima',
        'PLL konfigurisan za 300 MHz rad',
      ],
    },
    files: [
      'pre-hw-dev-tricore/src/arch/tricore_csa.c',
      'pre-hw-dev-tricore/src/arch/tricore_multicore.c',
      'pre-hw-dev-tricore/src/kernel/scheduler.c',
      'pre-hw-dev-tricore/cmake/tc397xp.ld',
    ],
  },
  {
    id: 'arm-vs-tricore',
    date: '2026-01-06',
    title: {
      en: 'ARM vs TriCore Architecture',
      sr: 'ARM vs TriCore Arhitektura',
    },
    summary: {
      en: 'Detailed comparison of ARM Cortex-M4 (STM32) and TriCore (AURIX) architectures for JEZGRO RTOS.',
      sr: 'Detaljna komparacija ARM Cortex-M4 (STM32) i TriCore (AURIX) arhitektura za JEZGRO RTOS.',
    },
    icon: Layers,
    color: 'cyan',
    status: 'completed',
    details: {
      en: [
        'ARM: Stack-based context switch (push/pop + PendSV)',
        'TriCore: CSA linked list (hardware automatic)',
        'ARM: NVIC centralized interrupt controller',
        'TriCore: IR + per-core ICU (6 controllers)',
        'ARM: 16 registers (R0-R15)',
        'TriCore: 32 registers (A0-A15 + D0-D15)',
        'Common: Same JEZGRO API, different HAL backends',
      ],
      sr: [
        'ARM: Stack-based context switch (push/pop + PendSV)',
        'TriCore: CSA linked list (hardverski automatski)',
        'ARM: NVIC centralizovani interrupt kontroler',
        'TriCore: IR + per-core ICU (6 kontrolera)',
        'ARM: 16 registara (R0-R15)',
        'TriCore: 32 registra (A0-A15 + D0-D15)',
        'Zajedničko: Isti JEZGRO API, različiti HAL backend-i',
      ],
    },
    code: `// Context switch comparison
// ARM Cortex-M4:           // TriCore TC3xx:
void PendSV_Handler() {     uint32_t context_pcxi;
  // Push R4-R11 to stack   // CSA hardware handles
  // Save PSP to TCB        // save/restore
  // Load next PSP          __svlcx();  // Save lower
  // Pop R4-R11 from stack  __set_pcxi(next);
  // Return                 __rslcx();  // Restore
}`,
  },
  {
    id: 'mpu-protection',
    date: '2026-01-06',
    title: {
      en: 'MPU Memory Protection',
      sr: 'MPU Zaštita Memorije',
    },
    summary: {
      en: 'Implemented Memory Protection Unit with 5 regions protecting Flash, Kernel SRAM, Stack, Peripherals, and System registers.',
      sr: 'Implementiran Memory Protection Unit sa 5 regiona koji štite Flash, Kernel SRAM, Stack, Periferie i Sistemske registre.',
    },
    icon: Shield,
    color: 'green',
    status: 'completed',
    details: {
      en: [
        'Region 0: Flash (512KB) - Read-only + Execute',
        'Region 1: Kernel SRAM (16KB) - Privileged RW only',
        'Region 2: Heap/Stacks (64KB) - Full access',
        'Region 3: Peripherals (512MB) - Privileged RW',
        'Region 4: System (1MB) - Privileged RW',
        'Enhanced MemManage_Handler with CFSR/MMFAR diagnostics',
        'Tested: Write to Flash triggers MPU FAULT with DACCVIOL flag',
      ],
      sr: [
        'Region 0: Flash (512KB) - Samo čitanje + Izvršavanje',
        'Region 1: Kernel SRAM (16KB) - Samo privilegovan RW',
        'Region 2: Heap/Stacks (64KB) - Pun pristup',
        'Region 3: Periferie (512MB) - Privilegovan RW',
        'Region 4: Sistem (1MB) - Privilegovan RW',
        'Poboljšan MemManage_Handler sa CFSR/MMFAR dijagnostikom',
        'Testirano: Pisanje u Flash triggeruje MPU FAULT sa DACCVIOL flagom',
      ],
    },
    code: `*** MPU FAULT ***
CFSR: 0x00000082
MMFAR: 0x08000100
Flags: DACCVIOL MMARVALID`,
  },
  {
    id: 'vs-code-debugging',
    date: '2026-01-06',
    title: {
      en: 'VS Code + GDB Debugging',
      sr: 'VS Code + GDB Debugging',
    },
    summary: {
      en: 'Full debugging support with breakpoints, variable inspection, peripheral registers, and memory view via Renode emulation.',
      sr: 'Puna podrška za debugging sa breakpoints, inspekcijom varijabli, perifernim registrima i pregledom memorije kroz Renode emulaciju.',
    },
    icon: Bug,
    color: 'purple',
    status: 'completed',
    details: {
      en: [
        'Cortex-Debug extension integration',
        'GDB server on port 3333 via Renode',
        'STM32G474.svd for peripheral register view',
        'One-click debug: debug-renode.bat + F5',
        'Breakpoints in C code and assembly',
        'Watch expressions and call stack',
      ],
      sr: [
        'Cortex-Debug ekstenzija integracija',
        'GDB server na portu 3333 preko Renode',
        'STM32G474.svd za pregled perifernih registara',
        'Debug jednim klikom: debug-renode.bat + F5',
        'Breakpoints u C kodu i assembly-ju',
        'Watch izrazi i call stack',
      ],
    },
    files: [
      'debug-renode.bat',
      'renode/debug.resc',
      '.vscode/launch.json',
      'renode/STM32G474.svd',
    ],
  },
  {
    id: 'sync-primitives',
    date: '2026-01-05',
    title: {
      en: 'Synchronization Primitives',
      sr: 'Sinhronizacioni Primitivi',
    },
    summary: {
      en: 'Implemented mutex and semaphore primitives with priority inheritance and blocking task queues.',
      sr: 'Implementirani mutex i semafor primitivi sa nasleđivanjem prioriteta i blokirajućim task redovima.',
    },
    icon: Lock,
    color: 'orange',
    status: 'completed',
    details: {
      en: [
        'Binary semaphore (counting = 1)',
        'Counting semaphore (configurable max)',
        'Mutex with owner tracking',
        'Priority inheritance for mutex',
        'Blocking task queues with timeout',
        'Producer/Consumer test pattern verified',
      ],
      sr: [
        'Binarni semafor (counting = 1)',
        'Counting semafor (konfigurabilan max)',
        'Mutex sa praćenjem vlasnika',
        'Nasleđivanje prioriteta za mutex',
        'Blokirajući task redovi sa timeout-om',
        'Producer/Consumer test pattern verifikovan',
      ],
    },
    files: [
      'pre-hw-dev/src/kernel/sync.c',
      'pre-hw-dev/src/kernel/sync.h',
    ],
  },
  {
    id: 'preemptive-scheduling',
    date: '2026-01-05',
    title: {
      en: 'Preemptive EDF Scheduling',
      sr: 'Preemptivni EDF Scheduling',
    },
    summary: {
      en: 'Added preemption support to the EDF scheduler. SysTick checks deadlines and triggers context switch if higher priority task is ready.',
      sr: 'Dodata podrška za preempciju u EDF scheduler. SysTick proverava deadline-ove i triggeruje context switch ako je task višeg prioriteta spreman.',
    },
    icon: RefreshCw,
    color: 'orange',
    status: 'completed',
    details: {
      en: [
        'scheduler_preempt() called from SysTick_Handler',
        'EDF priority: earlier deadline = higher priority',
        'Race condition fix: context_switch_pending flag',
        'Interrupt locking for critical sections',
        'Tested: 5+ seconds stable operation',
      ],
      sr: [
        'scheduler_preempt() pozvan iz SysTick_Handler',
        'EDF prioritet: raniji deadline = viši prioritet',
        'Popravka race condition: context_switch_pending flag',
        'Zaključavanje prekida za kritične sekcije',
        'Testirano: 5+ sekundi stabilnog rada',
      ],
    },
    code: `void SysTick_Handler(void) {
    tick_counter++;
    hal_systick_increment();
    scheduler_tick(1);
    scheduler_preempt();  // EDF preemption check
}`,
  },
  {
    id: 'context-switching',
    date: '2026-01-05',
    title: {
      en: 'Real Context Switching',
      sr: 'Pravi Context Switching',
    },
    summary: {
      en: 'Implemented ARM Cortex-M4 context switching using PendSV exception. Tasks now have real stacks and proper register save/restore.',
      sr: 'Implementiran ARM Cortex-M4 context switching koristeći PendSV exception. Taskovi sada imaju prave stack-ove i pravilno čuvanje/vraćanje registara.',
    },
    icon: RotateCcw,
    color: 'blue',
    status: 'completed',
    details: {
      en: [
        'PendSV_Handler in assembly (naked function)',
        'Save/restore R4-R11 manually',
        'Hardware saves R0-R3, R12, LR, PC, xPSR',
        'hal_context_init() creates initial stack frame',
        'scheduler_start() performs first context switch',
        'Tested in Renode: both tasks running',
      ],
      sr: [
        'PendSV_Handler u assembly-ju (naked funkcija)',
        'Ručno čuvanje/vraćanje R4-R11',
        'Hardver čuva R0-R3, R12, LR, PC, xPSR',
        'hal_context_init() kreira početni stack frame',
        'scheduler_start() izvršava prvi context switch',
        'Testirano u Renode: oba taska rade',
      ],
    },
    code: `__attribute__((naked)) void PendSV_Handler(void) {
    __asm volatile (
        "cpsid i                  \\n"
        "ldr r1, =current_task_sp \\n"
        "ldr r1, [r1]             \\n"
        "cbz r1, PendSV_load      \\n"
        "mrs r0, psp              \\n"
        "stmdb r0!, {r4-r11}      \\n"
        "str r0, [r1]             \\n"
        // ... load next task
    );
}`,
  },
  {
    id: 'uart-systick',
    date: '2026-01-04',
    title: {
      en: 'UART Debug & SysTick Timer',
      sr: 'UART Debug & SysTick Tajmer',
    },
    summary: {
      en: 'UART debug output and SysTick interrupt working. First real JEZGRO boot message transmitted via USART1.',
      sr: 'UART debug izlaz i SysTick interrupt rade. Prva prava JEZGRO boot poruka preneta preko USART1.',
    },
    icon: Terminal,
    color: 'blue',
    status: 'completed',
    details: {
      en: [
        'USART1 @ 115200 baud (8N1)',
        'debug_puts() for kernel messages',
        'SysTick @ 1kHz (1ms tick)',
        'hal_systick_increment() for timing',
        'Boot banner displays successfully',
        'Heartbeat message every second',
      ],
      sr: [
        'USART1 @ 115200 baud (8N1)',
        'debug_puts() za kernel poruke',
        'SysTick @ 1kHz (1ms tick)',
        'hal_systick_increment() za timing',
        'Boot banner se prikazuje uspešno',
        'Heartbeat poruka svake sekunde',
      ],
    },
    code: `================================================
  JEZGRO RTOS v0.1.0-pre
  Platform: STM32G474
  Renode STM32G474 Emulation
================================================

[BOOT] Initializing scheduler...
[BOOT] Starting SysTick @ 1kHz...
[T1] count=1000 ticks=0
[T1] count=152000 ticks=1  ← SysTick working!`,
  },
  {
    id: 'renode-emulation',
    date: '2026-01-04',
    title: {
      en: 'Renode Emulation Setup',
      sr: 'Renode Emulacija Setup',
    },
    summary: {
      en: 'STM32G474 emulation working in Renode. JEZGRO boots, initializes HAL, enters idle loop. 29,573 instructions executed.',
      sr: 'STM32G474 emulacija radi u Renode. JEZGRO bootuje, inicijalizuje HAL, ulazi u idle loop. 29.573 instrukcija izvršeno.',
    },
    icon: Monitor,
    color: 'cyan',
    status: 'completed',
    details: {
      en: [
        'Custom .repl platform definition (stm32g474-minimal.repl)',
        'Cortex-M4 CPU at 170MHz',
        'USART1 for debug output',
        'Memory: Flash 512KB, SRAM 96KB, CCM 32KB',
        'ARM GCC 14.2.1 toolchain (xPack)',
        'CMake + Ninja build system',
        'Proof: PC at __WFI(), 29K instructions executed',
      ],
      sr: [
        'Custom .repl definicija platforme (stm32g474-minimal.repl)',
        'Cortex-M4 CPU na 170MHz',
        'USART1 za debug izlaz',
        'Memorija: Flash 512KB, SRAM 96KB, CCM 32KB',
        'ARM GCC 14.2.1 toolchain (xPack)',
        'CMake + Ninja build sistem',
        'Dokaz: PC na __WFI(), 29K instrukcija izvršeno',
      ],
    },
    files: [
      'pre-hw-dev/renode/stm32g474-minimal.repl',
      'pre-hw-dev/cmake/arm-none-eabi.cmake',
      'pre-hw-dev/cmake/stm32g474.ld',
      'pre-hw-dev/src/startup_stm32g474.s',
    ],
  },
];

// Roadmap items
const ROADMAP = [
  {
    id: 'multi-node-swarm',
    title: { en: 'Multi-Node Swarm Test', sr: 'Multi-Node Swarm Test' },
    status: 'planned',
    description: {
      en: 'Run swarm-simulation.resc with canHub for multi-node ROJ communication test',
      sr: 'Pokrenuti swarm-simulation.resc sa canHub za multi-node ROJ komunikaciju',
    },
  },
  {
    id: 'tricore-hardware',
    title: { en: 'TC397 Hardware Validation', sr: 'TC397 Hardverska Validacija' },
    status: 'planned',
    description: {
      en: 'Order TC397 Application Kit (~€350), test JEZGRO on real hardware',
      sr: 'Naručiti TC397 Application Kit (~€350), testirati JEZGRO na pravom hardveru',
    },
  },
  {
    id: 'stm32-hardware',
    title: { en: 'STM32G474 Hardware Validation', sr: 'STM32G474 Hardverska Validacija' },
    status: 'planned',
    description: {
      en: 'Flash JEZGRO on real STM32G474 Nucleo or custom board',
      sr: 'Flash JEZGRO na pravi STM32G474 Nucleo ili custom ploču',
    },
  },
  {
    id: 'stm32-tricore-bridge',
    title: { en: 'STM32 ↔ TriCore CAN Bridge', sr: 'STM32 ↔ TriCore CAN Most' },
    status: 'planned',
    description: {
      en: 'CAN-FD communication between STM32 EK3 modules and TC397 coordinator',
      sr: 'CAN-FD komunikacija između STM32 EK3 modula i TC397 koordinatora',
    },
  },
  {
    id: 'message-queues',
    title: { en: 'Message Queues', sr: 'Message Queue-ovi' },
    status: 'planned',
    description: {
      en: 'Inter-task communication via message passing (beyond semaphores)',
      sr: 'Komunikacija između taskova putem poruka (izvan semafora)',
    },
  },
  {
    id: 'dual-platform-test',
    title: { en: 'Dual Platform Testing', sr: 'Dvoplatformsko Testiranje' },
    status: 'future',
    description: {
      en: 'Run same test suite on STM32 (Renode) and TC397 (hardware)',
      sr: 'Pokrenuti isti test suite na STM32 (Renode) i TC397 (hardver)',
    },
  },
  {
    id: 'adc-pwm-drivers',
    title: { en: 'ADC/PWM Peripheral Drivers', sr: 'ADC/PWM Periferijski Driveri' },
    status: 'future',
    description: {
      en: 'ADC for current/voltage sensing, PWM for gate drive control',
      sr: 'ADC za merenje struje/napona, PWM za kontrolu gate drive-a',
    },
  },
];

function BlogPost({ post, lang, isExpanded, onToggle }) {
  const Icon = post.icon;
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-start gap-4 text-left hover:bg-slate-700/30 transition-colors"
      >
        <div className={`p-3 rounded-lg ${colorClasses[post.color]} border`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-slate-400 text-sm font-mono">{post.date}</span>
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              {post.status === 'completed' ? (lang === 'sr' ? 'Završeno' : 'Completed') : post.status}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{post.title[lang]}</h3>
          <p className="text-slate-300">{post.summary[lang]}</p>
        </div>
        <div className="text-slate-400">
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-700/50 pt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                {lang === 'sr' ? 'Detalji' : 'Details'}
              </h4>
              <ul className="space-y-2">
                {post.details[lang].map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {post.code && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                  {lang === 'sr' ? 'Kod' : 'Code'}
                </h4>
                <pre className="bg-slate-900/80 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                  {post.code}
                </pre>
              </div>
            )}

            {post.files && (
              <div>
                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-3">
                  {lang === 'sr' ? 'Fajlovi' : 'Files'}
                </h4>
                <ul className="space-y-1">
                  {post.files.map((file, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 font-mono text-sm">
                      <FileCode className="w-4 h-4 text-slate-500" />
                      {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RoadmapItem({ item, lang }) {
  const statusColors = {
    planned: 'bg-yellow-500/20 text-yellow-400',
    future: 'bg-slate-500/20 text-slate-400',
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
      <div className="mt-1">
        <Circle className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-semibold text-white">{item.title[lang]}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[item.status]}`}>
            {item.status === 'planned' ? (lang === 'sr' ? 'Planirano' : 'Planned') : (lang === 'sr' ? 'Buduće' : 'Future')}
          </span>
        </div>
        <p className="text-slate-400 text-sm">{item.description[lang]}</p>
      </div>
    </div>
  );
}

export default function JezgroDevBlogPage() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('sr') ? 'sr' : 'en';
  const [expandedPost, setExpandedPost] = useState('can-fd-roj-swarm');

  return (
    <PasswordGate tier={ACCESS_TIERS.PARTNER}>
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span>Elektrokombinacija</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-400" />
            JEZGRO Dev Blog
          </h1>
          <Link
            to="/jezgro-dev"
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            {lang === 'sr' ? '← Nazad na Dev Plan' : '← Back to Dev Plan'}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full text-green-400 mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">
              {lang === 'sr' ? 'Aktivni Razvoj' : 'Active Development'}
            </span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            {lang === 'sr' ? 'JEZGRO RTOS Razvoj' : 'JEZGRO RTOS Development'}
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {lang === 'sr'
              ? 'Real-time operativni sistem za EK3 module. Prateći napredak od nule do proizvodnje.'
              : 'Real-time operating system for EK3 modules. Tracking progress from zero to production.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {[
            { label: lang === 'sr' ? 'Milestones' : 'Milestones', value: '13', color: 'text-green-400' },
            { label: lang === 'sr' ? 'Platforme' : 'Platforms', value: '2', color: 'text-blue-400' },
            { label: lang === 'sr' ? 'Testovi' : 'Tests', value: '5/5', color: 'text-purple-400' },
            { label: lang === 'sr' ? 'CAN TX' : 'CAN TX', value: '735', color: 'text-orange-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-700/50">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Platform Summary */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-semibold text-white">STM32G474</span>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">ACTIVE</span>
            </div>
            <p className="text-slate-400 text-sm">ARM Cortex-M4F @ 170MHz • Renode emulation • CAN-FD ready</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-semibold text-white">TC397XP TriCore</span>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">ACTIVE</span>
            </div>
            <p className="text-slate-400 text-sm">6-core ASIL-D @ 300MHz • CSA context switch • 13 source files</p>
          </div>
        </div>

        {/* Blog Posts */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-400" />
            {lang === 'sr' ? 'Razvojni Dnevnik' : 'Development Log'}
          </h3>
          <div className="space-y-4">
            {DEV_POSTS.map((post) => (
              <BlogPost
                key={post.id}
                post={post}
                lang={lang}
                isExpanded={expandedPost === post.id}
                onToggle={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              />
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            {lang === 'sr' ? 'Roadmap' : 'Roadmap'}
          </h3>
          <div className="space-y-3">
            {ROADMAP.map((item) => (
              <RoadmapItem key={item.id} item={item} lang={lang} />
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">
            {lang === 'sr' ? 'Brzi Linkovi' : 'Quick Links'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Code className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">Claude Code</span>
            </a>
            <a
              href="https://renode.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Monitor className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">Renode Emulator</span>
            </a>
            <Link
              to="/jezgro-dev"
              className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Cpu className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300">{lang === 'sr' ? 'Dev Plan' : 'Dev Plan'}</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-slate-400">
          <p>JEZGRO RTOS &copy; 2026 Elektrokombinacija</p>
        </div>
      </footer>
    </div>
    </PasswordGate>
  );
}
