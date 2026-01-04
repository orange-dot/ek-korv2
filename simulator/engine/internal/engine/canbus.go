package engine

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/elektrokombinacija/simulator/pkg/types"
)

// CANBus simulates CAN-FD communication bus
// Each rack has its own CAN bus connecting 84 modules
type CANBus struct {
	mu sync.RWMutex

	id        string
	bitRate   int // 5 Mbps for CAN-FD
	maxNodes  int
	busLoad   float64 // 0-1

	// Message channels
	txChannel chan types.CANMessage
	rxQueues  map[string]chan types.CANMessage

	// Registered nodes
	nodes map[string]CANNode

	// Statistics
	messageCount   int64
	errorCount     int64
	lastMessageAt  time.Time

	// Control
	ctx    context.Context
	cancel context.CancelFunc
}

// CANNode interface for CAN bus participants
type CANNode interface {
	ID() string
	HandleMessage(msg types.CANMessage)
}

// NewCANBus creates a new CAN-FD bus
func NewCANBus(id string) *CANBus {
	ctx, cancel := context.WithCancel(context.Background())

	return &CANBus{
		id:         id,
		bitRate:    5000000, // 5 Mbps CAN-FD
		maxNodes:   127,     // CAN max nodes
		txChannel:  make(chan types.CANMessage, 1000),
		rxQueues:   make(map[string]chan types.CANMessage),
		nodes:      make(map[string]CANNode),
		ctx:        ctx,
		cancel:     cancel,
	}
}

// Start starts the CAN bus message router
func (bus *CANBus) Start() {
	go bus.messageRouter()
}

// Stop stops the CAN bus
func (bus *CANBus) Stop() {
	bus.cancel()
}

// RegisterNode registers a node on the bus
func (bus *CANBus) RegisterNode(node CANNode) error {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	if len(bus.nodes) >= bus.maxNodes {
		return fmt.Errorf("bus %s full: max %d nodes", bus.id, bus.maxNodes)
	}

	nodeID := node.ID()
	bus.nodes[nodeID] = node
	bus.rxQueues[nodeID] = make(chan types.CANMessage, 100)

	return nil
}

// UnregisterNode removes a node from the bus
func (bus *CANBus) UnregisterNode(nodeID string) {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	if ch, ok := bus.rxQueues[nodeID]; ok {
		close(ch)
		delete(bus.rxQueues, nodeID)
	}
	delete(bus.nodes, nodeID)
}

// SendMessage sends a message on the bus
func (bus *CANBus) SendMessage(msg types.CANMessage) {
	select {
	case bus.txChannel <- msg:
		bus.mu.Lock()
		bus.messageCount++
		bus.lastMessageAt = time.Now()
		bus.mu.Unlock()
	default:
		bus.mu.Lock()
		bus.errorCount++
		bus.mu.Unlock()
	}
}

// messageRouter routes messages to registered nodes
func (bus *CANBus) messageRouter() {
	for {
		select {
		case <-bus.ctx.Done():
			return

		case msg := <-bus.txChannel:
			bus.routeMessage(msg)
		}
	}
}

// routeMessage routes a message to target(s)
func (bus *CANBus) routeMessage(msg types.CANMessage) {
	bus.mu.RLock()
	defer bus.mu.RUnlock()

	// Simulate propagation delay (very small for CAN-FD)
	time.Sleep(time.Microsecond * 10)

	// Route based on target ID
	if msg.TargetID == "broadcast" {
		// Broadcast to all nodes
		for nodeID, queue := range bus.rxQueues {
			if nodeID != msg.SourceID {
				select {
				case queue <- msg:
				default:
					// Queue full, message lost
				}
			}
		}
	} else {
		// Unicast to specific node
		if queue, ok := bus.rxQueues[msg.TargetID]; ok {
			select {
			case queue <- msg:
			default:
				// Queue full
			}
		}
	}

	// Deliver to node handlers
	for nodeID, node := range bus.nodes {
		if nodeID == msg.TargetID || msg.TargetID == "broadcast" {
			if nodeID != msg.SourceID {
				go node.HandleMessage(msg)
			}
		}
	}
}

// GetStats returns bus statistics
func (bus *CANBus) GetStats() CANBusStats {
	bus.mu.RLock()
	defer bus.mu.RUnlock()

	return CANBusStats{
		ID:            bus.id,
		NodeCount:     len(bus.nodes),
		MessageCount:  bus.messageCount,
		ErrorCount:    bus.errorCount,
		BusLoad:       bus.busLoad,
		LastMessageAt: bus.lastMessageAt,
	}
}

// UpdateBusLoad calculates bus load based on message rate
func (bus *CANBus) UpdateBusLoad(dt time.Duration) {
	bus.mu.Lock()
	defer bus.mu.Unlock()

	// Messages per second (assume 64 byte CAN-FD frames)
	// At 5 Mbps, max ~9765 frames/sec
	maxFramesPerSec := 9765.0
	messagesPerSec := float64(bus.messageCount) / dt.Seconds()

	// Reset counter
	bus.messageCount = 0

	// Update bus load (exponential smoothing)
	alpha := 0.1
	newLoad := messagesPerSec / maxFramesPerSec
	bus.busLoad = bus.busLoad*(1-alpha) + newLoad*alpha
}

// CANBusStats holds bus statistics
type CANBusStats struct {
	ID            string
	NodeCount     int
	MessageCount  int64
	ErrorCount    int64
	BusLoad       float64
	LastMessageAt time.Time
}

// ============================================================================
// CAN Message Types
// ============================================================================

// Standard CAN message types for EK system
const (
	// Module control messages
	CANMsgSetPower       = "SetPower"
	CANMsgSetVoltage     = "SetVoltage"
	CANMsgEmergencyStop  = "EmergencyStop"
	CANMsgReset          = "Reset"
	CANMsgGetStatus      = "GetStatus"

	// Status response messages
	CANMsgStatusResponse = "StatusResponse"
	CANMsgFaultReport    = "FaultReport"
	CANMsgHealthReport   = "HealthReport"

	// Rack-level messages
	CANMsgDistributePower = "DistributePower"
	CANMsgModuleFailure   = "ModuleFailure"
	CANMsgSparingActivate = "SparingActivate"

	// V2G messages
	CANMsgV2GEnable      = "V2GEnable"
	CANMsgV2GDisable     = "V2GDisable"
	CANMsgV2GSetpoint    = "V2GSetpoint"
	CANMsgGridFrequency  = "GridFrequency"

	// Station messages
	CANMsgSwapStart      = "SwapStart"
	CANMsgSwapComplete   = "SwapComplete"
	CANMsgRobotCommand   = "RobotCommand"
)

// CreateSetPowerMessage creates a SetPower CAN message
func CreateSetPowerMessage(sourceID, targetID string, power float64) types.CANMessage {
	return types.CANMessage{
		ID:          uint32(time.Now().UnixNano() & 0xFFFFFFFF),
		SourceID:    sourceID,
		TargetID:    targetID,
		MessageType: CANMsgSetPower,
		Priority:    2, // Normal priority
		Timestamp:   time.Now(),
		Payload: map[string]interface{}{
			"power": power,
		},
	}
}

// CreateStatusResponseMessage creates a status response
func CreateStatusResponseMessage(sourceID, targetID string, status interface{}) types.CANMessage {
	return types.CANMessage{
		ID:          uint32(time.Now().UnixNano() & 0xFFFFFFFF),
		SourceID:    sourceID,
		TargetID:    targetID,
		MessageType: CANMsgStatusResponse,
		Priority:    3, // Low priority
		Timestamp:   time.Now(),
		Payload: map[string]interface{}{
			"status": status,
		},
	}
}

// CreateEmergencyStopMessage creates an emergency stop (high priority broadcast)
func CreateEmergencyStopMessage(sourceID string) types.CANMessage {
	return types.CANMessage{
		ID:          uint32(time.Now().UnixNano() & 0xFFFFFFFF),
		SourceID:    sourceID,
		TargetID:    "broadcast",
		MessageType: CANMsgEmergencyStop,
		Priority:    0, // Highest priority
		Timestamp:   time.Now(),
		Payload:     map[string]interface{}{},
	}
}

// CreateFaultReportMessage creates a fault report
func CreateFaultReportMessage(sourceID string, faultType string, severity float64) types.CANMessage {
	return types.CANMessage{
		ID:          uint32(time.Now().UnixNano() & 0xFFFFFFFF),
		SourceID:    sourceID,
		TargetID:    "broadcast", // Broadcast to all for fault awareness
		MessageType: CANMsgFaultReport,
		Priority:    1, // High priority
		Timestamp:   time.Now(),
		Payload: map[string]interface{}{
			"fault_type": faultType,
			"severity":   severity,
		},
	}
}

// CreateV2GSetpointMessage creates a V2G power setpoint message
func CreateV2GSetpointMessage(sourceID, targetID string, power float64, direction string) types.CANMessage {
	return types.CANMessage{
		ID:          uint32(time.Now().UnixNano() & 0xFFFFFFFF),
		SourceID:    sourceID,
		TargetID:    targetID,
		MessageType: CANMsgV2GSetpoint,
		Priority:    2,
		Timestamp:   time.Now(),
		Payload: map[string]interface{}{
			"power":     power,
			"direction": direction, // "charge" or "discharge"
		},
	}
}

// ============================================================================
// CAN Bus Network Manager
// ============================================================================

// CANNetwork manages multiple CAN buses
type CANNetwork struct {
	mu     sync.RWMutex
	buses  map[string]*CANBus
	router *NetworkRouter
}

// NewCANNetwork creates a new CAN network
func NewCANNetwork() *CANNetwork {
	return &CANNetwork{
		buses:  make(map[string]*CANBus),
		router: NewNetworkRouter(),
	}
}

// CreateBus creates a new CAN bus in the network
func (net *CANNetwork) CreateBus(id string) *CANBus {
	net.mu.Lock()
	defer net.mu.Unlock()

	bus := NewCANBus(id)
	net.buses[id] = bus
	bus.Start()

	return bus
}

// GetBus returns a bus by ID
func (net *CANNetwork) GetBus(id string) *CANBus {
	net.mu.RLock()
	defer net.mu.RUnlock()
	return net.buses[id]
}

// SendInterBusMessage sends a message between buses via router
func (net *CANNetwork) SendInterBusMessage(msg types.CANMessage, sourceBusID, targetBusID string) {
	net.router.Route(msg, sourceBusID, targetBusID, net.buses)
}

// Shutdown shuts down all buses
func (net *CANNetwork) Shutdown() {
	net.mu.Lock()
	defer net.mu.Unlock()

	for _, bus := range net.buses {
		bus.Stop()
	}
}

// NetworkRouter routes messages between CAN buses
type NetworkRouter struct {
	routeTable map[string]string // nodeID -> busID
	mu         sync.RWMutex
}

// NewNetworkRouter creates a new router
func NewNetworkRouter() *NetworkRouter {
	return &NetworkRouter{
		routeTable: make(map[string]string),
	}
}

// RegisterNode registers a node's bus in the route table
func (r *NetworkRouter) RegisterNode(nodeID, busID string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.routeTable[nodeID] = busID
}

// Route routes a message between buses
func (r *NetworkRouter) Route(msg types.CANMessage, sourceBusID, targetBusID string, buses map[string]*CANBus) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	if targetBus, ok := buses[targetBusID]; ok {
		targetBus.SendMessage(msg)
	}
}

// FindBus finds which bus a node is on
func (r *NetworkRouter) FindBus(nodeID string) string {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.routeTable[nodeID]
}
