"use client";

import { useHealthScore } from "@/lib/hooks/useHealthScore";
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
 * Componente para mostrar el health score de una organización
 * Sprint 4.4 - VioTech Pro
 */
interface HealthScoreCardProps {
  organizationId: string;
  className?: string;
}

export function HealthScoreCard({ organizationId, className }: HealthScoreCardProps) {
  const t = useTranslationsSafe();
  const { data: healthScore, isLoading, error } = useHealthScore(organizationId);

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

  if (error || !healthScore) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Health Score</CardTitle>
          <CardDescription>
            {error
              ? "Error al cargar el health score"
              : "Health score no disponible. Se calculará automáticamente."}
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
              value={healthScore.factors.ticketResponseTime}
              color="bg-indigo-500"
            />
            <FactorItem
              label="Tasa Resolución"
              value={healthScore.factors.ticketResolutionRate}
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
function FactorItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
        <div
          className={cn("h-2 rounded-full transition-all", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

