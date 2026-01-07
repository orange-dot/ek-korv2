@echo off
setlocal enabledelayedexpansion

set "REAL_GCC=C:\tricore-gcc\bin\tricore-elf-gcc.exe"
set "ARGS=%*"

REM Check if this is a compile (not link) and has a .c file
echo %ARGS% | findstr /i /c:"-c" >nul
if errorlevel 1 goto :passthrough

echo %ARGS% | findstr /i /c:".c" >nul
if errorlevel 1 goto :passthrough

REM Find -o argument and get output file
set "OUTPUT="
set "PREV="
for %%a in (%*) do (
    if "!PREV!"=="-o" (
        set "OUTPUT=%%~a"
    )
    set "PREV=%%~a"
)

if "%OUTPUT%"=="" goto :passthrough

REM Calculate .s file name
set "ASMFILE=%OUTPUT:.obj=.s%"
set "ASMFILE=%ASMFILE:.o=.s%"

REM Build args for assembly generation (replace -c with -S, output with .s)
set "ASMARGS="
set "PREV="
set "SKIP="
for %%a in (%*) do (
    if "!SKIP!"=="1" (
        set "ASMARGS=!ASMARGS! %ASMFILE%"
        set "SKIP="
    ) else if "%%~a"=="-c" (
        set "ASMARGS=!ASMARGS! -S"
    ) else if "%%~a"=="-o" (
        set "ASMARGS=!ASMARGS! -o"
        set "SKIP=1"
    ) else (
        set "ASMARGS=!ASMARGS! %%a"
    )
)

REM Generate assembly
%REAL_GCC% %ASMARGS%
if errorlevel 1 exit /b %errorlevel%

REM Fix .srodata and .sdata using PowerShell
powershell -NoProfile -Command "(Get-Content '%ASMFILE%' -Raw) -replace '(?m)^\.srodata$', '.section .srodata,\"a\",@progbits' -replace '(?m)^\.sdata$', '.section .sdata,\"aw\",@progbits' | Set-Content '%ASMFILE%' -NoNewline"

REM Assemble
%REAL_GCC% -c "%ASMFILE%" -o "%OUTPUT%"
set "RESULT=%errorlevel%"

REM Cleanup
del "%ASMFILE%" 2>nul

exit /b %RESULT%

:passthrough
%REAL_GCC% %*
exit /b %errorlevel%
