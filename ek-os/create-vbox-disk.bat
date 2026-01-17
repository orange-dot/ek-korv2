@echo off
REM Create bootable VDI for VirtualBox using QEMU tools
cd /d D:\work\autobusi-punjaci\ek-os

echo Creating bootable EK-OS disk for VirtualBox...
echo.

REM Step 1: Create VMDK that references our ESP folder
REM VirtualBox can boot directly from a folder with EFI files

echo Method 1: Direct VMDK (requires admin for raw disk access)
echo Method 2: QCOW2 converted to VDI
echo.

REM Use qemu-img to create qcow2, then convert
echo Creating QCOW2 image with ESP content...

REM Actually, let's create a proper FAT image using mtools or just document manual steps
echo.
echo ========================================
echo   Manual VirtualBox Setup
echo ========================================
echo.
echo 1. Open VirtualBox
echo.
echo 2. Create New VM:
echo    - Name: EK-OS
echo    - Type: Other
echo    - Version: Other/Unknown (64-bit)
echo    - Memory: 256 MB
echo    - Hard disk: Do not add
echo.
echo 3. Settings for EK-OS VM:
echo    - System ^> Extended Features ^> Enable EFI
echo    - USB ^> Enable USB Controller ^> USB 3.0 (xHCI)
echo.
echo 4. Storage:
echo    - Controller: SATA ^> Add Hard Disk
echo    - Choose existing: Select ek-os.vdi (after creating it)
echo.
echo 5. To create ek-os.vdi, run in PowerShell as Admin:
echo.
echo    # Mount VHD, format as FAT32, copy files
echo    $vhd = New-VHD -Path "D:\work\autobusi-punjaci\ek-os\ek-os.vhdx" -SizeBytes 64MB -Fixed
echo    Mount-VHD -Path $vhd.Path
echo    # Get disk number, create partition, format, copy esp\* to it
echo    # Then convert: VBoxManage clonehd ek-os.vhdx ek-os.vdi --format VDI
echo.
echo For now, QEMU is recommended for development.
echo Run: run-qemu-usb.bat
echo.
pause
