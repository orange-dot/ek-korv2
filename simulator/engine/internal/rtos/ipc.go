package rtos

import (
	"errors"
	"sync"
	"time"
)

// MessageType defines IPC message types
type MessageType int

const (
	MsgRequest      MessageType = iota // Request expecting response
	MsgResponse                        // Response to request
	MsgNotification                    // One-way notification
	MsgBroadcast                       // Broadcast to all
	MsgEvent                           // Event notification
)

// Message represents an IPC message
type Message struct {
	Type      MessageType
	Sender    ServiceID
	Receiver  ServiceID
	Payload   []byte    // Message payload (max 64 bytes for zero-copy sim)
	Timestamp time.Time
	SeqNum    uint32 // Sequence number for request/response matching
	ReplyTo   chan Message
}

// IPCError represents IPC errors
type IPCError int

const (
	IPCSuccess IPCError = iota
	IPCErrTimeout
	IPCErrQueueFull
	IPCErrNotRegistered
	IPCErrInvalidReceiver
)

// Error returns error message
func (e IPCError) Error() string {
	switch e {
	case IPCSuccess:
		return "success"
	case IPCErrTimeout:
		return "timeout"
	case IPCErrQueueFull:
		return "queue full"
	case IPCErrNotRegistered:
		return "service not registered"
	case IPCErrInvalidReceiver:
		return "invalid receiver"
	default:
		return "unknown error"
	}
}

// IPCManager manages inter-process communication
// Implements zero-copy message passing for efficiency
type IPCManager struct {
	mu sync.RWMutex

	// Service queues
	queues map[ServiceID]chan Message

	// Timeout for synchronous operations
	timeout time.Duration

	// Sequence number generator
	seqNum uint32

	// Statistics
	sent       uint64
	received   uint64
	dropped    uint64
	broadcasts uint64
}

// NewIPCManager creates a new IPC manager
func NewIPCManager(timeout time.Duration) *IPCManager {
	return &IPCManager{
		queues:  make(map[ServiceID]chan Message),
		timeout: timeout,
	}
}

// RegisterService registers a service's message queue
func (ipc *IPCManager) RegisterService(id ServiceID, queue chan Message) {
	ipc.mu.Lock()
	defer ipc.mu.Unlock()
	ipc.queues[id] = queue
}

// UnregisterService removes a service's queue
func (ipc *IPCManager) UnregisterService(id ServiceID) {
	ipc.mu.Lock()
	defer ipc.mu.Unlock()
	delete(ipc.queues, id)
}

// Send sends an asynchronous message
func (ipc *IPCManager) Send(msg Message) error {
	ipc.mu.RLock()
	queue, ok := ipc.queues[msg.Receiver]
	ipc.mu.RUnlock()

	if !ok {
		return IPCErrNotRegistered
	}

	msg.Timestamp = time.Now()
	ipc.seqNum++
	msg.SeqNum = ipc.seqNum

	select {
	case queue <- msg:
		ipc.sent++
		return nil
	default:
		ipc.dropped++
		return IPCErrQueueFull
	}
}

// SendSync sends a message and waits for response
func (ipc *IPCManager) SendSync(msg Message) (Message, error) {
	// Create reply channel
	replyChan := make(chan Message, 1)
	msg.ReplyTo = replyChan
	msg.Type = MsgRequest

	// Send the request
	if err := ipc.Send(msg); err != nil {
		return Message{}, err
	}

	// Wait for response with timeout
	select {
	case reply := <-replyChan:
		ipc.received++
		return reply, nil
	case <-time.After(ipc.timeout):
		return Message{}, IPCErrTimeout
	}
}

// Reply sends a reply to a request message
func (ipc *IPCManager) Reply(original Message, payload []byte) error {
	if original.ReplyTo == nil {
		return errors.New("message has no reply channel")
	}

	reply := Message{
		Type:      MsgResponse,
		Sender:    original.Receiver,
		Receiver:  original.Sender,
		Payload:   payload,
		Timestamp: time.Now(),
		SeqNum:    original.SeqNum,
	}

	select {
	case original.ReplyTo <- reply:
		ipc.sent++
		return nil
	default:
		ipc.dropped++
		return IPCErrQueueFull
	}
}

// Broadcast sends a message to all registered services
func (ipc *IPCManager) Broadcast(msg Message) {
	ipc.mu.RLock()
	defer ipc.mu.RUnlock()

	msg.Type = MsgBroadcast
	msg.Timestamp = time.Now()
	ipc.seqNum++
	msg.SeqNum = ipc.seqNum

	for id, queue := range ipc.queues {
		if id == msg.Sender {
			continue // Don't send to self
		}

		// Non-blocking send
		select {
		case queue <- msg:
			ipc.sent++
		default:
			ipc.dropped++
		}
	}
	ipc.broadcasts++
}

// Receive receives a message from a service's queue (non-blocking)
func (ipc *IPCManager) Receive(id ServiceID) (Message, bool) {
	ipc.mu.RLock()
	queue, ok := ipc.queues[id]
	ipc.mu.RUnlock()

	if !ok {
		return Message{}, false
	}

	select {
	case msg := <-queue:
		ipc.received++
		return msg, true
	default:
		return Message{}, false
	}
}

// ReceiveBlocking receives a message with timeout
func (ipc *IPCManager) ReceiveBlocking(id ServiceID, timeout time.Duration) (Message, bool) {
	ipc.mu.RLock()
	queue, ok := ipc.queues[id]
	ipc.mu.RUnlock()

	if !ok {
		return Message{}, false
	}

	select {
	case msg := <-queue:
		ipc.received++
		return msg, true
	case <-time.After(timeout):
		return Message{}, false
	}
}

// GetPendingCount returns number of pending messages for a service
func (ipc *IPCManager) GetPendingCount(id ServiceID) int {
	ipc.mu.RLock()
	queue, ok := ipc.queues[id]
	ipc.mu.RUnlock()

	if !ok {
		return 0
	}
	return len(queue)
}

// FlushQueue clears all pending messages for a service
func (ipc *IPCManager) FlushQueue(id ServiceID) {
	ipc.mu.RLock()
	queue, ok := ipc.queues[id]
	ipc.mu.RUnlock()

	if !ok {
		return
	}

	for len(queue) > 0 {
		<-queue
	}
}

// GetStats returns IPC statistics
func (ipc *IPCManager) GetStats() IPCStats {
	return IPCStats{
		Sent:       ipc.sent,
		Received:   ipc.received,
		Dropped:    ipc.dropped,
		Broadcasts: ipc.broadcasts,
		Queues:     len(ipc.queues),
	}
}

// IPCStats holds IPC statistics
type IPCStats struct {
	Sent       uint64
	Received   uint64
	Dropped    uint64
	Broadcasts uint64
	Queues     int
}

// NewMessage creates a new message with payload
func NewMessage(sender, receiver ServiceID, payload []byte) Message {
	return Message{
		Type:     MsgNotification,
		Sender:   sender,
		Receiver: receiver,
		Payload:  payload,
	}
}

// NewEvent creates an event message
func NewEvent(sender ServiceID, payload []byte) Message {
	return Message{
		Type:    MsgEvent,
		Sender:  sender,
		Payload: payload,
	}
}
