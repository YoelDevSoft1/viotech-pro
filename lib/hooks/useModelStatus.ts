import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";

export type ModelStatus = {
  enabled: boolean;
  modelVersion?: string;
  healthy?: boolean;
  notes?: string | null;
};

export function useModelStatus() {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModelStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/predictions/model-status",
        auth: false,
      });
      const data = payload?.data || payload;
      setModelStatus({
        enabled: Boolean(data.enabled ?? data.status === "ready"),
        modelVersion: data.modelVersion || data.version || "desconocido",
        healthy: Boolean(data.lastStatus?.healthy ?? data.modelLoaded ?? data.enabled),
        notes: data.notes || null,
      });
    } catch (err) {
      const msg = (err as ApiError).message || "Error al leer modelo";
      setError(msg);
      setModelStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModelStatus();
  }, [fetchModelStatus]);

  return { modelStatus, loading, error, refresh: fetchModelStatus };
}
