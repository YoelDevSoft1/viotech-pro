// Tipos para el sistema de Gestión de Recursos

export interface Resource {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  avatar?: string | null;
  role: string;
  organizationId?: string;
  // Disponibilidad
  availability: ResourceAvailability;
  // Skills y certificaciones
  skills?: ResourceSkill[];
  certifications?: ResourceCertification[];
  // Carga de trabajo
  currentWorkload: number; // Porcentaje (0-100)
  maxWorkload: number; // Porcentaje (0-100)
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceAvailability {
  status: "available" | "busy" | "unavailable" | "on_leave";
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
  workingDays: number[]; // 0-6 (Domingo-Sábado)
  vacations?: Vacation[];
  customUnavailable?: CustomUnavailable[];
}

export interface Vacation {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  type: "vacation" | "sick_leave" | "personal" | "other";
  description?: string;
  approved: boolean;
  approvedBy?: string;
  createdAt?: string;
}

export interface CustomUnavailable {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  reason: string;
  createdAt?: string;
}

export interface ResourceSkill {
  id: string;
  name: string;
  category: string; // "programming", "design", "management", etc.
  level: "beginner" | "intermediate" | "advanced" | "expert";
  yearsOfExperience?: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface ResourceCertification {
  id: string;
  name: string;
  issuer: string; // "AWS", "Google", "Microsoft", etc.
  issueDate: string; // ISO date
  expiryDate?: string; // ISO date (opcional)
  credentialId?: string;
  credentialUrl?: string;
  verified: boolean;
}

export interface ResourceWorkload {
  resourceId: string;
  resourceName: string;
  period: {
    start: string; // ISO date
    end: string; // ISO date
  };
  // Carga por día
  dailyWorkload: Array<{
    date: string; // ISO date
    hours: number; // Horas asignadas
    tasks: string[]; // IDs de tareas
    utilization: number; // Porcentaje (0-100)
  }>;
  // Resumen
  totalHours: number;
  averageUtilization: number; // Porcentaje
  maxUtilization: number; // Porcentaje
  conflicts: WorkloadConflict[];
}

export interface WorkloadConflict {
  id: string;
  date: string; // ISO date
  type: "overallocation" | "double_booking" | "unavailable";
  severity: "warning" | "error";
  message: string;
  tasks: string[]; // IDs de tareas en conflicto
  suggestedResolution?: string;
}

export interface ResourceAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  resourceId: string;
  resourceName: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  estimatedHours: number;
  actualHours?: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceCalendarEvent {
  id: string;
  resourceId: string;
  resourceName: string;
  type: "task" | "vacation" | "unavailable" | "meeting";
  title: string;
  start: Date;
  end: Date;
  color?: string;
  taskId?: string;
  vacationId?: string;
  description?: string;
}

export interface ResourceFilters {
  organizationId?: string;
  role?: string;
  availability?: "available" | "busy" | "unavailable" | "on_leave";
  skill?: string;
  certification?: string;
  minWorkload?: number;
  maxWorkload?: number;
  search?: string;
}

