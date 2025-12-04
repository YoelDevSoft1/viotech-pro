/**
 * Servicio para manejar analytics y tracking de eventos
 * Sprint 4.3 - VioTech Pro
 */

import { apiClient } from "@/lib/apiClient";

/**
 * Evento de analytics
 */
export interface AnalyticsEvent {
  eventType: string;
  eventName: string;
  properties?: Record<string, any>;
  sessionId?: string;
}

/**
 * Resumen de analytics (admin)
 */
export interface AnalyticsSummary {
  period: {
    start: string;
    end: string;
  };
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  topEvents: Array<{
    eventName: string;
    count: number;
  }>;
  eventsByDay: Array<{
    date: string;
    count: number;
  }>;
}

/**
 * Generar o recuperar session ID
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const stored = sessionStorage.getItem("analytics_session_id");
  if (stored) return stored;

  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem("analytics_session_id", newId);
  return newId;
}

/**
 * Servicio para gestionar analytics
 */
class AnalyticsService {
  /**
   * Registrar un evento de analytics
   * @param event Datos del evento
   */
  async trackEvent(event: AnalyticsEvent): Promise<boolean> {
    try {
      // Intentar enviar el evento sin autenticación (usando auth: false)
      await apiClient.post("/analytics/events", {
        eventType: event.eventType,
        eventName: event.eventName,
        properties: event.properties || {},
        sessionId: event.sessionId || getSessionId(),
      }, {
        auth: false, // Marcar como no autenticado para evitar errores
      } as any);
      return true;
    } catch (error: any) {
      // Silenciar errores de autenticación y otros errores para no interrumpir la UX
      // Solo loguear en desarrollo si no es un error de autenticación esperado
      if (process.env.NODE_ENV === 'development' && !error?.silent && error?.message !== 'UNAUTHENTICATED_ANALYTICS') {
        console.debug("Error trackeando evento (silenciado):", error);
      }
      return false;
    }
  }

  /**
   * Obtener resumen de analytics (solo admin)
   * @param options Opciones de filtrado
   */
  async getSummary(options?: {
    startDate?: string;
    endDate?: string;
    organizationId?: string;
  }): Promise<AnalyticsSummary | null> {
    try {
      const params = new URLSearchParams();
      if (options?.startDate) params.set("startDate", options.startDate);
      if (options?.endDate) params.set("endDate", options.endDate);
      if (options?.organizationId) params.set("organizationId", options.organizationId);

      const { data } = await apiClient.get<{ data: AnalyticsSummary }>(
        `/admin/analytics/summary?${params.toString()}`
      );
      return data.data;
    } catch (error) {
      console.error("Error obteniendo resumen de analytics:", error);
      return null;
    }
  }

  // Helpers para eventos comunes

  /**
   * Trackear page view
   */
  pageView(page: string, properties?: Record<string, any>): Promise<boolean> {
    return this.trackEvent({
      eventType: "page_view",
      eventName: `page_viewed_${page}`,
      properties: { page, ...properties },
    });
  }

  /**
   * Trackear click
   */
  click(element: string, properties?: Record<string, any>): Promise<boolean> {
    return this.trackEvent({
      eventType: "click",
      eventName: `click_${element}`,
      properties: { element, ...properties },
    });
  }

  /**
   * Trackear submit de formulario
   */
  formSubmit(
    formName: string,
    success: boolean,
    properties?: Record<string, any>
  ): Promise<boolean> {
    return this.trackEvent({
      eventType: "form_submit",
      eventName: `form_submit_${formName}`,
      properties: { formName, success, ...properties },
    });
  }

  /**
   * Trackear click de botón
   */
  buttonClick(
    buttonName: string,
    location: string,
    properties?: Record<string, any>
  ): Promise<boolean> {
    return this.trackEvent({
      eventType: "button_click",
      eventName: `button_click_${buttonName}`,
      properties: { buttonName, location, ...properties },
    });
  }

  /**
   * Trackear uso de feature
   */
  featureUsed(featureName: string, properties?: Record<string, any>): Promise<boolean> {
    return this.trackEvent({
      eventType: "feature_usage",
      eventName: `feature_used_${featureName}`,
      properties: { featureName, ...properties },
    });
  }
}

export const analyticsService = new AnalyticsService();

// Exportar helpers como objeto para compatibilidad
export const analytics = {
  pageView: (page: string, properties?: Record<string, any>) =>
    analyticsService.pageView(page, properties),
  click: (element: string, properties?: Record<string, any>) =>
    analyticsService.click(element, properties),
  formSubmit: (formName: string, success: boolean, properties?: Record<string, any>) =>
    analyticsService.formSubmit(formName, success, properties),
  buttonClick: (buttonName: string, location: string, properties?: Record<string, any>) =>
    analyticsService.buttonClick(buttonName, location, properties),
  featureUsed: (featureName: string, properties?: Record<string, any>) =>
    analyticsService.featureUsed(featureName, properties),
  trackEvent: (event: AnalyticsEvent) => analyticsService.trackEvent(event),
};

