// Package delivery implements delivery vehicle entities
package delivery

import (
	"math"
	"math/rand"

	"github.com/elektrokombinacija/simulator/pkg/types"
)

// DroneEntity represents a delivery drone with behavior
type DroneEntity struct {
	ID   string
	data types.Drone

	// Internal state
	targetReached   bool
	chargingTimer   float64
	deliveryTimer   float64
	flightPath      []types.Position
	pathIndex       int
}

// NewDroneEntity creates a new drone entity
func NewDroneEntity(id string, pos types.Position, homeHubID string) *DroneEntity {
	return &DroneEntity{
		ID: id,
		data: types.Drone{
			ID:         id,
			State:      types.DeliveryStateIdle,
			Position:   pos,
			Altitude:   0,
			Speed:      0,
			Heading:    0,
			BatterySOC: 90 + rand.Float64()*10, // 90-100%
			HomeHubID:  homeHubID,
		},
	}
}

// Update updates drone state
func (d *DroneEntity) Update(dt float64) {
	switch d.data.State {
	case types.DeliveryStateIdle:
		d.updateIdle(dt)
	case types.DeliveryStateCharging:
		d.updateCharging(dt)
	case types.DeliveryStateTakingOff:
		d.updateTakeoff(dt)
	case types.DeliveryStateFlying:
		d.updateFlying(dt)
	case types.DeliveryStateLanding:
		d.updateLanding(dt)
	case types.DeliveryStateHovering:
		d.updateHovering(dt)
	case types.DeliveryStateHandoffWaiting:
		d.updateHandoff(dt)
	}

	// Battery drain
	d.updateBattery(dt)
}

func (d *DroneEntity) updateIdle(dt float64) {
	d.data.Speed = 0
	d.data.Altitude = 0

	// Start charging if battery low
	if d.data.BatterySOC < 30 {
		d.data.State = types.DeliveryStateCharging
	}
}

func (d *DroneEntity) updateCharging(dt float64) {
	// Charge at ~1% per second (fast charging)
	d.data.BatterySOC = math.Min(100, d.data.BatterySOC+dt*1.0)

	if d.data.BatterySOC >= 95 {
		d.data.State = types.DeliveryStateIdle
	}
}

func (d *DroneEntity) updateTakeoff(dt float64) {
	// Ascend at 5 m/s
	targetAlt := 100.0
	if d.data.Altitude < targetAlt {
		d.data.Altitude += 5 * dt
		d.data.Speed = 5
	} else {
		d.data.State = types.DeliveryStateFlying
	}
}

func (d *DroneEntity) updateFlying(dt float64) {
	if d.data.TargetPos == nil {
		d.data.State = types.DeliveryStateHovering
		return
	}

	// Move toward target
	target := *d.data.TargetPos
	dx := target.Lng - d.data.Position.Lng
	dy := target.Lat - d.data.Position.Lat

	dist := math.Sqrt(dx*dx + dy*dy)
	if dist < 0.0001 { // ~10m threshold
		d.targetReached = true
		d.data.State = types.DeliveryStateLanding
		return
	}

	// Cruise speed 20 m/s (normalized for lat/lng)
	speed := 0.0002 // ~20m/s in degree units
	d.data.Speed = 20

	// Update position
	d.data.Position.Lng += (dx / dist) * speed * dt
	d.data.Position.Lat += (dy / dist) * speed * dt

	// Update heading
	d.data.Heading = math.Atan2(dx, dy) * 180 / math.Pi
}

func (d *DroneEntity) updateLanding(dt float64) {
	// Descend at 3 m/s
	if d.data.Altitude > 0 {
		d.data.Altitude = math.Max(0, d.data.Altitude-3*dt)
		d.data.Speed = 3
	} else {
		if d.data.PackageID != "" {
			// Deliver package
			d.data.State = types.DeliveryStateHandoffWaiting
		} else {
			d.data.State = types.DeliveryStateIdle
		}
	}
}

func (d *DroneEntity) updateHovering(dt float64) {
	d.data.Speed = 0
	// Maintain altitude, wait for assignment
}

func (d *DroneEntity) updateHandoff(dt float64) {
	d.deliveryTimer += dt
	if d.deliveryTimer > 30 { // 30 second delivery
		d.data.PackageID = ""
		d.data.State = types.DeliveryStateIdle
		d.deliveryTimer = 0
	}
}

func (d *DroneEntity) updateBattery(dt float64) {
	// Battery consumption based on state
	var drainRate float64
	switch d.data.State {
	case types.DeliveryStateFlying:
		drainRate = 0.5 // 0.5% per second
	case types.DeliveryStateTakingOff, types.DeliveryStateLanding:
		drainRate = 0.3
	case types.DeliveryStateHovering:
		drainRate = 0.2
	default:
		drainRate = 0.01
	}

	if d.data.State != types.DeliveryStateCharging {
		d.data.BatterySOC = math.Max(0, d.data.BatterySOC-drainRate*dt)
	}

	// Emergency landing if battery critical
	if d.data.BatterySOC < 10 && d.data.State == types.DeliveryStateFlying {
		d.data.State = types.DeliveryStateLanding
	}
}

// AssignDelivery assigns a package for delivery
func (d *DroneEntity) AssignDelivery(packageID string, target types.Position) {
	d.data.PackageID = packageID
	d.data.TargetPos = &target
	d.data.State = types.DeliveryStateTakingOff
	d.targetReached = false
}

// GetData returns the drone's current state
func (d *DroneEntity) GetData() types.Drone {
	return d.data
}

// PodEntity represents a ground delivery pod (Nuro-style)
type PodEntity struct {
	ID   string
	data types.DeliveryPod

	// Internal state
	routeProgress   float64
	deliveryTimer   float64
	currentWaypoint int
}

// NewPodEntity creates a new pod entity
func NewPodEntity(id string, pos types.Position, homeHubID string) *PodEntity {
	return &PodEntity{
		ID: id,
		data: types.DeliveryPod{
			ID:         id,
			State:      types.DeliveryStateIdle,
			Position:   pos,
			Speed:      0,
			Heading:    0,
			BatterySOC: 85 + rand.Float64()*15, // 85-100%
			Capacity:   6,
			PackageIDs: make([]string, 0),
			SwarmBotIDs: make([]string, 0),
			HomeHubID:  homeHubID,
		},
	}
}

// Update updates pod state
func (p *PodEntity) Update(dt float64) {
	switch p.data.State {
	case types.DeliveryStateIdle:
		p.updateIdle(dt)
	case types.DeliveryStateCharging:
		p.updateCharging(dt)
	case types.DeliveryStateLoading:
		p.updateLoading(dt)
	case types.DeliveryStateEnRoute:
		p.updateEnRoute(dt)
	case types.DeliveryStateUnloading:
		p.updateUnloading(dt)
	case types.DeliveryStateReturning:
		p.updateReturning(dt)
	}

	p.updateBattery(dt)
}

func (p *PodEntity) updateIdle(dt float64) {
	p.data.Speed = 0

	if p.data.BatterySOC < 25 {
		p.data.State = types.DeliveryStateCharging
	}
}

func (p *PodEntity) updateCharging(dt float64) {
	// Charge at ~0.5% per second
	p.data.BatterySOC = math.Min(100, p.data.BatterySOC+dt*0.5)

	if p.data.BatterySOC >= 90 {
		p.data.State = types.DeliveryStateIdle
	}
}

func (p *PodEntity) updateLoading(dt float64) {
	p.deliveryTimer += dt
	if p.deliveryTimer > 60 { // 60 second loading
		p.data.State = types.DeliveryStateEnRoute
		p.deliveryTimer = 0
	}
}

func (p *PodEntity) updateEnRoute(dt float64) {
	// Pod travels at 25 km/h on streets
	speedKmh := 25.0
	p.data.Speed = speedKmh

	// Simulate progress along route
	p.routeProgress += (speedKmh / 3600) * dt * 0.1 // Progress factor

	if p.routeProgress >= 1.0 {
		p.routeProgress = 0
		p.data.State = types.DeliveryStateUnloading
	}
}

func (p *PodEntity) updateUnloading(dt float64) {
	p.deliveryTimer += dt
	if p.deliveryTimer > 45 { // 45 second unloading
		// Deploy swarm bots or complete delivery
		if len(p.data.PackageIDs) > 0 {
			p.data.PackageIDs = p.data.PackageIDs[1:] // Remove delivered package
		}
		p.data.State = types.DeliveryStateReturning
		p.deliveryTimer = 0
	}
}

func (p *PodEntity) updateReturning(dt float64) {
	speedKmh := 25.0
	p.data.Speed = speedKmh

	p.routeProgress += (speedKmh / 3600) * dt * 0.1

	if p.routeProgress >= 1.0 {
		p.routeProgress = 0
		p.data.State = types.DeliveryStateIdle
	}
}

func (p *PodEntity) updateBattery(dt float64) {
	var drainRate float64
	switch p.data.State {
	case types.DeliveryStateEnRoute, types.DeliveryStateReturning:
		drainRate = 0.1 // 0.1% per second while driving
	default:
		drainRate = 0.01
	}

	if p.data.State != types.DeliveryStateCharging {
		p.data.BatterySOC = math.Max(0, p.data.BatterySOC-drainRate*dt)
	}
}

// LoadPackage loads a package onto the pod
func (p *PodEntity) LoadPackage(packageID string) bool {
	if len(p.data.PackageIDs) >= p.data.Capacity {
		return false
	}
	p.data.PackageIDs = append(p.data.PackageIDs, packageID)
	return true
}

// StartRoute starts the pod on a delivery route
func (p *PodEntity) StartRoute(routeID string) {
	p.data.RouteID = routeID
	p.data.State = types.DeliveryStateLoading
	p.routeProgress = 0
}

// GetData returns the pod's current state
func (p *PodEntity) GetData() types.DeliveryPod {
	return p.data
}

// SwarmBotEntity represents a sidewalk delivery robot
type SwarmBotEntity struct {
	ID   string
	data types.SwarmBot

	// Internal state
	deliveryTimer float64
	targetReached bool
}

// NewSwarmBotEntity creates a new swarm bot entity
func NewSwarmBotEntity(id string, pos types.Position, homeHubID string) *SwarmBotEntity {
	return &SwarmBotEntity{
		ID: id,
		data: types.SwarmBot{
			ID:         id,
			State:      types.DeliveryStateIdle,
			Position:   pos,
			Speed:      0,
			Heading:    0,
			BatterySOC: 80 + rand.Float64()*20, // 80-100%
			HomeHubID:  homeHubID,
		},
	}
}

// Update updates swarm bot state
func (s *SwarmBotEntity) Update(dt float64) {
	switch s.data.State {
	case types.DeliveryStateIdle:
		s.updateIdle(dt)
	case types.DeliveryStateCharging:
		s.updateCharging(dt)
	case types.DeliveryStateSwarming:
		s.updateSwarming(dt)
	case types.DeliveryStateDelivering:
		s.updateDelivering(dt)
	case types.DeliveryStateReturning:
		s.updateReturning(dt)
	case types.DeliveryStateSwapping:
		s.updateSwapping(dt)
	}

	s.updateBattery(dt)
}

func (s *SwarmBotEntity) updateIdle(dt float64) {
	s.data.Speed = 0

	if s.data.BatterySOC < 20 {
		s.data.State = types.DeliveryStateCharging
	}
}

func (s *SwarmBotEntity) updateCharging(dt float64) {
	// Swarm bots use battery swapping - fast
	s.data.BatterySOC = math.Min(100, s.data.BatterySOC+dt*2.0) // Quick swap simulation

	if s.data.BatterySOC >= 95 {
		s.data.State = types.DeliveryStateIdle
	}
}

func (s *SwarmBotEntity) updateSwarming(dt float64) {
	// Moving with pod convoy
	s.data.Speed = 5 // 5 km/h on sidewalk
}

func (s *SwarmBotEntity) updateDelivering(dt float64) {
	if s.data.TargetPos == nil {
		s.data.State = types.DeliveryStateReturning
		return
	}

	// Navigate to target at 6 km/h
	target := *s.data.TargetPos
	dx := target.Lng - s.data.Position.Lng
	dy := target.Lat - s.data.Position.Lat

	dist := math.Sqrt(dx*dx + dy*dy)
	if dist < 0.00005 { // ~5m threshold
		// Arrived at destination
		s.deliveryTimer += dt
		if s.deliveryTimer > 20 { // 20 second delivery
			s.data.PackageID = ""
			s.data.State = types.DeliveryStateReturning
			s.deliveryTimer = 0
		}
		return
	}

	// Sidewalk speed ~6 km/h
	speed := 0.00005 // Normalized speed
	s.data.Speed = 6

	s.data.Position.Lng += (dx / dist) * speed * dt
	s.data.Position.Lat += (dy / dist) * speed * dt
	s.data.Heading = math.Atan2(dx, dy) * 180 / math.Pi
}

func (s *SwarmBotEntity) updateReturning(dt float64) {
	// Return to hub (simplified)
	s.data.Speed = 6

	// Simulate return progress
	s.deliveryTimer += dt
	if s.deliveryTimer > 120 { // 2 minute return
		s.data.State = types.DeliveryStateIdle
		s.data.TargetPos = nil
		s.deliveryTimer = 0
	}
}

func (s *SwarmBotEntity) updateSwapping(dt float64) {
	// Battery swap takes 30 seconds
	s.deliveryTimer += dt
	if s.deliveryTimer > 30 {
		s.data.BatterySOC = 100
		s.data.State = types.DeliveryStateIdle
		s.deliveryTimer = 0
	}
}

func (s *SwarmBotEntity) updateBattery(dt float64) {
	var drainRate float64
	switch s.data.State {
	case types.DeliveryStateDelivering, types.DeliveryStateSwarming:
		drainRate = 0.05
	case types.DeliveryStateReturning:
		drainRate = 0.04
	default:
		drainRate = 0.005
	}

	if s.data.State != types.DeliveryStateCharging && s.data.State != types.DeliveryStateSwapping {
		s.data.BatterySOC = math.Max(0, s.data.BatterySOC-drainRate*dt)
	}
}

// AssignDelivery assigns a package for delivery
func (s *SwarmBotEntity) AssignDelivery(packageID string, target types.Position, zoneID string) {
	s.data.PackageID = packageID
	s.data.TargetPos = &target
	s.data.ZoneID = zoneID
	s.data.State = types.DeliveryStateDelivering
	s.targetReached = false
}

// AttachToPod attaches swarm bot to a pod
func (s *SwarmBotEntity) AttachToPod(podID string) {
	s.data.ParentPodID = podID
	s.data.State = types.DeliveryStateSwarming
}

// GetData returns the swarm bot's current state
func (s *SwarmBotEntity) GetData() types.SwarmBot {
	return s.data
}

// HubEntity represents a charging/staging hub
type HubEntity struct {
	ID   string
	data types.DeliveryHub

	// Internal state
	chargingVehicles []string
	waitingQueue     []string
}

// NewHubEntity creates a new hub entity
func NewHubEntity(id string, hubType types.HubType, pos types.Position) *HubEntity {
	capacity := 4
	power := 50.0 // kW
	name := ""

	switch hubType {
	case types.HubTypeRooftop:
		capacity = 6
		power = 100 // Higher power for drones
		name = "Rooftop Hub " + id
	case types.HubTypeStreet:
		capacity = 8
		power = 75
		name = "Street Hub " + id
	case types.HubTypeHandoff:
		capacity = 2
		power = 25
		name = "Handoff Point " + id
	}

	return &HubEntity{
		ID: id,
		data: types.DeliveryHub{
			ID:            id,
			Name:          name,
			Type:          hubType,
			Position:      pos,
			Capacity:      capacity,
			Occupied:      0,
			QueueLength:   0,
			ChargingPower: power,
			AvgWaitTime:   0,
		},
		chargingVehicles: make([]string, 0),
		waitingQueue:     make([]string, 0),
	}
}

// Update updates hub state
func (h *HubEntity) Update(dt float64) {
	h.data.Occupied = len(h.chargingVehicles)
	h.data.QueueLength = len(h.waitingQueue)

	// Update average wait time
	if h.data.QueueLength > 0 {
		h.data.AvgWaitTime = float64(h.data.QueueLength) * 5 // 5 min per queued vehicle
	} else {
		h.data.AvgWaitTime = 0
	}

	// Process queue if space available
	for len(h.waitingQueue) > 0 && len(h.chargingVehicles) < h.data.Capacity {
		vehicleID := h.waitingQueue[0]
		h.waitingQueue = h.waitingQueue[1:]
		h.chargingVehicles = append(h.chargingVehicles, vehicleID)
	}
}

// RequestCharging requests a charging slot
func (h *HubEntity) RequestCharging(vehicleID string) bool {
	if len(h.chargingVehicles) < h.data.Capacity {
		h.chargingVehicles = append(h.chargingVehicles, vehicleID)
		return true
	}
	// Add to queue
	h.waitingQueue = append(h.waitingQueue, vehicleID)
	return false
}

// ReleaseCharging releases a charging slot
func (h *HubEntity) ReleaseCharging(vehicleID string) {
	for i, id := range h.chargingVehicles {
		if id == vehicleID {
			h.chargingVehicles = append(h.chargingVehicles[:i], h.chargingVehicles[i+1:]...)
			return
		}
	}
}

// GetData returns the hub's current state
func (h *HubEntity) GetData() types.DeliveryHub {
	return h.data
}
