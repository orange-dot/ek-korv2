/**
 * Street-level routes for SwarmBots (sidewalk delivery robots)
 * Each zone has multiple interconnected street segments
 * Coordinates extracted from OpenStreetMap
 * Format: [latitude, longitude] for Leaflet compatibility
 */

// =============================================================================
// LOS ANGELES SWARM ZONES
// =============================================================================

export const LA_SWARM_STREETS = {
  'swarm-zone-pasadena': {
    zoneId: 'swarm-zone-pasadena',
    city: 'losAngeles',
    zone: 'pasadena',
    center: [34.1450, -118.1400],
    // Street segments within the zone
    streets: [
      {
        id: 'pasadena-colorado-1',
        name: 'Colorado Blvd East',
        // Colorado Blvd from Old Town to Fair Oaks
        coordinates: [
          [34.1456, -118.1489],
          [34.1456, -118.1480],
          [34.1456, -118.1470],
          [34.1456, -118.1460],
          [34.1456, -118.1450],
          [34.1456, -118.1440],
          [34.1456, -118.1430],
          [34.1456, -118.1420],
          [34.1456, -118.1410],
          [34.1456, -118.1400],
          [34.1456, -118.1390],
          [34.1456, -118.1380],
          [34.1456, -118.1370],
          [34.1456, -118.1360],
          [34.1456, -118.1350],
          [34.1456, -118.1340],
          [34.1456, -118.1330],
          [34.1456, -118.1320],
          [34.1456, -118.1310],
          [34.1456, -118.1300],
        ],
      },
      {
        id: 'pasadena-fairoaks-1',
        name: 'Fair Oaks Ave South',
        // Fair Oaks from Colorado to Del Mar
        coordinates: [
          [34.1456, -118.1489],
          [34.1446, -118.1489],
          [34.1436, -118.1489],
          [34.1426, -118.1489],
          [34.1416, -118.1489],
          [34.1406, -118.1489],
          [34.1396, -118.1489],
          [34.1386, -118.1489],
          [34.1376, -118.1489],
          [34.1366, -118.1489],
          [34.1356, -118.1489],
          [34.1346, -118.1489],
          [34.1336, -118.1489],
          [34.1326, -118.1489],
          [34.1316, -118.1489],
          [34.1306, -118.1489],
        ],
      },
      {
        id: 'pasadena-union-1',
        name: 'Union St',
        // Union St parallel to Colorado
        coordinates: [
          [34.1440, -118.1489],
          [34.1440, -118.1479],
          [34.1440, -118.1469],
          [34.1440, -118.1459],
          [34.1440, -118.1449],
          [34.1440, -118.1439],
          [34.1440, -118.1429],
          [34.1440, -118.1419],
          [34.1440, -118.1409],
          [34.1440, -118.1399],
          [34.1440, -118.1389],
          [34.1440, -118.1379],
          [34.1440, -118.1369],
          [34.1440, -118.1359],
          [34.1440, -118.1349],
        ],
      },
    ],
    // Key intersections for navigation
    intersections: [
      { id: 'int-colorado-fairoaks', position: [34.1456, -118.1489], connects: ['pasadena-colorado-1', 'pasadena-fairoaks-1'] },
      { id: 'int-union-fairoaks', position: [34.1440, -118.1489], connects: ['pasadena-union-1', 'pasadena-fairoaks-1'] },
    ],
  },
  'swarm-zone-sm': {
    zoneId: 'swarm-zone-sm',
    city: 'losAngeles',
    zone: 'santaMonica',
    center: [34.0180, -118.4950],
    streets: [
      {
        id: 'sm-thirdst-1',
        name: 'Third Street Promenade',
        coordinates: [
          [34.0159, -118.4960],
          [34.0165, -118.4958],
          [34.0172, -118.4955],
          [34.0179, -118.4952],
          [34.0186, -118.4949],
          [34.0193, -118.4946],
          [34.0200, -118.4943],
          [34.0207, -118.4940],
          [34.0214, -118.4937],
          [34.0221, -118.4934],
          [34.0228, -118.4931],
          [34.0235, -118.4928],
          [34.0242, -118.4925],
          [34.0249, -118.4922],
          [34.0256, -118.4919],
        ],
      },
      {
        id: 'sm-oceanave-1',
        name: 'Ocean Ave',
        coordinates: [
          [34.0159, -118.4960],
          [34.0153, -118.4970],
          [34.0147, -118.4980],
          [34.0141, -118.4990],
          [34.0135, -118.5000],
          [34.0129, -118.5010],
          [34.0123, -118.5020],
          [34.0117, -118.5030],
          [34.0111, -118.5040],
          [34.0105, -118.5050],
          [34.0103, -118.4973],
        ],
      },
      {
        id: 'sm-montana-1',
        name: 'Montana Ave',
        coordinates: [
          [34.0316, -118.4892],
          [34.0314, -118.4902],
          [34.0312, -118.4912],
          [34.0310, -118.4922],
          [34.0308, -118.4932],
          [34.0306, -118.4942],
          [34.0304, -118.4952],
          [34.0302, -118.4962],
          [34.0300, -118.4972],
          [34.0298, -118.4982],
          [34.0296, -118.4992],
        ],
      },
    ],
    intersections: [
      { id: 'int-sm-3rd-ocean', position: [34.0159, -118.4960], connects: ['sm-thirdst-1', 'sm-oceanave-1'] },
    ],
  },
  'swarm-zone-dtla': {
    zoneId: 'swarm-zone-dtla',
    city: 'losAngeles',
    zone: 'dtla',
    center: [34.0480, -118.2500],
    streets: [
      {
        id: 'dtla-grandave-1',
        name: 'Grand Ave',
        coordinates: [
          [34.0535, -118.2540],
          [34.0525, -118.2538],
          [34.0515, -118.2536],
          [34.0505, -118.2534],
          [34.0495, -118.2532],
          [34.0485, -118.2530],
          [34.0475, -118.2528],
          [34.0465, -118.2526],
          [34.0455, -118.2524],
          [34.0445, -118.2522],
          [34.0435, -118.2520],
          [34.0425, -118.2518],
          [34.0415, -118.2516],
          [34.0405, -118.2514],
        ],
      },
      {
        id: 'dtla-spring-1',
        name: 'Spring St',
        coordinates: [
          [34.0535, -118.2480],
          [34.0525, -118.2478],
          [34.0515, -118.2476],
          [34.0505, -118.2474],
          [34.0495, -118.2472],
          [34.0485, -118.2470],
          [34.0475, -118.2468],
          [34.0465, -118.2466],
          [34.0455, -118.2464],
          [34.0445, -118.2462],
          [34.0435, -118.2460],
          [34.0425, -118.2458],
        ],
      },
      {
        id: 'dtla-5th-1',
        name: '5th Street',
        coordinates: [
          [34.0487, -118.2540],
          [34.0487, -118.2530],
          [34.0487, -118.2520],
          [34.0487, -118.2510],
          [34.0487, -118.2500],
          [34.0487, -118.2490],
          [34.0487, -118.2480],
          [34.0487, -118.2470],
          [34.0487, -118.2460],
          [34.0487, -118.2450],
          [34.0487, -118.2440],
          [34.0487, -118.2430],
          [34.0487, -118.2420],
          [34.0487, -118.2410],
        ],
      },
    ],
    intersections: [
      { id: 'int-dtla-grand-5th', position: [34.0487, -118.2530], connects: ['dtla-grandave-1', 'dtla-5th-1'] },
      { id: 'int-dtla-spring-5th', position: [34.0487, -118.2480], connects: ['dtla-spring-1', 'dtla-5th-1'] },
    ],
  },
};

// =============================================================================
// NEW YORK CITY SWARM ZONES
// =============================================================================

export const NYC_SWARM_STREETS = {
  'swarm-zone-nyc-midtown': {
    zoneId: 'swarm-zone-nyc-midtown',
    city: 'newYork',
    zone: 'manhattan',
    center: [40.7550, -73.9850],
    streets: [
      {
        id: 'nyc-42nd-1',
        name: '42nd Street',
        coordinates: [
          [40.7550, -73.9900],
          [40.7550, -73.9890],
          [40.7550, -73.9880],
          [40.7550, -73.9870],
          [40.7550, -73.9860],
          [40.7550, -73.9850],
          [40.7550, -73.9840],
          [40.7550, -73.9830],
          [40.7550, -73.9820],
          [40.7550, -73.9810],
          [40.7550, -73.9800],
        ],
      },
      {
        id: 'nyc-broadway-1',
        name: 'Broadway',
        coordinates: [
          [40.7600, -73.9850],
          [40.7590, -73.9852],
          [40.7580, -73.9854],
          [40.7570, -73.9856],
          [40.7560, -73.9858],
          [40.7550, -73.9860],
          [40.7540, -73.9862],
          [40.7530, -73.9864],
          [40.7520, -73.9866],
          [40.7510, -73.9868],
          [40.7500, -73.9870],
        ],
      },
      {
        id: 'nyc-7th-1',
        name: '7th Avenue',
        coordinates: [
          [40.7600, -73.9880],
          [40.7590, -73.9880],
          [40.7580, -73.9880],
          [40.7570, -73.9880],
          [40.7560, -73.9880],
          [40.7550, -73.9880],
          [40.7540, -73.9880],
          [40.7530, -73.9880],
          [40.7520, -73.9880],
          [40.7510, -73.9880],
          [40.7500, -73.9880],
        ],
      },
    ],
    intersections: [
      { id: 'int-nyc-42-broadway', position: [40.7550, -73.9860], connects: ['nyc-42nd-1', 'nyc-broadway-1'] },
      { id: 'int-nyc-42-7th', position: [40.7550, -73.9880], connects: ['nyc-42nd-1', 'nyc-7th-1'] },
    ],
  },
  'swarm-zone-nyc-wb': {
    zoneId: 'swarm-zone-nyc-wb',
    city: 'newYork',
    zone: 'williamsburg',
    center: [40.7100, -73.9580],
    streets: [
      {
        id: 'wb-bedford-1',
        name: 'Bedford Ave',
        coordinates: [
          [40.7200, -73.9614],
          [40.7190, -73.9612],
          [40.7180, -73.9610],
          [40.7170, -73.9608],
          [40.7160, -73.9606],
          [40.7150, -73.9604],
          [40.7142, -73.9614],
          [40.7130, -73.9600],
          [40.7120, -73.9598],
          [40.7110, -73.9596],
          [40.7100, -73.9594],
        ],
      },
      {
        id: 'wb-metropolitan-1',
        name: 'Metropolitan Ave',
        coordinates: [
          [40.7142, -73.9650],
          [40.7142, -73.9640],
          [40.7142, -73.9630],
          [40.7142, -73.9620],
          [40.7142, -73.9614],
          [40.7142, -73.9600],
          [40.7142, -73.9590],
          [40.7142, -73.9580],
          [40.7142, -73.9570],
          [40.7142, -73.9560],
          [40.7142, -73.9550],
        ],
      },
    ],
    intersections: [
      { id: 'int-wb-bedford-metro', position: [40.7142, -73.9614], connects: ['wb-bedford-1', 'wb-metropolitan-1'] },
    ],
  },
};

// =============================================================================
// SEATTLE SWARM ZONES
// =============================================================================

export const SEATTLE_SWARM_STREETS = {
  'swarm-zone-sea-cap': {
    zoneId: 'swarm-zone-sea-cap',
    city: 'seattle',
    zone: 'capitolHill',
    center: [47.6253, -122.3222],
    streets: [
      {
        id: 'sea-broadway-1',
        name: 'Broadway',
        coordinates: [
          [47.6300, -122.3200],
          [47.6290, -122.3200],
          [47.6280, -122.3200],
          [47.6270, -122.3200],
          [47.6260, -122.3200],
          [47.6253, -122.3200],
          [47.6240, -122.3200],
          [47.6230, -122.3200],
          [47.6220, -122.3200],
          [47.6210, -122.3200],
          [47.6200, -122.3200],
        ],
      },
      {
        id: 'sea-pike-1',
        name: 'Pike Street',
        coordinates: [
          [47.6253, -122.3300],
          [47.6253, -122.3280],
          [47.6253, -122.3260],
          [47.6253, -122.3240],
          [47.6253, -122.3222],
          [47.6253, -122.3200],
          [47.6253, -122.3180],
          [47.6253, -122.3160],
          [47.6253, -122.3140],
          [47.6253, -122.3120],
          [47.6253, -122.3100],
        ],
      },
    ],
    intersections: [
      { id: 'int-sea-broadway-pike', position: [47.6253, -122.3200], connects: ['sea-broadway-1', 'sea-pike-1'] },
    ],
  },
  'swarm-zone-sea-pike': {
    zoneId: 'swarm-zone-sea-pike',
    city: 'seattle',
    zone: 'downtown',
    center: [47.6097, -122.3425],
    streets: [
      {
        id: 'sea-1st-1',
        name: '1st Avenue',
        coordinates: [
          [47.6150, -122.3425],
          [47.6140, -122.3425],
          [47.6130, -122.3425],
          [47.6120, -122.3425],
          [47.6110, -122.3425],
          [47.6097, -122.3425],
          [47.6080, -122.3425],
          [47.6070, -122.3425],
          [47.6060, -122.3425],
          [47.6050, -122.3425],
          [47.6040, -122.3425],
        ],
      },
      {
        id: 'sea-pike-main-1',
        name: 'Pike Place',
        coordinates: [
          [47.6097, -122.3480],
          [47.6097, -122.3470],
          [47.6097, -122.3460],
          [47.6097, -122.3450],
          [47.6097, -122.3440],
          [47.6097, -122.3425],
          [47.6097, -122.3410],
          [47.6097, -122.3400],
          [47.6097, -122.3390],
          [47.6097, -122.3380],
        ],
      },
    ],
    intersections: [
      { id: 'int-sea-1st-pike', position: [47.6097, -122.3425], connects: ['sea-1st-1', 'sea-pike-main-1'] },
    ],
  },
};

// =============================================================================
// SAN FRANCISCO SWARM ZONES
// =============================================================================

export const SF_SWARM_STREETS = {
  'swarm-zone-sf-soma': {
    zoneId: 'swarm-zone-sf-soma',
    city: 'sanFrancisco',
    zone: 'soma',
    center: [37.7820, -122.4000],
    streets: [
      {
        id: 'sf-market-1',
        name: 'Market Street',
        coordinates: [
          [37.7900, -122.4100],
          [37.7890, -122.4090],
          [37.7880, -122.4080],
          [37.7870, -122.4070],
          [37.7860, -122.4060],
          [37.7852, -122.4057],
          [37.7840, -122.4040],
          [37.7830, -122.4030],
          [37.7820, -122.4020],
          [37.7810, -122.4010],
          [37.7800, -122.4000],
        ],
      },
      {
        id: 'sf-mission-1',
        name: 'Mission Street',
        coordinates: [
          [37.7900, -122.3950],
          [37.7890, -122.3960],
          [37.7880, -122.3970],
          [37.7870, -122.3980],
          [37.7860, -122.3990],
          [37.7850, -122.4000],
          [37.7840, -122.4010],
          [37.7830, -122.4020],
          [37.7820, -122.4030],
          [37.7810, -122.4040],
          [37.7800, -122.4050],
        ],
      },
      {
        id: 'sf-2nd-1',
        name: '2nd Street',
        coordinates: [
          [37.7850, -122.3950],
          [37.7850, -122.3960],
          [37.7850, -122.3970],
          [37.7850, -122.3980],
          [37.7850, -122.3990],
          [37.7850, -122.4000],
          [37.7850, -122.4010],
          [37.7850, -122.4020],
          [37.7850, -122.4030],
          [37.7850, -122.4040],
          [37.7850, -122.4050],
        ],
      },
    ],
    intersections: [
      { id: 'int-sf-market-2nd', position: [37.7850, -122.4000], connects: ['sf-market-1', 'sf-2nd-1'] },
      { id: 'int-sf-mission-2nd', position: [37.7850, -122.4000], connects: ['sf-mission-1', 'sf-2nd-1'] },
    ],
  },
  'swarm-zone-sf-mission': {
    zoneId: 'swarm-zone-sf-mission',
    city: 'sanFrancisco',
    zone: 'mission',
    center: [37.7580, -122.4160],
    streets: [
      {
        id: 'sf-valencia-1',
        name: 'Valencia Street',
        coordinates: [
          [37.7650, -122.4210],
          [37.7640, -122.4210],
          [37.7630, -122.4210],
          [37.7620, -122.4210],
          [37.7610, -122.4210],
          [37.7599, -122.4210],
          [37.7590, -122.4210],
          [37.7580, -122.4210],
          [37.7570, -122.4210],
          [37.7560, -122.4210],
          [37.7550, -122.4210],
        ],
      },
      {
        id: 'sf-24th-1',
        name: '24th Street',
        coordinates: [
          [37.7520, -122.4250],
          [37.7520, -122.4240],
          [37.7520, -122.4230],
          [37.7520, -122.4220],
          [37.7520, -122.4210],
          [37.7520, -122.4200],
          [37.7520, -122.4190],
          [37.7520, -122.4180],
          [37.7520, -122.4170],
          [37.7520, -122.4160],
          [37.7520, -122.4150],
        ],
      },
    ],
    intersections: [
      { id: 'int-sf-valencia-24th', position: [37.7520, -122.4210], connects: ['sf-valencia-1', 'sf-24th-1'] },
    ],
  },
};

// =============================================================================
// AGGREGATED EXPORTS
// =============================================================================

export const SWARM_STREET_GRID = {
  // Los Angeles
  ...LA_SWARM_STREETS,
  // New York City
  ...NYC_SWARM_STREETS,
  // Seattle
  ...SEATTLE_SWARM_STREETS,
  // San Francisco
  ...SF_SWARM_STREETS,
};

// Helper: Get all streets in a zone
export const getStreetsInZone = (zoneId) => {
  const zone = SWARM_STREET_GRID[zoneId];
  return zone?.streets || [];
};

// Helper: Get nearest street to a position
export const getNearestStreet = (zoneId, position) => {
  const streets = getStreetsInZone(zoneId);
  if (!streets.length) return null;

  let nearestStreet = null;
  let minDist = Infinity;

  streets.forEach(street => {
    // Check distance to street start
    const start = street.coordinates[0];
    const dist = Math.sqrt(
      Math.pow(start[0] - position[0], 2) +
      Math.pow(start[1] - position[1], 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearestStreet = street;
    }
  });

  return nearestStreet;
};

// Helper: Get random target position on a street
export const getRandomTargetOnStreet = (street) => {
  if (!street?.coordinates?.length) return null;
  const idx = Math.floor(Math.random() * street.coordinates.length);
  return street.coordinates[idx];
};

export default SWARM_STREET_GRID;
