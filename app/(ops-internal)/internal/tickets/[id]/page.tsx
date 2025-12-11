"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Clock, CheckCircle2, XCircle, AlertCircle, Paperclip, Send } from "lucide-react";
import { useTicket } from "@/lib/hooks/useTicket";
import { TicketComments } from "@/components/tickets/TicketComments";
import { StatusBadge, PriorityBadge } from "@/components/tickets/TicketBadges";
import { ResourceSelector } from "@/components/resources/ResourceSelector";
import { useOrg } from "@/lib/hooks/useOrg";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function InternalTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;

  const { orgId } = useOrg();
  const { 
    ticket, 
    isLoading, 
    isError, 
    error, 
    refresh, 
    addComment, 
    isCommenting,
    updateTicket,
    isUpdating,
    assignTicket,
    isAssigning
  } = useTicket(ticketId);

  const tTickets = useTranslationsSafe("tickets");
  const { formatDate } = useI18n();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTicket({ estado: newStatus });
      toast.success(tTickets("success.statusUpdated") || "Estado actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tTickets("error.updateFailed") || "Error al actualizar");
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateTicket({ prioridad: newPriority });
      toast.success(tTickets("success.priorityUpdated") || "Prioridad actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tTickets("error.updateFailed") || "Error al actualizar");
    }
  };

  const handleAssignAgent = async (agentId: string | null) => {
    try {
      await assignTicket(agentId);
      toast.success(
        agentId 
          ? (tTickets("success.assigned") || "Ticket asignado")
          : (tTickets("success.unassigned") || "Asignación removida")
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : tTickets("error.assignFailed") || "Error al asignar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingState title={tTickets("loading")} />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorState
          title={tTickets("errorTitle") || "Error"}
          message={error || tTickets("errorMessage") || "No se pudo cargar el ticket"}
        >
          <Button onClick={() => refresh()} variant="outline" className="mt-2">
            {tTickets("retry") || "Reintentar"}
          </Button>
        </ErrorState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/internal/tickets" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {tTickets("goBackToTickets") || "Volver a tickets"}
          </Link>
        </Button>
      </div>

      {/* Información principal del ticket */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="font-mono text-xs">
                  #{ticket.id.slice(0, 8)}
                </Badge>
                <StatusBadge status={ticket.estado} />
                <PriorityBadge priority={ticket.prioridad} />
              </div>
              <CardTitle className="text-2xl">{ticket.titulo}</CardTitle>
              <CardDescription className="mt-2">
                {ticket.usuario?.nombre || ticket.usuario?.email ? (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {ticket.usuario.nombre || tTickets("noName")} 
                      {ticket.usuario.email && ` (${ticket.usuario.email})`}
                    </span>
                  </div>
                ) : (
                  tTickets("noUser") || "Usuario no disponible"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Descripción */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">{tTickets("description") || "Descripción"}</Label>
            <div className="p-4 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap">
              {ticket.descripcion || tTickets("noDescription") || "Sin descripción"}
            </div>
          </div>

          {/* Grid de información y acciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel izquierdo: Información */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{tTickets("statusLabel") || "Estado"}</Label>
                <Select
                  value={ticket.estado}
                  onValueChange={handleStatusChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abierto">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                        {tTickets("status.open") || "Abierto"}
                      </div>
                    </SelectItem>
                    <SelectItem value="en_progreso">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        {tTickets("status.inProgress") || "En Progreso"}
                      </div>
                    </SelectItem>
                    <SelectItem value="resuelto">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {tTickets("status.resolved") || "Resuelto"}
                      </div>
                    </SelectItem>
                    <SelectItem value="cerrado">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-500" />
                        {tTickets("status.closed") || "Cerrado"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">{tTickets("priorityLabel") || "Prioridad"}</Label>
                <Select
                  value={ticket.prioridad}
                  onValueChange={handlePriorityChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">{tTickets("priority.low") || "Baja"}</SelectItem>
                    <SelectItem value="media">{tTickets("priority.medium") || "Media"}</SelectItem>
                    <SelectItem value="alta">{tTickets("priority.high") || "Alta"}</SelectItem>
                    <SelectItem value="critica">{tTickets("priority.critical") || "Crítica"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Asignación de agente */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {tTickets("assignee") || "Asignar a"}
                </Label>
                <ResourceSelector
                  value={ticket.asignadoA || undefined}
                  onValueChange={handleAssignAgent}
                  organizationId={ticket.organizationId || orgId}
                  disabled={isAssigning}
                  showWorkload={true}
                />
                {ticket.asignadoA && (
                  <p className="text-xs text-muted-foreground">
                    {tTickets("currentlyAssigned") || "Actualmente asignado"}
                  </p>
                )}
              </div>
            </div>

            {/* Panel derecho: Metadata */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{tTickets("metadata") || "Información"}</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-muted-foreground">{tTickets("created") || "Creado"}</span>
                    <span>{formatDate(ticket.createdAt, "PPpp")}</span>
                  </div>
                  {ticket.updatedAt && (
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">{tTickets("updated") || "Actualizado"}</span>
                      <span>{formatDate(ticket.updatedAt, "PPpp")}</span>
                    </div>
                  )}
                  {ticket.slaObjetivo && (
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">{tTickets("slaTarget") || "SLA Objetivo"}</span>
                      <span>{formatDate(ticket.slaObjetivo, "PPpp")}</span>
                    </div>
                  )}
                  {ticket.categoria && (
                    <div className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">{tTickets("category") || "Categoría"}</span>
                      <Badge variant="outline" className="capitalize">{ticket.categoria}</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comentarios y Adjuntos */}
      <TicketComments
        ticketId={ticket.id}
        comments={ticket.comentarios || []}
        attachments={ticket.attachments || []}
        onAddComment={async (payload) => {
          await addComment(payload);
        }}
        onRefresh={() => refresh()}
        isSubmitting={isCommenting}
      />
    </div>
  );
}
