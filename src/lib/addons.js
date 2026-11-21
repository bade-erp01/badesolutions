// Is a paid add-on active for the business? Mirrors the backend rule (lib/addons.js there):
// an add-on covering the feature, paid until a date that is less than 3 days (grace) in the past.
// For showing or hiding buttons only — the backend checks again on every request.

const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

const NAMES = {
  nrsEInvoice: "NRS e-invoicing",
  subscriptions: "Subscriptions",
  regAi: "Reg AI",
  inventoryCosting: "Inventory costing",
  manufacturing: "Manufacturing",
  merchantPortal: "Merchant portal",
  delivery: "Delivery app",
  helpdesk: "Help Desk",
};

function covers(addOn, feature) {
  const list = (Array.isArray(addOn?.features) && addOn.features.length && addOn.features) ||
    (Array.isArray(addOn?.includes) && addOn.includes.length && addOn.includes) || null;
  if (list) return list.includes(feature);
  return addOn?.name === NAMES[feature] || addOn?.Name === NAMES[feature];
}

export function hasActiveAddOn(business, feature, now = Date.now()) {
  return (business?.addOns || []).some(
    (a) => covers(a, feature) && a.paidUntil && new Date(a.paidUntil).getTime() + GRACE_MS >= now,
  );
}
