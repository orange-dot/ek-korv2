# EK-OS QEMU Test Script for Windows
# Requires: QEMU for Windows and OVMF UEFI firmware
#
# Install QEMU: https://www.qemu.org/download/#windows
# Get OVMF: https://github.com/retrage/edk2-nightly/releases
#
# For testing with VirtualBox instead:
# VirtualBox can boot UEFI, but QEMU is recommended for kernel development
# because it has better debugging support (serial stdio, GDB integration).

param(
    [switch]$Debug,
    [int]$Cores = 4,
    [int]$MemoryMB = 128
)

# Configuration
$QemuPath = "C:\Program Files\qemu\qemu-system-x86_64.exe"
$OvmfPath = ".\OVMF.fd"  # Place OVMF.fd in ek-os directory
$EspDir = ".\esp"

# Check if OVMF exists
if (-not (Test-Path $OvmfPath)) {
    Write-Host "ERROR: OVMF.fd not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Download OVMF from:" -ForegroundColor Yellow
    Write-Host "  https://github.com/retrage/edk2-nightly/releases"
    Write-Host ""
    Write-Host "Or use the script download-ovmf.ps1 to get it automatically."
    Write-Host ""
    Write-Host "Extract OVMF.fd to: $((Resolve-Path .).Path)" -ForegroundColor Cyan
    exit 1
}

# Check if ESP directory exists
if (-not (Test-Path "$EspDir\EFI\BOOT\BOOTX64.EFI")) {
    Write-Host "ERROR: EK-OS.efi not found!" -ForegroundColor Red
    Write-Host "Run 'make esp' first to build and create the ESP directory."
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EK-OS QEMU Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:"
Write-Host "  Cores:  $Cores"
Write-Host "  Memory: $MemoryMB MB"
Write-Host "  Debug:  $Debug"
Write-Host ""
Write-Host "Serial output will appear here." -ForegroundColor Yellow
Write-Host "Press 'r' in serial to reboot, 's' for status." -ForegroundColor Yellow
Write-Host ""

# Build QEMU command
$QemuArgs = @(
    "-bios", $OvmfPath,
    "-drive", "file=fat:rw:$EspDir,format=raw,if=ide",
    "-serial", "stdio",
    "-smp", $Cores,
    "-m", "${MemoryMB}M",
    "-no-reboot"
)

if ($Debug) {
    $QemuArgs += @("-d", "int,cpu_reset", "-S", "-s")
    Write-Host "GDB server listening on localhost:1234" -ForegroundColor Green
    Write-Host "Connect with: gdb -ex 'target remote :1234'" -ForegroundColor Green
}

# Run QEMU
& $QemuPath @QemuArgs
