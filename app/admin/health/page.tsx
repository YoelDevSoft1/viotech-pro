"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, HeartPulse, RefreshCcw, Activity } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type HealthEntry = {
  name: string;
  status: string;
  error?: string | null;
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
  const [organizationId, setOrganizationId] = useState<string>("");
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsCooldownUntil, setMetricsCooldownUntil] = useState<number>(0);
  const [authRole, setAuthRole] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  const apiHealthUrl = useMemo(
    () => (organizationId ? `${buildApiUrl("/health")}?organizationId=${organizationId}` : buildApiUrl("/health")),
    [organizationId]
  );
  const apiMetricsUrl = useMemo(() => {
    const url = new URL(buildApiUrl("/metrics/dashboard"));
    if (organizationId) url.searchParams.set("organizationId", organizationId);
    return url.toString();
  }, [organizationId]);

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
            if (value && typeof value === "object") {
              const st = (value.status || "").toString().toLowerCase();
              return {
                name,
                status:
                  ["ok", "up", "ready", "healthy"].includes(st) || value.healthy
                    ? "ok"
                    : "down",
                error: value.error || null,
              };
            }
            return {
              name,
              status: overallOk ? "ok" : "down",
              error: null,
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

  const loadModel = async () => {
    setModelError(null);
    try {
      const res = await fetch(buildApiUrl("/predictions/model-status"), { cache: "no-store" });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error("No se pudo leer estado del modelo");
      const data = payload.data || payload;
      setModelStatus({
        enabled: Boolean(data.enabled ?? data.status === "ready"),
        modelVersion: data.modelVersion || data.version || "desconocido",
        healthy: Boolean(data.lastStatus?.healthy ?? data.modelLoaded ?? data.enabled),
        notes: data.notes || null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al leer modelo";
      setModelError(msg);
      setModelStatus(null);
    }
  };

  const loadMetrics = async () => {
    if (!organizationId) {
      setMetrics(null);
      setMetricsError(null);
      setMetricsLoading(false);
      return;
    }
    const now = Date.now();
    if (metricsCooldownUntil && now < metricsCooldownUntil) {
      return;
    }
    setMetricsLoading(true);
    setMetricsError(null);
    setMetrics(null);
    let token = getAccessToken();
    if (!token) {
      setMetricsError("No autenticado");
      setMetricsLoading(false);
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setMetricsError("Sesión expirada. Vuelve a iniciar sesión.");
        setMetricsLoading(false);
        return;
      }
    }
    try {
      const res = await fetch(apiMetricsUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) throw new Error(payload?.error || payload?.message || "No se pudieron cargar métricas");
      setMetrics(payload.data || payload);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar métricas";
      setMetricsError(msg);
      setMetrics(null);
      const isRateLimit =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("solicitudes") || msg.toLowerCase().includes("too many"));
      if (isRateLimit) {
        setMetricsCooldownUntil(Date.now() + 60_000);
      }
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthRole();
    loadModel();
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [apiMetricsUrl]);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-6">
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

        <OrgSelector
          onChange={(org: Org | null) => setOrganizationId(org?.id || "")}
          label="Organización"
        />

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

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando salud...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {health.map((h) => (
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
                    {h.status === "ok" ? "operativo" : h.status === "down" ? "caído" : h.status}
                  </span>
                </div>
                {h.error && <p className="text-xs text-amber-700">Error: {h.error}</p>}
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Métricas</p>
              <h2 className="text-lg font-medium text-foreground">KPIs por organización</h2>
            </div>
            <Button onClick={loadMetrics} size="sm" variant="outline" disabled={metricsLoading || !organizationId}>
              <RefreshCcw className="w-4 h-4" />
              Recargar
            </Button>
          </div>
          {metricsError && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4" />
              {metricsError}
            </div>
          )}
          {!organizationId && (
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Selecciona una organización para ver métricas.
            </div>
          )}
          {metricsLoading && organizationId && (
            <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
              Cargando métricas...
            </div>
          )}
          {metrics && organizationId && (
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
