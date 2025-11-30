// Tipos para el sistema de Gantt Charts

export interface GanttTask {
  id: string;
  ticketId: string;
  name: string;
  start: Date;
  end: Date;
  progress: number; // 0-100
  type: "task" | "milestone";
  dependencies?: string[]; // IDs de tareas de las que depende
  // Campos adicionales
  priority?: string;
  status?: string;
  assignedTo?: string;
  assignedToName?: string;
  description?: string;
  projectId?: string;
}

export interface GanttMilestone {
  id: string;
  projectId: string;
  title: string;
  date: Date;
  description?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface GanttProject {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface GanttData {
  project: GanttProject;
  tasks: GanttTask[];
  milestones: GanttMilestone[];
}

export interface GanttFilters {
  assignedTo?: string;
  priority?: string;
  status?: string;
  showMilestones?: boolean;
  showDependencies?: boolean;
}

export interface CriticalPathTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  isCritical: boolean;
  slack?: number; // Días de holgura
}

