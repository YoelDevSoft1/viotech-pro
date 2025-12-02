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
  const healthUrl = `${backendUrl}/api/health`;

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
      return {
        status: "degraded",
        timestamp: new Date().toISOString(),
        message: `Backend responded with status ${response.status}`,
      };
    }

    const data = await response.json().catch(() => null);
    const backendStatus = data?.status || data?.data?.status || "unknown";

    return {
      status: ["ok", "up", "ready", "healthy"].includes(String(backendStatus).toLowerCase())
        ? "ok"
        : "degraded",
      timestamp: new Date().toISOString(),
      message: data?.message || "Backend is responding",
      details: data,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
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

