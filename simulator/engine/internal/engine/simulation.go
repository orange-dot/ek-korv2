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
	canNetwork *CANNetwork

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

	// Parse Redis URL and create client
	opts, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		cancel()
		return nil, err
	}
	redisClient := redis.NewClient(opts)

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
		canNetwork: NewCANNetwork(),

		ctx:    ctx,
		cancel: cancel,
	}

	// Initialize entities
	sim.initializeEntities(cfg)

	return sim, nil
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
}

// Close cleans up resources
func (s *Simulation) Close() error {
	s.Stop()
	s.canNetwork.Shutdown()
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
