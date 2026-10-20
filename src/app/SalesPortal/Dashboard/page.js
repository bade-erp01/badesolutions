"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  Bell,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  Map,
  MapPin,
  Navigation,
  Package,
  RefreshCw,
  Store,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  WifiOff,
} from "lucide-react";
import api from "@/lib/api";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import AppShell from "../_ui/AppShell";
import { Alert, Badge, Card, CardTitle, StatusBadge } from "../_ui/ui";
import { currencyOf, money, short, when } from "../_ui/format";

const REFRESH_MS = 60 * 1000;
const INACTIVITY_LIMIT = 5 * 60 * 1000;
const SALES_PAGE = 5;

const GREETINGS = {
  en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", generic: "Hello" },
  fr: { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir", generic: "Salut" },
  es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches", generic: "Hola" },
  de: { morning: "Guten Morgen", afternoon: "Guten Tag", evening: "Guten Abend", generic: "Hallo" },
};

function greeting(name) {
  const hour = new Date().getHours();
  const time = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : hour >= 17 && hour < 22 ? "evening" : "generic";
  const lang = "en"; // one language (it used to pick a random one each visit)
  return `${GREETINGS[lang][time]}, ${name || "there"}`;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DashboardLayout({ userData }) {
  // random language each visit; picked in the browser so the server render matches
  const [hello, setHello] = useState("");
  useEffect(() => setHello(greeting(userData?.user?.firstName)), [userData?.user?.firstName]);

  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <AppShell userData={userData}>
      <div>
        <h1 className="min-h-7 text-xl font-bold tracking-tight">{hello}</h1>
        <p className="text-sm text-sp-muted" suppressHydrationWarning>
          {today}
        </p>
      </div>
      <MainDash userData={userData} />
    </AppShell>
  );
}

function MainDash({ userData }) {
  const isManager = Boolean(userData?.user?.c_levelDash);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const activeRef = useRef(true);
  const idleTimer = useRef(null);

  const load = useCallback(async () => {
    if (document.visibilityState !== "visible" || !navigator.onLine || !activeRef.current) return;
    setRefreshing(true);
    const r = await api.get("/api/Sales_Portal/Dashboard");
    setRefreshing(false);
    if (r.ok) {
      setData(r.data);
      setError("");
    } else {
      setError("The dashboard server can't be reached right now. It will try again in a minute.");
    }
  }, []);

  useEffect(() => {
    if (!isManager) return;

    // stop refreshing after 5 idle minutes; any touch wakes it again
    const wake = () => {
      const wasIdle = !activeRef.current;
      activeRef.current = true;
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => (activeRef.current = false), INACTIVITY_LIMIT);
      if (wasIdle) load();
    };
    const onVisible = () => document.visibilityState === "visible" && load();
    const onOnline = () => {
      setOffline(false);
      load();
    };
    const onOffline = () => setOffline(true);

    setOffline(!navigator.onLine);
    wake();
    load();
    const t = setInterval(load, REFRESH_MS);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      clearInterval(t);
      clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, wake));
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [isManager, load]);

  if (!isManager) return <RepHome />;

  const currency = currencyOf(userData.business);

  return (
    <>
      {offline && (
        <Alert kind="warn">
          <WifiOff className="mr-1.5 inline h-4 w-4" /> You&apos;re offline. Figures will update when you&apos;re back online.
        </Alert>
      )}
      {error && !data && (
        <Alert>
          <AlertCircle className="mr-1.5 inline h-4 w-4" /> {error}
        </Alert>
      )}

      {!data && !error ? (
        <DashboardSkeleton />
      ) : data ? (
        <ManagerHome data={data} userData={userData} currency={currency} onRefresh={load} refreshing={refreshing} />
      ) : null}
    </>
  );
}

function ManagerHome({ data, userData, currency, onRefresh, refreshing }) {
  const todaySales = Number(data.TodaySale) || 0;
  const yesterdaySales = Number(data.yesterdaySale) || 0;
  const diff = todaySales - yesterdaySales;
  const pct = yesterdaySales > 0 ? ((diff / yesterdaySales) * 100).toFixed(1) : "100";
  const routes = data.Routes || [];
  const debtors = routes.filter((c) => Number(c.Debt) > 0).sort((a, b) => b.Debt - a.Debt);
  const owed = debtors.reduce((s, c) => s + (Number(c.Debt) || 0), 0);
  const tasks = data.result?.Task || [];
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Tile
          icon={todaySales >= yesterdaySales ? TrendingUp : TrendingDown}
          label="Sales today"
          value={`${currency}${short(todaySales)}`}
          note={
            todaySales > yesterdaySales ? (
              <span className="text-sp-accent">+{pct}% vs yesterday</span>
            ) : todaySales < yesterdaySales ? (
              <span className="text-sp-bad">{pct}% vs yesterday</span>
            ) : (
              "Same as yesterday"
            )
          }
        />
        <Tile icon={Banknote} label="Owed on today's route" value={`${currency}${short(owed)}`} tone={owed ? "bad" : ""} note={`${debtors.length} customer${debtors.length === 1 ? "" : "s"} owing`} />
        <Tile icon={Map} label="Visits today" value={routes.length} href="/SalesPortal/Route" note="Open today's route" />
        <Tile icon={Bell} label="Pending tasks" value={pendingTasks} tone={pendingTasks ? "warn" : ""} note={`${tasks.length} task${tasks.length === 1 ? "" : "s"} in all`} />
      </div>

      <SalesTarget result={data.result} currency={currency} />

      <TodaysSales invoices={data.invoice || []} userData={userData} currency={currency} onRefresh={onRefresh} refreshing={refreshing} />

      <Card>
        <CardTitle>Sales this year</CardTitle>
        <div className="p-2">
          <GenerealSalesMargin yearlysales={data.yearlysales || []} warehouses={data.warehouses || []} />
        </div>
      </Card>

      {debtors.length > 0 && (
        <Card>
          <CardTitle action={<Badge tone="bad">{currency}{short(owed)}</Badge>}>Owing on today&apos;s route</CardTitle>
          <ul className="divide-y divide-sp-line">
            {debtors.slice(0, 8).map((c) => (
              <li key={c._id}>
                <Link href={`/SalesPortal/Customers/${c._id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-sp-bg">
                  <span className="min-w-0 flex-1 truncate font-medium">{c.Username}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-sp-bad">{money(c.Debt, currency)}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-sp-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Tasks tasks={tasks} />

      {data.promotions?.length > 0 && (
        <Card>
          <CardTitle action={<Tag className="h-4 w-4 text-sp-warn" />}>On promotion</CardTitle>
          <ul className="divide-y divide-sp-line">
            {data.promotions.map((p) => {
              const promo =
                p.Pricelist1Promo ?? p.Pricelist2Promo ?? p.Pricelist3Promo ?? p.Pricelist4Promo ?? p.Pricelist5Promo ?? p.Pricelist6Promo ?? p.Pricelist7Promo;
              return (
                <li key={p._id} className="flex items-center justify-between gap-3 px-4 py-3 text-[15px]">
                  <span className="min-w-0 flex-1 truncate">{p.Name}</span>
                  <span className="shrink-0 font-semibold tabular-nums">{money(promo, currency)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      <NearbyBusinesses />
    </>
  );
}

function Tile({ icon: Icon, label, value, note, tone, href }) {
  const toneCls = { warn: "text-sp-warn", bad: "text-sp-bad" }[tone] || "";
  const body = (
    <Card className="h-full space-y-1.5 p-4 transition hover:border-sp-ink/30">
      <Icon className={`h-5 w-5 ${toneCls || "text-sp-muted"}`} />
      <p className={`text-2xl font-bold tabular-nums tracking-tight ${toneCls}`}>{value ?? 0}</p>
      <p className="text-sm font-medium leading-snug">{label}</p>
      {note && <p className="text-xs text-sp-muted">{note}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

function SalesTarget({ result, currency }) {
  const target = Number(result?.salesTarget) || 0;
  const sold = Number(result?.totalSales) || 0;
  const pct = target > 0 ? Math.min(100, (sold / target) * 100) : 0;
  const shown = result?.percentage ?? pct.toFixed(2);

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold">
            <Target className="h-4 w-4 text-sp-muted" /> Sales target
          </p>
          {(result?.start || result?.end) && (
            <p className="text-xs text-sp-muted">
              {result?.start} – {result?.end}
            </p>
          )}
        </div>
        <span className="text-2xl font-bold tabular-nums">{shown}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-sp-bg ring-1 ring-sp-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className="h-full rounded-full bg-sp-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-sm text-sp-muted">
        <span className="font-semibold text-sp-ink">{money(sold, currency)}</span> of {money(target, currency)} sold
      </p>
    </Card>
  );
}

function TodaysSales({ invoices, userData, currency, onRefresh, refreshing }) {
  const [shown, setShown] = useState(SALES_PAGE);
  const sorted = useMemo(() => [...invoices].sort((a, b) => b.billReferenceNo - a.billReferenceNo), [invoices]);
  const total = sorted.filter((i) => i.billStatus !== "Cancelled").reduce((s, i) => s + (Number(i.grandTotal) || 0), 0);

  return (
    <Card>
      <CardTitle
        action={
          <button type="button" onClick={onRefresh} className="-mr-2 rounded-lg p-2 text-sp-muted hover:bg-sp-bg hover:text-sp-ink" aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        }
      >
        Today&apos;s sales {sorted.length > 0 && <span className="font-normal text-sp-muted">· {money(total, currency)}</span>}
      </CardTitle>
      {sorted.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-sp-muted">No sales yet today.</p>
      ) : (
        <>
          <ul className="divide-y divide-sp-line">
            {sorted.slice(0, shown).map((inv, i) => (
              <li key={inv._id || i}>
                <Link
                  href={`/${userData.business.companyName}/${userData.user._id}/bill/bill/${inv._id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-sp-bg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{inv.customerName}</p>
                    <p className="truncate text-xs text-sp-muted">
                      #{inv.billReferenceNo}
                      {inv.invoicelocation ? ` · ${inv.invoicelocation}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <p className="font-semibold tabular-nums">{money(inv.grandTotal, currency)}</p>
                    <StatusBadge status={inv.billStatus} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {sorted.length > shown && (
            <button type="button" onClick={() => setShown(shown + SALES_PAGE * 2)} className="w-full border-t border-sp-line py-3 text-sm font-semibold text-sp-info">
              Show more ({sorted.length - shown})
            </button>
          )}
        </>
      )}
    </Card>
  );
}

function Tasks({ tasks }) {
  if (!tasks.length) return null;
  return (
    <Card>
      <CardTitle>Tasks</CardTitle>
      <ul className="divide-y divide-sp-line">
        {tasks.map((task, i) => (
          <li key={task._id || i} className="flex gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{task.Text}</p>
              {task.notes && <p className="line-clamp-2 text-sm text-sp-muted">{task.notes}</p>}
              <p className="mt-0.5 text-xs text-sp-muted">{when(task.createdAt)}</p>
            </div>
            <Badge tone={task.Status === "Done" ? "ok" : "warn"}>{task.Status === "Done" ? "Done" : "Pending"}</Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Reps without the manager dashboard: shortcuts to their day.
function RepHome() {
  const links = [
    ["/SalesPortal/Route", Map, "Today's route", "Customers to visit today"],
    ["/SalesPortal/Customers", Users, "My customers", "Balances, payments, new leads"],
    ["/SalesPortal/Requisitions", ClipboardList, "Requisitions", "Orders you've raised"],
    ["/SalesPortal/Products", Package, "Products", "Prices and product details"],
    ["/SalesPortal/Reports", FileBarChart2, "Stock reports", "Shelf and back-store counts"],
  ];
  return (
    <>
      <Card>
        <ul className="divide-y divide-sp-line">
          {links.map(([href, Icon, title, text]) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-sp-bg">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sp-bg">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{title}</p>
                  <p className="truncate text-sm text-sp-muted">{text}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-sp-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <NearbyBusinesses />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-sp-surface ring-1 ring-sp-line" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl bg-sp-surface ring-1 ring-sp-line" />
      <div className="h-64 animate-pulse rounded-2xl bg-sp-surface ring-1 ring-sp-line" />
    </div>
  );
}

// Shops, offices and other businesses within 10 km: prospects for new leads.
function NearbyBusinesses() {
  const [state, setState] = useState({ loading: true, error: "", location: null, places: [] });
  const [showAll, setShowAll] = useState(false);

  const find = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    if (!navigator.geolocation) {
      setState({ loading: false, error: "This phone can't share its location.", location: null, places: [] });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const radius = 10000;
          const query = `
            [out:json][timeout:25];
            (
              node["shop"](around:${radius},${latitude},${longitude});
              node["amenity"~"restaurant|cafe|fast_food|bank|pharmacy|hospital|fuel|marketplace"](around:${radius},${latitude},${longitude});
              node["office"](around:${radius},${latitude},${longitude});
            );
            out body 30;
          `;
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
          });
          if (!res.ok) throw new Error("Couldn't load nearby businesses.");
          const json = await res.json();
          const places = (json.elements || [])
            .filter((p) => p.tags?.name)
            .map((p) => ({
              id: p.id,
              name: p.tags.name,
              address: p.tags["addr:street"] || p.tags["addr:full"] || p.tags["addr:place"] || "",
              lat: p.lat,
              lon: p.lon,
              distance: getDistance(latitude, longitude, p.lat, p.lon),
              type: (p.tags.shop || p.tags.amenity || p.tags.office || "business").replace(/_/g, " "),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);
          setState({ loading: false, error: "", location: { latitude, longitude }, places });
        } catch (err) {
          setState({ loading: false, error: err.message || "Something went wrong.", location: null, places: [] });
        }
      },
      () => setState({ loading: false, error: "Location permission is needed to find businesses near you.", location: null, places: [] }),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    find();
  }, [find]);

  const { loading, error, places } = state;
  const list = showAll ? places : places.slice(0, 5);

  return (
    <Card>
      <CardTitle
        action={
          <button type="button" onClick={find} disabled={loading} className="-mr-2 rounded-lg p-2 text-sp-muted hover:bg-sp-bg hover:text-sp-ink" aria-label="Refresh nearby businesses">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      >
        <span className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-sp-muted" /> Businesses near you
        </span>
      </CardTitle>
      {loading ? (
        <p className="px-4 py-8 text-center text-sm text-sp-muted">Looking around you…</p>
      ) : error ? (
        <p className="px-4 py-8 text-center text-sm text-sp-muted">{error}</p>
      ) : places.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <Store className="h-7 w-7 text-sp-muted" />
          <p className="text-sm text-sp-muted">No businesses found within 10 km.</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-sp-line">
            {list.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs capitalize text-sp-muted">
                    {p.distance < 1 ? `${Math.round(p.distance * 1000)} m` : `${p.distance.toFixed(1)} km`} · {p.type}
                    {p.address ? ` · ${p.address}` : ""}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${p.lat},${p.lon}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-sp-line px-3 text-sm font-semibold hover:bg-sp-bg"
                  aria-label={`Directions to ${p.name}`}
                >
                  <Navigation className="h-4 w-4" /> Go
                </a>
              </li>
            ))}
          </ul>
          {places.length > 5 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="w-full border-t border-sp-line py-3 text-sm font-semibold text-sp-info">
              {showAll ? "Show fewer" : `Show all ${places.length}`}
            </button>
          )}
        </>
      )}
    </Card>
  );
}
