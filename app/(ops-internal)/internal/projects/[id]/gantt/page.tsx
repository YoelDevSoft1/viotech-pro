"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GanttChart } from "@/components/projects/GanttChart";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Project } from "@/lib/projects";

export default function ProjectGanttPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}`);
      return (data?.data?.project || data?.data || data) as Project;
    },
    enabled: !!projectId,
  });

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

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : project ? (
          <>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Gantt Chart
              </p>
              <h1 className="text-3xl font-semibold text-foreground">{project.nombre}</h1>
            </div>

            <GanttChart projectId={projectId} />
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            Proyecto no encontrado
          </div>
        )}
      </div>
    </main>
  );
}

