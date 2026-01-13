# EK-OS Makefile
# Bare-metal x86_64 OS based on EK-KOR distributed RTOS

# Toolchain - use system GCC in freestanding mode
# On Windows with MSYS2/MinGW, use x86_64-w64-mingw32-gcc
# For cross-compilation, use x86_64-elf-gcc
CC = gcc
LD = ld
AS = as
OBJCOPY = objcopy

# Detect platform
ifeq ($(OS),Windows_NT)
    # Windows - use available GCC (should produce PE/COFF format)
    CC = gcc
    LD = ld
    AS = as
    OBJCOPY = objcopy
    MKDIR = mkdir
    RM = del /Q
    RMDIR = rmdir /S /Q
    PATHSEP = \\
else
    CC = x86_64-elf-gcc
    LD = x86_64-elf-ld
    AS = x86_64-elf-as
    OBJCOPY = x86_64-elf-objcopy
    MKDIR = mkdir -p
    RM = rm -f
    RMDIR = rm -rf
    PATHSEP = /
endif

# Compiler flags for UEFI application
# Use small memory model (default) for proper PE addresses
CFLAGS = -ffreestanding \
         -fno-stack-protector \
         -fno-stack-check \
         -mno-stack-arg-probe \
         -fno-pic \
         -mno-red-zone \
         -mno-mmx \
         -mno-sse \
         -mno-sse2 \
         -Wall \
         -Wextra \
         -O2

# For UEFI entry point
CFLAGS_UEFI = $(CFLAGS) -DEFI_FUNCTION_WRAPPER

# Assembler flags
ASFLAGS = --64

# Linker flags
# --image-base=0 allows sections to start at low addresses for EFI
# Subsystem will be patched to EFI_APPLICATION (10) after linking
LDFLAGS = -nostdlib -T linker.ld --image-base=0

# Directories
BOOT_DIR = boot
KERNEL_DIR = kernel
DRIVERS_DIR = drivers
LIB_DIR = lib
# EK-KOR library from ek-kor2 (sibling directory)
EKK_DIR = ../ek-kor2/c
BUILD_DIR = build
ESP_DIR = esp

# Include paths
# -I$(LIB_DIR) allows EK-KOR sources to find our freestanding string.h
INCLUDES = -I. -I$(EKK_DIR)/include -I$(LIB_DIR)

# Source files
BOOT_SRC = $(BOOT_DIR)/uefi_entry.c
KERNEL_SRC = $(KERNEL_DIR)/main.c \
             $(KERNEL_DIR)/gdt.c \
             $(KERNEL_DIR)/idt.c \
             $(KERNEL_DIR)/ekk_serial.c
KERNEL_ASM = $(KERNEL_DIR)/interrupts.S
DRIVERS_SRC = $(DRIVERS_DIR)/serial.c \
              $(DRIVERS_DIR)/vga.c \
              $(DRIVERS_DIR)/keyboard.c \
              $(DRIVERS_DIR)/fb.c \
              $(DRIVERS_DIR)/font.c \
              $(DRIVERS_DIR)/gfx.c \
              $(DRIVERS_DIR)/pci.c \
              $(DRIVERS_DIR)/xhci.c \
              $(DRIVERS_DIR)/usb.c \
              $(DRIVERS_DIR)/usb_hid.c
LIB_SRC = $(LIB_DIR)/string.c
# EK-KOR library sources (including x86 HAL)
EKK_SRC = $(EKK_DIR)/src/ekk_init.c \
          $(EKK_DIR)/src/ekk_types.c \
          $(EKK_DIR)/src/ekk_field.c \
          $(EKK_DIR)/src/ekk_module.c \
          $(EKK_DIR)/src/ekk_topology.c \
          $(EKK_DIR)/src/ekk_heartbeat.c \
          $(EKK_DIR)/src/ekk_consensus.c \
          $(EKK_DIR)/src/ekk_spsc.c \
          $(EKK_DIR)/src/ekk_auth.c \
          $(EKK_DIR)/src/hal/ekk_hal_x86.c

ALL_C_SRC = $(BOOT_SRC) $(KERNEL_SRC) $(DRIVERS_SRC) $(LIB_SRC) $(EKK_SRC)
ALL_ASM_SRC = $(KERNEL_ASM)

# Object files
BOOT_OBJ = $(BUILD_DIR)/uefi_entry.o
KERNEL_OBJ = $(BUILD_DIR)/main.o \
             $(BUILD_DIR)/gdt.o \
             $(BUILD_DIR)/idt.o \
             $(BUILD_DIR)/ekk_serial.o \
             $(BUILD_DIR)/interrupts.o
DRIVERS_OBJ = $(BUILD_DIR)/serial.o \
              $(BUILD_DIR)/vga.o \
              $(BUILD_DIR)/keyboard.o \
              $(BUILD_DIR)/fb.o \
              $(BUILD_DIR)/font.o \
              $(BUILD_DIR)/gfx.o \
              $(BUILD_DIR)/pci.o \
              $(BUILD_DIR)/xhci.o \
              $(BUILD_DIR)/usb.o \
              $(BUILD_DIR)/usb_hid.o
LIB_OBJ = $(BUILD_DIR)/string.o
EKK_OBJ = $(BUILD_DIR)/ekk_init.o \
          $(BUILD_DIR)/ekk_types.o \
          $(BUILD_DIR)/ekk_field.o \
          $(BUILD_DIR)/ekk_module.o \
          $(BUILD_DIR)/ekk_topology.o \
          $(BUILD_DIR)/ekk_heartbeat.o \
          $(BUILD_DIR)/ekk_consensus.o \
          $(BUILD_DIR)/ekk_spsc.o \
          $(BUILD_DIR)/ekk_auth.o \
          $(BUILD_DIR)/ekk_hal_x86.o

ALL_OBJ = $(BOOT_OBJ) $(KERNEL_OBJ) $(DRIVERS_OBJ) $(LIB_OBJ) $(EKK_OBJ)

# Output files
ELF_FILE = $(BUILD_DIR)/EK-OS.elf
EFI_FILE = $(BUILD_DIR)/BOOTX64.EFI

# Default target
all: $(EFI_FILE)

# Create build directory
$(BUILD_DIR):
	$(MKDIR) $(BUILD_DIR)

# Compile boot files
$(BUILD_DIR)/uefi_entry.o: $(BOOT_DIR)/uefi_entry.c | $(BUILD_DIR)
	$(CC) $(CFLAGS_UEFI) $(INCLUDES) -c -o $@ $<

# Compile kernel files
$(BUILD_DIR)/main.o: $(KERNEL_DIR)/main.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/gdt.o: $(KERNEL_DIR)/gdt.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/idt.o: $(KERNEL_DIR)/idt.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_serial.o: $(KERNEL_DIR)/ekk_serial.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/interrupts.o: $(KERNEL_DIR)/interrupts.S | $(BUILD_DIR)
	$(CC) $(CFLAGS) -c -o $@ $<

# Compile driver files
$(BUILD_DIR)/serial.o: $(DRIVERS_DIR)/serial.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/vga.o: $(DRIVERS_DIR)/vga.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/keyboard.o: $(DRIVERS_DIR)/keyboard.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/fb.o: $(DRIVERS_DIR)/fb.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/font.o: $(DRIVERS_DIR)/font.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/gfx.o: $(DRIVERS_DIR)/gfx.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/pci.o: $(DRIVERS_DIR)/pci.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/xhci.o: $(DRIVERS_DIR)/xhci.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/usb.o: $(DRIVERS_DIR)/usb.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/usb_hid.o: $(DRIVERS_DIR)/usb_hid.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

# Compile library files
$(BUILD_DIR)/string.o: $(LIB_DIR)/string.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

# Compile EK-KOR library files (from ek-kor2)
$(BUILD_DIR)/ekk_init.o: $(EKK_DIR)/src/ekk_init.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_types.o: $(EKK_DIR)/src/ekk_types.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_field.o: $(EKK_DIR)/src/ekk_field.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_module.o: $(EKK_DIR)/src/ekk_module.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_topology.o: $(EKK_DIR)/src/ekk_topology.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_heartbeat.o: $(EKK_DIR)/src/ekk_heartbeat.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_consensus.o: $(EKK_DIR)/src/ekk_consensus.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_spsc.o: $(EKK_DIR)/src/ekk_spsc.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_auth.o: $(EKK_DIR)/src/ekk_auth.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

$(BUILD_DIR)/ekk_hal_x86.o: $(EKK_DIR)/src/hal/ekk_hal_x86.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) $(INCLUDES) -c -o $@ $<

# Link ELF
$(ELF_FILE): $(ALL_OBJ) linker.ld
	$(LD) $(LDFLAGS) -o $@ $(ALL_OBJ)

# For PE output, just copy the linked file (it's already PE format)
$(EFI_FILE): $(ELF_FILE)
	cp $< $@

# Create bootable ESP directory
# Uses Python script to patch PE subsystem from Windows Console (3) to EFI Application (10)
esp: $(EFI_FILE)
	$(MKDIR) $(ESP_DIR)$(PATHSEP)EFI$(PATHSEP)BOOT
ifeq ($(OS),Windows_NT)
	python patch-efi.py
else
	python3 patch-efi.py
endif

# Run in QEMU (requires OVMF)
run: esp
	qemu-system-x86_64 \
		-bios /usr/share/ovmf/OVMF.fd \
		-drive format=raw,file=fat:rw:$(ESP_DIR) \
		-serial stdio \
		-smp 4 \
		-m 128M \
		-no-reboot \
		-d int,cpu_reset

# Run with debug output
debug: esp
	qemu-system-x86_64 \
		-bios /usr/share/ovmf/OVMF.fd \
		-drive format=raw,file=fat:rw:$(ESP_DIR) \
		-serial stdio \
		-smp 4 \
		-m 128M \
		-no-reboot \
		-d int,cpu_reset \
		-S -s

# Clean build artifacts
clean:
ifeq ($(OS),Windows_NT)
	-$(RMDIR) $(BUILD_DIR) 2>nul
	-$(RMDIR) $(ESP_DIR) 2>nul
else
	$(RM) $(BUILD_DIR)/*
	$(RMDIR) $(BUILD_DIR)
	$(RMDIR) $(ESP_DIR)
endif

# Print info
info:
	@echo "EK-OS Build System"
	@echo "=================="
	@echo "CC      = $(CC)"
	@echo "LD      = $(LD)"
	@echo "CFLAGS  = $(CFLAGS)"
	@echo "EKK_DIR = $(EKK_DIR)"
	@echo "Sources = $(ALL_C_SRC)"
	@echo "Objects = $(ALL_OBJ)"

.PHONY: all esp run debug clean info
