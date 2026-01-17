//! EK-KOR v2 - Single-Producer Single-Consumer Lock-Free Ring Buffer
//!
//! # Overview
//!
//! A lock-free, wait-free SPSC queue with compile-time capacity validation.
//! Designed for zero-copy IPC between ISR and task contexts.
//!
//! # Rust Advantages Over C Implementation
//!
//! - **Compile-time capacity check:** Assert power-of-2 with const generics
//! - **Type-safe producer/consumer:** Split handles prevent misuse at compile time
//! - **Memory ordering:** Explicit `Ordering` annotations for correctness
//! - **No UB:** Proper `UnsafeCell` + `MaybeUninit` usage
//! - **Sync markers:** Correct `Send`/`Sync` implementation
//!
//! # Example
//!
//! ```
//! use ekk::spsc::Spsc;
//!
//! let mut queue: Spsc<u32, 16> = Spsc::new();
//! let (producer, consumer) = queue.split();
//!
//! producer.push(42).unwrap();
//! assert_eq!(consumer.pop(), Some(42));
//! ```
//!
//! # Safety
//!
//! This implementation assumes single-producer single-consumer access pattern.
//! The type system enforces this through `Producer` and `Consumer` handles.

use core::cell::UnsafeCell;
use core::mem::MaybeUninit;
use core::sync::atomic::{AtomicU32, Ordering};

// ============================================================================
// SPSC Queue
// ============================================================================

/// Single-Producer Single-Consumer lock-free ring buffer.
///
/// `N` must be a power of 2 (enforced at compile time).
///
/// The queue uses separate atomic indices for head (written by producer)
/// and tail (written by consumer), enabling lock-free operation without
/// cache line contention.
///
/// # Type Parameters
///
/// - `T`: Element type (must be `Copy` for safe extraction)
/// - `N`: Capacity (must be power of 2)
pub struct Spsc<T, const N: usize> {
    /// Ring buffer storage (uninitialized until written)
    buffer: UnsafeCell<[MaybeUninit<T>; N]>,
    /// Next write index (producer writes, consumer reads)
    head: AtomicU32,
    /// Next read index (consumer writes, producer reads)
    tail: AtomicU32,
}

// SAFETY: Spsc can be sent between threads if T can be sent.
// Only one producer and one consumer access it concurrently.
unsafe impl<T: Send, const N: usize> Send for Spsc<T, N> {}

// SAFETY: Spsc can be shared between threads (via split) if T can be sent.
// The split ensures only one producer and one consumer exist.
unsafe impl<T: Send, const N: usize> Sync for Spsc<T, N> {}

impl<T, const N: usize> Spsc<T, N> {
    /// Compile-time assertion: N must be a power of 2 and > 0
    const ASSERT_POWER_OF_2: () = {
        assert!(N > 0, "Capacity must be greater than 0");
        assert!(N & (N - 1) == 0, "Capacity must be a power of 2");
        assert!(N <= u32::MAX as usize, "Capacity must fit in u32");
    };

    /// Mask for fast modulo (capacity - 1)
    const MASK: u32 = (N - 1) as u32;

    /// Create a new empty SPSC queue.
    ///
    /// # Panics
    ///
    /// Compile-time panic if `N` is not a power of 2.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::spsc::Spsc;
    /// let queue: Spsc<u32, 16> = Spsc::new();
    /// ```
    pub const fn new() -> Self {
        // Trigger compile-time assertion
        let _ = Self::ASSERT_POWER_OF_2;

        Self {
            // SAFETY: MaybeUninit doesn't require initialization
            buffer: UnsafeCell::new(unsafe {
                MaybeUninit::<[MaybeUninit<T>; N]>::uninit().assume_init()
            }),
            head: AtomicU32::new(0),
            tail: AtomicU32::new(0),
        }
    }

    /// Split queue into producer and consumer handles.
    ///
    /// This is the only way to get push/pop access, ensuring type-safe
    /// single-producer single-consumer usage.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::spsc::Spsc;
    ///
    /// let mut queue: Spsc<u32, 16> = Spsc::new();
    /// let (producer, consumer) = queue.split();
    ///
    /// // Producer can only push
    /// producer.push(1).unwrap();
    ///
    /// // Consumer can only pop
    /// assert_eq!(consumer.pop(), Some(1));
    /// ```
    pub fn split(&mut self) -> (Producer<'_, T, N>, Consumer<'_, T, N>) {
        (Producer(self), Consumer(self))
    }

    /// Get the number of items in the queue.
    ///
    /// This is informational only - the value may be stale by the time
    /// it's used due to concurrent access.
    #[inline]
    pub fn len(&self) -> usize {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Relaxed);
        ((head.wrapping_sub(tail)) & Self::MASK) as usize
    }

    /// Check if the queue is empty.
    #[inline]
    pub fn is_empty(&self) -> bool {
        self.head.load(Ordering::Relaxed) == self.tail.load(Ordering::Relaxed)
    }

    /// Check if the queue is full.
    #[inline]
    pub fn is_full(&self) -> bool {
        let head = self.head.load(Ordering::Relaxed);
        let tail = self.tail.load(Ordering::Relaxed);
        ((head.wrapping_add(1)) & Self::MASK) == (tail & Self::MASK)
    }

    /// Get available space in the queue.
    #[inline]
    pub fn available(&self) -> usize {
        N - 1 - self.len()
    }

    /// Get the capacity of the queue.
    ///
    /// Note: Actual usable capacity is `N - 1` due to ring buffer sentinel.
    #[inline]
    pub const fn capacity(&self) -> usize {
        N
    }

    /// Reset queue to empty state.
    ///
    /// # Safety
    ///
    /// Only safe to call when there is no concurrent access.
    pub fn reset(&mut self) {
        self.head.store(0, Ordering::Relaxed);
        self.tail.store(0, Ordering::Relaxed);
    }
}

impl<T, const N: usize> Default for Spsc<T, N> {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Producer Handle
// ============================================================================

/// Producer handle for pushing items to the queue.
///
/// Only one `Producer` can exist at a time (enforced by borrow checker).
/// The producer can only push items, not pop them.
pub struct Producer<'a, T, const N: usize>(&'a Spsc<T, N>);

impl<'a, T: Copy, const N: usize> Producer<'a, T, N> {
    /// Push an item to the queue.
    ///
    /// Returns `Ok(())` on success, or `Err(item)` if the queue is full.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::spsc::Spsc;
    ///
    /// let mut queue: Spsc<u32, 4> = Spsc::new();
    /// let (producer, _consumer) = queue.split();
    ///
    /// assert!(producer.push(1).is_ok());
    /// assert!(producer.push(2).is_ok());
    /// assert!(producer.push(3).is_ok());
    /// // Queue is now full (capacity 4, usable 3)
    /// assert_eq!(producer.push(4), Err(4));
    /// ```
    #[inline]
    pub fn push(&self, item: T) -> Result<(), T> {
        let head = self.0.head.load(Ordering::Relaxed);
        let next_head = (head.wrapping_add(1)) & Spsc::<T, N>::MASK;

        // Check if full
        if next_head == self.0.tail.load(Ordering::Acquire) {
            return Err(item);
        }

        // SAFETY: We have exclusive write access to this slot
        // (producer is single-threaded and we checked not full)
        unsafe {
            let buffer = &mut *self.0.buffer.get();
            buffer[head as usize].write(item);
        }

        // Release: ensure item is written before head update is visible
        self.0.head.store(next_head, Ordering::Release);

        Ok(())
    }

    /// Check if the queue is full.
    #[inline]
    pub fn is_full(&self) -> bool {
        self.0.is_full()
    }

    /// Get available space.
    #[inline]
    pub fn available(&self) -> usize {
        self.0.available()
    }
}

// Producer can be sent if the queue can be sent
unsafe impl<'a, T: Send, const N: usize> Send for Producer<'a, T, N> {}

// ============================================================================
// Consumer Handle
// ============================================================================

/// Consumer handle for popping items from the queue.
///
/// Only one `Consumer` can exist at a time (enforced by borrow checker).
/// The consumer can only pop items, not push them.
pub struct Consumer<'a, T, const N: usize>(&'a Spsc<T, N>);

impl<'a, T: Copy, const N: usize> Consumer<'a, T, N> {
    /// Pop an item from the queue.
    ///
    /// Returns `Some(item)` if available, `None` if empty.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::spsc::Spsc;
    ///
    /// let mut queue: Spsc<u32, 16> = Spsc::new();
    /// let (producer, consumer) = queue.split();
    ///
    /// producer.push(42).unwrap();
    /// assert_eq!(consumer.pop(), Some(42));
    /// assert_eq!(consumer.pop(), None);
    /// ```
    #[inline]
    pub fn pop(&self) -> Option<T> {
        let tail = self.0.tail.load(Ordering::Relaxed);

        // Acquire: ensure we see the latest head
        if tail == self.0.head.load(Ordering::Acquire) {
            return None; // Empty
        }

        // SAFETY: We have exclusive read access to this slot
        // (consumer is single-threaded and we checked not empty)
        let item = unsafe {
            let buffer = &*self.0.buffer.get();
            buffer[tail as usize].assume_init_read()
        };

        // Release: ensure item is read before tail update
        let next_tail = (tail.wrapping_add(1)) & Spsc::<T, N>::MASK;
        self.0.tail.store(next_tail, Ordering::Release);

        Some(item)
    }

    /// Peek at the next item without removing it.
    ///
    /// Returns `Some(&item)` if available, `None` if empty.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::spsc::Spsc;
    ///
    /// let mut queue: Spsc<u32, 16> = Spsc::new();
    /// let (producer, consumer) = queue.split();
    ///
    /// producer.push(42).unwrap();
    /// assert_eq!(consumer.peek(), Some(&42));
    /// assert_eq!(consumer.peek(), Some(&42)); // Still there
    /// assert_eq!(consumer.pop(), Some(42));
    /// assert_eq!(consumer.peek(), None);
    /// ```
    #[inline]
    pub fn peek(&self) -> Option<&T> {
        let tail = self.0.tail.load(Ordering::Relaxed);

        // Acquire: ensure we see the latest head
        if tail == self.0.head.load(Ordering::Acquire) {
            return None; // Empty
        }

        // SAFETY: We have read access to this slot (it's been written)
        unsafe {
            let buffer = &*self.0.buffer.get();
            Some(buffer[tail as usize].assume_init_ref())
        }
    }

    /// Check if the queue is empty.
    #[inline]
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    /// Get number of items available.
    #[inline]
    pub fn len(&self) -> usize {
        self.0.len()
    }
}

// Consumer can be sent if the queue can be sent
unsafe impl<'a, T: Send, const N: usize> Send for Consumer<'a, T, N> {}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new() {
        let queue: Spsc<u32, 16> = Spsc::new();
        assert!(queue.is_empty());
        assert_eq!(queue.len(), 0);
        assert_eq!(queue.capacity(), 16);
    }

    #[test]
    fn test_push_pop() {
        let mut queue: Spsc<u32, 16> = Spsc::new();
        let (producer, consumer) = queue.split();

        assert!(producer.push(1).is_ok());
        assert!(producer.push(2).is_ok());
        assert!(producer.push(3).is_ok());

        assert_eq!(consumer.pop(), Some(1));
        assert_eq!(consumer.pop(), Some(2));
        assert_eq!(consumer.pop(), Some(3));
        assert_eq!(consumer.pop(), None);
    }

    #[test]
    fn test_full() {
        let mut queue: Spsc<u32, 4> = Spsc::new();
        let (producer, consumer) = queue.split();

        // Can push capacity - 1 items
        assert!(producer.push(1).is_ok());
        assert!(producer.push(2).is_ok());
        assert!(producer.push(3).is_ok());

        // Queue is now full
        assert!(producer.is_full());
        assert_eq!(producer.push(4), Err(4));

        // Pop one to make space
        assert_eq!(consumer.pop(), Some(1));
        assert!(!producer.is_full());

        // Can push again
        assert!(producer.push(4).is_ok());
    }

    #[test]
    fn test_peek() {
        let mut queue: Spsc<u32, 16> = Spsc::new();
        let (producer, consumer) = queue.split();

        assert_eq!(consumer.peek(), None);

        producer.push(42).unwrap();
        assert_eq!(consumer.peek(), Some(&42));
        assert_eq!(consumer.peek(), Some(&42));

        assert_eq!(consumer.pop(), Some(42));
        assert_eq!(consumer.peek(), None);
    }

    #[test]
    fn test_wrap_around() {
        let mut queue: Spsc<u32, 4> = Spsc::new();
        let (producer, consumer) = queue.split();

        // Fill and empty multiple times to test wrap-around
        for iteration in 0..10 {
            for i in 0..3 {
                producer.push(iteration * 10 + i).unwrap();
            }
            for i in 0..3 {
                assert_eq!(consumer.pop(), Some(iteration * 10 + i));
            }
        }
    }

    #[test]
    fn test_reset() {
        let mut queue: Spsc<u32, 16> = Spsc::new();

        {
            let (producer, _consumer) = queue.split();
            producer.push(1).unwrap();
            producer.push(2).unwrap();
        }

        assert!(!queue.is_empty());
        queue.reset();
        assert!(queue.is_empty());
    }

    #[test]
    fn test_struct_items() {
        #[derive(Debug, Clone, Copy, PartialEq)]
        struct Message {
            id: u32,
            value: f32,
        }

        let mut queue: Spsc<Message, 8> = Spsc::new();
        let (producer, consumer) = queue.split();

        let msg = Message {
            id: 42,
            value: 3.14,
        };
        producer.push(msg).unwrap();

        let received = consumer.pop().unwrap();
        assert_eq!(received.id, 42);
        assert!((received.value - 3.14).abs() < 0.001);
    }
}
