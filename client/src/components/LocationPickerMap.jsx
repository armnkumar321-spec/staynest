import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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

const CITY_COORDINATES = {
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.6829],
  jaisalmer: [26.9157, 70.9083],
  goa: [15.2993, 74.1240],
  manali: [32.2432, 77.1892],
  alleppey: [9.4981, 76.3388],
  rishikesh: [30.0869, 78.2676],
  mumbai: [19.0760, 72.8777],
  delhi: [28.6139, 77.2090],
  bangalore: [12.9716, 77.5946],
};

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center

function ClickHandler({ onSelectLocation }) {
  useMapEvents({
    click(e) {
      onSelectLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function LocationPickerMap({ location, onChange, city }) {
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(5);

  const [latInput, setLatInput] = useState(
    location?.lat !== undefined && location?.lat !== null ? String(location.lat) : ''
  );
  const [lngInput, setLngInput] = useState(
    location?.lng !== undefined && location?.lng !== null ? String(location.lng) : ''
  );

  useEffect(() => {
    if (
      location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lng)
    ) {
      setLatInput(String(location.lat));
      setLngInput(String(location.lng));
      setMapCenter([location.lat, location.lng]);
      setMapZoom(13);
    } else {
      setLatInput('');
      setLngInput('');
    }
  }, [location?.lat, location?.lng]);

  useEffect(() => {
    const hasValidLoc =
      location &&
      typeof location.lat === 'number' &&
      typeof location.lng === 'number' &&
      !isNaN(location.lat) &&
      !isNaN(location.lng);
    if (!hasValidLoc && city && typeof city === 'string') {
      const normalizedCity = city.trim().toLowerCase();
      if (CITY_COORDINATES[normalizedCity]) {
        setMapCenter(CITY_COORDINATES[normalizedCity]);
        setMapZoom(11);
      }
    }
  }, [city]);

  const handleMapClick = (newLoc) => {
    setLatInput(String(newLoc.lat));
    setLngInput(String(newLoc.lng));
    onChange(newLoc);
  };

  const handleLatInputChange = (e) => {
    const valStr = e.target.value;
    setLatInput(valStr);
    const parsedLat = parseFloat(valStr);
    const parsedLng = parseFloat(lngInput);

    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange({ lat: parsedLat, lng: parsedLng });
    } else if (valStr === '' && lngInput === '') {
      onChange(null);
    }
  };

  const handleLngInputChange = (e) => {
    const valStr = e.target.value;
    setLngInput(valStr);
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(valStr);

    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      onChange({ lat: parsedLat, lng: parsedLng });
    } else if (valStr === '' && latInput === '') {
      onChange(null);
    }
  };

  const hasLocation =
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng);

  return (
    <div className="location-picker-container">
      <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
        Property Location on Map (Click to select)
      </label>
      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={false}
          className="listing-map picker-map"
        >
          <MapViewController center={mapCenter} zoom={mapZoom} />
          <ClickHandler onSelectLocation={handleMapClick} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasLocation && <Marker position={[location.lat, location.lng]} />}
        </MapContainer>
      </div>
      <div className="location-picker-inputs row" style={{ marginTop: '8px' }}>
        <div className="grow">
          <span className="small muted">Latitude</span>
          <input
            type="number"
            step="any"
            placeholder="e.g. 18.20326"
            value={latInput}
            onChange={handleLatInputChange}
          />
        </div>
        <div className="grow">
          <span className="small muted">Longitude</span>
          <input
            type="number"
            step="any"
            placeholder="e.g. 76.02539"
            value={lngInput}
            onChange={handleLngInputChange}
          />
        </div>
      </div>
      <span className="small muted">
        {hasLocation
          ? `Selected location: ${location.lat}, ${location.lng}`
          : 'Click on the map above or enter coordinates to select the stay location'}
      </span>
    </div>
  );
}
