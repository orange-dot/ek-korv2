/**
 * @file xhci.c
 * @brief xHCI (USB 3.0) Host Controller Driver for EK-OS
 */

#include "xhci.h"
#include "pci.h"
#include "serial.h"
#include "../lib/mmio.h"
#include "../lib/io.h"
#include "../kernel/idt.h"
#include <string.h>

/* ============================================================================
 * Global State
 * ============================================================================ */

xhci_controller_t g_xhci;

/* Track pending interrupt transfers per slot/endpoint */
static int pending_intr[64][32];  /* [slot_id][dci] */

/* ============================================================================
 * Memory Allocator (Simple bump allocator)
 * ============================================================================ */

#define USB_MEMORY_POOL_SIZE    (512 * 1024)  /* 512 KB */
static uint8_t usb_memory_pool[USB_MEMORY_POOL_SIZE] __attribute__((aligned(4096)));
static size_t usb_memory_offset = 0;

static void *usb_alloc(size_t size, size_t alignment) {
    /* Align offset */
    size_t aligned = (usb_memory_offset + alignment - 1) & ~(alignment - 1);

    if (aligned + size > USB_MEMORY_POOL_SIZE) {
        serial_printf("[xHCI] ERROR: Out of memory (need %lu, have %lu)\n",
                      (unsigned long)(aligned + size),
                      (unsigned long)USB_MEMORY_POOL_SIZE);
        return NULL;
    }

    void *ptr = &usb_memory_pool[aligned];
    usb_memory_offset = aligned + size;
    memset(ptr, 0, size);
    return ptr;
}

/* ============================================================================
 * Ring Management
 * ============================================================================ */

static int xhci_ring_init(xhci_ring_t *ring, uint32_t size) {
    ring->trbs = usb_alloc(sizeof(xhci_trb_t) * size, 64);
    if (!ring->trbs) return -1;

    ring->size = size;
    ring->enqueue = 0;
    ring->dequeue = 0;
    ring->cycle = 1;

    /* Initialize link TRB at the end */
    xhci_trb_t *link = &ring->trbs[size - 1];
    link->parameter = (uint64_t)ring->trbs;
    link->status = 0;
    link->control = XHCI_TRB_TYPE(TRB_LINK) | TRB_CYCLE;

    return 0;
}

static xhci_trb_t *xhci_ring_enqueue(xhci_ring_t *ring) {
    xhci_trb_t *trb = &ring->trbs[ring->enqueue];

    ring->enqueue++;
    if (ring->enqueue >= ring->size - 1) {
        /* Wrap around via link TRB */
        xhci_trb_t *link = &ring->trbs[ring->size - 1];
        link->control = (link->control & ~TRB_CYCLE) | ring->cycle;
        ring->enqueue = 0;
        ring->cycle ^= 1;
    }

    return trb;
}

static void xhci_ring_doorbell(uint8_t slot_id, uint8_t ep_index) {
    uint32_t val = ep_index;
    mmio_write32(&g_xhci.doorbell_regs[slot_id], val);
}

/* ============================================================================
 * Command Execution
 * ============================================================================ */

static int xhci_send_command(xhci_trb_t *cmd) {
    xhci_trb_t *trb = xhci_ring_enqueue(&g_xhci.cmd_ring);

    trb->parameter = cmd->parameter;
    trb->status = cmd->status;
    trb->control = (cmd->control & ~TRB_CYCLE) | g_xhci.cmd_ring.cycle;

    g_xhci.cmd_completed = 0;
    g_xhci.cmd_status = 0;

    /* Ring host controller doorbell (slot 0, endpoint 0) */
    xhci_ring_doorbell(0, 0);

    /* Wait for completion (poll) */
    int timeout = 1000000;
    while (!g_xhci.cmd_completed && timeout > 0) {
        xhci_poll();
        timeout--;
    }

    if (!g_xhci.cmd_completed) {
        serial_printf("[xHCI] Command timeout\n");
        return -1;
    }

    if (TRB_GET_CC(g_xhci.cmd_status) != TRB_CC_SUCCESS) {
        serial_printf("[xHCI] Command failed: %s\n",
                      xhci_cc_string(TRB_GET_CC(g_xhci.cmd_status)));
        return -1;
    }

    return 0;
}

/* ============================================================================
 * Event Processing
 * ============================================================================ */

static void xhci_handle_transfer_event(xhci_trb_t *event) {
    uint8_t cc = TRB_GET_CC(event->status);
    uint8_t slot_id = TRB_GET_SLOT(event->control);
    uint8_t ep_id = TRB_GET_EP(event->control);
    int length = TRB_GET_LENGTH(event->status);

    if (cc != TRB_CC_SUCCESS && cc != TRB_CC_SHORT_PACKET) {
        serial_printf("[xHCI] Transfer error on slot %d ep %d: %s\n",
                      slot_id, ep_id, xhci_cc_string(cc));
    }

    /* Signal transfer completion with slot/ep info */
    g_xhci.transfer_status = event->status;
    g_xhci.transfer_length = length;
    g_xhci.transfer_slot = slot_id;
    g_xhci.transfer_ep = ep_id;
    g_xhci.transfer_completed = 1;

    /* Mark slot/ep as no longer pending */
    if (slot_id < 64 && ep_id < 32) {
        pending_intr[slot_id][ep_id] = 0;
    }
}

static void xhci_handle_command_completion(xhci_trb_t *event) {
    g_xhci.cmd_status = event->status;
    g_xhci.cmd_slot_id = TRB_GET_SLOT(event->control);
    g_xhci.cmd_completed = 1;
}

static void xhci_handle_port_status_change(xhci_trb_t *event) {
    uint8_t port = ((event->parameter >> 24) & 0xFF);
    serial_printf("[xHCI] Port %d status change\n", port);

    /* Clear change bits */
    volatile xhci_port_regs_t *pr = &g_xhci.port_regs[port - 1];
    uint32_t portsc = mmio_read32(&pr->portsc);
    portsc |= XHCI_PORTSC_CHANGE_BITS;
    /* Preserve RW1S and RW bits, clear RW1C bits we want to acknowledge */
    portsc &= ~(XHCI_PORTSC_PED);  /* Don't accidentally disable port */
    mmio_write32(&pr->portsc, portsc);
}

void xhci_poll(void) {
    if (!g_xhci.initialized) return;

    xhci_ring_t *ring = &g_xhci.event_ring;

    while (1) {
        xhci_trb_t *trb = &ring->trbs[ring->dequeue];

        /* Check if this TRB is valid (cycle bit matches) */
        uint32_t control = mmio_read32(&trb->control);
        if ((control & TRB_CYCLE) != ring->cycle) {
            break;  /* No more events */
        }

        uint8_t type = XHCI_TRB_GET_TYPE(control);

        switch (type) {
            case TRB_TRANSFER_EVENT:
                xhci_handle_transfer_event(trb);
                break;
            case TRB_CMD_COMPLETION:
                xhci_handle_command_completion(trb);
                break;
            case TRB_PORT_STATUS_CHANGE:
                xhci_handle_port_status_change(trb);
                break;
            default:
                serial_printf("[xHCI] Unknown event type %d\n", type);
                break;
        }

        /* Advance dequeue pointer */
        ring->dequeue++;
        if (ring->dequeue >= ring->size) {
            ring->dequeue = 0;
            ring->cycle ^= 1;
        }
    }

    /* Update ERDP */
    uint64_t erdp = (uint64_t)&ring->trbs[ring->dequeue];
    erdp |= XHCI_ERDP_EHB;  /* Clear Event Handler Busy */
    mmio_write64(&g_xhci.intr_regs->erdp, erdp);
}

void xhci_irq_handler(struct interrupt_frame *frame) {
    (void)frame;

    /* Check interrupt status */
    uint32_t usbsts = mmio_read32(&g_xhci.op_regs->usbsts);
    if (!(usbsts & XHCI_STS_EINT)) {
        return;  /* Not our interrupt */
    }

    /* Clear status */
    mmio_write32(&g_xhci.op_regs->usbsts, XHCI_STS_EINT);

    /* Clear interrupter pending */
    uint32_t iman = mmio_read32(&g_xhci.intr_regs->iman);
    mmio_write32(&g_xhci.intr_regs->iman, iman | XHCI_IMAN_IP);

    /* Process events */
    xhci_poll();
}

/* ============================================================================
 * Port Management
 * ============================================================================ */

int xhci_port_connected(uint8_t port) {
    if (port < 1 || port > g_xhci.max_ports) return 0;
    uint32_t portsc = mmio_read32(&g_xhci.port_regs[port - 1].portsc);
    return (portsc & XHCI_PORTSC_CCS) != 0;
}

uint8_t xhci_port_speed(uint8_t port) {
    if (port < 1 || port > g_xhci.max_ports) return 0;
    uint32_t portsc = mmio_read32(&g_xhci.port_regs[port - 1].portsc);
    return XHCI_PORTSC_SPEED(portsc);
}

int xhci_port_reset(uint8_t port) {
    if (port < 1 || port > g_xhci.max_ports) return -1;

    volatile xhci_port_regs_t *pr = &g_xhci.port_regs[port - 1];
    uint32_t portsc = mmio_read32(&pr->portsc);

    /* Check if device connected */
    if (!(portsc & XHCI_PORTSC_CCS)) {
        return -1;
    }

    /* Issue port reset */
    portsc &= ~XHCI_PORTSC_CHANGE_BITS;  /* Don't clear change bits accidentally */
    portsc |= XHCI_PORTSC_PR;
    mmio_write32(&pr->portsc, portsc);

    /* Wait for reset to complete (PRC bit set) */
    int timeout = 100000;
    while (timeout > 0) {
        portsc = mmio_read32(&pr->portsc);
        if (portsc & XHCI_PORTSC_PRC) {
            break;
        }
        timeout--;
    }

    if (timeout == 0) {
        serial_printf("[xHCI] Port %d reset timeout\n", port);
        return -1;
    }

    /* Clear PRC */
    portsc = mmio_read32(&pr->portsc);
    portsc &= ~XHCI_PORTSC_CHANGE_BITS;
    portsc |= XHCI_PORTSC_PRC;
    mmio_write32(&pr->portsc, portsc);

    /* Check port is enabled */
    portsc = mmio_read32(&pr->portsc);
    if (!(portsc & XHCI_PORTSC_PED)) {
        serial_printf("[xHCI] Port %d not enabled after reset\n", port);
        return -1;
    }

    serial_printf("[xHCI] Port %d reset complete, speed=%d\n",
                  port, XHCI_PORTSC_SPEED(portsc));
    return 0;
}

/* ============================================================================
 * Slot Management
 * ============================================================================ */

int xhci_enable_slot(uint8_t *slot_id) {
    xhci_trb_t cmd = {0};
    cmd.control = XHCI_TRB_TYPE(TRB_ENABLE_SLOT);

    if (xhci_send_command(&cmd) < 0) {
        return -1;
    }

    *slot_id = g_xhci.cmd_slot_id;
    serial_printf("[xHCI] Enabled slot %d\n", *slot_id);
    return 0;
}

int xhci_disable_slot(uint8_t slot_id) {
    xhci_trb_t cmd = {0};
    cmd.control = XHCI_TRB_TYPE(TRB_DISABLE_SLOT) | ((uint32_t)slot_id << 24);

    return xhci_send_command(&cmd);
}

int xhci_address_device(uint8_t slot_id, uint8_t port, uint8_t speed) {
    /* Allocate device and input contexts */
    size_t ctx_size = g_xhci.context_size * 32;  /* 32 contexts per device */
    size_t input_size = g_xhci.context_size * 33; /* 33 for input context */

    void *dev_ctx = usb_alloc(ctx_size, 64);
    void *input_ctx = usb_alloc(input_size, 64);

    if (!dev_ctx || !input_ctx) {
        serial_printf("[xHCI] Failed to allocate contexts\n");
        return -1;
    }

    g_xhci.device_contexts[slot_id] = dev_ctx;
    g_xhci.input_contexts[slot_id] = input_ctx;

    /* Set DCBAA entry */
    g_xhci.dcbaa[slot_id] = (uint64_t)dev_ctx;

    /* Allocate transfer ring for EP0 */
    xhci_ring_t *ep0_ring = usb_alloc(sizeof(xhci_ring_t), 8);
    if (!ep0_ring || xhci_ring_init(ep0_ring, XHCI_RING_SIZE) < 0) {
        serial_printf("[xHCI] Failed to allocate EP0 ring\n");
        return -1;
    }
    g_xhci.transfer_rings[slot_id][1] = ep0_ring;  /* EP0 = DCI 1 */

    /* Build input context */
    xhci_input_ctrl_ctx_t *icc = (xhci_input_ctrl_ctx_t *)input_ctx;
    icc->add_flags = (1 << 0) | (1 << 1);  /* Add Slot and EP0 contexts */

    /* Slot context */
    xhci_slot_ctx_t *slot_ctx = (xhci_slot_ctx_t *)
        ((uint8_t *)input_ctx + g_xhci.context_size);

    slot_ctx->field1 = SLOT_CTX_SPEED(speed) | SLOT_CTX_ENTRIES(1);
    slot_ctx->field2 = SLOT_CTX_ROOT_HUB_PORT(port);

    /* Endpoint 0 context */
    xhci_ep_ctx_t *ep0_ctx = (xhci_ep_ctx_t *)
        ((uint8_t *)input_ctx + g_xhci.context_size * 2);

    /* Max packet size based on speed */
    uint16_t max_packet = 8;  /* Default for low speed */
    switch (speed) {
        case XHCI_SPEED_LOW:    max_packet = 8;   break;
        case XHCI_SPEED_FULL:   max_packet = 64;  break;
        case XHCI_SPEED_HIGH:   max_packet = 64;  break;
        case XHCI_SPEED_SUPER:  max_packet = 512; break;
    }

    ep0_ctx->field1 = 0;
    ep0_ctx->field2 = EP_CTX_EP_TYPE(EP_TYPE_CONTROL) |
                      EP_CTX_MAX_PACKET(max_packet) |
                      EP_CTX_CERR(3);
    ep0_ctx->tr_dequeue = (uint64_t)ep0_ring->trbs | ep0_ring->cycle;
    ep0_ctx->field4 = 8;  /* Average TRB length for control */

    /* Send Address Device command */
    xhci_trb_t cmd = {0};
    cmd.parameter = (uint64_t)input_ctx;
    cmd.control = XHCI_TRB_TYPE(TRB_ADDRESS_DEVICE) | ((uint32_t)slot_id << 24);

    if (xhci_send_command(&cmd) < 0) {
        return -1;
    }

    serial_printf("[xHCI] Device addressed on slot %d\n", slot_id);
    return 0;
}

/* ============================================================================
 * Endpoint Configuration
 * ============================================================================ */

int xhci_configure_endpoint(uint8_t slot_id, uint8_t ep_num, uint8_t ep_type,
                            uint16_t max_packet_size, uint8_t interval) {
    /* Calculate DCI (Device Context Index) */
    /* DCI = (endpoint number * 2) + direction (0=OUT, 1=IN) */
    uint8_t dci = (ep_num & 0x0F) * 2;
    if (ep_type == EP_TYPE_INTR_IN || ep_type == EP_TYPE_BULK_IN ||
        ep_type == EP_TYPE_ISOCH_IN) {
        dci += 1;
    }

    serial_printf("[xHCI] Configure EP: slot=%d ep=0x%02x type=%d DCI=%d\n",
                  slot_id, ep_num, ep_type, dci);

    /* Allocate transfer ring */
    xhci_ring_t *ring = usb_alloc(sizeof(xhci_ring_t), 8);
    if (!ring || xhci_ring_init(ring, XHCI_RING_SIZE) < 0) {
        return -1;
    }
    g_xhci.transfer_rings[slot_id][dci] = ring;

    /* Get input context */
    void *input_ctx = g_xhci.input_contexts[slot_id];
    xhci_input_ctrl_ctx_t *icc = (xhci_input_ctrl_ctx_t *)input_ctx;

    /* Update context entries in slot context */
    xhci_slot_ctx_t *slot_ctx = (xhci_slot_ctx_t *)
        ((uint8_t *)input_ctx + g_xhci.context_size);

    uint32_t current_entries = (slot_ctx->field1 >> 27) & 0x1F;
    if (dci > current_entries) {
        slot_ctx->field1 = (slot_ctx->field1 & ~(0x1F << 27)) |
                           SLOT_CTX_ENTRIES(dci);
    }

    icc->add_flags = (1 << 0) | (1 << dci);  /* Add Slot and EP contexts */

    /* Configure endpoint context */
    xhci_ep_ctx_t *ep_ctx = (xhci_ep_ctx_t *)
        ((uint8_t *)input_ctx + g_xhci.context_size * (dci + 1));

    ep_ctx->field1 = EP_CTX_INTERVAL(interval);
    ep_ctx->field2 = EP_CTX_EP_TYPE(ep_type) |
                     EP_CTX_MAX_PACKET(max_packet_size) |
                     EP_CTX_CERR(3);
    ep_ctx->tr_dequeue = (uint64_t)ring->trbs | ring->cycle;
    ep_ctx->field4 = max_packet_size;  /* Average TRB length */

    /* Send Configure Endpoint command */
    xhci_trb_t cmd = {0};
    cmd.parameter = (uint64_t)input_ctx;
    cmd.control = XHCI_TRB_TYPE(TRB_CONFIGURE_EP) | ((uint32_t)slot_id << 24);

    int ret = xhci_send_command(&cmd);
    serial_printf("[xHCI] Configure EP result: %d, ring at %p\n", ret, (void*)ring);
    return ret;
}

/* ============================================================================
 * Control Transfers
 * ============================================================================ */

int xhci_control_transfer(uint8_t slot_id,
                          uint8_t request_type, uint8_t request,
                          uint16_t value, uint16_t index,
                          void *data, uint16_t length) {
    xhci_ring_t *ring = g_xhci.transfer_rings[slot_id][1];  /* EP0 = DCI 1 */
    if (!ring) {
        serial_printf("[xHCI] No EP0 ring for slot %d\n", slot_id);
        return -1;
    }

    /* Determine transfer type */
    int is_in = (request_type & 0x80) != 0;
    uint32_t trt = TRB_TRT_NO_DATA;
    if (length > 0) {
        trt = is_in ? TRB_TRT_IN : TRB_TRT_OUT;
    }

    /* Setup TRB */
    xhci_trb_t *setup = xhci_ring_enqueue(ring);
    setup->parameter = ((uint64_t)length << 48) |
                       ((uint64_t)index << 32) |
                       ((uint64_t)value << 16) |
                       ((uint64_t)request << 8) |
                       request_type;
    setup->status = 8;  /* Setup packet is 8 bytes */
    setup->control = XHCI_TRB_TYPE(TRB_SETUP) | TRB_IDT | trt | ring->cycle;

    /* Data TRB (if needed) */
    if (length > 0 && data) {
        xhci_trb_t *data_trb = xhci_ring_enqueue(ring);
        data_trb->parameter = (uint64_t)data;
        data_trb->status = length;
        data_trb->control = XHCI_TRB_TYPE(TRB_DATA) |
                            (is_in ? TRB_DIR_IN : 0) |
                            ring->cycle;
    }

    /* Status TRB */
    xhci_trb_t *status = xhci_ring_enqueue(ring);
    status->parameter = 0;
    status->status = 0;
    status->control = XHCI_TRB_TYPE(TRB_STATUS) |
                      TRB_IOC |
                      (is_in ? 0 : TRB_DIR_IN) |  /* Status is opposite direction */
                      ring->cycle;

    /* Ring doorbell for EP0 */
    g_xhci.transfer_completed = 0;
    xhci_ring_doorbell(slot_id, 1);

    /* Wait for transfer completion */
    int timeout = 500000;  /* Longer timeout for USB transfers */
    while (!g_xhci.transfer_completed && timeout > 0) {
        xhci_poll();
        timeout--;
    }

    if (timeout <= 0) {
        serial_printf("[xHCI] Control transfer timeout\n");
        return -1;
    }

    /* Check completion code */
    uint8_t cc = TRB_GET_CC(g_xhci.transfer_status);
    if (cc != TRB_CC_SUCCESS && cc != TRB_CC_SHORT_PACKET) {
        serial_printf("[xHCI] Control transfer failed: %s\n", xhci_cc_string(cc));
        return -1;
    }

    return 0;
}

/* ============================================================================
 * Interrupt Transfers
 * ============================================================================ */

static int intr_debug_count = 0;

int xhci_interrupt_transfer(uint8_t slot_id, uint8_t ep_num,
                            void *data, uint16_t length) {
    /* Calculate DCI for interrupt IN endpoint */
    uint8_t dci = (ep_num & 0x0F) * 2 + 1;  /* Assume IN */

    xhci_ring_t *ring = g_xhci.transfer_rings[slot_id][dci];
    if (!ring) {
        if (++intr_debug_count % 10000 == 1) {
            serial_printf("[xHCI] No ring for slot %d DCI %d (ep=0x%02x)\n",
                          slot_id, dci, ep_num);
        }
        return -1;
    }

    /* Poll for events first */
    xhci_poll();

    /* If transfer completed for this slot/ep, return the data */
    if (g_xhci.transfer_completed &&
        g_xhci.transfer_slot == slot_id &&
        g_xhci.transfer_ep == dci) {
        g_xhci.transfer_completed = 0;

        uint8_t cc = TRB_GET_CC(g_xhci.transfer_status);
        if (cc == TRB_CC_SUCCESS || cc == TRB_CC_SHORT_PACKET) {
            int residue = TRB_GET_LENGTH(g_xhci.transfer_status);
            return length - residue;
        }
        /* Error, try to queue another */
    }

    /* If we still have a pending transfer, wait for it */
    if (pending_intr[slot_id][dci]) {
        return 0;  /* Still waiting */
    }

    /* Queue a new transfer */
    xhci_trb_t *trb = xhci_ring_enqueue(ring);
    trb->parameter = (uint64_t)data;
    trb->status = length;
    trb->control = XHCI_TRB_TYPE(TRB_NORMAL) | TRB_IOC | ring->cycle;

    /* Ring doorbell */
    xhci_ring_doorbell(slot_id, dci);
    pending_intr[slot_id][dci] = 1;

    /* Check if completed immediately */
    for (int i = 0; i < 50; i++) {
        xhci_poll();
        if (g_xhci.transfer_completed &&
            g_xhci.transfer_slot == slot_id &&
            g_xhci.transfer_ep == dci) {
            g_xhci.transfer_completed = 0;
            uint8_t cc = TRB_GET_CC(g_xhci.transfer_status);
            if (cc == TRB_CC_SUCCESS || cc == TRB_CC_SHORT_PACKET) {
                int residue = TRB_GET_LENGTH(g_xhci.transfer_status);
                return length - residue;
            }
            return -1;
        }
    }

    return 0;  /* Queued but not completed yet */
}

/* ============================================================================
 * Initialization
 * ============================================================================ */

int xhci_init(void) {
    serial_printf("[xHCI] Initializing xHCI controller...\n");

    memset(&g_xhci, 0, sizeof(g_xhci));

    /* Find xHCI controller via PCI */
    pci_device_t *pci = pci_find_device(PCI_CLASS_SERIAL_BUS,
                                        PCI_SUBCLASS_USB,
                                        PCI_PROGIF_XHCI);
    if (!pci) {
        serial_printf("[xHCI] No xHCI controller found\n");
        return -1;
    }

    serial_printf("[xHCI] Found controller at %02x:%02x.%d\n",
                  pci->bus, pci->device, pci->function);

    g_xhci.pci_dev = pci;

    /* Enable PCI features */
    pci_enable_bus_master(pci);
    pci_enable_memory_space(pci);

    /* Map MMIO base from BAR0 */
    if (pci->bar[0] == 0) {
        serial_printf("[xHCI] BAR0 not configured\n");
        return -1;
    }

    g_xhci.cap_regs = (volatile xhci_cap_regs_t *)pci->bar[0];
    serial_printf("[xHCI] MMIO base: 0x%lx\n", pci->bar[0]);

    /* Read capability length */
    uint32_t cap_len_ver = mmio_read32(&g_xhci.cap_regs->caplength);
    uint8_t cap_length = cap_len_ver & 0xFF;
    uint16_t hci_version = (cap_len_ver >> 16) & 0xFFFF;

    serial_printf("[xHCI] Version: %x.%x, cap_length=%d\n",
                  (hci_version >> 8), (hci_version & 0xFF), cap_length);

    /* Calculate register offsets */
    g_xhci.op_regs = (volatile xhci_op_regs_t *)
        ((uint8_t *)g_xhci.cap_regs + cap_length);

    uint32_t rtsoff = mmio_read32(&g_xhci.cap_regs->rtsoff) & ~0x1F;
    g_xhci.runtime_regs = (volatile xhci_runtime_regs_t *)
        ((uint8_t *)g_xhci.cap_regs + rtsoff);
    g_xhci.intr_regs = (volatile xhci_interrupter_regs_t *)
        ((uint8_t *)g_xhci.runtime_regs + 0x20);

    uint32_t dboff = mmio_read32(&g_xhci.cap_regs->dboff) & ~0x3;
    g_xhci.doorbell_regs = (volatile uint32_t *)
        ((uint8_t *)g_xhci.cap_regs + dboff);

    g_xhci.port_regs = (volatile xhci_port_regs_t *)
        ((uint8_t *)g_xhci.op_regs + 0x400);

    /* Read capabilities */
    uint32_t hcsparams1 = mmio_read32(&g_xhci.cap_regs->hcsparams1);
    g_xhci.max_slots = XHCI_HCS1_MAX_SLOTS(hcsparams1);
    g_xhci.max_ports = XHCI_HCS1_MAX_PORTS(hcsparams1);
    g_xhci.max_intrs = XHCI_HCS1_MAX_INTRS(hcsparams1);

    uint32_t hcsparams2 = mmio_read32(&g_xhci.cap_regs->hcsparams2);
    g_xhci.scratchpad_count = XHCI_HCS2_MAX_SCRATCH(hcsparams2);

    uint32_t hccparams1 = mmio_read32(&g_xhci.cap_regs->hccparams1);
    g_xhci.ac64 = (hccparams1 & XHCI_HCC1_AC64) != 0;
    g_xhci.context_size = (hccparams1 & XHCI_HCC1_CSZ) ? 64 : 32;

    g_xhci.page_size = mmio_read32(&g_xhci.op_regs->pagesize) << 12;

    serial_printf("[xHCI] Max slots: %d, ports: %d, ctx_size: %d\n",
                  g_xhci.max_slots, g_xhci.max_ports, g_xhci.context_size);
    serial_printf("[xHCI] Scratchpad buffers: %d\n", g_xhci.scratchpad_count);

    /* Stop controller if running */
    uint32_t usbsts = mmio_read32(&g_xhci.op_regs->usbsts);
    if (!(usbsts & XHCI_STS_HCH)) {
        serial_printf("[xHCI] Stopping controller...\n");
        mmio_write32(&g_xhci.op_regs->usbcmd, 0);
        while (!(mmio_read32(&g_xhci.op_regs->usbsts) & XHCI_STS_HCH)) {
            /* Wait for halt */
        }
    }

    /* Reset controller */
    serial_printf("[xHCI] Resetting controller...\n");
    mmio_write32(&g_xhci.op_regs->usbcmd, XHCI_CMD_HCRST);
    while (mmio_read32(&g_xhci.op_regs->usbcmd) & XHCI_CMD_HCRST) {
        /* Wait for reset complete */
    }
    while (mmio_read32(&g_xhci.op_regs->usbsts) & XHCI_STS_CNR) {
        /* Wait for controller ready */
    }

    /* Allocate DCBAA */
    g_xhci.dcbaa = usb_alloc(sizeof(uint64_t) * (g_xhci.max_slots + 1), 64);
    if (!g_xhci.dcbaa) {
        serial_printf("[xHCI] Failed to allocate DCBAA\n");
        return -1;
    }

    /* Allocate scratchpad buffers */
    if (g_xhci.scratchpad_count > 0) {
        g_xhci.scratchpad_array = usb_alloc(
            sizeof(uint64_t) * g_xhci.scratchpad_count, 64);
        g_xhci.scratchpad_buffers = usb_alloc(
            sizeof(void *) * g_xhci.scratchpad_count, 8);

        for (uint32_t i = 0; i < g_xhci.scratchpad_count; i++) {
            void *buf = usb_alloc(g_xhci.page_size, g_xhci.page_size);
            if (!buf) {
                serial_printf("[xHCI] Failed to allocate scratchpad %d\n", i);
                return -1;
            }
            g_xhci.scratchpad_buffers[i] = buf;
            g_xhci.scratchpad_array[i] = (uint64_t)buf;
        }
        g_xhci.dcbaa[0] = (uint64_t)g_xhci.scratchpad_array;
    }

    /* Initialize command ring */
    if (xhci_ring_init(&g_xhci.cmd_ring, XHCI_RING_SIZE) < 0) {
        serial_printf("[xHCI] Failed to allocate command ring\n");
        return -1;
    }

    /* Initialize event ring */
    if (xhci_ring_init(&g_xhci.event_ring, XHCI_RING_SIZE) < 0) {
        serial_printf("[xHCI] Failed to allocate event ring\n");
        return -1;
    }

    g_xhci.erst = usb_alloc(sizeof(xhci_erst_entry_t), 64);
    if (!g_xhci.erst) {
        serial_printf("[xHCI] Failed to allocate ERST\n");
        return -1;
    }
    g_xhci.erst[0].ring_base = (uint64_t)g_xhci.event_ring.trbs;
    g_xhci.erst[0].ring_size = g_xhci.event_ring.size;

    /* Program DCBAAP */
    mmio_write64(&g_xhci.op_regs->dcbaap, (uint64_t)g_xhci.dcbaa);

    /* Program Command Ring Control Register */
    mmio_write64(&g_xhci.op_regs->crcr,
                 (uint64_t)g_xhci.cmd_ring.trbs | g_xhci.cmd_ring.cycle);

    /* Configure number of slots */
    mmio_write32(&g_xhci.op_regs->config, g_xhci.max_slots);

    /* Set up interrupter 0 */
    mmio_write32(&g_xhci.intr_regs->erstsz, 1);
    mmio_write64(&g_xhci.intr_regs->erstba, (uint64_t)g_xhci.erst);
    mmio_write64(&g_xhci.intr_regs->erdp,
                 (uint64_t)g_xhci.event_ring.trbs | XHCI_ERDP_EHB);
    mmio_write32(&g_xhci.intr_regs->imod, 0);
    mmio_write32(&g_xhci.intr_regs->iman, XHCI_IMAN_IE);

    g_xhci.initialized = 1;
    serial_printf("[xHCI] Controller initialized\n");

    return 0;
}

int xhci_start(void) {
    if (!g_xhci.initialized) return -1;

    serial_printf("[xHCI] Starting controller...\n");

    /* Start controller */
    mmio_write32(&g_xhci.op_regs->usbcmd,
                 XHCI_CMD_RUN | XHCI_CMD_INTE | XHCI_CMD_HSEE);

    /* Wait for running */
    while (mmio_read32(&g_xhci.op_regs->usbsts) & XHCI_STS_HCH) {
        /* Wait */
    }

    g_xhci.running = 1;
    serial_printf("[xHCI] Controller running\n");

    /* Scan ports for connected devices */
    for (uint8_t port = 1; port <= g_xhci.max_ports; port++) {
        if (xhci_port_connected(port)) {
            serial_printf("[xHCI] Device connected on port %d (speed=%d)\n",
                          port, xhci_port_speed(port));
        }
    }

    return 0;
}

void xhci_stop(void) {
    if (!g_xhci.running) return;

    mmio_write32(&g_xhci.op_regs->usbcmd, 0);
    while (!(mmio_read32(&g_xhci.op_regs->usbsts) & XHCI_STS_HCH)) {
        /* Wait for halt */
    }

    g_xhci.running = 0;
    serial_printf("[xHCI] Controller stopped\n");
}

/* ============================================================================
 * Debug Helpers
 * ============================================================================ */

const char *xhci_cc_string(uint8_t cc) {
    static const char *names[] = {
        "Invalid", "Success", "Data Buffer Error", "Babble",
        "USB Transaction Error", "TRB Error", "Stall", "Resource Error",
        "Bandwidth Error", "No Slots Available", "Invalid Stream Type",
        "Slot Not Enabled", "Endpoint Not Enabled", "Short Packet",
        "Ring Underrun", "Ring Overrun", "VF Event Ring Full",
        "Parameter Error", "Bandwidth Overrun", "Context State Error",
        "No Ping Response", "Event Ring Full", "Incompatible Device",
        "Missed Service", "Command Ring Stopped", "Command Aborted",
        "Stopped", "Stopped - Length Invalid", "Stopped - Short Packet",
        "Max Exit Latency Too Large"
    };

    if (cc < sizeof(names) / sizeof(names[0])) {
        return names[cc];
    }
    return "Unknown";
}
