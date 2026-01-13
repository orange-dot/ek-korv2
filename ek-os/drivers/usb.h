/**
 * @file usb.h
 * @brief USB Core for EK-OS
 *
 * Provides USB device enumeration, descriptor parsing, and transfer APIs.
 */

#ifndef EK_OS_USB_H
#define EK_OS_USB_H

#include <stdint.h>

/* ============================================================================
 * USB Request Types
 * ============================================================================ */

/* Direction */
#define USB_DIR_OUT               0x00
#define USB_DIR_IN                0x80

/* Type */
#define USB_TYPE_STANDARD         0x00
#define USB_TYPE_CLASS            0x20
#define USB_TYPE_VENDOR           0x40

/* Recipient */
#define USB_RECIP_DEVICE          0x00
#define USB_RECIP_INTERFACE       0x01
#define USB_RECIP_ENDPOINT        0x02
#define USB_RECIP_OTHER           0x03

/* Standard Request Codes */
#define USB_REQ_GET_STATUS        0x00
#define USB_REQ_CLEAR_FEATURE     0x01
#define USB_REQ_SET_FEATURE       0x03
#define USB_REQ_SET_ADDRESS       0x05
#define USB_REQ_GET_DESCRIPTOR    0x06
#define USB_REQ_SET_DESCRIPTOR    0x07
#define USB_REQ_GET_CONFIGURATION 0x08
#define USB_REQ_SET_CONFIGURATION 0x09
#define USB_REQ_GET_INTERFACE     0x0A
#define USB_REQ_SET_INTERFACE     0x0B
#define USB_REQ_SYNCH_FRAME       0x0C

/* ============================================================================
 * USB Descriptor Types
 * ============================================================================ */

#define USB_DESC_DEVICE           0x01
#define USB_DESC_CONFIGURATION    0x02
#define USB_DESC_STRING           0x03
#define USB_DESC_INTERFACE        0x04
#define USB_DESC_ENDPOINT         0x05
#define USB_DESC_DEVICE_QUALIFIER 0x06
#define USB_DESC_OTHER_SPEED_CFG  0x07
#define USB_DESC_INTERFACE_POWER  0x08
#define USB_DESC_OTG              0x09
#define USB_DESC_DEBUG            0x0A
#define USB_DESC_INTERFACE_ASSOC  0x0B
#define USB_DESC_HID              0x21
#define USB_DESC_HID_REPORT       0x22
#define USB_DESC_HID_PHYSICAL     0x23

/* ============================================================================
 * USB Class Codes
 * ============================================================================ */

#define USB_CLASS_PER_INTERFACE   0x00
#define USB_CLASS_AUDIO           0x01
#define USB_CLASS_COMM            0x02
#define USB_CLASS_HID             0x03
#define USB_CLASS_PHYSICAL        0x05
#define USB_CLASS_IMAGE           0x06
#define USB_CLASS_PRINTER         0x07
#define USB_CLASS_MASS_STORAGE    0x08
#define USB_CLASS_HUB             0x09
#define USB_CLASS_CDC_DATA        0x0A
#define USB_CLASS_SMART_CARD      0x0B
#define USB_CLASS_SECURITY        0x0D
#define USB_CLASS_VIDEO           0x0E
#define USB_CLASS_HEALTHCARE      0x0F
#define USB_CLASS_AUDIO_VIDEO     0x10
#define USB_CLASS_BILLBOARD       0x11
#define USB_CLASS_DIAGNOSTIC      0xDC
#define USB_CLASS_WIRELESS        0xE0
#define USB_CLASS_MISC            0xEF
#define USB_CLASS_APP_SPECIFIC    0xFE
#define USB_CLASS_VENDOR_SPECIFIC 0xFF

/* ============================================================================
 * USB Endpoint Types
 * ============================================================================ */

#define USB_EP_TYPE_CONTROL       0x00
#define USB_EP_TYPE_ISOCHRONOUS   0x01
#define USB_EP_TYPE_BULK          0x02
#define USB_EP_TYPE_INTERRUPT     0x03
#define USB_EP_TYPE_MASK          0x03

#define USB_EP_DIR_OUT            0x00
#define USB_EP_DIR_IN             0x80
#define USB_EP_DIR_MASK           0x80

#define USB_EP_NUM_MASK           0x0F

/* ============================================================================
 * USB Descriptors
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint8_t  bLength;
    uint8_t  bDescriptorType;
    uint16_t bcdUSB;
    uint8_t  bDeviceClass;
    uint8_t  bDeviceSubClass;
    uint8_t  bDeviceProtocol;
    uint8_t  bMaxPacketSize0;
    uint16_t idVendor;
    uint16_t idProduct;
    uint16_t bcdDevice;
    uint8_t  iManufacturer;
    uint8_t  iProduct;
    uint8_t  iSerialNumber;
    uint8_t  bNumConfigurations;
} usb_device_desc_t;

typedef struct __attribute__((packed)) {
    uint8_t  bLength;
    uint8_t  bDescriptorType;
    uint16_t wTotalLength;
    uint8_t  bNumInterfaces;
    uint8_t  bConfigurationValue;
    uint8_t  iConfiguration;
    uint8_t  bmAttributes;
    uint8_t  bMaxPower;
} usb_config_desc_t;

typedef struct __attribute__((packed)) {
    uint8_t  bLength;
    uint8_t  bDescriptorType;
    uint8_t  bInterfaceNumber;
    uint8_t  bAlternateSetting;
    uint8_t  bNumEndpoints;
    uint8_t  bInterfaceClass;
    uint8_t  bInterfaceSubClass;
    uint8_t  bInterfaceProtocol;
    uint8_t  iInterface;
} usb_interface_desc_t;

typedef struct __attribute__((packed)) {
    uint8_t  bLength;
    uint8_t  bDescriptorType;
    uint8_t  bEndpointAddress;
    uint8_t  bmAttributes;
    uint16_t wMaxPacketSize;
    uint8_t  bInterval;
} usb_endpoint_desc_t;

typedef struct __attribute__((packed)) {
    uint8_t  bLength;
    uint8_t  bDescriptorType;
    uint16_t bcdHID;
    uint8_t  bCountryCode;
    uint8_t  bNumDescriptors;
    uint8_t  bDescriptorType1;
    uint16_t wDescriptorLength1;
} usb_hid_desc_t;

/* ============================================================================
 * USB Device Representation
 * ============================================================================ */

#define USB_MAX_DEVICES           8
#define USB_MAX_INTERFACES        4
#define USB_MAX_ENDPOINTS         8

typedef struct {
    uint8_t  address;         /* Endpoint address (with direction) */
    uint8_t  type;            /* Transfer type */
    uint16_t max_packet_size;
    uint8_t  interval;        /* Polling interval */
} usb_endpoint_t;

typedef struct {
    uint8_t  number;          /* Interface number */
    uint8_t  alt_setting;
    uint8_t  class_code;
    uint8_t  subclass;
    uint8_t  protocol;
    uint8_t  num_endpoints;
    usb_endpoint_t endpoints[USB_MAX_ENDPOINTS];
    void    *driver_data;     /* For class driver use */
} usb_interface_t;

typedef struct usb_device {
    uint8_t  slot_id;         /* xHCI slot ID */
    uint8_t  address;         /* USB device address */
    uint8_t  port;            /* Root hub port */
    uint8_t  speed;           /* USB speed */

    /* Device descriptor info */
    uint16_t vendor_id;
    uint16_t product_id;
    uint8_t  device_class;
    uint8_t  device_subclass;
    uint8_t  device_protocol;
    uint8_t  max_packet_size0;

    /* Configuration */
    uint8_t  config_value;
    uint8_t  num_interfaces;
    usb_interface_t interfaces[USB_MAX_INTERFACES];

    /* State */
    int      configured;
    int      enumerated;

    /* Driver reference */
    void    *driver_data;

    /* Linked list */
    struct usb_device *next;
} usb_device_t;

/* ============================================================================
 * Functions
 * ============================================================================ */

/**
 * @brief Initialize USB subsystem
 */
int usb_init(void);

/**
 * @brief Scan ports and enumerate new devices
 */
void usb_scan_ports(void);

/**
 * @brief Enumerate a device on a specific port
 */
usb_device_t *usb_enumerate_device(uint8_t port);

/**
 * @brief Get device by slot ID
 */
usb_device_t *usb_get_device(uint8_t slot_id);

/**
 * @brief Get device descriptor
 */
int usb_get_device_descriptor(usb_device_t *dev, usb_device_desc_t *desc);

/**
 * @brief Get configuration descriptor (full)
 */
int usb_get_config_descriptor(usb_device_t *dev, uint8_t index,
                              void *buffer, uint16_t length);

/**
 * @brief Set device configuration
 */
int usb_set_configuration(usb_device_t *dev, uint8_t config);

/**
 * @brief Generic control transfer
 */
int usb_control_msg(usb_device_t *dev,
                    uint8_t request_type, uint8_t request,
                    uint16_t value, uint16_t index,
                    void *data, uint16_t length);

/**
 * @brief Read from interrupt endpoint
 */
int usb_interrupt_read(usb_device_t *dev, uint8_t ep,
                       void *buffer, uint16_t length);

/**
 * @brief USB polling (call regularly)
 */
void usb_poll(void);

/* Global device list */
extern usb_device_t *usb_devices;
extern int usb_device_count;

#endif /* EK_OS_USB_H */
