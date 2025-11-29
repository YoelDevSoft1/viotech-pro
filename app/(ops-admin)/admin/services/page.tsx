"use client";

import Link from "next/link";
import { Package, Calendar, Building2 } from "lucide-react";
import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { useServices } from "@/lib/hooks/useServices";
import { useOrg } from "@/lib/hooks/useOrg";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminServicesPage() {
  const { services, loading, error, refresh } = useServices();
  const { setOrgId } = useOrg();

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "expirado":
        return "destructive" as const;
      case "pendiente":
        return "secondary" as const;
      case "activo":
        return "default" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios y Licencias</h1>
          <p className="text-muted-foreground">
            Gestiona servicios activos y expirados por organización.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Services Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title="Sin servicios" message="No hay servicios para la organización seleccionada." />
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
                    <TableHead>Fecha de Compra</TableHead>
                    <TableHead>Fecha de Expiración</TableHead>
                    <TableHead>Organización</TableHead>
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
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{s.tipo || "Servicio"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(s.estado || "")} className="capitalize">
                          {s.estado || "N/D"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {s.fecha_compra ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(s.fecha_compra).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/D</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.fecha_expiracion ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(s.fecha_expiracion).toLocaleDateString("es-CO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">N/D</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {(s as any).organizationId ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            <span className="font-mono">{(s as any).organizationId.slice(0, 8)}</span>
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
    </div>
  );
}
