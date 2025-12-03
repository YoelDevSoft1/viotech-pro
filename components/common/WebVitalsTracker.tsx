/**
 * Componente para trackear Core Web Vitals
 * Se integra automáticamente con Sentry
 */

"use client";

import { useWebVitals } from "@/lib/hooks/useWebVitals";

export function WebVitalsTracker() {
  useWebVitals();
  return null; // Este componente no renderiza nada
}


