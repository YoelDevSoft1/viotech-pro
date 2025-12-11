"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supportApi, Agent } from "@/lib/api/support";
import { AxiosError } from "axios";

// Re-exportar tipo para compatibilidad
export type SupportAgent = Agent;

export function useSupportAgents(filters?: { status?: string; role?: string }) {
  const query = useQuery({
    queryKey: ["support-agents", filters],
    queryFn: async () => {
      try {
        const agents = await supportApi.getAgents(filters);
        return Array.isArray(agents) ? agents : [];
      } catch (error) {
        // Si es un error 500, retornar array vacío en lugar de lanzar
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 500) {
          // Backend no disponible - retornar array vacío para que la UI funcione
          return [] as Agent[];
        }
        throw error;
      }
    },
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      // No hacer retry en errores 500 (problema del servidor)
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 500) {
        return false;
      }
      // Retry máximo 1 vez para otros errores
      return failureCount < 1;
    },
    retryDelay: 1000,
    // Valor inicial por defecto
    initialData: [],
  });

  // Asegurar que siempre sea un array
  const agents = Array.isArray(query.data) ? query.data : [];

  // Agrupar agentes por estado
  const onlineAgents = useMemo(
    () => agents.filter((agent) => agent.status === "online"),
    [agents]
  );

  const offlineAgents = useMemo(
    () => agents.filter((agent) => agent.status === "offline"),
    [agents]
  );

  const awayAgents = useMemo(
    () => agents.filter((agent) => agent.status === "away"),
    [agents]
  );

  return {
    agents,
    onlineAgents,
    offlineAgents,
    awayAgents,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
