/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "allchannels.com.ng", // ✅ Removed array brackets (should be a string)
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // ✅ Removed array brackets (should be a string)
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com", // ✅ Each hostname should be a separate object
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "http://localhost:3000", // ✅ Each hostname should be a separate object
        pathname: "/**",
      },
      {
        protocol:"https",
        hostname:"www.currencyremitapp.com",
        pathname:"/**"
      },
      {
        protocol:"https",
        hostname:"api.badesolutions.com.ng",
        pathname:"/**"
      },
      {
        protocol:"https",
        hostname:"bade-backend-5vegnfex0-obernard23s-projects.vercel.app",
        pathname:"/**"
      }
    ],
  },
};

export default nextConfig;
