#!/bin/bash
# Wrapper for tricore-elf-gcc that fixes .srodata section issue
# GCC 13+ generates ".srodata" but the assembler expects ".section .srodata"

# Find the real compiler
REAL_GCC="C:/tricore-gcc/bin/tricore-elf-gcc.exe"

# Check if we're compiling (not linking) and it's a C file
if [[ "$*" == *"-c"* ]] && [[ "$*" == *".c"* ]]; then
    # Generate assembly first
    ARGS=("$@")

    # Find output file
    OUTPUT=""
    for i in "${!ARGS[@]}"; do
        if [[ "${ARGS[$i]}" == "-o" ]]; then
            OUTPUT="${ARGS[$((i+1))]}"
            break
        fi
    done

    if [[ -n "$OUTPUT" ]]; then
        # Generate .s file
        ASM_FILE="${OUTPUT%.o}.s"

        # Replace -c with -S and run
        MODIFIED_ARGS=()
        for arg in "${ARGS[@]}"; do
            if [[ "$arg" == "-c" ]]; then
                MODIFIED_ARGS+=("-S")
            elif [[ "$arg" == "$OUTPUT" ]]; then
                MODIFIED_ARGS+=("$ASM_FILE")
            else
                MODIFIED_ARGS+=("$arg")
            fi
        done

        # Run GCC to generate assembly
        "$REAL_GCC" "${MODIFIED_ARGS[@]}"

        if [[ $? -ne 0 ]]; then
            exit 1
        fi

        # Fix .srodata and .sdata directives
        sed -i 's/^\.srodata$/.section .srodata,"a",@progbits/' "$ASM_FILE"
        sed -i 's/^\.sdata$/.section .sdata,"aw",@progbits/' "$ASM_FILE"

        # Assemble
        "$REAL_GCC" -c "$ASM_FILE" -o "$OUTPUT"
        RET=$?

        # Clean up
        rm -f "$ASM_FILE"

        exit $RET
    fi
fi

# Fall through to normal compilation
exec "$REAL_GCC" "$@"
