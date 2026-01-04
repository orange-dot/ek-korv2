import { useMemo, useRef, useEffect } from 'react';
import { Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { DELIVERY_STATES } from '../../../data/laDelivery';

function getBatteryColor(level) {
  if (level > 60) return '#22c55e';
  if (level > 30) return '#eab308';
  return '#ef4444';
}

function getStateColor(state) {
  switch (state) {
    case DELIVERY_STATES.EN_ROUTE:
    case DELIVERY_STATES.SWARMING:
      return '#ff006e'; // Neon pink - moving
    case DELIVERY_STATES.DELIVERING:
      return '#39ff14'; // Neon green - delivering
    case DELIVERY_STATES.CHARGING:
      return '#22c55e'; // Green - charging
    case DELIVERY_STATES.HANDOFF_WAITING:
    case DELIVERY_STATES.HANDOFF_ACTIVE:
      return '#00f0ff'; // Cyan - handoff
    case DELIVERY_STATES.RETURNING:
      return '#a78bfa'; // Purple - returning
    case DELIVERY_STATES.LOADING:
    case DELIVERY_STATES.UNLOADING:
      return '#fbbf24'; // Amber - loading
    default:
      return '#64748b'; // Gray - idle
  }
}

export default function SwarmBotMarker({
  bot,
  targetPosition = null,
  nearbyBots = [],
  onSelect,
  isSelected = false,
  hasPendingDecision = false
}) {
  const markerRef = useRef(null);

  const position = bot.position || [34.0522, -118.2437];

  // Update marker position smoothly
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  // Connection lines to nearby swarm bots (swarm visualization)
  const swarmLines = useMemo(() => {
    if (bot.state === DELIVERY_STATES.IDLE || nearbyBots.length === 0) return null;

    return nearbyBots
      .filter(nb => nb.id !== bot.id)
      .slice(0, 3) // Max 3 connections
      .map(nb => ({
        id: `${bot.id}-${nb.id}`,
        positions: [position, nb.position]
      }));
  }, [bot.id, bot.state, position, nearbyBots]);

  const icon = useMemo(() => {
    const batteryColor = getBatteryColor(bot.batteryLevel);
    const stateColor = getStateColor(bot.state);
    const batteryWidth = Math.max(0, Math.min(100, bot.batteryLevel));
    const isMoving = [DELIVERY_STATES.EN_ROUTE, DELIVERY_STATES.SWARMING, DELIVERY_STATES.DELIVERING, DELIVERY_STATES.RETURNING].includes(bot.state);
    const hasPackage = bot.packages > 0;
    const isLowBattery = bot.batteryLevel < 25;
    const isSwarming = bot.state === DELIVERY_STATES.SWARMING;

    const selectionColor = '#fbbf24';
    const alertColor = '#f97316';

    // LED animation speed
    const ledSpeed = isMoving ? '0.5s' : '2s';

    return L.divIcon({
      className: 'swarmbot-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 40px;
          filter: drop-shadow(0 2px 4px rgba(255, 0, 110, 0.3));
        ">
          <!-- Pending decision alert -->
          ${hasPendingDecision ? `
            <div style="
              position: absolute;
              top: -22px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 2px 4px;
              border-radius: 4px;
              font-size: 6px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(249, 115, 22, 0.5);
              animation: bounce 0.5s ease infinite;
            ">!</div>
          ` : ''}

          <!-- Swarm signal indicator (when swarming) -->
          ${isSwarming ? `
            <div style="
              position: absolute;
              top: -16px;
              left: 50%;
              transform: translateX(-50%);
              width: 20px;
              height: 20px;
            ">
              <svg viewBox="0 0 20 20" width="20" height="20">
                <circle cx="10" cy="10" r="3" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.8">
                  <animate attributeName="r" values="3;8;3" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite"/>
                </circle>
                <circle cx="10" cy="10" r="3" fill="none" stroke="${stateColor}" stroke-width="1" opacity="0.5">
                  <animate attributeName="r" values="3;8;3" dur="1s" begin="0.3s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" begin="0.3s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
          ` : ''}

          <!-- Main SwarmBot SVG -->
          <svg viewBox="0 0 32 32" width="32" height="32">
            <!-- Outer glow rings -->
            ${isSelected && !hasPendingDecision ? `
              <circle cx="16" cy="16" r="15" fill="none" stroke="${selectionColor}" stroke-width="2" opacity="0.8">
                <animate attributeName="stroke-opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            ${hasPendingDecision ? `
              <circle cx="16" cy="16" r="15" fill="none" stroke="${alertColor}" stroke-width="2">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            ${isLowBattery && !isSelected && !hasPendingDecision ? `
              <circle cx="16" cy="16" r="14" fill="none" stroke="${batteryColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="13;16;13" dur="0.8s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="0.8s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Robot body (rounded rectangle) -->
            <rect x="6" y="8" width="20" height="16" rx="4" fill="#1a1a2e" stroke="${stateColor}" stroke-width="2"/>

            <!-- LED strip (top) -->
            <rect x="9" y="10" width="14" height="2" rx="1" fill="${stateColor}" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="${ledSpeed}" repeatCount="indefinite"/>
            </rect>

            <!-- Eyes/sensors -->
            <circle cx="12" cy="16" r="2" fill="${stateColor}">
              ${isMoving ? `<animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite"/>` : ''}
            </circle>
            <circle cx="20" cy="16" r="2" fill="${stateColor}">
              ${isMoving ? `<animate attributeName="opacity" values="1;0.5;1" dur="0.3s" begin="0.15s" repeatCount="indefinite"/>` : ''}
            </circle>

            <!-- Wheels (small circles on sides) -->
            <circle cx="8" cy="24" r="2.5" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1">
              ${isMoving ? `<animateTransform attributeName="transform" type="rotate" from="0 8 24" to="360 8 24" dur="0.5s" repeatCount="indefinite"/>` : ''}
            </circle>
            <circle cx="24" cy="24" r="2.5" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1">
              ${isMoving ? `<animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.5s" repeatCount="indefinite"/>` : ''}
            </circle>

            <!-- Package compartment indicator -->
            ${hasPackage ? `
              <rect x="11" y="18" width="10" height="5" rx="1" fill="#fbbf24" stroke="#0a0a0f" stroke-width="0.5">
                <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
              </rect>
              <text x="16" y="22" font-size="4" fill="#0a0a0f" text-anchor="middle" font-weight="bold">${bot.packages}</text>
            ` : ''}

            <!-- Antenna (small) -->
            <line x1="16" y1="8" x2="16" y2="4" stroke="${stateColor}" stroke-width="1"/>
            <circle cx="16" cy="3" r="1.5" fill="${stateColor}">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
            </circle>
          </svg>

          <!-- Battery bar (bottom) -->
          <div style="
            position: absolute;
            bottom: 2px;
            left: 4px;
            width: 24px;
            height: 3px;
            background: #1e293b;
            border-radius: 1.5px;
            overflow: hidden;
          ">
            <div style="
              width: ${batteryWidth}%;
              height: 100%;
              background: ${batteryColor};
            "></div>
          </div>

          <!-- Bot ID -->
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 6px;
            font-weight: bold;
            color: ${stateColor};
            background: rgba(10, 10, 15, 0.9);
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
          ">S${bot.id.replace('swarm-', '').replace('bot-', '')}</div>
        </div>

        <style>
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-2px); }
          }
        </style>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 20],
      popupAnchor: [0, -20],
    });
  }, [bot.batteryLevel, bot.state, bot.id, bot.packages, isSelected, hasPendingDecision]);

  // Update icon when it changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    if (onSelect) {
      onSelect('swarmbot', bot.id);
    }
  };

  return (
    <>
      {/* Swarm connection lines */}
      {swarmLines && swarmLines.map(line => (
        <Polyline
          key={line.id}
          positions={line.positions}
          pathOptions={{
            color: getStateColor(bot.state),
            weight: 1,
            opacity: 0.3,
            dashArray: '3, 5',
            lineCap: 'round',
            interactive: false
          }}
        />
      ))}

      {/* Target delivery line */}
      {targetPosition && bot.state === DELIVERY_STATES.DELIVERING && (
        <Polyline
          positions={[position, targetPosition]}
          pathOptions={{
            color: '#39ff14',
            weight: 2,
            opacity: 0.6,
            dashArray: '4, 4',
            lineCap: 'round',
            interactive: false
          }}
        />
      )}

      {/* SwarmBot marker */}
      <Marker
        ref={markerRef}
        position={position}
        icon={icon}
        eventHandlers={{ click: handleClick }}
        zIndexOffset={500} // Between drones (1000) and pods (0)
      />
    </>
  );
}
