# Create-VBoxDisk.ps1
# Creates a bootable VDI disk for VirtualBox
# RUN AS ADMINISTRATOR

param(
    [string]$OutputPath = "D:\work\autobusi-punjaci\ek-os\ek-os.vdi",
    [string]$EspPath = "D:\work\autobusi-punjaci\ek-os\esp"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EK-OS VirtualBox Disk Creator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Run this script as Administrator!" -ForegroundColor Red
    exit 1
}

$vhdPath = "D:\work\autobusi-punjaci\ek-os\ek-os.vhdx"

# Remove old files
if (Test-Path $vhdPath) {
    Write-Host "Removing old VHDX..."
    Dismount-VHD -Path $vhdPath -ErrorAction SilentlyContinue
    Remove-Item $vhdPath -Force
}
if (Test-Path $OutputPath) { Remove-Item $OutputPath -Force }

Write-Host "[1/5] Creating VHDX disk image..." -ForegroundColor Yellow
$vhd = New-VHD -Path $vhdPath -SizeBytes 64MB -Fixed

Write-Host "[2/5] Mounting and partitioning..." -ForegroundColor Yellow
Mount-VHD -Path $vhdPath

# Get the disk
$disk = Get-Disk | Where-Object { $_.Location -eq $vhdPath }
if (-not $disk) {
    Write-Host "ERROR: Could not find mounted disk" -ForegroundColor Red
    exit 1
}

# Initialize as GPT
Initialize-Disk -Number $disk.Number -PartitionStyle GPT

# Create EFI System Partition
$partition = New-Partition -DiskNumber $disk.Number -UseMaximumSize -GptType "{c12a7328-f81f-11d2-ba4b-00a0c93ec93b}"
Format-Volume -Partition $partition -FileSystem FAT32 -NewFileSystemLabel "EK-OS" -Confirm:$false

# Assign drive letter
$partition | Add-PartitionAccessPath -AccessPath "Z:"
Start-Sleep -Seconds 2

Write-Host "[3/5] Copying EFI boot files..." -ForegroundColor Yellow
Copy-Item -Path "$EspPath\*" -Destination "Z:\" -Recurse -Force

Write-Host "[4/5] Unmounting VHDX..." -ForegroundColor Yellow
Dismount-VHD -Path $vhdPath

Write-Host "[5/5] Converting to VDI..." -ForegroundColor Yellow
$vboxManage = "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
if (Test-Path $vboxManage) {
    & $vboxManage clonehd $vhdPath $OutputPath --format VDI
    Write-Host ""
    Write-Host "SUCCESS! Created: $OutputPath" -ForegroundColor Green
} else {
    Write-Host "VBoxManage not found. VHDX created at: $vhdPath" -ForegroundColor Yellow
    Write-Host "Convert manually: VBoxManage clonehd $vhdPath $OutputPath --format VDI"
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open VirtualBox"
Write-Host "2. Create VM: Other/Unknown (64-bit), 256MB RAM"
Write-Host "3. Enable EFI in System settings"
Write-Host "4. Enable USB 3.0 (xHCI) in USB settings"
Write-Host "5. Add $OutputPath as hard disk"
Write-Host "6. Start VM!"
Write-Host ""
