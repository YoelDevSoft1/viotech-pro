"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, XCircle, Users, TrendingDown, Phone, Mail } from "lucide-react";
import { healthScoreService, type ChurnAlert } from "@/lib/services/healthScoreService";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminGate from "@/components/admin/AdminGate";

/**
 * Página de Customer Success para administradores
 * Sprint 4.4 - VioTech Pro
 */
export default function CustomerSuccessPage() {
  const t = useTranslationsSafe();
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "critical">("all");
  const [limit, setLimit] = useState(50);

  // Obtener alertas de churn
  const { data: alerts, isLoading, error, refetch } = useQuery({
    queryKey: ["customer-success", "churn-alerts", riskFilter, limit],
    queryFn: async () => {
      const allAlerts = await healthScoreService.getChurnAlerts(limit);
      // Filtrar por nivel de riesgo si es necesario
      if (riskFilter === "all") return allAlerts;
      return allAlerts.filter((alert) => alert.risk_level === riskFilter);
    },
    staleTime: 60 * 1000, // 1 minuto
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });

  if (isLoading) {
    return (
      <AdminGate>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AdminGate>
    );
  }

  if (error) {
    return (
      <AdminGate>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-500">Error al cargar las alertas de churn</p>
            <Button onClick={() => refetch()} className="mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </AdminGate>
    );
  }

  const criticalAlerts = alerts?.filter((a) => a.risk_level === "critical") || [];
  const highAlerts = alerts?.filter((a) => a.risk_level === "high") || [];

  return (
    <AdminGate>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Success</h1>
            <p className="text-muted-foreground">
              Alertas de riesgo de churn y health scores de organizaciones
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={riskFilter} onValueChange={(value) => setRiskFilter(value as typeof riskFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alertas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Organizaciones en riesgo</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Requieren acción inmediata</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Riesgo</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Monitorear de cerca</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de alertas */}
        {!alerts || alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay alertas de churn en este momento
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Todas las organizaciones tienen un health score saludable
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={
                  alert.risk_level === "critical"
                    ? "border-red-500 border-2"
                    : "border-orange-500 border-2"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {alert.risk_level === "critical" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      )}
                      {alert.organization.nombre}
                    </CardTitle>
                    <Badge
                      variant={alert.risk_level === "critical" ? "destructive" : "secondary"}
                    >
                      {alert.risk_level === "critical" ? "Crítico" : "Alto"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Health Score: {alert.score.toFixed(1)} / 100
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Información de contacto */}
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{alert.organization.email}</span>
                      </div>
                      {alert.organization.telefono && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Teléfono:</span>
                          <span className="font-medium">{alert.organization.telefono}</span>
                        </div>
                      )}
                    </div>

                    {/* Factores de riesgo */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Factores de Evaluación</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Usuarios Activos:</span>
                          <span className="ml-2 font-medium">
                            {alert.factors.activeUsers.toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proyectos Activos:</span>
                          <span className="ml-2 font-medium">
                            {alert.factors.activeProjects.toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tasa Resolución:</span>
                          <span className="ml-2 font-medium">
                            {alert.factors.ticketResolutionRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fecha de cálculo */}
                    <div className="text-xs text-muted-foreground">
                      Calculado el:{" "}
                      {format(new Date(alert.calculated_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                      <Button variant="outline" size="sm">
                        Contactar
                      </Button>
                      <Button variant="outline" size="sm">
                        Crear Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminGate>
  );
}

