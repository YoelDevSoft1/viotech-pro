// Tipos para el sistema Kanban

export type KanbanColumn = {
  id: string;
  title: string;
  status: string; // Estado que representa esta columna
  color?: string;
  order: number;
};

export type KanbanTask = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  asignadoA?: string | null;
  asignadoNombre?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Campos adicionales
  categoria?: string | null;
  impacto?: string | null;
  urgencia?: string | null;
};

export type KanbanBoard = {
  columns: KanbanColumn[];
  tasks: KanbanTask[];
};

export type KanbanFilters = {
  asignadoA?: string;
  prioridad?: string;
  categoria?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
};

