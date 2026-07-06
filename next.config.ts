import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // Next.js App Router requires 'unsafe-inline' for hydration scripts;
  // dev mode additionally needs 'unsafe-eval' for the Fast Refresh/HMR runtime
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Tailwind and shadcn inject inline styles at runtime
  "style-src 'self' 'unsafe-inline'",
  // next/font self-hosts fonts under /_next/static/media — no external CDN needed
  "font-src 'self'",
  // Map tiles: OSM subdomains (a/b/c) + Esri satellite
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://server.arcgisonline.com",
  // Leaflet TileLayer fetches tiles via XHR/fetch — same origins as img-src
  "connect-src 'self' https://*.tile.openstreetmap.org https://server.arcgisonline.com",
  "object-src 'none'",
  // Modern equivalent of X-Frame-Options: DENY (kept both for older browser compat)
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // max-age = 1 year (31 536 000 s); HSTS is ignored by browsers over plain HTTP
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Disable unused browser APIs; geolocation=(self) reserved for future "use my location" feature
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);
