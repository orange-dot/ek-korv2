package engine

import (
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/elektrokombinacija/simulator/internal/models"
	"github.com/elektrokombinacija/simulator/pkg/types"
)

// EK3Module represents an EK3 3.3kW power module with full physical simulation
type EK3Module struct {
	mu   sync.RWMutex
	data types.Module

	// Physical models
	thermalModel    *models.ThermalModel
	electricalModel *models.ElectricalModel
	faultPredictor  *models.BayesianFaultPredictor
	rulEstimator    *models.RULEstimator

	// Reliability metrics
	reliabilityMetrics models.ReliabilityMetrics

	// Internal state
	targetPower  float64
	lastUpdate   time.Time
	faultTracked bool // For metrics: tracks if fault has been counted
}

// NewEK3Module creates a new EK3 module with physical models
func NewEK3Module(index int, rackID string, slotIndex int) *EK3Module {
	// Random ambient temperature 25-35°C
	ambientTemp := 25.0 + rand.Float64()*10.0

	m := &EK3Module{
		data: types.Module{
			ID:           fmt.Sprintf("mod-%03d", index),
			RackID:       rackID,
			SlotIndex:    slotIndex,
			State:        types.ModuleStateIdle,
			PowerOut:     0,
			Voltage:      400, // Default battery voltage
			Current:      0,
			TempJunction: ambientTemp + 5,
			TempHeatsink: ambientTemp + 2,
			TempAmbient:  ambientTemp,
			ESRRatio:     1.0 + rand.Float64()*0.05,
			RdsOnRatio:   1.0 + rand.Float64()*0.05,
			Efficiency:   0.96,
			OperatingHrs: rand.Float64() * 2000,
			PowerCycles:  int(rand.Float64() * 1000),
			Health:       95 + rand.Float64()*5,
			RULHours:     50000 - rand.Float64()*5000,
		},
		thermalModel:    models.NewThermalModel(ambientTemp),
		electricalModel: models.NewElectricalModel(),
		faultPredictor:  models.NewBayesianFaultPredictor(),
		rulEstimator:    models.NewRULEstimator(),
		targetPower:     0,
		lastUpdate:      time.Now(),
	}

	// Initialize reliability metrics from existing state
	m.reliabilityMetrics = models.ReliabilityMetrics{
		RdsOnRatio:     m.data.RdsOnRatio,
		ESRRatio:       m.data.ESRRatio,
		RthRatio:       1.0,
		EffLoss:        0,
		OperatingHours: m.data.OperatingHrs,
		PowerCycles:    m.data.PowerCycles,
		ThermalCycles:  int(m.data.PowerCycles / 10), // Approximate
		MaxTjSeen:      m.data.TempJunction,
		AvgTj:          m.data.TempJunction,
	}

	// Set initial electrical model voltage
	m.electricalModel.SetOutputVoltage(m.data.Voltage)

	return m
}

// ID returns the module ID
func (m *EK3Module) ID() string {
	return m.data.ID
}

// Type returns the entity type
func (m *EK3Module) Type() types.EntityType {
	return types.EntityModule
}

// State returns the current state
func (m *EK3Module) State() interface{} {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.data
}

// Tick updates the module state for the given time delta
func (m *EK3Module) Tick(dt time.Duration) {
	m.mu.Lock()
	defer m.mu.Unlock()

	dtSeconds := dt.Seconds()

	// Handle state machine
	switch m.data.State {
	case types.ModuleStateIdle:
		m.tickIdle(dtSeconds)
	case types.ModuleStateCharging:
		m.tickCharging(dtSeconds)
	case types.ModuleStateV2G:
		m.tickV2G(dtSeconds)
	case types.ModuleStateThermalLimiting:
		m.tickThermalLimiting(dtSeconds)
	case types.ModuleStateFaulted:
		m.tickFaulted(dtSeconds)
	case types.ModuleStateMarkedForReplace:
		// No updates, waiting for replacement
	}

	// Update operating hours when active
	if m.data.State == types.ModuleStateCharging || m.data.State == types.ModuleStateV2G {
		m.data.OperatingHrs += dtSeconds / 3600.0
		m.reliabilityMetrics.OperatingHours = m.data.OperatingHrs
	}

	// Update reliability metrics and predictions
	m.updateReliability(dtSeconds)

	// Check state transitions
	m.checkTransitions()

	m.lastUpdate = time.Now()
}

// tickIdle handles idle state
func (m *EK3Module) tickIdle(dt float64) {
	// Power ramps down quickly
	m.data.PowerOut = math.Max(0, m.data.PowerOut-2000*dt)
	m.data.Current = 0

	// Update thermal model with zero power
	thermalState := m.thermalModel.Update(0, 0.96, dt)
	m.updateFromThermalState(thermalState)

	// Random chance to start charging (simulates demand)
	if rand.Float64() < 0.002*dt {
		m.data.State = types.ModuleStateCharging
		m.targetPower = 500 + rand.Float64()*3100 // 0.5-3.6 kW
	}
}

// tickCharging handles charging state with full physical simulation
func (m *EK3Module) tickCharging(dt float64) {
	// Calculate electrical parameters
	m.electricalModel.SetOutputVoltage(m.data.Voltage)
	m.electricalModel.SetDegradation(m.data.RdsOnRatio, m.data.ESRRatio)

	// Calculate thermal derating
	thermalDerating := m.thermalModel.CalculateDerating()
	ambientDerating := m.thermalModel.AmbientDerating()
	totalDerating := math.Min(thermalDerating, ambientDerating)

	// Limit target power by derating
	effectiveTarget := m.targetPower * totalDerating

	// Power ramp (500 W/s)
	rampRate := 500.0
	if m.data.PowerOut < effectiveTarget {
		m.data.PowerOut = math.Min(effectiveTarget, m.data.PowerOut+rampRate*dt)
	} else {
		m.data.PowerOut = math.Max(effectiveTarget, m.data.PowerOut-rampRate*dt)
	}

	// Calculate electrical state
	elecState := m.electricalModel.CalculatePower(m.data.PowerOut)
	m.data.Efficiency = elecState.Eta
	m.data.Current = elecState.Iout

	// Update thermal model
	thermalState := m.thermalModel.Update(m.data.PowerOut, m.data.Efficiency, dt)
	m.updateFromThermalState(thermalState)

	// Random chance to stop charging (simulates session end)
	if rand.Float64() < 0.0003*dt {
		m.data.State = types.ModuleStateIdle
		m.targetPower = 0
		m.data.PowerCycles++
		m.reliabilityMetrics.PowerCycles = m.data.PowerCycles
	}
}

// tickV2G handles V2G discharge with droop control
func (m *EK3Module) tickV2G(dt float64) {
	// Similar to charging but with negative power flow
	m.electricalModel.SetOutputVoltage(m.data.Voltage)
	m.electricalModel.SetDegradation(m.data.RdsOnRatio, m.data.ESRRatio)

	// Apply thermal derating
	thermalDerating := m.thermalModel.CalculateDerating()
	effectiveTarget := m.targetPower * thermalDerating

	// Power ramp
	rampRate := 500.0
	if m.data.PowerOut < effectiveTarget {
		m.data.PowerOut = math.Min(effectiveTarget, m.data.PowerOut+rampRate*dt)
	} else {
		m.data.PowerOut = math.Max(effectiveTarget, m.data.PowerOut-rampRate*dt)
	}

	// Calculate electrical state
	elecState := m.electricalModel.CalculatePower(m.data.PowerOut)
	m.data.Efficiency = elecState.Eta
	m.data.Current = -elecState.Iout // Negative for discharge

	// Update thermal model
	thermalState := m.thermalModel.Update(m.data.PowerOut, m.data.Efficiency, dt)
	m.updateFromThermalState(thermalState)
}

// tickThermalLimiting handles thermal protection state
func (m *EK3Module) tickThermalLimiting(dt float64) {
	// Aggressive power reduction
	derating := m.thermalModel.CalculateDerating()
	targetReduced := m.targetPower * derating

	// Faster ramp down during thermal limiting
	rampRate := 1000.0
	m.data.PowerOut = math.Max(targetReduced, m.data.PowerOut-rampRate*dt)

	// Calculate electrical state
	elecState := m.electricalModel.CalculatePower(m.data.PowerOut)
	m.data.Efficiency = elecState.Eta
	m.data.Current = elecState.Iout

	// Update thermal model
	thermalState := m.thermalModel.Update(m.data.PowerOut, m.data.Efficiency, dt)
	m.updateFromThermalState(thermalState)

	// Return to normal if temperature recovers
	if m.data.TempJunction < 90 && derating > 0.9 {
		if m.targetPower > 0 {
			m.data.State = types.ModuleStateCharging
		} else {
			m.data.State = types.ModuleStateIdle
		}
	}
}

// tickFaulted handles faulted state
func (m *EK3Module) tickFaulted(dt float64) {
	// Power immediately zero
	m.data.PowerOut = 0
	m.data.Current = 0

	// Continue thermal model to simulate cooling
	thermalState := m.thermalModel.Update(0, 0.96, dt)
	m.updateFromThermalState(thermalState)
}

// updateFromThermalState updates module data from thermal model
func (m *EK3Module) updateFromThermalState(state models.ThermalState) {
	m.data.TempJunction = state.Tj
	m.data.TempHeatsink = state.Th

	// Track max temperature for reliability
	if state.Tj > m.reliabilityMetrics.MaxTjSeen {
		m.reliabilityMetrics.MaxTjSeen = state.Tj
	}

	// Update running average
	alpha := 0.01
	m.reliabilityMetrics.AvgTj = m.reliabilityMetrics.AvgTj*(1-alpha) + state.Tj*alpha

	// Update thermal resistance ratio (TIM degradation indicator)
	m.reliabilityMetrics.RthRatio = state.RthTotal / (0.3 + 0.15 + 0.6) // Ratio to baseline
}

// updateReliability updates degradation and RUL predictions
func (m *EK3Module) updateReliability(dt float64) {
	// Update degradation based on operating conditions

	// ESR degradation (Arrhenius - temperature accelerated)
	if m.data.TempJunction > 60 {
		arrheniusParams := models.DefaultArrheniusParams()
		af := models.CalculateAccelerationFactor(arrheniusParams, m.data.TempJunction)
		esrDegradation := 0.00001 * af * dt / 3600.0
		m.data.ESRRatio += esrDegradation
		m.reliabilityMetrics.ESRRatio = m.data.ESRRatio
	}

	// RdsOn degradation (Coffin-Manson - thermal cycling)
	coffinMansonParams := models.DefaultCoffinMansonParams()
	deltaTj := m.reliabilityMetrics.MaxTjSeen - m.data.TempAmbient
	damage := models.CalculateDamage(coffinMansonParams, deltaTj, m.reliabilityMetrics.ThermalCycles)
	m.data.RdsOnRatio = 1.0 + damage*0.5 // 50% increase at end of life
	m.reliabilityMetrics.RdsOnRatio = m.data.RdsOnRatio

	// Efficiency loss from baseline
	m.reliabilityMetrics.EffLoss = 0.97 - m.data.Efficiency

	// Record metrics for trend analysis
	m.rulEstimator.RecordMetrics(m.data.ESRRatio, m.data.RdsOnRatio, m.data.TempJunction)

	// Update Bayesian fault prediction
	m.faultPredictor.UpdatePosteriors(m.reliabilityMetrics)

	// Estimate RUL
	rulResult := m.rulEstimator.EstimateRUL(m.reliabilityMetrics)
	m.data.RULHours = rulResult.EstimatedHours

	// Calculate health score (0-100)
	esrHealth := 100 * (1.0 - (m.data.ESRRatio-1.0)/0.5)
	rdsHealth := 100 * (1.0 - (m.data.RdsOnRatio-1.0)/0.5)
	effHealth := 100 * m.data.Efficiency / 0.97
	m.data.Health = (esrHealth + rdsHealth + effHealth) / 3
	m.data.Health = math.Max(0, math.Min(100, m.data.Health))
}

// checkTransitions checks for state transitions based on operating conditions
func (m *EK3Module) checkTransitions() {
	thermalConstants := models.DefaultThermalConstants()

	// Warning threshold - enter thermal limiting
	if m.data.TempJunction > thermalConstants.TjWarn {
		if m.data.State == types.ModuleStateCharging || m.data.State == types.ModuleStateV2G {
			m.data.State = types.ModuleStateThermalLimiting
			m.reliabilityMetrics.OTPCount++
		}
	}

	// Critical threshold - fault
	if m.data.TempJunction > thermalConstants.TjShutdown {
		m.data.State = types.ModuleStateFaulted
	}

	// Health-based replacement trigger
	if m.data.Health < 30 {
		m.data.State = types.ModuleStateMarkedForReplace
	}

	// RUL-based replacement trigger
	if m.data.RULHours < 168 { // Less than 1 week
		m.data.State = types.ModuleStateMarkedForReplace
	}

	// Check Bayesian fault predictions
	topFaults := m.faultPredictor.GetTopFaults(1)
	if len(topFaults) > 0 && topFaults[0].Probability > 0.7 {
		// High probability of imminent fault
		m.data.State = types.ModuleStateMarkedForReplace
	}
}

// SetTargetPower sets the target power output
func (m *EK3Module) SetTargetPower(power float64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	power = math.Max(0, math.Min(3600, power))
	m.targetPower = power
	if power > 0 && m.data.State == types.ModuleStateIdle {
		m.data.State = types.ModuleStateCharging
	}
}

// SetVoltage sets the output voltage (depends on battery)
func (m *EK3Module) SetVoltage(voltage float64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	voltage = math.Max(50, math.Min(500, voltage))
	m.data.Voltage = voltage
	m.electricalModel.SetOutputVoltage(voltage)
}

// SetAmbientTemperature sets the ambient temperature
func (m *EK3Module) SetAmbientTemperature(temp float64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.data.TempAmbient = temp
	m.thermalModel.SetAmbient(temp)
}

// GetData returns a copy of the module data
func (m *EK3Module) GetData() types.Module {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.data
}

// GetTopFaults returns most likely faults
func (m *EK3Module) GetTopFaults(n int) []models.FaultPrediction {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.faultPredictor.GetTopFaults(n)
}

// GetRULResult returns detailed RUL estimate
func (m *EK3Module) GetRULResult() models.RULResult {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.rulEstimator.EstimateRUL(m.reliabilityMetrics)
}

// InjectFault injects a fault for testing
func (m *EK3Module) InjectFault(faultType models.FaultType, severity float64) {
	m.mu.Lock()
	defer m.mu.Unlock()

	injector := models.NewFaultInjector()
	injector.InjectFault(faultType, severity)
	injector.ApplyToMetrics(&m.reliabilityMetrics)

	// Update module state from injected metrics
	m.data.RdsOnRatio = m.reliabilityMetrics.RdsOnRatio
	m.data.ESRRatio = m.reliabilityMetrics.ESRRatio
}

// HandleMessage handles incoming CAN messages
func (m *EK3Module) HandleMessage(msg types.CANMessage) {
	m.mu.Lock()
	defer m.mu.Unlock()

	switch msg.MessageType {
	case "SetPower":
		if power, ok := msg.Payload["power"].(float64); ok {
			m.targetPower = math.Max(0, math.Min(3600, power))
			if m.targetPower > 0 && m.data.State == types.ModuleStateIdle {
				m.data.State = types.ModuleStateCharging
			}
		}
	case "SetVoltage":
		if voltage, ok := msg.Payload["voltage"].(float64); ok {
			m.data.Voltage = math.Max(50, math.Min(500, voltage))
			m.electricalModel.SetOutputVoltage(m.data.Voltage)
		}
	case "EmergencyStop":
		m.data.State = types.ModuleStateFaulted
		m.targetPower = 0
	case "Reset":
		if m.data.State == types.ModuleStateFaulted {
			m.data.State = types.ModuleStateIdle
			m.targetPower = 0
		}
	}
}
