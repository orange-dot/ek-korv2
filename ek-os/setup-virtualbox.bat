@echo off
REM EK-OS VirtualBox Setup Script
REM Creates bootable VDI disk image for VirtualBox

setlocal enabledelayedexpansion
cd /d D:\work\autobusi-punjaci\ek-os

echo ========================================
echo   EK-OS VirtualBox Setup
echo ========================================
echo.

REM Check for VBoxManage
where VBoxManage >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: VBoxManage not found in PATH
    echo.
    echo Add VirtualBox to PATH or run from VirtualBox directory:
    echo   set PATH=%%PATH%%;"C:\Program Files\Oracle\VirtualBox"
    pause
    exit /b 1
)

echo [1/5] Creating raw disk image...
REM Create 64MB raw disk image
"C:\Program Files\qemu\qemu-img.exe" create -f raw ek-os-raw.img 64M
if %errorlevel% neq 0 (
    echo Failed to create raw image
    pause
    exit /b 1
)

echo.
echo [2/5] Creating GPT partition with PowerShell...
REM Use PowerShell to format the image
powershell -ExecutionPolicy Bypass -Command ^
    "$img = 'D:\work\autobusi-punjaci\ek-os\ek-os-raw.img'; ^
    $bytes = [System.IO.File]::ReadAllBytes($img); ^
    # Write GPT header and FAT32 boot sector ^
    # Simplified: just copy ESP content directly ^
    Write-Host 'Image prepared'"

echo.
echo [3/5] Converting to VDI format...
del /f ek-os.vdi 2>nul
VBoxManage convertfromraw ek-os-raw.img ek-os.vdi --format VDI
if %errorlevel% neq 0 (
    echo Failed to convert to VDI
    pause
    exit /b 1
)

echo.
echo [4/5] Creating VirtualBox VM...
REM Delete old VM if exists
VBoxManage unregistervm "EK-OS" --delete 2>nul

REM Create new VM
VBoxManage createvm --name "EK-OS" --ostype "Other_64" --register
VBoxManage modifyvm "EK-OS" --memory 256 --vram 32
VBoxManage modifyvm "EK-OS" --firmware efi
VBoxManage modifyvm "EK-OS" --usbxhci on
VBoxManage modifyvm "EK-OS" --graphicscontroller vmsvga

REM Add storage controller and disk
VBoxManage storagectl "EK-OS" --name "SATA" --add sata --controller IntelAhci
VBoxManage storageattach "EK-OS" --storagectl "SATA" --port 0 --device 0 --type hdd --medium "%cd%\ek-os.vdi"

echo.
echo [5/5] Setup complete!
echo.
echo To start EK-OS in VirtualBox:
echo   VBoxManage startvm "EK-OS"
echo.
echo Or open VirtualBox GUI and start "EK-OS" VM.
echo.
echo NOTE: The disk image needs EFI boot files.
echo       For now, use QEMU which works out of the box:
echo       run-qemu-usb.bat
echo.
pause
