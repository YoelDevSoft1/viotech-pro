import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/apiClient";

export interface DashboardMetrics {
  openTickets: number;
  inProgressTickets: number;
  solvedTickets: number;
  avgResponse: string | number | null;
  activeServices: number;
  slaCompliance?: number | null;
  // Métricas del backend
  serviciosActivos?: number;
  proximaRenovacion?: string | null;
  avancePromedio?: number | null;
  ticketsAbiertos?: number;
  ticketsResueltos?: number;
  slaCumplido?: number | null;
}

export interface ActivityItem {
  id: string;
  title: string;
  type: "ticket" | "service" | "system";
  status: string;
  date: string;
}

/**
 * Normaliza un valor numérico a un rango [min, max]
 * Útil para porcentajes y métricas que deben estar en rangos específicos
 * Preserva null/undefined para indicar ausencia de datos
 */
const clamp = (value: number | null | undefined, min: number, max: number): number | null => {
  if (value == null || isNaN(value)) return null;
  return Math.min(Math.max(value, min), max);
};

/**
 * Normaliza un porcentaje a [0, 100]
 * Preserva null/undefined para indicar ausencia de datos
 */
const normalizePercentage = (value: number | null | undefined): number | null => {
  return clamp(value, 0, 100);
};

/**
 * Detecta si el valor de SLA es un valor real o un valor por defecto del backend
 * Cuando no hay tickets para analizar o los tickets no se han procesado aún,
 * el backend puede devolver 100 como valor por defecto.
 * Esta función detecta esos casos y los trata como ausencia de datos
 */
export function normalizeSLAValue(
  slaValue: number | null | undefined,
  ticketsAbiertos: number = 0,
  ticketsResueltos: number = 0
): number | null {
  // Si es null/undefined, retornar null
  if (slaValue == null) return null;
  
  const totalTickets = ticketsAbiertos + ticketsResueltos;
  
  // Caso 1: No hay tickets para analizar y el SLA es 100 → valor por defecto
  if (totalTickets === 0 && slaValue === 100) {
    return null; // Tratar como ausencia de datos
  }
  
  // Caso 2: Hay tickets abiertos pero NO hay tickets resueltos y el SLA es exactamente 100%
  // Esto indica que los tickets existen pero no se han procesado/analizado aún.
  // No se puede calcular un SLA real si no hay tickets resueltos para analizar.
  if (ticketsAbiertos > 0 && ticketsResueltos === 0 && slaValue === 100) {
    return null; // Tratar como ausencia de datos (no se ha realizado análisis)
  }
  
  // Si hay tickets resueltos, entonces sí se ha realizado análisis y el valor puede ser real
  // Incluso si es 100%, podría ser un valor real si todos los tickets cumplieron SLA
  
  // Si llegamos aquí, el valor parece ser real
  return slaValue;
}

export function useDashboard() {
  const mapMetrics = (raw: any): DashboardMetrics => {
    // El backend expone nombres en español según API_DOCUMENTATION.md
    // Estructura: { success: true, data: { serviciosActivos, proximaRenovacion, avancePromedio, ticketsAbiertos, ticketsResueltos, slaCumplido } }
    const source = raw?.data ?? raw ?? {};
    
    // Normalizar porcentajes a [0, 100] según validaciones C2.1
    const avancePromedio = normalizePercentage(source.avancePromedio);
    const slaCumplido = normalizePercentage(source.slaCumplido);
    
    // Loggear casos raros para debugging (sin romper la UI)
    if (source.avancePromedio != null && (source.avancePromedio < 0 || source.avancePromedio > 100)) {
      console.warn("⚠️ avancePromedio fuera de rango [0, 100]:", source.avancePromedio);
    }
    if (source.slaCumplido != null && (source.slaCumplido < 0 || source.slaCumplido > 100)) {
      console.warn("⚠️ slaCumplido fuera de rango [0, 100]:", source.slaCumplido);
    }
    
    return {
      // Métricas del backend (nombres en español) - VALIDACIÓN C2.1
      serviciosActivos: source.serviciosActivos ?? 0,
      proximaRenovacion: source.proximaRenovacion ?? null,
      avancePromedio,
      ticketsAbiertos: source.ticketsAbiertos ?? 0,
      ticketsResueltos: source.ticketsResueltos ?? 0,
      slaCumplido,
      // Compatibilidad con nombres en inglés
      openTickets: source.ticketsAbiertos ?? source.openTickets ?? 0,
      inProgressTickets: source.ticketsEnProgreso ?? source.inProgressTickets ?? 0,
      solvedTickets: source.ticketsResueltos ?? source.solvedTickets ?? 0,
      avgResponse: slaCumplido,
      activeServices: source.serviciosActivos ?? source.activeServices ?? 0,
      slaCompliance: slaCumplido,
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
        
        // Asegurar que siempre devolvemos un array
        let activityData: any = data?.data || data;
        
        // Si no es un array, devolver array vacío
        if (!Array.isArray(activityData)) {
          console.warn("⚠️ Actividad reciente no es un array:", activityData);
          return [] as ActivityItem[];
        }
        
        return activityData as ActivityItem[];
      } catch (error) {
        // El backend no expone /activity/recent actualmente (404). Devolvemos [] para no bloquear el dashboard.
        const status = (error as AxiosError)?.response?.status;
        const isNotImplemented = (error as any)?.message === 'ENDPOINT_NOT_IMPLEMENTED';
        
        if (status === 404 || isNotImplemented) {
          // Silenciosamente devolvemos array vacío para endpoints no implementados
          return [] as ActivityItem[];
        }
        
        // Para otros errores, también devolvemos array vacío para no romper el dashboard
        console.warn("⚠️ Error al obtener actividad reciente:", error);
        return [] as ActivityItem[];
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
