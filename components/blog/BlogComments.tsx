"use client";

import { useState } from "react";
import { useBlogComments, useCreateComment, useLikeComment, useUpdateComment, useDeleteComment } from "@/lib/hooks/useBlogComments";
import { useCurrentUser } from "@/lib/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Reply, Edit, Trash2, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { BlogComment } from "@/lib/types/blog";

interface BlogCommentsProps {
  postSlug: string;
}

export function BlogComments({ postSlug }: BlogCommentsProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: comments, isLoading } = useBlogComments(postSlug, true, true);
  const createComment = useCreateComment();
  const likeComment = useLikeComment();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Para usuarios anónimos
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const data: any = {
      content: newComment,
    };

    if (!currentUser) {
      if (!authorName.trim()) return;
      data.authorName = authorName;
      if (authorEmail.trim()) data.authorEmail = authorEmail;
    }

    try {
      await createComment.mutateAsync({ slug: postSlug, data });
      setNewComment("");
      setAuthorName("");
      setAuthorEmail("");
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const handleReply = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const data: any = {
      content: replyContent,
      parentId,
    };

    if (!currentUser) {
      if (!authorName.trim()) return;
      data.authorName = authorName;
      if (authorEmail.trim()) data.authorEmail = authorEmail;
    }

    try {
      await createComment.mutateAsync({ slug: postSlug, data });
      setReplyingTo(null);
      setReplyContent("");
      setAuthorName("");
      setAuthorEmail("");
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateComment.mutateAsync({
        slug: postSlug,
        commentId,
        content: editContent,
      });
      setEditingId(null);
      setEditContent("");
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      await deleteComment.mutateAsync({ slug: postSlug, commentId });
    } catch (error) {
      // Error manejado en el hook
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      await likeComment.mutateAsync({ slug: postSlug, commentId });
    } catch (error) {
      // Error manejado en el hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-muted animate-pulse rounded" />
        <div className="h-20 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const CommentItem = ({ comment, depth = 0 }: { comment: BlogComment; depth?: number }) => {
    const isOwner = currentUser && comment.userId === currentUser.id;
    const isEditing = editingId === comment.id;

    return (
      <Card className={depth > 0 ? "ml-8 mt-4" : ""}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={null} />
              <AvatarFallback>
                {comment.authorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{comment.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {comment.isApproved === false && (
                  <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    Pendiente de moderación
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={updateComment.isPending}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setEditContent("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  className="gap-1"
                >
                  <Heart className={`h-4 w-4 ${comment.likes > 0 ? "fill-red-500 text-red-500" : ""}`} />
                  {comment.likes}
                </Button>

                {depth < 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(comment.id);
                      setReplyContent("");
                    }}
                    className="gap-1"
                  >
                    <Reply className="h-4 w-4" />
                    Responder
                  </Button>
                )}

                {isOwner && !isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="gap-1 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </>
                )}
              </div>

              {replyingTo === comment.id && (
                <Card className="mt-4 bg-muted/50">
                  <CardContent className="p-4">
                    <form onSubmit={(e) => handleReply(comment.id, e)} className="space-y-2">
                      {!currentUser && (
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Tu nombre"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Tu email (opcional)"
                            value={authorEmail}
                            onChange={(e) => setAuthorEmail(e.target.value)}
                          />
                        </div>
                      )}
                      <Textarea
                        placeholder="Escribe tu respuesta..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={3}
                        required
                      />
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={createComment.isPending}
                        >
                          {createComment.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Enviar
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyContent("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-2">
                  {comment.replies.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Comentarios {comments && comments.length > 0 && `(${comments.length})`}
        </h2>

        {/* Formulario de nuevo comentario */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSubmitComment} className="space-y-4">
              {!currentUser && (
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Tu nombre *"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Tu email (opcional)"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                  />
                </div>
              )}
              <Textarea
                placeholder="Escribe tu comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                required
              />
              <Button type="submit" disabled={createComment.isPending}>
                {createComment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Publicar comentario
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de comentarios */}
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

