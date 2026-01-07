/**
 * Access Tier Configuration
 *
 * Centralized password and access level configuration for protected content.
 *
 * SECURITY NOTE: This is client-side protection only - passwords are visible
 * in the JavaScript bundle. This is for convenience/basic gating, not real security.
 * Truly confidential content should not be bundled in the public build.
 */

export const ACCESS_TIERS = {
  PUBLIC: {
    name: 'public',
    password: null,
    storageKey: null,
    title: null,
    description: null,
  },
  PARTNER: {
    name: 'partner',
    password: 'partner2026',
    storageKey: 'ek_partner_access',
    title: 'Partner Portal',
    description: 'Technical documentation for partners and collaborators',
  },
  INVESTOR: {
    name: 'investor',
    password: 'investor2026',
    storageKey: 'ek_investor_access',
    title: 'Investor Portal',
    description: 'Confidential IP and strategy documents',
  },
};

/**
 * Route to tier mapping
 * Used for automatic tier detection based on current route
 */
export const ROUTE_TIERS = {
  // Partner tier routes
  '/partner': 'PARTNER',
  '/jezgro-dev': 'PARTNER',
  '/jezgro-blog': 'PARTNER',
  '/roj': 'PARTNER',
  '/v2g': 'PARTNER',

  // Investor tier routes
  '/investor': 'INVESTOR',
  '/patent': 'INVESTOR',
  '/patent-portfolio': 'INVESTOR',
  '/strategy': 'INVESTOR',
};

/**
 * Get tier for a given route path
 * @param {string} path - The route path
 * @returns {object|null} - The tier configuration or null for public
 */
export function getTierForRoute(path) {
  // Check exact match first
  if (ROUTE_TIERS[path]) {
    return ACCESS_TIERS[ROUTE_TIERS[path]];
  }

  // Check if path starts with a tier prefix
  for (const [route, tierName] of Object.entries(ROUTE_TIERS)) {
    if (path.startsWith(route + '/')) {
      return ACCESS_TIERS[tierName];
    }
  }

  return null; // Public access
}

/**
 * Check if user has access to a tier
 * @param {string} tierName - 'PARTNER' or 'INVESTOR'
 * @returns {boolean}
 */
export function hasTierAccess(tierName) {
  const tier = ACCESS_TIERS[tierName];
  if (!tier || !tier.storageKey) return true; // Public
  return localStorage.getItem(tier.storageKey) === 'true';
}

/**
 * Grant access to a tier
 * @param {string} tierName - 'PARTNER' or 'INVESTOR'
 */
export function grantTierAccess(tierName) {
  const tier = ACCESS_TIERS[tierName];
  if (tier && tier.storageKey) {
    localStorage.setItem(tier.storageKey, 'true');
  }
}

/**
 * Revoke access to a tier
 * @param {string} tierName - 'PARTNER' or 'INVESTOR'
 */
export function revokeTierAccess(tierName) {
  const tier = ACCESS_TIERS[tierName];
  if (tier && tier.storageKey) {
    localStorage.removeItem(tier.storageKey);
  }
}

/**
 * Revoke access to all tiers
 */
export function revokeAllAccess() {
  Object.values(ACCESS_TIERS).forEach(tier => {
    if (tier.storageKey) {
      localStorage.removeItem(tier.storageKey);
    }
  });
}
