"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, LayoutGrid, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchProjectById, type Project } from "@/lib/projects";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";

export default function InternalProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjectById(params.id);
      setProject(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyecto";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/internal/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a proyectos
          </Link>
          {project && (
            <Button asChild variant="default" size="sm">
              <Link href={`/internal/projects/${params.id}/kanban`}>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Ver Kanban
              </Link>
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando proyecto...
          </div>
        ) : project ? (
          <>
            <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Proyecto #{project.id.slice(0, 6)}
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{project.nombre}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-1 capitalize">
                  {project.estado}
                </span>
                {project.tipo && <span>Tipo: {project.tipo}</span>}
                {project.organizationId && <span>Org: {project.organizationId}</span>}
                {project.createdAt && (
                  <span>
                    Creado:{" "}
                    {new Date(project.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.descripcion || "Sin descripción."}
              </p>
            </div>

            <Tabs defaultValue="timeline" className="w-full">
              <TabsList>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  Detalles
                </TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <ProjectTimeline projectId={params.id} />
              </TabsContent>
              <TabsContent value="details" className="mt-4">
                <div className="rounded-2xl border border-border/70 bg-background/80 p-6">
                  <p className="text-sm text-muted-foreground">
                    Información detallada del proyecto próximamente...
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No se encontró el proyecto.
          </div>
        )}
      </div>
    </main>
  );
}
