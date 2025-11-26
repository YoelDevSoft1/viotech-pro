"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, HeartPulse, RefreshCcw, Activity } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { useOrg } from "@/lib/useOrg";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

type HealthEntry = {
  name: string;
  status: string;
  error?: string | null;
  value?: string | null;
};

type ModelStatus = {
  enabled: boolean;
  modelVersion: string;
  healthy: boolean;
  notes?: string | null;
};

type DashboardMetrics = {
  serviciosActivos: number;
  proximaRenovacion: string | null;
  avancePromedio: number;
  ticketsAbiertos: number;
  ticketsResueltos: number;
  slaCumplido: number;
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { orgId, setOrgId } = useOrg();
  const { modelStatus, loading: modelLoading, error: modelError, refresh: refreshModelStatus } = useModelStatus();
  const { metrics, loading: metricsLoading, error: metricsError, refresh: refreshMetrics } = useMetrics();
  const [authRole, setAuthRole] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const apiHealthUrl = useMemo(
    () => (orgId ? `${buildApiUrl("/health")}?organizationId=${orgId}` : buildApiUrl("/health")),
    [orgId]
  );
  const labelMap: Record<string, string> = {
    status: "Estado",
    message: "Mensaje",
    timestamp: "Fecha/hora",
    environment: "Entorno",
  };

  const loadHealth = async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setError("Sesión expirada. Vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(apiHealthUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudo obtener salud del sistema");
      }
      const data = payload.data || payload;
      const overallStatus = (payload.status || data.status || "").toString().toLowerCase();
      const overallOk = ["ok", "up", "ready", "healthy"].includes(overallStatus);
      const entries: HealthEntry[] = Array.isArray(data)
        ? data
        : Object.entries(data).map(([name, value]: any) => {
            const label = labelMap[name] || name;
            if (value && typeof value === "object") {
              const st = (value.status || "").toString().toLowerCase();
              return {
                name: label,
                status:
                  ["ok", "up", "ready", "healthy"].includes(st) || value.healthy
                    ? "ok"
                    : "down",
                error: value.error || null,
                value: value.message || null,
              };
            }
            return {
              name: label,
              status: overallOk ? "ok" : "down",
              error: null,
              value: value !== undefined && value !== null ? String(value) : null,
            };
          });
      setHealth(entries);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar salud";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, [apiHealthUrl]);

  const loadAuthRole = async () => {
    setAuthError(null);
    let token = getAccessToken();
    if (!token) {
      setAuthError("No autenticado");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setAuthError("Sesión expirada. Vuelve a iniciar sesión.");
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error("No se pudo leer auth");
      const data = payload.data || payload;
      const user = data.user || data;
      setAuthRole(user.rol || user.role || "");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al validar rol";
      setAuthError(msg);
    }
  };

  useEffect(() => {
    loadAuthRole();
    refreshModelStatus();
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="w-full space-y-6">
        <div className="space-y-3">
          <Breadcrumb items={[{ href: "/admin", label: "Admin" }, { href: "/admin/health", label: "Health" }]} />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salud</p>
              <h1 className="text-3xl font-medium text-foreground">Estado de servicios</h1>
              <p className="text-sm text-muted-foreground">
                DB, Redis, IA, Wompi, Supabase y servicios internos.
              </p>
            </div>
            <Button onClick={loadHealth} disabled={loading} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4" />
              Refrescar
            </Button>
          </div>
        </div>

        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="w-4 h-4" />
                Rol actual
              </div>
              <span className="text-xs rounded-full border px-2 py-1 border-border/70 text-muted-foreground">
                {authRole || "desconocido"}
              </span>
            </div>
            {authError && <p className="text-xs text-amber-700">{authError}</p>}
          </Card>

          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <HeartPulse className="w-4 h-4" />
                Modelo IA
              </div>
              <span
                className={`text-xs rounded-full border px-2 py-1 ${
                  modelStatus?.healthy ? "border-green-500/60 text-green-700" : "border-red-500/60 text-red-700"
                }`}
              >
                {modelStatus?.enabled ? "activo" : "apagado"} · {modelStatus?.modelVersion || "N/D"}
              </span>
            </div>
            {modelError && <p className="text-xs text-amber-700">{modelError}</p>}
            {modelStatus?.notes && <p className="text-xs text-muted-foreground">{modelStatus.notes}</p>}
          </Card>
        </div>

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title="Cargando salud..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.map((h) => {
              const statusText = h.value || h.status;
              return (
                <Card key={h.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <HeartPulse className="w-4 h-4" />
                      {h.name}
                    </div>
                    <span
                      className={`text-xs rounded-full border px-2 py-1 ${
                        h.status === "ok"
                          ? "border-green-500/60 text-green-700"
                          : "border-red-500/60 text-red-700"
                      }`}
                    >
                      {statusText}
                    </span>
                  </div>
                  {h.error && <p className="text-xs text-amber-700">Error: {h.error}</p>}
                </Card>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Métricas</p>
              <h2 className="text-lg font-medium text-foreground">KPIs por organización</h2>
            </div>
            <Button onClick={refreshMetrics} size="sm" variant="outline" disabled={metricsLoading || !orgId}>
              <RefreshCcw className="w-4 h-4" />
              Recargar
            </Button>
          </div>
          {metricsError && <ErrorState message={metricsError} />}
          {!orgId && <EmptyState title="Selecciona una organización" message="Necesitamos la organización para cargar KPIs." />}
          {metricsLoading && orgId && <LoadingState title="Cargando métricas..." />}
          {metrics && orgId && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <p className="text-xs text-muted-foreground">Servicios activos</p>
                <p className="text-2xl font-semibold">{metrics.serviciosActivos ?? 0}</p>
              </Card>
              <Card>
                <p className="text-xs text-muted-foreground">Tickets abiertos</p>
                <p className="text-2xl font-semibold">{metrics.ticketsAbiertos ?? 0}</p>
              </Card>
              <Card>
                <p className="text-xs text-muted-foreground">SLA cumplido</p>
                <p className="text-2xl font-semibold">
                  {metrics.slaCumplido !== undefined ? `${Math.round(metrics.slaCumplido)}%` : "N/D"}
                </p>
              </Card>
              <Card>
                <p className="text-xs text-muted-foreground">Próxima renovación</p>
                <p className="text-sm font-medium">
                  {metrics.proximaRenovacion ? new Date(metrics.proximaRenovacion).toLocaleDateString() : "N/D"}
                </p>
              </Card>
              <Card>
                <p className="text-xs text-muted-foreground">Avance promedio</p>
                <p className="text-2xl font-semibold">
                  {metrics.avancePromedio !== undefined ? `${Math.round(metrics.avancePromedio)}%` : "N/D"}
                </p>
              </Card>
              <Card>
                <p className="text-xs text-muted-foreground">Tickets resueltos</p>
                <p className="text-2xl font-semibold">{metrics.ticketsResueltos ?? 0}</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
