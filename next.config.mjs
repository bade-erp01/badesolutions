/** @type {import('next').NextConfig} */
const nextConfig = {
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
        hostname: "localhost", // ✅ no port or protocol here
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
        hostname: "images.unsplash.com", // ✅ corrected
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

export default nextConfig;
