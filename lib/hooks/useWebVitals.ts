/**
 * Hook para tracking de Core Web Vitals
 * Envía métricas a Sentry y opcionalmente al backend
 */

"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from "web-vitals";
import { logger } from "@/lib/logger";

// Tipos para las métricas
type WebVitalMetric = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
  navigationType: string;
};

/**
 * Determina el rating de una métrica según los umbrales de Google
 */
function getMetricRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  // Thresholds basados en Core Web Vitals de Google
  // https://web.dev/vitals/#core-web-vitals
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 }, // Reemplaza FID desde 2024
  };

  const threshold = thresholds[name];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Envía métricas a Sentry si está disponible
 */
async function sendToSentry(metric: WebVitalMetric) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return; // Sentry no está configurado
  }

  try {
    const Sentry = await import("@sentry/nextjs");
    
    // Crear un transaction event para la métrica
    Sentry.metrics.distribution(`web_vital.${metric.name.toLowerCase()}`, metric.value, {
      tags: {
        rating: metric.rating,
        navigation_type: metric.navigationType,
      },
      unit: metric.name === "CLS" ? "ratio" : "millisecond",
    });

    // Si la métrica es pobre, crear un issue
    if (metric.rating === "poor") {
      Sentry.captureMessage(`Poor Web Vital: ${metric.name}`, {
        level: "warning",
        tags: {
          web_vital: metric.name,
          rating: metric.rating,
        },
        extra: {
          value: metric.value,
          delta: metric.delta,
          navigationType: metric.navigationType,
        },
      });
    }

    // También log estructurado para debugging
    logger.info(`Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigationType: metric.navigationType,
      webVital: true,
    });
  } catch (error) {
    // Sentry no disponible, solo loggear
    logger.debug(`Sentry no disponible para Web Vitals: ${metric.name}`);
  }
}

/**
 * Envía métricas al backend (opcional)
 */
async function sendToBackend(metric: WebVitalMetric) {
  try {
    const response = await fetch("/api/metrics/web-vitals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        timestamp: Date.now(),
        url: typeof window !== "undefined" ? window.location.href : "",
      }),
    });

    if (!response.ok) {
      logger.warn(`Error enviando Web Vital al backend: ${metric.name}`, {
        status: response.status,
      });
    }
  } catch (error) {
    // Fallar silenciosamente, no es crítico
    logger.debug(`Backend no disponible para Web Vitals: ${metric.name}`);
  }
}

/**
 * Procesa una métrica de Web Vitals
 */
function handleMetric(metric: Metric) {
  const webVital: WebVitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || "navigate",
  };

  // Enviar a Sentry
  sendToSentry(webVital);

  // Enviar al backend (opcional, solo en producción)
  if (process.env.NODE_ENV === "production") {
    sendToBackend(webVital);
  }

  // Log en desarrollo para debugging
  if (process.env.NODE_ENV === "development") {
    const emoji = webVital.rating === "good" ? "✅" : webVital.rating === "needs-improvement" ? "⚠️" : "❌";
    console.log(
      `${emoji} ${webVital.name}: ${Math.round(webVital.value)}ms (${webVital.rating})`
    );
  }
}

/**
 * Hook para trackear Core Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    // Trackear todas las métricas de Core Web Vitals
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    
    // INP (Interaction to Next Paint) - reemplaza FID desde 2024
    // Disponible desde Chrome 96+
    onINP(handleMetric);
  }, []);
}

