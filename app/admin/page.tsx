"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Ticket, Cpu, Activity, HeartPulse } from "lucide-react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";

export default function AdminDashboardPage() {
  const [healthStatus, setHealthStatus] = useState<"ok" | "down" | "">("");
  const [modelStatus, setModelStatus] = useState<{ enabled: boolean; healthy: boolean; version: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [usersCount, setUsersCount] = useState<string>("—");
  const [ticketsCount, setTicketsCount] = useState<string>("—");
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState<string | null>(null);

  const getAuthHeader = async () => {
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        return null;
      }
    }
    if (!token) return null;
    return { Authorization: `Bearer ${token}` } as HeadersInit;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Health global
        const healthRes = await fetch(buildApiUrl("/health"), { cache: "no-store" });
        const healthPayload = await healthRes.json().catch(() => null);
        if (healthRes.ok && healthPayload) {
          const data = healthPayload.data || healthPayload;
          const overall = (healthPayload.status || data.status || "").toString().toLowerCase();
          const overallOk = ["ok", "up", "ready", "healthy"].includes(overall);
          setHealthStatus(overallOk ? "ok" : "down");
          setHealthError(null);
        } else {
          setHealthStatus("down");
          setHealthError(healthPayload?.error || healthPayload?.message || "No se pudo leer /health");
        }

        // Estado modelo IA
        const modelRes = await fetch(buildApiUrl("/predictions/model-status"), { cache: "no-store" });
        const modelPayload = await modelRes.json().catch(() => null);
        if (modelRes.ok && modelPayload) {
          const data = modelPayload.data || modelPayload;
          setModelStatus({
            enabled: Boolean(data.enabled ?? data.status === "ready"),
            healthy: Boolean(data.lastStatus?.healthy ?? data.modelLoaded ?? data.enabled),
            version: data.modelVersion || data.version || "N/D",
          });
        } else {
          setModelStatus(null);
        }
      } catch {
        setHealthStatus("down");
        setModelStatus(null);
        setHealthError("No se pudo cargar estado inicial");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      setCountsLoading(true);
      setCountsError(null);
      try {
        const headers: HeadersInit = (await getAuthHeader()) || {};
        const baseOptions: RequestInit = { cache: "no-store" as RequestCache, credentials: "include", headers };

        // Usuarios
        const usersRes = await fetch(buildApiUrl("/users"), baseOptions);
        const usersPayload = await usersRes.json().catch(() => null);
        if (usersRes.ok && usersPayload) {
          const arr = usersPayload.data?.users || usersPayload.users || usersPayload.data || [];
          if (Array.isArray(arr)) setUsersCount(String(arr.length));
          const totalUsers =
            usersPayload.data?.pagination?.total ||
            usersPayload.pagination?.total ||
            usersPayload.total ||
            usersPayload.count ||
            (Array.isArray(usersPayload.data) ? usersPayload.data.length : undefined);
          if (totalUsers !== undefined) setUsersCount(String(totalUsers));
        } else if (usersRes.status === 401) {
          setUsersCount("N/D");
          setCountsError("Sesión requerida para leer usuarios");
        } else {
          setUsersCount("N/D");
        }

        // Tickets (usa un límite pequeño y toma total si viene)
        const ticketsRes = await fetch(buildApiUrl("/tickets?page=1&limit=20"), baseOptions);
        const ticketsPayload = await ticketsRes.json().catch(() => null);
        if (ticketsRes.ok && ticketsPayload) {
          const total =
            ticketsPayload.data?.pagination?.total ||
            ticketsPayload.pagination?.total ||
            ticketsPayload.total ||
            ticketsPayload.count ||
            (Array.isArray(ticketsPayload.data?.tickets) ? ticketsPayload.data.tickets.length : undefined);
          if (total !== undefined) setTicketsCount(String(total));
        } else if (ticketsRes.status === 401) {
          setTicketsCount("N/D");
          setCountsError("Sesión requerida para leer tickets");
        } else {
          setTicketsCount("N/D");
        }
      } finally {
        setCountsLoading(false);
      }
    };
    loadCounts();
  }, []);

  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Resumen
        </p>
        <h1 className="text-2xl font-medium text-foreground">Panel administrativo</h1>
        <p className="text-sm text-muted-foreground">
          Supervisión centralizada de usuarios, tickets y servicios.
        </p>
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
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salud backend</p>
            <HeartPulse className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "—" : healthStatus === "ok" ? "Operativo" : "Con incidencias"}
          </p>
          <p className="text-xs text-muted-foreground">Fuente: /api/health</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Modelo IA</p>
            <Cpu className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {loading
              ? "—"
              : modelStatus
                ? `${modelStatus.enabled ? "Activo" : "Apagado"} · ${modelStatus.version}`
                : "Sin datos"}
          </p>
          <p className="text-xs text-muted-foreground">
            Salud: {modelStatus ? (modelStatus.healthy ? "OK" : "Degradado") : "N/D"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Accesos</p>
            <Shield className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-2xl font-semibold text-foreground">Admin</p>
          <p className="text-xs text-muted-foreground">Usa los accesos rápidos para navegar.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Salud backend</p>
            <HeartPulse className="w-4 h-4 text-foreground" />
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {loading ? "—" : healthStatus === "ok" ? "Operativo" : "Con incidencias"}
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
            {loading
              ? "—"
              : modelStatus
                ? `${modelStatus.enabled ? "Activo" : "Apagado"} · ${modelStatus.version}`
                : "Sin datos"}
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
            {countsLoading ? "…" : usersCount}
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
            {countsLoading ? "…" : ticketsCount}
          </p>
          <p className="text-xs text-muted-foreground">
            Abiertos / SLA crítico
          </p>
        </div>
      </section>

      {countsError && (
        <div className="rounded-2xl border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
          {countsError}
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
