export type NotificationType =
  | "ticket_created"
  | "ticket_updated"
  | "ticket_assigned"
  | "ticket_commented"
  | "ticket_status_changed"
  | "project_created"
  | "project_updated"
  | "project_assigned"
  | "comment_approved"
  | "comment_rejected"
  | "system"
  | "info"
  | "warning"
  | "error";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    ticketId?: string;
    projectId?: string;
    commentId?: string;
    [key: string]: any;
  };
  actionUrl?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  ticketUpdates: boolean;
  projectUpdates: boolean;
  commentUpdates: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

