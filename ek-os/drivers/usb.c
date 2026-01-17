/**
 * @file usb.c
 * @brief USB Core for EK-OS
 */

#include "usb.h"
#include "xhci.h"
#include "serial.h"
#include <string.h>

/* ============================================================================
 * Global State
 * ============================================================================ */

static usb_device_t usb_device_pool[USB_MAX_DEVICES];
usb_device_t *usb_devices = NULL;
int usb_device_count = 0;

/* Temporary buffer for descriptors */
static uint8_t desc_buffer[256] __attribute__((aligned(64)));

/* ============================================================================
 * Device Allocation
 * ============================================================================ */

static usb_device_t *usb_alloc_device(void) {
    if (usb_device_count >= USB_MAX_DEVICES) {
        return NULL;
    }

    usb_device_t *dev = &usb_device_pool[usb_device_count++];
    memset(dev, 0, sizeof(*dev));

    /* Add to linked list */
    dev->next = usb_devices;
    usb_devices = dev;

    return dev;
}

/* ============================================================================
 * Control Transfers
 * ============================================================================ */

int usb_control_msg(usb_device_t *dev,
                    uint8_t request_type, uint8_t request,
                    uint16_t value, uint16_t index,
                    void *data, uint16_t length) {
    return xhci_control_transfer(dev->slot_id,
                                 request_type, request,
                                 value, index,
                                 data, length);
}

int usb_get_device_descriptor(usb_device_t *dev, usb_device_desc_t *desc) {
    return usb_control_msg(dev,
                           USB_DIR_IN | USB_TYPE_STANDARD | USB_RECIP_DEVICE,
                           USB_REQ_GET_DESCRIPTOR,
                           (USB_DESC_DEVICE << 8) | 0,
                           0,
                           desc, sizeof(usb_device_desc_t));
}

int usb_get_config_descriptor(usb_device_t *dev, uint8_t index,
                              void *buffer, uint16_t length) {
    return usb_control_msg(dev,
                           USB_DIR_IN | USB_TYPE_STANDARD | USB_RECIP_DEVICE,
                           USB_REQ_GET_DESCRIPTOR,
                           (USB_DESC_CONFIGURATION << 8) | index,
                           0,
                           buffer, length);
}

int usb_set_configuration(usb_device_t *dev, uint8_t config) {
    int ret = usb_control_msg(dev,
                              USB_DIR_OUT | USB_TYPE_STANDARD | USB_RECIP_DEVICE,
                              USB_REQ_SET_CONFIGURATION,
                              config,
                              0,
                              NULL, 0);
    if (ret == 0) {
        dev->config_value = config;
        dev->configured = 1;
    }
    return ret;
}

/* ============================================================================
 * Descriptor Parsing
 * ============================================================================ */

static void usb_parse_config_descriptor(usb_device_t *dev,
                                        const uint8_t *data, uint16_t length) {
    const uint8_t *end = data + length;
    const uint8_t *ptr = data;

    usb_interface_t *current_iface = NULL;

    while (ptr < end && ptr[0] > 0) {
        uint8_t desc_len = ptr[0];
        uint8_t desc_type = ptr[1];

        if (ptr + desc_len > end) break;

        switch (desc_type) {
            case USB_DESC_INTERFACE: {
                const usb_interface_desc_t *iface =
                    (const usb_interface_desc_t *)ptr;

                if (dev->num_interfaces < USB_MAX_INTERFACES) {
                    current_iface = &dev->interfaces[dev->num_interfaces];
                    dev->num_interfaces++;

                    current_iface->number = iface->bInterfaceNumber;
                    current_iface->alt_setting = iface->bAlternateSetting;
                    current_iface->class_code = iface->bInterfaceClass;
                    current_iface->subclass = iface->bInterfaceSubClass;
                    current_iface->protocol = iface->bInterfaceProtocol;
                    current_iface->num_endpoints = 0;

                    serial_printf("[USB]   Interface %d: class=%02x/%02x/%02x\n",
                                  iface->bInterfaceNumber,
                                  iface->bInterfaceClass,
                                  iface->bInterfaceSubClass,
                                  iface->bInterfaceProtocol);
                }
                break;
            }

            case USB_DESC_ENDPOINT: {
                const usb_endpoint_desc_t *ep =
                    (const usb_endpoint_desc_t *)ptr;

                if (current_iface &&
                    current_iface->num_endpoints < USB_MAX_ENDPOINTS) {
                    usb_endpoint_t *endpoint =
                        &current_iface->endpoints[current_iface->num_endpoints];
                    current_iface->num_endpoints++;

                    endpoint->address = ep->bEndpointAddress;
                    endpoint->type = ep->bmAttributes & USB_EP_TYPE_MASK;
                    endpoint->max_packet_size = ep->wMaxPacketSize;
                    endpoint->interval = ep->bInterval;

                    serial_printf("[USB]     EP 0x%02x: type=%d, maxpkt=%d, interval=%d\n",
                                  ep->bEndpointAddress,
                                  endpoint->type,
                                  endpoint->max_packet_size,
                                  endpoint->interval);
                }
                break;
            }

            case USB_DESC_HID: {
                serial_printf("[USB]     HID descriptor found\n");
                break;
            }
        }

        ptr += desc_len;
    }
}

/* ============================================================================
 * Device Enumeration
 * ============================================================================ */

usb_device_t *usb_enumerate_device(uint8_t port) {
    serial_printf("[USB] Enumerating device on port %d\n", port);

    /* Reset port */
    if (xhci_port_reset(port) < 0) {
        serial_printf("[USB] Port reset failed\n");
        return NULL;
    }

    uint8_t speed = xhci_port_speed(port);

    /* Enable slot */
    uint8_t slot_id;
    if (xhci_enable_slot(&slot_id) < 0) {
        serial_printf("[USB] Failed to enable slot\n");
        return NULL;
    }

    /* Address device */
    if (xhci_address_device(slot_id, port, speed) < 0) {
        serial_printf("[USB] Failed to address device\n");
        xhci_disable_slot(slot_id);
        return NULL;
    }

    /* Give device time to settle after addressing */
    for (volatile int i = 0; i < 100000; i++) { }

    /* Allocate device structure */
    usb_device_t *dev = usb_alloc_device();
    if (!dev) {
        serial_printf("[USB] Failed to allocate device\n");
        xhci_disable_slot(slot_id);
        return NULL;
    }

    dev->slot_id = slot_id;
    dev->port = port;
    dev->speed = speed;

    /* Get device descriptor (first 8 bytes to get max packet size) */
    usb_device_desc_t *desc = (usb_device_desc_t *)desc_buffer;
    if (usb_control_msg(dev,
                        USB_DIR_IN | USB_TYPE_STANDARD | USB_RECIP_DEVICE,
                        USB_REQ_GET_DESCRIPTOR,
                        (USB_DESC_DEVICE << 8) | 0,
                        0,
                        desc, 8) < 0) {
        serial_printf("[USB] Failed to get device descriptor (8)\n");
        return NULL;
    }

    dev->max_packet_size0 = desc->bMaxPacketSize0;

    /* Get full device descriptor */
    if (usb_get_device_descriptor(dev, desc) < 0) {
        serial_printf("[USB] Failed to get full device descriptor\n");
        return NULL;
    }

    dev->vendor_id = desc->idVendor;
    dev->product_id = desc->idProduct;
    dev->device_class = desc->bDeviceClass;
    dev->device_subclass = desc->bDeviceSubClass;
    dev->device_protocol = desc->bDeviceProtocol;

    serial_printf("[USB] Device: VID=%04x PID=%04x class=%02x/%02x/%02x\n",
                  dev->vendor_id, dev->product_id,
                  dev->device_class, dev->device_subclass, dev->device_protocol);

    /* Get configuration descriptor (header first) */
    usb_config_desc_t *config = (usb_config_desc_t *)desc_buffer;
    if (usb_get_config_descriptor(dev, 0, config, sizeof(usb_config_desc_t)) < 0) {
        serial_printf("[USB] Failed to get config descriptor header\n");
        return NULL;
    }

    uint16_t total_len = config->wTotalLength;
    if (total_len > sizeof(desc_buffer)) {
        total_len = sizeof(desc_buffer);
    }

    /* Get full configuration descriptor */
    if (usb_get_config_descriptor(dev, 0, desc_buffer, total_len) < 0) {
        serial_printf("[USB] Failed to get full config descriptor\n");
        return NULL;
    }

    serial_printf("[USB] Config: %d interfaces\n", config->bNumInterfaces);

    /* Parse configuration */
    usb_parse_config_descriptor(dev, desc_buffer, total_len);

    /* Set configuration */
    if (usb_set_configuration(dev, config->bConfigurationValue) < 0) {
        serial_printf("[USB] Failed to set configuration\n");
        return NULL;
    }

    /* Configure endpoints with xHCI */
    for (int i = 0; i < dev->num_interfaces; i++) {
        usb_interface_t *iface = &dev->interfaces[i];
        for (int j = 0; j < iface->num_endpoints; j++) {
            usb_endpoint_t *ep = &iface->endpoints[j];

            /* Map USB endpoint type to xHCI endpoint type */
            uint8_t xhci_type;
            int is_in = (ep->address & USB_EP_DIR_MASK) == USB_EP_DIR_IN;

            switch (ep->type) {
                case USB_EP_TYPE_CONTROL:
                    xhci_type = 4;  /* EP_TYPE_CONTROL */
                    break;
                case USB_EP_TYPE_ISOCHRONOUS:
                    xhci_type = is_in ? 5 : 1;
                    break;
                case USB_EP_TYPE_BULK:
                    xhci_type = is_in ? 6 : 2;
                    break;
                case USB_EP_TYPE_INTERRUPT:
                    xhci_type = is_in ? 7 : 3;
                    break;
                default:
                    continue;
            }

            xhci_configure_endpoint(dev->slot_id,
                                    ep->address,
                                    xhci_type,
                                    ep->max_packet_size,
                                    ep->interval);
        }
    }

    dev->enumerated = 1;
    serial_printf("[USB] Device enumeration complete\n");

    return dev;
}

/* ============================================================================
 * Port Scanning
 * ============================================================================ */

void usb_scan_ports(void) {
    serial_printf("[USB] Scanning ports...\n");

    for (uint8_t port = 1; port <= g_xhci.max_ports; port++) {
        if (xhci_port_connected(port)) {
            /* Check if we already have a device on this port */
            int found = 0;
            for (usb_device_t *dev = usb_devices; dev; dev = dev->next) {
                if (dev->port == port) {
                    found = 1;
                    break;
                }
            }

            if (!found) {
                usb_enumerate_device(port);
            }
        }
    }
}

/* ============================================================================
 * Device Lookup
 * ============================================================================ */

usb_device_t *usb_get_device(uint8_t slot_id) {
    for (usb_device_t *dev = usb_devices; dev; dev = dev->next) {
        if (dev->slot_id == slot_id) {
            return dev;
        }
    }
    return NULL;
}

/* ============================================================================
 * Interrupt Transfers
 * ============================================================================ */

int usb_interrupt_read(usb_device_t *dev, uint8_t ep,
                       void *buffer, uint16_t length) {
    return xhci_interrupt_transfer(dev->slot_id, ep, buffer, length);
}

/* ============================================================================
 * Polling
 * ============================================================================ */

void usb_poll(void) {
    /* Poll xHCI for events */
    xhci_poll();
}

/* ============================================================================
 * Initialization
 * ============================================================================ */

int usb_init(void) {
    serial_printf("[USB] Initializing USB core...\n");

    usb_devices = NULL;
    usb_device_count = 0;
    memset(usb_device_pool, 0, sizeof(usb_device_pool));

    /* Start xHCI controller */
    if (xhci_start() < 0) {
        serial_printf("[USB] Failed to start xHCI\n");
        return -1;
    }

    /* Scan for connected devices */
    usb_scan_ports();

    serial_printf("[USB] USB core initialized, %d devices found\n",
                  usb_device_count);

    return 0;
}
