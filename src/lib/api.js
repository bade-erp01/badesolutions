// One way to call the backend.
//
// Login gives the browser an httpOnly session cookie (bade_sid) that this code can't
// read, plus a CSRF cookie (bade_csrf) that it echoes in x-csrf-token on every write.
// The backend takes the business and the user from the session, so pages no longer
// build Authorization / access / sessionKey headers or Encrypt() ids.
//
//   const { ok, status, data, error } = await api.get("/api/Pos/config");
//   await api.post("/api/Pos/checkout", body, { headers: { "Idempotency-Key": key } });

// NEXT_PUBLIC_API_URL=same-origin: call the backend through this site (dev proxy, see
// ERP_API_PROXY in next.config.mjs) — one tunnel serves a phone the whole app
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL === "same-origin" ? "" :
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://api.badesolutions.com.ng");

const CSRF_COOKIE = "bade_csrf";
const UNSAFE = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function readCookie(name) {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

/** True when this browser holds a server session (the CSRF cookie comes with it). */
export const hasSession = () => Boolean(readCookie(CSRF_COOKIE));

/**
 * @param {string} path  "/api/..." (joined to API_URL) or a full URL
 * @param {{method?:string, body?:any, headers?:object, signal?:AbortSignal}} [opts]
 * @returns {Promise<{ok:boolean, status:number, data:any, error:string|null}>}
 */
export async function api(path, { method = "GET", body, headers = {}, signal } = {}) {
  method = method.toUpperCase();
  const h = { Accept: "application/json", ...headers };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) h["Content-Type"] = "application/json";
  if (UNSAFE.has(method)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) h["x-csrf-token"] = csrf;
  }

  let res;
  try {
    res = await fetch(/^https?:\/\//.test(path) ? path : `${API_URL}${path}`, {
      method,
      headers: h,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      credentials: "include",
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    return { ok: false, status: 0, data: null, error: "Can't reach the server. Check your connection." };
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  const sessionEnded = res.headers.get("X-Session-Ended") === "1";
  const error = res.ok
    ? null
    : sessionEnded
      ? "Your session has ended. Please log in again."
      : data?.error || data?.message || `Request failed (${res.status})`;
  if (sessionEnded) sendToLogin(res.headers.get("X-Session-Reason"));
  return { ok: res.ok, status: res.status, data, error };
}

// The backend marks login problems (no session, expired, suspended, logged in elsewhere)
// with X-Session-Ended; other 401s, e.g. a wrong ops code, stay on the page.
let redirecting = false;
function sendToLogin(reason) {
  if (typeof window === "undefined" || redirecting) return;
  const path = window.location.pathname;
  const login = path.startsWith("/SalesPortal") ? "/SalesPortal/Login" : "/Login";
  if (path === login) return;
  redirecting = true;
  // "elsewhere": this account signed in on another device (one device at a time)
  window.location.assign(reason === "elsewhere" ? `${login}?reason=elsewhere` : login);
}

api.get = (path, opts) => api(path, { ...opts, method: "GET" });
api.post = (path, body, opts) => api(path, { ...opts, method: "POST", body });
api.put = (path, body, opts) => api(path, { ...opts, method: "PUT", body });
api.patch = (path, body, opts) => api(path, { ...opts, method: "PATCH", body });
api.del = (path, opts) => api(path, { ...opts, method: "DELETE" });

/** Ends the server session; call before clearing local state. */
export async function logout() {
  await api.post("/api/v1/Logout");
}

export default api;
