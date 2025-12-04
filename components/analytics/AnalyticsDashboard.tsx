"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Activity,
  Clock,
  Bell,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCcw,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Target,
  AlertTriangle,
  Zap,
  MousePointer,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAnalyticsDashboard, useRealtimeMetrics } from "@/lib/hooks/useAnalytics";
import type { AnalyticsFilters, AnalyticsDashboard as DashboardType } from "@/lib/types/analytics";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

// ============================================
// COLORES
// ============================================

const CHART_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
];

// ============================================
// COMPONENTE KPI CARD
// ============================================

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: typeof Users;
  loading?: boolean;
}

function KPICard({ title, value, change, changeLabel = "vs. período anterior", icon: Icon, loading }: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = change === undefined ? Minus : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const trendColor = change === undefined ? "text-muted-foreground" : change > 0 ? "text-green-500" : change < 0 ? "text-red-500" : "text-muted-foreground";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs mt-1", trendColor)}>
                <TrendIcon className="h-3 w-3" />
                <span>{change > 0 ? "+" : ""}{change}%</span>
                <span className="text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE ENGAGEMENT CHART
// ============================================

interface EngagementChartProps {
  data?: Array<{ date: string; users: number; sessions: number }>;
  loading?: boolean;
}

function EngagementChart({ data, loading }: EngagementChartProps) {
  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  // Mock data si no hay datos
  const chartData = data || [
    { date: "Lun", users: 120, sessions: 180 },
    { date: "Mar", users: 150, sessions: 220 },
    { date: "Mié", users: 180, sessions: 260 },
    { date: "Jue", users: 140, sessions: 200 },
    { date: "Vie", users: 200, sessions: 300 },
    { date: "Sáb", users: 80, sessions: 100 },
    { date: "Dom", users: 60, sessions: 80 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" className="text-xs" />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            borderColor: "hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="users"
          name="Usuarios"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorUsers)"
        />
        <Area
          type="monotone"
          dataKey="sessions"
          name="Sesiones"
          stroke="#8b5cf6"
          fillOpacity={1}
          fill="url(#colorSessions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ============================================
// COMPONENTE FUNNEL CHART
// ============================================

interface FunnelChartProps {
  data?: Array<{ step: string; value: number; percentage: number }>;
  loading?: boolean;
}

function FunnelChart({ data, loading }: FunnelChartProps) {
  if (loading) {
    return <Skeleton className="h-[250px] w-full" />;
  }

  // Mock data para onboarding funnel
  const chartData = data || [
    { step: "Signup", value: 1000, percentage: 100 },
    { step: "Verificación", value: 850, percentage: 85 },
    { step: "Primer ticket", value: 620, percentage: 62 },
    { step: "Onboarding completo", value: 480, percentage: 48 },
  ];

  return (
    <div className="space-y-3">
      {chartData.map((item, index) => (
        <div key={item.step} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{item.step}</span>
            <span className="font-medium">{item.percentage}%</span>
          </div>
          <div className="h-8 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE FEATURES CHART
// ============================================

interface FeaturesChartProps {
  data?: Array<{ feature: string; usage: number }>;
  loading?: boolean;
}

function FeaturesChart({ data, loading }: FeaturesChartProps) {
  if (loading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  // Mock data
  const chartData = data || [
    { feature: "Tickets", usage: 89 },
    { feature: "Proyectos", usage: 67 },
    { feature: "Reportes", usage: 45 },
    { feature: "Notificaciones", usage: 78 },
    { feature: "Integraciones", usage: 23 },
  ];

  return (
    <div className="space-y-3">
      {chartData.map((item, index) => (
        <div key={item.feature} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              {item.feature}
            </span>
            <span className="font-medium">{item.usage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${item.usage}%`,
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE ERRORS LIST
// ============================================

interface ErrorsListProps {
  data?: Array<{ error: string; count: number }>;
  loading?: boolean;
}

function ErrorsList({ data, loading }: ErrorsListProps) {
  if (loading) {
    return <Skeleton className="h-[150px] w-full" />;
  }

  // Mock data
  const errors = data || [
    { error: "form_abandoned", count: 23 },
    { error: "login_failed", count: 12 },
    { error: "api_timeout", count: 8 },
    { error: "validation_error", count: 5 },
  ];

  return (
    <div className="space-y-2">
      {errors.map((item) => (
        <div
          key={item.error}
          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
        >
          <span className="text-sm font-mono">{item.error}</span>
          <Badge variant="secondary">{item.count}</Badge>
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE REALTIME
// ============================================

function RealtimeMetricsCard() {
  const { data: metrics, isLoading } = useRealtimeMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-green-500 animate-pulse" />
            Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-green-500 animate-pulse" />
          Tiempo Real
          <Badge variant="outline" className="text-xs ml-auto">
            Actualizado hace 30s
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold text-green-500">
              {metrics?.activeUsers || 42}
            </p>
            <p className="text-xs text-muted-foreground">Usuarios activos ahora</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <p className="text-3xl font-bold">
              {metrics?.eventsPerMinute || 128}
            </p>
            <p className="text-xs text-muted-foreground">Eventos/min</p>
          </div>
        </div>

        {metrics?.topPages && metrics.topPages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Páginas más vistas:</p>
            <div className="space-y-1">
              {(metrics.topPages || [
                { page: "/dashboard", views: 24 },
                { page: "/tickets", views: 18 },
                { page: "/projects", views: 12 },
              ]).slice(0, 3).map((page) => (
                <div key={page.page} className="flex items-center justify-between text-xs">
                  <span className="font-mono truncate">{page.page}</span>
                  <Badge variant="secondary" className="text-xs">{page.views}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    period: "7d",
    compareWith: "previous_period",
  });

  const { data: dashboard, isLoading, refetch } = useAnalyticsDashboard(filters);

  const handlePeriodChange = (period: string) => {
    setFilters((prev) => ({
      ...prev,
      period: period as AnalyticsFilters["period"],
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Métricas de uso y rendimiento de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.compareWith || "none"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                compareWith: value === "none" ? undefined : value as "previous_period",
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Comparar con" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin comparar</SelectItem>
              <SelectItem value="previous_period">Período anterior</SelectItem>
              <SelectItem value="previous_year">Año anterior</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Usuarios Activos (DAU)"
          value={dashboard?.engagement.dau || "1,234"}
          change={dashboard?.trends.dau || 12}
          icon={Users}
          loading={isLoading}
        />
        <KPICard
          title="Sesiones"
          value={dashboard?.engagement.totalSessions || "5,678"}
          change={dashboard?.trends.sessions || 8}
          icon={Activity}
          loading={isLoading}
        />
        <KPICard
          title="Duración Promedio"
          value={`${Math.floor((dashboard?.engagement.avgSessionDuration || 512) / 60)}m ${(dashboard?.engagement.avgSessionDuration || 512) % 60}s`}
          change={dashboard?.trends.avgSessionDuration || -2}
          icon={Clock}
          loading={isLoading}
        />
        <KPICard
          title="Opt-in Push"
          value="67%"
          change={5}
          icon={Bell}
          loading={isLoading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChartIcon className="h-5 w-5" />
              Usuarios activos
            </CardTitle>
            <CardDescription>
              Usuarios y sesiones en el período seleccionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EngagementChart loading={isLoading} />
          </CardContent>
        </Card>

        {/* Top Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5" />
              Top Features
            </CardTitle>
            <CardDescription>
              Adopción por funcionalidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeaturesChart loading={isLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Funnel de Onboarding
            </CardTitle>
            <CardDescription>
              Conversión por etapa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart loading={isLoading} />
          </CardContent>
        </Card>

        {/* Errores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5" />
              Errores Recientes
            </CardTitle>
            <CardDescription>
              Tipos de error más frecuentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorsList loading={isLoading} />
          </CardContent>
        </Card>

        {/* Realtime */}
        <RealtimeMetricsCard />
      </div>

      {/* Tabs for detailed views */}
      <Card>
        <CardHeader>
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="features">
                <Zap className="h-4 w-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger value="conversions">
                <Target className="h-4 w-4 mr-2" />
                Conversiones
              </TabsTrigger>
              <TabsTrigger value="errors">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Errores
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsContent value="users" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{dashboard?.engagement.mau || "12,456"}</p>
                  <p className="text-sm text-muted-foreground">MAU</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.engagement.stickiness || 0.23) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Stickiness (DAU/MAU)</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{dashboard?.engagement.pagesPerSession || 4.2}</p>
                  <p className="text-sm text-muted-foreground">Páginas/Sesión</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="features" className="mt-0">
              <p className="text-sm text-muted-foreground text-center py-8">
                Datos detallados de uso de features próximamente
              </p>
            </TabsContent>
            <TabsContent value="conversions" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.conversion.trialConversionRate || 0.24) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Conversión Trial</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.conversion.upgradeRate || 0.08) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Upgrade Rate</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.conversion.monthlyChurnRate || 0.035) * 100).toFixed(1)}%</p>
                  <p className="text-sm text-muted-foreground">Churn Mensual</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="errors" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.errors.errorRate || 0.012) * 100).toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">Tasa de Error</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{((dashboard?.errors.formAbandonmentRate || 0.18) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Abandono de Forms</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
