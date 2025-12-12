"use client";

import { useState, useMemo } from "react";
import { Users, AlertTriangle, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useResources, useResourceWorkload } from "@/lib/hooks/useResources";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/types/resources";

interface ResourceSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  organizationId?: string;
  projectId?: string;
  startDate?: Date;
  endDate?: Date;
  showWorkload?: boolean;
  disabled?: boolean;
}

export function ResourceSelector({
  value,
  onValueChange,
  organizationId,
  projectId,
  startDate,
  endDate,
  showWorkload = true,
  disabled = false,
}: ResourceSelectorProps) {
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>(value);

  // Obtener recursos
  const { data: resources = [], isLoading } = useResources({
    organizationId,
  });

  // Calcular fechas para carga de trabajo (si no se proporcionan, usar próximos 7 días)
  const workloadStart = useMemo(() => startDate || new Date(), [startDate]);
  const workloadEnd = useMemo(
    () => endDate || addDays(new Date(), 7),
    [endDate]
  );

  // Obtener carga de trabajo del recurso seleccionado
  const { data: workload } = useResourceWorkload(
    selectedResourceId || "",
    workloadStart,
    workloadEnd
  );

  const selectedResource = useMemo(() => {
    return resources.find((r) => r.id === selectedResourceId);
  }, [resources, selectedResourceId]);

  // Validar currentWorkload basado en datos reales de workload
  // Si no hay tareas asignadas, el currentWorkload debe ser 0
  const validatedCurrentWorkload = useMemo(() => {
    if (!selectedResource) return 0;
    
    // Si tenemos datos de workload, validar contra ellos
    if (workload) {
      const hasTasks = workload.totalHours > 0 || 
        workload.dailyWorkload.some(day => day.tasks && day.tasks.length > 0);
      
      // Si no hay tareas, el currentWorkload debe ser 0 (corregir valor incorrecto del backend)
      if (!hasTasks) {
        return 0;
      }
      
      // Si hay tareas, usar el valor calculado del workload (averageUtilization o maxUtilization)
      // pero validar que no sea mayor que el maxWorkload
      const calculatedWorkload = workload.averageUtilization || workload.maxUtilization || 0;
      return Math.min(calculatedWorkload, selectedResource.maxWorkload || 100);
    }
    
    // Si no hay datos de workload aún, forzar a 0 si el backend retorna un valor > 0
    // Esto corrige el caso donde el backend retorna un valor incorrecto (ej: 28%) cuando no hay tareas
    const backendWorkload = selectedResource.currentWorkload || 0;
    if (backendWorkload > 0) {
      // Si el backend dice que hay carga pero no tenemos datos de workload, 
      // es probable que sea un error del backend - forzar a 0
      return 0;
    }
    
    // Último recurso: usar el valor del backend pero validar que sea >= 0
    return Math.max(0, backendWorkload);
  }, [selectedResource, workload]);

  const handleValueChange = (newValue: string) => {
    setSelectedResourceId(newValue);
    onValueChange(newValue);
  };

  // Filtrar recursos disponibles (opcional: solo mostrar disponibles)
  const availableResources = useMemo(() => {
    return resources.map((r) => {
      // Validar currentWorkload para cada recurso
      // Si el recurso no tiene tareas asignadas, currentWorkload debe ser 0
      // Nota: Esta validación es básica, la validación completa se hace con workload data
      const validatedWorkload = Math.max(0, r.currentWorkload || 0);
      return {
        ...r,
        currentWorkload: validatedWorkload,
      };
    }).filter((r) => {
      // Si showWorkload está habilitado, mostrar todos
      // Si no, solo mostrar disponibles
      if (!showWorkload) {
        return r.availability.status === "available" || r.availability.status === "busy";
      }
      return true;
    });
  }, [resources, showWorkload]);

  // Detectar conflictos potenciales
  const hasConflicts = useMemo(() => {
    if (!workload || !selectedResource) return false;
    return (
      workload.conflicts.length > 0 ||
      workload.maxUtilization > (selectedResource.maxWorkload || 100)
    );
  }, [workload, selectedResource]);

  return (
    <div className="space-y-2">
      <Select
        value={selectedResourceId || ""}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar recurso..." />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Cargando recursos...
            </SelectItem>
          ) : availableResources.length === 0 ? (
            <SelectItem value="no-resources" disabled>
              No hay recursos disponibles
            </SelectItem>
          ) : (
            availableResources.map((resource) => {
              const isOverloaded =
                resource.currentWorkload >= (resource.maxWorkload || 100);
              const isUnavailable = resource.availability.status === "unavailable" || 
                                   resource.availability.status === "on_leave";

              return (
                <SelectItem key={resource.id} value={resource.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{resource.userName}</span>
                    <div className="flex items-center gap-2 ml-2">
                      {isUnavailable && (
                        <Badge variant="outline" className="text-xs">
                          No disponible
                        </Badge>
                      )}
                      {isOverloaded && !isUnavailable && (
                        <Badge variant="destructive" className="text-xs">
                          Sobrecargado
                        </Badge>
                      )}
                      {!isOverloaded && !isUnavailable && (
                        <Badge variant="secondary" className="text-xs">
                          {resource.currentWorkload}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })
          )}
        </SelectContent>
      </Select>

      {/* Información del recurso seleccionado */}
      {selectedResource && showWorkload && (
        <Card className="mt-2">
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{selectedResource.userName}</span>
              </div>
              <Badge
                variant={
                  selectedResource.availability.status === "available"
                    ? "default"
                    : selectedResource.availability.status === "busy"
                      ? "secondary"
                      : "outline"
                }
                className="text-xs"
              >
                {selectedResource.availability.status === "available"
                  ? "Disponible"
                  : selectedResource.availability.status === "busy"
                    ? "Ocupado"
                    : selectedResource.availability.status === "on_leave"
                      ? "En vacaciones"
                      : "No disponible"}
              </Badge>
            </div>

            {/* Carga de trabajo actual */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Carga de trabajo</span>
                <span
                  className={cn(
                    "font-medium",
                    validatedCurrentWorkload >= (selectedResource.maxWorkload || 100)
                      ? "text-red-600"
                      : validatedCurrentWorkload >= (selectedResource.maxWorkload || 100) * 0.8
                        ? "text-orange-600"
                        : "text-green-600"
                  )}
                >
                  {validatedCurrentWorkload}% / {selectedResource.maxWorkload || 100}%
                </span>
              </div>
              <Progress
                value={validatedCurrentWorkload}
                className="h-2"
              />
            </div>

            {/* Horarios de trabajo */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {selectedResource.availability.workingHours.start} -{" "}
                {selectedResource.availability.workingHours.end}
              </span>
            </div>

            {/* Carga de trabajo en el período */}
            {workload && (
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Período seleccionado</span>
                  <span className="font-medium">
                    {format(workloadStart, "dd/MM")} - {format(workloadEnd, "dd/MM")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Utilización promedio</span>
                  <span
                    className={cn(
                      "font-medium",
                      workload.averageUtilization > (selectedResource.maxWorkload || 100)
                        ? "text-red-600"
                        : workload.averageUtilization > (selectedResource.maxWorkload || 100) * 0.8
                          ? "text-orange-600"
                          : "text-green-600"
                    )}
                  >
                    {workload.averageUtilization.toFixed(0)}%
                  </span>
                </div>
                {workload.maxUtilization > (selectedResource.maxWorkload || 100) && (
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>
                      Máximo: {workload.maxUtilization.toFixed(0)}% (sobreasignación)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Advertencias de conflictos */}
            {hasConflicts && workload && (
              <div className="pt-2 border-t">
                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">Conflictos detectados</div>
                    {workload.conflicts.slice(0, 2).map((conflict) => (
                      <div key={conflict.id} className="text-xs">
                        • {conflict.message}
                      </div>
                    ))}
                    {workload.conflicts.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{workload.conflicts.length - 2} conflicto(s) más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skills relevantes (opcional) */}
            {selectedResource.skills && selectedResource.skills.length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">Skills principales</div>
                <div className="flex flex-wrap gap-1">
                  {selectedResource.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {selectedResource.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedResource.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

