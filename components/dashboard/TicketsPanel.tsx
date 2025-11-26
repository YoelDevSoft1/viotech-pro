"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, MessageSquare, Paperclip } from "lucide-react";
import { useTickets } from "@/lib/hooks/useTickets";
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/State";
import { buildApiUrl } from "@/lib/api";

type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  slaObjetivo?: string | null;
  etiquetas?: any[];
  createdAt: string;
  comentarios?: any[];
};

type TicketForm = {
  titulo: string;
  descripcion: string;
  prioridad: string;
  slaObjetivo: string;
};

type Props = {
  token: string | null;
  onRequireAuth?: () => void;
};

export function TicketsPanel({ token, onRequireAuth }: Props) {
  const { tickets, loading, error, refresh } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState<TicketForm>({
    titulo: "",
    descripcion: "",
    prioridad: "media",
    slaObjetivo: "",
  });
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketComment, setTicketComment] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentsUploading, setAttachmentsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (selectedTicket) return selectedTicket;
    return tickets[0] || null;
  }, [tickets, selectedTicket]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      onRequireAuth?.();
      return;
    }
    if (!ticketForm.titulo.trim()) {
      setLocalError("El título del ticket es obligatorio.");
      return;
    }
    setTicketSubmitting(true);
    setLocalError(null);
    try {
      setAttachmentsUploading(true);
      const uploads = attachments.length ? attachments : [];
      setAttachmentsUploading(false);

      const response = await fetch(buildApiUrl("/tickets"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: ticketForm.titulo.trim(),
          descripcion: ticketForm.descripcion?.trim(),
          prioridad: ticketForm.prioridad,
          slaObjetivo: ticketForm.slaObjetivo || undefined,
          etiquetas: uploads.length ? uploads : undefined,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "No se pudo crear el ticket.");
      }
      setTicketForm({
        titulo: "",
        descripcion: "",
        prioridad: "media",
        slaObjetivo: "",
      });
      setAttachments([]);
      setCreateTicketOpen(false);
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido al crear ticket.";
      setLocalError(msg);
    } finally {
      setTicketSubmitting(false);
      setAttachmentsUploading(false);
    }
  };

  const handleComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !token) {
      onRequireAuth?.();
      return;
    }
    if (!ticketComment.trim()) return;
    setCommentSubmitting(true);
    try {
      const response = await fetch(buildApiUrl(`/tickets/${selected.id}/comment`), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contenido: ticketComment.trim() }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || payload?.message || "No se pudo agregar el comentario.");
      }
      setTicketComment("");
      refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido al agregar comentario.";
      setLocalError(msg);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleAttachmentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      setAttachments([]);
      return;
    }
    setAttachments(Array.from(event.target.files));
  };

  if (loading) return <LoadingState title="Sincronizando tickets..." />;
  if (error || localError) return <ErrorState message={localError || error || undefined} />;
  if (!tickets.length)
    return (
      <EmptyState
        title="Aún no tienes tickets registrados."
        message="Crea tu primer ticket para contactar a tu squad."
      />
    );

  return (
    <section className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Tickets & soporte
          </p>
          <h2 className="text-3xl font-medium text-foreground">Gestión de casos prioritarios</h2>
          <p className="text-sm text-muted-foreground">
            Registra nuevos tickets, adjunta evidencias y conversa con tu squad dedicado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateTicketOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" />
          {createTicketOpen ? "Cerrar formulario" : "Nuevo ticket"}
        </button>
      </div>

      {(error || localError) && <ErrorState message={localError || error || undefined} />}

      <div className="grid grid-cols-1 lg:grid-cols-[0.45fr,0.55fr] gap-6">
        <div className="rounded-3xl border border-border/70 bg-background/80 p-4 space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => setSelectedTicket(ticket)}
              className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                selected?.id === ticket.id ? "border-foreground bg-muted/40" : "border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{ticket.titulo}</p>
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {ticket.prioridad}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{new Date(ticket.createdAt).toLocaleDateString("es-CO")}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    ticket.estado === "resuelto"
                      ? "bg-green-100 text-green-700"
                      : ticket.estado === "en_progreso"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {ticket.estado}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4">
          {selected ? (
            <>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Ticket #{selected.id.slice(0, 6).toUpperCase()}
                </p>
                <h3 className="text-2xl font-medium text-foreground">{selected.titulo}</h3>
                <p className="text-sm text-muted-foreground">{selected.descripcion || "Sin descripción."}</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="rounded-full border border-border px-3 py-1">Prioridad: {selected.prioridad}</span>
                  {selected.slaObjetivo && (
                    <span className="rounded-full border border-border px-3 py-1">
                      SLA: {new Date(selected.slaObjetivo).toLocaleDateString("es-CO")}
                    </span>
                  )}
                </div>

                {Array.isArray(selected.etiquetas) && selected.etiquetas.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Adjuntos</p>
                    <div className="flex flex-wrap gap-3">
                      {(selected.etiquetas as Array<{ name: string; url: string }>).map((file, idx) => (
                        <a
                          key={`${selected.id}-${file.url || idx}`}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                        >
                          <Paperclip className="w-3 h-3" />
                          {file.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Actividad</p>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selected.comentarios && selected.comentarios.length > 0 ? (
                    selected.comentarios.map((comment) => (
                      <div key={comment.id} className="rounded-2xl border border-border/70 p-3 text-sm">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{comment.autor?.nombre || "Equipo VioTech"}</span>
                          <span>{new Date(comment.createdAt).toLocaleDateString("es-CO")}</span>
                        </div>
                        <p className="text-foreground mt-1">{comment.contenido}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin comentarios aún.</p>
                  )}
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleComment}>
                <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Nuevo comentario
                </label>
                <textarea
                  className="w-full rounded-2xl border border-border bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/40"
                  rows={3}
                  value={ticketComment}
                  onChange={(event) => setTicketComment(event.target.value)}
                  placeholder="Actualiza a tu squad con los últimos detalles..."
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-60"
                  disabled={commentSubmitting || !ticketComment.trim()}
                >
                  {commentSubmitting ? "Enviando..." : "Agregar comentario"}
                </button>
              </form>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Selecciona un ticket para ver los detalles.</p>
          )}
        </div>
      </div>

      {createTicketOpen && (
        <form
          className="rounded-3xl border border-border/70 bg-background/80 p-6 space-y-4"
          onSubmit={handleCreate}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Título</label>
              <input
                type="text"
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                value={ticketForm.titulo}
                onChange={(event) => setTicketForm((prev) => ({ ...prev, titulo: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Prioridad</label>
              <select
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                value={ticketForm.prioridad}
                onChange={(event) => setTicketForm((prev) => ({ ...prev, prioridad: event.target.value }))}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Descripción</label>
            <textarea
              className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
              rows={4}
              value={ticketForm.descripcion}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, descripcion: event.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">SLA objetivo</label>
              <input
                type="date"
                className="w-full rounded-2xl border border-border bg-transparent px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/40"
                value={ticketForm.slaObjetivo}
                onChange={(event) => setTicketForm((prev) => ({ ...prev, slaObjetivo: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <Paperclip className="w-3 h-3" />
                Adjuntos (opcional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleAttachmentsChange}
                className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-xs file:font-medium file:text-background hover:file:opacity-80"
              />
              {attachments.length > 0 && (
                <p className="text-xs text-muted-foreground">{attachments.length} archivo(s) listos para subir.</p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:scale-105 transition-transform disabled:opacity-60"
            disabled={ticketSubmitting || attachmentsUploading}
          >
            {ticketSubmitting ? "Creando ticket..." : "Crear ticket"}
          </button>
        </form>
      )}
    </section>
  );
}
