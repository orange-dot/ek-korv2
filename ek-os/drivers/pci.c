/**
 * @file pci.c
 * @brief PCI Bus Enumeration and Configuration for EK-OS
 */

#include "pci.h"
#include "../lib/io.h"
#include "serial.h"
#include <string.h>

/* ============================================================================
 * Global State
 * ============================================================================ */

pci_device_t pci_devices[PCI_MAX_DEVICES];
int pci_device_count = 0;

/* ============================================================================
 * Low-Level PCI Configuration Access
 * ============================================================================ */

uint32_t pci_read32(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset) {
    uint32_t addr = PCI_ADDR(bus, dev, func, offset);
    outl(PCI_CONFIG_ADDR, addr);
    return inl(PCI_CONFIG_DATA);
}

void pci_write32(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint32_t val) {
    uint32_t addr = PCI_ADDR(bus, dev, func, offset);
    outl(PCI_CONFIG_ADDR, addr);
    outl(PCI_CONFIG_DATA, val);
}

uint16_t pci_read16(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset) {
    uint32_t val = pci_read32(bus, dev, func, offset & ~3);
    return (val >> ((offset & 2) * 8)) & 0xFFFF;
}

void pci_write16(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint16_t val) {
    uint32_t addr = PCI_ADDR(bus, dev, func, offset & ~3);
    outl(PCI_CONFIG_ADDR, addr);
    uint32_t tmp = inl(PCI_CONFIG_DATA);
    int shift = (offset & 2) * 8;
    tmp = (tmp & ~(0xFFFF << shift)) | ((uint32_t)val << shift);
    outl(PCI_CONFIG_DATA, tmp);
}

uint8_t pci_read8(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset) {
    uint32_t val = pci_read32(bus, dev, func, offset & ~3);
    return (val >> ((offset & 3) * 8)) & 0xFF;
}

void pci_write8(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint8_t val) {
    uint32_t addr = PCI_ADDR(bus, dev, func, offset & ~3);
    outl(PCI_CONFIG_ADDR, addr);
    uint32_t tmp = inl(PCI_CONFIG_DATA);
    int shift = (offset & 3) * 8;
    tmp = (tmp & ~(0xFF << shift)) | ((uint32_t)val << shift);
    outl(PCI_CONFIG_DATA, tmp);
}

/* ============================================================================
 * BAR Decoding
 * ============================================================================ */

static void pci_decode_bar(pci_device_t *dev, int bar_index) {
    uint8_t reg = PCI_REG_BAR0 + bar_index * 4;
    uint32_t bar_lo = pci_read32(dev->bus, dev->device, dev->function, reg);

    if (bar_lo == 0) {
        dev->bar[bar_index] = 0;
        dev->bar_size[bar_index] = 0;
        return;
    }

    /* Check BAR type */
    if (bar_lo & PCI_BAR_TYPE_IO) {
        /* I/O BAR */
        dev->bar_type[bar_index] = 1;
        dev->bar[bar_index] = bar_lo & ~0x3;

        /* Get size by writing all 1s and reading back */
        pci_write32(dev->bus, dev->device, dev->function, reg, 0xFFFFFFFF);
        uint32_t size = pci_read32(dev->bus, dev->device, dev->function, reg);
        pci_write32(dev->bus, dev->device, dev->function, reg, bar_lo);

        size = ~(size & ~0x3) + 1;
        dev->bar_size[bar_index] = size & 0xFFFF;
    } else {
        /* Memory BAR */
        dev->bar_type[bar_index] = 0;
        uint64_t addr = bar_lo & ~0xF;

        int is_64bit = ((bar_lo & PCI_BAR_MEM_TYPE_MASK) == PCI_BAR_MEM_TYPE_64);

        if (is_64bit && bar_index < 5) {
            /* 64-bit BAR - read high 32 bits */
            uint32_t bar_hi = pci_read32(dev->bus, dev->device, dev->function, reg + 4);
            addr |= ((uint64_t)bar_hi << 32);

            /* Get size */
            pci_write32(dev->bus, dev->device, dev->function, reg, 0xFFFFFFFF);
            pci_write32(dev->bus, dev->device, dev->function, reg + 4, 0xFFFFFFFF);
            uint32_t size_lo = pci_read32(dev->bus, dev->device, dev->function, reg);
            uint32_t size_hi = pci_read32(dev->bus, dev->device, dev->function, reg + 4);
            pci_write32(dev->bus, dev->device, dev->function, reg, bar_lo);
            pci_write32(dev->bus, dev->device, dev->function, reg + 4, bar_hi);

            uint64_t size = ((uint64_t)size_hi << 32) | (size_lo & ~0xF);
            dev->bar_size[bar_index] = ~size + 1;

            /* Mark next BAR as used (64-bit BAR consumes two slots) */
            dev->bar[bar_index + 1] = 0;
            dev->bar_size[bar_index + 1] = 0;
        } else {
            /* 32-bit BAR */
            pci_write32(dev->bus, dev->device, dev->function, reg, 0xFFFFFFFF);
            uint32_t size = pci_read32(dev->bus, dev->device, dev->function, reg);
            pci_write32(dev->bus, dev->device, dev->function, reg, bar_lo);

            size = ~(size & ~0xF) + 1;
            dev->bar_size[bar_index] = size;
        }

        dev->bar[bar_index] = addr;
    }
}

/* ============================================================================
 * Capability Parsing
 * ============================================================================ */

static void pci_find_capabilities(pci_device_t *dev) {
    uint16_t status = pci_read16(dev->bus, dev->device, dev->function, PCI_REG_STATUS);

    if (!(status & PCI_STATUS_CAP_LIST)) {
        return;  /* No capabilities */
    }

    uint8_t cap_ptr = pci_read8(dev->bus, dev->device, dev->function, PCI_REG_CAP_PTR);
    cap_ptr &= ~0x3;  /* Must be DWORD aligned */

    while (cap_ptr != 0) {
        uint8_t cap_id = pci_read8(dev->bus, dev->device, dev->function, cap_ptr);
        uint8_t next = pci_read8(dev->bus, dev->device, dev->function, cap_ptr + 1);

        switch (cap_id) {
            case PCI_CAP_ID_MSI:
                dev->msi_cap_offset = cap_ptr;
                break;
            case PCI_CAP_ID_MSIX:
                dev->msix_cap_offset = cap_ptr;
                break;
        }

        cap_ptr = next & ~0x3;
    }
}

/* ============================================================================
 * Device Enumeration
 * ============================================================================ */

static void pci_enumerate_function(uint8_t bus, uint8_t dev, uint8_t func) {
    uint32_t id = pci_read32(bus, dev, func, PCI_REG_VENDOR_ID);
    uint16_t vendor_id = id & 0xFFFF;
    uint16_t device_id = (id >> 16) & 0xFFFF;

    if (vendor_id == 0xFFFF || vendor_id == 0x0000) {
        return;  /* No device */
    }

    if (pci_device_count >= PCI_MAX_DEVICES) {
        serial_printf("[PCI] Warning: device list full\n");
        return;
    }

    pci_device_t *pdev = &pci_devices[pci_device_count++];
    memset(pdev, 0, sizeof(*pdev));

    pdev->bus = bus;
    pdev->device = dev;
    pdev->function = func;
    pdev->vendor_id = vendor_id;
    pdev->device_id = device_id;

    uint32_t class_reg = pci_read32(bus, dev, func, PCI_REG_REVISION);
    pdev->revision = class_reg & 0xFF;
    pdev->prog_if = (class_reg >> 8) & 0xFF;
    pdev->subclass = (class_reg >> 16) & 0xFF;
    pdev->class_code = (class_reg >> 24) & 0xFF;

    pdev->header_type = pci_read8(bus, dev, func, PCI_REG_HEADER_TYPE) & PCI_HEADER_TYPE_MASK;
    pdev->irq_line = pci_read8(bus, dev, func, PCI_REG_IRQ_LINE);
    pdev->irq_pin = pci_read8(bus, dev, func, PCI_REG_IRQ_PIN);

    /* Decode BARs (only for type 0 headers) */
    if (pdev->header_type == 0) {
        for (int i = 0; i < 6; i++) {
            pci_decode_bar(pdev, i);
            /* Skip next BAR if this was 64-bit */
            if (pdev->bar_type[i] == 0 && pdev->bar_size[i] > 0) {
                uint32_t bar = pci_read32(bus, dev, func, PCI_REG_BAR0 + i * 4);
                if ((bar & PCI_BAR_MEM_TYPE_MASK) == PCI_BAR_MEM_TYPE_64) {
                    i++;
                }
            }
        }
    }

    /* Find capabilities */
    pci_find_capabilities(pdev);

    serial_printf("[PCI] %02x:%02x.%d %04x:%04x class=%02x/%02x/%02x",
                  bus, dev, func, vendor_id, device_id,
                  pdev->class_code, pdev->subclass, pdev->prog_if);

    if (pdev->bar[0]) {
        serial_printf(" BAR0=0x%lx", pdev->bar[0]);
    }
    if (pdev->msi_cap_offset) {
        serial_printf(" MSI");
    }
    serial_printf("\n");
}

static void pci_enumerate_device(uint8_t bus, uint8_t dev) {
    uint32_t id = pci_read32(bus, dev, 0, PCI_REG_VENDOR_ID);
    if ((id & 0xFFFF) == 0xFFFF) {
        return;  /* No device */
    }

    pci_enumerate_function(bus, dev, 0);

    /* Check for multi-function device */
    uint8_t header = pci_read8(bus, dev, 0, PCI_REG_HEADER_TYPE);
    if (header & PCI_HEADER_MULTIFUNCTION) {
        for (uint8_t func = 1; func < 8; func++) {
            id = pci_read32(bus, dev, func, PCI_REG_VENDOR_ID);
            if ((id & 0xFFFF) != 0xFFFF) {
                pci_enumerate_function(bus, dev, func);
            }
        }
    }
}

static void pci_enumerate_bus(uint8_t bus) {
    for (uint8_t dev = 0; dev < 32; dev++) {
        pci_enumerate_device(bus, dev);
    }
}

void pci_init(void) {
    serial_printf("[PCI] Enumerating PCI bus...\n");
    pci_device_count = 0;

    /* Enumerate bus 0 (and any bridges we find) */
    pci_enumerate_bus(0);

    /* Check for additional buses via host bridge */
    uint8_t header = pci_read8(0, 0, 0, PCI_REG_HEADER_TYPE);
    if (header & PCI_HEADER_MULTIFUNCTION) {
        for (uint8_t func = 1; func < 8; func++) {
            uint32_t id = pci_read32(0, 0, func, PCI_REG_VENDOR_ID);
            if ((id & 0xFFFF) != 0xFFFF) {
                pci_enumerate_bus(func);
            }
        }
    }

    serial_printf("[PCI] Found %d devices\n", pci_device_count);
}

/* ============================================================================
 * Device Lookup
 * ============================================================================ */

pci_device_t *pci_find_device(uint8_t class_code, uint8_t subclass, uint8_t prog_if) {
    for (int i = 0; i < pci_device_count; i++) {
        pci_device_t *dev = &pci_devices[i];
        if (dev->class_code == class_code &&
            dev->subclass == subclass &&
            dev->prog_if == prog_if) {
            return dev;
        }
    }
    return NULL;
}

pci_device_t *pci_find_device_by_id(uint16_t vendor_id, uint16_t device_id) {
    for (int i = 0; i < pci_device_count; i++) {
        pci_device_t *dev = &pci_devices[i];
        if (dev->vendor_id == vendor_id && dev->device_id == device_id) {
            return dev;
        }
    }
    return NULL;
}

/* ============================================================================
 * Device Configuration
 * ============================================================================ */

void pci_enable_bus_master(pci_device_t *dev) {
    uint16_t cmd = pci_read16(dev->bus, dev->device, dev->function, PCI_REG_COMMAND);
    cmd |= PCI_CMD_BUS_MASTER;
    pci_write16(dev->bus, dev->device, dev->function, PCI_REG_COMMAND, cmd);
}

void pci_enable_memory_space(pci_device_t *dev) {
    uint16_t cmd = pci_read16(dev->bus, dev->device, dev->function, PCI_REG_COMMAND);
    cmd |= PCI_CMD_MEMORY_SPACE;
    pci_write16(dev->bus, dev->device, dev->function, PCI_REG_COMMAND, cmd);
}

int pci_enable_msi(pci_device_t *dev, uint8_t vector) {
    if (dev->msi_cap_offset == 0) {
        return -1;  /* MSI not supported */
    }

    uint8_t cap = dev->msi_cap_offset;
    uint16_t msg_ctrl = pci_read16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_CTRL);

    /* Disable MSI first */
    msg_ctrl &= ~PCI_MSI_ENABLE;
    pci_write16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_CTRL, msg_ctrl);

    /* Set message address (local APIC address for CPU 0) */
    uint32_t msg_addr = 0xFEE00000;  /* Local APIC base */
    pci_write32(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_ADDR_LO, msg_addr);

    /* Set message data (vector number) */
    uint16_t msg_data = vector;
    if (msg_ctrl & PCI_MSI_64BIT) {
        pci_write32(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_ADDR_HI, 0);
        pci_write16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_DATA_64, msg_data);
    } else {
        pci_write16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_DATA, msg_data);
    }

    /* Enable MSI */
    msg_ctrl |= PCI_MSI_ENABLE;
    pci_write16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_CTRL, msg_ctrl);

    dev->msi_enabled = 1;
    dev->msi_vector = vector;

    serial_printf("[PCI] MSI enabled for %02x:%02x.%d vector %d\n",
                  dev->bus, dev->device, dev->function, vector);

    return 0;
}

void pci_disable_msi(pci_device_t *dev) {
    if (dev->msi_cap_offset == 0 || !dev->msi_enabled) {
        return;
    }

    uint8_t cap = dev->msi_cap_offset;
    uint16_t msg_ctrl = pci_read16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_CTRL);
    msg_ctrl &= ~PCI_MSI_ENABLE;
    pci_write16(dev->bus, dev->device, dev->function, cap + PCI_MSI_MSG_CTRL, msg_ctrl);

    dev->msi_enabled = 0;
}

/* ============================================================================
 * Debug Helpers
 * ============================================================================ */

const char *pci_class_name(uint8_t class_code, uint8_t subclass) {
    if (class_code == PCI_CLASS_SERIAL_BUS && subclass == PCI_SUBCLASS_USB) {
        return "USB Controller";
    }
    return "Unknown";
}
