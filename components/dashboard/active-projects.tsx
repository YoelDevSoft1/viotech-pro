"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { FolderKanban, Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  nombre: string;
  descripcion?: string;
  estado?: string;
  fechaInicio?: string;
  fechaFin?: string;
  avance?: number;
  organizationId?: string;
}

export function ActiveProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/projects");
        const projectsList = data?.data?.projects || data?.projects || [];
        return projectsList.slice(0, 5) as Project[]; // Mostrar solo los primeros 5
      } catch (error) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg">Proyectos Activos</CardTitle>
          <CardDescription className="text-xs">
            Tus proyectos en desarrollo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No tienes proyectos activos
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/projects">Ver todos los proyectos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proyectos Activos</CardTitle>
            <CardDescription>
              {projects.length} proyecto{projects.length !== 1 ? 's' : ''} en desarrollo
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/projects">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{project.nombre}</h4>
                {project.descripcion && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {project.descripcion}
                  </p>
                )}
              </div>
              {project.estado && (
                <Badge variant="outline" className="shrink-0">
                  {project.estado}
                </Badge>
              )}
            </div>
            
            {typeof project.avance === 'number' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">{project.avance}%</span>
                </div>
                <Progress value={project.avance} className="h-2" />
              </div>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {project.fechaInicio && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(project.fechaInicio).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

