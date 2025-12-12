// lib/api/resources.ts
// API Client centralizado para el módulo de recursos

import { apiClient } from "@/lib/apiClient";
import type {
  Resource,
  ResourceWorkload,
  ResourceCalendarEvent,
  Vacation,
  ResourceSkill,
  ResourceCertification,
  ResourceFilters,
  ResourceAvailability,
} from "@/lib/types/resources";

/**
 * Obtener lista de recursos con filtros opcionales
 */
export async function getResources(filters?: ResourceFilters): Promise<Resource[]> {
  const params = new URLSearchParams();
  
  if (filters?.organizationId) params.append("organizationId", filters.organizationId);
  if (filters?.role) params.append("role", filters.role);
  if (filters?.availability) params.append("availability", filters.availability);
  if (filters?.skill) params.append("skill", filters.skill);
  if (filters?.search) params.append("search", filters.search);

  const { data } = await apiClient.get(`/resources?${params.toString()}`);
  const raw = data?.data || data || [];
  
  return (Array.isArray(raw) ? raw : []).map(normalizeResource);
}

/**
 * Obtener un recurso específico por ID
 */
export async function getResource(resourceId: string): Promise<Resource> {
  const { data } = await apiClient.get(`/resources/${resourceId}`);
  const raw = data?.data || data;
  return normalizeResource(raw);
}

/**
 * Obtener carga de trabajo de un recurso en un período
 */
export async function getResourceWorkload(
  resourceId: string,
  startDate: string,
  endDate: string
): Promise<ResourceWorkload> {
  const params = new URLSearchParams({ startDate, endDate });
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
  };
}

/**
 * Obtener calendario de múltiples recursos
 */
export async function getResourcesCalendar(
  resourceIds: string[],
  startDate: string,
  endDate: string
): Promise<ResourceCalendarEvent[]> {
  const params = new URLSearchParams({
    resourceIds: resourceIds.join(","),
    startDate,
    endDate,
  });

  const { data } = await apiClient.get(`/resources/calendar?${params.toString()}`);
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
  }));
}

/**
 * Crear una vacación para un recurso
 */
export async function createVacation(
  resourceId: string,
  vacation: {
    startDate: string;
    endDate: string;
    type: Vacation["type"];
    description?: string;
  }
): Promise<Vacation> {
  const { data } = await apiClient.post(`/resources/${resourceId}/vacations`, vacation);
  return data?.data || data;
}

/**
 * Actualizar una vacación existente
 */
export async function updateVacation(
  resourceId: string,
  vacationId: string,
  vacation: Partial<Vacation>
): Promise<Vacation> {
  const { data } = await apiClient.put(
    `/resources/${resourceId}/vacations/${vacationId}`,
    vacation
  );
  return data?.data || data;
}

/**
 * Eliminar una vacación
 */
export async function deleteVacation(
  resourceId: string,
  vacationId: string
): Promise<void> {
  await apiClient.delete(`/resources/${resourceId}/vacations/${vacationId}`);
}

/**
 * Agregar un skill a un recurso
 */
export async function addSkill(
  resourceId: string,
  skill: Omit<ResourceSkill, "id" | "verified" | "verifiedBy" | "verifiedAt">
): Promise<ResourceSkill> {
  const { data } = await apiClient.post(`/resources/${resourceId}/skills`, skill);
  return data?.data || data;
}

/**
 * Agregar una certificación a un recurso
 */
export async function addCertification(
  resourceId: string,
  certification: Omit<ResourceCertification, "id" | "verified">
): Promise<ResourceCertification> {
  const { data } = await apiClient.post(
    `/resources/${resourceId}/certifications`,
    certification
  );
  return data?.data || data;
}

/**
 * Actualizar disponibilidad de un recurso
 */
export async function updateAvailability(
  resourceId: string,
  availability: Partial<ResourceAvailability>
): Promise<ResourceAvailability> {
  const { data } = await apiClient.put(
    `/resources/${resourceId}/availability`,
    availability
  );
  return data?.data || data;
}

/**
 * Helper para normalizar datos de recurso desde el backend
 */
function normalizeResource(raw: any): Resource {
  return {
    id: raw.id,
    userId: raw.userId || raw.user_id,
    userName: raw.userName || raw.user_name || raw.nombre || raw.name || "",
    userEmail: raw.userEmail || raw.user_email || raw.email || "",
    avatar: raw.avatar || null,
    role: raw.role || raw.rol || "",
    organizationId: raw.organizationId || raw.organization_id,
    availability: raw.availability || {
      status: "available" as const,
      workingHours: { start: "09:00", end: "18:00", timezone: "America/Bogota" },
      workingDays: [1, 2, 3, 4, 5],
      vacations: [],
      customUnavailable: [],
    },
    skills: raw.skills || [],
    certifications: raw.certifications || [],
    // Validar currentWorkload
    currentWorkload:
      typeof raw.currentWorkload === "number" && raw.currentWorkload >= 0
        ? raw.currentWorkload
        : typeof raw.current_workload === "number" && raw.current_workload >= 0
        ? raw.current_workload
        : 0,
    maxWorkload:
      typeof raw.maxWorkload === "number" && raw.maxWorkload > 0
        ? raw.maxWorkload
        : typeof raw.max_workload === "number" && raw.max_workload > 0
        ? raw.max_workload
        : 100,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}

