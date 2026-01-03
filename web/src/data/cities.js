// City configurations for simulation
// Routes follow actual streets using detailed waypoints

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
        fullName: 'Liman IV - Centar - Detelinara',
        color: '#00d4ff',
        // Liman IV → Bulevar Oslobođenja → Bulevar Mihajla Pupina → Centar → Futoski Put → Detelinara
        coordinates: [
          // Liman IV - početak kod Merkatora
          [45.2368, 19.8242],
          [45.2375, 19.8258],
          [45.2382, 19.8272],
          // Bulevar Cara Lazara
          [45.2395, 19.8285],
          [45.2408, 19.8298],
          [45.2422, 19.8312],
          // Skretanje na Bulevar Oslobođenja
          [45.2438, 19.8328],
          [45.2452, 19.8342],
          [45.2465, 19.8355],
          [45.2478, 19.8368],
          [45.2490, 19.8378],
          // Bulevar Oslobođenja - nastavak
          [45.2502, 19.8388],
          [45.2515, 19.8398],
          [45.2528, 19.8408],
          // Centar - Trg Slobode
          [45.2542, 19.8415],
          [45.2551, 19.8419],
          [45.2560, 19.8422],
          // Bulevar Mihajla Pupina ka severu
          [45.2572, 19.8428],
          [45.2585, 19.8435],
          [45.2598, 19.8442],
          // Futoski put
          [45.2612, 19.8452],
          [45.2628, 19.8465],
          [45.2645, 19.8480],
          [45.2662, 19.8498],
          [45.2680, 19.8518],
          // Detelinara
          [45.2698, 19.8538],
          [45.2715, 19.8555],
        ],
        stations: ['ns-station-1'],
      },
      {
        id: 'ns-7',
        name: 'Linija 7',
        fullName: 'Novo Naselje - Centar - Klisa',
        color: '#7c3aed',
        // Novo Naselje → Bulevar Vojvode Stepe → Centar → Kisačka → Klisa
        coordinates: [
          // Novo Naselje - Bulevar Vojvode Stepe početak
          [45.2712, 19.8085],
          [45.2702, 19.8105],
          [45.2692, 19.8128],
          [45.2680, 19.8152],
          // Bulevar Vojvode Stepe nastavak
          [45.2668, 19.8178],
          [45.2655, 19.8205],
          [45.2642, 19.8232],
          [45.2628, 19.8260],
          // Skretanje ka centru
          [45.2615, 19.8288],
          [45.2602, 19.8318],
          [45.2588, 19.8348],
          [45.2575, 19.8378],
          // Centar
          [45.2562, 19.8402],
          [45.2551, 19.8419],
          // Kisačka ulica ka istoku
          [45.2545, 19.8445],
          [45.2538, 19.8472],
          [45.2530, 19.8502],
          [45.2522, 19.8535],
          // Prema Klisi
          [45.2512, 19.8570],
          [45.2502, 19.8608],
          [45.2492, 19.8648],
          [45.2480, 19.8690],
        ],
        stations: ['ns-station-2'],
      },
      {
        id: 'ns-11a',
        name: 'Linija 11A',
        fullName: 'Železnička Stanica - Telep',
        color: '#22c55e',
        // Železnička → Bulevar Oslobođenja → Centar → Futoška → Telep
        coordinates: [
          // Železnička stanica
          [45.2672, 19.8328],
          [45.2665, 19.8338],
          [45.2655, 19.8352],
          // Bulevar Jaše Tomića
          [45.2642, 19.8365],
          [45.2628, 19.8378],
          [45.2612, 19.8392],
          // Centar
          [45.2598, 19.8405],
          [45.2582, 19.8412],
          [45.2568, 19.8418],
          [45.2551, 19.8419],
          // Futoška ulica ka jugu
          [45.2535, 19.8425],
          [45.2518, 19.8432],
          [45.2500, 19.8440],
          [45.2482, 19.8448],
          // Telep
          [45.2462, 19.8458],
          [45.2442, 19.8468],
          [45.2420, 19.8480],
          [45.2398, 19.8492],
        ],
        stations: ['ns-station-1', 'ns-station-3'],
      },
      {
        id: 'ns-3',
        name: 'Linija 3',
        fullName: 'Satelit - Centar - Petrovaradin',
        color: '#f59e0b',
        // Satelit → Rumenačka → Centar → Most Slobode → Petrovaradin
        coordinates: [
          // Satelit
          [45.2768, 19.7945],
          [45.2758, 19.7972],
          [45.2748, 19.8002],
          // Rumenačka ulica
          [45.2735, 19.8032],
          [45.2722, 19.8065],
          [45.2708, 19.8098],
          [45.2692, 19.8132],
          [45.2678, 19.8168],
          // Prema centru
          [45.2662, 19.8205],
          [45.2645, 19.8245],
          [45.2628, 19.8285],
          [45.2610, 19.8325],
          [45.2592, 19.8365],
          [45.2572, 19.8398],
          // Centar
          [45.2551, 19.8419],
          // Kej žrtava racije ka mostu
          [45.2538, 19.8455],
          [45.2525, 19.8495],
          [45.2512, 19.8538],
          // Most Slobode
          [45.2498, 19.8580],
          [45.2488, 19.8625],
          [45.2482, 19.8668],
          // Petrovaradin
          [45.2492, 19.8708],
          [45.2508, 19.8742],
          [45.2525, 19.8768],
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
        chargingPoints: 6,
        batteryStorage: 12,
        type: 'depot',
        hasRobotA: true,
        hasRobotB: true,
      },
      {
        id: 'ns-station-2',
        name: 'Železnička Stanica',
        position: [45.2672, 19.8328],
        maxPower: 150,
        chargingPoints: 4,
        batteryStorage: 0,
        type: 'opportunity',
        hasRobotA: false,
        hasRobotB: false,
      },
      {
        id: 'ns-station-3',
        name: 'Liman',
        position: [45.2368, 19.8242],
        maxPower: 180,
        chargingPoints: 4,
        batteryStorage: 8,
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
        fullName: 'Studentski Trg - Vukov Spomenik',
        color: '#00d4ff',
        // Studentski Trg → Vasina → Kneza Miloša → Nemanjina → Vukov Spomenik
        coordinates: [
          // Studentski trg
          [44.8182, 20.4565],
          [44.8175, 20.4558],
          [44.8168, 20.4548],
          // Vasina ulica
          [44.8160, 20.4538],
          [44.8152, 20.4525],
          // Kneza Miloša
          [44.8142, 20.4512],
          [44.8132, 20.4518],
          [44.8120, 20.4532],
          [44.8108, 20.4548],
          // Nemanjina
          [44.8095, 20.4565],
          [44.8082, 20.4585],
          [44.8068, 20.4608],
          [44.8055, 20.4632],
          // Ruzveltova
          [44.8042, 20.4658],
          [44.8030, 20.4685],
          // Vukov Spomenik
          [44.8018, 20.4712],
          [44.8008, 20.4738],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-31',
        name: 'Linija 31',
        fullName: 'Studentski Trg - Banjica',
        color: '#7c3aed',
        // Studentski Trg → Kralja Milana → Slavija → Bulevar Oslobođenja → Banjica
        coordinates: [
          // Studentski trg
          [44.8182, 20.4565],
          [44.8190, 20.4545],
          [44.8198, 20.4522],
          // Kralja Milana
          [44.8192, 20.4498],
          [44.8185, 20.4472],
          [44.8178, 20.4445],
          // Slavija
          [44.8168, 20.4420],
          [44.8155, 20.4398],
          // Bulevar Oslobođenja
          [44.8140, 20.4378],
          [44.8122, 20.4355],
          [44.8102, 20.4332],
          [44.8080, 20.4308],
          [44.8058, 20.4282],
          // Banjica
          [44.8035, 20.4258],
          [44.8012, 20.4235],
          [44.7988, 20.4212],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-78',
        name: 'Linija 78',
        fullName: 'Zeleni Venac - Zemun',
        color: '#22c55e',
        // Zeleni Venac → Brankova → Most na Savi → Novi Beograd → Zemun
        coordinates: [
          // Zeleni Venac
          [44.8155, 20.4498],
          [44.8162, 20.4472],
          [44.8168, 20.4445],
          // Brankova
          [44.8175, 20.4418],
          [44.8180, 20.4388],
          [44.8185, 20.4355],
          // Brankov most
          [44.8192, 20.4318],
          [44.8198, 20.4278],
          [44.8205, 20.4238],
          // Novi Beograd - Bulevar Mihajla Pupina
          [44.8215, 20.4195],
          [44.8228, 20.4148],
          [44.8242, 20.4098],
          [44.8258, 20.4045],
          [44.8278, 20.3988],
          // Stari Merkator
          [44.8302, 20.3928],
          [44.8328, 20.3868],
          [44.8358, 20.3808],
          // Zemun
          [44.8392, 20.3745],
          [44.8428, 20.3682],
          [44.8465, 20.3618],
        ],
        stations: ['bg-station-1'],
      },
      {
        id: 'bg-65',
        name: 'Linija 65',
        fullName: 'Zeleni Venac - Medaković',
        color: '#f59e0b',
        // Zeleni Venac → Terazije → Takovska → Cvijićeva → Medaković
        coordinates: [
          // Zeleni Venac
          [44.8155, 20.4498],
          [44.8148, 20.4518],
          // Terazije
          [44.8140, 20.4542],
          [44.8130, 20.4568],
          // Takovska
          [44.8118, 20.4595],
          [44.8105, 20.4625],
          [44.8090, 20.4658],
          // Cvijićeva
          [44.8075, 20.4692],
          [44.8058, 20.4728],
          [44.8040, 20.4768],
          // Medaković
          [44.8020, 20.4810],
          [44.7998, 20.4855],
          [44.7975, 20.4902],
        ],
        stations: ['bg-station-1'],
      },
    ],
    stations: [
      {
        id: 'bg-station-1',
        name: 'Zeleni Venac Depo',
        position: [44.8155, 20.4498],
        maxPower: 500,
        chargingPoints: 10,
        batteryStorage: 20,
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
        // Centar → Lepenički bulevar → Aerodrom
        coordinates: [
          // Centar - Trg Radomira Putnika
          [44.0128, 20.9114],
          [44.0138, 20.9095],
          [44.0148, 20.9075],
          // Lepenički bulevar
          [44.0160, 20.9052],
          [44.0172, 20.9028],
          [44.0185, 20.9002],
          [44.0200, 20.8975],
          [44.0215, 20.8948],
          // Prema aerodromu
          [44.0232, 20.8920],
          [44.0250, 20.8892],
          [44.0270, 20.8865],
          [44.0292, 20.8838],
        ],
        stations: ['kg-station-1'],
      },
      {
        id: 'kg-2',
        name: 'Linija 2',
        fullName: 'Centar - Stanovo',
        color: '#7c3aed',
        // Centar → Kralja Petra I → Stanovo
        coordinates: [
          // Centar
          [44.0128, 20.9114],
          [44.0118, 20.9135],
          [44.0108, 20.9158],
          // Kralja Petra I
          [44.0095, 20.9182],
          [44.0082, 20.9208],
          [44.0068, 20.9235],
          [44.0052, 20.9265],
          // Stanovo
          [44.0035, 20.9298],
          [44.0018, 20.9332],
          [44.0000, 20.9368],
        ],
        stations: ['kg-station-2'],
      },
      {
        id: 'kg-3',
        name: 'Linija 3',
        fullName: 'Centar - Bresnica',
        color: '#22c55e',
        // Centar → Kneza Mihaila → Bresnica
        coordinates: [
          // Centar
          [44.0128, 20.9114],
          [44.0140, 20.9138],
          [44.0152, 20.9165],
          // Kneza Mihaila
          [44.0168, 20.9192],
          [44.0185, 20.9222],
          [44.0202, 20.9255],
          [44.0222, 20.9288],
          // Bresnica
          [44.0245, 20.9322],
          [44.0270, 20.9358],
          [44.0298, 20.9395],
        ],
        stations: ['kg-station-1', 'kg-station-3'],
      },
      {
        id: 'kg-4',
        name: 'Linija 4',
        fullName: 'Centar - Pivara',
        color: '#f59e0b',
        // Centar → Nikole Pašića → Pivara
        coordinates: [
          // Centar
          [44.0128, 20.9114],
          [44.0115, 20.9088],
          [44.0102, 20.9060],
          // Nikole Pašića
          [44.0088, 20.9032],
          [44.0072, 20.9002],
          [44.0055, 20.8972],
          [44.0038, 20.8940],
          // Pivara
          [44.0020, 20.8908],
          [44.0000, 20.8875],
          [43.9978, 20.8842],
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
        position: [44.0095, 20.9182],
        maxPower: 150,
        chargingPoints: 4,
        batteryStorage: 0,
        type: 'opportunity',
        hasRobotA: false,
        hasRobotB: false,
      },
      {
        id: 'kg-station-3',
        name: 'Zastava',
        position: [44.0200, 20.8975],
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
