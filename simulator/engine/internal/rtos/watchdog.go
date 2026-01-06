package rtos

import (
	"sync"
	"time"
)

// WatchdogType represents different watchdog types
type WatchdogType int

const (
	WatchdogIndependent WatchdogType = iota // IWDG - Independent, free-running
	WatchdogWindow                          // WWDG - Window watchdog
)

// WatchdogEntry represents a single watchdog for a service
type WatchdogEntry struct {
	ServiceID  ServiceID
	Type       WatchdogType
	Timeout    time.Duration // Time before expiry
	LastKick   time.Time
	Expired    bool
	KickCount  uint64
	ExpireCount uint64

	// Window watchdog parameters
	WindowStart time.Duration // Earliest allowed kick
	WindowEnd   time.Duration // Latest allowed kick (timeout)
}

// WatchdogManager manages per-service watchdogs
// Simulates both IWDG (Independent Watchdog) and WWDG (Window Watchdog)
type WatchdogManager struct {
	mu sync.RWMutex

	// Per-service watchdogs
	entries map[ServiceID]*WatchdogEntry

	// Default timeout
	defaultTimeout time.Duration

	// Hardware watchdog simulation (IWDG)
	hwdgEnabled   bool
	hwdgTimeout   time.Duration
	hwdgLastKick  time.Time
	hwdgExpired   bool

	// Statistics
	totalKicks   uint64
	totalExpires uint64
}

// NewWatchdogManager creates a new watchdog manager
func NewWatchdogManager(defaultTimeout time.Duration) *WatchdogManager {
	return &WatchdogManager{
		entries:        make(map[ServiceID]*WatchdogEntry),
		defaultTimeout: defaultTimeout,
		hwdgTimeout:    100 * time.Millisecond, // 100ms hardware watchdog
		hwdgLastKick:   time.Now(),
	}
}

// Register registers a service with the watchdog manager
func (w *WatchdogManager) Register(id ServiceID, timeout time.Duration) {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.entries[id] = &WatchdogEntry{
		ServiceID: id,
		Type:      WatchdogIndependent,
		Timeout:   timeout,
		LastKick:  time.Now(),
	}
}

// RegisterWindow registers a window watchdog
func (w *WatchdogManager) RegisterWindow(id ServiceID, windowStart, windowEnd time.Duration) {
	w.mu.Lock()
	defer w.mu.Unlock()

	w.entries[id] = &WatchdogEntry{
		ServiceID:   id,
		Type:        WatchdogWindow,
		Timeout:     windowEnd,
		WindowStart: windowStart,
		WindowEnd:   windowEnd,
		LastKick:    time.Now(),
	}
}

// Unregister removes a service from watchdog monitoring
func (w *WatchdogManager) Unregister(id ServiceID) {
	w.mu.Lock()
	defer w.mu.Unlock()
	delete(w.entries, id)
}

// Kick resets the watchdog timer for a service
func (w *WatchdogManager) Kick(id ServiceID, now time.Time) bool {
	w.mu.Lock()
	defer w.mu.Unlock()

	entry, ok := w.entries[id]
	if !ok {
		return false
	}

	// Window watchdog check
	if entry.Type == WatchdogWindow {
		elapsed := now.Sub(entry.LastKick)
		if elapsed < entry.WindowStart {
			// Kicked too early - treat as error
			entry.ExpireCount++
			w.totalExpires++
			return false
		}
	}

	entry.LastKick = now
	entry.Expired = false
	entry.KickCount++
	w.totalKicks++

	return true
}

// Check checks all watchdogs and returns expired service IDs
func (w *WatchdogManager) Check(now time.Time) []ServiceID {
	w.mu.Lock()
	defer w.mu.Unlock()

	var expired []ServiceID

	for id, entry := range w.entries {
		if entry.Expired {
			continue // Already marked expired
		}

		elapsed := now.Sub(entry.LastKick)
		if elapsed >= entry.Timeout {
			entry.Expired = true
			entry.ExpireCount++
			w.totalExpires++
			expired = append(expired, id)
		}
	}

	return expired
}

// IsExpired checks if a specific watchdog has expired
func (w *WatchdogManager) IsExpired(id ServiceID) bool {
	w.mu.RLock()
	defer w.mu.RUnlock()

	if entry, ok := w.entries[id]; ok {
		return entry.Expired
	}
	return false
}

// Reset resets a watchdog after recovery
func (w *WatchdogManager) Reset(id ServiceID, now time.Time) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if entry, ok := w.entries[id]; ok {
		entry.LastKick = now
		entry.Expired = false
	}
}

// EnableHardwareWatchdog enables the hardware (IWDG) watchdog
func (w *WatchdogManager) EnableHardwareWatchdog(timeout time.Duration) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.hwdgEnabled = true
	w.hwdgTimeout = timeout
	w.hwdgLastKick = time.Now()
}

// KickHardwareWatchdog kicks the hardware watchdog
func (w *WatchdogManager) KickHardwareWatchdog(now time.Time) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.hwdgLastKick = now
	w.hwdgExpired = false
}

// CheckHardwareWatchdog checks if hardware watchdog expired
func (w *WatchdogManager) CheckHardwareWatchdog(now time.Time) bool {
	w.mu.Lock()
	defer w.mu.Unlock()

	if !w.hwdgEnabled || w.hwdgExpired {
		return w.hwdgExpired
	}

	elapsed := now.Sub(w.hwdgLastKick)
	if elapsed >= w.hwdgTimeout {
		w.hwdgExpired = true
		return true
	}

	return false
}

// GetEntry returns watchdog entry for a service
func (w *WatchdogManager) GetEntry(id ServiceID) *WatchdogEntry {
	w.mu.RLock()
	defer w.mu.RUnlock()

	if entry, ok := w.entries[id]; ok {
		// Return a copy
		copy := *entry
		return &copy
	}
	return nil
}

// GetStats returns watchdog statistics
func (w *WatchdogManager) GetStats() WatchdogStats {
	w.mu.RLock()
	defer w.mu.RUnlock()

	active := 0
	expired := 0
	for _, entry := range w.entries {
		if entry.Expired {
			expired++
		} else {
			active++
		}
	}

	return WatchdogStats{
		ActiveCount:  active,
		ExpiredCount: expired,
		TotalKicks:   w.totalKicks,
		TotalExpires: w.totalExpires,
		HWDGEnabled:  w.hwdgEnabled,
		HWDGExpired:  w.hwdgExpired,
	}
}

// WatchdogStats holds watchdog statistics
type WatchdogStats struct {
	ActiveCount  int
	ExpiredCount int
	TotalKicks   uint64
	TotalExpires uint64
	HWDGEnabled  bool
	HWDGExpired  bool
}

// SetTimeout updates the timeout for a watchdog
func (w *WatchdogManager) SetTimeout(id ServiceID, timeout time.Duration) {
	w.mu.Lock()
	defer w.mu.Unlock()

	if entry, ok := w.entries[id]; ok {
		entry.Timeout = timeout
	}
}

// GetTimeRemaining returns time remaining before expiry
func (w *WatchdogManager) GetTimeRemaining(id ServiceID, now time.Time) time.Duration {
	w.mu.RLock()
	defer w.mu.RUnlock()

	if entry, ok := w.entries[id]; ok {
		elapsed := now.Sub(entry.LastKick)
		remaining := entry.Timeout - elapsed
		if remaining < 0 {
			return 0
		}
		return remaining
	}
	return 0
}
