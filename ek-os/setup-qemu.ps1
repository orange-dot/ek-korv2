# EK-OS Development Setup Script
# Installs QEMU and OVMF for testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EK-OS Development Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for scoop (you have it since gcc is from scoop)
$scoopPath = "$env:USERPROFILE\scoop\shims\scoop.ps1"
$hasScoop = Test-Path $scoopPath -ErrorAction SilentlyContinue

if (-not $hasScoop) {
    # Check if scoop command works
    try {
        $null = Get-Command scoop -ErrorAction Stop
        $hasScoop = $true
    } catch {
        $hasScoop = $false
    }
}

if ($hasScoop) {
    Write-Host "Scoop detected. Installing QEMU via scoop..." -ForegroundColor Green
    Write-Host ""

    # Install QEMU
    Write-Host "Installing QEMU..." -ForegroundColor Yellow
    scoop install qemu

    Write-Host ""
    Write-Host "QEMU installed!" -ForegroundColor Green
} else {
    Write-Host "Scoop not found. Please install QEMU manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install via Scoop (recommended)"
    Write-Host "  iwr -useb get.scoop.sh | iex"
    Write-Host "  scoop install qemu"
    Write-Host ""
    Write-Host "Option 2: Download from official site"
    Write-Host "  https://www.qemu.org/download/#windows"
    Write-Host "  Install to C:\Program Files\qemu\"
    Write-Host "  Add to PATH: C:\Program Files\qemu\"
    Write-Host ""
    exit 1
}

# Download OVMF
Write-Host ""
Write-Host "Downloading OVMF UEFI firmware..." -ForegroundColor Yellow

$OvmfUrl = "https://github.com/retrage/edk2-nightly/releases/download/202408/RELEASEX64_OVMF.fd"
$OvmfFile = "OVMF.fd"

if (Test-Path $OvmfFile) {
    Write-Host "OVMF.fd already exists." -ForegroundColor Green
} else {
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri $OvmfUrl -OutFile $OvmfFile
        Write-Host "OVMF.fd downloaded!" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download OVMF. Please download manually from:" -ForegroundColor Red
        Write-Host "  https://github.com/retrage/edk2-nightly/releases" -ForegroundColor Yellow
        Write-Host "  Download RELEASEX64_OVMF.fd and rename to OVMF.fd"
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Build EK-OS:  make" -ForegroundColor White
Write-Host "  2. Create ESP:   make esp" -ForegroundColor White
Write-Host "  3. Run QEMU:     .\run-qemu.ps1" -ForegroundColor White
Write-Host ""
