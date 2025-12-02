"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (loading) {
    return (
      <Badge variant="outline" className="gap-2">
        <HeartPulse className="h-3 w-3 animate-pulse" />
        <span>Checking...</span>
      </Badge>
    );
  }

  if (!health) {
    return (
      <Badge variant="outline" className="gap-2">
        <AlertTriangle className="h-3 w-3 text-muted-foreground" />
        <span>Unknown</span>
      </Badge>
    );
  }

  const getStatusConfig = () => {
    switch (health.status) {
      case "healthy":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          label: "Healthy",
          className: "bg-green-500 hover:bg-green-600 text-white",
        };
      case "degraded":
        return {
          variant: "secondary" as const,
          icon: AlertTriangle,
          label: "Degraded",
          className: "bg-yellow-500 hover:bg-yellow-600 text-white",
        };
      case "unhealthy":
        return {
          variant: "destructive" as const,
          icon: AlertTriangle,
          label: "Unhealthy",
          className: "bg-red-500 hover:bg-red-600 text-white",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  // Mostrar detalles en tooltip
  const tooltipText = `Frontend: ${health.checks.frontend.status}\nBackend: ${health.checks.backend.status}\nLast checked: ${new Date(health.timestamp).toLocaleTimeString()}`;

  return (
    <Badge
      variant={statusConfig.variant}
      className={cn("gap-2 cursor-help", statusConfig.className)}
      title={tooltipText}
    >
      <Icon className="h-3 w-3" />
      <span>{statusConfig.label}</span>
    </Badge>
  );
}

