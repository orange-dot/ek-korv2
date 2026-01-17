#!/bin/bash
# Wrapper around tricore-elf-as to work around .srodata section issue
# Replaces .srodata with .rodata in the assembly source

REAL_AS="C:/tricore-gcc/bin/tricore-elf-as.exe"

# Find the input file (last argument that's a .s file)
INPUT_FILE=""
ARGS=()
for arg in "$@"; do
    if [[ "$arg" == *.s ]]; then
        INPUT_FILE="$arg"
    fi
    ARGS+=("$arg")
done

# If we have an input file, preprocess it
if [[ -n "$INPUT_FILE" && -f "$INPUT_FILE" ]]; then
    # Replace .srodata with .rodata
    sed -i 's/\.srodata/.rodata/g' "$INPUT_FILE"
fi

# Call the real assembler
exec "$REAL_AS" "${ARGS[@]}"
