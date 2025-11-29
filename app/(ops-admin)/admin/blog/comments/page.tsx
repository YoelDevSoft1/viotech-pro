"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Eye, ExternalLink, Loader2 } from "lucide-react";
import { useBlogCommentsPending, useApproveComment } from "@/lib/hooks/useBlogComments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { BlogComment } from "@/lib/types/blog";

export default function BlogCommentsAdminPage() {
  const { data: comments, isLoading, error } = useBlogCommentsPending();
  const approveComment = useApproveComment();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleApprove = async (comment: BlogComment) => {
    // El backend DEBE proporcionar postSlug en la respuesta
    if (!comment.postSlug) {
      console.error("❌ Comment no tiene postSlug. El backend debe incluirlo:", comment);
      alert("Error: El comentario no tiene información del artículo. Por favor, contacta al administrador.");
      return;
    }
    
    setApprovingId(comment.id);
    try {
      await approveComment.mutateAsync({
        slug: comment.postSlug,
        commentId: comment.id,
        isApproved: true,
      });
      setApprovingId(null);
    } catch (error) {
      setApprovingId(null);
    }
  };

  const handleReject = async (comment: BlogComment) => {
    // El backend DEBE proporcionar postSlug en la respuesta
    if (!comment.postSlug) {
      console.error("❌ Comment no tiene postSlug. El backend debe incluirlo:", comment);
      alert("Error: El comentario no tiene información del artículo. Por favor, contacta al administrador.");
      return;
    }
    
    setRejectingId(comment.id);
    try {
      await approveComment.mutateAsync({
        slug: comment.postSlug,
        commentId: comment.id,
        isApproved: false,
      });
      setRejectingId(null);
    } catch (error) {
      setRejectingId(null);
    }
  };

  const pendingComments = (comments?.filter((c) => !c.isApproved) || []) as BlogComment[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderación de Comentarios</h1>
          <p className="text-muted-foreground">
            Revisa y aprueba comentarios pendientes del blog
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">
            <Eye className="h-4 w-4 mr-2" />
            Ver Posts
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingComments.length}</div>
            <p className="text-xs text-muted-foreground">
              Comentarios esperando aprobación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Comentarios en total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(comments?.length || 0) - pendingComments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Comentarios aprobados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comentarios Pendientes ({pendingComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">
                El endpoint de comentarios pendientes aún no está implementado en el backend.
              </p>
              <p className="text-sm text-muted-foreground">
                Por favor, implementa <code className="text-xs bg-muted px-1 py-0.5 rounded">GET /api/blog/comments/pending</code> según la documentación.
              </p>
            </div>
          ) : pendingComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay comentarios pendientes de aprobación.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Autor</TableHead>
                  <TableHead>Comentario</TableHead>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.authorAvatar || undefined} alt={comment.authorName} />
                          <AvatarFallback>
                            {comment.authorName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{comment.authorName}</p>
                          {comment.authorEmail && (
                            <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm line-clamp-2 max-w-md">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      {comment.postSlug ? (
                        <Link
                          href={`/blog/${comment.postSlug}`}
                          target="_blank"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Ver artículo
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(comment)}
                          disabled={approvingId === comment.id || rejectingId === comment.id}
                        >
                          {approvingId === comment.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Aprobando...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Aprobar
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setRejectingId(comment.id)}
                          disabled={approvingId === comment.id || rejectingId === comment.id}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Rechazar comentario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el comentario como rechazado. El comentario no será visible públicamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const comment = pendingComments.find((c) => c.id === rejectingId);
                if (comment) {
                  handleReject(comment);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Rechazar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

