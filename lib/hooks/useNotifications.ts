"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Notification, NotificationStats } from "@/lib/types/notifications";

/**
 * Hook para obtener todas las notificaciones del usuario
 */
export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications");
      return (data?.data || data || []) as Notification[];
    },
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener estadísticas de notificaciones
 */
export function useNotificationStats() {
  return useQuery<NotificationStats>({
    queryKey: ["notifications", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/notifications/stats");
      return (data?.data || data || { total: 0, unread: 0, read: 0 }) as NotificationStats;
    },
    staleTime: 30000,
  });
}

/**
 * Hook para marcar una notificación como leída
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
      return data;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },
  });
}

/**
 * Hook para marcar todas las notificaciones como leídas
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.patch("/notifications/read-all");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },
  });
}

/**
 * Hook para eliminar una notificación
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await apiClient.delete(`/notifications/${notificationId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },
  });
}

/**
 * Hook para eliminar todas las notificaciones leídas
 */
export function useDeleteAllReadNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete("/notifications/read");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "stats"] });
    },
  });
}

