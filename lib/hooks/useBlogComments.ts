import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type {
  BlogComment,
  CreateCommentData,
  CommentLikeResponse,
  BlogCommentsResponse,
} from "@/lib/types/blog";

// Listar comentarios
export function useBlogComments(
  slug: string,
  approved: boolean = true,
  includeReplies: boolean = true
) {
  return useQuery({
    queryKey: ["blog-comments", slug, approved, includeReplies],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/blog/posts/${slug}/comments?approved=${approved}&includeReplies=${includeReplies}`
      );
      const response = data as BlogCommentsResponse;
      return response.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

// Crear comentario
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: CreateCommentData }) => {
      const { data: response } = await apiClient.post(`/blog/posts/${slug}/comments`, data);
      return response;
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Comentario publicado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al crear comentario");
    },
  });
}

// Editar comentario
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      commentId,
      content,
    }: {
      slug: string;
      commentId: string;
      content: string;
    }) => {
      const { data: response } = await apiClient.put(`/blog/posts/${slug}/comments/${commentId}`, {
        content,
      });
      return response;
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Comentario actualizado");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al actualizar comentario");
    },
  });
}

// Eliminar comentario
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, commentId }: { slug: string; commentId: string }) => {
      const { data: response } = await apiClient.delete(
        `/blog/posts/${slug}/comments/${commentId}`
      );
      return response;
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Comentario eliminado");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al eliminar comentario");
    },
  });
}

// Dar like a comentario
export function useLikeComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, commentId }: { slug: string; commentId: string }) => {
      const { data: response } = await apiClient.post(
        `/blog/posts/${slug}/comments/${commentId}/like`
      );
      return response.data as CommentLikeResponse;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al dar like");
    },
  });
}

// Aprobar/rechazar comentario (Admin)
export function useApproveComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      commentId,
      isApproved,
    }: {
      slug: string;
      commentId: string;
      isApproved: boolean;
    }) => {
      const { data: response } = await apiClient.put(
        `/blog/posts/${slug}/comments/${commentId}/approve`,
        { isApproved }
      );
      return response;
    },
    onSuccess: (response, variables) => {
      toast.success(response.message || "Comentario moderado");
      queryClient.invalidateQueries({ queryKey: ["blog-comments", variables.slug] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al moderar comentario");
    },
  });
}

