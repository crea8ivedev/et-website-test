/** @type {import('next').NextConfig} */

// NOTE: Content-Security-Policy is intentionally NOT set here.
// It is generated dynamically per request in src/middleware.js, which injects a
// per-request nonce into script-src (Finding #3 fix). Keeping CSP in next.config.mjs
// would override the middleware nonce-based header with a static unsafe-inline header.

const nextConfig = {
  allowedDevOrigins: ["192.168.11.33"],

  compress: true,
  serverExternalPackages: ["jsdom"],
  // Limit concurrent static generation workers to reduce WordPress API rate-limit (429) errors
  experimental: {
    workerThreads: false,
    cpus: 2,
  },
  images: {
    remotePatterns: process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME
      ? [
          {
            protocol: "https",
            hostname: process.env.NEXT_PUBLIC_WORDPRESS_IMAGE_HOSTNAME,
          },
        ]
      : [],
    // HIGH-05: serve AVIF first (30-50% smaller than WebP), then WebP fallback
    formats: ["image/avif", "image/webp"],
    // HIGH-05: cache optimised images for 30 days (default 60s is too short)
    minimumCacheTTL: 2592000,
  },

  async headers() {
    // Non-CSP security headers applied to all page routes.
    // CSP is handled per-request in src/middleware.js (nonce-based, Finding #3 fix).
    const securityHeaders = [
      { key: "X-XSS-Protection", value: "0" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];

    return [
      { source: "/", headers: securityHeaders },
      { source: "/:path+", headers: securityHeaders },
      // Long cache for static assets — fonts/icons never change between deploys
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
