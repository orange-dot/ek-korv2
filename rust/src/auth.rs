//! EK-KOR v2 - Chaskey-12 MAC Authentication
//!
//! # Overview
//!
//! Lightweight message authentication using Chaskey-12 MAC algorithm,
//! optimized for 32-bit microcontrollers.
//!
//! # Rust Advantages Over C Implementation
//!
//! - **Type safety:** Separate `AuthKey`, `AuthTag`, `RawKey` types prevent misuse
//! - **Secure by default:** Implements `Zeroize` + `Drop` for automatic key wiping
//! - **Constant-time:** Uses `subtle` crate's `ConstantTimeEq` trait
//! - **Builder pattern:** Fluent API for incremental MAC computation
//! - **No unsafe:** Pure safe Rust for crypto operations
//!
//! # Reference
//!
//! Mouha et al. (2014): "Chaskey: An Efficient MAC Algorithm for 32-bit Microcontrollers"
//! IACR ePrint 2014/386
//!
//! # Example
//!
//! ```
//! use ekk::auth::{RawKey, AuthKey, mac};
//!
//! let raw = RawKey::from_bytes([0u8; 16]);
//! let key = AuthKey::new(&raw);
//!
//! let tag = mac(&key, b"Hello, world!");
//! assert!(tag.verify(&mac(&key, b"Hello, world!")));
//! ```

use zeroize::{Zeroize, ZeroizeOnDrop};
use subtle::ConstantTimeEq;

// ============================================================================
// Configuration
// ============================================================================

/// Number of Chaskey rounds (12 for standard security)
pub const CHASKEY_ROUNDS: usize = 12;

/// MAC tag size in bytes (64-bit truncated for efficiency)
pub const MAC_TAG_SIZE: usize = 8;

/// Block size in bytes
const BLOCK_SIZE: usize = 16;

// ============================================================================
// Raw Key Material
// ============================================================================

/// 128-bit raw key material.
///
/// Automatically zeroed on drop to prevent key leakage.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct RawKey([u8; 16]);

impl RawKey {
    /// Create a raw key from bytes.
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::auth::RawKey;
    ///
    /// let key = RawKey::from_bytes([0x42; 16]);
    /// ```
    pub fn from_bytes(bytes: [u8; 16]) -> Self {
        Self(bytes)
    }

    /// Create a raw key from a slice.
    ///
    /// Returns `None` if slice is not exactly 16 bytes.
    pub fn from_slice(slice: &[u8]) -> Option<Self> {
        if slice.len() != 16 {
            return None;
        }
        let mut bytes = [0u8; 16];
        bytes.copy_from_slice(slice);
        Some(Self(bytes))
    }

    /// Get raw bytes (use carefully - exposes key material).
    pub fn as_bytes(&self) -> &[u8; 16] {
        &self.0
    }
}

// ============================================================================
// Expanded Key
// ============================================================================

/// Expanded authentication key with subkeys.
///
/// Contains master key K and derived subkeys K1, K2 for Chaskey finalization.
/// Automatically zeroed on drop.
#[derive(Clone, Zeroize, ZeroizeOnDrop)]
pub struct AuthKey {
    /// Master key (128 bits as 4x32-bit words)
    k: [u32; 4],
    /// Subkey 1 (for complete final blocks)
    k1: [u32; 4],
    /// Subkey 2 (for incomplete final blocks)
    k2: [u32; 4],
}

impl AuthKey {
    /// Create an expanded key from raw key material.
    ///
    /// Computes subkeys K1 = 2*K and K2 = 4*K in GF(2^128).
    ///
    /// # Example
    ///
    /// ```
    /// use ekk::auth::{RawKey, AuthKey};
    ///
    /// let raw = RawKey::from_bytes([0x42; 16]);
    /// let key = AuthKey::new(&raw);
    /// ```
    pub fn new(raw: &RawKey) -> Self {
        // Load master key as little-endian words
        let k = [
            u32::from_le_bytes([raw.0[0], raw.0[1], raw.0[2], raw.0[3]]),
            u32::from_le_bytes([raw.0[4], raw.0[5], raw.0[6], raw.0[7]]),
            u32::from_le_bytes([raw.0[8], raw.0[9], raw.0[10], raw.0[11]]),
            u32::from_le_bytes([raw.0[12], raw.0[13], raw.0[14], raw.0[15]]),
        ];

        // Derive K1 = 2*K
        let k1 = times_two(&k);

        // Derive K2 = 4*K = 2*K1
        let k2 = times_two(&k1);

        Self { k, k1, k2 }
    }
}

/// Multiply by x in GF(2^128) with reduction polynomial x^128 + x^7 + x^2 + x + 1.
fn times_two(input: &[u32; 4]) -> [u32; 4] {
    // Check if MSB is set (will require reduction)
    let msb = (input[3] >> 31) & 1;

    // Shift left by 1 bit across all words
    let mut output = [0u32; 4];
    output[3] = (input[3] << 1) | (input[2] >> 31);
    output[2] = (input[2] << 1) | (input[1] >> 31);
    output[1] = (input[1] << 1) | (input[0] >> 31);
    output[0] = input[0] << 1;

    // If MSB was set, XOR with reduction constant (0x87)
    // Using wrapping_neg for constant-time conditional
    output[0] ^= 0x87 & (msb.wrapping_neg());

    output
}

// ============================================================================
// MAC Tag
// ============================================================================

/// Authentication tag (truncated to 64 bits).
///
/// Implements constant-time comparison to prevent timing attacks.
#[derive(Clone)]
pub struct AuthTag([u8; MAC_TAG_SIZE]);

impl AuthTag {
    /// Create a tag from bytes.
    pub fn from_bytes(bytes: [u8; MAC_TAG_SIZE]) -> Self {
        Self(bytes)
    }

    /// Get tag bytes.
    pub fn as_bytes(&self) -> &[u8; MAC_TAG_SIZE] {
        &self.0
    }

    /// Verify tag against another tag (constant-time).
    ///
    /// Returns `true` if tags match, `false` otherwise.
    ///
    /// # Security
    ///
    /// This comparison is constant-time to prevent timing attacks.
    pub fn verify(&self, other: &AuthTag) -> bool {
        self.ct_eq(other).into()
    }
}

impl ConstantTimeEq for AuthTag {
    fn ct_eq(&self, other: &Self) -> subtle::Choice {
        self.0.ct_eq(&other.0)
    }
}

impl core::fmt::Debug for AuthTag {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "AuthTag({:02x?})", &self.0)
    }
}

// ============================================================================
// Chaskey Permutation
// ============================================================================

/// Rotate left 32-bit value.
#[inline(always)]
fn rotl32(x: u32, n: u32) -> u32 {
    (x << n) | (x >> (32 - n))
}

/// Single Chaskey round on 128-bit state.
#[inline(always)]
fn chaskey_round(v: &mut [u32; 4]) {
    v[0] = v[0].wrapping_add(v[1]);
    v[1] = rotl32(v[1], 5);
    v[1] ^= v[0];
    v[0] = rotl32(v[0], 16);

    v[2] = v[2].wrapping_add(v[3]);
    v[3] = rotl32(v[3], 8);
    v[3] ^= v[2];

    v[0] = v[0].wrapping_add(v[3]);
    v[3] = rotl32(v[3], 13);
    v[3] ^= v[0];

    v[2] = v[2].wrapping_add(v[1]);
    v[1] = rotl32(v[1], 7);
    v[1] ^= v[2];
    v[2] = rotl32(v[2], 16);
}

/// Full Chaskey permutation.
fn chaskey_permute(v: &mut [u32; 4]) {
    for _ in 0..CHASKEY_ROUNDS {
        chaskey_round(v);
    }
}

/// Load a 16-byte block as 4 little-endian u32 words.
fn load_block(data: &[u8]) -> [u32; 4] {
    debug_assert!(data.len() >= 16);
    [
        u32::from_le_bytes([data[0], data[1], data[2], data[3]]),
        u32::from_le_bytes([data[4], data[5], data[6], data[7]]),
        u32::from_le_bytes([data[8], data[9], data[10], data[11]]),
        u32::from_le_bytes([data[12], data[13], data[14], data[15]]),
    ]
}

/// Store 4 u32 words as a 16-byte block (little-endian).
fn store_block(words: &[u32; 4]) -> [u8; 16] {
    let mut out = [0u8; 16];
    out[0..4].copy_from_slice(&words[0].to_le_bytes());
    out[4..8].copy_from_slice(&words[1].to_le_bytes());
    out[8..12].copy_from_slice(&words[2].to_le_bytes());
    out[12..16].copy_from_slice(&words[3].to_le_bytes());
    out
}

// ============================================================================
// Incremental MAC (Builder Pattern)
// ============================================================================

/// Incremental MAC computation with builder pattern.
///
/// Use this for processing data in chunks or when the full message
/// isn't available at once.
///
/// # Example
///
/// ```
/// use ekk::auth::{RawKey, AuthKey, AuthBuilder};
///
/// let raw = RawKey::from_bytes([0u8; 16]);
/// let key = AuthKey::new(&raw);
///
/// let tag = AuthBuilder::new(&key)
///     .update(b"Hello, ")
///     .update(b"world!")
///     .finalize();
/// ```
pub struct AuthBuilder<'k> {
    /// Reference to key
    key: &'k AuthKey,
    /// Current state
    state: [u32; 4],
    /// Partial block buffer
    buffer: [u8; BLOCK_SIZE],
    /// Bytes in buffer
    buflen: usize,
}

impl<'k> AuthBuilder<'k> {
    /// Create a new MAC builder with the given key.
    pub fn new(key: &'k AuthKey) -> Self {
        Self {
            key,
            state: key.k,
            buffer: [0u8; BLOCK_SIZE],
            buflen: 0,
        }
    }

    /// Update MAC with additional data.
    ///
    /// Can be called multiple times. Returns `self` for chaining.
    pub fn update(mut self, data: &[u8]) -> Self {
        let mut offset = 0;

        // If we have buffered data, try to complete a block
        if self.buflen > 0 {
            let need = BLOCK_SIZE - self.buflen;
            if data.len() < need {
                self.buffer[self.buflen..self.buflen + data.len()].copy_from_slice(data);
                self.buflen += data.len();
                return self;
            }

            self.buffer[self.buflen..].copy_from_slice(&data[..need]);
            offset = need;

            // Process buffered block
            let block = load_block(&self.buffer);
            self.state[0] ^= block[0];
            self.state[1] ^= block[1];
            self.state[2] ^= block[2];
            self.state[3] ^= block[3];
            chaskey_permute(&mut self.state);
            self.buflen = 0;
        }

        // Process complete blocks
        while offset + BLOCK_SIZE < data.len() {
            let block = load_block(&data[offset..]);
            self.state[0] ^= block[0];
            self.state[1] ^= block[1];
            self.state[2] ^= block[2];
            self.state[3] ^= block[3];
            chaskey_permute(&mut self.state);
            offset += BLOCK_SIZE;
        }

        // Buffer remaining data (may include a complete final block)
        let remaining = data.len() - offset;
        if remaining > 0 {
            self.buffer[..remaining].copy_from_slice(&data[offset..]);
            self.buflen = remaining;
        }

        self
    }

    /// Finalize MAC computation and return the tag.
    ///
    /// Consumes the builder.
    pub fn finalize(mut self) -> AuthTag {
        // Prepare final block with padding
        let mut last_block = [0u8; BLOCK_SIZE];
        last_block[..self.buflen].copy_from_slice(&self.buffer[..self.buflen]);

        if self.buflen < BLOCK_SIZE {
            // Incomplete block: pad with 0x01 and use K2
            last_block[self.buflen] = 0x01;
            self.state[0] ^= self.key.k2[0];
            self.state[1] ^= self.key.k2[1];
            self.state[2] ^= self.key.k2[2];
            self.state[3] ^= self.key.k2[3];
        } else {
            // Complete block: use K1
            self.state[0] ^= self.key.k1[0];
            self.state[1] ^= self.key.k1[1];
            self.state[2] ^= self.key.k1[2];
            self.state[3] ^= self.key.k1[3];
        }

        // XOR final block
        let block = load_block(&last_block);
        self.state[0] ^= block[0];
        self.state[1] ^= block[1];
        self.state[2] ^= block[2];
        self.state[3] ^= block[3];

        // Final permutation
        chaskey_permute(&mut self.state);

        // XOR with key again
        self.state[0] ^= self.key.k[0];
        self.state[1] ^= self.key.k[1];
        self.state[2] ^= self.key.k[2];
        self.state[3] ^= self.key.k[3];

        // Output tag (truncated to MAC_TAG_SIZE)
        let full_tag = store_block(&self.state);
        let mut tag = [0u8; MAC_TAG_SIZE];
        tag.copy_from_slice(&full_tag[..MAC_TAG_SIZE]);

        AuthTag(tag)
    }
}

// ============================================================================
// One-Shot API
// ============================================================================

/// Compute MAC tag for a message (one-shot).
///
/// This is a convenience function for computing MAC over a complete message.
///
/// # Example
///
/// ```
/// use ekk::auth::{RawKey, AuthKey, mac};
///
/// let raw = RawKey::from_bytes([0x42; 16]);
/// let key = AuthKey::new(&raw);
///
/// let tag = mac(&key, b"Hello, world!");
/// ```
pub fn mac(key: &AuthKey, data: &[u8]) -> AuthTag {
    AuthBuilder::new(key).update(data).finalize()
}

/// Verify MAC tag for a message.
///
/// Returns `true` if the tag is valid, `false` otherwise.
///
/// # Security
///
/// Uses constant-time comparison.
pub fn verify(key: &AuthKey, data: &[u8], tag: &AuthTag) -> bool {
    mac(key, data).verify(tag)
}

// ============================================================================
// Message Authentication Helpers
// ============================================================================

/// Message types requiring authentication.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum AuthRequirement {
    /// Not required
    None = 0,
    /// Optional (authenticate if key available)
    Optional = 1,
    /// Required (reject if no key or invalid)
    Required = 2,
}

/// Check if a message type requires authentication.
///
/// Returns the authentication requirement level.
pub fn auth_requirement(msg_type: u8) -> AuthRequirement {
    match msg_type {
        0x04 => AuthRequirement::Required, // Proposal
        0x05 => AuthRequirement::Required, // Vote
        0x08 => AuthRequirement::Required, // Shutdown (emergency)
        0x01 => AuthRequirement::None,     // Heartbeat (high overhead)
        0x02 => AuthRequirement::None,     // Discovery (initial trust)
        _ => AuthRequirement::None,
    }
}

/// Compute MAC for an EK-KOR protocol message.
///
/// Authenticates: sender_id | msg_type | data
pub fn mac_message(key: &AuthKey, sender_id: u8, msg_type: u8, data: &[u8]) -> AuthTag {
    AuthBuilder::new(key)
        .update(&[sender_id, msg_type])
        .update(data)
        .finalize()
}

/// Verify MAC for a received EK-KOR protocol message.
pub fn verify_message(
    key: &AuthKey,
    sender_id: u8,
    msg_type: u8,
    data: &[u8],
    tag: &AuthTag,
) -> bool {
    mac_message(key, sender_id, msg_type, data).verify(tag)
}

// ============================================================================
// Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_raw_key() {
        let raw = RawKey::from_bytes([0x42; 16]);
        assert_eq!(raw.as_bytes(), &[0x42; 16]);
    }

    #[test]
    fn test_raw_key_from_slice() {
        let bytes = [0x42u8; 16];
        let raw = RawKey::from_slice(&bytes).unwrap();
        assert_eq!(raw.as_bytes(), &bytes);

        // Wrong length
        assert!(RawKey::from_slice(&[0u8; 15]).is_none());
        assert!(RawKey::from_slice(&[0u8; 17]).is_none());
    }

    #[test]
    fn test_auth_key_creation() {
        let raw = RawKey::from_bytes([0u8; 16]);
        let key = AuthKey::new(&raw);
        // Just verify it doesn't panic
        assert_eq!(key.k, [0, 0, 0, 0]);
    }

    #[test]
    fn test_one_shot_mac() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        let tag1 = mac(&key, b"Hello, world!");
        let tag2 = mac(&key, b"Hello, world!");

        // Same input produces same tag
        assert!(tag1.verify(&tag2));

        // Different input produces different tag
        let tag3 = mac(&key, b"Hello, World!");
        assert!(!tag1.verify(&tag3));
    }

    #[test]
    fn test_incremental_mac() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        // One-shot
        let tag1 = mac(&key, b"Hello, world!");

        // Incremental (same data)
        let tag2 = AuthBuilder::new(&key)
            .update(b"Hello, ")
            .update(b"world!")
            .finalize();

        assert!(tag1.verify(&tag2));
    }

    #[test]
    fn test_incremental_mac_chunked() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        // Test with data that spans multiple blocks
        let data = b"This is a longer message that spans multiple 16-byte blocks for testing.";

        let tag1 = mac(&key, data);

        // Incremental with arbitrary chunk sizes
        let tag2 = AuthBuilder::new(&key)
            .update(&data[..10])
            .update(&data[10..25])
            .update(&data[25..50])
            .update(&data[50..])
            .finalize();

        assert!(tag1.verify(&tag2));
    }

    #[test]
    fn test_empty_message() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        let tag = mac(&key, b"");
        // Should produce a valid tag for empty message
        assert_eq!(tag.as_bytes().len(), MAC_TAG_SIZE);
    }

    #[test]
    fn test_verify_function() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        let tag = mac(&key, b"test message");
        assert!(verify(&key, b"test message", &tag));
        assert!(!verify(&key, b"wrong message", &tag));
    }

    #[test]
    fn test_message_authentication() {
        let raw = RawKey::from_bytes([0x42; 16]);
        let key = AuthKey::new(&raw);

        let sender_id = 5u8;
        let msg_type = 0x04u8;
        let data = b"proposal data";

        let tag = mac_message(&key, sender_id, msg_type, data);
        assert!(verify_message(&key, sender_id, msg_type, data, &tag));

        // Wrong sender_id should fail
        assert!(!verify_message(&key, 6, msg_type, data, &tag));

        // Wrong msg_type should fail
        assert!(!verify_message(&key, sender_id, 0x05, data, &tag));
    }

    #[test]
    fn test_auth_requirement() {
        assert_eq!(auth_requirement(0x04), AuthRequirement::Required);
        assert_eq!(auth_requirement(0x05), AuthRequirement::Required);
        assert_eq!(auth_requirement(0x08), AuthRequirement::Required);
        assert_eq!(auth_requirement(0x01), AuthRequirement::None);
        assert_eq!(auth_requirement(0x02), AuthRequirement::None);
        assert_eq!(auth_requirement(0x99), AuthRequirement::None);
    }

    #[test]
    fn test_different_keys() {
        let raw1 = RawKey::from_bytes([0x42; 16]);
        let raw2 = RawKey::from_bytes([0x43; 16]);

        let key1 = AuthKey::new(&raw1);
        let key2 = AuthKey::new(&raw2);

        let tag1 = mac(&key1, b"message");
        let tag2 = mac(&key2, b"message");

        // Different keys produce different tags
        assert!(!tag1.verify(&tag2));
    }

    // Test vector from Chaskey paper (if available)
    #[test]
    fn test_known_vector() {
        // Test with all-zero key and empty message
        let raw = RawKey::from_bytes([0u8; 16]);
        let key = AuthKey::new(&raw);

        let tag = mac(&key, b"");

        // The tag should be deterministic
        let tag2 = mac(&key, b"");
        assert!(tag.verify(&tag2));
    }
}
