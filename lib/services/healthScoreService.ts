/**
 * Servicio para manejar health scores y customer success
 * Sprint 4.4 - VioTech Pro
 */

import { apiClient } from "@/lib/apiClient";

/**
 * Health Score de una organización
 */
export interface HealthScore {
  id: string;
  organization_id: string;
  score: number; // 0-100
  risk_level: "low" | "medium" | "high" | "critical";
  factors: {
    activeUsers: number; // 0-100
    activeProjects: number; // 0-100
    ticketResponseTime: number; // 0-100
    ticketResolutionRate: number; // 0-100
    paymentStatus: number; // 0-100
    engagement: number; // 0-100
  };
  calculated_at: string; // ISO 8601
  calculated_by: string; // 'system' | userId
  notes?: string;
  created_at: string;
}

/**
 * Alerta de churn
 */
export interface ChurnAlert {
  id: string;
  organization_id: string;
  score: number;
  risk_level: "high" | "critical";
  factors: HealthScore["factors"];
  organization: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
  };
  calculated_at: string;
}

/**
 * Respuesta del endpoint de health score
 */
interface HealthScoreResponse {
  data: {
    healthScore: HealthScore;
  };
}

/**
 * Respuesta del endpoint de churn alerts
 */
interface ChurnAlertsResponse {
  data: {
    alerts: ChurnAlert[];
  };
}

/**
 * Servicio para gestionar health scores y customer success
 */
class HealthScoreService {
  /**
   * Obtener health score de una organización
   * @param organizationId ID de la organización
   */
  async getOrganizationHealth(organizationId: string): Promise<HealthScore | null> {
    try {
      const { data } = await apiClient.get<HealthScoreResponse>(
        `/organizations/${organizationId}/health`
      );
      return data.data.healthScore;
    } catch (error: any) {
      // Si es 404 o 400, el health score no está calculado aún o no hay suficiente actividad
      // 400 generalmente significa "No hay suficiente actividad para calcular el Health Score"
      // 404 significa que el health score no existe
      const status = error.response?.status;
      const errorMessage = error.message || error.response?.data?.message || error.response?.data?.error || "";
      const isInsufficientActivity = error.isInsufficientActivity || 
        error.silent ||
        error.__suppressConsole ||
        error.name === 'SilentError' ||
        (status === 400 && (
          errorMessage.toLowerCase().includes('insuficiente actividad') ||
          errorMessage.toLowerCase().includes('no hay suficiente actividad') ||
          errorMessage.toLowerCase().includes('se requiere al menos')
        ));
      
      // Si es un error de "insuficiente actividad" o 404/400, retornar null silenciosamente
      // Estos son casos válidos, no errores reales
      // IMPORTANTE: Capturar el error aquí antes de que se propague a React Query
      if (status === 404 || status === 400 || isInsufficientActivity) {
        // No loguear, no mostrar en consola, no propagar el error
        // Simplemente retornar null como un estado válido
        // Esto evita que React Query lo trate como un error y lo muestre en la consola
        return null;
      }
      
      // Solo loguear errores inesperados (500, 401, 403, etc.)
      // Pero solo si no está marcado como silent
      if (!error.silent && !error.isInsufficientActivity && !error.__suppressConsole && error.name !== 'SilentError') {
        console.error("Error obteniendo health score:", error);
      }
      
      // Solo lanzar errores reales que no sean silenciosos
      if (!error.silent && !error.isInsufficientActivity && !error.__suppressConsole && error.name !== 'SilentError') {
        throw error;
      }
      
      // Si es silencioso, retornar null (no lanzar error)
      return null;
    }
  }

  /**
   * Obtener alertas de churn (solo admin)
   * @param limit Límite de alertas a retornar
   */
  async getChurnAlerts(limit: number = 50): Promise<ChurnAlert[]> {
    try {
      const { data } = await apiClient.get<ChurnAlertsResponse>(
        `/admin/customer-success/alerts`,
        {
          params: { limit },
        }
      );
      return data.data.alerts;
    } catch (error) {
      console.error("Error obteniendo alertas de churn:", error);
      throw error;
    }
  }
}

export const healthScoreService = new HealthScoreService();


