"use client";

import { useState } from "react";
import { Save, Trash2, Eye, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useUserPreferences,
  useSaveView,
  useDeleteView,
} from "@/lib/hooks/useCustomization";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedView } from "@/lib/types/customization";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

export function SavedViews() {
  const { data: preferences, isLoading } = useUserPreferences();
  const saveView = useSaveView();
  const deleteView = useDeleteView();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState("");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vistas Guardadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const views = preferences?.views || [];

  const handleSave = () => {
    if (!viewName.trim() || !preferences) return;

    // En una implementación real, esto vendría del contexto de la vista actual
    const newView: Omit<SavedView, "id" | "createdAt" | "updatedAt"> = {
      name: viewName,
      type: "tickets", // Esto debería venir del contexto
      filters: {},
      columns: [],
    };

    saveView.mutate(
      {
        viewId: editingView?.id,
        view: newView,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setViewName("");
          setEditingView(null);
        },
      }
    );
  };

  const handleDelete = (viewId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta vista?")) {
      deleteView.mutate(viewId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vistas Guardadas</CardTitle>
            <CardDescription>
              Guarda y gestiona tus vistas personalizadas
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  setEditingView(null);
                  setViewName("");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Guardar Vista
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingView ? "Editar Vista" : "Guardar Vista Actual"}
                </DialogTitle>
                <DialogDescription>
                  Guarda la configuración actual de filtros, columnas y ordenamiento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="view-name">Nombre de la Vista</Label>
                  <Input
                    id="view-name"
                    value={viewName}
                    onChange={(e) => setViewName(e.target.value)}
                    placeholder="Ej: Tickets Urgentes"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setViewName("");
                      setEditingView(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={!viewName.trim()}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {views.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No hay vistas guardadas. Guarda tu primera vista para comenzar.
          </div>
        ) : (
          <div className="space-y-2">
            {views.map((view) => (
              <div
                key={view.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{view.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({view.type})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Actualizada: {format(new Date(view.updatedAt), "PP", { locale: es })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingView(view);
                      setViewName(view.name);
                      setDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(view.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

