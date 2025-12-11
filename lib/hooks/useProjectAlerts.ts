"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { toast } from "sonner";
import type { ProjectAlert, RiskLevel } from "@/lib/types/project-monitor";

const MAX_ALERTS = 20;

/**
 * Hook para manejar alertas de proyectos en tiempo real mediante WebSocket
 * 
 * Escucha eventos de tipo "project_delay_risk" y actualiza el estado local.
 * También muestra toasts según la severidad de la alerta.
 */
export function useProjectAlerts() {
  const [alerts, setAlerts] = useState<ProjectAlert[]>([]);
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { data: user } = useCurrentUser();

  const handleProjectAlert = useCallback((notification: ProjectAlert) => {
    if (notification.type !== "project_delay_risk") return;

    // Agregar alerta a la lista (evitar duplicados)
    setAlerts((prev) => {
      if (prev.some((a) => a.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev].slice(0, MAX_ALERTS);
    });

    // Invalidar queries de análisis para refrescar datos
    queryClient.invalidateQueries({ queryKey: ["project-monitor", "analysis"] });

    // Mostrar toast según severidad
    showAlertToast(notification);
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!user?.id) return;

    // Obtener el token de autenticación
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;

    if (!token) return;

    // Construir URL del WebSocket
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      (typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/notifications`
        : "");

    if (!wsUrl) {
      console.warn(
        "WebSocket URL no configurada para alertas de proyecto"
      );
      return;
    }

    try {
      const ws = new WebSocket(`${wsUrl}?token=${token}`);

      ws.onopen = () => {
        console.log("🔌 Conectado a WebSocket de alertas de proyecto");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Filtrar solo alertas de tipo project_delay_risk
          if (data.type === "notification" && data.payload?.type === "project_delay_risk") {
            handleProjectAlert(data.payload as ProjectAlert);
          }
          
          // También manejar el formato directo
          if (data.type === "project_delay_risk") {
            handleProjectAlert(data as ProjectAlert);
          }
        } catch (error) {
          console.error("Error al procesar mensaje WebSocket:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("Error en WebSocket de alertas:", error);
      };

      ws.onclose = () => {
        console.log("🔌 Desconectado de WebSocket de alertas");
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
      console.error("Error al conectar WebSocket de alertas:", error);
    }
  }, [user?.id, handleProjectAlert]);

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

  // Limpiar una alerta específica
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // Limpiar todas las alertas
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Conectar/desconectar según el usuario
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  // Escuchar eventos de ventana para alertas (fallback sin WebSocket)
  useEffect(() => {
    const handleWindowEvent = (event: CustomEvent<ProjectAlert>) => {
      if (event.detail?.type === "project_delay_risk") {
        handleProjectAlert(event.detail);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "project-alert" as keyof WindowEventMap,
        handleWindowEvent as EventListener
      );
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "project-alert" as keyof WindowEventMap,
          handleWindowEvent as EventListener
        );
      }
    };
  }, [handleProjectAlert]);

  return {
    alerts,
    connected: wsRef.current?.readyState === WebSocket.OPEN,
    dismissAlert,
    clearAlerts,
    alertCount: alerts.length,
    criticalCount: alerts.filter(
      (a) => a.metadata?.riskLevel === "critical"
    ).length,
    highCount: alerts.filter((a) => a.metadata?.riskLevel === "high").length,
  };
}

// ============================================
// HELPERS
// ============================================

function showAlertToast(alert: ProjectAlert) {
  const severity = alert.metadata?.riskLevel as RiskLevel;
  const projectName = alert.metadata?.projectName || "Proyecto";

  const toastOptions = {
    description: alert.message,
    action: alert.actionUrl
      ? {
          label: "Ver proyecto",
          onClick: () => {
            if (typeof window !== "undefined") {
              window.location.href = alert.actionUrl;
            }
          },
        }
      : undefined,
  };

  switch (severity) {
    case "critical":
      toast.error(`🚨 ${alert.title}`, {
        ...toastOptions,
        duration: 10000,
      });
      break;
    case "high":
      toast.warning(`⚠️ ${alert.title}`, {
        ...toastOptions,
        duration: 8000,
      });
      break;
    case "medium":
      toast.info(`📊 ${alert.title}`, {
        ...toastOptions,
        duration: 6000,
      });
      break;
    default:
      toast(`📋 Alerta en ${projectName}`, {
        ...toastOptions,
        duration: 5000,
      });
  }
}




