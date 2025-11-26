import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";
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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!orgId) {
      setMetrics(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/metrics/dashboard",
        query: { organizationId: orgId },
      });
      setMetrics(payload?.data || payload || null);
    } catch (err) {
      const msg = (err as ApiError).message || "Error al cargar métricas";
      setError(msg);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, refresh: fetchMetrics };
}
