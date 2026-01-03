import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Polyline } from 'react-leaflet';
import { useSimulation } from '../../context/SimulationContext';
import { interpolatePosition } from '../../data/cities';
import { MapPin, AlertTriangle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Controller to update map view
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function FocusedMiniMap({ busId, scenarioType }) {
  const { buses, routes, chargingStations } = useSimulation();

  // Find the bus
  const bus = buses.find(b => b.id === busId);
  const route = bus ? routes.find(r => r.id === bus.routeId) : null;

  // Get bus position
  const busPosition = bus && route
    ? interpolatePosition(route, bus.progress)
    : [45.2551, 19.8419];

  // Get route waypoints for polyline
  const routePoints = route?.waypoints || [];

  // Find nearest charging station
  const nearestStation = chargingStations.reduce((nearest, station) => {
    const dist = Math.sqrt(
      Math.pow(station.position[0] - busPosition[0], 2) +
      Math.pow(station.position[1] - busPosition[1], 2)
    );
    if (!nearest || dist < nearest.dist) {
      return { station, dist };
    }
    return nearest;
  }, null)?.station;

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/30">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-cyan-400" />
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Lokacija</div>
            <div className="text-sm font-bold text-white">{bus?.name || 'Bus'}</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={busPosition}
        zoom={16}
        className="h-full w-full"
        style={{ background: '#0a0a0f' }}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <MapController center={busPosition} zoom={16} />

        {/* Dark theme tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route line */}
        {routePoints.length > 0 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#00d4ff',
              weight: 4,
              opacity: 0.6,
              dashArray: '10, 10',
            }}
          />
        )}

        {/* Nearest charging station */}
        {nearestStation && (
          <CircleMarker
            center={nearestStation.position}
            radius={12}
            pathOptions={{
              color: '#22c55e',
              fillColor: '#22c55e',
              fillOpacity: 0.3,
              weight: 2,
            }}
          />
        )}

        {/* Bus position - pulsing marker */}
        <CircleMarker
          center={busPosition}
          radius={15}
          pathOptions={{
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.2,
            weight: 3,
          }}
        />
        <CircleMarker
          center={busPosition}
          radius={8}
          pathOptions={{
            color: '#f59e0b',
            fillColor: '#f59e0b',
            fillOpacity: 0.8,
            weight: 2,
          }}
        />
      </MapContainer>

      {/* Alert overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000]">
        <div className="flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs text-amber-200">Autobus zahteva odluku</span>
        </div>
      </div>

      {/* Scanning effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
          style={{
            animation: 'scan 2s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
