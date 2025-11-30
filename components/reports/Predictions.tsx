"use client";

import { Brain, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { usePredictions } from "@/lib/hooks/useReports";
import { cn } from "@/lib/utils";
import type { Prediction } from "@/lib/types/reports";

interface PredictionsProps {
  metric?: string;
}

const metricLabels: Record<string, string> = {
  onTimeDeliveryRate: "Tasa de Entrega a Tiempo",
  slaComplianceRate: "Cumplimiento SLA",
  averageUtilization: "Utilización de Recursos",
  nps: "NPS (Net Promoter Score)",
  averageResolutionTime: "Tiempo Promedio de Resolución",
};

const timeframeLabels: Record<string, string> = {
  "7d": "7 días",
  "30d": "30 días",
  "90d": "90 días",
  "1y": "1 año",
};

export function Predictions({ metric }: PredictionsProps) {
  const { data: predictions = [], isLoading } = usePredictions(metric);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predicciones con IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Predicciones con IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No hay predicciones disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Predicciones con IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction) => {
            const change = prediction.predictedValue - prediction.currentValue;
            const changePercent = (change / prediction.currentValue) * 100;
            const isPositive = change > 0;

            return (
              <div key={prediction.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {metricLabels[prediction.metric] || prediction.metric}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Predicción para {timeframeLabels[prediction.timeframe] || prediction.timeframe}
                    </div>
                  </div>
                  <Badge
                    variant={prediction.confidence >= 80 ? "default" : prediction.confidence >= 60 ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {prediction.confidence}% confianza
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Valor Actual</div>
                    <div className="text-lg font-bold">{prediction.currentValue.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Valor Predicho</div>
                    <div className={cn(
                      "text-lg font-bold",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {prediction.predictedValue.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cambio esperado</span>
                    <span className={cn(
                      "font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? "+" : ""}
                      {changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={Math.abs(changePercent)}
                    className="h-2"
                  />
                </div>

                {prediction.factors && prediction.factors.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground mb-2">Factores que influyen:</div>
                    <ul className="space-y-1">
                      {prediction.factors.map((factor, index) => (
                        <li key={index} className="text-xs flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {prediction.recommendations && prediction.recommendations.length > 0 && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-xs text-amber-600 mb-2">
                      <AlertCircle className="h-3 w-3" />
                      <span className="font-medium">Recomendaciones:</span>
                    </div>
                    <ul className="space-y-1">
                      {prediction.recommendations.map((rec, index) => (
                        <li key={index} className="text-xs flex items-start gap-2">
                          <span className="text-amber-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

