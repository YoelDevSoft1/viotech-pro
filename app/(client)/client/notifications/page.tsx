"use client";

import { useState } from "react";
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
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const [isHovered, setIsHovered] = useState(false);
  const tNotifications = useTranslationsSafe("notifications");
  const { formatRelativeTime } = useI18n();

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

export default function ClientNotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();
  const tNotifications = useTranslationsSafe("notifications");

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

