"use client";

// Sales team map on the ERP dashboard (C-level dashboard users): where every sales rep is,
// from the positions the Sales Portal sends every 2 minutes (GET /api/sales-team/locations,
// backend controllers/teamLocationController.js). Refreshes every minute while the tab is
// visible. Hidden for businesses with no sales reps.

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import { MapPin, MessageCircle, Navigation, Phone, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, STATUS_LABELS, whatsappNumber } from "./salesTeamShared";

const SalesTeamMapView = dynamic(() => import("./SalesTeamMapView"), {
  ssr: false,
  loading: () => <div className="flex h-[380px] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">Loading map…</div>,
});

const REFRESH_MS = 60 * 1000;
const FILTERS = [
  ["all", "All"],
  ["live", "Live"],
  ["away", "Not live"],
];

export default function SalesTeamMap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.get("/api/sales-team/locations");
    setLoading(false);
    if (r.ok) {
      setData(r.data);
      setError("");
    } else if (r.status !== 403) {
      setError(r.data?.error || "Couldn't load the sales team's locations.");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (!data && !error) return null; // first load, or no access
  if (data && !data.counts?.total) return null; // no sales reps in this business

  const reps = data?.reps || [];
  const shown = reps.filter((r) => filter === "all" || (filter === "live" ? r.status === "live" : r.status !== "live"));
  const counts = data?.counts || {};

  return (
    <Card className="mb-6 min-w-0">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4" /> Sales team – live locations
          </CardTitle>
          <CardDescription>
            {counts.live || 0} live · {counts.delayed || 0} delayed · {(counts.seen || 0) + (counts.none || 0)} offline
            {data?.refreshedAt && ` · updated ${moment(data.refreshedAt).format("h:mm a")}`}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border p-0.5 text-xs" role="tablist" aria-label="Show">
            {FILTERS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded px-2.5 py-1 font-medium ${filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={load} disabled={loading} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-[380px] min-w-0 overflow-hidden rounded-md border lg:col-span-2">
            <SalesTeamMapView reps={shown} selectedId={selectedId} onSelect={setSelectedId} />
          </div>
          <ul className="max-h-[380px] divide-y overflow-y-auto rounded-md border text-sm">
            {shown.length === 0 && <li className="p-4 text-center text-muted-foreground">No reps here.</li>}
            {shown.map((r) => (
              <li key={r.id} className={`flex items-center gap-3 px-3 py-2.5 ${selectedId === r.id ? "bg-muted" : ""}`}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[r.status] }} aria-hidden />
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left disabled:cursor-default"
                  onClick={() => setSelectedId(r.id)}
                  disabled={r.latitude == null}
                  title={r.latitude == null ? "No location today" : "Show on the map"}
                >
                  <p className="truncate font-medium">{r.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {STATUS_LABELS[r.status]}
                    {r.updatedAt && ` · ${r.status === "seen" ? moment(r.updatedAt).format("h:mm a") : moment(r.updatedAt).fromNow()}`}
                  </p>
                </button>
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Call ${r.name}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                )}
                {r.phone && (
                  <a href={`https://wa.me/${whatsappNumber(r.phone)}`} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`WhatsApp ${r.name}`}>
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                {r.latitude != null && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Directions to ${r.name}`}
                  >
                    <Navigation className="h-4 w-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Reps send their position every 2 minutes while the Sales Portal is open. Positions are kept for a day.</p>
      </CardContent>
    </Card>
  );
}
