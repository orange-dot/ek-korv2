cmake_minimum_required(VERSION 3.16)
project(jezgro VERSION 0.1.0 LANGUAGES C)

# Options
option(BUILD_SIM "Build for simulation (host PC)" ON)
option(BUILD_TESTS "Build test suite" ON)
option(ENABLE_DEBUG "Enable debug output" ON)

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

# Simulation build (host PC)
if(BUILD_SIM)
    message(STATUS "Building for simulation (host PC)")
    add_definitions(-DJEZGRO_SIM)

    # Kernel library
    add_library(jezgro_kernel STATIC
        src/kernel/scheduler.c
        src/kernel/ipc.c
        src/kernel/task.c
        src/hal/hal_sim.c
    )

    target_include_directories(jezgro_kernel PUBLIC
        ${CMAKE_CURRENT_SOURCE_DIR}/src/kernel
        ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
    )

    # Windows needs some extra libs
    if(WIN32)
        target_link_libraries(jezgro_kernel PRIVATE winmm)
    else()
        target_link_libraries(jezgro_kernel PRIVATE pthread)
    endif()

    # Test executable
    if(BUILD_TESTS)
        add_executable(jezgro_test
            test/test_main.c
        )

        target_link_libraries(jezgro_test PRIVATE jezgro_kernel)

        target_include_directories(jezgro_test PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/src/kernel
            ${CMAKE_CURRENT_SOURCE_DIR}/src/hal
        )

        # Enable testing
        enable_testing()
        add_test(NAME jezgro_tests COMMAND jezgro_test)
    endif()

else()
    # Cross-compile for target hardware
    message(STATUS "Building for target hardware")

    # This would be configured for ARM cross-compilation
    # set(CMAKE_TOOLCHAIN_FILE cmake/arm-none-eabi.cmake)

    # Kernel library for embedded
    add_library(jezgro_kernel STATIC
        src/kernel/scheduler.c
        src/kernel/ipc.c
        src/kernel/task.c
        # HAL would be selected based on target
        # src/hal/hal_stm32.c  # or hal_aurix.c
    )
endif()

# Installation
install(TARGETS jezgro_kernel
    ARCHIVE DESTINATION lib
    LIBRARY DESTINATION lib
)

install(FILES
    src/kernel/jezgro.h
    src/kernel/scheduler.h
    src/kernel/ipc.h
    src/kernel/task.h
    src/hal/hal.h
    DESTINATION include/jezgro
)

# Package info
set(CPACK_PACKAGE_NAME "jezgro")
set(CPACK_PACKAGE_VERSION ${PROJECT_VERSION})
set(CPACK_PACKAGE_DESCRIPTION "JEZGRO Microkernel RTOS")
include(CPack)

# Print configuration
message(STATUS "")
message(STATUS "JEZGRO Configuration:")
message(STATUS "  Version: ${PROJECT_VERSION}")
message(STATUS "  Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "  Simulation: ${BUILD_SIM}")
message(STATUS "  Tests: ${BUILD_TESTS}")
message(STATUS "  Debug: ${ENABLE_DEBUG}")
message(STATUS "")
