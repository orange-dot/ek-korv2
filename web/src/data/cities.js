// City configurations for simulation

export const cities = {
  noviSad: {
    id: 'noviSad',
    name: 'Novi Sad',
    center: [45.2551, 19.8419],
    zoom: 14,
    busCount: 10,
    routes: [
      {
        id: 'ns-4',
        name: 'Linija 4',
        fullName: 'Liman - Centar - Detelinara',
        color: '#00d4ff',
        coordinates: [
          [45.2425, 19.8285], // Liman IV
          [45.2445, 19.8320],
          [45.2470, 19.8355],
          [45.2495, 19.8385],
          [45.2520, 19.8405], // Bulevar Oslobođenja
          [45.2545, 19.8420],
          [45.2565, 19.8435], // Centar
          [45.2585, 19.8455],
          [45.2610, 19.8480],
          [45.2640, 19.8510],
          [45.2675, 19.8545], // Detelinara
        ],
        stations: ['ns-station-1'],
      },
      {
        id: 'ns-7',
        name: 'Linija 7',
        fullName: 'Novo Naselje - Centar - Klisa',
        color: '#7c3aed',
        coordinates: [
          [45.2680, 19.8120], // Novo Naselje
          [45.2650, 19.8180],
          [45.2620, 19.8250],
          [45.2590, 19.8320],
          [45.2565, 19.8380],
          [45.2551, 19.8419], // Centar
          [45.2540, 19.8480],
          [45.2525, 19.8550],
          [45.2505, 19.8620],
          [45.2480, 19.8690], // Klisa
        ],
        stations: ['ns-station-2'],
      },
      {
        id: 'ns-11a',
        name: 'Linija 11A',
        fullName: 'Železnička - Telep',
        color: '#22c55e',
        coordinates: [
          [45.2670, 19.8330], // Železnička stanica
          [45.2640, 19.8350],
          [45.2610, 19.8380],
          [45.2580, 19.8400],
          [45.2551, 19.8419], // Centar
          [45.2520, 19.8440],
          [45.2485, 19.8460],
          [45.2450, 19.8480],
          [45.2410, 19.8500], // Telep
        ],
        stations: ['ns-station-1', 'ns-station-3'],
      },
      {
        id: 'ns-3',
        name: 'Linija 3',
        fullName: 'Satelit - Centar - Petrovaradin',
        color: '#f59e0b',
        coordinates: [
          [45.2750, 19.7980], // Satelit
          [45.2710, 19.8050],
          [45.2670, 19.8130],
          [45.2630, 19.8210],
          [45.2590, 19.8310],
          [45.2551, 19.8419], // Centar
          [45.2510, 19.8490],
          [45.2470, 19.8530],
          [45.2430, 19.8570],
          [45.2390, 19.8620],
          [45.2520, 19.8710], // Petrovaradin (preko mosta)
        ],
        stations: ['ns-station-2', 'ns-station-3'],
      },
    ],
    stations: [
      {
        id: 'ns-station-1',
        name: 'Trg Slobode',
        position: [45.2551, 19.8419],
        maxPower: 252,
        chargingPoints: 6, // koliko buseva može istovremeno da se puni
        batteryStorage: 12, // rezervne EK3 baterije za swap
        type: 'depot',
        hasRobotA: true,
        hasRobotB: true, // može swap
      },
      {
        id: 'ns-station-2',
        name: 'Železnička Stanica',
        position: [45.2670, 19.8330],
        maxPower: 150,
        chargingPoints: 4,
        batteryStorage: 0, // nema swap
        type: 'opportunity',
        hasRobotA: false,
        hasRobotB: false,
      },
      {
        id: 'ns-station-3',
        name: 'Liman',
        position: [45.2425, 19.8285],
        maxPower: 180,
        chargingPoints: 4,
        batteryStorage: 8, // ima swap
        type: 'opportunity',
        hasRobotA: true,
        hasRobotB: true,
      },
    ],
  },

  beograd: {
    id: 'beograd',
    name: 'Beograd',
    center: [44.8150, 20.4600],
    zoom: 13,
    busCount: 10,
    routes: [
      {
        id: 'bg-26',
        name: 'Linija 26',
        fullName: 'Studentski trg - Vukov Spomenik',
        color: '#00d4ff',
        coordinates: [
          [44.8176, 20.4569],
          [44.8165, 20.4545],
          [44.8154, 20.4523],
          [44.8138, 20.4508],
          [44.8125, 20.4535],
          [44.8108, 20.4568],
          [44.8095, 20.4602],
          [44.8078, 20.4645],
          [44.8062, 20.4689],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-31',
        name: 'Linija 31',
        fullName: 'Studentski trg - Banjica',
        color: '#7c3aed',
        coordinates: [
          [44.8176, 20.4569],
          [44.8198, 20.4512],
          [44.8215, 20.4478],
          [44.8195, 20.4432],
          [44.8168, 20.4398],
          [44.8142, 20.4365],
          [44.8108, 20.4328],
          [44.8065, 20.4295],
          [44.8022, 20.4258],
          [44.7985, 20.4225],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-78',
        name: 'Linija 78',
        fullName: 'Zeleni Venac - Zemun',
        color: '#22c55e',
        coordinates: [
          [44.8138, 20.4508],
          [44.8152, 20.4425],
          [44.8168, 20.4342],
          [44.8185, 20.4258],
          [44.8205, 20.4175],
          [44.8225, 20.4092],
          [44.8248, 20.4008],
          [44.8275, 20.3925],
          [44.8305, 20.3842],
          [44.8342, 20.3758],
          [44.8385, 20.3675],
          [44.8428, 20.3592],
          [44.8472, 20.3508],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-65',
        name: 'Linija 65',
        fullName: 'Zeleni Venac - Medaković',
        color: '#f59e0b',
        coordinates: [
          [44.8138, 20.4508],
          [44.8120, 20.4550],
          [44.8095, 20.4595],
          [44.8070, 20.4650],
          [44.8045, 20.4710],
          [44.8020, 20.4780],
          [44.7995, 20.4850],
          [44.7970, 20.4920],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-46',
        name: 'Linija 46',
        fullName: 'Kalemegdan - Miljakovac',
        color: '#ef4444',
        coordinates: [
          [44.8225, 20.4490],
          [44.8198, 20.4512],
          [44.8176, 20.4569],
          [44.8150, 20.4600],
          [44.8120, 20.4630],
          [44.8085, 20.4660],
          [44.8045, 20.4690],
          [44.8000, 20.4720],
          [44.7950, 20.4750],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-18',
        name: 'Linija 18',
        fullName: 'Zemun - Konjarnik',
        color: '#ec4899',
        coordinates: [
          [44.8472, 20.3508],
          [44.8420, 20.3620],
          [44.8360, 20.3750],
          [44.8300, 20.3890],
          [44.8240, 20.4040],
          [44.8180, 20.4200],
          [44.8138, 20.4350],
          [44.8100, 20.4500],
          [44.8060, 20.4650],
          [44.8020, 20.4800],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-95',
        name: 'Linija 95',
        fullName: 'Novi Beograd - Karaburma',
        color: '#06b6d4',
        coordinates: [
          [44.8180, 20.4100],
          [44.8160, 20.4200],
          [44.8145, 20.4300],
          [44.8138, 20.4400],
          [44.8140, 20.4500],
          [44.8145, 20.4600],
          [44.8155, 20.4700],
          [44.8170, 20.4800],
          [44.8190, 20.4900],
        ],
        stations: ['bg-station-1'],
      },
    ],
    stations: [
      {
        id: 'bg-station-1',
        name: 'Zeleni Venac Depo',
        position: [44.8138, 20.4508],
        maxPower: 500,
        chargingPoints: 10,
        batteryStorage: 20, // veliki depo - puno rezervnih baterija
        type: 'depot',
        hasRobotA: true,
        hasRobotB: true,
      },
    ],
  },

  kragujevac: {
    id: 'kragujevac',
    name: 'Kragujevac',
    center: [44.0128, 20.9114],
    zoom: 14,
    busCount: 10,
    routes: [
      {
        id: 'kg-1',
        name: 'Linija 1',
        fullName: 'Centar - Aerodrom',
        color: '#00d4ff',
        coordinates: [
          [44.0128, 20.9114], // Centar
          [44.0150, 20.9080],
          [44.0175, 20.9045],
          [44.0200, 20.9010],
          [44.0230, 20.8970],
          [44.0260, 20.8930],
          [44.0295, 20.8885], // Aerodrom
        ],
        stations: ['kg-station-1'],
      },
      {
        id: 'kg-2',
        name: 'Linija 2',
        fullName: 'Centar - Stanovo',
        color: '#7c3aed',
        coordinates: [
          [44.0128, 20.9114], // Centar
          [44.0100, 20.9150],
          [44.0070, 20.9190],
          [44.0040, 20.9235],
          [44.0010, 20.9280],
          [43.9980, 20.9330], // Stanovo
        ],
        stations: ['kg-station-2'],
      },
      {
        id: 'kg-3',
        name: 'Linija 3',
        fullName: 'Centar - Bresnica',
        color: '#22c55e',
        coordinates: [
          [44.0128, 20.9114], // Centar
          [44.0155, 20.9160],
          [44.0185, 20.9210],
          [44.0215, 20.9260],
          [44.0250, 20.9310],
          [44.0290, 20.9365], // Bresnica
        ],
        stations: ['kg-station-1', 'kg-station-3'],
      },
      {
        id: 'kg-4',
        name: 'Linija 4',
        fullName: 'Centar - Pivara',
        color: '#f59e0b',
        coordinates: [
          [44.0128, 20.9114], // Centar
          [44.0100, 20.9070],
          [44.0070, 20.9025],
          [44.0040, 20.8980],
          [44.0010, 20.8930],
          [43.9975, 20.8880], // Pivara
        ],
        stations: ['kg-station-2', 'kg-station-3'],
      },
    ],
    stations: [
      {
        id: 'kg-station-1',
        name: 'Trg Radomira Putnika',
        position: [44.0128, 20.9114],
        maxPower: 252,
        chargingPoints: 6,
        batteryStorage: 12,
        type: 'depot',
        hasRobotA: true,
        hasRobotB: true,
      },
      {
        id: 'kg-station-2',
        name: 'Autobuska Stanica',
        position: [44.0070, 20.9190],
        maxPower: 150,
        chargingPoints: 4,
        batteryStorage: 0, // samo punjenje
        type: 'opportunity',
        hasRobotA: false,
        hasRobotB: false,
      },
      {
        id: 'kg-station-3',
        name: 'Zastava',
        position: [44.0200, 20.9010],
        maxPower: 180,
        chargingPoints: 4,
        batteryStorage: 6,
        type: 'opportunity',
        hasRobotA: true,
        hasRobotB: true,
      },
    ],
  },
};

export function getCity(cityId) {
  return cities[cityId] || cities.noviSad;
}

export function interpolatePosition(route, progress) {
  const coords = route.coordinates;
  const totalSegments = coords.length - 1;
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const segmentLocalProgress = segmentProgress - segmentIndex;

  const start = coords[segmentIndex];
  const end = coords[segmentIndex + 1] || coords[segmentIndex];

  return [
    start[0] + (end[0] - start[0]) * segmentLocalProgress,
    start[1] + (end[1] - start[1]) * segmentLocalProgress,
  ];
}

export function getRouteById(cityId, routeId) {
  const city = getCity(cityId);
  return city.routes.find(r => r.id === routeId);
}
