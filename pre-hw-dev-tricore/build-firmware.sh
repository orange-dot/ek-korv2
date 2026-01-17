#!/bin/bash
# Build JEZGRO firmware for TriCore TC397XP
# Handles GCC 13 .srodata section issue

set -e

TRICORE_GCC="C:/tricore-gcc/bin/tricore-elf-gcc.exe"
TRICORE_AR="C:/tricore-gcc/bin/tricore-elf-ar.exe"
TRICORE_OBJCOPY="C:/tricore-gcc/bin/tricore-elf-objcopy.exe"
TRICORE_SIZE="C:/tricore-gcc/bin/tricore-elf-size.exe"

PROJECT_DIR="D:/work/autobusi-punjaci/pre-hw-dev-tricore"
BUILD_DIR="${PROJECT_DIR}/build/manual"
EK_KOR_LIB="${PROJECT_DIR}/build/ek-kor-manual/libek-kor.a"
LINKER_SCRIPT="${PROJECT_DIR}/cmake/tc397xp.ld"

CFLAGS="-mtc162 -mcpu=tc39xx -O0 -g3 -gdwarf-4"
CFLAGS="$CFLAGS -Wall -Wextra -Wno-unused-parameter -Wno-type-limits -Wno-unused-variable"
CFLAGS="$CFLAGS -mcode-pic"  # Use position-independent code (full 32-bit addressing)
CFLAGS="$CFLAGS -ffunction-sections -fdata-sections -fno-common"
CFLAGS="$CFLAGS -fno-section-anchors -fno-merge-constants"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/include"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/src -I${PROJECT_DIR}/src/kernel"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/src/hal -I${PROJECT_DIR}/src/arch"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/src/drivers"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/../ek-kor/include"
CFLAGS="$CFLAGS -I${PROJECT_DIR}/build/ek-kor/include"
CFLAGS="$CFLAGS -DTC397XP -DEKK_PLATFORM_TC397XP"
CFLAGS="$CFLAGS -DJEZGRO_LOCKSTEP_CORES=4 -DJEZGRO_CLOCK_HZ=300000000"
CFLAGS="$CFLAGS -DJEZGRO_DEBUG=1 -DJEZGRO_SAFETY_CHECKS=1 -DJEZGRO_MULTICORE=1"

ASFLAGS="-mtc162 -mcpu=tc39xx -g"

LDFLAGS="-T${LINKER_SCRIPT}"
LDFLAGS="$LDFLAGS -Wl,--gc-sections -Wl,-Map=jezgro-tricore.map"
LDFLAGS="$LDFLAGS -nostartfiles"
LDFLAGS="$LDFLAGS -mtc162 -mcpu=tc39xx"

mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# Function to compile C file with .srodata workaround
compile_c() {
    local src="$1"
    local name=$(basename "$src" .c)
    echo "Compiling $src..."

    # Step 1: Compile to assembly
    "$TRICORE_GCC" $CFLAGS -S "$src" -o "${name}.s.tmp" 2>&1 || {
        echo "ERROR: Failed to compile $src"
        cat "${name}.s.tmp" 2>/dev/null || true
        return 1
    }

    # Step 2: Fix section names
    # -mcode-pic generates .pictext for code (needs to be .text)
    # Also map any remaining small/absolute sections to standard sections
    sed -e 's/\.pictext/.text/g' \
        -e 's/\.zrodata/.rodata/g' \
        -e 's/\.zdata/.data/g' \
        -e 's/\.zbss/.bss/g' \
        -e 's/\.srodata/.rodata/g' \
        -e 's/\.sdata/.data/g' \
        -e 's/\.sbss/.bss/g' \
        "${name}.s.tmp" > "${name}.s"
    rm "${name}.s.tmp"

    # Step 3: Assemble
    "$TRICORE_GCC" $CFLAGS -c "${name}.s" -o "${name}.o"
    echo "  -> ${name}.o"
}

echo "================================================"
echo "Building JEZGRO for AURIX TC397XP"
echo "================================================"
echo ""

# Build ek-kor first if not present
if [ ! -f "$EK_KOR_LIB" ]; then
    echo "Building ek-kor library..."
    bash "${PROJECT_DIR}/build-ek-kor.sh"
    echo ""
fi

echo "Compiling architecture layer..."
compile_c "${PROJECT_DIR}/src/arch/tricore_cpu.c"
compile_c "${PROJECT_DIR}/src/arch/tricore_csa.c"
compile_c "${PROJECT_DIR}/src/arch/tricore_irq.c"
compile_c "${PROJECT_DIR}/src/arch/tricore_multicore.c"
echo ""

echo "Compiling HAL layer..."
compile_c "${PROJECT_DIR}/src/hal/hal_tc397xp.c"
echo ""

echo "Compiling startup..."
compile_c "${PROJECT_DIR}/src/startup_tc397xp.c"
compile_c "${PROJECT_DIR}/src/bmhd_tc397xp.c"
echo ""

echo "Assembling crt0..."
"$TRICORE_GCC" $ASFLAGS -c "${PROJECT_DIR}/src/crt0_tc397xp.s" -o crt0_tc397xp.o
echo "  -> crt0_tc397xp.o"
echo ""

echo "Compiling application..."
compile_c "${PROJECT_DIR}/src/main.c"
echo ""

echo "Linking..."
OBJECTS="crt0_tc397xp.o startup_tc397xp.o bmhd_tc397xp.o"
OBJECTS="$OBJECTS tricore_cpu.o tricore_csa.o tricore_irq.o tricore_multicore.o"
OBJECTS="$OBJECTS hal_tc397xp.o"
OBJECTS="$OBJECTS main.o"

"$TRICORE_GCC" $LDFLAGS -o jezgro-tricore.elf $OBJECTS "$EK_KOR_LIB" -lc -lgcc

echo ""
echo "Post-build..."
"$TRICORE_OBJCOPY" -O binary jezgro-tricore.elf jezgro-tricore.bin
"$TRICORE_OBJCOPY" -O ihex jezgro-tricore.elf jezgro-tricore.hex
"$TRICORE_OBJCOPY" -O srec jezgro-tricore.elf jezgro-tricore.srec

echo ""
echo "================================================"
echo "Build complete!"
echo "================================================"
"$TRICORE_SIZE" --format=berkeley jezgro-tricore.elf
echo ""
ls -la jezgro-tricore.*
