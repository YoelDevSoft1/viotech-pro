/**
 * Tipos para el sistema de monitoreo de proyectos
 * VioTech Pro - Sistema de análisis de riesgo y alertas proactivas
 */

// ============================================
// TIPOS DE NIVEL DE RIESGO
// ============================================

export type RiskLevel = "low" | "medium" | "high" | "critical";

// ============================================
// ESTADO DEL MONITOREO
// ============================================

export interface MonitoringLastCheck {
  projectId: string;
  timestamp: string;
}

export interface MonitoringAlertHistory {
  projectId: string;
  lastAlert: string;
}

export interface MonitoringStatus {
  isMonitoring: boolean;
  lastCheck: MonitoringLastCheck[];
  alertHistory: MonitoringAlertHistory[];
  intervalMinutes?: number;
}

// ============================================
// ANÁLISIS DE RIESGO
// ============================================

export interface DelayRiskFactors {
  predictionMismatch: boolean;
  anomalies: number;
  progressDelay: boolean;
  lowVelocity: boolean;
}

export interface DelayRisk {
  riskScore: number; // 0-1
  riskLevel: RiskLevel;
  predictedDays: number | null;
  estimatedRemaining: number | null;
  confidence: number;
  factors: DelayRiskFactors;
}

export interface ProjectAnalysis {
  projectId: string;
  delayRisk: DelayRisk;
  anomalies: number;
  status: string;
}

// ============================================
// ANÁLISIS HISTÓRICO
// ============================================

export interface RiskAnalysisMetrics {
  avgProgress: number;
  overdueTasks: number;
  progressVelocity: number;
  completionRatio: number;
  blockageRatio: number;
  activeTasksCount?: number;
  completedTasksCount?: number;
  totalTasksCount?: number;
}

export interface RiskAnalysis {
  id: string;
  project_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  anomalies_count: number;
  metrics: RiskAnalysisMetrics;
  analysis_data: unknown;
  created_at: string;
}

export interface ProjectAnalysisHistory {
  projectId: string;
  analysis: RiskAnalysis[];
  count: number;
}

// ============================================
// ALERTAS DE PROYECTO
// ============================================

export interface ProjectAlertMetadata {
  projectId: string;
  projectName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  anomalies: string[];
  metrics: RiskAnalysisMetrics;
}

export interface ProjectAlert {
  id: string;
  type: "project_delay_risk";
  title: string;
  message: string;
  metadata: ProjectAlertMetadata;
  actionUrl: string;
  createdAt?: string;
}

// ============================================
// ROLES Y PERMISOS
// ============================================

export type UserRole = "admin" | "agente" | "cliente" | "agent" | "client";

export interface ProjectMonitorPermissions {
  canStartStop: boolean;
  canAnalyzeAll: boolean;
  canViewStatus: boolean;
  canAnalyzeProject: (projectId: string) => boolean;
}

// ============================================
// CONFIGURACIÓN DE RIESGO (UI)
// ============================================

export interface RiskConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: "check" | "info" | "alert" | "x";
  label: string;
}

export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  low: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: "check",
    label: "Bajo",
  },
  medium: {
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    icon: "info",
    label: "Medio",
  },
  high: {
    color: "text-orange-700",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    icon: "alert",
    label: "Alto",
  },
  critical: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    icon: "x",
    label: "Crítico",
  },
};

// ============================================
// HELPERS
// ============================================

/**
 * Normaliza el rol del usuario al formato español
 */
export function normalizeRole(role: UserRole): "admin" | "agente" | "cliente" {
  if (role === "client") return "cliente";
  if (role === "agent") return "agente";
  return role as "admin" | "agente" | "cliente";
}

/**
 * Verifica si el usuario tiene permisos de admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Obtiene los permisos del usuario según su rol
 */
export function getPermissions(role: UserRole): ProjectMonitorPermissions {
  const normalizedRole = normalizeRole(role);
  
  return {
    canStartStop: normalizedRole === "admin",
    canAnalyzeAll: normalizedRole === "admin",
    canViewStatus: true, // Todos los roles autenticados
    canAnalyzeProject: () => true, // El backend valida permisos específicos
  };
}
