// Edge middleware for every document request:
//   1. Auth gate: bounce requests with no session cookies away from the
//      protected areas before any rendering or DB work. This only checks the
//      cookies exist; the layouts (fetchUser) still validate the session.
//   2. Per-request nonce-based Content-Security-Policy plus baseline security
//      headers. Next reads the nonce from the request's CSP header and adds it
//      to its own scripts; layouts read it from `x-nonce` (e.g. next-themes).
//
// Next only loads middleware from src/ when the app lives in src/app.
import { NextResponse } from "next/server";
import {
  buildCsp,
  cspHeaderName,
  generateNonce,
  securityHeaders,
} from "@/lib/security/csp";

// /{tenant}/V4 and everything below it: [auth]/V4/layout.js redirects to /Login.
const ERP_PATH = /^\/[^/]+\/V4(?:\/|$)/;
const ERP_COOKIES = ["userInfo", "businessInfo", "SessionId"];

// Sales Portal pages whose layouts redirect to /SalesPortal/Login.
const SALES_PATH =
  /^\/SalesPortal\/(?:Dashboard|Route|(?:Customers|Products|Reports|Requisitions)\/[^/]+)(?:\/|$)/;
const SALES_COOKIES = ["salesPerson", "SessionId"];

function hasCookies(request, names) {
  return names.every((name) => Boolean(request.cookies.get(name)?.value));
}

function loginRedirect(request) {
  const { pathname } = request.nextUrl;
  if (ERP_PATH.test(pathname) && !hasCookies(request, ERP_COOKIES)) {
    return new URL("/Login", request.url);
  }
  if (SALES_PATH.test(pathname) && !hasCookies(request, SALES_COOKIES)) {
    return new URL("/SalesPortal/Login", request.url);
  }
  return null;
}

function withSecurityHeaders(response, headerName, csp) {
  response.headers.set(headerName, csp);
  for (const [name, value] of Object.entries(securityHeaders())) {
    response.headers.set(name, value);
  }
  return response;
}

export function middleware(request) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);
  const headerName = cspHeaderName();

  const redirectTo = loginRedirect(request);
  if (redirectTo) {
    return withSecurityHeaders(NextResponse.redirect(redirectTo), headerName, csp);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(headerName, csp);

  return withSecurityHeaders(
    NextResponse.next({ request: { headers: requestHeaders } }),
    headerName,
    csp
  );
}

export const config = {
  matcher: [
    {
      // Documents only: skip API routes, Next assets, and public files (sw.js,
      // the OneSignal worker, manifest, images), which don't need a nonce.
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
