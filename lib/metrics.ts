/**
 * Servicio para obtener métricas del dashboard desde el backend
 */
import { buildApiUrl } from "./api";

export type DashboardMetrics = {
  serviciosActivos: number;
  proximaRenovacion: string | null;
  avancePromedio: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  slaCumplido: number;
};

/**
 * Obtiene las métricas del dashboard desde el backend
 * @param token - Token JWT de autenticación
 * @returns Métricas del dashboard
 */
export async function fetchDashboardMetrics(
  token: string,
  organizationId?: string
): Promise<DashboardMetrics> {
  const url = organizationId
    ? `${buildApiUrl("/metrics/dashboard")}?organizationId=${organizationId}`
    : buildApiUrl("/metrics/dashboard");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await response.json();

  if (!response.ok) {
    const errMsg = payload?.error || payload?.message || "No se pudieron cargar las métricas";
    if (response.status === 429) {
      const error: any = new Error(errMsg);
      error.status = 429;
      return Promise.reject(error);
    }
    throw new Error(errMsg);
  }

  return payload.data as DashboardMetrics;
}
