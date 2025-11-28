"use client";

import { useMemo } from "react";
import { Compass } from "lucide-react";
import { useServices } from "@/lib/hooks/useServices";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Roadmap</CardTitle>
            <CardDescription>Próximos hitos y renovaciones</CardDescription>
          </div>
          <Compass className="w-5 h-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length ? (
          <div className="space-y-3">
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 rounded-lg border bg-card">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {item.type === "renovacion" ? "Renovación" : "Kickoff"}
                  </p>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sin hitos calendarizados"
            message="Define próximos releases con tu PM."
          />
        )}
      </CardContent>
    </Card>
  );
}
