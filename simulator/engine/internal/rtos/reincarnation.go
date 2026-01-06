package rtos

import (
	"sync"
	"time"
)

// RestartPolicy defines restart behavior for a service
type RestartPolicy struct {
	MaxRestarts    int           // Maximum restart attempts before giving up
	RestartDelay   time.Duration // Initial delay between restarts
	BackoffFactor  float64       // Exponential backoff multiplier
	MaxDelay       time.Duration // Maximum delay after backoff
	ResetAfter     time.Duration // Reset restart counter after successful run
	CooldownPeriod time.Duration // Minimum time between restarts
}

// DefaultRestartPolicy returns default restart policy
func DefaultRestartPolicy() RestartPolicy {
	return RestartPolicy{
		MaxRestarts:    3,
		RestartDelay:   10 * time.Millisecond,
		BackoffFactor:  2.0,
		MaxDelay:       1 * time.Second,
		ResetAfter:     10 * time.Second,
		CooldownPeriod: 50 * time.Millisecond,
	}
}

// ServiceHistory tracks restart history for a service
type ServiceHistory struct {
	RestartCount   int           // Number of restarts
	LastRestart    time.Time     // Time of last restart
	LastSuccess    time.Time     // Last successful execution
	LastFault      FaultType     // Last fault type
	TotalRestarts  int           // Lifetime restarts
	CurrentDelay   time.Duration // Current delay with backoff
	PermanentFault bool          // Service cannot be restarted
}

// ReincarnationServer manages automatic service restart
// Implements exponential backoff and failure tracking
type ReincarnationServer struct {
	mu sync.Mutex

	// Reference to kernel
	kernel *Kernel

	// Policies per service
	policies map[ServiceID]*RestartPolicy

	// History per service
	histories map[ServiceID]*ServiceHistory

	// Default policy
	defaultPolicy RestartPolicy

	// Pending restarts
	pendingRestarts map[ServiceID]time.Time

	// Statistics
	totalRestarts     uint64
	successfulRestarts uint64
	failedRestarts    uint64
}

// NewReincarnationServer creates a new reincarnation server
func NewReincarnationServer(kernel *Kernel, maxRestarts int, restartDelay time.Duration) *ReincarnationServer {
	defaultPolicy := DefaultRestartPolicy()
	defaultPolicy.MaxRestarts = maxRestarts
	defaultPolicy.RestartDelay = restartDelay

	return &ReincarnationServer{
		kernel:          kernel,
		policies:        make(map[ServiceID]*RestartPolicy),
		histories:       make(map[ServiceID]*ServiceHistory),
		pendingRestarts: make(map[ServiceID]time.Time),
		defaultPolicy:   defaultPolicy,
	}
}

// SetPolicy sets restart policy for a service
func (r *ReincarnationServer) SetPolicy(id ServiceID, policy RestartPolicy) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.policies[id] = &policy
}

// GetPolicy returns policy for a service
func (r *ReincarnationServer) getPolicy(id ServiceID) *RestartPolicy {
	if policy, ok := r.policies[id]; ok {
		return policy
	}
	return &r.defaultPolicy
}

// OnServiceFault handles a service fault
func (r *ReincarnationServer) OnServiceFault(id ServiceID, fault FaultType) {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Get or create history
	history, ok := r.histories[id]
	if !ok {
		history = &ServiceHistory{}
		r.histories[id] = history
	}

	history.LastFault = fault

	// Check if service can be restarted
	if !r.shouldRestart(id, history) {
		history.PermanentFault = true
		return
	}

	// Schedule restart
	policy := r.getPolicy(id)
	delay := r.calculateDelay(history, policy)
	restartTime := time.Now().Add(delay)

	r.pendingRestarts[id] = restartTime
}

// shouldRestart determines if a service should be restarted
func (r *ReincarnationServer) shouldRestart(id ServiceID, history *ServiceHistory) bool {
	if history.PermanentFault {
		return false
	}

	policy := r.getPolicy(id)

	// Check restart count
	if history.RestartCount >= policy.MaxRestarts {
		// Check if enough time has passed to reset counter
		if time.Since(history.LastSuccess) > policy.ResetAfter {
			history.RestartCount = 0
			return true
		}
		return false
	}

	// Check cooldown
	if time.Since(history.LastRestart) < policy.CooldownPeriod {
		return false
	}

	return true
}

// calculateDelay calculates restart delay with exponential backoff
func (r *ReincarnationServer) calculateDelay(history *ServiceHistory, policy *RestartPolicy) time.Duration {
	if history.RestartCount == 0 {
		history.CurrentDelay = policy.RestartDelay
	} else {
		// Exponential backoff
		history.CurrentDelay = time.Duration(float64(history.CurrentDelay) * policy.BackoffFactor)
		if history.CurrentDelay > policy.MaxDelay {
			history.CurrentDelay = policy.MaxDelay
		}
	}
	return history.CurrentDelay
}

// ProcessPending processes pending restarts
// Should be called periodically by the kernel
func (r *ReincarnationServer) ProcessPending(now time.Time) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for id, restartTime := range r.pendingRestarts {
		if now.After(restartTime) || now.Equal(restartTime) {
			err := r.restartService(id)
			if err != nil {
				r.failedRestarts++
			} else {
				r.successfulRestarts++
			}
			r.totalRestarts++
			delete(r.pendingRestarts, id)
		}
	}
}

// restartService performs the actual restart
func (r *ReincarnationServer) restartService(id ServiceID) error {
	history := r.histories[id]
	if history == nil {
		history = &ServiceHistory{}
		r.histories[id] = history
	}

	history.RestartCount++
	history.TotalRestarts++
	history.LastRestart = time.Now()

	// Call kernel to restart
	return r.kernel.RestartService(id)
}

// NotifySuccess should be called when a service runs successfully
func (r *ReincarnationServer) NotifySuccess(id ServiceID) {
	r.mu.Lock()
	defer r.mu.Unlock()

	history, ok := r.histories[id]
	if !ok {
		return
	}

	history.LastSuccess = time.Now()

	// Check if we can reset the restart counter
	policy := r.getPolicy(id)
	if time.Since(history.LastRestart) > policy.ResetAfter {
		history.RestartCount = 0
		history.CurrentDelay = policy.RestartDelay
	}
}

// GetHistory returns restart history for a service
func (r *ReincarnationServer) GetHistory(id ServiceID) *ServiceHistory {
	r.mu.Lock()
	defer r.mu.Unlock()

	if history, ok := r.histories[id]; ok {
		// Return a copy
		copy := *history
		return &copy
	}
	return nil
}

// ClearHistory clears restart history for a service
func (r *ReincarnationServer) ClearHistory(id ServiceID) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.histories, id)
}

// IsPermanentlyFaulted returns true if service cannot be restarted
func (r *ReincarnationServer) IsPermanentlyFaulted(id ServiceID) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	if history, ok := r.histories[id]; ok {
		return history.PermanentFault
	}
	return false
}

// ResetPermanentFault clears permanent fault flag
func (r *ReincarnationServer) ResetPermanentFault(id ServiceID) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if history, ok := r.histories[id]; ok {
		history.PermanentFault = false
		history.RestartCount = 0
		history.CurrentDelay = r.getPolicy(id).RestartDelay
	}
}

// GetPendingRestarts returns services waiting to restart
func (r *ReincarnationServer) GetPendingRestarts() map[ServiceID]time.Time {
	r.mu.Lock()
	defer r.mu.Unlock()

	result := make(map[ServiceID]time.Time)
	for id, t := range r.pendingRestarts {
		result[id] = t
	}
	return result
}

// GetStats returns reincarnation statistics
func (r *ReincarnationServer) GetStats() ReincarnationStats {
	r.mu.Lock()
	defer r.mu.Unlock()

	faulted := 0
	for _, h := range r.histories {
		if h.PermanentFault {
			faulted++
		}
	}

	return ReincarnationStats{
		TotalRestarts:      r.totalRestarts,
		SuccessfulRestarts: r.successfulRestarts,
		FailedRestarts:     r.failedRestarts,
		PendingRestarts:    len(r.pendingRestarts),
		PermanentlyFaulted: faulted,
	}
}

// ReincarnationStats holds reincarnation statistics
type ReincarnationStats struct {
	TotalRestarts      uint64
	SuccessfulRestarts uint64
	FailedRestarts     uint64
	PendingRestarts    int
	PermanentlyFaulted int
}
