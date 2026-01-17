*** Settings ***
Documentation     JEZGRO RTOS Test Suite for Renode
Suite Setup       Setup
Suite Teardown    Teardown
Test Setup        Reset Emulation
Test Teardown     Test Teardown
Resource          ${RENODEKEYWORDS}

*** Variables ***
${PLATFORM}       @${CURDIR}/../renode/stm32g474-minimal.repl
${FIRMWARE}       @${CURDIR}/../build-arm/jezgro_firmware
${UART}           sysbus.usart1

*** Keywords ***
Setup
    Setup Machine

Setup Machine
    Execute Command           mach create
    Execute Command           machine LoadPlatformDescription ${PLATFORM}
    Execute Command           sysbus LoadELF ${FIRMWARE}

*** Test Cases ***
Should Boot And Print Banner
    [Documentation]           Verify JEZGRO boots and prints version banner
    [Tags]                    boot
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     JEZGRO RTOS v    timeout=5

Should Initialize Scheduler
    [Documentation]           Verify scheduler initializes
    [Tags]                    scheduler
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     Initializing scheduler    timeout=5

Should Create Tasks
    [Documentation]           Verify tasks are created
    [Tags]                    tasks
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     Creating task1    timeout=5
    Wait For Line On Uart     Creating task2    timeout=2
    Wait For Line On Uart     Creating task3    timeout=2

Should Start SysTick
    [Documentation]           Verify SysTick timer starts
    [Tags]                    systick
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     Starting SysTick    timeout=5

Should Run Tasks With Preemption
    [Documentation]           Verify EDF preemption - T3 (50ms) preempts T1 (100ms)
    [Tags]                    preemption edf
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     [T3] Started    timeout=5
    Wait For Line On Uart     PREEMPT    timeout=5

Should Initialize CAN
    [Documentation]           Verify CAN-FD controller initializes
    [Tags]                    can
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     CAN initialized    timeout=5

Should Transmit CAN Messages
    [Documentation]           Verify CAN TX counter increases
    [Tags]                    can tx
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     [ROJ] tx=    timeout=10

Should Run Semaphore Producer
    [Documentation]           Verify semaphore producer creates items
    [Tags]                    semaphore sync
    Create Terminal Tester    ${UART}
    Start Emulation
    Wait For Line On Uart     produced=    timeout=5

Should Execute Many Instructions
    [Documentation]           Verify CPU executes significant number of instructions
    [Tags]                    cpu performance
    Start Emulation
    Execute Command           sleep 2
    ${instructions}=          Execute Command    cpu ExecutedInstructions
    Should Be True            ${instructions} > 10000    CPU should execute >10K instructions

Should Have Valid Stack Pointer
    [Documentation]           Verify stack pointer is in valid SRAM range
    [Tags]                    stack memory
    Start Emulation
    Execute Command           sleep 1
    ${sp}=                    Execute Command    cpu SP
    # SP should be in SRAM1 (0x20000000 - 0x20014000)
    Should Match Regexp       ${sp}    0x200[0-1][0-9a-fA-F]{4}
