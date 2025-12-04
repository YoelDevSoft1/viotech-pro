"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

/**
 * Estado de permisos de notificaciones push
 */
export type PushPermissionState = "prompt" | "granted" | "denied" | "unsupported";

/**
 * Tipo de suscripción Push serializada
 */
export interface PushSubscriptionJSON {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Estado del hook usePushNotifications
 */
export interface UsePushNotificationsState {
  /** Si el navegador soporta push notifications */
  isSupported: boolean;
  /** Estado actual del permiso */
  permission: PushPermissionState;
  /** Si está suscrito actualmente */
  isSubscribed: boolean;
  /** Suscripción actual (si existe) */
  subscription: PushSubscriptionJSON | null;
  /** Si está cargando */
  isLoading: boolean;
  /** Error actual (si hay) */
  error: Error | null;
}

/**
 * Acciones del hook usePushNotifications
 */
export interface UsePushNotificationsActions {
  /** Solicitar permiso y suscribirse */
  subscribe: () => Promise<void>;
  /** Cancelar suscripción */
  unsubscribe: () => Promise<void>;
  /** Verificar estado de suscripción */
  checkSubscription: () => Promise<void>;
}

/**
 * Convierte ArrayBuffer a Base64 URL safe
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Convierte Base64 URL safe a Uint8Array (para VAPID key)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  // Crear un nuevo Uint8Array para asegurar el tipo correcto
  return new Uint8Array(outputArray.buffer);
}

/**
 * Hook para manejar notificaciones push
 * 
 * @example
 * ```tsx
 * const { 
 *   isSupported, 
 *   permission, 
 *   isSubscribed, 
 *   subscribe, 
 *   unsubscribe 
 * } = usePushNotifications();
 * 
 * if (!isSupported) {
 *   return <p>Tu navegador no soporta notificaciones push</p>;
 * }
 * 
 * if (permission === "denied") {
 *   return <p>Has bloqueado las notificaciones. Habilítalas en configuración.</p>;
 * }
 * 
 * return (
 *   <button onClick={isSubscribed ? unsubscribe : subscribe}>
 *     {isSubscribed ? "Desactivar" : "Activar"} notificaciones
 *   </button>
 * );
 * ```
 */
export function usePushNotifications(): UsePushNotificationsState & UsePushNotificationsActions {
  const queryClient = useQueryClient();
  
  // Estado local
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<PushPermissionState>("prompt");
  const [subscription, setSubscription] = useState<PushSubscriptionJSON | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // VAPID public key del backend
  const { data: vapidKey } = useQuery({
    queryKey: ["push", "vapid-key"],
    queryFn: async () => {
      try {
        const { pushNotificationService } = await import("@/lib/services/pushNotificationService");
        return await pushNotificationService.getVapidKey();
      } catch {
        // Si el endpoint no existe, usar una key de desarrollo
        // En producción esto debería venir del backend
        return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
      }
    },
    staleTime: Infinity,
    retry: false,
  });

  // Verificar soporte al montar
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission as PushPermissionState);
      } else {
        setPermission("unsupported");
      }
    };

    checkSupport();
  }, []);

  // Verificar suscripción existente
  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        const sub = existingSubscription.toJSON();
        setSubscription({
          endpoint: sub.endpoint || "",
          expirationTime: sub.expirationTime ?? null,
          keys: {
            p256dh: sub.keys?.p256dh || "",
            auth: sub.keys?.auth || "",
          },
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      setError(err instanceof Error ? err : new Error("Error al verificar suscripción"));
    }
  }, [isSupported]);

  // Verificar suscripción al montar y cuando cambia el soporte
  useEffect(() => {
    if (isSupported && permission === "granted") {
      checkSubscription();
    }
  }, [isSupported, permission, checkSubscription]);

  // Mutation para enviar suscripción al backend
  const subscribeMutation = useMutation({
    mutationFn: async (subscriptionData: PushSubscriptionJSON) => {
      const { pushNotificationService } = await import("@/lib/services/pushNotificationService");
      await pushNotificationService.subscribe({
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
      });
      return subscriptionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
      toast.success("Notificaciones push activadas");
    },
    onError: (err: Error) => {
      toast.error("Error al activar notificaciones push");
      setError(err);
    },
  });

  // Mutation para cancelar suscripción en backend
  const unsubscribeMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      const { pushNotificationService } = await import("@/lib/services/pushNotificationService");
      await pushNotificationService.unsubscribe(endpoint);
      return { endpoint };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
      toast.success("Notificaciones push desactivadas");
    },
    onError: (err: Error) => {
      toast.error("Error al desactivar notificaciones push");
      setError(err);
    },
  });

  // Suscribirse a push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      toast.error("Tu navegador no soporta notificaciones push");
      return;
    }

    try {
      setError(null);

      // Solicitar permiso si es necesario
      if (permission === "prompt") {
        const result = await Notification.requestPermission();
        setPermission(result as PushPermissionState);

        if (result !== "granted") {
          if (result === "denied") {
            toast.error("Has bloqueado las notificaciones. Habilítalas en la configuración del navegador.");
          }
          return;
        }
      } else if (permission === "denied") {
        toast.error("Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.");
        return;
      }

      // Registrar service worker si no está registrado
      const registration = await navigator.serviceWorker.ready;

      // Verificar si ya existe una suscripción
      let existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // Ya está suscrito, sincronizar con backend
        const sub = existingSubscription.toJSON();
        const subscriptionData: PushSubscriptionJSON = {
          endpoint: sub.endpoint || "",
          expirationTime: sub.expirationTime ?? null,
          keys: {
            p256dh: sub.keys?.p256dh || "",
            auth: sub.keys?.auth || "",
          },
        };
        setSubscription(subscriptionData);
        await subscribeMutation.mutateAsync(subscriptionData);
        return;
      }

      // Crear nueva suscripción
      if (!vapidKey) {
        toast.error("No se pudo obtener la configuración del servidor");
        return;
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // @ts-expect-error - PushManager.subscribe expects BufferSource but TypeScript is being strict
        applicationServerKey,
      });

      const sub = newSubscription.toJSON();
      const subscriptionData: PushSubscriptionJSON = {
        endpoint: sub.endpoint || "",
        expirationTime: sub.expirationTime ?? null,
        keys: {
          p256dh: sub.keys?.p256dh || "",
          auth: sub.keys?.auth || "",
        },
      };

      setSubscription(subscriptionData);

      // Enviar al backend
      await subscribeMutation.mutateAsync(subscriptionData);
    } catch (err) {
      console.error("Error subscribing to push:", err);
      setError(err instanceof Error ? err : new Error("Error al suscribirse"));
      toast.error("Error al activar las notificaciones push");
    }
  }, [isSupported, permission, vapidKey, subscribeMutation]);

  // Cancelar suscripción
  const unsubscribe = useCallback(async () => {
    if (!isSupported || !subscription) return;

    try {
      setError(null);

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        // Cancelar suscripción local
        await existingSubscription.unsubscribe();
      }

      // Notificar al backend
      await unsubscribeMutation.mutateAsync(subscription.endpoint);

      setSubscription(null);
    } catch (err) {
      console.error("Error unsubscribing from push:", err);
      setError(err instanceof Error ? err : new Error("Error al cancelar suscripción"));
      toast.error("Error al desactivar las notificaciones push");
    }
  }, [isSupported, subscription, unsubscribeMutation]);

  return {
    isSupported,
    permission,
    isSubscribed: !!subscription,
    subscription,
    isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
    error,
    subscribe,
    unsubscribe,
    checkSubscription,
  };
}

