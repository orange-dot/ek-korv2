package control

import (
	"math"
	"time"
)

// V2GMode represents the operating mode of the V2G controller
type V2GMode int

const (
	V2GModeIdle      V2GMode = iota // Not connected
	V2GModePrecharge               // Precharging DC link
	V2GModeStandby                 // Connected, waiting
	V2GModeCharging                // G2V: Grid to Vehicle
	V2GModeV2G                     // V2G: Vehicle to Grid
	V2GModeBalancing               // Reactive power only
	V2GModeFault                   // Fault condition
	V2GModeShutdown                // Controlled shutdown
)

// String returns string representation of V2GMode
func (m V2GMode) String() string {
	switch m {
	case V2GModeIdle:
		return "idle"
	case V2GModePrecharge:
		return "precharge"
	case V2GModeStandby:
		return "standby"
	case V2GModeCharging:
		return "charging"
	case V2GModeV2G:
		return "v2g"
	case V2GModeBalancing:
		return "balancing"
	case V2GModeFault:
		return "fault"
	case V2GModeShutdown:
		return "shutdown"
	default:
		return "unknown"
	}
}

// V2GFault represents fault conditions
type V2GFault uint32

const (
	V2GFaultNone        V2GFault = 0
	V2GFaultOverVoltage V2GFault = 1 << 0  // DC overvoltage
	V2GFaultUnderVolt   V2GFault = 1 << 1  // DC undervoltage
	V2GFaultOverCurrent V2GFault = 1 << 2  // Overcurrent
	V2GFaultOverTemp    V2GFault = 1 << 3  // Overtemperature
	V2GFaultGridLoss    V2GFault = 1 << 4  // Grid connection lost
	V2GFaultPLLUnlock   V2GFault = 1 << 5  // PLL cannot lock
	V2GFaultComm        V2GFault = 1 << 6  // Communication fault
	V2GFaultIsolation   V2GFault = 1 << 7  // Isolation fault
	V2GFaultPrecharge   V2GFault = 1 << 8  // Precharge timeout
	V2GFaultInternal    V2GFault = 1 << 9  // Internal error
)

// V2GControllerConfig holds configuration for the V2G controller
type V2GControllerConfig struct {
	// Nominal values
	PNominal   float64 // Nominal power [W] (3300 for EK3)
	VdcNominal float64 // Nominal DC voltage [V]
	VacNominal float64 // Nominal AC voltage [V] (400 3-phase)

	// Sub-controller configs
	PLLConfig     PLLConfig
	DrooConfig   DrooConfig
	CurrentConfig CurrentControllerConfig

	// Precharge
	PrechargeTarget  float64 // Target voltage ratio (0.95)
	PrechargeTimeout float64 // Timeout [s]

	// Protection thresholds
	VdcOVP float64 // DC overvoltage [V]
	VdcUVP float64 // DC undervoltage [V]
	IacOCP float64 // AC overcurrent [A]
	TempOTP float64 // Overtemperature [°C]

	// Thermal derating
	TempDerateStart float64 // Start derating [°C]
	TempDerateEnd   float64 // Zero power [°C]

	// Timing
	PLLLockTimeout float64 // Max time to achieve PLL lock [s]
	StartupDelay   float64 // Delay after PLL lock before power [s]
}

// DefaultV2GControllerConfig returns default configuration
func DefaultV2GControllerConfig() V2GControllerConfig {
	return V2GControllerConfig{
		PNominal:   3300.0,
		VdcNominal: 800.0,
		VacNominal: 400.0,

		PLLConfig:     DefaultPLLConfig(),
		DrooConfig:   DefaultDrooConfig(),
		CurrentConfig: DefaultCurrentControllerConfig(),

		PrechargeTarget:  0.95,
		PrechargeTimeout: 5.0,

		VdcOVP: 900.0,  // 900V DC max
		VdcUVP: 650.0,  // 650V DC min
		IacOCP: 20.0,   // 20A peak
		TempOTP: 125.0, // 125°C junction

		TempDerateStart: 85.0,
		TempDerateEnd:   105.0,

		PLLLockTimeout: 2.0,
		StartupDelay:   0.1,
	}
}

// V2GOutput represents the output of the V2G controller
type V2GOutput struct {
	// Voltage references
	VdRef float64 // d-axis voltage [V]
	VqRef float64 // q-axis voltage [V]

	// PWM duty cycles
	DutyA float64 // Phase A duty (0-1)
	DutyB float64 // Phase B duty (0-1)
	DutyC float64 // Phase C duty (0-1)

	// Power
	ActivePower   float64 // P [W]
	ReactivePower float64 // Q [VAr]
	PowerFactor   float64 // cos(φ)

	// Status
	Mode      V2GMode
	GridSync  bool
	Frequency float64
	Faults    V2GFault
}

// V2GController implements hierarchical V2G control with 5 layers:
//
// Layer 1: PLL - Grid synchronization (10-20 kHz)
// Layer 2: Current Control - dq-frame regulation (10 kHz)
// Layer 3: Droop Control - P(f) and Q(V) (1 kHz)
// Layer 4: Thermal/SOC - Power limiting (10 Hz)
// Layer 5: Fleet/ISO 15118 - Setpoints (1 Hz)
//
// Reference: tehnika/inzenjersko/en/07-v2g-control.md
type V2GController struct {
	config V2GControllerConfig
	mode   V2GMode

	// Sub-controllers
	pll     *PLL
	droop   *DrooController
	current *CurrentController

	// State
	vdc      float64 // DC bus voltage [V]
	idc      float64 // DC current [A]
	pActive  float64 // Active power [W]
	qReactive float64 // Reactive power [VAr]

	// Setpoints from higher level
	pSetpoint float64 // Power setpoint from fleet manager
	qSetpoint float64 // Q setpoint

	// Thermal state
	tempJunction float64 // Junction temperature [°C]
	thermalLimit float64 // Current thermal limit (0-1)

	// ISO 15118 interface
	evseID        string
	sessionActive bool
	energyLimit   float64 // kWh limit for session
	energyUsed    float64 // kWh used in session

	// Timing
	modeTime     float64 // Time in current mode [s]
	pllLockTime  float64 // Time waiting for PLL lock [s]

	// Faults
	faults      V2GFault
	faultTime   time.Time

	// Measurements cache
	lastVabc [3]float64
	lastIabc [3]float64
	lastVd   float64
	lastVq   float64
	lastId   float64
	lastIq   float64
}

// NewV2GController creates a new V2G controller with default config
func NewV2GController() *V2GController {
	return NewV2GControllerWithConfig(DefaultV2GControllerConfig())
}

// NewV2GControllerWithConfig creates a V2G controller with custom config
func NewV2GControllerWithConfig(config V2GControllerConfig) *V2GController {
	v := &V2GController{
		config:       config,
		mode:         V2GModeIdle,
		pll:          NewPLLWithConfig(config.PLLConfig),
		droop:        NewDrooControllerWithConfig(config.DrooConfig),
		current:      NewCurrentControllerWithConfig(config.CurrentConfig),
		thermalLimit: 1.0,
	}
	return v
}

// Update runs the complete V2G control loop
// vabc: three-phase grid voltages [V]
// iabc: three-phase grid currents [A]
// vdc: DC bus voltage [V]
// idc: DC current [A]
// tempJunction: junction temperature [°C]
// dt: time step [s]
func (v *V2GController) Update(vabc, iabc [3]float64, vdc, idc, tempJunction, dt float64) V2GOutput {
	// Cache measurements
	v.lastVabc = vabc
	v.lastIabc = iabc
	v.vdc = vdc
	v.idc = idc
	v.tempJunction = tempJunction
	v.modeTime += dt

	// Check protection first (highest priority)
	if fault := v.checkProtection(); fault != V2GFaultNone {
		v.setFault(fault)
	}

	// Run state machine
	output := v.runStateMachine(vabc, iabc, vdc, dt)

	// Update power measurements
	v.pActive = output.ActivePower
	v.qReactive = output.ReactivePower

	// Update session energy
	if v.sessionActive && v.mode == V2GModeCharging {
		v.energyUsed += v.pActive * dt / 3600000.0 // W·s to kWh
	}

	return output
}

// runStateMachine executes the state machine
func (v *V2GController) runStateMachine(vabc, iabc [3]float64, vdc, dt float64) V2GOutput {
	output := V2GOutput{
		Mode:   v.mode,
		Faults: v.faults,
	}

	switch v.mode {
	case V2GModeIdle:
		// No operation
		return output

	case V2GModePrecharge:
		return v.handlePrecharge(vdc, dt)

	case V2GModeStandby:
		return v.handleStandby(vabc, dt)

	case V2GModeCharging, V2GModeV2G, V2GModeBalancing:
		return v.handleActive(vabc, iabc, dt)

	case V2GModeFault:
		return v.handleFault(dt)

	case V2GModeShutdown:
		return v.handleShutdown(dt)
	}

	return output
}

// handlePrecharge manages DC link precharge
func (v *V2GController) handlePrecharge(vdc, dt float64) V2GOutput {
	output := V2GOutput{Mode: v.mode}

	targetVdc := v.config.VdcNominal * v.config.PrechargeTarget

	if vdc >= targetVdc {
		// Precharge complete
		v.setMode(V2GModeStandby)
		return output
	}

	if v.modeTime >= v.config.PrechargeTimeout {
		// Precharge timeout
		v.setFault(V2GFaultPrecharge)
		return output
	}

	return output
}

// handleStandby manages standby state (waiting for power command)
func (v *V2GController) handleStandby(vabc [3]float64, dt float64) V2GOutput {
	output := V2GOutput{Mode: v.mode}

	// Run PLL to stay synchronized
	theta, freq := v.pll.Update(vabc[0], vabc[1], vabc[2], dt)
	output.Frequency = freq
	output.GridSync = v.pll.IsLocked()

	// Check for PLL lock
	if !v.pll.IsLocked() {
		v.pllLockTime += dt
		if v.pllLockTime >= v.config.PLLLockTimeout {
			v.setFault(V2GFaultPLLUnlock)
			return output
		}
	} else {
		v.pllLockTime = 0
	}

	// Check if power is requested
	if v.pSetpoint > 10 { // Charging
		v.setMode(V2GModeCharging)
	} else if v.pSetpoint < -10 && v.droop.config.V2GEnabled { // V2G
		v.setMode(V2GModeV2G)
	}

	// Prepare current controller for bumpless transfer
	vd, vq := v.pll.GetVdVq()
	v.current.PrechargeIntegrator(vd, vq)

	_ = theta // Use theta when generating output
	return output
}

// handleActive manages active power transfer
func (v *V2GController) handleActive(vabc, iabc [3]float64, dt float64) V2GOutput {
	output := V2GOutput{Mode: v.mode}

	// Layer 1: PLL (grid synchronization)
	theta, freq := v.pll.Update(vabc[0], vabc[1], vabc[2], dt)
	omega := v.pll.GetOmega()
	output.Frequency = freq
	output.GridSync = v.pll.IsLocked()

	if !v.pll.IsLocked() {
		// Lost grid sync - emergency shutdown
		v.setMode(V2GModeShutdown)
		return output
	}

	// Layer 4: Thermal limiting (10 Hz equivalent)
	v.updateThermalLimit()
	thermallyLimitedP := v.pSetpoint * v.thermalLimit

	// Layer 3: Droop control (1 kHz)
	// Get voltage in pu for Q droop
	vd, _ := v.pll.GetVdVq()
	voltPU := math.Abs(vd) / (v.config.VacNominal * math.Sqrt(2) / math.Sqrt(3))
	if voltPU < 0.1 {
		voltPU = 1.0 // Default if measurement invalid
	}

	v.droop.SetPowerSetpoint(thermallyLimitedP, v.qSetpoint)
	pRef, qRef := v.droop.Update(freq, voltPU, dt)

	// Layer 2: Current control (10 kHz)
	// Transform currents to dq
	ialpha, ibeta := v.pll.clarkeTransform(iabc[0], iabc[1], iabc[2])
	id, iq := v.pll.parkTransform(ialpha, ibeta, theta)
	v.lastId = id
	v.lastIq = iq
	v.lastVd = vd

	// Convert power to current references
	idRef, iqRef := v.current.PowerToCurrentRef(pRef, qRef, vd, 0)

	// Run current controller
	vdRef, vqRef := v.current.Update(idRef, iqRef, id, iq, omega, dt)
	output.VdRef = vdRef
	output.VqRef = vqRef

	// Calculate modulation and duty cycles
	md, mq := v.current.VoltageToModulation(vdRef, vqRef)
	output.DutyA, output.DutyB, output.DutyC = v.current.VoltageToDuty(md, mq, theta)

	// Calculate actual power
	output.ActivePower, output.ReactivePower = v.current.CurrentToPower(id, iq, vd, 0)

	// Calculate power factor
	sMag := math.Sqrt(output.ActivePower*output.ActivePower + output.ReactivePower*output.ReactivePower)
	if sMag > 1 {
		output.PowerFactor = math.Abs(output.ActivePower) / sMag
	} else {
		output.PowerFactor = 1.0
	}

	// Update mode based on power direction
	if output.ActivePower > 10 {
		v.mode = V2GModeCharging
	} else if output.ActivePower < -10 {
		v.mode = V2GModeV2G
	} else if math.Abs(output.ReactivePower) > 10 {
		v.mode = V2GModeBalancing
	}

	output.Mode = v.mode
	return output
}

// handleFault manages fault state
func (v *V2GController) handleFault(dt float64) V2GOutput {
	output := V2GOutput{
		Mode:   V2GModeFault,
		Faults: v.faults,
	}

	// Zero all outputs
	output.DutyA = 0.5 // Centered (no switching)
	output.DutyB = 0.5
	output.DutyC = 0.5

	return output
}

// handleShutdown manages controlled shutdown
func (v *V2GController) handleShutdown(dt float64) V2GOutput {
	output := V2GOutput{Mode: V2GModeShutdown}

	// Ramp power to zero
	pActual, qActual := v.droop.GetPowerActual()
	if math.Abs(pActual) < 10 && math.Abs(qActual) < 10 {
		// Shutdown complete
		v.setMode(V2GModeStandby)
	}

	// Use droop controller's ramp-down
	v.droop.SetPowerSetpoint(0, 0)

	return output
}

// updateThermalLimit calculates thermal derating
func (v *V2GController) updateThermalLimit() {
	if v.tempJunction <= v.config.TempDerateStart {
		v.thermalLimit = 1.0
	} else if v.tempJunction >= v.config.TempDerateEnd {
		v.thermalLimit = 0.0
	} else {
		// Linear derating
		range_ := v.config.TempDerateEnd - v.config.TempDerateStart
		excess := v.tempJunction - v.config.TempDerateStart
		v.thermalLimit = 1.0 - (excess / range_)
	}
}

// checkProtection checks all protection limits
func (v *V2GController) checkProtection() V2GFault {
	var faults V2GFault

	// DC voltage
	if v.vdc > v.config.VdcOVP {
		faults |= V2GFaultOverVoltage
	}
	if v.vdc < v.config.VdcUVP && v.mode != V2GModeIdle && v.mode != V2GModePrecharge {
		faults |= V2GFaultUnderVolt
	}

	// AC current (check all phases)
	for _, i := range v.lastIabc {
		if math.Abs(i) > v.config.IacOCP {
			faults |= V2GFaultOverCurrent
			break
		}
	}

	// Temperature
	if v.tempJunction > v.config.TempOTP {
		faults |= V2GFaultOverTemp
	}

	return faults
}

// setMode changes operating mode
func (v *V2GController) setMode(mode V2GMode) {
	if v.mode != mode {
		v.mode = mode
		v.modeTime = 0
	}
}

// setFault triggers fault mode
func (v *V2GController) setFault(fault V2GFault) {
	v.faults |= fault
	v.faultTime = time.Now()
	v.setMode(V2GModeFault)
}

// SetMode sets operating mode (for external control)
func (v *V2GController) SetMode(mode V2GMode) {
	v.setMode(mode)
}

// SetPowerSetpoint sets power setpoint from higher level
func (v *V2GController) SetPowerSetpoint(p, q float64) {
	v.pSetpoint = p
	v.qSetpoint = q
}

// StartSession starts an ISO 15118 charging session
func (v *V2GController) StartSession(evseID string, energyLimitKWh float64) {
	v.evseID = evseID
	v.energyLimit = energyLimitKWh
	v.energyUsed = 0
	v.sessionActive = true

	if v.mode == V2GModeIdle {
		v.setMode(V2GModePrecharge)
	}
}

// EndSession ends the charging session
func (v *V2GController) EndSession() {
	v.sessionActive = false
	v.setMode(V2GModeShutdown)
}

// GetMode returns current operating mode
func (v *V2GController) GetMode() V2GMode {
	return v.mode
}

// IsGridSynced returns true if PLL is locked
func (v *V2GController) IsGridSynced() bool {
	return v.pll.IsLocked()
}

// GetPower returns current power
func (v *V2GController) GetPower() (p, q float64) {
	return v.pActive, v.qReactive
}

// GetFrequency returns grid frequency
func (v *V2GController) GetFrequency() float64 {
	return v.pll.GetFrequency()
}

// GetFaults returns current faults
func (v *V2GController) GetFaults() V2GFault {
	return v.faults
}

// ClearFaults clears faults and returns to standby
func (v *V2GController) ClearFaults() {
	v.faults = V2GFaultNone
	if v.mode == V2GModeFault {
		v.setMode(V2GModeStandby)
	}
}

// GetThermalLimit returns current thermal limit (0-1)
func (v *V2GController) GetThermalLimit() float64 {
	return v.thermalLimit
}

// GetSessionEnergy returns energy used in current session
func (v *V2GController) GetSessionEnergy() float64 {
	return v.energyUsed
}

// Reset resets the controller
func (v *V2GController) Reset() {
	v.mode = V2GModeIdle
	v.modeTime = 0
	v.pllLockTime = 0
	v.faults = V2GFaultNone
	v.pSetpoint = 0
	v.qSetpoint = 0
	v.thermalLimit = 1.0
	v.sessionActive = false
	v.energyUsed = 0

	v.pll.Reset()
	v.droop.Reset()
	v.current.Reset()
}

// GetPLL returns the PLL for direct access
func (v *V2GController) GetPLL() *PLL {
	return v.pll
}

// GetDroop returns the droop controller for direct access
func (v *V2GController) GetDroop() *DrooController {
	return v.droop
}

// GetCurrentController returns the current controller for direct access
func (v *V2GController) GetCurrentController() *CurrentController {
	return v.current
}
