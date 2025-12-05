"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type {
  ProjectAnalysis,
  ProjectAnalysisHistory,
  RiskAnalysis,
} from "@/lib/types/project-monitor";

const BASE_URL = "/project-monitor";

/**
 * Hook para obtener el análisis actual de un proyecto específico
 */
export function useProjectAnalysisQuery(projectId: string | undefined) {
  return useQuery<ProjectAnalysis | null>({
    queryKey: ["project-monitor", "analysis", "current", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      try {
        const { data } = await apiClient.post(`${BASE_URL}/analyze/${projectId}`);
        return data?.data || data;
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        // Si es 403, el usuario no tiene permisos
        if (axiosError?.response?.status === 403) {
          throw new Error("No tienes permisos para ver este proyecto");
        }
        // Si es 404, devolver datos mock
        if (axiosError?.response?.status === 404) {
          return getMockAnalysis(projectId);
        }
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
    refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos
  });
}

/**
 * Hook para obtener el historial de análisis de un proyecto
 */
export function useProjectAnalysisHistory(
  projectId: string | undefined,
  limit: number = 10
) {
  return useQuery<RiskAnalysis[]>({
    queryKey: ["project-monitor", "analysis", "history", projectId, limit],
    queryFn: async () => {
      if (!projectId) return [];
      try {
        const { data } = await apiClient.get<{ data: ProjectAnalysisHistory }>(
          `${BASE_URL}/analysis/${projectId}`,
          { params: { limit } }
        );
        return data?.data?.analysis || [];
      } catch (error: unknown) {
        const axiosError = error as { response?: { status?: number } };
        // Si es 403, el usuario no tiene permisos
        if (axiosError?.response?.status === 403) {
          throw new Error("No tienes permisos para ver este proyecto");
        }
        // Si es 404, devolver datos mock
        if (axiosError?.response?.status === 404) {
          return getMockHistory(projectId);
        }
        throw error;
      }
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
}

/**
 * Hook para ejecutar análisis manual de un proyecto
 */
export function useAnalyzeProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await apiClient.post(`${BASE_URL}/analyze/${projectId}`);
      return data?.data || data;
    },
    onSuccess: (data, projectId) => {
      // Actualizar cache del análisis actual
      queryClient.setQueryData(
        ["project-monitor", "analysis", "current", projectId],
        data
      );
      // Invalidar historial para refrescar
      queryClient.invalidateQueries({
        queryKey: ["project-monitor", "analysis", "history", projectId],
      });
      toast.success("Análisis completado");
    },
    onError: (error: Error) => {
      const message = error.message || "Error al analizar el proyecto";
      toast.error(message);
    },
  });
}

/**
 * Hook combinado para análisis de proyecto
 */
export function useProjectAnalysis(projectId: string | undefined) {
  const analysisQuery = useProjectAnalysisQuery(projectId);
  const historyQuery = useProjectAnalysisHistory(projectId);
  const analyzeMutation = useAnalyzeProject();

  const refresh = () => {
    analysisQuery.refetch();
    historyQuery.refetch();
  };

  return {
    // Datos
    analysis: analysisQuery.data ?? null,
    history: historyQuery.data ?? [],
    
    // Estados
    isLoading: analysisQuery.isLoading || historyQuery.isLoading,
    isLoadingAnalysis: analysisQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
    error: analysisQuery.error?.message || historyQuery.error?.message || null,
    
    // Acciones
    analyze: (id?: string) => analyzeMutation.mutate(id || projectId || ""),
    refresh,
    
    // Estado de mutación
    isAnalyzing: analyzeMutation.isPending,
  };
}

// ============================================
// DATOS MOCK PARA DESARROLLO
// ============================================

function getMockAnalysis(projectId: string): ProjectAnalysis {
  const riskLevels = ["low", "medium", "high", "critical"] as const;
  const randomIndex = Math.floor(Math.random() * 4);
  const riskLevel = riskLevels[randomIndex];
  const riskScore = [0.2, 0.45, 0.7, 0.9][randomIndex];

  return {
    projectId,
    delayRisk: {
      riskScore,
      riskLevel,
      predictedDays: Math.floor(Math.random() * 30) + 10,
      estimatedRemaining: Math.floor(Math.random() * 25) + 5,
      confidence: 0.7 + Math.random() * 0.25,
      factors: {
        predictionMismatch: riskScore > 0.5,
        anomalies: riskScore > 0.3 ? Math.floor(Math.random() * 3) : 0,
        progressDelay: riskScore > 0.6,
        lowVelocity: riskScore > 0.4,
      },
    },
    anomalies: riskScore > 0.3 ? Math.floor(Math.random() * 5) : 0,
    status: "active",
  };
}

function getMockHistory(projectId: string): RiskAnalysis[] {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const riskScore = Math.max(0.1, Math.random() * 0.8 - i * 0.05);
    
    return {
      id: `analysis-${projectId}-${i}`,
      project_id: projectId,
      risk_score: riskScore,
      risk_level: riskScore > 0.7 ? "critical" : riskScore > 0.5 ? "high" : riskScore > 0.3 ? "medium" : "low",
      anomalies_count: Math.floor(Math.random() * 3),
      metrics: {
        avgProgress: 45 + Math.random() * 40,
        overdueTasks: Math.floor(Math.random() * 5),
        progressVelocity: 1.5 + Math.random() * 2,
        completionRatio: 0.3 + Math.random() * 0.5,
        blockageRatio: Math.random() * 0.2,
        activeTasksCount: Math.floor(Math.random() * 20) + 5,
        completedTasksCount: Math.floor(Math.random() * 30) + 10,
        totalTasksCount: Math.floor(Math.random() * 50) + 20,
      },
      analysis_data: {},
      created_at: date.toISOString(),
    };
  });
}

