import { cookies } from "next/headers";

// Backend calls from server components / layouts. The browser's session cookie (set by
// the backend for .badesolutions.com.ng) is forwarded, so the backend sees the same
// logged-in user as it would from the browser. Reads only: writes go through the
// browser (src/lib/api.js) so they carry the CSRF token.
//
//   const { ok, data } = await serverApi("/api/Customers");

export const SERVER_API_URL =
  process.env.EXPRESS_PRIVATE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://api.badesolutions.com.ng");

const SESSION_COOKIE = "bade_sid";

export async function serverApi(path, { method = "GET", headers = {}, next, cache = "no-store" } = {}) {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  const h = { Accept: "application/json", ...headers };
  if (sid) h.Cookie = `${SESSION_COOKIE}=${encodeURIComponent(sid)}`;
  // Every user's server-rendered page reaches the backend from this host's IP; the shared
  // secret tells the backend not to count them against one IP's limit (it still limits
  // each logged-in user). Server-side only: never use a NEXT_PUBLIC_ name for it.
  if (process.env.INTERNAL_SECRET) h["x-internal-secret"] = process.env.INTERNAL_SECRET;

  let res;
  try {
    res = await fetch(/^https?:\/\//.test(path) ? path : `${SERVER_API_URL}${path}`, {
      method,
      headers: h,
      cache: next ? undefined : cache,
      next,
    });
  } catch {
    return { ok: false, status: 0, data: null, error: "Can't reach the server." };
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  return {
    ok: res.ok,
    status: res.status,
    data,
    error: res.ok ? null : data?.error || data?.message || `Request failed (${res.status})`,
  };
}

export default serverApi;
