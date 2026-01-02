import { useMemo, useRef, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation, BUS_STATES } from '../../../context/SimulationContext';
import { interpolatePosition } from '../../../data/cities';

function getBatteryColor(level) {
  if (level > 60) return '#22c55e';
  if (level > 30) return '#eab308';
  return '#ef4444';
}

function getStateColor(state) {
  switch (state) {
    case BUS_STATES.DRIVING: return '#00d4ff';
    case BUS_STATES.CHARGING: return '#22c55e';
    case BUS_STATES.WAITING: return '#eab308';
    case BUS_STATES.SWAPPING: return '#7c3aed';
    default: return '#64748b';
  }
}

export default function BusMarker({ bus }) {
  const markerRef = useRef(null);
  const { routes, selectItem } = useSimulation();

  const route = routes.find(r => r.id === bus.routeId);
  const position = route ? interpolatePosition(route, bus.progress) : [44.815, 20.46];

  // Update marker position
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  const icon = useMemo(() => {
    const batteryColor = getBatteryColor(bus.batteryLevel);
    const stateColor = getStateColor(bus.state);
    const batteryWidth = Math.max(0, Math.min(100, bus.batteryLevel));
    const isCharging = bus.state === BUS_STATES.CHARGING;
    const isLowBattery = bus.batteryLevel < 30;

    // Robot A indicator - always on bus, active when charging or diagnosing
    const robotAActive = isCharging || bus.batteryLevel < 20;

    return L.divIcon({
      className: 'bus-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 48px;
          height: 56px;
        ">
          <!-- Main bus marker -->
          <svg viewBox="0 0 48 48" width="48" height="48">
            <!-- Glow effect for low battery -->
            ${isLowBattery ? `
              <circle cx="24" cy="24" r="22" fill="none" stroke="${batteryColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="20;24;20" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Bus body -->
            <rect x="8" y="12" width="32" height="22" rx="4" fill="${stateColor}" stroke="#0a0a0f" stroke-width="2"/>

            <!-- Windows -->
            <rect x="12" y="16" width="8" height="6" rx="1" fill="#0a0a0f"/>
            <rect x="22" y="16" width="8" height="6" rx="1" fill="#0a0a0f"/>
            <rect x="32" y="16" width="4" height="6" rx="1" fill="#0a0a0f"/>

            <!-- Wheels -->
            <circle cx="14" cy="34" r="3" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1"/>
            <circle cx="34" cy="34" r="3" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1"/>

            <!-- Front light -->
            <rect x="38" y="20" width="2" height="4" rx="0.5" fill="${isLowBattery ? '#ef4444' : '#fbbf24'}"/>
          </svg>

          <!-- Robot A indicator (on top of bus) -->
          <div style="
            position: absolute;
            top: -2px;
            right: 2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: ${robotAActive ? '#00d4ff' : '#1e293b'};
            border: 2px solid ${robotAActive ? '#00d4ff' : '#475569'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            color: ${robotAActive ? '#0a0a0f' : '#64748b'};
            box-shadow: ${robotAActive ? '0 0 8px #00d4ff' : 'none'};
          ">A</div>

          <!-- Battery bar -->
          <div style="
            position: absolute;
            bottom: 0;
            left: 6px;
            width: 36px;
            height: 4px;
            background: #1e293b;
            border-radius: 2px;
            overflow: hidden;
            border: 1px solid #0a0a0f;
          ">
            <div style="
              width: ${batteryWidth}%;
              height: 100%;
              background: ${batteryColor};
              ${isCharging ? 'animation: pulse 1s infinite;' : ''}
            "></div>
          </div>

          <!-- Bus number -->
          <div style="
            position: absolute;
            bottom: 6px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            font-weight: bold;
            color: #0a0a0f;
            background: ${stateColor};
            padding: 0 4px;
            border-radius: 2px;
          ">${bus.name.replace('Bus ', '')}</div>
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        </style>
      `,
      iconSize: [48, 56],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });
  }, [bus.batteryLevel, bus.state, bus.name]);

  // Update icon
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    selectItem('bus', bus.id);
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{ click: handleClick }}
    />
  );
}
