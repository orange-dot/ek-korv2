import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation } from '../../../context/SimulationContext';

function getStatusColor(station) {
  if (station.busesCharging.length > 0) return '#22c55e'; // active
  return '#64748b'; // idle
}

export default function ChargingStationMarker({ station }) {
  const { selectItem } = useSimulation();
  const statusColor = getStatusColor(station);

  const icon = useMemo(() => {
    return L.divIcon({
      className: 'station-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          transform: translate(-20px, -20px);
        ">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <!-- Station circle -->
            <circle cx="20" cy="20" r="18" fill="#0a0a0f" stroke="${statusColor}" stroke-width="3"/>
            <!-- Lightning bolt -->
            <path d="M22 10 L16 20 L20 20 L18 30 L24 18 L20 18 Z"
                  fill="${statusColor}"/>
            <!-- Power indicator dots -->
            ${station.busesCharging.length > 0 ? `
              <circle cx="20" cy="20" r="18" fill="none" stroke="${statusColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="18;22;18" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            ` : ''}
          </svg>
          <!-- Charging points badge (occupied/total) -->
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: ${station.busesCharging.length > 0 ? '#22c55e' : '#64748b'};
            color: white;
            font-size: 9px;
            font-weight: bold;
            padding: 2px 4px;
            border-radius: 4px;
            min-width: 16px;
            text-align: center;
          ">${station.busesCharging.length}/${station.chargingPoints}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }, [station.busesCharging.length, station.chargingPoints, statusColor]);

  const handleClick = () => {
    selectItem('station', station.id);
  };

  return (
    <Marker
      position={station.position}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    />
  );
}
