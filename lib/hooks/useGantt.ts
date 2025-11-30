"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { GanttData, GanttTask, GanttMilestone } from "@/lib/types/gantt";

/**
 * Hook para obtener datos de Gantt de un proyecto
 */
export function useGanttData(projectId: string) {
  return useQuery<GanttData>({
    queryKey: ["gantt", projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/projects/${projectId}/gantt`);
      const raw = data?.data || data;
      
      // Transformar fechas de string a Date
      return {
        project: {
          id: raw.project.id,
          name: raw.project.nombre || raw.project.name,
          startDate: new Date(raw.project.startDate || raw.project.start_date),
          endDate: new Date(raw.project.endDate || raw.project.end_date),
        },
        tasks: (raw.tasks || []).map((task: any) => ({
          id: task.id,
          ticketId: task.ticketId || task.ticket_id,
          name: task.title || task.name,
          start: new Date(task.startDate || task.start_date || task.createdAt),
          end: new Date(task.endDate || task.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          progress: task.progress || 0,
          type: task.isMilestone ? "milestone" : "task",
          dependencies: task.dependencies || [],
          priority: task.priority,
          status: task.status,
          assignedTo: task.assignedTo || task.assigned_to,
          assignedToName: task.assignedToName || task.assigned_to_name,
          description: task.description,
          projectId: task.projectId || task.project_id,
          // Campos de ruta crítica del backend
          isCritical: task.isCritical || false,
          slack: task.slack || 0,
        })) as GanttTask[],
        milestones: (raw.milestones || []).map((milestone: any) => ({
          id: milestone.id,
          projectId: milestone.projectId || milestone.project_id,
          title: milestone.title,
          date: new Date(milestone.date),
          description: milestone.description,
          createdBy: milestone.createdBy || milestone.created_by,
          createdAt: milestone.createdAt || milestone.created_at,
        })) as GanttMilestone[],
        criticalPath: raw.criticalPath || [],
      };
    },
    enabled: !!projectId,
    staleTime: 30000, // 30 segundos
  });
}

/**
 * Hook para actualizar datos de Gantt de un ticket
 */
export function useUpdateGanttTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ticketId,
      data,
    }: {
      ticketId: string;
      data: {
        startDate?: Date;
        endDate?: Date;
        progress?: number;
        dependencies?: string[];
      };
    }) => {
      const { data: response } = await apiClient.put(`/tickets/${ticketId}/gantt`, {
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        progress: data.progress,
        dependencies: data.dependencies,
      });
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["gantt"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}

/**
 * Hook para crear un milestone
 */
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestone,
    }: {
      projectId: string;
      milestone: {
        title: string;
        date: Date;
        description?: string;
      };
    }) => {
      const { data } = await apiClient.post(`/projects/${projectId}/milestones`, {
        title: milestone.title,
        date: milestone.date.toISOString(),
        description: milestone.description,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gantt", variables.projectId] });
    },
  });
}

/**
 * Hook para actualizar un milestone
 */
export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
      milestone,
    }: {
      projectId: string;
      milestoneId: string;
      milestone: {
        title?: string;
        date?: Date;
        description?: string;
      };
    }) => {
      const { data } = await apiClient.put(
        `/projects/${projectId}/milestones/${milestoneId}`,
        {
          title: milestone.title,
          date: milestone.date?.toISOString(),
          description: milestone.description,
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gantt", variables.projectId] });
    },
  });
}

/**
 * Hook para eliminar un milestone
 */
export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      milestoneId,
    }: {
      projectId: string;
      milestoneId: string;
    }) => {
      const { data } = await apiClient.delete(
        `/projects/${projectId}/milestones/${milestoneId}`
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gantt", variables.projectId] });
    },
  });
}

