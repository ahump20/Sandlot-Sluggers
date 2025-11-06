import type { NextConfig } from "next";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  rewrites: async () => {
    if (!API_BASE_URL) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${API_BASE_URL}/:path*`
      }
    ];
  }
};

export default config;
