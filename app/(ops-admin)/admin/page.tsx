"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, Users, Ticket, Cpu, Activity, HeartPulse, RefreshCcw, Settings, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServices } from "@/lib/hooks/useServices";
import { useTickets } from "@/lib/hooks/useTickets";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { useOrg } from "@/lib/hooks/useOrg";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminDashboardPage() {
  const { orgId, setOrgId } = useOrg();
  const { services, refresh: refreshServices, loading: servicesLoading } = useServices();
  const { tickets, refresh: refreshTickets, loading: ticketsLoading } = useTickets();
  const { metrics, loading: metricsLoading, refresh: refreshMetrics } = useMetrics();
  const { modelStatus, loading: modelLoading, refresh: refreshModelStatus } = useModelStatus();
  const [healthStatus, setHealthStatus] = useState<string>("N/D");
  const [healthError, setHealthError] = useState<string | null>(null);
  const [usersCount, setUsersCount] = useState<string>("N/D");
  const [loading, setLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const combinedLoading = loading || servicesLoading || ticketsLoading || metricsLoading || modelLoading;
  const totalServices =
    metrics?.serviciosActivos !== undefined
      ? String(metrics.serviciosActivos)
      : services.length
        ? String(services.length)
        : "N/D";
  const totalTickets =
    metrics?.ticketsAbiertos !== undefined
      ? String(metrics.ticketsAbiertos)
      : tickets.length
        ? String(tickets.length)
        : "N/D";
  const healthLabel = useMemo(() => (healthStatus ? healthStatus : "N/D"), [healthStatus]);

  const loadHealthAndUsers = async () => {
    setLoading(true);
    setSummaryError(null);
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setSummaryError("Sesión expirada. Inicia sesión nuevamente.");
        setLoading(false);
        return;
      }
    }

    if (!token) {
      setSummaryError("No autenticado");
      setLoading(false);
      return;
    }

    try {
      const [healthRes, usersRes] = await Promise.all([
        fetch(buildApiUrl("/health"), { cache: "no-store" }),
        fetch(buildApiUrl("/users"), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", credentials: "include" }),
      ]);

      const healthPayload = await healthRes.json().catch(() => null);
      if (healthRes.ok && healthPayload) {
        const data = healthPayload?.data || healthPayload;
        const st = (healthPayload?.status || data?.status || "").toString().toLowerCase();
        setHealthStatus(["ok", "up", "ready", "healthy"].includes(st) ? "OK" : st || "N/D");
        setHealthError(null);
      } else {
        setHealthStatus("N/D");
        setHealthError("Error /health");
      }

      const usersPayload = await usersRes.json().catch(() => null);
      if (usersRes.ok && usersPayload) {
        const arr = usersPayload?.data?.users || usersPayload?.users || usersPayload?.data || [];
        setUsersCount(Array.isArray(arr) ? String(arr.length) : "N/D");
      } else {
        setUsersCount("N/D");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error en resumen";
      setSummaryError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthAndUsers();
    refreshModelStatus();
    refreshMetrics();
    refreshServices();
    refreshTickets();
  }, [orgId]);

  const handleRefresh = () => {
    loadHealthAndUsers();
    refreshModelStatus();
    refreshMetrics();
    refreshServices();
    refreshTickets();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel Administrativo</h1>
          <p className="text-muted-foreground">
            Supervisión centralizada de usuarios, tickets y servicios.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={combinedLoading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${combinedLoading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {summaryError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{summaryError}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud Backend</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{healthLabel}</div>
                <p className="text-xs text-muted-foreground">
                  {healthError ? `Error: ${healthError}` : "Estado del sistema"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Model Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modelo IA</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : modelStatus ? (
              <>
                <div className="text-2xl font-bold">
                  {modelStatus.enabled ? "Activo" : "Inactivo"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={modelStatus.healthy ? "default" : "destructive"}>
                    {modelStatus.healthy ? "OK" : "Degradado"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    v{modelStatus.modelVersion || "N/D"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold">N/D</div>
            )}
          </CardContent>
        </Card>

        {/* Users Count */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{usersCount}</div>
                <p className="text-xs text-muted-foreground">Total usuarios activos</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalTickets}</div>
                <p className="text-xs text-muted-foreground">Tickets abiertos</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalServices}</div>
                <p className="text-xs text-muted-foreground">Servicios activos</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos Rápidos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/health">
                  <HeartPulse className="h-4 w-4" />
                  <span className="text-xs">Health</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/users">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Usuarios</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/tickets">
                  <Ticket className="h-4 w-4" />
                  <span className="text-xs">Tickets</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/services">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">Servicios</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividades Recientes
          </CardTitle>
          <CardDescription>
            Auditoría y alertas críticas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Integra aquí una lista de auditoría o alertas críticas. Por ahora es un placeholder.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
