"use client";

import { useState, useMemo } from "react";
import { Gantt, ViewMode, Task } from "@rsagiev/gantt-task-react-19";
import "@rsagiev/gantt-task-react-19/dist/index.css";
import { ZoomIn, ZoomOut, Download, Filter, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGanttData, useUpdateGanttTask } from "@/lib/hooks/useGantt";
import type { GanttTask, GanttMilestone } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { exportGanttToPDF, exportGanttToExcel } from "@/lib/utils/ganttExport";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GanttChartProps {
  projectId: string;
}

// Convertir GanttTask a Task de la librería
function ganttTaskToTask(ganttTask: GanttTask): Task {
  const priorityColors: Record<string, { bg: string; progress: string }> = {
    P1: { bg: "#ef4444", progress: "#dc2626" },
    P2: { bg: "#f97316", progress: "#ea580c" },
    P3: { bg: "#eab308", progress: "#ca8a04" },
    P4: { bg: "#22c55e", progress: "#16a34a" },
  };

  const color = priorityColors[ganttTask.priority || "P3"] || priorityColors.P3;

  return {
    id: ganttTask.id,
    name: ganttTask.name,
    type: ganttTask.type,
    start: ganttTask.start,
    end: ganttTask.end,
    progress: ganttTask.progress,
    dependencies: ganttTask.dependencies || [],
    styles: {
      backgroundColor: color.bg,
      backgroundSelectedColor: color.bg,
      progressColor: color.progress,
      progressSelectedColor: color.progress,
    },
  };
}

// Convertir milestones a tasks
function milestonesToTasks(milestones: GanttMilestone[]): Task[] {
  return milestones.map((milestone) => ({
    id: `milestone-${milestone.id}`,
    name: milestone.title,
    type: "milestone" as const,
    start: milestone.date,
    end: milestone.date,
    progress: 100,
    styles: {
      backgroundColor: "#8b5cf6",
      backgroundSelectedColor: "#7c3aed",
      progressColor: "#8b5cf6",
      progressSelectedColor: "#7c3aed",
    },
  }));
}

export function GanttChart({ projectId }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
  const [showMilestones, setShowMilestones] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const { data: ganttData, isLoading } = useGanttData(projectId);
  const updateTask = useUpdateGanttTask();

  // Convertir datos a formato de la librería
  const tasks = useMemo(() => {
    if (!ganttData) return [];

    const taskList: Task[] = ganttData.tasks.map(ganttTaskToTask);

    // Agregar milestones si están habilitados
    if (showMilestones && ganttData.milestones) {
      taskList.push(...milestonesToTasks(ganttData.milestones));
    }

    // Filtrar dependencias si están deshabilitadas
    if (!showDependencies) {
      taskList.forEach((task) => {
        task.dependencies = [];
      });
    }

    return taskList;
  }, [ganttData, showMilestones, showDependencies]);

  // Usar ruta crítica del backend
  const criticalPathTasks = useMemo(() => {
    if (!showCriticalPath || !ganttData) return new Set<string>();
    
    // Usar criticalPath del backend si está disponible
    if (ganttData.criticalPath && ganttData.criticalPath.length > 0) {
      return new Set(ganttData.criticalPath);
    }
    
    // Fallback: usar isCritical de cada tarea
    return new Set(
      ganttData.tasks
        .filter((task) => task.isCritical)
        .map((task) => task.id)
    );
  }, [showCriticalPath, ganttData]);

  // Aplicar colores de ruta crítica
  const tasksWithCriticalPath = useMemo(() => {
    if (!showCriticalPath) return tasks;

    return tasks.map((task) => {
      if (criticalPathTasks.has(task.id)) {
        return {
          ...task,
          styles: {
            ...task.styles,
            backgroundColor: "#dc2626",
            backgroundSelectedColor: "#b91c1c",
            progressColor: "#991b1b",
            progressSelectedColor: "#7f1d1d",
          },
        };
      }
      return task;
    });
  }, [tasks, showCriticalPath, criticalPathTasks]);

  const handleDateChange = async (task: Task, children: Task[]) => {
    // Encontrar el ticketId original
    const originalTask = ganttData?.tasks.find((t) => t.id === task.id);
    if (!originalTask) return false;

    try {
      await updateTask.mutateAsync({
        ticketId: originalTask.ticketId,
        data: {
          startDate: task.start,
          endDate: task.end,
        },
      });
      return true;
    } catch (error) {
      console.error("Error al actualizar fechas:", error);
      return false;
    }
  };

  const handleProgressChange = async (task: Task, children: Task[]) => {
    const originalTask = ganttData?.tasks.find((t) => t.id === task.id);
    if (!originalTask) return false;

    try {
      await updateTask.mutateAsync({
        ticketId: originalTask.ticketId,
        data: {
          progress: task.progress,
        },
      });
      return true;
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      return false;
    }
  };

  const handleExportPDF = () => {
    if (!ganttData) return;
    exportGanttToPDF(ganttData, ganttData.project.name);
  };

  const handleExportExcel = () => {
    if (!ganttData) return;
    exportGanttToExcel(ganttData, ganttData.project.name);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!ganttData) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de Gantt disponibles para este proyecto
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Gantt Chart - {ganttData.project.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Vista:</label>
            <Select
              value={viewMode}
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ViewMode.Day}>Día</SelectItem>
                <SelectItem value={ViewMode.Week}>Semana</SelectItem>
                <SelectItem value={ViewMode.Month}>Mes</SelectItem>
                <SelectItem value={ViewMode.QuarterYear}>Trimestre</SelectItem>
                <SelectItem value={ViewMode.Year}>Año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showMilestones ? "default" : "outline"}
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
            >
              <Target className="h-4 w-4 mr-2" />
              Milestones
            </Button>
            <Button
              variant={showDependencies ? "default" : "outline"}
              size="sm"
              onClick={() => setShowDependencies(!showDependencies)}
            >
              Dependencias
            </Button>
            <Button
              variant={showCriticalPath ? "default" : "outline"}
              size="sm"
              onClick={() => setShowCriticalPath(!showCriticalPath)}
            >
              Ruta Crítica
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(ViewMode.Day)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(ViewMode.Month)}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="border rounded-lg overflow-hidden">
          <Gantt
            tasks={tasksWithCriticalPath}
            viewMode={viewMode}
            locale="es"
            onDateChange={handleDateChange}
            onProgressChange={handleProgressChange}
            onSelect={(task, isSelected) => {
              setSelectedTask(isSelected ? task.id : null);
            }}
            onDoubleClick={(task) => {
              // TODO: Abrir modal de detalles del ticket
              console.log("Double click en tarea:", task);
            }}
            listCellWidth="200px"
            ganttHeight={600}
            rowHeight={50}
            columnWidth={65}
            barFill={80}
            barCornerRadius={4}
            todayColor="rgba(59, 130, 246, 0.1)"
          />
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>P1 - Crítica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500" />
            <span>P2 - Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500" />
            <span>P3 - Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>P4 - Baja</span>
          </div>
          {showMilestones && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500" />
              <span>Milestone</span>
            </div>
          )}
          {showCriticalPath && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-700" />
              <span>Ruta Crítica</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

