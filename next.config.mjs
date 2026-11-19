import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // disables PWA in dev
  // Next 15 app router doesn't serve app-build-manifest.json; precaching it 404s
  // and aborts the whole service worker install.
  buildExcludes: [/app-build-manifest\.json$/],
  // Keep the OneSignal worker (its own scope) out of the next-pwa precache.
  publicExcludes: ["!noprecache/**/*", "!push/**/*"],
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),

  // Local testing only. ERP_API_PROXY=http://localhost:3000 (with NEXT_PUBLIC_API_URL=same-origin)
  // forwards the API and live updates through this site, so one HTTPS tunnel serves a phone the
  // whole ERP against the LOCAL backend. Unset (production, normal use) it does nothing. Next's
  // own routes (e.g. /api/csp-report) are matched before these rewrites.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.io"],
  // PostHog's endpoints (/ingest/e/, /ingest/decide/) and socket.io paths end in "/"; a redirect
  // there would break them.
  skipTrailingSlashRedirect: true,
  // Other spellings of the public pages. Next matches redirect sources case-insensitively,
  // so a case-only redirect (/pricing -> /Pricing) would also catch /Pricing and loop:
  // only spellings that differ by more than case belong here.
  async redirects() {
    return [
      { source: "/about", destination: "/About_Us", permanent: true },
      { source: "/about-us", destination: "/About_Us", permanent: true },
      // sign-up starts from a plan on the pricing page (/auth/SignUp without ?plan= goes home)
      { source: "/signup", destination: "/Pricing", permanent: true },
      { source: "/sign-up", destination: "/Pricing", permanent: true },
      { source: "/why", destination: "/why-bade", permanent: true },
    ];
  },
  async rewrites() {
    // PostHog, through our own origin (src/app/Components/PostHogProvider.js). Region host:
    // us.i.posthog.com / us-assets.i.posthog.com, or eu.* for an EU project.
    const posthogHost = process.env.POSTHOG_INGEST_HOST || "https://us.i.posthog.com";
    const posthogAssets = process.env.POSTHOG_ASSETS_HOST || "https://us-assets.i.posthog.com";
    const posthog = [
      { source: "/ingest/static/:path*", destination: `${posthogAssets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${posthogHost}/:path*` },
    ];
    const api = process.env.ERP_API_PROXY;
    if (!api) return posthog;
    return [
      ...posthog,
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      // the Sales Portal login lives outside /api on the backend (not /SalesPortal, the app's pages)
      { source: "/Sales_Portal/:path*", destination: `${api}/Sales_Portal/:path*` },
      { source: "/Sales_Portal/login", destination: `${api}/Sales_Portal/login` },
      { source: "/socket.io/", destination: `${api}/socket.io/` },
      { source: "/socket.io/:path*", destination: `${api}/socket.io/:path*` },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "allchannels.com.ng",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.currencyremitapp.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.badesolutions.com.ng",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "1492-102-91-102-30.ngrok-free.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "checkout.paystack.com",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "challenges.cloudflare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "maps.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/**",
      }
    ],
  },
};

export default withPWA(nextConfig);