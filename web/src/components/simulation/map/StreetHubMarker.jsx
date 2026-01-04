import { useMemo, useRef, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

export default function StreetHubMarker({
  hub,
  podsCharging = 0,
  swarmsCharging = 0,
  onSelect,
  isSelected = false
}) {
  const markerRef = useRef(null);
  const position = hub.position;

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  const icon = useMemo(() => {
    const isActive = podsCharging > 0 || swarmsCharging > 0;
    const totalOccupancy = (podsCharging + swarmsCharging) / (hub.podCapacity + hub.swarmCapacity);
    const occupancyColor = totalOccupancy > 0.8 ? '#ef4444' : totalOccupancy > 0.5 ? '#fbbf24' : '#22c55e';
    const mainColor = isActive ? '#39ff14' : '#64748b';

    const selectionColor = '#fbbf24';

    return L.divIcon({
      className: 'street-hub-marker-icon',
      html: `
        <div style="
          position: relative;
          width: 44px;
          height: 52px;
          filter: drop-shadow(0 3px 8px rgba(57, 255, 20, ${isActive ? '0.35' : '0.1'}));
        ">
          <!-- Main Hub SVG -->
          <svg viewBox="0 0 44 44" width="44" height="44">
            <!-- Selection ring -->
            ${isSelected ? `
              <rect x="2" y="2" width="40" height="40" rx="6" fill="none" stroke="${selectionColor}" stroke-width="2" opacity="0.8">
                <animate attributeName="stroke-opacity" values="0.8;0.4;0.8" dur="1s" repeatCount="indefinite"/>
              </rect>
            ` : ''}

            <!-- Outer box -->
            <rect x="4" y="4" width="36" height="36" rx="4" fill="#0a0a0f" stroke="${mainColor}" stroke-width="2"/>

            <!-- Grid pattern (charging slots) -->
            <!-- Pod slots (top row - larger) -->
            <rect x="8" y="8" width="12" height="12" rx="2" fill="${podsCharging > 0 ? '#39ff14' : '#1e293b'}" stroke="${mainColor}" stroke-width="1">
              ${podsCharging > 0 ? `<animate attributeName="opacity" values="1;0.6;1" dur="1.5s" repeatCount="indefinite"/>` : ''}
            </rect>
            <rect x="24" y="8" width="12" height="12" rx="2" fill="${podsCharging > 1 ? '#39ff14' : '#1e293b'}" stroke="${mainColor}" stroke-width="1">
              ${podsCharging > 1 ? `<animate attributeName="opacity" values="1;0.6;1" dur="1.5s" begin="0.2s" repeatCount="indefinite"/>` : ''}
            </rect>

            <!-- Swarm slots (bottom rows - smaller grid) -->
            ${[0, 1, 2, 3].map((i) => {
              const x = 8 + (i % 4) * 8;
              const y = 24 + Math.floor(i / 4) * 8;
              const occupied = i < swarmsCharging;
              return `
                <rect x="${x}" y="${y}" width="6" height="6" rx="1"
                  fill="${occupied ? '#ff006e' : '#1e293b'}"
                  stroke="${mainColor}" stroke-width="0.5">
                  ${occupied ? `<animate attributeName="opacity" values="1;0.5;1" dur="1s" begin="${i * 0.1}s" repeatCount="indefinite"/>` : ''}
                </rect>
              `;
            }).join('')}
            ${[4, 5, 6, 7].map((i) => {
              const x = 8 + ((i - 4) % 4) * 8;
              const y = 32;
              const occupied = i < swarmsCharging;
              return `
                <rect x="${x}" y="${y}" width="6" height="6" rx="1"
                  fill="${occupied ? '#ff006e' : '#1e293b'}"
                  stroke="${mainColor}" stroke-width="0.5">
                  ${occupied ? `<animate attributeName="opacity" values="1;0.5;1" dur="1s" begin="${i * 0.1}s" repeatCount="indefinite"/>` : ''}
                </rect>
              `;
            }).join('')}

            <!-- Lightning bolt icon (center overlay) -->
            <path d="M22 14 L18 22 L21 22 L19 30 L26 20 L23 20 L26 14 Z"
              fill="${isActive ? mainColor : '#475569'}"
              opacity="${isActive ? '0.9' : '0.4'}">
              ${isActive ? `<animate attributeName="opacity" values="0.9;0.5;0.9" dur="0.8s" repeatCount="indefinite"/>` : ''}
            </path>

            <!-- Active pulse -->
            ${isActive ? `
              <rect x="4" y="4" width="36" height="36" rx="4" fill="none" stroke="${mainColor}" stroke-width="1" opacity="0.4">
                <animate attributeName="x" values="4;0;4" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="y" values="4;0;4" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="width" values="36;44;36" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="height" values="36;44;36" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
              </rect>
            ` : ''}
          </svg>

          <!-- EK3 badge -->
          <div style="
            position: absolute;
            top: -6px;
            right: -6px;
            background: linear-gradient(135deg, #39ff14 0%, #22c55e 100%);
            color: #0a0a0f;
            font-size: 7px;
            font-weight: bold;
            padding: 2px 3px;
            border-radius: 3px;
            border: 1px solid #0a0a0f;
          ">
            <span style="font-size: 5px;">EK3</span> ${hub.ek3Modules}
          </div>

          <!-- Power usage indicator -->
          <div style="
            position: absolute;
            top: -6px;
            left: -2px;
            font-size: 7px;
            color: ${mainColor};
            background: rgba(10, 10, 15, 0.9);
            padding: 1px 3px;
            border-radius: 2px;
          ">${hub.maxPower}kW</div>

          <!-- Capacity indicators (bottom) -->
          <div style="
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 4px;
            font-size: 6px;
            font-weight: bold;
          ">
            <!-- Pods count -->
            <div style="
              background: ${podsCharging > 0 ? '#39ff14' : '#1e293b'};
              color: ${podsCharging > 0 ? '#0a0a0f' : '#64748b'};
              padding: 1px 3px;
              border-radius: 2px;
            ">P:${podsCharging}/${hub.podCapacity}</div>
            <!-- Swarm count -->
            <div style="
              background: ${swarmsCharging > 0 ? '#ff006e' : '#1e293b'};
              color: ${swarmsCharging > 0 ? 'white' : '#64748b'};
              padding: 1px 3px;
              border-radius: 2px;
            ">S:${swarmsCharging}/${hub.swarmCapacity}</div>
          </div>

          <!-- Hub name -->
          <div style="
            position: absolute;
            bottom: -14px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 6px;
            color: ${mainColor};
            background: rgba(10, 10, 15, 0.9);
            padding: 1px 3px;
            border-radius: 2px;
            white-space: nowrap;
            max-width: 70px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${hub.name.replace(' Hub', '').replace(' Micro-', '')}</div>
        </div>
      `,
      iconSize: [44, 52],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  }, [hub, podsCharging, swarmsCharging, isSelected]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  const handleClick = () => {
    if (onSelect) {
      onSelect('street_hub', hub.id);
    }
  };

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      eventHandlers={{ click: handleClick }}
      zIndexOffset={50}
    />
  );
}
