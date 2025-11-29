import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { BlogPost, BlogResponse, BlogFilters, BlogCategory, BlogTag } from "@/lib/types/blog";

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
      return (data?.data || data) as BlogResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Obtener artículo individual
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/blog/posts/${slug}`);
      return (data?.data || data) as BlogPost;
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!slug,
  });
}

// Obtener categorías
export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/blog/categories");
      return (data?.data || data || []) as BlogCategory[];
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
      return (data?.data || data || []) as BlogTag[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

// Obtener artículos relacionados
export function useRelatedPosts(postId: string, categoryId: string, limit: number = 3) {
  return useQuery({
    queryKey: ["related-posts", postId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/blog/posts/${postId}/related?category=${categoryId}&limit=${limit}`
      );
      return (data?.data || data || []) as BlogPost[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!postId && !!categoryId,
  });
}

