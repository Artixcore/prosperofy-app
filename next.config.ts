import type { NextConfig } from "next";

function connectSrc(): string {
  const api = process.env.NEXT_PUBLIC_LARAVEL_API_BASE_URL?.replace(/\/$/, "") || "";
  if (!api) return "'self'";
  try {
    return `'self' ${new URL(api).origin}`;
  } catch {
    return "'self'";
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  productionBrowserSourceMaps: false,
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              `connect-src ${connectSrc()}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
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
