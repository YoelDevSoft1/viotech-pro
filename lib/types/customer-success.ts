/**
 * Tipos para Customer Success y Health Scores
 * Sprint 4.4 - VioTech Pro
 */

/**
 * Niveles de riesgo de churn
 */
export type ChurnRiskLevel = "low" | "medium" | "high" | "critical";

/**
 * Tendencia del health score
 */
export type HealthTrend = "improving" | "stable" | "declining";

/**
 * Categorías de factores que afectan el health score
 */
export type HealthFactorCategory =
  | "engagement"      // Uso de la plataforma
  | "support"         // Interacciones de soporte
  | "payment"         // Historial de pagos
  | "product"         // Uso de features
  | "sentiment"       // NPS/Feedback
  | "lifecycle";      // Etapa del cliente

/**
 * Factor individual que afecta el health score
 */
export interface HealthFactor {
  id: string;
  category: HealthFactorCategory;
  name: string;
  description: string;
  /** Puntuación actual (0-100) */
  score: number;
  /** Peso del factor en el cálculo total (0-1) */
  weight: number;
  /** Tendencia del factor */
  trend: HealthTrend;
  /** Puntuación anterior para comparación */
  previousScore?: number;
  /** Último cálculo */
  lastCalculated: string;
  /** Sugerencias de mejora */
  suggestions?: string[];
}

/**
 * Health Score completo de un cliente/organización
 */
export interface CustomerHealthScore {
  id: string;
  /** ID de la organización */
  organizationId: string;
  /** Nombre de la organización */
  organizationName?: string;
  /** Score total (0-100) */
  score: number;
  /** Nivel de riesgo de churn */
  riskLevel: ChurnRiskLevel;
  /** Tendencia general */
  trend: HealthTrend;
  /** Score anterior */
  previousScore?: number;
  /** Cambio porcentual */
  changePercent?: number;
  /** Desglose por factores */
  factors: HealthFactor[];
  /** Fecha de última actualización */
  updatedAt: string;
  /** Fecha de creación */
  createdAt: string;
  /** Notas del CSM */
  notes?: string;
  /** ID del CSM asignado */
  csmId?: string;
  /** Próxima revisión programada */
  nextReviewDate?: string;
}

/**
 * Métricas agregadas de health scores
 */
export interface HealthScoreMetrics {
  /** Promedio general */
  averageScore: number;
  /** Distribución por nivel de riesgo */
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  /** Tendencia general de la base de clientes */
  overallTrend: HealthTrend;
  /** Total de clientes activos */
  totalCustomers: number;
  /** Clientes en riesgo crítico */
  criticalCount: number;
  /** Mejora promedio mes a mes */
  monthlyImprovement: number;
}

/**
 * Tipo de alerta de churn
 */
export type ChurnAlertType =
  | "no_login"           // Sin actividad de login
  | "low_engagement"     // Baja interacción
  | "support_issues"     // Problemas de soporte frecuentes
  | "payment_failed"     // Problemas de pago
  | "negative_feedback"  // Feedback negativo
  | "service_expiring"   // Servicio por expirar
  | "score_drop"         // Caída significativa de score
  | "competitor_mention" // Mención de competidores
  | "custom";            // Alerta personalizada

/**
 * Severidad de alerta
 */
export type AlertSeverity = "info" | "warning" | "urgent" | "critical";

/**
 * Estado de una alerta
 */
export type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";

/**
 * Alerta de churn
 */
export interface ChurnAlert {
  id: string;
  /** ID de la organización afectada */
  organizationId: string;
  /** Nombre de la organización */
  organizationName?: string;
  /** Tipo de alerta */
  type: ChurnAlertType;
  /** Severidad */
  severity: AlertSeverity;
  /** Estado actual */
  status: AlertStatus;
  /** Título de la alerta */
  title: string;
  /** Descripción detallada */
  description: string;
  /** Acción recomendada */
  recommendedAction?: string;
  /** Datos adicionales */
  metadata?: {
    /** Días sin actividad */
    daysSinceLastActivity?: number;
    /** Caída en score */
    scoreDrop?: number;
    /** ID del ticket relacionado */
    relatedTicketId?: string;
    /** Monto en riesgo */
    revenueAtRisk?: number;
    [key: string]: any;
  };
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
  /** Fecha de resolución */
  resolvedAt?: string;
  /** ID del usuario que resolvió */
  resolvedBy?: string;
  /** Notas de resolución */
  resolutionNotes?: string;
  /** Fecha de expiración del servicio relacionado */
  serviceExpiresAt?: string;
}

/**
 * Resumen de alertas de churn
 */
export interface ChurnAlertsSummary {
  total: number;
  byStatus: {
    active: number;
    acknowledged: number;
    resolved: number;
    dismissed: number;
  };
  bySeverity: {
    info: number;
    warning: number;
    urgent: number;
    critical: number;
  };
  recentAlerts: ChurnAlert[];
}

/**
 * Actividad de Customer Success
 */
export interface CSActivity {
  id: string;
  organizationId: string;
  type: "call" | "email" | "meeting" | "note" | "escalation" | "review";
  title: string;
  description?: string;
  outcome?: string;
  scheduledAt?: string;
  completedAt?: string;
  csmId: string;
  csmName?: string;
  createdAt: string;
}

/**
 * Playbook de Customer Success
 */
export interface CSPlaybook {
  id: string;
  name: string;
  description: string;
  /** Trigger que activa el playbook */
  trigger: {
    type: "score_drop" | "alert_type" | "lifecycle_stage" | "manual";
    condition?: string;
  };
  /** Pasos del playbook */
  steps: CSPlaybookStep[];
  /** Si está activo */
  isActive: boolean;
  /** Veces ejecutado */
  executionCount: number;
  /** Tasa de éxito */
  successRate?: number;
}

/**
 * Paso de un playbook
 */
export interface CSPlaybookStep {
  order: number;
  action: "email" | "call" | "task" | "escalation" | "notification";
  title: string;
  description: string;
  /** Días después del trigger */
  daysAfterTrigger: number;
  /** Template de email si aplica */
  emailTemplate?: string;
  /** Asignado a */
  assignTo?: "csm" | "sales" | "support" | "manager";
}

/**
 * Filtros para consultar health scores
 */
export interface HealthScoreFilters {
  organizationIds?: string[];
  riskLevels?: ChurnRiskLevel[];
  trends?: HealthTrend[];
  minScore?: number;
  maxScore?: number;
  csmId?: string;
  /** Incluir solo con alertas activas */
  hasActiveAlerts?: boolean;
  /** Ordenar por */
  sortBy?: "score" | "change" | "risk" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

/**
 * Filtros para consultar alertas
 */
export interface ChurnAlertFilters {
  organizationIds?: string[];
  types?: ChurnAlertType[];
  severities?: AlertSeverity[];
  statuses?: AlertStatus[];
  fromDate?: string;
  toDate?: string;
  sortBy?: "severity" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

