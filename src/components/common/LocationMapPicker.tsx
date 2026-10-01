"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";

const pinIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LocationMapPickerProps {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
}

function ClickToPlace({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FollowExternalCoords({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const center = map.getCenter();
    const driftDegrees = 0.0005;
    if (
      Math.abs(center.lat - lat) > driftDegrees ||
      Math.abs(center.lng - lng) > driftDegrees
    ) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);

  return null;
}

export default function LocationMapPicker({
  lat,
  lng,
  onPick,
}: LocationMapPickerProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[lat, lng]}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const position = (e.target as L.Marker).getLatLng();
            onPick(position.lat, position.lng);
          },
        }}
      />
      <ClickToPlace onPick={onPick} />
      <FollowExternalCoords lat={lat} lng={lng} />
    </MapContainer>
  );
}
