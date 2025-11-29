// Tipos para el sistema de Timeline de proyectos

export type TimelineEventType =
  | "ticket_created"
  | "ticket_updated"
  | "ticket_status_changed"
  | "ticket_assigned"
  | "ticket_commented"
  | "project_created"
  | "project_updated"
  | "project_status_changed"
  | "milestone_reached"
  | "comment_added";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string; // ISO date string
  userId?: string;
  userName?: string;
  userAvatar?: string | null;
  // Datos específicos según el tipo
  metadata?: {
    ticketId?: string;
    ticketTitle?: string;
    oldStatus?: string;
    newStatus?: string;
    projectId?: string;
    projectName?: string;
    commentId?: string;
    commentContent?: string;
    [key: string]: any;
  };
}

export interface TimelineFilters {
  startDate?: string;
  endDate?: string;
  eventTypes?: TimelineEventType[];
  userId?: string;
  ticketId?: string;
}

