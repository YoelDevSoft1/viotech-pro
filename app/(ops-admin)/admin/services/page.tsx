"use client";

import { Package, RefreshCw, Calendar, DollarSign, TrendingUp } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { useServices } from "@/lib/hooks/useServices";
import { useOrg } from "@/lib/useOrg";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function AdminServicesPage() {
  const { services, loading, error, refresh } = useServices();
  const { setOrgId, orgId } = useOrg();

  // Calcular estadísticas
  const stats = {
    total: services.length,
    activos: services.filter((s) => s.estado === "activo").length,
    expirados: services.filter((s) => s.estado === "expirado").length,
    pendientes: services.filter((s) => s.estado === "pendiente").length,
    totalPrecio: services.reduce((sum, s) => sum + (s.precio || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/D";
    return new Date(date).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      activo: "default",
      pendiente: "secondary",
      expirado: "destructive",
    };
    return (
      <Badge variant={variants[estado] || "outline"}>
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Servicios</h1>
            <p className="text-muted-foreground">
              Filtra por organización para ver servicios activos y expirados.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
        <div className="sm:w-64">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} />
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && services.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Activos</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{stats.activos}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Pendientes</CardDescription>
              <CardTitle className="text-3xl font-bold text-yellow-600">{stats.pendientes}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Expirados</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600">{stats.expirados}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Valor Total</CardDescription>
              <CardTitle className="text-2xl font-bold">{formatCurrency(stats.totalPrecio)}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Table */}
      {!loading && !error && (
        <>
          {services.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  title="Sin servicios"
                  message={orgId ? "No hay servicios para la organización seleccionada." : "Selecciona una organización para ver sus servicios."}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Servicios ({services.length})
                </CardTitle>
                <CardDescription>Lista de todos los servicios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Servicio</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Progreso</TableHead>
                        <TableHead>Compra</TableHead>
                        <TableHead>Expiración</TableHead>
                        <TableHead>Precio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{s.nombre}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {s.tipo || "Servicio"}
                          </TableCell>
                          <TableCell>{getEstadoBadge(s.estado)}</TableCell>
                          <TableCell>
                            {s.progreso !== null && s.progreso !== undefined ? (
                              <div className="flex items-center gap-2 w-32">
                                <Progress value={s.progreso} className="flex-1" />
                                <span className="text-xs text-muted-foreground min-w-[2.5rem] text-right">
                                  {s.progreso}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(s.fecha_compra)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(s.fecha_expiracion)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {s.precio ? (
                              <div className="flex items-center gap-1.5 text-sm font-medium">
                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatCurrency(s.precio)}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
