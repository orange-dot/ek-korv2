/**
 * Route Data Aggregator
 * Central export for all detailed GPS route data
 */

// Pod routes (ground delivery vehicles)
export {
  POD_ROUTES_BY_CITY,
  LA_POD_ROUTES,
  NYC_POD_ROUTES,
  SEATTLE_POD_ROUTES,
  SF_POD_ROUTES,
  PALOALTO_POD_ROUTES,
  CHICAGO_POD_ROUTES,
  MIAMI_POD_ROUTES,
  DENVER_POD_ROUTES,
  AUSTIN_POD_ROUTES,
  BOSTON_POD_ROUTES,
  PORTLAND_POD_ROUTES,
  PHOENIX_POD_ROUTES,
} from './podRoutes';

// Interstate routes (heavy-duty trucks)
export {
  INTERSTATE_ROUTES,
  I5_LA_SF,
  I5_SF_PORTLAND,
  I5_PORTLAND_SEATTLE,
  I10_LA_PHOENIX,
  I10_PHOENIX_TUCSON,
  I10_TUCSON_ELPASO,
  I90_SEATTLE_SPOKANE,
  I95_BOSTON_NYC,
  I95_NYC_PHILADELPHIA,
  I25_DENVER_BOULDER,
  US101_SF_PALOALTO,
  getAllSwapStations,
} from './interstateRoutes';

// SwarmBot street grids
export {
  SWARM_STREET_GRID,
  LA_SWARM_STREETS,
  NYC_SWARM_STREETS,
  SEATTLE_SWARM_STREETS,
  SF_SWARM_STREETS,
  getStreetsInZone,
  getNearestStreet,
  getRandomTargetOnStreet,
} from './swarmRoutes';
