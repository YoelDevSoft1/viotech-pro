/**
 * Hooks de React Query para el Marketplace de Servicios
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/auth";
import type {
  ServicePlanExtended,
  ServiceCategory,
  ServiceTag,
  ServiceCatalogFilters,
  ServiceCatalogResponse,
  ServiceReviewsResponse,
  ServiceComparison,
  CreateReviewData,
} from "@/lib/types/services";

/**
 * Hook para obtener el catálogo de servicios con filtros
 */
export function useServiceCatalog(filters?: ServiceCatalogFilters) {
  return useQuery<ServiceCatalogResponse>({
    queryKey: ["service-catalog", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.category) params.append("category", filters.category);
      if (filters?.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append("tags", tag));
      }
      if (filters?.search) params.append("search", filters.search);
      if (filters?.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
      if (filters?.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
      if (filters?.rating !== undefined) params.append("rating", String(filters.rating));
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const { data } = await apiClient.get(`/services/catalog?${params.toString()}`);
      return data.data || data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para obtener un servicio por slug
 */
export function useServiceBySlug(slug: string) {
  return useQuery<ServicePlanExtended>({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/services/catalog/${slug}`);
      return data.data || data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para obtener categorías de servicios
 */
export function useServiceCategories(hierarchy: boolean = false) {
  return useQuery<ServiceCategory[]>({
    queryKey: ["service-categories", hierarchy],
    queryFn: async () => {
      const params = hierarchy ? "?hierarchy=true" : "";
      const { data } = await apiClient.get(`/services/categories${params}`);
      return data.data || data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener tags de servicios
 */
export function useServiceTags(includeCount: boolean = false) {
  return useQuery<ServiceTag[]>({
    queryKey: ["service-tags", includeCount],
    queryFn: async () => {
      const params = includeCount ? "?includeCount=true" : "";
      const { data } = await apiClient.get(`/services/tags${params}`);
      return data.data || data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener reviews de un servicio
 */
export function useServiceReviews(
  serviceId: string,
  options?: {
    page?: number;
    limit?: number;
    sortBy?: 'newest' | 'oldest' | 'rating' | 'helpful';
    rating?: number;
  }
) {
  return useQuery<ServiceReviewsResponse>({
    queryKey: ["service-reviews", serviceId, options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options?.page) params.append("page", String(options.page));
      if (options?.limit) params.append("limit", String(options.limit));
      if (options?.sortBy) params.append("sortBy", options.sortBy);
      if (options?.rating !== undefined) params.append("rating", String(options.rating));

      const { data } = await apiClient.get(`/services/${serviceId}/reviews?${params.toString()}`);
      return data.data || data;
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para crear un review
 */
export function useCreateServiceReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: CreateReviewData }) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await apiClient.post(
        `/services/${serviceId}/reviews`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data || response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["service-reviews", variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service", variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ["service-catalog"] });
    },
  });
}

/**
 * Hook para marcar un review como útil
 */
export function useMarkReviewHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId }: { reviewId: string }) => {
      const token = getAccessToken();
      if (!token) throw new Error("No autenticado");

      const response = await apiClient.post(
        `/services/reviews/${reviewId}/helpful`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.data || response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidar reviews (necesitamos el serviceId, pero lo podemos obtener del cache)
      queryClient.invalidateQueries({ queryKey: ["service-reviews"] });
    },
  });
}

/**
 * Hook para comparar servicios
 */
export function useCompareServices(serviceIds: string[]) {
  return useQuery<ServiceComparison>({
    queryKey: ["service-comparison", serviceIds],
    queryFn: async () => {
      const { data } = await apiClient.post("/services/compare", { serviceIds });
      return data.data || data;
    },
    enabled: serviceIds.length > 0 && serviceIds.length <= 4,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener recomendaciones
 */
export function useServiceRecommendations(userId?: string, limit: number = 6) {
  return useQuery<ServicePlanExtended[]>({
    queryKey: ["service-recommendations", userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      params.append("limit", String(limit));

      const { data } = await apiClient.get(`/services/recommendations?${params.toString()}`);
      return data.data || data;
    },
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

