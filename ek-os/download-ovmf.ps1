# Download OVMF UEFI Firmware for EK-OS testing
# OVMF is required to boot UEFI applications in QEMU

$OvmfUrl = "https://github.com/retrage/edk2-nightly/releases/download/202408/RELEASEX64_OVMF.fd"
$OvmfFile = "OVMF.fd"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OVMF Downloader for EK-OS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $OvmfFile) {
    Write-Host "OVMF.fd already exists. Delete it to re-download." -ForegroundColor Yellow
    exit 0
}

Write-Host "Downloading OVMF from GitHub..." -ForegroundColor Green
Write-Host "URL: $OvmfUrl"
Write-Host ""

try {
    # Use TLS 1.2 for HTTPS
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

    $ProgressPreference = 'SilentlyContinue'  # Faster download
    Invoke-WebRequest -Uri $OvmfUrl -OutFile $OvmfFile

    Write-Host ""
    Write-Host "SUCCESS! OVMF.fd downloaded." -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can run: .\run-qemu.ps1" -ForegroundColor Cyan
}
catch {
    Write-Host "ERROR: Download failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Manual download:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/retrage/edk2-nightly/releases"
    Write-Host "2. Download RELEASEX64_OVMF.fd"
    Write-Host "3. Rename to OVMF.fd and place in ek-os directory"
    exit 1
}
