cmake_minimum_required(VERSION 3.16)

# For ARM cross-compilation, we need ASM. For host builds, C only.
if(CMAKE_TOOLCHAIN_FILE)
    project(jezgro VERSION 0.1.0 LANGUAGES C ASM)
else()
    project(jezgro VERSION 0.1.0 LANGUAGES C)
endif()

# Options
option(BUILD_SIM "Build for simulation (host PC)" ON)
option(BUILD_TESTS "Build test suite" ON)
option(ENABLE_DEBUG "Enable debug output" ON)

# Detect if we're cross-compiling for ARM
if(CMAKE_SYSTEM_PROCESSOR STREQUAL "arm")
    set(BUILD_ARM ON)
    set(BUILD_SIM OFF)
    message(STATUS "Cross-compiling for ARM Cortex-M4")
endif()

# C standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Compiler warnings
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-Wall -Wextra -Wpedantic)
    if(ENABLE_DEBUG)
        add_compile_options(-g -O0)
    else()
        add_compile_options(-O2)
    endif()
elseif(MSVC)
    add_compile_options(/W4)
    if(ENABLE_DEBUG)
        add_compile_options(/Od /Zi)
    else()
        add_compile_options(/O2)
    endif()
endif()

# =============================================================================
# ek-kor RTOS Library (shared kernel)
# =============================================================================

# Configure ek-kor for single-core STM32
set(EKK_MAX_CORES 1 CACHE STRING "" FORCE)
set(EKK_MAX_TASKS_PER_CORE 16 CACHE STRING "" FORCE)
set(EKK_DEBUG ${ENABLE_DEBUG} CACHE BOOL "" FORCE)
# Use EDF scheduling (deadline=0 means no deadline = lowest priority)
set(EKK_USE_EDF ON CACHE BOOL "" FORCE)

# Add ek-kor as subdirectory
add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../ek-kor ${CMAKE_BINARY_DIR}/ek-kor)

# =============================================================================
# Platform HAL
# =============================================================================

# Simulation build (host PC)
if(BUILD_SIM)
    message(STATUS "Building for simulation (host PC)")
    add_definitions(-DJEZGRO_SIM -DEKK_PLATFORM_SIM)

    # HAL library for simulation
    add_library(jezgro_hal STATIC
        src/hal/hal_sim.c
    )

    target_include_directories(jezgro_hal PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
    )

    target_link_libraries(jezgro_hal PUBLIC ek-kor)

    # Windows needs some extra libs
    if(WIN32)
        target_link_libraries(jezgro_hal PRIVATE winmm)
    else()
        target_link_libraries(jezgro_hal PRIVATE pthread)
    endif()

    # Test executable
    if(BUILD_TESTS)
        add_executable(jezgro_test
            test/test_main.c
        )

        target_link_libraries(jezgro_test PRIVATE jezgro_hal ek-kor)

        target_include_directories(jezgro_test PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
        )

        # Enable testing
        enable_testing()
        add_test(NAME jezgro_tests COMMAND jezgro_test)
    endif()

else()
    # Cross-compile for target hardware (STM32G474)
    message(STATUS "Building for STM32G474 target")

    # Define target platform
    add_definitions(-DSTM32G474xx -DEKK_PLATFORM_STM32)

    # Linker script
    set(LINKER_SCRIPT ${CMAKE_CURRENT_SOURCE_DIR}/cmake/stm32g474.ld)
    set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -T${LINKER_SCRIPT}")

    # HAL library for STM32
    add_library(jezgro_hal STATIC
        src/hal/hal_stm32.c
    )

    target_include_directories(jezgro_hal PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
    )

    target_link_libraries(jezgro_hal PUBLIC ek-kor)

    # Create firmware executable
    add_executable(jezgro_firmware
        src/startup_stm32g474.s
        src/firmware_main.c
    )

    target_link_libraries(jezgro_firmware PRIVATE jezgro_hal ek-kor)

    target_include_directories(jezgro_firmware PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
    )

    # Post-build: generate binary and print size
    add_custom_command(TARGET jezgro_firmware POST_BUILD
        COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:jezgro_firmware> jezgro_firmware.bin
        COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:jezgro_firmware> jezgro_firmware.hex
        COMMAND ${CMAKE_SIZE} $<TARGET_FILE:jezgro_firmware>
        COMMENT "Generating binary files and size info"
    )

    # Generate map file
    set_target_properties(jezgro_firmware PROPERTIES
        LINK_FLAGS "-Wl,-Map=jezgro_firmware.map"
    )
endif()

# =============================================================================
# Legacy compatibility - install old headers as aliases
# =============================================================================

# For backward compatibility, keep old include paths working
install(TARGETS jezgro_hal
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
)

# Package info
set(CPACK_PACKAGE_NAME "jezgro")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION "JEZGRO Microkernel RTOS (using ek-kor)")
include(CPack)

# Print configuration
message(STATUS "")
message(STATUS "JEZGRO Configuration:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  Simulation: ${BUILD_SIM}")
message(STATUS "  Using ek-kor kernel library")
if(BUILD_ARM)
message(STATUS "  ARM Target: STM32G474")
message(STATUS "  Linker Script: ${LINKER_SCRIPT}")
endif()
message(STATUS "  Tests: ${BUILD_TESTS}")
message(STATUS "  Debug: ${ENABLE_DEBUG}")
message(STATUS "")
