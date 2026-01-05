// Package delivery implements the KOR AI orchestrator for delivery fleet
package delivery

import (
	"math"
	"sort"

	"github.com/elektrokombinacija/simulator/pkg/types"
)

// KOROrchestrator implements the Korisnička Orchestracija Roja (User Swarm Orchestration)
// AI system for intelligent delivery dispatching
type KOROrchestrator struct {
	sim *DeliverySimulation

	// Decision timers
	dispatchTimer   float64
	rebalanceTimer  float64
	handoffTimer    float64

	// Configuration
	dispatchInterval   float64 // seconds between dispatch decisions
	rebalanceInterval  float64 // seconds between fleet rebalancing
	handoffInterval    float64 // seconds between handoff coordination

	// Statistics
	totalDispatches    int
	successfulDeliveries int
	failedDeliveries   int
	avgDeliveryTime    float64
}

// NewKOROrchestrator creates a new KOR orchestrator
func NewKOROrchestrator(sim *DeliverySimulation) *KOROrchestrator {
	return &KOROrchestrator{
		sim:               sim,
		dispatchInterval:  5.0,   // Dispatch every 5 seconds
		rebalanceInterval: 60.0,  // Rebalance every minute
		handoffInterval:   10.0,  // Check handoffs every 10 seconds
	}
}

// Update runs the KOR orchestration logic
func (k *KOROrchestrator) Update(dt float64) {
	// Dispatch pending packages
	k.dispatchTimer += dt
	if k.dispatchTimer >= k.dispatchInterval {
		k.dispatchPackages()
		k.dispatchTimer = 0
	}

	// Rebalance fleet
	k.rebalanceTimer += dt
	if k.rebalanceTimer >= k.rebalanceInterval {
		k.rebalanceFleet()
		k.rebalanceTimer = 0
	}

	// Coordinate handoffs
	k.handoffTimer += dt
	if k.handoffTimer >= k.handoffInterval {
		k.coordinateHandoffs()
		k.handoffTimer = 0
	}
}

// dispatchPackages assigns pending packages to available vehicles
func (k *KOROrchestrator) dispatchPackages() {
	// Get pending packages sorted by priority
	pendingPackages := k.getPendingPackages()
	if len(pendingPackages) == 0 {
		return
	}

	// Sort by priority (emergency first)
	sort.Slice(pendingPackages, func(i, j int) bool {
		return k.getPriorityScore(pendingPackages[i].Priority) > k.getPriorityScore(pendingPackages[j].Priority)
	})

	// Try to assign each package
	for _, pkg := range pendingPackages {
		if k.assignPackage(pkg) {
			k.totalDispatches++
		}
	}
}

// getPendingPackages returns all pending packages
func (k *KOROrchestrator) getPendingPackages() []*types.Package {
	var pending []*types.Package
	for _, pkg := range k.sim.packages {
		if pkg.Status == "pending" {
			pending = append(pending, pkg)
		}
	}
	return pending
}

// getPriorityScore converts priority to numeric score
func (k *KOROrchestrator) getPriorityScore(priority types.DeliveryPriority) int {
	switch priority {
	case types.PriorityEmergency:
		return 100
	case types.PriorityPriority:
		return 50
	case types.PriorityExpress:
		return 25
	default:
		return 10
	}
}

// assignPackage assigns a package to the best available vehicle
func (k *KOROrchestrator) assignPackage(pkg *types.Package) bool {
	// Calculate distance
	distance := k.calculateDistance(pkg.Origin, pkg.Destination)

	// Determine best vehicle type based on distance and package size
	vehicleType := k.selectVehicleType(pkg, distance)

	switch vehicleType {
	case types.VehicleDrone:
		return k.assignToDrone(pkg)
	case types.VehiclePod:
		return k.assignToPod(pkg)
	case types.VehicleSwarmBot:
		return k.assignToSwarmBot(pkg)
	}

	return false
}

// selectVehicleType selects the best vehicle type for a delivery
func (k *KOROrchestrator) selectVehicleType(pkg *types.Package, distance float64) types.DeliveryVehicleType {
	// Drones: long distance, light packages, emergency
	if distance > 5 && pkg.Weight < 2 { // > 5km, < 2kg
		return types.VehicleDrone
	}
	if pkg.Priority == types.PriorityEmergency && pkg.Weight < 3 {
		return types.VehicleDrone
	}

	// SwarmBots: short distance, sidewalk delivery
	if distance < 1 && pkg.Weight < 3 { // < 1km, < 3kg
		return types.VehicleSwarmBot
	}

	// Pods: medium distance, heavier packages, bulk delivery
	return types.VehiclePod
}

// assignToDrone assigns package to best available drone
func (k *KOROrchestrator) assignToDrone(pkg *types.Package) bool {
	var bestDrone *DroneEntity
	bestScore := -1.0

	for _, drone := range k.sim.drones {
		if !k.isDroneAvailable(drone) {
			continue
		}

		score := k.scoreDroneForPackage(drone, pkg)
		if score > bestScore {
			bestScore = score
			bestDrone = drone
		}
	}

	if bestDrone != nil {
		bestDrone.AssignDelivery(pkg.ID, pkg.Destination)
		pkg.Status = "assigned"
		pkg.VehicleID = bestDrone.ID
		pkg.VehicleType = types.VehicleDrone
		return true
	}

	return false
}

// isDroneAvailable checks if drone is available for assignment
func (k *KOROrchestrator) isDroneAvailable(drone *DroneEntity) bool {
	if drone.data.PackageID != "" {
		return false
	}
	if drone.data.State != types.DeliveryStateIdle {
		return false
	}
	if drone.data.BatterySOC < 40 {
		return false
	}
	return true
}

// scoreDroneForPackage scores a drone for a specific package
func (k *KOROrchestrator) scoreDroneForPackage(drone *DroneEntity, pkg *types.Package) float64 {
	// Score based on battery, distance to pickup, and idle time
	batteryScore := drone.data.BatterySOC / 100

	distanceToPickup := k.calculateDistance(drone.data.Position, pkg.Origin)
	distanceScore := 1.0 / (1.0 + distanceToPickup*0.1)

	return batteryScore*0.4 + distanceScore*0.6
}

// assignToPod assigns package to best available pod
func (k *KOROrchestrator) assignToPod(pkg *types.Package) bool {
	var bestPod *PodEntity
	bestScore := -1.0

	for _, pod := range k.sim.pods {
		if !k.isPodAvailable(pod) {
			continue
		}

		score := k.scorePodForPackage(pod, pkg)
		if score > bestScore {
			bestScore = score
			bestPod = pod
		}
	}

	if bestPod != nil {
		if bestPod.LoadPackage(pkg.ID) {
			pkg.Status = "assigned"
			pkg.VehicleID = bestPod.ID
			pkg.VehicleType = types.VehiclePod

			// Start route if pod now has packages
			if len(bestPod.data.PackageIDs) >= 1 {
				bestPod.StartRoute("route-1")
			}
			return true
		}
	}

	return false
}

// isPodAvailable checks if pod is available for assignment
func (k *KOROrchestrator) isPodAvailable(pod *PodEntity) bool {
	if len(pod.data.PackageIDs) >= pod.data.Capacity {
		return false
	}
	if pod.data.State != types.DeliveryStateIdle && pod.data.State != types.DeliveryStateLoading {
		return false
	}
	if pod.data.BatterySOC < 30 {
		return false
	}
	return true
}

// scorePodForPackage scores a pod for a specific package
func (k *KOROrchestrator) scorePodForPackage(pod *PodEntity, pkg *types.Package) float64 {
	batteryScore := pod.data.BatterySOC / 100
	capacityScore := float64(pod.data.Capacity-len(pod.data.PackageIDs)) / float64(pod.data.Capacity)
	distanceToPickup := k.calculateDistance(pod.data.Position, pkg.Origin)
	distanceScore := 1.0 / (1.0 + distanceToPickup*0.1)

	return batteryScore*0.3 + capacityScore*0.3 + distanceScore*0.4
}

// assignToSwarmBot assigns package to best available swarm bot
func (k *KOROrchestrator) assignToSwarmBot(pkg *types.Package) bool {
	var bestBot *SwarmBotEntity
	bestScore := -1.0

	for _, bot := range k.sim.swarmBots {
		if !k.isSwarmBotAvailable(bot) {
			continue
		}

		score := k.scoreSwarmBotForPackage(bot, pkg)
		if score > bestScore {
			bestScore = score
			bestBot = bot
		}
	}

	if bestBot != nil {
		// Find zone for this delivery
		zoneID := k.findZoneForPosition(pkg.Destination)
		bestBot.AssignDelivery(pkg.ID, pkg.Destination, zoneID)
		pkg.Status = "assigned"
		pkg.VehicleID = bestBot.ID
		pkg.VehicleType = types.VehicleSwarmBot
		return true
	}

	return false
}

// isSwarmBotAvailable checks if swarm bot is available
func (k *KOROrchestrator) isSwarmBotAvailable(bot *SwarmBotEntity) bool {
	if bot.data.PackageID != "" {
		return false
	}
	if bot.data.State != types.DeliveryStateIdle {
		return false
	}
	if bot.data.BatterySOC < 35 {
		return false
	}
	return true
}

// scoreSwarmBotForPackage scores a swarm bot for a package
func (k *KOROrchestrator) scoreSwarmBotForPackage(bot *SwarmBotEntity, pkg *types.Package) float64 {
	batteryScore := bot.data.BatterySOC / 100
	distanceToPickup := k.calculateDistance(bot.data.Position, pkg.Origin)
	distanceScore := 1.0 / (1.0 + distanceToPickup*0.5) // SwarmBots are slower, penalize distance more

	return batteryScore*0.5 + distanceScore*0.5
}

// findZoneForPosition finds the zone containing a position
func (k *KOROrchestrator) findZoneForPosition(pos types.Position) string {
	for id, zone := range k.sim.zones {
		dist := k.calculateDistance(pos, zone.Center)
		if dist*1000 <= zone.Radius { // Zone radius is in meters
			return id
		}
	}
	return ""
}

// rebalanceFleet rebalances fleet distribution across hubs
func (k *KOROrchestrator) rebalanceFleet() {
	// Count vehicles at each hub
	hubCounts := make(map[string]int)
	for _, drone := range k.sim.drones {
		if drone.data.State == types.DeliveryStateIdle || drone.data.State == types.DeliveryStateCharging {
			hubCounts[drone.data.HomeHubID]++
		}
	}

	// Calculate average
	totalHubs := len(k.sim.hubs)
	if totalHubs == 0 {
		return
	}

	totalVehicles := 0
	for _, count := range hubCounts {
		totalVehicles += count
	}
	avgPerHub := totalVehicles / totalHubs

	// Identify hubs with too many or too few vehicles
	for hubID, count := range hubCounts {
		if count > avgPerHub+2 {
			// Hub has excess vehicles - could dispatch to other hubs
			_ = hubID // Future: implement vehicle relocation
		}
	}
}

// coordinateHandoffs coordinates multi-vehicle handoffs
func (k *KOROrchestrator) coordinateHandoffs() {
	// Find pods that are at delivery locations
	for _, pod := range k.sim.pods {
		if pod.data.State == types.DeliveryStateUnloading {
			// Find swarm bots to deploy from this pod
			k.deploySwarmBotsFromPod(pod)
		}
	}

	// Find drones that can hand off to pods
	for _, drone := range k.sim.drones {
		if drone.data.State == types.DeliveryStateHovering && drone.data.PackageID != "" {
			// Find nearest pod for handoff
			k.coordinateDroneToPodHandoff(drone)
		}
	}
}

// deploySwarmBotsFromPod deploys swarm bots from a pod
func (k *KOROrchestrator) deploySwarmBotsFromPod(pod *PodEntity) {
	// Find idle swarm bots attached to this pod
	for _, bot := range k.sim.swarmBots {
		if bot.data.ParentPodID == pod.ID && bot.data.State == types.DeliveryStateSwarming {
			// Check if there's a package to deliver
			if len(pod.data.PackageIDs) > 0 {
				pkgID := pod.data.PackageIDs[0]
				if pkg, ok := k.sim.packages[pkgID]; ok {
					bot.AssignDelivery(pkgID, pkg.Destination, "")
					pod.data.PackageIDs = pod.data.PackageIDs[1:]
				}
			}
		}
	}
}

// coordinateDroneToPodHandoff coordinates handoff from drone to pod
func (k *KOROrchestrator) coordinateDroneToPodHandoff(drone *DroneEntity) {
	// Find nearest available pod
	var nearestPod *PodEntity
	nearestDist := math.MaxFloat64

	for _, pod := range k.sim.pods {
		if pod.data.State != types.DeliveryStateIdle {
			continue
		}
		if len(pod.data.PackageIDs) >= pod.data.Capacity {
			continue
		}

		dist := k.calculateDistance(drone.data.Position, pod.data.Position)
		if dist < nearestDist {
			nearestDist = dist
			nearestPod = pod
		}
	}

	if nearestPod != nil && nearestDist < 0.5 { // Within 500m
		// Transfer package
		if pkg, ok := k.sim.packages[drone.data.PackageID]; ok {
			nearestPod.LoadPackage(drone.data.PackageID)
			pkg.VehicleID = nearestPod.ID
			pkg.VehicleType = types.VehiclePod
			drone.data.PackageID = ""
			drone.data.State = types.DeliveryStateIdle
		}
	}
}

// calculateDistance calculates distance between two positions in km
func (k *KOROrchestrator) calculateDistance(p1, p2 types.Position) float64 {
	// Haversine formula
	const R = 6371 // Earth's radius in km

	lat1 := p1.Lat * math.Pi / 180
	lat2 := p2.Lat * math.Pi / 180
	dLat := (p2.Lat - p1.Lat) * math.Pi / 180
	dLng := (p2.Lng - p1.Lng) * math.Pi / 180

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1)*math.Cos(lat2)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}

// GetStats returns orchestrator statistics
func (k *KOROrchestrator) GetStats() KORStats {
	return KORStats{
		TotalDispatches:      k.totalDispatches,
		SuccessfulDeliveries: k.successfulDeliveries,
		FailedDeliveries:     k.failedDeliveries,
		AvgDeliveryTime:      k.avgDeliveryTime,
	}
}

// KORStats holds orchestrator statistics
type KORStats struct {
	TotalDispatches      int
	SuccessfulDeliveries int
	FailedDeliveries     int
	AvgDeliveryTime      float64 // minutes
}
