// Example: Go explicit error handling pattern
// No hidden control flow, no exceptions

package simulation

import (
	"fmt"
)

const MaxModules = 255

var ErrModuleAlreadyExists = fmt.Errorf("module already exists")

type Simulation struct {
	modules map[uint8]*Module
}

// AddModule adds a module to the simulation.
// Errors are returned explicitly - no exceptions, no hidden flow.
func (s *Simulation) AddModule(id uint8) error {
	if id >= MaxModules {
		return fmt.Errorf("module ID %d exceeds max %d", id, MaxModules)
	}
	if _, exists := s.modules[id]; exists {
		return ErrModuleAlreadyExists
	}

	s.modules[id] = &Module{ID: id}
	return nil
}

// ThermalUpdate demonstrates explicit physics calculations
// No magic - what you see is what executes
func (t *ThermalModel) Update(powerLoss float64, dt float64) {
	tau := t.Cth * t.Rth
	dT_ss := powerLoss * t.Rth
	t.Temperature += (dT_ss - (t.Temperature - t.Ambient)) * (1 - math.Exp(-dt/tau))
}
