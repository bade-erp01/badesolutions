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