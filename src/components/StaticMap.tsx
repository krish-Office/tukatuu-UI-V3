"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function StaticMapResizer() {
  const map = useMap();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      map.invalidateSize();
      map.setView(map.getCenter(), map.getZoom(), { animate: false });
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [map]);

  return null;
}

export default function StaticMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="relative h-full w-full bg-gray-100 dark:bg-slate-800">
      <MapContainer 
        center={[lat, lng]} 
        zoom={17} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng]} />
        <StaticMapResizer />
      </MapContainer>
      
      {/* Invisible overlay to absolutely prevent any interaction from bubbling */}
      <div className="absolute inset-0 z-10 bg-transparent cursor-default"></div>
    </div>
  );
}
