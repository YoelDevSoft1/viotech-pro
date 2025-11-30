export type AuditLogAction =
  | "create"
  | "update"
  | "delete"
  | "assign"
  | "status_change"
  | "comment"
  | "approve"
  | "reject"
  | "login"
  | "logout"
  | "permission_change";

export type AuditLogEntityType =
  | "ticket"
  | "project"
  | "user"
  | "organization"
  | "comment"
  | "blog_post"
  | "blog_comment"
  | "notification"
  | "system";

export interface AuditLog {
  id: string;
  userId: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  entityName?: string | null;
  description: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: AuditLogAction;
  entityType?: AuditLogEntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogStats {
  total: number;
  byAction: Record<AuditLogAction, number>;
  byEntityType: Record<AuditLogEntityType, number>;
  recentActivity: number; // Últimas 24 horas
}

