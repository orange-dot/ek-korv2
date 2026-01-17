# JEZGRO for AURIX TC397XP
# Multi-core RTOS for Infineon TriCore
# Target: SAK-TC397XP-256F300S BD (6 cores @ 300 MHz)

cmake_minimum_required(VERSION 3.20)

# Must be set before project()
set(CMAKE_TOOLCHAIN_FILE ${CMAKE_CURRENT_SOURCE_DIR}/cmake/tricore-gcc.cmake)

project(jezgro-tricore
    VERSION 0.1.0
    LANGUAGES C ASM
    DESCRIPTION "JEZGRO RTOS for AURIX TC397XP"
)

# =============================================================================
# Build Options
# =============================================================================

option(JEZGRO_DEBUG "Enable debug output and assertions" ON)
option(JEZGRO_SAFETY_CHECKS "Enable runtime safety checks" ON)
option(JEZGRO_MULTICORE "Enable multi-core support (all 6 cores)" ON)

# =============================================================================
# TC397XP Configuration
# =============================================================================

set(TC397_CORES 6 CACHE STRING "Number of CPU cores")
set(TC397_LOCKSTEP_CORES 4 CACHE STRING "Number of lockstep cores (CPU0-CPU3)")
set(TC397_CLOCK_MHZ 300 CACHE STRING "CPU clock frequency in MHz")

# Memory sizes (from TC397XP datasheet)
set(TC397_FLASH_SIZE    0x1000000)  # 16 MB
set(TC397_DSPR0_SIZE    0x3C000)    # 240 KB (CPU0)
set(TC397_DSPR1_SIZE    0x3C000)    # 240 KB (CPU1)
set(TC397_DSPR2_SIZE    0x3C000)    # 240 KB (CPU2)
set(TC397_DSPR3_SIZE    0x18000)    # 96 KB (CPU3)
set(TC397_DSPR4_SIZE    0x18000)    # 96 KB (CPU4)
set(TC397_DSPR5_SIZE    0x18000)    # 96 KB (CPU5)
set(TC397_LMU_SIZE      0xC0000)    # 768 KB (shared)
set(TC397_PSPR_SIZE     0x10000)    # 64 KB per core (PSPR0-5)

# =============================================================================
# ek-kor RTOS Library (shared kernel)
# =============================================================================

# Configure ek-kor for TC397XP multi-core
set(EKK_MAX_CORES ${TC397_CORES} CACHE STRING "" FORCE)
set(EKK_MAX_TASKS_PER_CORE 16 CACHE STRING "" FORCE)
set(EKK_DEBUG ${JEZGRO_DEBUG} CACHE BOOL "" FORCE)

# Force TriCore flags BEFORE adding subdirectory
# The ek-kor CMakeLists checks CMAKE_SYSTEM_PROCESSOR which is "tricore"
# but we also need to ensure these flags are global
# Note: GCC 13+ generates .srodata sections - use -Wa option to make assembler
# treat unknown sections as warnings instead of errors
add_compile_options(
    -msmall-data=0
    -msmall-const=0
    -fno-section-anchors
    -fno-merge-constants
    -Wa,--fatal-warnings
)

# Add ek-kor as subdirectory
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../ek-kor ${CMAKE_BINARY_DIR}/ek-kor)

# =============================================================================
# Compiler Definitions
# =============================================================================

add_compile_definitions(
    TC397XP
    EKK_PLATFORM_TC397XP
    JEZGRO_LOCKSTEP_CORES=${TC397_LOCKSTEP_CORES}
    JEZGRO_CLOCK_HZ=${TC397_CLOCK_MHZ}000000
    $<$<BOOL:${JEZGRO_DEBUG}>:JEZGRO_DEBUG=1>
    $<$<BOOL:${JEZGRO_SAFETY_CHECKS}>:JEZGRO_SAFETY_CHECKS=1>
    $<$<BOOL:${JEZGRO_MULTICORE}>:JEZGRO_MULTICORE=1>
)

# =============================================================================
# Compiler Flags
# =============================================================================

set(COMMON_FLAGS
    -mtc162                     # TriCore 1.6.2 architecture (TC3xx)
    -mcpu=tc39xx                # TC39x family
    -msmall-data=0              # No small data optimization
    -msmall-const=0             # No small const optimization
    -ffunction-sections         # Each function in own section
    -fdata-sections             # Each data in own section
    -fno-common                 # No common blocks
    -fno-section-anchors        # Avoid section anchor issues
    -fno-merge-constants        # Don't merge constants
    -Wall
    -Wextra
    -Wno-type-limits            # Avoid false warnings on type comparisons
    -Wno-unused-variable        # Allow unused variables during development
    -Werror=implicit-function-declaration
)

set(DEBUG_FLAGS
    -O0                         # No optimization to avoid code gen issues
    -g3                         # Max debug info
    -gdwarf-4
)

set(RELEASE_FLAGS
    -O2
    -DNDEBUG
)

# Apply flags
add_compile_options(${COMMON_FLAGS})
add_compile_options("$<$<CONFIG:Debug>:${DEBUG_FLAGS}>")
add_compile_options("$<$<CONFIG:Release>:${RELEASE_FLAGS}>")

# =============================================================================
# Include Directories
# =============================================================================

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/src
    ${CMAKE_CURRENT_SOURCE_DIR}/src/kernel
    ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
    ${CMAKE_CURRENT_SOURCE_DIR}/src/arch
    ${CMAKE_CURRENT_SOURCE_DIR}/src/drivers
)

# =============================================================================
# Source Files
# =============================================================================

# Architecture layer (TriCore-specific)
set(ARCH_SOURCES
    src/arch/tricore_cpu.c
    src/arch/tricore_csa.c
    src/arch/tricore_irq.c
    src/arch/tricore_multicore.c
)

# HAL layer
set(HAL_SOURCES
    src/hal/hal_tc397xp.c
)

# Drivers (stub - to be implemented)
set(DRIVER_SOURCES
    # src/drivers/asclin.c
    # src/drivers/stm.c
    # src/drivers/gpio.c
    # src/drivers/can.c
)

# Kernel sources now come from ek-kor library

# Startup
set(STARTUP_SOURCES
    src/crt0_tc397xp.s
    src/startup_tc397xp.c
    src/bmhd_tc397xp.c
)

# Application
set(APP_SOURCES
    src/main.c
)

# =============================================================================
# Linker Configuration
# =============================================================================

set(LINKER_SCRIPT ${CMAKE_CURRENT_SOURCE_DIR}/cmake/tc397xp.ld)

set(CMAKE_EXE_LINKER_FLAGS
    "${CMAKE_EXE_LINKER_FLAGS} \
    -T${LINKER_SCRIPT} \
    -Wl,--gc-sections \
    -Wl,-Map=${CMAKE_PROJECT_NAME}.map \
    -nostartfiles \
    -nodefaultlibs"
)

# =============================================================================
# Targets
# =============================================================================

# Main firmware executable
add_executable(${CMAKE_PROJECT_NAME}
    ${STARTUP_SOURCES}
    ${ARCH_SOURCES}
    ${HAL_SOURCES}
    ${DRIVER_SOURCES}
    ${APP_SOURCES}
)

# Link ek-kor kernel library
target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE ek-kor)

# Ensure linker script is a dependency
set_target_properties(${CMAKE_PROJECT_NAME} PROPERTIES
    LINK_DEPENDS ${LINKER_SCRIPT}
    SUFFIX ".elf"
)

# =============================================================================
# Post-Build Commands
# =============================================================================

# Generate binary file
add_custom_command(TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${CMAKE_PROJECT_NAME}> ${CMAKE_PROJECT_NAME}.bin
    COMMENT "Generating binary file"
)

# Generate Intel HEX file
add_custom_command(TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:${CMAKE_PROJECT_NAME}> ${CMAKE_PROJECT_NAME}.hex
    COMMENT "Generating Intel HEX file"
)

# Generate S-record file (for Infineon tools)
add_custom_command(TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -O srec $<TARGET_FILE:${CMAKE_PROJECT_NAME}> ${CMAKE_PROJECT_NAME}.srec
    COMMENT "Generating S-record file"
)

# Print size information
add_custom_command(TARGET ${CMAKE_PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_SIZE} --format=berkeley $<TARGET_FILE:${CMAKE_PROJECT_NAME}>
    COMMENT "Firmware size:"
)

# =============================================================================
# Documentation
# =============================================================================

message(STATUS "")
message(STATUS "JEZGRO for AURIX TC397XP Configuration:")
message(STATUS "  Target:           SAK-TC397XP-256F300S BD")
message(STATUS "  Cores:            ${TC397_CORES} (${TC397_LOCKSTEP_CORES} lockstep)")
message(STATUS "  Clock:            ${TC397_CLOCK_MHZ} MHz")
message(STATUS "  Debug:            ${JEZGRO_DEBUG}")
message(STATUS "  Safety checks:    ${JEZGRO_SAFETY_CHECKS}")
message(STATUS "  Multi-core:       ${JEZGRO_MULTICORE}")
message(STATUS "")
