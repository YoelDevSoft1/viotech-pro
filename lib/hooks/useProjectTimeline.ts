import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { TimelineEvent, TimelineFilters } from "@/lib/types/timeline";
import type { Ticket } from "./useTickets";

// Tipos para comentarios de tickets
interface TicketComment {
  id: string;
  contenido?: string;
  content?: string;
  createdAt?: string;
  created_at?: string;
  usuarioId?: string;
  userId?: string;
  usuarioNombre?: string;
  userName?: string;
}

// Convertir tickets a eventos de timeline
function ticketsToTimelineEvents(tickets: Ticket[], projectId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  tickets.forEach((ticket) => {
    // Evento de creación
    if (ticket.createdAt) {
      events.push({
        id: `ticket-created-${ticket.id}`,
        type: "ticket_created",
        title: `Ticket creado: ${ticket.titulo}`,
        description: ticket.descripcion || undefined,
        timestamp: ticket.createdAt,
        userId: ticket.usuario?.email || undefined,
        userName: ticket.usuario?.nombre || undefined,
        metadata: {
          ticketId: ticket.id,
          ticketTitle: ticket.titulo,
          projectId,
        },
      });
    }

    // Evento de actualización
    if (ticket.updatedAt && ticket.updatedAt !== ticket.createdAt) {
      events.push({
        id: `ticket-updated-${ticket.id}`,
        type: "ticket_updated",
        title: `Ticket actualizado: ${ticket.titulo}`,
        timestamp: ticket.updatedAt,
        metadata: {
          ticketId: ticket.id,
          ticketTitle: ticket.titulo,
          projectId,
        },
      });
    }

    // Evento de cambio de estado (si hay comentarios que indiquen cambios)
    if (ticket.comentarios && Array.isArray(ticket.comentarios) && ticket.comentarios.length > 0) {
      ticket.comentarios.forEach((comment: TicketComment, index: number) => {
        const commentDate = comment.createdAt || comment.created_at;
        if (commentDate) {
          events.push({
            id: `ticket-comment-${ticket.id}-${index}`,
            type: "ticket_commented",
            title: `Comentario en: ${ticket.titulo}`,
            description: comment.contenido || comment.content,
            timestamp: commentDate,
            userId: comment.usuarioId || comment.userId,
            userName: comment.usuarioNombre || comment.userName,
            metadata: {
              ticketId: ticket.id,
              ticketTitle: ticket.titulo,
              commentId: comment.id,
              commentContent: comment.contenido || comment.content,
              projectId,
            },
          });
        }
      });
    }
  });

  return events;
}

// Hook para obtener timeline de un proyecto
export function useProjectTimeline(projectId: string, filters?: TimelineFilters) {
  return useQuery({
    queryKey: ["project-timeline", projectId, filters],
    queryFn: async (): Promise<TimelineEvent[]> => {
      // Obtener tickets del proyecto
      const params: any = {
        projectId,
        limit: 1000,
      };

      const { data } = await apiClient.get("/tickets", { params });
      const tickets = (data?.data?.tickets || data?.data || []) as Ticket[];

      // Convertir tickets a eventos
      let events = ticketsToTimelineEvents(tickets, projectId);

      // Aplicar filtros
      if (filters?.startDate) {
        events = events.filter(
          (e) => new Date(e.timestamp) >= new Date(filters.startDate!)
        );
      }

      if (filters?.endDate) {
        events = events.filter(
          (e) => new Date(e.timestamp) <= new Date(filters.endDate!)
        );
      }

      if (filters?.eventTypes && filters.eventTypes.length > 0) {
        events = events.filter((e) => filters.eventTypes!.includes(e.type));
      }

      if (filters?.userId) {
        events = events.filter((e) => e.userId === filters.userId);
      }

      if (filters?.ticketId) {
        events = events.filter((e) => e.metadata?.ticketId === filters.ticketId);
      }

      // Ordenar por fecha (más reciente primero)
      return events.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!projectId,
    staleTime: 1000 * 60, // 1 minuto
    retry: 1,
  });
}

