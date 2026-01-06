package rtos

import (
	"container/heap"
	"time"
)

// ISRHandler represents an Interrupt Service Routine handler
type ISRHandler struct {
	Priority       int    // 0-3 (0 = highest, safety)
	Name           string
	Handler        func()
	Latency        time.Duration // Typical latency
	WCET           time.Duration // Worst-case execution time
	Pending        bool
	ExecutionCount uint64
}

// TaskState represents scheduler task state
type TaskState int

const (
	TaskReady     TaskState = iota // Ready to run
	TaskRunning                    // Currently executing
	TaskBlocked                    // Waiting on resource
	TaskCompleted                  // Finished
)

// Task represents a schedulable unit
type Task struct {
	Service     *Service
	AbsDeadline time.Time     // Absolute deadline
	ReleaseTime time.Time     // When task became ready
	Remaining   time.Duration // Remaining execution time
	State       TaskState
	index       int // Heap index
}

// TaskHeap implements heap.Interface for EDF scheduling
type TaskHeap []*Task

func (h TaskHeap) Len() int { return len(h) }

func (h TaskHeap) Less(i, j int) bool {
	// EDF: earlier deadline has higher priority
	return h[i].AbsDeadline.Before(h[j].AbsDeadline)
}

func (h TaskHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
	h[i].index = i
	h[j].index = j
}

func (h *TaskHeap) Push(x interface{}) {
	n := len(*h)
	task := x.(*Task)
	task.index = n
	*h = append(*h, task)
}

func (h *TaskHeap) Pop() interface{} {
	old := *h
	n := len(old)
	task := old[n-1]
	old[n-1] = nil
	task.index = -1
	*h = old[0 : n-1]
	return task
}

// Scheduler implements EDF (Earliest Deadline First) scheduling
// with support for fixed-priority ISRs.
//
// Priority levels:
// P0: Safety ISR (OCP/OVP/OTP) - <1µs response
// P1: PWM Control ISR (HRTIM) - 2.5µs period
// P2: ADC Sampling ISR - 100µs (10 kHz)
// P3: CAN RX ISR - event-driven
// P4-P8: Application tasks (scheduled by EDF)
// IDLE: WFI sleep mode
type Scheduler struct {
	// Ready queue (min-heap by deadline)
	readyQueue TaskHeap

	// Currently running task
	runningTask *Task

	// Periodic task release tracking
	nextRelease map[ServiceID]time.Time

	// Statistics
	contextSwitches uint64
	idleTicks       uint64
	totalTicks      uint64
	wcetViolations  uint64

	// Configuration
	idleThreshold time.Duration // Minimum time to enter idle
}

// NewScheduler creates a new EDF scheduler
func NewScheduler() *Scheduler {
	s := &Scheduler{
		readyQueue:    make(TaskHeap, 0),
		nextRelease:   make(map[ServiceID]time.Time),
		idleThreshold: 10 * time.Microsecond,
	}
	heap.Init(&s.readyQueue)
	return s
}

// Schedule selects the next task to run using EDF
// Returns nil if no tasks are ready (idle)
func (s *Scheduler) Schedule(services map[ServiceID]*Service, now time.Time) *Service {
	s.totalTicks++

	// Release periodic tasks
	s.releasePeriodicTasks(services, now)

	// Process ready queue
	for s.readyQueue.Len() > 0 {
		// Peek at highest priority task (earliest deadline)
		task := s.readyQueue[0]

		// Check if task's service is still runnable
		if task.Service.State != ServiceStateRunning {
			heap.Pop(&s.readyQueue)
			continue
		}

		// Check deadline miss (task is late)
		if now.After(task.AbsDeadline) {
			task.Service.DeadlineMisses++
			heap.Pop(&s.readyQueue)
			continue
		}

		// Context switch if different from running task
		if s.runningTask != task {
			s.contextSwitches++
		}
		s.runningTask = task

		return task.Service
	}

	// No ready tasks - idle
	s.idleTicks++
	s.runningTask = nil
	return nil
}

// releasePeriodicTasks checks for and releases periodic tasks
func (s *Scheduler) releasePeriodicTasks(services map[ServiceID]*Service, now time.Time) {
	for id, svc := range services {
		if svc.State != ServiceStateRunning || svc.Period == 0 {
			continue
		}

		release, ok := s.nextRelease[id]
		if !ok {
			// First release
			s.nextRelease[id] = now
			release = now
		}

		// Check if it's time to release
		if now.After(release) || now.Equal(release) {
			// Create new task instance
			task := &Task{
				Service:     svc,
				ReleaseTime: now,
				AbsDeadline: now.Add(svc.Deadline),
				Remaining:   svc.WCET,
				State:       TaskReady,
			}
			heap.Push(&s.readyQueue, task)

			// Schedule next release
			s.nextRelease[id] = release.Add(svc.Period)
		}
	}
}

// AddTask adds a sporadic task to the ready queue
func (s *Scheduler) AddTask(svc *Service, deadline time.Time) {
	task := &Task{
		Service:     svc,
		ReleaseTime: time.Now(),
		AbsDeadline: deadline,
		Remaining:   svc.WCET,
		State:       TaskReady,
	}
	heap.Push(&s.readyQueue, task)
}

// CompleteTask marks the current task as complete
func (s *Scheduler) CompleteTask() {
	if s.runningTask != nil {
		s.runningTask.State = TaskCompleted
		if s.readyQueue.Len() > 0 && s.readyQueue[0] == s.runningTask {
			heap.Pop(&s.readyQueue)
		}
		s.runningTask = nil
	}
}

// BlockTask blocks the current task (e.g., waiting for IPC)
func (s *Scheduler) BlockTask() {
	if s.runningTask != nil {
		s.runningTask.State = TaskBlocked
		s.runningTask = nil
	}
}

// UnblockTask unblocks a blocked task
func (s *Scheduler) UnblockTask(svc *Service) {
	// Find task in queue and set to ready
	for _, task := range s.readyQueue {
		if task.Service == svc && task.State == TaskBlocked {
			task.State = TaskReady
			break
		}
	}
}

// GetRunningTask returns the currently running task
func (s *Scheduler) GetRunningTask() *Task {
	return s.runningTask
}

// GetReadyCount returns number of ready tasks
func (s *Scheduler) GetReadyCount() int {
	return s.readyQueue.Len()
}

// GetContextSwitches returns total context switches
func (s *Scheduler) GetContextSwitches() uint64 {
	return s.contextSwitches
}

// GetIdlePercentage returns idle time percentage
func (s *Scheduler) GetIdlePercentage() float64 {
	if s.totalTicks == 0 {
		return 100.0
	}
	return float64(s.idleTicks) / float64(s.totalTicks) * 100.0
}

// GetCPUUtilization returns CPU utilization percentage
func (s *Scheduler) GetCPUUtilization() float64 {
	return 100.0 - s.GetIdlePercentage()
}

// Reset resets scheduler state
func (s *Scheduler) Reset() {
	s.readyQueue = make(TaskHeap, 0)
	heap.Init(&s.readyQueue)
	s.runningTask = nil
	s.nextRelease = make(map[ServiceID]time.Time)
	s.contextSwitches = 0
	s.idleTicks = 0
	s.totalTicks = 0
	s.wcetViolations = 0
}

// CalculateUtilization calculates total system utilization
// U = Σ(WCET_i / Period_i)
// System is schedulable under EDF if U <= 1.0
func (s *Scheduler) CalculateUtilization(services map[ServiceID]*Service) float64 {
	var totalU float64
	for _, svc := range services {
		if svc.Period > 0 && svc.WCET > 0 {
			u := float64(svc.WCET) / float64(svc.Period)
			totalU += u
		}
	}
	return totalU
}

// IsSchedulable checks if the task set is schedulable under EDF
func (s *Scheduler) IsSchedulable(services map[ServiceID]*Service) bool {
	// EDF can schedule any task set with U <= 1.0
	return s.CalculateUtilization(services) <= 1.0
}

// CheckDeadlines returns list of tasks that have missed deadlines
func (s *Scheduler) CheckDeadlines(now time.Time) []*Task {
	var missed []*Task
	for _, task := range s.readyQueue {
		if now.After(task.AbsDeadline) {
			missed = append(missed, task)
		}
	}
	return missed
}

// GetStats returns scheduler statistics
func (s *Scheduler) GetStats() SchedulerStats {
	return SchedulerStats{
		ReadyTasks:      s.readyQueue.Len(),
		ContextSwitches: s.contextSwitches,
		IdleTicks:       s.idleTicks,
		TotalTicks:      s.totalTicks,
		CPUUtilization:  s.GetCPUUtilization(),
		WCETViolations:  s.wcetViolations,
	}
}

// SchedulerStats holds scheduler statistics
type SchedulerStats struct {
	ReadyTasks      int
	ContextSwitches uint64
	IdleTicks       uint64
	TotalTicks      uint64
	CPUUtilization  float64
	WCETViolations  uint64
}

// PriorityToDeadline converts a fixed priority to an equivalent deadline
// for use with EDF (lower priority = longer deadline)
func PriorityToDeadline(priority int, basePeriod time.Duration) time.Duration {
	// P4 = 1ms, P5 = 10ms, P6 = 100ms, P7 = 1s, P8 = 10s
	switch priority {
	case 4:
		return 1 * time.Millisecond
	case 5:
		return 10 * time.Millisecond
	case 6:
		return 100 * time.Millisecond
	case 7:
		return 1 * time.Second
	case 8:
		return 10 * time.Second
	default:
		return basePeriod
	}
}
