// Plain helpers shared by the Sales Portal pages (usable on the server and in the browser).

export function money(n, symbol = "") {
  return `${symbol}${(Number(n) || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export function money2(n, symbol = "") {
  return `${symbol}${(Number(n) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function short(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v);
  if (abs >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return v.toLocaleString("en-NG");
}

export function day(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function currencyOf(business) {
  return business?.currency?.currency?.Symbol || "";
}

export function initials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase() || "?"
  );
}

// wa.me takes the number in international form, digits only (0803… becomes 234803…).
export function whatsappLink(phone, text = "") {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `234${digits.slice(1)}`;
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

// Directions to a customer: their saved GPS point if there is one, else their address.
export function mapsLink({ latitude, longitude, address } = {}) {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${latitude},${longitude}`)}`;
  }
  if (address && String(address).trim()) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }
  return "";
}

export function mapEmbed({ latitude, longitude, address, zoom = 15 } = {}) {
  if (latitude && longitude) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${latitude},${longitude}`)}&z=${zoom}&output=embed`;
  }
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`;
  return "";
}

export function toNumber(val) {
  if (val == null) return 0;
  if (typeof val === "object" && val.$numberDecimal != null) return parseFloat(val.$numberDecimal) || 0;
  return Number(val) || 0;
}
