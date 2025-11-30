"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "@/lib/hooks/useCustomization";
import type { DashboardWidget, WidgetPosition } from "@/lib/types/customization";
import { cn } from "@/lib/utils";

interface DraggableWidgetProps {
  widget: DashboardWidget;
  onToggleVisibility: (widgetId: string) => void;
}

function DraggableWidget({ widget, onToggleVisibility }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (!widget.visible) {
    return null;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onToggleVisibility(widget.id)}
              >
                {widget.visible ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Widget: {widget.type}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[];
  columns?: number;
  gap?: number;
}

export function DraggableDashboard({
  widgets,
  columns = 3,
  gap = 4,
}: DraggableDashboardProps) {
  const { data: preferences } = useUserPreferences();
  const updatePreferences = useUpdateUserPreferences();

  const visibleWidgets = useMemo(
    () => widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = visibleWidgets.findIndex((w) => w.id === active.id);
      const newIndex = visibleWidgets.findIndex((w) => w.id === over.id);

      const newWidgets = arrayMove(visibleWidgets, oldIndex, newIndex).map(
        (widget, index) => ({
          ...widget,
          order: index,
        })
      );

      // Actualizar preferencias
      if (preferences) {
        updatePreferences.mutate({
          dashboard: {
            ...preferences.dashboard,
            widgets: [
              ...widgets.filter((w) => !w.visible),
              ...newWidgets,
            ],
          },
        });
      }
    }
  };

  const handleToggleVisibility = (widgetId: string) => {
    if (preferences) {
      const updatedWidgets = preferences.dashboard.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );

      updatePreferences.mutate({
        dashboard: {
          ...preferences.dashboard,
          widgets: updatedWidgets,
        },
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleWidgets.map((w) => w.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: `${gap * 0.25}rem`,
          }}
        >
          {visibleWidgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

