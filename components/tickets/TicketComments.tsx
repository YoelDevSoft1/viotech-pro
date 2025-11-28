"use client";

import { useState } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getAccessToken } from "@/lib/auth";
import { uploadTicketAttachment } from "@/lib/storage/uploadTicketAttachment";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type Comment = {
  id?: string;
  contenido?: string;
  createdAt?: string;
  created_at?: string;
  autor?: { nombre?: string; email?: string };
};

type Attachment = {
  url?: string;
  nombre?: string;
  name?: string;
  tipoMime?: string;
  mimeType?: string;
  tamaño?: number;
  size?: number;
};

interface TicketCommentsProps {
  ticketId: string;
  comments?: Comment[];
  attachments?: Attachment[];
  onAddComment?: (payload: { contenido: string }) => Promise<any>;
  onRefresh?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function TicketComments({
  ticketId,
  comments = [],
  attachments = [],
  onAddComment,
  onRefresh,
  isSubmitting = false,
  className,
}: TicketCommentsProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const submitting = loading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    try {
      if (onAddComment) {
        await onAddComment({ contenido: message.trim() });
      }

      if (files.length > 0) {
        const token = getAccessToken();
        if (!token) throw new Error("No autenticado para subir adjuntos.");

        for (const file of files) {
          await uploadTicketAttachment(ticketId, file, token);
        }
      }

      toast.success("Comentario enviado");
      setMessage("");
      setFiles([]);
      onRefresh?.();
    } catch (error: any) {
      toast.error(error?.message || "Error al enviar comentario");
    } finally {
      setLoading(false);
    }
  };

  const formattedComments = Array.isArray(comments) ? comments : [];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Comentarios</span>
          <Badge variant="outline">{formattedComments.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 pr-4">
          {formattedComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>
          ) : (
            <div className="space-y-3">
              {formattedComments.map((c) => (
                <div
                  key={c.id || c.createdAt || c.created_at}
                  className="rounded-xl border border-border/70 bg-muted/10 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.autor?.nombre || c.autor?.email || "Usuario"}</span>
                    <span>
                      {c.createdAt || c.created_at
                        ? new Date(c.createdAt || c.created_at).toLocaleString("es-CO", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{c.contenido || ""}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {attachments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Adjuntos</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((file, idx) => (
                <a
                  key={file.url || file.nombre || file.name || idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted/40"
                >
                  <Paperclip className="w-3 h-3" />
                  <span>{file.nombre || file.name || "Archivo"}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nuevo comentario</Label>
            <Textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe la actualización..."
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Adjuntar archivos</Label>
            <Input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              disabled={submitting}
            />
            {files.length > 0 && (
              <p className="text-xs text-muted-foreground">{files.length} archivo(s) listo(s) para subir</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={submitting || !message.trim()}>
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enviar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
