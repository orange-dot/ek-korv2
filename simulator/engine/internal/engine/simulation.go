package engine

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/elektrokombinacija/simulator/internal/models"
	"github.com/elektrokombinacija/simulator/pkg/types"
	"github.com/redis/go-redis/v9"
)

// Entity interface for all simulated entities
type Entity interface {
	ID() string
	Type() types.EntityType
	State() interface{}
	Tick(dt time.Duration)
}

// Simulation manages the entire simulation
type Simulation struct {
	mu sync.RWMutex

	// State
	running   bool
	paused    bool
	simTime   time.Time
	startTime time.Time
	tickCount int64

	// Time control
	tickRate  time.Duration
	timeScale float64

	// Entities
	entities map[string]Entity
	modules  map[string]*EK3Module
	racks    map[string]*Rack
	buses    map[string]*Bus
	stations map[string]*Station
	robots   map[string]*Robot
	grid     *Grid

	// Communication
	redis      *redis.Client
	redisSub   *redis.Client // Separate client for subscriptions
	canNetwork *CANNetwork

	// Metrics tracking
	metrics         types.SimulationMetrics
	totalEnergyWs   float64 // Cumulative energy in Watt-seconds
	totalLossWs     float64 // Cumulative losses in Watt-seconds
	faultHistory    []time.Time
	v2gEnergyWs     float64 // V2G energy exported
	gridFreqMin     float64
	gridFreqMax     float64

	// Context for shutdown
	ctx    context.Context
	cancel context.CancelFunc
}

// Config holds simulation configuration
type Config struct {
	TickRate   time.Duration
	TimeScale  float64
	RedisURL   string

	// Initial entity counts
	ModuleCount  int
	RackCount    int
	BusCount     int
	StationCount int
}

// DefaultConfig returns default simulation config
func DefaultConfig() Config {
	return Config{
		TickRate:     100 * time.Millisecond,
		TimeScale:    1.0,
		RedisURL:     "redis://localhost:6379",
		ModuleCount:  84, // 1 rack worth
		RackCount:    1,
		BusCount:     10,
		StationCount: 2,
	}
}

// NewSimulation creates a new simulation instance
func NewSimulation(cfg Config) (*Simulation, error) {
	ctx, cancel := context.WithCancel(context.Background())

	// Parse Redis URL and create clients
	opts, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		cancel()
		return nil, err
	}
	redisClient := redis.NewClient(opts)
	redisSubClient := redis.NewClient(opts) // Separate client for subscriptions

	// Test Redis connection
	if err := redisClient.Ping(ctx).Err(); err != nil {
		cancel()
		return nil, err
	}

	sim := &Simulation{
		running:   false,
		paused:    false,
		simTime:   time.Now(),
		tickRate:  cfg.TickRate,
		timeScale: cfg.TimeScale,

		entities: make(map[string]Entity),
		modules:  make(map[string]*EK3Module),
		racks:    make(map[string]*Rack),
		buses:    make(map[string]*Bus),
		stations: make(map[string]*Station),
		robots:   make(map[string]*Robot),

		redis:      redisClient,
		redisSub:   redisSubClient,
		canNetwork: NewCANNetwork(),

		// Initialize metrics tracking
		faultHistory: make([]time.Time, 0),
		gridFreqMin:  50.0, // Nominal
		gridFreqMax:  50.0,

		ctx:    ctx,
		cancel: cancel,
	}

	// Initialize entities
	sim.initializeEntities(cfg)

	// Start control command listener
	go sim.subscribeControl()

	return sim, nil
}

// subscribeControl listens for control commands from the API
func (s *Simulation) subscribeControl() {
	pubsub := s.redisSub.Subscribe(s.ctx, types.EventControl)
	defer pubsub.Close()

	log.Println("Subscribed to control channel:", types.EventControl)

	ch := pubsub.Channel()
	for {
		select {
		case <-s.ctx.Done():
			return
		case msg := <-ch:
			if msg == nil {
				continue
			}
			s.handleControlCommand(msg.Payload)
		}
	}
}

// handleControlCommand processes a control command from the API
func (s *Simulation) handleControlCommand(payload string) {
	var cmd types.ControlCommand
	if err := json.Unmarshal([]byte(payload), &cmd); err != nil {
		log.Printf("Failed to parse control command: %v", err)
		return
	}

	log.Printf("Received control command: %s", cmd.Action)

	switch cmd.Action {
	case "start":
		s.Start()
	case "stop":
		s.Stop()
	case "pause":
		s.Pause()
	case "resume":
		s.Resume()
	case "setTimeScale":
		s.SetTimeScale(cmd.Value)
	case "injectFault":
		if cmd.ModuleID != "" {
			s.InjectModuleFault(cmd.ModuleID, cmd.FaultType, cmd.Severity)
		}
	case "setModulePower":
		if cmd.ModuleID != "" {
			s.SetModulePower(cmd.ModuleID, cmd.Power)
		}
	case "distributeRackPower":
		if cmd.RackID != "" {
			s.DistributeRackPower(cmd.RackID, cmd.Power)
		}
	case "queueBusForSwap":
		if cmd.BusID != "" && cmd.StationID != "" {
			s.QueueBusForSwap(cmd.BusID, cmd.StationID)
		}
	case "triggerV2G":
		s.TriggerV2GResponse(cmd.Frequency)
	default:
		log.Printf("Unknown control command: %s", cmd.Action)
	}
}

// initializeEntities creates initial simulation entities
func (s *Simulation) initializeEntities(cfg Config) {
	// Create grid
	s.grid = NewGrid()
	s.entities["grid"] = s.grid

	// Create stations
	stationPositions := []types.Position{
		{Lat: 44.8176, Lng: 20.4633}, // Belgrade depot
		{Lat: 44.8066, Lng: 20.4489}, // Belgrade center
	}
	for i := 0; i < cfg.StationCount && i < len(stationPositions); i++ {
		station := NewStation(i, stationPositions[i])
		s.stations[station.ID()] = station
		s.entities[station.ID()] = station

		// Create robots for each station
		robotA := NewRobot(station.ID(), types.RobotTypeBattery)
		robotB := NewRobot(station.ID(), types.RobotTypeModule)
		// Set partner robots for coordination
		robotA.SetPartner(robotB)
		robotB.SetPartner(robotA)

		s.robots[robotA.ID()] = robotA
		s.robots[robotB.ID()] = robotB
		s.entities[robotA.ID()] = robotA
		s.entities[robotB.ID()] = robotB
	}

	// Create racks (at first station)
	for i := 0; i < cfg.RackCount; i++ {
		var stationID string
		for id := range s.stations {
			stationID = id
			break
		}
		rack := NewRack(i, stationID)
		s.racks[rack.ID()] = rack
		s.entities[rack.ID()] = rack

		// Create CAN bus for this rack
		canBus := s.canNetwork.CreateBus(rack.ID())

		// Create modules (in this rack)
		for slot := 0; slot < 84 && len(s.modules) < cfg.ModuleCount; slot++ {
			module := NewEK3Module(len(s.modules), rack.ID(), slot)
			s.modules[module.ID()] = module
			s.entities[module.ID()] = module

			// Add module to rack
			rack.AddModule(module)

			// Register module on CAN bus
			canBus.RegisterNode(module)
			s.canNetwork.router.RegisterNode(module.ID(), rack.ID())

			// Register some modules for V2G (first 10 per rack)
			if slot < 10 {
				s.grid.RegisterV2GModule(module)
			}
		}
	}

	// Create buses
	for i := 0; i < cfg.BusCount; i++ {
		bus := NewBus(i)
		s.buses[bus.ID()] = bus
		s.entities[bus.ID()] = bus
	}

	log.Printf("Initialized simulation with %d modules, %d racks, %d buses, %d stations, %d V2G modules",
		len(s.modules), len(s.racks), len(s.buses), len(s.stations), 10*len(s.racks))
}

// Start begins the simulation
func (s *Simulation) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.paused = false
	s.startTime = time.Now()
	s.simTime = time.Now()
	s.mu.Unlock()

	go s.run()
	log.Println("Simulation started")
}

// run is the main simulation loop
func (s *Simulation) run() {
	ticker := time.NewTicker(s.tickRate)
	defer ticker.Stop()

	for {
		select {
		case <-s.ctx.Done():
			return
		case <-ticker.C:
			s.mu.Lock()
			if !s.running || s.paused {
				s.mu.Unlock()
				continue
			}

			// Calculate delta time with time scale
			dt := time.Duration(float64(s.tickRate) * s.timeScale)
			s.simTime = s.simTime.Add(dt)
			s.tickCount++

			// Update all entities in parallel
			var wg sync.WaitGroup
			for _, entity := range s.entities {
				wg.Add(1)
				go func(e Entity) {
					defer wg.Done()
					e.Tick(dt)
				}(entity)
			}
			s.mu.Unlock()

			wg.Wait()

			// Update metrics after entity tick
			s.mu.Lock()
			s.updateMetrics(dt)
			s.mu.Unlock()

			// Publish state to Redis (every tick)
			s.publishState()
		}
	}
}

// Pause pauses the simulation
func (s *Simulation) Pause() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = true
	log.Println("Simulation paused")
}

// Resume resumes the simulation
func (s *Simulation) Resume() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = false
	log.Println("Simulation resumed")
}

// Stop stops the simulation
func (s *Simulation) Stop() {
	s.mu.Lock()
	s.running = false
	s.mu.Unlock()
	s.cancel()
	log.Println("Simulation stopped")
}

// SetTimeScale changes the simulation speed
func (s *Simulation) SetTimeScale(scale float64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if scale < 0.1 {
		scale = 0.1
	}
	if scale > 1000 {
		scale = 1000
	}
	s.timeScale = scale
	log.Printf("Time scale set to %.1fx", scale)
}

// GetState returns the current simulation state
func (s *Simulation) GetState() types.SimulationState {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Calculate aggregates
	var totalPower, totalEfficiency float64
	var avgSOC float64
	var activeCharging int

	for _, m := range s.modules {
		totalPower += m.data.PowerOut
		totalEfficiency += m.data.Efficiency
	}
	if len(s.modules) > 0 {
		totalEfficiency /= float64(len(s.modules))
	}

	for _, b := range s.buses {
		avgSOC += b.data.BatterySOC
		if b.data.State == types.BusStateCharging {
			activeCharging++
		}
	}
	if len(s.buses) > 0 {
		avgSOC /= float64(len(s.buses))
	}

	return types.SimulationState{
		Running:        s.running,
		Paused:         s.paused,
		SimTime:        s.simTime,
		RealTime:       time.Now(),
		TimeScale:      s.timeScale,
		TickCount:      s.tickCount,
		ModuleCount:    len(s.modules),
		RackCount:      len(s.racks),
		BusCount:       len(s.buses),
		StationCount:   len(s.stations),
		TotalPower:     totalPower,
		AvgEfficiency:  totalEfficiency,
		AvgBatterySOC:  avgSOC,
		ActiveCharging: activeCharging,
	}
}

// GetModules returns all modules
func (s *Simulation) GetModules() []types.Module {
	s.mu.RLock()
	defer s.mu.RUnlock()

	modules := make([]types.Module, 0, len(s.modules))
	for _, m := range s.modules {
		modules = append(modules, m.data)
	}
	return modules
}

// GetModule returns a specific module
func (s *Simulation) GetModule(id string) (types.Module, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	if m, ok := s.modules[id]; ok {
		return m.data, true
	}
	return types.Module{}, false
}

// GetBuses returns all buses
func (s *Simulation) GetBuses() []types.Bus {
	s.mu.RLock()
	defer s.mu.RUnlock()

	buses := make([]types.Bus, 0, len(s.buses))
	for _, b := range s.buses {
		buses = append(buses, b.data)
	}
	return buses
}

// GetStations returns all stations
func (s *Simulation) GetStations() []types.Station {
	s.mu.RLock()
	defer s.mu.RUnlock()

	stations := make([]types.Station, 0, len(s.stations))
	for _, st := range s.stations {
		stations = append(stations, st.data)
	}
	return stations
}

// publishState publishes current state to Redis
func (s *Simulation) publishState() {
	ctx := context.Background()

	// Publish simulation state
	state := s.GetState()
	stateJSON, _ := json.Marshal(state)
	s.redis.Publish(ctx, types.EventSimState, stateJSON)

	// Publish module states (batched)
	modules := s.GetModules()
	modulesJSON, _ := json.Marshal(modules)
	s.redis.Publish(ctx, types.EventModuleState, modulesJSON)

	// Publish bus states
	buses := s.GetBuses()
	busesJSON, _ := json.Marshal(buses)
	s.redis.Publish(ctx, types.EventBusState, busesJSON)

	// Publish station states
	stations := s.GetStations()
	stationsJSON, _ := json.Marshal(stations)
	s.redis.Publish(ctx, types.EventStationState, stationsJSON)

	// Publish grid state (for V2G visualization)
	gridState := s.GetGrid()
	gridJSON, _ := json.Marshal(gridState)
	s.redis.Publish(ctx, types.EventGridState, gridJSON)

	// Publish metrics (every 10th tick to reduce traffic)
	if s.tickCount%10 == 0 {
		metrics := s.GetMetrics()
		metricsJSON, _ := json.Marshal(metrics)
		s.redis.Publish(ctx, types.EventMetrics, metricsJSON)
	}
}

// Close cleans up resources
func (s *Simulation) Close() error {
	s.Stop()
	s.canNetwork.Shutdown()
	s.redisSub.Close()
	return s.redis.Close()
}

// GetGrid returns the grid model
func (s *Simulation) GetGrid() types.Grid {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.grid.data
}

// GetRacks returns all racks
func (s *Simulation) GetRacks() []types.Rack {
	s.mu.RLock()
	defer s.mu.RUnlock()

	racks := make([]types.Rack, 0, len(s.racks))
	for _, r := range s.racks {
		racks = append(racks, r.data)
	}
	return racks
}

// GetRobots returns all robots
func (s *Simulation) GetRobots() []types.Robot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	robots := make([]types.Robot, 0, len(s.robots))
	for _, r := range s.robots {
		robots = append(robots, r.data)
	}
	return robots
}

// SendCANMessage sends a CAN message on the specified bus
func (s *Simulation) SendCANMessage(busID string, msg types.CANMessage) {
	if bus := s.canNetwork.GetBus(busID); bus != nil {
		bus.SendMessage(msg)
	}
}

// InjectModuleFault injects a fault into a specific module
func (s *Simulation) InjectModuleFault(moduleID string, faultType int, severity float64) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if module, ok := s.modules[moduleID]; ok {
		module.InjectFault(models.FaultType(faultType), severity)
		return true
	}
	return false
}

// SetModulePower sets target power for a specific module
func (s *Simulation) SetModulePower(moduleID string, power float64) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if module, ok := s.modules[moduleID]; ok {
		module.SetTargetPower(power)
		return true
	}
	return false
}

// DistributeRackPower distributes power across a rack using wide striping
func (s *Simulation) DistributeRackPower(rackID string, targetPower float64) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if rack, ok := s.racks[rackID]; ok {
		rack.DistributePower(targetPower)
		return true
	}
	return false
}

// QueueBusForSwap queues a bus for battery swap at a station
func (s *Simulation) QueueBusForSwap(busID, stationID string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	bus, busOk := s.buses[busID]
	station, stationOk := s.stations[stationID]

	if busOk && stationOk {
		station.QueueBus(busID, bus)
		return true
	}
	return false
}

// TriggerV2GResponse triggers a V2G response by setting grid frequency
func (s *Simulation) TriggerV2GResponse(frequency float64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.grid != nil {
		s.grid.SetFrequency(frequency)
		log.Printf("V2G triggered: grid frequency set to %.2f Hz", frequency)
	}
}

// GetMetrics returns aggregated simulation metrics for demo/pitch
func (s *Simulation) GetMetrics() types.SimulationMetrics {
	s.mu.RLock()
	defer s.mu.RUnlock()

	m := types.SimulationMetrics{}

	// Time metrics
	if s.running {
		m.SimulatedHours = s.simTime.Sub(s.startTime).Hours()
		m.RealTimeSeconds = time.Since(s.startTime).Seconds()
	}

	// Module metrics
	var totalEfficiency, peakEfficiency float64
	var faultedCount, healthyCount int
	var totalPower, totalTemp float64
	var minTemp, maxTemp float64 = 1000, 0

	for _, mod := range s.modules {
		data := mod.GetData()
		totalEfficiency += data.Efficiency
		if data.Efficiency > peakEfficiency {
			peakEfficiency = data.Efficiency
		}
		totalPower += data.PowerOut

		if data.State == types.ModuleStateFaulted {
			faultedCount++
		} else {
			healthyCount++
		}

		totalTemp += data.TempJunction
		if data.TempJunction < minTemp {
			minTemp = data.TempJunction
		}
		if data.TempJunction > maxTemp {
			maxTemp = data.TempJunction
		}
	}

	moduleCount := len(s.modules)
	if moduleCount > 0 {
		m.AvgEfficiency = (totalEfficiency / float64(moduleCount)) * 100
		m.PeakEfficiency = peakEfficiency * 100
		m.ModuleUptime = float64(healthyCount) / float64(moduleCount) * 100
		m.ThermalBalance = maxTemp - minTemp // Temperature spread
	}

	// System uptime (based on rack availability)
	rackCount := len(s.racks)
	activeRacks := 0
	for _, rack := range s.racks {
		if rack.data.State == types.RackStateActive || rack.data.State == types.RackStateDegraded {
			activeRacks++
		}
	}
	if rackCount > 0 {
		m.SystemUptime = float64(activeRacks) / float64(rackCount) * 100
	}

	// Fault metrics
	m.FaultsDetected = s.metrics.FaultsDetected
	m.FaultsRecovered = s.metrics.FaultsRecovered
	m.ModulesReplaced = s.metrics.ModulesReplaced

	// Calculate MTBF/MTTR
	if len(s.faultHistory) > 1 && m.SimulatedHours > 0 {
		m.MTBFHours = m.SimulatedHours / float64(len(s.faultHistory))
	} else {
		m.MTBFHours = m.SimulatedHours // No failures = uptime
	}
	m.MTTRMinutes = 2.0 // Module hot-swap takes ~2 minutes

	// Energy metrics
	m.TotalEnergyKWh = s.totalEnergyWs / 3600000 // Ws to kWh
	m.EnergyLossKWh = s.totalLossWs / 3600000

	// Cost savings calculation
	// Traditional system downtime: ~4 hours per failure
	// Our system: ~2 minutes per module swap
	traditionalDowntimeMin := float64(m.FaultsDetected) * 240 // 4 hours
	ourDowntimeMin := float64(m.ModulesReplaced) * 2          // 2 minutes
	m.DowntimeMinutes = ourDowntimeMin
	m.DowntimeAvoided = traditionalDowntimeMin - ourDowntimeMin

	// Cost savings: $500/hour downtime + $5000 per emergency repair avoided
	m.CostSavingsUSD = (m.DowntimeAvoided / 60 * 500) + float64(m.FaultsRecovered)*5000

	// Fleet metrics
	var totalSOC float64
	for _, bus := range s.buses {
		totalSOC += bus.data.BatterySOC
	}
	if len(s.buses) > 0 {
		m.FleetSOC = totalSOC / float64(len(s.buses))
	}
	m.BusesCharged = s.metrics.BusesCharged
	m.SwapsCompleted = s.metrics.SwapsCompleted
	m.AvgChargeTimeMin = 45  // Typical fast charge
	m.AvgSwapTimeSec = 120   // 2-minute swap

	// V2G metrics
	m.V2GEventsCount = s.metrics.V2GEventsCount
	m.V2GEnergyKWh = s.v2gEnergyWs / 3600000
	m.V2GRevenueUSD = m.V2GEnergyKWh * 0.15 // $0.15/kWh grid services
	m.GridFreqMin = s.gridFreqMin
	m.GridFreqMax = s.gridFreqMax

	// Swarm intelligence metrics
	// Load balance: std deviation of power across modules (lower = better)
	if moduleCount > 0 {
		avgPower := totalPower / float64(moduleCount)
		var variance float64
		for _, mod := range s.modules {
			diff := mod.GetData().PowerOut - avgPower
			variance += diff * diff
		}
		stdDev := variance / float64(moduleCount)
		// Convert to 0-100 score (100 = perfect balance)
		m.LoadBalanceScore = 100 - (stdDev / 3600 * 100) // Normalize by max power
		if m.LoadBalanceScore < 0 {
			m.LoadBalanceScore = 0
		}
	}

	// Redundancy: spare capacity
	maxCapacity := float64(moduleCount) * 3600 // All modules at full power
	if maxCapacity > 0 {
		m.RedundancyLevel = (maxCapacity - totalPower) / maxCapacity * 100
	}

	return m
}

// updateMetrics updates cumulative metrics each tick
func (s *Simulation) updateMetrics(dt time.Duration) {
	dtSeconds := dt.Seconds()

	// Energy tracking
	for _, mod := range s.modules {
		data := mod.GetData()
		// Energy = Power × Time
		s.totalEnergyWs += data.PowerOut * dtSeconds
		// Losses based on efficiency
		if data.Efficiency > 0 {
			lossRatio := 1 - data.Efficiency
			s.totalLossWs += data.PowerOut * lossRatio * dtSeconds
		}
	}

	// V2G energy tracking
	if s.grid != nil {
		gridData := s.grid.data
		if gridData.V2GPower < 0 { // Exporting to grid
			s.v2gEnergyWs += (-gridData.V2GPower) * dtSeconds
			s.metrics.V2GEventsCount++
		}

		// Track frequency range
		if s.gridFreqMin == 0 || gridData.Frequency < s.gridFreqMin {
			s.gridFreqMin = gridData.Frequency
		}
		if gridData.Frequency > s.gridFreqMax {
			s.gridFreqMax = gridData.Frequency
		}
	}

	// Fault tracking
	for _, mod := range s.modules {
		data := mod.GetData()
		if data.State == types.ModuleStateFaulted {
			// Check if this is a new fault
			if !mod.faultTracked {
				s.metrics.FaultsDetected++
				s.faultHistory = append(s.faultHistory, s.simTime)
				mod.faultTracked = true
			}
		} else if data.State == types.ModuleStateMarkedForReplace {
			// Module recovered from fault
			if mod.faultTracked {
				s.metrics.FaultsRecovered++
				s.metrics.ModulesReplaced++
				mod.faultTracked = false
			}
		}
	}

	// Station/swap tracking
	for _, station := range s.stations {
		if station.workflowPhase == PhaseVerification && station.phaseProgress >= 100 {
			s.metrics.SwapsCompleted++
			s.metrics.BusesCharged++
		}
	}
}
