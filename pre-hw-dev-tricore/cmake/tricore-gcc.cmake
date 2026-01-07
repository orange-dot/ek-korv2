# TriCore GCC Toolchain for CMake
# Target: Infineon AURIX TC397XP
#
# Supported toolchains:
#   1. AURIX Development Studio (bundled TriCore GCC)
#   2. HighTec Free Entry Toolchain
#   3. NoMore201 tricore-gcc-toolchain (open source)
#
# Set TRICORE_TOOLCHAIN_PATH environment variable to toolchain bin directory

cmake_minimum_required(VERSION 3.20)

# =============================================================================
# System Configuration
# =============================================================================

set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR tricore)

# Cross-compilation - don't try to run test executables
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# =============================================================================
# Toolchain Discovery
# =============================================================================

# Try to find toolchain in common locations
set(TRICORE_TOOLCHAIN_PREFIXES
    "tricore-elf-"          # HighTec / NoMore201
    "tricore-gcc-"          # Some distributions
    "tc-"                   # AURIX Development Studio
)

# Check environment variable first
if(DEFINED ENV{TRICORE_TOOLCHAIN_PATH})
    set(TRICORE_TOOLCHAIN_PATH $ENV{TRICORE_TOOLCHAIN_PATH})
    message(STATUS "Using TRICORE_TOOLCHAIN_PATH: ${TRICORE_TOOLCHAIN_PATH}")
endif()

# Common installation paths
set(TRICORE_TOOLCHAIN_SEARCH_PATHS
    "${TRICORE_TOOLCHAIN_PATH}"
    "C:/tricore-gcc/bin"
    "C:/Infineon/AURIX-Studio/plugins/com.infineon.aurix.tools*/tools/tricore/v*/bin"
    "C:/HighTec/toolchains/tricore/v*/bin"
    "/opt/tricore-gcc/bin"
    "/usr/local/tricore-elf/bin"
)

# Find the toolchain prefix
foreach(PREFIX ${TRICORE_TOOLCHAIN_PREFIXES})
    find_program(TRICORE_GCC "${PREFIX}gcc"
        PATHS ${TRICORE_TOOLCHAIN_SEARCH_PATHS}
        NO_DEFAULT_PATH
    )
    if(TRICORE_GCC)
        set(TRICORE_PREFIX ${PREFIX})
        get_filename_component(TRICORE_TOOLCHAIN_DIR ${TRICORE_GCC} DIRECTORY)
        message(STATUS "Found TriCore GCC: ${TRICORE_GCC}")
        break()
    endif()
endforeach()

if(NOT TRICORE_GCC)
    # Last resort: assume it's in PATH
    set(TRICORE_PREFIX "tricore-elf-")
    set(TRICORE_TOOLCHAIN_DIR "")
    message(WARNING "TriCore toolchain not found in standard locations, assuming '${TRICORE_PREFIX}' prefix is in PATH")
endif()

# =============================================================================
# Compiler and Tools
# =============================================================================

# Build tool paths - use "/" only if directory is set
if(TRICORE_TOOLCHAIN_DIR)
    set(TOOL_PREFIX "${TRICORE_TOOLCHAIN_DIR}/")
else()
    set(TOOL_PREFIX "")
endif()

set(CMAKE_C_COMPILER    "${TOOL_PREFIX}${TRICORE_PREFIX}gcc.exe"     CACHE FILEPATH "C Compiler" FORCE)
set(CMAKE_ASM_COMPILER  "${TOOL_PREFIX}${TRICORE_PREFIX}gcc.exe"     CACHE FILEPATH "ASM Compiler" FORCE)
set(CMAKE_AR            "${TOOL_PREFIX}${TRICORE_PREFIX}ar.exe"      CACHE FILEPATH "Archiver" FORCE)
set(CMAKE_OBJCOPY       "${TOOL_PREFIX}${TRICORE_PREFIX}objcopy.exe" CACHE FILEPATH "Object Copy" FORCE)
set(CMAKE_OBJDUMP       "${TOOL_PREFIX}${TRICORE_PREFIX}objdump.exe" CACHE FILEPATH "Object Dump" FORCE)
set(CMAKE_SIZE          "${TOOL_PREFIX}${TRICORE_PREFIX}size.exe"    CACHE FILEPATH "Size Tool" FORCE)
set(CMAKE_NM            "${TOOL_PREFIX}${TRICORE_PREFIX}nm.exe"      CACHE FILEPATH "NM Tool" FORCE)
set(CMAKE_STRIP         "${TOOL_PREFIX}${TRICORE_PREFIX}strip.exe"   CACHE FILEPATH "Strip Tool" FORCE)
set(CMAKE_RANLIB        "${TOOL_PREFIX}${TRICORE_PREFIX}ranlib.exe"  CACHE FILEPATH "Ranlib" FORCE)

# =============================================================================
# Compiler Flags
# =============================================================================

# TriCore TC1.6.2 architecture (TC39x family)
set(CMAKE_C_FLAGS_INIT
    "-mtc162 -mcpu=tc39xx"
    CACHE STRING "C Compiler Flags"
)

set(CMAKE_ASM_FLAGS_INIT
    "-mtc162 -mcpu=tc39xx"
    CACHE STRING "ASM Compiler Flags"
)

# Debug configuration
set(CMAKE_C_FLAGS_DEBUG_INIT
    "-Og -g3 -gdwarf-4"
    CACHE STRING "C Debug Flags"
)

# Release configuration
set(CMAKE_C_FLAGS_RELEASE_INIT
    "-O2 -DNDEBUG"
    CACHE STRING "C Release Flags"
)

# =============================================================================
# Linker Flags
# =============================================================================

set(CMAKE_EXE_LINKER_FLAGS_INIT
    "-nostartfiles -nodefaultlibs -Wl,--gc-sections"
    CACHE STRING "Linker Flags"
)

# =============================================================================
# Library Search
# =============================================================================

# Don't search host system paths
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# =============================================================================
# TriCore Specific
# =============================================================================

# Assembly file extension
set(CMAKE_ASM_SOURCE_FILE_EXTENSIONS s;S;asm)

# Output suffix
set(CMAKE_EXECUTABLE_SUFFIX ".elf")
