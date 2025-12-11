"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitoringStatus } from "./MonitoringStatus";
import { ProjectRiskCard, ProjectRiskCardSkeleton } from "./ProjectRiskCard";
import { AnalysisHistory } from "./AnalysisHistory";
import { useProjectAnalysis } from "@/lib/hooks/useProjectAnalysis";
import { useProjectAlerts } from "@/lib/hooks/useProjectAlerts";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { RefreshCw, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectMonitorDashboardProps {
  projectId: string;
  projectName?: string;
  showMonitoringStatus?: boolean;
}

export function ProjectMonitorDashboard({
  projectId,
  projectName,
  showMonitoringStatus = true,
}: ProjectMonitorDashboardProps) {
  const t = useTranslationsSafe("projectMonitor");
  const {
    analysis,
    history,
    isLoading,
    isLoadingAnalysis,
    isLoadingHistory,
    error,
    analyze,
    refresh,
    isAnalyzing,
  } = useProjectAnalysis(projectId);

  const { alerts, dismissAlert } = useProjectAlerts();

  // Filtrar alertas del proyecto actual
  const projectAlerts = alerts.filter(
    (alert) => alert.metadata?.projectId === projectId
  );

  if (isLoading && !analysis) {
    return <ProjectMonitorDashboardSkeleton showMonitoringStatus={showMonitoringStatus} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas activas del proyecto */}
      {projectAlerts.length > 0 && (
        <div className="space-y-2">
          {projectAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                alert.metadata?.riskLevel === "critical" &&
                  "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
                alert.metadata?.riskLevel === "high" &&
                  "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
                alert.metadata?.riskLevel === "medium" &&
                  "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800"
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-5 w-5 mt-0.5 shrink-0",
                  alert.metadata?.riskLevel === "critical" && "text-red-600",
                  alert.metadata?.riskLevel === "high" && "text-orange-600",
                  alert.metadata?.riskLevel === "medium" && "text-yellow-600"
                )}
              />
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Estado del monitoreo */}
      {showMonitoringStatus && <MonitoringStatus />}

      {/* Análisis del proyecto */}
      {analysis ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("currentAnalysis")}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyze()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("analyze")}
            </Button>
          </div>

          <ProjectRiskCard
            analysis={analysis}
            projectName={projectName}
            showDetails
          />

          <AnalysisHistory history={history} isLoading={isLoadingHistory} />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{t("noAnalysisYet")}</p>
              <Button onClick={() => analyze()} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {t("runFirstAnalysis")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProjectMonitorDashboardSkeleton({
  showMonitoringStatus,
}: {
  showMonitoringStatus?: boolean;
}) {
  return (
    <div className="space-y-6">
      {showMonitoringStatus && (
        <Card>
          <Skeleton className="h-48" />
        </Card>
      )}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-24" />
      </div>
      <ProjectRiskCardSkeleton />
      <Card>
        <Skeleton className="h-64" />
      </Card>
    </div>
  );
}






