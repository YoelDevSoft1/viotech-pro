"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/hooks/useResources";
import type { Notification } from "@/lib/types/notifications";

/**
 * Hook para manejar notificaciones en tiempo real mediante WebSocket
 * 
 * Nota: Esta implementación usa polling como fallback si WebSocket no está disponible.
 * El backend debe implementar el endpoint WebSocket en /ws/notifications
 */
export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: user } = useCurrentUser();

  const connect = useCallback(() => {
    if (!user?.id) return;

    // Obtener el token de autenticación
    const token = typeof window !== "undefined" 
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;

    if (!token) return;

    // Construir URL del WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
      (typeof window !== "undefined" 
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/notifications`
        : "");

    if (!wsUrl) {
      console.warn("WebSocket URL no configurada, usando polling como fallback");
      return;
    }

    try {
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log("🔌 Conectado a WebSocket de notificaciones");
        // Limpiar timeout de reconexión si existe
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "notification") {
            const notification = data.payload as Notification;
            
            // Agregar la notificación a la lista
            queryClient.setQueryData<Notification[]>(["notifications"], (old = []) => {
              // Evitar duplicados
              if (old.some((n) => n.id === notification.id)) {
                return old;
              }
              return [notification, ...old];
            });

            // Actualizar estadísticas
            queryClient.setQueryData<{ total: number; unread: number; read: number }>(
              ["notifications", "stats"],
              (old = { total: 0, unread: 0, read: 0 }) => ({
                total: old.total + 1,
                unread: old.unread + 1,
                read: old.read,
              })
            );

            // Emitir evento personalizado para que otros componentes puedan escuchar
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("notification-received", { detail: notification })
              );
            }
          }
        } catch (error) {
          console.error("Error al procesar mensaje WebSocket:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Error en WebSocket:", error);
      };

      ws.onclose = () => {
        console.log("🔌 Desconectado de WebSocket de notificaciones");
        wsRef.current = null;

        // Intentar reconectar después de 5 segundos
        if (user?.id) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error al conectar WebSocket:", error);
    }
  }, [user?.id, queryClient]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  return {
    connected: wsRef.current?.readyState === WebSocket.OPEN,
  };
}

