"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, XCircle, Phone, Mail } from "lucide-react";
import { healthScoreService, type ChurnAlert } from "@/lib/services/healthScoreService";
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
import { useState } from "react";

/**
 * Dashboard de alertas de churn
 * Sprint 4.4 - VioTech Pro
 */
export function ChurnAlertsDashboard() {
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Churn</CardTitle>
          <CardDescription>Error al cargar las alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  const criticalAlerts = alerts?.filter((a) => a.risk_level === "critical") || [];
  const highAlerts = alerts?.filter((a) => a.risk_level === "high") || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Churn
            </CardTitle>
            <CardDescription>
              Organizaciones con riesgo de churn detectado
            </CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        {/* Métricas rápidas */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Total Alertas</p>
          </div>
          <div className="text-center p-4 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20">
            <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
            <p className="text-sm text-muted-foreground">Críticas</p>
          </div>
          <div className="text-center p-4 border rounded-lg border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
            <p className="text-sm text-muted-foreground">Alto Riesgo</p>
          </div>
        </div>

        {/* Lista de alertas */}
        {!alerts || alerts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay alertas de churn en este momento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Todas las organizaciones tienen un health score saludable
            </p>
          </div>
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
                    <CardTitle className="flex items-center gap-2 text-lg">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navegar a la página de detalles de la organización
                          window.location.href = `/admin/organizations/${alert.organization.id}`;
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Abrir cliente de email
                          window.location.href = `mailto:${alert.organization.email}?subject=Contacto desde VioTech - Health Score`;
                        }}
                      >
                        Contactar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Navegar a crear ticket relacionado con esta organización
                          window.location.href = `/admin/tickets/new?organizationId=${alert.organization.id}&type=customer-success`;
                        }}
                      >
                        Crear Ticket
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

