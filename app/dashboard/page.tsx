"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Headphones,
  LogOut,
  Shield,
  Sparkles,
  TrendingUp,
  Users2,
} from "lucide-react";
import { buildApiUrl } from "@/lib/api";

type Service = {
  id: string;
  nombre: string;
  tipo: "licencia" | "landing-page" | string;
  estado: "activo" | "expirado" | "pendiente" | string;
  fecha_compra?: string | null;
  fecha_expiracion?: string | null;
  progreso?: number | null;
  precio?: number | null;
};

type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  type: "renovacion" | "kickoff";
  serviceName: string;
};

const TOKEN_KEYS = ["viotech_token", "authTokenVioTech"];
const USERNAME_KEYS = ["viotech_user_name", "userNameVioTech"];

const formatDate = (value?: string | null) => {
  if (!value) return "Por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por definir";
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const computeProgressFromDates = (service: Service) => {
  if (!service.fecha_compra || !service.fecha_expiracion) return undefined;
  const start = new Date(service.fecha_compra).getTime();
  const end = new Date(service.fecha_expiracion).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return service.estado === "expirado" ? 100 : undefined;
  }
  const total = end - start;
  const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
  return Math.round((elapsed / total) * 100);
};

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

const ServiceCard = ({ service }: { service: Service }) => {
  const progress =
    typeof service.progreso === "number"
      ? service.progreso
      : computeProgressFromDates(service);

  const statusBadge = {
    activo: "bg-green-100 text-green-800 border border-green-200",
    expirado: "bg-red-100 text-red-800 border border-red-200",
    pendiente: "bg-amber-100 text-amber-800 border border-amber-200",
  }[service.estado] || "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <div className="rounded-3xl border border-border/70 bg-background/70 p-6 space-y-4 hover:border-border transition-colors">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">
            {service.tipo === "licencia" ? "Licencia" : "Proyecto"}
          </p>
          <h4 className="text-xl font-medium text-foreground">{service.nombre}</h4>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
          {service.estado}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Inicio</p>
          <p className="text-foreground">{formatDate(service.fecha_compra)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Renovación</p>
          <p className="text-foreground">{formatDate(service.fecha_expiracion)}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div>
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">
            <span>Estatus</span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-border">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {service.precio ? `$${service.precio?.toLocaleString("es-CO")}` : "Proyecto a medida"}
        </span>
        <button className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:gap-3 transition-all">
          Revisar entregables
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
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

const TimelineCard = ({ event }: { event: TimelineEvent }) => (
  <div className="rounded-2xl border border-border/70 p-4 space-y-1">
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      {event.type === "renovacion" ? "Renovación" : "Kickoff"}
    </p>
    <p className="text-sm font-medium text-foreground">{event.title}</p>
    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
  </div>
);

const QuickAction = ({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noreferrer"
    className="rounded-2xl border border-border/60 p-4 hover:bg-muted/30 transition-colors"
  >
    <p className="text-sm font-medium text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground">{description}</p>
  </Link>
);

export default function DashboardPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const fetchServices = useCallback(
    async (token: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(buildApiUrl("/services/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        clearStorages([...TOKEN_KEYS, ...USERNAME_KEYS]);
        router.replace("/login?from=/dashboard&reason=unauthorized");
        return;
      }

      if (!response.ok || !Array.isArray(payload?.data)) {
        throw new Error(payload?.error || payload?.message || "No se pudo cargar el panel.");
      }

      const normalizedServices: Service[] = payload.data.map((service: Service) => ({
        ...service,
        progreso:
          typeof service.progreso === "number"
            ? service.progreso
            : computeProgressFromDates(service),
      }));

      setServices(normalizedServices);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error ? fetchError.message : "Error desconocido al cargar el panel.";
      setError(message);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const storedToken = getFromStorage(TOKEN_KEYS);
    const storedName = getFromStorage(USERNAME_KEYS);

    if (!storedToken) {
      router.replace("/login?from=/dashboard&reason=no_token");
      return;
    }

    setUserName(storedName);
    fetchServices(storedToken);
  }, [router, fetchServices]);

  const metrics = useMemo(() => {
    if (!services.length) {
      return [
        { title: "Servicios activos", value: "0", description: "Esperando tu próximo proyecto" },
        { title: "Próxima renovación", value: "Por definir", description: "Sin fechas programadas" },
        { title: "SLA", value: "99.95%", description: "Acuerdo activo para top tier" },
      ];
    }

    const activeServices = services.filter((service) => service.estado === "activo");
    const sortedRenewals = [...services]
      .filter((service) => service.fecha_expiracion)
      .sort(
        (a, b) =>
          new Date(a.fecha_expiracion || "").getTime() -
          new Date(b.fecha_expiracion || "").getTime(),
      );

    const avgProgress =
      Math.round(
        (activeServices.reduce(
          (acc, service) => acc + (service.progreso ?? computeProgressFromDates(service) ?? 0),
          0,
        ) /
          (activeServices.length || 1)) *
          10,
      ) / 10;

    return [
      {
        title: "Servicios activos",
        value: `${activeServices.length}`,
        description: "Proyectos enterprise en ejecución",
      },
      {
        title: "Próxima renovación",
        value: sortedRenewals.length ? formatDate(sortedRenewals[0].fecha_expiracion) : "Por definir",
        description: sortedRenewals.length ? sortedRenewals[0].nombre : "Sin proyectos pendientes",
      },
      {
        title: "Avance promedio",
        value: `${Number.isFinite(avgProgress) ? avgProgress : 0}%`,
        description: "KPIs globales del trimestre",
      },
    ];
  }, [services]);

  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!services.length) return [];

    const events = services.flatMap((service) => {
      const kickoffEvent = service.fecha_compra
        ? [
            {
              id: `${service.id}-kickoff`,
              title: `Kickoff ${service.nombre}`,
              date: service.fecha_compra,
              type: "kickoff",
              serviceName: service.nombre,
            } satisfies TimelineEvent,
          ]
        : [];

      const renewalEvent = service.fecha_expiracion
        ? [
            {
              id: `${service.id}-renewal`,
              title: `Renovación ${service.nombre}`,
              date: service.fecha_expiracion,
              type: "renovacion",
              serviceName: service.nombre,
            } satisfies TimelineEvent,
          ]
        : [];

      return [...kickoffEvent, ...renewalEvent];
    });

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ).slice(0, 4);
  }, [services]);

  const isTopTier = services.length > 0;

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

        {loading && (
          <section className="rounded-3xl border border-border/70 bg-background/80 p-10 text-center space-y-4">
            <p className="text-lg text-muted-foreground">Sincronizando con tu Command Center...</p>
            <p className="text-sm text-muted-foreground">Tus datos se cargan con cifrado end-to-end.</p>
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-red-500/40 bg-red-500/5 p-8 space-y-3">
            <p className="text-sm font-medium text-red-500">No pudimos cargar tu panel.</p>
            <p className="text-sm text-red-500/80">{error}</p>
            <button
              className="inline-flex items-center gap-2 text-xs font-medium text-red-500 underline"
              onClick={() => {
                const storedToken = getFromStorage(TOKEN_KEYS);
                if (storedToken) fetchServices(storedToken);
              }}
            >
              Reintentar
            </button>
          </section>
        )}

        {!loading && !error && (
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

            <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-foreground">Servicios activos</h2>
                {services.length === 0 ? (
                  <div className="rounded-3xl border border-border/70 bg-background/80 p-8 text-center space-y-3">
                    <p className="text-lg text-foreground">Aún no has activado tu primer proyecto.</p>
                    <p className="text-sm text-muted-foreground">
                      Agenda un discovery call para priorizar el backlog y recibir un plan de acción.
                    </p>
                    <a
                      href="https://wa.link/1r4ul7"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-105 transition-transform"
                    >
                      Hablar con un consultor
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl font-medium text-foreground">Roadmap inmediato</h2>
                {timeline.length ? (
                  <div className="space-y-4">
                    {timeline.map((event) => (
                      <TimelineCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-6 text-sm text-muted-foreground">
                    No hay hitos calendarizados todavía. Nuestro equipo puede ayudarte a definir el
                    siguiente release.
                  </div>
                )}
                <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
                  <p className="text-sm font-medium text-foreground">Mesa de soporte VIP</p>
                  <p className="text-sm text-muted-foreground">
                    Respuesta prioritaria <strong>en menos de 2 minutos</strong> vía WhatsApp o canal
                    privado de Slack. Tu squad está disponible 24/7.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <QuickAction
                      title="Canal WhatsApp"
                      description="Contacta al ingeniero on-call"
                      href="https://wa.link/1r4ul7"
                    />
                    <QuickAction
                      title="Agendar sesión"
                      description="Reunión con tu Product Manager"
                      href="https://calendly.com/viotech/demo"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-muted/20 p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Reportes ejecutivos
                  </p>
                  <h3 className="text-2xl font-medium text-foreground">
                    Insights del trimestre y próximos pasos.
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-2xl">
                    Consolidamos métricas de performance, satisfacción de usuarios y backlog priorizado
                    para que puedas tomar decisiones con claridad.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <QuickAction
                    title="Último reporte PDF"
                    description="Descarga y compártelo con tu junta directiva"
                    href="mailto:contacto@viotech.com.co?subject=Solicitar%20reporte%20ejecutivo"
                  />
                  <QuickAction
                    title="Cargar briefing"
                    description="Comparte nuevos requerimientos del Q"
                    href="https://viotech.com.co/#contact"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                  <TrendingUp className="w-5 h-5 text-foreground" />
                  <p className="text-lg font-medium text-foreground">+18% velocidad</p>
                  <p className="text-sm text-muted-foreground">Incremento promedio tras 2 sprints.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                  <CalendarDays className="w-5 h-5 text-foreground" />
                  <p className="text-lg font-medium text-foreground">Roadmap listo</p>
                  <p className="text-sm text-muted-foreground">Los siguientes releases están definidos.</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/80 p-5 space-y-2">
                  <Headphones className="w-5 h-5 text-foreground" />
                  <p className="text-lg font-medium text-foreground">SLA cumplido</p>
                  <p className="text-sm text-muted-foreground">Monitoreo 24/7 y soporte ejecutado.</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-border/70 bg-background/80 p-8 space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Checklist ejecutivo</p>
                  <p className="text-xs text-muted-foreground">
                    Seguimiento quincenal de acciones clave con tu squad.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Validar entregables del sprint actual",
                  "Confirmar alcance de la próxima iteración",
                  "Actualizar stakeholders internos",
                  "Definir aprobaciones de seguridad/compliance",
                ].map((task) => (
                  <label
                    key={task}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 p-4 text-sm"
                  >
                    <input type="checkbox" className="mt-1 accent-foreground" />
                    <span>{task}</span>
                  </label>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
