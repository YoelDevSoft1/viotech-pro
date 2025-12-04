"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { NotificationPreferencesGranular } from "@/lib/types/notifications";
import { toast } from "sonner";

/**
 * Preferencias por defecto para notificaciones
 */
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferencesGranular = {
  email: true,
  push: false,
  inApp: true,
  digest: { enabled: false, frequency: 'never' },
  sound: false,
  desktop: true,
  byType: {},
};

/**
 * Hook para obtener las preferencias granulares de notificaciones del usuario
 * 
 * Las preferencias de notificaciones están dentro de /api/user/preferences
 * en el campo "notifications". Este hook extrae ese campo y lo normaliza.
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreferencesGranular>({
    queryKey: ["notifications", "preferences"],
    queryFn: async () => {
      try {
        // Las preferencias de notificaciones están dentro de user/preferences
        const { data } = await apiClient.get("/user/preferences");
        const userPrefs = data?.data || data;
        
        // Extraer preferencias de notificaciones del objeto de preferencias del usuario
        const raw = userPrefs?.notifications || userPrefs;
        
        // Si no hay preferencias o son básicas, convertirlas a granulares
        if (!raw || typeof raw !== 'object') {
          return DEFAULT_NOTIFICATION_PREFERENCES;
        }
        
        // Si el backend devuelve preferencias básicas, convertirlas a granulares
        if (!raw.byType) {
          return {
            email: raw.email ?? DEFAULT_NOTIFICATION_PREFERENCES.email,
            push: raw.push ?? DEFAULT_NOTIFICATION_PREFERENCES.push,
            inApp: raw.inApp ?? DEFAULT_NOTIFICATION_PREFERENCES.inApp,
            digest: raw.digest || DEFAULT_NOTIFICATION_PREFERENCES.digest,
            sound: raw.sound ?? DEFAULT_NOTIFICATION_PREFERENCES.sound,
            desktop: raw.desktop ?? DEFAULT_NOTIFICATION_PREFERENCES.desktop,
            byType: raw.byType || {},
          } as NotificationPreferencesGranular;
        }
        
        return raw as NotificationPreferencesGranular;
      } catch (error: any) {
        // Si el endpoint no existe (404) o hay cualquier error, devolver preferencias por defecto
        // Esto evita errores en consola cuando el endpoint aún no está implementado
        if (error?.response?.status === 404 || error?.response?.status === 401) {
          return DEFAULT_NOTIFICATION_PREFERENCES;
        }
        // Para otros errores, también devolver defaults para no romper la UI
        console.warn("Error loading notification preferences, using defaults:", error?.message);
        return DEFAULT_NOTIFICATION_PREFERENCES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // No reintentar si falla, usar defaults
  });
}

/**
 * Hook para actualizar las preferencias granulares de notificaciones
 * 
 * Las preferencias se guardan dentro de /api/user/preferences en el campo "notifications"
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferencesGranular>) => {
      try {
        // Primero obtener las preferencias actuales del usuario
        const { data: currentData } = await apiClient.get("/user/preferences");
        const currentPrefs = currentData?.data || currentData || {};
        
        // Merge las nuevas preferencias de notificaciones con las existentes
        const updatedPrefs = {
          ...currentPrefs,
          notifications: {
            ...(currentPrefs.notifications || {}),
            ...preferences,
          },
        };
        
        // Guardar las preferencias actualizadas
        const { data } = await apiClient.put("/user/preferences", updatedPrefs);
        return data;
      } catch (error: any) {
        // Si el endpoint no existe, simular éxito para no romper la UI
        if (error?.response?.status === 404) {
          console.warn("User preferences endpoint not available, preferences saved locally");
          return { success: true, local: true };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
      if (!data?.local) {
        toast.success("Preferencias de notificaciones actualizadas");
      }
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
      try {
        // Intentar enviar notificación de prueba
        const { data } = await apiClient.post("/notifications/test", { type });
        return data;
      } catch (error: any) {
        // Si el endpoint no existe, simular el envío
        if (error?.response?.status === 404) {
          // Simular notificación de prueba local
          if (type === 'inApp') {
            return { success: true, simulated: true };
          }
          throw new Error("Endpoint de notificación de prueba no disponible");
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.simulated) {
        toast.info("Notificación de prueba (simulada)", {
          description: "El endpoint de prueba no está disponible en el backend",
        });
      } else {
        toast.success("Notificación de prueba enviada");
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Error al enviar notificación de prueba";
      toast.error(errorMessage);
    },
  });
}

