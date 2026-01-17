cmake_minimum_required(VERSION 3.16)
project(tcpxxx-emulator
    VERSION 0.1.0
    DESCRIPTION "TC397XP Functional Emulator with Timing Annotations"
    LANGUAGES C
)

# C11 standard
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Build type defaults
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Debug)
endif()

# Compiler warnings
if(CMAKE_C_COMPILER_ID MATCHES "GNU|Clang")
    add_compile_options(-Wall -Wextra -Wpedantic -Wno-unused-parameter)
elseif(MSVC)
    add_compile_options(/W4)
endif()

# Debug symbols
if(CMAKE_BUILD_TYPE STREQUAL "Debug")
    add_compile_options(-g -O0)
    add_definitions(-DDEBUG)
endif()

# Include directories
include_directories(
    ${CMAKE_SOURCE_DIR}/include
)

# Source files
set(CORE_SOURCES
    src/core/tricore_decode.c
    src/core/tricore_exec.c
    src/core/tricore_timing.c
    src/core/tricore_regs.c
    src/core/tricore_cpu.c
    src/core/multicore.c
)

set(MEMORY_SOURCES
    src/memory/mem_system.c
)

set(CSA_SOURCES
    src/csa/csa_emulation.c
)

set(PERIPHERAL_SOURCES
    src/peripherals/stm.c
    src/peripherals/asclin.c
    src/peripherals/ir.c
    src/peripherals/scu.c
    src/peripherals/periph_bus.c
)

set(LOADER_SOURCES
    src/loader/elf_loader.c
)

set(DEBUG_SOURCES
    src/debug/gdb_server.c
    src/debug/trace_log.c
)

# Main emulator executable
add_executable(tcpxxx-emu
    src/main.c
    ${CORE_SOURCES}
    ${MEMORY_SOURCES}
    ${CSA_SOURCES}
    ${PERIPHERAL_SOURCES}
    ${LOADER_SOURCES}
    ${DEBUG_SOURCES}
)

# Platform-specific libraries
if(WIN32)
    target_link_libraries(tcpxxx-emu ws2_32)  # For GDB server sockets
elseif(UNIX)
    target_link_libraries(tcpxxx-emu pthread)
endif()

# Unity test framework (optional)
option(BUILD_TESTS "Build unit tests" ON)
if(BUILD_TESTS)
    # Fetch Unity test framework
    include(FetchContent)
    FetchContent_Declare(
        unity
        GIT_REPOSITORY https://github.com/ThrowTheSwitch/Unity.git
        GIT_TAG v2.5.2
    )
    FetchContent_MakeAvailable(unity)

    enable_testing()

    # Test executables
    add_executable(test_decode test/test_decode.c src/core/tricore_decode.c)
    target_link_libraries(test_decode unity)
    add_test(NAME test_decode COMMAND test_decode)

    add_executable(test_exec test/test_exec.c
        src/core/tricore_decode.c
        src/core/tricore_exec.c
        src/core/tricore_timing.c
        src/core/tricore_regs.c
        src/memory/mem_system.c
        ${PERIPHERAL_SOURCES}
    )
    target_link_libraries(test_exec unity)
    add_test(NAME test_exec COMMAND test_exec)
endif()

# Installation
install(TARGETS tcpxxx-emu DESTINATION bin)
install(DIRECTORY include/ DESTINATION include/tcpxxx-emu)
install(DIRECTORY timing_tables/ DESTINATION share/tcpxxx-emu/timing_tables)

# Print configuration
message(STATUS "TC397XP Emulator Configuration:")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  C compiler: ${CMAKE_C_COMPILER}")
message(STATUS "  Build tests: ${BUILD_TESTS}")
