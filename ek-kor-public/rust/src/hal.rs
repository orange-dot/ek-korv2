//! EK-KOR v2 - Hardware Abstraction Layer
//!
//! HAL provides platform-independent interface for:
//! - Time measurement
//! - Message transmission
//! - Critical sections
//! - Platform-specific initialization
//!
//! # Implementing a HAL
//!
//! ```ignore
//! struct MyHal;
//!
//! impl Hal for MyHal {
//!     fn time_us(&self) -> TimeUs {
//!         // Read hardware timer
//!     }
//!
//!     fn send(&self, dest: ModuleId, msg_type: MsgType, data: &[u8]) -> Result<()> {
//!         // Send via CAN-FD
//!     }
//!
//!     // ... implement other methods
//! }
//! ```

use crate::types::*;

// ============================================================================
// Message Types
// ============================================================================

/// Message types for inter-module communication
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum MsgType {
    /// Liveness check
    Heartbeat = 0x01,
    /// Module discovery
    Discovery = 0x02,
    /// Coordination field update
    Field = 0x03,
    /// Consensus proposal
    Proposal = 0x04,
    /// Consensus vote
    Vote = 0x05,
    /// Proposal inhibition
    Inhibit = 0x06,
    /// Mesh reformation
    Reform = 0x07,
    /// Graceful shutdown
    Shutdown = 0x08,
    /// Application messages start here
    UserBase = 0x80,
}

// ============================================================================
// HAL Trait
// ============================================================================

/// Hardware Abstraction Layer trait
///
/// Implement this for your target platform (STM32, TriCore, etc.)
pub trait Hal {
    /// Get current time in microseconds
    ///
    /// Must be monotonically increasing.
    fn time_us(&self) -> TimeUs;

    /// Get current time in milliseconds
    fn time_ms(&self) -> u32 {
        (self.time_us() / 1000) as u32
    }

    /// Busy-wait delay
    fn delay_us(&self, us: u32);

    /// Send message to specific module
    fn send(&self, dest: ModuleId, msg_type: MsgType, data: &[u8]) -> Result<()>;

    /// Broadcast message to all modules
    fn broadcast(&self, msg_type: MsgType, data: &[u8]) -> Result<()>;

    /// Check for received message (non-blocking)
    ///
    /// Returns None if no message available.
    fn recv(&self, buffer: &mut [u8]) -> Option<ReceivedMessage>;

    /// Enter critical section (disable interrupts)
    ///
    /// Returns state to restore.
    fn critical_enter(&self) -> u32;

    /// Exit critical section
    fn critical_exit(&self, state: u32);

    /// Memory barrier
    fn memory_barrier(&self);

    /// Get this module's hardware ID
    fn get_module_id(&self) -> ModuleId;

    /// Get platform name
    fn platform_name(&self) -> &'static str;

    /// Debug print (optional)
    fn debug_print(&self, _msg: &str) {}
}

/// Received message info
#[derive(Debug, Clone)]
pub struct ReceivedMessage {
    pub sender_id: ModuleId,
    pub msg_type: MsgType,
    pub len: usize,
}

// ============================================================================
// Critical Section Guard
// ============================================================================

/// RAII guard for critical sections
pub struct CriticalSection<'a, H: Hal> {
    hal: &'a H,
    state: u32,
}

impl<'a, H: Hal> CriticalSection<'a, H> {
    /// Enter critical section
    pub fn new(hal: &'a H) -> Self {
        let state = hal.critical_enter();
        Self { hal, state }
    }
}

impl<'a, H: Hal> Drop for CriticalSection<'a, H> {
    fn drop(&mut self) {
        self.hal.critical_exit(self.state);
    }
}

// ============================================================================
// No-op HAL (for testing)
// ============================================================================

/// No-op HAL for testing and simulation
#[cfg(any(test, feature = "std"))]
pub struct NoopHal {
    time: core::sync::atomic::AtomicU64,
}

#[cfg(any(test, feature = "std"))]
impl NoopHal {
    /// Create new no-op HAL
    pub fn new() -> Self {
        Self {
            time: core::sync::atomic::AtomicU64::new(0),
        }
    }

    /// Advance time (for testing)
    pub fn advance_time(&self, us: u64) {
        self.time.fetch_add(us, core::sync::atomic::Ordering::SeqCst);
    }
}

#[cfg(any(test, feature = "std"))]
impl Default for NoopHal {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(any(test, feature = "std"))]
impl Hal for NoopHal {
    fn time_us(&self) -> TimeUs {
        self.time.load(core::sync::atomic::Ordering::SeqCst)
    }

    fn delay_us(&self, us: u32) {
        self.advance_time(us as u64);
    }

    fn send(&self, _dest: ModuleId, _msg_type: MsgType, _data: &[u8]) -> Result<()> {
        Ok(())
    }

    fn broadcast(&self, _msg_type: MsgType, _data: &[u8]) -> Result<()> {
        Ok(())
    }

    fn recv(&self, _buffer: &mut [u8]) -> Option<ReceivedMessage> {
        None
    }

    fn critical_enter(&self) -> u32 {
        0
    }

    fn critical_exit(&self, _state: u32) {}

    fn memory_barrier(&self) {}

    fn get_module_id(&self) -> ModuleId {
        1
    }

    fn platform_name(&self) -> &'static str {
        "noop"
    }

    fn debug_print(&self, msg: &str) {
        #[cfg(feature = "std")]
        println!("{}", msg);
        #[cfg(not(feature = "std"))]
        let _ = msg;
    }
}

// ============================================================================
// POSIX HAL (for std environments)
// ============================================================================

#[cfg(feature = "std")]
pub mod posix {
    use super::*;
    use std::collections::VecDeque;
    use std::sync::atomic::Ordering;
    use std::sync::Mutex;
    use std::time::Instant;

    /// Maximum message data length
    pub const MSG_MAX_LEN: usize = 64;

    /// Queued message for simulation
    #[derive(Clone)]
    struct QueuedMessage {
        sender_id: ModuleId,
        dest_id: ModuleId,
        msg_type: MsgType,
        data: [u8; MSG_MAX_LEN],
        len: usize,
    }

    impl QueuedMessage {
        fn new(sender_id: ModuleId, dest_id: ModuleId, msg_type: MsgType, data: &[u8]) -> Self {
            let len = data.len().min(MSG_MAX_LEN);
            let mut msg_data = [0u8; MSG_MAX_LEN];
            msg_data[..len].copy_from_slice(&data[..len]);
            Self {
                sender_id,
                dest_id,
                msg_type,
                data: msg_data,
                len,
            }
        }
    }

    /// POSIX-based HAL for desktop testing.
    ///
    /// Features:
    /// - High-resolution timing via `std::time::Instant`
    /// - Mock time support for deterministic testing
    /// - Thread-safe message queue
    /// - Receive callback support
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::hal::posix::PosixHal;
    /// use ekk::hal::Hal;
    ///
    /// let hal = PosixHal::new(1);
    /// let time = hal.time_us();
    /// ```
    pub struct PosixHal {
        /// Start time for relative timestamps
        start: Instant,
        /// This module's ID
        module_id: ModuleId,
        /// Message queue (thread-safe)
        queue: Mutex<VecDeque<QueuedMessage>>,
        /// Mock time (None = use real time)
        mock_time: Mutex<Option<TimeUs>>,
        /// Receive callback
        recv_callback: Mutex<Option<Box<dyn Fn(ModuleId, MsgType, &[u8]) + Send>>>,
        /// Debug output enabled
        debug_enabled: Mutex<bool>,
    }

    impl PosixHal {
        /// Create a new POSIX HAL.
        ///
        /// # Arguments
        ///
        /// * `module_id` - This module's identifier
        pub fn new(module_id: ModuleId) -> Self {
            Self {
                start: Instant::now(),
                module_id,
                queue: Mutex::new(VecDeque::with_capacity(64)),
                mock_time: Mutex::new(None),
                recv_callback: Mutex::new(None),
                debug_enabled: Mutex::new(false),
            }
        }

        /// Set mock time for deterministic testing.
        ///
        /// Pass `Some(time)` to enable mock time, `None` to use real time.
        ///
        /// # Example
        ///
        /// ```
        /// use ekk::hal::posix::PosixHal;
        /// use ekk::hal::Hal;
        ///
        /// let hal = PosixHal::new(1);
        /// hal.set_mock_time(Some(1000));
        /// assert_eq!(hal.time_us(), 1000);
        /// hal.set_mock_time(None);
        /// ```
        pub fn set_mock_time(&self, time: Option<TimeUs>) {
            *self.mock_time.lock().unwrap() = time;
        }

        /// Advance mock time by given microseconds.
        ///
        /// Only works if mock time is enabled.
        pub fn advance_mock_time(&self, us: u64) {
            let mut guard = self.mock_time.lock().unwrap();
            if let Some(ref mut t) = *guard {
                *t += us;
            }
        }

        /// Set receive callback for loopback testing.
        ///
        /// The callback is invoked when a message is sent to this module's ID.
        pub fn set_recv_callback<F>(&self, callback: F)
        where
            F: Fn(ModuleId, MsgType, &[u8]) + Send + 'static,
        {
            *self.recv_callback.lock().unwrap() = Some(Box::new(callback));
        }

        /// Clear receive callback.
        pub fn clear_recv_callback(&self) {
            *self.recv_callback.lock().unwrap() = None;
        }

        /// Enable or disable debug output.
        pub fn set_debug(&self, enabled: bool) {
            *self.debug_enabled.lock().unwrap() = enabled;
        }

        /// Inject a message into the receive queue (for testing).
        ///
        /// Simulates receiving a message from another module.
        pub fn inject_message(&self, sender_id: ModuleId, msg_type: MsgType, data: &[u8]) {
            let msg = QueuedMessage::new(sender_id, self.module_id, msg_type, data);
            self.queue.lock().unwrap().push_back(msg);
        }

        /// Get the number of messages in the queue.
        pub fn queue_len(&self) -> usize {
            self.queue.lock().unwrap().len()
        }

        /// Clear the message queue.
        pub fn clear_queue(&self) {
            self.queue.lock().unwrap().clear();
        }

        /// Get platform name string.
        pub fn platform_string() -> &'static str {
            #[cfg(target_os = "windows")]
            return "Windows (POSIX HAL)";
            #[cfg(target_os = "linux")]
            return "Linux (POSIX HAL)";
            #[cfg(target_os = "macos")]
            return "macOS (POSIX HAL)";
            #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
            return "POSIX HAL";
        }
    }

    impl Hal for PosixHal {
        fn time_us(&self) -> TimeUs {
            // Check mock time first
            if let Some(mock) = *self.mock_time.lock().unwrap() {
                return mock;
            }
            self.start.elapsed().as_micros() as TimeUs
        }

        fn delay_us(&self, us: u32) {
            // If mock time, just advance it
            if self.mock_time.lock().unwrap().is_some() {
                self.advance_mock_time(us as u64);
                return;
            }
            std::thread::sleep(std::time::Duration::from_micros(us as u64));
        }

        fn send(&self, dest: ModuleId, msg_type: MsgType, data: &[u8]) -> Result<()> {
            if data.len() > MSG_MAX_LEN {
                return Err(Error::InvalidArg);
            }

            // Debug output
            if *self.debug_enabled.lock().unwrap() {
                println!(
                    "[HAL:{}] send to {} type {:?} len {}",
                    self.module_id,
                    dest,
                    msg_type,
                    data.len()
                );
            }

            // Create message
            let msg = QueuedMessage::new(self.module_id, dest, msg_type, data);

            // Add to queue
            self.queue.lock().unwrap().push_back(msg.clone());

            // Call receive callback if registered (for loopback testing)
            if dest == self.module_id || dest == BROADCAST_ID {
                if let Some(ref callback) = *self.recv_callback.lock().unwrap() {
                    callback(self.module_id, msg_type, &msg.data[..msg.len]);
                }
            }

            Ok(())
        }

        fn broadcast(&self, msg_type: MsgType, data: &[u8]) -> Result<()> {
            self.send(BROADCAST_ID, msg_type, data)
        }

        fn recv(&self, buffer: &mut [u8]) -> Option<ReceivedMessage> {
            let mut queue = self.queue.lock().unwrap();

            // Find message addressed to us or broadcast
            let idx = queue.iter().position(|m| {
                m.dest_id == self.module_id || m.dest_id == BROADCAST_ID
            })?;

            let msg = queue.remove(idx)?;
            let copy_len = msg.len.min(buffer.len());
            buffer[..copy_len].copy_from_slice(&msg.data[..copy_len]);

            Some(ReceivedMessage {
                sender_id: msg.sender_id,
                msg_type: msg.msg_type,
                len: copy_len,
            })
        }

        fn critical_enter(&self) -> u32 {
            // No-op on POSIX (using Mutex internally)
            0
        }

        fn critical_exit(&self, _state: u32) {
            // No-op
        }

        fn memory_barrier(&self) {
            std::sync::atomic::fence(Ordering::SeqCst);
        }

        fn get_module_id(&self) -> ModuleId {
            self.module_id
        }

        fn platform_name(&self) -> &'static str {
            Self::platform_string()
        }

        fn debug_print(&self, msg: &str) {
            if *self.debug_enabled.lock().unwrap() {
                println!("[HAL:{}] {}", self.module_id, msg);
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn test_posix_hal_time() {
            let hal = PosixHal::new(1);
            let t1 = hal.time_us();
            std::thread::sleep(std::time::Duration::from_millis(10));
            let t2 = hal.time_us();
            assert!(t2 > t1);
        }

        #[test]
        fn test_mock_time() {
            let hal = PosixHal::new(1);

            // Enable mock time
            hal.set_mock_time(Some(1000));
            assert_eq!(hal.time_us(), 1000);

            // Advance mock time
            hal.advance_mock_time(500);
            assert_eq!(hal.time_us(), 1500);

            // Delay advances mock time
            hal.delay_us(100);
            assert_eq!(hal.time_us(), 1600);

            // Disable mock time
            hal.set_mock_time(None);
            let real = hal.time_us();
            assert!(real > 0);
        }

        #[test]
        fn test_message_queue() {
            let hal = PosixHal::new(1);

            // Inject a message
            hal.inject_message(2, MsgType::Heartbeat, &[1, 2, 3]);
            assert_eq!(hal.queue_len(), 1);

            // Receive it
            let mut buffer = [0u8; 64];
            let msg = hal.recv(&mut buffer).unwrap();
            assert_eq!(msg.sender_id, 2);
            assert_eq!(msg.msg_type, MsgType::Heartbeat);
            assert_eq!(msg.len, 3);
            assert_eq!(&buffer[..3], &[1, 2, 3]);
        }

        #[test]
        fn test_send_recv() {
            let hal = PosixHal::new(1);

            // Send to self
            hal.send(1, MsgType::Field, &[4, 5, 6]).unwrap();

            // Receive
            let mut buffer = [0u8; 64];
            let msg = hal.recv(&mut buffer).unwrap();
            assert_eq!(msg.sender_id, 1);
            assert_eq!(msg.msg_type, MsgType::Field);
            assert_eq!(&buffer[..3], &[4, 5, 6]);
        }

        #[test]
        fn test_broadcast() {
            let hal = PosixHal::new(1);

            hal.broadcast(MsgType::Discovery, &[7, 8]).unwrap();

            let mut buffer = [0u8; 64];
            let msg = hal.recv(&mut buffer).unwrap();
            assert_eq!(msg.msg_type, MsgType::Discovery);
        }
    }
}

// ============================================================================
// STM32G474 HAL Skeleton
// ============================================================================

/// STM32G474 HAL (implement with actual HAL crate)
#[cfg(feature = "embedded")]
pub mod stm32g474 {
    use super::*;

    /// STM32G474 HAL implementation
    ///
    /// This is a skeleton - implement using stm32g4xx-hal crate.
    pub struct Stm32G474Hal {
        // Add peripherals here
        module_id: ModuleId,
    }

    impl Stm32G474Hal {
        /// Create new STM32G474 HAL
        ///
        /// # Safety
        /// Must only be called once, with valid peripheral access.
        pub unsafe fn new(module_id: ModuleId) -> Self {
            Self { module_id }
        }
    }

    impl Hal for Stm32G474Hal {
        fn time_us(&self) -> TimeUs {
            // Read TIM2 or DWT cycle counter
            0 // TODO: implement
        }

        fn delay_us(&self, _us: u32) {
            // Use cortex_m::asm::delay or timer
        }

        fn send(&self, _dest: ModuleId, _msg_type: MsgType, _data: &[u8]) -> Result<()> {
            // Use FDCAN peripheral
            Ok(())
        }

        fn broadcast(&self, _msg_type: MsgType, _data: &[u8]) -> Result<()> {
            // FDCAN broadcast
            Ok(())
        }

        fn recv(&self, _buffer: &mut [u8]) -> Option<ReceivedMessage> {
            // Poll FDCAN RX FIFO
            None
        }

        fn critical_enter(&self) -> u32 {
            // cortex_m::interrupt::disable() and save PRIMASK
            0
        }

        fn critical_exit(&self, _state: u32) {
            // Restore PRIMASK
        }

        fn memory_barrier(&self) {
            // cortex_m::asm::dmb()
        }

        fn get_module_id(&self) -> ModuleId {
            self.module_id
        }

        fn platform_name(&self) -> &'static str {
            "stm32g474"
        }
    }
}
