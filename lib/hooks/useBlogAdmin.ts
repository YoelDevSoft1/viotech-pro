import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { CreatePostData, UpdatePostData } from "@/lib/types/blog";

// Crear post
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePostData) => {
      const { data: response } = await apiClient.post("/blog/posts", data);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Artículo creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-admin"] }); // Invalidate admin posts too
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      console.log("✅ Post creado, invalidando queries:", response);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al crear artículo");
    },
  });
}

// Actualizar post
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePostData }) => {
      const { data: response } = await apiClient.put(`/blog/posts/${id}`, data);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Artículo actualizado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-admin"] }); // Invalidate admin posts too
      queryClient.invalidateQueries({ queryKey: ["blog-post"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al actualizar artículo");
    },
  });
}

// Eliminar post
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: response } = await apiClient.delete(`/blog/posts/${id}`);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Artículo eliminado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al eliminar artículo");
    },
  });
}

// Crear categoría
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const { data: response } = await apiClient.post("/blog/categories", data);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Categoría creada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al crear categoría");
    },
  });
}

// Crear tag
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const { data: response } = await apiClient.post("/blog/tags", data);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Tag creado exitosamente");
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al crear tag");
    },
  });
}

