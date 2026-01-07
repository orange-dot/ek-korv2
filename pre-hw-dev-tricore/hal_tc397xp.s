# tric_asm_file_start
	.file	"hal_tc397xp.c"
	.file	"hal_tc397xp.c"
.section .text,"ax",@progbits
.Ltext0:
	.file 1 "src/hal/hal_tc397xp.c"
	.section	.text.__disable,"ax",@progbits
	.align 1
	.type	__disable, @function
__disable:
.LFB0:
	.file 2 "./include/tricore_intrinsics.h"
	.loc 2 82 1
	mov.aa	%a14, %SP
.LCFI0:
	.loc 2 83 5
#APP
	# 83 "./include/tricore_intrinsics.h" 1
	disable
	# 0 "" 2
	.loc 2 84 1
#NO_APP
	nop
	ret	#__disable
.LFE0:
	.size __disable, .-__disable
	.section	.text.__enable,"ax",@progbits
	.align 1
	.type	__enable, @function
__enable:
.LFB1:
	.loc 2 94 1
	mov.aa	%a14, %SP
.LCFI1:
	.loc 2 95 5
#APP
	# 95 "./include/tricore_intrinsics.h" 1
	enable
	# 0 "" 2
	.loc 2 96 1
#NO_APP
	nop
	ret	#__enable
.LFE1:
	.size __enable, .-__enable
	.section	.text.__dsync,"ax",@progbits
	.align 1
	.type	__dsync, @function
__dsync:
.LFB4:
	.loc 2 133 1
	mov.aa	%a14, %SP
.LCFI2:
	.loc 2 134 5
#APP
	# 134 "./include/tricore_intrinsics.h" 1
	dsync
	# 0 "" 2
	.loc 2 135 1
#NO_APP
	nop
	ret	#__dsync
.LFE4:
	.size __dsync, .-__dsync
	.section	.text.__isync,"ax",@progbits
	.align 1
	.type	__isync, @function
__isync:
.LFB5:
	.loc 2 146 1
	mov.aa	%a14, %SP
.LCFI3:
	.loc 2 147 5
#APP
	# 147 "./include/tricore_intrinsics.h" 1
	isync
	# 0 "" 2
	.loc 2 148 1
#NO_APP
	nop
	ret	#__isync
.LFE5:
	.size __isync, .-__isync
	.section	.text.__debug,"ax",@progbits
	.align 1
	.type	__debug, @function
__debug:
.LFB7:
	.loc 2 171 1
	mov.aa	%a14, %SP
.LCFI4:
	.loc 2 172 5
#APP
	# 172 "./include/tricore_intrinsics.h" 1
	debug
	# 0 "" 2
	.loc 2 173 1
#NO_APP
	nop
	ret	#__debug
.LFE7:
	.size __debug, .-__debug
	.section	.text.__nop,"ax",@progbits
	.align 1
	.type	__nop, @function
__nop:
.LFB8:
	.loc 2 183 1
	mov.aa	%a14, %SP
.LCFI5:
	.loc 2 184 5
#APP
	# 184 "./include/tricore_intrinsics.h" 1
	nop
	# 0 "" 2
	.loc 2 185 1
#NO_APP
	nop
	ret	#__nop
.LFE8:
	.size __nop, .-__nop
	.section	.text.__get_core_id,"ax",@progbits
	.align 1
	.type	__get_core_id, @function
__get_core_id:
.LFB23:
	.loc 2 400 1
	mov.aa	%a14, %SP
.LCFI6:
	sub.a	%SP, 8
.LBB2:
	.loc 2 401 12
#APP
	# 401 "./include/tricore_intrinsics.h" 1
	mfcr %d2, 65052
	# 0 "" 2
#NO_APP
	st.w	[%a14] -4, %d2
	ld.w	%d2, [%a14] -4
.LBE2:
	.loc 2 401 33
	and	%d2, %d2, 7
	.loc 2 402 1
	ret	#__get_core_id
.LFE23:
	.size __get_core_id, .-__get_core_id
	.section	.text.cpu_get_id,"ax",@progbits
	.align 1
	.type	cpu_get_id, @function
cpu_get_id:
.LFB36:
	.file 3 "./src/arch/tricore_cpu.h"
	.loc 3 92 1
	mov.aa	%a14, %SP
.LCFI7:
	.loc 3 93 12
	call	__get_core_id
	.loc 3 94 1
	ret	#cpu_get_id
.LFE36:
	.size cpu_get_id, .-cpu_get_id
	.section	.text.cpu_interrupts_enabled,"ax",@progbits
	.align 1
	.type	cpu_interrupts_enabled, @function
cpu_interrupts_enabled:
.LFB42:
	.loc 3 172 1
	mov.aa	%a14, %SP
.LCFI8:
	sub.a	%SP, 8
.LBB3:
	.loc 3 173 13
#APP
	# 173 "./src/arch/tricore_cpu.h" 1
	mfcr %d2, 65068
	# 0 "" 2
#NO_APP
	st.w	[%a14] -4, %d2
	ld.w	%d2, [%a14] -4
.LBE3:
	.loc 3 173 30
	and	%d2, %d2, 256
	.loc 3 173 40
	ne	%d2, %d2, 0
	and	%d2, %d2, 255
	.loc 3 174 1
	ret	#cpu_interrupts_enabled
.LFE42:
	.size cpu_interrupts_enabled, .-cpu_interrupts_enabled
	.section	.g_critical_nesting,"aw"
	.align 2
	.type	g_critical_nesting, @object
	.size	g_critical_nesting, 24
g_critical_nesting:
	.zero	24
	.section	.g_tick_count,"aw"
	.align 2
	.type	g_tick_count, @object
	.size	g_tick_count, 24
g_tick_count:
	.zero	24
	.section	.g_systick_callbacks,"aw"
	.align 2
	.type	g_systick_callbacks, @object
	.size	g_systick_callbacks, 24
g_systick_callbacks:
	.zero	24
	.section	.g_stm_clock_hz,"aw"
	.align 2
	.type	g_stm_clock_hz, @object
	.size	g_stm_clock_hz, 4
g_stm_clock_hz:
	.zero	4
	.section	.text.ekk_hal_init,"ax",@progbits
	.align 1
	.global	ekk_hal_init
	.type	ekk_hal_init, @function
ekk_hal_init:
.LFB53:
	.loc 1 51 1
	mov.aa	%a14, %SP
.LCFI9:
	.loc 1 53 9
	call	ekk_hal_get_core_id
	.loc 1 53 8 discriminator 1
	jz	%d2, .L14
	.loc 1 54 16
	mov	%d2, -1
	ret	#ekk_hal_init
.L14:
	.loc 1 58 22
	call	get_stm_clock
	.loc 1 58 20 discriminator 1
	st.w	[%A0] SM:g_stm_clock_hz, %d2
	.loc 1 59 24
	ld.w	%d2, [%A0] SM:g_stm_clock_hz
	.loc 1 59 8
	jnz	%d2, .L16
	.loc 1 60 24
	movh	%d2, 1526
	addi	%d2, %d2, -7936
	st.w	[%A0] SM:g_stm_clock_hz, %d2
.L16:
	.loc 1 64 5
	mov	%d5, 24
	mov	%d4, 0
	lea	%a4, [%A0] SM:g_critical_nesting
	call	memset
	.loc 1 65 5
	mov	%d5, 24
	mov	%d4, 0
	lea	%a4, [%A0] SM:g_tick_count
	call	memset
	.loc 1 66 5
	mov	%d5, 24
	mov	%d4, 0
	lea	%a4, [%A0] SM:g_systick_callbacks
	call	memset
	.loc 1 71 12
	mov	%d2, 0
	.loc 1 72 1
	ret	#ekk_hal_init
.LFE53:
	.size ekk_hal_init, .-ekk_hal_init
	.global	ekk_hal_init_end
ekk_hal_init_end:
	.section	.text.ekk_hal_init_core,"ax",@progbits
	.align 1
	.global	ekk_hal_init_core
	.type	ekk_hal_init_core, @function
ekk_hal_init_core:
.LFB54:
	.loc 1 75 1
	mov.aa	%a14, %SP
.LCFI10:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 76 8
	ld.w	%d2, [%a14] -4
	jlt.u	%d2, 6, .L18
	.loc 1 77 16
	mov	%d2, -1
	ret	#ekk_hal_init_core
.L18:
	.loc 1 80 33
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	mov	%d2, 0
	st.w	[%a2]0, %d2
	.loc 1 81 27
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_tick_count
	addsc.a	%a2, %a2, %d2, 0
	mov	%d2, 0
	st.w	[%a2]0, %d2
	.loc 1 82 34
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_systick_callbacks
	addsc.a	%a2, %a2, %d2, 0
	mov	%d2, 0
	st.w	[%a2]0, %d2
	.loc 1 84 12
	mov	%d2, 0
	.loc 1 85 1
	ret	#ekk_hal_init_core
.LFE54:
	.size ekk_hal_init_core, .-ekk_hal_init_core
	.global	ekk_hal_init_core_end
ekk_hal_init_core_end:
	.section	.text.ekk_hal_get_core_id,"ax",@progbits
	.align 1
	.global	ekk_hal_get_core_id
	.type	ekk_hal_get_core_id, @function
ekk_hal_get_core_id:
.LFB55:
	.loc 1 92 1
	mov.aa	%a14, %SP
.LCFI11:
	.loc 1 93 12
	call	cpu_get_id
	.loc 1 94 1
	ret	#ekk_hal_get_core_id
.LFE55:
	.size ekk_hal_get_core_id, .-ekk_hal_get_core_id
	.global	ekk_hal_get_core_id_end
ekk_hal_get_core_id_end:
	.section	.text.ekk_hal_get_core_count,"ax",@progbits
	.align 1
	.global	ekk_hal_get_core_count
	.type	ekk_hal_get_core_count, @function
ekk_hal_get_core_count:
.LFB56:
	.loc 1 97 1
	mov.aa	%a14, %SP
.LCFI12:
	.loc 1 98 12
	mov	%d2, 6
	.loc 1 99 1
	ret	#ekk_hal_get_core_count
.LFE56:
	.size ekk_hal_get_core_count, .-ekk_hal_get_core_count
	.global	ekk_hal_get_core_count_end
ekk_hal_get_core_count_end:
	.section	.text.ekk_hal_is_boot_core,"ax",@progbits
	.align 1
	.global	ekk_hal_is_boot_core
	.type	ekk_hal_is_boot_core, @function
ekk_hal_is_boot_core:
.LFB57:
	.loc 1 102 1
	mov.aa	%a14, %SP
.LCFI13:
	.loc 1 103 12
	call	cpu_get_id
	.loc 1 103 25 discriminator 1
	eq	%d2, %d2, 0
	and	%d2, %d2, 255
	.loc 1 104 1
	ret	#ekk_hal_is_boot_core
.LFE57:
	.size ekk_hal_is_boot_core, .-ekk_hal_is_boot_core
	.global	ekk_hal_is_boot_core_end
ekk_hal_is_boot_core_end:
	.section	.text.ekk_hal_disable_interrupts,"ax",@progbits
	.align 1
	.global	ekk_hal_disable_interrupts
	.type	ekk_hal_disable_interrupts, @function
ekk_hal_disable_interrupts:
.LFB58:
	.loc 1 111 1
	mov.aa	%a14, %SP
.LCFI14:
	sub.a	%SP, 8
.LBB4:
	.loc 1 112 20
#APP
	# 112 "src/hal/hal_tc397xp.c" 1
	mfcr %d2, 65068
	# 0 "" 2
#NO_APP
	st.w	[%a14] -4, %d2
	ld.w	%d2, [%a14] -4
.LBE4:
	.loc 1 112 14
	st.w	[%a14] -8, %d2
	.loc 1 113 5
	call	__disable
	.loc 1 114 12
	ld.w	%d2, [%a14] -8
	.loc 1 115 1
	ret	#ekk_hal_disable_interrupts
.LFE58:
	.size ekk_hal_disable_interrupts, .-ekk_hal_disable_interrupts
	.global	ekk_hal_disable_interrupts_end
ekk_hal_disable_interrupts_end:
	.section	.text.ekk_hal_enable_interrupts,"ax",@progbits
	.align 1
	.global	ekk_hal_enable_interrupts
	.type	ekk_hal_enable_interrupts, @function
ekk_hal_enable_interrupts:
.LFB59:
	.loc 1 118 1
	mov.aa	%a14, %SP
.LCFI15:
	.loc 1 119 5
	call	__enable
	.loc 1 120 1
	nop
	ret	#ekk_hal_enable_interrupts
.LFE59:
	.size ekk_hal_enable_interrupts, .-ekk_hal_enable_interrupts
	.global	ekk_hal_enable_interrupts_end
ekk_hal_enable_interrupts_end:
	.section	.text.ekk_hal_restore_interrupts,"ax",@progbits
	.align 1
	.global	ekk_hal_restore_interrupts
	.type	ekk_hal_restore_interrupts, @function
ekk_hal_restore_interrupts:
.LFB60:
	.loc 1 123 1
	mov.aa	%a14, %SP
.LCFI16:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 124 15
	ld.w	%d2, [%a14] -4
	and	%d2, %d2, 256
	.loc 1 124 8
	jz	%d2, .L31
	.loc 1 125 9
	call	__enable
.L31:
	.loc 1 127 1
	nop
	ret	#ekk_hal_restore_interrupts
.LFE60:
	.size ekk_hal_restore_interrupts, .-ekk_hal_restore_interrupts
	.global	ekk_hal_restore_interrupts_end
ekk_hal_restore_interrupts_end:
	.section	.text.ekk_hal_interrupts_enabled,"ax",@progbits
	.align 1
	.global	ekk_hal_interrupts_enabled
	.type	ekk_hal_interrupts_enabled, @function
ekk_hal_interrupts_enabled:
.LFB61:
	.loc 1 130 1
	mov.aa	%a14, %SP
.LCFI17:
	.loc 1 131 12
	call	cpu_interrupts_enabled
	.loc 1 132 1
	ret	#ekk_hal_interrupts_enabled
.LFE61:
	.size ekk_hal_interrupts_enabled, .-ekk_hal_interrupts_enabled
	.global	ekk_hal_interrupts_enabled_end
ekk_hal_interrupts_enabled_end:
	.section	.text.ekk_hal_enter_critical,"ax",@progbits
	.align 1
	.global	ekk_hal_enter_critical
	.type	ekk_hal_enter_critical, @function
ekk_hal_enter_critical:
.LFB62:
	.loc 1 139 1
	mov.aa	%a14, %SP
.LCFI18:
	sub.a	%SP, 8
	.loc 1 140 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 142 5
	call	__disable
	.loc 1 144 44
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 144 24
	addi	%d3, %d2, 1
	.loc 1 144 14
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
	st.w	[%a14] -8, %d3
	.loc 1 146 12
	ld.w	%d2, [%a14] -8
	.loc 1 147 1
	ret	#ekk_hal_enter_critical
.LFE62:
	.size ekk_hal_enter_critical, .-ekk_hal_enter_critical
	.global	ekk_hal_enter_critical_end
ekk_hal_enter_critical_end:
	.section	.text.ekk_hal_exit_critical,"ax",@progbits
	.align 1
	.global	ekk_hal_exit_critical
	.type	ekk_hal_exit_critical, @function
ekk_hal_exit_critical:
.LFB63:
	.loc 1 150 1
	mov.aa	%a14, %SP
.LCFI19:
	sub.a	%SP, 8
	.loc 1 151 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 153 27
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 153 8
	jz	%d2, .L37
	.loc 1 154 27
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 154 36
	addi	%d3, %d2, -1
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
.L37:
	.loc 1 157 27
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 157 8
	jnz	%d2, .L38
	.loc 1 158 9
	call	__enable
.L38:
	.loc 1 161 30
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 162 1
	ret	#ekk_hal_exit_critical
.LFE63:
	.size ekk_hal_exit_critical, .-ekk_hal_exit_critical
	.global	ekk_hal_exit_critical_end
ekk_hal_exit_critical_end:
	.section	.text.ekk_hal_in_critical,"ax",@progbits
	.align 1
	.global	ekk_hal_in_critical
	.type	ekk_hal_in_critical, @function
ekk_hal_in_critical:
.LFB64:
	.loc 1 165 1
	mov.aa	%a14, %SP
.LCFI20:
	sub.a	%SP, 8
	.loc 1 166 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 167 30
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_critical_nesting
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 167 40
	ne	%d2, %d2, 0
	and	%d2, %d2, 255
	.loc 1 168 1
	ret	#ekk_hal_in_critical
.LFE64:
	.size ekk_hal_in_critical, .-ekk_hal_in_critical
	.global	ekk_hal_in_critical_end
ekk_hal_in_critical_end:
	.section	.text.get_stm_base,"ax",@progbits
	.align 1
	.type	get_stm_base, @function
get_stm_base:
.LFB65:
	.loc 1 181 1
	mov.aa	%a14, %SP
.LCFI21:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 182 5
	movh.a	%a2, hi:.L45
	lea	%a2, [%a2] lo:.L45
	ld.w	%d2, [%a14] -4
	jge.u	%d2, 6, .L43
	addsc.a	%a2, %a2, %d2, 2
	ji	%a2
	.align 2
	.align 2
.L45:
	.code32
	j	.L50
	.code32
	j	.L49
	.code32
	j	.L48
	.code32
	j	.L47
	.code32
	j	.L46
	.code32
	j	.L44
.L50:
	.loc 1 183 24
	movh	%d2, 61440
	addi	%d2, %d2, 4096
	ret	#get_stm_base
.L49:
	.loc 1 184 24
	movh	%d2, 61440
	addi	%d2, %d2, 4352
	ret	#get_stm_base
.L48:
	.loc 1 185 24
	movh	%d2, 61440
	addi	%d2, %d2, 4608
	ret	#get_stm_base
.L47:
	.loc 1 186 24
	movh	%d2, 61440
	addi	%d2, %d2, 4864
	ret	#get_stm_base
.L46:
	.loc 1 187 24
	movh	%d2, 61440
	addi	%d2, %d2, 5120
	ret	#get_stm_base
.L44:
	.loc 1 188 24
	movh	%d2, 61440
	addi	%d2, %d2, 5376
	ret	#get_stm_base
.L43:
	.loc 1 189 25
	movh	%d2, 61440
	addi	%d2, %d2, 4096
	.loc 1 191 1
	ret	#get_stm_base
.LFE65:
	.size get_stm_base, .-get_stm_base
	.section	.text.ekk_hal_get_time_us,"ax",@progbits
	.align 1
	.global	ekk_hal_get_time_us
	.type	ekk_hal_get_time_us, @function
ekk_hal_get_time_us:
.LFB66:
	.loc 1 194 1
	mov.aa	%a14, %SP
.LCFI22:
	sub.a	%SP, 16
	.loc 1 195 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -8, %d2
	.loc 1 196 25
	ld.w	%d4, [%a14] -8
	call	get_stm_base
	st.w	[%a14] -12, %d2
	.loc 1 199 21
	ld.w	%d2, [%a14] -12
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	.loc 1 199 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -16, %d2
	.loc 1 203 39
	ld.w	%d2, [%A0] SM:g_stm_clock_hz
	.loc 1 203 14
	movh	%d3, 17180
	addi	%d3, %d3, -8573
	mul.u	%e2, %d2, %d3
	sh	%d2, %d3, -18
	st.w	[%a14] -4, %d2
	.loc 1 204 8
	ld.w	%d2, [%a14] -4
	jnz	%d2, .L53
	.loc 1 204 31 discriminator 1
	mov	%d2, 1
	st.w	[%a14] -4, %d2
.L53:
	.loc 1 206 17
	ld.w	%d3, [%a14] -16
	ld.w	%d2, [%a14] -4
	div.u	%e2, %d3, %d2
	.loc 1 207 1
	ret	#ekk_hal_get_time_us
.LFE66:
	.size ekk_hal_get_time_us, .-ekk_hal_get_time_us
	.global	ekk_hal_get_time_us_end
ekk_hal_get_time_us_end:
	.section	.text.ekk_hal_get_time_ms,"ax",@progbits
	.align 1
	.global	ekk_hal_get_time_ms
	.type	ekk_hal_get_time_ms, @function
ekk_hal_get_time_ms:
.LFB67:
	.loc 1 210 1
	mov.aa	%a14, %SP
.LCFI23:
	.loc 1 211 12
	call	ekk_hal_get_time_us
	.loc 1 211 34 discriminator 1
	movh	%d3, 4194
	addi	%d3, %d3, 19923
	mul.u	%e2, %d2, %d3
	sh	%d2, %d3, -6
	.loc 1 212 1
	ret	#ekk_hal_get_time_ms
.LFE67:
	.size ekk_hal_get_time_ms, .-ekk_hal_get_time_ms
	.global	ekk_hal_get_time_ms_end
ekk_hal_get_time_ms_end:
	.global	__udivdi3
	.section	.text.ekk_hal_get_time_us64,"ax",@progbits
	.align 1
	.global	ekk_hal_get_time_us64
	.type	ekk_hal_get_time_us64, @function
ekk_hal_get_time_us64:
.LFB68:
	.loc 1 215 1
	mov.aa	%a14, %SP
.LCFI24:
	sub.a	%SP, 32
	.loc 1 216 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -12, %d2
	.loc 1 217 25
	ld.w	%d4, [%a14] -12
	call	get_stm_base
	st.w	[%a14] -16, %d2
.L58:
	.loc 1 222 16
	ld.w	%d2, [%a14] -16
	addi	%d2, %d2, 40
	mov.a	%a2, %d2
	.loc 1 222 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -20, %d2
	.loc 1 223 16
	ld.w	%d2, [%a14] -16
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	.loc 1 223 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -24, %d2
	.loc 1 224 22 discriminator 1
	ld.w	%d2, [%a14] -16
	addi	%d2, %d2, 40
	mov.a	%a2, %d2
	ld.w	%d2, [%a2]0
	.loc 1 224 19 discriminator 1
	ld.w	%d3, [%a14] -20
	jne	%d3, %d2, .L58
	.loc 1 226 23
	ld.w	%d2, [%a14] -20
	mov	%d2, %d2
	mov	%d3, 0
	.loc 1 226 38
	mov	%d9, %d2
	mov	%d8, 0
	.loc 1 226 45
	ld.w	%d2, [%a14] -24
	mov	%d2, %d2
	mov	%d3, 0
	.loc 1 226 14
	or	%d4, %d8, %d2
	st.w	[%a14] -32, %d4
	or	%d2, %d9, %d3
	st.w	[%a14] -28, %d2
	.loc 1 229 39
	ld.w	%d2, [%A0] SM:g_stm_clock_hz
	movh	%d3, 17180
	addi	%d3, %d3, -8573
	mul.u	%e2, %d2, %d3
	sh	%d2, %d3, -18
	.loc 1 229 14
	mov	%d2, %d2
	mov	%d3, 0
	st.d	[%a14] -8, %e2
	.loc 1 230 8
	ld.d	%e2, [%a14] -8
	or	%d2, %d3
	jnz	%d2, .L59
	.loc 1 230 31 discriminator 1
	mov.a	%a2, 1
	mov.a	%a3, 0
	st.da	[%a14] -8, %A2
.L59:
	.loc 1 232 18
	ld.d	%e6, [%a14] -8
	ld.d	%e4, [%a14] -32
	call	__udivdi3
	mov.a	%a2, %d2
	mov.a	%a3, %d3
	.loc 1 233 1
	mov.d	%d2, %a2
	mov.d	%d3, %a3
	ret	#ekk_hal_get_time_us64
.LFE68:
	.size ekk_hal_get_time_us64, .-ekk_hal_get_time_us64
	.global	ekk_hal_get_time_us64_end
ekk_hal_get_time_us64_end:
	.section	.text.ekk_hal_delay_us,"ax",@progbits
	.align 1
	.global	ekk_hal_delay_us
	.type	ekk_hal_delay_us, @function
ekk_hal_delay_us:
.LFB69:
	.loc 1 236 1
	mov.aa	%a14, %SP
.LCFI25:
	sub.a	%SP, 16
	st.w	[%a14] -12, %d4
	.loc 1 237 22
	call	ekk_hal_get_time_us
	st.w	[%a14] -4, %d2
	.loc 1 238 11
	j	.L62
.L63:
	.loc 1 239 9
	call	__nop
.L62:
	.loc 1 238 13
	call	ekk_hal_get_time_us
	mov	%d3, %d2
	.loc 1 238 35 discriminator 1
	ld.w	%d2, [%a14] -4
	sub	%d3, %d2
	.loc 1 238 44 discriminator 1
	ld.w	%d2, [%a14] -12
	jlt.u	%d3, %d2, .L63
	.loc 1 241 1
	nop
	nop
	ret	#ekk_hal_delay_us
.LFE69:
	.size ekk_hal_delay_us, .-ekk_hal_delay_us
	.global	ekk_hal_delay_us_end
ekk_hal_delay_us_end:
	.section	.text.ekk_hal_delay_ms,"ax",@progbits
	.align 1
	.global	ekk_hal_delay_ms
	.type	ekk_hal_delay_ms, @function
ekk_hal_delay_ms:
.LFB70:
	.loc 1 244 1
	mov.aa	%a14, %SP
.LCFI26:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 245 5
	ld.w	%d2, [%a14] -4
	mov	%d3, 1000
	mul	%d2, %d3
	mov	%d4, %d2
	call	ekk_hal_delay_us
	.loc 1 246 1
	nop
	ret	#ekk_hal_delay_ms
.LFE70:
	.size ekk_hal_delay_ms, .-ekk_hal_delay_ms
	.global	ekk_hal_delay_ms_end
ekk_hal_delay_ms_end:
	.section	.text.stm_compare_isr,"ax",@progbits
	.align 1
	.type	stm_compare_isr, @function
stm_compare_isr:
.LFB71:
	.loc 1 256 1
	mov.aa	%a14, %SP
.LCFI27:
	sub.a	%SP, 16
	.loc 1 257 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 258 25
	ld.w	%d4, [%a14] -4
	call	get_stm_base
	st.w	[%a14] -8, %d2
	.loc 1 261 5
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 64
	mov.a	%a2, %d2
	mov	%d2, 1
	st.w	[%a2]0, %d2
	.loc 1 264 38
	ld.w	%d2, [%A0] SM:g_stm_clock_hz
	.loc 1 264 14
	movh	%d3, 4194
	addi	%d3, %d3, 19923
	mul.u	%e2, %d2, %d3
	sh	%d2, %d3, -6
	st.w	[%a14] -12, %d2
	.loc 1 265 24
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	.loc 1 265 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -16, %d2
	.loc 1 266 5
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 48
	mov.a	%a2, %d2
	ld.w	%d3, [%a14] -16
	ld.w	%d2, [%a14] -12
	add	%d2, %d3
	st.w	[%a2]0, %d2
	.loc 1 269 17
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_tick_count
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 269 26
	addi	%d3, %d2, 1
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_tick_count
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
	.loc 1 272 28
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_systick_callbacks
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 272 8
	jz	%d2, .L67
	.loc 1 273 28
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_systick_callbacks
	addsc.a	%a2, %a2, %d2, 0
	ld.a	%a2, [%a2]0
	.loc 1 273 9
	calli	%a2
.LVL0:
.L67:
	.loc 1 275 1
	nop
	ret	#stm_compare_isr
.LFE71:
	.size stm_compare_isr, .-stm_compare_isr
	.section	.text.ekk_hal_systick_init,"ax",@progbits
	.align 1
	.global	ekk_hal_systick_init
	.type	ekk_hal_systick_init, @function
ekk_hal_systick_init:
.LFB72:
	.loc 1 278 1
	mov.aa	%a14, %SP
.LCFI28:
	sub.a	%SP, 40
	st.a	[%a14] -36, %a4
	.loc 1 279 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 280 25
	ld.w	%d4, [%a14] -4
	call	get_stm_base
	st.w	[%a14] -8, %d2
	.loc 1 283 34
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_systick_callbacks
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a14] -36
	st.w	[%a2]0, %d2
	.loc 1 286 38
	ld.w	%d2, [%A0] SM:g_stm_clock_hz
	.loc 1 286 14
	movh	%d3, 4194
	addi	%d3, %d3, 19923
	mul.u	%e2, %d2, %d3
	sh	%d2, %d3, -6
	st.w	[%a14] -12, %d2
	.loc 1 289 24
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	.loc 1 289 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -16, %d2
	.loc 1 290 5
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 48
	mov.a	%a2, %d2
	ld.w	%d3, [%a14] -16
	ld.w	%d2, [%a14] -12
	add	%d2, %d3
	st.w	[%a2]0, %d2
	.loc 1 293 14
	mov	%d2, 31
	st.w	[%a14] -20, %d2
	.loc 1 294 5
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 56
	mov.a	%a2, %d2
	ld.w	%d2, [%a14] -20
	st.w	[%a2]0, %d2
	.loc 1 297 20
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 60
	mov.a	%a2, %d2
	.loc 1 297 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -24, %d2
	.loc 1 298 9
	ld.w	%d2, [%a14] -24
	or	%d2, %d2, 1
	st.w	[%a14] -24, %d2
	.loc 1 299 5
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 60
	mov.a	%a2, %d2
	ld.w	%d2, [%a14] -24
	st.w	[%a2]0, %d2
	.loc 1 303 14
	ld.w	%d2, [%a14] -4
	sh	%d2, 1
	st.w	[%a14] -28, %d2
	.loc 1 304 5
	movh.a	%a2, hi:stm_compare_isr
	lea	%a4, [%a2] lo:stm_compare_isr
	ld.w	%d6, [%a14] -4
	mov	%d5, 100
	ld.w	%d4, [%a14] -28
	call	irq_register
	.loc 1 306 12
	mov	%d2, 0
	.loc 1 307 1
	ret	#ekk_hal_systick_init
.LFE72:
	.size ekk_hal_systick_init, .-ekk_hal_systick_init
	.global	ekk_hal_systick_init_end
ekk_hal_systick_init_end:
	.section	.text.ekk_hal_get_tick_count,"ax",@progbits
	.align 1
	.global	ekk_hal_get_tick_count
	.type	ekk_hal_get_tick_count, @function
ekk_hal_get_tick_count:
.LFB73:
	.loc 1 310 1
	mov.aa	%a14, %SP
.LCFI29:
	sub.a	%SP, 8
	.loc 1 311 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 312 24
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	lea	%a2, [%A0] SM:g_tick_count
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 313 1
	ret	#ekk_hal_get_tick_count
.LFE73:
	.size ekk_hal_get_tick_count, .-ekk_hal_get_tick_count
	.global	ekk_hal_get_tick_count_end
ekk_hal_get_tick_count_end:
	.section	.text.ekk_hal_get_tick_period_us,"ax",@progbits
	.align 1
	.global	ekk_hal_get_tick_period_us
	.type	ekk_hal_get_tick_period_us, @function
ekk_hal_get_tick_period_us:
.LFB74:
	.loc 1 316 1
	mov.aa	%a14, %SP
.LCFI30:
	.loc 1 317 12
	mov	%d2, 1000
	.loc 1 318 1
	ret	#ekk_hal_get_tick_period_us
.LFE74:
	.size ekk_hal_get_tick_period_us, .-ekk_hal_get_tick_period_us
	.global	ekk_hal_get_tick_period_us_end
ekk_hal_get_tick_period_us_end:
	.section	.text.ekk_hal_trigger_context_switch,"ax",@progbits
	.align 1
	.global	ekk_hal_trigger_context_switch
	.type	ekk_hal_trigger_context_switch, @function
ekk_hal_trigger_context_switch:
.LFB75:
	.loc 1 329 1
	mov.aa	%a14, %SP
.LCFI31:
	sub.a	%SP, 16
	.loc 1 334 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -4, %d2
	.loc 1 338 26
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 14489
	addih	%d2, %d2, 3840
	.loc 1 338 14
	sh	%d2, 4
	st.w	[%a14] -8, %d2
	.loc 1 339 20
	ld.a	%a2, [%a14] -8
	.loc 1 339 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -12, %d2
	.loc 1 340 9
	ld.w	%d2, [%a14] -12
	movh	%d3, 1024
	or	%d2, %d3
	st.w	[%a14] -12, %d2
	.loc 1 341 5
	ld.a	%a2, [%a14] -8
	ld.w	%d2, [%a14] -12
	st.w	[%a2]0, %d2
	.loc 1 342 1
	nop
	ret	#ekk_hal_trigger_context_switch
.LFE75:
	.size ekk_hal_trigger_context_switch, .-ekk_hal_trigger_context_switch
	.global	ekk_hal_trigger_context_switch_end
ekk_hal_trigger_context_switch_end:
	.section	.text.ekk_hal_start_first_task,"ax",@progbits
	.align 1
	.global	ekk_hal_start_first_task
	.type	ekk_hal_start_first_task, @function
ekk_hal_start_first_task:
.LFB76:
	.loc 1 345 1
	mov.aa	%a14, %SP
.LCFI32:
	sub.a	%SP, 16
	st.a	[%a14] -12, %a4
	st.a	[%a14] -16, %a5
	.loc 1 350 14
	ld.w	%d2, [%a14] -12
	st.w	[%a14] -4, %d2
	.loc 1 351 21
	mov.a	%a5, 0
	ld.a	%a4, [%a14] -16
	ld.w	%d4, [%a14] -4
	call	csa_create_task_context
	st.w	[%a14] -8, %d2
	.loc 1 353 8
	ld.w	%d2, [%a14] -8
	jz	%d2, .L77
	.loc 1 354 9
	ld.w	%d4, [%a14] -8
	call	_start_first_task
.L77:
	.loc 1 359 9 discriminator 1
	call	__nop
	.loc 1 359 9 is_stmt 0
	j	.L77
.LFE76:
	.size ekk_hal_start_first_task, .-ekk_hal_start_first_task
	.global	ekk_hal_start_first_task_end
ekk_hal_start_first_task_end:
	.section	.text.ekk_hal_context_switch,"ax",@progbits
	.align 1
	.global	ekk_hal_context_switch
	.type	ekk_hal_context_switch, @function
ekk_hal_context_switch:
.LFB77:
	.loc 1 364 1 is_stmt 1
	mov.aa	%a14, %SP
.LCFI33:
	sub.a	%SP, 16
	st.a	[%a14] -12, %a4
	st.a	[%a14] -16, %a5
	.loc 1 369 15
	ld.w	%d2, [%a14] -12
	st.w	[%a14] -4, %d2
	.loc 1 370 14
	ld.w	%d2, [%a14] -16
	st.w	[%a14] -8, %d2
	.loc 1 372 5
	ld.w	%d4, [%a14] -8
	ld.a	%a4, [%a14] -4
	call	_context_switch_asm
	.loc 1 373 1
	nop
	ret	#ekk_hal_context_switch
.LFE77:
	.size ekk_hal_context_switch, .-ekk_hal_context_switch
	.global	ekk_hal_context_switch_end
ekk_hal_context_switch_end:
	.section	.text.ekk_hal_memory_barrier,"ax",@progbits
	.align 1
	.global	ekk_hal_memory_barrier
	.type	ekk_hal_memory_barrier, @function
ekk_hal_memory_barrier:
.LFB78:
	.loc 1 380 1
	mov.aa	%a14, %SP
.LCFI34:
	.loc 1 381 5
	call	__dsync
	.loc 1 382 1
	nop
	ret	#ekk_hal_memory_barrier
.LFE78:
	.size ekk_hal_memory_barrier, .-ekk_hal_memory_barrier
	.global	ekk_hal_memory_barrier_end
ekk_hal_memory_barrier_end:
	.section	.text.ekk_hal_instruction_barrier,"ax",@progbits
	.align 1
	.global	ekk_hal_instruction_barrier
	.type	ekk_hal_instruction_barrier, @function
ekk_hal_instruction_barrier:
.LFB79:
	.loc 1 385 1
	mov.aa	%a14, %SP
.LCFI35:
	.loc 1 386 5
	call	__isync
	.loc 1 387 1
	nop
	ret	#ekk_hal_instruction_barrier
.LFE79:
	.size ekk_hal_instruction_barrier, .-ekk_hal_instruction_barrier
	.global	ekk_hal_instruction_barrier_end
ekk_hal_instruction_barrier_end:
	.section	.text.ekk_hal_data_sync_barrier,"ax",@progbits
	.align 1
	.global	ekk_hal_data_sync_barrier
	.type	ekk_hal_data_sync_barrier, @function
ekk_hal_data_sync_barrier:
.LFB80:
	.loc 1 390 1
	mov.aa	%a14, %SP
.LCFI36:
	.loc 1 391 5
	call	__dsync
	.loc 1 392 5
	call	__isync
	.loc 1 393 1
	nop
	ret	#ekk_hal_data_sync_barrier
.LFE80:
	.size ekk_hal_data_sync_barrier, .-ekk_hal_data_sync_barrier
	.global	ekk_hal_data_sync_barrier_end
ekk_hal_data_sync_barrier_end:
	.section	.text.ekk_hal_idle,"ax",@progbits
	.align 1
	.global	ekk_hal_idle
	.type	ekk_hal_idle, @function
ekk_hal_idle:
.LFB81:
	.loc 1 400 1
	mov.aa	%a14, %SP
.LCFI37:
	.loc 1 401 5
	call	cpu_idle
	.loc 1 402 1
	nop
	ret	#ekk_hal_idle
.LFE81:
	.size ekk_hal_idle, .-ekk_hal_idle
	.global	ekk_hal_idle_end
ekk_hal_idle_end:
	.section	.text.ekk_hal_sleep,"ax",@progbits
	.align 1
	.global	ekk_hal_sleep
	.type	ekk_hal_sleep, @function
ekk_hal_sleep:
.LFB82:
	.loc 1 405 1
	mov.aa	%a14, %SP
.LCFI38:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 416 5
	call	cpu_idle
	.loc 1 417 1
	nop
	ret	#ekk_hal_sleep
.LFE82:
	.size ekk_hal_sleep, .-ekk_hal_sleep
	.global	ekk_hal_sleep_end
ekk_hal_sleep_end:
	.section	.text.ekk_hal_debug_break,"ax",@progbits
	.align 1
	.global	ekk_hal_debug_break
	.type	ekk_hal_debug_break, @function
ekk_hal_debug_break:
.LFB83:
	.loc 1 424 1
	mov.aa	%a14, %SP
.LCFI39:
	.loc 1 425 5
	call	__debug
	.loc 1 426 1
	nop
	ret	#ekk_hal_debug_break
.LFE83:
	.size ekk_hal_debug_break, .-ekk_hal_debug_break
	.global	ekk_hal_debug_break_end
ekk_hal_debug_break_end:
	.section	.g_debug_buffer,"aw"
	.align 2
	.type	g_debug_buffer, @object
	.size	g_debug_buffer, 4
g_debug_buffer:
	.zero	4
	.section	.g_debug_index,"aw"
	.align 2
	.type	g_debug_index, @object
	.size	g_debug_index, 4
g_debug_index:
	.zero	4
	.section	.text.ekk_hal_debug_putc,"ax",@progbits
	.align 1
	.global	ekk_hal_debug_putc
	.type	ekk_hal_debug_putc, @function
ekk_hal_debug_putc:
.LFB84:
	.loc 1 435 1
	mov.aa	%a14, %SP
.LCFI40:
	sub.a	%SP, 8
	mov	%d2, %d4
	st.b	[%a14] -4, %d2
	.loc 1 440 24
	ld.w	%d2, [%A0] SM:g_debug_buffer
	.loc 1 440 8
	jz	%d2, .L85
	.loc 1 440 49 discriminator 1
	ld.w	%d2, [%A0] SM:g_debug_index
	.loc 1 440 32 discriminator 1
	mov	%d3, 1024
	jge.u	%d2, %d3, .L85
	.loc 1 441 23
	ld.w	%d4, [%A0] SM:g_debug_buffer
	.loc 1 441 37
	ld.w	%d2, [%A0] SM:g_debug_index
	addi	%d3, %d2, 1
	st.w	[%A0] SM:g_debug_index, %d3
	.loc 1 441 23
	mov.a	%a2, %d4
	addsc.a	%a2, %a2, %d2, 0
	.loc 1 441 41
	ld.b	%d2, [%a14] -4
	st.b	[%a2]0, %d2
.L85:
	.loc 1 445 1
	ret	#ekk_hal_debug_putc
.LFE84:
	.size ekk_hal_debug_putc, .-ekk_hal_debug_putc
	.global	ekk_hal_debug_putc_end
ekk_hal_debug_putc_end:
	.section	.text.ekk_hal_debug_puts,"ax",@progbits
	.align 1
	.global	ekk_hal_debug_puts
	.type	ekk_hal_debug_puts, @function
ekk_hal_debug_puts:
.LFB85:
	.loc 1 448 1
	mov.aa	%a14, %SP
.LCFI41:
	sub.a	%SP, 8
	st.a	[%a14] -4, %a4
	.loc 1 449 11
	j	.L89
.L90:
	.loc 1 450 30
	ld.a	%a2, [%a14] -4
	mov.d	%d2, %a2
	add	%d2, 1
	st.w	[%a14] -4, %d2
	.loc 1 450 28
	ld.b	%d2, [%a2]0
	.loc 1 450 9
	mov	%d4, %d2
	call	ekk_hal_debug_putc
.L89:
	.loc 1 449 12
	ld.a	%a2, [%a14] -4
	ld.b	%d2, [%a2]0
	jnz	%d2, .L90
	.loc 1 452 1
	nop
	nop
	ret	#ekk_hal_debug_puts
.LFE85:
	.size ekk_hal_debug_puts, .-ekk_hal_debug_puts
	.global	ekk_hal_debug_puts_end
ekk_hal_debug_puts_end:
.srodata
.LC0:
	.string	"0x"
	.section	.text.ekk_hal_debug_hex,"ax",@progbits
	.align 1
	.global	ekk_hal_debug_hex
	.type	ekk_hal_debug_hex, @function
ekk_hal_debug_hex:
.LFB86:
	.loc 1 455 1
	mov.aa	%a14, %SP
.LCFI42:
	sub.a	%SP, 16
	st.w	[%a14] -12, %d4
	.loc 1 458 5
	lea	%a4, [%A0] SM:.LC0
	call	ekk_hal_debug_puts
.LBB5:
	.loc 1 459 14
	mov	%d2, 28
	st.w	[%a14] -4, %d2
	.loc 1 459 5
	j	.L92
.L93:
	.loc 1 460 39
	ld.w	%d4, [%a14] -12
	ld.w	%d3, [%a14] -4
	rsub	%d2, %d3, 0
	sh	%d2, %d4, %d2
	.loc 1 460 45
	and	%d2, %d2, 15
	.loc 1 460 31
	lea	%a2, [%A0] SM:hex.0
	addsc.a	%a2, %a2, %d2, 0
	ld.b	%d2, [%a2]0
	.loc 1 460 9
	mov	%d4, %d2
	call	ekk_hal_debug_putc
	.loc 1 459 32 discriminator 3
	ld.w	%d2, [%a14] -4
	add	%d2, -4
	st.w	[%a14] -4, %d2
.L92:
	.loc 1 459 24 discriminator 1
	ld.w	%d2, [%a14] -4
	jgez	%d2, .L93
.LBE5:
	.loc 1 462 1
	nop
	nop
	ret	#ekk_hal_debug_hex
.LFE86:
	.size ekk_hal_debug_hex, .-ekk_hal_debug_hex
	.global	ekk_hal_debug_hex_end
ekk_hal_debug_hex_end:
	.section	.text.ekk_hal_watchdog_init,"ax",@progbits
	.align 1
	.global	ekk_hal_watchdog_init
	.type	ekk_hal_watchdog_init, @function
ekk_hal_watchdog_init:
.LFB87:
	.loc 1 469 1
	mov.aa	%a14, %SP
.LCFI43:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 483 12
	mov	%d2, 0
	.loc 1 484 1
	ret	#ekk_hal_watchdog_init
.LFE87:
	.size ekk_hal_watchdog_init, .-ekk_hal_watchdog_init
	.global	ekk_hal_watchdog_init_end
ekk_hal_watchdog_init_end:
	.section	.text.ekk_hal_watchdog_reset,"ax",@progbits
	.align 1
	.global	ekk_hal_watchdog_reset
	.type	ekk_hal_watchdog_reset, @function
ekk_hal_watchdog_reset:
.LFB88:
	.loc 1 487 1
	mov.aa	%a14, %SP
.LCFI44:
	sub.a	%SP, 16
	.loc 1 488 24
	call	ekk_hal_get_core_id
	st.w	[%a14] -8, %d2
	.loc 1 491 5
	movh.a	%a2, hi:.L99
	lea	%a2, [%a2] lo:.L99
	ld.w	%d2, [%a14] -8
	jge.u	%d2, 6, .L107
	addsc.a	%a2, %a2, %d2, 2
	ji	%a2
	.align 2
	.align 2
.L99:
	.code32
	j	.L104
	.code32
	j	.L103
	.code32
	j	.L102
	.code32
	j	.L101
	.code32
	j	.L100
	.code32
	j	.L98
.L104:
	.loc 1 492 26
	movh	%d2, 61443
	addi	%d2, %d2, 24832
	st.w	[%a14] -4, %d2
	.loc 1 492 46
	j	.L105
.L103:
	.loc 1 493 26
	movh	%d2, 61443
	addi	%d2, %d2, 24844
	st.w	[%a14] -4, %d2
	.loc 1 493 46
	j	.L105
.L102:
	.loc 1 494 26
	movh	%d2, 61443
	addi	%d2, %d2, 24856
	st.w	[%a14] -4, %d2
	.loc 1 494 46
	j	.L105
.L101:
	.loc 1 495 26
	movh	%d2, 61443
	addi	%d2, %d2, 24868
	st.w	[%a14] -4, %d2
	.loc 1 495 46
	j	.L105
.L100:
	.loc 1 496 26
	movh	%d2, 61443
	addi	%d2, %d2, 24880
	st.w	[%a14] -4, %d2
	.loc 1 496 46
	j	.L105
.L98:
	.loc 1 497 26
	movh	%d2, 61443
	addi	%d2, %d2, 24892
	st.w	[%a14] -4, %d2
	.loc 1 497 46
	nop
.L105:
	.loc 1 503 21
	ld.a	%a2, [%a14] -4
	.loc 1 503 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -12, %d2
	ret	#ekk_hal_watchdog_reset
.L107:
	.loc 1 498 18
	nop
	.loc 1 512 1
	ret	#ekk_hal_watchdog_reset
.LFE88:
	.size ekk_hal_watchdog_reset, .-ekk_hal_watchdog_reset
	.global	ekk_hal_watchdog_reset_end
ekk_hal_watchdog_reset_end:
	.section	.text.ekk_hal_watchdog_disable,"ax",@progbits
	.align 1
	.global	ekk_hal_watchdog_disable
	.type	ekk_hal_watchdog_disable, @function
ekk_hal_watchdog_disable:
.LFB89:
	.loc 1 515 1
	mov.aa	%a14, %SP
.LCFI45:
	sub.a	%SP, 8
	.loc 1 517 5
	call	cpu_endinit_unlock
	.loc 1 520 21
	movh.a	%a2, 61443
	lea	%a2, [%a2] 24836
	.loc 1 520 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -4, %d2
	.loc 1 521 10
	ld.w	%d2, [%a14] -4
	or	%d2, %d2, 8
	st.w	[%a14] -4, %d2
	.loc 1 522 5
	movh.a	%a2, 61443
	lea	%a2, [%a2] 24836
	ld.w	%d2, [%a14] -4
	st.w	[%a2]0, %d2
	.loc 1 524 5
	call	cpu_endinit_lock
	.loc 1 525 1
	nop
	ret	#ekk_hal_watchdog_disable
.LFE89:
	.size ekk_hal_watchdog_disable, .-ekk_hal_watchdog_disable
	.global	ekk_hal_watchdog_disable_end
ekk_hal_watchdog_disable_end:
	.section	.text.ekk_hal_system_reset,"ax",@progbits
	.align 1
	.global	ekk_hal_system_reset
	.type	ekk_hal_system_reset, @function
ekk_hal_system_reset:
.LFB90:
	.loc 1 532 1
	mov.aa	%a14, %SP
.LCFI46:
	.loc 1 533 5
	call	system_reset
	.loc 1 534 1
	nop
	ret	#ekk_hal_system_reset
.LFE90:
	.size ekk_hal_system_reset, .-ekk_hal_system_reset
	.global	ekk_hal_system_reset_end
ekk_hal_system_reset_end:
	.section	.text.ekk_hal_get_reset_reason,"ax",@progbits
	.align 1
	.global	ekk_hal_get_reset_reason
	.type	ekk_hal_get_reset_reason, @function
ekk_hal_get_reset_reason:
.LFB91:
	.loc 1 537 1
	mov.aa	%a14, %SP
.LCFI47:
	.loc 1 538 12
	call	get_reset_reason
	.loc 1 539 1
	ret	#ekk_hal_get_reset_reason
.LFE91:
	.size ekk_hal_get_reset_reason, .-ekk_hal_get_reset_reason
	.global	ekk_hal_get_reset_reason_end
ekk_hal_get_reset_reason_end:
	.section	.text.ekk_hal_get_stack_ptr,"ax",@progbits
	.align 1
	.global	ekk_hal_get_stack_ptr
	.type	ekk_hal_get_stack_ptr, @function
ekk_hal_get_stack_ptr:
.LFB92:
	.loc 1 546 1
	mov.aa	%a14, %SP
.LCFI48:
	sub.a	%SP, 8
	.loc 1 549 5
#APP
	# 549 "src/hal/hal_tc397xp.c" 1
	mov.a %a2, %a10
	# 0 "" 2
#NO_APP
	st.a	[%a14] -4, %a2
	.loc 1 550 12
	ld.w	%d2, [%a14] -4
	.loc 1 551 1
	mov.a	%a2, %d2
	ret	#ekk_hal_get_stack_ptr
.LFE92:
	.size ekk_hal_get_stack_ptr, .-ekk_hal_get_stack_ptr
	.global	ekk_hal_get_stack_ptr_end
ekk_hal_get_stack_ptr_end:
	.section	.text.ekk_hal_check_stack,"ax",@progbits
	.align 1
	.global	ekk_hal_check_stack
	.type	ekk_hal_check_stack, @function
ekk_hal_check_stack:
.LFB93:
	.loc 1 554 1
	mov.aa	%a14, %SP
.LCFI49:
	sub.a	%SP, 24
	st.a	[%a14] -20, %a4
	st.w	[%a14] -24, %d4
	.loc 1 555 24
	call	ekk_hal_get_stack_ptr
	st.a	[%a14] -4, %a2
	.loc 1 556 14
	ld.w	%d2, [%a14] -20
	st.w	[%a14] -8, %d2
	.loc 1 557 14
	ld.w	%d3, [%a14] -8
	ld.w	%d2, [%a14] -24
	add	%d2, %d3
	st.w	[%a14] -12, %d2
	.loc 1 561 14
	ld.w	%d2, [%a14] -4
	st.w	[%a14] -16, %d2
	.loc 1 563 21
	ld.w	%d2, [%a14] -8
	addi	%d2, %d2, 64
	.loc 1 563 8
	ld.w	%d3, [%a14] -16
	jlt.u	%d3, %d2, .L115
	.loc 1 563 26 discriminator 1
	ld.w	%d2, [%a14] -16
	ld.w	%d3, [%a14] -12
	jge.u	%d3, %d2, .L116
.L115:
	.loc 1 564 16
	mov	%d2, 0
	ret	#ekk_hal_check_stack
.L116:
	.loc 1 567 12
	mov	%d2, 1
	.loc 1 568 1
	ret	#ekk_hal_check_stack
.LFE93:
	.size ekk_hal_check_stack, .-ekk_hal_check_stack
	.global	ekk_hal_check_stack_end
ekk_hal_check_stack_end:
	.section	.text.ekk_hal_tc_get_stm,"ax",@progbits
	.align 1
	.global	ekk_hal_tc_get_stm
	.type	ekk_hal_tc_get_stm, @function
ekk_hal_tc_get_stm:
.LFB94:
	.loc 1 575 1
	mov.aa	%a14, %SP
.LCFI50:
	sub.a	%SP, 16
	st.w	[%a14] -12, %d4
	.loc 1 576 8
	ld.w	%d2, [%a14] -12
	jlt.u	%d2, 6, .L119
	.loc 1 577 16
	mov	%d2, 0
	st.w	[%a14] -12, %d2
.L119:
	.loc 1 580 25
	ld.w	%d4, [%a14] -12
	call	get_stm_base
	st.w	[%a14] -4, %d2
	.loc 1 581 12
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	ld.w	%d2, [%a2]0
	.loc 1 582 1
	ret	#ekk_hal_tc_get_stm
.LFE94:
	.size ekk_hal_tc_get_stm, .-ekk_hal_tc_get_stm
	.global	ekk_hal_tc_get_stm_end
ekk_hal_tc_get_stm_end:
	.section	.text.ekk_hal_tc_get_stm64,"ax",@progbits
	.align 1
	.global	ekk_hal_tc_get_stm64
	.type	ekk_hal_tc_get_stm64, @function
ekk_hal_tc_get_stm64:
.LFB95:
	.loc 1 585 1
	mov.aa	%a14, %SP
.LCFI51:
	sub.a	%SP, 24
	st.w	[%a14] -20, %d4
	.loc 1 586 8
	ld.w	%d2, [%a14] -20
	jlt.u	%d2, 6, .L122
	.loc 1 587 16
	mov	%d2, 0
	st.w	[%a14] -20, %d2
.L122:
	.loc 1 590 25
	ld.w	%d4, [%a14] -20
	call	get_stm_base
	st.w	[%a14] -4, %d2
.L123:
	.loc 1 594 16
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 40
	mov.a	%a2, %d2
	.loc 1 594 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -8, %d2
	.loc 1 595 16
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 16
	mov.a	%a2, %d2
	.loc 1 595 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -12, %d2
	.loc 1 596 22 discriminator 1
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 40
	mov.a	%a2, %d2
	ld.w	%d2, [%a2]0
	.loc 1 596 19 discriminator 1
	ld.w	%d3, [%a14] -8
	jne	%d3, %d2, .L123
	.loc 1 598 13
	ld.w	%d2, [%a14] -8
	mov	%d2, %d2
	mov	%d3, 0
	.loc 1 598 28
	mov	%d9, %d2
	mov	%d8, 0
	.loc 1 598 35
	ld.w	%d2, [%a14] -12
	mov	%d2, %d2
	mov	%d3, 0
	or	%d10, %d8, %d2
	or	%d11, %d9, %d3
	.loc 1 598 35 is_stmt 0 discriminator 1
	mov.a	%a2, %d10
	mov.a	%a3, %d11
	.loc 1 599 1 is_stmt 1
	mov.d	%d2, %a2
	mov.d	%d3, %a3
	ret	#ekk_hal_tc_get_stm64
.LFE95:
	.size ekk_hal_tc_get_stm64, .-ekk_hal_tc_get_stm64
	.global	ekk_hal_tc_get_stm64_end
ekk_hal_tc_get_stm64_end:
	.section	.text.ekk_hal_tc_stm_compare,"ax",@progbits
	.align 1
	.global	ekk_hal_tc_stm_compare
	.type	ekk_hal_tc_stm_compare, @function
ekk_hal_tc_stm_compare:
.LFB96:
	.loc 1 603 1
	mov.aa	%a14, %SP
.LCFI52:
	sub.a	%SP, 32
	st.w	[%a14] -20, %d4
	st.w	[%a14] -24, %d5
	st.w	[%a14] -28, %d6
	st.a	[%a14] -32, %a4
	.loc 1 604 8
	ld.w	%d2, [%a14] -20
	jge.u	%d2, 6, .L126
	.loc 1 604 33 discriminator 1
	ld.w	%d2, [%a14] -24
	jlt.u	%d2, 2, .L127
.L126:
	.loc 1 605 16
	mov	%d2, -1
	ret	#ekk_hal_tc_stm_compare
.L127:
	.loc 1 608 25
	ld.w	%d4, [%a14] -20
	call	get_stm_base
	st.w	[%a14] -4, %d2
	.loc 1 611 49
	ld.w	%d2, [%a14] -24
	jnz	%d2, .L129
	.loc 1 611 49 is_stmt 0 discriminator 1
	mov	%d2, 48
	j	.L130
.L129:
	.loc 1 611 49 discriminator 2
	mov	%d2, 52
.L130:
	.loc 1 611 14 is_stmt 1 discriminator 4
	st.w	[%a14] -8, %d2
	.loc 1 612 5
	ld.w	%d3, [%a14] -4
	ld.w	%d2, [%a14] -8
	add	%d2, %d3
	mov.a	%a2, %d2
	ld.w	%d2, [%a14] -28
	st.w	[%a2]0, %d2
	.loc 1 615 38
	ld.w	%d2, [%a14] -20
	sh	%d2, 1
	.loc 1 615 14
	ld.w	%d3, [%a14] -24
	add	%d2, %d3
	st.w	[%a14] -12, %d2
	.loc 1 616 5
	ld.a	%a4, [%a14] -32
	ld.w	%d6, [%a14] -20
	mov	%d5, 50
	ld.w	%d4, [%a14] -12
	call	irq_register
	.loc 1 619 20
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 60
	mov.a	%a2, %d2
	.loc 1 619 14
	ld.w	%d2, [%a2]0
	st.w	[%a14] -16, %d2
	.loc 1 620 43
	ld.w	%d2, [%a14] -24
	jnz	%d2, .L131
	.loc 1 620 43 is_stmt 0 discriminator 1
	mov	%d2, 1
	j	.L132
.L131:
	.loc 1 620 43 discriminator 2
	mov	%d2, 16
.L132:
	.loc 1 620 9 is_stmt 1 discriminator 4
	ld.w	%d3, [%a14] -16
	or	%d2, %d3
	st.w	[%a14] -16, %d2
	.loc 1 621 5
	ld.w	%d2, [%a14] -4
	addi	%d2, %d2, 60
	mov.a	%a2, %d2
	ld.w	%d2, [%a14] -16
	st.w	[%a2]0, %d2
	.loc 1 623 12
	mov	%d2, 0
	.loc 1 624 1
	ret	#ekk_hal_tc_stm_compare
.LFE96:
	.size ekk_hal_tc_stm_compare, .-ekk_hal_tc_stm_compare
	.global	ekk_hal_tc_stm_compare_end
ekk_hal_tc_stm_compare_end:
	.section	.hex.0,"a"
	.type	hex.0, @object
	.size	hex.0, 17
hex.0:
	.string	"0123456789ABCDEF"
	.section	.debug_frame,"",@progbits
.Lframe0:
	.uaword	.LECIE0-.LSCIE0
.LSCIE0:
	.uaword	0xffffffff
	.byte	0x3
	.string	""
	.uleb128 0x1
	.sleb128 1
	.uleb128 0x1b
	.byte	0xc
	.uleb128 0x1a
	.uleb128 0
	.align 2
.LECIE0:
.LSFDE0:
	.uaword	.LEFDE0-.LASFDE0
.LASFDE0:
	.uaword	.Lframe0
	.uaword	.LFB0
	.uaword	.LFE0-.LFB0
	.byte	0x4
	.uaword	.LCFI0-.LFB0
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE0:
.LSFDE2:
	.uaword	.LEFDE2-.LASFDE2
.LASFDE2:
	.uaword	.Lframe0
	.uaword	.LFB1
	.uaword	.LFE1-.LFB1
	.byte	0x4
	.uaword	.LCFI1-.LFB1
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE2:
.LSFDE4:
	.uaword	.LEFDE4-.LASFDE4
.LASFDE4:
	.uaword	.Lframe0
	.uaword	.LFB4
	.uaword	.LFE4-.LFB4
	.byte	0x4
	.uaword	.LCFI2-.LFB4
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE4:
.LSFDE6:
	.uaword	.LEFDE6-.LASFDE6
.LASFDE6:
	.uaword	.Lframe0
	.uaword	.LFB5
	.uaword	.LFE5-.LFB5
	.byte	0x4
	.uaword	.LCFI3-.LFB5
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE6:
.LSFDE8:
	.uaword	.LEFDE8-.LASFDE8
.LASFDE8:
	.uaword	.Lframe0
	.uaword	.LFB7
	.uaword	.LFE7-.LFB7
	.byte	0x4
	.uaword	.LCFI4-.LFB7
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE8:
.LSFDE10:
	.uaword	.LEFDE10-.LASFDE10
.LASFDE10:
	.uaword	.Lframe0
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.byte	0x4
	.uaword	.LCFI5-.LFB8
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE10:
.LSFDE12:
	.uaword	.LEFDE12-.LASFDE12
.LASFDE12:
	.uaword	.Lframe0
	.uaword	.LFB23
	.uaword	.LFE23-.LFB23
	.byte	0x4
	.uaword	.LCFI6-.LFB23
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE12:
.LSFDE14:
	.uaword	.LEFDE14-.LASFDE14
.LASFDE14:
	.uaword	.Lframe0
	.uaword	.LFB36
	.uaword	.LFE36-.LFB36
	.byte	0x4
	.uaword	.LCFI7-.LFB36
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE14:
.LSFDE16:
	.uaword	.LEFDE16-.LASFDE16
.LASFDE16:
	.uaword	.Lframe0
	.uaword	.LFB42
	.uaword	.LFE42-.LFB42
	.byte	0x4
	.uaword	.LCFI8-.LFB42
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE16:
.LSFDE18:
	.uaword	.LEFDE18-.LASFDE18
.LASFDE18:
	.uaword	.Lframe0
	.uaword	.LFB53
	.uaword	.LFE53-.LFB53
	.byte	0x4
	.uaword	.LCFI9-.LFB53
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE18:
.LSFDE20:
	.uaword	.LEFDE20-.LASFDE20
.LASFDE20:
	.uaword	.Lframe0
	.uaword	.LFB54
	.uaword	.LFE54-.LFB54
	.byte	0x4
	.uaword	.LCFI10-.LFB54
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE20:
.LSFDE22:
	.uaword	.LEFDE22-.LASFDE22
.LASFDE22:
	.uaword	.Lframe0
	.uaword	.LFB55
	.uaword	.LFE55-.LFB55
	.byte	0x4
	.uaword	.LCFI11-.LFB55
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE22:
.LSFDE24:
	.uaword	.LEFDE24-.LASFDE24
.LASFDE24:
	.uaword	.Lframe0
	.uaword	.LFB56
	.uaword	.LFE56-.LFB56
	.byte	0x4
	.uaword	.LCFI12-.LFB56
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE24:
.LSFDE26:
	.uaword	.LEFDE26-.LASFDE26
.LASFDE26:
	.uaword	.Lframe0
	.uaword	.LFB57
	.uaword	.LFE57-.LFB57
	.byte	0x4
	.uaword	.LCFI13-.LFB57
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE26:
.LSFDE28:
	.uaword	.LEFDE28-.LASFDE28
.LASFDE28:
	.uaword	.Lframe0
	.uaword	.LFB58
	.uaword	.LFE58-.LFB58
	.byte	0x4
	.uaword	.LCFI14-.LFB58
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE28:
.LSFDE30:
	.uaword	.LEFDE30-.LASFDE30
.LASFDE30:
	.uaword	.Lframe0
	.uaword	.LFB59
	.uaword	.LFE59-.LFB59
	.byte	0x4
	.uaword	.LCFI15-.LFB59
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE30:
.LSFDE32:
	.uaword	.LEFDE32-.LASFDE32
.LASFDE32:
	.uaword	.Lframe0
	.uaword	.LFB60
	.uaword	.LFE60-.LFB60
	.byte	0x4
	.uaword	.LCFI16-.LFB60
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE32:
.LSFDE34:
	.uaword	.LEFDE34-.LASFDE34
.LASFDE34:
	.uaword	.Lframe0
	.uaword	.LFB61
	.uaword	.LFE61-.LFB61
	.byte	0x4
	.uaword	.LCFI17-.LFB61
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE34:
.LSFDE36:
	.uaword	.LEFDE36-.LASFDE36
.LASFDE36:
	.uaword	.Lframe0
	.uaword	.LFB62
	.uaword	.LFE62-.LFB62
	.byte	0x4
	.uaword	.LCFI18-.LFB62
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE36:
.LSFDE38:
	.uaword	.LEFDE38-.LASFDE38
.LASFDE38:
	.uaword	.Lframe0
	.uaword	.LFB63
	.uaword	.LFE63-.LFB63
	.byte	0x4
	.uaword	.LCFI19-.LFB63
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE38:
.LSFDE40:
	.uaword	.LEFDE40-.LASFDE40
.LASFDE40:
	.uaword	.Lframe0
	.uaword	.LFB64
	.uaword	.LFE64-.LFB64
	.byte	0x4
	.uaword	.LCFI20-.LFB64
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE40:
.LSFDE42:
	.uaword	.LEFDE42-.LASFDE42
.LASFDE42:
	.uaword	.Lframe0
	.uaword	.LFB65
	.uaword	.LFE65-.LFB65
	.byte	0x4
	.uaword	.LCFI21-.LFB65
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE42:
.LSFDE44:
	.uaword	.LEFDE44-.LASFDE44
.LASFDE44:
	.uaword	.Lframe0
	.uaword	.LFB66
	.uaword	.LFE66-.LFB66
	.byte	0x4
	.uaword	.LCFI22-.LFB66
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE44:
.LSFDE46:
	.uaword	.LEFDE46-.LASFDE46
.LASFDE46:
	.uaword	.Lframe0
	.uaword	.LFB67
	.uaword	.LFE67-.LFB67
	.byte	0x4
	.uaword	.LCFI23-.LFB67
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE46:
.LSFDE48:
	.uaword	.LEFDE48-.LASFDE48
.LASFDE48:
	.uaword	.Lframe0
	.uaword	.LFB68
	.uaword	.LFE68-.LFB68
	.byte	0x4
	.uaword	.LCFI24-.LFB68
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE48:
.LSFDE50:
	.uaword	.LEFDE50-.LASFDE50
.LASFDE50:
	.uaword	.Lframe0
	.uaword	.LFB69
	.uaword	.LFE69-.LFB69
	.byte	0x4
	.uaword	.LCFI25-.LFB69
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE50:
.LSFDE52:
	.uaword	.LEFDE52-.LASFDE52
.LASFDE52:
	.uaword	.Lframe0
	.uaword	.LFB70
	.uaword	.LFE70-.LFB70
	.byte	0x4
	.uaword	.LCFI26-.LFB70
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE52:
.LSFDE54:
	.uaword	.LEFDE54-.LASFDE54
.LASFDE54:
	.uaword	.Lframe0
	.uaword	.LFB71
	.uaword	.LFE71-.LFB71
	.byte	0x4
	.uaword	.LCFI27-.LFB71
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE54:
.LSFDE56:
	.uaword	.LEFDE56-.LASFDE56
.LASFDE56:
	.uaword	.Lframe0
	.uaword	.LFB72
	.uaword	.LFE72-.LFB72
	.byte	0x4
	.uaword	.LCFI28-.LFB72
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE56:
.LSFDE58:
	.uaword	.LEFDE58-.LASFDE58
.LASFDE58:
	.uaword	.Lframe0
	.uaword	.LFB73
	.uaword	.LFE73-.LFB73
	.byte	0x4
	.uaword	.LCFI29-.LFB73
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE58:
.LSFDE60:
	.uaword	.LEFDE60-.LASFDE60
.LASFDE60:
	.uaword	.Lframe0
	.uaword	.LFB74
	.uaword	.LFE74-.LFB74
	.byte	0x4
	.uaword	.LCFI30-.LFB74
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE60:
.LSFDE62:
	.uaword	.LEFDE62-.LASFDE62
.LASFDE62:
	.uaword	.Lframe0
	.uaword	.LFB75
	.uaword	.LFE75-.LFB75
	.byte	0x4
	.uaword	.LCFI31-.LFB75
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE62:
.LSFDE64:
	.uaword	.LEFDE64-.LASFDE64
.LASFDE64:
	.uaword	.Lframe0
	.uaword	.LFB76
	.uaword	.LFE76-.LFB76
	.byte	0x4
	.uaword	.LCFI32-.LFB76
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE64:
.LSFDE66:
	.uaword	.LEFDE66-.LASFDE66
.LASFDE66:
	.uaword	.Lframe0
	.uaword	.LFB77
	.uaword	.LFE77-.LFB77
	.byte	0x4
	.uaword	.LCFI33-.LFB77
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE66:
.LSFDE68:
	.uaword	.LEFDE68-.LASFDE68
.LASFDE68:
	.uaword	.Lframe0
	.uaword	.LFB78
	.uaword	.LFE78-.LFB78
	.byte	0x4
	.uaword	.LCFI34-.LFB78
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE68:
.LSFDE70:
	.uaword	.LEFDE70-.LASFDE70
.LASFDE70:
	.uaword	.Lframe0
	.uaword	.LFB79
	.uaword	.LFE79-.LFB79
	.byte	0x4
	.uaword	.LCFI35-.LFB79
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE70:
.LSFDE72:
	.uaword	.LEFDE72-.LASFDE72
.LASFDE72:
	.uaword	.Lframe0
	.uaword	.LFB80
	.uaword	.LFE80-.LFB80
	.byte	0x4
	.uaword	.LCFI36-.LFB80
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE72:
.LSFDE74:
	.uaword	.LEFDE74-.LASFDE74
.LASFDE74:
	.uaword	.Lframe0
	.uaword	.LFB81
	.uaword	.LFE81-.LFB81
	.byte	0x4
	.uaword	.LCFI37-.LFB81
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE74:
.LSFDE76:
	.uaword	.LEFDE76-.LASFDE76
.LASFDE76:
	.uaword	.Lframe0
	.uaword	.LFB82
	.uaword	.LFE82-.LFB82
	.byte	0x4
	.uaword	.LCFI38-.LFB82
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE76:
.LSFDE78:
	.uaword	.LEFDE78-.LASFDE78
.LASFDE78:
	.uaword	.Lframe0
	.uaword	.LFB83
	.uaword	.LFE83-.LFB83
	.byte	0x4
	.uaword	.LCFI39-.LFB83
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE78:
.LSFDE80:
	.uaword	.LEFDE80-.LASFDE80
.LASFDE80:
	.uaword	.Lframe0
	.uaword	.LFB84
	.uaword	.LFE84-.LFB84
	.byte	0x4
	.uaword	.LCFI40-.LFB84
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE80:
.LSFDE82:
	.uaword	.LEFDE82-.LASFDE82
.LASFDE82:
	.uaword	.Lframe0
	.uaword	.LFB85
	.uaword	.LFE85-.LFB85
	.byte	0x4
	.uaword	.LCFI41-.LFB85
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE82:
.LSFDE84:
	.uaword	.LEFDE84-.LASFDE84
.LASFDE84:
	.uaword	.Lframe0
	.uaword	.LFB86
	.uaword	.LFE86-.LFB86
	.byte	0x4
	.uaword	.LCFI42-.LFB86
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE84:
.LSFDE86:
	.uaword	.LEFDE86-.LASFDE86
.LASFDE86:
	.uaword	.Lframe0
	.uaword	.LFB87
	.uaword	.LFE87-.LFB87
	.byte	0x4
	.uaword	.LCFI43-.LFB87
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE86:
.LSFDE88:
	.uaword	.LEFDE88-.LASFDE88
.LASFDE88:
	.uaword	.Lframe0
	.uaword	.LFB88
	.uaword	.LFE88-.LFB88
	.byte	0x4
	.uaword	.LCFI44-.LFB88
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE88:
.LSFDE90:
	.uaword	.LEFDE90-.LASFDE90
.LASFDE90:
	.uaword	.Lframe0
	.uaword	.LFB89
	.uaword	.LFE89-.LFB89
	.byte	0x4
	.uaword	.LCFI45-.LFB89
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE90:
.LSFDE92:
	.uaword	.LEFDE92-.LASFDE92
.LASFDE92:
	.uaword	.Lframe0
	.uaword	.LFB90
	.uaword	.LFE90-.LFB90
	.byte	0x4
	.uaword	.LCFI46-.LFB90
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE92:
.LSFDE94:
	.uaword	.LEFDE94-.LASFDE94
.LASFDE94:
	.uaword	.Lframe0
	.uaword	.LFB91
	.uaword	.LFE91-.LFB91
	.byte	0x4
	.uaword	.LCFI47-.LFB91
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE94:
.LSFDE96:
	.uaword	.LEFDE96-.LASFDE96
.LASFDE96:
	.uaword	.Lframe0
	.uaword	.LFB92
	.uaword	.LFE92-.LFB92
	.byte	0x4
	.uaword	.LCFI48-.LFB92
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE96:
.LSFDE98:
	.uaword	.LEFDE98-.LASFDE98
.LASFDE98:
	.uaword	.Lframe0
	.uaword	.LFB93
	.uaword	.LFE93-.LFB93
	.byte	0x4
	.uaword	.LCFI49-.LFB93
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE98:
.LSFDE100:
	.uaword	.LEFDE100-.LASFDE100
.LASFDE100:
	.uaword	.Lframe0
	.uaword	.LFB94
	.uaword	.LFE94-.LFB94
	.byte	0x4
	.uaword	.LCFI50-.LFB94
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE100:
.LSFDE102:
	.uaword	.LEFDE102-.LASFDE102
.LASFDE102:
	.uaword	.Lframe0
	.uaword	.LFB95
	.uaword	.LFE95-.LFB95
	.byte	0x4
	.uaword	.LCFI51-.LFB95
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE102:
.LSFDE104:
	.uaword	.LEFDE104-.LASFDE104
.LASFDE104:
	.uaword	.Lframe0
	.uaword	.LFB96
	.uaword	.LFE96-.LFB96
	.byte	0x4
	.uaword	.LCFI52-.LFB96
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE104:
.section .text,"ax",@progbits
.Letext0:
	.file 4 "C:/tricore-gcc/tricore-elf/include/machine/_default_types.h"
	.file 5 "C:/tricore-gcc/tricore-elf/include/sys/_stdint.h"
	.file 6 "../ek-kor/include/ek-kor/hal.h"
	.file 7 "./src/arch/tricore_irq.h"
	.file 8 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stddef.h"
	.file 9 "./src/arch/tricore_csa.h"
	.file 10 "C:/tricore-gcc/tricore-elf/include/string.h"
	.section	.debug_info,"",@progbits
.Ldebug_info0:
	.uaword	0x1329
	.uahalf	0x4
	.uaword	.Ldebug_abbrev0
	.byte	0x4
	.uleb128 0x1
	.string	"GNU C17 13.4.0 -mtc162 -mcpu=tc39xx -msmall-data=0 -msmall-const=0 -g3 -gdwarf-4 -O0 -ffunction-sections -fdata-sections -fno-common -fno-section-anchors -fno-merge-constants"
	.byte	0xc
	.string	"src/hal/hal_tc397xp.c"
	.string	"D:\\work\\autobusi-punjaci\\pre-hw-dev-tricore"
	.uaword	.Ldebug_ranges0+0
	.uaword	0
	.uaword	.Ldebug_line0
	.uaword	.Ldebug_macro0
	.uleb128 0x2
	.byte	0x1
	.byte	0x6
	.string	"signed char"
	.uleb128 0x3
	.string	"__uint8_t"
	.byte	0x4
	.byte	0x2b
	.byte	0x18
	.uaword	0x12f
	.uleb128 0x2
	.byte	0x1
	.byte	0x8
	.string	"unsigned char"
	.uleb128 0x2
	.byte	0x2
	.byte	0x5
	.string	"short int"
	.uleb128 0x2
	.byte	0x2
	.byte	0x7
	.string	"short unsigned int"
	.uleb128 0x2
	.byte	0x4
	.byte	0x5
	.string	"long int"
	.uleb128 0x3
	.string	"__uint32_t"
	.byte	0x4
	.byte	0x4f
	.byte	0x19
	.uaword	0x182
	.uleb128 0x2
	.byte	0x4
	.byte	0x7
	.string	"long unsigned int"
	.uleb128 0x2
	.byte	0x8
	.byte	0x5
	.string	"long long int"
	.uleb128 0x3
	.string	"__uint64_t"
	.byte	0x4
	.byte	0x69
	.byte	0x19
	.uaword	0x1bb
	.uleb128 0x2
	.byte	0x8
	.byte	0x7
	.string	"long long unsigned int"
	.uleb128 0x3
	.string	"uint8_t"
	.byte	0x5
	.byte	0x18
	.byte	0x13
	.uaword	0x11d
	.uleb128 0x3
	.string	"uint32_t"
	.byte	0x5
	.byte	0x30
	.byte	0x14
	.uaword	0x16f
	.uleb128 0x4
	.uaword	0x1e5
	.uleb128 0x3
	.string	"uint64_t"
	.byte	0x5
	.byte	0x3c
	.byte	0x14
	.uaword	0x1a8
	.uleb128 0x2
	.byte	0x4
	.byte	0x5
	.string	"int"
	.uleb128 0x2
	.byte	0x4
	.byte	0x7
	.string	"unsigned int"
	.uleb128 0x3
	.string	"ekk_hal_systick_cb_t"
	.byte	0x6
	.byte	0x9a
	.byte	0x10
	.uaword	0x240
	.uleb128 0x5
	.byte	0x4
	.uaword	0x246
	.uleb128 0x6
	.uleb128 0x2
	.byte	0x1
	.byte	0x2
	.string	"_Bool"
	.uleb128 0x7
	.byte	0x4
	.uleb128 0x8
	.byte	0x7
	.byte	0x4
	.uaword	0x213
	.byte	0x7
	.byte	0x29
	.byte	0xe
	.uaword	0x2c9
	.uleb128 0x9
	.string	"IRQ_TOS_CPU0"
	.byte	0
	.uleb128 0x9
	.string	"IRQ_TOS_CPU1"
	.byte	0x1
	.uleb128 0x9
	.string	"IRQ_TOS_CPU2"
	.byte	0x2
	.uleb128 0x9
	.string	"IRQ_TOS_CPU3"
	.byte	0x3
	.uleb128 0x9
	.string	"IRQ_TOS_DMA"
	.byte	0x3
	.uleb128 0x9
	.string	"IRQ_TOS_CPU4"
	.byte	0x4
	.uleb128 0x9
	.string	"IRQ_TOS_CPU5"
	.byte	0x5
	.byte	0
	.uleb128 0x3
	.string	"irq_tos_t"
	.byte	0x7
	.byte	0x31
	.byte	0x3
	.uaword	0x252
	.uleb128 0x3
	.string	"irq_handler_t"
	.byte	0x7
	.byte	0x36
	.byte	0x10
	.uaword	0x240
	.uleb128 0x3
	.string	"size_t"
	.byte	0x8
	.byte	0xd6
	.byte	0x17
	.uaword	0x182
	.uleb128 0x2
	.byte	0x8
	.byte	0x4
	.string	"long double"
	.uleb128 0x2
	.byte	0x1
	.byte	0x6
	.string	"char"
	.uleb128 0xa
	.uaword	0x30f
	.uleb128 0x4
	.uaword	0x30f
	.uleb128 0x5
	.byte	0x4
	.uaword	0x317
	.uleb128 0xb
	.uaword	0x1f6
	.uaword	0x337
	.uleb128 0xc
	.uaword	0x182
	.byte	0x5
	.byte	0
	.uleb128 0x4
	.uaword	0x327
	.uleb128 0xd
	.string	"g_critical_nesting"
	.byte	0x1
	.byte	0x23
	.byte	0x1a
	.uaword	0x337
	.uleb128 0x5
	.byte	0x3
	.uaword	g_critical_nesting
	.uleb128 0xd
	.string	"g_tick_count"
	.byte	0x1
	.byte	0x26
	.byte	0x1a
	.uaword	0x337
	.uleb128 0x5
	.byte	0x3
	.uaword	g_tick_count
	.uleb128 0xb
	.uaword	0x223
	.uaword	0x388
	.uleb128 0xc
	.uaword	0x182
	.byte	0x5
	.byte	0
	.uleb128 0xd
	.string	"g_systick_callbacks"
	.byte	0x1
	.byte	0x29
	.byte	0x1d
	.uaword	0x378
	.uleb128 0x5
	.byte	0x3
	.uaword	g_systick_callbacks
	.uleb128 0xd
	.string	"g_stm_clock_hz"
	.byte	0x1
	.byte	0x2c
	.byte	0x11
	.uaword	0x1e5
	.uleb128 0x5
	.byte	0x3
	.uaword	g_stm_clock_hz
	.uleb128 0xe
	.string	"g_debug_buffer"
	.byte	0x1
	.uahalf	0x1af
	.byte	0x17
	.uaword	0x3e5
	.uleb128 0x5
	.byte	0x3
	.uaword	g_debug_buffer
	.uleb128 0x5
	.byte	0x4
	.uaword	0x31c
	.uleb128 0xe
	.string	"g_debug_index"
	.byte	0x1
	.uahalf	0x1b0
	.byte	0x1a
	.uaword	0x1f6
	.uleb128 0x5
	.byte	0x3
	.uaword	g_debug_index
	.uleb128 0xf
	.string	"get_reset_reason"
	.byte	0x1
	.byte	0x1c
	.byte	0x11
	.uaword	0x1e5
	.uleb128 0x10
	.string	"system_reset"
	.byte	0x1
	.byte	0x1b
	.byte	0xd
	.uleb128 0x10
	.string	"cpu_endinit_lock"
	.byte	0x3
	.byte	0xed
	.byte	0x6
	.uleb128 0x10
	.string	"cpu_endinit_unlock"
	.byte	0x3
	.byte	0xe7
	.byte	0x6
	.uleb128 0x10
	.string	"cpu_idle"
	.byte	0x3
	.byte	0xd3
	.byte	0x6
	.uleb128 0x11
	.string	"_context_switch_asm"
	.byte	0x1
	.uahalf	0x145
	.byte	0xd
	.uaword	0x493
	.uleb128 0x12
	.uaword	0x493
	.uleb128 0x12
	.uaword	0x1e5
	.byte	0
	.uleb128 0x5
	.byte	0x4
	.uaword	0x1e5
	.uleb128 0x11
	.string	"_start_first_task"
	.byte	0x1
	.uahalf	0x146
	.byte	0xd
	.uaword	0x4ba
	.uleb128 0x12
	.uaword	0x1e5
	.byte	0
	.uleb128 0x13
	.string	"csa_create_task_context"
	.byte	0x9
	.byte	0x92
	.byte	0xa
	.uaword	0x1e5
	.uaword	0x4ee
	.uleb128 0x12
	.uaword	0x1e5
	.uleb128 0x12
	.uaword	0x4ee
	.uleb128 0x12
	.uaword	0x250
	.byte	0
	.uleb128 0x5
	.byte	0x4
	.uaword	0x4f4
	.uleb128 0x14
	.uaword	0x4ff
	.uleb128 0x12
	.uaword	0x250
	.byte	0
	.uleb128 0x13
	.string	"irq_register"
	.byte	0x7
	.byte	0x7e
	.byte	0x5
	.uaword	0x20c
	.uaword	0x52d
	.uleb128 0x12
	.uaword	0x1e5
	.uleb128 0x12
	.uaword	0x1d5
	.uleb128 0x12
	.uaword	0x2c9
	.uleb128 0x12
	.uaword	0x2db
	.byte	0
	.uleb128 0x13
	.string	"memset"
	.byte	0xa
	.byte	0x21
	.byte	0x9
	.uaword	0x250
	.uaword	0x550
	.uleb128 0x12
	.uaword	0x250
	.uleb128 0x12
	.uaword	0x20c
	.uleb128 0x12
	.uaword	0x2f1
	.byte	0
	.uleb128 0xf
	.string	"get_stm_clock"
	.byte	0x1
	.byte	0x1a
	.byte	0x11
	.uaword	0x1e5
	.uleb128 0x15
	.string	"ekk_hal_tc_stm_compare"
	.byte	0x1
	.uahalf	0x259
	.byte	0x5
	.uaword	0x20c
	.uaword	.LFB96
	.uaword	.LFE96-.LFB96
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x622
	.uleb128 0x16
	.uaword	.LASF0
	.byte	0x1
	.uahalf	0x259
	.byte	0x25
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0x17
	.string	"cmp_id"
	.byte	0x1
	.uahalf	0x259
	.byte	0x36
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -24
	.uleb128 0x17
	.string	"value"
	.byte	0x1
	.uahalf	0x25a
	.byte	0x25
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -28
	.uleb128 0x16
	.uaword	.LASF1
	.byte	0x1
	.uahalf	0x25a
	.byte	0x33
	.uaword	0x240
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -32
	.uleb128 0x18
	.uaword	.LASF2
	.byte	0x1
	.uahalf	0x260
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"cmp_reg"
	.byte	0x1
	.uahalf	0x263
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"irq_num"
	.byte	0x1
	.uahalf	0x267
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"icr"
	.byte	0x1
	.uahalf	0x26b
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.byte	0
	.uleb128 0x15
	.string	"ekk_hal_tc_get_stm64"
	.byte	0x1
	.uahalf	0x248
	.byte	0xa
	.uaword	0x1fb
	.uaword	.LFB95
	.uaword	.LFE95-.LFB95
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x691
	.uleb128 0x16
	.uaword	.LASF0
	.byte	0x1
	.uahalf	0x248
	.byte	0x28
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0x18
	.uaword	.LASF2
	.byte	0x1
	.uahalf	0x24e
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"tim0"
	.byte	0x1
	.uahalf	0x250
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"tim6"
	.byte	0x1
	.uahalf	0x250
	.byte	0x14
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x15
	.string	"ekk_hal_tc_get_stm"
	.byte	0x1
	.uahalf	0x23e
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB94
	.uaword	.LFE94-.LFB94
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x6dc
	.uleb128 0x16
	.uaword	.LASF0
	.byte	0x1
	.uahalf	0x23e
	.byte	0x26
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x18
	.uaword	.LASF2
	.byte	0x1
	.uahalf	0x244
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x15
	.string	"ekk_hal_check_stack"
	.byte	0x1
	.uahalf	0x229
	.byte	0x6
	.uaword	0x247
	.uaword	.LFB93
	.uaword	.LFE93-.LFB93
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x77a
	.uleb128 0x17
	.string	"stack_bottom"
	.byte	0x1
	.uahalf	0x229
	.byte	0x20
	.uaword	0x250
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0x17
	.string	"stack_size"
	.byte	0x1
	.uahalf	0x229
	.byte	0x37
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -24
	.uleb128 0x18
	.uaword	.LASF3
	.byte	0x1
	.uahalf	0x22b
	.byte	0xb
	.uaword	0x250
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"bottom"
	.byte	0x1
	.uahalf	0x22c
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"top"
	.byte	0x1
	.uahalf	0x22d
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"sp"
	.byte	0x1
	.uahalf	0x231
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.byte	0
	.uleb128 0x19
	.string	"ekk_hal_get_stack_ptr"
	.byte	0x1
	.uahalf	0x221
	.byte	0x7
	.uaword	0x250
	.uaword	.LFB92
	.uaword	.LFE92-.LFB92
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x7b7
	.uleb128 0xe
	.string	"sp"
	.byte	0x1
	.uahalf	0x224
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1a
	.string	"ekk_hal_get_reset_reason"
	.byte	0x1
	.uahalf	0x218
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB91
	.uaword	.LFE91-.LFB91
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1b
	.string	"ekk_hal_system_reset"
	.byte	0x1
	.uahalf	0x213
	.byte	0x6
	.uaword	.LFB90
	.uaword	.LFE90-.LFB90
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1c
	.string	"ekk_hal_watchdog_disable"
	.byte	0x1
	.uahalf	0x202
	.byte	0x6
	.uaword	.LFB89
	.uaword	.LFE89-.LFB89
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x845
	.uleb128 0xe
	.string	"con1"
	.byte	0x1
	.uahalf	0x208
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1c
	.string	"ekk_hal_watchdog_reset"
	.byte	0x1
	.uahalf	0x1e6
	.byte	0x6
	.uaword	.LFB88
	.uaword	.LFE88-.LFB88
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x8a6
	.uleb128 0x18
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x1e8
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"wdt_base"
	.byte	0x1
	.uahalf	0x1e9
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"con0"
	.byte	0x1
	.uahalf	0x1f7
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.byte	0
	.uleb128 0x19
	.string	"ekk_hal_watchdog_init"
	.byte	0x1
	.uahalf	0x1d4
	.byte	0x5
	.uaword	0x20c
	.uaword	.LFB87
	.uaword	.LFE87-.LFB87
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x8eb
	.uleb128 0x17
	.string	"timeout_ms"
	.byte	0x1
	.uahalf	0x1d4
	.byte	0x24
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1c
	.string	"ekk_hal_debug_hex"
	.byte	0x1
	.uahalf	0x1c6
	.byte	0x6
	.uaword	.LFB86
	.uaword	.LFE86-.LFB86
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x94e
	.uleb128 0x17
	.string	"value"
	.byte	0x1
	.uahalf	0x1c6
	.byte	0x21
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"hex"
	.byte	0x1
	.uahalf	0x1c8
	.byte	0x17
	.uaword	0x95e
	.uleb128 0x5
	.byte	0x3
	.uaword	hex.0
	.uleb128 0x1d
	.uaword	.LBB5
	.uaword	.LBE5-.LBB5
	.uleb128 0xe
	.string	"i"
	.byte	0x1
	.uahalf	0x1cb
	.byte	0xe
	.uaword	0x20c
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0xb
	.uaword	0x317
	.uaword	0x95e
	.uleb128 0xc
	.uaword	0x182
	.byte	0x10
	.byte	0
	.uleb128 0xa
	.uaword	0x94e
	.uleb128 0x1c
	.string	"ekk_hal_debug_puts"
	.byte	0x1
	.uahalf	0x1bf
	.byte	0x6
	.uaword	.LFB85
	.uaword	.LFE85-.LFB85
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x998
	.uleb128 0x17
	.string	"s"
	.byte	0x1
	.uahalf	0x1bf
	.byte	0x25
	.uaword	0x321
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1e
	.string	"ekk_hal_debug_putc"
	.byte	0x1
	.uahalf	0x1b2
	.byte	0x6
	.uaword	.LFB84
	.uaword	.LFE84-.LFB84
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x9cd
	.uleb128 0x17
	.string	"c"
	.byte	0x1
	.uahalf	0x1b2
	.byte	0x1e
	.uaword	0x30f
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1b
	.string	"ekk_hal_debug_break"
	.byte	0x1
	.uahalf	0x1a7
	.byte	0x6
	.uaword	.LFB83
	.uaword	.LFE83-.LFB83
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1c
	.string	"ekk_hal_sleep"
	.byte	0x1
	.uahalf	0x194
	.byte	0x6
	.uaword	.LFB82
	.uaword	.LFE82-.LFB82
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xa23
	.uleb128 0x17
	.string	"mode"
	.byte	0x1
	.uahalf	0x194
	.byte	0x1d
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1b
	.string	"ekk_hal_idle"
	.byte	0x1
	.uahalf	0x18f
	.byte	0x6
	.uaword	.LFB81
	.uaword	.LFE81-.LFB81
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1b
	.string	"ekk_hal_data_sync_barrier"
	.byte	0x1
	.uahalf	0x185
	.byte	0x6
	.uaword	.LFB80
	.uaword	.LFE80-.LFB80
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1b
	.string	"ekk_hal_instruction_barrier"
	.byte	0x1
	.uahalf	0x180
	.byte	0x6
	.uaword	.LFB79
	.uaword	.LFE79-.LFB79
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1b
	.string	"ekk_hal_memory_barrier"
	.byte	0x1
	.uahalf	0x17b
	.byte	0x6
	.uaword	.LFB78
	.uaword	.LFE78-.LFB78
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1c
	.string	"ekk_hal_context_switch"
	.byte	0x1
	.uahalf	0x16b
	.byte	0x6
	.uaword	.LFB77
	.uaword	.LFE77-.LFB77
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xb37
	.uleb128 0x16
	.uaword	.LASF3
	.byte	0x1
	.uahalf	0x16b
	.byte	0x24
	.uaword	0xb37
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x17
	.string	"next_sp"
	.byte	0x1
	.uahalf	0x16b
	.byte	0x36
	.uaword	0x250
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.uleb128 0xe
	.string	"current_pcxi"
	.byte	0x1
	.uahalf	0x171
	.byte	0xf
	.uaword	0x493
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"next_pcxi"
	.byte	0x1
	.uahalf	0x172
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x5
	.byte	0x4
	.uaword	0x250
	.uleb128 0x1c
	.string	"ekk_hal_start_first_task"
	.byte	0x1
	.uahalf	0x158
	.byte	0x6
	.uaword	.LFB76
	.uaword	.LFE76-.LFB76
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xbb9
	.uleb128 0x17
	.string	"stack_ptr"
	.byte	0x1
	.uahalf	0x158
	.byte	0x25
	.uaword	0x250
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x17
	.string	"entry"
	.byte	0x1
	.uahalf	0x158
	.byte	0x37
	.uaword	0x240
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.uleb128 0xe
	.string	"stack_top"
	.byte	0x1
	.uahalf	0x15e
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"pcxi"
	.byte	0x1
	.uahalf	0x15f
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x1c
	.string	"ekk_hal_trigger_context_switch"
	.byte	0x1
	.uahalf	0x148
	.byte	0x6
	.uaword	.LFB75
	.uaword	.LFE75-.LFB75
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xc22
	.uleb128 0x18
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x14e
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xe
	.string	"gpsr_addr"
	.byte	0x1
	.uahalf	0x152
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"src"
	.byte	0x1
	.uahalf	0x153
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.byte	0
	.uleb128 0x1f
	.string	"ekk_hal_get_tick_period_us"
	.byte	0x1
	.uahalf	0x13b
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB74
	.uaword	.LFE74-.LFB74
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x15
	.string	"ekk_hal_get_tick_count"
	.byte	0x1
	.uahalf	0x135
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB73
	.uaword	.LFE73-.LFB73
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xc8f
	.uleb128 0x18
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x137
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x15
	.string	"ekk_hal_systick_init"
	.byte	0x1
	.uahalf	0x115
	.byte	0x5
	.uaword	0x20c
	.uaword	.LFB72
	.uaword	.LFE72-.LFB72
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xd49
	.uleb128 0x16
	.uaword	.LASF1
	.byte	0x1
	.uahalf	0x115
	.byte	0x2f
	.uaword	0x223
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -36
	.uleb128 0x18
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x117
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0x18
	.uaword	.LASF2
	.byte	0x1
	.uahalf	0x118
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"period"
	.byte	0x1
	.uahalf	0x11e
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"current"
	.byte	0x1
	.uahalf	0x121
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.uleb128 0xe
	.string	"cmcon"
	.byte	0x1
	.uahalf	0x125
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0xe
	.string	"icr"
	.byte	0x1
	.uahalf	0x129
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -24
	.uleb128 0xe
	.string	"irq_num"
	.byte	0x1
	.uahalf	0x12f
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -28
	.byte	0
	.uleb128 0x20
	.string	"stm_compare_isr"
	.byte	0x1
	.byte	0xff
	.byte	0xd
	.uaword	.LFB71
	.uaword	.LFE71-.LFB71
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xdb3
	.uleb128 0x18
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x101
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0x18
	.uaword	.LASF2
	.byte	0x1
	.uahalf	0x102
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0xe
	.string	"period"
	.byte	0x1
	.uahalf	0x108
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xe
	.string	"current"
	.byte	0x1
	.uahalf	0x109
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.byte	0
	.uleb128 0x21
	.string	"ekk_hal_delay_ms"
	.byte	0x1
	.byte	0xf3
	.byte	0x6
	.uaword	.LFB70
	.uaword	.LFE70-.LFB70
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xde5
	.uleb128 0x22
	.string	"ms"
	.byte	0x1
	.byte	0xf3
	.byte	0x20
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x21
	.string	"ekk_hal_delay_us"
	.byte	0x1
	.byte	0xeb
	.byte	0x6
	.uaword	.LFB69
	.uaword	.LFE69-.LFB69
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xe28
	.uleb128 0x22
	.string	"us"
	.byte	0x1
	.byte	0xeb
	.byte	0x20
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xd
	.string	"start"
	.byte	0x1
	.byte	0xed
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x23
	.string	"ekk_hal_get_time_us64"
	.byte	0x1
	.byte	0xd6
	.byte	0xa
	.uaword	0x1fb
	.uaword	.LFB68
	.uaword	.LFE68-.LFB68
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xeb7
	.uleb128 0x24
	.uaword	.LASF4
	.byte	0x1
	.byte	0xd8
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x24
	.uaword	.LASF2
	.byte	0x1
	.byte	0xd9
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.uleb128 0xd
	.string	"tim0"
	.byte	0x1
	.byte	0xdc
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -24
	.uleb128 0xd
	.string	"tim6"
	.byte	0x1
	.byte	0xdc
	.byte	0x14
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0xd
	.string	"ticks"
	.byte	0x1
	.byte	0xe2
	.byte	0xe
	.uaword	0x1fb
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -32
	.uleb128 0xd
	.string	"divisor"
	.byte	0x1
	.byte	0xe5
	.byte	0xe
	.uaword	0x1fb
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x25
	.string	"ekk_hal_get_time_ms"
	.byte	0x1
	.byte	0xd1
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB67
	.uaword	.LFE67-.LFB67
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x23
	.string	"ekk_hal_get_time_us"
	.byte	0x1
	.byte	0xc1
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB66
	.uaword	.LFE66-.LFB66
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xf49
	.uleb128 0x24
	.uaword	.LASF4
	.byte	0x1
	.byte	0xc3
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0x24
	.uaword	.LASF2
	.byte	0x1
	.byte	0xc4
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0xd
	.string	"tim0"
	.byte	0x1
	.byte	0xc7
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -16
	.uleb128 0xd
	.string	"divisor"
	.byte	0x1
	.byte	0xcb
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x26
	.string	"get_stm_base"
	.byte	0x1
	.byte	0xb4
	.byte	0x11
	.uaword	0x1e5
	.uaword	.LFB65
	.uaword	.LFE65-.LFB65
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xf7c
	.uleb128 0x27
	.uaword	.LASF4
	.byte	0x1
	.byte	0xb4
	.byte	0x27
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x23
	.string	"ekk_hal_in_critical"
	.byte	0x1
	.byte	0xa4
	.byte	0x6
	.uaword	0x247
	.uaword	.LFB64
	.uaword	.LFE64-.LFB64
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xfb6
	.uleb128 0x24
	.uaword	.LASF4
	.byte	0x1
	.byte	0xa6
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x23
	.string	"ekk_hal_exit_critical"
	.byte	0x1
	.byte	0x95
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB63
	.uaword	.LFE63-.LFB63
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xff2
	.uleb128 0x24
	.uaword	.LASF4
	.byte	0x1
	.byte	0x97
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x23
	.string	"ekk_hal_enter_critical"
	.byte	0x1
	.byte	0x8a
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB62
	.uaword	.LFE62-.LFB62
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1042
	.uleb128 0x24
	.uaword	.LASF4
	.byte	0x1
	.byte	0x8c
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0xd
	.string	"nesting"
	.byte	0x1
	.byte	0x90
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x25
	.string	"ekk_hal_interrupts_enabled"
	.byte	0x1
	.byte	0x81
	.byte	0x6
	.uaword	0x247
	.uaword	.LFB61
	.uaword	.LFE61-.LFB61
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x21
	.string	"ekk_hal_restore_interrupts"
	.byte	0x1
	.byte	0x7a
	.byte	0x6
	.uaword	.LFB60
	.uaword	.LFE60-.LFB60
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x10ae
	.uleb128 0x22
	.string	"state"
	.byte	0x1
	.byte	0x7a
	.byte	0x2a
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x28
	.string	"ekk_hal_enable_interrupts"
	.byte	0x1
	.byte	0x75
	.byte	0x6
	.uaword	.LFB59
	.uaword	.LFE59-.LFB59
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x23
	.string	"ekk_hal_disable_interrupts"
	.byte	0x1
	.byte	0x6e
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB58
	.uaword	.LFE58-.LFB58
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1132
	.uleb128 0xd
	.string	"icr"
	.byte	0x1
	.byte	0x70
	.byte	0xe
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0x1d
	.uaword	.LBB4
	.uaword	.LBE4-.LBB4
	.uleb128 0xd
	.string	"__res"
	.byte	0x1
	.byte	0x70
	.byte	0x14
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0x25
	.string	"ekk_hal_is_boot_core"
	.byte	0x1
	.byte	0x65
	.byte	0x6
	.uaword	0x247
	.uaword	.LFB57
	.uaword	.LFE57-.LFB57
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x29
	.string	"ekk_hal_get_core_count"
	.byte	0x1
	.byte	0x60
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB56
	.uaword	.LFE56-.LFB56
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x25
	.string	"ekk_hal_get_core_id"
	.byte	0x1
	.byte	0x5b
	.byte	0xa
	.uaword	0x1e5
	.uaword	.LFB55
	.uaword	.LFE55-.LFB55
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2a
	.string	"ekk_hal_init_core"
	.byte	0x1
	.byte	0x4a
	.byte	0x5
	.uaword	0x20c
	.uaword	.LFB54
	.uaword	.LFE54-.LFB54
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x11e0
	.uleb128 0x27
	.uaword	.LASF4
	.byte	0x1
	.byte	0x4a
	.byte	0x20
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x25
	.string	"ekk_hal_init"
	.byte	0x1
	.byte	0x32
	.byte	0x5
	.uaword	0x20c
	.uaword	.LFB53
	.uaword	.LFE53-.LFB53
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x26
	.string	"cpu_interrupts_enabled"
	.byte	0x3
	.byte	0xab
	.byte	0x14
	.uaword	0x247
	.uaword	.LFB42
	.uaword	.LFE42-.LFB42
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1248
	.uleb128 0x1d
	.uaword	.LBB3
	.uaword	.LBE3-.LBB3
	.uleb128 0xd
	.string	"__res"
	.byte	0x3
	.byte	0xad
	.byte	0xd
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0x2b
	.string	"cpu_get_id"
	.byte	0x3
	.byte	0x5b
	.byte	0x18
	.uaword	0x1e5
	.uaword	.LFB36
	.uaword	.LFE36-.LFB36
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2c
	.string	"__get_core_id"
	.byte	0x2
	.uahalf	0x18f
	.byte	0x18
	.uaword	0x1e5
	.uaword	.LFB23
	.uaword	.LFE23-.LFB23
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x12a7
	.uleb128 0x1d
	.uaword	.LBB2
	.uaword	.LBE2-.LBB2
	.uleb128 0xe
	.string	"__res"
	.byte	0x2
	.uahalf	0x191
	.byte	0xc
	.uaword	0x1e5
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0x2d
	.string	"__nop"
	.byte	0x2
	.byte	0xb6
	.byte	0x14
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2d
	.string	"__debug"
	.byte	0x2
	.byte	0xaa
	.byte	0x14
	.uaword	.LFB7
	.uaword	.LFE7-.LFB7
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2d
	.string	"__isync"
	.byte	0x2
	.byte	0x91
	.byte	0x14
	.uaword	.LFB5
	.uaword	.LFE5-.LFB5
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2d
	.string	"__dsync"
	.byte	0x2
	.byte	0x84
	.byte	0x14
	.uaword	.LFB4
	.uaword	.LFE4-.LFB4
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2d
	.string	"__enable"
	.byte	0x2
	.byte	0x5d
	.byte	0x14
	.uaword	.LFB1
	.uaword	.LFE1-.LFB1
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2d
	.string	"__disable"
	.byte	0x2
	.byte	0x51
	.byte	0x14
	.uaword	.LFB0
	.uaword	.LFE0-.LFB0
	.uleb128 0x1
	.byte	0x9c
	.byte	0
	.section	.debug_abbrev,"",@progbits
.Ldebug_abbrev0:
	.uleb128 0x1
	.uleb128 0x11
	.byte	0x1
	.uleb128 0x25
	.uleb128 0x8
	.uleb128 0x13
	.uleb128 0xb
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x1b
	.uleb128 0x8
	.uleb128 0x55
	.uleb128 0x17
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x10
	.uleb128 0x17
	.uleb128 0x2119
	.uleb128 0x17
	.byte	0
	.byte	0
	.uleb128 0x2
	.uleb128 0x24
	.byte	0
	.uleb128 0xb
	.uleb128 0xb
	.uleb128 0x3e
	.uleb128 0xb
	.uleb128 0x3
	.uleb128 0x8
	.byte	0
	.byte	0
	.uleb128 0x3
	.uleb128 0x16
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x4
	.uleb128 0x35
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x5
	.uleb128 0xf
	.byte	0
	.uleb128 0xb
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x6
	.uleb128 0x15
	.byte	0
	.uleb128 0x27
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x7
	.uleb128 0xf
	.byte	0
	.uleb128 0xb
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0x8
	.uleb128 0x4
	.byte	0x1
	.uleb128 0x3e
	.uleb128 0xb
	.uleb128 0xb
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x9
	.uleb128 0x28
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x1c
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0xa
	.uleb128 0x26
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0xb
	.uleb128 0x1
	.byte	0x1
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0xc
	.uleb128 0x21
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2f
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0xd
	.uleb128 0x34
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0xe
	.uleb128 0x34
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0xf
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x3c
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x10
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x3c
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x11
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x3c
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x12
	.uleb128 0x5
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x13
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x3c
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x14
	.uleb128 0x15
	.byte	0x1
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x15
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x16
	.uleb128 0x5
	.byte	0
	.uleb128 0x3
	.uleb128 0xe
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x17
	.uleb128 0x5
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x18
	.uleb128 0x34
	.byte	0
	.uleb128 0x3
	.uleb128 0xe
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x19
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x1a
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x1b
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x1c
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x1d
	.uleb128 0xb
	.byte	0x1
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.byte	0
	.byte	0
	.uleb128 0x1e
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x1f
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x20
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x21
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x22
	.uleb128 0x5
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x23
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x24
	.uleb128 0x34
	.byte	0
	.uleb128 0x3
	.uleb128 0xe
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x25
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x26
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x27
	.uleb128 0x5
	.byte	0
	.uleb128 0x3
	.uleb128 0xe
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2
	.uleb128 0x18
	.byte	0
	.byte	0
	.uleb128 0x28
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x29
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x2a
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3f
	.uleb128 0x19
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x2b
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2116
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x2c
	.uleb128 0x2e
	.byte	0x1
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0x5
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x2d
	.uleb128 0x2e
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x3a
	.uleb128 0xb
	.uleb128 0x3b
	.uleb128 0xb
	.uleb128 0x39
	.uleb128 0xb
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.uleb128 0x40
	.uleb128 0x18
	.uleb128 0x2117
	.uleb128 0x19
	.byte	0
	.byte	0
	.byte	0
	.section	.debug_aranges,"",@progbits
	.uaword	0x1bc
	.uahalf	0x2
	.uaword	.Ldebug_info0
	.byte	0x4
	.byte	0
	.uahalf	0
	.uahalf	0
	.uaword	.LFB0
	.uaword	.LFE0-.LFB0
	.uaword	.LFB1
	.uaword	.LFE1-.LFB1
	.uaword	.LFB4
	.uaword	.LFE4-.LFB4
	.uaword	.LFB5
	.uaword	.LFE5-.LFB5
	.uaword	.LFB7
	.uaword	.LFE7-.LFB7
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.uaword	.LFB23
	.uaword	.LFE23-.LFB23
	.uaword	.LFB36
	.uaword	.LFE36-.LFB36
	.uaword	.LFB42
	.uaword	.LFE42-.LFB42
	.uaword	.LFB53
	.uaword	.LFE53-.LFB53
	.uaword	.LFB54
	.uaword	.LFE54-.LFB54
	.uaword	.LFB55
	.uaword	.LFE55-.LFB55
	.uaword	.LFB56
	.uaword	.LFE56-.LFB56
	.uaword	.LFB57
	.uaword	.LFE57-.LFB57
	.uaword	.LFB58
	.uaword	.LFE58-.LFB58
	.uaword	.LFB59
	.uaword	.LFE59-.LFB59
	.uaword	.LFB60
	.uaword	.LFE60-.LFB60
	.uaword	.LFB61
	.uaword	.LFE61-.LFB61
	.uaword	.LFB62
	.uaword	.LFE62-.LFB62
	.uaword	.LFB63
	.uaword	.LFE63-.LFB63
	.uaword	.LFB64
	.uaword	.LFE64-.LFB64
	.uaword	.LFB65
	.uaword	.LFE65-.LFB65
	.uaword	.LFB66
	.uaword	.LFE66-.LFB66
	.uaword	.LFB67
	.uaword	.LFE67-.LFB67
	.uaword	.LFB68
	.uaword	.LFE68-.LFB68
	.uaword	.LFB69
	.uaword	.LFE69-.LFB69
	.uaword	.LFB70
	.uaword	.LFE70-.LFB70
	.uaword	.LFB71
	.uaword	.LFE71-.LFB71
	.uaword	.LFB72
	.uaword	.LFE72-.LFB72
	.uaword	.LFB73
	.uaword	.LFE73-.LFB73
	.uaword	.LFB74
	.uaword	.LFE74-.LFB74
	.uaword	.LFB75
	.uaword	.LFE75-.LFB75
	.uaword	.LFB76
	.uaword	.LFE76-.LFB76
	.uaword	.LFB77
	.uaword	.LFE77-.LFB77
	.uaword	.LFB78
	.uaword	.LFE78-.LFB78
	.uaword	.LFB79
	.uaword	.LFE79-.LFB79
	.uaword	.LFB80
	.uaword	.LFE80-.LFB80
	.uaword	.LFB81
	.uaword	.LFE81-.LFB81
	.uaword	.LFB82
	.uaword	.LFE82-.LFB82
	.uaword	.LFB83
	.uaword	.LFE83-.LFB83
	.uaword	.LFB84
	.uaword	.LFE84-.LFB84
	.uaword	.LFB85
	.uaword	.LFE85-.LFB85
	.uaword	.LFB86
	.uaword	.LFE86-.LFB86
	.uaword	.LFB87
	.uaword	.LFE87-.LFB87
	.uaword	.LFB88
	.uaword	.LFE88-.LFB88
	.uaword	.LFB89
	.uaword	.LFE89-.LFB89
	.uaword	.LFB90
	.uaword	.LFE90-.LFB90
	.uaword	.LFB91
	.uaword	.LFE91-.LFB91
	.uaword	.LFB92
	.uaword	.LFE92-.LFB92
	.uaword	.LFB93
	.uaword	.LFE93-.LFB93
	.uaword	.LFB94
	.uaword	.LFE94-.LFB94
	.uaword	.LFB95
	.uaword	.LFE95-.LFB95
	.uaword	.LFB96
	.uaword	.LFE96-.LFB96
	.uaword	0
	.uaword	0
	.section	.debug_ranges,"",@progbits
.Ldebug_ranges0:
	.uaword	.LFB0
	.uaword	.LFE0
	.uaword	.LFB1
	.uaword	.LFE1
	.uaword	.LFB4
	.uaword	.LFE4
	.uaword	.LFB5
	.uaword	.LFE5
	.uaword	.LFB7
	.uaword	.LFE7
	.uaword	.LFB8
	.uaword	.LFE8
	.uaword	.LFB23
	.uaword	.LFE23
	.uaword	.LFB36
	.uaword	.LFE36
	.uaword	.LFB42
	.uaword	.LFE42
	.uaword	.LFB53
	.uaword	.LFE53
	.uaword	.LFB54
	.uaword	.LFE54
	.uaword	.LFB55
	.uaword	.LFE55
	.uaword	.LFB56
	.uaword	.LFE56
	.uaword	.LFB57
	.uaword	.LFE57
	.uaword	.LFB58
	.uaword	.LFE58
	.uaword	.LFB59
	.uaword	.LFE59
	.uaword	.LFB60
	.uaword	.LFE60
	.uaword	.LFB61
	.uaword	.LFE61
	.uaword	.LFB62
	.uaword	.LFE62
	.uaword	.LFB63
	.uaword	.LFE63
	.uaword	.LFB64
	.uaword	.LFE64
	.uaword	.LFB65
	.uaword	.LFE65
	.uaword	.LFB66
	.uaword	.LFE66
	.uaword	.LFB67
	.uaword	.LFE67
	.uaword	.LFB68
	.uaword	.LFE68
	.uaword	.LFB69
	.uaword	.LFE69
	.uaword	.LFB70
	.uaword	.LFE70
	.uaword	.LFB71
	.uaword	.LFE71
	.uaword	.LFB72
	.uaword	.LFE72
	.uaword	.LFB73
	.uaword	.LFE73
	.uaword	.LFB74
	.uaword	.LFE74
	.uaword	.LFB75
	.uaword	.LFE75
	.uaword	.LFB76
	.uaword	.LFE76
	.uaword	.LFB77
	.uaword	.LFE77
	.uaword	.LFB78
	.uaword	.LFE78
	.uaword	.LFB79
	.uaword	.LFE79
	.uaword	.LFB80
	.uaword	.LFE80
	.uaword	.LFB81
	.uaword	.LFE81
	.uaword	.LFB82
	.uaword	.LFE82
	.uaword	.LFB83
	.uaword	.LFE83
	.uaword	.LFB84
	.uaword	.LFE84
	.uaword	.LFB85
	.uaword	.LFE85
	.uaword	.LFB86
	.uaword	.LFE86
	.uaword	.LFB87
	.uaword	.LFE87
	.uaword	.LFB88
	.uaword	.LFE88
	.uaword	.LFB89
	.uaword	.LFE89
	.uaword	.LFB90
	.uaword	.LFE90
	.uaword	.LFB91
	.uaword	.LFE91
	.uaword	.LFB92
	.uaword	.LFE92
	.uaword	.LFB93
	.uaword	.LFE93
	.uaword	.LFB94
	.uaword	.LFE94
	.uaword	.LFB95
	.uaword	.LFE95
	.uaword	.LFB96
	.uaword	.LFE96
	.uaword	0
	.uaword	0
	.section	.debug_macro,"",@progbits
.Ldebug_macro0:
	.uahalf	0x4
	.byte	0x2
	.uaword	.Ldebug_line0
	.byte	0x7
	.uaword	.Ldebug_macro2
	.byte	0x3
	.uleb128 0
	.uleb128 0x1
	.byte	0x1
	.uleb128 0x8
	.string	"HAL_TC397XP "
	.byte	0x3
	.uleb128 0xa
	.uleb128 0x6
	.byte	0x1
	.uleb128 0xa
	.string	"EKK_HAL_H "
	.file 11 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stdint.h"
	.byte	0x3
	.uleb128 0xc
	.uleb128 0xb
	.file 12 "C:/tricore-gcc/tricore-elf/include/stdint.h"
	.byte	0x3
	.uleb128 0x9
	.uleb128 0xc
	.byte	0x1
	.uleb128 0xa
	.string	"_STDINT_H "
	.byte	0x3
	.uleb128 0xc
	.uleb128 0x4
	.byte	0x1
	.uleb128 0x6
	.string	"_MACHINE__DEFAULT_TYPES_H "
	.file 13 "C:/tricore-gcc/tricore-elf/include/sys/features.h"
	.byte	0x3
	.uleb128 0x8
	.uleb128 0xd
	.byte	0x1
	.uleb128 0x16
	.string	"_SYS_FEATURES_H "
	.file 14 "C:/tricore-gcc/tricore-elf/include/_newlib_version.h"
	.byte	0x3
	.uleb128 0x1c
	.uleb128 0xe
	.byte	0x7
	.uaword	.Ldebug_macro3
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro4
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro5
	.byte	0x4
	.file 15 "C:/tricore-gcc/tricore-elf/include/sys/_intsup.h"
	.byte	0x3
	.uleb128 0xd
	.uleb128 0xf
	.byte	0x7
	.uaword	.Ldebug_macro6
	.byte	0x4
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x5
	.byte	0x7
	.uaword	.Ldebug_macro7
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro8
	.byte	0x4
	.byte	0x1
	.uleb128 0xd
	.string	"_GCC_WRAP_STDINT_H "
	.byte	0x4
	.file 16 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stdbool.h"
	.byte	0x3
	.uleb128 0xd
	.uleb128 0x10
	.byte	0x7
	.uaword	.Ldebug_macro9
	.byte	0x4
	.byte	0x4
	.file 17 "./build/ek-kor/include/ek-kor/config.h"
	.byte	0x3
	.uleb128 0xb
	.uleb128 0x11
	.byte	0x7
	.uaword	.Ldebug_macro10
	.byte	0x4
	.file 18 "./include/tc397xp_regs.h"
	.byte	0x3
	.uleb128 0xc
	.uleb128 0x12
	.byte	0x7
	.uaword	.Ldebug_macro11
	.byte	0x4
	.file 19 "./include/tc397xp_sfr.h"
	.byte	0x3
	.uleb128 0xd
	.uleb128 0x13
	.byte	0x7
	.uaword	.Ldebug_macro12
	.byte	0x4
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x2
	.byte	0x1
	.uleb128 0xe
	.string	"TRICORE_INTRINSICS_H "
	.byte	0x3
	.uleb128 0x11
	.uleb128 0x13
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro13
	.byte	0x4
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x3
	.byte	0x7
	.uaword	.Ldebug_macro14
	.byte	0x4
	.byte	0x3
	.uleb128 0x10
	.uleb128 0x9
	.byte	0x7
	.uaword	.Ldebug_macro15
	.byte	0x4
	.byte	0x3
	.uleb128 0x11
	.uleb128 0x7
	.byte	0x1
	.uleb128 0xa
	.string	"TRICORE_IRQ_H "
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x3
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro16
	.byte	0x4
	.byte	0x3
	.uleb128 0x13
	.uleb128 0xa
	.byte	0x1
	.uleb128 0x8
	.string	"_STRING_H_ "
	.file 20 "C:/tricore-gcc/tricore-elf/include/_ansi.h"
	.byte	0x3
	.uleb128 0xa
	.uleb128 0x14
	.byte	0x1
	.uleb128 0x8
	.string	"_ANSIDECL_H_ "
	.file 21 "C:/tricore-gcc/tricore-elf/include/newlib.h"
	.byte	0x3
	.uleb128 0xa
	.uleb128 0x15
	.byte	0x7
	.uaword	.Ldebug_macro17
	.byte	0x4
	.file 22 "C:/tricore-gcc/tricore-elf/include/sys/config.h"
	.byte	0x3
	.uleb128 0xb
	.uleb128 0x16
	.byte	0x1
	.uleb128 0x2
	.string	"__SYS_CONFIG_H__ "
	.file 23 "C:/tricore-gcc/tricore-elf/include/machine/ieeefp.h"
	.byte	0x3
	.uleb128 0x4
	.uleb128 0x17
	.byte	0x7
	.uaword	.Ldebug_macro18
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro19
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro20
	.byte	0x4
	.file 24 "C:/tricore-gcc/tricore-elf/include/sys/reent.h"
	.byte	0x3
	.uleb128 0xb
	.uleb128 0x18
	.byte	0x1
	.uleb128 0xb
	.string	"_SYS_REENT_H_ "
	.byte	0x3
	.uleb128 0xd
	.uleb128 0x14
	.byte	0x4
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x8
	.byte	0x7
	.uaword	.Ldebug_macro21
	.byte	0x4
	.file 25 "C:/tricore-gcc/tricore-elf/include/sys/_types.h"
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x19
	.byte	0x7
	.uaword	.Ldebug_macro22
	.byte	0x3
	.uleb128 0x18
	.uleb128 0x8
	.byte	0x7
	.uaword	.Ldebug_macro23
	.byte	0x4
	.file 26 "C:/tricore-gcc/tricore-elf/include/machine/_types.h"
	.byte	0x3
	.uleb128 0x1b
	.uleb128 0x1a
	.byte	0x7
	.uaword	.Ldebug_macro24
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro25
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro26
	.file 27 "C:/tricore-gcc/tricore-elf/include/sys/lock.h"
	.byte	0x3
	.uleb128 0x22
	.uleb128 0x1b
	.byte	0x7
	.uaword	.Ldebug_macro27
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro28
	.byte	0x4
	.file 28 "C:/tricore-gcc/tricore-elf/include/sys/cdefs.h"
	.byte	0x3
	.uleb128 0xc
	.uleb128 0x1c
	.byte	0x1
	.uleb128 0x2b
	.string	"_SYS_CDEFS_H_ "
	.byte	0x3
	.uleb128 0x2f
	.uleb128 0x8
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro29
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro30
	.byte	0x3
	.uleb128 0x11
	.uleb128 0x8
	.byte	0x7
	.uaword	.Ldebug_macro31
	.byte	0x4
	.file 29 "C:/tricore-gcc/tricore-elf/include/sys/_locale.h"
	.byte	0x3
	.uleb128 0x14
	.uleb128 0x1d
	.byte	0x1
	.uleb128 0x4
	.string	"_SYS__LOCALE_H "
	.byte	0x4
	.file 30 "C:/tricore-gcc/tricore-elf/include/strings.h"
	.byte	0x3
	.uleb128 0x18
	.uleb128 0x1e
	.byte	0x1
	.uleb128 0x1e
	.string	"_STRINGS_H_ "
	.byte	0x4
	.file 31 "C:/tricore-gcc/tricore-elf/include/sys/string.h"
	.byte	0x3
	.uleb128 0xaf
	.uleb128 0x1f
	.byte	0x4
	.byte	0x4
	.byte	0x4
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.0.c9183e676a074d3763d9e42cd96c9fa8,comdat
.Ldebug_macro2:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0
	.string	"__STDC__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__STDC_VERSION__ 201710L"
	.byte	0x1
	.uleb128 0
	.string	"__STDC_UTF_16__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__STDC_UTF_32__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__STDC_HOSTED__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__GNUC__ 13"
	.byte	0x1
	.uleb128 0
	.string	"__GNUC_MINOR__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__GNUC_PATCHLEVEL__ 0"
	.byte	0x1
	.uleb128 0
	.string	"__VERSION__ \"13.4.0\""
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_RELAXED 0"
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_SEQ_CST 5"
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_ACQUIRE 2"
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_RELEASE 3"
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_ACQ_REL 4"
	.byte	0x1
	.uleb128 0
	.string	"__ATOMIC_CONSUME 1"
	.byte	0x1
	.uleb128 0
	.string	"__FINITE_MATH_ONLY__ 0"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_INT__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_LONG__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_LONG_LONG__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_SHORT__ 2"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_FLOAT__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_DOUBLE__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_LONG_DOUBLE__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_SIZE_T__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__CHAR_BIT__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__BIGGEST_ALIGNMENT__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__ORDER_LITTLE_ENDIAN__ 1234"
	.byte	0x1
	.uleb128 0
	.string	"__ORDER_BIG_ENDIAN__ 4321"
	.byte	0x1
	.uleb128 0
	.string	"__ORDER_PDP_ENDIAN__ 3412"
	.byte	0x1
	.uleb128 0
	.string	"__BYTE_ORDER__ __ORDER_LITTLE_ENDIAN__"
	.byte	0x1
	.uleb128 0
	.string	"__FLOAT_WORD_ORDER__ __ORDER_LITTLE_ENDIAN__"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_POINTER__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__GNUC_EXECUTION_CHARSET_NAME \"UTF-8\""
	.byte	0x1
	.uleb128 0
	.string	"__GNUC_WIDE_EXECUTION_CHARSET_NAME \"UTF-32LE\""
	.byte	0x1
	.uleb128 0
	.string	"__SIZE_TYPE__ long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__PTRDIFF_TYPE__ long int"
	.byte	0x1
	.uleb128 0
	.string	"__WCHAR_TYPE__ int"
	.byte	0x1
	.uleb128 0
	.string	"__WINT_TYPE__ unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__INTMAX_TYPE__ long long int"
	.byte	0x1
	.uleb128 0
	.string	"__UINTMAX_TYPE__ long long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__CHAR16_TYPE__ short unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__CHAR32_TYPE__ long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__SIG_ATOMIC_TYPE__ int"
	.byte	0x1
	.uleb128 0
	.string	"__INT8_TYPE__ signed char"
	.byte	0x1
	.uleb128 0
	.string	"__INT16_TYPE__ short int"
	.byte	0x1
	.uleb128 0
	.string	"__INT32_TYPE__ long int"
	.byte	0x1
	.uleb128 0
	.string	"__INT64_TYPE__ long long int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT8_TYPE__ unsigned char"
	.byte	0x1
	.uleb128 0
	.string	"__UINT16_TYPE__ short unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT32_TYPE__ long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT64_TYPE__ long long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST8_TYPE__ signed char"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST16_TYPE__ short int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST32_TYPE__ long int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST64_TYPE__ long long int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST8_TYPE__ unsigned char"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST16_TYPE__ short unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST32_TYPE__ long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST64_TYPE__ long long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST8_TYPE__ int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST16_TYPE__ int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST32_TYPE__ int"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST64_TYPE__ long long int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST8_TYPE__ unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST16_TYPE__ unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST32_TYPE__ unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST64_TYPE__ long long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__INTPTR_TYPE__ long int"
	.byte	0x1
	.uleb128 0
	.string	"__UINTPTR_TYPE__ long unsigned int"
	.byte	0x1
	.uleb128 0
	.string	"__GXX_ABI_VERSION 1018"
	.byte	0x1
	.uleb128 0
	.string	"__USING_SJLJ_EXCEPTIONS__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__SCHAR_MAX__ 0x7f"
	.byte	0x1
	.uleb128 0
	.string	"__SHRT_MAX__ 0x7fff"
	.byte	0x1
	.uleb128 0
	.string	"__INT_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__LONG_MAX__ 0x7fffffffL"
	.byte	0x1
	.uleb128 0
	.string	"__LONG_LONG_MAX__ 0x7fffffffffffffffLL"
	.byte	0x1
	.uleb128 0
	.string	"__WCHAR_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__WCHAR_MIN__ (-__WCHAR_MAX__ - 1)"
	.byte	0x1
	.uleb128 0
	.string	"__WINT_MAX__ 0xffffffffU"
	.byte	0x1
	.uleb128 0
	.string	"__WINT_MIN__ 0U"
	.byte	0x1
	.uleb128 0
	.string	"__PTRDIFF_MAX__ 0x7fffffffL"
	.byte	0x1
	.uleb128 0
	.string	"__SIZE_MAX__ 0xffffffffUL"
	.byte	0x1
	.uleb128 0
	.string	"__SCHAR_WIDTH__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__SHRT_WIDTH__ 16"
	.byte	0x1
	.uleb128 0
	.string	"__INT_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__LONG_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__LONG_LONG_WIDTH__ 64"
	.byte	0x1
	.uleb128 0
	.string	"__WCHAR_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__WINT_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__PTRDIFF_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__SIZE_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INTMAX_MAX__ 0x7fffffffffffffffLL"
	.byte	0x1
	.uleb128 0
	.string	"__INTMAX_C(c) c ## LL"
	.byte	0x1
	.uleb128 0
	.string	"__UINTMAX_MAX__ 0xffffffffffffffffULL"
	.byte	0x1
	.uleb128 0
	.string	"__UINTMAX_C(c) c ## ULL"
	.byte	0x1
	.uleb128 0
	.string	"__INTMAX_WIDTH__ 64"
	.byte	0x1
	.uleb128 0
	.string	"__SIG_ATOMIC_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__SIG_ATOMIC_MIN__ (-__SIG_ATOMIC_MAX__ - 1)"
	.byte	0x1
	.uleb128 0
	.string	"__SIG_ATOMIC_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INT8_MAX__ 0x7f"
	.byte	0x1
	.uleb128 0
	.string	"__INT16_MAX__ 0x7fff"
	.byte	0x1
	.uleb128 0
	.string	"__INT32_MAX__ 0x7fffffffL"
	.byte	0x1
	.uleb128 0
	.string	"__INT64_MAX__ 0x7fffffffffffffffLL"
	.byte	0x1
	.uleb128 0
	.string	"__UINT8_MAX__ 0xff"
	.byte	0x1
	.uleb128 0
	.string	"__UINT16_MAX__ 0xffff"
	.byte	0x1
	.uleb128 0
	.string	"__UINT32_MAX__ 0xffffffffUL"
	.byte	0x1
	.uleb128 0
	.string	"__UINT64_MAX__ 0xffffffffffffffffULL"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST8_MAX__ 0x7f"
	.byte	0x1
	.uleb128 0
	.string	"__INT8_C(c) c"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST8_WIDTH__ 8"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST16_MAX__ 0x7fff"
	.byte	0x1
	.uleb128 0
	.string	"__INT16_C(c) c"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST16_WIDTH__ 16"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST32_MAX__ 0x7fffffffL"
	.byte	0x1
	.uleb128 0
	.string	"__INT32_C(c) c ## L"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST32_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST64_MAX__ 0x7fffffffffffffffLL"
	.byte	0x1
	.uleb128 0
	.string	"__INT64_C(c) c ## LL"
	.byte	0x1
	.uleb128 0
	.string	"__INT_LEAST64_WIDTH__ 64"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST8_MAX__ 0xff"
	.byte	0x1
	.uleb128 0
	.string	"__UINT8_C(c) c"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST16_MAX__ 0xffff"
	.byte	0x1
	.uleb128 0
	.string	"__UINT16_C(c) c"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST32_MAX__ 0xffffffffUL"
	.byte	0x1
	.uleb128 0
	.string	"__UINT32_C(c) c ## UL"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_LEAST64_MAX__ 0xffffffffffffffffULL"
	.byte	0x1
	.uleb128 0
	.string	"__UINT64_C(c) c ## ULL"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST8_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST8_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST16_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST16_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST32_MAX__ 0x7fffffff"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST32_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST64_MAX__ 0x7fffffffffffffffLL"
	.byte	0x1
	.uleb128 0
	.string	"__INT_FAST64_WIDTH__ 64"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST8_MAX__ 0xffffffffU"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST16_MAX__ 0xffffffffU"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST32_MAX__ 0xffffffffU"
	.byte	0x1
	.uleb128 0
	.string	"__UINT_FAST64_MAX__ 0xffffffffffffffffULL"
	.byte	0x1
	.uleb128 0
	.string	"__INTPTR_MAX__ 0x7fffffffL"
	.byte	0x1
	.uleb128 0
	.string	"__INTPTR_WIDTH__ 32"
	.byte	0x1
	.uleb128 0
	.string	"__UINTPTR_MAX__ 0xffffffffUL"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_IEC_559 0"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_IEC_559_COMPLEX 0"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_EVAL_METHOD__ 0"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_EVAL_METHOD_TS_18661_3__ 0"
	.byte	0x1
	.uleb128 0
	.string	"__DEC_EVAL_METHOD__ 2"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_RADIX__ 2"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MANT_DIG__ 24"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_DIG__ 6"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MIN_EXP__ (-125)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MIN_10_EXP__ (-37)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MAX_EXP__ 128"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MAX_10_EXP__ 38"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_DECIMAL_DIG__ 9"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MAX__ 3.4028234663852886e+38F"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_NORM_MAX__ 3.4028234663852886e+38F"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_MIN__ 1.1754943508222875e-38F"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_EPSILON__ 1.1920928955078125e-7F"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_DENORM_MIN__ 1.4012984643248171e-45F"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FP_FAST_FMAF 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MANT_DIG__ 53"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_DIG__ 15"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MIN_EXP__ (-1021)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MIN_10_EXP__ (-307)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MAX_EXP__ 1024"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MAX_10_EXP__ 308"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_DECIMAL_DIG__ 17"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MAX__ ((double)1.7976931348623157e+308L)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_NORM_MAX__ ((double)1.7976931348623157e+308L)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_MIN__ ((double)2.2250738585072014e-308L)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_EPSILON__ ((double)2.2204460492503131e-16L)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_DENORM_MIN__ ((double)4.9406564584124654e-324L)"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__DBL_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MANT_DIG__ 53"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_DIG__ 15"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MIN_EXP__ (-1021)"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MIN_10_EXP__ (-307)"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MAX_EXP__ 1024"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MAX_10_EXP__ 308"
	.byte	0x1
	.uleb128 0
	.string	"__DECIMAL_DIG__ 17"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_DECIMAL_DIG__ 17"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MAX__ 1.7976931348623157e+308L"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_NORM_MAX__ 1.7976931348623157e+308L"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_MIN__ 2.2250738585072014e-308L"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_EPSILON__ 2.2204460492503131e-16L"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_DENORM_MIN__ 4.9406564584124654e-324L"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__LDBL_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MANT_DIG__ 24"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_DIG__ 6"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MIN_EXP__ (-125)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MIN_10_EXP__ (-37)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MAX_EXP__ 128"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MAX_10_EXP__ 38"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_DECIMAL_DIG__ 9"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MAX__ 3.4028234663852886e+38F32"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_NORM_MAX__ 3.4028234663852886e+38F32"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_MIN__ 1.1754943508222875e-38F32"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_EPSILON__ 1.1920928955078125e-7F32"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_DENORM_MIN__ 1.4012984643248171e-45F32"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FP_FAST_FMAF32 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MANT_DIG__ 53"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_DIG__ 15"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MIN_EXP__ (-1021)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MIN_10_EXP__ (-307)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MAX_EXP__ 1024"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MAX_10_EXP__ 308"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_DECIMAL_DIG__ 17"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MAX__ 1.7976931348623157e+308F64"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_NORM_MAX__ 1.7976931348623157e+308F64"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_MIN__ 2.2250738585072014e-308F64"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_EPSILON__ 2.2204460492503131e-16F64"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_DENORM_MIN__ 4.9406564584124654e-324F64"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT64_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MANT_DIG__ 53"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_DIG__ 15"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MIN_EXP__ (-1021)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MIN_10_EXP__ (-307)"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MAX_EXP__ 1024"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MAX_10_EXP__ 308"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_DECIMAL_DIG__ 17"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MAX__ 1.7976931348623157e+308F32x"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_NORM_MAX__ 1.7976931348623157e+308F32x"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_MIN__ 2.2250738585072014e-308F32x"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_EPSILON__ 2.2204460492503131e-16F32x"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_DENORM_MIN__ 4.9406564584124654e-324F32x"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_HAS_DENORM__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_HAS_INFINITY__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_HAS_QUIET_NAN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__FLT32X_IS_IEC_60559__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__REGISTER_PREFIX__ %"
	.byte	0x1
	.uleb128 0
	.string	"__USER_LABEL_PREFIX__ "
	.byte	0x1
	.uleb128 0
	.string	"__GNUC_STDC_INLINE__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__NO_INLINE__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_BOOL_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_CHAR_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_CHAR16_T_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_CHAR32_T_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_WCHAR_T_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_SHORT_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_INT_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_LONG_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_LLONG_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_TEST_AND_SET_TRUEVAL 1"
	.byte	0x1
	.uleb128 0
	.string	"__GCC_ATOMIC_POINTER_LOCK_FREE 1"
	.byte	0x1
	.uleb128 0
	.string	"__HAVE_SPECULATION_SAFE_VALUE 1"
	.byte	0x1
	.uleb128 0
	.string	"__PRAGMA_REDEFINE_EXTNAME 1"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_WCHAR_T__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_WINT_T__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__SIZEOF_PTRDIFF_T__ 4"
	.byte	0x1
	.uleb128 0
	.string	"__tricore 1"
	.byte	0x1
	.uleb128 0
	.string	"__tricore__ 1"
	.byte	0x1
	.uleb128 0
	.string	"tricore 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TC162__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_CORE__ 0x162"
	.byte	0x1
	.uleb128 0
	.string	"__TC39XX__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_NAME__ 0x3900"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_DIV__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_FTOIZ__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_MOV64__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_POPCNT__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_LHA__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_CRCN__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_SHUFFLE__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_FTOHP__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_HPTOF__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__TRICORE_HAVE_FLOAT16__ 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_NOP 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_LROTATE 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_RROTATE 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_INSERT 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_IMASK 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SWAPW 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SWAPMSKW 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_CMPSWAPW 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SATB 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SATH 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SATBU 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_SATHU 1"
	.byte	0x1
	.uleb128 0
	.string	"__BUILTIN_TRICORE_LDMST 1"
	.byte	0x1
	.uleb128 0
	.string	"__ELF__ 1"
	.byte	0x1
	.uleb128 0
	.string	"TC397XP 1"
	.byte	0x1
	.uleb128 0
	.string	"EKK_PLATFORM_TC397XP 1"
	.byte	0x1
	.uleb128 0
	.string	"JEZGRO_LOCKSTEP_CORES 4"
	.byte	0x1
	.uleb128 0
	.string	"JEZGRO_CLOCK_HZ 300000000"
	.byte	0x1
	.uleb128 0
	.string	"JEZGRO_DEBUG 1"
	.byte	0x1
	.uleb128 0
	.string	"JEZGRO_SAFETY_CHECKS 1"
	.byte	0x1
	.uleb128 0
	.string	"JEZGRO_MULTICORE 1"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._newlib_version.h.4.529115dae5e4f67702b1de0b6e841f38,comdat
.Ldebug_macro3:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x4
	.string	"_NEWLIB_VERSION_H__ 1"
	.byte	0x1
	.uleb128 0x6
	.string	"_NEWLIB_VERSION \"4.2.0\""
	.byte	0x1
	.uleb128 0x7
	.string	"__NEWLIB__ 4"
	.byte	0x1
	.uleb128 0x8
	.string	"__NEWLIB_MINOR__ 2"
	.byte	0x1
	.uleb128 0x9
	.string	"__NEWLIB_PATCHLEVEL__ 0"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.features.h.33.3e67abe6fb64142d4f6fa9496796153c,comdat
.Ldebug_macro4:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x21
	.string	"__GNUC_PREREQ(maj,min) ((__GNUC__ << 16) + __GNUC_MINOR__ >= ((maj) << 16) + (min))"
	.byte	0x1
	.uleb128 0x28
	.string	"__GNUC_PREREQ__(ma,mi) __GNUC_PREREQ(ma, mi)"
	.byte	0x2
	.uleb128 0x83
	.string	"_DEFAULT_SOURCE"
	.byte	0x1
	.uleb128 0x84
	.string	"_DEFAULT_SOURCE 1"
	.byte	0x2
	.uleb128 0x88
	.string	"_POSIX_SOURCE"
	.byte	0x1
	.uleb128 0x89
	.string	"_POSIX_SOURCE 1"
	.byte	0x2
	.uleb128 0x8a
	.string	"_POSIX_C_SOURCE"
	.byte	0x1
	.uleb128 0x8b
	.string	"_POSIX_C_SOURCE 200809L"
	.byte	0x2
	.uleb128 0x9e
	.string	"_ATFILE_SOURCE"
	.byte	0x1
	.uleb128 0x9f
	.string	"_ATFILE_SOURCE 1"
	.byte	0x1
	.uleb128 0xf7
	.string	"__ATFILE_VISIBLE 1"
	.byte	0x1
	.uleb128 0xfd
	.string	"__BSD_VISIBLE 1"
	.byte	0x1
	.uleb128 0x105
	.string	"__GNU_VISIBLE 0"
	.byte	0x1
	.uleb128 0x10a
	.string	"__ISO_C_VISIBLE 2011"
	.byte	0x1
	.uleb128 0x115
	.string	"__LARGEFILE_VISIBLE 0"
	.byte	0x1
	.uleb128 0x119
	.string	"__MISC_VISIBLE 1"
	.byte	0x1
	.uleb128 0x11f
	.string	"__POSIX_VISIBLE 200809"
	.byte	0x1
	.uleb128 0x12f
	.string	"__SVID_VISIBLE 1"
	.byte	0x1
	.uleb128 0x13f
	.string	"__XSI_VISIBLE 0"
	.byte	0x1
	.uleb128 0x14b
	.string	"__SSP_FORTIFY_LEVEL 0"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._default_types.h.15.247e5cd201eca3442cbf5404108c4935,comdat
.Ldebug_macro5:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xf
	.string	"__EXP(x) __ ##x ##__"
	.byte	0x1
	.uleb128 0x1a
	.string	"__have_longlong64 1"
	.byte	0x1
	.uleb128 0x21
	.string	"__have_long32 1"
	.byte	0x1
	.uleb128 0x2f
	.string	"___int8_t_defined 1"
	.byte	0x1
	.uleb128 0x3d
	.string	"___int16_t_defined 1"
	.byte	0x1
	.uleb128 0x53
	.string	"___int32_t_defined 1"
	.byte	0x1
	.uleb128 0x6d
	.string	"___int64_t_defined 1"
	.byte	0x1
	.uleb128 0x8c
	.string	"___int_least8_t_defined 1"
	.byte	0x1
	.uleb128 0xa6
	.string	"___int_least16_t_defined 1"
	.byte	0x1
	.uleb128 0xbc
	.string	"___int_least32_t_defined 1"
	.byte	0x1
	.uleb128 0xce
	.string	"___int_least64_t_defined 1"
	.byte	0x2
	.uleb128 0xf4
	.string	"__EXP"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._intsup.h.10.ecf8113179efbe019c08a29662008891,comdat
.Ldebug_macro6:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xa
	.string	"_SYS__INTSUP_H "
	.byte	0x1
	.uleb128 0x10
	.string	"__STDINT_EXP(x) __ ##x ##__"
	.byte	0x2
	.uleb128 0x2b
	.string	"signed"
	.byte	0x2
	.uleb128 0x2c
	.string	"unsigned"
	.byte	0x2
	.uleb128 0x2d
	.string	"char"
	.byte	0x2
	.uleb128 0x2e
	.string	"short"
	.byte	0x2
	.uleb128 0x2f
	.string	"int"
	.byte	0x2
	.uleb128 0x30
	.string	"__int20"
	.byte	0x2
	.uleb128 0x31
	.string	"__int20__"
	.byte	0x2
	.uleb128 0x32
	.string	"long"
	.byte	0x1
	.uleb128 0x33
	.string	"signed +0"
	.byte	0x1
	.uleb128 0x34
	.string	"unsigned +0"
	.byte	0x1
	.uleb128 0x35
	.string	"char +0"
	.byte	0x1
	.uleb128 0x36
	.string	"short +1"
	.byte	0x1
	.uleb128 0x37
	.string	"__int20 +2"
	.byte	0x1
	.uleb128 0x38
	.string	"__int20__ +2"
	.byte	0x1
	.uleb128 0x39
	.string	"int +2"
	.byte	0x1
	.uleb128 0x3a
	.string	"long +4"
	.byte	0x1
	.uleb128 0x3e
	.string	"_INTPTR_EQ_LONG "
	.byte	0x1
	.uleb128 0x4a
	.string	"_INT32_EQ_LONG "
	.byte	0x1
	.uleb128 0x52
	.string	"__INT8 \"hh\""
	.byte	0x1
	.uleb128 0x5d
	.string	"__INT16 \"h\""
	.byte	0x1
	.uleb128 0x68
	.string	"__INT32 \"l\""
	.byte	0x1
	.uleb128 0x71
	.string	"__INT64 \"ll\""
	.byte	0x1
	.uleb128 0x78
	.string	"__FAST8 "
	.byte	0x1
	.uleb128 0x81
	.string	"__FAST16 "
	.byte	0x1
	.uleb128 0x88
	.string	"__FAST32 "
	.byte	0x1
	.uleb128 0x93
	.string	"__FAST64 \"ll\""
	.byte	0x1
	.uleb128 0x97
	.string	"__LEAST8 \"hh\""
	.byte	0x1
	.uleb128 0xa2
	.string	"__LEAST16 \"h\""
	.byte	0x1
	.uleb128 0xad
	.string	"__LEAST32 \"l\""
	.byte	0x1
	.uleb128 0xb6
	.string	"__LEAST64 \"ll\""
	.byte	0x2
	.uleb128 0xb8
	.string	"signed"
	.byte	0x2
	.uleb128 0xb9
	.string	"unsigned"
	.byte	0x2
	.uleb128 0xba
	.string	"char"
	.byte	0x2
	.uleb128 0xbb
	.string	"short"
	.byte	0x2
	.uleb128 0xbc
	.string	"int"
	.byte	0x2
	.uleb128 0xbd
	.string	"long"
	.byte	0x2
	.uleb128 0xc2
	.string	"__int20"
	.byte	0x2
	.uleb128 0xc3
	.string	"__int20__"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._stdint.h.10.c24fa3af3bc1706662bb5593a907e841,comdat
.Ldebug_macro7:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xa
	.string	"_SYS__STDINT_H "
	.byte	0x1
	.uleb128 0x15
	.string	"_INT8_T_DECLARED "
	.byte	0x1
	.uleb128 0x19
	.string	"_UINT8_T_DECLARED "
	.byte	0x1
	.uleb128 0x1b
	.string	"__int8_t_defined 1"
	.byte	0x1
	.uleb128 0x21
	.string	"_INT16_T_DECLARED "
	.byte	0x1
	.uleb128 0x25
	.string	"_UINT16_T_DECLARED "
	.byte	0x1
	.uleb128 0x27
	.string	"__int16_t_defined 1"
	.byte	0x1
	.uleb128 0x2d
	.string	"_INT32_T_DECLARED "
	.byte	0x1
	.uleb128 0x31
	.string	"_UINT32_T_DECLARED "
	.byte	0x1
	.uleb128 0x33
	.string	"__int32_t_defined 1"
	.byte	0x1
	.uleb128 0x39
	.string	"_INT64_T_DECLARED "
	.byte	0x1
	.uleb128 0x3d
	.string	"_UINT64_T_DECLARED "
	.byte	0x1
	.uleb128 0x3f
	.string	"__int64_t_defined 1"
	.byte	0x1
	.uleb128 0x44
	.string	"_INTMAX_T_DECLARED "
	.byte	0x1
	.uleb128 0x49
	.string	"_UINTMAX_T_DECLARED "
	.byte	0x1
	.uleb128 0x4e
	.string	"_INTPTR_T_DECLARED "
	.byte	0x1
	.uleb128 0x53
	.string	"_UINTPTR_T_DECLARED "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.stdint.h.23.d53047a68f4a85177f80b422d52785ed,comdat
.Ldebug_macro8:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x17
	.string	"__int_least8_t_defined 1"
	.byte	0x1
	.uleb128 0x1d
	.string	"__int_least16_t_defined 1"
	.byte	0x1
	.uleb128 0x23
	.string	"__int_least32_t_defined 1"
	.byte	0x1
	.uleb128 0x29
	.string	"__int_least64_t_defined 1"
	.byte	0x1
	.uleb128 0x35
	.string	"__int_fast8_t_defined 1"
	.byte	0x1
	.uleb128 0x3f
	.string	"__int_fast16_t_defined 1"
	.byte	0x1
	.uleb128 0x49
	.string	"__int_fast32_t_defined 1"
	.byte	0x1
	.uleb128 0x53
	.string	"__int_fast64_t_defined 1"
	.byte	0x1
	.uleb128 0x80
	.string	"INTPTR_MIN (-__INTPTR_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x81
	.string	"INTPTR_MAX (__INTPTR_MAX__)"
	.byte	0x1
	.uleb128 0x82
	.string	"UINTPTR_MAX (__UINTPTR_MAX__)"
	.byte	0x1
	.uleb128 0x98
	.string	"INT8_MIN (-__INT8_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x99
	.string	"INT8_MAX (__INT8_MAX__)"
	.byte	0x1
	.uleb128 0x9a
	.string	"UINT8_MAX (__UINT8_MAX__)"
	.byte	0x1
	.uleb128 0xa2
	.string	"INT_LEAST8_MIN (-__INT_LEAST8_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xa3
	.string	"INT_LEAST8_MAX (__INT_LEAST8_MAX__)"
	.byte	0x1
	.uleb128 0xa4
	.string	"UINT_LEAST8_MAX (__UINT_LEAST8_MAX__)"
	.byte	0x1
	.uleb128 0xae
	.string	"INT16_MIN (-__INT16_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xaf
	.string	"INT16_MAX (__INT16_MAX__)"
	.byte	0x1
	.uleb128 0xb0
	.string	"UINT16_MAX (__UINT16_MAX__)"
	.byte	0x1
	.uleb128 0xb8
	.string	"INT_LEAST16_MIN (-__INT_LEAST16_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xb9
	.string	"INT_LEAST16_MAX (__INT_LEAST16_MAX__)"
	.byte	0x1
	.uleb128 0xba
	.string	"UINT_LEAST16_MAX (__UINT_LEAST16_MAX__)"
	.byte	0x1
	.uleb128 0xc4
	.string	"INT32_MIN (-__INT32_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xc5
	.string	"INT32_MAX (__INT32_MAX__)"
	.byte	0x1
	.uleb128 0xc6
	.string	"UINT32_MAX (__UINT32_MAX__)"
	.byte	0x1
	.uleb128 0xd4
	.string	"INT_LEAST32_MIN (-__INT_LEAST32_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xd5
	.string	"INT_LEAST32_MAX (__INT_LEAST32_MAX__)"
	.byte	0x1
	.uleb128 0xd6
	.string	"UINT_LEAST32_MAX (__UINT_LEAST32_MAX__)"
	.byte	0x1
	.uleb128 0xe6
	.string	"INT64_MIN (-__INT64_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xe7
	.string	"INT64_MAX (__INT64_MAX__)"
	.byte	0x1
	.uleb128 0xe8
	.string	"UINT64_MAX (__UINT64_MAX__)"
	.byte	0x1
	.uleb128 0xf6
	.string	"INT_LEAST64_MIN (-__INT_LEAST64_MAX__ - 1)"
	.byte	0x1
	.uleb128 0xf7
	.string	"INT_LEAST64_MAX (__INT_LEAST64_MAX__)"
	.byte	0x1
	.uleb128 0xf8
	.string	"UINT_LEAST64_MAX (__UINT_LEAST64_MAX__)"
	.byte	0x1
	.uleb128 0x106
	.string	"INT_FAST8_MIN (-__INT_FAST8_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x107
	.string	"INT_FAST8_MAX (__INT_FAST8_MAX__)"
	.byte	0x1
	.uleb128 0x108
	.string	"UINT_FAST8_MAX (__UINT_FAST8_MAX__)"
	.byte	0x1
	.uleb128 0x116
	.string	"INT_FAST16_MIN (-__INT_FAST16_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x117
	.string	"INT_FAST16_MAX (__INT_FAST16_MAX__)"
	.byte	0x1
	.uleb128 0x118
	.string	"UINT_FAST16_MAX (__UINT_FAST16_MAX__)"
	.byte	0x1
	.uleb128 0x126
	.string	"INT_FAST32_MIN (-__INT_FAST32_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x127
	.string	"INT_FAST32_MAX (__INT_FAST32_MAX__)"
	.byte	0x1
	.uleb128 0x128
	.string	"UINT_FAST32_MAX (__UINT_FAST32_MAX__)"
	.byte	0x1
	.uleb128 0x136
	.string	"INT_FAST64_MIN (-__INT_FAST64_MAX__ - 1)"
	.byte	0x1
	.uleb128 0x137
	.string	"INT_FAST64_MAX (__INT_FAST64_MAX__)"
	.byte	0x1
	.uleb128 0x138
	.string	"UINT_FAST64_MAX (__UINT_FAST64_MAX__)"
	.byte	0x1
	.uleb128 0x146
	.string	"INTMAX_MAX (__INTMAX_MAX__)"
	.byte	0x1
	.uleb128 0x147
	.string	"INTMAX_MIN (-INTMAX_MAX - 1)"
	.byte	0x1
	.uleb128 0x14f
	.string	"UINTMAX_MAX (__UINTMAX_MAX__)"
	.byte	0x1
	.uleb128 0x157
	.string	"SIZE_MAX (__SIZE_MAX__)"
	.byte	0x1
	.uleb128 0x15d
	.string	"SIG_ATOMIC_MIN (-__STDINT_EXP(INT_MAX) - 1)"
	.byte	0x1
	.uleb128 0x15e
	.string	"SIG_ATOMIC_MAX (__STDINT_EXP(INT_MAX))"
	.byte	0x1
	.uleb128 0x162
	.string	"PTRDIFF_MAX (__PTRDIFF_MAX__)"
	.byte	0x1
	.uleb128 0x166
	.string	"PTRDIFF_MIN (-PTRDIFF_MAX - 1)"
	.byte	0x1
	.uleb128 0x16b
	.string	"WCHAR_MIN (__WCHAR_MIN__)"
	.byte	0x1
	.uleb128 0x176
	.string	"WCHAR_MAX (__WCHAR_MAX__)"
	.byte	0x1
	.uleb128 0x180
	.string	"WINT_MAX (__WINT_MAX__)"
	.byte	0x1
	.uleb128 0x185
	.string	"WINT_MIN (__WINT_MIN__)"
	.byte	0x1
	.uleb128 0x18c
	.string	"INT8_C(x) __INT8_C(x)"
	.byte	0x1
	.uleb128 0x18d
	.string	"UINT8_C(x) __UINT8_C(x)"
	.byte	0x1
	.uleb128 0x198
	.string	"INT16_C(x) __INT16_C(x)"
	.byte	0x1
	.uleb128 0x199
	.string	"UINT16_C(x) __UINT16_C(x)"
	.byte	0x1
	.uleb128 0x1a4
	.string	"INT32_C(x) __INT32_C(x)"
	.byte	0x1
	.uleb128 0x1a5
	.string	"UINT32_C(x) __UINT32_C(x)"
	.byte	0x1
	.uleb128 0x1b1
	.string	"INT64_C(x) __INT64_C(x)"
	.byte	0x1
	.uleb128 0x1b2
	.string	"UINT64_C(x) __UINT64_C(x)"
	.byte	0x1
	.uleb128 0x1c1
	.string	"INTMAX_C(x) __INTMAX_C(x)"
	.byte	0x1
	.uleb128 0x1c2
	.string	"UINTMAX_C(x) __UINTMAX_C(x)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.stdbool.h.29.c08aa3eec75cf5b9b5003883f43253f0,comdat
.Ldebug_macro9:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1d
	.string	"_STDBOOL_H "
	.byte	0x1
	.uleb128 0x24
	.string	"bool _Bool"
	.byte	0x1
	.uleb128 0x25
	.string	"true 1"
	.byte	0x1
	.uleb128 0x26
	.string	"false 0"
	.byte	0x1
	.uleb128 0x31
	.string	"__bool_true_false_are_defined 1"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.config.h.9.65ea8012783d97f71c724c54677f7958,comdat
.Ldebug_macro10:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x9
	.string	"EKK_CONFIG_H "
	.byte	0x1
	.uleb128 0xf
	.string	"EKK_VERSION_MAJOR 1"
	.byte	0x1
	.uleb128 0x10
	.string	"EKK_VERSION_MINOR 0"
	.byte	0x1
	.uleb128 0x11
	.string	"EKK_VERSION_PATCH 0"
	.byte	0x1
	.uleb128 0x12
	.string	"EKK_VERSION_STRING \"1.0.0\""
	.byte	0x1
	.uleb128 0x19
	.string	"EKK_MAX_CORES 6"
	.byte	0x1
	.uleb128 0x1c
	.string	"EKK_MAX_TASKS_PER_CORE 16"
	.byte	0x1
	.uleb128 0x1f
	.string	"EKK_MAX_TASKS (EKK_MAX_CORES * EKK_MAX_TASKS_PER_CORE)"
	.byte	0x1
	.uleb128 0x22
	.string	"EKK_DEFAULT_STACK_SIZE 2048"
	.byte	0x1
	.uleb128 0x25
	.string	"EKK_MIN_STACK_SIZE 512"
	.byte	0x1
	.uleb128 0x28
	.string	"EKK_TICK_FREQ_HZ 1000"
	.byte	0x1
	.uleb128 0x2b
	.string	"EKK_TICK_PERIOD_US (1000000 / EKK_TICK_FREQ_HZ)"
	.byte	0x1
	.uleb128 0x32
	.string	"EKK_MAX_QUEUES 16"
	.byte	0x1
	.uleb128 0x35
	.string	"EKK_MAX_MAILBOXES 8"
	.byte	0x1
	.uleb128 0x38
	.string	"EKK_MAX_MSG_SIZE 64"
	.byte	0x1
	.uleb128 0x3f
	.string	"EKK_MAX_MUTEXES 16"
	.byte	0x1
	.uleb128 0x42
	.string	"EKK_MAX_SEMAPHORES 32"
	.byte	0x1
	.uleb128 0x49
	.string	"EKK_USE_EDF 1"
	.byte	0x1
	.uleb128 0x4c
	.string	"EKK_TRACK_TIME 1"
	.byte	0x1
	.uleb128 0x4f
	.string	"EKK_CHECK_DEADLINE 1"
	.byte	0x1
	.uleb128 0x52
	.string	"EKK_DEBUG 1"
	.byte	0x1
	.uleb128 0x5a
	.string	"EKK_MULTI_CORE 1"
	.byte	0x1
	.uleb128 0x60
	.string	"EKK_MAX_PRIORITY 255"
	.byte	0x1
	.uleb128 0x63
	.string	"EKK_PRIORITY_IDLE 0"
	.byte	0x1
	.uleb128 0x66
	.string	"EKK_PRIORITY_KERNEL 255"
	.byte	0x1
	.uleb128 0x69
	.string	"EKK_TASK_NAME_LEN 16"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tc397xp_regs.h.12.7ebc7cba7d7679de71bd85a3ac13c650,comdat
.Ldebug_macro11:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xc
	.string	"TC397XP_REGS_H "
	.byte	0x1
	.uleb128 0x1f
	.string	"SCU_BASE 0xF0036000UL"
	.byte	0x1
	.uleb128 0x22
	.string	"CCU_BASE 0xF0036100UL"
	.byte	0x1
	.uleb128 0x25
	.string	"PMC_BASE 0xF0036200UL"
	.byte	0x1
	.uleb128 0x28
	.string	"STM0_BASE 0xF0001000UL"
	.byte	0x1
	.uleb128 0x29
	.string	"STM1_BASE 0xF0001100UL"
	.byte	0x1
	.uleb128 0x2a
	.string	"STM2_BASE 0xF0001200UL"
	.byte	0x1
	.uleb128 0x2b
	.string	"STM3_BASE 0xF0001300UL"
	.byte	0x1
	.uleb128 0x2c
	.string	"STM4_BASE 0xF0001400UL"
	.byte	0x1
	.uleb128 0x2d
	.string	"STM5_BASE 0xF0001500UL"
	.byte	0x1
	.uleb128 0x30
	.string	"ASCLIN0_BASE 0xF0000600UL"
	.byte	0x1
	.uleb128 0x31
	.string	"ASCLIN1_BASE 0xF0000700UL"
	.byte	0x1
	.uleb128 0x32
	.string	"ASCLIN2_BASE 0xF0000800UL"
	.byte	0x1
	.uleb128 0x33
	.string	"ASCLIN3_BASE 0xF0000900UL"
	.byte	0x1
	.uleb128 0x37
	.string	"CAN0_BASE 0xF0200000UL"
	.byte	0x1
	.uleb128 0x38
	.string	"CAN1_BASE 0xF0210000UL"
	.byte	0x1
	.uleb128 0x39
	.string	"CAN2_BASE 0xF0220000UL"
	.byte	0x1
	.uleb128 0x3d
	.string	"PORT00_BASE 0xF003A000UL"
	.byte	0x1
	.uleb128 0x3e
	.string	"PORT01_BASE 0xF003A100UL"
	.byte	0x1
	.uleb128 0x3f
	.string	"PORT02_BASE 0xF003A200UL"
	.byte	0x1
	.uleb128 0x43
	.string	"IR_BASE 0xF0038000UL"
	.byte	0x1
	.uleb128 0x46
	.string	"SRC_BASE 0xF0038000UL"
	.byte	0x1
	.uleb128 0x49
	.string	"WDT_BASE 0xF0036300UL"
	.byte	0x1
	.uleb128 0x57
	.string	"SCU_ID 0x008"
	.byte	0x1
	.uleb128 0x58
	.string	"SCU_OSCCON 0x010"
	.byte	0x1
	.uleb128 0x59
	.string	"SCU_PLLSTAT 0x014"
	.byte	0x1
	.uleb128 0x5a
	.string	"SCU_PLLCON0 0x018"
	.byte	0x1
	.uleb128 0x5b
	.string	"SCU_PLLCON1 0x01C"
	.byte	0x1
	.uleb128 0x5c
	.string	"SCU_PLLCON2 0x020"
	.byte	0x1
	.uleb128 0x5d
	.string	"SCU_PLLERAYSTAT 0x024"
	.byte	0x1
	.uleb128 0x5e
	.string	"SCU_PLLERAYCON0 0x028"
	.byte	0x1
	.uleb128 0x5f
	.string	"SCU_PLLERAYCON1 0x02C"
	.byte	0x1
	.uleb128 0x60
	.string	"SCU_CCUCON0 0x030"
	.byte	0x1
	.uleb128 0x61
	.string	"SCU_CCUCON1 0x034"
	.byte	0x1
	.uleb128 0x62
	.string	"SCU_CCUCON2 0x040"
	.byte	0x1
	.uleb128 0x63
	.string	"SCU_CCUCON5 0x04C"
	.byte	0x1
	.uleb128 0x64
	.string	"SCU_RSTSTAT 0x050"
	.byte	0x1
	.uleb128 0x65
	.string	"SCU_RSTCON 0x058"
	.byte	0x1
	.uleb128 0x66
	.string	"SCU_SWRSTCON 0x060"
	.byte	0x1
	.uleb128 0x67
	.string	"SCU_RSTCON2 0x064"
	.byte	0x1
	.uleb128 0x68
	.string	"SCU_EVRRSTCON 0x070"
	.byte	0x1
	.uleb128 0x6b
	.string	"SCU_CPU0_BASE 0xF0036400UL"
	.byte	0x1
	.uleb128 0x6c
	.string	"SCU_CPU_OFFSET 0x100"
	.byte	0x1
	.uleb128 0x6f
	.string	"SCU_CPUx_CLC 0x000"
	.byte	0x1
	.uleb128 0x70
	.string	"SCU_CPUx_STAT 0x004"
	.byte	0x1
	.uleb128 0x71
	.string	"SCU_CPUx_CCTRL0 0x020"
	.byte	0x1
	.uleb128 0x74
	.string	"SCU_PLLSTAT_VCOLOCK (1U << 2)"
	.byte	0x1
	.uleb128 0x75
	.string	"SCU_PLLSTAT_FINDIS (1U << 3)"
	.byte	0x1
	.uleb128 0x76
	.string	"SCU_PLLSTAT_K1RDY (1U << 4)"
	.byte	0x1
	.uleb128 0x77
	.string	"SCU_PLLSTAT_K2RDY (1U << 5)"
	.byte	0x1
	.uleb128 0x7a
	.string	"SCU_CCUCON0_CLKSEL_MASK 0x30000000"
	.byte	0x1
	.uleb128 0x7b
	.string	"SCU_CCUCON0_CLKSEL_BACKUP 0x00000000"
	.byte	0x1
	.uleb128 0x7c
	.string	"SCU_CCUCON0_CLKSEL_PLL 0x10000000"
	.byte	0x1
	.uleb128 0x8a
	.string	"STM_CLC 0x000"
	.byte	0x1
	.uleb128 0x8b
	.string	"STM_ID 0x008"
	.byte	0x1
	.uleb128 0x8c
	.string	"STM_TIM0 0x010"
	.byte	0x1
	.uleb128 0x8d
	.string	"STM_TIM1 0x014"
	.byte	0x1
	.uleb128 0x8e
	.string	"STM_TIM2 0x018"
	.byte	0x1
	.uleb128 0x8f
	.string	"STM_TIM3 0x01C"
	.byte	0x1
	.uleb128 0x90
	.string	"STM_TIM4 0x020"
	.byte	0x1
	.uleb128 0x91
	.string	"STM_TIM5 0x024"
	.byte	0x1
	.uleb128 0x92
	.string	"STM_TIM6 0x028"
	.byte	0x1
	.uleb128 0x93
	.string	"STM_CAP 0x02C"
	.byte	0x1
	.uleb128 0x94
	.string	"STM_CMP0 0x030"
	.byte	0x1
	.uleb128 0x95
	.string	"STM_CMP1 0x034"
	.byte	0x1
	.uleb128 0x96
	.string	"STM_CMCON 0x038"
	.byte	0x1
	.uleb128 0x97
	.string	"STM_ICR 0x03C"
	.byte	0x1
	.uleb128 0x98
	.string	"STM_ISCR 0x040"
	.byte	0x1
	.uleb128 0x99
	.string	"STM_OCS 0x0E8"
	.byte	0x1
	.uleb128 0x9a
	.string	"STM_KRSTCLR 0x0EC"
	.byte	0x1
	.uleb128 0x9b
	.string	"STM_KRST1 0x0F0"
	.byte	0x1
	.uleb128 0x9c
	.string	"STM_KRST0 0x0F4"
	.byte	0x1
	.uleb128 0x9d
	.string	"STM_ACCEN1 0x0F8"
	.byte	0x1
	.uleb128 0x9e
	.string	"STM_ACCEN0 0x0FC"
	.byte	0x1
	.uleb128 0xa1
	.string	"STM_ICR_CMP0EN (1U << 0)"
	.byte	0x1
	.uleb128 0xa2
	.string	"STM_ICR_CMP0IR (1U << 1)"
	.byte	0x1
	.uleb128 0xa3
	.string	"STM_ICR_CMP0OS (1U << 2)"
	.byte	0x1
	.uleb128 0xa4
	.string	"STM_ICR_CMP1EN (1U << 4)"
	.byte	0x1
	.uleb128 0xa5
	.string	"STM_ICR_CMP1IR (1U << 5)"
	.byte	0x1
	.uleb128 0xa6
	.string	"STM_ICR_CMP1OS (1U << 6)"
	.byte	0x1
	.uleb128 0xa9
	.string	"STM_ISCR_CMP0IRR (1U << 0)"
	.byte	0x1
	.uleb128 0xaa
	.string	"STM_ISCR_CMP0IRS (1U << 1)"
	.byte	0x1
	.uleb128 0xab
	.string	"STM_ISCR_CMP1IRR (1U << 2)"
	.byte	0x1
	.uleb128 0xac
	.string	"STM_ISCR_CMP1IRS (1U << 3)"
	.byte	0x1
	.uleb128 0xaf
	.string	"STM_CMCON_MSIZE0_MASK 0x0000001F"
	.byte	0x1
	.uleb128 0xb0
	.string	"STM_CMCON_MSTART0_MASK 0x00001F00"
	.byte	0x1
	.uleb128 0xb1
	.string	"STM_CMCON_MSIZE1_MASK 0x001F0000"
	.byte	0x1
	.uleb128 0xb2
	.string	"STM_CMCON_MSTART1_MASK 0x1F000000"
	.byte	0x1
	.uleb128 0xb3
	.string	"STM_CMCON_MSIZE0(x) ((x) & 0x1F)"
	.byte	0x1
	.uleb128 0xb4
	.string	"STM_CMCON_MSTART0(x) (((x) & 0x1F) << 8)"
	.byte	0x1
	.uleb128 0xb5
	.string	"STM_CMCON_MSIZE1(x) (((x) & 0x1F) << 16)"
	.byte	0x1
	.uleb128 0xb6
	.string	"STM_CMCON_MSTART1(x) (((x) & 0x1F) << 24)"
	.byte	0x1
	.uleb128 0xc4
	.string	"ASCLIN_CLC 0x000"
	.byte	0x1
	.uleb128 0xc5
	.string	"ASCLIN_IOCR 0x004"
	.byte	0x1
	.uleb128 0xc6
	.string	"ASCLIN_ID 0x008"
	.byte	0x1
	.uleb128 0xc7
	.string	"ASCLIN_TXFIFOCON 0x00C"
	.byte	0x1
	.uleb128 0xc8
	.string	"ASCLIN_RXFIFOCON 0x010"
	.byte	0x1
	.uleb128 0xc9
	.string	"ASCLIN_BITCON 0x014"
	.byte	0x1
	.uleb128 0xca
	.string	"ASCLIN_FRAMECON 0x018"
	.byte	0x1
	.uleb128 0xcb
	.string	"ASCLIN_DATCON 0x01C"
	.byte	0x1
	.uleb128 0xcc
	.string	"ASCLIN_BRG 0x020"
	.byte	0x1
	.uleb128 0xcd
	.string	"ASCLIN_BRD 0x024"
	.byte	0x1
	.uleb128 0xce
	.string	"ASCLIN_LIN_CON 0x028"
	.byte	0x1
	.uleb128 0xcf
	.string	"ASCLIN_LIN_BTIMER 0x02C"
	.byte	0x1
	.uleb128 0xd0
	.string	"ASCLIN_LIN_HTIMER 0x030"
	.byte	0x1
	.uleb128 0xd1
	.string	"ASCLIN_FLAGS 0x034"
	.byte	0x1
	.uleb128 0xd2
	.string	"ASCLIN_FLAGSSET 0x038"
	.byte	0x1
	.uleb128 0xd3
	.string	"ASCLIN_FLAGSCLEAR 0x03C"
	.byte	0x1
	.uleb128 0xd4
	.string	"ASCLIN_FLAGSENABLE 0x040"
	.byte	0x1
	.uleb128 0xd5
	.string	"ASCLIN_TXDATA 0x044"
	.byte	0x1
	.uleb128 0xd6
	.string	"ASCLIN_RXDATA 0x048"
	.byte	0x1
	.uleb128 0xd7
	.string	"ASCLIN_CSR 0x04C"
	.byte	0x1
	.uleb128 0xda
	.string	"ASCLIN_CSR_CLKSEL_NOCLK 0"
	.byte	0x1
	.uleb128 0xdb
	.string	"ASCLIN_CSR_CLKSEL_CLC 1"
	.byte	0x1
	.uleb128 0xdc
	.string	"ASCLIN_CSR_CLKSEL_EVROSC 2"
	.byte	0x1
	.uleb128 0xdd
	.string	"ASCLIN_CSR_CLKSEL_FMAX 4"
	.byte	0x1
	.uleb128 0xde
	.string	"ASCLIN_CSR_CLKSEL_FSOURCE 8"
	.byte	0x1
	.uleb128 0xe1
	.string	"ASCLIN_FLAGS_TH (1U << 0)"
	.byte	0x1
	.uleb128 0xe2
	.string	"ASCLIN_FLAGS_TR (1U << 1)"
	.byte	0x1
	.uleb128 0xe3
	.string	"ASCLIN_FLAGS_RH (1U << 2)"
	.byte	0x1
	.uleb128 0xe4
	.string	"ASCLIN_FLAGS_RR (1U << 3)"
	.byte	0x1
	.uleb128 0xe5
	.string	"ASCLIN_FLAGS_FE (1U << 16)"
	.byte	0x1
	.uleb128 0xe6
	.string	"ASCLIN_FLAGS_HT (1U << 17)"
	.byte	0x1
	.uleb128 0xe7
	.string	"ASCLIN_FLAGS_RT (1U << 18)"
	.byte	0x1
	.uleb128 0xe8
	.string	"ASCLIN_FLAGS_TFL (1U << 23)"
	.byte	0x1
	.uleb128 0xe9
	.string	"ASCLIN_FLAGS_RFL (1U << 24)"
	.byte	0x1
	.uleb128 0xea
	.string	"ASCLIN_FLAGS_TC (1U << 25)"
	.byte	0x1
	.uleb128 0xed
	.string	"ASCLIN_FRAMECON_MODE_MASK 0x00030000"
	.byte	0x1
	.uleb128 0xee
	.string	"ASCLIN_FRAMECON_MODE_INIT 0x00000000"
	.byte	0x1
	.uleb128 0xef
	.string	"ASCLIN_FRAMECON_MODE_ASC 0x00010000"
	.byte	0x1
	.uleb128 0xf0
	.string	"ASCLIN_FRAMECON_MODE_SPI 0x00020000"
	.byte	0x1
	.uleb128 0xf1
	.string	"ASCLIN_FRAMECON_MODE_LIN 0x00030000"
	.byte	0x1
	.uleb128 0xf2
	.string	"ASCLIN_FRAMECON_STOP_MASK 0x00000700"
	.byte	0x1
	.uleb128 0xf3
	.string	"ASCLIN_FRAMECON_STOP_1 0x00000100"
	.byte	0x1
	.uleb128 0xf4
	.string	"ASCLIN_FRAMECON_STOP_2 0x00000200"
	.byte	0x1
	.uleb128 0xf7
	.string	"ASCLIN_DATCON_DATLEN_MASK 0x0000000F"
	.byte	0x1
	.uleb128 0xfa
	.string	"ASCLIN_TXFIFOCON_FLUSH (1U << 0)"
	.byte	0x1
	.uleb128 0xfb
	.string	"ASCLIN_TXFIFOCON_ENO (1U << 1)"
	.byte	0x1
	.uleb128 0xfc
	.string	"ASCLIN_TXFIFOCON_INTLEVEL_MASK 0x00003F00"
	.byte	0x1
	.uleb128 0xff
	.string	"ASCLIN_RXFIFOCON_FLUSH (1U << 0)"
	.byte	0x1
	.uleb128 0x100
	.string	"ASCLIN_RXFIFOCON_ENI (1U << 1)"
	.byte	0x1
	.uleb128 0x101
	.string	"ASCLIN_RXFIFOCON_INTLEVEL_MASK 0x00003F00"
	.byte	0x1
	.uleb128 0x10f
	.string	"CAN_CLC 0x000"
	.byte	0x1
	.uleb128 0x110
	.string	"CAN_ID 0x008"
	.byte	0x1
	.uleb128 0x111
	.string	"CAN_MCR 0x00C"
	.byte	0x1
	.uleb128 0x114
	.string	"CAN_N_CR 0x200"
	.byte	0x1
	.uleb128 0x115
	.string	"CAN_N_SR 0x204"
	.byte	0x1
	.uleb128 0x116
	.string	"CAN_N_IR 0x208"
	.byte	0x1
	.uleb128 0x117
	.string	"CAN_N_IE 0x20C"
	.byte	0x1
	.uleb128 0x118
	.string	"CAN_N_BTR 0x218"
	.byte	0x1
	.uleb128 0x119
	.string	"CAN_N_FBTR 0x21C"
	.byte	0x1
	.uleb128 0x11a
	.string	"CAN_N_TDCR 0x248"
	.byte	0x1
	.uleb128 0x11d
	.string	"CAN_N_SIDFC 0x284"
	.byte	0x1
	.uleb128 0x11e
	.string	"CAN_N_XIDFC 0x288"
	.byte	0x1
	.uleb128 0x11f
	.string	"CAN_N_XIDAM 0x290"
	.byte	0x1
	.uleb128 0x120
	.string	"CAN_N_HPMS 0x294"
	.byte	0x1
	.uleb128 0x121
	.string	"CAN_N_RXF0C 0x2A0"
	.byte	0x1
	.uleb128 0x122
	.string	"CAN_N_RXF0S 0x2A4"
	.byte	0x1
	.uleb128 0x123
	.string	"CAN_N_RXF0A 0x2A8"
	.byte	0x1
	.uleb128 0x124
	.string	"CAN_N_RXF1C 0x2B0"
	.byte	0x1
	.uleb128 0x125
	.string	"CAN_N_RXF1S 0x2B4"
	.byte	0x1
	.uleb128 0x126
	.string	"CAN_N_RXF1A 0x2B8"
	.byte	0x1
	.uleb128 0x127
	.string	"CAN_N_TXBC 0x2C0"
	.byte	0x1
	.uleb128 0x128
	.string	"CAN_N_TXFQS 0x2C4"
	.byte	0x1
	.uleb128 0x129
	.string	"CAN_N_TXBRP 0x2C8"
	.byte	0x1
	.uleb128 0x12a
	.string	"CAN_N_TXBAR 0x2CC"
	.byte	0x1
	.uleb128 0x12b
	.string	"CAN_N_TXBCR 0x2D0"
	.byte	0x1
	.uleb128 0x12c
	.string	"CAN_N_TXBTO 0x2D4"
	.byte	0x1
	.uleb128 0x12d
	.string	"CAN_N_TXBCF 0x2D8"
	.byte	0x1
	.uleb128 0x12e
	.string	"CAN_N_TXBTIE 0x2DC"
	.byte	0x1
	.uleb128 0x12f
	.string	"CAN_N_TXBCIE 0x2E0"
	.byte	0x1
	.uleb128 0x130
	.string	"CAN_N_TXESC 0x2C8"
	.byte	0x1
	.uleb128 0x131
	.string	"CAN_N_RXESC 0x2BC"
	.byte	0x1
	.uleb128 0x13f
	.string	"PORT_OUT 0x000"
	.byte	0x1
	.uleb128 0x140
	.string	"PORT_OMR 0x004"
	.byte	0x1
	.uleb128 0x141
	.string	"PORT_IOCR0 0x010"
	.byte	0x1
	.uleb128 0x142
	.string	"PORT_IOCR4 0x014"
	.byte	0x1
	.uleb128 0x143
	.string	"PORT_IOCR8 0x018"
	.byte	0x1
	.uleb128 0x144
	.string	"PORT_IOCR12 0x01C"
	.byte	0x1
	.uleb128 0x145
	.string	"PORT_IN 0x024"
	.byte	0x1
	.uleb128 0x146
	.string	"PORT_PDR0 0x040"
	.byte	0x1
	.uleb128 0x147
	.string	"PORT_PDR1 0x044"
	.byte	0x1
	.uleb128 0x148
	.string	"PORT_ESR 0x050"
	.byte	0x1
	.uleb128 0x14b
	.string	"PORT_IOCR_PC_INPUT 0x00"
	.byte	0x1
	.uleb128 0x14c
	.string	"PORT_IOCR_PC_INPUT_PULLDOWN 0x01"
	.byte	0x1
	.uleb128 0x14d
	.string	"PORT_IOCR_PC_INPUT_PULLUP 0x02"
	.byte	0x1
	.uleb128 0x14e
	.string	"PORT_IOCR_PC_OUTPUT_PUSHPULL 0x10"
	.byte	0x1
	.uleb128 0x14f
	.string	"PORT_IOCR_PC_OUTPUT_OPENDRAIN 0x18"
	.byte	0x1
	.uleb128 0x150
	.string	"PORT_IOCR_PC_ALT1 0x11"
	.byte	0x1
	.uleb128 0x151
	.string	"PORT_IOCR_PC_ALT2 0x12"
	.byte	0x1
	.uleb128 0x152
	.string	"PORT_IOCR_PC_ALT3 0x13"
	.byte	0x1
	.uleb128 0x153
	.string	"PORT_IOCR_PC_ALT4 0x14"
	.byte	0x1
	.uleb128 0x154
	.string	"PORT_IOCR_PC_ALT5 0x15"
	.byte	0x1
	.uleb128 0x155
	.string	"PORT_IOCR_PC_ALT6 0x16"
	.byte	0x1
	.uleb128 0x156
	.string	"PORT_IOCR_PC_ALT7 0x17"
	.byte	0x1
	.uleb128 0x164
	.string	"SRC_STM0SR0 (SRC_BASE + 0x490)"
	.byte	0x1
	.uleb128 0x165
	.string	"SRC_STM0SR1 (SRC_BASE + 0x494)"
	.byte	0x1
	.uleb128 0x166
	.string	"SRC_ASCLIN0TX (SRC_BASE + 0x040)"
	.byte	0x1
	.uleb128 0x167
	.string	"SRC_ASCLIN0RX (SRC_BASE + 0x044)"
	.byte	0x1
	.uleb128 0x168
	.string	"SRC_ASCLIN0ERR (SRC_BASE + 0x048)"
	.byte	0x1
	.uleb128 0x16b
	.string	"SRC_GPSR_BASE (SRC_BASE + 0x990)"
	.byte	0x1
	.uleb128 0x16c
	.string	"SRC_GPSR(core,sr) (SRC_GPSR_BASE + ((core) * 0x10) + ((sr) * 0x04))"
	.byte	0x1
	.uleb128 0x16f
	.string	"SRC_SRPN_MASK 0x000000FF"
	.byte	0x1
	.uleb128 0x170
	.string	"SRC_SRE (1U << 10)"
	.byte	0x1
	.uleb128 0x171
	.string	"SRC_TOS_MASK 0x00001800"
	.byte	0x1
	.uleb128 0x172
	.string	"SRC_TOS_CPU0 0x00000000"
	.byte	0x1
	.uleb128 0x173
	.string	"SRC_TOS_CPU1 0x00000800"
	.byte	0x1
	.uleb128 0x174
	.string	"SRC_TOS_CPU2 0x00001000"
	.byte	0x1
	.uleb128 0x175
	.string	"SRC_TOS_DMA 0x00001800"
	.byte	0x1
	.uleb128 0x176
	.string	"SRC_SRR (1U << 24)"
	.byte	0x1
	.uleb128 0x177
	.string	"SRC_CLRR (1U << 25)"
	.byte	0x1
	.uleb128 0x178
	.string	"SRC_SETR (1U << 26)"
	.byte	0x1
	.uleb128 0x179
	.string	"SRC_IOV (1U << 27)"
	.byte	0x1
	.uleb128 0x17a
	.string	"SRC_IOVCLR (1U << 28)"
	.byte	0x1
	.uleb128 0x17b
	.string	"SRC_SWS (1U << 29)"
	.byte	0x1
	.uleb128 0x17c
	.string	"SRC_SWSCLR (1U << 30)"
	.byte	0x1
	.uleb128 0x189
	.string	"REG32(addr) (*(volatile uint32_t *)(addr))"
	.byte	0x1
	.uleb128 0x18a
	.string	"REG16(addr) (*(volatile uint16_t *)(addr))"
	.byte	0x1
	.uleb128 0x18b
	.string	"REG8(addr) (*(volatile uint8_t *)(addr))"
	.byte	0x1
	.uleb128 0x18d
	.string	"REG_READ32(addr) REG32(addr)"
	.byte	0x1
	.uleb128 0x18e
	.string	"REG_WRITE32(addr,val) do { REG32(addr) = (val); } while(0)"
	.byte	0x1
	.uleb128 0x190
	.string	"REG_SET32(addr,bits) do { REG32(addr) |= (bits); } while(0)"
	.byte	0x1
	.uleb128 0x191
	.string	"REG_CLR32(addr,bits) do { REG32(addr) &= ~(bits); } while(0)"
	.byte	0x1
	.uleb128 0x192
	.string	"REG_MOD32(addr,mask,val) do { REG32(addr) = (REG32(addr) & ~(mask)) | ((val) & (mask)); } while(0)"
	.byte	0x1
	.uleb128 0x1a2
	.string	"SCU_WDTCPU0_CON0 (SCU_BASE + 0x100)"
	.byte	0x1
	.uleb128 0x1a3
	.string	"SCU_WDTCPU0_CON1 (SCU_BASE + 0x104)"
	.byte	0x1
	.uleb128 0x1a4
	.string	"SCU_WDTCPU1_CON0 (SCU_BASE + 0x10C)"
	.byte	0x1
	.uleb128 0x1a5
	.string	"SCU_WDTCPU1_CON1 (SCU_BASE + 0x110)"
	.byte	0x1
	.uleb128 0x1a6
	.string	"SCU_WDTCPU2_CON0 (SCU_BASE + 0x118)"
	.byte	0x1
	.uleb128 0x1a7
	.string	"SCU_WDTCPU2_CON1 (SCU_BASE + 0x11C)"
	.byte	0x1
	.uleb128 0x1a8
	.string	"SCU_WDTCPU3_CON0 (SCU_BASE + 0x124)"
	.byte	0x1
	.uleb128 0x1a9
	.string	"SCU_WDTCPU3_CON1 (SCU_BASE + 0x128)"
	.byte	0x1
	.uleb128 0x1aa
	.string	"SCU_WDTCPU4_CON0 (SCU_BASE + 0x130)"
	.byte	0x1
	.uleb128 0x1ab
	.string	"SCU_WDTCPU4_CON1 (SCU_BASE + 0x134)"
	.byte	0x1
	.uleb128 0x1ac
	.string	"SCU_WDTCPU5_CON0 (SCU_BASE + 0x13C)"
	.byte	0x1
	.uleb128 0x1ad
	.string	"SCU_WDTCPU5_CON1 (SCU_BASE + 0x140)"
	.byte	0x1
	.uleb128 0x1b0
	.string	"SCU_WDTCPU0CON0 SCU_WDTCPU0_CON0"
	.byte	0x1
	.uleb128 0x1b3
	.string	"ENDINIT_UNLOCK() "
	.byte	0x1
	.uleb128 0x1b4
	.string	"ENDINIT_LOCK() "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tc397xp_sfr.h.12.3f453f758283a02fe3fa193077bd3146,comdat
.Ldebug_macro12:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xc
	.string	"TC397XP_SFR_H "
	.byte	0x1
	.uleb128 0x20
	.string	"CSFR_PCXI 0xFE00"
	.byte	0x1
	.uleb128 0x21
	.string	"CSFR_PSW 0xFE04"
	.byte	0x1
	.uleb128 0x22
	.string	"CSFR_PC 0xFE08"
	.byte	0x1
	.uleb128 0x27
	.string	"CSFR_SYSCON 0xFE14"
	.byte	0x1
	.uleb128 0x28
	.string	"CSFR_CPU_ID 0xFE18"
	.byte	0x1
	.uleb128 0x29
	.string	"CSFR_CORE_ID 0xFE1C"
	.byte	0x1
	.uleb128 0x2e
	.string	"CSFR_FCX 0xFE38"
	.byte	0x1
	.uleb128 0x2f
	.string	"CSFR_LCX 0xFE3C"
	.byte	0x1
	.uleb128 0x34
	.string	"CSFR_ICR 0xFE2C"
	.byte	0x1
	.uleb128 0x35
	.string	"CSFR_ISP 0xFE28"
	.byte	0x1
	.uleb128 0x3a
	.string	"CSFR_BTV 0xFE24"
	.byte	0x1
	.uleb128 0x3b
	.string	"CSFR_BIV 0xFE20"
	.byte	0x1
	.uleb128 0x40
	.string	"CSFR_DBGSR 0xFD00"
	.byte	0x1
	.uleb128 0x41
	.string	"CSFR_EXEVT 0xFD08"
	.byte	0x1
	.uleb128 0x46
	.string	"CSFR_CCTRL 0xFC00"
	.byte	0x1
	.uleb128 0x47
	.string	"CSFR_CCNT 0xFC04"
	.byte	0x1
	.uleb128 0x55
	.string	"PSW_CDC_MASK 0x0000007F"
	.byte	0x1
	.uleb128 0x56
	.string	"PSW_CDC_SHIFT 0"
	.byte	0x1
	.uleb128 0x57
	.string	"PSW_CDE (1U << 7)"
	.byte	0x1
	.uleb128 0x58
	.string	"PSW_GW (1U << 8)"
	.byte	0x1
	.uleb128 0x59
	.string	"PSW_IS (1U << 9)"
	.byte	0x1
	.uleb128 0x5a
	.string	"PSW_IO_MASK 0x00000C00"
	.byte	0x1
	.uleb128 0x5b
	.string	"PSW_IO_SHIFT 10"
	.byte	0x1
	.uleb128 0x5c
	.string	"PSW_PRS_MASK 0x00003000"
	.byte	0x1
	.uleb128 0x5d
	.string	"PSW_PRS_SHIFT 12"
	.byte	0x1
	.uleb128 0x5e
	.string	"PSW_S (1U << 14)"
	.byte	0x1
	.uleb128 0x5f
	.string	"PSW_USB (1U << 24)"
	.byte	0x1
	.uleb128 0x60
	.string	"PSW_SAV (1U << 27)"
	.byte	0x1
	.uleb128 0x61
	.string	"PSW_AV (1U << 28)"
	.byte	0x1
	.uleb128 0x62
	.string	"PSW_SV (1U << 29)"
	.byte	0x1
	.uleb128 0x63
	.string	"PSW_V (1U << 30)"
	.byte	0x1
	.uleb128 0x64
	.string	"PSW_C (1U << 31)"
	.byte	0x1
	.uleb128 0x67
	.string	"PSW_IO_USER 0"
	.byte	0x1
	.uleb128 0x68
	.string	"PSW_IO_USER1 1"
	.byte	0x1
	.uleb128 0x69
	.string	"PSW_IO_SUPERVISOR 2"
	.byte	0x1
	.uleb128 0x73
	.string	"ICR_CCPN_MASK 0x000000FF"
	.byte	0x1
	.uleb128 0x74
	.string	"ICR_CCPN_SHIFT 0"
	.byte	0x1
	.uleb128 0x75
	.string	"ICR_IE (1U << 8)"
	.byte	0x1
	.uleb128 0x76
	.string	"ICR_PIPN_MASK 0x00FF0000"
	.byte	0x1
	.uleb128 0x77
	.string	"ICR_PIPN_SHIFT 16"
	.byte	0x1
	.uleb128 0x78
	.string	"ICR_CARBCYC_MASK 0x03000000"
	.byte	0x1
	.uleb128 0x79
	.string	"ICR_CARBCYC_SHIFT 24"
	.byte	0x1
	.uleb128 0x7a
	.string	"ICR_CONECYC (1U << 26)"
	.byte	0x1
	.uleb128 0x84
	.string	"PCXI_PCXO_MASK 0x0000FFFF"
	.byte	0x1
	.uleb128 0x85
	.string	"PCXI_PCXO_SHIFT 0"
	.byte	0x1
	.uleb128 0x86
	.string	"PCXI_PCXS_MASK 0x000F0000"
	.byte	0x1
	.uleb128 0x87
	.string	"PCXI_PCXS_SHIFT 16"
	.byte	0x1
	.uleb128 0x88
	.string	"PCXI_UL (1U << 20)"
	.byte	0x1
	.uleb128 0x89
	.string	"PCXI_PIE (1U << 21)"
	.byte	0x1
	.uleb128 0x8a
	.string	"PCXI_PCPN_MASK 0x00FF0000"
	.byte	0x1
	.uleb128 0x8b
	.string	"PCXI_PCPN_SHIFT 22"
	.byte	0x1
	.uleb128 0x8e
	.string	"PCXI_UL_LOWER 0"
	.byte	0x1
	.uleb128 0x8f
	.string	"PCXI_UL_UPPER 1"
	.byte	0x1
	.uleb128 0x99
	.string	"CORE_ID_MASK 0x00000007"
	.byte	0x1
	.uleb128 0xa3
	.string	"SYSCON_FCDSF (1U << 0)"
	.byte	0x1
	.uleb128 0xa4
	.string	"SYSCON_PROTEN (1U << 1)"
	.byte	0x1
	.uleb128 0xa5
	.string	"SYSCON_TPROTEN (1U << 2)"
	.byte	0x1
	.uleb128 0xa6
	.string	"SYSCON_IS (1U << 3)"
	.byte	0x1
	.uleb128 0xa7
	.string	"SYSCON_IT (1U << 4)"
	.byte	0x1
	.uleb128 0xeb
	.string	"CSA_ADDR_TO_LINK(addr) ((((uint32_t)(addr) & 0xF0000000) >> 12) | (((uint32_t)(addr) & 0x0003FFC0) >> 6))"
	.byte	0x1
	.uleb128 0xf2
	.string	"CSA_LINK_TO_ADDR(link) ((void *)(((link) & 0x000F0000) << 12) | (((link) & 0x0000FFFF) << 6))"
	.byte	0x1
	.uleb128 0xf9
	.string	"CSA_SEGMENT(addr) (((uint32_t)(addr) >> 28) & 0x0F)"
	.byte	0x1
	.uleb128 0xfe
	.string	"CSA_OFFSET(addr) (((uint32_t)(addr) >> 6) & 0xFFFF)"
	.byte	0x1
	.uleb128 0x104
	.string	"TC397XP_NUM_CORES 6"
	.byte	0x1
	.uleb128 0x105
	.string	"TC397XP_LOCKSTEP_CORES 4"
	.byte	0x1
	.uleb128 0x106
	.string	"TC397XP_MAX_PRIORITY 255"
	.byte	0x1
	.uleb128 0x107
	.string	"TC397XP_CSA_SIZE 64"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tricore_intrinsics.h.28.fa546474ca1422ae90f08bd325d69284,comdat
.Ldebug_macro13:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1c
	.string	"TRICORE_GCC 1"
	.byte	0x1
	.uleb128 0x2f
	.string	"__mfcr(reg) __extension__({ uint32_t __res; __asm__ volatile(\"mfcr %0, %1\" : \"=d\"(__res) : \"i\"(reg)); __res; })"
	.byte	0x1
	.uleb128 0x41
	.string	"__mtcr(reg,value) do { __asm__ volatile(\"mtcr %0, %1\" : : \"i\"(reg), \"d\"(value)); } while(0)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tricore_cpu.h.9.ce410adb05527214b1b9f4d3be5ff657,comdat
.Ldebug_macro14:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x9
	.string	"TRICORE_CPU_H "
	.byte	0x1
	.uleb128 0x19
	.string	"CPU_COUNT 6"
	.byte	0x1
	.uleb128 0x1a
	.string	"CPU_LOCKSTEP_COUNT 4"
	.byte	0x1
	.uleb128 0x1d
	.string	"CPU0 0"
	.byte	0x1
	.uleb128 0x1e
	.string	"CPU1 1"
	.byte	0x1
	.uleb128 0x1f
	.string	"CPU2 2"
	.byte	0x1
	.uleb128 0x20
	.string	"CPU3 3"
	.byte	0x1
	.uleb128 0x21
	.string	"CPU4 4"
	.byte	0x1
	.uleb128 0x22
	.string	"CPU5 5"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tricore_csa.h.11.a1cff2782b2c2218b3fe31d12292ffba,comdat
.Ldebug_macro15:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xb
	.string	"TRICORE_CSA_H "
	.byte	0x1
	.uleb128 0x1a
	.string	"CSA_ENTRY_SIZE 64"
	.byte	0x1
	.uleb128 0x1b
	.string	"CSA_ALIGNMENT 64"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tricore_irq.h.25.4a02f3271345d0baa39572fbaec82e7e,comdat
.Ldebug_macro16:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x19
	.string	"IRQ_MAX_PRIORITY 255"
	.byte	0x1
	.uleb128 0x1a
	.string	"IRQ_MIN_PRIORITY 1"
	.byte	0x1
	.uleb128 0x1b
	.string	"IRQ_PRIORITY_KERNEL 200"
	.byte	0x1
	.uleb128 0x1c
	.string	"IRQ_PRIORITY_SYSTICK 100"
	.byte	0x1
	.uleb128 0x1d
	.string	"IRQ_PRIORITY_LOW 50"
	.byte	0x1
	.uleb128 0x20
	.string	"SRC_COUNT 1024"
	.byte	0x1
	.uleb128 0x4c
	.string	"IRQ_STM0_CMP0 0"
	.byte	0x1
	.uleb128 0x4d
	.string	"IRQ_STM0_CMP1 1"
	.byte	0x1
	.uleb128 0x4e
	.string	"IRQ_STM1_CMP0 2"
	.byte	0x1
	.uleb128 0x4f
	.string	"IRQ_STM1_CMP1 3"
	.byte	0x1
	.uleb128 0x50
	.string	"IRQ_STM2_CMP0 4"
	.byte	0x1
	.uleb128 0x51
	.string	"IRQ_STM2_CMP1 5"
	.byte	0x1
	.uleb128 0x55
	.string	"IRQ_ASCLIN0_TX 20"
	.byte	0x1
	.uleb128 0x56
	.string	"IRQ_ASCLIN0_RX 21"
	.byte	0x1
	.uleb128 0x57
	.string	"IRQ_ASCLIN0_ERR 22"
	.byte	0x1
	.uleb128 0x5b
	.string	"IRQ_CAN0_INT0 100"
	.byte	0x1
	.uleb128 0x5c
	.string	"IRQ_CAN0_INT1 101"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.newlib.h.7.8e13ac54f04856659a28dc3b44fc0911,comdat
.Ldebug_macro17:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x7
	.string	"__NEWLIB_H__ 1"
	.byte	0x1
	.uleb128 0x1b
	.string	"_ATEXIT_DYNAMIC_ALLOC 1"
	.byte	0x1
	.uleb128 0x21
	.string	"_FSEEK_OPTIMIZATION 1"
	.byte	0x1
	.uleb128 0x24
	.string	"_FVWRITE_IN_STREAMIO 1"
	.byte	0x1
	.uleb128 0x27
	.string	"_HAVE_CC_INHIBIT_LOOP_TO_LIBCALL 1"
	.byte	0x1
	.uleb128 0x2b
	.string	"_HAVE_INITFINI_ARRAY 1"
	.byte	0x1
	.uleb128 0x2e
	.string	"_HAVE_LONG_DOUBLE 1"
	.byte	0x1
	.uleb128 0x163
	.string	"_LDBL_EQ_DBL 1"
	.byte	0x1
	.uleb128 0x16c
	.string	"_MB_LEN_MAX 1"
	.byte	0x1
	.uleb128 0x175
	.string	"_REENT_CHECK_VERIFY 1"
	.byte	0x1
	.uleb128 0x17b
	.string	"_UNBUF_STREAM_OPT 1"
	.byte	0x1
	.uleb128 0x17f
	.string	"_WANT_IO_C99_FORMATS 1"
	.byte	0x1
	.uleb128 0x187
	.string	"_WANT_IO_LONG_LONG 1"
	.byte	0x1
	.uleb128 0x19b
	.string	"_WANT_USE_GDTOA 1"
	.byte	0x1
	.uleb128 0x1a1
	.string	"_WIDE_ORIENT 1"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.ieeefp.h.505.c9467b21bf4a42afb85326d5aefd22a5,comdat
.Ldebug_macro18:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1f9
	.string	"__IEEE_LITTLE_ENDIAN "
	.byte	0x1
	.uleb128 0x207
	.string	"__OBSOLETE_MATH_DEFAULT 1"
	.byte	0x1
	.uleb128 0x20a
	.string	"__OBSOLETE_MATH __OBSOLETE_MATH_DEFAULT"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.config.h.224.10ee1ad185d877c6e334e6581faab44d,comdat
.Ldebug_macro19:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xe0
	.string	"_POINTER_INT long"
	.byte	0x2
	.uleb128 0xe6
	.string	"__RAND_MAX"
	.byte	0x1
	.uleb128 0xea
	.string	"__RAND_MAX 0x7fffffff"
	.byte	0x1
	.uleb128 0xf8
	.string	"__EXPORT "
	.byte	0x1
	.uleb128 0xfc
	.string	"__IMPORT "
	.byte	0x1
	.uleb128 0x103
	.string	"_READ_WRITE_RETURN_TYPE int"
	.byte	0x1
	.uleb128 0x109
	.string	"_READ_WRITE_BUFSIZE_TYPE int"
	.byte	0x1
	.uleb128 0x122
	.string	"_USE_GDTOA "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._ansi.h.31.de524f58584151836e90d8620a16f8e8,comdat
.Ldebug_macro20:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1f
	.string	"_BEGIN_STD_C "
	.byte	0x1
	.uleb128 0x20
	.string	"_END_STD_C "
	.byte	0x1
	.uleb128 0x21
	.string	"_NOTHROW "
	.byte	0x1
	.uleb128 0x25
	.string	"_LONG_DOUBLE long double"
	.byte	0x1
	.uleb128 0x2b
	.string	"_ATTRIBUTE(attrs) __attribute__ (attrs)"
	.byte	0x1
	.uleb128 0x45
	.string	"_ELIDABLE_INLINE static __inline__"
	.byte	0x1
	.uleb128 0x49
	.string	"_NOINLINE __attribute__ ((__noinline__))"
	.byte	0x1
	.uleb128 0x4a
	.string	"_NOINLINE_STATIC _NOINLINE static"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.stddef.h.39.0dc9006b34572d4d9cae4c8b422c4971,comdat
.Ldebug_macro21:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x27
	.string	"_STDDEF_H "
	.byte	0x1
	.uleb128 0x28
	.string	"_STDDEF_H_ "
	.byte	0x1
	.uleb128 0x2a
	.string	"_ANSI_STDDEF_H "
	.byte	0x1
	.uleb128 0x84
	.string	"_PTRDIFF_T "
	.byte	0x1
	.uleb128 0x85
	.string	"_T_PTRDIFF_ "
	.byte	0x1
	.uleb128 0x86
	.string	"_T_PTRDIFF "
	.byte	0x1
	.uleb128 0x87
	.string	"__PTRDIFF_T "
	.byte	0x1
	.uleb128 0x88
	.string	"_PTRDIFF_T_ "
	.byte	0x1
	.uleb128 0x89
	.string	"_BSD_PTRDIFF_T_ "
	.byte	0x1
	.uleb128 0x8a
	.string	"___int_ptrdiff_t_h "
	.byte	0x1
	.uleb128 0x8b
	.string	"_GCC_PTRDIFF_T "
	.byte	0x1
	.uleb128 0x8c
	.string	"_PTRDIFF_T_DECLARED "
	.byte	0x1
	.uleb128 0x8d
	.string	"__DEFINED_ptrdiff_t "
	.byte	0x2
	.uleb128 0x9e
	.string	"__need_ptrdiff_t"
	.byte	0x1
	.uleb128 0xb9
	.string	"__size_t__ "
	.byte	0x1
	.uleb128 0xba
	.string	"__SIZE_T__ "
	.byte	0x1
	.uleb128 0xbb
	.string	"_SIZE_T "
	.byte	0x1
	.uleb128 0xbc
	.string	"_SYS_SIZE_T_H "
	.byte	0x1
	.uleb128 0xbd
	.string	"_T_SIZE_ "
	.byte	0x1
	.uleb128 0xbe
	.string	"_T_SIZE "
	.byte	0x1
	.uleb128 0xbf
	.string	"__SIZE_T "
	.byte	0x1
	.uleb128 0xc0
	.string	"_SIZE_T_ "
	.byte	0x1
	.uleb128 0xc1
	.string	"_BSD_SIZE_T_ "
	.byte	0x1
	.uleb128 0xc2
	.string	"_SIZE_T_DEFINED_ "
	.byte	0x1
	.uleb128 0xc3
	.string	"_SIZE_T_DEFINED "
	.byte	0x1
	.uleb128 0xc4
	.string	"_BSD_SIZE_T_DEFINED_ "
	.byte	0x1
	.uleb128 0xc5
	.string	"_SIZE_T_DECLARED "
	.byte	0x1
	.uleb128 0xc6
	.string	"__DEFINED_size_t "
	.byte	0x1
	.uleb128 0xc7
	.string	"___int_size_t_h "
	.byte	0x1
	.uleb128 0xc8
	.string	"_GCC_SIZE_T "
	.byte	0x1
	.uleb128 0xc9
	.string	"_SIZET_ "
	.byte	0x1
	.uleb128 0xd0
	.string	"__size_t "
	.byte	0x2
	.uleb128 0xed
	.string	"__need_size_t"
	.byte	0x1
	.uleb128 0x10b
	.string	"__wchar_t__ "
	.byte	0x1
	.uleb128 0x10c
	.string	"__WCHAR_T__ "
	.byte	0x1
	.uleb128 0x10d
	.string	"_WCHAR_T "
	.byte	0x1
	.uleb128 0x10e
	.string	"_T_WCHAR_ "
	.byte	0x1
	.uleb128 0x10f
	.string	"_T_WCHAR "
	.byte	0x1
	.uleb128 0x110
	.string	"__WCHAR_T "
	.byte	0x1
	.uleb128 0x111
	.string	"_WCHAR_T_ "
	.byte	0x1
	.uleb128 0x112
	.string	"_BSD_WCHAR_T_ "
	.byte	0x1
	.uleb128 0x113
	.string	"_WCHAR_T_DEFINED_ "
	.byte	0x1
	.uleb128 0x114
	.string	"_WCHAR_T_DEFINED "
	.byte	0x1
	.uleb128 0x115
	.string	"_WCHAR_T_H "
	.byte	0x1
	.uleb128 0x116
	.string	"___int_wchar_t_h "
	.byte	0x1
	.uleb128 0x117
	.string	"__INT_WCHAR_T_H "
	.byte	0x1
	.uleb128 0x118
	.string	"_GCC_WCHAR_T "
	.byte	0x1
	.uleb128 0x119
	.string	"_WCHAR_T_DECLARED "
	.byte	0x1
	.uleb128 0x11a
	.string	"__DEFINED_wchar_t "
	.byte	0x2
	.uleb128 0x127
	.string	"_BSD_WCHAR_T_"
	.byte	0x2
	.uleb128 0x15d
	.string	"__need_wchar_t"
	.byte	0x2
	.uleb128 0x18f
	.string	"NULL"
	.byte	0x1
	.uleb128 0x194
	.string	"NULL ((void *)0)"
	.byte	0x2
	.uleb128 0x19a
	.string	"__need_NULL"
	.byte	0x2
	.uleb128 0x19f
	.string	"offsetof"
	.byte	0x1
	.uleb128 0x1a0
	.string	"offsetof(TYPE,MEMBER) __builtin_offsetof (TYPE, MEMBER)"
	.byte	0x1
	.uleb128 0x1a5
	.string	"_GCC_MAX_ALIGN_T "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._types.h.20.dd0d04dca3800a0d2a6129b87f3adbb2,comdat
.Ldebug_macro22:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x14
	.string	"_SYS__TYPES_H "
	.byte	0x1
	.uleb128 0x16
	.string	"__need_size_t "
	.byte	0x1
	.uleb128 0x17
	.string	"__need_wint_t "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.stddef.h.158.6f8e08a347b1cff664332fa350bfceb3,comdat
.Ldebug_macro23:
	.uahalf	0x4
	.byte	0
	.byte	0x2
	.uleb128 0x9e
	.string	"__need_ptrdiff_t"
	.byte	0x2
	.uleb128 0xed
	.string	"__need_size_t"
	.byte	0x2
	.uleb128 0x15d
	.string	"__need_wchar_t"
	.byte	0x1
	.uleb128 0x162
	.string	"_WINT_T "
	.byte	0x2
	.uleb128 0x169
	.string	"__need_wint_t"
	.byte	0x2
	.uleb128 0x18f
	.string	"NULL"
	.byte	0x1
	.uleb128 0x194
	.string	"NULL ((void *)0)"
	.byte	0x2
	.uleb128 0x19a
	.string	"__need_NULL"
	.byte	0x2
	.uleb128 0x19f
	.string	"offsetof"
	.byte	0x1
	.uleb128 0x1a0
	.string	"offsetof(TYPE,MEMBER) __builtin_offsetof (TYPE, MEMBER)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._types.h.2.bcaf1407baf74d88d1efa4cd5ff9d838,comdat
.Ldebug_macro24:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x2
	.string	"_MACHINE__TYPES_H "
	.byte	0x1
	.uleb128 0x7
	.string	"__ATTRIBUTE_IMPURE_PTR__ __attribute__((__fardata__))"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4._types.h.127.3bdfe3ff8ea2d0985b03d9cbe93480e3,comdat
.Ldebug_macro25:
	.uahalf	0x4
	.byte	0
	.byte	0x2
	.uleb128 0x7f
	.string	"__size_t"
	.byte	0x1
	.uleb128 0x92
	.string	"unsigned signed"
	.byte	0x2
	.uleb128 0x94
	.string	"unsigned"
	.byte	0x1
	.uleb128 0xb3
	.string	"_CLOCK_T_ unsigned long"
	.byte	0x1
	.uleb128 0xbb
	.string	"_TIME_T_ __int_least64_t"
	.byte	0x1
	.uleb128 0xc0
	.string	"_CLOCKID_T_ unsigned long"
	.byte	0x1
	.uleb128 0xc9
	.string	"_TIMER_T_ unsigned long"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.reent.h.17.e292bf8b0bec6c96e131a54347145a30,comdat
.Ldebug_macro26:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x11
	.string	"_NULL 0"
	.byte	0x1
	.uleb128 0x15
	.string	"__Long long"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.lock.h.2.c0958401bd0ce484d507ee19aacab817,comdat
.Ldebug_macro27:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x2
	.string	"__SYS_LOCK_H__ "
	.byte	0x1
	.uleb128 0xe
	.string	"__LOCK_INIT(class,lock) static int lock = 0;"
	.byte	0x1
	.uleb128 0xf
	.string	"__LOCK_INIT_RECURSIVE(class,lock) static int lock = 0;"
	.byte	0x1
	.uleb128 0x10
	.string	"__lock_init(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x11
	.string	"__lock_init_recursive(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x12
	.string	"__lock_close(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x13
	.string	"__lock_close_recursive(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x14
	.string	"__lock_acquire(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x15
	.string	"__lock_acquire_recursive(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x16
	.string	"__lock_try_acquire(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x17
	.string	"__lock_try_acquire_recursive(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x18
	.string	"__lock_release(lock) ((void) 0)"
	.byte	0x1
	.uleb128 0x19
	.string	"__lock_release_recursive(lock) ((void) 0)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.reent.h.77.71802f628824274a68e3c8baf4f996c5,comdat
.Ldebug_macro28:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x4d
	.string	"_ATEXIT_SIZE 32"
	.byte	0x1
	.uleb128 0x69
	.string	"_ATEXIT_INIT {_NULL, 0, {_NULL}, {{_NULL}, {_NULL}, 0, 0}}"
	.byte	0x1
	.uleb128 0x91
	.string	"_REENT_SMALL_CHECK_INIT(ptr) "
	.byte	0x1
	.uleb128 0x12a
	.string	"_RAND48_SEED_0 (0x330e)"
	.byte	0x1
	.uleb128 0x12b
	.string	"_RAND48_SEED_1 (0xabcd)"
	.byte	0x1
	.uleb128 0x12c
	.string	"_RAND48_SEED_2 (0x1234)"
	.byte	0x1
	.uleb128 0x12d
	.string	"_RAND48_MULT_0 (0xe66d)"
	.byte	0x1
	.uleb128 0x12e
	.string	"_RAND48_MULT_1 (0xdeec)"
	.byte	0x1
	.uleb128 0x12f
	.string	"_RAND48_MULT_2 (0x0005)"
	.byte	0x1
	.uleb128 0x130
	.string	"_RAND48_ADD (0x000b)"
	.byte	0x1
	.uleb128 0x13c
	.string	"_REENT_EMERGENCY_SIZE 25"
	.byte	0x1
	.uleb128 0x13d
	.string	"_REENT_ASCTIME_SIZE 26"
	.byte	0x1
	.uleb128 0x13e
	.string	"_REENT_SIGNAL_SIZE 24"
	.byte	0x1
	.uleb128 0x149
	.string	"_REENT_INIT_RESERVED_0 "
	.byte	0x1
	.uleb128 0x14a
	.string	"_REENT_INIT_RESERVED_1 "
	.byte	0x1
	.uleb128 0x14b
	.string	"_REENT_INIT_RESERVED_2 "
	.byte	0x1
	.uleb128 0x14c
	.string	"_REENT_INIT_RESERVED_6_7 "
	.byte	0x1
	.uleb128 0x14d
	.string	"_REENT_INIT_RESERVED_8 "
	.byte	0x1
	.uleb128 0x284
	.ascii	"_REENT_INIT(var) { 0, &__sf[0], &__sf[1], &__sf[2], 0, \"\","
	.ascii	" _REENT_INIT_RESERVED_1 _NULL, _REENT_INIT_RESERVED_0 _NULL,"
	.ascii	" _NULL, 0, _NULL, _NULL, 0, _NULL, { { _REENT_INIT_RESERVED_"
	.ascii	"2 _NULL, \"\", {0, 0, 0, 0, 0, 0, 0, 0"
	.string	", 0}, 0, 1, { {_RAND48_SEED_0, _RAND48_SEED_1, _RAND48_SEED_2}, {_RAND48_MULT_0, _RAND48_MULT_1, _RAND48_MULT_2}, _RAND48_ADD }, {0, {0}}, {0, {0}}, {0, {0}}, \"\", \"\", 0, {0, {0}}, {0, {0}}, {0, {0}}, {0, {0}}, {0, {0}} } }, _REENT_INIT_RESERVED_6_7 _NULL }"
	.byte	0x1
	.uleb128 0x2b3
	.ascii	"_REENT_INIT_PTR_ZEROED(var) { (var)->_stdin = &__sf[0]; (var"
	.ascii	")->_stdout = &__sf[1]; (var)->_stderr = &__sf[2]; (var)->_ne"
	.ascii	"w._reent._rand_next = 1; (var)->_new._reent._r48._seed[0] = "
	.ascii	"_RAND48_SEED_0; (var)->_new._reent._r48._seed[1] = _RAND48_S"
	.string	"EED_1; (var)->_new._reent._r48._seed[2] = _RAND48_SEED_2; (var)->_new._reent._r48._mult[0] = _RAND48_MULT_0; (var)->_new._reent._r48._mult[1] = _RAND48_MULT_1; (var)->_new._reent._r48._mult[2] = _RAND48_MULT_2; (var)->_new._reent._r48._add = _RAND48_ADD; }"
	.byte	0x1
	.uleb128 0x2c1
	.string	"_REENT_CHECK_RAND48(ptr) "
	.byte	0x1
	.uleb128 0x2c2
	.string	"_REENT_CHECK_MP(ptr) "
	.byte	0x1
	.uleb128 0x2c3
	.string	"_REENT_CHECK_TM(ptr) "
	.byte	0x1
	.uleb128 0x2c4
	.string	"_REENT_CHECK_ASCTIME_BUF(ptr) "
	.byte	0x1
	.uleb128 0x2c5
	.string	"_REENT_CHECK_EMERGENCY(ptr) "
	.byte	0x1
	.uleb128 0x2c6
	.string	"_REENT_CHECK_MISC(ptr) "
	.byte	0x1
	.uleb128 0x2c7
	.string	"_REENT_CHECK_SIGNAL_BUF(ptr) "
	.byte	0x1
	.uleb128 0x2c9
	.string	"_REENT_SIGNGAM(ptr) ((ptr)->_new._reent._gamma_signgam)"
	.byte	0x1
	.uleb128 0x2ca
	.string	"_REENT_RAND_NEXT(ptr) ((ptr)->_new._reent._rand_next)"
	.byte	0x1
	.uleb128 0x2cb
	.string	"_REENT_RAND48_SEED(ptr) ((ptr)->_new._reent._r48._seed)"
	.byte	0x1
	.uleb128 0x2cc
	.string	"_REENT_RAND48_MULT(ptr) ((ptr)->_new._reent._r48._mult)"
	.byte	0x1
	.uleb128 0x2cd
	.string	"_REENT_RAND48_ADD(ptr) ((ptr)->_new._reent._r48._add)"
	.byte	0x1
	.uleb128 0x2ce
	.string	"_REENT_MP_RESULT(ptr) ((ptr)->_result)"
	.byte	0x1
	.uleb128 0x2cf
	.string	"_REENT_MP_RESULT_K(ptr) ((ptr)->_result_k)"
	.byte	0x1
	.uleb128 0x2d0
	.string	"_REENT_MP_P5S(ptr) ((ptr)->_p5s)"
	.byte	0x1
	.uleb128 0x2d1
	.string	"_REENT_MP_FREELIST(ptr) ((ptr)->_freelist)"
	.byte	0x1
	.uleb128 0x2d2
	.string	"_REENT_ASCTIME_BUF(ptr) ((ptr)->_new._reent._asctime_buf)"
	.byte	0x1
	.uleb128 0x2d3
	.string	"_REENT_TM(ptr) (&(ptr)->_new._reent._localtime_buf)"
	.byte	0x1
	.uleb128 0x2d4
	.string	"_REENT_STRTOK_LAST(ptr) ((ptr)->_new._reent._strtok_last)"
	.byte	0x1
	.uleb128 0x2d5
	.string	"_REENT_MBLEN_STATE(ptr) ((ptr)->_new._reent._mblen_state)"
	.byte	0x1
	.uleb128 0x2d6
	.string	"_REENT_MBTOWC_STATE(ptr) ((ptr)->_new._reent._mbtowc_state)"
	.byte	0x1
	.uleb128 0x2d7
	.string	"_REENT_WCTOMB_STATE(ptr) ((ptr)->_new._reent._wctomb_state)"
	.byte	0x1
	.uleb128 0x2d8
	.string	"_REENT_MBRLEN_STATE(ptr) ((ptr)->_new._reent._mbrlen_state)"
	.byte	0x1
	.uleb128 0x2d9
	.string	"_REENT_MBRTOWC_STATE(ptr) ((ptr)->_new._reent._mbrtowc_state)"
	.byte	0x1
	.uleb128 0x2da
	.string	"_REENT_MBSRTOWCS_STATE(ptr) ((ptr)->_new._reent._mbsrtowcs_state)"
	.byte	0x1
	.uleb128 0x2db
	.string	"_REENT_WCRTOMB_STATE(ptr) ((ptr)->_new._reent._wcrtomb_state)"
	.byte	0x1
	.uleb128 0x2dc
	.string	"_REENT_WCSRTOMBS_STATE(ptr) ((ptr)->_new._reent._wcsrtombs_state)"
	.byte	0x1
	.uleb128 0x2dd
	.string	"_REENT_L64A_BUF(ptr) ((ptr)->_new._reent._l64a_buf)"
	.byte	0x1
	.uleb128 0x2de
	.string	"_REENT_SIGNAL_BUF(ptr) ((ptr)->_new._reent._signal_buf)"
	.byte	0x1
	.uleb128 0x2df
	.string	"_REENT_GETDATE_ERR_P(ptr) (&((ptr)->_new._reent._getdate_err))"
	.byte	0x1
	.uleb128 0x2e3
	.string	"_REENT_CLEANUP(_ptr) ((_ptr)->__cleanup)"
	.byte	0x1
	.uleb128 0x2e4
	.string	"_REENT_CVTBUF(_ptr) ((_ptr)->_cvtbuf)"
	.byte	0x1
	.uleb128 0x2e5
	.string	"_REENT_CVTLEN(_ptr) ((_ptr)->_cvtlen)"
	.byte	0x1
	.uleb128 0x2e6
	.string	"_REENT_EMERGENCY(_ptr) ((_ptr)->_emergency)"
	.byte	0x1
	.uleb128 0x2e7
	.string	"_REENT_ERRNO(_ptr) ((_ptr)->_errno)"
	.byte	0x1
	.uleb128 0x2e8
	.string	"_REENT_INC(_ptr) ((_ptr)->_inc)"
	.byte	0x1
	.uleb128 0x2e9
	.string	"_REENT_LOCALE(_ptr) ((_ptr)->_locale)"
	.byte	0x1
	.uleb128 0x2ea
	.string	"_REENT_SIG_FUNC(_ptr) ((_ptr)->_sig_func)"
	.byte	0x1
	.uleb128 0x2eb
	.string	"_REENT_STDIN(_ptr) ((_ptr)->_stdin)"
	.byte	0x1
	.uleb128 0x2ec
	.string	"_REENT_STDOUT(_ptr) ((_ptr)->_stdout)"
	.byte	0x1
	.uleb128 0x2ed
	.string	"_REENT_STDERR(_ptr) ((_ptr)->_stderr)"
	.byte	0x1
	.uleb128 0x2ef
	.string	"_REENT_INIT_PTR(var) { memset((var), 0, sizeof(*(var))); _REENT_INIT_PTR_ZEROED(var); }"
	.byte	0x1
	.uleb128 0x300
	.string	"__ATTRIBUTE_IMPURE_DATA__ "
	.byte	0x1
	.uleb128 0x30d
	.string	"_REENT _impure_ptr"
	.byte	0x1
	.uleb128 0x310
	.string	"_REENT_IS_NULL(_ptr) ((_ptr) == NULL)"
	.byte	0x1
	.uleb128 0x312
	.string	"_GLOBAL_REENT (&_impure_data)"
	.byte	0x1
	.uleb128 0x371
	.string	"_Kmax (sizeof (size_t) << 3)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.cdefs.h.49.f93868eb904b9ca05b5c0257d31128ca,comdat
.Ldebug_macro29:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x31
	.string	"__PMT(args) args"
	.byte	0x1
	.uleb128 0x32
	.string	"__DOTS , ..."
	.byte	0x1
	.uleb128 0x33
	.string	"__THROW "
	.byte	0x1
	.uleb128 0x36
	.string	"__ASMNAME(cname) __XSTRING (__USER_LABEL_PREFIX__) cname"
	.byte	0x1
	.uleb128 0x39
	.string	"__ptr_t void *"
	.byte	0x1
	.uleb128 0x3a
	.string	"__long_double_t long double"
	.byte	0x1
	.uleb128 0x3c
	.string	"__attribute_malloc__ "
	.byte	0x1
	.uleb128 0x3d
	.string	"__attribute_pure__ "
	.byte	0x1
	.uleb128 0x3e
	.string	"__attribute_format_strfmon__(a,b) "
	.byte	0x1
	.uleb128 0x3f
	.string	"__flexarr [0]"
	.byte	0x1
	.uleb128 0x42
	.string	"__bounded "
	.byte	0x1
	.uleb128 0x43
	.string	"__unbounded "
	.byte	0x1
	.uleb128 0x44
	.string	"__ptrvalue "
	.byte	0x1
	.uleb128 0x4e
	.string	"__has_extension __has_feature"
	.byte	0x1
	.uleb128 0x51
	.string	"__has_feature(x) 0"
	.byte	0x1
	.uleb128 0x5e
	.string	"__BEGIN_DECLS "
	.byte	0x1
	.uleb128 0x5f
	.string	"__END_DECLS "
	.byte	0x1
	.uleb128 0x6b
	.string	"__GNUCLIKE_ASM 3"
	.byte	0x1
	.uleb128 0x6c
	.string	"__GNUCLIKE_MATH_BUILTIN_CONSTANTS "
	.byte	0x1
	.uleb128 0x70
	.string	"__GNUCLIKE___TYPEOF 1"
	.byte	0x1
	.uleb128 0x71
	.string	"__GNUCLIKE___SECTION 1"
	.byte	0x1
	.uleb128 0x73
	.string	"__GNUCLIKE_CTOR_SECTION_HANDLING 1"
	.byte	0x1
	.uleb128 0x75
	.string	"__GNUCLIKE_BUILTIN_CONSTANT_P 1"
	.byte	0x1
	.uleb128 0x78
	.string	"__GNUCLIKE_BUILTIN_VARARGS 1"
	.byte	0x1
	.uleb128 0x79
	.string	"__GNUCLIKE_BUILTIN_STDARG 1"
	.byte	0x1
	.uleb128 0x7a
	.string	"__GNUCLIKE_BUILTIN_VAALIST 1"
	.byte	0x1
	.uleb128 0x7d
	.string	"__GNUC_VA_LIST_COMPATIBILITY 1"
	.byte	0x1
	.uleb128 0x82
	.string	"__compiler_membar() __asm __volatile(\" \" : : : \"memory\")"
	.byte	0x1
	.uleb128 0x84
	.string	"__GNUCLIKE_BUILTIN_NEXT_ARG 1"
	.byte	0x1
	.uleb128 0x85
	.string	"__GNUCLIKE_MATH_BUILTIN_RELOPS "
	.byte	0x1
	.uleb128 0x87
	.string	"__GNUCLIKE_BUILTIN_MEMCPY 1"
	.byte	0x1
	.uleb128 0x8a
	.string	"__CC_SUPPORTS_INLINE 1"
	.byte	0x1
	.uleb128 0x8b
	.string	"__CC_SUPPORTS___INLINE 1"
	.byte	0x1
	.uleb128 0x8c
	.string	"__CC_SUPPORTS___INLINE__ 1"
	.byte	0x1
	.uleb128 0x8e
	.string	"__CC_SUPPORTS___FUNC__ 1"
	.byte	0x1
	.uleb128 0x8f
	.string	"__CC_SUPPORTS_WARNING 1"
	.byte	0x1
	.uleb128 0x91
	.string	"__CC_SUPPORTS_VARADIC_XXX 1"
	.byte	0x1
	.uleb128 0x93
	.string	"__CC_SUPPORTS_DYNAMIC_ARRAY_INIT 1"
	.byte	0x1
	.uleb128 0xa4
	.string	"__P(protos) protos"
	.byte	0x1
	.uleb128 0xa5
	.string	"__CONCAT1(x,y) x ## y"
	.byte	0x1
	.uleb128 0xa6
	.string	"__CONCAT(x,y) __CONCAT1(x,y)"
	.byte	0x1
	.uleb128 0xa7
	.string	"__STRING(x) #x"
	.byte	0x1
	.uleb128 0xa8
	.string	"__XSTRING(x) __STRING(x)"
	.byte	0x1
	.uleb128 0xaa
	.string	"__const const"
	.byte	0x1
	.uleb128 0xab
	.string	"__signed signed"
	.byte	0x1
	.uleb128 0xac
	.string	"__volatile volatile"
	.byte	0x1
	.uleb128 0xd9
	.string	"__weak_symbol __attribute__((__weak__))"
	.byte	0x1
	.uleb128 0xe6
	.string	"__dead2 __attribute__((__noreturn__))"
	.byte	0x1
	.uleb128 0xe7
	.string	"__pure2 __attribute__((__const__))"
	.byte	0x1
	.uleb128 0xe8
	.string	"__unused __attribute__((__unused__))"
	.byte	0x1
	.uleb128 0xe9
	.string	"__used __attribute__((__used__))"
	.byte	0x1
	.uleb128 0xea
	.string	"__packed __attribute__((__packed__))"
	.byte	0x1
	.uleb128 0xeb
	.string	"__aligned(x) __attribute__((__aligned__(x)))"
	.byte	0x1
	.uleb128 0xec
	.string	"__section(x) __attribute__((__section__(x)))"
	.byte	0x1
	.uleb128 0xef
	.string	"__alloc_size(x) __attribute__((__alloc_size__(x)))"
	.byte	0x1
	.uleb128 0xf0
	.string	"__alloc_size2(n,x) __attribute__((__alloc_size__(n, x)))"
	.byte	0x1
	.uleb128 0xf6
	.string	"__alloc_align(x) __attribute__((__alloc_align__(x)))"
	.byte	0x1
	.uleb128 0x14f
	.string	"__generic(expr,t,yes,no) _Generic(expr, t: yes, default: no)"
	.byte	0x1
	.uleb128 0x161
	.string	"__min_size(x) static (x)"
	.byte	0x1
	.uleb128 0x167
	.string	"__malloc_like __attribute__((__malloc__))"
	.byte	0x1
	.uleb128 0x168
	.string	"__pure __attribute__((__pure__))"
	.byte	0x1
	.uleb128 0x16f
	.string	"__always_inline __inline__ __attribute__((__always_inline__))"
	.byte	0x1
	.uleb128 0x175
	.string	"__noinline __attribute__ ((__noinline__))"
	.byte	0x1
	.uleb128 0x17b
	.string	"__nonnull(x) __attribute__((__nonnull__ x))"
	.byte	0x1
	.uleb128 0x17c
	.string	"__nonnull_all __attribute__((__nonnull__))"
	.byte	0x1
	.uleb128 0x183
	.string	"__fastcall __attribute__((__fastcall__))"
	.byte	0x1
	.uleb128 0x184
	.string	"__result_use_check __attribute__((__warn_unused_result__))"
	.byte	0x1
	.uleb128 0x18b
	.string	"__returns_twice __attribute__((__returns_twice__))"
	.byte	0x1
	.uleb128 0x191
	.string	"__unreachable() __builtin_unreachable()"
	.byte	0x1
	.uleb128 0x1a5
	.string	"__restrict restrict"
	.byte	0x1
	.uleb128 0x1c6
	.string	"__predict_true(exp) __builtin_expect((exp), 1)"
	.byte	0x1
	.uleb128 0x1c7
	.string	"__predict_false(exp) __builtin_expect((exp), 0)"
	.byte	0x1
	.uleb128 0x1ce
	.string	"__null_sentinel __attribute__((__sentinel__))"
	.byte	0x1
	.uleb128 0x1cf
	.string	"__exported __attribute__((__visibility__(\"default\")))"
	.byte	0x1
	.uleb128 0x1d2
	.string	"__hidden __attribute__((__visibility__(\"hidden\")))"
	.byte	0x1
	.uleb128 0x1dc
	.string	"__offsetof(type,field) offsetof(type, field)"
	.byte	0x1
	.uleb128 0x1dd
	.string	"__rangeof(type,start,end) (__offsetof(type, end) - __offsetof(type, start))"
	.byte	0x1
	.uleb128 0x1e7
	.string	"__containerof(x,s,m) ({ const volatile __typeof(((s *)0)->m) *__x = (x); __DEQUALIFY(s *, (const volatile char *)__x - __offsetof(s, m));})"
	.byte	0x1
	.uleb128 0x1fd
	.string	"__printflike(fmtarg,firstvararg) __attribute__((__format__ (__printf__, fmtarg, firstvararg)))"
	.byte	0x1
	.uleb128 0x1ff
	.string	"__scanflike(fmtarg,firstvararg) __attribute__((__format__ (__scanf__, fmtarg, firstvararg)))"
	.byte	0x1
	.uleb128 0x201
	.string	"__format_arg(fmtarg) __attribute__((__format_arg__ (fmtarg)))"
	.byte	0x1
	.uleb128 0x202
	.string	"__strfmonlike(fmtarg,firstvararg) __attribute__((__format__ (__strfmon__, fmtarg, firstvararg)))"
	.byte	0x1
	.uleb128 0x204
	.string	"__strftimelike(fmtarg,firstvararg) __attribute__((__format__ (__strftime__, fmtarg, firstvararg)))"
	.byte	0x1
	.uleb128 0x20e
	.string	"__printf0like(fmtarg,firstvararg) "
	.byte	0x1
	.uleb128 0x212
	.string	"__strong_reference(sym,aliassym) extern __typeof (sym) aliassym __attribute__ ((__alias__ (#sym)))"
	.byte	0x1
	.uleb128 0x216
	.string	"__weak_reference(sym,alias) __asm__(\".weak \" #alias); __asm__(\".equ \" #alias \", \" #sym)"
	.byte	0x1
	.uleb128 0x219
	.string	"__warn_references(sym,msg) __asm__(\".section .gnu.warning.\" #sym); __asm__(\".asciz \\\"\" msg \"\\\"\"); __asm__(\".previous\")"
	.byte	0x1
	.uleb128 0x21d
	.string	"__sym_compat(sym,impl,verid) __asm__(\".symver \" #impl \", \" #sym \"@\" #verid)"
	.byte	0x1
	.uleb128 0x21f
	.string	"__sym_default(sym,impl,verid) __asm__(\".symver \" #impl \", \" #sym \"@@\" #verid)"
	.byte	0x1
	.uleb128 0x242
	.string	"__FBSDID(s) struct __hack"
	.byte	0x1
	.uleb128 0x246
	.string	"__RCSID(s) struct __hack"
	.byte	0x1
	.uleb128 0x24a
	.string	"__RCSID_SOURCE(s) struct __hack"
	.byte	0x1
	.uleb128 0x24e
	.string	"__SCCSID(s) struct __hack"
	.byte	0x1
	.uleb128 0x252
	.string	"__COPYRIGHT(s) struct __hack"
	.byte	0x1
	.uleb128 0x256
	.string	"__DECONST(type,var) ((type)(__uintptr_t)(const void *)(var))"
	.byte	0x1
	.uleb128 0x25a
	.string	"__DEVOLATILE(type,var) ((type)(__uintptr_t)(volatile void *)(var))"
	.byte	0x1
	.uleb128 0x25e
	.string	"__DEQUALIFY(type,var) ((type)(__uintptr_t)(const volatile void *)(var))"
	.byte	0x1
	.uleb128 0x265
	.string	"_Nonnull "
	.byte	0x1
	.uleb128 0x266
	.string	"_Nullable "
	.byte	0x1
	.uleb128 0x267
	.string	"_Null_unspecified "
	.byte	0x1
	.uleb128 0x268
	.string	"__NULLABILITY_PRAGMA_PUSH "
	.byte	0x1
	.uleb128 0x269
	.string	"__NULLABILITY_PRAGMA_POP "
	.byte	0x1
	.uleb128 0x27e
	.string	"__arg_type_tag(arg_kind,arg_idx,type_tag_idx) "
	.byte	0x1
	.uleb128 0x27f
	.string	"__datatype_type_tag(kind,type) "
	.byte	0x1
	.uleb128 0x291
	.string	"__lock_annotate(x) "
	.byte	0x1
	.uleb128 0x297
	.string	"__lockable __lock_annotate(lockable)"
	.byte	0x1
	.uleb128 0x29a
	.string	"__locks_exclusive(...) __lock_annotate(exclusive_lock_function(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x29c
	.string	"__locks_shared(...) __lock_annotate(shared_lock_function(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2a0
	.string	"__trylocks_exclusive(...) __lock_annotate(exclusive_trylock_function(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2a2
	.string	"__trylocks_shared(...) __lock_annotate(shared_trylock_function(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2a6
	.string	"__unlocks(...) __lock_annotate(unlock_function(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2a9
	.string	"__asserts_exclusive(...) __lock_annotate(assert_exclusive_lock(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2ab
	.string	"__asserts_shared(...) __lock_annotate(assert_shared_lock(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2af
	.string	"__requires_exclusive(...) __lock_annotate(exclusive_locks_required(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2b1
	.string	"__requires_shared(...) __lock_annotate(shared_locks_required(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2b3
	.string	"__requires_unlocked(...) __lock_annotate(locks_excluded(__VA_ARGS__))"
	.byte	0x1
	.uleb128 0x2b7
	.string	"__no_lock_analysis __lock_annotate(no_thread_safety_analysis)"
	.byte	0x1
	.uleb128 0x2c8
	.string	"__nosanitizeaddress "
	.byte	0x1
	.uleb128 0x2c9
	.string	"__nosanitizememory "
	.byte	0x1
	.uleb128 0x2ca
	.string	"__nosanitizethread "
	.byte	0x1
	.uleb128 0x2ce
	.string	"__guarded_by(x) __lock_annotate(guarded_by(x))"
	.byte	0x1
	.uleb128 0x2cf
	.string	"__pt_guarded_by(x) __lock_annotate(pt_guarded_by(x))"
	.byte	0x1
	.uleb128 0x2d4
	.string	"__builtin_is_aligned(x,align) (((__uintptr_t)x & ((align) - 1)) == 0)"
	.byte	0x1
	.uleb128 0x2d8
	.string	"__builtin_align_up(x,align) ((__typeof__(x))(((__uintptr_t)(x)+((align)-1))&(~((align)-1))))"
	.byte	0x1
	.uleb128 0x2dc
	.string	"__builtin_align_down(x,align) ((__typeof__(x))((x)&(~((align)-1))))"
	.byte	0x1
	.uleb128 0x2e0
	.string	"__align_up(x,y) __builtin_align_up(x, y)"
	.byte	0x1
	.uleb128 0x2e1
	.string	"__align_down(x,y) __builtin_align_down(x, y)"
	.byte	0x1
	.uleb128 0x2e2
	.string	"__is_aligned(x,y) __builtin_is_aligned(x, y)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.string.h.15.dab3980bf35408a4c507182805e2de3a,comdat
.Ldebug_macro30:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xf
	.string	"__need_size_t "
	.byte	0x1
	.uleb128 0x10
	.string	"__need_NULL "
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.stddef.h.158.eec8bf00b5213f43d095cb984c5f22e3,comdat
.Ldebug_macro31:
	.uahalf	0x4
	.byte	0
	.byte	0x2
	.uleb128 0x9e
	.string	"__need_ptrdiff_t"
	.byte	0x2
	.uleb128 0xed
	.string	"__need_size_t"
	.byte	0x2
	.uleb128 0x15d
	.string	"__need_wchar_t"
	.byte	0x2
	.uleb128 0x18f
	.string	"NULL"
	.byte	0x1
	.uleb128 0x194
	.string	"NULL ((void *)0)"
	.byte	0x2
	.uleb128 0x19a
	.string	"__need_NULL"
	.byte	0x2
	.uleb128 0x19f
	.string	"offsetof"
	.byte	0x1
	.uleb128 0x1a0
	.string	"offsetof(TYPE,MEMBER) __builtin_offsetof (TYPE, MEMBER)"
	.byte	0
	.section	.debug_line,"",@progbits
.Ldebug_line0:
	.section	.debug_str,"",@progbits
.LASF2:
	.string	"stm_base"
.LASF1:
	.string	"callback"
.LASF4:
	.string	"core_id"
.LASF3:
	.string	"current_sp"
.LASF0:
	.string	"stm_id"
	.extern	get_reset_reason,STT_FUNC,0
	.extern	system_reset,STT_FUNC,0
	.extern	cpu_endinit_lock,STT_FUNC,0
	.extern	cpu_endinit_unlock,STT_FUNC,0
	.extern	cpu_idle,STT_FUNC,0
	.extern	_context_switch_asm,STT_FUNC,0
	.extern	_start_first_task,STT_FUNC,0
	.extern	csa_create_task_context,STT_FUNC,0
	.extern	irq_register,STT_FUNC,0
	.extern	memset,STT_FUNC,0
	.extern	get_stm_clock,STT_FUNC,0
	.ident	"GCC: (GNU) 13.4.0"
.section .callinfo
  .word ekk_hal_init #name
  .word ekk_hal_init_end #sz
  .word 0x44140034 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_init_core #name
  .word ekk_hal_init_core_end #sz
  .word 0x40040014 #reg
  .word 0x00000010 #arg
  .word 0x00000004 #ret
  .word 0x000080c0 #stat
  .word ekk_hal_get_core_id #name
  .word ekk_hal_get_core_id_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_get_core_count #name
  .word ekk_hal_get_core_count_end #sz
  .word 0x40000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x000000c0 #stat
  .word ekk_hal_is_boot_core #name
  .word ekk_hal_is_boot_core_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_disable_interrupts #name
  .word ekk_hal_disable_interrupts_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028140 #stat
  .word ekk_hal_enable_interrupts #name
  .word ekk_hal_enable_interrupts_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_restore_interrupts #name
  .word ekk_hal_restore_interrupts_end #sz
  .word 0x44000014 #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_interrupts_enabled #name
  .word ekk_hal_interrupts_enabled_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_enter_critical #name
  .word ekk_hal_enter_critical_end #sz
  .word 0x4404000c #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_exit_critical #name
  .word ekk_hal_exit_critical_end #sz
  .word 0x4404000c #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_in_critical #name
  .word ekk_hal_in_critical_end #sz
  .word 0x44040004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_get_time_us #name
  .word ekk_hal_get_time_us_end #sz
  .word 0x4404001c #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_get_time_ms #name
  .word ekk_hal_get_time_ms_end #sz
  .word 0x4400000c #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_get_time_us64 #name
  .word ekk_hal_get_time_us64_end #sz
  .word 0x440c03fc #reg
  .word 0x00000000 #arg
  .word 0x0000000c #ret
  .word 0x00028040 #stat
  .word ekk_hal_delay_us #name
  .word ekk_hal_delay_us_end #sz
  .word 0x4400001c #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_delay_ms #name
  .word ekk_hal_delay_ms_end #sz
  .word 0x4400001c #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_systick_init #name
  .word ekk_hal_systick_init_end #sz
  .word 0x4414007c #reg
  .word 0x00100000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_get_tick_count #name
  .word ekk_hal_get_tick_count_end #sz
  .word 0x44040004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_get_tick_period_us #name
  .word ekk_hal_get_tick_period_us_end #sz
  .word 0x40000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x000000c0 #stat
  .word ekk_hal_trigger_context_switch #name
  .word ekk_hal_trigger_context_switch_end #sz
  .word 0x4404000c #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_start_first_task #name
  .word ekk_hal_start_first_task_end #sz
  .word 0x44300014 #reg
  .word 0x00300000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_context_switch #name
  .word ekk_hal_context_switch_end #sz
  .word 0x44300014 #reg
  .word 0x00300000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_memory_barrier #name
  .word ekk_hal_memory_barrier_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_instruction_barrier #name
  .word ekk_hal_instruction_barrier_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_data_sync_barrier #name
  .word ekk_hal_data_sync_barrier_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_idle #name
  .word ekk_hal_idle_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_sleep #name
  .word ekk_hal_sleep_end #sz
  .word 0x44000010 #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_debug_break #name
  .word ekk_hal_debug_break_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_debug_putc #name
  .word ekk_hal_debug_putc_end #sz
  .word 0x4004001c #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x000080c0 #stat
  .word ekk_hal_debug_puts #name
  .word ekk_hal_debug_puts_end #sz
  .word 0x44140014 #reg
  .word 0x00100000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_debug_hex #name
  .word ekk_hal_debug_hex_end #sz
  .word 0x4414001c #reg
  .word 0x00000010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_watchdog_init #name
  .word ekk_hal_watchdog_init_end #sz
  .word 0x40000014 #reg
  .word 0x00000010 #arg
  .word 0x00000004 #ret
  .word 0x000080c0 #stat
  .word ekk_hal_watchdog_reset #name
  .word ekk_hal_watchdog_reset_end #sz
  .word 0x44040004 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_watchdog_disable #name
  .word ekk_hal_watchdog_disable_end #sz
  .word 0x44040004 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word ekk_hal_system_reset #name
  .word ekk_hal_system_reset_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word ekk_hal_get_reset_reason #name
  .word ekk_hal_get_reset_reason_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word ekk_hal_get_stack_ptr #name
  .word ekk_hal_get_stack_ptr_end #sz
  .word 0x40040004 #reg
  .word 0x00000000 #arg
  .word 0x00040000 #ret
  .word 0x000081c0 #stat
  .word ekk_hal_check_stack #name
  .word ekk_hal_check_stack_end #sz
  .word 0x4414001c #reg
  .word 0x00100010 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_tc_get_stm #name
  .word ekk_hal_tc_get_stm_end #sz
  .word 0x44040014 #reg
  .word 0x00000010 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
  .word ekk_hal_tc_get_stm64 #name
  .word ekk_hal_tc_get_stm64_end #sz
  .word 0x440c0f1c #reg
  .word 0x00000010 #arg
  .word 0x0000000c #ret
  .word 0x00028040 #stat
  .word ekk_hal_tc_stm_compare #name
  .word ekk_hal_tc_stm_compare_end #sz
  .word 0x4414007c #reg
  .word 0x00100070 #arg
  .word 0x00000004 #ret
  .word 0x00028040 #stat
