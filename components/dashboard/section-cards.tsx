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
import { DashboardMetrics } from "@/lib/hooks/useDashboard";
import { cn } from "@/lib/utils";

interface SectionCardsProps {
  metrics: DashboardMetrics | undefined;
}

export function SectionCards({ metrics }: SectionCardsProps) {
  // Calcular porcentaje de SLA cumplido
  const slaPercentage = metrics?.slaCumplido ?? metrics?.slaCompliance ?? 0;
  const slaFormatted = typeof slaPercentage === 'number' ? `${slaPercentage.toFixed(1)}%` : slaPercentage;
  
  // Calcular avance promedio
  const avancePromedio = metrics?.avancePromedio ?? 0;
  const avanceFormatted = typeof avancePromedio === 'number' ? `${avancePromedio.toFixed(1)}%` : avancePromedio;

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
      value: slaPercentage,
      formattedValue: slaFormatted,
      trend: (typeof slaPercentage === 'number' && slaPercentage >= 95) ? "up" : "down" as const,
      trendValue: typeof slaPercentage === 'number' && slaPercentage >= 95 ? "Excelente" : "Mejorar",
      description: "Cumplimiento de tiempos de respuesta",
      subDescription: "Objetivo: ≥95%",
      icon: Activity,
      trendColor: typeof slaPercentage === 'number' && slaPercentage >= 95 ? "text-green-500" : "text-orange-500",
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

