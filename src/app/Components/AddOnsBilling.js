"use client";

// Monthly add-on apps and SMS credit, under Settings → Subscription and on the app store (admins).
// Any active business can subscribe; SMS credit shows once the business pays for SMS (add-on billing
// or an app that sends delivery codes). Backend: lib/payments/billing.js
//   GET   /api/v1/billing/addons                 { enforced, smsCredit, addOns[], available[] }
//   POST  /api/v1/billing/addons/renew {ids, months}
//   POST  /api/v1/billing/addons/:id {units}     add an app (first month)
//   PATCH /api/v1/billing/addons/:id/units {units}
//   POST  /api/v1/billing/addons/:id/cancel {cancel}
//   POST  /api/v1/billing/sms {amount}
// A paid change answers { url } (Paystack; back via ?payment=…); a free one (₦0) { applied, message }.

import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Loader2, PlayCircle } from "lucide-react";
import api from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ErrorMessage, SuccessToast } from "../../../Functions/Mics";

const naira = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;
const STATUS = {
  active: ["Active", "secondary"],
  due: ["Renew soon", "outline"],
  grace: ["Ended: grace days", "destructive"],
  expired: ["Stopped", "destructive"],
  cancelling: ["Stops at period end", "outline"],
};

export default function AddOnsBilling({ title = "Monthly apps & SMS credit" }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [months, setMonths] = useState(1);
  const [topUp, setTopUp] = useState("5000");
  const [units, setUnits] = useState({}); // add-on id → units typed

  const load = useCallback(async () => {
    const r = await api.get("/api/v1/billing/addons");
    setData(r.ok ? r.data : { enforced: false });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  // { url } → Paystack; { applied } → done at once (free)
  const run = async (key, call) => {
    setBusy(key);
    const r = await call();
    if (!r.ok) {
      setBusy("");
      return ErrorMessage(r.error);
    }
    if (r.data?.url) return window.location.assign(r.data.url);
    setBusy("");
    SuccessToast(r.data?.message || "Done");
    load();
  };

  const owned = data?.addOns || [];
  if (!data || (!data.enforced && !owned.length && !(data.available || []).length)) return null;
  const paysSms = data.enforced || owned.some((a) => (a.features || []).includes("delivery"));
  const total = (data.addOns || []).filter((a) => a.status !== "cancelling").reduce((t, a) => t + a.monthly, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Apps you pay for month by month, on top of your yearly plan. Cancel any time; they keep working for 3 days after their month ends.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SMS credit */}
        {paysSms && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 rounded-lg border p-4">
          <div>
            <p className="text-sm text-muted-foreground">SMS credit (delivery codes)</p>
            <p className="text-2xl font-bold">{naira(data.smsCredit)}</p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Top up (₦)</span>
              <Input type="number" min={1000} step={500} value={topUp} onChange={(e) => setTopUp(e.target.value)} className="w-32" />
            </label>
            <Button disabled={busy === "sms"} onClick={() => run("sms", () => api.post("/api/v1/billing/sms", { amount: Number(topUp) }))}>
              {busy === "sms" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Top up
            </Button>
          </div>
        </div>
        )}

        {/* apps the business has */}
        {(data.addOns || []).length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="text-sm font-medium">Your apps · {naira(total)}/month</p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-sm">
                  <span className="mb-1 block text-muted-foreground">Months</span>
                  <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className="h-9 rounded-md border bg-background px-2 text-sm">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </label>
                <Button size="sm" disabled={busy === "renew-all"} onClick={() => run("renew-all", () => api.post("/api/v1/billing/addons/renew", { months }))}>
                  {busy === "renew-all" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Renew all · {naira(total * months)}
                </Button>
              </div>
            </div>
            <div className="divide-y rounded-lg border">
              {data.addOns.map((a) => {
                const [label, variant] = STATUS[a.status] || STATUS.active;
                const entry = (data.catalogue || []).find((c) => c.id === a.id);
                return (
                  <div key={a.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{a.name}</span>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {naira(a.monthly)}/month · paid until {moment(a.paidUntil).format("D MMM YYYY")}
                        {entry?.unit ? ` · ${a.units} ${entry.unit.plural}` : ""}
                        {a.pendingUnits != null ? ` (${a.pendingUnits} from the next renewal)` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {entry?.unit && (
                        <>
                          <Input
                            type="number"
                            min={entry.unit.min}
                            max={entry.unit.max}
                            value={units[a.id] ?? a.units}
                            onChange={(e) => setUnits((u) => ({ ...u, [a.id]: e.target.value }))}
                            className="w-20"
                            aria-label={`Number of ${entry.unit.plural}`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy === `units-${a.id}` || Number(units[a.id] ?? a.units) === a.units}
                            onClick={() => run(`units-${a.id}`, () => api.patch(`/api/v1/billing/addons/${a.id}/units`, { units: Number(units[a.id]) }))}
                          >
                            Change {entry.unit.plural}
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" disabled={busy === `renew-${a.id}`} onClick={() => run(`renew-${a.id}`, () => api.post("/api/v1/billing/addons/renew", { ids: [a.id], months }))}>
                        Renew {months} month{months > 1 ? "s" : ""}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={a.status === "cancelling" ? "" : "text-destructive hover:text-destructive"}
                        disabled={busy === `cancel-${a.id}`}
                        onClick={() => {
                          const cancel = a.status !== "cancelling";
                          if (cancel && !window.confirm(`Stop ${a.name} at the end of its paid month?`)) return;
                          run(`cancel-${a.id}`, () => api.post(`/api/v1/billing/addons/${a.id}/cancel`, { cancel }));
                        }}
                      >
                        {a.status === "cancelling" ? "Keep it" : "Stop"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* apps the business can add */}
        {(data.available || []).length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Add an app</p>
            <div className="grid gap-3 md:grid-cols-2">
              {data.available.map((o) => {
                const n = Number(units[`new-${o.id}`] ?? o.unit?.min ?? 1);
                const monthly = o.monthly + (o.unit ? o.unit.monthly * n : 0);
                return (
                  <div key={o.id} className="flex flex-col justify-between gap-3 rounded-lg border p-4">
                    <div>
                      <p className="font-semibold">{o.name}</p>
                      {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
                      {o.includes?.length > 1 && <p className="mt-1 text-xs text-muted-foreground">Includes: {o.includes.join(", ")}</p>}
                      {o.unit && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {o.monthly > 0 ? `${naira(o.monthly)}/month + ` : ""}
                          {naira(o.unit.monthly)} per {o.unit.name}/month
                        </p>
                      )}
                      <p className="mt-1 text-sm">{monthly > 0 ? `${naira(monthly)}/month` : "Price to be confirmed"}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {o.unit && (
                        <Input
                          type="number"
                          min={o.unit.min}
                          max={o.unit.max}
                          value={units[`new-${o.id}`] ?? o.unit.min}
                          onChange={(e) => setUnits((u) => ({ ...u, [`new-${o.id}`]: e.target.value }))}
                          className="w-20"
                          aria-label={`Number of ${o.unit.plural}`}
                        />
                      )}
                      <Button size="sm" disabled={busy === `add-${o.id}`} onClick={() => run(`add-${o.id}`, () => api.post(`/api/v1/billing/addons/${o.id}`, { units: o.unit ? n : 0 }))}>
                        {busy === `add-${o.id}` && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add {o.name}
                      </Button>
                      {/* how the app works: catalogue videoUrl, YouTube until each app has its own video */}
                      <Button size="sm" variant="outline" asChild>
                        <a href={/^https:\/\//.test(o.videoUrl || "") ? o.videoUrl : "https://www.youtube.com"} target="_blank" rel="noopener noreferrer" aria-label={`Watch how ${o.name} works (opens in a new tab)`}>
                          <PlayCircle className="mr-1 h-4 w-4" />
                          Watch how it works
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
