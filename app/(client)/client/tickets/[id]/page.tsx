"use client";

import { useEffect, use } from "react";
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
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useI18n } from "@/lib/hooks/useI18n";

export default function ClientTicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  
  const { ticket, isLoading, isError, error, refresh, addComment, isCommenting } = useTicket(ticketId);
  const tClientTicket = useTranslationsSafe("client.tickets.ticketDetail");
  const { formatDate } = useI18n();

  // Guard de autenticación rápido (token en storage)
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/client/tickets/${ticketId}`);
    }
  }, [router, ticketId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingState title={tClientTicket("loading")} />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <ErrorState
          title={tClientTicket("errorTitle")}
          message={error || tClientTicket("errorMessage")}
        >
          <Button onClick={() => refresh()} variant="outline" className="mt-2">
            {tClientTicket("retry")}
          </Button>
        </ErrorState>
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
          {tClientTicket("backToTickets")}
        </Link>
      </div>

      <PageHeader
        title={ticket.titulo}
        description={`Ticket #${ticket.id.slice(0, 8)}`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => refresh()}>
            {tClientTicket("refresh")}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                {tClientTicket("summary")}
              </CardTitle>
              <CardDescription>{tClientTicket("summaryDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{tClientTicket("status")}</p>
                <Badge className="capitalize w-fit">{ticket.estado}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{tClientTicket("priority")}</p>
                <Badge variant="secondary" className="capitalize w-fit">
                  {ticket.prioridad}
                </Badge>
              </div>
              {ticket.slaObjetivo && (
                <div className="space-y-1 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{tClientTicket("slaTarget")}</p>
                    <p className="text-sm">
                      {formatDate(ticket.slaObjetivo, "PPp")}
                    </p>
                  </div>
                </div>
              )}
              {ticket.impacto && (
                <div className="space-y-1 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{tClientTicket("impact")}</p>
                    <p className="text-sm capitalize">{ticket.impacto}</p>
                  </div>
                </div>
              )}
              {ticket.categoria && (
                <div className="space-y-1 flex items-center gap-2">
                  <Tags className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{tClientTicket("category")}</p>
                    <p className="text-sm capitalize">{ticket.categoria}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tClientTicket("description")}</CardTitle>
              <CardDescription>{tClientTicket("descriptionDetail")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {ticket.descripcion || tClientTicket("noDescription")}
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
              <CardTitle>{tClientTicket("metadata")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>{tClientTicket("created")}</span>
                <span>
                  {formatDate(ticket.createdAt, "PPpp")}
                </span>
              </div>
              {ticket.usuario?.email && (
                <div className="flex justify-between">
                  <span>{tClientTicket("reportedBy")}</span>
                  <span className="text-right">
                    {ticket.usuario.nombre || tClientTicket("user")} <br />
                    <span className="text-xs">{ticket.usuario.email}</span>
                  </span>
                </div>
              )}
              {ticket.projectId && (
                <div className="flex justify-between">
                  <span>{tClientTicket("project")}</span>
                  <span className="text-right">{ticket.projectId}</span>
                </div>
              )}
              {ticket.organizationId && (
                <div className="flex justify-between">
                  <span>{tClientTicket("organization")}</span>
                  <span className="text-right">{ticket.organizationId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <div>
              <p className="font-medium">{tClientTicket("remember")}</p>
              <p>{tClientTicket("rememberMessage")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
