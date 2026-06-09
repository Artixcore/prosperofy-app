import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon.svg", permanent: false },
      { source: "/billing", destination: "/settings/billing", permanent: false },
      { source: "/billing/:path*", destination: "/settings/billing/:path*", permanent: false },
      { source: "/wallets", destination: "/wallet", permanent: false },
      { source: "/wallets/:path*", destination: "/wallet", permanent: false },
      { source: "/wallet/connect", destination: "/wallet", permanent: false },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
