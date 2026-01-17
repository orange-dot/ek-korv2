//! EK-KOR v2 - Coordination Field Primitives
//!
//! # Novelty: Potential Field Scheduling
//!
//! Replaces traditional priority-based scheduling with gradient-mediated
//! coordination. Modules publish decaying potential fields; neighbors
//! sample these fields and compute gradients to self-organize.
//!
//! ## Theoretical Basis
//! - Khatib, O. (1986): Real-time obstacle avoidance using potential fields
//! - Extended from spatial path planning to temporal scheduling
//!
//! ## Patent Claims
//! 1. "A distributed real-time operating system using potential field
//!    scheduling wherein processing elements coordinate through indirect
//!    communication via shared decaying gradient fields"

use crate::types::*;
use core::sync::atomic::{AtomicU32, Ordering};
use heapless::Vec;

// ============================================================================
// Field Configuration
// ============================================================================

/// Field decay model
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum DecayModel {
    /// f(t) = f0 * exp(-t/tau)
    #[default]
    Exponential,
    /// f(t) = f0 * (1 - t/tau), clamped to 0
    Linear,
    /// f(t) = f0 if t < tau, else 0
    Step,
}

/// Field configuration per component
#[derive(Debug, Clone, Copy)]
pub struct FieldConfig {
    /// Decay time constant (seconds as Q16.16)
    pub decay_tau: Fixed,
    /// Decay function
    pub decay_model: DecayModel,
    /// Floor (clamp)
    pub min_value: Fixed,
    /// Ceiling (clamp)
    pub max_value: Fixed,
    /// Value when no data
    pub default_value: Fixed,
}

impl Default for FieldConfig {
    fn default() -> Self {
        Self {
            decay_tau: Fixed::from_num(0.1), // 100ms
            decay_model: DecayModel::Exponential,
            min_value: Fixed::ZERO,
            max_value: Fixed::ONE,
            default_value: Fixed::ZERO,
        }
    }
}

// ============================================================================
// Field Region (Shared Memory)
// ============================================================================

/// Shared field region (one per cluster)
///
/// This is the "environment" through which modules coordinate.
/// In Rust, we use atomic operations for thread-safe updates.
pub struct FieldRegion {
    /// Published fields from all modules
    fields: [Field; MAX_MODULES],
    /// Bitmask of updated modules (atomic for lock-free updates)
    update_flags: AtomicU32,
    /// Last garbage collection timestamp
    last_gc: TimeUs,
}

impl FieldRegion {
    /// Create a new field region
    pub const fn new() -> Self {
        Self {
            fields: [Field::new(); MAX_MODULES],
            update_flags: AtomicU32::new(0),
            last_gc: 0,
        }
    }

    /// Get field for a module (with bounds check)
    pub fn get(&self, module_id: ModuleId) -> Option<&Field> {
        if module_id as usize >= MAX_MODULES {
            return None;
        }
        Some(&self.fields[module_id as usize])
    }

    /// Get mutable field for a module
    pub fn get_mut(&mut self, module_id: ModuleId) -> Option<&mut Field> {
        if module_id as usize >= MAX_MODULES {
            return None;
        }
        Some(&mut self.fields[module_id as usize])
    }
}

impl Default for FieldRegion {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Field Engine
// ============================================================================

/// Field engine for coordination
pub struct FieldEngine {
    /// Configuration per component
    config: [FieldConfig; FIELD_COUNT],
}

impl FieldEngine {
    /// Create a new field engine with default config
    pub fn new() -> Self {
        Self {
            config: [FieldConfig::default(); FIELD_COUNT],
        }
    }

    /// Publish module's coordination field
    ///
    /// Updates the shared field region with this module's current state.
    pub fn publish(
        &self,
        region: &mut FieldRegion,
        module_id: ModuleId,
        field: &Field,
        now: TimeUs,
    ) -> Result<()> {
        if module_id as usize >= MAX_MODULES || module_id == INVALID_MODULE_ID {
            return Err(Error::InvalidArg);
        }

        let stored = region.get_mut(module_id).ok_or(Error::InvalidArg)?;
        stored.components = field.components;
        stored.timestamp = now;
        stored.source = module_id;
        stored.sequence = stored.sequence.wrapping_add(1);

        // Mark as updated (atomic)
        let bit = 1u32 << (module_id % 32);
        region.update_flags.fetch_or(bit, Ordering::Release);

        Ok(())
    }

    /// Sample a specific module's field with decay applied
    pub fn sample(
        &self,
        region: &FieldRegion,
        target_id: ModuleId,
        now: TimeUs,
    ) -> Result<Field> {
        let field = region.get(target_id).ok_or(Error::InvalidArg)?;

        if field.source == INVALID_MODULE_ID {
            return Err(Error::NotFound);
        }

        let elapsed = now.saturating_sub(field.timestamp);
        let max_age = FIELD_DECAY_TAU_US * 5; // 5 tau = ~99% decay

        if elapsed > max_age {
            return Err(Error::FieldExpired);
        }

        let mut result = *field;
        self.apply_decay(&mut result, elapsed);
        Ok(result)
    }

    /// Sample all k-neighbors and compute aggregate
    ///
    /// Returns weighted average of neighbor fields.
    pub fn sample_neighbors(
        &self,
        region: &FieldRegion,
        neighbors: &[Neighbor],
        now: TimeUs,
    ) -> Field {
        let mut aggregate = Field::new();
        let mut total_weight = Fixed::ZERO;

        for neighbor in neighbors {
            if neighbor.health == HealthState::Dead {
                continue;
            }

            if let Ok(field) = self.sample(region, neighbor.id, now) {
                // Weight based on health and recency
                let health_weight = match neighbor.health {
                    HealthState::Alive => Fixed::ONE,
                    HealthState::Suspect => Fixed::from_num(0.5),
                    _ => Fixed::ZERO,
                };

                if health_weight > Fixed::ZERO {
                    for i in 0..FIELD_COUNT {
                        aggregate.components[i] += field.components[i] * health_weight;
                    }
                    total_weight += health_weight;
                }
            }
        }

        // Normalize
        if total_weight > Fixed::ZERO {
            for i in 0..FIELD_COUNT {
                aggregate.components[i] /= total_weight;
            }
        }

        aggregate
    }

    /// Compute gradient for a specific field component
    ///
    /// Returns the direction of decreasing potential:
    /// - Positive: neighbors have higher values (I should increase activity)
    /// - Negative: neighbors have lower values (I should decrease activity)
    pub fn gradient(
        &self,
        my_field: &Field,
        neighbor_aggregate: &Field,
        component: FieldComponent,
    ) -> Fixed {
        let my_val = my_field.get(component);
        let neighbor_val = neighbor_aggregate.get(component);
        neighbor_val - my_val
    }

    /// Compute gradient vector for all components
    pub fn gradient_all(
        &self,
        my_field: &Field,
        neighbor_aggregate: &Field,
    ) -> [Fixed; FIELD_COUNT] {
        let mut gradients = [Fixed::ZERO; FIELD_COUNT];
        for (i, component) in FieldComponent::ALL.iter().enumerate() {
            gradients[i] = self.gradient(my_field, neighbor_aggregate, *component);
        }
        gradients
    }

    /// Apply decay to a field based on elapsed time
    pub fn apply_decay(&self, field: &mut Field, elapsed_us: TimeUs) {
        let tau = FIELD_DECAY_TAU_US as f32;
        let t = elapsed_us as f32;

        // Exponential decay: f(t) = f0 * exp(-t/tau)
        // Approximation for embedded: f(t) ≈ f0 * (1 - t/tau) for small t
        let decay_factor = if t < tau {
            Fixed::from_num(1.0 - t / tau)
        } else if t < tau * 2.0 {
            Fixed::from_num(0.5 - (t - tau) / (tau * 2.0))
        } else if t < tau * 3.0 {
            Fixed::from_num(0.25 - (t - tau * 2.0) / (tau * 4.0))
        } else {
            Fixed::ZERO
        };

        let decay_factor = decay_factor.max(Fixed::ZERO);

        for i in 0..FIELD_COUNT {
            field.components[i] *= decay_factor;
        }
    }

    /// Garbage collect expired fields
    pub fn gc(&self, region: &mut FieldRegion, now: TimeUs, max_age_us: TimeUs) -> u32 {
        let mut expired = 0u32;

        for i in 0..MAX_MODULES {
            let field = &mut region.fields[i];
            if field.source != INVALID_MODULE_ID {
                if now.saturating_sub(field.timestamp) > max_age_us {
                    field.clear();
                    expired += 1;
                }
            }
        }

        region.last_gc = now;
        expired
    }
}

impl Default for FieldEngine {
    fn default() -> Self {
        Self::new()
    }
}

// ============================================================================
// Field Arithmetic
// ============================================================================

impl Field {
    /// Add two fields component-wise
    pub fn add(&self, other: &Field) -> Field {
        let mut result = *self;
        for i in 0..FIELD_COUNT {
            result.components[i] += other.components[i];
        }
        result
    }

    /// Scale field by factor
    pub fn scale(&self, factor: Fixed) -> Field {
        let mut result = *self;
        for i in 0..FIELD_COUNT {
            result.components[i] *= factor;
        }
        result
    }

    /// Linear interpolation between two fields
    ///
    /// result = self * (1 - t) + other * t
    pub fn lerp(&self, other: &Field, t: Fixed) -> Field {
        let mut result = Field::new();
        let one_minus_t = Fixed::ONE - t;

        for i in 0..FIELD_COUNT {
            result.components[i] = self.components[i] * one_minus_t
                + other.components[i] * t;
        }
        result
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_field_publish_sample() {
        let engine = FieldEngine::new();
        let mut region = FieldRegion::new();

        let field = Field::with_values(
            Fixed::from_num(0.5),
            Fixed::from_num(0.3),
            Fixed::from_num(0.8),
        );

        engine.publish(&mut region, 1, &field, 1000).unwrap();

        let sampled = engine.sample(&region, 1, 1000).unwrap();
        assert_eq!(sampled.get(FieldComponent::Load), Fixed::from_num(0.5));
    }

    #[test]
    fn test_gradient_calculation() {
        let engine = FieldEngine::new();

        let my_field = Field::with_values(
            Fixed::from_num(0.3),
            Fixed::ZERO,
            Fixed::ZERO,
        );

        let neighbor_field = Field::with_values(
            Fixed::from_num(0.7),
            Fixed::ZERO,
            Fixed::ZERO,
        );

        let gradient = engine.gradient(&my_field, &neighbor_field, FieldComponent::Load);
        assert!(gradient > Fixed::ZERO); // Neighbors have higher load
    }
}
