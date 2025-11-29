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

// Obtener lista de artículos (público - solo publicados)
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

// Obtener TODOS los artículos (admin - incluye borradores)
export function useBlogPostsAdmin(filters?: BlogFilters) {
  return useQuery({
    queryKey: ["blog-posts-admin", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Agregar parámetro para obtener todos los posts (incluyendo borradores)
      params.append("all", "true");
      if (filters?.category) params.append("category", filters.category);
      if (filters?.tag) params.append("tag", filters.tag);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const url = `/blog/posts?${params.toString()}`;
      console.log("📦 Fetching admin posts from:", url);
      
      const response = await apiClient.get(url);
      const result = response.data;
      
      console.log("📦 Full Response:", response);
      console.log("📦 Response.data (result):", result);
      console.log("📦 result.success:", result?.success);
      console.log("📦 result.data:", result?.data);
      console.log("📦 result.data.posts:", result?.data?.posts);
      console.log("📦 result.data.posts length:", result?.data?.posts?.length);
      
      // El backend retorna: { success: true, data: { posts: [...], total: ... } }
      if (!result || result.success === false) {
        const errorMsg = result?.error || "Error al cargar posts";
        console.error("❌ Error en respuesta:", errorMsg);
        throw new Error(errorMsg);
      }
      
      // Acceder a result.data para obtener el objeto con posts
      if (result.data && typeof result.data === 'object' && 'posts' in result.data) {
        console.log("✅ Posts encontrados:", result.data.posts.length);
        return result.data as BlogResponse;
      }
      
      // Si el formato es diferente, intentar acceder directamente
      if (Array.isArray(result.data)) {
        console.log("⚠️ Formato inesperado: result.data es un array directo");
        return {
          posts: result.data as BlogPost[],
          total: result.data.length,
          page: 1,
          limit: filters?.limit || 50,
          totalPages: 1,
        };
      }
      
      console.error("❌ Formato de respuesta inesperado:", result);
      return {
        posts: [],
        total: 0,
        page: 1,
        limit: filters?.limit || 50,
        totalPages: 0,
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutos para admin (más fresco)
  });
}

// Obtener artículo individual por slug
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

// Obtener artículo individual por ID (para admin)
export function useBlogPostById(id: string) {
  return useQuery({
    queryKey: ["blog-post-by-id", id],
    queryFn: async () => {
      try {
        // Intentar usar el endpoint estándar GET /api/blog/posts/:id
        // Si el backend no lo soporta, intentar obtener desde la lista de posts admin
        const { data } = await apiClient.get(`/blog/posts/${id}`);
        const response = data as BlogPostResponse;
        
        // Si la respuesta tiene el formato esperado
        if (response.data) {
          return response.data;
        }
        
        // Si el formato es diferente, intentar acceder directamente
        if (response.success && (response as any).data) {
          return (response as any).data;
        }
        
        throw new Error("Formato de respuesta inesperado");
      } catch (error: any) {
        // Si el endpoint por ID no existe, intentar obtener desde la lista
        if (error?.response?.status === 404) {
          console.log("⚠️ Endpoint /blog/posts/:id no encontrado, intentando obtener desde lista...");
          
          try {
            // Obtener todos los posts y filtrar por ID
            const { data } = await apiClient.get(`/blog/posts?all=true&limit=1000`);
            const result = data as BlogPostsResponse;
            
            if (result.data?.posts) {
              const post = result.data.posts.find((p) => p.id === id);
              if (post) {
                // Necesitamos obtener el contenido completo, intentar por slug
                if (post.slug) {
                  const { data: fullPost } = await apiClient.get(`/blog/posts/${post.slug}`);
                  const fullResponse = fullPost as BlogPostResponse;
                  return fullResponse.data;
                }
              }
            }
            
            throw new Error("Artículo no encontrado en la lista");
          } catch (fallbackError: any) {
            console.error("❌ Error al obtener post desde lista:", fallbackError);
            throw new Error("Artículo no encontrado");
          }
        }
        
        console.error("❌ Error al obtener post por ID:", error);
        throw new Error(error?.response?.data?.error || "Error al cargar artículo");
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: !!id,
    retry: false,
  });
}

// Obtener categorías (público - solo con posts publicados)
export function useBlogCategories() {
  return useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/blog/categories");
        const result = response.data;
        
        if (!result || result.success === false) {
          const errorMsg = result?.error || "Error al cargar categorías";
          throw new Error(errorMsg);
        }
        
        if (Array.isArray(result.data)) {
          return result.data as BlogCategory[];
        }
        
        return [];
      } catch (error: any) {
        console.error("❌ Error al obtener categorías:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}

// Obtener TODAS las categorías (admin - incluye las sin posts)
export function useBlogCategoriesAdmin() {
  return useQuery({
    queryKey: ["blog-categories-admin"],
    queryFn: async () => {
      try {
        // Usar parámetro ?all=true para obtener todas las categorías
        const response = await apiClient.get("/blog/categories?all=true");
        const result = response.data;
        
        if (!result || result.success === false) {
          const errorMsg = result?.error || "Error al cargar categorías";
          throw new Error(errorMsg);
        }
        
        // Acceder a result.data para obtener el array de categorías
        if (Array.isArray(result.data)) {
          return result.data as BlogCategory[];
        }
        
        return [];
      } catch (error: any) {
        console.error("❌ Error al obtener categorías (admin):", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos para admin
    retry: 1,
  });
}

// Obtener tags (público - solo con posts publicados)
export function useBlogTags() {
  return useQuery({
    queryKey: ["blog-tags"],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/blog/tags");
        const result = response.data;
        
        if (!result || result.success === false) {
          const errorMsg = result?.error || "Error al cargar tags";
          throw new Error(errorMsg);
        }
        
        if (Array.isArray(result.data)) {
          return result.data as BlogTag[];
        }
        
        return [];
      } catch (error: any) {
        console.error("❌ Error al obtener tags:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
    retry: 1,
  });
}

// Obtener TODOS los tags (admin - incluye los sin posts)
export function useBlogTagsAdmin() {
  return useQuery({
    queryKey: ["blog-tags-admin"],
    queryFn: async () => {
      try {
        // Usar parámetro ?all=true para obtener todos los tags
        const response = await apiClient.get("/blog/tags?all=true");
        const result = response.data;
        
        if (!result || result.success === false) {
          const errorMsg = result?.error || "Error al cargar tags";
          throw new Error(errorMsg);
        }
        
        // Acceder a result.data para obtener el array de tags
        if (Array.isArray(result.data)) {
          return result.data as BlogTag[];
        }
        
        return [];
      } catch (error: any) {
        console.error("❌ Error al obtener tags (admin):", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos para admin
    retry: 1,
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

