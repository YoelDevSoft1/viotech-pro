"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { KanbanTask, KanbanColumn, KanbanFilters } from "@/lib/types/kanban";
import { useKanbanTasks, useKanbanColumns, useMoveTask } from "@/lib/hooks/useKanban";

interface KanbanBoardProps {
  projectId: string;
  filters?: KanbanFilters;
}

// Componente de tarea arrastrable
function KanbanTaskCard({ task }: { task: KanbanTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "P1":
      case "CRITICA":
        return "bg-red-500";
      case "P2":
      case "ALTA":
        return "bg-orange-500";
      case "P3":
      case "MEDIA":
        return "bg-yellow-500";
      case "P4":
      case "BAJA":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "shadow-lg" : ""}`}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm flex-1 line-clamp-2">{task.title}</h4>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={`text-xs ${getPriorityColor(task.priority)} text-white`}
          >
            {task.priority}
          </Badge>

          {task.asignadoA && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[100px]">
                {task.asignadoNombre || "Asignado"}
              </span>
            </div>
          )}

          {task.categoria && (
            <Badge variant="outline" className="text-xs">
              {task.categoria}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de columna
function KanbanColumn({
  column,
  tasks,
  isDragging,
}: {
  column: KanbanColumn;
  tasks: KanbanTask[];
  isDragging: boolean;
}) {
  const taskIds = tasks.map((t) => t.id);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[280px]">
      <Card
        ref={setNodeRef}
        className={`flex-1 flex flex-col transition-colors ${
          isOver ? "border-primary border-2" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color || "bg-gray-500"}`} />
              {column.title}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                  {isOver ? "Suelta aquí" : "Sin tareas"}
                </div>
              ) : (
                tasks.map((task) => (
                  <KanbanTaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal del Kanban Board
export function KanbanBoard({ projectId, filters }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const { data: tasks = [], isLoading: tasksLoading } = useKanbanTasks(projectId, filters);
  const { data: columns = [] } = useKanbanColumns(projectId);
  const moveTask = useMoveTask();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requiere 8px de movimiento para activar drag
      },
    })
  );

  // Agrupar tareas por columna
  const tasksByColumn = useMemo(() => {
    const grouped: Record<string, KanbanTask[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = tasks.filter((task) => task.status === col.status);
    });
    return grouped;
  }, [tasks, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetColumnId = over.id as string;

    // Encontrar la columna destino
    const targetColumn = columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) return;

    // Encontrar la tarea actual
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetColumn.status) return;

    // Mover la tarea
    moveTask.mutate({
      taskId,
      newStatus: targetColumn.status,
      projectId,
    });
  };

  if (tasksLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-[280px]">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByColumn[column.id] || []}
            isDragging={!!activeTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-90">
            <KanbanTaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

