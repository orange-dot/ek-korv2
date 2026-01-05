package control

import (
	"math"
)

// CurrentControllerConfig holds configuration for the dq-frame current controller
type CurrentControllerConfig struct {
	// Inductances [H]
	Ld float64 // d-axis inductance
	Lq float64 // q-axis inductance

	// Resistance [Ω]
	Rs float64 // Stator/filter resistance

	// PI controller gains
	KpD float64 // Proportional gain for d-axis
	KiD float64 // Integral gain for d-axis
	KpQ float64 // Proportional gain for q-axis
	KiQ float64 // Integral gain for q-axis

	// Current limits [A]
	IdMax float64 // Maximum d-axis current
	IqMax float64 // Maximum q-axis current

	// Voltage limits [V]
	VdcMax float64 // DC link voltage (determines max AC voltage)

	// Bandwidth [Hz]
	Bandwidth float64 // Target bandwidth (typically 1 kHz)

	// Anti-windup
	AntiWindupGain float64 // Back-calculation anti-windup gain
}

// DefaultCurrentControllerConfig returns default configuration
func DefaultCurrentControllerConfig() CurrentControllerConfig {
	return CurrentControllerConfig{
		// Typical filter values for 3.3kW module
		Ld: 500e-6,  // 500 µH
		Lq: 500e-6,  // 500 µH
		Rs: 0.05,    // 50 mΩ

		// PI gains for ~1 kHz bandwidth
		// Tuned using: Kp = Bandwidth × L, Ki = Rs / L × Kp
		KpD: 3.14,  // 2π × 1000 × 500e-6
		KiD: 314.0, // Rs/L × Kp = 0.05/500e-6 × 3.14
		KpQ: 3.14,
		KiQ: 314.0,

		// Limits
		IdMax:  15.0,  // 15 A peak (for 3.3kW @ 220V)
		IqMax:  15.0,
		VdcMax: 800.0, // 800V DC link

		// Bandwidth
		Bandwidth: 1000.0, // 1 kHz

		// Anti-windup
		AntiWindupGain: 1.0,
	}
}

// CurrentController implements decoupled dq-frame current control
// for AC/DC converters in V2G applications.
//
// Features:
// - Decoupled d and q axis control
// - Cross-coupling compensation
// - Anti-windup on integrators
// - Circular voltage limiting
//
// Reference: tehnika/inzenjersko/en/07-v2g-control.md Section 4
type CurrentController struct {
	config CurrentControllerConfig

	// Integrator states
	integD float64
	integQ float64

	// Anti-windup saturation flags
	saturatedD bool
	saturatedQ bool

	// Output voltages
	vdRef float64
	vqRef float64

	// Feedforward terms (last calculated)
	vdFF float64
	vqFF float64

	// Decoupling terms (last calculated)
	vdDec float64
	vqDec float64

	// Error signals (for diagnostics)
	errorD float64
	errorQ float64
}

// NewCurrentController creates a new current controller with default config
func NewCurrentController() *CurrentController {
	return NewCurrentControllerWithConfig(DefaultCurrentControllerConfig())
}

// NewCurrentControllerWithConfig creates a current controller with custom config
func NewCurrentControllerWithConfig(config CurrentControllerConfig) *CurrentController {
	return &CurrentController{
		config: config,
	}
}

// SetBandwidth recalculates PI gains for a given bandwidth
func (c *CurrentController) SetBandwidth(bandwidth float64) {
	c.config.Bandwidth = bandwidth

	// Standard tuning for current control
	// Kp = bandwidth × L
	// Ki = Rs × bandwidth
	omega := 2 * math.Pi * bandwidth
	c.config.KpD = omega * c.config.Ld
	c.config.KiD = c.config.Rs * omega
	c.config.KpQ = omega * c.config.Lq
	c.config.KiQ = c.config.Rs * omega
}

// Update processes current references and returns voltage references
// idRef, iqRef: reference currents [A]
// idMeas, iqMeas: measured currents [A]
// omega: grid angular velocity [rad/s] (from PLL)
// dt: time step [s]
// Returns: vdRef, vqRef voltage references [V]
func (c *CurrentController) Update(idRef, iqRef, idMeas, iqMeas, omega, dt float64) (vd, vq float64) {
	// Limit current references
	idRef = clamp(idRef, -c.config.IdMax, c.config.IdMax)
	iqRef = clamp(iqRef, -c.config.IqMax, c.config.IqMax)

	// Calculate errors
	c.errorD = idRef - idMeas
	c.errorQ = iqRef - iqMeas

	// PI control for d-axis
	pTermD := c.config.KpD * c.errorD
	c.integD += c.config.KiD * c.errorD * dt
	vdPI := pTermD + c.integD

	// PI control for q-axis
	pTermQ := c.config.KpQ * c.errorQ
	c.integQ += c.config.KiQ * c.errorQ * dt
	vqPI := pTermQ + c.integQ

	// Cross-coupling compensation (decoupling)
	// In dq-frame: coupling terms are ω×L×i from the other axis
	c.vdDec = -omega * c.config.Lq * iqMeas
	c.vqDec = omega * c.config.Ld * idMeas

	// Feedforward (resistive drop compensation)
	c.vdFF = c.config.Rs * idMeas
	c.vqFF = c.config.Rs * iqMeas

	// Total voltage reference
	c.vdRef = vdPI + c.vdDec + c.vdFF
	c.vqRef = vqPI + c.vqDec + c.vqFF

	// Apply voltage limiting with anti-windup
	vdLim, vqLim, saturated := c.limitVoltage(c.vdRef, c.vqRef)

	// Anti-windup: if saturated, prevent integrator from winding up
	if saturated {
		c.applyAntiWindup(c.vdRef-vdLim, c.vqRef-vqLim, dt)
	}

	c.vdRef = vdLim
	c.vqRef = vqLim

	return c.vdRef, c.vqRef
}

// limitVoltage applies circular voltage limiting
// Returns limited voltages and saturation flag
func (c *CurrentController) limitVoltage(vd, vq float64) (vdLim, vqLim float64, saturated bool) {
	// Maximum AC voltage magnitude (considering modulation index)
	// For SVPWM: Vac_max = Vdc / sqrt(3) ≈ 0.577 × Vdc
	// With margin: use 0.95 × 0.577 = 0.548
	vMax := c.config.VdcMax * 0.548

	// Calculate voltage magnitude
	vMag := math.Sqrt(vd*vd + vq*vq)

	if vMag <= vMax {
		return vd, vq, false
	}

	// Scale down proportionally (maintain angle)
	scale := vMax / vMag
	return vd * scale, vq * scale, true
}

// applyAntiWindup uses back-calculation method to prevent integrator windup
func (c *CurrentController) applyAntiWindup(vdError, vqError, dt float64) {
	// Back-calculation: reduce integrator by scaled error
	c.integD -= c.config.AntiWindupGain * vdError * dt
	c.integQ -= c.config.AntiWindupGain * vqError * dt
}

// PowerToCurrentRef converts power references to current references
// Uses: P = 1.5 × (Vd×Id + Vq×Iq), Q = 1.5 × (Vq×Id - Vd×Iq)
// For grid-following with Vq = 0: Id = P / (1.5 × Vd), Iq = -Q / (1.5 × Vd)
func (c *CurrentController) PowerToCurrentRef(pRef, qRef, vd, vq float64) (idRef, iqRef float64) {
	// Avoid division by zero
	if math.Abs(vd) < 1.0 && math.Abs(vq) < 1.0 {
		return 0, 0
	}

	vMag := math.Sqrt(vd*vd + vq*vq)
	if vMag < 1.0 {
		return 0, 0
	}

	// For standard dq alignment (Vd = |V|, Vq ≈ 0):
	// P = 1.5 × Vd × Id  →  Id = P / (1.5 × Vd)
	// Q = -1.5 × Vd × Iq  →  Iq = -Q / (1.5 × Vd)
	k := 1.5 * vd
	if math.Abs(k) < 1.0 {
		k = 1.0 // Prevent division by very small numbers
	}

	idRef = pRef / k
	iqRef = -qRef / k

	// Apply limits
	idRef = clamp(idRef, -c.config.IdMax, c.config.IdMax)
	iqRef = clamp(iqRef, -c.config.IqMax, c.config.IqMax)

	return idRef, iqRef
}

// CurrentToPower converts measured currents to power
func (c *CurrentController) CurrentToPower(id, iq, vd, vq float64) (p, q float64) {
	// P = 1.5 × (Vd×Id + Vq×Iq)
	// Q = 1.5 × (Vq×Id - Vd×Iq)
	p = 1.5 * (vd*id + vq*iq)
	q = 1.5 * (vq*id - vd*iq)
	return p, q
}

// GetVoltageRef returns current voltage references
func (c *CurrentController) GetVoltageRef() (vd, vq float64) {
	return c.vdRef, c.vqRef
}

// GetError returns current error signals
func (c *CurrentController) GetError() (errD, errQ float64) {
	return c.errorD, c.errorQ
}

// GetIntegrator returns integrator states
func (c *CurrentController) GetIntegrator() (integD, integQ float64) {
	return c.integD, c.integQ
}

// GetDecoupling returns decoupling terms
func (c *CurrentController) GetDecoupling() (vdDec, vqDec float64) {
	return c.vdDec, c.vqDec
}

// GetFeedforward returns feedforward terms
func (c *CurrentController) GetFeedforward() (vdFF, vqFF float64) {
	return c.vdFF, c.vqFF
}

// IsSaturated returns true if voltage output is saturated
func (c *CurrentController) IsSaturated() bool {
	return c.saturatedD || c.saturatedQ
}

// Reset resets controller to initial state
func (c *CurrentController) Reset() {
	c.integD = 0
	c.integQ = 0
	c.saturatedD = false
	c.saturatedQ = false
	c.vdRef = 0
	c.vqRef = 0
	c.vdFF = 0
	c.vqFF = 0
	c.vdDec = 0
	c.vqDec = 0
	c.errorD = 0
	c.errorQ = 0
}

// SetIntegrator manually sets integrator values (for bumpless transfer)
func (c *CurrentController) SetIntegrator(integD, integQ float64) {
	c.integD = integD
	c.integQ = integQ
}

// PrechargeIntegrator initializes integrator for bumpless startup
// Call this before enabling with known initial voltages
func (c *CurrentController) PrechargeIntegrator(vdInit, vqInit float64) {
	// Precharge integrators to produce approximately the initial voltages
	// Assuming zero error, PI output ≈ integrator
	c.integD = vdInit
	c.integQ = vqInit
}

// VoltageToModulation converts dq voltages to modulation indices
// Returns: md, mq modulation indices (-1 to 1)
func (c *CurrentController) VoltageToModulation(vd, vq float64) (md, mq float64) {
	// Modulation index = Vac / (Vdc/2) for half-bridge
	// For full-bridge: m = Vac / Vdc
	vdcHalf := c.config.VdcMax / 2
	md = vd / vdcHalf
	mq = vq / vdcHalf

	// Clamp to valid range
	md = clamp(md, -1, 1)
	mq = clamp(mq, -1, 1)

	return md, mq
}

// VoltageToDuty converts modulation to PWM duty cycles for SVPWM
// Returns duty cycles for phases A, B, C (0 to 1)
func (c *CurrentController) VoltageToDuty(md, mq, theta float64) (da, db, dc float64) {
	// Convert back to αβ
	malpha, mbeta := inversePark(md, mq, theta)

	// Convert to abc
	ma, mb, mc := inverseClarke(malpha, mbeta)

	// Add common-mode (SVPWM) and convert to duty
	// Simple SVPWM: add offset to center waveforms
	mMin := math.Min(ma, math.Min(mb, mc))
	mMax := math.Max(ma, math.Max(mb, mc))
	offset := -(mMax + mMin) / 2

	da = (ma + offset + 1) / 2
	db = (mb + offset + 1) / 2
	dc = (mc + offset + 1) / 2

	// Clamp to valid duty cycle range
	da = clamp(da, 0, 1)
	db = clamp(db, 0, 1)
	dc = clamp(dc, 0, 1)

	return da, db, dc
}

// inversePark performs inverse Park transformation (dq → αβ)
func inversePark(d, q, theta float64) (alpha, beta float64) {
	cosTheta := math.Cos(theta)
	sinTheta := math.Sin(theta)
	alpha = d*cosTheta - q*sinTheta
	beta = d*sinTheta + q*cosTheta
	return alpha, beta
}

// inverseClarke performs inverse Clarke transformation (αβ → abc)
func inverseClarke(alpha, beta float64) (a, b, c float64) {
	sqrt3 := math.Sqrt(3)
	a = alpha
	b = -0.5*alpha + sqrt3/2.0*beta
	c = -0.5*alpha - sqrt3/2.0*beta
	return a, b, c
}
