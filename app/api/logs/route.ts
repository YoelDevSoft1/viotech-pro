/**
 * Endpoint para recibir logs del frontend y centralizarlos
 * 
 * Este endpoint recibe logs críticos (error/fatal) del frontend
 * y los puede procesar, almacenar o enviar a un servicio de logging.
 * 
 * Por ahora, solo registra en consola del servidor, pero puede extenderse
 * para enviar a servicios como Datadog, LogRocket, o almacenar en DB.
 */

import { NextRequest, NextResponse } from "next/server";

interface LogEntry {
  level: "error" | "fatal";
  message: string;
  context?: {
    userId?: string;
    organizationId?: string;
    route?: string;
    endpoint?: string;
    method?: string;
    status?: number;
    userAgent?: string;
    url?: string;
    [key: string]: unknown;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json();

    // Validar que sea un log crítico (error o fatal)
    if (logEntry.level !== "error" && logEntry.level !== "fatal") {
      return NextResponse.json(
        { error: "Only error and fatal logs are accepted" },
        { status: 400 }
      );
    }

    // Log en consola del servidor con formato estructurado
    const logMessage = {
      level: logEntry.level.toUpperCase(),
      message: logEntry.message,
      timestamp: logEntry.timestamp,
      context: logEntry.context,
      error: logEntry.error,
      source: "frontend",
    };

    // En desarrollo, mostrar en consola de forma legible
    if (process.env.NODE_ENV === "development") {
      console.error("[FRONTEND LOG]", JSON.stringify(logMessage, null, 2));
    } else {
      // En producción, log estructurado (puede ser capturado por servicios de logging)
      console.error(JSON.stringify(logMessage));
    }

    // TODO: Extender esto para:
    // - Enviar a servicio de logging externo (Datadog, LogRocket, etc.)
    // - Almacenar en base de datos para análisis
    // - Enviar alertas si es un error crítico
    // - Agrupar errores similares

    // Si es un error de autenticación, puede ser útil trackearlo
    if (logEntry.context?.authEvent) {
      // Aquí podrías enviar métricas o alertas
    }

    // Si es un error de API, puede ser útil para monitoreo
    if (logEntry.context?.apiError) {
      // Aquí podrías trackear tasas de error de API
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    // Si hay error al procesar el log, no fallar silenciosamente
    // pero tampoco exponer información sensible
    console.error("[LOG ENDPOINT ERROR]", error);
    return NextResponse.json(
      { error: "Failed to process log entry" },
      { status: 500 }
    );
  }
}

