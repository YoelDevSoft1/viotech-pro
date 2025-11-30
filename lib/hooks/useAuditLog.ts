"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { AuditLog, AuditLogFilters, AuditLogStats } from "@/lib/types/audit-log";

/**
 * Hook para obtener el historial de cambios (audit log)
 */
export function useAuditLog(filters?: AuditLogFilters) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-log", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.action) params.append("action", filters.action);
      if (filters?.entityType) params.append("entityType", filters.entityType);
      if (filters?.entityId) params.append("entityId", filters.entityId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);
      if (filters?.search) params.append("search", filters.search);

      const { data } = await apiClient.get(`/audit-log?${params.toString()}`);
      return (data?.data || data || []) as AuditLog[];
    },
    staleTime: 60000, // 1 minuto
  });
}

/**
 * Hook para obtener el historial de cambios de una entidad específica
 */
export function useEntityAuditLog(entityType: string, entityId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-log", entityType, entityId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/audit-log/${entityType}/${entityId}`);
      return (data?.data || data || []) as AuditLog[];
    },
    enabled: !!entityType && !!entityId,
    staleTime: 60000,
  });
}

/**
 * Hook para obtener estadísticas del audit log
 */
export function useAuditLogStats(filters?: AuditLogFilters) {
  return useQuery<AuditLogStats>({
    queryKey: ["audit-log", "stats", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const { data } = await apiClient.get(`/audit-log/stats?${params.toString()}`);
      return (data?.data || data || {
        total: 0,
        byAction: {},
        byEntityType: {},
        recentActivity: 0,
      }) as AuditLogStats;
    },
    staleTime: 300000, // 5 minutos
  });
}

