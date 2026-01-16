cmake_minimum_required(VERSION 3.16)

project(ek-kor2
    VERSION 2.0.0
    DESCRIPTION "EK-KOR v2: Field-Centric Coordination RTOS"
    LANGUAGES C
)

# ============================================================================
# Options
# ============================================================================

option(EKK_BUILD_TESTS "Build unit tests" ON)
option(EKK_BUILD_EXAMPLES "Build examples" ON)
option(EKK_BUILD_DOCS "Build documentation" OFF)

set(EKK_PLATFORM "posix" CACHE STRING "Target platform: posix, stm32g474, tricore, x86_64, rpi3")
set_property(CACHE EKK_PLATFORM PROPERTY STRINGS posix stm32g474 tricore x86_64 rpi3)

# ============================================================================
# Configuration
# ============================================================================

# Neighbor count (default k=7 based on Cavagna & Giardina research)
set(EKK_K_NEIGHBORS 7 CACHE STRING "Number of topological neighbors")

# Maximum modules in cluster
set(EKK_MAX_MODULES 256 CACHE STRING "Maximum modules in cluster")

# Field decay time constant (microseconds)
set(EKK_FIELD_DECAY_TAU_US 100000 CACHE STRING "Field decay tau in microseconds")

# Heartbeat period (microseconds)
set(EKK_HEARTBEAT_PERIOD_US 10000 CACHE STRING "Heartbeat period in microseconds")

# ============================================================================
# Library
# ============================================================================

add_library(ekk STATIC
    src/ekk_types.c
    src/ekk_field.c
    src/ekk_topology.c
    src/ekk_consensus.c
    src/ekk_heartbeat.c
    src/ekk_module.c
    src/ekk_init.c
    src/ekk_spsc.c
    src/ekk_auth.c
)

target_include_directories(ekk
    PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<INSTALL_INTERFACE:include>
)

target_compile_definitions(ekk
    PUBLIC
        EKK_K_NEIGHBORS=${EKK_K_NEIGHBORS}
        EKK_MAX_MODULES=${EKK_MAX_MODULES}
        EKK_FIELD_DECAY_TAU_US=${EKK_FIELD_DECAY_TAU_US}
        EKK_HEARTBEAT_PERIOD_US=${EKK_HEARTBEAT_PERIOD_US}
)

# C99 required for _Static_assert
target_compile_features(ekk PUBLIC c_std_99)

# Warnings
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(ekk PRIVATE -Wall -Wextra -Wpedantic)
endif()

# ============================================================================
# Platform-Specific HAL
# ============================================================================

if(EKK_PLATFORM STREQUAL "posix")
    target_sources(ekk PRIVATE src/hal/ekk_hal_posix.c)
    target_compile_definitions(ekk PUBLIC EKK_PLATFORM_POSIX)
    find_package(Threads REQUIRED)
    target_link_libraries(ekk PUBLIC Threads::Threads)

elseif(EKK_PLATFORM STREQUAL "stm32g474")
    target_sources(ekk PRIVATE src/hal/ekk_hal_stm32g474.c)
    target_compile_definitions(ekk PUBLIC EKK_PLATFORM_STM32G474)

    # Startup code for bare-metal
    add_library(ekk_startup STATIC startup_stm32g474.c)
    target_compile_definitions(ekk_startup PRIVATE EKK_PLATFORM_STM32G474)

    # Linker script
    set(EKK_LINKER_SCRIPT "${CMAKE_CURRENT_SOURCE_DIR}/stm32g474.ld" CACHE FILEPATH "Linker script")

elseif(EKK_PLATFORM STREQUAL "tricore")
    target_sources(ekk PRIVATE src/hal/ekk_hal_tricore.c)
    target_compile_definitions(ekk PUBLIC EKK_PLATFORM_TRICORE)

elseif(EKK_PLATFORM STREQUAL "x86_64")
    target_sources(ekk PRIVATE src/hal/ekk_hal_x86.c)
    target_compile_definitions(ekk PUBLIC EKK_PLATFORM_X86_64)
    # Note: x86_64 HAL is for bare-metal use (EK-OS, custom bootloaders)
    # Debug output via ekk_hal_printf is a weak symbol - override in application

elseif(EKK_PLATFORM STREQUAL "rpi3")
    # Raspberry Pi 3B+ (BCM2837B0, Cortex-A53 x 4) bare-metal HAL
    target_sources(ekk PRIVATE
        src/hal/rpi3/ekk_hal_rpi3.c
        src/hal/rpi3/uart.c
        src/hal/rpi3/timer.c
        src/hal/rpi3/gic.c
        src/hal/rpi3/smp.c
        src/hal/rpi3/msg_queue.c
        src/hal/rpi3/libc_stubs.c
        src/hal/rpi3/mailbox.c
        src/hal/rpi3/framebuffer.c
        src/hal/rpi3/dashboard.c
    )
    target_include_directories(ekk PRIVATE src/hal/rpi3)
    target_compile_definitions(ekk PUBLIC EKK_PLATFORM_RPI3)

    # Boot assembly
    enable_language(ASM)
    add_library(ekk_rpi3_boot STATIC src/hal/rpi3/boot.S)
    target_compile_options(ekk_rpi3_boot PRIVATE -x assembler-with-cpp)

    # Linker script
    set(EKK_RPI3_LINKER_SCRIPT "${CMAKE_CURRENT_SOURCE_DIR}/src/hal/rpi3/linker.ld" CACHE FILEPATH "RPi3 linker script")

else()
    message(FATAL_ERROR "Unknown platform: ${EKK_PLATFORM}")
endif()

# ============================================================================
# Examples
# ============================================================================

if(EKK_BUILD_EXAMPLES AND EKK_PLATFORM STREQUAL "posix")
    add_executable(example_basic examples/basic.c)
    target_link_libraries(example_basic PRIVATE ekk)

    add_executable(example_multi_module examples/multi_module.c)
    target_link_libraries(example_multi_module PRIVATE ekk)

    add_executable(example_consensus examples/consensus_demo.c)
    target_link_libraries(example_consensus PRIVATE ekk)
endif()

# ============================================================================
# STM32G474 Firmware Targets (for Renode)
# ============================================================================

if(EKK_PLATFORM STREQUAL "stm32g474")
    # Helper function to create firmware ELF with proper linker settings
    function(add_firmware TARGET)
        add_executable(${TARGET} ${ARGN})
        target_link_libraries(${TARGET} PRIVATE ekk ekk_startup)

        # Linker script and flags
        target_link_options(${TARGET} PRIVATE
            -T${EKK_LINKER_SCRIPT}
            -Wl,-Map=${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.map
            -Wl,--gc-sections
            -Wl,--print-memory-usage
        )
        set_target_properties(${TARGET} PROPERTIES
            LINK_DEPENDS ${EKK_LINKER_SCRIPT}
            SUFFIX ".elf"
        )

        # Generate .bin and .hex
        add_custom_command(TARGET ${TARGET} POST_BUILD
            COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${TARGET}> ${TARGET}.bin
            COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:${TARGET}> ${TARGET}.hex
            COMMAND ${CMAKE_SIZE} $<TARGET_FILE:${TARGET}>
            COMMENT "Generating ${TARGET}.bin and ${TARGET}.hex"
        )
    endfunction()

    # Renode test firmware
    add_firmware(ekk_test examples/renode_test.c)

    # Copy ELF to renode directory for easy access
    add_custom_command(TARGET ekk_test POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            $<TARGET_FILE:ekk_test>
            ${CMAKE_CURRENT_SOURCE_DIR}/../renode/ekk_test.elf
        COMMENT "Copying ekk_test.elf to renode/"
    )
endif()

# ============================================================================
# Raspberry Pi 3 Firmware Target
# ============================================================================

if(EKK_PLATFORM STREQUAL "rpi3")
    # Helper function to create RPi3 kernel image
    function(add_rpi3_kernel TARGET)
        add_executable(${TARGET} ${ARGN})
        # Use linker group to handle circular dependency:
        # boot.S calls kernel_main which is in ekk library
        target_link_libraries(${TARGET} PRIVATE
            -Wl,--start-group
            ekk_rpi3_boot
            ekk
            -Wl,--end-group
        )
        target_include_directories(${TARGET} PRIVATE src/hal/rpi3)

        # Linker options
        target_link_options(${TARGET} PRIVATE
            -T${EKK_RPI3_LINKER_SCRIPT}
            -nostdlib
            -nostartfiles
            -Wl,-Map=${CMAKE_CURRENT_BINARY_DIR}/${TARGET}.map
            -Wl,--gc-sections
        )
        set_target_properties(${TARGET} PROPERTIES
            LINK_DEPENDS ${EKK_RPI3_LINKER_SCRIPT}
            SUFFIX ".elf"
        )

        # Generate kernel8.img (binary for RPi3)
        add_custom_command(TARGET ${TARGET} POST_BUILD
            COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${TARGET}> ${TARGET}.img
            COMMAND ${CMAKE_SIZE} $<TARGET_FILE:${TARGET}>
            COMMENT "Generating ${TARGET}.img for Raspberry Pi 3"
        )
    endfunction()

    # Default kernel (uses kernel_main from HAL)
    add_rpi3_kernel(kernel8 src/hal/rpi3/main_stub.c)

    # Copy kernel8.img for easy SD card deployment
    add_custom_command(TARGET kernel8 POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy
            ${CMAKE_CURRENT_BINARY_DIR}/kernel8.img
            ${CMAKE_CURRENT_SOURCE_DIR}/src/hal/rpi3/kernel8.img
        COMMENT "Copying kernel8.img to src/hal/rpi3/"
    )
endif()

# ============================================================================
# Tests (POSIX only - requires host execution)
# ============================================================================

if(EKK_BUILD_TESTS AND EKK_PLATFORM STREQUAL "posix")
    enable_testing()

    # Comprehensive test suite
    add_executable(test_ekk test/test_main.c)
    target_link_libraries(test_ekk PRIVATE ekk)
    add_test(NAME test_ekk COMMAND test_ekk)

    # JSON Test Vector Harness (with cJSON)
    add_executable(test_harness
        test/test_harness.c
        test/cjson/cJSON.c
    )
    target_include_directories(test_harness PRIVATE test)
    target_link_libraries(test_harness PRIVATE ekk)
    if(UNIX)
        target_link_libraries(test_harness PRIVATE m)  # math library for fabs()
    endif()

    # Run all test vectors
    file(GLOB TEST_VECTORS "${CMAKE_CURRENT_SOURCE_DIR}/../spec/test-vectors/*.json")
    add_test(NAME test_vectors
        COMMAND test_harness ${TEST_VECTORS}
    )

    # Benchmarks
    add_executable(bench_spsc test/bench_spsc.c)
    target_link_libraries(bench_spsc PRIVATE ekk)

    add_executable(bench_auth test/bench_auth.c)
    target_link_libraries(bench_auth PRIVATE ekk)
endif()

# ============================================================================
# Install
# ============================================================================

include(GNUInstallDirs)

install(TARGETS ekk
    EXPORT ekk-targets
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

install(DIRECTORY include/ekk
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)

install(EXPORT ekk-targets
    FILE ekk-config.cmake
    NAMESPACE ekk::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/ekk
)
