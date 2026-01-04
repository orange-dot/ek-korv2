import { useMemo, useRef, useEffect, useState } from 'react';
import { Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useSimulation, ROBOT_STATES } from '../../../context/SimulationContext';
import { interpolatePosition } from '../../../data/cities';

const STATUS_COLORS = {
  [ROBOT_STATES.IDLE]: '#64748b',
  [ROBOT_STATES.DISPATCHED]: '#f59e0b',
  [ROBOT_STATES.CONNECTING]: '#00d4ff',
  [ROBOT_STATES.ACTIVE]: '#22c55e',
  [ROBOT_STATES.SWAPPING]: '#7c3aed',
  [ROBOT_STATES.RETURNING]: '#64748b',
};

const STATUS_LABELS = {
  [ROBOT_STATES.IDLE]: 'Spreman',
  [ROBOT_STATES.DISPATCHED]: 'Putuje',
  [ROBOT_STATES.CONNECTING]: 'Povezuje',
  [ROBOT_STATES.ACTIVE]: 'Aktivan',
  [ROBOT_STATES.SWAPPING]: 'Zamenjuje',
  [ROBOT_STATES.RETURNING]: 'Vraća se',
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export default function RobotMarker({ station, robotId, status, targetBusId, progress = 0 }) {
  const markerRef = useRef(null);
  const { buses, routes } = useSimulation();

  // Find target bus position
  const targetBus = targetBusId ? buses.find(b => b.id === targetBusId) : null;
  const targetRoute = targetBus ? routes.find(r => r.id === targetBus.routeId) : null;
  const targetBusPosition = targetRoute
    ? interpolatePosition(targetRoute, targetBus.progress)
    : null;

  // Calculate animated position based on status
  const position = useMemo(() => {
    const stationPos = station.position;

    if (status === ROBOT_STATES.IDLE || status === ROBOT_STATES.RETURNING) {
      return stationPos;
    }

    if (!targetBusPosition) return stationPos;

    // Interpolate between station and bus based on progress
    if (status === ROBOT_STATES.DISPATCHED) {
      const t = Math.min(progress / 100, 1);
      return [
        lerp(stationPos[0], targetBusPosition[0], t),
        lerp(stationPos[1], targetBusPosition[1], t)
      ];
    }

    // When connecting, active, or swapping - robot is at bus
    return targetBusPosition;
  }, [status, station.position, targetBusPosition, progress]);

  // Update marker position
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  const color = STATUS_COLORS[status] || STATUS_COLORS[ROBOT_STATES.IDLE];
  const isRobotA = robotId === 'A';

  const icon = useMemo(() => {
    const isActive = status === ROBOT_STATES.ACTIVE || status === ROBOT_STATES.SWAPPING;
    const isMoving = status === ROBOT_STATES.DISPATCHED || status === ROBOT_STATES.RETURNING;

    return L.divIcon({
      className: 'robot-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
        ">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <!-- Glow effect when active -->
            ${isActive ? `
              <circle cx="16" cy="16" r="15" fill="${color}" opacity="0.3">
                <animate attributeName="r" values="14;18;14" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Motion trail when moving -->
            ${isMoving ? `
              <circle cx="16" cy="16" r="14" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 4" opacity="0.5">
                <animateTransform attributeName="transform" type="rotate" from="0 16 16" to="360 16 16" dur="2s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Main robot body -->
            <circle cx="16" cy="16" r="12" fill="#0f172a" stroke="${color}" stroke-width="2"/>

            <!-- Robot icon -->
            <g fill="${color}">
              <!-- Head/antenna -->
              <rect x="14" y="6" width="4" height="3" rx="1"/>
              <circle cx="16" cy="5" r="2"/>

              <!-- Eyes -->
              <circle cx="12" cy="14" r="2"/>
              <circle cx="20" cy="14" r="2"/>

              <!-- Mouth/grid -->
              <rect x="11" y="18" width="10" height="4" rx="1"/>
              <rect x="12.5" y="19" width="1" height="2" fill="#0f172a"/>
              <rect x="15.5" y="19" width="1" height="2" fill="#0f172a"/>
              <rect x="18.5" y="19" width="1" height="2" fill="#0f172a"/>
            </g>

            <!-- Robot type label -->
            <text
              x="16"
              y="16"
              text-anchor="middle"
              dominant-baseline="central"
              font-size="8"
              font-weight="bold"
              fill="white"
              opacity="0"
            >${robotId}</text>
          </svg>

          <!-- Status badge -->
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: ${color};
            color: white;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 8px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${robotId}
          </div>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 20],
    });
  }, [robotId, status, color]);

  // Don't render if robot is idle (it's shown on station instead)
  if (status === ROBOT_STATES.IDLE) {
    return null;
  }

  // Draw connection line when dispatched or returning
  const showPath = status === ROBOT_STATES.DISPATCHED && targetBusPosition;

  return (
    <>
      {/* Connection path line */}
      {showPath && (
        <Polyline
          positions={[station.position, targetBusPosition]}
          pathOptions={{
            color: color,
            weight: 2,
            opacity: 0.5,
            dashArray: '8, 8',
          }}
        />
      )}

      {/* Robot marker */}
      <Marker
        ref={markerRef}
        position={position}
        icon={icon}
        zIndexOffset={1000}
      />
    </>
  );
}
