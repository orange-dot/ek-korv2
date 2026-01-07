#!/bin/bash
# Build ek-kor library for TriCore with .srodata workaround
# GCC 13 generates .srodata sections that the assembler doesn't understand

set -e

TRICORE_GCC="C:/tricore-gcc/bin/tricore-elf-gcc.exe"
TRICORE_AR="C:/tricore-gcc/bin/tricore-elf-ar.exe"

EK_KOR_DIR="D:/work/autobusi-punjaci/ek-kor"
BUILD_DIR="D:/work/autobusi-punjaci/pre-hw-dev-tricore/build/ek-kor-manual"
INCLUDE_DIR="D:/work/autobusi-punjaci/pre-hw-dev-tricore/build/ek-kor/include"

CFLAGS="-mtc162 -mcpu=tc39xx -O0 -g3 -gdwarf-4"
CFLAGS="$CFLAGS -Wall -Wextra -Wpedantic -Wno-unused-parameter"
CFLAGS="$CFLAGS -mcode-pic"  # Use position-independent code (full 32-bit addressing)
CFLAGS="$CFLAGS -fno-section-anchors -fno-merge-constants"
CFLAGS="$CFLAGS -I${EK_KOR_DIR}/include -I${INCLUDE_DIR}"

mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

SOURCES=(
    "kernel/kernel.c"
    "kernel/scheduler.c"
    "kernel/task.c"
    "kernel/sync.c"
    "kernel/ipc.c"
)

echo "Building ek-kor library for TriCore..."
echo "Flags: $CFLAGS"
echo ""

OBJECTS=""

for src in "${SOURCES[@]}"; do
    name=$(basename "$src" .c)
    echo "Compiling $src..."

    # Step 1: Compile to assembly
    "$TRICORE_GCC" $CFLAGS -S "${EK_KOR_DIR}/src/${src}" -o "${name}.s.tmp"

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

    OBJECTS="$OBJECTS ${name}.o"
    echo "  -> ${name}.o"
done

echo ""
echo "Creating static library..."
"$TRICORE_AR" rcs libek-kor.a $OBJECTS

echo ""
echo "Done! Library: $BUILD_DIR/libek-kor.a"
ls -la libek-kor.a
