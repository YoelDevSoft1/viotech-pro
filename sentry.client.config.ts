/**
 * Configuración de Sentry para el cliente (browser)
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Entorno (development, staging, production)
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development",
  
  // Tasa de muestreo para traces (0.0 a 1.0)
  // En producción: 10% para no saturar, en desarrollo: 100%
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Tasa de muestreo para sesiones de replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Tasa de muestreo para sesiones de replay con errores (siempre 100%)
  replaysOnErrorSampleRate: 1.0,
  
  // Filtrar eventos antes de enviarlos a Sentry
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filtrar errores conocidos/no críticos que no queremos enviar
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = String(error.message);
      
      // No enviar errores de endpoints no implementados
      if (errorMessage.includes('ENDPOINT_NOT_IMPLEMENTED')) {
        return null;
      }
      
      // No enviar errores de conexión por cold starts (ya se manejan en UI)
      if (errorMessage.includes('cold start') || errorMessage.includes('timeout')) {
        return null;
      }
      
      // No enviar errores de chunks no encontrados (pueden ser legítimos)
      if (errorMessage.includes('Loading chunk') || errorMessage.includes('Failed to fetch dynamically imported module')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Integraciones
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Enmascarar todo el texto y medios para privacidad
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Configuración de trace propagation
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/viotech-main\.onrender\.com/,
    /^https:\/\/viotech\.com\.co/,
  ],
  
  // Ignorar errores comunes del navegador que no son útiles
  ignoreErrors: [
    // Errores de extensión del navegador
    "top.GLOBALS",
    "originalCreateNotification",
    "canvas.contentDocument",
    "MyApp_RemoveAllHighlights",
    // Errores de Red
    "NetworkError",
    "Network request failed",
    // Errores de ResizeObserver (comunes y no críticos)
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],
  
  // Configuración de release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  // Configuración de contexto inicial
  initialScope: {
    tags: {
      component: "frontend",
      framework: "nextjs",
    },
  },
});

