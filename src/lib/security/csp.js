// Content-Security-Policy builder, used by middleware.js.
//
// Runs in the Edge runtime: no Node APIs here.
//
// Rollout: CSP_MODE=report-only sends Content-Security-Policy-Report-Only
// (violations are logged at /api/csp-report, nothing is blocked). Once the
// report log is clean, set CSP_MODE=enforce. Default is report-only.

const isProd = process.env.NODE_ENV === "production";

// Origin of a configured URL ("https://api.x.com/v1" -> "https://api.x.com").
function originOf(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Matching ws:// / wss:// origin for socket.io.
function wsOriginOf(url) {
  const origin = originOf(url);
  if (!origin) return null;
  return origin.replace(/^http/, "ws");
}

// Space-separated extra sources from env, for hosts we don't know about yet.
function extra(name) {
  return (process.env[name] || "").split(/\s+/).filter(Boolean);
}

// Backend origins the browser talks to directly (fetch + socket.io).
const API_URLS = [
  process.env.EXPRESS_PRIVATE_URL,
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_BASE_URL,
  // the live API, also when the settings above aren't set on the host
  "https://api.badesolutions.com.ng",
];

// Remote image hosts (keep in sync with images.remotePatterns in next.config.mjs).
const IMAGE_HOSTS = [
  "https://res.cloudinary.com",
  "https://firebasestorage.googleapis.com",
  "https://img.icons8.com",
  "https://images.unsplash.com",
  "https://allchannels.com.ng",
  "https://www.currencyremitapp.com",
  "https://api.badesolutions.com.ng",
  "https://via.placeholder.com",
];

const ONESIGNAL = ["https://onesignal.com", "https://*.onesignal.com"];

// Map tiles for the customer map (Delivery app, Leaflet + OpenStreetMap).
const MAP_TILES = ["https://tile.openstreetmap.org", "https://*.tile.openstreetmap.org"];

// Third-party APIs called from the browser (geocoding/weather in LocationGrabber, GpsTracker etc.).
const GEO_APIS = [
  "https://nominatim.openstreetmap.org",
  "https://api.opencagedata.com",
  "https://api.open-meteo.com",
  "https://api.bigdatacloud.net",
  "https://overpass-api.de",
];

const unique = (list) => [...new Set(list.filter(Boolean))];

export function generateNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function buildCsp(nonce) {
  const apiOrigins = API_URLS.map(originOf);
  const wsOrigins = API_URLS.map(wsOriginOf);

  const directives = {
    "default-src": ["'self'"],
    // 'strict-dynamic': scripts loaded by nonce'd scripts (Next chunks, the
    // OneSignal SDK loader, Vercel Analytics) are trusted; host lists are
    // ignored by CSP3 browsers and kept only as a fallback for old ones.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://cdn.onesignal.com",
      "https://challenges.cloudflare.com", // Cloudflare Turnstile on the sign-in pages
      // React Refresh / webpack eval source maps in dev only.
      !isProd && "'unsafe-eval'",
      ...extra("CSP_EXTRA_SCRIPT_SRC"),
    ],
    // Tailwind, SweetAlert2, chart.js and Radix set inline styles.
    "style-src": [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      ...ONESIGNAL,
    ],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      ...IMAGE_HOSTS,
      ...MAP_TILES,
      ...ONESIGNAL,
      ...apiOrigins,
      !isProd && "http://localhost:*",
      ...extra("CSP_EXTRA_IMG_SRC"),
    ],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      ...apiOrigins,
      ...wsOrigins,
      ...ONESIGNAL,
      "https://api.paystack.co",
      ...GEO_APIS,
      // jsPDF fetches logos/product images to embed them in PDFs.
      ...IMAGE_HOSTS,
      !isProd && "http://localhost:*",
      !isProd && "ws://localhost:*",
      ...extra("CSP_EXTRA_CONNECT_SRC"),
    ],
    // Paystack inline checkout + Google Maps embeds (CRM, Sales Portal, users).
    "frame-src": [
      "https://checkout.paystack.com",
      "https://www.google.com",
      "https://maps.google.com",
      "https://challenges.cloudflare.com", // Cloudflare Turnstile widget
      ...extra("CSP_EXTRA_FRAME_SRC"),
    ],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "media-src": ["'self'", "blob:", "data:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://checkout.paystack.com"],
    "frame-ancestors": ["'none'"],
    "report-uri": ["/api/csp-report"],
    "report-to": ["csp-endpoint"],
  };

  const parts = Object.entries(directives).map(
    ([name, values]) => `${name} ${unique(values).join(" ")}`
  );
  // Breaks plain-http local backends; browsers ignore it (with a console warning) in report-only mode.
  if (isProd && process.env.CSP_MODE === "enforce") parts.push("upgrade-insecure-requests");
  return parts.join("; ");
}

export function cspHeaderName() {
  return process.env.CSP_MODE === "enforce"
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";
}

// Headers that apply to every document response.
export function securityHeaders() {
  const headers = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // geolocation is used by GpsTracker/LocationGrabber/Login, so it stays on for our own origin.
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
    "Reporting-Endpoints": 'csp-endpoint="/api/csp-report"',
  };
  if (isProd) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }
  return headers;
}
