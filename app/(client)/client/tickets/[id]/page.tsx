"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, BadgeCheck, Clock3, Flame, Tags } from "lucide-react";

import { getAccessToken } from "@/lib/auth";
import { useTicket } from "@/lib/hooks/useTicket";
import { PageShell, PageHeader } from "@/components/ui/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/ui/state";
import { TicketComments } from "@/components/tickets/TicketComments";

export default function ClientTicketDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { ticket, isLoading, isError, error, refresh, addComment, isCommenting } = useTicket(params.id);

  // Guard de autenticación rápido (token en storage)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/client/tickets/${params.id}`);
    }
  }, [router, params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingState title="Cargando ticket..." />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorState
          title="No pudimos cargar el ticket"
          message={error || "Reintenta más tarde."}
          action={
            <Button onClick={() => refresh()} variant="outline">
              Reintentar
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/client/tickets"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis tickets
        </Link>
      </div>

      <PageHeader
        title={ticket.titulo}
        description={`Ticket #${ticket.id.slice(0, 8)}`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            Refrescar
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                Resumen
              </CardTitle>
              <CardDescription>Estado, prioridad y SLA de tu ticket.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge className="capitalize w-fit">{ticket.estado}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Prioridad</p>
                <Badge variant="secondary" className="capitalize w-fit">
                  {ticket.prioridad}
                </Badge>
              </div>
              {ticket.slaObjetivo && (
                <div className="space-y-1 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">SLA objetivo</p>
                    <p className="text-sm">
                      {new Date(ticket.slaObjetivo).toLocaleString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {ticket.impacto && (
                <div className="space-y-1 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Impacto</p>
                    <p className="text-sm capitalize">{ticket.impacto}</p>
                  </div>
                </div>
              )}
              {ticket.categoria && (
                <div className="space-y-1 flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Categoría</p>
                    <p className="text-sm capitalize">{ticket.categoria}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
              <CardDescription>Detalle del problema o solicitud.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {ticket.descripcion || "Sin descripción."}
              </p>
            </CardContent>
          </Card>

          <TicketComments
            ticketId={ticket.id}
            comments={ticket.comentarios}
            attachments={ticket.attachments}
            onAddComment={(payload) => addComment(payload)}
            onRefresh={() => refresh()}
            isSubmitting={isCommenting}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadatos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Creado</span>
                <span>
                  {new Date(ticket.createdAt).toLocaleString("es-CO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {ticket.usuario?.email && (
                <div className="flex justify-between">
                  <span>Reportado por</span>
                  <span className="text-right">
                    {ticket.usuario.nombre || "Usuario"} <br />
                    <span className="text-xs">{ticket.usuario.email}</span>
                  </span>
                </div>
              )}
              {ticket.projectId && (
                <div className="flex justify-between">
                  <span>Proyecto</span>
                  <span className="text-right">{ticket.projectId}</span>
                </div>
              )}
              {ticket.organizationId && (
                <div className="flex justify-between">
                  <span>Organización</span>
                  <span className="text-right">{ticket.organizationId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">Recuerda</p>
              <p>Responde con la mayor información posible y adjunta evidencias para acelerar la resolución.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
