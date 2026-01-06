// Package control implements V2G control algorithms for EK3 modules.
// This includes PLL grid synchronization, droop control, and current control.
package control

import (
	"math"
)

// PLLState represents the state of the Phase-Locked Loop
type PLLState int

const (
	PLLStateAcquiring PLLState = iota // Searching for lock
	PLLStateLocked                    // Synchronized with grid
	PLLStateCoasting                  // Signal lost, using last frequency
	PLLStateFault                     // Error condition
)

// String returns the string representation of PLLState
func (s PLLState) String() string {
	switch s {
	case PLLStateAcquiring:
		return "acquiring"
	case PLLStateLocked:
		return "locked"
	case PLLStateCoasting:
		return "coasting"
	case PLLStateFault:
		return "fault"
	default:
		return "unknown"
	}
}

// PLLConfig holds configuration parameters for the PLL
type PLLConfig struct {
	// PI controller gains (default: Kp=178, Ki=15790 for 20Hz bandwidth)
	Kp float64
	Ki float64

	// Bandwidth and damping
	Bandwidth    float64 // Hz (typically 15-25 Hz)
	DampingRatio float64 // Typically 0.707 (critically damped)

	// Lock detection
	LockThreshold  float64 // Max Vq error for lock detection [V]
	LockSamples    int     // Number of consecutive samples to confirm lock
	UnlockSamples  int     // Number of consecutive samples to lose lock

	// Frequency limits
	FreqMin float64 // Minimum valid frequency [Hz]
	FreqMax float64 // Maximum valid frequency [Hz]

	// Nominal values
	FreqNominal float64 // Nominal grid frequency [Hz] (50 or 60)
	VoltNominal float64 // Nominal grid voltage [V] (400 for 3-phase)
}

// DefaultPLLConfig returns default configuration for 50Hz grid
func DefaultPLLConfig() PLLConfig {
	return PLLConfig{
		Kp:             178.0,
		Ki:             15790.0,
		Bandwidth:      20.0,
		DampingRatio:   0.707,
		LockThreshold:  10.0, // 10V Vq error threshold
		LockSamples:    100,  // 100 samples at 10kHz = 10ms
		UnlockSamples:  50,
		FreqMin:        45.0,
		FreqMax:        55.0,
		FreqNominal:    50.0,
		VoltNominal:    400.0,
	}
}

// PLL implements Synchronous Reference Frame Phase-Locked Loop (SRF-PLL)
// for grid synchronization in V2G applications.
//
// The SRF-PLL uses Clarke and Park transformations to extract
// the grid phase angle and frequency from three-phase voltages.
//
// Reference: tehnika/inzenjersko/en/07-v2g-control.md Section 1
type PLL struct {
	config PLLConfig

	// State
	state     PLLState
	theta     float64 // Phase angle [rad]
	omega     float64 // Angular velocity [rad/s]
	frequency float64 // Measured frequency [Hz]

	// PI controller state
	integrator    float64
	integratorMax float64 // Anti-windup limit

	// Lock detection counters
	lockCounter   int
	unlockCounter int

	// Last measurements for diagnostics
	lastVd    float64
	lastVq    float64
	lastValpha float64
	lastVbeta  float64

	// Coasting state
	coastingOmega float64 // Last known omega before signal loss
}

// NewPLL creates a new PLL with default configuration
func NewPLL() *PLL {
	return NewPLLWithConfig(DefaultPLLConfig())
}

// NewPLLWithConfig creates a new PLL with custom configuration
func NewPLLWithConfig(config PLLConfig) *PLL {
	pll := &PLL{
		config:        config,
		state:         PLLStateAcquiring,
		theta:         0,
		omega:         2 * math.Pi * config.FreqNominal,
		frequency:     config.FreqNominal,
		integrator:    0,
		integratorMax: 2 * math.Pi * 10, // ±10 Hz deviation max
		lockCounter:   0,
		unlockCounter: 0,
	}
	return pll
}

// SetBandwidth recalculates Kp and Ki for a given bandwidth
// Using standard second-order system tuning
func (p *PLL) SetBandwidth(bandwidth, dampingRatio float64) {
	p.config.Bandwidth = bandwidth
	p.config.DampingRatio = dampingRatio

	// Standard formulas for second-order PLL tuning
	// ωn = 2 * π * bandwidth
	// Kp = 2 * ζ * ωn
	// Ki = ωn²
	wn := 2 * math.Pi * bandwidth
	p.config.Kp = 2 * dampingRatio * wn
	p.config.Ki = wn * wn
}

// Update processes new voltage samples and returns phase angle and frequency
// va, vb, vc are three-phase voltages [V]
// dt is the time step [s]
func (p *PLL) Update(va, vb, vc, dt float64) (theta, freq float64) {
	// Check for signal loss (all voltages near zero)
	vMag := math.Sqrt(va*va + vb*vb + vc*vc)
	if vMag < p.config.VoltNominal*0.1 {
		return p.handleSignalLoss(dt)
	}

	// Clarke transformation: abc → αβ
	valpha, vbeta := p.clarkeTransform(va, vb, vc)
	p.lastValpha = valpha
	p.lastVbeta = vbeta

	// Park transformation: αβ → dq (using current theta estimate)
	vd, vq := p.parkTransform(valpha, vbeta, p.theta)
	p.lastVd = vd
	p.lastVq = vq

	// PI controller on Vq (we want Vq = 0 when locked)
	// Vq is the error signal
	error := vq

	// Proportional term
	pTerm := p.config.Kp * error

	// Integral term with anti-windup
	p.integrator += p.config.Ki * error * dt
	p.integrator = clamp(p.integrator, -p.integratorMax, p.integratorMax)
	iTerm := p.integrator

	// Angular velocity = nominal + correction
	p.omega = 2*math.Pi*p.config.FreqNominal + pTerm + iTerm

	// Integrate omega to get theta
	p.theta += p.omega * dt

	// Normalize theta to [0, 2π)
	p.theta = math.Mod(p.theta, 2*math.Pi)
	if p.theta < 0 {
		p.theta += 2 * math.Pi
	}

	// Calculate frequency from omega
	p.frequency = p.omega / (2 * math.Pi)

	// Clamp frequency to valid range
	if p.frequency < p.config.FreqMin || p.frequency > p.config.FreqMax {
		p.state = PLLStateFault
		p.frequency = clamp(p.frequency, p.config.FreqMin, p.config.FreqMax)
	} else {
		// Update lock detection
		p.updateLockDetection(vq)
	}

	return p.theta, p.frequency
}

// clarkeTransform converts three-phase abc to αβ (stationary frame)
// Uses amplitude-invariant transformation
func (p *PLL) clarkeTransform(va, vb, vc float64) (alpha, beta float64) {
	// Amplitude-invariant Clarke transformation
	// [Vα]   [  1      -1/2     -1/2  ] [Va]
	// [Vβ] = [  0    √3/2    -√3/2  ] [Vb]
	//        scaled by 2/3             [Vc]
	sqrt3 := math.Sqrt(3)
	alpha = (2.0/3.0) * (va - 0.5*vb - 0.5*vc)
	beta = (2.0/3.0) * (sqrt3/2.0*vb - sqrt3/2.0*vc)
	return alpha, beta
}

// parkTransform converts αβ (stationary) to dq (rotating) frame
func (p *PLL) parkTransform(alpha, beta, theta float64) (d, q float64) {
	// Park transformation
	// [Vd]   [ cos(θ)  sin(θ)] [Vα]
	// [Vq] = [-sin(θ)  cos(θ)] [Vβ]
	cosTheta := math.Cos(theta)
	sinTheta := math.Sin(theta)
	d = alpha*cosTheta + beta*sinTheta
	q = -alpha*sinTheta + beta*cosTheta
	return d, q
}

// inverseParkTransform converts dq (rotating) to αβ (stationary) frame
func (p *PLL) inverseParkTransform(d, q, theta float64) (alpha, beta float64) {
	// Inverse Park transformation
	// [Vα]   [cos(θ)  -sin(θ)] [Vd]
	// [Vβ] = [sin(θ)   cos(θ)] [Vq]
	cosTheta := math.Cos(theta)
	sinTheta := math.Sin(theta)
	alpha = d*cosTheta - q*sinTheta
	beta = d*sinTheta + q*cosTheta
	return alpha, beta
}

// inverseClarkeTransform converts αβ to three-phase abc
func (p *PLL) inverseClarkeTransform(alpha, beta float64) (a, b, c float64) {
	// Inverse Clarke transformation
	sqrt3 := math.Sqrt(3)
	a = alpha
	b = -0.5*alpha + sqrt3/2.0*beta
	c = -0.5*alpha - sqrt3/2.0*beta
	return a, b, c
}

// updateLockDetection updates lock state based on Vq error
func (p *PLL) updateLockDetection(vq float64) {
	vqAbs := math.Abs(vq)

	if vqAbs < p.config.LockThreshold {
		// Vq is small, trending toward lock
		p.lockCounter++
		p.unlockCounter = 0

		if p.lockCounter >= p.config.LockSamples {
			p.state = PLLStateLocked
			p.coastingOmega = p.omega // Save for potential coasting
		}
	} else {
		// Vq is large, trending toward unlock
		p.unlockCounter++
		p.lockCounter = 0

		if p.unlockCounter >= p.config.UnlockSamples && p.state == PLLStateLocked {
			p.state = PLLStateAcquiring
		}
	}
}

// handleSignalLoss manages behavior when grid voltage is lost
func (p *PLL) handleSignalLoss(dt float64) (theta, freq float64) {
	if p.state == PLLStateLocked {
		// Save current omega and transition to coasting
		p.coastingOmega = p.omega
		p.state = PLLStateCoasting
	}

	if p.state == PLLStateCoasting {
		// Continue with last known frequency (coasting)
		p.theta += p.coastingOmega * dt
		p.theta = math.Mod(p.theta, 2*math.Pi)
		if p.theta < 0 {
			p.theta += 2 * math.Pi
		}
		return p.theta, p.coastingOmega / (2 * math.Pi)
	}

	// If not locked before signal loss, enter fault state
	p.state = PLLStateFault
	return p.theta, p.config.FreqNominal
}

// IsLocked returns true if PLL is synchronized with grid
func (p *PLL) IsLocked() bool {
	return p.state == PLLStateLocked
}

// GetState returns current PLL state
func (p *PLL) GetState() PLLState {
	return p.state
}

// GetTheta returns current phase angle [rad]
func (p *PLL) GetTheta() float64 {
	return p.theta
}

// GetFrequency returns measured grid frequency [Hz]
func (p *PLL) GetFrequency() float64 {
	return p.frequency
}

// GetOmega returns angular velocity [rad/s]
func (p *PLL) GetOmega() float64 {
	return p.omega
}

// GetVdVq returns last dq-frame voltages for diagnostics
func (p *PLL) GetVdVq() (vd, vq float64) {
	return p.lastVd, p.lastVq
}

// GetValphaVbeta returns last αβ-frame voltages for diagnostics
func (p *PLL) GetValphaVbeta() (valpha, vbeta float64) {
	return p.lastValpha, p.lastVbeta
}

// Reset resets PLL to initial state
func (p *PLL) Reset() {
	p.state = PLLStateAcquiring
	p.theta = 0
	p.omega = 2 * math.Pi * p.config.FreqNominal
	p.frequency = p.config.FreqNominal
	p.integrator = 0
	p.lockCounter = 0
	p.unlockCounter = 0
	p.lastVd = 0
	p.lastVq = 0
	p.lastValpha = 0
	p.lastVbeta = 0
}

// SetTheta manually sets phase angle (for testing/initialization)
func (p *PLL) SetTheta(theta float64) {
	p.theta = math.Mod(theta, 2*math.Pi)
	if p.theta < 0 {
		p.theta += 2 * math.Pi
	}
}

// GenerateTestSignal generates a 3-phase voltage signal for testing
// amplitude is peak voltage [V], freq is frequency [Hz], theta is phase [rad]
func GenerateTestSignal(amplitude, freq, theta float64) (va, vb, vc float64) {
	va = amplitude * math.Sin(theta)
	vb = amplitude * math.Sin(theta - 2*math.Pi/3)
	vc = amplitude * math.Sin(theta + 2*math.Pi/3)
	return va, vb, vc
}

// clamp limits a value to [min, max]
func clamp(val, min, max float64) float64 {
	if val < min {
		return min
	}
	if val > max {
		return max
	}
	return val
}
