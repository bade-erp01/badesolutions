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
      }
    ],
  },
};

export default nextConfig;
