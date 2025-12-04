"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HeartPulse,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Activity,
  Users,
  Target,
  MessageSquare,
  Rocket,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHealthScore } from "@/lib/hooks/useHealthScore";
import type {
  CustomerHealthScore,
  HealthStatus,
  HealthTrend,
} from "@/lib/types/customerSuccess";
import Link from "next/link";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

// ============================================
// CONFIGURACIÓN DE ESTILOS
// ============================================

const statusConfig: Record<HealthStatus, { color: string; bgColor: string; label: string }> = {
  healthy: {
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Saludable",
  },
  stable: {
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Estable",
  },
  at_risk: {
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    label: "En Riesgo",
  },
  critical: {
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "Crítico",
  },
};

const trendIcons: Record<HealthTrend, typeof TrendingUp> = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const componentIcons = {
  engagement: Activity,
  adoption: Rocket,
  outcomes: Target,
  satisfaction: MessageSquare,
  growth: Users,
};

const componentLabels = {
  engagement: "Engagement",
  adoption: "Adopción",
  outcomes: "Resultados",
  satisfaction: "Satisfacción",
  growth: "Crecimiento",
};

// ============================================
// COMPONENTE SCORE CIRCLE
// ============================================

interface ScoreCircleProps {
  score: number;
  size?: "sm" | "md" | "lg";
  status: HealthStatus;
  showLabel?: boolean;
}

function ScoreCircle({ score, size = "md", status, showLabel = true }: ScoreCircleProps) {
  const config = statusConfig[status];
  
  const sizeClasses = {
    sm: "h-16 w-16 text-xl",
    md: "h-24 w-24 text-3xl",
    lg: "h-32 w-32 text-4xl",
  };

  const strokeWidth = size === "sm" ? 4 : 6;
  const radius = size === "sm" ? 28 : size === "md" ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className={config.color}
            style={{
              transition: "stroke-dashoffset 1s ease-in-out",
            }}
          />
        </svg>
        {/* Score number */}
        <span className={cn("font-bold", config.color)}>{score}</span>
      </div>
      {showLabel && (
        <Badge variant="outline" className={cn("text-xs", config.color, config.bgColor)}>
          {config.label}
        </Badge>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE BARRA DE PROGRESO DE COMPONENTE
// ============================================

interface ComponentBarProps {
  name: keyof typeof componentLabels;
  score: number;
  tooltip?: string;
}

function ComponentBar({ name, score, tooltip }: ComponentBarProps) {
  const Icon = componentIcons[name];
  const label = componentLabels[name];

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const content = (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">{label}</span>
        </div>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getProgressColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">{content}</div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface HealthScoreCardProps {
  organizationId: string;
  variant?: "full" | "compact" | "mini";
  showDetails?: boolean;
  className?: string;
}

export function HealthScoreCard({
  organizationId,
  variant = "full",
  showDetails = true,
  className,
}: HealthScoreCardProps) {
  const { data: healthScore, isLoading, error } = useHealthScore(organizationId);
  const t = useTranslationsSafe("customerSuccess.healthScore");

  const TrendIcon = useMemo(() => {
    if (!healthScore) return Minus;
    return trendIcons[healthScore.trend];
  }, [healthScore]);

  const trendText = useMemo(() => {
    if (!healthScore) return "";
    const change = healthScore.change;
    if (change > 0) return `+${change} pts`;
    if (change < 0) return `${change} pts`;
    return "Sin cambio";
  }, [healthScore]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="h-5 w-5" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
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
          <CardTitle className="flex items-center gap-2 text-base">
            <HeartPulse className="h-5 w-5" />
            Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No se pudo cargar el Health Score</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variante mini - solo el score
  if (variant === "mini") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <ScoreCircle
          score={healthScore.overall}
          size="sm"
          status={healthScore.status}
          showLabel={false}
        />
        <div>
          <p className="text-sm font-medium">Health Score</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendIcon className={cn(
              "h-3 w-3",
              healthScore.trend === "improving" && "text-green-500",
              healthScore.trend === "declining" && "text-red-500"
            )} />
            <span>{trendText}</span>
          </div>
        </div>
      </div>
    );
  }

  // Variante compacta
  if (variant === "compact") {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ScoreCircle
                score={healthScore.overall}
                size="sm"
                status={healthScore.status}
              />
              <div>
                <p className="text-sm font-medium">Health Score</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendIcon className={cn(
                    "h-3 w-3",
                    healthScore.trend === "improving" && "text-green-500",
                    healthScore.trend === "declining" && "text-red-500"
                  )} />
                  <span>{trendText} vs. mes anterior</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/admin/customer-success?org=${organizationId}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variante full
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <HeartPulse className="h-5 w-5" />
              Health Score
            </CardTitle>
            <CardDescription>
              Puntuación de salud del cliente
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/customer-success?org=${organizationId}`}>
              Ver detalles
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score principal */}
        <div className="flex flex-col items-center gap-2">
          <ScoreCircle
            score={healthScore.overall}
            size="lg"
            status={healthScore.status}
          />
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendIcon className={cn(
              "h-4 w-4",
              healthScore.trend === "improving" && "text-green-500",
              healthScore.trend === "declining" && "text-red-500"
            )} />
            <span>{trendText} vs. mes anterior</span>
          </div>
        </div>

        {/* Desglose de componentes */}
        {showDetails && (
          <div className="space-y-3">
            <ComponentBar
              name="engagement"
              score={healthScore.components.engagement.score}
              tooltip={`DAU ratio: ${healthScore.components.engagement.metrics.dauRatio}%, Sesión promedio: ${healthScore.components.engagement.metrics.avgSessionTime}min`}
            />
            <ComponentBar
              name="adoption"
              score={healthScore.components.adoption.score}
              tooltip={`Tasa de adopción de features: ${healthScore.components.adoption.metrics.featureAdoptionRate}%`}
            />
            <ComponentBar
              name="outcomes"
              score={healthScore.components.outcomes.score}
              tooltip={`SLA compliance: ${healthScore.components.outcomes.metrics.slaCompliance}%, Resolución: ${healthScore.components.outcomes.metrics.ticketResolutionRate}%`}
            />
            <ComponentBar
              name="satisfaction"
              score={healthScore.components.satisfaction.score}
              tooltip={`NPS: ${healthScore.components.satisfaction.metrics.nps ?? 'N/A'}, CSAT: ${healthScore.components.satisfaction.metrics.csat ?? 'N/A'}`}
            />
            <ComponentBar
              name="growth"
              score={healthScore.components.growth.score}
              tooltip={`Crecimiento usuarios MoM: ${healthScore.components.growth.metrics.userGrowthMoM}%`}
            />
          </div>
        )}

        {/* Sugerencias */}
        {healthScore.suggestions && healthScore.suggestions.length > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Próximos pasos sugeridos:
            </p>
            <ul className="text-xs space-y-1">
              {healthScore.suggestions.slice(0, 3).map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthScoreCard;
