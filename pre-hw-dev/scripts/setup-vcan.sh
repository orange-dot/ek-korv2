#!/bin/bash
# Setup virtual CAN interfaces for JEZGRO swarm simulation

set -e

NUM_INTERFACES=${1:-5}

echo "Setting up $NUM_INTERFACES virtual CAN interfaces..."

# Load vcan module
if ! lsmod | grep -q vcan; then
    echo "Loading vcan kernel module..."
    sudo modprobe vcan
fi

# Create interfaces
for i in $(seq 0 $((NUM_INTERFACES - 1))); do
    if ! ip link show vcan$i &> /dev/null; then
        echo "Creating vcan$i..."
        sudo ip link add dev vcan$i type vcan
        sudo ip link set up vcan$i
    else
        echo "vcan$i already exists"
    fi
done

echo ""
echo "Virtual CAN interfaces ready:"
ip -brief link show type vcan

echo ""
echo "To monitor CAN traffic:"
echo "  candump vcan0"
echo ""
echo "To send test message:"
echo "  cansend vcan0 123#DEADBEEF"
echo ""
