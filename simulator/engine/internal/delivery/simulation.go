// Package delivery implements the LA Delivery fleet simulation
// with drones, pods, swarm bots, and KOR AI orchestration.
package delivery

import (
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/elektrokombinacija/simulator/pkg/types"
)

// DeliverySimulation manages the entire delivery fleet simulation
type DeliverySimulation struct {
	mu sync.RWMutex

	// Entities
	drones    map[string]*DroneEntity
	pods      map[string]*PodEntity
	swarmBots map[string]*SwarmBotEntity
	hubs      map[string]*HubEntity
	packages  map[string]*types.Package

	// Routes and zones
	corridors map[string]*types.DroneCorridor
	routes    map[string]*types.PodRoute
	zones     map[string]*types.SwarmZone

	// KOR orchestrator
	kor *KOROrchestrator

	// State
	running   bool
	paused    bool
	simTime   time.Time
	timeScale float64
	tickCount uint64

	// Metrics
	metrics types.DeliveryMetrics

	// Configuration
	config DeliveryConfig
}

// DeliveryConfig holds simulation configuration
type DeliveryConfig struct {
	NumDrones       int
	NumPods         int
	NumSwarmBots    int
	NumRooftopHubs  int
	NumStreetHubs   int
	PackageSpawnRate float64 // packages per minute
}

// DefaultDeliveryConfig returns default configuration
func DefaultDeliveryConfig() DeliveryConfig {
	return DeliveryConfig{
		NumDrones:        12,
		NumPods:          8,
		NumSwarmBots:     24,
		NumRooftopHubs:   4,
		NumStreetHubs:    6,
		PackageSpawnRate: 2.0, // 2 packages per minute
	}
}

// NewDeliverySimulation creates a new delivery simulation
func NewDeliverySimulation(config DeliveryConfig) *DeliverySimulation {
	sim := &DeliverySimulation{
		drones:    make(map[string]*DroneEntity),
		pods:      make(map[string]*PodEntity),
		swarmBots: make(map[string]*SwarmBotEntity),
		hubs:      make(map[string]*HubEntity),
		packages:  make(map[string]*types.Package),
		corridors: make(map[string]*types.DroneCorridor),
		routes:    make(map[string]*types.PodRoute),
		zones:     make(map[string]*types.SwarmZone),
		simTime:   time.Now(),
		timeScale: 1.0,
		config:    config,
	}

	// Initialize KOR orchestrator
	sim.kor = NewKOROrchestrator(sim)

	// Initialize entities
	sim.initializeEntities()

	return sim
}

// initializeEntities creates initial fleet
func (s *DeliverySimulation) initializeEntities() {
	// LA center coordinates
	laCenter := types.Position{Lat: 34.0522, Lng: -118.2437}

	// Create rooftop hubs (for drones)
	rooftopPositions := []types.Position{
		{Lat: 34.0522, Lng: -118.2437}, // DTLA
		{Lat: 34.0195, Lng: -118.4912}, // Santa Monica
		{Lat: 34.1478, Lng: -118.1445}, // Pasadena
		{Lat: 33.9425, Lng: -118.4081}, // LAX area
	}
	for i := 0; i < min(s.config.NumRooftopHubs, len(rooftopPositions)); i++ {
		hub := NewHubEntity(fmt.Sprintf("rooftop-%d", i+1), types.HubTypeRooftop, rooftopPositions[i])
		s.hubs[hub.ID] = hub
	}

	// Create street hubs (for pods and swarm bots)
	streetPositions := []types.Position{
		{Lat: 34.0407, Lng: -118.2468}, // Arts District
		{Lat: 34.0259, Lng: -118.2806}, // USC
		{Lat: 34.0689, Lng: -118.4452}, // Beverly Hills
		{Lat: 34.0211, Lng: -118.3965}, // Culver City
		{Lat: 34.1808, Lng: -118.3090}, // Burbank
		{Lat: 33.9850, Lng: -118.4695}, // Marina del Rey
	}
	for i := 0; i < min(s.config.NumStreetHubs, len(streetPositions)); i++ {
		hub := NewHubEntity(fmt.Sprintf("street-%d", i+1), types.HubTypeStreet, streetPositions[i])
		s.hubs[hub.ID] = hub
	}

	// Create drone corridors
	s.createCorridors()

	// Create pod routes
	s.createRoutes()

	// Create swarm zones
	s.createZones()

	// Create drones at rooftop hubs
	hubIDs := make([]string, 0)
	for id, hub := range s.hubs {
		if hub.data.Type == types.HubTypeRooftop {
			hubIDs = append(hubIDs, id)
		}
	}
	for i := 0; i < s.config.NumDrones; i++ {
		hubID := hubIDs[i%len(hubIDs)]
		hub := s.hubs[hubID]
		drone := NewDroneEntity(fmt.Sprintf("drone-%02d", i+1), hub.data.Position, hubID)
		s.drones[drone.ID] = drone
	}

	// Create pods at street hubs
	hubIDs = make([]string, 0)
	for id, hub := range s.hubs {
		if hub.data.Type == types.HubTypeStreet {
			hubIDs = append(hubIDs, id)
		}
	}
	for i := 0; i < s.config.NumPods; i++ {
		hubID := hubIDs[i%len(hubIDs)]
		hub := s.hubs[hubID]
		pod := NewPodEntity(fmt.Sprintf("pod-%02d", i+1), hub.data.Position, hubID)
		s.pods[pod.ID] = pod
	}

	// Create swarm bots at street hubs
	for i := 0; i < s.config.NumSwarmBots; i++ {
		hubID := hubIDs[i%len(hubIDs)]
		hub := s.hubs[hubID]
		bot := NewSwarmBotEntity(fmt.Sprintf("bot-%02d", i+1), hub.data.Position, hubID)
		s.swarmBots[bot.ID] = bot
	}

	_ = laCenter // Unused but shows intent
}

// createCorridors creates drone flight corridors
func (s *DeliverySimulation) createCorridors() {
	// Main corridors across LA
	corridors := []types.DroneCorridor{
		{
			ID:   "corridor-dtla-sm",
			Name: "DTLA to Santa Monica",
			Waypoints: []types.Position{
				{Lat: 34.0522, Lng: -118.2437},
				{Lat: 34.0400, Lng: -118.3500},
				{Lat: 34.0195, Lng: -118.4912},
			},
			Altitude:   120,
			Width:      50,
			SpeedLimit: 20,
		},
		{
			ID:   "corridor-dtla-pas",
			Name: "DTLA to Pasadena",
			Waypoints: []types.Position{
				{Lat: 34.0522, Lng: -118.2437},
				{Lat: 34.1000, Lng: -118.1900},
				{Lat: 34.1478, Lng: -118.1445},
			},
			Altitude:   150,
			Width:      50,
			SpeedLimit: 25,
		},
	}
	for i := range corridors {
		s.corridors[corridors[i].ID] = &corridors[i]
	}
}

// createRoutes creates pod routes
func (s *DeliverySimulation) createRoutes() {
	routes := []types.PodRoute{
		{
			ID:   "route-arts-usc",
			Name: "Arts District to USC",
			Waypoints: []types.Position{
				{Lat: 34.0407, Lng: -118.2468},
				{Lat: 34.0330, Lng: -118.2650},
				{Lat: 34.0259, Lng: -118.2806},
			},
			Length: 4.2,
		},
		{
			ID:   "route-bh-culver",
			Name: "Beverly Hills to Culver City",
			Waypoints: []types.Position{
				{Lat: 34.0689, Lng: -118.4452},
				{Lat: 34.0450, Lng: -118.4200},
				{Lat: 34.0211, Lng: -118.3965},
			},
			Length: 6.8,
		},
	}
	for i := range routes {
		s.routes[routes[i].ID] = &routes[i]
	}
}

// createZones creates swarm bot zones
func (s *DeliverySimulation) createZones() {
	zones := []types.SwarmZone{
		{ID: "zone-arts", Name: "Arts District", Center: types.Position{Lat: 34.0407, Lng: -118.2468}, Radius: 800, HubID: "street-1"},
		{ID: "zone-usc", Name: "USC", Center: types.Position{Lat: 34.0259, Lng: -118.2806}, Radius: 600, HubID: "street-2"},
		{ID: "zone-bh", Name: "Beverly Hills", Center: types.Position{Lat: 34.0689, Lng: -118.4452}, Radius: 1000, HubID: "street-3"},
	}
	for i := range zones {
		s.zones[zones[i].ID] = &zones[i]
	}
}

// Start starts the simulation
func (s *DeliverySimulation) Start() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running = true
	s.paused = false
}

// Stop stops the simulation
func (s *DeliverySimulation) Stop() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running = false
}

// Pause pauses the simulation
func (s *DeliverySimulation) Pause() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = true
}

// Resume resumes the simulation
func (s *DeliverySimulation) Resume() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = false
}

// SetTimeScale sets simulation speed
func (s *DeliverySimulation) SetTimeScale(scale float64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.timeScale = math.Max(0.1, math.Min(100, scale))
}

// Tick advances the simulation by dt
func (s *DeliverySimulation) Tick(dt time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.running || s.paused {
		return
	}

	scaledDt := time.Duration(float64(dt) * s.timeScale)
	s.simTime = s.simTime.Add(scaledDt)
	s.tickCount++
	dtSeconds := scaledDt.Seconds()

	// Spawn packages randomly
	s.spawnPackages(dtSeconds)

	// Run KOR orchestrator
	s.kor.Update(dtSeconds)

	// Update all entities
	for _, drone := range s.drones {
		drone.Update(dtSeconds)
	}
	for _, pod := range s.pods {
		pod.Update(dtSeconds)
	}
	for _, bot := range s.swarmBots {
		bot.Update(dtSeconds)
	}
	for _, hub := range s.hubs {
		hub.Update(dtSeconds)
	}

	// Update metrics
	s.updateMetrics()
}

// spawnPackages randomly spawns new packages
func (s *DeliverySimulation) spawnPackages(dt float64) {
	spawnChance := s.config.PackageSpawnRate / 60 * dt
	if rand.Float64() < spawnChance {
		pkg := s.createRandomPackage()
		s.packages[pkg.ID] = pkg
	}
}

// createRandomPackage creates a random delivery package
func (s *DeliverySimulation) createRandomPackage() *types.Package {
	priorities := []types.DeliveryPriority{
		types.PriorityStandard,
		types.PriorityStandard,
		types.PriorityStandard,
		types.PriorityExpress,
		types.PriorityExpress,
		types.PriorityPriority,
		types.PriorityEmergency,
	}

	// Random LA area positions
	origin := types.Position{
		Lat: 34.0 + rand.Float64()*0.2,
		Lng: -118.5 + rand.Float64()*0.3,
	}
	dest := types.Position{
		Lat: 34.0 + rand.Float64()*0.2,
		Lng: -118.5 + rand.Float64()*0.3,
	}

	return &types.Package{
		ID:          fmt.Sprintf("pkg-%d", s.tickCount),
		Priority:    priorities[rand.Intn(len(priorities))],
		Origin:      origin,
		Destination: dest,
		Weight:      0.5 + rand.Float64()*4.5, // 0.5-5 kg
		Size:        []string{"small", "medium", "large"}[rand.Intn(3)],
		Status:      "pending",
		CreatedAt:   s.simTime.Unix(),
	}
}

// updateMetrics updates simulation metrics
func (s *DeliverySimulation) updateMetrics() {
	m := &s.metrics

	// Reset counts
	m.TotalDrones = len(s.drones)
	m.TotalPods = len(s.pods)
	m.TotalSwarmBots = len(s.swarmBots)
	m.ActiveDrones = 0
	m.ActivePods = 0
	m.ActiveSwarmBots = 0
	m.ChargingCount = 0

	var droneSocSum, podSocSum, botSocSum float64

	for _, d := range s.drones {
		if d.data.State != types.DeliveryStateIdle && d.data.State != types.DeliveryStateCharging {
			m.ActiveDrones++
		}
		if d.data.State == types.DeliveryStateCharging {
			m.ChargingCount++
		}
		droneSocSum += d.data.BatterySOC
	}

	for _, p := range s.pods {
		if p.data.State != types.DeliveryStateIdle && p.data.State != types.DeliveryStateCharging {
			m.ActivePods++
		}
		if p.data.State == types.DeliveryStateCharging {
			m.ChargingCount++
		}
		podSocSum += p.data.BatterySOC
	}

	for _, b := range s.swarmBots {
		if b.data.State != types.DeliveryStateIdle && b.data.State != types.DeliveryStateCharging {
			m.ActiveSwarmBots++
		}
		if b.data.State == types.DeliveryStateCharging {
			m.ChargingCount++
		}
		botSocSum += b.data.BatterySOC
	}

	if m.TotalDrones > 0 {
		m.AvgDroneSOC = droneSocSum / float64(m.TotalDrones)
	}
	if m.TotalPods > 0 {
		m.AvgPodSOC = podSocSum / float64(m.TotalPods)
	}
	if m.TotalSwarmBots > 0 {
		m.AvgSwarmBotSOC = botSocSum / float64(m.TotalSwarmBots)
	}

	// Package counts
	m.PendingDeliveries = 0
	m.InTransitDeliveries = 0
	m.CompletedDeliveries = 0
	for _, pkg := range s.packages {
		switch pkg.Status {
		case "pending":
			m.PendingDeliveries++
		case "in_transit", "assigned":
			m.InTransitDeliveries++
		case "delivered":
			m.CompletedDeliveries++
		}
	}

	// Fleet utilization
	totalVehicles := m.TotalDrones + m.TotalPods + m.TotalSwarmBots
	activeVehicles := m.ActiveDrones + m.ActivePods + m.ActiveSwarmBots
	if totalVehicles > 0 {
		m.FleetUtilization = float64(activeVehicles) / float64(totalVehicles) * 100
	}
}

// GetState returns complete simulation state
func (s *DeliverySimulation) GetState() types.DeliverySimulationState {
	s.mu.RLock()
	defer s.mu.RUnlock()

	state := types.DeliverySimulationState{
		Running:   s.running,
		SimTime:   s.simTime.Unix(),
		TimeScale: s.timeScale,
		Metrics:   s.metrics,
	}

	// Collect entities
	state.Drones = make([]types.Drone, 0, len(s.drones))
	for _, d := range s.drones {
		state.Drones = append(state.Drones, d.data)
	}

	state.Pods = make([]types.DeliveryPod, 0, len(s.pods))
	for _, p := range s.pods {
		state.Pods = append(state.Pods, p.data)
	}

	state.SwarmBots = make([]types.SwarmBot, 0, len(s.swarmBots))
	for _, b := range s.swarmBots {
		state.SwarmBots = append(state.SwarmBots, b.data)
	}

	state.Hubs = make([]types.DeliveryHub, 0, len(s.hubs))
	for _, h := range s.hubs {
		state.Hubs = append(state.Hubs, h.data)
	}

	state.Packages = make([]types.Package, 0, len(s.packages))
	for _, p := range s.packages {
		state.Packages = append(state.Packages, *p)
	}

	state.Corridors = make([]types.DroneCorridor, 0, len(s.corridors))
	for _, c := range s.corridors {
		state.Corridors = append(state.Corridors, *c)
	}

	state.Routes = make([]types.PodRoute, 0, len(s.routes))
	for _, r := range s.routes {
		state.Routes = append(state.Routes, *r)
	}

	state.Zones = make([]types.SwarmZone, 0, len(s.zones))
	for _, z := range s.zones {
		state.Zones = append(state.Zones, *z)
	}

	return state
}

// GetMetrics returns current metrics
func (s *DeliverySimulation) GetMetrics() types.DeliveryMetrics {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.metrics
}

// AddPackage adds a new package to the simulation
func (s *DeliverySimulation) AddPackage(pkg *types.Package) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.packages[pkg.ID] = pkg
}

// Helper function
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
