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
      try {
        // Construir URL con query parameters correctamente
        const params = new URLSearchParams();
        params.append("approved", approved.toString());
        params.append("includeReplies", includeReplies.toString());
        
        const url = `/blog/posts/${slug}/comments?${params.toString()}`;
        console.log("🔍 Fetching comments from:", url);
        
        const { data } = await apiClient.get(url);
        const response = data as BlogCommentsResponse;
        
        console.log("✅ Comments response:", response);
        return response.data || [];
      } catch (error: any) {
        console.error("❌ Error fetching comments:", error);
        console.error("❌ Error response:", error?.response?.data);
        console.error("❌ Error status:", error?.response?.status);
        console.error("❌ Error message:", error?.message);
        
        // Si es 401 y es un endpoint público, puede ser un problema de configuración
        if (error?.response?.status === 401) {
          console.warn("⚠️ Endpoint de comentarios retornó 401 (no autorizado).");
          console.warn("   Esto puede indicar que el backend está requiriendo autenticación");
          console.warn("   cuando debería ser público. Verifica la configuración del backend.");
        }
        
        // Si es 400, puede ser que el endpoint no esté implementado o tenga parámetros incorrectos
        if (error?.response?.status === 400) {
          console.warn("⚠️ Endpoint de comentarios retornó 400. Verifica:");
          console.warn("  1. Que el endpoint esté implementado en el backend");
          console.warn("  2. Que los parámetros sean correctos");
          console.warn("  3. Que el endpoint sea público (sin autenticación)");
        }
        
        // Si es 404, el endpoint no existe
        if (error?.response?.status === 404) {
          console.warn("⚠️ Endpoint de comentarios no encontrado (404)");
          console.warn("   El endpoint puede no estar implementado aún");
        }
        
        // Retornar array vacío en lugar de lanzar error para que la UI no se rompa
        return [];
      }
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false, // No reintentar si falla
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
      queryClient.invalidateQueries({ queryKey: ["blog-comments-pending"] }); // Invalidar lista de pendientes
      queryClient.invalidateQueries({ queryKey: ["blog-comments-admin"] }); // Invalidar lista admin
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Error al moderar comentario";
      
      // Si es 401, sugerir reautenticación
      if (error?.response?.status === 401) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else {
        toast.error(errorMessage);
      }
    },
  });
}

// Obtener TODOS los comentarios pendientes (Admin)
export function useBlogCommentsPending() {
  return useQuery({
    queryKey: ["blog-comments-pending"],
    queryFn: async () => {
      try {
        // El backend debería tener un endpoint GET /api/blog/comments/pending
        const { data } = await apiClient.get("/blog/comments/pending");
        const response = data as BlogCommentsResponse;
        return response.data || [];
      } catch (error: any) {
        // Si el endpoint no existe (404) o hay error de conexión, retornar array vacío silenciosamente
        // Esto permite que la UI funcione mientras el backend implementa el endpoint
        if (error?.response?.status === 404 || error?.response?.status === 501) {
          console.warn("⚠️ Endpoint /blog/comments/pending no implementado aún. Retornando array vacío.");
          return [];
        }
        
        // Para errores de conexión o timeout, también retornar array vacío
        if (!error?.response || error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          console.warn("⚠️ Error de conexión al obtener comentarios pendientes. Retornando array vacío.");
          return [];
        }
        
        // Para otros errores, loguear pero retornar array vacío para no romper la UI
        console.error("❌ Error fetching pending comments:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false,
    // No mostrar errores en la UI si el endpoint no existe
    throwOnError: false,
  });
}

// Obtener TODOS los comentarios (Admin - para moderación)
export function useBlogCommentsAdmin(filters?: { approved?: boolean; postSlug?: string }) {
  return useQuery({
    queryKey: ["blog-comments-admin", filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters?.approved !== undefined) {
          params.append("approved", filters.approved.toString());
        }
        if (filters?.postSlug) {
          params.append("postSlug", filters.postSlug);
        }
        
        const url = `/blog/comments/admin?${params.toString()}`;
        console.log("🔍 Fetching admin comments from:", url);
        
        const { data } = await apiClient.get(url);
        const response = data as BlogCommentsResponse;
        return response.data || [];
      } catch (error: any) {
        // Si el endpoint no existe (404) o hay error de conexión, retornar array vacío silenciosamente
        if (error?.response?.status === 404 || error?.response?.status === 501) {
          console.warn("⚠️ Endpoint /blog/comments/admin no implementado aún. Retornando array vacío.");
          return [];
        }
        
        // Para errores de conexión o timeout, también retornar array vacío
        if (!error?.response || error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
          console.warn("⚠️ Error de conexión al obtener comentarios admin. Retornando array vacío.");
          return [];
        }
        
        // Para otros errores, loguear pero retornar array vacío para no romper la UI
        console.error("❌ Error fetching admin comments:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: false,
    // No mostrar errores en la UI si el endpoint no existe
    throwOnError: false,
  });
}

