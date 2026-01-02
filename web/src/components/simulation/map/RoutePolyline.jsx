import { Polyline, Tooltip } from 'react-leaflet';

export default function RoutePolyline({ route }) {
  return (
    <Polyline
      positions={route.coordinates}
      pathOptions={{
        color: route.color,
        weight: 4,
        opacity: 0.7,
        dashArray: null,
      }}
    >
      <Tooltip sticky>
        <span className="font-medium">{route.name}</span>
        <br />
        <span className="text-xs text-slate-500">{route.fullName}</span>
      </Tooltip>
    </Polyline>
  );
}
