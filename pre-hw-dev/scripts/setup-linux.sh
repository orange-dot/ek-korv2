#!/bin/bash
# JEZGRO Development Environment Setup - Linux

set -e

echo "======================================"
echo "  JEZGRO Development Setup (Linux)"
echo "======================================"
echo ""

# Detect package manager
if command -v apt-get &> /dev/null; then
    PKG_MGR="apt"
    PKG_INSTALL="sudo apt-get install -y"
    PKG_UPDATE="sudo apt-get update"
elif command -v dnf &> /dev/null; then
    PKG_MGR="dnf"
    PKG_INSTALL="sudo dnf install -y"
    PKG_UPDATE="sudo dnf check-update || true"
elif command -v pacman &> /dev/null; then
    PKG_MGR="pacman"
    PKG_INSTALL="sudo pacman -S --noconfirm"
    PKG_UPDATE="sudo pacman -Sy"
else
    echo "Unsupported package manager. Please install dependencies manually."
    exit 1
fi

echo "Detected package manager: $PKG_MGR"
echo ""

# Update package list
echo "Updating package list..."
$PKG_UPDATE
echo ""

# Install build tools
echo "Installing build tools..."
case $PKG_MGR in
    apt)
        $PKG_INSTALL build-essential cmake git
        ;;
    dnf)
        $PKG_INSTALL gcc gcc-c++ make cmake git
        ;;
    pacman)
        $PKG_INSTALL base-devel cmake git
        ;;
esac
echo ""

# Install Python
echo "Installing Python..."
case $PKG_MGR in
    apt)
        $PKG_INSTALL python3 python3-pip python3-venv
        ;;
    dnf)
        $PKG_INSTALL python3 python3-pip
        ;;
    pacman)
        $PKG_INSTALL python python-pip
        ;;
esac
echo ""

# Install CAN utilities (for vcan support)
echo "Installing CAN utilities..."
case $PKG_MGR in
    apt)
        $PKG_INSTALL can-utils iproute2
        ;;
    dnf)
        $PKG_INSTALL can-utils iproute
        ;;
    pacman)
        $PKG_INSTALL can-utils iproute2
        ;;
esac
echo ""

# Install Python packages
echo "Installing Python packages..."
pip3 install --user python-can
echo ""

# Install Renode (optional)
echo "Would you like to install Renode? (y/n)"
read -r install_renode
if [[ $install_renode == "y" || $install_renode == "Y" ]]; then
    echo "Installing Renode..."
    case $PKG_MGR in
        apt)
            wget https://github.com/renode/renode/releases/download/v1.14.0/renode_1.14.0_amd64.deb
            sudo dpkg -i renode_1.14.0_amd64.deb || sudo apt-get install -f -y
            rm renode_1.14.0_amd64.deb
            ;;
        *)
            echo "Please install Renode manually from https://renode.io"
            ;;
    esac
fi
echo ""

# Setup vcan
echo "Setting up virtual CAN..."
sudo modprobe vcan 2>/dev/null || echo "vcan module not available (may need kernel support)"
echo ""

# Summary
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. cd pre-hw-dev"
echo "  2. mkdir build && cd build"
echo "  3. cmake -DBUILD_SIM=ON .."
echo "  4. make -j\$(nproc)"
echo "  5. ./jezgro_test"
echo ""
echo "For swarm simulation with virtual CAN:"
echo "  sudo ./scripts/setup-vcan.sh"
echo "  python3 sim/swarm_simulator.py"
echo ""
echo "For swarm simulation without vcan:"
echo "  python3 sim/swarm_simulator.py --virtual"
echo ""
