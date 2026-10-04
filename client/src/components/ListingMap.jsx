import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
}

export default function ListingMap({ location, title }) {
  const isValidLocation =
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng);

  if (!isValidLocation) {
    return (
      <div className="map-fallback">
        <p className="muted">Location map not available for this listing.</p>
      </div>
    );
  }

  const position = [location.lat, location.lng];

  return (
    <div className="map-wrapper">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="listing-map"
      >
        <ChangeView center={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {title && <Popup>{title}</Popup>}
        </Marker>
      </MapContainer>
    </div>
  );
}
