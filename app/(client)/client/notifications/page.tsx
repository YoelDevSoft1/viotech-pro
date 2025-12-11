"use client";

import { useState, useMemo } from "react";
import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications, useNotificationStats, useMarkAllNotificationsAsRead, useDeleteAllReadNotifications, useMarkNotificationAsRead, useDeleteNotification } from "@/lib/hooks/useNotifications";
import { useRealtimeNotifications } from "@/lib/hooks/useRealtimeNotifications";
import type { Notification, NotificationType } from "@/lib/types/notifications";
import { cn } from "@/lib/utils";
import Link from "next/link";
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

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const [isHovered, setIsHovered] = useState(false);
  const { locale } = useLocaleContext();
  const { formatRelativeTime } = useI18n();
  
  const tNotifications = useMemo(() => {
    const messages = messagesMap[locale as Locale];
    const notificationsMessages = messages?.notifications as any;
    
    return (key: string): string => {
      // Si es una clave anidada (ej: "types.ticketCreated")
      if (key.includes('.')) {
        const keys = key.split('.');
        let value: any = notificationsMessages;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key; // Fallback a la clave si no se encuentra
          }
        }
        if (typeof value === 'string') {
          return value;
        }
        return key;
      }
      
      // Clave simple
      if (notificationsMessages && typeof notificationsMessages === 'object' && key in notificationsMessages) {
        const value = notificationsMessages[key];
        if (typeof value === 'string') {
          return value;
        }
      }
      
      return key; // Fallback a la clave si no se encuentra
    };
  }, [locale]);

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  return (
    <div
      className={cn(
        "relative p-4 border rounded-lg transition-colors",
        !notification.read && "bg-muted/50 border-primary/20",
        isHovered && "shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Badge variant="default" className="text-xs">
                  {tNotifications("new")}
                </Badge>
              )}
              {isHovered && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              {formatRelativeTime(new Date(notification.createdAt))}
            </span>
            {notification.metadata?.ticketId && (
              <Badge variant="outline" className="text-xs">
                {tNotifications("types.ticketCreated")} #{notification.metadata.ticketId.slice(0, 8)}
              </Badge>
            )}
            {notification.metadata?.projectId && (
              <Badge variant="outline" className="text-xs">
                {tNotifications("project")}
              </Badge>
            )}
          </div>
        </div>
      </div>
      {notification.actionUrl && (
        <Link
          href={notification.actionUrl}
          className="absolute inset-0"
          onClick={async (e) => {
            if (!notification.read) {
              e.preventDefault();
              markAsRead.mutate(notification.id, {
                onSuccess: () => {
                  // VALIDACIÓN C2.5: Navegación a recurso correcto y manejo de recursos eliminados
                  // Usar router.push en lugar de window.location para mejor manejo de errores
                  try {
                    // El router de Next.js manejará automáticamente errores 404
                    window.location.href = notification.actionUrl!;
                  } catch (err) {
                    // Si el recurso ya no existe, mostrar mensaje amigable
                    console.warn("Recurso no disponible:", notification.actionUrl);
                    toast.error("Este recurso ya no está disponible", {
                      description: "El ticket, proyecto o pago al que hace referencia esta notificación ya no existe.",
                    });
                  }
                },
                onError: () => {
                  // Si falla al marcar como leída, aún intentar navegar
                  try {
                    window.location.href = notification.actionUrl!;
                  } catch {
                    // Ignorar errores de navegación
                  }
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}

export default function ClientNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();
  const { locale } = useLocaleContext();
  
  const tNotifications = useMemo(() => {
    const messages = messagesMap[locale as Locale];
    const notificationsMessages = messages?.notifications as any;
    
    return (key: string): string => {
      // Si es una clave anidada (ej: "types.ticketCreated")
      if (key.includes('.')) {
        const keys = key.split('.');
        let value: any = notificationsMessages;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key; // Fallback a la clave si no se encuentra
          }
        }
        if (typeof value === 'string') {
          return value;
        }
        return key;
      }
      
      // Clave simple
      if (notificationsMessages && typeof notificationsMessages === 'object' && key in notificationsMessages) {
        const value = notificationsMessages[key];
        if (typeof value === 'string') {
          return value;
        }
      }
      
      return key; // Fallback a la clave si no se encuentra
    };
  }, [locale]);

  // Conectar a notificaciones en tiempo real
  useRealtimeNotifications();

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = stats?.unread || notifications.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{tNotifications("title")}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} ${unreadCount > 1 ? tNotifications("unreadCountMany") : tNotifications("unreadCountOne")}`
                : tNotifications("allRead")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                {tNotifications("markAllAsRead")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteAllRead.mutate()}
              disabled={deleteAllRead.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tNotifications("deleteRead")}
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {tNotifications("filters")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder={tNotifications("filterPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tNotifications("all")}</SelectItem>
                <SelectItem value="unread">{tNotifications("unread")}</SelectItem>
                <SelectItem value="ticket_created">{tNotifications("types.ticketCreated")}</SelectItem>
                <SelectItem value="ticket_updated">{tNotifications("types.ticketUpdated")}</SelectItem>
                <SelectItem value="ticket_assigned">{tNotifications("types.ticketAssigned")}</SelectItem>
                <SelectItem value="project_created">{tNotifications("types.projectCreated")}</SelectItem>
                <SelectItem value="project_updated">{tNotifications("types.projectUpdated")}</SelectItem>
                <SelectItem value="system">{tNotifications("types.system")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Lista de notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {filteredNotifications.length} {filteredNotifications.length !== 1 
                ? tNotifications("notificationCountMany")
                : tNotifications("notificationCountOne")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  {filter === "unread"
                    ? tNotifications("noUnread")
                    : tNotifications("noNotifications")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

