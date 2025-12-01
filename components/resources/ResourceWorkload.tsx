"use client";

import { useState } from "react";
import { Users, AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResources, useResourceWorkload } from "@/lib/hooks/useResources";
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/types/resources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

interface ResourceWorkloadProps {
  organizationId?: string;
}

export function ResourceWorkload({ organizationId }: ResourceWorkloadProps) {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const tResources = useTranslationsSafe("resources");
  const { formatDate } = useI18n();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Obtener recursos
  const { data: resources = [], isLoading: resourcesLoading } = useResources({
    organizationId,
  });

  // Obtener carga de trabajo
  const { data: workload, isLoading: workloadLoading } = useResourceWorkload(
    selectedResource || resources[0]?.id || "",
    weekStart,
    weekEnd
  );

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  if (resourcesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tResources("workload")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {tResources("noResourcesAvailable")}
        </CardContent>
      </Card>
    );
  }

  const selectedResourceData = resources.find((r) => r.id === selectedResource || r.id === resources[0]?.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {tResources("workload")}
            </CardTitle>
            <CardDescription>
              {tResources("workloadDescription")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
              {tResources("previousWeek")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              {tResources("nextWeek")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selector de recurso */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">{tResources("resource")}:</label>
          <Select
            value={selectedResource || resources[0]?.id || ""}
            onValueChange={setSelectedResource}
          >
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {resources.map((resource) => (
                <SelectItem key={resource.id} value={resource.id}>
                  {resource.userName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Información del recurso */}
        {selectedResourceData && (
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium">{selectedResourceData.userName}</h3>
                <p className="text-sm text-muted-foreground">{selectedResourceData.userEmail}</p>
              </div>
              <Badge
                variant={
                  selectedResourceData.currentWorkload >= selectedResourceData.maxWorkload
                    ? "destructive"
                    : selectedResourceData.currentWorkload >= selectedResourceData.maxWorkload * 0.8
                      ? "default"
                      : "secondary"
                }
              >
                {selectedResourceData.currentWorkload}% / {selectedResourceData.maxWorkload}%
              </Badge>
            </div>
            <Progress
              value={selectedResourceData.currentWorkload}
              className="h-2"
            />
          </div>
        )}

        {/* Carga de trabajo semanal */}
        {workloadLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : workload ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                {tResources("weekFrom")} {formatDate(weekStart, "PP")} {tResources("weekTo")}{" "}
                {formatDate(weekEnd, "PP")}
              </h4>
              <div className="text-sm text-muted-foreground">
                {tResources("total")}: {workload.totalHours.toFixed(1)} {tResources("hours")}
              </div>
            </div>

            {/* Gráfico de carga diaria */}
            <div className="space-y-2">
              {workload.dailyWorkload.map((day) => {
                const utilization = day.utilization;
                const isOverloaded = utilization > (selectedResourceData?.maxWorkload || 100);

                return (
                  <div key={day.date} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {formatDate(new Date(day.date), "EEEE, d 'de' MMMM")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={cn(isOverloaded && "text-red-600 font-medium")}>
                          {day.hours.toFixed(1)}h ({utilization.toFixed(0)}%)
                        </span>
                        {isOverloaded && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={utilization}
                      className={cn(
                        "h-3",
                        isOverloaded && "bg-red-100"
                      )}
                    />
                    {day.tasks.length > 0 && (
                      <div className="text-xs text-muted-foreground ml-2">
                        {day.tasks.length} {day.tasks.length !== 1 ? tResources("tasks") : tResources("task")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conflictos */}
            {workload.conflicts && workload.conflicts.length > 0 && (
              <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h4 className="font-medium text-red-900 dark:text-red-100">
                    {tResources("conflictsDetected")}
                  </h4>
                </div>
                <div className="space-y-2">
                  {workload.conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="text-sm text-red-800 dark:text-red-200"
                    >
                      <div className="font-medium">
                        {formatDate(new Date(conflict.date), "PP")}: {conflict.message}
                      </div>
                      {conflict.suggestedResolution && (
                        <div className="text-xs text-red-600 dark:text-red-300 mt-1">
                          {tResources("suggestion")}: {conflict.suggestedResolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{tResources("average")}</div>
                <div className="text-lg font-semibold">
                  {workload.averageUtilization.toFixed(0)}%
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{tResources("maximum")}</div>
                <div className="text-lg font-semibold">
                  {workload.maxUtilization.toFixed(0)}%
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">{tResources("totalHours")}</div>
                <div className="text-lg font-semibold">
                  {workload.totalHours.toFixed(1)}h
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            {tResources("noWorkloadData")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

