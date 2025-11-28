"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardMetrics } from "@/lib/hooks/useDashboard";
import { Target, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLAMetricsProps {
  metrics: DashboardMetrics | undefined;
}

export function SLAMetrics({ metrics }: SLAMetricsProps) {
  const slaCumplido = metrics?.slaCumplido ?? metrics?.slaCompliance ?? 0;
  const slaValue = typeof slaCumplido === 'number' ? slaCumplido : parseFloat(String(slaCumplido)) || 0;
  
  const ticketsAbiertos = metrics?.ticketsAbiertos ?? metrics?.openTickets ?? 0;
  const ticketsResueltos = metrics?.ticketsResueltos ?? metrics?.solvedTickets ?? 0;
  const totalTickets = ticketsAbiertos + ticketsResueltos;
  const tasaResolucion = totalTickets > 0 ? (ticketsResueltos / totalTickets) * 100 : 0;
  
  const avancePromedio = metrics?.avancePromedio ?? 0;
  const avanceValue = typeof avancePromedio === 'number' ? avancePromedio : parseFloat(String(avancePromedio)) || 0;

  const getSLAStatus = (value: number) => {
    if (value >= 95) return { label: "Excelente", color: "text-green-500", bgColor: "bg-green-500/10" };
    if (value >= 85) return { label: "Bueno", color: "text-blue-500", bgColor: "bg-blue-500/10" };
    if (value >= 70) return { label: "Regular", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    return { label: "Mejorar", color: "text-red-500", bgColor: "bg-red-500/10" };
  };

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
              <span className="text-2xl font-bold tabular-nums">{slaValue.toFixed(1)}%</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", slaStatus.color, slaStatus.bgColor)}
              >
                {slaStatus.label}
              </Badge>
            </div>
          </div>
          <Progress value={slaValue} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Objetivo: ≥95% | Actual: {slaValue.toFixed(1)}%
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
            <span className="text-2xl font-bold tabular-nums">{avanceValue.toFixed(1)}%</span>
          </div>
          <Progress value={avanceValue} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Progreso promedio de todos los proyectos activos
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

