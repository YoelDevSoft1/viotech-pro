"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  slaObjetivo?: string | null;
  etiquetas?: any;
  createdAt: string;
  usuario?: { nombre?: string; email?: string };
  comentarios?: any[];
};

export default function InternalTicketDetail({ params }: { params: { id: string } }) {
  // useParams evita el warning de Next sobre params async en clientes
  const routeParams = useParams();
  const ticketId = Array.isArray(routeParams?.id)
    ? routeParams?.id[0]
    : typeof routeParams?.id === "string"
      ? routeParams.id
      : typeof (params as any)?.id === "string"
        ? (params as any).id
        : "";
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const tTickets = useTranslationsSafe("tickets");
  const tCommon = useTranslationsSafe("common");

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/internal/tickets/${ticketId}`);
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace(`/login?from=/internal/tickets/${ticketId}&reason=expired`);
        return;
      }
    }

    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || tTickets("error.loadFailed"));
      }
      const t = payload.data?.ticket || payload.data || payload;
      setTicket({
        id: String(t.id),
        titulo: t.titulo || tTickets("noTitle"),
        descripcion: t.descripcion || "",
        estado: t.estado || "abierto",
        prioridad: t.prioridad || "media",
        slaObjetivo: t.slaObjetivo || null,
        etiquetas: t.etiquetas,
        createdAt: t.createdAt || t.created_at || new Date().toISOString(),
        usuario: t.usuario || null,
        comentarios: t.comentarios || [],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : tTickets("error.loadFailed");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [ticketId, router]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    let token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/internal/tickets/${ticketId}`);
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace(`/login?from=/internal/tickets/${ticketId}&reason=expired`);
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl(`/tickets/${ticketId}/comment`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contenido: comment.trim() }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || tTickets("error.commentFailed"));
      }
      setComment("");
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : tTickets("error.commentFailed"));
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return (
    <main className="min-h-screen bg-background px-6 py-10 md:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal/tickets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {tTickets("goBackToTickets")}
          </Link>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {tTickets("loading")}
          </div>
        ) : ticket ? (
          <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Ticket #{ticket.id.slice(0, 6)}
                </p>
                <h1 className="text-2xl font-semibold text-foreground">{ticket.titulo}</h1>
                {ticket.usuario?.email && (
                  <p className="text-xs text-muted-foreground">
                    {tTickets("user")}: {ticket.usuario.nombre || tTickets("noName")} ({ticket.usuario.email})
                  </p>
                )}
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <span className="inline-flex rounded-full border border-border px-2 py-1 capitalize">
                  {ticket.estado}
                </span>
                <div>{tTickets("priorityLabel")}: {ticket.prioridad}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.descripcion || tTickets("noDescription")}
            </p>
            {ticket.slaObjetivo && (
              <p className="text-xs text-muted-foreground">
                {tTickets("slaTarget")}: {new Date(ticket.slaObjetivo).toLocaleString("es-CO")}
              </p>
            )}
            {Array.isArray(ticket.comentarios) && ticket.comentarios.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {tTickets("comments")}
                </p>
                <div className="space-y-2">
                  {ticket.comentarios.map((c: any) => (
                    <div
                      key={c.id || c.createdAt}
                      className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.autor?.nombre || c.autor?.email || tTickets("user")}</span>
                        <span>
                          {new Date(c.createdAt || c.created_at || "").toLocaleString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-foreground">{c.contenido}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form className="space-y-2 pt-2" onSubmit={handleComment}>
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {tTickets("newComment")}
              </label>
              <textarea
                className="w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={tTickets("commentPlaceholder")}
                disabled={commentLoading}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
                disabled={commentLoading || !comment.trim()}
              >
                {commentLoading ? tTickets("sending") : tTickets("addComment")}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            {tTickets("notFound")}
          </div>
        )}
      </div>
    </main>
  );
}
