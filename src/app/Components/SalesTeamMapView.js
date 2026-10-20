"use client";

// The Leaflet map for the sales team card (browser only: SalesTeamMap loads it with
// next/dynamic, ssr off). OpenStreetMap tiles (allowed in src/lib/security/csp.js).
// One pin per rep with their initials, coloured by how fresh the position is.

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import moment from "moment";
import { STATUS_COLORS, STATUS_LABELS, whatsappNumber } from "./salesTeamShared";

const NIGERIA = [9.082, 8.6753];

const initials = (name) =>
  String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

function pin(rep, selected) {
  const color = STATUS_COLORS[rep.status] || STATUS_COLORS.seen;
  const size = selected ? 40 : 32;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font:600 ${selected ? 14 : 12}px/1 system-ui,sans-serif;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)">${initials(rep.name)}</div>`,
  });
}

function FitTo({ reps, selected }) {
  const map = useMap();
  const key = reps.map((r) => r.id).join(",");
  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], Math.max(map.getZoom(), 15), { duration: 0.6 });
      return;
    }
    if (!reps.length) return;
    if (reps.length === 1) map.setView([reps[0].latitude, reps[0].longitude], 14);
    else map.fitBounds(reps.map((r) => [r.latitude, r.longitude]), { padding: [40, 40], maxZoom: 15 });
    // refit only when the set of reps on the map changes, not on every refresh
  }, [map, key, selected?.id]);
  return null;
}

export default function SalesTeamMapView({ reps, selectedId, onSelect }) {
  const onMap = useMemo(() => reps.filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)), [reps]);
  const selected = onMap.find((r) => r.id === selectedId) || null;

  return (
    <MapContainer center={NIGERIA} zoom={6} scrollWheelZoom className="h-full w-full rounded-md" style={{ minHeight: 380 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitTo reps={onMap} selected={selected} />
      {onMap.map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={pin(r, r.id === selectedId)} eventHandlers={{ click: () => onSelect?.(r.id) }}>
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{r.name}</p>
              <p className="text-xs" style={{ color: STATUS_COLORS[r.status] }}>
                {STATUS_LABELS[r.status]} · {r.updatedAt ? `${moment(r.updatedAt).fromNow()} (${moment(r.updatedAt).format("h:mm a")})` : ""}
              </p>
              <p className="flex gap-3 pt-1">
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="text-blue-600 underline">
                    Call
                  </a>
                )}
                {r.phone && (
                  <a href={`https://wa.me/${whatsappNumber(r.phone)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    WhatsApp
                  </a>
                )}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Directions
                </a>
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
