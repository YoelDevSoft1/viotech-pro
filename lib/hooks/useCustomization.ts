"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  UserPreferences,
  SavedView,
  OrganizationBranding,
  KeyboardShortcut,
} from "@/lib/types/customization";

/**
 * Hook para obtener preferencias del usuario
 */
export function useUserPreferences() {
  return useQuery<UserPreferences>({
    queryKey: ["user", "preferences"],
    queryFn: async () => {
      const { data } = await apiClient.get("/user/preferences");
      const raw = data?.data || data;

      return {
        id: raw.id,
        userId: raw.userId || raw.user_id,
        theme: raw.theme || "system",
        language: raw.language || "es",
        timezone: raw.timezone || "America/Bogota",
        dateFormat: raw.dateFormat || raw.date_format || "DD/MM/YYYY",
        timeFormat: raw.timeFormat || raw.time_format || "24h",
        notifications: {
          email: raw.notifications?.email !== false,
          push: raw.notifications?.push || false,
          inApp: raw.notifications?.inApp !== false,
          digest: raw.notifications?.digest || false,
        },
        dashboard: {
          layout: raw.dashboard?.layout || {
            columns: 3,
            rows: 4,
            gap: 4,
            widgetPositions: [],
          },
          widgets: (raw.dashboard?.widgets || []).map((w: any) => ({
            id: w.id,
            type: w.type,
            title: w.title,
            config: w.config || {},
            visible: w.visible !== false,
            order: w.order || 0,
          })),
        },
        shortcuts: raw.shortcuts || {},
        views: (raw.views || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          filters: v.filters || {},
          columns: v.columns || [],
          sortBy: v.sortBy || v.sort_by,
          sortOrder: v.sortOrder || v.sort_order,
          pageSize: v.pageSize || v.page_size,
          createdAt: v.createdAt || v.created_at,
          updatedAt: v.updatedAt || v.updated_at,
        })),
        createdAt: raw.createdAt || raw.created_at,
        updatedAt: raw.updatedAt || raw.updated_at,
      } as UserPreferences;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para actualizar preferencias del usuario
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>) => {
      const { data } = await apiClient.put("/user/preferences", preferences);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

/**
 * Hook para obtener branding de la organización
 */
export function useOrganizationBranding(organizationId?: string) {
  return useQuery<OrganizationBranding | null>({
    queryKey: ["organization", organizationId, "branding"],
    queryFn: async () => {
      if (!organizationId) return null;
      const { data } = await apiClient.get(`/organizations/${organizationId}/branding`);
      const raw = data?.data || data;

      if (!raw) return null;

      return {
        id: raw.id,
        organizationId: raw.organizationId || raw.organization_id,
        logo: raw.logo,
        favicon: raw.favicon,
        primaryColor: raw.primaryColor || raw.primary_color,
        secondaryColor: raw.secondaryColor || raw.secondary_color,
        accentColor: raw.accentColor || raw.accent_color,
        fontFamily: raw.fontFamily || raw.font_family,
        customCss: raw.customCss || raw.custom_css,
        enabled: raw.enabled !== false,
        createdAt: raw.createdAt || raw.created_at,
        updatedAt: raw.updatedAt || raw.updated_at,
      } as OrganizationBranding;
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para guardar una vista
 */
export function useSaveView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      viewId,
      view,
    }: {
      viewId?: string;
      view: Omit<SavedView, "id" | "createdAt" | "updatedAt">;
    }) => {
      if (viewId) {
        const { data } = await apiClient.put(`/user/views/${viewId}`, view);
        return data;
      } else {
        const { data } = await apiClient.post("/user/views", view);
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

/**
 * Hook para eliminar una vista guardada
 */
export function useDeleteView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (viewId: string) => {
      const { data } = await apiClient.delete(`/user/views/${viewId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "preferences"] });
    },
  });
}

/**
 * Hook para obtener shortcuts de teclado
 */
export function useKeyboardShortcuts() {
  return useQuery<KeyboardShortcut[]>({
    queryKey: ["keyboard", "shortcuts"],
    queryFn: async () => {
      const { data } = await apiClient.get("/user/shortcuts");
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((s: any) => ({
        id: s.id,
        key: s.key,
        modifiers: s.modifiers || [],
        action: s.action,
        description: s.description,
        category: s.category,
        enabled: s.enabled !== false,
      })) as KeyboardShortcut[];
    },
    staleTime: 1000 * 60 * 15, // 15 minutos
  });
}

/**
 * Hook para actualizar shortcuts de teclado
 */
export function useUpdateKeyboardShortcuts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shortcuts: KeyboardShortcut[]) => {
      const { data } = await apiClient.put("/user/shortcuts", { shortcuts });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyboard", "shortcuts"] });
    },
  });
}

