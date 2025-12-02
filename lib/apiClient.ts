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

    // Si es un endpoint público, no agregar token
    if (isPublicEndpoint(config.url, config.method)) {
      return config;
    }

    // Asegurar que headers existe
    if (!config.headers) {
      config.headers = {} as any;
    }

    const token = await getValidToken();
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
      logger.warn("Request timeout", {
        endpoint: originalRequest?.url,
        method: originalRequest?.method,
        timeout: apiClient.defaults.timeout,
        apiError: true,
      });
      const timeoutMessage = "El servidor está tardando demasiado en responder. Esto puede deberse a un 'cold start' del servidor. Por favor, intenta nuevamente en unos segundos.";
      return Promise.reject(new Error(timeoutMessage));
    }

    // Manejo de errores de conexión (sin respuesta del servidor)
    if (!error.response && error.request) {
      logger.error("Connection error - no response from server", undefined, {
        endpoint: originalRequest?.url,
        method: originalRequest?.method,
        apiError: true,
      });
      const connectionMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta más tarde.";
      return Promise.reject(new Error(connectionMessage));
    }

    // Endpoints que pueden fallar silenciosamente (no implementados aún o pueden retornar errores esperados)
    const silentErrorEndpoints = [
      '/auth/me',
      '/blog/comments/pending',
      '/blog/comments/admin',
    ];
    const isSilentError = originalRequest?.url && 
      silentErrorEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    // Si es un endpoint que puede fallar silenciosamente, no mostrar error genérico
    if (isSilentError && (!error.response || error.response?.status === 404 || error.response?.status === 501)) {
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
      
      // Si es un endpoint público, permitir el error 401 sin intentar refrescar
      if (isPublicEndpoint(originalRequest.url)) {
        // Para endpoints públicos, un 401 puede ser válido (no requiere autenticación)
        // Pero si el backend retorna 401, puede ser un error de configuración
        // Devolver el error original sin modificar el mensaje
        const responseData = error.response?.data as any;
        const publicError = new Error(
          responseData?.error || 
          responseData?.message || 
          "El endpoint debería ser público pero requiere autenticación"
        ) as any;
        publicError.response = error.response;
        publicError.isAxiosError = true;
        return Promise.reject(publicError);
      }

      originalRequest._retry = true;

      // Verificar si hay un token antes de intentar refrescar
      const currentToken = getAccessToken();
      if (!currentToken) {
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
      
    return Promise.reject(new Error(errorMessage));
  }
);