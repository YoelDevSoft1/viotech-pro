import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useOrg } from "@/lib/hooks/useOrg";

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
  updatedAt?: string;
  comentarios?: any[];
  usuario?: { nombre?: string; email?: string };
  organizationId?: string;
  projectId?: string;
  asignadoA?: string | null;
  attachments?: any[];
};

export type TicketFilters = {
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

type TicketResponse = {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useTickets(filters: TicketFilters = {}) {
  const { orgId } = useOrg();

  // Construimos los parámetros de consulta
  // React Query detectará cambios en este objeto para refrescar la data
  const queryParams = {
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
  };

  const query = useQuery({
    // La clave incluye los filtros: si cambias de página, se refrezca solo.
    queryKey: ["tickets", queryParams],
    
    // No ejecutar si no hay organización (opcional, depende de tu lógica global)
    // enabled: !!orgId, 

    queryFn: async (): Promise<TicketResponse> => {
      const { data } = await apiClient.get("/tickets", { params: queryParams });
      
      const rawTickets = data?.data?.tickets || data?.data || [];
      const rawPagination = data?.data?.pagination || data?.pagination;

      // Mapeo defensivo (Lógica original conservada)
      const mappedTickets = Array.isArray(rawTickets)
        ? rawTickets.map((t: any) => ({
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
            updatedAt: t.updatedAt || t.updated_at || undefined,
            comentarios: t.comentarios || [],
            usuario: t.usuario || null,
            organizationId: t.organizationId || t.organization_id || "",
            projectId: t.projectId || t.project_id || "",
            asignadoA: t.asignadoA || t.asignado_a || null,
            attachments: t.attachments || t.adjuntos || [],
          }))
        : [];

      return {
        tickets: mappedTickets,
        pagination: {
          page: rawPagination?.page || queryParams.page,
          limit: rawPagination?.limit || queryParams.limit,
          total: rawPagination?.total || 0,
          totalPages: rawPagination?.totalPages || 0,
        },
      };
    },
    
    // Configuración de caché
    staleTime: 1000 * 60, // 1 minuto
    retry: 1,
  });

  return {
    tickets: query.data?.tickets || [],
    pagination: query.data?.pagination || { 
      page: filters.page || 1, 
      limit: filters.limit || 20, 
      total: 0, 
      totalPages: 0 
    },
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refresh: query.refetch,
  };
}