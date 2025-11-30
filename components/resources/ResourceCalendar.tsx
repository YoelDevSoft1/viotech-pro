"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResources, useResourceCalendar } from "@/lib/hooks/useResources";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale/es";
import type { ResourceCalendarEvent } from "@/lib/types/resources";
import { cn } from "@/lib/utils";

interface ResourceCalendarProps {
  organizationId?: string;
}

// Colores por tipo de evento
const eventColors: Record<string, string> = {
  task: "bg-blue-500",
  vacation: "bg-orange-500",
  unavailable: "bg-gray-500",
  meeting: "bg-purple-500",
};

export function ResourceCalendar({ organizationId }: ResourceCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lunes
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Obtener recursos
  const { data: resources = [], isLoading: resourcesLoading } = useResources({
    organizationId,
  });

  // Obtener eventos del calendario
  const { data: events = [], isLoading: eventsLoading } = useResourceCalendar(
    selectedResources.length > 0 ? selectedResources : resources.slice(0, 5).map((r) => r.id),
    weekStart,
    weekEnd
  );

  // Agrupar eventos por recurso y día
  const eventsByResourceAndDay = useMemo(() => {
    const grouped: Record<string, Record<string, ResourceCalendarEvent[]>> = {};

    events.forEach((event) => {
      const dayKey = format(event.start, "yyyy-MM-dd");
      if (!grouped[event.resourceId]) {
        grouped[event.resourceId] = {};
      }
      if (!grouped[event.resourceId][dayKey]) {
        grouped[event.resourceId][dayKey] = [];
      }
      grouped[event.resourceId][dayKey].push(event);
    });

    return grouped;
  }, [events]);

  // Días de la semana
  const weekDays = useMemo(() => {
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [weekStart, weekEnd]);

  // Recursos seleccionados o todos
  const displayResources = useMemo(() => {
    if (selectedResources.length > 0) {
      return resources.filter((r) => selectedResources.includes(r.id));
    }
    return resources.slice(0, 5); // Mostrar primeros 5 por defecto
  }, [resources, selectedResources]);

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  if (resourcesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Calendario de Recursos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Select
            value={selectedResources.length > 0 ? "selected" : "all"}
            onValueChange={(value) => {
              if (value === "all") {
                setSelectedResources([]);
              }
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar recursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los recursos</SelectItem>
              {resources.map((resource) => (
                <SelectItem
                  key={resource.id}
                  value={resource.id}
                  onClick={() => {
                    if (selectedResources.includes(resource.id)) {
                      setSelectedResources(selectedResources.filter((id) => id !== resource.id));
                    } else {
                      setSelectedResources([...selectedResources, resource.id]);
                    }
                  }}
                >
                  {resource.userName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendario */}
        <div className="border rounded-lg overflow-hidden">
          {/* Header con días de la semana */}
          <div className="grid grid-cols-8 border-b bg-muted/50">
            <div className="p-2 font-medium text-sm">Recurso</div>
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="p-2 text-center border-l">
                <div className="text-xs text-muted-foreground">
                  {format(day, "EEE", { locale: es })}
                </div>
                <div className="text-sm font-medium">
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Filas de recursos */}
          {eventsLoading ? (
            <div className="p-8 text-center">
              <Skeleton className="h-20 w-full" />
            </div>
          ) : displayResources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No hay recursos disponibles
            </div>
          ) : (
            <div className="divide-y">
              {displayResources.map((resource) => (
                <div key={resource.id} className="grid grid-cols-8">
                  {/* Nombre del recurso */}
                  <div className="p-3 border-r flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{resource.userName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {resource.userEmail}
                      </div>
                    </div>
                    <Badge
                      variant={
                        resource.availability.status === "available"
                          ? "default"
                          : resource.availability.status === "busy"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {resource.availability.status === "available"
                        ? "Disponible"
                        : resource.availability.status === "busy"
                          ? "Ocupado"
                          : resource.availability.status === "on_leave"
                            ? "En vacaciones"
                            : "No disponible"}
                    </Badge>
                  </div>

                  {/* Días de la semana */}
                  {weekDays.map((day) => {
                    const dayKey = format(day, "yyyy-MM-dd");
                    const dayEvents =
                      eventsByResourceAndDay[resource.id]?.[dayKey] || [];

                    return (
                      <div
                        key={day.toISOString()}
                        className="p-2 border-l min-h-[80px] space-y-1"
                      >
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-1 rounded cursor-pointer hover:opacity-80",
                              eventColors[event.type] || "bg-gray-500",
                              "text-white"
                            )}
                            title={event.title}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-90">
                              {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500" />
            <span>Tarea</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>Vacaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500" />
            <span>No disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-500" />
            <span>Reunión</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

