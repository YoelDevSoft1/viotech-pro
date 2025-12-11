"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Ticket,
  FolderKanban,
  AlertCircle,
  Info,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Clock,
  MailOpen,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useNotifications,
  useNotificationStats,
  useMarkAllNotificationsAsRead,
  useDeleteAllReadNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from "@/lib/hooks/useNotifications";
import { useRealtimeNotifications } from "@/lib/hooks/useRealtimeNotifications";
import type { Notification, NotificationType } from "@/lib/types/notifications";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/hooks/useI18n";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";
import { toast } from "sonner";
import esMessages from "@/messages/es.json";
import enMessages from "@/messages/en.json";
import ptMessages from "@/messages/pt.json";
import type { Locale } from "@/i18n";

const messagesMap = {
  es: esMessages,
  en: enMessages,
  pt: ptMessages,
} as const;

type FilterType = "all" | "unread" | "tickets" | "projects" | "system";

// Iconos por tipo de notificación
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ticket_created":
    case "ticket_updated":
    case "ticket_assigned":
    case "ticket_commented":
    case "ticket_status_changed":
      return Ticket;
    case "project_created":
    case "project_updated":
    case "project_assigned":
      return FolderKanban;
    case "comment_approved":
    case "comment_rejected":
      return MessageSquare;
    case "warning":
      return AlertTriangle;
    case "error":
      return XCircle;
    case "info":
      return Info;
    case "system":
    default:
      return Bell;
  }
};

// Colores por tipo de notificación
const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case "ticket_created":
    case "ticket_updated":
    case "ticket_assigned":
    case "ticket_commented":
    case "ticket_status_changed":
      return "text-blue-500 bg-blue-500/10";
    case "project_created":
    case "project_updated":
    case "project_assigned":
      return "text-purple-500 bg-purple-500/10";
    case "comment_approved":
      return "text-green-500 bg-green-500/10";
    case "comment_rejected":
      return "text-red-500 bg-red-500/10";
    case "warning":
      return "text-yellow-500 bg-yellow-500/10";
    case "error":
      return "text-red-500 bg-red-500/10";
    case "info":
      return "text-sky-500 bg-sky-500/10";
    case "system":
    default:
      return "text-muted-foreground bg-muted";
  }
};

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const { locale } = useLocaleContext();
  const { formatRelativeTime } = useI18n();

  const tNotifications = useMemo(() => {
    const messages = messagesMap[locale as Locale];
    const notificationsMessages = messages?.notifications as any;

    return (key: string): string => {
      if (key.includes(".")) {
        const keys = key.split(".");
        let value: any = notificationsMessages;
        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        if (typeof value === "string") {
          return value;
        }
        return key;
      }

      if (
        notificationsMessages &&
        typeof notificationsMessages === "object" &&
        key in notificationsMessages
      ) {
        const value = notificationsMessages[key];
        if (typeof value === "string") {
          return value;
        }
      }

      return key;
    };
  }, [locale]);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id, {
      onSuccess: () => {
        toast.success(tNotifications("deleted"));
      },
    });
  };

  const handleNavigate = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id, {
        onSuccess: () => {
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        },
        onError: () => {
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
        },
      });
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);

  return (
    <div
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer",
        "hover:bg-accent/50 hover:shadow-sm",
        !notification.read && "bg-primary/5 border-primary/20"
      )}
      onClick={handleNavigate}
    >
      {/* Icono */}
      <div className={cn("flex-shrink-0 p-2 rounded-full", iconColor)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-tight",
              !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/90"
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <Badge variant="default" className="flex-shrink-0 text-xs px-1.5 py-0.5">
              {tNotifications("new")}
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>

        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(new Date(notification.createdAt))}
          </span>

          {notification.metadata?.ticketId && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              <Ticket className="h-3 w-3 mr-1" />
              #{notification.metadata.ticketId.slice(0, 8)}
            </Badge>
          )}

          {notification.metadata?.projectId && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              <FolderKanban className="h-3 w-3 mr-1" />
              {tNotifications("project")}
            </Badge>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          {!notification.read && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleMarkAsRead}
                  disabled={markAsRead.isPending}
                >
                  <MailOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{tNotifications("markAsRead")}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteNotification.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{tNotifications("delete")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  filter,
  tNotifications,
}: {
  filter: FilterType;
  tNotifications: (key: string) => string;
}) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case "unread":
        return {
          icon: CheckCheck,
          title: tNotifications("noUnread"),
          description: tNotifications("noUnreadDescription"),
        };
      case "tickets":
        return {
          icon: Ticket,
          title: tNotifications("noTicketNotifications"),
          description: tNotifications("noTicketNotificationsDescription"),
        };
      case "projects":
        return {
          icon: FolderKanban,
          title: tNotifications("noProjectNotifications"),
          description: tNotifications("noProjectNotificationsDescription"),
        };
      case "system":
        return {
          icon: Bell,
          title: tNotifications("noSystemNotifications"),
          description: tNotifications("noSystemNotificationsDescription"),
        };
      default:
        return {
          icon: Inbox,
          title: tNotifications("noNotifications"),
          description: tNotifications("noNotificationsDescription"),
        };
    }
  };

  const { icon: Icon, title, description } = getEmptyStateContent();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

export default function ClientNotificationsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();
  const { locale } = useLocaleContext();

  const tNotifications = useMemo(() => {
    const messages = messagesMap[locale as Locale];
    const notificationsMessages = messages?.notifications as any;

    return (key: string): string => {
      if (key.includes(".")) {
        const keys = key.split(".");
        let value: any = notificationsMessages;
        for (const k of keys) {
          if (value && typeof value === "object" && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        if (typeof value === "string") {
          return value;
        }
        return key;
      }

      if (
        notificationsMessages &&
        typeof notificationsMessages === "object" &&
        key in notificationsMessages
      ) {
        const value = notificationsMessages[key];
        if (typeof value === "string") {
          return value;
        }
      }

      return key;
    };
  }, [locale]);

  // Conectar a notificaciones en tiempo real
  useRealtimeNotifications();

  // Filtrar notificaciones según el filtro seleccionado
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      switch (filter) {
        case "unread":
          return !notification.read;
        case "tickets":
          return notification.type.startsWith("ticket_");
        case "projects":
          return notification.type.startsWith("project_");
        case "system":
          return ["system", "info", "warning", "error"].includes(notification.type);
        default:
          return true;
      }
    });
  }, [notifications, filter]);

  const unreadCount = stats?.unread || notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => {
        toast.success(tNotifications("allMarkedAsRead"));
      },
    });
  };

  const handleDeleteAllRead = () => {
    deleteAllRead.mutate(undefined, {
      onSuccess: () => {
        toast.success(tNotifications("allReadDeleted"));
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {tNotifications("backToDashboard")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Bell className="h-8 w-8" />
              {tNotifications("title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} ${unreadCount > 1 ? tNotifications("unreadCountMany") : tNotifications("unreadCountOne")}`
                : tNotifications("allRead")}
            </p>
          </div>

          {/* Acciones globales */}
          <div className="flex items-center gap-2">
            <TooltipProvider>
              {unreadCount > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsRead.isPending}
                    >
                      <CheckCheck className="h-4 w-4 mr-2" />
                      {tNotifications("markAllAsRead")}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tNotifications("markAllAsReadTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {readCount > 0 && (
                <AlertDialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {tNotifications("deleteRead")}
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tNotifications("deleteReadTooltip")}</p>
                    </TooltipContent>
                  </Tooltip>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{tNotifications("deleteReadConfirmTitle")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {tNotifications("deleteReadConfirmDescription")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{tNotifications("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllRead}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {tNotifications("confirmDelete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">{tNotifications("yourNotifications")}</CardTitle>
              <CardDescription>
                {filteredNotifications.length}{" "}
                {filteredNotifications.length !== 1
                  ? tNotifications("notificationCountMany")
                  : tNotifications("notificationCountOne")}
              </CardDescription>
            </div>

            {/* Tabs de filtrado */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  {tNotifications("all")}
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs sm:text-sm">
                  {tNotifications("unread")}
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="tickets" className="text-xs sm:text-sm">
                  <Ticket className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{tNotifications("ticketsTab")}</span>
                </TabsTrigger>
                <TabsTrigger value="projects" className="text-xs sm:text-sm">
                  <FolderKanban className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{tNotifications("projectsTab")}</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="text-xs sm:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">{tNotifications("systemTab")}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState filter={filter} tNotifications={tNotifications} />
          ) : (
            <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px] pr-4">
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
