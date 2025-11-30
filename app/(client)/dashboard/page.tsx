"use client";

import { AlertCircle } from "lucide-react";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useModelStatus } from "@/lib/hooks/useModelStatus";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { SectionCards } from "@/components/dashboard/section-cards";
import { ServicesPanel } from "@/components/dashboard/ServicesPanel";
import { RoadmapPanel } from "@/components/dashboard/RoadmapPanel";
import { TicketsTrendChart } from "@/components/dashboard/tickets-trend-chart";
import { SLAMetrics } from "@/components/dashboard/sla-metrics";
import { Button } from "@/components/ui/button";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

export default function DashboardPage() {
  const { metrics, isLoading, isError, refetch } = useDashboard();
  const t = useTranslationsSafe("dashboard");
  const tCommon = useTranslationsSafe("common");

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
          <Button onClick={() => refetch()} variant="outline">{tCommon("retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header del Dashboard */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* KPIs principales */}
      <SectionCards metrics={metrics} />

      {/* Grid principal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Servicios activos */}
        <div className="lg:col-span-2">
          <ServicesPanel />
        </div>

        {/* Roadmap inmediato */}
        <RoadmapPanel />
      </div>

      {/* Grid secundario */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gráfico de tendencias */}
        <TicketsTrendChart />

        {/* Métricas de SLA */}
        <SLAMetrics metrics={metrics} />
      </div>
    </div>
  );
}
