"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Ticket, Users, FolderKanban, AlertTriangle, ShieldCheck, Radar } from "lucide-react";
import OrgSelector from "@/components/OrgSelector";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

type AlertItem = {
  id: string;
  type: string;
  title: string;
  severity: "info" | "warn" | "crit";
  detail?: string;
  createdAt?: string;
};

export default function InternalHome() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlerts = async () => {
      setAlertsError(null);
      let token = getAccessToken();
      if (!token) return;
      if (isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (refreshed) token = refreshed;
        else {
          await logout();
          router.replace("/login?from=/internal");
          return;
        }
      }
      try {
        const res = await fetch(buildApiUrl("/health"), {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload) throw new Error("No se pudo cargar alertas");
        const data = payload.data || payload;
        const list = Array.isArray(data.alerts)
          ? data.alerts
          : Array.isArray(data)
            ? data
            : [];
        const mapped = list.map((a: any, idx: number): AlertItem => ({
          id: String(a.id || idx),
          type: a.type || "health",
          title: a.title || "Alerta",
          severity: (a.severity || a.level || "warn").toLowerCase() as AlertItem["severity"],
          detail: a.detail || a.description || "",
          createdAt: a.createdAt || a.created_at || new Date().toISOString(),
        }));
        setAlerts(mapped);
      } catch (err) {
        setAlertsError(
          err instanceof Error ? err.message : "No se pudo cargar el feed de alertas",
        );
        // Fallback mock
        setAlerts([
          {
            id: "mock-sla",
            type: "sla",
            title: "SLA crítico en Ticket #123",
            severity: "crit",
            detail: "Ticket con vencimiento en 1h.",
          },
          {
            id: "mock-ia",
            type: "ia",
            title: "Modelo IA en modo heurístico",
            severity: "warn",
            detail: "Revisar estado del predictor en Render.",
          },
        ]);
      }
    };
    loadAlerts();
  }, [router]);

  const severityBadge = (sev: AlertItem["severity"]) => {
    const tone =
      sev === "crit"
        ? "bg-red-500/15 text-red-700 border-red-500/40"
        : sev === "warn"
          ? "bg-amber-500/15 text-amber-700 border-amber-500/40"
          : "bg-foreground/10 text-foreground border-foreground/30";
    return (
      <span className={`text-[11px] rounded-full px-2 py-0.5 border ${tone}`}>
        {sev === "crit" ? "Crítico" : sev === "warn" ? "Alerta" : "Info"}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Panel interno
          </p>
          <h1 className="text-3xl font-medium text-foreground">Operaciones y soporte</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tickets de todos los clientes, proyectos y alertas críticas.
          </p>
        </div>

        <section className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Organización
              </p>
              <p className="text-sm text-muted-foreground">
                Selecciona organización (se guarda localmente). Si la API no responde, se usan orgs mock.
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          </div>
          <OrgSelector />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Link
            href="/internal/tickets"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Ticket className="w-4 h-4" />
              Tickets globales
            </div>
            <p className="text-xs text-muted-foreground">
              Visualiza y gestiona tickets de todos los clientes.
            </p>
          </Link>
          <Link
            href="/admin/users"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Users className="w-4 h-4" />
              Usuarios/roles
            </div>
            <p className="text-xs text-muted-foreground">Cambia roles y verifica cuentas.</p>
          </Link>
          <Link
            href="/internal/projects"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FolderKanban className="w-4 h-4" />
              Proyectos
            </div>
            <p className="text-xs text-muted-foreground">Ver proyectos activos y sus tickets.</p>
          </Link>
          <Link
            href="/admin/tickets"
            className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2 hover:border-border transition-colors"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Radar className="w-4 h-4" />
              Admin · Tickets
            </div>
            <p className="text-xs text-muted-foreground">Vista global admin con edición rápida.</p>
          </Link>
        </section>

        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              Alertas críticas (SLA, salud, IA, pagos)
            </div>
            {alertsError && (
              <span className="text-[11px] text-amber-700">{alertsError}</span>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="text-sm text-amber-800">
              No hay alertas activas en este momento.
            </p>
          ) : (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-amber-500/30 bg-background/70 p-3 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {severityBadge(a.severity)}
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    {a.detail && <p className="text-sm text-muted-foreground">{a.detail}</p>}
                  </div>
                  {a.createdAt && (
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
