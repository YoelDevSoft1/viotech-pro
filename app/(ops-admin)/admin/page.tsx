"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield, Users, Ticket, Cpu, Activity, HeartPulse, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useServices } from "@/lib/hooks/useServices";
import { useTickets } from "@/lib/hooks/useTickets";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { useOrg } from "@/lib/useOrg";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { buildApiUrl } from "@/lib/api";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

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

  return (
    <main className="space-y-6">
      <div className="space-y-3">
        <Breadcrumb items={[{ href: "/admin", label: "Admin" }]} />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Resumen
          </p>
          <h1 className="text-2xl font-medium text-foreground">Panel administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Supervisión centralizada de usuarios, tickets y servicios.
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/admin/health"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Activity className="w-3 h-3" />
            Estado / Health
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Users className="w-3 h-3" />
            Gestión de usuarios
          </Link>
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
          >
            <Ticket className="w-3 h-3" />
            Tickets globales
          </Link>
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadHealthAndUsers();
              refreshModelStatus();
              refreshMetrics();
              refreshServices();
              refreshTickets();
            }}
            disabled={combinedLoading}
            className="inline-flex items-center gap-2"
          >
            <RefreshCcw className="w-3 h-3" />
            Refrescar resumen
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salud backend</p>
            <HeartPulse className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {combinedLoading ? "…" : healthLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            Fuente: /api/health {healthError ? `· ${healthError}` : ""}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Modelo IA</p>
            <Cpu className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {combinedLoading
              ? "…"
              : modelStatus
                ? `${modelStatus.enabled ? "Activo" : "Apagado"} · ${modelStatus.modelVersion || "N/D"}`
                : "N/D"}
          </p>
          <p className="text-xs text-muted-foreground">
            Salud: {modelStatus ? (modelStatus.healthy ? "OK" : "Degradado") : "N/D"}
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Usuarios</p>
            <Users className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {combinedLoading ? "…" : usersCount}
          </p>
          <p className="text-xs text-muted-foreground">
            Total usuarios activos
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Tickets</p>
            <Ticket className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {combinedLoading ? "…" : totalTickets}
          </p>
          <p className="text-xs text-muted-foreground">
            Abiertos / SLA crítico
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Servicios</p>
            <Shield className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {combinedLoading ? "…" : totalServices}
          </p>
          <p className="text-xs text-muted-foreground">
            Servicios activos asociados a la organización
          </p>
        </div>
      </section>

      {summaryError && (
        <div className="rounded-2xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {summaryError}
        </div>
      )}

      <section className="rounded-2xl border border-border/70 bg-background/80 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-foreground" />
          <p className="text-sm font-medium text-foreground">Actividades recientes</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Integra aquí una lista de auditoría o alertas críticas. Por ahora es un placeholder.
        </p>
      </section>
    </main>
  );
}
