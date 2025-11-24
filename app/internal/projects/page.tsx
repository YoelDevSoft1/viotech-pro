"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, FolderKanban } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { fetchProjects, type Project } from "@/lib/projects";

export default function InternalProjectsPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects(orgId || undefined);
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al cargar proyectos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel interno
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Proyectos</p>
          <h1 className="text-3xl font-medium text-foreground">Proyectos por organización</h1>
          <p className="text-sm text-muted-foreground">
            Filtra por organización para ver proyectos activos y su estado.
          </p>
        </div>

        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Cargando proyectos...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No hay proyectos para la organización seleccionada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/internal/projects/${p.id}`}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-2 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FolderKanban className="w-4 h-4" />
                    {p.nombre}
                  </div>
                  <span className="text-xs rounded-full border border-border px-2 py-1 capitalize text-muted-foreground">
                    {p.estado}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.tipo || "Proyecto"} · Org: {p.organizationId || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.descripcion || "Sin descripción."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
