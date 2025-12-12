"use client";

import { useState, useMemo } from "react";
import { Users, Grid, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useResources } from "@/lib/hooks/useResources";
import { ResourceCard } from "./ResourceCard";
import { ResourceFilters } from "./ResourceFilters";
import type { ResourceFilters as ResourceFiltersType } from "@/lib/types/resources";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ResourcesListProps {
  organizationId?: string;
  onSelectResource?: (resourceId: string) => void;
  selectedResourceId?: string;
  showFilters?: boolean;
  viewMode?: "grid" | "list";
  compact?: boolean;
}

export function ResourcesList({
  organizationId,
  onSelectResource,
  selectedResourceId,
  showFilters = true,
  viewMode: initialViewMode = "grid",
  compact = false,
}: ResourcesListProps) {
  const tResources = useTranslationsSafe("resources");
  const [filters, setFilters] = useState<ResourceFiltersType>({
    organizationId,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);

  const { data: rawResources = [], isLoading, isError, refetch } = useResources(filters);

  // Filtrar recursos: excluir clientes (solo mostrar recursos internos del equipo)
  const resources = useMemo(() => {
    return rawResources.filter((r) => {
      const role = r.role?.toLowerCase();
      // Excluir roles de cliente
      return role !== "cliente" && role !== "client";
    });
  }, [rawResources]);

  // Estadísticas
  const stats = useMemo(() => {
    if (!resources.length) return null;

    const available = resources.filter((r) => r.availability.status === "available").length;
    const busy = resources.filter((r) => r.availability.status === "busy").length;
    const unavailable = resources.filter((r) => r.availability.status === "unavailable").length;
    const onLeave = resources.filter((r) => r.availability.status === "on_leave").length;
    const avgWorkload =
      resources.reduce((acc, r) => acc + r.currentWorkload, 0) / resources.length;

    return { available, busy, unavailable, onLeave, avgWorkload, total: resources.length };
  }, [resources]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {showFilters && <Skeleton className="h-10 w-full" />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Users className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold">{tResources("errorLoading")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {tResources("errorLoadingDescription")}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          {tResources("retry")}
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros y controles */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <ResourceFilters
              filters={filters}
              onFiltersChange={setFilters}
              className="flex-1"
            />
            
            <div className="flex items-center gap-2">
              {/* Toggle de vista */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        {stats && !compact && (
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                {stats.available} {tResources("status.available")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">
                {stats.busy} {tResources("status.busy")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">
                {stats.unavailable} {tResources("status.unavailable")}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">
                {stats.onLeave} {tResources("status.onLeave")}
              </span>
            </div>
            <div className="text-muted-foreground">
              | {tResources("avgWorkload")}: {stats.avgWorkload.toFixed(0)}%
            </div>
          </div>
        )}

        {/* Lista de recursos */}
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">{tResources("noResources")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tResources("noResourcesDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            )}
          >
            {resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                href={`/internal/resources/${resource.id}`}
                onClick={
                  onSelectResource
                    ? () => onSelectResource(resource.id)
                    : undefined
                }
                selected={selectedResourceId === resource.id}
                compact={compact || viewMode === "list"}
              />
            ))}
          </div>
        )}

        {/* Contador */}
        <div className="text-sm text-muted-foreground text-center">
          {resources.length} {resources.length === 1 ? tResources("resource") : tResources("resources")}
        </div>
      </div>
    </TooltipProvider>
  );
}

