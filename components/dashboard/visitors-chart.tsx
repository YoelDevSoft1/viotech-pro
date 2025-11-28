"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Datos de ejemplo para el gráfico
const generateChartData = (days: number) => {
  const data = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      value: Math.floor(Math.random() * 1000) + 500,
    });
  }
  return data;
};

export function VisitorsChart() {
  const [timeRange, setTimeRange] = useState<"3months" | "30days" | "7days">("3months");
  
  const chartData = generateChartData(
    timeRange === "3months" ? 90 : timeRange === "30days" ? 30 : 7
  );
  
  const maxValue = Math.max(...chartData.map(d => d.value));
  const minValue = Math.min(...chartData.map(d => d.value));

  return (
    <Card className="bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Total Visitors</CardTitle>
            <CardDescription className="text-xs mt-1">
              Total for the last {timeRange === "3months" ? "3 months" : timeRange === "30days" ? "30 days" : "7 days"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === "3months" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("3months")}
              className="h-7 text-xs px-3"
            >
              Last 3 months
            </Button>
            <Button
              variant={timeRange === "30days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("30days")}
              className="h-7 text-xs px-3"
            >
              Last 30 days
            </Button>
            <Button
              variant={timeRange === "7days" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("7days")}
              className="h-7 text-xs px-3"
            >
              Last 7 days
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 200"
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
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
                opacity="0.3"
              />
            ))}
            
            {/* Área del gráfico */}
            <path
              d={`M 0,200 ${chartData.map((d, i) => {
                const x = (i / (chartData.length - 1)) * 800;
                const y = 200 - ((d.value - minValue) / (maxValue - minValue)) * 150;
                return `L ${x},${y}`;
              }).join(' ')} L 800,200 Z`}
              fill="url(#gradient)"
            />
            
            {/* Línea del gráfico */}
            <path
              d={`M 0,${200 - ((chartData[0].value - minValue) / (maxValue - minValue)) * 150} ${chartData.slice(1).map((d, i) => {
                const x = ((i + 1) / (chartData.length - 1)) * 800;
                const y = 200 - ((d.value - minValue) / (maxValue - minValue)) * 150;
                return `L ${x},${y}`;
              }).join(' ')}`}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Etiquetas del eje X */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-between text-xs text-muted-foreground px-4">
            {chartData.filter((_, i) => i % Math.ceil(chartData.length / 7) === 0).map((d, i) => (
              <span key={i} className="font-medium">{d.date}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

