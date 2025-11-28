"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useServices } from "@/lib/hooks/useServices";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    activo: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400 dark:bg-green-500/20",
    expirado: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400 dark:bg-red-500/20",
    pendiente: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/20",
  }[service.estado] || "bg-muted text-muted-foreground border-border";

  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.3em]">
            {service.tipo === "licencia" ? "Licencia" : "Proyecto"}
          </p>
          <h4 className="text-xl font-medium text-foreground">{service.nombre}</h4>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusBadge} capitalize`}>
          {service.estado}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Inicio</p>
          <p className="text-sm font-medium text-foreground">{formatDate(service.fecha_compra)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Renovación</p>
          <p className="text-sm font-medium text-foreground">{formatDate(service.fecha_expiracion)}</p>
        </div>
      </div>
      {typeof progress === "number" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Progreso</span>
            <span className="text-foreground font-semibold">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-sm font-medium text-foreground">
          {service.precio ? `$${service.precio?.toLocaleString("es-CO")}` : "Proyecto a medida"}
        </span>
        <button className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:gap-3 transition-all">
          Revisar entregables
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
      </CardContent>
    </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Servicios activos</CardTitle>
        <CardDescription>Gestiona tus proyectos y licencias activas</CardDescription>
      </CardHeader>
      <CardContent>
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
              <div className="flex items-center justify-between text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="text-muted-foreground">
                  {page + 1} / {Math.ceil(services.length / 4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(services.length / 4) - 1))}
                  disabled={page >= Math.ceil(services.length / 4) - 1}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
