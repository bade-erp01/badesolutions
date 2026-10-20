// Shared by the sales team card (SalesTeamMap) and its Leaflet map (SalesTeamMapView), kept
// apart so the card can use them without loading Leaflet on the server.

export const STATUS_COLORS = { live: "#16a34a", delayed: "#d97706", seen: "#6b7280", none: "#9ca3af" };
export const STATUS_LABELS = { live: "Live", delayed: "Delayed", seen: "Last seen", none: "No location" };

// 0803… / +234803… → 234803… (wa.me wants the number in international form, digits only)
export function whatsappNumber(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("234")) return d;
  if (d.startsWith("0")) return `234${d.slice(1)}`;
  return d;
}
