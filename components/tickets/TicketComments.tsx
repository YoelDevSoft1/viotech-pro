"use client";

import { useState, useRef } from "react";
import { Paperclip, Loader2, Send, X, FileText, Image, File, User, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { getAccessToken } from "@/lib/auth";
import { uploadTicketAttachment } from "@/lib/storage/uploadTicketAttachment";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useTranslationsSafe } from "@/lib/hooks/useTranslationsSafe";

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
  const tTickets = useTranslationsSafe("tickets");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitting = loading || isSubmitting;

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/")) return Image;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) {
      toast.error("Agrega un comentario o archivo");
      return;
    }
    setLoading(true);
    try {
      if (message.trim() && onAddComment) {
        await onAddComment({ contenido: message.trim() });
      }

      if (files.length > 0) {
        const token = getAccessToken();
        if (!token) throw new Error("No autenticado para subir adjuntos.");

        setUploadingFiles(new Set(files.map((f) => f.name)));
        for (const file of files) {
          try {
            await uploadTicketAttachment(ticketId, file, token);
          } catch (err) {
            console.error(`Error subiendo ${file.name}:`, err);
            toast.error(`Error al subir ${file.name}`);
          }
        }
        setUploadingFiles(new Set());
      }

      toast.success("Comentario enviado");
      setMessage("");
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onRefresh?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error al enviar comentario";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploadingFiles(new Set());
    }
  };

  const formattedComments = Array.isArray(comments) ? comments : [];
  const formattedAttachments = Array.isArray(attachments) ? attachments : [];

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentarios y Adjuntos
            </CardTitle>
            <CardDescription>
              {formattedComments.length} comentario(s) • {formattedAttachments.length} adjunto(s)
            </CardDescription>
          </div>
          <Badge variant="outline">{formattedComments.length + formattedAttachments.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Comentarios</h3>
            {formattedComments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {formattedComments.length}
              </Badge>
            )}
          </div>
          <ScrollArea className="h-[300px] pr-4">
            {formattedComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Aún no hay comentarios.</p>
                <p className="text-xs text-muted-foreground mt-1">Sé el primero en comentar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formattedComments.map((c, idx) => (
                  <div
                    key={c.id || c.createdAt || c.created_at || idx}
                    className="rounded-lg border bg-card p-4 space-y-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {c.autor?.nombre || c.autor?.email || "Usuario anónimo"}
                          </p>
                          {c.autor?.email && c.autor?.nombre && (
                            <p className="text-xs text-muted-foreground">{c.autor.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {(() => {
                            const dateStr = c.createdAt || c.created_at;
                            return dateStr
                              ? new Date(dateStr).toLocaleString("es-CO", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—";
                          })()}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {c.contenido || ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Attachments Section */}
        {formattedAttachments.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Adjuntos
              </h3>
              <Badge variant="secondary" className="text-xs">
                {formattedAttachments.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formattedAttachments.map((file, idx) => (
                <a
                  key={file.url || file.nombre || file.name || idx}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.nombre || file.name || "Archivo"}</p>
                    {(file.tamaño || file.size) && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.tamaño || file.size || 0)}
                      </p>
                    )}
                  </div>
                  <Paperclip className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* New Comment Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="comment-textarea" className="text-sm font-medium">
              Nuevo comentario
            </Label>
            <Textarea
              id="comment-textarea"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu comentario aquí... Puedes incluir detalles, actualizaciones o preguntas."
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length} caracteres
            </p>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="file-input" className="text-sm font-medium">
              Adjuntar archivos
            </Label>
            <Input
              id="file-input"
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={submitting}
              className="cursor-pointer"
            />
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{files.length} archivo(s) seleccionado(s)</p>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, idx) => {
                    const FileIcon = getFileIcon(file);
                    const isUploading = uploadingFiles.has(file.name);
                    return (
                      <div
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-sm"
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeFile(idx)}
                            disabled={submitting}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="submit"
              disabled={submitting || (!message.trim() && files.length === 0)}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {tTickets("sending")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {tTickets("addComment")}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
