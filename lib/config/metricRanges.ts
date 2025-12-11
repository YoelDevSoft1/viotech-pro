/**
 * Configuración centralizada de rangos para métricas del dashboard
 * VALIDACIÓN C2.1: Textos ("Crítico", "Excelente", etc.) ligados a rangos claros
 */

export type MetricStatus = "excelente" | "bueno" | "regular" | "critico" | "sin_datos";

export interface MetricRangeConfig {
  label: string;
  color: string;
  bgColor: string;
  min: number;
  max: number;
}

/**
 * Configuración de rangos para SLA Compliance (0-100)
 */
export const SLA_RANGES: Record<MetricStatus, MetricRangeConfig> = {
  excelente: {
    label: "Excelente",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    min: 95,
    max: 100,
  },
  bueno: {
    label: "Bueno",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    min: 85,
    max: 94.99,
  },
  regular: {
    label: "Regular",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    min: 70,
    max: 84.99,
  },
  critico: {
    label: "Crítico",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    min: 0,
    max: 69.99,
  },
  sin_datos: {
    label: "Sin datos",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    min: -Infinity,
    max: -Infinity,
  },
};

/**
 * Configuración de rangos para Health Score (0-30)
 */
export const HEALTH_SCORE_RANGES: Record<MetricStatus, MetricRangeConfig> = {
  excelente: {
    label: "Excelente",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    min: 24,
    max: 30,
  },
  bueno: {
    label: "Bueno",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    min: 18,
    max: 23.99,
  },
  regular: {
    label: "Regular",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    min: 12,
    max: 17.99,
  },
  critico: {
    label: "Crítico",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    min: 0,
    max: 11.99,
  },
  sin_datos: {
    label: "Sin datos",
    color: "text-muted-foreground",
    bgColor: "bg-muted/10",
    min: -Infinity,
    max: -Infinity,
  },
};

/**
 * Obtiene el status de una métrica según su valor
 */
export function getMetricStatus(
  value: number | null | undefined,
  ranges: Record<MetricStatus, MetricRangeConfig>
): MetricStatus {
  if (value == null || isNaN(value)) {
    return "sin_datos";
  }

  // Buscar el rango que contiene el valor
  for (const [status, config] of Object.entries(ranges)) {
    if (status === "sin_datos") continue;
    if (value >= config.min && value <= config.max) {
      return status as MetricStatus;
    }
  }

  return "sin_datos";
}

/**
 * Obtiene la configuración de un status
 */
export function getMetricConfig(
  status: MetricStatus,
  ranges: Record<MetricStatus, MetricRangeConfig>
): MetricRangeConfig {
  return ranges[status] || ranges.sin_datos;
}

/**
 * Obtiene el status y configuración de SLA Compliance
 */
export function getSLAStatus(value: number | null | undefined) {
  const status = getMetricStatus(value, SLA_RANGES);
  return {
    status,
    ...getMetricConfig(status, SLA_RANGES),
  };
}

/**
 * Obtiene el status y configuración de Health Score
 */
export function getHealthScoreStatus(value: number | null | undefined) {
  const status = getMetricStatus(value, HEALTH_SCORE_RANGES);
  return {
    status,
    ...getMetricConfig(status, HEALTH_SCORE_RANGES),
  };
}
