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
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

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
  const tAdmin = useTranslationsSafe("admin");
  const tCommon = useTranslationsSafe("common");

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
        setSummaryError(tAdmin("error.sessionExpired"));
        setLoading(false);
        return;
      }
    }

    if (!token) {
      setSummaryError(tAdmin("error.notAuthenticated"));
      setLoading(false);
      return;
    }

    try {
      const [healthRes, usersRes] = await Promise.all([
        fetch(buildApiUrl("/health"), { 
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }).catch((err) => {
          // Manejar errores de red
          console.error("Error al conectar con /health:", err);
          return { ok: false, status: 0, statusText: err.message || tAdmin("error.noConnection") } as Response;
        }),
        fetch(buildApiUrl("/users"), { 
          headers: { Authorization: `Bearer ${token}` }, 
          cache: "no-store", 
          credentials: "include" 
        }),
      ]);

      // Manejar respuesta de health con mejor manejo de errores
      if (healthRes.ok) {
        try {
          const healthPayload = await healthRes.json().catch(() => null);
          if (healthPayload) {
            const data = healthPayload?.data || healthPayload;
            const st = (healthPayload?.status || data?.status || "").toString().toLowerCase();
            setHealthStatus(["ok", "up", "ready", "healthy"].includes(st) ? "OK" : st || "N/D");
            setHealthError(null);
          } else {
            // Si la respuesta es OK pero no tiene JSON, puede ser texto plano
            const textResponse = await healthRes.text().catch(() => "");
            if (textResponse && ["ok", "up", "ready", "healthy"].includes(textResponse.toLowerCase().trim())) {
              setHealthStatus("OK");
              setHealthError(null);
            } else {
              setHealthStatus("N/D");
              setHealthError(tAdmin("error.invalidResponse"));
            }
          }
        } catch (parseError) {
          setHealthStatus("N/D");
          setHealthError(parseError instanceof Error ? parseError.message : tAdmin("error.parseError"));
        }
      } else {
        // Manejar errores HTTP
        const statusText = healthRes.statusText || `HTTP ${healthRes.status}`;
        setHealthStatus("N/D");
        if (healthRes.status === 0) {
          setHealthError(tAdmin("error.noConnection"));
        } else if (healthRes.status === 401 || healthRes.status === 403) {
          setHealthError(tAdmin("error.unauthorized"));
        } else if (healthRes.status >= 500) {
          setHealthError(`${tAdmin("error.serverError")} (${healthRes.status})`);
        } else {
          setHealthError(statusText);
        }
      }

      const usersPayload = await usersRes.json().catch(() => null);
      if (usersRes.ok && usersPayload) {
        const arr = usersPayload?.data?.users || usersPayload?.users || usersPayload?.data || [];
        setUsersCount(Array.isArray(arr) ? String(arr.length) : "N/D");
      } else {
        setUsersCount("N/D");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tAdmin("error.summaryError");
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
          <h1 className="text-3xl font-bold tracking-tight">{tAdmin("title")}</h1>
          <p className="text-muted-foreground">
            {tAdmin("description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label={tAdmin("organization")} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={combinedLoading}
            className="gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${combinedLoading ? "animate-spin" : ""}`} />
            {tCommon("refresh")}
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
            <CardTitle className="text-sm font-medium">{tAdmin("backendHealth")}</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{healthLabel}</div>
                <p className="text-xs text-muted-foreground">
                  {healthError ? `${tAdmin("errorLabel")}: ${healthError}` : tAdmin("systemStatus")}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Model Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin("aiModel")}</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : modelStatus ? (
              <>
                <div className="text-2xl font-bold">
                  {modelStatus.enabled ? tAdmin("active") : tAdmin("inactive")}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={modelStatus.healthy ? "default" : "destructive"}>
                    {modelStatus.healthy ? "OK" : tAdmin("degraded")}
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
            <CardTitle className="text-sm font-medium">{tAdmin("users")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{usersCount}</div>
                <p className="text-xs text-muted-foreground">{tAdmin("totalActiveUsers")}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin("tickets")}</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalTickets}</div>
                <p className="text-xs text-muted-foreground">{tAdmin("openTickets")}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin("services")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {combinedLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalServices}</div>
                <p className="text-xs text-muted-foreground">{tAdmin("activeServices")}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{tAdmin("quickAccess")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/health">
                  <HeartPulse className="h-4 w-4" />
                  <span className="text-xs">{tAdmin("health")}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/users">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">{tAdmin("users")}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/tickets">
                  <Ticket className="h-4 w-4" />
                  <span className="text-xs">{tAdmin("tickets")}</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="h-auto flex-col gap-1 py-2">
                <Link href="/admin/services">
                  <Package className="h-4 w-4" />
                  <span className="text-xs">{tAdmin("services")}</span>
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
            {tAdmin("recentActivity")}
          </CardTitle>
          <CardDescription>
            {tAdmin("recentActivityDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {tAdmin("recentActivityPlaceholder")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
