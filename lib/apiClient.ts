import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "./auth";
import { logger } from "./logger";

// --- CONFIGURACIÓN DE LA URL (CORREGIDA) ---

// 1. Leemos la variable exacta que tienes en tu .env.local
const envUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

// 2. Lógica para construir la URL base:
// Si existe la variable, usamos esa. Si no, fallback a localhost.
// IMPORTANTE: Le agregamos "/api" al final porque en Render la URL base suele ser solo el dominio.
const baseURL = envUrl 
  ? `${envUrl}/api`  // Resultado: https://viotech-main.onrender.com/api
  : "http://localhost:3000/api";


export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos - Render puede ser lento al despertar (Cold Start)
});

const getValidToken = async (): Promise<string | null> => {
  let token = getAccessToken();
  if (!token) return null;
  
  if (isTokenExpired(token)) {
    try {
      token = await refreshAccessToken();
      if (token) {
        logger.debug("Token refreshed successfully", { source: "getValidToken" });
      }
    } catch (error) {
      logger.warn("Failed to refresh token", { source: "getValidToken", error });
      return null;
    }
  }
  return token;
};

// Lista de endpoints públicos que NO requieren autenticación
// IMPORTANTE: Solo endpoints específicos, no usar includes() para evitar falsos positivos
const PUBLIC_ENDPOINTS = [
  '/blog/posts?', // Lista de posts (GET con query params)
  '/blog/categories', // Categorías
  '/blog/tags', // Tags
  '/blog/newsletter/subscribe', // Newsletter
  '/analytics/events', // Analytics - puede funcionar sin autenticación
];

// Endpoints que son públicos solo si son GET (lectura)
const PUBLIC_GET_PATTERNS = [
  /^\/blog\/posts\/[^\/]+$/, // GET /blog/posts/:slug (post individual)
  /^\/blog\/posts\/[^\/]+\/comments$/, // GET /blog/posts/:slug/comments (comentarios públicos)
];

const isPublicEndpoint = (url: string | undefined, method?: string): boolean => {
  if (!url) return false;
  
  // Verificar endpoints exactos
  if (PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint))) {
    return true;
  }
  
  // Verificar patrones GET públicos (solo lectura)
  if (method === 'get' || !method) {
    return PUBLIC_GET_PATTERNS.some(pattern => pattern.test(url));
  }
  
  return false;
};

// Interceptor de REQUEST
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Si está marcado explícitamente como no autenticado, no agregar token
    if ((config as any).auth === false) return config;

    // Asegurar que headers existe
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Obtener token si está disponible
    const token = await getValidToken();
    
    // Si es un endpoint público, agregar token solo si está disponible (auth opcional)
    // Esto permite asociar eventos con usuarios cuando hay sesión activa
    if (isPublicEndpoint(config.url, config.method)) {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }

    // Para endpoints privados, el token es requerido
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Si es FormData, no establecer Content-Type (axios lo hace automáticamente)
    // Esto permite que axios establezca el boundary correcto para multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    // DEBUG: Ver URL final en consola (solo en desarrollo)
    // const fullUrl = `${config.baseURL || ""}${config.url}`;
    // logger.debug(`Request: ${fullUrl}`, { method: config.method });
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de RESPONSE
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Endpoints que pueden fallar silenciosamente (definir al inicio para uso en múltiples lugares)
    const silentErrorEndpoints = [
      '/auth/me',
      '/blog/comments/pending',
      '/blog/comments/admin',
      '/analytics/events', // Analytics puede funcionar sin autenticación
    ];

    // Endpoints que sabemos que no están implementados aún - silenciar 404
    const nonImplementedEndpoints = ['/activity/recent'];
    const isNonImplemented = originalRequest?.url && 
      nonImplementedEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    // Si es un 404 de un endpoint no implementado, devolvemos un error especial que será manejado silenciosamente
    if (error.response?.status === 404 && isNonImplemented) {
      logger.debug("Non-implemented endpoint accessed", { 
        endpoint: originalRequest?.url,
        method: originalRequest?.method 
      });
      // Crear un error especial que será capturado y manejado silenciosamente
      const silentError = new Error('ENDPOINT_NOT_IMPLEMENTED') as any;
      silentError.response = error.response;
      silentError.isAxiosError = true;
      return Promise.reject(silentError);
    }

    // Manejo específico de errores de timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      // Verificar si es un endpoint silencioso antes de loguear
      const isSilentTimeout = originalRequest?.url && 
        silentErrorEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
      
      if (!isSilentTimeout) {
        logger.warn("Request timeout", {
          endpoint: originalRequest?.url,
          method: originalRequest?.method,
          timeout: apiClient.defaults.timeout,
          apiError: true,
        });
      }
      
      const timeoutMessage = "El servidor está tardando demasiado en responder. Esto puede deberse a un 'cold start' del servidor. Por favor, intenta nuevamente en unos segundos.";
      const timeoutError = new Error(timeoutMessage) as any;
      timeoutError.silent = isSilentTimeout;
      return Promise.reject(timeoutError);
    }

    // Manejo de errores de conexión (sin respuesta del servidor)
    if (!error.response && error.request) {
      // Verificar si es un endpoint que puede fallar silenciosamente (como analytics)
      const isAnalyticsEndpoint = originalRequest?.url?.includes('/analytics/events');
      const isSilentConnectionError = isAnalyticsEndpoint || 
        (originalRequest?.url && silentErrorEndpoints.some(endpoint => originalRequest.url?.includes(endpoint)));
      
      // Si es un endpoint silencioso, crear un error silencioso sin logging
      if (isSilentConnectionError) {
        const silentError = new Error('CONNECTION_ERROR_SILENT') as any;
        silentError.isAxiosError = true;
        silentError.silent = true;
        return Promise.reject(silentError);
      }
      
      // Para otros endpoints, loguear el error normalmente
      logger.error("Connection error - no response from server", undefined, {
        endpoint: originalRequest?.url,
        method: originalRequest?.method,
        apiError: true,
      });
      const connectionMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.";
      return Promise.reject(new Error(connectionMessage));
    }

    // Manejar errores 401 de endpoints públicos ANTES de cualquier otro procesamiento
    // Esto es especialmente importante para analytics que puede funcionar sin autenticación
    if (error.response?.status === 401 && originalRequest) {
      const isAnalyticsEndpoint = originalRequest.url?.includes('/analytics/events');
      const isPublicEndpointRequest = isPublicEndpoint(originalRequest.url, originalRequest.method);
      
      // Si es analytics o un endpoint público, manejar silenciosamente
      if (isAnalyticsEndpoint || isPublicEndpointRequest) {
        // Crear un error silencioso que será manejado por el servicio sin logging
        const silentError = new Error('UNAUTHENTICATED_PUBLIC_ENDPOINT') as any;
        silentError.response = error.response;
        silentError.isAxiosError = true;
        silentError.silent = true; // Marcar como silencioso para evitar logging
        return Promise.reject(silentError);
      }
    }

    // Verificar si es un endpoint que puede fallar silenciosamente
    const isSilentError = originalRequest?.url && 
      silentErrorEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    // Si es un endpoint que puede fallar silenciosamente, no mostrar error genérico
    if (isSilentError && (!error.response || error.response?.status === 404 || error.response?.status === 501 || error.response?.status === 401)) {
      // Devolver el error original para que el hook lo maneje silenciosamente
      return Promise.reject(error);
    }
    
    // Si recibimos 401 (Token inválido/expirado) del backend
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Endpoints que pueden retornar 401 de forma esperada (no mostrar error al usuario)
      const silent401Endpoints = ['/auth/me'];
      const isSilent401 = originalRequest?.url && 
        silent401Endpoints.some(endpoint => originalRequest.url?.includes(endpoint));
      
      // Si es un endpoint que puede retornar 401 silenciosamente, no modificar el error
      if (isSilent401) {
        // Devolver el error original para que el hook lo maneje silenciosamente
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Verificar si hay un token antes de intentar refrescar
      const currentToken = getAccessToken();
      if (!currentToken) {
        // Si es un endpoint público o analytics, permitir que falle silenciosamente
        const isAnalyticsEndpoint = originalRequest?.url?.includes('/analytics/events');
        const isPublicEndpointRequest = isPublicEndpoint(originalRequest.url, originalRequest.method);
        
        if (isAnalyticsEndpoint || isPublicEndpointRequest) {
          // Crear un error especial que será manejado silenciosamente por el servicio
          const silentError = new Error('UNAUTHENTICATED_PUBLIC_ENDPOINT') as any;
          silentError.response = error.response;
          silentError.isAxiosError = true;
          silentError.silent = true; // Marcar como silencioso
          return Promise.reject(silentError);
        }
        return Promise.reject(new Error("No autenticado. Por favor, inicia sesión."));
      }

      try {
        logger.info("Attempting to refresh token after 401", { 
          endpoint: originalRequest?.url,
          authEvent: true,
        });
        const newToken = await refreshAccessToken();
        if (newToken) {
          logger.info("Token refreshed successfully, retrying request", {
            endpoint: originalRequest?.url,
            authEvent: true,
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        logger.error("Token refresh failed, logging out user", refreshError, {
          endpoint: originalRequest?.url,
          authEvent: true,
        });
        // Si el refresh falla, limpiar tokens pero no redirigir automáticamente
        // Dejar que cada componente maneje el error según su contexto
        await logout();
        if (typeof window !== "undefined") {
           // window.location.href = "/login"; // Descomentar para forzar redirect
        }
        return Promise.reject(new Error("Sesión expirada."));
      }
    }

    // Mensaje de error personalizado según el código de estado
    let errorMessage = "Error de conexión con el servidor.";
    
    if (error.response?.status === 500) {
      errorMessage = "Error interno del servidor. Por favor, intenta más tarde.";
    } else if (error.response?.status === 503) {
      errorMessage = "El servidor no está disponible temporalmente. Por favor, intenta más tarde.";
    } else if (error.response?.status === 504) {
      errorMessage = "El servidor tardó demasiado en responder. Por favor, intenta nuevamente.";
    } else if (error.response?.data) {
      errorMessage = 
        (error.response.data as any)?.message || 
        (error.response.data as any)?.error || 
        errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Logging de errores de API según severidad
    const status = error.response?.status;
    const endpoint = originalRequest?.url || 'unknown';
    const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';

    // Detectar errores de "insuficiente actividad" para health score ANTES de procesar
    // Estos son casos válidos, no errores reales
    const isHealthScoreInsufficientActivity = 
      endpoint?.includes('/health') && 
      status === 400 && 
      (errorMessage?.toLowerCase().includes('insuficiente actividad') || 
       errorMessage?.toLowerCase().includes('no hay suficiente actividad') ||
       errorMessage?.toLowerCase().includes('se requiere al menos'));
    
    if (isHealthScoreInsufficientActivity) {
      // Marcar como silent para que no se loguee ni se muestre en consola
      (error as any).silent = true;
      (error as any).isInsufficientActivity = true;
      
      // Crear un error silencioso que no se mostrará en consola
      const silentError = new Error(errorMessage);
      (silentError as any).silent = true;
      (silentError as any).isInsufficientActivity = true;
      (silentError as any).response = error.response;
      // No loguear ni mostrar este error - es un caso válido
      return Promise.reject(silentError);
    }

    // No loguear errores silenciosos (marcados con error.silent = true)
    if ((error as any)?.silent) {
      const silentError = new Error(errorMessage);
      (silentError as any).silent = true;
      (silentError as any).isInsufficientActivity = (error as any).isInsufficientActivity || false;
      (silentError as any).response = error.response;
      return Promise.reject(silentError);
    }

    if (!status || status >= 500) {
      // Errores del servidor - críticos
      logger.error(
        `API Server Error: ${method} ${endpoint} - ${status || 'NO_STATUS'}`,
        error,
        {
          endpoint,
          method,
          status: status || 0,
          apiError: true,
        }
      );
    } else if (status >= 400 && status < 500 && status !== 401 && status !== 404) {
      // Errores del cliente (excepto 401 y 404 ya manejados)
      // No loguear errores 400 relacionados con "insuficiente actividad" para health score
      // ya que son casos válidos, no errores reales (ya fueron marcados como silent arriba)
      if (!isHealthScoreInsufficientActivity) {
        logger.warn(
          `API Client Error: ${method} ${endpoint} - ${status}`,
          {
            endpoint,
            method,
            status,
            apiError: true,
          }
        );
      }
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);