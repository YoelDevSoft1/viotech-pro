"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Filter, X, Search } from "lucide-react";
import { fetchProjectById, type Project } from "@/lib/projects";
import { KanbanBoard } from "@/components/projects/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { KanbanFilters } from "@/lib/types/kanban";

export default function ProjectKanbanPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [filters, setFilters] = useState<KanbanFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Obtener proyecto
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return (data?.data || data) as Project;
    },
    enabled: !!projectId,
  });

  // Obtener usuarios para el filtro de asignado
  const { data: users = [] } = useQuery({
    queryKey: ["users", "kanban"],
    queryFn: async () => {
      const { data } = await apiClient.get("/users", { params: { limit: 100 } });
      const raw = data?.data?.users || data?.users || data?.data || [];
      return Array.isArray(raw) ? raw : [];
    },
  });

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.asignadoA ||
      filters.prioridad ||
      filters.categoria ||
      filters.search
    );
  }, [filters]);

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/internal/projects/${projectId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al proyecto
            </Link>
          </div>
        </div>

        {projectLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        ) : project ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    Kanban Board
                  </p>
                  <h1 className="text-3xl font-semibold text-foreground">
                    {project.nombre}
                  </h1>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(filters).filter((k) => filters[k as keyof KanbanFilters]).length}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Búsqueda</label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tareas..."
                          value={filters.search || ""}
                          onChange={(e) =>
                            setFilters({ ...filters, search: e.target.value || undefined })
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Asignado a</label>
                      <Select
                        value={filters.asignadoA || ""}
                        onValueChange={(value) =>
                          setFilters({ ...filters, asignadoA: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos</SelectItem>
                          {users.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.nombre || user.name || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Prioridad</label>
                      <Select
                        value={filters.prioridad || ""}
                        onValueChange={(value) =>
                          setFilters({ ...filters, prioridad: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          <SelectItem value="P1">P1 - Crítica</SelectItem>
                          <SelectItem value="P2">P2 - Alta</SelectItem>
                          <SelectItem value="P3">P3 - Media</SelectItem>
                          <SelectItem value="P4">P4 - Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Categoría</label>
                      <Select
                        value={filters.categoria || ""}
                        onValueChange={(value) =>
                          setFilters({ ...filters, categoria: value || undefined })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Funcional">Funcional</SelectItem>
                          <SelectItem value="Consultoría">Consultoría</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="mt-4 flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="w-4 h-4 mr-2" />
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Kanban Board */}
            <div className="mt-6">
              <KanbanBoard projectId={projectId} filters={filters} />
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Proyecto no encontrado
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

