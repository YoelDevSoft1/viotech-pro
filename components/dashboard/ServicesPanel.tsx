"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useServices } from "@/lib/hooks/useServices";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";

type Service = {
  id: string;
  nombre: string;
  tipo?: string;
  estado: string;
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

const TimelineCard = ({ event }: { event: TimelineEvent }) => (
  <div className="rounded-2xl border border-border/70 p-4 space-y-1">
    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      {event.type === "renovacion" ? "Renovación" : "Kickoff"}
    </p>
    <p className="text-sm font-medium text-foreground">{event.title}</p>
    <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
  </div>
);

export function ServicesPanel() {
  const { services, loading: servicesLoading, error: servicesError } = useServices();
  const [page, setPage] = useState(0);

  useEffect(() => {
    const totalPages = Math.ceil(services.length / 4);
    if (page >= totalPages) setPage(totalPages > 0 ? totalPages - 1 : 0);
  }, [services, page]);

  const timeline = useMemo<TimelineEvent[]>(() => {
    if (!services.length) return [];

    const events = services.flatMap((service) => {
      const kickoff = service.fecha_compra
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
      const renewal = service.fecha_expiracion
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
      return [...kickoff, ...renewal];
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4);
  }, [services]);

  if (servicesLoading) return <LoadingState title="Sincronizando servicios..." />;
  if (servicesError) return <ErrorState message={servicesError || "No se pudo cargar servicios."} />;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-8">
      <div className="space-y-6">
        <h2 className="text-2xl font-medium text-foreground">Servicios activos</h2>
        {services.length === 0 ? (
          <EmptyState
            title="Aún no has activado tu primer proyecto."
            message="Agenda un discovery call para priorizar el backlog y recibir un plan de acción."
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.slice(page * 4, page * 4 + 4).map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
            {services.length > 4 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:bg-muted/40 transition-colors"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  Anterior
                </button>
                <p>
                  {page + 1} / {Math.ceil(services.length / 4)}
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:bg-muted/40 transition-colors"
                  onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(services.length / 4) - 1))}
                  disabled={page >= Math.ceil(services.length / 4) - 1}
                >
                  Siguiente
                </button>
              </div>
            )}
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
          <EmptyState
            title="Sin hitos calendarizados"
            message="Define el siguiente release con tu PM."
          />
        )}
        <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
          <p className="text-sm font-medium text-foreground">Mesa de soporte VIP</p>
          <p className="text-sm text-muted-foreground">
            Respuesta prioritaria <strong>en menos de 2 minutos</strong> vía WhatsApp o canal privado de
            Slack. Tu squad está disponible 24/7.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <a
              href="https://wa.link/1r4ul7"
              className="rounded-2xl border border-border/70 bg-background/70 p-4 hover:bg-muted/30 transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Canal WhatsApp
            </a>
            <a
              href="https://calendly.com/viotech/demo"
              className="rounded-2xl border border-border/70 bg-background/70 p-4 hover:bg-muted/30 transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              Agendar sesión
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
