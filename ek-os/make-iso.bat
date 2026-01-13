@echo off
REM Create bootable ISO for VirtualBox/VMware
REM Requires: mkisofs or xorriso

echo Creating EK-OS bootable ISO...

REM Check if xorriso is available
where xorriso >nul 2>&1
if %errorlevel% equ 0 (
    xorriso -as mkisofs -o ek-os.iso -e EFI/BOOT/BOOTX64.EFI -no-emul-boot esp
    echo Created ek-os.iso
) else (
    echo xorriso not found. 
    echo.
    echo Alternative: Use VirtualBox directly with the esp folder:
    echo   1. Create new VM, Type: Other, Version: Other/Unknown (64-bit)
    echo   2. Enable EFI: Settings - System - Enable EFI
    echo   3. Add USB controller: Settings - USB - USB 3.0 (xHCI)
    echo   4. Storage: Add esp folder as FAT filesystem or use raw disk
)
pause
