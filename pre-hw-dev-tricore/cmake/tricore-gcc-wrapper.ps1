# Wrapper for tricore-elf-gcc that fixes .srodata/.sdata section issue
# GCC 13+ generates ".srodata" but the assembler expects ".section .srodata"

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$RealGCC = "C:\tricore-gcc\bin\tricore-elf-gcc.exe"

# Join all args for pattern matching
$AllArgs = $Args -join " "

# Check if we're compiling a C file (not linking)
if ($AllArgs -match "-c" -and $AllArgs -match "\.c($|\s)") {
    # Find output file
    $OutputIdx = [Array]::IndexOf($Args, "-o")
    if ($OutputIdx -ge 0 -and $OutputIdx -lt $Args.Length - 1) {
        $OutputFile = $Args[$OutputIdx + 1]
        $AsmFile = $OutputFile -replace "\.o$", ".s"

        # Build args for assembly generation
        $AsmArgs = @()
        for ($i = 0; $i -lt $Args.Length; $i++) {
            if ($Args[$i] -eq "-c") {
                $AsmArgs += "-S"
            } elseif ($i -eq $OutputIdx + 1) {
                $AsmArgs += $AsmFile
            } else {
                $AsmArgs += $Args[$i]
            }
        }

        # Generate assembly
        & $RealGCC @AsmArgs
        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }

        # Fix .srodata and .sdata directives
        $Content = Get-Content $AsmFile -Raw
        $Content = $Content -replace '(?m)^\.srodata$', '.section .srodata,"a",@progbits'
        $Content = $Content -replace '(?m)^\.sdata$', '.section .sdata,"aw",@progbits'
        Set-Content $AsmFile -Value $Content -NoNewline

        # Assemble to object
        & $RealGCC -c $AsmFile -o $OutputFile
        $Result = $LASTEXITCODE

        # Cleanup
        Remove-Item $AsmFile -ErrorAction SilentlyContinue

        exit $Result
    }
}

# Fall through to normal compilation
& $RealGCC @Args
exit $LASTEXITCODE
