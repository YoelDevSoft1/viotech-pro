"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TicketTrendData {
  date: string;
  dateKey: string;
  abiertos: number;
  resueltos: number;
  total: number;
}

export function TicketsTrendChart() {
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "3months">("30days");
  const isMobile = useIsMobile();
  const { theme, resolvedTheme } = useTheme();
  
  // Determinar si estamos en modo oscuro
  const isDark = resolvedTheme === "dark" || (resolvedTheme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Colores según el tema
  const textColor = isDark ? "#ffffff" : "#1a1a1a"; // Blanco en oscuro, negro en claro

  // Colores morados/púrpura visibles en modo oscuro
  const colors = {
    resueltos: {
      fill: "rgb(139, 92, 246)", // purple-500
      stroke: "rgb(168, 85, 247)", // purple-400
      gradientStart: "rgba(139, 92, 246, 0.4)",
      gradientEnd: "rgba(139, 92, 246, 0.1)",
    },
    abiertos: {
      fill: "rgb(168, 85, 247)", // purple-400
      stroke: "rgb(192, 132, 252)", // purple-300
      gradientStart: "rgba(168, 85, 247, 0.3)",
      gradientEnd: "rgba(168, 85, 247, 0.05)",
    },
  };
  
  const { data: trendData, isLoading } = useQuery({
    queryKey: ["tickets-trend", timeRange],
    queryFn: async () => {
      try {
        // Intentar obtener datos de tendencia del backend
        const { data } = await apiClient.get("/tickets", {
          params: {
            limit: 100,
            sort: "createdAt",
            order: "desc"
          }
        });
        
        const tickets = data?.data?.tickets || data?.tickets || [];
        
        // Agrupar tickets por fecha según el rango de tiempo
        const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
        const grouped: Record<string, { abiertos: number; resueltos: number }> = {};
        
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split('T')[0];
          grouped[dateKey] = { abiertos: 0, resueltos: 0 };
        }
        
        tickets.forEach((ticket: any) => {
          const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
          if (grouped[ticketDate]) {
            if (ticket.estado === 'abierto' || ticket.estado === 'en_progreso') {
              grouped[ticketDate].abiertos++;
            } else if (ticket.estado === 'resuelto' || ticket.estado === 'cerrado') {
              grouped[ticketDate].resueltos++;
            }
          }
        });
        
        return Object.entries(grouped).map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
          dateKey: date,
          abiertos: counts.abiertos,
          resueltos: counts.resueltos,
          total: counts.abiertos + counts.resueltos,
        }));
      } catch (error) {
        // Si falla, devolver datos vacíos
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Preparar datos para Recharts
  const chartData = (trendData || []).map((d) => ({
    date: d.date,
    dateKey: d.dateKey,
    Resueltos: d.resueltos,
    Abiertos: d.abiertos,
    Total: d.total,
  }));

  if (isLoading) {
    return (
      <Card className="bg-card/50">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Custom tooltip para mejor diseño
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded-lg shadow-lg p-3 space-y-2">
          <p className="font-semibold text-sm">{payload[0]?.payload?.date}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-muted-foreground">{entry.name}:</span>
                </div>
                <span className="font-semibold">{entry.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 text-sm pt-1 border-t">
              <span className="text-muted-foreground font-medium">Total:</span>
              <span className="font-bold">
                {payload[0]?.payload?.Total || 0}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Función personalizada para renderizar ticks con color correcto
  const renderTick = (props: any) => {
    const { x, y, payload } = props;
    // Ajustar la posición Y para que esté más abajo y no se superponga con la gráfica
    const adjustedY = y + 15; // Mover 15px hacia abajo
    
    return (
      <text
        x={x}
        y={adjustedY}
        textAnchor="middle"
        fill={textColor}
        fontSize={12}
        className="recharts-cartesian-axis-tick-value"
        style={{ fill: textColor, color: textColor }}
      >
        {payload.value}
      </text>
    );
  };

  const renderYTick = (props: any) => {
    const { x, y, payload } = props;
    
    return (
      <text
        x={x}
        y={y}
        textAnchor="end"
        fill={textColor}
        fontSize={12}
        className="recharts-cartesian-axis-tick-value"
        style={{ fill: textColor, color: textColor }}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              Total para los últimos {timeRange === "3months" ? "3 meses" : timeRange === "30days" ? "30 días" : "7 días"}
            </CardDescription>
          </div>
          <Tabs
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as "7days" | "30days" | "3months")}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="7days" className="text-xs sm:text-sm">
                Últimos 7 días
              </TabsTrigger>
              <TabsTrigger value="30days" className="text-xs sm:text-sm">
                Últimos 30 días
              </TabsTrigger>
              <TabsTrigger value="3months" className="text-xs sm:text-sm">
                Últimos 3 meses
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 25 }}
            >
              <defs>
                <linearGradient id="colorResueltos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.resueltos.fill} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={colors.resueltos.fill} stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorAbiertos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.abiertos.fill} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors.abiertos.fill} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.2}
              />
              <XAxis
                dataKey="date"
                tick={renderTick}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                interval="preserveStartEnd"
                tickMargin={10}
              />
              <YAxis
                tick={renderYTick}
                tickLine={{ stroke: "hsl(var(--border))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="Resueltos"
                stackId="1"
                stroke={colors.resueltos.stroke}
                fill="url(#colorResueltos)"
                strokeWidth={2}
                name="Resueltos"
              />
              <Area
                type="monotone"
                dataKey="Abiertos"
                stackId="1"
                stroke={colors.abiertos.stroke}
                fill="url(#colorAbiertos)"
                strokeWidth={2}
                name="Abiertos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

