"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { NotificationPreferencesGranular } from "@/lib/types/notifications";
import { toast } from "sonner";

/**
 * Hook para obtener las preferencias granulares de notificaciones del usuario
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferencesGranular>({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/notifications/preferences");
        const raw = data?.data || data;
        
        // Si el backend devuelve preferencias básicas, convertirlas a granulares
        if (raw && !raw.byType) {
          return {
            email: raw.email ?? true,
            push: raw.push ?? false,
            inApp: raw.inApp ?? true,
            digest: raw.digest || { enabled: false, frequency: 'never' },
            sound: raw.sound ?? false,
            desktop: raw.desktop ?? true,
            byType: {},
          } as NotificationPreferencesGranular;
        }
        
        return raw as NotificationPreferencesGranular;
      } catch (error: any) {
        // Si el endpoint no existe (404), devolver preferencias por defecto
        if (error?.response?.status === 404) {
          return {
            email: true,
            push: false,
            inApp: true,
            digest: { enabled: false, frequency: 'never' },
            sound: false,
            desktop: true,
            byType: {},
          } as NotificationPreferencesGranular;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para actualizar las preferencias granulares de notificaciones
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferencesGranular>) => {
      const { data } = await apiClient.put("/notifications/preferences", preferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
      toast.success("Preferencias de notificaciones actualizadas");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar preferencias";
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook para enviar una notificación de prueba
 */
export function useTestNotification() {
  return useMutation({
    mutationFn: async (type: 'email' | 'push' | 'inApp') => {
      const { data } = await apiClient.post("/notifications/preferences/test", { type });
      return data;
    },
    onSuccess: () => {
      toast.success("Notificación de prueba enviada");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al enviar notificación de prueba";
      toast.error(errorMessage);
    },
  });
}

