"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type {
  Resource,
  ResourceWorkload,
  ResourceAssignment,
  ResourceCalendarEvent,
  Vacation,
  ResourceSkill,
  ResourceCertification,
  ResourceFilters,
} from "@/lib/types/resources";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from "date-fns";

/**
 * Hook para obtener todos los recursos
 */
export function useResources(filters?: ResourceFilters) {
  return useQuery<Resource[]>({
    queryKey: ["resources", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.organizationId) params.append("organizationId", filters.organizationId);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.availability) params.append("availability", filters.availability);
      if (filters?.skill) params.append("skill", filters.skill);
      if (filters?.search) params.append("search", filters.search);

      const { data } = await apiClient.get(`/resources?${params.toString()}`);
      const raw = data?.data || data || [];
      
      return (Array.isArray(raw) ? raw : []).map((r: any) => ({
        id: r.id,
        userId: r.userId || r.user_id,
        userName: r.userName || r.user_name || r.nombre || r.name,
        userEmail: r.userEmail || r.user_email || r.email,
        avatar: r.avatar,
        role: r.role || r.rol,
        organizationId: r.organizationId || r.organization_id,
        availability: r.availability || {
          status: "available",
          workingHours: { start: "09:00", end: "18:00", timezone: "America/Bogota" },
          workingDays: [1, 2, 3, 4, 5], // Lunes a Viernes
          vacations: [],
          customUnavailable: [],
        },
        skills: r.skills || [],
        certifications: r.certifications || [],
        currentWorkload: r.currentWorkload || r.current_workload || 0,
        maxWorkload: r.maxWorkload || r.max_workload || 100,
        createdAt: r.createdAt || r.created_at,
        updatedAt: r.updatedAt || r.updated_at,
      })) as Resource[];
    },
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener un recurso específico
 */
export function useResource(resourceId: string) {
  return useQuery<Resource>({
    queryKey: ["resources", resourceId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/resources/${resourceId}`);
      const raw = data?.data || data;
      
      return {
        id: raw.id,
        userId: raw.userId || raw.user_id,
        userName: raw.userName || raw.user_name || raw.nombre || raw.name,
        userEmail: raw.userEmail || raw.user_email || raw.email,
        avatar: raw.avatar,
        role: raw.role || raw.rol,
        organizationId: raw.organizationId || raw.organization_id,
        availability: raw.availability || {
          status: "available",
          workingHours: { start: "09:00", end: "18:00", timezone: "America/Bogota" },
          workingDays: [1, 2, 3, 4, 5],
          vacations: [],
          customUnavailable: [],
        },
        skills: raw.skills || [],
        certifications: raw.certifications || [],
        currentWorkload: raw.currentWorkload || raw.current_workload || 0,
        maxWorkload: raw.maxWorkload || raw.max_workload || 100,
        createdAt: raw.createdAt || raw.created_at,
        updatedAt: raw.updatedAt || raw.updated_at,
      } as Resource;
    },
    enabled: !!resourceId,
    staleTime: 60000,
  });
}

/**
 * Hook para obtener carga de trabajo de un recurso
 */
export function useResourceWorkload(
  resourceId: string,
  startDate: Date,
  endDate: Date
) {
  return useQuery<ResourceWorkload>({
    queryKey: ["resources", resourceId, "workload", startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      const { data } = await apiClient.get(
        `/resources/${resourceId}/workload?${params.toString()}`
      );
      const raw = data?.data || data;

      return {
        resourceId: raw.resourceId || raw.resource_id,
        resourceName: raw.resourceName || raw.resource_name,
        period: {
          start: raw.period?.start || raw.start_date,
          end: raw.period?.end || raw.end_date,
        },
        dailyWorkload: (raw.dailyWorkload || raw.daily_workload || []).map((day: any) => ({
          date: day.date,
          hours: day.hours || 0,
          tasks: day.tasks || [],
          utilization: day.utilization || 0,
        })),
        totalHours: raw.totalHours || raw.total_hours || 0,
        averageUtilization: raw.averageUtilization || raw.average_utilization || 0,
        maxUtilization: raw.maxUtilization || raw.max_utilization || 0,
        conflicts: (raw.conflicts || []).map((conflict: any) => ({
          id: conflict.id,
          date: conflict.date,
          type: conflict.type,
          severity: conflict.severity,
          message: conflict.message,
          tasks: conflict.tasks || [],
          suggestedResolution: conflict.suggestedResolution || conflict.suggested_resolution,
        })),
      } as ResourceWorkload;
    },
    enabled: !!resourceId,
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para obtener calendario de recursos
 */
export function useResourceCalendar(
  resourceIds: string[],
  startDate: Date,
  endDate: Date
) {
  return useQuery<ResourceCalendarEvent[]>({
    queryKey: ["resources", "calendar", resourceIds, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        resourceIds: resourceIds.join(","),
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });

      const { data } = await apiClient.get(
        `/resources/calendar?${params.toString()}`
      );
      const raw = data?.data || data || [];

      return (Array.isArray(raw) ? raw : []).map((event: any) => ({
        id: event.id,
        resourceId: event.resourceId || event.resource_id,
        resourceName: event.resourceName || event.resource_name,
        type: event.type,
        title: event.title,
        start: new Date(event.start || event.startDate),
        end: new Date(event.end || event.endDate),
        color: event.color,
        taskId: event.taskId || event.task_id,
        vacationId: event.vacationId || event.vacation_id,
        description: event.description,
      })) as ResourceCalendarEvent[];
    },
    enabled: resourceIds.length > 0,
    staleTime: 30000,
  });
}

/**
 * Hook para crear una vacación
 */
export function useCreateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      vacation,
    }: {
      resourceId: string;
      vacation: {
        startDate: string;
        endDate: string;
        type: Vacation["type"];
        description?: string;
      };
    }) => {
      const { data } = await apiClient.post(`/resources/${resourceId}/vacations`, vacation);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources", "calendar"] });
    },
  });
}

/**
 * Hook para actualizar una vacación
 */
export function useUpdateVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      vacationId,
      vacation,
    }: {
      resourceId: string;
      vacationId: string;
      vacation: Partial<Vacation>;
    }) => {
      const { data } = await apiClient.put(
        `/resources/${resourceId}/vacations/${vacationId}`,
        vacation
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources", "calendar"] });
    },
  });
}

/**
 * Hook para eliminar una vacación
 */
export function useDeleteVacation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      vacationId,
    }: {
      resourceId: string;
      vacationId: string;
    }) => {
      const { data } = await apiClient.delete(
        `/resources/${resourceId}/vacations/${vacationId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources", "calendar"] });
    },
  });
}

/**
 * Hook para agregar un skill a un recurso
 */
export function useAddResourceSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      skill,
    }: {
      resourceId: string;
      skill: Omit<ResourceSkill, "id" | "verified" | "verifiedBy" | "verifiedAt">;
    }) => {
      const { data } = await apiClient.post(`/resources/${resourceId}/skills`, skill);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

/**
 * Hook para agregar una certificación a un recurso
 */
export function useAddResourceCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      certification,
    }: {
      resourceId: string;
      certification: Omit<ResourceCertification, "id" | "verified">;
    }) => {
      const { data } = await apiClient.post(
        `/resources/${resourceId}/certifications`,
        certification
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

/**
 * Hook para actualizar disponibilidad de un recurso
 */
export function useUpdateResourceAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      resourceId,
      availability,
    }: {
      resourceId: string;
      availability: Partial<Resource["availability"]>;
    }) => {
      const { data } = await apiClient.put(
        `/resources/${resourceId}/availability`,
        availability
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["resources", variables.resourceId] });
      queryClient.invalidateQueries({ queryKey: ["resources", "calendar"] });
    },
  });
}

/**
 * Hook para obtener el usuario actual
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get("/auth/me");
      const raw = data?.data || data;
      const user = raw?.user || raw;
      return {
        id: user?.id,
        nombre: user?.nombre || user?.name,
        email: user?.email,
        avatar: user?.avatar,
        rol: user?.rol || user?.role,
        organizationId: user?.organizationId || user?.organization_id,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false,
  });
}

/**
 * Hook para obtener organizaciones
 */
export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/organizations");
      const raw = data?.data || data || [];
      return Array.isArray(raw) ? raw : Array.isArray(raw?.organizations) ? raw.organizations : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener proyectos
 */
export function useProjects(organizationId?: string) {
  return useQuery({
    queryKey: ["projects", organizationId],
    queryFn: async () => {
      const params = organizationId ? { organizationId } : {};
      const { data } = await apiClient.get("/projects", { params });
      const raw = data?.data || data || [];
      return Array.isArray(raw) ? raw : Array.isArray(raw?.projects) ? raw.projects : [];
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
}
