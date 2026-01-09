@echo off
REM EK-OS QEMU Test Script for Windows (CMD version)
REM Requires: QEMU for Windows and OVMF.fd

echo ========================================
echo   EK-OS QEMU Launcher
echo ========================================
echo.

REM Check for OVMF
if not exist OVMF.fd (
    echo ERROR: OVMF.fd not found!
    echo.
    echo Download OVMF from:
    echo   https://github.com/retrage/edk2-nightly/releases
    echo.
    echo Or run: powershell -ExecutionPolicy Bypass -File download-ovmf.ps1
    pause
    exit /b 1
)

REM Check for ESP
if not exist esp\EFI\BOOT\BOOTX64.EFI (
    echo ERROR: EK-OS not built!
    echo Run 'make esp' first.
    pause
    exit /b 1
)

echo Configuration:
echo   Cores:  4
echo   Memory: 128 MB
echo.
echo Serial output will appear here.
echo Press 'r' to reboot, 's' for status.
echo.

qemu-system-x86_64 ^
    -bios OVMF.fd ^
    -drive format=raw,file=fat:rw:esp ^
    -serial stdio ^
    -smp 4 ^
    -m 128M ^
    -no-reboot

pause
