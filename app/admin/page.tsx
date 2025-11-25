"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Users, Ticket, Cpu, Activity, HeartPulse, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, refreshAccessToken, isTokenExpired, logout } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default function AdminDashboardPage() {
  const [healthStatus, setHealthStatus] = useState<string>("N/D");
  const [healthError, setHealthError] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<{ enabled: boolean; healthy: boolean; version: string } | null>(null);
  const [usersCount, setUsersCount] = useState<string>("N/D");
  const [ticketsCount, setTicketsCount] = useState<string>("N/D");
  const [servicesCount, setServicesCount] = useState<string>("N/D");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const orgRef = useRef<string | null>(null);

  const loadSummary = async (force?: boolean) => {
    if (inFlight.current) return;
    const now = Date.now();
    if (!force && cooldownUntil && now < cooldownUntil) return;
    inFlight.current = true;
    setLoading(true);
    setSummaryError(null);

    // Token
    let token = getAccessToken();
    if (token && isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        setSummaryError("Sesión expirada. Inicia sesión nuevamente.");
        inFlight.current = false;
        setLoading(false);
        return;
      }
    }

    // Auth/me para rol y org
    if (!token) {
      setSummaryError("No autenticado");
      inFlight.current = false;
      setLoading(false);
      return;
    }

    try {
      const authRes = await fetch(buildApiUrl("/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        credentials: "include",
      });
      const authPayload = await authRes.json().catch(() => null);
      if (!authRes.ok || !authPayload) throw new Error(authPayload?.error || "No se pudo leer perfil");
      const authData = authPayload.user || authPayload.data?.user || authPayload.data || authPayload;
      const org = authData.organizationId || authData.organization_id;
      if (org && typeof org === "string") {
        setOrganizationId(org);
        orgRef.current = org;
        setSummaryError(null);
      } else {
        setSummaryError("No hay organización asignada");
        inFlight.current = false;
        setLoading(false);
        return;
      }

      // Cargas en paralelo
      const headers: HeadersInit = { Authorization: `Bearer ${token}` };
      const orgParam = `?organizationId=${orgRef.current}`;
      const requests = await Promise.allSettled([
        fetch(buildApiUrl("/health"), { cache: "no-store" }),
        fetch(buildApiUrl("/predictions/model-status"), { cache: "no-store" }),
        fetch(buildApiUrl(`/metrics/dashboard${orgParam}`), { headers, cache: "no-store", credentials: "include" }),
        fetch(buildApiUrl(`/services/me${orgParam}`), { headers, cache: "no-store", credentials: "include" }),
        fetch(buildApiUrl(`/tickets${orgParam}&page=1&limit=1`), {
          headers,
          cache: "no-store",
          credentials: "include",
        }),
        fetch(buildApiUrl("/users"), { headers, cache: "no-store", credentials: "include" }),
      ]);

      // Health
      const healthRes = requests[0];
      if (healthRes.status === "fulfilled") {
        const payload = await healthRes.value.json().catch(() => null);
        if (healthRes.value.status === 429) setCooldownUntil(Date.now() + 60_000);
        const data = payload?.data || payload;
        const st = (payload?.status || data?.status || "").toString().toLowerCase();
        setHealthStatus(["ok", "up", "ready", "healthy"].includes(st) ? "OK" : st || "N/D");
        setHealthError(null);
      } else {
        setHealthStatus("N/D");
        setHealthError("Error /health");
      }

      // Modelo
      const modelRes = requests[1];
      if (modelRes.status === "fulfilled") {
        const payload = await modelRes.value.json().catch(() => null);
        const data = payload?.data || payload;
        setModelStatus({
          enabled: Boolean(data.enabled ?? data.status === "ready"),
          healthy: Boolean(data.lastStatus?.healthy ?? data.modelLoaded ?? data.enabled),
          version: data.modelVersion || data.version || "N/D",
        });
      } else {
        setModelStatus(null);
      }

      // Metrics (solo para saber que está ok; valores ya se muestran en health view)
      const metricsRes = requests[2];
      if (metricsRes.status === "fulfilled" && metricsRes.value.status === 429) {
        setCooldownUntil(Date.now() + 60_000);
      }

      // Servicios
      const servicesRes = requests[3];
      if (servicesRes.status === "fulfilled") {
        const payload = await servicesRes.value.json().catch(() => null);
        if (servicesRes.value.status === 429) setCooldownUntil(Date.now() + 60_000);
        const servicesArr = payload?.data?.services || payload?.services || payload?.data;
        if (servicesRes.value.ok && Array.isArray(servicesArr)) {
          setServicesCount(String(servicesArr.length));
        } else {
          setServicesCount("N/D");
        }
      } else {
        setServicesCount("N/D");
      }

      // Tickets
      const ticketsRes = requests[4];
      if (ticketsRes.status === "fulfilled") {
        const payload = await ticketsRes.value.json().catch(() => null);
        if (ticketsRes.value.status === 429) setCooldownUntil(Date.now() + 60_000);
        const total =
          payload?.data?.pagination?.total ||
          payload?.pagination?.total ||
          payload?.total ||
          payload?.count ||
          (Array.isArray(payload?.data?.tickets) ? payload.data.tickets.length : undefined);
        if (total !== undefined) setTicketsCount(String(total));
        else setTicketsCount("N/D");
      } else {
        setTicketsCount("N/D");
      }

      // Users
      const usersRes = requests[5];
      if (usersRes.status === "fulfilled") {
        const payload = await usersRes.value.json().catch(() => null);
        if (usersRes.value.status === 429) setCooldownUntil(Date.now() + 60_000);
        const arr = payload?.data?.users || payload?.users || payload?.data || [];
        if (Array.isArray(arr)) setUsersCount(String(arr.length));
        else setUsersCount("N/D");
      } else {
        setUsersCount("N/D");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error en resumen";
      setSummaryError(msg);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSummary(true)}
            disabled={loading}
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
            {loading ? "…" : healthStatus}
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
              ? "…"
              : modelStatus
                ? `${modelStatus.enabled ? "Activo" : "Apagado"} · ${modelStatus.version}`
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
            {loading ? "…" : usersCount}
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
            {loading ? "…" : ticketsCount}
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
            {loading ? "…" : servicesCount}
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
