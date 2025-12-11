"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type {
  CustomerHealthScore,
  HealthScoreMetrics,
  ChurnAlert,
  ChurnAlertsSummary,
  HealthScoreFilters,
  ChurnAlertFilters,
  AlertStatus,
} from "@/lib/types/customer-success";

/**
 * Hook para obtener el health score de una organización específica
 */
export function useCustomerHealthScore(organizationId: string | undefined) {
  return useQuery<CustomerHealthScore | null>({
    queryKey: ["customer-health", "score", organizationId],
    queryFn: async () => {
      if (!organizationId) return null;
      try {
        const { data } = await apiClient.get(`/customer-success/health/${organizationId}`);
        return data?.data || data || null;
      } catch (error: any) {
        // Si el endpoint no existe, devolver datos mock
        if (error?.response?.status === 404) {
          return getMockHealthScore(organizationId);
        }
        throw error;
      }
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener la lista de health scores con filtros
 */
export function useCustomerHealthScores(filters?: HealthScoreFilters) {
  return useQuery<CustomerHealthScore[]>({
    queryKey: ["customer-health", "scores", filters],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/customer-success/health", {
          params: filters,
        });
        return data?.data || data || [];
      } catch (error: any) {
        // Si el endpoint no existe, devolver datos mock
        if (error?.response?.status === 404) {
          return getMockHealthScores();
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener métricas agregadas de health scores
 */
export function useHealthScoreMetrics() {
  return useQuery<HealthScoreMetrics>({
    queryKey: ["customer-health", "metrics"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/customer-success/metrics");
        return data?.data || data;
      } catch (error: any) {
        // Si el endpoint no existe, devolver datos mock
        if (error?.response?.status === 404) {
          return getMockMetrics();
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para obtener alertas de churn
 */
export function useChurnAlerts(filters?: ChurnAlertFilters) {
  return useQuery<ChurnAlert[]>({
    queryKey: ["customer-health", "alerts", filters],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/customer-success/alerts", {
          params: filters,
        });
        return data?.data || data || [];
      } catch (error: any) {
        // Si el endpoint no existe, devolver datos mock
        if (error?.response?.status === 404) {
          return getMockChurnAlerts();
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

/**
 * Hook para obtener resumen de alertas
 */
export function useChurnAlertsSummary() {
  return useQuery<ChurnAlertsSummary>({
    queryKey: ["customer-health", "alerts-summary"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/customer-success/alerts/summary");
        return data?.data || data;
      } catch (error: any) {
        // Si el endpoint no existe, devolver datos mock
        if (error?.response?.status === 404) {
          return getMockAlertsSummary();
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook para actualizar el estado de una alerta
 */
export function useUpdateAlertStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      status,
      notes,
    }: {
      alertId: string;
      status: AlertStatus;
      notes?: string;
    }) => {
      const { data } = await apiClient.patch(`/customer-success/alerts/${alertId}`, {
        status,
        resolutionNotes: notes,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-health", "alerts"] });
      queryClient.invalidateQueries({ queryKey: ["customer-health", "alerts-summary"] });
      toast.success("Alerta actualizada");
    },
    onError: () => {
      toast.error("Error al actualizar la alerta");
    },
  });
}

/**
 * Hook para agregar notas a un health score
 */
export function useAddHealthScoreNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      note,
    }: {
      organizationId: string;
      note: string;
    }) => {
      const { data } = await apiClient.post(
        `/customer-success/health/${organizationId}/notes`,
        { note }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["customer-health", "score", variables.organizationId],
      });
      toast.success("Nota agregada");
    },
    onError: () => {
      toast.error("Error al agregar la nota");
    },
  });
}

// ============================================
// DATOS MOCK PARA DESARROLLO
// ============================================

function getMockHealthScore(organizationId: string): CustomerHealthScore {
  return {
    id: `health-${organizationId}`,
    organizationId,
    organizationName: "Organización Demo",
    score: 75,
    riskLevel: "medium",
    trend: "stable",
    previousScore: 72,
    changePercent: 4.17,
    factors: [
      {
        id: "f1",
        category: "engagement",
        name: "Actividad de Login",
        description: "Frecuencia de acceso a la plataforma",
        score: 85,
        weight: 0.25,
        trend: "improving",
        previousScore: 78,
        lastCalculated: new Date().toISOString(),
        suggestions: ["Continuar enviando emails de engagement"],
      },
      {
        id: "f2",
        category: "support",
        name: "Satisfacción de Soporte",
        description: "Calificación de tickets resueltos",
        score: 70,
        weight: 0.2,
        trend: "stable",
        previousScore: 70,
        lastCalculated: new Date().toISOString(),
        suggestions: ["Reducir tiempo de primera respuesta"],
      },
      {
        id: "f3",
        category: "payment",
        name: "Historial de Pagos",
        description: "Pagos a tiempo y método",
        score: 95,
        weight: 0.2,
        trend: "stable",
        previousScore: 95,
        lastCalculated: new Date().toISOString(),
      },
      {
        id: "f4",
        category: "product",
        name: "Uso de Features",
        description: "Adopción de funcionalidades",
        score: 60,
        weight: 0.2,
        trend: "declining",
        previousScore: 68,
        lastCalculated: new Date().toISOString(),
        suggestions: [
          "Agendar demo de features avanzados",
          "Enviar guías de casos de uso",
        ],
      },
      {
        id: "f5",
        category: "sentiment",
        name: "NPS Score",
        description: "Net Promoter Score del cliente",
        score: 65,
        weight: 0.15,
        trend: "stable",
        previousScore: 65,
        lastCalculated: new Date().toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function getMockHealthScores(): CustomerHealthScore[] {
  return [
    { ...getMockHealthScore("org-1"), organizationName: "TechCorp S.A.S", score: 92, riskLevel: "low", trend: "improving" },
    { ...getMockHealthScore("org-2"), organizationName: "MediSalud", score: 78, riskLevel: "medium", trend: "stable" },
    { ...getMockHealthScore("org-3"), organizationName: "LogiExpress", score: 45, riskLevel: "high", trend: "declining" },
    { ...getMockHealthScore("org-4"), organizationName: "FinanceGroup", score: 85, riskLevel: "low", trend: "stable" },
    { ...getMockHealthScore("org-5"), organizationName: "RetailMax", score: 32, riskLevel: "critical", trend: "declining" },
  ];
}

function getMockMetrics(): HealthScoreMetrics {
  return {
    averageScore: 68,
    riskDistribution: {
      low: 42,
      medium: 35,
      high: 18,
      critical: 5,
    },
    overallTrend: "stable",
    totalCustomers: 100,
    criticalCount: 5,
    monthlyImprovement: 2.3,
  };
}

function getMockChurnAlerts(): ChurnAlert[] {
  return [
    {
      id: "alert-1",
      organizationId: "org-5",
      organizationName: "RetailMax",
      type: "score_drop",
      severity: "critical",
      status: "active",
      title: "Caída crítica de health score",
      description: "El health score cayó 25 puntos en los últimos 30 días",
      recommendedAction: "Agendar llamada urgente con el cliente",
      metadata: {
        scoreDrop: 25,
        revenueAtRisk: 15000,
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "alert-2",
      organizationId: "org-3",
      organizationName: "LogiExpress",
      type: "no_login",
      severity: "urgent",
      status: "active",
      title: "Sin actividad por 14 días",
      description: "Ningún usuario de la organización ha iniciado sesión en 14 días",
      recommendedAction: "Enviar email de re-engagement",
      metadata: {
        daysSinceLastActivity: 14,
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "alert-3",
      organizationId: "org-2",
      organizationName: "MediSalud",
      type: "service_expiring",
      severity: "warning",
      status: "acknowledged",
      title: "Servicio expira en 15 días",
      description: "El plan Premium expira el 19 de diciembre",
      recommendedAction: "Iniciar proceso de renovación",
      serviceExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "alert-4",
      organizationId: "org-6",
      organizationName: "DataInnovate",
      type: "support_issues",
      severity: "warning",
      status: "active",
      title: "Múltiples tickets de soporte",
      description: "5 tickets abiertos en la última semana, 2 escalados",
      recommendedAction: "Revisar tickets y coordinar con soporte",
      metadata: {
        relatedTicketId: "TKT-456",
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getMockAlertsSummary(): ChurnAlertsSummary {
  const alerts = getMockChurnAlerts();
  return {
    total: alerts.length,
    byStatus: {
      active: 3,
      acknowledged: 1,
      resolved: 0,
      dismissed: 0,
    },
    bySeverity: {
      info: 0,
      warning: 2,
      urgent: 1,
      critical: 1,
    },
    recentAlerts: alerts.slice(0, 3),
  };
}




