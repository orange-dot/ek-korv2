# JEZGRO Development Environment Setup - Windows
# Run as Administrator if needed for some installations

Write-Host "======================================"
Write-Host "  JEZGRO Development Setup (Windows)"
Write-Host "======================================"
Write-Host ""

$ErrorActionPreference = "Stop"

# Check for admin rights (optional warning)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Note: Running without admin rights. Some installations may require elevation." -ForegroundColor Yellow
    Write-Host ""
}

# Check for package managers
$hasChoco = Get-Command choco -ErrorAction SilentlyContinue
$hasWinget = Get-Command winget -ErrorAction SilentlyContinue
$hasScoop = Get-Command scoop -ErrorAction SilentlyContinue

Write-Host "Checking package managers..."
Write-Host "  Chocolatey: $(if ($hasChoco) { 'Found' } else { 'Not found' })"
Write-Host "  Winget: $(if ($hasWinget) { 'Found' } else { 'Not found' })"
Write-Host "  Scoop: $(if ($hasScoop) { 'Found' } else { 'Not found' })"
Write-Host ""

# Install CMake
Write-Host "Checking CMake..."
if (Get-Command cmake -ErrorAction SilentlyContinue) {
    $cmakeVersion = cmake --version | Select-Object -First 1
    Write-Host "  CMake already installed: $cmakeVersion" -ForegroundColor Green
} else {
    Write-Host "  Installing CMake..." -ForegroundColor Yellow
    if ($hasWinget) {
        winget install --id Kitware.CMake -e --silent
    } elseif ($hasChoco) {
        choco install cmake -y
    } else {
        Write-Host "  Please install CMake manually from https://cmake.org/download/" -ForegroundColor Red
    }
}

# Install GCC (MinGW)
Write-Host ""
Write-Host "Checking GCC..."
if (Get-Command gcc -ErrorAction SilentlyContinue) {
    $gccVersion = gcc --version | Select-Object -First 1
    Write-Host "  GCC already installed: $gccVersion" -ForegroundColor Green
} else {
    Write-Host "  Installing MinGW-w64..." -ForegroundColor Yellow
    if ($hasChoco) {
        choco install mingw -y
    } elseif ($hasScoop) {
        scoop install mingw
    } else {
        Write-Host "  Please install MinGW from https://www.mingw-w64.org/" -ForegroundColor Red
        Write-Host "  Or use MSYS2: https://www.msys2.org/" -ForegroundColor Red
    }
}

# Install Python
Write-Host ""
Write-Host "Checking Python..."
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pyVersion = python --version
    Write-Host "  Python already installed: $pyVersion" -ForegroundColor Green
} else {
    Write-Host "  Installing Python..." -ForegroundColor Yellow
    if ($hasWinget) {
        winget install --id Python.Python.3.11 -e --silent
    } elseif ($hasChoco) {
        choco install python -y
    } else {
        Write-Host "  Please install Python from https://python.org" -ForegroundColor Red
    }
}

# Install Python packages
Write-Host ""
Write-Host "Installing Python packages..."
python -m pip install --upgrade pip 2>$null
python -m pip install python-can 2>$null
Write-Host "  python-can installed" -ForegroundColor Green

# Install Git (if not present)
Write-Host ""
Write-Host "Checking Git..."
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = git --version
    Write-Host "  Git already installed: $gitVersion" -ForegroundColor Green
} else {
    Write-Host "  Installing Git..." -ForegroundColor Yellow
    if ($hasWinget) {
        winget install --id Git.Git -e --silent
    } elseif ($hasChoco) {
        choco install git -y
    }
}

# VS Code extensions
Write-Host ""
Write-Host "Checking VS Code..."
if (Get-Command code -ErrorAction SilentlyContinue) {
    Write-Host "  VS Code found. Installing recommended extensions..." -ForegroundColor Green
    code --install-extension ms-vscode.cpptools 2>$null
    code --install-extension ms-vscode.cmake-tools 2>$null
    code --install-extension ms-python.python 2>$null
    Write-Host "  Extensions installed" -ForegroundColor Green
} else {
    Write-Host "  VS Code not found in PATH" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "======================================"
Write-Host "  Setup Complete!"
Write-Host "======================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Open a new terminal (to refresh PATH)"
Write-Host "  2. cd pre-hw-dev"
Write-Host "  3. mkdir build; cd build"
Write-Host "  4. cmake -DBUILD_SIM=ON .."
Write-Host "  5. cmake --build ."
Write-Host "  6. .\jezgro_test.exe"
Write-Host ""
Write-Host "For swarm simulation:"
Write-Host "  python sim\swarm_simulator.py --virtual"
Write-Host ""
