//! EK-KOR v2 - Base types and configuration
//!
//! # Patent Claims
//!
//! This module provides foundational types for the novel coordination system.

use core::ops::{Add, Div, Mul, Sub};
use fixed::types::I16F16;

// ============================================================================
// Configuration Constants
// ============================================================================

/// Number of topological neighbors per module (k=7 based on Cavagna & Giardina 2010)
pub const K_NEIGHBORS: usize = 7;

/// Maximum modules in a cluster
pub const MAX_MODULES: usize = 256;

/// Maximum tasks per module
pub const MAX_TASKS_PER_MODULE: usize = 8;

/// Field decay time constant in microseconds (100ms default)
pub const FIELD_DECAY_TAU_US: u64 = 100_000;

/// Heartbeat period in microseconds (10ms default)
pub const HEARTBEAT_PERIOD_US: u64 = 10_000;

/// Heartbeat timeout count (5 missed = 50ms at 10ms period)
pub const HEARTBEAT_TIMEOUT_COUNT: u8 = 5;

/// Vote timeout in microseconds (50ms default)
pub const VOTE_TIMEOUT_US: u64 = 50_000;

/// Maximum concurrent ballots
pub const MAX_BALLOTS: usize = 4;

/// Maximum field components
pub const FIELD_COUNT: usize = 5;

// ============================================================================
// Basic Types
// ============================================================================

/// Module identifier (0 = invalid)
pub type ModuleId = u8;

/// Task identifier within a module
pub type TaskId = u8;

/// Ballot identifier for consensus voting
pub type BallotId = u16;

/// Timestamp in microseconds
pub type TimeUs = u64;

/// Tick count
pub type Tick = u32;

/// Fixed-point Q16.16 for field values
pub type Fixed = I16F16;

/// Invalid module ID constant
pub const INVALID_MODULE_ID: ModuleId = 0;

/// Invalid ballot ID constant
pub const INVALID_BALLOT_ID: BallotId = 0;

/// Broadcast address
pub const BROADCAST_ID: ModuleId = 0xFF;

// ============================================================================
// Error Types
// ============================================================================

/// Result type for EK-KOR operations
pub type Result<T> = core::result::Result<T, Error>;

/// Error codes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub enum Error {
    /// Invalid argument provided
    InvalidArg,
    /// Out of memory
    NoMemory,
    /// Operation timed out
    Timeout,
    /// Resource is busy
    Busy,
    /// Item not found
    NotFound,
    /// Item already exists
    AlreadyExists,
    /// Quorum not reached
    NoQuorum,
    /// Proposal was inhibited
    Inhibited,
    /// Neighbor was lost
    NeighborLost,
    /// Field has expired
    FieldExpired,
    /// HAL failure
    HalFailure,
}

// ============================================================================
// Module State
// ============================================================================

/// Module operational state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub enum ModuleState {
    /// Initializing, not yet in mesh
    #[default]
    Init,
    /// Discovering neighbors
    Discovering,
    /// Normal operation
    Active,
    /// Some neighbors lost
    Degraded,
    /// No neighbors reachable
    Isolated,
    /// Mesh reformation in progress
    Reforming,
    /// Graceful shutdown
    Shutdown,
}

// ============================================================================
// Health State
// ============================================================================

/// Neighbor health state
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub enum HealthState {
    /// Never seen
    #[default]
    Unknown,
    /// Recent heartbeat received
    Alive,
    /// Missed 1-2 heartbeats
    Suspect,
    /// Timeout exceeded
    Dead,
}

// ============================================================================
// Vote Types
// ============================================================================

/// Vote value
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub enum VoteValue {
    /// No vote cast
    #[default]
    Abstain,
    /// Approve proposal
    Yes,
    /// Reject proposal
    No,
    /// Block competing proposal
    Inhibit,
}

/// Vote result
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
pub enum VoteResult {
    /// Voting in progress
    #[default]
    Pending,
    /// Threshold reached (approved)
    Approved,
    /// Threshold not reached
    Rejected,
    /// Voting timed out
    Timeout,
    /// Cancelled by inhibition
    Cancelled,
}

// ============================================================================
// Field Components
// ============================================================================

/// Field component identifiers
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[cfg_attr(feature = "defmt", derive(defmt::Format))]
#[repr(usize)]
pub enum FieldComponent {
    /// Computational load potential
    Load = 0,
    /// Thermal gradient
    Thermal = 1,
    /// Power consumption
    Power = 2,
    /// Application-defined 0
    Custom0 = 3,
    /// Application-defined 1
    Custom1 = 4,
}

impl FieldComponent {
    /// Get all components as array
    pub const ALL: [FieldComponent; FIELD_COUNT] = [
        FieldComponent::Load,
        FieldComponent::Thermal,
        FieldComponent::Power,
        FieldComponent::Custom0,
        FieldComponent::Custom1,
    ];
}

// ============================================================================
// Coordination Field Structure
// ============================================================================

/// Coordination field published by each module
///
/// This is the core data structure for potential field scheduling.
/// Each module publishes its field; neighbors sample and compute gradients.
///
/// Fields decay exponentially with time constant `FIELD_DECAY_TAU_US`.
#[derive(Debug, Clone, Copy, Default)]
pub struct Field {
    /// Field values (Q16.16 fixed-point)
    pub components: [Fixed; FIELD_COUNT],
    /// When published (microseconds)
    pub timestamp: TimeUs,
    /// Publishing module
    pub source: ModuleId,
    /// Monotonic sequence number
    pub sequence: u8,
}

impl Field {
    /// Create a new empty field
    pub const fn new() -> Self {
        Self {
            components: [Fixed::ZERO; FIELD_COUNT],
            timestamp: 0,
            source: INVALID_MODULE_ID,
            sequence: 0,
        }
    }

    /// Create field with load, thermal, power values
    pub fn with_values(load: Fixed, thermal: Fixed, power: Fixed) -> Self {
        let mut field = Self::new();
        field.components[FieldComponent::Load as usize] = load;
        field.components[FieldComponent::Thermal as usize] = thermal;
        field.components[FieldComponent::Power as usize] = power;
        field
    }

    /// Get component value
    pub fn get(&self, component: FieldComponent) -> Fixed {
        self.components[component as usize]
    }

    /// Set component value
    pub fn set(&mut self, component: FieldComponent, value: Fixed) {
        self.components[component as usize] = value;
    }

    /// Check if field is valid (not expired)
    pub fn is_valid(&self, now: TimeUs, max_age_us: TimeUs) -> bool {
        self.source != INVALID_MODULE_ID && (now - self.timestamp) < max_age_us
    }

    /// Clear field to default state
    pub fn clear(&mut self) {
        *self = Self::new();
    }
}

// ============================================================================
// Position
// ============================================================================

/// 3D position for physical distance calculation
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub struct Position {
    pub x: i16,
    pub y: i16,
    pub z: i16,
}

impl Position {
    /// Create new position
    pub const fn new(x: i16, y: i16, z: i16) -> Self {
        Self { x, y, z }
    }

    /// Compute squared Euclidean distance to another position
    pub fn distance_squared(&self, other: &Position) -> i32 {
        let dx = (self.x - other.x) as i32;
        let dy = (self.y - other.y) as i32;
        let dz = (self.z - other.z) as i32;
        dx * dx + dy * dy + dz * dz
    }
}

// ============================================================================
// Neighbor Info
// ============================================================================

/// Information about a neighbor module
#[derive(Debug, Clone, Copy, Default)]
pub struct Neighbor {
    /// Neighbor's module ID
    pub id: ModuleId,
    /// Current health state
    pub health: HealthState,
    /// Last heartbeat timestamp
    pub last_seen: TimeUs,
    /// Last received field
    pub last_field: Field,
    /// Distance metric for k-selection
    pub logical_distance: i32,
    /// Consecutive missed heartbeats
    pub missed_heartbeats: u8,
}

impl Neighbor {
    /// Create new neighbor entry
    pub fn new(id: ModuleId) -> Self {
        Self {
            id,
            health: HealthState::Unknown,
            ..Default::default()
        }
    }

    /// Check if neighbor is healthy
    pub fn is_healthy(&self) -> bool {
        matches!(self.health, HealthState::Alive | HealthState::Suspect)
    }
}

// ============================================================================
// Threshold Constants
// ============================================================================

/// Standard threshold values for consensus
pub mod threshold {
    use super::Fixed;

    /// Simple majority (50%)
    pub const SIMPLE_MAJORITY: Fixed = Fixed::from_bits(0x8000); // 0.5

    /// Supermajority (67%)
    pub const SUPERMAJORITY: Fixed = Fixed::from_bits(0xAB85); // ~0.67

    /// Unanimous (100%)
    pub const UNANIMOUS: Fixed = Fixed::ONE;
}

// ============================================================================
// Utility Traits
// ============================================================================

/// Extension trait for Fixed-point operations
pub trait FixedExt {
    /// Convert from float (compile-time only in const contexts)
    fn from_f32(f: f32) -> Self;

    /// Convert to float
    fn to_f32(self) -> f32;
}

impl FixedExt for Fixed {
    fn from_f32(f: f32) -> Self {
        Fixed::from_num(f)
    }

    fn to_f32(self) -> f32 {
        self.to_num()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_field_creation() {
        let field = Field::with_values(
            Fixed::from_num(0.5),
            Fixed::from_num(0.3),
            Fixed::from_num(0.8),
        );
        assert_eq!(field.get(FieldComponent::Load), Fixed::from_num(0.5));
    }

    #[test]
    fn test_position_distance() {
        let p1 = Position::new(0, 0, 0);
        let p2 = Position::new(3, 4, 0);
        assert_eq!(p1.distance_squared(&p2), 25);
    }
}
