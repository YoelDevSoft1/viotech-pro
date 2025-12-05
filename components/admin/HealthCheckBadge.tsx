"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HeartPulse, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocaleContext } from "@/lib/contexts/LocaleContext";

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    frontend: { status: string };
    backend: { status: string };
  };
  timestamp: string;
}

export function HealthCheckBadge() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Usar el contexto directamente para asegurar que las traducciones funcionen
  const { t: contextT, locale, messages } = useLocaleContext();
  
  // Memoizar el acceso a los mensajes de healthCheck para mejor rendimiento
  const healthCheckMessages = useMemo(() => {
    if (messages && typeof messages === "object") {
      return (messages as any)?.health?.healthCheck;
    }
    return null;
  }, [messages, locale]);
  
  // Función de traducción memoizada con namespace que se actualiza cuando cambia el locale
  const t = useCallback((key: string) => {
    // Primero intentar buscar directamente en los mensajes del locale actual
    if (healthCheckMessages && typeof healthCheckMessages === "object" && key in healthCheckMessages) {
      const directTranslation = healthCheckMessages[key];
      if (typeof directTranslation === "string") {
        return directTranslation;
      }
    }
    
    // Si no se encuentra directamente, usar el contexto como fallback
    try {
      const result = contextT(key, "health.healthCheck");
      
      // Si el resultado es la clave completa, significa que no encontró la traducción
      if (result && (result === `health.healthCheck.${key}` || result.startsWith("health.healthCheck."))) {
        // Ya intentamos buscar directamente, así que devolver la clave sin namespace
        return key;
      }
      return result;
    } catch (error) {
      console.error("Translation error:", error);
      return key;
    }
  }, [contextT, locale, healthCheckMessages]);
  
  // Asegurar que el componente esté montado antes de usar traducciones
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchHealth = async () => {
    try {
      setError(null);
      const response = await fetch("/api/health", {
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      setHealth(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch health status";
      setError(message);
      setHealth({
        status: "unhealthy",
        checks: {
          frontend: { status: "unknown" },
          backend: { status: "unknown" },
        },
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch inicial
  useEffect(() => {
    fetchHealth();
  }, []);

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHealth();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // No renderizar hasta que esté montado para evitar problemas de hidratación
  if (!mounted) {
    return (
      <Badge variant="outline" className="gap-2">
        <HeartPulse className="h-3 w-3 animate-pulse" />
        <span>...</span>
      </Badge>
    );
  }

  if (loading) {
    return (
      <Badge variant="outline" className="gap-2">
        <HeartPulse className="h-3 w-3 animate-pulse" />
        <span>{t("checking")}</span>
      </Badge>
    );
  }

  if (!health) {
    return (
      <Badge variant="outline" className="gap-2">
        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
        <span>{t("unknown")}</span>
      </Badge>
    );
  }

  // Determinar estados individuales
  const frontendStatus = health.checks.frontend.status.toLowerCase();
  const backendStatus = health.checks.backend.status.toLowerCase();
  const frontendOk = ["ok", "up", "ready", "healthy"].includes(frontendStatus);
  const backendOk = ["ok", "up", "ready", "healthy"].includes(backendStatus);
  const backendDown = backendStatus === "down";

  // Determinar qué mostrar
  const getDisplayInfo = () => {
    // Si ambos están OK, mostrar "Healthy"
    if (frontendOk && backendOk) {
      return {
        variant: "default" as const,
        icon: CheckCircle2,
        label: t("healthy"),
        className: "bg-green-500 hover:bg-green-600 text-white",
        showDetails: false,
      };
    }

    // Si el backend está down, mostrar "Unhealthy"
    if (backendDown) {
      return {
        variant: "destructive" as const,
        icon: AlertTriangle,
        label: t("unhealthy"),
        className: "bg-red-500 hover:bg-red-600 text-white",
        showDetails: true,
      };
    }

    // Si hay degradación, mostrar detalles
    return {
      variant: "secondary" as const,
      icon: AlertTriangle,
      label: frontendOk && !backendOk 
        ? `${t("frontendOk")} | ${t("backendDegraded")}`
        : !frontendOk && backendOk
        ? `${t("frontendDegraded")} | ${t("backendOk")}`
        : t("degraded"),
      className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      showDetails: true,
    };
  };

  const displayInfo = getDisplayInfo();
  const Icon = displayInfo.icon;

  // Formatear estado para mostrar
  const formatStatus = (status: string) => {
    const statusLower = status.toLowerCase();
    if (["ok", "up", "ready", "healthy"].includes(statusLower)) return t("ok");
    if (statusLower === "down") return t("down");
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const badgeContent = (
    <Badge
      variant={displayInfo.variant}
      className={cn("gap-2", displayInfo.className)}
    >
      <Icon className="h-3 w-3" />
      <span className={displayInfo.showDetails ? "text-xs" : ""}>{displayInfo.label}</span>
    </Badge>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{t("frontend")}:</span>
            <span className={frontendOk ? "text-green-400" : "text-yellow-400"}>
              {formatStatus(health.checks.frontend.status)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{t("backend")}:</span>
            <span className={backendOk ? "text-green-400" : backendDown ? "text-red-400" : "text-yellow-400"}>
              {formatStatus(health.checks.backend.status)}
            </span>
          </div>
          <div className="text-muted-foreground pt-1 border-t border-border/50">
            {t("lastChecked")}: {new Date(health.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

