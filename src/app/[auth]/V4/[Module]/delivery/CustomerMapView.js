"use client";

// The Leaflet map itself (browser only: loaded by CustomerMap with next/dynamic, ssr off).
// OpenStreetMap tiles (allowed in src/lib/security/csp.js). Circle markers, so no marker
// image files are needed: green = location learnt from a delivery, blue = customer form.

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import moment from "moment";

const NIGERIA = [9.082, 8.6753];
const COLORS = { delivery: "#16a34a", other: "#2563eb", selected: "#dc2626" };

function FitTo({ points, selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 16), { duration: 0.6 });
      return;
    }
    if (!points.length) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15);
    else map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [30, 30], maxZoom: 15 });
  }, [map, points, selected]);
  return null;
}

export default function CustomerMapView({ points, selectedId, onSelect }) {
  const selected = points.find((p) => p.id === selectedId) || null;
  return (
    <MapContainer center={NIGERIA} zoom={6} scrollWheelZoom className="h-full w-full rounded-md" style={{ minHeight: 420 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitTo points={points} selected={selected} />
      {points.map((p) => {
        const color = p.id === selectedId ? COLORS.selected : p.source === "delivery" ? COLORS.delivery : COLORS.other;
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={p.id === selectedId ? 10 : 7}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
            eventHandlers={{ click: () => onSelect?.(p.id) }}
          >
            <Popup>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{p.name || "Customer"}</p>
                {p.address && <p>{p.address}</p>}
                {p.phone && <p>{p.phone}</p>}
                <p className="text-xs text-gray-500">
                  {p.source === "delivery" ? "From a delivery" : "From the customer form"}
                  {p.accuracy ? ` · within ${p.accuracy} m` : ""}
                  {p.updatedAt ? ` · ${moment(p.updatedAt).format("D MMM YYYY")}` : ""}
                </p>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Directions
                </a>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
