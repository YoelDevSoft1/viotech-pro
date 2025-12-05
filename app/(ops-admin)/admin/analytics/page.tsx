"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Users, Activity, BarChart3 } from "lucide-react";
import { analyticsService, type AnalyticsSummary } from "@/lib/services/analyticsService";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

/**
 * Página de Analytics para administradores
 * Sprint 4.3 - VioTech Pro
 */
export default function AnalyticsPage() {
  const t = useTranslationsSafe();
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);

  // Calcular fechas según el período
  const getDateRange = () => {
    const end = endOfDay(new Date());
    const start = startOfDay(
      period === "7d" ? subDays(end, 7) : period === "30d" ? subDays(end, 30) : subDays(end, 90)
    );
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const { start, end } = getDateRange();

  // Obtener resumen de analytics
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["analytics", "summary", period, organizationId, start, end],
    queryFn: async () => {
      return await analyticsService.getSummary({
        startDate: start,
        endDate: end,
        organizationId,
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            {error
              ? "Error al cargar los datos de analytics"
              : "No hay datos de analytics disponibles"}
          </p>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const eventsByDayData = summary.eventsByDay.map((day) => ({
    date: format(new Date(day.date), "dd/MM", { locale: es }),
    eventos: day.count,
  }));

  const topEventsData = summary.topEvents.slice(0, 10).map((event) => ({
    nombre: event.eventName.replace(/^[^_]+_/, ""), // Remover prefijo
    cantidad: event.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas y estadísticas de uso de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Período: {format(new Date(start), "dd/MM/yyyy")} - {format(new Date(end), "dd/MM/yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Usuarios activos en el período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Eventos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(summary.eventsByType).length}
            </div>
            <p className="text-xs text-muted-foreground">Diferentes tipos de eventos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summary.totalEvents / (period === "7d" ? 7 : period === "30d" ? 30 : 90))}
            </div>
            <p className="text-xs text-muted-foreground">Eventos por día</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Eventos por día */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Día</CardTitle>
            <CardDescription>Distribución de eventos en el período seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventsByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="eventos" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Top Eventos</CardTitle>
            <CardDescription>Eventos más frecuentes en el período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEventsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Eventos por tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos por Tipo</CardTitle>
          <CardDescription>Distribución de eventos por categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.eventsByType).map(([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <span className="text-sm font-medium">{type}</span>
                <Badge variant="secondary">{count.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


