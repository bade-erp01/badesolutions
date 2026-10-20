"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Map as MapIcon, Navigation, Phone, Search } from "lucide-react";
import AppShell from "../_ui/AppShell";
import { Alert, Badge, Card, Empty, Input } from "../_ui/ui";
import { mapsLink, whatsappLink } from "../_ui/format";
import { WhatsAppLogo } from "../_ui/icons";

export default function RoutePage({ userInfo, data, error }) {
  const [search, setSearch] = useState("");
  // the server works out today's route; name the day the same way (Lagos time)
  const todayName = new Date().toLocaleDateString("en-NG", { weekday: "long", timeZone: "Africa/Lagos" });
  const today = todayName.toLowerCase();
  const customers = useMemo(() => data || [], [data]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.Username, c.CustomerCode, c.ContactPerson, c.phone, c.deliveryAddress, c.billingAddress].some((v) => String(v || "").toLowerCase().includes(q)),
    );
  }, [customers, search]);

  return (
    <AppShell userData={userInfo} title="Today's route" subtitle={`${todayName} · ${customers.length} visit${customers.length === 1 ? "" : "s"}`}>
      {error && <Alert>{error}</Alert>}

      {customers.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sp-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search today's customers" aria-label="Search today's customers" className="pl-10" />
        </div>
      )}

      {customers.length === 0 && !error ? (
        <Empty icon={MapIcon} title="No visits planned for today" text="Customers appear here on the days they're on your route." />
      ) : shown.length === 0 ? (
        <Empty title={`No customer matches “${search.trim()}”`} />
      ) : (
        <ul className="space-y-3">
          {shown.map((c) => (
            <li key={c._id}>
              <VisitCard customer={c} number={customers.indexOf(c) + 1} today={today} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}

function VisitCard({ customer: c, number, today }) {
  const address = c.deliveryAddress || c.billingAddress || "";
  const directions = mapsLink({ latitude: c.latitude, longitude: c.longitude, address: address || c.state });
  const wa = whatsappLink(c.phone, `Hello${c.ContactPerson ? ` ${c.ContactPerson}` : ""}, I'll be visiting ${c.Username} today.`);

  return (
    <Card className="divide-y divide-sp-line">
      <Link href={`/SalesPortal/Customers/${c._id}`} className="flex items-center gap-3 p-4 hover:bg-sp-bg">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sp-ink text-sm font-bold text-sp-on-ink">{number}</span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{c.Username}</span>
            {Number(c.Debt) > 0 && <Badge tone="bad">Owing</Badge>}
          </div>
          <p className="flex items-start gap-1.5 text-sm text-sp-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="line-clamp-2">{address || c.state || "No address on file"}</span>
          </p>
          <p className="truncate text-xs text-sp-muted">
            {[c.CustomerCode, c.ContactPerson].filter(Boolean).join(" · ")}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-sp-muted" />
      </Link>

      <div className="grid grid-cols-3 gap-2 p-3">
        {c.phone ? (
          <a href={`tel:${c.phone}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg">
            <Phone className="h-4 w-4" /> Call
          </a>
        ) : (
          <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">No phone</span>
        )}
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg" aria-label={`WhatsApp ${c.Username}`}>
            <WhatsAppLogo className="h-5 w-5" /> Chat
          </a>
        ) : (
          <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">—</span>
        )}
        {directions ? (
          <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sp-line text-sm font-semibold hover:bg-sp-bg">
            <Navigation className="h-4 w-4" /> Go
          </a>
        ) : (
          <span className="inline-flex h-11 items-center justify-center rounded-xl border border-sp-line text-sm text-sp-muted">No map</span>
        )}
      </div>

      {c.RouteDays?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 py-3">
          {c.RouteDays.map((d, i) => (
            <Badge key={i} tone={String(d.date).toLowerCase() === today ? "ink" : "muted"}>
              {String(d.date).slice(0, 3)}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}
