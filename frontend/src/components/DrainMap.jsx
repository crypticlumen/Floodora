import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from 'react-leaflet';
import { MapPin } from 'lucide-react';
import RiskBadge from './RiskBadge.jsx';

function ResetView({ drains }) {
  const map = useMap();

  useEffect(() => {
    const validDrains = drains.filter(
      (drain) =>
        Number.isFinite(drain.lat) &&
        Number.isFinite(drain.lng)
    );

    if (validDrains.length === 0) return;

    if (validDrains.length === 1) {
      map.setView(
        [validDrains[0].lat, validDrains[0].lng],
        12
      );
    } else {
      map.fitBounds(
        validDrains.map((drain) => [drain.lat, drain.lng]),
        { padding: [30, 30], maxZoom: 12 }
      );
    }
  }, [map, drains]);

  return null;
}

export default function DrainMap({
  drains,
  selectedId,
  onSelect,
  compact = false,
}) {
  const validDrains = drains.filter(
    (drain) =>
      Number.isFinite(drain.lat) &&
      Number.isFinite(drain.lng)
  );

  const colors = {
    High: '#dc3545',
    Medium: '#e8a11b',
    Low: '#18a879',
  };

  const center = validDrains.length
    ? [validDrains[0].lat, validDrains[0].lng]
    : [19.076, 72.8777];

  const areaLabel =
    validDrains[0]?.area?.split(',').pop()?.trim() ||
    'Demo locations';

  return (
    <div className={`map-frame ${compact ? 'map-compact' : ''}`}>
      <MapContainer
        key={validDrains.map((drain) => drain.id).join('|')}
        center={center}
        zoom={12}
        scrollWheelZoom
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ResetView drains={validDrains} />

        {validDrains.map((drain) => (
          <CircleMarker
            key={drain.id}
            center={[drain.lat, drain.lng]}
            radius={drain.id === selectedId ? 9 : 6}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: colors[drain.risk] || colors.Low,
              fillOpacity: 0.95,
            }}
            eventHandlers={{
              click: () => onSelect?.(drain),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>
                  {drain.id} · {drain.location}
                </strong>
                <p>Water level: {drain.waterLevel}%</p>
                <p>Risk score: {drain.riskScore}/100</p>
                <RiskBadge risk={drain.risk} />
                <button
                  onClick={() => onSelect?.(drain)}
                  className="popup-action"
                >
                  View drain details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="map-attribution-note">
        <MapPin size={12} />
        Map locations · {areaLabel}
      </div>
    </div>
  );
}
