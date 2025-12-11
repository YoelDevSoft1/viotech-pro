"use client";

import { 
  AlertCircle, 
  Activity, 
  CheckCircle2, 
  Layers,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { DashboardMetrics, normalizeSLAValue } from "@/lib/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { getSLAStatus } from "@/lib/config/metricRanges";

interface SectionCardsProps {
  metrics: DashboardMetrics | undefined;
}

export function SectionCards({ metrics }: SectionCardsProps) {
  // Calcular porcentaje de SLA cumplido
  // Detectar valores por defecto del backend (100 cuando no hay tickets)
  const ticketsAbiertos = metrics?.ticketsAbiertos ?? metrics?.openTickets ?? 0;
  const ticketsResueltos = metrics?.ticketsResueltos ?? metrics?.solvedTickets ?? 0;
  const rawSlaPercentage = metrics?.slaCumplido ?? metrics?.slaCompliance ?? null;
  
  // Normalizar: si es 100 pero no hay tickets, tratarlo como null
  const slaPercentage = normalizeSLAValue(rawSlaPercentage, ticketsAbiertos, ticketsResueltos);
  
  const slaFormatted = slaPercentage != null && typeof slaPercentage === 'number' 
    ? `${slaPercentage.toFixed(1)}%` 
    : "N/A";
  
  // Calcular avance promedio
  // Preservar null/undefined para indicar ausencia de datos
  const avancePromedio = metrics?.avancePromedio ?? null;
  const avanceFormatted = avancePromedio != null && typeof avancePromedio === 'number'
    ? `${avancePromedio.toFixed(1)}%`
    : "N/A";

  const cards = [
    {
      title: "Tickets Abiertos",
      value: metrics?.ticketsAbiertos ?? metrics?.openTickets ?? 0,
      formattedValue: (metrics?.ticketsAbiertos ?? metrics?.openTickets ?? 0).toLocaleString(),
      trend: (metrics?.ticketsAbiertos ?? 0) > 0 ? "up" : "neutral" as const,
      trendValue: (metrics?.ticketsAbiertos ?? 0) > 0 ? "Requieren atención" : "Sin pendientes",
      description: "Requieren atención inmediata",
      subDescription: "Tickets pendientes de revisión",
      icon: AlertCircle,
      trendColor: (metrics?.ticketsAbiertos ?? 0) > 0 ? "text-orange-500" : "text-green-500",
    },
    {
      title: "Tickets Resueltos",
      value: metrics?.ticketsResueltos ?? metrics?.solvedTickets ?? 0,
      formattedValue: (metrics?.ticketsResueltos ?? metrics?.solvedTickets ?? 0).toLocaleString(),
      trend: "up" as const,
      trendValue: "Este mes",
      description: "Tickets resueltos exitosamente",
      subDescription: "Satisfacción del cliente",
      icon: CheckCircle2,
      trendColor: "text-green-500",
    },
    {
      title: "SLA Cumplido",
      value: slaPercentage ?? null,
      formattedValue: slaFormatted,
      trend: (slaPercentage != null && typeof slaPercentage === 'number' && slaPercentage >= 95) ? "up" : "down" as const,
      // VALIDACIÓN C2.1: Usar configuración centralizada
      trendValue: (() => {
        const status = getSLAStatus(slaPercentage);
        return status.status === "sin_datos" ? "Sin datos" : status.label;
      })(),
      description: "Cumplimiento de tiempos de respuesta",
      subDescription: slaPercentage != null ? "Objetivo: ≥95%" : "No se ha realizado análisis de tiempos",
      icon: Activity,
      trendColor: (() => {
        const status = getSLAStatus(slaPercentage);
        return status.status === "sin_datos" ? "text-muted-foreground" : status.color;
      })(),
    },
    {
      title: "Servicios Activos",
      value: metrics?.serviciosActivos ?? metrics?.activeServices ?? 0,
      formattedValue: (metrics?.serviciosActivos ?? metrics?.activeServices ?? 0).toLocaleString(),
      trend: "up" as const,
      trendValue: avanceFormatted,
      description: "Avance promedio de proyectos",
      subDescription: metrics?.proximaRenovacion 
        ? `Próxima renovación: ${new Date(metrics.proximaRenovacion).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`
        : "Infraestructura operativa",
      icon: Layers,
      trendColor: "text-green-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">
                {card.title}
              </CardDescription>
              <Badge 
                variant="outline" 
                className={cn("text-xs h-5", card.trendColor)}
              >
                {card.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : card.trend === "down" ? (
                  <TrendingDown className="h-3 w-3 mr-1" />
                ) : null}
                {card.trendValue}
              </Badge>
            </div>
            <CardTitle className="text-3xl font-bold tabular-nums mt-2">
              {card.formattedValue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

