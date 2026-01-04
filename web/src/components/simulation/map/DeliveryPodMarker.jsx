import { useMemo, useRef, useEffect } from 'react';
import { Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { DELIVERY_STATES, interpolateRoutePosition } from '../../../data/laDelivery';

function getBatteryColor(level) {
  if (level > 60) return '#22c55e';
  if (level > 30) return '#eab308';
  return '#ef4444';
}

function getStateColor(state) {
  switch (state) {
    case DELIVERY_STATES.EN_ROUTE:
      return '#39ff14'; // Neon green - moving
    case DELIVERY_STATES.ARRIVING:
      return '#00f0ff'; // Cyan - arriving
    case DELIVERY_STATES.CHARGING:
      return '#22c55e'; // Green - charging
    case DELIVERY_STATES.LOADING:
    case DELIVERY_STATES.UNLOADING:
      return '#fbbf24'; // Amber - loading
    case DELIVERY_STATES.DISPATCHING:
      return '#9d4edd'; // Purple - dispatching swarm
    case DELIVERY_STATES.HANDOFF_WAITING:
    case DELIVERY_STATES.HANDOFF_ACTIVE:
      return '#f472b6'; // Pink - handoff
    default:
      return '#64748b'; // Gray - idle
  }
}

export default function DeliveryPodMarker({
  pod,
  route,
  onSelect,
  isSelected = false,
  hasPendingDecision = false
}) {
  const markerRef = useRef(null);

  // Calculate position from route progress
  const position = route
    ? interpolateRoutePosition(route, pod.progress)
    : pod.position || [34.0522, -118.2437];

  // Update marker position smoothly
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position[0], position[1]]);

  // Route polyline (remaining path)
  const routePath = useMemo(() => {
    if (!route || pod.state === DELIVERY_STATES.IDLE || pod.state === DELIVERY_STATES.CHARGING) {
      return null;
    }

    const waypoints = route.waypoints;
    const totalSegments = waypoints.length - 1;
    const currentSegment = Math.floor(pod.progress * totalSegments);

    const remainingPoints = [position, ...waypoints.slice(currentSegment + 1)];
    return remainingPoints.length > 1 ? remainingPoints : null;
  }, [route, pod.progress, pod.state, position]);

  const icon = useMemo(() => {
    const batteryColor = getBatteryColor(pod.batteryLevel);
    const stateColor = getStateColor(pod.state);
    const batteryWidth = Math.max(0, Math.min(100, pod.batteryLevel));
    const isMoving = [DELIVERY_STATES.EN_ROUTE, DELIVERY_STATES.ARRIVING].includes(pod.state);
    const isDispatching = pod.state === DELIVERY_STATES.DISPATCHING;
    const packagesLoaded = pod.packages || 0;
    const maxPackages = 15;
    const packagePercentage = (packagesLoaded / maxPackages) * 100;
    const isLowBattery = pod.batteryLevel < 20;

    const selectionColor = '#fbbf24';
    const alertColor = '#f97316';

    // Wheel animation speed
    const wheelSpeed = isMoving ? '0.3s' : '0s';

    return L.divIcon({
      className: 'delivery-pod-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 52px;
          height: 64px;
          filter: drop-shadow(0 4px 8px rgba(57, 255, 20, 0.25));
        ">
          <!-- Pending decision alert -->
          ${hasPendingDecision ? `
            <div style="
              position: absolute;
              top: -28px;
              left: 50%;
              transform: translateX(-50%);
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: white;
              padding: 3px 6px;
              border-radius: 6px;
              font-size: 7px;
              font-weight: bold;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(249, 115, 22, 0.5);
              animation: bounce 0.5s ease infinite;
            ">DECISION</div>
          ` : ''}

          <!-- Swarm dispatch indicator -->
          ${isDispatching ? `
            <div style="
              position: absolute;
              top: -20px;
              left: 50%;
              transform: translateX(-50%);
              width: 40px;
              height: 20px;
            ">
              <svg viewBox="0 0 40 20" width="40" height="20">
                <!-- Dispatch waves -->
                <ellipse cx="20" cy="16" rx="8" ry="3" fill="none" stroke="#9d4edd" stroke-width="1" opacity="0.8">
                  <animate attributeName="rx" values="8;18;8" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="ry" values="3;8;3" dur="1s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite"/>
                </ellipse>
                <!-- Little bot icons departing -->
                <circle cx="10" cy="10" r="2" fill="#ff006e">
                  <animate attributeName="cx" values="20;5;20" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="30" cy="10" r="2" fill="#ff006e">
                  <animate attributeName="cx" values="20;35;20" dur="1.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
          ` : ''}

          <!-- Main Pod SVG (Nuro R2 inspired) -->
          <svg viewBox="0 0 52 52" width="52" height="52">
            <!-- Outer glow rings -->
            ${isSelected && !hasPendingDecision ? `
              <ellipse cx="26" cy="30" rx="24" ry="18" fill="none" stroke="${selectionColor}" stroke-width="2" opacity="0.8">
                <animate attributeName="stroke-opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
              </ellipse>
              <ellipse cx="26" cy="30" rx="28" ry="22" fill="none" stroke="${selectionColor}" stroke-width="1" opacity="0.4">
                <animate attributeName="rx" values="24;30;24" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="ry" values="18;24;18" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite"/>
              </ellipse>
            ` : ''}

            ${hasPendingDecision ? `
              <ellipse cx="26" cy="30" rx="24" ry="18" fill="none" stroke="${alertColor}" stroke-width="3">
                <animate attributeName="stroke-opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite"/>
              </ellipse>
            ` : ''}

            ${isLowBattery && !isSelected && !hasPendingDecision ? `
              <ellipse cx="26" cy="30" rx="23" ry="17" fill="none" stroke="${batteryColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="rx" values="22;26;22" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="ry" values="16;20;16" dur="1s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1s" repeatCount="indefinite"/>
              </ellipse>
            ` : ''}

            <!-- Pod body (rounded capsule shape) -->
            <ellipse cx="26" cy="28" rx="18" ry="14" fill="#1a1a2e" stroke="${stateColor}" stroke-width="2.5"/>

            <!-- Top sensor dome -->
            <ellipse cx="26" cy="18" rx="10" ry="6" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1.5"/>

            <!-- LIDAR sensor (rotating) -->
            <circle cx="26" cy="16" r="4" fill="${stateColor}" opacity="0.4"/>
            <circle cx="26" cy="16" r="2" fill="${stateColor}">
              ${isMoving ? `
                <animate attributeName="opacity" values="1;0.5;1" dur="0.2s" repeatCount="indefinite"/>
              ` : ''}
            </circle>

            <!-- Headlights -->
            <ellipse cx="10" cy="28" rx="2" ry="4" fill="${isMoving ? '#fbbf24' : '#64748b'}" opacity="${isMoving ? '1' : '0.5'}">
              ${isMoving ? `<animate attributeName="opacity" values="1;0.7;1" dur="0.5s" repeatCount="indefinite"/>` : ''}
            </ellipse>
            <ellipse cx="42" cy="28" rx="2" ry="4" fill="${isMoving ? '#fbbf24' : '#64748b'}" opacity="${isMoving ? '1' : '0.5'}">
              ${isMoving ? `<animate attributeName="opacity" values="1;0.7;1" dur="0.5s" repeatCount="indefinite"/>` : ''}
            </ellipse>

            <!-- Cargo compartment indicators (3 sections) -->
            <rect x="14" y="24" width="8" height="10" rx="1" fill="${packagesLoaded > 0 ? '#fbbf24' : '#1e293b'}" opacity="${packagesLoaded > 0 ? '0.8' : '0.3'}" stroke="#0a0a0f" stroke-width="0.5"/>
            <rect x="22" y="24" width="8" height="10" rx="1" fill="${packagesLoaded > 5 ? '#fbbf24' : '#1e293b'}" opacity="${packagesLoaded > 5 ? '0.8' : '0.3'}" stroke="#0a0a0f" stroke-width="0.5"/>
            <rect x="30" y="24" width="8" height="10" rx="1" fill="${packagesLoaded > 10 ? '#fbbf24' : '#1e293b'}" opacity="${packagesLoaded > 10 ? '0.8' : '0.3'}" stroke="#0a0a0f" stroke-width="0.5"/>

            <!-- Wheels -->
            <ellipse cx="14" cy="42" rx="4" ry="3" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1">
              ${isMoving ? `<animateTransform attributeName="transform" type="rotate" from="0 14 42" to="360 14 42" dur="${wheelSpeed}" repeatCount="indefinite"/>` : ''}
            </ellipse>
            <ellipse cx="38" cy="42" rx="4" ry="3" fill="#0a0a0f" stroke="${stateColor}" stroke-width="1">
              ${isMoving ? `<animateTransform attributeName="transform" type="rotate" from="0 38 42" to="360 38 42" dur="${wheelSpeed}" repeatCount="indefinite"/>` : ''}
            </ellipse>

            <!-- Status LED strip (bottom of body) -->
            <rect x="14" y="36" width="24" height="2" rx="1" fill="${stateColor}" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.4;0.8" dur="${isMoving ? '0.3s' : '1.5s'}" repeatCount="indefinite"/>
            </rect>

            <!-- Side markers -->
            <circle cx="8" cy="30" r="1.5" fill="${stateColor}" opacity="0.6"/>
            <circle cx="44" cy="30" r="1.5" fill="${stateColor}" opacity="0.6"/>
          </svg>

          <!-- Package count badge -->
          <div style="
            position: absolute;
            top: 4px;
            right: 2px;
            background: ${packagesLoaded > 0 ? '#fbbf24' : '#1e293b'};
            color: ${packagesLoaded > 0 ? '#0a0a0f' : '#64748b'};
            font-size: 8px;
            font-weight: bold;
            padding: 2px 4px;
            border-radius: 4px;
            border: 1px solid #0a0a0f;
          ">${packagesLoaded}/${maxPackages}</div>

          <!-- Battery bar (curved, at bottom) -->
          <div style="
            position: absolute;
            bottom: 4px;
            left: 8px;
            width: 36px;
            height: 5px;
            background: #1e293b;
            border-radius: 2.5px;
            overflow: hidden;
            border: 1px solid #0a0a0f;
          ">
            <div style="
              width: ${batteryWidth}%;
              height: 100%;
              background: linear-gradient(90deg, ${batteryColor} 0%, ${batteryColor}dd 100%);
              border-radius: 2px;
            "></div>
          </div>

          <!-- Pod ID -->
          <div style="
            position: absolute;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 8px;
            font-weight: bold;
            color: #0a0a0f;
            background: ${stateColor};
            padding: 1px 6px;
            border-radius: 4px;
            white-space: nowrap;
          ">P${pod.id.replace('pod-', '')}</div>

          <!-- State label -->
          ${pod.state !== DELIVERY_STATES.IDLE && pod.state !== DELIVERY_STATES.EN_ROUTE ? `
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
            ">${pod.state.replace('_', ' ')}</div>
          ` : ''}
        </div>

        <style>
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-3px); }
          }
        </style>
      `,
      iconSize: [52, 64],
      iconAnchor: [26, 48],
      popupAnchor: [0, -48],
    });
  }, [pod.batteryLevel, pod.state, pod.id, pod.packages, isSelected, hasPendingDecision]);

  // Update icon when it changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    if (onSelect) {
      onSelect('pod', pod.id);
    }
  };

  return (
    <>
      {/* Route path polyline */}
      {routePath && (
        <Polyline
          positions={routePath}
          pathOptions={{
            color: getStateColor(pod.state),
            weight: 3,
            opacity: 0.4,
            dashArray: '10, 6',
            lineCap: 'round',
            interactive: false
          }}
        />
      )}

      {/* Pod marker */}
      <Marker
        ref={markerRef}
        position={position}
        icon={icon}
        eventHandlers={{ click: handleClick }}
        zIndexOffset={200} // Below drones (1000) and swarm (500)
      />
    </>
  );
}
