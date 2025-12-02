/**
 * Configuración de Sentry para el servidor (Node.js)
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development",
  
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Filtrar eventos antes de enviarlos
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    // Filtrar errores conocidos/no críticos
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = String(error.message);
      
      // No enviar errores de endpoints no implementados
      if (errorMessage.includes('ENDPOINT_NOT_IMPLEMENTED')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Integración de tracing para el servidor
  integrations: [
    // nodeProfilingIntegration ya no está disponible en esta versión
    // Las integraciones de profiling se configuran automáticamente
  ],
  
  // Ignorar errores comunes del servidor
  ignoreErrors: [
    "ECONNREFUSED",
    "ENOTFOUND",
  ],
  
  release: process.env.NEXT_PUBLIC_APP_VERSION || undefined,
  
  initialScope: {
    tags: {
      component: "server",
      framework: "nextjs",
    },
  },
});

