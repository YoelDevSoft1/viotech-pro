"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectMonitor } from "@/lib/hooks/useProjectMonitor";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { isAdmin } from "@/lib/types/project-monitor";
import { Play, Square, RefreshCw, Activity, Clock, AlertTriangle } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

interface MonitoringStatusProps {
  showControls?: boolean;
  compact?: boolean;
}

export function MonitoringStatus({ showControls = true, compact = false }: MonitoringStatusProps) {
  const t = useTranslationsSafe("projectMonitor");
  const { data: user } = useCurrentUser();
  const {
    status,
    isLoading,
    error,
    startMonitoring,
    stopMonitoring,
    analyzeAll,
    refresh,
    isStarting,
    isStopping,
    isAnalyzingAll,
    isMutating,
  } = useProjectMonitor();

  const [interval, setInterval] = useState<string>("15");
  const userIsAdmin = user?.rol && isAdmin(user.rol);

  if (isLoading) {
    return <MonitoringStatusSkeleton compact={compact} />;
  }

  if (error) {
    return (
      <Card className={compact ? "p-4" : ""}>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refresh()} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Badge
          variant={status?.isMonitoring ? "default" : "secondary"}
          className={status?.isMonitoring ? "bg-green-500 hover:bg-green-600" : ""}
        >
          <Activity className="h-3 w-3 mr-1" />
          {status?.isMonitoring ? t("active") : t("inactive")}
        </Badge>
        {status?.lastCheck?.length ? (
          <span className="text-xs text-muted-foreground">
            {t("lastCheck")}: {status.lastCheck.length} {t("projects")}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t("monitoringStatus")}
        </CardTitle>
        <CardAction>
          <Badge
            variant={status?.isMonitoring ? "default" : "secondary"}
            className={status?.isMonitoring ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {status?.isMonitoring ? `🟢 ${t("active")}` : `🔴 ${t("inactive")}`}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estadísticas */}
        {status?.isMonitoring && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("lastVerification")}</p>
                <p className="text-xs text-muted-foreground">
                  {status.lastCheck?.length || 0} {t("projectsChecked")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("alertsSent")}</p>
                <p className="text-xs text-muted-foreground">
                  {status.alertHistory?.length || 0} {t("projects")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controles (solo admin) */}
        {showControls && userIsAdmin && (
          <div className="space-y-4 pt-2">
            {!status?.isMonitoring ? (
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block">
                    {t("checkInterval")}
                  </label>
                  <Select value={interval} onValueChange={setInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 {t("minutes")}</SelectItem>
                      <SelectItem value="10">10 {t("minutes")}</SelectItem>
                      <SelectItem value="15">15 {t("minutes")}</SelectItem>
                      <SelectItem value="30">30 {t("minutes")}</SelectItem>
                      <SelectItem value="60">1 {t("hour")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => startMonitoring(parseInt(interval))}
                  disabled={isMutating}
                >
                  {isStarting ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  {t("startMonitoring")}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => stopMonitoring()}
                  disabled={isMutating}
                >
                  {isStopping ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  {t("stopMonitoring")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => analyzeAll()}
                  disabled={isMutating}
                >
                  {isAnalyzingAll ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t("analyzeAll")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mensaje para no-admin */}
        {showControls && !userIsAdmin && (
          <p className="text-sm text-muted-foreground">
            {t("adminOnlyControls")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MonitoringStatusSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return <Skeleton className="h-6 w-32" />;
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}


