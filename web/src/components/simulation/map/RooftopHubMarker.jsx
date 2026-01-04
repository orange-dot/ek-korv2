import { useMemo, useRef, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

export default function RooftopHubMarker({
  hub,
  dronesCharging = 0,
  swapInProgress = false,
  onSelect,
  isSelected = false
}) {
  const markerRef = useRef(null);
  const position = hub.position;

  // Update marker position
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  const icon = useMemo(() => {
    const isActive = dronesCharging > 0 || swapInProgress;
    const occupancy = dronesCharging / hub.droneCapacity;
    const occupancyColor = occupancy > 0.8 ? '#ef4444' : occupancy > 0.5 ? '#fbbf24' : '#22c55e';
    const mainColor = isActive ? '#00f0ff' : '#64748b';

    const selectionColor = '#fbbf24';

    return L.divIcon({
      className: 'rooftop-hub-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 48px;
          height: 56px;
          filter: drop-shadow(0 4px 12px rgba(0, 240, 255, ${isActive ? '0.4' : '0.15'}));
        ">
          <!-- Main Hub SVG -->
          <svg viewBox="0 0 48 48" width="48" height="48">
            <!-- Selection ring -->
            ${isSelected ? `
              <circle cx="24" cy="24" r="23" fill="none" stroke="${selectionColor}" stroke-width="2" opacity="0.8">
                <animate attributeName="stroke-opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
              </circle>
            ` : ''}

            <!-- Outer helipad circle -->
            <circle cx="24" cy="24" r="20" fill="#0a0a0f" stroke="${mainColor}" stroke-width="2"/>

            <!-- Inner circle -->
            <circle cx="24" cy="24" r="14" fill="none" stroke="${mainColor}" stroke-width="1" stroke-dasharray="4,4">
              ${isActive ? `
                <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="10s" repeatCount="indefinite"/>
              ` : ''}
            </circle>

            <!-- H marking (helipad style) -->
            <text x="24" y="29" font-size="14" fill="${mainColor}" text-anchor="middle" font-weight="bold" font-family="monospace">H</text>

            <!-- Landing pad indicators (6 positions) -->
            ${[0, 60, 120, 180, 240, 300].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = 24 + 17 * Math.cos(rad);
              const y = 24 + 17 * Math.sin(rad);
              const occupied = i < dronesCharging;
              return `
                <circle cx="${x}" cy="${y}" r="3" fill="${occupied ? '#00f0ff' : '#1e293b'}" stroke="${mainColor}" stroke-width="1">
                  ${occupied ? `<animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>` : ''}
                </circle>
              `;
            }).join('')}

            <!-- Swap arm indicator (center) -->
            ${hub.robotArm ? `
              <circle cx="24" cy="24" r="5" fill="${swapInProgress ? '#9d4edd' : '#1e293b'}" stroke="${swapInProgress ? '#9d4edd' : '#475569'}" stroke-width="1">
                ${swapInProgress ? `
                  <animate attributeName="r" values="4;6;4" dur="0.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="1;0.6;1" dur="0.5s" repeatCount="indefinite"/>
                ` : ''}
              </circle>
            ` : ''}

            <!-- Active pulse -->
            ${isActive ? `
              <circle cx="24" cy="24" r="20" fill="none" stroke="${mainColor}" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="20;26;20" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
              </circle>
            ` : ''}
          </svg>

          <!-- EK3 Module count badge -->
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            background: linear-gradient(135deg, #00f0ff 0%, #0891b2 100%);
            color: #0a0a0f;
            font-size: 8px;
            font-weight: bold;
            padding: 2px 4px;
            border-radius: 4px;
            border: 1px solid #0a0a0f;
          ">
            <span style="font-size: 6px;">EK3</span> ${hub.ek3Modules}
          </div>

          <!-- Occupancy bar -->
          <div style="
            position: absolute;
            bottom: 2px;
            left: 8px;
            width: 32px;
            height: 4px;
            background: #1e293b;
            border-radius: 2px;
            overflow: hidden;
          ">
            <div style="
              width: ${occupancy * 100}%;
              height: 100%;
              background: ${occupancyColor};
              transition: width 0.3s ease;
            "></div>
          </div>

          <!-- Hub name -->
          <div style="
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 7px;
            color: ${mainColor};
            background: rgba(10, 10, 15, 0.9);
            padding: 1px 4px;
            border-radius: 3px;
            white-space: nowrap;
            max-width: 80px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${hub.name.replace(' Hub', '').replace(' Rooftop', '')}</div>

          <!-- Swap in progress indicator -->
          ${swapInProgress ? `
            <div style="
              position: absolute;
              top: -16px;
              left: 50%;
              transform: translateX(-50%);
              background: #9d4edd;
              color: white;
              font-size: 6px;
              padding: 1px 4px;
              border-radius: 3px;
              white-space: nowrap;
              animation: pulse 0.5s infinite;
            ">SWAP</div>
          ` : ''}
        </div>

        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        </style>
      `,
      iconSize: [48, 56],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }, [hub, dronesCharging, swapInProgress, isSelected]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    if (onSelect) {
      onSelect('rooftop_hub', hub.id);
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{ click: handleClick }}
      zIndexOffset={100}
    />
  );
}
