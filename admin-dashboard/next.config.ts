import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => ({
    fallback: [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
      {
        source: "/v1/:path*",
        destination: "http://localhost:8080/v1/:path*",
      },
    ],
  }),

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow any https host
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/media/covers/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/media/audio/**",
      },
    ],
    // optional in dev if you hit LAN IPs:
    // dangerouslyAllowLocalImages: true
  },
};

export default nextConfig;
