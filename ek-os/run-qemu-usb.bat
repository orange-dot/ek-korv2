@echo off
REM EK-OS QEMU Test Script with USB HID support
REM Run this from the ek-os directory

cd /d D:\work\autobusi-punjaci\ek-os

echo ========================================
echo   EK-OS QEMU Launcher (USB HID)
echo ========================================
echo.

REM Check for OVMF
if not exist OVMF.fd (
    echo ERROR: OVMF.fd not found!
    echo Copy edk2-x86_64-code.fd from QEMU share directory
    pause
    exit /b 1
)

REM Check for ESP
if not exist esp\EFI\BOOT\BOOTX64.EFI (
    echo ERROR: EK-OS not built!
    echo Run 'make' first.
    pause
    exit /b 1
)

echo Configuration:
echo   Memory: 256 MB
echo   USB: xHCI controller with keyboard and mouse
echo.
echo Serial output will appear below.
echo Press keys in QEMU window to test USB keyboard.
echo.

"C:\Program Files\qemu\qemu-system-x86_64.exe" ^
    -pflash OVMF.fd ^
    -drive format=raw,file=fat:rw:esp ^
    -m 256M ^
    -serial stdio ^
    -device qemu-xhci,id=xhci ^
    -device usb-kbd,bus=xhci.0 ^
    -device usb-mouse,bus=xhci.0

pause
