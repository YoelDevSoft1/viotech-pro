"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderKanban, LayoutGrid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { fetchProjects, type Project } from "@/lib/projects";
import { useOrg } from "@/lib/hooks/useOrg";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function InternalProjectsPage() {
  const router = useRouter();
  const { orgId, setOrgId } = useOrg();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tProjects = useTranslationsSafe("projects");
  const tCommon = useTranslationsSafe("common");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects(orgId || undefined);
      setProjects(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tProjects("error.loadingFailed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tProjects("goBackToInternal")}
          </Link>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{tProjects("title")}</p>
          <h1 className="text-3xl font-medium text-foreground">{tProjects("byOrganization")}</h1>
          <p className="text-sm text-muted-foreground">
            {tProjects("filterDescription")}
          </p>
        </div>

        <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title={tProjects("loading")} />
        ) : projects.length === 0 ? (
          <EmptyState title={tProjects("noProjects")} message={tProjects("noProjectsMessage")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border/70 bg-background/80 p-4 space-y-3 hover:border-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/internal/projects/${p.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
                  >
                    <FolderKanban className="w-4 h-4" />
                    {p.nombre}
                  </Link>
                  <span className="text-xs rounded-full border border-border px-2 py-1 capitalize text-muted-foreground">
                    {p.estado}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.tipo || tProjects("defaultType")} · Org: {p.organizationId || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.descripcion || tProjects("noDescription")}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/internal/projects/${p.id}`}>
                      {tProjects("detail")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/internal/projects/${p.id}/kanban`}>
                      <LayoutGrid className="w-4 h-4 mr-2" />
                      {tProjects("kanban")}
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/internal/projects/${p.id}/gantt`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      {tProjects("gantt")}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
