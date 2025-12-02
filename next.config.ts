import type { NextConfig } from "next";
// import createNextIntlPlugin from "next-intl/plugin";

// const withNextIntl = createNextIntlPlugin("./i18n.ts");

const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig: NextConfig = {
  // Configuración para Sentry (cuando esté instalado)
  // Sentry se inicializará automáticamente si NEXT_PUBLIC_SENTRY_DSN está configurado
  // Ver: sentry.client.config.ts y sentry.server.config.ts
  
  // Configuración de Turbopack (requerida cuando Sentry agrega webpack config)
  // Nota: Sentry aún no soporta completamente Turbopack en desarrollo
  // En producción funciona correctamente
  turbopack: {},
  
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "viotech-main.onrender.com",
      },
      {
        protocol: "https",
        hostname: "checkout.wompi.co",
      },
      {
        protocol: "https",
        hostname: "cdn.wompi.co",
      },
    ],
  },
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
              "connect-src 'self' https://www.google-analytics.com https://www.google.com https://viotech-main.onrender.com https://checkout.wompi.co https://cdn.wompi.co https://production.wompi.co https://translate.googleapis.com https://*.supabase.co https://supabase.co https://*.sentry.io https://o4507467686985728.ingest.us.sentry.io",
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

// export default withNextIntl(nextConfig); // Temporalmente deshabilitado

// Configuración de Sentry - Activa cuando NEXT_PUBLIC_SENTRY_DSN esté configurado
export default withSentryConfig(nextConfig, {
  silent: true,
  org: "viotech-solutions",
  project: "viotech-pro-frontend",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: false,
  automaticVercelMonitors: true,
});
