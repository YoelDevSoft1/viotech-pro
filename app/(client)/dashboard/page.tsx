"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Shield, Sparkles, Users2 } from "lucide-react";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { LoadingState, ErrorState } from "@/components/ui/State";
import { ServicesPanel } from "@/components/dashboard/ServicesPanel";
import { TicketsPanel } from "@/components/dashboard/TicketsPanel";
import { SecurityPanel } from "@/components/dashboard/SecurityPanel";
import { RoadmapPanel } from "@/components/dashboard/RoadmapPanel";
import { QuickLinks } from "@/components/dashboard/QuickLinks";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const TOKEN_KEYS = ["viotech_token", "authTokenVioTech"];
const USERNAME_KEYS = ["viotech_user_name", "userNameVioTech"];

const getFromStorage = (keys: string[]) => {
  if (typeof window === "undefined") return null;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of keys) {
      const value = storage.getItem(key);
      if (value) return value;
    }
  }
  return null;
};

const clearStorages = (keys: string[]) => {
  if (typeof window === "undefined") return;
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of keys) {
      storage.removeItem(key);
    }
  }
};

const StatCard = ({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) => (
  <div className="rounded-3xl border border-border/70 bg-background/70 p-6 space-y-3">
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
    <p className="text-3xl font-medium text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tickets">("overview");
  const { metrics: metricsFromHook, loading: metricsHookLoading, error: metricsHookError } = useMetrics();
  const {
    modelStatus,
    loading: modelStatusLoading,
    error: modelStatusError,
    refresh: refreshModelStatus,
  } = useModelStatus();
  const overviewLoading = metricsHookLoading || modelStatusLoading;
  const overviewError = metricsHookError || modelStatusError;
  const isTopTier = Boolean(metricsFromHook?.serviciosActivos);

  useEffect(() => {
    const storedToken = getFromStorage(TOKEN_KEYS);
    const storedName = getFromStorage(USERNAME_KEYS);

    if (!storedToken) {
      router.replace("/login?from=/dashboard&reason=no_token");
      return;
    }

    setUserName(storedName);
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (activeTab === "tickets" && !token) {
      router.replace("/login?from=/dashboard&reason=no_token");
    }
  }, [activeTab, token, router]);

  const metrics = useMemo(() => {
    if (metricsFromHook) {
      return [
        {
          title: "Servicios activos",
          value: `${metricsFromHook.serviciosActivos ?? 0}`,
          description: "Proyectos enterprise en ejecución",
        },
        {
          title: "Próxima renovación",
          value: metricsFromHook.proximaRenovacion
            ? new Date(metricsFromHook.proximaRenovacion).toLocaleDateString("es-CO")
            : "Por definir",
          description: "Próximo servicio a renovar",
        },
        {
          title: "Avance promedio",
          value: `${metricsFromHook.avancePromedio ?? 0}%`,
          description: "KPIs globales del trimestre",
        },
        {
          title: "Tickets abiertos",
          value: `${metricsFromHook.ticketsAbiertos ?? 0}`,
          description: "Solicitudes de soporte activas",
        },
        {
          title: "Tickets resueltos",
          value: `${metricsFromHook.ticketsResueltos ?? 0}`,
          description: "Casos cerrados exitosamente",
        },
        {
          title: "SLA cumplido",
          value: `${metricsFromHook.slaCumplido ?? 0}%`,
          description: "Acuerdo activo para top tier",
        },
      ];
    }

    return [
      { title: "Servicios activos", value: "0", description: "Esperando tu próximo proyecto" },
      { title: "Próxima renovación", value: "Por definir", description: "Sin fechas programadas" },
      { title: "SLA", value: "99.95%", description: "Acuerdo activo para top tier" },
    ];
  }, [metricsFromHook]);

  const handleLogout = () => {
    clearStorages([...TOKEN_KEYS, ...USERNAME_KEYS]);
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-background px-6 py-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 md:p-12 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                Programa Top Tier
              </p>
              <h1 className="text-3xl sm:text-4xl font-medium text-foreground">
                {userName ? `Hola ${userName},` : "Hola,"} aquí tienes el pulso ejecutivo de tus
                proyectos.
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Consultoría, entregables y soporte VIP centralizados en un solo lugar. Seguimos el
                roadmap compartido y priorizamos tus hitos estratégicos.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
              <a
                href="https://calendly.com/viotech/demo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-105 transition-transform"
              >
                Agendar reunión ejecutiva
                <ArrowRight className="w-3 h-3" />
              </a>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                onClick={() => router.push("/client/tickets")}
              >
                Ir a tickets
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                onClick={() => router.push("/services")}
              >
                Ver servicios
              </button>
            </div>
          </div>
          {isTopTier ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-xs font-medium text-muted-foreground">
              <Shield className="w-4 h-4" />
              Top tier habilitado · SLA prioritario · Equipo dedicado
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-4 py-1 text-xs font-medium text-muted-foreground">
              <Users2 className="w-4 h-4" />
              Estamos listos para asignarte un PM dedicado. Contrata un plan enterprise.
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Breadcrumb
            items={[
              { href: "/", label: "Inicio" },
              { href: "/dashboard", label: "Dashboard" },
            ]}
          />
          {(
            [
              { key: "overview", label: "Resumen ejecutivo" },
              { key: "tickets", label: "Tickets & soporte" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {overviewLoading && (
              <LoadingState
                title="Sincronizando con tu Command Center..."
                message="Tus datos se cargan con cifrado end-to-end."
              />
            )}

            {overviewError && (
              <ErrorState title="No pudimos cargar tu panel." message={overviewError || undefined} />
            )}

            {!overviewLoading && !overviewError && (
              <>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {metrics.map((stat) => (
                    <StatCard
                      key={stat.title}
                      title={stat.title}
                      value={stat.value}
                      description={stat.description}
                    />
                  ))}
                </section>

                <ServicesPanel />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RoadmapPanel />
                  <SecurityPanel
                    modelStatus={modelStatus}
                    loading={modelStatusLoading}
                    error={modelStatusError || undefined}
                    onRefresh={refreshModelStatus}
                  />
                </div>

                <QuickLinks />
              </>
            )}
          </>
        )}

        {activeTab === "tickets" && (
          <TicketsPanel token={token} onRequireAuth={() => router.replace("/login?from=/dashboard")} />
        )}
      </div>
    </main>
  );
}
