package rtos

import (
	"fmt"
	"time"
)

// AccessType represents memory access types
type AccessType int

const (
	AccessRead    AccessType = 1 << 0
	AccessWrite   AccessType = 1 << 1
	AccessExecute AccessType = 1 << 2
)

// String returns access type as string
func (a AccessType) String() string {
	s := ""
	if a&AccessRead != 0 {
		s += "R"
	}
	if a&AccessWrite != 0 {
		s += "W"
	}
	if a&AccessExecute != 0 {
		s += "X"
	}
	if s == "" {
		return "---"
	}
	return s
}

// RegionType represents memory region types
type RegionType int

const (
	RegionFlash      RegionType = iota // Flash memory (code)
	RegionSRAM                         // SRAM (data)
	RegionPeripheral                   // Memory-mapped peripherals
	RegionExternal                     // External memory
)

// MemoryRegion represents an MPU region
type MemoryRegion struct {
	ID          int            // Region ID (0-7 for STM32G4)
	Name        string         // Human-readable name
	BaseAddr    uint32         // Base address
	Size        uint32         // Size in bytes
	Type        RegionType     // Region type
	Permissions MemPermissions // Access permissions
	Owner       ServiceID      // Owning service (or -1 for shared)
	Enabled     bool
}

// MemPermissions defines permissions for each privilege level
type MemPermissions struct {
	Kernel  AccessType // Kernel access
	Driver  AccessType // Driver access
	Service AccessType // Service (user) access
}

// MPUViolation records a memory protection violation
type MPUViolation struct {
	Timestamp   time.Duration
	Address     uint32
	AccessType  AccessType
	ServiceID   ServiceID
	RegionID    int
	Description string
}

// MPU simulates the Memory Protection Unit
// STM32G4 has 8 MPU regions that can be configured for
// different access permissions based on privilege level.
type MPU struct {
	// Regions (8 for STM32G4)
	regions [8]*MemoryRegion

	// Violations log
	violations []MPUViolation
	maxLog     int

	// Statistics
	checkCount     uint64
	violationCount uint64

	// Default regions (pre-configured)
	defaultRegions map[string]*MemoryRegion
}

// NewMPU creates a new MPU with default configuration
func NewMPU() *MPU {
	mpu := &MPU{
		maxLog:         100,
		defaultRegions: make(map[string]*MemoryRegion),
	}

	// Configure default regions for STM32G4
	mpu.configureDefaultRegions()

	return mpu
}

// configureDefaultRegions sets up standard memory map
func (m *MPU) configureDefaultRegions() {
	// Region 0: Flash - Bootloader (RX for all)
	m.regions[0] = &MemoryRegion{
		ID:       0,
		Name:     "Bootloader",
		BaseAddr: 0x08000000,
		Size:     16 * 1024, // 16KB
		Type:     RegionFlash,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessExecute,
			Driver:  AccessRead | AccessExecute,
			Service: AccessRead | AccessExecute,
		},
		Owner:   -1, // Shared
		Enabled: true,
	}

	// Region 1: Flash - App A (RX for all)
	m.regions[1] = &MemoryRegion{
		ID:       1,
		Name:     "Application_A",
		BaseAddr: 0x08004000,
		Size:     192 * 1024, // 192KB
		Type:     RegionFlash,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessExecute,
			Driver:  AccessRead | AccessExecute,
			Service: AccessRead | AccessExecute,
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 2: Flash - App B (RX for all)
	m.regions[2] = &MemoryRegion{
		ID:       2,
		Name:     "Application_B",
		BaseAddr: 0x08034000,
		Size:     192 * 1024, // 192KB
		Type:     RegionFlash,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessExecute,
			Driver:  AccessRead | AccessExecute,
			Service: AccessRead | AccessExecute,
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 3: Flash - Config (RW for kernel, R for others)
	m.regions[3] = &MemoryRegion{
		ID:       3,
		Name:     "Configuration",
		BaseAddr: 0x08064000,
		Size:     16 * 1024, // 16KB
		Type:     RegionFlash,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead,
			Service: AccessRead,
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 4: SRAM - DMA Buffers (RW for kernel/driver)
	m.regions[4] = &MemoryRegion{
		ID:       4,
		Name:     "DMA_Buffers",
		BaseAddr: 0x20000000,
		Size:     16 * 1024, // 16KB
		Type:     RegionSRAM,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead | AccessWrite,
			Service: 0, // No access
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 5: SRAM - Heap (RW for all)
	m.regions[5] = &MemoryRegion{
		ID:       5,
		Name:     "Heap",
		BaseAddr: 0x20004000,
		Size:     32 * 1024, // 32KB
		Type:     RegionSRAM,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead | AccessWrite,
			Service: AccessRead | AccessWrite,
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 6: SRAM - Stacks (RW for owner only)
	m.regions[6] = &MemoryRegion{
		ID:       6,
		Name:     "Stacks",
		BaseAddr: 0x2000C000,
		Size:     48 * 1024, // 48KB
		Type:     RegionSRAM,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead | AccessWrite,
			Service: AccessRead | AccessWrite, // Per-service in practice
		},
		Owner:   -1,
		Enabled: true,
	}

	// Region 7: Peripherals (RW for kernel/driver)
	m.regions[7] = &MemoryRegion{
		ID:       7,
		Name:     "Peripherals",
		BaseAddr: 0x40000000,
		Size:     512 * 1024, // 512KB peripheral space
		Type:     RegionPeripheral,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead | AccessWrite,
			Service: 0, // No direct peripheral access
		},
		Owner:   -1,
		Enabled: true,
	}

	// Store in map for easy lookup
	for _, r := range m.regions {
		if r != nil {
			m.defaultRegions[r.Name] = r
		}
	}
}

// ConfigureRegion configures a specific region
func (m *MPU) ConfigureRegion(regionID int, region *MemoryRegion) error {
	if regionID < 0 || regionID >= 8 {
		return fmt.Errorf("region ID must be 0-7")
	}
	region.ID = regionID
	m.regions[regionID] = region
	return nil
}

// GetRegion returns a region by ID
func (m *MPU) GetRegion(regionID int) *MemoryRegion {
	if regionID < 0 || regionID >= 8 {
		return nil
	}
	return m.regions[regionID]
}

// FindRegion finds the region containing an address
func (m *MPU) FindRegion(addr uint32) *MemoryRegion {
	for _, r := range m.regions {
		if r != nil && r.Enabled {
			if addr >= r.BaseAddr && addr < r.BaseAddr+r.Size {
				return r
			}
		}
	}
	return nil
}

// CheckAccess checks if access is permitted
func (m *MPU) CheckAccess(addr uint32, access AccessType, privilege PrivilegeLevel, svcID ServiceID) bool {
	m.checkCount++

	region := m.FindRegion(addr)
	if region == nil {
		// No region covers this address - deny by default
		m.recordViolation(addr, access, svcID, -1, "address not in any region")
		return false
	}

	// Check owner (if region has specific owner)
	if region.Owner >= 0 && region.Owner != svcID {
		m.recordViolation(addr, access, svcID, region.ID, "not region owner")
		return false
	}

	// Get allowed access for privilege level
	var allowed AccessType
	switch privilege {
	case PrivilegeKernel:
		allowed = region.Permissions.Kernel
	case PrivilegeDriver:
		allowed = region.Permissions.Driver
	case PrivilegeService:
		allowed = region.Permissions.Service
	}

	// Check if requested access is allowed
	if access&allowed != access {
		m.recordViolation(addr, access, svcID, region.ID,
			fmt.Sprintf("access %s denied, allowed %s", access.String(), allowed.String()))
		return false
	}

	return true
}

// CheckServiceAccess checks if a service can access its memory region
func (m *MPU) CheckServiceAccess(svc *Service) bool {
	if svc.MemRegion == nil {
		return true // No specific region assigned
	}

	// Simulate stack access check
	return m.CheckAccess(svc.MemRegion.BaseAddr, AccessRead|AccessWrite, svc.Privilege, svc.ID)
}

// recordViolation logs a violation
func (m *MPU) recordViolation(addr uint32, access AccessType, svcID ServiceID, regionID int, desc string) {
	m.violationCount++

	v := MPUViolation{
		Address:     addr,
		AccessType:  access,
		ServiceID:   svcID,
		RegionID:    regionID,
		Description: desc,
	}

	m.violations = append(m.violations, v)
	if len(m.violations) > m.maxLog {
		m.violations = m.violations[1:]
	}
}

// GetViolations returns recent violations
func (m *MPU) GetViolations(count int) []MPUViolation {
	if count > len(m.violations) {
		count = len(m.violations)
	}
	start := len(m.violations) - count
	result := make([]MPUViolation, count)
	copy(result, m.violations[start:])
	return result
}

// GetViolationCount returns total violations
func (m *MPU) GetViolationCount() uint64 {
	return m.violationCount
}

// GetCheckCount returns total checks performed
func (m *MPU) GetCheckCount() uint64 {
	return m.checkCount
}

// ClearViolations clears the violation log
func (m *MPU) ClearViolations() {
	m.violations = nil
}

// AllocateServiceRegion allocates a memory region for a service
func (m *MPU) AllocateServiceRegion(svc *Service, baseAddr uint32, size uint32) *MemoryRegion {
	region := &MemoryRegion{
		Name:     fmt.Sprintf("Service_%s", svc.Name),
		BaseAddr: baseAddr,
		Size:     size,
		Type:     RegionSRAM,
		Permissions: MemPermissions{
			Kernel:  AccessRead | AccessWrite,
			Driver:  AccessRead | AccessWrite,
			Service: AccessRead | AccessWrite, // Only for this service
		},
		Owner:   svc.ID,
		Enabled: true,
	}

	svc.MemRegion = region
	return region
}

// GetRegions returns all configured regions
func (m *MPU) GetRegions() []*MemoryRegion {
	result := make([]*MemoryRegion, 0, 8)
	for _, r := range m.regions {
		if r != nil {
			result = append(result, r)
		}
	}
	return result
}

// GetStats returns MPU statistics
func (m *MPU) GetStats() MPUStats {
	return MPUStats{
		CheckCount:     m.checkCount,
		ViolationCount: m.violationCount,
		RegionCount:    len(m.GetRegions()),
	}
}

// MPUStats holds MPU statistics
type MPUStats struct {
	CheckCount     uint64
	ViolationCount uint64
	RegionCount    int
}
