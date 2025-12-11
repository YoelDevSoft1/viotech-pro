"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Filter, User, MessageSquare, Paperclip } from "lucide-react";

import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrg } from "@/lib/hooks/useOrg";
import { useTickets } from "@/lib/hooks/useTickets";
import { useResources } from "@/lib/hooks/useResources";
import { apiClient } from "@/lib/apiClient";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ResourceSelector } from "@/components/resources/ResourceSelector";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { toast } from "sonner";

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
  const [filters, setFilters] = useState({ estado: "", prioridad: "", asignadoA: "" });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const tTickets = useTranslationsSafe("tickets");
  const tCommon = useTranslationsSafe("common");
  const { formatDate } = useI18n();

  const { tickets, loading, error, refresh } = useTickets({
    estado: filters.estado || undefined,
    prioridad: filters.prioridad || undefined,
    asignadoA: filters.asignadoA || undefined,
  });

  // Obtener recursos (agentes) para el filtro y asignación
  const { data: resources = [] } = useResources({
    organizationId: orgId,
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

  const updateTicket = (ticketId: string, payload: { estado?: string; prioridad?: string; asignadoA?: string | null }) => {
    setActionLoading(ticketId);
    updateMutation.mutate({ ticketId, payload });
  };

  const handleQuickAssign = async (ticketId: string, agentId: string | null) => {
    setActionLoading(ticketId);
    try {
      await updateTicket(ticketId, { asignadoA: agentId });
      toast.success(
        agentId 
          ? (tTickets("success.assigned") || "Ticket asignado")
          : (tTickets("success.unassigned") || "Asignación removida")
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tTickets("error.assignFailed") || "Error al asignar");
    } finally {
      setActionLoading(null);
    }
  };

  // Mapear recursos para fácil acceso
  const resourcesMap = useMemo(() => {
    const map = new Map();
    resources.forEach((r) => map.set(r.id, r));
    return map;
  }, [resources]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tTickets("goBackToInternal")}
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {tTickets("globalTickets")}
          </p>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-medium text-foreground">{tTickets("allTickets")}</h1>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-4 h-4" />
              {tTickets("quickFilters")}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {tTickets("agentAdminDescription")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label={tTickets("organization")} />
          <div className="space-y-2">
            <label className="text-sm font-medium">{tTickets("statusLabel")}</label>
            <Select value={filters.estado || ""} onValueChange={(value) => setFilters((f) => ({ ...f, estado: value === "all" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder={tTickets("all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tTickets("all")}</SelectItem>
                <SelectItem value="abierto">{tTickets("status.open")}</SelectItem>
                <SelectItem value="en_progreso">{tTickets("status.inProgress")}</SelectItem>
                <SelectItem value="resuelto">{tTickets("status.resolved")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{tTickets("priorityLabel")}</label>
            <Select value={filters.prioridad || ""} onValueChange={(value) => setFilters((f) => ({ ...f, prioridad: value === "all" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder={tTickets("all")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tTickets("all")}</SelectItem>
                <SelectItem value="baja">{tTickets("priority.low")}</SelectItem>
                <SelectItem value="media">{tTickets("priority.medium")}</SelectItem>
                <SelectItem value="alta">{tTickets("priority.high")}</SelectItem>
                <SelectItem value="critica">{tTickets("priority.critical")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{tTickets("assignee") || "Asignado a"}</label>
            <Select value={filters.asignadoA || ""} onValueChange={(value) => setFilters((f) => ({ ...f, asignadoA: value === "all" ? "" : value }))}>
              <SelectTrigger>
                <SelectValue placeholder={tTickets("all") || "Todos"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tTickets("all") || "Todos"}</SelectItem>
                <SelectItem value="unassigned">{tTickets("unassigned") || "Sin asignar"}</SelectItem>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.userName || resource.userEmail || resource.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <ErrorState message={error} />}

        {loading ? (
          <LoadingState title={tTickets("loading")} />
        ) : tickets.length === 0 ? (
          <EmptyState title={tTickets("noTickets")} message={tTickets("noTicketsMessage")} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">{tTickets("title")}</TableHead>
                <TableHead className="w-[120px]">{tTickets("statusLabel")}</TableHead>
                <TableHead className="w-[120px]">{tTickets("priorityLabel")}</TableHead>
                <TableHead className="w-[150px]">{tTickets("assignee") || "Asignado a"}</TableHead>
                <TableHead className="w-[150px]">{tTickets("user")}</TableHead>
                <TableHead className="w-[120px]">{tTickets("createdAt")}</TableHead>
                <TableHead className="w-[100px]">{tTickets("actions") || "Acciones"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => {
                const assignedResource = ticket.asignadoA ? resourcesMap.get(ticket.asignadoA) : null;
                const commentCount = ticket.comentarios?.length || 0;
                const attachmentCount = ticket.attachments?.length || 0;
                
                return (
                  <TableRow key={ticket.id} className="items-center">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{ticket.titulo}</p>
                          {commentCount > 0 && (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {commentCount}
                            </Badge>
                          )}
                          {attachmentCount > 0 && (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {attachmentCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">#{ticket.id.slice(0, 8)}</p>
                        {ticket.descripcion && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{ticket.descripcion}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.estado}
                        onValueChange={(value) => updateTicket(ticket.id, { estado: value })}
                        disabled={actionLoading === ticket.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="abierto">{tTickets("status.open")}</SelectItem>
                          <SelectItem value="en_progreso">{tTickets("status.inProgress")}</SelectItem>
                          <SelectItem value="resuelto">{tTickets("status.resolved")}</SelectItem>
                          <SelectItem value="cerrado">{tTickets("status.closed") || "Cerrado"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.prioridad}
                        onValueChange={(value) => updateTicket(ticket.id, { prioridad: value })}
                        disabled={actionLoading === ticket.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baja">{tTickets("priority.low")}</SelectItem>
                          <SelectItem value="media">{tTickets("priority.medium")}</SelectItem>
                          <SelectItem value="alta">{tTickets("priority.high")}</SelectItem>
                          <SelectItem value="critica">{tTickets("priority.critical")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.asignadoA || "unassigned"}
                        onValueChange={(value) => handleQuickAssign(ticket.id, value === "unassigned" ? null : value)}
                        disabled={actionLoading === ticket.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-muted-foreground">{tTickets("unassigned") || "Sin asignar"}</span>
                          </SelectItem>
                          {resources.map((resource) => (
                            <SelectItem key={resource.id} value={resource.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {resource.userName || resource.userEmail || resource.id}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {assignedResource && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {assignedResource.userName || assignedResource.userEmail}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ticket.usuario?.email ? (
                        <div className="space-y-0.5">
                          <p className="font-medium text-foreground">{ticket.usuario.nombre || tTickets("noName")}</p>
                          <p className="text-xs">{ticket.usuario.email}</p>
                        </div>
                      ) : (
                        tTickets("notAvailable")
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(ticket.createdAt, "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/internal/tickets/${ticket.id}`)}
                        disabled={actionLoading === ticket.id}
                      >
                        {tTickets("viewDetail") || "Ver"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </main>
  );
}
