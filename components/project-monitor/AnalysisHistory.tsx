"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RiskAnalysis, RiskLevel } from "@/lib/types/project-monitor";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { History, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisHistoryProps {
  history: RiskAnalysis[];
  isLoading?: boolean;
  maxHeight?: string;
}

const riskBadgeStyles: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "BAJO",
  medium: "MEDIO",
  high: "ALTO",
  critical: "CRÍTICO",
};

export function AnalysisHistory({
  history,
  isLoading,
  maxHeight = "400px",
}: AnalysisHistoryProps) {
  const t = useTranslationsSafe("projectMonitor");

  if (isLoading) {
    return <AnalysisHistorySkeleton />;
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5" />
            {t("analysisHistory")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t("noHistoryAvailable")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-5 w-5" />
          {t("analysisHistory")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea style={{ maxHeight }}>
          <div className="divide-y">
            {history.map((item, index) => {
              const previousItem = history[index + 1];
              const trend = previousItem
                ? item.risk_score > previousItem.risk_score
                  ? "up"
                  : item.risk_score < previousItem.risk_score
                  ? "down"
                  : "stable"
                : "stable";

              return (
                <AnalysisHistoryItem
                  key={item.id}
                  item={item}
                  trend={trend}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface AnalysisHistoryItemProps {
  item: RiskAnalysis;
  trend: "up" | "down" | "stable";
}

function AnalysisHistoryItem({ item, trend }: AnalysisHistoryItemProps) {
  const t = useTranslationsSafe("projectMonitor");
  const riskLevel = item.risk_level as RiskLevel;
  const riskPercent = Math.round(item.risk_score * 100);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-red-500"
      : trend === "down"
      ? "text-green-500"
      : "text-muted-foreground";

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          {format(new Date(item.created_at), "dd/MM/yyyy HH:mm", { locale: es })}
        </span>
        <div className="flex items-center gap-2">
          <TrendIcon className={cn("h-4 w-4", trendColor)} />
          <Badge className={riskBadgeStyles[riskLevel]}>
            {riskLabels[riskLevel]} ({riskPercent}%)
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t("progress")}</p>
          <p className="font-semibold">{Math.round(item.metrics.avgProgress)}%</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("overdueTasks")}</p>
          <p className="font-semibold">{item.metrics.overdueTasks}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t("velocity")}</p>
          <p className="font-semibold">{item.metrics.progressVelocity.toFixed(2)}%/{t("day")}</p>
        </div>
      </div>

      {item.anomalies_count > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-yellow-600 dark:text-yellow-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>
            {item.anomalies_count}{" "}
            {item.anomalies_count > 1 ? t("anomaliesDetected") : t("anomalyDetected")}
          </span>
        </div>
      )}
    </div>
  );
}

function AnalysisHistorySkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}






