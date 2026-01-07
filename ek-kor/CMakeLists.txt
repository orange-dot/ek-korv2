# ek-kor - Portable RTOS Kernel Library
# Extracted from JEZGRO (STM32G474 + TC397XP implementations)

cmake_minimum_required(VERSION 3.16)
project(ek-kor VERSION 1.0.0 LANGUAGES C)

# =============================================================================
# Configuration Options
# =============================================================================

# Platform detection / override
set(EKK_MAX_CORES 1 CACHE STRING "Number of CPU cores (1 for single-core, 6 for TC397XP)")
set(EKK_MAX_TASKS_PER_CORE 16 CACHE STRING "Maximum tasks per core")
set(EKK_DEFAULT_STACK_SIZE 2048 CACHE STRING "Default task stack size in bytes")
set(EKK_MIN_STACK_SIZE 512 CACHE STRING "Minimum task stack size in bytes")
set(EKK_TICK_FREQ_HZ 1000 CACHE STRING "System tick frequency in Hz")

# IPC configuration
set(EKK_MAX_QUEUES 16 CACHE STRING "Message queues per core")
set(EKK_MAX_MAILBOXES 8 CACHE STRING "Cross-core mailboxes")
set(EKK_MAX_MSG_SIZE 64 CACHE STRING "Maximum message size in bytes")

# Sync configuration
set(EKK_MAX_MUTEXES 16 CACHE STRING "Mutexes per core")
set(EKK_MAX_SEMAPHORES 32 CACHE STRING "Semaphores per core")

# Feature flags
option(EKK_USE_EDF "Enable EDF (Earliest Deadline First) scheduling" ON)
option(EKK_TRACK_TIME "Track per-task execution time" ON)
option(EKK_CHECK_DEADLINE "Enable deadline miss detection" ON)
option(EKK_USE_MPU "Enable Memory Protection Unit support" OFF)
option(EKK_DEBUG "Enable debug assertions and logging" OFF)

# MPU configuration
set(EKK_MPU_REGIONS_PER_TASK 4 CACHE STRING "Maximum MPU regions per task")

# =============================================================================
# Generate Configuration Header
# =============================================================================

configure_file(
    ${CMAKE_CURRENT_SOURCE_DIR}/cmake/config.h.in
    ${CMAKE_CURRENT_BINARY_DIR}/include/ek-kor/config.h
    @ONLY
)

# =============================================================================
# Library Sources
# =============================================================================

set(EKK_SOURCES
    src/kernel/kernel.c
    src/kernel/scheduler.c
    src/kernel/task.c
    src/kernel/sync.c
    src/kernel/ipc.c
    src/kernel/fault.c
)

# =============================================================================
# Create Library
# =============================================================================

add_library(ek-kor STATIC ${EKK_SOURCES})

target_include_directories(ek-kor PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

# C99 standard - use compile_features where supported, fallback to flags
if(CMAKE_C_COMPILER_ID AND NOT CMAKE_C_COMPILER_ID STREQUAL "")
    target_compile_features(ek-kor PUBLIC c_std_99)
else()
    # Fallback for compilers without feature detection (e.g., TriCore GCC)
    target_compile_options(ek-kor PUBLIC -std=c99)
endif()

# Warning flags
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(ek-kor PRIVATE
        -Wall -Wextra -Wpedantic
        -Wno-unused-parameter
    )
endif()

# TriCore-specific flags (avoid small data addressing issues)
if(CMAKE_SYSTEM_PROCESSOR MATCHES "tricore")
    target_compile_options(ek-kor PRIVATE
        -msmall-data=0
        -msmall-const=0
        -fno-section-anchors
    )
endif()

# =============================================================================
# Install Configuration
# =============================================================================

include(GNUInstallDirs)

install(TARGETS ek-kor
    EXPORT ek-kor-targets
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

install(DIRECTORY include/ek-kor
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}
)

install(FILES ${CMAKE_CURRENT_BINARY_DIR}/include/ek-kor/config.h
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/ek-kor
)

install(EXPORT ek-kor-targets
    FILE EkKorTargets.cmake
    NAMESPACE EkKor::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/ek-kor
)

# =============================================================================
# Package Configuration
# =============================================================================

include(CMakePackageConfigHelpers)

configure_package_config_file(
    ${CMAKE_CURRENT_SOURCE_DIR}/cmake/EkKorConfig.cmake.in
    ${CMAKE_CURRENT_BINARY_DIR}/EkKorConfig.cmake
    INSTALL_DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/ek-kor
)

write_basic_package_version_file(
    ${CMAKE_CURRENT_BINARY_DIR}/EkKorConfigVersion.cmake
    VERSION ${PROJECT_VERSION}
    COMPATIBILITY SameMajorVersion
)

install(FILES
    ${CMAKE_CURRENT_BINARY_DIR}/EkKorConfig.cmake
    ${CMAKE_CURRENT_BINARY_DIR}/EkKorConfigVersion.cmake
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/ek-kor
)

# =============================================================================
# Tests (optional)
# =============================================================================

option(EKK_BUILD_TESTS "Build ek-kor tests" OFF)

if(EKK_BUILD_TESTS)
    enable_testing()
    add_subdirectory(test)
endif()
