import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Ticket } from "./useTickets";

type CommentInput = { contenido: string };

const mapTicket = (t: any): Ticket => ({
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
});

export function useTicket(ticketId?: string) {
  const queryClient = useQueryClient();

  const ticketQuery = useQuery({
    queryKey: ["ticket", ticketId],
    enabled: Boolean(ticketId),
    staleTime: 60 * 1000, // 1 minuto
    queryFn: async (): Promise<Ticket> => {
      const { data } = await apiClient.get(`/tickets/${ticketId}`);
      const raw = data?.data?.ticket ?? data?.data ?? data;
      return mapTicket(raw || {});
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ contenido }: CommentInput) => {
      if (!ticketId) throw new Error("Ticket id requerido");
      const { data } = await apiClient.post(`/tickets/${ticketId}/comment`, { contenido });
      return data;
    },
    onSuccess: () => {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
      }
    },
  });

  return {
    ticket: ticketQuery.data,
    isLoading: ticketQuery.isLoading,
    isError: ticketQuery.isError,
    error: ticketQuery.error ? (ticketQuery.error as Error).message : null,
    refresh: ticketQuery.refetch,
    addComment: commentMutation.mutateAsync,
    isCommenting: commentMutation.isPending,
  };
}
