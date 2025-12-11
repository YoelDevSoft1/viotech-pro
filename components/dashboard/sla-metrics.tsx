"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics } from "@/lib/hooks/useDashboard";
import { Target, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSLAStatus } from "@/lib/config/metricRanges";
import { normalizeSLAValue } from "@/lib/hooks/useDashboard";

interface SLAMetricsProps {
  metrics: DashboardMetrics | undefined;
}

export function SLAMetrics({ metrics }: SLAMetricsProps) {
  // VALIDACIÓN C2.1: Manejo robusto de null/undefined
  const ticketsAbiertos = metrics?.ticketsAbiertos ?? metrics?.openTickets ?? 0;
  const ticketsResueltos = metrics?.ticketsResueltos ?? metrics?.solvedTickets ?? 0;
  
  // Obtener valor raw de SLA
  const rawSlaCumplido = metrics?.slaCumplido ?? metrics?.slaCompliance ?? null;
  
  // Normalizar: detectar valores por defecto (100 cuando no hay tickets)
  const slaValue = normalizeSLAValue(rawSlaCumplido, ticketsAbiertos, ticketsResueltos);
  const totalTickets = ticketsAbiertos + ticketsResueltos;
  const tasaResolucion = totalTickets > 0 ? (ticketsResueltos / totalTickets) * 100 : 0;
  
  const avancePromedio = metrics?.avancePromedio ?? null;
  const avanceValue = avancePromedio != null && typeof avancePromedio === 'number'
    ? avancePromedio
    : (avancePromedio != null ? parseFloat(String(avancePromedio)) : null);

  // VALIDACIÓN C2.1: Usar configuración centralizada de rangos
  const slaStatus = getSLAStatus(slaValue);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Rendimiento</CardTitle>
        <CardDescription>
          Indicadores clave de desempeño y SLA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SLA Cumplido */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">SLA Cumplido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tabular-nums">
                {slaStatus.status === "sin_datos" ? "N/A" : `${slaValue.toFixed(1)}%`}
              </span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", slaStatus.color, slaStatus.bgColor)}
              >
                {slaStatus.label}
              </Badge>
            </div>
          </div>
          <Progress value={slaValue ?? 0} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {slaStatus.status === "sin_datos" 
              ? "No se ha realizado análisis de tiempos de respuesta" 
              : `Objetivo: ≥95% | Actual: ${slaValue?.toFixed(1) ?? 0}%`}
          </p>
        </div>

        {/* Tasa de Resolución */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tasa de Resolución</span>
            </div>
            <span className="text-2xl font-bold tabular-nums">{tasaResolucion.toFixed(1)}%</span>
          </div>
          <Progress value={tasaResolucion} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {ticketsResueltos} de {totalTickets} tickets resueltos
          </p>
        </div>

        {/* Avance Promedio de Proyectos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Avance Promedio</span>
            </div>
            <span className="text-2xl font-bold tabular-nums">
              {avanceValue != null ? `${avanceValue.toFixed(1)}%` : "N/A"}
            </span>
          </div>
          <Progress value={avanceValue ?? 0} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {avanceValue != null 
              ? "Progreso promedio de todos los proyectos activos"
              : "No hay datos de avance disponibles"}
          </p>
        </div>

        {/* Resumen de Tickets */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-muted-foreground">Tickets Abiertos</span>
            </div>
            <span className="font-semibold">{ticketsAbiertos}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Tickets Resueltos</span>
            </div>
            <span className="font-semibold">{ticketsResueltos}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

