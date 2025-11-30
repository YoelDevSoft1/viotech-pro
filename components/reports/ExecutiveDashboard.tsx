"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Download, Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExecutiveDashboard } from "@/lib/hooks/useReports";
import { exportExecutiveDashboardToPDF, exportExecutiveDashboardToExcel } from "@/lib/utils/reportExport";
import { format, subDays, subWeeks, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale/es";
import { KPICard } from "@/components/reports/KPICard";
import { MetricsChart } from "@/components/reports/MetricsChart";
import { HistoricalComparison } from "@/components/reports/HistoricalComparison";
import { Predictions } from "@/components/reports/Predictions";
import type { ReportFilters } from "@/lib/types/reports";
import { cn } from "@/lib/utils";

interface ExecutiveDashboardProps {
  organizationId?: string;
}

export function ExecutiveDashboard({ organizationId }: ExecutiveDashboardProps) {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y" | "custom">("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // Calcular fechas según el período
  const getDateRange = (): { start: string; end: string } => {
    const end = new Date();
    let start: Date;

    switch (period) {
      case "7d":
        start = subDays(end, 7);
        break;
      case "30d":
        start = subDays(end, 30);
        break;
      case "90d":
        start = subDays(end, 90);
        break;
      case "1y":
        start = subMonths(end, 12);
        break;
      case "custom":
        return {
          start: customStart || format(subDays(end, 30), "yyyy-MM-dd"),
          end: customEnd || format(end, "yyyy-MM-dd"),
        };
      default:
        start = subDays(end, 30);
    }

    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  };

  const dateRange = getDateRange();
  const filters: ReportFilters = {
    organizationId,
    startDate: dateRange.start,
    endDate: dateRange.end,
    period: period === "7d" ? "daily" : period === "30d" ? "weekly" : "monthly",
  };

  const { data: dashboard, isLoading } = useExecutiveDashboard(filters);

  const handleExport = (format: "pdf" | "excel") => {
    if (!dashboard) return;

    if (format === "pdf") {
      exportExecutiveDashboardToPDF(dashboard, "Dashboard Ejecutivo");
    } else {
      exportExecutiveDashboardToExcel(dashboard, "Dashboard Ejecutivo");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos disponibles para el período seleccionado
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dashboard Ejecutivo
              </CardTitle>
              <CardDescription>
                Período: {format(new Date(dateRange.start), "PP", { locale: es })} -{" "}
                {format(new Date(dateRange.end), "PP", { locale: es })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 días</SelectItem>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="1y">Último año</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Métricas de proyectos */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Proyectos</div>
              <div className="text-2xl font-bold">{dashboard.projectMetrics.totalProjects}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Activos</div>
              <div className="text-2xl font-bold text-blue-600">
                {dashboard.projectMetrics.activeProjects}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
              <div className="text-2xl font-bold">
                {dashboard.projectMetrics.averageDeliveryTime.toFixed(1)} días
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Entrega a Tiempo</div>
              <div className="text-2xl font-bold text-green-600">
                {dashboard.projectMetrics.onTimeDeliveryRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Tickets</div>
              <div className="text-2xl font-bold">{dashboard.ticketMetrics.totalTickets}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Abiertos</div>
              <div className="text-2xl font-bold text-orange-600">
                {dashboard.ticketMetrics.openTickets}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Tiempo Resolución</div>
              <div className="text-2xl font-bold">
                {dashboard.ticketMetrics.averageResolutionTime.toFixed(1)}h
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Cumplimiento SLA</div>
              <div className="text-2xl font-bold text-green-600">
                {dashboard.ticketMetrics.slaComplianceRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de tendencias */}
      {dashboard.trends && dashboard.trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard.trends.map((chart) => (
            <MetricsChart key={chart.id} chart={chart} />
          ))}
        </div>
      )}

      {/* Comparativas históricas */}
      {dashboard.comparisons && dashboard.comparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativas Históricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.comparisons.map((comparison, index) => (
                <HistoricalComparison key={index} comparison={comparison} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predicciones con IA */}
      <Predictions />
    </div>
  );
}

