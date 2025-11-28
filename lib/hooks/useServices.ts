import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useOrg } from "@/lib/useOrg";

export type Service = {
  id: string;
  nombre: string;
  tipo?: string;
  estado: string;
  fecha_compra?: string | null;
  fecha_expiracion?: string | null;
  progreso?: number | null;
  precio?: number | null;
};

export function useServices() {
  const { orgId } = useOrg();

  const query = useQuery({
    // Clave única de caché por organización
    queryKey: ["services", orgId],
    
    // No ejecutar si no hay organización seleccionada
    enabled: !!orgId,
    
    queryFn: async () => {
      // Petición con Axios
      const { data } = await apiClient.get("/services/me", {
        params: { organizationId: orgId },
      });

      // Normalización de respuesta (soporta {data: []} o [] directo)
      const rawData = Array.isArray(data) ? data : (data?.data || []);

      // Mapeo de datos para asegurar compatibilidad con tu UI
      return rawData.map((s: any) => ({
        id: String(s.id),
        nombre: s.nombre || "Sin nombre",
        tipo: s.tipo || s.type || "",
        estado: s.estado || s.status || "activo",
        fecha_compra: s.fecha_compra || s.purchaseDate || null,
        fecha_expiracion: s.fecha_expiracion || s.expiration || null,
        progreso: s.progreso ?? null,
        precio: s.precio ?? s.price ?? null,
      })) as Service[];
    },
    
    // Mantener datos frescos por 5 minutos
    staleTime: 1000 * 60 * 5,
  });

  return {
    services: query.data || [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}