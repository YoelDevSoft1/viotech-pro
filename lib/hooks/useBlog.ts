import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type {
  BlogPost,
  BlogResponse,
  BlogFilters,
  BlogCategory,
  BlogTag,
  BlogPostsResponse,
  BlogPostResponse,
  BlogCategoriesResponse,
  BlogTagsResponse,
  NewsletterSubscribeResponse,
  NewsletterUnsubscribeResponse,
} from "@/lib/types/blog";

// Obtener lista de artículos
export function useBlogPosts(filters?: BlogFilters) {
  return useQuery({
    queryKey: ["blog-posts", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append("category", filters.category);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const { data } = await apiClient.get(`/blog/posts?${params.toString()}`);
      const response = data as BlogPostsResponse;
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Obtener artículo individual
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/blog/posts/${slug}`);
        const response = data as BlogPostResponse;
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          throw new Error("Artículo no encontrado");
        }
        throw new Error("Error al cargar artículo");
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!slug,
    retry: false, // No reintentar si es 404
  });
}

// Obtener categorías
export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/blog/categories");
      const response = data as BlogCategoriesResponse;
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

// Obtener tags
export function useBlogTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      const { data } = await apiClient.get("/blog/tags");
      const response = data as BlogTagsResponse;
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

// Obtener artículos relacionados
export function useRelatedPosts(slug: string, limit: number = 3) {
  return useQuery({
    queryKey: ["related-posts", slug, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/blog/posts/${slug}/related?limit=${limit}`
      );
      return (data?.data || data || []) as BlogPost[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!slug,
  });
}

// Suscribir al newsletter
export function useNewsletterSubscribe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, source }: { email: string; source?: string }) => {
      const { data } = await apiClient.post("/blog/newsletter/subscribe", {
        email,
        source,
      });
      return data as NewsletterSubscribeResponse;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Suscripción exitosa");
      queryClient.invalidateQueries({ queryKey: ["newsletter"] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Error al suscribirse";
      toast.error(message);
    },
  });
}

// Cancelar suscripción al newsletter
export function useNewsletterUnsubscribe() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post("/blog/newsletter/unsubscribe", {
        email,
      });
      return data as NewsletterUnsubscribeResponse;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Suscripción cancelada");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        "Error al cancelar suscripción";
      toast.error(message);
    },
  });
}

