"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  ExecutiveDashboard,
  ReportData,
  AutomatedReport,
  Prediction,
  ReportFilters,
  KPI,
  ChartData,
} from "@/lib/types/reports";

/**
 * Hook para obtener dashboard ejecutivo
 */
export function useExecutiveDashboard(filters?: ReportFilters) {
  return useQuery<ExecutiveDashboard>({
    queryKey: ["reports", "executive", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.organizationId) params.append("organizationId", filters.organizationId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.period) params.append("period", filters.period);

      const { data } = await apiClient.get(`/reports/executive?${params.toString()}`);
      const raw = data?.data || data;

      return {
        period: {
          start: raw.period?.start || raw.start_date,
          end: raw.period?.end || raw.end_date,
        },
        projectMetrics: raw.projectMetrics || raw.project_metrics || {},
        ticketMetrics: raw.ticketMetrics || raw.ticket_metrics || {},
        resourceMetrics: raw.resourceMetrics || raw.resource_metrics || {},
        satisfactionMetrics: raw.satisfactionMetrics || raw.satisfaction_metrics || {},
        financialMetrics: raw.financialMetrics || raw.financial_metrics,
        kpis: (raw.kpis || []).map((kpi: any) => ({
          id: kpi.id,
          name: kpi.name,
          value: kpi.value,
          unit: kpi.unit,
          target: kpi.target,
          trend: kpi.trend,
          trendValue: kpi.trendValue || kpi.trend_value,
          period: kpi.period,
          category: kpi.category,
        })) as KPI[],
        trends: (raw.trends || []).map((chart: any) => ({
          id: chart.id,
          type: chart.type,
          title: chart.title,
          data: chart.data || [],
          xAxisLabel: chart.xAxisLabel || chart.x_axis_label,
          yAxisLabel: chart.yAxisLabel || chart.y_axis_label,
          series: chart.series || [],
        })) as ChartData[],
        comparisons: (raw.comparisons || []).map((comp: any) => ({
          current: {
            period: {
              start: comp.current?.period?.start || comp.current?.start_date,
              end: comp.current?.period?.end || comp.current?.end_date,
            },
            value: comp.current?.value || 0,
          },
          previous: {
            period: {
              start: comp.previous?.period?.start || comp.previous?.start_date,
              end: comp.previous?.period?.end || comp.previous?.end_date,
            },
            value: comp.previous?.value || 0,
          },
          change: comp.change || 0,
          changeType: comp.changeType || comp.change_type || "stable",
        })),
      } as ExecutiveDashboard;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener reportes generados
 */
export function useReports(filters?: ReportFilters) {
  return useQuery<ReportData[]>({
    queryKey: ["reports", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.organizationId) params.append("organizationId", filters.organizationId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.period) params.append("period", filters.period);

      const { data } = await apiClient.get(`/reports?${params.toString()}`);
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((report: any) => ({
        id: report.id,
        title: report.title,
        type: report.type,
        period: {
          start: report.period?.start || report.start_date,
          end: report.period?.end || report.end_date,
        },
        generatedAt: report.generatedAt || report.generated_at,
        generatedBy: report.generatedBy || report.generated_by,
        kpis: report.kpis || [],
        charts: report.charts || [],
        summary: report.summary || "",
        organizationId: report.organizationId || report.organization_id,
      })) as ReportData[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para obtener un reporte específico
 */
export function useReport(reportId: string) {
  return useQuery<ReportData>({
    queryKey: ["reports", reportId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/reports/${reportId}`);
      const raw = data?.data || data;

      return {
        id: raw.id,
        title: raw.title,
        type: raw.type,
        period: {
          start: raw.period?.start || raw.start_date,
          end: raw.period?.end || raw.end_date,
        },
        generatedAt: raw.generatedAt || raw.generated_at,
        generatedBy: raw.generatedBy || raw.generated_by,
        kpis: raw.kpis || [],
        charts: raw.charts || [],
        summary: raw.summary || "",
        organizationId: raw.organizationId || raw.organization_id,
      } as ReportData;
    },
    enabled: !!reportId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para generar un reporte
 */
export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      type,
      period,
      filters,
    }: {
      type: ReportData["type"];
      period: { start: string; end: string };
      filters?: ReportFilters;
    }) => {
      const { data } = await apiClient.post("/reports/generate", {
        type,
        period,
        filters,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

/**
 * Hook para obtener reportes automáticos
 */
export function useAutomatedReports(organizationId?: string) {
  return useQuery<AutomatedReport[]>({
    queryKey: ["reports", "automated", organizationId],
    queryFn: async () => {
      const params = organizationId ? { organizationId } : {};
      const { data } = await apiClient.get("/reports/automated", { params });
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((report: any) => ({
        id: report.id,
        name: report.name,
        type: report.type,
        recipients: report.recipients || [],
        format: report.format || "pdf",
        schedule: {
          time: report.schedule?.time || "09:00",
          timezone: report.schedule?.timezone || "America/Bogota",
          dayOfWeek: report.schedule?.dayOfWeek || report.schedule?.day_of_week,
          dayOfMonth: report.schedule?.dayOfMonth || report.schedule?.day_of_month,
        },
        enabled: report.enabled !== false,
        lastGenerated: report.lastGenerated || report.last_generated,
        nextGeneration: report.nextGeneration || report.next_generation,
        organizationId: report.organizationId || report.organization_id,
      })) as AutomatedReport[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para crear/actualizar reporte automático
 */
export function useSaveAutomatedReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      report,
    }: {
      reportId?: string;
      report: Omit<AutomatedReport, "id" | "lastGenerated" | "nextGeneration">;
    }) => {
      if (reportId) {
        const { data } = await apiClient.put(`/reports/automated/${reportId}`, report);
        return data;
      } else {
        const { data } = await apiClient.post("/reports/automated", report);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", "automated"] });
    },
  });
}

/**
 * Hook para obtener predicciones
 */
export function usePredictions(metric?: string) {
  return useQuery<Prediction[]>({
    queryKey: ["reports", "predictions", metric],
    queryFn: async () => {
      const params = metric ? { metric } : {};
      const { data } = await apiClient.get("/reports/predictions", { params });
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((pred: any) => ({
        id: pred.id,
        metric: pred.metric,
        currentValue: pred.currentValue || pred.current_value,
        predictedValue: pred.predictedValue || pred.predicted_value,
        confidence: pred.confidence || 0,
        timeframe: pred.timeframe,
        factors: pred.factors || [],
        recommendations: pred.recommendations || [],
      })) as Prediction[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutos (las predicciones no cambian tan rápido)
  });
}

/**
 * Hook para exportar reporte a PDF/Excel
 */
export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      reportId,
      format,
    }: {
      reportId: string;
      format: "pdf" | "excel";
    }) => {
      const { data } = await apiClient.get(`/reports/${reportId}/export`, {
        params: { format },
        responseType: "blob",
      });
      return data;
    },
  });
}

