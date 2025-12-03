/**
 * API Route para recibir métricas de Core Web Vitals
 * Envía métricas al backend principal o las almacena localmente
 */

import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
}

export async function POST(request: Request) {
  try {
    const metric: WebVitalMetric = await request.json();

    // Validar que la métrica tenga los campos requeridos
    if (!metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // Log estructurado
    logger.info("Web Vital metric received", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      webVital: true,
    });

    // Opcional: Enviar al backend principal
    // Si tienes un endpoint en el backend para métricas:
    /*
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (backendUrl) {
      try {
        await fetch(`${backendUrl}/api/metrics/web-vitals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Si requiere auth
          },
          body: JSON.stringify(metric),
        });
      } catch (error) {
        logger.warn("Error sending metric to backend", error);
      }
    }
    */

    // Por ahora, solo loggeamos y retornamos éxito
    // En el futuro, podrías almacenar en una base de datos o servicio de métricas
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Error processing Web Vital metric", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


