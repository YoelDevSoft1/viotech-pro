import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useOrg } from "@/lib/useOrg";

export type DashboardMetrics = {
  serviciosActivos: number;
  proximaRenovacion: string | null;
  avancePromedio: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  slaCumplido: number;
};

export function useMetrics() {
  const { orgId } = useOrg();

  const query = useQuery({
    // La clave incluye orgId, así que cada organización tiene su propio caché
    queryKey: ["metrics", "dashboard", orgId],
    
    // Solo ejecutamos la consulta si hay una organización seleccionada
    enabled: !!orgId,
    
    queryFn: async () => {
      const { data } = await apiClient.get("/metrics/dashboard", {
        params: { organizationId: orgId },
      });
      // Normalizamos la respuesta por si viene envuelta en { data: ... }
      return (data?.data || data) as DashboardMetrics;
    },
    
    // Opcional: Mantener datos frescos por 5 minutos
    staleTime: 1000 * 60 * 5, 
  });

  // Mapeamos a la interfaz que tu aplicación ya espera para no romper nada
  return {
    metrics: query.data || null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
    // Exportamos también el objeto query original por si necesitas más control
    ...query
  };
}