"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications, useNotificationStats, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from "@/lib/hooks/useNotifications";
import { useRealtimeNotifications } from "@/lib/hooks/useRealtimeNotifications";
import { useNotificationPreferences } from "@/lib/hooks/useNotificationPreferences";
import type { Notification } from "@/lib/types/notifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { toast } from "sonner";

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const [isHovered, setIsHovered] = useState(false);

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
        "relative p-3 border-b last:border-b-0 cursor-pointer transition-colors",
        !notification.read && "bg-muted/50",
        isHovered && "bg-muted"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </p>
        </div>
        {isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDelete}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {notification.actionUrl && (
        <Link
          href={notification.actionUrl}
          className="absolute inset-0"
          onClick={(e) => {
            if (!notification.read) {
              e.preventDefault();
              markAsRead.mutate(notification.id, {
                onSuccess: () => {
                  window.location.href = notification.actionUrl!;
                },
              });
            }
          }}
        />
      )}
    </div>
  );
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const { data: preferences } = useNotificationPreferences();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const tNotifications = useTranslationsSafe("notifications");
  const previousUnreadCountRef = useRef<number>(0);
  
  // Conectar a notificaciones en tiempo real
  useRealtimeNotifications();

  const unreadCount = stats?.unread || notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Mostrar toast cuando llega una nueva notificación
  useEffect(() => {
    const handleNotificationReceived = (event: CustomEvent<Notification>) => {
      const notification = event.detail;
      
      // Verificar si las notificaciones in-app están habilitadas
      const inAppEnabled = preferences?.inApp !== false;
      const typeEnabled = preferences?.byType?.[notification.type]?.inApp !== false;
      
      if (inAppEnabled && typeEnabled !== false) {
        // Mostrar toast con la notificación
        toast.info(notification.title, {
          description: notification.message,
          duration: 5000,
          action: notification.actionUrl ? {
            label: "Ver",
            onClick: () => {
              window.location.href = notification.actionUrl!;
            },
          } : undefined,
        });
      }
    };

    window.addEventListener("notification-received", handleNotificationReceived as EventListener);
    return () => {
      window.removeEventListener("notification-received", handleNotificationReceived as EventListener);
    };
  }, [preferences]);

  // Detectar cuando aumenta el contador de no leídas (nueva notificación)
  useEffect(() => {
    const previousCount = previousUnreadCountRef.current;
    if (unreadCount > previousCount && previousCount > 0) {
      // Nueva notificación recibida (el toast ya se mostró arriba)
      // Aquí podríamos reproducir un sonido si está habilitado
    }
    previousUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={cn("h-5 w-5 transition-all", hasUnread && "animate-pulse")} />
          {hasUnread && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs",
                "animate-in fade-in zoom-in-50 duration-200"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{tNotifications("title")}</h3>
            {hasUnread && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} {tNotifications("unread")}
              </Badge>
            )}
          </div>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              {tNotifications("markAll")}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{tNotifications("noNotifications")}</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              asChild
            >
              <Link href="/notifications">{tNotifications("viewAll")}</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

