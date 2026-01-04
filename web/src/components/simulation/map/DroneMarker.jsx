import { useMemo, useRef, useEffect } from 'react';
import { Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { DELIVERY_STATES, interpolateCorridorPosition } from '../../../data/laDelivery';

function getBatteryColor(level) {
  if (level > 60) return '#22c55e';
  if (level > 30) return '#eab308';
  return '#ef4444';
}

function getStateColor(state) {
  switch (state) {
    case DELIVERY_STATES.FLYING:
    case DELIVERY_STATES.EN_ROUTE:
      return '#00f0ff'; // Cyan - flying
    case DELIVERY_STATES.LANDING:
    case DELIVERY_STATES.ARRIVING:
      return '#fbbf24'; // Amber - landing
    case DELIVERY_STATES.HOVERING:
      return '#a78bfa'; // Purple - hovering
    case DELIVERY_STATES.CHARGING:
    case DELIVERY_STATES.SWAPPING:
      return '#22c55e'; // Green - charging
    case DELIVERY_STATES.HANDOFF_WAITING:
    case DELIVERY_STATES.HANDOFF_ACTIVE:
      return '#f472b6'; // Pink - handoff
    case DELIVERY_STATES.TAKING_OFF:
      return '#38bdf8'; // Light blue - takeoff
    default:
      return '#64748b'; // Gray - idle
  }
}

export default function DroneMarker({
  drone,
  corridor,
  onSelect,
  isSelected = false,
  hasPendingDecision = false
}) {
  const markerRef = useRef(null);

  // Calculate position from corridor progress
  const position = corridor
    ? interpolateCorridorPosition(corridor, drone.progress)
    : drone.position || [34.0522, -118.2437];

  // Update marker position smoothly
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  // Flight path polyline (remaining path)
  const flightPath = useMemo(() => {
    if (!corridor || drone.state === DELIVERY_STATES.IDLE || drone.state === DELIVERY_STATES.CHARGING) {
      return null;
    }

    const waypoints = corridor.waypoints;
    const totalSegments = waypoints.length - 1;
    const currentSegment = Math.floor(drone.progress * totalSegments);

    // Get remaining waypoints from current position
    const remainingPoints = [position, ...waypoints.slice(currentSegment + 1)];

    return remainingPoints.length > 1 ? remainingPoints : null;
  }, [corridor, drone.progress, drone.state, position]);

  const icon = useMemo(() => {
    const batteryColor = getBatteryColor(drone.batteryLevel);
    const stateColor = getStateColor(drone.state);
    const batteryWidth = Math.max(0, Math.min(100, drone.batteryLevel));
    const isFlying = [DELIVERY_STATES.FLYING, DELIVERY_STATES.EN_ROUTE, DELIVERY_STATES.HOVERING].includes(drone.state);
    const isLanding = drone.state === DELIVERY_STATES.LANDING;
    const hasPackage = drone.packages > 0;
    const isLowBattery = drone.batteryLevel < 25;

    // Selection colors
    const selectionColor = '#fbbf24';
    const alertColor = '#f97316';

    // Rotor animation speed based on state
    const rotorSpeed = isFlying ? '0.1s' : isLanding ? '0.2s' : '0.4s';

    return L.divIcon({
      className: 'drone-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 56px;
          height: 64px;
          filter: drop-shadow(0 4px 8px rgba(0, 240, 255, 0.3));
          cursor: pointer;
          pointer-events: auto;
        ">
          <!-- Pending decision alert -->
          ${hasPendingDecision ? `
            <div style="
              position: absolute;
              top: -30px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 3px 6px;
              border-radius: 6px;
              font-size: 8px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(249, 115, 22, 0.5);
              animation: bounce 0.5s ease infinite;
              z-index: 1000;
            ">DECISION</div>
          ` : ''}

          <!-- Altitude indicator -->
          ${isFlying ? `
            <div style="
              position: absolute;
              top: -18px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 7px;
              color: ${stateColor};
              background: rgba(10, 10, 15, 0.8);
              padding: 1px 4px;
              border-radius: 3px;
              font-family: monospace;
            ">${drone.altitude || 100}m</div>
          ` : ''}

          <!-- Main drone SVG -->
          <svg viewBox="0 0 56 56" width="56" height="56" style="pointer-events: auto; cursor: pointer;">
            <!-- Outer glow rings -->
            ${isSelected && !hasPendingDecision ? `
              <circle cx="28" cy="28" r="26" fill="none" stroke="${selectionColor}" stroke-width="2" opacity="0.8">
                <animate attributeName="stroke-opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
              </circle>
              <circle cx="28" cy="28" r="30" fill="none" stroke="${selectionColor}" stroke-width="1" opacity="0.4">
                <animate attributeName="r" values="26;32;26" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            ${hasPendingDecision ? `
              <circle cx="28" cy="28" r="26" fill="none" stroke="${alertColor}" stroke-width="3" opacity="1">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            ${isLowBattery && !isSelected && !hasPendingDecision ? `
              <circle cx="28" cy="28" r="25" fill="none" stroke="${batteryColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="24;28;24" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Drone arms (X pattern) -->
            <line x1="10" y1="10" x2="20" y2="20" stroke="${stateColor}" stroke-width="3" stroke-linecap="round"/>
            <line x1="46" y1="10" x2="36" y2="20" stroke="${stateColor}" stroke-width="3" stroke-linecap="round"/>
            <line x1="10" y1="46" x2="20" y2="36" stroke="${stateColor}" stroke-width="3" stroke-linecap="round"/>
            <line x1="46" y1="46" x2="36" y2="36" stroke="${stateColor}" stroke-width="3" stroke-linecap="round"/>

            <!-- Center body -->
            <ellipse cx="28" cy="28" rx="10" ry="8" fill="#1a1a2e" stroke="${stateColor}" stroke-width="2"/>

            <!-- Camera/sensor eye -->
            <circle cx="28" cy="30" r="3" fill="${stateColor}" opacity="0.8">
              ${isFlying ? `<animate attributeName="opacity" values="0.8;1;0.8" dur="0.5s" repeatCount="indefinite"/>` : ''}
            </circle>

            <!-- 4 Rotors with animation -->
            <!-- Top-left rotor -->
            <g transform="translate(10, 10)">
              <circle cx="0" cy="0" r="7" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.3"/>
              <ellipse cx="0" cy="0" rx="6" ry="2" fill="${stateColor}" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${rotorSpeed}" repeatCount="indefinite"/>
              </ellipse>
              <circle cx="0" cy="0" r="2" fill="${stateColor}"/>
            </g>

            <!-- Top-right rotor -->
            <g transform="translate(46, 10)">
              <circle cx="0" cy="0" r="7" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.3"/>
              <ellipse cx="0" cy="0" rx="6" ry="2" fill="${stateColor}" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="${rotorSpeed}" repeatCount="indefinite"/>
              </ellipse>
              <circle cx="0" cy="0" r="2" fill="${stateColor}"/>
            </g>

            <!-- Bottom-left rotor -->
            <g transform="translate(10, 46)">
              <circle cx="0" cy="0" r="7" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.3"/>
              <ellipse cx="0" cy="0" rx="6" ry="2" fill="${stateColor}" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="${rotorSpeed}" repeatCount="indefinite"/>
              </ellipse>
              <circle cx="0" cy="0" r="2" fill="${stateColor}"/>
            </g>

            <!-- Bottom-right rotor -->
            <g transform="translate(46, 46)">
              <circle cx="0" cy="0" r="7" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.3"/>
              <ellipse cx="0" cy="0" rx="6" ry="2" fill="${stateColor}" opacity="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${rotorSpeed}" repeatCount="indefinite"/>
              </ellipse>
              <circle cx="0" cy="0" r="2" fill="${stateColor}"/>
            </g>

            <!-- Package indicator -->
            ${hasPackage ? `
              <rect x="22" y="36" width="12" height="8" rx="1" fill="#fbbf24" stroke="#0a0a0f" stroke-width="1">
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite"/>
              </rect>
              <text x="28" y="42" font-size="6" fill="#0a0a0f" text-anchor="middle" font-weight="bold">${drone.packages}</text>
            ` : ''}

            <!-- Status LED lights on body -->
            <circle cx="22" cy="24" r="1.5" fill="${isFlying ? '#22c55e' : '#64748b'}">
              ${isFlying ? `<animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite"/>` : ''}
            </circle>
            <circle cx="34" cy="24" r="1.5" fill="${drone.batteryLevel > 20 ? '#22c55e' : '#ef4444'}">
              ${isLowBattery ? `<animate attributeName="opacity" values="1;0.2;1" dur="0.3s" repeatCount="indefinite"/>` : ''}
            </circle>
          </svg>

          <!-- Battery arc indicator -->
          <svg viewBox="0 0 56 56" width="56" height="56" style="position: absolute; top: 0; left: 0; pointer-events: none;">
            <!-- Background arc -->
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="#1e293b"
              stroke-width="3"
              stroke-dasharray="75.4 75.4"
              stroke-dashoffset="0"
              transform="rotate(-90 28 28)"
              opacity="0.5"
            />
            <!-- Battery arc -->
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="${batteryColor}"
              stroke-width="3"
              stroke-dasharray="${150.8 * batteryWidth / 100} 150.8"
              stroke-dashoffset="0"
              transform="rotate(-90 28 28)"
              stroke-linecap="round"
            />
          </svg>

          <!-- Drone ID -->
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            font-weight: bold;
            color: #0a0a0f;
            background: ${stateColor};
            padding: 1px 5px;
            border-radius: 3px;
            white-space: nowrap;
          ">D${drone.id.replace('drone-', '')}</div>

          <!-- State label (when not flying) -->
          ${!isFlying && drone.state !== DELIVERY_STATES.IDLE ? `
            <div style="
              position: absolute;
              bottom: -14px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 6px;
              color: ${stateColor};
              text-transform: uppercase;
              white-space: nowrap;
              letter-spacing: 0.5px;
            ">${drone.state.replace('_', ' ')}</div>
          ` : ''}
        </div>

        <style>
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-3px); }
          }
        </style>
      `,
      iconSize: [56, 64],
      iconAnchor: [28, 32],
      popupAnchor: [0, -32],
    });
  }, [drone.batteryLevel, drone.state, drone.id, drone.packages, drone.altitude, isSelected, hasPendingDecision]);

  // Update icon when it changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    if (onSelect) {
      onSelect('drone', drone.id);
    }
  };

  return (
    <>
      {/* Flight path polyline */}
      {flightPath && (
        <Polyline
          positions={flightPath}
          pathOptions={{
            color: getStateColor(drone.state),
            weight: 2,
            opacity: 0.5,
            dashArray: '8, 8',
            lineCap: 'round',
            interactive: false
          }}
        />
      )}

      {/* Drone marker */}
      <Marker
        ref={markerRef}
        position={position}
        icon={icon}
        eventHandlers={{ click: handleClick }}
        zIndexOffset={1000} // Drones render on top
      />
    </>
  );
}
