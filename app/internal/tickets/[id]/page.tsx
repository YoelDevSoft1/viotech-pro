"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api";
import { getAccessToken, isTokenExpired, refreshAccessToken, logout } from "@/lib/auth";

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
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    let token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/internal/tickets/${params.id}`);
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace(`/login?from=/internal/tickets/${params.id}&reason=expired`);
        return;
      }
    }

    try {
      const res = await fetch(buildApiUrl(`/tickets/${params.id}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudo cargar el ticket");
      }
      const t = payload.data?.ticket || payload.data || payload;
      setTicket({
        id: String(t.id),
        titulo: t.titulo || "Sin título",
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
      const msg = err instanceof Error ? err.message : "Error al cargar el ticket";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommentLoading(true);
    let token = getAccessToken();
    if (!token) {
      router.replace(`/login?from=/internal/tickets/${params.id}`);
      return;
    }
    if (isTokenExpired(token)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) token = refreshed;
      else {
        await logout();
        router.replace(`/login?from=/internal/tickets/${params.id}&reason=expired`);
        return;
      }
    }
    try {
      const res = await fetch(buildApiUrl(`/tickets/${params.id}/comment`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contenido: comment.trim() }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload) {
        throw new Error(payload?.error || payload?.message || "No se pudo agregar el comentario");
      }
      setComment("");
      await fetchTicket();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comentar");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/internal/tickets"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a tickets
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
            Cargando ticket...
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
                    Usuario: {ticket.usuario.nombre || "Sin nombre"} ({ticket.usuario.email})
                  </p>
                )}
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <span className="inline-flex rounded-full border border-border px-2 py-1 capitalize">
                  {ticket.estado}
                </span>
                <div>Prioridad: {ticket.prioridad}</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.descripcion || "Sin descripción."}
            </p>
            {ticket.slaObjetivo && (
              <p className="text-xs text-muted-foreground">
                SLA objetivo: {new Date(ticket.slaObjetivo).toLocaleString("es-CO")}
              </p>
            )}
            {Array.isArray(ticket.comentarios) && ticket.comentarios.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Comentarios
                </p>
                <div className="space-y-2">
                  {ticket.comentarios.map((c: any) => (
                    <div
                      key={c.id || c.createdAt}
                      className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.autor?.nombre || c.autor?.email || "Usuario"}</span>
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
                Nuevo comentario
              </label>
              <textarea
                className="w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Actualiza el ticket..."
                disabled={commentLoading}
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:scale-[1.02] transition-transform disabled:opacity-60"
                disabled={commentLoading || !comment.trim()}
              >
                {commentLoading ? "Enviando..." : "Agregar comentario"}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            No se encontró el ticket.
          </div>
        )}
      </div>
    </main>
  );
}
