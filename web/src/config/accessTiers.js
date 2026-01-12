/**
 * Access Tier Configuration
 *
 * Protected content has been removed for public release.
 * This file is kept for potential future use.
 */

export const ACCESS_TIERS = {
  PUBLIC: {
    name: 'public',
    password: null,
    storageKey: null,
    title: null,
    description: null,
  },
};

export const ROUTE_TIERS = {};

export function getTierForRoute(path) {
  return null; // All routes are public
}

export function hasTierAccess(tierName) {
  return true; // Public access only
}

export function grantTierAccess(tierName) {
  // No-op - no protected tiers
}

export function revokeTierAccess(tierName) {
  // No-op - no protected tiers
}

export function revokeAllAccess() {
  // No-op - no protected tiers
}
