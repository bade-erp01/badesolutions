"use client";

// The ERP on phones (below 768px, md): a slim header, a bottom tab bar and a menu sheet, in the
// style of the Sales Portal. Rendered by Wrapper next to the desktop frame; everything here is
// md:hidden, so tablets and desktops keep exactly the layout they had.

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, ChevronRight, Home, LogOut, Menu, Search, Settings, Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ThemeToggle from "@/components/theme-toggle.jsx";
import NotificationBell from "@/app/Components/NotificationBell";
import { logoutOneSignal } from "@/app/Components/OneSignalProvider";
import { logout as serverLogout } from "@/lib/api";
import { logout as logoutAction } from "../../../../lib/User";
import { ErrorMessage, SuccessToast } from "../../../../Functions/Mics";
import { appMeta, inApp, tabApps } from "./apps";

const toId = (v) => (v && typeof v === "object" ? String(v) : v != null ? String(v) : "");
const initials = (s) =>
  String(s || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

/** Page title for the header: the app's name, else the module from the address, else Dashboard. */
function titleFor(pathname, auth, module, apps) {
  if (!module || pathname === `/${auth}/V4` || pathname === `/${auth}/V4/`) return "Dashboard";
  const app = apps.find((a) => String(a.url).toLowerCase() === String(module).toLowerCase());
  if (app) return app.Name;
  if (/assistant/i.test(pathname)) return "Reg AI";
  if (/settings/i.test(pathname)) return "Settings";
  if (/search/i.test(pathname)) return "Search";
  return String(module).replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function MobileHeader({ user, apps, search, onOpenMenu }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { auth, Module } = useParams() || {};
  const [searching, setSearching] = useState(false);
  const home = pathname === `/${auth}/V4` || pathname === `/${auth}/V4/`;
  const business = user?.business || {};

  return (
    <header className="md:hidden sticky top-0 z-40 border-b bg-card/95 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="flex h-14 items-center gap-2 px-3">
        {home ? (
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={business.companyLogo || "/bade.jpg"} alt="" className="object-contain" />
            <AvatarFallback className="rounded-lg text-xs">{initials(business.companyName)}</AvatarFallback>
          </Avatar>
        ) : (
          <button type="button" onClick={() => router.back()} className="-ml-1 rounded-lg p-2 hover:bg-muted" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{titleFor(pathname, auth, Module, apps)}</p>
          <p className="truncate text-xs text-muted-foreground">{business.companyName}</p>
        </div>
        {search?.allowed && (
          <button type="button" onClick={() => setSearching((s) => !s)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Search">
            {searching ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        )}
        <div className="text-muted-foreground">
          <NotificationBell />
        </div>
        <button type="button" onClick={onOpenMenu} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {search?.allowed && searching && (
        <form
          onSubmit={(e) => {
            search.onSubmit(e);
            setSearching(false);
          }}
          className="flex gap-2 px-3 pb-3"
        >
          <input
            autoFocus
            type="search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder={`Search ${search.module || "this module"}…`}
            className="h-11 min-w-0 flex-1 rounded-xl border bg-background px-3 text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button type="submit" className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Search
          </button>
        </form>
      )}
    </header>
  );
}

export function MobileTabBar({ apps, onOpenMenu }) {
  const pathname = usePathname() || "";
  const { auth } = useParams() || {};
  const home = pathname === `/${auth}/V4` || pathname === `/${auth}/V4/`;
  const tabs = tabApps(apps);
  const tabClass = (active) => `flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-foreground" : "text-muted-foreground"}`;
  const pill = (active) => `flex h-7 w-12 items-center justify-center rounded-full transition ${active ? "bg-primary text-primary-foreground" : ""}`;

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Sections"
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${tabs.length + 2}, minmax(0, 1fr))` }}>
        <Link href={`/${auth}/V4`} className={tabClass(home)} aria-current={home ? "page" : undefined}>
          <span className={pill(home)}>
            <Home className="h-[18px] w-[18px]" />
          </span>
          Home
        </Link>
        {tabs.map((app) => {
          const { short, icon: Icon } = appMeta(app);
          const active = inApp(pathname, auth, app);
          return (
            <Link key={app.url} href={`/${auth}/V4/${app.url}/${app.url}`} className={tabClass(active)} aria-current={active ? "page" : undefined}>
              <span className={pill(active)}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="max-w-full truncate px-1">{short}</span>
            </Link>
          );
        })}
        <button type="button" onClick={onOpenMenu} className={tabClass(false)}>
          <span className={pill(false)}>
            <Menu className="h-[18px] w-[18px]" />
          </span>
          More
        </button>
      </div>
    </nav>
  );
}

export function MobileMenu({ open, onClose, user, apps, tenants, selectedTenantId, onSwitchTenant }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { auth } = useParams() || {};
  const dispatch = useDispatch();
  const me = user?.user || {};
  const business = user?.business || {};
  const go = (href) => {
    onClose();
    router.push(href);
  };

  const signOut = async () => {
    try {
      await logoutOneSignal();
      await serverLogout().catch(() => {}); // end the server session too
      await dispatch(logoutAction());
      SuccessToast("You have been logged out successfully.");
      router.push("/Login");
    } catch {
      ErrorMessage("Logout failed. Please try again.");
    }
  };

  const row = "flex w-full items-center gap-3 border-b px-4 py-3.5 text-left text-[15px] last:border-b-0 hover:bg-muted";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="md:hidden max-h-[88dvh] gap-0 overflow-y-auto rounded-t-2xl p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="text-base">Menu</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={me.image || business.companyLogo} alt="" />
              <AvatarFallback>{initials(`${me.firstName || ""} ${me.lastName || ""}`)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {me.firstName} {me.lastName}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {business.companyName}
                {business.subscriptionplan ? ` · ${business.subscriptionplan} plan` : ""}
              </p>
            </div>
          </div>

          <nav className="overflow-hidden rounded-2xl border" aria-label="All apps">
            <button type="button" onClick={() => go(`/${auth}/V4`)} className={row}>
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1">Business Overview</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            {apps.map((app) => {
              const { icon: Icon } = appMeta(app);
              const active = inApp(pathname, auth, app);
              return (
                <button key={app._id || app.url} type="button" onClick={() => go(`/${auth}/V4/${app.url}/${app.url}`)} className={`${row} ${active ? "bg-muted font-semibold" : ""}`}>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1">{app.Name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              );
            })}
            {me.isDev && (
              <button type="button" onClick={() => go(`/${auth}/V4/Assistant`)} className={row}>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1">Try Reg AI</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </nav>

          {tenants.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Switch business</p>
              <Select value={selectedTenantId} onValueChange={(v) => { onClose(); onSwitchTenant(v); }}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue placeholder="Select business…" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={toId(t?.tenantIds?._id)} value={toId(t?.tenantIds?._id)}>
                      {t?.tenantIds?.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-2xl border px-4 py-2.5">
            <span className="text-[15px]">Appearance</span>
            <ThemeToggle />
          </div>

          <div className="overflow-hidden rounded-2xl border">
            {me.isAdmin && (
              <button type="button" onClick={() => go(`/${auth}/V4/Settings`)} className={row}>
                <Settings className="h-5 w-5 text-muted-foreground" />
                <span className="flex-1">Settings</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <button type="button" onClick={signOut} className={`${row} text-destructive`}>
              <LogOut className="h-5 w-5" />
              <span className="flex-1">Logout</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
