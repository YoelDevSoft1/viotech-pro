"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  Filter,
  FolderKanban,
  Info,
  MailOpen,
  MessageSquare,
  Ticket,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useNotificationStats, useMarkAllNotificationsAsRead, useDeleteAllReadNotifications, useMarkNotificationAsRead, useDeleteNotification } from "@/lib/hooks/useNotifications";
import { useRealtimeNotifications } from "@/lib/hooks/useRealtimeNotifications";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";
import type { Notification, NotificationType } from "@/lib/types/notifications";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

const tabsConfig: { value: "all" | "unread" | NotificationType; icon: React.ComponentType<any>; labelKey: string }[] = [
  { value: "all", icon: Bell, labelKey: "all" },
  { value: "unread", icon: MailOpen, labelKey: "unread" },
  { value: "ticket_created", icon: Ticket, labelKey: "types.ticketCreated" },
  { value: "project_created", icon: FolderKanban, labelKey: "types.projectCreated" },
  { value: "system", icon: AlertCircle, labelKey: "types.system" },
];

function NotificationItem({ notification }: { notification: Notification }) {
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();
  const tNotifications = useTranslationsSafe("notifications");

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(notification.id);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative p-4 border rounded-xl transition-all cursor-pointer bg-card",
        !notification.read && "bg-primary/5 border-primary/30 shadow-sm"
      )}
      onClick={handleMarkRead}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <Bell className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("text-sm leading-tight", !notification.read && "font-semibold")}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2">
              {!notification.read && (
                <Badge variant="default" className="text-[10px] px-2 py-0.5">
                  {tNotifications("new")}
                </Badge>
              )}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                {!notification.read && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleMarkRead}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{notification.message}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </span>
            {notification.metadata?.ticketId && (
              <Badge variant="outline" className="text-[10px]">
                <Ticket className="h-3 w-3 mr-1" />
                #{notification.metadata.ticketId.slice(0, 8)}
              </Badge>
            )}
            {notification.metadata?.projectId && (
              <Badge variant="outline" className="text-[10px]">
                <FolderKanban className="h-3 w-3 mr-1" />
                {tNotifications("project")}
              </Badge>
            )}
            {notification.type === "system" && (
              <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                <Info className="h-3 w-3" />
                {tNotifications("types.system")}
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

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | NotificationType>("all");
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: stats } = useNotificationStats();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAllRead = useDeleteAllReadNotifications();
  const tNotifications = useTranslationsSafe("notifications");

  useRealtimeNotifications();

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filter === "all") return true;
        if (filter === "unread") return !notification.read;
        return notification.type === filter;
      }),
    [notifications, filter]
  );

  const unreadCount = stats?.unread || notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/internal" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {tNotifications("backToDashboard", { defaultValue: "Volver" })}
            </Link>
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {tNotifications("title")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-7 w-7 text-primary" />
              {tNotifications("subtitle", { defaultValue: "Centro de notificaciones" })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount > 0
                ? `${unreadCount} ${unreadCount === 1 ? tNotifications("unreadCountOne") : tNotifications("unreadCountMany")}`
                : tNotifications("allRead")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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
              variant="ghost"
              size="sm"
              onClick={() => deleteAllRead.mutate()}
              disabled={deleteAllRead.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tNotifications("deleteRead")}
            </Button>
          </div>
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {tNotifications("filters")}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length}{" "}
                {filteredNotifications.length === 1
                  ? tNotifications("notificationCountOne")
                  : tNotifications("notificationCountMany")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-5">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-2 text-xs md:text-sm">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tNotifications(tab.labelKey)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <TabsContent value={filter} className="mt-4 m-0">
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
                  <Bell className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    {filter === "unread"
                      ? tNotifications("noUnread")
                      : tNotifications("noNotifications")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px] max-h-[70vh]">
                  <div className="space-y-3 pr-4">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
