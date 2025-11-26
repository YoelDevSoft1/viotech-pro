import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";
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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!orgId) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/services/me",
        query: { organizationId: orgId },
      });
      const data = payload?.data || [];
      setServices(
        Array.isArray(data)
          ? data.map((s: any) => ({
              id: String(s.id),
              nombre: s.nombre || "Sin nombre",
              tipo: s.tipo || s.type || "",
              estado: s.estado || s.status || "activo",
              fecha_compra: s.fecha_compra || s.purchaseDate || null,
              fecha_expiracion: s.fecha_expiracion || s.expiration || null,
              progreso: s.progreso ?? null,
              precio: s.precio ?? s.price ?? null,
            }))
          : [],
      );
    } catch (err) {
      const msg = (err as ApiError).message || "Error al cargar servicios";
      setError(msg);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loading, error, refresh: fetchServices };
}
