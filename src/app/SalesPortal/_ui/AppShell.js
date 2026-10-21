"use client";

// The Sales Portal frame: a slim sticky header (like the delivery app's), the page in a
// phone-width column, and a tab bar at the bottom for the main sections.

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  ClipboardList,
  FileBarChart2,
  Home,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Moon,
  Package,
  Repeat,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import api, { logout as serverLogout } from "@/lib/api";
import { logout as logoutAction } from "../../../../lib/User";
import { logout as salesLogoutAction } from "../../../../lib/SalesPortalUser";
import { logoutOneSignal } from "@/app/Components/OneSignalProvider";
import NotificationBell from "@/app/Components/NotificationBell";
import { Avatar, Button, ConfirmSheet, Segmented, Select, Sheet } from "./ui";
import { useSalesTheme } from "./theme";

// Sales managers (c_levelDash) get the sales dashboard on the home screen, so their first tab
// and menu entry are called "Dashboard"; reps see "Home" (the shortcuts).
export const sectionsFor = (user) =>
  user?.c_levelDash
    ? SECTIONS.map((s) => (s.href === "/SalesPortal/Dashboard" ? { ...s, label: "Dashboard", long: "Dashboard", icon: LayoutDashboard } : s))
    : SECTIONS;

export const SECTIONS = [
  { href: "/SalesPortal/Dashboard", label: "Home", long: "Home", icon: Home, tab: true },
  { href: "/SalesPortal/Route", label: "Route", long: "Today's route", icon: Map, tab: true },
  { href: "/SalesPortal/Customers", label: "Customers", long: "My customers", icon: Users, tab: true },
  { href: "/SalesPortal/Products", label: "Products", long: "Products", icon: Package, tab: true },
  { href: "/SalesPortal/Requisitions", label: "Orders", long: "Requisitions", icon: ClipboardList, tab: true },
  { href: "/SalesPortal/Reports", label: "Stock", long: "Stock reports", icon: FileBarChart2, tab: false },
];

export default function AppShell({ userData, title, subtitle, back, tabs = true, wide = false, children }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = userData?.user || {};
  const business = userData?.business || {};
  const width = wide ? "max-w-2xl" : "max-w-xl";

  const goBack = () => {
    if (typeof back === "string") router.push(back);
    else if (window.history.length > 1) router.back();
    else router.push("/SalesPortal/Dashboard");
  };

  return (
    <div className="sales-app min-h-dvh bg-sp-bg font-sans text-sp-ink antialiased">
      <header
        className="sticky top-0 z-40 border-b border-sp-line bg-sp-surface/95 backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className={`mx-auto flex h-14 ${width} items-center gap-3 px-4`}>
          {back ? (
            <button type="button" onClick={goBack} className="-ml-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-sp-bg" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <Avatar src={business.companyLogo || "/icons/icon-192.png"} name={business.companyName} size={32} className="rounded-lg" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sales"}</p>
            <p className="truncate text-xs text-sp-muted">{subtitle ?? business.companyName}</p>
          </div>
          <div className="text-sp-muted [&_button]:rounded-lg">
            {/* clicks only mark as read: notification links point into the ERP */}
            <NotificationBell navigate={false} />
          </div>
          <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg p-2 text-sp-muted hover:bg-sp-bg hover:text-sp-ink" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className={`mx-auto ${width} space-y-4 px-4 pt-4 ${tabs ? "pb-28" : "pb-32"}`}>{children}</main>

      {tabs && <TabBar pathname={pathname} user={user} />}

      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} userData={userData} pathname={pathname} />
    </div>
  );
}

function TabBar({ pathname, user }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-sp-line bg-sp-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Sections"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {sectionsFor(user).filter((s) => s.tab).map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-sp-ink" : "text-sp-muted"}`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full transition ${active ? "bg-sp-ink text-sp-on-ink" : ""}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MenuSheet({ open, onClose, userData, pathname }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [signingOut, setSigningOut] = useState(false);
  const [switchTo, setSwitchTo] = useState("");
  const [switching, setSwitching] = useState(false);
  const [theme, setTheme] = useSalesTheme();
  const user = userData?.user || {};
  const business = userData?.business || {};

  const tenants = user.toogledTenants || [];
  const canSwitch = tenants.some((t) => t?.tenantIds?.isActive);
  const targetTenant = tenants.find((t) => t?.tenantIds?._id === switchTo);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logoutOneSignal();
      await serverLogout().catch(() => {}); // end the server session too
      await dispatch(logoutAction());
      await dispatch(salesLogoutAction());
      toast.success("You have been signed out.");
      router.push("/SalesPortal/Login");
    } catch {
      toast.error("Sign out failed. Please try again.");
      setSigningOut(false);
    }
  };

  const switchTenant = async () => {
    setSwitching(true);
    const r = await api.patch(`/api/switch-tenant/${user._id}`, { tenantId: switchTo });
    setSwitching(false);
    if (!r.ok) {
      toast.error("Couldn't switch business. Please try again.");
      return;
    }
    toast.success("Business switched.");
    setSwitchTo("");
    onClose();
    router.refresh();
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Menu">
        <div className="flex items-center gap-3 rounded-2xl bg-sp-bg p-3">
          <Avatar src={user.image} name={`${user.firstName || ""} ${user.lastName || ""}`} size={44} className="rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-sp-muted">{business.companyName}</p>
          </div>
        </div>

        <nav className="overflow-hidden rounded-2xl border border-sp-line" aria-label="All sections">
          {sectionsFor(user).map(({ href, long, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 border-b border-sp-line px-4 py-3.5 text-[15px] last:border-b-0 ${active ? "bg-sp-bg font-semibold" : "hover:bg-sp-bg"}`}
              >
                <Icon className="h-5 w-5 text-sp-muted" />
                {long}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Moon className="h-4 w-4 text-sp-muted" /> Appearance
          </p>
          <Segmented
            label="Appearance"
            value={theme}
            onChange={setTheme}
            options={[
              ["light", "Light"],
              ["dark", "Dark"],
              ["system", "Phone setting"],
            ]}
          />
        </div>

        {canSwitch && (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Repeat className="h-4 w-4 text-sp-muted" /> Switch business
            </p>
            <Select value="" onChange={(e) => setSwitchTo(e.target.value)} aria-label="Switch business">
              <option value="">{business.companyName || "Choose a business"}</option>
              {tenants
                .filter((t) => t?.tenantIds?._id && t.tenantIds._id !== business.tenantId)
                .map((t) => (
                  <option key={t.tenantIds._id} value={t.tenantIds._id}>
                    {t.tenantIds.companyName}
                  </option>
                ))}
            </Select>
          </div>
        )}

        <Button variant="danger" className="w-full" onClick={signOut} busy={signingOut}>
          {!signingOut && <LogOut className="h-5 w-5" />} {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </Sheet>

      <ConfirmSheet
        open={Boolean(switchTo)}
        onClose={() => setSwitchTo("")}
        title="Switch business?"
        text={`You will be moved to ${targetTenant?.tenantIds?.companyName || "the other business"}'s workspace.`}
        confirmLabel="Yes, switch"
        busy={switching}
        onConfirm={switchTenant}
      />
    </>
  );
}
