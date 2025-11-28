"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Filter } from "lucide-react";
import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { useTickets } from "@/lib/hooks/useTickets";
import { useOrg } from "@/lib/useOrg";
import { cn } from "@/lib/utils";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  organizationId?: string;
  projectId?: string;
  usuario?: { nombre?: string; email?: string };
  createdAt: string;
};

const estadoOptions = [
  { value: "", label: "Todos" },
  { value: "abierto", label: "Abierto" },
  { value: "en_progreso", label: "En progreso" },
  { value: "resuelto", label: "Resuelto" },
];

const prioridadOptions = [
  { value: "", label: "Todas" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "critica", label: "Crítica" },
];

export default function AdminTicketsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({ estado: "", prioridad: "", projectId: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { setOrgId } = useOrg();
  const { tickets, loading, error, refresh } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    projectId: filters.projectId || undefined,
  });

  const updateTicket = async (ticketId: string, payload: { estado?: string; prioridad?: string }) => {
    setActionLoading(ticketId);
    setActionError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace("/login?from=/admin/tickets");
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace("/login?from=/admin/tickets&reason=expired");
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "No se pudo actualizar el ticket");
      }
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al actualizar ticket");
    } finally {
      setActionLoading(null);
    }
  };

  const onFilterChange = (field: "estado" | "prioridad" | "projectId") => (value: string) =>
    setFilters((f) => ({ ...f, [field]: value === "all" ? "" : value }));
  
  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "resuelto":
        return "default";
      case "en_progreso":
        return "secondary";
      case "abierto":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPrioridadBadgeVariant = (prioridad: string) => {
    switch (prioridad.toLowerCase()) {
      case "critica":
        return "destructive";
      case "alta":
        return "destructive";
      case "media":
        return "secondary";
      case "baja":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets Globales</h1>
          <p className="text-muted-foreground">
            Administra y gestiona tickets de todas las organizaciones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filters.estado || undefined} onValueChange={onFilterChange("estado")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  {estadoOptions
                    .filter((o) => o.value !== "")
                    .map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <Select value={filters.prioridad || undefined} onValueChange={onFilterChange("prioridad")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las prioridades" />
                </SelectTrigger>
                <SelectContent>
                  {prioridadOptions
                    .filter((o) => o.value !== "")
                    .map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proyecto</label>
              <Select value={filters.projectId || undefined} onValueChange={onFilterChange("projectId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {(error || actionError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{actionError || error}</AlertDescription>
        </Alert>
      )}

      {/* Tickets Table */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState title="No hay tickets" message="No hay tickets disponibles para esta selección." />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Tickets ({tickets.length})</CardTitle>
            <CardDescription>Lista de todos los tickets del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Ticket</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Organización</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{t.titulo}</p>
                          {t.descripcion && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{t.descripcion}</p>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">#{t.id.slice(0, 8)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.estado}
                          onValueChange={(value) => updateTicket(t.id, { estado: value })}
                          disabled={actionLoading === t.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {estadoOptions
                              .filter((o) => o.value !== "")
                              .map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={t.prioridad}
                          onValueChange={(value) => updateTicket(t.id, { prioridad: value })}
                          disabled={actionLoading === t.id}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {prioridadOptions
                              .filter((o) => o.value !== "")
                              .map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {t.usuario?.email ? (
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{t.usuario.nombre || "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground">{t.usuario.email}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground font-mono">
                          {t.organizationId ? t.organizationId.slice(0, 8) : "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/tickets/${t.id}`)}
                          disabled={actionLoading === t.id}
                        >
                          Ver
                        </Button>
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
