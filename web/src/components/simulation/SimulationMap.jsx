import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import BusMarker from './map/BusMarker';
import ChargingStationMarker from './map/ChargingStationMarker';
import RoutePolyline from './map/RoutePolyline';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController() {
  const map = useMap();
  const { city } = useSimulation();

  // Update map view when city changes
  useEffect(() => {
    if (city) {
      map.setView(city.center, city.zoom, { animate: true });
    }
  }, [city, map]);

  return null;
}

export default function SimulationMap() {
  const { buses, routes, chargingStations, city } = useSimulation();

  // Initialize simulation engine
  useSimulationEngine();

  return (
    <MapContainer
      center={city?.center || [45.2551, 19.8419]}
      zoom={city?.zoom || 14}
      className="h-full w-full"
      style={{ background: '#0a0a0f' }}
    >
      <MapController />

      {/* Dark theme tiles */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* Routes */}
      {routes.map(route => (
        <RoutePolyline key={route.id} route={route} />
      ))}

      {/* Charging Stations */}
      {chargingStations.map(station => (
        <ChargingStationMarker key={station.id} station={station} />
      ))}

      {/* Buses */}
      {buses.map(bus => (
        <BusMarker key={bus.id} bus={bus} />
      ))}
    </MapContainer>
  );
}
