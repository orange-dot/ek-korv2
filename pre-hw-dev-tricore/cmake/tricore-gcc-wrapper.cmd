@echo off
REM Wrapper for tricore-elf-gcc that fixes .srodata section issue
REM Usage: tricore-gcc-wrapper.cmd [gcc args...]

setlocal enabledelayedexpansion

set "ARGS="
set "OUTPUT="
set "INPUT="
set "IS_COMPILE=0"

REM Parse arguments
:parse_args
if "%~1"=="" goto :run
if "%~1"=="-c" set "IS_COMPILE=1"
if "%~1"=="-o" (
    set "OUTPUT=%~2"
    shift
)
set "ARGS=!ARGS! %~1"
shift
goto :parse_args

:run
REM If this is a compile step (not link), we need to intercept
if !IS_COMPILE!==1 (
    REM Compile to assembly first
    set "TEMP_ASM=%TEMP%\tricore_temp_%RANDOM%.s"
    C:\tricore-gcc\bin\tricore-elf-gcc.exe !ARGS:-c=-S! -o "!TEMP_ASM!"
    if errorlevel 1 exit /b 1

    REM Fix .srodata sections
    powershell -Command "(Get-Content '!TEMP_ASM!') -replace '\.srodata', '.rodata' | Set-Content '!TEMP_ASM!'"

    REM Assemble
    C:\tricore-gcc\bin\tricore-elf-gcc.exe -c "!TEMP_ASM!" -o "!OUTPUT!"
    set "RESULT=!ERRORLEVEL!"

    REM Cleanup
    del "!TEMP_ASM!" 2>nul
    exit /b !RESULT!
) else (
    REM Not a compile step, just pass through
    C:\tricore-gcc\bin\tricore-elf-gcc.exe !ARGS!
    exit /b !ERRORLEVEL!
)
