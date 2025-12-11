"use client";

import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProjectAnalysis, RiskLevel, RISK_CONFIG } from "@/lib/types/project-monitor";
import { CheckCircle, Info, AlertTriangle, XCircle, TrendingDown, Clock } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

interface ProjectRiskCardProps {
  analysis: ProjectAnalysis;
  projectName?: string;
  showDetails?: boolean;
  onClick?: () => void;
}

const riskIcons = {
  check: CheckCircle,
  info: Info,
  alert: AlertTriangle,
  x: XCircle,
};

const riskStyles: Record<RiskLevel, { bg: string; text: string; border: string; badge: string }> = {
  low: {
    bg: "bg-green-50 dark:bg-green-950/20",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  medium: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  high: {
    bg: "bg-orange-50 dark:bg-orange-950/20",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
  critical: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Bajo",
  medium: "Medio",
  high: "Alto",
  critical: "Crítico",
};

export function ProjectRiskCard({
  analysis,
  projectName,
  showDetails = true,
  onClick,
}: ProjectRiskCardProps) {
  const t = useTranslationsSafe("projectMonitor");
  const { delayRisk, anomalies } = analysis;
  const riskLevel = delayRisk.riskLevel;
  const styles = riskStyles[riskLevel];
  const IconComponent = riskIcons[riskLevel === "low" ? "check" : riskLevel === "medium" ? "info" : riskLevel === "high" ? "alert" : "x"];
  const riskPercent = Math.round(delayRisk.riskScore * 100);

  return (
    <Card
      className={cn(
        "transition-shadow",
        onClick && "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      <CardHeader className="border-b">
        <CardTitle className="text-base">
          {projectName || t("project")}
        </CardTitle>
        <CardAction>
          <Badge className={styles.badge}>
            <IconComponent className="h-3 w-3 mr-1" />
            {riskLabels[riskLevel]} ({riskPercent}%)
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de riesgo */}
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">{t("riskScore")}</span>
            <span className={cn("font-medium", styles.text)}>{riskPercent}%</span>
          </div>
          <Progress
            value={riskPercent}
            className={cn(
              "h-2",
              riskLevel === "critical" && "[&>[data-slot=progress-indicator]]:bg-red-500",
              riskLevel === "high" && "[&>[data-slot=progress-indicator]]:bg-orange-500",
              riskLevel === "medium" && "[&>[data-slot=progress-indicator]]:bg-yellow-500",
              riskLevel === "low" && "[&>[data-slot=progress-indicator]]:bg-green-500"
            )}
          />
        </div>

        {/* Predicciones */}
        {showDetails && delayRisk.predictedDays && delayRisk.estimatedRemaining && (
          <div className="grid grid-cols-2 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t("estimatedDays")}</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {Math.round(delayRisk.estimatedRemaining)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("estimatedDaysTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{t("predictedML")}</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {Math.round(delayRisk.predictedDays)}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("predictedMLTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Anomalías */}
        {showDetails && anomalies > 0 && (
          <div className={cn("p-3 rounded-lg border", styles.bg, styles.border)}>
            <p className={cn("text-sm font-medium", styles.text)}>
              ⚠️ {anomalies} {anomalies > 1 ? t("anomaliesDetected") : t("anomalyDetected")}
            </p>
          </div>
        )}

        {/* Factores de riesgo */}
        {showDetails && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t("riskFactors")}:</p>
            <ul className="text-sm space-y-1.5">
              {delayRisk.factors.predictionMismatch && (
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>{t("predictionMismatch")}</span>
                </li>
              )}
              {delayRisk.factors.anomalies > 0 && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                  <span>
                    {delayRisk.factors.anomalies}{" "}
                    {delayRisk.factors.anomalies > 1
                      ? t("anomaliesDetected")
                      : t("anomalyDetected")}
                  </span>
                </li>
              )}
              {delayRisk.factors.progressDelay && (
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span>{t("progressDelay")}</span>
                </li>
              )}
              {delayRisk.factors.lowVelocity && (
                <li className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-500 shrink-0" />
                  <span>{t("lowVelocity")}</span>
                </li>
              )}
              {!delayRisk.factors.predictionMismatch &&
                !delayRisk.factors.progressDelay &&
                !delayRisk.factors.lowVelocity &&
                delayRisk.factors.anomalies === 0 && (
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{t("noRiskFactors")}</span>
                  </li>
                )}
            </ul>
          </div>
        )}

        {/* Confianza */}
        {showDetails && delayRisk.confidence > 0 && (
          <div className="text-xs text-muted-foreground text-right">
            {t("confidence")}: {Math.round(delayRisk.confidence * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ProjectRiskCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-12" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}






