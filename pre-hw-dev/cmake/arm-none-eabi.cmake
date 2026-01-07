# =============================================================================
# ARM Cortex-M4 Toolchain File for JEZGRO RTOS
# Target: STM32G474 (Cortex-M4F with FPU)
# =============================================================================

set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR arm)

# Toolchain prefix
set(TOOLCHAIN_PREFIX arm-none-eabi-)

# Find tools
find_program(CMAKE_C_COMPILER ${TOOLCHAIN_PREFIX}gcc)
find_program(CMAKE_CXX_COMPILER ${TOOLCHAIN_PREFIX}g++)
find_program(CMAKE_ASM_COMPILER ${TOOLCHAIN_PREFIX}gcc)
find_program(CMAKE_AR ${TOOLCHAIN_PREFIX}ar)
find_program(CMAKE_OBJCOPY ${TOOLCHAIN_PREFIX}objcopy)
find_program(CMAKE_OBJDUMP ${TOOLCHAIN_PREFIX}objdump)
find_program(CMAKE_SIZE ${TOOLCHAIN_PREFIX}size)

# Cortex-M4 with hardware FPU flags
set(CPU_FLAGS "-mcpu=cortex-m4 -mthumb -mfloat-abi=hard -mfpu=fpv4-sp-d16")

# Compiler flags
set(CMAKE_C_FLAGS_INIT "${CPU_FLAGS} -ffunction-sections -fdata-sections -fno-common")
set(CMAKE_CXX_FLAGS_INIT "${CPU_FLAGS} -ffunction-sections -fdata-sections -fno-common -fno-exceptions -fno-rtti")
set(CMAKE_ASM_FLAGS_INIT "${CPU_FLAGS}")

# Linker flags
set(CMAKE_EXE_LINKER_FLAGS_INIT "${CPU_FLAGS} -Wl,--gc-sections -specs=nosys.specs -specs=nano.specs")

# Don't run compiler test (cross-compiling)
set(CMAKE_C_COMPILER_WORKS 1)
set(CMAKE_CXX_COMPILER_WORKS 1)

# Where to look for libraries and includes
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Output message
message(STATUS "ARM Cortex-M4 Toolchain configured")
message(STATUS "  Compiler: ${CMAKE_C_COMPILER}")
message(STATUS "  CPU Flags: ${CPU_FLAGS}")
