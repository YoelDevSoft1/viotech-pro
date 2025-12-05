/**
 * Health Check Endpoint mejorado
 * 
 * Verifica el estado de todos los componentes críticos del sistema:
 * - Frontend (siempre OK si el endpoint responde)
 * - Backend API
 * - Base de datos (si es accesible desde frontend)
 * - Storage (si es accesible desde frontend)
 */

import { NextResponse } from "next/server";

interface HealthCheck {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  message?: string;
  [key: string]: unknown;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    frontend: HealthCheck;
    backend: HealthCheck;
    version: string;
    environment: string;
  };
  timestamp: string;
}

async function checkBackend(): Promise<HealthCheck> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://viotech-main.onrender.com";
  // Intentar diferentes rutas de health check
  const healthUrls = [
    `${backendUrl}/api/health`,
    `${backendUrl}/health`,
    `${backendUrl}/api/status`,
  ];

  let lastError: Error | null = null;

  // Intentar cada URL hasta que una funcione
  for (const healthUrl of healthUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Si no es 200, continuar con la siguiente URL
        lastError = new Error(`Backend responded with status ${response.status}`);
        continue;
      }

      const data = await response.json().catch(() => null);
      
      // Intentar obtener el status de diferentes formatos posibles de respuesta
      const backendStatus = 
        data?.status || 
        data?.data?.status || 
        data?.health?.status ||
        data?.state ||
        "unknown";

      const statusLower = String(backendStatus).toLowerCase();
      const isHealthy = ["ok", "up", "ready", "healthy", "operational"].includes(statusLower);

      // Si el backend responde con 200 pero no tenemos un status claro, 
      // asumimos que está OK si la respuesta es válida
      const finalStatus = isHealthy 
        ? "ok" 
        : data !== null && response.ok 
          ? "ok" // Si responde 200 y tiene datos, asumimos OK aunque no tenga status explícito
          : "degraded";

      return {
        status: finalStatus,
        timestamp: new Date().toISOString(),
        message: data?.message || data?.data?.message || (finalStatus === "ok" ? "Backend is responding" : `Backend status: ${backendStatus}`),
        details: {
          ...data,
          detectedStatus: backendStatus,
          httpStatus: response.status,
          healthUrl: healthUrl,
        },
      };
    } catch (error) {
      // Guardar el error y continuar con la siguiente URL
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // Si ninguna URL funcionó, retornar error
  if (lastError) {
    const errorMessage = lastError.message;
    
    // Si es un aborto por timeout, es degradado, no down
    if (errorMessage.includes("aborted") || errorMessage.includes("timeout")) {
      return {
        status: "degraded",
        timestamp: new Date().toISOString(),
        message: "Backend timeout (possible cold start)",
      };
    }

    return {
      status: "down",
      timestamp: new Date().toISOString(),
      message: `Backend unreachable: ${errorMessage}`,
    };
  }

  // Fallback si no hay error pero tampoco respuesta
  return {
    status: "down",
    timestamp: new Date().toISOString(),
    message: "Backend unreachable: No response from any health endpoint",
  };
}

export async function GET() {
  const checks = {
    frontend: {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      message: "Frontend is operational",
    },
    backend: await checkBackend(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || "development",
  };

  // Determinar estado general
  const allOk = checks.backend.status === "ok";
  const anyDown = checks.backend.status === "down";
  
  const overallStatus: "healthy" | "degraded" | "unhealthy" = anyDown
    ? "unhealthy"
    : allOk
    ? "healthy"
    : "degraded";

  const response: HealthResponse = {
    status: overallStatus,
    checks,
    timestamp: new Date().toISOString(),
  };

  // Retornar código de estado HTTP apropiado
  const httpStatus = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}

