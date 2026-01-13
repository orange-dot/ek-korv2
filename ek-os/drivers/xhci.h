/**
 * @file xhci.h
 * @brief xHCI (USB 3.0) Host Controller Driver for EK-OS
 *
 * Implements the eXtensible Host Controller Interface specification
 * for USB 3.0+ support on bare metal x86_64.
 */

#ifndef EK_OS_XHCI_H
#define EK_OS_XHCI_H

#include <stdint.h>
#include "pci.h"

/* Forward declarations */
struct interrupt_frame;

/* ============================================================================
 * xHCI Capability Registers (Base + 0x00)
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint8_t  caplength;       /* Capability Register Length */
    uint8_t  reserved;
    uint16_t hciversion;      /* Interface Version Number */
    uint32_t hcsparams1;      /* Structural Parameters 1 */
    uint32_t hcsparams2;      /* Structural Parameters 2 */
    uint32_t hcsparams3;      /* Structural Parameters 3 */
    uint32_t hccparams1;      /* Capability Parameters 1 */
    uint32_t dboff;           /* Doorbell Offset */
    uint32_t rtsoff;          /* Runtime Register Space Offset */
    uint32_t hccparams2;      /* Capability Parameters 2 (xHCI 1.1+) */
} xhci_cap_regs_t;

/* HCSPARAMS1 fields */
#define XHCI_HCS1_MAX_SLOTS(x)     ((x) & 0xFF)
#define XHCI_HCS1_MAX_INTRS(x)     (((x) >> 8) & 0x7FF)
#define XHCI_HCS1_MAX_PORTS(x)     (((x) >> 24) & 0xFF)

/* HCSPARAMS2 fields */
#define XHCI_HCS2_IST(x)           ((x) & 0xF)
#define XHCI_HCS2_ERST_MAX(x)      (((x) >> 4) & 0xF)
#define XHCI_HCS2_MAX_SCRATCH_HI(x) (((x) >> 21) & 0x1F)
#define XHCI_HCS2_SPR(x)           (((x) >> 26) & 0x1)
#define XHCI_HCS2_MAX_SCRATCH_LO(x) (((x) >> 27) & 0x1F)
#define XHCI_HCS2_MAX_SCRATCH(x)   \
    ((XHCI_HCS2_MAX_SCRATCH_HI(x) << 5) | XHCI_HCS2_MAX_SCRATCH_LO(x))

/* HCCPARAMS1 fields */
#define XHCI_HCC1_AC64             (1 << 0)   /* 64-bit Addressing */
#define XHCI_HCC1_BNC              (1 << 1)   /* BW Negotiation */
#define XHCI_HCC1_CSZ              (1 << 2)   /* Context Size (0=32, 1=64) */
#define XHCI_HCC1_PPC              (1 << 3)   /* Port Power Control */
#define XHCI_HCC1_PIND             (1 << 4)   /* Port Indicators */
#define XHCI_HCC1_XECP(x)          (((x) >> 16) & 0xFFFF)

/* ============================================================================
 * xHCI Operational Registers (Base + caplength)
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint32_t usbcmd;          /* USB Command */
    uint32_t usbsts;          /* USB Status */
    uint32_t pagesize;        /* Page Size */
    uint32_t reserved1[2];
    uint32_t dnctrl;          /* Device Notification Control */
    uint64_t crcr;            /* Command Ring Control */
    uint32_t reserved2[4];
    uint64_t dcbaap;          /* Device Context Base Address Array Pointer */
    uint32_t config;          /* Configure */
} xhci_op_regs_t;

/* USBCMD bits */
#define XHCI_CMD_RUN              (1 << 0)    /* Run/Stop */
#define XHCI_CMD_HCRST            (1 << 1)    /* Host Controller Reset */
#define XHCI_CMD_INTE             (1 << 2)    /* Interrupter Enable */
#define XHCI_CMD_HSEE             (1 << 3)    /* Host System Error Enable */
#define XHCI_CMD_LHCRST           (1 << 7)    /* Light HC Reset */
#define XHCI_CMD_CSS              (1 << 8)    /* Controller Save State */
#define XHCI_CMD_CRS              (1 << 9)    /* Controller Restore State */
#define XHCI_CMD_EWE              (1 << 10)   /* Enable Wrap Event */

/* USBSTS bits */
#define XHCI_STS_HCH              (1 << 0)    /* HC Halted */
#define XHCI_STS_HSE              (1 << 2)    /* Host System Error */
#define XHCI_STS_EINT             (1 << 3)    /* Event Interrupt */
#define XHCI_STS_PCD              (1 << 4)    /* Port Change Detect */
#define XHCI_STS_SSS              (1 << 8)    /* Save State Status */
#define XHCI_STS_RSS              (1 << 9)    /* Restore State Status */
#define XHCI_STS_SRE              (1 << 10)   /* Save/Restore Error */
#define XHCI_STS_CNR              (1 << 11)   /* Controller Not Ready */
#define XHCI_STS_HCE              (1 << 12)   /* Host Controller Error */

/* CRCR bits */
#define XHCI_CRCR_RCS             (1 << 0)    /* Ring Cycle State */
#define XHCI_CRCR_CS              (1 << 1)    /* Command Stop */
#define XHCI_CRCR_CA              (1 << 2)    /* Command Abort */
#define XHCI_CRCR_CRR             (1 << 3)    /* Command Ring Running */

/* ============================================================================
 * Port Register Set (Base + caplength + 0x400 + port*0x10)
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint32_t portsc;          /* Port Status and Control */
    uint32_t portpmsc;        /* Port PM Status and Control */
    uint32_t portli;          /* Port Link Info */
    uint32_t porthlpmc;       /* Port Hardware LPM Control */
} xhci_port_regs_t;

/* PORTSC bits */
#define XHCI_PORTSC_CCS           (1 << 0)    /* Current Connect Status */
#define XHCI_PORTSC_PED           (1 << 1)    /* Port Enabled/Disabled */
#define XHCI_PORTSC_OCA           (1 << 3)    /* Over-current Active */
#define XHCI_PORTSC_PR            (1 << 4)    /* Port Reset */
#define XHCI_PORTSC_PLS_MASK      (0xF << 5)  /* Port Link State */
#define XHCI_PORTSC_PLS(x)        (((x) >> 5) & 0xF)
#define XHCI_PORTSC_PP            (1 << 9)    /* Port Power */
#define XHCI_PORTSC_SPEED_MASK    (0xF << 10)
#define XHCI_PORTSC_SPEED(x)      (((x) >> 10) & 0xF)
#define XHCI_PORTSC_PIC_MASK      (0x3 << 14) /* Port Indicator Control */
#define XHCI_PORTSC_LWS           (1 << 16)   /* Port Link State Write Strobe */
#define XHCI_PORTSC_CSC           (1 << 17)   /* Connect Status Change */
#define XHCI_PORTSC_PEC           (1 << 18)   /* Port Enabled/Disabled Change */
#define XHCI_PORTSC_WRC           (1 << 19)   /* Warm Port Reset Change */
#define XHCI_PORTSC_OCC           (1 << 20)   /* Over-current Change */
#define XHCI_PORTSC_PRC           (1 << 21)   /* Port Reset Change */
#define XHCI_PORTSC_PLC           (1 << 22)   /* Port Link State Change */
#define XHCI_PORTSC_CEC           (1 << 23)   /* Port Config Error Change */
#define XHCI_PORTSC_CAS           (1 << 24)   /* Cold Attach Status */
#define XHCI_PORTSC_WCE           (1 << 25)   /* Wake on Connect Enable */
#define XHCI_PORTSC_WDE           (1 << 26)   /* Wake on Disconnect Enable */
#define XHCI_PORTSC_WOE           (1 << 27)   /* Wake on Over-current Enable */
#define XHCI_PORTSC_DR            (1 << 30)   /* Device Removable */
#define XHCI_PORTSC_WPR           (1 << 31)   /* Warm Port Reset */

/* Port Link State values */
#define XHCI_PLS_U0               0           /* Enabled */
#define XHCI_PLS_U1               1
#define XHCI_PLS_U2               2
#define XHCI_PLS_U3               3           /* Suspended */
#define XHCI_PLS_DISABLED         4
#define XHCI_PLS_RXDETECT         5
#define XHCI_PLS_INACTIVE         6
#define XHCI_PLS_POLLING          7
#define XHCI_PLS_RECOVERY         8
#define XHCI_PLS_HOTRESET         9
#define XHCI_PLS_COMPLIANCE       10
#define XHCI_PLS_LOOPBACK         11
#define XHCI_PLS_RESUME           15

/* Port Speed values */
#define XHCI_SPEED_FULL           1           /* 12 Mbps (USB 1.1) */
#define XHCI_SPEED_LOW            2           /* 1.5 Mbps (USB 1.0) */
#define XHCI_SPEED_HIGH           3           /* 480 Mbps (USB 2.0) */
#define XHCI_SPEED_SUPER          4           /* 5 Gbps (USB 3.0) */
#define XHCI_SPEED_SUPER_PLUS     5           /* 10 Gbps (USB 3.1) */

/* Change bits to clear after handling */
#define XHCI_PORTSC_CHANGE_BITS   (XHCI_PORTSC_CSC | XHCI_PORTSC_PEC | \
                                   XHCI_PORTSC_WRC | XHCI_PORTSC_OCC | \
                                   XHCI_PORTSC_PRC | XHCI_PORTSC_PLC | \
                                   XHCI_PORTSC_CEC)

/* ============================================================================
 * Runtime Registers (Base + rtsoff)
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint32_t mfindex;         /* Microframe Index */
    uint32_t reserved[7];
    /* Interrupter Register Sets follow at offset 0x20 */
} xhci_runtime_regs_t;

typedef struct __attribute__((packed)) {
    uint32_t iman;            /* Interrupter Management */
    uint32_t imod;            /* Interrupter Moderation */
    uint32_t erstsz;          /* Event Ring Segment Table Size */
    uint32_t reserved;
    uint64_t erstba;          /* Event Ring Segment Table Base Address */
    uint64_t erdp;            /* Event Ring Dequeue Pointer */
} xhci_interrupter_regs_t;

/* IMAN bits */
#define XHCI_IMAN_IP              (1 << 0)    /* Interrupt Pending */
#define XHCI_IMAN_IE              (1 << 1)    /* Interrupt Enable */

/* ERDP bits */
#define XHCI_ERDP_EHB             (1 << 3)    /* Event Handler Busy */

/* ============================================================================
 * Transfer Request Block (TRB) - 16 bytes
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint64_t parameter;       /* Parameter/data buffer pointer */
    uint32_t status;          /* Status/transfer length */
    uint32_t control;         /* Control (type, flags) */
} xhci_trb_t;

/* TRB type (bits 10-15 of control) */
#define XHCI_TRB_TYPE_SHIFT       10
#define XHCI_TRB_TYPE_MASK        (0x3F << 10)
#define XHCI_TRB_TYPE(x)          (((x) & 0x3F) << 10)
#define XHCI_TRB_GET_TYPE(c)      (((c) >> 10) & 0x3F)

/* Transfer TRB types */
#define TRB_NORMAL                1
#define TRB_SETUP                 2
#define TRB_DATA                  3
#define TRB_STATUS                4
#define TRB_ISOCH                 5
#define TRB_LINK                  6
#define TRB_EVENT_DATA            7
#define TRB_NOOP                  8

/* Command TRB types */
#define TRB_ENABLE_SLOT           9
#define TRB_DISABLE_SLOT          10
#define TRB_ADDRESS_DEVICE        11
#define TRB_CONFIGURE_EP          12
#define TRB_EVALUATE_CTX          13
#define TRB_RESET_EP              14
#define TRB_STOP_EP               15
#define TRB_SET_TR_DEQUEUE        16
#define TRB_RESET_DEVICE          17
#define TRB_FORCE_EVENT           18
#define TRB_NEGOTIATE_BW          19
#define TRB_SET_LATENCY_TOL       20
#define TRB_GET_PORT_BW           21
#define TRB_FORCE_HEADER          22
#define TRB_NOOP_CMD              23

/* Event TRB types */
#define TRB_TRANSFER_EVENT        32
#define TRB_CMD_COMPLETION        33
#define TRB_PORT_STATUS_CHANGE    34
#define TRB_BANDWIDTH_REQUEST     35
#define TRB_DOORBELL_EVENT        36
#define TRB_HOST_CONTROLLER_EVENT 37
#define TRB_DEVICE_NOTIFICATION   38
#define TRB_MFINDEX_WRAP          39

/* TRB control flags */
#define TRB_CYCLE                 (1 << 0)    /* Cycle bit */
#define TRB_ENT                   (1 << 1)    /* Evaluate Next TRB */
#define TRB_ISP                   (1 << 2)    /* Interrupt on Short Packet */
#define TRB_NS                    (1 << 3)    /* No Snoop */
#define TRB_CHAIN                 (1 << 4)    /* Chain bit */
#define TRB_IOC                   (1 << 5)    /* Interrupt on Completion */
#define TRB_IDT                   (1 << 6)    /* Immediate Data */
#define TRB_BSR                   (1 << 9)    /* Block Set Address Request */
#define TRB_DIR_IN                (1 << 16)   /* Direction (1=IN, 0=OUT) */

/* Setup TRB specific */
#define TRB_TRT_NO_DATA           (0 << 16)   /* Transfer Type: No Data */
#define TRB_TRT_OUT               (2 << 16)   /* Transfer Type: OUT */
#define TRB_TRT_IN                (3 << 16)   /* Transfer Type: IN */

/* Completion codes (from event TRB status) */
#define TRB_CC_INVALID            0
#define TRB_CC_SUCCESS            1
#define TRB_CC_DATA_BUFFER_ERR    2
#define TRB_CC_BABBLE             3
#define TRB_CC_USB_TRANS_ERR      4
#define TRB_CC_TRB_ERROR          5
#define TRB_CC_STALL              6
#define TRB_CC_RESOURCE_ERR       7
#define TRB_CC_BANDWIDTH_ERR      8
#define TRB_CC_NO_SLOTS           9
#define TRB_CC_INVALID_STREAM     10
#define TRB_CC_SLOT_NOT_ENABLED   11
#define TRB_CC_EP_NOT_ENABLED     12
#define TRB_CC_SHORT_PACKET       13
#define TRB_CC_RING_UNDERRUN      14
#define TRB_CC_RING_OVERRUN       15
#define TRB_CC_VF_EVENT_RING_FULL 16
#define TRB_CC_PARAMETER_ERR      17
#define TRB_CC_BW_OVERRUN         18
#define TRB_CC_CONTEXT_STATE_ERR  19
#define TRB_CC_NO_PING_RESPONSE   20
#define TRB_CC_EVENT_RING_FULL    21
#define TRB_CC_INCOMPATIBLE_DEV   22
#define TRB_CC_MISSED_SERVICE     23
#define TRB_CC_CMD_RING_STOPPED   24
#define TRB_CC_CMD_ABORTED        25
#define TRB_CC_STOPPED            26
#define TRB_CC_STOPPED_LENGTH     27
#define TRB_CC_STOPPED_SHORT      28
#define TRB_CC_MAX_EXIT_LATENCY   29
#define TRB_CC_ISOCH_OVERRUN      31

#define TRB_GET_CC(status)        (((status) >> 24) & 0xFF)
#define TRB_GET_LENGTH(status)    ((status) & 0xFFFFFF)
#define TRB_GET_SLOT(control)     (((control) >> 24) & 0xFF)
#define TRB_GET_EP(control)       (((control) >> 16) & 0x1F)

/* ============================================================================
 * Slot and Endpoint Context (32 or 64 bytes each)
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint32_t field1;          /* Route String, Speed, MTT, Hub, Context Entries */
    uint32_t field2;          /* Max Exit Latency, Root Hub Port, Num Ports */
    uint32_t field3;          /* Parent Hub Slot, Parent Port, TTT, Interrupter */
    uint32_t field4;          /* USB Device Address, Slot State */
    uint32_t reserved[4];     /* Reserved (to make 32 bytes) */
} xhci_slot_ctx_t;

/* Slot Context field1 */
#define SLOT_CTX_ROUTE(x)         ((x) & 0xFFFFF)
#define SLOT_CTX_SPEED(x)         (((x) & 0xF) << 20)
#define SLOT_CTX_MTT              (1 << 25)
#define SLOT_CTX_HUB              (1 << 26)
#define SLOT_CTX_ENTRIES(x)       (((x) & 0x1F) << 27)

/* Slot Context field2 */
#define SLOT_CTX_MAX_EXIT_LAT(x)  ((x) & 0xFFFF)
#define SLOT_CTX_ROOT_HUB_PORT(x) (((x) & 0xFF) << 16)
#define SLOT_CTX_NUM_PORTS(x)     (((x) & 0xFF) << 24)

/* Slot Context field4 - Slot State */
#define SLOT_STATE_DISABLED       0
#define SLOT_STATE_DEFAULT        1
#define SLOT_STATE_ADDRESSED      2
#define SLOT_STATE_CONFIGURED     3

typedef struct __attribute__((packed)) {
    uint32_t field1;          /* EP State, Mult, MaxPStreams, LSA, Interval, etc. */
    uint32_t field2;          /* CErr, EP Type, HID, Max Burst, Max Packet Size */
    uint64_t tr_dequeue;      /* TR Dequeue Pointer (bits 0-3: DCS, reserved) */
    uint32_t field4;          /* Average TRB Length, Max ESIT Payload Lo */
    uint32_t reserved[3];
} xhci_ep_ctx_t;

/* Endpoint Context field1 */
#define EP_CTX_STATE_MASK         0x7
#define EP_CTX_MULT(x)            (((x) & 0x3) << 8)
#define EP_CTX_MAX_PSTREAMS(x)    (((x) & 0x1F) << 10)
#define EP_CTX_LSA                (1 << 15)
#define EP_CTX_INTERVAL(x)        (((x) & 0xFF) << 16)
#define EP_CTX_MAX_ESIT_HI(x)     (((x) & 0xFF) << 24)

/* Endpoint Context field2 */
#define EP_CTX_CERR(x)            (((x) & 0x3) << 1)
#define EP_CTX_EP_TYPE(x)         (((x) & 0x7) << 3)
#define EP_CTX_HID                (1 << 7)
#define EP_CTX_MAX_BURST(x)       (((x) & 0xFF) << 8)
#define EP_CTX_MAX_PACKET(x)      (((x) & 0xFFFF) << 16)

/* Endpoint types */
#define EP_TYPE_INVALID           0
#define EP_TYPE_ISOCH_OUT         1
#define EP_TYPE_BULK_OUT          2
#define EP_TYPE_INTR_OUT          3
#define EP_TYPE_CONTROL           4
#define EP_TYPE_ISOCH_IN          5
#define EP_TYPE_BULK_IN           6
#define EP_TYPE_INTR_IN           7

/* Endpoint states */
#define EP_STATE_DISABLED         0
#define EP_STATE_RUNNING          1
#define EP_STATE_HALTED           2
#define EP_STATE_STOPPED          3
#define EP_STATE_ERROR            4

/* Input Control Context (first entry in Input Context) */
typedef struct __attribute__((packed)) {
    uint32_t drop_flags;      /* Drop Context flags (bit per context) */
    uint32_t add_flags;       /* Add Context flags (bit per context) */
    uint32_t reserved[6];
} xhci_input_ctrl_ctx_t;

/* ============================================================================
 * Event Ring Segment Table Entry
 * ============================================================================ */

typedef struct __attribute__((packed)) {
    uint64_t ring_base;       /* Ring Segment Base Address (64-byte aligned) */
    uint32_t ring_size;       /* Ring Segment Size (in TRBs) */
    uint32_t reserved;
} xhci_erst_entry_t;

/* ============================================================================
 * Ring Management
 * ============================================================================ */

#define XHCI_RING_SIZE            256         /* TRBs per ring */
#define XHCI_MAX_SLOTS            32          /* Max device slots */
#define XHCI_MAX_ENDPOINTS        31          /* Endpoints 1-31 (0=control) */

typedef struct {
    xhci_trb_t *trbs;         /* TRB array (must be 64-byte aligned) */
    uint32_t   size;          /* Number of TRBs in ring */
    uint32_t   enqueue;       /* Enqueue index */
    uint32_t   dequeue;       /* Dequeue index (for event ring) */
    uint8_t    cycle;         /* Producer Cycle State */
} xhci_ring_t;

/* ============================================================================
 * xHCI Controller State
 * ============================================================================ */

typedef struct {
    /* PCI device */
    pci_device_t *pci_dev;

    /* Memory-mapped registers */
    volatile xhci_cap_regs_t       *cap_regs;
    volatile xhci_op_regs_t        *op_regs;
    volatile xhci_port_regs_t      *port_regs;
    volatile xhci_runtime_regs_t   *runtime_regs;
    volatile xhci_interrupter_regs_t *intr_regs;
    volatile uint32_t              *doorbell_regs;

    /* Capabilities */
    uint8_t  max_slots;
    uint8_t  max_ports;
    uint16_t max_intrs;
    uint8_t  context_size;    /* 32 or 64 bytes */
    int      ac64;            /* 64-bit addressing capable */
    uint32_t page_size;       /* Page size in bytes */
    uint32_t scratchpad_count;

    /* Device Context Base Address Array */
    uint64_t *dcbaa;

    /* Scratchpad */
    uint64_t *scratchpad_array;
    void    **scratchpad_buffers;

    /* Command ring */
    xhci_ring_t cmd_ring;

    /* Event ring (interrupter 0) */
    xhci_ring_t event_ring;
    xhci_erst_entry_t *erst;

    /* Device contexts (slot_id -> context pointer) */
    void *device_contexts[XHCI_MAX_SLOTS + 1];
    void *input_contexts[XHCI_MAX_SLOTS + 1];

    /* Transfer rings (slot_id -> ep_index -> ring) */
    xhci_ring_t *transfer_rings[XHCI_MAX_SLOTS + 1][XHCI_MAX_ENDPOINTS + 1];

    /* IRQ */
    uint8_t  irq_vector;

    /* State */
    int      initialized;
    int      running;

    /* Command completion */
    volatile int cmd_completed;
    volatile uint32_t cmd_status;
    volatile uint32_t cmd_slot_id;

    /* Transfer completion */
    volatile int transfer_completed;
    volatile uint32_t transfer_status;
    volatile int transfer_length;
    volatile uint8_t transfer_slot;
    volatile uint8_t transfer_ep;
} xhci_controller_t;

/* Global controller instance */
extern xhci_controller_t g_xhci;

/* ============================================================================
 * Functions
 * ============================================================================ */

/* Initialization */
int xhci_init(void);
int xhci_start(void);
void xhci_stop(void);

/* Port management */
int xhci_port_reset(uint8_t port);
int xhci_port_connected(uint8_t port);
uint8_t xhci_port_speed(uint8_t port);

/* Slot management */
int xhci_enable_slot(uint8_t *slot_id);
int xhci_disable_slot(uint8_t slot_id);
int xhci_address_device(uint8_t slot_id, uint8_t port, uint8_t speed);

/* Endpoint management */
int xhci_configure_endpoint(uint8_t slot_id, uint8_t ep_num, uint8_t ep_type,
                            uint16_t max_packet_size, uint8_t interval);

/* Transfers */
int xhci_control_transfer(uint8_t slot_id,
                          uint8_t request_type, uint8_t request,
                          uint16_t value, uint16_t index,
                          void *data, uint16_t length);
int xhci_interrupt_transfer(uint8_t slot_id, uint8_t ep_num,
                            void *data, uint16_t length);

/* Event handling */
void xhci_poll(void);
void xhci_irq_handler(struct interrupt_frame *frame);

/* Debug */
const char *xhci_cc_string(uint8_t cc);

#endif /* EK_OS_XHCI_H */
