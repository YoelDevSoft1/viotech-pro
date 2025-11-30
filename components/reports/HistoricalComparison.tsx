"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import type { HistoricalComparison as HistoricalComparisonType } from "@/lib/types/reports";
import { cn } from "@/lib/utils";

interface HistoricalComparisonProps {
  comparison: HistoricalComparisonType;
  label?: string;
}

export function HistoricalComparison({ comparison, label }: HistoricalComparisonProps) {
  const changePercent = comparison.change;
  const isIncrease = comparison.changeType === "increase";
  const isDecrease = comparison.changeType === "decrease";

  const getIcon = () => {
    if (isIncrease) return <TrendingUp className="h-4 w-4" />;
    if (isDecrease) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getColor = () => {
    if (isIncrease) return "text-green-600";
    if (isDecrease) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        {label && <div className="text-sm font-medium mb-2">{label}</div>}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Período Actual</div>
            <div className="text-sm font-medium">
              {format(new Date(comparison.current.period.start), "dd/MM/yyyy", { locale: es })} -{" "}
              {format(new Date(comparison.current.period.end), "dd/MM/yyyy", { locale: es })}
            </div>
            <div className="text-lg font-bold mt-1">{comparison.current.value.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Período Anterior</div>
            <div className="text-sm font-medium">
              {format(new Date(comparison.previous.period.start), "dd/MM/yyyy", { locale: es })} -{" "}
              {format(new Date(comparison.previous.period.end), "dd/MM/yyyy", { locale: es })}
            </div>
            <div className="text-lg font-bold mt-1">{comparison.previous.value.toLocaleString()}</div>
          </div>
        </div>
      </div>
      <div className={cn("flex items-center gap-2 ml-4", getColor())}>
        {getIcon()}
        <div className="text-right">
          <div className="text-lg font-bold">
            {isIncrease ? "+" : isDecrease ? "-" : ""}
            {Math.abs(changePercent).toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground capitalize">
            {comparison.changeType === "increase"
              ? "Aumento"
              : comparison.changeType === "decrease"
                ? "Disminución"
                : "Sin cambio"}
          </div>
        </div>
      </div>
    </div>
  );
}

