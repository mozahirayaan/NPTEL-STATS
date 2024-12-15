/** @type {import('next').NextConfig} */

const nextConfig = {
    async rewrites() {
      return [
        {
          source: "/api1/:path*",
          destination: "https://nptel.ac.in/:path*",
        },
      ];
    },
  };
  
  export default nextConfig;
  