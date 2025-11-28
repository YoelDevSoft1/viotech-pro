import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type ModelStatus = {
  enabled: boolean;
  modelVersion?: string;
  healthy?: boolean;
  notes?: string | null;
};

export function useModelStatus() {
  const query = useQuery({
    queryKey: ["model-status"],
    
    queryFn: async () => {
      // Pasamos auth: false para que el interceptor no inyecte el token
      // (Replicando la lógica original)
      const { data } = await apiClient.get("/predictions/model-status", {
        auth: false,
      } as any);

      // Normalización de datos (tal cual la tenías)
      const raw = data?.data || data;

      return {
        enabled: Boolean(raw.enabled ?? raw.status === "ready"),
        modelVersion: raw.modelVersion || raw.version || "desconocido",
        healthy: Boolean(raw.lastStatus?.healthy ?? raw.modelLoaded ?? raw.enabled),
        notes: raw.notes || null,
      } as ModelStatus;
    },

    // Cacheamos el estado del modelo por 5 minutos ya que raramente cambia
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    modelStatus: query.data || null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}