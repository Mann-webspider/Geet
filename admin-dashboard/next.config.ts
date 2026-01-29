import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    return {
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
    };
  },
};

export default nextConfig;
