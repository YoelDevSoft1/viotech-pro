// Tipos para el sistema de Reportes Ejecutivos

export interface KPI {
  id: string;
  name: string;
  value: number;
  unit?: string; // "%", "h", "días", etc.
  target?: number; // Valor objetivo
  trend?: "up" | "down" | "stable";
  trendValue?: number; // Cambio porcentual o absoluto
  period: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  category: "projects" | "tickets" | "resources" | "satisfaction" | "financial";
}

export interface ReportData {
  id: string;
  title: string;
  type: "executive" | "operational" | "financial" | "custom";
  period: {
    start: string; // ISO date
    end: string; // ISO date
  };
  generatedAt: string; // ISO date
  generatedBy: string; // User ID
  kpis: KPI[];
  charts: ChartData[];
  summary: string;
  organizationId?: string;
}

export interface ChartData {
  id: string;
  type: "line" | "bar" | "area" | "pie" | "donut";
  title: string;
  data: ChartDataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  series?: ChartSeries[];
}

export interface ChartDataPoint {
  x: string | number; // Fecha o categoría
  y: number; // Valor
  label?: string;
  [key: string]: any; // Para múltiples series
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface HistoricalComparison {
  current: {
    period: { start: string; end: string };
    value: number;
  };
  previous: {
    period: { start: string; end: string };
    value: number;
  };
  change: number; // Porcentaje de cambio
  changeType: "increase" | "decrease" | "stable";
}

export interface ProjectMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  averageDeliveryTime: number; // Días
  onTimeDeliveryRate: number; // Porcentaje
  averageProjectDuration: number; // Días
  projectsByStatus: Record<string, number>;
  projectsByType: Record<string, number>;
}

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // Horas
  averageResponseTime: number; // Horas
  slaComplianceRate: number; // Porcentaje
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
}

export interface ResourceMetrics {
  totalResources: number;
  activeResources: number;
  averageUtilization: number; // Porcentaje
  overallocationCount: number;
  resourcesOnLeave: number;
  skillsDistribution: Record<string, number>;
  certificationsExpiring: number;
}

export interface SatisfactionMetrics {
  nps: number; // Net Promoter Score (-100 a 100)
  averageRating: number; // 1-5
  responseRate: number; // Porcentaje
  satisfactionByCategory: Record<string, number>;
  feedbackCount: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number; // Porcentaje
  revenueByService: Record<string, number>;
  costsByCategory: Record<string, number>;
}

export interface ExecutiveDashboard {
  period: {
    start: string;
    end: string;
  };
  projectMetrics: ProjectMetrics;
  ticketMetrics: TicketMetrics;
  resourceMetrics: ResourceMetrics;
  satisfactionMetrics: SatisfactionMetrics;
  financialMetrics?: FinancialMetrics;
  kpis: KPI[];
  trends: ChartData[];
  comparisons: HistoricalComparison[];
}

export interface AutomatedReport {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  recipients: string[]; // User IDs o emails
  format: "pdf" | "excel" | "both";
  schedule: {
    time: string; // HH:mm
    timezone: string;
    dayOfWeek?: number; // 0-6 para reportes semanales
    dayOfMonth?: number; // 1-31 para reportes mensuales
  };
  enabled: boolean;
  lastGenerated?: string;
  nextGeneration?: string;
  organizationId?: string;
}

export interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number; // 0-100
  timeframe: "7d" | "30d" | "90d" | "1y";
  factors: string[]; // Factores que influyen en la predicción
  recommendations?: string[];
}

export interface ReportFilters {
  organizationId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  period?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  category?: string;
}

