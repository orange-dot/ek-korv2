/**
 * @file startup_stm32g474.s
 * @brief STM32G474 Startup Code for JEZGRO RTOS
 *
 * This file contains:
 * - Vector table with exception handlers
 * - Reset handler that initializes .data and .bss
 * - Default handlers for all exceptions/interrupts
 */

    .syntax unified
    .cpu cortex-m4
    .fpu fpv4-sp-d16
    .thumb

/* =============================================================================
 * Global Symbols
 * ============================================================================= */

    .global g_pfnVectors
    .global Default_Handler
    .global Reset_Handler

/* =============================================================================
 * Linker Script Symbols
 * ============================================================================= */

    .word _sidata       /* Start of .data in Flash */
    .word _sdata        /* Start of .data in SRAM */
    .word _edata        /* End of .data in SRAM */
    .word _sbss         /* Start of .bss */
    .word _ebss         /* End of .bss */
    .word _estack       /* Top of stack */

/* =============================================================================
 * Reset Handler - First code to execute
 * ============================================================================= */

    .section .text.Reset_Handler
    .weak Reset_Handler
    .type Reset_Handler, %function

Reset_Handler:
    /* Set stack pointer */
    ldr sp, =_estack

    /* Enable FPU (Cortex-M4 with FPU) */
    /* CPACR @ 0xE000ED88, enable CP10 and CP11 */
    ldr r0, =0xE000ED88
    ldr r1, [r0]
    orr r1, r1, #(0xF << 20)    /* Set CP10 and CP11 to full access */
    str r1, [r0]
    dsb                          /* Ensure FPU is enabled */
    isb

    /* Copy .data from Flash to SRAM */
    ldr r0, =_sdata             /* Destination: start of .data in SRAM */
    ldr r1, =_edata             /* Destination end */
    ldr r2, =_sidata            /* Source: .data in Flash */
    b .L_copy_data_check

.L_copy_data_loop:
    ldr r3, [r2], #4            /* Load from Flash, post-increment */
    str r3, [r0], #4            /* Store to SRAM, post-increment */

.L_copy_data_check:
    cmp r0, r1                  /* Check if done */
    blo .L_copy_data_loop

    /* Zero-fill .bss section */
    ldr r0, =_sbss              /* Destination: start of .bss */
    ldr r1, =_ebss              /* Destination end */
    movs r2, #0                 /* Value to fill (zero) */
    b .L_zero_bss_check

.L_zero_bss_loop:
    str r2, [r0], #4            /* Store zero, post-increment */

.L_zero_bss_check:
    cmp r0, r1                  /* Check if done */
    blo .L_zero_bss_loop

    /* Call system initialization (optional, for clock setup) */
    /* bl SystemInit */

    /* Call main */
    bl main

    /* If main returns, loop forever */
.L_loop_forever:
    b .L_loop_forever

    .size Reset_Handler, .-Reset_Handler

/* =============================================================================
 * Default Handler - Infinite loop for unhandled exceptions
 * ============================================================================= */

    .section .text.Default_Handler
    .weak Default_Handler
    .type Default_Handler, %function

Default_Handler:
    /* For debugging: store exception number */
    mrs r0, ipsr                /* Get interrupt number */
    b .                         /* Infinite loop */

    .size Default_Handler, .-Default_Handler

/* =============================================================================
 * Vector Table
 * ============================================================================= */

    .section .isr_vector, "a", %progbits
    .type g_pfnVectors, %object
    .size g_pfnVectors, .-g_pfnVectors

g_pfnVectors:
    /* Cortex-M4 System Exceptions */
    .word _estack               /*  0: Initial stack pointer */
    .word Reset_Handler         /*  1: Reset handler */
    .word NMI_Handler           /*  2: NMI handler */
    .word HardFault_Handler     /*  3: Hard fault handler */
    .word MemManage_Handler     /*  4: MPU fault handler */
    .word BusFault_Handler      /*  5: Bus fault handler */
    .word UsageFault_Handler    /*  6: Usage fault handler */
    .word 0                     /*  7: Reserved */
    .word 0                     /*  8: Reserved */
    .word 0                     /*  9: Reserved */
    .word 0                     /* 10: Reserved */
    .word SVC_Handler           /* 11: SVCall handler */
    .word DebugMon_Handler      /* 12: Debug monitor handler */
    .word 0                     /* 13: Reserved */
    .word PendSV_Handler        /* 14: PendSV handler (context switch) */
    .word SysTick_Handler       /* 15: SysTick handler */

    /* STM32G474 External Interrupts */
    .word WWDG_IRQHandler               /* 16: Window Watchdog */
    .word PVD_PVM_IRQHandler            /* 17: PVD/PVM */
    .word RTC_TAMP_LSECSS_IRQHandler    /* 18: RTC Tamper */
    .word RTC_WKUP_IRQHandler           /* 19: RTC Wakeup */
    .word FLASH_IRQHandler              /* 20: Flash */
    .word RCC_IRQHandler                /* 21: RCC */
    .word EXTI0_IRQHandler              /* 22: EXTI Line 0 */
    .word EXTI1_IRQHandler              /* 23: EXTI Line 1 */
    .word EXTI2_IRQHandler              /* 24: EXTI Line 2 */
    .word EXTI3_IRQHandler              /* 25: EXTI Line 3 */
    .word EXTI4_IRQHandler              /* 26: EXTI Line 4 */
    .word DMA1_Channel1_IRQHandler      /* 27: DMA1 Channel 1 */
    .word DMA1_Channel2_IRQHandler      /* 28: DMA1 Channel 2 */
    .word DMA1_Channel3_IRQHandler      /* 29: DMA1 Channel 3 */
    .word DMA1_Channel4_IRQHandler      /* 30: DMA1 Channel 4 */
    .word DMA1_Channel5_IRQHandler      /* 31: DMA1 Channel 5 */
    .word DMA1_Channel6_IRQHandler      /* 32: DMA1 Channel 6 */
    .word DMA1_Channel7_IRQHandler      /* 33: DMA1 Channel 7 */
    .word ADC1_2_IRQHandler             /* 34: ADC1/ADC2 */
    .word USB_HP_IRQHandler             /* 35: USB High Priority */
    .word USB_LP_IRQHandler             /* 36: USB Low Priority */
    .word FDCAN1_IT0_IRQHandler         /* 37: FDCAN1 IT0 */
    .word FDCAN1_IT1_IRQHandler         /* 38: FDCAN1 IT1 */
    .word EXTI9_5_IRQHandler            /* 39: EXTI Lines 5-9 */
    .word TIM1_BRK_TIM15_IRQHandler     /* 40: TIM1 Break / TIM15 */
    .word TIM1_UP_TIM16_IRQHandler      /* 41: TIM1 Update / TIM16 */
    .word TIM1_TRG_COM_TIM17_IRQHandler /* 42: TIM1 Trigger / TIM17 */
    .word TIM1_CC_IRQHandler            /* 43: TIM1 Capture Compare */
    .word TIM2_IRQHandler               /* 44: TIM2 */
    .word TIM3_IRQHandler               /* 45: TIM3 */
    .word TIM4_IRQHandler               /* 46: TIM4 */
    .word I2C1_EV_IRQHandler            /* 47: I2C1 Event */
    .word I2C1_ER_IRQHandler            /* 48: I2C1 Error */
    .word I2C2_EV_IRQHandler            /* 49: I2C2 Event */
    .word I2C2_ER_IRQHandler            /* 50: I2C2 Error */
    .word SPI1_IRQHandler               /* 51: SPI1 */
    .word SPI2_IRQHandler               /* 52: SPI2 */
    .word USART1_IRQHandler             /* 53: USART1 */
    .word USART2_IRQHandler             /* 54: USART2 */
    .word USART3_IRQHandler             /* 55: USART3 */
    .word EXTI15_10_IRQHandler          /* 56: EXTI Lines 10-15 */
    .word RTC_Alarm_IRQHandler          /* 57: RTC Alarm */
    .word USBWakeUp_IRQHandler          /* 58: USB Wakeup */
    .word TIM8_BRK_IRQHandler           /* 59: TIM8 Break */
    .word TIM8_UP_IRQHandler            /* 60: TIM8 Update */
    .word TIM8_TRG_COM_IRQHandler       /* 61: TIM8 Trigger */
    .word TIM8_CC_IRQHandler            /* 62: TIM8 Capture Compare */
    .word ADC3_IRQHandler               /* 63: ADC3 */
    .word FMC_IRQHandler                /* 64: FMC */
    .word LPTIM1_IRQHandler             /* 65: LPTIM1 */
    .word TIM5_IRQHandler               /* 66: TIM5 */
    .word SPI3_IRQHandler               /* 67: SPI3 */
    .word UART4_IRQHandler              /* 68: UART4 */
    .word UART5_IRQHandler              /* 69: UART5 */
    .word TIM6_DAC_IRQHandler           /* 70: TIM6/DAC */
    .word TIM7_DAC_IRQHandler           /* 71: TIM7/DAC */
    .word DMA2_Channel1_IRQHandler      /* 72: DMA2 Channel 1 */
    .word DMA2_Channel2_IRQHandler      /* 73: DMA2 Channel 2 */
    .word DMA2_Channel3_IRQHandler      /* 74: DMA2 Channel 3 */
    .word DMA2_Channel4_IRQHandler      /* 75: DMA2 Channel 4 */
    .word DMA2_Channel5_IRQHandler      /* 76: DMA2 Channel 5 */
    .word ADC4_IRQHandler               /* 77: ADC4 */
    .word ADC5_IRQHandler               /* 78: ADC5 */
    .word UCPD1_IRQHandler              /* 79: UCPD1 */
    .word COMP1_2_3_IRQHandler          /* 80: COMP1/2/3 */
    .word COMP4_5_6_IRQHandler          /* 81: COMP4/5/6 */
    .word COMP7_IRQHandler              /* 82: COMP7 */
    .word HRTIM1_Master_IRQHandler      /* 83: HRTIM Master */
    .word HRTIM1_TIMA_IRQHandler        /* 84: HRTIM Timer A */
    .word HRTIM1_TIMB_IRQHandler        /* 85: HRTIM Timer B */
    .word HRTIM1_TIMC_IRQHandler        /* 86: HRTIM Timer C */
    .word HRTIM1_TIMD_IRQHandler        /* 87: HRTIM Timer D */
    .word HRTIM1_TIME_IRQHandler        /* 88: HRTIM Timer E */
    .word HRTIM1_FLT_IRQHandler         /* 89: HRTIM Fault */
    .word HRTIM1_TIMF_IRQHandler        /* 90: HRTIM Timer F */
    .word CRS_IRQHandler                /* 91: CRS */
    .word SAI1_IRQHandler               /* 92: SAI1 */
    .word TIM20_BRK_IRQHandler          /* 93: TIM20 Break */
    .word TIM20_UP_IRQHandler           /* 94: TIM20 Update */
    .word TIM20_TRG_COM_IRQHandler      /* 95: TIM20 Trigger */
    .word TIM20_CC_IRQHandler           /* 96: TIM20 Capture Compare */
    .word FPU_IRQHandler                /* 97: FPU */
    .word I2C4_EV_IRQHandler            /* 98: I2C4 Event */
    .word I2C4_ER_IRQHandler            /* 99: I2C4 Error */
    .word SPI4_IRQHandler               /* 100: SPI4 */
    .word 0                             /* 101: Reserved */
    .word FDCAN2_IT0_IRQHandler         /* 102: FDCAN2 IT0 */
    .word FDCAN2_IT1_IRQHandler         /* 103: FDCAN2 IT1 */
    .word FDCAN3_IT0_IRQHandler         /* 104: FDCAN3 IT0 */
    .word FDCAN3_IT1_IRQHandler         /* 105: FDCAN3 IT1 */
    .word RNG_IRQHandler                /* 106: RNG */
    .word LPUART1_IRQHandler            /* 107: LPUART1 */
    .word I2C3_EV_IRQHandler            /* 108: I2C3 Event */
    .word I2C3_ER_IRQHandler            /* 109: I2C3 Error */
    .word DMAMUX_OVR_IRQHandler         /* 110: DMAMUX Overrun */
    .word QUADSPI_IRQHandler            /* 111: QUADSPI */
    .word DMA1_Channel8_IRQHandler      /* 112: DMA1 Channel 8 */
    .word DMA2_Channel6_IRQHandler      /* 113: DMA2 Channel 6 */
    .word DMA2_Channel7_IRQHandler      /* 114: DMA2 Channel 7 */
    .word DMA2_Channel8_IRQHandler      /* 115: DMA2 Channel 8 */
    .word CORDIC_IRQHandler             /* 116: CORDIC */
    .word FMAC_IRQHandler               /* 117: FMAC */

/* =============================================================================
 * Weak Aliases for Exception Handlers
 * Override these in your code to provide custom handlers
 * ============================================================================= */

    .weak NMI_Handler
    .thumb_set NMI_Handler, Default_Handler

    .weak HardFault_Handler
    .thumb_set HardFault_Handler, Default_Handler

    .weak MemManage_Handler
    .thumb_set MemManage_Handler, Default_Handler

    .weak BusFault_Handler
    .thumb_set BusFault_Handler, Default_Handler

    .weak UsageFault_Handler
    .thumb_set UsageFault_Handler, Default_Handler

    .weak SVC_Handler
    .thumb_set SVC_Handler, Default_Handler

    .weak DebugMon_Handler
    .thumb_set DebugMon_Handler, Default_Handler

    .weak PendSV_Handler
    .thumb_set PendSV_Handler, Default_Handler

    .weak SysTick_Handler
    .thumb_set SysTick_Handler, Default_Handler

    /* STM32G474 IRQ handlers - all weak aliases to Default_Handler */
    .weak WWDG_IRQHandler
    .thumb_set WWDG_IRQHandler, Default_Handler

    .weak PVD_PVM_IRQHandler
    .thumb_set PVD_PVM_IRQHandler, Default_Handler

    .weak RTC_TAMP_LSECSS_IRQHandler
    .thumb_set RTC_TAMP_LSECSS_IRQHandler, Default_Handler

    .weak RTC_WKUP_IRQHandler
    .thumb_set RTC_WKUP_IRQHandler, Default_Handler

    .weak FLASH_IRQHandler
    .thumb_set FLASH_IRQHandler, Default_Handler

    .weak RCC_IRQHandler
    .thumb_set RCC_IRQHandler, Default_Handler

    .weak EXTI0_IRQHandler
    .thumb_set EXTI0_IRQHandler, Default_Handler

    .weak EXTI1_IRQHandler
    .thumb_set EXTI1_IRQHandler, Default_Handler

    .weak EXTI2_IRQHandler
    .thumb_set EXTI2_IRQHandler, Default_Handler

    .weak EXTI3_IRQHandler
    .thumb_set EXTI3_IRQHandler, Default_Handler

    .weak EXTI4_IRQHandler
    .thumb_set EXTI4_IRQHandler, Default_Handler

    .weak DMA1_Channel1_IRQHandler
    .thumb_set DMA1_Channel1_IRQHandler, Default_Handler

    .weak DMA1_Channel2_IRQHandler
    .thumb_set DMA1_Channel2_IRQHandler, Default_Handler

    .weak DMA1_Channel3_IRQHandler
    .thumb_set DMA1_Channel3_IRQHandler, Default_Handler

    .weak DMA1_Channel4_IRQHandler
    .thumb_set DMA1_Channel4_IRQHandler, Default_Handler

    .weak DMA1_Channel5_IRQHandler
    .thumb_set DMA1_Channel5_IRQHandler, Default_Handler

    .weak DMA1_Channel6_IRQHandler
    .thumb_set DMA1_Channel6_IRQHandler, Default_Handler

    .weak DMA1_Channel7_IRQHandler
    .thumb_set DMA1_Channel7_IRQHandler, Default_Handler

    .weak ADC1_2_IRQHandler
    .thumb_set ADC1_2_IRQHandler, Default_Handler

    .weak USB_HP_IRQHandler
    .thumb_set USB_HP_IRQHandler, Default_Handler

    .weak USB_LP_IRQHandler
    .thumb_set USB_LP_IRQHandler, Default_Handler

    .weak FDCAN1_IT0_IRQHandler
    .thumb_set FDCAN1_IT0_IRQHandler, Default_Handler

    .weak FDCAN1_IT1_IRQHandler
    .thumb_set FDCAN1_IT1_IRQHandler, Default_Handler

    .weak EXTI9_5_IRQHandler
    .thumb_set EXTI9_5_IRQHandler, Default_Handler

    .weak TIM1_BRK_TIM15_IRQHandler
    .thumb_set TIM1_BRK_TIM15_IRQHandler, Default_Handler

    .weak TIM1_UP_TIM16_IRQHandler
    .thumb_set TIM1_UP_TIM16_IRQHandler, Default_Handler

    .weak TIM1_TRG_COM_TIM17_IRQHandler
    .thumb_set TIM1_TRG_COM_TIM17_IRQHandler, Default_Handler

    .weak TIM1_CC_IRQHandler
    .thumb_set TIM1_CC_IRQHandler, Default_Handler

    .weak TIM2_IRQHandler
    .thumb_set TIM2_IRQHandler, Default_Handler

    .weak TIM3_IRQHandler
    .thumb_set TIM3_IRQHandler, Default_Handler

    .weak TIM4_IRQHandler
    .thumb_set TIM4_IRQHandler, Default_Handler

    .weak I2C1_EV_IRQHandler
    .thumb_set I2C1_EV_IRQHandler, Default_Handler

    .weak I2C1_ER_IRQHandler
    .thumb_set I2C1_ER_IRQHandler, Default_Handler

    .weak I2C2_EV_IRQHandler
    .thumb_set I2C2_EV_IRQHandler, Default_Handler

    .weak I2C2_ER_IRQHandler
    .thumb_set I2C2_ER_IRQHandler, Default_Handler

    .weak SPI1_IRQHandler
    .thumb_set SPI1_IRQHandler, Default_Handler

    .weak SPI2_IRQHandler
    .thumb_set SPI2_IRQHandler, Default_Handler

    .weak USART1_IRQHandler
    .thumb_set USART1_IRQHandler, Default_Handler

    .weak USART2_IRQHandler
    .thumb_set USART2_IRQHandler, Default_Handler

    .weak USART3_IRQHandler
    .thumb_set USART3_IRQHandler, Default_Handler

    .weak EXTI15_10_IRQHandler
    .thumb_set EXTI15_10_IRQHandler, Default_Handler

    .weak RTC_Alarm_IRQHandler
    .thumb_set RTC_Alarm_IRQHandler, Default_Handler

    .weak USBWakeUp_IRQHandler
    .thumb_set USBWakeUp_IRQHandler, Default_Handler

    .weak TIM8_BRK_IRQHandler
    .thumb_set TIM8_BRK_IRQHandler, Default_Handler

    .weak TIM8_UP_IRQHandler
    .thumb_set TIM8_UP_IRQHandler, Default_Handler

    .weak TIM8_TRG_COM_IRQHandler
    .thumb_set TIM8_TRG_COM_IRQHandler, Default_Handler

    .weak TIM8_CC_IRQHandler
    .thumb_set TIM8_CC_IRQHandler, Default_Handler

    .weak ADC3_IRQHandler
    .thumb_set ADC3_IRQHandler, Default_Handler

    .weak FMC_IRQHandler
    .thumb_set FMC_IRQHandler, Default_Handler

    .weak LPTIM1_IRQHandler
    .thumb_set LPTIM1_IRQHandler, Default_Handler

    .weak TIM5_IRQHandler
    .thumb_set TIM5_IRQHandler, Default_Handler

    .weak SPI3_IRQHandler
    .thumb_set SPI3_IRQHandler, Default_Handler

    .weak UART4_IRQHandler
    .thumb_set UART4_IRQHandler, Default_Handler

    .weak UART5_IRQHandler
    .thumb_set UART5_IRQHandler, Default_Handler

    .weak TIM6_DAC_IRQHandler
    .thumb_set TIM6_DAC_IRQHandler, Default_Handler

    .weak TIM7_DAC_IRQHandler
    .thumb_set TIM7_DAC_IRQHandler, Default_Handler

    .weak DMA2_Channel1_IRQHandler
    .thumb_set DMA2_Channel1_IRQHandler, Default_Handler

    .weak DMA2_Channel2_IRQHandler
    .thumb_set DMA2_Channel2_IRQHandler, Default_Handler

    .weak DMA2_Channel3_IRQHandler
    .thumb_set DMA2_Channel3_IRQHandler, Default_Handler

    .weak DMA2_Channel4_IRQHandler
    .thumb_set DMA2_Channel4_IRQHandler, Default_Handler

    .weak DMA2_Channel5_IRQHandler
    .thumb_set DMA2_Channel5_IRQHandler, Default_Handler

    .weak ADC4_IRQHandler
    .thumb_set ADC4_IRQHandler, Default_Handler

    .weak ADC5_IRQHandler
    .thumb_set ADC5_IRQHandler, Default_Handler

    .weak UCPD1_IRQHandler
    .thumb_set UCPD1_IRQHandler, Default_Handler

    .weak COMP1_2_3_IRQHandler
    .thumb_set COMP1_2_3_IRQHandler, Default_Handler

    .weak COMP4_5_6_IRQHandler
    .thumb_set COMP4_5_6_IRQHandler, Default_Handler

    .weak COMP7_IRQHandler
    .thumb_set COMP7_IRQHandler, Default_Handler

    .weak HRTIM1_Master_IRQHandler
    .thumb_set HRTIM1_Master_IRQHandler, Default_Handler

    .weak HRTIM1_TIMA_IRQHandler
    .thumb_set HRTIM1_TIMA_IRQHandler, Default_Handler

    .weak HRTIM1_TIMB_IRQHandler
    .thumb_set HRTIM1_TIMB_IRQHandler, Default_Handler

    .weak HRTIM1_TIMC_IRQHandler
    .thumb_set HRTIM1_TIMC_IRQHandler, Default_Handler

    .weak HRTIM1_TIMD_IRQHandler
    .thumb_set HRTIM1_TIMD_IRQHandler, Default_Handler

    .weak HRTIM1_TIME_IRQHandler
    .thumb_set HRTIM1_TIME_IRQHandler, Default_Handler

    .weak HRTIM1_FLT_IRQHandler
    .thumb_set HRTIM1_FLT_IRQHandler, Default_Handler

    .weak HRTIM1_TIMF_IRQHandler
    .thumb_set HRTIM1_TIMF_IRQHandler, Default_Handler

    .weak CRS_IRQHandler
    .thumb_set CRS_IRQHandler, Default_Handler

    .weak SAI1_IRQHandler
    .thumb_set SAI1_IRQHandler, Default_Handler

    .weak TIM20_BRK_IRQHandler
    .thumb_set TIM20_BRK_IRQHandler, Default_Handler

    .weak TIM20_UP_IRQHandler
    .thumb_set TIM20_UP_IRQHandler, Default_Handler

    .weak TIM20_TRG_COM_IRQHandler
    .thumb_set TIM20_TRG_COM_IRQHandler, Default_Handler

    .weak TIM20_CC_IRQHandler
    .thumb_set TIM20_CC_IRQHandler, Default_Handler

    .weak FPU_IRQHandler
    .thumb_set FPU_IRQHandler, Default_Handler

    .weak I2C4_EV_IRQHandler
    .thumb_set I2C4_EV_IRQHandler, Default_Handler

    .weak I2C4_ER_IRQHandler
    .thumb_set I2C4_ER_IRQHandler, Default_Handler

    .weak SPI4_IRQHandler
    .thumb_set SPI4_IRQHandler, Default_Handler

    .weak FDCAN2_IT0_IRQHandler
    .thumb_set FDCAN2_IT0_IRQHandler, Default_Handler

    .weak FDCAN2_IT1_IRQHandler
    .thumb_set FDCAN2_IT1_IRQHandler, Default_Handler

    .weak FDCAN3_IT0_IRQHandler
    .thumb_set FDCAN3_IT0_IRQHandler, Default_Handler

    .weak FDCAN3_IT1_IRQHandler
    .thumb_set FDCAN3_IT1_IRQHandler, Default_Handler

    .weak RNG_IRQHandler
    .thumb_set RNG_IRQHandler, Default_Handler

    .weak LPUART1_IRQHandler
    .thumb_set LPUART1_IRQHandler, Default_Handler

    .weak I2C3_EV_IRQHandler
    .thumb_set I2C3_EV_IRQHandler, Default_Handler

    .weak I2C3_ER_IRQHandler
    .thumb_set I2C3_ER_IRQHandler, Default_Handler

    .weak DMAMUX_OVR_IRQHandler
    .thumb_set DMAMUX_OVR_IRQHandler, Default_Handler

    .weak QUADSPI_IRQHandler
    .thumb_set QUADSPI_IRQHandler, Default_Handler

    .weak DMA1_Channel8_IRQHandler
    .thumb_set DMA1_Channel8_IRQHandler, Default_Handler

    .weak DMA2_Channel6_IRQHandler
    .thumb_set DMA2_Channel6_IRQHandler, Default_Handler

    .weak DMA2_Channel7_IRQHandler
    .thumb_set DMA2_Channel7_IRQHandler, Default_Handler

    .weak DMA2_Channel8_IRQHandler
    .thumb_set DMA2_Channel8_IRQHandler, Default_Handler

    .weak CORDIC_IRQHandler
    .thumb_set CORDIC_IRQHandler, Default_Handler

    .weak FMAC_IRQHandler
    .thumb_set FMAC_IRQHandler, Default_Handler

    .end
