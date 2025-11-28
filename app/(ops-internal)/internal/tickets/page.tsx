"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Filter } from "lucide-react";

import OrgSelector, { type Org } from "@/components/OrgSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrg } from "@/lib/useOrg";
import { useTickets } from "@/lib/hooks/useTickets";
import { apiClient } from "@/lib/apiClient";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  usuario?: { nombre?: string; email?: string };
  createdAt: string;
};

export default function InternalTicketsPage() {
  const router = useRouter();
  const { orgId, setOrgId } = useOrg();
  const [filters, setFilters] = useState({ estado: "", prioridad: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { tickets, loading, error, refresh } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      ticketId,
      payload,
    }: {
      ticketId: string;
      payload: { estado?: string; prioridad?: string };
    }) => {
      await apiClient.put(
        `/tickets/${ticketId}`,
        { ...payload },
        { params: orgId ? { organizationId: orgId } : undefined },
      );
    },
    onSuccess: () => {
      refresh();
    },
    onSettled: () => setActionLoading(null),
  });

  const updateTicket = (ticketId: string, payload: { estado?: string; prioridad?: string }) => {
    setActionLoading(ticketId);
    updateMutation.mutate({ ticketId, payload });
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al panel interno
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Tickets globales
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-medium text-foreground">Todos los tickets</h1>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros rápidos
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Como agente/admin puedes ver y gestionar tickets de todos los usuarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label="Organización" />
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={filters.estado || ""} onValueChange={(value) => setFilters((f) => ({ ...f, estado: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="abierto">Abierto</SelectItem>
                <SelectItem value="en_progreso">En progreso</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridad</label>
            <Select value={filters.prioridad || ""} onValueChange={(value) => setFilters((f) => ({ ...f, prioridad: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title="Cargando tickets..." />
        ) : tickets.length === 0 ? (
          <EmptyState title="No hay tickets" message="No se encontraron tickets para esta organización o filtros." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="col-span-4">Ticket</TableHead>
                <TableHead className="col-span-2">Estado</TableHead>
                <TableHead className="col-span-2">Prioridad</TableHead>
                <TableHead className="col-span-2">Usuario</TableHead>
                <TableHead className="col-span-2">Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id} className="items-center">
                  <TableCell className="col-span-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{t.titulo}</p>
                      <p className="text-[11px] text-muted-foreground">ID: {t.id}</p>
                      {t.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{t.descripcion}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Select
                      value={t.estado}
                      onValueChange={(value) => updateTicket(t.id, { estado: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abierto">Abierto</SelectItem>
                        <SelectItem value="en_progreso">En progreso</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Select
                      value={t.prioridad}
                      onValueChange={(value) => updateTicket(t.id, { prioridad: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="col-span-2 text-sm text-muted-foreground">
                    {t.usuario?.email ? `${t.usuario.nombre || "Sin nombre"} (${t.usuario.email})` : "N/D"}
                  </TableCell>
                  <TableCell className="col-span-2 text-sm text-muted-foreground">
                    {new Date(t.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/internal/tickets/${t.id}`)}
                      disabled={actionLoading === t.id}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
