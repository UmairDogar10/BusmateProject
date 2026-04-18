"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import type { Bus } from "@/types/busmate";

type MapComponentProps = {
  buses: Bus[];
};

const fallbackCenter: [number, number] = [31.5204, 74.3587];

export function MapComponent({ buses }: MapComponentProps) {
  const center = buses[0]
    ? ([buses[0].position.lat, buses[0].position.lng] as [number, number])
    : fallbackCenter;

  const routePath = buses.map((bus) => [bus.position.lat, bus.position.lng] as [number, number]);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl">
      <MapContainer center={center} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePath.length > 1 && <Polyline positions={routePath} pathOptions={{ color: "#3b82f6", weight: 4 }} />}
        {buses.map((bus) => (
          <CircleMarker
            key={bus.id}
            center={[bus.position.lat, bus.position.lng]}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillOpacity: 1,
              fillColor: bus.isLive ? "#10b981" : "#ef4444",
            }}
          >
            <Popup>
              <p className="font-semibold">{bus.name}</p>
              <p>{bus.route}</p>
              <p>ETA: {bus.eta} min</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
