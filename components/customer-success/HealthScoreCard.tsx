"use client";

import { useHealthScore } from "@/lib/hooks/useHealthScore";
import { useDashboard } from "@/lib/hooks/useDashboard";
import type { HealthScore } from "@/lib/services/healthScoreService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Detecta si un factor de health score es un valor real o un valor por defecto
 * Los factores relacionados con tickets (ticketResponseTime, ticketResolutionRate)
 * requieren tickets resueltos para tener datos reales
 */
function normalizeHealthFactor(
  factorName: string,
  value: number,
  ticketsAbiertos: number = 0,
  ticketsResueltos: number = 0
): number | null {
  // Factores relacionados con tickets requieren tickets resueltos para ser válidos
  const ticketRelatedFactors = ["ticketResponseTime", "ticketResolutionRate", "Tiempo Respuesta", "Tasa Resolución"];
  
  if (ticketRelatedFactors.includes(factorName)) {
    // Si no hay tickets resueltos, el valor 0% es un valor por defecto (no hay datos)
    if (ticketsResueltos === 0 && value === 0) {
      return null; // Tratar como ausencia de datos
    }
    // Si hay tickets abiertos pero no resueltos y el valor es 0%, también es sospechoso
    if (ticketsAbiertos > 0 && ticketsResueltos === 0 && value === 0) {
      return null; // Tratar como ausencia de datos (no se ha realizado análisis)
    }
  }
  
  // Para otros factores, 0% podría ser un valor real (ej: 0 proyectos activos)
  // Pero si el valor es exactamente 0 y no hay contexto, lo dejamos como está
  return value;
}

/**
 * Componente para mostrar el health score de una organización
 * Sprint 4.4 - VioTech Pro
 */
interface HealthScoreCardProps {
  organizationId: string;
  className?: string;
}

/**
 * Valida si un Health Score es válido y debería mostrarse
 * Un Health Score no debería mostrarse si:
 * - La organización no tiene actividad suficiente (sin servicios, proyectos, tickets)
 * - Todos los factores críticos están en 0% o sin datos
 */
function isValidHealthScore(
  healthScore: HealthScore | null | undefined,
  serviciosActivos: number = 0,
  ticketsAbiertos: number = 0,
  ticketsResueltos: number = 0
): boolean {
  if (!healthScore) return false;
  
  // Si no hay servicios activos, no debería haber Health Score
  if (serviciosActivos === 0) {
    return false;
  }
  
  // Si no hay proyectos activos Y no hay tickets, probablemente es una organización sin actividad
  const hasProjects = healthScore.factors.activeProjects > 0;
  const hasTickets = ticketsAbiertos > 0 || ticketsResueltos > 0;
  
  if (!hasProjects && !hasTickets) {
    // Sin proyectos ni tickets, pero verificar si hay otros factores con datos reales
    const hasPaymentData = healthScore.factors.paymentStatus > 0;
    const hasEngagementData = healthScore.factors.engagement > 0;
    
    // Si solo tiene usuarios activos pero nada más, probablemente no es válido
    if (!hasPaymentData && !hasEngagementData && healthScore.factors.activeUsers === 100) {
      return false; // Probablemente es un valor por defecto
    }
  }
  
  // Si el score es muy bajo (< 30) y no hay actividad real, probablemente no es válido
  if (healthScore.score < 30 && !hasProjects && !hasTickets) {
    return false;
  }
  
  return true;
}

export function HealthScoreCard({ organizationId, className }: HealthScoreCardProps) {
  const t = useTranslationsSafe();
  const { data: healthScore, isLoading, error } = useHealthScore(organizationId);
  // Obtener métricas de tickets para detectar valores por defecto
  const { metrics: dashboardMetrics } = useDashboard();
  const ticketsAbiertos = dashboardMetrics?.ticketsAbiertos ?? dashboardMetrics?.openTickets ?? 0;
  const ticketsResueltos = dashboardMetrics?.ticketsResueltos ?? dashboardMetrics?.solvedTickets ?? 0;
  const serviciosActivos = dashboardMetrics?.serviciosActivos ?? dashboardMetrics?.activeServices ?? 0;

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-2 w-full mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Manejar errores que no sean 400/404 (errores reales del servidor)
  const errorStatus = (error as any)?.response?.status;
  const isRealError = error && 
    errorStatus !== 400 && 
    errorStatus !== 404;

  if (isRealError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>
            Error al cargar el health score. Por favor, intenta nuevamente más tarde.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Si no hay healthScore (null), mostrar mensaje informativo
  if (!healthScore) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>
            No hay suficiente actividad para calcular el Health Score. Se requiere al menos: 1 usuario activo, 1 proyecto activo o 3 tickets en los últimos 30 días, y 1 servicio activo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Validar si el Health Score es válido antes de mostrarlo
  // TypeScript ya sabe que healthScore no es null aquí (por el check anterior)
  const isValid = healthScore ? isValidHealthScore(healthScore, serviciosActivos, ticketsAbiertos, ticketsResueltos) : false;
  
  if (!isValid) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>
            El Health Score se calculará automáticamente cuando tu organización tenga suficiente actividad (servicios activos, proyectos o tickets).
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600 bg-green-50 dark:bg-green-950";
      case "medium":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950";
      case "high":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "medium":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getRiskLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "Bajo";
      case "medium":
        return "Medio";
      case "high":
        return "Alto";
      case "critical":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  // Por ahora no mostramos tendencia ya que el backend no retorna previousScore
  // Se puede agregar en el futuro cuando el backend incluya datos históricos

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Health Score
            {getRiskIcon(healthScore.risk_level)}
          </CardTitle>
          <Badge className={cn("text-sm font-medium", getRiskColor(healthScore.risk_level))}>
            {getRiskLabel(healthScore.risk_level)}
          </Badge>
        </div>
        <CardDescription>
          {healthScore.notes || "Score de salud de la organización basado en múltiples factores"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Principal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Score General</span>
            <div className="flex items-center gap-2">
              <span className={cn("text-2xl font-bold", getRiskColor(healthScore.risk_level).split(" ")[0])}>
                {healthScore.score.toFixed(1)}
              </span>
            </div>
          </div>
          <Progress value={healthScore.score} className="h-3" />
          <p className="text-xs text-muted-foreground mt-1">
            Calculado el:{" "}
            {format(new Date(healthScore.calculated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
              locale: es,
            })}
          </p>
        </div>

        {/* Factores de Evaluación */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Factores de Evaluación</h4>
          <div className="grid grid-cols-2 gap-3">
            <FactorItem
              label="Usuarios Activos"
              value={healthScore.factors.activeUsers}
              color="bg-blue-500"
            />
            <FactorItem
              label="Proyectos Activos"
              value={healthScore.factors.activeProjects}
              color="bg-purple-500"
            />
            <FactorItem
              label="Tiempo Respuesta"
              value={normalizeHealthFactor("Tiempo Respuesta", healthScore.factors.ticketResponseTime, ticketsAbiertos, ticketsResueltos)}
              color="bg-indigo-500"
            />
            <FactorItem
              label="Tasa Resolución"
              value={normalizeHealthFactor("Tasa Resolución", healthScore.factors.ticketResolutionRate, ticketsAbiertos, ticketsResueltos)}
              color="bg-green-500"
            />
            <FactorItem
              label="Estado Pagos"
              value={healthScore.factors.paymentStatus}
              color="bg-emerald-500"
            />
            <FactorItem
              label="Engagement"
              value={healthScore.factors.engagement}
              color="bg-pink-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Componente para mostrar un factor individual
 */
function FactorItem({ label, value, color }: { label: string; value: number | null; color: string }) {
  const hasData = value != null;
  const displayValue = hasData ? value : 0;
  const displayText = hasData ? `${value.toFixed(0)}%` : "N/A";
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", !hasData && "text-muted-foreground")}>
          {displayText}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        {hasData ? (
          <div
            className={cn("h-2 rounded-full transition-all", color)}
            style={{ width: `${displayValue}%` }}
          />
        ) : (
          <div className="h-2 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[8px] text-muted-foreground">Sin datos</span>
          </div>
        )}
      </div>
    </div>
  );
}

