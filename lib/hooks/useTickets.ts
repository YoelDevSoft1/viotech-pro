import { useCallback, useEffect, useState } from "react";
import { apiFetch, type ApiError } from "@/lib/apiClient";
import { useOrg } from "@/lib/useOrg";

export type Ticket = {
  id: string;
  titulo: string;
  descripcion?: string | null;
  estado: string;
  prioridad: string;
  slaObjetivo?: string | null;
  etiquetas?: any;
  createdAt: string;
  comentarios?: any[];
  usuario?: { nombre?: string; email?: string };
  organizationId?: string;
  projectId?: string;
};

type TicketFilters = {
  estado?: string;
  prioridad?: string;
  projectId?: string;
};

export function useTickets(filters: TicketFilters = {}) {
  const { orgId } = useOrg();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await apiFetch<any>({
        path: "/tickets",
        query: {
          organizationId: orgId || undefined,
          estado: filters.estado || undefined,
          prioridad: filters.prioridad || undefined,
          projectId: filters.projectId || undefined,
        },
      });
      const data = payload?.data?.tickets || payload?.data || [];
      setTickets(
        Array.isArray(data)
          ? data.map((t: any) => ({
              id: String(t.id),
              titulo: t.titulo || "Sin título",
              descripcion: t.descripcion || null,
              estado: t.estado || "abierto",
              prioridad: t.prioridad || "media",
              slaObjetivo: t.slaObjetivo || t.sla_objetivo || null,
              etiquetas: t.etiquetas || [],
              createdAt: t.createdAt || t.created_at || new Date().toISOString(),
              comentarios: t.comentarios || [],
              usuario: t.usuario || null,
              organizationId: t.organizationId || t.organization_id || "",
              projectId: t.projectId || t.project_id || "",
            }))
          : [],
      );
    } catch (err) {
      const msg = (err as ApiError).message || "Error al cargar tickets";
      setError(msg);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, filters.estado, filters.prioridad, filters.projectId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refresh: fetchTickets };
}
