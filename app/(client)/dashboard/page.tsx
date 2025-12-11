"use client";

import { AlertCircle, Gauge, LayoutDashboard, Package, RefreshCcw, Ticket } from "lucide-react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SectionCards } from "@/components/dashboard/section-cards";
import { ServicesPanel } from "@/components/dashboard/ServicesPanel";
import { RoadmapPanel } from "@/components/dashboard/RoadmapPanel";
import { TicketsTrendChart } from "@/components/dashboard/tickets-trend-chart";
import { SLAMetrics } from "@/components/dashboard/sla-metrics";
import { HealthScoreCard } from "@/components/customer-success/HealthScoreCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useCurrentUser } from "@/lib/hooks/useResources";

export default function DashboardPage() {
  const { metrics, isLoading, isError, refetch } = useDashboard();
  const { data: user } = useCurrentUser();
  const t = useTranslationsSafe("dashboard");
  const tCommon = useTranslationsSafe("common");
  const tUI = useTranslationsSafe("ui");
  const tSidebar = useTranslationsSafe("sidebar");

  const openTickets = metrics?.openTickets ?? metrics?.ticketsAbiertos ?? 0;
  const activeServices = metrics?.activeServices ?? metrics?.serviciosActivos ?? 0;
  const slaCompliance = metrics?.slaCompliance ?? metrics?.slaCumplido ?? null;

  // Solo esperamos a que useDashboard termine de cargar
  // useModelStatus se maneja independientemente en SecurityPanel
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h3 className="text-xl font-semibold">{t("error.loadingFailed")}</h3>
          <p className="text-muted-foreground">{t("error.checkConnection")}</p>
          <Button onClick={() => refetch()} variant="outline">
            {tCommon("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {openTickets > 0 && (
            <Badge variant="secondary" className="gap-1.5">
              <Ticket className="h-3.5 w-3.5" />
              {openTickets} {t("kpis.openTickets")}
            </Badge>
          )}
          {activeServices > 0 && (
            <Badge variant="outline" className="gap-1.5">
              <Package className="h-3.5 w-3.5" />
              {activeServices} {tSidebar("myServices")}
            </Badge>
          )}
          {slaCompliance != null && (
            <Badge variant="outline" className="gap-1.5">
              <Gauge className="h-3.5 w-3.5" />
              {slaCompliance}% SLA
            </Badge>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => refetch()}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tUI("refresh")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* KPIs principales */}
      <div data-tour="kpis">
        <SectionCards metrics={metrics} />
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Servicios activos */}
        <div className="lg:col-span-2" data-tour="services-panel">
          <ServicesPanel />
        </div>

        {/* Roadmap inmediato */}
        <div data-tour="roadmap">
          <RoadmapPanel />
        </div>
      </div>

      {/* Grid secundario */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-tour="charts">
        {/* Grafico de tendencias */}
        <TicketsTrendChart />

        {/* Metricas de SLA */}
        <SLAMetrics metrics={metrics} />
      </div>

      {/* Health Score Card */}
      {user?.organizationId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" data-tour="health-score">
          <HealthScoreCard organizationId={user.organizationId} />
        </div>
      )}
    </div>
  );
}
