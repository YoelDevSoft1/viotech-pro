import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/apiClient";

export interface DashboardMetrics {
  openTickets: number;
  inProgressTickets: number;
  solvedTickets: number;
  avgResponse: string | number;
  activeServices: number;
  slaCompliance?: number;
  // Métricas del backend
  serviciosActivos?: number;
  proximaRenovacion?: string | null;
  avancePromedio?: number;
  ticketsAbiertos?: number;
  ticketsResueltos?: number;
  slaCumplido?: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: "ticket" | "service" | "system";
  status: string;
  date: string;
}

export function useDashboard() {
  const mapMetrics = (raw: any): DashboardMetrics => {
    // El backend expone nombres en español según API_DOCUMENTATION.md
    // Estructura: { success: true, data: { serviciosActivos, proximaRenovacion, avancePromedio, ticketsAbiertos, ticketsResueltos, slaCumplido } }
    const source = raw?.data ?? raw ?? {};
    return {
      // Métricas del backend (nombres en español)
      serviciosActivos: source.serviciosActivos ?? 0,
      proximaRenovacion: source.proximaRenovacion ?? null,
      avancePromedio: source.avancePromedio ?? 0,
      ticketsAbiertos: source.ticketsAbiertos ?? 0,
      ticketsResueltos: source.ticketsResueltos ?? 0,
      slaCumplido: source.slaCumplido ?? 0,
      // Compatibilidad con nombres en inglés
      openTickets: source.ticketsAbiertos ?? source.openTickets ?? 0,
      inProgressTickets: source.ticketsEnProgreso ?? source.inProgressTickets ?? 0,
      solvedTickets: source.ticketsResueltos ?? source.solvedTickets ?? 0,
      avgResponse: source.slaCumplido ?? source.avgResponse ?? 0,
      activeServices: source.serviciosActivos ?? source.activeServices ?? 0,
      slaCompliance: source.slaCumplido ?? undefined,
    };
  };

  // 1. Métricas Generales
  const metricsQuery = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data } = await apiClient.get("/metrics/dashboard");
      return mapMetrics(data);
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  // 2. Actividad Reciente (Tickets + Movimientos)
  const activityQuery = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/activity/recent");
        return (data?.data || data || []) as ActivityItem[];
      } catch (error) {
        // El backend no expone /activity/recent actualmente (404). Devolvemos [] para no bloquear el dashboard.
        const status = (error as AxiosError)?.response?.status;
        const isNotImplemented = (error as any)?.message === 'ENDPOINT_NOT_IMPLEMENTED';
        
        if (status === 404 || isNotImplemented) {
          // Silenciosamente devolvemos array vacío para endpoints no implementados
          return [] as ActivityItem[];
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 min
    retry: false, // No reintentar en caso de 404
    retryOnMount: false, // No reintentar al montar si falló
  });

  return {
    metrics: metricsQuery.data,
    activity: activityQuery.data || [],
    isLoading: metricsQuery.isLoading || activityQuery.isLoading,
    // Solo consideramos error crítico el de métricas; actividad faltante se maneja como vacío.
    isError: metricsQuery.isError,
    refetch: () => {
      metricsQuery.refetch();
      activityQuery.refetch();
    },
  };
}
