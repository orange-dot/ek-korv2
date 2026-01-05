package control

import (
	"math"
)

// DrooMode represents the operating mode of droop control
type DrooMode int

const (
	DrooModeDisabled   DrooMode = iota // Droop control disabled
	DrooModeCharging                   // Grid-to-Vehicle (consuming power)
	DrooModeV2G                        // Vehicle-to-Grid (exporting power)
	DrooModeStandby                    // Connected but not transferring
	DrooModeProtection                 // Grid protection triggered
)

// String returns string representation of DrooMode
func (m DrooMode) String() string {
	switch m {
	case DrooModeDisabled:
		return "disabled"
	case DrooModeCharging:
		return "charging"
	case DrooModeV2G:
		return "v2g"
	case DrooModeStandby:
		return "standby"
	case DrooModeProtection:
		return "protection"
	default:
		return "unknown"
	}
}

// DrooConfig holds configuration for droop control
type DrooConfig struct {
	// Active power droop P(f)
	PNominal     float64 // Nominal power [W] (e.g., 3300 for EK3)
	FreqNominal  float64 // Nominal frequency [Hz] (50 or 60)
	FreqDeadband float64 // Deadband [Hz] (±0.05 = 50mHz)
	FreqDroop    float64 // Droop coefficient [%] (4% = 0.04)
	FreqMin      float64 // Minimum frequency for protection [Hz] (47.5)
	FreqMax      float64 // Maximum frequency for protection [Hz] (51.5)

	// Reactive power droop Q(V)
	QMax         float64 // Maximum reactive power [VAr]
	VoltNominal  float64 // Nominal voltage [V] (400)
	VoltDeadband float64 // Deadband [pu] (±0.05)
	VoltDroop    float64 // Droop coefficient [%] (5% = 0.05)
	VoltMin      float64 // Minimum voltage [pu] (0.9)
	VoltMax      float64 // Maximum voltage [pu] (1.1)

	// Power factor constraint
	PowerFactorMin float64 // Minimum power factor (0.9)

	// Ramp rate limiting
	PowerRampRate float64 // Maximum power ramp [W/s] (10% Pn/s)
	QRampRate     float64 // Maximum Q ramp [VAr/s]

	// V2G specific
	V2GEnabled          bool    // Enable V2G (export to grid)
	V2GMaxExport        float64 // Maximum V2G export power [W]
	V2GFreqThreshold    float64 // Frequency below which V2G activates [Hz]
	V2GResponseTime     float64 // Time to reach full V2G power [s]
}

// DefaultDrooConfig returns default configuration for EK3 module
func DefaultDrooConfig() DrooConfig {
	return DrooConfig{
		// P(f) droop
		PNominal:     3300.0, // 3.3 kW EK3 module
		FreqNominal:  50.0,
		FreqDeadband: 0.05, // ±50 mHz
		FreqDroop:    0.04, // 4%
		FreqMin:      47.5,
		FreqMax:      51.5,

		// Q(V) droop
		QMax:         1650.0, // Half of P for typical reactive capability
		VoltNominal:  400.0,
		VoltDeadband: 0.05, // ±5%
		VoltDroop:    0.05, // 5%
		VoltMin:      0.9,
		VoltMax:      1.1,

		// Power factor
		PowerFactorMin: 0.9,

		// Ramp rates
		PowerRampRate: 330.0, // 10% Pn/s = 330 W/s
		QRampRate:     165.0,

		// V2G
		V2GEnabled:       true,
		V2GMaxExport:     3300.0, // Full bidirectional
		V2GFreqThreshold: 49.8,   // Activate V2G below 49.8 Hz
		V2GResponseTime:  2.0,    // 2 seconds to full power
	}
}

// DrooController implements frequency and voltage droop control
// for grid-following/grid-forming V2G operation.
//
// P(f) Droop: Adjusts active power based on grid frequency deviation
// Q(V) Droop: Adjusts reactive power based on grid voltage deviation
//
// Reference: tehnika/inzenjersko/en/07-v2g-control.md Section 2-3
type DrooController struct {
	config DrooConfig
	mode   DrooMode

	// Power references (after droop calculation)
	pRef float64 // Active power reference [W]
	qRef float64 // Reactive power reference [Q]

	// Actual outputs (after ramp limiting)
	pActual float64 // Current active power [W]
	qActual float64 // Current reactive power [VAr]

	// Setpoints from higher level
	pSetpoint float64 // Power setpoint from fleet manager [W]
	qSetpoint float64 // Q setpoint [VAr]

	// Grid measurements
	lastFreq    float64 // Last grid frequency [Hz]
	lastVoltage float64 // Last grid voltage [pu]

	// Protection state
	protectionTriggered bool
	protectionTime      float64 // Time since protection triggered [s]
	protectionHoldoff   float64 // Holdoff before reconnect [s]

	// Droop coefficients (calculated)
	kpFreq float64 // W/Hz for P(f)
	kqVolt float64 // VAr/pu for Q(V)
}

// NewDrooController creates a new droop controller with default config
func NewDrooController(pNominal float64) *DrooController {
	config := DefaultDrooConfig()
	config.PNominal = pNominal
	config.PowerRampRate = pNominal * 0.1 // 10% Pn/s
	return NewDrooControllerWithConfig(config)
}

// NewDrooControllerWithConfig creates a droop controller with custom config
func NewDrooControllerWithConfig(config DrooConfig) *DrooController {
	dc := &DrooController{
		config:            config,
		mode:              DrooModeStandby,
		protectionHoldoff: 3.0, // 3 second holdoff after protection
	}
	dc.calculateDrooCoefficients()
	return dc
}

// calculateDrooCoefficients calculates droop gains from config
func (d *DrooController) calculateDrooCoefficients() {
	// P(f) droop coefficient
	// At droop% frequency deviation, output is 100% power
	// Kp = Pn / (droop × f_nominal)
	// For 4% droop at 50 Hz: Kp = 3300 / (0.04 × 50) = 1650 W/Hz
	d.kpFreq = d.config.PNominal / (d.config.FreqDroop * d.config.FreqNominal)

	// Q(V) droop coefficient
	// Kq = Qmax / droop
	// For 5% droop: Kq = 1650 / 0.05 = 33000 VAr/pu
	d.kqVolt = d.config.QMax / d.config.VoltDroop
}

// SetConfig updates the configuration
func (d *DrooController) SetConfig(config DrooConfig) {
	d.config = config
	d.calculateDrooCoefficients()
}

// SetPowerSetpoint sets the base power setpoint from higher level control
func (d *DrooController) SetPowerSetpoint(p, q float64) {
	d.pSetpoint = p
	d.qSetpoint = q
}

// Update calculates power references based on grid measurements
// frequency is grid frequency [Hz]
// voltage is grid voltage [pu] (1.0 = nominal)
// dt is time step [s]
// Returns actual power outputs after droop and ramp limiting
func (d *DrooController) Update(frequency, voltage, dt float64) (pOut, qOut float64) {
	d.lastFreq = frequency
	d.lastVoltage = voltage

	// Check grid protection first
	if d.checkGridProtection(frequency) {
		d.mode = DrooModeProtection
		return d.handleProtection(dt)
	}

	// If coming out of protection, check holdoff
	if d.protectionTriggered {
		d.protectionTime += dt
		if d.protectionTime < d.protectionHoldoff {
			return d.applyRampRate(0, 0, dt)
		}
		d.protectionTriggered = false
		d.protectionTime = 0
	}

	// Calculate P droop
	pDroop := d.calculatePDroop(frequency)

	// Calculate Q droop
	qDroop := d.calculateQDroop(voltage)

	// Combine setpoint with droop
	d.pRef = d.pSetpoint + pDroop
	d.qRef = d.qSetpoint + qDroop

	// Apply power factor constraint
	d.applyPowerFactorLimit()

	// Determine operating mode
	d.updateMode()

	// Apply V2G limits if in V2G mode
	if d.mode == DrooModeV2G {
		d.pRef = clamp(d.pRef, -d.config.V2GMaxExport, 0)
	} else if d.mode == DrooModeCharging {
		d.pRef = clamp(d.pRef, 0, d.config.PNominal)
	}

	// Apply ramp rate limiting
	return d.applyRampRate(d.pRef, d.qRef, dt)
}

// calculatePDroop calculates active power adjustment from frequency
func (d *DrooController) calculatePDroop(freq float64) float64 {
	// Frequency deviation from nominal
	deltaF := freq - d.config.FreqNominal

	// Check if within deadband
	if math.Abs(deltaF) <= d.config.FreqDeadband {
		return 0
	}

	// Effective deviation (outside deadband)
	var effectiveDeltaF float64
	if deltaF > 0 {
		effectiveDeltaF = deltaF - d.config.FreqDeadband
	} else {
		effectiveDeltaF = deltaF + d.config.FreqDeadband
	}

	// Droop response
	// Positive deltaF (high frequency) → reduce charging (or increase V2G export)
	// Negative deltaF (low frequency) → increase charging (or reduce V2G)
	// P = -Kp × Δf (negative sign for conventional droop)
	pDroop := -d.kpFreq * effectiveDeltaF

	return pDroop
}

// calculateQDroop calculates reactive power adjustment from voltage
func (d *DrooController) calculateQDroop(voltPU float64) float64 {
	// Voltage deviation from nominal (1.0 pu)
	deltaV := voltPU - 1.0

	// Check if within deadband
	if math.Abs(deltaV) <= d.config.VoltDeadband {
		return 0
	}

	// Effective deviation (outside deadband)
	var effectiveDeltaV float64
	if deltaV > 0 {
		effectiveDeltaV = deltaV - d.config.VoltDeadband
	} else {
		effectiveDeltaV = deltaV + d.config.VoltDeadband
	}

	// Droop response
	// High voltage → absorb reactive power (inductive, Q > 0)
	// Low voltage → generate reactive power (capacitive, Q < 0)
	// Q = -Kq × ΔV
	qDroop := -d.kqVolt * effectiveDeltaV

	return clamp(qDroop, -d.config.QMax, d.config.QMax)
}

// applyPowerFactorLimit constrains Q to maintain minimum power factor
func (d *DrooController) applyPowerFactorLimit() {
	// Power factor = P / sqrt(P² + Q²)
	// For PF >= 0.9: Q <= P × tan(acos(0.9)) ≈ P × 0.484
	pAbs := math.Abs(d.pRef)
	if pAbs < 1 {
		return // Avoid division issues at low power
	}

	maxQ := pAbs * math.Tan(math.Acos(d.config.PowerFactorMin))
	d.qRef = clamp(d.qRef, -maxQ, maxQ)
}

// applyRampRate limits rate of change of power
func (d *DrooController) applyRampRate(pTarget, qTarget, dt float64) (p, q float64) {
	// P ramp
	maxDeltaP := d.config.PowerRampRate * dt
	deltaP := pTarget - d.pActual
	if math.Abs(deltaP) > maxDeltaP {
		if deltaP > 0 {
			d.pActual += maxDeltaP
		} else {
			d.pActual -= maxDeltaP
		}
	} else {
		d.pActual = pTarget
	}

	// Q ramp
	maxDeltaQ := d.config.QRampRate * dt
	deltaQ := qTarget - d.qActual
	if math.Abs(deltaQ) > maxDeltaQ {
		if deltaQ > 0 {
			d.qActual += maxDeltaQ
		} else {
			d.qActual -= maxDeltaQ
		}
	} else {
		d.qActual = qTarget
	}

	return d.pActual, d.qActual
}

// checkGridProtection checks if frequency is within safe limits
func (d *DrooController) checkGridProtection(freq float64) bool {
	return freq < d.config.FreqMin || freq > d.config.FreqMax
}

// handleProtection manages protection state
func (d *DrooController) handleProtection(dt float64) (p, q float64) {
	if !d.protectionTriggered {
		d.protectionTriggered = true
		d.protectionTime = 0
	}

	// Ramp power to zero quickly (5x normal ramp rate)
	fastRamp := d.config.PowerRampRate * 5
	if d.pActual > 0 {
		d.pActual = math.Max(0, d.pActual-fastRamp*dt)
	} else {
		d.pActual = math.Min(0, d.pActual+fastRamp*dt)
	}
	if d.qActual > 0 {
		d.qActual = math.Max(0, d.qActual-fastRamp*dt)
	} else {
		d.qActual = math.Min(0, d.qActual+fastRamp*dt)
	}

	return d.pActual, d.qActual
}

// updateMode determines current operating mode
func (d *DrooController) updateMode() {
	if d.protectionTriggered {
		d.mode = DrooModeProtection
		return
	}

	if !d.config.V2GEnabled || d.pRef >= 0 {
		if d.pRef > 10 { // Small threshold
			d.mode = DrooModeCharging
		} else {
			d.mode = DrooModeStandby
		}
	} else {
		d.mode = DrooModeV2G
	}
}

// GetMode returns current operating mode
func (d *DrooController) GetMode() DrooMode {
	return d.mode
}

// GetPowerRef returns current power references (before ramp)
func (d *DrooController) GetPowerRef() (p, q float64) {
	return d.pRef, d.qRef
}

// GetPowerActual returns actual power outputs (after ramp)
func (d *DrooController) GetPowerActual() (p, q float64) {
	return d.pActual, d.qActual
}

// IsV2GEnabled returns true if V2G is enabled and frequency allows
func (d *DrooController) IsV2GEnabled() bool {
	return d.config.V2GEnabled && d.lastFreq < d.config.V2GFreqThreshold
}

// IsProtectionTriggered returns true if grid protection has activated
func (d *DrooController) IsProtectionTriggered() bool {
	return d.protectionTriggered
}

// GetDrooCoefficients returns calculated droop coefficients
func (d *DrooController) GetDrooCoefficients() (kpFreq, kqVolt float64) {
	return d.kpFreq, d.kqVolt
}

// Reset resets controller to initial state
func (d *DrooController) Reset() {
	d.mode = DrooModeStandby
	d.pRef = 0
	d.qRef = 0
	d.pActual = 0
	d.qActual = 0
	d.pSetpoint = 0
	d.qSetpoint = 0
	d.protectionTriggered = false
	d.protectionTime = 0
}

// Enable enables the droop controller
func (d *DrooController) Enable() {
	if d.mode == DrooModeDisabled {
		d.mode = DrooModeStandby
	}
}

// Disable disables the droop controller
func (d *DrooController) Disable() {
	d.mode = DrooModeDisabled
}
