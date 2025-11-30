"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KPI } from "@/lib/types/reports";
import { cn } from "@/lib/utils";

interface KPICardProps {
  kpi: KPI;
}

export function KPICard({ kpi }: KPICardProps) {
  const formatValue = (value: number, unit?: string) => {
    if (unit === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (unit === "h") {
      return `${value.toFixed(1)}h`;
    }
    if (unit === "días") {
      return `${value.toFixed(1)} días`;
    }
    return value.toLocaleString();
  };

  const getTrendIcon = () => {
    switch (kpi.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (kpi.trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const isTargetMet = kpi.target ? kpi.value >= kpi.target : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
        <Badge variant="outline" className="text-xs capitalize">
          {kpi.category}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(kpi.value, kpi.unit)}</div>
        {kpi.target && (
          <div className="text-xs text-muted-foreground mt-1">
            Objetivo: {formatValue(kpi.target, kpi.unit)}
          </div>
        )}
        {kpi.trend && kpi.trendValue !== undefined && (
          <div className={cn("flex items-center gap-1 mt-2 text-xs", getTrendColor())}>
            {getTrendIcon()}
            <span>
              {kpi.trend === "up" ? "+" : kpi.trend === "down" ? "-" : ""}
              {Math.abs(kpi.trendValue).toFixed(1)}
              {typeof kpi.trendValue === "number" && kpi.trendValue < 100 && kpi.trendValue > -100
                ? "%"
                : ""}
            </span>
          </div>
        )}
        {isTargetMet !== null && (
          <div className="mt-2">
            <Badge variant={isTargetMet ? "default" : "secondary"} className="text-xs">
              {isTargetMet ? "Objetivo alcanzado" : "Por debajo del objetivo"}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

