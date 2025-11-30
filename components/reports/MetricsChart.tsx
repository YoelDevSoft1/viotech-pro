"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData } from "@/lib/types/reports";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface MetricsChartProps {
  chart: ChartData;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

export function MetricsChart({ chart }: MetricsChartProps) {
  // Transformar datos para Recharts
  const chartData = chart.data.map((point) => {
    const dataPoint: any = {
      name: typeof point.x === "string" ? point.x : format(new Date(point.x), "dd/MM", { locale: es }),
      value: point.y,
    };

    // Si hay múltiples series, agregarlas
    if (chart.series) {
      chart.series.forEach((series, index) => {
        dataPoint[series.name] = series.data[index] || 0;
      });
    }

    return dataPoint;
  });

  const renderChart = () => {
    switch (chart.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.series && chart.series.length > 0 ? (
                chart.series.map((series, index) => (
                  <Line
                    key={series.name}
                    type="monotone"
                    dataKey={series.name}
                    stroke={series.color || COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.series && chart.series.length > 0 ? (
                chart.series.map((series, index) => (
                  <Bar
                    key={series.name}
                    dataKey={series.name}
                    fill={series.color || COLORS[index % COLORS.length]}
                  />
                ))
              ) : (
                <Bar dataKey="value" fill={COLORS[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.series && chart.series.length > 0 ? (
                chart.series.map((series, index) => (
                  <Area
                    key={series.name}
                    type="monotone"
                    dataKey={series.name}
                    stroke={series.color || COLORS[index % COLORS.length]}
                    fill={series.color || COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={chart.type === "donut" ? 80 : 100}
                innerRadius={chart.type === "donut" ? 40 : 0}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center text-muted-foreground">Tipo de gráfico no soportado</div>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{chart.title}</CardTitle>
        {chart.xAxisLabel && (
          <p className="text-xs text-muted-foreground">Eje X: {chart.xAxisLabel}</p>
        )}
        {chart.yAxisLabel && (
          <p className="text-xs text-muted-foreground">Eje Y: {chart.yAxisLabel}</p>
        )}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}

