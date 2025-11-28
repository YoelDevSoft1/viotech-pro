"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const chartData = trendData || [];
  const maxValue = Math.max(
    ...chartData.map(d => d.total || 0),
    1
  );

  // Estado para el tooltip
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredData = hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < chartData.length 
    ? chartData[hoveredIndex] 
    : null;

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
          <div className="flex gap-2 sm:gap-1 flex-wrap sm:flex-nowrap">
            <Button
              variant={timeRange === "3months" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("3months")}
              className="h-7 text-xs whitespace-nowrap flex-1 sm:flex-initial min-w-fit"
            >
              Últimos 3 meses
            </Button>
            <Button
              variant={timeRange === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30days")}
              className="h-7 text-xs whitespace-nowrap flex-1 sm:flex-initial min-w-fit"
            >
              Últimos 30 días
            </Button>
            <Button
              variant={timeRange === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7days")}
              className="h-7 text-xs whitespace-nowrap flex-1 sm:flex-initial min-w-fit"
            >
              Últimos 7 días
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div 
          className="h-[300px] w-full relative overflow-x-auto"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 200"
            preserveAspectRatio="xMidYMid meet"
            className="min-w-[800px]"
          >
            <defs>
              {/* Gradiente para tickets resueltos (área inferior, más oscura) */}
              <linearGradient id="gradient-resueltos" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
              {/* Gradiente para tickets abiertos (área superior, más clara) */}
              <linearGradient id="gradient-abiertos" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                opacity="0.2"
              />
            ))}
            
            {/* Área apilada: Primero resueltos (base, más oscura) */}
            {chartData.length > 0 && maxValue > 0 && (
              <path
                d={`M 0,200 ${chartData.map((d, i) => {
                  const x = (i / Math.max(chartData.length - 1, 1)) * 800;
                  const resueltosY = 200 - ((d.resueltos || 0) / maxValue) * 150;
                  return `L ${x},${resueltosY}`;
                }).join(' ')} L 800,200 Z`}
                fill="url(#gradient-resueltos)"
              />
            )}
            
            {/* Área apilada: Luego abiertos (encima de resueltos, más clara) */}
            {chartData.length > 0 && maxValue > 0 && (
              <path
                d={`M 0,${200 - ((chartData[0]?.resueltos || 0) / maxValue) * 150} ${chartData.map((d, i) => {
                  const x = (i / Math.max(chartData.length - 1, 1)) * 800;
                  const totalY = 200 - ((d.total || 0) / maxValue) * 150;
                  return `L ${x},${totalY}`;
                }).join(' ')} ${chartData.slice().reverse().map((d, i) => {
                  const x = ((chartData.length - 1 - i) / Math.max(chartData.length - 1, 1)) * 800;
                  const resueltosY = 200 - ((d.resueltos || 0) / maxValue) * 150;
                  return `L ${x},${resueltosY}`;
                }).join(' ')} Z`}
                fill="url(#gradient-abiertos)"
              />
            )}
            
            {/* Línea superior (total) */}
            {chartData.length > 0 && maxValue > 0 && (
              <path
                d={`M 0,${200 - ((chartData[0]?.total || 0) / maxValue) * 150} ${chartData.slice(1).map((d, i) => {
                  const x = ((i + 1) / Math.max(chartData.length - 1, 1)) * 800;
                  const y = 200 - ((d.total || 0) / maxValue) * 150;
                  return `L ${x},${y}`;
                }).join(' ')}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Línea de separación entre resueltos y abiertos */}
            {chartData.length > 0 && maxValue > 0 && (
              <path
                d={`M 0,${200 - ((chartData[0]?.resueltos || 0) / maxValue) * 150} ${chartData.slice(1).map((d, i) => {
                  const x = ((i + 1) / Math.max(chartData.length - 1, 1)) * 800;
                  const y = 200 - ((d.resueltos || 0) / maxValue) * 150;
                  return `L ${x},${y}`;
                }).join(' ')}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            )}
            
            {/* Puntos interactivos para el tooltip */}
            {chartData.map((d, i) => {
              const x = (i / Math.max(chartData.length - 1, 1)) * 800;
              const totalY = maxValue > 0 ? 200 - ((d.total || 0) / maxValue) * 150 : 200;
              const isHovered = hoveredIndex === i;
              
              // Validar que los valores sean números válidos
              if (isNaN(x) || isNaN(totalY) || !isFinite(x) || !isFinite(totalY)) {
                return null;
              }
              
              return (
                <g key={i}>
                  {/* Área invisible para hover */}
                  <rect
                    x={x - 20}
                    y={0}
                    width={40}
                    height={200}
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Punto visible cuando está hovered */}
                  {isHovered && (
                    <circle
                      cx={x}
                      cy={totalY}
                      r={4}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          
          {/* Tooltip */}
          {hoveredData && hoveredIndex !== null && (
            <div 
              className="absolute bg-popover border rounded-lg shadow-lg p-3 z-10 pointer-events-none"
              style={{
                left: `${(hoveredIndex / Math.max(chartData.length - 1, 1)) * 100}%`,
                top: '20px',
                transform: 'translateX(-50%)',
              }}
            >
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{hoveredData.date}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="text-muted-foreground">Resueltos:</span>
                  <span className="font-medium">{hoveredData.resueltos}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/30" />
                  <span className="text-muted-foreground">Abiertos:</span>
                  <span className="font-medium">{hoveredData.abiertos}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Leyenda */}
          <div className="absolute top-4 right-2 sm:right-4 flex gap-2 sm:gap-4 text-xs bg-background/80 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/60 shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs">Resueltos</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary/30 shrink-0" />
              <span className="text-muted-foreground text-[10px] sm:text-xs">Abiertos</span>
            </div>
          </div>
          
          {/* Etiquetas del eje X */}
          {chartData.length > 0 && (
            <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-between text-[10px] sm:text-xs text-muted-foreground px-2 sm:px-4 min-w-[800px]">
              {chartData.filter((_, i) => {
                const step = Math.ceil(chartData.length / (isMobile ? 5 : 7));
                return i % step === 0 || i === chartData.length - 1;
              }).map((d, i) => (
                <span key={i} className="font-medium truncate max-w-[60px] sm:max-w-none">{d.date}</span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

