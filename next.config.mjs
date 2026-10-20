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

  // Local testing only. ERP_API_PROXY=http://localhost:3000 (with NEXT_PUBLIC_API_URL=same-origin)
  // forwards the API and live updates through this site, so one HTTPS tunnel serves a phone the
  // whole ERP against the LOCAL backend. Unset (production, normal use) it does nothing. Next's
  // own routes (e.g. /api/csp-report) are matched before these rewrites.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok-free.dev", "*.ngrok.app", "*.ngrok.io"],
  ...(process.env.ERP_API_PROXY ? { skipTrailingSlashRedirect: true } : {}), // socket.io paths end in "/"
  async rewrites() {
    const api = process.env.ERP_API_PROXY;
    if (!api) return [];
    return [
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
    ],
  },
};

export default withPWA(nextConfig);