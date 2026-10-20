"use client";

// Customer map (Delivery app): every customer with a saved location (GET /api/customers/map),
// for planning delivery routes and field visits. Locations come from the customer form or are
// learnt from deliveries ("I'm at the customer" and confirmed deliveries in the delivery app).

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "../../../../../../Functions/Mics";

// Leaflet touches `window`: browser only
const CustomerMapView = dynamic(() => import("./CustomerMapView"), {
  ssr: false,
  loading: () => <div className="flex h-[420px] items-center justify-center rounded-md border text-sm text-muted-foreground">Loading map…</div>,
});

export default function CustomerMap() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    api.get("/api/customers/map").then((r) => {
      if (!r.ok) {
        setData({ items: [], total: 0, withLocation: 0 });
        return ErrorMessage(r.error);
      }
      setData(r.data);
    });
  }, []);

  const points = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (data?.items || []).filter(
      (p) => (!source || (source === "delivery" ? p.source === "delivery" : p.source !== "delivery")) && (!s || `${p.name} ${p.phone} ${p.address}`.toLowerCase().includes(s)),
    );
  }, [data, search, source]);
  const fromDeliveries = (data?.items || []).filter((p) => p.source === "delivery").length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {data ? (
          <>
            <b className="text-foreground">{data.withLocation}</b> of {data.total} customers have a location
            {fromDeliveries ? `, ${fromDeliveries} learnt from deliveries` : ""}. Drivers add more with &quot;I&apos;m at the customer&quot; and with every delivery.
          </>
        ) : (
          "Loading customers…"
        )}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input placeholder="Search customer, phone or address" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        {[
          ["", "All"],
          ["delivery", "From deliveries"],
          ["form", "From customer form"],
        ].map(([v, label]) => (
          <button
            key={v || "all"}
            onClick={() => setSource(v)}
            className={`rounded-full border px-3 py-1 text-sm ${source === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
          >
            {label}
          </button>
        ))}
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-600" /> delivery</span>
          <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> customer form</span>
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="h-[60vh] min-h-[420px] overflow-hidden rounded-md border">
          {data && <CustomerMapView points={points} selectedId={selectedId} onSelect={setSelectedId} />}
        </div>
        <ul className="max-h-[60vh] divide-y overflow-y-auto rounded-md border text-sm">
          {data && points.length === 0 && <li className="p-4 text-center text-muted-foreground">No customers with a location match.</li>}
          {points.slice(0, 300).map((p) => (
            <li key={p.id}>
              <button
                onClick={() => setSelectedId(p.id)}
                className={`w-full px-3 py-2 text-left hover:bg-accent ${selectedId === p.id ? "bg-accent" : ""}`}
              >
                <span className="block font-medium">{p.name || "Customer"}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.address || p.phone || `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`}</span>
              </button>
            </li>
          ))}
          {points.length > 300 && <li className="p-2 text-center text-xs text-muted-foreground">Showing 300 of {points.length} in the list (all are on the map). Search to narrow it.</li>}
        </ul>
      </div>
    </div>
  );
}
