// Package rtos implements JEZGRO microkernel simulation for EK3 modules.
// JEZGRO is a real-time operating system designed for safety-critical
// power electronics applications with fault isolation and hot-restart.
//
// Reference: tehnika/inzenjersko/en/16-jezgro.md
package rtos

import (
	"fmt"
	"sync"
	"time"
)

// PrivilegeLevel represents kernel privilege levels
type PrivilegeLevel int

const (
	PrivilegeKernel  PrivilegeLevel = 0 // Full hardware access
	PrivilegeDriver  PrivilegeLevel = 1 // Peripheral access
	PrivilegeService PrivilegeLevel = 2 // User-space services
)

// String returns string representation of PrivilegeLevel
func (p PrivilegeLevel) String() string {
	switch p {
	case PrivilegeKernel:
		return "kernel"
	case PrivilegeDriver:
		return "driver"
	case PrivilegeService:
		return "service"
	default:
		return "unknown"
	}
}

// ServiceID identifies system services
type ServiceID int

const (
	ServiceKernel       ServiceID = iota // Kernel (not a service, but ID 0)
	ServicePowerControl                  // P4: Power control (1 kHz)
	ServiceThermal                       // P5: Thermal management (100 Hz)
	ServiceSwarm                         // P6: Swarm/ROJ coordination (10 Hz)
	ServiceHeartbeat                     // P7: CAN heartbeat (1 Hz)
	ServiceLogger                        // P8: Background logger
	ServiceDiagnostics                   // P8: Diagnostics
	ServiceCAN                           // P3: CAN driver
	ServiceOTA                           // P8: OTA updates
	ServiceV2G                           // P4: V2G control
	ServiceCount                         // Total number of services
)

// String returns service name
func (s ServiceID) String() string {
	names := []string{
		"kernel", "power_control", "thermal", "swarm", "heartbeat",
		"logger", "diagnostics", "can", "ota", "v2g",
	}
	if int(s) < len(names) {
		return names[s]
	}
	return fmt.Sprintf("service_%d", s)
}

// ServiceState represents the lifecycle state of a service
type ServiceState int

const (
	ServiceStateInit       ServiceState = iota // Being initialized
	ServiceStateRunning                        // Normal operation
	ServiceStateSuspended                      // Temporarily suspended
	ServiceStateBlocked                        // Waiting on IPC
	ServiceStateFaulted                        // Fault detected
	ServiceStateRestarting                     // Being restarted
	ServiceStateStopped                        // Stopped
)

// String returns state name
func (s ServiceState) String() string {
	names := []string{
		"init", "running", "suspended", "blocked", "faulted", "restarting", "stopped",
	}
	if int(s) < len(names) {
		return names[s]
	}
	return "unknown"
}

// FaultType represents types of faults
type FaultType int

const (
	FaultNone           FaultType = iota
	FaultMPUViolation              // Memory protection violation
	FaultWatchdog                  // Watchdog timeout
	FaultStackOverflow             // Stack overflow
	FaultDeadlineMiss              // Deadline miss
	FaultException                 // CPU exception
	FaultAssert                    // Assertion failure
	FaultCommunication             // IPC timeout
)

// Service represents a system service/task
type Service struct {
	ID        ServiceID
	Name      string
	Privilege PrivilegeLevel
	State     ServiceState

	// Scheduling parameters
	Priority     int           // 0-15 (0 = highest, ISR only)
	Period       time.Duration // For periodic tasks
	Deadline     time.Duration // Relative deadline
	WCET         time.Duration // Worst-case execution time
	StackSize    int           // Stack size in bytes
	StackUsed    int           // Current stack usage

	// Memory region
	MemRegion *MemoryRegion

	// Runtime statistics
	ExecutionCount uint64
	TotalRuntime   time.Duration
	LastRuntime    time.Duration
	DeadlineMisses uint32
	LastRun        time.Time
	LastFault      FaultType

	// Message queue
	messageQueue chan Message
	queueSize    int

	// Handler function (simulated)
	handler func(svc *Service, dt time.Duration) error
}

// KernelConfig holds kernel configuration
type KernelConfig struct {
	// Tick rate
	TickRate time.Duration // Kernel tick period (default 100µs)

	// Watchdog
	WatchdogEnabled bool
	WatchdogTimeout time.Duration

	// Reincarnation
	MaxRestarts     int
	RestartDelay    time.Duration
	RestartBackoff  float64

	// Memory protection
	MPUEnabled bool

	// IPC
	DefaultQueueSize int
	IPCTimeout       time.Duration
}

// DefaultKernelConfig returns default configuration
func DefaultKernelConfig() KernelConfig {
	return KernelConfig{
		TickRate:         100 * time.Microsecond,
		WatchdogEnabled:  true,
		WatchdogTimeout:  10 * time.Millisecond,
		MaxRestarts:      3,
		RestartDelay:     10 * time.Millisecond,
		RestartBackoff:   2.0,
		MPUEnabled:       true,
		DefaultQueueSize: 16,
		IPCTimeout:       100 * time.Millisecond,
	}
}

// Kernel represents the JEZGRO microkernel
type Kernel struct {
	config KernelConfig
	mu     sync.RWMutex

	// Services
	services map[ServiceID]*Service

	// Sub-systems
	scheduler     *Scheduler
	mpu           *MPU
	ipc           *IPCManager
	watchdog      *WatchdogManager
	reincarnation *ReincarnationServer

	// Timing
	tickCount  uint64
	uptime     time.Duration
	simTime    time.Time
	startTime  time.Time

	// State
	running    bool
	faultCount uint32

	// ISR handlers
	isrHandlers [4]*ISRHandler // P0-P3 priorities

	// Event log
	eventLog   []KernelEvent
	maxEvents  int
}

// KernelEvent represents a logged event
type KernelEvent struct {
	Timestamp   time.Duration
	EventType   string
	ServiceID   ServiceID
	Description string
}

// NewKernel creates a new JEZGRO kernel
func NewKernel() *Kernel {
	return NewKernelWithConfig(DefaultKernelConfig())
}

// NewKernelWithConfig creates a kernel with custom configuration
func NewKernelWithConfig(config KernelConfig) *Kernel {
	k := &Kernel{
		config:    config,
		services:  make(map[ServiceID]*Service),
		startTime: time.Now(),
		simTime:   time.Now(),
		maxEvents: 1000,
	}

	// Initialize sub-systems
	k.scheduler = NewScheduler()
	k.mpu = NewMPU()
	k.ipc = NewIPCManager(config.IPCTimeout)
	k.watchdog = NewWatchdogManager(config.WatchdogTimeout)
	k.reincarnation = NewReincarnationServer(k, config.MaxRestarts, config.RestartDelay)

	return k
}

// RegisterService registers a new service with the kernel
func (k *Kernel) RegisterService(svc *Service) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	if _, exists := k.services[svc.ID]; exists {
		return fmt.Errorf("service %s already registered", svc.Name)
	}

	// Initialize service
	svc.State = ServiceStateInit
	if svc.messageQueue == nil {
		svc.queueSize = k.config.DefaultQueueSize
		svc.messageQueue = make(chan Message, svc.queueSize)
	}

	// Register with sub-systems
	k.services[svc.ID] = svc
	k.ipc.RegisterService(svc.ID, svc.messageQueue)

	if k.config.WatchdogEnabled {
		k.watchdog.Register(svc.ID, k.config.WatchdogTimeout)
	}

	k.logEvent("service_registered", svc.ID, svc.Name)
	return nil
}

// CreateService creates and registers a standard service
func (k *Kernel) CreateService(id ServiceID, name string, priority int,
	period, deadline, wcet time.Duration, handler func(*Service, time.Duration) error) *Service {

	svc := &Service{
		ID:        id,
		Name:      name,
		Privilege: PrivilegeService,
		Priority:  priority,
		Period:    period,
		Deadline:  deadline,
		WCET:      wcet,
		StackSize: 2048, // 2KB default
		handler:   handler,
	}

	k.RegisterService(svc)
	return svc
}

// Start starts the kernel
func (k *Kernel) Start() {
	k.mu.Lock()
	defer k.mu.Unlock()

	k.running = true
	k.startTime = time.Now()

	// Start all services
	for _, svc := range k.services {
		svc.State = ServiceStateRunning
		svc.LastRun = k.simTime
	}

	k.logEvent("kernel_started", ServiceKernel, "JEZGRO started")
}

// Stop stops the kernel
func (k *Kernel) Stop() {
	k.mu.Lock()
	defer k.mu.Unlock()

	k.running = false

	// Stop all services
	for _, svc := range k.services {
		svc.State = ServiceStateStopped
	}

	k.logEvent("kernel_stopped", ServiceKernel, "JEZGRO stopped")
}

// Tick advances the kernel by one time step
func (k *Kernel) Tick(dt time.Duration) {
	if !k.running {
		return
	}

	k.mu.Lock()
	defer k.mu.Unlock()

	k.tickCount++
	k.uptime += dt
	k.simTime = k.simTime.Add(dt)

	// Process ISRs first (highest priority)
	k.processISRs()

	// Run scheduler to select next task
	task := k.scheduler.Schedule(k.services, k.simTime)
	if task != nil {
		k.executeTask(task, dt)
	}

	// Check watchdogs
	if k.config.WatchdogEnabled {
		expired := k.watchdog.Check(k.simTime)
		for _, svcID := range expired {
			k.handleWatchdogExpiry(svcID)
		}
	}
}

// processISRs processes pending ISRs
func (k *Kernel) processISRs() {
	for i := 0; i < 4; i++ {
		if k.isrHandlers[i] != nil && k.isrHandlers[i].Pending {
			handler := k.isrHandlers[i]
			handler.Pending = false
			handler.ExecutionCount++

			// Simulate ISR execution time
			// In real hardware this would preempt
		}
	}
}

// executeTask runs a service task
func (k *Kernel) executeTask(svc *Service, dt time.Duration) {
	if svc.State != ServiceStateRunning {
		return
	}

	startTime := time.Now()

	// Check memory access (MPU)
	if k.config.MPUEnabled && svc.MemRegion != nil {
		if !k.mpu.CheckServiceAccess(svc) {
			k.handleFault(svc, FaultMPUViolation)
			return
		}
	}

	// Execute handler
	if svc.handler != nil {
		err := svc.handler(svc, dt)
		if err != nil {
			k.handleFault(svc, FaultException)
			return
		}
	}

	// Update statistics
	runtime := time.Since(startTime)
	svc.ExecutionCount++
	svc.TotalRuntime += runtime
	svc.LastRuntime = runtime
	svc.LastRun = k.simTime

	// Check deadline
	if svc.Deadline > 0 && runtime > svc.Deadline {
		svc.DeadlineMisses++
		k.logEvent("deadline_miss", svc.ID, fmt.Sprintf("runtime %v > deadline %v", runtime, svc.Deadline))
	}

	// Kick watchdog
	k.watchdog.Kick(svc.ID, k.simTime)
}

// handleFault handles a service fault
func (k *Kernel) handleFault(svc *Service, fault FaultType) {
	svc.State = ServiceStateFaulted
	svc.LastFault = fault
	k.faultCount++

	k.logEvent("fault", svc.ID, fmt.Sprintf("fault type: %d", fault))

	// Trigger reincarnation
	k.reincarnation.OnServiceFault(svc.ID, fault)
}

// handleWatchdogExpiry handles watchdog timeout
func (k *Kernel) handleWatchdogExpiry(svcID ServiceID) {
	svc, ok := k.services[svcID]
	if !ok {
		return
	}

	k.handleFault(svc, FaultWatchdog)
}

// RegisterISR registers an ISR handler
func (k *Kernel) RegisterISR(priority int, name string, handler func()) error {
	if priority < 0 || priority > 3 {
		return fmt.Errorf("ISR priority must be 0-3")
	}

	k.isrHandlers[priority] = &ISRHandler{
		Priority: priority,
		Name:     name,
		Handler:  handler,
	}
	return nil
}

// TriggerISR triggers an ISR
func (k *Kernel) TriggerISR(priority int) {
	if priority >= 0 && priority < 4 && k.isrHandlers[priority] != nil {
		k.isrHandlers[priority].Pending = true
	}
}

// GetService returns a service by ID
func (k *Kernel) GetService(id ServiceID) *Service {
	k.mu.RLock()
	defer k.mu.RUnlock()
	return k.services[id]
}

// SuspendService suspends a service
func (k *Kernel) SuspendService(id ServiceID) {
	k.mu.Lock()
	defer k.mu.Unlock()

	if svc, ok := k.services[id]; ok {
		svc.State = ServiceStateSuspended
		k.logEvent("service_suspended", id, "")
	}
}

// ResumeService resumes a suspended service
func (k *Kernel) ResumeService(id ServiceID) {
	k.mu.Lock()
	defer k.mu.Unlock()

	if svc, ok := k.services[id]; ok && svc.State == ServiceStateSuspended {
		svc.State = ServiceStateRunning
		k.logEvent("service_resumed", id, "")
	}
}

// RestartService restarts a faulted service
func (k *Kernel) RestartService(id ServiceID) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	svc, ok := k.services[id]
	if !ok {
		return fmt.Errorf("service %d not found", id)
	}

	svc.State = ServiceStateRestarting

	// Reset service state
	svc.LastFault = FaultNone

	// Drain message queue
	for len(svc.messageQueue) > 0 {
		<-svc.messageQueue
	}

	// Resume
	svc.State = ServiceStateRunning
	svc.LastRun = k.simTime

	k.logEvent("service_restarted", id, "")
	return nil
}

// GetUptime returns kernel uptime
func (k *Kernel) GetUptime() time.Duration {
	k.mu.RLock()
	defer k.mu.RUnlock()
	return k.uptime
}

// GetTickCount returns tick count
func (k *Kernel) GetTickCount() uint64 {
	k.mu.RLock()
	defer k.mu.RUnlock()
	return k.tickCount
}

// GetFaultCount returns total fault count
func (k *Kernel) GetFaultCount() uint32 {
	k.mu.RLock()
	defer k.mu.RUnlock()
	return k.faultCount
}

// IsRunning returns true if kernel is running
func (k *Kernel) IsRunning() bool {
	k.mu.RLock()
	defer k.mu.RUnlock()
	return k.running
}

// GetIPC returns the IPC manager
func (k *Kernel) GetIPC() *IPCManager {
	return k.ipc
}

// GetWatchdog returns the watchdog manager
func (k *Kernel) GetWatchdog() *WatchdogManager {
	return k.watchdog
}

// GetReincarnation returns the reincarnation server
func (k *Kernel) GetReincarnation() *ReincarnationServer {
	return k.reincarnation
}

// GetMPU returns the MPU
func (k *Kernel) GetMPU() *MPU {
	return k.mpu
}

// GetScheduler returns the scheduler
func (k *Kernel) GetScheduler() *Scheduler {
	return k.scheduler
}

// logEvent logs a kernel event
func (k *Kernel) logEvent(eventType string, svcID ServiceID, desc string) {
	event := KernelEvent{
		Timestamp:   k.uptime,
		EventType:   eventType,
		ServiceID:   svcID,
		Description: desc,
	}

	k.eventLog = append(k.eventLog, event)
	if len(k.eventLog) > k.maxEvents {
		k.eventLog = k.eventLog[1:]
	}
}

// GetEvents returns recent events
func (k *Kernel) GetEvents(count int) []KernelEvent {
	k.mu.RLock()
	defer k.mu.RUnlock()

	if count > len(k.eventLog) {
		count = len(k.eventLog)
	}
	start := len(k.eventLog) - count
	result := make([]KernelEvent, count)
	copy(result, k.eventLog[start:])
	return result
}

// GetServiceStats returns statistics for all services
func (k *Kernel) GetServiceStats() map[ServiceID]ServiceStats {
	k.mu.RLock()
	defer k.mu.RUnlock()

	stats := make(map[ServiceID]ServiceStats)
	for id, svc := range k.services {
		stats[id] = ServiceStats{
			Name:           svc.Name,
			State:          svc.State.String(),
			ExecutionCount: svc.ExecutionCount,
			TotalRuntime:   svc.TotalRuntime,
			DeadlineMisses: svc.DeadlineMisses,
			LastFault:      svc.LastFault,
		}
	}
	return stats
}

// ServiceStats holds service statistics
type ServiceStats struct {
	Name           string
	State          string
	ExecutionCount uint64
	TotalRuntime   time.Duration
	DeadlineMisses uint32
	LastFault      FaultType
}
