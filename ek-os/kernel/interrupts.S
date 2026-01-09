/**
 * @file interrupts.S
 * @brief ISR stubs for x86_64
 *
 * Note: Written explicitly without macros to ensure correct values are pushed.
 */

.intel_syntax noprefix

.section .text

/* CPU exceptions - no error code */
.global isr_stub_0
isr_stub_0:
    push 0
    push 0
    jmp isr_common

.global isr_stub_1
isr_stub_1:
    push 0
    push 1
    jmp isr_common

.global isr_stub_2
isr_stub_2:
    push 0
    push 2
    jmp isr_common

.global isr_stub_3
isr_stub_3:
    push 0
    push 3
    jmp isr_common

.global isr_stub_4
isr_stub_4:
    push 0
    push 4
    jmp isr_common

.global isr_stub_5
isr_stub_5:
    push 0
    push 5
    jmp isr_common

.global isr_stub_6
isr_stub_6:
    push 0
    push 6
    jmp isr_common

.global isr_stub_7
isr_stub_7:
    push 0
    push 7
    jmp isr_common

/* CPU exceptions - with error code (CPU pushes it) */
.global isr_stub_8
isr_stub_8:
    push 8
    jmp isr_common

.global isr_stub_10
isr_stub_10:
    push 10
    jmp isr_common

.global isr_stub_11
isr_stub_11:
    push 11
    jmp isr_common

.global isr_stub_12
isr_stub_12:
    push 12
    jmp isr_common

.global isr_stub_13
isr_stub_13:
    push 13
    jmp isr_common

.global isr_stub_14
isr_stub_14:
    push 14
    jmp isr_common

.global isr_stub_16
isr_stub_16:
    push 0
    push 16
    jmp isr_common

.global isr_stub_17
isr_stub_17:
    push 17
    jmp isr_common

.global isr_stub_18
isr_stub_18:
    push 0
    push 18
    jmp isr_common

.global isr_stub_19
isr_stub_19:
    push 0
    push 19
    jmp isr_common

/* Hardware IRQs (remapped to 32-47) - no error code */
.global isr_stub_32
isr_stub_32:
    push 0
    push 32
    jmp isr_common

.global isr_stub_33
isr_stub_33:
    push 0
    push 33
    jmp isr_common

.global isr_stub_39
isr_stub_39:
    push 0
    push 39
    jmp isr_common

/* Common handler - save all registers and call C function */
isr_common:
    /* Save all general-purpose registers */
    push rax
    push rcx
    push rdx
    push rbx
    push rbp
    push rsi
    push rdi
    push r8
    push r9
    push r10
    push r11
    push r12
    push r13
    push r14
    push r15

    /* Call C handler with pointer to stack frame */
    mov rdi, rsp
    call isr_common_handler

    /* Restore registers */
    pop r15
    pop r14
    pop r13
    pop r12
    pop r11
    pop r10
    pop r9
    pop r8
    pop rdi
    pop rsi
    pop rbp
    pop rbx
    pop rdx
    pop rcx
    pop rax

    /* Remove interrupt number and error code */
    add rsp, 16

    /* Return from interrupt */
    iretq
