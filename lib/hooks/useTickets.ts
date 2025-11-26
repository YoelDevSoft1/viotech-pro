import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";
import { useOrg } from "@/lib/useOrg";

export type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  impacto?: string | null;
  urgencia?: string | null;
  categoria?: string | null;
  slaObjetivo?: string | null;
  slaVenceEn?: string | null;
  slaAtendidoEn?: string | null;
  etiquetas?: any[];
  createdAt: string;
  comentarios?: any[];
  usuario?: { nombre?: string; email?: string };
  organizationId?: string;
  projectId?: string;
  asignadoA?: string | null;
  attachments?: any[];
};

type TicketFilters = {
  estado?: string;
  prioridad?: string;
  projectId?: string;
  impacto?: string;
  urgencia?: string;
  categoria?: string;
  organizationId?: string;
  asignadoA?: string;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export function useTickets(filters: TicketFilters = {}) {
  const { orgId } = useOrg();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number }>({
    page: filters.page || 1,
    limit: filters.limit || 20,
    total: 0,
    totalPages: 0,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/tickets",
        query: {
          organizationId: filters.organizationId || orgId || undefined,
          estado: filters.estado || undefined,
          prioridad: filters.prioridad || undefined,
          projectId: filters.projectId || undefined,
          impacto: filters.impacto || undefined,
          urgencia: filters.urgencia || undefined,
          categoria: filters.categoria || undefined,
          asignadoA: filters.asignadoA || undefined,
          sort: filters.sort || undefined,
          order: filters.order || undefined,
          page: filters.page || 1,
          limit: filters.limit || 20,
        },
      });
      const data = payload?.data?.tickets || payload?.data || [];
      const pag = payload?.data?.pagination || payload?.pagination;
      setTickets(
        Array.isArray(data)
          ? data.map((t: any) => ({
              id: String(t.id),
              titulo: t.titulo || "Sin título",
              descripcion: t.descripcion || null,
              estado: t.estado || "abierto",
              prioridad: t.prioridad || "media",
              impacto: t.impacto || null,
              urgencia: t.urgencia || null,
              categoria: t.categoria || null,
              slaObjetivo: t.slaObjetivo || t.sla_objetivo || null,
              slaVenceEn: t.slaVenceEn || t.sla_vence_en || null,
              slaAtendidoEn: t.slaAtendidoEn || t.sla_atendido_en || null,
              etiquetas: Array.isArray(t.etiquetas) ? t.etiquetas : [],
              createdAt: t.createdAt || t.created_at || new Date().toISOString(),
              comentarios: t.comentarios || [],
              usuario: t.usuario || null,
              organizationId: t.organizationId || t.organization_id || "",
              projectId: t.projectId || t.project_id || "",
              asignadoA: t.asignadoA || t.asignado_a || null,
              attachments: t.attachments || t.adjuntos || [],
            }))
          : [],
      );
      if (pag) {
        setPagination({
          page: pag.page || filters.page || 1,
          limit: pag.limit || filters.limit || 20,
          total: pag.total || 0,
          totalPages: pag.totalPages || 0,
        });
      }
    } catch (err) {
      const msg = (err as ApiError).message || "Error al cargar tickets";
      setError(msg);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [
    orgId,
    filters.organizationId,
    filters.estado,
    filters.prioridad,
    filters.projectId,
    filters.impacto,
    filters.urgencia,
    filters.categoria,
    filters.asignadoA,
    filters.sort,
    filters.order,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, pagination, refresh: fetchTickets };
}
