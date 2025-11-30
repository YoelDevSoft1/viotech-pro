import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import type { KanbanTask, KanbanColumn, KanbanFilters } from "@/lib/types/kanban";
import type { Ticket } from "./useTickets";

// Columnas por defecto basadas en estados de tickets
// Alineado con backend: NUEVO, ABIERTO, EN_PROGRESO, EN_ESPERA, RESUELTO, CERRADO, REABIERTO
export const DEFAULT_KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: "nuevo",
    title: "Nuevo",
    status: "NUEVO",
    color: "bg-blue-500",
    order: 0,
  },
  {
    id: "abierto",
    title: "Abierto",
    status: "ABIERTO",
    color: "bg-cyan-500",
    order: 0.5,
  },
  {
    id: "en-progreso",
    title: "En Progreso",
    status: "EN_PROGRESO",
    color: "bg-yellow-500",
    order: 1,
  },
  {
    id: "en-espera",
    title: "En Espera",
    status: "EN_ESPERA",
    color: "bg-orange-500",
    order: 2,
  },
  {
    id: "resuelto",
    title: "Resuelto",
    status: "RESUELTO",
    color: "bg-green-500",
    order: 3,
  },
  {
    id: "cerrado",
    title: "Cerrado",
    status: "CERRADO",
    color: "bg-gray-500",
    order: 4,
  },
  {
    id: "reabierto",
    title: "Reabierto",
    status: "REABIERTO",
    color: "bg-purple-500",
    order: 1.5,
  },
];

// Mapeo de estados antiguos a nuevos (normalización)
function normalizeStatus(status: string): string {
  if (!status) return "NUEVO";
  
  const statusUpper = status.toUpperCase().trim();
  
  // Mapeo de estados antiguos a nuevos
  const statusMap: Record<string, string> = {
    "ABIERTO": "ABIERTO", // Mantener ABIERTO como está
    "EN_PROGRESO": "EN_PROGRESO",
    "EN PROGRESO": "EN_PROGRESO",
    "EN-PROGRESO": "EN_PROGRESO",
    "EN_ESPERA": "EN_ESPERA",
    "EN ESPERA": "EN_ESPERA",
    "EN-ESPERA": "EN_ESPERA",
    "ESPERA": "EN_ESPERA",
    "RESUELTO": "RESUELTO",
    "CERRADO": "CERRADO",
    "REABIERTO": "REABIERTO",
    "RE-ABIERTO": "REABIERTO",
    "NUEVO": "NUEVO",
  };

  // Si está en el mapeo, retornar el valor normalizado
  if (statusMap[statusUpper]) {
    return statusMap[statusUpper];
  }

  // Si no está en el mapeo, intentar mapear estados comunes
  if (statusUpper.includes("NUEVO") || statusUpper === "NEW") {
    return "NUEVO";
  }
  if (statusUpper.includes("ABIERTO") || statusUpper === "OPEN") {
    return "ABIERTO";
  }
  if (statusUpper.includes("PROGRESO") || statusUpper.includes("PROGRESS")) {
    return "EN_PROGRESO";
  }
  if (statusUpper.includes("ESPERA") || statusUpper.includes("WAIT") || statusUpper.includes("PENDING")) {
    return "EN_ESPERA";
  }
  if (statusUpper.includes("RESUELTO") || statusUpper.includes("RESOLVED")) {
    return "RESUELTO";
  }
  if (statusUpper.includes("CERRADO") || statusUpper.includes("CLOSED")) {
    return "CERRADO";
  }
  if (statusUpper.includes("REABIERTO") || statusUpper.includes("REOPEN")) {
    return "REABIERTO";
  }

  // Por defecto, retornar el estado en mayúsculas
  return statusUpper;
}

// Convertir Ticket a KanbanTask
function ticketToKanbanTask(ticket: Ticket): KanbanTask {
  return {
    id: ticket.id,
    title: ticket.titulo,
    description: ticket.descripcion,
    status: normalizeStatus(ticket.estado), // Normalizar el estado
    priority: ticket.prioridad,
    asignadoA: ticket.asignadoA,
    asignadoNombre: ticket.usuario?.nombre || undefined,
    projectId: ticket.projectId,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    categoria: ticket.categoria,
    impacto: ticket.impacto,
    urgencia: ticket.urgencia,
  };
}

// Hook para obtener tareas del Kanban (tickets de un proyecto)
export function useKanbanTasks(projectId: string, filters?: KanbanFilters) {
  return useQuery({
    queryKey: ["kanban-tasks", projectId, filters],
    queryFn: async (): Promise<KanbanTask[]> => {
      const params: any = {
        projectId,
        limit: 1000, // Obtener todos los tickets del proyecto
      };

      if (filters?.asignadoA) params.asignadoA = filters.asignadoA;
      if (filters?.prioridad) params.prioridad = filters.prioridad;
      if (filters?.categoria) params.categoria = filters.categoria;

      const { data } = await apiClient.get("/tickets", { params });
      const tickets = (data?.data?.tickets || data?.data || []) as Ticket[];
      
      // Log para depuración (temporal)
      if (tickets.length > 0) {
        console.log("📋 Tickets recibidos:", tickets.length);
        console.log("📋 Estados encontrados:", [...new Set(tickets.map(t => t.estado))]);
      }
      
      let tasks = tickets.map(ticketToKanbanTask);
      
      // Log para depuración (temporal)
      if (tasks.length > 0) {
        console.log("✅ Tareas normalizadas:", tasks.length);
        console.log("✅ Estados normalizados:", [...new Set(tasks.map(t => t.status))]);
      }

      // Aplicar filtro de búsqueda en el cliente si existe
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        tasks = tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(searchLower) ||
            task.description?.toLowerCase().includes(searchLower)
        );
      }

      return tasks;
    },
    enabled: !!projectId,
    staleTime: 1000 * 30, // 30 segundos
    retry: 1,
  });
}

// Hook para obtener columnas del Kanban (configurables)
export function useKanbanColumns(projectId?: string) {
  return useQuery({
    queryKey: ["kanban-columns", projectId],
    queryFn: async (): Promise<KanbanColumn[]> => {
      // Por ahora retornamos las columnas por defecto
      // En el futuro se pueden personalizar por proyecto
      return DEFAULT_KANBAN_COLUMNS;
    },
    staleTime: Infinity, // Las columnas no cambian frecuentemente
    initialData: DEFAULT_KANBAN_COLUMNS,
  });
}

// Hook para mover tarea entre columnas (actualizar estado)
export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      newStatus,
      projectId,
    }: {
      taskId: string;
      newStatus: string;
      projectId: string;
    }) => {
      const { data } = await apiClient.put(`/tickets/${taskId}`, {
        estado: newStatus,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Tarea movida correctamente");
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["kanban-tasks", variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || error?.message || "Error al mover tarea");
    },
  });
}

