#!/bin/bash
# JEZGRO RTOS - Automated Test Runner for Renode
# Runs all kernel tests and validates output

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="/jezgro"
RENODE_CMD="renode --console --disable-xwt"
FIRMWARE="$PROJECT_DIR/build-arm/jezgro_firmware"
PLATFORM="$PROJECT_DIR/renode/stm32g474-minimal.repl"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

echo "=============================================="
echo "  JEZGRO RTOS - Automated Test Suite"
echo "=============================================="
echo ""

# Check firmware exists
if [ ! -f "$FIRMWARE" ]; then
    echo -e "${RED}ERROR: Firmware not found at $FIRMWARE${NC}"
    exit 1
fi

echo "Firmware: $FIRMWARE"
arm-none-eabi-size "$FIRMWARE"
echo ""

#-----------------------------------------------
# Test 1: Basic Boot Test
#-----------------------------------------------
run_test() {
    local test_name="$1"
    local test_duration="$2"
    local expected_pattern="$3"

    echo -n "[$test_name] Running... "

    # Run Renode and capture output
    local output
    output=$($RENODE_CMD -e "
        mach create
        machine LoadPlatformDescription @$PLATFORM
        sysbus LoadELF @$FIRMWARE
        start
        sleep $test_duration
        pause
        sysbus.usart1 DumpHistoryBuffer
        quit
    " 2>&1)

    # Check for expected pattern
    if echo "$output" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        echo "  Expected: $expected_pattern"
        echo "  Output (last 20 lines):"
        echo "$output" | grep -v "^\[" | grep -v "^$" | grep -v "Renode" | tail -20 | sed 's/^/    /'
        ((TESTS_FAILED++))
        return 1
    fi
}

#-----------------------------------------------
# Run Test Suite
#-----------------------------------------------

echo "Running tests..."
echo ""

# Test 1: Kernel boots and prints banner
run_test "Boot" 1 "JEZGRO RTOS v"

# Test 2: Scheduler initializes
run_test "Scheduler Init" 1 "Initializing scheduler"

# Test 3: Tasks are created
run_test "Task Creation" 1 "Creating task1"

# Test 4: SysTick starts
run_test "SysTick" 1 "Starting SysTick"

# Test 5: Tasks start running
run_test "Task Execution" 2 "\[T3\] Started"

# Test 6: Preemption works (T3 runs frequently)
run_test "Preemption" 3 "\[T3\] cnt=.*PREEMPT"

# Test 7: CAN initializes
run_test "CAN Init" 2 "CAN initialized"

# Test 8: CAN transmits
run_test "CAN TX" 3 "\[ROJ\] tx=[1-9]"

# Test 9: Semaphore producer works
run_test "Semaphore" 3 "produced="

#-----------------------------------------------
# Summary
#-----------------------------------------------
echo ""
echo "=============================================="
echo "  Test Results"
echo "=============================================="
echo -e "  Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
