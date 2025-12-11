"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { getAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketsPanel } from "@/components/dashboard/TicketsPanel";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";
import { useTickets } from "@/lib/hooks/useTickets";

export default function ClientTicketsPage() {
  const router = useRouter();
  const tClientTickets = useTranslationsSafe("client.tickets");
  const { tickets } = useTickets({ page: 1, limit: 100 });

  useEffect(() => {
    const stored = getAccessToken();
    if (!stored) {
      router.replace("/login?from=/client/tickets");
      return;
    }
  }, [router]);

  // Estadísticas para badges
  const openTickets = tickets.filter(t => t.estado === "abierto").length;
  const inProgressTickets = tickets.filter(t => t.estado === "en_progreso").length;
  const highPriorityTickets = tickets.filter(t => t.prioridad === "alta" && t.estado !== "resuelto").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {tClientTickets("backToDashboard")}
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Ticket className="h-8 w-8" />
              {tClientTickets("title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {tClientTickets("description")}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {openTickets > 0 && (
              <Badge variant="secondary" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                {openTickets} {openTickets === 1 ? "abierto" : "abiertos"}
              </Badge>
            )}
            {inProgressTickets > 0 && (
              <Badge variant="outline" className="gap-1.5 border-yellow-500/50 text-yellow-600">
                <Clock className="h-3.5 w-3.5" />
                {inProgressTickets} en progreso
              </Badge>
            )}
            {highPriorityTickets > 0 && (
              <Badge variant="outline" className="gap-1.5 border-red-500/50 text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {highPriorityTickets} alta prioridad
              </Badge>
            )}
            {tickets.length > 0 && openTickets === 0 && inProgressTickets === 0 && (
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                Todo al día
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tickets Panel */}
      <section>
        <TicketsPanel />
      </section>
    </div>
  );
}
