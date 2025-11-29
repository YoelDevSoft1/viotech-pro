"use client";

import { useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Ticket,
  MessageSquare,
  User,
  Calendar,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectTimeline } from "@/lib/hooks/useProjectTimeline";
import type { TimelineEvent, TimelineFilters } from "@/lib/types/timeline";

interface ProjectTimelineProps {
  projectId: string;
  filters?: TimelineFilters;
}

// Icono según tipo de evento
function getEventIcon(type: TimelineEvent["type"]) {
  switch (type) {
    case "ticket_created":
      return <Ticket className="w-4 h-4" />;
    case "ticket_updated":
    case "ticket_status_changed":
      return <ArrowRight className="w-4 h-4" />;
    case "ticket_assigned":
      return <User className="w-4 h-4" />;
    case "ticket_commented":
    case "comment_added":
      return <MessageSquare className="w-4 h-4" />;
    case "project_created":
      return <CheckCircle className="w-4 h-4" />;
    case "project_updated":
    case "project_status_changed":
      return <Clock className="w-4 h-4" />;
    case "milestone_reached":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
}

// Color según tipo de evento
function getEventColor(type: TimelineEvent["type"]) {
  switch (type) {
    case "ticket_created":
      return "bg-blue-500";
    case "ticket_updated":
    case "ticket_status_changed":
      return "bg-yellow-500";
    case "ticket_assigned":
      return "bg-purple-500";
    case "ticket_commented":
    case "comment_added":
      return "bg-green-500";
    case "project_created":
      return "bg-emerald-500";
    case "project_updated":
    case "project_status_changed":
      return "bg-orange-500";
    case "milestone_reached":
      return "bg-pink-500";
    default:
      return "bg-gray-500";
  }
}

// Badge según tipo de evento
function getEventBadge(type: TimelineEvent["type"]) {
  const labels: Record<TimelineEvent["type"], string> = {
    ticket_created: "Ticket Creado",
    ticket_updated: "Ticket Actualizado",
    ticket_status_changed: "Estado Cambiado",
    ticket_assigned: "Ticket Asignado",
    ticket_commented: "Comentario",
    project_created: "Proyecto Creado",
    project_updated: "Proyecto Actualizado",
    project_status_changed: "Estado Proyecto",
    milestone_reached: "Hito Alcanzado",
    comment_added: "Comentario",
  };

  return labels[type] || "Evento";
}

// Componente de evento individual
function TimelineEventItem({ event }: { event: TimelineEvent }) {
  const date = new Date(event.timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  const isThisWeek = date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  const timeLabel = isToday
    ? "Hoy"
    : isThisWeek
      ? formatDistanceToNow(date, { addSuffix: true, locale: es })
      : format(date, "dd MMM yyyy", { locale: es });

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex gap-4 relative">
      {/* Línea vertical */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-full ${getEventColor(event.type)} text-white flex items-center justify-center flex-shrink-0`}
        >
          {getEventIcon(event.type)}
        </div>
        <div className="w-0.5 h-full bg-border mt-2" />
      </div>

      {/* Contenido del evento */}
      <div className="flex-1 pb-6 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{event.title}</h4>
              <Badge variant="secondary" className="text-xs">
                {getEventBadge(event.type)}
              </Badge>
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
            {event.metadata?.oldStatus && event.metadata?.newStatus && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded bg-muted">
                  {event.metadata.oldStatus}
                </span>
                <ArrowRight className="w-3 h-3" />
                <span className="px-2 py-0.5 rounded bg-muted">
                  {event.metadata.newStatus}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{timeLabel}</span>
          </div>
        </div>

        {/* Usuario */}
        {event.userName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="w-5 h-5">
              <AvatarImage src={event.userAvatar || undefined} alt={event.userName} />
              <AvatarFallback className="text-[10px]">
                {getUserInitials(event.userName)}
              </AvatarFallback>
            </Avatar>
            <span>{event.userName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente principal
export function ProjectTimeline({ projectId, filters }: ProjectTimelineProps) {
  const { data: events = [], isLoading, error } = useProjectTimeline(projectId, filters);

  // Agrupar eventos por fecha
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};

    events.forEach((event) => {
      const dateKey = format(new Date(event.timestamp), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }, [events]);

  const sortedDates = useMemo(() => {
    return Object.keys(eventsByDate).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [eventsByDate]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline del Proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Error al cargar timeline: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay eventos en el timeline aún.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timeline del Proyecto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const date = new Date(dateKey);
            const isToday = date.toDateString() === new Date().toDateString();
            const isYesterday =
              date.toDateString() ===
              new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

            const dateLabel = isToday
              ? "Hoy"
              : isYesterday
                ? "Ayer"
                : format(date, "EEEE, d 'de' MMMM", { locale: es });

            return (
              <div key={dateKey} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {dateLabel}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-0">
                  {eventsByDate[dateKey].map((event) => (
                    <TimelineEventItem key={event.id} event={event} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

