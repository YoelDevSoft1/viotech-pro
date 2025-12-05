/**
 * Tipos para el sistema de Analytics de VioTech Pro
 */

// ============================================
// EVENTOS DE TRACKING
// ============================================

/**
 * Categorías de eventos
 */
export type EventCategory =
  | "engagement"
  | "feature_usage"
  | "conversion"
  | "error"
  | "performance";

/**
 * Eventos de engagement (usuarios)
 */
export type EngagementEvent =
  | "user_signup"
  | "user_login"
  | "user_logout"
  | "user_onboarding_step"
  | "user_onboarding_complete"
  | "session_start"
  | "session_end"
  | "page_view";

/**
 * Eventos de uso de features
 */
export type FeatureUsageEvent =
  | "ticket_created"
  | "ticket_updated"
  | "ticket_resolved"
  | "ticket_commented"
  | "project_created"
  | "project_updated"
  | "project_milestone_completed"
  | "report_generated"
  | "report_exported"
  | "service_viewed"
  | "service_purchased"
  | "notification_enabled"
  | "notification_disabled"
  | "search_performed"
  | "filter_applied";

/**
 * Eventos de conversión
 */
export type ConversionEvent =
  | "trial_started"
  | "trial_converted"
  | "subscription_created"
  | "subscription_upgraded"
  | "subscription_downgraded"
  | "subscription_cancelled"
  | "payment_completed"
  | "payment_failed";

/**
 * Eventos de error
 */
export type ErrorEvent =
  | "error_displayed"
  | "form_validation_error"
  | "form_abandoned"
  | "api_error"
  | "search_no_results"
  | "feature_blocked";

/**
 * Todos los tipos de eventos
 */
export type AnalyticsEventType =
  | EngagementEvent
  | FeatureUsageEvent
  | ConversionEvent
  | ErrorEvent;

/**
 * Propiedades base de un evento
 */
export interface BaseEventProperties {
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  organizationId?: string;
  page?: string;
  referrer?: string;
  device?: "desktop" | "tablet" | "mobile";
  browser?: string;
  locale?: string;
}

/**
 * Propiedades específicas por tipo de evento
 */
export interface EventPropertiesMap {
  // Engagement
  user_signup: { source?: string; plan?: string; referralCode?: string };
  user_login: { method: "email" | "google" | "microsoft" };
  user_logout: { sessionDuration?: number };
  user_onboarding_step: { stepName: string; stepNumber: number; completed: boolean };
  user_onboarding_complete: { durationSeconds: number; stepsCompleted: number };
  session_start: { isReturning: boolean };
  session_end: { durationSeconds: number; pagesViewed: number };
  page_view: { pagePath: string; pageTitle: string };

  // Feature usage
  ticket_created: { priority?: string; type?: string; hasAttachments?: boolean };
  ticket_updated: { ticketId: string; fieldsChanged: string[] };
  ticket_resolved: { ticketId: string; resolutionTimeHours: number; satisfactionScore?: number };
  ticket_commented: { ticketId: string; isInternal: boolean };
  project_created: { templateUsed?: string; teamSize?: number };
  project_updated: { projectId: string; fieldsChanged: string[] };
  project_milestone_completed: { projectId: string; milestoneName: string };
  report_generated: { reportType: string; dateRange: string };
  report_exported: { reportType: string; format: "pdf" | "excel" | "csv" };
  service_viewed: { serviceId: string; serviceName: string };
  service_purchased: { serviceId: string; amount: number; currency: string };
  notification_enabled: { channel: "push" | "email" | "inApp" };
  notification_disabled: { channel: "push" | "email" | "inApp" };
  search_performed: { query: string; resultsCount: number };
  filter_applied: { filterType: string; filterValue: string };

  // Conversion
  trial_started: { plan: string; trialDays: number };
  trial_converted: { plan: string; trialDurationDays: number };
  subscription_created: { plan: string; billingCycle: "monthly" | "annual" };
  subscription_upgraded: { fromPlan: string; toPlan: string };
  subscription_downgraded: { fromPlan: string; toPlan: string };
  subscription_cancelled: { reason?: string; tenureDays: number };
  payment_completed: { amount: number; currency: string; method: string };
  payment_failed: { amount: number; errorCode?: string };

  // Error
  error_displayed: { errorCode: string; errorMessage: string; isFatal: boolean };
  form_validation_error: { formName: string; fieldName: string; errorType: string };
  form_abandoned: { formName: string; lastField: string; completionPercent: number };
  api_error: { endpoint: string; statusCode: number; errorMessage?: string };
  search_no_results: { query: string };
  feature_blocked: { feature: string; requiredPlan: string; currentPlan: string };
}

/**
 * Evento de analytics tipado
 */
export interface AnalyticsEvent<T extends AnalyticsEventType = AnalyticsEventType> {
  event: T;
  properties: BaseEventProperties & (T extends keyof EventPropertiesMap ? EventPropertiesMap[T] : Record<string, unknown>);
  category: EventCategory;
}

// ============================================
// MÉTRICAS Y KPIS
// ============================================

/**
 * Métricas de engagement
 */
export interface EngagementMetrics {
  /** Usuarios activos diarios */
  dau: number;
  /** Usuarios activos semanales */
  wau: number;
  /** Usuarios activos mensuales */
  mau: number;
  /** Ratio DAU/MAU (stickiness) */
  stickiness: number;
  /** Sesiones totales */
  totalSessions: number;
  /** Duración promedio de sesión (segundos) */
  avgSessionDuration: number;
  /** Páginas por sesión */
  pagesPerSession: number;
  /** Tasa de rebote */
  bounceRate: number;
}

/**
 * Métricas de onboarding
 */
export interface OnboardingMetrics {
  /** Tasa de inicio */
  startRate: number;
  /** Tasa de completación */
  completionRate: number;
  /** Tiempo promedio para completar (segundos) */
  avgTimeToComplete: number;
  /** Drop-off por paso */
  dropOffByStep: Record<string, number>;
  /** Time to first value (segundos) */
  timeToFirstValue: number;
}

/**
 * Métricas de features
 */
export interface FeatureMetrics {
  /** Adopción por feature (% de usuarios) */
  adoptionRate: Record<string, number>;
  /** Features más usadas */
  topFeatures: Array<{ feature: string; usage: number }>;
  /** Frecuencia de uso por feature */
  usageFrequency: Record<string, number>;
}

/**
 * Métricas de conversión
 */
export interface ConversionMetrics {
  /** Tasa de conversión de trial */
  trialConversionRate: number;
  /** Tasa de upgrade */
  upgradeRate: number;
  /** Tasa de churn mensual */
  monthlyChurnRate: number;
  /** Revenue mensual recurrente */
  mrr: number;
  /** Revenue promedio por usuario */
  arpu: number;
  /** Lifetime value promedio */
  ltv: number;
}

/**
 * Métricas de errores
 */
export interface ErrorMetrics {
  /** Tasa de error total */
  errorRate: number;
  /** Errores por tipo */
  errorsByType: Record<string, number>;
  /** Forms abandonados */
  formAbandonmentRate: number;
  /** Búsquedas sin resultados */
  noResultsRate: number;
}

/**
 * Dashboard analytics completo
 */
export interface AnalyticsDashboard {
  period: {
    start: string;
    end: string;
    comparison?: {
      start: string;
      end: string;
    };
  };
  engagement: EngagementMetrics;
  onboarding: OnboardingMetrics;
  features: FeatureMetrics;
  conversion: ConversionMetrics;
  errors: ErrorMetrics;
  /** Tendencias (cambio vs período anterior) */
  trends: {
    dau: number;
    sessions: number;
    avgSessionDuration: number;
    conversionRate: number;
  };
}

// ============================================
// TIEMPO REAL
// ============================================

/**
 * Métricas en tiempo real
 */
export interface RealtimeMetrics {
  /** Usuarios activos ahora */
  activeUsers: number;
  /** Páginas más vistas (últimos 30 min) */
  topPages: Array<{ page: string; views: number }>;
  /** Eventos por minuto */
  eventsPerMinute: number;
  /** Países activos */
  activeCountries: Array<{ country: string; users: number }>;
}

// ============================================
// FILTROS Y CONFIGURACIÓN
// ============================================

/**
 * Filtros para analytics
 */
export interface AnalyticsFilters {
  period: "today" | "7d" | "30d" | "90d" | "custom";
  customRange?: {
    start: string;
    end: string;
  };
  organizationId?: string;
  segment?: string;
  compareWith?: "previous_period" | "previous_year" | "none";
}

/**
 * Configuración de privacidad de analytics
 */
export interface AnalyticsPrivacySettings {
  /** Analytics de uso habilitado */
  usageAnalyticsEnabled: boolean;
  /** Performance monitoring habilitado */
  performanceMonitoringEnabled: boolean;
  /** Error tracking habilitado */
  errorTrackingEnabled: boolean;
  /** Compartir datos anonimizados para mejoras */
  shareAnonymousData: boolean;
}


