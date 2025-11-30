"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Filter } from "lucide-react";

import OrgSelector, { type Org } from "@/components/common/OrgSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrg } from "@/lib/hooks/useOrg";
import { useTickets } from "@/lib/hooks/useTickets";
import { apiClient } from "@/lib/apiClient";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/state";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

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
  const tTickets = useTranslationsSafe("tickets");
  const tCommon = useTranslationsSafe("common");

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <OrgSelector onChange={(org: Org | null) => setOrgId(org?.id || "")} label={tTickets("organization")} />
          <div className="space-y-2">
            <label className="text-sm font-medium">{tTickets("statusLabel")}</label>
            <Select value={filters.estado || ""} onValueChange={(value) => setFilters((f) => ({ ...f, estado: value }))}>
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
            <Select value={filters.prioridad || ""} onValueChange={(value) => setFilters((f) => ({ ...f, prioridad: value }))}>
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
                <TableHead className="col-span-4">{tTickets("title")}</TableHead>
                <TableHead className="col-span-2">{tTickets("statusLabel")}</TableHead>
                <TableHead className="col-span-2">{tTickets("priorityLabel")}</TableHead>
                <TableHead className="col-span-2">{tTickets("user")}</TableHead>
                <TableHead className="col-span-2">{tTickets("createdAt")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="items-center">
                  <TableCell className="col-span-4">
                    <div className="space-y-0.5">
                      <p className="font-medium text-foreground">{ticket.titulo}</p>
                      <p className="text-[11px] text-muted-foreground">ID: {ticket.id}</p>
                      {ticket.descripcion && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{ticket.descripcion}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Select
                      value={ticket.estado}
                      onValueChange={(value) => updateTicket(ticket.id, { estado: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abierto">{tTickets("status.open")}</SelectItem>
                        <SelectItem value="en_progreso">{tTickets("status.inProgress")}</SelectItem>
                        <SelectItem value="resuelto">{tTickets("status.resolved")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Select
                      value={ticket.prioridad}
                      onValueChange={(value) => updateTicket(ticket.id, { prioridad: value })}
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
                  <TableCell className="col-span-2 text-sm text-muted-foreground">
                    {ticket.usuario?.email ? `${ticket.usuario.nombre || "Sin nombre"} (${ticket.usuario.email})` : "N/D"}
                  </TableCell>
                  <TableCell className="col-span-2 text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </TableCell>
                  <TableCell className="col-span-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/internal/tickets/${ticket.id}`)}
                      disabled={actionLoading === ticket.id}
                    >
                      {tTickets("viewDetail")}
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
