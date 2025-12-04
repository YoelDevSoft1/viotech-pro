/**
 * Tipos para Customer Success de VioTech Pro
 */

// ============================================
// HEALTH SCORE
// ============================================

/**
 * Estado de salud del cliente
 */
export type HealthStatus = "healthy" | "stable" | "at_risk" | "critical";

/**
 * Tendencia del health score
 */
export type HealthTrend = "improving" | "stable" | "declining";

/**
 * Componente de engagement del health score
 */
export interface HealthEngagementComponent {
  score: number;
  metrics: {
    /** % de días activos en los últimos 30 */
    dauRatio: number;
    /** Tiempo promedio de sesión (minutos) */
    avgSessionTime: number;
    /** Frecuencia de login (veces/semana) */
    loginFrequency: number;
    /** Último login (ISO string) */
    lastLogin: string | null;
  };
}

/**
 * Componente de adopción del health score
 */
export interface HealthAdoptionComponent {
  score: number;
  metrics: {
    /** Features activas / Features disponibles */
    featureAdoptionRate: number;
    /** Detalle por feature */
    features: {
      tickets: boolean;
      projects: boolean;
      reports: boolean;
      notifications: boolean;
      team: boolean;
      integrations: boolean;
    };
  };
}

/**
 * Componente de outcomes del health score
 */
export interface HealthOutcomesComponent {
  score: number;
  metrics: {
    /** % de tickets resueltos en SLA */
    ticketResolutionRate: number;
    /** % de cumplimiento de SLA */
    slaCompliance: number;
    /** % de proyectos completados */
    projectCompletionRate: number;
    /** Tiempo promedio de resolución (horas) */
    avgResolutionTime: number;
  };
}

/**
 * Componente de satisfacción del health score
 */
export interface HealthSatisfactionComponent {
  score: number;
  metrics: {
    /** Net Promoter Score (-100 a 100) */
    nps: number | null;
    /** Customer Satisfaction Score (1-5) */
    csat: number | null;
    /** Tickets de soporte abiertos */
    openSupportTickets: number;
    /** Fecha última encuesta */
    lastSurveyDate: string | null;
  };
}

/**
 * Componente de crecimiento del health score
 */
export interface HealthGrowthComponent {
  score: number;
  metrics: {
    /** Crecimiento de usuarios MoM */
    userGrowthMoM: number;
    /** Crecimiento de uso MoM */
    usageGrowthMoM: number;
    /** Expansión de revenue */
    revenueExpansion: number;
  };
}

/**
 * Health Score completo
 */
export interface CustomerHealthScore {
  /** Puntaje general (0-100) */
  overall: number;
  /** Estado basado en el puntaje */
  status: HealthStatus;
  /** Tendencia */
  trend: HealthTrend;
  /** Cambio vs período anterior */
  change: number;
  /** Componentes del score */
  components: {
    engagement: HealthEngagementComponent;
    adoption: HealthAdoptionComponent;
    outcomes: HealthOutcomesComponent;
    satisfaction: HealthSatisfactionComponent;
    growth: HealthGrowthComponent;
  };
  /** Última actualización */
  lastUpdated: string;
  /** Próximos pasos sugeridos */
  suggestions: string[];
}

/**
 * Pesos de cada componente del health score
 */
export interface HealthScoreWeights {
  engagement: number;
  adoption: number;
  outcomes: number;
  satisfaction: number;
  growth: number;
}

/**
 * Configuración por defecto de pesos
 */
export const DEFAULT_HEALTH_SCORE_WEIGHTS: HealthScoreWeights = {
  engagement: 0.30,
  adoption: 0.25,
  outcomes: 0.25,
  satisfaction: 0.10,
  growth: 0.10,
};

// ============================================
// ALERTAS DE CUSTOMER SUCCESS
// ============================================

/**
 * Tipo de alerta de CS
 */
export type CSAlertType =
  | "inactivity"
  | "health_drop"
  | "sla_breach"
  | "feature_unused"
  | "trial_ending"
  | "payment_failed"
  | "churn_risk"
  | "expansion_opportunity";

/**
 * Severidad de la alerta
 */
export type CSAlertSeverity = "low" | "medium" | "high" | "critical";

/**
 * Estado de la alerta
 */
export type CSAlertStatus = "new" | "acknowledged" | "in_progress" | "resolved" | "dismissed";

/**
 * Alerta de Customer Success
 */
export interface CSAlert {
  id: string;
  type: CSAlertType;
  severity: CSAlertSeverity;
  status: CSAlertStatus;
  /** ID de la organización afectada */
  organizationId: string;
  /** Nombre de la organización */
  organizationName: string;
  /** Título de la alerta */
  title: string;
  /** Descripción detallada */
  description: string;
  /** Señales que dispararon la alerta */
  signals: string[];
  /** Acción sugerida */
  suggestedAction: string;
  /** Datos adicionales */
  metadata: {
    healthScore?: number;
    healthChange?: number;
    lastLogin?: string;
    daysInactive?: number;
    mrr?: number;
    plan?: string;
    [key: string]: unknown;
  };
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última actualización */
  updatedAt: string;
  /** CSM asignado */
  assignedTo?: string;
  /** Notas */
  notes?: string;
}

/**
 * Triggers de alertas
 */
export interface CSAlertTriggers {
  /** Días sin login para alerta de inactividad */
  inactivityDays: {
    warning: number;
    critical: number;
  };
  /** Caída de health score para alerta */
  healthDropThreshold: number;
  /** Breaches de SLA por semana */
  slaBreachesPerWeek: number;
  /** Días sin usar feature core */
  featureUnusedDays: number;
  /** Días antes de fin de trial */
  trialEndingDays: number;
}

/**
 * Configuración por defecto de triggers
 */
export const DEFAULT_ALERT_TRIGGERS: CSAlertTriggers = {
  inactivityDays: {
    warning: 7,
    critical: 14,
  },
  healthDropThreshold: 15,
  slaBreachesPerWeek: 3,
  featureUnusedDays: 30,
  trialEndingDays: 3,
};

// ============================================
// SUCCESS PLANS
// ============================================

/**
 * Estado de un hito
 */
export type MilestoneStatus = "pending" | "in_progress" | "completed" | "skipped";

/**
 * Hito de un success plan
 */
export interface SuccessPlanMilestone {
  id: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  tasks: Array<{
    id: string;
    name: string;
    completed: boolean;
  }>;
}

/**
 * Tipo de success plan
 */
export type SuccessPlanType = "onboarding" | "adoption" | "expansion" | "recovery" | "custom";

/**
 * Success Plan
 */
export interface SuccessPlan {
  id: string;
  organizationId: string;
  organizationName: string;
  type: SuccessPlanType;
  name: string;
  description?: string;
  /** Objetivo principal */
  mainGoal: string;
  /** CSM asignado */
  csmId: string;
  csmName: string;
  /** Fechas */
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  /** Estado */
  status: "active" | "completed" | "paused" | "cancelled";
  /** Progreso (0-100) */
  progress: number;
  /** Hitos */
  milestones: SuccessPlanMilestone[];
  /** Métricas objetivo */
  targetMetrics: {
    healthScore?: number;
    dauTarget?: number;
    slaCompliance?: number;
    [key: string]: number | undefined;
  };
  /** Métricas actuales */
  currentMetrics: {
    healthScore?: number;
    dau?: number;
    slaCompliance?: number;
    [key: string]: number | undefined;
  };
  /** Notas de seguimiento */
  notes: Array<{
    id: string;
    date: string;
    author: string;
    content: string;
    nextAction?: string;
  }>;
  /** Fechas de auditoría */
  createdAt: string;
  updatedAt: string;
}

/**
 * Template de success plan
 */
export interface SuccessPlanTemplate {
  id: string;
  type: SuccessPlanType;
  name: string;
  description: string;
  durationDays: number;
  milestones: Array<{
    name: string;
    description?: string;
    dayOffset: number;
    tasks: Array<{
      name: string;
    }>;
  }>;
  targetMetrics: Record<string, number>;
}

// ============================================
// QBR (Quarterly Business Review)
// ============================================

/**
 * Datos para QBR
 */
export interface QBRData {
  organizationId: string;
  organizationName: string;
  period: {
    quarter: string;
    year: number;
  };
  /** Resumen ejecutivo */
  executiveSummary: {
    healthScore: number;
    healthTrend: HealthTrend;
    keyWins: string[];
    challenges: string[];
    opportunities: string[];
  };
  /** Métricas del período */
  metrics: {
    usageStats: {
      activeUsers: number;
      sessionsTotal: number;
      ticketsCreated: number;
      ticketsResolved: number;
      projectsCompleted: number;
    };
    performance: {
      slaCompliance: number;
      avgResolutionTime: number;
      customerSatisfaction: number;
    };
    adoption: {
      featuresUsed: number;
      featuresAvailable: number;
      newFeaturesAdopted: string[];
    };
  };
  /** Valor entregado */
  valueDelivered: {
    timeSaved: number;
    costReduction: number;
    efficiencyGain: number;
    customMetrics: Record<string, number>;
  };
  /** Próximos pasos */
  nextSteps: Array<{
    action: string;
    owner: string;
    dueDate: string;
  }>;
  /** Roadmap relevante */
  upcomingFeatures: Array<{
    feature: string;
    expectedDate: string;
    relevance: string;
  }>;
}
