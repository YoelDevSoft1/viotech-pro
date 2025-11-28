"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, HeartPulse, RefreshCcw, Activity, CheckCircle2, XCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrg } from "@/lib/hooks/useOrg";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { useMetrics } from "@/lib/hooks/useMetrics";
import Link from "next/link";

type HealthEntry = {
  name: string;
  status: string;
  error?: string | null;
  value?: string | null;
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<HealthEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { orgId, setOrgId } = useOrg();
  const { modelStatus, error: modelError, refresh: refreshModelStatus } = useModelStatus();
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
        : Object.entries(data).map(([name, value]: [string, unknown]) => {
            const label = labelMap[name] || name;
            if (value && typeof value === "object" && value !== null) {
              const valueObj = value as Record<string, unknown>;
              const st = (valueObj.status || "").toString().toLowerCase();
              return {
                name: label,
                status:
                  ["ok", "up", "ready", "healthy"].includes(st) || Boolean(valueObj.healthy)
                    ? "ok"
                    : "down",
                error: (valueObj.error as string | null) || null,
                value: (valueObj.message as string | null) || null,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estado de Servicios</h1>
            <p className="text-muted-foreground">
              Monitoreo de salud del sistema: DB, Redis, IA, Wompi, Supabase y servicios internos.
            </p>
          </div>
          <Button onClick={loadHealth} disabled={loading} variant="outline" size="sm">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refrescar
          </Button>
        </div>
        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Rol Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {authRole || "desconocido"}
              </Badge>
              {authError && (
                <Alert variant="destructive" className="py-2">
                  <AlertTriangle className="h-3 w-3" />
                  <AlertDescription className="text-xs">{authError}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-4 w-4" />
              Modelo IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={modelStatus?.healthy ? "default" : "destructive"} className="capitalize">
                {modelStatus?.enabled ? "Activo" : "Inactivo"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                v{modelStatus?.modelVersion || "N/D"}
              </span>
            </div>
            {modelError && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{modelError}</AlertDescription>
              </Alert>
            )}
            {modelStatus?.notes && (
              <p className="text-xs text-muted-foreground">{modelStatus.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="h-5 w-5" />
            Verificaciones de Salud
          </CardTitle>
          <CardDescription>Estado de todos los servicios del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : health.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay verificaciones de salud disponibles.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {health.map((h) => {
                const statusText = h.value || h.status;
                const isOk = h.status === "ok";
                return (
                  <Card key={h.name} className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isOk ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">{h.name}</span>
                        </div>
                        <Badge variant={isOk ? "default" : "destructive"} className="capitalize">
                          {statusText}
                        </Badge>
                      </div>
                      {h.error && (
                        <Alert variant="destructive" className="mt-3 py-2">
                          <AlertTriangle className="h-3 w-3" />
                          <AlertDescription className="text-xs">Error: {h.error}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                KPIs por Organización
              </CardTitle>
              <CardDescription>Métricas clave del sistema</CardDescription>
            </div>
            <Button
              onClick={() => refreshMetrics()}
              size="sm"
              variant="outline"
              disabled={metricsLoading || !orgId}
            >
              <RefreshCcw className={`h-4 w-4 ${metricsLoading ? "animate-spin" : ""}`} />
              Recargar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metricsError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {metricsError || "Error desconocido"}
              </AlertDescription>
            </Alert>
          )}
          {!orgId ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Selecciona una organización para ver las métricas.
            </p>
          ) : metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Servicios Activos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics.serviciosActivos ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Abiertos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics.ticketsAbiertos ?? 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">SLA Cumplido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.slaCumplido !== undefined ? `${Math.round(metrics.slaCumplido)}%` : "N/D"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Renovación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    {metrics.proximaRenovacion
                      ? new Date(metrics.proximaRenovacion).toLocaleDateString("es-CO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "N/D"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avance Promedio</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metrics.avancePromedio !== undefined ? `${Math.round(metrics.avancePromedio)}%` : "N/D"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Resueltos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metrics.ticketsResueltos ?? 0}</p>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
