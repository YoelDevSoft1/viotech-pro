import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com https://translate.googleapis.com https://checkout.wompi.co https://cdn.wompi.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://checkout.wompi.co https://cdn.wompi.co",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com https://checkout.wompi.co https://cdn.wompi.co",
              "font-src 'self' https://fonts.gstatic.com data: https://checkout.wompi.co https://cdn.wompi.co",
              "img-src 'self' data: https: https://checkout.wompi.co https://cdn.wompi.co",
              "connect-src 'self' https://www.google-analytics.com https://www.google.com https://viotech-main.onrender.com https://checkout.wompi.co https://cdn.wompi.co https://production.wompi.co https://translate.googleapis.com",
              "frame-src 'self' https://www.googletagmanager.com https://checkout.wompi.co https://cdn.wompi.co https://translate.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
