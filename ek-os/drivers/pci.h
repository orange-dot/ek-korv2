/**
 * @file pci.h
 * @brief PCI Bus Enumeration and Configuration for EK-OS
 *
 * Provides PCI device discovery, BAR decoding, and MSI configuration
 * for finding and setting up the xHCI USB controller.
 */

#ifndef EK_OS_PCI_H
#define EK_OS_PCI_H

#include <stdint.h>

/* ============================================================================
 * PCI Configuration Space Access
 * ============================================================================ */

#define PCI_CONFIG_ADDR         0xCF8   /* Configuration Address Port */
#define PCI_CONFIG_DATA         0xCFC   /* Configuration Data Port */

/* Configuration address format:
 * Bit 31:    Enable bit
 * Bits 30-24: Reserved
 * Bits 23-16: Bus number
 * Bits 15-11: Device number
 * Bits 10-8:  Function number
 * Bits 7-0:   Register offset (must be 32-bit aligned)
 */
#define PCI_ADDR(bus, dev, func, reg) \
    (0x80000000 | ((bus) << 16) | ((dev) << 11) | ((func) << 8) | ((reg) & 0xFC))

/* ============================================================================
 * PCI Configuration Space Registers
 * ============================================================================ */

#define PCI_REG_VENDOR_ID       0x00    /* 16-bit Vendor ID */
#define PCI_REG_DEVICE_ID       0x02    /* 16-bit Device ID */
#define PCI_REG_COMMAND         0x04    /* 16-bit Command Register */
#define PCI_REG_STATUS          0x06    /* 16-bit Status Register */
#define PCI_REG_REVISION        0x08    /* 8-bit Revision ID */
#define PCI_REG_PROG_IF         0x09    /* 8-bit Programming Interface */
#define PCI_REG_SUBCLASS        0x0A    /* 8-bit Subclass Code */
#define PCI_REG_CLASS           0x0B    /* 8-bit Class Code */
#define PCI_REG_CACHE_LINE      0x0C    /* 8-bit Cache Line Size */
#define PCI_REG_LATENCY         0x0D    /* 8-bit Latency Timer */
#define PCI_REG_HEADER_TYPE     0x0E    /* 8-bit Header Type */
#define PCI_REG_BIST            0x0F    /* 8-bit BIST */
#define PCI_REG_BAR0            0x10    /* 32-bit BAR 0 */
#define PCI_REG_BAR1            0x14    /* 32-bit BAR 1 */
#define PCI_REG_BAR2            0x18    /* 32-bit BAR 2 */
#define PCI_REG_BAR3            0x1C    /* 32-bit BAR 3 */
#define PCI_REG_BAR4            0x20    /* 32-bit BAR 4 */
#define PCI_REG_BAR5            0x24    /* 32-bit BAR 5 */
#define PCI_REG_SUBSYS_VENDOR   0x2C    /* 16-bit Subsystem Vendor ID */
#define PCI_REG_SUBSYS_ID       0x2E    /* 16-bit Subsystem ID */
#define PCI_REG_CAP_PTR         0x34    /* 8-bit Capabilities Pointer */
#define PCI_REG_IRQ_LINE        0x3C    /* 8-bit Interrupt Line */
#define PCI_REG_IRQ_PIN         0x3D    /* 8-bit Interrupt Pin */

/* Command Register bits */
#define PCI_CMD_IO_SPACE        (1 << 0)    /* I/O Space Enable */
#define PCI_CMD_MEMORY_SPACE    (1 << 1)    /* Memory Space Enable */
#define PCI_CMD_BUS_MASTER      (1 << 2)    /* Bus Master Enable */
#define PCI_CMD_INT_DISABLE     (1 << 10)   /* Interrupt Disable */

/* Status Register bits */
#define PCI_STATUS_CAP_LIST     (1 << 4)    /* Capabilities List Present */

/* Header Type */
#define PCI_HEADER_TYPE_MASK    0x7F
#define PCI_HEADER_MULTIFUNCTION 0x80

/* BAR types */
#define PCI_BAR_TYPE_MASK       0x01
#define PCI_BAR_TYPE_MEM        0x00
#define PCI_BAR_TYPE_IO         0x01
#define PCI_BAR_MEM_TYPE_MASK   0x06
#define PCI_BAR_MEM_TYPE_32     0x00
#define PCI_BAR_MEM_TYPE_64     0x04
#define PCI_BAR_MEM_PREFETCH    0x08

/* ============================================================================
 * PCI Class Codes
 * ============================================================================ */

#define PCI_CLASS_SERIAL_BUS    0x0C    /* Serial Bus Controller */
#define PCI_SUBCLASS_USB        0x03    /* USB Controller */
#define PCI_PROGIF_UHCI         0x00    /* UHCI (USB 1.0) */
#define PCI_PROGIF_OHCI         0x10    /* OHCI (USB 1.1) */
#define PCI_PROGIF_EHCI         0x20    /* EHCI (USB 2.0) */
#define PCI_PROGIF_XHCI         0x30    /* xHCI (USB 3.0+) */

/* ============================================================================
 * PCI Capability IDs
 * ============================================================================ */

#define PCI_CAP_ID_MSI          0x05    /* Message Signaled Interrupts */
#define PCI_CAP_ID_MSIX         0x11    /* MSI-X */

/* MSI Capability Structure offsets (from capability pointer) */
#define PCI_MSI_MSG_CTRL        0x02    /* Message Control (16-bit) */
#define PCI_MSI_MSG_ADDR_LO     0x04    /* Message Address Low (32-bit) */
#define PCI_MSI_MSG_ADDR_HI     0x08    /* Message Address High (32-bit, 64-bit only) */
#define PCI_MSI_MSG_DATA        0x08    /* Message Data (16-bit, 32-bit addr) */
#define PCI_MSI_MSG_DATA_64     0x0C    /* Message Data (16-bit, 64-bit addr) */

/* MSI Message Control bits */
#define PCI_MSI_ENABLE          (1 << 0)
#define PCI_MSI_64BIT           (1 << 7)

/* ============================================================================
 * PCI Device Structure
 * ============================================================================ */

#define PCI_MAX_DEVICES         32

typedef struct pci_device {
    uint8_t  bus;
    uint8_t  device;
    uint8_t  function;
    uint16_t vendor_id;
    uint16_t device_id;
    uint8_t  class_code;
    uint8_t  subclass;
    uint8_t  prog_if;
    uint8_t  revision;
    uint8_t  header_type;
    uint8_t  irq_line;
    uint8_t  irq_pin;

    /* Base Address Registers (decoded physical addresses) */
    uint64_t bar[6];
    uint64_t bar_size[6];
    uint8_t  bar_type[6];       /* 0=MMIO, 1=I/O */

    /* Capability pointers (0 if not present) */
    uint8_t  msi_cap_offset;
    uint8_t  msix_cap_offset;

    /* MSI state */
    int      msi_enabled;
    uint8_t  msi_vector;
} pci_device_t;

/* Global device list */
extern pci_device_t pci_devices[PCI_MAX_DEVICES];
extern int pci_device_count;

/* ============================================================================
 * Functions
 * ============================================================================ */

/**
 * @brief Initialize PCI subsystem and enumerate all devices
 */
void pci_init(void);

/**
 * @brief Read 8-bit value from PCI configuration space
 */
uint8_t pci_read8(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset);

/**
 * @brief Read 16-bit value from PCI configuration space
 */
uint16_t pci_read16(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset);

/**
 * @brief Read 32-bit value from PCI configuration space
 */
uint32_t pci_read32(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset);

/**
 * @brief Write 8-bit value to PCI configuration space
 */
void pci_write8(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint8_t val);

/**
 * @brief Write 16-bit value to PCI configuration space
 */
void pci_write16(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint16_t val);

/**
 * @brief Write 32-bit value to PCI configuration space
 */
void pci_write32(uint8_t bus, uint8_t dev, uint8_t func, uint8_t offset, uint32_t val);

/**
 * @brief Find PCI device by class/subclass/progif
 * @return Pointer to device, or NULL if not found
 */
pci_device_t *pci_find_device(uint8_t class_code, uint8_t subclass, uint8_t prog_if);

/**
 * @brief Find PCI device by vendor and device ID
 * @return Pointer to device, or NULL if not found
 */
pci_device_t *pci_find_device_by_id(uint16_t vendor_id, uint16_t device_id);

/**
 * @brief Enable bus mastering for a device
 */
void pci_enable_bus_master(pci_device_t *dev);

/**
 * @brief Enable memory space access for a device
 */
void pci_enable_memory_space(pci_device_t *dev);

/**
 * @brief Enable MSI for a device
 * @param dev PCI device
 * @param vector Interrupt vector number
 * @return 0 on success, -1 if MSI not supported
 */
int pci_enable_msi(pci_device_t *dev, uint8_t vector);

/**
 * @brief Disable MSI for a device
 */
void pci_disable_msi(pci_device_t *dev);

/**
 * @brief Get device name string (for debugging)
 */
const char *pci_class_name(uint8_t class_code, uint8_t subclass);

#endif /* EK_OS_PCI_H */
