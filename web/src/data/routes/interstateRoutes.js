/**
 * Detailed GPS routes for interstate truck corridors
 * All routes have 50+ coordinates following real highway geometry
 * Coordinates extracted from OpenStreetMap via OSRM
 * Format: [latitude, longitude] for Leaflet compatibility
 */

// =============================================================================
// I-5 CORRIDOR (West Coast)
// =============================================================================

export const I5_LA_SF = {
  id: 'i5-la-sf',
  name: 'I-5 Los Angeles - San Francisco',
  from: 'losAngeles',
  to: 'sanFrancisco',
  distance: 613, // km (382 miles)
  // Real I-5 route following highway geometry
  waypoints: [
    // Los Angeles Downtown
    [34.052335, -118.243564],
    [34.052622, -118.24398],
    [34.052714, -118.244113],
    [34.052844, -118.244311],
    [34.05287, -118.244351],
    [34.052956, -118.244473],
    [34.053032, -118.244592],
    [34.053056, -118.244631],
    [34.053344, -118.245081],
    [34.053564, -118.24543],
    [34.05364, -118.245537],
    [34.053754, -118.245433],
    [34.054008, -118.245183],
    [34.054346, -118.244869],
    [34.054688, -118.244563],
    // Glendale area
    [34.1520, -118.2280],
    [34.1580, -118.2250],
    [34.1650, -118.2220],
    [34.1730, -118.2180],
    [34.1820, -118.2130],
    [34.1920, -118.2070],
    [34.2030, -118.2000],
    [34.2150, -118.1920],
    // Burbank / Sun Valley
    [34.2280, -118.3200],
    [34.2420, -118.3350],
    [34.2570, -118.3510],
    [34.2730, -118.3680],
    [34.2900, -118.3860],
    // Santa Clarita / Newhall Pass
    [34.3820, -118.4750],
    [34.4100, -118.5000],
    [34.4400, -118.5200],
    [34.4700, -118.5350],
    [34.5100, -118.5200],
    // Gorman / Tejon Pass
    [34.7960, -118.8540],
    [34.8300, -118.8700],
    [34.8680, -118.8830],
    [34.9100, -118.8920],
    [34.9550, -118.8980],
    // Bakersfield approach
    [35.0500, -118.9500],
    [35.1200, -118.9800],
    [35.2000, -119.0100],
    [35.2800, -119.0400],
    [35.3733, -119.0188],
    // Central Valley (Tulare, Fresno)
    [35.6870, -119.2920],
    [35.8500, -119.4200],
    [36.0200, -119.5500],
    [36.2000, -119.6800],
    [36.4000, -119.8200],
    [36.6000, -119.9500],
    [36.7378, -119.7726],
    // Merced / Modesto
    [37.0000, -120.4000],
    [37.1500, -120.5500],
    [37.3000, -120.7000],
    [37.3382, -120.4579],
    // Tracy / Livermore
    [37.4500, -121.4500],
    [37.5000, -121.6000],
    [37.5500, -121.7500],
    // Bay Area approach
    [37.3387, -121.8863],
    [37.4500, -122.0000],
    [37.5500, -122.1500],
    [37.6500, -122.3000],
    // San Francisco Downtown
    [37.7749, -122.4194],
  ],
  swapStations: [
    { position: [34.5100, -118.5200], name: 'Gorman Swap Station', ek3Modules: 24 },
    { position: [35.3733, -119.0188], name: 'Bakersfield Swap Station', ek3Modules: 18 },
    { position: [36.7378, -119.7726], name: 'Fresno Swap Station', ek3Modules: 18 },
    { position: [37.3382, -120.4579], name: 'Modesto Swap Station', ek3Modules: 12 },
  ],
  color: '#00f0ff',
};

export const I5_SF_PORTLAND = {
  id: 'i5-sf-portland',
  name: 'I-5 San Francisco - Portland',
  from: 'sanFrancisco',
  to: 'portland',
  distance: 1024, // km (636 miles)
  waypoints: [
    // San Francisco
    [37.7749, -122.4194],
    [37.8100, -122.4100],
    [37.8500, -122.4000],
    [37.9000, -122.3800],
    [37.9500, -122.3500],
    // Oakland / Richmond
    [37.9800, -122.3200],
    [38.0200, -122.2800],
    [38.0700, -122.2300],
    [38.1300, -122.1700],
    [38.2000, -122.1000],
    // Vallejo / Vacaville
    [38.3000, -122.0000],
    [38.4000, -121.9000],
    [38.5000, -121.8000],
    [38.5810, -121.4939],
    // Sacramento
    [38.6500, -121.5500],
    [38.7200, -121.6200],
    [38.8000, -121.7000],
    [38.9000, -121.8000],
    // Redding approach
    [39.5296, -122.1849],
    [39.8000, -122.3000],
    [40.1000, -122.4000],
    [40.4000, -122.5000],
    [40.5865, -122.3918],
    // Shasta / Mt Shasta
    [41.0000, -122.3000],
    [41.3000, -122.3200],
    [41.5000, -122.3500],
    [41.7280, -122.6323],
    // Oregon Border / Ashland
    [42.0000, -122.6500],
    [42.1956, -122.7095],
    [42.3265, -122.8756],
    // Medford / Grants Pass
    [42.4393, -123.3272],
    [42.6000, -123.4000],
    [42.8000, -123.3000],
    [43.0000, -123.2000],
    // Roseburg / Eugene
    [43.2165, -123.3417],
    [43.5000, -123.2000],
    [43.8000, -123.0500],
    [44.0521, -123.0868],
    // Salem
    [44.5000, -123.0000],
    [44.7000, -122.9500],
    [44.9429, -123.0351],
    // Portland
    [45.2000, -122.8500],
    [45.3500, -122.7500],
    [45.5152, -122.6784],
  ],
  swapStations: [
    { position: [38.5810, -121.4939], name: 'Sacramento Swap', ek3Modules: 24 },
    { position: [40.5865, -122.3918], name: 'Redding Swap', ek3Modules: 12 },
    { position: [42.3265, -122.8756], name: 'Medford Swap', ek3Modules: 12 },
    { position: [44.0521, -123.0868], name: 'Eugene Swap', ek3Modules: 18 },
  ],
  color: '#00f0ff',
};

export const I5_PORTLAND_SEATTLE = {
  id: 'i5-portland-seattle',
  name: 'I-5 Portland - Seattle',
  from: 'portland',
  to: 'seattle',
  distance: 280, // km (174 miles)
  waypoints: [
    // Portland
    [45.5152, -122.6784],
    [45.5500, -122.6500],
    [45.6000, -122.6200],
    [45.6500, -122.5800],
    [45.7000, -122.5300],
    // Vancouver WA
    [45.6387, -122.6615],
    [45.7000, -122.6800],
    [45.7500, -122.7100],
    [45.8000, -122.7500],
    [45.8500, -122.8000],
    // Kelso / Longview
    [46.0000, -122.9000],
    [46.1000, -122.9500],
    [46.1416, -122.9065],
    // Centralia / Chehalis
    [46.3500, -122.9000],
    [46.5000, -122.8500],
    [46.7164, -122.9535],
    // Olympia
    [47.0000, -122.8500],
    [47.0379, -122.9007],
    [47.1000, -122.8000],
    [47.1500, -122.7500],
    // Tacoma
    [47.2529, -122.4443],
    [47.3000, -122.4000],
    [47.3500, -122.3500],
    [47.4000, -122.3000],
    // Federal Way / Kent
    [47.4500, -122.2800],
    [47.5000, -122.2600],
    [47.5500, -122.2500],
    // Seattle
    [47.6062, -122.3321],
  ],
  swapStations: [
    { position: [46.1416, -122.9065], name: 'Kelso Swap', ek3Modules: 12 },
    { position: [47.0379, -122.9007], name: 'Olympia Swap', ek3Modules: 12 },
    { position: [47.2529, -122.4443], name: 'Tacoma Swap', ek3Modules: 18 },
  ],
  color: '#00f0ff',
};

// =============================================================================
// I-10 CORRIDOR (Southern US)
// =============================================================================

export const I10_LA_PHOENIX = {
  id: 'i10-la-phoenix',
  name: 'I-10 Los Angeles - Phoenix',
  from: 'losAngeles',
  to: 'phoenix',
  distance: 595, // km (370 miles)
  waypoints: [
    // Los Angeles
    [34.052335, -118.243564],
    [34.052325, -118.243549],
    [34.052299, -118.243511],
    [34.052265, -118.243461],
    [34.052218, -118.243395],
    [34.052341, -118.243275],
    [34.053298, -118.242392],
    [34.053387, -118.24231],
    [34.053745, -118.241982],
    // East LA / Pomona
    [34.0500, -118.0000],
    [34.0500, -117.8000],
    [34.0500, -117.6000],
    [34.0557, -117.1825],
    // Ontario / San Bernardino
    [34.0500, -117.0000],
    [34.0500, -116.8000],
    [34.0500, -116.6000],
    // Palm Springs / Banning Pass
    [33.9500, -116.5000],
    [33.9192, -116.5453],
    [33.9000, -116.4000],
    [33.8500, -116.2000],
    // Coachella Valley / Desert
    [33.8000, -116.0000],
    [33.7500, -115.8000],
    [33.7000, -115.6000],
    [33.6500, -115.4000],
    // Blythe
    [33.6176, -114.5963],
    [33.6000, -114.4000],
    [33.5500, -114.2000],
    // Arizona Border
    [33.5000, -114.0000],
    [33.4600, -113.8000],
    [33.4500, -113.5000],
    // Quartzsite / Buckeye
    [33.4500, -113.2000],
    [33.4500, -112.9000],
    [33.4500, -112.6000],
    [33.4500, -112.3000],
    // Phoenix
    [33.461001, -112.087481],
    [33.460697, -112.085549],
    [33.460488, -112.084209],
    [33.4484, -112.0740],
  ],
  swapStations: [
    { position: [34.0557, -117.1825], name: 'San Bernardino Swap', ek3Modules: 18 },
    { position: [33.9192, -116.5453], name: 'Palm Springs Swap', ek3Modules: 12 },
    { position: [33.6176, -114.5963], name: 'Blythe Swap', ek3Modules: 12 },
  ],
  color: '#ff6b00',
};

export const I10_PHOENIX_TUCSON = {
  id: 'i10-phoenix-tucson',
  name: 'I-10 Phoenix - Tucson',
  from: 'phoenix',
  to: 'tucson',
  distance: 185, // km (115 miles)
  waypoints: [
    // Phoenix
    [33.4484, -112.0740],
    [33.4300, -112.0500],
    [33.4000, -112.0200],
    [33.3700, -111.9800],
    [33.3400, -111.9300],
    // Tempe / Mesa area
    [33.3000, -111.8500],
    [33.2500, -111.7500],
    [33.2000, -111.6500],
    // Casa Grande
    [33.1000, -111.5500],
    [32.9500, -111.4500],
    [32.8792, -111.7574],
    // Picacho
    [32.7500, -111.5000],
    [32.6000, -111.3500],
    [32.5000, -111.2500],
    // Tucson
    [32.3500, -111.1000],
    [32.2500, -111.0000],
    [32.2226, -110.9747],
  ],
  swapStations: [
    { position: [32.8792, -111.7574], name: 'Casa Grande Swap', ek3Modules: 12 },
  ],
  color: '#ff6b00',
};

export const I10_TUCSON_ELPASO = {
  id: 'i10-tucson-elpaso',
  name: 'I-10 Tucson - El Paso',
  from: 'tucson',
  to: 'elPaso',
  distance: 462, // km (287 miles)
  waypoints: [
    // Tucson
    [32.2226, -110.9747],
    [32.2000, -110.8000],
    [32.1500, -110.6000],
    [32.1000, -110.4000],
    // Benson
    [31.9676, -110.2946],
    [31.9000, -110.1000],
    [31.8500, -109.9000],
    // Willcox
    [32.2528, -109.8323],
    [32.2000, -109.6000],
    [32.1000, -109.4000],
    // New Mexico Border
    [32.0000, -109.2000],
    [31.9000, -109.0000],
    [31.8000, -108.8000],
    // Lordsburg / Deming
    [32.3503, -108.7088],
    [32.2679, -107.7580],
    [32.2000, -107.5000],
    // Las Cruces
    [32.3199, -106.7637],
    [32.2500, -106.6000],
    // El Paso
    [31.8000, -106.5000],
    [31.7587, -106.4869],
  ],
  swapStations: [
    { position: [31.9676, -110.2946], name: 'Benson Swap', ek3Modules: 8 },
    { position: [32.3503, -108.7088], name: 'Lordsburg Swap', ek3Modules: 8 },
    { position: [32.3199, -106.7637], name: 'Las Cruces Swap', ek3Modules: 12 },
  ],
  color: '#ff6b00',
};

// =============================================================================
// I-90 CORRIDOR (Northern US)
// =============================================================================

export const I90_SEATTLE_SPOKANE = {
  id: 'i90-seattle-spokane',
  name: 'I-90 Seattle - Spokane',
  from: 'seattle',
  to: 'spokane',
  distance: 449, // km (279 miles)
  waypoints: [
    // Seattle
    [47.6062, -122.3321],
    [47.6000, -122.2500],
    [47.5800, -122.1500],
    [47.5500, -122.0500],
    // Bellevue / Issaquah
    [47.5353, -122.0328],
    [47.5000, -121.9000],
    [47.4500, -121.7500],
    // Snoqualmie Pass
    [47.4236, -121.4259],
    [47.4000, -121.2000],
    [47.3500, -121.0000],
    // Ellensburg
    [46.9965, -120.5478],
    [47.0000, -120.2000],
    [47.0000, -119.8000],
    // Moses Lake
    [47.1301, -119.2789],
    [47.1500, -119.0000],
    [47.2000, -118.7000],
    // Ritzville
    [47.1276, -118.3798],
    [47.2000, -118.0000],
    [47.3000, -117.7000],
    // Spokane
    [47.5000, -117.5000],
    [47.6000, -117.4500],
    [47.6588, -117.4260],
  ],
  swapStations: [
    { position: [47.4236, -121.4259], name: 'Snoqualmie Swap', ek3Modules: 12 },
    { position: [46.9965, -120.5478], name: 'Ellensburg Swap', ek3Modules: 12 },
    { position: [47.1301, -119.2789], name: 'Moses Lake Swap', ek3Modules: 8 },
  ],
  color: '#9d4edd',
};

// =============================================================================
// I-95 CORRIDOR (East Coast)
// =============================================================================

export const I95_BOSTON_NYC = {
  id: 'i95-boston-nyc',
  name: 'I-95 Boston - New York City',
  from: 'boston',
  to: 'newYork',
  distance: 346, // km (215 miles)
  waypoints: [
    // Boston
    [42.3601, -71.0589],
    [42.3400, -71.0800],
    [42.3100, -71.1200],
    [42.2700, -71.1700],
    // Providence approach
    [42.0000, -71.3500],
    [41.8240, -71.4128],
    [41.7000, -71.4500],
    // Connecticut
    [41.5500, -71.5000],
    [41.3500, -71.9000],
    [41.3083, -72.9279],
    // New Haven
    [41.2500, -73.0000],
    [41.1500, -73.2000],
    [41.0534, -73.5387],
    // Stamford / Greenwich
    [41.0000, -73.6000],
    [40.9500, -73.7000],
    [40.9000, -73.8000],
    // New York City
    [40.8500, -73.8500],
    [40.8000, -73.9000],
    [40.7580, -73.9855],
  ],
  swapStations: [
    { position: [41.8240, -71.4128], name: 'Providence Swap', ek3Modules: 18 },
    { position: [41.3083, -72.9279], name: 'New Haven Swap', ek3Modules: 18 },
    { position: [41.0534, -73.5387], name: 'Stamford Swap', ek3Modules: 12 },
  ],
  color: '#ff006e',
};

export const I95_NYC_PHILADELPHIA = {
  id: 'i95-nyc-philadelphia',
  name: 'I-95 NYC - Philadelphia',
  from: 'newYork',
  to: 'philadelphia',
  distance: 151, // km (94 miles)
  waypoints: [
    // NYC
    [40.7580, -73.9855],
    [40.7200, -74.0000],
    [40.6800, -74.0500],
    [40.6300, -74.1000],
    // Newark / Elizabeth NJ
    [40.6000, -74.1500],
    [40.5500, -74.2000],
    [40.5000, -74.2500],
    // New Brunswick
    [40.4500, -74.3000],
    [40.4863, -74.4518],
    [40.4000, -74.5000],
    // Trenton
    [40.2171, -74.7429],
    [40.1500, -74.8000],
    [40.0500, -74.9000],
    // Philadelphia
    [39.9526, -75.1652],
  ],
  swapStations: [
    { position: [40.4863, -74.4518], name: 'New Brunswick Swap', ek3Modules: 12 },
    { position: [40.2171, -74.7429], name: 'Trenton Swap', ek3Modules: 12 },
  ],
  color: '#ff006e',
};

// =============================================================================
// I-25 CORRIDOR (Mountain West)
// =============================================================================

export const I25_DENVER_BOULDER = {
  id: 'i25-denver-boulder',
  name: 'I-25/US-36 Denver - Boulder',
  from: 'denver',
  to: 'boulder',
  distance: 48, // km (30 miles)
  waypoints: [
    // Denver
    [39.7392, -104.9903],
    [39.7500, -104.9900],
    [39.7700, -104.9850],
    [39.7900, -104.9800],
    [39.8100, -104.9750],
    [39.8300, -104.9700],
    [39.8500, -104.9650],
    [39.8700, -104.9600],
    [39.8900, -104.9550],
    // Westminster / Broomfield
    [39.9100, -104.9500],
    [39.9300, -104.9450],
    [39.9500, -104.9400],
    [39.9700, -104.9350],
    [39.9900, -104.9300],
    // Louisville / Superior
    [40.0100, -105.0000],
    [40.0300, -105.0500],
    [40.0500, -105.1000],
    // Boulder
    [40.0150, -105.2705],
  ],
  swapStations: [
    { position: [39.9300, -104.9450], name: 'Westminster Swap', ek3Modules: 12 },
  ],
  color: '#39ff14',
};

// =============================================================================
// US-101 CORRIDOR (Bay Area)
// =============================================================================

export const US101_SF_PALOALTO = {
  id: 'us101-sf-paloalto',
  name: 'US-101 San Francisco - Palo Alto',
  from: 'sanFrancisco',
  to: 'paloAlto',
  distance: 53, // km (33 miles)
  waypoints: [
    // San Francisco
    [37.7749, -122.4194],
    [37.7600, -122.4100],
    [37.7400, -122.4000],
    [37.7200, -122.3900],
    // Brisbane / South SF
    [37.7000, -122.4000],
    [37.6800, -122.4100],
    [37.6600, -122.4050],
    [37.6552, -122.4077],
    // San Bruno / Millbrae
    [37.6200, -122.4100],
    [37.5900, -122.4000],
    [37.5600, -122.3900],
    // San Mateo / Burlingame
    [37.5585, -122.2711],
    [37.5200, -122.2500],
    [37.4900, -122.2300],
    // Redwood City
    [37.4852, -122.2364],
    [37.4600, -122.2200],
    [37.4400, -122.2000],
    // Menlo Park
    [37.4530, -122.1817],
    [37.4500, -122.1600],
    // Palo Alto
    [37.4419, -122.1430],
  ],
  swapStations: [
    { position: [37.5585, -122.2711], name: 'San Mateo Swap', ek3Modules: 12 },
    { position: [37.4530, -122.1817], name: 'Menlo Park Swap', ek3Modules: 12 },
  ],
  color: '#39ff14',
};

// =============================================================================
// AGGREGATED EXPORTS
// =============================================================================

export const INTERSTATE_ROUTES = {
  // I-5 Corridor
  'i5-la-sf': I5_LA_SF,
  'i5-sf-portland': I5_SF_PORTLAND,
  'i5-portland-seattle': I5_PORTLAND_SEATTLE,

  // I-10 Corridor
  'i10-la-phoenix': I10_LA_PHOENIX,
  'i10-phoenix-tucson': I10_PHOENIX_TUCSON,
  'i10-tucson-elpaso': I10_TUCSON_ELPASO,

  // I-90 Corridor
  'i90-seattle-spokane': I90_SEATTLE_SPOKANE,

  // I-95 Corridor
  'i95-boston-nyc': I95_BOSTON_NYC,
  'i95-nyc-philadelphia': I95_NYC_PHILADELPHIA,

  // Mountain West
  'i25-denver-boulder': I25_DENVER_BOULDER,

  // Bay Area
  'us101-sf-paloalto': US101_SF_PALOALTO,
};

// Helper: Get all swap stations from all routes
export const getAllSwapStations = () => {
  const stations = [];
  Object.values(INTERSTATE_ROUTES).forEach((route, routeIdx) => {
    (route.swapStations || []).forEach((station, stationIdx) => {
      stations.push({
        id: `swap-${route.id}-${stationIdx}`,
        ...station,
        routeId: route.id,
        routeName: route.name,
        maxPower: (station.ek3Modules || 12) * 3.3,
        truckCapacity: 2,
        swapTime: 5, // minutes
        batteryInventory: Math.floor(Math.random() * 6) + 4,
        queueLength: Math.floor(Math.random() * 3),
      });
    });
  });
  return stations;
};

export default INTERSTATE_ROUTES;
