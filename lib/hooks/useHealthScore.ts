"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  CustomerHealthScore,
  HealthStatus,
  CSAlert,
  CSAlertStatus,
  CSAlertType,
  SuccessPlan,
  SuccessPlanTemplate,
  QBRData,
} from "@/lib/types/customerSuccess";

// ============================================
// HEALTH SCORE
// ============================================

/**
 * Hook para obtener el health score de una organización
 */
export function useHealthScore(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["customer-success", "health-score", organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      
      const { healthScoreService } = await import("@/lib/services/healthScoreService");
      return await healthScoreService.getOrganizationHealth(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener health scores de múltiples organizaciones
 */
export function useHealthScoresList(filters?: {
  status?: HealthStatus;
  limit?: number;
  sortBy?: "score" | "change" | "name";
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["customer-success", "health-scores", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.limit) params.set("limit", filters.limit.toString());
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);

      const { data } = await apiClient.get<{
        data: Array<CustomerHealthScore & { organizationId: string; organizationName: string }>;
      }>(`/customer-success/health-scores?${params.toString()}`);
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener historial de health score
 */
export function useHealthScoreHistory(
  organizationId: string | undefined,
  period: "30d" | "90d" | "1y" = "90d"
) {
  return useQuery({
    queryKey: ["customer-success", "health-score-history", organizationId, period],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      
      const { data } = await apiClient.get<{
        data: Array<{
          date: string;
          score: number;
          components: CustomerHealthScore["components"];
        }>;
      }>(`/customer-success/health-score/${organizationId}/history?period=${period}`);
      return data.data;
    },
    enabled: !!organizationId,
    staleTime: 10 * 60 * 1000,
  });
}

// ============================================
// ALERTAS DE CUSTOMER SUCCESS
// ============================================

/**
 * Hook para obtener alertas de CS
 */
export function useCSAlerts(filters?: {
  status?: CSAlertStatus;
  severity?: string;
  type?: CSAlertType;
  organizationId?: string;
  assignedTo?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["customer-success", "alerts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.severity) params.set("severity", filters.severity);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.organizationId) params.set("organizationId", filters.organizationId);
      if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
      if (filters?.limit) params.set("limit", filters.limit.toString());

      const { data } = await apiClient.get<{ data: CSAlert[] }>(
        `/customer-success/alerts?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });
}

/**
 * Hook para estadísticas de alertas
 */
export function useCSAlertStats() {
  return useQuery({
    queryKey: ["customer-success", "alerts", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: {
          total: number;
          byStatus: Record<CSAlertStatus, number>;
          bySeverity: Record<string, number>;
          byType: Record<CSAlertType, number>;
        };
      }>("/customer-success/alerts/stats");
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para actualizar estado de una alerta
 */
export function useUpdateCSAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alertId,
      updates,
    }: {
      alertId: string;
      updates: Partial<Pick<CSAlert, "status" | "assignedTo" | "notes">>;
    }) => {
      const { data } = await apiClient.patch(`/customer-success/alerts/${alertId}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-success", "alerts"] });
    },
  });
}

/**
 * Hook para descartar una alerta
 */
export function useDismissCSAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await apiClient.patch(`/customer-success/alerts/${alertId}`, {
        status: "dismissed",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-success", "alerts"] });
    },
  });
}

// ============================================
// SUCCESS PLANS
// ============================================

/**
 * Hook para obtener success plans
 */
export function useSuccessPlans(filters?: {
  organizationId?: string;
  status?: string;
  type?: string;
  csmId?: string;
}) {
  return useQuery({
    queryKey: ["customer-success", "plans", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organizationId) params.set("organizationId", filters.organizationId);
      if (filters?.status) params.set("status", filters.status);
      if (filters?.type) params.set("type", filters.type);
      if (filters?.csmId) params.set("csmId", filters.csmId);

      const { data } = await apiClient.get<{ data: SuccessPlan[] }>(
        `/customer-success/plans?${params.toString()}`
      );
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener un success plan específico
 */
export function useSuccessPlan(planId: string | undefined) {
  return useQuery({
    queryKey: ["customer-success", "plans", planId],
    queryFn: async () => {
      if (!planId) throw new Error("Plan ID required");
      
      const { data } = await apiClient.get<{ data: SuccessPlan }>(
        `/customer-success/plans/${planId}`
      );
      return data.data;
    },
    enabled: !!planId,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook para crear un success plan
 */
export function useCreateSuccessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      plan: Omit<SuccessPlan, "id" | "createdAt" | "updatedAt" | "progress">
    ) => {
      const { data } = await apiClient.post("/customer-success/plans", plan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-success", "plans"] });
    },
  });
}

/**
 * Hook para actualizar un success plan
 */
export function useUpdateSuccessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      planId,
      updates,
    }: {
      planId: string;
      updates: Partial<SuccessPlan>;
    }) => {
      const { data } = await apiClient.patch(`/customer-success/plans/${planId}`, updates);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["customer-success", "plans"] });
      queryClient.invalidateQueries({
        queryKey: ["customer-success", "plans", variables.planId],
      });
    },
  });
}

/**
 * Hook para templates de success plans
 */
export function useSuccessPlanTemplates() {
  return useQuery({
    queryKey: ["customer-success", "plan-templates"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: SuccessPlanTemplate[] }>(
        "/customer-success/plan-templates"
      );
      return data.data;
    },
    staleTime: Infinity, // Los templates cambian poco
  });
}

/**
 * Hook para crear plan desde template
 */
export function useCreatePlanFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      organizationId,
      csmId,
      csmName,
      mainGoal,
    }: {
      templateId: string;
      organizationId: string;
      csmId: string;
      csmName: string;
      mainGoal: string;
    }) => {
      const { data } = await apiClient.post("/customer-success/plans/from-template", {
        templateId,
        organizationId,
        csmId,
        csmName,
        mainGoal,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-success", "plans"] });
    },
  });
}

// ============================================
// QBR (Quarterly Business Review)
// ============================================

/**
 * Hook para obtener datos de QBR
 */
export function useQBRData(organizationId: string | undefined, quarter: string, year: number) {
  return useQuery({
    queryKey: ["customer-success", "qbr", organizationId, quarter, year],
    queryFn: async () => {
      if (!organizationId) throw new Error("Organization ID required");
      
      const { data } = await apiClient.get<{ data: QBRData }>(
        `/customer-success/qbr/${organizationId}?quarter=${quarter}&year=${year}`
      );
      return data.data;
    },
    enabled: !!organizationId,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook para generar reporte QBR
 */
export function useGenerateQBR() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      quarter,
      year,
      format,
    }: {
      organizationId: string;
      quarter: string;
      year: number;
      format: "pdf" | "pptx";
    }) => {
      const { data } = await apiClient.post(
        `/customer-success/qbr/${organizationId}/generate`,
        { quarter, year, format },
        { responseType: "blob" }
      );
      return data;
    },
  });
}

export default useHealthScore;

