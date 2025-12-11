"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supportApi, Agent } from "@/lib/api/support";
import { AxiosError } from "axios";

// Re-exportar tipo para compatibilidad
export type SupportAgent = Agent;

/**
 * Hook para obtener y gestionar agentes de soporte
 * 
 * El backend sincroniza automáticamente la presencia de los agentes:
 * - Verifica sesiones activas para cada agente
 * - Actualiza status (online/offline) automáticamente
 * - Actualiza lastSeenAt con la última actividad
 * 
 * Por defecto incluye TODOS los agentes (activos e inactivos) con estado sincronizado.
 */
export function useSupportAgents(filters?: { 
  status?: string; 
  role?: string; 
  includeInactive?: boolean;
}) {
  const query = useQuery({
    queryKey: ["support-agents", filters],
    queryFn: async () => {
      try {
        // Por defecto incluir todos los agentes (activos e inactivos)
        // El backend sincroniza automáticamente el estado basado en sesiones activas
        const agents = await supportApi.getAgents({
          ...filters,
          includeInactive: filters?.includeInactive !== undefined 
            ? filters.includeInactive 
            : true, // Default: incluir todos
        });
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

  // Agentes con sesiones activas (status sincronizado automáticamente)
  const onlineAgents = useMemo(
    () => agents.filter((agent) => agent.status === "online"),
    [agents]
  );

  // Agentes sin sesiones activas
  const offlineAgents = useMemo(
    () => agents.filter((agent) => agent.status === "offline"),
    [agents]
  );

  // Agentes marcados como "away"
  const awayAgents = useMemo(
    () => agents.filter((agent) => agent.status === "away"),
    [agents]
  );

  // Agentes marcados como "busy"
  const busyAgents = useMemo(
    () => agents.filter((agent) => agent.status === "busy"),
    [agents]
  );

  // Agentes activos en el sistema (isActive = true)
  const activeAgents = useMemo(
    () => agents.filter((agent) => agent.isActive === true),
    [agents]
  );

  // Agentes inactivos en el sistema (isActive = false)
  const inactiveAgents = useMemo(
    () => agents.filter((agent) => agent.isActive === false),
    [agents]
  );

  return {
    agents,              // Todos los agentes con estado sincronizado
    onlineAgents,        // Agentes con sesiones activas (status = "online")
    offlineAgents,       // Agentes sin sesiones activas (status = "offline")
    awayAgents,          // Agentes marcados como "away"
    busyAgents,          // Agentes marcados como "busy"
    activeAgents,        // Agentes con isActive = true
    inactiveAgents,      // Agentes con isActive = false
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
