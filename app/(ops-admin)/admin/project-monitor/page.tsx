"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  RefreshCw,
  Download,
  FolderKanban,
  Eye,
} from "lucide-react";
import {
  MonitoringStatus,
  ProjectRiskCard,
  AnalysisHistory,
} from "@/components/project-monitor";
import { useProjectMonitor } from "@/lib/hooks/useProjectMonitor";
import { useProjectAnalysis, useAnalyzeProject } from "@/lib/hooks/useProjectAnalysis";
import { useProjectAlerts } from "@/lib/hooks/useProjectAlerts";
import { useProjects, useCurrentUser, useOrganizations } from "@/lib/hooks/useResources";
import { useOrg } from "@/lib/hooks/useOrg";
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import type { RiskLevel } from "@/lib/types/project-monitor";
import { normalizeRole, isAdmin } from "@/lib/types/project-monitor";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { cn } from "@/lib/utils";

// ============================================
// COMPONENTE DE RESUMEN DE PROYECTOS
// ============================================

interface ProjectSummaryProps {
  projects: Array<{ id: string; nombre: string; status?: string }>;
}

function ProjectSummary({ projects }: ProjectSummaryProps) {
  const t = useTranslationsSafe("projectMonitor");
  const { alerts, criticalCount, highCount } = useProjectAlerts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="text-sm text-muted-foreground">{t("totalProjects")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{alerts.length}</p>
            <p className="text-sm text-muted-foreground">{t("activeAlerts")}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-sm text-red-600/80">{t("critical")}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{highCount}</p>
            <p className="text-sm text-orange-600/80">{t("highRisk")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// COMPONENTE DE LISTA DE PROYECTOS
// ============================================

interface ProjectsListProps {
  projects: Array<{ id: string; nombre: string; status?: string; organizationId?: string }>;
  onSelectProject: (projectId: string) => void;
  selectedProjectId: string | null;
}

function ProjectsList({ projects, onSelectProject, selectedProjectId }: ProjectsListProps) {
  const t = useTranslationsSafe("projectMonitor");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const analyzeMutation = useAnalyzeProject();

  const filteredProjects = projects.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return p.status !== "completed";
    if (filter === "completed") return p.status === "completed";
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              {t("projectsList")}
            </CardTitle>
            <CardDescription>{t("selectProjectToAnalyze")}</CardDescription>
          </div>
          <Select value={filter} onValueChange={(v: "all" | "active" | "completed") => setFilter(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allProjects")}</SelectItem>
              <SelectItem value="active">{t("activeProjects")}</SelectItem>
              <SelectItem value="completed">{t("completedProjects")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredProjects.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {t("noProjectsFound")}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                  selectedProjectId === project.id
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                )}
                onClick={() => onSelectProject(project.id)}
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{project.nombre}</p>
                    {project.status && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {project.status}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      analyzeMutation.mutate(project.id);
                    }}
                    disabled={analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={selectedProjectId === project.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <Eye className="h-4 w-4" />
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

// ============================================
// COMPONENTE DE DETALLE DE PROYECTO
// ============================================

interface ProjectDetailProps {
  projectId: string;
  projectName: string;
}

function ProjectDetail({ projectId, projectName }: ProjectDetailProps) {
  const t = useTranslationsSafe("projectMonitor");
  const { analysis, history, isLoading, error, refresh, isAnalyzing, analyze } =
    useProjectAnalysis(projectId);

  if (isLoading && !analysis) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{projectName}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => analyze()}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {t("analyze")}
        </Button>
      </div>

      {analysis ? (
        <>
          <ProjectRiskCard analysis={analysis} projectName={projectName} showDetails />
          <AnalysisHistory history={history} />
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">{t("noAnalysisYet")}</p>
              <Button onClick={() => analyze()} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4 mr-2" />
                )}
                {t("runFirstAnalysis")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE DE ALERTAS ACTIVAS
// ============================================

function ActiveAlerts() {
  const t = useTranslationsSafe("projectMonitor");
  const { alerts, dismissAlert, clearAlerts } = useProjectAlerts();

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-muted-foreground">{t("noActiveAlerts")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("allProjectsHealthy")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const riskStyles: Record<RiskLevel, { bg: string; border: string; icon: string }> = {
    critical: {
      bg: "bg-red-50 dark:bg-red-950/20",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600",
    },
    high: {
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-orange-200 dark:border-orange-800",
      icon: "text-orange-600",
    },
    medium: {
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-yellow-200 dark:border-yellow-800",
      icon: "text-yellow-600",
    },
    low: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600",
    },
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("activeAlerts")} ({alerts.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearAlerts}>
            {t("clearAll")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const level = (alert.metadata?.riskLevel || "medium") as RiskLevel;
            const styles = riskStyles[level];

            return (
              <div
                key={alert.id}
                className={cn(
                  "p-4 rounded-lg border",
                  styles.bg,
                  styles.border
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={cn("h-5 w-5 mt-0.5", styles.icon)} />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.metadata?.projectName}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    {t("dismiss")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ProjectMonitorPage() {
  const t = useTranslationsSafe("projectMonitor");
  const { data: user } = useCurrentUser();
  const { orgId, setOrgId } = useOrg();
  const { data: organizations } = useOrganizations();

  const userRole = user?.rol ? normalizeRole(user.rol) : "cliente";
  const userIsAdmin = userRole === "admin";

  // Para admin: ver todos los proyectos o filtrar por org
  // Para cliente/agente: solo sus proyectos
  const effectiveOrgId = userIsAdmin ? orgId : user?.organizationId;
  
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects(
    userIsAdmin ? orgId || undefined : user?.organizationId
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const selectedProject = projects.find((p: { id: string }) => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
          <p className="text-muted-foreground">{t("pageDescription")}</p>
        </div>
        <div className="flex items-center gap-2">
          {userIsAdmin && (
            <OrgSelector
              onChange={(org: Org | null) => setOrgId(org?.id || "")}
              label={t("filterByOrganization")}
            />
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
        </div>
      </div>

      {/* Estado del Monitoreo (solo admin ve los controles) */}
      <MonitoringStatus showControls={userIsAdmin} />

      {/* Resumen */}
      {!isLoadingProjects && projects.length > 0 && (
        <ProjectSummary projects={projects} />
      )}

      {/* Tabs principales */}
      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            {t("projects")}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t("alerts")}
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("analysisTab")}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Proyectos */}
        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isLoadingProjects ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">{t("loadingProjects")}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ProjectsList
                projects={projects}
                onSelectProject={setSelectedProjectId}
                selectedProjectId={selectedProjectId}
              />
            )}

            {selectedProjectId && selectedProject ? (
              <ProjectDetail
                projectId={selectedProjectId}
                projectName={selectedProject.nombre || t("project")}
              />
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t("selectProjectPrompt")}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts">
          <ActiveAlerts />
        </TabsContent>

        {/* Tab: Análisis */}
        <TabsContent value="analysis">
          {selectedProjectId && selectedProject ? (
            <ProjectDetail
              projectId={selectedProjectId}
              projectName={selectedProject.nombre || t("project")}
            />
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t("selectProjectForAnalysis")}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Mensaje de permisos para no-admin */}
      {!userIsAdmin && (
        <Card className="bg-muted/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              {userRole === "agente"
                ? t("agentPermissionsNote")
                : t("clientPermissionsNote")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
