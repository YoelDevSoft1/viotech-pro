"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { MonitoringStatus } from "@/lib/types/project-monitor";

const BASE_URL = "/project-monitor";

/**
 * Hook para obtener el estado del monitoreo
 */
export function useMonitoringStatus() {
  return useQuery<MonitoringStatus>({
    queryKey: ["project-monitor", "status"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`${BASE_URL}/status`);
        return data?.data || data;
      } catch (error: unknown) {
        // Si el endpoint no existe, devolver estado por defecto
        const axiosError = error as { response?: { status?: number } };
        if (axiosError?.response?.status === 404) {
          return getDefaultStatus();
        }
        throw error;
      }
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 15000, // Cache por 15 segundos
  });
}

/**
 * Hook para iniciar el monitoreo (solo admin)
 */
export function useStartMonitoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intervalMinutes: number = 15) => {
      const { data } = await apiClient.post(`${BASE_URL}/start`, {
        intervalMinutes,
      });
      return data?.data || data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["project-monitor", "status"], data);
      toast.success("Monitoreo iniciado correctamente");
    },
    onError: (error: Error) => {
      const message = error.message || "Error al iniciar el monitoreo";
      toast.error(message);
    },
  });
}

/**
 * Hook para detener el monitoreo (solo admin)
 */
export function useStopMonitoring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`${BASE_URL}/stop`);
      return data?.data || data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["project-monitor", "status"], data);
      toast.success("Monitoreo detenido");
    },
    onError: (error: Error) => {
      const message = error.message || "Error al detener el monitoreo";
      toast.error(message);
    },
  });
}

/**
 * Hook para ejecutar análisis de todos los proyectos (solo admin)
 */
export function useAnalyzeAllProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`${BASE_URL}/analyze-all`);
      return data?.data || data;
    },
    onSuccess: () => {
      // Invalidar análisis de proyectos para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["project-monitor", "analysis"] });
      toast.success("Análisis masivo iniciado correctamente");
    },
    onError: (error: Error) => {
      const message = error.message || "Error al iniciar el análisis masivo";
      toast.error(message);
    },
  });
}

/**
 * Hook combinado para todas las operaciones de monitoreo
 */
export function useProjectMonitor() {
  const statusQuery = useMonitoringStatus();
  const startMutation = useStartMonitoring();
  const stopMutation = useStopMonitoring();
  const analyzeAllMutation = useAnalyzeAllProjects();

  return {
    // Estado
    status: statusQuery.data ?? null,
    isLoading: statusQuery.isLoading,
    error: statusQuery.error?.message ?? null,
    
    // Acciones
    startMonitoring: startMutation.mutate,
    stopMonitoring: stopMutation.mutate,
    analyzeAll: analyzeAllMutation.mutate,
    refresh: statusQuery.refetch,
    
    // Estados de mutación
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isAnalyzingAll: analyzeAllMutation.isPending,
    isMutating: startMutation.isPending || stopMutation.isPending || analyzeAllMutation.isPending,
  };
}

// ============================================
// DATOS POR DEFECTO
// ============================================

function getDefaultStatus(): MonitoringStatus {
  return {
    isMonitoring: false,
    lastCheck: [],
    alertHistory: [],
  };
}
