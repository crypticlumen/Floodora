import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { MapPin, RotateCcw } from 'lucide-react';
import RiskBadge from './RiskBadge.jsx';

function ResetView({ resetToken }) {
  const map = useMap();
  useEffect(() => { map.setView([28.6139, 77.2090], 12); }, [map, resetToken]);
  return null;
}

export default function DrainMap({ drains, selectedId, onSelect, compact = false }) {
  const [resetToken, setResetToken] = useState(0);
  const colors = { High: '#dc3545', Medium: '#e8a11b', Low: '#18a879' };
  return <div className={`map-frame ${compact ? 'map-compact' : ''}`}>
    <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom className="leaflet-map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ResetView resetToken={resetToken} />
      {drains.map((drain) => <CircleMarker key={drain.id} center={[drain.lat, drain.lng]} radius={drain.id === selectedId ? 9 : 6} pathOptions={{ color: '#fff', weight: 2, fillColor: colors[drain.risk] || colors.Low, fillOpacity: 0.95 }} eventHandlers={{ click: () => onSelect?.(drain) }}>
        <Popup><div className="map-popup"><strong>{drain.id} · {drain.location}</strong><p>Water level: {drain.waterLevel}%</p><p>Flow rate: {drain.flowRate} L/s</p><p>Risk score: {drain.riskScore}/100</p><RiskBadge risk={drain.risk} /><button onClick={() => onSelect?.(drain)} className="popup-action">View drain details</button></div></Popup>
      </CircleMarker>)}
    </MapContainer>
    <div className="map-attribution-note"><MapPin size={12} /> Illustrative demo locations · New Delhi</div>
  </div>;
}
