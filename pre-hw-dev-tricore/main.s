# tric_asm_file_start
	.file	"main.c"
	.file	"main.c"
.section .text,"ax",@progbits
.Ltext0:
	.file 1 "src/main.c"
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
	.section	.text.__nop,"ax",@progbits
	.align 1
	.type	__nop, @function
__nop:
.LFB8:
	.loc 2 183 1
	mov.aa	%a14, %SP
.LCFI1:
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
	.section	.shared,"aw"
	.align 2
	.type	g_system, @object
	.size	g_system, 36
g_system:
	.zero	36
	.section	.spinlock,"aw"
	.align 2
	.type	g_state_lock, @object
	.size	g_state_lock, 12
g_state_lock:
	.zero	12
.srodata
.LC7:
	.string	"JEZGRO alive: "
.LC8:
	.string	"\r\n"
	.section	.text.coordinator_task,"ax",@progbits
	.align 1
	.type	coordinator_task, @function
coordinator_task:
.LFB52:
	.loc 1 69 1
	mov.aa	%a14, %SP
.LCFI2:
	sub.a	%SP, 16
	st.a	[%a14] -12, %a4
	.loc 1 71 14
	mov	%d2, 0
	st.w	[%a14] -4, %d2
.L9:
	.loc 1 75 27
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a2]0
	.loc 1 75 33
	add	%d2, 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	st.w	[%a2]0, %d2
.LBB2:
	.loc 1 78 23
	mov	%d2, 1
	st.w	[%a14] -8, %d2
	.loc 1 78 9
	j	.L4
.L7:
	.loc 1 79 36
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	mov.d	%d3, %a2
	add	%d3, %d2
	mov	%d2, %d3
	mov.a	%a2, %d2
	lea	%a2, [%a2] 24
	ld.bu	%d2, [%a2]0
	.loc 1 79 16
	jz	%d2, .L5
.LBB3:
	.loc 1 82 39
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d3, [%a2]0
	.loc 1 82 60
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	lea	%a2, [%A0] SM:prev_heartbeat.0
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 82 20
	jne	%d3, %d2, .L6
	.loc 1 84 29
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	lea	%a2, [%a2] 32
	ld.w	%d2, [%a2]0
	.loc 1 84 41
	add	%d2, 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	lea	%a2, [%a2] 32
	st.w	[%a2]0, %d2
.L6:
	.loc 1 86 55
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d3, [%a2]0
	.loc 1 86 35
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	lea	%a2, [%A0] SM:prev_heartbeat.0
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
.L5:
.LBE3:
	.loc 1 78 53 discriminator 2
	ld.w	%d2, [%a14] -8
	add	%d2, 1
	st.w	[%a14] -8, %d2
.L4:
	.loc 1 78 32 discriminator 1
	ld.w	%d2, [%a14] -8
	jlt.u	%d2, 6, .L7
.LBE2:
	.loc 1 91 12
	ld.w	%d2, [%a14] -4
	add	%d2, 1
	st.w	[%a14] -4, %d2
	.loc 1 91 25
	ld.w	%d4, [%a14] -4
	movh	%d2, 20972
	addi	%d2, %d2, -31457
	mul.u	%e2, %d4, %d2
	sh	%d2, %d3, -5
	mul	%d2, %d2, 100
	sub	%d2, %d4, %d2
	.loc 1 91 12
	jnz	%d2, .L8
	.loc 1 92 13
	lea	%a4, [%A0] SM:.LC7
	call	hal_debug_puts
	.loc 1 93 13
	ld.w	%d4, [%a14] -4
	call	hal_debug_hex
	.loc 1 94 13
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
.L8:
	.loc 1 97 9
	mov	%d4, 10
	call	jezgro_ms_to_ticks
	.loc 1 97 9 is_stmt 0 discriminator 1
	mov	%d4, %d2
	call	task_delay
	.loc 1 75 33 is_stmt 1
	j	.L9
.LFE52:
	.size coordinator_task, .-coordinator_task
.srodata
.LC9:
	.string	"SAFETY: Too many errors!\r\n"
	.section	.text.safety_monitor_task,"ax",@progbits
	.align 1
	.type	safety_monitor_task, @function
safety_monitor_task:
.LFB53:
	.loc 1 107 1
	mov.aa	%a14, %SP
.LCFI3:
	sub.a	%SP, 8
	st.a	[%a14] -4, %a4
.L12:
	.loc 1 112 9
	call	hal_watchdog_reset
	.loc 1 115 21
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	lea	%a2, [%a2] 32
	ld.w	%d2, [%a2]0
	.loc 1 115 12
	jlt.u	%d2, 11, .L11
	.loc 1 117 37
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	mov	%d2, 0
	st.b	[%a2] 30, %d2
	.loc 1 118 13
	lea	%a4, [%A0] SM:.LC9
	call	hal_debug_puts
.L11:
	.loc 1 124 9
	mov	%d4, 100
	call	jezgro_ms_to_ticks
	.loc 1 124 9 is_stmt 0 discriminator 1
	mov	%d4, %d2
	call	task_delay
	.loc 1 112 9 is_stmt 1
	j	.L12
.LFE53:
	.size safety_monitor_task, .-safety_monitor_task
	.section	.text.control_task,"ax",@progbits
	.align 1
	.type	control_task, @function
control_task:
.LFB54:
	.loc 1 134 1
	mov.aa	%a14, %SP
.LCFI4:
	sub.a	%SP, 24
	st.a	[%a14] -20, %a4
	.loc 1 135 14
	ld.w	%d2, [%a14] -20
	st.w	[%a14] -8, %d2
	.loc 1 138 34
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	mov.d	%d3, %a2
	add	%d3, %d2
	mov	%d2, %d3
	mov.a	%a2, %d2
	lea	%a2, [%a2] 24
	mov	%d2, 1
	st.b	[%a2]0, %d2
	.loc 1 140 11
	j	.L14
.L17:
.LBB4:
	.loc 1 142 27
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 142 36
	addi	%d3, %d2, 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -8
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
	.loc 1 145 27
	mov	%d2, 0
	st.w	[%a14] -12, %d2
.LBB5:
	.loc 1 146 23
	mov	%d2, 0
	st.w	[%a14] -4, %d2
	.loc 1 146 9
	j	.L15
.L16:
	.loc 1 147 19
	ld.w	%d3, [%a14] -12
	ld.w	%d2, [%a14] -4
	add	%d2, %d3
	st.w	[%a14] -12, %d2
	.loc 1 146 40 discriminator 3
	ld.w	%d2, [%a14] -4
	add	%d2, 1
	st.w	[%a14] -4, %d2
.L15:
	.loc 1 146 32 discriminator 1
	ld.w	%d2, [%a14] -4
	lt.u	%d2, %d2, 100
	jnz	%d2, .L16
.LBE5:
	.loc 1 151 9
	call	task_wait_for_period
.L14:
.LBE4:
	.loc 1 140 20
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.bu	%d2, [%a2] 30
	.loc 1 140 12
	jnz	%d2, .L17
	.loc 1 153 1
	nop
	nop
	ret	#control_task
.LFE54:
	.size control_task, .-control_task
	.section	.text.background_task,"ax",@progbits
	.align 1
	.type	background_task, @function
background_task:
.LFB55:
	.loc 1 161 1
	mov.aa	%a14, %SP
.LCFI5:
	sub.a	%SP, 16
	st.a	[%a14] -12, %a4
	.loc 1 162 14
	ld.w	%d2, [%a14] -12
	st.w	[%a14] -4, %d2
	.loc 1 165 34
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -4
	mov.d	%d3, %a2
	add	%d3, %d2
	mov	%d2, %d3
	mov.a	%a2, %d2
	lea	%a2, [%a2] 24
	mov	%d2, 1
	st.b	[%a2]0, %d2
	.loc 1 167 11
	j	.L19
.L20:
	.loc 1 169 27
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	ld.w	%d2, [%a2]0
	.loc 1 169 36
	addi	%d3, %d2, 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	st.w	[%a2]0, %d3
	.loc 1 175 9
	call	task_yield
	.loc 1 177 9
	mov	%d4, 1
	call	jezgro_ms_to_ticks
	.loc 1 177 9 is_stmt 0 discriminator 1
	mov	%d4, %d2
	call	task_delay
.L19:
	.loc 1 167 20 is_stmt 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.bu	%d2, [%a2] 30
	.loc 1 167 12
	jnz	%d2, .L20
	.loc 1 179 1
	nop
	nop
	ret	#background_task
.LFE55:
	.size background_task, .-background_task
.srodata
.LC10:
	.string	"=================================\r\n"
.LC11:
	.string	"JEZGRO RTOS for TC397XP\r\n"
.LC12:
	.string	"Version: "
.LC13:
	.string	"CPU0: HAL initialized\r\n"
.LC14:
	.string	"CPU0: Kernel initialized\r\n"
.LC15:
	.string	"CPU0: IPC initialized\r\n"
.LC16:
	.string	"state"
.LC18:
	.string	"coord"
.LC19:
	.string	"safety"
.LC20:
	.string	"CPU0: Tasks created\r\n"
.LC21:
	.string	"CPU0: Starting secondary cores...\r\n"
.LC22:
	.string	"CPU0: Waiting for cores...\r\n"
.LC23:
	.string	"CPU0: All cores ready, starting scheduler\r\n"
.LC0:
	.string	"task"
.sdata
	.align 2
.LC17:
	.word	.LC0
	.word	0
	.word	0
	.byte	-128
	.zero	3
	.word	2048
	.word	0
	.word	0
	.word	0
	.word	0
	.word	0
	.section	.text.cpu0_main,"ax",@progbits
	.align 1
	.global	cpu0_main
	.type	cpu0_main, @function
cpu0_main:
.LFB56:
	.loc 1 189 1
	mov.aa	%a14, %SP
.LCFI6:
	sub.a	%SP, 48
	.loc 1 190 5
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
	.loc 1 191 5
	lea	%a4, [%A0] SM:.LC10
	call	hal_debug_puts
	.loc 1 192 5
	lea	%a4, [%A0] SM:.LC11
	call	hal_debug_puts
	.loc 1 193 5
	lea	%a4, [%A0] SM:.LC12
	call	hal_debug_puts
	.loc 1 194 5
	call	jezgro_version
	mov.d	%d2, %a2
	.loc 1 194 5 is_stmt 0 discriminator 1
	mov.a	%a4, %d2
	call	hal_debug_puts
	.loc 1 195 5 is_stmt 1
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
	.loc 1 196 5
	lea	%a4, [%A0] SM:.LC10
	call	hal_debug_puts
	.loc 1 197 5
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
	.loc 1 200 5
	call	hal_init
	.loc 1 201 5
	mov	%d4, 0
	call	hal_init_core
	.loc 1 203 5
	lea	%a4, [%A0] SM:.LC13
	call	hal_debug_puts
	.loc 1 206 5
	call	jezgro_init
	.loc 1 207 5
	call	task_init
	.loc 1 208 5
	call	scheduler_init
	.loc 1 210 5
	lea	%a4, [%A0] SM:.LC14
	call	hal_debug_puts
	.loc 1 213 5
	call	ipc_mailbox_init
	.loc 1 214 5
	call	ipc_buffer_pool_init
	.loc 1 216 5
	lea	%a4, [%A0] SM:.LC15
	call	hal_debug_puts
	.loc 1 219 5
	lea	%a5, [%A0] SM:.LC16
	movh.a	%a2, hi:g_state_lock
	lea	%a4, [%a2] lo:g_state_lock
	call	sync_spinlock_init
.LBB6:
	.loc 1 220 19
	mov	%d2, 0
	st.w	[%a14] -4, %d2
	.loc 1 220 5
	j	.L22
.L23:
	.loc 1 221 31
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -4
	sh	%d2, 2
	addsc.a	%a2, %a2, %d2, 0
	mov	%d2, 0
	st.w	[%a2]0, %d2
	.loc 1 222 32
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	ld.w	%d2, [%a14] -4
	mov.d	%d3, %a2
	add	%d3, %d2
	mov	%d2, %d3
	mov.a	%a2, %d2
	lea	%a2, [%a2] 24
	mov	%d2, 0
	st.b	[%a2]0, %d2
	.loc 1 220 49 discriminator 3
	ld.w	%d2, [%a14] -4
	add	%d2, 1
	st.w	[%a14] -4, %d2
.L22:
	.loc 1 220 28 discriminator 1
	ld.w	%d2, [%a14] -4
	jlt.u	%d2, 6, .L23
.LBE6:
	.loc 1 224 29
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	mov	%d2, 1
	st.b	[%a2] 30, %d2
	.loc 1 225 26
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	mov	%d2, 0
	lea	%a2, [%a2] 32
	st.w	[%a2]0, %d2
	.loc 1 226 31
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	mov	%d2, 1
	st.b	[%a2] 24, %d2
	.loc 1 229 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 232 5
	call	task_create_idle
	.loc 1 235 19
	lea	%a2, [%a14] -44
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 236 17
	lea	%a2, [%A0] SM:.LC18
	st.a	[%a14] -44, %a2
	.loc 1 237 17
	movh.a	%a2, hi:coordinator_task
	lea	%a2, [%a2] lo:coordinator_task
	st.a	[%a14] -40, %a2
	.loc 1 238 21
	mov	%d2, -56
	st.b	[%a14] -32, %d2
	.loc 1 239 23
	mov	%d2, 2048
	st.w	[%a14] -28, %d2
	.loc 1 240 26
	mov	%d2, 0
	st.w	[%a14] -20, %d2
	.loc 1 241 5
	lea	%a2, [%a14] -44
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 244 17
	lea	%a2, [%A0] SM:.LC19
	st.a	[%a14] -44, %a2
	.loc 1 245 17
	movh.a	%a2, hi:safety_monitor_task
	lea	%a2, [%a2] lo:safety_monitor_task
	st.a	[%a14] -40, %a2
	.loc 1 246 21
	mov	%d2, -76
	st.b	[%a14] -32, %d2
	.loc 1 247 5
	lea	%a2, [%a14] -44
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 249 5
	lea	%a4, [%A0] SM:.LC20
	call	hal_debug_puts
	.loc 1 252 5
	lea	%a4, [%A0] SM:.LC21
	call	hal_debug_puts
	.loc 1 253 5
	call	multicore_start_all
	.loc 1 256 5
	lea	%a4, [%A0] SM:.LC22
	call	hal_debug_puts
	.loc 1 257 5
	mov	%d4, 5000
	call	multicore_wait_all_ready
	.loc 1 259 5
	lea	%a4, [%A0] SM:.LC23
	call	hal_debug_puts
	.loc 1 262 5
	call	jezgro_start
	.loc 1 263 1
	nop
	ret	#cpu0_main
.LFE56:
	.size cpu0_main, .-cpu0_main
	.global	cpu0_main_end
cpu0_main_end:
.srodata
.LC24:
	.string	"ctrl1"
	.section	.text.cpu1_main,"ax",@progbits
	.align 1
	.global	cpu1_main
	.type	cpu1_main, @function
cpu1_main:
.LFB57:
	.loc 1 269 1
	mov.aa	%a14, %SP
.LCFI7:
	sub.a	%SP, 40
	.loc 1 271 5
	mov	%d4, 1
	call	hal_init_core
	.loc 1 274 5
	call	scheduler_init
	.loc 1 277 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 280 5
	call	task_create_idle
	.loc 1 283 19
	lea	%a2, [%a14] -40
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 284 17
	lea	%a2, [%A0] SM:.LC24
	st.a	[%a14] -40, %a2
	.loc 1 285 17
	movh.a	%a2, hi:control_task
	lea	%a2, [%a2] lo:control_task
	st.a	[%a14] -36, %a2
	.loc 1 286 16
	mov	%d2, 1
	st.w	[%a14] -32, %d2
	.loc 1 287 21
	mov	%d2, -96
	st.b	[%a14] -28, %d2
	.loc 1 288 23
	mov	%d2, 2048
	st.w	[%a14] -24, %d2
	.loc 1 289 26
	mov	%d2, 1
	st.w	[%a14] -16, %d2
	.loc 1 290 22
	mov	%d2, 1000
	st.w	[%a14] -12, %d2
	.loc 1 291 18
	mov	%d2, 7
	st.w	[%a14] -4, %d2
	.loc 1 292 5
	lea	%a2, [%a14] -40
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 295 5
	call	multicore_signal_ready
	.loc 1 298 5
	call	jezgro_start
	.loc 1 299 1
	nop
	ret	#cpu1_main
.LFE57:
	.size cpu1_main, .-cpu1_main
	.global	cpu1_main_end
cpu1_main_end:
.srodata
.LC25:
	.string	"ctrl2"
	.section	.text.cpu2_main,"ax",@progbits
	.align 1
	.global	cpu2_main
	.type	cpu2_main, @function
cpu2_main:
.LFB58:
	.loc 1 305 1
	mov.aa	%a14, %SP
.LCFI8:
	sub.a	%SP, 40
	.loc 1 306 5
	mov	%d4, 2
	call	hal_init_core
	.loc 1 307 5
	call	scheduler_init
	.loc 1 308 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 309 5
	call	task_create_idle
	.loc 1 311 19
	lea	%a2, [%a14] -40
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 312 17
	lea	%a2, [%A0] SM:.LC25
	st.a	[%a14] -40, %a2
	.loc 1 313 17
	movh.a	%a2, hi:control_task
	lea	%a2, [%a2] lo:control_task
	st.a	[%a14] -36, %a2
	.loc 1 314 16
	mov	%d2, 2
	st.w	[%a14] -32, %d2
	.loc 1 315 21
	mov	%d2, -96
	st.b	[%a14] -28, %d2
	.loc 1 316 23
	mov	%d2, 2048
	st.w	[%a14] -24, %d2
	.loc 1 317 26
	mov	%d2, 2
	st.w	[%a14] -16, %d2
	.loc 1 318 22
	mov	%d2, 1000
	st.w	[%a14] -12, %d2
	.loc 1 319 18
	mov	%d2, 7
	st.w	[%a14] -4, %d2
	.loc 1 320 5
	lea	%a2, [%a14] -40
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 322 5
	call	multicore_signal_ready
	.loc 1 323 5
	call	jezgro_start
	.loc 1 324 1
	nop
	ret	#cpu2_main
.LFE58:
	.size cpu2_main, .-cpu2_main
	.global	cpu2_main_end
cpu2_main_end:
.srodata
.LC26:
	.string	"ctrl3"
	.section	.text.cpu3_main,"ax",@progbits
	.align 1
	.global	cpu3_main
	.type	cpu3_main, @function
cpu3_main:
.LFB59:
	.loc 1 330 1
	mov.aa	%a14, %SP
.LCFI9:
	sub.a	%SP, 40
	.loc 1 331 5
	mov	%d4, 3
	call	hal_init_core
	.loc 1 332 5
	call	scheduler_init
	.loc 1 333 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 334 5
	call	task_create_idle
	.loc 1 336 19
	lea	%a2, [%a14] -40
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 337 17
	lea	%a2, [%A0] SM:.LC26
	st.a	[%a14] -40, %a2
	.loc 1 338 17
	movh.a	%a2, hi:control_task
	lea	%a2, [%a2] lo:control_task
	st.a	[%a14] -36, %a2
	.loc 1 339 16
	mov	%d2, 3
	st.w	[%a14] -32, %d2
	.loc 1 340 21
	mov	%d2, -96
	st.b	[%a14] -28, %d2
	.loc 1 341 23
	mov	%d2, 2048
	st.w	[%a14] -24, %d2
	.loc 1 342 26
	mov	%d2, 3
	st.w	[%a14] -16, %d2
	.loc 1 343 22
	mov	%d2, 1000
	st.w	[%a14] -12, %d2
	.loc 1 344 18
	mov	%d2, 7
	st.w	[%a14] -4, %d2
	.loc 1 345 5
	lea	%a2, [%a14] -40
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 347 5
	call	multicore_signal_ready
	.loc 1 348 5
	call	jezgro_start
	.loc 1 349 1
	nop
	ret	#cpu3_main
.LFE59:
	.size cpu3_main, .-cpu3_main
	.global	cpu3_main_end
cpu3_main_end:
.srodata
.LC27:
	.string	"bg4"
	.section	.text.cpu4_main,"ax",@progbits
	.align 1
	.global	cpu4_main
	.type	cpu4_main, @function
cpu4_main:
.LFB60:
	.loc 1 355 1
	mov.aa	%a14, %SP
.LCFI10:
	sub.a	%SP, 40
	.loc 1 356 5
	mov	%d4, 4
	call	hal_init_core
	.loc 1 357 5
	call	scheduler_init
	.loc 1 358 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 359 5
	call	task_create_idle
	.loc 1 361 19
	lea	%a2, [%a14] -40
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 362 17
	lea	%a2, [%A0] SM:.LC27
	st.a	[%a14] -40, %a2
	.loc 1 363 17
	movh.a	%a2, hi:background_task
	lea	%a2, [%a2] lo:background_task
	st.a	[%a14] -36, %a2
	.loc 1 364 16
	mov	%d2, 4
	st.w	[%a14] -32, %d2
	.loc 1 365 21
	mov	%d2, 100
	st.b	[%a14] -28, %d2
	.loc 1 366 23
	mov	%d2, 2048
	st.w	[%a14] -24, %d2
	.loc 1 367 26
	mov	%d2, 4
	st.w	[%a14] -16, %d2
	.loc 1 368 5
	lea	%a2, [%a14] -40
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 370 5
	call	multicore_signal_ready
	.loc 1 371 5
	call	jezgro_start
	.loc 1 372 1
	nop
	ret	#cpu4_main
.LFE60:
	.size cpu4_main, .-cpu4_main
	.global	cpu4_main_end
cpu4_main_end:
.srodata
.LC28:
	.string	"bg5"
	.section	.text.cpu5_main,"ax",@progbits
	.align 1
	.global	cpu5_main
	.type	cpu5_main, @function
cpu5_main:
.LFB61:
	.loc 1 378 1
	mov.aa	%a14, %SP
.LCFI11:
	sub.a	%SP, 40
	.loc 1 379 5
	mov	%d4, 5
	call	hal_init_core
	.loc 1 380 5
	call	scheduler_init
	.loc 1 381 5
	movh.a	%a2, hi:scheduler_tick
	lea	%a4, [%a2] lo:scheduler_tick
	call	hal_systick_init
	.loc 1 382 5
	call	task_create_idle
	.loc 1 384 19
	lea	%a2, [%a14] -40
	lea	%a3, [%A0] SM:.LC17
		# #chunks=2, chunksize=16, remains=8
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	ld.d	%e4, [%a3+]8
	st.d	[%a2+]8, %e4
	.loc 1 385 17
	lea	%a2, [%A0] SM:.LC28
	st.a	[%a14] -40, %a2
	.loc 1 386 17
	movh.a	%a2, hi:background_task
	lea	%a2, [%a2] lo:background_task
	st.a	[%a14] -36, %a2
	.loc 1 387 16
	mov	%d2, 5
	st.w	[%a14] -32, %d2
	.loc 1 388 21
	mov	%d2, 100
	st.b	[%a14] -28, %d2
	.loc 1 389 23
	mov	%d2, 2048
	st.w	[%a14] -24, %d2
	.loc 1 390 26
	mov	%d2, 5
	st.w	[%a14] -16, %d2
	.loc 1 391 5
	lea	%a2, [%a14] -40
	mov.a	%a5, 0
	mov.aa	%a4, %a2
	call	task_create
	.loc 1 393 5
	call	multicore_signal_ready
	.loc 1 394 5
	call	jezgro_start
	.loc 1 395 1
	nop
	ret	#cpu5_main
.LFE61:
	.size cpu5_main, .-cpu5_main
	.global	cpu5_main_end
cpu5_main_end:
.srodata
.LC29:
	.string	"\r\n!!! KERNEL PANIC !!!\r\n"
.LC30:
	.string	"Core: "
.LC31:
	.string	"Message: "
	.section	.text.jezgro_panic,"ax",@progbits
	.align 1
	.global	jezgro_panic
	.type	jezgro_panic, @function
jezgro_panic:
.LFB62:
	.loc 1 405 1
	mov.aa	%a14, %SP
.LCFI12:
	sub.a	%SP, 8
	st.a	[%a14] -4, %a4
	.loc 1 406 5
	call	__disable
	.loc 1 408 5
	lea	%a4, [%A0] SM:.LC29
	call	hal_debug_puts
	.loc 1 409 5
	lea	%a4, [%A0] SM:.LC30
	call	hal_debug_puts
	.loc 1 410 5
	call	hal_get_core_id
	.loc 1 410 5 is_stmt 0 discriminator 1
	mov	%d4, %d2
	call	hal_debug_hex
	.loc 1 411 5 is_stmt 1
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
	.loc 1 412 5
	lea	%a4, [%A0] SM:.LC31
	call	hal_debug_puts
	.loc 1 413 5
	ld.a	%a4, [%a14] -4
	call	hal_debug_puts
	.loc 1 414 5
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
.L30:
	.loc 1 418 9 discriminator 1
	call	__nop
	.loc 1 418 9 is_stmt 0
	j	.L30
.LFE62:
	.size jezgro_panic, .-jezgro_panic
	.global	jezgro_panic_end
jezgro_panic_end:
.srodata
.LC32:
	.string	"DEADLINE MISS: "
.LC33:
	.string	" overrun="
.LC34:
	.string	"us\r\n"
	.section	.text.jezgro_deadline_miss_hook,"ax",@progbits
	.align 1
	.global	jezgro_deadline_miss_hook
	.type	jezgro_deadline_miss_hook, @function
jezgro_deadline_miss_hook:
.LFB63:
	.loc 1 426 1 is_stmt 1
	mov.aa	%a14, %SP
.LCFI13:
	sub.a	%SP, 8
	st.a	[%a14] -4, %a4
	st.w	[%a14] -8, %d4
	.loc 1 427 5
	lea	%a4, [%A0] SM:.LC32
	call	hal_debug_puts
	.loc 1 428 5
	ld.a	%a4, [%a14] -4
	call	task_get_name
	mov.d	%d2, %a2
	.loc 1 428 5 is_stmt 0 discriminator 1
	mov.a	%a4, %d2
	call	hal_debug_puts
	.loc 1 429 5 is_stmt 1
	lea	%a4, [%A0] SM:.LC33
	call	hal_debug_puts
	.loc 1 430 5
	ld.w	%d4, [%a14] -8
	call	hal_debug_hex
	.loc 1 431 5
	lea	%a4, [%A0] SM:.LC34
	call	hal_debug_puts
	.loc 1 433 13
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	lea	%a2, [%a2] 32
	ld.w	%d2, [%a2]0
	.loc 1 433 25
	add	%d2, 1
	movh.a	%a2, hi:g_system
	lea	%a2, [%a2] lo:g_system
	lea	%a2, [%a2] 32
	st.w	[%a2]0, %d2
	.loc 1 434 1
	nop
	ret	#jezgro_deadline_miss_hook
.LFE63:
	.size jezgro_deadline_miss_hook, .-jezgro_deadline_miss_hook
	.global	jezgro_deadline_miss_hook_end
jezgro_deadline_miss_hook_end:
.srodata
.LC35:
	.string	"STACK OVERFLOW: "
.LC36:
	.string	"Stack overflow"
	.section	.text.jezgro_stack_overflow_hook,"ax",@progbits
	.align 1
	.global	jezgro_stack_overflow_hook
	.type	jezgro_stack_overflow_hook, @function
jezgro_stack_overflow_hook:
.LFB64:
	.loc 1 440 1
	mov.aa	%a14, %SP
.LCFI14:
	sub.a	%SP, 8
	st.a	[%a14] -4, %a4
	.loc 1 441 5
	lea	%a4, [%A0] SM:.LC35
	call	hal_debug_puts
	.loc 1 442 5
	ld.a	%a4, [%a14] -4
	call	task_get_name
	mov.d	%d2, %a2
	.loc 1 442 5 is_stmt 0 discriminator 1
	mov.a	%a4, %d2
	call	hal_debug_puts
	.loc 1 443 5 is_stmt 1
	lea	%a4, [%A0] SM:.LC8
	call	hal_debug_puts
	.loc 1 445 5
	lea	%a4, [%A0] SM:.LC36
	j	jezgro_panic
.LFE64:
	.size jezgro_stack_overflow_hook, .-jezgro_stack_overflow_hook
	.global	jezgro_stack_overflow_hook_end
jezgro_stack_overflow_hook_end:
.srodata
.LC37:
	.string	"1.0.0-tricore"
	.section	.text.jezgro_version,"ax",@progbits
	.align 1
	.global	jezgro_version
	.type	jezgro_version, @function
jezgro_version:
.LFB65:
	.loc 1 453 1
	mov.aa	%a14, %SP
.LCFI15:
	.loc 1 454 12
	lea	%a2, [%A0] SM:.LC37
	.loc 1 454 12 is_stmt 0 discriminator 1
	mov.d	%d2, %a2
	.loc 1 455 1 is_stmt 1
	mov.a	%a2, %d2
	ret	#jezgro_version
.LFE65:
	.size jezgro_version, .-jezgro_version
	.global	jezgro_version_end
jezgro_version_end:
	.section	.text.jezgro_init,"ax",@progbits
	.align 1
	.global	jezgro_init
	.type	jezgro_init, @function
jezgro_init:
.LFB66:
	.loc 1 458 1
	mov.aa	%a14, %SP
.LCFI16:
	.loc 1 460 12
	mov	%d2, 0
	.loc 1 461 1
	ret	#jezgro_init
.LFE66:
	.size jezgro_init, .-jezgro_init
	.global	jezgro_init_end
jezgro_init_end:
	.section	.text.jezgro_start,"ax",@progbits
	.align 1
	.global	jezgro_start
	.type	jezgro_start, @function
jezgro_start:
.LFB67:
	.loc 1 464 1
	mov.aa	%a14, %SP
.LCFI17:
	.loc 1 465 5
	j	scheduler_start
.LFE67:
	.size jezgro_start, .-jezgro_start
	.global	jezgro_start_end
jezgro_start_end:
	.section	.text.jezgro_get_state,"ax",@progbits
	.align 1
	.global	jezgro_get_state
	.type	jezgro_get_state, @function
jezgro_get_state:
.LFB68:
	.loc 1 469 1
	mov.aa	%a14, %SP
.LCFI18:
	.loc 1 470 12
	mov	%d2, 1
	.loc 1 471 1
	ret	#jezgro_get_state
.LFE68:
	.size jezgro_get_state, .-jezgro_get_state
	.global	jezgro_get_state_end
jezgro_get_state_end:
	.section	.text.jezgro_get_ticks,"ax",@progbits
	.align 1
	.global	jezgro_get_ticks
	.type	jezgro_get_ticks, @function
jezgro_get_ticks:
.LFB69:
	.loc 1 474 1
	mov.aa	%a14, %SP
.LCFI19:
	.loc 1 475 12
	call	scheduler_get_ticks
	.loc 1 476 1
	ret	#jezgro_get_ticks
.LFE69:
	.size jezgro_get_ticks, .-jezgro_get_ticks
	.global	jezgro_get_ticks_end
jezgro_get_ticks_end:
	.section	.text.jezgro_get_time_us,"ax",@progbits
	.align 1
	.global	jezgro_get_time_us
	.type	jezgro_get_time_us, @function
jezgro_get_time_us:
.LFB70:
	.loc 1 479 1
	mov.aa	%a14, %SP
.LCFI20:
	.loc 1 480 12
	call	hal_get_time_us
	.loc 1 481 1
	ret	#jezgro_get_time_us
.LFE70:
	.size jezgro_get_time_us, .-jezgro_get_time_us
	.global	jezgro_get_time_us_end
jezgro_get_time_us_end:
	.section	.text.jezgro_ticks_to_ms,"ax",@progbits
	.align 1
	.global	jezgro_ticks_to_ms
	.type	jezgro_ticks_to_ms, @function
jezgro_ticks_to_ms:
.LFB71:
	.loc 1 484 1
	mov.aa	%a14, %SP
.LCFI21:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 485 12
	ld.w	%d2, [%a14] -4
	.loc 1 486 1
	ret	#jezgro_ticks_to_ms
.LFE71:
	.size jezgro_ticks_to_ms, .-jezgro_ticks_to_ms
	.global	jezgro_ticks_to_ms_end
jezgro_ticks_to_ms_end:
	.section	.text.jezgro_ms_to_ticks,"ax",@progbits
	.align 1
	.global	jezgro_ms_to_ticks
	.type	jezgro_ms_to_ticks, @function
jezgro_ms_to_ticks:
.LFB72:
	.loc 1 489 1
	mov.aa	%a14, %SP
.LCFI22:
	sub.a	%SP, 8
	st.w	[%a14] -4, %d4
	.loc 1 490 12
	ld.w	%d2, [%a14] -4
	.loc 1 491 1
	ret	#jezgro_ms_to_ticks
.LFE72:
	.size jezgro_ms_to_ticks, .-jezgro_ms_to_ticks
	.global	jezgro_ms_to_ticks_end
jezgro_ms_to_ticks_end:
	.section	.text.jezgro_in_isr,"ax",@progbits
	.align 1
	.global	jezgro_in_isr
	.type	jezgro_in_isr, @function
jezgro_in_isr:
.LFB73:
	.loc 1 494 1
	mov.aa	%a14, %SP
.LCFI23:
	sub.a	%SP, 8
.LBB7:
	.loc 1 496 20
#APP
	# 496 "src/main.c" 1
	mfcr %d2, 65068
	# 0 "" 2
#NO_APP
	st.w	[%a14] -4, %d2
	ld.w	%d2, [%a14] -4
.LBE7:
	.loc 1 496 14
	st.w	[%a14] -8, %d2
	.loc 1 497 17
	ld.w	%d2, [%a14] -8
	and	%d2, %d2, 255
	.loc 1 497 34
	ne	%d2, %d2, 0
	and	%d2, %d2, 255
	.loc 1 498 1
	ret	#jezgro_in_isr
.LFE73:
	.size jezgro_in_isr, .-jezgro_in_isr
	.global	jezgro_in_isr_end
jezgro_in_isr_end:
	.section	.text.jezgro_enter_critical,"ax",@progbits
	.align 1
	.global	jezgro_enter_critical
	.type	jezgro_enter_critical, @function
jezgro_enter_critical:
.LFB74:
	.loc 1 501 1
	mov.aa	%a14, %SP
.LCFI24:
	.loc 1 502 5
	call	hal_enter_critical
	.loc 1 503 1
	nop
	ret	#jezgro_enter_critical
.LFE74:
	.size jezgro_enter_critical, .-jezgro_enter_critical
	.global	jezgro_enter_critical_end
jezgro_enter_critical_end:
	.section	.text.jezgro_exit_critical,"ax",@progbits
	.align 1
	.global	jezgro_exit_critical
	.type	jezgro_exit_critical, @function
jezgro_exit_critical:
.LFB75:
	.loc 1 506 1
	mov.aa	%a14, %SP
.LCFI25:
	.loc 1 507 5
	call	hal_exit_critical
	.loc 1 508 1
	nop
	ret	#jezgro_exit_critical
.LFE75:
	.size jezgro_exit_critical, .-jezgro_exit_critical
	.global	jezgro_exit_critical_end
jezgro_exit_critical_end:
	.section	.prev_heartbeat.0,"aw"
	.align 2
	.type	prev_heartbeat.0, @object
	.size	prev_heartbeat.0, 24
prev_heartbeat.0:
	.zero	24
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
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.byte	0x4
	.uaword	.LCFI1-.LFB8
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE2:
.LSFDE4:
	.uaword	.LEFDE4-.LASFDE4
.LASFDE4:
	.uaword	.Lframe0
	.uaword	.LFB52
	.uaword	.LFE52-.LFB52
	.byte	0x4
	.uaword	.LCFI2-.LFB52
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE4:
.LSFDE6:
	.uaword	.LEFDE6-.LASFDE6
.LASFDE6:
	.uaword	.Lframe0
	.uaword	.LFB53
	.uaword	.LFE53-.LFB53
	.byte	0x4
	.uaword	.LCFI3-.LFB53
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE6:
.LSFDE8:
	.uaword	.LEFDE8-.LASFDE8
.LASFDE8:
	.uaword	.Lframe0
	.uaword	.LFB54
	.uaword	.LFE54-.LFB54
	.byte	0x4
	.uaword	.LCFI4-.LFB54
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE8:
.LSFDE10:
	.uaword	.LEFDE10-.LASFDE10
.LASFDE10:
	.uaword	.Lframe0
	.uaword	.LFB55
	.uaword	.LFE55-.LFB55
	.byte	0x4
	.uaword	.LCFI5-.LFB55
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE10:
.LSFDE12:
	.uaword	.LEFDE12-.LASFDE12
.LASFDE12:
	.uaword	.Lframe0
	.uaword	.LFB56
	.uaword	.LFE56-.LFB56
	.byte	0x4
	.uaword	.LCFI6-.LFB56
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE12:
.LSFDE14:
	.uaword	.LEFDE14-.LASFDE14
.LASFDE14:
	.uaword	.Lframe0
	.uaword	.LFB57
	.uaword	.LFE57-.LFB57
	.byte	0x4
	.uaword	.LCFI7-.LFB57
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE14:
.LSFDE16:
	.uaword	.LEFDE16-.LASFDE16
.LASFDE16:
	.uaword	.Lframe0
	.uaword	.LFB58
	.uaword	.LFE58-.LFB58
	.byte	0x4
	.uaword	.LCFI8-.LFB58
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE16:
.LSFDE18:
	.uaword	.LEFDE18-.LASFDE18
.LASFDE18:
	.uaword	.Lframe0
	.uaword	.LFB59
	.uaword	.LFE59-.LFB59
	.byte	0x4
	.uaword	.LCFI9-.LFB59
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE18:
.LSFDE20:
	.uaword	.LEFDE20-.LASFDE20
.LASFDE20:
	.uaword	.Lframe0
	.uaword	.LFB60
	.uaword	.LFE60-.LFB60
	.byte	0x4
	.uaword	.LCFI10-.LFB60
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE20:
.LSFDE22:
	.uaword	.LEFDE22-.LASFDE22
.LASFDE22:
	.uaword	.Lframe0
	.uaword	.LFB61
	.uaword	.LFE61-.LFB61
	.byte	0x4
	.uaword	.LCFI11-.LFB61
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE22:
.LSFDE24:
	.uaword	.LEFDE24-.LASFDE24
.LASFDE24:
	.uaword	.Lframe0
	.uaword	.LFB62
	.uaword	.LFE62-.LFB62
	.byte	0x4
	.uaword	.LCFI12-.LFB62
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE24:
.LSFDE26:
	.uaword	.LEFDE26-.LASFDE26
.LASFDE26:
	.uaword	.Lframe0
	.uaword	.LFB63
	.uaword	.LFE63-.LFB63
	.byte	0x4
	.uaword	.LCFI13-.LFB63
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE26:
.LSFDE28:
	.uaword	.LEFDE28-.LASFDE28
.LASFDE28:
	.uaword	.Lframe0
	.uaword	.LFB64
	.uaword	.LFE64-.LFB64
	.byte	0x4
	.uaword	.LCFI14-.LFB64
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE28:
.LSFDE30:
	.uaword	.LEFDE30-.LASFDE30
.LASFDE30:
	.uaword	.Lframe0
	.uaword	.LFB65
	.uaword	.LFE65-.LFB65
	.byte	0x4
	.uaword	.LCFI15-.LFB65
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE30:
.LSFDE32:
	.uaword	.LEFDE32-.LASFDE32
.LASFDE32:
	.uaword	.Lframe0
	.uaword	.LFB66
	.uaword	.LFE66-.LFB66
	.byte	0x4
	.uaword	.LCFI16-.LFB66
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE32:
.LSFDE34:
	.uaword	.LEFDE34-.LASFDE34
.LASFDE34:
	.uaword	.Lframe0
	.uaword	.LFB67
	.uaword	.LFE67-.LFB67
	.byte	0x4
	.uaword	.LCFI17-.LFB67
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE34:
.LSFDE36:
	.uaword	.LEFDE36-.LASFDE36
.LASFDE36:
	.uaword	.Lframe0
	.uaword	.LFB68
	.uaword	.LFE68-.LFB68
	.byte	0x4
	.uaword	.LCFI18-.LFB68
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE36:
.LSFDE38:
	.uaword	.LEFDE38-.LASFDE38
.LASFDE38:
	.uaword	.Lframe0
	.uaword	.LFB69
	.uaword	.LFE69-.LFB69
	.byte	0x4
	.uaword	.LCFI19-.LFB69
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE38:
.LSFDE40:
	.uaword	.LEFDE40-.LASFDE40
.LASFDE40:
	.uaword	.Lframe0
	.uaword	.LFB70
	.uaword	.LFE70-.LFB70
	.byte	0x4
	.uaword	.LCFI20-.LFB70
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE40:
.LSFDE42:
	.uaword	.LEFDE42-.LASFDE42
.LASFDE42:
	.uaword	.Lframe0
	.uaword	.LFB71
	.uaword	.LFE71-.LFB71
	.byte	0x4
	.uaword	.LCFI21-.LFB71
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE42:
.LSFDE44:
	.uaword	.LEFDE44-.LASFDE44
.LASFDE44:
	.uaword	.Lframe0
	.uaword	.LFB72
	.uaword	.LFE72-.LFB72
	.byte	0x4
	.uaword	.LCFI22-.LFB72
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE44:
.LSFDE46:
	.uaword	.LEFDE46-.LASFDE46
.LASFDE46:
	.uaword	.Lframe0
	.uaword	.LFB73
	.uaword	.LFE73-.LFB73
	.byte	0x4
	.uaword	.LCFI23-.LFB73
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE46:
.LSFDE48:
	.uaword	.LEFDE48-.LASFDE48
.LASFDE48:
	.uaword	.Lframe0
	.uaword	.LFB74
	.uaword	.LFE74-.LFB74
	.byte	0x4
	.uaword	.LCFI24-.LFB74
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE48:
.LSFDE50:
	.uaword	.LEFDE50-.LASFDE50
.LASFDE50:
	.uaword	.Lframe0
	.uaword	.LFB75
	.uaword	.LFE75-.LFB75
	.byte	0x4
	.uaword	.LCFI25-.LFB75
	.byte	0xd
	.uleb128 0x1e
	.align 2
.LEFDE50:
.section .text,"ax",@progbits
.Letext0:
	.file 3 "C:/tricore-gcc/tricore-elf/include/machine/_default_types.h"
	.file 4 "C:/tricore-gcc/tricore-elf/include/sys/_stdint.h"
	.file 5 "src/kernel/jezgro.h"
	.file 6 "src/kernel/task.h"
	.file 7 "src/kernel/sync.h"
	.file 8 "src/hal/hal.h"
	.file 9 "src/kernel/scheduler.h"
	.file 10 "src/arch/tricore_multicore.h"
	.file 11 "src/kernel/ipc.h"
	.section	.debug_info,"",@progbits
.Ldebug_info0:
	.uaword	0x1279
	.uahalf	0x4
	.uaword	.Ldebug_abbrev0
	.byte	0x4
	.uleb128 0x1
	.string	"GNU C17 13.4.0 -mtc162 -mcpu=tc39xx -msmall-data=0 -msmall-const=0 -g3 -gdwarf-4 -O0 -ffunction-sections -fdata-sections -fno-common -fno-section-anchors -fno-merge-constants"
	.byte	0xc
	.string	"src/main.c"
	.string	"D:\\work\\autobusi-punjaci\\pre-hw-dev-tricore"
	.uaword	.Ldebug_ranges0+0
	.uaword	0
	.uaword	.Ldebug_line0
	.uaword	.Ldebug_macro0
	.uleb128 0x2
	.byte	0x4
	.byte	0x5
	.string	"long int"
	.uleb128 0x2
	.byte	0x4
	.byte	0x7
	.string	"long unsigned int"
	.uleb128 0x2
	.byte	0x4
	.byte	0x5
	.string	"int"
	.uleb128 0x2
	.byte	0x8
	.byte	0x5
	.string	"long long int"
	.uleb128 0x2
	.byte	0x8
	.byte	0x4
	.string	"long double"
	.uleb128 0x2
	.byte	0x1
	.byte	0x6
	.string	"signed char"
	.uleb128 0x3
	.string	"__uint8_t"
	.byte	0x3
	.byte	0x2b
	.byte	0x18
	.uaword	0x16c
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
	.uleb128 0x3
	.string	"__uint32_t"
	.byte	0x3
	.byte	0x4f
	.byte	0x19
	.uaword	0x10f
	.uleb128 0x2
	.byte	0x8
	.byte	0x7
	.string	"long long unsigned int"
	.uleb128 0x3
	.string	"__uintptr_t"
	.byte	0x3
	.byte	0xe8
	.byte	0x1a
	.uaword	0x10f
	.uleb128 0x3
	.string	"uint8_t"
	.byte	0x4
	.byte	0x18
	.byte	0x13
	.uaword	0x15a
	.uleb128 0x3
	.string	"uint32_t"
	.byte	0x4
	.byte	0x30
	.byte	0x14
	.uaword	0x1a0
	.uleb128 0x4
	.uaword	0x1f1
	.uleb128 0x3
	.string	"uintptr_t"
	.byte	0x4
	.byte	0x52
	.byte	0x15
	.uaword	0x1cd
	.uleb128 0x2
	.byte	0x4
	.byte	0x7
	.string	"unsigned int"
	.uleb128 0x5
	.byte	0x5
	.byte	0x4
	.uaword	0x124
	.byte	0x5
	.byte	0x52
	.byte	0xe
	.uaword	0x33e
	.uleb128 0x6
	.string	"JEZGRO_OK"
	.byte	0
	.uleb128 0x7
	.string	"JEZGRO_ERROR"
	.sleb128 -1
	.uleb128 0x7
	.string	"JEZGRO_ERROR_NOMEM"
	.sleb128 -2
	.uleb128 0x7
	.string	"JEZGRO_ERROR_PARAM"
	.sleb128 -3
	.uleb128 0x7
	.string	"JEZGRO_ERROR_STATE"
	.sleb128 -4
	.uleb128 0x7
	.string	"JEZGRO_ERROR_TIMEOUT"
	.sleb128 -5
	.uleb128 0x7
	.string	"JEZGRO_ERROR_BUSY"
	.sleb128 -6
	.uleb128 0x7
	.string	"JEZGRO_ERROR_FULL"
	.sleb128 -7
	.uleb128 0x7
	.string	"JEZGRO_ERROR_EMPTY"
	.sleb128 -8
	.uleb128 0x7
	.string	"JEZGRO_ERROR_DELETED"
	.sleb128 -9
	.uleb128 0x7
	.string	"JEZGRO_ERROR_ISR"
	.sleb128 -10
	.uleb128 0x7
	.string	"JEZGRO_ERROR_NOTASK"
	.sleb128 -11
	.uleb128 0x7
	.string	"JEZGRO_ERROR_DEADLINE"
	.sleb128 -12
	.byte	0
	.uleb128 0x3
	.string	"jezgro_error_t"
	.byte	0x5
	.byte	0x60
	.byte	0x3
	.uaword	0x229
	.uleb128 0x5
	.byte	0x7
	.byte	0x4
	.uaword	0x219
	.byte	0x5
	.byte	0x66
	.byte	0xe
	.uaword	0x3e6
	.uleb128 0x6
	.string	"TASK_STATE_INACTIVE"
	.byte	0
	.uleb128 0x6
	.string	"TASK_STATE_READY"
	.byte	0x1
	.uleb128 0x6
	.string	"TASK_STATE_RUNNING"
	.byte	0x2
	.uleb128 0x6
	.string	"TASK_STATE_BLOCKED"
	.byte	0x3
	.uleb128 0x6
	.string	"TASK_STATE_SUSPENDED"
	.byte	0x4
	.uleb128 0x6
	.string	"TASK_STATE_TERMINATED"
	.byte	0x5
	.byte	0
	.uleb128 0x3
	.string	"task_state_t"
	.byte	0x5
	.byte	0x6d
	.byte	0x3
	.uaword	0x355
	.uleb128 0x5
	.byte	0x7
	.byte	0x4
	.uaword	0x219
	.byte	0x5
	.byte	0x76
	.byte	0xe
	.uaword	0x46f
	.uleb128 0x6
	.string	"TASK_FLAG_NONE"
	.byte	0
	.uleb128 0x6
	.string	"TASK_FLAG_PERIODIC"
	.byte	0x1
	.uleb128 0x6
	.string	"TASK_FLAG_REALTIME"
	.byte	0x2
	.uleb128 0x6
	.string	"TASK_FLAG_SAFETY"
	.byte	0x4
	.uleb128 0x6
	.string	"TASK_FLAG_PRIVILEGED"
	.byte	0x8
	.byte	0
	.uleb128 0x3
	.string	"task_flags_t"
	.byte	0x5
	.byte	0x7c
	.byte	0x3
	.uaword	0x3fb
	.uleb128 0x3
	.string	"task_func_t"
	.byte	0x5
	.byte	0x81
	.byte	0x10
	.uaword	0x498
	.uleb128 0x8
	.byte	0x4
	.uaword	0x49e
	.uleb128 0x9
	.uaword	0x4a9
	.uleb128 0xa
	.uaword	0x4a9
	.byte	0
	.uleb128 0xb
	.byte	0x4
	.uleb128 0x3
	.string	"task_handle_t"
	.byte	0x5
	.byte	0x86
	.byte	0x24
	.uaword	0x4c1
	.uleb128 0x8
	.byte	0x4
	.uaword	0x4c7
	.uleb128 0xc
	.string	"task_control_block"
	.byte	0x7c
	.byte	0x6
	.byte	0x1c
	.byte	0x10
	.uaword	0x71d
	.uleb128 0xd
	.string	"name"
	.byte	0x6
	.byte	0x1e
	.byte	0x15
	.uaword	0x8c8
	.byte	0
	.uleb128 0xd
	.string	"id"
	.byte	0x6
	.byte	0x1f
	.byte	0x15
	.uaword	0x1f1
	.byte	0x10
	.uleb128 0xe
	.uaword	.LASF0
	.byte	0x6
	.byte	0x20
	.byte	0x15
	.uaword	0x1f1
	.byte	0x14
	.uleb128 0xd
	.string	"state"
	.byte	0x6
	.byte	0x23
	.byte	0x15
	.uaword	0x3e6
	.byte	0x18
	.uleb128 0xd
	.string	"flags"
	.byte	0x6
	.byte	0x24
	.byte	0x15
	.uaword	0x46f
	.byte	0x1c
	.uleb128 0xd
	.string	"base_priority"
	.byte	0x6
	.byte	0x27
	.byte	0x15
	.uaword	0x1e1
	.byte	0x20
	.uleb128 0xd
	.string	"effective_priority"
	.byte	0x6
	.byte	0x28
	.byte	0x15
	.uaword	0x1e1
	.byte	0x21
	.uleb128 0xd
	.string	"deadline"
	.byte	0x6
	.byte	0x2b
	.byte	0x15
	.uaword	0x1f1
	.byte	0x24
	.uleb128 0xe
	.uaword	.LASF1
	.byte	0x6
	.byte	0x2c
	.byte	0x15
	.uaword	0x1f1
	.byte	0x28
	.uleb128 0xd
	.string	"relative_deadline_us"
	.byte	0x6
	.byte	0x2d
	.byte	0x15
	.uaword	0x1f1
	.byte	0x2c
	.uleb128 0xd
	.string	"context_pcxi"
	.byte	0x6
	.byte	0x30
	.byte	0x15
	.uaword	0x1f1
	.byte	0x30
	.uleb128 0xe
	.uaword	.LASF2
	.byte	0x6
	.byte	0x33
	.byte	0x16
	.uaword	0x4a9
	.byte	0x34
	.uleb128 0xe
	.uaword	.LASF3
	.byte	0x6
	.byte	0x34
	.byte	0x15
	.uaword	0x1f1
	.byte	0x38
	.uleb128 0xd
	.string	"stack_top"
	.byte	0x6
	.byte	0x35
	.byte	0x16
	.uaword	0x4a9
	.byte	0x3c
	.uleb128 0xd
	.string	"entry_func"
	.byte	0x6
	.byte	0x38
	.byte	0x15
	.uaword	0x484
	.byte	0x40
	.uleb128 0xd
	.string	"entry_arg"
	.byte	0x6
	.byte	0x39
	.byte	0x16
	.uaword	0x4a9
	.byte	0x44
	.uleb128 0xd
	.string	"wake_time"
	.byte	0x6
	.byte	0x3c
	.byte	0x15
	.uaword	0x1f1
	.byte	0x48
	.uleb128 0xd
	.string	"timeout_result"
	.byte	0x6
	.byte	0x3d
	.byte	0x15
	.uaword	0x33e
	.byte	0x4c
	.uleb128 0xd
	.string	"run_count"
	.byte	0x6
	.byte	0x40
	.byte	0x15
	.uaword	0x1f1
	.byte	0x50
	.uleb128 0xd
	.string	"total_run_time"
	.byte	0x6
	.byte	0x41
	.byte	0x15
	.uaword	0x1f1
	.byte	0x54
	.uleb128 0xd
	.string	"last_run_time"
	.byte	0x6
	.byte	0x42
	.byte	0x15
	.uaword	0x1f1
	.byte	0x58
	.uleb128 0xd
	.string	"max_run_time"
	.byte	0x6
	.byte	0x43
	.byte	0x15
	.uaword	0x1f1
	.byte	0x5c
	.uleb128 0xd
	.string	"deadlines_missed"
	.byte	0x6
	.byte	0x44
	.byte	0x15
	.uaword	0x1f1
	.byte	0x60
	.uleb128 0xd
	.string	"next_ready"
	.byte	0x6
	.byte	0x47
	.byte	0x20
	.uaword	0x4c1
	.byte	0x64
	.uleb128 0xd
	.string	"next_delay"
	.byte	0x6
	.byte	0x48
	.byte	0x20
	.uaword	0x4c1
	.byte	0x68
	.uleb128 0xd
	.string	"next_blocked"
	.byte	0x6
	.byte	0x49
	.byte	0x20
	.uaword	0x4c1
	.byte	0x6c
	.uleb128 0xd
	.string	"blocked_on"
	.byte	0x6
	.byte	0x4c
	.byte	0x16
	.uaword	0x4a9
	.byte	0x70
	.uleb128 0xd
	.string	"blocked_reason"
	.byte	0x6
	.byte	0x4d
	.byte	0x15
	.uaword	0x1f1
	.byte	0x74
	.uleb128 0xd
	.string	"user_data"
	.byte	0x6
	.byte	0x50
	.byte	0x16
	.uaword	0x4a9
	.byte	0x78
	.byte	0
	.uleb128 0xf
	.byte	0x28
	.byte	0x5
	.byte	0x8b
	.byte	0x9
	.uaword	0x7c4
	.uleb128 0xd
	.string	"name"
	.byte	0x5
	.byte	0x8c
	.byte	0x16
	.uaword	0x7c4
	.byte	0
	.uleb128 0xd
	.string	"func"
	.byte	0x5
	.byte	0x8d
	.byte	0x15
	.uaword	0x484
	.byte	0x4
	.uleb128 0xd
	.string	"arg"
	.byte	0x5
	.byte	0x8e
	.byte	0x16
	.uaword	0x4a9
	.byte	0x8
	.uleb128 0xd
	.string	"priority"
	.byte	0x5
	.byte	0x8f
	.byte	0x15
	.uaword	0x1e1
	.byte	0xc
	.uleb128 0xe
	.uaword	.LASF3
	.byte	0x5
	.byte	0x90
	.byte	0x15
	.uaword	0x1f1
	.byte	0x10
	.uleb128 0xe
	.uaword	.LASF2
	.byte	0x5
	.byte	0x91
	.byte	0x16
	.uaword	0x4a9
	.byte	0x14
	.uleb128 0xd
	.string	"core_affinity"
	.byte	0x5
	.byte	0x92
	.byte	0x15
	.uaword	0x1f1
	.byte	0x18
	.uleb128 0xe
	.uaword	.LASF1
	.byte	0x5
	.byte	0x93
	.byte	0x15
	.uaword	0x1f1
	.byte	0x1c
	.uleb128 0xd
	.string	"deadline_us"
	.byte	0x5
	.byte	0x94
	.byte	0x15
	.uaword	0x1f1
	.byte	0x20
	.uleb128 0xd
	.string	"flags"
	.byte	0x5
	.byte	0x95
	.byte	0x15
	.uaword	0x46f
	.byte	0x24
	.byte	0
	.uleb128 0x8
	.byte	0x4
	.uaword	0x7d2
	.uleb128 0x2
	.byte	0x1
	.byte	0x6
	.string	"char"
	.uleb128 0x10
	.uaword	0x7ca
	.uleb128 0x3
	.string	"task_params_t"
	.byte	0x5
	.byte	0x96
	.byte	0x3
	.uaword	0x71d
	.uleb128 0x10
	.uaword	0x7d7
	.uleb128 0x5
	.byte	0x7
	.byte	0x4
	.uaword	0x219
	.byte	0x5
	.byte	0xaa
	.byte	0xe
	.uaword	0x85a
	.uleb128 0x6
	.string	"KERNEL_STATE_INIT"
	.byte	0
	.uleb128 0x6
	.string	"KERNEL_STATE_RUNNING"
	.byte	0x1
	.uleb128 0x6
	.string	"KERNEL_STATE_SUSPENDED"
	.byte	0x2
	.uleb128 0x6
	.string	"KERNEL_STATE_PANIC"
	.byte	0x3
	.byte	0
	.uleb128 0x3
	.string	"kernel_state_t"
	.byte	0x5
	.byte	0xaf
	.byte	0x3
	.uaword	0x7f2
	.uleb128 0x2
	.byte	0x1
	.byte	0x2
	.string	"_Bool"
	.uleb128 0x4
	.uaword	0x871
	.uleb128 0x3
	.string	"jezgro_time_us_t"
	.byte	0x5
	.byte	0xc3
	.byte	0x12
	.uaword	0x1f1
	.uleb128 0x3
	.string	"jezgro_time_ms_t"
	.byte	0x5
	.byte	0xc6
	.byte	0x12
	.uaword	0x1f1
	.uleb128 0x3
	.string	"jezgro_ticks_t"
	.byte	0x5
	.byte	0xc9
	.byte	0x12
	.uaword	0x1f1
	.uleb128 0x11
	.uaword	0x7ca
	.uaword	0x8d8
	.uleb128 0x12
	.uaword	0x10f
	.byte	0xf
	.byte	0
	.uleb128 0xf
	.byte	0xc
	.byte	0x7
	.byte	0x22
	.byte	0x9
	.uaword	0x912
	.uleb128 0xd
	.string	"lock"
	.byte	0x7
	.byte	0x23
	.byte	0x17
	.uaword	0x202
	.byte	0
	.uleb128 0xd
	.string	"owner_core"
	.byte	0x7
	.byte	0x24
	.byte	0xe
	.uaword	0x1f1
	.byte	0x4
	.uleb128 0xd
	.string	"name"
	.byte	0x7
	.byte	0x25
	.byte	0x11
	.uaword	0x7c4
	.byte	0x8
	.byte	0
	.uleb128 0x3
	.string	"sync_spinlock_t"
	.byte	0x7
	.byte	0x26
	.byte	0x3
	.uaword	0x8d8
	.uleb128 0x3
	.string	"hal_systick_callback_t"
	.byte	0x8
	.byte	0xc1
	.byte	0x10
	.uaword	0x949
	.uleb128 0x8
	.byte	0x4
	.uaword	0x94f
	.uleb128 0x13
	.uleb128 0xf
	.byte	0x24
	.byte	0x1
	.byte	0x2f
	.byte	0x9
	.uaword	0x9ae
	.uleb128 0xd
	.string	"heartbeat"
	.byte	0x1
	.byte	0x30
	.byte	0x17
	.uaword	0x9be
	.byte	0
	.uleb128 0xd
	.string	"core_ready"
	.byte	0x1
	.byte	0x31
	.byte	0x13
	.uaword	0x9d3
	.byte	0x18
	.uleb128 0xd
	.string	"system_running"
	.byte	0x1
	.byte	0x32
	.byte	0x13
	.uaword	0x87a
	.byte	0x1e
	.uleb128 0xd
	.string	"error_count"
	.byte	0x1
	.byte	0x33
	.byte	0x17
	.uaword	0x202
	.byte	0x20
	.byte	0
	.uleb128 0x11
	.uaword	0x202
	.uaword	0x9be
	.uleb128 0x12
	.uaword	0x10f
	.byte	0x5
	.byte	0
	.uleb128 0x4
	.uaword	0x9ae
	.uleb128 0x11
	.uaword	0x87a
	.uaword	0x9d3
	.uleb128 0x12
	.uaword	0x10f
	.byte	0x5
	.byte	0
	.uleb128 0x4
	.uaword	0x9c3
	.uleb128 0x3
	.string	"system_state_t"
	.byte	0x1
	.byte	0x34
	.byte	0x3
	.uaword	0x950
	.uleb128 0x14
	.string	"g_system"
	.byte	0x1
	.byte	0x36
	.byte	0x17
	.uaword	0x9d8
	.uleb128 0x5
	.byte	0x3
	.uaword	g_system
	.uleb128 0x14
	.string	"g_state_lock"
	.byte	0x1
	.byte	0x39
	.byte	0x18
	.uaword	0x912
	.uleb128 0x5
	.byte	0x3
	.uaword	g_state_lock
	.uleb128 0x15
	.string	"hal_exit_critical"
	.byte	0x8
	.byte	0x87
	.byte	0xa
	.uaword	0x1f1
	.uleb128 0x15
	.string	"hal_enter_critical"
	.byte	0x8
	.byte	0x7e
	.byte	0xa
	.uaword	0x1f1
	.uleb128 0x15
	.string	"hal_get_time_us"
	.byte	0x8
	.byte	0x9a
	.byte	0xa
	.uaword	0x1f1
	.uleb128 0x15
	.string	"scheduler_get_ticks"
	.byte	0x9
	.byte	0xd0
	.byte	0x10
	.uaword	0x8b1
	.uleb128 0x16
	.string	"scheduler_start"
	.byte	0x9
	.byte	0x4f
	.byte	0x6
	.uleb128 0x17
	.string	"task_get_name"
	.byte	0x6
	.byte	0xa2
	.byte	0xd
	.uaword	0x7c4
	.uaword	0xabe
	.uleb128 0xa
	.uaword	0x4ab
	.byte	0
	.uleb128 0x15
	.string	"hal_get_core_id"
	.byte	0x8
	.byte	0x43
	.byte	0xa
	.uaword	0x1f1
	.uleb128 0x18
	.string	"multicore_signal_ready"
	.byte	0xa
	.byte	0xcc
	.byte	0x6
	.uleb128 0x17
	.string	"multicore_wait_all_ready"
	.byte	0xa
	.byte	0xc5
	.byte	0x6
	.uaword	0x871
	.uaword	0xb1c
	.uleb128 0xa
	.uaword	0x1f1
	.byte	0
	.uleb128 0x15
	.string	"multicore_start_all"
	.byte	0xa
	.byte	0xb6
	.byte	0x5
	.uaword	0x124
	.uleb128 0x17
	.string	"task_create"
	.byte	0x6
	.byte	0x62
	.byte	0x10
	.uaword	0x33e
	.uaword	0xb5b
	.uleb128 0xa
	.uaword	0xb5b
	.uleb128 0xa
	.uaword	0xb61
	.byte	0
	.uleb128 0x8
	.byte	0x4
	.uaword	0x7ed
	.uleb128 0x8
	.byte	0x4
	.uaword	0x4ab
	.uleb128 0x19
	.string	"task_create_idle"
	.byte	0x6
	.uahalf	0x155
	.byte	0x10
	.uaword	0x33e
	.uleb128 0x18
	.string	"scheduler_tick"
	.byte	0x9
	.byte	0xca
	.byte	0x6
	.uleb128 0x17
	.string	"hal_systick_init"
	.byte	0x8
	.byte	0xcb
	.byte	0x5
	.uaword	0x124
	.uaword	0xbb7
	.uleb128 0xa
	.uaword	0x92a
	.byte	0
	.uleb128 0x1a
	.string	"sync_spinlock_init"
	.byte	0x7
	.byte	0x32
	.byte	0x6
	.uaword	0xbdd
	.uleb128 0xa
	.uaword	0xbdd
	.uleb128 0xa
	.uaword	0x7c4
	.byte	0
	.uleb128 0x8
	.byte	0x4
	.uaword	0x912
	.uleb128 0x19
	.string	"ipc_buffer_pool_init"
	.byte	0xb
	.uahalf	0x11a
	.byte	0x10
	.uaword	0x33e
	.uleb128 0x15
	.string	"ipc_mailbox_init"
	.byte	0xb
	.byte	0xcc
	.byte	0x10
	.uaword	0x33e
	.uleb128 0x15
	.string	"scheduler_init"
	.byte	0x9
	.byte	0x48
	.byte	0x10
	.uaword	0x33e
	.uleb128 0x19
	.string	"task_init"
	.byte	0x6
	.uahalf	0x167
	.byte	0x10
	.uaword	0x33e
	.uleb128 0x17
	.string	"hal_init_core"
	.byte	0x8
	.byte	0x39
	.byte	0x5
	.uaword	0x124
	.uaword	0xc64
	.uleb128 0xa
	.uaword	0x1f1
	.byte	0
	.uleb128 0x15
	.string	"hal_init"
	.byte	0x8
	.byte	0x2e
	.byte	0x5
	.uaword	0x124
	.uleb128 0x18
	.string	"task_yield"
	.byte	0x6
	.byte	0xd4
	.byte	0x6
	.uleb128 0x18
	.string	"task_wait_for_period"
	.byte	0x6
	.byte	0xf8
	.byte	0x6
	.uleb128 0x1b
	.string	"hal_watchdog_reset"
	.byte	0x8
	.uahalf	0x156
	.byte	0x6
	.uleb128 0x1a
	.string	"task_delay"
	.byte	0x6
	.byte	0xdb
	.byte	0x6
	.uaword	0xcce
	.uleb128 0xa
	.uaword	0x8b1
	.byte	0
	.uleb128 0x1c
	.string	"hal_debug_hex"
	.byte	0x8
	.uahalf	0x145
	.byte	0x6
	.uaword	0xceb
	.uleb128 0xa
	.uaword	0x1f1
	.byte	0
	.uleb128 0x1c
	.string	"hal_debug_puts"
	.byte	0x8
	.uahalf	0x13f
	.byte	0x6
	.uaword	0xd09
	.uleb128 0xa
	.uaword	0x7c4
	.byte	0
	.uleb128 0x1d
	.string	"jezgro_exit_critical"
	.byte	0x1
	.uahalf	0x1f9
	.byte	0x6
	.uaword	.LFB75
	.uaword	.LFE75-.LFB75
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1d
	.string	"jezgro_enter_critical"
	.byte	0x1
	.uahalf	0x1f4
	.byte	0x6
	.uaword	.LFB74
	.uaword	.LFE74-.LFB74
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1e
	.string	"jezgro_in_isr"
	.byte	0x1
	.uahalf	0x1ed
	.byte	0x6
	.uaword	0x871
	.uaword	.LFB73
	.uaword	.LFE73-.LFB73
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xda4
	.uleb128 0x1f
	.string	"icr"
	.byte	0x1
	.uahalf	0x1f0
	.byte	0xe
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0x20
	.uaword	.LBB7
	.uaword	.LBE7-.LBB7
	.uleb128 0x1f
	.string	"__res"
	.byte	0x1
	.uahalf	0x1f0
	.byte	0x14
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0x1e
	.string	"jezgro_ms_to_ticks"
	.byte	0x1
	.uahalf	0x1e8
	.byte	0x10
	.uaword	0x8b1
	.uaword	.LFB72
	.uaword	.LFE72-.LFB72
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xdde
	.uleb128 0x21
	.string	"ms"
	.byte	0x1
	.uahalf	0x1e8
	.byte	0x34
	.uaword	0x898
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x1e
	.string	"jezgro_ticks_to_ms"
	.byte	0x1
	.uahalf	0x1e3
	.byte	0x12
	.uaword	0x898
	.uaword	.LFB71
	.uaword	.LFE71-.LFB71
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xe1b
	.uleb128 0x21
	.string	"ticks"
	.byte	0x1
	.uahalf	0x1e3
	.byte	0x34
	.uaword	0x8b1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x22
	.string	"jezgro_get_time_us"
	.byte	0x1
	.uahalf	0x1de
	.byte	0x12
	.uaword	0x87f
	.uaword	.LFB70
	.uaword	.LFE70-.LFB70
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x22
	.string	"jezgro_get_ticks"
	.byte	0x1
	.uahalf	0x1d9
	.byte	0x10
	.uaword	0x8b1
	.uaword	.LFB69
	.uaword	.LFE69-.LFB69
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x23
	.string	"jezgro_get_state"
	.byte	0x1
	.uahalf	0x1d4
	.byte	0x10
	.uaword	0x85a
	.uaword	.LFB68
	.uaword	.LFE68-.LFB68
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x1d
	.string	"jezgro_start"
	.byte	0x1
	.uahalf	0x1cf
	.byte	0x6
	.uaword	.LFB67
	.uaword	.LFE67-.LFB67
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x23
	.string	"jezgro_init"
	.byte	0x1
	.uahalf	0x1c9
	.byte	0x10
	.uaword	0x33e
	.uaword	.LFB66
	.uaword	.LFE66-.LFB66
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x23
	.string	"jezgro_version"
	.byte	0x1
	.uahalf	0x1c4
	.byte	0xd
	.uaword	0x7c4
	.uaword	.LFB65
	.uaword	.LFE65-.LFB65
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x24
	.string	"jezgro_stack_overflow_hook"
	.byte	0x1
	.uahalf	0x1b7
	.byte	0x6
	.uaword	.LFB64
	.uaword	.LFE64-.LFB64
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xf26
	.uleb128 0x21
	.string	"task"
	.byte	0x1
	.uahalf	0x1b7
	.byte	0x2f
	.uaword	0x4ab
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x24
	.string	"jezgro_deadline_miss_hook"
	.byte	0x1
	.uahalf	0x1a9
	.byte	0x6
	.uaword	.LFB63
	.uaword	.LFE63-.LFB63
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xf79
	.uleb128 0x21
	.string	"task"
	.byte	0x1
	.uahalf	0x1a9
	.byte	0x2e
	.uaword	0x4ab
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0x21
	.string	"overrun"
	.byte	0x1
	.uahalf	0x1a9
	.byte	0x3d
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.byte	0
	.uleb128 0x25
	.string	"jezgro_panic"
	.byte	0x1
	.uahalf	0x194
	.byte	0x6
	.uaword	.LFB62
	.uaword	.LFE62-.LFB62
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xfaa
	.uleb128 0x21
	.string	"msg"
	.byte	0x1
	.uahalf	0x194
	.byte	0x1f
	.uaword	0x7c4
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x24
	.string	"cpu5_main"
	.byte	0x1
	.uahalf	0x179
	.byte	0x6
	.uaword	.LFB61
	.uaword	.LFE61-.LFB61
	.uleb128 0x1
	.byte	0x9c
	.uaword	0xfd8
	.uleb128 0x26
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x180
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -40
	.byte	0
	.uleb128 0x24
	.string	"cpu4_main"
	.byte	0x1
	.uahalf	0x162
	.byte	0x6
	.uaword	.LFB60
	.uaword	.LFE60-.LFB60
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1006
	.uleb128 0x26
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x169
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -40
	.byte	0
	.uleb128 0x24
	.string	"cpu3_main"
	.byte	0x1
	.uahalf	0x149
	.byte	0x6
	.uaword	.LFB59
	.uaword	.LFE59-.LFB59
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1034
	.uleb128 0x26
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x150
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -40
	.byte	0
	.uleb128 0x24
	.string	"cpu2_main"
	.byte	0x1
	.uahalf	0x130
	.byte	0x6
	.uaword	.LFB58
	.uaword	.LFE58-.LFB58
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1062
	.uleb128 0x26
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x137
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -40
	.byte	0
	.uleb128 0x24
	.string	"cpu1_main"
	.byte	0x1
	.uahalf	0x10c
	.byte	0x6
	.uaword	.LFB57
	.uaword	.LFE57-.LFB57
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1090
	.uleb128 0x26
	.uaword	.LASF4
	.byte	0x1
	.uahalf	0x11b
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -40
	.byte	0
	.uleb128 0x27
	.string	"cpu0_main"
	.byte	0x1
	.byte	0xbc
	.byte	0x6
	.uaword	.LFB56
	.uaword	.LFE56-.LFB56
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x10d3
	.uleb128 0x28
	.uaword	.LASF4
	.byte	0x1
	.byte	0xeb
	.byte	0x13
	.uaword	0x7d7
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -44
	.uleb128 0x20
	.uaword	.LBB6
	.uaword	.LBE6-.LBB6
	.uleb128 0x14
	.string	"i"
	.byte	0x1
	.byte	0xdc
	.byte	0x13
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.uleb128 0x29
	.string	"background_task"
	.byte	0x1
	.byte	0xa0
	.byte	0xd
	.uaword	.LFB55
	.uaword	.LFE55-.LFB55
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1114
	.uleb128 0x2a
	.string	"arg"
	.byte	0x1
	.byte	0xa0
	.byte	0x23
	.uaword	0x4a9
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x28
	.uaword	.LASF0
	.byte	0x1
	.byte	0xa2
	.byte	0xe
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x29
	.string	"control_task"
	.byte	0x1
	.byte	0x85
	.byte	0xd
	.uaword	.LFB54
	.uaword	.LFE54-.LFB54
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1184
	.uleb128 0x2a
	.string	"arg"
	.byte	0x1
	.byte	0x85
	.byte	0x20
	.uaword	0x4a9
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -20
	.uleb128 0x28
	.uaword	.LASF0
	.byte	0x1
	.byte	0x87
	.byte	0xe
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0x20
	.uaword	.LBB4
	.uaword	.LBE4-.LBB4
	.uleb128 0x14
	.string	"dummy"
	.byte	0x1
	.byte	0x91
	.byte	0x1b
	.uaword	0x202
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x20
	.uaword	.LBB5
	.uaword	.LBE5-.LBB5
	.uleb128 0x14
	.string	"i"
	.byte	0x1
	.byte	0x92
	.byte	0x17
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.byte	0
	.byte	0
	.uleb128 0x29
	.string	"safety_monitor_task"
	.byte	0x1
	.byte	0x6a
	.byte	0xd
	.uaword	.LFB53
	.uaword	.LFE53-.LFB53
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x11ba
	.uleb128 0x2a
	.string	"arg"
	.byte	0x1
	.byte	0x6a
	.byte	0x27
	.uaword	0x4a9
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.byte	0
	.uleb128 0x29
	.string	"coordinator_task"
	.byte	0x1
	.byte	0x44
	.byte	0xd
	.uaword	.LFB52
	.uaword	.LFE52-.LFB52
	.uleb128 0x1
	.byte	0x9c
	.uaword	0x1240
	.uleb128 0x2a
	.string	"arg"
	.byte	0x1
	.byte	0x44
	.byte	0x24
	.uaword	0x4a9
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -12
	.uleb128 0x14
	.string	"iteration"
	.byte	0x1
	.byte	0x47
	.byte	0xe
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -4
	.uleb128 0x20
	.uaword	.LBB2
	.uaword	.LBE2-.LBB2
	.uleb128 0x14
	.string	"i"
	.byte	0x1
	.byte	0x4e
	.byte	0x17
	.uaword	0x1f1
	.uleb128 0x2
	.byte	0x8e
	.sleb128 -8
	.uleb128 0x20
	.uaword	.LBB3
	.uaword	.LBE3-.LBB3
	.uleb128 0x14
	.string	"prev_heartbeat"
	.byte	0x1
	.byte	0x51
	.byte	0x21
	.uaword	0x1240
	.uleb128 0x5
	.byte	0x3
	.uaword	prev_heartbeat.0
	.byte	0
	.byte	0
	.byte	0
	.uleb128 0x11
	.uaword	0x1f1
	.uaword	0x1250
	.uleb128 0x12
	.uaword	0x10f
	.byte	0x5
	.byte	0
	.uleb128 0x2b
	.string	"__nop"
	.byte	0x2
	.byte	0xb6
	.byte	0x14
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.uleb128 0x1
	.byte	0x9c
	.uleb128 0x2b
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
	.uleb128 0x6
	.uleb128 0x28
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x1c
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0x7
	.uleb128 0x28
	.byte	0
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0x1c
	.uleb128 0xd
	.byte	0
	.byte	0
	.uleb128 0x8
	.uleb128 0xf
	.byte	0
	.uleb128 0xb
	.uleb128 0xb
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x9
	.uleb128 0x15
	.byte	0x1
	.uleb128 0x27
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0xa
	.uleb128 0x5
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0xb
	.uleb128 0xf
	.byte	0
	.uleb128 0xb
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0xc
	.uleb128 0x13
	.byte	0x1
	.uleb128 0x3
	.uleb128 0x8
	.uleb128 0xb
	.uleb128 0xb
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
	.uleb128 0xd
	.uleb128 0xd
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
	.uleb128 0x38
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0xe
	.uleb128 0xd
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
	.uleb128 0x38
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0xf
	.uleb128 0x13
	.byte	0x1
	.uleb128 0xb
	.uleb128 0xb
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
	.uleb128 0x10
	.uleb128 0x26
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x11
	.uleb128 0x1
	.byte	0x1
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x12
	.uleb128 0x21
	.byte	0
	.uleb128 0x49
	.uleb128 0x13
	.uleb128 0x2f
	.uleb128 0xb
	.byte	0
	.byte	0
	.uleb128 0x13
	.uleb128 0x15
	.byte	0
	.uleb128 0x27
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x14
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
	.uleb128 0x15
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
	.uleb128 0x16
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
	.uleb128 0x87
	.uleb128 0x19
	.uleb128 0x3c
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x17
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
	.uleb128 0x18
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
	.uleb128 0x19
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
	.uleb128 0x3c
	.uleb128 0x19
	.byte	0
	.byte	0
	.uleb128 0x1a
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
	.uleb128 0x3c
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
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
	.uleb128 0x3c
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
	.uleb128 0x3c
	.uleb128 0x19
	.uleb128 0x1
	.uleb128 0x13
	.byte	0
	.byte	0
	.uleb128 0x1d
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
	.uleb128 0x1f
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
	.uleb128 0x20
	.uleb128 0xb
	.byte	0x1
	.uleb128 0x11
	.uleb128 0x1
	.uleb128 0x12
	.uleb128 0x6
	.byte	0
	.byte	0
	.uleb128 0x21
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
	.uleb128 0x22
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
	.uleb128 0x23
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
	.uleb128 0x24
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
	.uleb128 0x25
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
	.uleb128 0x87
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
	.uleb128 0x26
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
	.uleb128 0x27
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
	.uleb128 0x28
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
	.uleb128 0x29
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
	.uleb128 0x2a
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
	.uaword	0xe4
	.uahalf	0x2
	.uaword	.Ldebug_info0
	.byte	0x4
	.byte	0
	.uahalf	0
	.uahalf	0
	.uaword	.LFB0
	.uaword	.LFE0-.LFB0
	.uaword	.LFB8
	.uaword	.LFE8-.LFB8
	.uaword	.LFB52
	.uaword	.LFE52-.LFB52
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
	.uaword	0
	.uaword	0
	.section	.debug_ranges,"",@progbits
.Ldebug_ranges0:
	.uaword	.LFB0
	.uaword	.LFE0
	.uaword	.LFB8
	.uaword	.LFE8
	.uaword	.LFB52
	.uaword	.LFE52
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
	.file 12 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stddef.h"
	.byte	0x3
	.uleb128 0xe
	.uleb128 0xc
	.byte	0x7
	.uaword	.Ldebug_macro3
	.byte	0x4
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x5
	.byte	0x1
	.uleb128 0x11
	.string	"JEZGRO_H "
	.file 13 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stdint.h"
	.byte	0x3
	.uleb128 0x13
	.uleb128 0xd
	.file 14 "C:/tricore-gcc/tricore-elf/include/stdint.h"
	.byte	0x3
	.uleb128 0x9
	.uleb128 0xe
	.byte	0x1
	.uleb128 0xa
	.string	"_STDINT_H "
	.byte	0x3
	.uleb128 0xc
	.uleb128 0x3
	.byte	0x1
	.uleb128 0x6
	.string	"_MACHINE__DEFAULT_TYPES_H "
	.file 15 "C:/tricore-gcc/tricore-elf/include/sys/features.h"
	.byte	0x3
	.uleb128 0x8
	.uleb128 0xf
	.byte	0x1
	.uleb128 0x16
	.string	"_SYS_FEATURES_H "
	.file 16 "C:/tricore-gcc/tricore-elf/include/_newlib_version.h"
	.byte	0x3
	.uleb128 0x1c
	.uleb128 0x10
	.byte	0x7
	.uaword	.Ldebug_macro4
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro5
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro6
	.byte	0x4
	.file 17 "C:/tricore-gcc/tricore-elf/include/sys/_intsup.h"
	.byte	0x3
	.uleb128 0xd
	.uleb128 0x11
	.byte	0x7
	.uaword	.Ldebug_macro7
	.byte	0x4
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x4
	.byte	0x7
	.uaword	.Ldebug_macro8
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro9
	.byte	0x4
	.byte	0x1
	.uleb128 0xd
	.string	"_GCC_WRAP_STDINT_H "
	.byte	0x4
	.file 18 "C:/tricore-gcc/lib/gcc/tricore-elf/13.4.0/include/stdbool.h"
	.byte	0x3
	.uleb128 0x14
	.uleb128 0x12
	.byte	0x7
	.uaword	.Ldebug_macro10
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro11
	.byte	0x4
	.byte	0x3
	.uleb128 0x10
	.uleb128 0x9
	.byte	0x1
	.uleb128 0xd
	.string	"SCHEDULER_H "
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x5
	.byte	0x4
	.byte	0x3
	.uleb128 0x10
	.uleb128 0x6
	.byte	0x1
	.uleb128 0xa
	.string	"TASK_H "
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro12
	.byte	0x4
	.byte	0x3
	.uleb128 0x11
	.uleb128 0x6
	.byte	0x4
	.byte	0x3
	.uleb128 0x12
	.uleb128 0x7
	.byte	0x7
	.uaword	.Ldebug_macro13
	.byte	0x4
	.byte	0x3
	.uleb128 0x13
	.uleb128 0xb
	.byte	0x7
	.uaword	.Ldebug_macro14
	.byte	0x4
	.byte	0x3
	.uleb128 0x14
	.uleb128 0x8
	.byte	0x7
	.uaword	.Ldebug_macro15
	.byte	0x4
	.file 19 "src/arch/tricore_cpu.h"
	.byte	0x3
	.uleb128 0x15
	.uleb128 0x13
	.byte	0x1
	.uleb128 0x9
	.string	"TRICORE_CPU_H "
	.byte	0x3
	.uleb128 0xd
	.uleb128 0x2
	.byte	0x1
	.uleb128 0xe
	.string	"TRICORE_INTRINSICS_H "
	.file 20 "./include/tc397xp_sfr.h"
	.byte	0x3
	.uleb128 0x11
	.uleb128 0x14
	.byte	0x7
	.uaword	.Ldebug_macro16
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro17
	.byte	0x4
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x14
	.byte	0x4
	.file 21 "./include/tc397xp_regs.h"
	.byte	0x3
	.uleb128 0xf
	.uleb128 0x15
	.byte	0x7
	.uaword	.Ldebug_macro18
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro19
	.byte	0x4
	.byte	0x3
	.uleb128 0x16
	.uleb128 0xa
	.byte	0x1
	.uleb128 0xa
	.string	"TRICORE_MULTICORE_H "
	.byte	0x3
	.uleb128 0xe
	.uleb128 0x13
	.byte	0x4
	.byte	0x7
	.uaword	.Ldebug_macro20
	.byte	0x4
	.byte	0x1
	.uleb128 0x1d
	.string	"PRIORITY_COORDINATOR 200"
	.byte	0x1
	.uleb128 0x1e
	.string	"PRIORITY_SAFETY 180"
	.byte	0x1
	.uleb128 0x1f
	.string	"PRIORITY_CONTROL 160"
	.byte	0x1
	.uleb128 0x20
	.string	"PRIORITY_MONITOR 140"
	.byte	0x1
	.uleb128 0x21
	.string	"PRIORITY_BACKGROUND 100"
	.byte	0x1
	.uleb128 0x22
	.string	"PRIORITY_LOGGING 60"
	.byte	0x1
	.uleb128 0x25
	.string	"PERIOD_FAST_CONTROL 100"
	.byte	0x1
	.uleb128 0x26
	.string	"PERIOD_SLOW_CONTROL 1000"
	.byte	0x1
	.uleb128 0x27
	.string	"PERIOD_MONITOR 10000"
	.byte	0x1
	.uleb128 0x28
	.string	"PERIOD_LOGGING 100000"
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
	.section	.debug_macro,"G",@progbits,wm4.stddef.h.39.0dc9006b34572d4d9cae4c8b422c4971,comdat
.Ldebug_macro3:
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
	.section	.debug_macro,"G",@progbits,wm4._newlib_version.h.4.529115dae5e4f67702b1de0b6e841f38,comdat
.Ldebug_macro4:
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
.Ldebug_macro5:
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
.Ldebug_macro6:
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
.Ldebug_macro7:
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
.Ldebug_macro8:
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
.Ldebug_macro9:
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
.Ldebug_macro10:
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
	.section	.debug_macro,"G",@progbits,wm4.jezgro.h.30.816f590ba28842706d8138f780d32b4f,comdat
.Ldebug_macro11:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1e
	.string	"JEZGRO_VERSION_MAJOR 1"
	.byte	0x1
	.uleb128 0x1f
	.string	"JEZGRO_VERSION_MINOR 0"
	.byte	0x1
	.uleb128 0x20
	.string	"JEZGRO_VERSION_PATCH 0"
	.byte	0x1
	.uleb128 0x21
	.string	"JEZGRO_VERSION_STRING \"1.0.0-tricore\""
	.byte	0x1
	.uleb128 0x28
	.string	"JEZGRO_MAX_CORES 6"
	.byte	0x1
	.uleb128 0x2b
	.string	"JEZGRO_MAX_TASKS_PER_CORE 16"
	.byte	0x1
	.uleb128 0x2e
	.string	"JEZGRO_MAX_TASKS (JEZGRO_MAX_CORES * JEZGRO_MAX_TASKS_PER_CORE)"
	.byte	0x1
	.uleb128 0x31
	.string	"JEZGRO_TASK_NAME_LEN 16"
	.byte	0x1
	.uleb128 0x34
	.string	"JEZGRO_DEFAULT_STACK_SIZE 2048"
	.byte	0x1
	.uleb128 0x37
	.string	"JEZGRO_MIN_STACK_SIZE 512"
	.byte	0x1
	.uleb128 0x3a
	.string	"JEZGRO_TICK_FREQ_HZ 1000"
	.byte	0x1
	.uleb128 0x3d
	.string	"JEZGRO_TICK_PERIOD_US (1000000 / JEZGRO_TICK_FREQ_HZ)"
	.byte	0x1
	.uleb128 0x40
	.string	"JEZGRO_MAX_PRIORITY 255"
	.byte	0x1
	.uleb128 0x43
	.string	"JEZGRO_PRIORITY_IDLE 0"
	.byte	0x1
	.uleb128 0x46
	.string	"JEZGRO_PRIORITY_KERNEL 255"
	.byte	0x1
	.uleb128 0x49
	.string	"JEZGRO_MAX_QUEUES 16"
	.byte	0x1
	.uleb128 0x4a
	.string	"JEZGRO_MAX_MAILBOXES 8"
	.byte	0x1
	.uleb128 0x4b
	.string	"JEZGRO_MAX_SEMAPHORES 32"
	.byte	0x1
	.uleb128 0x4c
	.string	"JEZGRO_MAX_MUTEXES 16"
	.byte	0x1
	.uleb128 0xcc
	.string	"JEZGRO_WAIT_FOREVER ((jezgro_ticks_t)0xFFFFFFFF)"
	.byte	0x1
	.uleb128 0xcf
	.string	"JEZGRO_NO_WAIT ((jezgro_ticks_t)0)"
	.byte	0x1
	.uleb128 0x135
	.string	"JEZGRO_STACK_WORDS(bytes) ((bytes) / sizeof(uint32_t))"
	.byte	0x1
	.uleb128 0x138
	.string	"JEZGRO_TASK_PARAMS_DEFAULT { .name = \"task\", .func = NULL, .arg = NULL, .priority = 128, .stack_size = JEZGRO_DEFAULT_STACK_SIZE, .stack_base = NULL, .core_affinity = 0, .period_us = 0, .deadline_us = 0, .flags = TASK_FLAG_NONE }"
	.byte	0x1
	.uleb128 0x154
	.string	"JEZGRO_ASSERT(cond) do { if (!(cond)) { jezgro_panic(\"Assert: \" #cond); } } while(0)"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.scheduler.h.27.e3a0896a8f03551eb71772c3b3faa145,comdat
.Ldebug_macro12:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x1b
	.string	"SCHEDULER_USE_EDF 1"
	.byte	0x1
	.uleb128 0x1e
	.string	"SCHEDULER_TRACK_TIME 1"
	.byte	0x1
	.uleb128 0x21
	.string	"SCHEDULER_CHECK_DEADLINE 1"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.sync.h.16.fe08f6e34035cc888fcf804128e70ca5,comdat
.Ldebug_macro13:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x10
	.string	"SYNC_H "
	.byte	0x1
	.uleb128 0x2b
	.string	"SYNC_SPINLOCK_INIT(n) { .lock = 0, .owner_core = 0xFF, .name = n }"
	.byte	0x1
	.uleb128 0x6a
	.string	"SYNC_MUTEX_INIT(n) { .locked = 0, .owner = NULL, .owner_orig_priority = 0, .ceiling = JEZGRO_MAX_PRIORITY, .wait_head = NULL, .wait_count = 0, .name = n }"
	.byte	0x1
	.uleb128 0xb8
	.string	"SYNC_SEMAPHORE_INIT(n,initial,max) { .count = initial, .max_count = max, .wait_head = NULL, .wait_count = 0, .name = n }"
	.byte	0x1
	.uleb128 0xbf
	.string	"SYNC_BINARY_SEMAPHORE_INIT(n,initial) SYNC_SEMAPHORE_INIT(n, initial, 1)"
	.byte	0x1
	.uleb128 0x102
	.string	"SYNC_EVENT_INIT(n) { .flags = 0, .wait_head = NULL, .name = n }"
	.byte	0x1
	.uleb128 0x14d
	.string	"SYNC_COND_INIT(n) { .wait_head = NULL, .wait_count = 0, .name = n }"
	.byte	0x1
	.uleb128 0x189
	.string	"SYNC_RWLOCK_INIT(n) { .readers = 0, .writer = false, .read_wait = NULL, .write_wait = NULL, .name = n }"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.ipc.h.12.16253062e98e58eed805d4b8ae3c8b57,comdat
.Ldebug_macro14:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xc
	.string	"IPC_H "
	.byte	0x1
	.uleb128 0x19
	.string	"IPC_MAX_MSG_SIZE 64"
	.byte	0x1
	.uleb128 0x1c
	.string	"IPC_DEFAULT_QUEUE_DEPTH 16"
	.byte	0x1
	.uleb128 0x1f
	.string	"IPC_MAILBOX_MSG_SIZE 32"
	.byte	0x1
	.uleb128 0x22
	.string	"IPC_MAILBOX_SLOTS 8"
	.byte	0x1
	.uleb128 0x114
	.string	"IPC_BUFFER_POOL_SIZE 32"
	.byte	0x1
	.uleb128 0x151
	.string	"IPC_MSG_GENERIC 0"
	.byte	0x1
	.uleb128 0x154
	.string	"IPC_MSG_RPC 1"
	.byte	0x1
	.uleb128 0x157
	.string	"IPC_MSG_RPC_REPLY 2"
	.byte	0x1
	.uleb128 0x15a
	.string	"IPC_MSG_SCHEDULER 3"
	.byte	0x1
	.uleb128 0x15d
	.string	"IPC_MSG_BUFFER 4"
	.byte	0x1
	.uleb128 0x160
	.string	"IPC_MSG_SHUTDOWN 5"
	.byte	0x1
	.uleb128 0x163
	.string	"IPC_MSG_USER 0x100"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.hal.h.12.b287374e45e9169322b47082b4df6dde,comdat
.Ldebug_macro15:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0xc
	.string	"HAL_H "
	.byte	0x1
	.uleb128 0x1a
	.string	"HAL_MAX_CORES 6"
	.byte	0x1
	.uleb128 0x1d
	.string	"HAL_SYSTICK_FREQ_HZ 1000"
	.byte	0
	.section	.debug_macro,"G",@progbits,wm4.tc397xp_sfr.h.12.3f453f758283a02fe3fa193077bd3146,comdat
.Ldebug_macro16:
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
.Ldebug_macro17:
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
	.section	.debug_macro,"G",@progbits,wm4.tc397xp_regs.h.12.7ebc7cba7d7679de71bd85a3ac13c650,comdat
.Ldebug_macro18:
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
	.section	.debug_macro,"G",@progbits,wm4.tricore_cpu.h.25.a12f238f498cc08785df071bc6e63f13,comdat
.Ldebug_macro19:
	.uahalf	0x4
	.byte	0
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
	.section	.debug_macro,"G",@progbits,wm4.tricore_multicore.h.25.a8630cae83a677a7cd8ef457e7159783,comdat
.Ldebug_macro20:
	.uahalf	0x4
	.byte	0
	.byte	0x1
	.uleb128 0x19
	.string	"IPI_EVENT_NONE 0"
	.byte	0x1
	.uleb128 0x1a
	.string	"IPI_EVENT_SCHEDULE 1"
	.byte	0x1
	.uleb128 0x1b
	.string	"IPI_EVENT_WAKEUP 2"
	.byte	0x1
	.uleb128 0x1c
	.string	"IPI_EVENT_STOP 3"
	.byte	0x1
	.uleb128 0x1d
	.string	"IPI_EVENT_CALL 4"
	.byte	0x1
	.uleb128 0x1e
	.string	"IPI_EVENT_USER 16"
	.byte	0x1
	.uleb128 0x21
	.string	"SPINLOCK_UNLOCKED 0"
	.byte	0x1
	.uleb128 0x22
	.string	"SPINLOCK_LOCKED 1"
	.byte	0
	.section	.debug_line,"",@progbits
.Ldebug_line0:
	.section	.debug_str,"",@progbits
.LASF1:
	.string	"period_us"
.LASF2:
	.string	"stack_base"
.LASF4:
	.string	"params"
.LASF3:
	.string	"stack_size"
.LASF0:
	.string	"core_id"
	.extern	hal_exit_critical,STT_FUNC,0
	.extern	hal_enter_critical,STT_FUNC,0
	.extern	hal_get_time_us,STT_FUNC,0
	.extern	scheduler_get_ticks,STT_FUNC,0
	.extern	scheduler_start,STT_FUNC,0
	.extern	task_get_name,STT_FUNC,0
	.extern	hal_get_core_id,STT_FUNC,0
	.extern	multicore_signal_ready,STT_FUNC,0
	.extern	multicore_wait_all_ready,STT_FUNC,0
	.extern	multicore_start_all,STT_FUNC,0
	.extern	task_create,STT_FUNC,0
	.extern	task_create_idle,STT_FUNC,0
	.extern	hal_systick_init,STT_FUNC,0
	.extern	scheduler_tick,STT_FUNC,0
	.extern	sync_spinlock_init,STT_FUNC,0
	.extern	ipc_buffer_pool_init,STT_FUNC,0
	.extern	ipc_mailbox_init,STT_FUNC,0
	.extern	scheduler_init,STT_FUNC,0
	.extern	task_init,STT_FUNC,0
	.extern	hal_init_core,STT_FUNC,0
	.extern	hal_init,STT_FUNC,0
	.extern	task_yield,STT_FUNC,0
	.extern	task_wait_for_period,STT_FUNC,0
	.extern	hal_watchdog_reset,STT_FUNC,0
	.extern	task_delay,STT_FUNC,0
	.extern	hal_debug_hex,STT_FUNC,0
	.extern	hal_debug_puts,STT_FUNC,0
	.ident	"GCC: (GNU) 13.4.0"
.section .callinfo
  .word cpu0_main #name
  .word cpu0_main_end #sz
  .word 0x443c00fc #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word cpu1_main #name
  .word cpu1_main_end #sz
  .word 0x443c00f4 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word cpu2_main #name
  .word cpu2_main_end #sz
  .word 0x443c00f4 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word cpu3_main #name
  .word cpu3_main_end #sz
  .word 0x443c00f4 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word cpu4_main #name
  .word cpu4_main_end #sz
  .word 0x443c00f4 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word cpu5_main #name
  .word cpu5_main_end #sz
  .word 0x443c00f4 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word jezgro_panic #name
  .word jezgro_panic_end #sz
  .word 0x44100014 #reg
  .word 0x00100000 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word jezgro_deadline_miss_hook #name
  .word jezgro_deadline_miss_hook_end #sz
  .word 0x44140014 #reg
  .word 0x00100010 #arg
  .word 0x00000000 #ret
  .word 0x00028040 #stat
  .word jezgro_stack_overflow_hook #name
  .word jezgro_stack_overflow_hook_end #sz
  .word 0x44140004 #reg
  .word 0x00100000 #arg
  .word 0x00000000 #ret
  .word 0x00029040 #stat
  .word jezgro_version #name
  .word jezgro_version_end #sz
  .word 0x40040004 #reg
  .word 0x00000000 #arg
  .word 0x00040000 #ret
  .word 0x000000c0 #stat
  .word jezgro_init #name
  .word jezgro_init_end #sz
  .word 0x40000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x000000c0 #stat
  .word jezgro_start #name
  .word jezgro_start_end #sz
  .word 0x44000000 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00021040 #stat
  .word jezgro_get_state #name
  .word jezgro_get_state_end #sz
  .word 0x40000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x000000c0 #stat
  .word jezgro_get_ticks #name
  .word jezgro_get_ticks_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word jezgro_get_time_us #name
  .word jezgro_get_time_us_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x00020040 #stat
  .word jezgro_ticks_to_ms #name
  .word jezgro_ticks_to_ms_end #sz
  .word 0x40000014 #reg
  .word 0x00000010 #arg
  .word 0x00000004 #ret
  .word 0x000080c0 #stat
  .word jezgro_ms_to_ticks #name
  .word jezgro_ms_to_ticks_end #sz
  .word 0x40000014 #reg
  .word 0x00000010 #arg
  .word 0x00000004 #ret
  .word 0x000080c0 #stat
  .word jezgro_in_isr #name
  .word jezgro_in_isr_end #sz
  .word 0x40000004 #reg
  .word 0x00000000 #arg
  .word 0x00000004 #ret
  .word 0x000081c0 #stat
  .word jezgro_enter_critical #name
  .word jezgro_enter_critical_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
  .word jezgro_exit_critical #name
  .word jezgro_exit_critical_end #sz
  .word 0x44000004 #reg
  .word 0x00000000 #arg
  .word 0x00000000 #ret
  .word 0x00020040 #stat
