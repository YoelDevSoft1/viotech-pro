"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { AxiosError } from "axios";

export type SupportAgent = {
  id: string;
  name: string;
  role?: string;
  status: "online" | "offline" | "away";
  avatarUrl?: string | null;
  skills?: string[];
};

export function useSupportAgents() {
  const query = useQuery({
    queryKey: ["support-agents"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/support/agents");
        // El backend retorna: { success: true, message: "...", data: { agents: [...] } }
        // Acceder correctamente a data.data.agents
        const agents = data?.data?.agents || data?.data || data || [];
        return Array.isArray(agents) ? agents : [];
      } catch (error) {
        // Si es un error 500, retornar array vacío en lugar de lanzar
        const axiosError = error as AxiosError;
        if (axiosError.response?.status === 500) {
          // Backend no disponible - retornar array vacío para que la UI funcione
          return [] as SupportAgent[];
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

  // Asegurar que siempre sea un array, incluso si query.data es undefined o no es array
  const agents = Array.isArray(query.data) ? query.data : [];

  return {
    agents,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
