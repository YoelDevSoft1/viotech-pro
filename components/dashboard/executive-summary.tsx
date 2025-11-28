"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useServices } from "@/lib/hooks/useServices";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Calendar, TrendingUp, Package } from "lucide-react";

const formatDate = (value?: string | null) => {
  if (!value) return "Por definir";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Por definir";
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const computeProgressFromDates = (service: any) => {
  if (!service.fecha_compra || !service.fecha_expiracion) return undefined;
  const start = new Date(service.fecha_compra).getTime();
  const end = new Date(service.fecha_expiracion).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return service.estado === "expirado" ? 100 : undefined;
  }
  const total = end - start;
  const elapsed = Math.min(Math.max(Date.now() - start, 0), total);
  return Math.round((elapsed / total) * 100);
};

export function ExecutiveSummary() {
  const { services, loading: servicesLoading } = useServices();
  const { metrics, isLoading: metricsLoading } = useDashboard();

  const summary = useMemo(() => {
    const activeServices = services.filter((s) => s.estado === "activo");
    
    // Próxima renovación
    const sortedRenewals = [...services]
      .filter((s) => s.fecha_expiracion)
      .sort(
        (a, b) =>
          new Date(a.fecha_expiracion || "").getTime() -
          new Date(b.fecha_expiracion || "").getTime()
      );
    
    const nextRenewal = sortedRenewals[0];
    
    // Avance promedio
    const avgProgress = activeServices.length > 0
      ? Math.round(
          (activeServices.reduce(
            (acc, s) => acc + (s.progreso ?? computeProgressFromDates(s) ?? 0),
            0
          ) / activeServices.length) * 10
        ) / 10
      : 0;

    return {
      activeProjects: activeServices.length,
      nextRenewal: nextRenewal?.fecha_expiracion || null,
      nextServiceName: nextRenewal?.nombre || null,
      avgProgress: Number.isFinite(avgProgress) ? avgProgress : 0,
    };
  }, [services]);

  const isLoading = servicesLoading || metricsLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen ejecutivo</CardTitle>
          <CardDescription>Consultoría, entregables y soporte VIP centralizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null; // Eliminado para simplificar
}

