// Allow-list a URL that came from data (API, user input, query string) before
// it is used in href/src/window.open/location.
//
// Allowed: http:, https:, mailto:, tel:, and relative URLs ("/x", "./x", "x", "#x", "?x").
// Anything else (javascript:, data:, vbscript:, file:, blob: ...) returns the fallback.

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

// Browsers ignore ASCII control characters and whitespace when parsing the
// scheme, so "java\tscript:" and " javascript:" still execute. Strip them first.
const CONTROL_CHARS = /[\u0000- \u007f-\u009f]/g;

export function safeUrl(value, fallback = "#") {
  if (value === null || value === undefined) return fallback;
  const raw = String(value).trim();
  if (!raw) return fallback;

  const compact = raw.replace(CONTROL_CHARS, "");

  // Protocol-relative ("//evil.com") is an absolute URL in disguise; let URL decide below.
  const schemeMatch = /^([a-z][a-z0-9+.-]*):/i.exec(compact);
  if (!schemeMatch && !compact.startsWith("//")) {
    // No scheme: a relative URL. Safe.
    return raw;
  }

  try {
    const base =
      typeof window !== "undefined" ? window.location.href : "https://localhost/";
    const parsed = new URL(compact, base);
    return ALLOWED_PROTOCOLS.has(parsed.protocol) ? raw : fallback;
  } catch {
    return fallback;
  }
}

// Same check, but returns null so callers can skip rendering/navigating.
export function safeUrlOrNull(value) {
  return safeUrl(value, null);
}

export default safeUrl;
