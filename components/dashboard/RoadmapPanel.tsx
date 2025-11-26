"use client";

import { useMemo } from "react";
import { CalendarClock, Compass, ArrowRight } from "lucide-react";
import { useServices } from "@/lib/hooks/useServices";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";

type TimelineEvent = {
  id: string;
  title: string;
  date: string;
  type: "renovacion" | "kickoff";
};

const formatDate = (value?: string | null) => {
  if (!value) return "Por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por definir";
  return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
};

export function RoadmapPanel() {
  const { services, loading, error } = useServices();

  const upcoming = useMemo<TimelineEvent[]>(() => {
    const events = services.flatMap((service) => {
      const kickoff = service.fecha_compra
        ? [{ id: `${service.id}-kickoff`, title: `Kickoff ${service.nombre}`, date: service.fecha_compra, type: "kickoff" as const }]
        : [];
      const renewal = service.fecha_expiracion
        ? [{ id: `${service.id}-renewal`, title: `Renovación ${service.nombre}`, date: service.fecha_expiracion, type: "renovacion" as const }]
        : [];
      return [...kickoff, ...renewal];
    });

    return events
      .filter((event) => {
        const time = new Date(event.date).getTime();
        if (Number.isNaN(time)) return false;
        return time >= Date.now() - 1000 * 60 * 60 * 24 * 7; // incluye la última semana y futuro
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [services]);

  if (loading) return <LoadingState title="Cargando roadmap inmediato..." />;
  if (error) return <ErrorState message={error} />;
  if (!services.length) return <EmptyState title="Sin servicios aún" message="Activa tu primer proyecto para ver hitos y renovaciones." />;

  return (
    <section className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Roadmap inmediato</p>
          <h2 className="text-2xl font-medium text-foreground">Siguientes hitos</h2>
        </div>
        <Compass className="w-5 h-5 text-muted-foreground" />
      </div>

      {upcoming.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {upcoming.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/70 bg-background/60 p-4 space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {item.type === "renovacion" ? "Renovación" : "Kickoff"}
              </p>
              <p className="text-xl font-medium text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground">{formatDate(item.date)}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Sin hitos calendarizados"
          message="Define próximos releases con tu PM para verlos aquí."
        />
      )}

      <div className="rounded-2xl border border-border/70 bg-background/70 p-4 flex items-center justify-between">
        <div className="space-y-1 text-sm">
          <p className="text-foreground font-medium">Coordina el siguiente release</p>
          <p className="text-muted-foreground">Agenda con tu PM para priorizar backlog y despliegues.</p>
        </div>
        <a
          href="https://calendly.com/viotech/demo"
          className="inline-flex items-center gap-2 text-xs font-medium text-foreground hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Agendar
          <ArrowRight className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
}
