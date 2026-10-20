// Phone layout (below 768px): short labels and icons for the ERP's apps, and which ones get a
// bottom tab. Apps open at /<business>/V4/<url>/<url> (as in Wrapper's sidebar).

import {
  Briefcase,
  Calculator,
  ClipboardList,
  FileSignature,
  LayoutGrid,
  Package,
  Receipt,
  Repeat,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

const APPS = {
  store: { short: "Store", icon: Store },
  crm: { short: "Customers", icon: Users },
  product: { short: "Products", icon: Package },
  payment: { short: "Cash", icon: Wallet },
  expense: { short: "Expense", icon: Receipt },
  accounting: { short: "Accounts", icon: Calculator },
  asset: { short: "Assets", icon: Briefcase },
  delivery: { short: "Delivery", icon: Truck },
  "merchant-biller": { short: "Merchant", icon: ShoppingCart },
  contract: { short: "Contracts", icon: FileSignature },
  subscription: { short: "Subscriptions", icon: Repeat },
  purchase: { short: "Purchases", icon: ClipboardList },
};

// bottom tabs: Home, then the first three of these the user has, then More
const TAB_ORDER = ["store", "crm", "product", "payment", "expense", "accounting", "delivery", "merchant-biller"];

export const appMeta = (app) => {
  const m = APPS[String(app?.url || "").toLowerCase()];
  return { short: m?.short || app?.Name || app?.url || "App", icon: m?.icon || LayoutGrid };
};

export function tabApps(apps = []) {
  const byUrl = new Map(apps.map((a) => [String(a.url || "").toLowerCase(), a]));
  return TAB_ORDER.map((u) => byUrl.get(u)).filter(Boolean).slice(0, 3);
}

/** Is `pathname` inside this app? (/<business>/V4/<url>/...) */
export const inApp = (pathname, auth, app) =>
  String(pathname || "").toLowerCase().startsWith(`/${String(auth || "").toLowerCase()}/v4/${String(app?.url || "").toLowerCase()}/`);
