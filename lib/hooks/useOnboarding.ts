"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { getAccessToken } from "@/lib/auth";
import type {
  OnboardingProgress,
  OnboardingChecklist,
  OnboardingConfig,
  OnboardingTour,
} from "@/lib/types/onboarding";

/**
 * Hook para verificar si hay un token válido (reactivo)
 */
function useHasToken() {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      setHasToken(!!getAccessToken());
    };

    // Verificar al montar
    checkToken();

    // Escuchar cambios en el token (eventos personalizados o storage)
    const handleStorageChange = () => checkToken();
    const handleAuthChange = () => checkToken();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChanged", handleAuthChange);

    // Verificar periódicamente (por si acaso)
    const interval = setInterval(checkToken, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChanged", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  return hasToken;
}

/**
 * Hook para obtener el progreso de onboarding del usuario
 */
export function useOnboardingProgress() {
  const hasToken = useHasToken();
  
  return useQuery<OnboardingProgress>({
    queryKey: ["onboarding", "progress"],
    queryFn: async () => {
      const { data } = await apiClient.get("/onboarding/progress");
      const raw = data?.data || data;

      return {
        userId: raw.userId || raw.user_id,
        role: raw.role,
        toursCompleted: raw.toursCompleted || raw.tours_completed || [],
        checklistProgress: raw.checklistProgress || raw.checklist_progress || 0,
        currentTour: raw.currentTour || raw.current_tour,
        skippedTours: raw.skippedTours || raw.skipped_tours || [],
        lastActiveAt: raw.lastActiveAt || raw.last_active_at || new Date().toISOString(),
      } as OnboardingProgress;
    },
    enabled: hasToken, // Solo ejecutar si hay token
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener la checklist de onboarding
 */
export function useOnboardingChecklist() {
  const hasToken = useHasToken();
  
  return useQuery<OnboardingChecklist>({
    queryKey: ["onboarding", "checklist"],
    queryFn: async () => {
      const { data } = await apiClient.get("/onboarding/checklist");
      const raw = data?.data || data;

      return {
        id: raw.id,
        userId: raw.userId || raw.user_id,
        role: raw.role,
        items: (raw.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          completed: item.completed || false,
          actionUrl: item.actionUrl || item.action_url,
          actionLabel: item.actionLabel || item.action_label,
          category: item.category,
          required: item.required !== false,
          order: item.order || 0,
        })),
        completed: raw.completed || false,
        completedAt: raw.completedAt || raw.completed_at,
        progress: raw.progress || 0,
      } as OnboardingChecklist;
    },
    enabled: hasToken, // Solo ejecutar si hay token
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para marcar un item de checklist como completado
 */
export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post(`/onboarding/checklist/${itemId}/complete`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "checklist"] });
      queryClient.invalidateQueries({ queryKey: ["onboarding", "progress"] });
    },
  });
}

/**
 * Hook para obtener tours disponibles
 */
export function useOnboardingTours(role?: string) {
  const hasToken = useHasToken();
  
  return useQuery<OnboardingTour[]>({
    queryKey: ["onboarding", "tours", role],
    queryFn: async () => {
      const params = role ? { role } : {};
      const { data } = await apiClient.get("/onboarding/tours", { params });
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((tour: any) => ({
        id: tour.id,
        name: tour.name,
        description: tour.description,
        steps: tour.steps || [],
        role: tour.role,
        enabled: tour.enabled !== false,
      })) as OnboardingTour[];
    },
    enabled: hasToken, // Solo ejecutar si hay token
    staleTime: 1000 * 60 * 15, // 15 minutos (los tours no cambian frecuentemente)
  });
}

/**
 * Hook para marcar un tour como completado
 */
export function useCompleteTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tourId, skipped }: { tourId: string; skipped?: boolean }) => {
      const { data } = await apiClient.post(`/onboarding/tours/${tourId}/complete`, {
        skipped: skipped || false,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "progress"] });
    },
  });
}

/**
 * Hook para obtener configuración de onboarding
 */
export function useOnboardingConfig() {
  const hasToken = useHasToken();
  
  return useQuery<OnboardingConfig>({
    queryKey: ["onboarding", "config"],
    queryFn: async () => {
      const { data } = await apiClient.get("/onboarding/config");
      const raw = data?.data || data;

      return {
        userId: raw.userId || raw.user_id,
        role: raw.role,
        skipOnboarding: raw.skipOnboarding || raw.skip_onboarding || false,
        showTips: raw.showTips !== false,
        showChecklist: raw.showChecklist !== false,
        autoStartTour: raw.autoStartTour || raw.auto_start_tour,
      } as OnboardingConfig;
    },
    enabled: hasToken, // Solo ejecutar si hay token
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para actualizar configuración de onboarding
 */
export function useUpdateOnboardingConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: Partial<OnboardingConfig>) => {
      const { data } = await apiClient.put("/onboarding/config", config);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding", "config"] });
    },
  });
}

